<<<<<<< HEAD
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings, 
  Database,
  GraduationCap,
  BookOpen,
  FileText
} from 'lucide-react';

export default function AdminLayout() {
  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Admissions', href: '/admin/admissions', icon: <GraduationCap size={20} /> },
    { label: 'Students', href: '/admin/students', icon: <Users size={20} /> },
    { label: 'Results', href: '/admin/results', icon: <BookOpen size={20} /> },
    { label: 'System Users', href: '/admin/users', icon: <Users size={20} /> },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: <ClipboardList size={20} /> },
    { label: 'System Config', href: '/admin/system-config', icon: <Settings size={20} /> },
    { label: 'Import Tools', href: '/admin/imports', icon: <Database size={20} /> },
    { label: 'Reports', href: '/admin/reports', icon: <FileText size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden font-sans">
      <Sidebar menuItems={menuItems} title="System Admin" />
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="p-8 max-w-7xl mx-auto relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
=======
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
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
}
