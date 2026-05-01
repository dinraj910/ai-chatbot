# 🤖 AI Chatbot — Project Phase Sheet

> **Last updated:** May 2026  
> **Stack:** React (Vite) · Node/Express (Gateway) · FastAPI (AI Service) · OpenRouter · Gemini

---

## 🗺️ Architecture Overview

```
┌─────────────┐     HTTP      ┌──────────────────┐     HTTP      ┌──────────────────────┐
│  Frontend   │ ────────────► │  Backend Gateway │ ────────────► │  AI Service (Python) │
│  React/Vite │ ◄──────────── │  Node / Express  │ ◄──────────── │  FastAPI + httpx     │
│  :5173      │               │  :5000            │               │  :8000               │
└─────────────┘               └──────────────────┘               └──────────────────────┘
                                                                          │
                                                              ┌───────────┴───────────┐
                                                              ▼                       ▼
                                                      OpenRouter API          Google Gemini API
                                                   (Llama 3.3 / Gemma)    (gemini-2.0-flash)
```

---

## ✅ Phase 0 — Foundation (DONE)

> Project scaffolding and basic message flow end-to-end.

- [x] Vite + React frontend (`/frontend`)
- [x] Express gateway (`/backend`) — proxies requests to Python service
- [x] FastAPI AI service (`/ai-service`) — calls LLM APIs
- [x] CORS configured on all layers
- [x] `.env` secrets management on all three services
- [x] End-to-end message flow: `User → React → Express → FastAPI → LLM → back`
- [x] Basic health-check endpoints (`GET /` on backend & ai-service)

---

## ✅ Phase 1 — Core Chat UI (DONE)

> Building the ChatGPT-style layout and message rendering.

- [x] `ChatLayout.jsx` — full-page layout with sidebar + main area
- [x] `Sidebar.jsx` — chat history list, New Chat button, My Account placeholder
- [x] `ChatHeader.jsx` — title bar with model badge and mobile menu
- [x] `ChatInput.jsx` — auto-growing textarea, Enter-to-send, shift+enter newline
- [x] `MessageBubble.jsx` — user & assistant message rendering
- [x] `useChat.js` custom hook — manages message state and API calls
- [x] `api.js` service layer — axios instance with interceptors
- [x] Empty state with quick-prompt suggestion cards
- [x] Loading bounce-dot animation while awaiting API response
- [x] Error display banner (API failure feedback)
- [x] Mobile responsive layout (sidebar overlay on small screens)

---

## ✅ Phase 2 — LLM Provider System (DONE)

> Reliable multi-provider fallback in the AI service.

- [x] `FallbackProvider` class — tries providers in priority order
- [x] `OpenRouterProvider` — iterates a list of `:free` model slugs
  - `meta-llama/llama-3.3-70b-instruct:free`
  - `google/gemma-3-4b-it:free`
  - `meta-llama/llama-3.2-3b-instruct:free`
  - `nousresearch/hermes-3-llama-3.1-405b:free`
  - `liquid/lfm-2.5-1.2b-instruct:free`
- [x] `GeminiProvider` — tries `gemini-2.0-flash` → `gemini-2.0-flash-lite`
- [x] 429 rate-limit retry with 3s backoff (Gemini)
- [x] All provider failures degrade gracefully (user sees friendly message)

---

## ✅ Phase 3 — Rich Message Rendering (DONE)

> Syntax highlighting, copy buttons, and typewriter streaming.

- [x] `react-syntax-highlighter` (One Dark theme) for fenced code blocks
- [x] Language label + line numbers on code blocks (> 4 lines)
- [x] macOS-style top bar on code blocks (traffic lights + language + copy)
- [x] Inline code styled with violet tint
- [x] Hover-reveal **Copy** button on all messages (user & assistant)
- [x] Chunk-based typewriter streaming (~4 words / 30ms)
- [x] Blinking cursor during streaming
- [x] Smart auto-scroll — follows bottom only if user hasn't scrolled up
- [x] Input locked (textarea + send button disabled) during streaming
- [x] Blockquote, heading, list, and `<hr>` markdown styling

---

## 🔲 Phase 4 — Authentication & User Accounts

> Give each user a private, persistent identity.

- [ ] **Backend**: Add User model with `mongoose` (already installed, unused)
- [ ] **Backend**: `POST /api/auth/register` — bcrypt password hashing
- [ ] **Backend**: `POST /api/auth/login` — JWT issuance
- [ ] **Backend**: Auth middleware (`verifyToken`) to protect chat routes
- [ ] **Frontend**: Login / Register pages
- [ ] **Frontend**: `AuthContext` — stores JWT, persists to localStorage
- [ ] **Frontend**: Protected route wrapper (redirect to login if unauthenticated)
- [ ] **Frontend**: Show logged-in user name in Sidebar footer
- [ ] **Frontend**: Logout button

---

## 🔲 Phase 5 — Persistent Chat History

> Store and reload conversations across sessions.

- [ ] **Backend**: `Chat` & `Message` Mongoose models
  - Chat: `{ userId, title, createdAt, updatedAt }`
  - Message: `{ chatId, role, content, timestamp }`
- [ ] **Backend**: CRUD routes
  - `GET /api/chats` — list user's chats
  - `POST /api/chats` — create new chat
  - `GET /api/chats/:id/messages` — load history
  - `DELETE /api/chats/:id` — delete chat
- [ ] **Frontend**: Load real chat list from API into Sidebar
- [ ] **Frontend**: Save every message to backend as it's sent/received
- [ ] **Frontend**: On chat switch, fetch + replay message history
- [ ] **Frontend**: Delete chat button in Sidebar (with confirmation)
- [ ] **Frontend**: Auto-generate chat title from first user message

