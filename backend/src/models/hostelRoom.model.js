<<<<<<< HEAD
=======
const auditPlugin = require('../utils/auditPlugin');
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HostelRoomSchema = new Schema({
  hostel: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
  roomNumber: { type: String, required: true, trim: true },
  floor: { type: Number, default: 0 },
  capacity: { type: Number, required: true, min: 1 },
  roomType: { 
    type: String, 
    enum: ['SINGLE', 'DOUBLE', 'QUAD'], 
    required: true 
  },
  pricePerSessionKobo: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for Naira
HostelRoomSchema.virtual('pricePerSessionNaira').get(function() {
  return this.pricePerSessionKobo / 100;
}).set(function(value) {
  this.pricePerSessionKobo = Math.round(value * 100);
});

<<<<<<< HEAD
module.exports = mongoose.model('HostelRoom', HostelRoomSchema);
=======
HostelRoomSchema.plugin(auditPlugin);
module.exports = mongoose.model('HostelRoom', HostelRoomSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
