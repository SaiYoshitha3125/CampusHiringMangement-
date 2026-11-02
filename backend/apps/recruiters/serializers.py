from rest_framework import serializers
from apps.recruiters.models import RecruiterProfile
from apps.companies.serializers import CompanySerializer
from apps.accounts.serializers import UserSerializer


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = RecruiterProfile
        fields = [
            'id', 'user', 'company', 'company_id',
            'designation', 'is_company_admin', 'is_verified_by_admin',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_company_admin', 'is_verified_by_admin', 'created_at', 'updated_at']
