const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
};

// GET all events (with optional month/year filter)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.month && req.query.year) {
      const start = new Date(req.query.year, req.query.month - 1, 1);
      const end = new Date(req.query.year, req.query.month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
    if (req.query.degree) filter.degree = req.query.degree;

    const conditions = [];
    if (req.query.year && !req.query.month) {
      conditions.push({ $or: [{ year: Number(req.query.year) }, { year: { $exists: false } }] });
    }
    if (req.query.department) {
      conditions.push({ $or: [{ department: req.query.department }, { department: { $exists: false } }] });
    }
    if (conditions.length) filter.$and = conditions;

    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create event
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const event = new Event(req.body);
    const saved = await event.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update event
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Event not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE event
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
