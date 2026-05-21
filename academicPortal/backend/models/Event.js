const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    date: { type: Date, required: true },
    endDate: { type: Date },
    type: {
      type: String,
      enum: ['Holiday', 'Exam', 'Festival', 'Academic', 'Sports', 'Cultural'],
      default: 'Academic',
    },
    location: { type: String },
    isAllDay: { type: Boolean, default: true },
    color: { type: String, default: '#4f46e5' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
