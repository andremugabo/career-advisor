import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()
from apps.users.models import User

admin_email = 'admin@auca.ac.rw'
admin_pass = '123'

if not User.objects.filter(email=admin_email).exists():
    User.objects.create_superuser(admin_email, admin_pass)
    print(f"✅ Master superuser created: {admin_email}")
else:
    # Force update the password just in case you forgot it
    user = User.objects.get(email=admin_email)
    user.set_password(admin_pass)
    user.save()
    print(f"🔄 Master superuser password reset: {admin_email}")
