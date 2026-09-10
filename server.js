const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
require('./listeners/logListener');

const keysRouter = require('./routes/keys');
const quoteRouter = require('./routes/quote');
const exportRouter = require('./routes/export.js');
const liveRouter = require('./routes/live');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => res.send('Rate-limited API is running 🚀'));
app.use('/api/keys', keysRouter);
app.use('/api/quote', quoteRouter);
app.use('/api/usage', exportRouter);
app.use('/api/usage/live', liveRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));