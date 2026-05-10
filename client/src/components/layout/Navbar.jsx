import { Bell, ShieldCheck, Zap, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Navbar({ pageTitle }) {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-tl-surface/80 backdrop-blur-md border-b border-tl-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-tl-text">{pageTitle || 'TruthLens AI'}</h1>
        <span className="hidden sm:flex items-center gap-1 badge badge-info text-[10px]">
          <Zap size={10} /> Multi-Agent Active
        </span>
      </div>

      {/* Right: User info */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-tl-success animate-pulse-slow" title="System Online" />
        <span className="text-xs text-tl-muted hidden sm:block">System Online</span>

        <div className="w-px h-5 bg-tl-border" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-tl-accent2 to-tl-accent flex items-center justify-center text-xs font-bold text-white">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-tl-text leading-none">{user?.username}</p>
            <p className="text-[10px] text-tl-muted capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
