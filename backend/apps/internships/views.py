from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from apps.internships.models import Internship
from apps.profiles.models import Student
from apps.internships.serializers import InternshipSerializer
from ai.recommenders.career_recommender import CareerRecommender
from apps.users.views import IsAdminOrReadOnly

class InternshipViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = InternshipSerializer
    queryset = Internship.objects.all().order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Check if intelligent sorting is requested
        matched = request.query_params.get('matched', None) or request.GET.get('matched', None)
        if matched == 'true':
            try:
                student = Student.objects.get(user=request.user)
                # Retrieve career recommendation scores for the student
                recs = CareerRecommender.get_recommendations(student, top_n=500)
                # Map career cluster IDs to their calculated similarity percentages
                rec_map = {rec['career_id']: rec['match_percentage'] for rec in recs}
                
                internships_list = []
                for internship in queryset:
                    # Look up calculated compatibility score
                    score = rec_map.get(internship.cluster_id, 0.0)
                    internship.match_percentage = score
                    internships_list.append(internship)
                
                # Sort by highest compatibility matching percentage
                internships_list.sort(key=lambda x: x.match_percentage, reverse=True)
                
                page = self.paginate_queryset(internships_list)
                if page is not None:
                    serializer = self.get_serializer(page, many=True)
                    return self.get_paginated_response(serializer.data)
                    
                serializer = self.get_serializer(internships_list, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Student.DoesNotExist:
                return Response(
                    {"error": "Student profile not found. Please set up your profile first."},
                    status=status.HTTP_404_NOT_FOUND
                )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
