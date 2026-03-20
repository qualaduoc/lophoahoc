import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Auth } from './pages/Auth';
import { VirtualLab } from './pages/VirtualLab';
import { PeriodicTable } from './pages/PeriodicTable';
import { Assignments } from './pages/Assignments';
import { CompletedAssignments } from './pages/CompletedAssignments';
import { Leaderboard } from './pages/Leaderboard';
import { TeacherDashboard } from './pages/TeacherDashboard';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-chemistry-blue flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-sky-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-gray-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" />;
  return children;
};

// Main layout with navbar
const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-chemistry-blue text-slate-800 flex flex-col font-sans selection:bg-sky-200 selection:text-sky-900">
    <Navbar />
    <main className="flex-1 overflow-x-hidden">{children}</main>
  </div>
);

const AppRoutes = () => {
  const { user, profile, loading } = useAuth();

  // Smart home redirect based on role
  const HomeRedirect = () => {
    if (profile?.role === 'teacher') return <Navigate to="/teacher" />;
    return <Navigate to="/lab" />;
  };

  return (
    <Routes>
      {/* Auth page renders immediately - no loading gate */}
      <Route path="/auth" element={
        loading ? <Auth /> : (user ? <Navigate to="/" /> : <Auth />)
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout><HomeRedirect /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/lab" element={
        <ProtectedRoute>
          <AppLayout><VirtualLab /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/table" element={
        <ProtectedRoute>
          <AppLayout><PeriodicTable /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/assignments" element={
        <ProtectedRoute>
          <AppLayout><Assignments /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/completed" element={
        <ProtectedRoute>
          <AppLayout><CompletedAssignments /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <AppLayout><Leaderboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher" element={
        <ProtectedRoute>
          <AppLayout><TeacherDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
