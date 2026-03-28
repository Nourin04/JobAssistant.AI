from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import json
import time

from crewai import Crew

from app.services.resume_parser import extract_text_from_pdf, extract_name
from app.agents.resume_analyzer import get_resume_analyzer
from app.tasks.resume_task import get_resume_task

from app.rag.vector_store import store_resume_data, query_resume

from app.agents.job_matcher import get_job_matcher
from app.tasks.job_match_task import get_job_match_task

from app.agents.cover_letter_generator import get_cover_letter_generator
from app.tasks.cover_letter_task import get_cover_letter_task


app = FastAPI(title="Job Assistant AI API")

# 🌐 CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Job Assistant AI API is running"}


# 📄 Upload Resume + Process
@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    resume_text = extract_text_from_pdf(file_path)
    candidate_name = extract_name(resume_text)

    # Run Resume Agent
    agent = get_resume_analyzer()
    task = get_resume_task(agent, resume_text)

    crew = Crew(agents=[agent], tasks=[task])
    result = crew.kickoff()

    output_text = result.raw

    # Extract JSON
    import re
    match = re.search(r"\{.*\}", output_text, re.DOTALL)

    if not match:
        return {"error": "Invalid JSON output"}

    try:
        parsed = json.loads(match.group(0))
    except json.JSONDecodeError:
        return {"error": "Failed to parse LLM output as JSON"}

    parsed["name"] = candidate_name

    # Store in RAG (Optional: handle exceptions here)
    try:
        store_resume_data(parsed)
    except Exception as e:
        print(f"RAG storage failed: {e}")

    if os.path.exists(file_path):
        os.remove(file_path)

    return parsed


# 🎯 Job Matching
@app.post("/match")
async def match_job(data: dict):
    resume_data = data["resume"]
    job_description = data["job_description"]

    matcher = get_job_matcher()
    task = get_job_match_task(matcher, resume_data, job_description)

    crew = Crew(agents=[matcher], tasks=[task])
    result = crew.kickoff()

    import re
    parsed_result = result.raw
    match = re.search(r"\{.*\}", result.raw, re.DOTALL)
    if match:
        try:
            parsed_result = json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    return {"result": parsed_result}


# ✉️ Cover Letter
@app.post("/cover-letter")
async def generate_cover_letter(data: dict):
    resume_data = data["resume"]
    job_description = data["job_description"]

    # avoid rate limit
    time.sleep(10)

    agent = get_cover_letter_generator()
    task = get_cover_letter_task(agent, resume_data, job_description)

    crew = Crew(agents=[agent], tasks=[task])
    result = crew.kickoff()

    return {"cover_letter": result.raw}