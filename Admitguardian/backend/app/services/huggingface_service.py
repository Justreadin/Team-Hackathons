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
        "analysis_summary": "concise summary of key points",
        "risk_score": "some value",  # Add a default for risk_score
        "missing_elements": "list of missing components",  # Default empty list
        "suggested_improvements": "list of improvements",  # Default empty list
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
        # Check if the result is a list and handle accordingly
        if isinstance(result, list):
            # The response is a list, so you need to handle it properly
            result = result[0]

        # Now ensure we have all necessary fields
        return {
            "risk_labels": result.get('risk_labels', []),
            "strengths": result.get('strengths', []),
            "weaknesses": result.get('weaknesses', []),
            "analysis_summary": result.get('analysis_summary', 'No summary available'),
            "risk_score": result.get('risk_score', 0),  # Default 0 if not found
            "missing_elements": result.get('missing_elements', []),  # Default empty list
            "suggested_improvements": result.get('suggested_improvements', []),  # Default empty list
        }
    except Exception as e:
        raise Exception(f"Invalid response format from HuggingFace: {str(e)}")


async def analyze_resume(resume_text: str) -> dict:
    """
    Function to analyze the resume using HuggingFace model via evaluate_resume_content.
    
    Args:
        resume_text (str): The full text of the user's resume.
    
    Returns:
        dict: The processed analysis of the resume.
    """
    try:
        # Call the function to evaluate the resume content using HuggingFace
        result = await evaluate_resume_content(resume_text)

        # Ensure the result is a dictionary (not a list or other type)
        if not isinstance(result, dict):
            raise ValueError("Received response in unexpected format (not a dict).")

        return result

    except Exception as e:
        # Handle any errors, such as invalid response formats or model issues
        raise ValueError(f"Error analyzing resume: {str(e)}")
