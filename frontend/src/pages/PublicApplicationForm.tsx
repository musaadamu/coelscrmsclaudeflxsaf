import React from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/services/api'

export function PublicApplicationForm() {
  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState({
    cycleId: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'MALE',
    state: '',
    lga: '',
    programme: '',
    documentUrls: [] as string[],
  })

  const mutation = useMutation((payload: any) => api.post('/api/admissions/apply', payload))

  function next() {
    setStep((s) => Math.min(3, s + 1))
  }
  function back() {
    setStep((s) => Math.max(1, s - 1))
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function submit() {
    try {
      await mutation.mutateAsync(form)
      alert('Application submitted successfully')
      setForm({
        cycleId: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: 'MALE',
        state: '',
        lga: '',
        programme: '',
        documentUrls: [],
      })
      setStep(1)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Submission failed')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Online Admission Application</h2>

      {step === 1 && (
        <div className="space-y-2">
          <label className="block">First name</label>
          <input name="firstName" value={form.firstName} onChange={onChange} className="input" />

          <label className="block">Last name</label>
          <input name="lastName" value={form.lastName} onChange={onChange} className="input" />

          <label className="block">Email</label>
          <input name="email" value={form.email} onChange={onChange} className="input" />

          <label className="block">Phone</label>
          <input name="phoneNumber" value={form.phoneNumber} onChange={onChange} className="input" />

          <div className="flex gap-2 mt-4">
            <button onClick={next} className="btn btn-primary">Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <label className="block">Date of birth</label>
          <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} className="input" />

          <label className="block">Gender</label>
          <select name="gender" value={form.gender} onChange={onChange} className="input">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>

          <label className="block">State</label>
          <input name="state" value={form.state} onChange={onChange} className="input" />

          <label className="block">LGA</label>
          <input name="lga" value={form.lga} onChange={onChange} className="input" />

          <div className="flex gap-2 mt-4">
            <button onClick={back} className="btn">Back</button>
            <button onClick={next} className="btn btn-primary">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2">
          <label className="block">Programme</label>
          <input name="programme" value={form.programme} onChange={onChange} className="input" />

          <label className="block">Supporting documents (URLs)</label>
          <input
            name="documentUrls"
            value={form.documentUrls.join(',')}
            onChange={(e) => setForm((f) => ({ ...f, documentUrls: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
            className="input"
          />

          <div className="flex gap-2 mt-4">
            <button onClick={back} className="btn">Back</button>
            <button onClick={submit} className="btn btn-primary">Submit Application</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicApplicationForm
