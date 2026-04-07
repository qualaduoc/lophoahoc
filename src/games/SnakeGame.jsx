import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GRID_SIZE = 20;
const TILE_COUNT = 20; // 20x20 grid, each tile is 20x20px -> 400x400 canvas

export const SnakeGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const state = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 5, y: 5 },
    dx: 0,
    dy: 0,
    changingDirection: false
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      if (isPaused && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        setIsPaused(false);
      }

      const { dx, dy, changingDirection } = state.current;
      if (changingDirection) return;

      if (e.code === 'ArrowUp' && dy !== 1) {
        state.current.dx = 0; state.current.dy = -1; state.current.changingDirection = true;
        e.preventDefault();
      }
      else if (e.code === 'ArrowDown' && dy !== -1) {
        state.current.dx = 0; state.current.dy = 1; state.current.changingDirection = true;
        e.preventDefault();
      }
      else if (e.code === 'ArrowLeft' && dx !== 1) {
        state.current.dx = -1; state.current.dy = 0; state.current.changingDirection = true;
        e.preventDefault();
      }
      else if (e.code === 'ArrowRight' && dx !== -1) {
        state.current.dx = 1; state.current.dy = 0; state.current.changingDirection = true;
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  useEffect(() => {
    let timeout;
    
    const gameLoop = () => {
      if (gameOver || isPaused) return;

      const s = state.current;
      s.changingDirection = false;
      
      // Di chuyển nếu đang có hướng
      if (s.dx !== 0 || s.dy !== 0) {
        const head = { x: s.snake[0].x + s.dx, y: s.snake[0].y + s.dy };
        
        // Cắn trúng tường
        if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
          setGameOver(true);
          return;
        }

        // Cắn trúng người
        for (let i = 0; i < s.snake.length; i++) {
          if (head.x === s.snake[i].x && head.y === s.snake[i].y) {
            setGameOver(true);
            return;
          }
        }

        s.snake.unshift(head);

        // Ăn mồi
        if (head.x === s.food.x && head.y === s.food.y) {
          setScore(sc => sc + 10);
          // Sinh mồi mới
          s.food = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
          };
        } else {
          s.snake.pop(); // Không ăn mồi thì rụng đuôi để giữ nguyên chiều dài
        }
      }

      drawGame();

      // Tốc độ càng ngày càng tăng
      const speed = Math.max(50, 150 - Math.floor(score / 50) * 10);
      timeout = setTimeout(gameLoop, speed);
    };

    gameLoop();

    return () => clearTimeout(timeout);
  }, [gameOver, isPaused, score]);

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = state.current;

    // Background
    ctx.fillStyle = '#0f172a'; // Slate 900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    s.snake.forEach((part, index) => {
      ctx.fillStyle = index === 0 ? '#84cc16' : '#a3e635'; // Lime 500/400
      ctx.strokeStyle = '#0f172a';
      ctx.fillRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      ctx.strokeRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      
      // Neon glow for head
      if (index === 0) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#84cc16';
        ctx.fillRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        ctx.shadowBlur = 0;
      }
    });

    // Draw food
    ctx.fillStyle = '#f43f5e'; // Rose 500
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f43f5e';
    ctx.beginPath();
    ctx.arc((s.food.x * GRID_SIZE) + GRID_SIZE/2, (s.food.y * GRID_SIZE) + GRID_SIZE/2, GRID_SIZE/2.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  // Lần đầu draw
  useEffect(() => {
    drawGame();
  }, []);

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    state.current = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 5, y: 5 },
      dx: 0,
      dy: 0,
      changingDirection: false
    };
    drawGame();
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col bg-[#020617] text-white rounded-2xl overflow-hidden shadow-2xl relative font-sans">
      <div className="bg-[#0f172a] p-4 flex items-center justify-between border-b-2 border-[#1e293b]">
        <button onClick={() => navigate('/games')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black uppercase text-lime-400 drop-shadow-[0_0_10px_rgba(132,204,22,0.8)]">NEON SNAKE</h1>
        <div className="font-mono text-xl font-bold bg-lime-500/10 text-lime-400 border border-lime-500/30 px-6 py-1 rounded-xl">ĐIỂM: {score}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0f172a] via-[#020617] to-black">
        
        <div className="relative">
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={400} 
            className="rounded-xl shadow-[0_0_50px_rgba(132,204,22,0.15)] border-4 border-[#1e293b] max-w-full"
          />

          {gameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
              <h2 className="text-4xl font-black text-rose-500 mb-2 font-mono drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">CRASHED!</h2>
              <p className="text-gray-400 mb-6 font-mono text-lg">Điểm của bạn: <span className="text-white font-bold">{score}</span></p>
              <button 
                onClick={resetGame}
                className="px-8 py-3 bg-lime-500 hover:bg-lime-400 text-black font-black uppercase rounded-lg shadow-[0_0_20px_rgba(132,204,22,0.5)] transition-all transform hover:scale-105"
              >
                Chơi Lại
              </button>
            </div>
          )}

          {(!gameOver && state.current.dx === 0 && state.current.dy === 0) && (
             <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-xl pointer-events-none">
                <span className="text-2xl font-black text-lime-400 animate-pulse drop-shadow-[0_0_10px_rgba(132,204,22,0.8)]">Bấm Mũi Tên Hướng Di Chuyển!</span>
             </div>
          )}
        </div>
        
        <div className="mt-8 flex gap-4 text-gray-500 font-bold uppercase text-sm">
          <span>⬆️ Lên</span>
          <span>⬇️ Xuống</span>
          <span>⬅️ Trái</span>
          <span>➡️ Phải</span>
        </div>
      </div>
    </div>
  );
};
