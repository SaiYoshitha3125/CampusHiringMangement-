from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.jobs.views import JobPostingViewSet, RecruitmentCycleViewSet

router = DefaultRouter()
router.register(r'cycles', RecruitmentCycleViewSet, basename='cycle')
router.register(r'', JobPostingViewSet, basename='job')

urlpatterns = [
    path('', include(router.urls)),
]
