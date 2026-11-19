import { autoDesignAssembly, designTruss, MAX_PLY } from './autodesign.js?v=20261105-truss-analysis-core-v1';
import { WEB_STYLES, templateMembers, woodCatalog, MEMBER_SIZE_LADDER } from './truss-advanced-engine.js?v=20261105-truss-optimizer-v1';
import { analyzeTruss, SPF_NO2 } from './src/services/trussAdvancedAnalysis.ts';
import { auditTrussConnectivity } from './truss-connectivity.js';

// Dimensional lumber catalog (38.1 mm board width; nominal 2x4 to 2x12), taken from the project's woodCatalog.
const SECTION_LADDER = woodCatalog.map(s => ({ name: s.name, depth: s.d, width: s.b }));
const BOARD_WIDTH_MM = 38.1;
// The project's canonical size/ply options (MEMBER_SIZE_LADDER), ordered by material: cross-section area, then depth, then
// plies. Members only ever move along this list, so each step is the smallest-material option that is still larger.
// (The canonical order is not monotonic in area, e.g. 2x8/3 is larger than 2x10/1, so it cannot be used for steps.)
export const SIZE_PLY_LADDER = MEMBER_SIZE_LADDER.map(e => ({
  name: SECTION_LADDER[e.size].name, depth: SECTION_LADDER[e.size].depth, width: BOARD_WIDTH_MM, ply: e.ply, key: `${SECTION_LADDER[e.size].name}/${e.ply}`,
})).sort((a, b) => (a.width * a.depth * a.ply) - (b.width * b.depth * b.ply) || a.depth - b.depth || a.ply - b.ply);
const plyCountFromWidth = widthMm => Math.max(1, Math.round(finite(widthMm, BOARD_WIDTH_MM) / BOARD_WIDTH_MM));

const finite = (n, fallback = 0) => Number.isFinite(Number(n)) ? Number(n) : fallback;
const pointKey = (x, y) => `${finite(x).toFixed(4)}|${finite(y).toFixed(4)}`;

function nearestSection(widthMm, depthMm) {
  const d = Math.max(1, finite(depthMm, 88.9));
  return SECTION_LADDER.reduce((best, candidate) =>
    Math.abs(candidate.depth - d) < Math.abs(best.depth - d) ? candidate : best, SECTION_LADDER[0]);
}

function classifyTruss(raw) {
  const code = `${raw.code || ''} ${raw.tag || ''} ${raw.assemblyId || ''}`.toUpperCase();
  if (/GIRDER|\bHG\b|\bJG\b/.test(code)) return 'GIRDER';
  if (/\bHC\b|\bHT\b|HIP|CARRIER/.test(code)) return 'HIP';
  if (/STEP|\bSD\b/.test(code)) return 'STEPDOWN';
  if (/JACK|\bJK\b|\bSJ\b/.test(code)) return 'JACK';
  return 'COMMON';
}

function normalizeBimTrussSegments(raw) {
  const rawTop = (raw.top || []).map(s => ({ ...s, role: 'top' }));
  const rawBottom = (raw.bottom || []).map(s => ({ ...s, role: 'bottom' }));
  const rawWebs = (raw.webs || []).map(s => ({ ...s, role: 'web' }));
  const initialGroups = [...rawTop, ...rawBottom, ...rawWebs].filter(s => Math.hypot(finite(s.x2) - finite(s.x1), finite(s.y2) - finite(s.y1)) > 0.001);
  if (!rawTop.length || !rawBottom.length) return initialGroups;

  const testSegs = initialGroups.map((s, idx) => ({
    id: `M${idx + 1}`,
    role: s.role,
    a: [finite(s.x1), 0, finite(s.y1)],
    b: [finite(s.x2), 0, finite(s.y2)],
  }));
  const initialAudit = auditTrussConnectivity(testSegs);
  const bXs = rawBottom.flatMap(s => [finite(s.x1), finite(s.x2)]);
  const bMinX = Math.min(...bXs), bMaxX = Math.max(...bXs);
  if (initialAudit.passed) {
    // Also verify no interior chord node within (bMinX, bMaxX) is an unbraced 2-bar collinear/knee mechanism
    const degMap = new Map();
    for (const m of testSegs) {
      for (const p of [m.a, m.b]) {
        const k = pointKey(p[0], p[2]);
        degMap.set(k, (degMap.get(k) || 0) + 1);
      }
    }
    const hasUnbracedInterior = testSegs.some(m => [m.a, m.b].some(p => {
      const x = p[0];
      return x > bMinX + 0.005 && x < bMaxX - 0.005 && (degMap.get(pointKey(p[0], p[2])) || 0) < 3;
    }));
    const hasInteriorBottomNode = testSegs
      .filter(m => m.role === 'bottom')
      .flatMap(m => [m.a[0], m.b[0]])
      .some(x => x > bMinX + 0.005 && x < bMaxX - 0.005);
    if (!hasUnbracedInterior && hasInteriorBottomNode) return initialGroups;
  }

  // Planar station-based split & triangulation for 3D BIM merged-chord assemblies
  const topSegs = rawTop.map(s => {
    const x1 = finite(s.x1), y1 = finite(s.y1), x2 = finite(s.x2), y2 = finite(s.y2);
    return x1 <= x2 ? { ...s, x1, y1, x2, y2 } : { ...s, x1: x2, y1: y2, x2: x1, y2: y1 };
  }).sort((a, b) => a.x1 - b.x1);
  const botSegs = rawBottom.map(s => {
    const x1 = finite(s.x1), y1 = finite(s.y1), x2 = finite(s.x2), y2 = finite(s.y2);
    return x1 <= x2 ? { ...s, x1, y1, x2, y2 } : { ...s, x1: x2, y1: y2, x2: x1, y2: y1 };
  }).sort((a, b) => a.x1 - b.x1);

  const evalProfile = (segs, x, fallbackY = 0) => {
    for (const s of segs) {
      if (x >= s.x1 - 1e-4 && x <= s.x2 + 1e-4) {
        const dx = s.x2 - s.x1;
        if (Math.abs(dx) < 1e-6) return Math.max(s.y1, s.y2);
        const t = Math.max(0, Math.min(1, (x - s.x1) / dx));
        return Number((s.y1 + t * (s.y2 - s.y1)).toFixed(4));
      }
    }
    const nearest = segs.reduce((best, s) => {
      const d = Math.min(Math.abs(x - s.x1), Math.abs(x - s.x2));
      const bd = Math.min(Math.abs(x - best.x1), Math.abs(x - best.x2));
      return d < bd ? s : best;
    }, segs[0]);
    if (!nearest) return fallbackY;
    const dx = nearest.x2 - nearest.x1;
    if (Math.abs(dx) < 1e-6) return nearest.y1;
    const t = (x - nearest.x1) / dx;
    return Number((nearest.y1 + t * (nearest.y2 - nearest.y1)).toFixed(4));
  };

  const baseY = Math.min(...botSegs.flatMap(s => [s.y1, s.y2]));
  const rawStationXs = [
    bMinX,
    bMaxX,
    (bMinX + bMaxX) / 2,
    ...topSegs.flatMap(s => [s.x1, s.x2]),
    ...botSegs.flatMap(s => [s.x1, s.x2]),
    ...rawWebs.flatMap(s => [finite(s.x1), finite(s.x2)]),
  ].filter(x => x >= bMinX - 0.002 && x <= bMaxX + 0.002)
   .map(x => Math.max(bMinX, Math.min(bMaxX, Number(x.toFixed(4)))))
   .sort((a, b) => a - b);

  const span = bMaxX - bMinX;
  const minStep = Math.min(0.04, Math.max(0.015, span * 0.04));
  const stations = [];
  for (const x of rawStationXs) {
    if (!stations.length) {
      stations.push(x);
    } else if (Math.abs(x - bMaxX) < 1e-4) {
      if (bMaxX - stations[stations.length - 1] < minStep && stations.length > 1) {
        stations[stations.length - 1] = bMaxX;
      } else {
        stations.push(bMaxX);
      }
    } else if (x - stations[stations.length - 1] >= minStep) {
      stations.push(x);
    }
  }
  if (stations.length < 3 && span > 0.25) {
    stations.splice(1, 0, Number(((bMinX + bMaxX) / 2).toFixed(4)));
  }

  const B = stations.map(x => [x, evalProfile(botSegs, x, baseY)]);
  const T = stations.map((x, i) => {
    const yt = evalProfile(topSegs, x, B[i][1]);
    // If top chord meets bottom chord at the heel within 8 mm, snap to the exact same heel joint
    if (Math.abs(yt - B[i][1]) < 0.008) return B[i];
    return [x, Math.max(yt, B[i][1] + 0.05)];
  });

  const protoTop = rawTop[0] || { width: BOARD_WIDTH_MM, depth: 88.9 };
  const protoBot = rawBottom[0] || protoTop;
  const protoWeb = rawWebs[0] || { width: BOARD_WIDTH_MM, depth: 88.9 };
  const mkSeg = (p1, p2, role, proto) => ({
    x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1],
    role,
    width: proto.width ?? BOARD_WIDTH_MM,
    depth: proto.depth ?? 88.9,
    ...(proto.plies ? { plies: proto.plies } : {}),
  });

  const outTop = [];
  const allTopXs = topSegs.flatMap(s => [s.x1, s.x2]);
  const minTopX = Math.min(...allTopXs), maxTopX = Math.max(...allTopXs);
  if (minTopX < bMinX - 0.01) {
    outTop.push(mkSeg([minTopX, evalProfile(topSegs, minTopX, B[0][1])], T[0], 'top', protoTop));
  }
  for (let i = 0; i < stations.length - 1; i++) {
    outTop.push(mkSeg(T[i], T[i + 1], 'top', protoTop));
  }
  if (maxTopX > bMaxX + 0.01) {
    const lastIdx = stations.length - 1;
    outTop.push(mkSeg(T[lastIdx], [maxTopX, evalProfile(topSegs, maxTopX, B[lastIdx][1])], 'top', protoTop));
  }

  const outBot = [];
  for (let i = 0; i < stations.length - 1; i++) {
    outBot.push(mkSeg(B[i], B[i + 1], 'bottom', protoBot));
  }

  const outWebs = [];
  const webKeys = new Set();
  const addWeb = (p1, p2) => {
    if (Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) < 0.005) return;
    const k1 = `${pointKey(p1[0], p1[1])}->${pointKey(p2[0], p2[1])}`;
    const k2 = `${pointKey(p2[0], p2[1])}->${pointKey(p1[0], p1[1])}`;
    if (webKeys.has(k1) || webKeys.has(k2)) return;
    webKeys.add(k1);
    outWebs.push(mkSeg(p1, p2, 'web', protoWeb));
  };

  // Vertical posts at every station where top and bottom chords are distinct
  for (let i = 0; i < stations.length; i++) {
    if (T[i] !== B[i]) addWeb(B[i], T[i]);
  }
  // Single diagonal per 4-node panel bay (orienting towards apex: midspan for gable, high end for mono)
  let apexX = (bMinX + bMaxX) / 2;
  let maxTopY = -Infinity;
  for (let i = 0; i < stations.length; i++) {
    if (T[i][1] > maxTopY) {
      maxTopY = T[i][1];
      apexX = stations[i];
    }
  }
  for (let i = 0; i < stations.length - 1; i++) {
    if (T[i] !== B[i] && T[i + 1] !== B[i + 1]) {
      const bayMid = (stations[i] + stations[i + 1]) / 2;
      if (bayMid <= apexX) addWeb(B[i], T[i + 1]);
      else addWeb(T[i], B[i + 1]);
    }
  }

  return [...outTop, ...outBot, ...outWebs];
}

