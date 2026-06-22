import Payment from '../models/payment.model';
import { AppError } from '../middleware/errorHandler';

export const paymentRepository = {
  async findById(id: string) {
    return await Payment.findById(id)
      .populate('student')
      .populate('studentFee')
      .lean();
  },

  async findByReference(reference: string) {
    return await Payment.findOne({ reference })
      .populate('student')
      .populate('studentFee')
      .lean();
  },

  async findByStudent(studentId: string, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const payments = await Payment.find({ student: studentId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Payment.countDocuments({ student: studentId, isDeleted: false });
    return { payments, total };
  },

  async create(data: any) {
    return await Payment.create(data);
  },

  async updateById(id: string, data: any) {
    return await Payment.findByIdAndUpdate(id, data, { new: true })
      .populate('student')
      .lean();
  },

  async updateByReference(reference: string, data: any) {
    return await Payment.findOneAndUpdate({ reference }, data, { new: true })
      .populate('student')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },

  async findByStatus(status: string, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const payments = await Payment.find({ status, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Payment.countDocuments({ status, isDeleted: false });
    return { payments, total };
  },
};
