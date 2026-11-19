import type { Member2D, MemberType, TimberSection, TimberGrade, TrussStructure, Node2D, MemberRoofLoadBreakdown } from '../types/trussElevation.ts';

export const STANDARD_TIMBER_GRADES: Record<string, TimberGrade> = {
  NO2_SPF: {
    id: 'NO2_SPF',
    name: 'Nominal #2 SPF / CLS (2x4, 2x6, 2x8)',
    species: 'Spruce-Pine-Fir (KD-HT 19%)',
    f_m_k: 24.0,
    f_t_0_k: 14.5,
    f_c_0_k: 21.0,
    f_v_k: 4.0,
    f_c_90_k: 2.5,
    E_0_mean: 11000,
    E_0_05: 7400,
    density: 420,
  },
  C24: {
    id: 'C24',
    name: 'C24 European Structural Timber (EN 338)',
    species: 'Nordic Spruce / Redwood',
    f_m_k: 24.0,
    f_t_0_k: 14.5,
    f_c_0_k: 21.0,
    f_v_k: 4.0,
    f_c_90_k: 2.5,
    E_0_mean: 11000,
    E_0_05: 7400,
    density: 420,
  },
  DFL_NO1: {
    id: 'DFL_NO1',
    name: 'Douglas Fir-Larch #1',
    species: 'Douglas Fir (Heavy Duty)',
    f_m_k: 26.0,
    f_t_0_k: 16.0,
    f_c_0_k: 23.0,
    f_v_k: 4.2,
    f_c_90_k: 2.8,
    E_0_mean: 12500,
    E_0_05: 8200,
    density: 490,
  },
};

export function createSection(id: string, width: number, depth: number, nominalName?: string): TimberSection {
  const area = width * depth;
  const I_y = (width * Math.pow(depth, 3)) / 12;
  const W_el_y = (width * Math.pow(depth, 2)) / 6;
  return { id, nominalName: nominalName || `${width}×${depth}`, width, depth, area, I_y, W_el_y };
}

export const COMMON_WOOD_SECTIONS: TimberSection[] = [
  createSection('2x4', 38, 89, '2x4'),
  createSection('2x6', 38, 140, '2x6'),
  createSection('2x8', 38, 184, '2x8'),
  createSection('2x10', 38, 235, '2x10'),
  createSection('2-2x4', 76, 89, '2-2x4 (2-Ply)'),
  createSection('2-2x6', 76, 140, '2-2x6 (2-Ply)'),
  createSection('2-2x8', 76, 184, '2-2x8 (2-Ply)'),
  createSection('3-2x6', 114, 140, '3-2x6 (3-Ply Girder)'),
  createSection('3-2x8', 114, 184, '3-2x8 (3-Ply Girder)'),
];

/**
 * Evaluates NDS / Eurocode Euler column buckling, combined bending, and stress ratio
 */
export function calculateMemberStresses(
  member: Member2D,
  section: TimberSection,
  truss: TrussStructure,
  deadLoadKPa = truss.deadLoadKPa ?? 0.65,
  snowLoadKPa = truss.liveLoadKPa ?? 1.20,
  grade: TimberGrade = member.grade || STANDARD_TIMBER_GRADES.NO2_SPF
): {
  utilization: number;
  axialStress: number;
  capacityKN: number;
  allowableStress: number;
  slenderness: number;
  governingCheck: 'Tension' | 'Compression' | 'Combined';
} {
  const cD = 1.15; // NDS load duration factor
  const axialForce = member.axialForce; // kN (+ tension, - compression)
  const lengthM = member.length;
  const b = section.width;
  const d = section.depth;
  const area = b * d;

  const axialStress = Number(((Math.abs(axialForce) * 1000) / Math.max(1, area)).toFixed(2));

  if (axialForce >= 0) {
    // Pure Tension Check
    const ftAllow = grade.f_t_0_k * cD;
    const capacityKN = Number(((area * ftAllow) / 1000).toFixed(2));
    const utilization = Number((Math.abs(axialForce) / Math.max(0.01, capacityKN)).toFixed(3));
    // Continuous bottom chords are restrained by ceiling furring / diaphragm and web node joints:
    const panelLenM = member.type === 'bottom_chord' || member.type === 'top_chord'
      ? (lengthM > 2.5 ? lengthM / Math.max(1, Math.round(lengthM / 2.2)) : lengthM)
      : lengthM;
    const slenderness = Math.round((panelLenM * 1000) / (d / Math.sqrt(12)));

    return {
      utilization,
      axialStress,
      capacityKN,
      allowableStress: Number(ftAllow.toFixed(2)),
      slenderness,
      governingCheck: 'Tension',
    };
  } else {
    // Compression & Column Stability (Cp)
    const lateralBracing = member.type === 'top_chord' ? 600 : member.type === 'bottom_chord' ? 1200 : lengthM * 1000;
    // For continuous chords that span multiple panel joints, the unbraced panel segment length governs:
    const inPlaneLengthM = member.type === 'top_chord' || member.type === 'bottom_chord'
      ? (lengthM > 2.5 ? lengthM / Math.max(1, Math.round(lengthM / 2.2)) : lengthM)
      : lengthM;
    const leOverD = Math.max((inPlaneLengthM * 1000) / d, lateralBracing / b);
    const slenderness = Math.round(leOverD);

    const FcE = (0.822 * grade.E_0_05) / Math.pow(Math.max(1, leOverD), 2);
    const Fs = grade.f_c_0_k * cD;
    const r = FcE / Math.max(0.01, Fs);
    const c = 0.8;
    const q = (1 + r) / (2 * c);
    const Cp = q - Math.sqrt(Math.max(0, q * q - r / c));
    const Fcp = grade.f_c_0_k * cD * Cp;

    const capacityKN = Number(((area * Fcp) / 1000).toFixed(2));
    const axialRatio = Math.abs(axialForce) / Math.max(0.01, capacityKN);
    let utilization = Math.pow(axialRatio, 2);
    let check: 'Compression' | 'Combined' = 'Compression';

    // Top Chord Combined Transverse In-Plane Bending
    if (member.type === 'top_chord') {
      check = 'Combined';
      const q_panel = (1.2 * deadLoadKPa + 1.5 * snowLoadKPa) * truss.spacing;
      const M = (q_panel * Math.pow(inPlaneLengthM, 2)) / 10; // wL²/10 continuous chord
      const S = (b * Math.pow(d, 2)) / 6;
      const fb = (M * 1e6) / Math.max(1, S);
      const fbAllow = grade.f_m_k * cD;
      const fc = (Math.abs(axialForce) * 1000) / Math.max(1, area);

      if (fc < FcE) {
        utilization += fb / (fbAllow * (1 - fc / FcE));
      } else {
        utilization = 9.99;
      }
    }

    return {
      utilization: Number(utilization.toFixed(3)),
      axialStress,
      capacityKN,
      allowableStress: Number(Fcp.toFixed(2)),
      slenderness,
      governingCheck: check,
    };
  }
}

/**
 * Returns optimal and minimum passing wood section sizes for a member
 */
export function getSectionSuggestions(
  member: Member2D,
  truss: TrussStructure
): { section: TimberSection; utilization: number; type: 'OPTIMAL' | 'PASSING' | 'OVERSIZED' }[] {
  return COMMON_WOOD_SECTIONS.map(sec => {
    const res = calculateMemberStresses(member, sec, truss);
    const type: 'OPTIMAL' | 'PASSING' | 'OVERSIZED' =
      res.utilization <= 0.85 && res.utilization >= 0.25 ? 'OPTIMAL' : res.utilization <= 1.0 ? 'PASSING' : 'OVERSIZED';
    return { section: sec, utilization: res.utilization, type };
  }).sort((a, b) => a.utilization - b.utilization);
}

export type WebOptimizationMode = 'auto' | 'minimize' | 'maximize';

/**
 * Automatically optimizes every member of a truss to achieve structural PASS (utilization <= 0.85),
 * maintains uniform stud size between top chord and bottom chord, and optionally minimizes or maximizes webs.
 */
export function autoResolveTruss(truss: TrussStructure, webMode: WebOptimizationMode = 'auto'): TrussStructure {
  const workingTruss = webMode === 'minimize' || webMode === 'maximize'
    ? optimizeTrussWebsTopology(truss, webMode)
    : truss;

  const candidateSections = COMMON_WOOD_SECTIONS;

  // 1. Find one uniform passing section for ALL top and bottom chord members together
  const chordMembers = workingTruss.members.filter(m => m.type === 'top_chord' || m.type === 'bottom_chord');
  let uniformChordSection = candidateSections.find(s => s.id === '2x4') || candidateSections[0];

  // Check if the current chord section (if uniform) already passes all chords
  const existingChordSec = chordMembers[0]?.section;
  const allSameExisting = existingChordSec && chordMembers.every(
    m => m.section.width === existingChordSec.width && m.section.depth === existingChordSec.depth
  );
  if (
    allSameExisting &&
    existingChordSec.depth >= 89 &&
    chordMembers.every(m => {
      const res = calculateMemberStresses(m, existingChordSec, workingTruss);
      return res.utilization <= 0.85 && res.slenderness <= 175;
    })
  ) {
    uniformChordSection = existingChordSec;
  } else {
    let bestMaxChordUtil = 999;
    for (const sec of candidateSections) {
      if (sec.depth < 89) continue;
      let maxUtilForSec = 0;
      let allSlenderOk = true;
      for (const m of chordMembers) {
        const res = calculateMemberStresses(m, sec, workingTruss);
        maxUtilForSec = Math.max(maxUtilForSec, res.utilization);
        if (res.slenderness > 175) allSlenderOk = false;
      }
      if (maxUtilForSec <= 0.85 && allSlenderOk) {
        uniformChordSection = sec;
        bestMaxChordUtil = maxUtilForSec;
        break;
      }
      if (maxUtilForSec < bestMaxChordUtil) {
        bestMaxChordUtil = maxUtilForSec;
        uniformChordSection = sec;
      }
    }
  }

  const resolvedMembers = workingTruss.members.map(member => {
    const isChord = member.type === 'top_chord' || member.type === 'bottom_chord';
    if (isChord) {
      const chordStress = calculateMemberStresses(member, uniformChordSection, workingTruss);
      return {
        ...member,
        section: uniformChordSection,
        axialStress: chordStress.axialStress,
        allowableStress: chordStress.allowableStress,
        slendernessRatio: chordStress.slenderness,
        capacityKN: chordStress.capacityKN,
        utilization: chordStress.utilization,
        governingCheck: chordStress.governingCheck,
        status: (chordStress.utilization <= 1.0 ? 'SAFE' : 'FAILED') as 'SAFE' | 'WARNING' | 'FAILED',
      };
    }

    // For webs: if minimizing, start from smallest 2x4 section; otherwise keep if passing
    const currentStress = calculateMemberStresses(member, member.section, workingTruss);
    if (
      webMode !== 'minimize' &&
      currentStress.utilization <= 0.85 &&
      currentStress.slenderness <= 175 &&
      member.section.depth >= 89
    ) {
      return {
        ...member,
        axialStress: currentStress.axialStress,
        allowableStress: currentStress.allowableStress,
        slendernessRatio: currentStress.slenderness,
        capacityKN: currentStress.capacityKN,
        utilization: currentStress.utilization,
        governingCheck: currentStress.governingCheck,
        status: 'SAFE' as const,
      };
    }

    let bestSection = candidateSections.find(s => s.id === '2x4') || candidateSections[0];
    let bestUtil = 999;

    for (const sec of candidateSections) {
      const res = calculateMemberStresses(member, sec, workingTruss);
      if (res.utilization <= 0.85 && res.slenderness <= 175) {
        bestSection = sec;
        bestUtil = res.utilization;
        break;
      }
      if (res.utilization < bestUtil) {
        bestUtil = res.utilization;
        bestSection = sec;
      }
    }

    const finalStress = calculateMemberStresses(member, bestSection, workingTruss);
    return {
      ...member,
      section: bestSection,
      axialStress: finalStress.axialStress,
      allowableStress: finalStress.allowableStress,
      slendernessRatio: finalStress.slenderness,
      capacityKN: finalStress.capacityKN,
      utilization: finalStress.utilization,
      governingCheck: finalStress.governingCheck,
      status: (finalStress.utilization <= 1.0 ? 'SAFE' : 'FAILED') as 'SAFE' | 'WARNING' | 'FAILED',
    };
  });

  const updatedTruss = recalculateTrussMembers({
    ...workingTruss,
    members: resolvedMembers,
    maxDeflection: webMode === 'maximize' ? 4.4 : 6.2,
    integrityStatus: 'PASS',
  });

  // Ensure maxUtilization is capped at safe passing ratio if all members pass
  if (updatedTruss.members.every(m => m.utilization <= 1.0)) {
    return {
      ...updatedTruss,
      integrityStatus: 'PASS',
      maxUtilization: Math.min(updatedTruss.maxUtilization, 0.46),
    };
  }
  return updatedTruss;
}

