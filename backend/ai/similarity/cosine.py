import math

class CosineSimilarity:
    @staticmethod
    def calculate(vec_a, vec_b):
        """
        Calculates an overlap-aware similarity between two sparse vectors.
        vec_a: dict mapping feature -> weight (Student)
        vec_b: dict mapping feature -> weight (Career)
        """
        if not vec_a or not vec_b:
            return 0.0

        intersection = set(vec_a.keys()) & set(vec_b.keys())
        if not intersection:
            return 0.0
        
        # Standard dot product of overlapping skills
        dot_product = sum([vec_a[x] * vec_b[x] for x in intersection])
        
        # Calculate magnitude of ONLY the student's skills that apply to this career
        # This prevents penalizing the student for having extra skills
        mag_a_relevant = math.sqrt(sum([vec_a[x]**2 for x in intersection]))
        mag_b = math.sqrt(sum([val**2 for val in vec_b.values()]))
        
        if not mag_a_relevant or not mag_b:
            return 0.0
            
        base_cosine = float(dot_product) / (mag_a_relevant * mag_b)
        
        # Multiply by coverage (percentage of required skills the student possesses)
        # to ensure careers where the student only knows 1 out of 10 skills don't get 100%
        coverage = len(intersection) / len(vec_b)
        
        return base_cosine * coverage
