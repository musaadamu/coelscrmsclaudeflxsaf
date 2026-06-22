const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SenateResultSheetSchema = new Schema({
  meeting: { type: Schema.Types.ObjectId, ref: 'SenateMeeting', required: true },
  programme: { type: Schema.Types.ObjectId, ref: 'Programme', required: true },
  semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
  status: { 
    type: String, 
    enum: ['DRAFT', 'PRESENTED', 'APPROVED'], 
    default: 'DRAFT',
    index: true
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Compound unique index on meeting and programme
SenateResultSheetSchema.index({ meeting: 1, programme: 1 }, { unique: true });

module.exports = mongoose.model('SenateResultSheet', SenateResultSheetSchema);
