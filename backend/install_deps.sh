#!/bin/bash
# Staged installation script to avoid pip dependency conflicts

set -e  # Exit on error

echo "🚀 Starting staged installation..."
echo ""

# Upgrade pip first
echo "📦 Upgrading pip..."
python3 -m pip install --upgrade pip

# Stage 1: Core web framework
echo ""
echo "📦 Stage 1: Installing web framework..."
pip install fastapi==0.109.0 uvicorn==0.27.0 gunicorn==21.2.0

# Stage 2: Configuration and validation
echo ""
echo "📦 Stage 2: Installing configuration packages..."
pip install pydantic==2.5.3 pydantic-settings==2.1.0 python-dotenv==1.0.0

# Stage 3: Vector database
echo ""
echo "📦 Stage 3: Installing Pinecone..."
pip install pinecone-client==3.0.2

# Stage 4: LLM (Google Gemini)
echo ""
echo "📦 Stage 4: Installing Google Generative AI..."
pip install google-generativeai==0.3.2

# Stage 5: PDF processing
echo ""
echo "📦 Stage 5: Installing PDF tools..."
pip install PyPDF2==3.0.1 python-multipart==0.0.6

# Stage 6: Embeddings (this takes longest)
echo ""
echo "📦 Stage 6: Installing sentence-transformers (this may take a while)..."
pip install sentence-transformers==2.3.1

# Stage 7: LangChain (install last to avoid conflicts)
echo ""
echo "📦 Stage 7: Installing LangChain..."
pip install langchain==0.1.4 langchain-text-splitters==0.0.1

# Stage 8: Logging and testing
echo ""
echo "📦 Stage 8: Installing utilities..."
pip install structlog==24.1.0 pytest==7.4.4 pytest-asyncio==0.23.3 httpx==0.26.0

# Stage 9: Code quality tools
echo ""
echo "📦 Stage 9: Installing development tools..."
pip install black==24.1.1 ruff==0.1.14

echo ""
echo "✅ All packages installed successfully!"
echo ""
echo "📋 Installed packages:"
pip list | grep -E "(fastapi|uvicorn|pinecone|google-generativeai|sentence-transformers|langchain|PyPDF2)"
