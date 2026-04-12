import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Bot, Save, AlertCircle, Key, FileText, MessageSquare, Clock, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { testAllGeminiApiKeys } from '../../services/geminiService';

const ChatbotSettingsTab = () => {
    const [settings, setSettings] = useState({
        gemini_api_key: '',
        daily_limit_per_student: 5,
        greeting_message: 'Chào em, thầy là AI trợ giảng Hóa Học. Em có câu hỏi gì bài học hôm nay không?',
        system_prompt_additions: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({ todayLogs: 0, totalLogs: 0, students: 0 });
    
    // Testing states
    const [testing, setTesting] = useState(false);
    const [testResults, setTestResults] = useState([]);
    
    // UI state cho input key mới
    const [newKeysInput, setNewKeysInput] = useState('');

    const currentKeys = settings.gemini_api_key.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);

    const maskKey = (key) => {
        if (!key || key.length <= 10) return "••••••••••••••••••••";
        return key.substring(0, 5) + "••••••••••••••••••••••••••••" + key.substring(key.length - 5);
    };

    const handleRemoveKey = (indexToRemove) => {
        const updatedKeys = currentKeys.filter((_, idx) => idx !== indexToRemove);
        setSettings({...settings, gemini_api_key: updatedKeys.join('\n')});
    };

    const handleAddKeys = () => {
        if (!newKeysInput.trim()) return;
        const newKeys = newKeysInput.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
        // Lọc trùng
        const uniqueKeys = [...new Set([...currentKeys, ...newKeys])];
        setSettings({...settings, gemini_api_key: uniqueKeys.join('\n')});
        setNewKeysInput(''); // Reset lại khung nhập mới
        toast.success(`Đã xếp ${newKeys.length} key mới vào rổ. Nhớ bấm [LƯU LẠI CẤU HÌNH] nhé!`);
    };

    useEffect(() => {
        loadSettings();
        loadStats();
    }, []);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('chatbot_settings')
                .select('*')
                .eq('id', 1)
                .single();

            if (data) {
                setSettings({
                    gemini_api_key: data.gemini_api_key || '',
                    daily_limit_per_student: data.daily_limit_per_student || 5,
                    greeting_message: data.greeting_message || 'Chào em, thầy là AI trợ giảng Hóa Học. Em có câu hỏi gì bài học hôm nay không?',
                    system_prompt_additions: data.system_prompt_additions || ''
                });
            } else if (error && error.code !== 'PGRST116') {
                toast.error('Lỗi tải cấu hình: ' + error.message);
            }
        } catch (error) {
            console.error('Lỗi khi tải settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalRes, todayRes, studentRes] = await Promise.all([
            supabase.from('chatbot_logs').select('*', { count: 'exact', head: true }),
            supabase.from('chatbot_logs').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student')
        ]);

        setStats({
            totalLogs: totalRes.count || 0,
            todayLogs: todayRes.count || 0,
            students: studentRes.count || 0
        });
    };

    const handleTestKeys = async () => {
        if (!settings.gemini_api_key.trim()) return toast.error("Chưa nhập API Key nào!");
        setTesting(true);
        // Toast loading
        const toastId = toast.loading("Đang kiểm tra kết nối các API Key...");
        
        try {
            const results = await testAllGeminiApiKeys(settings.gemini_api_key);
            setTestResults(results);
            
            const allWorks = results.length > 0 && results.every(r => r.valid);
            const someWorks = results.some(r => r.valid);
            
            if (allWorks) {
                toast.success('Tất cả API Key đều hoạt động tốt!', { id: toastId });
            } else if (someWorks) {
                toast.warning('Có một số API Key bị lỗi, nhưng vẫn còn key sống.', { id: toastId });
            } else {
                toast.error('Tất cả API Key đều thất bại!', { id: toastId });
            }
        } catch (e) {
            toast.error("Lỗi khi test API Key: " + e.message, { id: toastId });
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('chatbot_settings')
                .upsert({ id: 1, ...settings });

            if (error) throw error;
            toast.success('Lưu cấu hình Chatbot thành công!');
        } catch (error) {
            console.error('Lỗi khi lưu settings:', error);
            toast.error('Có lỗi khi lưu cấu hình.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải cấu hình...</div>;

    const hasKeys = settings.gemini_api_key && settings.gemini_api_key.trim().length > 0;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-3 rounded-xl">
                        <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Cấu hình AI Chatbot</h2>
                        <p className="text-sm text-gray-500">Quản lý trợ giảng ảo bằng API Google Gemini (Hỗ trợ Multiple Keys vòng lặp)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Thống kê nhỏ */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-semibold text-indigo-900">CÂU HỎI HÔM NAY</h3>
                        </div>
                        <p className="text-4xl font-black text-indigo-700">{stats.todayLogs}</p>
                        <p className="text-sm text-indigo-500/80 font-medium">Tổng số: {stats.totalLogs}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-100/50">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold text-purple-900">TRẠNG THÁI</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`w-3 h-3 rounded-full ${hasKeys ? 'bg-green-500 animate-pulse' : 'bg-red-500'} `} />
                            <span className={`font-bold ${hasKeys ? 'text-green-700' : 'text-red-700'}`}>
                                {hasKeys ? 'Đã có bộ Key (Sẵn sàng Test)' : 'Cần nhập API Key'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 flex flex-col">
                    <div className="bg-indigo-50/50 p-5 border border-indigo-100 rounded-2xl">
                        <div className="flex justify-between items-center mb-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                                <Key className="w-5 h-5 text-indigo-500" /> Quản lý API Key Gemini (Bảo mật tối đa)
                            </label>
                            <button 
                                onClick={handleTestKeys} 
                                disabled={testing || !hasKeys} 
                                className="text-sm font-bold flex items-center gap-1.5 text-white bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed px-4 py-2 rounded-xl shadow-sm transition-colors"
                            >
                                <Zap className={`w-4 h-4 ${testing ? 'animate-bounce' : ''}`} /> 
                                {testing ? 'Đang ping Google...' : 'Test kết nối Keys'}
                            </button>
                        </div>
                        
                        {/* Danh sách Key hiện tại (Đã Mask) */}
                        {currentKeys.length > 0 && (
                            <div className="mb-4 space-y-2">
                                <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Các Key đang hoạt động trong vòng lặp:</div>
                                {currentKeys.map((key, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white border border-indigo-100 p-3 rounded-xl shadow-sm">
                                        <span className="font-mono text-gray-700 font-bold tracking-widest">{maskKey(key)}</span>
                                        <button 
                                            onClick={() => handleRemoveKey(idx)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                            title="Xóa Key này khỏi vòng lặp"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <textarea
                            value={newKeysInput}
                            onChange={(e) => {
                                setNewKeysInput(e.target.value);
                            }}
                            placeholder="Dán mã API Key MỚI vào đây.&#10;Mỗi dòng 1 Key.&#10;Key sau khi được [Thêm] sẽ tự động mã hóa ẩn danh để bảo mật chống lộ Key."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-mono text-sm leading-relaxed"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-indigo-600/80 font-medium">Lấy API Key siêu miễn phí tại Google AI Studio.</p>
                            <button 
                                onClick={handleAddKeys}
                                disabled={!newKeysInput.trim()}
                                className="text-sm font-bold bg-gray-800 hover:bg-black text-white px-5 py-2 rounded-xl disabled:opacity-50 transition-colors shadow-md"
                            >
                                + Thêm Key vào rổ
                            </button>
                        </div>
                        
                        {/* Khu vực hiển thị kết quả Test */}
                        {testResults.length > 0 && (
                            <div className="mt-4 bg-white rounded-xl border border-indigo-100 overflow-hidden shadow-sm">
                                <div className="bg-indigo-50/50 px-4 py-2 border-b border-indigo-100 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <h4 className="text-xs font-bold text-indigo-900 uppercase">Kết quả Ping ({testResults.filter(r=>r.valid).length}/{testResults.length} Sống)</h4>
                                </div>
                                <div className="p-2 max-h-48 overflow-y-auto">
                                    {testResults.map((res, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                                            {res.valid ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-gray-700 text-sm font-semibold truncate">
                                                        {maskKey(res.key)}
                                                    </span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${res.valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {res.valid ? 'Sẵn sàng' : 'Lỗi'}
                                                    </span>
                                                </div>
                                                {!res.valid && (
                                                    <div className="text-red-500/80 text-xs mt-1 bg-red-50 p-2 rounded-md font-mono break-all">{res.error}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            Giới hạn lượt hỏi free / Ngày / Học sinh
                        </label>
                        <input
                            type="number"
                            min="1" max="1000"
                            value={settings.daily_limit_per_student}
                            onChange={(e) => setSettings({...settings, daily_limit_per_student: parseInt(e.target.value) || 5})}
                            className="w-40 px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-bold text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <MessageSquare className="w-4 h-4 text-gray-400" /> Câu chào mở đầu
                        </label>
                        <input
                            type="text"
                            value={settings.greeting_message}
                            onChange={(e) => setSettings({...settings, greeting_message: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <FileText className="w-4 h-4 text-gray-400" /> System Prompt bổ sung (Ép bối cảnh cho AI)
                        </label>
                        <textarea
                            value={settings.system_prompt_additions}
                            onChange={(e) => setSettings({...settings, system_prompt_additions: e.target.value})}
                            placeholder="Nhập lệnh mở rộng cho AI (Ví dụ: Trả lời ngắn gọn dưới 3 câu, luôn xưng là Thầy...)"
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-y"
                        />
                        <p className="mt-1 text-xs text-gray-500">Mặc định AI đã bị ép chỉ trả lời Hóa Học. Khầy viết thêm vào đây nếu cần quy định giọng văn.</p>
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full sm:w-auto self-end flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Đang lưu vào Data...' : 'LƯU LẠI CẤU HÌNH'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="h-4"></div>
        </div>
    );
};

export default ChatbotSettingsTab;
