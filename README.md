# Berry College Doorbell

This project includes a Berry College–branded static frontend and a secure Node.js backend that sends notifications to a Discord webhook.

## 📁 Folder Structure

- `frontend/`: Static HTML page hosted on GitHub Pages
- `backend/`: Node.js Express server hosted on Render

## 🚀 Deployment Instructions

### Frontend (GitHub Pages)

1. Push the `frontend/index.html` to your GitHub repo.
2. Go to **Settings → Pages**
3. Set source to `main` branch and `/root`
4. Your site will be live at `https://yourusername.github.io/berry-doorbell`

### Backend (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repo
3. Set `DISCORD_WEBHOOK_URL` as an environment variable
4. Deploy and get your public URL (e.g., `https://berry-doorbell.onrender.com`)
5. Update the frontend JavaScript to use this URL in the `fetch()` call

## ✅ Features

- Berry College branding
- Name input validation
- Secure webhook proxy
- Clickable response link in Discord
