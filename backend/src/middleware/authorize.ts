import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '@coels-crms/shared'

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      }
      res.status(401).json(response)
      return
    }
    const userRoles = req.user.roles || []
    const userPerms = req.user.permissions || []

    const hasRole = userRoles.some((r: string) => allowedRoles.includes(r))
    const needsSenate = allowedRoles.includes('senate_member')
    const hasSenate = needsSenate && userPerms.includes('senate:participate')

    if (!hasRole && !hasSenate) {
      const response: ApiResponse = {
        success: false,
        message: 'Insufficient permissions',
        data: { requiredRoles: allowedRoles },
      }
      res.status(403).json(response)
      return
    }

    next()
  }
}