/** Convert the current BIM roof framing bridge geometry (metres + section mm) into the V9 auto-design assembly. */
export function trussGeometryToAssembly(geometry) {
  const source = Array.isArray(geometry?.trusses) ? geometry.trusses : [];
  const trusses = [];
  const usedIds = new Set();

  for (const raw of source) {
    const groups = normalizeBimTrussSegments(raw);
    const nodes = new Map();
    const coord = (x, y) => {
      const key = pointKey(x, y);
      if (!nodes.has(key)) nodes.set(key, { key, x: finite(x), y: finite(y), id: nodes.size + 1 });
      return nodes.get(key);
    };
    const members = [];
    for (const seg of groups) {
      const a = coord(seg.x1, seg.y1), b = coord(seg.x2, seg.y2);
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      if (!(length > 0.001)) continue;
      const rawWidthMm = Math.max(1, finite(seg.width, BOARD_WIDTH_MM));
      const depthMm = Math.max(1, finite(seg.depth, 88.9));
      const sec = nearestSection(rawWidthMm, depthMm);
      // Snap to the lumber catalog: one 38.1 mm board per ply, plies from the input width when it spans several boards.
      const widthMm = BOARD_WIDTH_MM;
      const plies = Number.isFinite(Number(seg.plies)) && Number(seg.plies) >= 1 ? Math.max(1, Math.round(Number(seg.plies))) : plyCountFromWidth(rawWidthMm);
      members.push({
        id: `${raw.tag || raw.assemblyId || 'TRUSS'}:M${members.length + 1}`,
        role: seg.role,
        a: [a.x, 0, a.y],
        b: [b.x, 0, b.y],
        aId: a.id,
        bId: b.id,
        length,
        widthMm,
        depthMm: sec.depth,
        section: [widthMm / 1000, sec.depth / 1000],
        sectionName: sec.name,
        ndsPlies: plies,
        material: 'timber',
        thickness: widthMm / 1000,
      });
    }
    const bottom = members.filter(m => m.role === 'bottom');
    const bottomNodes = [...new Map(bottom.flatMap(m => [m.a, m.b]).map(p => [pointKey(p[0], p[2]), p])).values()];
    if (members.length < 3 || bottomNodes.length < 2) continue;

    const allPoints = members.flatMap(m => [m.a, m.b]);
    const minX = Math.min(...bottomNodes.map(p => p[0]));
    const maxX = Math.max(...bottomNodes.map(p => p[0]));
    const base = Math.min(...bottomNodes.map(p => p[2]));
    const maxZ = Math.max(...allPoints.map(p => p[2]));
    const minTopZAtEnds = Math.min(
      ...allPoints.filter(p => Math.abs(p[0] - minX) < 0.005 || Math.abs(p[0] - maxX) < 0.005).map(p => p[2]),
    );
    const span = maxX - minX;
    if (!(span > 0.25) || !(maxZ > base)) continue;

    const tag = String(raw.tag || raw.code || raw.assemblyId || `T${trusses.length + 1}`);
    let id = tag;
    let suffix = 2;
    while (usedIds.has(id)) id = `${tag}-${suffix++}`;
    usedIds.add(id);

    const midX = (minX + maxX) / 2;
    const peak = allPoints.filter(p => Math.abs(p[2] - maxZ) < 0.01).sort((a, b) => Math.abs(a[0] - midX) - Math.abs(b[0] - midX))[0];
    const eaveZ = Number.isFinite(minTopZAtEnds) ? minTopZAtEnds : base;
    const leftTopPts = allPoints.filter(p => Math.abs(p[0] - minX) < 0.015).map(p => p[2]);
    const rightTopPts = allPoints.filter(p => Math.abs(p[0] - maxX) < 0.015).map(p => p[2]);
    const leftTopZ = leftTopPts.length ? Math.max(...leftTopPts) : eaveZ;
    const rightTopZ = rightTopPts.length ? Math.max(...rightTopPts) : eaveZ;
    const isMonoProfile = raw.roofType === 'mono' || Math.abs(leftTopZ - rightTopZ) > (maxZ - base) * 0.35;
    const topProfile = isMonoProfile
      ? [
          [minX, 0, leftTopZ],
          [maxX, 0, rightTopZ],
        ]
      : [
          [minX, 0, eaveZ],
          [peak?.[0] ?? midX, 0, peak?.[2] ?? maxZ],
          [maxX, 0, eaveZ],
        ];

    const role = classifyTruss(raw);
    const minPly = (role === 'GIRDER') ? 2 : 1;
    trusses.push({
      id,
      tag: id,
      type: role,
      role,
      roofType: raw.roofType || (isMonoProfile ? 'mono' : 'gable'),
      span,
      height: maxZ - base,
      base,
      pitch: finite(raw.pitch),
      spacing: Math.max(0.1, finite(raw.spacing, 0.6)),
      overhang: Math.max(0, finite(raw.overhangLeft)),
      overhangRight: Math.max(0, finite(raw.overhangRight)),
      full: true,
      profile: topProfile,
      members,
      edited: true, // keep the geometry generated/edited in the BIM model; optimizer sizes it but does not replace topology.
      webStyle: 'Existing geometry',
      assemblyId: raw.assemblyId,
      roofId: raw.roofId,
      ply: Math.max(minPly, finite(raw.ply, 1)),
      minPly,
      nodes: [...nodes.values()],
    });
  }

  const byAssemblyId = new Map(trusses.map(t => [t.assemblyId, t.id]));
  const byTag = new Map(trusses.map(t => [t.tag, t.id]));
  for (const raw of source) {
    const truss = trusses.find(t => t.assemblyId === raw.assemblyId || t.tag === String(raw.tag || raw.code || ''));
    if (!truss) continue;
    truss.connections = (raw.connections || []).map(link => ({
      to: byAssemblyId.get(link.targetAssemblyId) || byTag.get(link.targetTag) || link.to,
      point: [finite(link.localX), 0],
      relation: link.relation || 'geometry-derived connection candidate',
      snapDistanceMm: finite(link.snapDistanceMm),
      worldPoint: link.worldPoint,
    })).filter(link => link.to && trusses.some(t => t.id === link.to));
  }

  return { base: 0, trusses, source: 'CadTech BIM roof framing geometry' };
}

