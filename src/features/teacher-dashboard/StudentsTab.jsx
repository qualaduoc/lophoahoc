import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const StudentsTab = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase.from('users').select('*').eq('role', 'student').order('class_name').order('full_name');
      if (qErr) throw qErr;
      setStudents(data || []);
    } catch (err) {
      console.error('StudentsTab error:', err);
      setError(err.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">⏳ Đang tải danh sách...</div>;
  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500 font-bold mb-2">⚠️ Không thể tải danh sách học sinh</p>
      <p className="text-xs text-gray-400 mb-3">{error}</p>
      <button onClick={loadStudents} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-200">🔄 Thử lại</button>
    </div>
  );

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-800">Danh sách học sinh ({students.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">STT</th>
              <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Họ và tên</th>
              <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Lớp</th>
              <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">SĐT Phụ huynh</th>
              <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Ngày tham gia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((s, i) => (
              <tr key={s.id} className="hover:bg-sky-50/50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-400">{i + 1}</td>
                <td className="px-5 py-3.5 font-bold text-gray-900">{s.full_name}</td>
                <td className="px-5 py-3.5"><span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs font-bold">{s.class_name || '—'}</span></td>
                <td className="px-5 py-3.5 text-gray-600">{s.parent_phone || '—'}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && <p className="text-center py-8 text-gray-400">Chưa có học sinh nào đăng ký.</p>}
      </div>
    </div>
  );
};

export default StudentsTab;
