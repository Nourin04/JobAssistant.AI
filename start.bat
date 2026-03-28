@echo off
echo Starting Job Assistant AI...

:: Start Backend
start cmd /k "call .venv\Scripts\activate && python -m uvicorn app.api.main:app --reload"

:: Start Frontend
cd frontend
start cmd /k "npm run dev"

echo Backend and Frontend are starting in separate windows.
echo API: http://localhost:8000
echo Frontend: http://localhost:5173
