const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DecisionSchema = new Schema({
  decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  decision: { type: String, enum: ['ADMIT', 'REJECT', 'DEFER'] },
  offerLetterUrl: { type: String },
  decidedAt: { type: Date }
}, { _id: false });

const ApplicantSchema = new Schema({
  cycle: { type: Schema.Types.ObjectId, ref: 'AdmissionCycle', required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  qualifications: { type: Schema.Types.Mixed, required: true },
  appliedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['APPLIED', 'SHORTLISTED', 'ADMITTED', 'REJECTED', 'WITHDRAWN'], 
    default: 'APPLIED' 
  },
  decision: DecisionSchema,
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Indexing
<<<<<<< HEAD
=======

// Auditing
try {
  const auditPlugin = require('../utils/auditPlugin')
  ApplicantSchema.plugin(auditPlugin)
} catch (e) {}
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
ApplicantSchema.index({ cycle: 1, status: 1 });
ApplicantSchema.index({ email: 1, cycle: 1 }, { unique: true });

module.exports = mongoose.model('Applicant', ApplicantSchema);
