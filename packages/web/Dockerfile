# APP=landing builds the public landing page instead of the dashboard a self-hosted Quantum serves.
FROM node:24-alpine AS build

ARG APP=dashboard
ARG VITE_SERVER
ARG VITE_API_SUFFIX=
ENV VITE_SERVER=$VITE_SERVER
ENV VITE_API_SUFFIX=$VITE_API_SUFFIX

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/web/package.json packages/web/package.json
RUN pnpm install --frozen-lockfile

COPY packages/contracts packages/contracts
COPY packages/web packages/web

WORKDIR /app/packages/web
RUN if [ "$APP" = landing ]; then pnpm build:landing && rm -rf dist && mv dist-landing dist; else pnpm build; fi

FROM nginx:1.27-alpine

COPY --from=build /app/packages/web/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY packages/web/nginx.conf /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
