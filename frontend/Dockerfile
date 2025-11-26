# ===============================
# 🧱 STAGE 1: Build Frontend (React/Vue/etc.)
# ===============================
FROM node:20-alpine AS frontend_builder

WORKDIR /app

# 1. Copy package files and install dependencies
# Giả định package.json của frontend nằm trong thư mục frontend/
COPY package*.json ./
RUN npm install

# 2. Copy source code
COPY . .

# 3. Build the static assets
# Thay thế "npm run build" bằng lệnh build phù hợp nếu cần (ví dụ: yarn build)

RUN echo "Debug API URL: $REACT_APP_API_URL"
RUN npm run build 

# ===============================
# 🏃 STAGE 2: Serve Static Files using Nginx
# ===============================
FROM nginx:alpine AS runner

# 1. Copy Nginx config (dùng file bên dưới)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 2. Copy built assets from the builder stage to Nginx's public directory
# Giả định thư mục output sau build là 'build'
COPY --from=frontend_builder /app/build /usr/share/nginx/html

# Expose port 80 - Nginx container's default listening port
EXPOSE 80 
# CMD mặc định của Nginx là chạy foreground