import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import AnalyzeURLPage from './pages/analyze/AnalyzeURLPage';
import AnalyzeTextPage from './pages/analyze/AnalyzeTextPage';
import AnalyzeImagePage from './pages/analyze/AnalyzeImagePage';
import ReportsPage from './pages/reports/ReportsPage';
import ReportDetailPage from './pages/reports/ReportDetailPage';
import AdminPage from './pages/admin/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute pageTitle="Dashboard" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analyze/url" element={<AnalyzeURLPage />} />
            <Route path="/analyze/text" element={<AnalyzeTextPage />} />
            <Route path="/analyze/image" element={<AnalyzeImagePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportDetailPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute adminOnly={true} pageTitle="Admin Console" />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
