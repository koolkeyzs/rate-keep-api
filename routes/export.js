const express = require('express');
const { Transform } = require('stream');
const RequestLog = require('../models/RequestLog');

const router = express.Router();

router.get('/:key/csv', async (req, res) => {
  const { key } = req.params;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="usage-${key}.csv"`);

  
  res.write('timestamp,endpoint\n');

  // Transform stream: converts each MongoDB doc into a CSV line
  const csvTransform = new Transform({
    objectMode: true, // we're passing JS objects in, not raw buffers
    transform(doc, encoding, callback) {
      const line = `${doc.timestamp.toISOString()},${doc.endpoint}\n`;
      callback(null, line);
    },
  });

  // MongoDB cursor — reads documents one at a time instead of loading all into memory
  const cursor = RequestLog.find({ apiKey: key }).sort({ timestamp: -1 }).cursor();

  cursor.pipe(csvTransform).pipe(res);

  cursor.on('error', (err) => {
    console.error('Cursor error:', err);
    res.status(500).end();
  });
});

module.exports = router;