import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/student.service';

export class StudentController {
  async createStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studentService.createStudent(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Student created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async listStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filter = {
        ...(req.query.programme && { programme: req.query.programme }),
        ...(req.query.level && { currentLevel: req.query.level }),
        ...(req.query.status && { status: req.query.status }),
      };

      const { students, total } = await studentService.listStudents(filter, { page, limit });
      res.json({
        success: true,
        data: students,
        meta: { total, page, limit },
      });
      res.set('X-Total-Count', total.toString());
    } catch (error) {
      next(error);
    }
  }

  async getStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.getStudent(req.params.id);
      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.updateStudent(req.params.id, req.body);
      res.json({
        success: true,
        data: student,
        message: 'Student updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async importCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows, sessionId, dryRun } = req.body;
      const results = await studentService.importCSV(rows, sessionId);

      if (dryRun) {
        return res.json({
          success: true,
          data: results,
          message: 'Dry run preview',
        });
      }

      res.json({
        success: true,
        data: results,
        message: `${results.inserted} students imported, ${results.failed} failed`,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.deleteStudent(req.params.id);
      res.json({
        success: true,
        data: student,
        message: 'Student deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
