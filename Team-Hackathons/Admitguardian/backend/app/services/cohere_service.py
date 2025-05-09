import aiohttp
import os

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
COHERE_API_URL = "https://api.cohere.ai/v1/generate"  # Cohere generation endpoint

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
        "model": "command",  # Use "command" or "command-light" here, depending on your choice
        "prompt": prompt,
        "max_tokens": 300,  # Adjust based on the expected output length
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(COHERE_API_URL, json=payload, headers=headers) as response:
            if response.status != 200:
                raise Exception(f"Cohere API error: {response.status}")
            result = await response.json()

    try:
        # Ensure the result contains the required fields
        return {
            "tone": result.get('text', 'No tone analysis available'),  # Get generated text from response
            "grammar_warnings": result.get('grammar_warnings', []),
            "clarity_issues": result.get('clarity_issues', []),
            "tone_label": result.get('tone_label', 'No tone analysis available'),  # Ensure tone_label exists
            "grammar_quality": result.get('grammar_quality', 'Good')  # Ensure grammar_quality exists
        }
    except Exception as e:
        raise Exception(f"Invalid response format from Cohere: {str(e)}")