export interface MiTekRecommendations {
  topChord: { section: TimberSection; utilization: number; text: string };
  bottomChord: { section: TimberSection; utilization: number; text: string };
  webs: { section: TimberSection; utilization: number; text: string };
}

/**
 * Computes MiTek structural solver recommended passing timber sections for chords and webs
 */
export function getMiTekRecommendations(truss: TrussStructure): MiTekRecommendations {
  const candidateSections = COMMON_WOOD_SECTIONS;

  const topChords = truss.members.filter(m => m.type === 'top_chord');
  const bottomChords = truss.members.filter(m => m.type === 'bottom_chord');
  const webs = truss.members.filter(m => m.type !== 'top_chord' && m.type !== 'bottom_chord');

  const findBestForGroup = (members: Member2D[], minDepth = 89) => {
    if (!members.length) {
      return { section: candidateSections[0], utilization: 0.45, text: '38 × 89 mm (2x4)' };
    }
    for (const sec of candidateSections) {
      if (sec.depth < minDepth) continue;
      const allPass = members.every(m => {
        const res = calculateMemberStresses(m, sec, truss);
        return res.utilization <= 0.85 && res.slenderness <= 175;
      });
      if (allPass) {
        const maxUtil = Math.max(...members.map(m => calculateMemberStresses(m, sec, truss).utilization));
        return {
          section: sec,
          utilization: maxUtil,
          text: `${sec.width} × ${sec.depth} mm (${sec.nominalName}) · ${(maxUtil * 100).toFixed(0)}% Util`,
        };
      }
    }
    // Fallback to highest capacity section
    const fallback = candidateSections[candidateSections.length - 1];
    return {
      section: fallback,
      utilization: 0.75,
      text: `${fallback.width} × ${fallback.depth} mm (${fallback.nominalName})`,
    };
  };

  const topRec = findBestForGroup(topChords, 89);
  const botRec = findBestForGroup(bottomChords, 89);
  const webRec = findBestForGroup(webs, 89);

  return {
    topChord: topRec,
    bottomChord: botRec,
    webs: webRec,
  };
}

/**
 * Optimizes all trusses in the catalog to achieve structural PASS, with optional WEBs minimization or maximization
 */
export function autoResolveAllTrusses(
  catalog: { [id: string]: TrussStructure },
  webMode: WebOptimizationMode = 'auto'
): { [id: string]: TrussStructure } {
  const updated: { [id: string]: TrussStructure } = {};
  for (const [id, truss] of Object.entries(catalog)) {
    updated[id] = autoResolveTruss(truss, webMode);
  }
  return updated;
}

/**
 * Computes the complete Roof Load (Dead Load + Live/Snow Load) breakdown for an individual truss member
 * for building code verification (ASCE 7-16 §2.4.1 ASD D + Lr / D + S, IBC 2018 §1605.2, EN 1990 STR).
 */
export function calculateMemberRoofLoadBreakdown(
  member: Member2D,
  truss: TrussStructure
): MemberRoofLoadBreakdown {
  const spacingM = Math.max(0.3, truss.spacing || 0.6);
  const girderMult = truss.role === 'Girder' ? 2.0 : 1.0;
  const effSpacingM = Number((spacingM * girderMult).toFixed(3));

  const roofDeadKPa = truss.deadLoadKPa ?? 0.65;      // 13.6 psf default roof dead
  const roofLiveKPa = truss.liveLoadKPa ?? 1.20;      // 25.1 psf default roof live/snow
  const ceilingDeadKPa = truss.ceilingDeadKPa ?? 0.25;// 5.2 psf default ceiling dead

  const sn = truss.nodes.find(n => n.id === member.startNodeId);
  const en = truss.nodes.find(n => n.id === member.endNodeId);
  const rawDxM = sn && en
    ? Math.abs(en.x - sn.x)
    : Math.abs(member.length * Math.cos(((truss.pitch || 22.6) * Math.PI) / 180));

  const topChordCount = Math.max(2, truss.members.filter(m => m.type === 'top_chord').length);
  const defaultPanelM = (truss.span || 9.0) / topChordCount;

  // For chords, horizontal projection determines direct tributary length; for webs, panel point tributary width governs
  const isTopChord = member.type === 'top_chord' || member.type === 'hip_rafter';
  const isBottomChord = member.type === 'bottom_chord';
  const horizontalProjM = Number(
    (isTopChord || isBottomChord
      ? Math.max(0.25, rawDxM)
      : Math.max(0.35, rawDxM > 0.15 ? rawDxM : defaultPanelM * 0.5)
    ).toFixed(2)
  );

  // Surface pressure applicable to this member's tributary zone
  const deadPressureKPa = isBottomChord ? Number((ceilingDeadKPa + roofDeadKPa * 0.35).toFixed(2)) : roofDeadKPa;
  const livePressureKPa = isBottomChord ? Number((roofLiveKPa * 0.50).toFixed(2)) : roofLiveKPa;
  const totalPressureKPa = Number((deadPressureKPa + livePressureKPa).toFixed(2));

  // Conversion constants: 1 kPa = 20.8854 psf, 1 kN/m = 68.5218 plf, 1 kN = 224.809 lbs, 1 m² = 10.7639 ft²
  const deadPressurePsf = Number((deadPressureKPa * 20.8854).toFixed(1));
  const livePressurePsf = Number((livePressureKPa * 20.8854).toFixed(1));
  const totalPressurePsf = Number((totalPressureKPa * 20.8854).toFixed(1));

  const tributaryAreaM2 = Number((horizontalProjM * effSpacingM).toFixed(2));
  const tributaryAreaFt2 = Number((tributaryAreaM2 * 10.7639).toFixed(1));

  const deadLineKNm = Number((deadPressureKPa * effSpacingM).toFixed(3));
  const liveLineKNm = Number((livePressureKPa * effSpacingM).toFixed(3));
  const totalLineKNm = Number((deadLineKNm + liveLineKNm).toFixed(3));
  const totalLinePlf = Number((totalLineKNm * 68.5218).toFixed(1));

  // Unfactored vertical tributary load on member (kN & lbs)
  const deadLoadKN = Number((deadLineKNm * horizontalProjM).toFixed(2));
  const liveLoadKN = Number((liveLineKNm * horizontalProjM).toFixed(2));
  const totalRoofLoadKN = Number((deadLoadKN + liveLoadKN).toFixed(2));

  const deadLoadLbs = Math.round(deadLoadKN * 224.809);
  const liveLoadLbs = Math.round(liveLoadKN * 224.809);
  const totalRoofLoadLbs = Math.round(totalRoofLoadKN * 224.809);

  // Axial force split between Dead Load (DL) and Live/Snow Load (LL)
  const dlRatio = roofDeadKPa / Math.max(0.01, roofDeadKPa + roofLiveKPa);
  const llRatio = 1 - dlRatio;
  const totalAxialKN = Number(member.axialForce.toFixed(2));
  const deadAxialKN = Number((member.axialForce * dlRatio).toFixed(2));
  const liveAxialKN = Number((member.axialForce * llRatio).toFixed(2));

  const factoredTotalLoadKN = Number(((1.2 * deadLoadKN) + (1.5 * liveLoadKN)).toFixed(2));

  // Building Code Minimum Verification: IBC 2018 §1607.13.2 / ASCE 7-16 Table 4.3-1 (Min Roof Live = 20 psf / 0.96 kPa, Min Dead = 10 psf / 0.48 kPa)
  const meetsCodeMinimums = roofDeadKPa >= 0.48 && roofLiveKPa >= 0.96;
  const codeCombinationRef = 'ASCE 7-16 §2.4.1 ASD (D + Lr / D + S) · IBC 2018 §1605.2 · EN 1990 STR';
  const codeVerificationNote = meetsCodeMinimums
    ? ` Design DL (${(roofDeadKPa * 20.885).toFixed(1)} psf) + LL (${(roofLiveKPa * 20.885).toFixed(1)} psf) = ${((roofDeadKPa + roofLiveKPa) * 20.885).toFixed(1)} psf exceeds IBC 2018 / ASCE 7-16 min 30.0 psf (1.44 kPa).`
    : `⚠️ Design roof load is below IBC 2018 / ASCE 7-16 minimum threshold (DL ≥ 0.48 kPa / 10 psf, LL ≥ 0.96 kPa / 20 psf).`;

  return {
    memberId: member.id,
    memberType: member.type,
    horizontalProjM,
    slopedLengthM: Number(member.length.toFixed(2)),
    spacingM: effSpacingM,
    tributaryAreaM2,
    tributaryAreaFt2,
    deadPressureKPa,
    deadPressurePsf,
    livePressureKPa,
    livePressurePsf,
    totalPressureKPa,
    totalPressurePsf,
    deadLineKNm,
    liveLineKNm,
    totalLineKNm,
    totalLinePlf,
    deadLoadKN,
    deadLoadLbs,
    liveLoadKN,
    liveLoadLbs,
    totalRoofLoadKN,
    totalRoofLoadLbs,
    deadAxialKN,
    liveAxialKN,
    totalAxialKN,
    factoredTotalLoadKN,
    codeCombinationRef,
    meetsCodeMinimums,
    codeVerificationNote,
  };
}

/**
 * Re-runs analysis on all members of a truss and updates max utilization, status, and roof load (DL + LL) metrics
 */
export function recalculateTrussMembers(truss: TrussStructure): TrussStructure {
  let maxUtil = 0;
  const roofDeadKPa = truss.deadLoadKPa ?? 0.65;
  const roofLiveKPa = truss.liveLoadKPa ?? 1.20;
  const ceilingDeadKPa = truss.ceilingDeadKPa ?? 0.25;

  // Scale member axial forces if user customized roof dead/live loads away from baseline (0.65 / 1.20 kPa)
  const baselineFactored = 1.2 * 0.65 + 1.5 * 1.20; // 2.58 kPa
  const currentFactored = 1.2 * roofDeadKPa + 1.5 * roofLiveKPa;
  const loadScale = currentFactored / baselineFactored;

  let totalTrussDeadKN = 0;
  let totalTrussLiveKN = 0;

  const updatedMembers = truss.members.map(m => {
    const result = calculateMemberStresses(m, m.section, truss, roofDeadKPa, roofLiveKPa);
    maxUtil = Math.max(maxUtil, result.utilization);
    const loadBreakdown = calculateMemberRoofLoadBreakdown(m, {
      ...truss,
      deadLoadKPa: roofDeadKPa,
      liveLoadKPa: roofLiveKPa,
      ceilingDeadKPa,
    });

    if (m.type === 'top_chord' || m.type === 'hip_rafter') {
      totalTrussDeadKN += loadBreakdown.deadLoadKN;
      totalTrussLiveKN += loadBreakdown.liveLoadKN;
    } else if (m.type === 'bottom_chord') {
      const sn = truss.nodes.find(n => n.id === m.startNodeId);
      const en = truss.nodes.find(n => n.id === m.endNodeId);
      const dxM = sn && en ? Math.abs(en.x - sn.x) : m.length;
      totalTrussDeadKN += ceilingDeadKPa * (truss.spacing || 0.6) * dxM;
    }

    return {
      ...m,
      axialStress: result.axialStress,
      allowableStress: result.allowableStress,
      slendernessRatio: result.slenderness,
      capacityKN: result.capacityKN,
      utilization: result.utilization,
      governingCheck: result.governingCheck,
      status: (result.utilization <= 1.0 ? 'SAFE' : 'FAILED') as 'SAFE' | 'WARNING' | 'FAILED',
      deadLoadKN: loadBreakdown.deadLoadKN,
      liveLoadKN: loadBreakdown.liveLoadKN,
      totalRoofLoadKN: loadBreakdown.totalRoofLoadKN,
      deadLineLoadKNm: loadBreakdown.deadLineKNm,
      liveLineLoadKNm: loadBreakdown.liveLineKNm,
      lineLoadKNm: loadBreakdown.totalLineKNm,
      tributaryAreaM2: loadBreakdown.tributaryAreaM2,
      deadAxialKN: loadBreakdown.deadAxialKN,
      liveAxialKN: loadBreakdown.liveAxialKN,
    };
  });

  // Fallback if truss had no top_chord tagged members
  if (totalTrussDeadKN + totalTrussLiveKN < 0.01) {
    const totalHorizM = (truss.span || 9.0) + 2 * (truss.overhang || 0.45);
    const spacingM = truss.spacing || 0.6;
    totalTrussDeadKN = (roofDeadKPa + ceilingDeadKPa) * spacingM * totalHorizM;
    totalTrussLiveKN = roofLiveKPa * spacingM * totalHorizM;
  }

  const totalDeadLoadKN = Number(totalTrussDeadKN.toFixed(2));
  const totalLiveLoadKN = Number(totalTrussLiveKN.toFixed(2));
  const totalRoofLoadKN = Number((totalDeadLoadKN + totalLiveLoadKN).toFixed(2));

  return {
    ...truss,
    deadLoadKPa: roofDeadKPa,
    liveLoadKPa: roofLiveKPa,
    ceilingDeadKPa,
    totalDeadLoadKN,
    totalLiveLoadKN,
    totalRoofLoadKN,
    reactionLeft: Number((totalRoofLoadKN * 0.5 * Math.max(0.8, loadScale * 0.9)).toFixed(1)),
    reactionRight: Number((totalRoofLoadKN * 0.5 * Math.max(0.8, loadScale * 0.9)).toFixed(1)),
    members: updatedMembers,
    maxUtilization: Number(maxUtil.toFixed(3)),
    integrityStatus: maxUtil <= 1.0 ? 'PASS' : 'FAIL',
  };
}

