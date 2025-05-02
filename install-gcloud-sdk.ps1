# Install Google Cloud SDK
# This script downloads and installs the Google Cloud SDK

# Set error action preference
$ErrorActionPreference = "Stop"

# Define the download URL and installation path
$downloadUrl = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
$installerPath = Join-Path $env:TEMP "GoogleCloudSDKInstaller.exe"
$installDir = "C:\Google\Cloud SDK"

# Download the installer
Write-Host "Downloading Google Cloud SDK installer..."
Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath

# Run the installer
Write-Host "Running Google Cloud SDK installer..."
Write-Host "Please follow the installation wizard to complete the installation."
Write-Host "Make sure to:"
Write-Host "1. Install for all users (if you have admin rights)"
Write-Host "2. Add the SDK to your PATH"
Write-Host "3. Enable command completion"
Write-Host "4. Send anonymous usage statistics (optional)"
Write-Host ""
Write-Host "Press any key to start the installer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process -FilePath $installerPath -Wait

# Check if installation was successful
$gcloudPath = Join-Path $installDir "bin\gcloud.cmd"
if (Test-Path $gcloudPath) {
    Write-Host "Google Cloud SDK installed successfully!"
    Write-Host "You may need to restart your terminal for the changes to take effect."
    Write-Host ""
    Write-Host "After restarting your terminal, run the following command to authenticate:"
    Write-Host "gcloud auth login"
    Write-Host ""
    Write-Host "Then run the following command to set your project:"
    Write-Host "gcloud config set project devdoc-456420"
} else {
    Write-Host "Google Cloud SDK installation may not have completed successfully."
    Write-Host "Please check the installation and try again."
}

# Clean up
Remove-Item $installerPath -Force
