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

# Use node 18 with Alpine Linux as the base image for the build stage
FROM node:18-alpine3.17 as build

ARG VITE_SERVER
ARG VITE_API_SUFFIX

ENV VITE_SERVER=$VITE_SERVER
ENV VITE_API_SUFFIX=$VITE_API_SUFFIX

# Set the working directory inside the container
WORKDIR /app

# Copy package description files to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install --force

# Copy all files from the current directory to the working directory
COPY . .

RUN echo "VITE_SERVER=$VITE_SERVER" > .env && \
    echo "VITE_API_SUFFIX=$VITE_API_SUFFIX" >> .env

RUN npm run build

# Use nginx 1.16 with Alpine Linux as the base image for the final stage
FROM nginx:1.16.0-alpine

# Copy the built files from the previous stage to the nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Remove the default nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom nginx configuration file to the nginx configuration directory
COPY nginx.conf /etc/nginx/conf.d

# Command to start nginx in the foreground when the container starts
CMD ["nginx", "-g", "daemon off;"]

RUN echo '@deploy.sh: STEP 3...'