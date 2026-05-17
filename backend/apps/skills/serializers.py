from rest_framework import serializers
from apps.skills.models import Skill, StudentSkill, Certification, StudentCertification
from apps.careers.models import CareerCluster

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category']

class StudentSkillSerializer(serializers.ModelSerializer):
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), source='skill', write_only=True
    )
    skill = SkillSerializer(read_only=True)

    class Meta:
        model = StudentSkill
        fields = ['id', 'skill_id', 'skill', 'proficiency_level']

    def validate_proficiency_level(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Proficiency level must be between 1 and 5.")
        return value

class CertificationSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    target_cluster_name = serializers.CharField(source='target_cluster.name', read_only=True)

    class Meta:
        model = Certification
        fields = ['id', 'name', 'provider', 'target_cluster', 'target_cluster_name', 'skills']

class StudentCertificationSerializer(serializers.ModelSerializer):
    cert_id = serializers.PrimaryKeyRelatedField(
        queryset=Certification.objects.all(), source='cert', write_only=True
    )
    cert = CertificationSerializer(read_only=True)

    class Meta:
        model = StudentCertification
        fields = ['id', 'cert_id', 'cert', 'status', 'completion_date']

    def validate(self, attrs):
        status = attrs.get('status')
        completion_date = attrs.get('completion_date')
        if status == 'Completed' and not completion_date:
            raise serializers.ValidationError({"completion_date": "Completion date is required when status is Completed."})
        return attrs
