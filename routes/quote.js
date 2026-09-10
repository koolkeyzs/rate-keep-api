const express = require('express');
const checkApiKey = require('../middleware/checkApiKey');

const router = express.Router();

const quotes = [
  "Code is like humor. When you have to explain it, it's bad.",
  "First, solve the problem. Then, write the code.",
  "Simplicity is the soul of efficiency.",
  "Make it work, make it right, make it fast.",
];

router.get('/', checkApiKey, (req, res) => {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote });
});

module.exports = router;