from rest_framework import serializers
from apps.profiles.models import Student
from apps.skills.models import StudentSkill

class StudentProfileSerializer(serializers.ModelSerializer):
    program = serializers.CharField(source='program.name', read_only=True)
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'reg_number', 'full_name', 'gpa', 'program', 'current_year', 'skills', 'bio']
        read_only_fields = ['id', 'reg_number']

    def get_skills(self, obj):
        return [student_skill.skill.name for student_skill in obj.student_skills.select_related('skill').all()]

    def validate_gpa(self, value):
        if value is not None and not (0.0 <= value <= 100.0):
            raise serializers.ValidationError("GPA must be between 0.0 and 100.0.")
        return value

    def validate_current_year(self, value):
        if value is not None and not (1 <= value <= 7):
            raise serializers.ValidationError("Current year must be between 1 and 7.")
        return value
