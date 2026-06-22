<<<<<<< HEAD
=======
const auditPlugin = require('../utils/auditPlugin');
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HostelSchema = new Schema({
  name: { type: String, required: true, trim: true },
  gender: { 
    type: String, 
    required: true, 
    enum: ['MALE', 'FEMALE', 'MIXED'] 
  },
  totalRooms: { type: Number, required: true, min: 0 },
  address: { type: String, trim: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

<<<<<<< HEAD
module.exports = mongoose.model('Hostel', HostelSchema);
=======
HostelSchema.plugin(auditPlugin);
module.exports = mongoose.model('Hostel', HostelSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
