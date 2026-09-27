#!/bin/bash
set -e

# Move to backend directory
cd "$(dirname "$0")/../../apps/backend"

# Activate virtualenv if present
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

echo "🚀 Starting Kyro FastAPI Backend on http://127.0.0.1:8000 ..."
python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
