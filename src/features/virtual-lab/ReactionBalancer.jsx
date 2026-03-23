import React, { useState, useCallback, useEffect, useRef } from 'react';
import { balanceEquation, parseFormula, formatFormula } from '../../lib/balanceEquation';
import { getSmiles } from '../../lib/formulaToSmiles';
import { MOL_DATA_3D } from '../../lib/molData3D';
import { fetchMol3D } from '../../lib/pubchemService';
import MolView3D from '../../components/MolView3D';

const EXAMPLES = [
  'Fe + HCl = FeCl3 + H2',
  'Al + H2SO4 = Al2(SO4)3 + H2',
  'Na + H2O = NaOH + H2',
  'Fe2O3 + HCl = FeCl3 + H2O',
  'Ca(OH)2 + CO2 = CaCO3 + H2O',
  'KMnO4 + HCl = KCl + MnCl2 + Cl2 + H2O',
  'CaCO3 + HCl = CaCl2 + H2O + CO2',
  'NaOH + CuSO4 = Cu(OH)2 + Na2SO4',
  'Al + Fe2O3 = Al2O3 + Fe',
  'P + O2 = P2O5',
];

const ReactionBalancer = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [show3D, setShow3D] = useState(false);
  const [mol3DData, setMol3DData] = useState({});
  const [loading3D, setLoading3D] = useState(false);
  const [showKetcher, setShowKetcher] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  const handleBalance = useCallback(() => {
    if (!input.trim()) { setError('Vui lòng nhập phương trình hóa học'); return; }
    setError(null);
    setMol3DData({});

    const res = balanceEquation(input.trim());
    if (res.error) {
      setError(res.error);
      setResult(null);
    } else {
      setResult(res);
      setHistory(prev => {
        const newHistory = [{ input: input.trim(), balanced: res.balanced }, ...prev.filter(h => h.input !== input.trim())];
        return newHistory.slice(0, 10);
      });
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBalance();
  };

  const handleExample = (ex) => {
    setInput(ex);
    setError(null);
    const res = balanceEquation(ex);
    if (!res.error) setResult(res);
    else { setResult(null); setError(res.error); }
  };

  // Load 3D data for all compounds in result
  const load3DModels = useCallback(async () => {
    if (!result) return;
    setLoading3D(true);
    const allFormulas = [...result.reactants, ...result.products];
    const data = {};

    for (const formula of allFormulas) {
      // 1. Check if already loaded
      if (mol3DData[formula]) { data[formula] = mol3DData[formula]; continue; }

      // 2. Check local MOL_DATA_3D first (instant!)
      if (MOL_DATA_3D[formula]) {
        data[formula] = MOL_DATA_3D[formula];
        continue;
      }

      // 3. Fallback: try PubChem API
      try {
        const mol = await fetchMol3D(formula);
        if (mol) data[formula] = mol;
      } catch (err) {
        console.warn(`3D not found for ${formula}`);
      }
    }
    setMol3DData(data);
    setLoading3D(false);
    setShow3D(true);
  }, [result, mol3DData]);

  // Element breakdown table
  const renderElementTable = () => {
    if (!result) return null;
    const { reactants, products, reactantCoeffs, productCoeffs } = result;

    const elements = result.elements;
    const rows = elements.map(el => {
      let left = 0, right = 0;
      reactants.forEach((f, i) => {
        const parsed = parseFormula(f);
        left += (parsed[el] || 0) * reactantCoeffs[i];
      });
      products.forEach((f, i) => {
        const parsed = parseFormula(f);
        right += (parsed[el] || 0) * productCoeffs[i];
      });
      return { el, left, right, balanced: left === right };
    });

    return (
      <div className="mt-3 border-2 border-os-border rounded-lg overflow-hidden">
        <div className="bg-os-titlebar px-3 py-1.5">
          <h4 className="text-[10px] font-black text-os-text uppercase tracking-wider">🔢 Kiểm tra cân bằng nguyên tố</h4>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-os-bg-light border-b border-os-border">
              <th className="px-3 py-2 text-left font-bold text-os-text-muted">Nguyên tố</th>
              <th className="px-3 py-2 text-center font-bold text-os-text-muted">Vế trái</th>
              <th className="px-3 py-2 text-center font-bold text-os-text-muted">Vế phải</th>
              <th className="px-3 py-2 text-center font-bold text-os-text-muted">Cân bằng?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.el} className="border-b border-os-border/30">
                <td className="px-3 py-1.5 font-bold text-os-text">{r.el}</td>
                <td className="px-3 py-1.5 text-center font-mono">{r.left}</td>
                <td className="px-3 py-1.5 text-center font-mono">{r.right}</td>
                <td className="px-3 py-1.5 text-center">{r.balanced ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* INPUT */}
      <div className="border-2 border-os-border rounded-lg overflow-hidden">
        <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-2">
          <h3 className="text-xs font-black text-os-text uppercase tracking-wider">⚖️ Cân bằng phương trình hóa học</h3>
        </div>
        <div className="p-3 space-y-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="VD: Fe + HCl = FeCl3 + H2"
              className="flex-1 retro-input text-sm font-mono"
              autoComplete="off" spellCheck={false}
            />
            <button onClick={handleBalance} className="retro-btn retro-btn-primary text-sm px-4 shrink-0">
              ⚡ Cân bằng
            </button>
          </div>

          <div className="text-[10px] text-os-text-muted">
            💡 Dùng dấu <code className="bg-os-bg px-1 rounded">=</code> hoặc <code className="bg-os-bg px-1 rounded">→</code> để tách vế.
            Ngoặc đơn OK: <code className="bg-os-bg px-1 rounded">Ca(OH)2</code>
          </div>

          {/* Examples */}
          <div>
            <p className="text-[10px] font-bold text-os-text-muted mb-1.5">📝 Thử nhanh:</p>
            <div className="flex flex-wrap gap-1">
              {EXAMPLES.slice(0, 6).map((ex, i) => (
                <button key={i} onClick={() => handleExample(ex)}
                  className="text-[10px] px-2 py-1 bg-os-bg border border-os-border rounded-lg hover:bg-os-accent/10 hover:border-os-accent transition-colors font-mono text-os-text truncate max-w-[180px]">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="border-2 border-red-300 bg-red-50 rounded-lg p-3 flex items-start gap-2">
          <span className="text-sm">❌</span>
          <div>
            <p className="text-xs font-bold text-red-700">Lỗi cân bằng</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className="border-2 border-green-300 bg-green-50 rounded-lg overflow-hidden">
          <div className="bg-green-100 border-b border-green-200 px-3 py-2">
            <h3 className="text-xs font-black text-green-800 uppercase tracking-wider">✅ Phương trình đã cân bằng</h3>
          </div>
          <div className="p-4">
            {/* Balanced equation - big display */}
            <div className="bg-white border-2 border-green-200 rounded-xl p-4 text-center mb-3">
              <p className="text-lg md:text-xl font-black text-green-900 font-mono tracking-wide">
                {result.balanced}
              </p>
            </div>

            {/* Coefficients detail */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white/60 rounded-lg p-2.5 border border-green-200">
                <p className="text-[10px] font-bold text-green-700 mb-1 uppercase">Chất phản ứng</p>
                {result.reactants.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="font-black text-green-600 w-5 text-right">{result.reactantCoeffs[i]}</span>
                    <span className="font-mono text-os-text">{formatFormula(f)}</span>
                    {getSmiles(f) && <span className="text-[8px] text-green-500">🟢</span>}
                  </div>
                ))}
              </div>
              <div className="bg-white/60 rounded-lg p-2.5 border border-green-200">
                <p className="text-[10px] font-bold text-green-700 mb-1 uppercase">Sản phẩm</p>
                {result.products.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="font-black text-green-600 w-5 text-right">{result.productCoeffs[i]}</span>
                    <span className="font-mono text-os-text">{formatFormula(f)}</span>
                    {getSmiles(f) && <span className="text-[8px] text-green-500">🟢</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Element verification table */}
            {renderElementTable()}

            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              <button onClick={load3DModels} disabled={loading3D}
                className="retro-btn retro-btn-primary text-xs flex-1 py-2 flex items-center justify-center gap-1.5">
                🧊 {loading3D ? 'Đang tải 3D...' : show3D ? 'Tải lại 3D' : 'Xem phân tử 3D'}
              </button>
              <button onClick={() => setShowKetcher(!showKetcher)}
                className="retro-btn text-xs flex-1 py-2 flex items-center justify-center gap-1.5">
                ✏️ {showKetcher ? 'Ẩn Ketcher' : 'Mở Ketcher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D VIEWER */}
      {show3D && result && (
        <div className="border-2 border-os-border rounded-lg overflow-hidden">
          <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-2 flex items-center justify-between">
            <h3 className="text-xs font-black text-os-text uppercase tracking-wider">🧊 Mô hình 3D</h3>
            <button onClick={() => setShow3D(false)} className="text-os-text-muted text-xs hover:text-os-text">✕</button>
          </div>
          <div className="p-3 bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...result.reactants, ...result.products].map((formula, idx) => (
                <div key={idx} className="text-center">
                  {mol3DData[formula] ? (
                    <MolView3D
                      molData={mol3DData[formula]}
                      label={formatFormula(formula)}
                      size={150}
                    />
                  ) : (
                    <div className="w-[160px] h-[140px] mx-auto rounded-lg bg-gray-700/50 border border-gray-600 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Không có 3D</span>
                    </div>
                  )}
                  <p className="text-xs font-bold text-white/80 mt-1 font-mono">{formatFormula(formula)}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-white/30 mt-2">Kéo chuột để xoay · Cuộn để zoom</p>
          </div>
        </div>
      )}

      {/* KETCHER EDITOR */}
      {showKetcher && (
        <div className="border-2 border-os-border rounded-lg overflow-hidden">
          <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-2 flex items-center justify-between">
            <h3 className="text-xs font-black text-os-text uppercase tracking-wider">✏️ Bảng vẽ phân tử (Ketcher)</h3>
            <button onClick={() => setShowKetcher(false)} className="text-os-text-muted text-xs hover:text-os-text">✕</button>
          </div>
          <div className="bg-white" style={{ height: 400 }}>
            <KetcherMini />
          </div>
        </div>
      )}

      {/* HISTORY */}
      {history.length > 0 && (
        <div className="border-2 border-os-border rounded-lg overflow-hidden">
          <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-1.5 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-os-text uppercase tracking-wider">📜 Lịch sử</h3>
            <button onClick={() => setHistory([])} className="text-[10px] text-os-text-muted hover:text-os-text">Xóa</button>
          </div>
          <div className="p-2 max-h-[120px] overflow-y-auto">
            {history.map((h, i) => (
              <button key={i} onClick={() => handleExample(h.input)}
                className="w-full text-left text-[11px] font-mono px-2 py-1 hover:bg-os-bg rounded transition-colors text-os-text truncate">
                {h.balanced}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Lazy Ketcher component
const KetcherMini = () => {
  const [modules, setModules] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [standaloneModule, reactModule] = await Promise.all([
          import(/* @vite-ignore */ 'ketcher-standalone'),
          import(/* @vite-ignore */ 'ketcher-react'),
        ]);
        if (!cancelled) setModules({ standaloneModule, reactModule });
      } catch (err) {
        console.warn('Ketcher load error:', err);
        if (!cancelled) setError('Không thể tải Ketcher. Kiểm tra packages.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) return <div className="p-4 text-center text-xs text-red-500">{error}</div>;
  if (!modules) return <div className="p-4 text-center"><span className="text-sm text-os-text-muted animate-pulse">⏳ Đang tải Ketcher...</span></div>;

  const { StandaloneStructServiceProvider } = modules.standaloneModule;
  const structServiceProvider = new StandaloneStructServiceProvider();
  const EditorComponent = modules.reactModule.Editor;

  return (
    <EditorComponent
      structServiceProvider={structServiceProvider}
      onInit={(ketcher) => { window.ketcher = ketcher; }}
      errorHandler={(msg) => console.warn('Ketcher:', msg)}
    />
  );
};

export default ReactionBalancer;
