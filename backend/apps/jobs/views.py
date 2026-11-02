from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.jobs.models import JobPosting, RecruitmentCycle
from apps.jobs.serializers import (
    JobPostingSerializer,
    JobCreateUpdateSerializer,
    RecruitmentCycleSerializer
)
from apps.jobs.eligibility import check_student_eligibility
from apps.students.skill_engine import calculate_skill_match
from apps.accounts.permissions import IsRecruiter, IsPlacementAdmin, IsRecruiterOrAdmin
from apps.notifications.utils import send_notification
from apps.notifications.models import Notification


class JobPostingViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job_type', 'work_mode', 'status', 'company__id']
    search_fields = ['title', 'description', 'company__name', 'location', 'required_skills']
    ordering_fields = ['created_at', 'application_deadline', 'salary_max']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = JobPosting.objects.select_related('company', 'recruiter', 'eligibility_criteria', 'recruitment_cycle')

        # Recruiter management view endpoint gets handled via my_jobs or all recruiter jobs
        if self.action in ['my_jobs']:
            if user.is_authenticated and hasattr(user, 'recruiter_profile'):
                return queryset.filter(company=user.recruiter_profile.company)
            if user.is_authenticated and (user.role == 'ADMIN' or user.is_staff):
                return queryset.all()
            return queryset.none()

        if user.is_authenticated and (user.role == 'ADMIN' or user.is_staff):
            return queryset.all()

        # By default for students and public, only return approved jobs
        # If recruiter is viewing job details, allow them to view their company's draft/pending jobs
        if user.is_authenticated and hasattr(user, 'recruiter_profile'):
            return queryset.filter(company=user.recruiter_profile.company) | queryset.filter(status=JobPosting.Status.APPROVED)

        return queryset.filter(status=JobPosting.Status.APPROVED)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return JobCreateUpdateSerializer
        return JobPostingSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'eligibility_check', 'skill_match']:
            return [permissions.AllowAny()]
        if self.action in ['create', 'my_jobs']:
            return [permissions.IsAuthenticated(), IsRecruiterOrAdmin()]
        if self.action in ['approve', 'reject']:
            return [permissions.IsAuthenticated(), IsPlacementAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsRecruiterOrAdmin])
    def my_jobs(self, request):
        if hasattr(request.user, 'recruiter_profile'):
            jobs = JobPosting.objects.filter(company=request.user.recruiter_profile.company).order_by('-created_at')
        elif request.user.role == 'ADMIN' or request.user.is_staff:
            jobs = JobPosting.objects.all().order_by('-created_at')
        else:
            jobs = JobPosting.objects.none()
        serializer = JobPostingSerializer(jobs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def eligibility_check(self, request, pk=None):
        job = self.get_object()
        if not hasattr(request.user, 'student_profile'):
            return Response({'error': 'Eligibility check is only applicable for student accounts.'}, status=status.HTTP_400_BAD_REQUEST)

        student = request.user.student_profile
        result = check_student_eligibility(student, job)
        return Response(result)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def skill_match(self, request, pk=None):
        job = self.get_object()
        if not hasattr(request.user, 'student_profile'):
            return Response({'error': 'Skill match is only applicable for student accounts.'}, status=status.HTTP_400_BAD_REQUEST)

        student = request.user.student_profile
        primary_resume = student.primary_resume
        resume_skills = primary_resume.extracted_skills if primary_resume else []

        match_data = calculate_skill_match(
            student_profile_skills=student.technical_skills,
            resume_extracted_skills=resume_skills,
            job_required_skills=job.required_skills,
            job_nice_to_have_skills=job.nice_to_have_skills
        )
        return Response(match_data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsPlacementAdmin])
    def approve(self, request, pk=None):
        job = self.get_object()
        job.status = JobPosting.Status.APPROVED
        job.rejection_reason = ''
        job.save(update_fields=['status', 'rejection_reason'])

        # Notify the recruiter
        send_notification(
            recipient=job.recruiter,
            title="Job Posting Approved & Published",
            message=f"Your job posting for '{job.title}' has been approved by the placement cell and is now live to students.",
            notification_type=Notification.NotificationType.JOB_APPROVED,
            action_url=f"/recruiter/jobs"
        )

        return Response({
            'message': f"Job '{job.title}' approved and published successfully.",
            'job': JobPostingSerializer(job, context={'request': request}).data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsPlacementAdmin])
    def reject(self, request, pk=None):
        job = self.get_object()
        reason = request.data.get('reason', 'Eligibility or description did not meet campus placement guidelines.')
        job.status = JobPosting.Status.REJECTED
        job.rejection_reason = reason
        job.save(update_fields=['status', 'rejection_reason'])

        send_notification(
            recipient=job.recruiter,
            title="Job Posting Rejected",
            message=f"Your job posting '{job.title}' was rejected by the placement cell. Reason: {reason}",
            notification_type=Notification.NotificationType.JOB_APPROVED,
            action_url=f"/recruiter/jobs"
        )

        return Response({
            'message': f"Job '{job.title}' rejected.",
            'job': JobPostingSerializer(job, context={'request': request}).data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def close(self, request, pk=None):
        job = self.get_object()
        if request.user != job.recruiter and request.user.role != 'ADMIN':
            return Response({'error': 'You do not have permission to close this job.'}, status=status.HTTP_403_FORBIDDEN)

        job.status = JobPosting.Status.CLOSED
        job.save(update_fields=['status'])
        return Response({'message': f"Job '{job.title}' has been closed."})


class RecruitmentCycleViewSet(viewsets.ModelViewSet):
    queryset = RecruitmentCycle.objects.all().order_by('-start_date')
    serializer_class = RecruitmentCycleSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsPlacementAdmin()]
