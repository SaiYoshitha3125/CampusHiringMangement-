import os
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from apps.students.models import StudentProfile, Resume
from apps.students.serializers import (
    StudentProfileSerializer,
    StudentProfileUpdateSerializer,
    ResumeSerializer
)
from apps.accounts.permissions import IsStudent, IsPlacementAdmin, IsRecruiterOrAdmin


class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_object(self):
        return self.request.user.student_profile

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StudentProfileUpdateSerializer
        return StudentProfileSerializer


class ResumeUploadView(views.APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file was uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file extension
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext != '.pdf':
            return Response(
                {'error': 'Invalid file type. Only PDF documents are permitted.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size (10 MB)
        max_bytes = getattr(settings, 'MAX_RESUME_SIZE_MB', 10) * 1024 * 1024
        if file_obj.size > max_bytes:
            return Response(
                {'error': f'File size exceeds {settings.MAX_RESUME_SIZE_MB}MB limit.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        student_profile = request.user.student_profile

        # Reset older primary flags
        Resume.objects.filter(student=student_profile).update(is_primary=False)

        resume = Resume.objects.create(
            student=student_profile,
            file=file_obj,
            file_name=file_obj.name,
            file_size_bytes=file_obj.size,
            is_primary=True
        )

        # Trigger automatic extraction
        resume.process_and_extract()

        return Response({
            'message': 'Resume uploaded and parsed successfully.',
            'resume': ResumeSerializer(resume, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)


class ResumeListView(generics.ListAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_queryset(self):
        return Resume.objects.filter(student=self.request.user.student_profile)


class ResumeDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            resume = Resume.objects.select_related('student__user').get(pk=pk)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Authorization: Student owns it, or Admin, or Recruiter whose job this student applied to
        user = request.user
        authorized = False

        if user.role == 'ADMIN' or user.is_staff:
            authorized = True
        elif user.role == 'STUDENT' and resume.student.user == user:
            authorized = True
        elif user.role == 'RECRUITER' and hasattr(user, 'recruiter_profile'):
            # Recruiter has a job that this student applied to
            from apps.applications.models import JobApplication
            recruiter_company = user.recruiter_profile.company
            has_application = JobApplication.objects.filter(
                student=resume.student,
                job__company=recruiter_company
            ).exists()
            if has_application:
                authorized = True

        if not authorized:
            return Response(
                {'error': 'You do not have permission to view this resume.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(ResumeSerializer(resume, context={'request': request}).data)

    def delete(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk, student__user=request.user)
            resume.delete()
            return Response({'message': 'Resume deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)


class StudentAdminListView(generics.ListAPIView):
    """Admin view to view and filter all students."""
    queryset = StudentProfile.objects.all().select_related('user').prefetch_related('resumes').order_by('-created_at')
    serializer_class = StudentProfileSerializer
    permission_classes = [IsPlacementAdmin]
    filterset_fields = ['department', 'graduation_year', 'is_placement_eligible']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'roll_number']


class StudentToggleEligibilityView(views.APIView):
    """Admin endpoint to toggle student placement eligibility."""
    permission_classes = [IsPlacementAdmin]

    def patch(self, request, pk):
        try:
            student = StudentProfile.objects.get(pk=pk)
            student.is_placement_eligible = not student.is_placement_eligible
            student.save(update_fields=['is_placement_eligible'])
            return Response({
                'message': f"Student placement eligibility set to {student.is_placement_eligible}.",
                'is_placement_eligible': student.is_placement_eligible
            })
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)
