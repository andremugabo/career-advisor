from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CareerCluster, CareerAssessment, AssessmentResponse, FavoriteCareer
from .serializers import (
    CareerClusterSerializer, CareerAssessmentSerializer, 
    AssessmentResponseSerializer, FavoriteCareerSerializer
)
from apps.profiles.models import Student

class CareerAssessmentViewSet(viewsets.ModelViewSet):
    queryset = CareerAssessment.objects.all()
    serializer_class = CareerAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_assessment(self, request, pk=None):
        assessment = self.get_object()
        user = request.user
        try:
            student = Student.objects.get(user=user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
            
        answers = request.data.get('answers', {})
        # Simple dummy logic for score profile
        score_profile = {k: len(v)*10 for k,v in answers.items()} if isinstance(answers, dict) else {}
        
        response_obj = AssessmentResponse.objects.create(
            student=student,
            assessment=assessment,
            answers=answers,
            score_profile=score_profile
        )
        
        return Response(AssessmentResponseSerializer(response_obj).data, status=status.HTTP_201_CREATED)


class CareerClusterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CareerCluster.objects.all().order_by('name')
    serializer_class = CareerClusterSerializer
    permission_classes = [permissions.IsAuthenticated]


class FavoriteCareerViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteCareerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoriteCareer.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        try:
            student = Student.objects.get(user=self.request.user)
            serializer.save(student=student)
        except Student.DoesNotExist:
            pass


class CompareCareersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        career1_id = request.query_params.get('career1')
        career2_id = request.query_params.get('career2')
        
        if not career1_id or not career2_id:
            return Response({"error": "Please provide career1 and career2 ids"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            c1 = CareerCluster.objects.get(id=career1_id)
            c2 = CareerCluster.objects.get(id=career2_id)
        except CareerCluster.DoesNotExist:
            return Response({"error": "One or both careers not found"}, status=status.HTTP_404_NOT_FOUND)
            
        return Response({
            "career1": CareerClusterSerializer(c1).data,
            "career2": CareerClusterSerializer(c2).data,
            "comparison": {
                "shared_skills": list(set(c1.required_skills.keys()) & set(c2.required_skills.keys())),
                "unique_to_c1": list(set(c1.required_skills.keys()) - set(c2.required_skills.keys())),
                "unique_to_c2": list(set(c2.required_skills.keys()) - set(c1.required_skills.keys())),
            }
        }, status=status.HTTP_200_OK)


class CareerPathVisualizationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Returns generic career progression data for visualization
        career_id = request.query_params.get('career_id')
        if not career_id:
            return Response({"error": "career_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        data = {
            "career_id": career_id,
            "path_stages": [
                {"stage": "Entry Level", "duration_years": 1.5, "salary_est": 40000},
                {"stage": "Mid Level", "duration_years": 3, "salary_est": 70000},
                {"stage": "Senior Level", "duration_years": 5, "salary_est": 110000},
            ]
        }
        return Response(data, status=status.HTTP_200_OK)
