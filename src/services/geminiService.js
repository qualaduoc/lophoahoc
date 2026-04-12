import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { supabase } from "../lib/supabase";

const SYSTEM_INSTRUCTION = `Bạn là một trợ lý ảo chuyên về Hóa Học trên website giáo dục Lophoahoc. Bạn CHỈ ĐƯỢC PHÉP trả lời các câu hỏi về môn Hóa học, bài tập Hóa học, hoặc nội dung của website. Nếu học sinh hỏi về toán, lý, văn, giải trí, lập trình, linh tinh v.v., bạn phải từ chối lịch sự bằng tiếng Việt với nội dung: "Xin lỗi em, thầy là AI chuyên về Hóa Học, thầy chỉ giải đáp các kiến thức liên quan đến môn Hóa Học và bài học thôi nhé!". 
Tuyệt đối không vi phạm nguyên tắc này.
Nếu có công thức hóa học, vui lòng format chúng gọn gàng và dễ đọc. Dùng markdown để làm đậm hoặc gạch đầu dòng nếu cần thiết.`;

const createGeminiModel = (apiKey, additions = '') => {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    return genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION + "\n\n" + additions,
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE }
        ],
        generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.2, // Giữ độ chính xác cao không lan man
        }
    });
};

export const fetchChatbotGreeting = async () => {
    try {
        const { data } = await supabase.from('chatbot_settings').select('greeting_message').eq('id', 1).single();
        return data?.greeting_message || "Chào em, thầy là AI trợ giảng Hóa Học. Em có câu hỏi gì bài học hôm nay không?";
    } catch (e) {
        return "Chào em, thầy là AI trợ giảng Hóa Học. Em có câu hỏi gì bài học hôm nay không?";
    }
};

export const testAllGeminiApiKeys = async (keysString) => {
    const keys = keysString.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) return [];
    
    const results = [];
    for (const key of keys) {
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent("Chào");
            if (result.response.text()) {
                results.push({ key, valid: true });
            } else {
                results.push({ key, valid: false, error: "Empty response" });
            }
        } catch (e) {
            results.push({ key, valid: false, error: e.message });
        }
    }
    return results;
};

export const chatWithGeminiFallback = async (historyMessages, newText) => {
    const { data: settings, error } = await supabase
        .from('chatbot_settings')
        .select('gemini_api_key, system_prompt_additions')
        .eq('id', 1)
        .single();

    if (error || !settings?.gemini_api_key) {
        throw new Error("Chưa cấu hình API Key. Hãy nhờ Thầy giáo cấu hình.");
    }

    const keys = settings.gemini_api_key.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) throw new Error("Danh sách API Key trống.");

    let contents = [];
    for (let msg of historyMessages) {
        if (msg.role === 'model' && msg.text.includes("Đã có lỗi xảy ra")) continue;
        
        contents.push({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        });
    }

    let strictContents = [];
    for (let c of contents) {
        if (strictContents.length === 0) {
            if (c.role === 'user') strictContents.push(c);
        } else {
            let last = strictContents[strictContents.length - 1];
            if (last.role === c.role) {
                last.parts[0].text += "\n" + c.parts[0].text;
            } else {
                strictContents.push(c);
            }
        }
    }
    
    if (strictContents.length > 0) {
        let last = strictContents[strictContents.length - 1];
        if (last.role === 'user') {
            last.parts[0].text += "\n" + newText;
        } else {
            strictContents.push({ role: 'user', parts: [{ text: newText }] });
        }
    } else {
        strictContents.push({ role: 'user', parts: [{ text: newText }] });
    }

    let lastError = null;
    for (const key of keys) {
        try {
            const model = createGeminiModel(key, settings.system_prompt_additions);
            const result = await model.generateContent({ contents: strictContents });
            return result.response.text();
        } catch (e) {
            console.warn(`API Key ${key.substring(0, 8)}... thất bại. Thử key khác.`, e);
            lastError = e;
        }
    }

    console.error("Tất cả API keys đều chết:", lastError);
    throw new Error("Tất cả API Key hiện tại đều lỗi/hết lượt. Vui lòng báo Giáo viên cập nhật (Lỗi: " + (lastError?.message || 'Unknown') + ")");
};

export const checkDailyLimit = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [{ data: settings }, { count, error }] = await Promise.all([
        supabase.from('chatbot_settings').select('daily_limit_per_student').eq('id', 1).single(),
        supabase.from('chatbot_logs')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', userId)
            .gte('created_at', today.toISOString())
    ]);

    if (error) return { allowed: false, message: "Lỗi kiểm tra giới hạn." };
    
    const limit = settings?.daily_limit_per_student || 5;
    if (count >= limit) {
        return { allowed: false, message: `Hôm nay em đã hỏi đủ định mức ${limit} câu rồi. Hãy quay lại vào ngày mai nhé!`, limit, count };
    }
    
    return { allowed: true, limit, count };
};

export const logQuestion = async (userId, question) => {
    await supabase.from('chatbot_logs').insert([{ student_id: userId, question }]);
};
