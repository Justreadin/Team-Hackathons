from fastapi import APIRouter, HTTPException
from app.models.request_models import EssayUploadRequest
from app.models.response_models import EssayAnalysisResponse
from app.models.response_models import EssayEvaluationResponse
from app.services.openrouter_service import analyze_essay
from app.services.cohere_service import analyze_tone_and_grammar
from app.services.essay_processing_service import preprocess_essay
import asyncio

router = APIRouter()

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
        # Step 1: Preprocess the essay text
        processed_data = preprocess_essay(request.essay_text)
        print("Processed data:", processed_data)

        # Step 2: Analyze the preprocessed essay
        score_task = analyze_essay(processed_data["summary"])  # Using summary for analysis
        tone_task = analyze_tone_and_grammar(processed_data["summary"])  # Using summary for tone/grammar
        score_result, tone_result = await asyncio.gather(score_task, tone_task, return_exceptions=True)

        if "summary" not in processed_data or not processed_data["summary"]:
            raise HTTPException(status_code=400, detail="Summary generation failed.")

        # If any task failed, handle exceptions
        if isinstance(score_result, Exception):
            raise HTTPException(status_code=500, detail=f"Error in scoring: {score_result}")
        if isinstance(tone_result, Exception):
            raise HTTPException(status_code=500, detail=f"Error in tone/grammar analysis: {tone_result}")

        # Step 3: Extract relevant details from analysis results
        score = score_result.get("risk_score", 0)
        strengths = score_result.get("strengths", [])
        weaknesses = score_result.get("weaknesses", [])
        suggestions = score_result.get("suggested_improvements", [])
        red_flags = score_result.get("red_flags", [])

        tone = tone_result.get("tone", "Unknown")
        grammar_warnings = tone_result.get("grammar_warnings", [])
        clarity_issues = tone_result.get("clarity_issues", [])

        # Step 4: Calculate risk score
        risk_score = calculate_risk_score(grammar_warnings, clarity_issues, tone)

        return {
            "score": score,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "suggestions": suggestions,
            "red_flags": red_flags,
            "tone": tone,
            "grammar_warnings": grammar_warnings,
            "clarity_issues": clarity_issues,
            "tone_label": tone_result.get("tone_label", "N/A"),
            "grammar_quality": tone_result.get("grammar_quality", "Good"),
            "risk_score": risk_score,
            "keywords": processed_data["keywords"],  # Include extracted keywords
            "summary": processed_data["summary"]  # Include the summarized version of the essay
        }

    except ValueError as ve:
        raise HTTPException(status_code=502, detail=f"AI returned invalid format: {str(ve)}")
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=f"AI service unreachable: {str(re)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/evaluate", response_model=EssayEvaluationResponse)
async def evaluate_essay(request: EssayUploadRequest):
    try:
        # Preprocess the essay text
        processed_data = preprocess_essay(request.essay_text)
        
        # Use the summary for analysis
        result = await analyze_essay(processed_data["summary"])
        
        return {
            "score": result.get("risk_score", 0),
            "strengths": result.get("strengths", []),
            "weaknesses": result.get("weaknesses", []),
            "suggestions": result.get("suggested_improvements", []),
            "red_flags": result.get("red_flags", []),
            "tone": None,
            "grammar_warnings": [],
            "clarity_issues": [],
            "tone_label": None,
            "grammar_quality": None,
            "risk_score": 0,
            "keywords": processed_data["keywords"],  # Include extracted keywords
            "summary": processed_data["summary"]  # Include the summarized version of the essay
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during evaluation: {str(e)}")

@router.get("/sample")
async def sample_essay():
    return {
        "essay_text": (
            "In today's globalized world, the importance of education cannot be overstated. "
            "Education equips individuals with the skills and knowledge needed to thrive in a rapidly changing world."
        )
    }
