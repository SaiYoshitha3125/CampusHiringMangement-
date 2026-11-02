import os
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User
from apps.companies.models import Company
from apps.recruiters.models import RecruiterProfile
from apps.students.models import StudentProfile, Resume
from apps.jobs.models import JobPosting, JobEligibilityCriteria, RecruitmentCycle
from apps.applications.models import JobApplication, ApplicationStatusHistory
from apps.interviews.models import Interview
from apps.notifications.models import Notification
from apps.students.skill_engine import calculate_skill_match


class Command(BaseCommand):
    help = 'Populates the database with realistic demonstration campus recruitment data.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding CampusHire database with realistic placement data...")

        # 1. Placement Admin
        admin_user, _ = User.objects.get_or_create(
            email='admin@campushire.edu',
            defaults={
                'first_name': 'Dr. Raman',
                'last_name': 'Murthy',
                'role': User.Role.ADMIN,
                'phone': '+91 9876543210',
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True
            }
        )
        admin_user.set_password('AdminPass@2026')
        admin_user.save()
        self.stdout.write(f"Created/Verified Admin: {admin_user.email}")

        # 2. Recruitment Cycle
        cycle, _ = RecruitmentCycle.objects.get_or_create(
            name="2025-2026 Campus Placement Season",
            defaults={
                'start_date': timezone.now().date() - timedelta(days=60),
                'end_date': timezone.now().date() + timedelta(days=120),
                'is_active': True,
                'description': 'Annual campus placement cycle for final year engineering and management students.'
            }
        )

        # 3. Companies & Recruiters
        companies_data = [
            {
                'name': 'Google Cloud',
                'description': 'Google LLC is an American multinational corporation and technology company focusing on search engine technology, cloud computing, and computer software.',
                'website': 'https://careers.google.com',
                'industry': 'Technology & Cloud',
                'location': 'Bangalore / Hyderabad',
                'recruiter_email': 'sarah.recruiter@google.com',
                'recruiter_name': ('Sarah', 'Jenkins'),
                'designation': 'Senior University Staffing Lead',
            },
            {
                'name': 'Microsoft Corporation',
                'description': 'Microsoft Corporation is a technology company producing computer software, consumer electronics, personal computers, and related services.',
                'website': 'https://careers.microsoft.com',
                'industry': 'Software & Cloud',
                'location': 'Hyderabad / Bangalore',
                'recruiter_email': 'alex.turner@microsoft.com',
                'recruiter_name': ('Alex', 'Turner'),
                'designation': 'Campus Talent Acquisition Specialist',
            },
            {
                'name': 'Amazon Web Services',
                'description': 'AWS is the world’s most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally.',
                'website': 'https://amazon.jobs',
                'industry': 'E-Commerce & Cloud Infrastructure',
                'location': 'Bangalore / Chennai',
                'recruiter_email': 'priya.sharma@amazon.com',
                'recruiter_name': ('Priya', 'Sharma'),
                'designation': 'Lead Technical Recruiter',
            },
            {
                'name': 'Cisco Systems',
                'description': 'Cisco Systems is an American multinational digital communications technology conglomerate corporation that develops and manufactures networking hardware.',
                'website': 'https://www.cisco.com/careers',
                'industry': 'Networking & Cybersecurity',
                'location': 'Bangalore',
                'recruiter_email': 'david.cohen@cisco.com',
                'recruiter_name': ('David', 'Cohen'),
                'designation': 'University Relations Manager',
            },
            {
                'name': 'Infosys Limited',
                'description': 'Infosys is a global leader in next-generation digital services and consulting, enabling clients across 56 countries to navigate their digital transformation.',
                'website': 'https://www.infosys.com/careers',
                'industry': 'IT Services & Consulting',
                'location': 'Pune / Mysore / Bangalore',
                'recruiter_email': 'kavita.nair@infosys.com',
                'recruiter_name': ('Kavita', 'Nair'),
                'designation': 'Regional Campus Placement Partner',
            }
        ]

        recruiter_users = {}
        for cdata in companies_data:
            company, _ = Company.objects.get_or_create(
                name=cdata['name'],
                defaults={
                    'description': cdata['description'],
                    'website': cdata['website'],
                    'industry': cdata['industry'],
                    'location': cdata['location'],
                    'is_verified': True,
                    'verified_at': timezone.now()
                }
            )
            company.is_verified = True
            company.save()

            r_first, r_last = cdata['recruiter_name']
            r_user, _ = User.objects.get_or_create(
                email=cdata['recruiter_email'],
                defaults={
                    'first_name': r_first,
                    'last_name': r_last,
                    'role': User.Role.RECRUITER,
                    'is_verified': True,
                    'phone': '+91 9988776655'
                }
            )
            r_user.set_password('RecruiterPass@2026')
            r_user.is_verified = True
            r_user.save()

            RecruiterProfile.objects.get_or_create(
                user=r_user,
                defaults={
                    'company': company,
                    'designation': cdata['designation'],
                    'is_company_admin': True,
                    'is_verified_by_admin': True
                }
            )
            recruiter_users[cdata['name']] = r_user

        # 4. Job Postings with Eligibility Criteria
        jobs_data = [
            {
                'company_name': 'Google Cloud',
                'title': 'Associate Software Engineer (Backend & Cloud)',
                'job_type': JobPosting.JobType.FULL_TIME,
                'work_mode': JobPosting.WorkMode.HYBRID,
                'location': 'Bangalore, India',
                'salary_min': 2200000.00,
                'salary_max': 2800000.00,
                'salary_display': '22 - 28 LPA',
                'description': 'Join the Google Cloud core engineering team building highly distributed, planetary-scale cloud services.',
                'responsibilities': 'Develop reliable and fault-tolerant backend services in Python and Go; collaborate on API design and microservice architecture.',
                'required_skills': ['Python', 'Django', 'SQL', 'Docker', 'Data Structures & Algorithms', 'RESTful APIs'],
                'nice_to_have_skills': ['Go', 'Kubernetes', 'GCP'],
                'deadline_days': 14,
                'min_cgpa': 7.50,
                'eligible_depts': ['Computer Science', 'Information Technology'],
                'eligible_years': [2026, 2027],
                'max_active_backlogs': 0,
            },
            {
                'company_name': 'Microsoft Corporation',
                'title': 'Full-Stack Software Engineer',
                'job_type': JobPosting.JobType.FULL_TIME,
                'work_mode': JobPosting.WorkMode.HYBRID,
                'location': 'Hyderabad, India',
                'salary_min': 2000000.00,
                'salary_max': 2600000.00,
                'salary_display': '20 - 26 LPA',
                'description': 'Deliver modern web and productivity software used by millions across Microsoft 365 and Azure Developer Tools.',
                'responsibilities': 'Design and maintain full-stack web applications using React, TypeScript, and robust backend APIs; ensure performance and security standards.',
                'required_skills': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
                'nice_to_have_skills': ['Azure', 'C#', 'Docker'],
                'deadline_days': 20,
                'min_cgpa': 7.00,
                'eligible_depts': ['Computer Science', 'Information Technology', 'Electronics'],
                'eligible_years': [2026, 2027],
                'max_active_backlogs': 0,
            },
            {
                'company_name': 'Amazon Web Services',
                'title': 'Software Development Engineer - Intern (6 Months)',
                'job_type': JobPosting.JobType.INTERN_TO_FTE,
                'work_mode': JobPosting.WorkMode.ON_SITE,
                'location': 'Bangalore, India',
                'salary_min': 1200000.00,
                'salary_max': 1800000.00,
                'salary_display': '1.0 Lakh/Month Internship (PPO eligible)',
                'description': 'Work alongside senior Amazon engineers on mission-critical AWS customer services and internal tooling.',
                'responsibilities': 'Implement automated features, write unit and integration tests, optimize distributed caching solutions.',
                'required_skills': ['Java', 'Python', 'Data Structures & Algorithms', 'SQL', 'Git'],
                'nice_to_have_skills': ['AWS', 'Docker'],
                'deadline_days': 10,
                'min_cgpa': 7.00,
                'eligible_depts': ['Computer Science', 'Information Technology', 'Electronics', 'Electrical'],
                'eligible_years': [2026],
                'max_active_backlogs': 0,
            },
            {
                'company_name': 'Cisco Systems',
                'title': 'Network & Cloud Security Engineer',
                'job_type': JobPosting.JobType.FULL_TIME,
                'work_mode': JobPosting.WorkMode.ON_SITE,
                'location': 'Bangalore, India',
                'salary_min': 1600000.00,
                'salary_max': 2000000.00,
                'salary_display': '16 - 20 LPA',
                'description': 'Develop next-generation network automation, zero-trust cloud security, and software-defined WAN tools.',
                'responsibilities': 'Automate network verification workflows, develop API endpoints, configure Linux container networks.',
                'required_skills': ['Python', 'Linux', 'RESTful APIs', 'Git', 'Data Structures & Algorithms'],
                'nice_to_have_skills': ['Docker', 'Kubernetes'],
                'deadline_days': 18,
                'min_cgpa': 6.50,
                'eligible_depts': ['Computer Science', 'Information Technology', 'Electronics'],
                'eligible_years': [2026, 2027],
                'max_active_backlogs': 1,
            },
            {
                'company_name': 'Infosys Limited',
                'title': 'Specialist Programmer (Digital Engineering)',
                'job_type': JobPosting.JobType.FULL_TIME,
                'work_mode': JobPosting.WorkMode.HYBRID,
                'location': 'Pune / Mysore / Bangalore',
                'salary_min': 950000.00,
                'salary_max': 1200000.00,
                'salary_display': '9.5 - 12 LPA',
                'description': 'High-performance digital engineering role focusing on cloud modernization, AI prototyping, and enterprise transformation.',
                'responsibilities': 'Develop full-stack enterprise features, migrate legacy systems to microservices, participate in agile sprints.',
                'required_skills': ['Java', 'Python', 'SQL', 'HTML5', 'CSS3', 'Git'],
                'nice_to_have_skills': ['React', 'Spring Boot'],
                'deadline_days': 25,
                'min_cgpa': 6.00,
                'eligible_depts': ['Computer Science', 'Information Technology', 'Electronics', 'Electrical', 'Mechanical', 'Civil'],
                'eligible_years': [2026, 2027],
                'max_active_backlogs': 2,
            }
        ]

        created_jobs = []
        for jdata in jobs_data:
            recruiter = recruiter_users[jdata['company_name']]
            company = recruiter.recruiter_profile.company

            job, _ = JobPosting.objects.get_or_create(
                recruiter=recruiter,
                company=company,
                title=jdata['title'],
                defaults={
                    'recruitment_cycle': cycle,
                    'job_type': jdata['job_type'],
                    'work_mode': jdata['work_mode'],
                    'location': jdata['location'],
                    'salary_min': jdata['salary_min'],
                    'salary_max': jdata['salary_max'],
                    'salary_currency': 'INR',
                    'salary_display': jdata['salary_display'],
                    'description': jdata['description'],
                    'responsibilities': jdata['responsibilities'],
                    'required_skills': jdata['required_skills'],
                    'nice_to_have_skills': jdata['nice_to_have_skills'],
                    'application_deadline': timezone.now() + timedelta(days=jdata['deadline_days']),
                    'status': JobPosting.Status.APPROVED
                }
            )
            job.status = JobPosting.Status.APPROVED
            job.save()

            JobEligibilityCriteria.objects.get_or_create(
                job=job,
                defaults={
                    'min_cgpa': jdata['min_cgpa'],
                    'eligible_departments': jdata['eligible_depts'],
                    'eligible_graduation_years': jdata['eligible_years'],
                    'max_active_backlogs': jdata['max_active_backlogs'],
                    'max_total_backlogs_history': 2,
                    'min_skill_match_percentage': 40
                }
            )
            created_jobs.append(job)

        # 5. Students
        students_data = [
            {
                'email': 'arjun.sharma@campushire.edu',
                'first_name': 'Arjun',
                'last_name': 'Sharma',
                'roll_number': 'CS-2022-041',
                'department': 'Computer Science',
                'graduation_year': 2026,
                'cgpa': 8.85,
                'active_backlogs': 0,
                'total_backlogs_history': 0,
                'phone': '+91 9123456789',
                'skills': ['Python', 'Django', 'React', 'SQL', 'PostgreSQL', 'Docker', 'Git', 'Data Structures & Algorithms', 'RESTful APIs'],
                'projects': [
                    {'title': 'Campus Placement Portal', 'tech_stack': 'Django, React, PostgreSQL', 'description': 'Full-stack placement portal with automated resume parsing and eligibility checking.'},
                    {'title': 'Distributed Key-Value Store', 'tech_stack': 'Python, Docker, gRPC', 'description': 'Raft consensus based distributed replication store.'}
                ],
                'certifications': [{'name': 'AWS Certified Cloud Practitioner', 'issuer': 'Amazon Web Services', 'year': 2025}],
                'bio': 'Passionate backend and distributed systems engineer. Competitive programmer with 1800+ rating on Codeforces.'
            },
            {
                'email': 'neha.patel@campushire.edu',
                'first_name': 'Neha',
                'last_name': 'Patel',
                'roll_number': 'IT-2022-088',
                'department': 'Information Technology',
                'graduation_year': 2026,
                'cgpa': 8.35,
                'active_backlogs': 0,
                'total_backlogs_history': 0,
                'phone': '+91 9876501234',
                'skills': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'SQL', 'Git', 'HTML5', 'CSS3', 'Tailwind CSS'],
                'projects': [
                    {'title': 'HealthSync Telemedicine Suite', 'tech_stack': 'React, WebRTC, Node.js', 'description': 'End-to-end encrypted video consultation platform for rural clinics.'}
                ],
                'certifications': [{'name': 'Meta Certified Front-End Developer', 'issuer': 'Meta', 'year': 2024}],
                'bio': 'Frontend specialist obsessed with micro-interactions, clean design systems, and responsive modern UX.'
            },
            {
                'email': 'rohit.verma@campushire.edu',
                'first_name': 'Rohit',
                'last_name': 'Verma',
                'roll_number': 'EC-2022-112',
                'department': 'Electronics',
                'graduation_year': 2026,
                'cgpa': 7.60,
                'active_backlogs': 0,
                'total_backlogs_history': 1,
                'phone': '+91 9456123789',
                'skills': ['C++', 'Python', 'Linux', 'Git', 'RESTful APIs', 'SQL'],
                'projects': [
                    {'title': 'Smart IoT Energy Monitor', 'tech_stack': 'C++, MQTT, Python', 'description': 'Real-time power monitoring device streaming telemetry to AWS.'}
                ],
                'certifications': [{'name': 'Cisco Certified Network Associate (CCNA)', 'issuer': 'Cisco', 'year': 2025}],
                'bio': 'Electronics & Communication enthusiast with a strong flair for network protocol engineering and low-level software.'
            },
            {
                'email': 'ananya.sen@campushire.edu',
                'first_name': 'Ananya',
                'last_name': 'Sen',
                'roll_number': 'CS-2022-015',
                'department': 'Computer Science',
                'graduation_year': 2026,
                'cgpa': 9.42,
                'active_backlogs': 0,
                'total_backlogs_history': 0,
                'phone': '+91 9911223344',
                'skills': ['Python', 'Java', 'Machine Learning', 'PyTorch', 'Data Structures & Algorithms', 'SQL', 'PostgreSQL', 'Docker', 'Git'],
                'projects': [
                    {'title': 'Automated Code Review Assistant', 'tech_stack': 'Python, PyTorch, AST', 'description': 'Deep learning syntax tree analyzer identifying security vulnerabilities.'}
                ],
                'certifications': [{'name': 'Deep Learning Specialization', 'issuer': 'DeepLearning.AI', 'year': 2025}],
                'bio': 'Top 1% department rank holder. Research paper published at IEEE on computer vision optimizations.'
            },
            {
                'email': 'vikram.singh@campushire.edu',
                'first_name': 'Vikram',
                'last_name': 'Singh',
                'roll_number': 'ME-2022-054',
                'department': 'Mechanical',
                'graduation_year': 2026,
                'cgpa': 6.80,
                'active_backlogs': 0,
                'total_backlogs_history': 1,
                'phone': '+91 9776655443',
                'skills': ['Python', 'SQL', 'Git', 'Data Structures & Algorithms'],
                'projects': [
                    {'title': 'Supply Chain Optimization Simulator', 'tech_stack': 'Python, NumPy, SimPy', 'description': 'Inventory routing optimization model saving 14% fuel consumption.'}
                ],
                'certifications': [{'name': 'Python for Data Analysis', 'issuer': 'Coursera', 'year': 2024}],
                'bio': 'Transitioning from Mechanical Engineering into software & data analytics. Quick learner with analytical mindset.'
            }
        ]

        created_students = []
        for sdata in students_data:
            s_user, _ = User.objects.get_or_create(
                email=sdata['email'],
                defaults={
                    'first_name': sdata['first_name'],
                    'last_name': sdata['last_name'],
                    'role': User.Role.STUDENT,
                    'phone': sdata['phone'],
                    'is_verified': True
                }
            )
            s_user.set_password('StudentPass@2026')
            s_user.is_verified = True
            s_user.save()

            sp, _ = StudentProfile.objects.get_or_create(
                user=s_user,
                defaults={
                    'roll_number': sdata['roll_number'],
                    'department': sdata['department'],
                    'graduation_year': sdata['graduation_year'],
                    'cgpa': sdata['cgpa'],
                    'active_backlogs': sdata['active_backlogs'],
                    'total_backlogs_history': sdata['total_backlogs_history'],
                    'technical_skills': sdata['skills'],
                    'projects': sdata['projects'],
                    'certifications': sdata['certifications'],
                    'bio': sdata['bio']
                }
            )
            created_students.append(sp)

        # 6. Applications & Status Transitions
        # Arjun -> Google (Shortlisted)
        google_job = created_jobs[0]
        arjun = created_students[0]
        match_arjun_google = calculate_skill_match(
            student_profile_skills=arjun.technical_skills,
            resume_extracted_skills=[],
            job_required_skills=google_job.required_skills
        )
        app1, _ = JobApplication.objects.get_or_create(
            student=arjun,
            job=google_job,
            defaults={
                'status': JobApplication.Status.INTERVIEW_SCHEDULED,
                'skill_match_score': match_arjun_google['match_percentage'],
                'skill_match_details': match_arjun_google
            }
        )
        ApplicationStatusHistory.objects.get_or_create(
            application=app1,
            to_status=JobApplication.Status.INTERVIEW_SCHEDULED,
            defaults={
                'from_status': JobApplication.Status.SHORTLISTED,
                'changed_by': google_job.recruiter,
                'remarks': 'Exceptional problem-solving background. Scheduled for Technical Round 1.'
            }
        )

        # Interview for Arjun at Google
        Interview.objects.get_or_create(
            application=app1,
            round_number=1,
            defaults={
                'round_name': 'Technical Round 1: Algorithms & Systems',
                'mode': Interview.Mode.ONLINE,
                'meeting_link': 'https://meet.google.com/xyz-campushire-interview',
                'scheduled_at': timezone.now() + timedelta(days=2, hours=4),
                'duration_minutes': 60,
                'interviewer_names': 'Karthik Raman (Senior Staff SWE, Google Cloud)',
                'instructions': 'Be prepared to write code in collaborative Google Docs and explain algorithmic complexity.',
                'status': Interview.Status.SCHEDULED
            }
        )

        # Neha -> Microsoft (Selected / Placed!)
        msft_job = created_jobs[1]
        neha = created_students[1]
        match_neha_msft = calculate_skill_match(
            student_profile_skills=neha.technical_skills,
            resume_extracted_skills=[],
            job_required_skills=msft_job.required_skills
        )
        app2, _ = JobApplication.objects.get_or_create(
            student=neha,
            job=msft_job,
            defaults={
                'status': JobApplication.Status.SELECTED,
                'skill_match_score': match_neha_msft['match_percentage'],
                'skill_match_details': match_neha_msft,
                'recruiter_notes': 'Selected after final partner interview. Offer letter rolled out at 24 LPA CTC.'
            }
        )
        ApplicationStatusHistory.objects.get_or_create(
            application=app2,
            to_status=JobApplication.Status.SELECTED,
            defaults={
                'from_status': JobApplication.Status.INTERVIEW_SCHEDULED,
                'changed_by': msft_job.recruiter,
                'remarks': 'Candidate accepted the offer. Onboarding June 2026.'
            }
        )

        # Ananya -> Google (Selected / Placed!)
        ananya = created_students[3]
        match_ananya_google = calculate_skill_match(
            student_profile_skills=ananya.technical_skills,
            resume_extracted_skills=[],
            job_required_skills=google_job.required_skills
        )
        app3, _ = JobApplication.objects.get_or_create(
            student=ananya,
            job=google_job,
            defaults={
                'status': JobApplication.Status.SELECTED,
                'skill_match_score': match_ananya_google['match_percentage'],
                'skill_match_details': match_ananya_google,
                'recruiter_notes': 'Top tier candidate. Rolled out offer at 28 LPA.'
            }
        )
        ApplicationStatusHistory.objects.get_or_create(
            application=app3,
            to_status=JobApplication.Status.SELECTED,
            defaults={
                'from_status': JobApplication.Status.INTERVIEW_SCHEDULED,
                'changed_by': google_job.recruiter,
                'remarks': 'Offer accepted.'
            }
        )

        # Rohit -> Cisco (Interview Scheduled)
        cisco_job = created_jobs[3]
        rohit = created_students[2]
        match_rohit_cisco = calculate_skill_match(
            student_profile_skills=rohit.technical_skills,
            resume_extracted_skills=[],
            job_required_skills=cisco_job.required_skills
        )
        app4, _ = JobApplication.objects.get_or_create(
            student=rohit,
            job=cisco_job,
            defaults={
                'status': JobApplication.Status.INTERVIEW_SCHEDULED,
                'skill_match_score': match_rohit_cisco['match_percentage'],
                'skill_match_details': match_rohit_cisco
            }
        )
        Interview.objects.get_or_create(
            application=app4,
            round_number=1,
            defaults={
                'round_name': 'Technical Round: Linux & Networking',
                'mode': Interview.Mode.ONLINE,
                'meeting_link': 'https://cisco.webex.com/meet/campus-interviews',
                'scheduled_at': timezone.now() + timedelta(days=3, hours=2),
                'duration_minutes': 45,
                'interviewer_names': 'David Cohen & Priya Sen',
                'instructions': 'Please have your Linux terminal ready for command-line diagnostics questions.',
                'status': Interview.Status.SCHEDULED
            }
        )

        # Vikram -> Infosys (Applied)
        infosys_job = created_jobs[4]
        vikram = created_students[4]
        match_vikram_infy = calculate_skill_match(
            student_profile_skills=vikram.technical_skills,
            resume_extracted_skills=[],
            job_required_skills=infosys_job.required_skills
        )
        JobApplication.objects.get_or_create(
            student=vikram,
            job=infosys_job,
            defaults={
                'status': JobApplication.Status.APPLIED,
                'skill_match_score': match_vikram_infy['match_percentage'],
                'skill_match_details': match_vikram_infy
            }
        )

        # 7. Sample in-app notifications
        Notification.objects.get_or_create(
            recipient=arjun.user,
            title="Interview Scheduled: Google Cloud",
            defaults={
                'message': 'Your Technical Round 1 interview has been scheduled for Google Cloud.',
                'notification_type': Notification.NotificationType.INTERVIEW_SCHEDULED,
                'action_url': '/student/interviews'
            }
        )
        Notification.objects.get_or_create(
            recipient=neha.user,
            title="Congratulations! Offer Received from Microsoft",
            defaults={
                'message': 'Microsoft Corporation has rolled out an offer for Full-Stack Software Engineer.',
                'notification_type': Notification.NotificationType.APPLICATION_STATUS,
                'action_url': '/student/applications'
            }
        )

        self.stdout.write(self.style.SUCCESS("CampusHire demonstration data successfully seeded!"))
        self.stdout.write(self.style.SUCCESS("Accounts created:"))
        self.stdout.write("  Admin:     admin@campushire.edu / AdminPass@2026")
        self.stdout.write("  Recruiter: sarah.recruiter@google.com / RecruiterPass@2026")
        self.stdout.write("  Recruiter: alex.turner@microsoft.com / RecruiterPass@2026")
        self.stdout.write("  Student:   arjun.sharma@campushire.edu / StudentPass@2026")
        self.stdout.write("  Student:   neha.patel@campushire.edu / StudentPass@2026")
        self.stdout.write("  Student:   ananya.sen@campushire.edu / StudentPass@2026")
