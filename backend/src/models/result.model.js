const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResultSchema = new Schema({
  enrolment: { type: Schema.Types.ObjectId, ref: 'Enrolment', required: true, unique: true, index: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
  caScore: { type: Number, min: 0, max: 40, default: 0 },
  examScore: { type: Number, min: 0, max: 60, default: 0 },
  total: { type: Number },
  grade: { type: String },
  gradePoint: { type: Number },
  isCarryOver: { type: Boolean, default: false },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'Staff' },
  submittedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Staff' },
  approvedAt: { type: Date },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED'], 
    default: 'DRAFT',
    index: true
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Compound indexes
<<<<<<< HEAD
ResultSchema.index({ student: 1, semester: 1 });

=======

// Auditing
try {
  const auditPlugin = require('../utils/auditPlugin')
  ResultSchema.plugin(auditPlugin)
} catch (e) {}

module.exports = mongoose.model('Result', ResultSchema)
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
// Pre-save hook: grade calculation
ResultSchema.pre('save', function(next) {
  const ca = this.caScore || 0;
  const exam = this.examScore || 0;
  this.total = ca + exam;

  if (this.total >= 70) {
    this.grade = 'A';
    this.gradePoint = 5;
  } else if (this.total >= 60) {
    this.grade = 'B';
    this.gradePoint = 4;
  } else if (this.total >= 50) {
    this.grade = 'C';
    this.gradePoint = 3;
  } else if (this.total >= 45) {
    this.grade = 'D';
    this.gradePoint = 2;
  } else if (this.total >= 40) {
    this.grade = 'E';
    this.gradePoint = 1;
  } else {
    this.grade = 'F';
    this.gradePoint = 0;
  }

  next();
});

module.exports = mongoose.model('Result', ResultSchema);
