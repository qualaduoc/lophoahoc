import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const Profile = () => {
  const { user, profile, fetchProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    class_name: profile?.class_name || '',
    phone: profile?.phone || '',
    parent_phone: profile?.parent_phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error('Họ tên không được để trống'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('users').update({
        full_name: form.full_name.trim(),
        class_name: form.class_name.trim(),
        phone: form.phone.trim(),
        parent_phone: form.parent_phone.trim(),
      }).eq('id', user.id);
      if (error) throw error;
      await fetchProfile(user.id);
      toast.success('Đã lưu thay đổi! ✅');
    } catch (err) { toast.error('Lỗi: ' + err.message); }
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* User Card */}
      <div className="border-2 border-os-border rounded-lg overflow-hidden mb-5">
        <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-2">
          <h3 className="text-xs font-black text-os-text uppercase tracking-wider">👤 Thông tin tài khoản</h3>
        </div>
        <div className="p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-os-accent/10 border-2 border-os-border flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h2 className="text-lg font-black text-os-text">{profile?.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border-2 ${
                profile?.role === 'teacher'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {profile?.role === 'teacher' ? '👨‍🏫 Giáo viên' : '🎓 Học sinh'}
              </span>
              {profile?.class_name && (
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded border-2 bg-sky-50 text-sky-700 border-sky-200">
                  {profile.class_name}
                </span>
              )}
            </div>
            <p className="text-xs text-os-text-muted mt-1">📧 {user?.email}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="border-2 border-os-border rounded-lg overflow-hidden">
        <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-2">
          <h3 className="text-xs font-black text-os-text uppercase tracking-wider">✏️ Chỉnh sửa thông tin</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-os-text-muted mb-1 uppercase tracking-wider">Họ và tên *</label>
            <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="retro-input" />
          </div>
          <div>
            <label className="block text-xs font-bold text-os-text-muted mb-1 uppercase tracking-wider">Lớp</label>
            <input type="text" value={form.class_name} onChange={e => setForm({ ...form, class_name: e.target.value })} placeholder="VD: 12A1" className="retro-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-os-text-muted mb-1 uppercase tracking-wider">SĐT</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="090..." className="retro-input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-os-text-muted mb-1 uppercase tracking-wider">SĐT Phụ huynh</label>
              <input type="tel" value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} placeholder="090..." className="retro-input" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className={`w-full retro-btn retro-btn-primary py-3 text-sm ${saving ? 'opacity-70' : ''}`}>
            {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};
