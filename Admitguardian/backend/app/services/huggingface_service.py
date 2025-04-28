# huggingface_service.py
# Handles communication with HuggingFace API for resume content evaluation (research, leadership, etc.)

import aiohttp
import os

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large"  # Example model

async def evaluate_resume_content(resume_text: str) -> dict:
    """
    Sends the resume text to HuggingFace API for content evaluation.
    
    Args:
        resume_text (str): The full text of the user's resume.

    Returns:
        dict: Contains risk labels, strengths, weaknesses, and overall analysis.
    """
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
    You are an expert in academic resume evaluation.
    Please analyze the following resume for:

    - Research experience
    - Leadership skills
    - Academic honors or publications
    - Any other relevant achievements or missing components

    Return a JSON object with:
    {{
        "risk_labels": [...],
        "strengths": [...],
        "weaknesses": [...],
        "analysis_summary": "concise summary of key points"
    }}

    Resume:
    {resume_text}
    """

    payload = {
        "inputs": prompt,
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(HUGGINGFACE_API_URL, json=payload, headers=headers) as response:
            if response.status != 200:
                raise Exception(f"HuggingFace API error: {response.status}")
            result = await response.json()

    try:
        # Process the API response into a usable structure
        return {
            "risk_labels": result.get('risk_labels', []),
            "strengths": result.get('strengths', []),
            "weaknesses": result.get('weaknesses', []),
            "analysis_summary": result.get('analysis_summary', 'No summary available'),
        }
    except Exception as e:
        raise Exception(f"Invalid response format from HuggingFace: {str(e)}")


# New function 'analyze_resume' that is added to be compatible with your previous import request
async def analyze_resume(resume_text: str) -> dict:
    """
    Analyzes the resume for overall evaluation (including research, leadership, etc.).
    
    Args:
        resume_text (str): The resume content to be evaluated.
    
    Returns:
        dict: The result containing an analysis of the resume.
    """
    return await evaluate_resume_content(resume_text)
