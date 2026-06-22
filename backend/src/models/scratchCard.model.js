const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScratchCardSchema = new Schema({
  serial: { type: String, required: true, unique: true, length: 16, index: true },
  pinHash: { type: String, required: true },
  denominationKobo: { type: Number, required: true, min: 0 },
  batchRef: { type: String, required: true, index: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  generatedAt: { type: Date, default: Date.now },
  usedBy: { type: Schema.Types.ObjectId, ref: 'Student', default: null },
  usedAt: { type: Date, default: null },
  payment: { type: Schema.Types.ObjectId, ref: 'Payment', default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for Naira
ScratchCardSchema.virtual('denominationNaira').get(function() {
  return this.denominationKobo / 100;
}).set(function(value) {
  this.denominationKobo = Math.round(value * 100);
});

<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
// Auditing
try {
  const auditPlugin = require('../utils/auditPlugin')
  ScratchCardSchema.plugin(auditPlugin)
} catch (e) {}

<<<<<<< HEAD
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
module.exports = mongoose.model('ScratchCard', ScratchCardSchema);
