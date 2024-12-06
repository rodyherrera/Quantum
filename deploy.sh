DEBIAN_FRONTEND=noninteractive

apt update
apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt update
apt install -y docker-ce docker-ce-cli containerd.io
usermod -aG docker $USER

echo "@deploy.sh: Docker installed correctly."

echo '@deploy.sh: Building and starting the Docker containers...'
echo '@deploy.sh: This may take a few minutes.'

docker compose up -d --build 