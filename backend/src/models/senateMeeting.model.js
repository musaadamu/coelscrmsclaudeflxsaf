const auditPlugin = require('../utils/auditPlugin');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SenateMeetingSchema = new Schema({
  session: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
  semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
  title: { type: String, required: true, trim: true },
  scheduledAt: { type: Date, required: true },
  venue: { type: String, required: true, trim: true },
  prayerDeadline: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['SCHEDULED', 'IN_PROGRESS', 'CONCLUDED', 'CANCELLED'], 
    default: 'SCHEDULED',
    index: true
  },
  minutesPdfUrl: { type: String, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

SenateMeetingSchema.plugin(auditPlugin);
module.exports = mongoose.model('SenateMeeting', SenateMeetingSchema);

