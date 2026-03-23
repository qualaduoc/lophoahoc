import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, PlusCircle, ClipboardCheck, AlertTriangle,
  ChevronRight, Trash2, Save, Eye, EyeOff, X, MessageSquare, Check
} from 'lucide-react';

// ===== TEACHER DASHBOARD - Tab Navigation =====
export const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'students', label: 'Danh sách HS', icon: Users },
    { id: 'create', label: 'Tạo bài tập', icon: PlusCircle },
    { id: 'grade', label: 'Chấm điểm', icon: ClipboardCheck },
    { id: 'cheats', label: 'Gian lận', icon: AlertTriangle },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-purple-500/25">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Bảng Điều Khiển Giáo Viên</h1>
          <p className="text-sm text-gray-500">Quản lý lớp học, bài tập & chấm điểm</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-800 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
              {tab.id === 'cheats' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'students' && <StudentsTab />}
      {activeTab === 'create' && <CreateAssignmentTab />}
      {activeTab === 'grade' && <GradeTab />}
      {activeTab === 'cheats' && <CheatsTab />}
    </div>
  );
};

// ===== OVERVIEW TAB =====
const OverviewTab = () => {
  const [stats, setStats] = useState({ students: 0, assignments: 0, submissions: 0, cheats: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [s, a, sub, ch] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('assignments').select('id', { count: 'exact', head: true }),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('is_completed', true),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).gte('cheat_flags', 2),
      ]);
      setStats({
        students: s.count || 0,
        assignments: a.count || 0,
        submissions: sub.count || 0,
        cheats: ch.count || 0,
      });
    };
    fetch();
  }, []);

  const cards = [
    { label: 'Học sinh', value: stats.students, color: 'from-sky-500 to-blue-600', icon: Users },
    { label: 'Bài tập', value: stats.assignments, color: 'from-purple-500 to-indigo-600', icon: ClipboardCheck },
    { label: 'Bài đã nộp', value: stats.submissions, color: 'from-emerald-500 to-green-600', icon: Check },
    { label: 'Nghi gian lận', value: stats.cheats, color: 'from-red-500 to-rose-600', icon: AlertTriangle },
  ];

  return (
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
  );
};

// ===== STUDENTS TAB =====
const StudentsTab = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('users').select('*').eq('role', 'student').order('class_name').order('full_name');
      setStudents(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Đang tải...</div>;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-800">Danh sách học sinh ({students.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">STT</th>
              <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Họ và tên</th>
              <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Lớp</th>
              <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">SĐT Phụ huynh</th>
              <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Ngày tham gia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((s, i) => (
              <tr key={s.id} className="hover:bg-sky-50/50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-400">{i + 1}</td>
                <td className="px-5 py-3.5 font-bold text-gray-900">{s.full_name}</td>
                <td className="px-5 py-3.5"><span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs font-bold">{s.class_name || '—'}</span></td>
                <td className="px-5 py-3.5 text-gray-600">{s.parent_phone || '—'}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && <p className="text-center py-8 text-gray-400">Chưa có học sinh nào đăng ký.</p>}
      </div>
    </div>
  );
};

