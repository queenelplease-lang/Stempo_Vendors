#!/bin/bash

set -e

echo "🚀 Starting backend API tests..."

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed"
    exit 1
fi

# Start test database
echo "📦 Starting test database..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if database is ready
until docker-compose exec -T postgres_test pg_isready -U stempo_test -d stempo_test_db > /dev/null 2>&1; do
    echo "⏳ Waiting for database..."
    sleep 1
done

echo "✅ Database is ready"

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5433
export DB_USER=stempo_test
export DB_PASSWORD=stempo_test_password
export DB_NAME=stempo_test_db
export JWT_SECRET=test-secret-key-for-testing-only

# Run tests
echo "🧪 Running tests..."
go test -v ./...

# Get exit code
TEST_EXIT_CODE=$?

# Stop test database
echo "🛑 Stopping test database..."
docker-compose down

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed"
fi

exit $TEST_EXIT_CODE
