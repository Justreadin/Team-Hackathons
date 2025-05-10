# app/api/alerts.py
# Handles real-time quick alerts for essays or resumes.

from fastapi import APIRouter, HTTPException
from app.models.request_models import DocumentUploadRequest
from app.models.response_models import DocumentUploadResponse, QuickAlertResponse
from app.services.cohere_service import generate_quick_alerts

router = APIRouter()

@router.post("/live-alerts", response_model=QuickAlertResponse)
async def live_alerts(request: DocumentUploadRequest):
    """
    Real-time red flag detection for an essay or resume. Returns critical alerts instantly.
    """
    try:
        alert_data = await generate_quick_alerts(
            document_type=request.document_type,
            document_text=request.document_text
        )
        return QuickAlertResponse(**alert_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Live alert generation failed: {str(e)}")
