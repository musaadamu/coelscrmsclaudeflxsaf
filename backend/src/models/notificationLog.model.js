const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationLogSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  channel: { 
    type: String, 
    enum: ['EMAIL', 'SMS'], 
    required: true 
  },
  templateName: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  status: { 
    type: String, 
    enum: ['PENDING', 'SENT', 'FAILED', 'BOUNCED'], 
    default: 'PENDING',
    index: true
  },
  providerRef: { type: String, trim: true },
  sentAt: { type: Date },
  errorMessage: { type: String, trim: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// TTL index on createdAt: expire after 90 days (7,776,000 seconds)
NotificationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);
