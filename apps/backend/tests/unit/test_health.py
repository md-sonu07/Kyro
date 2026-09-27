import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "app": "Kyro"}

def test_api_system_health():
    response = client.get("/api/system/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "Kyro Backend"
