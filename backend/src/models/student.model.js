const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  matricNo: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
  dob: { type: Date, required: true },
  stateOfOrigin: { type: String, required: true, trim: true },
  lga: { type: String, required: true, trim: true },
  nationality: { type: String, default: 'Nigerian', trim: true },
  phone: { type: String, trim: true },
  photoUrl: { type: String, trim: true },
  programme: { type: Schema.Types.ObjectId, ref: 'Programme', required: true },
  currentLevel: { type: Number, enum: [100, 200, 300, 400, 500], required: true },
  admissionYear: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'WITHDRAWN', 'GRADUATED', 'SUSPENDED', 'DEFERRED'], 
    default: 'ACTIVE',
    index: true
  },
  guardian: {
    name: String,
    relationship: String,
    phone: String,
    email: String,
    address: String
  },
  documents: [{
    docType: String,
    fileUrl: String,
    verified: { type: Boolean, default: false }
  }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Compound and field indexes
StudentSchema.index({ programme: 1, currentLevel: 1 });

<<<<<<< HEAD
=======
// Auditing plugin
try {
  const auditPlugin = require('../utils/auditPlugin')
  StudentSchema.plugin(auditPlugin)
} catch (e) {
  // ignore if plugin not available in test env
}

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
module.exports = mongoose.model('Student', StudentSchema);
