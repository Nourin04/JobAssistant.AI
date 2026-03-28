from crewai import Agent

def get_cover_letter_generator():
    return Agent(
        role="Cover Letter Generator",
        goal="Generate personalized and professional cover letters based on candidate profile and job description",
        backstory=(
            "You are an expert career assistant who writes compelling cover letters "
            "tailored to specific job roles."
        ),
        llm="groq/llama-3.1-8b-instant",
        verbose=True
    )