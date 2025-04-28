# essay.py
# FastAPI routes for uploading and analyzing the essay

from fastapi import APIRouter, HTTPException
from app.models.request_models import EssayUploadRequest, EssayToneCheckRequest
from app.models.response_models import EssayAnalysisResponse, ToneCheckResponse
from app.services.openrouter_service import analyze_essay
from app.services.cohere_service import analyze_tone_and_grammar

router = APIRouter()

@router.post("/upload-essay", response_model=EssayAnalysisResponse)
async def upload_essay(request: EssayUploadRequest):
    """
    Upload and analyze the essay content.
    """
    try:
        analysis_result = await analyze_essay(request.essay_text)
        return analysis_result

    except ValueError as ve:
        raise HTTPException(status_code=502, detail=f"Invalid response format: {str(ve)}")

    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=f"External API connection error: {str(re)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error during essay analysis: {str(e)}")


@router.post("/essay-tone-check", response_model=ToneCheckResponse)
async def essay_tone_check(request: EssayToneCheckRequest):
    """
    Analyze the tone and grammar quality of the uploaded essay.
    """
    try:
        # Assuming `analyze_tone_and_grammar` is a function that performs tone and grammar analysis
        tone_result = await analyze_tone_and_grammar(request.essay_text)

        # Ensure tone_result contains the required fields, if not, set defaults
        tone_result = {
            "tone": tone_result.get("tone", "No tone analysis available"),
            "grammar_warnings": tone_result.get("grammar_warnings", []),
            "clarity_issues": tone_result.get("clarity_issues", []),
            "tone_label": tone_result.get("tone_label", "No tone analysis available"),  # Ensure this field exists
            "grammar_quality": tone_result.get("grammar_quality", "Good")  # Ensure this field exists
        }

        return tone_result

    except ValueError as ve:
        raise HTTPException(status_code=502, detail=f"Invalid response format from tone checker: {str(ve)}")

    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=f"External tone checker connection error: {str(re)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error during tone check: {str(e)}")
