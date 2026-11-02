from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from apps.interviews.models import Interview
from apps.interviews.serializers import InterviewSerializer, InterviewCreateSerializer
from apps.accounts.permissions import IsRecruiterOrAdmin
from apps.notifications.utils import send_notification
from apps.notifications.models import Notification


class InterviewViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'mode', 'application__id']
    search_fields = [
        'application__student__user__first_name',
        'application__student__user__last_name',
        'round_name',
        'interviewer_names'
    ]
    ordering_fields = ['scheduled_at', 'created_at']
    ordering = ['scheduled_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Interview.objects.select_related(
            'application__student__user',
            'application__job__company'
        )

        if user.role == 'ADMIN' or user.is_staff:
            return queryset.all()

        if user.role == 'RECRUITER' and hasattr(user, 'recruiter_profile'):
            return queryset.filter(application__job__company=user.recruiter_profile.company)

        if user.role == 'STUDENT' and hasattr(user, 'student_profile'):
            return queryset.filter(application__student=user.student_profile)

        return queryset.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return InterviewCreateSerializer
        return InterviewSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [permissions.IsAuthenticated(), IsRecruiterOrAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsRecruiterOrAdmin])
    def reschedule(self, request, pk=None):
        interview = self.get_object()
        new_time_str = request.data.get('scheduled_at')
        if not new_time_str:
            return Response({'error': 'scheduled_at field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        interview.scheduled_at = new_time_str
        interview.status = Interview.Status.RESCHEDULED
        if 'meeting_link' in request.data:
            interview.meeting_link = request.data['meeting_link']
        if 'venue' in request.data:
            interview.venue = request.data['venue']
        if 'instructions' in request.data:
            interview.instructions = request.data['instructions']
        interview.save()

        # Notify candidate
        send_notification(
            recipient=interview.application.student.user,
            title=f"Interview Rescheduled: {interview.round_name}",
            message=f"Your interview for '{interview.application.job.title}' has been rescheduled to {interview.scheduled_at}.",
            notification_type=Notification.NotificationType.INTERVIEW_SCHEDULED,
            action_url="/student/interviews"
        )

        return Response({
            'message': 'Interview rescheduled successfully.',
            'interview': InterviewSerializer(interview).data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsRecruiterOrAdmin])
    def cancel_interview(self, request, pk=None):
        interview = self.get_object()
        reason = request.data.get('reason', 'Interview cancelled by recruiter.')
        interview.status = Interview.Status.CANCELLED
        interview.feedback = f"Cancelled: {reason}"
        interview.save()

        send_notification(
            recipient=interview.application.student.user,
            title=f"Interview Cancelled: {interview.round_name}",
            message=f"Your interview for '{interview.application.job.title}' on {interview.scheduled_at} has been cancelled. Reason: {reason}",
            notification_type=Notification.NotificationType.INTERVIEW_SCHEDULED,
            action_url="/student/interviews"
        )

        return Response({
            'message': 'Interview cancelled.',
            'interview': InterviewSerializer(interview).data
        })

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Returns interviews scheduled in the future for current user."""
        qs = self.get_queryset().filter(
            scheduled_at__gt=timezone.now(),
            status__in=[Interview.Status.SCHEDULED, Interview.Status.RESCHEDULED]
        ).order_by('scheduled_at')
        serializer = InterviewSerializer(qs, many=True)
        return Response(serializer.data)
