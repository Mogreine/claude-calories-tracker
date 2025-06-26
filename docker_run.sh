#!/usr/bin/env bash
set -e

IMAGE_NAME="claude-calories-tracker"
PORT="${PORT:-3000}"

# Build the Docker image
docker build -t "$IMAGE_NAME" .

# Run the container mapping the chosen port
exec docker run --rm -p "$PORT:$PORT" -e PORT="$PORT" "$IMAGE_NAME"
