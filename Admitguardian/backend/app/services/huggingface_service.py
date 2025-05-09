# app/services/huggingface_service.py

import aiohttp
import os
import json
from datetime import datetime
from typing import Dict

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1"



async def evaluate_resume_content(resume_text: str) -> Dict:
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
    You are a resume evaluator. Return ONLY a JSON object. Do not include explanations.

    Analyze the following resume and return a JSON object with:
    - strengths: [list of strengths],
    - weaknesses: [list of weaknesses],
    - risk_labels: [list of risk indicators],
    - missing_elements: [list of missing parts like education, achievements, etc.],
    - suggested_improvements: [list of recommended edits],
    - analysis_summary: [short summary of the analysis],
    - risk_score: [integer from 0 to 100].

    Resume Content:
    {resume_text}
    """

    payload = {"inputs": prompt}

    async with aiohttp.ClientSession() as session:
        async with session.post(HUGGINGFACE_API_URL, json=payload, headers=headers) as response:
            if response.status == 404:
                raise Exception("Hugging Face model not found (404). Check model ID or API token.")
            elif response.status != 200:
                error_detail = await response.text()
                raise Exception(f"Hugging Face API error {response.status}: {error_detail}")
            raw_result = await response.json()

    # Normalize and parse response
    if isinstance(raw_result, list):
        if isinstance(raw_result[0], dict) and "generated_text" in raw_result[0]:
            raw_result = raw_result[0]["generated_text"]
        elif isinstance(raw_result[0], str):
            raw_result = raw_result[0]

    try:
        parsed = json.loads(raw_result) if isinstance(raw_result, str) else raw_result
    except json.JSONDecodeError:
        raise Exception("Failed to parse Hugging Face response into JSON.")

    return {
        "strengths": parsed.get("strengths", []),
        "weaknesses": parsed.get("weaknesses", []),
        "risk_labels": parsed.get("risk_labels", []),
        "missing_elements": parsed.get("missing_elements", []),
        "suggested_improvements": parsed.get("suggested_improvements", []),
        "analysis_summary": parsed.get("analysis_summary", "No summary provided."),
        "risk_score": int(parsed.get("risk_score", 0)),
        "model_used": "google/flan-t5-large",
        "evaluation_time": datetime.utcnow()
    }
