/**
 * formulaToSmiles.js
 * Mapping table: Common inorganic compounds → SMILES
 * Used for Ketcher rendering and PubChem 3D lookup
 * Covers THCS/THPT curriculum
 */

const SMILES_MAP = {
  // ===== NGUYÊN TỐ ĐƠN CHẤT =====
  'H2': '[H][H]',
  'O2': 'O=O',
  'N2': 'N#N',
  'Cl2': 'ClCl',
  'Br2': 'BrBr',
  'I2': 'II',
  'F2': 'FF',
  'S': '[S]',
  'C': '[C]',
  'P': '[P]',
  'Fe': '[Fe]',
  'Cu': '[Cu]',
  'Zn': '[Zn]',
  'Al': '[Al]',
  'Na': '[Na]',
  'K': '[K]',
  'Ca': '[Ca]',
  'Mg': '[Mg]',
  'Ag': '[Ag]',
  'Ba': '[Ba]',
  'Mn': '[Mn]',
  'Cr': '[Cr]',
  'Pb': '[Pb]',
  'Sn': '[Sn]',
  'Li': '[Li]',

  // ===== AXIT =====
  'HCl': 'Cl',
  'HBr': 'Br',
  'HI': 'I',
  'HF': 'F',
  'H2SO4': 'OS(=O)(=O)O',
  'HNO3': 'O[N+](=O)[O-]',
  'H3PO4': 'OP(=O)(O)O',
  'H2CO3': 'OC(=O)O',
  'H2S': 'S',
  'H2SO3': 'OS(=O)O',

  // ===== BAZƠ =====
  'NaOH': '[Na+].[OH-]',
  'KOH': '[K+].[OH-]',
  'Ca(OH)2': '[Ca+2].[OH-].[OH-]',
  'Ba(OH)2': '[Ba+2].[OH-].[OH-]',
  'Mg(OH)2': '[Mg+2].[OH-].[OH-]',
  'Al(OH)3': '[Al+3].[OH-].[OH-].[OH-]',
  'Fe(OH)2': '[Fe+2].[OH-].[OH-]',
  'Fe(OH)3': '[Fe+3].[OH-].[OH-].[OH-]',
  'Cu(OH)2': '[Cu+2].[OH-].[OH-]',
  'Zn(OH)2': '[Zn+2].[OH-].[OH-]',
  'LiOH': '[Li+].[OH-]',

  // ===== OXIT =====
  'H2O': 'O',
  'CO2': 'O=C=O',
  'SO2': 'O=S=O',
  'SO3': 'O=S(=O)=O',
  'NO2': 'O=[N+][O-]',
  'NO': '[N]=O',
  'N2O': '[N-]=[N+]=O',
  'N2O5': 'O=[N+]([O-])O[N+](=O)[O-]',
  'P2O5': 'O=P(=O)OP(=O)=O',
  'CaO': '[Ca]=O',
  'MgO': '[Mg]=O',
  'Na2O': '[Na]O[Na]',
  'K2O': '[K]O[K]',
  'BaO': '[Ba]=O',
  'Al2O3': '[Al]O[Al]=O',
  'Fe2O3': 'O=[Fe]O[Fe]=O',
  'Fe3O4': '[Fe+2].[Fe+3].[Fe+3].[O-2].[O-2].[O-2].[O-2]',
  'FeO': '[Fe]=O',
  'CuO': '[Cu]=O',
  'ZnO': '[Zn]=O',
  'SiO2': 'O=[Si]=O',
  'MnO2': 'O=[Mn]=O',
  'Cr2O3': '[Cr]O[Cr]=O',
  'CO': '[C-]#[O+]',
  'PbO': '[Pb]=O',
  'PbO2': 'O=[Pb]=O',

  // ===== MUỐI PHỔ BIẾN =====
  'NaCl': '[Na+].[Cl-]',
  'KCl': '[K+].[Cl-]',
  'CaCl2': '[Ca+2].[Cl-].[Cl-]',
  'BaCl2': '[Ba+2].[Cl-].[Cl-]',
  'MgCl2': '[Mg+2].[Cl-].[Cl-]',
  'AlCl3': '[Al+3].[Cl-].[Cl-].[Cl-]',
  'FeCl2': '[Fe+2].[Cl-].[Cl-]',
  'FeCl3': '[Fe+3].[Cl-].[Cl-].[Cl-]',
  'CuCl2': '[Cu+2].[Cl-].[Cl-]',
  'ZnCl2': '[Zn+2].[Cl-].[Cl-]',
  'AgCl': '[Ag+].[Cl-]',

  'Na2SO4': '[Na+].[Na+].[O-]S(=O)(=O)[O-]',
  'K2SO4': '[K+].[K+].[O-]S(=O)(=O)[O-]',
  'CaSO4': '[Ca+2].[O-]S(=O)(=O)[O-]',
  'BaSO4': '[Ba+2].[O-]S(=O)(=O)[O-]',
  'MgSO4': '[Mg+2].[O-]S(=O)(=O)[O-]',
  'CuSO4': '[Cu+2].[O-]S(=O)(=O)[O-]',
  'FeSO4': '[Fe+2].[O-]S(=O)(=O)[O-]',
  'Fe2(SO4)3': '[Fe+3].[Fe+3].[O-]S(=O)(=O)[O-].[O-]S(=O)(=O)[O-].[O-]S(=O)(=O)[O-]',
  'ZnSO4': '[Zn+2].[O-]S(=O)(=O)[O-]',
  'Al2(SO4)3': '[Al+3].[Al+3].[O-]S(=O)(=O)[O-].[O-]S(=O)(=O)[O-].[O-]S(=O)(=O)[O-]',
  'H2SO4': 'OS(=O)(=O)O',

  'NaNO3': '[Na+].[O-][N+](=O)=O',
  'KNO3': '[K+].[O-][N+](=O)=O',
  'Ca(NO3)2': '[Ca+2].[O-][N+](=O)=O.[O-][N+](=O)=O',
  'AgNO3': '[Ag+].[O-][N+](=O)=O',
  'Fe(NO3)3': '[Fe+3].[O-][N+](=O)=O.[O-][N+](=O)=O.[O-][N+](=O)=O',
  'Cu(NO3)2': '[Cu+2].[O-][N+](=O)=O.[O-][N+](=O)=O',
  'Pb(NO3)2': '[Pb+2].[O-][N+](=O)=O.[O-][N+](=O)=O',

  'Na2CO3': '[Na+].[Na+].[O-]C([O-])=O',
  'K2CO3': '[K+].[K+].[O-]C([O-])=O',
  'CaCO3': '[Ca+2].[O-]C([O-])=O',
  'BaCO3': '[Ba+2].[O-]C([O-])=O',
  'MgCO3': '[Mg+2].[O-]C([O-])=O',

  'NaHCO3': '[Na+].OC([O-])=O',
  'KHCO3': '[K+].OC([O-])=O',
  'Ca(HCO3)2': '[Ca+2].OC([O-])=O.OC([O-])=O',

  'Na3PO4': '[Na+].[Na+].[Na+].[O-]P([O-])([O-])=O',
  'Ca3(PO4)2': '[Ca+2].[Ca+2].[Ca+2].[O-]P([O-])([O-])=O.[O-]P([O-])([O-])=O',

  'KMnO4': '[K+].[O-][Mn](=O)(=O)=O',
  'K2Cr2O7': '[K+].[K+].[O-][Cr](=O)(=O)O[Cr](=O)(=O)[O-]',
  'K2MnO4': '[K+].[K+].[O-][Mn]([O-])(=O)=O',

  'NH4Cl': '[NH4+].[Cl-]',
  'NH3': 'N',
  '(NH4)2SO4': '[NH4+].[NH4+].[O-]S(=O)(=O)[O-]',
  'NH4NO3': '[NH4+].[O-][N+](=O)=O',
};

/**
 * Get SMILES for a chemical formula
 * @param {string} formula
 * @returns {string|null}
 */
export function getSmiles(formula) {
  return SMILES_MAP[formula] || null;
}

/**
 * Get PubChem compound name for 3D lookup
 * Simple formulas work directly with PubChem name search
 */
export function getPubChemName(formula) {
  // PubChem accepts formula directly for most compounds
  const nameMap = {
    'H2O': 'water',
    'CO2': 'carbon dioxide',
    'HCl': 'hydrogen chloride',
    'NaOH': 'sodium hydroxide',
    'H2SO4': 'sulfuric acid',
    'NaCl': 'sodium chloride',
    'CaCO3': 'calcium carbonate',
    'NH3': 'ammonia',
    'NO2': 'nitrogen dioxide',
    'SO2': 'sulfur dioxide',
  };
  return nameMap[formula] || formula;
}

/**
 * Check if a formula has 3D data available
 */
export function has3DData(formula) {
  return !!SMILES_MAP[formula];
}

export default SMILES_MAP;
