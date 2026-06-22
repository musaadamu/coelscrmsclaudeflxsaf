const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CgpaRecordSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
  semesterGpa: { type: Number, required: true },
  cumulativeGpa: { type: Number, required: true },
  unitsRegistered: { type: Number, required: true },
  unitsPassed: { type: Number, required: true },
  unitsFailed: { type: Number, required: true },
  computedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Ensure unique record per student per semester
CgpaRecordSchema.index({ student: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('CgpaRecord', CgpaRecordSchema);

// Auditing
try {
  const auditPlugin = require('../utils/auditPlugin')
  CgpaRecordSchema.plugin(auditPlugin)
} catch (e) {}
