import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">COELS CRMS</h1>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
