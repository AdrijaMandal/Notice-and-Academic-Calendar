const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notice = require('../models/Notice');
const Event = require('../models/Event');

function addTargetFilters(filter, user) {
  if (user.role === 'student') {
    filter.degree = user.degree;
    const conditions = [];
    if (user.year != null) {
      conditions.push({ $or: [{ year: Number(user.year) }, { year: { $exists: false } }] });
    }
    if (user.department) {
      conditions.push({ $or: [{ department: user.department }, { department: { $exists: false } }] });
    }
    if (conditions.length) filter.$and = conditions;
  }
}

router.get('/', auth, async (req, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : null;
    const limit = Number(req.query.limit) || 10;

    const noticeFilter = {};
    const eventFilter = {};
    if (since) {
      noticeFilter.createdAt = { $gt: since };
      eventFilter.createdAt = { $gt: since };
    }
    addTargetFilters(noticeFilter, req.user);
    addTargetFilters(eventFilter, req.user);

    const [notices, events] = await Promise.all([
      Notice.find(noticeFilter).sort({ createdAt: -1 }).limit(limit),
      Event.find(eventFilter).sort({ createdAt: -1 }).limit(limit),
    ]);

    const notifications = [
      ...notices.map((notice) => ({
        id: notice._id,
        type: 'notice',
        title: notice.title,
        category: notice.category,
        createdAt: notice.createdAt,
        detail: notice.content,
      })),
      ...events.map((event) => ({
        id: event._id,
        type: 'event',
        title: event.title,
        category: event.type,
        createdAt: event.createdAt,
        detail: event.description,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.json({ notifications, serverTime: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
