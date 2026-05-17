from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.profiles.models import Student, AcademicPrograms
from apps.skills.models import Skill, StudentSkill
from apps.careers.models import CareerCluster
from ai.recommenders.career_recommender import CareerRecommender

User = get_user_model()

class Command(BaseCommand):
    help = 'Test the AI Similarity Engine with a dummy student'

    def handle(self, *args, **options):
        self.stdout.write("Setting up dummy student profile...")
        
        # 1. Create a User
        user, _ = User.objects.get_or_create(email='ai_test_student@auca.ac.rw', defaults={'role': 'Student'})
        user.set_password('testpass123')
        user.save()
        
        # 2. Create Academic Program
        prog, _ = AcademicPrograms.objects.get_or_create(name='BSc Software Engineering', faculty='IT')
        
        # 3. Create Student
        student, _ = Student.objects.get_or_create(
            user=user,
            defaults={
                'reg_number': 'TEST-99999',
                'full_name': 'AI Test Student',
                'gpa': 85.5,
                'program': prog,
                'current_year': 4
            }
        )
        
        # 4. Assign Skills to Student
        # Let's find a career like 'Software' or anything really, and extract its tools to ensure a 100% match
        target_career = CareerCluster.objects.exclude(onet_code__isnull=True).last()
        tech_skills_to_add = []
        if target_career and 'skills' in target_career.required_skills:
            for skill in target_career.required_skills['skills'][:5]:
                tech_skills_to_add.append((skill['name'], 5))
                
        # Add some random generic tech skills just in case
        tech_skills_to_add.extend([
            ('Python', 5),
            ('JavaScript', 4),
            ('React', 4)
        ])
        
        self.stdout.write(f"Assigning skills to student (Targeting {target_career.name if target_career else 'None'}):")
        for skill_name, proficiency in tech_skills_to_add:
            skill, _ = Skill.objects.get_or_create(name=skill_name, defaults={'category': 'Technical'})
            StudentSkill.objects.update_or_create(
                student=student, 
                skill=skill, 
                defaults={'proficiency_level': proficiency}
            )
            self.stdout.write(f" - {skill_name} (Level {proficiency})")
            
        self.stdout.write("\nRunning AI Similarity Engine...")
        
        # 5. Run Recommender
        recommendations = CareerRecommender.get_recommendations(student, top_n=5)
        
        if not recommendations:
            self.stdout.write(self.style.WARNING("No matches found. Ensure the database is seeded."))
            return
            
        self.stdout.write(self.style.SUCCESS("\n🏆 TOP 5 CAREER MATCHES:"))
        for i, rec in enumerate(recommendations, 1):
            self.stdout.write(self.style.SUCCESS(f"{i}. {rec['title']} (Match: {rec['match_percentage']}%)"))
            self.stdout.write(f"   Missing Skills ({rec['total_missing']} total): {', '.join(rec['missing_skills'])}")
            self.stdout.write("-" * 40)