/** Build independent NDS ASD pin-jointed service input from the sized truss geometry. */
export function buildNdsInput(truss, settings = {}) {
  const nodesByKey = new Map();
  const getNode = p => {
    const x = finite(p?.[0]), y = finite(p?.[2]);
    const key = pointKey(x, y);
    if (!nodesByKey.has(key)) nodesByKey.set(key, { id: nodesByKey.size + 1, x: x * 1000, y: y * 1000 });
    return nodesByKey.get(key);
  };

  const isGirder = classifyTruss(truss) === 'GIRDER' || truss?.role === 'GIRDER' || truss?.type === 'GIRDER';
  const minPly = isGirder ? 2 : 1;
  const members = [];
  for (const member of truss.members || []) {
    const a = getNode(member.a), b = getNode(member.b);
    const lengthMm = Math.hypot(b.x - a.x, b.y - a.y);
    // The BIM / auto-size section tuple is stored in metres; the NDS solver expects mm.
    // Convert the post-optimization section first so the independent check uses the selected size.
    const singleWidthMm = finite(member.section?.[0], finite(member.widthMm) / 1000) * 1000;
    const depthMm = finite(member.section?.[1], finite(member.depthMm) / 1000) * 1000;
    const plies = Math.max(minPly, Math.round(finite(member.ndsPlies, finite(member.plies, finite(truss.analysis?.ply, finite(truss.ply, 1))))));
    const widthMm = singleWidthMm * plies; // parallel plies act as the combined member width in this screening model
    if (!(widthMm > 0 && depthMm > 0)) continue;
    const kind = member.role === 'top' || member.role === 'overhang' ? 'top' : member.role === 'bottom' ? 'bottom' : 'web';
    const chordLat = finite(settings.chordLatMm, 600);
    const unbracedLat = member.role === 'web'
      ? (Number(settings.webLatMm) > 0 ? Number(settings.webLatMm) : lengthMm)
      : chordLat;
    const latOutMm = Math.min(lengthMm, unbracedLat);
    members.push({
      id: member.id,
      a: a.id,
      b: b.id,
      kind,
      widthMm,
      depthMm,
      latOutMm,
    });
  }

  const nodes = [...nodesByKey.values()];
  const bottomNodes = nodes.filter(n => Math.abs(n.y - Math.min(...nodes.map(p => p.y))) < 0.2).sort((a, b) => a.x - b.x);
  const bottomChordNodeIds = new Set((truss.members || []).filter(m => m.role === 'bottom').flatMap(m => [getNode(m.a).id, getNode(m.b).id]));
  const supportCandidates = nodes.filter(n => bottomChordNodeIds.has(n.id)).sort((a, b) => a.x - b.x);
  const left = supportCandidates[0] || bottomNodes[0];
  const right = supportCandidates.at(-1) || bottomNodes.at(-1);
  if (!left || !right || left.id === right.id) throw new Error(`${truss.id}: could not identify two distinct bottom-chord bearing nodes.`);
  const spanMm = Math.max(1, right.x - left.x);

  return {
    nodes,
    members,
    spanMm,
    spacingMm: Math.max(100, finite(settings.spacingMm, finite(truss.spacing, 0.6) * 1000)),
    leftHeelId: left.id,
    rightHeelId: right.id,
    deadRoofPsf: finite(settings.dead, 10),
    deadCeilingPsf: finite(settings.bottomDead, 5),
    snowPsf: finite(settings.snow, 0),
    liveRoofPsf: finite(settings.roofLive, 20),
    chordLatMm: finite(settings.chordLatMm, 600),
    props: SPF_NO2,
  };
}

const NDS_SECTION_LADDER = SECTION_LADDER;
const roleOfMember = member => member.role === 'overhang' ? 'top' : member.role;
const isChordMember = member => ['top', 'bottom', 'overhang'].includes(member.role);
const memberDepth = member => finite(member.section?.[1], finite(member.depthMm, 88.9) / 1000) * 1000;
const memberWidth = member => finite(member.section?.[0], finite(member.widthMm, 38.1) / 1000) * 1000;
const memberPlies = (truss, member) => Math.max(1, Math.round(finite(member.ndsPlies, finite(member.plies, finite(truss.analysis?.ply, finite(truss.ply, 1))))));

function snapshotTrussMembers(truss) {
  return (truss.members || []).map(member => ({
    id: member.id,
    role: roleOfMember(member),
    sectionName: member.sectionName || '2x4',
    widthMm: Number(memberWidth(member).toFixed(2)),
    depthMm: Number(memberDepth(member).toFixed(2)),
    plies: memberPlies(truss, member),
    totalWidthMm: Number((memberWidth(member) * memberPlies(truss, member)).toFixed(2)),
  }));
}

function diffMemberSnapshots(before = [], after = [], phase, reason, beforeReport = null, afterReport = null) {
  const beforeMap = new Map(before.map(member => [member.id, member]));
  const afterMap = new Map(after.map(member => [member.id, member]));
  const ratioMap = report => new Map((report?.members || []).map(member => [member.id, member.governing?.ratio]));
  const beforeRatios = ratioMap(beforeReport), afterRatios = ratioMap(afterReport);
  const changes = [];
  for (const id of new Set([...beforeMap.keys(), ...afterMap.keys()])) {
    const a = beforeMap.get(id), b = afterMap.get(id);
    if (!a || !b) {
      changes.push({
        phase, changeType: a ? 'member-removed' : 'member-added', memberId: id,
        role: (a || b)?.role || 'member', before: a || null, after: b || null,
        beforeRatio: beforeRatios.get(id) ?? null, afterRatio: afterRatios.get(id) ?? null,
        reason: a ? 'Member was removed by an accepted alternate web topology.' : 'Member was added by an accepted alternate web topology.',
      });
      continue;
    }
    const changed = a.sectionName !== b.sectionName
      || Math.abs(a.widthMm - b.widthMm) > 0.05
      || Math.abs(a.depthMm - b.depthMm) > 0.05
      || a.plies !== b.plies;
    if (!changed) continue;
    changes.push({
      phase, changeType: 'member-size-or-ply', memberId: id, role: b.role,
      before: a, after: b,
      beforeRatio: beforeRatios.get(id) ?? null, afterRatio: afterRatios.get(id) ?? null,
      reason,
    });
  }
  return changes;
}

function ratioSummary(report) {
  const ratios = (report?.members || []).map(member => Number(member.governing?.ratio)).filter(Number.isFinite);
  return {
    result: report?.overall || 'NOT RUN',
    failedMembers: (report?.members || []).filter(member => member.status !== 'PASS').length,
    memberCount: (report?.members || []).length,
    maxRatio: ratios.length ? Math.max(...ratios) : null,
    liveDeflectionMm: Number.isFinite(Number(report?.deflection?.liveMm)) ? Number(report.deflection.liveMm) : null,
    liveDeflectionLimitMm: Number.isFinite(Number(report?.deflection?.liveLimitMm)) ? Number(report.deflection.liveLimitMm) : null,
    totalDeflectionMm: Number.isFinite(Number(report?.deflection?.totalMm)) ? Number(report.deflection.totalMm) : null,
    totalDeflectionLimitMm: Number.isFinite(Number(report?.deflection?.totalLimitMm)) ? Number(report.deflection.totalLimitMm) : null,
    unstable: !!report?.unstable,
  };
}

function setMemberSection(member, section) {
  member.widthMm = section.width;
  member.depthMm = section.depth;
  member.section = [section.width / 1000, section.depth / 1000];
  member.sectionName = section.name;
  member.material = 'timber';
  member.thickness = section.width / 1000;
}

function runNdsForTruss(truss, settings = {}) {
  const report = analyzeTruss(buildNdsInput(truss, {
    ...settings,
    spacingMm: truss.spacing * 1000,
  }));
  // Joint topology: a truss whose members do not meet at real joints is not the structure the solver is checking.
  const connectivity = auditTrussConnectivity(truss.members || []);
  report.connectivity = connectivity;
  if (!connectivity.passed) {
    report.overall = 'FAIL';
    report.warnings = [...(report.warnings || []), ...connectivity.errors.map(e => `Joint topology: ${e}`)];
  }
  // Display individual board size and ply count while the solver receives the combined width.
  for (const check of report.members || []) {
    const member = (truss.members || []).find(item => item.id === check.id);
    if (!member) continue;
    const depth = memberDepth(member);
    const width = memberWidth(member);
    const plies = memberPlies(truss, member);
    check.singlePlySize = `${Number(width.toFixed(1))}x${Number(depth.toFixed(1))}`;
    check.plies = plies;
    check.sizeLabel = `${check.singlePlySize}${plies > 1 ? ` · ${plies} ply` : ''}`;
  }
  return report;
}

function ndsScore(report) {
  if (!report || report.error) return 1e9;
  const members = report.members || [];
  const failed = members.filter(member => member.status !== 'PASS').length;
  const ratios = members.map(member => Number(member.governing?.ratio)).filter(Number.isFinite);
  const maxRatio = ratios.length ? Math.max(...ratios) : 1e6;
  const deflectionFails = Number(!report.deflection?.liveOk) + Number(!report.deflection?.totalOk);
  const jointErrors = report.connectivity?.errors?.length || 0;
  return (report.unstable ? 1e6 : 0) + jointErrors * 1e5 + failed * 100 + deflectionFails * 50 + maxRatio;
}

/** Index of the member's current entry on the size/ply ladder (nearest entry if the member is off-ladder). */
function ladderIndexOf(truss, member) {
  const plies = memberPlies(truss, member);
  const exact = SIZE_PLY_LADDER.findIndex(e => e.name === member.sectionName && e.ply === plies);
  if (exact >= 0) return exact;
  const depth = memberDepth(member);
  let best = 0;
  SIZE_PLY_LADDER.forEach((e, i) => {
    const score = Math.abs(e.depth - depth) + Math.abs(e.ply - plies) * 50;
    if (score < Math.abs(SIZE_PLY_LADDER[best].depth - depth) + Math.abs(SIZE_PLY_LADDER[best].ply - plies) * 50) best = i;
  });
  return best;
}

/** Next ladder entry above the member's current size/ply, honouring the plies limit. Null at the top of the ladder. */
function nextLadderOption(truss, member, maxPly) {
  const start = ladderIndexOf(truss, member);
  for (let i = start + 1; i < SIZE_PLY_LADDER.length; i++) if (SIZE_PLY_LADDER[i].ply <= maxPly) return SIZE_PLY_LADDER[i];
  return null;
}

/**
 * Ratio-guided step. The governing demand/capacity ratio says roughly how much area and section modulus the member needs.
 * The next ladder entry is the smallest one (in ladder order) whose area and section modulus both cover that demand, so
 * a member does not need one round per ladder step. Slenderness-only failures move one step. Capped at the top entry.
 */
