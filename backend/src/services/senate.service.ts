import {
  senateMeetingRepository,
  senatePrayerRepository,
  senateResultSheetRepository,
} from '../repositories/senate.repository';
import { emailQueue, smsQueue, pdfQueue } from '../workers/queues';
import { AppError } from '../middleware/errorHandler';
import SenateMeeting from '../models/senateMeeting.model';
import SenatePrayer from '../models/senatePrayer.model';

export class SenateService {
  async createMeeting(data: any, createdBy: string) {
    const meeting = await senateMeetingRepository.create({
      ...data,
      createdBy,
      status: 'SCHEDULED',
    });

    // Queue notifications to all senate members
    // TODO: Get all senate member emails/phones and queue jobs
    await emailQueue.add('senate-notification', {
      to: 'senate@coels.edu.ng',
      template: 'senate-reminder',
      context: {
        meetingTitle: data.title,
        scheduledAt: data.scheduledAt,
        venue: data.venue,
        prayerDeadline: data.prayerDeadline,
        portalUrl: process.env.FRONTEND_URL,
      },
    });

    return meeting;
  }

  async getMeeting(id: string) {
    return await senateMeetingRepository.findById(id);
  }

  async listMeetings(options: any = {}) {
    return await senateMeetingRepository.findAll(options);
  }

  async submitPrayer(meetingId: string, userId: string, data: any) {
    const meeting = await senateMeetingRepository.findById(meetingId);

    if (new Date() > meeting.prayerDeadline) {
      throw new AppError(403, 'DEADLINE_PASSED', 'Prayer submission deadline has passed');
    }

    const prayer = await senatePrayerRepository.create({
      meeting: meetingId,
      submittedBy: userId,
      title: data.title,
      description: data.description,
      status: 'SUBMITTED',
      submittedAt: new Date(),
    });

    return prayer;
  }

  async votePrayer(prayerId: string, userId: string, vote: 'ACCEPT' | 'REJECT') {
    const prayer = await senatePrayerRepository.findById(prayerId);

    // Check if user already voted
    const alreadyVoted = prayer.votes?.some((v: any) => v.votedBy.toString() === userId);
    if (alreadyVoted) {
      throw new AppError(400, 'ALREADY_VOTED', 'You have already voted on this prayer');
    }

    const updated = await senatePrayerRepository.updateById(prayerId, {
      $push: {
        votes: {
          votedBy: userId,
          vote,
          votedAt: new Date(),
        },
      },
    });

    return updated;
  }

  async decidePrayer(prayerId: string, chairId: string, decision: string, notes: string) {
    const updated = await senatePrayerRepository.updateById(prayerId, {
      status: decision,
      decision: {
        decidedBy: chairId,
        decidedAt: new Date(),
        notes,
      },
    });

    // Queue email to prayer submitter
    const prayer = await senatePrayerRepository.findById(prayerId);
    await emailQueue.add('prayer-decision', {
      to: prayer.submittedBy.email,
      template: 'prayer-decision',
      context: {
        prayerTitle: prayer.title,
        decision,
        notes,
      },
    });

    return updated;
  }

  async createResultSheet(meetingId: string, data: any) {
    return await senateResultSheetRepository.create({
      meeting: meetingId,
      ...data,
    });
  }

  async approveResultSheet(sheetId: string) {
    return await senateResultSheetRepository.updateById(sheetId, {
      status: 'APPROVED',
      approvedAt: new Date(),
    });
  }

  async concludeMeeting(meetingId: string, registrarId: string) {
    // Queue PDF generation for minutes
    await pdfQueue.add('senate-minutes', {
      meetingId,
    });

    const updated = await senateMeetingRepository.updateById(meetingId, {
      status: 'CONCLUDED',
      concludedBy: registrarId,
      concludedAt: new Date(),
    });

    return updated;
  }

  async getPrayersForMeeting(meetingId: string) {
    return await senatePrayerRepository.findByMeeting(meetingId);
  }

  async getResultSheetsForMeeting(meetingId: string) {
    return await senateResultSheetRepository.findByMeeting(meetingId);
  }
}

export const senateService = new SenateService();
