"""
Security utilities for tenant authentication and validation.
"""
import re
from typing import Optional
from fastapi import HTTPException, status


class SecurityError(HTTPException):
    """Custom exception for security-related errors."""
    
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


def validate_tenant_id(tenant_id: Optional[str]) -> str:
    """
    Validate tenant ID format and presence.
    
    Args:
        tenant_id: Tenant identifier from request header
        
    Returns:
        Validated tenant ID
        
    Raises:
        SecurityError: If tenant ID is missing or invalid
    """
    if not tenant_id:
        raise SecurityError("Missing X-Tenant-ID header")
    
    # Remove whitespace
    tenant_id = tenant_id.strip()
    
    if not tenant_id:
        raise SecurityError("X-Tenant-ID header cannot be empty")
    
    # Validate format: alphanumeric, hyphens, underscores only
    if not re.match(r'^[a-zA-Z0-9_-]+$', tenant_id):
        raise SecurityError(
            "Invalid tenant ID format. Only alphanumeric characters, hyphens, and underscores are allowed."
        )
    
    # Length validation
    if len(tenant_id) < 3 or len(tenant_id) > 64:
        raise SecurityError("Tenant ID must be between 3 and 64 characters")
    
    return tenant_id


def sanitize_namespace(tenant_id: str) -> str:
    """
    Sanitize tenant ID for use as Pinecone namespace.
    
    Args:
        tenant_id: Validated tenant identifier
        
    Returns:
        Sanitized namespace string
    """
    # Convert to lowercase for consistency
    namespace = tenant_id.lower()
    
    # Replace any remaining special characters with underscores
    namespace = re.sub(r'[^a-z0-9_-]', '_', namespace)
    
    return namespace


def sanitize_text_input(text: str, max_length: int = 50000) -> str:
    """
    Sanitize text input to prevent injection attacks.
    
    Args:
        text: Input text to sanitize
        max_length: Maximum allowed text length
        
    Returns:
        Sanitized text
        
    Raises:
        HTTPException: If text is too long or empty
    """
    if not text or not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text input cannot be empty"
        )
    
    text = text.strip()
    
    if len(text) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Text input exceeds maximum length of {max_length} characters"
        )
    
    return text
