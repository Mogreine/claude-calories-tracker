#!/usr/bin/env bash
set -e

IMAGE_NAME="claude-calories-tracker"
CONTAINER_NAME="claude-calories-tracker"
PORT="${PORT:-3000}"
UPDATE=false
BRANCH="main"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -u|--update)
      UPDATE=true
      if [[ -n "$2" && "$2" != -* ]]; then
        BRANCH="$2"
        shift 2
      else
        shift
      fi
      ;;
    *)
      echo "Usage: $0 [--update [branch]]" >&2
      exit 1
      ;;
  esac
done

if $UPDATE; then
  git pull origin "$BRANCH"
fi

# Stop any previously running container
RUNNING=$(docker ps -q -f name="^/${CONTAINER_NAME}$")
if [[ -n "$RUNNING" ]]; then
  echo "Stopping running container $CONTAINER_NAME..."
  docker stop "$CONTAINER_NAME"
fi

# Build the Docker image
docker build -t "$IMAGE_NAME" .

# Run the container mapping the chosen port
exec docker run --rm --name "$CONTAINER_NAME" -p "$PORT:$PORT" -e PORT="$PORT" "$IMAGE_NAME"
