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

const FeeStructureSchema = new Schema({
  session: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
  programme: { type: Schema.Types.ObjectId, ref: 'Programme', default: null }, // Nullable if applies to all programmes
  level: { type: Number, default: null }, // Nullable if applies to all levels
  feeType: { type: String, required: true, trim: true }, // e.g. "Tuition", "Library", "Hostel"
  amountKobo: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for Naira
FeeStructureSchema.virtual('amountNaira').get(function() {
  return this.amountKobo / 100;
}).set(function(value) {
  this.amountKobo = Math.round(value * 100);
});

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = mongoose.model('FeeStructure', FeeStructureSchema);
=======
FeeStructureSchema.plugin(auditPlugin);
module.exports = mongoose.model('FeeStructure', FeeStructureSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
FeeStructureSchema.plugin(auditPlugin);
module.exports = mongoose.model('FeeStructure', FeeStructureSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
