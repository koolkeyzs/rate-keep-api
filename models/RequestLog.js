const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
  apiKey: { type: String, required: true },
  endpoint: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RequestLog', requestLogSchema);