import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

export function ApplicantList() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery(['applicants'], () => api.get('/api/admissions').then((r) => r.data))
  const shortlist = useMutation((id: string) => api.patch(`/api/admissions/${id}/shortlist`), { onSuccess: () => qc.invalidateQueries(['applicants']) })
  const admit = useMutation((id: string) => api.patch(`/api/admissions/${id}/admit`), { onSuccess: () => qc.invalidateQueries(['applicants']) })
  const reject = useMutation((params: any) => api.patch(`/api/admissions/${params.id}/reject`, { reason: params.reason }), { onSuccess: () => qc.invalidateQueries(['applicants']) })

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Applicants</h2>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Programme</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.data?.map((a: any) => (
              <tr key={a._id}>
                <td>{a.firstName} {a.lastName}</td>
                <td>{a.email}</td>
                <td>{a.programme}</td>
                <td>{a.status}</td>
                <td className="flex gap-2">
                  <button onClick={() => shortlist.mutate(a._id)} className="btn btn-outline">Shortlist</button>
                  <button onClick={() => admit.mutate(a._id)} className="btn btn-primary">Admit</button>
                  <button onClick={() => {
                    const reason = prompt('Reason for rejection') || 'Not specified'
                    reject.mutate({ id: a._id, reason })
                  }} className="btn btn-danger">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ApplicantList
