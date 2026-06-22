<<<<<<< HEAD
=======
const auditPlugin = require('../utils/auditPlugin');
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProgrammeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['NCE', 'DIPLOMA', 'PART_TIME_NCE', 'OTHER'] 
  },
  durationYears: { type: Number, required: true, min: 1 },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  affiliation: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

<<<<<<< HEAD
module.exports = mongoose.model('Programme', ProgrammeSchema);
=======
ProgrammeSchema.plugin(auditPlugin);
module.exports = mongoose.model('Programme', ProgrammeSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
