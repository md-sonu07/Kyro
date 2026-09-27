from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Kyro Backend"
    version: str = "0.1.0"
    env: str = "development"
    debug: bool = True
    host: str = "127.0.0.1"
    port: int = 8000
    
    # AI Providers
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"
    
    # Browser Automation
    playwright_headless: bool = False
    
    # Voice
    voice_engine_enabled: bool = False
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
