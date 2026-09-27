# 🚀 Kyro — Autonomous AI Desktop Agent

Kyro is an autonomous personal AI agent built as a native desktop application with live voice interaction, intelligent web & browser automation, structured memory, and multimodal reasoning capabilities.

---

## 🏗️ Architecture Overview

```text
                 YOU
                  │
                  ▼
          🎙️ Voice / Chat
                  │
                  ▼
        ┌──────────────────┐
        │   Electron App   │
        │   React + UI     │
        └────────┬─────────┘
                 │
          HTTP / WebSocket
                 │
                 ▼
        ┌──────────────────┐
        │   FastAPI        │
        │    Backend       │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │   KYRO AGENT     │
        │                  │
        │ Planner          │
        │ Reasoner         │
        │ Executor         │
        └────────┬─────────┘
                 │
        ┌────────┼──────────┐
        ▼        ▼          ▼
      🤖 AI    🌐 Browser   🎙️ Voice
               Playwright
        │        │          │
        └────────┼──────────┘
                 ▼
          🧠 Memory
          💾 Database
```

---

## 📁 Repository Structure

```text
kyro/
├── apps/
│   ├── desktop/                 # Electron + React + Tailwind frontend application
│   │   ├── electron/            # Main process, preload scripts, and IPC handlers
│   │   └── src/                 # React UI application (Pages, Components, Stores, etc.)
│   └── backend/                 # Python 3.12+ FastAPI backend & Agent engine
│       ├── app/
│       │   ├── api/             # REST routes & WebSocket endpoints
│       │   ├── core/            # Config, logging, security
│       │   ├── agent/           # Orchestrator, Planner, Executor, State
│       │   ├── ai/              # Multi-provider AI abstractions (Ollama, Cloud LLMs)
│       │   ├── browser/         # Playwright automation manager
│       │   ├── voice/           # STT, TTS, streaming voice, wake word engine
│       │   ├── memory/          # Short-term, long-term, vector/SQLite storage
│       │   ├── skills/          # Extensible agent skills
│       │   └── permissions/     # Human-in-the-loop security & access policy
│       └── tests/               # Unit, integration, and E2E tests
├── packages/                    # Shared types, config, protocol definitions
├── data/                        # Local SQLite databases, logs, cache, and session state
├── docs/                        # Architecture decisions, API specs, and dev guides
└── scripts/                     # Dev startup, build, and release scripts
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 20+ & npm
- Python 3.12+
- Git

### 2. Setup Backend Virtual Environment
```bash
cd apps/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Setup Desktop App
```bash
cd apps/desktop
npm install
```

### 4. Run Everything in Development
From the root repository directory:
```bash
# Run backend + desktop concurrently
npm run dev
```

Or run separately:
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Desktop
npm run dev:desktop
```
