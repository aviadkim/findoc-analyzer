# FinDoc Analyzer - Push to GitHub Script
# This script pushes the modern UI changes to GitHub

# Configuration
$GITHUB_REPO = "https://github.com/aviadkim/findoc-analyzer.git"
$BRANCH_NAME = "modern-ui"
$COMMIT_MESSAGE = "Add modern UI components with improved design"

# Color codes for output
$GREEN = "\033[0;32m"
$YELLOW = "\033[1;33m"
$RED = "\033[0;31m"
$BLUE = "\033[0;34m"
$NC = "\033[0m" # No Color

Write-Host "${YELLOW}====================================================${NC}"
Write-Host "${YELLOW}FinDoc Analyzer - Push to GitHub${NC}"
Write-Host "${YELLOW}====================================================${NC}"
Write-Host "${BLUE}GitHub Repository:${NC} $GITHUB_REPO"
Write-Host "${BLUE}Branch:${NC} $BRANCH_NAME"
Write-Host "${YELLOW}====================================================${NC}"

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "${GREEN}Using $gitVersion${NC}"
}
catch {
    Write-Host "${RED}Error: Git not found. Please install Git.${NC}"
    exit 1
}

# Check if repository is already initialized
if (-not (Test-Path ".git")) {
    Write-Host "${BLUE}Initializing Git repository...${NC}"
    git init
    git remote add origin $GITHUB_REPO
}

# Check current branch
$currentBranch = git branch --show-current
if ($currentBranch -ne $BRANCH_NAME) {
    Write-Host "${BLUE}Creating and switching to branch $BRANCH_NAME...${NC}"
    git checkout -b $BRANCH_NAME
}

# Add all files
Write-Host "${BLUE}Adding files to staging area...${NC}"
git add .

# Commit changes
Write-Host "${BLUE}Committing changes...${NC}"
git commit -m "$COMMIT_MESSAGE"

# Push to GitHub
Write-Host "${BLUE}Pushing to GitHub...${NC}"
git push -u origin $BRANCH_NAME

# Check if push was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "${GREEN}Successfully pushed to GitHub!${NC}"
    Write-Host "${GREEN}Branch:${NC} $BRANCH_NAME"
    Write-Host "${GREEN}Repository:${NC} $GITHUB_REPO"
} else {
    Write-Host "${RED}Error: Failed to push to GitHub.${NC}"
    Write-Host "${RED}Please check your credentials and try again.${NC}"
    exit 1
}

Write-Host "${YELLOW}====================================================${NC}"
Write-Host "${GREEN}Push to GitHub Completed!${NC}"
Write-Host "${YELLOW}====================================================${NC}"

# Open GitHub repository in browser
Write-Host "${BLUE}Opening GitHub repository in browser...${NC}"
Start-Process "https://github.com/aviadkim/findoc-analyzer/tree/$BRANCH_NAME"
