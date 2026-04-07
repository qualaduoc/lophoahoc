import React, { useState } from 'react';
import { ArrowLeft, Target, ShieldAlert, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const ELEMENTS = [
  { symbol: 'H', clue: 'Nguyên tố nhẹ nhất vũ trụ' },
  { symbol: 'He', clue: 'Khí hiếm nhẹ nhất, dùng bơm bóng bay' },
  { symbol: 'Li', clue: 'Kim loại siêu nhẹ dùng làm pin điện thoại' },
  { symbol: 'C', clue: 'Nền tảng của sự sống, than đá, kim cương' },
  { symbol: 'N', clue: 'Khí chiếm 78% bầu khí quyển' },
  { symbol: 'O', clue: 'Khí duy trì sự sống và sự cháy' },
  { symbol: 'F', clue: 'Phi kim mạnh nhất, hay có trong kem đánh răng' },
  { symbol: 'Ne', clue: 'Khí hiếm dùng làm đèn quảng cáo phát sáng đỏ' },
  { symbol: 'Na', clue: 'Kim loại kiềm tạo ra vị mặn của nước biển (cùng với Clo)' },
  { symbol: 'Mg', clue: 'Kim loại cháy sáng chói lọi, dùng làm pháo sáng' },
  { symbol: 'Al', clue: 'Kim loại phổ biến nhất vỏ trái đất, làm vỏ lon nước' },
  { symbol: 'Si', clue: 'Chất bán dẫn lõi của mọi con chip máy tính' },
  { symbol: 'P', clue: 'Thành phần nằm trên đầu que diêm' },
  { symbol: 'S', clue: 'Chất rắn màu vàng, mùi hắc' },
  { symbol: 'Cl', clue: 'Khí màu vàng lục, dùng khử trùng nước hồ bơi' },
  { symbol: 'Ar', clue: 'Khí hiếm dùng bơm vào bóng đèn sợi đốt' }
];

export const ElementMinesweeper = () => {
  const navigate = useNavigate();
  // Khởi tạo bàn chơi 4x4 từ 16 nguyên tố
  const [board] = useState(() => [...ELEMENTS].sort(() => Math.random() - 0.5));
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [hp, setHp] = useState(5);
  const [revealed, setRevealed] = useState(Array(16).fill(false)); // true if cell is clicked
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  const target = ELEMENTS[currentTargetIndex];

  const handleClick = (index, el) => {
    if(gameOver || victory || revealed[index]) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (el.symbol === target.symbol) {
      // Đúng
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
      setTimeout(() => {
        if (currentTargetIndex + 1 < ELEMENTS.length) {
          setCurrentTargetIndex(i => i + 1);
        } else {
          setVictory(true);
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
        }
      }, 1000);
    } else {
      // Sai
      const newHp = hp - 1;
      setHp(newHp);
      if (newHp <= 0) {
        setGameOver(true);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col bg-[#1e1b4b] text-white rounded-2xl overflow-hidden shadow-2xl relative font-sans">
      <div className="bg-[#312e81] p-4 flex items-center justify-between border-b 4 border-[#1e1b4b]">
        <button onClick={() => navigate('/games')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-pink-400" />
          <h1 className="text-xl font-black tracking-wider uppercase">Dò Radar Nguyên Tố</h1>
        </div>
        <div className="flex items-center gap-2 font-bold text-pink-400 bg-pink-500/20 px-4 py-1.5 rounded-full border border-pink-500/30">
          <ShieldAlert className="w-4 h-4" /> HP: {hp}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a]">
        
        {/* Rada Manh mối */}
        {!gameOver && !victory && (
          <div className="w-full max-w-2xl bg-[#312e81]/50 border-2 border-indigo-500/50 rounded-2xl p-6 mb-8 text-center backdrop-blur-sm shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            <h2 className="text-sm font-bold tracking-widest text-indigo-300 uppercase mb-2">📡 Vệ tinh phân tích: Tắt thẻ mục tiêu</h2>
            <p className="text-2xl font-black text-pink-400">"{target.clue}"</p>
          </div>
        )}

        {gameOver && (
          <div className="text-center mb-8">
            <h2 className="text-5xl font-black text-red-500 mb-2">THẤT BẠI</h2>
            <p className="text-indigo-200">Radar đã cạn kiệt năng lượng. Bạn chưa tìm đủ nguyên tố.</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-3 bg-red-600 rounded-full font-bold">Thử thách Lại</button>
          </div>
        )}

        {victory && (
          <div className="text-center mb-8">
            <h2 className="text-5xl font-black text-emerald-400 mb-2">XUẤT SẮC!</h2>
            <p className="text-indigo-200">Bạn là chúa tể bảng tuần hoàn! Đã tìm sạch mục tiêu.</p>
            <button onClick={() => navigate('/games')} className="mt-4 px-6 py-3 bg-emerald-600 rounded-full font-bold">Về Trang Chủ</button>
          </div>
        )}

        {/* Board 4x4 */}
        <div className="grid grid-cols-4 gap-3 max-w-lg w-full">
          {board.map((el, i) => {
            const isRevealed = revealed[i];
            const isTarget = el.symbol === target.symbol;
            
            return (
              <button
                key={el.symbol}
                onClick={() => handleClick(i, el)}
                disabled={gameOver || victory || isRevealed}
                className={`h-24 rounded-2xl text-2xl font-black transition-all transform perspective-1000 ${
                  isRevealed 
                    ? isTarget
                       ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] rotate-y-180 border-2 border-emerald-300' // Correct
                       : 'bg-red-500/20 text-red-300 border-2 border-red-500/30 rotate-y-180 opacity-50' // Wrong
                    : 'bg-indigo-600 hover:bg-indigo-500 text-indigo-200 border-b-4 border-indigo-800 shadow-md active:translate-y-1 active:border-b-0' // Hidden
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {isRevealed ? (
                  isTarget ? (
                    <div className="flex flex-col items-center justify-center animate-bounce">
                      <span>{el.symbol}</span>
                      <Check className="w-5 h-5 absolute top-1 right-1 opacity-50" />
                    </div>
                  ) : (
                    el.symbol
                  )
                ) : '?'}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
