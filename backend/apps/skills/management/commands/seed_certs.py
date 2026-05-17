from django.core.management.base import BaseCommand
from django.db import transaction
from apps.skills.models import Skill, Certification

class Command(BaseCommand):
    help = 'Seed industry-standard online certifications and map them to skills'

    def handle(self, *args, **options):
        self.stdout.write("Seeding online courses and certifications...")

        # Definition of certifications and their associated skills (lowercased to match seeding logic)
        certs_to_seed = [
            {
                "name": "Google IT Automation with Python Professional Certificate",
                "provider": "Coursera / Google",
                "skills": ["python", "git"]
            },
            {
                "name": "AWS Certified Developer - Associate",
                "provider": "Amazon Web Services",
                "skills": ["python", "docker", "git"]
            },
            {
                "name": "Full Stack Web Development with React Specialization",
                "provider": "Coursera / HKUST",
                "skills": ["react", "javascript", "html", "css"]
            },
            {
                "name": "Google Data Analytics Professional Certificate",
                "provider": "Coursera / Google",
                "skills": ["sql", "postgresql"]
            },
            {
                "name": "Automotive Sheet Metal Engineering & Testing Certification",
                "provider": "Society of Automotive Engineers (SAE)",
                "skills": ["abrasion testers", "accelerometers", "accelerated weathering machines"]
            },
            {
                "name": "Industrial Quality Control & Materials Testing Specialist",
                "provider": "Udemy / ASTM International",
                "skills": ["torque testers", "durometers", "abrasion testers"]
            },
            {
                "name": "Railways Operations & Brake Operator Training",
                "provider": "National Transit Institute",
                "skills": ["locomotive airbrakes", "mobile radios"]
            }
        ]

        created_count = 0
        with transaction.atomic():
            for cert_data in certs_to_seed:
                cert, created = Certification.objects.update_or_create(
                    name=cert_data["name"],
                    defaults={"provider": cert_data["provider"]}
                )
                if created:
                    created_count += 1
                
                # Map skills
                for skill_name in cert_data["skills"]:
                    # Find skill case-insensitively or get_or_create it
                    skill, _ = Skill.objects.get_or_create(
                        name=skill_name.strip().lower(),
                        defaults={"category": "Technical"}
                    )
                    cert.skills.add(skill)

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {created_count} new certifications!"))
