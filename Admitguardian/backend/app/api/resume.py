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
        analysis_result = await analyze_resume(request.resume_text)

        # Check if the result is a list and handle it accordingly
        if isinstance(analysis_result, list):
            # If it's a list, extract relevant data (this could be changed based on the actual response structure)
            analysis_result = analysis_result[0]  # Modify this based on actual response structure

        return analysis_result  # Return the result, which should be a dictionary or object

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")


@router.post("/resume-tone-check", response_model=ToneCheckResponse)
async def resume_tone_check(request: ResumeToneCheckRequest):
    """
    Analyze the tone and grammar quality of the uploaded resume.
    """
    try:
        # Ensure that the async function analyze_tone_and_grammar is awaited
        tone_result = await analyze_tone_and_grammar(request.resume_text)  # Await the async function

        return tone_result  # Return the result, which should be a dictionary or object

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking resume tone: {str(e)}")
