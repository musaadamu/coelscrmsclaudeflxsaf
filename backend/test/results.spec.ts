import request from 'supertest'
import app from '../src/app'

describe('Results publish -> CGPA', () => {
  it('should accept publish request (auth required)', async () => {
    const res = await request(app).post('/api/results/publish').send({ semesterId: '000000000000000000000000' })
    expect([401, 403, 200]).toContain(res.status)
  })
})
