# Fix Analytics Page
Write-Host "===================================================
Fixing Analytics Page
===================================================" -ForegroundColor Green

# Step 1: Create Analytics Page
Write-Host "`n=== Step 1: Creating Analytics Page ===" -ForegroundColor Cyan

# Check if analytics-new.html exists
$analyticsHtmlPath = "public/analytics-new.html"
if (Test-Path -Path $analyticsHtmlPath) {
    Write-Host "Updating analytics-new.html..." -ForegroundColor Yellow
    
    # Read the current content
    $analyticsHtmlContent = Get-Content -Path $analyticsHtmlPath -Raw
    
    # Check if analytics container exists
    if ($analyticsHtmlContent -notmatch '<div class="analytics-container"') {
        # Add analytics container
        $analyticsHtmlContent = $analyticsHtmlContent -replace '<div class="container">', @"
<div class="container">
  <div class="row">
    <div class="col-md-12">
      <h1>Analytics</h1>
      <div class="analytics-container">
        <div class="row">
          <div class="col-md-6">
            <div class="chart-container">
              <h3>Document Types</h3>
              <canvas id="document-types-chart"></canvas>
            </div>
          </div>
          <div class="col-md-6">
            <div class="chart-container">
              <h3>Processing Status</h3>
              <canvas id="processing-status-chart"></canvas>
            </div>
          </div>
        </div>
        <div class="row mt-4">
          <div class="col-md-12">
            <div class="chart-container">
              <h3>Documents Uploaded Over Time</h3>
              <canvas id="documents-timeline-chart"></canvas>
            </div>
          </div>
        </div>
        <div class="row mt-4">
          <div class="col-md-6">
            <div class="chart-container">
              <h3>Top Securities</h3>
              <canvas id="top-securities-chart"></canvas>
            </div>
          </div>
          <div class="col-md-6">
            <div class="chart-container">
              <h3>Asset Allocation</h3>
              <canvas id="asset-allocation-chart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
"@
        
        # Add Chart.js script
        $analyticsHtmlContent = $analyticsHtmlContent -replace '</body>', @"
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    // Sample data
    const documentTypes = {
      labels: ['Financial Report', 'Portfolio', 'Analysis', 'Other'],
      datasets: [{
        label: 'Document Types',
        data: [12, 8, 5, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    const processingStatus = {
      labels: ['Processed', 'Pending', 'Error'],
      datasets: [{
        label: 'Processing Status',
        data: [18, 7, 3],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    const documentsTimeline = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Documents Uploaded',
        data: [3, 5, 7, 4, 6, 8],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        tension: 0.4
      }]
    };
    
    const topSecurities = {
      labels: ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'FB'],
      datasets: [{
        label: 'Frequency',
        data: [15, 12, 10, 8, 6],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    const assetAllocation = {
      labels: ['Stocks', 'Bonds', 'Cash', 'Real Estate', 'Commodities'],
      datasets: [{
        label: 'Asset Allocation',
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    // Create charts
    document.addEventListener('DOMContentLoaded', function() {
      // Document Types Chart
      const documentTypesCtx = document.getElementById('document-types-chart').getContext('2d');
      new Chart(documentTypesCtx, {
        type: 'pie',
        data: documentTypes,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: 'Document Types Distribution'
            }
          }
        }
      });
      
      // Processing Status Chart
      const processingStatusCtx = document.getElementById('processing-status-chart').getContext('2d');
      new Chart(processingStatusCtx, {
        type: 'doughnut',
        data: processingStatus,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: 'Document Processing Status'
            }
          }
        }
      });
      
      // Documents Timeline Chart
      const documentsTimelineCtx = document.getElementById('documents-timeline-chart').getContext('2d');
      new Chart(documentsTimelineCtx, {
        type: 'line',
        data: documentsTimeline,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Documents Uploaded Over Time'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      // Top Securities Chart
      const topSecuritiesCtx = document.getElementById('top-securities-chart').getContext('2d');
      new Chart(topSecuritiesCtx, {
        type: 'bar',
        data: topSecurities,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Top Securities Mentioned'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      // Asset Allocation Chart
      const assetAllocationCtx = document.getElementById('asset-allocation-chart').getContext('2d');
      new Chart(assetAllocationCtx, {
        type: 'pie',
        data: assetAllocation,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: 'Asset Allocation'
            }
          }
        }
      });
    });
  </script>
</body>
"@
        
        # Add chart styles
        $analyticsHtmlContent = $analyticsHtmlContent -replace '</style>', @"
  .analytics-container {
    margin-top: 20px;
  }
  .chart-container {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 20px;
    height: 300px;
  }
  .chart-container h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 18px;
  }
</style>
"@
        
        # Save the updated content
        Set-Content -Path $analyticsHtmlPath -Value $analyticsHtmlContent
        Write-Host "analytics-new.html updated with analytics container." -ForegroundColor Green
    } else {
        Write-Host "Analytics container already exists in analytics-new.html." -ForegroundColor Green
    }
} else {
    Write-Host "Creating analytics-new.html..." -ForegroundColor Yellow
    
    # Create analytics-new.html with analytics container
    $analyticsHtmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analytics - FinDoc Analyzer</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <link rel="stylesheet" href="/css/styles.css">
  <style>
    .analytics-container {
      margin-top: 20px;
    }
    .chart-container {
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 20px;
      height: 300px;
    }
    .chart-container h3 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <a class="navbar-brand" href="/">FinDoc Analyzer</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" href="/">Dashboard</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/documents-new">My Documents</a>
        </li>
        <li class="nav-item active">
          <a class="nav-link" href="/analytics-new">Analytics</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/upload">Upload</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/document-chat">Document Chat</a>
        </li>
      </ul>
      <ul class="navbar-nav ml-auto">
        <li class="nav-item">
          <a class="nav-link" href="/login">Login</a>
        </li>
      </ul>
    </div>
  </nav>

  <div class="container mt-4">
    <div class="row">
      <div class="col-md-12">
        <h1>Analytics</h1>
        <div class="analytics-container">
          <div class="row">
            <div class="col-md-6">
              <div class="chart-container">
                <h3>Document Types</h3>
                <canvas id="document-types-chart"></canvas>
              </div>
            </div>
            <div class="col-md-6">
              <div class="chart-container">
                <h3>Processing Status</h3>
                <canvas id="processing-status-chart"></canvas>
              </div>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-md-12">
              <div class="chart-container">
                <h3>Documents Uploaded Over Time</h3>
                <canvas id="documents-timeline-chart"></canvas>
              </div>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-md-6">
              <div class="chart-container">
                <h3>Top Securities</h3>
                <canvas id="top-securities-chart"></canvas>
              </div>
            </div>
            <div class="col-md-6">
              <div class="chart-container">
                <h3>Asset Allocation</h3>
                <canvas id="asset-allocation-chart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    // Sample data
    const documentTypes = {
      labels: ['Financial Report', 'Portfolio', 'Analysis', 'Other'],
      datasets: [{
        label: 'Document Types',
        data: [12, 8, 5, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    const processingStatus = {
      labels: ['Processed', 'Pending', 'Error'],
      datasets: [{
        label: 'Processing Status',
        data: [18, 7, 3],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    const documentsTimeline = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Documents Uploaded',
        data: [3, 5, 7, 4, 6, 8],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        tension: 0.4
      }]
    };
    
    const topSecurities = {
      labels: ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'FB'],
      datasets: [{
        label: 'Frequency',
        data: [15, 12, 10, 8, 6],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    const assetAllocation = {
      labels: ['Stocks', 'Bonds', 'Cash', 'Real Estate', 'Commodities'],
      datasets: [{
        label: 'Asset Allocation',
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    // Create charts
    document.addEventListener('DOMContentLoaded', function() {
      // Document Types Chart
      const documentTypesCtx = document.getElementById('document-types-chart').getContext('2d');
      new Chart(documentTypesCtx, {
        type: 'pie',
        data: documentTypes,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: 'Document Types Distribution'
            }
          }
        }
      });
      
      // Processing Status Chart
      const processingStatusCtx = document.getElementById('processing-status-chart').getContext('2d');
      new Chart(processingStatusCtx, {
        type: 'doughnut',
        data: processingStatus,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: 'Document Processing Status'
            }
          }
        }
      });
      
      // Documents Timeline Chart
      const documentsTimelineCtx = document.getElementById('documents-timeline-chart').getContext('2d');
      new Chart(documentsTimelineCtx, {
        type: 'line',
        data: documentsTimeline,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Documents Uploaded Over Time'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      // Top Securities Chart
      const topSecuritiesCtx = document.getElementById('top-securities-chart').getContext('2d');
      new Chart(topSecuritiesCtx, {
        type: 'bar',
        data: topSecurities,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Top Securities Mentioned'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      // Asset Allocation Chart
      const assetAllocationCtx = document.getElementById('asset-allocation-chart').getContext('2d');
      new Chart(assetAllocationCtx, {
        type: 'pie',
        data: assetAllocation,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: 'Asset Allocation'
            }
          }
        }
      });
    });
  </script>
</body>
</html>
"@
    
    # Create the directory if it doesn't exist
    $analyticsHtmlDir = Split-Path -Path $analyticsHtmlPath -Parent
    if (-not (Test-Path -Path $analyticsHtmlDir)) {
        New-Item -ItemType Directory -Path $analyticsHtmlDir -Force | Out-Null
    }
    
    # Save the file
    Set-Content -Path $analyticsHtmlPath -Value $analyticsHtmlContent
    Write-Host "analytics-new.html created with analytics container." -ForegroundColor Green
}

# Step 2: Update server.js to handle the analytics route
Write-Host "`n=== Step 2: Updating server.js to handle the analytics route ===" -ForegroundColor Cyan

$serverJsPath = "server.js"
if (Test-Path -Path $serverJsPath) {
    Write-Host "Updating server.js..." -ForegroundColor Yellow
    
    # Read the current content
    $serverJsContent = Get-Content -Path $serverJsPath -Raw
    
    # Check if analytics route exists
    if ($serverJsContent -notmatch "app.get\('/analytics-new'") {
        # Add analytics route
        $serverJsContent = $serverJsContent -replace "app.get\('/upload'.*?\);", @"
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.get('/analytics-new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analytics-new.html'));
});
"@
        
        # Save the updated content
        Set-Content -Path $serverJsPath -Value $serverJsContent
        Write-Host "server.js updated with analytics route." -ForegroundColor Green
    } else {
        Write-Host "Analytics route already exists in server.js." -ForegroundColor Green
    }
} else {
    Write-Host "server.js not found. Cannot update server routes." -ForegroundColor Red
}

# Step 3: Create a deployment package
Write-Host "`n=== Step 3: Creating deployment package ===" -ForegroundColor Cyan

$deploymentDir = "analytics-fixes"
if (Test-Path -Path $deploymentDir) {
    Remove-Item -Path $deploymentDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deploymentDir -Force | Out-Null

# Copy necessary files
Copy-Item -Path "public" -Destination "$deploymentDir/" -Recurse -Force
Copy-Item -Path "server.js" -Destination "$deploymentDir/" -Force
Write-Host "Deployment package created." -ForegroundColor Green

# Step 4: Deploy the fixes
Write-Host "`n=== Step 4: Deploying the fixes ===" -ForegroundColor Cyan
Write-Host "To deploy the fixes, run the following command:" -ForegroundColor Yellow
Write-Host "powershell -ExecutionPolicy Bypass -File .\deploy-to-cloud-run.ps1" -ForegroundColor Yellow

Write-Host "`nAnalytics page fixed. Please deploy the fixes to the cloud." -ForegroundColor Green
