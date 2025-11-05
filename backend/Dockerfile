# ===============================
# 🧱 STAGE 1: Builder
# ===============================
FROM node:20-bookworm AS builder

WORKDIR /app

# 1️⃣ Cài đặt thư viện hệ thống cần thiết (cho canvas, sharp, v.v.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpng-dev \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# 2️⃣ Copy file package.json và package-lock.json để cài đặt dependency
COPY package*.json ./

# 3️⃣ Cài tất cả dependencies (bao gồm dev để build TypeScript)
RUN npm ci

# 4️⃣ Copy mã nguồn và Prisma schema
COPY prisma ./prisma
COPY tsconfig.json .
COPY src ./src
COPY src/assets ./src/assets

# ⚙️ Thêm binaryTargets cho môi trường openssl-1.1.x (nếu chưa có)
# Bạn nên có đoạn sau trong prisma/schema.prisma:
# generator client {
#   provider      = "prisma-client-js"
#   binaryTargets = ["native", "debian-openssl-1.1.x"]
# }

# 5️⃣ Generate Prisma client (với binary phù hợp Docker)
RUN npx prisma generate --schema=./prisma/schema.prisma

# 6️⃣ Build TypeScript
RUN npm run build

# ✅ Copy thư mục ảnh mẫu vào dist để runtime đọc được
RUN mkdir -p /app/dist/assets && cp -r ./src/assets/* /app/dist/assets/

# 7️⃣ Tạo thư mục public cần thiết
RUN mkdir -p /app/public/uploads /app/public/render_output

# ===============================
# 🏃 STAGE 2: Runtime
# ===============================
FROM node:18-slim AS runner

WORKDIR /app

# Cài openssl trong runtime (để Prisma không lỗi)
RUN apt-get update && apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy file cần thiết từ builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/assets ./src/assets

# Expose cổng backend
EXPOSE 5000

# 🚀 Khởi động Prisma & server
CMD npx prisma migrate deploy && node dist/server.js
