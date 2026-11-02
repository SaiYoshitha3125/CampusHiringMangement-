from django.db import models
from django.utils import timezone


class Company(models.Model):
    name = models.CharField(max_length=200, unique=True, db_index=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=100, default='Technology')
    location = models.CharField(max_length=200, blank=True)
    logo = models.FileField(upload_to='company_logos/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'companies'
        ordering = ['name']
        verbose_name_plural = 'Companies'

    def __str__(self):
        status = "Verified" if self.is_verified else "Pending Verification"
        return f"{self.name} ({status})"

    def verify(self):
        self.is_verified = True
        self.verified_at = timezone.now()
        self.save()
