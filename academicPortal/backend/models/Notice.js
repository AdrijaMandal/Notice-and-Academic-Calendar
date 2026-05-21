const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['General', 'Exam', 'Holiday', 'Event', 'Urgent'],
      default: 'General',
    },
    isImportant: { type: Boolean, default: false },
    postedBy: { type: String, default: 'Administration' },
    attachmentUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
