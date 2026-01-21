FROM node:22.12.0-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application (MODE=worker runs BullMQ worker instead)
ENTRYPOINT ["./docker-entrypoint.sh"]
