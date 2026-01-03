"""
API routes for multi-tenant RAG application.
"""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.api.dependencies import get_tenant_id
from app.models.schemas import (
    DocumentUploadRequest,
    DocumentUploadResponse,
    QueryRequest,
    QueryResponse,
    TenantDeleteResponse,
    HealthResponse,
    FileUploadResponse
)
from app.services.rag_service import rag_service
from app.services.pinecone_service import pinecone_service
from app.core.config import settings
from app.core.security import sanitize_text_input

logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint for load balancers and monitoring.
    """
    return HealthResponse(
        status="ok",
        environment=settings.app_env,
        version="1.0.0"
    )


@router.post("/documents", response_model=DocumentUploadResponse, tags=["Documents"])
async def upload_document(
    request: DocumentUploadRequest,
    tenant_id: str = Depends(get_tenant_id)
):
    """
    Upload a document for a specific tenant.
    
    The document will be embedded and stored in the tenant's namespace.
    
    - **text**: Document text content (required)
    - **metadata**: Optional metadata dictionary
    """
    try:
        # Sanitize input
        text = sanitize_text_input(request.text)
        
        # Upload document
        document_id = rag_service.upload_document(
            tenant_id=tenant_id,
            text=text,
            metadata=request.metadata
        )
        
        logger.info(f"Document uploaded: {document_id} for tenant: {tenant_id}")
        
        return DocumentUploadResponse(
            success=True,
            document_id=document_id,
            message="Document uploaded successfully",
            tenant_id=tenant_id
        )
        
    except Exception as e:
        logger.error(f"Failed to upload document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )


@router.post("/upload-files", response_model=FileUploadResponse, tags=["Documents"])
async def upload_files(
    files: List[UploadFile],
    tenant_id: str = Depends(get_tenant_id)
):
    """
    Upload multiple PDF files for a specific tenant.
    
    Files will be parsed, chunked, embedded, and stored in the tenant's namespace.
    
    - **files**: List of PDF files to upload
    """
    from fastapi import UploadFile, File
    from app.services.pdf_parser import pdf_parser
    from app.models.schemas import FileUploadResponse
    
    try:
        if not files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No files provided"
            )
        
        all_chunks = []
        files_processed = 0
        
        for file in files:
            # Validate file type
            if not file.filename.lower().endswith('.pdf'):
                logger.warning(f"Skipping non-PDF file: {file.filename}")
                continue
            
            # Read file content
            file_content = await file.read()
            
            # Process PDF: extract text and chunk
            chunks = pdf_parser.process_pdf(
                file_content=file_content,
                filename=file.filename,
                additional_metadata={"uploaded_by": tenant_id}
            )
            
            all_chunks.extend(chunks)
            files_processed += 1
            logger.info(f"Processed {file.filename}: {len(chunks)} chunks")
        
        if not all_chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid PDF files found or no text could be extracted"
            )
        
        # Upload all chunks in batch
        document_ids = rag_service.upload_documents_batch(
            tenant_id=tenant_id,
            chunks=all_chunks
        )
        
        logger.info(
            f"Successfully uploaded {files_processed} files "
            f"({len(all_chunks)} chunks) for tenant: {tenant_id}"
        )
        
        return FileUploadResponse(
            success=True,
            files_processed=files_processed,
            total_chunks=len(all_chunks),
            document_ids=document_ids,
            message=f"Successfully uploaded {files_processed} file(s) with {len(all_chunks)} chunks",
            tenant_id=tenant_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upload files: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload files: {str(e)}"
        )


@router.post("/query", response_model=QueryResponse, tags=["Query"])
async def query_rag(
    request: QueryRequest,
    tenant_id: str = Depends(get_tenant_id)
):
    """
    Query the RAG system for a specific tenant.
    
    The system will:
    1. Embed the question
    2. Retrieve relevant documents from the tenant's namespace
    3. Generate an answer using the LLM with retrieved context
    
    - **question**: User question (required)
    - **top_k**: Number of documents to retrieve (optional, default: 5)
    """
    try:
        # Sanitize input
        question = sanitize_text_input(request.question, max_length=1000)
        
        # Execute RAG query
        result = rag_service.query(
            tenant_id=tenant_id,
            question=question,
            top_k=request.top_k
        )
        
        logger.info(f"Query completed for tenant: {tenant_id}")
        
        return QueryResponse(
            answer=result["answer"],
            sources=result["sources"],
            tenant_id=tenant_id,
            question=result["question"]
        )
        
    except Exception as e:
        logger.error(f"Failed to process query: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process query: {str(e)}"
        )


@router.delete("/tenant", response_model=TenantDeleteResponse, tags=["Tenant"])
async def delete_tenant_data(
    tenant_id: str = Depends(get_tenant_id)
):
    """
    Delete all data for a tenant (offboarding).
    
    This will permanently delete all documents in the tenant's namespace.
    This action cannot be undone.
    """
    try:
        # Delete tenant data
        documents_deleted = pinecone_service.delete_tenant_data(tenant_id)
        
        logger.info(f"Deleted all data for tenant: {tenant_id}")
        
        return TenantDeleteResponse(
            success=True,
            message="Tenant data deleted successfully",
            tenant_id=tenant_id,
            documents_deleted=documents_deleted
        )
        
    except Exception as e:
        logger.error(f"Failed to delete tenant data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete tenant data: {str(e)}"
        )


@router.get("/tenant/stats", tags=["Tenant"])
async def get_tenant_stats(
    tenant_id: str = Depends(get_tenant_id)
):
    """
    Get statistics for a tenant's namespace.
    
    Returns the number of documents stored for the tenant.
    """
    try:
        stats = pinecone_service.get_namespace_stats(tenant_id)
        
        return {
            "tenant_id": tenant_id,
            "namespace": stats["namespace"],
            "document_count": stats["vector_count"]
        }
        
    except Exception as e:
        logger.error(f"Failed to get tenant stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tenant stats: {str(e)}"
        )


@router.get("/tenant/documents", tags=["Tenant"])
async def list_tenant_documents(
    tenant_id: str = Depends(get_tenant_id)
):
    """
    List all unique filenames for a tenant.
    """
    try:
        filenames = pinecone_service.list_unique_filenames(tenant_id)
        return {"tenant_id": tenant_id, "documents": filenames}
    except Exception as e:
        logger.error(f"Failed to list documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list documents: {str(e)}"
        )


@router.delete("/tenant/documents/{filename}", tags=["Tenant"])
async def delete_tenant_document(
    filename: str,
    tenant_id: str = Depends(get_tenant_id)
):
    """
    Delete a specific document by filename for a tenant.
    """
    try:
        pinecone_service.delete_document_by_filename(tenant_id, filename)
        return {"success": True, "message": f"Document {filename} deleted", "tenant_id": tenant_id}
    except Exception as e:
        logger.error(f"Failed to delete document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )
