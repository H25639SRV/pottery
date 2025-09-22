# frontend/Dockerfile (development)
FROM node:18-alpine
WORKDIR /app

# Copy package files first to cache install step
COPY package*.json ./

# Install deps
RUN npm install

# Copy rest of source
COPY . .

# Expose dev port
EXPOSE 3000

# Use npm start (create-react-app default)
CMD ["npm", "start"]
