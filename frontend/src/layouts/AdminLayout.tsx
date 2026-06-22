import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function AdminLayout() {
  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: '📋' },
    { label: 'System Config', href: '/admin/system-config', icon: '⚙️' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={menuItems} title="Admin Panel" />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
