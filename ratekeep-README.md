# ⚡ Ratekeep — Rate-Limited API with Real-Time Usage Dashboard

Ratekeep is a backend-focused project built around a problem every real API deals with: controlling and observing usage per client. It issues API keys, enforces a rolling-window rate limit per key, and gives each key owner a live dashboard of their traffic — including a real-time event stream and a memory-safe CSV export of their full request history.

Most portfolio projects stop at CRUD. This one is built around core Node.js primitives — `EventEmitter` for decoupled logging and `Streams` for constant-memory data export — the same patterns production systems like Stripe and Twilio use under the hood.

## 🚀 Live Demo
- **Dashboard:** [your-vercel-link.vercel.app]
- **API:** [your-render-link.onrender.com]

![Ratekeep Dashboard](./screenshot.png)

## ✨ Key Features
- **API key management** — generate and track keys, each with its own usage counter
- **Per-key rate limiting** — a rolling one-hour window enforced against request logs, not a fixed reset window
- **Live request stream** — Server-Sent Events push each incoming request to the dashboard the instant it happens, no polling
- **Streaming CSV export** — request history is piped from a MongoDB cursor through a Transform stream directly to the response, so memory use stays flat regardless of how many requests are logged
- **Decoupled logging** — request handling and request logging are separated through a custom `EventEmitter`, so the route that serves a request never has to know how or where that request gets recorded

## 🛠️ Built With
| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Real-time | Server-Sent Events (SSE) |
| Frontend | React (Vite), Recharts |
| Deployment | Render (API), Vercel (client) |

## 📡 API Reference
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/keys` | Generate a new API key |
| `GET` | `/api/keys` | List all keys |
| `GET` | `/api/keys/:key/usage` | Recent request history for a key |
| `GET` | `/api/quote` | Protected resource — requires `x-api-key` header, rate-limited |
| `GET` | `/api/usage/:key/csv` | Stream full request history as a CSV download |
| `GET` | `/api/usage/live` | SSE stream of requests as they happen |

## ⚙️ Getting Started

Clone and enter the project:
```bash
git clone https://github.com/yourusername/ratekeep-api.git
cd ratekeep-api
```

Install dependencies:
```bash
npm install
```

Set up environment variables — create a `.env` file:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Run the server:
```bash
npm start
```

For the frontend, in a separate terminal:
```bash
cd client
npm install
npm run dev
```

## 🧠 Engineering Notes

**Why EventEmitter instead of calling the logger directly?**
The route that serves `/api/quote` shouldn't need to know how logging works — it just emits `request:logged`. A separate listener handles writing to MongoDB. This keeps the request path fast and lets logging behavior change (add more listeners, change storage) without touching route code.

**Why a Transform stream for CSV export instead of building an array and sending JSON?**
Loading every log into memory before sending it doesn't scale — at some point the dataset is bigger than what should sit in RAM at once. Instead, a MongoDB cursor reads documents one at a time, a Transform stream converts each into a CSV line, and the result is piped straight to the HTTP response. Memory usage stays constant whether there are 100 logs or 10 million.

**Why SSE instead of the client polling every few seconds?**
Polling wastes requests and adds latency to "real-time." SSE keeps a single open connection and pushes data only when something actually happens, using the same EventEmitter that powers the logging — one event, two consumers.

## 📌 Roadmap
- Configurable rate limits per key (not a fixed global limit)
- Auth so users manage only their own keys
- Usage alerts (email/webhook when a key nears its limit)

## 📄 License
MIT

---
*Built by [Your Name] — [portfolio link] · [LinkedIn] · [GitHub]*
