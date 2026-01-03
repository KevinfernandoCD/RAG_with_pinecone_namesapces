"""
Pinecone vector database service with namespace-based tenant isolation.
"""
import logging
import uuid
from typing import List, Dict, Any, Optional
from pinecone import Pinecone, ServerlessSpec
from app.core.config import settings
from app.core.security import sanitize_namespace

logger = logging.getLogger(__name__)


class PineconeService:
    """Service for interacting with Pinecone vector database."""
    
    def __init__(self):
        """Initialize Pinecone client and index."""
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index_name = settings.pinecone_index_name
        self.index = None
        logger.info(f"Initialized PineconeService for index: {self.index_name}")
    
    def connect(self):
        """Connect to Pinecone index."""
        try:
            self.index = self.pc.Index(self.index_name)
            logger.info(f"Connected to Pinecone index: {self.index_name}")
        except Exception as e:
            logger.error(f"Failed to connect to Pinecone index: {str(e)}")
            raise
    
    def upsert_document(
        self,
        tenant_id: str,
        text: str,
        embedding: List[float],
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Upsert a document vector into tenant's namespace.
        
        Args:
            tenant_id: Tenant identifier
            text: Document text
            embedding: Document embedding vector
            metadata: Optional metadata
            
        Returns:
            Document ID
        """
        if not self.index:
            self.connect()
        
        namespace = sanitize_namespace(tenant_id)
        document_id = str(uuid.uuid4())
        
        # Prepare metadata
        doc_metadata = {
            "text": text,
            "tenant_id": tenant_id,
            **(metadata or {})
        }
        
        # Upsert to Pinecone
        try:
            self.index.upsert(
                vectors=[
                    {
                        "id": document_id,
                        "values": embedding,
                        "metadata": doc_metadata
                    }
                ],
                namespace=namespace
            )
            logger.info(f"Upserted document {document_id} for tenant {tenant_id}")
            return document_id
            
        except Exception as e:
            logger.error(f"Failed to upsert document: {str(e)}")
            raise
    
    def query_documents(
        self,
        tenant_id: str,
        query_embedding: List[float],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Query documents from tenant's namespace.
        
        Args:
            tenant_id: Tenant identifier
            query_embedding: Query embedding vector
            top_k: Number of results to return
            
        Returns:
            List of matching documents with metadata
        """
        if not self.index:
            self.connect()
        
        namespace = sanitize_namespace(tenant_id)
        
        try:
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                namespace=namespace,
                include_metadata=True
            )
            
            # Extract and format results
            documents = []
            for match in results.matches:
                documents.append({
                    "id": match.id,
                    "score": match.score,
                    "text": match.metadata.get("text", ""),
                    "metadata": match.metadata
                })
            
            logger.info(f"Retrieved {len(documents)} documents for tenant {tenant_id}")
            return documents
            
        except Exception as e:
            logger.error(f"Failed to query documents: {str(e)}")
            raise
    
    def delete_tenant_data(self, tenant_id: str) -> int:
        """
        Delete all data for a tenant (namespace).
        
        Args:
            tenant_id: Tenant identifier
            
        Returns:
            Number of vectors deleted (estimated)
        """
        if not self.index:
            self.connect()
        
        namespace = sanitize_namespace(tenant_id)
        
        try:
            # Get namespace stats before deletion
            stats = self.index.describe_index_stats()
            namespace_stats = stats.namespaces.get(namespace, {})
            vector_count = namespace_stats.get('vector_count', 0)
            
            # Delete all vectors in namespace
            self.index.delete(delete_all=True, namespace=namespace)
            
            logger.info(f"Deleted namespace {namespace} for tenant {tenant_id}")
            return vector_count
            
        except Exception as e:
            logger.error(f"Failed to delete tenant data: {str(e)}")
            raise
    
    def get_namespace_stats(self, tenant_id: str) -> Dict[str, Any]:
        """
        Get statistics for a tenant's namespace.
        
        Args:
            tenant_id: Tenant identifier
            
        Returns:
            Namespace statistics
        """
        if not self.index:
            self.connect()
        
        namespace = sanitize_namespace(tenant_id)
        
        try:
            stats = self.index.describe_index_stats()
            namespace_stats = stats.namespaces.get(namespace, {})
            return {
                "namespace": namespace,
                "vector_count": namespace_stats.get('vector_count', 0)
            }
        except Exception as e:
            logger.error(f"Failed to get namespace stats: {str(e)}")
            raise


# Global Pinecone service instance
pinecone_service = PineconeService()
