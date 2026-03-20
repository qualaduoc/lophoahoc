import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Beaker, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';

export const Auth = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    class_name: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { error } = await signIn(form.email, form.password);
        if (error) throw error;
      } else {
        if (!form.full_name.trim()) {
          throw new Error('Vui lòng nhập họ và tên');
        }
        const { error } = await signUp(form.email, form.password, {
          full_name: form.full_name,
          role: 'student',
          class_name: form.class_name,
        });
        if (error) throw error;
        setSuccess('Đăng ký thành công! Kiểm tra email để xác nhận tài khoản hoặc đăng nhập ngay.');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-500 to-emerald-500 shadow-xl shadow-sky-500/25 mb-4">
            <Beaker className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-emerald-500">
            ChemEd
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Nền tảng học Hóa học thông minh</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                isLogin ? 'bg-white text-sky-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LogIn className="w-4 h-4" /> Đăng nhập
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                !isLogin ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Đăng ký
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Họ và tên *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white/80"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Lớp</label>
                  <input
                    type="text"
                    name="class_name"
                    value={form.class_name}
                    onChange={handleChange}
                    placeholder="VD: 12A1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white/80"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white/80"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white/80 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-200 ${
                isLogin
                  ? 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sky-500/25'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25'
              } ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Đang xử lý...
                </span>
              ) : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
