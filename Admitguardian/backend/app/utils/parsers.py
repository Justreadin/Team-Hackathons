# scoring.py
# Contains the logic for calculating risk scores based on various evaluations of essays and resumes

def calculate_essay_score(essay_analysis: dict) -> int:
    """
    Calculate the risk score for the essay based on analysis results.
    
    Args:
        essay_analysis (dict): A dictionary containing analysis results from AI evaluation.
    
    Returns:
        int: A risk score on a scale of 0-100. Lower means more risky.
    """
    score = 100  # Start with a perfect score
    
    # Weights for different aspects of the essay
    relevance_weight = 0.3
    strength_weight = 0.3
    tone_weight = 0.2
    red_flags_weight = 0.2
    
    # Penalize based on weaknesses identified
    if essay_analysis.get('relevance', 0) < 0.7:
        score -= 20 * relevance_weight
    if essay_analysis.get('strengths', 0) < 0.7:
        score -= 20 * strength_weight
    if essay_analysis.get('tone', 0) < 0.7:
        score -= 20 * tone_weight
    if essay_analysis.get('red_flags', []):
        score -= 20 * red_flags_weight * len(essay_analysis['red_flags'])
    
    # Ensure the score is within the 0-100 range
    score = max(0, min(100, score))
    
    return round(score)

def calculate_resume_score(resume_analysis: dict) -> int:
    """
    Calculate the risk score for the resume based on analysis results.
    
    Args:
        resume_analysis (dict): A dictionary containing analysis results from AI evaluation.
    
    Returns:
        int: A risk score on a scale of 0-100. Lower means more risky.
    """
    score = 100  # Start with a perfect score
    
    # Weights for different aspects of the resume
    research_weight = 0.3
    leadership_weight = 0.3
    publications_weight = 0.2
    clarity_weight = 0.2
    
    # Penalize based on weaknesses identified
    if resume_analysis.get('research_experience', 0) < 0.7:
        score -= 20 * research_weight
    if resume_analysis.get('leadership_experience', 0) < 0.7:
        score -= 20 * leadership_weight
    if resume_analysis.get('publications', 0) < 0.7:
        score -= 20 * publications_weight
    if resume_analysis.get('clarity', 0) < 0.7:
        score -= 20 * clarity_weight
    
    # Ensure the score is within the 0-100 range
    score = max(0, min(100, score))
    
    return round(score)

def calculate_final_risk_score(essay_score: int, resume_score: int) -> int:
    """
    Combine the essay and resume scores to generate a final application risk score.
    
    Args:
        essay_score (int): The calculated essay score.
        resume_score (int): The calculated resume score.
    
    Returns:
        int: The final combined risk score.
    """
    # Weights for essay and resume in the final risk score
    essay_weight = 0.5
    resume_weight = 0.5
    
    final_score = (essay_score * essay_weight) + (resume_score * resume_weight)
    
    # Ensure the final score is within the 0-100 range
    return round(final_score)
