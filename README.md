# Team-Hackathons

# The Smartest Grad School Application Risk Detector in the World

## Project Overview

**Project Name** is a revolutionary AI-powered system that **instantly detects hidden risks** in grad school applications, providing **expert-level feedback** to optimize applicants’ chances of success.

> "**Protect students' dreams by detecting fatal mistakes and turning good applications into great ones — instantly.**"

---

## Features

- **Document Upload**: Upload SOP and CV files securely.
- **AI Evaluation Module**:
  - Analyze relevance, tone, structure, and strengths.
  - Detect red flags like missing research experience or poor tone.
  - Generate detailed risk labels and a smart score (0–100).
- **Instant Risk Alerts**: Real-time sidebar alerts.
- **Visual Risk Score Dashboard**: Strengths, weaknesses, critical risks.
- **AI-Powered Final Checklist**: Personalized improvement items.
- **Real-time Feedback Updates**: Smooth, futuristic experience.

---

## Tech Stack

- **Backend**: FastAPI (Python)
- **AI Layer**: OpendI, Claude, Huggingface models (via API)
- **Document Parsing**: PDF/DOCX to text (`pdfminer`, `python-docx`)
- **Database**: Supabase or Firebase
- **Hosting**: Railway, Render, AWS

---

## BACKEND BASE URL: https://lyrical-mnn5.onrender.com

## API Endpoints Overview

| Method | Endpoint | Description |
|:------:|:--------:|:-----------:|
| `POST` | `/upload/essay` | Upload Statement of Purpose |
| `POST` | `/upload/resume` | Upload Resume/CV |
| `POST` | `/evualuate/essay` | Analyze uploaded essay |
| `GET`  | `/alerts/live-alerts` | Poll live document alerts |
| `GET`  | `/dashboard/score` | Fetch risk scores & improvements |
| `POST`  | `/checklist/generate-checklist` | Generate personalized checklist |
| `GET` | `/evaluate/tone` | For tone evaluation

---

## How It Works

1. Upload your Statement of Purpose and CV.
2. Backend parses and sends text to the AI Evaluator Module.
3. AI generates:
   - Risk Labels
   - Smart Score
   - Strengths & Weaknesses
4. Backend returns data for:
   - Visual Risk Dashboard
   - Instant Risk Alerts
   - Final Checklist

---

## Setup Instructions (For Developers)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/project-name-backend.git
   cd project-name-backend
   ```

2. **Create a Virtual Environment**
   ```bash
   python -m venv env
   source env/bin/activate   # Windows: env\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables**
   
   Create a `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=your_database_url
   ```

5. **Run the Server**
   ```bash
   uvicorn app.main:app --reload
   ```

6. **API Docs Available at**
   - Swagger UI: `http://localhost:8000/docs`
   - Redoc: `http://localhost:8000/redoc`

---

## File Structure

```
project-name-backend/
│
├── app/
│   ├── main.py
│   ├── api/
│   ├── services/
│   ├── models/
│   └── utils/
│
├── requirements.txt
├── README.md
└── .env.example
```

---

## Contribution Guidelines

We welcome contributions! Please submit a pull request or open an issue to suggest features or improvements.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

- Email: [your.email@example.com](mailto:your.email@example.com)
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)

---

## Quick Summary

> "**Project Name ensures that every grad school applicant submits an unstoppable application by detecting hidden risks, providing expert-level feedback instantly, and optimizing their chances of success.**"
