from django.db import models
from django.utils import timezone
from apps.applications.models import JobApplication


class Interview(models.Model):
    class Mode(models.TextChoices):
        ONLINE = 'ONLINE', 'Online (Video Conference)'
        IN_PERSON = 'IN_PERSON', 'In-Person / On-Campus'

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        RESCHEDULED = 'RESCHEDULED', 'Rescheduled'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name='interviews'
    )
    round_number = models.PositiveIntegerField(default=1)
    round_name = models.CharField(max_length=100, default='Technical Interview')
    mode = models.CharField(max_length=20, choices=Mode.choices, default=Mode.ONLINE)
    meeting_link = models.URLField(blank=True)
    venue = models.CharField(max_length=200, blank=True)
    scheduled_at = models.DateTimeField(db_index=True)
    duration_minutes = models.PositiveIntegerField(default=45)
    interviewer_names = models.CharField(max_length=255, blank=True)
    instructions = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    feedback = models.TextField(blank=True)
    rating = models.PositiveIntegerField(null=True, blank=True, help_text="Rating 1-5")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'interviews'
        ordering = ['scheduled_at']

    def __str__(self):
        return f"{self.round_name} for {self.application.student.user.full_name} ({self.status})"

    @property
    def is_upcoming(self):
        return self.status in [self.Status.SCHEDULED, self.Status.RESCHEDULED] and self.scheduled_at > timezone.now()
