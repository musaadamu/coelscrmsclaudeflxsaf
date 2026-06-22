<<<<<<< HEAD
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  menuItems: MenuItem[];
  title: string;
}

export default function Sidebar({ menuItems, title }: SidebarProps) {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <aside className="relative flex flex-col w-72 bg-card border-r shadow-sm transition-all duration-300">
      <div className="flex items-center h-20 px-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <span className="text-primary-foreground font-bold text-xl">C</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-card-foreground leading-tight">{title}</h2>
            <p className="text-xs text-muted-foreground font-medium">COELS CRMS Portal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Navigation
        </p>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <Link key={item.href} to={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div className={cn(
                  "transition-transform duration-200", 
                  isActive ? "scale-110" : "group-hover:scale-110"
                )}>
                  {item.icon}
                </div>
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.roles?.[0] || 'User'}</p>
          </div>
        </div>
        <Button 
          variant="destructive" 
          className="w-full justify-start gap-2 font-medium" 
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
=======
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
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
}
