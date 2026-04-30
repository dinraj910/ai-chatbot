# Backend API Documentation

## Overview

This is a production-ready Node.js + Express backend for the ChatGPT-style AI web application. Currently, it provides mock responses. The architecture is designed to seamlessly integrate with FastAPI + LLM services in the future.

## Architecture

```
backend/
├── index.js                 # Server entry point & middleware setup
├── routes/
│   └── chatRoutes.js       # API route definitions
├── controllers/
│   └── chatController.js   # Business logic & request handlers
├── .env                    # Environment configuration
└── package.json
```

## API Endpoints

### POST `/api/chat`

Send a message to the assistant and receive a response.

**Request:**
```json
{
  "message": "What is React?"
}
```

**Response (Success - 200):**
```json
{
  "reply": "React is a JavaScript library for building user interfaces...",
  "timestamp": "2026-04-30T12:00:00.000Z"
}
```

**Response (Error - 400):**
```json
{
  "error": "Message cannot be empty."
}
```

**Response (Error - 500):**
```json
{
  "error": "Failed to process your message. Please try again."
}
```

## Current Implementation

### Mock Response Logic

The controller currently generates mock responses based on keyword matching:

- **"hello"** → "Hello! How can I assist you today?"
- **"how"** → "I'm doing great! Thanks for asking. How can I help?"
- **"help"** → "I'm here to help with coding, writing, problem-solving, and more. What would you like to know?"
- **"thanks"** → "You're welcome! Feel free to ask me anything else."
- **"bye"** → "Goodbye! Have a great day!"
- **Default** → Generic response with message echo

### Error Handling

- **Validation**: Ensures message is a non-empty string
- **Try/Catch**: All errors are caught and returned as JSON responses
- **Logging**: All requests and responses are logged to console for debugging

## Running the Backend

### Prerequisites

- Node.js v16+ installed
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Development

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

**Output:**
```
🚀 Server is running on http://localhost:5000
📍 API Base: http://localhost:5000/api
💬 Chat endpoint: POST http://localhost:5000/api/chat
```

### Production

```bash
npm start
```

## Testing the API

### Using cURL

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello world"}'
```

### Using Postman

1. Set method to **POST**
2. URL: `http://localhost:5000/api/chat`
3. Headers: `Content-Type: application/json`
4. Body (raw):
```json
{
  "message": "Hello world"
}
```

## Future Integration Points

### 1. FastAPI Integration

Replace the mock response with a call to FastAPI:

```javascript
const response = await axios.post('http://127.0.0.1:8000/generate', {
  message: trimmedMessage
});
const reply = response.data.reply;
```

### 2. LLM Integration

Replace mock logic with actual model inference:

```javascript
// Using OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const reply = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: trimmedMessage }]
});
```

### 3. Database Integration

Store conversations in MongoDB:

```javascript
const message = new Message({
  userId: req.user.id,
  content: userMessage,
  role: 'user',
  timestamp: new Date()
});
await message.save();
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
# Future variables:
# OPENAI_API_KEY=sk-...
# FASTAPI_URL=http://localhost:8000
# MONGODB_URI=mongodb://localhost:27017/chatbot
```

## Middleware Stack

1. **CORS**: Enabled for all origins (production: restrict to frontend domain)
2. **express.json()**: Parses incoming JSON requests
3. **Request Logging**: Console logs all HTTP requests
4. **Error Handler**: Global error middleware for consistent error responses

## Code Quality

- ✅ Modular architecture (separation of concerns)
- ✅ Comprehensive error handling
- ✅ Descriptive logging
- ✅ Production-ready structure
- ✅ Future-ready for LLM/AI integration

## Next Steps

1. ✅ Connect frontend to this backend
2. ⏳ Integrate FastAPI service
3. ⏳ Add LLM model support
4. ⏳ Implement conversation history with database
5. ⏳ Add authentication & authorization
6. ⏳ Implement streaming responses
