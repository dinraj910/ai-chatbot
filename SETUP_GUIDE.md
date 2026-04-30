# 🚀 Full Stack ChatGPT-Style App - Setup & Testing Guide

## 📋 Project Structure

```
ai-chatbot/
├── backend/                    # Node.js + Express API
│   ├── controllers/
│   │   └── chatController.js  # Business logic
│   ├── routes/
│   │   └── chatRoutes.js      # API routes
│   ├── index.js               # Server entry point
│   ├── package.json
│   ├── .env                   # Backend config
│   └── API_DOCUMENTATION.md   # Backend docs
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   ├── hooks/
│   │   │   └── useChat.js     # Chat hook
│   │   ├── components/        # UI components
│   │   └── App.jsx            # Main app
│   ├── .env                   # Frontend config
│   ├── package.json
│   └── API_INTEGRATION.md     # Frontend docs
│
└── ai-service/                # FastAPI (NOT USED YET)
```

## ⚙️ Prerequisites

- **Node.js** v16+ (check: `node --version`)
- **npm** v8+ (check: `npm --version`)
- Two terminal windows (one for backend, one for frontend)

## 🔧 Setup Instructions

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 3: Verify Environment Configuration

**Backend `.env`** (should already exist):
```env
PORT=5000
NODE_ENV=development
```

**Frontend `.env`** (should already exist):
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 Server is running on http://localhost:5000
📍 API Base: http://localhost:5000/api
💬 Chat endpoint: POST http://localhost:5000/api/chat
```

### Terminal 2: Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v7.1.3  ready in 1494 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Open in Browser

Navigate to: **http://localhost:5173**

## ✅ Testing the Integration

### Test 1: Send a Message via UI

1. Type a message in the input box
2. Press `Enter` or click the Send button
3. Observe:
   - Message appears immediately on the right
   - Loading indicator (bouncing dots) appears
   - Backend response appears after 1-2 seconds

### Test 2: Try Sample Messages

Try these keywords for quick mock responses:
- "hello" → "Hello! How can I assist you today?"
- "how" → "I'm doing great! Thanks for asking. How can I help?"
- "help" → "I'm here to help with coding, writing, problem-solving, and more..."
- "thanks" → "You're welcome! Feel free to ask me anything else."
- "bye" → "Goodbye! Have a great day!"
- Any other message → Generic response with echo

### Test 3: Check Backend Logs

In the backend terminal, you should see:
```
[Chat] Received message: "hello"
[Chat] Sending reply: "Hello! How can I assist you today?"
```

### Test 4: Use Browser DevTools

**Network Tab:**
1. Open DevTools (`F12` or `Ctrl+Shift+I`)
2. Go to Network tab
3. Send a message
4. Click the `api/chat` request
5. View Request/Response:
   ```
   Request:  {"message":"hello"}
   Response: {"reply":"Hello! How can I assist you today?","timestamp":"..."}
   ```

**Console Tab:**
1. Look for API logs:
   ```
   [API Request] POST /chat
   [API Response] 200 /chat
   ```

## 📊 Data Flow Architecture

```
USER TYPES MESSAGE
        ↓
    ┌───────────────────────────────────────┐
    │     Frontend (React + Vite)           │
    │                                       │
    │  ┌─────────────────────────────────┐ │
    │  │ ChatLayout Component            │ │
    │  │ - Renders messages              │ │
    │  │ - Handles UI state              │ │
    │  └──────────────┬────────────────┬─┘ │
    │                 │                │    │
    │  ┌──────────────▼──┐  ┌─────────▼──┐ │
    │  │   useChat Hook  │  │  ChatInput  │ │
    │  │ - Messages      │  │ - Form      │ │
    │  │ - isLoading     │  │ - Send btn  │ │
    │  │ - Error state   │  └─────────────┘ │
    │  └──────────┬───────┘                 │
    │             │                         │
    │  ┌──────────▼──────────────┐          │
    │  │  api.js (Service Layer) │          │
    │  │ - axios instance        │          │
    │  │ - sendMessage()         │          │
    │  │ - interceptors          │          │
    │  └──────────┬───────────────┘         │
    └─────────────┼──────────────────────────┘
                  │
        HTTP POST /api/chat
        {"message": "..."}
                  │
                  ▼
    ┌──────────────────────────────────────────┐
    │      Backend (Node.js + Express)         │
    │                                          │
    │  ┌────────────────────────────────────┐ │
    │  │  chatRoutes.js                     │ │
    │  │  POST /api/chat                    │ │
    │  └────────────┬───────────────────────┘ │
    │               │                         │
    │  ┌────────────▼──────────────────────┐ │
    │  │  chatController.js                │ │
    │  │  - Validate input                 │ │
    │  │  - Generate mock response         │ │
    │  │  - Error handling                 │ │
    │  └────────────┬──────────────────────┘ │
    │               │                        │
    │  ┌────────────▼──────────────────────┐ │
    │  │  sendMessage() Function           │ │
    │  │ - Returns mock reply              │ │
    │  └────────────┬──────────────────────┘ │
    └───────────────┼──────────────────────────┘
                    │
        HTTP Response 200 OK
        {"reply": "...", "timestamp": "..."}
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │     Frontend receives response       │
    │     - Replace loading state          │
    │     - Display assistant message      │
    │     - Update UI                      │
    └──────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to server"

