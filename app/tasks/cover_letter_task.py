import datetime
from crewai import Task

def get_cover_letter_task(agent, resume_data, job_description):
    current_date = datetime.date.today().strftime("%B %d, %Y")
    candidate_name = resume_data.get("name", "Noureen AC")
    
    return Task(
        description=f"""
        Write a professional, highly targeted 200–250 word cover letter tailored specifically to the provided job description and candidate profile.

        Candidate Profile:
        {resume_data}

        Job Description:
        {job_description}

        Format Requirements:
        
        1. **Header Block**:
        Include this header block exactly at the very top:
        {candidate_name}
        Kozhikode, Kerala | noureenac25@gmail.com | LinkedIn | GitHub
        {current_date}
        
        Hiring Manager
        [Extract Company Name from Job Description, or use 'the company' if not specified]

        2. **Salutation**:
        Dear Hiring Manager,

        3. **Structure & Paragraphs**:
        Write 3 to 4 concise paragraphs following this flow:
        - **Paragraph 1 (Opening - 2–4 sentences)**: State the role and company you are applying to. Hook the reader by showing genuine interest in the company or their specific product/problem. Avoid generic clichés like "I am writing to express my interest in...".
        - **Paragraph 2 & 3 (Main Body - Why you are qualified)**: Directly connect 2-3 of the candidate's actual projects or work experiences (e.g. Intern work at IntPurple Technologies, projects like JobAssistant.AI or Talk2.AI, computer vision model training) to the core challenges mentioned in the job description. Emphasize actual outcomes or capabilities instead of listing generic tech stacks. Do NOT rewrite the resume.
        - **Paragraph 4 (Closing)**: Explain why you want to join this specific team/company and how you can contribute. End with a polite, proactive call to action for an interview.
        - **Sign-off**: End with 'Kind regards,' followed by '{candidate_name}'.

        Strict Quality Guidelines:
        - **Word Count**: Keep it between 200 and 250 words total.
        - **No Hallucinations**: Do NOT invent, modify, or assume any experience, achievements, or titles not present in the candidate profile.
        - **First Person**: Write entirely in the first-person perspective ("I", "my", "me").
        - **JD Keywords**: Integrate key terms from the job description naturally.
        - **No Placeholders**: Do not include brackets like [Your Name] or [Date] in the final output. The header must contain actual details.
        """,
        expected_output="A tailored, professional cover letter of 200-250 words with matching header, salutation, and body.",
        agent=agent
    )