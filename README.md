# JobAssistant.AI

A full-stack AI application that automates the job application workflow. It analyzes a PDF resume, evaluates compatibility against a job description, and generates a tailored cover letter — all through a multi-agent AI pipeline powered by CrewAI and Groq.

---

## Overview

JobAssistant.AI runs three specialized AI agents in sequence:

1. A resume agent that extracts structured candidate data from a PDF.
2. A job matcher agent that compares the candidate profile against a job description and produces a compatibility score, matched skills, missing skills, and a summary.
3. A cover letter agent that generates a concise, targeted cover letter (200-250 words) following a professional structure.

Parsed resume data is stored in a ChromaDB vector database using Sentence-Transformers embeddings, enabling semantic retrieval as context for downstream agents.

---
<img width="886" height="680" alt="Screenshot 2026-08-30 at 5 11 26 PM" src="https://github.com/user-attachments/assets/1c8f58dd-5d26-4933-b459-6f01cc9e0601" />
<img width="1045" height="721" alt="Screenshot 2026-08-30 at 5 12 12 PM" src="https://github.com/user-attachments/assets/355a056a-e6b9-48b2-8f49-c6a92649d823" />
<img width="865" height="722" alt="Screenshot 2026-08-30 at 5 12 36 PM" src="https://github.com/user-attachments/assets/6fb40de3-6b40-49dd-8250-668363682577" />
<img width="866" height="719" alt="Screenshot 2026-08-30 at 5 13 14 PM" src="https://github.com/user-attachments/assets/b2d9846d-b097-4352-a35b-3478051ac3a9" />



## Features

- PDF resume parsing and structured data extraction (name, skills, experience, education, projects)
- Job compatibility scoring (0-100) with matched and missing skill breakdowns and an AI evaluation summary
- Automated cover letter generation tailored to the specific job description and candidate profile
- RAG pipeline using ChromaDB and Sentence-Transformers for semantic context retrieval
- Multi-agent orchestration via CrewAI with dedicated agents per task
- Session-based rate limiting on the frontend (4 AI requests per browser session)
- Server-side rate limiting on the backend (10 requests per IP per hour)
- Responsive, glassmorphic dark UI built with React and Vanilla CSS

---

## Technology Stack

### Backend

| Component | Technology |
|---|---|
| API framework | FastAPI |
| Multi-agent orchestration | CrewAI |
| LLM inference | Groq API (compound-mini) |
| Vector database | ChromaDB |
| Text embeddings | Sentence-Transformers |
| PDF extraction | PyPDF |
| Runtime | Python 3.13 |

### Frontend

| Component | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| HTTP client | Axios |
| Styling | Vanilla CSS |

---

## Project Structure

```
JobAssistant.AI/
├── app/
│   ├── api/
│   │   └── main.py              # FastAPI routes and rate limiting
│   ├── agents/
│   │   ├── resume_analyzer.py   # Resume analysis agent
│   │   ├── job_matcher.py       # Job compatibility agent
│   │   └── cover_letter_generator.py  # Cover letter agent
│   ├── tasks/
│   │   ├── resume_task.py       # Resume extraction task config
│   │   ├── job_match_task.py    # Job matching task config
│   │   └── cover_letter_task.py # Cover letter task config
│   ├── services/
│   │   └── resume_parser.py     # PDF text extraction and name detection
│   └── rag/
│       └── vector_store.py      # ChromaDB store and retrieval
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React application
│   │   ├── App.css              # Component styles
│   │   └── index.css            # Global styles and design tokens
│   └── package.json
├── requirements.txt
└── .env                         # API keys (not committed)
```

---

## Setup

### Prerequisites

- Python 3.13
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free tier supported)

### 1. Clone the repository

```bash
git clone https://github.com/Nourin04/JobAssistant.AI.git
cd JobAssistant.AI
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Set up the backend

```bash
python3.13 -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

pip install --upgrade pip
pip install -r requirements.txt
```

Start the backend server:

```bash
python -m uvicorn app.api.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive API docs: `http://localhost:8000/docs`

### 4. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Usage

1. Open the app in a browser at `http://localhost:5173`.
2. Upload a PDF resume on the first screen.
3. Paste a job description into the text area on the second screen.
4. Review the compatibility report — match score, matched skills, skill gaps, and AI summary.
5. Generate a tailored cover letter and copy or download it.

Each browser session allows 4 AI requests. Refreshing the page resets the session counter.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/analyze` | Upload a PDF resume and extract structured data |
| POST | `/match` | Compare a resume profile against a job description |
| POST | `/cover-letter` | Generate a tailored cover letter |

### Rate Limits

- Frontend: 4 AI requests per browser session (enforced via `sessionStorage`)
- Backend: 10 requests per IP per hour (in-memory rolling window)

Requests exceeding the server limit return HTTP `429 Too Many Requests`.

---

## Design Decisions

**Synchronous FastAPI handlers**
CrewAI's `kickoff()` is synchronous and CPU-blocking. Defining endpoint handlers as `def` (not `async def`) causes FastAPI to automatically run them in a thread pool executor, which avoids blocking the main asyncio event loop.

**CrewAI cache patch**
The current version of CrewAI injects a `cache_breakpoint` property into LLM messages. Groq's API rejects this as an unsupported parameter. A one-line monkey patch applied at startup disables this behavior:
```python
import crewai.llms.cache as _crewai_cache
_crewai_cache.mark_cache_breakpoint = lambda msg: msg
```

**Cover letter structure**
The cover letter agent is prompted to produce a 200-250 word letter with a fixed structure: header, salutation, opening hook, 2 evidence paragraphs tied to the job description, closing call to action, and sign-off. Hallucination is explicitly prohibited — the agent may only reference experience and projects present in the parsed resume data.

**Dual-layer rate limiting**
Frontend session limits prevent accidental rapid-fire submissions that would exhaust Groq free-tier tokens. Backend IP limits provide a secondary guard that applies regardless of the client.

---

## Known Limitations

- Rate limit counters are in-memory on the backend and reset on server restart. A persistent store (Redis, database) would be needed for production use.
- The `time.sleep(10)` before the cover letter endpoint is a conservative delay to avoid Groq token-per-minute limits. This can be reduced or removed if the account tier allows higher throughput.
- PDF extraction quality depends on the formatting of the source document. Scanned PDFs without embedded text are not supported.

---

## Future Work

- User authentication and session persistence
- Job history and saved cover letters
- LinkedIn job description import
- Deployment configuration (Render backend, Vercel frontend)
- OCR support for scanned PDFs
- Redis-backed rate limiting for production

---

## License

This project is for personal and educational use.
