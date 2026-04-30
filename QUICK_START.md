# 🚀 Complete Node ↔ FastAPI Integration - Quick Start

## ⚡ TL;DR - Get Running in 5 Minutes

### Terminal 1: Start AI Service
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

### Terminal 2: Start Node Backend
```bash
cd backend
npm run dev
```

### Terminal 3: Start Frontend
```bash
cd frontend
npm run dev
```

### Terminal 4 (Optional): Run Tests
```bash
cd backend
node test-integration.js
```

Then open http://localhost:5174 and start chatting! 💬

---

## 📦 What Was Built

### ✅ FastAPI Service (`ai-service/main.py`)
- **Endpoint**: POST `/chat`
- **Input**: `{"message": "user input"}`
- **Output**: `{"reply": "AI response", "message_length": N}`
- **Port**: 8000
- **Docs**: http://localhost:8000/docs

### ✅ Node Gateway (`backend/controllers/chatController.js`)
- **Endpoint**: POST `/api/chat`
- **Forwards requests** to FastAPI
- **Handles errors** and timeouts
- **Logging**: Full request/response tracking
- **Port**: 5000

### ✅ Frontend Integration
- Already connected to Node backend
- Sends messages through the full pipeline
- Displays FastAPI responses in UI

---

## 📊 Message Flow Architecture

```
User Types Message
        ↓
React Frontend (http://localhost:5174)
        ↓ POST /api/chat
Node Backend (http://localhost:5000)
        ↓ POST /chat
FastAPI Service (http://localhost:8000)
        ↓ Process & Generate Response
FastAPI Service
        ↓ JSON Response
Node Backend
        ↓ JSON Response
React Frontend
        ↓
User Sees Response
```

---

## 🧪 Testing Without Frontend

### Test FastAPI Directly

**Using Browser:**
1. Open: http://localhost:8000/docs
2. Click POST `/chat`
3. Enter: `{"message": "hello"}`
4. Click "Try it out" → "Execute"

**Using PowerShell:**
```powershell
$body = @{ message = "hello" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/chat" -Method POST `
  -ContentType "application/json" -Body $body
