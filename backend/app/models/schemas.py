"""
Pydantic models for request/response validation.
"""
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class DocumentUploadRequest(BaseModel):
    """Request model for document upload."""
    
    text: str = Field(
        ...,
        description="Document text content",
        min_length=1,
        max_length=50000
    )
    metadata: Optional[dict] = Field(
        default=None,
        description="Optional metadata for the document"
    )
    
    @field_validator('text')
    @classmethod
    def validate_text(cls, v: str) -> str:
        """Ensure text is not empty after stripping."""
        if not v.strip():
            raise ValueError("Text cannot be empty or whitespace only")
        return v.strip()


class DocumentUploadResponse(BaseModel):
    """Response model for document upload."""
    
    success: bool = Field(..., description="Upload success status")
    document_id: str = Field(..., description="Unique document identifier")
    message: str = Field(..., description="Success message")
    tenant_id: str = Field(..., description="Tenant identifier")


class QueryRequest(BaseModel):
    """Request model for RAG query."""
    
    question: str = Field(
        ...,
        description="User question",
        min_length=1,
        max_length=1000
    )
    top_k: Optional[int] = Field(
        default=None,
        description="Number of documents to retrieve (overrides default)",
        ge=1,
        le=20
    )
    
    @field_validator('question')
    @classmethod
    def validate_question(cls, v: str) -> str:
        """Ensure question is not empty after stripping."""
        if not v.strip():
            raise ValueError("Question cannot be empty or whitespace only")
        return v.strip()


class QueryResponse(BaseModel):
    """Response model for RAG query."""
    
    answer: str = Field(..., description="Generated answer")
    sources: List[dict] = Field(..., description="Retrieved source documents")
    tenant_id: str = Field(..., description="Tenant identifier")
    question: str = Field(..., description="Original question")


class TenantDeleteResponse(BaseModel):
    """Response model for tenant data deletion."""
    
    success: bool = Field(..., description="Deletion success status")
    message: str = Field(..., description="Success message")
    tenant_id: str = Field(..., description="Deleted tenant identifier")
    documents_deleted: int = Field(..., description="Number of documents deleted")


class HealthResponse(BaseModel):
    """Response model for health check."""
    
    status: str = Field(..., description="Service status")
    environment: str = Field(..., description="Application environment")
    version: str = Field(default="1.0.0", description="API version")


class ErrorResponse(BaseModel):
    """Standard error response model."""
    
    detail: str = Field(..., description="Error message")
    error_type: Optional[str] = Field(None, description="Error type/category")


class FileUploadResponse(BaseModel):
    """Response model for file upload."""
    
    success: bool = Field(..., description="Upload success status")
    files_processed: int = Field(..., description="Number of files processed")
    total_chunks: int = Field(..., description="Total chunks created")
    document_ids: List[str] = Field(..., description="List of document IDs")
    message: str = Field(..., description="Success message")
    tenant_id: str = Field(..., description="Tenant identifier")
