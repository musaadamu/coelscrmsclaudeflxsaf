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

const StudentProgressSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  resource: { type: Schema.Types.ObjectId, ref: 'LearningResource', required: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  progressPercent: { type: Number, min: 0, max: 100, default: 0 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Ensure unique record per student per learning resource
StudentProgressSchema.index({ student: 1, resource: 1 }, { unique: true });

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = mongoose.model('StudentProgress', StudentProgressSchema);
=======
StudentProgressSchema.plugin(auditPlugin);
module.exports = mongoose.model('StudentProgress', StudentProgressSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
StudentProgressSchema.plugin(auditPlugin);
module.exports = mongoose.model('StudentProgress', StudentProgressSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
