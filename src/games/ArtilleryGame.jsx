import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export const ArtilleryGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [score, setScore] = useState(0);
  const [isFiring, setIsFiring] = useState(false);
  const [targetPos, setTargetPos] = useState({ x: 700, y: 350 });

  // Game state
  const stateRef = useRef({
    bullet: null, // {x, y, vx, vy}
    target: { x: 700, y: 350, w: 40, h: 40 },
    cannon: { x: 50, y: 350, w: 40, h: 40 },
    gravity: 0.5,
    wind: Math.random() * 0.4 - 0.2 // Wind effect
  });

  // Spawn target
  useEffect(() => {
    stateRef.current.target.x = 400 + Math.random() * 350;
    stateRef.current.wind = Math.random() * 0.4 - 0.2;
    setTargetPos({ x: stateRef.current.target.x, y: stateRef.current.target.y });
  }, [score]);

  // Game loop
  const update = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Lấy state
    const s = stateRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, 800, 400);

    // Draw Ground
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, 390, 800, 10);

    // Draw Wind Indicator
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '16px monospace';
    ctx.fillText(`Cản Gió: ${(s.wind * 100).toFixed(0)}`, 350, 30);

    // Draw Target
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(s.target.x, s.target.y, s.target.w, s.target.h);
    // Draw target bullseye
    ctx.beginPath();
    ctx.arc(s.target.x + 20, s.target.y + 20, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Draw Cannon Base
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(s.cannon.x, s.cannon.y, s.cannon.w, s.cannon.h);
    
    // Draw Cannon Barrel
    ctx.save();
    ctx.translate(s.cannon.x + 20, s.cannon.y + 20);
    ctx.rotate((-angle * Math.PI) / 180);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, -5, 40, 10);
    ctx.restore();

    // Update Bullet
    if (s.bullet) {
      s.bullet.vy += s.gravity; // Gravity
      s.bullet.vx -= s.wind;   // Wind
      s.bullet.x += s.bullet.vx;
      s.bullet.y += s.bullet.vy;

      // Draw Bullet
      ctx.beginPath();
      ctx.arc(s.bullet.x, s.bullet.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.fill();

      // Check collision with Target
      if (
        s.bullet.x > s.target.x && 
        s.bullet.x < s.target.x + s.target.w &&
        s.bullet.y > s.target.y &&
        s.bullet.y < s.target.y + s.target.h
      ) {
        // Hit!
        s.bullet = null;
        setIsFiring(false);
        setScore(sc => sc + 1);
        confetti({ origin: { x: (s.target.x+20)/800, y: (s.target.y+20)/400 } });
      } 
      // Check Floor or Out of Bounds
      else if (s.bullet.y > 390 || s.bullet.x > 800 || s.bullet.x < 0) {
        // Miss!
        s.bullet = null;
        setIsFiring(false);
      }
    }

    animationRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  }, [angle]);

  const fire = () => {
    if (isFiring) return;
    setIsFiring(true);
    
    // Tính toán vận tốc (Vx, Vy) từ Góc và Lực
    const radians = (angle * Math.PI) / 180;
    const v = power * 0.4; // Hệ số scale lực

    stateRef.current.bullet = {
      x: stateRef.current.cannon.x + 20 + Math.cos(radians) * 40,
      y: stateRef.current.cannon.y + 20 - Math.sin(radians) * 40,
      vx: Math.cos(radians) * v,
      vy: -Math.sin(radians) * v
    };
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col bg-gray-900 text-white rounded-2xl overflow-hidden shadow-2xl relative font-sans">
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b-2 border-gray-700">
        <button onClick={() => navigate('/games')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-red-500" />
          <h1 className="text-xl font-black uppercase">Pháo Binh Tọa Độ</h1>
        </div>
        <div className="font-mono text-xl font-bold text-yellow-400">ĐIỂM: {score}</div>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 bg-gradient-to-b from-sky-900 to-sky-600">
        {/* Game Canvas */}
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={400} 
          className="bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-sky-950 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 border-gray-800 max-w-full"
        />

        {/* Bảng điều khiển */}
        <div className="bg-gray-800 p-6 rounded-2xl mt-8 w-full max-w-3xl flex gap-8 items-end shadow-xl border-2 border-gray-700">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">📐 Góc Bắn: {angle}°</label>
            <input 
              type="range" min="0" max="90" value={angle} onChange={e => setAngle(e.target.value)}
              className="w-full accent-blue-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">💥 Lực Bắn: {power}%</label>
            <input 
              type="range" min="10" max="100" value={power} onChange={e => setPower(e.target.value)}
              className="w-full accent-red-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <button 
            onClick={fire}
            disabled={isFiring}
            className="h-16 px-10 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-black text-2xl uppercase rounded-xl border-b-4 border-red-900 active:border-b-0 active:translate-y-1 shadow-lg disabled:opacity-50 transition-all"
          >
            BẮN!
          </button>
        </div>
      </div>
    </div>
  );
};
