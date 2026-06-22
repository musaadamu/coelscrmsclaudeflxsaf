const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReceiptSchema = new Schema({
  receiptNo: { type: String, unique: true, sparse: true },
  issuedAt: { type: Date },
  pdfUrl: { type: String }
}, { _id: false });

const PaymentSchema = new Schema({
  studentFee: { type: Schema.Types.ObjectId, ref: 'StudentFee', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  amountKobo: { type: Number, required: true, min: 0 },
  paymentMethod: { 
    type: String, 
    enum: ['CARD', 'BANK_TRANSFER', 'SCRATCH_CARD', 'USSD'], 
    required: true 
  },
  reference: { type: String, required: true, unique: true, index: true },
  gatewayReference: { type: String },
  gatewayResponse: { type: Schema.Types.Mixed },
  status: { 
    type: String, 
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REVERSED'], 
    default: 'PENDING',
    index: true
  },
  paidAt: { type: Date },
  receipt: ReceiptSchema,
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for Naira
PaymentSchema.virtual('amountNaira').get(function() {
  return this.amountKobo / 100;
}).set(function(value) {
  this.amountKobo = Math.round(value * 100);
});

// Compound index
PaymentSchema.index({ student: 1, status: 1 });
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
// Auditing plugin
try {
  const auditPlugin = require('../utils/auditPlugin')
  PaymentSchema.plugin(auditPlugin)
} catch (e) {}
<<<<<<< HEAD
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f

module.exports = mongoose.model('Payment', PaymentSchema);
