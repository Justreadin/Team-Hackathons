# essay.py
# FastAPI routes for uploading and analyzing the essay

from fastapi import APIRouter, HTTPException
from app.models.request_models import EssayUploadRequest, EssayToneCheckRequest
from app.models.response_models import EssayAnalysisResponse, ToneCheckResponse
from app.services.openrouter_service import analyze_essay
from app.services.cohere_service import check_tone_and_grammar

router = APIRouter()

@router.post("/upload-essay", response_model=EssayAnalysisResponse)
async def upload_essay(request: EssayUploadRequest):
    """
    Upload and analyze the essay content.
    """
    try:
        # Send the essay text to the AI for analysis
        analysis_result = analyze_essay(request.essay_text)

        return analysis_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing essay: {str(e)}")


@router.post("/essay-tone-check", response_model=ToneCheckResponse)
async def essay_tone_check(request: EssayToneCheckRequest):
    """
    Analyze the tone and grammar quality of the uploaded essay.
    """
    try:
        # Send the essay text to Cohere API for tone and grammar evaluation
        tone_result = check_tone_and_grammar(request.essay_text)

        return tone_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking essay tone: {str(e)}")
