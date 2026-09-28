#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=== Deploying theonlyconclusion.com ==="
if [ -f "build.py" ] && [ -d "src" ]; then
    echo "Running build.py..."
    python3 build.py
fi

echo "Starting Docker service..."
docker compose up -d

echo "Reloading Nginx inside container (if already running)..."
docker compose exec -T web nginx -s reload 2>/dev/null || true

echo "=== Deployment Complete ==="
