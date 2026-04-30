# Node ↔ FastAPI Integration Setup Guide

## 🏗️ Architecture Overview

```
Frontend (React)
    ↓
Backend (Node.js + Express) — API Gateway
    ↓
AI Service (FastAPI) — Message Processing
    ↓
Backend (Node.js)
    ↓
Frontend (React)
```

## 📋 Prerequisites

- **Node.js** v16+ (for backend)
- **Python** 3.8+ (for AI service)
- **pip** (Python package manager)
- Two terminal windows

## 🚀 Installation & Setup

### Step 1: Install AI Service Dependencies

```bash
cd ai-service
pip install -r requirements.txt
```

**What gets installed:**
- fastapi - Web framework for Python
- uvicorn - ASGI server for FastAPI
- pydantic - Data validation library

### Step 2: Verify Backend Dependencies

```bash
cd backend
npm install
```

Ensure `axios` is in `package.json` (it should be).

### Step 3: Start AI Service

**Terminal 1: AI Service**

```bash
cd ai-service
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started server process [12345]
INFO:     Application startup complete

🚀 AI Chat Service starting up...
📍 Service running on http://localhost:8000
📖 API docs available at http://localhost:8000/docs
```

### Step 4: Start Node Backend

**Terminal 2: Node Backend**

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

### Step 5: Start Frontend

**Terminal 3: Frontend**

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v7.1.3  ready in XXX ms

  ➜  Local:   http://localhost:5174/
```

---

## 📊 Data Flow

### Request Flow

```
1. User types message in UI
   ↓
2. Frontend sends POST /api/chat to Node backend
   Body: {"message": "hello"}
   ↓
3. Node backend receives request
   Logs: [Gateway] Received message from frontend: "hello"
   ↓
4. Node backend calls FastAPI service
   POST http://localhost:8000/chat
   Body: {"message": "hello"}
   ↓
5. FastAPI processes message
   Logs: [AI Service] Processing message: "hello"...
   ↓
6. FastAPI generates response
   Response: {"reply": "Hello! I'm an AI assistant...", "message_length": 5}
   ↓
7. Node backend receives response
   Logs: [Gateway] ← [AI Service] 200 (OK)
   ↓
8. Node backend returns to frontend
   Response: {"reply": "Hello! I'm an AI assistant...", "timestamp": "...", "source": "ai-service"}
   ↓
