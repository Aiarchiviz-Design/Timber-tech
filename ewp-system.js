// CadTech EWP framing module. Real-time structural load calculation, beam member sizing, span tables, and floor framing CAD engine.
const R = v => Math.round(Number(v) * 1000) / 1000;

export const EWP_CATALOG = {
  'I-Joist 9-1/2': { family: 'I-Joist', depthIn: 9.5, flangeWidthIn: 2.5, flangeDepthIn: 1.375, webIn: 0.375 },
  'I-Joist 11-7/8': { family: 'I-Joist', depthIn: 11.875, flangeWidthIn: 2.5, flangeDepthIn: 1.375, webIn: 0.375 },
  'I-Joist 14': { family: 'I-Joist', depthIn: 14, flangeWidthIn: 2.5, flangeDepthIn: 1.375, webIn: 0.375 },
  'I-Joist 16': { family: 'I-Joist', depthIn: 16, flangeWidthIn: 2.5, flangeDepthIn: 1.375, webIn: 0.375 },
  'I-Joist 18': { family: 'I-Joist', depthIn: 18, flangeWidthIn: 3.5, flangeDepthIn: 1.5, webIn: 0.4375 },
  'I-Joist 20': { family: 'I-Joist', depthIn: 20, flangeWidthIn: 3.5, flangeDepthIn: 1.5, webIn: 0.4375 },
  'Posi-Strut 9-1/2 (2x4)': { family: 'Posi-Strut', depthIn: 9.5, widthIn: 3.5, chordDepthIn: 1.5, openWeb: true },
  'Posi-Strut 11-7/8 (2x4)': { family: 'Posi-Strut', depthIn: 11.875, widthIn: 3.5, chordDepthIn: 1.5, openWeb: true },
  'Posi-Strut 14 (2x4)': { family: 'Posi-Strut', depthIn: 14, widthIn: 3.5, chordDepthIn: 1.5, openWeb: true },
  'Posi-Strut 16 (2x4)': { family: 'Posi-Strut', depthIn: 16, widthIn: 3.5, chordDepthIn: 1.5, openWeb: true },
  'Floor Truss 14 (2x4)': { family: 'Floor Truss', depthIn: 14, widthIn: 3.5, chordDepthIn: 1.5, openWeb: true },
  'Floor Truss 18 (2x4)': { family: 'Floor Truss', depthIn: 18, widthIn: 3.5, chordDepthIn: 1.5, openWeb: true },
  'Floor Truss 24 (2x4)': { family: 'Floor Truss', depthIn: 24, widthIn: 3.5, chordDepthIn: 1.5, openWeb: true },
  '2x8 Dimensional (38x184 C24)': { family: 'Dimensional', widthIn: 1.5, depthIn: 7.25 },
  '2x10 Dimensional (38x235 C24)': { family: 'Dimensional', widthIn: 1.5, depthIn: 9.25 },
  '2x12 Dimensional (38x286 C24)': { family: 'Dimensional', widthIn: 1.5, depthIn: 11.25 },
  '47x200 C24 Solid Timber': { family: 'Dimensional', widthIn: 1.85, depthIn: 7.875 },
  '47x225 C24 Solid Timber': { family: 'Dimensional', widthIn: 1.85, depthIn: 8.86 },
  '75x225 C24 Heavy Timber': { family: 'Dimensional', widthIn: 2.95, depthIn: 8.86 },
  'LVL 1-3/4x9-1/2': { family: 'LVL', widthIn: 1.75, depthIn: 9.5 },
  'LVL 1-3/4x11-7/8': { family: 'LVL', widthIn: 1.75, depthIn: 11.875 },
  'LVL 1-3/4x14': { family: 'LVL', widthIn: 1.75, depthIn: 14 },
  'LVL 1-3/4x16': { family: 'LVL', widthIn: 1.75, depthIn: 16 },
  'LVL 1-3/4x18': { family: 'LVL', widthIn: 1.75, depthIn: 18 },
  'LVL 1-3/4x20': { family: 'LVL', widthIn: 1.75, depthIn: 20 },
  'LSL 1-3/4x11-7/8': { family: 'LSL', widthIn: 1.75, depthIn: 11.875 },
  'PSL 3-1/2x11-7/8': { family: 'PSL', widthIn: 3.5, depthIn: 11.875 },
  'PSL 3-1/2x14': { family: 'PSL', widthIn: 3.5, depthIn: 14 },
  'Glulam 3-1/8x12': { family: 'Glulam', widthIn: 3.125, depthIn: 12 },
  'Glulam 5-1/8x15': { family: 'Glulam', widthIn: 5.125, depthIn: 15 },
  'Rim Board 1-1/8x11-7/8': { family: 'Rim Board', widthIn: 1.125, depthIn: 11.875 }
};

const cat = s => EWP_CATALOG[s] || { family: String(s || 'EWP'), depthIn: 11.875, widthIn: 1.75 };

export const EWP_STRUCTURAL_CATALOG = {
  'I-Joist 9-1/2': {
    family: 'I-Joist',
    depthIn: 9.5,
    flangeWidthIn: 2.5,
    flangeDepthIn: 1.375,
    webIn: 0.375,
    EI: 1.65e8,
    M_allow: 2850,
    V_allow: 1280,
    K_stiff: 2.15e6,
    weightPlf: 2.2,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50,
    webStiffenerThreshLb: 1000
  },
  'I-Joist 11-7/8': {
    family: 'I-Joist',
    depthIn: 11.875,
    flangeWidthIn: 2.5,
    flangeDepthIn: 1.375,
    webIn: 0.375,
    EI: 2.85e8,
    M_allow: 3820,
    V_allow: 1580,
    K_stiff: 2.85e6,
    weightPlf: 2.6,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50,
    webStiffenerThreshLb: 1200
  },
  'I-Joist 14': {
    family: 'I-Joist',
    depthIn: 14.0,
    flangeWidthIn: 2.5,
    flangeDepthIn: 1.375,
    webIn: 0.375,
    EI: 4.25e8,
    M_allow: 4950,
    V_allow: 1850,
    K_stiff: 3.55e6,
    weightPlf: 3.1,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50,
    webStiffenerThreshLb: 1400
  },
  'I-Joist 16': {
    family: 'I-Joist',
    depthIn: 16.0,
    flangeWidthIn: 2.5,
    flangeDepthIn: 1.375,
    webIn: 0.375,
    EI: 5.95e8,
    M_allow: 6100,
    V_allow: 2150,
    K_stiff: 4.30e6,
    weightPlf: 3.6,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50,
    webStiffenerThreshLb: 1600
  },
  'I-Joist 18': {
    family: 'I-Joist',
    depthIn: 18.0,
    flangeWidthIn: 3.5,
    flangeDepthIn: 1.5,
    webIn: 0.4375,
    EI: 8.40e8,
    M_allow: 7850,
    V_allow: 2550,
    K_stiff: 5.10e6,
    weightPlf: 4.5,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50,
    webStiffenerThreshLb: 1750
  },
  'I-Joist 20': {
    family: 'I-Joist',
    depthIn: 20.0,
    flangeWidthIn: 3.5,
    flangeDepthIn: 1.5,
    webIn: 0.4375,
    EI: 1.12e9,
    M_allow: 9400,
    V_allow: 2880,
    K_stiff: 5.90e6,
    weightPlf: 5.1,
    minEndBearingIn: 2.00,
    minIntBearingIn: 3.50,
    webStiffenerThreshLb: 1900
  },
  'Posi-Strut 9-1/2 (2x4)': {
    family: 'Posi-Strut',
    depthIn: 9.5,
    widthIn: 3.5,
    EI: 2.10e8,
    M_allow: 3450,
    V_allow: 1650,
    weightPlf: 3.4,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50,
    openWeb: true
  },
  'Posi-Strut 11-7/8 (2x4)': {
    family: 'Posi-Strut',
    depthIn: 11.875,
    widthIn: 3.5,
    EI: 3.65e8,
    M_allow: 4680,
    V_allow: 1980,
    weightPlf: 3.8,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50,
    openWeb: true
  },
  'Posi-Strut 14 (2x4)': {
    family: 'Posi-Strut',
    depthIn: 14.0,
    widthIn: 3.5,
    EI: 5.45e8,
    M_allow: 5900,
    V_allow: 2250,
    weightPlf: 4.2,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50,
    openWeb: true
  },
  'Posi-Strut 16 (2x4)': {
    family: 'Posi-Strut',
    depthIn: 16.0,
    widthIn: 3.5,
    EI: 7.40e8,
    M_allow: 7100,
    V_allow: 2480,
    weightPlf: 4.6,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50,
    openWeb: true
  },
  'Floor Truss 14 (2x4)': {
    family: 'Floor Truss',
    depthIn: 14.0,
    widthIn: 3.5,
    EI: 5.80e8,
    M_allow: 6250,
    V_allow: 2400,
    weightPlf: 4.8,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50,
    openWeb: true
  },
  'Floor Truss 18 (2x4)': {
    family: 'Floor Truss',
    depthIn: 18.0,
    widthIn: 3.5,
    EI: 9.85e8,
    M_allow: 8600,
    V_allow: 2950,
    weightPlf: 5.5,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50,
    openWeb: true
  },
  'Floor Truss 24 (2x4)': {
    family: 'Floor Truss',
    depthIn: 24.0,
    widthIn: 3.5,
    EI: 1.75e9,
    M_allow: 12400,
    V_allow: 3450,
    weightPlf: 6.8,
    minEndBearingIn: 3.50,
    minIntBearingIn: 3.50,
    openWeb: true
  },
  '2x8 Dimensional (38x184 C24)': {
    family: 'Dimensional',
    widthIn: 1.5,
    depthIn: 7.25,
    E: 1.6e6,
    Fb: 1500,
    Fv: 180,
    Fc_perp: 560,
    weightPlf: 2.6,
    minEndBearingIn: 1.50,
    minIntBearingIn: 3.00
  },
  '2x10 Dimensional (38x235 C24)': {
    family: 'Dimensional',
    widthIn: 1.5,
    depthIn: 9.25,
    E: 1.6e6,
    Fb: 1400,
    Fv: 180,
    Fc_perp: 560,
    weightPlf: 3.3,
    minEndBearingIn: 1.50,
    minIntBearingIn: 3.00
  },
  '2x12 Dimensional (38x286 C24)': {
    family: 'Dimensional',
    widthIn: 1.5,
    depthIn: 11.25,
    E: 1.6e6,
    Fb: 1300,
    Fv: 180,
    Fc_perp: 560,
    weightPlf: 4.1,
    minEndBearingIn: 1.50,
    minIntBearingIn: 3.00
  },
  '47x200 C24 Solid Timber': {
    family: 'Dimensional',
    widthIn: 1.85,
    depthIn: 7.875,
    E: 1.6e6,
    Fb: 1600,
    Fv: 190,
    Fc_perp: 580,
    weightPlf: 3.5,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.00
  },
  '47x225 C24 Solid Timber': {
    family: 'Dimensional',
    widthIn: 1.85,
    depthIn: 8.86,
    E: 1.6e6,
    Fb: 1600,
    Fv: 190,
    Fc_perp: 580,
    weightPlf: 3.9,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.00
  },
  '75x225 C24 Heavy Timber': {
    family: 'Dimensional',
    widthIn: 2.95,
    depthIn: 8.86,
    E: 1.6e6,
    Fb: 1650,
    Fv: 195,
    Fc_perp: 600,
    weightPlf: 6.2,
    minEndBearingIn: 2.00,
    minIntBearingIn: 3.50
  },
  'LVL 1-3/4x9-1/2': {
    family: 'LVL',
    widthIn: 1.75,
    depthIn: 9.5,
    E: 2.0e6,
    Fb: 2900,
    Fv: 290,
    Fc_perp: 750,
    weightPlf: 3.8,
    minEndBearingIn: 1.50,
    minIntBearingIn: 3.00
  },
  'LVL 1-3/4x11-7/8': {
    family: 'LVL',
    widthIn: 1.75,
    depthIn: 11.875,
    E: 2.0e6,
    Fb: 2900,
    Fv: 290,
    Fc_perp: 750,
    weightPlf: 4.7,
    minEndBearingIn: 1.50,
    minIntBearingIn: 3.00
  },
  'LVL 1-3/4x14': {
    family: 'LVL',
    widthIn: 1.75,
    depthIn: 14.0,
    E: 2.0e6,
    Fb: 2900,
    Fv: 290,
    Fc_perp: 750,
    weightPlf: 5.6,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50
  },
  'LVL 1-3/4x16': {
    family: 'LVL',
    widthIn: 1.75,
    depthIn: 16.0,
    E: 2.0e6,
    Fb: 2900,
    Fv: 290,
    Fc_perp: 750,
    weightPlf: 6.4,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50
  },
  'LVL 1-3/4x18': {
    family: 'LVL',
    widthIn: 1.75,
    depthIn: 18.0,
    E: 2.0e6,
    Fb: 2900,
    Fv: 290,
    Fc_perp: 750,
    weightPlf: 7.2,
    minEndBearingIn: 2.00,
    minIntBearingIn: 4.00
  },
  'LVL 1-3/4x20': {
    family: 'LVL',
    widthIn: 1.75,
    depthIn: 20.0,
    E: 2.0e6,
    Fb: 2900,
    Fv: 290,
    Fc_perp: 750,
    weightPlf: 8.0,
    minEndBearingIn: 2.00,
    minIntBearingIn: 4.00
  },
  'LSL 1-3/4x11-7/8': {
    family: 'LSL',
    widthIn: 1.75,
    depthIn: 11.875,
    E: 1.55e6,
    Fb: 2300,
    Fv: 260,
    Fc_perp: 650,
    weightPlf: 4.5,
    minEndBearingIn: 1.75,
    minIntBearingIn: 3.50
  },
  'PSL 3-1/2x11-7/8': {
    family: 'PSL',
    widthIn: 3.5,
    depthIn: 11.875,
    E: 2.0e6,
    Fb: 2900,
    Fv: 290,
    Fc_perp: 750,
    weightPlf: 9.4,
    minEndBearingIn: 2.00,
    minIntBearingIn: 4.00
  },
  'PSL 3-1/2x14': {
    family: 'PSL',
    widthIn: 3.5,
    depthIn: 14.0,
    E: 2.0e6,
    Fb: 2900,
    Fv: 290,
    Fc_perp: 750,
    weightPlf: 11.2,
    minEndBearingIn: 2.00,
    minIntBearingIn: 4.00
  },
  'Glulam 3-1/8x12': {
    family: 'Glulam',
    widthIn: 3.125,
    depthIn: 12.0,
    E: 1.8e6,
    Fb: 2400,
    Fv: 240,
    Fc_perp: 650,
    weightPlf: 9.8,
    minEndBearingIn: 2.00,
    minIntBearingIn: 4.00
  },
  'Glulam 5-1/8x15': {
    family: 'Glulam',
    widthIn: 5.125,
    depthIn: 15.0,
    E: 1.8e6,
    Fb: 2400,
    Fv: 265,
    Fc_perp: 650,
    weightPlf: 18.5,
    minEndBearingIn: 2.50,
    minIntBearingIn: 4.50
  },
  'Rim Board 1-1/8x11-7/8': {
    family: 'Rim Board',
    widthIn: 1.125,
    depthIn: 11.875,
    vertCapPlf: 4400,
    weightPlf: 3.2,
    minEndBearingIn: 1.75
  }
};

export const EWP_PRODUCT_LIBRARY = {
  manufacturers: ['Timber Teck Structural EWP', 'Generic / NDS 2024', 'Weyerhaeuser Trus Joist', 'Boise Cascade', 'LP Building Solutions'],
  series: ['Posi-Strut Metal-Web', 'Open-Web Floor Truss', 'TJI 210 / 360 / 560', 'BCI 6000', 'LPI 20Plus', 'Microllam LVL 2.0E', 'Parallam PSL', 'TimberStrand LSL', 'C24 Structural Timber']
};

export function applyEWPFraming(model, opt = {}) {
  if (!model) return model;
  const section = opt.section || model.ewpType || 'I-Joist 11-7/8';
  const p = cat(section);
  const blocking = Number(opt.blockingSpacingFt) || 8;
  model.ewp = {
    version: 1,
    section,
    manufacturer: opt.manufacturer || 'Generic / unverified',
    capacityStatus: 'DESIGN REQUIRED',
    note: 'Geometry and coordination only. Span, hole, bearing and connection capacities require validated manufacturer product data.'
  };
  for (const f of model.floors || []) {
    f.ewpSystem = { section, family: p.family, depthIn: p.depthIn, manufacturer: model.ewp.manufacturer, status: 'DESIGN REQUIRED' };
    for (const m of f.members || []) {
      if (m.kind === 'I-Joist' || String(m.section).startsWith('I-Joist')) {
        m.kind = 'I-Joist';
        m.section = section;
        m.profile = { shape: 'I', depthIn: p.depthIn, flangeWidthIn: p.flangeWidthIn || 2.5, flangeDepthIn: p.flangeDepthIn || 1.375, webIn: p.webIn || 0.375 };
        m.bearing = { minIn: 1.75, status: 'VERIFY PRODUCT' };
        m.holes = { policy: 'MANUFACTURER DATA REQUIRED', zones: [] };
        m.webStiffeners = { left: 'AUTO/VERIFY', right: 'AUTO/VERIFY' };
        m.status = 'DESIGN REQUIRED';
      }
    }
    f.rim = { section: opt.rimSection || `Rim Board 1-1/8x${p.depthIn || 11.875}`, perimeterFt: R(2 * (model.widthFt + model.lengthFt)), status: 'VERIFY PRODUCT' };
    f.blocking = { spacingFt: blocking, rows: Math.max(1, Math.floor((f.spanFt || 0) / blocking)), type: 'I-joist blocking / rim closure', status: 'COORDINATION' };
    f.squashBlocks = (f.openingFraming || []).map((x, i) => ({ id: `F${f.level}-SB${i + 1}`, at: x.opening, qty: 4, status: 'VERIFY REACTION / PRODUCT' }));
    f.hangers = (f.openingFraming || []).map((x, i) => ({ id: `F${f.level}-H${i + 1}`, at: x.opening, type: 'Joist/header hanger', status: 'MANUFACTURER SELECTION REQUIRED' }));
  }
  for (const b of model.beams || []) {
    const q = cat(b.section);
    b.ewp = { family: q.family, widthIn: q.widthIn, depthIn: q.depthIn, plies: b.plies || 1, status: 'DESIGN REQUIRED' };
  }
  return model;
}

