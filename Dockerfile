FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy all source files
COPY . .

# Expose the port used by the development server
EXPOSE 5173

# Run SvelteKit in development mode with the --host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host"]