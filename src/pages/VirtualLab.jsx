import React, { useState, useEffect, useRef, useCallback } from 'react';
import { REACTIONS_DATA } from '../lib/chemData';
import { MOL_DATA, REACTION_PRODUCTS } from '../lib/molData';
import { loadChemDoodle } from '../lib/chemdoodleLoader';
import 'ketcher-react/dist/index.css';

/* ═══════════════════════════════════════════════════
   ANIMATION CSS
   ═══════════════════════════════════════════════════ */
const STYLE_ID = 'lab-cd-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes cdFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes cdPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
    @keyframes cdBubble { 0%{transform:translateY(0) scale(0.5);opacity:0} 15%{opacity:0.8} 85%{opacity:0.5} 100%{transform:translateY(-80px) scale(0.3);opacity:0} }
    @keyframes cdPrecip { 0%{transform:translateY(-15px);opacity:0} 30%{opacity:0.9} 100%{transform:translateY(50px);opacity:0.6} }
    @keyframes cdFlicker { 0%,100%{opacity:0.7;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.3)} }
    @keyframes cdArrowBounce { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
    @keyframes cdGlow { 0%,100%{box-shadow:0 0 6px rgba(74,123,124,0.15)} 50%{box-shadow:0 0 16px rgba(74,123,124,0.4)} }
    @keyframes cdShake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-1deg)} 75%{transform:rotate(1deg)} }
    .cd-fade-in { animation: cdFadeIn 0.5s ease-out forwards; }
    .cd-glow { animation: cdGlow 2s infinite; }
    .cd-arrow { animation: cdArrowBounce 1s infinite; }
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════
   CHEMDOODLE MOLECULE VIEWER (fixed)
   Uses ref container + imperative DOM for ChemDoodle
   ═══════════════════════════════════════════════════ */
