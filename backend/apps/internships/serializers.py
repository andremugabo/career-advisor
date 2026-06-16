from rest_framework import serializers
from apps.internships.models import Internship

class InternshipSerializer(serializers.ModelSerializer):
    cluster_name = serializers.CharField(source='cluster.name', read_only=True)
    match_percentage = serializers.FloatField(read_only=True, default=0.0)
    cluster = serializers.PrimaryKeyRelatedField(
        queryset=Internship.cluster.field.related_model.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Internship
        fields = ['id', 'title', 'company', 'location', 'type', 'description', 'requirements', 'url', 'is_active', 'deadline', 'cluster', 'cluster_name', 'match_percentage']
