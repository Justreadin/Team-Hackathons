from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.api import essay, resume, checklist, alerts, tone, dashboard, quest


@asynccontextmanager
async def lifespan(app: FastAPI):
    #setup_nltk_resources()
    yield

app = FastAPI(
    title="Document Analysis API",
    description="An API for analyzing essays, resumes, generating checklists, and real-time alerts.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(essay.router, prefix="/essay", tags=["Essay"])
app.include_router(resume.router, prefix="/resume", tags=["Resume"])
app.include_router(checklist.router, prefix="/checklist", tags=["Checklist"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
app.include_router(tone.router, prefix="/evaluate", tags=["tone"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(quest.router, tags=["quest"])

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Document Analysis API!"}

@app.head("/")
def head_root():
    return



#uvicorn main:app --host 0.0.0.0 --port 8080 --reload
#uvicorn main:app --host 127.0.0.1 --port 8000 --reload