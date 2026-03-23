/**
 * balanceEquation.js
 * Parse + cân bằng phương trình hóa học vô cơ THCS/THPT
 * Thuật toán: Gaussian Elimination trên ma trận hệ số
 */

// Parse a single formula like "Ca(OH)2" -> { Ca: 1, O: 2, H: 2 }
export function parseFormula(formula) {
  const elements = {};
  const stack = [elements];
  let i = 0;

  while (i < formula.length) {
    const ch = formula[i];

    if (ch === '(') {
      const group = {};
      stack.push(group);
      i++;
    } else if (ch === ')') {
      i++;
      let numStr = '';
      while (i < formula.length && /\d/.test(formula[i])) { numStr += formula[i]; i++; }
      const mult = numStr ? parseInt(numStr) : 1;
      const group = stack.pop();
      const parent = stack[stack.length - 1];
      for (const [el, cnt] of Object.entries(group)) {
        parent[el] = (parent[el] || 0) + cnt * mult;
      }
    } else if (/[A-Z]/.test(ch)) {
      let symbol = ch;
      i++;
      while (i < formula.length && /[a-z]/.test(formula[i])) { symbol += formula[i]; i++; }
      let numStr = '';
      while (i < formula.length && /\d/.test(formula[i])) { numStr += formula[i]; i++; }
      const count = numStr ? parseInt(numStr) : 1;
      const current = stack[stack.length - 1];
      current[symbol] = (current[symbol] || 0) + count;
    } else {
      i++;
    }
  }

  return elements;
}

// Parse equation string: "Fe + HCl = FeCl3 + H2"
// Returns { reactants: [{formula, elements}], products: [{formula, elements}] }
export function parseEquation(input) {
  // Normalize: remove spaces around +, =, →, ->
  let eq = input.trim()
    .replace(/↑|↓|⇌/g, '')       // remove arrows/precipitate markers
    .replace(/\s*[→=⟶⟹]\s*/g, '=')  // normalize separator
    .replace(/->/g, '=');

  const [leftStr, rightStr] = eq.split('=');
  if (!leftStr || !rightStr) return null;

  const parseCompounds = (str) =>
    str.split('+').map(s => s.trim()).filter(Boolean).map(formula => ({
      formula,
      elements: parseFormula(formula),
    }));

  return {
    reactants: parseCompounds(leftStr),
    products: parseCompounds(rightStr),
  };
}

// Gaussian elimination to balance: returns array of integer coefficients
function gaussianBalance(parsed) {
  const { reactants, products } = parsed;
  const compounds = [...reactants, ...products];
  const n = compounds.length;

  // Collect all elements
  const elemSet = new Set();
  compounds.forEach(c => Object.keys(c.elements).forEach(e => elemSet.add(e)));
  const elemList = Array.from(elemSet);
  const m = elemList.length;

  // Build matrix: rows = elements, cols = compounds
  // Reactants get positive coefficients, products get negative
  const matrix = [];
  for (let row = 0; row < m; row++) {
    const el = elemList[row];
    const r = [];
    for (let col = 0; col < n; col++) {
      const count = compounds[col].elements[el] || 0;
      r.push(col < reactants.length ? count : -count);
    }
    r.push(0); // augmented column = 0
    matrix.push(r);
  }

  const rows = matrix.length;
  const cols = n + 1; // augmented

  // Gaussian elimination with partial pivoting
  let pivotRow = 0;
  const pivotCols = [];

  for (let col = 0; col < n && pivotRow < rows; col++) {
    // Find max pivot
    let maxVal = 0, maxRow = -1;
    for (let row = pivotRow; row < rows; row++) {
      if (Math.abs(matrix[row][col]) > maxVal) {
        maxVal = Math.abs(matrix[row][col]);
        maxRow = row;
      }
    }
    if (maxRow === -1 || maxVal < 1e-10) continue;

    // Swap rows
    [matrix[pivotRow], matrix[maxRow]] = [matrix[maxRow], matrix[pivotRow]];
    pivotCols.push(col);

    // Eliminate below
    for (let row = 0; row < rows; row++) {
      if (row === pivotRow) continue;
      const factor = matrix[row][col] / matrix[pivotRow][col];
      for (let j = col; j < cols; j++) {
        matrix[row][j] -= factor * matrix[pivotRow][j];
      }
    }
    pivotRow++;
  }

  // Back-substitute: set free variable = 1
  const solution = new Array(n).fill(0);
  const freeVars = [];
  for (let col = 0; col < n; col++) {
    if (!pivotCols.includes(col)) freeVars.push(col);
  }

  // Set free variables to 1
  freeVars.forEach(col => { solution[col] = 1; });
  if (freeVars.length === 0) {
    // All variables are pivot — set last one = 1
    solution[n - 1] = 1;
  }

  // Solve for pivot variables
  for (let i = pivotCols.length - 1; i >= 0; i--) {
    const row = i;
    const col = pivotCols[i];
    let val = matrix[row][cols - 1]; // = 0
    for (let j = col + 1; j < n; j++) {
      val -= matrix[row][j] * solution[j];
    }
    solution[col] = val / matrix[row][col];
  }

  // Convert to positive integers
  // Make all positive
  const absVals = solution.map(Math.abs);
  const hasNeg = solution.some(v => v < -1e-10);
  const coefficients = hasNeg ? absVals : solution.map(v => Math.abs(v));

  // Find LCM of denominators to make integers
  const toFraction = (x) => {
    const tolerance = 1e-6;
    for (let d = 1; d <= 1000; d++) {
      const n = Math.round(x * d);
      if (Math.abs(x - n / d) < tolerance) return { n, d };
    }
    return { n: Math.round(x), d: 1 };
  };

  const fractions = coefficients.map(toFraction);
  const lcmDenom = fractions.reduce((acc, f) => lcm(acc, f.d), 1);
  let intCoeffs = fractions.map(f => Math.round(f.n * lcmDenom / f.d));

  // GCD to simplify
  const g = intCoeffs.reduce((acc, v) => gcd(acc, v), intCoeffs[0]);
  if (g > 1) intCoeffs = intCoeffs.map(v => Math.round(v / g));

  // Validate: all must be positive
  if (intCoeffs.some(v => v <= 0)) return null;

  return intCoeffs;
}

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

