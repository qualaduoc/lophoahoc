import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const CompletedAssignments = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from('submissions')
        .select('*, assignments(title, type, time_limit_minutes)')
        .eq('student_id', user.id)
        .eq('is_completed', true)
        .order('submitted_at', { ascending: false });
      setSubmissions(data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="text-center py-12"><p className="text-os-text-muted">⏳ Đang tải...</p></div>;
  }

  return (
    <div>
      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <h3 className="text-lg font-bold text-os-text mb-1">Chưa hoàn thành bài nào</h3>
          <p className="text-sm text-os-text-muted">Hãy vào mục Bài Tập để bắt đầu!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(s => (
            <div key={s.id} className="border-2 border-os-border rounded-lg p-4 bg-os-bg-light">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-os-text">{s.assignments?.title || 'Bài tập'}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-os-text-muted">
                    <span>🕐 {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                    {s.cheat_flags >= 2 && (
                      <span className="text-os-red font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">🚫 Gian lận</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-black ${
                    s.score === 0 ? 'text-os-red' :
                    (s.score / (s.total_points || 1)) >= 0.8 ? 'text-os-green' : 'text-os-yellow'
                  }`}>
                    {s.score ?? '—'}<span className="text-sm text-os-text-muted">/{s.total_points ?? '?'}</span>
                  </div>
                  <p className="text-[10px] text-os-text-muted font-bold uppercase">điểm</p>
                </div>
              </div>
              {s.teacher_feedback && (
                <div className="mt-3 bg-sky-50 border-2 border-sky-200 rounded-lg p-3 flex items-start gap-2">
                  <span className="text-sm">💬</span>
                  <div>
                    <p className="text-[10px] font-black text-sky-600 uppercase tracking-wider mb-0.5">Nhận xét của giáo viên</p>
                    <p className="text-sm text-sky-900">{s.teacher_feedback}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
