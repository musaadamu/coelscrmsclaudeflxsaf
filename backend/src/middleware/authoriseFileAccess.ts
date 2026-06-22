import { Request, Response, NextFunction } from 'express'
import TranscriptRequest from '../models/transcriptRequest.model'
import Payment from '../models/payment.model'
import Enrolment from '../models/enrolment.model'
import { ApiResponse } from '@coels-crms/shared'

export function authoriseFileAccess(resourceType: 'transcript'|'receipt'|'elearning'|'senate') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!
      if (!user) return res.status(401).json({ success:false, message:'Unauthenticated' })

      if (resourceType === 'transcript') {
        const id = req.params.id || req.query.id
        const tr = await TranscriptRequest.findById(id).lean()
        if (!tr) return res.status(404).json({ success:false, message:'Not found' })
        const isOwner = tr.student.toString() === user.id
        const isStaff = ['registrar','super_admin'].some(r => user.roles.includes(r))
        if (!isOwner && !isStaff) return res.status(403).json({ success:false, message:'Access denied' })
      }

      if (resourceType === 'receipt') {
        const id = req.params.id || req.query.id
        const payment = await Payment.findById(id).lean()
        if (!payment) return res.status(404).json({ success:false, message:'Not found' })
        const isOwner = payment.student.toString() === user.id
        const isStaff = ['bursary','super_admin'].some(r => user.roles.includes(r))
        if (!isOwner && !isStaff) return res.status(403).json({ success:false, message:'Access denied' })
      }

      if (resourceType === 'elearning') {
        const resourceId = req.params.id || req.query.id
        // Check enrolment: student must have an enrolment for the courseOffering
        const enrol = await Enrolment.findOne({ student: user.id, courseOffering: resourceId }).lean()
        const isStaff = ['lecturer','hod','registrar','super_admin'].some(r => user.roles.includes(r))
        if (!enrol && !isStaff) return res.status(403).json({ success:false, message:'Access denied' })
      }

      if (resourceType === 'senate') {
        const userPerms = user.permissions || []
        const isAllowed = userPerms.includes('senate:participate') || ['registrar','vc','super_admin'].some(r => user.roles.includes(r))
        if (!isAllowed) return res.status(403).json({ success:false, message:'Access denied' })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
