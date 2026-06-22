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

const ReportSnapshotSchema = new Schema({
  reportType: { 
    type: String, 
    enum: ['NCCE_ENROLMENT', 'NUC_ACCREDITATION', 'NBTE_STATS', 'NYSC_LIST', 'PAYMENT_SUMMARY', 'RESULT_SUMMARY'], 
    required: true 
  },
  session: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
  programme: { type: Schema.Types.ObjectId, ref: 'Programme', default: null }, // Nullable
  payload: { type: Schema.Types.Mixed, required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  generatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Compound index
ReportSnapshotSchema.index({ reportType: 1, session: 1 });

// TTL index on expiresAt (expires immediately when expiresAt is reached)
ReportSnapshotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = mongoose.model('ReportSnapshot', ReportSnapshotSchema);
=======
ReportSnapshotSchema.plugin(auditPlugin);
module.exports = mongoose.model('ReportSnapshot', ReportSnapshotSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
ReportSnapshotSchema.plugin(auditPlugin);
module.exports = mongoose.model('ReportSnapshot', ReportSnapshotSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
