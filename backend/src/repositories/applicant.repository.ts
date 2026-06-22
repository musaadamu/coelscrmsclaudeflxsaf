import Applicant from '../models/applicant.model';
import { AppError } from '../middleware/errorHandler';

export const applicantRepository = {
  async findById(id: string) {
    const applicant = await Applicant.findById(id)
      .populate('cycle')
      .populate('programme')
      .lean();
    if (!applicant) {
      throw new AppError(404, 'NOT_FOUND', 'Applicant not found');
    }
    return applicant;
  },

  async findByCycleId(cycleId: string, options = { page: 1, limit: 20, sort: { createdAt: -1 } as any }) {
    const skip = (options.page - 1) * options.limit;
    const applicants = await Applicant.find({ cycle: cycleId, isDeleted: false })
      .populate('cycle')
      .populate('programme')
      .sort(options.sort)
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Applicant.countDocuments({ cycle: cycleId, isDeleted: false });
    return { applicants, total };
  },

  async findAll(filter = {}, options = { page: 1, limit: 20, sort: { createdAt: -1 } as any }) {
    const skip = (options.page - 1) * options.limit;
    const applicants = await Applicant.find({ ...filter, isDeleted: false })
      .populate('cycle')
      .populate('programme')
      .sort(options.sort)
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Applicant.countDocuments({ ...filter, isDeleted: false });
    return { applicants, total };
  },

  async create(data: any) {
    const applicant = await Applicant.create(data);
    return this.findById(applicant._id.toString());
  },

  async updateById(id: string, data: any) {
    const applicant = await Applicant.findByIdAndUpdate(id, data, { new: true })
      .populate('cycle')
      .populate('programme')
      .lean();
    if (!applicant) {
      throw new AppError(404, 'NOT_FOUND', 'Applicant not found');
    }
    return applicant;
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },

  async findByStatus(status: string, cycleId?: string, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const filter: any = { status, isDeleted: false };
    if (cycleId) filter.cycle = cycleId;

    const applicants = await Applicant.find(filter)
      .populate('cycle')
      .populate('programme')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Applicant.countDocuments(filter);
    return { applicants, total };
  },

  async countByStatus(cycleId: string) {
    const statuses = ['APPLIED', 'SHORTLISTED', 'ADMITTED', 'REJECTED'];
    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await Applicant.countDocuments({ cycle: cycleId, status, isDeleted: false }),
      }))
    );
    return counts;
  },
};
