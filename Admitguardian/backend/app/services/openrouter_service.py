# app/services/openrouter_service.py
# Handles communication with OpenRouter API for real-time quick risk alerts, document analysis, and checklist generation.

import aiohttp
import os

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"  # Correct endpoint

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
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ],
        "temperature": 0.3,
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(OPENROUTER_API_URL, json=payload, headers=headers) as response:
            if response.status != 200:
                raise Exception(f"OpenRouter API error: {response.status}")
            result = await response.json()

    try:
        content = result['choices'][0]['message']['content']
        return {
            "message": content,
            "status": "success",
        }
    except Exception as e:
        raise Exception(f"Invalid response format from OpenRouter: {str(e)}")


async def analyze_essay(document_text: str) -> dict:
    """
    Analyzes an essay deeply for quality, coherence, structure, grammar, and content relevance.

    Args:
        document_text (str): The essay text content.

    Returns:
        dict: Detailed analysis and improvement suggestions.
    """
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
        "overall_score": "out of 10",
        "suggestions": [...]
    }}

    Essay to review:
    {document_text}
    """

    payload = {
        "model": "google/gemma-3-12b-it:free",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ],
        "temperature": 0.4,  # Slightly more creative for essay feedback
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(OPENROUTER_API_URL, json=payload, headers=headers) as response:
            if response.status != 200:
                raise Exception(f"OpenRouter API error: {response.status}")
            result = await response.json()

    try:
        content = result['choices'][0]['message']['content']
        return {
            "message": content,
            "status": "success",
        }
    except Exception as e:
        raise Exception(f"Invalid response format from OpenRouter: {str(e)}")


async def generate_final_checklist(user_input: dict) -> dict:
    """
    Generates a final checklist based on user input or other criteria.

    Args:
        user_input (dict): A dictionary containing user-specific data to generate the checklist.

    Returns:
        dict: A checklist containing required actions or steps for the user.
    """
    # Placeholder logic for checklist generation. Update based on your needs.
    checklist = {
        "step_1": "Verify academic qualifications",
        "step_2": "Complete application form",
        "step_3": "Submit resume",
        "step_4": "Schedule interview",
        "step_5": "Prepare portfolio"
    }

    # Example: Modify the checklist based on user input
    if user_input.get("has_experience"):
        checklist["step_6"] = "Prepare for advanced technical interview"

    return checklist
