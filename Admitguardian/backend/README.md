# GradSchool Risk Detector - Backend

> "The Smartest Grad School Application Risk Detector in the World"

This repository contains the **backend** server for the GradSchool Risk Detector project — an AI-driven SaaS application that helps graduate school applicants detect hidden risks in their Statement of Purpose (SOP) and Resume documents, evaluate application quality, and maximize admission success.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Core Functionalities](#core-functionalities)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Tech Stack

- **Backend Framework:** FastAPI (Python 3.11+)
- **AI Services:** OpenRouter (Mixtral 8x7B), HuggingFace (flan-t5-large), Cohere (Grammar/Tone Analysis)
- **Parsing Libraries:** pdfminer.six, python-docx
- **Database:** MySQL
- **Containerization:** Docker (optional)
- **Deployment Options:** Railway, AWS, Render

---

## Folder Structure
backend/
│
├── app/
│   ├── api/
│   │   ├── essay.py          # Essay upload + analyze endpoints
│   │   ├── resume.py         # Resume upload + analyze endpoints
│   │   └── checklist.py      # Final checklist generator
│   │
│   ├── services/
│   │   ├── openrouter_service.py  # Handles OpenRouter API calls
│   │   ├── huggingface_service.py # Handles Huggingface API calls
│   │   └── cohere_service.py      # Handles Cohere API calls
│   │
│   ├── utils/
│   │   ├── scoring.py        # Smart scoring logic
│   │   └── parsers.py        # PDF-to-text or doc parsing
│   │
│   ├── models/
│   │   ├── request_models.py # Pydantic schemas for requests
│   │   └── response_models.py # Pydantic schemas for responses
│   │
│   └── main.py               # FastAPI app entry
│
├── requirements.txt          # FastAPI, aiohttp, pdfplumber, etc.
├── README.md                  # Project setup notes


---

## Core Functionalities

- **Document Upload:** Accepts SOPs, resumes (PDF, DOCX, TXT formats).
- **Risk Detection:** Evaluates essay and resume quality, detects critical flaws.
- **AI-Powered Scoring:**
  - SOP evaluated for structure, relevance, and red flags.
    - Resume assessed for academic strength and leadership evidence.
    - **Tone and Grammar Checks:** Improves tone, clarity, and language quality using Cohere.
    - **Live Risk Alerts:** Optional real-time monitoring of critical application errors during typing.
    - **Final Improvement Checklist:** Consolidated personalized feedback for applicants.
    - **MySQL Database:** (optional at this stage) Can store uploads, user profiles, analysis history.

    ---

    ## API Endpoints

    | Method | Endpoint | Description |
    |:------:|:---------|:------------|
    | POST   | `/api/v1/upload/essay`      | Upload and analyze SOP |
    | POST   | `/api/v1/upload/resume`     | Upload and analyze Resume |
    | POST   | `/api/v1/analyze/essay`     | Send SOP content for risk analysis |
    | POST   | `/api/v1/analyze/resume`    | Send Resume content for evaluation |
    | GET    | `/api/v1/dashboard/score`   | Fetch user's full risk evaluation |
    | GET    | `/api/v1/checklist/fixes`   | Retrieve critical improvement checklist |
    | GET    | `/api/v1/alerts/live`       | Fetch real-time alerts (Optional live mode) |

    ---

    ## Environment Variables

    You need to create a `.env` file in the `/backend` directory.  
    See `.env.example` for a template.

    ```env
    # OpenRouter API key for LLM tasks
    OPENROUTER_API_KEY=your_openrouter_api_key_here

    # Huggingface API key for resume evaluation
    HUGGINGFACE_API_KEY=your_huggingface_api_key_here

    # Cohere API key for tone and grammar analysis
    COHERE_API_KEY=your_cohere_api_key_here

    # MySQL Database credentials
    MYSQL_HOST=localhost
    MYSQL_PORT=3306
    MYSQL_USER=your_mysql_username
    MYSQL_PASSWORD=your_mysql_password
    MYSQL_DATABASE=gradschool_risk_detector
    ```

    ---

    ## Running Locally

    1. Clone the repository:

       ```bash
          git clone https://github.com/yourorg/gradschool-risk-detector.git
             cd gradschool-risk-detector/backend
                ```

                2. Set up a virtual environment:

                   ```bash
                      python3 -m venv venv
                         source venv/bin/activate  # On Windows: venv\Scripts\activate
                            ```

                            3. Install dependencies:

                               ```bash
                                  pip install -r requirements.txt
                                     ```

                                     4. Create your `.env` file based on `.env.example`.

                                     5. Run the server:

                                        ```bash
                                           uvicorn app.main:app --reload
                                              ```

                                              Server will be available at:

                                              ```
                                              http://127.0.0.1:8000
                                              ```

                                              Interactive API documentation (Swagger UI) available at:

                                              ```
                                              http://127.0.0.1:8000/docs
                                              ```

                                              ---

                                              ## Deployment

                                              - **Railway.app** (for easy MySQL hosting + FastAPI)
                                              - **Render.com**
                                              - **AWS EC2 + RDS MySQL**

                                              Production tips:

                                              - Use `gunicorn` or `uvicorn` with multiple workers.
                                              - Configure CORS properly.
                                              - Secure your `.env` credentials.
                                              - Setup HTTPS (SSL).

                                              ---

                                              ## Contributing

                                              - Follow clean and modular coding practices.
                                              - Keep service logic separated from API routes.
                                              - Use clear and descriptive commit messages.
                                              - Write simple and documented API endpoints.

                                              Pull requests are welcome!

                                              ---

                                              > "This backend is the engine that powers the world's smartest AI-driven graduate scno clue XRhool application risk detector — cc by cool ccblazing fast, accurate, and applicant-focused."