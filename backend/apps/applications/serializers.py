from rest_framework import serializers
from django.db import transaction
from apps.applications.models import JobApplication, ApplicationStatusHistory
from apps.students.serializers import StudentProfileSerializer, ResumeSerializer
from apps.jobs.serializers import JobPostingSerializer
from apps.jobs.models import JobPosting
from apps.jobs.eligibility import check_student_eligibility
from apps.students.models import Resume
from apps.students.skill_engine import calculate_skill_match
from apps.notifications.utils import send_notification
from apps.notifications.models import Notification


class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)

    class Meta:
        model = ApplicationStatusHistory
        fields = ['id', 'from_status', 'to_status', 'changed_by_name', 'remarks', 'timestamp']


class JobApplicationSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    job = JobPostingSerializer(read_only=True)
    resume = ResumeSerializer(read_only=True)
    status_history = ApplicationStatusHistorySerializer(many=True, read_only=True)
    interviews = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            'id', 'student', 'job', 'resume', 'status',
            'skill_match_score', 'skill_match_details', 'recruiter_notes',
            'applied_at', 'updated_at', 'status_history', 'interviews'
        ]

    def get_interviews(self, obj):
        from apps.interviews.serializers import InterviewSerializer
        return InterviewSerializer(obj.interviews.all(), many=True).data


class JobApplicationCreateSerializer(serializers.ModelSerializer):
    job_id = serializers.IntegerField(write_only=True)
    resume_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = JobApplication
        fields = ['job_id', 'resume_id']

    def validate(self, attrs):
        user = self.context['request'].user
        if not hasattr(user, 'student_profile'):
            raise serializers.ValidationError({"error": "Only students can apply for jobs."})

        student = user.student_profile
        job_id = attrs['job_id']

        try:
            job = JobPosting.objects.select_related('eligibility_criteria', 'company').get(pk=job_id)
        except JobPosting.DoesNotExist:
            raise serializers.ValidationError({"job_id": "Job posting does not exist."})

        # Check duplicate
        if JobApplication.objects.filter(student=student, job=job).exists():
            raise serializers.ValidationError({"job_id": "You have already applied for this job posting."})

        # ENFORCE BACKEND ELIGIBILITY SCREENING
        eligibility_result = check_student_eligibility(student, job)
        if not eligibility_result['is_eligible']:
            reasons_str = "; ".join(eligibility_result['failure_reasons'])
            raise serializers.ValidationError({
                "eligibility_failed": True,
                "reasons": eligibility_result['failure_reasons'],
                "detail": f"You do not meet the eligibility requirements: {reasons_str}"
            })

        attrs['job'] = job
        attrs['student'] = student
        attrs['skill_match'] = eligibility_result['skill_match']

        # Resolve resume
        resume_id = attrs.get('resume_id')
        if resume_id:
            try:
                attrs['resume'] = Resume.objects.get(pk=resume_id, student=student)
            except Resume.DoesNotExist:
                attrs['resume'] = student.primary_resume
        else:
            attrs['resume'] = student.primary_resume

        return attrs

    def create(self, validated_data):
        job = validated_data['job']
        student = validated_data['student']
        resume = validated_data.get('resume')
        skill_match = validated_data.get('skill_match', {})

        match_score = skill_match.get('match_percentage')

        with transaction.atomic():
            application = JobApplication.objects.create(
                student=student,
                job=job,
                resume=resume,
                status=JobApplication.Status.APPLIED,
                skill_match_score=match_score,
                skill_match_details=skill_match
            )

            # Record initial history
            ApplicationStatusHistory.objects.create(
                application=application,
                from_status='',
                to_status=JobApplication.Status.APPLIED,
                changed_by=student.user,
                remarks='Application submitted by student.'
            )

            # Send confirmation notification to student
            send_notification(
                recipient=student.user,
                title="Application Submitted",
                message=f"Your application for '{job.title}' at {job.company.name} has been received.",
                notification_type=Notification.NotificationType.APPLICATION_STATUS,
                action_url=f"/student/applications"
            )

            # Notify recruiter
            send_notification(
                recipient=job.recruiter,
                title="New Applicant",
                message=f"{student.user.full_name} applied for '{job.title}'. Skill match: {match_score or 'N/A'}%.",
                notification_type=Notification.NotificationType.APPLICATION_STATUS,
                action_url=f"/recruiter/applicants"
            )

            return application


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    remarks = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = JobApplication
        fields = ['status', 'recruiter_notes', 'remarks']

    def update(self, instance, validated_data):
        new_status = validated_data.get('status', instance.status)
        remarks = validated_data.get('remarks', '')
        user = self.context['request'].user

        if 'recruiter_notes' in validated_data:
            instance.recruiter_notes = validated_data['recruiter_notes']
            instance.save(update_fields=['recruiter_notes'])

        if new_status != instance.status:
            instance.transition_status(new_status, changed_by=user, remarks=remarks)

            # Notify student
            send_notification(
                recipient=instance.student.user,
                title="Application Status Updated",
                message=f"Your application for '{instance.job.title}' has been updated to: {instance.get_status_display()}.",
                notification_type=Notification.NotificationType.APPLICATION_STATUS,
                action_url=f"/student/applications"
            )

        return instance
