# app/api/storage.py

print("Loading storage.py...")

temp_storage = {
    "essay_score": None,
    "essay_breakdown": {
        "clarity": 0,
        "formal_tone": 0,
        "grammar": 0,
        "tone": 0,
        "overall": 0
    },
    "resume_score": None,
    "resume_breakdown": {
        "relevance": 0,
        "structure": 0,
        "format": 0,
        "skills": 0,
        "overall": 0
    },
    "essay_suggestions": [],
    "resume_suggestions": []
}
