import React, { useState } from 'react';
import { ELEMENTS, LANTHANIDE_MARKER, ACTINIDE_MARKER, CATEGORY_COLORS } from '../lib/chemData';
import { X, Atom } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-start gap-6 mb-6">
          <div className={`w-28 h-28 ${colors.bg} ${colors.border} border-4 rounded-2xl flex flex-col items-center justify-center shrink-0`}>
            <span className="text-xs font-bold opacity-40">{el.z}</span>
            <span className={`text-5xl font-black ${colors.text}`}>{el.symbol}</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{el.name}</h2>
            <p className="text-sm text-gray-400 font-medium">{el.nameEn}</p>
            <div className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} ${colors.border} border`}>
              {CATEGORY_COLORS[el.category]?.label || el.category}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Số hiệu nguyên tử</h3>
            <p className="text-xl font-black text-gray-800">{el.z}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Khối lượng nguyên tử</h3>
            <p className="text-xl font-black text-gray-800">{el.mass} <span className="text-sm font-normal text-gray-500">u</span></p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Chu kỳ</h3>
            <p className="text-xl font-black text-gray-800">{el.row <= 7 ? el.row : (el.row === 9 ? 6 : 7)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Nhóm</h3>
            <p className="text-xl font-black text-gray-800">{el.col <= 18 ? el.col : '—'}</p>
          </div>
        </div>

        <div className="mt-4 bg-sky-50 border border-sky-200 rounded-xl p-4">
          <h3 className="text-xs uppercase font-bold text-sky-600 tracking-wider mb-2">Ghi chú</h3>
          <p className="text-sm text-sky-800 leading-relaxed">
            Thông tin chi tiết về tính chất vật lý, hóa học, và các phản ứng tiêu biểu của {el.name} ({el.symbol}) sẽ được cập nhật từ cơ sở dữ liệu Supabase.
          </p>
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
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-sky-500 to-emerald-500 p-2.5 rounded-xl">
          <Atom className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Bảng Tuần Hoàn Nguyên Tố</h1>
          <p className="text-sm text-gray-500">Nhấp vào nguyên tố để xem chi tiết</p>
        </div>
      </div>

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
