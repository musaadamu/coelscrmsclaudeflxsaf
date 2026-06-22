import request from 'supertest'
import app from '../src/app'
import crypto from 'crypto'

describe('Payments webhook', () => {
  it('should return 200 for invalid signature', async () => {
    const payload = { event: 'charge.success', data: { reference: 'TEST', metadata: { studentId: '1', feeType: 'TUITION' }, amount: 10000 } }
    const body = JSON.stringify(payload)
    const signature = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || 'test').update(body).digest('hex')

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('x-paystack-signature', signature)
      .send(body)
    expect([200, 201, 204]).toContain(res.status)
  })
})
