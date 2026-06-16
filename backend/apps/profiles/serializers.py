from rest_framework import serializers
import logging
from apps.profiles.models import Student, WorkExperience
from apps.skills.models import StudentSkill, Skill, StudentCertification

logger = logging.getLogger(__name__)


class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = ['id', 'company', 'role', 'duration', 'description']
        read_only_fields = ['id']


class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    verified_competency_skills = serializers.SerializerMethodField()
    certifications = serializers.SerializerMethodField()
    transcript_uploaded = serializers.SerializerMethodField()
    work_experiences = WorkExperienceSerializer(many=True, read_only=True)
    profile_strength = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'reg_number', 'full_name', 'gpa', 'program', 'current_year',
            'skills', 'verified_competency_skills', 'certifications',
            'transcript_uploaded', 'bio',
            # New personal information fields
            'email', 'phone_number', 'date_of_birth', 'profile_photo_url',
            # New academic information fields
            'institution_name', 'expected_graduation', 'courses_completed',
            # New career interest fields
            'career_goals', 'preferred_industries', 'extracurricular_activities',
            # Nested relations
            'work_experiences', 'profile_strength',
            # Transcript text (for display)
            'transcript_text',
        ]
        read_only_fields = ['id', 'reg_number']

    program = serializers.CharField(source='program.name', read_only=True)
    skills = serializers.SerializerMethodField()

    def get_skills(self, obj):
        return [
            {
                'id': student_skill.skill.id,
                'name': student_skill.skill.name,
                'proficiency_level': student_skill.proficiency_level,
            }
            for student_skill in obj.student_skills.select_related('skill').all()
        ]

    def get_verified_competency_skills(self, obj):
        try:
            if obj.program:
                return [
                    {'id': skill.id, 'name': skill.name, 'category': skill.category}
                    for skill in obj.program.program_skills.all()
                ]
        except Exception as e:
            logger.error(f"Error fetching verified competency skills: {e}")
        return []

    def get_certifications(self, obj):
        try:
            student_certs = StudentCertification.objects.filter(
                student=obj
            ).select_related('cert', 'cert__target_cluster')
            return [
                {
                    'id': sc.id,
                    'name': sc.cert.name,
                    'provider': sc.cert.provider,
                    'status': sc.status,
                    'completion_date': sc.completion_date,
                    'target_cluster': sc.cert.target_cluster.name if sc.cert.target_cluster else None,
                }
                for sc in student_certs
            ]
        except Exception as e:
            logger.error(f"Error fetching certifications: {e}")
        return []

    def get_transcript_uploaded(self, obj):
        return bool(obj.transcript_text)

    def get_profile_strength(self, obj):
        """
        Computes a multi-category profile completeness percentage.
        Each category has a weight and checks specific fields for non-empty values.
        """
        def field_filled(value):
            """Check if a field has a meaningful non-empty value."""
            if value is None:
                return False
            if isinstance(value, str) and not value.strip():
                return False
            return True

        # --- Personal Info (20%) ---
        personal_fields = [
            field_filled(obj.full_name),
            field_filled(getattr(obj.user, 'email', None)),
            field_filled(obj.phone_number),
            field_filled(obj.date_of_birth),
        ]
        personal_pct = int((sum(personal_fields) / len(personal_fields)) * 100)

        # --- Academic Data (25%) ---
        academic_fields = [
            field_filled(obj.institution_name),
            field_filled(obj.reg_number),
            obj.program is not None,
            obj.gpa is not None and obj.gpa > 0,
            obj.current_year is not None and obj.current_year > 0,
            field_filled(obj.expected_graduation),
        ]
        academic_pct = int((sum(academic_fields) / len(academic_fields)) * 100)

        # --- Skills & Certs (25%) ---
        has_skills = obj.student_skills.exists()
        has_certs = StudentCertification.objects.filter(student=obj).exists()
        has_transcript = bool(obj.transcript_text)
        skills_fields = [has_skills, has_certs, has_transcript]
        skills_pct = int((sum(skills_fields) / len(skills_fields)) * 100)

        # --- Work Experience (15%) ---
        has_experience = obj.work_experiences.exists()
        experience_pct = 100 if has_experience else 0

        # --- Career Interests (15%) ---
        career_fields = [
            field_filled(obj.preferred_industries),
            field_filled(obj.career_goals),
        ]
        career_pct = int((sum(career_fields) / len(career_fields)) * 100)

        # Weighted total
        total = int(
            (personal_pct * 0.20) +
            (academic_pct * 0.25) +
            (skills_pct * 0.25) +
            (experience_pct * 0.15) +
            (career_pct * 0.15)
        )

        return {
            'total': total,
            'personal_info': personal_pct,
            'academic_data': academic_pct,
            'skills_certs': skills_pct,
            'experience': experience_pct,
            'career_interests': career_pct,
        }

    def validate_gpa(self, value):
        if value is not None and not (0.0 <= value <= 100.0):
            raise serializers.ValidationError("GPA must be between 0.0 and 100.0.")
        return value

    def validate_current_year(self, value):
        if value is not None and not (1 <= value <= 7):
            raise serializers.ValidationError("Current year must be between 1 and 7.")
        return value
