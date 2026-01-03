# Quick Start - Multi-Tenant RAG Backend

## 🚀 5-Minute Setup

### Prerequisites
- Python 3.9+ (you have 3.9.6 ✓)
- pip3 installed
- Google API key (free tier)
- Pinecone API key (free tier)

---

## Step 1: Get API Keys

### Google Gemini API Key (FREE)
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Pinecone API Key (FREE)
1. Visit: https://www.pinecone.io/
2. Sign up for free account
3. Go to "API Keys" section
4. Copy your API key

---

## Step 2: Install Dependencies

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Note**: Installation takes ~5-10 minutes (downloads PyTorch, sentence-transformers, etc.)

---

## Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env  # or use any text editor
```

**Required settings in `.env`**:
```bash
GOOGLE_API_KEY=your_google_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=multi-tenant-rag
```

**Important**: Index name must use hyphens, not underscores!

---

## Step 4: Create Pinecone Index

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run index creation script
python scripts/create_index.py
```

**Expected output**:
```
✅ Index 'multi-tenant-rag' created successfully!
📏 Dimension: 384 (HuggingFace embeddings)
📐 Metric: cosine
```

---

## Step 5: Start Backend

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Start server
uvicorn app.main:app --reload
```

**Server runs on**: http://localhost:8000

**API Docs**: http://localhost:8000/docs

---

## ✅ Verify Installation

### Test 1: Health Check
```bash
curl http://localhost:8000/health
```

Expected: `{"status":"ok","environment":"development","version":"1.0.0"}`

### Test 2: Upload Document
```bash
curl -X POST http://localhost:8000/upload-files \
  -H "X-Tenant-ID: test-org" \
  -F "files=@sample.pdf"
```

### Test 3: Query
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-org" \
  -d '{"question": "What is this about?"}'
```

---

## 🎯 Quick Commands Reference

```bash
# Activate environment (always do this first!)
source venv/bin/activate

# Start server
uvicorn app.main:app --reload

# Start with custom host/port
uvicorn app.main:app --host 0.0.0.0 --port 8080

# Run tests
pytest

# Check installed packages
pip list
```

---

## 🐛 Common Issues

### "ModuleNotFoundError: No module named 'dotenv'"
**Solution**: Activate virtual environment first
```bash
source venv/bin/activate
```

### "INVALID_ARGUMENT: Name must consist of lower case alphanumeric characters or '-'"
**Solution**: Change index name in `.env` to use hyphens:
```bash
PINECONE_INDEX_NAME=multi-tenant-rag  # ✓ Correct
PINECONE_INDEX_NAME=multi_tenant_rag  # ✗ Wrong
```

### "pip install taking too long"
**Solution**: Dependencies already installed! Just activate venv:
```bash
source venv/bin/activate
```

---

## 📊 What's Installed

- **FastAPI** - Web framework
- **Google Gemini** - LLM (FREE)
- **HuggingFace** - Embeddings (FREE, local)
- **Pinecone** - Vector database
- **PyPDF2** - PDF parsing
- **Custom text splitter** - No LangChain dependency

---

## 🔄 Next Steps

1. ✅ Backend running on http://localhost:8000
2. ✅ Start frontend: `cd ../frontend && npm run dev`
3. ✅ Visit http://localhost:5173
4. ✅ Create workspaces and start chatting!

---

**Total setup time**: ~15 minutes (including downloads)
