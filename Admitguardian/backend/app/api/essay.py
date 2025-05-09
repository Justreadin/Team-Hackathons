from fastapi import APIRouter, HTTPException
from app.models.request_models import EssayUploadRequest
from app.models.response_models import EssayAnalysisResponse
from app.models.response_models import EssayEvaluationResponse

# Import services for external API handling (no change here)
from app.services.openrouter_service import analyze_essay
from app.services.cohere_service import analyze_tone_and_grammar


from app.api.storage import temp_storage


router = APIRouter()

# Calculation of risk score based on clarity, grammar, and tone
def calculate_risk_score(grammar_warnings, clarity_issues, tone):
    risk_score = 0
    if grammar_warnings:
        risk_score += len(grammar_warnings) * 10
    if clarity_issues:
        risk_score += len(clarity_issues) * 15
    if tone == "Negative":
        risk_score += 20
    elif tone == "Neutral":
        risk_score += 10
    elif tone == "Positive":
        risk_score -= 5
    return max(0, risk_score)

@router.post("/upload", response_model=EssayAnalysisResponse)
async def upload_essay(request: EssayUploadRequest):
    try:
        # Preprocessing and dummy data for simulation
        processed_data = {
            "summary": "This is a dummy summary.",
            "keywords": ["dummy", "keywords", "example"]
        }

        # Use external API for essay analysis
        essay_analysis = await analyze_essay(request.essay_text)

        # Extracting results from analyze_essay
        score_result = essay_analysis

        # Simulating the tone analysis results
        tone_result = await analyze_tone_and_grammar(request.essay_text)

        # Update temp_storage with essay details
        temp_storage["essay_score"] = score_result["risk_score"]
        temp_storage["essay_breakdown"]["clarity"] = 80
        temp_storage["essay_breakdown"]["formal_tone"] = 50
        temp_storage["essay_breakdown"]["grammar"] = 60
        temp_storage["essay_breakdown"]["tone"] = 50
        temp_storage["essay_suggestions"] = score_result["suggested_improvements"]

        # Calculate risk score for essay using analysis results
        risk_score = calculate_risk_score(
            tone_result["grammar_warnings"], tone_result["clarity_issues"], tone_result["tone"]
        )

        return {
            "score": score_result["risk_score"],
            "strengths": score_result["strengths"],
            "weaknesses": score_result["weaknesses"],
            "suggestions": score_result["suggested_improvements"],
            "red_flags": score_result["red_flags"],
            "tone": tone_result["tone"],
            "grammar_warnings": tone_result["grammar_warnings"],
            "clarity_issues": tone_result["clarity_issues"],
            "tone_label": tone_result["tone"],
            "grammar_quality": "Good",
            "risk_score": risk_score,
            "keywords": processed_data["keywords"],
            "summary": processed_data["summary"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/evaluate", response_model=EssayEvaluationResponse)
async def evaluate_essay(request: EssayUploadRequest):
    try:
        # Preprocessing and dummy data for simulation
        processed_data = {
            "summary": "This is a dummy summary.",
            "keywords": ["dummy", "keywords", "example"]
        }
        
        # Use external API for essay evaluation
        essay_evaluation = await analyze_essay(request.essay_text)

        # Simulating result extraction
        result = essay_evaluation

        return {
            "score": result["risk_score"],
            "strengths": result["strengths"],
            "weaknesses": result["weaknesses"],
            "suggestions": result["suggested_improvements"],
            "red_flags": result["red_flags"],
            "tone": None,
            "grammar_warnings": [],
            "clarity_issues": [],
            "tone_label": None,
            "grammar_quality": None,
            "risk_score": 0,
            "keywords": processed_data["keywords"],
            "summary": processed_data["summary"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during evaluation: {str(e)}")