import { studentRepository } from '../repositories/student.repository';
import { userRepository } from '../repositories/index';
import { AppError } from '../middleware/errorHandler';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/user.model';
import Student from '../models/student.model';
import AuditLog from '../models/auditLog.model';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

export class StudentService {
  async createStudent(data: any) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const passwordHash = await bcryptjs.hash(data.password, BCRYPT_ROUNDS);

      // Create user
      const user = await User.create(
        [
          {
            email: data.email,
            passwordHash,
            roles: ['student'],
            status: 'ACTIVE',
          },
        ],
        { session }
      );

      // Generate matric number
      const programme = data.programme;
      const year = new Date().getFullYear();
      const sequence = await Student.countDocuments({ programme, currentLevel: 100 });
      const matricNo = `COELS/${programme}/${year}/${String(sequence + 1).padStart(4, '0')}`;

      // Create student
      const student = await Student.create(
        [
          {
            user: user[0]._id,
            matricNo,
            programme: data.programme,
            currentLevel: 100,
            status: 'ACTIVE',
            guardian: data.guardian,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            state: data.state,
            lga: data.lga,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return { matricNo, studentId: student[0]._id };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async importCSV(rows: any[], sessionId: string) {
    const results = { inserted: 0, failed: 0, errors: [] as any[] };

    // Validate all rows first
    const validatedRows: any[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Normalize matricNo format (e.g., COELS/CSC/2023/0001)
        if (!row.matricNo || !row.programme) {
          throw new Error('Missing required fields: matricNo, programme');
        }
        validatedRows.push(row);
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message,
          data: row,
        });
      }
    }

    // Insert all validated rows at once
    if (validatedRows.length > 0) {
      try {
        const studentsToInsert = validatedRows.map((row) => ({
          matricNo: row.matricNo,
          programme: row.programme,
          currentLevel: row.currentLevel || 100,
          status: 'ACTIVE',
          gender: row.gender,
          dateOfBirth: row.dateOfBirth,
          state: row.state,
          lga: row.lga,
        }));

        await Student.insertMany(studentsToInsert, { ordered: false });
        results.inserted = validatedRows.length;
      } catch (error: any) {
        if (error.code === 11000) {
          results.errors.push({
            error: 'Duplicate matric number',
            data: error.writeErrors?.[0]?.err?.op,
          });
        }
      }
    }

    return results;
  }

  async getStudent(id: string) {
    return await studentRepository.findById(id);
  }

  async listStudents(filter: any = {}, options: any = {}) {
    return await studentRepository.findAll(filter, options);
  }

  async updateStudent(id: string, data: any) {
    return await studentRepository.updateById(id, data);
  }

  async deleteStudent(id: string) {
    return await studentRepository.softDelete(id);
  }

  async generateMatricNo(programmeCode: string, year: string) {
    const sequence = await studentRepository.findMaxSequence(programmeCode, year);
    return `COELS/${programmeCode}/${year}/${String(sequence + 1).padStart(4, '0')}`;
  }
}

export const studentService = new StudentService();
