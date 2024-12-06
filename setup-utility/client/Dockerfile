FROM node:lts-slim

WORKDIR /app

COPY . .

RUN npm install && npm install serve

RUN npm run build

EXPOSE 3300

CMD ["npx", "serve", "-s", "dist", "-l", "3300"]