function ladderStepForRatio(truss, member, maxPly, ratio, slendernessOnly) {
  const start = ladderIndexOf(truss, member);
  const options = SIZE_PLY_LADDER.slice(start + 1).filter(e => e.ply <= maxPly);
  if (!options.length) return null;
  if (slendernessOnly || !(ratio > 1)) return options[0];
  const cur = SIZE_PLY_LADDER[start];
  const need = ratio * 1.02;
  const area = e => e.width * e.depth * e.ply;
  const modulus = e => e.width * e.ply * e.depth * e.depth; // b*d^2 scaled by plies (bending)
  const hit = options.find(e => area(e) / area(cur) >= need && modulus(e) / modulus(cur) >= need);
  return hit || options[options.length - 1];
}

/** Previous ladder entry below the member's current size/ply (used by the right-size pass). Null at the bottom. */
function previousLadderOption(truss, member) {
  const isGirder = classifyTruss(truss) === 'GIRDER' || truss?.role === 'GIRDER' || truss?.type === 'GIRDER';
  const minPly = isGirder ? 2 : 1;
  const i = ladderIndexOf(truss, member);
  for (let idx = i - 1; idx >= 0; idx--) {
    if (SIZE_PLY_LADDER[idx].ply >= minPly) return SIZE_PLY_LADDER[idx];
  }
  return null;
}

/** Apply a ladder entry to a member: standard board width, nominal depth, and explicit ply count. */
function setMemberLadderOption(member, option) {
  member.widthMm = option.width;
  member.depthMm = option.depth;
  member.section = [option.width / 1000, option.depth / 1000];
  member.sectionName = option.name;
  member.ndsPlies = option.ply;
  member.material = 'timber';
  member.thickness = option.width / 1000;
}

/** Synchronize all top, bottom and overhang chord members to the same uniform stud size and ply count. */
function syncChordStudSize(truss, maxPly = MAX_PLY) {
  const chords = (truss.members || []).filter(isChordMember);
  if (!chords.length) return;
  let maxIdx = 0;
  for (const m of chords) {
    const idx = ladderIndexOf(truss, m);
    if (idx > maxIdx && SIZE_PLY_LADDER[idx].ply <= maxPly) maxIdx = idx;
  }
  const chosen = SIZE_PLY_LADDER[maxIdx] || SIZE_PLY_LADDER[0];
  for (const m of chords) setMemberLadderOption(m, chosen);
}

/** Every member starts the NDS stage at the smallest ladder entry (2x4, 1 ply). Sizes only increase when a check fails. */
function resetMembersToLadderMinimum(truss) {
  const smallest = SIZE_PLY_LADDER[0];
  for (const member of truss.members || []) setMemberLadderOption(member, smallest);
}

function ensureMemberIds(truss) {
  (truss.members || []).forEach((member, index) => {
    if (!member.id) member.id = `${truss.id}:M${index + 1}`;
  });
}

function selectFailedMembers(truss, report) {
  const failedIds = new Set((report.members || []).filter(member => member.status !== 'PASS').map(member => member.id));
  let targets = (truss.members || []).filter(member => failedIds.has(member.id));
  if (!targets.length && (report.deflection?.liveOk === false || report.deflection?.totalOk === false)) {
    targets = (truss.members || []).filter(isChordMember);
  }
  if (!targets.length && report.unstable) targets = (truss.members || []).filter(member => member.role === 'web');
  return targets;
}

function optimizeNdsMemberSizes(truss, settings, maxRounds = 12) {
  const actions = [];
  let rounds = 0;
  syncChordStudSize(truss);
  let report = runNdsForTruss(truss, settings);
  const maxPly = Math.max(1, Math.min(MAX_PLY, finite(settings.maxPly, 5)));

  for (; rounds < maxRounds && report.overall !== 'PASS'; rounds++) {
    const targets = selectFailedMembers(truss, report);
    const checkById = new Map((report.members || []).map(c => [c.id, c]));
    let changed = false;

    const failedChords = targets.filter(isChordMember);
    const deflFailed = report.deflection?.liveOk === false || report.deflection?.totalOk === false;
    if (failedChords.length > 0 || deflFailed) {
      const allChords = (truss.members || []).filter(isChordMember);
      const deflRatio = deflFailed
        ? Math.max(
            finite(report.deflection?.liveMm, 0) / Math.max(0.1, finite(report.deflection?.liveLimitMm, 1)),
            finite(report.deflection?.totalMm, 0) / Math.max(0.1, finite(report.deflection?.totalLimitMm, 1)),
          )
        : 1;
      let targetChordIdx = -1;
      for (const m of (failedChords.length ? failedChords : allChords)) {
        const check = checkById.get(m.id);
        const ratio = Math.max(Number(check?.governing?.ratio) || 1, deflRatio);
        const next = ladderStepForRatio(truss, m, maxPly, ratio, check?.slendernessOk === false && !(ratio > 1));
        if (next) {
          const idx = SIZE_PLY_LADDER.indexOf(next);
          if (idx > targetChordIdx) targetChordIdx = idx;
        }
      }
      if (targetChordIdx >= 0) {
        const next = SIZE_PLY_LADDER[targetChordIdx];
        for (const member of allChords) {
          const beforeIndex = ladderIndexOf(truss, member);
          if (beforeIndex === targetChordIdx) continue;
          const beforeSize = `${member.sectionName || '2x4'} / ${memberPlies(truss, member)} ply`;
          const sameDepth = SIZE_PLY_LADDER[beforeIndex].depth === next.depth;
          setMemberLadderOption(member, next);
          const afterSize = `${next.name} / ${next.ply} ply`;
          actions.push(sameDepth
            ? `${member.id}: added ply ${beforeSize} → ${afterSize} (coupled top/bottom chord)`
            : `${member.id}: member section ${beforeSize} → ${afterSize} (coupled top/bottom chord)`);
          changed = true;
        }
      }
    }

    const failedWebs = targets.filter(m => !isChordMember(m));
    for (const member of failedWebs) {
      const check = checkById.get(member.id);
      const ratio = Number(check?.governing?.ratio);
      const next = ladderStepForRatio(truss, member, maxPly, Number.isFinite(ratio) ? ratio : 1, check?.slendernessOk === false && !(ratio > 1));
      if (!next) continue; // already at the top of the ladder for this plies limit
      const beforeSize = `${member.sectionName || '2x4'} / ${memberPlies(truss, member)} ply`;
      const beforeIndex = ladderIndexOf(truss, member);
      const sameDepth = SIZE_PLY_LADDER[beforeIndex].depth === next.depth;
      setMemberLadderOption(member, next);
      const afterSize = `${next.name} / ${next.ply} ply`;
      actions.push(sameDepth
        ? `${member.id}: added ply ${beforeSize} → ${afterSize}`
        : `${member.id}: member section ${beforeSize} → ${afterSize}`);
      changed = true;
    }
    if (!changed) break;
    report = runNdsForTruss(truss, settings);
  }

  syncChordStudSize(truss, maxPly);
  return { report, actions, rounds };
}

function canAutoChangeWebStyle(truss) {
  // Do not auto-morph specialised load-transfer assemblies or geometries without a simple two-slope profile.
  // Trusses with overhang tails are not re-topologised: the candidate generator has no overhang, so it would drop the tail.
  if (finite(truss.overhang) > 0 || finite(truss.overhangRight) > 0) return false;
  if (auditTrussConnectivity(truss.members || []).cantilevers.length > 0) return false;
  return truss.type === 'COMMON'
    && Array.isArray(truss.profile) && truss.profile.length === 3
    && !(truss.engineering?.transfersIn?.length || truss.engineering?.transfersOut?.length);
}

/** Chord joint positions (top, bottom and overhang chords), used to confirm a candidate changes only the webs. */
function chordJointKeys(truss) {
  return new Set((truss.members || [])
    .filter(m => ['top', 'bottom', 'overhang'].includes(roleOfMember(m)))
    .flatMap(m => [m.a, m.b])
    .map(p => pointKey(p[0], p[2])));
}
function sameChordJoints(a, b) {
  const ka = chordJointKeys(a), kb = chordJointKeys(b);
  return ka.size === kb.size && [...ka].every(k => kb.has(k));
}

function tryBetterWebStyle(truss, p, settings, currentReport, maxPly) {
  if (!canAutoChangeWebStyle(truss)) return null;
  const currentScore = ndsScore(currentReport);
  let best = null;

  // Prioritize 'Pratt' web style as default first, then try remaining styles
  const orderedStyles = ['Pratt', ...WEB_STYLES.filter(s => String(s).toLowerCase() !== 'pratt')];

  for (const style of orderedStyles) {
    if (String(style).toLowerCase() === String(truss.webStyle || '').toLowerCase()) continue;
    try {
      const candidate = designTruss(
        { ...truss, edited: false, webStyle: style },
        p,
        { style, panel: 1.2, shape: style, overhang: 0 },
        { loads: [], minPly: 1, maxPly, styles: [style] },
      );
      ensureMemberIds(candidate);
      // Only web changes are accepted. The BIM regeneration can carry a changed web layout, but not new chord joints,
      // so a candidate that moves chord joints would be analysed in one form and drawn in another.
      if (!sameChordJoints(truss, candidate)) continue;
      resetMembersToLadderMinimum(candidate);
      const candidateReport = runNdsForTruss(candidate, settings);
      const score = ndsScore(candidateReport);

      // If Pratt style passes NDS ASD, accept Pratt immediately as default
      if (candidateReport.overall === 'PASS' && String(style).toLowerCase() === 'pratt') {
        return { candidate, report: candidateReport, score, style };
      }

      if (score + 0.001 < currentScore && (!best || score < best.score)) {
        best = { candidate, report: candidateReport, score, style };
      }
    } catch (error) {
      // A topology candidate can be singular for a particular roof geometry; it is simply rejected.
    }
  }
  return best;
}

