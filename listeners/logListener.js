const requestEmitter = require('../events/requestEmitter');
const RequestLog = require('../models/RequestLog');
const ApiKey = require('../models/ApiKey');

requestEmitter.on('request:logged', async ({ apiKey, endpoint }) => {
  try {
    await RequestLog.create({ apiKey, endpoint });
    await ApiKey.updateOne({ key: apiKey }, { $inc: { requestCount: 1 } });
  } catch (err) {
    console.error('Failed to log request:', err.message);
  }
});