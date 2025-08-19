require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.post('/notify', async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).send("Name is required.");
  }

  const responseLink = 'https://berry-doorbell.onrender.com/response';

  const payload = {
    content: `🔔 ${name} rang the Berry College Doorbell! [Click here to respond](${responseLink})`
  };

  try {
    await axios.post(WEBHOOK_URL, payload);
    res.status(200).send("Notification sent.");
  } catch (error) {
    console.error("Error sending webhook:", error);
    res.status(500).send("Error sending notification.");
  }
});

app.get('/response', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Response</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #F4F4F4;
          color: #00205B;
          text-align: center;
          padding-top: 100px;
        }
        h1 {
          font-size: 2em;
        }
      </style>
    </head>
    <body>
      <h1>I'm on my way!</h1>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
