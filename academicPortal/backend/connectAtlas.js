const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { connectDatabase } = require('./db');
const { URL } = require('url');

const { MONGO_URI, MONGO_URI_FALLBACK, JWT_SECRET } = process.env;
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set in backend/.env');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in backend/.env');
  process.exit(1);
}

async function testConnection() {
  try {
    const atlasHost = new URL(MONGO_URI).hostname;
    console.log('Connecting to MongoDB Atlas host:', atlasHost);
    console.log('Using fallback URI:', Boolean(MONGO_URI_FALLBACK));
    await connectDatabase(MONGO_URI, MONGO_URI_FALLBACK);

    console.log('✅ Connected to MongoDB Atlas');
    const db = require('mongoose').connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map((c) => c.name));

    const stats = await db.stats();
    console.log('Database name:', stats.db);
    console.log('Collections count:', stats.collections);
    console.log('Objects count:', stats.objects);
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err.stack || err);
    process.exit(1);
  } finally {
    await require('mongoose').disconnect();
    console.log('Disconnected.');
  }
}

testConnection();
