# -------------------------
# Stage 1: Build React app
# -------------------------
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------------------------
# Stage 2: Serve bằng NGINX
# -------------------------
FROM nginx:1.27-alpine

# Copy file build đúng thư mục (React -> build, không phải dist)
COPY --from=build /app/build /usr/share/nginx/html

# Copy file cấu hình nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
