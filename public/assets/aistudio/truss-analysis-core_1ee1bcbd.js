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

/** Convert the current BIM roof framing bridge geometry (metres + section mm) into the V9 auto-design assembly. */
export function trussGeometryToAssembly(geometry) {
  const source = Array.isArray(geometry?.trusses) ? geometry.trusses : [];
  const trusses = [];
  const usedIds = new Set();

  for (const raw of source) {
    const groups = [
      ...(raw.top || []).map(s => ({ ...s, role: 'top' })),
      ...(raw.bottom || []).map(s => ({ ...s, role: 'bottom' })),
      ...(raw.webs || []).map(s => ({ ...s, role: 'web' })),
    ];
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
    const topProfile = [
      [minX, 0, eaveZ],
      [peak?.[0] ?? midX, 0, peak?.[2] ?? maxZ],
      [maxX, 0, eaveZ],
    ];

    const role = classifyTruss(raw);
    trusses.push({
      id,
      tag: id,
      type: role,
      role,
      span,
      height: maxZ - base,
      base,
      pitch: finite(raw.pitch),
      spacing: Math.max(0.1, finite(raw.spacing, 0.6)),
      overhang: Math.max(0, finite(raw.overhangLeft)),
      overhangRight: Math.max(0, finite(raw.overhangRight)),
      profile: topProfile,
      members,
      edited: true, // keep the geometry generated/edited in the BIM model; optimizer sizes it but does not replace topology.
      webStyle: 'Existing geometry',
      assemblyId: raw.assemblyId,
      roofId: raw.roofId,
      ply: 1, // plies are sized by the NDS check (2x4/1 start); girders no longer start at two plies
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

  const members = [];
  for (const member of truss.members || []) {
    const a = getNode(member.a), b = getNode(member.b);
    // The BIM / auto-size section tuple is stored in metres; the NDS solver expects mm.
    // Convert the post-optimization section first so the independent check uses the selected size.
    const singleWidthMm = finite(member.section?.[0], finite(member.widthMm) / 1000) * 1000;
    const depthMm = finite(member.section?.[1], finite(member.depthMm) / 1000) * 1000;
    const plies = Math.max(1, Math.round(finite(member.ndsPlies, finite(member.plies, finite(truss.analysis?.ply, finite(truss.ply, 1))))));
    const widthMm = singleWidthMm * plies; // parallel plies act as the combined member width in this screening model
    if (!(widthMm > 0 && depthMm > 0)) continue;
    const kind = member.role === 'top' || member.role === 'overhang' ? 'top' : member.role === 'bottom' ? 'bottom' : 'web';
    members.push({
      id: member.id,
      a: a.id,
      b: b.id,
      kind,
      widthMm,
      depthMm,
      // Chords: lateral restraint spacing (sheathing / bracing). Webs: no restraint is assumed unless the
      // caller supplies one, so the solver uses the full member length for out-of-plane buckling.
      ...(member.role === 'web'
        ? (Number(settings.webLatMm) > 0 ? { latOutMm: Number(settings.webLatMm) } : {})
        : { latOutMm: finite(settings.chordLatMm, 600) }),
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
  const i = ladderIndexOf(truss, member);
  return i > 0 ? SIZE_PLY_LADDER[i - 1] : null;
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
    targets = (truss.members || []).filter(member => ['top', 'bottom', 'overhang'].includes(member.role));
  }
  if (!targets.length && report.unstable) targets = (truss.members || []).filter(member => member.role === 'web');
  return targets;
}

function optimizeNdsMemberSizes(truss, settings, maxRounds = 12) {
  const actions = [];
  let rounds = 0;
  let report = runNdsForTruss(truss, settings);
  const maxPly = Math.max(1, Math.min(MAX_PLY, finite(settings.maxPly, 5)));

  for (; rounds < maxRounds && report.overall !== 'PASS'; rounds++) {
    const targets = selectFailedMembers(truss, report);
    const checkById = new Map((report.members || []).map(c => [c.id, c]));
    let changed = false;
    for (const member of targets) {
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
  for (const style of WEB_STYLES) {
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
 * Right-size pass. After a PASS, try each member one ladder step smaller (largest members first). A step is kept only
 * if the full independent NDS check still returns PASS. This removes members that were sized larger than necessary.
 */
function rightSizeMembers(truss, settings, maxPly, budget = 160) {
  const actions = [];
  let runs = 0;
  let report = runNdsForTruss(truss, settings);
  if (report.overall !== 'PASS') return { report, actions, runs };
  const area = m => memberWidth(m) * memberDepth(m) * memberPlies(truss, m);
  const order = [...(truss.members || [])].sort((a, b) => area(b) - area(a));
  // Reducing one member changes the forces in the others, so repeat the pass until no member can step down (max 3 passes).
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (const member of order) {
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
  return { report, actions, runs };
}

function optimizeNdsTruss(truss, p, settings = {}, initialReport = null) {
  ensureMemberIds(truss);
  const beforeNdsMembers = snapshotTrussMembers(truss);
  const maxPly = Math.max(1, Math.min(MAX_PLY, finite(settings.maxPly, 5)));
  const beforeStyle = truss.webStyle || 'Existing geometry';
  const maxRounds = Math.max(1, Math.min(30, Math.round(finite(settings.maxNdsRounds, 12))));
  const canTryTopology = canAutoChangeWebStyle(truss);
  // Reserve a small part of the configured iteration budget for sizing a candidate web topology.
  // If no better topology exists, the reserved rounds are returned to the original geometry.
  const reserveRounds = canTryTopology ? (maxRounds >= 4 ? 3 : maxRounds >= 2 ? 1 : 0) : 0;
  const baselineReport = initialReport || runNdsForTruss(truss, settings);
  let sizing = optimizeNdsMemberSizes(truss, settings, maxRounds - reserveRounds);
  let report = sizing.report;
  let actions = [...sizing.actions];
  let rounds = sizing.rounds;
  let styleChanged = false;

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

  if (report.overall === 'PASS') {
    const trim = rightSizeMembers(truss, settings, maxPly);
    report = trim.report;
    actions.push(...trim.actions);
    // The right-size pass has its own run budget (160 checks); it is not counted against the sizing rounds.
  }
  truss.ndsASDAnalysis = report;
  const afterNdsMembers = snapshotTrussMembers(truss);
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
    before: { webStyle: beforeStyle, memberCount: beforeNdsMembers.length },
    after: { webStyle: truss.webStyle || beforeStyle, memberCount: afterNdsMembers.length },
    beforeRatio: ratioSummary(baselineReport).maxRatio,
    afterRatio: ratioSummary(report).maxRatio,
    reason: 'Alternate web topology was retained because its NDS score improved compared with the original topology.',
  });
  truss.ndsOptimization = {
    rounds,
    actions,
    changeRecords,
    baseline: ratioSummary(baselineReport),
    final: ratioSummary(report),
    styleChanged,
    originalWebStyle: beforeStyle,
    finalWebStyle: truss.webStyle || beforeStyle,
    result: report.overall,
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
  return { report, rounds, actions, styleChanged, changeRecords };
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

  let ndsOptimizationRounds = 0;
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
      truss.optimizationAudit = {
        source: 'Current BIM roof framing geometry',
        autoSizeChanges,
        ndsChanges: optimized.changeRecords,
        changeCount: autoSizeChanges.length + optimized.changeRecords.length,
        initialNds: ratioSummary(afterAutoReport),
        finalNds: ratioSummary(optimized.report),
        finalDisposition: optimized.report.overall,
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
      ndsOptimization: `Up to ${Math.max(1, Math.min(30, Math.round(finite(settings.maxNdsRounds, 12))))} iterative member section / ply rounds; alternate web styles tested only on simple common trusses when NDS remains FAIL`,
    };
    options.progress?.(index + 1, assembly.trusses.length, truss.id);
  }

  const autoPass = assembly.trusses.filter(t => t.design?.result === 'PASS').length;
  const ndsPass = assembly.trusses.filter(t => t.ndsASDAnalysis?.overall === 'PASS').length;
  const ndsFail = assembly.trusses.filter(t => t.ndsASDAnalysis?.overall === 'FAIL').length;
  const ndsNotRun = assembly.trusses.length - ndsPass - ndsFail;

  return {
    assembly,
    settings: { ...settings, ...p, spacingMm: assembly.trusses[0]?.spacing * 1000 },
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
    webStyle: truss.ndsOptimization?.styleChanged ? truss.webStyle : null,
    webs: truss.ndsOptimization?.styleChanged
      ? (truss.members || []).filter(member => member.role === 'web').map(member => [member.a[0], member.a[2], member.b[0], member.b[2]])
      : null,
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
