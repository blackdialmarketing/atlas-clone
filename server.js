const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
try {
const { productUrl } = req.body;

const completion = await openai.chat.completions.create({
model: "gpt-3.5-turbo",
messages: [{
role: "user",
content: `Analyze this product URL and create a complete Shopify store: ${productUrl}. Return JSON with: storeName, tagline, colors (3 hex colors), description, features (array), pages (home, about, contact content), and productPages (array of product descriptions).`
}],
response_format: { type: "json_object" }
});

const storeData = JSON.parse(completion.choices[0].message.content);
res.json({ success: true, store: storeData });
} catch (error) {
res.json({ success: false, error: error.message });
}
});

app.get('/', (req, res) => {
res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Atlas Clone</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px; }
.container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; }
h1 { color: #2d3748; text-align: center; margin-bottom: 10px; font-size: 2.5rem; }
.tagline { text-align: center; color: #718096; margin-bottom: 30px; font-size: 18px; }
.input-group { display: flex; gap: 10px; margin: 30px 0; }
input { flex: 1; padding: 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 16px; }
button { padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
.result { margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 10px; display: none; }
.colors { display: flex; gap: 10px; margin: 15px 0; }
.color { width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
</style>
</head>
<body>
<div class="container">
<h1>🚀 Atlas Clone</h1>
<p class="tagline">Build AI-powered Shopify stores in minutes</p>
<div class="input-group">
<input type="text" placeholder="https://example.com/product" id="productUrl">
<button onclick="generateStore()" id="generateBtn">Generate Store</button>
</div>
<div id="result"></div>
</div>
<script>
async function generateStore() {
const url = document.getElementById('productUrl').value;
if(!url) { alert('Please enter a product URL'); return; }

const btn = document.getElementById('generateBtn');
btn.disabled = true;
btn.textContent = 'Generating...';

try {
const response = await fetch('/api/generate', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ productUrl: url })
});

const data = await response.json();

if(data.success) {
const store = data.store;
const result = document.getElementById('result');
result.innerHTML = '<h2>' + store.storeName + '</h2><p>' + store.tagline + '</p>';
result.style.display = 'block';
} else {
alert('Error: ' + data.error);
}
} catch(error) {
alert('Error generating store');
}

btn.disabled = false;
btn.textContent = 'Generate Store';
}
</script>
</body>
</html>
`);
});

app.listen(PORT, () => {
console.log('Atlas Clone running on port ' + PORT);
});
