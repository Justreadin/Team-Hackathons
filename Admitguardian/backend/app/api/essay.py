# app/api/essay.py

from fastapi import APIRouter, HTTPException
from app.models.request_models import EssayUploadRequest
from app.models.response_models import EssayEvaluationResponse
from app.services.openrouter_service import analyze_essay
from app.services.cohere_service import analyze_tone_and_grammar
from app.api.storage import temp_storage
from app.utils.scoring import calculate_essay_score
import hashlib

router = APIRouter()

def hash_essay_text(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()

@router.post("/evaluate", response_model=EssayEvaluationResponse)
async def evaluate_essay(request: EssayUploadRequest):
    try:
        essay_text = request.essay_text.strip()
        essay_hash = hash_essay_text(essay_text)

        if temp_storage.get("last_essay_hash") == essay_hash:
            return {
                "strengths": [],
                "weaknesses": [],
                "suggestions": temp_storage["essay_suggestions"],
                "red_flags": [],
                "tone": "Cached",
                "grammar_warnings": [],
                "clarity_issues": [],
                "tone_label": "",
                "grammar_quality": "",
                "risk_score": temp_storage["essay_score"],
                "summary": "Cached result.",
                "keywords": []
            }

        # Perform real analysis
        content_result = await analyze_essay(essay_text)
        tone_result = await analyze_tone_and_grammar(essay_text)

        strengths = content_result.get("strengths", [])
        weaknesses = content_result.get("weaknesses", [])
        red_flags = content_result.get("red_flags", [])
        suggestions = content_result.get("suggested_improvements", [])
        keywords = content_result.get("keywords", [])

        grammar_quality = tone_result.get("grammar_quality", "Average")
        clarity_level = tone_result.get("clarity_level", "Unclear")
        tone_label = tone_result.get("tone_label", "Neutral")

        grammar_warnings = []
        if grammar_quality.lower() not in ["excellent", "good"]:
            grammar_warnings.append("Significant grammar issues detected")

        clarity_issues = []
        if clarity_level.lower() != "clear":
            clarity_issues.append("The essay lacks clarity and logical flow")

        tone_score = 1.0 if tone_label == "Positive" else (0.5 if tone_label == "Neutral" else 0.3)

        # Compose analysis dict to use standard scoring method
        analysis_dict = {
            "relevance": 0.6 if weaknesses else 0.8,
            "strengths": 0.7 if strengths else 0.5,
            "tone": tone_score,
            "red_flags": red_flags
        }

        essay_score = calculate_essay_score(analysis_dict)

        # Update temp_storage for dashboard
        temp_storage["last_essay_hash"] = essay_hash
        temp_storage["essay_score"] = essay_score
        temp_storage["essay_suggestions"] = suggestions
        temp_storage["essay_breakdown"] = {
            "clarity": 90 if not clarity_issues else 60,
            "grammar": 90 if not grammar_warnings else 65,
            "tone": 80 if tone_label == "Positive" else 50,
            "strengths": 80 if strengths else 50,
            "overall": essay_score
        }

        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "suggestions": suggestions,
            "red_flags": red_flags,
            "tone": tone_label,
            "grammar_warnings": grammar_warnings,
            "clarity_issues": clarity_issues,
            "tone_label": tone_label,
            "grammar_quality": grammar_quality,
            "risk_score": essay_score,
            "summary": "This evaluation reflects critical insights based on clarity, tone, and argumentative strength.",
            "keywords": keywords
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation error: {str(e)}")
