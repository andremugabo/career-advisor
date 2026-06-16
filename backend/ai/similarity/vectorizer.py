"""
Vectorizer module for the Emmerence AI career matching engine.

Strategy: Keyword-Bag Vectorization
------------------------------------
The O*NET dataset stores career skills as Tools & Technology (T2) names
(e.g. "Financial calculators", "Laptop computers"). These do NOT match
abstract competency names like "Financial Analysis" verbatim.

To bridge this vocabulary gap, both the StudentVectorizer and CareerVectorizer
decompose their respective text sources into individual keyword tokens.
For example:
  - Student skill "Financial Analysis"  → tokens: {"financial", "analysis"}
  - Career tool  "Financial calculators" → tokens: {"financial", "calculators"}
  - Shared token "financial" creates a meaningful overlap signal.

Additional signals are layered on top:
  1. Academic program name keywords (boosted weight)
  2. Uploaded transcript text (highest weight — proven academic achievement)
"""

# Stop-words to ignore when tokenizing names
STOP_WORDS = {
    'and', 'or', 'the', 'in', 'of', 'to', 'a', 'an', 'for', 'with',
    'by', 'on', 'at', 'as', 'is', 'are', 'was', 'were', 'be', 'been',
    'bsc', 'bba', 'ba', 'bs', 'msc', 'mba', 'phd', 'degree',
    'equipment', 'systems', 'machines', 'devices', 'tools', 'software',
}

# Domain keyword expansions — ensures finance → financial, etc.
DOMAIN_EXPANSIONS = {
    'finance':      ['financial', 'finance', 'fiscal', 'monetary'],
    'financial':    ['financial', 'finance', 'fiscal'],
    'accounting':   ['accounting', 'accountancy', 'bookkeeping'],
    'investment':   ['investment', 'investing', 'portfolio'],
    'risk':         ['risk', 'compliance', 'regulatory'],
    'data':         ['data', 'analytics', 'analysis', 'statistical'],
    'analysis':     ['analysis', 'analytical', 'analytics'],
    'management':   ['management', 'managerial', 'leadership'],
    'software':     ['software', 'programming', 'coding', 'development'],
    'engineering':  ['engineering', 'technical', 'systems'],
    'computing':    ['computing', 'computer', 'computational'],
    'python':       ['python', 'programming', 'scripting'],
    'communication':['communication', 'interpersonal', 'presentation'],
    'corporate':    ['corporate', 'business', 'commercial'],
    'budgeting':    ['budgeting', 'budget', 'forecasting', 'planning'],
    'excel':        ['excel', 'spreadsheet', 'tabulation'],
    'reporting':    ['reporting', 'reports', 'documentation'],
    'counseling':   ['counseling', 'counselor', 'advisory', 'advising'],
    'tax':          ['tax', 'taxation', 'fiscal'],
    'audit':        ['audit', 'auditing', 'auditor'],
    'banking':      ['banking', 'bank', 'credit', 'lending'],
    'marketing':    ['marketing', 'market', 'branding', 'advertising'],
    'healthcare':   ['healthcare', 'health', 'medical', 'clinical'],
    'education':    ['education', 'teaching', 'instruction', 'training'],
    'legal':        ['legal', 'law', 'regulatory', 'compliance'],
    'research':     ['research', 'investigation', 'analysis', 'study'],
}


def tokenize(text: str) -> list[str]:
    """Split text into lowercase, filtered, meaningful tokens."""
    import re
    tokens = re.findall(r'[a-zA-Z]+', text.lower())
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 2]


def expand_tokens(tokens: list[str]) -> set[str]:
    """Expand tokens with domain-specific synonyms."""
    expanded = set(tokens)
    for token in tokens:
        if token in DOMAIN_EXPANSIONS:
            expanded.update(DOMAIN_EXPANSIONS[token])
    return expanded


class StudentVectorizer:
    @staticmethod
    def vectorize(student) -> dict:
        """
        Converts a Student's full profile into a weighted keyword-bag vector.

        Sources (in increasing weight order):
          1. Manually added StudentSkill records (proficiency 1-5)
          2. Academic program name keywords (base weight 2 per domain word)
          3. Academic program assigned skills (weight 3)
          4. Uploaded transcript text (weight 5 — highest, proven achievement)
        """
        vector = {}

        def add_tokens(tokens: set[str], weight: float):
            """Add each token to the vector, keeping the highest weight seen."""
            for token in tokens:
                if token not in vector or vector[token] < weight:
                    vector[token] = weight

        # --- 1. Student's manually added skills (proficiency 1-5) ---
        student_skills = student.student_skills.select_related('skill').all()
        for ss in student_skills:
            if ss.skill and ss.skill.name:
                tokens = expand_tokens(tokenize(ss.skill.name))
                # Weight = proficiency level directly
                add_tokens(tokens, float(ss.proficiency_level))

        # --- 2. Academic program name keywords (domain anchor) ---
        if student.program and student.program.name:
            prog_tokens = expand_tokens(tokenize(student.program.name))
            # Program domain keywords get weight 2 — they guide the direction
            add_tokens(prog_tokens, 2.0)

        # --- 3. Academic program's assigned competency skills ---
        if student.program:
            for skill in student.program.program_skills.all():
                if skill and skill.name:
                    tokens = expand_tokens(tokenize(skill.name))
                    # Program skills get solid weight 3 (above program name, below transcript)
                    add_tokens(tokens, 3.0)

        # --- 4. Transcript text analysis (proven academic achievement) ---
        if student.transcript_text:
            from apps.skills.models import Skill
            transcript_lower = student.transcript_text.lower()
            # Check all known skills against transcript text
            for skill_name in Skill.objects.values_list('name', flat=True):
                if skill_name and skill_name.lower() in transcript_lower:
                    tokens = expand_tokens(tokenize(skill_name))
                    add_tokens(tokens, 5.0)
            # Also extract transcript domain words directly
            transcript_tokens = expand_tokens(tokenize(transcript_lower[:5000]))
            # Transcript domain keywords get weight 2 (breadth signal)
            add_tokens(transcript_tokens, 2.0)

        return vector


class CareerVectorizer:
    @staticmethod
    def vectorize(career_cluster) -> dict:
        """
        Converts a CareerCluster into a keyword-bag vector.

        Sources:
          1. Career name tokens (weight 3 — primary domain signal)
          2. Required skills/tools names — each token gets weight 1
        """
        vector = {}

        def add_tokens(tokens: set[str], weight: float):
            for token in tokens:
                if token not in vector or vector[token] < weight:
                    vector[token] = weight

        # --- 1. Career name itself (strongest domain signal) ---
        if career_cluster.name:
            name_tokens = expand_tokens(tokenize(career_cluster.name))
            add_tokens(name_tokens, 3.0)

        # --- 2. Required skills / tools list ---
        req_skills = career_cluster.required_skills.get('skills', [])
        for skill_data in req_skills:
            name = skill_data.get('name', '')
            if name:
                tokens = expand_tokens(tokenize(name))
                add_tokens(tokens, 1.0)

        return vector
