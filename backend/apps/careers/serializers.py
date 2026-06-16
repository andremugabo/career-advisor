from rest_framework import serializers
from .models import CareerCluster, CareerAssessment, AssessmentResponse, FavoriteCareer

class CareerClusterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerCluster
        fields = '__all__'

class CareerAssessmentSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True, max_length=255)
    description = serializers.CharField(required=True)
    questions = serializers.ListField(child=serializers.DictField(), required=True)

    class Meta:
        model = CareerAssessment
        fields = ('id', 'title', 'description', 'questions', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class AssessmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResponse
        fields = '__all__'
        read_only_fields = ('student', 'score_profile')

class FavoriteCareerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    career = CareerClusterSerializer(read_only=True)
    saved_at = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = FavoriteCareer
        fields = ('id', 'career', 'saved_at')
        read_only_fields = ('student',)
