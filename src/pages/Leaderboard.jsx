import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award, Star } from 'lucide-react';

export const Leaderboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      // Fetch all student submissions to calculate average
      const { data: subs } = await supabase
        .from('submissions')
        .select('student_id, score, total_points, is_completed, users!inner(full_name, class_name, avatar_icon)')
        .eq('is_completed', true);

      if (!subs || subs.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Group by student
      const map = {};
      for (const s of subs) {
        if (!map[s.student_id]) {
          map[s.student_id] = {
            id: s.student_id,
            name: s.users?.full_name || 'Ẩn danh',
            class: s.users?.class_name || '',
            avatar: s.users?.avatar_icon || 'user',
            totalScore: 0,
            totalPoints: 0,
            count: 0,
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
    fetch();
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-400">{index + 1}</span>;
  };

  const getRankBg = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
    if (index === 1) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    if (index === 2) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
    return 'bg-white border-gray-100';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-amber-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/25">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Bảng Xếp Hạng</h1>
          <p className="text-sm text-gray-500">Xếp hạng theo điểm trung bình</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Star className="w-10 h-10 text-amber-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có dữ liệu</h3>
          <p className="text-gray-500">Bảng xếp hạng sẽ hiển thị khi có học sinh hoàn thành bài tập.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md ${getRankBg(i)}`}>
              <div className="w-10 flex items-center justify-center shrink-0">
                {getRankIcon(i)}
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 p-[2px] shrink-0">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{s.name}</p>
                <p className="text-xs text-gray-400">{s.class} · {s.count} bài</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-2xl font-black ${
                  parseFloat(s.avg) >= 8 ? 'text-emerald-600' : parseFloat(s.avg) >= 5 ? 'text-amber-600' : 'text-red-500'
                }`}>{s.avg}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">điểm TB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