**Solution:**
1. Verify backend is running: http://localhost:5000
2. Check backend terminal for errors
3. Verify CORS is enabled
4. Check frontend `.env` has correct API URL

### Issue: Backend crashes on start

**Solution:**
```bash
# Kill any process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>

# Try again:
cd backend
npm run dev
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Messages not appearing

**Solution:**
1. Check browser console for errors (`F12`)
2. Check backend logs for request/response
3. Verify network request in DevTools Network tab
4. Check API response format

## 🔍 API Endpoint Reference

### Send Message

```
POST http://localhost:5000/api/chat

Request:
{
  "message": "What is AI?"
}

Response (200):
{
  "reply": "AI is Artificial Intelligence...",
  "timestamp": "2026-04-30T12:00:00.000Z"
}

Error Response (400):
{
  "error": "Message cannot be empty."
}

Error Response (500):
{
  "error": "Failed to process your message. Please try again."
}
```

## 📚 Documentation Files

- **Backend**: `backend/API_DOCUMENTATION.md`
- **Frontend**: `frontend/API_INTEGRATION.md`

## 🎯 Next Steps

### Phase 2: FastAPI Integration
- [ ] Connect to FastAPI backend
- [ ] Replace mock responses with real model calls
- [ ] Add streaming support

### Phase 3: Database
- [ ] Store conversation history
- [ ] User authentication
- [ ] Conversation persistence

### Phase 4: Advanced Features
- [ ] WebSocket support for streaming
- [ ] Real-time typing indicators
- [ ] File upload/download
- [ ] Rich text formatting

## 📝 Key Technologies

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | React 19 + Vite | Modern UI framework |
| Frontend | Tailwind CSS v4 | Styling |
| Frontend | Lucide React | Icons |
| Frontend | Axios | HTTP client |
| Frontend | Custom Hooks | State management |
| Backend | Node.js + Express | Server |
| Backend | CORS | Cross-origin requests |
| Backend | Nodemon | Dev auto-reload |

## ✨ Features Implemented

✅ Production-ready architecture
✅ Clean separation of concerns
✅ Comprehensive error handling
✅ Request/response logging
✅ Mock response system
✅ Responsive UI
✅ Dark theme (ChatGPT-style)
✅ Message persistence in state
✅ Loading indicators
✅ Error display
✅ Mobile responsive
✅ Environment configuration

## 🚫 What's NOT Implemented Yet

❌ AI/LLM integration
❌ FastAPI connection
❌ Database persistence
❌ User authentication
❌ WebSocket streaming
❌ File uploads
❌ Voice input/output

## 💡 Code Quality Checkpoints

- ✅ Modular architecture
- ✅ Separation of concerns (services, hooks, controllers)
- ✅ No prop drilling (hook-based state)
- ✅ Reusable components
- ✅ Comprehensive error handling
- ✅ Production-grade logging
- ✅ Scalable structure
- ✅ Future-ready for AI integration

---

**You now have a fully functional, production-ready frontend-backend communication system!** 🎉

Ready to integrate with FastAPI and LLM models in the next phase.
