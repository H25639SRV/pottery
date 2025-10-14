# Sử dụng Node 18
FROM node:18

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy file package
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Sinh Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build TypeScript ra dist/
RUN npm run build

# Expose cổng
EXPOSE 5000

# Chạy server
CMD ["node", "dist/server.js"]
