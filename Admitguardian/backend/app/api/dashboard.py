# app/api/dashboard.py
from fastapi import APIRouter, HTTPException
from app.models.response_models import DashboardScoreResponse
from app.utils.scoring import calculate_combined_risk_score
from app.api.storage import temp_storage
from datetime import datetime

router = APIRouter()

@router.get("/score", response_model=DashboardScoreResponse)
async def get_dashboard_score():
    """
    Combine essay and resume scores, suggestions, and breakdowns to generate a final dashboard view.
    """
    essay_score = temp_storage.get("essay_score")
    resume_score = temp_storage.get("resume_score")

    if essay_score is None and resume_score is None:
        raise HTTPException(status_code=400, detail="No evaluation data found for essay or resume.")

    combined_risk_score = calculate_combined_risk_score(essay_score, resume_score)

    response = {
        "combined_score": combined_risk_score,
        "essay_score": essay_score or 0,
        "resume_score": resume_score or 0,
        "suggestions": list(set(temp_storage.get("essay_suggestions", []) + temp_storage.get("resume_suggestions", []))),
        "essay_breakdown": temp_storage.get("essay_breakdown", {}),
        "resume_breakdown": temp_storage.get("resume_breakdown", {}),
        "model_sources": {
            "essay_model": temp_storage.get("essay_model", "N/A"),
            "resume_model": temp_storage.get("resume_model", "N/A")
        },
        "last_updated": temp_storage.get("last_updated", datetime.utcnow())
    }

    return response
