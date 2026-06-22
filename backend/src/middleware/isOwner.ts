import { Request, Response, NextFunction } from 'express'
import Student from '../models/student.model'
import { ApiResponse } from '@coels-crms/shared'

export const isOwner = (getStudentId: (req: Request) => Promise<string> | string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceStudentId = await Promise.resolve(getStudentId(req))
      const studentDoc = await Student.findOne({ user: req.user!.id }).lean()
      if (!studentDoc || studentDoc._id.toString() !== resourceStudentId.toString()) {
        const isStaff = ['registrar', 'bursary', 'hostel_officer', 'super_admin'].some((r) => req.user!.roles.includes(r))
        if (!isStaff) {
          const response: ApiResponse = { success: false, message: 'Access denied' }
          res.status(403).json(response)
          return
        }
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
