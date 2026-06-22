const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HostelAllocationSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  room: { type: Schema.Types.ObjectId, ref: 'HostelRoom', required: true },
  session: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
  bedSpace: { type: Number, required: true },
  payment: { type: Schema.Types.ObjectId, ref: 'Payment', default: null },
  allocatedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['BOOKED', 'CONFIRMED', 'VACATED', 'CANCELLED'], 
    default: 'BOOKED',
    index: true
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Index to prevent double allocation for the same student in the same session
HostelAllocationSchema.index({ student: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('HostelAllocation', HostelAllocationSchema);
