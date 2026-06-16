from rest_framework import serializers
from apps.recommendations.models import MatchResult
from apps.careers.models import CareerCluster
from apps.skills.models import Certification

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'name', 'provider']

class CareerClusterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerCluster
        fields = ['id', 'onet_code', 'name', 'description']

class MatchResultSerializer(serializers.ModelSerializer):
    cluster = CareerClusterSerializer(read_only=True)
    
    class Meta:
        model = MatchResult
        fields = ['id', 'cluster', 'match_score', 'confidence', 'timestamp']

class CareerRecommendationSerializer(serializers.Serializer):
    career_name = serializers.CharField(source='title')
    career_id = serializers.IntegerField()
    onet_code = serializers.CharField()
    title = serializers.CharField()
    match_percentage = serializers.FloatField()
    missing_skills = serializers.ListField(child=serializers.CharField())
    total_missing = serializers.IntegerField()
    recommended_certs = CertificationSerializer(many=True, default=list)
    required_education = serializers.CharField(required=False, allow_null=True)
    work_experience = serializers.CharField(required=False, allow_null=True)
    on_the_job_training = serializers.CharField(required=False, allow_null=True)


