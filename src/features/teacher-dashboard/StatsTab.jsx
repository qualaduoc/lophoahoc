import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { FileSpreadsheet, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

const StatsTab = () => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('assignments').select('id, title, target_class').order('created_at', { ascending: false }),
      supabase.from('classes').select('name').order('name')
    ]).then(([{ data: aData }, { data: cData }]) => {
      setAssignments(aData || []);
      setClasses(cData || []);
    });
  }, []);

  const loadData = async () => {
    if (!selectedAssignment) return;
    setLoading(true);
    try {
      // 1. Get students (filtered by class if selected)
      let usersQuery = supabase.from('users').select('id, full_name, class_name').eq('role', 'student').order('full_name');
      if (selectedClass) {
        usersQuery = usersQuery.eq('class_name', selectedClass);
      }
      const { data: users, error: uErr } = await usersQuery;
      if (uErr) throw uErr;

      // 2. Get submissions for this assignment
      const { data: subs, error: sErr } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', selectedAssignment)
        .eq('is_completed', true);
      if (sErr) throw sErr;

      // Map submissions by student_id
      const subMap = {};
      subs.forEach(s => { subMap[s.student_id] = s; });

      setStudents(users || []);
      setSubmissions(subMap);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAssignment) loadData();
  }, [selectedAssignment, selectedClass]);

  const handleExportExcel = () => {
    if (students.length === 0) {
      toast.error('Không có dữ liệu để xuất!');
      return;
    }

    const assignment = assignments.find(a => a.id === selectedAssignment);
    const assignmentName = assignment ? assignment.title : 'Bai_Tap';

    // Prepare data for Excel
    const dataToExport = students.map((st, i) => {
      const sub = submissions[st.id];
      return {
        'STT': i + 1,
        'Họ và Tên': st.full_name,
        'Lớp': st.class_name || '',
        'Trạng thái': sub ? 'Đã nộp' : 'Chưa nộp',
        'Điểm số': sub ? (sub.score !== null ? `${sub.score} / ${sub.total_points}` : 'Chờ chấm') : '',
        'Điểm hệ 10': sub && sub.score !== null && sub.total_points ? parseFloat(((sub.score / sub.total_points) * 10).toFixed(2)) : '',
        'Thời gian nộp': sub && sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('vi-VN') : '',
        'Vi phạm (Gian lận)': sub && sub.cheat_flags >= 2 ? 'Có (Cảnh báo)' : 'Không',
        'Giáo viên nhận xét': sub?.teacher_feedback || ''
      };
    });

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Thong Ke");

    // Fix column widths
    const colWidths = [
      { wch: 5 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 30 }
    ];
    worksheet['!cols'] = colWidths;

    // Generate and download
    const fileName = `Diem_${assignmentName.replace(/[^a-z0-9]/gi, '_')}_${selectedClass || 'TatCa'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Đã xuất file Excel!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="glass rounded-2xl p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-600" /> Bộ lọc Thống kê
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">1. Chọn bài tập *</label>
            <select 
              value={selectedAssignment} 
              onChange={e => setSelectedAssignment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
            >
              <option value="">-- Vui lòng chọn bài tập --</option>
              {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">2. Lọc theo lớp</label>
            <select 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium disabled:opacity-50"
              disabled={!selectedAssignment}
            >
              <option value="">Tất cả các lớp</option>
              {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedAssignment && (
        <div className="glass rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between bg-white gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Bảng điểm & Trạng thái nộp bài</h3>
              <p className="text-sm text-gray-500 mt-0.5">Danh sách {students.length} học sinh</p>
            </div>
            <button 
              onClick={handleExportExcel}
              disabled={loading || students.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:-translate-y-0.5 transition-all shadow-md shadow-emerald-500/25 disabled:opacity-50 disabled:transform-none"
            >
              <FileSpreadsheet className="w-5 h-5" /> Xuất Excel
            </button>
          </div>
          
          <div className="overflow-x-auto w-full">
            {loading ? (
              <div className="p-12 text-center text-purple-600 font-medium">⏳ Đang tổng hợp dữ liệu...</div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-gray-400">Không tìm thấy học sinh nào trong lớp này. (Hãy thử chọn lớp khác)</div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
                <thead className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4">STT</th>
                    <th className="px-5 py-4">Họ và tên</th>
                    <th className="px-5 py-4 text-center">Lớp</th>
                    <th className="px-5 py-4 text-center">Trạng thái</th>
                    <th className="px-5 py-4 text-right">Điểm thô</th>
                    <th className="px-5 py-4 text-right">Hệ 10</th>
                    <th className="px-5 py-4 text-center">Gian lận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {students.map((st, idx) => {
                    const sub = submissions[st.id];
                    let score10 = null;
                    if (sub && sub.score !== null && sub.total_points) {
                      score10 = ((sub.score / sub.total_points) * 10).toFixed(1);
                    }
                    return (
                      <tr key={st.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-5 py-3 text-gray-400 font-medium">{idx + 1}</td>
                        <td className="px-5 py-3 font-bold text-gray-800">{st.full_name}</td>
                        <td className="px-5 py-3 text-center text-gray-600 font-medium">{st.class_name}</td>
                        <td className="px-5 py-3 text-center">
                          {sub ? (
                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-black">Nộp rồi</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md text-xs font-bold">Chưa nộp</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {sub ? (
                            sub.score !== null ? (
                              <span className="font-medium text-gray-600">{sub.score} / {sub.total_points}</span>
                            ) : (
                              <span className="text-amber-500 text-xs font-bold bg-amber-50 px-2 py-1 rounded">Chờ GV chấm</span>
                            )
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right font-black text-base">
                          {score10 !== null ? (
                            <span className={parseFloat(score10) >= 8 ? 'text-emerald-500' : parseFloat(score10) >= 5 ? 'text-blue-500' : 'text-red-500'}>
                              {score10}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-normal text-sm">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {sub && sub.cheat_flags >= 2 ? (
                            <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-lg text-xs" title="Phát hiện chuyển tab/thoát trang">⚠️ Có</span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsTab;
