import Staff from '../models/staff.model';

export const staffRepository = {
  async findById(id: string) {
    return await Staff.findById(id)
      .populate('user')
      .populate('department')
      .lean();
  },

  async findByDepartment(departmentId: string, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const staff = await Staff.find({ department: departmentId, isDeleted: false })
      .populate('user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Staff.countDocuments({ department: departmentId, isDeleted: false });
    return { staff, total };
  },

  async findAll(filter = {}, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const staff = await Staff.find({ ...filter, isDeleted: false })
      .populate('user')
      .populate('department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Staff.countDocuments({ ...filter, isDeleted: false });
    return { staff, total };
  },

  async create(data: any) {
    return await Staff.create(data);
  },

  async updateById(id: string, data: any) {
    return await Staff.findByIdAndUpdate(id, data, { new: true })
      .populate('user')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};
