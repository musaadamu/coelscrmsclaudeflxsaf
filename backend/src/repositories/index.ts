import User from '../models/user.model';
import Course from '../models/course.model';
import Department from '../models/department.model';
import Programme from '../models/programme.model';
import Semester from '../models/semester.model';
import AcademicSession from '../models/academicSession.model';
import AuditLog from '../models/auditLog.model';

export const userRepository = {
  async findById(id: string) {
    return await User.findById(id).lean();
  },

  async findByEmail(email: string) {
    return await User.findOne({ email, isDeleted: false }).lean();
  },

  async findAll(filter = {}, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const users = await User.find({ ...filter, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await User.countDocuments({ ...filter, isDeleted: false });
    return { users, total };
  },

  async create(data: any) {
    return await User.create(data);
  },

  async updateById(id: string, data: any) {
    return await User.findByIdAndUpdate(id, data, { new: true }).lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const courseRepository = {
  async findById(id: string) {
    return await Course.findById(id)
      .populate('department')
      .lean();
  },

  async findByCode(code: string) {
    return await Course.findOne({ code, isDeleted: false })
      .populate('department')
      .lean();
  },

  async findByDepartment(departmentId: string) {
    return await Course.find({ department: departmentId, isDeleted: false })
      .sort({ code: 1 })
      .lean();
  },

  async findAll(options = { page: 1, limit: 50 }) {
    const skip = (options.page - 1) * options.limit;
    const courses = await Course.find({ isDeleted: false })
      .populate('department')
      .sort({ code: 1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Course.countDocuments({ isDeleted: false });
    return { courses, total };
  },

  async create(data: any) {
    return await Course.create(data);
  },

  async updateById(id: string, data: any) {
    return await Course.findByIdAndUpdate(id, data, { new: true })
      .populate('department')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const departmentRepository = {
  async findById(id: string) {
    return await Department.findById(id).lean();
  },

  async findAll(options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const depts = await Department.find({ isDeleted: false })
      .sort({ name: 1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Department.countDocuments({ isDeleted: false });
    return { depts, total };
  },

  async create(data: any) {
    return await Department.create(data);
  },

  async updateById(id: string, data: any) {
    return await Department.findByIdAndUpdate(id, data, { new: true }).lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const programmeRepository = {
  async findById(id: string) {
    return await Programme.findById(id)
      .populate('department')
      .lean();
  },

  async findByCode(code: string) {
    return await Programme.findOne({ code, isDeleted: false })
      .populate('department')
      .lean();
  },

  async findAll(options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const programmes = await Programme.find({ isDeleted: false })
      .populate('department')
      .sort({ name: 1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Programme.countDocuments({ isDeleted: false });
    return { programmes, total };
  },

  async create(data: any) {
    return await Programme.create(data);
  },

  async updateById(id: string, data: any) {
    return await Programme.findByIdAndUpdate(id, data, { new: true })
      .populate('department')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const semesterRepository = {
  async findById(id: string) {
    return await Semester.findById(id)
      .populate('session')
      .lean();
  },

  async findBySession(sessionId: string) {
    return await Semester.find({ session: sessionId, isDeleted: false })
      .sort({ name: 1 })
      .lean();
  },

  async findCurrent() {
    return await Semester.findOne({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      isDeleted: false,
    })
      .populate('session')
      .lean();
  },

  async create(data: any) {
    return await Semester.create(data);
  },

  async updateById(id: string, data: any) {
    return await Semester.findByIdAndUpdate(id, data, { new: true })
      .populate('session')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const academicSessionRepository = {
  async findById(id: string) {
    return await AcademicSession.findById(id).lean();
  },

  async findCurrent() {
    return await AcademicSession.findOne({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      isDeleted: false,
    }).lean();
  },

  async findAll(options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const sessions = await AcademicSession.find({ isDeleted: false })
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await AcademicSession.countDocuments({ isDeleted: false });
    return { sessions, total };
  },

  async create(data: any) {
    return await AcademicSession.create(data);
  },

  async updateById(id: string, data: any) {
    return await AcademicSession.findByIdAndUpdate(id, data, { new: true }).lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const auditLogRepository = {
  async findById(id: string) {
    return await AuditLog.findById(id).lean();
  },

  async findAll(filter = {}, options = { page: 1, limit: 50 }) {
    const skip = (options.page - 1) * options.limit;
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await AuditLog.countDocuments(filter);
    return { logs, total };
  },

  async create(data: any) {
    return await AuditLog.create(data);
  },

  async findByUser(userId: string, options = { page: 1, limit: 50 }) {
    const skip = (options.page - 1) * options.limit;
    const logs = await AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await AuditLog.countDocuments({ userId });
    return { logs, total };
  },

  async findByAction(action: string, options = { page: 1, limit: 50 }) {
    const skip = (options.page - 1) * options.limit;
    const logs = await AuditLog.find({ action })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await AuditLog.countDocuments({ action });
    return { logs, total };
  },
};
