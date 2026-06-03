from rest_framework import serializers
from .models import CareerCluster, CareerAssessment, AssessmentResponse, FavoriteCareer

class CareerClusterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerCluster
        fields = '__all__'

class CareerAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerAssessment
        fields = '__all__'

class AssessmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResponse
        fields = '__all__'
        read_only_fields = ('student', 'score_profile')

class FavoriteCareerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteCareer
        fields = '__all__'
        read_only_fields = ('student',)
