# Sử dụng Node 18
FROM node:18

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json trước để cache npm install
COPY package*.json ./

# Cài đặt dependency
RUN npm config set registry https://registry.npmjs.org/
RUN npm install

# Copy toàn bộ mã nguồn (bao gồm prisma/)
COPY . .

# Sinh Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Mở cổng 5000
EXPOSE 5000

# Lệnh chạy khi container khởi động
CMD ["node", "dist/src/index.js"]
