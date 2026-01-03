"""
FastAPI dependencies for request validation and tenant extraction.
"""
from typing import Optional
from fastapi import Header, HTTPException, status
from app.core.security import validate_tenant_id


async def get_tenant_id(
    x_tenant_id: Optional[str] = Header(None, description="Tenant identifier")
) -> str:
    """
    Extract and validate tenant ID from request header.
    
    Args:
        x_tenant_id: Tenant ID from X-Tenant-ID header
        
    Returns:
        Validated tenant ID
        
    Raises:
        HTTPException: If tenant ID is missing or invalid
    """
    try:
        return validate_tenant_id(x_tenant_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
