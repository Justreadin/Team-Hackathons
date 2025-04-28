# resume.py
# FastAPI routes for uploading and analyzing the resume

from fastapi import APIRouter, HTTPException
from app.models.request_models import ResumeUploadRequest, ResumeToneCheckRequest
from app.models.response_models import ResumeAnalysisResponse, ToneCheckResponse
from app.services.huggingface_service import analyze_resume
from app.services.cohere_service import analyze_tone_and_grammar
router = APIRouter()

@router.post("/upload-resume", response_model=ResumeAnalysisResponse)
async def upload_resume(request: ResumeUploadRequest):
    """
    Upload and analyze the resume content.
    """
    try:
        # Send the resume text to the HuggingFace model for analysis
        analysis_result = analyze_resume(request.resume_text)

        return analysis_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")


@router.post("/resume-tone-check", response_model=ToneCheckResponse)
async def resume_tone_check(request: ResumeToneCheckRequest):
    """
    Analyze the tone and grammar quality of the uploaded resume.
    """
    try:
        # Send the resume text to Cohere API for tone and grammar evaluation
        tone_result = check_tone_and_grammar(request.resume_text)

        return tone_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking resume tone: {str(e)}")
