<<<<<<< HEAD
=======
const auditPlugin = require('../utils/auditPlugin');
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AcademicSessionSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true, index: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isCurrent: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Pre-save hook: ensure only one session is marked as current
AcademicSessionSchema.pre('save', async function(next) {
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
module.exports = mongoose.model('AcademicSession', AcademicSessionSchema);
=======
AcademicSessionSchema.plugin(auditPlugin);
module.exports = mongoose.model('AcademicSession', AcademicSessionSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
