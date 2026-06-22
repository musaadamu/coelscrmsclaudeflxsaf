const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TranscriptRequestSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  destinationInstitution: { type: String, required: true, trim: true },
  destinationAddress: { type: String, required: true, trim: true },
  destinationEmail: { type: String, required: true, lowercase: true, trim: true },
  copies: { type: Number, default: 1, min: 1 },
  payment: { type: Schema.Types.ObjectId, ref: 'Payment', default: null },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'APPROVED', 'DISPATCHED', 'DELIVERED'], 
    default: 'PENDING',
    index: true
  },
  requestedAt: { type: Date, default: Date.now },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  processedAt: { type: Date, default: null },
  verificationToken: { type: String, required: true, unique: true, index: true },
  pdfUrl: { type: String, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('TranscriptRequest', TranscriptRequestSchema);

// Auditing
try {
  const auditPlugin = require('../utils/auditPlugin')
  TranscriptRequestSchema.plugin(auditPlugin)
} catch (e) {}
