# app/api/alerts.py
# Handles real-time quick alerts for essays or resumes.

from fastapi import APIRouter, HTTPException
from app.models.request_models import DocumentUploadRequest
from app.models.response_models import DocumentUploadResponse
from app.services.openrouter_service import generate_quick_alerts

router = APIRouter()

@router.post("/live-risk-alerts", response_model=DocumentUploadResponse)
async def live_risk_alerts(request: DocumentUploadRequest):
    """
    Quickly scan the uploaded essay or resume and return instant alerts (red flags).
    """
    try:
        # Call your OpenRouter service to analyze and generate quick alerts
        alerts_result = await generate_quick_alerts(
            document_type=request.document_type,
            document_text=request.document_text
        )
        
        return DocumentUploadResponse(
            message=alerts_result.get("message", "Quick scan completed."),
            document_type=request.document_type,
            status=alerts_result.get("status", "success")
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
