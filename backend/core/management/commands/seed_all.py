"""
Master Seeder — Seeds ALL required initial data for the Emmerence Career Advisor.

This command ensures the application has every piece of data it needs
to function from a fresh database. It covers:

  1. Academic Programs (with program_skills M2M mappings)
  2. Soft Skills dictionary (the O*NET seeder only covers Technical)
  3. Career Assessment template (RIASEC questionnaire)
  4. Resource Library starter content
  5. Admin, Advisor, and test Student accounts
  6. Delegates to existing sub-seeders: seed_onet, seed_certs, seed_internships

Usage:
  python manage.py seed_all
"""

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import transaction

from apps.users.models import User
from apps.profiles.models import Student, AcademicPrograms
from apps.advisors.models import Advisor
from apps.skills.models import Skill
from apps.careers.models import CareerAssessment
from apps.resources.models import Resource


class Command(BaseCommand):
    help = 'Master seeder — populates all required startup data for the Emmerence Career Advisor'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('\n🚀 Emmerence Master Seeder — Starting...\n'))

        # ─────────────────────────────────────────────
        # Step 1: Run the O*NET Career Clusters seeder
        # ─────────────────────────────────────────────
        self.stdout.write(self.style.MIGRATE_HEADING('📦 Step 1/7: Seeding O*NET Career Clusters & Technical Skills...'))
        try:
            call_command('seed_onet')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'  ⚠ seed_onet encountered an issue: {e}'))

        # ─────────────────────────────────────────────
        # Step 2: Seed Soft Skills
        # ─────────────────────────────────────────────
        self.stdout.write(self.style.MIGRATE_HEADING('\n📦 Step 2/7: Seeding Soft Skills Dictionary...'))
        self._seed_soft_skills()

        # ─────────────────────────────────────────────
        # Step 3: Seed Academic Programs + program_skills
        # ─────────────────────────────────────────────
        self.stdout.write(self.style.MIGRATE_HEADING('\n📦 Step 3/7: Seeding Academic Programs...'))
        self._seed_academic_programs()

        # ─────────────────────────────────────────────
        # Step 4: Run the Certifications seeder
        # ─────────────────────────────────────────────
        self.stdout.write(self.style.MIGRATE_HEADING('\n📦 Step 4/7: Seeding Certifications...'))
        try:
            call_command('seed_certs')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'  ⚠ seed_certs encountered an issue: {e}'))

        # ─────────────────────────────────────────────
        # Step 5: Run the Internships seeder
        # ─────────────────────────────────────────────
        self.stdout.write(self.style.MIGRATE_HEADING('\n📦 Step 5/7: Seeding Internships...'))
        try:
            call_command('seed_internships')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'  ⚠ seed_internships encountered an issue: {e}'))

        # ─────────────────────────────────────────────
        # Step 6: Seed Career Assessment template + Resources
        # ─────────────────────────────────────────────
        self.stdout.write(self.style.MIGRATE_HEADING('\n📦 Step 6/7: Seeding Career Assessment & Resources...'))
        self._seed_assessment_template()
        self._seed_resources()

        # ─────────────────────────────────────────────
        # Step 7: Seed User Accounts
        # ─────────────────────────────────────────────
        self.stdout.write(self.style.MIGRATE_HEADING('\n📦 Step 7/7: Seeding User Accounts...'))
        self._seed_user_accounts()

        self.stdout.write(self.style.SUCCESS('\n✅ Master seeder completed successfully! All startup data is ready.\n'))

    # ==========================================
    # SOFT SKILLS DICTIONARY
    # ==========================================
    def _seed_soft_skills(self):
        """The O*NET seeder only creates Technical skills from CSV.
        The app needs a Soft Skills category too for the Skills page filter."""
        soft_skills = [
            'Communication', 'Teamwork', 'Leadership', 'Problem Solving',
            'Critical Thinking', 'Time Management', 'Adaptability', 'Creativity',
            'Emotional Intelligence', 'Conflict Resolution', 'Negotiation',
            'Public Speaking', 'Active Listening', 'Decision Making',
            'Project Management', 'Mentoring', 'Interpersonal Skills',
            'Attention to Detail', 'Work Ethic', 'Self-Motivation',
            'Collaboration', 'Stress Management', 'Cultural Awareness',
            'Presentation Skills', 'Analytical Thinking', 'Strategic Planning',
            'Customer Service', 'Organizational Skills', 'Coaching',
            'Persuasion',
        ]
        created = 0
        for name in soft_skills:
            _, was_created = Skill.objects.get_or_create(
                name=name, defaults={'category': 'Soft'}
            )
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Seeded {created} new soft skills (total defined: {len(soft_skills)}).'))

    # ==========================================
    # ACADEMIC PROGRAMS + PROGRAM_SKILLS M2M
    # ==========================================
    def _seed_academic_programs(self):
        """Creates realistic university programs and maps core skills to each
        via the program_skills M2M so the AI vectorizer picks them up."""

        # Define programs: (name, faculty, [skill_names])
        programs_data = [
            # ── Faculty of Information Technology ──
            (
                'BSc Computer Science',
                'Information Technology',
                ['Python', 'Java', 'Data Structures', 'Algorithms', 'Machine Learning',
                 'Operating Systems', 'Databases', 'Software Engineering',
                 'Critical Thinking', 'Problem Solving'],
            ),
            (
                'BSc Software Engineering',
                'Information Technology',
                ['Python', 'Java', 'Git', 'React', 'Django', 'REST APIs',
                 'Agile Methodology', 'Software Testing', 'DevOps',
                 'Teamwork', 'Problem Solving'],
            ),
            (
                'BSc Information Technology',
                'Information Technology',
                ['Networking', 'Cybersecurity', 'System Administration',
                 'Cloud Computing', 'Linux', 'Databases', 'Technical Support',
                 'Communication', 'Problem Solving'],
            ),
            (
                'BSc Data Science & Analytics',
                'Information Technology',
                ['Python', 'SQL', 'Machine Learning', 'Data Visualization',
                 'Statistics', 'Big Data', 'R Programming',
                 'Analytical Thinking', 'Critical Thinking'],
            ),
            # ── Faculty of Business ──
            (
                'BBA Business Administration',
                'Business',
                ['Financial Analysis', 'Marketing', 'Accounting', 'Management',
                 'Strategic Planning', 'Excel', 'Business Communication',
                 'Leadership', 'Negotiation', 'Project Management'],
            ),
            (
                'BSc Finance',
                'Business',
                ['Financial Analysis', 'Investment', 'Risk Management', 'Accounting',
                 'Excel', 'Budgeting', 'Auditing', 'Banking',
                 'Analytical Thinking', 'Attention to Detail'],
            ),
            (
                'BSc Accounting',
                'Business',
                ['Accounting', 'Tax', 'Auditing', 'Financial Reporting',
                 'Excel', 'Budgeting', 'Compliance',
                 'Attention to Detail', 'Organizational Skills'],
            ),
            (
                'BSc Marketing',
                'Business',
                ['Marketing', 'Digital Marketing', 'Social Media', 'Market Research',
                 'Branding', 'Communication', 'Creativity',
                 'Public Speaking', 'Persuasion'],
            ),
            # ── Faculty of Engineering ──
            (
                'BSc Electrical Engineering',
                'Engineering',
                ['Circuit Design', 'Electronics', 'Signal Processing',
                 'Control Systems', 'MATLAB', 'Embedded Systems',
                 'Problem Solving', 'Analytical Thinking'],
            ),
            (
                'BSc Civil Engineering',
                'Engineering',
                ['Structural Analysis', 'AutoCAD', 'Construction Management',
                 'Surveying', 'Environmental Engineering',
                 'Project Management', 'Teamwork'],
            ),
            # ── Faculty of Health Sciences ──
            (
                'BSc Nursing',
                'Health Sciences',
                ['Patient Care', 'Clinical Assessment', 'Pharmacology',
                 'Medical Terminology', 'Healthcare Ethics',
                 'Communication', 'Empathy', 'Stress Management'],
            ),
            (
                'BSc Public Health',
                'Health Sciences',
                ['Epidemiology', 'Biostatistics', 'Health Policy',
                 'Community Health', 'Research', 'Data Analysis',
                 'Communication', 'Critical Thinking'],
            ),
            # ── Faculty of Education ──
            (
                'BEd Education',
                'Education',
                ['Curriculum Development', 'Classroom Management',
                 'Educational Psychology', 'Assessment Design',
                 'Communication', 'Public Speaking', 'Mentoring',
                 'Adaptability', 'Creativity'],
            ),
            # ── Faculty of Law ──
            (
                'LLB Law',
                'Law',
                ['Legal Research', 'Legal Writing', 'Contract Law',
                 'Constitutional Law', 'Criminal Law', 'Negotiation',
                 'Critical Thinking', 'Public Speaking', 'Analytical Thinking'],
            ),
            # ── Faculty of Arts & Social Sciences ──
            (
                'BA Communication & Media',
                'Arts & Social Sciences',
                ['Journalism', 'Media Production', 'Digital Media',
                 'Public Relations', 'Content Creation',
                 'Communication', 'Creativity', 'Presentation Skills'],
            ),
            (
                'BA International Relations',
                'Arts & Social Sciences',
                ['Diplomacy', 'Political Analysis', 'International Law',
                 'Research', 'Cross-Cultural Communication',
                 'Negotiation', 'Critical Thinking', 'Leadership'],
            ),
        ]

        created_programs = 0
        for name, faculty, skill_names in programs_data:
            program, was_created = AcademicPrograms.objects.get_or_create(
                name=name,
                defaults={'faculty': faculty},
            )
            if was_created:
                created_programs += 1

            # Map skills — create missing ones on the fly
            for skill_name in skill_names:
                # Check Technical first, then Soft, then default to Technical
                skill = Skill.objects.filter(name__iexact=skill_name).first()
                if not skill:
                    # Determine category heuristically
                    category = 'Soft' if skill_name in [
                        'Communication', 'Teamwork', 'Leadership', 'Problem Solving',
                        'Critical Thinking', 'Creativity', 'Adaptability', 'Mentoring',
                        'Public Speaking', 'Negotiation', 'Analytical Thinking',
                        'Attention to Detail', 'Organizational Skills', 'Persuasion',
                        'Presentation Skills', 'Empathy', 'Stress Management',
                        'Project Management', 'Strategic Planning', 'Collaboration',
                        'Cross-Cultural Communication',
                    ] else 'Technical'
                    skill = Skill.objects.create(name=skill_name, category=category)

                program.program_skills.add(skill)

        self.stdout.write(self.style.SUCCESS(
            f'  ✓ Seeded {created_programs} new academic programs '
            f'(total defined: {len(programs_data)}) with skill mappings.'
        ))

    # ==========================================
    # CAREER ASSESSMENT TEMPLATE (RIASEC)
    # ==========================================
    def _seed_assessment_template(self):
        """The submit_assessment_generic view requires at least one
        CareerAssessment object to exist — without it, students get a 404."""
        assessment, created = CareerAssessment.objects.get_or_create(
            title='RIASEC Career Interest Assessment',
            defaults={
                'description': (
                    'Discover your career personality type using the Holland RIASEC model. '
                    'Rate each activity from 1 (Not Interested) to 5 (Very Interested).'
                ),
                'questions': [
                    {
                        'id': 'q1',
                        'category': 'Realistic',
                        'text': 'How much do you enjoy building, repairing, or working with tools and machinery?',
                    },
                    {
                        'id': 'q2',
                        'category': 'Investigative',
                        'text': 'How much do you enjoy researching, analyzing data, or solving complex problems?',
                    },
                    {
                        'id': 'q3',
                        'category': 'Artistic',
                        'text': 'How much do you enjoy creating art, writing, designing, or performing?',
                    },
                    {
                        'id': 'q4',
                        'category': 'Social',
                        'text': 'How much do you enjoy helping, teaching, counseling, or caring for others?',
                    },
                    {
                        'id': 'q5',
                        'category': 'Enterprising',
                        'text': 'How much do you enjoy leading teams, making decisions, or starting ventures?',
                    },
                    {
                        'id': 'q6',
                        'category': 'Conventional',
                        'text': 'How much do you enjoy organizing information, following procedures, or working with numbers?',
                    },
                    {
                        'id': 'q7',
                        'category': 'Technology',
                        'text': 'How much do you enjoy working with computers, coding, or using digital tools?',
                    },
                ],
            },
        )
        status_msg = 'created' if created else 'already exists'
        self.stdout.write(self.style.SUCCESS(f'  ✓ Career Assessment template {status_msg}.'))

    # ==========================================
    # RESOURCE LIBRARY STARTER CONTENT
    # ==========================================
    def _seed_resources(self):
        """Provides starter resources so the Resource Library page
        is not empty on first visit."""
        resources_data = [
            {
                'title': 'How to Write an Effective Resume',
                'file_path': 'https://www.indeed.com/career-advice/resumes-cover-letters/how-to-write-a-resume',
                'category': 'Career Development',
            },
            {
                'title': 'Top 10 Interview Tips for Students',
                'file_path': 'https://www.themuse.com/advice/the-ultimate-interview-guide',
                'category': 'Interview Preparation',
            },
            {
                'title': 'Understanding the RIASEC Career Model',
                'file_path': 'https://www.onetonline.org/find/descriptor/browse/Interests/',
                'category': 'Career Assessment',
            },
            {
                'title': 'LinkedIn Profile Optimization Guide',
                'file_path': 'https://www.linkedin.com/pulse/how-optimize-your-linkedin-profile/',
                'category': 'Professional Networking',
            },
            {
                'title': 'Free Coursera Courses for Career Growth',
                'file_path': 'https://www.coursera.org/courses?query=free',
                'category': 'Online Learning',
            },
            {
                'title': 'Internship Application Best Practices',
                'file_path': 'https://www.indeed.com/career-advice/finding-a-job/how-to-apply-for-internship',
                'category': 'Internship Guide',
            },
            {
                'title': 'Building a Portfolio as a Student',
                'file_path': 'https://www.freecodecamp.org/news/how-to-build-a-developer-portfolio/',
                'category': 'Career Development',
            },
            {
                'title': 'Salary Negotiation Strategies',
                'file_path': 'https://hbr.org/2014/06/15-rules-for-negotiating-a-job-offer',
                'category': 'Career Development',
            },
        ]
        created = 0
        for data in resources_data:
            _, was_created = Resource.objects.get_or_create(
                title=data['title'],
                defaults={'file_path': data['file_path'], 'category': data['category']},
            )
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Seeded {created} new resources (total defined: {len(resources_data)}).'))

    # ==========================================
    # USER ACCOUNTS (Admin, Advisor, Test Student)
    # ==========================================
    def _seed_user_accounts(self):
        """Creates the system accounts needed for testing and demonstration."""

        # ── Admin ──
        admin_email = 'admin@auca.ac.rw'
        admin, admin_created = User.objects.get_or_create(
            email=admin_email,
            defaults={'role': 'Admin', 'is_staff': True, 'is_superuser': True, 'is_verified': True},
        )
        admin.set_password('123')
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        self.stdout.write(self.style.SUCCESS(
            f'  ✓ Admin {"created" if admin_created else "updated"}: {admin_email}'
        ))

        # ── Advisor ──
        advisor_email = 'test_advisor_api@auca.ac.rw'
        adv_user, adv_created = User.objects.get_or_create(
            email=advisor_email,
            defaults={'role': 'Advisor', 'is_verified': True},
        )
        adv_user.set_password('advisorpass123')
        adv_user.save()
        Advisor.objects.get_or_create(
            user=adv_user,
            defaults={'specialization': 'Career Counseling', 'department': 'Student Services'},
        )
        self.stdout.write(self.style.SUCCESS(
            f'  ✓ Advisor {"created" if adv_created else "updated"}: {advisor_email}'
        ))

        # ── Test Student ──
        student_email = 'test_student_api@auca.ac.rw'
        st_user, st_created = User.objects.get_or_create(
            email=student_email,
            defaults={'role': 'Student', 'is_verified': True},
        )
        st_user.set_password('studentpass123')
        st_user.save()

        # Link to a program if one exists
        default_program = AcademicPrograms.objects.filter(name__icontains='Computer Science').first()

        Student.objects.get_or_create(
            user=st_user,
            defaults={
                'reg_number': '25001',
                'full_name': 'Test Student',
                'gpa': 3.5,
                'program': default_program,
                'current_year': 3,
                'bio': 'A test student account for development and demonstration.',
                'institution_name': 'Adventist University of Central Africa',
            },
        )
        self.stdout.write(self.style.SUCCESS(
            f'  ✓ Student {"created" if st_created else "updated"}: {student_email}'
        ))
