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
    // Academic targeting
    degree: { type: String, enum: ['BTech', 'MTech'], trim: true },
    year: { type: Number },
    department: { type: String, trim: true },
    isImportant: { type: Boolean, default: false },
    postedBy: { type: String, default: 'Administration' },
    classTiming: { type: String, trim: true },
    isCancelled: { type: Boolean, default: false },
    attachmentUrl: { type: String },
    attachmentName: { type: String },
    attachmentType: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
