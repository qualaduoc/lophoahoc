import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ChevronRight, MessageSquare, Save } from 'lucide-react';

const GradeTab = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState({});
  const [error, setError] = useState(null);
  const [expandedSub, setExpandedSub] = useState(null);
  const [answerDetails, setAnswerDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState(null);
  const [essayScores, setEssayScores] = useState({}); // { answerId: score }
  const [savingScore, setSavingScore] = useState(null);

  const toggleExpand = async (submissionId) => {
    if (expandedSub === submissionId) { setExpandedSub(null); return; }
    if (answerDetails[submissionId]) { setExpandedSub(submissionId); return; }

    setDetailLoading(submissionId);
    try {
      const { data: answers, error: aErr } = await supabase
        .from('student_answers')
        .select('*, questions!inner(content, type, correct_answer, options, points, sort_order)')
        .eq('submission_id', submissionId)
        .order('questions(sort_order)');

      if (aErr) throw aErr;

      const details = (answers || []).map(a => ({
        id: a.id,
        question_content: a.questions?.content,
        question_type: a.questions?.type,
        answer_given: a.answer_given,
        correct_answer: a.questions?.correct_answer,
        is_correct: a.is_correct,
        options: typeof a.questions?.options === 'string' ? JSON.parse(a.questions.options) : (a.questions?.options || []),
        points: a.questions?.points || 1,
        score_given: a.score_given ?? null,
        sort_order: a.questions?.sort_order || 0,
      })).sort((a, b) => a.sort_order - b.sort_order);

      // Init essay scores
      const scores = {};
      details.forEach(d => {
        if (d.question_type === 'essay') {
          scores[d.id] = d.score_given ?? '';
        }
      });
      setEssayScores(prev => ({ ...prev, ...scores }));
      setAnswerDetails(prev => ({ ...prev, [submissionId]: details }));
      setExpandedSub(submissionId);
    } catch (err) {
      console.error('Load answer details error:', err);
      toast.error('Lỗi tải chi tiết: ' + err.message);
    } finally {
      setDetailLoading(null);
    }
  };

  // Save essay score for a single answer
  const saveEssayScore = async (answerId, submissionId, maxPoints) => {
    const score = parseFloat(essayScores[answerId]);
    if (isNaN(score) || score < 0 || score > maxPoints) {
      toast.error(`Điểm phải từ 0 đến ${maxPoints}`);
      return;
    }
    setSavingScore(answerId);
    try {
      await supabase.from('student_answers').update({
        score_given: score,
        is_correct: score > 0,
      }).eq('id', answerId);

      // Recalculate total submission score
      const details = answerDetails[submissionId];
      let totalScore = 0;
      for (const d of details) {
        if (d.id === answerId) {
          totalScore += score;
        } else if (d.question_type === 'essay') {
          totalScore += (d.score_given ?? 0);
        } else {
          totalScore += d.is_correct ? d.points : 0;
        }
      }

      await supabase.from('submissions').update({ score: totalScore }).eq('id', submissionId);

      // Update local details
      setAnswerDetails(prev => ({
        ...prev,
        [submissionId]: prev[submissionId].map(d =>
          d.id === answerId ? { ...d, score_given: score, is_correct: score > 0 } : d
        ),
      }));

      // Update submission score locally
      setSubmissions(prev => prev.map(s =>
        s.id === submissionId ? { ...s, score: totalScore } : s
      ));

      toast.success(`Đã chấm ${score}/${maxPoints} điểm!`);
    } catch (err) {
      toast.error('Lỗi chấm: ' + err.message);
    } finally {
      setSavingScore(null);
    }
  };

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
      if (qErr) throw qErr;
      setAssignments(data || []);
    } catch (err) {
      console.error('GradeTab error:', err);
      setError(err.message);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAssignments(); }, []);

  const loadSubmissions = async (assignmentId) => {
    setSelectedAssignment(assignmentId);
    try {
      const { data, error: qErr } = await supabase
        .from('submissions')
        .select('*, users!inner(full_name, class_name)')
        .eq('assignment_id', assignmentId)
        .eq('is_completed', true)
        .order('submitted_at', { ascending: false });
      if (qErr) throw qErr;
      setSubmissions(data || []);
      const fb = {};
      (data || []).forEach(s => { fb[s.id] = s.teacher_feedback || ''; });
      setFeedbacks(fb);
    } catch (err) {
      console.error('loadSubmissions error:', err);
      toast.error('Lỗi tải bài nộp: ' + err.message);
      setSubmissions([]);
    }
  };

  const saveFeedback = async (submissionId) => {
    try {
      const { error: qErr } = await supabase.from('submissions').update({ teacher_feedback: feedbacks[submissionId] }).eq('id', submissionId);
      if (qErr) throw qErr;
      toast.success('Đã lưu nhận xét! ✅');
    } catch (err) { toast.error('Lỗi: ' + err.message); }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">⏳ Đang tải bài tập...</div>;
  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500 font-bold mb-2">⚠️ Không thể tải danh sách bài tập</p>
      <p className="text-xs text-gray-400 mb-3">{error}</p>
      <button onClick={loadAssignments} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-200">🔄 Thử lại</button>
    </div>
  );

  if (!selectedAssignment) {
    return (
      <div className="space-y-3">
        {assignments.length === 0 && <p className="text-center py-12 text-gray-400">Chưa có bài tập nào.</p>}
        {assignments.map(a => (
          <button key={a.id} onClick={() => loadSubmissions(a.id)}
            className="glass rounded-xl p-5 w-full text-left flex items-center justify-between hover:shadow-md transition-all group">
            <div>
              <h4 className="font-bold text-gray-900">{a.title}</h4>
              <p className="text-xs text-gray-400 mt-1">
                {a.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'} · {a.time_limit_minutes} phút · {a.is_published ? '✅ Công khai' : '🔒 Ẩn'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => { setSelectedAssignment(null); setExpandedSub(null); }} className="text-sm font-bold text-purple-600 hover:text-purple-800 mb-4 flex items-center gap-1">
        ← Quay lại danh sách
      </button>
      <div className="space-y-4">
        {submissions.length === 0 && <p className="text-center py-12 text-gray-400">Chưa có bài nộp nào.</p>}
        {submissions.map(s => (
          <div key={s.id} className="glass rounded-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-lg">{s.users?.full_name}</p>
                  <p className="text-xs text-gray-400">{s.users?.class_name} · Nộp lúc {s.submitted_at ? new Date(s.submitted_at).toLocaleString('vi-VN') : '—'}</p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-black ${(s.score / (s.total_points || 1)) >= 0.5 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {s.score ?? '?'}<span className="text-lg text-gray-400">/{s.total_points ?? '?'}</span>
                  </p>
                  {s.cheat_flags >= 2 && <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-0.5 rounded-full">⚠️ Gian lận</span>}
                </div>
              </div>

              <button onClick={() => toggleExpand(s.id)}
                className={`w-full text-sm font-bold py-2 rounded-lg border-2 transition-all mb-3 ${
                  expandedSub === s.id ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-200'
                }`}>
                {expandedSub === s.id ? '🔼 Ẩn bài làm' : '🔽 Xem bài làm chi tiết'}
                {detailLoading === s.id && ' ⏳'}
              </button>

              {expandedSub === s.id && answerDetails[s.id] && (
                <div className="border-2 border-gray-100 rounded-xl overflow-hidden mb-3">
                  {answerDetails[s.id].map((item, idx) => (
                    <div key={idx} className={`p-4 ${idx > 0 ? 'border-t-2 border-gray-100' : ''} ${
                      item.question_type === 'essay'
                        ? 'bg-amber-50/30'
                        : item.is_correct === true ? 'bg-green-50/50' : item.is_correct === false ? 'bg-red-50/50' : 'bg-gray-50/50'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                          item.question_type === 'essay'
                            ? (item.score_given !== null ? 'bg-amber-500 text-white' : 'bg-amber-300 text-white')
                            : item.is_correct === true ? 'bg-green-500 text-white'
                            : item.is_correct === false ? 'bg-red-500 text-white'
                            : 'bg-gray-300 text-white'
                        }`}>
                          {item.question_type === 'essay' ? '✍' : item.is_correct === true ? '✓' : item.is_correct === false ? '✗' : (idx + 1)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-bold text-gray-800 text-sm">Câu {idx + 1}: {item.question_content}</p>
                            {item.question_type === 'essay' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">✍️ Tự luận</span>
                            )}
                          </div>

                          {/* Student answer */}
                          <div className={`text-sm mb-1 ${
                            item.question_type === 'essay' ? 'text-gray-700' :
                            item.is_correct === false ? 'text-red-600' : 'text-gray-700'
                          }`}>
                            <span className="font-bold">📝 HS trả lời:</span>{' '}
                            {item.question_type === 'essay' ? (
                              <div className="mt-1 bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap">
                                {item.answer_given || <em className="text-gray-400">Không trả lời</em>}
                              </div>
                            ) : (
                              <span className={item.is_correct === false ? 'line-through opacity-70' : 'font-medium'}>
                                {item.answer_given || <em className="text-gray-400">Không trả lời</em>}
                              </span>
                            )}
                          </div>

                          {/* Correct answer (MC only, when wrong) */}
                          {item.question_type !== 'essay' && item.is_correct === false && item.correct_answer && (
                            <div className="flex items-start gap-2 text-sm text-green-700">
                              <span className="font-bold shrink-0">✅ Đáp án đúng:</span>
                              <span className="font-medium">{item.correct_answer}</span>
                            </div>
                          )}

                          {/* MC options */}
                          {item.options && item.options.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.options.map((opt, oi) => (
                                <span key={oi} className={`text-xs px-2 py-1 rounded-lg border ${
                                  opt === item.correct_answer ? 'bg-green-100 border-green-300 text-green-700 font-bold' :
                                  opt === item.answer_given && item.is_correct === false ? 'bg-red-100 border-red-300 text-red-600 line-through' :
                                  'bg-gray-100 border-gray-200 text-gray-500'
                                }`}>
                                  {String.fromCharCode(65 + oi)}. {opt}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Essay manual grading */}
                          {item.question_type === 'essay' && (
                            <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                              <span className="text-xs font-bold text-amber-700 shrink-0">Chấm điểm:</span>
                              <input
                                type="number" min={0} max={item.points} step={0.5}
                                value={essayScores[item.id] ?? ''}
                                onChange={e => setEssayScores(prev => ({ ...prev, [item.id]: e.target.value }))}
                                placeholder={`0-${item.points}`}
                                className="w-20 px-2 py-1.5 border border-amber-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                              />
                              <span className="text-xs text-amber-600">/ {item.points}</span>
                              <button
                                onClick={() => saveEssayScore(item.id, s.id, item.points)}
                                disabled={savingScore === item.id}
                                className="ml-auto px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" /> {savingScore === item.id ? '...' : 'Lưu'}
                              </button>
                              {item.score_given !== null && (
                                <span className="text-xs font-bold text-green-600">✅ Đã chấm: {item.score_given}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input value={feedbacks[s.id] || ''} onChange={e => setFeedbacks({ ...feedbacks, [s.id]: e.target.value })}
                  placeholder="Nhập nhận xét cho học sinh..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
                <button onClick={() => saveFeedback(s.id)} className="px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Gửi
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradeTab;
