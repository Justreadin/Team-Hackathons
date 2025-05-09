# app/models/request_models.py
# Pydantic models for validating incoming requests in the FastAPI app

from pydantic import BaseModel
from typing import List, Optional

class EssayUploadRequest(BaseModel):
    """
    Model for validating the request to upload and analyze the essay.
    """
    essay_text: str  # The essay text content for analysis.

class ResumeUploadRequest(BaseModel):
    """
    Model for validating the request to upload and analyze the resume.
    """
    resume_text: str  # The resume text content for analysis.

class EssayToneCheckRequest(BaseModel):
    """
    Model for validating the request to check the tone and grammar of an essay.
    """
    essay_text: str  # The essay text content for tone/grammar analysis.

class ResumeToneCheckRequest(BaseModel):
    """
    Model for validating the request to check the tone and grammar of a resume.
    """
    resume_text: str  # The resume text content for tone/grammar analysis.

class FinalChecklistRequest(BaseModel):
    """
    Model for validating the request to generate the final checklist.
    """
    essay_text: str  # The essay content for analysis.
    resume_text: str  # The resume content for analysis.
    target_universities: Optional[List[str]] = []  # Optional list of target universities.

class DocumentUploadRequest(BaseModel):
    """
    Model for validating generic document upload requests (essay or resume).
    """
    document_type: str  # Either 'essay' or 'resume'.
    document_text: str  # Content of the uploaded document (text).
