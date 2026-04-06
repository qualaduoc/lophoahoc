import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './pages/Auth';
import { VirtualLab } from './pages/VirtualLab';
import { PeriodicTable } from './pages/PeriodicTable';
import { Assignments } from './pages/Assignments';
import { CompletedAssignments } from './pages/CompletedAssignments';
import { Leaderboard } from './pages/Leaderboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { Profile } from './pages/Profile';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { OrganicChemistry } from './pages/OrganicChemistry';

// ===== PROTECTED ROUTE =====
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="desktop-bg flex items-center justify-center">
        <div className="retro-window w-72">
          <div className="retro-titlebar">
            <span className="title">ChemEd OS</span>
            <div className="window-controls">
              <span className="min-btn" /><span className="max-btn" /><span className="close-btn" />
            </div>
          </div>
          <div className="retro-body text-center py-8">
            <p className="text-2xl mb-3 animate-pulse">⏳</p>
            <p className="text-sm font-bold text-os-text-muted">Đang khởi động...</p>
          </div>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;
  return children;
};

// ===== TEACHER ROUTE — Chỉ cho role=teacher truy cập =====
const TeacherRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="desktop-bg flex items-center justify-center">
        <div className="retro-window w-72">
          <div className="retro-titlebar">
            <span className="title">ChemEd OS</span>
            <div className="window-controls">
              <span className="min-btn" /><span className="max-btn" /><span className="close-btn" />
            </div>
          </div>
          <div className="retro-body text-center py-8">
            <p className="text-2xl mb-3 animate-pulse">⏳</p>
            <p className="text-sm font-bold text-os-text-muted">Đang kiểm tra quyền...</p>
          </div>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;
  if (profile?.role !== 'teacher') {
    return (
      <div className="desktop-bg flex items-center justify-center">
        <div className="retro-window w-80">
          <div className="retro-titlebar">
            <span className="title">🚫 Không có quyền</span>
            <div className="window-controls">
              <span className="close-btn" onClick={() => navigate('/')} />
            </div>
          </div>
          <div className="retro-body text-center py-8">
            <p className="text-3xl mb-3">🔒</p>
            <p className="text-sm font-bold text-os-text mb-1">Khu vực dành cho Giáo viên</p>
            <p className="text-xs text-os-text-muted mb-4">Bạn cần quyền <b>Teacher</b> để truy cập trang này.</p>
            <button onClick={() => navigate('/')} className="retro-btn retro-btn-primary text-sm px-4 py-2">🏠 Về trang chủ</button>
          </div>
        </div>
      </div>
    );
  }
  return children;
};

// ===== SMART DASHBOARD — Tự nhận diện role =====
const SmartDashboard = () => {
  const { profile } = useAuth();
  if (profile?.role === 'teacher') return <TeacherDashboard />;
  return <StudentDashboard />;
};

// ===== DESKTOP ICONS CONFIG =====
const DESKTOP_APPS = [
  { id: 'dashboard', path: '/dashboard', icon: '🏠', label: 'Tổng quan', color: 'bg-sky-100 border-sky-300' },
  { id: 'lab', path: '/lab', icon: '🧪', label: 'Phòng TN', color: 'bg-emerald-100 border-emerald-300' },
  { id: 'table', path: '/table', icon: '⚛️', label: 'Bảng Tuần Hoàn', color: 'bg-amber-100 border-amber-300' },
  { id: 'assignments', path: '/assignments', icon: '📝', label: 'Bài Tập', color: 'bg-indigo-100 border-indigo-300', badge: true },
  { id: 'completed', path: '/completed', icon: '✅', label: 'Đã Làm', color: 'bg-green-100 border-green-300' },
  { id: 'leaderboard', path: '/leaderboard', icon: '🏆', label: 'Xếp Hạng', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'profile', path: '/profile', icon: '👤', label: 'Hồ Sơ', color: 'bg-pink-100 border-pink-300' },
  { id: 'organic', path: '/organic', icon: '⬡', label: 'Hóa Hữu Cơ', color: 'bg-teal-100 border-teal-300' },
];

