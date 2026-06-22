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

const SemesterSchema = new Schema({
  session: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
  name: { type: String, required: true, enum: ['FIRST', 'SECOND'] },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationOpen: { type: Boolean, default: false },
  addDropDeadline: { type: Date, required: true },
  isCurrent: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Enforce unique name per session
SemesterSchema.index({ session: 1, name: 1 }, { unique: true });

// Pre-save hook: ensure only one semester is marked as current globally
SemesterSchema.pre('save', async function(next) {
  if (this.isModified('isCurrent') && this.isCurrent === true) {
    try {
      await this.constructor.updateMany(
        { _id: { $ne: this._id } },
        { isCurrent: false }
      );
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = mongoose.model('Semester', SemesterSchema);
=======
SemesterSchema.plugin(auditPlugin);
module.exports = mongoose.model('Semester', SemesterSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
SemesterSchema.plugin(auditPlugin);
module.exports = mongoose.model('Semester', SemesterSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