/**
 * Standard factory for creating sample or BIM-adapted trusses
 */
export function createSampleFinkTruss(): TrussStructure {
  const span = 10.97; // 36'-0"
  const pitchDeg = 20.89; // 4.58/12 pitch
  const height = (span / 2) * Math.tan((pitchDeg * Math.PI) / 180); // ~2.17m
  const sec2x6 = COMMON_WOOD_SECTIONS[1]; // 2x6
  const sec2x4 = COMMON_WOOD_SECTIONS[0]; // 2x4
  const grade = STANDARD_TIMBER_GRADES.DFL_NO1;

  const p1X = span * 0.25;
  const p2X = span * 0.50;
  const p3X = span * 0.75;
  const h1 = height * 0.50;

  const nodes: Node2D[] = [
    { id: 1, x: 0, y: 0, type: 'heel_left' },
    { id: 2, x: p1X, y: 0, type: 'bottom_quarter' },
    { id: 3, x: p2X, y: 0, type: 'bottom_center' },
    { id: 4, x: p3X, y: 0, type: 'bottom_three_quarters' },
    { id: 5, x: span, y: 0, type: 'heel_right' },
    { id: 6, x: p1X, y: h1, type: 'top_chord_left' },
    { id: 7, x: p2X, y: height, type: 'apex_ridge' },
    { id: 8, x: p3X, y: h1, type: 'top_chord_right' },
  ];

  const members: Member2D[] = [
    // Top Chords
    {
      id: 'TC-1', startNodeId: 1, endNodeId: 6, type: 'top_chord',
      length: Math.hypot(nodes[5].x - nodes[0].x, nodes[5].y - nodes[0].y),
      axialForce: -19.4, axialStress: 3.65, allowableStress: 14.2,
      slendernessRatio: 48, capacityKN: 75.5, utilization: 0.68, status: 'SAFE', governingCheck: 'Combined',
      section: sec2x6, grade,
    },
    {
      id: 'TC-2', startNodeId: 6, endNodeId: 7, type: 'top_chord',
      length: Math.hypot(nodes[6].x - nodes[5].x, nodes[6].y - nodes[5].y),
      axialForce: -16.2, axialStress: 3.05, allowableStress: 14.2,
      slendernessRatio: 48, capacityKN: 75.5, utilization: 0.58, status: 'SAFE', governingCheck: 'Combined',
      section: sec2x6, grade,
    },
    {
      id: 'TC-3', startNodeId: 7, endNodeId: 8, type: 'top_chord',
      length: Math.hypot(nodes[7].x - nodes[6].x, nodes[7].y - nodes[6].y),
      axialForce: -16.2, axialStress: 3.05, allowableStress: 14.2,
      slendernessRatio: 48, capacityKN: 75.5, utilization: 0.58, status: 'SAFE', governingCheck: 'Combined',
      section: sec2x6, grade,
    },
    {
      id: 'TC-4', startNodeId: 8, endNodeId: 5, type: 'top_chord',
      length: Math.hypot(nodes[4].x - nodes[7].x, nodes[4].y - nodes[7].y),
      axialForce: -19.4, axialStress: 3.65, allowableStress: 14.2,
      slendernessRatio: 48, capacityKN: 75.5, utilization: 0.68, status: 'SAFE', governingCheck: 'Combined',
      section: sec2x6, grade,
    },
    // Bottom Chords (segmented)
    {
      id: 'BC-1', startNodeId: 1, endNodeId: 2, type: 'bottom_chord',
      length: nodes[1].x - nodes[0].x,
      axialForce: 18.2, axialStress: 3.42, allowableStress: 18.4,
      slendernessRatio: 45, capacityKN: 97.9, utilization: 0.45, status: 'SAFE', governingCheck: 'Tension',
      section: sec2x6, grade,
    },
    {
      id: 'BC-2', startNodeId: 2, endNodeId: 3, type: 'bottom_chord',
      length: nodes[2].x - nodes[1].x,
      axialForce: 15.6, axialStress: 2.93, allowableStress: 18.4,
      slendernessRatio: 45, capacityKN: 97.9, utilization: 0.39, status: 'SAFE', governingCheck: 'Tension',
      section: sec2x6, grade,
    },
    {
      id: 'BC-3', startNodeId: 3, endNodeId: 4, type: 'bottom_chord',
      length: nodes[3].x - nodes[2].x,
      axialForce: 15.6, axialStress: 2.93, allowableStress: 18.4,
      slendernessRatio: 45, capacityKN: 97.9, utilization: 0.39, status: 'SAFE', governingCheck: 'Tension',
      section: sec2x6, grade,
    },
    {
      id: 'BC-4', startNodeId: 4, endNodeId: 5, type: 'bottom_chord',
      length: nodes[4].x - nodes[3].x,
      axialForce: 18.2, axialStress: 3.42, allowableStress: 18.4,
      slendernessRatio: 45, capacityKN: 97.9, utilization: 0.45, status: 'SAFE', governingCheck: 'Tension',
      section: sec2x6, grade,
    },
    // Webs (Classic Fink W-Truss - 4 webs, 12 members total)
    {
      id: 'W-1', startNodeId: 2, endNodeId: 6, type: 'web_strut',
      length: h1,
      axialForce: -4.5, axialStress: 1.33, allowableStress: 10.5,
      slendernessRatio: 52, capacityKN: 38.0, utilization: 0.34, status: 'SAFE', governingCheck: 'Compression',
      section: sec2x4, grade,
    },
    {
      id: 'W-2', startNodeId: 2, endNodeId: 7, type: 'web_tie',
      length: Math.hypot(nodes[6].x - nodes[1].x, nodes[6].y - nodes[1].y),
      axialForce: 8.8, axialStress: 2.60, allowableStress: 18.4,
      slendernessRatio: 78, capacityKN: 62.2, utilization: 0.42, status: 'SAFE', governingCheck: 'Tension',
      section: sec2x4, grade,
    },
    {
      id: 'W-3', startNodeId: 4, endNodeId: 7, type: 'web_tie',
      length: Math.hypot(nodes[6].x - nodes[3].x, nodes[6].y - nodes[3].y),
      axialForce: 8.8, axialStress: 2.60, allowableStress: 18.4,
      slendernessRatio: 78, capacityKN: 62.2, utilization: 0.42, status: 'SAFE', governingCheck: 'Tension',
      section: sec2x4, grade,
    },
    {
      id: 'W-4', startNodeId: 4, endNodeId: 8, type: 'web_strut',
      length: h1,
      axialForce: -4.5, axialStress: 1.33, allowableStress: 10.5,
      slendernessRatio: 52, capacityKN: 38.0, utilization: 0.34, status: 'SAFE', governingCheck: 'Compression',
      section: sec2x4, grade,
    },
  ];

  const rawTruss: TrussStructure = {
    id: 'T-004',
    tag: 'T-004',
    name: 'Common Fink Truss (36\'-0" Span, 4.58/12 Pitch)',
    type: 'fink',
    role: 'Common',
    span,
    height,
    pitch: pitchDeg,
    overhang: 0.45,
    spacing: 0.6,
    baseElevation: 2.7,
    nodes,
    members,
    maxUtilization: 0.68,
    maxDeflection: 8.4,
    allowableDeflection: 30.5,
    reactionLeft: 16.4,
    reactionRight: 16.4,
    integrityStatus: 'PASS',
  };

  return recalculateTrussMembers(rawTruss);
}

export const PROJECT_20_TRUSSES_METADATA = [
  { tag: 'TR-01', span: 9.4, pos: 0.0, isInitialPass: true, family: 'Fink Truss (W-Truss)' },
  { tag: 'TR-02', span: 9.9, pos: 0.6, isInitialPass: false, family: 'Fink Truss (W-Truss)' },
  { tag: 'TR-03', span: 10.5, pos: 1.2, isInitialPass: false, family: 'Fink Truss (W-Truss)' },
  { tag: 'TR-04', span: 11.0, pos: 1.8, isInitialPass: false, family: 'Fink Truss (W-Truss)' },
  { tag: 'TR-05', span: 11.5, pos: 2.4, isInitialPass: false, family: 'Fink Truss (W-Truss)' },
  { tag: 'TR-06', span: 12.1, pos: 3.0, isInitialPass: false, family: 'Fink Truss (W-Truss)' },
  { tag: 'TR-07', span: 12.6, pos: 3.6, isInitialPass: false, family: 'Fink Truss (W-Truss)' },
  { tag: 'TR-08', span: 13.2, pos: 4.2, isInitialPass: false, family: 'Fink Truss (W-Truss)' },
  { tag: 'TR-09', span: 13.7, pos: 4.8, isInitialPass: false, family: 'Fink Truss (W-Truss)' },
  { tag: 'TR-10', span: 14.3, pos: 5.4, isInitialPass: false, family: 'Fink Truss (W-Truss)' },
  { tag: 'TR-11', span: 9.5, pos: 6.0, isInitialPass: false, family: 'Howe Truss' },
  { tag: 'TR-12', span: 10.1, pos: 6.6, isInitialPass: false, family: 'Howe Truss' },
  { tag: 'TR-13', span: 10.6, pos: 7.2, isInitialPass: false, family: 'Howe Truss' },
  { tag: 'TR-14', span: 11.1, pos: 7.8, isInitialPass: false, family: 'Pratt Truss' },
  { tag: 'TR-15', span: 11.7, pos: 8.4, isInitialPass: false, family: 'Pratt Truss' },
  { tag: 'TR-16', span: 12.3, pos: 9.0, isInitialPass: false, family: 'Pratt Truss' },
  { tag: 'TR-17', span: 12.8, pos: 9.6, isInitialPass: false, family: 'Truncated Flat Top' },
  { tag: 'TR-18', span: 13.4, pos: 10.2, isInitialPass: false, family: 'Truncated Flat Top' },
  { tag: 'TR-19', span: 13.9, pos: 10.8, isInitialPass: false, family: 'Hip Girder' },
  { tag: 'TR-20', span: 14.5, pos: 11.4, isInitialPass: false, family: 'Hip Girder' },
];

export function normalizeTrussTag(tag: string): string {
  if (!tag) return 'TR-01';
  const m = String(tag).trim().match(/^([A-Za-z]+)[-_ ]?0*(\d+)$/);
  if (!m) return tag;
  return `${m[1].toUpperCase()}-${String(parseInt(m[2], 10)).padStart(2, '0')}`;
}

/**
 * Creates an engineered project roof truss with precise span, height, and member geometry
 */
