import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Beaker, Table, ClipboardList, CheckCircle, Trophy, Download, LogOut, Menu, X, LayoutDashboard, Home, User } from 'lucide-react';

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    window.location.reload();
  };

  const navItems = [
    { path: '/dashboard', label: 'Tổng quan', icon: Home },
    { path: '/lab', label: 'Phòng TN', icon: Beaker },
    { path: '/table', label: 'Bảng TH', icon: Table },
    { path: '/assignments', label: 'Bài Tập', icon: ClipboardList, alert: true },
    { path: '/leaderboard', label: 'Xếp Hạng', icon: Trophy },
    ...(profile?.role === 'teacher' ? [{ path: '/teacher', label: 'Quản lý', icon: LayoutDashboard }] : []),
  ];

  return (
    <nav className="glass sticky top-0 z-40 border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center group">
              <div className="bg-gradient-to-br from-sky-500 to-emerald-500 p-2 rounded-lg group-hover:shadow-lg transition-all">
                <Beaker className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2.5 text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-emerald-500">ChemEd</span>
            </NavLink>

            {/* Desktop Nav */}
            <div className="hidden lg:flex lg:ml-6 lg:space-x-1 items-center">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `relative inline-flex items-center px-3 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        isActive ? 'bg-sky-100 text-sky-800 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 mr-1.5 opacity-70" />
                    {item.label}
                    {item.alert && (
                      <span className="absolute top-1 right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="hidden md:inline-flex items-center px-3 py-1.5 text-sm font-bold rounded-full text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20 transition-all"
              >
                <Download className="w-4 h-4 mr-1" /> Cài đặt
              </button>
            )}

            {/* User Info - Click to Profile */}
            {user && profile && (
              <NavLink to="/profile" className="hidden md:flex items-center gap-2 bg-white/50 py-1.5 px-3 rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800 leading-none mb-0.5">{profile.full_name}</p>
                  <div className="flex items-center justify-end gap-1">
                    <span className={`text-[10px] uppercase font-bold px-1.5 rounded ${
                      profile.role === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {profile.role === 'teacher' ? 'Giáo viên' : profile.class_name || 'Học sinh'}
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
                  </div>
                </div>
              </NavLink>
            )}

            {/* Logout */}
            {user && (
              <button onClick={handleLogout} className="hidden md:flex items-center text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors" title="Đăng xuất">
                <LogOut className="w-5 h-5" />
              </button>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white/90 backdrop-blur-lg pb-4 px-4">
          <div className="space-y-1 mt-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl font-semibold transition-all ${
                      isActive ? 'bg-sky-100 text-sky-800' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3 opacity-70" />
                  {item.label}
                </NavLink>
              );
            })}
            {user && (
              <>
                <NavLink to="/completed" onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-sky-100 text-sky-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <CheckCircle className="w-5 h-5 mr-3 opacity-70" /> Bài đã làm
                </NavLink>
                <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-sky-100 text-sky-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <User className="w-5 h-5 mr-3 opacity-70" /> Hồ sơ cá nhân
                </NavLink>
                <button onClick={handleLogout} className="flex items-center px-4 py-3 rounded-xl font-semibold text-red-500 hover:bg-red-50 w-full">
                  <LogOut className="w-5 h-5 mr-3" /> Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
