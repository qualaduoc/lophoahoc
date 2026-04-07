import React, { useState } from 'react';
import { BookOpen, Share2, PlusCircle, Star } from 'lucide-react';

// === Các SVG Hoạt hình Mô phỏng === //

const IonicBondModel = () => {
  const [transferred, setTransferred] = useState(false);

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border-2 border-indigo-100">
      <div className="flex items-center justify-center gap-12 mb-8 relative w-full h-64">
        {/* Na Atom */}
        <div className={`relative flex items-center justify-center transition-transform duration-1000 ${transferred ? '-translate-x-4' : ''}`}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="15" fill="#f43f5e" />
            <text x="70" cy="74" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+11</text>
            <circle cx="70" cy="70" r="30" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="70" cy="70" r="50" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="70" cy="70" r="68" fill="none" stroke={transferred ? "transparent" : "#cbd5e1"} strokeWidth="1" strokeDasharray="4 4" />
            {/* Inner electrons */}
            <circle cx="70" cy="40" r="4" fill="#3b82f6" />
            <circle cx="70" cy="100" r="4" fill="#3b82f6" />
            {/* Middle electrons (8) */}
            <circle cx="70" cy="20" r="4" fill="#3b82f6" />
            <circle cx="70" cy="120" r="4" fill="#3b82f6" />
            <circle cx="20" cy="70" r="4" fill="#3b82f6" />
            <circle cx="120" cy="70" r="4" fill="#3b82f6" />
            <circle cx="34" cy="34" r="4" fill="#3b82f6" />
            <circle cx="106" cy="106" r="4" fill="#3b82f6" />
            <circle cx="34" cy="106" r="4" fill="#3b82f6" />
            <circle cx="106" cy="34" r="4" fill="#3b82f6" />
            {/* Outer electron (1) -> moves */}
            <circle 
              cx={transferred ? "240" : "138"} 
              cy="70" 
              r="4" 
              fill="#ef4444" 
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute -bottom-6 font-black text-gray-700">Na {transferred && <span className="text-red-500 text-xs align-top">+</span>}</div>
        </div>

        {/* Cl Atom */}
        <div className={`relative flex items-center justify-center transition-transform duration-1000 ${transferred ? 'translate-x-4' : ''}`}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="15" fill="#f43f5e" />
            <text x="70" cy="74" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+17</text>
            <circle cx="70" cy="70" r="30" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="70" cy="70" r="50" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="70" cy="70" r="68" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            {/* Inner & Middle same as Na basically... */}
            <circle cx="70" cy="40" r="4" fill="#3b82f6" />
            <circle cx="70" cy="100" r="4" fill="#3b82f6" />
            {/* Middle (8) */}
            <circle cx="70" cy="20" r="4" fill="#3b82f6" />
            <circle cx="70" cy="120" r="4" fill="#3b82f6" />
            <circle cx="20" cy="70" r="4" fill="#3b82f6" />
            <circle cx="120" cy="70" r="4" fill="#3b82f6" />
            <circle cx="34" cy="34" r="4" fill="#3b82f6" />
            <circle cx="106" cy="106" r="4" fill="#3b82f6" />
            <circle cx="34" cy="106" r="4" fill="#3b82f6" />
            <circle cx="106" cy="34" r="4" fill="#3b82f6" />
            {/* Outer (7) */}
            <circle cx="70" cy="2" r="4" fill="#3b82f6" />
            <circle cx="70" cy="138" r="4" fill="#3b82f6" />
            <circle cx="138" cy="70" r="4" fill="#3b82f6" />
            <circle cx="20" cy="20" r="4" fill="#3b82f6" />
            <circle cx="120" cy="120" r="4" fill="#3b82f6" />
            <circle cx="20" cy="120" r="4" fill="#3b82f6" />
            <circle cx="120" cy="20" r="4" fill="#3b82f6" />
            {/* Missing 1 at 2,70 */}
          </svg>
          <div className="absolute -bottom-6 font-black text-gray-700">Cl {transferred && <span className="text-blue-500 text-xs align-top">-</span>}</div>
        </div>
      </div>
      <button 
        onClick={() => setTransferred(!transferred)}
        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-md"
      >
        {transferred ? "Hoàn tác" : "Kích hoạt chuyển Electron"}
      </button>
      <p className="mt-4 text-sm text-gray-600 text-center max-w-lg">
        {transferred ? 
          "Nguyên tử Na đã nhường 1 electron lớp ngoài cùng cho Cl. Trở thành ion dương Na⁺ và ion âm Cl⁻. Cả 2 đều đạt cấu hình bền vững của khí hiếm. Chúng hút nhau tạo thành NaCl." 
          : "Nguyên tử Na có 1 electron lớp ngoài cùng. Nguyên tử Cl cần 1 electron để đạt 8 electron lớp ngoài cùng."}
      </p>
    </div>
  )
}

