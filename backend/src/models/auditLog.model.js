const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuditLogSchema = new Schema({
  collectionName: { type: String, required: true },
  documentId: { type: Schema.Types.ObjectId, index: true },
  action: { 
    type: String, 
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'SCRATCH_CARD_FAIL', 'WEBHOOK_REJECTED'], 
    required: true 
  },
  oldValues: { type: Schema.Types.Mixed },
  newValues: { type: Schema.Types.Mixed },
  diff: { type: Schema.Types.Mixed },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }, // Enforced by general system instructions
  deletedAt: { type: Date, default: null }      // Capped collections do not support actual delete queries, but fields exist for schema uniformity
}, { 
  capped: { size: 104857600, max: 1000000 }, // Capped at 100MB (104,857,600 bytes)
  autoIndexId: false, // Performance optimize
  timestamps: false // Manual createdAt is used
});

// Indexes
AuditLogSchema.index({ collectionName: 1, documentId: 1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // TTL index 90 days

module.exports = mongoose.model('AuditLog', AuditLogSchema);
