import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutGrid, Book, Tag, LogOut, Library, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutGrid size={20} /> },
    { label: 'Books', path: '/admin/books', icon: <Book size={20} /> },
    { label: 'Categories', path: '/admin/categories', icon: <Tag size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-brand-border/40 flex flex-col p-6 fixed inset-y-0">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="p-2 bg-brand-accent rounded-xl shadow-lg shadow-brand-accent/20">
            <Library size={24} className="text-white" />
          </div>
          <span className="text-xl font-black text-brand-primary tracking-tight">MHP<span className="text-brand-accent">ADMIN</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm",
                isActive ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/10" : "text-brand-secondary hover:bg-brand-surface hover:text-brand-primary"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </div>
                  <ChevronRight size={14} className={cn("transition-transform", isActive ? "rotate-90" : "")} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 p-4 rounded-2xl text-brand-secondary hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-sm"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
