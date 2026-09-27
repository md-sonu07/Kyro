# Kyro Architecture Document

## System Architecture

```text
                 USER
                  │
                  ▼
          🎙️ Voice / Chat
                  │
                  ▼
        ┌──────────────────┐
        │   Electron App   │ (React 18 + TypeScript + Tailwind CSS)
        │   Desktop UI     │
        └────────┬─────────┘
                 │
          HTTP / WebSocket (JSON-RPC & Event Streaming)
                 │
                 ▼
        ┌──────────────────┐
        │   FastAPI        │ (Python 3.12+ Async Engine)
        │    Backend       │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │   KYRO AGENT     │
        │                  │
        │ Planner          │ -> Decomposes tasks into subgoals
        │ Reasoner         │ -> Selects tools, asks for permissions
        │ Executor         │ -> Runs skills and handles feedback
        └────────┬─────────┘
                 │
        ┌────────┼──────────┐
        ▼        ▼          ▼
      🤖 AI    🌐 Browser   🎙️ Voice
    Providers  Playwright   Engine
        │        │          │
        └────────┼──────────┘
                 ▼
          🧠 Memory & Database
          (SQLite + Local Embeddings)
```

## Security & Permission Matrix

| Action Type | Examples | Default Policy |
| :--- | :--- | :--- |
| **Safe / Read-Only** | Web search, Read public URL, Health check | Auto-Approve |
| **System Inspection** | Read local file, List directory | User Permission |
| **Mutating / High-Impact** | Delete file, Send email, Execute shell command | Explicit Confirmation |
