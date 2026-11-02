from django.db import models
from django.conf import settings
from apps.students.models import StudentProfile, Resume
from apps.jobs.models import JobPosting


class JobApplication(models.Model):
    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED', 'Interview Scheduled'
        SELECTED = 'SELECTED', 'Selected'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    job = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    resume = models.ForeignKey(
        Resume,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications'
    )
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.APPLIED,
        db_index=True
    )
    skill_match_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    skill_match_details = models.JSONField(default=dict, blank=True)
    recruiter_notes = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'job_applications'
        ordering = ['-applied_at']
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'job'],
                name='unique_student_job_application'
            )
        ]

    def __str__(self):
        return f"{self.student.user.full_name} -> {self.job.title} [{self.get_status_display()}]"

    def transition_status(self, new_status, changed_by=None, remarks=''):
        """Helper to transition status and append to status history."""
        old_status = self.status
        if old_status != new_status:
            self.status = new_status
            self.save(update_fields=['status', 'updated_at'])
            ApplicationStatusHistory.objects.create(
                application=self,
                from_status=old_status,
                to_status=new_status,
                changed_by=changed_by,
                remarks=remarks
            )


class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    from_status = models.CharField(max_length=30)
    to_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    remarks = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'application_status_history'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.from_status} -> {self.to_status} at {self.timestamp}"
