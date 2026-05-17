import json
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.profiles.models import Student, AcademicPrograms
from apps.skills.models import Skill, StudentSkill, Certification, StudentCertification
from apps.careers.models import CareerCluster
from apps.internships.models import Internship
from apps.applications.models import Application
from apps.audit.models import AuditLog

User = get_user_model()

class Command(BaseCommand):
    help = "Run end-to-end testing for all newly implemented features"

    def handle(self, *args, **options):
        self.stdout.write("Initializing End-to-End Features Test Suite...")
        client = APIClient()

        # ----------------------------------------------------
        # SETUP DATA
        # ----------------------------------------------------
        # Create users
        student_user, _ = User.objects.get_or_create(email='test_student_api@auca.ac.rw', defaults={'role': 'Student'})
        student_user.set_password('studentpass123')
        student_user.save()

        # Clean up existing test state for repeatable runs
        StudentCertification.objects.filter(student__user=student_user).delete()
        Application.objects.filter(student__user=student_user).delete()

        advisor_user, _ = User.objects.get_or_create(email='test_advisor_api@auca.ac.rw', defaults={'role': 'Advisor'})
        advisor_user.set_password('advisorpass123')
        advisor_user.save()

        prog, _ = AcademicPrograms.objects.get_or_create(name='BSc Software Engineering', faculty='IT')
        
        student, _ = Student.objects.get_or_create(
            user=student_user,
            defaults={
                'reg_number': 'TEST-12345',
                'full_name': 'E2E Test Student',
                'gpa': 80.0,
                'program': prog,
                'current_year': 3
            }
        )

        skill_python, _ = Skill.objects.get_or_create(name='Python', defaults={'category': 'Technical'})
        skill_django, _ = Skill.objects.get_or_create(name='Django', defaults={'category': 'Technical'})
        
        # Seed student skills
        StudentSkill.objects.update_or_create(student=student, skill=skill_python, defaults={'proficiency_level': 5})

        # Ensure a cluster exists for internships matching
        cluster, _ = CareerCluster.objects.get_or_create(
            onet_code='15-1252.00',
            defaults={
                'name': 'Software Developers',
                'description': 'Software dev track.',
                'required_skills': {'skills': [{'name': 'Python', 'level': 5}]}
            }
        )

        internship, _ = Internship.objects.get_or_create(
            company_name='Stripe',
            role_name='E2E Developer Intern',
            defaults={
                'requirements': 'Python, Django knowledge',
                'deadline': '2026-12-31',
                'cluster': cluster
            }
        )

        cert, _ = Certification.objects.get_or_create(
            name='AWS Certified Solutions Architect',
            provider='Amazon Web Services',
            defaults={'target_cluster': cluster}
        )
        cert.skills.add(skill_python)

        # ----------------------------------------------------
        # TEST 1: SELF-REGISTRATION & AUTHENTICATION ALIASES
        # ----------------------------------------------------
        self.stdout.write("\n🔑 Testing Student Self-Registration (/api/auth/register/)...")
        # Clean up existing test user if present
        User.objects.filter(email='self_registered_student@auca.ac.rw').delete()
        
        reg_payload = {
            'email': 'self_registered_student@auca.ac.rw',
            'password': 'securepassword123',
            'full_name': 'Self Registered Student',
            'reg_number': 'TEST-REG-77777',
            'program_id': str(prog.id)
        }
        reg_res = client.post('/api/auth/register/', reg_payload, format='json')
        if reg_res.status_code != 201:
            self.stdout.write(self.style.ERROR(f"❌ Self-Registration failed! Status: {reg_res.status_code} | Errors: {reg_res.data}"))
            return
        self.stdout.write(self.style.SUCCESS(f"✅ Student successfully self-registered! Email: {reg_res.data['email']}"))

        # Test Login Alias
        self.stdout.write("🔑 Testing Login Alias Endpoint (/api/auth/login/)...")
        login_payload = {
            'email': 'self_registered_student@auca.ac.rw',
            'password': 'securepassword123'
        }
        login_res = client.post('/api/auth/login/', login_payload, format='json')
        if login_res.status_code != 200:
            self.stdout.write(self.style.ERROR(f"❌ Login alias failed! Status: {login_res.status_code}"))
            return
        tokens = login_res.data
        
        # Authenticate standard student for downstream profiles and skills testing
        auth_res = client.post('/api/token/', {'email': 'test_student_api@auca.ac.rw', 'password': 'studentpass123'}, format='json')
        if auth_res.status_code != 200:
            self.stdout.write(self.style.ERROR(f"❌ Default JWT Login failed! Status: {auth_res.status_code}"))
            return
        default_tokens = auth_res.data
        default_access_token = default_tokens['access']
        
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {default_access_token}')
        self.stdout.write(self.style.SUCCESS("✅ Self-Registration & Auth Aliases validated successfully!"))

        # ----------------------------------------------------
        # TEST 2: STUDENT PROFILE WRITING & AUDITING
        # ----------------------------------------------------
        self.stdout.write("\n📝 Testing Student Profile Update & Auditing...")
        profile_res = client.get('/api/profiles/me/')
        self.stdout.write(f"   Current GPA: {profile_res.data['gpa']}")
        
        # Perform patch update
        update_res = client.patch('/api/profiles/me/', {'gpa': 95.0, 'bio': 'Passionate builder'}, format='json')
        if update_res.status_code != 200:
            self.stdout.write(self.style.ERROR(f"❌ Profile Update failed! Status: {update_res.status_code}"))
            return
        
        # Verify Audit Log
        audit = AuditLog.objects.filter(user=student_user, action='profile_update').last()
        if not audit:
            self.stdout.write(self.style.ERROR("❌ AuditLog record not generated!"))
            return
        self.stdout.write(self.style.SUCCESS(f"✅ Student profile updated. Audit record logged! GPA change: {audit.details['gpa']}"))

        # ----------------------------------------------------
        # TEST 3: SKILLS AGGREGATOR (ADD, LIST, DELETE)
        # ----------------------------------------------------
        self.stdout.write("\n🚀 Testing Skills Aggregator (Add/List/Remove)...")
        # Add Django
        add_skill_res = client.post('/api/skills/my/', {'skill_id': str(skill_django.id), 'proficiency_level': 4}, format='json')
        if add_skill_res.status_code not in [200, 201]:
            self.stdout.write(self.style.ERROR(f"❌ Failed to add skill! Status: {add_skill_res.status_code}"))
            return
        
        # List skills
        list_skills_res = client.get('/api/skills/my/')
        my_skill_names = [s['skill']['name'] for s in list_skills_res.data]
        if 'Django' not in my_skill_names:
            self.stdout.write(self.style.ERROR("❌ Added skill not found in skills list!"))
            return
        self.stdout.write(self.style.SUCCESS(f"✅ Skill added successfully. List contains: {my_skill_names}"))

        # Delete skill
        del_skill_res = client.delete(f'/api/skills/{skill_django.id}/my-delete/')
        if del_skill_res.status_code != 204:
            self.stdout.write(self.style.ERROR(f"❌ Failed to delete skill! Status: {del_skill_res.status_code}"))
            return
        self.stdout.write(self.style.SUCCESS("✅ Skill deleted successfully."))

        # ----------------------------------------------------
        # TEST 4: CERTIFICATION TRACKING (ENROLL & COMPLETE)
        # ----------------------------------------------------
        self.stdout.write("\n🎓 Testing Certification Pathway Tracking...")
        # Enroll (Planning)
        enroll_res = client.post('/api/certifications/my/', {'cert_id': str(cert.id), 'status': 'Planning'}, format='json')
        if enroll_res.status_code not in [200, 201]:
            self.stdout.write(self.style.ERROR(f"❌ Certification enrollment failed! Status: {enroll_res.status_code}"))
            return
        self.stdout.write(self.style.SUCCESS(f"✅ Enrolled in certification. Current Status: {enroll_res.data['status']}"))

        # Mark completed
        update_cert_res = client.patch(f'/api/certifications/{cert.id}/my-update/', {'status': 'Completed', 'completion_date': '2026-05-17'}, format='json')
        if update_cert_res.status_code != 200:
            self.stdout.write(self.style.ERROR(f"❌ Certification status update failed! Status: {update_cert_res.status_code}"))
            return
        self.stdout.write(self.style.SUCCESS(f"✅ Certification completed. Completion Date: {update_cert_res.data['completion_date']}"))

        # ----------------------------------------------------
        # TEST 5: INTELLIGENT INTERNSHIP MATCHING & APPLYING
        # ----------------------------------------------------
        self.stdout.write("\n💼 Testing Internship AI-Sorting & Applications...")
        # Match sorted internships
        intern_res = client.get('/api/internships/?matched=true')
        if intern_res.status_code != 200:
            self.stdout.write(self.style.ERROR(f"❌ Internships fetch failed! Status: {intern_res.status_code}"))
            return
        intern_results = intern_res.data.get('results', intern_res.data)
        self.stdout.write(self.style.SUCCESS(f"✅ Fetched sorted internships. Highest Match: {intern_results[0]['match_percentage']}%"))

        # Submit job application
        app_res = client.post('/api/applications/', {'internship_id': str(internship.id)}, format='json')
        if app_res.status_code not in [200, 201]:
            self.stdout.write(self.style.ERROR(f"❌ Internship application failed! Status: {app_res.status_code}"))
            return
        self.stdout.write(self.style.SUCCESS(f"✅ Submitted internship application! Current Status: {app_res.data['status']}"))

        # ----------------------------------------------------
        # TEST 6: ADVISOR OVERSIGHT PANEL & RBAC
        # ----------------------------------------------------
        self.stdout.write("\n👨‍🏫 Testing Advisor Student Dashboard & RBAC...")
        # Check student access block
        adv_fail_res = client.get('/api/advisors/students/')
        if adv_fail_res.status_code != 403:
            self.stdout.write(self.style.ERROR("❌ Security leak: Student was allowed to access Advisor panel!"))
            return
        self.stdout.write("   Student block verified (Status: 403 Forbidden)")

        # Log in as Advisor
        adv_auth_res = client.post('/api/token/', {'email': 'test_advisor_api@auca.ac.rw', 'password': 'advisorpass123'}, format='json')
        adv_access = adv_auth_res.data['access']
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {adv_access}')

        # Query advisor dashboard
        adv_success_res = client.get('/api/advisors/students/')
        if adv_success_res.status_code != 200:
            self.stdout.write(self.style.ERROR(f"❌ Advisor student list failed! Status: {adv_success_res.status_code}"))
            return
        adv_results = adv_success_res.data.get('results', adv_success_res.data)
        self.stdout.write(self.style.SUCCESS(f"✅ Advisor student panel works! Audited {len(adv_results)} students successfully!"))

        # ----------------------------------------------------
        # TEST 7: PASSWORD UPDATE & RE-AUTHENTICATION
        # ----------------------------------------------------
        self.stdout.write("\n🔑 Testing Password Update & Re-authentication...")
        # Re-authenticate as student using access token captured during Test 1 setup
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {default_access_token}')
        
        # Change password to new password
        pw_payload = {
            'old_password': 'studentpass123',
            'new_password': 'newstudentpass456'
        }
        pw_res = client.post('/api/auth/password-update/', pw_payload, format='json')
        if pw_res.status_code != 200:
            self.stdout.write(self.style.ERROR(f"❌ Password update request failed! Status: {pw_res.status_code} | Errors: {pw_res.data}"))
            return
        self.stdout.write(self.style.SUCCESS("✅ Password updated successfully!"))

        # Confirm we can log in with new password
        login_res = client.post('/api/auth/login/', {'email': 'test_student_api@auca.ac.rw', 'password': 'newstudentpass456'}, format='json')
        if login_res.status_code != 200:
            self.stdout.write(self.style.ERROR("❌ Login with new password failed!"))
            return
        new_token = login_res.data['access']
        self.stdout.write(self.style.SUCCESS("✅ Successfully authenticated with the updated password!"))

        # Revert password to standard password for subsequent tests
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_token}')
        revert_payload = {
            'old_password': 'newstudentpass456',
            'new_password': 'studentpass123'
        }
        revert_res = client.post('/api/auth/password-update/', revert_payload, format='json')
        if revert_res.status_code != 200:
            self.stdout.write(self.style.ERROR("❌ Failed to revert password back to original!"))
            return
        self.stdout.write(self.style.SUCCESS("✅ Reverted test password back to original successfully."))
        
        self.stdout.write(self.style.SUCCESS("\n🎉 ALL E2E EMMERENCE INTEGRATION TESTS COMPLETED SUCCESSFULLY! PERFECT Handshake!"))
