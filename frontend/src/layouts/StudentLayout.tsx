<<<<<<< HEAD
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  Home, 
  MonitorPlay 
} from 'lucide-react';

export default function StudentLayout() {
  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'My Courses', href: '/courses', icon: <BookOpen size={20} /> },
    { label: 'My Results', href: '/results', icon: <GraduationCap size={20} /> },
    { label: 'Pay Fees', href: '/fees', icon: <CreditCard size={20} /> },
    { label: 'Transcript', href: '/transcript', icon: <FileText size={20} /> },
    { label: 'Hostel', href: '/hostel', icon: <Home size={20} /> },
    { label: 'E-Learning', href: '/elearning', icon: <MonitorPlay size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden font-sans">
      <Sidebar menuItems={menuItems} title="Student Portal" />
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
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
}
