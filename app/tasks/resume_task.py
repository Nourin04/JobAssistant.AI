from crewai import Task

def get_resume_task(agent, resume_text):
    return Task(
        description=f"""
        Analyze the following resume and extract structured information.

        Resume:
        {resume_text}

        You MUST return ONLY valid JSON.

        Rules:
        - Do NOT include any explanation
        - Do NOT include text before or after JSON
        - Do NOT use markdown (no ```json)
        - Ensure proper quotes and commas

        Format:

        {{
            "name": "",
            "skills": [],
            "experience": [],
            "education": [],
            "projects": []
        }}
        """,
        expected_output="Strict JSON only",
        agent=agent
    )