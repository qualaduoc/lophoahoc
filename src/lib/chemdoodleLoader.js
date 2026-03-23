// ChemDoodle loader — injects script tag at runtime to avoid Vite ESM transform
// This ensures ChemDoodle is loaded as a plain global script (not module)

let loadPromise = null;

export function loadChemDoodle() {
  if (window.ChemDoodle) return Promise.resolve(window.ChemDoodle);

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/chemdoodle/ChemDoodleWeb.js';
    script.async = false;
    script.onload = () => {
      if (window.ChemDoodle) {
        console.log('ChemDoodle loaded OK, version:', window.ChemDoodle.getVersion());
        resolve(window.ChemDoodle);
      } else {
        reject(new Error('ChemDoodle script loaded but window.ChemDoodle is undefined'));
      }
    };
    script.onerror = (err) => {
      reject(new Error('Failed to load ChemDoodleWeb.js'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
