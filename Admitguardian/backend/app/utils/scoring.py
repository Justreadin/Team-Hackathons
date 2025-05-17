# scoring.py
# Contains the logic for calculating risk scores based on various evaluations of essays and resumes

def calculate_essay_score(analysis: dict) -> int:
    relevance = analysis.get("relevance", 0.5)
    strengths = analysis.get("strengths", 0.5)
    tone = analysis.get("tone", 0.5)
    red_flags = analysis.get("red_flags", [])

    # Original quality score
    quality_score = (relevance + strengths + tone) / 3
    penalty = 0.1 * len(red_flags)
    adjusted_quality = max(0, min(1.0, quality_score - penalty))

    # Risk score is inverse of quality
    risk_score = (1.0 - adjusted_quality) * 100
    return int(risk_score)


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


def calculate_combined_risk_score(essay_score: int = None, resume_score: int = None) -> int:
    """
    Combine essay and resume scores based on a percentage split.
    If either essay or resume score is missing, use 100% weight for the available score.
    """
    if essay_score is not None and resume_score is not None:
        # Combine both scores when both are available
        combined_score = (essay_score * 0.6) + (resume_score * 0.4)
    elif essay_score is not None:
        # If only essay score is available, give it 100% weight
        combined_score = essay_score
    elif resume_score is not None:
        # If only resume score is available, give it 100% weight
        combined_score = resume_score
    else:
        # If neither score is available, return 0 as a fallback
        combined_score = 0
    
    return max(0, min(combined_score, 100))  # Ensure the score is within 0-100
