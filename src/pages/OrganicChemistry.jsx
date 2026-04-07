import React, { useState } from 'react';
import { 
  BookOpen, Atom, FlaskConical, Beaker, Flame, 
  Droplets, TestTube, Leaf, Zap, Pill 
} from 'lucide-react';

const LESSONS = [
  {
    id: 'dai-cuong',
    title: '1. Đại cương về Hóa học Hữu cơ',
    icon: <Atom size={18} />,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-indigo-200 pb-2">Khái niệm & Phân loại</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Hợp chất hữu cơ</strong> là hợp chất của carbon (trừ CO, CO₂, muối carbonate, cyanide, carbide...).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <h4 className="font-bold text-indigo-800 mb-2">Hydrocarbon</h4>
              <p className="text-sm text-gray-700">Chỉ chứa 2 nguyên tố Carbon (C) và Hydrogen (H).</p>
              <p className="text-sm mt-2 font-mono text-indigo-600">VD: CH₄, C₂H₄, C₆H₆</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <h4 className="font-bold text-emerald-800 mb-2">Dẫn xuất của Hydrocarbon</h4>
              <p className="text-sm text-gray-700">Ngoài C và H, trong phân tử còn có O, N, Cl...</p>
              <p className="text-sm mt-2 font-mono text-emerald-600">VD: C₂H₅OH, CH₃COOH, CH₃Cl</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-indigo-200 pb-2">Đặc điểm cấu tạo</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 bg-gray-50 border rounded-lg p-4">
            <li>Hóa trị không đổi: <strong>C (IV)</strong>, <strong>H (I)</strong>, <strong>O (II)</strong>, <strong>Cl (I)</strong>.</li>
            <li>Các nguyên tử liên kết với nhau bằng <strong>liên kết cộng hóa trị</strong> (liên kết đơn, đôi, ba).</li>
            <li>Carbon có thể liên kết với nhau tạo thành các loại mạch: <strong>Mạch thẳng (không nhánh)</strong>, <strong>Mạch nhánh</strong>, <strong>Mạch vòng</strong>.</li>
            <li><strong>Đồng phân:</strong> Hiện tượng các chất có cùng công thức phân tử nhưng cấu tạo khác nhau. (VD: C₂H₆O có dạng CH₃-CH₂-OH và CH₃-O-CH₃).</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'alkane',
    title: '2. Alkane (Methane, Ethane...)',
    icon: <FlaskConical size={18} />,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-orange-200 pb-2">Khái niệm & Cấu trúc</h3>
          <p className="text-gray-700 mb-3">
            Alkane là hydrocarbon no mạch hở, trong phân tử chỉ chứa các liên kết đơn (σ).
            <br />Công thức chung: <strong className="text-orange-600">C<sub>n</sub>H<sub>2n+2</sub></strong> (n ≥ 1).
          </p>
          <div className="overflow-x-auto shadow-sm rounded border">
            <table className="min-w-full text-left text-sm bg-white">
              <thead className="bg-orange-50 text-orange-800">
                <tr><th>Tên gọi</th><th>CTPT</th><th>CT Cấu tạo thu gọn</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="p-2 font-semibold">Methane</td><td className="p-2">CH₄</td><td className="p-2">CH₄</td></tr>
                <tr><td className="p-2 font-semibold">Ethane</td><td className="p-2">C₂H₆</td><td className="p-2">CH₃ - CH₃</td></tr>
                <tr><td className="p-2 font-semibold">Propane</td><td className="p-2">C₃H∸</td><td className="p-2">CH₃ - CH₂ - CH₃</td></tr>
                <tr><td className="p-2 font-semibold">Butane</td><td className="p-2">C₄H₁₀</td><td className="p-2">CH₃ - CH₂ - CH₂ - CH₃</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-orange-200 pb-2">Tính chất hóa học</h3>
          <div className="space-y-4">
            <div className="bg-white border rounded p-4">
              <h4 className="font-bold mb-2">1. Phản ứng cháy (Tỏa nhiều nhiệt)</h4>
              <p className="text-sm font-mono text-center text-red-600 bg-red-50 p-2 rounded">
                CH₄ + 2O₂ → (t°) CO₂ + 2H₂O
              </p>
            </div>
            <div className="bg-white border rounded p-4">
              <h4 className="font-bold mb-2">2. Phản ứng thế Halogen (với Cl₂, Br₂)</h4>
              <p className="text-sm text-gray-600 mb-2">Đặc trưng cho hợp chất no (chứa liên kết đơn).</p>
              <p className="text-sm font-mono text-center text-orange-600 bg-orange-50 p-2 rounded">
                CH₄ + Cl₂ → (Ánh sáng) CH₃Cl + HCl
              </p>
              <p className="text-xs text-center text-gray-500 mt-1">(Methyl chloride)</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'alkene-alkyne',
    title: '3. Alkene (Ethylene) & Alkyne',
    icon: <Zap size={18} />,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-yellow-200 pb-2">Ethylene (C₂H₄)</h3>
          <p className="text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-100">
            Là hydrocarbon mạch hở, trong phân tử có chứa <strong>một liên kết đôi</strong> (C=C). Liên kết đôi gồm 1 liên kết bền (σ) và 1 liên kết kém bền (π) dễ bị đứt trong phản ứng hóa học.
            <br />Cấu tạo: <strong>CH₂ = CH₂</strong>
          </p>
          <div className="mt-4 grid gap-4">
            <div className="border p-3 rounded">
              <strong>Phản ứng cộng Bromine:</strong> (Làm mất màu dung dịch Brom, dùng nhận biết Alkene)
              <p className="text-center font-mono text-yellow-700 mt-2 bg-gray-50 p-2">CH₂=CH₂ + Br₂ (Nâu đỏ) → BrCH₂-CH₂Br (Không màu)</p>
            </div>
            <div className="border p-3 rounded">
              <strong>Phản ứng trùng hợp (Tạo Polyme):</strong>
              <p className="text-center font-mono text-yellow-700 mt-2 bg-gray-50 p-2">n(CH₂=CH₂) → (t°, p, xt) (-CH₂-CH₂-)ₙ  (Polyethylene - PE)</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-yellow-200 pb-2">Acetylene / Ethyne (C₂H₂)</h3>
          <p className="text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-100">
            Phân tử chứa <strong>một liên kết ba</strong> (C≡C), gồm 1 liên kết bền và 2 liên kết kém bền.
            <br />Cấu tạo: <strong>HC ≡ CH</strong>
          </p>
          <div className="mt-4 border p-3 rounded">
            <strong>Phản ứng cộng (xảy ra 2 nấc):</strong>
            <p className="text-center font-mono text-yellow-700 mt-2 bg-gray-50 p-2">
              HC≡CH + Br₂ → CHBr=CHBr<br/>
              CHBr=CHBr + Br₂ → CHBr₂-CHBr₂
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'alcohol',
    title: '4. Nguồn Hydrocarbon & Alcohol',
    icon: <Droplets size={18} />,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-cyan-200 pb-2">Ethylic Alcohol (C₂H₅OH)</h3>
          <p className="text-gray-700 bg-cyan-50 p-3 rounded border border-cyan-100">
            Công thức cấu tạo: <strong>CH₃ - CH₂ - OH</strong>. Nhóm chức <strong>-OH</strong> quyết định tính chất hóa học đặc trưng của rượu.
          </p>
          
          <div className="mt-4 grid gap-4">
            <div className="border p-3 rounded">
              <strong>Độ rượu (Độ cồn):</strong> Là thể tích rượu ethylic nguyên chất có trong 100ml dung dịch rượu.
              <br/><span className="text-sm italic">VD: Rượu 40 độ có nghĩa là trong 100ml hỗn hợp có 40ml rượu nguyên chất.</span>
            </div>
            <div className="border p-3 rounded">
              <strong>Phản ứng với Kim loại kiềm (Na, K):</strong> <br/>
              Nhóm -OH linh động nên phản ứng giải phóng khí Hidro.
              <p className="text-center font-mono text-cyan-700 mt-2 bg-gray-50 p-2">2C₂H₅OH + 2Na → 2C₂H₅ONa (Sodium Ethoxide) + H₂↑</p>
            </div>
            <div className="border p-3 rounded">
              <strong>Phản ứng cháy:</strong> Cháy ngọn lửa xanh, tỏa nhiều nhiệt.
              <p className="text-center font-mono text-cyan-700 mt-2 bg-gray-50 p-2">C₂H₅OH + 3O₂ → (t°) 2CO₂ + 3H₂O</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'acid',
    title: '5. Acetic Acid (CH₃COOH)',
    icon: <Beaker size={18} />,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-slate-200 pb-2">Đặc điểm cấu tạo</h3>
          <p className="text-gray-700 bg-slate-50 p-3 rounded border border-slate-200">
            Có chứa nhóm chức Carboxyl <strong>-COOH</strong>. Dung dịch nồng độ 2-5% dùng làm giấm ăn.
          </p>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-slate-200 pb-2">Tính chất hóa học</h3>
          <ul className="list-disc pl-5 mt-2 space-y-3 text-sm text-gray-700">
            <li><strong>Làm đổi màu quỳ tím</strong> thành đỏ mờ.</li>
            <li><strong>Tác dụng với kim loại</strong> đứng trước H trong dãy hoạt động: <br/>
              <span className="font-mono text-slate-700">2CH₃COOH + Zn → (CH₃COO)₂Zn + H₂↑</span>
            </li>
            <li><strong>Tác dụng với base, basic oxide:</strong> <br/>
              <span className="font-mono text-slate-700">CH₃COOH + NaOH → CH₃COONa + H₂O</span>
            </li>
            <li><strong>Tác dụng với muối carbonate:</strong> Sủi bọt khí CO₂ (Dùng nhận biết axit).<br/>
              <span className="font-mono text-slate-700">2CH₃COOH + CaCO₃ → (CH₃COO)₂Ca + H₂O + CO₂↑</span>
            </li>
          </ul>

          <div className="mt-4 border p-4 rounded bg-purple-50 border-purple-200">
            <h4 className="font-bold text-purple-800 mb-2">Phản ứng Este hóa (với C₂H₅OH)</h4>
            <p className="text-sm text-gray-700 mb-2">Phản ứng thuận nghịch, xúc tác H₂SO₄ đặc, đun nóng.</p>
            <p className="text-center font-mono text-purple-700 bg-white p-2 rounded font-bold">
              CH₃COOH + C₂H₅OH ⇌ (H₂SO₄ đặc, t°) CH₃COOC₂H₅ (Ethyl Acetate) + H₂O
            </p>
            <p className="text-xs text-center text-gray-500 mt-1">Ethyl Acetate có mùi thơm, ít tan nổi trên mặt nước.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'lipid-carbo',
    title: '6. Lipid & Carbohydrate',
    icon: <Leaf size={18} />,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-green-200 pb-2">Chất Béo (Lipid)</h3>
          <p className="text-sm text-gray-700">Là hỗn hợp nhiều <strong>ester phức tạp của Glycerol với các Acid Béo</strong> (Acid béo là axit hữu cơ có mạch cacbon dài, không phân nhánh).</p>
          <div className="mt-3 border p-3 rounded">
            <strong>Phản ứng Xà phòng hóa (đặc trưng nhất):</strong> Thủy phân trong môi trường kiềm tạo muối và glycerol.
            <p className="text-center font-mono text-green-700 mt-2 bg-gray-50 p-2">
              (RCOO)₃C₃H₅ + 3NaOH → (t°) 3RCOONa (Xà phòng) + C₃H₅(OH)₃ (Glycerol)
            </p>
          </div>
        </div>

        <div>
           <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-green-200 pb-2">Carbohydrate (Chất đường bột)</h3>
           <div className="overflow-x-auto shadow-sm rounded border">
            <table className="min-w-full text-left text-sm bg-white">
              <thead className="bg-green-50 text-green-800">
                <tr><th>Chất</th><th>Công thức</th><th>Tính chất đặc trưng</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-3 font-semibold">Glucose (Đường nho)</td>
                  <td className="p-3">C₆H₁₂O₆</td>
                  <td className="p-3">Phản ứng tráng bạc (tác dụng với AgNO₃/NH₃ tạo kết tủa Ag sáng bạc). Lên men tạo rượu.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Saccharose (Đường mía)</td>
                  <td className="p-3">C₁₂H₂₂O₁₁</td>
                  <td className="p-3">Không có PƯ tráng bạc. Bị thủy phân (khi có acid/nhiệt) tạo 1 Glucose + 1 Fructose.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Tinh bột & Cellulose</td>
                  <td className="p-3">(C₆H₁₀O₅)ₙ</td>
                  <td className="p-3">
                    - Tinh bột: Tác dụng Iốt tạo màu xanh đen.<br/>
                    - Cả hai đều bị thủy phân tạo thành Glucose.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'amino-protein',
    title: '7. Protein & Polymer',
    icon: <TestTube size={18} />,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-200 pb-2">Protein (Chất đạm)</h3>
          <p className="text-gray-700 mb-2">Thành phần cơ bản là các đại phân tử được cấu thành từ hàng trăm, nghìn gốc Amino acid nối với nhau bằng <strong>liên kết peptide</strong>.</p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-gray-700">
            <li><strong>Phản ứng thủy phân:</strong> Khi có men/acid/kiềm phân cắt dần tạo ra các đoạn chuỗi ngắn và cuối cùng là Amino acid.</li>
            <li><strong>Sự đông tụ:</strong> Dưới tác dụng của nhiệt (như luộc trứng, nấu riêu cua) hoặc hóa chất (pha chanh vào sữa), protein bị đông tụ đông đặc lại lơ lửng hoặc kết tủa.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-200 pb-2">Polymer (Vật liệu hữu cơ)</h3>
          <p className="text-gray-700 mb-3">Là những hợp chất có phân tử khối rất lớn do nhiều mắt xích (monomer) liên kết với nhau tạo nên.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-50 border p-3 rounded">
              <h4 className="font-bold text-gray-800">Chất Dẻo (Nhựa)</h4>
              <p className="text-sm">Polyethylene (PE), PVC (Nhựa ống nước). Có tính dẻo, đun nóng chảy được (đa số).</p>
            </div>
            <div className="bg-gray-50 border p-3 rounded">
              <h4 className="font-bold text-gray-800">Tơ Sợi</h4>
              <p className="text-sm">Tơ tự nhiên (Bông, len, tơ tằm) và Tơ tổng hợp (Nylon, Polyester). Mạch polymer thường thẳng, mảnh.</p>
            </div>
            <div className="bg-gray-50 border p-3 rounded">
              <h4 className="font-bold text-gray-800">Cao Su</h4>
              <p className="text-sm">Vật liệu có tính đàn hồi vượt trội. Cao su tự nhiên và cao su tổng hợp (Buna).</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export const OrganicChemistry = () => {
  const [activeLesson, setActiveLesson] = useState(LESSONS[0].id);
  const currentIndex = LESSONS.findIndex(l => l.id === activeLesson);
  
  return (
    <div className="flex flex-col md:flex-row h-full bg-white text-gray-800 rounded-lg shadow-inner overflow-hidden border-2 border-os-border">
      
      {/* SIDEBAR - MỤC LỤC */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-300 flex flex-col">
        <div className="p-4 bg-teal-600 text-white font-bold flex items-center gap-2">
          <BookOpen size={20} />
          <h2 className="line-clamp-1">Khóa học Hóa Hữu Cơ</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 modern-scrollbar">
          {LESSONS.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setActiveLesson(lesson.id)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-all border ${
                activeLesson === lesson.id 
                  ? 'bg-white border-teal-200 shadow-sm text-teal-700 font-semibold border-l-4 border-l-teal-500' 
                  : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-l-transparent'
              }`}
            >
              <div className={`mt-0.5 ${activeLesson === lesson.id ? 'text-teal-600' : 'text-gray-400'}`}>
                {lesson.icon}
              </div>
              <span className="flex-1 text-sm leading-snug">{lesson.title}</span>
            </button>
          ))}
        </div>
        <div className="bg-white p-4 border-t text-xs text-gray-500 text-center">
          <p>Chuyên đề THCS / THPT Quốc Gia</p>
          <p className="font-bold mt-1 text-teal-600">7 Chuyên đề Lý thuyết</p>
        </div>
      </div>

      {/* NOIDUNG (CONTENT) */}
      <div className="flex-1 overflow-y-auto bg-white p-6 relative modern-scrollbar">
        <div className="max-w-4xl mx-auto pb-20">
          
          {/* Header Bài học */}
          <div className="mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-3 font-semibold uppercase tracking-wider">
              <span>Hóa Hữu Cơ</span>
              <span>/</span>
              <span className="text-teal-600">Bài {currentIndex + 1}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 flex items-center gap-3 leading-tight">
              {LESSONS[currentIndex].title}
            </h1>
            <div className="h-1.5 w-24 bg-teal-500 rounded-full"></div>
          </div>

          {/* Nội dung chi tiết */}
          <div className="prose prose-teal max-w-none text-base lg:text-lg">
            {LESSONS[currentIndex].content}
          </div>

          {/* Điều hướng Next/Prev */}
          <div className="mt-12 flex justify-between items-center border-t border-gray-200 pt-6">
            <button
              onClick={() => {
                if(currentIndex > 0) setActiveLesson(LESSONS[currentIndex - 1].id)
              }}
              className={`retro-btn px-4 py-2 flex items-center gap-2 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400 shadow-none hover:translate-y-0 active:translate-y-0' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
            >
              <span>← Trở lại Bài {currentIndex > 0 ? currentIndex : ''}</span>
            </button>
            
            <button
              onClick={() => {
                if(currentIndex < LESSONS.length - 1) setActiveLesson(LESSONS[currentIndex + 1].id)
              }}
              className={`retro-btn retro-btn-primary px-4 py-2 flex items-center gap-2 ${currentIndex === LESSONS.length - 1 ? 'opacity-50 cursor-not-allowed shadow-none hover:translate-y-0 active:translate-y-0' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
            >
              <span>{currentIndex === LESSONS.length - 1 ? 'Hoàn thành Khóa học' : `Sang Bài ${currentIndex + 2} →`}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
