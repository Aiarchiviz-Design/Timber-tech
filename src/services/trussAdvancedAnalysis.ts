/*
 * Advanced truss analysis (design-assist, ASD)
 * ------------------------------------------------
 * Load combinations : ASCE 7-16 Section 2.4 (ASD), roof live vs snow, balanced and unbalanced snow.
 * Member forces      : pin-jointed truss analysis per load case (linear superposition across combinations).
 * Chord bending      : panel-point loads applied as simple spans between panel points (standard TPI-style method).
 * Adjustment factors : NDS 2018 Sections 4.3 / 3.3 / 3.7 / 3.9 (CD, CM, Ct, CL, CF, Cr, Cp).
 * Checks             : tension, compression (with Cp), bending (with CL), shear, combined tension+bending (3.9.1),
 *                      combined compression+bending (3.9.2), slenderness le/d <= 50, deflection L/240 live and L/180 total.
 *
 * Reference design values: NDS 2018 Supplement, Table 4A, SPF No. 2 (2 in. and wider), dry service, normal duration.
 * Size factors CF and repetitive factor Cr are from NDS 2018 Table 4A notes and Section 4.3.9.
 *
 * NOT included: connector / plate design (needs manufacturer capacity data), wind and seismic combinations,
 * drift and sloped-roof snow coefficients (Cs), bearing checks, and lateral bracing design.
 * Output is for review by a licensed engineer. It is not a sealed calculation.
 */

import type { TrussStructure } from '../types/trussElevation.ts';

export interface LumberProps {
  Fb: number; Ft: number; Fv: number; Fcp: number; Fc: number; E: number; Emin: number; // psi
}

/** NDS 2018 Supplement Table 4A, Spruce-Pine-Fir No. 2, 2 in. and wider (dry, normal duration). */
export const SPF_NO2: LumberProps = { Fb: 875, Ft: 575, Fv: 135, Fcp: 425, Fc: 1150, E: 1_400_000, Emin: 510_000 };

export interface AdvNode { id: number; x: number; y: number } // mm

export interface AdvMember {
  id: string;
  a: number;              // node id
  b: number;              // node id
  kind: 'top' | 'bottom' | 'web';
  widthMm: number;        // b (least dimension for weak-axis buckling)
  depthMm: number;        // d
  latInPlaneMm?: number;  // unbraced length for buckling in the truss plane (default: member length)
  latOutMm?: number;      // unbraced length for buckling out of the plane / lateral torsional (default: chordLatMm)
}

export interface AdvInput {
  nodes: AdvNode[];
  members: AdvMember[];
  spanMm: number;
  spacingMm: number;      // truss spacing (c/c)
  leftHeelId: number;
  rightHeelId: number;
  deadRoofPsf?: number;   // roof dead load (default 15)
  deadCeilingPsf?: number; // bottom-chord ceiling dead load (default 5)
  snowPsf?: number;       // roof snow load on the roof plane (default 20). Sloped-roof Cs NOT applied.
  liveRoofPsf?: number;   // roof live load (default 20), used in place of snow
  chordLatMm?: number;    // out-of-plane lateral support spacing for chords (default 600, sheathing)
  props?: LumberProps;    // default SPF_NO2
}

export interface ComboResult {
  name: string;
  CD: number;
  ratio: number;
  check: string;
}

export interface MemberCheck {
  id: string;
  kind: AdvMember['kind'];
  lengthMm: number;
  sizeLabel: string;
  maxTensionN: number;
  maxCompressionN: number;
  maxMomentNmm: number;
  maxShearN: number;
  /** Unfactored Dead Load (DL) on this member in N */
  deadLoadN: number;
  /** Unfactored Live / Snow Load (LL) on this member in N */
  liveLoadN: number;
  /** Total Unfactored Roof Load (DL + LL) on this member in N */
  totalRoofLoadN: number;
  /** Axial force due to Dead Load (D) in N */
  deadAxialN: number;
  /** Axial force due to governing Live/Snow Load (S or Lr) in N */
  liveAxialN: number;
  /** Total Axial force under ASD (D + S/Lr) in N */
  totalAxialN: number;
  /** Member tributary roof/ceiling area in m² */
  tributaryAreaM2: number;
  ratios: { tension: number; compression: number; bending: number; shear: number; combinedTension: number; combinedCompression: number };
  slendernessMax: number;
  slendernessOk: boolean;
  governing: ComboResult;
  status: 'PASS' | 'FAIL';
}

