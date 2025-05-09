# app/services/openrouter_service.py
# Handles communication with OpenRouter API for real-time quick risk alerts, document analysis, and checklist generation.

import aiohttp
import os
import logging
import re
import json
from app.models.response_models import FinalChecklistResponse

logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    logger.error("OPENROUTER_API_KEY not set. Please check your environment variables.")
    raise EnvironmentError("OPENROUTER_API_KEY not configured.")
else:
    logger.info("OPENROUTER_API_KEY loaded successfully.")

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"



def extract_json_from_ai_response(text: str) -> dict:
    try:
        # Attempt to extract the first {...} block
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON found in AI response.")
        
        json_str = json_match.group()
        return json.loads(json_str)
    except Exception as e:
        raise ValueError(f"Failed to parse sanitized JSON: {str(e)}")

async def generate_quick_alerts(document_type: str, document_text: str) -> dict:
    """
    Uses OpenRouter AI to scan the document and return critical risk alerts.
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
    You are a top-tier admissions officer and professional reviewer known for detecting red flags in application materials.

    Carefully but quickly analyze the following {document_type} and identify ONLY **serious and potentially disqualifying issues**.

    Focus on:
    - Plagiarism signals or generic overused phrases
    - Missing sections (e.g., no objectives in resumes, no thesis in essays)
    - Formatting issues that reduce readability or professionalism
    - Tone mismatches or unprofessional writing
    - Logical gaps, vague or unsupported claims
    - Any issue that could cause immediate rejection at a competitive institution

    Respond **only** in this JSON format:
    {{
        "critical_alerts": [
            "The essay lacks a clear central theme",
            "The resume is missing an education section",
            ...
        ],
        "summary": "A brief, high-level summary of major red flags found"
    }}

    Document to scan:
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
        logger.error(f"OpenRouter API error: {str(e)}")
        raise RuntimeError(f"OpenRouter connection failed: {str(e)}")

    try:
        content = result["choices"][0]["message"]["content"]
        parsed_json = extract_json_from_ai_response(content)
        
        if parsed_json:
            return {
                "critical_alerts": parsed_json.get("critical_alerts", []),
                "summary": parsed_json.get("summary", "No major issues found."),
                "status": "success"
            }
        else:
            raise ValueError("AI response did not include valid JSON.")
    except (KeyError, IndexError, ValueError) as e:
        logger.error(f"Error parsing OpenRouter response: {result}")
        raise ValueError("Unexpected response format from AI.") from e

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

async def generate_final_checklist(essay_text: str, resume_text: str, target_universities: list) -> FinalChecklistResponse:
    """
    Uses OpenRouter AI to generate a personalized final checklist for a top-tier university application.
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
    Return only valid JSON without any markdown code fences (no ```json).

    You are an expert university admissions advisor helping a student applying to these universities: {', '.join(target_universities)}.

    Based on the provided essay and resume below, create a comprehensive world-class final checklist of everything they must complete before submitting their application.

    Focus on these categories:
    - Application content review (essay, resume, LORs, SOPs)
    - Document formatting and proofreading
    - School-specific customizations
    - Submission portals and deadlines
    - Extra steps for scholarships or financial aid
    - Additional tips or last-minute checks

    You MUST return only raw JSON strictly. Do NOT include markdown code blocks, triple backticks, or any extra text. 
    Only respond with a single valid JSON object as shown in the example below.:
    {{
        "checklist": [
            "Review essay for clarity and impact",
            "Tailor resume for each university's focus",
            "Ensure all recommendation letters are submitted",
            ...
        ],
        "critical_warnings": [
            "Your essay is strong but may benefit from clearer storytelling",
            "One university has an earlier deadline - prioritize it"
        ],
        "summary": "This checklist summarizes the final steps to take to ensure a high-quality application. Make sure to review your documents carefully and follow up with your recommenders."
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
            return FinalChecklistResponse(
                checklist=extracted_json.get("checklist", []),
                critical_warnings=extracted_json.get("critical_warnings", []),
                summary=extracted_json.get("summary", ""),
                download_text=None,  # Add this if needed to format a downloadable text
                generated_by="openrouter/google/gemma-3-12b-it",  # Adjust based on model used
                generation_time=datetime.utcnow()
            )
        else:
            raise ValueError("Failed to extract valid JSON from AI response.")
    except (KeyError, IndexError, ValueError) as e:
        logger.error(f"Invalid AI response format: {result}")
        raise ValueError("Unexpected response format from AI.") from e
