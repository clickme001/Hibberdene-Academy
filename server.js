const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/calendar/events', async (req, res) => {
  try {
    const accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('ACCESS_TOKEN is not set in the environment variables');
    }

    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
