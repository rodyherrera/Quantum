#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

print_message(){
    local message=$1
    echo -e "\n#########################"
    echo -e "# $message"
    echo -e "#########################\n"
    echo "Waiting 1.5 seconds..."
    sleep 1.5
}

echo "@deploy.sh: STEP 1..."
print_message "Installing Docker & Docker Compose"

apt-get update
apt-get install -y ca-certificates curl gnupg

install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "@deploy.sh: STEP 2..."
apt-get update

echo "@deploy.sh: STEP 3..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "@deploy.sh: STEP 4..."
print_message "Docker & Docker Compose installed successfully"
print_message "Building Quantum docker image..."

systemctl start docker

echo "@deploy.sh: STEP 5..."
docker-compose down --volumes --remove-orphans

echo "@deploy.sh: STEP 6..."
docker compose up --build