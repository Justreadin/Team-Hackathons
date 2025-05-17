# app/services/quest_service.py

from app.api.storage import temp_storage
from app.utils.conditions import is_quest_complete

def get_daily_quest():
    """
    Generates a daily quest dynamically based on user progress stored in temp_storage.
    Includes either essay or resume quest.
    """

    quest_type = "essay" if temp_storage.get("essay_score") is None else "resume"

    if quest_type == "essay":
        grammar_warnings = temp_storage.get("essay_grammar_warnings", [])
        clarity_issues = temp_storage.get("essay_clarity_issues", [])

        progress = {
            "grammar_warnings": len(grammar_warnings),
            "clarity_issues": len(clarity_issues)
        }

        requirements = {
            "grammar_warnings": 0,
            "clarity_issues": 0
        }

        quest = {
            "type": "essay",
            "description": "Upload an essay and reduce grammar and clarity issues.",
            "requirements": requirements,
            "progress": progress
        }

    else:
        resume_score = temp_storage.get("resume_risk_score", 100)

        progress = {
            "current_risk_score": resume_score
        }

        requirements = {
            "risk_score_below": 30
        }

        quest = {
            "type": "resume",
            "description": "Improve your resume's job match score to reduce your risk score below 30.",
            "requirements": requirements,
            "progress": progress
        }

    # Evaluate quest status using utils
    quest["status"] = "complete" if is_quest_complete(quest) else "incomplete"

    return quest


def update_quest_progress(update_data):
    """
    Updates the user's progress toward their daily quest.
    """

    if update_data.type == "essay":
        if update_data.grammar_warnings is not None:
            temp_storage["essay_grammar_warnings"] = update_data.grammar_warnings
        if update_data.clarity_issues is not None:
            temp_storage["essay_clarity_issues"] = update_data.clarity_issues

        # Dynamically calculate a mock essay_score
        total_issues = len(temp_storage.get("essay_grammar_warnings", [])) + len(temp_storage.get("essay_clarity_issues", []))
        essay_score = max(0, 100 - total_issues * 10)
        temp_storage["essay_score"] = essay_score

    elif update_data.type == "resume":
        if update_data.resume_risk_score is not None:
            temp_storage["resume_risk_score"] = update_data.resume_risk_score

    return get_daily_quest()


def reset_daily_quest():
    """
    Reset all stored progress related to the quest system.
    """
    keys = [
        "essay_score",
        "essay_grammar_warnings",
        "essay_clarity_issues",
        "resume_risk_score"
    ]

    for key in keys:
        temp_storage.pop(key, None)

    return {"status": "reset", "message": "Daily quest data cleared."}
