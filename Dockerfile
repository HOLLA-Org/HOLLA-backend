# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json yarn.lock ./

# Install all dependencies (including devDependencies)
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY . .
RUN yarn build

# Stage 2: Production dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Stage 3: Final Image
FROM node:20-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=productiont

# Copy only the necessary files from previous stages
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Expose current port
EXPOSE 8080

# Run the app directly with node for better performance and smaller process tree
CMD ["node", "dist/main.js"]