const TEACHER_APP = { id: 'teacher', path: '/teacher', icon: '🛡️', label: 'Quản Lý', color: 'bg-purple-100 border-purple-300' };

// ===== DESKTOP VIEW (Homepage) =====
const DesktopView = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const apps = profile?.role === 'teacher' ? [...DESKTOP_APPS, TEACHER_APP] : DESKTOP_APPS;

  return (
    <div className="flex-1 flex items-center justify-center p-6 pb-20">
      <div className="w-full max-w-lg">
        {/* Welcome Window */}
        <div className="retro-window mb-8">
          <div className="retro-titlebar">
            <span className="title">💻 ChemEd OS v1.0</span>
            <div className="window-controls">
              <span className="min-btn" /><span className="max-btn" /><span className="close-btn" />
            </div>
          </div>
          <div className="retro-body text-center py-4">
            <p className="text-3xl mb-2">🧪</p>
            <h2 className="text-lg font-black text-os-text">
              Xin chào, {profile?.full_name || 'Bạn'} 👋
            </h2>
            <p className="text-xs text-os-text-muted mt-1">
              {profile?.role === 'teacher' ? '👨‍🏫 Giáo viên' : `🎓 ${profile?.class_name || 'Học sinh'}`}
              {' · '}Chọn một ứng dụng để bắt đầu
            </p>
          </div>
        </div>

        {/* Desktop Icons Grid */}
        <div className="grid grid-cols-4 gap-2 justify-items-center">
          {apps.map(app => (
            <button
              key={app.id}
              onClick={() => navigate(app.path)}
              className="desktop-icon group"
            >
              <div className={`icon-img ${app.color} border-2 shadow-md`}>
                <span className="text-2xl">{app.icon}</span>
                {app.badge && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative rounded-full h-3 w-3 bg-red-500" />
                  </span>
                )}
              </div>
              <span className="icon-label">{app.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== WINDOW WRAPPER (wraps page content in retro window) =====
const WindowWrapper = ({ title, icon, children }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-start justify-center p-4 pb-20 overflow-y-auto">
      <div className="w-full max-w-5xl">
        <div className="retro-window">
          <div className="retro-titlebar">
            <span className="title">{icon} {title}</span>
            <div className="window-controls">
              <span className="min-btn" onClick={() => navigate('/')} title="Thu nhỏ" />
              <span className="max-btn" title="Phóng to" />
              <span className="close-btn" onClick={() => navigate('/')} title="Đóng" />
            </div>
          </div>
          <div className="retro-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== TASKBAR =====
const Taskbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    window.location.reload();
  };

  const openApps = DESKTOP_APPS.filter(a => a.path === location.pathname);

  if (!user) return null;

  return (
    <div className="taskbar">
      {/* Start Button */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="taskbar-btn bg-gradient-to-r from-os-accent to-os-accent-light text-white border-2 border-os-accent"
          style={{ boxShadow: '2px 2px 0px #3A6B6C' }}
        >
          🧪 ChemEd
        </button>

        {/* Start Menu */}
        {showMenu && (
          <div className="absolute bottom-14 left-0 w-52 retro-window z-50" style={{ boxShadow: '4px 4px 0px #8B7355' }}>
            <div className="retro-titlebar py-1.5 px-2">
              <span className="title text-[11px]">🧪 Menu</span>
            </div>
            <div className="p-2 space-y-1">
              {[...DESKTOP_APPS, ...(profile?.role === 'teacher' ? [TEACHER_APP] : [])].map(app => (
                <button
                  key={app.id}
                  onClick={() => { navigate(app.path); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-semibold hover:bg-os-accent/10 transition-colors"
                >
                  <span className="text-lg">{app.icon}</span> {app.label}
                </button>
              ))}
              <hr className="border-os-border my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-semibold text-os-red hover:bg-red-50 transition-colors"
              >
                <span>🔌</span> Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-os-border mx-1" />

      {/* Open App Indicators */}
      <div className="flex gap-1 flex-1 overflow-x-auto">
        {location.pathname !== '/' && (
          <button
            onClick={() => navigate(location.pathname)}
            className="taskbar-btn active text-xs"
          >
            {openApps[0]?.icon || '📂'} {openApps[0]?.label || 'Ứng dụng'}
          </button>
        )}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-3">
        {/* User */}
        <button
          onClick={() => navigate('/profile')}
          className="taskbar-btn text-xs"
        >
          👤 {profile?.full_name?.split(' ').pop() || 'User'}
        </button>

        {/* Clock */}
        <div className="text-right px-2 select-none">
          <p className="text-xs font-bold text-os-text leading-none">{timeStr}</p>
          <p className="text-[10px] text-os-text-muted">{dateStr}</p>
        </div>
      </div>
    </div>
  );
};

// ===== DESKTOP LAYOUT =====
const DesktopLayout = ({ children }) => (
  <div className="desktop-bg flex flex-col" style={{ height: '100vh' }}>
    {children}
    <Taskbar />
  </div>
);

// ===== APP ROUTES =====
const AppRoutes = () => {
  const { user, profile, loading } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={
        loading ? <Auth /> : (user ? <Navigate to="/" /> : <Auth />)
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <DesktopLayout><DesktopView /></DesktopLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DesktopLayout>
            <WindowWrapper title={profile?.role === 'teacher' ? 'Bảng Điều Khiển Giáo Viên' : 'Tổng Quan'} icon={profile?.role === 'teacher' ? '🛡️' : '🏠'}>
              <SmartDashboard />
            </WindowWrapper>
          </DesktopLayout>
        </ProtectedRoute>
      } />
      <Route path="/lab" element={
        <ProtectedRoute>
          <DesktopLayout>
            <WindowWrapper title="Phòng Thí Nghiệm Ảo" icon="🧪">
              <VirtualLab />
            </WindowWrapper>
          </DesktopLayout>
        </ProtectedRoute>
      } />
      <Route path="/table" element={
        <ProtectedRoute>
          <DesktopLayout>
            <WindowWrapper title="Bảng Tuần Hoàn Nguyên Tố" icon="⚛️">
              <PeriodicTable />
            </WindowWrapper>
          </DesktopLayout>
        </ProtectedRoute>
      } />
      <Route path="/organic" element={
        <ProtectedRoute>
          <DesktopLayout>
            <WindowWrapper title="Học Tập: Hóa Hữu Cơ Lớp 9" icon="⬡">
              <OrganicChemistry />
            </WindowWrapper>
          </DesktopLayout>
        </ProtectedRoute>
      } />
      <Route path="/assignments" element={
        <ProtectedRoute>
          <DesktopLayout>
            <WindowWrapper title="Bài Tập Được Giao" icon="📝">
              <Assignments />
            </WindowWrapper>
          </DesktopLayout>
        </ProtectedRoute>
      } />
      <Route path="/completed" element={
        <ProtectedRoute>
          <DesktopLayout>
            <WindowWrapper title="Bài Đã Làm" icon="✅">
              <CompletedAssignments />
            </WindowWrapper>
          </DesktopLayout>
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <DesktopLayout>
            <WindowWrapper title="Bảng Xếp Hạng" icon="🏆">
              <Leaderboard />
            </WindowWrapper>
          </DesktopLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <DesktopLayout>
            <WindowWrapper title="Hồ Sơ Cá Nhân" icon="👤">
              <Profile />
            </WindowWrapper>
          </DesktopLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher" element={
        <TeacherRoute>
          <DesktopLayout>
            <WindowWrapper title="Bảng Điều Khiển Giáo Viên" icon="🛡️">
              <TeacherDashboard />
            </WindowWrapper>
          </DesktopLayout>
        </TeacherRoute>
      } />
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
};

// ===== MAIN APP =====
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              borderRadius: '8px',
              border: '2px solid #C4A882',
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
