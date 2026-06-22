import nock from 'nock';
import { smsService } from '../../../src/services/sms.service';
import NotificationLog from '../../../src/models/notificationLog.model';
import mongoose from 'mongoose';

describe('SMS Service', () => {
  const phone = '08012345678';
  const message = 'Test SMS message';

  afterEach(() => {
    nock.cleanAll();
  });

  it('should send via Termii and create SENT notification log', async () => {
    nock('https://api.ng.termii.com')
      .post('/api/sms/send')
      .reply(200, { message_id: 'termii_123', code: 'ok' });

    await smsService.sendSMS(phone, message);

    const log = await NotificationLog.findOne({ recipient: phone });
    expect(log).toBeDefined();
    expect(log?.status).toBe('SENT');
    expect(log?.providerRef).toBe('termii_123');
  });

  it('should fallback to Twilio on Termii 500 error', async () => {
    nock('https://api.ng.termii.com')
      .post('/api/sms/send')
      .reply(500, { error: 'Internal Server Error' });

    nock('https://api.twilio.com')
      .post(/.*/)
      .reply(200, { sid: 'twilio_456' });

    await smsService.sendSMS(phone, message);

    const log = await NotificationLog.findOne({ recipient: phone, providerRef: 'twilio_456' });
    expect(log).toBeDefined();
    expect(log?.status).toBe('SENT');
  });
});
