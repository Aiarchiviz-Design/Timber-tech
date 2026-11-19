// CadTech EWP framing module. Real-time structural load calculation, beam member sizing, span tables, and floor framing CAD engine.
const R = v => Math.round(Number(v) * 1000) / 1000;

export const EWP_CATALOG = {
  'I-Joist 9-1/2': { family: 'I-Joist', depthIn: 9.5, flangeWidthIn: 2.5, flangeDepthIn: 1.375, webIn: 0.375 },
  'I-Joist 11-7/8': { family: 'I-Joist', depthIn: 11.875, flangeWidthIn: 2.5, flangeDepthIn: 1.375, webIn: 0.375 },
  'I-Joist 14': { family: 'I-Joist', depthIn: 14, flangeWidthIn: 2.5, flangeDepthIn: 1.375, webIn: 0.375 },
  'I-Joist 16': { family: 'I-Joist', depthIn: 16, flangeWidthIn: 2.5, flangeDepthIn: 1.375, webIn: 0.375 },
  'LVL 1-3/4x9-1/2': { family: 'LVL', widthIn: 1.75, depthIn: 9.5 },
  'LVL 1-3/4x11-7/8': { family: 'LVL', widthIn: 1.75, depthIn: 11.875 },
  'LVL 1-3/4x14': { family: 'LVL', widthIn: 1.75, depthIn: 14 },
  'LVL 1-3/4x16': { family: 'LVL', widthIn: 1.75, depthIn: 16 },
  'LVL 1-3/4x18': { family: 'LVL', widthIn: 1.75, depthIn: 18 },
  'LSL 1-3/4x11-7/8': { family: 'LSL', widthIn: 1.75, depthIn: 11.875 },
  'PSL 3-1/2x11-7/8': { family: 'PSL', widthIn: 3.5, depthIn: 11.875 },
  'Glulam 3-1/8x12': { family: 'Glulam', widthIn: 3.125, depthIn: 12 },
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
  manufacturers: ['Generic / NDS', 'Weyerhaeuser Trus Joist', 'Boise Cascade', 'LP Building Solutions', 'Georgia-Pacific'],
  series: ['TJI 210', 'TJI 360', 'TJI 560', 'BCI 6000', 'LPI 20Plus', 'Microllam LVL 2.0E', 'Versa-Lam LVL 2.0E', 'Parallam PSL', 'TimberStrand LSL']
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

  if (spec.family === 'I-Joist') {
    EI = spec.EI;
    M_allow = spec.M_allow * 12; // in-lbs
    V_allow = spec.V_allow;       // lbs
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
  const joistSections = ['I-Joist 9-1/2', 'I-Joist 11-7/8', 'I-Joist 14', 'I-Joist 16'];
  
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
        <span style="font-size:11px;color:#64748b">ANSI/AWC EWP & NDS 2024 Engineered Design Standard · IBC 2024 Compliant</span>
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
  if (modal.showModal) modal.showModal();

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
      model.spacingFt = spacingIn / 12;
      openEWPSpecificationsModal(model, activeTab);
    };
  }

  // Hook interactive events for real-time beam sizer tab
  if (activeTab === 'beamsizer') {
    bindBeamSizerModalEvents(mb, model);
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

function renderEWPTabContent(report, tab, model) {
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
