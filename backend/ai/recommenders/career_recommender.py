from apps.careers.models import CareerCluster
from ai.similarity.vectorizer import StudentVectorizer, CareerVectorizer
from ai.similarity.cosine import CosineSimilarity

class CareerRecommender:
    @staticmethod
    def get_recommendations(student, top_n=5):
        """
        Calculates career recommendations for a student based on their skills.
        Returns a list of dicts with career cluster details, match percentage, and missing skills.
        """
        # Vectorize the student
        student_vec = StudentVectorizer.vectorize(student)
        
        if not student_vec:
            return []
            
        student_skills_set = set(student_vec.keys())
        
        all_careers = CareerCluster.objects.all()
        matches = []
        
        for career in all_careers:
            # Skip if no required skills
            career_vec = CareerVectorizer.vectorize(career)
            if not career_vec:
                continue
                
            similarity_score = CosineSimilarity.calculate(student_vec, career_vec)
            
            # We only care about careers where there is some overlap
            if similarity_score > 0:
                # Calculate missing skills (skill gap)
                career_skills_set = set(career_vec.keys())
                missing_skills = list(career_skills_set - student_skills_set)
                
                matches.append({
                    'career_id': career.id,
                    'onet_code': career.onet_code,
                    'title': career.name,
                    'match_percentage': round(similarity_score * 100, 2),
                    'missing_skills': missing_skills[:10], # Cap at 10 to avoid huge payloads
                    'total_missing': len(missing_skills)
                })
                
        # Sort by highest match percentage
        matches.sort(key=lambda x: x['match_percentage'], reverse=True)
        
        return matches[:top_n]
