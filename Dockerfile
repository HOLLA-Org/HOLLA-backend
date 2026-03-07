# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for better layer caching
COPY package.json yarn.lock ./

# Install all dependencies (including devDependencies)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build project
RUN yarn build


# Stage 2: Install production dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production=true \
    && yarn cache clean


# Stage 3: Final runtime image
FROM node:20-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy build output
COPY --from=builder /app/dist ./dist

# Copy package.json (optional but recommended)
COPY package.json ./

# Expose port
EXPOSE 8080

# Run application
CMD ["node", "dist/main.js"]