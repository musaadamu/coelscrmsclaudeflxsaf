// COELS CRMS Backend - Additional Types & Express Augmentation

import { JwtPayload } from '@coels-crms/shared'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
      requestId?: string
    }
  }
}

// Make it a module
export {}
