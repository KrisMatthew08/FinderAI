from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str


app = FastAPI(title="FinderAI API", version="0.1.0")


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.post("/ai/search")
def ai_search(req: SearchRequest):
    q = (req.query or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="query is required")

    # TODO: Replace with real AI search workflow per project proposal
    # e.g., embed query -> retrieve candidates -> rank -> return results
    return {
        "query": q,
        "results": [],
        "note": "AI search is not implemented yet."
    }
