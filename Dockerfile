# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json
COPY package.json ./

# Copy client files and build
COPY client ./client
WORKDIR /app/client
RUN npm install
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy server files
COPY server ./server
WORKDIR /app/server
RUN npm install --production

# Copy built client files
COPY --from=builder /app/client/dist ./public

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
