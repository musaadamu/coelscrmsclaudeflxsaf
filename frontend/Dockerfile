FROM node:20-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY ./shared ../shared

RUN npm install

# Copy source code
COPY src ./src
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./

# Build for production
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built app from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 5173

# Start preview server
CMD ["npm", "run", "preview"]
