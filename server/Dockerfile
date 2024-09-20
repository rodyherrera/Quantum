# Define the base image
FROM node:20.11.0 AS build

# Environment variable to know if the execution is inside or outside of Docker
ENV RUNNING_IN_DOCKER=true 

# Set the working directory inside the container
WORKDIR /app

# Copy package description files and project dependencies
COPY package*.json ./

# Install project dependencies
RUN npm install --force --silent

# Update package list and install necessary tools and dependencies
RUN apt-get update && \
    apt-get install -y ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

# Install Docker and related tools
RUN install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Install Nginx
RUN apt-get update && \
    apt-get install -y nginx

# Install make
RUN apt-get update && \
    apt-get install -y make

# Install certbot and the Nginx plugin
RUN apt-get update && \
    apt-get install -y certbot python3-certbot-nginx

# Remove default Nginx configuration and create an empty file to replace it
RUN rm /etc/nginx/sites-enabled/default && \
    touch /etc/nginx/sites-enabled/default

# Copy project files to the working directory
COPY . .

# Copy the entrypoint script into the container and set executable permissions
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set the entrypoint for the container
ENTRYPOINT ["/entrypoint.sh"] 

ARG NODE_ENV
ARG DOCKER_APK_STARTER_PACKAGES
ARG DOMAIN
ARG SECRET_KEY
ARG REGISTRATION_DISABLED
ARG CLIENT_HOST
ARG SERVER_PORT
ARG SERVER_HOSTNAME
ARG SESSION_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG JWT_EXPIRATION_DAYS
ARG CORS_ORIGIN
ARG PRODUCTION_DATABASE
ARG DEVELOPMENT_DATABASE
ARG LOG_PATH_MAX_SIZE
ARG MONGO_URI
ARG MONGO_AUTH_SOURCE
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_AUTH_USER
ARG SMTP_AUTH_PASSWORD
ARG WEBMASTER_MAIL

ENV NODE_ENV=$NODE_ENV
ENV DOCKER_APK_STARTER_PACKAGES=$DOCKER_APK_STARTER_PACKAGES
ENV DOMAIN=$DOMAIN
ENV SECRET_KEY=$SECRET_KEY
ENV REGISTRATION_DISABLED=$REGISTRATION_DISABLED
ENV CLIENT_HOST=$CLIENT_HOST
ENV SERVER_PORT=$SERVER_PORT
ENV SERVER_HOSTNAME=$SERVER_HOSTNAME
ENV SESSION_SECRET=$SESSION_SECRET
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
ENV GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET
ENV JWT_EXPIRATION_DAYS=$JWT_EXPIRATION_DAYS
ENV CORS_ORIGIN=$CORS_ORIGIN
ENV PRODUCTION_DATABASE=$PRODUCTION_DATABASE
ENV DEVELOPMENT_DATABASE=$DEVELOPMENT_DATABASE
ENV LOG_PATH_MAX_SIZE=$LOG_PATH_MAX_SIZE
ENV MONGO_URI=$MONGO_URI
ENV MONGO_AUTH_SOURCE=$MONGO_AUTH_SOURCE
ENV SMTP_HOST=$SMTP_HOST
ENV SMTP_PORT=$SMTP_PORT
ENV SMTP_AUTH_USER=$SMTP_AUTH_USER
ENV SMTP_AUTH_PASSWORD=$SMTP_AUTH_PASSWORD
ENV WEBMASTER_MAIL=$WEBMASTER_MAIL

# Default command to run when starting the container
CMD service nginx start && npm install && npm run start

# Expose port 80 to allow access to the service
EXPOSE 80
