#!/bin/bash

ENV_FILE="./setup-utility/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: The file $ENV_FILE does not exist. Please check the path."
  exit 1
fi

SERVER_PORT=$(grep '^SERVER_PORT=' "$ENV_FILE" | cut -d '=' -f2)
if [ -z "$SERVER_PORT" ]; then
  echo "⚠️ The SERVER_PORT variable is not defined in $ENV_FILE. Nothing to do."
else
  echo "🔪 Killing processes on port $SERVER_PORT..."
  fuser -k ${SERVER_PORT}/tcp > /dev/null 2>&1 && echo "✅ Port $SERVER_PORT freed." || echo "⚠️ No processes found on port $SERVER_PORT."
fi

CLIENT_PORT=$(grep '^CLIENT_PORT=' "$ENV_FILE" | cut -d '=' -f2)
if [ -z "$CLIENT_PORT" ]; then
  echo "⚠️ The CLIENT_PORT variable is not defined in $ENV_FILE. Nothing to do."
else
  echo "🔪 Killing processes on port $CLIENT_PORT..."
  fuser -k ${CLIENT_PORT}/tcp > /dev/null 2>&1 && echo "✅ Port $CLIENT_PORT freed." || echo "⚠️ No processes found on port $CLIENT_PORT."
fi

echo "🎯 All ports have been processed."