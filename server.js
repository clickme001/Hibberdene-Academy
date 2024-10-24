const express = require('express');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

app.get('/api/credentials', (req, res) => {
  const apiKey = process.env.API_KEY;
  const calendarId = process.env.CALENDAR_ID;

  if (!apiKey || !calendarId) {
    return res.status(500).json({ error: 'API key or Calendar ID not set in environment variables' });
  }

  res.json({ apiKey, calendarId });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