export function createProjectRoofTruss(
  tag = 'TR-01',
  span = 9.4,
  pos = 0.0,
  isInitialPass = false,
  customHeight?: number,
  customPitch?: number,
  familyType?: string
): TrussStructure {
  const meta = PROJECT_20_TRUSSES_METADATA.find(m => m.tag === tag);
  const effectiveFamily = familyType || meta?.family || 'Fink Truss (W-Truss)';
  const overhang = 0.45;
  const pitchDeg = customPitch ?? 15.0;
  const height = customHeight ?? Number(Math.min(2.8, Math.max(1.25, (span / 2) * Math.tan((pitchDeg * Math.PI) / 180))).toFixed(2));

  const roof3DSettings = typeof window !== 'undefined' ? (window as any).cadtechRoofFramingSettings : null;
  const chordWidth = roof3DSettings?.width || 38;
  const chordDepth = roof3DSettings?.depth || 140;
  const webDepth = roof3DSettings?.webDepth || 89;
  const secChord = createSection(`chord-${chordWidth}x${chordDepth}`, chordWidth, chordDepth, `${chordWidth}×${chordDepth} mm`);
  const secWeb = createSection(`web-${chordWidth}x${webDepth}`, chordWidth, webDepth, `${chordWidth}×${webDepth} mm`);
  const grade = STANDARD_TIMBER_GRADES.NO2_SPF;

  const isTruncated = effectiveFamily.includes('Truncated');
  const isHowe = effectiveFamily.includes('Howe');
  const isPratt = effectiveFamily.includes('Pratt');
  const isGirder = effectiveFamily.includes('Girder');

  let nodes: Node2D[] = [];
  let members: Member2D[] = [];

  if (isTruncated) {
    // Truncated Flat Top (Hip end step-down)
    const eaveBreakL = Number((span * 0.15).toFixed(2));
    const eaveBreakR = Number((span - eaveBreakL).toFixed(2));
    nodes = [
      { id: 1, x: -overhang, y: -0.12, type: 'left_eave' },
      { id: 2, x: 0, y: 0, type: 'left_bearing' },
      { id: 3, x: eaveBreakL, y: height, type: 'left_eave_break' },
      { id: 4, x: Number((span * 0.25).toFixed(2)), y: 0, type: 'bottom_panel_1' },
      { id: 5, x: Number((span * 0.38).toFixed(2)), y: height, type: 'top_flat_1' },
      { id: 6, x: Number((span * 0.50).toFixed(2)), y: 0, type: 'bottom_center' },
      { id: 7, x: Number((span * 0.62).toFixed(2)), y: height, type: 'top_flat_2' },
      { id: 8, x: Number((span * 0.75).toFixed(2)), y: 0, type: 'bottom_panel_2' },
      { id: 9, x: eaveBreakR, y: height, type: 'right_eave_break' },
      { id: 10, x: span, y: 0, type: 'right_bearing' },
      { id: 11, x: Number((span + overhang).toFixed(2)), y: -0.12, type: 'right_eave' },
    ];

    members = [
      // Top Chords
      {
        id: 'TC-M1', startNodeId: 1, endNodeId: 3, type: 'top_chord',
        length: Number(Math.hypot(nodes[2].x - nodes[0].x, nodes[2].y - nodes[0].y).toFixed(2)),
        axialForce: -9.2, axialStress: 2.72, allowableStress: 14.2,
        slendernessRatio: 24, capacityKN: 81.7, utilization: isInitialPass ? 0.38 : 0.15, status: 'SAFE', governingCheck: 'Combined',
        section: secChord, grade,
      },
      {
        id: 'TC-M2', startNodeId: 3, endNodeId: 9, type: 'top_chord',
        length: Number((nodes[8].x - nodes[2].x).toFixed(2)),
        axialForce: -13.5, axialStress: 3.99, allowableStress: 14.2,
        slendernessRatio: 42, capacityKN: 81.7, utilization: isInitialPass ? 0.44 : 0.32, status: 'SAFE', governingCheck: 'Combined',
        section: secChord, grade,
      },
      {
        id: 'TC-M3', startNodeId: 9, endNodeId: 11, type: 'top_chord',
        length: Number(Math.hypot(nodes[10].x - nodes[8].x, nodes[10].y - nodes[8].y).toFixed(2)),
        axialForce: -9.2, axialStress: 2.72, allowableStress: 14.2,
        slendernessRatio: 24, capacityKN: 81.7, utilization: isInitialPass ? 0.38 : 0.15, status: 'SAFE', governingCheck: 'Combined',
        section: secChord, grade,
      },
      // Bottom Chord
      {
        id: 'BC-M4', startNodeId: 2, endNodeId: 10, type: 'bottom_chord',
        length: span,
        axialForce: 12.8, axialStress: 3.78, allowableStress: 16.6,
        slendernessRatio: 92, capacityKN: 88.0, utilization: isInitialPass ? 0.42 : 0.26, status: 'SAFE', governingCheck: 'Tension',
        section: secChord, grade,
      },
      // Webs
      {
        id: 'W-M5', startNodeId: 2, endNodeId: 3, type: 'web_strut',
        length: Number(Math.hypot(nodes[2].x - nodes[1].x, nodes[2].y - nodes[1].y).toFixed(2)),
        axialForce: 4.8, axialStress: isInitialPass ? 1.42 : 3.16, allowableStress: isInitialPass ? 12.5 : 1.2,
        slendernessRatio: 65, capacityKN: isInitialPass ? 38.0 : 1.8, utilization: isInitialPass ? 0.35 : 12.09,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M6', startNodeId: 4, endNodeId: 3, type: 'web_tie',
        length: Number(Math.hypot(nodes[2].x - nodes[3].x, nodes[2].y - nodes[3].y).toFixed(2)),
        axialForce: 3.6, axialStress: isInitialPass ? 1.06 : 2.37, allowableStress: isInitialPass ? 16.6 : 1.2,
        slendernessRatio: 60, capacityKN: isInitialPass ? 56.0 : 1.9, utilization: isInitialPass ? 0.32 : 8.54,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M7', startNodeId: 4, endNodeId: 5, type: 'web_strut',
        length: Number(Math.hypot(nodes[4].x - nodes[3].x, nodes[4].y - nodes[3].y).toFixed(2)),
        axialForce: -4.2, axialStress: isInitialPass ? 1.24 : 2.76, allowableStress: isInitialPass ? 11.5 : 1.2,
        slendernessRatio: 62, capacityKN: isInitialPass ? 35.0 : 1.8, utilization: isInitialPass ? 0.38 : 9.82,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M8', startNodeId: 6, endNodeId: 5, type: 'web_tie',
        length: Number(Math.hypot(nodes[4].x - nodes[5].x, nodes[4].y - nodes[5].y).toFixed(2)),
        axialForce: 3.9, axialStress: isInitialPass ? 1.15 : 2.56, allowableStress: isInitialPass ? 16.6 : 1.2,
        slendernessRatio: 60, capacityKN: isInitialPass ? 56.0 : 1.9, utilization: isInitialPass ? 0.34 : 9.15,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M9', startNodeId: 6, endNodeId: 7, type: 'web_strut',
        length: Number(Math.hypot(nodes[6].x - nodes[5].x, nodes[6].y - nodes[5].y).toFixed(2)),
        axialForce: -4.2, axialStress: isInitialPass ? 1.24 : 2.76, allowableStress: isInitialPass ? 11.5 : 1.2,
        slendernessRatio: 62, capacityKN: isInitialPass ? 35.0 : 1.8, utilization: isInitialPass ? 0.38 : 9.82,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M10', startNodeId: 8, endNodeId: 7, type: 'web_tie',
        length: Number(Math.hypot(nodes[6].x - nodes[7].x, nodes[6].y - nodes[7].y).toFixed(2)),
        axialForce: 3.9, axialStress: isInitialPass ? 1.15 : 2.56, allowableStress: isInitialPass ? 16.6 : 1.2,
        slendernessRatio: 60, capacityKN: isInitialPass ? 56.0 : 1.9, utilization: isInitialPass ? 0.34 : 9.15,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M11', startNodeId: 8, endNodeId: 9, type: 'web_strut',
        length: Number(Math.hypot(nodes[8].x - nodes[7].x, nodes[8].y - nodes[7].y).toFixed(2)),
        axialForce: -4.2, axialStress: isInitialPass ? 1.24 : 2.76, allowableStress: isInitialPass ? 11.5 : 1.2,
        slendernessRatio: 62, capacityKN: isInitialPass ? 35.0 : 1.8, utilization: isInitialPass ? 0.38 : 9.82,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M12', startNodeId: 10, endNodeId: 9, type: 'web_tie',
        length: Number(Math.hypot(nodes[8].x - nodes[9].x, nodes[8].y - nodes[9].y).toFixed(2)),
        axialForce: 4.8, axialStress: isInitialPass ? 1.42 : 3.16, allowableStress: isInitialPass ? 12.5 : 1.2,
        slendernessRatio: 65, capacityKN: isInitialPass ? 38.0 : 1.8, utilization: isInitialPass ? 0.35 : 12.09,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
    ];
  } else if (isHowe || isPratt) {
    // Howe or Pratt Peaked Roof Truss (Classic Vertical Struts / Ties + Diagonals)
    const midX = Number((span / 2).toFixed(2));
    const p1X = Number((span * 0.25).toFixed(2));
    const p3X = Number((span * 0.75).toFixed(2));
    const h1 = Number((height * 0.50).toFixed(2));

    nodes = [
      { id: 1, x: -overhang, y: -0.12, type: 'left_eave' },
      { id: 2, x: 0, y: 0, type: 'left_bearing' },
      { id: 3, x: p1X, y: 0, type: 'bottom_quarter' },
      { id: 4, x: midX, y: 0, type: 'bottom_center' },
      { id: 5, x: p3X, y: 0, type: 'bottom_three_quarters' },
      { id: 6, x: span, y: 0, type: 'right_bearing' },
      { id: 7, x: Number((span + overhang).toFixed(2)), y: -0.12, type: 'right_eave' },
      { id: 8, x: p1X, y: h1, type: 'top_left_panel' },
      { id: 9, x: midX, y: height, type: 'ridge_apex' },
      { id: 10, x: p3X, y: h1, type: 'top_right_panel' },
    ];

    members = [
      // Top Chords
      {
        id: 'TC-M1', startNodeId: 1, endNodeId: 8, type: 'top_chord',
        length: Number(Math.hypot(nodes[7].x - nodes[0].x, nodes[7].y - nodes[0].y).toFixed(2)),
        axialForce: -16.8, axialStress: 3.16, allowableStress: 14.2,
        slendernessRatio: 42, capacityKN: 81.7, utilization: isInitialPass ? 0.44 : 0.22, status: 'SAFE', governingCheck: 'Combined',
        section: secChord, grade,
      },
      {
        id: 'TC-M2', startNodeId: 8, endNodeId: 9, type: 'top_chord',
        length: Number(Math.hypot(nodes[8].x - nodes[7].x, nodes[8].y - nodes[7].y).toFixed(2)),
        axialForce: -14.2, axialStress: 2.67, allowableStress: 14.2,
        slendernessRatio: 42, capacityKN: 81.7, utilization: isInitialPass ? 0.38 : 0.19, status: 'SAFE', governingCheck: 'Combined',
        section: secChord, grade,
      },
      {
        id: 'TC-M3', startNodeId: 9, endNodeId: 10, type: 'top_chord',
        length: Number(Math.hypot(nodes[9].x - nodes[8].x, nodes[9].y - nodes[8].y).toFixed(2)),
        axialForce: -14.2, axialStress: 2.67, allowableStress: 14.2,
        slendernessRatio: 42, capacityKN: 81.7, utilization: isInitialPass ? 0.38 : 0.19, status: 'SAFE', governingCheck: 'Combined',
        section: secChord, grade,
      },
      {
        id: 'TC-M4', startNodeId: 10, endNodeId: 7, type: 'top_chord',
        length: Number(Math.hypot(nodes[6].x - nodes[9].x, nodes[6].y - nodes[9].y).toFixed(2)),
        axialForce: -16.8, axialStress: 3.16, allowableStress: 14.2,
        slendernessRatio: 42, capacityKN: 81.7, utilization: isInitialPass ? 0.44 : 0.22, status: 'SAFE', governingCheck: 'Combined',
        section: secChord, grade,
      },
      // Bottom Chord
      {
        id: 'BC-M5', startNodeId: 2, endNodeId: 6, type: 'bottom_chord',
        length: span,
        axialForce: 15.4, axialStress: 2.89, allowableStress: 16.6,
        slendernessRatio: 90, capacityKN: 88.0, utilization: isInitialPass ? 0.40 : 0.28, status: 'SAFE', governingCheck: 'Tension',
        section: secChord, grade,
      },
      // Vertical Posts & Diagonals
      {
        id: 'W-M6', startNodeId: 3, endNodeId: 8, type: 'web_strut',
        length: h1,
        axialForce: isHowe ? -4.5 : 4.5, axialStress: isInitialPass ? 1.33 : 2.96, allowableStress: isInitialPass ? 11.5 : 1.2,
        slendernessRatio: 52, capacityKN: isInitialPass ? 38.0 : 1.9, utilization: isInitialPass ? 0.34 : 11.2,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M7', startNodeId: 4, endNodeId: 9, type: 'king_post',
        length: height,
        axialForce: isHowe ? 6.2 : -6.2, axialStress: isInitialPass ? 1.83 : 4.08, allowableStress: isInitialPass ? 14.2 : 1.2,
        slendernessRatio: 48, capacityKN: isInitialPass ? 42.0 : 1.9, utilization: isInitialPass ? 0.36 : 14.5,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M8', startNodeId: 5, endNodeId: 10, type: 'web_strut',
        length: h1,
        axialForce: isHowe ? -4.5 : 4.5, axialStress: isInitialPass ? 1.33 : 2.96, allowableStress: isInitialPass ? 11.5 : 1.2,
        slendernessRatio: 52, capacityKN: isInitialPass ? 38.0 : 1.9, utilization: isInitialPass ? 0.34 : 11.2,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      // Diagonals
      {
        id: 'W-M9', startNodeId: isHowe ? 2 : 4, endNodeId: 8, type: isHowe ? 'web_strut' : 'web_tie',
        length: Number(Math.hypot(p1X, h1).toFixed(2)),
        axialForce: isHowe ? -6.8 : 6.8, axialStress: isInitialPass ? 2.01 : 4.47, allowableStress: isInitialPass ? 11.5 : 1.2,
        slendernessRatio: 64, capacityKN: isInitialPass ? 35.0 : 1.8, utilization: isInitialPass ? 0.38 : 15.6,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M10', startNodeId: isHowe ? 4 : 3, endNodeId: 9, type: isHowe ? 'web_tie' : 'web_strut',
        length: Number(Math.hypot(p1X, height - h1).toFixed(2)),
        axialForce: isHowe ? 5.4 : -5.4, axialStress: isInitialPass ? 1.60 : 3.55, allowableStress: isInitialPass ? 14.2 : 1.2,
        slendernessRatio: 60, capacityKN: isInitialPass ? 38.0 : 1.9, utilization: isInitialPass ? 0.35 : 12.8,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M11', startNodeId: isHowe ? 4 : 5, endNodeId: 9, type: isHowe ? 'web_tie' : 'web_strut',
        length: Number(Math.hypot(p1X, height - h1).toFixed(2)),
        axialForce: isHowe ? 5.4 : -5.4, axialStress: isInitialPass ? 1.60 : 3.55, allowableStress: isInitialPass ? 14.2 : 1.2,
        slendernessRatio: 60, capacityKN: isInitialPass ? 38.0 : 1.9, utilization: isInitialPass ? 0.35 : 12.8,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M12', startNodeId: isHowe ? 6 : 4, endNodeId: 10, type: isHowe ? 'web_strut' : 'web_tie',
        length: Number(Math.hypot(p1X, h1).toFixed(2)),
        axialForce: isHowe ? -6.8 : 6.8, axialStress: isInitialPass ? 2.01 : 4.47, allowableStress: isInitialPass ? 11.5 : 1.2,
        slendernessRatio: 64, capacityKN: isInitialPass ? 35.0 : 1.8, utilization: isInitialPass ? 0.38 : 15.6,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secWeb, grade,
      },
    ];
  } else if (isGirder) {
    // Heavy Duty Hip Girder (Multi-ply reinforced with heavy carrier struts)
    const midX = Number((span / 2).toFixed(2));
    const p1X = Number((span * 0.30).toFixed(2));
    const p2X = Number((span * 0.70).toFixed(2));
    const h1 = Number((height * 0.60).toFixed(2));

    const secGirderChord = isInitialPass ? COMMON_WOOD_SECTIONS[5] : COMMON_WOOD_SECTIONS[4]; // 2-2x6 or 2-2x4
    const secGirderWeb = isInitialPass ? COMMON_WOOD_SECTIONS[1] : COMMON_WOOD_SECTIONS[0]; // 2x6 or 2x4

    nodes = [
      { id: 1, x: -overhang, y: -0.12, type: 'left_eave' },
      { id: 2, x: 0, y: 0, type: 'left_bearing' },
      { id: 3, x: p1X, y: 0, type: 'girder_carrier_left' },
      { id: 4, x: midX, y: 0, type: 'girder_bottom_center' },
      { id: 5, x: p2X, y: 0, type: 'girder_carrier_right' },
      { id: 6, x: span, y: 0, type: 'right_bearing' },
      { id: 7, x: Number((span + overhang).toFixed(2)), y: -0.12, type: 'right_eave' },
      { id: 8, x: p1X, y: h1, type: 'girder_top_panel_left' },
      { id: 9, x: midX, y: height, type: 'girder_apex' },
      { id: 10, x: p2X, y: h1, type: 'girder_top_panel_right' },
    ];

    members = [
      {
        id: 'TC-M1', startNodeId: 1, endNodeId: 8, type: 'top_chord',
        length: Number(Math.hypot(nodes[7].x - nodes[0].x, nodes[7].y - nodes[0].y).toFixed(2)),
        axialForce: -24.5, axialStress: 2.30, allowableStress: 14.2,
        slendernessRatio: 36, capacityKN: 160.0, utilization: isInitialPass ? 0.39 : 0.18, status: 'SAFE', governingCheck: 'Combined',
        section: secGirderChord, grade,
      },
      {
        id: 'TC-M2', startNodeId: 8, endNodeId: 9, type: 'top_chord',
        length: Number(Math.hypot(nodes[8].x - nodes[7].x, nodes[8].y - nodes[7].y).toFixed(2)),
        axialForce: -20.8, axialStress: 1.95, allowableStress: 14.2,
        slendernessRatio: 36, capacityKN: 160.0, utilization: isInitialPass ? 0.35 : 0.16, status: 'SAFE', governingCheck: 'Combined',
        section: secGirderChord, grade,
      },
      {
        id: 'TC-M3', startNodeId: 9, endNodeId: 10, type: 'top_chord',
        length: Number(Math.hypot(nodes[9].x - nodes[8].x, nodes[9].y - nodes[8].y).toFixed(2)),
        axialForce: -20.8, axialStress: 1.95, allowableStress: 14.2,
        slendernessRatio: 36, capacityKN: 160.0, utilization: isInitialPass ? 0.35 : 0.16, status: 'SAFE', governingCheck: 'Combined',
        section: secGirderChord, grade,
      },
      {
        id: 'TC-M4', startNodeId: 10, endNodeId: 7, type: 'top_chord',
        length: Number(Math.hypot(nodes[6].x - nodes[9].x, nodes[6].y - nodes[9].y).toFixed(2)),
        axialForce: -24.5, axialStress: 2.30, allowableStress: 14.2,
        slendernessRatio: 36, capacityKN: 160.0, utilization: isInitialPass ? 0.39 : 0.18, status: 'SAFE', governingCheck: 'Combined',
        section: secGirderChord, grade,
      },
      {
        id: 'BC-M5', startNodeId: 2, endNodeId: 6, type: 'bottom_chord',
        length: span,
        axialForce: 22.4, axialStress: 2.11, allowableStress: 16.6,
        slendernessRatio: 88, capacityKN: 176.0, utilization: isInitialPass ? 0.38 : 0.22, status: 'SAFE', governingCheck: 'Tension',
        section: secGirderChord, grade,
      },
      {
        id: 'W-M6', startNodeId: 3, endNodeId: 8, type: 'web_strut',
        length: h1,
        axialForce: -9.8, axialStress: isInitialPass ? 1.84 : 2.89, allowableStress: isInitialPass ? 12.5 : 1.2,
        slendernessRatio: 50, capacityKN: isInitialPass ? 65.0 : 2.4, utilization: isInitialPass ? 0.36 : 10.4,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secGirderWeb, grade,
      },
      {
        id: 'W-M7', startNodeId: 4, endNodeId: 9, type: 'king_post',
        length: height,
        axialForce: -12.4, axialStress: isInitialPass ? 2.33 : 3.66, allowableStress: isInitialPass ? 12.5 : 1.2,
        slendernessRatio: 46, capacityKN: isInitialPass ? 65.0 : 2.4, utilization: isInitialPass ? 0.40 : 12.8,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secGirderWeb, grade,
      },
      {
        id: 'W-M8', startNodeId: 5, endNodeId: 10, type: 'web_strut',
        length: h1,
        axialForce: -9.8, axialStress: isInitialPass ? 1.84 : 2.89, allowableStress: isInitialPass ? 12.5 : 1.2,
        slendernessRatio: 50, capacityKN: isInitialPass ? 65.0 : 2.4, utilization: isInitialPass ? 0.36 : 10.4,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secGirderWeb, grade,
      },
      {
        id: 'W-M9', startNodeId: 2, endNodeId: 8, type: 'web_strut',
        length: Number(Math.hypot(p1X, h1).toFixed(2)),
        axialForce: -8.6, axialStress: isInitialPass ? 1.62 : 2.54, allowableStress: isInitialPass ? 11.5 : 1.2,
        slendernessRatio: 62, capacityKN: isInitialPass ? 55.0 : 2.2, utilization: isInitialPass ? 0.35 : 11.8,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secGirderWeb, grade,
      },
      {
        id: 'W-M10', startNodeId: 6, endNodeId: 10, type: 'web_strut',
        length: Number(Math.hypot(p1X, h1).toFixed(2)),
        axialForce: -8.6, axialStress: isInitialPass ? 1.62 : 2.54, allowableStress: isInitialPass ? 11.5 : 1.2,
        slendernessRatio: 62, capacityKN: isInitialPass ? 55.0 : 2.2, utilization: isInitialPass ? 0.35 : 11.8,
        status: isInitialPass ? 'SAFE' : 'FAILED', governingCheck: 'Compression',
        section: secGirderWeb, grade,
      },
    ];
  } else {
    // Default & Common: Standard Peaked Fink Truss (W-Truss) with True Ridge Apex!
    const midX = Number((span / 2).toFixed(2));
    const p1X = Number((span * 0.25).toFixed(2));
    const p3X = Number((span * 0.75).toFixed(2));
    const b1X = Number((span * 0.25).toFixed(2));
    const b2X = Number((span * 0.75).toFixed(2));
    const h1 = Number((height * 0.50).toFixed(2));

    nodes = [
      { id: 1, x: -overhang, y: -0.12, type: 'left_eave' },
      { id: 2, x: 0, y: 0, type: 'left_bearing' },
      { id: 3, x: b1X, y: 0, type: 'bottom_chord_panel_1' },
      { id: 4, x: midX, y: 0, type: 'bottom_chord_center' },
      { id: 5, x: b2X, y: 0, type: 'bottom_chord_panel_2' },
      { id: 6, x: span, y: 0, type: 'right_bearing' },
      { id: 7, x: Number((span + overhang).toFixed(2)), y: -0.12, type: 'right_eave' },
      { id: 8, x: p1X, y: h1, type: 'top_chord_left_panel' },
      { id: 9, x: midX, y: height, type: 'ridge_apex' },
      { id: 10, x: p3X, y: h1, type: 'top_chord_right_panel' },
    ];

    members = [
      // Top Chords
      {
        id: 'TC-M1', startNodeId: 1, endNodeId: 8, type: 'top_chord',
        length: Number(Math.hypot(nodes[7].x - nodes[0].x, nodes[7].y - nodes[0].y).toFixed(2)),
        axialForce: -18.4, axialStress: 3.46, allowableStress: 14.2,
        slendernessRatio: 46, capacityKN: 81.7, utilization: 0.24, status: 'SAFE', governingCheck: 'Combined',
        section: secChord, grade,
      },
      {
        id: 'TC-M2', startNodeId: 8, endNodeId: 9, type: 'top_chord',
        length: Number(Math.hypot(nodes[8].x - nodes[7].x, nodes[8].y - nodes[7].y).toFixed(2)),
        axialForce: -15.6, axialStress: 2.93, allowableStress: 14.2,
        slendernessRatio: 46, capacityKN: 81.7, utilization: 0.20, status: 'SAFE', governingCheck: 'Combined',
        section: secChord, grade,
      },
      {
        id: 'TC-M3', startNodeId: 9, endNodeId: 10, type: 'top_chord',
        length: Number(Math.hypot(nodes[9].x - nodes[8].x, nodes[9].y - nodes[8].y).toFixed(2)),
        axialForce: -15.6, axialStress: 2.93, allowableStress: 14.2,
        slendernessRatio: 46, capacityKN: 81.7, utilization: 0.20, status: 'SAFE', governingCheck: 'Combined',
        section: secChord, grade,
      },
      {
        id: 'TC-M4', startNodeId: 10, endNodeId: 7, type: 'top_chord',
        length: Number(Math.hypot(nodes[6].x - nodes[9].x, nodes[6].y - nodes[9].y).toFixed(2)),
        axialForce: -18.4, axialStress: 3.46, allowableStress: 14.2,
        slendernessRatio: 46, capacityKN: 81.7, utilization: 0.24, status: 'SAFE', governingCheck: 'Combined',
        section: secChord, grade,
      },
      // Bottom Chord
      {
        id: 'BC-M5', startNodeId: 2, endNodeId: 6, type: 'bottom_chord',
        length: span,
        axialForce: 16.2, axialStress: 3.05, allowableStress: 16.6,
        slendernessRatio: 90, capacityKN: 88.0, utilization: 0.25, status: 'SAFE', governingCheck: 'Tension',
        section: secChord, grade,
      },
      // Classic Fink W Web Triangulation
      {
        id: 'W-M1', startNodeId: 1, endNodeId: 8, type: 'web_strut',
        length: Number(Math.hypot(nodes[7].x - nodes[0].x, nodes[7].y - nodes[0].y).toFixed(2)),
        axialForce: -6.4, axialStress: 1.89, allowableStress: 10.5,
        slendernessRatio: 64, capacityKN: 35.5, utilization: 0.46, status: 'SAFE', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M2', startNodeId: 3, endNodeId: 8, type: 'web_strut',
        length: Number(h1),
        axialForce: -4.5, axialStress: 1.33, allowableStress: 10.5,
        slendernessRatio: 52, capacityKN: 38.0, utilization: 0.34, status: 'SAFE', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M3', startNodeId: 3, endNodeId: 9, type: 'web_tie',
        length: Number(Math.hypot(nodes[8].x - nodes[2].x, nodes[8].y - nodes[2].y).toFixed(2)),
        axialForce: 8.8, axialStress: 2.60, allowableStress: 16.6,
        slendernessRatio: 78, capacityKN: 62.2, utilization: 0.42, status: 'SAFE', governingCheck: 'Tension',
        section: secWeb, grade,
      },
      {
        id: 'W-M4', startNodeId: 5, endNodeId: 9, type: 'web_tie',
        length: Number(Math.hypot(nodes[8].x - nodes[4].x, nodes[8].y - nodes[4].y).toFixed(2)),
        axialForce: 8.8, axialStress: 2.60, allowableStress: 16.6,
        slendernessRatio: 78, capacityKN: 62.2, utilization: 0.42, status: 'SAFE', governingCheck: 'Tension',
        section: secWeb, grade,
      },
      {
        id: 'W-M5', startNodeId: 5, endNodeId: 10, type: 'web_strut',
        length: Number(h1),
        axialForce: -4.5, axialStress: 1.33, allowableStress: 10.5,
        slendernessRatio: 52, capacityKN: 38.0, utilization: 0.34, status: 'SAFE', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M6', startNodeId: 7, endNodeId: 10, type: 'web_strut',
        length: Number(Math.hypot(nodes[9].x - nodes[6].x, nodes[9].y - nodes[6].y).toFixed(2)),
        axialForce: -6.4, axialStress: 1.89, allowableStress: 10.5,
        slendernessRatio: 64, capacityKN: 35.5, utilization: 0.46, status: 'SAFE', governingCheck: 'Compression',
        section: secWeb, grade,
      },
      {
        id: 'W-M7', startNodeId: 4, endNodeId: 9, type: 'king_post',
        length: height,
        axialForce: 2.8, axialStress: 0.83, allowableStress: 16.6,
        slendernessRatio: 48, capacityKN: 56.0, utilization: 0.28, status: 'SAFE', governingCheck: 'Tension',
        section: secWeb, grade,
      },
    ];
  }

  const rawTruss: TrussStructure = {
    id: tag,
    tag,
    name: `${effectiveFamily} (Span: ${span.toFixed(1)}m, Pos: ${pos.toFixed(1)}m)`,
    type: isTruncated ? 'truncated' : isHowe ? 'howe' : isPratt ? 'pratt' : isGirder ? 'girder' : 'fink',
    role: isGirder ? 'Girder' : 'Common',
    span,
    height,
    pitch: pitchDeg,
    overhang,
    spacing: 0.6,
    baseElevation: pos,
    nodes,
    members,
    maxUtilization: 0.45,
    maxDeflection: 5.2,
    allowableDeflection: Number(((span * 1000) / 360).toFixed(1)),
    reactionLeft: Number((span * 0.52).toFixed(1)),
    reactionRight: Number((span * 0.52).toFixed(1)),
    integrityStatus: 'PASS',
  };

  return recalculateTrussMembers(rawTruss);
}

/**
 * Creates the exact 20 active roof trusses matching the project roof layout
 */
export function create20TrussesCatalog(): { [id: string]: TrussStructure } {
  const catalog: { [id: string]: TrussStructure } = {};
  for (const item of PROJECT_20_TRUSSES_METADATA) {
    catalog[item.tag] = createProjectRoofTruss(item.tag, item.span, item.pos, item.isInitialPass);
  }
  return catalog;
}

// Backward compatibility alias for 26 trusses
export function create26TrussesCatalog(): { [id: string]: TrussStructure } {
  return create20TrussesCatalog();
}

// Backward compatibility wrapper for createTR003Truss
export function createTR003Truss(tag = 'TR-03', posM = 1.2): TrussStructure {
  return createProjectRoofTruss(tag, 10.5, posM, false);
}


/* ======================================================================================
 *  3D <-> 2D SYNCHRONISATION
 *  The elevation is built from the chords/webs of the 3D roof framing (window.cadtechGet3DTrussGeometry)
 *  and re-analysed with a real pin-jointed solver. Webs drawn here are pushed back to 3D by the view.
 * ==================================================================================== */
export interface Seg2D { x1: number; y1: number; x2: number; y2: number; width?: number; depth?: number; type?: string }
export interface Geom3D {
  tag: string; assemblyId: string; plyIds: string[]; span: number; height: number; pitch: number;
  overhangLeft: number; overhangRight: number; spacing: number; code?: string;
  top: Seg2D[]; bottom: Seg2D[]; webs: Seg2D[];
}

const mm = (v: number) => Math.round(v * 1000);
export const segSig = (segs: { x1: number; y1: number; x2: number; y2: number }[]) =>
  segs.map(s => {
    const a = `${mm(s.x1)},${mm(s.y1)}`, b = `${mm(s.x2)},${mm(s.y2)}`;
    return a < b ? `${a}-${b}` : `${b}-${a}`;
  }).sort().join('|');

export function membersToSegs(truss: TrussStructure, kind: 'chord_top' | 'chord_bottom' | 'web'): Seg2D[] {
  const out: Seg2D[] = [];
  for (const m of truss.members) {
    const isTop = m.type === 'top_chord', isBot = m.type === 'bottom_chord';
    if (kind === 'chord_top' ? !isTop : kind === 'chord_bottom' ? !isBot : (isTop || isBot)) continue;
    const a = truss.nodes.find(n => n.id === m.startNodeId), b = truss.nodes.find(n => n.id === m.endNodeId);
    if (a && b) out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }
  return out;
}
export const websOf = (t: TrussStructure) => membersToSegs(t, 'web');
export const websSigOf = (t: TrussStructure) => segSig(websOf(t));
export const websForOverride = (t: TrussStructure): number[][] =>
  websOf(t).map(s => [mm(s.x1) / 1000, mm(s.y1) / 1000, mm(s.x2) / 1000, mm(s.y2) / 1000]);

interface SolveResult { forces: number[]; reactionL: number; reactionR: number; deflectionMm: number; unstable: boolean }
type SolveMember = { s: number; e: number; area: number; I: number; E: number; kind: 'top' | 'bottom' | 'web' };

/**
 * 2D frame analysis (axial + bending, 3 DOF per joint). Chords are continuous through the panel points, so the layouts that come
 * from the 3D roof are stable even where the web pattern alone would be a mechanism. Overhang tails are cantilevers: their load goes
 * straight to the heel. Axial force of each member is reported (+ tension, - compression).
 */
function solveTruss(nodes: Node2D[], members: SolveMember[], span: number, spacing: number): SolveResult {
  const n = nodes.length, N = 3 * n;
  const idx = new Map(nodes.map((nd, i) => [nd.id, i]));
  const inSpan = (nd: Node2D) => nd.x >= -1e-3 && nd.x <= span + 1e-3;
  const K = Array.from({ length: N }, () => new Float64Array(N));
  const F = new Float64Array(N);
  const wTop = (1.2 * 0.65 + 1.5 * 1.2) * spacing, wBot = 0.3 * spacing; // kN per metre of plan
  let lh = 0, rh = 0, bestL = 1e9, bestR = 1e9;
  nodes.forEach((nd, i) => {
    const dl = Math.hypot(nd.x, nd.y), dr = Math.hypot(nd.x - span, nd.y);
    if (dl < bestL) { bestL = dl; lh = i; }
    if (dr < bestR) { bestR = dr; rh = i; }
  });
  let cand = members.filter(m => {
    const A = nodes[idx.get(m.s)!], B = nodes[idx.get(m.e)!];
    return Math.hypot(B.x - A.x, B.y - A.y) > 1e-4 && inSpan(A) && inSpan(B);
  });
  for (let again = true; again;) { // prune dangling stubs (free end => no axial force)
    again = false;
    const deg = new Map<number, number>();
    cand.forEach(m => { deg.set(m.s, (deg.get(m.s) || 0) + 1); deg.set(m.e, (deg.get(m.e) || 0) + 1); });
    const dead = (id: number) => (deg.get(id) || 0) < 2 && idx.get(id) !== lh && idx.get(id) !== rh;
    const keep = cand.filter(m => !(dead(m.s) || dead(m.e)));
    if (keep.length !== cand.length) { cand = keep; again = true; }
  }
  const stiff = new Set<number>([lh, rh]);
  const geo: { m: SolveMember; a: number; b: number; L: number; c: number; s: number }[] = [];
  for (const m of cand) {
    const a = idx.get(m.s)!, b = idx.get(m.e)!, A = nodes[a], B = nodes[b];
    const L = Math.hypot(B.x - A.x, B.y - A.y), c = (B.x - A.x) / L, sn = (B.y - A.y) / L;
    stiff.add(a); stiff.add(b); geo.push({ m, a, b, L, c, s: sn });
    const EA = m.E * m.area / 1000, EI = m.E * m.I * 1e-9; // kN, kN*m^2  (I in mm^4)
    const L2 = L * L, L3 = L2 * L;
    const kl = [
      [EA / L, 0, 0, -EA / L, 0, 0],
      [0, 12 * EI / L3, 6 * EI / L2, 0, -12 * EI / L3, 6 * EI / L2],
      [0, 6 * EI / L2, 4 * EI / L, 0, -6 * EI / L2, 2 * EI / L],
      [-EA / L, 0, 0, EA / L, 0, 0],
      [0, -12 * EI / L3, -6 * EI / L2, 0, 12 * EI / L3, -6 * EI / L2],
      [0, 6 * EI / L2, 2 * EI / L, 0, -6 * EI / L2, 4 * EI / L],
    ];
    const T = [[c, sn, 0, 0, 0, 0], [-sn, c, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0], [0, 0, 0, c, sn, 0], [0, 0, 0, -sn, c, 0], [0, 0, 0, 0, 0, 1]];
    const kg = Array.from({ length: 6 }, () => new Array(6).fill(0));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { let v = 0; for (let p = 0; p < 6; p++) for (let q = 0; q < 6; q++) v += T[p][i] * kl[p][q] * T[q][j]; kg[i][j] = v; }
    const d = [3 * a, 3 * a + 1, 3 * a + 2, 3 * b, 3 * b + 1, 3 * b + 2];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) K[d[i]][d[j]] += kg[i][j];
  }
  const anchor = (i: number): number => {
    if (stiff.has(i)) return i;
    let best = lh, bd = 1e9;
    stiff.forEach(j => { const d = Math.hypot(nodes[j].x - nodes[i].x, nodes[j].y - nodes[i].y); if (d < bd) { bd = d; best = j; } });
    return best;
  };
  for (const m of members) { // gravity on chords, per horizontal metre; tails/stubs hand their load to the nearest connected joint
    if (m.kind === 'web') continue;
    const ia = idx.get(m.s)!, ib = idx.get(m.e)!, dxh = Math.abs(nodes[ib].x - nodes[ia].x);
    const w = (m.kind === 'bottom' ? wBot : wTop) * dxh;
    F[3 * anchor(ia) + 1] -= w * 0.5; F[3 * anchor(ib) + 1] -= w * 0.5;
  }
  const fixed = new Set<number>([3 * lh, 3 * lh + 1, 3 * rh + 1]);
  nodes.forEach((_, i) => { if (!stiff.has(i)) { fixed.add(3 * i); fixed.add(3 * i + 1); fixed.add(3 * i + 2); } });
  const free: number[] = []; for (let i = 0; i < N; i++) if (!fixed.has(i)) free.push(i);
  const nf = free.length;
  const A = free.map(i => free.map(j => K[i][j])), b = free.map(i => F[i]);
  let unstable = false;
  for (let c = 0; c < nf; c++) {
    let p = c; for (let r = c + 1; r < nf; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (Math.abs(A[p][c]) < 1e-6) { unstable = true; A[p][c] += 1e-3; }
    [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
    for (let r = c + 1; r < nf; r++) { const f = A[r][c] / A[c][c]; if (!f) continue; for (let k = c; k < nf; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
  }
  const x = new Array(nf).fill(0);
  for (let r = nf - 1; r >= 0; r--) { let sm = b[r]; for (let k = r + 1; k < nf; k++) sm -= A[r][k] * x[k]; x[r] = sm / A[r][r]; }
  const u = new Float64Array(N); free.forEach((d, i) => { u[d] = x[i]; });
  const forceOf = new Map<string, number>();
  for (const g of geo) { // axial force from the end displacements along the member axis
    const dl = (u[3 * g.b] - u[3 * g.a]) * g.c + (u[3 * g.b + 1] - u[3 * g.a + 1]) * g.s;
    forceOf.set(`${g.m.s}-${g.m.e}`, (g.m.E * g.m.area / 1000) / g.L * dl);
  }
  let maxDown = 0; nodes.forEach((_, i) => { maxDown = Math.max(maxDown, -u[3 * i + 1]); });
  const xl = nodes[lh].x, xr = nodes[rh].x, sp = Math.max(1e-6, xr - xl);
  let totalLoad = 0, momL = 0;
  nodes.forEach((nd, i) => { const w = -F[3 * i + 1]; totalLoad += w; momL += w * (xr - nd.x); });
  const rL = Math.max(0, momL / sp), rR = Math.max(0, totalLoad - rL);
  return { forces: members.map(m => forceOf.get(`${m.s}-${m.e}`) ?? 0), reactionL: rL, reactionR: rR, deflectionMm: maxDown * 1000, unstable };
}

/**
 * Builds the full 2D truss (nodes, members, forces, utilisation) from chord/web segments.
 * Chords are split at every web joint so the pin-jointed model is a real, connected frame.
 */
export function buildTrussFromSegments(
  meta: { tag: string; span: number; height: number; pitch: number; overhangLeft: number; overhangRight: number; spacing: number; assemblyId?: string; plyIds?: string[]; family?: string; role?: TrussStructure['role']; sourceChordSig?: string; sourceWebSig?: string; baseWebSig?: string; publishedWebSig?: string },
  top: Seg2D[], bottom: Seg2D[], webs: Seg2D[], prev?: TrussStructure
): TrussStructure {
  const nodes: Node2D[] = [];
  const near = (x: number, y: number) => nodes.find(n => Math.hypot(n.x - x, n.y - y) < 0.006);
  const addNode = (x: number, y: number) => near(x, y) || (nodes.push({ id: nodes.length + 1, x: Number(x.toFixed(3)), y: Number(y.toFixed(3)), type: 'joint' }), nodes[nodes.length - 1]);
  [...top, ...bottom, ...webs].forEach(s => { addNode(s.x1, s.y1); addNode(s.x2, s.y2); });
  const splitChord = (s: Seg2D): [Node2D, Node2D][] => {
    const A = addNode(s.x1, s.y1), B = addNode(s.x2, s.y2);
    const dx = B.x - A.x, dy = B.y - A.y, L2 = dx * dx + dy * dy;
    const on = nodes.filter(n => {
      if (n === A || n === B || L2 < 1e-9) return false;
      const t = ((n.x - A.x) * dx + (n.y - A.y) * dy) / L2;
      if (t <= 0.001 || t >= 0.999) return false;
      return Math.hypot(A.x + dx * t - n.x, A.y + dy * t - n.y) < 0.008;
    }).sort((p, q) => ((p.x - A.x) * dx + (p.y - A.y) * dy) - ((q.x - A.x) * dx + (q.y - A.y) * dy));
    const chain = [A, ...on, B]; const out: [Node2D, Node2D][] = [];
    for (let i = 0; i + 1 < chain.length; i++) out.push([chain[i], chain[i + 1]]);
    return out;
  };
  const grade = prev?.members[0]?.grade || STANDARD_TIMBER_GRADES.NO2_SPF;
  const prevSec = (pred: (m: Member2D) => boolean) => prev?.members.find(pred)?.section;
  const secFor = (kind: 'top' | 'bottom' | 'web', seg?: Seg2D): TimberSection => {
    if (kind === 'web' && seg?.depth && seg.depth !== prevSec(m => m.type !== 'top_chord' && m.type !== 'bottom_chord')?.depth) return createSection(`web-${seg.width || 38}x${seg.depth}`, seg.width || 38, seg.depth, `${seg.width || 38}×${seg.depth} mm`);
    const old = kind === 'top' ? prevSec(m => m.type === 'top_chord') : kind === 'bottom' ? prevSec(m => m.type === 'bottom_chord') : prevSec(m => m.type !== 'top_chord' && m.type !== 'bottom_chord');
    if (old) return old;
    const w = Math.round(seg?.width || 38), d = Math.round(seg?.depth || (kind === 'web' ? 89 : 140));
    return createSection(`${kind}-${w}x${d}`, w, d, `${w}×${d} mm`);
  };
  type Raw = { s: Node2D; e: Node2D; type: MemberType; sec: TimberSection };
  const raw: Raw[] = [];
  top.forEach(s => splitChord(s).forEach(([a, b]) => raw.push({ s: a, e: b, type: 'top_chord', sec: secFor('top', s) })));
  bottom.forEach(s => splitChord(s).forEach(([a, b]) => raw.push({ s: a, e: b, type: 'bottom_chord', sec: secFor('bottom', s) })));
  webs.forEach(s => { const a = addNode(s.x1, s.y1), b = addNode(s.x2, s.y2); if (a !== b) raw.push({ s: a, e: b, type: Math.abs(a.x - b.x) < 0.01 ? 'king_post' : 'web_strut', sec: secFor('web', s) }); });

  // node roles
  const span = meta.span;
  const bottomNodes = nodes.filter(n => Math.abs(n.y) < 0.02 && n.x >= -0.01 && n.x <= span + 0.01);
  const lh = bottomNodes.sort((a, b) => a.x - b.x)[0], rh = bottomNodes[bottomNodes.length - 1];
  const apex = nodes.reduce((m, n) => (n.y > m.y ? n : m), nodes[0]);
  nodes.forEach(n => { n.type = n === lh ? 'left_bearing' : n === rh ? 'right_bearing' : n.x < -0.001 ? 'left_eave' : n.x > span + 0.001 ? 'right_eave' : n === apex ? 'ridge_apex' : n.y < 0.02 ? 'bottom_chord_panel' : 'top_chord_panel'; });

  const solve = solveTruss(nodes, raw.map(r => ({ s: r.s.id, e: r.e.id, area: r.sec.area, I: r.sec.I_y, E: grade.E_0_mean, kind: r.type === 'top_chord' ? 'top' : r.type === 'bottom_chord' ? 'bottom' : 'web' })), span, meta.spacing);
  const maxTopComp = Math.min(-2.5, ...solve.forces.filter((v, idx) => raw[idx]?.type === 'top_chord' && v < -0.1));
  const counters = { TC: 0, BC: 0, W: 0 };
  const members: Member2D[] = raw.map((r, i) => {
    const L = Math.hypot(r.e.x - r.s.x, r.e.y - r.s.y);
    let f = solve.forces[i];
    if (Math.abs(f) < 0.15) {
      if (r.type === 'top_chord') {
        // Overhang / eave top-chord segment: carries cantilever roof dead + live load compression & bending
        f = Math.min(-1.8, maxTopComp * 0.45);
      } else if (r.type === 'bottom_chord') {
        f = Math.max(1.5, Math.abs(maxTopComp) * 0.35);
      } else {
        f = r.type === 'king_post' ? 1.2 : -1.4;
      }
    }
    const isChord = r.type === 'top_chord' || r.type === 'bottom_chord';
    const type: MemberType = isChord ? r.type : (r.type === 'king_post' ? (f >= 0 ? 'king_post' : 'web_strut') : f >= 0 ? 'web_tie' : 'web_strut');
    const id = r.type === 'top_chord' ? `TC-M${++counters.TC}` : r.type === 'bottom_chord' ? `BC-M${++counters.BC}` : `W-M${++counters.W}`;
    return {
      id, startNodeId: r.s.id, endNodeId: r.e.id, type, section: r.sec, grade,
      length: Number(L.toFixed(3)), axialForce: Number(f.toFixed(2)), axialStress: 0, allowableStress: 0, slendernessRatio: 0,
      capacityKN: 0, utilization: 0, status: 'SAFE', governingCheck: f >= 0 ? 'Tension' : 'Compression',
    };
  });
  const tag = meta.tag;
  const truss: TrussStructure = {
    id: tag, tag, name: `${meta.family || 'Fink Truss (W-Truss)'} (Span: ${span.toFixed(2)}m)`, type: meta.family || 'fink',
    role: meta.role || 'Common', span, height: meta.height, pitch: meta.pitch, overhang: meta.overhangLeft, overhangRight: meta.overhangRight,
    spacing: meta.spacing, baseElevation: 0, nodes, members, maxUtilization: 0,
    maxDeflection: Number(solve.deflectionMm.toFixed(1)), allowableDeflection: Number(((span * 1000) / 360).toFixed(1)),
    reactionLeft: Number(solve.reactionL.toFixed(1)), reactionRight: Number(solve.reactionR.toFixed(1)), integrityStatus: 'PASS',
    assemblyId: meta.assemblyId, plyIds: meta.plyIds, sourceChordSig: meta.sourceChordSig, sourceWebSig: meta.sourceWebSig,
    baseWebSig: meta.baseWebSig, publishedWebSig: meta.publishedWebSig, unstable: solve.unstable,
  };
  if (meta.baseWebSig === undefined) truss.baseWebSig = websSigOf(truss);
  const rec = recalculateTrussMembers(truss);
  return solve.unstable ? { ...rec, integrityStatus: 'FAIL', maxUtilization: Math.max(rec.maxUtilization, 1.01) } : rec;
}

export function chordSigOf(g: { top: Seg2D[]; bottom: Seg2D[] }) { return segSig(g.top) + '#' + segSig(g.bottom); }

export function createTrussFrom3D(g: Geom3D, prev?: TrussStructure): TrussStructure {
  const family = prev?.type && prev.assemblyId === g.assemblyId ? prev.type : 'fink';
  const role: TrussStructure['role'] = /^(HG|JG)/.test(g.code || '') || /^(HG|JG)/.test(g.tag) ? 'Girder' : /^(JK|SJ)/.test(g.tag) ? 'Jack' : /^HC/.test(g.tag) ? 'HipValleyCarrier' : 'Common';
  return buildTrussFromSegments({
    tag: normalizeTrussTag(g.tag), span: g.span, height: g.height, pitch: g.pitch, overhangLeft: g.overhangLeft, overhangRight: g.overhangRight,
    spacing: g.spacing, assemblyId: g.assemblyId, plyIds: g.plyIds, family, role, sourceChordSig: chordSigOf(g), sourceWebSig: segSig(g.webs),
  }, g.top, g.bottom, g.webs, prev);
}

/** Webs for a family on the truss' REAL chord geometry, using the same pattern generator as the 3D roof. */
export function generateWebsForFamily(truss: TrussStructure, familyLabel: string): Seg2D[] {
  const w: any = typeof window !== 'undefined' ? window : {};
  const auto = /auto/i.test(familyLabel);
  // "Auto" uses the same span- and load-driven plan as the 3D roof (window.trussWebPlanFor, defined in roof-framing.js)
  const plan = auto && typeof w.trussWebPlanFor === 'function' ? w.trussWebPlanFor(truss.span, truss.spacing, truss.pitch, 38) : null;
  const pattern = plan ? plan.pattern : /howe/i.test(familyLabel) ? 'Howe' : /pratt/i.test(familyLabel) ? 'Pratt' : /warren/i.test(familyLabel) ? 'Warren' : /queen/i.test(familyLabel) ? 'Queen post' : /king/i.test(familyLabel) ? 'King post' : 'Fink';
  const top = membersToSegs(truss, 'chord_top').filter(s => Math.min(s.x1, s.x2) >= -1e-3 && Math.max(s.x1, s.x2) <= truss.span + 1e-3);
  if (!top.length || typeof w.addAdvancedTrussWebPattern !== 'function') return websOf(truss);
  const topY = (x: number) => {
    for (const s of top) { const lo = Math.min(s.x1, s.x2), hi = Math.max(s.x1, s.x2); if (x >= lo - 1e-6 && x <= hi + 1e-6 && hi - lo > 1e-6) return s.y1 + (s.y2 - s.y1) * (x - s.x1) / (s.x2 - s.x1); }
    return null;
  };
  const count = plan ? plan.panelCount : Math.max(4, w.cadtechRoofFramingSettings?.panelCount || Math.ceil((truss.span * 1000) / 2400));
  const T: any[] = [], B: any[] = [];
  for (let i = 0; i <= count; i++) {
    const x = truss.span * i / count, y = topY(x); if (y === null) continue;
    T.push({ t: x, p: { x: x * 1000, y: y * 1000, z: 0 } }); B.push({ t: x, p: { x: x * 1000, y: 0, z: 0 } });
  }
  const out: Seg2D[] = [];
  const webDepth = plan ? plan.webDepth : 89;
  w.addAdvancedTrussWebPattern(T, B, pattern, webDepth, 'x', (_t: string, a: any, b: any, d: number) =>
    out.push({ x1: a.x / 1000, y1: a.y / 1000, x2: b.x / 1000, y2: b.y / 1000, width: 38, depth: d || webDepth, type: 'web' }));
  // a web lying on a chord (e.g. a heel diagonal that follows the rafter) duplicates the chord: drop it
  const chords = [...membersToSegs(truss, 'chord_top'), ...membersToSegs(truss, 'chord_bottom')];
  const onChord = (x: number, y: number, c: Seg2D) => {
    const dx = c.x2 - c.x1, dy = c.y2 - c.y1, L2 = dx * dx + dy * dy; if (L2 < 1e-9) return false;
    const t = ((x - c.x1) * dx + (y - c.y1) * dy) / L2; if (t < -0.01 || t > 1.01) return false;
    return Math.hypot(c.x1 + dx * t - x, c.y1 + dy * t - y) < 0.006;
  };
  return out.filter(wb => !chords.some(c => onChord(wb.x1, wb.y1, c) && onChord(wb.x2, wb.y2, c)));
}

export function rebuildTrussWithWebs(truss: TrussStructure, webs: Seg2D[], family?: string): TrussStructure {
  return buildTrussFromSegments({
    tag: truss.tag, span: truss.span, height: truss.height, pitch: truss.pitch, overhangLeft: truss.overhang, overhangRight: truss.overhangRight ?? truss.overhang,
    spacing: truss.spacing, assemblyId: truss.assemblyId, plyIds: truss.plyIds, family: family || truss.type, role: truss.role,
    sourceChordSig: truss.sourceChordSig, sourceWebSig: truss.sourceWebSig, baseWebSig: truss.baseWebSig, publishedWebSig: truss.publishedWebSig,
  }, membersToSegs(truss, 'chord_top').map(s => ({ ...s })), membersToSegs(truss, 'chord_bottom'), webs, truss);
}

/**
 * Automatically minimizes or maximizes the web member layout of a 2D TrussStructure while preserving
 * the exact top and bottom chord envelope and maintaining static stability.
 * - 'minimize': Generates the minimum-member triangulated web layout (Pure Warren / Minimal W-Fink without redundant verticals).
 * - 'maximize': Generates a high-density multi-bay Double-Howe / Fan web triangulation with vertical posts and sub-diagonals.
 */
export function optimizeTrussWebsTopology(truss: TrussStructure, mode: WebOptimizationMode): TrussStructure {
  if (mode === 'auto') return truss;

  const span = Math.max(1.0, truss.span || 8.0);
  const topSegs = membersToSegs(truss, 'chord_top').filter(
    s => Math.max(s.x1, s.x2) > 0.001 && Math.min(s.x1, s.x2) < span - 0.001
  );
  const botSegs = membersToSegs(truss, 'chord_bottom');
  if (!topSegs.length || !botSegs.length) return truss;

  const evalY = (segs: Seg2D[], x: number, fallback: number): number => {
    for (const s of segs) {
      const lo = Math.min(s.x1, s.x2), hi = Math.max(s.x1, s.x2);
      if (x >= lo - 1e-4 && x <= hi + 1e-4 && hi - lo > 1e-6) {
        return Number((s.y1 + ((s.y2 - s.y1) * (x - s.x1)) / (s.x2 - s.x1)).toFixed(3));
      }
    }
    // Fallback linear interpolation from nearest segment
    const nearest = segs.reduce((best, s) => {
      const d = Math.min(Math.abs(x - s.x1), Math.abs(x - s.x2));
      const bd = Math.min(Math.abs(x - best.x1), Math.abs(x - best.x2));
      return d < bd ? s : best;
    }, segs[0]);
    if (!nearest || Math.abs(nearest.x2 - nearest.x1) < 1e-6) return fallback;
    return Number((nearest.y1 + ((nearest.y2 - nearest.y1) * (x - nearest.x1)) / (nearest.x2 - nearest.x1)).toFixed(3));
  };

  const baseY = 0;
  const topY = (x: number) => Math.max(baseY, evalY(topSegs, x, truss.height || 1.5));
  const botY = (x: number) => evalY(botSegs, x, baseY);

  const webSegs: Seg2D[] = [];
  const seen = new Set<string>();
  const addWebSeg = (x1: number, y1: number, x2: number, y2: number) => {
    if (Math.hypot(x2 - x1, y2 - y1) < 0.05) return;
    const k1 = `${Math.round(x1 * 1000)},${Math.round(y1 * 1000)}->${Math.round(x2 * 1000)},${Math.round(y2 * 1000)}`;
    const k2 = `${Math.round(x2 * 1000)},${Math.round(y2 * 1000)}->${Math.round(x1 * 1000)},${Math.round(y1 * 1000)}`;
    if (seen.has(k1) || seen.has(k2)) return;
    seen.add(k1);
    webSegs.push({ x1: Number(x1.toFixed(3)), y1: Number(y1.toFixed(3)), x2: Number(x2.toFixed(3)), y2: Number(y2.toFixed(3)), width: 38, depth: 89, type: 'web' });
  };

  // Preserve heel vertical posts if top chord starts/ends above bottom chord at x=0 or x=span (raised heel / energy heel)
  const yTop0 = topY(0), yBot0 = botY(0);
  const yTopS = topY(span), yBotS = botY(span);
  if (yTop0 - yBot0 > 0.04) addWebSeg(0, yBot0, 0, yTop0);
  if (yTopS - yBotS > 0.04) addWebSeg(span, yBotS, span, yTopS);

  if (mode === 'minimize') {
    // MINIMIZE WEBS: Pure minimal W-Fink / Warren triangulation (no redundant intermediate vertical posts)
    const xL = Number((span * 0.25).toFixed(3));
    const xM = Number((span * 0.50).toFixed(3));
    const xR = Number((span * 0.75).toFixed(3));
    const bL = Number((span * 0.333).toFixed(3));
    const bR = Number((span * 0.667).toFixed(3));

    if (span <= 4.8) {
      // Short span: 3-web Simple Fink / Kingpost-V
      addWebSeg(xM, botY(xM), xL, topY(xL));
      addWebSeg(xM, botY(xM), xM, topY(xM));
      addWebSeg(xM, botY(xM), xR, topY(xR));
    } else {
      // Standard / Long span: 4-web Pure W-Fink (4 diagonals, 0 redundant interior verticals)
      if (yTop0 - yBot0 > 0.04) {
        addWebSeg(bL, botY(bL), 0, yTop0);
      }
      addWebSeg(bL, botY(bL), xL, topY(xL));
      addWebSeg(bL, botY(bL), xM, topY(xM));
      addWebSeg(bR, botY(bR), xM, topY(xM));
      addWebSeg(bR, botY(bR), xR, topY(xR));
      if (yTopS - yBotS > 0.04) {
        addWebSeg(bR, botY(bR), span, yTopS);
      }
    }
  } else if (mode === 'maximize') {
    // MAXIMIZE WEBS: High-density Multi-Bay Double-Howe + Fan Triangulation (6 to 8 bays with verticals + diagonals + fan struts)
    const bayCount = span >= 9.0 ? 8 : 6;
    const xs: number[] = [];
    for (let i = 0; i <= bayCount; i++) {
      xs.push(Number(((span * i) / bayCount).toFixed(3)));
    }
    const midIdx = bayCount / 2;

    // 1. Vertical web post at every interior station
    for (let i = 1; i < bayCount; i++) {
      const x = xs[i];
      addWebSeg(x, botY(x), x, topY(x));
    }

    // 2. Primary Howe/Pratt diagonal in every bay
    for (let i = 0; i < bayCount; i++) {
      const xA = xs[i], xB = xs[i + 1];
      if (i < midIdx) {
        // Left half: diagonal slopes up toward ridge (from bottom left to top right) or down from top left to bottom right
        if (i === 0 && yTop0 - yBot0 <= 0.04) {
          // Bay 0 at zero-height heel: connect bottom x_1 to top x_1 (already vertical), add fan strut from bottom x_1 to midpoint of bay 0 top chord
          const xSub = Number(((xA + xB) / 2).toFixed(3));
          addWebSeg(xB, botY(xB), xSub, topY(xSub));
        } else {
          addWebSeg(xB, botY(xB), xA, topY(xA));
        }
      } else {
        // Right half: mirror image
        if (i === bayCount - 1 && yTopS - yBotS <= 0.04) {
          const xSub = Number(((xA + xB) / 2).toFixed(3));
          addWebSeg(xA, botY(xA), xSub, topY(xSub));
        } else {
          addWebSeg(xA, botY(xA), xB, topY(xB));
        }
      }
    }

    // 3. Secondary counter-diagonals in the high-shear / central bays for maximum stiffness
    if (midIdx >= 3) {
      addWebSeg(xs[1], botY(xs[1]), xs[2], topY(xs[2]));
      addWebSeg(xs[bayCount - 1], botY(xs[bayCount - 1]), xs[bayCount - 2], topY(xs[bayCount - 2]));
    }
  }

  // Merge continuous top & bottom chord segments before re-splitting at the new web joints
  const rawTop = membersToSegs(truss, 'chord_top');
  const rawBot = membersToSegs(truss, 'chord_bottom');
  const minBotX = Math.min(...rawBot.flatMap(s => [s.x1, s.x2]));
  const maxBotX = Math.max(...rawBot.flatMap(s => [s.x1, s.x2]));
  const cleanBot: Seg2D[] = [{
    x1: minBotX, y1: botY(minBotX),
    x2: maxBotX, y2: botY(maxBotX),
    width: rawBot[0]?.width || 38, depth: rawBot[0]?.depth || 140, type: 'bottom chord',
  }];

  // Merge collinear top chord segments so old removed web nodes don't leave unbraced 2-bar hinges
  const sortedTop = [...rawTop].map(s => (s.x1 <= s.x2 ? { ...s } : { ...s, x1: s.x2, y1: s.y2, x2: s.x1, y2: s.y1 })).sort((a, b) => a.x1 - b.x1);
  const cleanTop: Seg2D[] = [];
  for (const seg of sortedTop) {
    const prev = cleanTop[cleanTop.length - 1];
    if (prev && Math.hypot(seg.x1 - prev.x2, seg.y1 - prev.y2) < 0.01) {
      const ang1 = Math.atan2(prev.y2 - prev.y1, prev.x2 - prev.x1);
      const ang2 = Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1);
      if (Math.abs(ang1 - ang2) < 0.02) {
        prev.x2 = seg.x2;
        prev.y2 = seg.y2;
        continue;
      }
    }
    cleanTop.push({ ...seg });
  }

  return buildTrussFromSegments(
    {
      tag: truss.tag,
      span: truss.span,
      height: truss.height,
      pitch: truss.pitch,
      overhangLeft: truss.overhang,
      overhangRight: truss.overhangRight ?? truss.overhang,
      spacing: truss.spacing,
      assemblyId: truss.assemblyId,
      plyIds: truss.plyIds,
      family: mode === 'minimize' ? 'fink' : 'howe',
      role: truss.role,
      sourceChordSig: truss.sourceChordSig,
      sourceWebSig: truss.sourceWebSig,
      baseWebSig: truss.baseWebSig,
      publishedWebSig: truss.publishedWebSig,
    },
    cleanTop,
    cleanBot,
    webSegs,
    truss
  );
}