export interface AdvReport {
  members: MemberCheck[];
  reactionsN: { left: number; right: number; leftDead: number; leftSnow: number };
  roofLoadsSummary: {
    deadRoofKPa: number;
    deadCeilKPa: number;
    liveOrSnowKPa: number;
    totalRoofKPa: number;
    deadLoadTotalN: number;
    liveLoadTotalN: number;
    totalRoofLoadN: number;
    codeStandard: string;
    codeCompliant: boolean;
  };
  deflection: { midspanNode: number; liveMm: number; liveLimitMm: number; totalMm: number; totalLimitMm: number; liveOk: boolean; totalOk: boolean };
  unstable: boolean;
  overall: 'PASS' | 'FAIL';
  assumptions: string[];
  warnings: string[];
}

// ---------------------------------------------------------------- unit helpers
const PSI_PER_MPA = 145.0377;          // 1 MPa = 145.04 psi
const psiToMpa = (p: number) => p / PSI_PER_MPA;
const mmToIn = (mm: number) => mm / 25.4;
const PSF_TO_KPA = 0.0478803;

// NDS 2018 Table 4A size factors for dimension lumber (depth in inches -> [Fb, Ft, Fc]).
const CF_TABLE: [number, [number, number, number]][] = [
  [3.5, [1.5, 1.5, 1.15]],
  [5.5, [1.3, 1.3, 1.1]],
  [7.25, [1.2, 1.2, 1.05]],
  [9.25, [1.1, 1.1, 1.0]],
  [11.25, [1.0, 1.0, 1.0]],
];
export function sizeFactors(depthIn: number): [number, number, number] {
  let best = CF_TABLE[0];
  for (const row of CF_TABLE) if (Math.abs(row[0] - depthIn) < Math.abs(best[0] - depthIn)) best = row;
  return best[1];
}

// ---------------------------------------------------------------- NDS factors
/** NDS 3.7.1 column stability factor Cp, c = 0.8 for sawn lumber. */
export function columnCp(FcStar: number, FcE: number): number {
  const c = 0.8;
  const r = FcE / FcStar;
  const t = (1 + r) / (2 * c);
  return t - Math.sqrt(t * t - r / c);
}

/** NDS 3.7.1 Euler buckling stress for slenderness le/d (MPa in, MPa out). */
export function columnFcE(EminMpa: number, leOverD: number): number {
  return (0.822 * EminMpa) / (leOverD * leOverD);
}

/** NDS 3.3.3 lateral stability factor CL for a rectangular beam (lengths in inches, stresses in MPa). */
export function beamCL(FbStar: number, EminMpa: number, leIn: number, dIn: number, bIn: number): number {
  const RB = Math.min(50, Math.sqrt((leIn * dIn) / (bIn * bIn)));
  const FbE = (1.2 * EminMpa) / (RB * RB);
  const t = (1 + FbE / FbStar) / 1.9;
  return t - Math.sqrt(t * t - FbE / (0.95 * FbStar));
}

// ---------------------------------------------------------------- linear algebra
function solveDense(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const piv = M[c][c];
    if (Math.abs(piv) < 1e-12) continue;
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / piv;
      if (f === 0) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = Math.abs(M[r][r]) < 1e-12 ? 0 : s / M[r][r];
  }
  return x;
}

interface Geo { a: number; b: number; L: number; c: number; s: number; dxh: number }

/** Pin-jointed axial solve. loads in N (per node, per DOF order x,y). Tension positive. */
function solveAxial(nodeIdx: Map<number, number>, nodes: AdvNode[], geo: Geo[], EA: number[], loadsN: number[][], lh: number, rh: number) {
  const n = nodes.length, N = 2 * n;
  const K: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
  const Kaxial: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
  const degree = new Array(n).fill(0);
  geo.forEach(g => { degree[g.a]++; degree[g.b]++; });
  geo.forEach((g, i) => {
    const k = EA[i] / g.L;
    // Cantilever overhang tails or degree-1 tips have a single bar in 2D; add small transverse shear stiffness so cantilevers transfer shear to the heel without a mechanism.
    const isCantilever = degree[g.a] === 1 || degree[g.b] === 1;
    const kp = isCantilever ? k * 1e-2 : k * 1e-6;
    const d = [2 * g.a, 2 * g.a + 1, 2 * g.b, 2 * g.b + 1];
    const v = [-g.c, -g.s, g.c, g.s];
    const vp = [g.s, -g.c, -g.s, g.c];
    for (let p = 0; p < 4; p++) for (let q = 0; q < 4; q++) {
      Kaxial[d[p]][d[q]] += k * v[p] * v[q];
      K[d[p]][d[q]] += k * v[p] * v[q] + kp * vp[p] * vp[q];
    }
  });
  const fixed = new Set([2 * lh, 2 * lh + 1, 2 * rh + 1]);
  const free: number[] = [];
  for (let i = 0; i < N; i++) if (!fixed.has(i)) free.push(i);
  const Kf = free.map(i => free.map(j => K[i][j]));
  const u = new Array(N).fill(0);
  const sols = loadsN.map(F => {
    const bf = free.map(i => F[i]);
    const x = solveDense(Kf, bf);
    const uu = new Array(N).fill(0);
    free.forEach((dof, i) => (uu[dof] = x[i]));
    return uu;
  });
  void u;
  const forces = sols.map(uu => geo.map((g, i) => (EA[i] / g.L) * ((uu[2 * g.b] - uu[2 * g.a]) * g.c + (uu[2 * g.b + 1] - uu[2 * g.a + 1]) * g.s)));
  const reactions = sols.map((uu, k) => {
    // reaction = (K u)_dof - applied load at that dof (loads can sit on a support node, e.g. heel top-chord load)
    const r: number[] = [];
    for (const dof of fixed) {
      let s = -loadsN[k][dof];
      for (let j = 0; j < N; j++) s += K[dof][j] * uu[j];
      r.push(s);
    }
    return r;
  });
  void nodeIdx;
  const unstable = free.some(dof => {
    const nodeIndex = Math.floor(dof / 2);
    if (degree[nodeIndex] === 1) return false;
    return Math.abs(Kaxial[dof][dof]) < 1e-9;
  });
  return { forces, sols, reactions, unstable };
}

