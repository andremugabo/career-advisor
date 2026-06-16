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
    
    date_applied = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = ['id', 'internship_id', 'internship', 'student_name', 'status', 'created_at', 'date_applied', 'match_score']
        read_only_fields = ['id', 'status', 'created_at']

    def get_date_applied(self, obj):
        return obj.created_at.isoformat() if getattr(obj, 'created_at', None) else None

    def get_match_score(self, obj):
        return getattr(obj, 'match_score', None)
