"""
FastAPI Service for AI Chat Application
Microservice for processing chat messages with mock AI responses
Future: Will integrate with real LLM models
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Chat Service",
    description="Microservice for processing chat messages",
    version="1.0.0"
)

# Enable CORS for Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request/response validation
class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str = Field(
        ..., 
        min_length=1, 
        max_length=5000,
        description="User message to process"
    )

    class Config:
        """Pydantic config"""
        example = {"message": "What is AI?"}


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    reply: str = Field(..., description="AI response to user message")
    message_length: Optional[int] = Field(
        None, 
        description="Length of original message"
    )

    class Config:
        """Pydantic config"""
        example = {
            "reply": "AI response text",
            "message_length": 12
        }


@app.get("/", tags=["Health"])
async def health_check() -> dict:
    """
    Health check endpoint
    Returns: Service status and uptime info
    """
    return {
        "status": "ok",
        "service": "AI Chat Service",
        "version": "1.0.0"
    }


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a chat message
    
    Args:
        request: ChatRequest with user message
        
    Returns:
        ChatResponse with AI reply
        
    Raises:
        HTTPException: If message processing fails
    """
    try:
        message = request.message.strip()
        
        if not message:
            logger.warning("Empty message received")
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )
        
        logger.info(f"[AI Service] Processing message: {message[:50]}...")
        
        # Generate mock AI response
        reply = generate_ai_response(message)
        
        logger.info(f"[AI Service] Generated reply: {reply[:50]}...")
        
        return ChatResponse(
            reply=reply,
            message_length=len(message)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AI Service] Error processing message: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Internal server error while processing message"
        )


def generate_ai_response(message: str) -> str:
    """
    Generate mock AI response based on user message
    
    This is a placeholder for future LLM integration.
    Replace this function with actual model calls later.
    
    Args:
        message: User message to respond to
        
    Returns:
        Generated response text
    """
    lower_message = message.lower()
    
    # Simple keyword-based mock responses
    mock_responses = {
        "hello": "Hello! I'm an AI assistant. How can I help you today?",
        "how": "I'm doing great, thank you for asking! How can I assist you?",
        "help": "I can help you with coding, writing, analysis, and more. What do you need?",
        "thanks": "You're welcome! Feel free to ask me anything else.",
        "bye": "Goodbye! Have a great day!",
        "what is ai": "AI stands for Artificial Intelligence. It's technology that can learn and make decisions.",
        "python": "Python is a versatile programming language known for its simplicity and power in AI/ML.",
        "javascript": "JavaScript is a programming language that powers interactive web applications.",
        "react": "React is a JavaScript library for building user interfaces with components.",
    }
    
    # Check for keyword matches
    for keyword, response in mock_responses.items():
        if keyword in lower_message:
            return response
    
    # Default response
    return f"I understand you're asking about: '{message}'. This is a mock response. In production, I would use an LLM to generate a contextual answer. The message had {len(message)} characters."


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Log service startup"""
    logger.info("🚀 AI Chat Service starting up...")
    logger.info("📍 Service running on http://localhost:8000")
    logger.info("📖 API docs available at http://localhost:8000/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Log service shutdown"""
    logger.info("⛔ AI Chat Service shutting down...")


if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting AI Chat Service with Uvicorn...")
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
