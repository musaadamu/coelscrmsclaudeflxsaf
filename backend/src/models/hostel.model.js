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

module.exports = mongoose.model('Hostel', HostelSchema);
