#!/bin/bash

# Operating system detection
os=$(uname -s)

# Feature to install Docker on Linux
function install_docker_linux() {
  # Update package list
  sudo apt update

  # Install the necessary packages
  sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

  # Add Docker GPG key
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

  # Add the Docker repository
  sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

  # Update package list and install Docker
  sudo apt update
  sudo apt install -y docker-ce docker-ce-cli containerd.io

  # Add current user to docker group
  sudo usermod -aG docker $USER

  # Restart the Docker service
  sudo systemctl restart docker

  echo "[Quantum (install_docker.sh)]: Docker installed correctly."
}

# Feature to install Docker on macOS (not tested yet)
function install_docker_macos() {
  # Download the latest version of Docker Desktop
  curl -fsSL https://get.docker.com/Macintosh/Docker.dmg -o Docker.dmg

  # Open the Docker installer
  hdiutil attach Docker.dmg

  # Install Docker
  sudo installer -pkg /Volumes/Docker/Docker.pkg -target /

  # Unmount disk image
  hdiutil detach /Volumes/Docker

  echo "[Quantum (install_docker.sh)]: Docker installed correctly."
}

# Function to install Docker Compose
function install_docker_compose() {
  # Download the latest version of Docker Compose
  curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o docker-compose

  # Make the file executable
  chmod +x docker-compose

  # Move the file to the /usr/local/bin folder
  sudo mv docker-compose /usr/local/bin

  echo "[Quantum (install_docker.sh)]: docker-compose installed correctly."
}

# Run the installation function based on the operating system
if [[ "$os" == "Linux" ]]; then
  install_docker_linux
elif [[ "$os" == "Darwin" ]]; then
  install_docker_macos
else
  echo "[Quantum (install_docker.sh)]: Are you seriously trying to run this on Windows?."
  exit 1
fi

# Install Docker Compose
install_docker_compose

echo "[Quantum (install_docker.sh)]: **Ready! Docker and Docker Compose are installed and ready to use.**"
