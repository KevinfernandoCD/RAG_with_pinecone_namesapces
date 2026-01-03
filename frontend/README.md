# Multi-Tenant RAG Frontend

A modern React application for interacting with a multi-tenant RAG (Retrieval-Augmented Generation) system. Built with Vite, React Router, and Axios.

## 🚀 Features

- ✅ **Organization-based Authentication** - Simple key-based tenant isolation
- ✅ **Real-time Chat Interface** - Interactive conversation with AI assistant
- ✅ **PDF Document Upload** - Add documents to your knowledge base
- ✅ **Tenant Isolation** - Complete data separation via headers
- ✅ **Modern UI** - Gradient backgrounds, smooth animations, responsive design
- ✅ **Auto-scroll** - Automatic scroll to latest messages
- ✅ **Loading States** - Visual feedback for all async operations

## 📋 Prerequisites

- Node.js 16+ and npm
- Running backend API (see `../backend/README.md`)

## 🏃 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

The `.env` file is already created with default settings:

```
VITE_API_BASE_URL=http://localhost:8000
```

Update if your backend runs on a different URL.

### 3. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:5173

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Organization key entry
│   │   └── Chat.jsx           # Main chat interface
│   ├── components/
│   │   ├── ChatInput.jsx      # Message input component
│   │   ├── ChatMessage.jsx    # Message display component
│   │   └── FileUpload.jsx     # PDF upload component
│   ├── services/
│   │   └── api.js             # API client with axios
│   ├── App.jsx                # Router and protected routes
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles
├── .env                       # Environment variables
├── package.json
└── vite.config.js
```

## 🔑 Authentication Flow

1. User enters organization key on login page
2. Frontend validates key via `/tenant/stats` endpoint
3. Valid key is stored in `localStorage`
4. User is redirected to chat interface
5. All subsequent requests include `X-Tenant-ID` header

## 💬 Using the Chat Interface

### Upload Documents

1. Click "Choose PDF File" in the sidebar
2. Select a PDF document
3. Wait for upload confirmation
4. Document is now searchable

### Ask Questions

1. Type your question in the input field
2. Press Enter or click send button
3. AI assistant retrieves relevant context
4. Answer is displayed with source references

## 🎨 UI Features

### Modern Design
- Dark theme with gradient accents
- Smooth animations and transitions
- Responsive layout for mobile/desktop
- Custom scrollbar styling

### Visual Feedback
- Loading indicators during API calls
- Success/error messages for uploads
- Typing animation while AI responds
- Auto-scroll to latest messages

## 🔧 API Integration

All API calls are handled through `src/services/api.js`:

```javascript
import { sendQuery, uploadDocument, validateTenant } from './services/api';

// Send a query
const result = await sendQuery("What is the refund policy?");

// Upload a document
const uploadResult = await uploadDocument(pdfFile);

// Validate tenant
const validation = await validateTenant("my-org-key");
```

### Automatic Header Injection

The API client automatically adds the `X-Tenant-ID` header to all requests:

```javascript
// Axios interceptor
config.headers['X-Tenant-ID'] = localStorage.getItem('tenantId');
```

## 🛠️ Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔒 Security Notes

### Current Implementation (PoC)
- Organization key stored in `localStorage`
- Simple header-based authentication
- Client-side route protection

### Production Recommendations
1. Replace with JWT/OAuth2 authentication
2. Add token refresh mechanism
3. Implement secure session management
4. Add HTTPS enforcement
5. Add rate limiting on frontend
6. Implement CSRF protection

## 📱 Responsive Design

The application is fully responsive:

- **Desktop**: Full sidebar with file upload
- **Mobile**: Optimized layout, hidden sidebar
- **Tablet**: Adaptive spacing and sizing

## 🎯 Key Components

### Login Page (`Login.jsx`)
- Organization key input
- Backend validation
- Auto-redirect if already authenticated
- Error handling

### Chat Page (`Chat.jsx`)
- Message history display
- File upload sidebar
- Tenant statistics
- Logout functionality

### ChatMessage (`ChatMessage.jsx`)
- User/Assistant message styling
- Source document display
- Relevance scores

### ChatInput (`ChatInput.jsx`)
- Text input with Enter key support
- Send button with loading state
- Input validation

### FileUpload (`FileUpload.jsx`)
- PDF file selection
- File type/size validation
- Upload progress feedback
- Success/error notifications

## 🐛 Troubleshooting

### "API is unavailable"
- Ensure backend is running on `http://localhost:8000`
- Check `.env` file has correct `VITE_API_BASE_URL`
- Verify CORS is enabled on backend

### "Invalid organization key"
- Ensure you're using a valid tenant ID
- Check backend logs for validation errors
- Try creating a new organization key

### Upload fails
- Verify file is a valid PDF
- Check file size is under 10MB
- Ensure backend `/documents` endpoint is working

## 🚢 Production Build

```bash
npm run build
```

Output will be in `dist/` folder. Deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

### Environment Variables for Production

Update `.env` for production:

```
VITE_API_BASE_URL=https://your-api-domain.com
```

## 📚 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with variables and animations

## 🤝 Integration with Backend

This frontend integrates with the FastAPI backend:

- `POST /documents` - Upload documents
- `POST /query` - Send RAG queries
- `GET /tenant/stats` - Get tenant statistics
- `GET /health` - Health check

All endpoints (except health) require `X-Tenant-ID` header.

## 📄 License

MIT License - feel free to use in your projects!

---

**Built with ❤️ using React and Vite**
