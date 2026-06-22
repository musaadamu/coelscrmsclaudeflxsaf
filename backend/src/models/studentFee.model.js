<<<<<<< HEAD
=======
const auditPlugin = require('../utils/auditPlugin');
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentFeeSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  feeStructure: { type: Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
  amountDueKobo: { type: Number, required: true, min: 0 },
  amountPaidKobo: { type: Number, default: 0, min: 0 },
  status: { 
    type: String, 
    enum: ['UNPAID', 'PARTIAL', 'PAID', 'WAIVED', 'OVERDUE'], 
    default: 'UNPAID',
    index: true
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for balance
StudentFeeSchema.virtual('balanceKobo').get(function() {
  return this.amountDueKobo - this.amountPaidKobo;
});

// Pre-save hook: auto-update status based on balance
StudentFeeSchema.pre('save', function(next) {
  if (this.status === 'WAIVED') return next();

  const balance = this.amountDueKobo - this.amountPaidKobo;
  if (balance <= 0) {
    this.status = 'PAID';
  } else if (this.amountPaidKobo > 0) {
    this.status = 'PARTIAL';
  } else {
    this.status = 'UNPAID';
  }
  next();
});

<<<<<<< HEAD
module.exports = mongoose.model('StudentFee', StudentFeeSchema);
=======
StudentFeeSchema.plugin(auditPlugin);
module.exports = mongoose.model('StudentFee', StudentFeeSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
