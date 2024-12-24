FROM node:20.11.0 AS build

WORKDIR /app

COPY . ./
RUN npm install --force

RUN apt-get update && \
    apt-get install -y nginx ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

RUN rm /etc/nginx/sites-enabled/default && \
    touch /etc/nginx/sites-enabled/default

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 80