// Format formula with subscript numbers for display
export function formatFormula(formula) {
  return formula
    .replace(/(\d+)/g, (m) => {
      const subs = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
      return m.split('').map(c => subs[c] || c).join('');
    });
}

/**
 * Main function: balance a chemical equation
 * @param {string} input - e.g. "Fe + HCl = FeCl3 + H2"
 * @returns {{ balanced: string, coefficients: number[], reactants: string[], products: string[], error?: string }}
 */
export function balanceEquation(input) {
  const parsed = parseEquation(input);
  if (!parsed) return { error: 'Không thể phân tích phương trình. Dùng dấu = hoặc → để tách vế.' };
  if (parsed.reactants.length === 0) return { error: 'Thiếu chất phản ứng (vế trái).' };
  if (parsed.products.length === 0) return { error: 'Thiếu sản phẩm (vế phải).' };

  // Validate elements match
  const leftElements = new Set();
  const rightElements = new Set();
  parsed.reactants.forEach(c => Object.keys(c.elements).forEach(e => leftElements.add(e)));
  parsed.products.forEach(c => Object.keys(c.elements).forEach(e => rightElements.add(e)));

  const missingRight = [...leftElements].filter(e => !rightElements.has(e));
  const missingLeft = [...rightElements].filter(e => !leftElements.has(e));

  if (missingRight.length > 0) return { error: `Nguyên tố ${missingRight.join(', ')} có ở vế trái nhưng thiếu ở vế phải.` };
  if (missingLeft.length > 0) return { error: `Nguyên tố ${missingLeft.join(', ')} có ở vế phải nhưng thiếu ở vế trái.` };

  const coefficients = gaussianBalance(parsed);
  if (!coefficients) return { error: 'Không thể cân bằng phương trình này. Kiểm tra lại công thức.' };

  const rFormulas = parsed.reactants.map(c => c.formula);
  const pFormulas = parsed.products.map(c => c.formula);
  const rCoeffs = coefficients.slice(0, rFormulas.length);
  const pCoeffs = coefficients.slice(rFormulas.length);

  // Verify balance
  const verify = {};
  rFormulas.forEach((f, i) => {
    const elems = parsed.reactants[i].elements;
    for (const [el, cnt] of Object.entries(elems)) {
      verify[el] = (verify[el] || 0) + cnt * rCoeffs[i];
    }
  });
  pFormulas.forEach((f, i) => {
    const elems = parsed.products[i].elements;
    for (const [el, cnt] of Object.entries(elems)) {
      verify[el] = (verify[el] || 0) - cnt * pCoeffs[i];
    }
  });

  const isBalanced = Object.values(verify).every(v => Math.abs(v) < 0.01);
  if (!isBalanced) return { error: 'Không thể cân bằng phương trình. Kiểm tra lại sản phẩm.' };

  // Build display string
  const leftSide = rFormulas.map((f, i) => (rCoeffs[i] > 1 ? rCoeffs[i] : '') + formatFormula(f)).join(' + ');
  const rightSide = pFormulas.map((f, i) => (pCoeffs[i] > 1 ? pCoeffs[i] : '') + formatFormula(f)).join(' + ');

  return {
    balanced: `${leftSide} → ${rightSide}`,
    coefficients,
    reactants: rFormulas,
    products: pFormulas,
    reactantCoeffs: rCoeffs,
    productCoeffs: pCoeffs,
    elements: [...leftElements],
  };
}
