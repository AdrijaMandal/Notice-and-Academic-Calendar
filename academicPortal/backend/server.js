const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { connectDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const uploadsPath = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(uploadsPath));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/events', require('./routes/events'));
app.use('/api/uploads', require('./routes/uploads'));

app.get('/', (req, res) => res.json({ message: 'Academic Portal API running' }));

// Connect to MongoDB and start server
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.ATLAS_URI || null;
const MONGO_URI_FALLBACK = process.env.MONGO_URI_FALLBACK || null;
let JWT_SECRET = process.env.JWT_SECRET;

const isProd = process.env.NODE_ENV === 'production';

if (!MONGO_URI && isProd) {
  console.error('ERROR: MONGO_URI is not set. In production you must set a real MongoDB connection string.');
  process.exit(1);
}

if (!JWT_SECRET) {
  if (isProd) {
    console.error('ERROR: JWT_SECRET is not set. In production you must set JWT_SECRET.');
    process.exit(1);
  }
  JWT_SECRET = 'dev_jwt_secret';
  console.warn('JWT_SECRET not set — using default development secret. Do not use in production.');
}

console.log('PORT:', PORT);

async function ensureDefaultAdmin() {
  const { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_NAME } = process.env;
  if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) return;

  const User = require('./models/User');
  const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL.toLowerCase() });
  if (!existingAdmin) {
    const adminUser = new User({
      name: DEFAULT_ADMIN_NAME || 'Academic Portal Admin',
      email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
      password: DEFAULT_ADMIN_PASSWORD,
      role: 'admin',
    });
    await adminUser.save();
    console.log(`Default admin account created: ${DEFAULT_ADMIN_EMAIL}`);
  }
}

connectDatabase(MONGO_URI, MONGO_URI_FALLBACK)
  .then(async () => {
    console.log('MongoDB connected');
    await ensureDefaultAdmin();
    const server = app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the process using it or set PORT to a free port.`);
      } else {
        console.error('Server error:', err.message || err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  });
