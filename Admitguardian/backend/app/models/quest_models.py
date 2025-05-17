# app/api/models/quest_models.py
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Union

class EssayProgress(BaseModel):
    grammar_warnings: int = Field(..., description="Number of grammar warnings currently in the essay")
    clarity_issues: int = Field(..., description="Number of clarity issues in the essay")

class ResumeProgress(BaseModel):
    current_risk_score: float = Field(..., description="Current risk score of the resume")

class QuestRequirementsEssay(BaseModel):
    grammar_warnings: int = Field(0, description="Required grammar warnings to reach")
    clarity_issues: int = Field(0, description="Required clarity issues to reach")

class QuestRequirementsResume(BaseModel):
    risk_score_below: int = Field(30, description="Required risk score threshold")

class QuestResponse(BaseModel):
    type: Literal["essay", "resume"]
    description: str
    status: Literal["complete", "incomplete"]
    requirements: Union[QuestRequirementsEssay, QuestRequirementsResume]
    progress: Union[EssayProgress, ResumeProgress]

class QuestProgressUpdateRequest(BaseModel):
    type: Literal["essay", "resume"]
    grammar_warnings: Optional[List[str]] = None  # For essay quest, list of grammar warning messages
    clarity_issues: Optional[List[str]] = None    # For essay quest, list of clarity issue messages
    resume_risk_score: Optional[float] = None     # For resume quest, the updated risk score
