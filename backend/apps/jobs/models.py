from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.companies.models import Company


class RecruitmentCycle(models.Model):
    name = models.CharField(max_length=150)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recruitment_cycles'
        ordering = ['-start_date']

    def __str__(self):
        status = "Active" if self.is_active else "Inactive"
        return f"{self.name} ({status})"


class JobPosting(models.Model):
    class JobType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full-time'
        INTERNSHIP = 'INTERNSHIP', 'Internship'
        INTERN_TO_FTE = 'INTERN_TO_FTE', 'Internship + FTE'

    class WorkMode(models.TextChoices):
        ON_SITE = 'ON_SITE', 'On-site'
        HYBRID = 'HYBRID', 'Hybrid'
        REMOTE = 'REMOTE', 'Remote'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Admin Approval'
        APPROVED = 'APPROVED', 'Approved & Published'
        REJECTED = 'REJECTED', 'Rejected'
        CLOSED = 'CLOSED', 'Closed'

    recruiter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_postings'
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='job_postings'
    )
    recruitment_cycle = models.ForeignKey(
        RecruitmentCycle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='job_postings'
    )
    title = models.CharField(max_length=200, db_index=True)
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    description = models.TextField()
    responsibilities = models.TextField(blank=True)
    location = models.CharField(max_length=150)
    work_mode = models.CharField(max_length=20, choices=WorkMode.choices, default=WorkMode.ON_SITE)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=10, default='INR')
    salary_display = models.CharField(max_length=100, blank=True, help_text="e.g. 12-16 LPA or 40,000/mo")
    required_skills = models.JSONField(default=list, blank=True)
    nice_to_have_skills = models.JSONField(default=list, blank=True)
    application_deadline = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.PENDING_APPROVAL)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'job_postings'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.company.name} [{self.get_status_display()}]"

    @property
    def is_expired(self):
        return timezone.now() > self.application_deadline

    @property
    def is_open(self):
        return self.status == self.Status.APPROVED and not self.is_expired


class JobEligibilityCriteria(models.Model):
    job = models.OneToOneField(
        JobPosting,
        on_delete=models.CASCADE,
        related_name='eligibility_criteria'
    )
    min_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=6.00)
    eligible_departments = models.JSONField(default=list, blank=True, help_text="List of eligible departments, e.g. ['Computer Science', 'Information Technology']")
    eligible_graduation_years = models.JSONField(default=list, blank=True, help_text="e.g. [2026, 2027]")
    max_active_backlogs = models.IntegerField(default=0)
    max_total_backlogs_history = models.IntegerField(default=2)
    required_skills_mandatory = models.BooleanField(default=False)
    min_skill_match_percentage = models.IntegerField(default=0)

    class Meta:
        db_table = 'job_eligibility_criteria'

    def __str__(self):
        return f"Eligibility for {self.job.title} (min CGPA: {self.min_cgpa})"