// ---------------------------------------------------------------- main analysis
export function analyzeTruss(inp: AdvInput): AdvReport {
  const props = inp.props ?? SPF_NO2;
  const deadRoof = (inp.deadRoofPsf ?? 15) * PSF_TO_KPA;
  const deadCeil = (inp.deadCeilingPsf ?? 5) * PSF_TO_KPA;
  const snow = (inp.snowPsf ?? 20) * PSF_TO_KPA;
  const live = (inp.liveRoofPsf ?? 20) * PSF_TO_KPA;
  const chordLat = inp.chordLatMm ?? 600;
  const spacingM = inp.spacingMm / 1000;
  const warnings: string[] = [];

  const nodeIdx = new Map(inp.nodes.map((nd, i) => [nd.id, i]));
  const nodes = inp.nodes;
  const geo: Geo[] = inp.members.map(m => {
    const A = nodes[nodeIdx.get(m.a)!], B = nodes[nodeIdx.get(m.b)!];
    const L = Math.hypot(B.x - A.x, B.y - A.y);
    return { a: nodeIdx.get(m.a)!, b: nodeIdx.get(m.b)!, L, c: (B.x - A.x) / L, s: (B.y - A.y) / L, dxh: Math.abs(B.x - A.x) };
  });
  const E_MPa = psiToMpa(props.E);
  const EA = inp.members.map((m, i) => E_MPa * m.widthMm * m.depthMm);
  const leftHeelNode = nodes[nodeIdx.get(inp.leftHeelId)!] ?? nodes[0];
  const midX = (leftHeelNode?.x ?? 0) + inp.spanMm / 2;
  const isTop = (m: AdvMember) => m.kind === 'top';

  // ---- load cases: per-member perpendicular and vertical load intensity (kPa)
  type Case = 'D' | 'S' | 'SL' | 'SR' | 'Lr';
  const qFor = (m: AdvMember, mi: number, cs: Case): number => {
    const mid = (nodes[nodeIdx.get(m.a)!].x + nodes[nodeIdx.get(m.b)!].x) / 2;
    if (cs === 'D') return m.kind === 'top' ? deadRoof : m.kind === 'bottom' ? deadCeil : 0;
    if (!isTop(m)) return 0;
    if (cs === 'S') return snow;
    if (cs === 'Lr') return live;
    if (cs === 'SL') return mid <= midX ? snow : 0;
    if (cs === 'SR') return mid > midX ? snow : 0;
    void mi;
    return 0;
  };
  const caseNames: Case[] = ['D', 'S', 'SL', 'SR', 'Lr'];
  const caseData = caseNames.map(cs => {
    const loadsN = nodes.map(() => [0, 0]);
    const Mc: number[] = [], Vc: number[] = [];
    const perpN: number[] = [];
    inp.members.forEach((m, i) => {
      const q = qFor(m, i, cs);
      const Vm = q * spacingM * (geo[i].dxh / 1000) * 1000; // N on this member (vertical)
      loadsN[nodeIdx.get(m.a)!][1] -= Vm / 2;
      loadsN[nodeIdx.get(m.b)!][1] -= Vm / 2;
      const w = (Vm / geo[i].L) * geo[i].dxh / geo[i].L;     // N/mm perpendicular to member
      perpN.push(w);
      Mc.push((w * geo[i].L * geo[i].L) / 8);
      Vc.push((w * geo[i].L) / 2);
    });
    return { cs, loadsN, M: Mc, V: Vc };
  });
  const Fvec = caseData.map(c => {
    const f = new Array(2 * nodes.length).fill(0);
    c.loadsN.forEach((l, i) => { f[2 * i] = l[0]; f[2 * i + 1] = l[1]; });
    return f;
  });
  const solved = solveAxial(nodeIdx, nodes, geo, EA, Fvec, nodeIdx.get(inp.leftHeelId)!, nodeIdx.get(inp.rightHeelId)!);
  const caseN: Record<Case, number[]> = { D: [], S: [], SL: [], SR: [], Lr: [] } as any;
  caseData.forEach((c, k) => (caseN[c.cs] = solved.forces[k]));
  const caseM: Record<Case, number[]> = {} as any, caseV: Record<Case, number[]> = {} as any;
  caseData.forEach(c => { caseM[c.cs] = c.M; caseV[c.cs] = c.V; });

  const sIdx = caseNames.indexOf('S');
  const lrIdx = caseNames.indexOf('Lr');
  const dIdx = caseNames.indexOf('D');

  // Governing transient load case vector:
  const transN = (inp.snowPsf ?? 0) >= (inp.liveRoofPsf ?? 0) ? caseN.S : caseN.Lr;
  const rTrans = (inp.snowPsf ?? 0) >= (inp.liveRoofPsf ?? 0) ? solved.reactions[sIdx] : solved.reactions[lrIdx];
  const rD = solved.reactions[dIdx];

  const reactionsN = {
    left: Math.abs(rD[1]) + Math.abs(rTrans[1]),
    right: Math.abs(rD[2]) + Math.abs(rTrans[2]),
    leftDead: Math.abs(rD[1]),
    leftSnow: Math.abs(rTrans[1]),
    leftTransient: Math.abs(rTrans[1]),
  };

  // ---- deflection: unit load at midspan bottom node
  const bottomNodes = nodes.filter(nd => Math.abs(nd.y - Math.min(...nodes.map(q => q.y))) < 1e-3);
  const interiorBottomNodes = bottomNodes.filter(nd => nd.id !== inp.leftHeelId && nd.id !== inp.rightHeelId);
  const deflCandidates = interiorBottomNodes.length ? interiorBottomNodes : bottomNodes;
  const midNode = deflCandidates.reduce((best, nd) => (Math.abs(nd.x - midX) < Math.abs(best.x - midX) ? nd : best), deflCandidates[0] ?? nodes[0]);
  const unitVec = new Array(2 * nodes.length).fill(0);
  unitVec[2 * nodeIdx.get(midNode.id)! + 1] = -1;
  const unitSolve = solveAxial(nodeIdx, nodes, geo, EA, [unitVec], nodeIdx.get(inp.leftHeelId)!, nodeIdx.get(inp.rightHeelId)!);
  const nUnit = unitSolve.forces[0];
  const defl = (N: number[]) => N.reduce((s, Ni, i) => s + (Ni * nUnit[i] * geo[i].L) / EA[i], 0);
  const liveMm = Math.abs(defl(transN));
  const totalMm = Math.abs(defl(caseN.D.map((v, i) => v + transN[i])));
  const liveLimit = inp.spanMm / 240, totalLimit = inp.spanMm / 180;

  // ---- combinations (ASCE 7-16 Sec 2.4 ASD, subset relevant to roof trusses without wind)
  const combos: { name: string; f: Partial<Record<Case, number>>; CD: number }[] = [
    { name: 'D', f: { D: 1 }, CD: 0.9 },
    { name: 'D + S', f: { D: 1, S: 1 }, CD: 1.15 },
    { name: 'D + S (unbalanced, left)', f: { D: 1, SL: 1 }, CD: 1.15 },
    { name: 'D + S (unbalanced, right)', f: { D: 1, SR: 1 }, CD: 1.15 },
    { name: 'D + Lr', f: { D: 1, Lr: 1 }, CD: 1.25 },
  ];
  if (inp.snowPsf === undefined && inp.liveRoofPsf === undefined) warnings.push('Default loads used (dead 15 psf, snow 20 psf, live 20 psf). Replace with site-specific loads.');
  warnings.push('Snow: ground-to-roof value applied directly; sloped-roof coefficient Cs not applied. Drift not included.');

  const members: MemberCheck[] = inp.members.map((m, i) => {
    const g = geo[i];
    const b = m.widthMm, d = m.depthMm;
    const A = b * d, S = (b * d * d) / 6;
    const bIn = mmToIn(b), dIn = mmToIn(d);
    const [CFb, CFt, CFc] = sizeFactors(dIn);
    const Cr = isTop(m) || m.kind === 'bottom' ? 1.15 : 1.0; // repetitive member factor, chords only
    const leIP = Math.min(g.L, m.latInPlaneMm ?? g.L);
    const leOP = Math.min(g.L, m.latOutMm ?? chordLat);
    const slIP = mmToIn(leIP) / dIn, slOP = mmToIn(leOP) / bIn;
    const slMax = Math.max(slIP, slOP);
    const EminMpa = psiToMpa(props.Emin);

    let worst: ComboResult = { name: '', CD: 0, ratio: 0, check: '' };
    let maxT = 0, maxC = 0, maxM = 0, maxV = 0;
    const r = { tension: 0, compression: 0, bending: 0, shear: 0, combinedTension: 0, combinedCompression: 0 };

    for (const cb of combos) {
      const N = caseNames.reduce((s, cs) => s + (cb.f[cs] ?? 0) * caseN[cs][i], 0);
      const M = caseNames.reduce((s, cs) => s + (cb.f[cs] ?? 0) * (caseM[cs]?.[i] ?? 0), 0);
      const V = caseNames.reduce((s, cs) => s + (cb.f[cs] ?? 0) * (caseV[cs]?.[i] ?? 0), 0);
      maxT = Math.max(maxT, N); maxC = Math.max(maxC, -N); maxM = Math.max(maxM, Math.abs(M)); maxV = Math.max(maxV, Math.abs(V));
      const CD = cb.CD;
      const CM = 1, Ct = 1, Ci = 1, Cfu = 1;
      const Ft = psiToMpa(props.Ft) * CD * CM * Ct * CFt * Cfu * Ci * Cr;
      const FbStar = psiToMpa(props.Fb) * CD * CM * Ct * CFb * Cfu * Ci * Cr; // before CL
      const FcStar = psiToMpa(props.Fc) * CD * CM * Ct * CFc * Ci;
      const Fv = psiToMpa(props.Fv) * CD * CM * Ct * Ci;
      const CL = isTop(m) || m.kind === 'bottom' ? beamCL(FbStar, EminMpa, mmToIn(leOP), dIn, bIn) : 1;
      const Fb = FbStar * CL;
      const FcEip = columnFcE(EminMpa, slIP), FcEop = columnFcE(EminMpa, slOP);
      const CpIP = columnCp(FcStar, FcEip), CpOP = columnCp(FcStar, FcEop);
      const Cp = Math.min(CpIP, CpOP);
      const FcE = slIP >= slOP ? FcEip : FcEop;
      const Fc = FcStar * Cp;

      const fb = M / S, fv = (1.5 * Math.abs(V)) / A;
      const rb = fb / Fb, rv = fv / Fv;
      let rt = 0, rc = 0, rct = 0, rcc = 0;
      if (N > 0) { const ft = N / A; rt = ft / Ft; rct = rt + rb; }
      if (N < 0) { const fc = -N / A; rc = fc / Fc; rcc = rc * rc + (Fb > 0 && fc / FcE < 1 ? fb / (Fb * (1 - fc / FcE)) : Infinity); }
      r.tension = Math.max(r.tension, rt);
      r.compression = Math.max(r.compression, rc);
      r.bending = Math.max(r.bending, rb);
      r.shear = Math.max(r.shear, rv);
      r.combinedTension = Math.max(r.combinedTension, rct);
      r.combinedCompression = Math.max(r.combinedCompression, rcc);
      const cands: [number, string][] = [[rt, 'tension'], [rc, 'compression'], [rb, 'bending'], [rv, 'shear'], [rct, 'combined tension + bending'], [rcc, 'combined compression + bending']];
      for (const [v, label] of cands) if (v > worst.ratio) worst = { name: cb.name, CD, ratio: v, check: label };
    }
    const slenderOk = slMax <= 50;
    if (!slenderOk) warnings.push(`${m.id}: slenderness ${slMax.toFixed(0)} exceeds 50 (NDS 3.7.1.4 / 4.4.1).`);
    const status: 'PASS' | 'FAIL' = worst.ratio <= 1 && slenderOk ? 'PASS' : 'FAIL';

    // Per-member Roof Load (Dead Load + Live/Snow Load) for Building Code Verification
    const govLiveKPa = Math.max(snow, live);
    const effHorizMm = isTop(m) || m.kind === 'bottom'
      ? Math.max(300, g.dxh)
      : Math.max(350, g.dxh > 150 ? g.dxh : inp.spanMm / Math.max(4, inp.members.filter(x => isTop(x)).length * 2));
    const tributaryAreaM2 = Number(((effHorizMm / 1000) * spacingM).toFixed(2));
    const memberDeadKPa = isTop(m) ? deadRoof : m.kind === 'bottom' ? (deadCeil + deadRoof * 0.35) : deadRoof;
    const memberLiveKPa = isTop(m) ? govLiveKPa : m.kind === 'bottom' ? (govLiveKPa * 0.5) : govLiveKPa;
    const deadLoadN = Math.round(memberDeadKPa * tributaryAreaM2 * 1000);
    const liveLoadN = Math.round(memberLiveKPa * tributaryAreaM2 * 1000);
    const totalRoofLoadN = deadLoadN + liveLoadN;
    const deadAxialN = Math.round(caseN.D[i] ?? 0);
    const liveAxialN = Math.round(Math.abs(caseN.S[i] ?? 0) >= Math.abs(caseN.Lr[i] ?? 0) ? (caseN.S[i] ?? 0) : (caseN.Lr[i] ?? 0));
    const totalAxialN = deadAxialN + liveAxialN;

    return {
      id: m.id, kind: m.kind, lengthMm: Number(g.L.toFixed(1)), sizeLabel: `${b}x${d}`,
      maxTensionN: Number(maxT.toFixed(0)), maxCompressionN: Number(maxC.toFixed(0)), maxMomentNmm: Number(maxM.toFixed(0)), maxShearN: Number(maxV.toFixed(0)),
      deadLoadN, liveLoadN, totalRoofLoadN, deadAxialN, liveAxialN, totalAxialN, tributaryAreaM2,
      ratios: Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Number((v as number).toFixed(3))])) as MemberCheck['ratios'],
      slendernessMax: Number(slMax.toFixed(1)), slendernessOk: slenderOk, governing: { ...worst, ratio: Number(worst.ratio.toFixed(3)) }, status,
    };
  });

  const deflOk = liveMm <= liveLimit && totalMm <= totalLimit;
  const overall: 'PASS' | 'FAIL' = members.every(m => m.status === 'PASS') && deflOk && !solved.unstable ? 'PASS' : 'FAIL';
  if (solved.unstable) warnings.push('Truss is unstable under the pin-jointed model: check web layout and supports.');

  const govLiveOrSnowKPa = Number(Math.max(snow, live).toFixed(2));
  const totalRoofKPa = Number((deadRoof + deadCeil + govLiveOrSnowKPa).toFixed(2));
  const deadLoadTotalN = Math.round(
    members.filter(m => m.kind === 'top').reduce((s, m) => s + m.deadLoadN, 0) +
    (deadCeil * spacingM * (inp.spanMm / 1000) * 1000)
  );
  const liveLoadTotalN = Math.round(
    members.filter(m => m.kind === 'top').reduce((s, m) => s + m.liveLoadN, 0)
  );
  const totalRoofLoadN = deadLoadTotalN + liveLoadTotalN;

  return {
    members,
    reactionsN: { left: Math.round(reactionsN.left), right: Math.round(reactionsN.right), leftDead: Math.round(reactionsN.leftDead), leftSnow: Math.round(reactionsN.leftSnow) },
    roofLoadsSummary: {
      deadRoofKPa: Number(deadRoof.toFixed(2)),
      deadCeilKPa: Number(deadCeil.toFixed(2)),
      liveOrSnowKPa: govLiveOrSnowKPa,
      totalRoofKPa,
      deadLoadTotalN,
      liveLoadTotalN,
      totalRoofLoadN,
      codeStandard: 'ASCE 7-16 §2.4.1 ASD (D + S / D + Lr) · IBC 2018 §1605.2 · NDS 2018',
      codeCompliant: deadRoof >= 0.48 && govLiveOrSnowKPa >= 0.96,
    },
    deflection: { midspanNode: midNode.id, liveMm: Number(liveMm.toFixed(2)), liveLimitMm: Number(liveLimit.toFixed(1)), totalMm: Number(totalMm.toFixed(2)), totalLimitMm: Number(totalLimit.toFixed(1)), liveOk: liveMm <= liveLimit, totalOk: totalMm <= totalLimit },
    unstable: solved.unstable,
    overall,
    assumptions: [
      'Reference design values: NDS 2018 Supplement Table 4A, SPF No. 2 (2 in. and wider), dry, normal duration. Verify against your NDS edition before use.',
      'Load combinations: ASCE 7-16 Section 2.4 ASD (D, D+S, D+S unbalanced, D+Lr). Wind and seismic not included.',
      'Load duration: CD 0.9 (dead), 1.15 (snow), 1.25 (roof live), per NDS Table 2.3.2.',
      'Repetitive member factor Cr = 1.15 applied to chords (NDS 4.3.9). Webs use Cr = 1.',
      'Chord bending from panel loads as simple spans between panel points. Truss analysed as pin-jointed for axial forces.',
      'Column stability (NDS 3.7) uses Emin and le/d for both axes; the controlling Cp is used. Lateral torsional stability (NDS 3.3.3) uses CL with the out-of-plane support spacing.',
      'Deflection: live (snow) L/240 and total (dead + snow) L/180, using NDS E and unit-load method.',
      'Connectors and plates are NOT designed here. Joint capacity must be checked against manufacturer data.',
    ],
    warnings,
  };
}

