import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, MessageSquare, Clock } from 'lucide-react';

export const CompletedAssignments = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('submissions')
        .select('*, assignments(title, type, time_limit_minutes)')
        .eq('student_id', user.id)
        .eq('is_completed', true)
        .order('submitted_at', { ascending: false });
      setSubmissions(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-sky-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2.5 rounded-xl">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Bài Tập Đã Làm</h1>
          <p className="text-sm text-gray-500">{submissions.length} bài đã hoàn thành</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa hoàn thành bài nào</h3>
          <p className="text-gray-500">Hãy vào mục Bài Tập để bắt đầu!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(s => (
            <div key={s.id} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{s.assignments?.title || 'Bài tập'}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                    {s.cheat_flags >= 2 && (
                      <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-0.5 rounded-full">Gian lận</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-black ${
                    s.score === 0 ? 'text-red-500' :
                    (s.score / (s.total_points || 1)) >= 0.8 ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {s.score ?? '—'}<span className="text-lg text-gray-400">/{s.total_points ?? '?'}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">điểm</p>
                </div>
              </div>
              {s.teacher_feedback && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Nhận xét của giáo viên</p>
                    <p className="text-sm text-blue-900">{s.teacher_feedback}</p>
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
