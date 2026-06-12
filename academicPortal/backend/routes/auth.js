const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

function createToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, degree: user.degree, year: user.year, department: user.department },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, degree, year, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const normalizedRole = role === 'faculty' ? 'faculty' : 'student';
    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin account cannot be created through registration. Contact the site administrator.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: normalizedRole,
      degree: normalizedRole === 'student' ? degree : undefined,
      year: normalizedRole === 'student' ? year : undefined,
      department: normalizedRole === 'student' ? department : undefined,
    });
    await newUser.save();

    const token = createToken(newUser);
    res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        degree: newUser.degree,
        year: newUser.year,
        department: newUser.department,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createToken(user);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        degree: user.degree,
        year: user.year,
        department: user.department,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { degree, year, department } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { degree, year, department },
      { new: true }
    );
    const token = createToken(user);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        degree: user.degree,
        year: user.year,
        department: user.department,
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
