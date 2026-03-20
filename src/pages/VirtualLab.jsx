import React, { useState } from 'react';
import { REACTIONS_DATA } from '../lib/chemData';
import { FlaskConical, ArrowRight, Sparkles, Beaker } from 'lucide-react';

export const VirtualLab = () => {
  const [selectedA, setSelectedA] = useState(0);
  const [selectedB, setSelectedB] = useState(0);
  const [result, setResult] = useState(null);
  const [showPhet, setShowPhet] = useState(true);

  // Get unique reactant A & B lists
  const reactantAList = [...new Map(REACTIONS_DATA.map(r => [r.reactantA, r])).values()];
  const reactantBList = [...new Map(REACTIONS_DATA.map(r => [r.reactantB, r])).values()];

  const handleReact = () => {
    const aKey = reactantAList[selectedA]?.reactantA;
    const bKey = reactantBList[selectedB]?.reactantB;
    
    const found = REACTIONS_DATA.find(
      r => (r.reactantA === aKey && r.reactantB === bKey) ||
           (r.reactantA === bKey && r.reactantB === aKey)
    );

    if (found) {
      setResult(found);
    } else {
      setResult({
        equation: 'Không có phản ứng xảy ra',
        phenomenon: `Hai chất ${aKey} và ${bKey} không phản ứng với nhau trong điều kiện thường. Thử chọn cặp chất khác!`,
        conditions: '—',
      });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 rounded-xl">
          <FlaskConical className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Phòng Thí Nghiệm Ảo</h1>
          <p className="text-sm text-gray-500">Mô phỏng các phản ứng hóa học phổ biến</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* PhET Simulation - large */}
        <div className="xl:col-span-3 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Beaker className="w-5 h-5 text-emerald-600" />
              Mô phỏng PhET (Đại học Colorado)
            </h2>
            <button
              onClick={() => setShowPhet(!showPhet)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
            >
              {showPhet ? 'Ẩn mô phỏng' : 'Hiện mô phỏng'}
            </button>
          </div>
          {showPhet && (
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white" style={{ aspectRatio: '16/10', minHeight: '400px' }}>
              <iframe
                src="https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_all.html"
                width="100%"
                height="100%"
                allowFullScreen
                title="PhET Simulation"
                className="border-none w-full h-full"
                style={{ minHeight: '400px' }}
              />
            </div>
          )}
        </div>

        {/* Reaction Mixer */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Pha Chế Thuốc Thử
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Chất phản ứng A</label>
                <select
                  value={selectedA}
                  onChange={e => { setSelectedA(Number(e.target.value)); setResult(null); }}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                >
                  {reactantAList.map((r, i) => (
                    <option key={r.reactantA} value={i}>{r.reactantAName}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Chất phản ứng B</label>
                <select
                  value={selectedB}
                  onChange={e => { setSelectedB(Number(e.target.value)); setResult(null); }}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                >
                  {reactantBList.map((r, i) => (
                    <option key={r.reactantB} value={i}>{r.reactantBName}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleReact}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-2"
              >
                ⚗️ Tiến Hành Phản Ứng
              </button>
            </div>
          </div>

          {/* Reaction Result */}
          {result && (
            <div className="glass rounded-2xl p-6 border-l-4 border-emerald-500">
              <h3 className="font-bold text-emerald-700 mb-4 text-lg flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                Kết quả phản ứng
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border">
                  <p className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Phương trình</p>
                  <p className="font-bold text-lg text-gray-900">{result.equation}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-xs uppercase font-bold text-amber-600 tracking-wider mb-1">Hiện tượng quan sát</p>
                  <p className="text-sm text-amber-900 leading-relaxed">{result.phenomenon}</p>
                </div>
                {result.conditions && result.conditions !== '—' && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-xs uppercase font-bold text-blue-600 tracking-wider mb-1">Điều kiện</p>
                    <p className="text-sm text-blue-900">{result.conditions}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
