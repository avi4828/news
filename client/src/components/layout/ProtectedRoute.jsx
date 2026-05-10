import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ adminOnly = false, pageTitle }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-tl-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-tl-accent animate-spin" />
          <p className="text-tl-muted text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen bg-tl-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6 bg-mesh">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
