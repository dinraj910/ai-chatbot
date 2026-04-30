# 🚀 Free API Deployment Guide - Production Ready

## ✨ What Changed

**Before:** Local PyTorch model (heavy, slow to install, GPU-intensive)  
**After:** Free APIs with automatic fallback ✅

---

## 🎯 Why Free APIs?

✅ **Easy deployment** - No PyTorch/GPU needed  
✅ **Fast setup** - Install in seconds  
✅ **Production ready** - Scalable and reliable  
✅ **Free tier** - Get started without spending money  
✅ **Fallback support** - If one API fails, try another  

---

## 📋 Quick Setup

### Step 1: Install Dependencies (5 seconds)

```bash
cd ai-service
pip install -r requirements.txt
```

**That's it!** Just 3 tiny packages:
- fastapi
- uvicorn
- httpx (async HTTP)
- python-dotenv

### Step 2: Get Free API Keys

#### Option A: OpenRouter (Recommended)
1. Go to: https://openrouter.ai/keys
2. Sign up (free)
3. Copy your API key

#### Option B: Google Gemini
1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Create API key

#### Option C: Both (Recommended for Fallback)
Get both keys for automatic fallback support!

### Step 3: Configure Environment

```bash
cd ai-service
cp .env.example .env
```

Edit `.env`:
```env
OPENROUTER_API_KEY=your_key_from_step_2
GEMINI_API_KEY=your_other_key
FALLBACK_MODE=true
```

### Step 4: Start AI Service

```bash
python main.py
```

**Expected output:**
```
======================================================================
🚀 AI Chat Service - Free API Integration
======================================================================
✅ Configured providers: 2
   - OpenRouter
   - Gemini
✅ AI Service ready!
📍 Service running on http://127.0.0.1:8000
📖 API docs: http://127.0.0.1:8000/docs
======================================================================
```

### Step 5: Start Backend & Frontend

```bash
# Terminal 2
cd backend
npm run dev

# Terminal 3
cd frontend
npm run dev
```

### Step 6: Start Using! 🎉

Open: http://localhost:5174

---

## 🔄 How Fallback Works

```
User sends message
       ↓
Try OpenRouter API
       ↓ (if fails)
Try Gemini API
       ↓ (if fails)
Return error
```

**Benefits:**
- If OpenRouter is down, Gemini takes over
- Transparent to user
- No manual intervention needed
- Logs show which provider was used

---

## 💰 Free Tier Limits

| Provider | Free Tier | Cost After |
|----------|-----------|------------|
| **OpenRouter** | Free with various models | Free tier available indefinitely |
| **Google Gemini** | 60 requests/min | $0.00025-$0.001 per 1k tokens |
| **OpenAI** | $5 free credits | $0.0005-$0.003 per 1k tokens |

---

## 📊 Full Deployment Architecture

```
┌──────────────────────────┐
│   React Frontend         │
│   (localhost:5174)       │
└──────────────┬───────────┘
               │
┌──────────────▼───────────┐
│   Node Backend           │
│   (localhost:5000)       │
└──────────────┬───────────┘
               │
┌──────────────▼─────────────────────┐
│   FastAPI + Free APIs               │
│   (localhost:8000)                  │
│                                     │
│   ✅ OpenRouter API (Primary)      │
│   ✅ Gemini API (Fallback)         │
│   ✅ More providers ready           │
└─────────────────────────────────────┘
```

---

## 🧪 Testing

### Test 1: Health Check

```bash
curl http://localhost:8000

# Response:
# {
#   "status": "ok",
#   "service": "AI Chat Service",
#   "version": "3.0.0",
#   "providers": ["OpenRouter", "Gemini"],
#   "mode": "free-api-with-fallback"
# }
```

### Test 2: Send Message

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is AI?"}'

# Response:
# {
#   "reply": "AI stands for Artificial Intelligence...",
#   "message_length": 11,
#   "provider": "OpenRouter"
# }
```

### Test 3: Full Stack via UI

1. Open http://localhost:5174
2. Type: "Hello, what can you do?"
3. Get real AI response instantly ✅

---

## 🔧 Configuration Options

### Environment Variables

```bash
# Required: At least one API key
OPENROUTER_API_KEY=sk-...
GEMINI_API_KEY=AIza...

# Optional
FALLBACK_MODE=true  # Enable automatic fallback
```

### Adjust Provider Order

Edit `ai-service/main.py` in `FallbackProvider.__init__()`:

```python
# Change the order of providers
if GEMINI_API_KEY:
    self.providers.append(("Gemini", GeminiProvider(GEMINI_API_KEY)))

