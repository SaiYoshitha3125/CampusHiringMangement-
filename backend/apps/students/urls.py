from django.urls import path
from apps.students.views import (
    StudentProfileView,
    ResumeUploadView,
    ResumeListView,
    ResumeDetailView,
    StudentAdminListView,
    StudentToggleEligibilityView
)

urlpatterns = [
    path('profile/', StudentProfileView.as_view(), name='student-profile'),
    path('resume/upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('resumes/', ResumeListView.as_view(), name='resume-list'),
    path('resumes/<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
    path('admin/all/', StudentAdminListView.as_view(), name='student-admin-list'),
    path('admin/<int:pk>/toggle-eligibility/', StudentToggleEligibilityView.as_view(), name='student-toggle-eligibility'),
]
