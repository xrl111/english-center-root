#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load deployment config
CONFIG_FILE="./config/deploy.config.js"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "${RED}❌ Deployment config not found: $CONFIG_FILE${NC}"
    exit 1
fi

# Load environment variables
source ".env.$([ -z "$1" ] && echo "production" || echo "$1")"

# Get configuration from deploy.config.js using node
get_config() {
    local env=$1
    local key=$2
    node -e "
        const config = require('$CONFIG_FILE');
        console.log(config.$env.$key || config.shared.$key || '');
    "
}

# Initialize variables from config
ENV=${1:-"production"}
DEPLOY_PATH=$(get_config $ENV "path")
RELEASES_DIR="$DEPLOY_PATH/releases"
CURRENT_LINK="$DEPLOY_PATH/current"
BACKUP_DIR="$DEPLOY_PATH/rollbacks"
KEEP_RELEASES=$(get_config $ENV "shared.keepReleases" || echo "5")

# Function to show usage
show_usage() {
    echo "Usage: $0 [environment] [options]"
    echo
    echo "Environments:"
    echo "  production    Rollback production deployment (default)"
    echo "  staging       Rollback staging deployment"
    echo
    echo "Options:"
    echo "  --force      Skip confirmation prompts"
    echo "  --to=<tag>   Rollback to specific version tag"
    echo
    echo "Example:"
    echo "  $0 production --to=v1.2.3"
    exit 1
}

# Function to list available releases
list_releases() {
    echo "${BLUE}📋 Available releases:${NC}"
    ls -lt $RELEASES_DIR | grep ^d | awk '{print $9}' | head -n 10
}

# Function to get current release version
get_current_version() {
    if [ -L "$CURRENT_LINK" ]; then
        basename $(readlink -f $CURRENT_LINK)
    else
        echo "none"
    fi
}

# Function to verify application health
verify_health() {
    local health_url=$(get_config $ENV "healthCheck.url")
    local timeout=$(get_config $ENV "healthCheck.timeout" || echo "30000")
    local retries=$(get_config $ENV "healthCheck.retries" || echo "3")
    
    echo "${BLUE}🏥 Verifying application health...${NC}"
    
    for i in $(seq 1 $retries); do
        if curl -s "$health_url" | grep -q "ok"; then
            echo "${GREEN}✅ Application is healthy${NC}"
            return 0
        fi
        echo "${YELLOW}⚠️ Health check attempt $i of $retries failed${NC}"
        sleep 5
    done
    
    echo "${RED}❌ Application health check failed${NC}"
    return 1
}

# Function to create backup of current release
backup_current() {
    local current_version=$(get_current_version)
    if [ "$current_version" != "none" ]; then
        echo "${BLUE}📦 Backing up current release...${NC}"
        mkdir -p $BACKUP_DIR
        cp -r $CURRENT_LINK "$BACKUP_DIR/$current_version-$(date +%Y%m%d%H%M%S)"
    fi
}

# Function to perform rollback
do_rollback() {
    local target_version=$1
    local current_version=$(get_current_version)
    
    if [ "$current_version" == "$target_version" ]; then
        echo "${YELLOW}⚠️ Target version is already current${NC}"
        exit 0
    }
    
    echo "${BLUE}🔄 Rolling back to version $target_version...${NC}"
    
    # Backup current release
    backup_current
    
    # Switch to target release
    if ln -sfn "$RELEASES_DIR/$target_version" $CURRENT_LINK; then
        echo "${GREEN}✅ Successfully switched to version $target_version${NC}"
    else
        echo "${RED}❌ Failed to switch to version $target_version${NC}"
        exit 1
    fi
    
    # Restart application
    echo "${BLUE}🔄 Restarting application...${NC}"
    pm2 reload $APP_NAME
    
    # Verify health
    verify_health || {
        echo "${RED}❌ Rollback verification failed${NC}"
        echo "${YELLOW}⚠️ Rolling forward to previous version...${NC}"
        ln -sfn "$RELEASES_DIR/$current_version" $CURRENT_LINK
        pm2 reload $APP_NAME
        exit 1
    }
}

# Parse command line arguments
FORCE=false
TARGET_VERSION=""

while [ "$1" != "" ]; do
    case $1 in
        production|staging|development)
            ENV=$1
            ;;
        --force)
            FORCE=true
            ;;
        --to=*)
            TARGET_VERSION=${1#*=}
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "${RED}❌ Unknown parameter: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
    shift
done

# Main rollback process
echo "${BLUE}🔄 Starting rollback process for $ENV environment...${NC}"

# Show current version
current_version=$(get_current_version)
echo "${BLUE}📌 Current version: $current_version${NC}"

# List available releases if no target specified
if [ -z "$TARGET_VERSION" ]; then
    list_releases
    echo
    read -p "Enter version to rollback to: " TARGET_VERSION
fi

# Verify target version exists
if [ ! -d "$RELEASES_DIR/$TARGET_VERSION" ]; then
    echo "${RED}❌ Target version not found: $TARGET_VERSION${NC}"
    exit 1
fi

# Confirm rollback
if [ "$FORCE" != "true" ]; then
    read -p "Rolling back from $current_version to $TARGET_VERSION. Continue? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "${YELLOW}⚠️ Rollback cancelled${NC}"
        exit 1
    fi
fi

# Perform rollback
do_rollback $TARGET_VERSION

echo "${GREEN}✅ Rollback completed successfully!${NC}"