#!/bin/bash

# Run backend tests
echo "Running backend tests..."
docker-compose run --rm backend-test

# Run frontend tests
echo "Running frontend tests..."
docker-compose run --rm frontend-test

echo "Testing complete!"
