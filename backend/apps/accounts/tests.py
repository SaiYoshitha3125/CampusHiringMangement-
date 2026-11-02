from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.companies.models import Company
from apps.recruiters.models import RecruiterProfile
from apps.students.models import StudentProfile


class AccountsAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_student_registration(self):
        url = reverse('register')
        data = {
            'email': 'newstudent@campushire.edu',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!',
            'first_name': 'Test',
            'last_name': 'Student',
            'role': 'STUDENT',
            'phone': '1234567890',
            'department': 'Computer Science',
            'graduation_year': 2026,
            'cgpa': '8.50'
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newstudent@campushire.edu').exists())
        user = User.objects.get(email='newstudent@campushire.edu')
        self.assertEqual(user.role, User.Role.STUDENT)
        self.assertTrue(hasattr(user, 'student_profile'))
        self.assertEqual(user.student_profile.department, 'Computer Science')

    def test_admin_registration_forbidden(self):
        """Security: Client cannot grant ADMIN privileges by modifying registration role."""
        url = reverse('register')
        data = {
            'email': 'fakeadmin@campushire.edu',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!',
            'first_name': 'Fake',
            'last_name': 'Admin',
            'role': 'ADMIN',
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email='fakeadmin@campushire.edu').exists())

    def test_recruiter_registration(self):
        url = reverse('register')
        data = {
            'email': 'newrecruiter@meta.com',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!',
            'first_name': 'Recruiter',
            'last_name': 'One',
            'role': 'RECRUITER',
            'company_name': 'Meta Platforms',
            'company_industry': 'Social Media & VR',
            'designation': 'Senior Recruiter'
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='newrecruiter@meta.com')
        self.assertEqual(user.role, User.Role.RECRUITER)
        # Recruiter should start unverified by admin
        self.assertFalse(user.is_verified)
        self.assertFalse(user.recruiter_profile.is_verified_by_admin)

    def test_login_jwt(self):
        user = User.objects.create_user(
            email='testuser@campushire.edu',
            password='Password123!',
            first_name='Test',
            last_name='User',
            role=User.Role.STUDENT
        )
        url = reverse('login')
        res = self.client.post(url, {'email': 'testuser@campushire.edu', 'password': 'Password123!'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['email'], 'testuser@campushire.edu')
