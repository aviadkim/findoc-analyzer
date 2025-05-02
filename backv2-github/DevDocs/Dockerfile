# Use the official Node.js image as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Install Python and required dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ghostscript \
    libgl1-mesa-glx \
    libglib2.0-0 \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-heb \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install additional dependencies needed for the build
RUN npm install -g autoprefixer postcss tailwindcss
RUN npm install react-markdown

# Copy the frontend package.json
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy the rest of the application
WORKDIR /app
COPY . .

# Create Python virtual environment and install dependencies
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
WORKDIR /app
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p /tmp/uploads /tmp/temp /tmp/results

# Set environment variables
ENV NODE_ENV=production
# Note: PORT is set by App Engine, we'll read it from the environment

# Expose the port the app will run on (App Engine will set PORT env var)
EXPOSE 8080

# Set the command to run the app
CMD ["sh", "-c", "node server.js"]
