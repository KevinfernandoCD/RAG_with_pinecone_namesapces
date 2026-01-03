"""
Configuration management using Pydantic Settings.
Loads and validates environment variables at startup.
"""
from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Application
    app_env: str = Field(default="development", description="Application environment")
    app_name: str = Field(default="Multi-Tenant RAG API", description="Application name")
    debug: bool = Field(default=False, description="Debug mode")
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")
    
    # Pinecone
    pinecone_api_key: str = Field(..., description="Pinecone API key")
    pinecone_index_name: str = Field(default="multi-tenant-rag", description="Pinecone index name")
    pinecone_environment: str = Field(default="us-east-1", description="Pinecone environment")
    
    # Google Gemini
    google_api_key: str = Field(..., description="Google API key for Gemini")
    gemini_model: str = Field(default="gemini-1.5-flash", description="Gemini model")
    
    # HuggingFace
    huggingface_api_token: str = Field(default="", description="HuggingFace API token (optional)")
    embedding_model: str = Field(default="sentence-transformers/all-MiniLM-L6-v2", description="Embedding model")
    embedding_dimension: int = Field(default=384, description="Embedding dimension")
    
    # LLM Settings
    max_tokens: int = Field(default=1000, description="Maximum tokens for LLM response")
    temperature: float = Field(default=0.7, description="LLM temperature")
    
    # RAG Settings
    top_k_results: int = Field(default=5, description="Number of top results to retrieve")
    chunk_size: int = Field(default=1000, description="Document chunk size")
    chunk_overlap: int = Field(default=200, description="Chunk overlap size")
    
    # CORS
    allowed_origins: str = Field(
        default="http://localhost:3000,http://localhost:8000",
        description="Comma-separated allowed origins"
    )
    
    # Logging
    log_level: str = Field(default="INFO", description="Logging level")
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.app_env.lower() == "production"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to ensure settings are loaded only once.
    """
    return Settings()


# Global settings instance
settings = get_settings()
