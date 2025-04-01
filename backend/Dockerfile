FROM mcr.microsoft.com/devcontainers/python:3.10

# Set working directory
WORKDIR /workspace

# Copy the backend requirements file into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install -r requirements.txt

# Copy the entire backend code into the container
COPY . .

# Define the command to run the backend application
CMD ["python", "main.py"]
