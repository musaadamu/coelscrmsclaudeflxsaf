import AdmissionCycle from '../models/admissionCycle.model';
import { AppError } from '../middleware/errorHandler';

export const admissionCycleRepository = {
  async findById(id: string) {
    const cycle = await AdmissionCycle.findById(id)
      .populate('programme')
      .lean();
    if (!cycle) {
      throw new AppError(404, 'NOT_FOUND', 'Admission cycle not found');
    }
    return cycle;
  },

  async findAll(filter = {}, options = { page: 1, limit: 20, sort: { createdAt: -1 } as any }) {
    const skip = (options.page - 1) * options.limit;
    const cycles = await AdmissionCycle.find(filter)
      .populate('programme')
      .sort(options.sort)
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await AdmissionCycle.countDocuments(filter);
    return { cycles, total };
  },

  async create(data: any) {
    const cycle = await AdmissionCycle.create(data);
    return this.findById(cycle._id.toString());
  },

  async updateById(id: string, data: any) {
    const cycle = await AdmissionCycle.findByIdAndUpdate(id, data, { new: true })
      .populate('programme')
      .lean();
    if (!cycle) {
      throw new AppError(404, 'NOT_FOUND', 'Admission cycle not found');
    }
    return cycle;
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },

  async findByStatus(status: string, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const cycles = await AdmissionCycle.find({ status, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await AdmissionCycle.countDocuments({ status, isDeleted: false });
    return { cycles, total };
  },
};
