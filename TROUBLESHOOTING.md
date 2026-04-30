# AI Chatbot Troubleshooting Guide

## Common Issues & Solutions

### 1. AI Service Won't Start

**Error**: `[Errno 98] Address already in use`

**Solution**:
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change the port in ai-service/main.py and update backend/.env
```

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
cd ai-service
pip install -r requirements.txt
```

---

### 2. API Keys Not Loading

**Symptom**: Health check shows `"providers": []` but keys are in `.env`

**Diagnosis**:
```bash
# Check if .env file exists and has correct format
cat ai-service/.env

# Verify Python can read it
python -c "from dotenv import load_dotenv; import os; load_dotenv('ai-service/.env'); print(os.getenv('OPENROUTER_API_KEY'))"
```

**Solutions**:
1. Ensure `.env` is in the `ai-service/` directory
2. No spaces around `=` in `.env` file:
   ```
   CORRECT: OPENROUTER_API_KEY=sk-or-v1-...
   WRONG:   OPENROUTER_API_KEY = sk-or-v1-...
   ```
3. Make sure there's no BOM (byte order mark) in file
4. Try with absolute path in python code

---

### 3. Chat Endpoint Returns 503 Error

**Error**: `{"detail":"No API providers configured. Please set OPENROUTER_API_KEY or GEMINI_API_KEY."}`

**Causes**:
1. Environment variables not loaded
2. `.env` file doesn't exist
3. Invalid path to `.env` file

**Solution**:
- Check `ai-service/main.py` line showing `Loading environment from: ...`
- Add explicit debug to verify keys are loaded before creating providers

---

### 4. External API Returns 400/401/404 Errors

**OpenRouter Error 400**: `"is not a valid model ID"`
- Try using model names from: https://openrouter.ai/models
- Common free models: `gpt-3.5-turbo`, `mistralai/mistral-7b-instruct`
- OpenRouter API key format should be: `sk-or-v1-...`

**OpenRouter Error 401**: Invalid API key
- Generate new key from https://openrouter.ai/keys
- Ensure no extra spaces in `.env`

**Gemini Error 404**: `"models/gemini-pro is not found"`
- Verify API key is valid from: https://aistudio.google.com/app/apikey
- Try using `gemini-1.5-flash` or `gemini-1.5-pro`
- Ensure API key format: starts with `AIza...`

**Gemini Error 429**: Rate limit exceeded
- Free tier: 60 requests per minute
- Wait before sending more messages
- Implement exponential backoff in production

---

### 5. Backend Can't Connect to AI Service

**Error**: `Connection refused` or `ECONNREFUSED`

**Diagnosis**:
```bash
# Check if AI service is running
curl http://localhost:8000/
# Should return health status JSON

# Check if backend is running  
curl http://localhost:5000/health
```

**Solutions**:
1. Verify AI service started successfully: `python ai-service/main.py`
2. Check `AI_SERVICE_URL` in `backend/.env` is correct
3. Verify ports not blocked by firewall
4. Try accessing directly in browser: `http://localhost:8000/`

---

### 6. Frontend Can't Connect to Backend

**Error**: Network error in console, messages don't send

**Diagnosis**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Send a message and look for the API call
4. Check response status and body

**Solutions**:
1. Ensure backend is running: `npm start` in `backend/`
2. Check `api.js` for correct endpoint URL
3. Verify CORS is enabled in backend
4. Try accessing backend health endpoint:
   ```bash
   curl http://localhost:5000/health
   ```

---

### 7. Message Sent But No Response

**Possible Causes**:
1. API rate limited (too many requests)
2. API key quota exceeded
3. Network timeout
4. Service crashed

**Debugging Steps**:
```bash
# Check AI service logs - look for HTTP requests
# Watch the terminal where you ran: python ai-service/main.py

# Manual test of AI service
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Test backend -> AI service
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

---

### 8. Port Already in Use

**For Frontend (5174)**:
```bash
# Kill the process
netstat -ano | findstr :5174
taskkill /PID <PID> /F

# Or change Vite port in vite.config.js
```

**For Backend (5000)**:
```bash
# Kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in backend/.env
```

**For AI Service (8000)**:
```bash
# Kill the process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change port in ai-service/main.py and update backend/.env
```

---

## Logging & Debugging

### Enable Detailed Logging

**AI Service**:
Edit `ai-service/main.py` and set:
```python
logging.basicConfig(level=logging.DEBUG)  # More verbose
```

**Backend**:
Add to `backend/index.js`:
```javascript
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, req.body);
    next();
});
```

**Frontend**:
In `frontend/src/services/api.js`:
```javascript
console.log('Request:', config);
console.log('Response:', response.data);
```

### Check API Documentation

- AI Service Swagger: http://localhost:8000/docs
- Request/response examples available
- Try endpoints directly from browser

---

## Performance Optimization

### If Service Is Slow

1. **Check API Response Time**:
   - OpenRouter typically: 1-5 seconds
   - Gemini typically: 2-8 seconds
   - This is normal for free tier

2. **Reduce Message Length**:
   - Shorter prompts = faster responses
   - Try: "Hello" instead of long context

3. **Use Faster Model** (on OpenRouter):
   - Switch from Mistral to GPT-3.5-turbo
   - Edit model in `ai-service/main.py`

### If Getting Rate Limited

1. Add delay between requests:
   ```python
   import asyncio
   await asyncio.sleep(1)  # 1 second delay
   ```

2. Reduce request frequency

3. Get paid tier API keys

---

## Testing Checklist

### Pre-Deployment Testing

- [ ] All three services start without errors
- [ ] Health check endpoint responds (http://localhost:8000/)
- [ ] Direct API test works:
  ```bash
  curl -X POST http://localhost:8000/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}'
  ```
- [ ] Backend routes to AI service correctly
- [ ] Frontend loads and connects to backend
- [ ] Message sends and receives response
- [ ] Error handling works (test with invalid inputs)
- [ ] Fallback works (disable first provider to test second)
- [ ] Logs are clean and informative

---

## Production Deployment Checklist

- [ ] Valid API keys obtained and tested
- [ ] Environment variables set on hosting platform
- [ ] HTTPS enabled on all endpoints
- [ ] CORS configured for production domain only
- [ ] Rate limiting implemented
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Logging aggregation configured
- [ ] Database for message history (optional)
- [ ] User authentication implemented (optional)
- [ ] Load testing completed
- [ ] Backup API provider configured
- [ ] Health check monitoring enabled

---

## Emergency Recovery

### Service Crashed

1. **Check what failed**:
   ```bash
   # Check logs in the terminal where service was running
   # Look for errors at the time of crash
   ```

2. **Restart in order**:
   ```bash
   # Terminal 1
   cd ai-service && python main.py
   
   # Terminal 2  
   cd backend && npm start
   
   # Terminal 3
   cd frontend && npm run dev
   ```

3. **Verify health**:
   - http://localhost:8000/ (AI service)
   - curl http://localhost:5000/ (backend)
   - http://localhost:5174 (frontend)

---

## Still Having Issues?

1. **Check error messages carefully** - they usually point to the exact problem
2. **Look at logs in all three terminal windows** - the error might be in a different service
3. **Test each service independently** - narrow down which layer has the problem
4. **Verify network connectivity** - can services reach each other?
5. **Check API credentials** - are keys valid and have permissions?
6. **Search for errors online** - error messages often have solutions
7. **Read API documentation** - OpenRouter and Gemini docs have troubleshooting sections

---

**Last Updated**: 2026-04-30  
**Version**: 1.0
