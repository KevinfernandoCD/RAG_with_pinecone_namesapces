# Multi-Tenant RAG Backend

Production-ready FastAPI backend for a multi-tenant RAG (Retrieval-Augmented Generation) system with **100% FREE** LLM and embeddings.

## 🌟 Features

- ✅ **Multi-Tenant Isolation** - Pinecone namespaces for complete data separation
- ✅ **FREE LLM** - Google Gemini 1.5 Flash (no OpenAI costs!)
- ✅ **FREE Embeddings** - HuggingFace Sentence Transformers (runs locally)
- ✅ **PDF Upload** - Extract text and chunk automatically
- ✅ **Custom Text Splitter** - Smart chunking with sentence boundaries
- ✅ **RESTful API** - FastAPI with automatic OpenAPI docs
- ✅ **Production Ready** - Structured logging, CORS, health checks

---

## 📋 Prerequisites

- **Python 3.9+** (tested on 3.9.6)
- **pip3** package manager
- **Google API Key** - Get free at https://aistudio.google.com/app/apikey
- **Pinecone API Key** - Get free at https://www.pinecone.io/

---

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate (ALWAYS do this first!)
source venv/bin/activate

# Install dependencies (~5-10 min)
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example
cp .env.example .env

# Edit with your API keys
nano .env
```

**Required in `.env`**:
```bash
GOOGLE_API_KEY=your_google_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=multi-tenant-rag  # Use hyphens!
```

### 3. Create Pinecone Index

```bash
source venv/bin/activate
python scripts/create_index.py
```

### 4. Start Server

```bash
source venv/bin/activate
uvicorn app.main:app --reload
```

**Server**: http://localhost:8000  
**API Docs**: http://localhost:8000/docs

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── dependencies.py    # Tenant ID extraction
│   │   └── routes.py          # API endpoints
│   ├── core/
│   │   ├── config.py          # Configuration
│   │   └── security.py        # Input validation
│   ├── models/
│   │   └── schemas.py         # Pydantic models
│   ├── services/
│   │   ├── embeddings.py      # HuggingFace embeddings
│   │   ├── pdf_parser.py      # PDF + text chunking
│   │   ├── pinecone_service.py # Vector operations
│   │   └── rag_service.py     # RAG orchestration
│   └── main.py                # FastAPI app
├── scripts/
│   └── create_index.py        # Pinecone setup
├── tests/
│   └── test_rag.py            # API tests
├── requirements.txt           # Dependencies
├── .env.example               # Environment template
└── README.md                  # This file
```

---

## 🔌 API Endpoints

### Health Check
```bash
GET /health
```

### Upload PDFs
```bash
POST /upload-files
Headers: X-Tenant-ID: your-org-key
Body: multipart/form-data with PDF files
```

### Query RAG
```bash
POST /query
Headers: X-Tenant-ID: your-org-key
Body: {"question": "What is...?", "top_k": 5}
```

### Get Stats
```bash
GET /tenant/stats
Headers: X-Tenant-ID: your-org-key
```

### Delete Tenant Data
```bash
DELETE /tenant
Headers: X-Tenant-ID: your-org-key
```

**Interactive Docs**: http://localhost:8000/docs

---

## 🏗️ Architecture

### RAG Pipeline

```
PDF Upload → Extract Text → Chunk (1000 chars) → Embed (HuggingFace) → Store (Pinecone)
                                                                              ↓
User Query → Embed Query → Search Vectors → Retrieve Context → Generate Answer (Gemini)
```

### Tenant Isolation

Each organization gets a **separate Pinecone namespace**:
- Tenant A: `namespace="org-a"`
- Tenant B: `namespace="org-b"`
- Complete data isolation
- No cross-tenant access

### Text Chunking

