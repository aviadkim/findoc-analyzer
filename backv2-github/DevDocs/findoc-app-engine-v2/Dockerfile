# Use the official Node.js 18 image as a parent image
FROM node:18-slim

# Set the working directory
WORKDIR /app

# Install Python and other dependencies for PDF processing
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    ghostscript \
    poppler-utils \
    libpoppler-dev \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip3 install camelot-py[cv] PyPDF2 pandas numpy matplotlib pymupdf pytesseract opencv-python-headless

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create temp directory for processing
RUN mkdir -p /app/temp && chmod 777 /app/temp

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
