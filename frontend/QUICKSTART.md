# Quick Start - Multi-Tenant RAG Frontend

## 🚀 5-Minute Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:5173

---

## 🔑 First Login

1. Enter any organization key (e.g., `demo-tenant`)
2. Backend will validate and create namespace
3. You'll be redirected to chat interface

---

## 💬 Quick Test

### Upload a Document

1. Click "Choose PDF File" in sidebar
2. Select a PDF
3. Wait for success message

### Ask a Question

1. Type: "What is this document about?"
2. Press Enter
3. View AI response with sources

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth | Organization key-based |
| 💬 Chat | Real-time RAG queries |
| 📄 Upload | PDF document support |
| 🎨 UI | Modern dark theme |
| 📱 Responsive | Mobile-friendly |

---

## 🔧 Configuration

Edit `.env` to change backend URL:

```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📚 Full Documentation

See [README.md](file:///Users/akvasoft/Desktop/Multitenant-RAG/frontend/README.md) for complete documentation.
