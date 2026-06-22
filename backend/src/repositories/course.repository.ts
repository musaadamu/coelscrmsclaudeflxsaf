import CourseOffering from '../models/courseOffering.model';
import StudentFee from '../models/studentFee.model';
import CgpaRecord from '../models/cgpaRecord.model';
import ScratchCard from '../models/scratchCard.model';
import FeeStructure from '../models/feeStructure.model';

export const courseOfferingRepository = {
  async findById(id: string) {
    return await CourseOffering.findById(id)
      .populate('course')
      .populate('lecturer')
      .populate('semester')
      .lean();
  },

  async findBySemester(semesterId: string, options = { page: 1, limit: 50 }) {
    const skip = (options.page - 1) * options.limit;
    return await CourseOffering.find({ semester: semesterId, isDeleted: false })
      .populate('course')
      .populate('lecturer')
      .skip(skip)
      .limit(options.limit)
      .lean();
  },

  async findByLecturer(lecturerId: string) {
    return await CourseOffering.find({ lecturer: lecturerId, isDeleted: false })
      .populate('course')
      .populate('semester')
      .lean();
  },

  async create(data: any) {
    return await CourseOffering.create(data);
  },

  async updateById(id: string, data: any) {
    return await CourseOffering.findByIdAndUpdate(id, data, { new: true })
      .populate('course')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },

  async incrementEnrolledCount(id: string, count: number = 1) {
    return await CourseOffering.findByIdAndUpdate(id, { $inc: { enrolledCount: count } }, { new: true })
      .lean();
  },
};

export const studentFeeRepository = {
  async findById(id: string) {
    return await StudentFee.findById(id)
      .populate('student')
      .populate('feeStructure')
      .lean();
  },

  async findByStudent(studentId: string, sessionId?: string) {
    const filter: any = { student: studentId, isDeleted: false };
    if (sessionId) filter.session = sessionId;
    return await StudentFee.find(filter)
      .populate('feeStructure')
      .lean();
  },

  async findByStudentAndSession(studentId: string, sessionId: string) {
    return await StudentFee.findOne({ student: studentId, session: sessionId, isDeleted: false })
      .populate('feeStructure')
      .lean();
  },

  async create(data: any) {
    return await StudentFee.create(data);
  },

  async updateById(id: string, data: any) {
    return await StudentFee.findByIdAndUpdate(id, data, { new: true })
      .populate('student')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },

  async findByStatus(status: string, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const fees = await StudentFee.find({ status, isDeleted: false })
      .populate('student')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await StudentFee.countDocuments({ status, isDeleted: false });
    return { fees, total };
  },
};

export const cgpaRecordRepository = {
  async findById(id: string) {
    return await CgpaRecord.findById(id)
      .populate('student')
      .populate('semester')
      .lean();
  },

  async findByStudent(studentId: string) {
    return await CgpaRecord.find({ student: studentId, isDeleted: false })
      .populate('semester')
      .sort({ 'semester.startDate': 1 })
      .lean();
  },

  async findByStudentAndSemester(studentId: string, semesterId: string) {
    return await CgpaRecord.findOne({
      student: studentId,
      semester: semesterId,
      isDeleted: false,
    })
      .populate('semester')
      .lean();
  },

  async create(data: any) {
    return await CgpaRecord.create(data);
  },

  async updateById(id: string, data: any) {
    return await CgpaRecord.findByIdAndUpdate(id, data, { new: true })
      .populate('student')
      .lean();
  },

  async upsert(filter: any, data: any) {
    return await CgpaRecord.findOneAndUpdate(filter, data, { upsert: true, new: true })
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const scratchCardRepository = {
  async findBySerial(serial: string) {
    return await ScratchCard.findOne({ serial, isDeleted: false }).lean();
  },

  async create(data: any) {
    return await ScratchCard.create(data);
  },

  async createMany(cards: any[]) {
    return await ScratchCard.insertMany(cards, { ordered: false });
  },

  async updateById(id: string, data: any) {
    return await ScratchCard.findByIdAndUpdate(id, data, { new: true }).lean();
  },

  async findAll(options = { page: 1, limit: 50 }) {
    const skip = (options.page - 1) * options.limit;
    return await ScratchCard.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const feeStructureRepository = {
  async findById(id: string) {
    return await FeeStructure.findById(id).lean();
  },

  async findAll(options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const structures = await FeeStructure.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await FeeStructure.countDocuments({ isDeleted: false });
    return { structures, total };
  },

  async create(data: any) {
    return await FeeStructure.create(data);
  },

  async updateById(id: string, data: any) {
    return await FeeStructure.findByIdAndUpdate(id, data, { new: true }).lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};
