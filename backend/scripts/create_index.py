"""
Script to create Pinecone index for multi-tenant RAG.
Run this once before starting the application.
"""
import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec

# Load environment variables
load_dotenv()


def create_index():
    """Create Pinecone index if it doesn't exist."""
    
    # Get configuration from environment
    api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME", "multi_tenant_rag")
    environment = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
    
    if not api_key:
        print("❌ Error: PINECONE_API_KEY not found in environment variables")
        print("Please create a .env file based on .env.example")
        sys.exit(1)
    
    print(f"🔧 Initializing Pinecone client...")
    pc = Pinecone(api_key=api_key)
    
    # Check if index already exists
    existing_indexes = pc.list_indexes().names()
    
    if index_name in existing_indexes:
        print(f"✅ Index '{index_name}' already exists")
        
        # Get index stats
        index = pc.Index(index_name)
        stats = index.describe_index_stats()
        print(f"📊 Index stats:")
        print(f"   - Total vectors: {stats.total_vector_count}")
        print(f"   - Namespaces: {len(stats.namespaces)}")
        return
    
    print(f"🚀 Creating index '{index_name}'...")
    
    try:
        pc.create_index(
            name=index_name,
            dimension=384,  # HuggingFace all-MiniLM-L6-v2 dimension
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region=environment
            )
        )
        
        print(f"✅ Index '{index_name}' created successfully!")
        print(f"📍 Region: {environment}")
        print(f"📏 Dimension: 384 (HuggingFace embeddings)")
        print(f"📐 Metric: cosine")
        print(f"\n🎉 Setup complete! You can now start the application.")
        
    except Exception as e:
        print(f"❌ Error creating index: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    print("=" * 60)
    print("Pinecone Index Setup for Multi-Tenant RAG")
    print("=" * 60)
    print()
    
    create_index()
