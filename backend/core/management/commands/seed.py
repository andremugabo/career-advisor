from django.core.management.base import BaseCommand
from django.db import transaction

# Import all models
from apps.users.models import User
from apps.profiles.models import Student, AcademicPrograms
from apps.advisors.models import Advisor
from apps.careers.models import CareerCluster
from apps.skills.models import Skill, StudentSkill, Certification
from apps.internships.models import Internship
from apps.recommendations.models import MatchResult

class Command(BaseCommand):
    help = 'Seeds the database with test data for Emmerence Project'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write("Starting Database Seeding...")

        # 1. Create Users (Admin, Advisor, Students)
        admin_user, _ = User.objects.get_or_create(email="admin@auca.rw", defaults={'role': 'Admin'})
        admin_user.set_password("password123")
        admin_user.is_superuser = True
        admin_user.is_staff = True
        admin_user.save()

        adv_user, _ = User.objects.get_or_create(email="advisor@auca.rw", defaults={'role': 'Advisor'})
        adv_user.set_password("password123")
        adv_user.save()

        st_user1, _ = User.objects.get_or_create(email="student1@auca.rw", defaults={'role': 'Student'})
        st_user1.set_password("password123")
        st_user1.save()

        st_user2, _ = User.objects.get_or_create(email="student2@auca.rw", defaults={'role': 'Student'})
        st_user2.set_password("password123")
        st_user2.save()

        self.stdout.write("Users seeded.")

        # 2. Create Advisor Profile
        Advisor.objects.get_or_create(
            user=adv_user,
            defaults={'specialization': 'Software Engineering', 'department': 'IT'}
        )

        # 3. Create Academic Programs
        prog_cs, _ = AcademicPrograms.objects.get_or_create(name="Computer Science", defaults={'faculty': 'Information Technology'})
        prog_bus, _ = AcademicPrograms.objects.get_or_create(name="Business Administration", defaults={'faculty': 'Business'})

        # 4. Create Students
        st1, _ = Student.objects.get_or_create(
            user=st_user1, 
            defaults={'reg_number': '2023001', 'full_name': 'John Doe', 'gpa': 3.8, 'program': prog_cs, 'current_year': 3, 'bio': 'Tech enthusiast'}
        )
        st2, _ = Student.objects.get_or_create(
            user=st_user2, 
            defaults={'reg_number': '2023002', 'full_name': 'Jane Smith', 'gpa': 3.5, 'program': prog_bus, 'current_year': 2, 'bio': 'Business mind'}
        )

        # 5. Create Career Clusters
        cluster_se, _ = CareerCluster.objects.get_or_create(
            name="Software Engineering",
            defaults={'description': 'Building and maintaining software systems.', 'required_skills': {"skills": [{"name": "Python", "type": "Technical"}, {"name": "System Design", "type": "Technical"}]}}
        )
        cluster_ds, _ = CareerCluster.objects.get_or_create(
            name="Data Science",
            defaults={'description': 'Analyzing complex data.', 'required_skills': {"skills": [{"name": "Python", "type": "Technical"}, {"name": "SQL", "type": "Technical"}]}}
        )

        # 6. Create Skills
        skill_py, _ = Skill.objects.get_or_create(name="Python", defaults={'category': 'Technical'})
        skill_java, _ = Skill.objects.get_or_create(name="Java", defaults={'category': 'Technical'})
        skill_comm, _ = Skill.objects.get_or_create(name="Communication", defaults={'category': 'Soft'})

        # 7. Map Students to Skills
        StudentSkill.objects.get_or_create(student=st1, skill=skill_py, defaults={'proficiency_level': 4})
        StudentSkill.objects.get_or_create(student=st1, skill=skill_java, defaults={'proficiency_level': 3})
        StudentSkill.objects.get_or_create(student=st2, skill=skill_comm, defaults={'proficiency_level': 5})

        # 8. Create Mock Recommendations/Matches
        MatchResult.objects.get_or_create(student=st1, cluster=cluster_se, defaults={'match_score': 92.5, 'confidence': 0.88})
        MatchResult.objects.get_or_create(student=st1, cluster=cluster_ds, defaults={'match_score': 85.0, 'confidence': 0.75})

        # 9. Create Internships
        Internship.objects.get_or_create(
            company_name="TechCorp Rwanda", role_name="Junior Backend Developer", deadline="2026-12-31",
            defaults={'requirements': 'Knows Python and Django.', 'cluster': cluster_se}
        )

        self.stdout.write(self.style.SUCCESS("✅ Database successfully seeded with Emmerence test data!"))
