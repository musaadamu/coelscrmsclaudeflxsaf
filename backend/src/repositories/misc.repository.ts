import ReportSnapshot from '../models/reportSnapshot.model';
import Alumni from '../models/alumni.model';
import StaffAppraisal from '../models/staffAppraisal.model';
import StaffLeaveRequest from '../models/staffLeaveRequest.model';

export const reportRepository = {
  async findById(id: string) {
    return await ReportSnapshot.findById(id).lean();
  },

  async findByType(reportType: string) {
    return await ReportSnapshot.findOne({ reportType, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
  },

  async create(data: any) {
    return await ReportSnapshot.create(data);
  },

  async updateById(id: string, data: any) {
    return await ReportSnapshot.findByIdAndUpdate(id, data, { new: true }).lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const alumniRepository = {
  async findById(id: string) {
    return await Alumni.findById(id)
      .populate('student')
      .populate('programme')
      .lean();
  },

  async findByToken(token: string) {
    return await Alumni.findOne({ verificationToken: token, isDeleted: false })
      .populate('student')
      .populate('programme')
      .lean();
  },

  async findAll(options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const alumni = await Alumni.find({ isDeleted: false })
      .populate('student')
      .populate('programme')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Alumni.countDocuments({ isDeleted: false });
    return { alumni, total };
  },

  async create(data: any) {
    return await Alumni.create(data);
  },

  async updateById(id: string, data: any) {
    return await Alumni.findByIdAndUpdate(id, data, { new: true })
      .populate('student')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const staffAppraisalRepository = {
  async findById(id: string) {
    return await StaffAppraisal.findById(id)
      .populate('staff')
      .populate('appraiser')
      .lean();
  },

  async findByStaff(staffId: string, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const appraisals = await StaffAppraisal.find({ staff: staffId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await StaffAppraisal.countDocuments({ staff: staffId, isDeleted: false });
    return { appraisals, total };
  },

  async create(data: any) {
    return await StaffAppraisal.create(data);
  },

  async updateById(id: string, data: any) {
    return await StaffAppraisal.findByIdAndUpdate(id, data, { new: true })
      .populate('staff')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const staffLeaveRequestRepository = {
  async findById(id: string) {
    return await StaffLeaveRequest.findById(id)
      .populate('staff')
      .populate('approvedBy')
      .lean();
  },

  async findByStaff(staffId: string, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const requests = await StaffLeaveRequest.find({ staff: staffId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await StaffLeaveRequest.countDocuments({ staff: staffId, isDeleted: false });
    return { requests, total };
  },

  async create(data: any) {
    return await StaffLeaveRequest.create(data);
  },

  async updateById(id: string, data: any) {
    return await StaffLeaveRequest.findByIdAndUpdate(id, data, { new: true })
      .populate('staff')
      .lean();
  },

  async findByStatus(status: string) {
    return await StaffLeaveRequest.find({ status, isDeleted: false })
      .populate('staff')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};
