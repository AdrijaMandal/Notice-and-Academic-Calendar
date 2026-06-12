const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const name = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${name}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const router = express.Router();

router.post('/', auth, upload.single('file'), (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin users can upload attachments.' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url, filename: req.file.originalname, mimeType: req.file.mimetype });
});

module.exports = router;
