const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseOfferingSchema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
  lecturer: { type: Schema.Types.ObjectId, ref: 'Staff', default: null },
  maxStudents: { type: Number, default: 100 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Compound unique index for course per semester
CourseOfferingSchema.index({ course: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('CourseOffering', CourseOfferingSchema);
