# Project Name - Backend

> "The Smartest Grad School Application Risk Detector in the World"

This is the backend server for **Project Name**, an AI-powered SaaS web application that helps graduate school applicants detect hidden flaws in their applications, improve their essays and resumes, and maximize their chances of success.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Core Functionalities](#core-functionalities)
- [API Endpoints](#api-endpoints)
- [AI Services Used](#ai-services-used)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Tech Stack

- **Backend Framework:** FastAPI (Python 3.11+)
- **AI APIs:** OpenRouter (Mixtral 8x7B), HuggingFace (flan-t5-large), Cohere (Grammar/Tone)
- **Database:** Supabase (Optional for saving user document history)
- **File Parsing:** `pdfminer.six`, `python-docx`
- **Hosting Recommendation:** Railway, AWS, Render

---

## Folder Structure

```
backend/
│
├── app/
│   ├── api/                # API route definitions
│   ├── core/               # Settings, config, API keys
│   ├── services/           # AI API interaction logic (OpenRouter, HuggingFace, Cohere)
│   ├── models/             # Request and response schemas (Pydantic models)
│   ├── utils/              # File parsing, scoring, helpers
│   └── main.py             # FastAPI app instance
│
├── requirements.txt        # Python dependencies
├── alembic/ (optional)      # Database migrations if needed
└── README.md                # Documentation
```

---

## Core Functionalities

- **Upload Documents:** Accepts essay and/or CV uploads (PDF, DOCX, TXT).
- **Instant AI Risk Evaluation:**
  - Essay evaluation (relevance, strengths, risks) via OpenRouter.
  - Resume evaluation (academic strength, leadership) via HuggingFace.
  - Tone, grammar, and clarity checks via Cohere.
- **Risk Scoring:**
  - Each document scored from 0–100.
  - Risk labels and suggested improvements generated.
- **Real-Time Instant Alerts:**
  - API supports live polling for immediate red flag detection.
- **Final Personalized Checklist:**
  - Aggregates all findings into a critical fixes checklist.

---

## API Endpoints

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| POST   | `/upload/essay` | Upload and evaluate essay |
| POST   | `/upload/resume` | Upload and evaluate resume |
| POST   | `/evaluate/essay` | Run essay content through AI evaluation |
| POST   | `/evaluate/resume` | Run resume through strength detection AI |
| POST   | `/evaluate/tone` | Run tone and grammar analysis |
| GET    | `/dashboard/score` | Retrieve full risk score and improvement suggestions |
| GET    | `/live-alerts` | (Optional) Live instant alerts during typing/upload |
| GET    | `/final-checklist` | Generate final checklis



/upload/essay → Upload essay file or text

/upload/resume → Upload resume file or text

/evaluate/essay → Analyze essay (OpenRouter API + Cohere API)

/evaluate/resume → Analyze resume (Huggingface API + Cohere API)

/final-checklist → Generate final checklist (OpenRouter API)

/dashboard/score → Calculate Smart Risk Score (backend logic)

/live-alerts → Polling endpoint for instant sidebar red flags
---

## AI Services Used

- **OpenRouter (Mixtral 8x7B / Mistral 7B):**
  - Essay evaluation: structure, strength, alignment, red flags.
- **HuggingFace API (flan-t5-large):**
  - Resume academic and leadership experience detection.
- **Cohere API:**
  - Tone analysis, grammar quality, and clarity checking.

> All AI interactions are optimized for fast responses and cost-free models (no card needed).

---

## Environment Variables

Create a `.env` file at the backend root with the following:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
COHERE_API_KEY=your_cohere_api_key
SUPABASE_URL=your_supabase_url (optional)
SUPABASE_SERVICE_KEY=your_supabase_key (optional)
```

---

## Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourorg/project-name.git
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

Server will be running at: `http://127.0.0.1:8000`

API docs available at: `http://127.0.0.1:8000/docs`

---

## Deployment

Recommended platforms:

- **Railway.app** (easy for FastAPI + Postgres/Supabase setup)
- **AWS EC2 / Lightsail**
- **Render.com**

Production tips:

- Use `gunicorn` or `uvicorn` with workers.
- Add HTTPS, CORS, and environment variables securely.

---

## Contributing

Pull requests are welcome! Please follow clean code practices:

- Separate service logic from controllers.
- Document any new endpoints clearly.
- Test API endpoints before submitting.

---

> "Project Name backend empowers the frontend by providing blazing-fast document analysis, AI-driven insights, and a structured, scalable API — the brain behind the world's smartest grad school application protector."




this is the right one:
