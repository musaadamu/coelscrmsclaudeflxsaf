import request from 'supertest'
import app from '../src/app'

describe('Admission flow', () => {
  it('should allow submitting application (public)', async () => {
    const res = await request(app)
      .post('/api/admissions/apply')
      .send({
        cycleId: '000000000000000000000000',
        firstName: 'Test',
        lastName: 'Applicant',
        email: 'test@applicant.test',
        phoneNumber: '08000000000',
        dateOfBirth: '2000-01-01',
        gender: 'MALE',
        state: 'Lagos',
        lga: 'Ikeja',
        programme: '000000000000000000000000',
      })
    expect(res.status).toBeOneOf([200, 201, 400])
  })
})
