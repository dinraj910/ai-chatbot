"""
FastAPI AI Service - Hugging Face LLM Integration
Real AI responses powered by transformers library
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# Global LLM Pipeline (loaded once at startup)
# ============================================================================

# This will be initialized at startup
llm_pipeline = None

def init_llm():
    """
    Initialize the Hugging Face LLM pipeline
    Uses distilgpt2 - a fast, lightweight model suitable for chat
    """
    global llm_pipeline
    
    try:
        logger.info("🤖 Loading Hugging Face model...")
        
        from transformers import pipeline
        
        # Using distilgpt2 - fast and lightweight
        # Other options:
        # - gpt2: Larger but slower (~350MB)
        # - distilbert-base-uncased: For classification
        # - EleutherAI/gpt-j-6B: Larger model (requires GPU and more VRAM)
        
        llm_pipeline = pipeline(
            'text-generation',
            model='distilgpt2',
            device=-1  # -1 = CPU, 0 = GPU (if available)
        )
        
        logger.info("✅ LLM model loaded successfully!")
        logger.info("📊 Model: distilgpt2 (117M parameters)")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to load LLM model: {str(e)}")
        logger.error("💡 Try running: pip install -r requirements.txt")
        return False

def generate_response(message: str) -> str:
    """
    Generate AI response using Hugging Face LLM
    
    Args:
        message: User input message
        
    Returns:
        AI-generated response
    """
    global llm_pipeline
    
    if llm_pipeline is None:
        logger.error("LLM pipeline not initialized")
        raise RuntimeError("AI model not available")
    
    try:
        # Create a conversation-style prompt
        prompt = f"Q: {message}\nA:"
        
        logger.info(f"🔄 Generating response for: '{message[:50]}...'")
        
        # Generate response with optimized parameters
        outputs = llm_pipeline(
            prompt,
            max_length=150,           # Maximum response length
            num_return_sequences=1,   # Generate 1 response
            temperature=0.8,          # Creativity (0.0-1.0)
            top_p=0.95,              # Nucleus sampling
            do_sample=True,          # Use sampling (better quality)
            repetition_penalty=1.2,  # Avoid repetition
        )
        
        # Extract response
        full_response = outputs[0]['generated_text']
        
        # Clean up: remove the prompt from the response
        response = full_response.replace(prompt, '').strip()
        
        # If response is empty, provide a helpful fallback
        if not response or len(response) < 5:
            response = f"I understand you're asking about '{message}'. That's an interesting question. Could you tell me more about what you'd like to know?"
        
        # Ensure response ends with proper punctuation
        if response and response[-1] not in '.!?':
            response += '.'
        
        logger.info(f"✅ Response generated: '{response[:60]}...'")
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Error generating response: {str(e)}")
        return f"I apologize, but I encountered an error: {str(e)}. Please try again with a different message."

# ============================================================================
# FastAPI Lifespan Events
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage FastAPI application lifecycle
    Initializes LLM on startup
    """
    # Startup
    logger.info("=" * 70)
    logger.info("🚀 AI Chat Service - Hugging Face Integration")
    logger.info("=" * 70)
    
    # Initialize LLM in a thread to avoid blocking
    loop = asyncio.get_event_loop()
    success = await loop.run_in_executor(None, init_llm)
    
    if success:
        logger.info("✅ AI Service ready for requests!")
    else:
        logger.warning("⚠️ AI Service started but LLM initialization failed")
    
    logger.info("📍 Service running on http://127.0.0.1:8000")
    logger.info("📖 API docs: http://127.0.0.1:8000/docs")
    logger.info("=" * 70)
    
    yield
    
    # Shutdown
    logger.info("=" * 70)
    logger.info("🛑 AI Chat Service shutting down...")
    logger.info("=" * 70)

# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="AI Chat Service",
    description="Real-time AI chat service powered by Hugging Face transformers",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (restrict in production)
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
    model: str = Field(default="distilgpt2", description="Model used")
    
    class Config:
        json_schema_extra = {
            "example": {
                "reply": "AI stands for Artificial Intelligence, which refers to computer systems...",
                "message_length": 40,
                "model": "distilgpt2"
            }
        }

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", tags=["health"])
async def health_check():
    """
    Health check endpoint
    Returns service status and model information
    """
    global llm_pipeline
    
    return {
        "status": "ok",
        "service": "AI Chat Service",
        "version": "2.0.0",
        "llm_ready": llm_pipeline is not None,
        "model": "distilgpt2 (Hugging Face)",
        "framework": "transformers"
    }

@app.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat_endpoint(request: ChatRequest):
    """
    Main chat endpoint
    Processes user message and returns AI response using Hugging Face LLM
    
    Args:
        request: ChatRequest with user message
        
    Returns:
        ChatResponse with AI reply and metadata
        
    Raises:
        HTTPException: If LLM not ready or processing fails
    """
    try:
        global llm_pipeline
        
        if llm_pipeline is None:
            logger.error("LLM not initialized")
            raise HTTPException(
                status_code=503,
                detail="AI model is not ready. Please try again in a moment."
            )
        
        message = request.message.strip()
        
        if not message:
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )
        
        logger.info(f"[Chat] Received: '{message[:50]}...'")
        
        # Generate response in executor to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        reply = await loop.run_in_executor(None, generate_response, message)
        
        logger.info(f"[Chat] Responding: '{reply[:50]}...'")
        
        return ChatResponse(
            reply=reply,
            message_length=len(message),
            model="distilgpt2"
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
