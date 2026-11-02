from rest_framework import serializers
from apps.students.models import StudentProfile, Resume
from apps.accounts.serializers import UserSerializer


class ResumeSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = [
            'id', 'file', 'file_url', 'file_name', 'file_size_bytes',
            'extracted_skills', 'is_primary', 'extraction_status',
            'extraction_notes', 'uploaded_at'
        ]
        read_only_fields = [
            'id', 'file_url', 'extracted_skills', 'extraction_status',
            'extraction_notes', 'uploaded_at'
        ]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    resumes = ResumeSerializer(many=True, read_only=True)
    primary_resume = ResumeSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'roll_number', 'college_name', 'department',
            'graduation_year', 'cgpa', 'active_backlogs', 'total_backlogs_history',
            'technical_skills', 'certifications', 'projects', 'experience',
            'bio', 'linkedin_url', 'github_url', 'portfolio_url',
            'is_placement_eligible', 'resumes', 'primary_resume',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    phone = serializers.CharField(source='user.phone', required=False)

    class Meta:
        model = StudentProfile
        fields = [
            'roll_number', 'college_name', 'department', 'graduation_year',
            'cgpa', 'active_backlogs', 'total_backlogs_history',
            'technical_skills', 'certifications', 'projects', 'experience',
            'bio', 'linkedin_url', 'github_url', 'portfolio_url',
            'first_name', 'last_name', 'phone'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            for attr, val in user_data.items():
                setattr(user, attr, val)
            user.save()

        return super().update(instance, validated_data)
