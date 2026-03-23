import React, { useState } from 'react';
import { ELEMENTS, LANTHANIDE_MARKER, ACTINIDE_MARKER, CATEGORY_COLORS } from '../lib/chemData';

const ElementCell = ({ el, onClick, isMarker }) => {
  const colors = CATEGORY_COLORS[el.category] || { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800' };
  
  if (isMarker) {
    return (
      <button
        className={`${colors.bg} ${colors.border} border rounded-md flex flex-col items-center justify-center text-xs font-bold opacity-70 hover:opacity-100 transition-all`}
        style={{ gridRow: el.row, gridColumn: el.col }}
        title={el.symbol}
      >
        <span className={`${colors.text} text-[9px]`}>{el.symbol}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(el)}
      className={`${colors.bg} ${colors.border} border rounded-md flex flex-col items-center justify-center hover:scale-110 hover:z-10 hover:shadow-lg transition-all duration-150 cursor-pointer relative group`}
      style={{ gridRow: el.row, gridColumn: el.col }}
      title={`${el.z} - ${el.name}`}
    >
      <span className={`text-[8px] font-semibold opacity-50 leading-none`}>{el.z}</span>
      <span className={`${colors.text} font-black text-sm leading-none`}>{el.symbol}</span>
      <span className="text-[7px] opacity-50 leading-none truncate w-full text-center">{el.mass}</span>
    </button>
  );
};

const ElementModal = ({ el, onClose }) => {
  if (!el) return null;
  const colors = CATEGORY_COLORS[el.category] || {};
  
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="retro-window max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="retro-titlebar">
          <span className="title">⚛️ {el.name} ({el.symbol})</span>
          <div className="window-controls">
            <span className="min-btn" /><span className="max-btn" />
            <span className="close-btn" onClick={onClose} />
          </div>
        </div>
        <div className="retro-body">
          <div className="flex items-start gap-5 mb-5">
            <div className={`w-24 h-24 ${colors.bg} ${colors.border} border-2 rounded-xl flex flex-col items-center justify-center shrink-0`}>
              <span className="text-xs font-bold opacity-40">{el.z}</span>
              <span className={`text-4xl font-black ${colors.text}`}>{el.symbol}</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-os-text">{el.name}</h2>
              <p className="text-sm text-os-text-muted">{el.nameEn}</p>
              <div className={`inline-flex mt-2 px-2.5 py-0.5 rounded border-2 text-[10px] font-black uppercase ${colors.bg} ${colors.text} ${colors.border}`}>
                {CATEGORY_COLORS[el.category]?.label || el.category}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ l: 'Số hiệu', v: el.z }, { l: 'Khối lượng', v: `${el.mass} u` }, { l: 'Chu kỳ', v: el.row <= 7 ? el.row : (el.row === 9 ? 6 : 7) }, { l: 'Nhóm', v: el.col <= 18 ? el.col : '—' }].map(i => (
              <div key={i.l} className="bg-os-bg-light border-2 border-os-border rounded-lg p-3">
                <p className="text-[10px] uppercase font-black text-os-text-muted tracking-wider mb-0.5">{i.l}</p>
                <p className="text-lg font-black text-os-text">{i.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PeriodicTable = () => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [highlightCategory, setHighlightCategory] = useState(null);

  const mainElements = ELEMENTS.filter(el => el.row <= 7);
  const lanthanides = ELEMENTS.filter(el => el.row === 9);
  const actinides = ELEMENTS.filter(el => el.row === 10);

  return (
    <div>
      <p className="text-xs text-os-text-muted mb-3">Nhấp vào nguyên tố để xem chi tiết</p>

      {/* Category Legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(CATEGORY_COLORS).map(([key, val]) => (
          <button
            key={key}
            onMouseEnter={() => setHighlightCategory(key)}
            onMouseLeave={() => setHighlightCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${val.bg} ${val.border} ${val.text} ${
              highlightCategory && highlightCategory !== key ? 'opacity-30' : 'opacity-100'
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Main Table Grid */}
      <div className="overflow-x-auto pb-4">
        <div
          className="grid gap-[3px] min-w-[900px]"
          style={{
            gridTemplateColumns: 'repeat(18, minmax(44px, 1fr))',
            gridTemplateRows: 'repeat(7, 48px)',
          }}
        >
          {mainElements.map(el => (
            <ElementCell
              key={el.z}
              el={el}
              onClick={setSelectedElement}
              isMarker={false}
            />
          ))}
          <ElementCell el={LANTHANIDE_MARKER} onClick={() => {}} isMarker={true} />
          <ElementCell el={ACTINIDE_MARKER} onClick={() => {}} isMarker={true} />
        </div>

        {/* Lanthanides */}
        <div className="mt-4 pt-4 border-t-2 border-pink-200">
          <p className="text-xs font-bold text-pink-600 mb-2 ml-1">★ Lanthanide (57–71)</p>
          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateColumns: 'repeat(15, minmax(44px, 1fr))',
              gridTemplateRows: '48px',
            }}
          >
            {lanthanides.map(el => (
              <button
                key={el.z}
                onClick={() => setSelectedElement(el)}
                className={`${CATEGORY_COLORS.lanthanide.bg} ${CATEGORY_COLORS.lanthanide.border} border rounded-md flex flex-col items-center justify-center hover:scale-110 hover:z-10 hover:shadow-lg transition-all duration-150 cursor-pointer ${
                  highlightCategory && highlightCategory !== 'lanthanide' ? 'opacity-30' : ''
                }`}
              >
                <span className="text-[8px] font-semibold opacity-50">{el.z}</span>
                <span className="font-black text-sm text-pink-800">{el.symbol}</span>
                <span className="text-[7px] opacity-50">{el.mass}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actinides */}
        <div className="mt-3">
          <p className="text-xs font-bold text-rose-600 mb-2 ml-1">★ Actinide (89–103)</p>
          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateColumns: 'repeat(15, minmax(44px, 1fr))',
              gridTemplateRows: '48px',
            }}
          >
            {actinides.map(el => (
              <button
                key={el.z}
                onClick={() => setSelectedElement(el)}
                className={`${CATEGORY_COLORS.actinide.bg} ${CATEGORY_COLORS.actinide.border} border rounded-md flex flex-col items-center justify-center hover:scale-110 hover:z-10 hover:shadow-lg transition-all duration-150 cursor-pointer ${
                  highlightCategory && highlightCategory !== 'actinide' ? 'opacity-30' : ''
                }`}
              >
                <span className="text-[8px] font-semibold opacity-50">{el.z}</span>
                <span className="font-black text-sm text-rose-800">{el.symbol}</span>
                <span className="text-[7px] opacity-50">{el.mass}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedElement && <ElementModal el={selectedElement} onClose={() => setSelectedElement(null)} />}
    </div>
  );
};
