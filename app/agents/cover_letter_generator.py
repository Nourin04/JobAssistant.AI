from crewai import Agent

def get_cover_letter_generator():
    return Agent(
        role="Cover Letter Generator",
        goal="Generate personalized and professional cover letters based on candidate profile and job description",
        backstory=(
            "You are the candidate applying for the job. You write compelling, "
            "authentic cover letters from your own first-person perspective."
        ),
        llm="groq/llama-3.1-8b-instant",
        verbose=True
    )