import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Search, FileText, Image, BookOpen,
  BarChart3, ShieldCheck, LogOut, ChevronRight, Zap,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyze/url', icon: Search, label: 'Analyze URL' },
  { to: '/analyze/text', icon: FileText, label: 'Analyze Text' },
  { to: '/analyze/image', icon: Image, label: 'Analyze Image' },
  { to: '/reports', icon: BookOpen, label: 'Reports' },
];

const adminItems = [
  { to: '/admin', icon: BarChart3, label: 'Admin Analytics' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`flex flex-col bg-tl-surface border-r border-tl-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen flex-shrink-0`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-tl-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tl-accent to-tl-accent2 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <ShieldCheck size={16} className="text-tl-bg" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="font-bold text-sm gradient-text">TruthLens AI</p>
            <p className="text-[10px] text-tl-muted">Intelligence System</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-tl-muted hover:text-tl-accent transition-colors p-1 rounded"
          aria-label="Toggle sidebar"
        >
          <ChevronRight size={14} className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-tl-muted uppercase tracking-widest px-2 mb-2">Analysis</p>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
               ${isActive
                ? 'bg-tl-accent/10 text-tl-accent border border-tl-accent/20 shadow-glow-sm'
                : 'text-tl-muted hover:text-tl-text hover:bg-white/5'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && <span className="animate-fade-in">{label}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-tl-muted uppercase tracking-widest px-2 mt-4 mb-2">Admin</p>
            )}
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                   ${isActive
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                    : 'text-tl-muted hover:text-tl-text hover:bg-white/5'
                  }`
                }
                title={collapsed ? label : undefined}
              >
                <Icon size={16} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-tl-border p-3">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tl-accent2 to-tl-accent flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-tl-text truncate">{user?.username}</p>
              <p className="text-[10px] text-tl-muted truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="text-tl-muted hover:text-tl-danger transition-colors p-1 rounded"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
