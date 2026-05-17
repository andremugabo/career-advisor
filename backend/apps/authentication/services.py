import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)

def send_welcome_email(student):
    """
    Sends a welcoming HTML email to a newly registered student.
    """
    try:
        subject = "Welcome to Emmerence AI Career Advisor! 🚀"
        context = {
            'full_name': student.full_name,
        }
        html_content = render_to_string('authentication/welcome.html', context)
        text_content = strip_tags(html_content)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[student.user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        logger.info(f"Welcome email successfully sent to {student.user.email}")
    except Exception as e:
        logger.error(f"Error sending welcome email to {student.user.email}: {e}")

def send_password_reset_email(reset_token):
    """
    Sends a secure 6-digit OTP code to a user requesting a password reset.
    """
    try:
        user = reset_token.user
        student_profile = getattr(user, 'student_profile', None)
        if student_profile:
            full_name = student_profile.full_name
        else:
            full_name = user.email
            
        subject = f"Your Password Reset Code: {reset_token.token} 🔒"
        context = {
            'full_name': full_name,
            'otp_code': reset_token.token,
        }
        html_content = render_to_string('authentication/password_reset.html', context)
        text_content = strip_tags(html_content)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        logger.info(f"Password reset OTP successfully sent to {user.email}")
    except Exception as e:
        logger.error(f"Error sending password reset email to {user.email}: {e}")
