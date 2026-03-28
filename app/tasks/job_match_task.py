from crewai import Task

def get_job_match_task(agent, resume_data, job_description):
    return Task(
        description=f"""
        Compare the candidate profile with the job description.

        Candidate:
        {resume_data}

        Job Description:
        {job_description}

        Return ONLY valid JSON:

        {{
            "match_score": (0-100),
            "matching_skills": [],
            "missing_skills": [],
            "summary": ""
        }}
        """,
        expected_output="Valid JSON only",
        agent=agent
    )