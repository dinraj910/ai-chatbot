# Frontend API Integration

## Overview

The frontend uses a clean, modular service layer and custom hooks for chat state management. All communication with the backend is handled through the `api.js` service and `useChat.js` hook.

## Architecture

```
frontend/src/
├── services/
│   └── api.js                 # API client & HTTP configuration
├── hooks/
│   └── useChat.js             # Chat state management hook
├── components/
│   ├── ChatLayout.jsx         # Main layout (uses useChat)
│   ├── ChatInput.jsx          # Message input component
│   ├── MessageBubble.jsx      # Message display component
│   ├── ChatHeader.jsx         # Header with model selector
│   └── Sidebar.jsx            # Chat history sidebar
└── .env                       # Environment configuration
```

## API Service (`src/services/api.js`)

### Configuration

The API client is configured with:
- **Base URL**: `http://localhost:5000/api` (configurable via `.env`)
- **Timeout**: 30 seconds
- **Headers**: `Content-Type: application/json`

### Interceptors

**Request Interceptor:**
- Logs all outgoing requests
- Attaches auth headers (future)

**Response Interceptor:**
- Logs all responses
- Handles errors gracefully
- Provides user-friendly error messages

### API Functions

#### `sendMessage(message: string): Promise<string>`

Sends a message to the backend and returns the assistant's reply.

**Usage:**
```javascript
import { sendMessage } from '../services/api';

try {
  const reply = await sendMessage('What is React?');
  console.log(reply);
} catch (error) {
  console.error(error.message);
}
```

**Error Handling:**
- `400 Bad Request`: Invalid message format
- `500 Server Error`: Server processing error
- Network error: Connection failed
- All errors are thrown with user-friendly messages

## Chat Hook (`src/hooks/useChat.js`)

Custom React hook that manages all chat state and logic.

### State

```javascript
const {
  messages,        // Array of message objects
  isLoading,       // Boolean indicating if waiting for response
  error,           // Error message string or null
  sendUserMessage, // Function to send a message
  addMessage,      // Function to add a message
  updateLastMessage, // Function to update last message
  clearMessages    // Function to clear all messages
} = useChat();
```

### Message Object Format

```javascript
{
  id: "user-1234567890",
  role: "user" | "assistant",
  content: "Message text",
  timestamp: "2026-04-30T12:00:00.000Z"
}
```

### Core Functions

#### `sendUserMessage(userInput: string): Promise<void>`

Main function to send a message. Handles the complete flow:

1. Validates input
2. Adds user message to UI immediately
3. Adds loading placeholder
4. Calls backend API
5. Replaces placeholder with real response or error
6. Updates error state

**Usage:**
```javascript
const { sendUserMessage, isLoading } = useChat();

const handleSubmit = async (message) => {
  await sendUserMessage(message);
};
```

#### `addMessage(content: string, role: string): Message`

Manually add a message to the chat.

```javascript
const { addMessage } = useChat();
addMessage("Hello", "user");
```

#### `updateLastMessage(content: string): void`

Update the last message (useful for replacing loading state).

```javascript
const { updateLastMessage } = useChat();
updateLastMessage("New content");
```

#### `clearMessages(): void`

Clear all messages (for new chat).

```javascript
const { clearMessages } = useChat();
clearMessages();
```

## Message Flow Diagram

```
┌─────────────────────────────────────────────┐
│         User Types Message & Sends          │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         ┌───────────────────┐
         │  Add User Message │ (Instant UI update)
         └────────┬──────────┘
                  │
                  ▼
      ┌──────────────────────────┐
      │ Add Loading Placeholder  │ (Show "...")
      └───────────┬──────────────┘
                  │
                  ▼
       ┌────────────────────────┐
       │  Call Backend API      │ (POST /api/chat)
       └────────┬───────────────┘
                │
       ┌────────┴────────┐
       │                 │
    Success           Error
       │                 │
       ▼                 ▼
  ┌─────────────┐  ┌──────────────┐
  │Real Reply   │  │Error Message │
  └──────┬──────┘  └────────┬─────┘
         │                  │
         └────────┬─────────┘
                  │
                  ▼
      ┌──────────────────────┐
      │ Replace Last Message │
      └──────────────────────┘
```

## Using in Components

### Example: ChatLayout Component

```javascript
import useChat from '../hooks/useChat';

export default function ChatLayout() {
  const { messages, isLoading, error, sendUserMessage } = useChat();

  const handleSendMessage = async (content) => {
    await sendUserMessage(content);
  };

  return (
    <div>
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && <LoadingIndicator />}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
```

## Environment Configuration

Create `.env` in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Access in code:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL;
```

## Error Handling

### User-Friendly Errors

The API service converts technical errors into user-friendly messages:

```
Raw Error: axios network error
↓
User Message: "Unable to connect to server. Please check your connection."
```

### Error Display in UI

The ChatLayout component displays errors:

```javascript
{error && (
  <div className="error-banner">
    <AlertIcon />
    {error}
  </div>
)}
```

## Running the Frontend

### Development

```bash
cd frontend
npm run dev
```

Server: `http://localhost:5173`

### Production Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Testing the Integration

### 1. Start Backend

```bash
cd backend
npm run dev
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Test in Browser

1. Navigate to `http://localhost:5173`
2. Type a message in the input box
3. Press Enter or click Send
4. Verify:
   - User message appears immediately
   - Loading indicator shows
   - Backend response appears

### 4. Check Backend Logs

Backend logs show:
```
[Chat] Received message: "Hello world"
[Chat] Sending reply: "Hello! How can I assist you today?"
```

## Debugging

### Browser Console

Check for API request/response logs:
```javascript
[API Request] POST /chat
[API Response] 200 /chat
```

### Network Tab

In browser DevTools → Network:
- Request: POST http://localhost:5000/api/chat
- Response body: `{ "reply": "..." }`

### Backend Logs

Terminal shows all incoming requests and responses.

## Future Enhancements

1. ✅ Basic API integration
2. ⏳ Add message persistence
3. ⏳ Implement streaming responses (WebSockets)
4. ⏳ Add request retry logic
5. ⏳ Implement request cancellation
6. ⏳ Add optimistic updates
7. ⏳ Cache responses

## Code Quality

- ✅ Separation of concerns (service, hook, components)
- ✅ Comprehensive error handling
- ✅ Proper async/await usage
- ✅ Clean prop drilling (hook-based state)
- ✅ Reusable API layer
- ✅ Production-ready architecture
