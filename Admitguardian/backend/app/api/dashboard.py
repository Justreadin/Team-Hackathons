# In app/api/dashboard.py (new file)
from fastapi import APIRouter
from app.models.response_models import DashboardScoreResponse
from app.utils.scoring import calculate_combined_risk_score
from app.api.storage import temp_storage

router = APIRouter()

@router.get("/dashboard/score", response_model=DashboardScoreResponse)
async def get_dashboard_score():
    """
    Combine the essay and resume risk scores and provide a detailed breakdown.
    """
    if temp_storage["essay_score"] is None or temp_storage["resume_score"] is None:
        raise HTTPException(status_code=400, detail="Essay or Resume data not available.")
    
    # Calculate combined risk score based on essay and resume
    combined_risk_score = calculate_combined_risk_score(
        temp_storage["essay_score"], temp_storage["resume_score"]
    )

    # Collect suggestions from both essay and resume
    combined_suggestions = list(set(
        temp_storage["essay_suggestions"] + temp_storage["resume_suggestions"]
    ))

    # Prepare breakdowns for pie charts
    essay_breakdown = temp_storage["essay_breakdown"]
    resume_breakdown = temp_storage["resume_breakdown"]

    return {
        "combined_score": combined_risk_score,
        "essay_score": temp_storage["essay_score"],
        "resume_score": temp_storage["resume_score"],
        "suggestions": combined_suggestions,
        "essay_breakdown": essay_breakdown,
        "resume_breakdown": resume_breakdown
    }
