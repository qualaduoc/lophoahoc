import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const StudentDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSubs, setRecentSubs] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [subRes, badgeRes, assignRes] = await Promise.all([
        supabase.from('submissions').select('*, assignments(title, type)')
          .eq('student_id', user.id).order('submitted_at', { ascending: false }).limit(5),
        supabase.from('user_badges').select('*, badges(name, icon, description)').eq('user_id', user.id),
        supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('is_published', true),
      ]);

      const subs = subRes.data || [];
      const completedSubs = subs.filter(s => s.is_completed);
      const totalScore = completedSubs.reduce((acc, s) => acc + (s.score || 0), 0);
      const totalPoints = completedSubs.reduce((acc, s) => acc + (s.total_points || 0), 0);

      setStats({
        completed: completedSubs.length,
        totalAssignments: assignRes.count || 0,
        avgScore: totalPoints > 0 ? ((totalScore / totalPoints) * 10).toFixed(1) : '—',
        totalScore,
      });
      setRecentSubs(subs);
      setBadges(badgeRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div>
        <Skeleton height={30} width={250} className="mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[1,2,3,4].map(i => <Skeleton key={i} height={80} borderRadius={8} />)}
        </div>
        <Skeleton height={150} borderRadius={8} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { icon: '✅', label: 'Bài đã làm', value: `${stats.completed}/${stats.totalAssignments}`, bg: 'bg-emerald-50 border-emerald-200' },
          { icon: '📊', label: 'Điểm TB', value: stats.avgScore, bg: 'bg-sky-50 border-sky-200' },
          { icon: '🏅', label: 'Huy hiệu', value: badges.length, bg: 'bg-amber-50 border-amber-200' },
          { icon: '⭐', label: 'Tổng điểm', value: stats.totalScore, bg: 'bg-pink-50 border-pink-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border-2 rounded-lg p-3 text-center`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-xl font-black text-os-text">{s.value}</p>
            <p className="text-[10px] font-bold text-os-text-muted uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
        {[
          { path: '/assignments', icon: '📝', label: 'Làm bài tập', color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
          { path: '/lab', icon: '🧪', label: 'Phòng TN ảo', color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
          { path: '/table', icon: '⚛️', label: 'Bảng tuần hoàn', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
          { path: '/leaderboard', icon: '🏆', label: 'Xếp hạng', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
        ].map(a => (
          <button
            key={a.path}
            onClick={() => navigate(a.path)}
            className={`${a.color} border-2 rounded-lg p-3 flex items-center gap-2 font-bold text-sm text-os-text cursor-pointer transition-all`}
          >
            <span className="text-lg">{a.icon}</span> {a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Submissions */}
        <div className="md:col-span-2 border-2 border-os-border rounded-lg overflow-hidden">
          <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-2">
            <h3 className="text-xs font-black text-os-text uppercase tracking-wider">📋 Bài tập gần đây</h3>
          </div>
          <div className="p-3">
            {recentSubs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-sm text-os-text-muted">Chưa làm bài nào</p>
                <button onClick={() => navigate('/assignments')} className="retro-btn retro-btn-primary text-xs mt-3">
                  Xem bài tập →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSubs.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 bg-os-bg-light rounded-lg border border-os-border/50">
                    <div>
                      <p className="font-bold text-sm text-os-text">{s.assignments?.title || 'Bài tập'}</p>
                      <p className="text-[10px] text-os-text-muted">
                        {s.is_completed ? '✅ Đã nộp' : '⏳ Đang làm'}
                        {s.submitted_at && ` · ${new Date(s.submitted_at).toLocaleDateString('vi-VN')}`}
                      </p>
                    </div>
                    {s.is_completed && s.score !== null && (
                      <span className={`text-lg font-black ${
                        (s.score / (s.total_points || 1)) >= 0.8 ? 'text-os-green' :
                        (s.score / (s.total_points || 1)) >= 0.5 ? 'text-os-yellow' : 'text-os-red'
                      }`}>
                        {s.score}<span className="text-xs text-os-text-muted">/{s.total_points}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="border-2 border-os-border rounded-lg overflow-hidden">
          <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-2">
            <h3 className="text-xs font-black text-os-text uppercase tracking-wider">🏅 Huy hiệu</h3>
          </div>
          <div className="p-3">
            {badges.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">🎖️</p>
                <p className="text-xs text-os-text-muted">Hoàn thành bài tập<br/>để nhận huy hiệu!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {badges.map(b => (
                  <div key={b.id} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="text-xl">{b.badges?.icon || '🏅'}</span>
                    <div>
                      <p className="font-bold text-xs text-os-text">{b.badges?.name}</p>
                      <p className="text-[10px] text-os-text-muted">{b.badges?.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
