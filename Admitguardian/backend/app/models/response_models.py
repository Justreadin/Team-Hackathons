# app/models/response_models.py
# Pydantic models for structuring the responses sent from the FastAPI app

from pydantic import BaseModel
from typing import List, Optional

class EssayAnalysisResponse(BaseModel):
    """
    Response model for essay analysis results.
    """
    risk_score: int  # Risk score for the essay.
    strengths: List[str]  # List of strengths identified in the essay.
    weaknesses: List[str]  # List of weaknesses identified in the essay.
    red_flags: List[str]  # List of red flags identified in the essay.
    suggested_improvements: List[str]  # List of suggested improvements.

class ResumeAnalysisResponse(BaseModel):
    """
    Response model for resume analysis results.
    """
    risk_score: int  # Risk score for the resume.
    strengths: List[str]  # List of strengths identified in the resume.
    weaknesses: List[str]  # List of weaknesses identified in the resume.
    missing_elements: List[str]  # Missing elements in the resume.
    suggested_improvements: List[str]  # List of suggested improvements.

class FinalChecklistResponse(BaseModel):
    """
    Response model for the final checklist.
    """
    checklist_items: List[str]  # List of checklist items for improvement.

class DocumentUploadResponse(BaseModel):
    """
    Response model for document upload status.
    """
    message: str  # A success or error message indicating the result of the upload process.
    document_type: str  # The type of document uploaded ('essay' or 'resume').
    status: str  # Upload status (e.g., 'success' or 'failure').

class ToneCheckResponse(BaseModel):
    """
    Response model for tone and grammar checking.
    """
    tone_label: str  # Overall tone detected (e.g., "Formal", "Conversational").
    grammar_quality: str  # Assessment of grammar quality (e.g., "Excellent", "Needs Improvement").
    suggestions: Optional[List[str]] = None  # Optional list of suggestions for improvements.
