# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Final image is busybox + static files: a few MB, no Node, no nginx.
FROM busybox:1.37
RUN adduser -D -H static
USER static
WORKDIR /www
COPY --from=build /app/dist ./
EXPOSE 8080
CMD ["httpd", "-f", "-p", "8080", "-h", "/www"]
