import {
  hostelRepository,
  hostelRoomRepository,
  hostelAllocationRepository,
} from '../repositories/hostel.repository';
import { AppError } from '../middleware/errorHandler';
import HostelAllocation from '../models/hostelAllocation.model';
import HostelRoom from '../models/hostelRoom.model';

export class HostelService {
  async createHostel(data: any) {
    return await hostelRepository.create(data);
  }

  async getHostel(id: string) {
    return await hostelRepository.findById(id);
  }

  async listHostels(options: any = {}) {
    return await hostelRepository.findAll(options);
  }

  async updateHostel(id: string, data: any) {
    return await hostelRepository.updateById(id, data);
  }

  async deleteHostel(id: string) {
    return await hostelRepository.softDelete(id);
  }

  async createRoom(hostelId: string, data: any) {
    return await hostelRoomRepository.create({
      hostel: hostelId,
      ...data,
    });
  }

  async listRooms(hostelId: string, options: any = {}) {
    return await hostelRoomRepository.findByHostel(hostelId, options);
  }

  async getAvailableRooms(hostelId: string, gender: string) {
    return await hostelRoomRepository.findAvailable(hostelId, gender);
  }

  async updateRoom(roomId: string, data: any) {
    return await hostelRoomRepository.updateById(roomId, data);
  }

  async bookRoom(studentId: string, roomId: string, sessionId: string) {
    const room = await hostelRoomRepository.findById(roomId);
    if (!room?.isAvailable) {
      throw new AppError(400, 'ROOM_UNAVAILABLE', 'Room is not available');
    }

    // Check if student already has allocation
    const existing = await hostelAllocationRepository.findByStudent(studentId, sessionId);
    if (existing) {
      throw new AppError(400, 'ALREADY_ALLOCATED', 'Student already has hostel allocation for this session');
    }

    const allocation = await hostelAllocationRepository.create({
      student: studentId,
      room: roomId,
      session: sessionId,
      status: 'BOOKED',
      bookedAt: new Date(),
    });

    return allocation;
  }

  async confirmAllocation(allocationId: string) {
    const allocation = await hostelAllocationRepository.findById(allocationId);
    if (allocation.status !== 'BOOKED') {
      throw new AppError(400, 'INVALID_STATUS', 'Allocation must be booked to confirm');
    }

    const updated = await hostelAllocationRepository.updateById(allocationId, {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    });

    // Check if room capacity is reached
    const allocations = await hostelAllocationRepository.findByRoom(allocation.room.toString());
    const room = await hostelRoomRepository.findById(allocation.room.toString());
    if (allocations.length >= room.capacity) {
      await hostelRoomRepository.updateById(allocation.room.toString(), { isAvailable: false });
    }

    return updated;
  }

  async cancelAllocation(allocationId: string) {
    const allocation = await hostelAllocationRepository.findById(allocationId);
    const updated = await hostelAllocationRepository.updateById(allocationId, {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    });

    // Make room available again
    await hostelRoomRepository.updateById(allocation.room.toString(), { isAvailable: true });

    return updated;
  }

  async getStudentAllocation(studentId: string, sessionId: string) {
    return await hostelAllocationRepository.findByStudent(studentId, sessionId);
  }
}

export const hostelService = new HostelService();
