import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const PUZZLES = [
  {
    target: 'H₂O',
    name: 'Nước',
    nodes: ['H', 'O', 'H'],
    correctBonds: ['1', '1'], // 1 liên kết đơn mỗi bên
    desc: 'O có hóa trị II, H có hóa trị I'
  },
  {
    target: 'CO₂',
    name: 'Carbon Dioxide',
    nodes: ['O', 'C', 'O'],
    correctBonds: ['2', '2'], // O=C=O (liên kết đôi)
    desc: 'C có hóa trị IV, O có hóa trị II'
  },
  {
    target: 'N₂',
    name: 'Nitrogen gas',
    nodes: ['N', 'N'],
    correctBonds: ['3'], // N≡N (liên kết ba)
    desc: 'N có hóa trị III'
  },
  {
    target: 'HCN',
    name: 'Hydrogen Cyanide',
    nodes: ['H', 'C', 'N'],
    correctBonds: ['1', '3'], // H-C≡N
    desc: 'H(I), C(IV), N(III)'
  }
];

export const BondPuzzle = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState(0);
  const [bonds, setBonds] = useState([]);
  const [solved, setSolved] = useState(false);

  // Initialize correct length array for bonds based on nodes
  React.useEffect(() => {
    if (PUZZLES[level]) {
      setBonds(new Array(PUZZLES[level].nodes.length - 1).fill('0'));
      setSolved(false);
    }
  }, [level]);

  const puzzle = PUZZLES[level];
  if (!puzzle) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center bg-[#0b0e14] text-white rounded-2xl p-8 text-center">
        <h1 className="text-4xl text-emerald-400 font-black mb-4">🏆 CHÚC MỪNG MỤC SƯ LIÊN KẾT!</h1>
        <p className="text-gray-400 mb-8">Bạn đã giải mã toàn bộ cấu trúc phân tử tuyệt mật.</p>
        <button onClick={() => navigate('/games')} className="px-6 py-3 bg-emerald-600 rounded-full font-bold hover:bg-emerald-500">
          Về sảnh chính
        </button>
      </div>
    );
  }

  const cycleBond = (index) => {
    if(solved) return;
    const newBonds = [...bonds];
    let val = parseInt(newBonds[index]);
    val = (val + 1) % 4; // 0, 1, 2, 3
    newBonds[index] = val.toString();
    setBonds(newBonds);
  };

  const getBondSymbol = (val) => {
    if(val === '1') return '-';
    if(val === '2') return '=';
    if(val === '3') return '≡';
    return '?';
  };

  const checkAnswer = () => {
    const isCorrect = puzzle.correctBonds.every((b, i) => b === bonds[i]);
    if (isCorrect) {
      setSolved(true);
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.8 }, colors: ['#10b981', '#34d399'] });
      setTimeout(() => {
        setLevel(l => l + 1);
      }, 2500);
    } else {
      // Sai: rung nhẹ (có thể add anim)
      alert("Liên kết chưa đúng rùi! Kiểm tra lại hóa trị nha.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col bg-[#0b0e14] text-white rounded-2xl overflow-hidden shadow-2xl relative font-sans">
      <div className="bg-[#121620] p-4 flex items-center justify-between border-b 4 border-[#1f2937]">
        <button onClick={() => navigate('/games')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-black tracking-wider uppercase">Kỹ Sư Liên Kết</h1>
        </div>
        <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 font-bold rounded-full border border-emerald-500/30">
          LEVEL {level + 1}/{PUZZLES.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#111827] to-[#030712] relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '30px 30px'}} />
        
        <div className="z-10 bg-gray-900 border border-gray-700 p-8 rounded-3xl shadow-2xl text-center max-w-xl w-full">
          <h2 className="text-3xl font-black text-gray-200 mb-2">{puzzle.name} ({puzzle.target})</h2>
          <p className="text-gray-500 mb-12 italic">"{puzzle.desc}"</p>

          <div className="flex items-center justify-center gap-2 mb-12">
            {puzzle.nodes.map((node, i) => (
              <React.Fragment key={i}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] border-4 border-gray-900">
                  {node}
                </div>
                {i < puzzle.nodes.length - 1 && (
                  <button 
                    onClick={() => cycleBond(i)}
                    className={`w-16 h-12 flex items-center justify-center text-4xl font-bold bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border-b-4 border-gray-950 active:translate-y-1 active:border-b-0 ${solved ? 'text-emerald-400' : 'text-gray-400'}`}
                  >
                    {getBondSymbol(bonds[i])}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          <button 
            onClick={checkAnswer}
            disabled={solved}
            className={`w-full py-4 text-xl font-black uppercase tracking-widest rounded-xl transition-all ${
              solved 
                ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1'
            }`}
          >
            {solved ? 'XUẤT SẮC! TIẾP TỤC...' : 'KIỂM TRA CẤU TRÚC'}
          </button>
        </div>
      </div>
    </div>
  );
};
