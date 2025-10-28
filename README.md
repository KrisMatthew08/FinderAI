# FinderAI

An initial scaffold for the FinderAI project, prepared from the attached project proposal. This repo starts with a Python FastAPI backend, a health check endpoint, and a placeholder AI search route you can extend per the proposal.

> Note: If you want a different stack (e.g., Node/Express, .NET, or a full web UI), say the word and I’ll adapt the scaffold.

## Tech stack

- Python 3.10+
- FastAPI (REST API)
- Uvicorn (ASGI server)
- Pytest (tests)

## Project structure

```
backend/
  app/
    __init__.py
    main.py          # FastAPI app: /healthz and /ai/search (placeholder)
  requirements.txt   # runtime deps
  dev-requirements.txt
  tests/
    test_api.py      # minimal tests
.github/
  workflows/
    ci.yml           # CI: lint/tests (pytest)
```

## Quick start (Windows PowerShell)

```
# Create & activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt -r backend/dev-requirements.txt

# Run the API locally
cd backend
uvicorn app.main:app --reload --port 8000
```

Open http://127.0.0.1:8000/docs to explore the interactive API.

## Available endpoints

- GET /healthz — simple health probe: {"status":"ok"}
- POST /ai/search — placeholder AI search with body: {"query": "..."}

## Tests

```
cd backend
pytest -q
```

## Next steps

- Replace the placeholder search logic in `app/main.py` with the approach specified in the project proposal (embedding model, retrieval, ranking, etc.).
- Add configuration (API keys, model choices) via environment variables.
- If needed, add a frontend and wire it to these endpoints.

## License

MIT — see `LICENSE`.