if OPENROUTER_API_KEY:
    self.providers.append(("OpenRouter", OpenRouterProvider(OPENROUTER_API_KEY)))
```

---

## 🚀 Production Deployment

### Deploy to Heroku (Free)

```bash
# 1. Create Procfile
echo 'web: cd ai-service && python main.py' > Procfile

# 2. Create runtime.txt
echo 'python-3.11.0' > runtime.txt

# 3. Set environment variables
heroku config:set OPENROUTER_API_KEY=your_key
heroku config:set GEMINI_API_KEY=your_key

# 4. Deploy
git push heroku main
```

### Deploy to Railway (Free)

```bash
# Connect your GitHub repo
# Add environment variables in dashboard
# Deploy automatically on push
```

### Deploy to Render (Free)

```bash
# Similar to Railway
# https://render.com
```

---

## 📋 Files Overview

```
ai-service/
├── main.py                  ✅ Updated - Free API integration
├── requirements.txt         ✅ Updated - Minimal dependencies
├── .env.example            ✨ NEW - Configuration template
├── .env                    (your actual keys - never commit!)
└── (no PyTorch needed!)
```

---

## ⚡ Response Time Comparison

| Method | Setup Time | Response Time | Cost |
|--------|-----------|---------------|------|
| Local PyTorch | 5-10 min | 1-3 sec | Free (resources) |
| **Free API** | **30 sec** | **0.5-1 sec** | **Free** |
| OpenAI API | 1 min | 0.3-0.5 sec | $0.0005/req |
| Cloud GPU | 20 min | 0.5-1 sec | $10-50/mo |

---

## 🔐 Security Best Practices

1. **Never commit `.env` file**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use `.env.example` for documentation**
   ```bash
   cp .env.example .env  # Users do this
   ```

3. **Rotate API keys regularly**
   - Change keys in provider dashboard
   - Update `.env`

4. **Use rate limiting in production**
   ```python
   from slowapi import Limiter
   limiter = Limiter(key_func=get_remote_address)
   ```

---

## 🐛 Troubleshooting

### Issue: "No API providers configured"

**Solution:**
```bash
cd ai-service
cp .env.example .env
# Edit .env with your API keys
```

### Issue: "OpenRouter API key invalid"

**Solution:**
```bash
# Verify key format: should start with "sk-"
# Get new key from: https://openrouter.ai/keys
```

### Issue: Slow responses

**Solution:**
- First request is slower (API warmup)
- Use faster model in OpenRouter settings
- Check internet connection

### Issue: "Quota exceeded"

**Solution:**
- You've hit free tier limits
- Upgrade to paid tier
- Or add another API key for fallback

---

## 📈 Scaling to Production

### Step 1: Add More Providers
```python
class OtherProvider(LLMProvider):
    # Implement your provider
```

### Step 2: Add Rate Limiting
```bash
pip install slowapi
```

### Step 3: Add Database
```bash
pip install sqlalchemy
```

### Step 4: Add Monitoring
```bash
pip install prometheus-client
```

---

## 🎯 Advanced: Custom Providers

Add support for other APIs easily:

```python
class MyCustomProvider(LLMProvider):
    async def generate_response(self, message: str) -> Optional[str]:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://my-api.com/chat",
                json={"message": message}
            )
            return response.json()["reply"]

# Then add to FallbackProvider:
# self.providers.append(("MyCustom", MyCustomProvider()))
```

---

## ✅ Final Checklist

- [ ] API keys obtained (OpenRouter and/or Gemini)
- [ ] `.env` file created with API keys
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] AI Service starts: `python main.py`
- [ ] Health check passes: `curl http://localhost:8000`
- [ ] Node Backend running
- [ ] Frontend running
- [ ] Can send message through UI
- [ ] Get real AI response
- [ ] No errors in logs

---

## 🎉 You're Ready!

Your AI chat is now:
✅ Easy to deploy  
✅ Fast to set up  
✅ Production ready  
✅ Scalable  
✅ Free to start  

**Deploy anywhere, instantly! 🚀**

---

## 📞 API Provider Links

- **OpenRouter:** https://openrouter.ai/
- **Google Gemini:** https://aistudio.google.com/
- **OpenAI:** https://platform.openai.com/ (optional)
- **Anthropic Claude:** https://console.anthropic.com/ (optional)

Get started with any of these to power your AI chat! 🤖