**Custom `SimpleTextSplitter`**:
- Chunk size: 1000 characters (configurable)
- Overlap: 200 characters (configurable)
- Smart boundaries: Breaks at sentences, then words
- No LangChain dependency

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_API_KEY` | ✅ Yes | - | Google Gemini API key |
| `PINECONE_API_KEY` | ✅ Yes | - | Pinecone API key |
| `PINECONE_INDEX_NAME` | No | `multi-tenant-rag` | Index name (use hyphens!) |
| `PINECONE_ENVIRONMENT` | No | `us-east-1` | Pinecone region |
| `GEMINI_MODEL` | No | `gemini-1.5-flash` | Gemini model |
| `EMBEDDING_MODEL` | No | `all-MiniLM-L6-v2` | HuggingFace model |
| `CHUNK_SIZE` | No | `1000` | Text chunk size |
| `CHUNK_OVERLAP` | No | `200` | Chunk overlap |

### Models Used

- **LLM**: Google Gemini 1.5 Flash (FREE tier)
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)
- **Vector DB**: Pinecone serverless (FREE tier)

---

## 🧪 Testing

```bash
# Activate environment
source venv/bin/activate

# Run tests
pytest

# Run with coverage
pytest --cov=app tests/

# Test specific file
pytest tests/test_rag.py -v
```

### Manual Testing

```bash
# Health check
curl http://localhost:8000/health

# Upload PDF
curl -X POST http://localhost:8000/upload-files \
  -H "X-Tenant-ID: test-org" \
  -F "files=@document.pdf"

# Query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-org" \
  -d '{"question": "What is the main topic?"}'
```

### Testing with Swagger UI

FastAPI automatically generates **interactive API documentation** at http://localhost:8000/docs

#### Step 1: Access Swagger UI

1. Start the backend server:
   ```bash
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. Open browser: **http://localhost:8000/docs**

You'll see all API endpoints with interactive testing capabilities.

#### Step 2: Test Health Check

1. Click on **`GET /health`** endpoint
2. Click **"Try it out"** button
3. Click **"Execute"** button
4. See response:
   ```json
   {
     "status": "ok",
     "environment": "development",
     "version": "1.0.0"
   }
   ```

#### Step 3: Upload PDF Document

1. Click on **`POST /upload-files`** endpoint
2. Click **"Try it out"** button
3. In **Parameters** section:
   - Add header: `X-Tenant-ID` = `test-org`
4. In **Request body** section:
   - Click **"Choose File"** and select a PDF
5. Click **"Execute"** button
6. See response:
   ```json
   {
     "success": true,
     "files_processed": 1,
     "total_chunks": 12,
     "document_ids": ["uuid-1", "uuid-2", ...],
     "message": "Successfully uploaded 1 file(s) with 12 chunks",
     "tenant_id": "test-org"
   }
   ```
<img width="1389" height="658" alt="Screenshot 2026-01-03 at 15 18 19" src="https://github.com/user-attachments/assets/45294048-a758-4ad2-b7c3-eb41aac4646d" />
<img width="1389" height="658" alt="Screenshot 2026-01-03 at 15 18 41" src="https://github.com/user-attachments/assets/503dd702-d173-4b71-9814-3a0096de1ca5" />

   

#### Step 4: Query the RAG System

1. Click on **`POST /query`** endpoint
2. Click **"Try it out"** button
3. In **Parameters** section:
   - Add header: `X-Tenant-ID` = `test-org`
4. In **Request body** section, enter:
   ```json
   {
     "question": "What is the main topic of the document?",
     "top_k": 5
   }
   ```
5. Click **"Execute"** button
<img width="1389" height="658" alt="Screenshot 2026-01-03 at 15 21 23" src="https://github.com/user-attachments/assets/d256d50e-3ee1-4c5f-8e2a-ae761d019e4f" />


6. See response:
   ```json
   {
     "answer": "The document discusses...",
     "sources": [
       {
         "text": "Relevant chunk 1...",
         "metadata": {
           "filename": "document.pdf",
           "chunk_index": 0
         },
         "score": 0.85
       }
     ],
     "tenant_id": "test-org"
   }
   ```

   <img width="1389" height="658" alt="Screenshot 2026-01-03 at 15 22 41" src="https://github.com/user-attachments/assets/34f153b2-0e94-49da-8738-e8ecaf44ab73" />


#### Step 5: Get Tenant Statistics

1. Click on **`GET /tenant/stats`** endpoint
2. Click **"Try it out"** button
3. In **Parameters** section:
   - Add header: `X-Tenant-ID` = `test-org`
4. Click **"Execute"** button
5. See response:
   ```json
   {
     "tenant_id": "test-org",
     "document_count": 12,
     "index_name": "multi-tenant-rag"
   }
   ```

