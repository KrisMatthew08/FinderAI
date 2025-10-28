from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_healthz():
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_ai_search_requires_query():
    r = client.post("/ai/search", json={"query": ""})
    assert r.status_code == 400


def test_ai_search_returns_stub():
    r = client.post("/ai/search", json={"query": "hello"})
    assert r.status_code == 200
    body = r.json()
    assert body.get("query") == "hello"
    assert "results" in body
