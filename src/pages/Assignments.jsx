import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AntiCheatGuard } from '../components/AntiCheatGuard';
import { ClipboardList, Clock, AlertTriangle, CheckCircle, Send, ChevronRight } from 'lucide-react';

// ===== ASSIGNMENT LIST PAGE =====
export const Assignments = () => {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: assignData } = await supabase
        .from('assignments')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', user.id);

      setAssignments(assignData || []);
      setSubmissions(subData || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getSubmission = (assignmentId) => {
    return submissions.find(s => s.assignment_id === assignmentId);
  };

  const startQuiz = async (assignment) => {
    const existing = getSubmission(assignment.id);
    if (existing?.is_completed) return;

    // Create submission if not exists
    if (!existing) {
      const { data, error } = await supabase
        .from('submissions')
        .insert({ assignment_id: assignment.id, student_id: user.id })
        .select()
        .single();
      if (error) { console.error(error); return; }
      setSubmissions([...submissions, data]);
    }

    // Fetch questions
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('assignment_id', assignment.id)
      .order('sort_order');

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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-sky-500 mx-auto mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <p className="text-gray-500 font-medium">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-xl">
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Bài Tập Được Giao</h1>
          <p className="text-sm text-gray-500">{assignments.length} bài tập</p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ClipboardList className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có bài tập nào</h3>
          <p className="text-gray-500">Giáo viên chưa giao bài tập. Hãy quay lại sau nhé!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(a => {
            const sub = getSubmission(a.id);
            const isCompleted = sub?.is_completed;
            const isCheated = sub?.cheat_flags >= 2;

            return (
              <div key={a.id} className={`glass rounded-2xl p-6 transition-all hover:shadow-lg ${isCompleted ? 'opacity-80' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        a.type === 'quiz' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {a.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                      </span>
                      {isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Đã nộp
                        </span>
                      )}
                      {isCheated && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Nghi gian lận
                        </span>
                      )}
                      {!isCompleted && !sub && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{a.title}</h3>
                    {a.description && <p className="text-sm text-gray-500 mb-2">{a.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {a.time_limit_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {a.time_limit_minutes} phút
                        </span>
                      )}
                      {a.due_date && (
                        <span>Hạn: {new Date(a.due_date).toLocaleDateString('vi-VN')}</span>
                      )}
                      {isCompleted && sub?.score !== null && (
                        <span className="font-bold text-emerald-600 text-sm">Điểm: {sub.score}/{sub.total_points}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => startQuiz(a)}
                    disabled={isCompleted}
                    className={`shrink-0 ml-4 px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                      isCompleted
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5'
                    }`}
                  >
                    {isCompleted ? 'Đã nộp' : sub ? 'Tiếp tục' : 'Làm bài'}
                    {!isCompleted && <ChevronRight className="w-4 h-4" />}
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

  // Countdown timer
  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleCheatingDetected = useCallback(async () => {
    // Force submit with 0 score
    if (submission) {
      await supabase.from('submissions').update({
        score: 0,
        total_points: questions.reduce((s, q) => s + (q.points || 1), 0),
        is_completed: true,
        cheat_flags: 2,
        cheat_log: [{ type: 'tab_switch', count: 2, timestamp: new Date().toISOString() }],
        submitted_at: new Date().toISOString(),
      }).eq('id', submission.id);
    }
    setSubmitted(true);
    setScore(0);
  }, [submission, questions]);

  const handleSubmit = async (isTimeout = false) => {
    if (submitting || submitted) return;
    setSubmitting(true);

    try {
      // Auto-grade MC questions
      let totalScore = 0;
      const totalPoints = questions.reduce((s, q) => s + (q.points || 1), 0);
      const answerInserts = [];

      for (const q of questions) {
        const given = answers[q.id] || '';
        let correct = false;
        if (q.type === 'multiple_choice' && q.correct_answer) {
          correct = given === q.correct_answer;
        }
        if (correct) totalScore += (q.points || 1);

        answerInserts.push({
          submission_id: submission.id,
          question_id: q.id,
          answer_given: given,
          is_correct: q.type === 'multiple_choice' ? correct : null,
        });
      }

      // Upsert answers
      for (const ans of answerInserts) {
        await supabase.from('student_answers').upsert(ans, { onConflict: 'submission_id,question_id' });
      }

      // Update submission
      await supabase.from('submissions').update({
        score: totalScore,
        total_points: totalPoints,
        is_completed: true,
        submitted_at: new Date().toISOString(),
      }).eq('id', submission.id);

      setScore(totalScore);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi nộp bài: ' + err.message);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12">
        <div className="glass rounded-3xl p-10 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Đã Nộp Bài!</h2>
          {score !== null && (
            <p className="text-4xl font-black text-emerald-600 my-4">
              {score}/{questions.reduce((s, q) => s + (q.points || 1), 0)} điểm
            </p>
          )}
          <button onClick={onFinish} className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <AntiCheatGuard onCheatingDetected={handleCheatingDetected}>
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="glass rounded-2xl p-5 mb-6 sticky top-20 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{assignment.title}</h2>
              <p className="text-sm text-gray-500">{questions.length} câu hỏi</p>
            </div>
            <div className={`text-2xl font-black tabular-nums px-4 py-2 rounded-xl ${
              timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 
              timeLeft < 300 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-700'
            }`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>
          {/* Anti-cheat warning */}
          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl flex text-xs items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span><b>Anti-Cheat:</b> Hệ thống đang giám sát. Không chuyển tab hoặc ẩn trình duyệt khi làm bài.</span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="glass rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-lg shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg leading-relaxed">{q.content}</h3>

                  {q.type === 'multiple_choice' && q.options ? (
                    <div className="space-y-2">
                      {(typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((opt, oi) => (
                        <label
                          key={oi}
                          className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-all ${
                            answers[q.id] === opt
                              ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-200'
                              : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => handleAnswer(q.id, opt)}
                            className="w-4 h-4 text-sky-600"
                          />
                          <span className="ml-3 font-medium text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={e => handleAnswer(q.id, e.target.value)}
                      placeholder="Nhập câu trả lời tự luận..."
                      rows={4}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-y"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-8 pb-8">
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70"
          >
            {submitting ? (
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <Send className="w-5 h-5" />
            )}
            {submitting ? 'Đang nộp...' : 'NỘP BÀI'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Đã trả lời {Object.keys(answers).length}/{questions.length} câu
          </p>
        </div>
      </div>
    </AntiCheatGuard>
  );
};
