import Enrolment from '../models/enrolment.model';
import { AppError } from '../middleware/errorHandler';

export const enrolmentRepository = {
  async findById(id: string) {
    return await Enrolment.findById(id)
      .populate('student')
      .populate('courseOffering')
      .populate('semester')
      .lean();
  },

  async findByStudentAndSemester(studentId: string, semesterId: string, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const enrolments = await Enrolment.find({
      student: studentId,
      semester: semesterId,
      status: { $ne: 'DROPPED' },
      isDeleted: false,
    })
      .populate('courseOffering')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Enrolment.countDocuments({
      student: studentId,
      semester: semesterId,
      status: { $ne: 'DROPPED' },
      isDeleted: false,
    });
    return { enrolments, total };
  },

  async create(data: any) {
    return await Enrolment.create(data);
  },

  async createMany(enrolments: any[]) {
    return await Enrolment.insertMany(enrolments, { ordered: false });
  },

  async updateById(id: string, data: any) {
    return await Enrolment.findByIdAndUpdate(id, data, { new: true })
      .populate('student')
      .populate('courseOffering')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },

  async findByCourseOffering(offeringId: string) {
    return await Enrolment.find({
      courseOffering: offeringId,
      status: { $ne: 'DROPPED' },
      isDeleted: false,
    })
      .populate('student')
      .lean();
  },

  async countByStudent(studentId: string, semesterId: string) {
    return await Enrolment.countDocuments({
      student: studentId,
      semester: semesterId,
      status: { $ne: 'DROPPED' },
      isDeleted: false,
    });
  },
};
