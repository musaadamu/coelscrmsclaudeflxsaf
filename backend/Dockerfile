FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY ./shared ../shared

RUN npm install

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build
RUN npm run build

# Expose port
EXPOSE 4000

# Start server
CMD ["npm", "start"]
