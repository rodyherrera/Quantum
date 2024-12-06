#!/bin/bash

# Get number of CPU cores for workers
CORES=$(nproc)
WORKERS=$(( 2 * CORES + 1 ))

# Define host and port variables
HOST="0.0.0.0"
PORT="8000"

# Check if requirements.txt has already been installed
if ! pip check > /dev/null 2>&1; then
    echo "@setup-utility: installing requirements..."
    pip install -r requirements.txt
else
    echo "@setup-utility: requirements already installed."
fi

# Production settings
uvicorn main:app \
    --host $HOST \
    --port $PORT \
    --workers $WORKERS \
    --log-level critical \
    --proxy-headers \
    --forwarded-allow-ips '*' \
    --timeout-keep-alive 65 \
    --access-log \
    --no-server-header &

echo "@setup-utility: server deployed successfully and running on http://$HOST:$PORT"

# Wait for uvicorn to finish
wait