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

const AdmissionCycleSchema = new Schema({
  session: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
  programme: { type: Schema.Types.ObjectId, ref: 'Programme', required: true, index: true },
  openDate: { type: Date, required: true },
  closeDate: { type: Date, required: true },
  slotsAvailable: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: false, index: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = mongoose.model('AdmissionCycle', AdmissionCycleSchema);
=======
AdmissionCycleSchema.plugin(auditPlugin);
module.exports = mongoose.model('AdmissionCycle', AdmissionCycleSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
AdmissionCycleSchema.plugin(auditPlugin);
module.exports = mongoose.model('AdmissionCycle', AdmissionCycleSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
