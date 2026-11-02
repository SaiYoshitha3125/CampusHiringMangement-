from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.accounts.models import User
from apps.students.models import StudentProfile
from apps.recruiters.models import RecruiterProfile
from apps.companies.models import Company
import uuid


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'is_verified', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'is_verified', 'is_active', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=[('STUDENT', 'Student'), ('RECRUITER', 'Recruiter')])

    # Extra fields for student
    roll_number = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    graduation_year = serializers.IntegerField(required=False, default=2026)
    cgpa = serializers.DecimalField(max_digits=4, decimal_places=2, required=False, default=7.0)

    # Extra fields for recruiter
    company_name = serializers.CharField(required=False, allow_blank=True)
    company_industry = serializers.CharField(required=False, allow_blank=True, default='Technology')
    designation = serializers.CharField(required=False, allow_blank=True, default='Talent Acquisition Lead')

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'role', 'phone',
            'roll_number', 'department', 'graduation_year', 'cgpa',
            'company_name', 'company_industry', 'designation'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        # Security check: Never allow registering with ADMIN role
        if attrs.get('role') == User.Role.ADMIN:
            raise serializers.ValidationError({"role": "Administrator accounts cannot be registered publicly."})

        if attrs.get('role') == User.Role.STUDENT:
            if not attrs.get('department'):
                raise serializers.ValidationError({"department": "Department is required for student registration."})

        if attrs.get('role') == User.Role.RECRUITER:
            if not attrs.get('company_name'):
                raise serializers.ValidationError({"company_name": "Company name is required for recruiter registration."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        role = validated_data.get('role')

        # Student specific pop
        roll_number = validated_data.pop('roll_number', None)
        department = validated_data.pop('department', 'Computer Science')
        graduation_year = validated_data.pop('graduation_year', 2026)
        cgpa = validated_data.pop('cgpa', 7.50)

        # Recruiter specific pop
        company_name = validated_data.pop('company_name', None)
        company_industry = validated_data.pop('company_industry', 'Technology')
        designation = validated_data.pop('designation', 'Talent Acquisition')

        user = User.objects.create_user(password=password, **validated_data)

        if role == User.Role.STUDENT:
            if not roll_number:
                roll_number = f"CH-{user.id:04d}-{uuid.uuid4().hex[:4].upper()}"
            StudentProfile.objects.create(
                user=user,
                roll_number=roll_number,
                department=department,
                graduation_year=graduation_year,
                cgpa=cgpa,
                technical_skills=[]
            )
            user.is_verified = True  # Students are active
            user.save(update_fields=['is_verified'])

        elif role == User.Role.RECRUITER:
            company, _ = Company.objects.get_or_create(
                name=company_name,
                defaults={'industry': company_industry}
            )
            RecruiterProfile.objects.create(
                user=user,
                company=company,
                designation=designation,
                is_company_admin=True,
                is_verified_by_admin=False
            )
            user.is_verified = False  # Recruiters require admin verification
            user.save(update_fields=['is_verified'])

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name
        token['is_verified'] = user.is_verified
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.full_name,
            'role': user.role,
            'phone': user.phone,
            'is_verified': user.is_verified,
        }

        # Include role-specific profile ID & info
        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            data['user']['student_profile_id'] = user.student_profile.id
            data['user']['department'] = user.student_profile.department
            data['user']['cgpa'] = str(user.student_profile.cgpa)
        elif user.role == User.Role.RECRUITER and hasattr(user, 'recruiter_profile'):
            rec = user.recruiter_profile
            data['user']['recruiter_profile_id'] = rec.id
            data['user']['company_id'] = rec.company.id
            data['user']['company_name'] = rec.company.name
            data['user']['is_verified_by_admin'] = rec.is_verified_by_admin

        return data
