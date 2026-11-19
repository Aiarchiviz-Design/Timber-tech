// ============================================================================
// TIMBER TECK — EUROCODE 5 LOAD COMBINATION & STRUCTURAL AUDIT ENGINE
// Standards: EN 1990 (Basis of Structural Design: Eq. 6.10, 6.10a/6.10b, Table A1.1)
//            EN 1995-1-1 (Eurocode 5: Timber Structures — k_mod, gamma_M, §6.1, §6.3, §9.2.4)
//            I.S. EN 1990 / I.S. EN 1995-1-1 Irish & UK National Annex support
// ============================================================================

(function () {
  'use strict';

  const DEFAULT_EC5_LOAD_INPUTS = {
    nationalAnnex: 'EN1990_NA_IE',     // 'EN1990_NA_IE' | 'EN1990_BASE' | 'EN1990_NA_UK'
    combinationEquation: '6.10',       // '6.10' | '6.10ab'
    occupancyCategory: 'A',            // 'A' Residential, 'B' Office, 'C' Congregation, 'D' Shopping, 'E' Storage
    serviceClass: 2,                   // 1 (Dry/Interior), 2 (Covered/External Wall), 3 (Exposed)
    siteAltitudeM: 50,                 // Elevation m AOD (affects snow psi_0 above 1000m per EN 1990 Table A1.1)
    windVelocityMs: 27.0,
    windPressureKNm2: 1.15,            // Characteristic peak wind pressure q_p (kN/m²)
    windSuctionKNm2: 0.85,             // Characteristic net wind suction (kN/m²)
    roofUpliftKNm2: 0.65,              // Characteristic roof wind uplift (kN/m²)
    inPlaneRackingForceKNm: 4.2,       // Characteristic horizontal in-plane racking shear (kN/m)
    rackingDemandMode: 'characteristic', // 'characteristic' (applies 1.50 / 1.50*psi0_w) | 'derive_from_wind' | 'uls'
    snowLoadKNm2: 0.65,                // Characteristic roof/ground snow load s_k (kN/m²)
    roofDeadKNm2: 0.85,                // Permanent roof dead load G_k,roof (kN/m²)
    roofLiveKNm2: 0.60,                // Roof imposed / maintenance load Q_k,roof (Category H, kN/m²)
    roofTributarySpanM: 4.2,           // Tributary roof span to exterior wall (m)
    floorDeadKNm2: 0.75,               // Permanent floor dead load G_k,floor (kN/m²)
    floorLiveKNm2: 1.50,               // Imposed floor load Q_k,floor (kN/m²)
    floorTributarySpanM: 3.8,          // Tributary floor span (m)
    wallSelfWeightKNm2: 0.55,          // Wall self-weight (kN/m²)
    wallGravityLineKNm: null,          // Optional explicit top-plate G_k override (kN/m)
    maxPointReactionKN: 0,             // Optional concentrated beam/truss reaction Q_k or G_k+Q_k note (kN)
    fireResistanceMin: 30,
    deflectionLimitRatio: 300
  };

  // EN 1990 Table A1.1 Recommended Combination Factors
  const PSI_OCCUPANCY = {
    A: { label: 'Cat. A — Domestic / Residential', psi0: 0.70, psi1: 0.50, psi2: 0.30 },
    B: { label: 'Cat. B — Office Areas',          psi0: 0.70, psi1: 0.50, psi2: 0.30 },
    C: { label: 'Cat. C — Congregation Areas',    psi0: 0.70, psi1: 0.70, psi2: 0.60 },
    D: { label: 'Cat. D — Shopping Areas',        psi0: 0.70, psi1: 0.70, psi2: 0.60 },
    E: { label: 'Cat. E — Storage Areas',         psi0: 1.00, psi1: 0.90, psi2: 0.80 }
  };

  // EN 1995-1-1 Table 3.1 Modification Factors k_mod
  const EC5_KMOD_TIMBER = {
    1: { permanent: 0.60, 'long-term': 0.70, 'medium-term': 0.80, 'short-term': 0.90, instantaneous: 1.10 },
    2: { permanent: 0.60, 'long-term': 0.70, 'medium-term': 0.80, 'short-term': 0.90, instantaneous: 1.10 },
    3: { permanent: 0.50, 'long-term': 0.55, 'medium-term': 0.65, 'short-term': 0.70, instantaneous: 0.90 }
  };

  const EC5_KMOD_OSB = {
    1: { permanent: 0.40, 'long-term': 0.50, 'medium-term': 0.70, 'short-term': 0.90, instantaneous: 1.10 },
    2: { permanent: 0.30, 'long-term': 0.40, 'medium-term': 0.55, 'short-term': 0.70, instantaneous: 0.90 },
    3: { permanent: 0.20, 'long-term': 0.25, 'medium-term': 0.35, 'short-term': 0.45, instantaneous: 0.60 }
  };

  const EC5_KDEF_TIMBER = { 1: 0.60, 2: 0.80, 3: 2.00 };

  const EC5_TIMBER_PROPS = {
    C14:     { fm_k: 14.0, fc0_k: 16.0, fc90_k: 2.0, fv_k: 3.0, E0_mean: 7000,  E0_05: 4700,  gammaM: 1.30, family: 'dimensional' },
    C16:     { fm_k: 16.0, fc0_k: 17.0, fc90_k: 2.2, fv_k: 3.2, E0_mean: 8000,  E0_05: 5400,  gammaM: 1.30, family: 'dimensional' },
    C18:     { fm_k: 18.0, fc0_k: 18.0, fc90_k: 2.2, fv_k: 3.4, E0_mean: 9000,  E0_05: 6000,  gammaM: 1.30, family: 'dimensional' },
    C24:     { fm_k: 24.0, fc0_k: 21.0, fc90_k: 2.5, fv_k: 4.0, E0_mean: 11000, E0_05: 7400,  gammaM: 1.30, family: 'dimensional' },
    C30:     { fm_k: 30.0, fc0_k: 24.0, fc90_k: 2.7, fv_k: 4.0, E0_mean: 12000, E0_05: 8000,  gammaM: 1.30, family: 'dimensional' },
    TR26:    { fm_k: 26.0, fc0_k: 22.0, fc90_k: 2.6, fv_k: 4.0, E0_mean: 11000, E0_05: 7400,  gammaM: 1.30, family: 'dimensional' },
    'LVL-S': { fm_k: 44.0, fc0_k: 35.0, fc90_k: 6.0, fv_k: 4.2, E0_mean: 13800, E0_05: 11600, gammaM: 1.20, family: 'lvl' },
    GL24h:   { fm_k: 24.0, fc0_k: 24.0, fc90_k: 2.5, fv_k: 3.5, E0_mean: 11500, E0_05: 9600,  gammaM: 1.25, family: 'glulam' },
    GL28h:   { fm_k: 28.0, fc0_k: 28.0, fc90_k: 2.5, fv_k: 3.5, E0_mean: 12600, E0_05: 10500, gammaM: 1.25, family: 'glulam' },
    GL32h:   { fm_k: 32.0, fc0_k: 32.0, fc90_k: 2.5, fv_k: 3.5, E0_mean: 14200, E0_05: 11800, gammaM: 1.25, family: 'glulam' }
  };

  function numOr(val, fallback) {
    if (val === null || val === undefined || val === '') return fallback;
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  }

  function posNum(val, fallback) {
    if (val === null || val === undefined || val === '') return fallback;
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  function clampServiceClass(sc) {
    const n = Number(sc);
    if (n === 1) return 1;
    if (n === 3) return 3;
    return 2;
  }

  function getKmodTimber(serviceClass, durationClass) {
    const sc = clampServiceClass(serviceClass);
    return (EC5_KMOD_TIMBER[sc] && EC5_KMOD_TIMBER[sc][durationClass]) || 0.80;
  }

  function getKmodOSB(serviceClass, durationClass) {
    const sc = clampServiceClass(serviceClass);
    return (EC5_KMOD_OSB[sc] && EC5_KMOD_OSB[sc][durationClass]) || 0.70;
  }

  function getPartialAndPsiFactors(inputs) {
    const annex = inputs.nationalAnnex || 'EN1990_NA_IE';
    const eqMode = inputs.combinationEquation || '6.10';
    const cat = PSI_OCCUPANCY[inputs.occupancyCategory] ? inputs.occupancyCategory : 'A';
    const floorPsi = PSI_OCCUPANCY[cat];
    const highAlt = Number(inputs.siteAltitudeM || 0) > 1000;

    // Snow psi factors (EN 1990 Table A1.1)
    const snowPsi = highAlt
      ? { psi0: 0.70, psi1: 0.50, psi2: 0.20 }
      : { psi0: 0.50, psi1: 0.20, psi2: 0.00 };

    // Wind psi_0 is 0.50 in Irish & UK National Annexes, 0.60 in Base EN 1990
    const windPsi0 = (annex === 'EN1990_NA_IE' || annex === 'EN1990_NA_UK') ? 0.50 : 0.60;
    const windPsi = { psi0: windPsi0, psi1: 0.20, psi2: 0.00 };

    // Roof maintenance Cat H (EN 1990 Table A1.1)
    const roofPsi = { psi0: 0.00, psi1: 0.00, psi2: 0.00 };

    return {
      annex,
      eqMode,
      gammaG_sup: 1.35,
      gammaG_red: eqMode === '6.10ab' ? +(0.85 * 1.35).toFixed(4) : 1.35, // 1.1475 (~1.15) for Eq 6.10b
      gammaG_inf: 1.00,
      gammaG_overturn: 0.90, // Conservative favorable dead load for hold-down tension
      gammaQ: 1.50,
      xi: 0.85,
      floor: floorPsi,
      snow: snowPsi,
      roof: roofPsi,
      wind: windPsi
    };
  }

  /**
   * Resolves and merges characteristic load inputs from explicit overrides,
   * `model.wallStudioLoads`, and `model.structuralDesign.ireland`.
   */
  function resolveLoadInputs(customModel, overrideInputs) {
    const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
    const ws = (mModel && mModel.wallStudioLoads && typeof mModel.wallStudioLoads === 'object') ? mModel.wallStudioLoads : {};
    const ie = (mModel && mModel.structuralDesign && mModel.structuralDesign.ireland && typeof mModel.structuralDesign.ireland === 'object')
      ? mModel.structuralDesign.ireland
      : {};
    const ov = (overrideInputs && typeof overrideInputs === 'object') ? overrideInputs : {};

    const pick = (keys, defVal) => {
      for (const k of keys) {
        if (ov[k] !== undefined && ov[k] !== null && ov[k] !== '') return ov[k];
      }
      // Check wallStudioLoads before structuralDesign.ireland unless wallStudioLoads equals untouched defaults and ireland has a value
      for (const k of keys) {
        if (ws[k] !== undefined && ws[k] !== null && ws[k] !== '') {
          const isDefault = k in DEFAULT_EC5_LOAD_INPUTS && ws[k] === DEFAULT_EC5_LOAD_INPUTS[k] && !ws._customized;
          if (!isDefault) return ws[k];
        }
      }
      for (const k of keys) {
        if (ie[k] !== undefined && ie[k] !== null && ie[k] !== '') return ie[k];
      }
      for (const k of keys) {
        if (ws[k] !== undefined && ws[k] !== null && ws[k] !== '') return ws[k];
      }
      return defVal;
    };

    const rawEq = String(pick(['combinationEquation'], DEFAULT_EC5_LOAD_INPUTS.combinationEquation));
    const eqMode = (rawEq === '6.10ab' || rawEq === '6.10a/6.10b') ? '6.10ab' : '6.10';
    const rawBasis = String(ie.loadCombinationBasis || '');
    const annex = String(pick(['nationalAnnex'],
      (mModel?.structuralDesign?.region === 'IE' || rawBasis.includes('Irish')) ? 'EN1990_NA_IE' :
      (mModel?.structuralDesign?.region === 'UK') ? 'EN1990_NA_UK' : DEFAULT_EC5_LOAD_INPUTS.nationalAnnex
    ));

    const resolved = {
      nationalAnnex: annex,
      combinationEquation: eqMode,
      occupancyCategory: String(pick(['occupancyCategory'], DEFAULT_EC5_LOAD_INPUTS.occupancyCategory)),
      serviceClass: clampServiceClass(pick(['serviceClass'], DEFAULT_EC5_LOAD_INPUTS.serviceClass)),
      siteAltitudeM: posNum(pick(['siteAltitudeM'], DEFAULT_EC5_LOAD_INPUTS.siteAltitudeM), 50),
      windVelocityMs: posNum(pick(['windVelocityMs', 'basicWindVelocityMS'], DEFAULT_EC5_LOAD_INPUTS.windVelocityMs), 27.0),
      windPressureKNm2: posNum(pick(['windPressureKNm2'], DEFAULT_EC5_LOAD_INPUTS.windPressureKNm2), 1.15),
      windSuctionKNm2: posNum(pick(['windSuctionKNm2'], DEFAULT_EC5_LOAD_INPUTS.windSuctionKNm2), 0.85),
      roofUpliftKNm2: posNum(pick(['roofUpliftKNm2'], DEFAULT_EC5_LOAD_INPUTS.roofUpliftKNm2), 0.65),
      inPlaneRackingForceKNm: posNum(pick(['inPlaneRackingForceKNm', 'inPlaneShearKNm'], DEFAULT_EC5_LOAD_INPUTS.inPlaneRackingForceKNm), 4.2),
      rackingDemandMode: String(pick(['rackingDemandMode'], DEFAULT_EC5_LOAD_INPUTS.rackingDemandMode)),
      snowLoadKNm2: posNum(pick(['snowLoadKNm2', 'roofSnowKNm2', 'groundSnowKNm2'], DEFAULT_EC5_LOAD_INPUTS.snowLoadKNm2), 0.65),
      roofDeadKNm2: posNum(pick(['roofDeadKNm2'], DEFAULT_EC5_LOAD_INPUTS.roofDeadKNm2), 0.85),
      roofLiveKNm2: posNum(pick(['roofLiveKNm2', 'roofImposedKNm2'], DEFAULT_EC5_LOAD_INPUTS.roofLiveKNm2), 0.60),
      roofTributarySpanM: posNum(pick(['roofTributarySpanM'], DEFAULT_EC5_LOAD_INPUTS.roofTributarySpanM), 4.2),
      floorDeadKNm2: posNum(pick(['floorDeadKNm2'], DEFAULT_EC5_LOAD_INPUTS.floorDeadKNm2), 0.75),
      floorLiveKNm2: posNum(pick(['floorLiveKNm2', 'floorImposedKNm2'], DEFAULT_EC5_LOAD_INPUTS.floorLiveKNm2), 1.50),
      floorTributarySpanM: posNum(pick(['floorTributarySpanM'], DEFAULT_EC5_LOAD_INPUTS.floorTributarySpanM), 3.8),
      wallSelfWeightKNm2: posNum(pick(['wallSelfWeightKNm2'], DEFAULT_EC5_LOAD_INPUTS.wallSelfWeightKNm2), 0.55),
      wallGravityLineKNm: pick(['wallGravityLineKNm'], null) !== null ? posNum(pick(['wallGravityLineKNm'], 0), null) : null,
      maxPointReactionKN: posNum(pick(['maxPointReactionKN'], 0), 0),
      fireResistanceMin: posNum(pick(['fireResistanceMin'], DEFAULT_EC5_LOAD_INPUTS.fireResistanceMin), 30),
      deflectionLimitRatio: posNum(pick(['deflectionLimitRatio'], DEFAULT_EC5_LOAD_INPUTS.deflectionLimitRatio), 300),
      source: Object.keys(ov).length ? 'override' : (ws._customized ? 'project-loads' : (Object.keys(ie).length ? 'ireland-register' : 'default'))
    };

    return resolved;
  }

  function getWallGeometryContext(w, mModel) {
    if (!w) {
      return {
        wallId: 'WALL',
        isExt: true,
        lenMm: 4000,
        lenM: 4.0,
        heightMm: 2700,
        heightM: 2.7,
        storiesAbove: 0,
        openings: [],
        openingRatio: 0,
        concentrationFactor: 1.0,
        studWidth: 38,
        studDepth: 140,
        spacingMm: 400,
        timberGrade: 'C24',
        sheathingThicknessMm: 12,
        sheathingFace: 'exterior',
        edgeNailSpacingMm: 150,
        piers: [{ pierId: 'PIER-1', x0: 0, x1: 4000, widthMm: 4000, minRequiredWidthMm: 675, aspectRatio: 0.68, ciFactor: 1.0, isEffective: true }]
      };
    }

    const c = typeof window !== 'undefined' && typeof window.construction === 'function'
      ? window.construction(w)
      : (w.framing || {});
    const isExt = typeof window !== 'undefined' && typeof window.isExteriorWall === 'function'
      ? window.isExteriorWall(w)
      : Boolean(w.layer === 'Exterior Walls' || w.isExterior || (w.thickness || 140) >= 130);

    const dist = (a, b) => (a && b) ? Math.hypot((b.x || 0) - (a.x || 0), (b.y || 0) - (a.y || 0)) : 4000;
    const lenMm = Math.max(500, Math.round(dist(w.a, w.b)));
    const lenM = lenMm / 1000;
    const heightMm = Math.max(1000, Math.round(
      (typeof window !== 'undefined' && typeof window.heightOf === 'function')
        ? window.heightOf(w)
        : (Number(w.height) || 2700)
    ));
    const heightM = heightMm / 1000;

    const stories = Array.isArray(mModel?.stories) ? mModel.stories : [];
    const wallStory = stories.find(s => s.id === w.story) || stories[0] || { elevation: 0 };
    const storiesAbove = stories.filter(s => (s.elevation || 0) > (wallStory.elevation || 0) + 10).length;

    const openings = (typeof window !== 'undefined' && typeof window.hosted === 'function'
      ? window.hosted(w)
      : (mModel?.elements || []).filter(e => e && e.host === w.id))
      .filter(o => (o.width || 0) > 50)
      .sort((a, b) => ((a.offset || 0) - (a.width || 0) / 2) - ((b.offset || 0) - (b.width || 0) / 2));

    const totalOpeningWidth = openings.reduce((s, o) => s + (o.width || 0), 0);
    const openingRatio = Math.min(0.75, totalOpeningWidth / lenMm);
    const concentrationFactor = 1 / Math.max(0.45, 1 - openingRatio * 0.50);

    // Sheathing & nail spacing
    const shCfg = c.sheathingConfig || {};
    const ie = mModel?.structuralDesign?.ireland || {};
    const sheathingFace = w.sheathingSide || c.sheathingSide || (isExt ? 'exterior' : 'none');
    const sheathingThicknessMm = Number(shCfg.thicknessMm || ie.osbThicknessMM) || 12;
    const edgeNailSpacingMm = Number(shCfg.edgeNailSpacingMm || ie.osbEdgeFixingSpacingMM) || 150;

    // Segmented piers (EN 1995-1-1 §9.2.4.2)
    const rawSegments = [];
    let cursor = 0;
    for (const o of openings) {
      const oL = Math.max(0, (o.offset || 0) - (o.width || 0) / 2);
      const oR = Math.min(lenMm, (o.offset || 0) + (o.width || 0) / 2);
      if (oL - cursor > 100) {
        rawSegments.push({ x0: Math.round(cursor), x1: Math.round(oL), lengthMm: Math.round(oL - cursor) });
      }
      cursor = Math.max(cursor, oR);
    }
    if (lenMm - cursor > 100) {
      rawSegments.push({ x0: Math.round(cursor), x1: Math.round(lenMm), lengthMm: Math.round(lenMm - cursor) });
    }

    const minPierWidthMm = Math.round(heightMm / 4);
    const b0_mm = heightMm / 2;
    const faceFactor = sheathingFace === 'both' ? 1.85 : (sheathingFace === 'none' ? 0 : 1.0);
    const piers = rawSegments.map((seg, i) => {
      const isEffective = seg.lengthMm >= minPierWidthMm && faceFactor > 0;
      const ci = !isEffective ? 0 : (seg.lengthMm >= b0_mm ? 1.0 : +(seg.lengthMm / b0_mm).toFixed(3));
      return {
        pierId: `PIER-${i + 1}`,
        x0: seg.x0,
        x1: seg.x1,
        widthMm: seg.lengthMm,
        minRequiredWidthMm: minPierWidthMm,
        aspectRatio: +(heightMm / Math.max(1, seg.lengthMm)).toFixed(2),
        ciFactor: ci,
        isEffective
      };
    });

    const sw = Number(c.studWidth) || 38;
    const sd = Number(c.studDepth) || 140;
    const spacingMm = Math.max(200, Number(c.spacing) || 400);
    const grade = c.timberGrade || ie.timberGrade || (isExt ? 'C24' : 'C16');

    return {
      wallId: w.id,
      isExt,
      lenMm,
      lenM,
      heightMm,
      heightM,
      storiesAbove,
      openings,
      openingRatio,
      concentrationFactor,
      studWidth: sw,
      studDepth: sd,
      spacingMm,
      timberGrade: EC5_TIMBER_PROPS[grade] ? grade : 'C24',
      sheathingThicknessMm,
      sheathingFace,
      edgeNailSpacingMm,
      faceFactor,
      piers
    };
  }

  /**
   * Computes EN 1995-1-1 stud axial compression + bending utilization under a specific combination.
   */
  function evaluateEC5StudForCombination(wallCtx, qAxialLine_kNm, windPressure_kNm2, windSuction_kNm2, kmod) {
    const mat = EC5_TIMBER_PROPS[wallCtx.timberGrade] || EC5_TIMBER_PROPS.C24;
    const gammaM = mat.gammaM || 1.30;
    const fc0_d = (kmod * mat.fc0_k) / gammaM;
    const fm_d = (kmod * mat.fm_k) / gammaM;

    const s_m = wallCtx.spacingMm / 1000;
    const h_m = wallCtx.heightM;
    const b = wallCtx.studWidth;
    const d = wallCtx.studDepth;
    const A = Math.max(1, b * d);
    const W_y = Math.max(1, (b * d * d) / 6);
    const I_y = Math.max(1, (b * d * d * d) / 12);

    const netWind_kNm2 = Math.max(Math.abs(windPressure_kNm2 || 0), Math.abs(windSuction_kNm2 || 0));
    const N_Ed_kN = qAxialLine_kNm * s_m;
    const M_Ed_kNm = (netWind_kNm2 * s_m * h_m * h_m) / 8;

    const sigma_c = (N_Ed_kN * 1000) / A;
    const sigma_m = (M_Ed_kNm * 1e6) / W_y;

    // Buckling about strong axis (EN 1995-1-1 §6.3.2)
    const i_y = d / Math.sqrt(12);
    const lambda_y = wallCtx.heightMm / Math.max(1, i_y);
    const lambda_rel = (lambda_y / Math.PI) * Math.sqrt(mat.fc0_k / mat.E0_05);
    const beta_c = mat.family === 'glulam' || mat.family === 'lvl' ? 0.1 : 0.2;
    const k_y = 0.5 * (1 + beta_c * (lambda_rel - 0.3) + lambda_rel * lambda_rel);
    const kc_y = lambda_rel <= 0.3 ? 1.0 : 1 / Math.max(1, k_y + Math.sqrt(Math.max(0, k_y * k_y - lambda_rel * lambda_rel)));

    const N_Rd_kN = (kc_y * fc0_d * A) / 1000;
    const axialUtil = sigma_c / Math.max(0.05, kc_y * fc0_d);
    const bendingUtil = sigma_m / Math.max(0.05, fm_d);
    const combinedDC = axialUtil + bendingUtil;
    const hOverD = wallCtx.heightMm / Math.max(1, d);
    const slendernessRatio = hOverD / 24;

    return {
      kmod: +kmod.toFixed(2),
      gammaM,
      fc0_d: +fc0_d.toFixed(2),
      fm_d: +fm_d.toFixed(2),
      kc_y: +kc_y.toFixed(3),
      lambda_rel: +lambda_rel.toFixed(2),
      hOverD: +hOverD.toFixed(1),
      N_Ed_kN: +N_Ed_kN.toFixed(2),
      N_Rd_kN: +N_Rd_kN.toFixed(2),
      M_Ed_kNm: +M_Ed_kNm.toFixed(3),
      sigma_c_MPa: +sigma_c.toFixed(2),
      sigma_m_MPa: +sigma_m.toFixed(2),
      axialUtil: +axialUtil.toFixed(3),
      bendingUtil: +bendingUtil.toFixed(3),
      combinedDC: +combinedDC.toFixed(4),
      axialDC_pct: Math.round(axialUtil * 100),
      bendingDC_pct: Math.round(bendingUtil * 100),
      combinedDC_pct: Math.round(combinedDC * 100),
      slendernessDC_pct: Math.round(slendernessRatio * 100)
    };
  }

  /**
   * Computes EN 1995-1-1 §9.2.4 Method A racking resistance & hold-down overturning under a specific combination.
   */
  function evaluateEC5RackingForCombination(wallCtx, v_Ed_kNm, gk_stabilizing_kNm, kmodOSB) {
    // EN 1995-1-1 §9.2.4.2: F_f,Rk ~ 1.18 kN (2.8x63 ring nails, 12mm OSB/3), Method A 1.2x fastener boost
    const F_f_Rk = 1.18 * (wallCtx.sheathingThicknessMm / 12);
    const gammaM_panel = 1.30;
    const F_f_Rd = (kmodOSB * F_f_Rk * 1.2) / gammaM_panel;
    const f_v_Rd_perM = wallCtx.faceFactor > 0
      ? (F_f_Rd / (Math.max(50, wallCtx.edgeNailSpacingMm) / 1000)) * wallCtx.faceFactor
      : 0;

    const piers = wallCtx.piers.map(p => {
      const bM = p.widthMm / 1000;
      const capKN = +(f_v_Rd_perM * bM * p.ciFactor).toFixed(2);
      return { ...p, unitResKNm: +f_v_Rd_perM.toFixed(2), capacityKN: capKN };
    });

    const totalCapacityKN = +piers.reduce((s, p) => s + p.capacityKN, 0).toFixed(2);
    const effectiveLengthM = +(piers.filter(p => p.isEffective).reduce((s, p) => s + p.widthMm, 0) / 1000).toFixed(2);
    const V_Ed_kN = +(v_Ed_kNm * wallCtx.lenM).toFixed(2);
    const rackingDC_pct = totalCapacityKN > 0 ? Math.round((V_Ed_kN / totalCapacityKN) * 100) : (V_Ed_kN > 0 ? 999 : 0);

    // Overturning hold-down tension at effective pier ends: T_Ed = V_Ed * h / L_eff - G_k,fav * (L_eff / 2)
    const levM = Math.max(0.9, effectiveLengthM || wallCtx.lenM);
    const grossOverturnKN = (V_Ed_kN * wallCtx.heightM) / levM;
    const stabilizingKN = gk_stabilizing_kNm * Math.max(0.6, levM * 0.5);
    const netHoldDownTensionKN = +Math.max(0, grossOverturnKN - stabilizingKN).toFixed(2);

    return {
      kmodOSB: +kmodOSB.toFixed(2),
      unitResistanceKNm: +f_v_Rd_perM.toFixed(2),
      v_Ed_kNm: +v_Ed_kNm.toFixed(2),
      V_Ed_kN,
      F_vRd_kN: totalCapacityKN,
      effectiveLengthM,
      rackingDC_pct,
      netHoldDownTensionKN,
      piers
    };
  }

  /**
   * Computes all Eurocode 5 (EN 1990 + EN 1995-1-1) load combinations and returns
   * complete combination table + governing axial compression & racking shear envelopes.
   */
  function computeEurocode5LoadCombinations(loadInputs, wallOrCtx, customModel) {
    const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
    const inputs = (loadInputs && loadInputs.windPressureKNm2 !== undefined && loadInputs.serviceClass !== undefined)
      ? loadInputs
      : resolveLoadInputs(mModel, loadInputs);

    const wallCtx = (wallOrCtx && wallOrCtx.wallId && Array.isArray(wallOrCtx.piers))
      ? wallOrCtx
      : getWallGeometryContext(wallOrCtx && wallOrCtx.type === 'wall' ? wallOrCtx : null, mModel);

    const f = getPartialAndPsiFactors(inputs);
    const isExt = wallCtx.isExt;

    // Characteristic Gravity Actions per metre of wall (kN/m)
    const roofTribM = isExt ? inputs.roofTributarySpanM : (inputs.roofTributarySpanM * 0.45);
    const floorTribM = isExt ? (inputs.floorTributarySpanM * 0.5) : inputs.floorTributarySpanM;

    const gkRoof_kNm = inputs.roofDeadKNm2 * roofTribM;
    const gkFloor_kNm = wallCtx.storiesAbove * (inputs.floorDeadKNm2 * floorTribM);
    const gkWall_kNm = inputs.wallSelfWeightKNm2 * wallCtx.heightM;
    const computedGk_kNm = gkRoof_kNm + gkFloor_kNm + gkWall_kNm;
    const Gk_kNm = (Number.isFinite(inputs.wallGravityLineKNm) && inputs.wallGravityLineKNm > 0)
      ? Math.max(computedGk_kNm, inputs.wallGravityLineKNm)
      : computedGk_kNm;

    const Qk_floor_kNm = wallCtx.storiesAbove * (inputs.floorLiveKNm2 * floorTribM);
    const Qk_snow_kNm = inputs.snowLoadKNm2 * roofTribM;
    const Qk_roof_kNm = inputs.roofLiveKNm2 * roofTribM;

    // Out-of-plane wind (kN/m²) & in-plane racking characteristic demand (kN/m)
    const Wk_press_kNm2 = isExt ? inputs.windPressureKNm2 : 0.25;
    const Wk_suct_kNm2 = isExt ? inputs.windSuctionKNm2 : 0.20;

    let Vk_racking_kNm;
    if (inputs.rackingDemandMode === 'derive_from_wind') {
      // Derive characteristic line shear from wind pressure on wall + roof diaphragm depth
      const roofFaceH = 1.6;
      const diagFactor = isExt ? 1.0 : 0.55;
      Vk_racking_kNm = +((inputs.windPressureKNm2 * (wallCtx.heightM * 0.5 + roofFaceH) * 1.15) * diagFactor).toFixed(2);
    } else {
      Vk_racking_kNm = +(isExt ? inputs.inPlaneRackingForceKNm : (inputs.inPlaneRackingForceKNm * 0.55)).toFixed(2);
    }

    const rFactorQ = inputs.rackingDemandMode === 'uls' ? 1.0 : f.gammaQ;
    const rFactorAcc = inputs.rackingDemandMode === 'uls' ? f.wind.psi0 : (f.gammaQ * f.wind.psi0);

    // Build EN 1990 combination definitions
    const comboSpecs = [];
    const gammaG_main = f.eqMode === '6.10ab' ? f.gammaG_red : f.gammaG_sup;

    // LC-1: Permanent Only (Eq. 6.10 / 6.10a permanent)
    comboSpecs.push({
      id: 'EC5-ULS-1',
      shortLabel: '1.35G',
      equation: 'EN 1990 Eq. (6.10) — Permanent',
      formula: '1.35·Gk',
      state: 'ULS',
      durationClass: 'permanent',
      gammaG: f.gammaG_sup,
      qFloorCoeff: 0,
      qSnowCoeff: 0,
      qRoofCoeff: 0,
      windCoeff: 0,
      rackCoeff: 0
    });

    // LC-2: Floor Imposed Leading (6.10 / 6.10b)
    if (Qk_floor_kNm > 0.01) {
      comboSpecs.push({
        id: 'EC5-ULS-2',
        shortLabel: `${gammaG_main}G + 1.5Q_fl`,
        equation: f.eqMode === '6.10ab' ? 'EN 1990 Eq. (6.10b) — Floor Leading' : 'EN 1990 Eq. (6.10) — Floor Leading',
        formula: `${gammaG_main}·Gk + 1.50·Qk,fl + ${(1.5 * f.snow.psi0).toFixed(2)}·Sk + ${(1.5 * f.wind.psi0).toFixed(2)}·Wk`,
        state: 'ULS',
        durationClass: 'medium-term',
        gammaG: gammaG_main,
        qFloorCoeff: f.gammaQ,
        qSnowCoeff: f.gammaQ * f.snow.psi0,
        qRoofCoeff: 0,
        windCoeff: f.gammaQ * f.wind.psi0,
        rackCoeff: rFactorAcc
      });
    }

    // LC-3: Snow Leading
    comboSpecs.push({
      id: 'EC5-ULS-3',
      shortLabel: `${gammaG_main}G + 1.5S`,
      equation: f.eqMode === '6.10ab' ? 'EN 1990 Eq. (6.10b) — Snow Leading' : 'EN 1990 Eq. (6.10) — Snow Leading',
      formula: `${gammaG_main}·Gk + 1.50·Sk + ${(1.5 * f.floor.psi0).toFixed(2)}·Qk,fl + ${(1.5 * f.wind.psi0).toFixed(2)}·Wk`,
      state: 'ULS',
      durationClass: 'short-term',
      gammaG: gammaG_main,
      qFloorCoeff: f.gammaQ * f.floor.psi0,
      qSnowCoeff: f.gammaQ,
      qRoofCoeff: 0,
      windCoeff: f.gammaQ * f.wind.psi0,
      rackCoeff: rFactorAcc
    });

    // LC-4: Roof Maintenance / Imposed Leading (Cat. H: cannot coexist with snow/wind generally, or check gravity max)
    comboSpecs.push({
      id: 'EC5-ULS-4',
      shortLabel: `${gammaG_main}G + 1.5Q_rf`,
      equation: f.eqMode === '6.10ab' ? 'EN 1990 Eq. (6.10b) — Roof Imposed' : 'EN 1990 Eq. (6.10) — Roof Imposed',
      formula: `${gammaG_main}·Gk + 1.50·Qk,rf + ${(1.5 * f.floor.psi0).toFixed(2)}·Qk,fl`,
      state: 'ULS',
      durationClass: 'short-term',
      gammaG: gammaG_main,
      qFloorCoeff: f.gammaQ * f.floor.psi0,
      qSnowCoeff: 0,
      qRoofCoeff: f.gammaQ,
      windCoeff: 0,
      rackCoeff: 0
    });

    // LC-5: Wind Leading + Gravity (Axial + Lateral Wind Bending + In-Plane Shear)
    comboSpecs.push({
      id: 'EC5-ULS-5',
      shortLabel: `${gammaG_main}G + 1.5W`,
      equation: f.eqMode === '6.10ab' ? 'EN 1990 Eq. (6.10b) — Wind Leading' : 'EN 1990 Eq. (6.10) — Wind Leading',
      formula: `${gammaG_main}·Gk + 1.50·Wk + ${(1.5 * f.snow.psi0).toFixed(2)}·Sk + ${(1.5 * f.floor.psi0).toFixed(2)}·Qk,fl`,
      state: 'ULS',
      durationClass: 'short-term', // Conservative EN 1995-1-1 IE/UK Wind duration (0.90 SC1/SC2); instantaneous 1.10 also tracked
      gammaG: gammaG_main,
      qFloorCoeff: f.gammaQ * f.floor.psi0,
      qSnowCoeff: f.gammaQ * f.snow.psi0,
      qRoofCoeff: 0,
      windCoeff: f.gammaQ,
      rackCoeff: rFactorQ
    });

    // LC-6: Wind Leading — Favorable Dead Load (Racking Overturning & Uplift Tension)
    comboSpecs.push({
      id: 'EC5-ULS-6',
      shortLabel: '1.0G_fav + 1.5W',
      equation: 'EN 1990 Eq. (6.10) — Wind Uplift & Overturning',
      formula: '1.00·Gk,inf + 1.50·Wk (Favorable G)',
      state: 'ULS',
      durationClass: 'instantaneous',
      gammaG: f.gammaG_inf,
      gammaG_stabilizing: f.gammaG_overturn,
      qFloorCoeff: 0,
      qSnowCoeff: 0,
      qRoofCoeff: 0,
      windCoeff: f.gammaQ,
      rackCoeff: rFactorQ
    });

    // Eq. 6.10a accompanying combination when 6.10ab is selected
    if (f.eqMode === '6.10ab') {
      comboSpecs.push({
        id: 'EC5-ULS-610a',
        shortLabel: '1.35G + 1.5·ψ0·Q',
        equation: 'EN 1990 Eq. (6.10a) — Permanent + Accompanying Q',
        formula: `1.35·Gk + ${(1.5 * f.floor.psi0).toFixed(2)}·Qk,fl + ${(1.5 * f.snow.psi0).toFixed(2)}·Sk + ${(1.5 * f.wind.psi0).toFixed(2)}·Wk`,
        state: 'ULS',
        durationClass: 'medium-term',
        gammaG: f.gammaG_sup,
        qFloorCoeff: f.gammaQ * f.floor.psi0,
        qSnowCoeff: f.gammaQ * f.snow.psi0,
        qRoofCoeff: 0,
        windCoeff: f.gammaQ * f.wind.psi0,
        rackCoeff: rFactorAcc
      });
    }

    // Evaluate all ULS combinations
    const ulsResults = comboSpecs.map(spec => {
      const kmod = getKmodTimber(inputs.serviceClass, spec.durationClass);
      const kmodOSB = getKmodOSB(inputs.serviceClass, spec.durationClass);

      const qRaw_kNm =
        spec.gammaG * Gk_kNm +
        spec.qFloorCoeff * Qk_floor_kNm +
        spec.qSnowCoeff * Qk_snow_kNm +
        spec.qRoofCoeff * Qk_roof_kNm;
      const qAxial_kNm = +(qRaw_kNm * wallCtx.concentrationFactor).toFixed(2);
      const windP_kNm2 = +(spec.windCoeff * Wk_press_kNm2).toFixed(2);
      const windS_kNm2 = +(spec.windCoeff * Wk_suct_kNm2).toFixed(2);
      const vEd_kNm = +(spec.rackCoeff * Vk_racking_kNm).toFixed(2);
      const gkStab_kNm = (spec.gammaG_stabilizing !== undefined ? spec.gammaG_stabilizing : spec.gammaG) * Gk_kNm;

      const stud = evaluateEC5StudForCombination(wallCtx, qAxial_kNm, windP_kNm2, windS_kNm2, kmod);
      const racking = evaluateEC5RackingForCombination(wallCtx, vEd_kNm, gkStab_kNm, kmodOSB);

      return {
        ...spec,
        kmod,
        kmodOSB,
        qRaw_kNm: +qRaw_kNm.toFixed(2),
        qAxial_kNm,
        windPressure_kNm2: windP_kNm2,
        windSuction_kNm2: windS_kNm2,
        vEd_kNm,
        stud,
        racking
      };
    });

    // SLS Combinations (Deflection & Creep)
    const qFloorSlsLead = Qk_floor_kNm + f.snow.psi0 * Qk_snow_kNm;
    const qSnowSlsLead = Qk_snow_kNm + f.floor.psi0 * Qk_floor_kNm;
    const slsCharAxial_kNm = +(Gk_kNm + Math.max(qFloorSlsLead, qSnowSlsLead, Qk_roof_kNm)).toFixed(2);
    const slsQuasiAxial_kNm = +(Gk_kNm + f.floor.psi2 * Qk_floor_kNm + f.snow.psi2 * Qk_snow_kNm).toFixed(2);
    const slsWind_kNm2 = +Math.max(Wk_press_kNm2, Wk_suct_kNm2).toFixed(2);

    const I_y = (wallCtx.studWidth * Math.pow(wallCtx.studDepth, 3)) / 12;
    const E0_mean = (EC5_TIMBER_PROPS[wallCtx.timberGrade] || EC5_TIMBER_PROPS.C24).E0_mean;
    const w_sls_Nmm = slsWind_kNm2 * (wallCtx.spacingMm / 1000);
    const instDeflMm = +((5 * w_sls_Nmm * Math.pow(wallCtx.heightMm, 4)) / (384 * E0_mean * Math.max(1, I_y))).toFixed(2);
    const kdef = EC5_KDEF_TIMBER[inputs.serviceClass] || 0.80;
    const deflLimitMm = +(wallCtx.heightMm / Math.max(150, inputs.deflectionLimitRatio || 300)).toFixed(1);

    const slsResults = [
      {
        id: 'EC5-SLS-1',
        shortLabel: '1.0G + 1.0Q + ψ0·W',
        equation: 'EN 1990 Eq. (6.14b) — Characteristic SLS',
        formula: `1.00·Gk + 1.00·Qk + ${f.wind.psi0.toFixed(2)}·Wk`,
        state: 'SLS',
        qAxial_kNm: slsCharAxial_kNm,
        windPressure_kNm2: slsWind_kNm2,
        instDeflMm,
        deflLimitMm
      },
      {
        id: 'EC5-SLS-2',
        shortLabel: `1.0G + ${f.floor.psi2}Q_fl`,
        equation: 'EN 1990 Eq. (6.16b) — Quasi-Permanent (Creep)',
        formula: `1.00·Gk + ${f.floor.psi2.toFixed(2)}·Qk,fl + ${f.snow.psi2.toFixed(2)}·Sk`,
        state: 'SLS',
        qAxial_kNm: slsQuasiAxial_kNm,
        windPressure_kNm2: 0,
        kdef,
        longTermFactor: +(1 + kdef).toFixed(2)
      }
    ];

    // Governing ULS Combinations
    const governingAxialPure = ulsResults.reduce((best, cur) =>
      (!best || cur.stud.axialUtil > best.stud.axialUtil) ? cur : best, null);

    const governingCombined = ulsResults.reduce((best, cur) =>
      (!best || cur.stud.combinedDC > best.stud.combinedDC) ? cur : best, null);

    const governingRacking = ulsResults.reduce((best, cur) => {
      if (!best) return cur;
      if (cur.racking.rackingDC_pct !== best.racking.rackingDC_pct) {
        return cur.racking.rackingDC_pct > best.racking.rackingDC_pct ? cur : best;
      }
      return cur.racking.netHoldDownTensionKN > best.racking.netHoldDownTensionKN ? cur : best;
    }, null);

    const governingUplift = ulsResults.reduce((best, cur) =>
      (!best || cur.racking.netHoldDownTensionKN > best.racking.netHoldDownTensionKN) ? cur : best, null);

    const deflPct = Math.round((instDeflMm / Math.max(0.1, deflLimitMm)) * 100);
    const slendernessFloor = governingCombined.stud.hOverD > 24 ? Math.round((governingCombined.stud.hOverD / 24) * 100) : 0;
    const maxAxialOrCombinedPct = Math.max(governingCombined.stud.combinedDC_pct, Math.round(deflPct * 0.85), slendernessFloor);
    const governingStatus = (maxAxialOrCombinedPct > 100 || governingRacking.racking.rackingDC_pct > 100)
      ? 'FAIL'
      : ((maxAxialOrCombinedPct > 85 || governingRacking.racking.rackingDC_pct > 85) ? 'WARNING' : 'PASS');

    return {
      standard: `Eurocode 5 (EN 1990 Eq. ${f.eqMode} + EN 1995-1-1)`,
      nationalAnnex: f.annex,
      inputs,
      factors: f,
      wallCtx,
      characteristicActions: {
        Gk_roof_kNm: +gkRoof_kNm.toFixed(2),
        Gk_floor_kNm: +gkFloor_kNm.toFixed(2),
        Gk_wall_kNm: +gkWall_kNm.toFixed(2),
        Gk_total_kNm: +Gk_kNm.toFixed(2),
        Qk_floor_kNm: +Qk_floor_kNm.toFixed(2),
        Qk_snow_kNm: +Qk_snow_kNm.toFixed(2),
        Qk_roof_kNm: +Qk_roof_kNm.toFixed(2),
        Wk_pressure_kNm2: +Wk_press_kNm2.toFixed(2),
        Wk_suction_kNm2: +Wk_suct_kNm2.toFixed(2),
        Vk_racking_kNm: +Vk_racking_kNm.toFixed(2),
        concentrationFactor: +wallCtx.concentrationFactor.toFixed(2)
      },
      combinations: ulsResults,
      slsCombinations: slsResults,
      governingAxial: {
        combinationId: governingCombined.id,
        shortLabel: governingCombined.shortLabel,
        formula: governingCombined.formula,
        equation: governingCombined.equation,
        pureAxialCombinationId: governingAxialPure.id,
        pureAxialFormula: governingAxialPure.formula,
        pureAxial_q_kNm: governingAxialPure.qAxial_kNm,
        pureAxial_N_Ed_kN: governingAxialPure.stud.N_Ed_kN,
        pureAxialDC_pct: governingAxialPure.stud.axialDC_pct,
        qAxialULS_kNm: governingCombined.qAxial_kNm,
        windPressure_kNm2: governingCombined.windPressure_kNm2,
        kmod: governingCombined.kmod,
        N_Ed_kN: governingCombined.stud.N_Ed_kN,
        N_Rd_kN: governingCombined.stud.N_Rd_kN,
        M_Ed_kNm: governingCombined.stud.M_Ed_kNm,
        kc_y: governingCombined.stud.kc_y,
        axialDC_pct: governingCombined.stud.axialDC_pct,
        bendingDC_pct: governingCombined.stud.bendingDC_pct,
        combinedDC_pct: governingCombined.stud.combinedDC_pct,
        dcPercent: maxAxialOrCombinedPct,
        instDeflMm,
        deflLimitMm,
        status: maxAxialOrCombinedPct > 100 ? 'FAIL' : (maxAxialOrCombinedPct > 85 ? 'WARNING' : 'PASS')
      },
      governingRacking: {
        combinationId: governingRacking.id,
        shortLabel: governingRacking.shortLabel,
        formula: governingRacking.formula,
        equation: governingRacking.equation,
        kmodOSB: governingRacking.kmodOSB,
        v_Ed_kNm: governingRacking.vEd_kNm,
        V_Ed_kN: governingRacking.racking.V_Ed_kN,
        F_vRd_kN: governingRacking.racking.F_vRd_kN,
        unitResistanceKNm: governingRacking.racking.unitResistanceKNm,
        rackingUtilPct: governingRacking.racking.rackingDC_pct,
        effectiveLengthM: governingRacking.racking.effectiveLengthM,
        netHoldDownTensionKN: governingUplift.racking.netHoldDownTensionKN,
        upliftCombinationFormula: governingUplift.formula,
        piers: governingRacking.racking.piers,
        status: governingRacking.racking.rackingDC_pct > 100 ? 'FAIL' : (governingRacking.racking.rackingDC_pct > 85 ? 'WARNING' : 'PASS')
      },
      governingStatus
    };
  }

  /**
   * High-level convenience entry point to evaluate all Eurocode 5 load combinations
   * and update axial compression + racking shear audit results across a single wall or all walls.
   */
  function auditAllWallsWithEurocode5(customModel, overrideInputs) {
    const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
    const walls = (mModel?.elements || []).filter(e => e && e.type === 'wall');
    const resolvedInputs = resolveLoadInputs(mModel, overrideInputs);
    const results = walls.map(w => computeEurocode5LoadCombinations(resolvedInputs, w, mModel));
    return {
      inputs: resolvedInputs,
      wallsCount: results.length,
      wallResults: results,
      failCount: results.filter(r => r.governingStatus === 'FAIL').length,
      warningCount: results.filter(r => r.governingStatus === 'WARNING').length
    };
  }

  const Eurocode5LoadEngine = {
    DEFAULT_EC5_LOAD_INPUTS,
    PSI_OCCUPANCY,
    EC5_KMOD_TIMBER,
    EC5_KMOD_OSB,
    EC5_TIMBER_PROPS,
    getKmodTimber,
    getKmodOSB,
    getPartialAndPsiFactors,
    resolveLoadInputs,
    getWallGeometryContext,
    evaluateEC5StudForCombination,
    evaluateEC5RackingForCombination,
    computeEurocode5LoadCombinations,
    auditAllWallsWithEurocode5
  };

  if (typeof window !== 'undefined') {
    window.Eurocode5LoadEngine = Eurocode5LoadEngine;
    window.computeEurocode5LoadCombinations = computeEurocode5LoadCombinations;
    window.auditAllWallsWithEurocode5 = auditAllWallsWithEurocode5;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.Eurocode5LoadEngine = Eurocode5LoadEngine;
  }
})();
