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
docker-compose -p quantum-mongodb down --volumes --remove-orphans
docker-compose -p quantum-server down --volumes --remove-orphans
docker-compose -p quantum-client down --volumes --remove-orphans


echo "@deploy.sh: STEP 2..."
docker-compose build --no-cache
docker-compose up