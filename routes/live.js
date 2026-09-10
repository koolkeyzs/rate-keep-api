const express = require('express');
const requestEmitter = require('../events/requestEmitter');

const router = express.Router();

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = ({ apiKey, endpoint }) => {
    res.write(`data: ${JSON.stringify({ apiKey, endpoint, time: new Date() })}\n\n`);
  };

  requestEmitter.on('request:logged', sendEvent);

  req.on('close', () => {
    requestEmitter.off('request:logged', sendEvent);
    res.end();
  });
});

module.exports = router;