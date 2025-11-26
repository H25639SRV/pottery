FROM node:20-alpine AS build

WORKDIR /app

# =========================================================================
# STAGE 1: BUILD (Chứa công cụ biên dịch và Node Modules)
#
# Lớp này chỉ bị rebuild nếu:
# 1. Base image thay đổi.
# 2. package*.json thay đổi.
# =========================================================================
# 1. Cài đặt các gói BUILD/DEV cần thiết (QUAN TRỌNG: Phải chạy trước npm install).
RUN apk update && \
    apk add --no-cache python3 make g++ gcc cairo-dev jpeg-dev pango-dev giflib-dev && \
    rm -rf /var/cache/apk/*

# 2. Copy dependencies và cài đặt (lớp này tái sử dụng cache nếu package*.json không đổi)
COPY package*.json ./
RUN npm install

# 3. Copy Prisma schema và tạo Client (đảm bảo file client được tạo)
COPY prisma ./prisma/
RUN npx prisma generate --schema=./prisma/schema.prisma

# 4. Copy mã nguồn và Build TypeScript (chỉ chạy lại khi mã nguồn thay đổi)
COPY . .
RUN npm run build 

# ===============================
# 🏃 STAGE 2: Runtime (Image cuối cùng)
# ===============================
FROM node:20-alpine

WORKDIR /app

# ⚠️ BƯỚC QUAN TRỌNG: Cài đặt các thư viện chia sẻ (shared libraries) 
# như libcairo.so.2 cần thiết cho 'canvas' hoạt động trong Runtime Stage.
# Các thư viện này không có trong image node:20-alpine cơ bản.
RUN apk update && \
    apk add --no-cache cairo jpeg pango giflib && \
    rm -rf /var/cache/apk/*

# Copy built code
COPY --from=build /app/dist ./dist

# Copy node_modules (đã được biên dịch ở Stage 1)
COPY --from=build /app/node_modules ./node_modules

# Copy thư mục prisma (cần cho migration)
COPY --from=build /app/prisma ./prisma

# Expose port
EXPOSE 5000

# 🚀 LỆNH KHỞI ĐỘNG CUỐI CÙNG
CMD [ "/bin/sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/server.js" ]