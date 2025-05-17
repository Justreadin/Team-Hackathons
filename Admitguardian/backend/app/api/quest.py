# app/api/quest.py

from fastapi import APIRouter
from app.services.quest_service import get_daily_quest, update_quest_progress, reset_daily_quest
from app.models.quest_models import QuestResponse, QuestProgressUpdateRequest
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/quest/daily", response_model=QuestResponse)
async def daily_quest():
    """
    Return the current daily quest with progress and status.
    """
    quest = get_daily_quest()
    return JSONResponse(content=quest)


@router.post("/quest/update", response_model=QuestResponse)
async def update_progress(update: QuestProgressUpdateRequest):
    """
    Endpoint to update the user's quest progress.
    """
    updated_quest = update_quest_progress(update)
    return JSONResponse(content=updated_quest)


@router.post("/quest/reset")
async def reset_quest():
    """
    Reset all quest progress data.
    """
    return reset_daily_quest()
