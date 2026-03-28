from crewai import Task

def get_cover_letter_task(agent, resume_data, job_description):
    return Task(
        description=f"""
        Generate a professional cover letter using the candidate information and job description.

        Candidate:
        {resume_data}

        Job Description:
        {job_description}

        Requirements:
- Length MUST be between 100-120 words (strict)
- Start with a strong, non-generic opening (no "I am writing to express")
- WRITE ENTIRELY IN THE FIRST PERSON ("I", "my", "me"). NEVER use the third person ("he", "she", "the candidate").
- Sign off the letter with the candidate's name exactly as provided: {resume_data.get("name")}
- Do NOT invent or modify the name
- Do NOT use placeholders like [Your Name]
- Highlight 2–3 key achievements with measurable impact (numbers preferred)
- Mention specific projects (e.g., RAG systems, LLMs, deployments)
- Avoid listing too many technologies
- Focus on real-world applications and outcomes
- Maintain a confident and professional tone
- End with a short, strong closing (1–2 lines max)
- Avoid repeating words like "impact", "innovation", or "excited" multiple times
- Use double newlines (\n\n) between paragraphs for readability.
        """,
        expected_output="A professional cover letter",
        agent=agent
    )