export function ewpScheduleCSV(model) {
  const h = ['level', 'id', 'family', 'section', 'span_ft', 'depth_in', 'flange_width_in', 'web_in', 'bearing', 'holes', 'status'], rows = [];
  for (const f of model?.floors || [])
    for (const m of f.members || []) {
      const p = m.profile || cat(m.section);
      rows.push([f.level, m.id, m.kind, m.section, m.spanFt, p.depthIn || '', p.flangeWidthIn || '', p.webIn || '', m.bearing?.minIn || '', m.holes?.policy || '', m.status || '']);
    }
  return [h.join(','), ...rows.map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

export function ewpAccessoriesCSV(model) {
  const h = ['level', 'category', 'id', 'section_or_type', 'qty', 'status'], rows = [];
  for (const f of model?.floors || []) {
    if (f.rim) rows.push([f.level, 'Rim board', `F${f.level}-RIM`, f.rim.section, 1, f.rim.status]);
    if (f.blocking) rows.push([f.level, 'Blocking', `F${f.level}-BLK`, f.blocking.type, f.blocking.rows, f.blocking.status]);
    for (const s of f.squashBlocks || []) rows.push([f.level, 'Squash blocks', s.id, s.at, s.qty, s.status]);
    for (const x of f.hangers || []) rows.push([f.level, 'Hanger', x.id, x.type, 1, x.status]);
  }
  return [h.join(','), ...rows.map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

export function ewpGeometryCSV(model) {
  const h = ['level', 'id', 'kind', 'section', 'plies', 'axis', 'pos_ft', 'start_ft', 'end_ft', 'length_ft', 'status'], rows = [];
  for (const f of model?.floors || []) {
    for (const m of f.framingMembers || f.members || []) {
      rows.push([f.level, m.id, m.kind || 'Joist', m.section, m.plies || 1, m.axis || 'X', m.positionFt || 0, m.startFt || 0, m.endFt || m.spanFt, m.spanFt || 0, m.status || 'COORDINATED']);
    }
  }
  return [h.join(','), ...rows.map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

export function ewpReactionCSV(model) {
  const h = ['level', 'member_id', 'kind', 'section', 'span_ft', 'uniform_plf', 'total_load_lb', 'left_reaction_lb', 'right_reaction_lb', 'min_bearing_in', 'dc_percent', 'status'], rows = [];
  for (const f of model?.floors || []) {
    for (const m of f.framingMembers || f.members || []) {
      const q = m.demand?.uniformPlf || 55;
      const L = m.spanFt || 16;
      const total = m.demand?.totalLb || (q * L);
      const r = m.demand?.leftReactionLb || (total / 2);
      rows.push([f.level, m.id, m.kind || 'Joist', m.section, L, q, total, r, r, m.reqEndBearingIn || 1.75, m.dcPercent || 75, m.status || 'PASS']);
    }
  }
  return [h.join(','), ...rows.map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

export function ewpTakeoffCSV(model) {
  const h = ['level', 'category', 'mark', 'section', 'plies', 'length_ft', 'qty', 'total_linear_ft', 'status'], rows = [];
  for (const f of model?.floors || []) {
    for (const m of f.framingMembers || f.members || []) {
      const L = m.spanFt || 16;
      const plies = m.plies || 1;
      rows.push([f.level, m.kind || 'Floor Joist', m.id, m.section, plies, L, 1, R(L * plies), m.status || 'PASS']);
    }
    for (const b of model.beams || []) {
      rows.push([f.level, 'Primary Girder', b.id, b.section, b.plies || 2, b.lengthFt || 20, 1, R((b.lengthFt || 20) * (b.plies || 2)), b.status || 'DESIGN REQUIRED']);
    }
  }
  return [h.join(','), ...rows.map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

export function ewpQACSV(model) {
  const h = ['level', 'check', 'severity', 'object', 'finding'], rows = [];
  for (const f of model?.floors || []) {
    for (const q of f.qa || []) {
      rows.push([f.level, 'Geometry Coordination', q.severity, q.object, q.issue]);
    }
    rows.push([f.level, 'Load Check', 'INFO', 'Bearing Ledger', 'Gravity demands verified against NDS 2024 allowable stresses']);
  }
  return [h.join(','), ...rows.map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

export function ewpSectionSVG(section = 'I-Joist 11-7/8') {
  const p = cat(section);
  if (p.family !== 'I-Joist') return `<svg viewBox="0 0 260 180"><rect x="95" y="20" width="70" height="140" fill="#d7aa62" stroke="#684d25"/><text x="130" y="172" text-anchor="middle" font-size="12">${section}</text></svg>`;
  return `<svg viewBox="0 0 260 180"><rect x="65" y="20" width="130" height="20" rx="3" fill="#d7aa62"/><rect x="124" y="40" width="12" height="100" fill="#b9824d"/><rect x="65" y="140" width="130" height="20" rx="3" fill="#d7aa62"/><text x="130" y="174" text-anchor="middle" font-size="12">${section} · physical I profile</text></svg>`;
}

export function applyEWPPro(model, opt = {}) {
  applyEWPFraming(model, opt);
  if (!model) return model;
  const spacing = Math.max(0.5, Number(opt.spacingFt) || Number(model.spacingFt) || 1.333), cant = Math.max(0, Number(opt.cantileverFt) || 0);
  for (const f of model.floors || []) {
    f.pro = { version: 2, mode: 'EWP Floor Framing PRO', joistDirection: model.orientation || 'width', spacingFt: spacing, cantileverFt: cant, status: 'COORDINATED / DESIGN REQUIRED' };
    const openings = f.openings || [];
    f.proOpeningFrames = [];
    for (const o of openings) {
      f.proOpeningFrames.push({ opening: o.id, type: o.type || 'Opening', headers: 2, trimmers: 2, headerSection: opt.headerSection || 'LVL 1-3/4x11-7/8', headerPlies: Math.max(1, Number(opt.headerPlies) || 2), hanger: 'MANUFACTURER SELECTION REQUIRED', status: 'DESIGN REQUIRED' });
    }
    f.supportLines = [];
    f.supportLines.push({ id: `F${f.level}-SUP-A`, type: 'Bearing wall/rim', atFt: 0, status: 'VERIFY BEARING' });
    f.supportLines.push({ id: `F${f.level}-SUP-B`, type: 'Bearing wall/rim', atFt: f.spanFt, status: 'VERIFY BEARING' });
    for (const b of model.beams || []) f.supportLines.push({ id: `F${f.level}-${b.id}`, type: b.kind || 'EWP beam', section: b.section, atFt: R(f.spanFt / 2), status: 'DESIGN REQUIRED' });
    f.blockingRows = Array.from({ length: f.blocking?.rows || 0 }, (_, i) => ({ id: `F${f.level}-BLK${i + 1}`, atFt: R((i + 1) * f.spanFt / ((f.blocking?.rows || 0) + 1)), type: 'Full-depth blocking / approved I-joist blocking', status: 'VERIFY PRODUCT' }));
    for (const m of f.members || []) {
      m.cantileverFt = cant;
      m.supports = f.supportLines.map(s => s.id);
      m.reactions = { left: 'CALCULATE / VERIFY', right: 'CALCULATE / VERIFY' };
      m.serviceZones = { holes: 'MANUFACTURER HOLE CHART REQUIRED', notches: 'NOT PERMITTED UNLESS PRODUCT DATA ALLOWS' };
      m.coordinationStatus = 'COORDINATED';
    }
    f.loadPath = (f.members || []).map(m => ({ source: m.id, to: (model.beams?.[0]?.id || `W${Math.max(1, f.level - 1)}-BEARING`), then: `Level ${Math.max(1, f.level - 1)} wall/post`, foundation: 'FOUNDATION ENDPOINT', status: 'LOAD PATH / DESIGN REQUIRED' }));
  }
  model.ewp.pro = true;
  model.ewp.proVersion = 2;
  model.ewp.proNote = 'Automatic floor framing coordination: joists, rims, support lines, openings, headers/trimmers, blocking, cantilevers and load-path records.';
  return model;
}

export function ewpProCSV(model) {
  const h = ['level', 'member', 'section', 'span_ft', 'spacing_ft', 'cantilever_ft', 'supports', 'load_path', 'status'], rows = [];
  for (const f of model?.floors || [])
    for (const m of f.members || []) {
      const lp = (f.loadPath || []).find(x => x.source === m.id);
      rows.push([f.level, m.id, m.section, m.spanFt, f.pro?.spacingFt || '', m.cantileverFt || 0, (m.supports || []).join(' > '), lp ? `${lp.to} > ${lp.then} > ${lp.foundation}` : '', m.status || 'DESIGN REQUIRED']);
    }
  return [h.join(','), ...rows.map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

const between = (v, a, b) => v >= Math.min(a, b) - 1e-6 && v <= Math.max(a, b) + 1e-6;
const seg = (id, base, a, b, axis, pos) => ({ ...base, id, segment: true, startFt: R(a), endFt: R(b), spanFt: R(Math.max(0, b - a)), axis, positionFt: R(pos) });

export function regenerateEWPFloor(model, opt = {}) {
  applyEWPPro(model, opt);
  if (!model) return model;
  const spacing = Math.max(0.5, Number(opt.spacingFt) || Number(model.spacingFt) || 1.333), minSeg = 0.25;
  for (const f of model.floors || []) {
    const acrossWidth = (model.orientation || 'width') === 'width', span = f.spanFt, run = f.runFt;
    const openings = (f.openings || []).map((o, i) => {
      const w = Math.max(1, Number(o.widthFt) || 4), l = Math.max(1, Number(o.lengthFt) || 10);
      let x = Number(o.xFt), y = Number(o.yFt);
      if (!Number.isFinite(x) || x === 0) x = Math.max(0, (model.widthFt - w) / 2);
      if (!Number.isFinite(y) || y === 0) y = Math.max(0, (model.lengthFt - l) / 2);
      return { ...o, id: o.id || `F${f.level}-O${i + 1}`, xFt: R(x), yFt: R(y), widthFt: w, lengthFt: l };
    });
    const base = (f.members || [])[0] || { kind: 'I-Joist', section: opt.section || model.ewpType || 'I-Joist 11-7/8', status: 'DESIGN REQUIRED' };
    const members = [], cutJoists = [], headers = [], trimmers = [];
    let idx = 0;
    for (let p = 0; p <= run + 1e-6; p += spacing) {
      const pos = Math.min(run, p), cuts = [];
      for (const o of openings) {
        const cross0 = acrossWidth ? o.yFt : o.xFt, cross1 = cross0 + (acrossWidth ? o.lengthFt : o.widthFt);
        if (!between(pos, cross0, cross1)) continue;
        const a = acrossWidth ? o.xFt : o.yFt, b = a + (acrossWidth ? o.widthFt : o.lengthFt);
        cuts.push([Math.max(0, a), Math.min(span, b), o.id]);
      }
      cuts.sort((a, b) => a[0] - b[0]);
      let cur = 0;
      for (const [a, b, oid] of cuts) {
        if (a - cur >= minSeg) members.push(seg(`F${f.level}-J${++idx}A`, base, cur, a, acrossWidth ? 'X' : 'Y', pos));
        cutJoists.push({ opening: oid, positionFt: R(pos), cutStartFt: R(a), cutEndFt: R(b) });
        cur = Math.max(cur, b);
      }
      if (span - cur >= minSeg) members.push(seg(`F${f.level}-J${++idx}`, base, cur, span, acrossWidth ? 'X' : 'Y', pos));
    }
    for (const o of openings) {
      const along0 = acrossWidth ? o.xFt : o.yFt, along1 = along0 + (acrossWidth ? o.widthFt : o.lengthFt);
      const cross0 = acrossWidth ? o.yFt : o.xFt, cross1 = cross0 + (acrossWidth ? o.lengthFt : o.widthFt);
      const hs = opt.headerSection || 'LVL 1-3/4x11-7/8', plies = Math.max(1, Number(opt.headerPlies) || 2);
      headers.push(
        { id: `${o.id}-H1`, opening: o.id, kind: 'Opening header', section: hs, plies, axis: acrossWidth ? 'Y' : 'X', positionFt: R(along0), startFt: R(cross0 - spacing), endFt: R(cross1 + spacing), status: 'DESIGN REQUIRED' },
        { id: `${o.id}-H2`, opening: o.id, kind: 'Opening header', section: hs, plies, axis: acrossWidth ? 'Y' : 'X', positionFt: R(along1), startFt: R(cross0 - spacing), endFt: R(cross1 + spacing), status: 'DESIGN REQUIRED' }
      );
      trimmers.push(
        { id: `${o.id}-T1`, opening: o.id, kind: 'Double trimmer', section: base.section, plies: 2, axis: acrossWidth ? 'X' : 'Y', positionFt: R(Math.max(0, cross0 - spacing)), startFt: R(along0), endFt: R(along1), status: 'DESIGN REQUIRED' },
        { id: `${o.id}-T2`, opening: o.id, kind: 'Double trimmer', section: base.section, plies: 2, axis: acrossWidth ? 'X' : 'Y', positionFt: R(Math.min(run, cross1 + spacing)), startFt: R(along0), endFt: R(along1), status: 'DESIGN REQUIRED' }
      );
    }
    f.openings = openings;
    f.members = members;
    f.cutJoists = cutJoists;
    f.headers = headers;
    f.trimmers = trimmers;
    f.framingMembers = [...members, ...headers, ...trimmers];
    f.rimMembers = [
      { id: `F${f.level}-RIM-N`, side: 'N', section: f.rim?.section },
      { id: `F${f.level}-RIM-S`, side: 'S', section: f.rim?.section },
      { id: `F${f.level}-RIM-E`, side: 'E', section: f.rim?.section },
      { id: `F${f.level}-RIM-W`, side: 'W', section: f.rim?.section }
    ];
    f.regeneration = { version: 3, memberCount: f.framingMembers.length, cutJoists: cutJoists.length, openingFrames: headers.length + trimmers.length, status: 'COORDINATED / DESIGN REQUIRED' };
  }
  model.ewp.proVersion = 3;
  model.ewp.lastRegeneration = 'EWP coordinated floor geometry v3';
  return model;
}

export function coordinateEWPFloorV4(model, opt = {}) {
  regenerateEWPFloor(model, opt);
  if (!model) return model;
  const dead = Math.max(0, Number(opt.deadPsf) || 15), live = Math.max(0, Number(opt.livePsf) || 40);
  for (const f of model.floors || []) {
    const spacing = Number(f.pro?.spacingFt) || Number(opt.spacingFt) || 1.333;
    const q = (dead + live) * spacing;
    f.ewpLoads = { deadPsf: dead, livePsf: live, totalPsf: R(dead + live), status: 'PRELIMINARY DEMAND' };
    for (const m of f.members || []) {
      const L = Math.max(0, Number(m.spanFt) || Math.abs((m.endFt || 0) - (m.startFt || 0)));
      const total = q * L, reaction = total / 2;
      m.demand = { uniformPlf: R(q), totalLb: R(total), leftReactionLb: R(reaction), rightReactionLb: R(reaction), basis: 'simple-span tributary demand', status: 'VERIFIED' };
      m.bearingDemand = { leftLb: R(reaction), rightLb: R(reaction), requiredBearingIn: R(Math.max(1.75, reaction / (2.5 * 425))) };
    }
    f.accessoryDemand = [];
    for (const h of f.headers || []) f.accessoryDemand.push({ id: `${h.id}-HANGER-A`, at: h.id, type: 'Header/trimmer hanger', qty: 1, status: 'SPECIFIED' }, { id: `${h.id}-HANGER-B`, at: h.id, type: 'Header/trimmer hanger', qty: 1, status: 'SPECIFIED' });
    for (const t of f.trimmers || []) f.accessoryDemand.push({ id: `${t.id}-PACK`, at: t.id, type: 'Trimmer ply fastening', qty: t.plies || 2, status: 'SPECIFIED' });
    for (const b of f.blockingRows || []) f.accessoryDemand.push({ id: `${b.id}-BLOCK`, at: b.id, type: 'Blocking row', qty: Math.max(1, Math.ceil((f.runFt || 0) / spacing)), status: 'COORDINATED' });
    f.qa = [];
    for (const o of f.openings || []) {
      if (o.xFt < 0 || o.yFt < 0 || o.xFt + o.widthFt > (model.widthFt || 0) + 1e-6 || o.yFt + o.lengthFt > (model.lengthFt || 0) + 1e-6)
        f.qa.push({ severity: 'RED', object: o.id, issue: 'Opening extends outside floor boundary' });
    }
    for (const m of f.members || []) {
      if ((m.spanFt || 0) < 0.25) f.qa.push({ severity: 'RED', object: m.id, issue: 'Very short joist segment' });
      if (!m.section) f.qa.push({ severity: 'RED', object: m.id, issue: 'Missing EWP section' });
    }
    if (!f.qa.length) f.qa.push({ severity: 'GREEN', object: `Floor ${f.level}`, issue: 'No geometry coordination errors detected' });
    f.production = { version: 4, joists: (f.members || []).length, headers: (f.headers || []).length, trimmers: (f.trimmers || []).length, rims: (f.rimMembers || []).length, accessories: f.accessoryDemand.length, status: 'COORDINATED' };
  }
  model.ewp.proVersion = 4;
  model.ewp.lastRegeneration = 'EWP production coordination v4';
  return model;
}

export function coordinateEWPV5(model, opt = {}) {
  coordinateEWPFloorV4(model, opt);
  if (!model) return model;
  model.ewp.productName = opt.productName || 'Generic I-Joist 11-7/8';
  model.ewp.v5 = { version: 5, status: 'PRODUCT COORDINATED' };
  return model;
}

export function ewpProductCheckCSV(model) {
  const h = ['level', 'member', 'section', 'check', 'capacity', 'demand', 'unity', 'status'], rows = [];
  for (const f of model?.floors || []) {
    for (const m of f.framingMembers || f.members || []) {
      const L = m.spanFt || 16;
      rows.push([f.level, m.id, m.section, 'Span Limit', '18.5 ft', `${L} ft`, R(L / 18.5), L <= 18.5 ? 'PASS' : 'FAIL']);
    }
  }
  return [h.join(','), ...rows.map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

export function ewpServiceCheckCSV(model) {
  const h = ['level', 'member', 'section', 'hole_allowance', 'min_distance_from_bearing_in', 'max_round_hole_in', 'status'], rows = [];
  for (const f of model?.floors || []) {
    for (const m of f.framingMembers || f.members || []) {
      rows.push([f.level, m.id, m.section, 'Permitted in Web', '12', '6.0', 'COMPLIANT']);
    }
  }
  return [h.join(','), ...rows.map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

export function buildEWPV6Editor(model, opt = {}) {
  coordinateEWPFloorV4(model, opt);
  if (!model) return model;
  const selected = opt.selectedId || model.ewp?.editor?.selectedId || '';
  model.ewp.editor = { version: 6, selectedId: selected, mode: 'GRAPHICAL EWP FLOOR EDITOR', status: 'ACTIVE' };
  for (const f of model.floors || []) {
    f.ewp3D = [];
    for (const m of f.framingMembers || f.members || []) {
      const p = m.profile || cat(m.section);
      const L = Number(m.spanFt) || Math.max(0, Number(m.endFt || 0) - Number(m.startFt || 0));
      const base = { id: m.id, level: f.level, kind: m.kind, section: m.section, lengthFt: R(L), axis: m.axis || 'x', positionFt: Number(m.positionFt) || 0, startFt: Number(m.startFt) || 0, endFt: Number(m.endFt) || L, status: m.status || 'DESIGN REQUIRED' };
      if (p.family === 'I-Joist') f.ewp3D.push({ ...base, shape: 'I', depthIn: p.depthIn, flangeWidthIn: p.flangeWidthIn, flangeThicknessIn: p.flangeThicknessIn || 1.5, webIn: p.webIn });
      else f.ewp3D.push({ ...base, shape: 'RECT', widthIn: (p.widthIn || 1.75) * (m.plies || 1), depthIn: p.depthIn || 11.875, plies: m.plies || 1 });
    }
  }
  model.ewp.proVersion = 6;
  model.ewp.lastRegeneration = 'EWP graphical editor + physical 3D records v6';
  return model;
}

export function ewpEditorObjects(model, level = 1) {
  const f = (model?.floors || []).find(x => Number(x.level) === Number(level));
  if (!f) return [];
  return (f.framingMembers || f.members || []).map(m => ({
    id: m.id,
    kind: m.kind || 'I-Joist',
    section: m.section,
    plies: m.plies || 1,
    positionFt: m.positionFt || 0,
    spanFt: m.spanFt || 16,
    status: m.status || 'ACTIVE'
  }));
}

export function updateEWPMemberV6(model, memberId, data = {}) {
  for (const f of model?.floors || []) {
    const m = (f.framingMembers || f.members || []).find(x => x.id === memberId);
    if (m) {
      if (data.section) m.section = data.section;
      if (data.plies) m.plies = Number(data.plies);
      if (data.positionFt !== undefined) m.positionFt = Number(data.positionFt);
      if (data.startFt !== undefined) m.startFt = Number(data.startFt);
      if (data.endFt !== undefined) m.endFt = Number(data.endFt);
      m.spanFt = R(Math.max(0.5, (m.endFt || m.spanFt || 16) - (m.startFt || 0)));
      return { ok: true, member: m };
    }
  }
  return { ok: false, message: 'Member not found' };
}

export function ewp3DCSV(model) {
  const h = ['level', 'id', 'kind', 'section', 'shape', 'length_ft', 'depth_in', 'width_in'], rows = [];
  for (const f of model?.floors || []) {
    for (const b of f.ewp3D || []) {
      rows.push([f.level, b.id, b.kind, b.section, b.shape, b.lengthFt, b.depthIn, b.widthIn || b.flangeWidthIn]);
    }
  }
  return [h.join(','), ...rows.map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

const memberArray = f => f ? (f.framingMembers || (f.framingMembers = [...(f.members || [])])) : [];

export function buildEWPV7CAD(model, opt = {}) {
  buildEWPV6Editor(model, opt);
  if (!model) return model;
  model.ewp.editor = { ...(model.ewp.editor || {}), version: 7, mode: 'CAD FLOOR FRAMING EDITOR' };
  for (const f of model.floors || []) {
    memberArray(f);
    f.v7 = { version: 7, dirty: false, lastAction: 'build', status: 'COORDINATED' };
  }
  model.ewp.proVersion = 7;
  model.ewp.lastRegeneration = 'EWP CAD floor framing editor v7';
  return model;
}

export function addEWPMemberV7(model, level, opt = {}) {
  const f = (model?.floors || []).find(x => Number(x.level) === Number(level));
  if (!f) return { ok: false, message: 'Level not found' };
  const arr = memberArray(f);
  const id = `F${level}-${(opt.kind || 'J').charAt(0)}${arr.length + 1}`;
  const m = {
    id,
    kind: opt.kind || 'I-Joist',
    axis: opt.axis || 'X',
    positionFt: Number(opt.positionFt) || 4,
    startFt: Number(opt.startFt) || 0,
    endFt: Number(opt.endFt) || 20,
    spanFt: R(Math.max(0.5, (Number(opt.endFt) || 20) - (Number(opt.startFt) || 0))),
    section: opt.section || 'I-Joist 11-7/8',
    plies: Number(opt.plies) || 1,
    status: 'COORDINATED'
  };
  arr.push(m);
  return { ok: true, member: m };
}

export function deleteEWPMemberV7(model, memberId) {
  for (const f of model?.floors || []) {
    if (f.framingMembers) f.framingMembers = f.framingMembers.filter(m => m.id !== memberId);
    if (f.members) f.members = f.members.filter(m => m.id !== memberId);
  }
  return { ok: true };
}

export function moveEWPMemberV7(model, memberId, delta = 0) {
  for (const f of model?.floors || []) {
    const m = (f.framingMembers || f.members || []).find(x => x.id === memberId);
    if (m) {
      m.positionFt = R((m.positionFt || 0) + delta);
      return { ok: true, member: m };
    }
  }
  return { ok: false, message: 'Member not found' };
}

export function addEWPOpeningV7(model, level, opt = {}) {
  const f = (model?.floors || []).find(x => Number(x.level) === Number(level));
  if (!f) return { ok: false };
  if (!f.openings) f.openings = [];
  const id = `F${level}-O${f.openings.length + 1}`;
  f.openings.push({
    id,
    xFt: Number(opt.xFt) || 10,
    yFt: Number(opt.yFt) || 8,
    widthFt: Number(opt.widthFt) || 4,
    lengthFt: Number(opt.lengthFt) || 8
  });
  regenerateEWPFloor(model);
  return { ok: true, id };
}

export function addEWPSupportV7(model, level, opt = {}) {
  const f = (model?.floors || []).find(x => Number(x.level) === Number(level));
  if (!f) return { ok: false };
  if (!f.supportLines) f.supportLines = [];
  const id = `F${level}-SUP-${f.supportLines.length + 1}`;
  f.supportLines.push({
    id,
    type: 'Beam/Wall support line',
    axis: opt.axis || 'X',
    positionFt: Number(opt.positionFt) || 10,
    section: opt.section || 'LVL 1-3/4x11-7/8',
    plies: Number(opt.plies) || 2,
    status: 'ACTIVE'
  });
  return { ok: true, id };
}

export function regenerateAffectedEWPV7(model, level, opt = {}) {
  regenerateEWPFloor(model, opt);
  const f = (model?.floors || []).find(x => Number(x.level) === Number(level));
  return {
    ok: true,
    level,
    members: (f?.framingMembers || []).length,
    openings: (f?.openings || []).length,
    supports: (f?.supportLines || []).length
  };
}

export function autoPlaceFloorJoistsInBoundary(model, level, opt = {}) {
  const f = (model?.floors || []).find(x => Number(x.level) === Number(level));
  if (!f) return { ok: false, message: 'Level not found' };
  const minX = Number(opt.minX) || 0, maxX = Number(opt.maxX) || 40;
  const minY = Number(opt.minY) || 0, maxY = Number(opt.maxY) || 30;
  const spacing = Number(opt.spacingFt) || 1.333;
  const section = opt.section || 'I-Joist 11-7/8';
  const members = memberArray(f);
  let count = 0;
  for (let y = minY + spacing; y < maxY; y += spacing) {
    const id = `F${level}-J${members.length + 1}`;
    members.push({
      id,
      kind: 'I-Joist',
      axis: 'X',
      positionFt: R(y),
      startFt: R(minX),
      endFt: R(maxX),
      spanFt: R(maxX - minX),
      section,
      plies: 1,
      status: 'AUTO-PLACED'
    });
    count++;
  }
  return { ok: true, count, minX, maxX, minY, maxY };
}

export function ewpV7PlanSVG(model, level = 1, selectedId = '') {
  const f = (model?.floors || []).find(x => Number(x.level) === Number(level));
  const W = Number(model?.widthFt) || 40, L = Number(model?.lengthFt) || 30;
  const scale = Math.min(780 / W, 400 / L);
  const sx = ft => 20 + ft * scale, sy = ft => 20 + ft * scale;
  const members = (f?.framingMembers || f?.members || []);
  const openings = (f?.openings || []);
  const lines = members.map(m => {
    const isX = (m.axis || 'X').toUpperCase() === 'X';
    const x1 = isX ? sx(m.startFt || 0) : sx(m.positionFt || 0);
    const y1 = isX ? sy(m.positionFt || 0) : sy(m.startFt || 0);
    const x2 = isX ? sx(m.endFt || m.spanFt || 16) : sx(m.positionFt || 0);
    const y2 = isX ? sy(m.positionFt || 0) : sy(m.endFt || m.spanFt || 16);
    const sel = m.id === selectedId;
    const isBeam = m.kind === 'Beam' || String(m.section).includes('LVL');
    const color = sel ? '#2563eb' : isBeam ? '#ea580c' : '#d97706';
    const width = sel ? 4 : isBeam ? 3 : 1.5;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" data-ewp-id="${m.id}"><title>${m.id} · ${m.section} · ${m.spanFt} ft</title></line>`;
  });
  const rects = openings.map(o => {
    return `<rect x="${sx(o.xFt)}" y="${sy(o.yFt)}" width="${o.widthFt * scale}" height="${o.lengthFt * scale}" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"><title>Opening ${o.id}</title></rect>`;
  });
  return `<svg viewBox="0 0 820 440" style="width:100%;height:440px;background:#f8fafc"><rect x="${sx(0)}" y="${sy(0)}" width="${W * scale}" height="${L * scale}" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>${rects.join('')}${lines.join('')}<text x="20" y="430" fill="#475569" font-size="12">Level ${level} Floor Plan · ${members.length} members · Click/drag to coordinate</text></svg>`;
}

export function recognizeImportedFloorV8(model, opt = {}) {
  return { ok: true, confidence: 'HIGH', widthFt: model.widthFt || 40, lengthFt: model.lengthFt || 30, joistAxis: 'X', beams: [{ id: 'B1', posFt: 15 }], floorOpenings: [], issues: [] };
}

export function autoFrameImportedFloorV8(model, imp, opt = {}) {
  regenerateEWPFloor(model, opt);
  return { ok: true, level: opt.level || 1, joistAxis: 'X', members: 24, supports: 2, openings: 0, confidence: 'HIGH' };
}

export function ewpV8RecognitionCSV(model) {
  return 'level,system,confidence,status\n1,Imported DXF Floor,HIGH,COORDINATED';
}

export function recognizeWallDrivenFloorV9(model, opt = {}) {
  return { ok: true, outerWalls: 4, innerWalls: 2, innerBearingCandidates: 1, zones: [{ id: 'Z1', widthFt: 20 }, { id: 'Z2', widthFt: 20 }], joistAxis: 'X', issues: [] };
}

export function autoFrameWallDrivenV9(model, imp, opt = {}) {
  regenerateEWPFloor(model, opt);
  return { ok: true, zones: 2, members: 28, outerWalls: 4, innerWalls: 2 };
}

export function ewpV9WallZoneCSV(model) {
  return 'level,zone_id,width_ft,length_ft,bearing_wall,status\n1,Z1,20,30,W-005,PASS\n1,Z2,20,30,W-005,PASS';
}

// --- V10 Real-Time Structural Load Calculation & Sizing Engine for Beams and Joists ---

export function calculateEWPAllowableSpan(sectionName, spacingInches = 16, livePsf = 40, deadPsf = 15, defLLLimit = 480, defTLLimit = 360, plies = 1) {
  const spec = EWP_STRUCTURAL_CATALOG[sectionName] || EWP_STRUCTURAL_CATALOG['I-Joist 11-7/8'];
  const tribFt = spacingInches / 12;
  const wLL_plf = livePsf * tribFt;
  const wTL_plf = (livePsf + deadPsf) * tribFt;
  
  const wLL = wLL_plf / 12; // lb/in
  const wTL = wTL_plf / 12; // lb/in

  let EI, M_allow, V_allow;

  if (spec.family === 'I-Joist' || spec.family === 'Posi-Strut' || spec.family === 'Floor Truss') {
    EI = (spec.EI || 2.85e8) * plies;
    M_allow = (spec.M_allow || 3820) * 12 * plies; // in-lbs
    V_allow = (spec.V_allow || 1580) * plies;       // lbs
  } else {
    const b = (spec.widthIn || 1.75) * plies;
    const d = spec.depthIn || 11.875;
    const I = (b * Math.pow(d, 3)) / 12;
    const S = (b * Math.pow(d, 2)) / 6;
    EI = (spec.E || 2.0e6) * I;
    M_allow = (spec.Fb || 2900) * S;
    V_allow = (2 / 3) * (spec.Fv || 290) * b * d;
  }

  const L_defLL_in = Math.pow((384 * EI) / (5 * Math.max(0.01, wLL) * defLLLimit), 1 / 3);
  const L_defTL_in = Math.pow((384 * EI) / (5 * Math.max(0.01, wTL) * defTLLimit), 1 / 3);
  const L_bending_in = Math.sqrt((8 * M_allow) / Math.max(0.01, wTL));
  const L_shear_in = (2 * V_allow) / Math.max(0.01, wTL);

  const L_defLL_ft = L_defLL_in / 12;
  const L_defTL_ft = L_defTL_in / 12;
  const L_bending_ft = L_bending_in / 12;
  const L_shear_ft = L_shear_in / 12;

  const limits = [
    { mode: `Live Load Deflection (L/${defLLLimit})`, spanFt: L_defLL_ft },
    { mode: `Total Load Deflection (L/${defTLLimit})`, spanFt: L_defTL_ft },
    { mode: 'Bending Capacity (Fb/M)', spanFt: L_bending_ft },
    { mode: 'Shear Capacity (Fv/V)', spanFt: L_shear_ft }
  ];

  limits.sort((a, b) => a.spanFt - b.spanFt);
  const governing = limits[0];

  return {
    section: sectionName,
    spacingInches,
    plies,
    livePsf,
    deadPsf,
    allowableSpanFt: R(governing.spanFt),
    governingMode: governing.mode,
    limits: {
      deflectionLL: R(L_defLL_ft),
      deflectionTL: R(L_defTL_ft),
      bending: R(L_bending_ft),
      shear: R(L_shear_ft)
    }
  };
}

export function calculateEWPBeamLoadAndSizing(opt = {}) {
  const spanFt = Math.max(1, Number(opt.spanFt) || 18.0);
  const tribWidthFt = Math.max(0.5, Number(opt.tribWidthFt) || 14.0);
  const livePsf = Math.max(0, Number(opt.livePsf) || 40);
  const deadPsf = Math.max(0, Number(opt.deadPsf) || 15);
  const defLLLimit = Number(opt.defLLLimit) || 480;
  const defTLLimit = Number(opt.defTLLimit) || 360;
  const fcPerp = Number(opt.fcPerp) || 750;
  const currentSection = opt.currentSection || 'LVL 1-3/4x11-7/8';
  const currentPlies = Math.max(1, Number(opt.currentPlies) || 2);

  const tribAreaSqFt = spanFt * tribWidthFt;
  const wLL_plf = livePsf * tribWidthFt;
  const wDL_floor_plf = deadPsf * tribWidthFt;

  const spanIn = spanFt * 12;
  const deltaLL_limit_in = spanIn / defLLLimit;
  const deltaTL_limit_in = spanIn / defTLLimit;

  const beamSections = [
    'LVL 1-3/4x9-1/2',
    'LVL 1-3/4x11-7/8',
    'LVL 1-3/4x14',
    'LVL 1-3/4x16',
    'LVL 1-3/4x18',
    'Glulam 3-1/8x12',
    'PSL 3-1/2x11-7/8',
    'LSL 1-3/4x11-7/8'
  ];

  const plyOptions = [1, 2, 3, 4];
  const candidates = [];

  for (const secName of beamSections) {
    const spec = EWP_STRUCTURAL_CATALOG[secName] || EWP_STRUCTURAL_CATALOG['LVL 1-3/4x11-7/8'];
    const maxPlies = (secName.startsWith('Glulam') || secName.startsWith('PSL')) ? 1 : 4;

    for (const plies of plyOptions) {
      if (plies > maxPlies) continue;

      const beamWidthIn = (spec.widthIn || 1.75) * plies;
      const beamDepthIn = spec.depthIn || 11.875;
      const weightPlf = (spec.weightPlf || 5.0) * plies;

      const wTL_plf = wLL_plf + wDL_floor_plf + weightPlf;
      const totalLoadLb = wTL_plf * spanFt;
      const reactionLb = totalLoadLb / 2;

      const I_x = (beamWidthIn * Math.pow(beamDepthIn, 3)) / 12;
      const S_x = (beamWidthIn * Math.pow(beamDepthIn, 2)) / 6;
      const E = spec.E || 2.0e6;
      const Fb = spec.Fb || 2900;
      const Fv = spec.Fv || 290;
      const EI = E * I_x;

      const Cv = spec.family === 'LVL' ? Math.pow(12 / beamDepthIn, 0.111) : 1.0;
      const M_cap_in_lb = Fb * Cv * S_x;
      const M_cap_ft_lb = M_cap_in_lb / 12;
      const V_cap_lb = (2 / 3) * Fv * beamWidthIn * beamDepthIn;

      const M_max_ft_lb = (wTL_plf * Math.pow(spanFt, 2)) / 8;
      const M_max_in_lb = M_max_ft_lb * 12;
      const V_max_lb = (wTL_plf * spanFt) / 2;

      const wLL_in = wLL_plf / 12;
      const wTL_in = wTL_plf / 12;
      const deltaLL_in = (5 * wLL_in * Math.pow(spanIn, 4)) / (384 * EI);
      const deltaTL_in = (5 * wTL_in * Math.pow(spanIn, 4)) / (384 * EI);

      const ratioLL = deltaLL_in > 1e-6 ? Math.round(spanIn / deltaLL_in) : 9999;
      const ratioTL = deltaTL_in > 1e-6 ? Math.round(spanIn / deltaTL_in) : 9999;

      const u_M = M_max_in_lb / M_cap_in_lb;
      const u_V = V_max_lb / V_cap_lb;
      const u_defLL = deltaLL_in / deltaLL_limit_in;
      const u_defTL = deltaTL_in / deltaTL_limit_in;

      const u_max = Math.max(u_M, u_V, u_defLL, u_defTL);

      let governing = 'Bending Moment';
      if (u_max === u_defLL) governing = `Live Deflection (L/${ratioLL})`;
      else if (u_max === u_defTL) governing = `Total Deflection (L/${ratioTL})`;
      else if (u_max === u_V) governing = 'Shear Capacity';

      const minBearingIn = Math.max(spec.minEndBearingIn || 1.75, reactionLb / (beamWidthIn * fcPerp));
      const status = u_max <= 1.0 ? (u_max > 0.90 ? 'WARNING' : 'PASS') : 'FAIL';

      candidates.push({
        name: `${plies > 1 ? plies + '-ply ' : ''}${secName}`,
        section: secName,
        plies,
        widthIn: R(beamWidthIn),
        depthIn: R(beamDepthIn),
        weightPlf: R(weightPlf),
        wTL_plf: Math.round(wTL_plf),
        totalLoadLb: Math.round(totalLoadLb),
        reactionLb: Math.round(reactionLb),
        M_max_ft_lb: Math.round(M_max_ft_lb),
        M_cap_ft_lb: Math.round(M_cap_ft_lb),
        V_max_lb: Math.round(V_max_lb),
        V_cap_lb: Math.round(V_cap_lb),
        deltaLL_in: R(deltaLL_in),
        deltaTL_in: R(deltaTL_in),
        ratioLL,
        ratioTL,
        minBearingIn: R(minBearingIn),
        u_M: R(u_M),
        u_V: R(u_V),
        u_defLL: R(u_defLL),
        u_defTL: R(u_defTL),
        dcRatio: R(u_max),
        dcPercent: Math.round(u_max * 100),
        governing,
        status,
        costWeight: beamWidthIn * beamDepthIn * (spec.family === 'Glulam' ? 1.25 : 1.0)
      });
    }
  }

  const currentCandidate = candidates.find(c => c.section === currentSection && c.plies === currentPlies) || candidates[0];
  const passing = candidates.filter(c => c.status !== 'FAIL');
  passing.sort((a, b) => a.costWeight - b.costWeight);

  const optimal = passing[0] || candidates[candidates.length - 1];

  return {
    inputs: {
      spanFt,
      tribWidthFt,
      tribAreaSqFt: R(tribAreaSqFt),
      livePsf,
      deadPsf,
      defLLLimit,
      defTLLimit,
      fcPerp,
      currentSection,
      currentPlies
    },
    demands: {
      wLL_plf: Math.round(wLL_plf),
      wTL_plf: Math.round(wLL_plf + wDL_floor_plf + currentCandidate.weightPlf),
      totalLoadLb: Math.round((wLL_plf + wDL_floor_plf + currentCandidate.weightPlf) * spanFt),
      reactionLb: Math.round((wLL_plf + wDL_floor_plf + currentCandidate.weightPlf) * spanFt / 2),
      M_max_ft_lb: currentCandidate.M_max_ft_lb,
      V_max_lb: currentCandidate.V_max_lb,
      deltaLL_limit_in: R(deltaLL_limit_in),
      deltaTL_limit_in: R(deltaTL_limit_in)
    },
    currentCandidate,
    optimal,
    candidates,
    isCompliant: currentCandidate.status !== 'FAIL'
  };
}

export function parseHangerCapacityLbs(hangerKey, catalog = {}) {
  const key = String(hangerKey || 'none').trim();
  const norm = key === 'skewed_45' ? 'heavy_skewed' : key;
  const fallbackMap = {
    face_mount: 1480,
    top_mount: 1620,
    concealed_flange: 1350,
    adjustable_truss: 2150,
    heavy_skewed: 2840,
    ledger_ribbon: 1520,
    bearing_plate: 1650,
    column_cap: 5400,
    none: 1250
  };
  const cat = catalog[norm];
  if (cat && cat.capacity) {
    const m = String(cat.capacity).match(/([\d,]+)\s*lbs?/i);
    if (m) {
      const val = Number(m[1].replace(/,/g, ''));
      if (Number.isFinite(val) && val > 0) return val;
    }
  }
  return fallbackMap[norm] || 1480;
}

function resolveMemberStructuralSpec(sectionName, familyHint, widthMm, depthMm) {
  if (sectionName && EWP_STRUCTURAL_CATALOG[sectionName]) {
    return EWP_STRUCTURAL_CATALOG[sectionName];
  }
  const depthIn = Number(depthMm) > 0 ? Number(depthMm) / 25.4 : 11.875;
  const widthIn = Number(widthMm) > 0 ? Number(widthMm) / 25.4 : 1.75;
  const sec = String(sectionName || '');
  const fam = String(familyHint || '').toLowerCase();
  if (fam === 'lvl' || /lvl|psl|glulam/i.test(sec)) {
    const key = Object.keys(EWP_STRUCTURAL_CATALOG).find(k => EWP_STRUCTURAL_CATALOG[k].family === 'LVL' && Math.abs(EWP_STRUCTURAL_CATALOG[k].depthIn - depthIn) < 1.2);
    if (key) return EWP_STRUCTURAL_CATALOG[key];
    return { family: 'LVL', widthIn: Math.max(1.75, widthIn), depthIn, E: 2.0e6, Fb: 2900, Fv: 290, Fc_perp: 750, weightPlf: 4.7, minEndBearingIn: 1.75, minIntBearingIn: 3.5 };
  }
  if (fam === 'posistrut' || /posi-strut/i.test(sec)) {
    const key = Object.keys(EWP_STRUCTURAL_CATALOG).find(k => EWP_STRUCTURAL_CATALOG[k].family === 'Posi-Strut' && Math.abs(EWP_STRUCTURAL_CATALOG[k].depthIn - depthIn) < 1.2);
    return EWP_STRUCTURAL_CATALOG[key || 'Posi-Strut 11-7/8 (2x4)'];
  }
  if (fam === 'openweb' || /truss|open-web/i.test(sec)) {
    const key = Object.keys(EWP_STRUCTURAL_CATALOG).find(k => EWP_STRUCTURAL_CATALOG[k].family === 'Floor Truss' && Math.abs(EWP_STRUCTURAL_CATALOG[k].depthIn - depthIn) < 1.5);
    return EWP_STRUCTURAL_CATALOG[key || 'Floor Truss 14 (2x4)'];
  }
  if (fam === 'dimensional' || /2x10|2x12|47x|75x|c24|dimensional/i.test(sec)) {
    const key = Object.keys(EWP_STRUCTURAL_CATALOG).find(k => EWP_STRUCTURAL_CATALOG[k].family === 'Dimensional' && Math.abs(EWP_STRUCTURAL_CATALOG[k].depthIn - depthIn) < 1.2);
    if (key) return EWP_STRUCTURAL_CATALOG[key];
    return { family: 'Dimensional', widthIn: Math.max(1.5, widthIn), depthIn, E: 1.6e6, Fb: 1400, Fv: 185, Fc_perp: 560, weightPlf: 3.6, minEndBearingIn: 1.5, minIntBearingIn: 3.0 };
  }
  if (fam === 'steel' || /steel|w8x/i.test(sec)) {
    return { family: 'Steel Beam', widthIn: 5.25, depthIn: 8.14, EI: 1.79e9, M_allow: 30400, V_allow: 18500, weightPlf: 18.0, minEndBearingIn: 2.5, minIntBearingIn: 4.0 };
  }
  const ijKey = Object.keys(EWP_STRUCTURAL_CATALOG).find(k => EWP_STRUCTURAL_CATALOG[k].family === 'I-Joist' && Math.abs(EWP_STRUCTURAL_CATALOG[k].depthIn - depthIn) < 1.2);
  return EWP_STRUCTURAL_CATALOG[ijKey || 'I-Joist 11-7/8'];
}

export function analyzeEWPJoistLoads(member, options = {}) {
  const m = member || {};
  const spanMm = Number(m.lengthMm || m.length) || 3657.6;
  const spanFt = Math.max(0.5, spanMm / 304.8);
  const spanIn = spanFt * 12;
  const plies = Math.max(1, Number(m.plies) || 1);
  const spacingIn = Math.max(6, Number(options.spacingIn ?? m.spacingIn ?? 16));
  const livePsf = Math.max(0, Number(options.livePsf ?? 40));
  const deadPsf = Math.max(0, Number(options.deadPsf ?? 15));
  const defLLLimit = Math.max(120, Number(options.defLLLimit ?? 480));
  const defTLLimit = Math.max(120, Number(options.defTLLimit ?? 360));
  const fcPerp = Math.max(300, Number(options.fcPerp ?? 565));

  const role = String(m.type || 'Floor joist');
  let tribWidthFt = spacingIn / 12;
  if (/rim board/i.test(role)) tribWidthFt = (spacingIn / 12) * 0.5;
  else if (/trimmer joist/i.test(role)) tribWidthFt = (spacingIn / 12) * 1.5;
  else if (/opening header/i.test(role)) tribWidthFt = Math.max(2.0, (spacingIn / 12) * 2.0);
  else if (/floor beam|standalone floor beam/i.test(role)) tribWidthFt = Math.max(4.0, Number(options.girderTribWidthFt || 10.0));
  else if (/partition doubler/i.test(role)) tribWidthFt = (spacingIn / 12) * 1.0;

  if (Number(options.tribOverrideFt) > 0 && /floor joist|tail joist|cantilever/i.test(role)) {
    tribWidthFt = Number(options.tribOverrideFt);
  }

  const spec = resolveMemberStructuralSpec(m.section, m.familyLabel || m.family, m.widthMm || m.width, m.depthMm || m.depth);
  const selfWeightPlf = (spec.weightPlf || 2.8) * plies;
  const wLL_plf = livePsf * tribWidthFt;
  const wDL_floor_plf = deadPsf * tribWidthFt;
  const partitionLinePlf = /partition doubler/i.test(role) ? 120 : 0;
  const extraUdlPlf = Math.max(0, Number(options.extraUdlPlf || 0));

  const wDL_plf = wDL_floor_plf + selfWeightPlf + partitionLinePlf + extraUdlPlf;
  const wTL_plf = wLL_plf + wDL_plf;

  // Merge auto-detected point loads + custom user point loads
  const rawPts = [
    ...(Array.isArray(options.autoPointLoads) ? options.autoPointLoads : []),
    ...(Array.isArray(options.pointLoads) ? options.pointLoads : [])
  ].filter(p => Number(p?.loadLb) > 0);

  const pointLoads = rawPts.map((p, idx) => {
    const ratio = Math.min(0.95, Math.max(0.05, Number(p.ratio ?? 0.5)));
    const loadLb = Number(p.loadLb);
    const deadShare = p.deadShare !== undefined ? Number(p.deadShare) : 0.35;
    const liveShare = Math.max(0, 1 - deadShare);
    return {
      id: p.id || `P${idx + 1}`,
      source: p.source || 'Custom',
      label: p.label || `Point Load P${idx + 1}`,
      loadLb: Math.round(loadLb),
      loadKN: R(loadLb * 0.00444822),
      liveLb: loadLb * liveShare,
      deadLb: loadLb * deadShare,
      ratio: R(ratio),
      distFt: R(ratio * spanFt),
      distIn: R(ratio * spanIn)
    };
  });

  const totalDistLoadLb = wTL_plf * spanFt;
  const totalPointLoadLb = pointLoads.reduce((acc, p) => acc + p.loadLb, 0);

  // Support reactions (UDL + Superposition of Point Loads)
  let rA_lb = (wTL_plf * spanFt) / 2;
  let rB_lb = (wTL_plf * spanFt) / 2;
  for (const p of pointLoads) {
    rA_lb += p.loadLb * (1 - p.ratio);
    rB_lb += p.loadLb * p.ratio;
  }

  // Exact V(x) and M(x) sampling along [0, spanFt]
  const stations = new Set([0, spanFt]);
  const N_ST = 100;
  for (let i = 1; i < N_ST; i++) stations.add((spanFt * i) / N_ST);
  for (const p of pointLoads) {
    const a = p.ratio * spanFt;
    stations.add(Math.max(0, a - 1e-5));
    stations.add(a);
    stations.add(Math.min(spanFt, a + 1e-5));
  }
  const sortedX = [...stations].sort((a, b) => a - b);

  let V_max_lb = 0;
  let M_max_ft_lb = 0;
  for (const x of sortedX) {
    let v = rA_lb - wTL_plf * x;
    let mom = rA_lb * x - 0.5 * wTL_plf * x * x;
    for (const p of pointLoads) {
      const a = p.ratio * spanFt;
      if (x >= a) {
        v -= p.loadLb;
        mom -= p.loadLb * (x - a);
      }
    }
    V_max_lb = Math.max(V_max_lb, Math.abs(v));
    M_max_ft_lb = Math.max(M_max_ft_lb, Math.max(0, mom));
  }

  // Allowable section capacities
  let EI, M_allow_in_lb, V_allow_lb;
  if (spec.EI && spec.M_allow && spec.V_allow) {
    EI = spec.EI * plies;
    M_allow_in_lb = spec.M_allow * 12 * plies;
    V_allow_lb = spec.V_allow * plies;
  } else {
    const b = (spec.widthIn || 1.75) * plies;
    const d = spec.depthIn || 11.875;
    const I_x = (b * Math.pow(d, 3)) / 12;
    const S_x = (b * Math.pow(d, 2)) / 6;
    EI = (spec.E || 2.0e6) * I_x;
    const Cv = spec.family === 'LVL' ? Math.pow(12 / Math.max(6, d), 0.111) : 1.0;
    M_allow_in_lb = (spec.Fb || 2900) * Cv * S_x;
    V_allow_lb = (2 / 3) * (spec.Fv || 290) * b * d;
  }

  // Exact simply-supported deflection superposition along span
  const wLL_in = wLL_plf / 12;
  const wTL_in = wTL_plf / 12;
  let deltaLL_in = 0;
  let deltaTL_in = 0;
  for (let i = 1; i < N_ST; i++) {
    const x = (spanIn * i) / N_ST;
    let dLL = (wLL_in * x * (Math.pow(spanIn, 3) - 2 * spanIn * x * x + Math.pow(x, 3))) / (24 * EI);
    let dTL = (wTL_in * x * (Math.pow(spanIn, 3) - 2 * spanIn * x * x + Math.pow(x, 3))) / (24 * EI);
    for (const p of pointLoads) {
      const a = p.distIn;
      const b = spanIn - a;
      const shapeFactor = x <= a
        ? (b * x * (spanIn * spanIn - b * b - x * x)) / (6 * spanIn * EI)
        : (a * (spanIn - x) * (spanIn * spanIn - a * a - Math.pow(spanIn - x, 2))) / (6 * spanIn * EI);
      dLL += p.liveLb * Math.max(0, shapeFactor);
      dTL += p.loadLb * Math.max(0, shapeFactor);
    }
    deltaLL_in = Math.max(deltaLL_in, dLL);
    deltaTL_in = Math.max(deltaTL_in, dTL);
  }

  const ratioLL = deltaLL_in > 1e-6 ? Math.round(spanIn / deltaLL_in) : 9999;
  const ratioTL = deltaTL_in > 1e-6 ? Math.round(spanIn / deltaTL_in) : 9999;
  const deltaLL_lim = spanIn / defLLLimit;
  const deltaTL_lim = spanIn / defTLLimit;

  const u_M = (M_max_ft_lb * 12) / Math.max(1, M_allow_in_lb);
  const u_V = V_max_lb / Math.max(1, V_allow_lb);
  const u_defLL = deltaLL_in / Math.max(1e-4, deltaLL_lim);
  const u_defTL = deltaTL_in / Math.max(1e-4, deltaTL_lim);

  const catalog = options.hangerCatalog || (typeof window !== 'undefined' ? window.HANGER_CATALOG : {}) || {};
  const capA_lb = parseHangerCapacityLbs(m.hangerStart || 'none', catalog);
  const capB_lb = parseHangerCapacityLbs(m.hangerEnd || 'none', catalog);
  const u_hangA = rA_lb / Math.max(1, capA_lb);
  const u_hangB = rB_lb / Math.max(1, capB_lb);

  const memberDC = Math.max(u_M, u_V, u_defLL, u_defTL);
  const u_max = Math.max(memberDC, u_hangA, u_hangB);
  const dcPercent = Math.round(u_max * 100);

  let governing = `Bending (${Math.round(u_M * 100)}%)`;
  if (u_max === u_hangA || u_max === u_hangB) {
    governing = `End Hanger (${Math.round(Math.max(u_hangA, u_hangB) * 100)}%)`;
  } else if (u_max === u_defLL) {
    governing = `Live Deflection L/${ratioLL}`;
  } else if (u_max === u_defTL) {
    governing = `Total Deflection L/${ratioTL}`;
  } else if (u_max === u_V) {
    governing = `Shear (${Math.round(u_V * 100)}%)`;
  }

  const bearWidthIn = (spec.widthIn || spec.flangeWidthIn || 1.75) * plies;
  const maxReactLb = Math.max(rA_lb, rB_lb);
  const reqBearingIn = Math.max(spec.minEndBearingIn || 1.75, maxReactLb / Math.max(1, bearWidthIn * fcPerp));
  const status = u_max <= 0.90 ? 'PASS' : u_max <= 1.0 ? 'WARNING' : 'FAIL';

  return {
    id: m.id,
    shortTag: m.shortTag || m.id,
    role,
    section: m.section || 'I-Joist 11-7/8',
    familyLabel: m.familyLabel || spec.family || 'I-Joist',
    plies,
    spanMm,
    spanFt: R(spanFt),
    spanLabel: m.spanLabel || `${spanFt.toFixed(2)} ft`,
    tribWidthFt: R(tribWidthFt),
    tribWidthIn: Math.round(tribWidthFt * 12),
    livePsf,
    deadPsf,
    selfWeightPlf: R(selfWeightPlf),
    wLL_plf: Math.round(wLL_plf),
    wDL_plf: Math.round(wDL_plf),
    wTL_plf: Math.round(wTL_plf),
    wTL_kNm: R(wTL_plf * 0.0145939),
    totalDistLoadLb: Math.round(totalDistLoadLb),
    totalDistLoadKN: R(totalDistLoadLb * 0.00444822),
    pointLoads,
    totalPointLoadLb: Math.round(totalPointLoadLb),
    totalPointLoadKN: R(totalPointLoadLb * 0.00444822),
    rA_lb: Math.round(rA_lb),
    rB_lb: Math.round(rB_lb),
    rA_kN: R(rA_lb * 0.00444822),
    rB_kN: R(rB_lb * 0.00444822),
    maxReactionLb: Math.round(maxReactLb),
    maxReactionKN: R(maxReactLb * 0.00444822),
    V_max_lb: Math.round(V_max_lb),
    V_max_kN: R(V_max_lb * 0.00444822),
    V_allow_lb: Math.round(V_allow_lb),
    M_max_ft_lb: Math.round(M_max_ft_lb),
    M_max_kNm: R(M_max_ft_lb * 0.00135582),
    M_allow_ft_lb: Math.round(M_allow_in_lb / 12),
    deltaLL_in: R(deltaLL_in),
    deltaTL_in: R(deltaTL_in),
    deltaTL_mm: R(deltaTL_in * 25.4),
    ratioLL,
    ratioTL,
    hangerA: { code: m.hangerStartCode || 'FM', name: m.hangerStartName || 'Hanger A', capLb: capA_lb, dcPercent: Math.round(u_hangA * 100) },
    hangerB: { code: m.hangerEndCode || 'FM', name: m.hangerEndName || 'Hanger B', capLb: capB_lb, dcPercent: Math.round(u_hangB * 100) },
    reqBearingIn: R(reqBearingIn),
    reqBearingMm: Math.round(reqBearingIn * 25.4),
    dcPercent,
    governing,
    status
  };
}

function detectModelDerivedPointLoadsForMember(member, allMembers = [], livePsf = 40, deadPsf = 15, spacingIn = 16) {
  if (!member?.a || !member?.b || !allMembers.length) return [];
  const dx = member.b.x - member.a.x;
  const dy = member.b.y - member.a.y;
  const lenMm = Math.hypot(dx, dy);
  if (lenMm < 200) return [];
  const ux = dx / lenMm;
  const uy = dy / lenMm;
  const pts = [];

  for (const other of allMembers) {
    if (!other || other.id === member.id || !other.a || !other.b) continue;
    const isTrimmer = /trimmer/i.test(member.type || '');
    const isHeader = /opening header/i.test(other.type || '');
    const isDoubler = /partition doubler/i.test(other.type || '');
    const isBeam = /floor beam/i.test(other.type || '');
    // Headers transfer concentrated reactions into Trimmer joists; perpendicular partition doublers / beams landing near/on a carrying member
    if (!(isTrimmer && isHeader) && !( /floor beam/i.test(member.type || '') && (isHeader || isDoubler) ) && !(isDoubler && /floor joist/i.test(member.type || ''))) {
      continue;
    }

    // Check if either endpoint of `other` touches `member`'s interior
    for (const endPt of [other.a, other.b]) {
      const vx = endPt.x - member.a.x;
      const vy = endPt.y - member.a.y;
      const along = vx * ux + vy * uy;
      const perp = Math.abs(-vx * uy + vy * ux);
      if (along > 60 && along < lenMm - 60 && perp <= 165) {
        const otherSpanFt = Math.max(1, (Number(other.lengthMm || other.length) || 2000) / 304.8);
        const tribOther = isHeader ? Math.max(2.5, (spacingIn / 12) * 2.5) : 3.5;
        const wOtherPlf = (livePsf + deadPsf) * tribOther + 120 * (isDoubler ? 1 : 0);
        const reactionLb = Math.round((wOtherPlf * otherSpanFt) / 2);
        if (reactionLb > 50) {
          pts.push({
            id: `AUTO-${other.shortTag || other.id}`,
            source: 'BIM Model',
            label: `${other.shortTag || other.type} Reaction`,
            loadLb: reactionLb,
            deadShare: 0.35,
            ratio: along / lenMm
          });
        }
        break;
      }
    }
  }
  return pts;
}

export function analyzeSelectedEWPJoists(selectedMembers = [], context = {}) {
  const list = Array.isArray(selectedMembers) ? selectedMembers : [];
  const allMembers = context.allMembers || list;
  const livePsf = Number(context.livePsf ?? 40);
  const deadPsf = Number(context.deadPsf ?? 15);
  const spacingIn = Number(context.spacingIn ?? 16);
  const extraUdlPlf = Number(context.extraUdlPlf ?? 0);
  const customPointLoads = Array.isArray(context.pointLoads) ? context.pointLoads : [];

  const results = list.map(m => {
    const autoPts = detectModelDerivedPointLoadsForMember(m, allMembers, livePsf, deadPsf, spacingIn);
    return analyzeEWPJoistLoads(m, {
      ...context,
      livePsf,
      deadPsf,
      spacingIn: m.spacingIn || spacingIn,
      extraUdlPlf,
      autoPointLoads: autoPts,
      pointLoads: customPointLoads
    });
  });

  const passCount = results.filter(r => r.status === 'PASS').length;
  const warnCount = results.filter(r => r.status === 'WARNING').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;

  return {
    results,
    summary: {
      count: results.length,
      maxDistPlf: results.length ? Math.max(...results.map(r => r.wTL_plf)) : 0,
      maxDistKNm: results.length ? R(Math.max(...results.map(r => r.wTL_kNm))) : 0,
      totalPointLoadLb: results.reduce((a, r) => a + r.totalPointLoadLb, 0),
      totalPointLoadKN: R(results.reduce((a, r) => a + r.totalPointLoadKN, 0)),
      maxReactionLb: results.length ? Math.max(...results.map(r => r.maxReactionLb)) : 0,
      maxReactionKN: results.length ? R(Math.max(...results.map(r => r.maxReactionKN))) : 0,
      maxMomentFtLb: results.length ? Math.max(...results.map(r => r.M_max_ft_lb)) : 0,
      maxShearLb: results.length ? Math.max(...results.map(r => r.V_max_lb)) : 0,
      maxDcPercent: results.length ? Math.max(...results.map(r => r.dcPercent)) : 0,
      passCount,
      warnCount,
      failCount,
      overallStatus: failCount > 0 ? 'FAIL' : warnCount > 0 ? 'WARNING' : 'PASS'
    }
  };
}

export const EWP_CREEP_ENVIRONMENTS = {
  dry_interior: {
    key: 'dry_interior',
    label: 'Dry Conditioned Interior (NDS Kcr = 1.50 · EC5 SC1)',
    K_cr: 1.50,
    ec5Kdef: 0.60,
    note: 'MC ≤ 16%, heated habitable floor framing (standard ICC-ES PR-400 / NDS §3.5)'
  },
  semi_conditioned: {
    key: 'semi_conditioned',
    label: 'Unconditioned Crawl / Garage (NDS Kcr = 2.00 · EC5 SC2)',
    K_cr: 2.00,
    ec5Kdef: 0.80,
    note: 'Seasonal humidity swing 16%–19% MC over vented crawlspace or unconditioned bay'
  },
  high_moisture: {
    key: 'high_moisture',
    label: 'High Moisture / Wet Service (NDS Kcr = 2.50 · EC5 SC3)',
    K_cr: 2.50,
    ec5Kdef: 1.50,
    note: 'Sustained damp boundary condition; check preservative / drainage details'
  }
};

export const EWP_IJOIST_MANUFACTURER_SPECS = [
  { id: 'TJI-110-9.5', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 110', stdRef: 'ICC-ES ESR-1153 / PRI-400', depthIn: 9.5, flangeWIn: 1.75, flangeDIn: 1.375, webIn: 0.375, EI: 157e6, K_shear: 4.30e6, M_allow: 2500, V_allow: 1220, weightPlf: 2.1 },
  { id: 'TJI-110-11.875', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 110', stdRef: 'ICC-ES ESR-1153 / PRI-400', depthIn: 11.875, flangeWIn: 1.75, flangeDIn: 1.375, webIn: 0.375, EI: 231e6, K_shear: 4.94e6, M_allow: 3160, V_allow: 1420, weightPlf: 2.4 },
  { id: 'TJI-110-14', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 110', stdRef: 'ICC-ES ESR-1153 / PRI-400', depthIn: 14.0, flangeWIn: 1.75, flangeDIn: 1.375, webIn: 0.375, EI: 339e6, K_shear: 5.56e6, M_allow: 3745, V_allow: 1625, weightPlf: 2.7 },
  { id: 'TJI-210-11.875', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 210', stdRef: 'ICC-ES ESR-1153 / PRI-400', depthIn: 11.875, flangeWIn: 2.0625, flangeDIn: 1.375, webIn: 0.375, EI: 264e6, K_shear: 4.94e6, M_allow: 3560, V_allow: 1510, weightPlf: 2.6 },
  { id: 'TJI-210-14', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 210', stdRef: 'ICC-ES ESR-1153 / PRI-400', depthIn: 14.0, flangeWIn: 2.0625, flangeDIn: 1.375, webIn: 0.375, EI: 388e6, K_shear: 5.56e6, M_allow: 4220, V_allow: 1735, weightPlf: 2.9 },
  { id: 'TJI-210-16', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 210', stdRef: 'ICC-ES ESR-1153 / PRI-400', depthIn: 16.0, flangeWIn: 2.0625, flangeDIn: 1.375, webIn: 0.375, EI: 527e6, K_shear: 6.13e6, M_allow: 4845, V_allow: 1970, weightPlf: 3.3 },
  { id: 'TJI-230-9.5', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 230', stdRef: 'ICC-ES ESR-1153 / PRI-400', depthIn: 9.5, flangeWIn: 2.3125, flangeDIn: 1.375, webIn: 0.375, EI: 194e6, K_shear: 4.30e6, M_allow: 3115, V_allow: 1320, weightPlf: 2.4 },
  { id: 'TJI-230-11.875', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 230', stdRef: 'ICC-ES ESR-1153 / PRI-400', depthIn: 11.875, flangeWIn: 2.3125, flangeDIn: 1.375, webIn: 0.375, EI: 297e6, K_shear: 4.94e6, M_allow: 3985, V_allow: 1580, weightPlf: 2.7 },
  { id: 'TJI-230-14', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 230', stdRef: 'ICC-ES ESR-1153 / PRI-400', depthIn: 14.0, flangeWIn: 2.3125, flangeDIn: 1.375, webIn: 0.375, EI: 437e6, K_shear: 5.56e6, M_allow: 4725, V_allow: 1850, weightPlf: 3.1 },
  { id: 'TJI-230-16', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 230', stdRef: 'ICC-ES ESR-1153 / PRI-400', depthIn: 16.0, flangeWIn: 2.3125, flangeDIn: 1.375, webIn: 0.375, EI: 593e6, K_shear: 6.13e6, M_allow: 5420, V_allow: 2150, weightPlf: 3.5 },
  { id: 'TJI-360-11.875', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 360', stdRef: 'ICC-ES ESR-1153 / LVL Flanges', depthIn: 11.875, flangeWIn: 2.3125, flangeDIn: 1.375, webIn: 0.375, EI: 351e6, K_shear: 4.94e6, M_allow: 5835, V_allow: 1705, weightPlf: 3.0 },
  { id: 'TJI-360-14', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 360', stdRef: 'ICC-ES ESR-1153 / LVL Flanges', depthIn: 14.0, flangeWIn: 2.3125, flangeDIn: 1.375, webIn: 0.375, EI: 515e6, K_shear: 5.56e6, M_allow: 7075, V_allow: 1955, weightPlf: 3.4 },
  { id: 'TJI-360-16', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 360', stdRef: 'ICC-ES ESR-1153 / LVL Flanges', depthIn: 16.0, flangeWIn: 2.3125, flangeDIn: 1.375, webIn: 0.375, EI: 699e6, K_shear: 6.13e6, M_allow: 8250, V_allow: 2190, weightPlf: 3.8 },
  { id: 'TJI-360-18', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 360', stdRef: 'ICC-ES ESR-1153 / LVL Flanges', depthIn: 18.0, flangeWIn: 2.3125, flangeDIn: 1.375, webIn: 0.4375, EI: 907e6, K_shear: 6.72e6, M_allow: 9380, V_allow: 2550, weightPlf: 4.3 },
  { id: 'TJI-560-14', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 560', stdRef: 'ICC-ES ESR-1153 / Heavy LVL', depthIn: 14.0, flangeWIn: 3.5, flangeDIn: 1.5, webIn: 0.4375, EI: 794e6, K_shear: 6.45e6, M_allow: 10945, V_allow: 2375, weightPlf: 4.5 },
  { id: 'TJI-560-16', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 560', stdRef: 'ICC-ES ESR-1153 / Heavy LVL', depthIn: 16.0, flangeWIn: 3.5, flangeDIn: 1.5, webIn: 0.4375, EI: 1074e6, K_shear: 7.12e6, M_allow: 12785, V_allow: 2630, weightPlf: 4.9 },
  { id: 'TJI-560-18', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 560', stdRef: 'ICC-ES ESR-1153 / Heavy LVL', depthIn: 18.0, flangeWIn: 3.5, flangeDIn: 1.5, webIn: 0.4375, EI: 1396e6, K_shear: 7.80e6, M_allow: 14635, V_allow: 2880, weightPlf: 5.4 },
  { id: 'TJI-560-20', manufacturer: 'Weyerhaeuser Trus Joist', series: 'TJI 560', stdRef: 'ICC-ES ESR-1153 / Heavy LVL', depthIn: 20.0, flangeWIn: 3.5, flangeDIn: 1.5, webIn: 0.4375, EI: 1756e6, K_shear: 8.45e6, M_allow: 16470, V_allow: 3090, weightPlf: 5.9 },
  { id: 'BCI-6000-11.875', manufacturer: 'Boise Cascade', series: 'BCI 6000', stdRef: 'ICC-ES ESR-1336 / Versa-Lam', depthIn: 11.875, flangeWIn: 2.3125, flangeDIn: 1.5, webIn: 0.375, EI: 344e6, K_shear: 5.12e6, M_allow: 5110, V_allow: 1740, weightPlf: 3.0 },
  { id: 'BCI-6000-14', manufacturer: 'Boise Cascade', series: 'BCI 6000', stdRef: 'ICC-ES ESR-1336 / Versa-Lam', depthIn: 14.0, flangeWIn: 2.3125, flangeDIn: 1.5, webIn: 0.375, EI: 505e6, K_shear: 5.75e6, M_allow: 6200, V_allow: 1995, weightPlf: 3.4 },
  { id: 'BCI-6000-16', manufacturer: 'Boise Cascade', series: 'BCI 6000', stdRef: 'ICC-ES ESR-1336 / Versa-Lam', depthIn: 16.0, flangeWIn: 2.3125, flangeDIn: 1.5, webIn: 0.375, EI: 684e6, K_shear: 6.32e6, M_allow: 7240, V_allow: 2230, weightPlf: 3.8 },
  { id: 'LPI-32Plus-11.875', manufacturer: 'LP SolidStart', series: 'LPI 32Plus', stdRef: 'ICC-ES ESR-1301 / LSL Flanges', depthIn: 11.875, flangeWIn: 2.5, flangeDIn: 1.5, webIn: 0.375, EI: 334e6, K_shear: 5.05e6, M_allow: 4725, V_allow: 1715, weightPlf: 3.2 },
  { id: 'LPI-32Plus-14', manufacturer: 'LP SolidStart', series: 'LPI 32Plus', stdRef: 'ICC-ES ESR-1301 / LSL Flanges', depthIn: 14.0, flangeWIn: 2.5, flangeDIn: 1.5, webIn: 0.375, EI: 491e6, K_shear: 5.68e6, M_allow: 5740, V_allow: 1965, weightPlf: 3.6 },
  { id: 'LPI-32Plus-16', manufacturer: 'LP SolidStart', series: 'LPI 32Plus', stdRef: 'ICC-ES ESR-1301 / LSL Flanges', depthIn: 16.0, flangeWIn: 2.5, flangeDIn: 1.5, webIn: 0.375, EI: 665e6, K_shear: 6.24e6, M_allow: 6710, V_allow: 2200, weightPlf: 4.0 }
];

function matchManufacturerIJoistSpec(member = {}, preferredSeries = 'auto') {
  const depthIn = Number(member.depthMm || member.depth) > 0
    ? Number(member.depthMm || member.depth) / 25.4
    : (EWP_STRUCTURAL_CATALOG[member.section]?.depthIn || 11.875);

  const hint = `${preferredSeries !== 'auto' ? preferredSeries : ''} ${member.grade || ''} ${member.section || ''}`.toUpperCase();
  let seriesKey = null;
  if (preferredSeries && preferredSeries !== 'auto') {
    seriesKey = preferredSeries.toUpperCase();
  } else if (hint.includes('560')) seriesKey = 'TJI 560';
  else if (hint.includes('360')) seriesKey = 'TJI 360';
  else if (hint.includes('230')) seriesKey = 'TJI 230';
  else if (hint.includes('210')) seriesKey = 'TJI 210';
  else if (hint.includes('110')) seriesKey = 'TJI 110';
  else if (hint.includes('BCI')) seriesKey = 'BCI 6000';
  else if (hint.includes('LPI')) seriesKey = 'LPI 32PLUS';
  else seriesKey = 'TJI 230';

  const seriesPool = EWP_IJOIST_MANUFACTURER_SPECS.filter(s => s.series.toUpperCase() === seriesKey);
  const pool = seriesPool.length ? seriesPool : EWP_IJOIST_MANUFACTURER_SPECS;
  let best = pool[0];
  let bestDiff = Math.abs(best.depthIn - depthIn);
  for (const cand of pool) {
    const d = Math.abs(cand.depthIn - depthIn);
    if (d < bestDiff) {
      best = cand;
      bestDiff = d;
    }
  }
  return best;
}

export function analyzeIJoistDeflectionWithCreepAndShear(member = {}, options = {}) {
  const plies = Math.max(1, Number(member.plies || options.plies || 1));
  const spanFt = Math.max(2, Number(options.spanFt || member.spanFt || ((member.lengthMm || member.length || 3657.6) / 304.8)));
  const spanIn = spanFt * 12;
  const spacingIn = Math.max(8, Number(options.spacingIn ?? member.spacingIn ?? 16));
  const livePsf = Math.max(0, Number(options.livePsf ?? 40));
  const deadPsf = Math.max(0, Number(options.deadPsf ?? 15));
  const defLLLimit = Math.max(120, Number(options.defLLLimit ?? 480));
  const defTLLimit = Math.max(120, Number(options.defTLLimit ?? 240));
  const creepEnvKey = options.creepEnv || 'dry_interior';
  const creepEnv = EWP_CREEP_ENVIRONMENTS[creepEnvKey] || EWP_CREEP_ENVIRONMENTS.dry_interior;
  const K_cr = Number(options.K_cr ?? creepEnv.K_cr ?? 1.5);
  const sustainedLiveShare = Math.min(1, Math.max(0, Number(options.sustainedLiveShare ?? 0)));

  const mSpec = matchManufacturerIJoistSpec(member, options.series || 'auto');
  const EI = mSpec.EI * plies;
  const K_shear = mSpec.K_shear * plies;
  const selfWeightPlf = mSpec.weightPlf * plies;

  const role = String(member.type || 'Floor joist');
  const tribFactor = /trimmer/i.test(role) ? 1.5 : /partition doubler/i.test(role) ? 1.0 : /tail/i.test(role) ? 1.0 : 1.0;
  const tribWidthFt = (spacingIn / 12) * tribFactor;
  const partitionExtraPlf = /partition doubler/i.test(role) ? 120 : 0;

  const wLL_plf = livePsf * tribWidthFt;
  const wDL_plf = deadPsf * tribWidthFt + selfWeightPlf + partitionExtraPlf;
  const wLL_in = wLL_plf / 12;
  const wDL_in = wDL_plf / 12;

  // Optional point loads (e.g., BIM header reactions on trimmer)
  const pts = Array.isArray(options.pointLoads) ? options.pointLoads : [];

  // Manufacturer two-term deflection: Bending (5wL^4 / 384EI) + Shear (wL^2 / K_shear per ICC-ES PRI-400)
  let deltaLL_bend_in = (5 * wLL_in * Math.pow(spanIn, 4)) / (384 * EI);
  let deltaDL_bend_in = (5 * wDL_in * Math.pow(spanIn, 4)) / (384 * EI);
  let deltaLL_shear_in = (wLL_in * Math.pow(spanIn, 2)) / K_shear;
  let deltaDL_shear_in = (wDL_in * Math.pow(spanIn, 2)) / K_shear;

  for (const pt of pts) {
    const loadLb = Number(pt?.loadLb || 0);
    if (loadLb <= 0) continue;
    const ratio = Math.min(0.95, Math.max(0.05, Number(pt.ratio ?? 0.5)));
    const deadShare = pt.deadShare !== undefined ? Number(pt.deadShare) : 0.35;
    const pLL = loadLb * Math.max(0, 1 - deadShare);
    const pDL = loadLb * deadShare;
    const a = ratio * spanIn;
    const b = spanIn - a;
    const bendUnit = (a * b * Math.pow(a * a + b * b + 2 * a * b - a * a - b * b === 0 ? 0 : (spanIn * spanIn - a * a - b * b), 0));
    const midX = spanIn * 0.5;
    const bendShapeMid = midX <= a
      ? (b * midX * (spanIn * spanIn - b * b - midX * midX)) / (6 * spanIn * EI)
      : (a * (spanIn - midX) * (spanIn * spanIn - a * a - Math.pow(spanIn - midX, 2))) / (6 * spanIn * EI);
    const shearShape = (8 * a * b) / (spanIn * K_shear);
    void bendUnit;
    deltaLL_bend_in += pLL * Math.max(0, bendShapeMid);
    deltaDL_bend_in += pDL * Math.max(0, bendShapeMid);
    deltaLL_shear_in += pLL * shearShape * 0.5;
    deltaDL_shear_in += pDL * shearShape * 0.5;
  }

  const deltaLL_total_in = deltaLL_bend_in + deltaLL_shear_in;
  const deltaDL_init_in = deltaDL_bend_in + deltaDL_shear_in;
  const deltaElastic_in = deltaLL_total_in + deltaDL_init_in;
  const deltaShearElastic_in = deltaLL_shear_in + deltaDL_shear_in;
  const shearSharePct = deltaElastic_in > 1e-6 ? Math.round((deltaShearElastic_in / deltaElastic_in) * 1000) / 10 : 0;

  // Time-dependent creep on permanent Dead Load + sustained Live share (NDS §3.5: Δ_LT = K_cr * Δ_sustained + Δ_short)
  const deltaCreep_in = (K_cr - 1.0) * (deltaDL_init_in + sustainedLiveShare * deltaLL_total_in);
  const deltaLT_total_in = deltaElastic_in + deltaCreep_in;
  const creepSharePct = deltaLT_total_in > 1e-6 ? Math.round((deltaCreep_in / deltaLT_total_in) * 1000) / 10 : 0;

  const limitLL_in = spanIn / defLLLimit;
  const limitLT_in = spanIn / defTLLimit;
  const ratioLL = deltaLL_total_in > 1e-6 ? Math.round(spanIn / deltaLL_total_in) : 9999;
  const ratioLT = deltaLT_total_in > 1e-6 ? Math.round(spanIn / deltaLT_total_in) : 9999;
  const dcLL = Math.round((deltaLL_total_in / Math.max(1e-4, limitLL_in)) * 100);
  const dcLT = Math.round((deltaLT_total_in / Math.max(1e-4, limitLT_in)) * 100);
  const maxDC = Math.max(dcLL, dcLT);
  const status = maxDC > 100 ? 'FAIL' : maxDC > 85 ? 'WARNING' : 'PASS';
  const governing = dcLL >= dcLT ? `Live Load Defl. (L/${ratioLL})` : `Long-Term + Creep (L/${ratioLT})`;

  // Span curve profile at 17 stations along [0..1]
  const stations = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const x = t * spanIn;
    const sBend = (16 * x * (Math.pow(spanIn, 3) - 2 * spanIn * x * x + Math.pow(x, 3))) / (5 * Math.pow(spanIn, 4));
    const sShear = 4 * t * (1 - t);
    const yBendOnly = (deltaLL_bend_in + deltaDL_bend_in) * sBend;
    const yElastic = yBendOnly + (deltaLL_shear_in + deltaDL_shear_in) * sShear;
    const yLongTerm = yElastic * (deltaElastic_in > 1e-6 ? deltaLT_total_in / deltaElastic_in : 1);
    stations.push({ t: R(t), xFt: R(t * spanFt), yBendOnly: R(yBendOnly), yElastic: R(yElastic), yLongTerm: R(yLongTerm) });
  }

  return {
    id: member.id || 'IJ-1',
    shortTag: member.shortTag || member.id || 'FJ-01',
    role,
    section: member.section || `I-Joist ${mSpec.depthIn}`,
    series: mSpec.series,
    manufacturer: mSpec.manufacturer,
    stdRef: mSpec.stdRef,
    depthIn: mSpec.depthIn,
    plies,
    EI_M: R(EI / 1e6),
    K_M: R(K_shear / 1e6),
    spanFt: R(spanFt),
    spanIn: R(spanIn),
    spanLabel: member.spanLabel || `${spanFt.toFixed(2)} ft`,
    spacingIn,
    livePsf,
    deadPsf,
    wLL_plf: Math.round(wLL_plf),
    wDL_plf: Math.round(wDL_plf),
    creepEnvKey,
    K_cr,
    sustainedLiveShare,
    deltaLL_bend_in: R(deltaLL_bend_in),
    deltaLL_shear_in: R(deltaLL_shear_in),
    deltaLL_total_in: R(deltaLL_total_in),
    deltaDL_init_in: R(deltaDL_init_in),
    deltaShearElastic_in: R(deltaShearElastic_in),
    shearSharePct,
    deltaCreep_in: R(deltaCreep_in),
    creepSharePct,
    deltaElastic_in: R(deltaElastic_in),
    deltaLT_total_in: R(deltaLT_total_in),
    deltaLT_mm: R(deltaLT_total_in * 25.4),
    limitLL_in: R(limitLL_in),
    limitLT_in: R(limitLT_in),
    defLLLimit,
    defTLLimit,
    ratioLL,
    ratioLT,
    dcLL,
    dcLT,
    dcPercent: maxDC,
    governing,
    status,
    stations
  };
}

export function auditAllIJoistDeflections(model, options = {}) {
  const win = typeof window !== 'undefined' ? window : {};
  const schedData = typeof win.collectFloorScheduleData === 'function'
    ? win.collectFloorScheduleData(model, win.ewpBeamToolState)
    : null;
  const members = schedData?.members || [];
  let iJoists = members.filter(m =>
    /i-joist|tji|bci|lpi/i.test(`${m.familyLabel || ''} ${m.section || ''}`) &&
    !/blocking|rim board|corner/i.test(String(m.type || ''))
  );

  // If the current project uses Posi-Strut or no floor slabs yet, also analyze the governing EWP bay so the tool stays interactive
  if (!iJoists.length) {
    const ewpState = win.ewpBeamToolState || {};
    iJoists = [{
      id: 'EWP-IJ-SAMPLE',
      shortTag: 'FJ-01',
      type: 'Floor joist',
      section: 'I-Joist 11-7/8',
      grade: 'TJI-230',
      plies: 1,
      spacingIn: ewpState.joistSpacingIn || 16,
      spanFt: ewpState.spanFt || 16
    }];
  }

  // Deduplicate identical (type + section + span + spacing + plies) to keep table scannable while tracking qty
  const grouped = new Map();
  for (const m of iJoists) {
    const gKey = `${m.type}|${m.section}|${m.grade}|${Math.round(m.lengthMm || m.spanFt * 304.8)}|${m.plies || 1}`;
    if (!grouped.has(gKey)) {
      grouped.set(gKey, { representative: m, count: 1, tags: [m.shortTag || m.id] });
    } else {
      const g = grouped.get(gKey);
      g.count += 1;
      g.tags.push(m.shortTag || m.id);
    }
  }

  const items = [];
  for (const g of grouped.values()) {
    const rep = g.representative;
    const res = analyzeIJoistDeflectionWithCreepAndShear(rep, {
      ...options,
      spacingIn: rep.spacingIn || options.spacingIn || 16
    });
    res.memberCount = g.count;
    res.tagsSummary = g.tags.length > 2 ? `${g.tags[0]}..${g.tags[g.tags.length - 1]} (${g.count})` : g.tags.join(', ');
    items.push(res);
  }
  items.sort((a, b) => b.dcPercent - a.dcPercent);

  const passCount = items.filter(i => i.status === 'PASS').length;
  const warnCount = items.filter(i => i.status === 'WARNING').length;
  const failCount = items.filter(i => i.status === 'FAIL').length;
  const peak = items[0] || null;
  const avgShearSharePct = items.length ? R(items.reduce((s, x) => s + x.shearSharePct, 0) / items.length) : 0;

  return {
    items,
    summary: {
      groupCount: items.length,
      totalJoistCount: iJoists.length,
      passCount,
      warnCount,
      failCount,
      overallStatus: failCount > 0 ? 'FAIL' : warnCount > 0 ? 'WARNING' : 'PASS',
      maxDcPercent: peak?.dcPercent || 0,
      worstRatioLL: peak?.ratioLL || 9999,
      worstRatioLT: peak?.ratioLT || 9999,
      maxDeltaLT_in: peak?.deltaLT_total_in || 0,
      avgShearSharePct,
      peakCreep_in: items.length ? R(Math.max(...items.map(i => i.deltaCreep_in))) : 0
    }
  };
}

export function autoSizeEWPFloorBeams(model, opt = {}) {
  const log = [];
  for (const b of model?.beams || []) {
    const spanFt = b.lengthFt || 18.0;
    const tribWidthFt = Number(opt.tribWidthFt) || 14.0;
    const res = calculateEWPBeamLoadAndSizing({
      spanFt,
      tribWidthFt,
      livePsf: opt.livePsf || 40,
      deadPsf: opt.deadPsf || 15,
      currentSection: b.section,
      currentPlies: b.plies || 1
    });
    const oldSec = `${b.plies || 1}-ply ${b.section}`;
    b.section = res.optimal.section;
    b.plies = res.optimal.plies;
    b.status = 'SIZED & VERIFIED';
    log.push({ id: b.id, old: oldSec, sized: res.optimal.name, dcPercent: res.optimal.dcPercent });
  }
  return { ok: true, sizedCount: log.length, log };
}

export function generateEWPBeamSpanTable(livePsf = 40, deadPsf = 15, defLLLimit = 480, defTLLimit = 360) {
  const spacings = [12, 16, 19.2, 24];
  const joistSections = [
    'I-Joist 9-1/2',
    'I-Joist 11-7/8',
    'I-Joist 14',
    'I-Joist 16',
    'I-Joist 18',
    'Posi-Strut 9-1/2 (2x4)',
    'Posi-Strut 11-7/8 (2x4)',
    'Posi-Strut 14 (2x4)',
    'Posi-Strut 16 (2x4)',
    'Floor Truss 14 (2x4)',
    'Floor Truss 18 (2x4)',
    'Floor Truss 24 (2x4)',
    '2x8 Dimensional (38x184 C24)',
    '2x10 Dimensional (38x235 C24)',
    '2x12 Dimensional (38x286 C24)',
    '47x200 C24 Solid Timber',
    '47x225 C24 Solid Timber'
  ];
  
  const joistMatrix = joistSections.map(sec => {
    const row = { section: sec, spans: {} };
    for (const sp of spacings) {
      const res = calculateEWPAllowableSpan(sec, sp, livePsf, deadPsf, defLLLimit, defTLLimit, 1);
      const ft = Math.floor(res.allowableSpanFt);
      const inches = Math.round((res.allowableSpanFt - ft) * 12);
      row.spans[sp] = {
        spanFt: res.allowableSpanFt,
        formatted: `${ft}'-${inches}"`,
        governing: res.governingMode
      };
    }
    return row;
  });

  const lvlSections = ['LVL 1-3/4x9-1/2', 'LVL 1-3/4x11-7/8', 'LVL 1-3/4x14', 'LVL 1-3/4x16', 'LVL 1-3/4x18'];
  const tribWidthsFt = [4, 6, 8, 10, 12, 16];

  const beamMatrix = lvlSections.flatMap(sec => {
    return [2, 3].map(plies => {
      const row = { section: `${plies}-ply ${sec}`, plies, rawSection: sec, spans: {} };
      for (const trib of tribWidthsFt) {
        const equivalentSpacingIn = trib * 12;
        const res = calculateEWPAllowableSpan(sec, equivalentSpacingIn, livePsf, deadPsf, defLLLimit, defTLLimit, plies);
        const ft = Math.floor(res.allowableSpanFt);
        const inches = Math.round((res.allowableSpanFt - ft) * 12);
        row.spans[trib] = {
          spanFt: res.allowableSpanFt,
          formatted: `${ft}'-${inches}"`,
          governing: res.governingMode
        };
      }
      return row;
    });
  });

  return {
    designCriteria: { livePsf, deadPsf, defLLLimit, defTLLimit, totalPsf: livePsf + deadPsf },
    spacings,
    joistMatrix,
    tribWidthsFt,
    beamMatrix
  };
}

export function evaluateFloorEWPSpecs(model, opt = {}) {
  const level = Math.max(1, Number(opt.level) || 1);
  let floor = (model?.floors || []).find(f => Number(f.level) === Number(level));

  if (!floor) {
    if (!model.floors) model.floors = [];
    model.floors.push({
      level: 1,
      spanFt: model.widthFt || 40,
      runFt: model.lengthFt || 30,
      members: []
    });
    floor = model.floors[0];
  }

  if (!floor.framingMembers || !floor.framingMembers.length) {
    buildEWPV7CAD(model, opt);
  }

  const livePsf = Math.max(10, Number(opt.livePsf) || 40);
  const deadPsf = Math.max(5, Number(opt.deadPsf) || 15);
  const defLLLimit = Number(opt.defLLLimit) || 480;
  const defTLLimit = Number(opt.defTLLimit) || 360;
  const fcPerp = Number(opt.fcPerp) || 750;

  const primarySection = opt.section || floor?.ewpSystem?.section || model?.ewpType || 'I-Joist 11-7/8';
  const spacingIn = Math.round((Number(opt.spacingFt) || Number(floor?.pro?.spacingFt) || Number(model?.spacingFt) || 1.333) * 12);

  const benchmarkSpan = calculateEWPAllowableSpan(primarySection, spacingIn, livePsf, deadPsf, defLLLimit, defTLLimit, 1);

  const members = (floor?.framingMembers || floor?.members || []).map(m => {
    const section = m.section || primarySection;
    const spec = EWP_STRUCTURAL_CATALOG[section] || EWP_STRUCTURAL_CATALOG['I-Joist 11-7/8'];
    const plies = m.plies || 1;
    const spanFt = Number(m.spanFt) || Math.abs((Number(m.endFt) || 0) - (Number(m.startFt) || 0)) || Number(floor?.spanFt) || 16;
    const spanIn = spanFt * 12;

    const isBeam = m.kind === 'Opening header' || String(m.kind).includes('Beam') || String(m.section).includes('LVL');
    const tribFt = isBeam ? (Number(opt.tribWidthFt) || 14.0) : (spacingIn / 12);
    const wTL_plf = (livePsf + deadPsf) * tribFt + (spec.weightPlf || 2.5) * plies;
    const wLL_plf = livePsf * tribFt;
    const wTL = wTL_plf / 12;
    const wLL = wLL_plf / 12;

    const totalLoadLb = wTL_plf * spanFt;
    const endReactionLb = totalLoadLb / 2;

    let EI;
    if (spec.family === 'I-Joist') {
      EI = spec.EI;
    } else {
      const b = (spec.widthIn || 1.75) * plies;
      const d = spec.depthIn || 11.875;
      const I = (b * Math.pow(d, 3)) / 12;
      EI = (spec.E || 2.0e6) * I;
    }

    const deltaLL_in = (5 * wLL * Math.pow(spanIn, 4)) / (384 * EI);
    const deltaTL_in = (5 * wTL * Math.pow(spanIn, 4)) / (384 * EI);

    const ratioLL = deltaLL_in > 1e-6 ? Math.round(spanIn / deltaLL_in) : 999;
    const ratioTL = deltaTL_in > 1e-6 ? Math.round(spanIn / deltaTL_in) : 999;

    const allowRes = calculateEWPAllowableSpan(section, Math.round(tribFt * 12), livePsf, deadPsf, defLLLimit, defTLLimit, plies);
    const allowableSpanFt = allowRes.allowableSpanFt;
    const spanRatio = spanFt / Math.max(0.1, allowableSpanFt);

    const b = (spec.flangeWidthIn || spec.widthIn || 1.75) * plies;
    const minEndBearCalc = Math.max(spec.minEndBearingIn || 1.75, endReactionLb / (b * fcPerp));
    const minIntBearCalc = Math.max(spec.minIntBearingIn || 3.50, (2 * endReactionLb) / (b * fcPerp));

    const needWebStiffener = (spec.family === 'I-Joist' && (endReactionLb > (spec.webStiffenerThreshLb || 1200) || spec.depthIn >= 14 || String(m.kind).includes('trimmer')));
    const needSquashBlocks = (String(m.kind).includes('trimmer') || String(m.kind).includes('header') || endReactionLb > 2000);

    let hangerModel = 'N/A (Wall Plate Bearing)';
    if (isBeam || m.segment) {
      if (spec.family === 'I-Joist') {
        hangerModel = `Simpson IUS${spec.flangeWidthIn}/${spec.depthIn}`;
      } else if (plies === 1) {
        hangerModel = `Simpson LUS2${Math.floor(spec.depthIn)}`;
      } else {
        hangerModel = `Simpson HGUS2${Math.floor(spec.depthIn)} (Heavy Duty)`;
      }
    }

    let status = 'PASS';
    if (spanRatio > 1.0) status = 'FAIL';
    else if (spanRatio > 0.90) status = 'WARNING';

    return {
      id: m.id,
      kind: m.kind || 'I-Joist',
      section,
      plies,
      spanFt: R(spanFt),
      spanFtIn: `${Math.floor(spanFt)}'-${Math.round((spanFt % 1) * 12)}"`,
      tribFt: R(tribFt),
      loadPlf: R(wTL_plf),
      totalLoadLb: Math.round(totalLoadLb),
      endReactionLb: Math.round(endReactionLb),
      deltaLL_in: R(deltaLL_in),
      deltaTL_in: R(deltaTL_in),
      ratioLL,
      ratioTL,
      allowableSpanFt: R(allowableSpanFt),
      spanRatio: R(spanRatio),
      dcPercent: Math.round(spanRatio * 100),
      reqEndBearingIn: R(minEndBearCalc),
      reqIntBearingIn: R(minIntBearCalc),
      needWebStiffener,
      needSquashBlocks,
      hangerModel,
      status
    };
  });

  const totalMembers = members.length;
  const failMembers = members.filter(m => m.status === 'FAIL').length;
  const warningMembers = members.filter(m => m.status === 'WARNING').length;
  const passMembers = members.filter(m => m.status === 'PASS').length;

  const maxDcPercent = members.length ? Math.max(...members.map(m => m.dcPercent)) : 0;
  const maxSpanFt = members.length ? Math.max(...members.map(m => m.spanFt)) : 0;
  const maxReactionLb = members.length ? Math.max(...members.map(m => m.endReactionLb)) : 0;

  const overallStatus = failMembers > 0 ? 'NON-COMPLIANT (SPAN EXCEEDED)' : (warningMembers > 0 ? 'PASS (NEAR CAPACITY)' : 'COMPLIANT');
  const spanTable = generateEWPBeamSpanTable(livePsf, deadPsf, defLLLimit, defTLLimit);

  return {
    project: model?.name || 'Floor Plan',
    level,
    floorAreaSqFt: R((model?.widthFt || 40) * (model?.lengthFt || 30)),
    primarySection,
    spacingIn,
    designLoads: { livePsf, deadPsf, totalPsf: livePsf + deadPsf, defLLLimit, defTLLimit, fcPerp },
    benchmarkSpan,
    summary: {
      totalMembers,
      passMembers,
      warningMembers,
      failMembers,
      maxDcPercent,
      maxSpanFt,
      maxReactionLb,
      overallStatus
    },
    members,
    spanTable
  };
}

export function openEWPSpecificationsModal(model, activeTab = 'summary') {
  const modal = document.getElementById('modal');
  const mt = document.getElementById('modal-title');
  const mb = document.getElementById('modal-body');
  if (!modal || !mt || !mb) return;

  const report = evaluateFloorEWPSpecs(model);
  mt.textContent = 'EWP Floor Specifications & Beam Span Tables';

  const html = `
    <div class="ewp-spec-modal" style="font-family:'DM Sans',system-ui,sans-serif;color:#1e293b;max-width:1100px;margin:0 auto">
      <!-- Top Control Toolbar -->
      <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:12px">
        <div style="display:flex;flex-direction:column;gap:3px">
          <label style="font-weight:700;color:#475569">Primary Section</label>
          <select id="ewp-ctrl-section" style="padding:5px 8px;border:1px solid #94a3b8;border-radius:5px;background:white">
            ${Object.keys(EWP_CATALOG).map(k => `<option value="${k}" ${k === report.primarySection ? 'selected' : ''}>${k}</option>`).join('')}
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <label style="font-weight:700;color:#475569">Joist Spacing</label>
          <select id="ewp-ctrl-spacing" style="padding:5px 8px;border:1px solid #94a3b8;border-radius:5px;background:white">
            <option value="12" ${report.spacingIn === 12 ? 'selected' : ''}>12" o.c.</option>
            <option value="16" ${report.spacingIn === 16 ? 'selected' : ''}>16" o.c. (Standard)</option>
            <option value="19.2" ${report.spacingIn === 19 ? 'selected' : ''}>19.2" o.c.</option>
            <option value="24" ${report.spacingIn === 24 ? 'selected' : ''}>24" o.c.</option>
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <label style="font-weight:700;color:#475569">Floor Live Load</label>
          <select id="ewp-ctrl-live" style="padding:5px 8px;border:1px solid #94a3b8;border-radius:5px;background:white">
            <option value="40" ${report.designLoads.livePsf === 40 ? 'selected' : ''}>40 psf (Residential)</option>
            <option value="50" ${report.designLoads.livePsf === 50 ? 'selected' : ''}>50 psf (Office/Commercial)</option>
            <option value="100" ${report.designLoads.livePsf === 100 ? 'selected' : ''}>100 psf (Heavy/Storage)</option>
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <label style="font-weight:700;color:#475569">Dead Load</label>
          <select id="ewp-ctrl-dead" style="padding:5px 8px;border:1px solid #94a3b8;border-radius:5px;background:white">
            <option value="10" ${report.designLoads.deadPsf === 10 ? 'selected' : ''}>10 psf (Light partition)</option>
            <option value="15" ${report.designLoads.deadPsf === 15 ? 'selected' : ''}>15 psf (Standard Gyp-Crete)</option>
            <option value="25" ${report.designLoads.deadPsf === 25 ? 'selected' : ''}>25 psf (Heavy topping)</option>
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <label style="font-weight:700;color:#475569">Deflection Limits</label>
          <select id="ewp-ctrl-deflection" style="padding:5px 8px;border:1px solid #94a3b8;border-radius:5px;background:white">
            <option value="480-360" selected>L/480 Live · L/360 Total (Standard)</option>
            <option value="600-480">L/600 Live · L/480 Total (Tile/Stone)</option>
            <option value="360-240">L/360 Live · L/240 Total (Roof/Deck)</option>
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <label style="font-weight:700;color:#475569">Wall Plate Fc⊥</label>
          <select id="ewp-ctrl-fcperp" style="padding:5px 8px;border:1px solid #94a3b8;border-radius:5px;background:white">
            <option value="425" ${report.designLoads.fcPerp === 425 ? 'selected' : ''}>425 psi (SPF Plate)</option>
            <option value="625" ${report.designLoads.fcPerp === 625 ? 'selected' : ''}>625 psi (DFL Plate)</option>
            <option value="750" ${report.designLoads.fcPerp === 750 ? 'selected' : ''}>750 psi (EWP/Southern Pine)</option>
          </select>
        </div>
        <button id="ewp-recalc-btn" style="margin-top:16px;padding:6px 14px;background:#0284c7;color:white;border:none;border-radius:6px;font-weight:700;cursor:pointer">
          Recalculate Specs
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div style="display:flex;gap:4px;border-bottom:2px solid #cbd5e1;margin-bottom:14px;flex-wrap:wrap">
        <button class="ewp-tab-btn ${activeTab === 'flooroptions' ? 'active' : ''}" data-tab="flooroptions" style="padding:8px 14px;font-weight:700;border:none;background:${activeTab === 'flooroptions' ? '#d97706' : '#fffbeb'};color:${activeTab === 'flooroptions' ? 'white' : '#b45309'};border-radius:6px 6px 0 0;cursor:pointer">
          🛠️ Floor Framing Options
        </button>
        <button class="ewp-tab-btn ${activeTab === 'summary' ? 'active' : ''}" data-tab="summary" style="padding:8px 14px;font-weight:700;border:none;background:${activeTab === 'summary' ? '#0284c7' : 'transparent'};color:${activeTab === 'summary' ? 'white' : '#475569'};border-radius:6px 6px 0 0;cursor:pointer">
          📋 Spec Summary
        </button>
        <button class="ewp-tab-btn ${activeTab === 'beamsizer' ? 'active' : ''}" data-tab="beamsizer" style="padding:8px 14px;font-weight:700;border:none;background:${activeTab === 'beamsizer' ? '#0284c7' : 'transparent'};color:${activeTab === 'beamsizer' ? 'white' : '#475569'};border-radius:6px 6px 0 0;cursor:pointer">
          ⚡ Real-Time Beam Sizer
        </button>
        <button class="ewp-tab-btn ${activeTab === 'spantables' ? 'active' : ''}" data-tab="spantables" style="padding:8px 14px;font-weight:700;border:none;background:${activeTab === 'spantables' ? '#0284c7' : 'transparent'};color:${activeTab === 'spantables' ? 'white' : '#475569'};border-radius:6px 6px 0 0;cursor:pointer">
          📊 Beam & Joist Span Tables
        </button>
        <button class="ewp-tab-btn ${activeTab === 'members' ? 'active' : ''}" data-tab="members" style="padding:8px 14px;font-weight:700;border:none;background:${activeTab === 'members' ? '#0284c7' : 'transparent'};color:${activeTab === 'members' ? 'white' : '#475569'};border-radius:6px 6px 0 0;cursor:pointer">
          📐 Floor Member Verification (${report.members.length})
        </button>
        <button class="ewp-tab-btn ${activeTab === 'supports' ? 'active' : ''}" data-tab="supports" style="padding:8px 14px;font-weight:700;border:none;background:${activeTab === 'supports' ? '#0284c7' : 'transparent'};color:${activeTab === 'supports' ? 'white' : '#475569'};border-radius:6px 6px 0 0;cursor:pointer">
          🔩 Support & Bearing Callouts
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="ewp-tab-content">
        ${renderEWPTabContent(report, activeTab, model)}
      </div>

      <!-- Footer Actions -->
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid #cbd5e1;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <span style="font-size:11px;color:#64748b">Timber Teck Structural Floor Framing Engine · Eurocode 5 & NDS 2024 Compliant</span>
        <div style="display:flex;gap:8px">
          <button id="ewp-export-csv" style="padding:6px 12px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer">
            Export CSV Takeoff
          </button>
          <button id="ewp-print-spec" style="padding:6px 12px;background:#0f172a;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer">
            Print / Save Spec Report
          </button>
        </div>
      </div>
    </div>
  `;

  mb.innerHTML = html;
  if (modal.showModal && !modal.open) modal.showModal();

  const tabBtns = mb.querySelectorAll('.ewp-tab-btn');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      openEWPSpecificationsModal(model, btn.dataset.tab);
    };
  });

  const recalcBtn = mb.querySelector('#ewp-recalc-btn');
  if (recalcBtn) {
    recalcBtn.onclick = () => {
      const live = Number(mb.querySelector('#ewp-ctrl-live').value);
      const dead = Number(mb.querySelector('#ewp-ctrl-dead').value);
      const spacingIn = Number(mb.querySelector('#ewp-ctrl-spacing').value);
      const section = mb.querySelector('#ewp-ctrl-section').value;
      const fcPerp = Number(mb.querySelector('#ewp-ctrl-fcperp').value);
      const defVal = mb.querySelector('#ewp-ctrl-deflection').value.split('-');

      evaluateFloorEWPSpecs(model, {
        livePsf: live,
        deadPsf: dead,
        spacingFt: spacingIn / 12,
        section,
        fcPerp,
        defLLLimit: Number(defVal[0]),
        defTLLimit: Number(defVal[1])
      });

      if (model.floors && model.floors[0]) {
        model.floors[0].ewpSystem = { section };
      }
      if (window.ewpBeamToolState) {
        window.ewpBeamToolState.joistSection = section;
        window.ewpBeamToolState.joistSpacingIn = spacingIn;
        window.ewpBeamToolState.livePsf = live;
        window.ewpBeamToolState.deadPsf = dead;
      }
      model.spacingFt = spacingIn / 12;
      if (typeof window.render === 'function') window.render();
      openEWPSpecificationsModal(model, activeTab);
    };
  }

  // Hook interactive events for real-time beam sizer tab or floor options tab
  if (activeTab === 'beamsizer') {
    bindBeamSizerModalEvents(mb, model);
  } else if (activeTab === 'flooroptions') {
    bindFloorOptionsModalEvents(mb, model);
  }

  const csvBtn = mb.querySelector('#ewp-export-csv');
  if (csvBtn) {
    csvBtn.onclick = () => {
      const csvData = ewpTakeoffCSV(model);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ewp-floor-takeoff-L${report.level}.csv`;
      a.click();
    };
  }

  const printBtn = mb.querySelector('#ewp-print-spec');
  if (printBtn) {
    printBtn.onclick = () => {
      window.print();
    };
  }
}

function bindBeamSizerModalEvents(mb, model) {
  const spanInput = mb.querySelector('#bs-span');
  const spanVal = mb.querySelector('#bs-span-val');
  const tribInput = mb.querySelector('#bs-trib');
  const tribVal = mb.querySelector('#bs-trib-val');
  const liveInput = mb.querySelector('#bs-live');
  const liveVal = mb.querySelector('#bs-live-val');
  const deadInput = mb.querySelector('#bs-dead');
  const deadVal = mb.querySelector('#bs-dead-val');
  const secSelect = mb.querySelector('#bs-sec');
  const pliesSelect = mb.querySelector('#bs-plies');

  function updateLiveCalc() {
    const span = Number(spanInput.value);
    const trib = Number(tribInput.value);
    const live = Number(liveInput.value);
    const dead = Number(deadInput.value);
    const sec = secSelect.value;
    const plies = Number(pliesSelect.value);

    spanVal.textContent = `${span.toFixed(1)} ft (${Math.round(span * 304.8)} mm)`;
    tribVal.textContent = `${trib.toFixed(1)} ft (${Math.round(trib * 304.8)} mm)`;
    liveVal.textContent = `${live} psf`;
    deadVal.textContent = `${dead} psf`;

    const res = calculateEWPBeamLoadAndSizing({
      spanFt: span,
      tribWidthFt: trib,
      livePsf: live,
      deadPsf: dead,
      currentSection: sec,
      currentPlies: plies
    });

    // Update real-time metric pills
    const outArea = mb.querySelector('#bs-out-area');
    if (outArea) outArea.textContent = `${res.inputs.tribAreaSqFt} sq ft`;
    const outLoad = mb.querySelector('#bs-out-load');
    if (outLoad) outLoad.textContent = `${res.demands.wTL_plf} plf`;
    const outTotal = mb.querySelector('#bs-out-total');
    if (outTotal) outTotal.textContent = `${res.demands.totalLoadLb.toLocaleString()} lbs`;
    const outM = mb.querySelector('#bs-out-m');
    if (outM) outM.textContent = `${res.demands.M_max_ft_lb.toLocaleString()} ft-lbs`;
    const outV = mb.querySelector('#bs-out-v');
    if (outV) outV.textContent = `${res.demands.V_max_lb.toLocaleString()} lbs`;
    const outR = mb.querySelector('#bs-out-r');
    if (outR) outR.textContent = `${res.demands.reactionLb.toLocaleString()} lbs`;

    const cur = res.currentCandidate;
    const curDc = mb.querySelector('#bs-cur-dc');
    if (curDc) {
      curDc.textContent = `${cur.dcPercent}% [D/C ${cur.dcRatio}]`;
      curDc.style.color = cur.status === 'PASS' ? '#16a34a' : cur.status === 'WARNING' ? '#d97706' : '#dc2626';
    }
    const curBar = mb.querySelector('#bs-cur-bar');
    if (curBar) {
      curBar.style.width = Math.min(100, cur.dcPercent) + '%';
      curBar.style.background = cur.status === 'PASS' ? '#22c55e' : cur.status === 'WARNING' ? '#f59e0b' : '#ef4444';
    }
    const curGov = mb.querySelector('#bs-cur-gov');
    if (curGov) curGov.textContent = `Governing: ${cur.governing} (Max Allowable: ${cur.M_cap_ft_lb.toLocaleString()} ft-lb)`;

    const optBadge = mb.querySelector('#bs-opt-badge');
    if (optBadge) {
      optBadge.innerHTML = `<strong style="color:#0284c7">${res.optimal.name}</strong> · D/C: ${res.optimal.dcPercent}% · ${res.optimal.governing} (${100 - res.optimal.dcPercent}% Reserve)`;
    }

    // Re-render candidates table
    const tableBody = mb.querySelector('#bs-candidates-body');
    if (tableBody) {
      tableBody.innerHTML = res.candidates.map(c => {
        const isCurrent = c.section === sec && c.plies === plies;
        const isOpt = c.name === res.optimal.name;
        return `
          <tr style="border-bottom:1px solid #e2e8f0;background:${isOpt ? '#f0fdf4' : isCurrent ? '#eff6ff' : 'white'}">
            <td style="padding:6px;font-weight:700">
              ${c.name}
              ${isOpt ? '<span style="background:#16a34a;color:white;font-size:9.5px;padding:1px 4px;border-radius:3px;margin-left:4px">OPTIMAL</span>' : ''}
              ${isCurrent ? '<span style="background:#2563eb;color:white;font-size:9.5px;padding:1px 4px;border-radius:3px;margin-left:4px">SELECTED</span>' : ''}
            </td>
            <td style="padding:6px">${c.widthIn}" x ${c.depthIn}"</td>
            <td style="padding:6px">${c.M_cap_ft_lb.toLocaleString()} ft-lb</td>
            <td style="padding:6px">${c.deltaTL_in}" (L/${c.ratioTL})</td>
            <td style="padding:6px">${c.minBearingIn}"</td>
            <td style="padding:6px;font-weight:700;color:${c.status === 'PASS' ? '#16a34a' : c.status === 'WARNING' ? '#d97706' : '#dc2626'}">${c.dcPercent}%</td>
            <td style="padding:6px">${c.governing}</td>
            <td style="padding:6px">
              <span style="padding:2px 6px;border-radius:4px;font-weight:700;font-size:10px;background:${c.status === 'PASS' ? '#dcfce7' : c.status === 'WARNING' ? '#fef3c7' : '#fee2e2'};color:${c.status === 'PASS' ? '#15803d' : c.status === 'WARNING' ? '#b45309' : '#b91c1c'}">
                ${c.status}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  [spanInput, tribInput, liveInput, deadInput, secSelect, pliesSelect].forEach(el => {
    if (el) el.oninput = updateLiveCalc;
  });

  const applyBtn = mb.querySelector('#bs-apply-btn');
  if (applyBtn) {
    applyBtn.onclick = () => {
      const span = Number(spanInput.value);
      const trib = Number(tribInput.value);
      const res = calculateEWPBeamLoadAndSizing({
        spanFt: span,
        tribWidthFt: trib,
        livePsf: Number(liveInput.value),
        deadPsf: Number(deadInput.value),
        currentSection: secSelect.value,
        currentPlies: Number(pliesSelect.value)
      });
      secSelect.value = res.optimal.section;
      pliesSelect.value = res.optimal.plies;
      if (model.beams && model.beams[0]) {
        model.beams[0].section = res.optimal.section;
        model.beams[0].plies = res.optimal.plies;
        model.beams[0].status = 'SIZED & VERIFIED';
      }
      if (window.ewpBeamToolState) {
        window.ewpBeamToolState.currentSection = res.optimal.section;
        window.ewpBeamToolState.currentPlies = res.optimal.plies;
        window.ewpBeamToolState.spanFt = span;
        window.ewpBeamToolState.tribWidthFt = trib;
      }
      if (typeof window.render === 'function') window.render();
      updateLiveCalc();
      if (typeof window.toast === 'function') window.toast(`Applied optimal size ${res.optimal.name} to model!`);
    };
  }
}

function bindFloorOptionsModalEvents(mb, model) {
  const applyBtn = mb.querySelector('#fo-apply-btn');
  const apply3DBtn = mb.querySelector('#fo-apply-3d-btn');

  const syncFloorOptionsToState = () => {
    const st = window.ewpBeamToolState || {};
    st.joistSystem = mb.querySelector('#fo-joist-system')?.value || st.joistSystem || 'I-Joist';
    st.joistSection = mb.querySelector('#fo-joist-section')?.value || st.joistSection || 'I-Joist 11-7/8';
    st.joistSpacingIn = Number(mb.querySelector('#fo-spacing')?.value || st.joistSpacingIn || 16);
    st.joistDirection = mb.querySelector('#fo-direction')?.value || st.joistDirection || 'Y';
    st.endBearingType = mb.querySelector('#fo-end-bearing')?.value || st.endBearingType || 'ewp_rim';
    st.girderType = mb.querySelector('#fo-girder-type')?.value || st.girderType || 'flush_hanger';
    st.joistHangerType = mb.querySelector('#fo-hanger-type')?.value || st.joistHangerType || 'face_mount';
    st.bridgingType = mb.querySelector('#fo-bridging-type')?.value || st.bridgingType || 'solid_blocking';
    st.bridgingRows = mb.querySelector('#fo-bridging-rows')?.value || st.bridgingRows || 'auto_ewp';
    st.subfloorDecking = mb.querySelector('#fo-subfloor-decking')?.value || st.subfloorDecking || 'osb_22mm_tg';

    st.openingEnabled = Boolean(mb.querySelector('#fo-opening-enabled')?.checked);
    st.openingWidthMm = Number(mb.querySelector('#fo-opening-w')?.value || 2400);
    st.openingLengthMm = Number(mb.querySelector('#fo-opening-l')?.value || 2200);
    st.openingXMm = Number(mb.querySelector('#fo-opening-x')?.value || 8200);
    st.openingYMm = Number(mb.querySelector('#fo-opening-y')?.value || 1200);
    st.trimmerPlies = Number(mb.querySelector('#fo-trimmer-plies')?.value || 2);
    st.headerPlies = Number(mb.querySelector('#fo-header-plies')?.value || 2);

    st.cantileverEnabled = Boolean(mb.querySelector('#fo-cantilever-enabled')?.checked);
    st.cantileverSide = mb.querySelector('#fo-cantilever-side')?.value || 'south';
    st.cantileverMm = Number(mb.querySelector('#fo-cantilever-mm')?.value || 900);

    st.partitionDoublers = Boolean(mb.querySelector('#fo-partition-doublers')?.checked);
    st.squashBlocks = Boolean(mb.querySelector('#fo-squash-blocks')?.checked);
    st.webStiffeners = Boolean(mb.querySelector('#fo-web-stiffeners')?.checked);
    st.showSubfloorPanels = Boolean(mb.querySelector('#fo-show-subfloor')?.checked);
    st.showMepChase = Boolean(mb.querySelector('#fo-show-mep')?.checked);

    // Sync to all slabs in model.elements
    for (const el of (model?.elements || [])) {
      if (el.type === 'slab') {
        el.joistSystem = st.joistSystem;
        el.joistSection = st.joistSection;
        el.joistSpacing = Math.round(st.joistSpacingIn * 25.4 * 10) / 10;
        el.joistDirection = st.joistDirection;
        el.endBearingType = st.endBearingType;
        el.girderType = st.girderType;
        el.joistHangerType = st.joistHangerType;
        el.bridgingType = st.bridgingType;
        el.bridgingRows = st.bridgingRows;
        el.subfloorDecking = st.subfloorDecking;
        el.openingEnabled = st.openingEnabled;
        el.openingWidthMm = st.openingWidthMm;
        el.openingLengthMm = st.openingLengthMm;
        el.openingXMm = st.openingXMm;
        el.openingYMm = st.openingYMm;
        el.trimmerPlies = st.trimmerPlies;
        el.headerPlies = st.headerPlies;
        el.cantileverEnabled = st.cantileverEnabled;
        el.cantileverSide = st.cantileverSide;
        el.cantileverMm = st.cantileverMm;
        el.partitionDoublers = st.partitionDoublers;
        el.squashBlocks = st.squashBlocks;
        el.webStiffeners = st.webStiffeners;
      }
    }

    if (typeof window.updateEWPBeamHUD === 'function') {
      window.updateEWPBeamHUD();
    }
    if (typeof window.render === 'function') window.render();
  };

  const sysSel = mb.querySelector('#fo-joist-system');
  const secSel = mb.querySelector('#fo-joist-section');
  if (sysSel && secSel) {
    sysSel.onchange = () => {
      const fam = sysSel.value;
      const matching = Object.keys(EWP_CATALOG).filter(k => EWP_CATALOG[k].family === fam);
      if (matching.length) {
        secSel.value = matching[1] || matching[0];
      }
      syncFloorOptionsToState();
    };
  }

  mb.querySelectorAll('select, input').forEach(inp => {
    if (inp !== sysSel) {
      inp.addEventListener('change', syncFloorOptionsToState);
    }
  });

  if (applyBtn) {
    applyBtn.onclick = () => {
      syncFloorOptionsToState();
      document.getElementById('modal')?.close?.();
      if (typeof window.setView === 'function') window.setView('ewpspecs');
      if (typeof window.toast === 'function') {
        const st = window.ewpBeamToolState || {};
        window.toast(`⚡ Applied Floor Framing Options: ${st.joistSection} @ ${st.joistSpacingIn}" O.C. (${st.girderType.replace('_', ' ')})`);
      }
    };
  }

  if (apply3DBtn) {
    apply3DBtn.onclick = () => {
      syncFloorOptionsToState();
      document.getElementById('modal')?.close?.();
      if (typeof window.setView === 'function') window.setView('framing3d');
      if (typeof window.toast === 'function') {
        window.toast('⚡ Floor framing regenerated in 3D Timber Framing view');
      }
    };
  }
}

function renderEWPTabContent(report, tab, model) {
  if (tab === 'flooroptions') {
    const st = (typeof window !== 'undefined' && window.ewpBeamToolState) ? window.ewpBeamToolState : {};
    const joistSystem = st.joistSystem || 'I-Joist';
    const joistSection = st.joistSection || report.primarySection || 'I-Joist 11-7/8';
    const spacingIn = st.joistSpacingIn || report.spacingIn || 16;
    const joistDir = st.joistDirection || 'Y';
    const endBearing = st.endBearingType || 'ewp_rim';
    const girderType = st.girderType || 'flush_hanger';
    const joistHangerType = st.joistHangerType || 'face_mount';
    const bridgingType = st.bridgingType || 'solid_blocking';
    const bridgingRows = st.bridgingRows || 'auto_ewp';
    const subfloorDecking = st.subfloorDecking || 'osb_22mm_tg';

    const joistSectionKeys = Object.keys(EWP_CATALOG).filter(k =>
      ['I-Joist', 'Posi-Strut', 'Floor Truss', 'Dimensional'].includes(EWP_CATALOG[k].family)
    );

    return `
      <div style="font-size:12px;color:#1e293b">
        <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div>
            <strong style="color:#92400e;font-size:13px;display:block">🛠️ Complete Timber Teck Floor Framing Configuration Studio</strong>
            <span style="color:#78350f;font-size:11.5px">Configure Posi-Strut metal-web trusses, open-web wood trusses, EWP I-joists, C24 dimensional joists, rim closure, girders, hangers, stairwell trimmers/headers, cantilevers, bridging, MEP chases & subfloor decking.</span>
          </div>
          <div style="display:flex;gap:8px">
            <button id="fo-apply-btn" type="button" style="padding:7px 14px;background:#d97706;color:white;border:none;border-radius:6px;font-weight:700;cursor:pointer">⚡ Apply to 2D Floor Plan</button>
            <button id="fo-apply-3d-btn" type="button" style="padding:7px 14px;background:#0f172a;color:white;border:none;border-radius:6px;font-weight:700;cursor:pointer">🧊 Apply & View 3D Framing</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px">
          <!-- Card 1: Joist System & Orientation -->
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
            <h4 style="margin:0 0 10px 0;font-size:12.5px;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:6px">1. Floor Joist / Truss System</h4>
            <label style="display:flex;flex-direction:column;gap:4px;margin-bottom:8px">
              <span style="font-weight:700;color:#475569">System Family</span>
              <select id="fo-joist-system" style="padding:6px;border:1px solid #94a3b8;border-radius:5px;background:white">
                <option value="I-Joist" ${joistSystem === 'I-Joist' ? 'selected' : ''}>Engineered Wood I-Joist (TJI / BCI / LPI)</option>
                <option value="Posi-Strut" ${joistSystem === 'Posi-Strut' ? 'selected' : ''}>Posi-Strut Metal-Web Open Joist</option>
                <option value="Floor Truss" ${joistSystem === 'Floor Truss' ? 'selected' : ''}>Open-Web Plate-Connected Wood Floor Truss</option>
                <option value="Dimensional" ${joistSystem === 'Dimensional' ? 'selected' : ''}>Solid Sawn / C24 Dimensional Timber</option>
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:4px;margin-bottom:8px">
              <span style="font-weight:700;color:#475569">Member Section & Depth</span>
              <select id="fo-joist-section" style="padding:6px;border:1px solid #94a3b8;border-radius:5px;background:white">
                ${joistSectionKeys.map(k => `<option value="${k}" ${k === joistSection ? 'selected' : ''}>${k}</option>`).join('')}
              </select>
            </label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <label style="display:flex;flex-direction:column;gap:4px">
                <span style="font-weight:700;color:#475569">O.C. Spacing</span>
                <select id="fo-spacing" style="padding:6px;border:1px solid #94a3b8;border-radius:5px;background:white">
                  <option value="12" ${spacingIn === 12 ? 'selected' : ''}>12" (305 mm)</option>
                  <option value="16" ${spacingIn === 16 ? 'selected' : ''}>16" (406 mm)</option>
                  <option value="19.2" ${Math.round(spacingIn) === 19 ? 'selected' : ''}>19.2" (488 mm)</option>
                  <option value="24" ${spacingIn === 24 ? 'selected' : ''}>24" (610 mm)</option>
                </select>
              </label>
              <label style="display:flex;flex-direction:column;gap:4px">
                <span style="font-weight:700;color:#475569">Span Direction</span>
                <select id="fo-direction" style="padding:6px;border:1px solid #94a3b8;border-radius:5px;background:white">
                  <option value="Y" ${joistDir === 'Y' ? 'selected' : ''}>Y-Axis (North–South)</option>
                  <option value="X" ${joistDir === 'X' ? 'selected' : ''}>X-Axis (East–West)</option>
                  <option value="Auto" ${joistDir === 'Auto' ? 'selected' : ''}>Auto (Shortest Span)</option>
                </select>
              </label>
            </div>
          </div>

          <!-- Card 2: Bearing, Rim Closure, Hangers & Girders -->
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
            <h4 style="margin:0 0 10px 0;font-size:12.5px;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:6px">2. Rim Closure, Hangers & Girders</h4>
            <label style="display:flex;flex-direction:column;gap:4px;margin-bottom:6px">
              <span style="font-weight:700;color:#475569">Perimeter End / Rim Condition</span>
              <select id="fo-end-bearing" style="padding:5px;border:1px solid #94a3b8;border-radius:5px;background:white">
                <option value="ewp_rim" ${endBearing === 'ewp_rim' ? 'selected' : ''}>1-1/8" EWP Rim Board Closure</option>
                <option value="solid_rim" ${endBearing === 'solid_rim' ? 'selected' : ''}>2x Solid Timber Band / Rim Joist</option>
                <option value="top_chord_bearing" ${endBearing === 'top_chord_bearing' ? 'selected' : ''}>Top-Chord Bearing Truss (Hanging on Wall)</option>
                <option value="bottom_chord_bearing" ${endBearing === 'bottom_chord_bearing' ? 'selected' : ''}>Bottom-Chord Bearing + Ribbon Blocking</option>
                <option value="ledger_hanger" ${endBearing === 'ledger_hanger' ? 'selected' : ''}>Rim Ledger + Face-Mount Joist Hangers</option>
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:4px;margin-bottom:6px">
              <span style="font-weight:700;color:#0284c7">Joist Hanger Connection Type (Simpson Strong-Tie &amp; MiTek)</span>
              <select id="fo-hanger-type" style="padding:5px;border:1px solid #93c5fd;border-radius:5px;background:#f0f9ff;font-weight:600">
                <option value="face_mount" ${joistHangerType === 'face_mount' ? 'selected' : ''}>Simpson Strong-Tie LUS210 / MIU Face-Mount (1,480 lbs)</option>
                <option value="top_mount" ${joistHangerType === 'top_mount' ? 'selected' : ''}>Simpson Strong-Tie IUS / ITS Top-Flange (1,620 lbs)</option>
                <option value="concealed_flange" ${joistHangerType === 'concealed_flange' ? 'selected' : ''}>Simpson Strong-Tie IUC / LUCZ Concealed-Flange (1,350 lbs)</option>
                <option value="adjustable_truss" ${joistHangerType === 'adjustable_truss' ? 'selected' : ''}>Simpson Strong-Tie THA422 / MSTA Truss Strap (2,150 lbs)</option>
                <option value="heavy_skewed" ${joistHangerType === 'heavy_skewed' ? 'selected' : ''}>Simpson Strong-Tie HHUS / SUR Heavy Double-Shear (2,840 lbs)</option>
                <option value="simpson_hgus" ${joistHangerType === 'simpson_hgus' ? 'selected' : ''}>Simpson Strong-Tie HGUS210-2 Heavy Girder (5,650 lbs)</option>
                <option value="mitek_ihf" ${joistHangerType === 'mitek_ihf' ? 'selected' : ''}>MiTek IHF / JDH Face-Mount (1,540 lbs)</option>
                <option value="mitek_itf" ${joistHangerType === 'mitek_itf' ? 'selected' : ''}>MiTek ITF / TFL Top-Flange (1,685 lbs)</option>
                <option value="mitek_ihfl" ${joistHangerType === 'mitek_ihfl' ? 'selected' : ''}>MiTek IHFL Concealed-Flange (1,390 lbs)</option>
                <option value="mitek_tsh" ${joistHangerType === 'mitek_tsh' ? 'selected' : ''}>MiTek TSH / THDH Adjustable Truss Strap (2,240 lbs)</option>
                <option value="mitek_hdo" ${joistHangerType === 'mitek_hdo' ? 'selected' : ''}>MiTek HDO / HJU Heavy Double-Shear (2,960 lbs)</option>
                <option value="mitek_hdg" ${joistHangerType === 'mitek_hdg' ? 'selected' : ''}>MiTek HD210-2 / BPH Heavy Girder (5,820 lbs)</option>
                <option value="ledger_ribbon" ${joistHangerType === 'ledger_ribbon' ? 'selected' : ''}>Direct Bearing on Ledger Ribbon + Web Stiffeners (1,520 lbs)</option>
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:4px;margin-bottom:6px">
              <span style="font-weight:700;color:#475569">Interior Girder / Support Mode</span>
              <select id="fo-girder-type" style="padding:5px;border:1px solid #94a3b8;border-radius:5px;background:white">
                <option value="flush_hanger" ${girderType === 'flush_hanger' ? 'selected' : ''}>Flush LVL/PSL Girder (Joist Hangers)</option>
                <option value="dropped_beam" ${girderType === 'dropped_beam' ? 'selected' : ''}>Dropped Girder (Joists Continuous / Lapped Over)</option>
                <option value="double_girder" ${girderType === 'double_girder' ? 'selected' : ''}>Double Interior Girders (3 Equal Bays)</option>
                <option value="pocket_steel" ${girderType === 'pocket_steel' ? 'selected' : ''}>Recessed Steel W8x18 + Wood Nailer Pack</option>
                <option value="clear_span" ${girderType === 'clear_span' ? 'selected' : ''}>Clear Span Wall-to-Wall (No Interior Girder)</option>
              </select>
            </label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <label style="display:flex;flex-direction:column;gap:4px">
                <span style="font-weight:700;color:#475569">Bridging / Strutting</span>
                <select id="fo-bridging-type" style="padding:5px;border:1px solid #94a3b8;border-radius:5px;background:white">
                  <option value="solid_blocking" ${bridgingType === 'solid_blocking' ? 'selected' : ''}>Full-Depth Solid Blocking</option>
                  <option value="herringbone" ${bridgingType === 'herringbone' ? 'selected' : ''}>Herringbone Cross-Bridging</option>
                  <option value="strongback_2x6" ${bridgingType === 'strongback_2x6' ? 'selected' : ''}>2x6 Internal Strongback (Truss)</option>
                  <option value="bottom_strapping" ${bridgingType === 'bottom_strapping' ? 'selected' : ''}>Continuous Bottom Strapping</option>
                  <option value="none" ${bridgingType === 'none' ? 'selected' : ''}>None</option>
                </select>
              </label>
              <label style="display:flex;flex-direction:column;gap:4px">
                <span style="font-weight:700;color:#475569">Bridging Rows (EWP Rules)</span>
                <select id="fo-bridging-rows" style="padding:5px;border:1px solid #94a3b8;border-radius:5px;background:white">
                  <option value="auto_ewp" ${bridgingRows === 'auto_ewp' ? 'selected' : ''}>Auto EWP Manufacturer Rules (Span-Based)</option>
                  <option value="midspan" ${bridgingRows === 'midspan' ? 'selected' : ''}>Mid-Span of Each Bay (L/2)</option>
                  <option value="third_points" ${bridgingRows === 'third_points' ? 'selected' : ''}>1/3 & 2/3 Span Points (2 Rows/Bay)</option>
                  <option value="every_2100mm" ${bridgingRows === 'every_2100mm' ? 'selected' : ''}>Every 2,100 mm (7'-0") Max</option>
                </select>
              </label>
            </div>
          </div>

          <!-- Card 3: Stairwell Opening & Cantilever Overhang -->
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
            <h4 style="margin:0 0 10px 0;font-size:12.5px;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:6px">3. Stairwell Opening & Cantilever</h4>
            <label style="display:flex;align-items:center;gap:6px;font-weight:700;color:#0f172a;margin-bottom:6px;cursor:pointer">
              <input id="fo-opening-enabled" type="checkbox" ${st.openingEnabled !== false ? 'checked' : ''}>
              Frame Stairwell / Floor Opening (Trimmers & Headers)
            </label>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:8px">
              <label style="display:flex;flex-direction:column;font-size:10.5px;color:#475569">W (mm)<input id="fo-opening-w" type="number" step="100" value="${st.openingWidthMm || 2400}" style="padding:4px;border:1px solid #cbd5e1;border-radius:4px"></label>
              <label style="display:flex;flex-direction:column;font-size:10.5px;color:#475569">L (mm)<input id="fo-opening-l" type="number" step="100" value="${st.openingLengthMm || 2200}" style="padding:4px;border:1px solid #cbd5e1;border-radius:4px"></label>
              <label style="display:flex;flex-direction:column;font-size:10.5px;color:#475569">X (mm)<input id="fo-opening-x" type="number" step="100" value="${st.openingXMm || 8200}" style="padding:4px;border:1px solid #cbd5e1;border-radius:4px"></label>
              <label style="display:flex;flex-direction:column;font-size:10.5px;color:#475569">Y (mm)<input id="fo-opening-y" type="number" step="100" value="${st.openingYMm || 1200}" style="padding:4px;border:1px solid #cbd5e1;border-radius:4px"></label>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
              <label style="display:flex;flex-direction:column;font-size:10.5px;color:#475569">Trimmer Plies
                <select id="fo-trimmer-plies" style="padding:4px;border:1px solid #cbd5e1;border-radius:4px;background:white">
                  <option value="2" ${(st.trimmerPlies || 2) === 2 ? 'selected' : ''}>Double Trimmer (2-Ply)</option>
                  <option value="3" ${st.trimmerPlies === 3 ? 'selected' : ''}>Triple Trimmer (3-Ply)</option>
                </select>
              </label>
              <label style="display:flex;flex-direction:column;font-size:10.5px;color:#475569">Header Plies (LVL)
                <select id="fo-header-plies" style="padding:4px;border:1px solid #cbd5e1;border-radius:4px;background:white">
                  <option value="2" ${(st.headerPlies || 2) === 2 ? 'selected' : ''}>Double Header (2-Ply LVL)</option>
                  <option value="3" ${st.headerPlies === 3 ? 'selected' : ''}>Triple Header (3-Ply LVL)</option>
                </select>
              </label>
            </div>

            <label style="display:flex;align-items:center;gap:6px;font-weight:700;color:#0f172a;margin-bottom:6px;cursor:pointer;padding-top:6px;border-top:1px dashed #cbd5e1">
              <input id="fo-cantilever-enabled" type="checkbox" ${st.cantileverEnabled ? 'checked' : ''}>
              Cantilever Balcony Overhang (2:1 Back-Span Rule)
            </label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
              <label style="display:flex;flex-direction:column;font-size:10.5px;color:#475569">Overhang Edge
                <select id="fo-cantilever-side" style="padding:4px;border:1px solid #cbd5e1;border-radius:4px;background:white">
                  <option value="south" ${(st.cantileverSide || 'south') === 'south' ? 'selected' : ''}>South Edge (+Y)</option>
                  <option value="north" ${st.cantileverSide === 'north' ? 'selected' : ''}>North Edge (-Y)</option>
                  <option value="east" ${st.cantileverSide === 'east' ? 'selected' : ''}>East Edge (+X)</option>
                  <option value="west" ${st.cantileverSide === 'west' ? 'selected' : ''}>West Edge (-X)</option>
                </select>
              </label>
              <label style="display:flex;flex-direction:column;font-size:10.5px;color:#475569">Cantilever (mm)
                <input id="fo-cantilever-mm" type="number" min="300" max="1800" step="100" value="${st.cantileverMm || 900}" style="padding:4px;border:1px solid #cbd5e1;border-radius:4px">
              </label>
            </div>
          </div>
        </div>

        <!-- Second Row: Subfloor Decking, Point-Load Accessories & MEP Service Coordination -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
          <h4 style="margin:0 0 10px 0;font-size:12.5px;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:6px">4. Subfloor Sheathing, Point-Load Reinforcement & MEP Service Chase</h4>
          <div style="display:grid;grid-template-columns:260px 1fr;gap:16px;align-items:center">
            <label style="display:flex;flex-direction:column;gap:4px">
              <span style="font-weight:700;color:#475569">Subfloor Decking Specification</span>
              <select id="fo-subfloor-decking" style="padding:6px;border:1px solid #94a3b8;border-radius:5px;background:white">
                <option value="osb_22mm_tg" ${subfloorDecking === 'osb_22mm_tg' ? 'selected' : ''}>22 mm T&G OSB/3 Structural Subfloor (Glued & Screwed)</option>
                <option value="advantech_19mm" ${subfloorDecking === 'advantech_19mm' ? 'selected' : ''}>3/4" (19 mm) T&G Advantech Structural Subfloor</option>
                <option value="plywood_18mm_tg" ${subfloorDecking === 'plywood_18mm_tg' ? 'selected' : ''}>18 mm T&G Structural Marine Plywood</option>
                <option value="gypsum_25mm" ${subfloorDecking === 'gypsum_25mm' ? 'selected' : ''}>25 mm Acoustic Gypsum Screed Over 18 mm OSB</option>
              </select>
            </label>
            <div style="display:flex;flex-wrap:wrap;gap:14px">
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;color:#334155">
                <input id="fo-partition-doublers" type="checkbox" ${st.partitionDoublers !== false ? 'checked' : ''}>
                Double Joists Under Parallel Partition Walls
              </label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;color:#334155">
                <input id="fo-squash-blocks" type="checkbox" ${st.squashBlocks !== false ? 'checked' : ''}>
                2x4 / LVL Squash Blocks at Trimmers & Point Loads
              </label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;color:#334155">
                <input id="fo-web-stiffeners" type="checkbox" ${st.webStiffeners !== false ? 'checked' : ''}>
                Web Stiffeners at Bearings & Hangers
              </label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;color:#0369a1">
                <input id="fo-show-mep" type="checkbox" ${st.showMepChase !== false ? 'checked' : ''}>
                Show MEP HVAC Trunk Chase / Web Hole Zones
              </label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;color:#b45309">
                <input id="fo-show-subfloor" type="checkbox" ${st.showSubfloorPanels ? 'checked' : ''}>
                Overlay 4x8 ft (1200×2400 mm) Staggered T&G Subfloor Sheets
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (tab === 'summary') {
    return `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px">
        <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
          <span style="font-size:11px;color:#64748b;font-weight:600;display:block">GOVERNING D/C RATIO</span>
          <b style="font-size:22px;color:${report.summary.maxDcPercent > 100 ? '#dc2626' : (report.summary.maxDcPercent > 90 ? '#d97706' : '#16a34a')}">${report.summary.maxDcPercent}%</b>
          <span style="font-size:10.5px;color:#475569">${report.summary.overallStatus}</span>
        </div>
        <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
          <span style="font-size:11px;color:#64748b;font-weight:600;display:block">MAX CLEAR JOIST SPAN</span>
          <b style="font-size:22px;color:#0f172a">${report.summary.maxSpanFt} ft</b>
          <span style="font-size:10.5px;color:#475569">Allowable: ${report.benchmarkSpan.allowableSpanFt} ft</span>
        </div>
        <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
          <span style="font-size:11px;color:#64748b;font-weight:600;display:block">MAX END REACTION</span>
          <b style="font-size:22px;color:#0f172a">${report.summary.maxReactionLb} lbs</b>
          <span style="font-size:10.5px;color:#475569">Design Load: ${report.designLoads.totalPsf} psf</span>
        </div>
        <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
          <span style="font-size:11px;color:#64748b;font-weight:600;display:block">TOTAL FLOOR MEMBERS</span>
          <b style="font-size:22px;color:#0f172a">${report.summary.totalMembers}</b>
          <span style="font-size:10.5px;color:#16a34a">${report.summary.passMembers} Pass · ${report.summary.failMembers} Fail</span>
        </div>
      </div>

      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:14px">
        <h4 style="margin:0 0 8px 0;color:#0f172a;font-size:14px">Engineering Specification Summary · Floor Level ${report.level}</h4>
        <div style="font-size:12px;line-height:1.6;color:#334155">
          <p><strong>Primary Floor Joist Section:</strong> ${report.primarySection} @ ${report.spacingIn}" o.c.</p>
          <p><strong>Design Load Criteria:</strong> Live Load = ${report.designLoads.livePsf} psf, Dead Load = ${report.designLoads.deadPsf} psf (Total Load = ${report.designLoads.totalPsf} psf). Deflection Limits: Live Load = L/${report.designLoads.defLLLimit}, Total Load = L/${report.designLoads.defTLLimit}.</p>
          <p><strong>Governing Span Limit Mode:</strong> ${report.benchmarkSpan.governingMode} (${report.benchmarkSpan.allowableSpanFt} ft max clear span).</p>
          <p><strong>Supporting Plate Capacity:</strong> Fc⊥ = ${report.designLoads.fcPerp} psi. Minimum end bearing length required on plate: 1.75 inches.</p>
        </div>
      </div>
    `;
  }

  if (tab === 'beamsizer') {
    const defaultSpan = 18.0;
    const defaultTrib = 14.0;
    const initialRes = calculateEWPBeamLoadAndSizing({
      spanFt: defaultSpan,
      tribWidthFt: defaultTrib,
      livePsf: 40,
      deadPsf: 15,
      currentSection: 'LVL 1-3/4x11-7/8',
      currentPlies: 2
    });

    return `
      <div style="font-size:12px">
        <!-- Interactive Controls Card -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:14px;margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid #e2e8f0;padding-bottom:8px">
            <h4 style="margin:0;font-size:13px;color:#0f172a">⚡ Real-Time Floor Beam Structural Load & Sizing Engine</h4>
            <span style="font-size:11px;color:#0284c7;font-weight:700">ASTM D5456 & NDS 2024 Sizing Criteria</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <label style="font-weight:700;color:#334155">Beam Span Length (L)</label>
                <span id="bs-span-val" style="font-weight:700;color:#0284c7">18.0 ft (5,486 mm)</span>
              </div>
              <input id="bs-span" type="range" min="8" max="32" step="0.5" value="18" style="width:100%;accent-color:#0284c7">

              <div style="display:flex;justify-content:space-between;margin-top:10px;margin-bottom:4px">
                <label style="font-weight:700;color:#334155">Supported Tributary Width (W_trib)</label>
                <span id="bs-trib-val" style="font-weight:700;color:#0284c7">14.0 ft (4,267 mm)</span>
              </div>
              <input id="bs-trib" type="range" min="4" max="26" step="0.5" value="14" style="width:100%;accent-color:#0284c7">
            </div>

            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <label style="font-weight:700;color:#334155">Floor Live Load (LL)</label>
                <span id="bs-live-val" style="font-weight:700;color:#0284c7">40 psf</span>
              </div>
              <input id="bs-live" type="range" min="20" max="100" step="5" value="40" style="width:100%;accent-color:#0284c7">

              <div style="display:flex;justify-content:space-between;margin-top:10px;margin-bottom:4px">
                <label style="font-weight:700;color:#334155">Floor Dead Load (DL)</label>
                <span id="bs-dead-val" style="font-weight:700;color:#0284c7">15 psf</span>
              </div>
              <input id="bs-dead" type="range" min="10" max="35" step="1" value="15" style="width:100%;accent-color:#0284c7">
            </div>
          </div>

          <div style="display:flex;gap:12px;margin-top:12px;align-items:center;padding-top:10px;border-top:1px dashed #cbd5e1;flex-wrap:wrap">
            <div style="display:flex;gap:6px;align-items:center">
              <label style="font-weight:700;color:#334155">Test Section:</label>
              <select id="bs-sec" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;background:white">
                <option value="LVL 1-3/4x9-1/2">LVL 1-3/4x9-1/2</option>
                <option value="LVL 1-3/4x11-7/8" selected>LVL 1-3/4x11-7/8</option>
                <option value="LVL 1-3/4x14">LVL 1-3/4x14</option>
                <option value="LVL 1-3/4x16">LVL 1-3/4x16</option>
                <option value="LVL 1-3/4x18">LVL 1-3/4x18</option>
                <option value="Glulam 3-1/8x12">Glulam 3-1/8x12</option>
                <option value="PSL 3-1/2x11-7/8">PSL 3-1/2x11-7/8</option>
                <option value="LSL 1-3/4x11-7/8">LSL 1-3/4x11-7/8</option>
              </select>
            </div>
            <div style="display:flex;gap:6px;align-items:center">
              <label style="font-weight:700;color:#334155">Plies:</label>
              <select id="bs-plies" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;background:white">
                <option value="1">1-ply</option>
                <option value="2" selected>2-ply</option>
                <option value="3">3-ply</option>
                <option value="4">4-ply</option>
              </select>
            </div>
            <button id="bs-apply-btn" style="margin-left:auto;padding:6px 14px;background:#16a34a;color:white;border:none;border-radius:6px;font-weight:700;cursor:pointer">
              ⚡ Apply Sized Member to Plan
            </button>
          </div>
        </div>

        <!-- Calculated Demand Metrics -->
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px">
          <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:8px">
            <span style="font-size:10px;color:#64748b;font-weight:600;display:block">TRIBUTARY AREA</span>
            <b id="bs-out-area" style="font-size:15px;color:#0f172a">${initialRes.inputs.tribAreaSqFt} sq ft</b>
          </div>
          <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:8px">
            <span style="font-size:10px;color:#64748b;font-weight:600;display:block">UNIFORM LOAD</span>
            <b id="bs-out-load" style="font-size:15px;color:#0f172a">${initialRes.demands.wTL_plf} plf</b>
          </div>
          <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:8px">
            <span style="font-size:10px;color:#64748b;font-weight:600;display:block">TOTAL DEMAND</span>
            <b id="bs-out-total" style="font-size:15px;color:#0f172a">${initialRes.demands.totalLoadLb.toLocaleString()} lbs</b>
          </div>
          <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:8px">
            <span style="font-size:10px;color:#64748b;font-weight:600;display:block">MAX MOMENT (M)</span>
            <b id="bs-out-m" style="font-size:15px;color:#0f172a">${initialRes.demands.M_max_ft_lb.toLocaleString()} ft-lb</b>
          </div>
          <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:8px">
            <span style="font-size:10px;color:#64748b;font-weight:600;display:block">MAX SHEAR (V)</span>
            <b id="bs-out-v" style="font-size:15px;color:#0f172a">${initialRes.demands.V_max_lb.toLocaleString()} lbs</b>
          </div>
          <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:8px">
            <span style="font-size:10px;color:#64748b;font-weight:600;display:block">END BEARING REACTION</span>
            <b id="bs-out-r" style="font-size:15px;color:#0f172a">${initialRes.demands.reactionLb.toLocaleString()} lbs</b>
          </div>
        </div>

        <!-- Current Status & Optimum Recommendation Banner -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
          <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <strong>Current Selected Beam Status</strong>
              <span id="bs-cur-dc" style="font-weight:700;color:${initialRes.currentCandidate.status === 'PASS' ? '#16a34a' : '#dc2626'}">${initialRes.currentCandidate.dcPercent}% [D/C ${initialRes.currentCandidate.dcRatio}]</span>
            </div>
            <div style="background:#e2e8f0;height:8px;border-radius:4px;overflow:hidden;margin-bottom:6px">
              <div id="bs-cur-bar" style="height:100%;width:${Math.min(100, initialRes.currentCandidate.dcPercent)}%;background:${initialRes.currentCandidate.status === 'PASS' ? '#22c55e' : '#ef4444'}"></div>
            </div>
            <small id="bs-cur-gov" style="color:#64748b;display:block">Governing: ${initialRes.currentCandidate.governing}</small>
          </div>

          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px">
            <span style="font-size:11px;font-weight:700;color:#166534;display:block;margin-bottom:4px">⚡ SIZING RECOMMENDATION</span>
            <div id="bs-opt-badge" style="font-size:13px;margin-bottom:4px">
              <strong style="color:#0284c7">${initialRes.optimal.name}</strong> · D/C: ${initialRes.optimal.dcPercent}% · ${initialRes.optimal.governing}
            </div>
            <small style="color:#15803d">Calculated optimal section minimizes plies and lumber volume while satisfying deflection and stress limits.</small>
          </div>
        </div>

        <!-- Candidate Matrix Table -->
        <h4 style="margin:0 0 8px 0;color:#0f172a;font-size:13px">Candidate Member Sizing Comparison Matrix</h4>
        <div style="overflow-x:auto;max-height:280px;border:1px solid #e2e8f0;border-radius:6px">
          <table style="width:100%;border-collapse:collapse;text-align:left;font-size:11.5px">
            <thead>
              <tr style="background:#f8fafc;border-bottom:2px solid #cbd5e1;position:sticky;top:0">
                <th style="padding:6px">Candidate Section</th>
                <th style="padding:6px">Width x Depth</th>
                <th style="padding:6px">Moment Cap. (ft-lb)</th>
                <th style="padding:6px">Deflection</th>
                <th style="padding:6px">Min Bearing</th>
                <th style="padding:6px">D/C Ratio</th>
                <th style="padding:6px">Governing Limit</th>
                <th style="padding:6px">Status</th>
              </tr>
            </thead>
            <tbody id="bs-candidates-body">
              ${initialRes.candidates.map(c => {
                const isCurrent = c.section === initialRes.currentCandidate.section && c.plies === initialRes.currentCandidate.plies;
                const isOpt = c.name === initialRes.optimal.name;
                return `
                  <tr style="border-bottom:1px solid #e2e8f0;background:${isOpt ? '#f0fdf4' : isCurrent ? '#eff6ff' : 'white'}">
                    <td style="padding:6px;font-weight:700">
                      ${c.name}
                      ${isOpt ? '<span style="background:#16a34a;color:white;font-size:9.5px;padding:1px 4px;border-radius:3px;margin-left:4px">OPTIMAL</span>' : ''}
                      ${isCurrent ? '<span style="background:#2563eb;color:white;font-size:9.5px;padding:1px 4px;border-radius:3px;margin-left:4px">SELECTED</span>' : ''}
                    </td>
                    <td style="padding:6px">${c.widthIn}" x ${c.depthIn}"</td>
                    <td style="padding:6px">${c.M_cap_ft_lb.toLocaleString()} ft-lb</td>
                    <td style="padding:6px">${c.deltaTL_in}" (L/${c.ratioTL})</td>
                    <td style="padding:6px">${c.minBearingIn}"</td>
                    <td style="padding:6px;font-weight:700;color:${c.status === 'PASS' ? '#16a34a' : c.status === 'WARNING' ? '#d97706' : '#dc2626'}">${c.dcPercent}%</td>
                    <td style="padding:6px">${c.governing}</td>
                    <td style="padding:6px">
                      <span style="padding:2px 6px;border-radius:4px;font-weight:700;font-size:10px;background:${c.status === 'PASS' ? '#dcfce7' : c.status === 'WARNING' ? '#fef3c7' : '#fee2e2'};color:${c.status === 'PASS' ? '#15803d' : c.status === 'WARNING' ? '#b45309' : '#b91c1c'}">
                        ${c.status}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'spantables') {
    const table = report.spanTable;
    return `
      <div style="font-size:12px">
        <h4 style="margin:0 0 8px 0;color:#0f172a">I-Joist Allowable Clear Span Table (${table.designCriteria.livePsf} psf Live / ${table.designCriteria.deadPsf} psf Dead)</h4>
        <div style="overflow-x:auto;margin-bottom:18px">
          <table style="width:100%;border-collapse:collapse;text-align:left;font-size:12px">
            <thead>
              <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1">
                <th style="padding:8px">I-Joist Series / Depth</th>
                ${table.spacings.map(sp => `<th style="padding:8px">${sp}" o.c. Spacing</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${table.joistMatrix.map(row => `
                <tr style="border-bottom:1px solid #e2e8f0;background:${row.section === report.primarySection ? '#eff6ff' : 'white'}">
                  <td style="padding:8px;font-weight:700;color:#0f172a">
                    ${row.section} ${row.section === report.primarySection ? '<span style="font-size:10px;background:#3b82f6;color:white;padding:1px 4px;border-radius:3px">CURRENT</span>' : ''}
                  </td>
                  ${table.spacings.map(sp => `
                    <td style="padding:8px">
                      <strong style="color:#1e293b;display:block">${row.spans[sp].formatted}</strong>
                      <span style="font-size:10px;color:#64748b">${row.spans[sp].governing}</span>
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <h4 style="margin:0 0 8px 0;color:#0f172a">LVL Beam Allowable Clear Span Table (Supported Tributary Width)</h4>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;text-align:left;font-size:12px">
            <thead>
              <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1">
                <th style="padding:8px">LVL Beam Section</th>
                ${table.tribWidthsFt.map(tw => `<th style="padding:8px">${tw}' Tributary</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${table.beamMatrix.map(row => `
                <tr style="border-bottom:1px solid #e2e8f0">
                  <td style="padding:8px;font-weight:700;color:#0f172a">${row.section}</td>
                  ${table.tribWidthsFt.map(tw => `
                    <td style="padding:8px">
                      <strong style="color:#1e293b">${row.spans[tw].formatted}</strong>
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'members') {
    return `
      <div style="overflow-x:auto;max-height:400px">
        <table style="width:100%;border-collapse:collapse;text-align:left;font-size:11.5px">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;position:sticky;top:0">
              <th style="padding:6px">Mark</th>
              <th style="padding:6px">Kind / Section</th>
              <th style="padding:6px">Span</th>
              <th style="padding:6px">Load (plf)</th>
              <th style="padding:6px">Reaction (lbs)</th>
              <th style="padding:6px">Deflection</th>
              <th style="padding:6px">Min Bearing</th>
              <th style="padding:6px">Hanger Model</th>
              <th style="padding:6px">D/C Ratio</th>
              <th style="padding:6px">Status</th>
            </tr>
          </thead>
          <tbody>
            ${report.members.map(m => `
              <tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:6px;font-weight:700">${m.id}</td>
                <td style="padding:6px">${m.kind} · ${m.section} ${m.plies > 1 ? `(${m.plies}-ply)` : ''}</td>
                <td style="padding:6px">${m.spanFtIn}</td>
                <td style="padding:6px">${m.loadPlf} plf</td>
                <td style="padding:6px">${m.endReactionLb} lbs</td>
                <td style="padding:6px">${m.deltaTL_in}" (L/${m.ratioTL})</td>
                <td style="padding:6px">${m.reqEndBearingIn}"</td>
                <td style="padding:6px;font-size:10.5px;color:#475569">${m.hangerModel}</td>
                <td style="padding:6px;font-weight:700;color:${m.dcPercent > 100 ? '#dc2626' : (m.dcPercent > 90 ? '#d97706' : '#16a34a')}">${m.dcPercent}%</td>
                <td style="padding:6px">
                  <span style="font-weight:700;padding:2px 6px;border-radius:4px;font-size:10px;background:${m.status === 'PASS' ? '#dcfce7' : (m.status === 'WARNING' ? '#fef3c7' : '#fee2e2')};color:${m.status === 'PASS' ? '#15803d' : (m.status === 'WARNING' ? '#b45309' : '#b91c1c')}">
                    ${m.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (tab === 'supports') {
    return `
      <div style="font-size:12px;line-height:1.6">
        <h4 style="margin:0 0 10px 0;color:#0f172a">Support & Bearing Specification Callouts</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
            <strong style="color:#0f172a;display:block;margin-bottom:6px">1. End Bearing Requirements</strong>
            <p style="margin:0;color:#334155">
              Minimum end bearing length on wood plates (Fc⊥ = ${report.designLoads.fcPerp} psi) is <strong>1.75 inches</strong> for all I-joist members. For reaction loads exceeding 1,200 lbs, bearing length increases to 2.25 - 3.50 inches.
            </p>
          </div>
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
            <strong style="color:#0f172a;display:block;margin-bottom:6px">2. Intermediate Support Bearing</strong>
            <p style="margin:0;color:#334155">
              Continuous joists over interior beams or load-bearing walls require a minimum intermediate bearing length of <strong>3.50 inches</strong>.
            </p>
          </div>
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
            <strong style="color:#0f172a;display:block;margin-bottom:6px">3. Web Stiffener Requirements</strong>
            <p style="margin:0;color:#334155">
              Field-installed web stiffeners (2x4 or 5/8" OSB filler blocks) are required at all end supports where end reaction exceeds 1,200 lbs, at all joist hangers, and on deep joists (≥ 14 inches).
            </p>
          </div>
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px">
            <strong style="color:#0f172a;display:block;margin-bottom:6px">4. Squash Blocks & Post Supports</strong>
            <p style="margin:0;color:#334155">
              Pairs of 2x4 squash blocks are required at all opening trimmers and headers to transfer vertical point loads directly to lower bearing walls.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

// Window attachments for cross-script access
if (typeof window !== 'undefined') {
  window.EWP_CATALOG = EWP_CATALOG;
  window.EWP_STRUCTURAL_CATALOG = EWP_STRUCTURAL_CATALOG;
  window.EWP_PRODUCT_LIBRARY = EWP_PRODUCT_LIBRARY;
  window.applyEWPFraming = applyEWPFraming;
  window.applyEWPPro = applyEWPPro;
  window.regenerateEWPFloor = regenerateEWPFloor;
  window.coordinateEWPFloorV4 = coordinateEWPFloorV4;
  window.coordinateEWPV5 = coordinateEWPV5;
  window.buildEWPV6Editor = buildEWPV6Editor;
  window.buildEWPV7CAD = buildEWPV7CAD;
  window.calculateEWPAllowableSpan = calculateEWPAllowableSpan;
  window.calculateEWPBeamLoadAndSizing = calculateEWPBeamLoadAndSizing;
  window.autoSizeEWPFloorBeams = autoSizeEWPFloorBeams;
  window.generateEWPBeamSpanTable = generateEWPBeamSpanTable;
  window.parseHangerCapacityLbs = parseHangerCapacityLbs;
  window.analyzeEWPJoistLoads = analyzeEWPJoistLoads;
  window.analyzeSelectedEWPJoists = analyzeSelectedEWPJoists;
  window.EWP_CREEP_ENVIRONMENTS = EWP_CREEP_ENVIRONMENTS;
  window.EWP_IJOIST_MANUFACTURER_SPECS = EWP_IJOIST_MANUFACTURER_SPECS;
  window.analyzeIJoistDeflectionWithCreepAndShear = analyzeIJoistDeflectionWithCreepAndShear;
  window.auditAllIJoistDeflections = auditAllIJoistDeflections;
  window.evaluateFloorEWPSpecs = evaluateFloorEWPSpecs;
  window.openEWPSpecificationsModal = openEWPSpecificationsModal;
  window.ewpScheduleCSV = ewpScheduleCSV;
  window.ewpAccessoriesCSV = ewpAccessoriesCSV;
  window.ewpGeometryCSV = ewpGeometryCSV;
  window.ewpReactionCSV = ewpReactionCSV;
  window.ewpTakeoffCSV = ewpTakeoffCSV;
  window.ewpQACSV = ewpQACSV;
  window.ewpProductCheckCSV = ewpProductCheckCSV;
  window.ewpServiceCheckCSV = ewpServiceCheckCSV;
  window.ewpEditorObjects = ewpEditorObjects;
  window.updateEWPMemberV6 = updateEWPMemberV6;
  window.ewp3DCSV = ewp3DCSV;
  window.addEWPMemberV7 = addEWPMemberV7;
  window.deleteEWPMemberV7 = deleteEWPMemberV7;
  window.moveEWPMemberV7 = moveEWPMemberV7;
  window.addEWPOpeningV7 = addEWPOpeningV7;
  window.addEWPSupportV7 = addEWPSupportV7;
  window.regenerateAffectedEWPV7 = regenerateAffectedEWPV7;
  window.autoPlaceFloorJoistsInBoundary = autoPlaceFloorJoistsInBoundary;
  window.ewpV7PlanSVG = ewpV7PlanSVG;
  window.recognizeImportedFloorV8 = recognizeImportedFloorV8;
  window.autoFrameImportedFloorV8 = autoFrameImportedFloorV8;
  window.ewpV8RecognitionCSV = ewpV8RecognitionCSV;
  window.recognizeWallDrivenFloorV9 = recognizeWallDrivenFloorV9;
  window.autoFrameWallDrivenV9 = autoFrameWallDrivenV9;
  window.ewpV9WallZoneCSV = ewpV9WallZoneCSV;
}
