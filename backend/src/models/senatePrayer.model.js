<<<<<<< HEAD
<<<<<<< HEAD
=======
const auditPlugin = require('../utils/auditPlugin');
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
const auditPlugin = require('../utils/auditPlugin');
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SenatePrayerSchema = new Schema({
  meeting: { type: Schema.Types.ObjectId, ref: 'SenateMeeting', required: true },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'], 
    default: 'DRAFT' 
  },
  decision: { type: String, default: null },
  submittedAt: { type: Date, default: Date.now },
  attachments: [{
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  }],
  votes: [{
    votedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vote: { type: String, enum: ['FOR', 'AGAINST', 'ABSTAIN'], required: true },
    votedAt: { type: Date, default: Date.now }
  }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Indexing
SenatePrayerSchema.index({ meeting: 1, status: 1 });

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = mongoose.model('SenatePrayer', SenatePrayerSchema);
=======
SenatePrayerSchema.plugin(auditPlugin);
module.exports = mongoose.model('SenatePrayer', SenatePrayerSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
SenatePrayerSchema.plugin(auditPlugin);
module.exports = mongoose.model('SenatePrayer', SenatePrayerSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
