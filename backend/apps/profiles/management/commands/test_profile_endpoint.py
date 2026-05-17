from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.profiles.views import ProfileViewSet
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Test the REST profile API endpoint directly'

    def handle(self, *args, **options):
        self.stdout.write("Testing profile API endpoint...")
        
        # Get or create the test student user
        user = User.objects.filter(email='ai_test_student@auca.ac.rw').first()
        if not user:
            self.stdout.write(self.style.ERROR("Test user 'ai_test_student@auca.ac.rw' does not exist. Run 'test_ai_engine' first to seed."))
            return

        # Setup API Request Factory
        factory = APIRequestFactory()
        request = factory.get('/api/profiles/me/')
        force_authenticate(request, user=user)

        # Execute view
        view = ProfileViewSet.as_view({'get': 'me'})
        response = view(request)

        if response.status_code == 200:
            self.stdout.write(self.style.SUCCESS("Profile API Call Successful (Status 200)!"))
            self.stdout.write("Profile Output:")
            self.stdout.write(json.dumps(response.data, indent=2))
        else:
            self.stdout.write(self.style.ERROR(f"Profile API Call Failed (Status {response.status_code}):"))
            self.stdout.write(str(response.data))
