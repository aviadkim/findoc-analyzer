# Test Docker Deployment
Write-Host "===================================================
Testing Docker Deployment
===================================================" -ForegroundColor Green

# Step 1: Create Dockerfile
Write-Host "`n=== Step 1: Creating Dockerfile ===" -ForegroundColor Cyan

$dockerfilePath = "Dockerfile"
$dockerfileContent = @"
FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
"@

Set-Content -Path $dockerfilePath -Value $dockerfileContent
Write-Host "Dockerfile created." -ForegroundColor Green

# Step 2: Create docker-compose.yml
Write-Host "`n=== Step 2: Creating docker-compose.yml ===" -ForegroundColor Cyan

$dockerComposePath = "docker-compose.yml"
$dockerComposeContent = @"
version: '3'
services:
  findoc-analyzer:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - ./uploads:/app/uploads
      - ./results:/app/results
    environment:
      - NODE_ENV=production
"@

Set-Content -Path $dockerComposePath -Value $dockerComposeContent
Write-Host "docker-compose.yml created." -ForegroundColor Green

# Step 3: Build and run Docker container
Write-Host "`n=== Step 3: Building and running Docker container ===" -ForegroundColor Cyan

docker-compose up -d --build
Write-Host "Docker container built and running." -ForegroundColor Green

# Step 4: Wait for container to start
Write-Host "`n=== Step 4: Waiting for container to start ===" -ForegroundColor Cyan
Start-Sleep -Seconds 10
Write-Host "Container should be running now." -ForegroundColor Green

# Step 5: Test the application
Write-Host "`n=== Step 5: Testing the application ===" -ForegroundColor Cyan
$testUrl = "http://localhost:8080"
Write-Host "Testing URL: $testUrl" -ForegroundColor Yellow

# Run the agent capabilities test
node test-agent-capabilities-simple.js $testUrl
Write-Host "Application tested." -ForegroundColor Green

# Step 6: Stop and remove Docker container
Write-Host "`n=== Step 6: Stopping and removing Docker container ===" -ForegroundColor Cyan
docker-compose down
Write-Host "Docker container stopped and removed." -ForegroundColor Green

Write-Host "`nDocker deployment testing completed." -ForegroundColor Green