const CovalentBondModel = () => {
    const [bonded, setBonded] = useState(false);
  
    return (
      <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border-2 border-green-100 mt-6">
        <div className="flex items-center justify-center relative w-full h-64">
          
          {/* Oxygen */}
          <div className="absolute z-10">
            <svg width="180" height="180" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="15" fill="#f43f5e" />
              <text x="80" cy="84" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+8</text>
              <circle cx="80" cy="80" r="30" fill="none" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="#e2e8f0" strokeWidth="2" />
              {/* Inner 2 */}
              <circle cx="80" cy="50" r="4" fill="#3b82f6" />
              <circle cx="80" cy="110" r="4" fill="#3b82f6" />
              {/* Outer 6 */}
              <circle cx="80" cy="20" r="4" fill="#3b82f6" />
              <circle cx="80" cy="140" r="4" fill="#3b82f6" />
              <circle cx="38" cy="38" r="4" fill="#3b82f6" />
              <circle cx="122" cy="122" r="4" fill="#3b82f6" />
              {/* The shared ones on O */}
              <circle cx="20" cy="80" r="4" fill="#3b82f6" />
              <circle cx="140" cy="80" r="4" fill="#3b82f6" />
            </svg>
            <div className="absolute -bottom-2 w-full text-center font-black text-gray-700">O</div>
          </div>
  
          {/* H Left */}
          <div className={`absolute transition-all duration-1000 ease-in-out z-20 ${bonded ? 'translate-x-[-50px] opacity-100' : 'translate-x-[-100px] opacity-80'}`}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="10" fill="#f43f5e" />
              <text x="40" cy="44" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+1</text>
              <circle cx="40" cy="40" r="30" fill="none" stroke="#e2e8f0" strokeWidth="2" />
              {/* The electron of H */}
              <circle cx="70" cy="40" r="4" fill="#ef4444" />
            </svg>
            <div className="absolute -bottom-2 w-full text-center font-black text-gray-700">H</div>
          </div>

          {/* H Right */}
          <div className={`absolute transition-all duration-1000 ease-in-out z-20 ${bonded ? 'translate-x-[50px] opacity-100' : 'translate-x-[100px] opacity-80'}`}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="10" fill="#f43f5e" />
              <text x="40" cy="44" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+1</text>
              <circle cx="40" cy="40" r="30" fill="none" stroke="#e2e8f0" strokeWidth="2" />
              {/* The electron of H */}
              <circle cx="10" cy="40" r="4" fill="#ef4444" />
            </svg>
            <div className="absolute -bottom-2 w-full text-center font-black text-gray-700">H</div>
          </div>
  
        </div>
        <button 
          onClick={() => setBonded(!bonded)}
          className="px-6 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors shadow-md"
        >
          {bonded ? "Tách phân tử nước" : "Hình thành Liên kết (H₂O)"}
        </button>
        <p className="mt-4 text-sm text-gray-600 text-center max-w-lg">
          {bonded ? 
            "Mỗi nguyên tử H góp 1 electron với O tạo thành 2 cặp electron dùng chung. Oxygen đạt cấu hình 8e (khí hiếm Ne), Hydrogen đạt cấu hình 2e (khí hiếm He)." 
            : "Hydrogen cần 1 electron và Oxygen cần 2 electron để đạt cấu hình khí hiếm."}
        </p>
      </div>
    )
  }

