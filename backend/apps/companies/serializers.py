from rest_framework import serializers
from apps.companies.models import Company


class CompanySerializer(serializers.ModelSerializer):
    active_jobs_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'description', 'website', 'industry', 'location',
            'logo', 'is_verified', 'verified_at', 'created_at', 'active_jobs_count'
        ]
        read_only_fields = ['id', 'is_verified', 'verified_at', 'created_at', 'active_jobs_count']

    def get_active_jobs_count(self, obj):
        return obj.job_postings.filter(status='APPROVED').count()
