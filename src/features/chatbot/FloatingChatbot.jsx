import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, User, ChevronDown, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../contexts/AuthContext';
import { fetchChatbotGreeting, chatWithGeminiFallback, checkDailyLimit, logQuestion } from '../../services/geminiService';

export const FloatingChatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    // Removed chatSession state
    const [limitReached, setLimitReached] = useState(false);
    const [limitMsg, setLimitMsg] = useState('');
    const [usage, setUsage] = useState({ count: 0, limit: 5 });
    const [serviceError, setServiceError] = useState(null);
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        if (isOpen && messages.length === 0 && !serviceError) {
            setupChat();
        }
    }, [isOpen]);

    useEffect(() => {
        // Auto scroll xuống cuối
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const setupChat = async () => {
        setLoading(true);
        try {
            const greeting = await fetchChatbotGreeting();
            setMessages([{ role: 'model', text: greeting }]);
            await fetchLimits();
            setServiceError(null);
        } catch (error) {
            setServiceError("Chatbot đang bảo trì hoặc thiếu API Key.");
        } finally {
            setLoading(false);
        }
    };

    const fetchLimits = async () => {
        const { allowed, message, count, limit } = await checkDailyLimit(user.id);
        setUsage({ count: count || 0, limit: limit || 5 });
        if (!allowed) {
            setLimitReached(true);
            setLimitMsg(message);
        } else {
            setLimitReached(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || limitReached || serviceError) return;

        const { allowed, message, count, limit } = await checkDailyLimit(user.id);
        if (!allowed) {
            setLimitReached(true);
            setLimitMsg(message);
            setUsage({ count, limit });
            return;
        }

        const userText = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setLoading(true);

        try {
            await logQuestion(user.id, userText); // Lưu log gửi câu hỏi mới
            setUsage(prev => ({ ...prev, count: prev.count + 1 }));

            const responseText = await chatWithGeminiFallback(messages, userText);
            
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
            
        } catch (error) {
            console.error("Lỗi khi chat:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Đã có lỗi xảy ra hoặc thầy đang bận. Hẹn em lát nữa nhé :(" }]);
        } finally {
            setLoading(false);
            // Kiểm tra lại limit sau khi hỏi xong
            fetchLimits();
        }
    };

    // LỖI REACT HOOK FIX: Đặt return sau tất cả các hooks
    if (!user) return null;

    return (
        <div className="fixed bottom-12 sm:bottom-28 right-6 sm:right-10 z-[999] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 w-80 sm:w-96 mb-4 overflow-hidden flex flex-col transition-all transform origin-bottom-right duration-300 shadow-blue-500/20" style={{ height: '500px', maxHeight: '80vh' }}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm relative">
                                <Bot className="w-5 h-5" />
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm leading-tight">AI Trợ Giảng Hóa Học</h3>
                                <p className="text-xs text-blue-100 font-medium tracking-wide">
                                    {serviceError ? 'Bảo trì' : (limitReached ? 'Hết lượt hỏi' : `Còn ${usage.limit - usage.count} lượt hỏi`)}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {serviceError ? (
                            <div className="text-center p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                                {serviceError}
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'}`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl max-w-[75%] shadow-sm text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm whitespace-pre-wrap' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                                        {msg.role === 'user' ? (
                                            msg.text
                                        ) : (
                                            <div className="prose prose-sm prose-blue max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:pl-4 [&>ol]:pl-4 [&>ul]:list-disc [&>ol]:list-decimal">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {loading && !serviceError && (
                            <div className="flex gap-2">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="p-3 bg-white border border-gray-100 rounded-2xl rounded-tl-sm flex gap-1.5 items-center shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={endOfMessagesRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                        {limitReached ? (
                            <div className="text-center p-3.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200/50 text-sm font-semibold flex items-center justify-center gap-2">
                                <RotateCcw className="w-4 h-4" />
                                {limitMsg}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex gap-2 items-end relative">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    disabled={loading || serviceError}
                                    placeholder={serviceError ? "Tạm ngưng hoạt động" : "Hỏi tác dụng của Oxi..."}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all disabled:opacity-50 resize-none max-h-24 overflow-y-auto"
                                    rows="1"
                                    style={{ minHeight: '44px' }}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim() || serviceError}
                                    className="p-2.5 h-[44px] shrink-0 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-md shadow-blue-600/20 flex items-center justify-center"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Toggle Button & Speech Bubble */}
            <div className={`mt-4 flex items-center gap-4 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-0 opacity-0 pointer-events-none absolute bottom-0 right-0' : 'scale-100 opacity-100 relative'}`}>
                {/* Speech Bubble */}
                <div className="relative bg-white text-blue-700 px-5 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-blue-100 font-bold text-sm flex items-center gap-2 animate-bounce cursor-pointer hover:bg-blue-50 transition-colors"
                     onClick={() => setIsOpen(true)}>
                    <span>Chat với AI</span>
                    <span className="text-lg leading-none">✨</span>
                    {/* Tooltip Arrow pointing right */}
                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-blue-100 rotate-45 transform origin-center"></div>
                </div>

                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_8px_40px_rgb(59,130,246,0.5)] transition-all transform hover:-translate-y-1 group relative z-10 flex-shrink-0"
                >
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                    <Bot className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform" />
                </button>
            </div>
        </div>
    );
};