/**
 * Right-size pass. After a PASS, try stepping down all chords together in lockstep (maintaining identical top & bottom
 * chord stud size), then try each web member one ladder step smaller. A step is kept only if the full independent NDS
 * check still returns PASS.
 */
function rightSizeMembers(truss, settings, maxPly, budget = 160) {
  const actions = [];
  let runs = 0;
  syncChordStudSize(truss, maxPly);
  let report = runNdsForTruss(truss, settings);
  if (report.overall !== 'PASS') return { report, actions, runs };
  const area = m => memberWidth(m) * memberDepth(m) * memberPlies(truss, m);
  const chords = (truss.members || []).filter(isChordMember);
  const webs = [...(truss.members || []).filter(m => !isChordMember(m))].sort((a, b) => area(b) - area(a));

  // Reducing one member changes the forces in the others, so repeat the pass until no member can step down (max 3 passes).
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;

    // 1. Step down all top & bottom chords together in lockstep so top and bottom chords keep the same stud size.
    if (chords.length > 0) {
      for (let step = 0; step < 8 && runs < budget; step++) {
        const prev = previousLadderOption(truss, chords[0]);
        if (!prev || prev.ply > maxPly) break;
        const savedChords = chords.map(m => ({ ...m }));
        const beforeSize = `${chords[0].sectionName || '2x4'} / ${memberPlies(truss, chords[0])} ply`;
        for (const m of chords) setMemberLadderOption(m, prev);
        const candidate = runNdsForTruss(truss, settings);
        runs++;
        if (candidate.overall === 'PASS') {
          for (const m of chords) {
            actions.push(`${m.id}: right-sized ${beforeSize} → ${prev.name} / ${prev.ply} ply (coupled top/bottom chord)`);
          }
          report = candidate;
          changed = true;
        } else {
          chords.forEach((m, idx) => Object.assign(m, savedChords[idx]));
          break;
        }
      }
    }

    // 2. Step down individual web members
    for (const member of webs) {
      for (let step = 0; step < 8 && runs < budget; step++) {
        const prev = previousLadderOption(truss, member);
        if (!prev || prev.ply > maxPly) break;
        const saved = { ...member };
        const beforeSize = `${member.sectionName || '2x4'} / ${memberPlies(truss, member)} ply`;
        setMemberLadderOption(member, prev);
        const candidate = runNdsForTruss(truss, settings);
        runs++;
        if (candidate.overall === 'PASS') {
          actions.push(`${member.id}: right-sized ${beforeSize} → ${prev.name} / ${prev.ply} ply`);
          report = candidate;
          changed = true;
        } else {
          Object.assign(member, saved);
          break;
        }
      }
    }
    if (!changed || runs >= budget) break;
  }
  syncChordStudSize(truss, maxPly);
  return { report, actions, runs };
}

function cloneTrussForWebSearch(truss) {
  return {
    ...truss,
    members: (truss.members || []).map(m => ({
      ...m,
      a: [...m.a],
      b: [...m.b],
      section: Array.isArray(m.section) ? [...m.section] : m.section,
    })),
  };
}

function mergeCollinearUnbracedChordJoints(members) {
  let list = members.map(m => ({ ...m, a: [...m.a], b: [...m.b] }));
  const bottomXs = list.filter(m => m.role === 'bottom').flatMap(m => [m.a[0], m.b[0]]);
  const minX = Math.min(...bottomXs), maxX = Math.max(...bottomXs);

  let mergedAny = true;
  while (mergedAny) {
    mergedAny = false;
    const byNode = new Map();
    for (const m of list) {
      for (const pt of [m.a, m.b]) {
        const k = pointKey(pt[0], pt[2]);
        if (!byNode.has(k)) byNode.set(k, { pt, members: [] });
        byNode.get(k).members.push(m);
      }
    }
    for (const [k, info] of byNode.entries()) {
      const x = info.pt[0];
      if (x <= minX + 0.005 || x >= maxX - 0.005) continue;
      if (info.members.length !== 2) continue;
      const [m1, m2] = info.members;
      if (m1.role !== m2.role || !['top', 'bottom'].includes(m1.role)) continue;
      if (m1.role === 'bottom') {
        const interiorBottomNodes = [...byNode.values()].filter(n =>
          n.pt[0] > minX + 0.005 && n.pt[0] < maxX - 0.005 && n.members.some(m => m.role === 'bottom')
        );
        if (interiorBottomNodes.length <= 1) continue;
      }
      const other1 = pointKey(m1.a[0], m1.a[2]) === k ? m1.b : m1.a;
      const other2 = pointKey(m2.a[0], m2.a[2]) === k ? m2.b : m2.a;
      const v1x = info.pt[0] - other1[0], v1y = info.pt[2] - other1[2];
      const v2x = other2[0] - info.pt[0], v2y = other2[2] - info.pt[2];
      const l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
      if (l1 < 1e-4 || l2 < 1e-4) continue;
      const cross = Math.abs(v1x * v2y - v1y * v2x) / (l1 * l2);
      if (cross > 0.015) continue;

      const merged = {
        ...m1,
        a: [...other1],
        b: [...other2],
        length: Math.hypot(other2[0] - other1[0], other2[2] - other1[2]),
      };
      list = list.filter(m => m !== m1 && m !== m2);
      list.push(merged);
      mergedAny = true;
      break;
    }
  }
  return list;
}

/**
 * Minimize Webs pass: iteratively removes redundant interior web members (merging any resulting collinear
 * degree-2 chord joints) while verifying that joint connectivity and full NDS ASD checks still PASS.
 */
function minimizeTrussWebs(truss, settings, maxPly) {
  const actions = [];
  let removedCount = 0;
  const bottomXs = (truss.members || []).filter(m => m.role === 'bottom').flatMap(m => [m.a[0], m.b[0]]);
  if (bottomXs.length < 2) return { removedCount, actions };
  const minX = Math.min(...bottomXs), maxX = Math.max(...bottomXs);
  const midX = (minX + maxX) / 2;

  let improved = true;
  let guard = 0;
  while (improved && guard++ < 16) {
    improved = false;
    const currentWebs = (truss.members || []).filter(m => m.role === 'web');
    if (currentWebs.length <= 3) break;

    // Prioritize testing interior vertical webs (especially at ridge/midspan), then interior diagonals
    const orderedWebs = [...currentWebs].sort((w1, w2) => {
      const isVert1 = Math.abs(w1.a[0] - w1.b[0]) < 0.01 ? 0 : 1;
      const isVert2 = Math.abs(w2.a[0] - w2.b[0]) < 0.01 ? 0 : 1;
      if (isVert1 !== isVert2) return isVert1 - isVert2;
      const distMid1 = Math.abs((w1.a[0] + w1.b[0]) / 2 - midX);
      const distMid2 = Math.abs((w2.a[0] + w2.b[0]) / 2 - midX);
      return distMid1 - distMid2;
    });

    for (const candidateWeb of orderedWebs) {
      const wxMin = Math.min(candidateWeb.a[0], candidateWeb.b[0]);
      const wxMax = Math.max(candidateWeb.a[0], candidateWeb.b[0]);
      // Never remove heel boundary verticals at the supports if top and bottom chords are separated there
      if ((Math.abs(wxMin - minX) < 0.01 && Math.abs(wxMax - minX) < 0.01) ||
          (Math.abs(wxMin - maxX) < 0.01 && Math.abs(wxMax - maxX) < 0.01)) {
        continue;
      }

      const candidate = cloneTrussForWebSearch(truss);
      const withoutWeb = candidate.members.filter(m => m.id !== candidateWeb.id);
      candidate.members = mergeCollinearUnbracedChordJoints(withoutWeb);
      ensureMemberIds(candidate);

      const conn = auditTrussConnectivity(candidate.members);
      if (!conn.passed) continue;

      resetMembersToLadderMinimum(candidate);
      const sized = optimizeNdsMemberSizes(candidate, settings, 10);
      if (sized.report.overall === 'PASS' && !sized.report.unstable) {
        truss.members = candidate.members;
        ensureMemberIds(truss);
        removedCount++;
        actions.push(`minimized webs: removed redundant web ${candidateWeb.id} (${currentWebs.length} → ${(truss.members || []).filter(m => m.role === 'web').length} webs) while maintaining NDS ASD PASS`);
        improved = true;
        break;
      }
    }
  }
  return { removedCount, actions };
}

/**
 * Maximize Webs pass: subdivides chord panel bays with additional vertical web posts and triangulating
 * sub-diagonals to maximize web triangulation density, panel bracing, and truss stiffness.
 */
