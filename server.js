require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const app = express();

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

app.get('/respond', (req, res) => {
    const { id } = req.query;
    if (!sessions[id]) {
        return res.status(404).send("Session not found.");
    }

    res.send(`
        <html>
        <body>
            <h1>Respond to ${sessions[id].name}</h1>
            <form action="/confirm" method="POST">
                <input type="hidden" name="id" value="${id}" />
                <button name="response" value="I'm on the way!">I'm on the way!</button><br><br>
                <button name="response" value="I'm unavailable, please send me an email to schedule a meeting.">I'm unavailable</button><br><br>
                <input type="text" name="custom" placeholder="Custom message" />
                <button type="submit">Send Custom Message</button>
            </form>
        </body>
        </html>
    `);
});

app.post('/confirm', (req, res) => {
    const { id, response, custom } = req.body;
    if (!sessions[id]) {
        return res.status(404).send("Session not found.");
    }

    const finalMessage = custom?.trim() || response || "I'm unavailable, please send me an email to schedule a meeting.";
    sessions[id].status = finalMessage;

    if (timeouts[id]) {
        clearTimeout(timeouts[id]);
        delete timeouts[id];
    }

    res.send(`<h2>Response recorded: ${finalMessage}</h2>`);
});

app.get('/waiting', (req, res) => {
    const { id } = req.query;
    const message = sessions[id]?.status || "Waiting...";
    res.send(`<h2>${message}</h2>`);
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
