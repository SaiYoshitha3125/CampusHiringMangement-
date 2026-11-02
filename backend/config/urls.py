"""
CampusHire Master URL Configuration.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'name': 'CampusHire API',
        'version': '1.0.0',
        'status': 'operational',
        'docs': request.build_absolute_uri('/api/docs/'),
        'endpoints': {
            'auth': request.build_absolute_uri('/api/auth/'),
            'students': request.build_absolute_uri('/api/students/'),
            'recruiters': request.build_absolute_uri('/api/recruiters/'),
            'companies': request.build_absolute_uri('/api/companies/'),
            'jobs': request.build_absolute_uri('/api/jobs/'),
            'applications': request.build_absolute_uri('/api/applications/'),
            'interviews': request.build_absolute_uri('/api/interviews/'),
            'notifications': request.build_absolute_uri('/api/notifications/'),
            'analytics': request.build_absolute_uri('/api/analytics/'),
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),

    # Root API index
    path('api/', api_root, name='api-root'),

    # Modular API routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/recruiters/', include('apps.recruiters.urls')),
    path('api/companies/', include('apps.companies.urls')),
    path('api/jobs/', include('apps.jobs.urls')),
    path('api/applications/', include('apps.applications.urls')),
    path('api/interviews/', include('apps.interviews.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/analytics/', include('apps.analytics.urls')),

    # OpenAPI schema & Swagger documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
