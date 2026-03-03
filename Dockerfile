# Base image (Upgraded to 20 to support file-type@21 and other modern libs)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the project
COPY . .

# Build app
RUN yarn build

# Expose port
EXPOSE 8080

# Start the app
CMD ["yarn", "start:prod"]
