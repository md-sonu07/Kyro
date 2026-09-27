from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.api.routes import system, chat, agent, browser, voice, commands
from app.api import websocket

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Kyro Autonomous AI Desktop Agent Backend",
    debug=settings.debug,
)

# Enable CORS for Electron / React development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(system.router, prefix="/api")
app.include_router(commands.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(agent.router, prefix="/api")
app.include_router(browser.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
app.include_router(websocket.router)

@app.get("/")
async def root():
    return {
        "app": "Kyro",
        "status": "online",
        "version": settings.version,
        "docs_url": "/docs",
        "health_check": "/api/system/health"
    }

@app.get("/health")
async def root_health():
    return {
        "status": "ok",
        "app": "Kyro"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting {settings.app_name} on {settings.host}:{settings.port}")
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
