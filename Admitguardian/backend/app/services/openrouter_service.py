# app/services/openrouter_service.py
# Handles communication with OpenRouter API for real-time quick risk alerts, document analysis, and checklist generation.

import aiohttp
import os
import logging
import re
import json
from app.models.response_models import FinalChecklistResponse
from datetime import datetime

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
        # Remove markdown-style code fences
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)

        # Try to load the whole string
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback: extract first JSON object using curly brace matching
            brace_count = 0
            start = None
            for i, char in enumerate(cleaned):
                if char == '{':
                    if start is None:
                        start = i
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0 and start is not None:
                        json_str = cleaned[start:i+1]
                        return json.loads(json_str)
        return None
    except Exception as e:
        logger.error(f"Error extracting JSON: {str(e)}")
        return None

    
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
        "model": "mistralai/mixtral-8x7b",
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
    As an experienced, veteran and world-class admissions essay and article reviewer with a strict and critical 
    perspective that follow world standard and trends  .

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

    Do not add any explanation or text before or after the JSON
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
    You must respond with a single raw JSON object with three keys:
    - checklist: an array of final application tasks
    - critical_warnings: an array of key warnings
    - summary: a brief string summarizing key next steps

    Do NOT include any markdown formatting, triple backticks, or any text before or after. Only respond with a single valid JSON object.

    You are an expert university admissions advisor helping a student applying to these universities: {', '.join(target_universities)}.

    Based on the provided essay and resume below, create a comprehensive world-class final checklist of everything they must complete before submitting their application.

    Focus on these categories:
    - Application content review (essay, resume, LORs, SOPs)
    - Document formatting and proofreading
    - School-specific customizations
    - Submission portals and deadlines
    - Extra steps for scholarships or financial aid
    - Additional tips or last-minute checks

    Essay:
    {essay_text}

    Resume:
    {resume_text}

    Respond ONLY with a raw JSON object starting with '{' and ending with '}'. Do NOT include any markdown formatting (like triple backticks), no explanatory or surrounding text—only the JSON object itself, or your response will be rejected.
    """

    payload = {
        "model": "microsoft/phi-4-reasoning-plus:free",
        "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}]}],
        "temperature": 0.4,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(OPENROUTER_API_URL, json=payload, headers=headers) as response:
                response.raise_for_status()
                result = await response.json()
    except aiohttp.ClientError as e:
        logger.error(f"OpenRouter API network error: {str(e)}")
        raise RuntimeError(f"Failed to connect to OpenRouter API: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during API call: {str(e)}")
        raise RuntimeError(f"Unexpected error: {str(e)}")

    # Process and validate the response
    try:
        choices = result.get("choices")
        if not choices or not isinstance(choices, list):
            raise ValueError("Missing or invalid 'choices' in response")

        message = choices[0].get("message")
        if not message or not isinstance(message, dict):
            raise ValueError("Missing or invalid 'message' in response")

        content = message.get("content")
        if not content or not isinstance(content, str):
            raise ValueError("Missing or invalid 'content' in message")

        raw_content = content  # ✅ FIXED: Use parsed content, not response
        extracted_json = extract_json_from_ai_response(raw_content)

        if not extracted_json:
            raise RuntimeError("AI response could not be parsed into JSON.")
        if not isinstance(extracted_json, dict):
            raise ValueError("AI response is not a valid JSON object.")
        if "checklist" not in extracted_json or "critical_warnings" not in extracted_json:
            raise KeyError("Missing required keys in AI response JSON.")

        checklist_data = {
            "checklist": extracted_json.get("checklist", []),
            "critical_warnings": extracted_json.get("critical_warnings", []),
            "summary": extracted_json.get("summary", ""),
            "download_text": None,
            "generated_by": "openrouter/google/gemma-3-12b-it",
            "generation_time": datetime.utcnow().isoformat()
        }

        return FinalChecklistResponse(**checklist_data)

    except (ValueError, KeyError, IndexError, json.JSONDecodeError) as e:
        logger.error(f"Invalid AI response format or content: {result}")
        raise RuntimeError("The AI response format is invalid or missing required fields.")
