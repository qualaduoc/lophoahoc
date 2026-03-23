import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const Auth = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', class_name: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(form.email, form.password);
        if (error) throw error;
        toast.success('Đăng nhập thành công! 👋');
      } else {
        if (!form.full_name.trim()) throw new Error('Vui lòng nhập họ và tên');
        if (form.password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
        const { error } = await signUp(form.email, form.password, {
          full_name: form.full_name, role: 'student', class_name: form.class_name,
        });
        if (error) throw error;
        toast.success('Đăng ký thành công! 🎉 Hãy đăng nhập.');
        setIsLogin(true);
        setForm({ ...form, password: '' });
      }
    } catch (err) {
      const msg = err.message || 'Đã xảy ra lỗi';
      if (msg.includes('Invalid login')) toast.error('Email hoặc mật khẩu không đúng!');
      else if (msg.includes('already registered')) toast.error('Email đã được đăng ký.');
      else if (msg.includes('rate limit')) toast.error('Thao tác quá nhanh, chờ 1 phút.');
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setForm({ email: '', password: '', full_name: '', class_name: '' });
  };

  return (
    <div className="desktop-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Boot Screen Header */}
        <div className="text-center mb-6">
          <p className="text-5xl mb-3">🧪</p>
          <h1 className="text-3xl font-black text-os-text" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ChemEd OS
          </h1>
          <p className="text-xs text-os-text-muted mt-1 font-medium">Nền tảng học Hóa học thông minh · v1.0</p>
        </div>

        {/* Login Window */}
        <div className="retro-window">
          <div className="retro-titlebar">
            <span className="title">{isLogin ? '🔑 Đăng nhập' : '📝 Tạo tài khoản mới'}</span>
            <div className="window-controls">
              <span className="min-btn" /><span className="max-btn" /><span className="close-btn" />
            </div>
          </div>
          <div className="retro-body">
            {/* Toggle Tabs */}
            <div className="flex border-2 border-os-border rounded-lg mb-5 overflow-hidden">
              <button
                onClick={() => switchMode()}
                className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                  isLogin ? 'bg-os-accent text-white' : 'bg-os-bg-light text-os-text-muted hover:bg-os-bg'
                }`}
              >
                🔑 Đăng nhập
              </button>
              <button
                onClick={() => switchMode()}
                className={`flex-1 py-2.5 text-sm font-bold transition-all border-l-2 border-os-border ${
                  !isLogin ? 'bg-os-accent text-white' : 'bg-os-bg-light text-os-text-muted hover:bg-os-bg'
                }`}
              >
                📝 Đăng ký
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-os-text-muted mb-1 uppercase tracking-wider">Họ và tên *</label>
                    <input
                      type="text" name="full_name" value={form.full_name} onChange={handleChange}
                      placeholder="Nguyễn Văn A" required
                      className="retro-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-os-text-muted mb-1 uppercase tracking-wider">Lớp</label>
                    <input
                      type="text" name="class_name" value={form.class_name} onChange={handleChange}
                      placeholder="VD: 12A1"
                      className="retro-input"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-bold text-os-text-muted mb-1 uppercase tracking-wider">Email</label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="email@example.com" required
                  className="retro-input"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-os-text-muted mb-1 uppercase tracking-wider">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} name="password"
                    value={form.password} onChange={handleChange}
                    placeholder="Tối thiểu 6 ký tự" required minLength={6}
                    className="retro-input pr-10"
                  />
                  <button
                    type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-os-text-muted hover:text-os-text text-sm px-1"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className={`w-full retro-btn retro-btn-primary py-3 text-sm flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {loading ? '⏳ Đang xử lý...' : (isLogin ? '🚀 Đăng nhập' : '✨ Tạo tài khoản')}
              </button>
            </form>

            <p className="text-center text-xs text-os-text-muted mt-4">
              {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <button onClick={switchMode} className="text-os-accent font-bold hover:underline">
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </div>
        </div>

        {/* Feature Icons */}
        <div className="mt-5 flex justify-center gap-4">
          {[
            { icon: '🧪', label: 'Phòng TN ảo' },
            { icon: '⚛️', label: 'Bảng tuần hoàn' },
            { icon: '📝', label: 'Bài tập online' },
            { icon: '🏆', label: 'Xếp hạng' },
          ].map((f, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-os-window border-2 border-os-border flex items-center justify-center text-xl shadow-sm mx-auto mb-1">
                {f.icon}
              </div>
              <p className="text-[10px] font-bold text-os-text-muted">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
