from django.db import models
from django.conf import settings


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        APPLICATION_STATUS = 'APPLICATION_STATUS', 'Application Status Update'
        INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED', 'Interview Scheduled'
        JOB_APPROVED = 'JOB_APPROVED', 'Job Posting Approved'
        RECRUITER_VERIFIED = 'RECRUITER_VERIFIED', 'Recruiter Account Verified'
        NEW_ELIGIBLE_JOB = 'NEW_ELIGIBLE_JOB', 'New Eligible Job Opportunity'
        SYSTEM = 'SYSTEM', 'System Alert'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM
    )
    related_id = models.CharField(max_length=100, blank=True)
    action_url = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification to {self.recipient.email}: {self.title}"
