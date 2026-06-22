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

const LearningResourceSchema = new Schema({
  module: { type: Schema.Types.ObjectId, ref: 'LearningModule', required: true },
  title: { type: String, required: true, trim: true },
  resourceType: { 
    type: String, 
    enum: ['VIDEO', 'PDF', 'AUDIO', 'LINK'], 
    required: true 
  },
  fileUrl: { type: String, required: true, trim: true },
  durationSeconds: { type: Number, default: null }, // Nullable for non-media types
  isOfflineAvailable: { type: Boolean, default: false },
  orderIndex: { type: Number, required: true, min: 0 },
  fileSizeBytes: { type: Number, default: null }, // Nullable
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Compound index for resource sorting
LearningResourceSchema.index({ module: 1, orderIndex: 1 });

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = mongoose.model('LearningResource', LearningResourceSchema);
=======
LearningResourceSchema.plugin(auditPlugin);
module.exports = mongoose.model('LearningResource', LearningResourceSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
LearningResourceSchema.plugin(auditPlugin);
module.exports = mongoose.model('LearningResource', LearningResourceSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
