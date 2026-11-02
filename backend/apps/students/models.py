from django.db import models
from django.conf import settings
from apps.students.skill_engine import extract_text_from_pdf, extract_skills_from_text


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    roll_number = models.CharField(max_length=50, unique=True, db_index=True)
    college_name = models.CharField(max_length=200, default='National Institute of Technology')
    department = models.CharField(max_length=100)
    graduation_year = models.IntegerField(default=2026)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    active_backlogs = models.IntegerField(default=0)
    total_backlogs_history = models.IntegerField(default=0)
    technical_skills = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    projects = models.JSONField(default=list, blank=True)
    experience = models.JSONField(default=list, blank=True)
    bio = models.TextField(blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    is_placement_eligible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_profiles'
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'

    def __str__(self):
        return f"{self.user.full_name} ({self.roll_number}) - {self.department}"

    @property
    def primary_resume(self):
        return self.resumes.filter(is_primary=True).first() or self.resumes.first()


class Resume(models.Model):
    class ExtractionStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Extracted Successfully'
        UNREADABLE = 'UNREADABLE', 'Unreadable / Scanned'
        FAILED = 'FAILED', 'Extraction Failed'

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='resumes'
    )
    file = models.FileField(upload_to='resumes/%Y/%m/')
    file_name = models.CharField(max_length=255)
    file_size_bytes = models.IntegerField(default=0)
    extracted_text = models.TextField(blank=True)
    extracted_skills = models.JSONField(default=list, blank=True)
    is_primary = models.BooleanField(default=True)
    extraction_status = models.CharField(
        max_length=20,
        choices=ExtractionStatus.choices,
        default=ExtractionStatus.PENDING
    )
    extraction_notes = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'student_resumes'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"Resume: {self.file_name} ({self.student.user.full_name})"

    def process_and_extract(self):
        """Extract text and skills using PyMuPDF and skill taxonomy."""
        if not self.file:
            self.extraction_status = self.ExtractionStatus.FAILED
            self.extraction_notes = "No file attached."
            self.save()
            return

        try:
            self.file.open(mode='rb')
            text, status, notes = extract_text_from_pdf(self.file)
            self.extracted_text = text
            self.extraction_status = status
            self.extraction_notes = notes

            if status == "SUCCESS" and text:
                skills = extract_skills_from_text(text)
                self.extracted_skills = skills
                # Also supplement student profile skills if empty
                if not self.student.technical_skills and skills:
                    self.student.technical_skills = skills
                    self.student.save(update_fields=['technical_skills'])

            self.save()
        except Exception as e:
            self.extraction_status = self.ExtractionStatus.FAILED
            self.extraction_notes = f"Extraction error: {str(e)}"
            self.save()
