import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Beaker, Trash2, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Dữ liệu ban đầu
const INITIAL_ELEMENTS = [
  { id: 'H', name: 'Hydrogen', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'O', name: 'Oxygen', color: 'bg-sky-100 text-sky-700 border-sky-300' },
  { id: 'Na', name: 'Sodium', color: 'bg-red-100 text-red-700 border-red-300' },
  { id: 'Cl', name: 'Chlorine', color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'C', name: 'Carbon', color: 'bg-gray-200 text-gray-800 border-gray-400' },
  { id: 'K', name: 'Potassium', color: 'bg-purple-100 text-purple-700 border-purple-300' }
];

// Công thức chế tạo
// Yêu cầu mảng chính xác các nguyên tố tham gia phản ứng (không phân biệt thứ tự)
const RECIPES = [
  {
    ingredients: ['Na', 'Cl'],
    result: { id: 'NaCl', name: 'Muối Ăn', symbol: 'NaCl', desc: 'Có vị mặn, tan trong nước. Dùng làm gia vị.', color: 'bg-white text-gray-800 border-gray-300' },
    effect: 'party'
  },
  {
    ingredients: ['H', 'H', 'O'],
    result: { id: 'H2O', name: 'Nước', symbol: 'H₂O', desc: 'Chất lỏng không màu, không mùi, nguồn gốc sự sống.', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    effect: 'party'
  },
  {
    ingredients: ['C', 'O', 'O'],
    result: { id: 'CO2', name: 'Carbon Dioxide', symbol: 'CO₂', desc: 'Khí nhà kính, dùng trong nước ngọt có gas.', color: 'bg-zinc-100 text-zinc-700 border-zinc-400' },
    effect: 'party'
  },
  {
    ingredients: ['K', 'H2O'],
    result: { id: 'KOH', name: 'Kali Hydroxit + Khí H₂', symbol: 'KOH', desc: 'Bùmmmm! Kim loại kiềm tác dụng với nước gây nổ mạnh!', color: 'bg-orange-100 text-orange-700 border-orange-500' },
    effect: 'explosion'
  }
];

export const AlchemyGame = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState(INITIAL_ELEMENTS);
  const [crucible, setCrucible] = useState([]);
  const [message, setMessage] = useState('Thả các nguyên tố vào Vạc để pha chế!');
  const [shakeCrucible, setShakeCrucible] = useState(false);

  // Xử lý kéo thả (Dữ liệu text)
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      const item = JSON.parse(data);
      // Giới hạn vạc chứa tối đa 4 chất
      if (crucible.length >= 4) {
        setMessage('Vạc đã đầy! Không thể cho thêm.');
        return;
      }
      setCrucible([...crucible, item]);
      setMessage('Đã thêm ' + item.name + ' vào Vạc.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Cho phép thả
  };

  // Nút xóa vạc
  const clearCrucible = () => {
    setCrucible([]);
    setMessage('Đã rửa sạch Vạc Ảo!');
  };

  // Nút Luyện Kim (Kiểm tra công thức)
  const mixElements = () => {
    if (crucible.length === 0) {
      setMessage('Vạc đang trống! Cần có nguyên liệu.');
      return;
    }
    if (crucible.length === 1) {
      setMessage('Cần ít nhất 2 chất để xảy ra phản ứng!');
      setShakeCrucible(true);
      setTimeout(() => setShakeCrucible(false), 500);
      return;
    }

    const currentIds = crucible.map(c => c.id).sort();

    // Tìm công thức
    const matchingRecipe = RECIPES.find(r => {
      const recipeIds = [...r.ingredients].sort();
      return JSON.stringify(currentIds) === JSON.stringify(recipeIds);
    });

    if (matchingRecipe) {
      // Thành công!
      if (matchingRecipe.effect === 'explosion') {
        fireExplosion();
        setMessage('💥 BÙMMMM! Phản ứng mãnh liệt: ' + matchingRecipe.result.desc);
      } else {
        fireConfetti();
        setMessage('✨ Tuyệt vời! Bạn đã chế tạo thành công: ' + matchingRecipe.result.name);
      }
      
      // Thêm kết quả vào kho nếu chưa có
      if (!inventory.find(i => i.id === matchingRecipe.result.id)) {
        setInventory([...inventory, matchingRecipe.result]);
      }
      
      // Chuyển vạc thành kết quả tạm thời rồi xóa
      setCrucible([matchingRecipe.result]);
      setTimeout(() => setCrucible([]), 3000); // 3 giây tự dọn vạc
    } else {
      // Thất bại
      setShakeCrucible(true);
      setTimeout(() => setShakeCrucible(false), 500);
      setMessage('❌ Các chất này không kết hợp được với nhau, hoặc thiếu xúc tác!');
      setTimeout(() => setCrucible([]), 1500);
    }
  };

  const fireConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const fireExplosion = () => {
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = 1000 - 200; // 1s effect
      if (timeLeft <= 0) return clearInterval(interval);
      confetti(Object.assign({}, defaults, { particleCount: 50, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount: 50, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#ff0000', '#ffa500', '#ffff00'] }));
    }, 250);
    setTimeout(() => clearInterval(interval), 1000);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col bg-[#1a1f2e] text-white rounded-2xl overflow-hidden shadow-2xl relative font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-4 flex items-center justify-between border-b 4 border-amber-900 shadow-md relative z-10">
        <button onClick={() => navigate('/games')} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Beaker className="w-6 h-6 text-amber-200" />
          <h1 className="text-xl font-black tracking-wider uppercase">Thuật Sĩ Giả Kim</h1>
        </div>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="flex flex-1 flex-col md:flex-row relative z-10 p-6 gap-6">
        
        {/* Kho Nguyên Liệu (Bên trái) */}
        <div className="w-full md:w-1/3 bg-[#242b3d] border-2 border-[#2f3851] rounded-2xl p-4 flex flex-col h-[60vh] md:h-auto">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
            <span>Kho Vật Chất</span>
            <span className="text-xs bg-[#1a1f2e] px-2 py-1 rounded-md">{inventory.length} Món</span>
          </h2>
          
          <div className="flex-1 overflow-y-auto content-start grid grid-cols-2 lg:grid-cols-3 gap-3 pr-2 custom-scrollbar">
            {inventory.map(item => (
              <motion.div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-3 rounded-xl border-b-4 bg-gradient-to-br from-gray-50 to-gray-200 text-gray-900 cursor-grab active:cursor-grabbing text-center shadow-lg hover:shadow-xl transition-shadow ${
                  item.symbol ? 'col-span-2' : '' // Hợp chất chiếm 2 cột cho bự
                }`}
              >
                <div className="text-2xl font-black mb-1">{item.symbol || item.id}</div>
                <div className="text-[10px] font-bold uppercase truncate opacity-70">{item.name}</div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">Nắm và kéo thẻ vật chất thả sang Vạc.</p>
        </div>

        {/* Vạc Luyện Kim (Bên phải) */}
        <div className="w-full md:w-2/3 flex flex-col items-center">
          
          {/* Màn hình thông báo */}
          <div className="bg-[#0f131a] border border-[#2f3851] text-amber-400 font-mono text-sm px-6 py-3 rounded-xl mb-auto mt-2 w-full max-w-md text-center h-16 flex items-center justify-center shadow-inner">
            {message}
          </div>

          {/* Vùng Vạc Khuấy (Dropzone) */}
          <motion.div 
            animate={shakeCrucible ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-b from-[#242b3d] to-[#121620] border-8 border-[#3f4b68] shadow-2xl flex flex-col items-center justify-center relative mt-8 mb-12 group"
          >
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/10 group-hover:border-amber-400/50 group-hover:animate-spin-slow transition-colors" />
            
            <div className="flex flex-wrap justify-center items-center gap-2 z-10 w-4/5 h-4/5">
              <AnimatePresence>
                {crucible.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-600 text-center flex flex-col items-center gap-2">
                     <span className="text-4xl text-gray-700">⚗️</span>
                     <span className="font-bold text-xs uppercase tracking-widest">Thả vào đây</span>
                  </motion.div>
                ) : (
                  crucible.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`w-16 h-16 rounded-xl border-b-4 flex items-center justify-center text-xl font-black shadow-lg bg-gradient-to-br from-gray-50 to-gray-200 text-gray-900`}
                    >
                      {item.symbol || item.id}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
            
            {/* Lửa cháy dưới vạc */}
            <div className="absolute -bottom-10 flex gap-2">
              <div className="w-4 h-8 bg-orange-500 rounded-full animate-pulse opacity-80 blur-md"></div>
              <div className="w-6 h-10 bg-amber-400 rounded-full animate-pulse opacity-90 blur-md delay-75"></div>
              <div className="w-4 h-8 bg-red-500 rounded-full animate-pulse opacity-80 blur-md delay-150"></div>
            </div>
          </motion.div>

          {/* Bảng điều khiển */}
          <div className="flex gap-4 mb-4">
            <button 
              onClick={clearCrucible}
              disabled={crucible.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-[#242b3d] hover:bg-[#2f3851] text-gray-300 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-[#1a1f2e] active:border-b-0 active:translate-y-1"
            >
              <Trash2 className="w-5 h-5" /> Rửa Vạc
            </button>
            <button 
              onClick={mixElements}
              disabled={crucible.length === 0}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none border-b-4 border-orange-800 active:border-b-0 active:translate-y-1"
            >
              <Sparkles className="w-5 h-5" /> Pha Chế!
            </button>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1a1f2e; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f4b68; border-radius: 4px; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}} />
    </div>
  );
};
