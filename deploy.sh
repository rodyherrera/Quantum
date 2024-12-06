DEBIAN_FRONTEND=noninteractive

bash install_docker.sh

echo '@deploy.sh: Building and starting the Docker containers...'
echo '@deploy.sh: This may take a few minutes.'

docker compose up -d --build 