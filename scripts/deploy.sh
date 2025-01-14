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

stop_and_remove_containers(){
    local container_name=$1
    local containers=$(docker ps -a -q --filter="name=$container_name")
    if [ ! -z "$containers" ]; then
        docker stop $containers
        docker rm $containers
    else
        echo "No containers found with name $container_name"
    fi
}

echo "@deploy.sh: STEP 1..."
stop_and_remove_containers "quantum-mongodb"
stop_and_remove_containers "quantum-server"
stop_and_remove_containers "quantum-client"

echo "Updating package lists..."
apt-get update

apt install -y curl

echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "@deploy.sh: STEP 2..."
docker-compose build --no-cache
docker-compose up