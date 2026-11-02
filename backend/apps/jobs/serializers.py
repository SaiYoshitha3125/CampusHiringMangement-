from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from apps.jobs.models import JobPosting, JobEligibilityCriteria, RecruitmentCycle
from apps.companies.serializers import CompanySerializer
from apps.accounts.serializers import UserSerializer


class JobEligibilityCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobEligibilityCriteria
        fields = [
            'id', 'min_cgpa', 'eligible_departments', 'eligible_graduation_years',
            'max_active_backlogs', 'max_total_backlogs_history',
            'required_skills_mandatory', 'min_skill_match_percentage'
        ]


class RecruitmentCycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruitmentCycle
        fields = '__all__'


class JobPostingSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    recruiter = UserSerializer(read_only=True)
    eligibility_criteria = JobEligibilityCriteriaSerializer(read_only=True)
    recruitment_cycle = RecruitmentCycleSerializer(read_only=True)
    applications_count = serializers.SerializerMethodField()
    is_expired = serializers.ReadOnlyField()
    is_open = serializers.ReadOnlyField()
    has_applied = serializers.SerializerMethodField()
    my_application_status = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'company', 'recruiter', 'recruitment_cycle',
            'job_type', 'description', 'responsibilities', 'location',
            'work_mode', 'salary_min', 'salary_max', 'salary_currency',
            'salary_display', 'required_skills', 'nice_to_have_skills',
            'application_deadline', 'status', 'rejection_reason',
            'eligibility_criteria', 'applications_count', 'is_expired',
            'is_open', 'has_applied', 'my_application_status',
            'created_at', 'updated_at'
        ]

    def get_applications_count(self, obj):
        return obj.applications.count()

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(request.user, 'student_profile'):
            return obj.applications.filter(student=request.user.student_profile).exists()
        return False

    def get_my_application_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(request.user, 'student_profile'):
            app = obj.applications.filter(student=request.user.student_profile).first()
            if app:
                return app.status
        return None


class JobCreateUpdateSerializer(serializers.ModelSerializer):
    eligibility = JobEligibilityCriteriaSerializer(required=False)
    recruitment_cycle_id = serializers.IntegerField(required=False, allow_null=True)
    company_id = serializers.IntegerField(required=False, allow_null=True)
    company_name = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'company_id', 'company_name', 'recruitment_cycle_id', 'job_type',
            'description', 'responsibilities', 'location', 'work_mode',
            'salary_min', 'salary_max', 'salary_currency', 'salary_display',
            'required_skills', 'nice_to_have_skills', 'application_deadline',
            'status', 'eligibility'
        ]
        read_only_fields = ['id', 'status']

    def validate_application_deadline(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Application deadline must be a future date and time.")
        return value

    def create(self, validated_data):
        eligibility_data = validated_data.pop('eligibility', {})
        company_id = validated_data.pop('company_id', None)
        company_name = validated_data.pop('company_name', None)
        user = self.context['request'].user

        if user.role == 'RECRUITER' and hasattr(user, 'recruiter_profile'):
            recruiter = user
            company = user.recruiter_profile.company
            initial_status = JobPosting.Status.PENDING_APPROVAL
        elif user.role == 'ADMIN' or user.is_staff or user.is_superuser:
            from apps.recruiters.models import Company
            recruiter = user
            if company_id:
                try:
                    company = Company.objects.get(pk=company_id)
                except Company.DoesNotExist:
                    company = Company.objects.first()
            elif company_name and company_name.strip():
                company, _ = Company.objects.get_or_create(
                    name=company_name.strip(),
                    defaults={
                        'industry': 'Technology & Recruitment',
                        'location': validated_data.get('location', 'University Campus'),
                        'website': 'https://campushire.edu',
                        'is_verified': True
                    }
                )
            else:
                company = Company.objects.first()
                if not company:
                    company = Company.objects.create(
                        name="Campus Placement Cell",
                        industry="Higher Education & Placement",
                        location="University Main Campus",
                        website="https://campushire.edu",
                        is_verified=True
                    )
            # Admin-posted jobs are immediately approved and published to all students
            initial_status = JobPosting.Status.APPROVED
        else:
            raise serializers.ValidationError({"error": "Unauthorized to post jobs."})

        with transaction.atomic():
            job = JobPosting.objects.create(
                recruiter=recruiter,
                company=company,
                status=initial_status,
                **validated_data
            )

            # Create eligibility criteria
            JobEligibilityCriteria.objects.create(job=job, **eligibility_data)

            return job

    def update(self, instance, validated_data):
        eligibility_data = validated_data.pop('eligibility', None)

        with transaction.atomic():
            for attr, val in validated_data.items():
                setattr(instance, attr, val)
            instance.save()

            if eligibility_data is not None:
                criteria, _ = JobEligibilityCriteria.objects.get_or_create(job=instance)
                for attr, val in eligibility_data.items():
                    setattr(criteria, attr, val)
                criteria.save()

            return instance
