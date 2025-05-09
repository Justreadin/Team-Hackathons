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
        # Generate the checklist data (which should now be in dictionary format)
        checklist_data = await generate_final_checklist(
            essay_text=request.essay_text,
            resume_text=request.resume_text,
            target_universities=request.target_universities
        )

        # If checklist_data is already a FinalChecklistResponse object, return it directly
        if isinstance(checklist_data, FinalChecklistResponse):
            return checklist_data
        
        # Otherwise, if it's a dictionary or mapping, unpack it
        return FinalChecklistResponse(**checklist_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating checklist: {str(e)}")
