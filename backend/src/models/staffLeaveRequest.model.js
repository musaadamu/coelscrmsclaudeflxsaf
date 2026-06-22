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

const StaffLeaveRequestSchema = new Schema({
  staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
  leaveType: { type: String, required: true, trim: true }, // e.g. "Annual", "Maternity", "Sick"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING',
    index: true
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Staff', default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = mongoose.model('StaffLeaveRequest', StaffLeaveRequestSchema);
=======
StaffLeaveRequestSchema.plugin(auditPlugin);
module.exports = mongoose.model('StaffLeaveRequest', StaffLeaveRequestSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
StaffLeaveRequestSchema.plugin(auditPlugin);
module.exports = mongoose.model('StaffLeaveRequest', StaffLeaveRequestSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
