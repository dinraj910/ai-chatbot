"""
FastAPI AI Service - Free API Integration with Fallback
Uses OpenRouter, Gemini, and other free APIs
Production-ready deployment without PyTorch/GPU requirements
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load environment variables from .env file
import pathlib
env_path = pathlib.Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.info(f"Loading environment from: {env_path}")
logger.info(f"OPENROUTER_API_KEY present: {bool(os.getenv('OPENROUTER_API_KEY'))}")
logger.info(f"GEMINI_API_KEY present: {bool(os.getenv('GEMINI_API_KEY'))}")

# ============================================================================
# Configuration - API Keys & Providers
# ============================================================================

# Get API keys from environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
FALLBACK_MODE = os.getenv("FALLBACK_MODE", "true").lower() == "true"

# API Endpoints
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

# ============================================================================
# LLM Provider Classes
# ============================================================================

class LLMProvider:
    """Base class for LLM providers"""
    
    async def generate_response(self, message: str) -> Optional[str]:
        """Generate response from user message"""
        raise NotImplementedError

class OpenRouterProvider(LLMProvider):
    """OpenRouter API provider (supports multiple models, free tier available)"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.url = OPENROUTER_URL
        self.model = "mistralai/mistral-7b-instruct"  # Free model
        
    async def generate_response(self, message: str) -> Optional[str]:
        """Call OpenRouter API"""
        if not self.api_key:
            logger.warning("[OpenRouter] No API key provided")
            return None
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "HTTP-Referer": "http://localhost:5000",
                        "X-Title": "AI Chat",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "user",
                                "content": message
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 500,
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    reply = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    logger.info(f"[OpenRouter] ✅ Generated response: {reply[:60]}...")
                    return reply
                else:
                    logger.warning(f"[OpenRouter] Error {response.status_code}: {response.text[:100]}")
                    return None
                    
        except Exception as e:
            logger.warning(f"[OpenRouter] Failed: {str(e)}")
            return None

class GeminiProvider(LLMProvider):
    """Google Gemini API provider (free tier available)"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.url = GEMINI_URL
        
    async def generate_response(self, message: str) -> Optional[str]:
        """Call Gemini API"""
        if not self.api_key:
            logger.warning("[Gemini] No API key provided")
            return None
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.url}?key={self.api_key}",
                    json={
                        "contents": {
                            "parts": [
                                {
                                    "text": message
                                }
                            ]
                        },
                        "generationConfig": {
                            "temperature": 0.7,
                            "maxOutputTokens": 500,
                        }
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content = candidates[0].get("content", {}).get("parts", [])
                        if content:
                            reply = content[0].get("text", "")
                            logger.info(f"[Gemini] ✅ Generated response: {reply[:60]}...")
                            return reply
                    return None
                else:
                    logger.warning(f"[Gemini] Error {response.status_code}: {response.text[:100]}")
                    return None
                    
        except Exception as e:
            logger.warning(f"[Gemini] Failed: {str(e)}")
            return None

class FallbackProvider(LLMProvider):
    """Fallback provider with multiple LLM options"""
    
    def __init__(self):
        self.providers = []
        
        # Add available providers in order of preference
        if OPENROUTER_API_KEY:
            logger.info("[FallbackProvider] Adding OpenRouter provider")
            self.providers.append(("OpenRouter", OpenRouterProvider(OPENROUTER_API_KEY)))
        
        if GEMINI_API_KEY:
            logger.info("[FallbackProvider] Adding Gemini provider")
            self.providers.append(("Gemini", GeminiProvider(GEMINI_API_KEY)))
        
        if not self.providers:
            logger.warning("⚠️ No API keys configured! Set OPENROUTER_API_KEY or GEMINI_API_KEY")
    
    async def generate_response(self, message: str) -> str:
        """Try providers in order, fallback if needed"""
        
        if not self.providers:
            return "⚠️ No API providers configured. Please set OPENROUTER_API_KEY or GEMINI_API_KEY environment variables."
        
        for provider_name, provider in self.providers:
            logger.info(f"🔄 Trying {provider_name}...")
            reply = await provider.generate_response(message)
            
            if reply:
                logger.info(f"✅ Used provider: {provider_name}")
                return reply
        
        # All providers failed
        logger.error("❌ All providers failed")
        return "Sorry, I'm unable to generate a response at the moment. Please try again later."

# ============================================================================
# Initialize Provider
# ============================================================================

llm_provider = None

def init_provider():
    """Initialize the LLM provider"""
    global llm_provider
    
    logger.info("=" * 70)
    logger.info("🚀 AI Chat Service - Free API Integration")
    logger.info("=" * 70)
    
    llm_provider = FallbackProvider()
    
    if not llm_provider.providers:
        logger.warning("⚠️ WARNING: No API keys found!")
        logger.warning("Set environment variables:")
        logger.warning("  - OPENROUTER_API_KEY (for OpenRouter)")
        logger.warning("  - GEMINI_API_KEY (for Google Gemini)")
    else:
        logger.info(f"✅ Configured providers: {len(llm_provider.providers)}")
        for name, _ in llm_provider.providers:
            logger.info(f"   - {name}")

# ============================================================================
# FastAPI Lifespan
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage FastAPI application lifecycle"""
    
    init_provider()
    logger.info("✅ AI Service ready!")
    logger.info("📍 Service running on http://127.0.0.1:8000")
    logger.info("📖 API docs: http://127.0.0.1:8000/docs")
    logger.info("=" * 70)
    
    yield
    
    logger.info("=" * 70)
    logger.info("🛑 AI Chat Service shutting down...")
    logger.info("=" * 70)

# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="AI Chat Service",
    description="Production-ready AI chat service using free APIs with fallback support",
    version="3.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Pydantic Models
# ============================================================================

class ChatRequest(BaseModel):
    """User message request"""
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User message"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "What is artificial intelligence?"
            }
        }

class ChatResponse(BaseModel):
    """AI response"""
    reply: str = Field(..., description="AI generated reply")
    message_length: int = Field(..., description="Length of user message")
    provider: str = Field(..., description="Which API provider was used")
    
    class Config:
        json_schema_extra = {
            "example": {
                "reply": "AI stands for Artificial Intelligence...",
                "message_length": 40,
                "provider": "OpenRouter"
            }
        }

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", tags=["health"])
async def health_check():
    """Health check endpoint"""
    global llm_provider
    
    providers_available = []
    if llm_provider:
        providers_available = [name for name, _ in llm_provider.providers]
    
    return {
        "status": "ok",
        "service": "AI Chat Service",
        "version": "3.0.0",
        "providers": providers_available,
        "mode": "free-api-with-fallback"
    }

@app.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat_endpoint(request: ChatRequest):
    """
    Main chat endpoint
    Uses free APIs with automatic fallback support
    """
    global llm_provider
    
    try:
        message = request.message.strip()
        
        if not message:
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )
        
        if not llm_provider or not llm_provider.providers:
            raise HTTPException(
                status_code=503,
                detail="No API providers configured. Please set OPENROUTER_API_KEY or GEMINI_API_KEY."
            )
        
        logger.info(f"[Chat] Received: '{message[:50]}...'")
        
        # Generate response with timeout
        try:
            reply = await asyncio.wait_for(
                llm_provider.generate_response(message),
                timeout=30.0
            )
        except asyncio.TimeoutError:
            logger.error("[Chat] Response generation timed out")
            raise HTTPException(
                status_code=504,
                detail="AI service took too long to respond. Please try again."
            )
        
        if not reply:
            raise HTTPException(
                status_code=503,
                detail="All API providers are currently unavailable. Please try again later."
            )
        
        # Determine which provider was used (for now, just track it in logs)
        provider_used = llm_provider.providers[0][0] if llm_provider.providers else "Unknown"
        
        return ChatResponse(
            reply=reply,
            message_length=len(message),
            provider=provider_used
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Chat] Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(e)}"
        )

# ============================================================================
# Run Server
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )
