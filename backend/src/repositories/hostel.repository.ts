import Hostel from '../models/hostel.model';
import HostelRoom from '../models/hostelRoom.model';
import HostelAllocation from '../models/hostelAllocation.model';

export const hostelRepository = {
  async findById(id: string) {
    return await Hostel.findById(id).lean();
  },

  async findAll(options = { page: 1, limit: 20 }) {
    const skip = (options.page - 1) * options.limit;
    const hostels = await Hostel.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
    const total = await Hostel.countDocuments({ isDeleted: false });
    return { hostels, total };
  },

  async create(data: any) {
    return await Hostel.create(data);
  },

  async updateById(id: string, data: any) {
    return await Hostel.findByIdAndUpdate(id, data, { new: true }).lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },
};

export const hostelRoomRepository = {
  async findById(id: string) {
    return await HostelRoom.findById(id)
      .populate('hostel')
      .lean();
  },

  async findByHostel(hostelId: string, options = { page: 1, limit: 50 }) {
    const skip = (options.page - 1) * options.limit;
    return await HostelRoom.find({ hostel: hostelId, isDeleted: false })
      .sort({ roomNumber: 1 })
      .skip(skip)
      .limit(options.limit)
      .lean();
  },

  async create(data: any) {
    return await HostelRoom.create(data);
  },

  async updateById(id: string, data: any) {
    return await HostelRoom.findByIdAndUpdate(id, data, { new: true })
      .populate('hostel')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },

  async findAvailable(hostelId: string, gender: string) {
    return await HostelRoom.find({
      hostel: hostelId,
      gender,
      isAvailable: true,
      isDeleted: false,
    })
      .lean();
  },
};

export const hostelAllocationRepository = {
  async findById(id: string) {
    return await HostelAllocation.findById(id)
      .populate('student')
      .populate('room')
      .lean();
  },

  async findByStudent(studentId: string, sessionId: string) {
    return await HostelAllocation.findOne({ student: studentId, session: sessionId, isDeleted: false })
      .populate('room')
      .lean();
  },

  async create(data: any) {
    return await HostelAllocation.create(data);
  },

  async updateById(id: string, data: any) {
    return await HostelAllocation.findByIdAndUpdate(id, data, { new: true })
      .populate('student')
      .populate('room')
      .lean();
  },

  async softDelete(id: string) {
    return this.updateById(id, { isDeleted: true });
  },

  async findByRoom(roomId: string) {
    return await HostelAllocation.find({ room: roomId, status: 'CONFIRMED', isDeleted: false })
      .populate('student')
      .lean();
  },
};