---

## 🔲 Phase 6 — Model Selector

> Let users pick which LLM they talk to.

- [ ] Replace hardcoded "GPT-4" badge in `ChatHeader` with real dropdown
- [ ] **AI Service**: Accept `model` field in `/chat` request body
- [ ] **AI Service**: Route to correct provider based on selection
- [ ] **Frontend**: Model picker UI (dropdown or pill selector)
- [ ] Models to surface: Llama 3.3 70B, Gemma 3, Gemini 2.0 Flash, etc.
- [ ] Persist last-used model in localStorage

---

## 🔲 Phase 7 — True Server-Sent Streaming (SSE)

> Replace simulated typewriter with real token-by-token streaming from the LLM.

- [ ] **AI Service**: Use `httpx` streaming + FastAPI `StreamingResponse`
- [ ] **Backend Gateway**: Pipe SSE stream from Python → Express → frontend
- [ ] **Frontend**: Switch from axios to `fetch` + `ReadableStream` in `api.js`
- [ ] **Frontend**: `useChat.js` — handle streamed chunks, update message incrementally
- [ ] Eliminates the "wait for full response, then type" latency gap

---

## 🔲 Phase 8 — File & Image Uploads

> Let users send files and images to the assistant.

- [ ] **Frontend**: Wire up the existing `Paperclip` button in `ChatInput`
- [ ] **Frontend**: File preview inside chat input (image thumbnail, filename)
- [ ] **Backend**: `multer` middleware for multipart upload handling
- [ ] **AI Service**: Pass image data to vision-capable models (Gemini Flash supports this)
- [ ] Show uploaded images inline in user message bubbles

---

## 🔲 Phase 9 — System Prompt & Persona Configuration

> Allow customisation of the assistant's behaviour.

- [ ] **Frontend**: Settings modal accessible from Sidebar footer ("My Account")
- [ ] System prompt editor (multi-line textarea with character counter)
- [ ] Presets: "Default", "Coding Assistant", "Creative Writer", "Concise"
- [ ] **AI Service**: Prepend system prompt to every request's `messages` array
- [ ] Persist selected persona per-chat in the database

---

## 🔲 Phase 10 — UI Polish & Production Readiness

> Last-mile quality improvements before shipping.

- [ ] **Frontend**: Dark / Light theme toggle
- [ ] **Frontend**: Toast notifications (copy success, error feedback)
- [ ] **Frontend**: Message timestamps on hover
- [ ] **Frontend**: Regenerate response button per message
- [ ] **Frontend**: Keyboard shortcuts (⌘K for new chat, etc.)
- [ ] **Backend**: Rate limiting (`express-rate-limit`) per IP / user
- [ ] **Backend**: Structured logging (Winston / Pino)
- [ ] **AI Service**: `/health` endpoint with live provider status check
- [ ] Fix `ChatHeader` model badge (currently hardcoded "GPT-4")
- [ ] Remove env variable console dump from `api.js` L13

---

## 🔲 Phase 11 — Deployment

> Get the app live and accessible.

- [ ] **Frontend**: Deploy to Vercel — set `VITE_API_URL` env var
- [ ] **Backend**: Deploy to Render / Railway — set `AI_SERVICE_URL`, `MONGO_URI`, `JWT_SECRET`
- [ ] **AI Service**: Deploy to Render (Python runtime) or Dockerize
- [ ] **Database**: MongoDB Atlas (free tier M0 cluster)
- [ ] CORS: Restrict `allow_origins` from `*` to production frontend domain only
- [ ] CI/CD: GitHub Actions — lint + test on PR, auto-deploy on merge to `main`

---

## 📊 Progress Summary

| Phase | Name | Status |
|---|---|---|
| 0 | Foundation | ✅ Done |
| 1 | Core Chat UI | ✅ Done |
| 2 | LLM Provider System | ✅ Done |
| 3 | Rich Message Rendering | ✅ Done |
| 4 | Authentication & User Accounts | 🔲 Not started |
| 5 | Persistent Chat History | 🔲 Not started |
| 6 | Model Selector | 🔲 Not started |
| 7 | True SSE Streaming | 🔲 Not started |
| 8 | File & Image Uploads | 🔲 Not started |
| 9 | System Prompt / Persona Config | 🔲 Not started |
| 10 | UI Polish + Production Readiness | 🔲 Not started |
| 11 | Deployment | 🔲 Not started |

**4 of 12 phases complete (33%)**

---

## 🔑 Known Issues / Tech Debt

| # | Issue | Location | Priority |
|---|---|---|---|
| 1 | Chat history lost on page refresh (in-memory only) | `ChatLayout.jsx` | 🔴 High |
| 2 | No authentication — anyone can use the service | Backend | 🔴 High |
| 3 | Model badge hardcoded as "GPT-4" (inaccurate) | `ChatHeader.jsx` L19 | 🟡 Medium |
| 4 | Env variables dumped to console (`import.meta.env`) | `api.js` L13 | 🟡 Medium |
| 5 | CORS `allow_origins: *` — unsafe for production | `index.js` & `main.py` | 🟡 Medium |
| 6 | No rate limiting on backend gateway | `backend/index.js` | 🟡 Medium |
| 7 | OpenRouter free model list may go stale silently | `main.py FREE_MODELS` | 🟢 Low |
| 8 | `ChatContext.jsx` exists but is completely unused | `src/context/` | 🟢 Low |
| 9 | `Message.jsx` and `ChatBox.jsx` are empty/unused files | `src/components/` | 🟢 Low |
| 10 | Streaming is simulated (full reply arrives, then typed) | `useChat.js` | 🟢 Low |
