from rest_framework import generics, permissions, status
from rest_framework.response import Response
from apps.recruiters.models import RecruiterProfile
from apps.recruiters.serializers import RecruiterProfileSerializer
from apps.accounts.permissions import IsRecruiter, IsPlacementAdmin


class RecruiterProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = RecruiterProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_object(self):
        return self.request.user.recruiter_profile


class RecruiterListView(generics.ListAPIView):
    """Placement Admin view to view all recruiters and their verification status."""
    queryset = RecruiterProfile.objects.all().select_related('user', 'company').order_by('-created_at')
    serializer_class = RecruiterProfileSerializer
    permission_classes = [IsPlacementAdmin]
