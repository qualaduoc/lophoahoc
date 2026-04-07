import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { PlusCircle, Trash2, Save, Eye, EyeOff, Check, Calendar, Target } from 'lucide-react';

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
    due_date: '',
    target_class: '',
  });
  const [questions, setQuestions] = useState([
    { content: '', type: 'multiple_choice', correct_answer: '', options: ['', '', '', ''], points: 1 },
  ]);
  const [classList, setClassList] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);

  React.useEffect(() => {
    supabase.from('classes').select('name').order('name').then(({data}) => {
      if (data) setClassList(data.map(c => c.name));
    });
  }, []);

  const toggleClass = (c) => {
    if (selectedClasses.includes(c)) setSelectedClasses(selectedClasses.filter(x => x !== c));
    else setSelectedClasses([...selectedClasses, c]);
  };

  const addQuestion = (type = 'multiple_choice') => {
    if (type === 'essay') {
      setQuestions([...questions, { content: '', type: 'essay', correct_answer: '', options: [], points: 1 }]);
    } else {
      setQuestions([...questions, { content: '', type: 'multiple_choice', correct_answer: '', options: ['', '', '', ''], points: 1 }]);
    }
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

  const handleSave = async (retryCount = 0) => {
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề bài tập'); return; }
    if (questions.some(q => !q.content.trim())) { toast.error('Vui lòng nhập nội dung tất cả câu hỏi'); return; }

    setSaving(true);
    try {
      const { data: assignment, error: aErr } = await supabase
        .from('assignments')
        .insert({
          teacher_id: user.id,
          title: form.title,
          description: form.description,
          type: form.type,
          time_limit_minutes: form.time_limit_minutes,
          is_published: form.is_published,
          due_date: form.due_date || null,
          target_class: selectedClasses.length > 0 ? selectedClasses.join(',') : null,
        })
        .select()
        .single();

      if (aErr) throw new Error(aErr.message);

      const qInserts = questions.map((q, i) => ({
        assignment_id: assignment.id,
        content: q.content,
        type: q.type,
        correct_answer: q.type === 'essay' ? null : (q.correct_answer || null),
        options: q.type === 'multiple_choice' ? q.options.filter(o => o.trim()) : null,
        points: q.points,
        sort_order: i,
      }));

      const { error: qErr } = await supabase.from('questions').insert(qInserts);
      if (qErr) throw new Error(qErr.message);

      setSaved(true);
      setForm({ title: '', description: '', type: 'quiz', time_limit_minutes: 30, is_published: false, due_date: '', target_class: '' });
      setSelectedClasses([]);
      setQuestions([{ content: '', type: 'multiple_choice', correct_answer: '', options: ['', '', '', ''], points: 1 }]);
      setTimeout(() => setSaved(false), 3000);
      toast.success('Đã lưu bài tập thành công!');
    } catch (err) {
      if (err.message?.includes('Lock') && err.message?.includes('released because another request stole it')) {
        if (retryCount < 2) { setTimeout(() => handleSave(retryCount + 1), 500); return; }
      }
      if (err.message?.includes('new row violates row-level security policy') || err.message?.includes('PGRST116')) {
        toast.error(
          <div className="flex flex-col gap-1">
            <b>Database từ chối lưu!</b>
            <span className="text-xs">Nguyên nhân: Chưa chạy lệnh SQL cấp quyền.</span>
          </div>,
          { duration: 8000 }
        );
      } else {
        toast.error('Lỗi: ' + (err.message || 'Không xác định'));
      }
    } finally {
      setSaving(false);
    }
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
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Kiểm tra chương Nguyên tử"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Mô tả</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả ngắn về bài tập..." rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Thời gian (phút)</label>
              <input type="number" value={form.time_limit_minutes} min={5} max={180}
                onChange={e => setForm({ ...form, time_limit_minutes: parseInt(e.target.value) || 30 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white" />
            </div>
            <div className="flex items-end">
              <button onClick={() => setForm({ ...form, is_published: !form.is_published })}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm border transition-all w-full justify-center ${
                  form.is_published ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                {form.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {form.is_published ? 'Đã công khai' : 'Chưa công khai'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Hạn nộp bài
              </label>
              <input type="datetime-local" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Giao cho lớp
              </label>
              <div className="w-full p-2.5 border border-gray-200 rounded-xl bg-white max-h-[120px] overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {classList.length === 0 ? (
                    <span className="text-xs text-gray-500">Chưa có lớp nào, vào "Quản lý Lớp" để thêm</span>
                  ) : (
                    classList.map(c => (
                      <label key={c} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-sm cursor-pointer transition-all select-none ${
                        selectedClasses.includes(c) ? 'bg-purple-50 text-purple-700 border-purple-200 font-bold' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}>
                        <input type="checkbox" checked={selectedClasses.includes(c)}
                          onChange={() => toggleClass(c)}
                          className="w-3.5 h-3.5 accent-purple-600" />
                        {c}
                      </label>
                    ))
                  )}
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-medium bg-gray-50 px-2 py-1 rounded inline-block">Trống = Giao cho tất cả các lớp</p>
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
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black">Câu {qi + 1}</span>
                <select value={q.type} onChange={e => {
                  const newType = e.target.value;
                  const updated = [...questions];
                  updated[qi] = {
                    ...updated[qi],
                    type: newType,
                    options: newType === 'multiple_choice' ? ['', '', '', ''] : [],
                    correct_answer: newType === 'essay' ? '' : updated[qi].correct_answer,
                  };
                  setQuestions(updated);
                }} className="text-xs px-2 py-1 border border-gray-200 rounded-lg bg-white font-bold text-gray-600">
                  <option value="multiple_choice">📋 Trắc nghiệm</option>
                  <option value="essay">✍️ Tự luận</option>
                </select>
              </div>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <textarea value={q.content} onChange={e => updateQuestion(qi, 'content', e.target.value)}
              placeholder="Nhập nội dung câu hỏi..." rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white resize-y mb-4" />

            {q.type === 'multiple_choice' && (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button onClick={() => updateQuestion(qi, 'correct_answer', opt)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        q.correct_answer === opt && opt ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-300 hover:border-green-400'
                      }`} title="Đáp án đúng">
                      <Check className="w-4 h-4" />
                    </button>
                    <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                      placeholder={`Đáp án ${String.fromCharCode(65 + oi)}`}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm" />
                  </div>
                ))}
              </div>
            )}

            {q.type === 'essay' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
                ✍️ Câu tự luận — Học sinh sẽ nhập câu trả lời dạng văn bản. Giáo viên chấm thủ công tại tab "Chấm điểm".
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500">Điểm:</label>
              <input type="number" value={q.points} min={1} max={100}
                onChange={e => updateQuestion(qi, 'points', parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 pb-8">
        <button onClick={() => addQuestion('multiple_choice')}
          className="flex-1 py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
          <PlusCircle className="w-5 h-5" /> Trắc nghiệm
        </button>
        <button onClick={() => addQuestion('essay')}
          className="flex-1 py-3 border-2 border-dashed border-amber-300 text-amber-600 rounded-xl font-bold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2">
          ✍️ Tự luận
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          <Save className="w-5 h-5" /> {saving ? 'Đang lưu...' : 'Lưu bài tập'}
        </button>
      </div>
    </div>
  );
};

export default CreateAssignmentTab;
