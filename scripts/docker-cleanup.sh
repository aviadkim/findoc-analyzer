#!/bin/bash
# Docker Clean-up Script
# This script helps maintain your Docker environment by cleaning up unused resources
# Includes safety checks and options to customize the clean-up process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (modify these variables to customize behavior)
DRY_RUN=false
PRUNE_VOLUMES=false
PRUNE_NETWORKS=true
PRUNE_IMAGES=true
PRUNE_BUILDERS=true
DAYS_OLD=7
DELETE_ALL_UNUSED=false
PRUNE_SYSTEM=false

# Process command-line arguments
for arg in "$@"
do
    case $arg in
        --dry-run)
        DRY_RUN=true
        shift
        ;;
        --prune-volumes)
        PRUNE_VOLUMES=true
        shift
        ;;
        --no-prune-networks)
        PRUNE_NETWORKS=false
        shift
        ;;
        --no-prune-images)
        PRUNE_IMAGES=false
        shift
        ;;
        --no-prune-builders)
        PRUNE_BUILDERS=false
        shift
        ;;
        --delete-all-unused)
        DELETE_ALL_UNUSED=true
        shift
        ;;
        --days=*)
        DAYS_OLD="${arg#*=}"
        shift
        ;;
        --prune-system)
        PRUNE_SYSTEM=true
        shift
        ;;
        --help)
        echo -e "${BLUE}Docker Clean-up Script${NC}"
        echo "Usage: ./docker-cleanup.sh [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --dry-run            Show what would be done without actually doing it"
        echo "  --prune-volumes      Include volumes in clean-up (default: false)"
        echo "  --no-prune-networks  Exclude networks from clean-up"
        echo "  --no-prune-images    Exclude images from clean-up"
        echo "  --no-prune-builders  Exclude build cache from clean-up"
        echo "  --delete-all-unused  Remove all unused images, not just dangling ones"
        echo "  --days=N             Remove containers older than N days (default: 7)"
        echo "  --prune-system       Run docker system prune (caution: removes all stopped containers)"
        echo "  --help               Show this help message"
        exit 0
        ;;
    esac
done

# Print settings
echo -e "${BLUE}=== Docker Clean-up Settings ===${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN MODE: No actual changes will be made${NC}"
fi
echo "Removing containers older than: $DAYS_OLD days"
echo "Pruning volumes: $PRUNE_VOLUMES"
echo "Pruning networks: $PRUNE_NETWORKS"
echo "Pruning images: $PRUNE_IMAGES"
echo "Pruning build cache: $PRUNE_BUILDERS"
echo "Delete all unused images: $DELETE_ALL_UNUSED"
echo "Running system prune: $PRUNE_SYSTEM"
echo ""

# Function to execute or simulate a command
run_cmd() {
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN] Would execute: $1${NC}"
    else
        echo -e "${GREEN}Executing: $1${NC}"
        eval "$1"
    fi
}

# 1. Stop and remove exited containers
echo -e "${BLUE}=== Checking for containers to clean up ===${NC}"

# Get list of container IDs older than N days
old_containers=$(docker ps -a --filter "status=exited" --filter "status=created" --filter "before=$(date -d "$DAYS_OLD days ago" '+%Y-%m-%d')" -q)

if [ -z "$old_containers" ]; then
    echo "No containers older than $DAYS_OLD days found"
else
    container_count=$(echo "$old_containers" | wc -w)
    echo -e "${YELLOW}Found $container_count containers older than $DAYS_OLD days${NC}"
    
    if [ "$DRY_RUN" = false ]; then
        echo "Containers to be removed:"
        for container in $old_containers; do
            docker ps -a --filter "id=$container" --format "{{.ID}} - {{.Names}} - {{.Status}}"
        done
    fi
    
    run_cmd "docker rm $old_containers"
fi

# 2. Clean up networks (if enabled)
if [ "$PRUNE_NETWORKS" = true ]; then
    echo -e "\n${BLUE}=== Cleaning up unused networks ===${NC}"
    run_cmd "docker network prune -f"
fi

# 3. Clean up volumes (if enabled - USE WITH CAUTION)
if [ "$PRUNE_VOLUMES" = true ]; then
    echo -e "\n${BLUE}=== Cleaning up unused volumes ===${NC}"
    echo -e "${RED}CAUTION: This will permanently delete unused volumes and their data${NC}"
    
    if [ "$DRY_RUN" = false ]; then
        read -p "Are you sure you want to continue? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_cmd "docker volume prune -f"
        else
            echo "Skipping volume cleanup"
        fi
    else
        run_cmd "docker volume prune -f"
    fi
fi

# 4. Clean up images (if enabled)
if [ "$PRUNE_IMAGES" = true ]; then
    echo -e "\n${BLUE}=== Cleaning up Docker images ===${NC}"
    
    if [ "$DELETE_ALL_UNUSED" = true ]; then
        run_cmd "docker image prune -af"
    else
        # Just remove dangling images (untagged)
        run_cmd "docker image prune -f"
    fi
fi

# 5. Clean up build cache (if enabled)
if [ "$PRUNE_BUILDERS" = true ]; then
    echo -e "\n${BLUE}=== Cleaning up build cache ===${NC}"
    run_cmd "docker builder prune -f"
fi

# 6. System prune (if enabled)
if [ "$PRUNE_SYSTEM" = true ]; then
    echo -e "\n${BLUE}=== Running system prune ===${NC}"
    echo -e "${RED}CAUTION: This will remove all stopped containers, unused networks, and dangling images${NC}"
    
    if [ "$DRY_RUN" = false ]; then
        read -p "Are you sure you want to continue? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [ "$DELETE_ALL_UNUSED" = true ]; then
                run_cmd "docker system prune -af"
            else
                run_cmd "docker system prune -f"
            fi
        else
            echo "Skipping system prune"
        fi
    else
        if [ "$DELETE_ALL_UNUSED" = true ]; then
            run_cmd "docker system prune -af"
        else
            run_cmd "docker system prune -f"
        fi
    fi
fi

# Print summary
echo -e "\n${BLUE}=== Cleanup Complete ===${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}This was a dry run. No actual changes were made.${NC}"
    echo -e "Run without --dry-run to perform the actual cleanup."
else
    echo -e "${GREEN}Docker environment has been cleaned up successfully.${NC}"
fi

# Print current Docker disk usage
echo -e "\n${BLUE}=== Current Docker Disk Usage ===${NC}"
docker system df