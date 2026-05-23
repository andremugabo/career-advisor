from rest_framework import serializers
from apps.profiles.models import Student
from apps.advisors.models import StudentIntervention
from ai.recommenders.career_recommender import CareerRecommender

class AdvisorStudentProfileSerializer(serializers.ModelSerializer):
    program = serializers.CharField(source='program.name', read_only=True)
    skills = serializers.SerializerMethodField()
    top_recommendations = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'reg_number', 'full_name', 'gpa', 'program', 'current_year', 'bio', 'skills', 'top_recommendations']

    def get_skills(self, obj):
        return [student_skill.skill.name for student_skill in obj.student_skills.select_related('skill').all()]

    def get_top_recommendations(self, obj):
        # Dynamically retrieve top 3 career recommendations for this student
        return CareerRecommender.get_recommendations(obj, top_n=3)


class StudentInterventionSerializer(serializers.ModelSerializer):
    advisor_email = serializers.EmailField(source='advisor.user.email', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = StudentIntervention
        fields = ['id', 'advisor', 'advisor_email', 'student', 'student_name', 'intervention_type', 'notes', 'created_at']
        read_only_fields = ['advisor', 'created_at']

