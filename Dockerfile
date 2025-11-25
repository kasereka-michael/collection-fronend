# === Build stage ===
FROM node:18-bookworm AS build
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install dependencies cleanly
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# === Production stage ===
FROM nginx:1.27-bookworm

# Copy build output
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
