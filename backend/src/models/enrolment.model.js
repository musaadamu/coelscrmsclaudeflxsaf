const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EnrolmentSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  courseOffering: { type: Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
  enrolmentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['REGISTERED', 'DROPPED', 'COMPLETED'], 
    default: 'REGISTERED' 
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Compound index to prevent duplicate enrollments
<<<<<<< HEAD
<<<<<<< HEAD
EnrolmentSchema.index({ student: 1, courseOffering: 1 }, { unique: true });
=======
=======
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
  EnrolmentSchema.index({ student: 1, courseOffering: 1 }, { unique: true });

  // Auditing
  try {
    const auditPlugin = require('../utils/auditPlugin')
    EnrolmentSchema.plugin(auditPlugin)
  } catch (e) {}
<<<<<<< HEAD
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f

module.exports = mongoose.model('Enrolment', EnrolmentSchema);
