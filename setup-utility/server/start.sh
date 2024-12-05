#!/bin/bash

# Get number of CPU cores for workers
CORES=$(nproc)
WORKERS=$(( 2 * CORES + 1 ))

pip install -r requirements.txt

# Production settings
uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers $WORKERS \
    --log-level critical \
    --proxy-headers \
    --forwarded-allow-ips '*' \
    --timeout-keep-alive 65 \
    --access-log \
    --no-server-header