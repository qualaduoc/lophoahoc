import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as $3Dmol from '3dmol';

/* ═══════════════════════════════════════════════════
   3D MOLECULE VIEWER
   Uses 3Dmol.js (WebGL) — completely independent from 2D ChemDoodle
   Features: 4 display modes, auto-rotate, atom labels, PNG export
   ═══════════════════════════════════════════════════ */

// Style presets for different visual modes
const STYLE_PRESETS = {
  'ball-stick': (viewer) => {
    viewer.setStyle({}, {
      stick: { radius: 0.15, colorscheme: 'Jmol' },
      sphere: { scale: 0.3, colorscheme: 'Jmol' },
    });
  },
  'stick': (viewer) => {
    viewer.setStyle({}, {
      stick: { radius: 0.2, colorscheme: 'Jmol' },
    });
  },
  'sphere': (viewer) => {
    viewer.setStyle({}, {
      sphere: { colorscheme: 'Jmol' },
    });
  },
  'wireframe': (viewer) => {
    viewer.setStyle({}, {
      line: { colorscheme: 'Jmol' },
    });
  },
};

const STYLE_LABELS = {
  'ball-stick': '⚛️ Bi & Que',
  'stick': '🧪 Que',
  'sphere': '🫧 Cầu',
  'wireframe': '🔗 Khung dây',
};

const MolView3D = ({ molData, label, size = 200, highlight = false, autoRotate = true, showExport = true }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [styleMode, setStyleMode] = useState('ball-stick');
  const [isSpinning, setIsSpinning] = useState(autoRotate);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!molData || !containerRef.current) return;

    try {
      if (viewerRef.current) {
        viewerRef.current = null;
      }
      containerRef.current.innerHTML = '';

      const viewer = $3Dmol.createViewer(containerRef.current, {
        backgroundColor: '#1a1a2e',
        antialias: true,
      });

      viewer.addModel(molData, 'sdf');
      STYLE_PRESETS[styleMode](viewer);

      // Add labels to non-hydrogen atoms
      const atoms = viewer.getModel().selectedAtoms({});
      atoms.forEach((atom) => {
        if (atom.elem !== 'H') {
          viewer.addLabel(atom.elem, {
            position: { x: atom.x, y: atom.y, z: atom.z },
            fontSize: 12,
            fontColor: 'white',
            backgroundOpacity: 0.6,
            backgroundColor: '#333',
            borderRadius: 4,
          });
        }
      });

      viewer.zoomTo();
      viewer.render();

      if (isSpinning) {
        viewer.spin('y', 1);
      }

      viewerRef.current = viewer;
      setError(null);
    } catch (err) {
      console.error('3Dmol error:', err);
      setError('Không thể render 3D');
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current = null;
      }
    };
  }, [molData, styleMode]);

  // Handle spin toggle
  useEffect(() => {
    if (!viewerRef.current) return;
    if (isSpinning) {
      viewerRef.current.spin('y', 1);
    } else {
      viewerRef.current.spin(false);
    }
  }, [isSpinning]);

  const toggleSpin = () => setIsSpinning((prev) => !prev);

  const cycleStyle = () => {
    const modes = Object.keys(STYLE_PRESETS);
    const idx = modes.indexOf(styleMode);
    setStyleMode(modes[(idx + 1) % modes.length]);
  };

  // Export PNG
  const handleExport = useCallback(() => {
    if (!viewerRef.current) return;
    setExporting(true);

    try {
      // Stop spinning momentarily for clean capture
      const wasSpinning = isSpinning;
      if (wasSpinning) viewerRef.current.spin(false);

      // Use 3Dmol's built-in PNG export via canvas
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `molecule_3D_${label || 'export'}_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }

      // Resume spinning
      if (wasSpinning) {
        setTimeout(() => viewerRef.current?.spin('y', 1), 300);
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  }, [isSpinning, label]);

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <div
          style={{ width: size, height: size }}
          className="rounded-xl border-2 border-red-300 bg-red-50 flex items-center justify-center"
        >
          <span className="text-xs text-red-500">{error}</span>
        </div>
        {label && <p className="text-xs font-bold mt-1 text-center">{label}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${highlight ? 'cd-glow' : ''}`}>
      <div className="relative group">
        <div
          ref={containerRef}
          style={{
            width: size,
            height: size,
            borderRadius: 12,
            overflow: 'hidden',
          }}
          className={`border-2 ${highlight ? 'border-os-accent' : 'border-os-border'}`}
        />
        {/* Control buttons overlay */}
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleSpin}
            title={isSpinning ? 'Dừng xoay' : 'Tự xoay'}
            className="w-6 h-6 rounded bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 cursor-pointer"
          >
            {isSpinning ? '⏸' : '🔄'}
          </button>
          <button
            onClick={cycleStyle}
            title="Đổi kiểu hiển thị"
            className="w-6 h-6 rounded bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 cursor-pointer"
          >
            🎨
          </button>
          {showExport && (
            <button
              onClick={handleExport}
              disabled={exporting}
              title="Xuất ảnh PNG"
              className="w-6 h-6 rounded bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 cursor-pointer disabled:opacity-50"
            >
              {exporting ? '⏳' : '📷'}
            </button>
          )}
        </div>
        {/* Style label */}
        <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white">
            {STYLE_LABELS[styleMode]}
          </span>
        </div>
      </div>
      {label && (
        <p className={`text-xs font-black mt-1.5 text-center ${highlight ? 'text-os-accent' : 'text-os-text'}`}
           style={{ maxWidth: size }}>
          {label}
        </p>
      )}
    </div>
  );
};

export default MolView3D;
