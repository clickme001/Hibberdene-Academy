const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/calendar/events', async (req, res) => {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/secret', (req, res) => {
  res.json({ secret: process.env.CLIENT_SECRET });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
