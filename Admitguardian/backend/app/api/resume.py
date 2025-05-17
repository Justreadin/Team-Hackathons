from fastapi import APIRouter, HTTPException
from app.models.request_models import ResumeUploadRequest
from app.models.response_models import ResumeAnalysisResponse
from app.services.huggingface_service import evaluate_resume_content
from datetime import datetime
from app.api.storage import temp_storage
import hashlib

router = APIRouter()

def calculate_resume_risk_score(formatting_issues, missing_skills, job_match_score):
    risk_score = 0
    if formatting_issues:
        risk_score += len(formatting_issues) * 10
    if missing_skills:
        risk_score += len(missing_skills) * 15
    if job_match_score < 50:
        risk_score += 30
    elif job_match_score < 70:
        risk_score += 15
    elif job_match_score < 85:
        risk_score += 5
    return max(0, min(100, risk_score))

def hash_resume_text(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()

@router.post("/evaluate", response_model=ResumeAnalysisResponse)
async def upload_resume(request: ResumeUploadRequest):
    """
    Critically evaluate a resume and provide constructive, data-driven feedback.
    """
    try:
        resume_hash = hash_resume_text(request.resume_text)

        # Check for cached evaluation
        if temp_storage.get("last_resume_hash") == resume_hash:
            return ResumeAnalysisResponse(
                strengths=temp_storage.get("resume_strengths", []),
                weaknesses=temp_storage.get("resume_weaknesses", []),
                risk_labels=temp_storage.get("resume_risk_labels", []),
                missing_elements=temp_storage.get("resume_missing_elements", []),
                suggested_improvements=temp_storage.get("resume_suggestions", []),
                analysis_summary="Cached analysis reused for performance. No reprocessing performed.",
                risk_score=temp_storage["resume_score"],
                model_used="Cached",
                evaluation_time=datetime.utcnow()
            )

        # Analyze resume via Hugging Face model
        analysis_data = await evaluate_resume_content(request.resume_text)

        # Extract fields
        formatting_issues = analysis_data.get("formatting_issues", [])
        missing_skills = analysis_data.get("missing_skills", [])
        job_match_score = analysis_data.get("job_match_score", 100)

        # Calculate risk
        risk_score = calculate_resume_risk_score(formatting_issues, missing_skills, job_match_score)

        # Store results in memory
        temp_storage.update({
            "last_resume_hash": resume_hash,
            "resume_score": risk_score,
            "resume_breakdown": {
                "relevance": job_match_score,
                "structure": 85 if not formatting_issues else 60,
                "format": 90 if not formatting_issues else 65,
                "skills": 90 if not missing_skills else 55,
                "overall": risk_score
            },
            "resume_suggestions": analysis_data.get("suggested_improvements", []),
            "resume_strengths": analysis_data.get("strengths", []),
            "resume_weaknesses": analysis_data.get("weaknesses", []),
            "resume_risk_labels": analysis_data.get("risk_labels", []),
            "resume_missing_elements": analysis_data.get("missing_elements", [])
        })

        # Build response
        return ResumeAnalysisResponse(
            strengths=analysis_data.get("strengths", ["No strong elements detected."]),
            weaknesses=analysis_data.get("weaknesses", ["Resume lacks measurable impact and clarity."]),
            risk_labels=analysis_data.get("risk_labels", ["Formatting", "Missing Skills"]),
            missing_elements=analysis_data.get("missing_elements", ["Quantified Achievements", "Soft Skills", "Modern Tech Stack"]),
            suggested_improvements=analysis_data.get("suggested_improvements", [
                "Use active verbs to describe responsibilities.",
                "Include measurable outcomes (e.g., increased sales by 20%).",
                "Tailor resume towards specific job role or industry."
            ]),
            analysis_summary=analysis_data.get("analysis_summary", "The resume appears generic, lacks personalization, and needs stronger alignment with target roles."),
            risk_score=risk_score,
            model_used=analysis_data.get("model_used", "google/flan-t5-large"),
            evaluation_time=datetime.utcnow()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")
