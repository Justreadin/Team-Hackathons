# cohere_service.py
# Handles communication with Cohere API for tone and grammar checking of resume and essay

import aiohttp
import os

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
COHERE_API_URL = "https://api.cohere.ai/v1/classify"  # Cohere classification endpoint

async def analyze_tone_and_grammar(text: str) -> dict:
    """
    Sends the essay or resume text to Cohere API for tone and grammar analysis.
    
    Args:
        text (str): The text to be analyzed (either an essay or a resume).

    Returns:
        dict: Contains analysis results for tone and grammar issues.
    """
    headers = {
        "Authorization": f"Bearer {COHERE_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
    You are a language expert. Analyze the following text for:
    - Tone: Is it professional or casual?
    - Grammar: Are there any noticeable grammar issues or inconsistencies?
    - Clarity: Is the message clear and concise?

    Text:
    {text}
    """

    payload = {
        "inputs": prompt,
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(COHERE_API_URL, json=payload, headers=headers) as response:
            if response.status != 200:
                raise Exception(f"Cohere API error: {response.status}")
            result = await response.json()

    try:
        # Extract relevant analysis from the response
        return {
            "tone": result.get('tone', 'No tone analysis available'),
            "grammar_warnings": result.get('grammar_warnings', []),
            "clarity_issues": result.get('clarity_issues', []),
        }
    except Exception as e:
        raise Exception(f"Invalid response format from Cohere: {str(e)}")
