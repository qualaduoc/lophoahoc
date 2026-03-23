import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AntiCheatGuard } from '../components/AntiCheatGuard';
import { toast } from 'sonner';

// ===== ASSIGNMENT LIST PAGE =====
export const Assignments = () => {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ data: assignData }, { data: subData }] = await Promise.all([
        supabase.from('assignments').select('*').eq('is_published', true).order('created_at', { ascending: false }),
        supabase.from('submissions').select('*').eq('student_id', user.id),
      ]);

      // Filter: chỉ hiện bài tập dành cho lớp của học sinh (hoặc bài không giới hạn lớp)
      const myClass = profile?.class_name?.trim()?.toLowerCase() || '';
      const filtered = (assignData || []).filter(a => {
        if (!a.target_class) return true; // Không giới hạn → hiện cho tất cả
        return a.target_class.trim().toLowerCase() === myClass;
      });

      setAssignments(filtered);
      setSubmissions(subData || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const getSubmission = (id) => submissions.find(s => s.assignment_id === id);

  const startQuiz = async (assignment) => {
    const existing = getSubmission(assignment.id);
    if (existing?.is_completed) return;
    if (!existing) {
      const { data, error } = await supabase.from('submissions')
        .insert({ assignment_id: assignment.id, student_id: user.id }).select().single();
      if (error) { console.error(error); return; }
      setSubmissions([...submissions, data]);
    }
    const { data: questions } = await supabase.from('questions')
      .select('*').eq('assignment_id', assignment.id).order('sort_order');
    setActiveQuiz({ assignment, questions: questions || [] });
  };

  if (activeQuiz) {
    return (
      <QuizTaker
        assignment={activeQuiz.assignment}
        questions={activeQuiz.questions}
        submission={getSubmission(activeQuiz.assignment.id)}
        userId={user.id}
        onFinish={() => { setActiveQuiz(null); fetchData(); }}
      />
    );
  }

  if (loading) return <div className="text-center py-12"><p className="text-os-text-muted">⏳ Đang tải bài tập...</p></div>;

  return (
    <div>
      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📋</p>
          <h3 className="text-lg font-bold text-os-text mb-1">Chưa có bài tập nào</h3>
          <p className="text-sm text-os-text-muted">Giáo viên chưa giao bài. Quay lại sau nhé!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => {
            const sub = getSubmission(a.id);
            const isCompleted = sub?.is_completed;
            const isCheated = sub?.cheat_flags >= 2;
            const isExpired = a.due_date && new Date(a.due_date) < new Date();

            return (
              <div key={a.id} className={`border-2 border-os-border rounded-lg p-4 bg-os-bg-light transition-all hover:shadow-md ${isCompleted || isExpired ? 'opacity-75' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-wider ${
                        a.type === 'quiz' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {a.type === 'quiz' ? '📋 Trắc nghiệm' : '✍️ Tự luận'}
                      </span>
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded border text-[10px] font-black bg-green-50 text-green-700 border-green-200">✅ Đã nộp</span>
                      )}
                      {isCheated && (
                        <span className="px-2 py-0.5 rounded border text-[10px] font-black bg-red-50 text-red-700 border-red-200">🚫 Gian lận</span>
                      )}
                      {isExpired && !isCompleted && (
                        <span className="px-2 py-0.5 rounded border text-[10px] font-black bg-red-50 text-red-600 border-red-200">⏰ Hết hạn</span>
                      )}
                      {!isCompleted && !sub && !isExpired && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-os-text mb-1">{a.title}</h3>
                    {a.description && <p className="text-xs text-os-text-muted mb-1.5">{a.description}</p>}
                    <div className="flex items-center gap-3 text-[11px] text-os-text-muted flex-wrap">
                      {a.time_limit_minutes && <span>⏱ {a.time_limit_minutes} phút</span>}
                      {a.due_date && (
                        <span className={isExpired ? 'text-red-500 font-bold' : ''}>
                          📅 Hạn: {new Date(a.due_date).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {a.target_class && <span>🎯 Lớp {a.target_class}</span>}
                      {isCompleted && sub?.score !== null && (
                        <span className="font-black text-os-green">💯 {sub.score}/{sub.total_points}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => startQuiz(a)}
                    disabled={isCompleted || isExpired}
                    className={`shrink-0 text-sm ${
                      isCompleted || isExpired
                        ? 'retro-btn opacity-50 cursor-not-allowed'
                        : 'retro-btn retro-btn-primary'
                    }`}
                  >
                    {isCompleted ? 'Đã nộp' : isExpired ? '⏰ Hết hạn' : sub ? '▶ Tiếp tục' : '▶ Làm bài'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ===== QUIZ TAKER COMPONENT =====
const QuizTaker = ({ assignment, questions, submission, userId, onFinish }) => {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((assignment.time_limit_minutes || 30) * 60);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const handleAnswer = (qid, ans) => setAnswers(prev => ({ ...prev, [qid]: ans }));

  const handleCheatingDetected = useCallback(async () => {
    if (submission) {
      await supabase.from('submissions').update({
        score: 0, total_points: questions.reduce((s, q) => s + (q.points || 1), 0),
        is_completed: true, cheat_flags: 2,
        cheat_log: [{ type: 'tab_switch', count: 2, timestamp: new Date().toISOString() }],
        submitted_at: new Date().toISOString(),
      }).eq('id', submission.id);
    }
    setSubmitted(true); setScore(0);
  }, [submission, questions]);

  const handleSubmit = async (isTimeout = false) => {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      let totalScore = 0;
      const totalPoints = questions.reduce((s, q) => s + (q.points || 1), 0);
      for (const q of questions) {
        const given = answers[q.id] || '';
        let correct = false;
        if (q.type === 'multiple_choice' && q.correct_answer) correct = given === q.correct_answer;
        if (correct) totalScore += (q.points || 1);
        await supabase.from('student_answers').upsert({
          submission_id: submission.id, question_id: q.id,
          answer_given: given, is_correct: q.type === 'multiple_choice' ? correct : null,
        }, { onConflict: 'submission_id,question_id' });
      }
      await supabase.from('submissions').update({
        score: totalScore, total_points: totalPoints,
        is_completed: true, submitted_at: new Date().toISOString(),
      }).eq('id', submission.id);
      setScore(totalScore); setSubmitted(true);
    } catch (err) {
      toast.error('Lỗi khi nộp bài: ' + err.message);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="max-w-sm mx-auto py-8">
        <div className="border-2 border-os-border rounded-lg overflow-hidden">
          <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-2">
            <span className="text-xs font-black text-os-text uppercase">✅ Kết quả</span>
          </div>
          <div className="p-6 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <h2 className="text-lg font-black text-os-text mb-2">Đã Nộp Bài!</h2>
            {score !== null && (
              <p className="text-3xl font-black text-os-accent my-3">
                {score}/{questions.reduce((s, q) => s + (q.points || 1), 0)} điểm
              </p>
            )}
            <button onClick={onFinish} className="retro-btn retro-btn-primary mt-3">
              ← Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AntiCheatGuard onCheatingDetected={handleCheatingDetected}>
      <div>
        {/* Timer Header */}
        <div className="border-2 border-os-border rounded-lg p-3 mb-4 flex items-center justify-between bg-os-bg-light sticky top-0 z-30">
          <div>
            <h2 className="font-bold text-os-text text-sm">{assignment.title}</h2>
            <p className="text-[10px] text-os-text-muted">{questions.length} câu hỏi</p>
          </div>
          <div className={`text-xl font-black px-3 py-1.5 rounded-lg border-2 font-mono ${
            timeLeft < 60 ? 'bg-red-50 text-os-red border-red-300 animate-pulse' :
            timeLeft < 300 ? 'bg-amber-50 text-os-yellow border-amber-300' : 'bg-os-bg-light text-os-text border-os-border'
          }`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Anti-cheat notice */}
        <div className="bg-amber-50 border-2 border-amber-300 text-amber-800 p-2.5 rounded-lg flex text-xs items-start gap-2 mb-4">
          <span>⚠️</span>
          <span><b>Anti-Cheat:</b> Không chuyển tab. Vi phạm 2 lần = 0 điểm.</span>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="border-2 border-os-border rounded-lg p-4 bg-os-bg-light">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-os-accent text-white flex items-center justify-center font-black text-sm shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-os-text mb-3 leading-relaxed">{q.content}</h3>
                  {q.type === 'multiple_choice' && q.options ? (
                    <div className="space-y-2">
                      {(typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((opt, oi) => (
                        <label
                          key={oi}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            answers[q.id] === opt
                              ? 'bg-os-accent/10 border-os-accent'
                              : 'border-os-border hover:bg-os-bg hover:border-os-warm'
                          }`}
                        >
                          <input
                            type="radio" name={`q-${q.id}`} value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => handleAnswer(q.id, opt)}
                            className="w-4 h-4 accent-os-accent"
                          />
                          <span className="ml-3 font-medium text-sm text-os-text">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={e => handleAnswer(q.id, e.target.value)}
                      placeholder="Nhập câu trả lời..."
                      rows={3}
                      className="retro-input resize-y"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-5 pb-4">
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className={`w-full retro-btn retro-btn-primary py-3.5 text-base ${submitting ? 'opacity-70' : ''}`}
          >
            {submitting ? '⏳ Đang nộp...' : `📤 NỘP BÀI (${Object.keys(answers).length}/${questions.length} câu)`}
          </button>
        </div>
      </div>
    </AntiCheatGuard>
  );
};
