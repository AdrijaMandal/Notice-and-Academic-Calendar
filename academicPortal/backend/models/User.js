const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
    degree: { type: String, enum: ['BTech', 'MTech'], trim: true },
    year: { type: Number },
    department: { type: String, trim: true },
  },
  { timestamps: true }
);

// Ensure only a single document can have role: 'admin'
// This creates a unique partial index on the `role` field when role === 'admin'.
// If there is already more than one admin in the DB, index creation will fail
// until the data is corrected. This is a defensive database-level guard.
userSchema.index({ role: 1 }, { unique: true, partialFilterExpression: { role: 'admin' } });

// Prevent updates that try to set another user to admin via findOneAndUpdate
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() || {};
  const roleToSet = update.role || (update.$set && update.$set.role);
  if (roleToSet === 'admin') {
    try {
      const User = mongoose.model('User');
      const existing = await User.findOne({ role: 'admin' }).lean();
      // If an existing admin exists and this update is not targeting that same document, block it
      const query = this.getQuery() || {};
      if (existing) {
        const existingId = existing._id.toString();
        const targetId = query._id ? query._id.toString() : null;
        if (!targetId || existingId !== targetId) {
          return next(new Error('Only one admin account is allowed in the system.'));
        }
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
