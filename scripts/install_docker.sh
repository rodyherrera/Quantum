#!/bin/bash

# Operating system detection
os=$(uname -s)

# Feature to install Docker on Linux
function install_docker_linux(){
  # Check if Docker is already installed
  if command -v docker &> /dev/null; then
    echo "@install_docker.sh: Docker already installed. Skipping installation."
    return
  fi
  apt-get update
  apt-get install ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update

  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  echo "@install_docker.sh: Docker installed correctly."
}

# Feature to install Docker on macOS (not tested yet)
function install_docker_macos() {
  # Check if Docker is already installed
  if command -v docker &> /dev/null; then
    echo "@install_docker.sh: Docker already installed. Skipping installation."
    return
  fi

  # Download the latest version of Docker Desktop
  curl -fsSL https://get.docker.com/Macintosh/Docker.dmg -o Docker.dmg

  # Open the Docker installer
  hdiutil attach Docker.dmg

  # Install Docker
  sudo installer -pkg /Volumes/Docker/Docker.pkg -target /

  # Unmount disk image
  hdiutil detach /Volumes/Docker

  echo "@install_docker.sh: Docker installed correctly."
}

# Function to install Docker Compose
function install_docker_compose(){
  # Check if Docker Compose is already installed
  if command -v docker-compose &> /dev/null; then
    echo "@install_docker.sh: Docker Compose already installed. Skipping installation."
    return
  fi

  # Download the latest version of Docker Compose
  curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o docker-compose

  # Make the file executable
  chmod +x docker-compose

  # Move the file to the /usr/local/bin folder
  sudo mv docker-compose /usr/local/bin

  echo "install_docker.sh: Docker Compose installed correctly."
}

# Run the installation function based on the operating system
if [[ "$os" == "Linux" ]]; then
  install_docker_linux
elif [[ "$os" == "Darwin" ]]; then
  install_docker_macos
else
  echo "@install_docker.sh: Windows is not supported yet."
  exit 1
fi

# Install Docker Compose
install_docker_compose

echo "@install_docker.sh: Ready! Docker and Docker Compose are installed and ready to use."