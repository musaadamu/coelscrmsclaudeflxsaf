import LearningModule from '../models/learningModule.model';
import LearningResource from '../models/learningResource.model';
import StudentProgress from '../models/studentProgress.model';

export const learningModuleRepository = {
  async findById(id: string) {
    return await LearningModule.findById(id)
      .populate('courseOffering')
      .populate('lecturer')
      .lean();
  },

  async findByCourseOffering(offeringId: string) {
    return await LearningModule.find({ courseOffering: offeringId, isDeleted: false })
      .lean();
  },

  async findAll(options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const modules = await LearningModule.find({ isDeleted: false })
      .populate('courseOffering')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await LearningModule.countDocuments({ isDeleted: false });
    return { modules, total };
  },

  async create(data: any) {
    return await LearningModule.create(data);
  },

  async updateById(id: string, data: any) {
    return await LearningModule.findByIdAndUpdate(id, data, { new: true })
      .populate('courseOffering')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const learningResourceRepository = {
  async findById(id: string) {
    return await LearningResource.findById(id)
      .populate('module')
      .populate('uploadedBy')
      .lean();
  },

  async findByModule(moduleId: string) {
    return await LearningResource.find({ module: moduleId, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
  },

  async create(data: any) {
    return await LearningResource.create(data);
  },

  async updateById(id: string, data: any) {
    return await LearningResource.findByIdAndUpdate(id, data, { new: true })
      .populate('module')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const studentProgressRepository = {
  async findById(id: string) {
    return await StudentProgress.findById(id)
      .populate('student')
      .populate('resource')
      .lean();
  },

  async findByStudentAndResource(studentId: string, resourceId: string) {
    return await StudentProgress.findOne({ student: studentId, resource: resourceId })
      .lean();
  },

  async create(data: any) {
    return await StudentProgress.create(data);
  },

  async updateById(id: string, data: any) {
    return await StudentProgress.findByIdAndUpdate(id, data, { new: true })
      .populate('student')
      .lean();
  },

  async findByStudent(studentId: string) {
    return await StudentProgress.find({ student: studentId })
      .populate('resource')
      .lean();
  },
};
