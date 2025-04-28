# app/main.py
# Main entry point for the FastAPI application

from dotenv import load_dotenv
load_dotenv() 

from fastapi import FastAPI
from app.api import essay, resume, checklist, alerts
from app.models.request_models import EssayUploadRequest, ResumeUploadRequest
from app.models.response_models import EssayAnalysisResponse, ResumeAnalysisResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Document Analysis API",
    description="An API for analyzing essays, resumes, generating checklists, and real-time alerts.",
    version="1.0.0",
)

# Allow all origins (use more restrictive policies for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this list in production for security
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
    """
    Root endpoint to check if the API is up and running.
    """
    return {"message": "Welcome to the Document Analysis API!"}