function maximizeTrussWebs(truss, settings, maxPly) {
  const actions = [];
  const initialWebs = (truss.members || []).filter(m => m.role === 'web');
  const topMembers = (truss.members || []).filter(m => m.role === 'top' || m.role === 'overhang');
  const botMembers = (truss.members || []).filter(m => m.role === 'bottom');
  if (!topMembers.length || !botMembers.length) return { addedCount: 0, actions };

  const botXs = botMembers.flatMap(m => [m.a[0], m.b[0]]);
  const minX = Math.min(...botXs), maxX = Math.max(...botXs);
  const span = maxX - minX;
  if (!(span > 0.6)) return { addedCount: 0, actions };

  // Collect existing station Xs within [minX, maxX]
  const rawXs = [
    minX,
    maxX,
    ...botMembers.flatMap(m => [m.a[0], m.b[0]]),
    ...topMembers.flatMap(m => [m.a[0], m.b[0]]),
  ].filter(x => x >= minX - 0.002 && x <= maxX + 0.002)
   .map(x => Math.max(minX, Math.min(maxX, Number(x.toFixed(4)))))
   .sort((a, b) => a - b);

  const baseStations = [];
  for (const x of rawXs) {
    if (!baseStations.length || x - baseStations[baseStations.length - 1] > 0.04) {
      baseStations.push(x);
    }
  }
  if (Math.abs(baseStations[baseStations.length - 1] - maxX) > 0.01) {
    baseStations.push(maxX);
  }

  // Subdivide every bay longer than 0.45 m to maximize web triangulation
  const expandedStations = [];
  for (let i = 0; i < baseStations.length - 1; i++) {
    const x1 = baseStations[i], x2 = baseStations[i + 1];
    expandedStations.push(x1);
    if (x2 - x1 > 0.45) {
      expandedStations.push(Number(((x1 + x2) / 2).toFixed(4)));
    }
  }
  expandedStations.push(baseStations[baseStations.length - 1]);

  if (expandedStations.length <= baseStations.length) {
    return { addedCount: 0, actions };
  }

  const evalSegY = (segs, x) => {
    for (const m of segs) {
      const x1 = Math.min(m.a[0], m.b[0]), x2 = Math.max(m.a[0], m.b[0]);
      if (x >= x1 - 1e-4 && x <= x2 + 1e-4) {
        const dx = m.b[0] - m.a[0];
        if (Math.abs(dx) < 1e-6) return Math.max(m.a[2], m.b[2]);
        const t = (x - m.a[0]) / dx;
        return Number((m.a[2] + t * (m.b[2] - m.a[2])).toFixed(4));
      }
    }
    return 0;
  };

  const B = expandedStations.map(x => [x, evalSegY(botMembers, x)]);
  const T = expandedStations.map((x, i) => {
    const yt = evalSegY(topMembers, x);
    if (Math.abs(yt - B[i][1]) < 0.008) return B[i];
    return [x, Math.max(yt, B[i][1] + 0.05)];
  });

  const protoChord = topMembers[0] || botMembers[0];
  const protoWeb = initialWebs[0] || protoChord;
  const makeMember = (p1, p2, role, proto, idx) => {
    const widthMm = memberWidth(proto);
    const depthMm = memberDepth(proto);
    const plies = memberPlies(truss, proto);
    return {
      id: `${truss.id}:M${idx}`,
      role,
      a: [p1[0], 0, p1[1]],
      b: [p2[0], 0, p2[1]],
      length: Math.hypot(p2[0] - p1[0], p2[1] - p1[1]),
      widthMm,
      depthMm,
      section: [widthMm / 1000, depthMm / 1000],
      sectionName: proto.sectionName || '2x4',
      ndsPlies: plies,
      material: 'timber',
      thickness: widthMm / 1000,
    };
  };

  const newMembers = [];
  // Preserve any overhang segments outside [minX, maxX]
  for (const m of topMembers) {
    const mx1 = Math.min(m.a[0], m.b[0]), mx2 = Math.max(m.a[0], m.b[0]);
    if (mx2 <= minX + 0.005 || mx1 >= maxX - 0.005) {
      newMembers.push({ ...m, a: [...m.a], b: [...m.b] });
    }
  }
  for (let i = 0; i < expandedStations.length - 1; i++) {
    newMembers.push(makeMember(T[i], T[i + 1], 'top', protoChord, newMembers.length + 1));
  }
  for (let i = 0; i < expandedStations.length - 1; i++) {
    newMembers.push(makeMember(B[i], B[i + 1], 'bottom', protoChord, newMembers.length + 1));
  }

  const webKeys = new Set();
  const addWebSeg = (p1, p2) => {
    if (Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) < 0.005) return;
    const k1 = `${pointKey(p1[0], p1[1])}->${pointKey(p2[0], p2[1])}`;
    const k2 = `${pointKey(p2[0], p2[1])}->${pointKey(p1[0], p1[1])}`;
    if (webKeys.has(k1) || webKeys.has(k2)) return;
    webKeys.add(k1);
    newMembers.push(makeMember(p1, p2, 'web', protoWeb, newMembers.length + 1));
  };

  // Add vertical web posts at all stations where top & bottom chords are distinct
  for (let i = 0; i < expandedStations.length; i++) {
    if (T[i] !== B[i] && Math.abs(T[i][1] - B[i][1]) > 0.01) {
      addWebSeg(B[i], T[i]);
    }
  }

  // Add triangulating diagonals in every sub-bay
  const midX = (minX + maxX) / 2;
  for (let i = 0; i < expandedStations.length - 1; i++) {
    const bayMid = (expandedStations[i] + expandedStations[i + 1]) / 2;
    const leftDistinct = T[i] !== B[i] && Math.abs(T[i][1] - B[i][1]) > 0.01;
    const rightDistinct = T[i + 1] !== B[i + 1] && Math.abs(T[i + 1][1] - B[i + 1][1]) > 0.01;
    if (leftDistinct && rightDistinct) {
      if (bayMid <= midX) addWebSeg(B[i], T[i + 1]);
      else addWebSeg(T[i], B[i + 1]);
    } else if (!leftDistinct && rightDistinct) {
      // Left heel triangle: already braced by T[i]->T[i+1], B[i]->B[i+1], and vertical B[i+1]->T[i+1]
    } else if (leftDistinct && !rightDistinct) {
      // Right heel triangle: already braced by vertical B[i]->T[i]
    }
  }

  const candidate = cloneTrussForWebSearch(truss);
  candidate.members = newMembers;
  ensureMemberIds(candidate);
  const conn = auditTrussConnectivity(candidate.members);
  if (!conn.passed) return { addedCount: 0, actions };

  const newWebCount = candidate.members.filter(m => m.role === 'web').length;
  if (newWebCount <= initialWebs.length) return { addedCount: 0, actions };

  truss.members = candidate.members;
  ensureMemberIds(truss);
  const addedCount = newWebCount - initialWebs.length;
  actions.push(`maximized webs: subdivided panel bays and added ${addedCount} web members (${initialWebs.length} → ${newWebCount} webs) for maximum triangulation & stiffness`);
  return { addedCount, actions };
}

export function computePlyAndSectionBreakdown(truss) {
  const chords = (truss.members || []).filter(isChordMember);
  const webs = (truss.members || []).filter(m => !isChordMember(m));

  const chordPly = chords.length ? Math.max(...chords.map(m => memberPlies(truss, m))) : 1;
  const webPly = webs.length ? Math.max(...webs.map(m => memberPlies(truss, m))) : 1;
  const maxPly = Math.max(chordPly, webPly);

  const chordSec = chords.length ? (chords[0].sectionName || '2x4') : '2x4';
  const webSec = webs.length ? (webs[0].sectionName || '2x4') : '2x4';

  const multiPlyWebs = webs.filter(m => memberPlies(truss, m) > 1).map(m => m.id.split(':').pop() || m.id);
  const webPlyDetail = webPly > 1
    ? `${webPly}-ply (${multiPlyWebs.length > 0 ? multiPlyWebs.slice(0, 4).join(', ') : 'all webs'})`
    : '1-ply';

  const chordPlyDetail = `${chordPly}-ply (${chordSec})`;

  return {
    chordPly,
    webPly,
    maxTrussPly: maxPly,
    chordSec,
    webSec,
    chordPlyDetail,
    webPlyDetail,
    plySummaryLabel: chordPly === webPly
      ? `${chordPly}-ply (${chordSec})`
      : `Chords: ${chordPly}-ply (${chordSec}) | Webs: ${webPlyDetail} (${webSec})`
  };
}

function computeTrussLoadFingerprint(truss, settings = {}) {
  const transfers = (truss.engineering?.transfersIn || [])
    .map(t => `${t.from}:${Number(t.designReaction_kN).toFixed(2)}`)
    .sort()
    .join(';');
  return [
    truss.id,
    truss.webStyle || '',
    finite(truss.span).toFixed(3),
    finite(truss.height).toFixed(3),
    finite(truss.spacing).toFixed(3),
    finite(settings.dead, 10),
    finite(settings.bottomDead, 5),
    finite(settings.roofLive, 20),
    finite(settings.snow, 0),
    finite(settings.bottomLive, 0),
    finite(settings.maxPly, 5),
    finite(settings.chordLatMm, 600),
    settings.webOptimizationMode || 'auto',
    transfers,
  ].join('|');
}