```

**Expected Response:**
```json
{
  "reply": "Hello! I'm an AI assistant. How can I help you today?",
  "message_length": 5
}
```

---

### Test Node Backend

**Using PowerShell:**
```powershell
$body = @{ message = "hello" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/chat" -Method POST `
  -ContentType "application/json" -Body $body
```

**Expected Response:**
```json
{
  "reply": "Hello! I'm an AI assistant. How can I help you today?",
  "timestamp": "2026-04-30T12:00:00.000Z",
  "source": "ai-service"
}
```

---

### Run Automated Test Suite

```bash
cd backend
node test-integration.js
```

This will:
1. ✓ Check backend is running
2. ✓ Check AI service is running
3. ✓ Test FastAPI directly
4. ✓ Test Node gateway
5. ✓ Send 5 test messages
6. ✓ Show results

---

## 📝 Environment Configuration

### Backend `.env`
```env
# backend/.env
PORT=5000
NODE_ENV=development
AI_SERVICE_URL=http://localhost:8000
```

### Frontend `.env`
```env
# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔍 Debug: Read the Logs

### AI Service Terminal
```
INFO:     127.0.0.1:XXXXX - "POST /chat HTTP/1.1" 200 OK
[AI Service] Processing message: "hello"...
[AI Service] Generated reply: "Hello! I'm an AI assistant..."
```

### Node Backend Terminal
```
[TIMESTAMP] POST /api/chat
[Gateway] Received message from frontend: "hello"
[Gateway] Forwarding to AI Service at http://localhost:8000/chat
[Gateway] → [AI Service] POST http://localhost:8000/chat
[Gateway] ← [AI Service] 200 (OK)
```

### Frontend DevTools Console (F12)
```
[API Request] POST http://localhost:5000/api/chat
[API Request Body] {"message":"hello"}
[API Response] 200 /chat
```

---

## ✨ Key Features

✅ **Clean Microservices Architecture**
- Separation of concerns
- Each service has one responsibility
- Easy to replace/update individual services

✅ **Error Handling**
- Network errors caught gracefully
- Service unavailability detected
- Timeouts handled properly
- User-friendly error messages

✅ **Logging & Debugging**
- Full request/response tracking
- Timestamps on all logs
- Error stack traces

✅ **Production Ready**
- Proper HTTP status codes
- Validation on both sides
- Pydantic models for type safety
- Async/await for performance

✅ **Extensible**
- Easy to add real LLM integration
- Database integration point-ready
- Authentication-ready
- Rate limiting-ready

---

## 🚨 Common Issues & Fixes

### Issue: "Cannot connect to AI Service"

**Check:**
```bash
# Is AI service running?
curl http://localhost:8000

# If port is blocked, kill and restart:
lsof -i :8000           # Find process
kill -9 <PID>           # Kill it
python main.py          # Restart
```

### Issue: "ModuleNotFoundError"

**Fix:**
```bash
cd ai-service
pip install -r requirements.txt
```

### Issue: "Port already in use"

**Fix:**
```bash
# Find process on port
Get-NetTCPConnection -LocalPort 8000  # Windows

# Kill it
taskkill /PID <PID> /F

# Or use different port in main.py line:
# uvicorn.run(..., port=8001)
```

### Issue: Frontend shows "Failed to get response"

**Debug:**
1. Check backend terminal - see any errors?
2. Check if AI service is running on 8000
3. Check backend `.env` has correct `AI_SERVICE_URL`
4. Open http://localhost:8000/docs to verify AI service works
5. Check browser DevTools Network tab for exact error

---

## 📚 File Structure

```
ai-chatbot/
├── ai-service/                          ✨ NEW
│   ├── main.py                          ✨ FastAPI app
│   ├── requirements.txt                 ✨ Python dependencies
│
├── backend/
│   ├── controllers/
│   │   └── chatController.js            ✅ UPDATED - Now calls FastAPI
│   ├── routes/chatRoutes.js             ✓ No changes needed
│   ├── index.js                         ✓ No changes needed
│   ├── .env                             ✅ UPDATED - Added AI_SERVICE_URL
│   ├── package.json                     ✓ axios already present
│   ├── test-integration.js              ✨ NEW - Test script
│   └── API_DOCUMENTATION.md             ✓ Existing
│
├── frontend/
│   ├── src/
│   │   ├── services/api.js              ✓ No changes needed
│   │   ├── hooks/useChat.js             ✓ No changes needed
│   │   └── components/ChatLayout.jsx    ✓ No changes needed
│   └── .env                             ✓ No changes needed
│
├── NODE_FASTAPI_SETUP.md                ✨ NEW - This guide
└── SETUP_GUIDE.md                       ✓ Existing
```

---

## 🎯 Next Steps: AI/LLM Integration

To replace mock responses with real AI:

### Option 1: OpenAI API
```python
# In ai-service/main.py
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

async def generate_ai_response(message: str) -> str:
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": message}]
    )
    return response['choices'][0]['message']['content']
```

### Option 2: Hugging Face
```python
from transformers import pipeline

generator = pipeline("text-generation", model="gpt2")

async def generate_ai_response(message: str) -> str:
    result = generator(message, max_length=100)
    return result[0]['generated_text']
```

### Option 3: Ollama (Local LLM)
```python
import requests

async def generate_ai_response(message: str) -> str:
    response = requests.post(
        'http://localhost:11434/api/generate',
        json={"model": "llama2", "prompt": message}
    )
    return response.json()['response']
```

---

## 📊 Performance Notes

- **Response Time**: ~100-200ms (mock)
- **Timeout**: 30 seconds (configurable)
- **Max Message Length**: 5000 characters
- **Concurrent Requests**: Handled automatically

---

## ✅ Verification Checklist

Before declaring success, verify:

- [ ] AI Service running on http://localhost:8000
- [ ] Node Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5174
- [ ] http://localhost:8000/docs accessible (Swagger UI)
- [ ] Send message via UI → see response
- [ ] Check logs in all 3 terminals
- [ ] Run `node test-integration.js` - all pass
- [ ] Try different messages (hello, how, help, etc.)

---

## 🎉 You're All Set!

Your application now has:

✅ Full microservices architecture
✅ Frontend → Backend → AI Service integration
✅ Error handling & logging
✅ Clean code structure
✅ Production-ready foundation

**Ready to add real AI! 🚀**

---

## 📞 Quick Reference

| Component | URL | Port | Status |
|-----------|-----|------|--------|
| Frontend | http://localhost:5174 | 5174 | ✅ |
| Node Backend | http://localhost:5000 | 5000 | ✅ |
| FastAPI Service | http://localhost:8000 | 8000 | ✅ |
| FastAPI Docs | http://localhost:8000/docs | 8000 | 📖 |

---

**Everything is ready. Start the services and test!** 💪
