import os
import io
import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


mongo_uri = os.getenv("MONGODB_URI")


requires_mongo = pytest.mark.skipif(
    not mongo_uri,
    reason="MONGODB_URI not set; skipping Mongo-dependent tests",
)


@requires_mongo
def test_image_upload_get_delete_roundtrip():
    # Prepare a tiny PNG header (not a full valid image, but fine for storage test)
    fake_png = b"\x89PNG\r\n\x1a\n" + b"0" * 64
    files = {"file": ("test.png", io.BytesIO(fake_png), "image/png")}

    # Upload
    r = client.post("/images", files=files)
    assert r.status_code == 200, r.text
    body = r.json()
    image_id = body["id"]

    # Get
    r2 = client.get(f"/images/{image_id}")
    assert r2.status_code == 200
    assert r2.headers.get("content-type", "").startswith("image/png")
    assert r2.content[:8] == b"\x89PNG\r\n\x1a\n"

    # Delete
    r3 = client.delete(f"/images/{image_id}")
    assert r3.status_code == 200
    assert r3.json().get("deleted") is True