function optimizeNdsTruss(truss, p, settings = {}, initialReport = null) {
  ensureMemberIds(truss);
  const loadHash = computeTrussLoadFingerprint(truss, settings);
  const existingState = truss.ndsOptimizationState;
  const isStateValid = existingState && existingState.loadHash === loadHash && existingState.lockedMembers;

  const initialWebCount = (truss.members || []).filter(m => m.role === 'web').length;
  const webMode = String(settings.webOptimizationMode || 'auto').toLowerCase();
  const maxPly = Math.max(1, Math.min(MAX_PLY, finite(settings.maxPly, 5)));
  const beforeStyle = truss.webStyle || 'Existing geometry';
  const beforeNdsMembers = snapshotTrussMembers(truss);

  if (isStateValid) {
    // Lock previously passed member sections unless load inputs changed
    for (const member of truss.members || []) {
      const locked = existingState.lockedMembers[member.id];
      if (locked) {
        member.sectionName = locked.sectionName;
        member.widthMm = locked.widthMm;
        member.depthMm = locked.depthMm;
        member.section = [locked.widthMm / 1000, locked.depthMm / 1000];
        member.ndsPlies = locked.ndsPlies;
      }
    }
    const reportCheck = runNdsForTruss(truss, settings);
    if (reportCheck.overall === 'PASS') {
      const plyBreakdown = computePlyAndSectionBreakdown(truss);
      truss.ndsASDAnalysis = reportCheck;
      truss.ndsOptimization = {
        rounds: 0,
        actions: ['Member sections locked from stateful optimization history (loads unchanged)'],
        changeRecords: [],
        baseline: ratioSummary(reportCheck),
        final: ratioSummary(reportCheck),
        styleChanged: false,
        webOptimizationMode: webMode,
        initialWebCount,
        finalWebCount: initialWebCount,
        originalWebStyle: beforeStyle,
        finalWebStyle: truss.webStyle || beforeStyle,
        result: reportCheck.overall,
        unresolved: [],
        ...plyBreakdown,
      };
      if (truss.analysis) Object.assign(truss.analysis, plyBreakdown);
      if (truss.optimizationAudit) Object.assign(truss.optimizationAudit, plyBreakdown);
      return { report: reportCheck, rounds: 0, actions: [], styleChanged: false, changeRecords: [], initialWebCount, finalWebCount: initialWebCount, webOptimizationMode: webMode };
    }
  }

  const maxRounds = Math.max(1, Math.min(30, Math.round(finite(settings.maxNdsRounds, 12))));
  const canTryTopology = canAutoChangeWebStyle(truss);
  // Reserve a small part of the configured iteration budget for sizing a candidate web topology.
  // If no better topology exists, the reserved rounds are returned to the original geometry.
  const reserveRounds = canTryTopology ? (maxRounds >= 4 ? 3 : maxRounds >= 2 ? 1 : 0) : 0;
  const baselineReport = initialReport || runNdsForTruss(truss, settings);
  let styleChanged = false;
  let preActions = [];

  if (webMode === 'maximize') {
    const maxRes = maximizeTrussWebs(truss, settings, maxPly);
    if (maxRes.addedCount > 0) {
      styleChanged = true;
      truss.webStyle = `${beforeStyle} (Maximized Webs)`;
      truss.topologySource = 'CadTech auto web maximization';
      preActions.push(...maxRes.actions);
      resetMembersToLadderMinimum(truss);
    }
  }

  let sizing = optimizeNdsMemberSizes(truss, settings, maxRounds - reserveRounds);
  let report = sizing.report;
  let actions = [...preActions, ...sizing.actions];
  let rounds = sizing.rounds;

  if (report.overall !== 'PASS') {
    const better = tryBetterWebStyle(truss, p, settings, report, maxPly);
    if (better) {
      Object.assign(truss, better.candidate);
      ensureMemberIds(truss);
      styleChanged = true;
      actions.push(`web topology changed ${beforeStyle} → ${better.style} after NDS candidate comparison`);
      truss.topologySource = 'CadTech auto web-style candidate';
      // A changed web topology is re-run through the NDS optimizer using only the remaining configured rounds.
      const remaining = Math.max(0, maxRounds - rounds);
      sizing = optimizeNdsMemberSizes(truss, settings, remaining);
      report = sizing.report;
      rounds += sizing.rounds;
      actions.push(...sizing.actions);
    } else if (rounds < maxRounds) {
      // No eligible web candidate improved the result; use the reserved search budget on the original geometry.
      sizing = optimizeNdsMemberSizes(truss, settings, maxRounds - rounds);
      report = sizing.report;
      rounds += sizing.rounds;
      actions.push(...sizing.actions);
    }
  }

  if (webMode === 'minimize' && report.overall === 'PASS') {
    const minRes = minimizeTrussWebs(truss, settings, maxPly);
    if (minRes.removedCount > 0) {
      styleChanged = true;
      truss.webStyle = `${beforeStyle} (Minimized Webs)`;
      truss.topologySource = 'CadTech auto web minimization';
      actions.push(...minRes.actions);
      const reSize = optimizeNdsMemberSizes(truss, settings, Math.max(4, maxRounds));
      report = reSize.report;
      actions.push(...reSize.actions);
    }
  }

  if (report.overall === 'PASS') {
    const trim = rightSizeMembers(truss, settings, maxPly);
    report = trim.report;
    actions.push(...trim.actions);
    // The right-size pass has its own run budget (160 checks); it is not counted against the sizing rounds.
  }
  syncChordStudSize(truss, maxPly);
  const finalWebCount = (truss.members || []).filter(m => m.role === 'web').length;
  if (truss.analysis?.sections) {
    const chord = (truss.members || []).find(isChordMember);
    if (chord) {
      const chordSec = { b: memberWidth(chord), d: memberDepth(chord), name: chord.sectionName || '2x4', kgm: Number(((memberWidth(chord) * memberDepth(chord) * 480) / 1e6).toFixed(2)) };
      truss.analysis.sections.top = { ...chordSec };
      truss.analysis.sections.bottom = { ...chordSec };
      truss.analysis.ply = memberPlies(truss, chord);
    }
  }
  truss.ndsASDAnalysis = report;
  const afterNdsMembers = snapshotTrussMembers(truss);
  const plyBreakdown = computePlyAndSectionBreakdown(truss);

  if (report.overall === 'PASS') {
    const lockedMembers = {};
    for (const m of truss.members || []) {
      lockedMembers[m.id] = {
        sectionName: m.sectionName || '2x4',
        widthMm: memberWidth(m),
        depthMm: memberDepth(m),
        ndsPlies: memberPlies(truss, m),
      };
    }
    truss.ndsOptimizationState = {
      loadHash,
      lockedMembers,
      recordedAt: new Date().toISOString(),
    };
  } else {
    truss.ndsOptimizationState = null;
  }

  const changeRecords = diffMemberSnapshots(
    beforeNdsMembers,
    afterNdsMembers,
    'NDS ASD optimization',
    'Member section and/or ply count changed to improve the independent NDS ASD checks.',
    baselineReport,
    report,
  );
  if (styleChanged) changeRecords.unshift({
    phase: 'NDS ASD optimization', changeType: 'web-style', memberId: 'TRUSS', role: 'topology',
    before: { webStyle: beforeStyle, memberCount: beforeNdsMembers.length, webCount: initialWebCount },
    after: { webStyle: truss.webStyle || beforeStyle, memberCount: afterNdsMembers.length, webCount: finalWebCount },
    beforeRatio: ratioSummary(baselineReport).maxRatio,
    afterRatio: ratioSummary(report).maxRatio,
    reason: webMode === 'minimize'
      ? `Minimized web member count (${initialWebCount} → ${finalWebCount} webs) while maintaining NDS ASD PASS.`
      : webMode === 'maximize'
      ? `Maximized web triangulation (${initialWebCount} → ${finalWebCount} webs) for enhanced stiffness and NDS ASD PASS.`
      : 'Alternate web topology was retained because its NDS score improved compared with the original topology.',
  });
  truss.ndsOptimization = {
    rounds,
    actions,
    changeRecords,
    baseline: ratioSummary(baselineReport),
    final: ratioSummary(report),
    styleChanged,
    webOptimizationMode: webMode,
    initialWebCount,
    finalWebCount,
    originalWebStyle: beforeStyle,
    finalWebStyle: truss.webStyle || beforeStyle,
    result: report.overall,
    ...plyBreakdown,
    unresolved: report.overall === 'PASS' ? [] : [
      ...(rounds >= maxRounds ? [`Reached the configured NDS optimization limit (${maxRounds} rounds) without a passing result.`] : []),
      ...(report.unstable ? ['Pin-jointed solver remains unstable after tested web/member changes.'] : []),
      ...(report.connectivity?.errors || []).map(e => `Joint topology: ${e}`),
      ...(report.members || []).filter(member => member.status !== 'PASS').map(member => `${member.id}: ${member.governing?.check || 'member check'} ratio ${member.governing?.ratio ?? 'not available'}; ${member.slendernessOk ? 'strength ratio governs' : 'slenderness limit exceeded'}`),
      ...(report.deflection?.liveOk === false ? ['Live/snow deflection still exceeds L/240.'] : []),
      ...(report.deflection?.totalOk === false ? ['Total deflection still exceeds L/180.'] : []),
      ...(!report.unstable && !(report.members || []).some(member => member.status !== 'PASS') && report.deflection?.liveOk !== false && report.deflection?.totalOk !== false ? ['NDS ASD did not pass; inspect report warnings and support/model assumptions.'] : []),
    ],
  };
  if (truss.analysis) Object.assign(truss.analysis, plyBreakdown);
  if (truss.optimizationAudit) Object.assign(truss.optimizationAudit, plyBreakdown);
  return { report, rounds, actions, styleChanged, changeRecords, initialWebCount, finalWebCount, webOptimizationMode: webMode };
}

/**
 * Convert the reference auto-sizing output to independent NDS ASD screening, then iteratively
 * improve failing members by section depth, ply count and (only for simple common trusses)
 * alternate web topologies. No PASS is assigned unless analyzeTruss returns PASS for the
 * final member geometry and load inputs.
 */
