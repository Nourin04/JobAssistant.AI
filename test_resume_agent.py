from crewai import Crew
from app.agents.resume_analyzer import get_resume_analyzer
from app.tasks.resume_task import get_resume_task
from app.services.resume_parser import extract_text_from_pdf
from app.rag.vector_store import store_resume_data, query_resume

from app.agents.job_matcher import get_job_matcher
from app.tasks.job_match_task import get_job_match_task

from app.agents.cover_letter_generator import get_cover_letter_generator
from app.tasks.cover_letter_task import get_cover_letter_task

import json
import re


# 🔧 Helper: Extract JSON from LLM output
def extract_json(text):
    match = re.search(r"\{.*\}", text, re.DOTALL)
    return match.group(0) if match else None


# 📄 Load resume from PDF
resume_text = extract_text_from_pdf("NoureenAC-v1.pdf")

# 🤖 Create Resume Analyzer agent
agent = get_resume_analyzer()

# 📋 Create task
task = get_resume_task(agent, resume_text)

# 👥 Create crew
crew = Crew(
    agents=[agent],
    tasks=[task],
    verbose=True
)

# ▶️ Run crew
result = crew.kickoff()
# ✅ Extract actual text from CrewOutput
output_text = result.raw

print("\nRAW OUTPUT:\n")
print(output_text)



# 🔄 Clean + Parse JSON safely
parsed = None

cleaned = extract_json(output_text)

if cleaned:
    try:
        parsed = json.loads(cleaned)
        print("\nSTRUCTURED OUTPUT:\n")
        print(parsed)
    except:
        print("\n⚠️ JSON parsing still failed")
else:
    print("\n⚠️ No JSON found in output")


# 🧠 Store + Query RAG + Job Matching
if parsed:
    print("\nDEBUG - Candidate Name:\n")
    print(parsed.get("name"))
    # ✅ Store in vector DB
    store_resume_data(parsed)

    # ✅ Query RAG
    rag_result = query_resume("What are the candidate's skills?")
    print("\nRAG RESULT:\n")
    print(rag_result)

    # ==============================
    # 🔥 JOB MATCHING
    # ==============================

    job_description = """
    Looking for an AI/ML Engineer with experience in Python, Machine Learning,
    Deep Learning, and APIs. Familiarity with NLP and deployment is a plus.
    """

    matcher = get_job_matcher()

    match_task = get_job_match_task(
        matcher,
        parsed,
        job_description
    )

    match_crew = Crew(
        agents=[matcher],
        tasks=[match_task],
        verbose=True
    )

    match_result = match_crew.kickoff()

    print("\nJOB MATCH RESULT:\n")
    print(match_result.raw)

else:
    print("\nSkipping RAG and Job Matching due to invalid JSON")

    # ==============================
# 🔥 COVER LETTER GENERATION
# ==============================

cover_agent = get_cover_letter_generator()

cover_task = get_cover_letter_task(
    cover_agent,
    parsed,
    job_description
)

cover_crew = Crew(
    agents=[cover_agent],
    tasks=[cover_task],
    verbose=True
)

cover_result = cover_crew.kickoff()

print("\nCOVER LETTER:\n")

import time

print("\n⏳ Waiting to avoid rate limit...\n")
time.sleep(15)
print(cover_result.raw)