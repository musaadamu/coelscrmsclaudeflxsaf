const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FacultySchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);
