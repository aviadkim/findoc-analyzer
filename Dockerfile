# FinDoc Analyzer SaaS - Production Dockerfile
# For Google Cloud Run deployment

# Use Node.js LTS (Long Term Support) image
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads temp results

# Set Node environment to production
ENV NODE_ENV=production

# The port the app will listen on
ENV PORT=8080
EXPOSE 8080

# Set permissions for app directories
RUN chmod -R 755 /app/uploads /app/temp /app/results

# Running as non-root user for security
RUN chown -R node:node /app
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+process.env.PORT+'/api/health', res => res.statusCode === 200 ? process.exit(0) : process.exit(1))" || exit 1

# Start the application
CMD ["node", "server.js"]
