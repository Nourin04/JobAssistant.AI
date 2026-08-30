# Use the slim variant to keep image size small
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies required by some Python packages
# (sentence-transformers / onnxruntime need libgomp)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency list first — Docker caches this layer separately,
# so re-installs only happen when requirements.txt changes.
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY app/ ./app/
COPY main.py .
COPY pyproject.toml .

# Render injects $PORT at runtime; default to 8000 for local Docker use
ENV PORT=8000

EXPOSE $PORT

# Run the FastAPI server
CMD uvicorn app.api.main:app --host 0.0.0.0 --port $PORT
