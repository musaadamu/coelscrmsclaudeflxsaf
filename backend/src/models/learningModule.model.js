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

const LearningModuleSchema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  orderIndex: { type: Number, required: true, min: 0 },
  isPublished: { type: Boolean, default: false, index: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Compound index for module sorting
LearningModuleSchema.index({ course: 1, orderIndex: 1 });

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = mongoose.model('LearningModule', LearningModuleSchema);
=======
LearningModuleSchema.plugin(auditPlugin);
module.exports = mongoose.model('LearningModule', LearningModuleSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
LearningModuleSchema.plugin(auditPlugin);
module.exports = mongoose.model('LearningModule', LearningModuleSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
