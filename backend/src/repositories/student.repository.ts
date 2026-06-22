import Student from '../models/student.model';
import { AppError } from '../middleware/errorHandler';

export const studentRepository = {
  async findById(id: string) {
    const student = await Student.findById(id)
      .populate('user')
      .populate('programme')
      .populate('guardian')
      .lean();
    if (!student) {
      throw new AppError(404, 'NOT_FOUND', 'Student not found');
    }
    return student;
  },

  async findByMatricNo(matricNo: string) {
    return await Student.findOne({ matricNo, isDeleted: false })
      .populate('user')
      .populate('programme')
      .lean();
  },

  async findAll(filter = {}, options = { page: 1, limit: 20, sort: { createdAt: -1 } as any }) {
    const skip = (options.page - 1) * options.limit;
    const students = await Student.find({ ...filter, isDeleted: false })
      .populate('user')
      .populate('programme')
      .sort(options.sort)
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Student.countDocuments({ ...filter, isDeleted: false });
    return { students, total };
  },

  async create(data: any) {
    const student = await Student.create(data);
    return this.findById(student._id.toString());
  },

  async updateById(id: string, data: any) {
    const student = await Student.findByIdAndUpdate(id, data, { new: true })
      .populate('user')
      .populate('programme')
      .lean();
    if (!student) {
      throw new AppError(404, 'NOT_FOUND', 'Student not found');
    }
    return student;
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },

  async findByProgrammeAndLevel(programmeId: string, level: number) {
    return await Student.find({ programme: programmeId, currentLevel: level, isDeleted: false })
      .populate('user')
      .lean();
  },

  async findMaxSequence(programmeCode: string, year: string) {
    const result = await Student.findOne({ matricNo: new RegExp(`^${programmeCode}/${year}/`) })
      .sort({ matricNo: -1 })
      .lean();
    if (!result) return 0;
    const parts = result.matricNo.split('/');
    return parseInt(parts[3], 10);
  },

  async createMany(students: any[]) {
    return await Student.insertMany(students, { ordered: false });
  },
};
