const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StaffSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  employeeId: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  rank: { type: String, required: true, trim: true }, // e.g. "Senior Lecturer"
  specialisation: { type: String, trim: true },
  employmentType: { 
    type: String, 
    enum: ['FULL_TIME', 'PART_TIME', 'ADJUNCT'], 
    default: 'FULL_TIME' 
  },
  joinedAt: { type: Date, required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);
<<<<<<< HEAD
=======

// Auditing
try {
  const auditPlugin = require('../utils/auditPlugin')
  StaffSchema.plugin(auditPlugin)
} catch (e) {}
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
