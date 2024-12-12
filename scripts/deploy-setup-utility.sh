#!/bin/bash

echo "@deploy-setup-utility.sh: obtaining public IP address, connecting with https://api.apify.org/..."

PUBLIC_IP=$(curl -s https://api.ipify.org)
ENV_FILE="./setup-utility/.env"

echo "@deploy-setup-utility.sh: $PUBLIC_IP ok."
echo "@deploy-setup-utility.sh: overwriting the value of the SERVER_IP environment variable located in @setup-utility/.env"

if [ -f "$ENV_FILE" ]; then
  if grep -q "^SERVER_IP=" "$ENV_FILE"; then
    sed -i "s/^SERVER_IP=.*/SERVER_IP=${PUBLIC_IP}/" "$ENV_FILE"
  else
    echo "SERVER_IP=${PUBLIC_IP}" >> "$ENV_FILE"
  fi
  echo "@deploy-setup-utility.sh: ok."
else
  echo "@deploy-setup-utility.sh: The file $ENV_FILE was not found, you probably deleted it manually. For more information, read the documentation."
  exit 1
fi

SERVER_PORT=$(grep '^SERVER_PORT=' "$ENV_FILE" | cut -d '=' -f2)
if [ -z "$SERVER_PORT" ]; then
  echo "The environment variable "SERVER_PORT" is not defined in $ENV_FILE. Nothing to do."
  exit 1
fi

CLIENT_PORT=$(grep '^CLIENT_PORT=' "$ENV_FILE" | cut -d '=' -f2)
if [ -z "$CLIENT_PORT" ]; then
  echo "The environment variable "CLIENT_PORT" is not defined in $ENV_FILE. Nothing to do."
  exit 1
fi

echo "@deploy-setup-utility.sh: killing processes using ports $SERVER_PORT and $CLIENT_PORT..."

fuser -k ${SERVER_PORT}/tcp > /dev/null 2>&1
fuser -k ${CLIENT_PORT}/tcp > /dev/null 2>&1

echo "@deploy-setup-utility.sh: deploying via docker compose..."
sleep 2

docker compose -f ./setup-utility/docker-compose.yml up -d --build

echo "@deploy-setup-utility.sh: checking if the services were deployed correctly..."

sleep 5

check_port() {
  PORT=$1
  SERVICE_NAME=$2
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$PUBLIC_IP:$PORT/env)

  if [[ "$RESPONSE" -ge 200 && "$RESPONSE" -lt 300 ]]; then
    echo "@deploy-setup-utility.sh: 🟢 "$SERVICE_NAME" was deployed successfully (HTTP $RESPONSE))."
  else
    echo "@deploy-setup-utility.sh: 🔴 "$SERVICE_NAME" did not respond to the request (HTTP $RESPONSE)."
    exit 1
  fi
}

check_port $SERVER_PORT "setup-utility-server"
check_port $CLIENT_PORT "setup-utility-client"

echo ""
echo "@deploy-setup-utility.sh: To configure and deploy Quantum, go to: http://$PUBLIC_IP:$CLIENT_PORT/"
echo "@deploy-setup-utility.sh: Happy hacking."