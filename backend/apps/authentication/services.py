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

def send_email_verification_email(verification_token):
    """
    Sends an email with a 6-digit OTP to verify user email.
    """
    try:
        user = verification_token.user
        subject = f"Verify your Email Address: {verification_token.token} ✉️"
        context = {
            'otp_code': verification_token.token,
        }
        # Fallback to simple text if template doesn't exist
        html_content = f"<h1>Email Verification</h1><p>Your verification code is: <strong>{verification_token.token}</strong></p>"
        text_content = strip_tags(html_content)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        logger.info(f"Verification OTP successfully sent to {user.email}")
    except Exception as e:
        logger.error(f"Error sending verification email to {user.email}: {e}")

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


def send_mfa_email(mfa_token):
    """
    Sends a secure 6-digit MFA OTP code to the user.
    """
    try:
        user = mfa_token.user
        subject = f"Your Identity Verification Code: {mfa_token.token} 🔒"
        context = {
            'otp_code': mfa_token.token,
        }
        html_content = render_to_string('authentication/mfa_email.html', context)
        text_content = strip_tags(html_content)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        logger.info(f"MFA OTP successfully sent to {user.email}")
    except Exception as e:
        logger.error(f"Error sending MFA email to {user.email}: {e}")