#### Step 6: Test Different Tenants

To test multi-tenant isolation:

1. Upload a PDF with `X-Tenant-ID: org-a`
2. Upload a different PDF with `X-Tenant-ID: org-b`
3. Query with `X-Tenant-ID: org-a` - should only return results from org-a
4. Query with `X-Tenant-ID: org-b` - should only return results from org-b

#### Swagger UI Features

- **Try it out**: Interactive testing of all endpoints
- **Request body**: Pre-filled JSON schemas
- **Responses**: See all possible response codes
- **Models**: View Pydantic model schemas
- **Authorization**: Add headers easily
- **Download**: Export OpenAPI spec (JSON/YAML)

#### Alternative: ReDoc

For a different documentation view, visit: **http://localhost:8000/redoc**

- Cleaner, read-only documentation
- Better for sharing with team
- Same OpenAPI spec, different UI

---

## 🚢 Production Deployment

### Using Gunicorn

```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

### Docker (Optional)

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

```bash
APP_ENV=production
DEBUG=false
LOG_LEVEL=info
CORS_ORIGINS=https://yourdomain.com
```

---

## 🔒 Security

### Current (PoC)
- Header-based tenant identification (`X-Tenant-ID`)
- Input sanitization
- Tenant ID validation
- CORS middleware

### Production Recommendations
1. **Authentication**: Implement JWT/OAuth2
2. **Rate Limiting**: Add per-tenant rate limits
3. **HTTPS**: Enforce SSL/TLS
4. **API Keys**: Generate tenant-specific API keys
5. **Monitoring**: Add observability (Sentry, DataDog)

---

## 📊 Performance

### Benchmarks (Local M1 Mac)

- **PDF Upload** (10-page PDF): ~2-3 seconds
- **Text Chunking**: ~100ms per document
- **Embedding Generation**: ~1 second per chunk
- **Query Response**: ~2-3 seconds (embedding + retrieval + LLM)

### Optimization Tips

1. **Batch Embeddings**: Already implemented for uploads
2. **Caching**: Add Redis for frequent queries
3. **Async Processing**: Use Celery for large uploads
4. **Connection Pooling**: Pinecone client reuse

---

## 🐛 Troubleshooting

### ModuleNotFoundError
**Problem**: `ModuleNotFoundError: No module named 'dotenv'`  
**Solution**: Activate virtual environment
```bash
source venv/bin/activate
```

### Pinecone Index Name Error
**Problem**: `INVALID_ARGUMENT: Name must consist of lower case alphanumeric characters or '-'`  
**Solution**: Use hyphens in `.env`
```bash
PINECONE_INDEX_NAME=multi-tenant-rag  # ✓ Correct
```

### Slow pip install
**Problem**: pip stuck on dependency resolution  
**Solution**: Dependencies already installed, just activate venv

### SSL Warning
**Problem**: `NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+`  
**Solution**: This is a warning, not an error. App works fine.

---

## 📚 Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Web Framework | FastAPI | Fast, async, auto docs |
| LLM | Google Gemini | FREE, high quality |
| Embeddings | HuggingFace | FREE, runs locally |
| Vector DB | Pinecone | Managed, scalable |
| PDF Parsing | PyPDF2 | Simple, reliable |
| Text Splitting | Custom | No dependencies |

---

## 🤝 Integration

### Frontend Integration

This backend works with the React frontend in `../frontend`:

```javascript
// Upload PDF
const formData = new FormData();
formData.append('files', pdfFile);
await fetch('http://localhost:8000/upload-files', {
  method: 'POST',
  headers: { 'X-Tenant-ID': 'my-org' },
  body: formData
});

// Query
await fetch('http://localhost:8000/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'my-org'
  },
  body: JSON.stringify({ question: 'What is...?' })
});
```

---

## 📄 License

MIT License - Free to use in your projects!

---

## 🆘 Support

- **Documentation**: See `QUICKSTART.md` for step-by-step setup
- **API Docs**: http://localhost:8000/docs (when running)
- **Issues**: Check troubleshooting section above

---

**Built with ❤️ using FastAPI, Google Gemini, and HuggingFace**

**Cost**: $0/month (100% FREE tier services)
