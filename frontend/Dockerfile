# Start with a base Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /workspace

# Copy the package.json and package-lock.json files into the container
COPY package*.json .

# Install the Node.js dependencies
RUN npm install

# Copy the entire frontend code into the container
COPY . .

# Define the command to start the frontend development server
# Using host 0.0.0.0 allows connections from outside the container
CMD ["npm", "run", "dev"]
