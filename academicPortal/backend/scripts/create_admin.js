#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node create_admin.js "Full Name" email@example.com password');
    process.exit(1);
  }

  const [name, emailRaw, password] = args;
  const email = String(emailRaw).toLowerCase();

  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academicPortal';

  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const User = require(path.join(__dirname, '..', 'models', 'User'));

    const hash = await bcrypt.hash(password, 10);

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('Existing admin found. Updating credentials...');
      existing.name = name;
      existing.email = email;
      existing.password = hash;
      await existing.save();
      console.log('Admin account updated:', existing.email);
    } else {
      const admin = new User({ name, email, password: hash, role: 'admin' });
      await admin.save();
      console.log('Admin account created:', admin.email);
    }

    const final = await User.findOne({ role: 'admin' }).select('-password').lean();
    console.log('Current admin record:', final);
    process.exit(0);
  } catch (err) {
    console.error('Error creating/updating admin:', err.message || err);
    process.exit(2);
  }
}

main();
