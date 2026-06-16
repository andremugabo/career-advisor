from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CareerCluster, CareerAssessment, AssessmentResponse, FavoriteCareer
from apps.skills.models import Skill, StudentSkill
from .serializers import (
    CareerClusterSerializer,
    CareerAssessmentSerializer,
    AssessmentResponseSerializer,
    FavoriteCareerSerializer,
)
from apps.profiles.models import Student
from apps.audit.models import AuditLog

# ------------------------------
# Career Assessment Endpoints
# ------------------------------
class CareerAssessmentViewSet(viewsets.ModelViewSet):
    queryset = CareerAssessment.objects.all()
    serializer_class = CareerAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='submit')
    def submit_assessment_generic(self, request):
        """Accept a generic assessment submission.
        Expected payload: {"answers": {...}}
        """
        assessment = CareerAssessment.objects.first()
        if not assessment:
            return Response({"error": "No assessment template found."}, status=status.HTTP_404_NOT_FOUND)
        user = request.user
        try:
            student = Student.objects.get(user=user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        answers = request.data.get('answers', {})
        # Fix dummy scoring logic: answers contains integers, so use int(v) instead of len(v)
        try:
            score_profile = {str(k): int(v) * 10 for k, v in answers.items()} if isinstance(answers, dict) else {}
        except Exception:
            score_profile = {}
            
        response_obj = AssessmentResponse.objects.create(
            student=student,
            assessment=assessment,
            answers=answers,
            score_profile=score_profile,
        )
        
        # Map RIASEC questions to general tools/tech from the O*NET dataset 
        # so the cosine similarity actually finds overlaps
        skill_mapping = {
            'q1': ['claw hammers', 'power drills', 'measuring tapes', 'safety goggles', 'forklifts'],
            'q2': ['digital cameras', 'digital video cameras', 'digital storage oscilloscopes', 'auditory testing equipment'],
            'q3': ['digital cameras', 'desktop computers', 'laptop computers', 'photocopying equipment'],
            'q4': ['multi-line telephone systems', 'two way radios', 'desktop computers', 'laptop computers'],
            'q5': ['personal computers', 'multi-line telephone systems', 'laptop computers', 'personal digital assistants pda'],
            'q6': ['personal computers', 'photocopying equipment', 'laser facsimile machines', 'computer laser printers'],
            'q7': ['personal computers', 'desktop computers', 'laptop computers', 'tablet computers', 'notebook computers']
        }

        # Update or create StudentSkill entries based on submitted answers
        if isinstance(answers, dict):
            for question_id, proficiency in answers.items():
                try:
                    prof_int = int(proficiency)
                except (ValueError, TypeError):
                    prof_int = 1
                prof_int = max(1, min(prof_int, 5))
                
                # If question_id is in mapping, use those skills, otherwise use the key itself
                mapped_skills = skill_mapping.get(question_id, [str(question_id).strip()])
                
                for skill_name in mapped_skills:
                    try:
                        skill_obj, _ = Skill.objects.get_or_create(name=skill_name.lower())
                        StudentSkill.objects.update_or_create(
                            student=student,
                            skill=skill_obj,
                            defaults={'proficiency_level': prof_int}
                        )
                    except Exception:
                        # Silently ignore any skill creation errors
                        continue
        return Response(AssessmentResponseSerializer(response_obj).data, status=status.HTTP_201_CREATED)

# ------------------------------
# Career Cluster Endpoints
# ------------------------------
class CareerClusterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CareerCluster.objects.all().order_by('name')
    serializer_class = CareerClusterSerializer
    permission_classes = [permissions.IsAuthenticated]

# ------------------------------
# Favorite Career Endpoints
# ------------------------------
class FavoriteCareerViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteCareerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoriteCareer.objects.filter(student__user=self.request.user).select_related('career')

    def create(self, request, *args, **kwargs):
        """Toggle favorite: if it exists, remove it. If not, add it."""
        career_id = request.data.get('career_id')
        if not career_id:
            return Response({"error": "career_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            career = CareerCluster.objects.get(id=career_id)
        except CareerCluster.DoesNotExist:
            return Response({"error": "Career not found."}, status=status.HTTP_404_NOT_FOUND)

        # Toggle: if already favorited, remove it
        existing = FavoriteCareer.objects.filter(student=student, career=career).first()
        if existing:
            existing.delete()
            return Response({"status": "removed", "message": "Career removed from favorites."}, status=status.HTTP_200_OK)

        # Otherwise, add it
        favorite = FavoriteCareer.objects.create(student=student, career=career)
        serializer = self.get_serializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# ------------------------------
# Compare Careers Endpoint
# ------------------------------
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

# ------------------------------
# Assessment Response Endpoints
# ------------------------------
class AssessmentResponseViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return responses for the authenticated student's profile
        try:
            student = Student.objects.get(user=self.request.user)
        except Student.DoesNotExist:
            return AssessmentResponse.objects.none()
        return AssessmentResponse.objects.filter(student=student).order_by('-created_at')

    def perform_create(self, serializer):
        try:
            student = Student.objects.get(user=self.request.user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer.save(student=student)

# ------------------------------
# Career Path Visualization Endpoint
# ------------------------------
class CareerPathVisualizationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Return generic career progression data for visualization."""
        career_id = request.query_params.get('career_id')
        if not career_id:
            return Response({"error": "career_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        data = {
            "career_id": career_id,
            "path_stages": [
                {"stage": "Entry Level", "duration_years": 1.5, "salary_est": 40000},
                {"stage": "Mid Level", "duration_years": 3, "salary_est": 70000},
                {"stage": "Senior Level", "duration_years": 5, "salary_est": 110000},
            ],
        }
        return Response(data, status=status.HTTP_200_OK)
