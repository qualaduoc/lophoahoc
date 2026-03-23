import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const Leaderboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: subs } = await supabase
        .from('submissions')
        .select('student_id, score, total_points, is_completed, users!inner(full_name, class_name)')
        .eq('is_completed', true);

      if (!subs || subs.length === 0) { setStudents([]); setLoading(false); return; }

      const map = {};
      for (const s of subs) {
        if (!map[s.student_id]) {
          map[s.student_id] = {
            id: s.student_id, name: s.users?.full_name || 'Ẩn danh',
            class: s.users?.class_name || '', totalScore: 0, totalPoints: 0, count: 0,
          };
        }
        map[s.student_id].totalScore += (s.score || 0);
        map[s.student_id].totalPoints += (s.total_points || 0);
        map[s.student_id].count += 1;
      }

      const ranked = Object.values(map)
        .map(s => ({ ...s, avg: s.totalPoints > 0 ? ((s.totalScore / s.totalPoints) * 10).toFixed(1) : '0.0' }))
        .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));

      setStudents(ranked);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getRankEmoji = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;

  const getRankBg = (i) => {
    if (i === 0) return 'bg-yellow-50 border-yellow-300';
    if (i === 1) return 'bg-gray-50 border-gray-300';
    if (i === 2) return 'bg-amber-50 border-amber-300';
    return 'bg-os-bg-light border-os-border';
  };

  if (loading) return <div className="text-center py-12"><p className="text-os-text-muted">⏳ Đang tải...</p></div>;

  return (
    <div>
      {students.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🏆</p>
          <h3 className="text-lg font-bold text-os-text mb-1">Chưa có dữ liệu</h3>
          <p className="text-sm text-os-text-muted">Bảng xếp hạng hiển thị khi có bài nộp.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-default ${getRankBg(i)}`}>
              {/* Rank */}
              <div className="w-10 h-10 flex items-center justify-center text-xl font-black shrink-0">
                {getRankEmoji(i)}
              </div>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-lg bg-os-accent/10 border-2 border-os-border flex items-center justify-center shrink-0 text-lg">
                👤
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-os-text truncate text-sm">{s.name}</p>
                <p className="text-[10px] text-os-text-muted font-medium">{s.class} · {s.count} bài</p>
              </div>
              {/* Score */}
              <div className="text-right shrink-0">
                <p className={`text-xl font-black ${
                  parseFloat(s.avg) >= 8 ? 'text-os-green' : parseFloat(s.avg) >= 5 ? 'text-os-yellow' : 'text-os-red'
                }`}>{s.avg}</p>
                <p className="text-[9px] text-os-text-muted font-bold uppercase tracking-wider">Điểm TB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
