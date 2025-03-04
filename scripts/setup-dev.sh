#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up development environment...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Frontend setup
echo -e "\n${YELLOW}Setting up frontend...${NC}"
cd frontend
echo "Installing frontend dependencies..."
npm install

# Create frontend .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating frontend .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
    echo -e "${GREEN}Created frontend .env.local${NC}"
fi

# Backend setup
echo -e "\n${YELLOW}Setting up backend...${NC}"
cd ../backend
echo "Installing backend dependencies..."
npm install

# Create backend .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating backend .env..."
    cat > .env << EOL
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ims
JWT_SECRET=development-secret-key
JWT_EXPIRATION=24h
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOL
    echo -e "${GREEN}Created backend .env${NC}"
fi

# Start MongoDB using Docker
echo -e "\n${YELLOW}Starting MongoDB container...${NC}"
docker run -d --name mongodb \
    -p 27017:27017 \
    -v mongodb_data:/data/db \
    mongo:latest

# Wait for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 5

# Run database seed
echo -e "\n${YELLOW}Running database seed...${NC}"
npm run seed

echo -e "\n${GREEN}Development environment setup complete!${NC}"
echo -e "\nTo start the application:"
echo -e "${YELLOW}1. Start the backend:${NC}"
echo "   cd backend && npm run start:dev"
echo -e "${YELLOW}2. Start the frontend (in a new terminal):${NC}"
echo "   cd frontend && npm run dev"
echo -e "\n${YELLOW}Access the application:${NC}"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- API Documentation: http://localhost:3001/api/docs"