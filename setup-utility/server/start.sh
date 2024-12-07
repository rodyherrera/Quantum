#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define host and port variables
HOST="0.0.0.0"
PORT="9080"

# Check if requirements.txt has already been installed
REQUIREMENTS_FILE="requirements.txt"
HASH_FILE=".requirements_hash"

if [ -f "$HASH_FILE" ]; then
    PREV_HASH=$(cat "$HASH_FILE")
else
    PREV_HASH=""
fi

CURRENT_HASH=$(sha256sum "$REQUIREMENTS_FILE" | awk '{print $1}')

if [ "$PREV_HASH" != "$CURRENT_HASH" ]; then
    echo "@setup-utility: installing requirements..."
    pip install -r "$REQUIREMENTS_FILE"
    echo "$CURRENT_HASH" > "$HASH_FILE"
else
    echo "@setup-utility: requirements already installed."
fi

# Get the path of uvicorn
UVICORN_PATH=$(which uvicorn)

# Check if uvicorn is found
if [ -z "$UVICORN_PATH" ]; then
    echo "uvicorn not found. Please ensure it is installed and in your PATH."
    exit 1
fi

if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
else
    SUDO=""
fi

$SUDO $UVICORN_PATH main:app \
    --host "$HOST" \
    --port "$PORT" \
    --log-level critical \
    --proxy-headers \
    --forwarded-allow-ips '*' \
    --timeout-keep-alive 65 \
    --access-log \
    --no-server-header &

echo "@setup-utility: server deployed successfully and running on http://$HOST:$PORT"

# Wait for uvicorn to finish
wait