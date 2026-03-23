import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, ClipboardCheck, Check, AlertTriangle, BarChart3 } from 'lucide-react';

const OverviewTab = () => {
  const [stats, setStats] = useState({ students: 0, assignments: 0, submissions: 0, cheats: 0 });
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setError(null);
    try {
      const [s, a, sub, ch] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('assignments').select('*'),
        supabase.from('submissions').select('*').eq('is_completed', true),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).gte('cheat_flags', 2),
      ]);
      if (s.error) console.warn('users query error:', s.error.message);
      
      const assignList = a.data || [];
      const subList = sub.data || [];

      setStats({
        students: s.count || 0,
        assignments: assignList.length,
        submissions: subList.length,
        cheats: ch.count || 0,
      });

      const chart = assignList.map(asn => {
        const subs = subList.filter(s => s.assignment_id === asn.id);
        const avgScore = subs.length > 0
          ? Math.round(subs.reduce((sum, s) => sum + ((s.score || 0) / (s.total_points || 1)) * 100, 0) / subs.length)
          : 0;
        return {
          name: asn.title?.length > 15 ? asn.title.slice(0, 15) + '…' : asn.title,
          submitted: subs.length,
          avgPercent: avgScore,
          deadline: asn.due_date,
          target_class: asn.target_class,
        };
      });
      setChartData(chart);
    } catch (err) {
      console.error('OverviewTab error:', err);
      setError(err.message);
    }
  };

  useEffect(() => { loadStats(); }, []);

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500 font-bold mb-2">⚠️ Lỗi tải dữ liệu</p>
      <p className="text-xs text-gray-400 mb-3">{error}</p>
      <button onClick={loadStats} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-200">🔄 Thử lại</button>
    </div>
  );

  const cards = [
    { label: 'Học sinh', value: stats.students, color: 'from-sky-500 to-blue-600', icon: Users },
    { label: 'Bài tập', value: stats.assignments, color: 'from-purple-500 to-indigo-600', icon: ClipboardCheck },
    { label: 'Bài đã nộp', value: stats.submissions, color: 'from-emerald-500 to-green-600', icon: Check },
    { label: 'Nghi gian lận', value: stats.cheats, color: 'from-red-500 to-rose-600', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="glass rounded-2xl p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-black text-gray-900">{c.value}</p>
              <p className="text-sm text-gray-500 font-medium">{c.label}</p>
            </div>
          );
        })}
      </div>

      {chartData.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-800 text-lg">Thống kê theo bài tập</h3>
          </div>
          <div className="space-y-3">
            {chartData.map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      {item.target_class && <span>🎯 Lớp {item.target_class}</span>}
                      {item.deadline && (
                        <span className={new Date(item.deadline) < new Date() ? 'text-red-500' : ''}>
                          📅 {new Date(item.deadline).toLocaleDateString('vi-VN')}
                          {new Date(item.deadline) < new Date() && ' (Hết hạn)'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">📤 {item.submitted} bài</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 shrink-0">Điểm TB:</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.avgPercent >= 70 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                        item.avgPercent >= 50 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                        'bg-gradient-to-r from-red-400 to-rose-500'
                      }`}
                      style={{ width: `${item.avgPercent}%` }}
                    />
                  </div>
                  <span className={`text-sm font-black w-12 text-right ${
                    item.avgPercent >= 70 ? 'text-emerald-600' :
                    item.avgPercent >= 50 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    {item.avgPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
