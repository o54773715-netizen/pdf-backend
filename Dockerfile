FROM node:18

# Install Ghostscript
RUN apt-get update && apt-get install -y ghostscript

# Create app folder
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install

COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