// ===== CREATE ASSIGNMENT TAB =====
const CreateAssignmentTab = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'quiz',
    time_limit_minutes: 30,
    is_published: false,
  });
  const [questions, setQuestions] = useState([
    { content: '', type: 'multiple_choice', correct_answer: '', options: ['', '', '', ''], points: 1 },
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { content: '', type: 'multiple_choice', correct_answer: '', options: ['', '', '', ''], points: 1 }]);
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề bài tập'); return; }
    if (questions.some(q => !q.content.trim())) { toast.error('Vui lòng nhập nội dung tất cả câu hỏi'); return; }

    setSaving(true);
    try {
      // Create assignment
      const { data: assignment, error: aErr } = await supabase
        .from('assignments')
        .insert({
          teacher_id: user.id,
          title: form.title,
          description: form.description,
          type: form.type,
          time_limit_minutes: form.time_limit_minutes,
          is_published: form.is_published,
        })
        .select()
        .single();

      if (aErr) throw aErr;

      // Create questions
      const qInserts = questions.map((q, i) => ({
        assignment_id: assignment.id,
        content: q.content,
        type: q.type,
        correct_answer: q.correct_answer || null,
        options: q.type === 'multiple_choice' ? q.options.filter(o => o.trim()) : null,
        points: q.points,
        sort_order: i,
      }));

      const { error: qErr } = await supabase.from('questions').insert(qInserts);
      if (qErr) throw qErr;

      setSaved(true);
      // Reset form
      setForm({ title: '', description: '', type: 'quiz', time_limit_minutes: 30, is_published: false });
      setQuestions([{ content: '', type: 'multiple_choice', correct_answer: '', options: ['', '', '', ''], points: 1 }]);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error('Lỗi: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl">
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 font-medium flex items-center gap-2">
          <Check className="w-5 h-5" /> Tạo bài tập thành công!
        </div>
      )}

      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Thông tin bài tập</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Tiêu đề *</label>
            <input
              type="text" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Kiểm tra chương Nguyên tử"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả ngắn về bài tập..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Thời gian (phút)</label>
              <input
                type="number" value={form.time_limit_minutes} min={5} max={180}
                onChange={e => setForm({ ...form, time_limit_minutes: parseInt(e.target.value) || 30 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setForm({ ...form, is_published: !form.is_published })}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm border transition-all w-full justify-center ${
                  form.is_published
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                {form.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {form.is_published ? 'Đã công khai' : 'Chưa công khai'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <h3 className="font-bold text-gray-800 text-lg mb-4">Câu hỏi ({questions.length})</h3>
      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi} className="glass rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black">Câu {qi + 1}</span>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <textarea
              value={q.content}
              onChange={e => updateQuestion(qi, 'content', e.target.value)}
              placeholder="Nhập nội dung câu hỏi..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white resize-y mb-4"
            />

            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuestion(qi, 'correct_answer', opt)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      q.correct_answer === opt && opt
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 text-gray-300 hover:border-green-400'
                    }`}
                    title="Đáp án đúng"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <input
                    value={opt}
                    onChange={e => updateOption(qi, oi, e.target.value)}
                    placeholder={`Đáp án ${String.fromCharCode(65 + oi)}`}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 pb-8">
        <button
          onClick={addQuestion}
          className="flex-1 py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" /> Thêm câu hỏi
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <Save className="w-5 h-5" /> {saving ? 'Đang lưu...' : 'Lưu bài tập'}
        </button>
      </div>
    </div>
  );
};

// ===== GRADE TAB =====
const GradeTab = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
      setAssignments(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const loadSubmissions = async (assignmentId) => {
    setSelectedAssignment(assignmentId);
    const { data } = await supabase
      .from('submissions')
      .select('*, users!inner(full_name, class_name)')
      .eq('assignment_id', assignmentId)
      .eq('is_completed', true)
      .order('submitted_at', { ascending: false });
    setSubmissions(data || []);

    const fb = {};
    (data || []).forEach(s => { fb[s.id] = s.teacher_feedback || ''; });
    setFeedbacks(fb);
  };

  const saveFeedback = async (submissionId) => {
    await supabase.from('submissions').update({ teacher_feedback: feedbacks[submissionId] }).eq('id', submissionId);
    toast.success('Đã lưu nhận xét! ✅');
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Đang tải...</div>;

  if (!selectedAssignment) {
    return (
      <div className="space-y-3">
        {assignments.length === 0 && <p className="text-center py-12 text-gray-400">Chưa có bài tập nào.</p>}
        {assignments.map(a => (
          <button
            key={a.id}
            onClick={() => loadSubmissions(a.id)}
            className="glass rounded-xl p-5 w-full text-left flex items-center justify-between hover:shadow-md transition-all group"
          >
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
      <button onClick={() => setSelectedAssignment(null)} className="text-sm font-bold text-purple-600 hover:text-purple-800 mb-4 flex items-center gap-1">
        ← Quay lại danh sách
      </button>
      <div className="space-y-4">
        {submissions.length === 0 && <p className="text-center py-12 text-gray-400">Chưa có bài nộp nào.</p>}
        {submissions.map(s => (
          <div key={s.id} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
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
            <div className="flex gap-2">
              <input
                value={feedbacks[s.id] || ''}
                onChange={e => setFeedbacks({ ...feedbacks, [s.id]: e.target.value })}
                placeholder="Nhập nhận xét cho học sinh..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
              />
              <button onClick={() => saveFeedback(s.id)} className="px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> Gửi
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== CHEATS TAB =====
const CheatsTab = () => {
  const [cheats, setCheats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('submissions')
        .select('*, users!inner(full_name, class_name), assignments!inner(title)')
        .gte('cheat_flags', 1)
        .order('submitted_at', { ascending: false });
      setCheats(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Đang tải...</div>;

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
