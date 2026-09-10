const express = require('express');
const { nanoid } = require('nanoid');
const ApiKey = require('../models/ApiKey');
const RequestLog = require('../models/RequestLog');

const router = express.Router();

router.post('/', async (req, res) => {
  const { label } = req.body;
  if (!label) return res.status(400).json({ error: 'Label required' });

  const key = nanoid(24);
  const apiKey = await ApiKey.create({ key, label });
  res.status(201).json(apiKey);
});

router.get('/', async (req, res) => {
  const keys = await ApiKey.find().sort({ createdAt: -1 });
  res.json(keys);
});

router.get('/:key/usage', async (req, res) => {
  const logs = await RequestLog.find({ apiKey: req.params.key })
    .sort({ timestamp: -1 })
    .limit(100);
  res.json(logs);
});

module.exports = router;