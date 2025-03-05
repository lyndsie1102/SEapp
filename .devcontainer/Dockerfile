FROM mcr.microsoft.com/devcontainers/python:3.10

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean -y

# Install global npm packages
RUN npm install -g npm@latest

# Set working directory
WORKDIR /workspace

# The main command that will keep the container alive
CMD ["sleep", "infinity"]