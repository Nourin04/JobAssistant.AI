from crewai import Agent

def get_resume_analyzer():
    return Agent(
        role="Resume Analyzer",
        goal="Extract structured information from resumes including skills, experience, education, and projects",
        backstory=(
            "You are an expert HR AI system that analyzes resumes with high accuracy. "
            "You extract key details and present them in a structured format."
        ),
        verbose=True
    )