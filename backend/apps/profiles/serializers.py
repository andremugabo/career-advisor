from rest_framework import serializers
from apps.profiles.models import Student
from apps.skills.models import StudentSkill

class StudentProfileSerializer(serializers.ModelSerializer):
    program = serializers.CharField(source='program.name', read_only=True)
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'reg_number', 'full_name', 'gpa', 'program', 'current_year', 'skills', 'bio']

    def get_skills(self, obj):
        return [student_skill.skill.name for student_skill in obj.student_skills.select_related('skill').all()]
