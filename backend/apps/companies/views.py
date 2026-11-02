from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.companies.models import Company
from apps.companies.serializers import CompanySerializer
from apps.accounts.permissions import IsPlacementAdmin, IsRecruiterOrAdmin
from apps.notifications.utils import send_notification
from apps.notifications.models import Notification


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all().order_by('name')
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['verify', 'reject']:
            return [IsPlacementAdmin()]
        return [IsRecruiterOrAdmin()]

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def my_company(self, request):
        if not hasattr(request.user, 'recruiter_profile'):
            return Response({'error': 'Only recruiters are affiliated with a company.'}, status=status.HTTP_403_FORBIDDEN)

        company = request.user.recruiter_profile.company
        if request.method == 'GET':
            return Response(self.get_serializer(company).data)

        serializer = self.get_serializer(company, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsPlacementAdmin])
    def verify(self, request, pk=None):
        company = self.get_object()
        company.verify()

        # Also verify affiliated recruiters
        for rec in company.recruiters.all():
            rec.is_verified_by_admin = True
            rec.save(update_fields=['is_verified_by_admin'])
            rec.user.is_verified = True
            rec.user.save(update_fields=['is_verified'])

            # Send in-app notification
            send_notification(
                recipient=rec.user,
                title="Company Account Verified",
                message=f"Congratulations! {company.name} and your recruiter profile have been verified by the placement administration.",
                notification_type=Notification.NotificationType.RECRUITER_VERIFIED
            )

        return Response({
            'message': f"Company '{company.name}' and affiliated recruiters successfully verified.",
            'company': self.get_serializer(company).data
        })
