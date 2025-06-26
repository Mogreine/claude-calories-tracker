# Claude Calories Tracker

This repository contains a single-page application for tracking calories using audio recordings or typed text. The client can record sound and send it to the server which forwards it to OpenAI for transcription and nutritional analysis. If speaking isn't convenient you can type a short description of what you ate and the server will analyze it the same way. The app is implemented in plain HTML and React using CDN links so it can be hosted with GitHub Pages or served from the included Node.js server.

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
Pass the `--update` flag to pull the latest changes before rebuilding. You can optionally provide the branch name (defaults to `main`):


```bash
./docker_run.sh --update [branch]
```

## OpenAI configuration

Set the `OPENAI_API_KEY` environment variable with your API key so the server can
transcribe audio and calculate nutrition using the OpenAI API.

## Testing

Run `npm test` to start the server and verify the home page responds correctly.

