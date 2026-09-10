const ApiKey = require('../models/ApiKey');
const RequestLog = require('../models/RequestLog');
const requestEmitter = require('../events/requestEmitter');

const RATE_LIMIT = 100; // requests
const WINDOW_MS = 60 * 60 * 1000; // per hour

async function checkApiKey(req, res, next) {
  const key = req.header('x-api-key');
  if (!key) return res.status(401).json({ error: 'API key required' });

  const apiKey = await ApiKey.findOne({ key });
  if (!apiKey) return res.status(401).json({ error: 'Invalid API key' });

  const windowStart = new Date(Date.now() - WINDOW_MS);
  const recentCount = await RequestLog.countDocuments({
    apiKey: key,
    timestamp: { $gte: windowStart },
  });

  if (recentCount >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }

  req.apiKey = key;
  requestEmitter.emit('request:logged', { apiKey: key, endpoint: req.originalUrl });

  next();
}

module.exports = checkApiKey;