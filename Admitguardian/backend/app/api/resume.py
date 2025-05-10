# app/routes/resume.py

from fastapi import APIRouter, HTTPException
from app.models.request_models import ResumeUploadRequest
from app.models.response_models import ResumeAnalysisResponse
from app.services.huggingface_service import evaluate_resume_content
from datetime import datetime

router = APIRouter()

def calculate_resume_risk_score(formatting_issues, missing_skills, job_match_score):
    """
    Calculate the overall risk score based on issues like formatting problems, missing key skills, and job match score.
    """
    risk_score = 0
    if formatting_issues:
        risk_score += len(formatting_issues) * 10
    if missing_skills:
        risk_score += len(missing_skills) * 15
    if job_match_score < 50:
        risk_score += 20
    elif job_match_score < 70:
        risk_score += 10
    return max(0, risk_score)

@router.post("/resume", response_model=ResumeAnalysisResponse)
async def upload_resume(request: ResumeUploadRequest):
    """
    Analyze uploaded resume and return structured evaluation.
    """
    try:
        # Step 1: Evaluate the resume content using the Hugging Face service or another method
        analysis_data = await evaluate_resume_content(request.resume_text)

        # Step 2: Calculate additional risk scores or provide dashboard-related metrics (if needed)
        formatting_issues = analysis_data.get("formatting_issues", [])
        missing_skills = analysis_data.get("missing_skills", [])
        job_match_score = analysis_data.get("job_match_score", 100)

        # Calculate the risk score based on the issues
        risk_score = calculate_resume_risk_score(formatting_issues, missing_skills, job_match_score)

        # Step 3: Prepare the response data to match ResumeAnalysisResponse
        response_data = ResumeAnalysisResponse(
            strengths=analysis_data.get("strengths", []),
            weaknesses=analysis_data.get("weaknesses", []),
            risk_labels=analysis_data.get("risk_labels", []),
            missing_elements=analysis_data.get("missing_elements", []),
            suggested_improvements=analysis_data.get("suggested_improvements", []),
            analysis_summary=analysis_data.get("analysis_summary", "No summary provided."),
            risk_score=risk_score,  # Set the calculated risk score
            model_used=analysis_data.get("model_used", "google/flan-t5-large"),
            evaluation_time=datetime.utcnow()  # Use the current timestamp
        )

        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")
