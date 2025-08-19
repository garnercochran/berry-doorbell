require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessions = {};
const timeouts = {};

app.post('/notify', async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === "") {
        return res.status(400).send("Name is required.");
    }

    const id = uuidv4();
    sessions[id] = { name, status: "Dr. Cochran has been notified!" };

    const responseLink = `https://berry-doorbell.onrender.com/respond?id=${id}`;
    const payload = {
        content: "🔔 ${name} rang the Berry College Doorbell!\n[Click here to respond]"    };

    try {
        await axios.post(process.env.DISCORD_WEBHOOK_URL, payload);
        // Set fallback timeout
        timeouts[id] = setTimeout(() => {
            if (sessions[id].status === "Dr. Cochran has been notified!") {
                sessions[id].status = "I'm unavailable, please send me an email to schedule a meeting.";
            }
        }, 60000);
        res.redirect(`/waiting?id=${id}`);
    } catch (error) {
        console.error("Error sending webhook:", error.response?.data || error.message);
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
