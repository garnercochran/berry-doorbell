const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let currentVisitor = null;
let responseMessage = null;
let timeoutHandle = null;

// Serve.join(__dirname, 'public/index.html'));

// Serve waiting page
app.get('/waiting', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/waiting.html'));
});

// Serve response page
app.get('/respond', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/respond.html'));
});

// Handle doorbell ring
app.post('/ring', async (req, res) => {
  const { name } = req.body;
  currentVisitor = { name, timestamp: Date.now() };
  responseMessage = null;

  // Send Discord notification
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const responseLink = `https://berry-doorbell.onrender.com/respond`;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🔔 ${name} rang the doorbell!\nRespond here: ${responseLink}`
    })
  });

  // Start 1-minute timeout
  if (timeoutHandle) clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(() => {
    if (!responseMessage) {
      responseMessage = "I'm unavailable, please send me an email to schedule a meeting.";
    }
  }, 60000);

  res.status(200).send({ message: 'Doorbell rung!' });
});

// Handle response from User 2
app.post('/respond', (req, res) => {
  const { message } = req.body;
  responseMessage = message;
  if (timeoutHandle) clearTimeout(timeoutHandle);
  res.status(200).send({ message: 'Response recorded.' });
});

// Polling endpoint for waiting page
app.get('/status', (req, res) => {
  res.send({ message: responseMessage });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
