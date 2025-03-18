# Base image
FROM node:18 AS build

# Create app directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package*.json yarn.lock* ./

# Install dependencies
RUN yarn install

# Apply the crypto patch for TypeORM
RUN mkdir -p patches
RUN echo "const crypto = require('crypto');" > patches/typeorm-crypto-fix.js
RUN cat patches/typeorm-crypto-fix.js > node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js.fixed
RUN cat node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js >> node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js.fixed
RUN mv node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js.fixed node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js

# Copy the rest of the application
COPY . .

# Build the application
RUN yarn build

# Production image - using regular Node image instead of slim
FROM node:18

# Set environment variables
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package*.json yarn.lock* ./

# Install only production dependencies
RUN yarn install --production

# Apply the same crypto patch for production dependencies
RUN mkdir -p patches
RUN echo "const crypto = require('crypto');" > patches/typeorm-crypto-fix.js
RUN cat patches/typeorm-crypto-fix.js > node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js.fixed
RUN cat node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js >> node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js.fixed
RUN mv node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js.fixed node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js

# Copy the build from the previous stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 8080

# Command to run the application
CMD ["node", "dist/main"]