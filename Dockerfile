# Use Node.js LTS version as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Copy package files
COPY package.json package-lock.json ./
# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage (if needed for any build steps)
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Add any build steps here if needed in the future

# Production image
FROM base AS runner

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy necessary files
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Create directories for uploads and ensure proper permissions
RUN mkdir -p /app/public/image && \
    chown -R nodejs:nodejs /app/public

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "index.js"]

