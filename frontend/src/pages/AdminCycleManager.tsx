import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

export function AdminCycleManager() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery(['admissionCycles'], () => api.get('/api/admissions/cycles').then((r) => r.data))
  const createMutation = useMutation((payload: any) => api.post('/api/admissions/cycles', payload), {
    onSuccess: () => qc.invalidateQueries(['admissionCycles']),
  })

  const [form, setForm] = React.useState({ academicSession: '', programme: '', startDate: '', endDate: '', applicationFee: 0, maxApplications: 1000 })

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'applicationFee' || name === 'maxApplications' ? Number(value) : value }))
  }

  async function create() {
    try {
      await createMutation.mutateAsync(form)
      alert('Cycle created')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Create failed')
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Admission Cycles</h2>

      <div className="mb-6">
        <h3 className="font-medium">Create Cycle</h3>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input name="academicSession" placeholder="Academic Session" value={form.academicSession} onChange={onChange} className="input" />
          <input name="programme" placeholder="Programme" value={form.programme} onChange={onChange} className="input" />
          <input name="startDate" type="date" name="startDate" value={form.startDate} onChange={onChange} className="input" />
          <input name="endDate" type="date" name="endDate" value={form.endDate} onChange={onChange} className="input" />
          <input name="applicationFee" placeholder="Application Fee (kobo)" value={form.applicationFee} onChange={onChange} className="input" />
          <input name="maxApplications" placeholder="Max Applications" value={form.maxApplications} onChange={onChange} className="input" />
        </div>
        <div className="mt-3">
          <button onClick={create} className="btn btn-primary">Create Cycle</button>
        </div>
      </div>

      <div>
        <h3 className="font-medium">Existing Cycles</h3>
        <div className="mt-2">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Programme</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Fee</th>
                  <th>Max</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.data?.map((c: any) => (
                  <tr key={c._id}>
                    <td>{c.academicSession}</td>
                    <td>{c.programme}</td>
                    <td>{new Date(c.startDate).toLocaleDateString()}</td>
                    <td>{new Date(c.endDate).toLocaleDateString()}</td>
                    <td>{c.applicationFee}</td>
                    <td>{c.maxApplications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminCycleManager
