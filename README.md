# Claude Calories Tracker

This repository contains a simple single-page application for tracking calories via voice input. It is implemented in plain HTML and React using CDN links so it can be hosted with GitHub Pages or served from a basic Node.js server.

## Running locally / on a VPS

1. Install [Node.js](https://nodejs.org/)
2. Run `npm start`
3. Open `http://YOUR_SERVER_IP:3000` in a browser (or the port specified in the `PORT` environment variable)

The `server.js` script serves the static `index.html` so you can deploy the repository on a VPS without any additional build steps.

## Docker

You can also run the site using Docker. Build and start the container with:

```bash
./docker_run.sh
```

The script builds the Docker image and runs it, exposing the port specified in the `PORT` environment variable (defaults to `3000`).
If a container from a previous run is still active, the script will stop it before starting the new one to prevent port conflicts.
Pass the `--update` flag to pull the latest changes before rebuilding. You can optionally provide the branch name (defaults to `main`):

```bash
./docker_run.sh --update [branch]
```

## Testing

Run `npm test` to start the server and verify the home page responds correctly.

