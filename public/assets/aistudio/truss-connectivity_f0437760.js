// Joint / connectivity audit for truss member geometry (2D truss plane, metres).
// Every member must be joined to the rest of the truss at real joint nodes: no member end may land in the
// middle of another member without a joint, no two members may cross without a shared node, and no web may
// have a free end. These are checks of the model's topology. They are not connector, plate or fastener designs.
const TOL = 0.002; // 2 mm joint tolerance

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = v => Math.hypot(v[0], v[1]);
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const dist = (a, b) => len(sub(a, b));

function segPoint(p) { return [Number(p?.[0]), Number(p?.[2] ?? p?.[1])]; }

export function auditTrussConnectivity(members, { tol = TOL } = {}) {
  const errors = [], warnings = [];
  const segs = (members || []).map(m => {
    const a = segPoint(m.a), b = segPoint(m.b);
    return { id: m.id, role: m.role, a, b, L: dist(a, b) };
  });

  segs.forEach(s => {
    if (!s.L > 0 || !Number.isFinite(s.L) || s.L < tol) errors.push(`${s.id}: zero-length or invalid member`);
  });
  // duplicates
  for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
    const si = segs[i], sj = segs[j];
    if ((dist(si.a, sj.a) < tol && dist(si.b, sj.b) < tol) || (dist(si.a, sj.b) < tol && dist(si.b, sj.a) < tol))
      errors.push(`${si.id} and ${sj.id}: duplicate member`);
  }

  const atNode = (p, s) => dist(p, s.a) < tol || dist(p, s.b) < tol;
  // pairwise crossings / T-junctions without a joint, and collinear overlaps
  for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
    const P = segs[i], Q = segs[j];
    if (!(P.L >= tol && Q.L >= tol)) continue;
    const r = sub(P.b, P.a), q = sub(Q.b, Q.a), qp = sub(Q.a, P.a);
    const den = cross(r, q);
    if (Math.abs(den) < 1e-9 * P.L * Q.L) {
      // parallel: collinear overlap of interiors is an error; touching at a shared node is allowed
      if (Math.abs(cross(r, qp)) / P.L > tol) continue; // not collinear
      const u = r.map(v => v / P.L);
      const s0 = 0, s1 = P.L, t0 = (Q.a[0] - P.a[0]) * u[0] + (Q.a[1] - P.a[1]) * u[1];
      const t1 = t0 + ((Q.b[0] - Q.a[0]) * u[0] + (Q.b[1] - Q.a[1]) * u[1]);
      const overlap = Math.min(Math.max(s0, s1), Math.max(t0, t1)) - Math.max(Math.min(s0, s1), Math.min(t0, t1));
      if (overlap > tol) errors.push(`${P.id} and ${Q.id}: collinear members overlap`);
      continue;
    }
    const t = cross(qp, q) / den;          // parameter along P
    const uu = cross(qp, r) / den;         // parameter along Q
    if (t < -1e-9 || t > 1 + 1e-9 || uu < -1e-9 || uu > 1 + 1e-9) continue; // no intersection
    const pt = [P.a[0] + r[0] * t, P.a[1] + r[1] * t];
    const endP = atNode(pt, P), endQ = atNode(pt, Q);
    if (!(endP && endQ)) {
      if (endP && !endQ) errors.push(`${P.id}: member end lands on the middle of ${Q.id} at (${pt[0].toFixed(3)}, ${pt[1].toFixed(3)}) m with no joint`);
      else if (!endP && endQ) errors.push(`${Q.id}: member end lands on the middle of ${P.id} at (${pt[0].toFixed(3)}, ${pt[1].toFixed(3)}) m with no joint`);
      else errors.push(`${P.id} and ${Q.id}: members cross at (${pt[0].toFixed(3)}, ${pt[1].toFixed(3)}) m without a joint`);
    }
  }

  // node degree: free ends
  const nodes = [];
  const degree = p => { let d = 0; for (const s of segs) { if (dist(p, s.a) < tol) d++; if (dist(p, s.b) < tol) d++; } return d; };
  for (const s of segs) for (const p of [s.a, s.b]) {
    if (!nodes.some(n => dist(n, p) < tol)) nodes.push(p);
  }
  // Bearing extent comes from the bottom chord only (overhang tails must not widen it).
  const bottomSegs = segs.filter(s => s.role === 'bottom');
  const bxs = (bottomSegs.length ? bottomSegs : segs).flatMap(s => [s.a[0], s.b[0]]);
  const bMin = Math.min(...bxs), bMax = Math.max(...bxs);
  const cantilevers = [];
  for (const s of segs) for (const [label, p] of [['start', s.a], ['end', s.b]]) {
    const other = label === 'start' ? s.b : s.a;
    const isBearing = s.role === 'bottom' && (Math.abs(p[0] - bMin) < tol || Math.abs(p[0] - bMax) < tol);
    if (degree(p) !== 1 || isBearing) continue;
    // Cantilever overhang tail: a top-chord end beyond the bearings whose heel is joined. Allowed; the solver carries it as a cantilever.
    if (s.role === 'top' && (p[0] < bMin - tol || p[0] > bMax + tol) && degree(other) >= 2) {
      cantilevers.push(s.id);
      continue;
    }
    // Any other member end joined to nothing is a mechanism in the pin-jointed model.
    errors.push(`${s.id}: ${label} at (${p[0].toFixed(3)}, ${p[1].toFixed(3)}) m is a free end, not joined to the truss (a mechanism in the pin-jointed model)`);
  }
  return { errors, warnings, cantilevers, nodeCount: nodes.length, memberCount: segs.length, passed: errors.length === 0 };
}
