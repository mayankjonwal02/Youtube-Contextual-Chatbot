# Use the official Node.js image as the base
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application to the container
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000 for the Next.js server
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
