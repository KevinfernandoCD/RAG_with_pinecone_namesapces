"""
Embedding generation service using HuggingFace Sentence Transformers.
"""
import logging
from typing import List
from sentence_transformers import SentenceTransformer
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating text embeddings using HuggingFace."""
    
    def __init__(self):
        """Initialize HuggingFace Sentence Transformer model."""
        self.model_name = settings.embedding_model
        logger.info(f"Loading embedding model: {self.model_name}")
        
        try:
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Successfully loaded model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {str(e)}")
            raise
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Input text to embed
            
        Returns:
            List of floats representing the embedding vector
        """
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            embedding_list = embedding.tolist()
            logger.debug(f"Generated embedding with dimension: {len(embedding_list)}")
            return embedding_list
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {str(e)}")
            raise
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in a batch.
        
        Args:
            texts: List of input texts to embed
            
        Returns:
            List of embedding vectors
        """
        try:
            embeddings = self.model.encode(
                texts,
                convert_to_numpy=True,
                show_progress_bar=len(texts) > 10
            )
            embeddings_list = [emb.tolist() for emb in embeddings]
            logger.info(f"Generated {len(embeddings_list)} embeddings in batch")
            return embeddings_list
            
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {str(e)}")
            raise


# Global embedding service instance
embedding_service = EmbeddingService()
