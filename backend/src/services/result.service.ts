import { resultRepository } from '../repositories/result.repository';
import { cgpaRecordRepository } from '../repositories/course.repository';
import { studentRepository } from '../repositories/student.repository';
import { cgpaQueue } from '../workers/queues';
import Result from '../models/result.model';
import CgpaRecord from '../models/cgpaRecord.model';
import AuditLog from '../models/auditLog.model';

export class ResultService {
  async bulkCreateResults(results: any[]) {
    const created = await resultRepository.createMany(
      results.map((r) => ({
        ...r,
        status: 'DRAFT',
      }))
    );

    // Queue CGPA computation for affected students
    const studentIds = [...new Set(results.map((r) => r.student.toString()))];
    for (const studentId of studentIds) {
      await cgpaQueue.add('compute-gpa', { studentId });
    }

    return created;
  }

  async approveResult(resultId: string, hodId: string) {
    const result = await resultRepository.findById(resultId);
    if (result.status !== 'DRAFT') {
      throw new Error('Result must be in DRAFT status to approve');
    }

    const approved = await resultRepository.updateById(resultId, {
      status: 'SUBMITTED',
      approvedBy: hodId,
      approvedAt: new Date(),
    });

    return approved;
  }

  async publishResults(semesterId: string) {
    const updated = await resultRepository.updateMany(
      { semester: semesterId, status: 'APPROVED' },
      {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    );

    // Queue CGPA computation for all students in this semester
    const results = await Result.find({ semester: semesterId, status: 'PUBLISHED' })
      .select('student')
      .distinct('student');

    for (const studentId of results) {
      await cgpaQueue.add('compute-gpa', { studentId, semesterId });
    }

    return updated;
  }

  async getStudentResults(studentId: string, options: any = {}) {
    return await resultRepository.findByStudent(studentId, options);
  }

  async getSemesterResults(studentId: string, semesterId: string) {
    return await resultRepository.findBySemester(studentId, semesterId);
  }

  async deleteResult(resultId: string) {
    return await resultRepository.softDelete(resultId);
  }
}

export class CgpaService {
  async computeSemesterGPA(studentId: string, semesterId: string) {
    const gpaData = await resultRepository.aggregateSemesterGPA(studentId, semesterId);

    if (gpaData.length === 0) {
      return null;
    }

    const { gpa, totalUnits, unitsPassed, unitsFailed } = gpaData[0];

    // Upsert CGPA record
    const cgpaRecord = await cgpaRecordRepository.upsert(
      { student: studentId, semester: semesterId },
      {
        student: studentId,
        semester: semesterId,
        gpa,
        totalUnits,
        unitsPassed,
        unitsFailed,
        computedAt: new Date(),
      }
    );

    return cgpaRecord;
  }

  async computeCumulativeGPA(studentId: string) {
    // Get all CGPA records for student, sorted by semester
    const records = await cgpaRecordRepository.findByStudent(studentId);

    if (records.length === 0) {
      return null;
    }

    // Calculate cumulative GPA (average of all semester GPAs)
    const totalGPA = records.reduce((sum, record) => sum + record.gpa, 0);
    const cumulativeGPA = (totalGPA / records.length).toFixed(2);

    // Determine classification
    let classification = 'PASS';
    const cumulativeVal = parseFloat(cumulativeGPA as string);
    if (cumulativeVal >= 4.0) classification = 'FIRST CLASS';
    else if (cumulativeVal >= 3.5) classification = 'UPPER SECOND';
    else if (cumulativeVal >= 3.0) classification = 'LOWER SECOND';
    else if (cumulativeVal >= 2.0) classification = 'THIRD CLASS';
    else if (cumulativeVal >= 1.0) classification = 'PASS';
    else classification = 'FAIL';

    // Update all CGPA records with cumulative GPA
    await CgpaRecord.updateMany(
      { student: studentId },
      {
        cumulativeGpa: cumulativeGPA,
        classification,
      }
    );

    return { cumulativeGPA, classification, records };
  }

  async getStudentCGPA(studentId: string) {
    const records = await cgpaRecordRepository.findByStudent(studentId);
    if (records.length === 0) return null;

    const latest = records[records.length - 1];
    return {
      gpa: latest.gpa,
      cumulativeGpa: latest.cumulativeGpa,
      classification: latest.classification,
      records,
    };
  }
}

export const resultService = new ResultService();
export const cgpaService = new CgpaService();
