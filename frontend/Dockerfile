# -------------------------
# Stage 1: Build
# -------------------------
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------------------------
# Stage 2: Production
# -------------------------
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 5000

# Start the backend server
CMD ["node", "dist/server.js"]
