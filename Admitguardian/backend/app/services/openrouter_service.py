# app/services/openrouter_service.py
# Handles communication with OpenRouter API for real-time quick risk alerts.

import aiohttp
import os

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"  # Example endpoint (adjust if needed)

async def generate_quick_alerts(document_type: str, document_text: str) -> dict:
    """
    Sends a document to OpenRouter API for a fast risk scan and returns quick alerts.

    Args:
        document_type (str): 'essay' or 'resume'.
        document_text (str): Full text content of the document.

    Returns:
        dict: Contains instant risk alert results.
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
        "model": "gpt-3.5-turbo",  # or whatever OpenRouter model you want (adjustable)
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(OPENROUTER_API_URL, json=payload, headers=headers) as response:
            if response.status != 200:
                raise Exception(f"OpenRouter API error: {response.status}")
            result = await response.json()

    try:
        # Parse output assuming response in the format you requested in prompt
        content = result['choices'][0]['message']['content']

        return {
            "message": content,
            "status": "success",
        }
    except Exception as e:
        raise Exception(f"Invalid response format from OpenRouter: {str(e)}")
