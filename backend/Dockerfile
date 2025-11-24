# ===============================
# 🧱 STAGE 1: Builder
# ===============================
# Dùng Node 20 cho cả 2 stage để tránh lỗi thư viện C++ (canvas/sharp)
FROM node:20-bookworm AS builder

WORKDIR /app

# 1️⃣ Cài đặt thư viện hệ thống
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential pkg-config libcairo2-dev libpango1.0-dev \
    libjpeg-dev libgif-dev librsvg2-dev libpng-dev openssl \
    && rm -rf /var/lib/apt/lists/*

# 2️⃣ Copy package files
COPY package*.json ./
RUN npm ci

# 3️⃣ Copy source
COPY prisma ./prisma
COPY tsconfig.json .
COPY src ./src

# Tạo thư mục template
RUN mkdir -p /app/public/templates
COPY src/assets/render.png /app/public/templates/render.png

# 4️⃣ Build
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

# 🔥 TỐI ƯU: Xóa thư viện dev và Nén node_modules để copy nhanh hơn
RUN npm prune --production
RUN tar -cf node_modules.tar node_modules

# ===============================
# 🏃 STAGE 2: Runtime
# ===============================
FROM node:20-slim AS runner

WORKDIR /app

# Cài đặt thư viện Runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
    libgif7 librsvg2-2 \
    fontconfig fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Tạo thư mục output
RUN mkdir -p /app/public/uploads /app/public/render_output

# Copy file package.json
COPY --from=builder /app/package*.json ./

# 🔥 COPY FILE NÉN
COPY --from=builder /app/node_modules.tar ./
# Giải nén và xóa file tar
RUN tar -xf node_modules.tar && rm node_modules.tar

# Copy các phần còn lại
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 5000

# Lệnh CMD đơn giản (chỉ chạy server), migration sẽ được xử lý bởi docker-compose command
CMD ["node", "dist/server.js"]