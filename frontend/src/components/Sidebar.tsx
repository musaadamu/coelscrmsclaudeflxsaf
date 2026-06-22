import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface MenuItem {
  label: string
  href: string
  icon: string
}

interface SidebarProps {
  menuItems: MenuItem[]
  title: string
}

export default function Sidebar({ menuItems, title }: SidebarProps) {
  const { logout } = useAuth()

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-primary">{title}</h2>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-gray-700">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
