# app/services/openrouter_service.py
# Handles communication with OpenRouter API for real-time quick risk alerts, document analysis, and checklist generation.

import aiohttp
import os
import logging
import re
import json

logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    logger.error("OPENROUTER_API_KEY not set. Please check your environment variables.")
    raise EnvironmentError("OPENROUTER_API_KEY not configured.")
else:
    logger.info("OPENROUTER_API_KEY loaded successfully.")

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"


def extract_json_from_ai_response(ai_text: str):
    """
    Extracts JSON block from AI response text that contains a fenced ```json ... ``` section.
    """
    match = re.search(r'```json(.*?)```', ai_text, re.DOTALL)
    if match:
        json_str = match.group(1).strip()
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse extracted JSON: {e}")
            return None
    else:
        logger.error("No JSON block found in AI response.")
        return None


async def generate_quick_alerts(document_type: str, document_text: str) -> dict:
    """
    Sends a document to OpenRouter API for a fast risk scan and returns quick alerts.
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
    You are an expert reviewer. Quickly scan this {document_type} and identify any immediate red flags such as:
    - Major plagiarism risks
    - Missing critical sections
    - Poor formatting
    - Any factor that would lead to immediate rejection

    Return a brief JSON object like:
    {{
        "critical_alerts": [...],
        "summary": "short summary of critical findings"
    }}

    Document:
    {document_text}
    """

    payload = {
        "model": "google/gemma-3-12b-it:free",
        "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}]}],
        "temperature": 0.3,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(OPENROUTER_API_URL, json=payload, headers=headers) as response:
                result = await response.json()
                response.raise_for_status()
    except aiohttp.ClientError as e:
        logger.error(f"OpenRouter API network error: {str(e)}")
        raise RuntimeError(f"Failed to connect to OpenRouter API: {str(e)}")

    try:
        content = result['choices'][0]['message']['content']
        return {
            "message": content,
            "status": "success",
        }
    except (KeyError, IndexError) as e:
        logger.error(f"Invalid OpenRouter API response: {result}")
        raise ValueError("Unexpected response format received from OpenRouter API.") from e

async def analyze_essay(document_text: str) -> dict:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
    You are a professional admissions essay reviewer.

    Thoroughly evaluate this essay based on:
    - Grammar and spelling
    - Logical flow and structure
    - Persuasiveness and clarity
    - Content relevance to admissions goals
    - Tone and impact

    Provide a JSON response structured like:
    {{
        "strengths": [...],
        "weaknesses": [...],
        "overall_score": "x / 10",
        "suggestions": [...],
        "red_flags": [...]
    }}

    Essay to review:
    {document_text}
    """

    payload = {
        "model": "google/gemma-3-12b-it:free",
        "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}]}],
        "temperature": 0.4,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(OPENROUTER_API_URL, json=payload, headers=headers) as response:
                result = await response.json()
                response.raise_for_status()
    except aiohttp.ClientError as e:
        logger.error(f"OpenRouter API network error: {str(e)}")
        raise RuntimeError(f"Failed to connect to OpenRouter API: {str(e)}")

    try:
        content = result['choices'][0]['message']['content']
        extracted_json = extract_json_from_ai_response(content)

        if extracted_json:
            return {
                "risk_score": int(extracted_json.get("overall_score", "0 / 10").split('/')[0].strip()),
                "strengths": extracted_json.get("strengths", []),
                "weaknesses": extracted_json.get("weaknesses", []),
                "red_flags": extracted_json.get("red_flags", []),
                "suggested_improvements": extracted_json.get("suggestions", []),
            }
        else:
            raise ValueError("Failed to extract valid JSON from AI response.")

    except (KeyError, IndexError, ValueError) as e:
        logger.error(f"Invalid AI response: {result}")
        raise ValueError("Unexpected response format from AI.") from e

async def generate_final_checklist(user_input: dict) -> dict:
    """
    Generates a final checklist based on user input or other criteria.
    """
    checklist = {
        "step_1": "Verify academic qualifications",
        "step_2": "Complete application form",
        "step_3": "Submit resume",
        "step_4": "Schedule interview",
        "step_5": "Prepare portfolio"
    }

    if user_input.get("has_experience"):
        checklist["step_6"] = "Prepare for advanced technical interview"

    return checklist
