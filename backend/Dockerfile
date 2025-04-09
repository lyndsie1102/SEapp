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

# Install dependencies
RUN pip install --upgrade pip && \
    pip install flask python-dotenv flask-cors flask-sqlalchemy flask-jwt-extended

# Set environment variables
ENV FLASK_APP=main.py
ENV FLASK_ENV=development

# Rename and load dev.env as .env inside the container
RUN mv dev.env .env

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]