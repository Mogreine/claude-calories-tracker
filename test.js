const { spawn } = require('child_process');
const http = require('http');
const assert = require('assert');

const PORT = 3100;

const serverProcess = spawn('node', ['server.js'], {
  env: { ...process.env, PORT },
  stdio: 'inherit'
});

function killServer() {
  if (!serverProcess.killed) {
    serverProcess.kill();
  }
}

process.on('exit', killServer);
process.on('SIGINT', () => { killServer(); process.exit(1); });

// wait briefly for server to start
setTimeout(() => {
  http.get(`http://localhost:${PORT}`, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        assert.strictEqual(res.statusCode, 200, 'status code should be 200');
        assert.ok(body.includes('<title>Voice Calorie Tracker</title>'), 'body should contain title');
        console.log('Test passed');
        killServer();
      } catch (err) {
        console.error('Test failed:', err.message);
        killServer();
        process.exitCode = 1;
      }
    });
  }).on('error', err => {
    console.error('Request failed:', err.message);
    killServer();
    process.exitCode = 1;
  });
}, 1000);
