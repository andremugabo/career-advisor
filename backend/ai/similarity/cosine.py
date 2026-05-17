import math

class CosineSimilarity:
    @staticmethod
    def calculate(vec_a, vec_b):
        """
        Calculates the cosine similarity between two sparse vectors (dictionaries).
        vec_a: dict mapping feature -> weight
        vec_b: dict mapping feature -> weight
        
        Returns:
            float: A value between 0.0 and 1.0 representing the similarity score.
        """
        # Find intersecting keys (skills present in both student and career)
        intersection = set(vec_a.keys()) & set(vec_b.keys())
        
        # Calculate dot product
        dot_product = sum([vec_a[x] * vec_b[x] for x in intersection])
        
        # Calculate magnitudes
        mag_a = math.sqrt(sum([val**2 for val in vec_a.values()]))
        mag_b = math.sqrt(sum([val**2 for val in vec_b.values()]))
        
        if not mag_a or not mag_b:
            return 0.0
            
        return float(dot_product) / (mag_a * mag_b)
