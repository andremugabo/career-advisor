import os
import re
import csv
from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings
from apps.careers.models import CareerCluster
from apps.skills.models import Skill

class Command(BaseCommand):
    help = 'Seed O*NET datasets into the Django database'

    def handle(self, *args, **options):
        dataset_dir = os.path.join(settings.BASE_DIR, 'dataset')
        
        if not os.path.exists(dataset_dir):
            self.stdout.write(self.style.ERROR(f"Dataset directory not found at {dataset_dir}"))
            return

        # 1. Parse technical_skills.csv to populate Skill Model
        tech_skills_path = os.path.join(dataset_dir, 'technical_skills.csv')
        if os.path.exists(tech_skills_path):
            self.stdout.write("Seeding Technical Skills Dictionary...")
            skills_created = 0
            with open(tech_skills_path, 'r', encoding='utf-8', errors='ignore') as f:
                reader = csv.DictReader(f)
                with transaction.atomic():
                    for row in reader:
                        name = row.get('Skill Name', '').strip()
                        if name:
                            # Avoid duplicates
                            obj, created = Skill.objects.get_or_create(name=name, defaults={'category': 'Technical'})
                            if created:
                                skills_created += 1
            self.stdout.write(self.style.SUCCESS(f"Seeded {skills_created} new technical skills."))
        else:
            self.stdout.write(self.style.WARNING("technical_skills.csv not found, skipping skill dictionary seeding."))

        # 2. Extract Careers from 29_alternate_titles.sql
        titles_path = os.path.join(dataset_dir, '29_alternate_titles.sql')
        self.stdout.write("Extracting Career Clusters...")
        careers_dict = {} # onet_code -> name
        
        # Regex to capture: INSERT INTO alternate_titles (...) VALUES ('11-1011.00', 'Title', ...
        title_pattern = re.compile(r"INSERT INTO alternate_titles[^(]*\([^)]+\)\s*VALUES\s*\('([^']+)',\s*'([^']+)'")
        
        if os.path.exists(titles_path):
            with open(titles_path, 'r', encoding='utf-8', errors='ignore') as f:
                for line in f:
                    match = title_pattern.search(line)
                    if match:
                        code, title = match.groups()
                        if code not in careers_dict:
                            # Save the first alternate title we find as the main name
                            careers_dict[code] = title
            self.stdout.write(self.style.SUCCESS(f"Found {len(careers_dict)} unique occupations."))
        else:
            self.stdout.write(self.style.ERROR("29_alternate_titles.sql not found! Cannot extract careers."))
            return

        # 3. Extract required skills from 32_tools_used.sql
        tools_path = os.path.join(dataset_dir, '32_tools_used.sql')
        self.stdout.write("Extracting required technical tools for careers...")
        
        # Regex to capture: INSERT INTO tools_used (...) VALUES ('11-1011.00', '10-key calculators', ...
        tools_pattern = re.compile(r"INSERT INTO tools_used[^(]*\([^)]+\)\s*VALUES\s*\('([^']+)',\s*'([^']+)'")
        career_skills = {code: [] for code in careers_dict.keys()}
        
        if os.path.exists(tools_path):
            with open(tools_path, 'r', encoding='utf-8', errors='ignore') as f:
                for line in f:
                    match = tools_pattern.search(line)
                    if match:
                        code, tool = match.groups()
                        if code in career_skills:
                            # Clean the tool name (some have trailing descriptions)
                            clean_tool = tool.split('(')[0].strip()
                            # Avoid duplicates for the same career
                            if not any(s['name'] == clean_tool for s in career_skills[code]):
                                career_skills[code].append({"name": clean_tool, "type": "Technical"})
            self.stdout.write(self.style.SUCCESS("Parsed technical tools successfully."))
        else:
            self.stdout.write(self.style.WARNING("32_tools_used.sql not found, required skills will be empty."))

        # 4. Save Career Clusters to Database
        self.stdout.write("Saving Career Clusters to Database (This may take a minute)...")
        with transaction.atomic():
            created_count = 0
            updated_count = 0
            # We only want to save careers that actually have required skills to avoid polluting the DB with obscure jobs
            for code, name in careers_dict.items():
                req_skills = career_skills.get(code, [])
                if req_skills:
                    obj, created = CareerCluster.objects.update_or_create(
                        onet_code=code,
                        defaults={
                            'name': name[:255],
                            'description': f"O*NET Career Cluster for {name}",
                            'required_skills': {"skills": req_skills}
                        }
                    )
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1
        
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded! Created {created_count} new and updated {updated_count} existing Career Clusters with required skills!"))
