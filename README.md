

# Job Assistant AI

Job Assistant AI is a full-stack AI-powered application designed to streamline and automate the job application process. The system leverages multi-agent architectures, Large Language Models (LLMs), and Retrieval-Augmented Generation (RAG) to analyze resumes, evaluate job compatibility, and generate personalized cover letters.

This project demonstrates the integration of modern AI systems with scalable backend services and a responsive frontend interface.

---

## Features

1. **Resume Parsing and Analysis**
   Extracts structured information such as skills, experience, education, and projects from PDF resumes using AI agents.

2. **Retrieval-Augmented Generation (RAG)**
   Stores parsed resume data in a ChromaDB vector database and enables semantic retrieval for downstream tasks.

3. **Job Compatibility Matching**
   Compares candidate profiles with job descriptions to generate:

   * Match score (0–100)
   * Matching skills
   * Missing skills
   * Contextual evaluation summary

4. **Automated Cover Letter Generation**
   Generates concise, personalized cover letters tailored to the job description and candidate profile.

5. **Multi-Agent AI System (CrewAI)**
   Uses specialized agents for:

   * Resume analysis
   * Job matching
   * Cover letter generation

6. **Modern Web Interface**
   A responsive React-based frontend for uploading resumes, entering job descriptions, and viewing results.

---

## Technology Stack

### Backend

* Python 3.12+
* FastAPI (API framework)
* CrewAI (multi-agent orchestration)
* LangChain (LLM integration utilities)
* ChromaDB (vector database for RAG)
* Groq API (LLM inference using LLaMA 3 models)
* Sentence-Transformers (text embeddings)
* PyPDF (PDF text extraction)

### Frontend

* React 18
* Vite (build tool)
* Axios (API communication)
* Vanilla CSS (custom UI styling)

---

## System Architecture

```
Frontend (React)
        ↓
FastAPI Backend
        ↓
CrewAI Agents
        ↓
Groq LLM (LLaMA 3)
        ↓
ChromaDB (RAG Layer)
```

### Components

1. **API Layer (`app/api/main.py`)**

   * Handles HTTP requests
   * Manages file uploads
   * Orchestrates AI workflows

2. **Agent Layer (`app/agents/`, `app/tasks/`)**

   * Resume Analyzer Agent
   * Job Matcher Agent
   * Cover Letter Generator Agent

3. **Data Layer (`app/services/`, `app/rag/`)**

   * PDF parsing and preprocessing
   * Vector storage and retrieval

---

## Setup Instructions

### Prerequisites

* Python 3.12+
* Node.js (v18+)
* npm
* Groq API Key

---

### 1. Clone Repository

```bash
git clone https://github.com/Nourin04/JobAssistant.AI.git
cd JobAssistant.AI
```

---

### 2. Environment Configuration

Create `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

---

### 3. Backend Setup

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Run backend:

```bash
python -m uvicorn app.api.main:app --reload
```

API available at:

```
http://localhost:8000
```

Swagger UI:

```
http://localhost:8000/docs
```

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend available at:

```
http://localhost:5173
```

---

## Usage

1. Upload a PDF resume
2. System extracts structured candidate profile
3. Enter job description
4. View:

   * Match score
   * Skill analysis
5. Generate personalized cover letter

---

## API Endpoints

* `GET /` – Health check
* `POST /analyze` – Resume parsing
* `POST /match` – Job compatibility analysis
* `POST /cover-letter` – Cover letter generation

---

## Key Implementation Details

### 1. Multi-Agent Workflow

Each task is handled by a dedicated agent:

* Resume Analyzer → Extracts structured data
* Job Matcher → Evaluates compatibility
* Cover Letter Generator → Generates content

---

### 2. RAG Pipeline

* Resume data converted to embeddings
* Stored in ChromaDB
* Retrieved context improves reasoning

---

### 3. Groq LLM Integration

* Uses LLaMA 3 models via Groq API
* Provides fast inference without GPU dependency

---

### 4. JSON Structuring

* Strict prompt engineering ensures structured outputs
* Regex-based cleanup handles LLM inconsistencies

---

## Challenges Faced and Solutions

### 1. LLM Output Not in Valid JSON

**Issue:** Responses included extra text or formatting
**Solution:**

* Enforced strict prompt rules
* Implemented regex-based JSON extraction

---

### 2. Name Hallucination in Cover Letters

**Issue:** Model generated incorrect candidate names
**Solution:**

* Extracted name directly from resume text
* Injected into structured data
* Enforced prompt constraints

---

### 3. Nested JSON Handling

**Issue:** Resume fields (experience, projects) returned as dictionaries
**Solution:**

* Implemented safe parsing logic
* Converted nested objects to readable strings

---

### 4. Groq API Rate Limits

**Issue:** Token limits exceeded during multiple agent calls
**Solution:**

* Added delay (`time.sleep`)
* Reduced output length (cover letter constraints)

---

### 5. Dependency and Environment Issues

**Issue:** Package conflicts and missing modules
**Solution:**

* Used virtual environments
* Ensured proper installation inside `.venv`

---

### 6. CrewAI Output Handling

**Issue:** Returned object instead of string (`CrewOutput`)
**Solution:**

* Used `.raw` attribute for parsing

---

## Improvements and Future Work

* Add authentication (user accounts)
* Store user history and previous analyses
* Improve UI with component libraries (e.g., Tailwind)
* Add job scraping integration (LinkedIn APIs)
* Deploy backend and frontend (Render/Vercel)
* Add caching for LLM responses
* Improve resume parsing with OCR for scanned PDFs

---

## Conclusion

Job Assistant AI demonstrates a complete AI-powered workflow integrating:

* Multi-agent systems
* LLM-based reasoning
* Retrieval-Augmented Generation
* Full-stack development

This project reflects practical application of modern AI engineering principles and scalable system design.

