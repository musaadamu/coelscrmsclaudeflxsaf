import TranscriptRequest from '../models/transcriptRequest.model';

export const transcriptRepository = {
  async findById(id: string) {
    return await TranscriptRequest.findById(id)
      .populate('student')
      .populate('requestedBy')
      .lean();
  },

  async findByStudent(studentId: string, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const requests = await TranscriptRequest.find({ student: studentId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await TranscriptRequest.countDocuments({ student: studentId, isDeleted: false });
    return { requests, total };
  },

  async create(data: any) {
    return await TranscriptRequest.create(data);
  },

  async updateById(id: string, data: any) {
    return await TranscriptRequest.findByIdAndUpdate(id, data, { new: true })
      .populate('student')
      .lean();
  },

  async findByToken(token: string) {
    return await TranscriptRequest.findOne({ verificationToken: token, isDeleted: false })
      .populate('student')
      .populate('programme')
      .lean();
  },

  async findByStatus(status: string, options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const requests = await TranscriptRequest.find({ status, isDeleted: false })
      .populate('student')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await TranscriptRequest.countDocuments({ status, isDeleted: false });
    return { requests, total };
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};
