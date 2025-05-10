import aiohttp
import os
import json
import logging

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
COHERE_API_URL = "https://api.cohere.ai/v1/generate"


logger = logging.getLogger(__name__)


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

import aiohttp
import json
import os

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
COHERE_API_URL = "https://api.cohere.ai/v1/generate"


async def generate_quick_alerts(document_type: str, document_text: str) -> dict:
    """
    Analyzes the document for serious risks and provides detailed feedback using Cohere's command model.

    Args:
        document_type (str): Type of document (e.g., "resume", "personal statement").
        document_text (str): Raw text content of the document.

    Returns:
        dict: Detailed analysis including critical alerts, summary, and status.
    """
    headers = {
        "Authorization": f"Bearer {COHERE_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
You are a highly experienced admissions officer who specializes in identifying serious risks in application materials.

Carefully analyze the following {document_type} and return a structured response in the following format:

{{
  "critical_alerts": [
    "Alert 1 description",
    "Alert 2 description",
    ...
  ],
  "summary": "A high-level summary of the document's overall quality and potential red flags.",
  "status": "success or error",
  "tone_label": "The overall tone of the document (e.g., professional, casual, confident, etc.)",
  "grammar_quality": "Evaluate grammar quality (Excellent, Good, Minor Issues, Serious Errors)",
  "clarity_level": "Evaluate the clarity of the document (Clear, Somewhat Clear, Unclear)"
}}

Please ensure that:
- Only **serious** issues that could cause immediate rejection are listed in "critical_alerts".
- "summary" provides a concise but informative overview.
- "tone_label", "grammar_quality", and "clarity_level" are assessed for document quality.
- The response is **strictly valid JSON** without any additional commentary or explanation.

Document to analyze:
\"\"\"{document_text}\"\"\"
    """

    payload = {
        "model": "command-r-plus",  # Use "command-r" or "command-r-plus"
        "prompt": prompt,
        "max_tokens": 500,
        "temperature": 0.3,
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(COHERE_API_URL, json=payload, headers=headers) as response:
            if response.status != 200:
                raise Exception(f"Cohere API error: {response.status}")
            result = await response.json()

    # Attempt to parse the structured JSON response
    result_text = result.get('generations', [{}])[0].get('text', '').strip()

    try:
        parsed_json = json.loads(result_text)

        # Ensure proper fields are returned in the response
        return {
            "critical_alerts": parsed_json.get("critical_alerts", []),
            "summary": parsed_json.get("summary", "No major issues found."),
            "status": parsed_json.get("status", "success"),
            "tone_label": parsed_json.get("tone_label", "Unknown"),
            "grammar_quality": parsed_json.get("grammar_quality", "Unknown"),
            "clarity_level": parsed_json.get("clarity_level", "Unknown")
        }
    except json.JSONDecodeError:
        # Fallback if the response is not valid JSON
          return QuickAlertResponse(
            critical_alerts=[],
            summary="Failed to parse structured response from AI.",
            status="error",
            tone_label="Unknown",
            grammar_quality="Unknown",
            clarity_level="Unknown"
        )

async def analyze_tone_and_grammar(text: str) -> dict:
    """
    Analyzes the tone, grammar, and clarity of the provided text using Cohere API.

    Args:
        text (str): The text content of the essay or resume.

    Returns:
        dict: Parsed results containing tone_label, grammar_quality, clarity_level, and a summary.
    """
    headers = {
        "Authorization": f"Bearer {COHERE_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
    You are a world-class professional writing evaluator.

    Analyze the following text and respond with a well-structured JSON object with exactly these fields:

    - "tone_label": One-word label describing the overall tone of the writing (e.g., "Professional", "Conversational", "Too Abstract", "Confident", "Humble", "Casual", "Strict", etc.)
    - "grammar_quality": Evaluate grammar as "Excellent", "Good", "Minor Issues", or "Serious Errors".
    - "clarity_level": Rate clarity as "Clear", "Somewhat Clear", or "Unclear".
    - "summary": A one-sentence professional summary that explains the tone and grammar condition of the writing.

    Ensure that your response is STRICTLY valid JSON and contains no extra commentary or explanation.

    Text to analyze:
    \"\"\"
    {text}
    \"\"\"
    """

    payload = {
        "model": "command",  # Use "command" or "command-light"
        "prompt": prompt,
        "max_tokens": 300,
        "temperature": 0.4,  # Lower temperature for more deterministic output
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(COHERE_API_URL, json=payload, headers=headers) as response:
            if response.status != 200:
                raise Exception(f"Cohere API error: {response.status}")
            result = await response.json()

    # Parse the structured JSON returned as text
    result_text = result.get('generations', [{}])[0].get('text', '')

    try:
        parsed = json.loads(result_text)
    except json.JSONDecodeError:
        parsed = {
            "tone_label": "Unknown",
            "grammar_quality": "Unknown",
            "clarity_level": "Unknown",
            "summary": result_text.strip()
        }

    return parsed
