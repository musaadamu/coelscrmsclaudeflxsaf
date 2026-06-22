import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function StudentLayout() {
  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'My Courses', href: '/courses', icon: '📚' },
    { label: 'My Results', href: '/results', icon: '📈' },
    { label: 'Pay Fees', href: '/fees', icon: '💳' },
    { label: 'Transcript', href: '/transcript', icon: '📄' },
    { label: 'Hostel', href: '/hostel', icon: '🏠' },
    { label: 'E-Learning', href: '/elearning', icon: '💻' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={menuItems} title="Student Portal" />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
