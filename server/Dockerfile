# * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
# *
# * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
# * Licensed under the MIT license. See LICENSE file in the project root
# * for full license information.
# *
# * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
# *
# * For related information - https://github.com/rodyherrera/Quantum/
# *
# * All your applications, just in one place. 
# *
# * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

# Define the base image
FROM node:20.11.0 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package description files and project dependencies
COPY package*.json ./

# Install project dependencies
RUN npm install --force --silent

# Update package list and install necessary tools and dependencies
RUN apt-get update && apt-get install ca-certificates curl
RUN install -m 0755 -d /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
RUN chmod a+r /etc/apt/keyrings/docker.asc
RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker and related tools
RUN apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Install Nginx
RUN apt-get update && apt-get install -y nginx

# Install make
RUN apt-get update && apt-get install -y make

# Install certbot and the Nginx plugin
RUN apt-get update && apt-get install -y certbot python3-certbot-nginx

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

# Default command to run when starting the container
CMD service nginx start && npm install && npm run start

# Expose port 80 to allow access to the service
EXPOSE 80