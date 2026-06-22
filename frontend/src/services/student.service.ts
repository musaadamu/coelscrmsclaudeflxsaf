import api from './api'

export const authService = {
  register: (email: string, password: string, phone?: string) =>
    api.post('/auth/register', { email, password, phone }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  refreshToken: () => api.post('/auth/refresh'),

  logout: () => api.post('/auth/logout'),

  setup2FA: () => api.post('/auth/2fa/setup'),

  verify2FA: (totpCode: string) => api.post('/auth/2fa/verify', { totpCode }),

  confirm2FA: (tempToken: string, totpCode: string) =>
    api.post('/auth/2fa/confirm', { tempToken, totpCode }),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
}

export const studentService = {
  getStudents: (page = 1, limit = 20) =>
    api.get('/students', { params: { page, limit } }),

  getStudent: (id: string) => api.get(`/students/${id}`),

  updateStudent: (id: string, data: Record<string, unknown>) =>
    api.patch(`/students/${id}`, data),
}

export const courseService = {
  getCourses: (page = 1, limit = 20) =>
    api.get('/courses', { params: { page, limit } }),

  getCourse: (id: string) => api.get(`/courses/${id}`),

  createCourse: (data: Record<string, unknown>) => api.post('/courses', data),

  updateCourse: (id: string, data: Record<string, unknown>) =>
    api.patch(`/courses/${id}`, data),

  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
}

export const resultService = {
  getResults: (page = 1, limit = 20) =>
    api.get('/results', { params: { page, limit } }),

  getResult: (id: string) => api.get(`/results/${id}`),

  createResult: (data: Record<string, unknown>) => api.post('/results', data),

  updateResult: (id: string, data: Record<string, unknown>) =>
    api.patch(`/results/${id}`, data),
}

export const paymentService = {
  getPayments: (page = 1, limit = 20) =>
    api.get('/payments', { params: { page, limit } }),

  initiatePayment: (data: Record<string, unknown>) =>
    api.post('/payments/initiate', data),

  verifyPayment: (reference: string) =>
    api.get(`/payments/verify/${reference}`),

  validateScratchCard: (serial: string, pin: string) =>
    api.post('/payments/scratch-card/validate', { serial, pin }),
}
