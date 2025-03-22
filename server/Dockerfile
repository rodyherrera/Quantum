FROM node:20.11.0 AS build

WORKDIR /app

COPY package*.json ./

COPY . ./

RUN chmod +x start.sh

EXPOSE 80

CMD ["/bin/bash", "-c", "npm install; npm start"]

RUN echo '@deploy.sh: STEP 4...'
