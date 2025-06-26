const http = require('http');
const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');

const port = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

async function transcribeWithOpenAI(buffer, mimeType) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimeType || 'audio/webm' }), 'audio.webm');
  form.append('model', 'whisper-1');

  const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'transcription failed');
  return data.text;
}

async function analyzeWithOpenAI(transcript) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const prompt = `
        You are a nutrition expert. Parse this food diary entry and calculate the nutritional information.

        User said: "${transcript}"

        Please respond with ONLY a valid JSON object in this exact format:
        {
          "foods": [
            {
              "food": "food name",
              "grams": number,
              "calories": number,
              "protein": number,
              "fat": number,
              "carbs": number
            }
          ],
          "totalCalories": number,
          "totalProtein": number,
          "totalFat": number,
          "totalCarbs": number
        }

        Instructions:
        - Convert all quantities to grams (e.g., "1 banana" = 120g, "1 cup rice" = 200g, "1 slice bread" = 30g, "1 egg" = 50g)
        - Use standard nutrition values per 100g and calculate for the specified amount
        - If no quantity specified, assume reasonable serving sizes
        - Calculate totals by summing all foods
        - Round calories to whole numbers, round protein/fat/carbs to 1 decimal place
        - DO NOT include any text outside the JSON object
        - DO NOT use backticks or markdown formatting

        Example:
        Input: "I ate 150 grams of chicken breast and one banana"
        Output: {"foods":[{"food":"chicken breast","grams":150,"calories":248,"protein":46.5,"fat":5.4,"carbs":0},{"food":"banana","grams":120,"calories":107,"protein":1.3,"fat":0.4,"carbs":27.6}],"totalCalories":355,"totalProtein":47.8,"totalFat":5.8,"totalCarbs":27.6}
  `;

  const body = {
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'analysis failed');
  return JSON.parse(data.choices[0].message.content);
}

const server = http.createServer((req, res) => {
  const requestPath = req.url.split('?')[0];

  if (req.method === 'POST' && requestPath === '/process-text') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      try {
        const { text } = JSON.parse(body);
        const nutrition = await analyzeWithOpenAI(text);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ transcript: text, ...nutrition }));
      } catch (err) {
        console.error('Error processing text:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Processing failed' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && requestPath === '/process-audio') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      try {
        const { audio, mimeType } = JSON.parse(body);
        const buffer = Buffer.from(audio, 'base64');
        const transcript = await transcribeWithOpenAI(buffer, mimeType);
        const nutrition = await analyzeWithOpenAI(transcript);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ transcript, ...nutrition }));
      } catch (err) {
        console.error('Error processing audio:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Processing failed' }));
      }
    });
    return;
  }

  let filePath = path.join(__dirname, requestPath === '/' ? 'index.html' : requestPath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
