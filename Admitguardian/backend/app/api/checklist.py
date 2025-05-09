# checklist.py
# FastAPI route for generating the final checklist based on the essay and resume

from fastapi import APIRouter, HTTPException
from app.models.request_models import FinalChecklistRequest
from app.models.response_models import FinalChecklistResponse
from app.services.openrouter_service import generate_final_checklist

router = APIRouter()

@router.post("/generate-checklist", response_model=FinalChecklistResponse)
async def generate_checklist(request: FinalChecklistRequest):
    """
    Generate a final checklist based on the uploaded essay and resume.
    """
    try:
        # Send the essay and resume content to generate the final checklist
        checklist = generate_final_checklist(request.essay_text, request.resume_text, request.target_universities)

        return checklist

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating checklist: {str(e)}")
