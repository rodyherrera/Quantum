FROM node:20.11.0 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --force --silent
RUN apt-get update && apt-get install ca-certificates curl
RUN install -m 0755 -d /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
RUN chmod a+r /etc/apt/keyrings/docker.asc
RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
RUN apt-get update && apt-get install -y nginx
RUN apt-get update && apt-get install -y make
RUN apt-get update && apt-get install -y certbot python3-certbot-nginx

RUN rm /etc/nginx/sites-enabled/default && \
    touch /etc/nginx/sites-enabled/default

COPY . .

CMD service nginx start && npm install && npm run start

EXPOSE 80

