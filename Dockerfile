# Use Node.js for the frontend
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY backv2-github/DevDocs/frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY backv2-github/DevDocs/frontend/ ./

# Build the frontend
RUN npm run build

# Use Python for the backend
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies for PyMuPDF
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backv2-github/DevDocs/FinDocRAG/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backv2-github/DevDocs/FinDocRAG/src/ ./src/

# Copy the built frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/

# Create directories for uploads, temp files, and results
RUN mkdir -p uploads temp results

# Set environment variables
ENV UPLOAD_FOLDER=/app/uploads
ENV TEMP_FOLDER=/app/temp
ENV RESULTS_FOLDER=/app/results
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the application
CMD ["python", "src/app.py"]
