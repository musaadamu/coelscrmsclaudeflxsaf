const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentProgressSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  resource: { type: Schema.Types.ObjectId, ref: 'LearningResource', required: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  progressPercent: { type: Number, min: 0, max: 100, default: 0 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Ensure unique record per student per learning resource
StudentProgressSchema.index({ student: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('StudentProgress', StudentProgressSchema);
