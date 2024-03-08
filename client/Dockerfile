FROM node:18-alpine3.17 as build

WORKDIR /app
COPY package*.json ./

RUN npm install --force --silent
COPY . .
RUN npm run build

FROM nginx:1.16.0-alpine

COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

CMD ["nginx", "-g", "daemon off;"]