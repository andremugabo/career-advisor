import datetime
from django.core.management.base import BaseCommand
from apps.careers.models import CareerCluster
from apps.internships.models import Internship

class Command(BaseCommand):
    help = "Seed realistic internships for various career clusters"

    def handle(self, *args, **options):
        self.stdout.write("Seeding internships...")

        def resolve_cluster(onet_code, name, desc):
            # Try finding by exact ONET code
            cluster = CareerCluster.objects.filter(onet_code=onet_code).first()
            if not cluster:
                # Try finding by name match
                cluster = CareerCluster.objects.filter(name__icontains=name).first()
            if not cluster:
                # Create if completely missing
                cluster = CareerCluster.objects.create(
                    onet_code=onet_code,
                    name=name,
                    description=desc
                )
            return cluster

        software_cluster = resolve_cluster(
            "15-1252.00", "Software Developers", "Research, design, and develop computer software."
        )
        data_cluster = resolve_cluster(
            "15-2051.00", "Data Scientists", "Develop and implement algorithms and data models."
        )
        marketing_cluster = resolve_cluster(
            "11-2021.00", "Marketing Managers", "Plan, direct, or coordinate marketing policies."
        )
        chemistry_cluster = resolve_cluster(
            "19-2031.00", "Chemists", "Conduct qualitative and quantitative chemical analyses."
        )

        internships_data = [
            {
                "company": "Google",
                "title": "Software Engineering Intern",
                "requirements": "Proficiency in Python, Git, and Cosine similarity algorithms.",
                "deadline": datetime.date.today() + datetime.timedelta(days=90),
                "cluster": software_cluster
            },
            {
                "company": "Stripe",
                "title": "Backend Engineer Intern",
                "requirements": "Strong Python knowledge, REST APIs, PostgreSQL, and Django.",
                "deadline": datetime.date.today() + datetime.timedelta(days=60),
                "cluster": software_cluster
            },
            {
                "company": "Meta",
                "title": "AI & Data Science Intern",
                "requirements": "Strong mathematical optimization, machine learning models, and Python vectorization.",
                "deadline": datetime.date.today() + datetime.timedelta(days=45),
                "cluster": data_cluster
            },
            {
                "company": "Salesforce",
                "title": "Product Marketing Intern",
                "requirements": "Excellent presentation, communication, and market intelligence analysis skills.",
                "deadline": datetime.date.today() + datetime.timedelta(days=30),
                "cluster": marketing_cluster
            },
            {
                "company": "Pfizer",
                "title": "Clinical Chemistry Intern",
                "requirements": "Laboratory operations, organic chemistry formulas, and data compliance standards.",
                "deadline": datetime.date.today() + datetime.timedelta(days=120),
                "cluster": chemistry_cluster
            }
        ]

        created_count = 0
        for data in internships_data:
            internship, created = Internship.objects.get_or_create(
                company=data["company"],
                title=data["title"],
                defaults={
                    "requirements": data["requirements"],
                    "deadline": data["deadline"],
                    "cluster": data["cluster"]
                }
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {created_count} new internships!"))