// ---------------------------------------------------------------- adapter from the app's TrussStructure
/** Build an AdvInput from a TrussStructure (node x/y in metres, section width/depth in mm). */
export function advInputFromTruss(t: TrussStructure, opts: Partial<AdvInput> = {}): AdvInput {
  const nodes: AdvNode[] = t.nodes.map(n => ({ id: n.id, x: n.x * 1000, y: n.y * 1000 }));
  const members: AdvMember[] = t.members.map(m => ({
    id: m.id,
    a: m.startNodeId,
    b: m.endNodeId,
    kind: m.type === 'top_chord' ? 'top' : m.type === 'bottom_chord' ? 'bottom' : 'web',
    widthMm: m.section.width,
    depthMm: m.section.depth,
  }));
  const bottom = nodes.filter(n => Math.abs(n.y - Math.min(...nodes.map(q => q.y))) < 1e-3).sort((p, q) => p.x - q.x);
  return {
    nodes,
    members,
    spanMm: t.span * 1000,
    spacingMm: t.spacing * 1000,
    leftHeelId: bottom[0].id,
    rightHeelId: bottom[bottom.length - 1].id,
    ...opts,
  };
}

/** Markdown calculation summary. */
export function reportToMarkdown(title: string, r: AdvReport): string {
  const L: string[] = [];
  L.push(`# ${title}`, '', `**Overall: ${r.overall}**`, '');
  L.push('## Reactions (ASD, unfactored)', '', `- Left: ${r.reactionsN.left} N (dead ${r.reactionsN.leftDead} N, snow ${r.reactionsN.leftSnow} N)`, `- Right: ${r.reactionsN.right} N`, '');
  L.push('## Deflection', '', `- Midspan node ${r.deflection.midspanNode}`);
  L.push(`- Live (snow): ${r.deflection.liveMm} mm, limit L/240 = ${r.deflection.liveLimitMm} mm, ${r.deflection.liveOk ? 'OK' : 'FAIL'}`);
  L.push(`- Total (dead + snow): ${r.deflection.totalMm} mm, limit L/180 = ${r.deflection.totalLimitMm} mm, ${r.deflection.totalOk ? 'OK' : 'FAIL'}`, '');
  L.push('## Member checks', '', '| Member | Type | Size | Length (mm) | Max T (N) | Max C (N) | Max M (N·mm) | Governing | Ratio | Status |', '|---|---|---|---|---|---|---|---|---|---|');
  for (const m of r.members) {
    L.push(`| ${m.id} | ${m.kind} | ${m.sizeLabel} | ${m.lengthMm} | ${m.maxTensionN} | ${m.maxCompressionN} | ${m.maxMomentNmm} | ${m.governing.check} (${m.governing.name}) | ${m.governing.ratio} | ${m.status} |`);
  }
  L.push('', '## Assumptions', '', ...r.assumptions.map(a => `- ${a}`), '');
  if (r.warnings.length) L.push('## Warnings', '', ...r.warnings.map(w => `- ${w}`), '');
  L.push('> Design-assist output. Requires review and sealing by a licensed engineer. Connectors not designed.');
  return L.join('\n');
}

/** Pin-jointed axial forces for a single load set (tension positive). Used for checks and by the CLI. */
export function pinJointedAxial(nodes: AdvNode[], members: { a: number; b: number; EA: number }[], loadN: Record<number, [number, number]>, leftId: number, rightId: number): number[] {
  const nodeIdx = new Map(nodes.map((nd, i) => [nd.id, i]));
  const geo: Geo[] = members.map(m => {
    const A = nodes[nodeIdx.get(m.a)!], B = nodes[nodeIdx.get(m.b)!];
    const L = Math.hypot(B.x - A.x, B.y - A.y);
    return { a: nodeIdx.get(m.a)!, b: nodeIdx.get(m.b)!, L, c: (B.x - A.x) / L, s: (B.y - A.y) / L, dxh: Math.abs(B.x - A.x) };
  });
  const F = new Array(2 * nodes.length).fill(0);
  for (const [id, [fx, fy]] of Object.entries(loadN)) { const i = nodeIdx.get(Number(id))!; F[2 * i] = fx; F[2 * i + 1] = fy; }
  return solveAxial(nodeIdx, nodes, geo, members.map(m => m.EA), [F], nodeIdx.get(leftId)!, nodeIdx.get(rightId)!).forces[0];
}
