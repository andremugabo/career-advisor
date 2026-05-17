import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()
from apps.audit.models import AuditLog

print(f"\n--- RECENT AUDIT LOGS ({AuditLog.objects.count()} total tracked actions) ---")
logs = AuditLog.objects.all().order_by('-timestamp')[:5]
for log in logs:
    print(f"User: {log.user.email if log.user else 'Anonymous'}")
    print(f"Action: {log.action}")
    print(f"Client IP: {log.created_from_ip}")
    print(f"Details: {log.details}")
    print("-" * 50)
