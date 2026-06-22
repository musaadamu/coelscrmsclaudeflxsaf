import { staffRepository } from '../repositories/staff.repository';
import { courseOfferingRepository } from '../repositories/course.repository';
import User from '../models/user.model';

export class StaffService {
  async createStaff(data: any) {
    const staff = await staffRepository.create(data);
    return await staffRepository.findById(staff._id.toString());
  }

  async getStaff(id: string) {
    return await staffRepository.findById(id);
  }

  async listStaff(filter: any = {}, options: any = {}) {
    return await staffRepository.findAll(filter, options);
  }

  async updateStaff(id: string, data: any) {
    return await staffRepository.updateById(id, data);
  }

  async assignCourses(staffId: string, courseOfferingIds: string[]) {
    const staff = await staffRepository.findById(staffId);

    // Update course offerings with lecturer
    for (const offeringId of courseOfferingIds) {
      await courseOfferingRepository.updateById(offeringId, {
        lecturer: staffId,
      });
    }

    return { staffId, courseCount: courseOfferingIds.length };
  }

  async getMyCourses(staffId: string) {
    return await courseOfferingRepository.findByLecturer(staffId);
  }

  async updateRoles(staffId: string, roles: string[], updatedBy: string) {
    const staff = await staffRepository.findById(staffId);
    const user = await User.findByIdAndUpdate(staff.user, { roles }, { new: true }).lean();
    return user;
  }

  async deleteStaff(id: string) {
    return await staffRepository.softDelete(id);
  }
}

export const staffService = new StaffService();
