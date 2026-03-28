from crewai import Agent

def get_job_matcher():
    return Agent(
        role="Job Matcher",
        goal="Compare candidate resumes with job descriptions and evaluate suitability",
        backstory=(
            "You are an expert AI recruiter. You analyze resumes and job descriptions "
            "to determine how well a candidate fits a role."
        ),
        llm="groq/llama-3.1-8b-instant",
        verbose=True
    )