export const ChemicalBonds = () => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-black mb-3">LIÊN KẾT HÓA HỌC</h1>
        <p className="text-sky-100 max-w-2xl text-base md:text-lg">
          Khám phá cách các nguyên tử tương tác với nhau để tạo ra vạn vật trong vũ trụ. Tại sao chúng lại liên kết? Và chúng liên kết bằng cách nào?
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1 */}
        <section className="glass p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <Star className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-gray-800">1. Cấu trúc electron bền vững của khí hiếm</h2>
          </div>
          
          <div className="prose max-w-none text-gray-600">
            <p>
              Ở điều kiện thường, các khí hiếm (như Helium, Neon, Argon) tồn tại ở dạng đơn nguyên tử bền vững, khó bị biến đổi hóa học.
            </p>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 my-4 text-blue-900">
              <strong>Nguyên tắc vàng (Bát tử - Octet):</strong> Lớp electron ngoài cùng của khí hiếm chứa <strong>8 electron</strong> (riêng Helium chứa 2 electron). Nguyên tử của các nguyên tố khác có xu hướng tham gia <strong>liên kết hóa học</strong> để đạt được lớp vỏ giống khí hiếm bằng cách nhường, nhận hoặc dùng chung electron.
            </div>
          </div>
          
          <div className="flex gap-8 justify-center mt-6">
             {/* Helium */}
             <div className="text-center">
                <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="10" fill="#f43f5e" />
                    <text x="40" cy="44" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+2</text>
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#3b82f6" strokeWidth="2" />
                    <circle cx="40" cy="10" r="4" fill="#3b82f6" />
                    <circle cx="40" cy="70" r="4" fill="#3b82f6" />
                </svg>
                <p className="font-bold text-sm text-gray-700 mt-2">He (Helium)</p>
             </div>
             {/* Neon */}
             <div className="text-center">
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="10" fill="#f43f5e" />
                    <text x="50" cy="54" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+10</text>
                    <circle cx="50" cy="50" r="25" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="2" />
                    <circle cx="50" cy="25" r="3" fill="#94a3b8" />
                    <circle cx="50" cy="75" r="3" fill="#94a3b8" />
                    {/* 8 outer */}
                    <circle cx="50" cy="5" r="4" fill="#3b82f6" />
                    <circle cx="50" cy="95" r="4" fill="#3b82f6" />
                    <circle cx="5" cy="50" r="4" fill="#3b82f6" />
                    <circle cx="95" cy="50" r="4" fill="#3b82f6" />
                    <circle cx="18" cy="18" r="4" fill="#3b82f6" />
                    <circle cx="82" cy="82" r="4" fill="#3b82f6" />
                    <circle cx="18" cy="82" r="4" fill="#3b82f6" />
                    <circle cx="82" cy="18" r="4" fill="#3b82f6" />
                </svg>
                <p className="font-bold text-sm text-gray-700 mt-2">Ne (Neon)</p>
             </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="glass p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-gray-800">2. Liên kết Ion (Ion Bond)</h2>
          </div>
          
          <div className="prose max-w-none text-gray-600 mb-6">
            <p>
              Xảy ra giữa Kim loại và Phi kim. Các nguyên tử kim loại có xu hướng <strong>nhường electron</strong> để trở thành ion dương. Nguyên tử phi kim <strong>nhận electron</strong> để trở thành ion âm. 
            </p>
            <p>Các ion trái dấu hút nhau bằng lực hút tĩnh điện để tạo thành hợp chất ion.</p>
            <ul>
                <li><strong>Tính chất:</strong> Là chất rắn ở điều kiện thường, khó bay hơi, khó nóng chảy, tan trong nước tạo thành dung dịch dẫn điện.</li>
                <li><strong>Ví dụ:</strong> Muối ăn (NaCl), Magnesium Oxide (MgO).</li>
            </ul>
          </div>

          <h3 className="text-center font-bold text-indigo-900 mb-4 text-lg">Mô phỏng sự hình thành phân tử Muối ăn (NaCl)</h3>
          <IonicBondModel />
        </section>

        {/* Section 3 */}
        <section className="glass p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <Share2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-gray-800">3. Liên kết Cộng hóa trị (Covalent Bond)</h2>
          </div>
          
          <div className="prose max-w-none text-gray-600 mb-6">
            <p>
              Xảy ra chủ yếu giữa Phi kim với Phi kim. Do không có nguyên tử nào muốn "nhường hẳn" electron, chúng quyết định <strong>dùng chung các cặp electron</strong> để tạo thành liên kết.
            </p>
            <ul>
                <li><strong>Đơn chất:</strong> Phân tử Hydrogen (H₂), Oxygen (O₂), Nitrogen (N₂)...</li>
                <li><strong>Hợp chất:</strong> Phân tử Nước (H₂O), Carbon dioxide (CO₂), Ammonia (NH₃)...</li>
                <li><strong>Tính chất:</strong> Có thể ở thể khí, lỏng, hoặc rắn. Thường có nhiệt độ nóng chảy và nhiệt độ sôi thấp hơn hợp chất ion.</li>
            </ul>
          </div>

          <h3 className="text-center font-bold text-green-900 mb-4 text-lg">Mô phỏng sự hình thành phân tử Nước (H₂O)</h3>
          <CovalentBondModel />
        </section>

      </div>
    </div>
  );
};
