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

async def generate_final_checklist(essay_text: str, resume_text: str, target_universities: list) -> dict:
    """
    Uses OpenRouter AI to generate a personalized final checklist for a top-tier university application.
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
    You are an expert university admissions advisor helping a student applying to these universities: {', '.join(target_universities)}.

    Based on the provided essay and resume below, create a comprehensive world-class final checklist of everything they must complete before submitting their application.
    
    Focus on these categories:
    - Application content review (essay, resume, LORs, SOPs)
    - Document formatting and proofreading
    - School-specific customizations
    - Submission portals and deadlines
    - Extra steps for scholarships or financial aid
    - Additional tips or last-minute checks

    Respond in a JSON format like:
    {{
        "final_checklist": [
            "Review essay for clarity and impact",
            "Tailor resume for each university's focus",
            "Ensure all recommendation letters are submitted",
            ...
        ],
        "priority_notes": [
            "Your essay is strong but may benefit from clearer storytelling",
            "One university has an earlier deadline - prioritize it"
        ]
    }}

    Essay:
    {essay_text}

    Resume:
    {resume_text}
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
                "final_checklist": extracted_json.get("final_checklist", []),
                "priority_notes": extracted_json.get("priority_notes", [])
            }
        else:
            raise ValueError("Failed to extract valid JSON from AI response.")

    except (KeyError, IndexError, ValueError) as e:
        logger.error(f"Invalid AI response format: {result}")
        raise ValueError("Unexpected response format from AI.") from e