export function runCadTechTrussAnalysis(geometry, settings = {}, options = {}) {
  // Roof snow load is a required input. An omitted or blank value is refused rather than silently treated as 0 psf.
  // Zero is accepted only when entered explicitly.
  if (settings.snow === undefined || settings.snow === null || settings.snow === '' || !Number.isFinite(Number(settings.snow))) {
    throw new Error('Roof snow load (psf) is required for the NDS check. Enter the site snow load, or 0 only if the site has no snow load.');
  }
  const assembly = trussGeometryToAssembly(geometry);
  if (!assembly.trusses.length) throw new Error('No usable truss members were found. Generate roof framing and check truss chord/web geometry first.');

  const p = {
    dead: finite(settings.dead, 10),
    roofLive: finite(settings.roofLive, 20),
    snow: finite(settings.snow, 0),
    wind: finite(settings.wind, 20),
    bottomLive: finite(settings.bottomLive, 10),
    trib: finite(settings.tribFt, assembly.trusses[0].spacing / 0.3048),
    limit: finite(settings.deflectionLimit, 360),
    bearingLength: finite(settings.bearingLength, 89),
    bearingCapacity: finite(settings.bearingCapacity, 4),
    holdDownCapacity: finite(settings.holdDownCapacity, 0),
    plateCapacity: finite(settings.plateCapacity, 0),
    braceLength: finite(settings.braceLength, 2400),
    codeProfile: 'US-ASCE7-16/NDS2018-ASD-subset',
    woodGrade: 'SPF-No2',
  };

  const preAutoMembers = new Map(assembly.trusses.map(truss => [truss.id, snapshotTrussMembers(truss)]));
  const sizingSummary = autoDesignAssembly(assembly, p, {
    styles: WEB_STYLES,
    maxRounds: 8,
    maxPly: Math.max(1, Math.min(MAX_PLY, finite(settings.maxPly, 5))),
    progress: options.progress || (() => {}),
  });

  const webOptimizationMode = String(settings.webOptimizationMode || 'auto').toLowerCase();
  let ndsOptimizationRounds = 0;
  let totalWebsBefore = 0;
  let totalWebsAfter = 0;
  const ndsActionCount = { sections: 0, plies: 0, webStyles: 0 };
  for (let index = 0; index < assembly.trusses.length; index++) {
    const truss = assembly.trusses[index];
    try {
      const afterAutoMembers = snapshotTrussMembers(truss);
      const afterAutoReport = runNdsForTruss(truss, settings);
      const autoSizeChanges = diffMemberSnapshots(
        preAutoMembers.get(truss.id) || [],
        afterAutoMembers,
        'V9.9.8 auto-size screen',
        'Member size and/or ply count changed during the initial V9.9.8 auto-size screening pass.',
        null,
        afterAutoReport,
      );
      resetMembersToLadderMinimum(truss);
      const optimized = optimizeNdsTruss(truss, p, settings, afterAutoReport);
      totalWebsBefore += optimized.initialWebCount ?? 0;
      totalWebsAfter += optimized.finalWebCount ?? 0;
      truss.optimizationAudit = {
        source: 'Current BIM roof framing geometry',
        autoSizeChanges,
        ndsChanges: optimized.changeRecords,
        changeCount: autoSizeChanges.length + optimized.changeRecords.length,
        initialNds: ratioSummary(afterAutoReport),
        finalNds: ratioSummary(optimized.report),
        finalDisposition: optimized.report.overall,
        webOptimizationMode: optimized.webOptimizationMode,
        initialWebCount: optimized.initialWebCount,
        finalWebCount: optimized.finalWebCount,
        roundsUsed: optimized.rounds,
        roundsAllowed: Math.max(1, Math.min(30, Math.round(finite(settings.maxNdsRounds, 12)))),
        recordedAt: new Date().toISOString(),
      };
      ndsOptimizationRounds += optimized.rounds;
      ndsActionCount.sections += optimized.actions.filter(action => /member section/.test(action)).length;
      ndsActionCount.plies += optimized.actions.filter(action => /added ply/.test(action)).length;
      ndsActionCount.webStyles += optimized.styleChanged ? 1 : 0;
    } catch (error) {
      truss.ndsASDAnalysis = {
        overall: 'NOT RUN',
        unstable: true,
        error: error?.message || String(error),
        members: [],
        warnings: ['Independent NDS ASD check and automatic optimization could not be completed for this truss.'],
        assumptions: [],
      };
      truss.ndsOptimization = { rounds: 0, actions: [], changeRecords: [], styleChanged: false, result: 'NOT RUN', unresolved: [error?.message || String(error)] };
      truss.optimizationAudit = {
        source: 'Current BIM roof framing geometry', autoSizeChanges: [], ndsChanges: [], changeCount: 0,
        initialNds: { result: 'NOT RUN', failedMembers: 0, memberCount: 0, maxRatio: null },
        finalNds: { result: 'NOT RUN', failedMembers: 0, memberCount: 0, maxRatio: null },
        finalDisposition: 'NOT RUN', roundsUsed: 0,
        error: error?.message || String(error), recordedAt: new Date().toISOString(),
      };
    }
    truss.analysisProvenance = {
      autoSizing: 'V9.9.8 screening engine (approximate force and deflection model)',
      independentCheck: 'NDS 2018 SPF No.2 reference data; ASCE 7-16 ASD subset; pin-jointed axial solver with chord panel-load bending checks',
      ndsOptimization: `Up to ${Math.max(1, Math.min(30, Math.round(finite(settings.maxNdsRounds, 12))))} iterative member section / ply rounds; web optimization mode: ${webOptimizationMode}`,
    };
    options.progress?.(index + 1, assembly.trusses.length, truss.id);
  }

  const autoPass = assembly.trusses.filter(t => t.design?.result === 'PASS').length;
  const ndsPass = assembly.trusses.filter(t => t.ndsASDAnalysis?.overall === 'PASS').length;
  const ndsFail = assembly.trusses.filter(t => t.ndsASDAnalysis?.overall === 'FAIL').length;
  const ndsNotRun = assembly.trusses.length - ndsPass - ndsFail;

  return {
    assembly,
    settings: { ...settings, ...p, webOptimizationMode, spacingMm: assembly.trusses[0]?.spacing * 1000 },
    sizingSummary: { ...sizingSummary, ndsOptimizationRounds, ndsActions: ndsActionCount },
    summary: {
      trusses: assembly.trusses.length,
      autoSizingPass: autoPass,
      autoSizingFail: assembly.trusses.length - autoPass,
      ndsPass,
      ndsFail,
      ndsNotRun,
      ndsMembersResized: ndsActionCount.sections,
      ndsPliesAdded: ndsActionCount.plies,
      ndsWebStylesChanged: ndsActionCount.webStyles,
      webOptimizationMode,
      totalWebsBefore,
      totalWebsAfter,
      auditedChanges: assembly.trusses.reduce((count, truss) => count + (truss.optimizationAudit?.changeCount || 0), 0),
      initialNdsFail: assembly.trusses.filter(truss => truss.optimizationAudit?.initialNds?.result === 'FAIL').length,
      overall: ndsNotRun || ndsFail ? 'REVIEW REQUIRED' : 'PRELIMINARY CHECKS COMPLETE',
    },
    limitations: [
      'The auto-sizing engine uses a simplified screening model; its PASS/FAIL is not an engineered member design approval.',
      'The separate timber check uses NDS 2018 SPF No.2 reference values and an ASCE 7-16 ASD subset. It is not an Indian IS 883 / IS 875, Eurocode 5, AS 1720, or other jurisdiction-specific design check.',
      'The NDS service models the truss as pin-jointed for axial forces and adds simplified chord panel-load bending checks. It does not design connector plates, bolts, hangers, bearing, uplift anchorage, or complete 3D lateral stability.',
      'Web members are checked for out-of-plane buckling over their full length unless a web bracing spacing is supplied. Midspan deflection is verified only where a stable bottom-chord point exists at midspan; otherwise deflection fails closed. Chord flexure from panel loads and long-term creep are not included in the deflection check.',
      'Roof dead load is applied per sloped surface area (on sloped length); snow and roof live load are per horizontal projection. Confirm the dead-load input basis.',
      'Wind and seismic combinations, snow drift, sloped-roof snow coefficient, manufacturer plate capacities, and project-specific bracing are not included in the independent NDS check.',
      'Automatic NDS upgrades combine parallel plies as an effective member width for screening. This idealized width is not a ply-fastener or built-up-column calculation. Verify ply fastening, load sharing, edge distances, splice design and physical member arrangement separately.',
      'Automatic web-style changes are limited to simple COMMON trusses with a three-point roof profile; specialised hip, jack, girder and load-transfer assemblies are not silently re-topologised.',
      'Member properties and load inputs must be verified against the project drawings, timber grade stamps, supplier data, site loads and locally adopted codes.',
      'Jack/hip-to-girder load-transfer candidates are inferred from BIM member-end proximity where available; confirm every connection and bearing location before relying on transferred reactions.',
    ],
  };
}

/** Create stable, project-saveable role/member overrides to apply the NDS-selected sizes back to BIM. */
export function buildCadTechTrussBimOverrides(assembly) {
  return (assembly?.trusses || []).map(truss => ({
    roofId: truss.roofId,
    assemblyId: truss.assemblyId,
    trussId: truss.id,
    webStyle: truss.webStyle || null,
    webs: (truss.members || [])
      .filter(member => member.role === 'web')
      .map(member => [member.a[0], member.a[2], member.b[0], member.b[2]]),
    members: (truss.members || []).map(member => ({
      id: member.id,
      role: roleOfMember(member),
      a: [member.a[0], member.a[2]],
      b: [member.b[0], member.b[2]],
      widthMm: memberWidth(member),
      depthMm: memberDepth(member),
      plies: memberPlies(truss, member),
      sectionName: member.sectionName || '2x4',
    })),
    ndsResult: truss.ndsASDAnalysis?.overall || 'NOT RUN',
    optimizationAudit: truss.optimizationAudit || null,
  }));
}
