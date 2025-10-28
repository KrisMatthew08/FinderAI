import os
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket


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


# --- MongoDB / GridFS setup ---
def _get_mongo_settings():
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB", "finderai")
    bucket_name = os.getenv("GRIDFS_BUCKET", "images")
    return uri, db_name, bucket_name


def _get_bucket() -> Optional[AsyncIOMotorGridFSBucket]:
    # Lazy init and cache on app.state
    bucket = getattr(app.state, "gridfs_bucket", None)
    if bucket is not None:
        return bucket
    uri, db_name, bucket_name = _get_mongo_settings()
    try:
        client = AsyncIOMotorClient(uri)
        db = client[db_name]
        bucket = AsyncIOMotorGridFSBucket(db, bucket_name=bucket_name)
        app.state.mongo_client = client
        app.state.mongo_db = db
        app.state.gridfs_bucket = bucket
        return bucket
    except Exception:
        return None


@app.post("/images")
async def upload_image(file: UploadFile = File(...)):
    if file is None:
        raise HTTPException(status_code=400, detail="file is required")

    bucket = _get_bucket()
    if bucket is None:
        raise HTTPException(status_code=503, detail="database not available")

    # Read file bytes into memory for simplicity; switch to streaming for large files
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty file")

    metadata = {"contentType": file.content_type}
    try:
        file_id = await bucket.upload_from_stream(file.filename or "upload", data, metadata=metadata)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"upload failed: {e}")

    return {
        "id": str(file_id),
        "filename": file.filename,
        "contentType": file.content_type,
        "length": len(data),
    }


@app.get("/images/{image_id}")
async def get_image(image_id: str):
    bucket = _get_bucket()
    if bucket is None:
        raise HTTPException(status_code=503, detail="database not available")

    try:
        oid = ObjectId(image_id)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid id")

    try:
        grid_out = await bucket.open_download_stream(oid)
        content = await grid_out.read()
        content_type = getattr(grid_out, "metadata", {}).get("contentType") or "application/octet-stream"
        return Response(content=content, media_type=content_type)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"image not found: {e}")


@app.delete("/images/{image_id}")
async def delete_image(image_id: str):
    bucket = _get_bucket()
    if bucket is None:
        raise HTTPException(status_code=503, detail="database not available")

    try:
        oid = ObjectId(image_id)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid id")

    try:
        await bucket.delete(oid)
        return {"deleted": True, "id": image_id}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"image not found: {e}")
