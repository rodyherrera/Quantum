FROM node:lts-slim

WORKDIR /app

COPY . .

RUN npm install
RUN npm install serve

ARG VITE_SERVER
ENV VITE_SERVER=${VITE_SERVER}

RUN npm run build

EXPOSE 3080

CMD ["npx", "serve", "-s", "dist", "-l", "3080"]