import {
  learningModuleRepository,
  learningResourceRepository,
  studentProgressRepository,
} from '../repositories/learning.repository';
import { AppError } from '../middleware/errorHandler';

export class LearningService {
  async createModule(courseOfferingId: string, lecturerId: string, data: any) {
    return await learningModuleRepository.create({
      courseOffering: courseOfferingId,
      lecturer: lecturerId,
      ...data,
    });
  }

  async getModule(id: string) {
    return await learningModuleRepository.findById(id);
  }

  async getModulesByCourse(offeringId: string) {
    return await learningModuleRepository.findByCourseOffering(offeringId);
  }

  async updateModule(id: string, data: any) {
    return await learningModuleRepository.updateById(id, data);
  }

  async deleteModule(id: string) {
    return await learningModuleRepository.softDelete(id);
  }

  async uploadResource(moduleId: string, uploadedBy: string, data: any) {
    return await learningResourceRepository.create({
      module: moduleId,
      uploadedBy,
      ...data,
    });
  }

  async getResourcesByModule(moduleId: string) {
    return await learningResourceRepository.findByModule(moduleId);
  }

  async getResource(id: string) {
    return await learningResourceRepository.findById(id);
  }

  async updateResource(id: string, data: any) {
    return await learningResourceRepository.updateById(id, data);
  }

  async trackProgress(studentId: string, resourceId: string, data: any) {
    let progress = await studentProgressRepository.findByStudentAndResource(studentId, resourceId);

    if (!progress) {
      progress = await studentProgressRepository.create({
        student: studentId,
        resource: resourceId,
        ...data,
        startedAt: new Date(),
      });
    } else {
      progress = await studentProgressRepository.updateById(progress._id, {
        ...data,
        updatedAt: new Date(),
      });
    }

    return progress;
  }

  async getStudentProgress(studentId: string) {
    return await studentProgressRepository.findByStudent(studentId);
  }

  async getResourceProgress(resourceId: string) {
    const progress = await studentProgressRepository.findByModule(resourceId);
    const viewed = progress.filter((p: any) => p.status === 'VIEWED').length;
    const completed = progress.filter((p: any) => p.status === 'COMPLETED').length;

    return {
      total: progress.length,
      viewed,
      completed,
      completionRate: progress.length ? ((completed / progress.length) * 100).toFixed(2) : 0,
    };
  }
}

export const learningService = new LearningService();
