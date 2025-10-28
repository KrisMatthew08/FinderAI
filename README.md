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
    main.py          # FastAPI app: /healthz, /ai/search, /images (GridFS)
  requirements.txt   # runtime deps
  dev-requirements.txt
  tests/
    test_api.py      # minimal tests
    test_images.py   # image endpoint tests
node-server/         # Node.js image service (alternative)
  index.js           # Express + GridFS
  db.js
  middleware/
    upload.js        # Multer GridFS storage
  routes/
    upload.js
  package.json
  README.md
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

### Image storage with MongoDB (GridFS)

Environment variables:

- MONGODB_URI (default: mongodb://localhost:27017)
- MONGODB_DB (default: finderai)
- GRIDFS_BUCKET (default: images)

Endpoints:

- POST /images — multipart/form-data with field "file"; stores into GridFS, returns { id, filename, contentType, length }
- GET /images/{id} — streams the binary content with the original Content-Type
- DELETE /images/{id} — deletes the stored file

Example (PowerShell, optional):

```
$Env:MONGODB_URI = "mongodb://localhost:27017"
$Env:MONGODB_DB = "finderai"
```

## Tests

```
cd backend
pytest -q
```

Notes:
- Image endpoint tests are skipped unless `MONGODB_URI` is set and reachable.

## Next steps

- Replace the placeholder search logic in `app/main.py` with the approach specified in the project proposal (embedding model, retrieval, ranking, etc.).
- Add configuration (API keys, model choices) via environment variables.
- If needed, add a frontend and wire it to these endpoints.
- Choose between the Python FastAPI image endpoints or the Node.js service (or run both on different ports).

## Node.js Image Service (alternative)

If you prefer the Node/Express implementation from [sk-Jahangeer/media-upload-node-mongo](https://github.com/sk-Jahangeer/media-upload-node-mongo), see `node-server/README.md` for setup and usage. It offers the same GridFS-based upload/retrieve/delete but in a separate Node process.

## License

MIT — see `LICENSE`.
