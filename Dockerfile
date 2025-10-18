# === Build stage ===
FROM node:18-bookworm AS build
WORKDIR /app


# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build the app
COPY . .
RUN npm run build

# === Production stage ===
FROM nginx:1.27-bookworm
WORKDIR /usr/share/nginx/html

# Copy built files from the build stage
COPY --from=build /app/build .

# Copy custom Nginx config if available (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
