<<<<<<< HEAD
=======
const auditPlugin = require('../utils/auditPlugin');
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  title: { type: String, required: true, trim: true },
  creditUnits: { type: Number, required: true, min: 1 },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  level: { type: Number, enum: [100, 200, 300, 400, 500], required: true },
  type: { type: String, enum: ['COMPULSORY', 'ELECTIVE'], default: 'COMPULSORY' },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

<<<<<<< HEAD
module.exports = mongoose.model('Course', CourseSchema);
=======
CourseSchema.plugin(auditPlugin);
module.exports = mongoose.model('Course', CourseSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
