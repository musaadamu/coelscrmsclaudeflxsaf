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

const DepartmentSchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
  hod: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

<<<<<<< HEAD
<<<<<<< HEAD
module.exports = mongoose.model('Department', DepartmentSchema);
=======
DepartmentSchema.plugin(auditPlugin);
module.exports = mongoose.model('Department', DepartmentSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
DepartmentSchema.plugin(auditPlugin);
module.exports = mongoose.model('Department', DepartmentSchema);

>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
