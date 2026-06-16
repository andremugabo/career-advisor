from apps.careers.models import CareerCluster
from ai.similarity.vectorizer import StudentVectorizer, CareerVectorizer, tokenize, expand_tokens, STOP_WORDS
from ai.similarity.cosine import CosineSimilarity

# Words that are too generic to be meaningful "missing skills" for a student
NOISE_TOKENS = {
    'computer', 'computers', 'laptop', 'laptops', 'desktop', 'printer',
    'printers', 'telephone', 'phones', 'scanner', 'scanners', 'tablet',
    'tablets', 'personal', 'laser', 'inkjet', 'multi', 'line', 'two',
    'way', 'radio', 'radios', 'fax', 'machine', 'machines', 'device',
    'devices', 'terminal', 'terminals', 'key', 'keys', 'server', 'servers',
    'network', 'networks', 'cable', 'cables', 'input', 'output',
    'maintrame', 'mainframe', 'appliance', 'appliances', 'general',
    'special', 'standard', 'basic', 'advanced', 'other', 'various',
    'digital', 'electronic', 'electric', 'portable', 'handheld',
}


class CareerRecommender:
    @staticmethod
    def get_recommendations(student, top_n=5):
        """
        Calculates career recommendations for a student based on their keyword-bag profile.

        Matching strategy:
          1. Cosine similarity between student keyword-bag and career keyword-bag
          2. Academic program domain boost (up to +40%) for careers whose name/domain
             aligns with the student's degree program — uses the same domain expansion
             as the vectorizer so "finance" correctly matches "financial"
          3. Results are sorted by boosted score; missing skills strip out noise tokens
        """
        # Vectorize the student
        student_vec = StudentVectorizer.vectorize(student)

        if not student_vec:
            return []

        student_tokens = set(student_vec.keys())

        # Pre-compute program domain tokens for the boost step
        program_domain_tokens = set()
        if student.program and student.program.name:
            program_domain_tokens = expand_tokens(tokenize(student.program.name))

        all_careers = CareerCluster.objects.all()
        matches = []

        for career in all_careers:
            career_vec = CareerVectorizer.vectorize(career)
            if not career_vec:
                continue

            similarity_score = CosineSimilarity.calculate(student_vec, career_vec)

            # Only consider careers with meaningful overlap
            if similarity_score > 0:
                # --- Academic Program Domain Boost ---
                # Uses domain-expanded tokens so "finance" matches "financial", etc.
                if program_domain_tokens:
                    career_name_tokens = expand_tokens(tokenize(career.name))
                    # Ignore purely generic tokens in the overlap check
                    meaningful_program = program_domain_tokens - STOP_WORDS - NOISE_TOKENS
                    meaningful_career  = career_name_tokens   - STOP_WORDS - NOISE_TOKENS
                    overlap = meaningful_program & meaningful_career
                    if overlap:
                        # Up to 40% boost for strong domain alignment
                        boost = min(0.4, len(overlap) * 0.15)
                        similarity_score *= (1.0 + boost)

                # Build meaningful missing skills list — skip noise tokens
                career_tokens = set(career_vec.keys())
                raw_missing = career_tokens - student_tokens
                missing_skills = sorted([
                    t for t in raw_missing
                    if t not in NOISE_TOKENS and t not in STOP_WORDS and len(t) > 3
                ])

                final_percentage = min(round(similarity_score * 100, 2), 100.0)

                matches.append({
                    'career_id': career.id,
                    'onet_code': career.onet_code,
                    'title': career.name,
                    'match_percentage': final_percentage,
                    'missing_skills': missing_skills[:10],
                    'total_missing': len(missing_skills),
                })

        # Sort by highest match percentage
        matches.sort(key=lambda x: x['match_percentage'], reverse=True)

        return matches[:top_n]
