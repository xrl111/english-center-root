#!/bin/bash

# Function to stop services
cleanup() {
  echo "Stopping services..."
  docker-compose down
  exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Start services
echo "Starting services..."
docker-compose up --build 