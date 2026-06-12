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
    degree: { type: String, enum: ['BTech', 'MTech'], trim: true },
    year: { type: Number },
    department: { type: String, trim: true },
    classTiming: { type: String, trim: true },
    isCancelled: { type: Boolean, default: false },
    attachmentUrl: { type: String },
    attachmentName: { type: String },
    attachmentType: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
