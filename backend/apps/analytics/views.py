import csv
from datetime import timedelta
from django.http import HttpResponse
from django.db.models import Count, Avg, Max, Q, F
from django.utils import timezone
from rest_framework import views, permissions, status
from rest_framework.response import Response
from apps.accounts.models import User
from apps.students.models import StudentProfile
from apps.companies.models import Company
from apps.jobs.models import JobPosting
from apps.applications.models import JobApplication
from apps.interviews.models import Interview
from apps.accounts.permissions import IsPlacementAdmin, IsRecruiterOrAdmin


class OverviewAnalyticsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # Base filter if recruiter vs admin/student
        total_students = StudentProfile.objects.count()
        eligible_students = StudentProfile.objects.filter(is_placement_eligible=True).count()
        total_companies = Company.objects.count()
        verified_companies = Company.objects.filter(is_verified=True).count()

        active_jobs = JobPosting.objects.filter(
            status=JobPosting.Status.APPROVED,
            application_deadline__gt=timezone.now()
        ).count()

        total_applications = JobApplication.objects.count()

        # Placed: Unique students with SELECTED status
        placed_students_count = JobApplication.objects.filter(
            status=JobApplication.Status.SELECTED
        ).values('student').distinct().count()

        placement_percentage = 0.0
        if eligible_students > 0:
            placement_percentage = round((placed_students_count / eligible_students) * 100.0, 1)

        # Salary statistics
        selected_jobs = JobPosting.objects.filter(
            applications__status=JobApplication.Status.SELECTED
        ).distinct()

        if selected_jobs.exists():
            avg_pkg = selected_jobs.aggregate(avg=Avg('salary_max'))['avg'] or 0.0
            highest_pkg = selected_jobs.aggregate(max=Max('salary_max'))['max'] or 0.0
        else:
            # Fall back to general active jobs
            all_approved = JobPosting.objects.filter(status=JobPosting.Status.APPROVED)
            avg_pkg = all_approved.aggregate(avg=Avg('salary_max'))['avg'] or 0.0
            highest_pkg = all_approved.aggregate(max=Max('salary_max'))['max'] or 0.0

        total_interviews = Interview.objects.count()

        # If user is recruiter, calculate recruiter specific stats
        recruiter_stats = {}
        if user.role == 'RECRUITER' and hasattr(user, 'recruiter_profile'):
            rec_comp = user.recruiter_profile.company
            recruiter_stats = {
                'my_jobs_count': JobPosting.objects.filter(company=rec_comp).count(),
                'my_active_jobs': JobPosting.objects.filter(company=rec_comp, status=JobPosting.Status.APPROVED).count(),
                'my_total_applicants': JobApplication.objects.filter(job__company=rec_comp).count(),
                'my_shortlisted': JobApplication.objects.filter(job__company=rec_comp, status=JobApplication.Status.SHORTLISTED).count(),
                'my_selected': JobApplication.objects.filter(job__company=rec_comp, status=JobApplication.Status.SELECTED).count(),
                'my_scheduled_interviews': Interview.objects.filter(application__job__company=rec_comp, status='SCHEDULED').count(),
            }

        return Response({
            'total_students': total_students,
            'eligible_students': eligible_students,
            'total_companies': total_companies,
            'verified_companies': verified_companies,
            'active_jobs': active_jobs,
            'total_applications': total_applications,
            'placed_students_count': placed_students_count,
            'placement_percentage': placement_percentage,
            'average_package': float(avg_pkg or 0),
            'highest_package': float(highest_pkg or 0),
            'total_interviews': total_interviews,
            'recruiter_stats': recruiter_stats
        })


class DepartmentAnalyticsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        departments = StudentProfile.objects.values('department').annotate(
            total_students=Count('id'),
            avg_cgpa=Avg('cgpa')
        ).order_by('-total_students')

        result = []
        for d in departments:
            dept_name = d['department']
            placed_count = JobApplication.objects.filter(
                student__department=dept_name,
                status=JobApplication.Status.SELECTED
            ).values('student').distinct().count()

            total = d['total_students']
            rate = round((placed_count / total * 100.0), 1) if total > 0 else 0.0

            result.append({
                'department': dept_name,
                'total_students': total,
                'placed_students': placed_count,
                'unplaced_students': total - placed_count,
                'placement_rate': rate,
                'avg_cgpa': round(float(d['avg_cgpa'] or 0.0), 2)
            })

        return Response(result)


class FunnelAnalyticsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = JobApplication.objects.all()

        if user.role == 'RECRUITER' and hasattr(user, 'recruiter_profile'):
            qs = qs.filter(job__company=user.recruiter_profile.company)

        applied = qs.count()
        under_review = qs.filter(status__in=[
            JobApplication.Status.UNDER_REVIEW,
            JobApplication.Status.SHORTLISTED,
            JobApplication.Status.INTERVIEW_SCHEDULED,
            JobApplication.Status.SELECTED
        ]).count()
        shortlisted = qs.filter(status__in=[
            JobApplication.Status.SHORTLISTED,
            JobApplication.Status.INTERVIEW_SCHEDULED,
            JobApplication.Status.SELECTED
        ]).count()
        interviewed = qs.filter(status__in=[
            JobApplication.Status.INTERVIEW_SCHEDULED,
            JobApplication.Status.SELECTED
        ]).count()
        selected = qs.filter(status=JobApplication.Status.SELECTED).count()
        rejected = qs.filter(status=JobApplication.Status.REJECTED).count()

        funnel_data = [
            {'stage': 'Applied', 'count': applied, 'color': '#3b82f6'},
            {'stage': 'Under Review', 'count': under_review, 'color': '#6366f1'},
            {'stage': 'Shortlisted', 'count': shortlisted, 'color': '#8b5cf6'},
            {'stage': 'Interviewed', 'count': interviewed, 'color': '#ec4899'},
            {'stage': 'Selected', 'count': selected, 'color': '#10b981'},
            {'stage': 'Rejected', 'count': rejected, 'color': '#ef4444'},
        ]
        return Response(funnel_data)


class CompanyAnalyticsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        companies = Company.objects.annotate(
            total_jobs=Count('job_postings', distinct=True),
            total_applications=Count('job_postings__applications', distinct=True)
        ).order_by('-total_applications')[:10]

        data = []
        for c in companies:
            hires_count = JobApplication.objects.filter(
                job__company=c,
                status=JobApplication.Status.SELECTED
            ).values('student').distinct().count()

            data.append({
                'company_id': c.id,
                'company_name': c.name,
                'industry': c.industry,
                'is_verified': c.is_verified,
                'total_jobs': c.total_jobs,
                'total_applications': c.total_applications,
                'total_hires': hires_count
            })

        return Response(data)


class TrendsAnalyticsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        data = []

        # Last 6 months trend
        for i in range(5, -1, -1):
            month_date = now - timedelta(days=i * 30)
            month_label = month_date.strftime('%b %Y')
            start = month_date.replace(day=1, hour=0, minute=0, second=0)
            # Rough 30-day window
            end = start + timedelta(days=30)

            app_count = JobApplication.objects.filter(applied_at__gte=start, applied_at__lt=end).count()
            selected_count = JobApplication.objects.filter(
                status=JobApplication.Status.SELECTED,
                updated_at__gte=start,
                updated_at__lt=end
            ).count()

            data.append({
                'month': month_label,
                'applications': app_count,
                'selections': selected_count
            })

        return Response(data)


class ExportPlacementCSVView(views.APIView):
    """Admin CSV export for campus placement audit and records."""
    permission_classes = [IsPlacementAdmin]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="campus_placement_report_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Roll Number', 'Student Name', 'Email', 'Phone', 'Department',
            'Graduation Year', 'CGPA', 'Company Placed', 'Job Title',
            'Package (Max)', 'Status', 'Date Applied', 'Date Selected'
        ])

        applications = JobApplication.objects.filter(
            status=JobApplication.Status.SELECTED
        ).select_related('student__user', 'job__company').order_by('student__roll_number')

        for app in applications:
            student = app.student
            job = app.job
            writer.writerow([
                student.roll_number,
                student.user.full_name,
                student.user.email,
                student.user.phone,
                student.department,
                student.graduation_year,
                student.cgpa,
                job.company.name,
                job.title,
                job.salary_display or str(job.salary_max or 'N/A'),
                app.get_status_display(),
                app.applied_at.strftime('%Y-%m-%d'),
                app.updated_at.strftime('%Y-%m-%d'),
            ])

        return response
