import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Trash2, Save, Eye, EyeOff, X, Check, Edit3, Calendar, Target, ToggleLeft, ToggleRight } from 'lucide-react';

const ManageAssignmentsTab = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editQuestions, setEditQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase
        .from('assignments')
        .select('*, questions(count), submissions(count)')
        .order('created_at', { ascending: false });
      if (qErr) throw qErr;
      setAssignments(data || []);
    } catch (err) {
      console.error('ManageTab error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAssignments(); }, []);

  const togglePublish = async (id, current) => {
    try {
      const { error: qErr } = await supabase.from('assignments').update({ is_published: !current }).eq('id', id);
      if (qErr) throw qErr;
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, is_published: !current } : a));
      toast.success(!current ? 'Đã công khai bài tập!' : 'Đã ẩn bài tập!');
    } catch (err) { toast.error('Lỗi: ' + err.message); }
  };

  const deleteAssignment = async (id) => {
    if (deleting === id) {
      try {
        await supabase.from('student_answers').delete()
          .in('submission_id', (await supabase.from('submissions').select('id').eq('assignment_id', id)).data?.map(s => s.id) || []);
        await supabase.from('submissions').delete().eq('assignment_id', id);
        await supabase.from('questions').delete().eq('assignment_id', id);
        await supabase.from('assignments').delete().eq('id', id);
        setAssignments(prev => prev.filter(a => a.id !== id));
        toast.success('Đã xóa bài tập!');
      } catch (err) { toast.error('Lỗi xóa: ' + err.message); }
      setDeleting(null);
    } else {
      setDeleting(id);
      setTimeout(() => setDeleting(null), 3000);
    }
  };

  const startEdit = async (assignmentId) => {
    try {
      const [{ data: asn }, { data: qs }] = await Promise.all([
        supabase.from('assignments').select('*').eq('id', assignmentId).single(),
        supabase.from('questions').select('*').eq('assignment_id', assignmentId).order('sort_order'),
      ]);
      setEditForm({
        title: asn.title, description: asn.description || '', time_limit_minutes: asn.time_limit_minutes,
        is_published: asn.is_published,
        due_date: asn.due_date ? new Date(asn.due_date).toISOString().slice(0, 16) : '',
        target_class: asn.target_class || '',
      });
      setEditQuestions((qs || []).map(q => ({
        id: q.id, content: q.content, type: q.type, correct_answer: q.correct_answer || '',
        options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || ['', '', '', '']),
        points: q.points || 1,
      })));
      setEditing(assignmentId);
    } catch (err) { toast.error('Lỗi tải bài tập: ' + err.message); }
  };

  const saveEdit = async () => {
    if (!editForm.title.trim()) { toast.error('Tiêu đề không được trống'); return; }
    setSaving(true);
    try {
      await supabase.from('assignments').update({
        title: editForm.title, description: editForm.description,
        time_limit_minutes: editForm.time_limit_minutes, is_published: editForm.is_published,
        due_date: editForm.due_date || null, target_class: editForm.target_class.trim() || null,
      }).eq('id', editing);

      for (let i = 0; i < editQuestions.length; i++) {
        const q = editQuestions[i];
        await supabase.from('questions').update({
          content: q.content,
          correct_answer: q.type === 'essay' ? null : (q.correct_answer || null),
          options: q.type === 'multiple_choice' ? q.options.filter(o => o.trim()) : null,
          points: q.points, sort_order: i,
        }).eq('id', q.id);
      }
      toast.success('Đã cập nhật bài tập!');
      setEditing(null);
      loadAssignments();
    } catch (err) { toast.error('Lỗi lưu: ' + err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">⏳ Đang tải...</div>;
  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500 font-bold mb-2">⚠️ Lỗi tải dữ liệu</p>
      <p className="text-xs text-gray-400 mb-3">{error}</p>
      <button onClick={loadAssignments} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold text-sm">🔄 Thử lại</button>
    </div>
  );

  // ===== EDIT VIEW =====
  if (editing && editForm) {
    return (
      <div className="max-w-3xl">
        <button onClick={() => setEditing(null)} className="text-sm font-bold text-purple-600 hover:text-purple-800 mb-4 flex items-center gap-1">← Quay lại</button>
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><Edit3 className="w-5 h-5" /> Chỉnh sửa bài tập</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Tiêu đề *</label>
              <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Mô tả</label>
              <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white resize-y" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Thời gian (phút)</label>
                <input type="number" value={editForm.time_limit_minutes} min={5} max={180}
                  onChange={e => setEditForm({ ...editForm, time_limit_minutes: parseInt(e.target.value) || 30 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white" />
              </div>
              <div className="flex items-end">
                <button onClick={() => setEditForm({ ...editForm, is_published: !editForm.is_published })}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm border transition-all w-full justify-center ${
                    editForm.is_published ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                  {editForm.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {editForm.is_published ? 'Đã công khai' : 'Chưa công khai'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Hạn nộp</label>
                <input type="datetime-local" value={editForm.due_date} onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Giao cho lớp</label>
                <input type="text" value={editForm.target_class} onChange={e => setEditForm({ ...editForm, target_class: e.target.value })}
                  placeholder="VD: 9A2 (trống = tất cả)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm" />
              </div>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-gray-800 text-lg mb-4">Câu hỏi ({editQuestions.length})</h3>
        <div className="space-y-4">
          {editQuestions.map((q, qi) => (
            <div key={q.id} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black">Câu {qi + 1}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  q.type === 'essay' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                }`}>{q.type === 'essay' ? '✍️ Tự luận' : '📋 Trắc nghiệm'}</span>
              </div>
              <textarea value={q.content} onChange={e => {
                const u = [...editQuestions]; u[qi] = { ...u[qi], content: e.target.value }; setEditQuestions(u);
              }} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white resize-y mb-3" />
              {q.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button onClick={() => {
                        const u = [...editQuestions]; u[qi] = { ...u[qi], correct_answer: opt }; setEditQuestions(u);
                      }} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        q.correct_answer === opt && opt ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-300 hover:border-green-400'
                      }`}><Check className="w-4 h-4" /></button>
                      <input value={opt} onChange={e => {
                        const u = [...editQuestions]; u[qi].options[oi] = e.target.value; setEditQuestions(u);
                      }} placeholder={`Đáp án ${String.fromCharCode(65 + oi)}`}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm" />
                    </div>
                  ))}
                </div>
              )}
              {q.type === 'essay' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
                  ✍️ Câu tự luận — GV chấm thủ công ở tab "Chấm điểm"
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6 pb-8">
          <button onClick={() => setEditing(null)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50">
            <X className="w-5 h-5 inline mr-1" /> Hủy
          </button>
          <button onClick={saveEdit} disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
            <Save className="w-5 h-5" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    );
  }

  // ===== LIST VIEW =====
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-lg">📋 Quản lý bài tập ({assignments.length})</h3>
        <button onClick={loadAssignments} className="text-sm text-purple-600 hover:text-purple-800 font-bold">🔄 Làm mới</button>
      </div>

      {assignments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">📝</p>
          <h3 className="text-lg font-bold text-gray-700">Chưa có bài tập nào</h3>
          <p className="text-sm text-gray-500 mt-1">Chuyển sang tab "Tạo bài tập" để bắt đầu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => {
            const qCount = a.questions?.[0]?.count || 0;
            const sCount = a.submissions?.[0]?.count || 0;
            const isExpired = a.due_date && new Date(a.due_date) < new Date();

            return (
              <div key={a.id} className={`glass rounded-xl p-5 hover:shadow-md transition-all ${isExpired ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-gray-900 truncate">{a.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        a.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>{a.is_published ? '✅ Công khai' : '🔒 Ẩn'}</span>
                      {isExpired && <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-600">⏰ Hết hạn</span>}
                    </div>
                    {a.description && <p className="text-xs text-gray-500 mb-2 line-clamp-1">{a.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                      <span>📋 {qCount} câu</span>
                      <span>📤 {sCount} nộp</span>
                      <span>⏱ {a.time_limit_minutes}p</span>
                      {a.target_class && <span>🎯 Lớp {a.target_class}</span>}
                      {a.due_date && <span className={isExpired ? 'text-red-500' : ''}>📅 Hạn: {new Date(a.due_date).toLocaleDateString('vi-VN')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(a.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all">
                      <Edit3 className="w-4 h-4" /> Sửa
                    </button>
                    <button onClick={() => togglePublish(a.id, a.is_published)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        a.is_published ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}>
                      {a.is_published ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {a.is_published ? 'Ẩn' : 'Hiện'}
                    </button>
                    <button onClick={() => deleteAssignment(a.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        deleting === a.id ? 'bg-red-500 text-white animate-pulse' : 'bg-red-50 text-red-500 hover:bg-red-100'
                      }`}>
                      <Trash2 className="w-4 h-4" /> {deleting === a.id ? 'Xác nhận?' : 'Xóa'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageAssignmentsTab;
