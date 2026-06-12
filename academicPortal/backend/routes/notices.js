const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const auth = require('../middleware/auth');

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
};

// GET all notices (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.degree) filter.degree = req.query.degree;

    const conditions = [];
    if (req.query.year) {
      conditions.push({ $or: [{ year: Number(req.query.year) }, { year: { $exists: false } }] });
    }
    if (req.query.department) {
      conditions.push({ $or: [{ department: req.query.department }, { department: { $exists: false } }] });
    }
    if (conditions.length) filter.$and = conditions;

    const notices = await Notice.find(filter).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single notice
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create notice
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const notice = new Notice(req.body);
    const saved = await notice.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update notice
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Notice not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE notice
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Notice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