const MolView = ({ molData, label, size = 140, highlight = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!molData || !containerRef.current) return;

    let cancelled = false;

    loadChemDoodle().then((ChemDoodle) => {
      if (cancelled || !containerRef.current) return;

      const container = containerRef.current;
      container.innerHTML = '';

      const uid = 'mol_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const canvas = document.createElement('canvas');
      canvas.id = uid;
      container.appendChild(canvas);

      try {
        const viewer = new ChemDoodle.ViewerCanvas(uid, size, size);
        viewer.styles.atoms_font_size_2D = 12;
        viewer.styles.atoms_font_families_2D = ['Helvetica', 'Arial', 'sans-serif'];
        viewer.styles.atoms_displayTerminalCarbonLabels_2D = true;
        viewer.styles.atoms_useJMOLColors = true;
        viewer.styles.bonds_width_2D = .6;
        viewer.styles.bonds_saturationWidthAbs_2D = 2.6;
        viewer.styles.bonds_hashSpacing_2D = 2.5;
        viewer.styles.backgroundColor = '#ffffff';

        const mol = ChemDoodle.readMOL(molData);
        mol.scaleToAverageBondLength(14.4);
        viewer.loadMolecule(mol);
      } catch (err) {
        console.error('ChemDoodle error for', label, ':', err);
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;font-size:16px;font-weight:bold;color:#5D4E37;background:#f9f9f9;border-radius:8px">${label || '?'}</div>`;
      }
    }).catch(err => {
      console.error('Failed to load ChemDoodle:', err);
    });

    return () => { cancelled = true; };
  }, [molData, size, label]);

  return (
    <div className={`flex flex-col items-center ${highlight ? 'cd-glow' : ''}`}>
      <div ref={containerRef}
        className={`rounded-xl border-2 ${highlight ? 'border-os-accent' : 'border-os-border'}`}
      />
      {label && (
        <p className={`text-xs font-black mt-1.5 text-center max-w-[140px] ${highlight ? 'text-os-accent' : 'text-os-text'}`}>
          {label}
        </p>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   EFFECT BADGES
   ═══════════════════════════════════════════════════ */
const EFFECT_LABELS = {
  bubbles: '🫧 Sủi bọt khí',
  precipitate: '⬇️ Kết tủa',
  fire: '🔥 Phát lửa',
  heat: '🌡️ Tỏa nhiệt',
  colorChange: '🎨 Đổi màu',
};

/* ═══════════════════════════════════════════════════
   EFFECT OVERLAY — animated particles
   ═══════════════════════════════════════════════════ */
const EffectOverlay = ({ effects = [], visual = {} }) => {
  if (effects.length === 0) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-10">
      {effects.includes('bubbles') && Array.from({ length: 10 }, (_, i) => (
        <div key={`b${i}`} className="absolute rounded-full"
          style={{
            width: 5 + Math.random() * 8, height: 5 + Math.random() * 8,
            left: `${20 + Math.random() * 60}%`, bottom: '10%',
            background: `radial-gradient(circle at 30% 30%, white, ${visual?.bubbleColor || 'rgba(180,210,220,0.6)'})`,
            border: '1px solid rgba(255,255,255,0.3)',
            animation: `cdBubble ${1.5 + Math.random() * 2}s ${Math.random() * 2}s infinite ease-out`,
          }} />
      ))}
      {effects.includes('precipitate') && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={`p${i}`} className="absolute rounded-sm"
              style={{
                width: 3 + Math.random() * 5, height: 3 + Math.random() * 5,
                left: `${20 + Math.random() * 60}%`, top: '15%',
                background: visual?.precipitateColor || '#1e88e5',
                animation: `cdPrecip ${2 + Math.random() * 2}s ${Math.random() * 3}s infinite ease-in`,
              }} />
          ))}
          <div className="absolute bottom-0 left-[10%] right-[10%] h-2 rounded-t"
            style={{ background: visual?.precipitateColor || '#1e88e5', opacity: 0.4 }} />
        </>
      )}
      {effects.includes('fire') && Array.from({ length: 6 }, (_, i) => (
        <div key={`f${i}`} className="absolute"
          style={{
            width: 8 + Math.random() * 10, height: 15 + Math.random() * 20,
            left: `${25 + Math.random() * 50}%`, bottom: '5%',
            background: `radial-gradient(ellipse at bottom, ${Math.random() > 0.5 ? '#FF6B35' : '#FFD700'}, transparent)`,
            borderRadius: '50% 50% 20% 20%', transformOrigin: 'bottom',
            animation: `cdFlicker ${0.3 + Math.random() * 0.3}s ${Math.random() * 0.3}s infinite`,
          }} />
      ))}
      {effects.includes('heat') && (
        <div className="absolute inset-0 bg-gradient-to-t from-orange-400/10 to-transparent animate-pulse" />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   REACTION DISPLAY — main lab visualization
   ═══════════════════════════════════════════════════ */
const ReactionDisplay = ({ reaction, phase }) => {
  const v = reaction?.visual;
  const isIdle = phase === 'idle';
  const isAnimating = phase === 'pouring' || phase === 'reacting';
  const isDone = phase === 'done';
  const effects = v?.effects || [];
  const reactionKey = `${reaction.reactantA}+${reaction.reactantB}`;
  const products = REACTION_PRODUCTS[reactionKey] || [];

  return (
    <div className="p-4 bg-gradient-to-b from-[#FDF6EC] to-[#F0E6D2] rounded-b-lg" style={{ minHeight: 340 }}>
      {/* Status bar */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border-2 ${
          isIdle ? 'bg-gray-50 border-gray-200 text-gray-400' :
          isAnimating ? 'bg-amber-50 border-amber-300 text-amber-700 animate-pulse' :
          'bg-green-50 border-green-300 text-green-700'
        }`}>
          {isIdle ? '⏸ Chọn & bấm phản ứng' : isAnimating ? '⚗️ Đang phản ứng...' : '✅ Hoàn thành!'}
        </span>
        {isDone && effects.length > 0 && (
          <div className="flex gap-1">
            {effects.map(e => (
              <span key={e} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-white/80 border-os-border text-os-text-muted">
                {e === 'bubbles' ? '🫧' : e === 'precipitate' ? '⬇️' : e === 'fire' ? '🔥' : e === 'heat' ? '🌡️' : '🎨'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* IDLE — reactants side by side */}
      {isIdle && (
        <div className="flex items-center justify-center gap-4 py-4">
          <MolView molData={MOL_DATA[reaction.reactantA]} label={reaction.reactantAName} size={140} />
          <div className="text-3xl text-os-text-muted font-black select-none">+</div>
          <MolView molData={MOL_DATA[reaction.reactantB]} label={reaction.reactantBName} size={140} />
        </div>
      )}

      {/* ANIMATING — reaction in progress */}
      {isAnimating && (
        <div className={`relative ${phase === 'reacting' ? 'animate-pulse' : ''}`}>
          <div className="flex items-center justify-center gap-3 py-3">
            <div className="relative">
              <MolView molData={MOL_DATA[reaction.reactantA]} label={reaction.reactantA} size={110} highlight />
              <EffectOverlay effects={effects} visual={v} />
            </div>
            <div className="flex flex-col items-center gap-1 mx-1">
              <span className="text-xl cd-arrow text-os-accent font-black">→</span>
              <span className="text-[9px] font-black text-os-accent uppercase animate-pulse">Phản ứng</span>
            </div>
            <div className="relative">
              <MolView molData={MOL_DATA[reaction.reactantB]} label={reaction.reactantB} size={110} highlight />
              <EffectOverlay effects={effects} visual={v} />
            </div>
          </div>
          {v?.gasLabel && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-2">
              {[0,1].map(i => (
                <span key={i} className="text-xs font-black px-2 py-0.5 rounded-full text-white shadow"
                  style={{ background: 'rgba(74,123,124,0.85)', animation: `cdBubble ${3+i}s ${i}s infinite` }}>
                  {v.gasLabel}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DONE — products + info */}
      {isDone && (
        <div className="cd-fade-in space-y-3">
          {/* Reaction equation visual */}
          <div className="flex items-center justify-center gap-2 flex-wrap py-1">
            <MolView molData={MOL_DATA[reaction.reactantA]} label={reaction.reactantA} size={80} />
            <span className="text-sm text-os-text-muted font-bold">+</span>
            <MolView molData={MOL_DATA[reaction.reactantB]} label={reaction.reactantB} size={80} />
            <div className="flex flex-col items-center mx-1.5">
              <span className="text-lg text-os-accent font-black cd-arrow">→</span>
            </div>
            {products.map((p, i) => (
              <React.Fragment key={p}>
                {i > 0 && <span className="text-sm text-os-text-muted font-bold">+</span>}
                <MolView molData={MOL_DATA[p]} label={p} size={80} highlight />
              </React.Fragment>
            ))}
          </div>

          {/* Equation + Phenomenon */}
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-white/80 rounded-xl border-2 border-os-accent/30 p-2.5">
              <p className="text-[9px] uppercase font-black text-os-accent tracking-wider">Phương trình</p>
              <p className="font-bold text-os-text text-sm">{reaction.equation}</p>
            </div>
            <div className="bg-amber-50/80 rounded-xl border-2 border-amber-200/50 p-2.5">
              <p className="text-[9px] uppercase font-black text-amber-600 tracking-wider">Hiện tượng</p>
              <p className="text-xs text-amber-900 leading-relaxed">{reaction.phenomenon}</p>
            </div>
          </div>

          {/* Effect badges */}
          {effects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {effects.map(e => (
                <span key={e} className="text-[10px] font-bold px-2 py-1 rounded-lg border-2 bg-white shadow-sm border-os-border text-os-text">
                  {EFFECT_LABELS[e] || e}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN VIRTUAL LAB
   ═══════════════════════════════════════════════════ */
export const VirtualLab = () => {
  const [selectedReaction, setSelectedReaction] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [showSketcher, setShowSketcher] = useState(false);
  const timerRef = useRef(null);

  const reaction = REACTIONS_DATA[selectedReaction];

  const handleReact = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('pouring');
    timerRef.current = setTimeout(() => {
      setPhase('reacting');
      setTimeout(() => setPhase('done'), 2500);
    }, 1500);
  }, [phase]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle');
  }, []);

  const handleSelect = useCallback((idx) => {
    handleReset();
    setSelectedReaction(idx);
  }, [handleReset]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* LEFT: Lab */}
        <div className="lg:col-span-3">
          {/* Main Lab */}
          <div className="border-2 border-os-border rounded-lg overflow-hidden">
            <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-2 flex items-center justify-between">
              <h3 className="text-xs font-black text-os-text uppercase tracking-wider">
                🔬 Phòng Thí Nghiệm Ảo
              </h3>
              <div className="flex gap-1.5 items-center">
                <span className="text-[8px] text-os-text-muted opacity-60">ChemDoodle</span>
                {phase !== 'idle' && (
                  <button onClick={handleReset} className="retro-btn text-[10px] py-1 px-2">🔄 Reset</button>
                )}
              </div>
            </div>
            <ReactionDisplay reaction={reaction} phase={phase} />
          </div>

          {/* Sketcher Toggle */}
          <div className="mt-3 border-2 border-os-border rounded-lg overflow-hidden">
            <button onClick={() => setShowSketcher(!showSketcher)}
              className="w-full bg-os-titlebar border-b-2 border-os-border px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-os-bg transition-colors">
              <h3 className="text-xs font-black text-os-text uppercase tracking-wider">
                ✏️ Bảng vẽ phân tử (Ketcher)
              </h3>
              <span className="text-os-text-muted text-xs">{showSketcher ? '▲ Ẩn' : '▼ Mở'}</span>
            </button>
            {showSketcher && (
              <div className="bg-white" style={{ height: 450 }}>
                <KetcherEditor />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Controls */}
        <div className="lg:col-span-2 space-y-3">
          {/* Reaction Selector */}
          <div className="border-2 border-os-border rounded-lg overflow-hidden">
            <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-2">
              <h3 className="text-xs font-black text-os-text uppercase tracking-wider">⚗️ Chọn thí nghiệm</h3>
            </div>
            <div className="p-2 max-h-[300px] overflow-y-auto retro-body">
              {REACTIONS_DATA.map((r, i) => (
                <button key={i} onClick={() => handleSelect(i)}
                  className={`w-full text-left p-2.5 rounded-lg border-2 mb-1 transition-all cursor-pointer ${
                    selectedReaction === i
                      ? 'bg-os-accent/10 border-os-accent shadow-sm'
                      : 'border-transparent hover:bg-os-bg hover:border-os-border'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.visual?.emoji || '🧪'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[11px] text-os-text truncate">{r.reactantA} + {r.reactantB}</p>
                      <p className="text-[9px] text-os-text-muted truncate">{r.equation}</p>
                    </div>
                    {selectedReaction === i && <span className="text-os-accent font-black text-sm">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reagent Info */}
          <div className="border-2 border-os-border rounded-lg overflow-hidden">
            <div className="bg-os-titlebar border-b-2 border-os-border px-3 py-2">
              <h3 className="text-xs font-black text-os-text uppercase tracking-wider">📋 Chất phản ứng</h3>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 p-2 bg-os-bg-light rounded-lg border border-os-border/50">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: reaction.visual?.colorA || '#e0e0e0', border: '1px solid #0002' }}>A</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-os-text-muted uppercase">Chất A</p>
                  <p className="text-[11px] font-bold text-os-text truncate">{reaction.reactantAName}</p>
                </div>
              </div>
              <div className="text-center text-os-text-muted text-xl font-bold">+</div>
              <div className="flex items-center gap-2 p-2 bg-os-bg-light rounded-lg border border-os-border/50">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: reaction.visual?.colorB || '#e0e0e0', border: '1px solid #0002' }}>B</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-os-text-muted uppercase">Chất B</p>
                  <p className="text-[11px] font-bold text-os-text truncate">{reaction.reactantBName}</p>
                </div>
              </div>

              <button onClick={handleReact} disabled={phase !== 'idle'}
                className={`w-full retro-btn retro-btn-primary py-3 text-sm flex items-center justify-center gap-2 mt-1.5 ${phase !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {phase === 'idle' ? '⚗️ Tiến Hành Phản Ứng' :
                 phase === 'pouring' ? '🫗 Đang trộn...' :
                 phase === 'reacting' ? '⏳ Đang phản ứng...' : '✅ Hoàn thành!'}
              </button>
              {phase !== 'idle' && (
                <button onClick={handleReset} className="w-full retro-btn py-2 text-sm">🔄 Thí nghiệm lại</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   KETCHER EDITOR — Molecule Sketcher
   Uses lazy imports + renders directly in React tree
   ═══════════════════════════════════════════════════ */
const KetcherEditor = () => {
  const [ketcherModules, setKetcherModules] = useState(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const providerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [standaloneModule, reactModule] = await Promise.all([
          import(/* @vite-ignore */ 'ketcher-standalone'),
          import(/* @vite-ignore */ 'ketcher-react'),
        ]);
        if (!cancelled) {
          setKetcherModules({ standaloneModule, reactModule });
        }
      } catch (err) {
        console.warn('Ketcher load error:', err);
        if (!cancelled) setError('Không thể tải Ketcher Editor. Vui lòng thử lại.');
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleInit = useCallback((ketcher) => {
    window.ketcher = ketcher;
    setLoaded(true);
  }, []);

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-center">
        <div>
          <span className="text-3xl">🔧</span>
          <p className="text-sm text-os-text-muted mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!ketcherModules) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-sm text-os-text-muted animate-pulse">⏳ Đang tải Ketcher Editor...</span>
      </div>
    );
  }

  // Initialize provider once
  if (!providerRef.current) {
    const { StandaloneStructServiceProvider } = ketcherModules.standaloneModule;
    providerRef.current = new StandaloneStructServiceProvider();
  }

  const EditorComponent = ketcherModules.reactModule.Editor;

  return (
    <div className="w-full h-full" style={{ position: 'relative', minHeight: 400 }}>
      <EditorComponent
        staticResourcesUrl=""
        structServiceProvider={providerRef.current}
        onInit={handleInit}
      />
    </div>
  );
};
