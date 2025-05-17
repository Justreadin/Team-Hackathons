# app/models/response_models.py
# Pydantic models for structuring the responses sent from the FastAPI app

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class EssayAnalysisResponse(BaseModel):
    score: int
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]  # ✅ Match the key returned
    red_flags: list[str]
    tone: str
    grammar_warnings: list[str]
    clarity_issues: list[str]
    tone_label: str
    grammar_quality: str
    risk_score: int

class EssayEvaluationResponse(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]  # ✅ Match the key returned
    red_flags: list[str]
    tone: Optional[str]
    grammar_warnings: list[str]
    clarity_issues: list[str]
    tone_label: Optional[str]
    grammar_quality: Optional[str]
    risk_score: int

class ResumeAnalysisResponse(BaseModel):
    """
    Enhanced response model for resume analysis results.
    """
    strengths: List[str] = Field(default=[], description="Key strengths found in the resume.")
    weaknesses: List[str] = Field(default=[], description="Noted weaknesses or areas needing improvement.")
    risk_labels: List[str] = Field(default=[], description="Labels or tags indicating potential risks.")
    missing_elements: List[str] = Field(default=[], description="Sections that are missing or underdeveloped.")
    suggested_improvements: List[str] = Field(default=[], description="Recommended additions or edits.")
    analysis_summary: str = Field(default="No summary provided.", description="Summary of analysis.")
    risk_score: int = Field(default=0, ge=0, le=100, description="Risk score (0-100 scale).")

    # Meta
    model_used: Optional[str] = Field(default="google/flan-t5-large", description="Hugging Face model used.")
    evaluation_time: Optional[datetime] = Field(default_factory=datetime.utcnow, description="Timestamp of evaluation.")

class ChecklistItem(BaseModel):
    item: str
    importance: str = Field(..., description="One of: 'critical', 'recommended', 'optional'")
    source: str = Field(..., description="Whether this item came from the essay, resume, or both")

class FinalChecklistResponse(BaseModel):
    checklist: List[ChecklistItem] = Field(..., description="List of checklist items to address")
    critical_warnings: List[str] = Field(default=[], description="Major red flags or issues")
    summary: str = Field(..., description="Summary of the checklist purpose and findings")
    download_text: Optional[str] = Field(None, description="Plaintext version of checklist for download")
    generated_by: Optional[str] = Field(default="openrouter/gpt-4", description="Model used")
    generation_time: Optional[datetime] = Field(default_factory=datetime.utcnow)

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
    clarity_level: str  # Clarity assessment (e.g., "Clear", "Somewhat Clear", "Unclear").
    summary: str  # One-sentence summary of the tone and grammar analysis.
    suggestions: Optional[List[str]] = None  # Optional list of suggestions for improvements.

class DashboardScoreResponse(BaseModel):
    combined_score: int
    essay_score: int
    resume_score: int
    suggestions: List[str]
    essay_breakdown: Dict[str, float]
    resume_breakdown: Dict[str, float]

class QuickAlertResponse(BaseModel):
    critical_alerts: List[str]
    summary: str
    status: str


class DocumentUploadRequest(BaseModel):
    document_type: str  # e.g., 'resume' or 'essay'
    document_text: str

class DailyQuestResponse(BaseModel):
    quest: str