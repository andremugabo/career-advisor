from rest_framework import serializers
from apps.internships.models import Internship

class InternshipSerializer(serializers.ModelSerializer):
    cluster_name = serializers.CharField(source='cluster.name', read_only=True)
    match_percentage = serializers.FloatField(read_only=True, default=0.0)

    class Meta:
        model = Internship
        fields = ['id', 'company_name', 'role_name', 'requirements', 'deadline', 'cluster', 'cluster_name', 'match_percentage']
