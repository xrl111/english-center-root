#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
  echo "Usage: $0 [major|minor|patch|prerelease] [--dry-run]"
  echo
  echo "Examples:"
  echo "  $0 patch         # Creates a patch release"
  echo "  $0 minor        # Creates a minor release"
  echo "  $0 major        # Creates a major release"
  echo "  $0 prerelease   # Creates a prerelease"
  echo "  $0 patch --dry-run  # Shows what would happen"
}

# Check arguments
if [ $# -lt 1 ]; then
  show_usage
  exit 1
fi

RELEASE_TYPE=$1
DRY_RUN=false

if [ "$2" == "--dry-run" ]; then
  DRY_RUN=true
  echo "${YELLOW}🔍 Performing dry run...${NC}"
fi

# Ensure we're on main/master branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
  echo "${RED}❌ Must be on main/master branch to create a release${NC}"
  exit 1
fi

# Ensure working directory is clean
if [[ -n $(git status -s) ]]; then
  echo "${RED}❌ Working directory is not clean${NC}"
  git status -s
  exit 1
fi

# Pull latest changes
echo "${BLUE}📥 Pulling latest changes...${NC}"
if [ "$DRY_RUN" = false ]; then
  git pull origin $CURRENT_BRANCH || {
    echo "${RED}❌ Failed to pull latest changes${NC}"
    exit 1
  }
fi

# Run tests
echo "${BLUE}🧪 Running tests...${NC}"
if [ "$DRY_RUN" = false ]; then
  npm run test -- --bail || {
    echo "${RED}❌ Tests failed${NC}"
    exit 1
  }
fi

# Build project
echo "${BLUE}🏗️ Building project...${NC}"
if [ "$DRY_RUN" = false ]; then
  npm run build || {
    echo "${RED}❌ Build failed${NC}"
    exit 1
  }
fi

# Update version
echo "${BLUE}📝 Updating version...${NC}"
if [ "$DRY_RUN" = false ]; then
  npm version $RELEASE_TYPE || {
    echo "${RED}❌ Version update failed${NC}"
    exit 1
  }
fi

# Get new version number
NEW_VERSION=$(node -p "require('./package.json').version")
echo "${GREEN}✨ New version: ${NEW_VERSION}${NC}"

# Generate changelog
echo "${BLUE}📝 Generating changelog...${NC}"
if [ "$DRY_RUN" = false ]; then
  npx conventional-changelog -p angular -i CHANGELOG.md -s || {
    echo "${YELLOW}⚠️ Failed to generate changelog${NC}"
  }
fi

# Create git tag
if [ "$DRY_RUN" = false ]; then
  echo "${BLUE}🏷️ Creating git tag...${NC}"
  git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION" || {
    echo "${RED}❌ Failed to create git tag${NC}"
    exit 1
  }
fi

# Create GitHub release (if gh CLI is installed)
if command -v gh &> /dev/null && [ "$DRY_RUN" = false ]; then
  echo "${BLUE}🚀 Creating GitHub release...${NC}"
  gh release create "v$NEW_VERSION" \
    --title "Release v$NEW_VERSION" \
    --notes-file <(npx conventional-changelog -p angular) || {
    echo "${YELLOW}⚠️ Failed to create GitHub release${NC}"
  }
fi

# Push changes
if [ "$DRY_RUN" = false ]; then
  echo "${BLUE}📤 Pushing changes...${NC}"
  git push origin $CURRENT_BRANCH --tags || {
    echo "${RED}❌ Failed to push changes${NC}"
    exit 1
  }
fi

# Deploy (if deploy script exists)
if [ -f "scripts/deploy.sh" ] && [ "$DRY_RUN" = false ]; then
  echo "${BLUE}🚀 Deploying...${NC}"
  ./scripts/deploy.sh || {
    echo "${YELLOW}⚠️ Deploy failed${NC}"
  }
fi

if [ "$DRY_RUN" = true ]; then
  echo "${YELLOW}🔍 Dry run completed. No changes were made.${NC}"
else
  echo "${GREEN}✅ Release v$NEW_VERSION completed successfully!${NC}"
fi

# Post-release checklist
echo "\n${BLUE}📋 Post-release checklist:${NC}"
echo "1. Verify the GitHub release: https://github.com/your-repo/releases"
echo "2. Check the deployed version on staging/production"
echo "3. Update documentation if needed"
echo "4. Notify team members"
echo "5. Update release notes in project management tool"