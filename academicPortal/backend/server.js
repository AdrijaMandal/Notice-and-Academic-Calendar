const express = require('express');
const cors = require('cors');
const path = require('path');
const { URL } = require('url');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { connectDatabase } = require('./db');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/events', require('./routes/events'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Academic Portal API running' }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const MONGO_URI_FALLBACK = process.env.MONGO_URI_FALLBACK;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set. Please add your MongoDB Atlas connection string to backend/.env');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set. Please add JWT_SECRET to backend/.env');
  process.exit(1);
}

const atlasHost = new URL(MONGO_URI).hostname;
console.log('MongoDB Atlas host:', atlasHost);
console.log('Fallback URI configured:', Boolean(MONGO_URI_FALLBACK));

connectDatabase(MONGO_URI, MONGO_URI_FALLBACK)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  });
