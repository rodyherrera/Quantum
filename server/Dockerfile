FROM node:20.11.0 AS base

RUN apt-get update && apt-get install -y nginx

RUN apt-get update && apt-get install -y make

RUN apt-get update && \
    apt-get install -y certbot python3-certbot-nginx

RUN rm /etc/nginx/sites-enabled/default && \
    touch /etc/nginx/sites-enabled/default

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 80

CMD nginx -g 'daemon off;' & npm run start

# sudo docker build -t quantum-backend-server .
# sudo docker run -p 80:80 -v /var/run/docker.sock:/var/run/docker.sock quantum-backend-server