import json
import logging
from django.utils.deprecation import MiddlewareMixin
from apps.audit.models import AuditLog

logger = logging.getLogger(__name__)

class GlobalAuditMiddleware(MiddlewareMixin):
    """
    Middleware to automatically intercept and track every mutating API action
    (POST, PUT, PATCH, DELETE) happening in the system. It captures the user ID,
    the endpoint path, HTTP method, status code, and the client's IP address.
    """
    
    def process_response(self, request, response):
        # We only want to track mutating actions to avoid flooding the database with GET requests
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            # We only track API routes to keep logs clean
            if request.path.startswith('/api/'):
                # Extract IP address securely (accounting for potential Nginx/Docker reverse proxies)
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    ip = x_forwarded_for.split(',')[0].strip()
                else:
                    ip = request.META.get('REMOTE_ADDR')
                
                # Identify user if authenticated
                user = request.user if hasattr(request, 'user') and request.user.is_authenticated else None
                
                # Sanitize the body payload to prevent storing raw passwords in the audit log
                safe_path = request.path
                if '/auth/login/' in safe_path or '/auth/register/' in safe_path or '/auth/password' in safe_path:
                    action_label = f"AUTH_{request.method}"
                else:
                    action_label = f"API_{request.method}"

                details = {
                    'path': safe_path,
                    'method': request.method,
                    'status_code': response.status_code,
                    'ip_address': ip
                }
                
                try:
                    AuditLog.objects.create(
                        user=user,
                        action=action_label,
                        details=details,
                        created_from_ip=ip
                    )
                except Exception as e:
                    logger.error(f"Failed to write global audit log: {str(e)}")
                    
        return response
