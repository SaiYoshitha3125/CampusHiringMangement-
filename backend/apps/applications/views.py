from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.applications.models import JobApplication
from apps.applications.serializers import (
    JobApplicationSerializer,
    JobApplicationCreateSerializer,
    ApplicationStatusUpdateSerializer
)
from apps.accounts.permissions import IsStudent, IsRecruiterOrAdmin


class JobApplicationViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'job__id', 'student__department']
    search_fields = [
        'student__user__first_name', 'student__user__last_name',
        'student__roll_number', 'job__title'
    ]
    ordering_fields = ['applied_at', 'skill_match_score', 'updated_at']
    ordering = ['-applied_at']

    def get_queryset(self):
        user = self.request.user
        queryset = JobApplication.objects.select_related(
            'student__user', 'job__company', 'job__recruiter', 'resume'
        ).prefetch_related('status_history', 'interviews')

        if user.role == 'ADMIN' or user.is_staff:
            return queryset.all()

        if user.role == 'RECRUITER':
            if hasattr(user, 'recruiter_profile'):
                return queryset.filter(job__company=user.recruiter_profile.company) | queryset.filter(job__recruiter=user)
            return queryset.filter(job__recruiter=user)

        if user.role == 'STUDENT' and hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)

        return queryset.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return JobApplicationCreateSerializer
        elif self.action in ['update_status', 'shortlist', 'accept_candidate', 'reject_candidate']:
            return ApplicationStatusUpdateSerializer
        return JobApplicationSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsStudent()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['patch', 'put'], permission_classes=[permissions.IsAuthenticated, IsRecruiterOrAdmin])
    def update_status(self, request, pk=None):
        application = self.get_object()
        serializer = ApplicationStatusUpdateSerializer(
            application,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(JobApplicationSerializer(application, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsRecruiterOrAdmin])
    def accept_candidate(self, request, pk=None):
        application = self.get_object()
        remarks = request.data.get('remarks', 'Candidate application accepted for campus placement.')
        application.transition_status(
            JobApplication.Status.SELECTED,
            changed_by=request.user,
            remarks=remarks
        )
        return Response({
            'message': f"Candidate {application.student.user.full_name} accepted successfully.",
            'application': JobApplicationSerializer(application, context={'request': request}).data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsRecruiterOrAdmin])
    def shortlist(self, request, pk=None):
        application = self.get_object()
        remarks = request.data.get('remarks', 'Profile shortlisted for interview round.')
        application.transition_status(
            JobApplication.Status.SHORTLISTED,
            changed_by=request.user,
            remarks=remarks
        )
        return Response({
            'message': f"Candidate {application.student.user.full_name} has been shortlisted.",
            'application': JobApplicationSerializer(application, context={'request': request}).data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsRecruiterOrAdmin])
    def reject_candidate(self, request, pk=None):
        application = self.get_object()
        remarks = request.data.get('remarks', 'Application status updated to rejected.')
        application.transition_status(
            JobApplication.Status.REJECTED,
            changed_by=request.user,
            remarks=remarks
        )
        return Response({
            'message': f"Candidate {application.student.user.full_name} rejected.",
            'application': JobApplicationSerializer(application, context={'request': request}).data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsStudent])
    def withdraw(self, request, pk=None):
        application = self.get_object()
        if application.student.user != request.user:
            return Response({'error': 'You can only withdraw your own applications.'}, status=status.HTTP_403_FORBIDDEN)

        if application.status in [JobApplication.Status.SELECTED, JobApplication.Status.WITHDRAWN]:
            return Response(
                {'error': f"Cannot withdraw an application that is already {application.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.transition_status(
            JobApplication.Status.WITHDRAWN,
            changed_by=request.user,
            remarks='Application withdrawn by candidate.'
        )

        return Response({
            'message': 'Your application has been successfully withdrawn.',
            'application': JobApplicationSerializer(application, context={'request': request}).data
        })
