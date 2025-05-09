# app/main.py

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.api import essay, resume, checklist, alerts
import nltk
import os

# Define the lifespan context for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # NLTK resource setup (runs at startup)
    nltk_data_path = "/workspaces/Team-Hackathons/Admitguardian/backend/venv/nltk_data"
    os.makedirs(nltk_data_path, exist_ok=True)
    import nltk
    nltk.data.path.append("/workspaces/Team-Hackathons/Admitguardian/backend/venv/nltk_data")

    required_resources = ["punkt_tab", "stopwords"]

    for resource in required_resources:
        try:
            resource_path = f"tokenizers/{resource}" if resource == "punkt_tab" else f"corpora/{resource}"
            nltk.data.find(resource_path)
        except LookupError:
            nltk.download(resource, download_dir=nltk_data_path)

    yield  # Yield control to the app
    # Optional cleanup code can go here (runs at shutdown)

# Initialize the FastAPI app with the lifespan handler
app = FastAPI(
    title="Document Analysis API",
    description="An API for analyzing essays, resumes, generating checklists, and real-time alerts.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(essay.router, prefix="/essay", tags=["Essay"])
app.include_router(resume.router, prefix="/resume", tags=["Resume"])
app.include_router(checklist.router, prefix="/checklist", tags=["Checklist"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Document Analysis API!"}

#uvicorn main:app --host 0.0.0.0 --port 8080 --reload