9. Frontend displays message in UI
```

---

## 🧪 Testing the Integration

### Test 1: FastAPI Swagger UI

1. Open: http://localhost:8000/docs
2. Click "Try it out" under POST /chat
3. Enter JSON body:
```json
{
  "message": "hello"
}
```
4. Click "Execute"
5. Should see response:
```json
{
  "reply": "Hello! I'm an AI assistant. How can I help you today?",
  "message_length": 5
}
```

### Test 2: Node Backend Direct Call

```bash
$body = @{ message = "hello" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/chat" -Method POST -ContentType "application/json" -Body $body
```

Expected Response:
```json
{
  "reply": "Hello! I'm an AI assistant. How can I help you today?",
  "timestamp": "2026-04-30T12:00:00.000Z",
  "source": "ai-service"
}
```

### Test 3: End-to-End via UI

1. Open: http://localhost:5174
2. Type: "hello"
3. Press Enter
4. Should see:
   - Message appears on the right
   - Loading indicator appears
   - AI response appears after 1-2 seconds

---

## 📝 Terminal Log Expectations

### Frontend Sends Message

**Frontend Console (DevTools):**
```
[API] Base URL configured: http://localhost:5000/api
[API Request] POST http://localhost:5000/api/chat
[API Request Body] {"message":"hello"}
[API Response] 200 /chat
```

### Node Backend Processing

**Backend Terminal:**
```
[TIMESTAMP] POST /api/chat
[Gateway] Received message from frontend: "hello"
[Gateway] Forwarding to AI Service at http://localhost:8000/chat
[Gateway] → [AI Service] POST http://localhost:8000/chat
[Gateway] ← [AI Service] 200 (OK)
[Gateway] Successfully processed message, returning reply: "Hello! I'm an AI assistant..."
```

### FastAPI Processing

**AI Service Terminal:**
```
INFO:     127.0.0.1:PORT - "POST /chat HTTP/1.1" 200 OK
[AI Service] Processing message: "hello"...
[AI Service] Generated reply: "Hello! I'm an AI assistant..."
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to AI Service"

**Error in Node backend:**
```
[Gateway] Cannot connect to AI Service - is it running on port 8000?
```

**Solution:**
1. Verify FastAPI is running: http://localhost:8000/docs
2. Check if port 8000 is available
3. Restart AI service

### Issue: "AI service is unavailable"

**Error on frontend:**
```
"AI service is unavailable. Please ensure the FastAPI service is running on port 8000."
```

**Solution:**
```bash
# Terminal 1: Start AI Service
cd ai-service
python main.py

# Verify it's running
curl http://localhost:8000/
```

### Issue: Python module not found

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```bash
cd ai-service
pip install -r requirements.txt
```

### Issue: Port already in use

**Error:**
```
Address already in use: ('127.0.0.1', 8000)
```

**Solution:**
```bash
# Find and kill process on port 8000
lsof -i :8000  # Mac/Linux
Get-NetTCPConnection -LocalPort 8000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
```

---

## 🔍 Environment Configuration

### Backend Environment

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
AI_SERVICE_URL=http://localhost:8000
```

### Frontend Environment

`frontend/.env` (already exists):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Mock Responses

FastAPI will respond with mock AI responses based on keywords:

| Input | Response |
|-------|----------|
| hello | "Hello! I'm an AI assistant. How can I help you today?" |
| how | "I'm doing great, thank you for asking! How can I assist you?" |
| help | "I can help you with coding, writing, analysis, and more. What do you need?" |
| thanks | "You're welcome! Feel free to ask me anything else." |
| bye | "Goodbye! Have a great day!" |
| what is ai | "AI stands for Artificial Intelligence..." |
| python | "Python is a versatile programming language..." |
| react | "React is a JavaScript library for building UI..." |
| *(anything else)* | Generic response with character count |

---

## ✨ File Structure Created

```
ai-chatbot/
├── ai-service/
│   ├── main.py              ✅ FastAPI service
│   ├── requirements.txt      ✅ Python dependencies
│
├── backend/
│   ├── controllers/
│   │   └── chatController.js ✅ Updated to call FastAPI
│   ├── routes/
│   │   └── chatRoutes.js
│   ├── index.js
│   ├── .env
│   └── package.json         ✅ (axios already present)
│
└── frontend/
    ├── .env
    └── src/
        ├── services/api.js
        ├── hooks/useChat.js
        └── components/ChatLayout.jsx
```

---

## 🎯 Next Steps

1. ✅ Run all 3 services (AI Service, Backend, Frontend)
2. ✅ Test end-to-end message flow
3. ✅ Verify logs in all terminals
4. ⏳ Replace mock responses with real LLM integration
5. ⏳ Add database persistence
6. ⏳ Implement streaming responses

---

## 📊 Performance Notes

- **Response Time**: ~100-200ms for mock responses
- **Timeout**: 30 seconds per request
- **Concurrency**: Both services can handle multiple requests

---

## 🚀 Production Considerations

When moving to production:

1. Use environment variables for all URLs
2. Add request authentication
3. Implement rate limiting
4. Add proper error logging (not just console)
5. Use health checks for service availability
6. Add request/response validation
7. Implement circuit breaker for AI service failures
8. Use connection pooling
9. Add metrics/monitoring
10. Containerize services (Docker)

---

**You now have a fully integrated Node ↔ FastAPI microservice architecture!** 🎉
