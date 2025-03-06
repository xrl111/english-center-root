#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV=${1:-"production"}  # Default to production if no environment specified
APP_NAME="english-center-frontend"
DEPLOY_USER="deploy"
DEPLOY_HOST="your-server.com"
DEPLOY_PATH="/var/www/${APP_NAME}"
HEALTH_CHECK_URL="https://your-domain.com/health"
BACKUP_DIR="/var/backups/${APP_NAME}"

# Load environment variables
if [ -f ".env.${DEPLOY_ENV}" ]; then
  source ".env.${DEPLOY_ENV}"
else
  echo "${RED}❌ Environment file .env.${DEPLOY_ENV} not found${NC}"
  exit 1
fi

# Function to show usage
show_usage() {
  echo "Usage: $0 [environment] [options]"
  echo
  echo "Environments:"
  echo "  production    Deploy to production (default)"
  echo "  staging       Deploy to staging"
  echo
  echo "Options:"
  echo "  --skip-tests  Skip running tests"
  echo "  --force       Skip confirmation prompts"
  echo "  --backup      Create backup before deploying"
  echo
  echo "Example:"
  echo "  $0 staging --skip-tests"
  exit 1
}

# Function to check requirements
check_requirements() {
  echo "${BLUE}🔍 Checking deployment requirements...${NC}"
  
  # Check Node.js version
  required_node_version="16.0.0"
  current_node_version=$(node -v | cut -d'v' -f2)
  if [ $(printf '%s\n' "$required_node_version" "$current_node_version" | sort -V | head -n1) != "$required_node_version" ]; then
    echo "${RED}❌ Node.js version $required_node_version or higher is required${NC}"
    exit 1
  }

  # Check SSH access
  if ! ssh -q ${DEPLOY_USER}@${DEPLOY_HOST} exit; then
    echo "${RED}❌ SSH connection failed${NC}"
    exit 1
  }

  # Check required commands
  for cmd in npm node ssh rsync pm2; do
    if ! command -v $cmd &> /dev/null; then
      echo "${RED}❌ Required command not found: $cmd${NC}"
      exit 1
    fi
  done
}

# Function to create backup
create_backup() {
  echo "${BLUE}📦 Creating backup...${NC}"
  timestamp=$(date +%Y%m%d_%H%M%S)
  backup_file="${BACKUP_DIR}/${APP_NAME}_${timestamp}.tar.gz"
  
  ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${BACKUP_DIR} && \
    tar -czf ${backup_file} ${DEPLOY_PATH} && \
    find ${BACKUP_DIR} -type f -mtime +7 -delete"
}

# Function to build application
build_app() {
  echo "${BLUE}🏗️ Building application...${NC}"
  npm run build || {
    echo "${RED}❌ Build failed${NC}"
    exit 1
  }
}

# Function to deploy application
deploy_app() {
  echo "${BLUE}🚀 Deploying to ${DEPLOY_ENV}...${NC}"
  
  # Ensure deploy directory exists
  ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_PATH}"

  # Sync files
  rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'test' \
    --exclude '.env*' \
    ./ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/

  # Install dependencies and restart
  ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH} && \
    npm ci --production && \
    pm2 restart ${APP_NAME} || pm2 start npm --name ${APP_NAME} -- start"
}

# Function to verify deployment
verify_deployment() {
  echo "${BLUE}✨ Verifying deployment...${NC}"
  
  # Wait for service to be up
  for i in {1..30}; do
    if curl -s "${HEALTH_CHECK_URL}" | grep -q "ok"; then
      echo "${GREEN}✅ Service is up and running${NC}"
      return 0
    fi
    echo "Waiting for service to be up... ($i/30)"
    sleep 2
  done
  
  echo "${RED}❌ Service verification failed${NC}"
  return 1
}

# Main deployment process
main() {
  echo "${BLUE}🚀 Starting deployment to ${DEPLOY_ENV}...${NC}"
  
  # Check requirements
  check_requirements
  
  # Confirm deployment
  if [ "$FORCE" != "true" ]; then
    read -p "Deploy to ${DEPLOY_ENV}? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "${YELLOW}⚠️ Deployment cancelled${NC}"
      exit 1
    fi
  fi
  
  # Create backup if requested
  if [ "$BACKUP" = "true" ]; then
    create_backup
  fi
  
  # Run tests unless skipped
  if [ "$SKIP_TESTS" != "true" ]; then
    echo "${BLUE}🧪 Running tests...${NC}"
    npm test || {
      echo "${RED}❌ Tests failed${NC}"
      exit 1
    }
  fi
  
  # Build and deploy
  build_app
  deploy_app
  
  # Verify deployment
  verify_deployment || {
    echo "${RED}❌ Deployment verification failed${NC}"
    exit 1
  }
  
  echo "${GREEN}✅ Deployment completed successfully!${NC}"
}

# Parse command line arguments
SKIP_TESTS=false
FORCE=false
BACKUP=false

while [ "$1" != "" ]; do
  case $1 in
    production|staging|development)
      DEPLOY_ENV=$1
      ;;
    --skip-tests)
      SKIP_TESTS=true
      ;;
    --force)
      FORCE=true
      ;;
    --backup)
      BACKUP=true
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

# Run deployment
main