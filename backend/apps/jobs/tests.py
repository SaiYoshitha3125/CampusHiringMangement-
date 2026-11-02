from decimal import Decimal
from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from apps.accounts.models import User
from apps.companies.models import Company
from apps.recruiters.models import RecruiterProfile
from apps.students.models import StudentProfile
from apps.jobs.models import JobPosting, JobEligibilityCriteria
from apps.applications.models import JobApplication
from apps.interviews.models import Interview
from apps.jobs.eligibility import check_student_eligibility
from apps.students.skill_engine import calculate_skill_match, extract_skills_from_text


class JobEligibilityAndMatchingTests(TestCase):
    def setUp(self):
        # Create Company & Recruiter
        self.company = Company.objects.create(name='Acme Corp', industry='Technology', is_verified=True)
        self.recruiter_user = User.objects.create_user(
            email='recruiter@acme.com',
            password='Password123!',
            first_name='John',
            last_name='Recruiter',
            role=User.Role.RECRUITER,
            is_verified=True
        )
        self.recruiter_profile = RecruiterProfile.objects.create(
            user=self.recruiter_user,
            company=self.company,
            is_verified_by_admin=True
        )

        # Create Eligible Student
        self.student_user = User.objects.create_user(
            email='student@campushire.edu',
            password='Password123!',
            first_name='Alice',
            last_name='Smith',
            role=User.Role.STUDENT
        )
        self.student = StudentProfile.objects.create(
            user=self.student_user,
            roll_number='CS-2022-100',
            department='Computer Science',
            graduation_year=2026,
            cgpa=Decimal('8.50'),
            active_backlogs=0,
            technical_skills=['Python', 'Django', 'SQL', 'Git']
        )

        # Create Job
        self.job = JobPosting.objects.create(
            recruiter=self.recruiter_user,
            company=self.company,
            title='Backend Engineer',
            job_type=JobPosting.JobType.FULL_TIME,
            location='Bangalore',
            salary_min=1200000,
            salary_max=1600000,
            description='Backend engineering role.',
            required_skills=['Python', 'Django', 'SQL', 'Docker', 'React'],
            nice_to_have_skills=['Kubernetes', 'AWS'],
            application_deadline=timezone.now() + timedelta(days=10),
            status=JobPosting.Status.APPROVED
        )
        self.criteria = JobEligibilityCriteria.objects.create(
            job=self.job,
            min_cgpa=Decimal('7.50'),
            eligible_departments=['Computer Science', 'Information Technology'],
            eligible_graduation_years=[2026, 2027],
            max_active_backlogs=0
        )

    def test_explainable_skill_match_percentage(self):
        """Test formula: (matched / total_required) * 100"""
        # Student has Python, Django, SQL. Job requires Python, Django, SQL, Docker, React (5 skills).
        # Matched = 3 / 5 = 60.0%
        match = calculate_skill_match(
            student_profile_skills=self.student.technical_skills,
            resume_extracted_skills=[],
            job_required_skills=self.job.required_skills,
            job_nice_to_have_skills=self.job.nice_to_have_skills
        )
        self.assertEqual(match['match_percentage'], 60.0)
        self.assertIn('Python', match['matched_skills'])
        self.assertIn('Django', match['matched_skills'])
        self.assertIn('SQL', match['matched_skills'])
        self.assertIn('Docker', match['missing_skills'])
        self.assertIn('React', match['missing_skills'])
        self.assertIn('Docker', match['suggested_skills'])

    def test_text_skill_extraction(self):
        resume_text = "Proficient in Python, Django REST Framework, Postgres, Docker, and Git version control."
        extracted = extract_skills_from_text(resume_text)
        self.assertIn('Python', extracted)
        self.assertIn('Django', extracted)
        self.assertIn('PostgreSQL', extracted)
        self.assertIn('Docker', extracted)
        self.assertIn('Git', extracted)

    def test_student_eligible(self):
        result = check_student_eligibility(self.student, self.job)
        self.assertTrue(result['is_eligible'])
        self.assertEqual(len(result['failure_reasons']), 0)

    def test_student_ineligible_due_to_cgpa(self):
        self.student.cgpa = Decimal('6.80')
        self.student.save()
        result = check_student_eligibility(self.student, self.job)
        self.assertFalse(result['is_eligible'])
        self.assertTrue(any('below the minimum required CGPA' in r for r in result['failure_reasons']))

    def test_student_ineligible_due_to_department(self):
        self.student.department = 'Civil Engineering'
        self.student.save()
        result = check_student_eligibility(self.student, self.job)
        self.assertFalse(result['is_eligible'])
        self.assertTrue(any('not eligible' in r for r in result['failure_reasons']))

    def test_student_ineligible_due_to_backlogs(self):
        self.student.active_backlogs = 1
        self.student.save()
        result = check_student_eligibility(self.student, self.job)
        self.assertFalse(result['is_eligible'])
        self.assertTrue(any('Active backlogs' in r for r in result['failure_reasons']))

    def test_student_ineligible_due_to_deadline(self):
        self.job.application_deadline = timezone.now() - timedelta(days=1)
        self.job.save()
        result = check_student_eligibility(self.student, self.job)
        self.assertFalse(result['is_eligible'])
        self.assertTrue(any('deadline has passed' in r for r in result['failure_reasons']))

    def test_duplicate_application_prevention(self):
        # Create first application
        JobApplication.objects.create(
            student=self.student,
            job=self.job,
            status=JobApplication.Status.APPLIED
        )
        result = check_student_eligibility(self.student, self.job)
        self.assertFalse(result['is_eligible'])
        self.assertTrue(any('already applied' in r for r in result['failure_reasons']))

    def test_status_transition_and_history(self):
        app = JobApplication.objects.create(
            student=self.student,
            job=self.job,
            status=JobApplication.Status.APPLIED
        )
        app.transition_status(
            JobApplication.Status.SHORTLISTED,
            changed_by=self.recruiter_user,
            remarks='Candidate passed resume screening.'
        )
        self.assertEqual(app.status, JobApplication.Status.SHORTLISTED)
        self.assertEqual(app.status_history.count(), 1)
        history = app.status_history.first()
        self.assertEqual(history.from_status, JobApplication.Status.APPLIED)
        self.assertEqual(history.to_status, JobApplication.Status.SHORTLISTED)
        self.assertEqual(history.remarks, 'Candidate passed resume screening.')

    def test_interview_scheduling_updates_application(self):
        app = JobApplication.objects.create(
            student=self.student,
            job=self.job,
            status=JobApplication.Status.SHORTLISTED
        )
        interview = Interview.objects.create(
            application=app,
            round_number=1,
            round_name='Technical Round 1',
            mode=Interview.Mode.ONLINE,
            scheduled_at=timezone.now() + timedelta(days=2)
        )
        app.transition_status(
            JobApplication.Status.INTERVIEW_SCHEDULED,
            changed_by=self.recruiter_user,
            remarks='Interview 1 scheduled.'
        )
        self.assertEqual(app.status, JobApplication.Status.INTERVIEW_SCHEDULED)
        self.assertTrue(interview.is_upcoming)
