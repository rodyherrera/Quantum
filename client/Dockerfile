FROM node:18-alpine AS build-stage
WORKDIR /app 
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build

FROM nginx:alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# sudo docker build -t quantum-frontend-server . 
# docker run -d -p 3030:80 quantum-frontend-server