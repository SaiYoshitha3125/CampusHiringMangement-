from django.urls import path
from apps.analytics.views import (
    OverviewAnalyticsView,
    DepartmentAnalyticsView,
    FunnelAnalyticsView,
    CompanyAnalyticsView,
    TrendsAnalyticsView,
    ExportPlacementCSVView
)

urlpatterns = [
    path('overview/', OverviewAnalyticsView.as_view(), name='analytics-overview'),
    path('departments/', DepartmentAnalyticsView.as_view(), name='analytics-departments'),
    path('funnel/', FunnelAnalyticsView.as_view(), name='analytics-funnel'),
    path('companies/', CompanyAnalyticsView.as_view(), name='analytics-companies'),
    path('trends/', TrendsAnalyticsView.as_view(), name='analytics-trends'),
    path('export-csv/', ExportPlacementCSVView.as_view(), name='analytics-export-csv'),
]
