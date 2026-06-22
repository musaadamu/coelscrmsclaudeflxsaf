import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function StaffLayout() {
  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'My Courses', href: '/courses', icon: '📚' },
    { label: 'Enter Scores', href: '/scores', icon: '✏️' },
    { label: 'E-Learning', href: '/elearning', icon: '💻' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={menuItems} title="Staff Portal" />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
