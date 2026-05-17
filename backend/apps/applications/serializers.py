from rest_framework import serializers
from apps.applications.models import Application
from apps.internships.serializers import InternshipSerializer
from apps.internships.models import Internship

class ApplicationSerializer(serializers.ModelSerializer):
    internship_id = serializers.PrimaryKeyRelatedField(
        queryset=Internship.objects.all(), source='internship', write_only=True
    )
    internship = InternshipSerializer(read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'internship_id', 'internship', 'student_name', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']
