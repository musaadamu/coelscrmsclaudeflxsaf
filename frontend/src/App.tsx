import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import PublicLayout from './layouts/PublicLayout'
import StudentLayout from './layouts/StudentLayout'
import StaffLayout from './layouts/StaffLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
        <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
      </Route>

      <Route element={<ProtectedRoute layout={StudentLayout} roles={['student']} />}>
        <Route path="/dashboard" element={<div>Student Dashboard</div>} />
        <Route path="/courses" element={<div>My Courses</div>} />
        <Route path="/results" element={<div>My Results</div>} />
        <Route path="/fees" element={<div>Pay Fees</div>} />
        <Route path="/transcript" element={<div>Transcript</div>} />
        <Route path="/hostel" element={<div>Hostel</div>} />
        <Route path="/elearning" element={<div>E-Learning</div>} />
      </Route>

      <Route element={<ProtectedRoute layout={StaffLayout} roles={['lecturer', 'hod', 'registrar']} />}>
        <Route path="/dashboard" element={<div>Staff Dashboard</div>} />
        <Route path="/courses" element={<div>My Courses</div>} />
        <Route path="/scores" element={<div>Enter Scores</div>} />
        <Route path="/elearning" element={<div>E-Learning</div>} />
      </Route>

      <Route element={<ProtectedRoute layout={AdminLayout} roles={['super_admin', 'registrar']} />}>
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
        <Route path="/admin/users" element={<div>User Management</div>} />
        <Route path="/admin/audit-logs" element={<div>Audit Logs</div>} />
        <Route path="/admin/system-config" element={<div>System Configuration</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
