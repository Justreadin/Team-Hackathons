# app/api/routes/tone.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.cohere_service import analyze_tone_and_grammar

router = APIRouter()

class ToneRequest(BaseModel):
    text: str

@router.post("/tone")
async def evaluate_tone(request: ToneRequest):
    try:
        analysis = await analyze_tone_and_grammar(request.text)
        return {"success": True, "data": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
