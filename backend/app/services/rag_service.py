"""
RAG (Retrieval-Augmented Generation) service.
Orchestrates the complete RAG pipeline: retrieval + generation.
"""
import logging
from typing import List, Dict, Any
import google.generativeai as genai
from app.core.config import settings
from app.services.embeddings import embedding_service
from app.services.pinecone_service import pinecone_service

logger = logging.getLogger(__name__)


class RAGService:
    """Service for RAG pipeline orchestration."""
    
    def __init__(self):
        """Initialize RAG service with Google Gemini."""
        genai.configure(api_key=settings.google_api_key)
        self.model = genai.GenerativeModel(settings.gemini_model)
        self.max_tokens = settings.max_tokens
        self.temperature = settings.temperature
        logger.info(f"Initialized RAGService with Gemini model: {settings.gemini_model}")
    
    def upload_document(
        self,
        tenant_id: str,
        text: str,
        metadata: Dict[str, Any] = None
    ) -> str:
        """
        Upload a document for a tenant.
        
        Args:
            tenant_id: Tenant identifier
            text: Document text
            metadata: Optional metadata
            
        Returns:
            Document ID
        """
        logger.info(f"Uploading document for tenant: {tenant_id}")
        
        # Generate embedding
        embedding = embedding_service.generate_embedding(text)
        
        # Store in Pinecone
        document_id = pinecone_service.upsert_document(
            tenant_id=tenant_id,
            text=text,
            embedding=embedding,
            metadata=metadata
        )
        
        logger.info(f"Document uploaded successfully: {document_id}")
        return document_id
    
    def upload_documents_batch(
        self,
        tenant_id: str,
        chunks: List[Dict[str, Any]]
    ) -> List[str]:
        """
        Upload multiple document chunks for a tenant.
        
        Args:
            tenant_id: Tenant identifier
            chunks: List of chunks with text and metadata
            
        Returns:
            List of document IDs
        """
        logger.info(f"Uploading {len(chunks)} chunks for tenant: {tenant_id}")
        
        # Extract texts for batch embedding
        texts = [chunk["text"] for chunk in chunks]
        
        # Generate embeddings in batch
        embeddings = embedding_service.generate_embeddings_batch(texts)
        
        # Store all chunks in Pinecone
        document_ids = []
        for chunk, embedding in zip(chunks, embeddings):
            document_id = pinecone_service.upsert_document(
                tenant_id=tenant_id,
                text=chunk["text"],
                embedding=embedding,
                metadata=chunk.get("metadata", {})
            )
            document_ids.append(document_id)
        
        logger.info(f"Uploaded {len(document_ids)} chunks successfully")
        return document_ids
    
    def query(
        self,
        tenant_id: str,
        question: str,
        top_k: int = None
    ) -> Dict[str, Any]:
        """
        Execute RAG query for a tenant.
        
        Args:
            tenant_id: Tenant identifier
            question: User question
            top_k: Number of documents to retrieve
            
        Returns:
            Dictionary with answer and sources
        """
        if top_k is None:
            top_k = settings.top_k_results
        
        logger.info(f"Processing query for tenant: {tenant_id}")
        
        # Step 1: Generate query embedding
        query_embedding = embedding_service.generate_embedding(question)
        
        # Step 2: Retrieve relevant documents
        documents = pinecone_service.query_documents(
            tenant_id=tenant_id,
            query_embedding=query_embedding,
            top_k=top_k
        )
        
        if not documents:
            logger.warning(f"No documents found for tenant: {tenant_id}")
            return {
                "answer": "I don't have enough information to answer this question. Please upload relevant documents first.",
                "sources": [],
                "question": question
            }
        
        # Step 3: Build context from retrieved documents
        context = self._build_context(documents)
        
        # Step 4: Generate answer using LLM
        answer = self._generate_answer(question, context)
        
        # Step 5: Format sources
        sources = self._format_sources(documents)
        
        logger.info(f"Query completed successfully for tenant: {tenant_id}")
        
        return {
            "answer": answer,
            "sources": sources,
            "question": question
        }
    
    def _build_context(self, documents: List[Dict[str, Any]]) -> str:
        """
        Build context string from retrieved documents.
        
        Args:
            documents: List of retrieved documents
            
        Returns:
            Formatted context string
        """
        context_parts = []
        for i, doc in enumerate(documents, 1):
            text = doc.get("text", "")
            score = doc.get("score", 0)
            context_parts.append(f"[Document {i}] (Relevance: {score:.2f})\n{text}")
        
        return "\n\n".join(context_parts)
    
    def _generate_answer(self, question: str, context: str) -> str:
        """
        Generate answer using Gemini with context.
        
        Args:
            question: User question
            context: Retrieved context
            
        Returns:
            Generated answer
        """
        prompt = f"""You are a helpful assistant that answers questions based on the provided context.
Use only the information from the context to answer the question.
If the context doesn't contain enough information to answer the question, say so clearly.
Be concise and accurate in your responses.

Context:
{context}

Question: {question}

Answer:"""
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=self.max_tokens,
                    temperature=self.temperature,
                )
            )
            
            answer = response.text.strip()
            logger.debug(f"Generated answer: {answer[:100]}...")
            return answer
            
        except Exception as e:
            logger.error(f"Failed to generate answer with Gemini: {str(e)}")
            raise
    
    def _format_sources(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Format source documents for response.
        
        Args:
            documents: Retrieved documents
            
        Returns:
            Formatted source list
        """
        sources = []
        for doc in documents:
            sources.append({
                "id": doc.get("id"),
                "text": doc.get("text", "")[:200] + "...",  # Truncate for response
                "score": round(doc.get("score", 0), 4)
            })
        return sources


# Global RAG service instance
rag_service = RAGService()
