import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Trash2, PlusCircle } from 'lucide-react';

const ManageClassesTab = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClass, setNewClass] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      toast.error('Lỗi tải danh sách lớp: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClasses(); }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClass.trim()) return;
    
    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({ name: newClass.trim() })
        .select()
        .single();
        
      if (error) throw error;
      
      setClasses(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewClass('');
      toast.success('Đã thêm lớp học mới!');
    } catch (err) {
      if (err.message?.includes('duplicate key')) {
        toast.error('Lớp học này đã tồn tại!');
      } else {
        toast.error('Lỗi thêm lớp: ' + err.message);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (deleting === id) {
      try {
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (error) throw error;
        setClasses(prev => prev.filter(c => c.id !== id));
        toast.success('Đã xóa lớp học!');
      } catch (err) {
        toast.error('Lỗi xóa lớp: ' + err.message);
      } finally {
        setDeleting(null);
      }
    } else {
      setDeleting(id);
      setTimeout(() => setDeleting(null), 3000);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">⏳ Đang tải...</div>;

  return (
    <div className="max-w-3xl">
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-purple-600" /> Thêm lớp mới
        </h3>
        <form onSubmit={handleAddClass} className="flex gap-3">
          <input
            type="text"
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            placeholder="VD: 9A1, 10A2..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
            required
          />
          <button
            type="submit"
            disabled={adding || !newClass.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
          >
            {adding ? 'Đang thêm...' : 'Thêm lớp'}
          </button>
        </form>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Danh sách lớp học ({classes.length})</h3>
        
        {classes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-2">Chưa có lớp học nào.</p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {classes.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl hover:shadow-sm transition-all group">
                <span className="font-bold text-gray-700">{cls.name}</span>
                <button
                  onClick={() => handleDeleteClass(cls.id)}
                  title="Xóa lớp"
                  className={`p-1.5 rounded-lg transition-colors ${
                    deleting === cls.id 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageClassesTab;
