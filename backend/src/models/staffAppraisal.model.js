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

const StaffAppraisalSchema = new Schema({
  staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
  session: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
  performanceScore: { type: Number, min: 0, max: 100, required: true },
  notes: { type: String, trim: true },
  appraisedBy: { type: Schema.Types.ObjectId, ref: 'Staff', default: null },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED'], 
    default: 'DRAFT',
    index: true
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = mongoose.model('StaffAppraisal', StaffAppraisalSchema);
=======
StaffAppraisalSchema.plugin(auditPlugin);
module.exports = mongoose.model('StaffAppraisal', StaffAppraisalSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
StaffAppraisalSchema.plugin(auditPlugin);
module.exports = mongoose.model('StaffAppraisal', StaffAppraisalSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
