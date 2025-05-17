# app/utils/conditions.py

from typing import Dict, Any

def is_essay_quest_complete(progress: Dict[str, Any], requirements: Dict[str, Any]) -> bool:
    """
    Check if the essay quest meets all requirements.
    """
    grammar_warnings = progress.get("grammar_warnings", 0)
    clarity_issues = progress.get("clarity_issues", 0)

    required_grammar = requirements.get("grammar_warnings", 0)
    required_clarity = requirements.get("clarity_issues", 0)

    return grammar_warnings <= required_grammar and clarity_issues <= required_clarity


def is_resume_quest_complete(progress: Dict[str, Any], requirements: Dict[str, Any]) -> bool:
    """
    Check if the resume quest meets all requirements.
    """
    current_score = progress.get("current_risk_score", 100)
    target_score = requirements.get("risk_score_below", 30)

    return current_score < target_score


def is_quest_complete(quest: Dict[str, Any]) -> bool:
    """
    Generic quest validation dispatcher.
    """
    quest_type = quest.get("type")
    progress = quest.get("progress", {})
    requirements = quest.get("requirements", {})

    if quest_type == "essay":
        return is_essay_quest_complete(progress, requirements)
    elif quest_type == "resume":
        return is_resume_quest_complete(progress, requirements)

    return False  # Unknown quest type
