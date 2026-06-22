import SenateMeeting from '../models/senateMeeting.model';
import SenatePrayer from '../models/senatePrayer.model';
import SenateResultSheet from '../models/senateResultSheet.model';

export const senateMeetingRepository = {
  async findById(id: string) {
    return await SenateMeeting.findById(id)
      .populate('createdBy')
      .lean();
  },

  async findAll(options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const meetings = await SenateMeeting.find({ isDeleted: false })
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await SenateMeeting.countDocuments({ isDeleted: false });
    return { meetings, total };
  },

  async create(data: any) {
    return await SenateMeeting.create(data);
  },

  async updateById(id: string, data: any) {
    return await SenateMeeting.findByIdAndUpdate(id, data, { new: true })
      .populate('createdBy')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const senatePrayerRepository = {
  async findById(id: string) {
    return await SenatePrayer.findById(id)
      .populate('meeting')
      .populate('submittedBy')
      .lean();
  },

  async findByMeeting(meetingId: string) {
    return await SenatePrayer.find({ meeting: meetingId, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
  },

  async create(data: any) {
    return await SenatePrayer.create(data);
  },

  async updateById(id: string, data: any) {
    return await SenatePrayer.findByIdAndUpdate(id, data, { new: true })
      .populate('meeting')
      .populate('submittedBy')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const senateResultSheetRepository = {
  async findById(id: string) {
    return await SenateResultSheet.findById(id)
      .populate('meeting')
      .populate('semester')
      .lean();
  },

  async findByMeeting(meetingId: string) {
    return await SenateResultSheet.find({ meeting: meetingId, isDeleted: false })
      .lean();
  },

  async create(data: any) {
    return await SenateResultSheet.create(data);
  },

  async updateById(id: string, data: any) {
    return await SenateResultSheet.findByIdAndUpdate(id, data, { new: true })
      .populate('meeting')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};
