const auditPlugin = require('../utils/auditPlugin');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, trim: true },
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },
  roles: [{ 
    type: String, 
    enum: ['student','lecturer','hod','registrar','bursary','hostel_officer','senate_member','vc','super_admin'] 
  }],
  permissions: [String],  // e.g. ['senate:participate']
  lastLoginAt: Date,
  loginAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Check if account is locked
UserSchema.methods.isAccountLocked = function() {
  return !!(this.lockedUntil && this.lockedUntil > new Date());
};

// Compare password
UserSchema.methods.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.plugin(auditPlugin);
module.exports = mongoose.model('User', UserSchema);

