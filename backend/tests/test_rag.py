"""
Basic tests for the multi-tenant RAG application.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint returns API information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data
    assert data["version"] == "1.0.0"


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "environment" in data
    assert "version" in data


def test_upload_document_missing_tenant():
    """Test document upload fails without tenant ID."""
    response = client.post(
        "/documents",
        json={"text": "Test document"}
    )
    assert response.status_code == 401


def test_query_missing_tenant():
    """Test query fails without tenant ID."""
    response = client.post(
        "/query",
        json={"question": "Test question?"}
    )
    assert response.status_code == 401


def test_upload_document_invalid_tenant():
    """Test document upload fails with invalid tenant ID."""
    response = client.post(
        "/documents",
        json={"text": "Test document"},
        headers={"X-Tenant-ID": "invalid@tenant!"}
    )
    assert response.status_code == 401


def test_upload_document_empty_text():
    """Test document upload fails with empty text."""
    response = client.post(
        "/documents",
        json={"text": ""},
        headers={"X-Tenant-ID": "test-tenant"}
    )
    assert response.status_code == 422  # Validation error


def test_query_empty_question():
    """Test query fails with empty question."""
    response = client.post(
        "/query",
        json={"question": ""},
        headers={"X-Tenant-ID": "test-tenant"}
    )
    assert response.status_code == 422  # Validation error


# Note: Integration tests requiring actual Pinecone/OpenAI connections
# should be run separately with proper credentials and test namespaces
