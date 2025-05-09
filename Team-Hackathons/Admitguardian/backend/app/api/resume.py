# app/routes/resume.py

from fastapi import APIRouter, HTTPException
from app.models.request_models import ResumeUploadRequest
from app.models.response_models import ResumeAnalysisResponse
from app.services.huggingface_service import evaluate_resume_content

router = APIRouter()

@router.post("/upload-resume", response_model=ResumeAnalysisResponse)
async def upload_resume(request: ResumeUploadRequest):
    """
    Analyze uploaded resume and return structured evaluation.
    """
    try:
        analysis_data = await evaluate_resume_content(request.resume_text)

        return ResumeAnalysisResponse(**analysis_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")
