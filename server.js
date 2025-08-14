require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const sessions = {};

app.post('/notify', async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).send("Name is required.");
  }

  const id = uuidv4();
  sessions[id] = { name, status: "waiting" };

  const responseLink = `https://berry-doorbell.onrender.com/respond?id=${id}`;
  const payload = {
    content: `🔔 ${name} rang the Berry College Doorbell! [Click here to respond](${responseLink})`
  };

  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL, payload);
    res.json({ id });
  } catch (error) {
    console.error("Error sending webhook:", error);
    res.status(500).send("Error sending notification.");
  }
});

app.get('/respond', (req, res) => {
  const { id } = req.query;
  if (sessions[id]) {
    sessions[id].status = "on_the_way";
    res.send("<h1>Response recorded. Student will be notified.</h1>");
  } else {
    res.status(404).send("Session not found.");
  }
});

app.get('/waiting', (req, res) => {
  const { id } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Waiting</title>
      <script>
        function checkStatus() {
          fetch('/status?id=${id}')
            .then(response => response.json())
            .then(data => {
              if (data.status === "on_the_way") {
                document.getElementById("message").innerText = "I'm on my way!";
              }
            });
        }
        setInterval(checkStatus, 3000);
      </script>
    </head>
    <body>
      <h1 id="message">Your doorbell has been rung. Please wait...</h1>
    </body>
    </html>
  `);
});

app.get('/status', (req, res) => {
  const { id } = req.query;
  if (sessions[id]) {
    res.json({ status: sessions[id].status });
  } else {
    res.status(404).send("Session not found.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
