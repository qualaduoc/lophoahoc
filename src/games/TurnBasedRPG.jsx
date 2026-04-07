import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sword, Shield, Heart, Zap, Skull } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MAX_HP = 100;
const MONSTER_MAX_HP = 150;

export const TurnBasedRPG = () => {
  const navigate = useNavigate();
  const [playerHp, setPlayerHp] = useState(MAX_HP);
  const [monsterHp, setMonsterHp] = useState(MONSTER_MAX_HP);
  const [message, setMessage] = useState('Một con Rồng xuất hiện! Trận chiến bắt đầu.');
  const [turn, setTurn] = useState('player'); // 'player' | 'monster' | 'gameover'
  const [playerAnim, setPlayerAnim] = useState('');
  const [monsterAnim, setMonsterAnim] = useState('');

  const randomDmg = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const playerAction = (type) => {
    if (turn !== 'player') return;

    let dmg = 0;
    let heal = 0;
    let msg = '';

    setPlayerAnim('translate-x-4'); // Anim tiến lên
    setTimeout(() => setPlayerAnim(''), 300);

    if (type === 'attack') {
      dmg = randomDmg(10, 20);
      msg = `Bạn vung kiếm chém! Gây ${dmg} sát thương.`;
      setMonsterAnim('opacity-50 blur-sm'); // Anim quái bị đánh
    } else if (type === 'magic') {
      dmg = randomDmg(20, 35);
      msg = `Bạn tung quả cầu lửa ☄️! Gây ${dmg} sát thương lên Rồng.`;
      setMonsterAnim('opacity-20 sepia blur-sm');
    } else if (type === 'heal') {
      heal = randomDmg(25, 40);
      msg = `Bạn uống bình máu 🧪! Hồi phục ${heal} HP.`;
      setPlayerHp(h => Math.min(MAX_HP, h + heal));
    } else if (type === 'defend') {
      msg = `Bạn nâng khiên đỡ đòn 🛡️! Sức phòng thủ tăng mạnh.`;
      // Handle logic buff later if needed, simply skip turn and take less dmg
    }

    setTimeout(() => setMonsterAnim(''), 300);

    if (dmg > 0) {
      setMonsterHp(h => {
        const newHp = h - dmg;
        if (newHp <= 0) {
          setMessage(msg + ' RỒNG ĐÃ BỊ TIÊU DIỆT! BẠN CHIẾN THẮNG!');
          setTurn('gameover');
          return 0;
        }
        return newHp;
      });
    }

    setMessage(msg);
    
    if (monsterHp - dmg > 0) {
      setTurn('monster');
    }
  };

  useEffect(() => {
    if (turn === 'monster') {
      setTimeout(() => {
        setMonsterAnim('-translate-x-4 scale-110');
        setTimeout(() => setMonsterAnim(''), 300);

        const isBite = Math.random() > 0.5;
        const dmg = isBite ? randomDmg(10, 20) : randomDmg(20, 30);
        const msg = isBite ? `Rồng cắn bạn gây ${dmg} sát thương!` : `Rồng phun lửa 🔥 gây ${dmg} sát thương!`;
        
        setPlayerAnim('opacity-50 blur-sm');
        setTimeout(() => setPlayerAnim(''), 300);
        
        setPlayerHp(h => {
          const newHp = h - dmg;
          if (newHp <= 0) {
            setMessage(msg + ' BẠN ĐÃ TỬ TRẬN...');
            setTurn('gameover');
            return 0;
          }
          return newHp;
        });

        if (playerHp - dmg > 0) {
          setMessage(msg);
          setTurn('player');
        }
      }, 1500); // Rồng nghỉ 1.5s rồi đánh
    }
  }, [turn]);

  const resetGame = () => {
    setPlayerHp(MAX_HP);
    setMonsterHp(MONSTER_MAX_HP);
    setMessage('Trận chiến mới! Rồng đã tái sinh.');
    setTurn('player');
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col bg-stone-900 text-white rounded-2xl overflow-hidden shadow-2xl relative font-sans">
      {/* Header */}
      <div className="bg-stone-950 p-4 flex items-center border-b-2 border-stone-800">
        <button onClick={() => navigate('/games')} className="p-2 hover:bg-white/10 rounded-xl transition-colors mr-4">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Sword className="w-5 h-5 text-orange-500 mr-2" />
        <h1 className="text-xl font-black uppercase text-orange-400">Đối Kháng Turn-based</h1>
      </div>

      {/* Sân Khấu (Chiến trường) */}
      <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-stone-800 flex flex-col p-6 border-b-4 border-stone-950">
        <div className="w-full max-w-4xl mx-auto flex justify-between items-end h-[40vh]">
          
          {/* Player */}
          <div className={`transition-all duration-300 transform ${playerAnim} flex flex-col items-center`}>
            <div className="bg-stone-950/50 px-4 py-2 rounded-lg font-bold mb-4 border border-stone-700 w-48 font-mono">
              <div className="flex justify-between text-xs mb-1"><span>ANH HÙNG</span><span>{playerHp}/{MAX_HP}</span></div>
              <div className="w-full bg-stone-800 h-2 rounded"><div className="bg-green-500 h-2 rounded transition-all" style={{ width: `${(playerHp/MAX_HP)*100}%`}}></div></div>
            </div>
            <div className="w-32 h-32 bg-stone-700 rounded-full border-4 border-stone-600 flex items-center justify-center shadow-lg shadow-green-900/50">
              <span className="text-6xl">🧑‍🚀</span>
            </div>
          </div>

          {/* Monster */}
          <div className={`transition-all duration-300 transform ${monsterAnim} flex flex-col items-center`}>
            <div className="bg-stone-950/50 px-4 py-2 rounded-lg font-bold mb-4 border border-stone-700 w-48 font-mono">
              <div className="flex justify-between text-xs mb-1"><span className="text-red-400">RỒNG LỬA</span><span>{monsterHp}/{MONSTER_MAX_HP}</span></div>
              <div className="w-full bg-stone-800 h-2 rounded"><div className="bg-red-500 h-2 rounded transition-all" style={{ width: `${(monsterHp/MONSTER_MAX_HP)*100}%`}}></div></div>
            </div>
            <div className="w-48 h-48 bg-stone-950 rounded-lg border-4 border-red-900 flex items-center justify-center shadow-2xl shadow-red-900 animate-pulse">
              <span className="text-8xl filter drop-shadow-[0_0_10px_red]">🐉</span>
            </div>
          </div>

        </div>
      </div>

      {/* Lịch sử chiến đấu */}
      <div className="h-16 flex items-center justify-center bg-stone-900 border-b-2 border-stone-800 px-6">
        <p className="text-lg font-bold text-orange-300 animate-pulse">{message}</p>
      </div>

      {/* Bảng Điểu Khiển Skills */}
      <div className="bg-stone-950 p-6 flex flex-wrap justify-center gap-4 h-48">
        {turn === 'gameover' ? (
           <button onClick={resetGame} className="px-12 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-2xl rounded-2xl transition-all shadow-lg border-b-4 border-orange-900 active:border-b-0 active:translate-y-1 my-auto">
             CHƠI LẠI
           </button>
        ) : (
          <>
            <button disabled={turn !== 'player'} onClick={() => playerAction('attack')} className="w-40 flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-200 border-2 border-gray-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed group transition-all">
              <Sword className="w-8 h-8 mb-2 group-hover:scale-125 transition-transform text-white/50" />
              <span className="font-bold uppercase tracking-wider">Chém Thường</span>
            </button>
            <button disabled={turn !== 'player'} onClick={() => playerAction('magic')} className="w-40 flex flex-col items-center justify-center bg-indigo-900 hover:bg-indigo-800 text-indigo-200 border-2 border-indigo-700 rounded-xl disabled:opacity-50 group transition-all">
              <Zap className="w-8 h-8 mb-2 group-hover:scale-125 transition-transform text-indigo-400" />
              <span className="font-bold uppercase tracking-wider">Cầu Lửa</span>
            </button>
            <button disabled={turn !== 'player'} onClick={() => playerAction('heal')} className="w-40 flex flex-col items-center justify-center bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border-2 border-emerald-700 rounded-xl disabled:opacity-50 group transition-all">
              <Heart className="w-8 h-8 mb-2 group-hover:scale-125 transition-transform text-emerald-400" />
              <span className="font-bold uppercase tracking-wider">Hồi Máu</span>
            </button>
            <button disabled={turn !== 'player'} onClick={() => playerAction('defend')} className="w-40 flex flex-col items-center justify-center bg-stone-800 hover:bg-stone-700 text-stone-200 border-2 border-stone-600 rounded-xl disabled:opacity-50 group transition-all">
              <Shield className="w-8 h-8 mb-2 group-hover:scale-125 transition-transform text-stone-400" />
              <span className="font-bold uppercase tracking-wider">Phòng Thủ</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
