// PubChem REST API Service — Fetch 3D molecular data
// API: https://pubchem.ncbi.nlm.nih.gov/rest/pug/

const PUBCHEM_BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound';

// Map Vietnamese chemical names to PubChem-searchable names
const NAME_MAP = {
  'HCl': 'hydrogen chloride',
  'NaOH': 'sodium hydroxide',
  'H2O': 'water',
  'NaCl': 'sodium chloride',
  'H2SO4': 'sulfuric acid',
  'CaCO3': 'calcium carbonate',
  'Zn': 'zinc',
  'ZnCl2': 'zinc chloride',
  'Fe': 'iron',
  'FeSO4': 'iron(II) sulfate',
  'CuSO4': 'copper(II) sulfate',
  'AgNO3': 'silver nitrate',
  'Na': 'sodium',
  'BaCl2': 'barium chloride',
  'BaSO4': 'barium sulfate',
  'Mg': 'magnesium',
  'MgCl2': 'magnesium chloride',
  'Cu': 'copper',
  'FeCl3': 'iron(III) chloride',
  'Fe(OH)3': 'iron(III) hydroxide',
  'Na2CO3': 'sodium carbonate',
  'H2': 'hydrogen',
  'CO2': 'carbon dioxide',
  'CaCl2': 'calcium chloride',
  'AgCl': 'silver chloride',
  'NaNO3': 'sodium nitrate',
  'Cu(OH)2': 'copper(II) hydroxide',
  'Na2SO4': 'sodium sulfate',
  'NaCO3': 'sodium carbonate',
  'Na2O': 'sodium oxide',
  'CuO': 'copper(II) oxide',
};

// In-memory cache to avoid re-fetching
const cache = new Map();

/**
 * Fetch 3D SDF data from PubChem for a given formula
 * @param {string} formula - Chemical formula (e.g. 'H2O', 'NaCl')
 * @returns {Promise<string|null>} SDF data or null
 */
export async function fetchMol3D(formula) {
  // Check cache first
  if (cache.has(formula)) {
    return cache.get(formula);
  }

  const searchName = NAME_MAP[formula] || formula;

  try {
    // Try by name first (more reliable)
    const url = `${PUBCHEM_BASE}/name/${encodeURIComponent(searchName)}/record/SDF?record_type=3d`;
    const res = await fetch(url);

    if (res.ok) {
      const sdf = await res.text();
      // Extract only the MOL block (before $$$$)
      const molBlock = sdf.split('$$$$')[0].trim();
      cache.set(formula, molBlock);
      return molBlock;
    }

    // Fallback: try by formula
    const urlFormula = `${PUBCHEM_BASE}/formula/${encodeURIComponent(formula)}/record/SDF?record_type=3d`;
    const res2 = await fetch(urlFormula);
    if (res2.ok) {
      const sdf = await res2.text();
      const molBlock = sdf.split('$$$$')[0].trim();
      cache.set(formula, molBlock);
      return molBlock;
    }

    cache.set(formula, null);
    return null;
  } catch (err) {
    console.warn(`PubChem fetch failed for ${formula}:`, err);
    cache.set(formula, null);
    return null;
  }
}

/**
 * Batch fetch 3D data for multiple formulas
 * @param {string[]} formulas - Array of chemical formulas
 * @returns {Promise<Object>} Map of formula -> SDF data
 */
export async function fetchMultipleMol3D(formulas) {
  const results = {};
  const uniqueFormulas = [...new Set(formulas)];

  // Fetch in parallel with a small delay between requests to be nice to PubChem
  const promises = uniqueFormulas.map((formula, i) =>
    new Promise((resolve) => {
      setTimeout(async () => {
        const data = await fetchMol3D(formula);
        results[formula] = data;
        resolve();
      }, i * 200); // 200ms stagger
    })
  );

  await Promise.all(promises);
  return results;
}

/**
 * Clear the in-memory cache
 */
export function clearCache() {
  cache.clear();
}
