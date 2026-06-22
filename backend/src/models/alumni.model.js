const auditPlugin = require('../utils/auditPlugin');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AlumniSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, unique: true, index: true },
  graduationSession: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
  nyscCallupNo: { type: String, trim: true },
  nyscBatch: { type: String, trim: true },
  currentEmployer: { type: String, trim: true },
  currentRole: { type: String, trim: true },
  linkedinUrl: { type: String, trim: true },
  verificationToken: { type: String, unique: true, required: true, index: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

AlumniSchema.plugin(auditPlugin);
module.exports = mongoose.model('Alumni', AlumniSchema);

