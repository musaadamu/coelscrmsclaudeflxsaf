import Result from '../models/result.model';
import { AppError } from '../middleware/errorHandler';

export const resultRepository = {
  async findById(id: string) {
    return await Result.findById(id)
      .populate('student')
      .populate({ path: 'enrolment', populate: 'courseOffering' })
      .populate('semester')
      .lean();
  },

  async findByStudent(studentId: string, options = { page: 1, limit: 50 }) {
    const skip = (options.page - 1) * options.limit;
    return await Result.find({ student: studentId, isDeleted: false })
      .populate({ path: 'enrolment', populate: 'courseOffering' })
      .populate('semester')
      .skip(skip)
      .limit(options.limit)
      .lean();
  },

  async findBySemester(studentId: string, semesterId: string) {
    return await Result.find({ student: studentId, semester: semesterId, isDeleted: false })
      .populate({ path: 'enrolment', populate: 'courseOffering' })
      .lean();
  },

  async create(data: any) {
    return await Result.create(data);
  },

  async createMany(results: any[]) {
    return await Result.insertMany(results, { ordered: false });
  },

  async updateById(id: string, data: any) {
    return await Result.findByIdAndUpdate(id, data, { new: true })
      .populate('student')
      .populate('semester')
      .lean();
  },

  async updateMany(filter: any, data: any) {
    return await Result.updateMany(filter, data);
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },

  async aggregateSemesterGPA(studentId: string, semesterId: string) {
    return await Result.aggregate([
      {
        $match: {
          student: studentId,
          semester: semesterId,
          status: 'PUBLISHED',
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'courseofferings',
          localField: 'enrolment',
          foreignField: '_id',
          as: 'offering',
        },
      },
      { $unwind: '$offering' },
      {
        $lookup: {
          from: 'courses',
          localField: 'offering.course',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: null,
          totalGradePoints: {
            $sum: { $multiply: ['$gradePoint', '$course.creditUnits'] },
          },
          totalUnits: { $sum: '$course.creditUnits' },
          unitsPassed: {
            $sum: {
              $cond: [{ $gt: ['$gradePoint', 0] }, '$course.creditUnits', 0],
            },
          },
          unitsFailed: {
            $sum: {
              $cond: [{ $eq: ['$gradePoint', 0] }, '$course.creditUnits', 0],
            },
          },
        },
      },
      {
        $project: {
          gpa: {
            $round: [{ $divide: ['$totalGradePoints', '$totalUnits'] }, 2],
          },
          totalUnits: 1,
          unitsPassed: 1,
          unitsFailed: 1,
        },
      },
    ]);
  },
};
