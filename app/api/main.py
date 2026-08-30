from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
import shutil
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Patch CrewAI to avoid sending the unsupported cache_breakpoint parameter to Groq
import crewai.llms.cache as _crewai_cache
_crewai_cache.mark_cache_breakpoint = lambda msg: msg

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

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "")

# Fallback values to support local dev and your Vercel deployment automatically
origins = [
    "http://localhost:5173",
    "https://jobassistant-ai.vercel.app"
]

if FRONTEND_URL:
    for o in FRONTEND_URL.split(","):
        if o.strip():
            origins.append(o.strip())

# Normalize trailing slashes
final_origins = []
for o in origins:
    final_origins.append(o)
    if o.endswith("/"):
        final_origins.append(o[:-1])
    else:
        final_origins.append(o + "/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=final_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Server-side rate limiting: max 10 AI requests per IP per hour
# Acts as a secondary guard in addition to the frontend session limit.
# ---------------------------------------------------------------------------
RATE_LIMIT_MAX = 10
RATE_LIMIT_WINDOW = timedelta(hours=1)
_rate_counters: dict[str, list[datetime]] = defaultdict(list)

def _check_rate_limit(request: Request):
    """Raises HTTP 429 if the caller has exceeded the server-side rate limit."""
    ip = request.client.host
    now = datetime.utcnow()
    window_start = now - RATE_LIMIT_WINDOW
    # Prune timestamps outside the rolling window
    _rate_counters[ip] = [t for t in _rate_counters[ip] if t > window_start]
    if len(_rate_counters[ip]) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail=(
                f"Rate limit exceeded. You may make at most {RATE_LIMIT_MAX} "
                "AI requests per hour. Please try again later."
            ),
        )
    _rate_counters[ip].append(now)


@app.get("/")
async def root():
    return {"message": "Job Assistant AI API is running"}


@app.get("/health")
async def health():
    """Health check endpoint. The frontend pings this on load to wake the
    backend (Render free tier cold start) before the user starts interacting."""
    return {"status": "healthy"}


# Upload Resume + Process
@app.post("/analyze")
def analyze_resume(request: Request, file: UploadFile = File(...)):
    _check_rate_limit(request)

    file_path = f"temp_{file.filename}"

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
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

        # Store in RAG
        try:
            store_resume_data(parsed)
        except Exception as e:
            print(f"RAG storage failed: {e}")

        return parsed

    finally:
        # Always clean up the temp file
        if os.path.exists(file_path):
            os.remove(file_path)


# Job Matching
@app.post("/match")
def match_job(request: Request, data: dict):
    _check_rate_limit(request)

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


# Cover Letter
@app.post("/cover-letter")
def generate_cover_letter(request: Request, data: dict):
    _check_rate_limit(request)

    resume_data = data["resume"]
    job_description = data["job_description"]

    agent = get_cover_letter_generator()
    task = get_cover_letter_task(agent, resume_data, job_description)

    crew = Crew(agents=[agent], tasks=[task])
    result = crew.kickoff()

    return {"cover_letter": result.raw}