class StudentVectorizer:
    @staticmethod
    def vectorize(student):
        """
        Converts a Student's profile (skills and proficiency) into a normalized sparse vector (dictionary).
        Keys are lowercased skill names, values are the proficiency levels.
        """
        vector = {}
        # Get all StudentSkill instances for this student
        student_skills = student.student_skills.all()
        for ss in student_skills:
            if ss.skill and ss.skill.name:
                key = ss.skill.name.lower().strip()
                vector[key] = ss.proficiency_level
        return vector


class CareerVectorizer:
    @staticmethod
    def vectorize(career_cluster):
        """
        Converts a CareerCluster's required skills into a normalized sparse vector (dictionary).
        Since O*NET just lists skills as required, the weight is 1.
        Keys are lowercased skill names.
        """
        vector = {}
        req_skills = career_cluster.required_skills.get('skills', [])
        for skill_data in req_skills:
            name = skill_data.get('name', '')
            if name:
                key = name.lower().strip()
                vector[key] = 1 # Base weight for required skill
        return vector
