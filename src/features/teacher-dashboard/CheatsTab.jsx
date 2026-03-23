import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check } from 'lucide-react';

const CheatsTab = () => {
  const [cheats, setCheats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCheats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase
        .from('submissions')
        .select('*, users!inner(full_name, class_name), assignments!inner(title)')
        .gte('cheat_flags', 1)
        .order('submitted_at', { ascending: false });
      if (qErr) throw qErr;
      setCheats(data || []);
    } catch (err) {
      console.error('CheatsTab error:', err);
      setError(err.message);
      setCheats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCheats(); }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">⏳ Đang tải...</div>;
  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500 font-bold mb-2">⚠️ Không thể tải dữ liệu gian lận</p>
      <p className="text-xs text-gray-400 mb-3">{error}</p>
      <button onClick={loadCheats} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-200">🔄 Thử lại</button>
    </div>
  );

  return (
    <div>
      {cheats.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-700">Không có báo cáo gian lận</h3>
          <p className="text-gray-500 text-sm mt-1">Tất cả học sinh đều tuân thủ quy định.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cheats.map(c => (
            <div key={c.id} className={`glass rounded-xl p-5 border-l-4 ${c.cheat_flags >= 2 ? 'border-red-500' : 'border-amber-400'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{c.users?.full_name} <span className="text-gray-400 font-normal">— {c.users?.class_name}</span></p>
                  <p className="text-sm text-gray-500 mt-1">Bài: <b>{c.assignments?.title}</b></p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    c.cheat_flags >= 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {c.cheat_flags >= 2 ? '🚫 Vi phạm nặng (0 điểm)' : '⚠️ Cảnh báo lần 1'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">Số lần chuyển tab: {c.cheat_flags}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheatsTab;
