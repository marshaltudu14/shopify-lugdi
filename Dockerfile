# Docker for Google Cloud Run

# Stage 1: Install dependencies and build the application
FROM node:22-alpine AS builder
# Set working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
# Use --legacy-peer-deps as indicated in previous deployment scripts
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Set NEXT_TELEMETRY_DISABLED to 1 to disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN npm run build

# Prune development dependencies
RUN npm prune --production

# Stage 2: Production image using standalone output
FROM node:22-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
# Google Cloud Run expects the app to listen on port 8080
ENV PORT 8080

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Change ownership of the app directory
USER nextjs

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["node", "server.js"]
