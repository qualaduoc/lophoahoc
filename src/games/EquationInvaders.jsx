import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Rocket, Heart, Crosshair, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const EQUATIONS = [
  { text: '_H₂ + _O₂ → _H₂O', answer: '2,1,2', speed: 1 },
  { text: '_Na + _Cl₂ → _NaCl', answer: '2,1,2', speed: 1.2 },
  { text: '_Ca + _O₂ → _CaO', answer: '2,1,2', speed: 1.5 },
  { text: '_N₂ + _H₂ → _NH₃', answer: '1,3,2', speed: 1.8 },
  { text: '_Fe + _O₂ → _Fe₃O₄', answer: '3,2,1', speed: 2 },
  { text: '_Al + _O₂ → _Al₂O₃', answer: '4,3,2', speed: 2.2 },
  { text: '_P + _O₂ → _P₂O₅', answer: '4,5,2', speed: 2.5 }
];

export const EquationInvaders = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hp, setHp] = useState(3);
  const [score, setScore] = useState(0);
  const [asteroids, setAsteroids] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [gameOver, setGameOver] = useState(false);
  
  const gameAreaRef = useRef(null);
  const animationRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const asteroidsRef = useRef([]);

  const startGame = () => {
    setIsPlaying(true);
    setHp(3);
    setScore(0);
    setGameOver(false);
    setAsteroids([]);
    setInputValue('');
    asteroidsRef.current = [];
    lastSpawnRef.current = Date.now();
    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const spawnAsteroid = (now) => {
    const spawnRate = Math.max(1500, 3000 - (score * 100)); // Càng về sau ra càng nhanh
    if (now - lastSpawnRef.current > spawnRate) {
      const eq = EQUATIONS[Math.floor(Math.random() * EQUATIONS.length)];
      const newAsteroid = {
        id: Math.random().toString(36).substr(2, 9),
        text: eq.text,
        answer: eq.answer,
        y: -10, // Bắt đầu ở trên cùng (percent)
        x: Math.random() * 60 + 20, // 20% to 80% chiều ngang
        speed: eq.speed + (score * 0.1) // Càng điểm cao càng rớt lẹ
      };
      asteroidsRef.current.push(newAsteroid);
      lastSpawnRef.current = now;
    }
  };

  const gameLoop = () => {
    if (hp <= 0) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    const now = Date.now();
    let currentAsteroids = [...asteroidsRef.current];
    let lostHp = 0;

    // Di chuyển thiên thạch
    currentAsteroids.forEach(a => {
      a.y += a.speed * 0.1; // Khung hình 60fps
      if (a.y > 90) { // Chạm đáy
        a.dead = true;
        lostHp += 1;
      }
    });

    if (lostHp > 0) {
      setHp(prev => Math.max(0, prev - lostHp));
    }

    currentAsteroids = currentAsteroids.filter(a => !a.dead);
    asteroidsRef.current = currentAsteroids;
    setAsteroids([...currentAsteroids]); // Cập nhật state để render

    spawnAsteroid(now);

    if (hp > 0) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleShoot = (e) => {
    e.preventDefault();
    const val = inputValue.replace(/\s+/g, ''); // Bỏ khoảng trắng
    if (!val) return;

    let hit = false;
    let newAsteroids = [...asteroidsRef.current];

    // Tìm thiên thạch thấp nhất có đáp án trùng
    const targetIndex = newAsteroids.slice().reverse().findIndex(a => a.answer === val);
    
    if (targetIndex !== -1) {
      // Vì slice().reverse() lật mảng, nên target thực sự là:
      const realIndex = newAsteroids.length - 1 - targetIndex;
      newAsteroids[realIndex].dead = true; // Mark as dead
      hit = true;

      // Nổ
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { 
          x: newAsteroids[realIndex].x / 100, 
          y: Math.max(0, newAsteroids[realIndex].y / 100) 
        },
        colors: ['#ff0000', '#ffa500', '#4ade80']
      });

      setScore(s => s + 10);
      setInputValue('');
    } else {
      // Miss
      setScore(s => Math.max(0, s - 2));
    }

    if (hit) {
      newAsteroids = newAsteroids.filter(a => !a.dead);
      asteroidsRef.current = newAsteroids;
      setAsteroids([...newAsteroids]);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col bg-[#0b0e14] text-white rounded-2xl overflow-hidden shadow-2xl relative font-sans">
      {/* Header */}
      <div className="bg-[#121620] p-4 flex items-center justify-between border-b 4 border-[#2f3851] relative z-20">
        <button onClick={() => { if(animationRef.current) cancelAnimationFrame(animationRef.current); navigate('/games'); }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Rocket className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-black tracking-wider uppercase">Pháo Đài Phương Trình</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            <Heart className="w-4 h-4 fill-current" /> {hp}
          </div>
          <div className="font-mono text-indigo-300 font-bold bg-[#1a1f2e] px-4 py-1.5 rounded-xl border border-[#2f3851]">
            ĐIỂM: {score}
          </div>
        </div>
      </div>

      {/* Màn hình Game */}
      <div 
        ref={gameAreaRef} 
        className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1f2e] via-[#0b0e14] to-black"
        style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            {gameOver && (
              <div className="mb-8 text-center animate-bounce">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-4xl font-black text-red-500 mb-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">GAME OVER!</h2>
                <p className="text-xl text-indigo-200">Điểm của bạn: <span className="font-bold text-white">{score}</span></p>
              </div>
            )}
            {!gameOver && (
              <div className="mb-8 text-center max-w-md bg-[#121620] p-6 rounded-2xl border 2 border-[#2f3851]">
                <h2 className="text-2xl font-black text-indigo-400 mb-4 tracking-widest">LUẬT CHƠI</h2>
                <p className="text-sm text-gray-400 mb-2">1. Xem phương trình hóa học rơi xuống.</p>
                <p className="text-sm text-gray-400 mb-2">2. Nhập hệ số cân bằng (ngăn cách bởi dấu phẩy).</p>
                <p className="text-sm text-gray-400 font-bold italic">VD: _H₂ + _O₂ → _H₂O {'=>'} Điền: 2,1,2</p>
              </div>
            )}
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.5)] transform hover:scale-105 transition-all border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1"
            >
              {gameOver ? 'CHƠI LẠI' : '🔥 BẮT ĐẦU NGAY!'}
            </button>
          </div>
        ) : (
          <>
            {/* Asteroids */}
            {asteroids.map(ast => (
              <div 
                key={ast.id}
                className="absolute transform -translate-x-1/2 p-3 bg-[#242b3d]/90 border 2 border-indigo-500/50 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] backdrop-blur-md"
                style={{ top: ast.y + '%', left: ast.x + '%' }}
              >
                <div className="text-lg font-bold font-mono text-center tracking-widest whitespace-nowrap">
                  {ast.text}
                </div>
              </div>
            ))}

            {/* Súng / Trạm phòng thủ */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-t-full border-t-4 border-l-4 border-r-4 border-indigo-400 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] z-20">
                <Crosshair className="w-6 h-6 text-white" />
              </div>
              <div className="w-24 h-6 bg-gray-800 rounded-b-xl border-b-4 border-gray-900 z-10" />
            </div>

            {/* Bàn phím nhập liệu */}
            <form onSubmit={handleShoot} className="absolute bottom-6 left-6 right-6 flex justify-center z-30">
              <div className="relative w-full max-w-sm">
                <input 
                  type="text" 
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập: 2,1,2"
                  className="w-full bg-[#1a1f2e] border-2 border-indigo-500 rounded-full px-6 py-4 text-xl font-black text-center font-mono shadow-[0_0_15px_rgba(99,102,241,0.2)] focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition-colors">
                  BẮN
                </button>
              </div>
            </form>
            
            {/* Scanline effect */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 mix-blend-overlay"></div>
          </>
        )}
      </div>
    </div>
  );
};
