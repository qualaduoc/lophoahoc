import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FlappyGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Constants
  const GRAVITY = 0.6;
  const JUMP = -10;
  const PIPE_SPEED = 4;
  const PIPE_WIDTH = 60;
  const PIPE_GAP = 160;

  const stateRef = useRef({
    bird: { x: 100, y: 200, velocity: 0, radius: 15 },
    pipes: [],
    frame: 0,
    score: 0
  });

  const jump = () => {
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      stateRef.current = {
        bird: { x: 100, y: 200, velocity: JUMP, radius: 15 },
        pipes: [],
        frame: 0,
        score: 0
      };
      setScore(0);
    } else if (!gameOver) {
      stateRef.current.bird.velocity = JUMP;
    } else {
      // Nhảy để chơi lại
      setGameStarted(false);
      setGameOver(false);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    // Background
    ctx.fillStyle = '#71c5cf'; // Flappy Bird blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 10);

    if (gameStarted && !gameOver) {
      s.bird.velocity += GRAVITY;
      s.bird.y += s.bird.velocity;

      // Spawn pipes
      if (s.frame % 90 === 0) {
        const minPipeHeight = 50;
        const maxPipeHeight = canvas.height - 50 - PIPE_GAP - minPipeHeight;
        const topPipeHeight = Math.floor(Math.random() * maxPipeHeight) + minPipeHeight;
        s.pipes.push({
          x: canvas.width,
          top: topPipeHeight,
          bottom: topPipeHeight + PIPE_GAP,
          passed: false
        });
      }
      s.frame++;

      // Move pipes and check collision
      for (let i = 0; i < s.pipes.length; i++) {
        let p = s.pipes[i];
        p.x -= PIPE_SPEED;

        // Draw Pipes
        ctx.fillStyle = '#74BF2E'; // Xanh lá
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top); // Top pipe
        ctx.fillRect(p.x, p.bottom, PIPE_WIDTH, canvas.height - 50 - p.bottom); // Bottom pipe
        // Pipe borders
        ctx.strokeStyle = '#543847';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.top);
        ctx.strokeRect(p.x, p.bottom, PIPE_WIDTH, canvas.height - 50 - p.bottom);

        // Check Collision
        // 1. Box Box collision
        const birdLeft = s.bird.x - s.bird.radius;
        const birdRight = s.bird.x + s.bird.radius;
        const birdTop = s.bird.y - s.bird.radius;
        const birdBottom = s.bird.y + s.bird.radius;

        if (
          birdRight > p.x && birdLeft < p.x + PIPE_WIDTH && 
          (birdTop < p.top || birdBottom > p.bottom)
        ) {
          setGameOver(true);
        }

        // Check Score
        if (p.x === s.bird.x) {
          s.score++;
          setScore(s.score);
        }
      }

      // Ground / Ceiling collision
      if (s.bird.y >= canvas.height - 50 - s.bird.radius || s.bird.y <= s.bird.radius) {
        setGameOver(true);
      }

      // Remove offscreen pipes
      if (s.pipes.length > 0 && s.pipes[0].x < -PIPE_WIDTH) {
        s.pipes.shift();
      }
    } else if (gameOver) {
      // Draw static pipes
      s.pipes.forEach(p => {
        ctx.fillStyle = '#74BF2E';
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
        ctx.fillRect(p.x, p.bottom, PIPE_WIDTH, canvas.height - 50 - p.bottom);
      });
      // Fall to ground if dead
      if (s.bird.y < canvas.height - 50 - s.bird.radius) {
         s.bird.velocity += GRAVITY;
         s.bird.y += s.bird.velocity;
      }
    }

    // Draw Bird
    ctx.beginPath();
    ctx.arc(s.bird.x, s.bird.y, s.bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15'; // yellow
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mắt chim
    ctx.beginPath();
    ctx.arc(s.bird.x + 5, s.bird.y - 5, 4, 0, Math.PI*2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.arc(s.bird.x + 6, s.bird.y - 5, 2, 0, Math.PI*2);
    ctx.fill();

    // Mỏ chim
    ctx.fillStyle = 'orange';
    ctx.fillRect(s.bird.x + 5, s.bird.y, 10, 5);

    if (!gameStarted) {
      ctx.fillStyle = 'black';
      ctx.font = '24px monospace';
      ctx.fillText('CLICK HOẶC NHẤN SPACE ĐỂ BAY', canvas.width/2 - 180, canvas.height/2);
    } else if (gameOver) {
      ctx.fillStyle = 'black';
      ctx.font = '40px monospace';
      ctx.fillText('GAME OVER!', canvas.width/2 - 120, canvas.height/2 - 40);
      ctx.font = '20px monospace';
      ctx.fillText(`Điểm của bạn: ${s.score}`, canvas.width/2 - 80, canvas.height/2 + 10);
      ctx.fillText('Click để chơi lại', canvas.width/2 - 100, canvas.height/2 + 50);
    }

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameStarted, gameOver]);

  // Handle Spacebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col bg-gray-900 text-white rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <button onClick={() => navigate('/games')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black uppercase text-yellow-400">FLAPPY BIRD</h1>
        <div className="font-mono text-xl font-bold bg-black/50 px-4 py-1 rounded">Điểm: {score}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-900" onClick={jump}>
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={600} 
          className="bg-white rounded-xl shadow-[0_0_50px_rgba(250,204,21,0.2)] border-8 border-gray-800 cursor-pointer max-w-full"
        />
        <p className="mt-6 text-gray-500 font-bold tracking-widest uppercase">Click chuột hoặc ấn phím Space để điều khiển</p>
      </div>
    </div>
  );
};
