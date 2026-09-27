from fastapi import APIRouter
import platform
import os
import time

router = APIRouter(prefix="/system", tags=["system"])
START_TIME = time.time()

@router.get("/health")
async def health():
    return {
        "status": "ok",
        "app": "Kyro Backend",
        "version": "0.1.0",
        "timestamp": time.time(),
        "uptime": round(time.time() - START_TIME, 2),
    }

@router.get("/info")
async def system_info():
    return {
        "platform": platform.system(),
        "release": platform.release(),
        "architecture": platform.machine(),
        "python_version": platform.python_version(),
        "cpu_count": os.cpu_count() or 1,
    }

