from django.urls import path
from apps.recruiters.views import RecruiterProfileView, RecruiterListView

urlpatterns = [
    path('profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),
    path('all/', RecruiterListView.as_view(), name='recruiter-list-admin'),
]
