// Roof Engine Module — ES Module wrapper for Atelier BIM Studio V3.94b Roof Engine
// Provides parametric roof geometry, rafters, hip-end truss sets, and joint cuts.

let model = { stories: [{ id: 's0', elevation: 0, height: 3000 }], elements: [] };

function setHostModel(m) {
  model = m;
}

function getHostModel() {
  return model;
}

// 00-helpers
const JOIN_EPS = 0.001;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
let viewportCut = { enabled: false, axis: 'x', position: 0 };

function cross2(a, b) { return a.x * b.y - a.y * b.x; }
function sub2(a, b) { return { x: a.x - b.x, y: a.y - b.y }; }
function area2(ps) { return ps.reduce((s, p, i) => s + cross2(p, ps[(i + 1) % ps.length]), 0) / 2; }
function cleanPolygon(ps) {
  const out = [];
  for (const p of ps) if (!out.length || distance(p, out.at(-1)) > JOIN_EPS) out.push(p);
  if (out.length > 1 && distance(out[0], out.at(-1)) < JOIN_EPS) out.pop();
  return out.length >= 3 && Math.abs(area2(out)) > 0.01 ? (area2(out) < 0 ? out.reverse() : out) : [];
}
function axisIntersection(a, b, c, d) {
  const u = sub2(b, a), v = sub2(d, c), det = cross2(u, v);
  if (Math.abs(det) < 1e-8 * Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y)) return null;
  const t = cross2(sub2(c, a), v) / det, s = cross2(sub2(c, a), u) / det;
  return { point: lerp(a, b, t), t, s };
}
function segmentDistance(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l)) : 0;
  return { distance: distance(p, lerp(a, b, t)), t, point: lerp(a, b, t) };
}
function inside(p, ps) {
  let yes = false;
  for (let i = 0, j = ps.length - 1; i < ps.length; j = i++) {
    let a = ps[i], b = ps[j];
    if (((a.y > p.y) !== (b.y > p.y)) && (p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)) yes = !yes;
  }
  return yes;
}
function storyOf(e) { return model.stories.find(s => s.id === e.story) || model.stories[0]; }
function wallBase(w) { return storyOf(w).elevation + (w.baseOffset || 0); }
function heightOf(e) {
  if (e.type === 'roof' && e.followStory) return storyOf(e).height + (e.roofOffset || 0);
  if (e.type === 'wall' && e.followStory) {
    const home = storyOf(e), top = model.stories.find(s => s.id === e.topStory);
    return Math.max(10, (top ? top.elevation : home.elevation + home.height) + (e.topOffset || 0) - wallBase(e));
  }
  return e.followStory ? storyOf(e).height : e.height || 3000;
}
function isCutFace(ps) { return viewportCut.enabled && ps.every(p => Math.abs(p[viewportCut.axis] - viewportCut.position) < 0.01); }
function surfaceNormal(ps) {
  if (!ps || ps.length < 3) return { x: 0, y: 0, z: 1 };
  const a = ps[0], b = ps[1], c = ps[2];
  const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const v = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const n = { x: u.y * v.z - u.z * v.y, y: u.z * v.x - u.x * v.z, z: u.x * v.y - u.y * v.x };
  const len = Math.hypot(n.x, n.y, n.z) || 1;
  return { x: n.x / len, y: n.y / len, z: n.z / len };
}

// roof-footprint
function roofFrame(ps) {
  const a = ps[0], b = ps[1], l = distance(a, b), u = { x: (b.x - a.x) / l, y: (b.y - a.y) / l };
  return {
    local: p => ({ x: (p.x - a.x) * u.x + (p.y - a.y) * u.y, y: -(p.x - a.x) * u.y + (p.y - a.y) * u.x }),
    world: p => ({ x: a.x + p.x * u.x - p.y * u.y, y: a.y + p.x * u.y + p.y * u.x, ...(p.z === undefined ? {} : { z: p.z }) })
  };
}
function roofIsConvex(ps) { return ps.every((a, i) => ps.every(p => cross2(sub2(ps[(i + 1) % ps.length], a), sub2(p, a)) >= -0.01)); }
function roofSimple(ps) {
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      if (j === i + 1 || (i === 0 && j === ps.length - 1)) continue;
      const a = ps[i], b = ps[(i + 1) % ps.length], c = ps[j], d = ps[(j + 1) % ps.length];
      const hit = axisIntersection(a, b, c, d);
      if (hit && hit.t >= -1e-8 && hit.t <= 1 + 1e-8 && hit.s >= -1e-8 && hit.s <= 1 + 1e-8) return false;
      if (segmentDistance(a, c, d).distance < 0.001 || segmentDistance(c, a, b).distance < 0.001) return false;
    }
  }
  return true;
}
function roofOrthogonal(ps) {
  const f = roofFrame(ps), local = ps.map(f.local);
  return local.every((p, i) => {
    const q = local[(i + 1) % local.length];
    return Math.abs(p.x - q.x) < 0.01 || Math.abs(p.y - q.y) < 0.01;
  });
}
function roofTriangles(ps) {
  const points = [...ps], out = [];
  let guard = 0;
  while (points.length > 3 && guard++ < 10000) {
    let found = false;
    for (let i = 0; i < points.length; i++) {
      const a = points[(i + points.length - 1) % points.length], b = points[i], c = points[(i + 1) % points.length];
      if (cross2(sub2(b, a), sub2(c, b)) <= 0.001) continue;
      if (points.some(p => p !== a && p !== b && p !== c && cross2(sub2(b, a), sub2(p, a)) >= -0.001 && cross2(sub2(c, b), sub2(p, b)) >= -0.001 && cross2(sub2(a, c), sub2(p, c)) >= -0.001)) continue;
      out.push([a, b, c]);
      points.splice(i, 1);
      found = true;
      break;
    }
    if (!found) throw Error('Roof boundary cannot be triangulated.');
  }
  if (points.length === 3) out.push(points);
  return out;
}
function roofRectangles(ps) {
  const unique = v => [...new Set(v.map(n => Math.round(n * 1000) / 1000))].sort((a, b) => a - b);
  const xs = unique(ps.map(p => p.x)), ys = unique(ps.map(p => p.y));
  const nx = xs.length - 1, ny = ys.length - 1, prefix = Array.from({ length: nx + 1 }, () => Array(ny + 1).fill(0));
  for (let x = 0; x < nx; x++) {
    for (let y = 0; y < ny; y++) {
      prefix[x + 1][y + 1] = (inside({ x: (xs[x] + xs[x + 1]) / 2, y: (ys[y] + ys[y + 1]) / 2 }, ps) ? 0 : 1) + prefix[x][y + 1] + prefix[x + 1][y] - prefix[x][y];
    }
  }
  const clear = (a, b, c, d) => prefix[c][d] - prefix[a][d] - prefix[c][b] + prefix[a][b] === 0;
  const out = [];
  for (let a = 0; a < nx; a++) {
    for (let c = a + 1; c <= nx; c++) {
      for (let b = 0; b < ny; b++) {
        for (let d = b + 1; d <= ny; d++) {
          if (!clear(a, b, c, d) || (a > 0 && clear(a - 1, b, c, d)) || (c < nx && clear(a, b, c + 1, d)) || (b > 0 && clear(a, b - 1, c, d)) || (d < ny && clear(a, b, c, d + 1))) continue;
          out.push({ x0: xs[a], x1: xs[c], y0: ys[b], y1: ys[d] });
        }
      }
    }
  }
  return out;
}
function roofSubtract(ps, conditions) {
  let remainder = ps;
  const out = [];
  for (const value of conditions) {
    const outside = cleanPolygon(roofClip(remainder, p => -value(p)));
    if (outside.length >= 3) out.push(outside);
    remainder = cleanPolygon(roofClip(remainder, value));
    if (remainder.length < 3) break;
  }
  return out;
}
function roofSteppedFacets(e) {
  const c = roofSettings(e), frame = roofFrame(roofBoundary(e)), ps = roofBoundary(e).map(frame.local), rects = roofRectangles(ps), slope = Math.tan(c.pitch * Math.PI / 180), base = storyOf(e).elevation + heightOf(e), val = (p, f) => p.x * f.a + p.y * f.b + f.c;
  const domain = roofOffsetBoundary(e).map(frame.local), xmin = Math.min(...domain.map(p => p.x)), xmax = Math.max(...domain.map(p => p.x)), ymin = Math.min(...domain.map(p => p.y)), ymax = Math.max(...domain.map(p => p.y));
  const roofs = rects.map(r => ({
    boundary: [{ x: r.x0 - c.overhang, y: r.y0 - c.overhang }, { x: r.x1 + c.overhang, y: r.y0 - c.overhang }, { x: r.x1 + c.overhang, y: r.y1 + c.overhang }, { x: r.x0 - c.overhang, y: r.y1 + c.overhang }],
    planes: c.roofType === 'multiGable' ? (r.x1 - r.x0 >= r.y1 - r.y0 ? [{ a: 0, b: 1, c: -r.y0 }, { a: 0, b: -1, c: r.y1 }] : [{ a: 1, b: 0, c: -r.x0 }, { a: -1, b: 0, c: r.x1 }]) : [{ a: 1, b: 0, c: -r.x0 }, { a: -1, b: 0, c: r.x1 }, { a: 0, b: 1, c: -r.y0 }, { a: 0, b: -1, c: r.y1 }]
  }));
  const facets = [];
  if (c.roofType === 'multiGable') {
    for (const r of roofs) {
      if (r.planes[0].a === 0) { r.boundary[0].x = r.boundary[3].x = xmin; r.boundary[1].x = r.boundary[2].x = xmax; }
      else { r.boundary[0].y = r.boundary[1].y = ymin; r.boundary[2].y = r.boundary[3].y = ymax; }
    }
  }
  const seeds = c.roofType === 'multiGable' ? roofTriangles(domain) : null;
  roofs.forEach((r, ri) => r.planes.forEach((f, fi) => {
    let parts = (seeds || [r.boundary]).map(seed => {
      let poly = seed;
      if (seeds) {
        const b = r.boundary;
        for (const v of [p => b[0].x - p.x, p => p.x - b[1].x, p => b[0].y - p.y, p => p.y - b[2].y]) poly = roofClip(poly, v);
      }
      for (const g of r.planes) if (g !== f) poly = roofClip(poly, p => val(p, f) - val(p, g));
      return cleanPolygon(poly);
    }).filter(p => p.length >= 3);
    roofs.forEach((other, oi) => {
      if (oi === ri) return;
      const same = other.planes.some(g => Math.abs(g.a - f.a) + Math.abs(g.b - f.b) + Math.abs(g.c - f.c) < 0.001);
      if (same && oi > ri) return;
      const b = other.boundary;
      const conditions = [p => b[0].x - p.x, p => p.x - b[1].x, p => b[0].y - p.y, p => p.y - b[2].y, ...other.planes.filter(g => Math.abs(g.a - f.a) + Math.abs(g.b - f.b) + Math.abs(g.c - f.c) > 0.001).map(g => p => val(p, f) - val(p, g))];
      parts = parts.flatMap(p => roofSubtract(p, conditions));
    });
    for (const part of parts) facets.push(part.map(p => frame.world({ ...p, z: base + val(p, f) * slope })));
  }));
  return facets;
}
function roofPlanEdges(g) {
  const edges = new Map(), key = p => [p.x, p.y, p.z].map(n => Math.round(n * 100)).join(','), vertices = g.facets.flat();
  for (const ps of g.facets) {
    const n = surfaceNormal(ps);
    for (let i = 0; i < ps.length; i++) {
      const a = ps[i], b = ps[(i + 1) % ps.length];
      const points = [a, b, ...vertices.filter(p => {
        const d = segmentDistance(p, a, b);
        return d.t > 1e-6 && d.t < 1 - 1e-6 && d.distance < 0.01 && Math.abs(p.z - a.z - (b.z - a.z) * d.t) < 0.01;
      })].sort((p, q) => distance(a, p) - distance(a, q));
      for (let j = 0; j < points.length - 1; j++) {
        const p = points[j], q = points[j + 1];
        if (distance(p, q) < 0.01) continue;
        const k = [key(p), key(q)].sort().join('|'), old = edges.get(k);
        if (old) {
          if (Math.hypot(n.x - old.n.x, n.y - old.n.y, n.z - old.n.z) < 0.001) old.hide = true;
        } else edges.set(k, { a: p, b: q, n, hide: false });
      }
    }
  }
  return [...edges.values()].filter(e => !e.hide);
}
function roofDecomposeWings(points) {
  const ps = points.map(p => ({ ...p }));
  if (ps.length === 4) return [{ points: ps, area: Math.abs(area2(ps)), isMain: true }];
  const frame = roofFrame(ps), local = ps.map(frame.local), rects = roofRectangles(local);
  if (!rects.length) return [{ points: ps, area: Math.abs(area2(ps)), isMain: true }];
  const wings = rects.map(r => {
    const poly = [{ x: r.x0, y: r.y0 }, { x: r.x1, y: r.y0 }, { x: r.x1, y: r.y1 }, { x: r.x0, y: r.y1 }];
    return { points: poly.map(frame.world), area: (r.x1 - r.x0) * (r.y1 - r.y0), isMain: false };
  });
  wings.sort((a, b) => b.area - a.area);
  if (wings.length) wings[0].isMain = true;
  return wings;
}

// roof.js
function roofSettings(e) {
  return {
    roofType: e.roofType || 'hip',
    pitch: e.pitch ?? 25,
    overhang: e.overhang ?? 609.6,
    thickness: e.thickness ?? 200,
    roofAngle: e.roofAngle ?? 0
  };
}
function roofBoundary(e) {
  const points = e.points.map(p => Array.isArray(p) ? { x: p[0], y: p[1] } : { ...p });
  const ps = points.filter((p, i) => {
    const a = points[(i + points.length - 1) % points.length], b = points[(i + 1) % points.length];
    return Math.abs(cross2(sub2(p, a), sub2(b, p))) > 0.001;
  });
  return area2(ps) < 0 ? ps.reverse() : ps;
}
function validateRoof(e) {
  validateRoofFraming(e);
  if (e.roofOffset !== undefined && (!Number.isFinite(e.roofOffset) || Math.abs(e.roofOffset) > 50000)) throw Error('Invalid roof level offset.');
  const c = roofSettings(e), ps = e.points;
  if (!['hip', 'multiGable', 'gable', 'mono'].includes(c.roofType) || !Number.isFinite(c.pitch) || c.pitch < 0 || c.pitch > 80 || !Number.isFinite(c.overhang) || c.overhang < 0 || c.overhang > 5000 || !Number.isFinite(c.thickness) || c.thickness <= 0 || c.thickness > 2000 || !Number.isFinite(c.roofAngle)) throw Error('Roof requires pitch 0–80°, overhang 0–5000 mm and positive thickness.');
  if (!ps || ps.length < 3 || ps.length > 100 || ps.some(p => { const x = p.x ?? p[0], y = p.y ?? p[1]; return !Number.isFinite(x) || !Number.isFinite(y); }) || Math.abs(area2(roofBoundary(e))) < 100) throw Error('Draw a valid roof boundary.');
  const p = roofBoundary(e);
  if (p.length < 3 || !roofSimple(p)) throw Error('Roof boundary must be a simple polygon without crossing or touching edges.');
  if ((c.roofType === 'multiGable' || (!roofIsConvex(p) && c.roofType === 'hip')) && !roofOrthogonal(p)) throw Error('Multi-gable and concave hip roofs require right-angle corners. Use single-plane/gable for angled outlines.');
  if (!roofIsConvex(p) && p.length > 40) throw Error('Use up to 40 corners for a stepped roof.');
  const boundary = roofOffsetBoundary(e);
  if (!roofSimple(boundary) || Math.abs(area2(boundary)) < 100) throw Error('Overhang closes a roof recess. Reduce the overhang or widen the recess.');
}
function roofOffsetBoundary(e) {
  const c = roofSettings(e), pivot = roofBoundary(e);
  const planes = pivot.map((a, i) => {
    const b = pivot[(i + 1) % pivot.length], l = distance(a, b);
    const nx = -(b.y - a.y) / l, ny = (b.x - a.x) / l;
    return { a: nx, b: ny, c: -nx * a.x - ny * a.y };
  });
  return planes.map((f, i) => {
    const g = planes[(i + planes.length - 1) % planes.length], det = f.a * g.b - g.a * f.b;
    if (Math.abs(det) < 1e-8) return { ...pivot[i] };
    const fc = -f.c - c.overhang, gc = -g.c - c.overhang;
    return { x: (fc * g.b - gc * f.b) / det, y: (f.a * gc - g.a * fc) / det };
  });
}
function roofClip(ps, value) {
  const out = [];
  for (let i = 0; i < ps.length; i++) {
    const a = ps[i], b = ps[(i + 1) % ps.length], da = value(a), db = value(b);
    if (da <= 1e-7) out.push(a);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const t = da / (da - db);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ...(a.z !== undefined ? { z: a.z + (b.z - a.z) * t } : {}) });
    }
  }
  return out;
}
function roofGeometry(e) {
  const c = roofSettings(e), pivot = roofBoundary(e);
  const edgePlanes = pivot.map((a, i) => {
    const b = pivot[(i + 1) % pivot.length], l = distance(a, b);
    const nx = -(b.y - a.y) / l, ny = (b.x - a.x) / l;
    return { a: nx, b: ny, c: -nx * a.x - ny * a.y };
  });
  const distanceTo = (p, f) => p.x * f.a + p.y * f.b + f.c;
  const boundary = edgePlanes.map((f, i) => {
    const g = edgePlanes[(i + edgePlanes.length - 1) % edgePlanes.length], det = f.a * g.b - g.a * f.b;
    if (Math.abs(det) < 1e-8) return { ...pivot[i] };
    const fc = -f.c - c.overhang, gc = -g.c - c.overhang;
    return { x: (fc * g.b - gc * f.b) / det, y: (f.a * gc - g.a * fc) / det };
  });
  let planes = edgePlanes;
  if (c.roofType !== 'hip') {
    const angle = c.roofAngle * Math.PI / 180, n = { x: -Math.sin(angle), y: Math.cos(angle) };
    const values = pivot.map(p => p.x * n.x + p.y * n.y), lo = Math.min(...values), hi = Math.max(...values);
    planes = [{ a: n.x, b: n.y, c: -lo }];
    if (c.roofType === 'gable') planes.push({ a: -n.x, b: -n.y, c: hi });
  }
  const slope = Math.tan(c.pitch * Math.PI / 180), base = storyOf(e).elevation + heightOf(e), drop = c.thickness / Math.cos(c.pitch * Math.PI / 180), facets = [];
  if (c.roofType === 'multiGable' || (c.roofType === 'hip' && !roofIsConvex(pivot))) facets.push(...roofSteppedFacets(e));
  else {
    for (const seed of (roofIsConvex(boundary) ? [boundary] : roofTriangles(boundary))) {
      planes.forEach((f, i) => {
        let ps = seed;
        planes.forEach((g, j) => {
          if (i !== j) ps = roofClip(ps, p => distanceTo(p, f) - distanceTo(p, g));
        });
        ps = cleanPolygon(ps);
        if (ps.length >= 3 && Math.abs(area2(ps)) > 0.01) facets.push(ps.map(p => ({ ...p, z: base + distanceTo(p, f) * slope })));
      });
    }
  }
  const faces = [];
  for (const top of facets) {
    faces.push(top);
    faces.push(top.map(p => ({ ...p, z: p.z - drop })).reverse());
  }
  for (const top of facets) {
    for (let i = 0; i < top.length; i++) {
      const a = top[i], b = top[(i + 1) % top.length];
      if (boundary.some((p, j) => segmentDistance(a, p, boundary[(j + 1) % boundary.length]).distance < 0.01 && segmentDistance(b, p, boundary[(j + 1) % boundary.length]).distance < 0.01)) {
        faces.push([{ ...a, z: a.z - drop }, { ...b, z: b.z - drop }, b, a]);
      }
    }
  }
  return { boundary, facets, faces, drop, base };
}

// truss-joints.js
function uniqueTimberFaces(faces) {
  const key = f => f.map(v => [v.x, v.y, v.z].map(n => Math.round(n * 10) / 10).join(',')).sort().join('|');
  const seen = new Set();
  return faces.filter(f => {
    const k = key(f);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
const roofPerimeterRingCache = new WeakMap(), roofPerimeterEndpointCache = new WeakMap();
function isRoofPerimeterPlumbEnd(m, p) {
  if (!m || !(m.type === 'Rafter' || /top chord/i.test(m.type || ''))) return false;
  const endpointKey = p === m.a ? 'a' : p === m.b ? 'b' : `${p.x},${p.y}`;
  let memberCache = roofPerimeterEndpointCache.get(m);
  if (memberCache?.has(endpointKey)) return memberCache.get(endpointKey);
  let result = false;
  try {
    const roof = model?.elements?.find(e => e.type === 'roof' && e.id === (m.roofId || m.id));
    if (roof) {
      const signature = [roof.roofType, roof.overhang, roof.roofAngle, ...(roof.points || []).flatMap(q => [q.x ?? q[0], q.y ?? q[1]])].join('|');
      let cached = roofPerimeterRingCache.get(roof);
      if (!cached || cached.signature !== signature) {
        const g = roofGeometry(roof), rings = [g?.boundary, roofBoundary(roof)].filter(r => Array.isArray(r) && r.length >= 2);
        cached = { signature, rings };
        roofPerimeterRingCache.set(roof, cached);
      }
      const tol = Math.max(2.5, (m.width || 45) * 0.03);
      const dist2 = (p, a, b) => {
        const dx = b.x - a.x, dy = b.y - a.y, den = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, den ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / den : 0));
        return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
      };
      result = cached.rings.some(r => r.some((a, i) => dist2(p, a, r[(i + 1) % r.length]) <= tol));
    }
  } catch (_) { result = false; }
  if (!memberCache) { memberCache = new Map(); roofPerimeterEndpointCache.set(m, memberCache); }
  memberCache.set(endpointKey, result);
  return result;
}
function snapWebEndpointsToOwnChords(members, tolerance = 8) {
  const chords = members.filter(m => m.assembly && /top chord|bottom chord/i.test(m.type || ''));
  const pointSegment = (p, a, b) => {
    const d = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    const v = { x: p.x - a.x, y: p.y - a.y, z: p.z - a.z };
    const den = d.x * d.x + d.y * d.y + d.z * d.z;
    const t = Math.max(0, Math.min(1, den ? (v.x * d.x + v.y * d.y + v.z * d.z) / den : 0));
    return { t, p: { x: a.x + d.x * t, y: a.y + d.y * t, z: a.z + d.z * t } };
  };
  for (const m of members) {
    if (!m.assembly || /top chord|bottom chord/i.test(m.type || '')) continue;
    const own = chords.filter(c => c.assembly === m.assembly);
    if (!own.length) continue;
    for (const key of ['a', 'b']) {
      const p = m[key];
      let best = null;
      for (const c of own) {
        const hit = pointSegment(p, c.a, c.b), dist = Math.hypot(p.x - hit.p.x, p.y - hit.p.y, p.z - hit.p.z);
        if (dist <= tolerance && (!best || dist < best.dist)) best = { p: hit.p, dist };
      }
      if (best) m[key] = { ...best.p };
    }
  }
  return members;
}
function joinTrussMembers(members) {
  snapWebEndpointsToOwnChords(members);
  const groups = new Map();
  for (const m of members) if (m.assembly) {
    const group = groups.get(m.assembly) || [];
    group.push(m);
    groups.set(m.assembly, group);
  }
  const familyType = t => /top chord/i.test(t || '') ? 'top' : /bottom chord/i.test(t || '') ? 'bottom' : 'web';
  const typeRank = t => /^(Girder truss|Junction girder)/i.test(t || '') ? 4 : /^(Hip carrier|Hip truss)/i.test(t || '') ? 3 : /^(Front jack|Side jack)/i.test(t || '') ? 2 : 1;
  const pointSeg3 = (p, a, b) => {
    const d = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }, v = { x: p.x - a.x, y: p.y - a.y, z: p.z - a.z };
    const den = d.x * d.x + d.y * d.y + d.z * d.z, t = Math.max(0, Math.min(1, den ? ((v.x * d.x + v.y * d.y + v.z * d.z) / den) : 0));
    const q = { x: a.x + d.x * t, y: a.y + d.y * t, z: a.z + d.z * t };
    return Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);
  };
  const externalReceiver = (m, p) => {
    const family = familyType(m.type);
    if (family === 'web') return null;
    const bound = members.filter(q => q !== m && q.assembly && q.assembly !== m.assembly && q.assembly === m.receiverAssembly && familyType(q.type) === family);
    const candidates = bound.length ? bound : members.filter(q => q !== m && q.assembly && q.assembly !== m.assembly && familyType(q.type) === family && typeRank(q.type) > typeRank(m.type));
    return candidates.find(q => pointSeg3(p, q.a, q.b) <= (m.width + q.width) / 2 + 1) || null;
  };
  for (const group of groups.values()) {
    for (const m of group) {
      const topChord = /top chord/i.test(m.type || ''), botChord = /bottom chord/i.test(m.type || '');
      const cuts = {};
      for (const end of ['a', 'b']) {
        const p = m[end], otherEnd = end === 'a' ? m.b : m.a;
        if (isRoofPerimeterPlumbEnd(m, p)) {
          cuts[end] = { normal: { x: p.x - otherEnd.x, y: p.y - otherEnd.y, z: 0 }, planePoint: p, kind: 'plumb' };
          continue;
        }
        const ext = externalReceiver(m, p);
        if (ext) {
          const u = { x: ext.b.x - ext.a.x, y: ext.b.y - ext.a.y, z: ext.b.z - ext.a.z };
          const uL = Math.hypot(u.x, u.y, u.z) || 1, dir = { x: u.x / uL, y: u.y / uL, z: u.z / uL };
          const mDir = { x: p.x - otherEnd.x, y: p.y - otherEnd.y, z: p.z - otherEnd.z };
          const mL = Math.hypot(mDir.x, mDir.y, mDir.z) || 1, mUnit = { x: mDir.x / mL, y: mDir.y / mL, z: mDir.z / mL };
          const cross = { x: dir.y * mUnit.z - dir.z * mUnit.y, y: dir.z * mUnit.x - dir.x * mUnit.z, z: dir.x * mUnit.y - dir.y * mUnit.x };
          const cL = Math.hypot(cross.x, cross.y, cross.z) || 1, faceN = { x: cross.x / cL, y: cross.y / cL, z: cross.z / cL };
          cuts[end] = { normal: faceN, planePoint: p, kind: 'receiver' };
          continue;
        }
      }
      m.endCuts = cuts;
    }
  }
  return members;
}
function finishRoofConnections(members) { return members; }

// hip-trusses.js
function addAdvancedTrussWebPattern(topNodes, bottomNodes, pattern, depth, assembly, add, type = 'Truss web') {
  if (!Array.isArray(topNodes) || !Array.isArray(bottomNodes) || topNodes.length !== bottomNodes.length || topNodes.length < 2) return 0;
  const n = topNodes.length - 1, edges = new Set();
  let made = 0;
  const key = (a, b) => { const pt = p => [p.x, p.y, p.z].map(v => Math.round(v * 10)).join(','); return [pt(a), pt(b)].sort().join('|'); };
  const edge = (a, b) => {
    if (!a || !b) return;
    const L = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    if (L < Math.max(10, depth * 0.5)) return;
    const k = key(a, b);
    if (edges.has(k)) return;
    edges.add(k);
    add(type, a, b, depth, assembly);
    made++;
  };
  const post = i => edge(bottomNodes[i].p, topNodes[i].p), diag = (a, b) => edge(a, b);

  const p1 = topNodes[0].p, p2 = topNodes[topNodes.length - 1].p;
  const rawSpan = Math.hypot(p2.x - p1.x, (p2.y || 0) - (p1.y || 0), (p2.z || 0) - (p1.z || 0));
  const spanM = rawSpan > 50 ? rawSpan / 1000 : rawSpan;

  if (spanM < 1.2) {
    if (topNodes.length > 2) {
      const midIdx = Math.floor(topNodes.length / 2);
      post(midIdx);
    }
    return made;
  } else if (spanM < 2.2) {
    const midIdx = Math.floor(n / 2);
    post(midIdx);
    diag(bottomNodes[0].p, topNodes[midIdx].p);
    diag(bottomNodes[n].p, topNodes[midIdx].p);
    return made;
  }

  const mid = Math.round(n / 2), q1 = Math.max(1, Math.min(n - 1, Math.round(n / 3))), q2 = Math.max(q1 + 1, Math.min(n - 1, Math.round(2 * n / 3)));

  const pat = String(pattern || '').toLowerCase().replace(/[\s\-_]/g, '');

  if (pat.includes('howe')) {
    for (let i = 1; i < n; i++) post(i);
    for (let i = 0; i < n; i++) {
      if (i < mid) diag(bottomNodes[i].p, topNodes[i + 1].p);
      else diag(bottomNodes[i + 1].p, topNodes[i].p);
    }
  } else if (pat.includes('pratt')) {
    for (let i = 1; i < n; i++) post(i);
    for (let i = 0; i < n; i++) {
      if (i < mid) diag(topNodes[i].p, bottomNodes[i + 1].p);
      else diag(topNodes[i + 1].p, bottomNodes[i].p);
    }
  } else if (pat.includes('warren')) {
    for (let i = 0; i < n; i++) {
      if (i % 2 === 0) diag(bottomNodes[i].p, topNodes[i + 1].p);
      else diag(topNodes[i].p, bottomNodes[i + 1].p);
    }
    if (n % 2 === 1) post(mid);
  } else if (pat.includes('queen')) {
    post(q1); post(q2);
    diag(topNodes[0].p, bottomNodes[q1].p);
    diag(bottomNodes[q1].p, topNodes[mid].p);
    diag(topNodes[mid].p, bottomNodes[q2].p);
    diag(bottomNodes[q2].p, topNodes[n].p);
    if (mid !== q1 && mid !== q2) post(mid);
  } else if (pat.includes('king')) {
    post(mid);
    diag(topNodes[0].p, bottomNodes[mid].p);
    diag(bottomNodes[mid].p, topNodes[n].p);
    if (n > 2) {
      if (q1 > 0 && q1 < mid) diag(topNodes[q1].p, bottomNodes[mid].p);
      if (q2 > mid && q2 < n) diag(topNodes[q2].p, bottomNodes[mid].p);
    }
  } else if (pat.includes('attic')) {
    post(q1); post(q2);
    for (let i = 0; i < q1; i++) diag(bottomNodes[i].p, topNodes[i + 1].p);
    for (let i = q2; i < n; i++) diag(topNodes[i].p, bottomNodes[i + 1].p);
    edge(topNodes[q1].p, topNodes[q2].p);
  } else if (pat.includes('scissor')) {
    for (let i = 0; i < n; i++) {
      if (i < mid) diag(bottomNodes[i].p, topNodes[i + 1].p);
      else diag(topNodes[i].p, bottomNodes[i + 1].p);
    }
    post(mid);
  } else {
    // Standard Structural Fink W-Truss (Default)
    if (n <= 2) {
      post(mid);
      diag(bottomNodes[0].p, topNodes[mid].p);
      diag(bottomNodes[n].p, topNodes[mid].p);
    } else if (n <= 5) {
      const p1 = Math.max(1, Math.floor(n / 4) || 1);
      const p2 = n - p1;
      diag(bottomNodes[0].p, topNodes[p1].p);
      diag(topNodes[p1].p, bottomNodes[mid].p);
      diag(bottomNodes[mid].p, topNodes[p2].p);
      diag(topNodes[p2].p, bottomNodes[n].p);
    } else {
      const f1 = Math.max(1, Math.round(n / 4));
      const f2 = Math.min(n - 1, n - f1);
      diag(bottomNodes[0].p, topNodes[f1].p);
      post(f1);
      diag(bottomNodes[f1].p, topNodes[mid].p);
      diag(topNodes[f1].p, bottomNodes[mid].p);

      diag(bottomNodes[mid].p, topNodes[f2].p);
      post(f2);
      diag(bottomNodes[mid].p, bottomNodes[f2].p);
      diag(topNodes[f2].p, bottomNodes[n].p);
    }
  }
  return made;
}

function generateHipTrussSet(e, g, c, add, issues, wing = null) {
  const trussSpacing = Math.max(Number(c.spacing) || 600, 304.8);
  c = { ...c, spacing: trussSpacing };
  const p = wing?.points || roofBoundary(e);
  if (p.length !== 4) return false;
  const edges = p.map((a, i) => ({ x: p[(i + 1) % 4].x - a.x, y: p[(i + 1) % 4].y - a.y }));
  if (edges.some((a, i) => Math.abs(a.x * edges[(i + 1) % 4].x + a.y * edges[(i + 1) % 4].y) > Math.hypot(a.x, a.y) * Math.hypot(edges[(i + 1) % 4].x, edges[(i + 1) % 4].y) * 0.00001)) return false;

  const lengths = edges.map(d => Math.hypot(d.x, d.y));
  const longIdx = lengths[0] >= lengths[1] ? 0 : 1;
  const shortIdx = 1 - longIdx;
  const longL = lengths[longIdx], shortL = lengths[shortIdx];
  const ux = edges[longIdx].x / longL, uy = edges[longIdx].y / longL;
  const vx = edges[shortIdx].x / shortL, vy = edges[shortIdx].y / shortL;

  const origin = p[0];
  const toLocal = pt => {
    const dx = pt.x - origin.x, dy = pt.y - origin.y;
    return { u: dx * ux + dy * uy, v: dx * vx + dy * vy };
  };
  const toWorld = (u, v, z) => ({
    x: origin.x + u * ux + v * vx,
    y: origin.y + u * uy + v * vy,
    z
  });

  const pitchDeg = Number(c.pitch ?? e.pitch ?? roofSettings(e).pitch ?? 25);
  const slope = Math.tan(pitchDeg * Math.PI / 180);
  const base = storyOf(e).elevation + heightOf(e);
  const heel = c.heel || 300;
  const bottomZ = base;
  const girderSetback = Math.min(shortL / 2 - 200, Math.max(shortL * 0.25, c.hipSetback || 1828.8));

  // Girder at near hip end and far hip end
  const girderU1 = girderSetback;
  const girderU2 = longL - girderSetback;

  let trussIndex = 0;
  const makeId = (prefix) => `${e.id}-${prefix}${String(++trussIndex).padStart(3, '0')}`;

  const topAt = (u, v) => {
    const distU = Math.min(u, longL - u), distV = Math.min(v, shortL - v);
    const dist = Math.min(distU, distV);
    return base + heel + dist * slope;
  };

  function buildTruss(uPos, type, rolePrefix) {
    const id = makeId(rolePrefix);
    const count = c.panelCount || Math.max(4, Math.ceil(shortL / 1800));
    const topNodes = [], bottomNodes = [];
    const bA = toWorld(uPos, 0, bottomZ), bB = toWorld(uPos, shortL, bottomZ);
    add(`${type} bottom chord`, bA, bB, c.depth, id);

    for (let i = 0; i <= count; i++) {
      const v = shortL * i / count;
      const tZ = topAt(uPos, v);
      const bPt = toWorld(uPos, v, bottomZ);
      const tPt = toWorld(uPos, v, tZ);
      topNodes.push({ t: v, p: tPt });
      bottomNodes.push({ t: v, p: bPt });
    }
    for (let i = 0; i < count; i++) {
      add(`${type} top chord`, topNodes[i].p, topNodes[i + 1].p, c.depth, id);
    }
    if (topNodes.length >= 2) {
      addAdvancedTrussWebPattern(topNodes, bottomNodes, c.webPattern, c.webDepth, id, add, `${type} web`);
    }
    return id;
  }

  // 1. Near girder
  buildTruss(girderU1, 'Girder truss', 'G');
  // 2. Far girder
  buildTruss(girderU2, 'Girder truss', 'G');

  // 3. Common / hip trusses between girders
  let station = girderU1 + trussSpacing;
  while (station < girderU2 - trussSpacing * 0.75) {
    buildTruss(station, 'Common truss', 'T');
    station += trussSpacing;
  }

  // 4. Hip carriers / jack trusses at both hip ends
  // Hip carriers run diagonally or parallel in the hip zone
  const jackSpacing = Math.max(trussSpacing, 304.8);
  for (let u = jackSpacing; u < girderU1 - 100; u += jackSpacing) {
    // End jack truss across width
    buildTruss(u, 'Hip truss', 'HT');
  }
  for (let u = girderU2 + jackSpacing; u < longL - 100; u += jackSpacing) {
    buildTruss(u, 'Hip truss', 'HT');
  }

  // 5. Front jacks stepping from the eave corners
  for (let v = jackSpacing; v < shortL / 2 - 100; v += jackSpacing) {
    const id1 = makeId('FJ'), id2 = makeId('FJ');
    const b1A = toWorld(0, v, bottomZ), b1B = toWorld(girderU1, v, bottomZ);
    add('Front jack bottom chord', b1A, b1B, c.depth, id1);
    add('Front jack top chord', toWorld(0, v, topAt(0, v)), toWorld(girderU1, v, topAt(girderU1, v)), c.depth, id1);
    add('Front jack web', toWorld(girderU1 * 0.5, v, bottomZ), toWorld(girderU1 * 0.5, v, topAt(girderU1 * 0.5, v)), c.webDepth, id1);

    const b2A = toWorld(0, shortL - v, bottomZ), b2B = toWorld(girderU1, shortL - v, bottomZ);
    add('Front jack bottom chord', b2A, b2B, c.depth, id2);
    add('Front jack top chord', toWorld(0, shortL - v, topAt(0, shortL - v)), toWorld(girderU1, shortL - v, topAt(girderU1, shortL - v)), c.depth, id2);
    add('Front jack web', toWorld(girderU1 * 0.5, shortL - v, bottomZ), toWorld(girderU1 * 0.5, shortL - v, topAt(girderU1 * 0.5, shortL - v)), c.webDepth, id2);
  }

  return true;
}

function generateMultiWingTrusses(e, g, c, add, issues) {
  const p = roofBoundary(e);
  const wings = roofDecomposeWings(p);
  if (!wings.length) return false;
  if (wings.length === 1 && p.length === 4) {
    return generateHipTrussSet(e, g, c, add, issues);
  }
  let success = false;
  for (const wing of wings) {
    if (wing.points.length === 4) {
      if (generateHipTrussSet(e, g, c, add, issues, wing)) success = true;
    }
  }
  return success;
}

// roof-framing.js
const ROOF_FRAMING_DEFAULTS = {
  system: 'trusses',
  spacing: 600,
  width: 45,
  depth: 190,
  webDepth: 90,
  heel: 300,
  angle: 0,
  girderPlies: 2,
  hipSetback: 1828.8,
  webPattern: 'Fink',
  panelCount: 0,
  wingDirection: 'branch'
};

function roofFramingSettings(e) {
  const saved = e.roofFraming || {}, settings = { ...ROOF_FRAMING_DEFAULTS, ...saved };
  if (settings.system === 'trusses' && Number.isFinite(settings.spacing)) settings.spacing = Math.max(settings.spacing, 304.8);
  return settings;
}

function validateRoofFraming(e) {
  const c = roofFramingSettings(e);
  if (!['off', 'rafters', 'trusses'].includes(c.system) || !['spacing', 'width', 'depth', 'webDepth', 'heel', 'angle', 'panelCount'].every(k => Number.isFinite(c[k])) || typeof c.webPattern !== 'string' || !c.webPattern.trim() || !Number.isInteger(c.panelCount) || c.panelCount < 0 || c.panelCount > 24 || (c.panelCount > 0 && c.panelCount < 4) || c.spacing < 100 || c.spacing > 3000 || c.width < 20 || c.width > 300 || c.depth < 40 || c.depth > 1000 || c.webDepth < 40 || c.webDepth > 600 || c.heel < 0 || c.heel > 2000 || !Number.isInteger(c.girderPlies) || c.girderPlies < 1 || c.girderPlies > 4 || !Number.isFinite(c.hipSetback) || c.hipSetback < 400 || c.hipSetback > 10000 || !['branch', 'aligned'].includes(c.wingDirection)) {
    throw Error('Enter valid framing values. Panel count must be Auto (0) or 4–24; choose a supported web pattern.');
  }
}

function roofSection(ps, normal, station) {
  const out = [];
  for (let i = 0; i < ps.length; i++) {
    const a = ps[i], b = ps[(i + 1) % ps.length];
    const da = a.x * normal.x + a.y * normal.y - station, db = b.x * normal.x + b.y * normal.y - station;
    if (Math.abs(da) < 0.001) out.push(a);
    if (da * db < 0) {
      const t = da / (da - db);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z === undefined ? undefined : a.z + (b.z - a.z) * t });
    }
  }
  const tangent = { x: -normal.y, y: normal.x };
  return out.filter((p, i) => !out.slice(0, i).some(q => distance(p, q) < 0.01)).sort((a, b) => (a.x - b.x) * tangent.x + (a.y - b.y) * tangent.y);
}

function roofMemberFaces(m) {
  if (m.cutFaces) return m.cutFaces;
  const d = { x: m.b.x - m.a.x, y: m.b.y - m.a.y, z: m.b.z - m.a.z };
  const l = Math.hypot(d.x, d.y, d.z) || 1;
  const u = { x: d.x / l, y: d.y / l, z: d.z / l };
  const hl = Math.hypot(u.x, u.y);
  const v = hl > 0.00001 ? { x: -u.y / hl, y: u.x / hl, z: 0 } : { x: 1, y: 0, z: 0 };
  const n = { x: u.y * v.z - u.z * v.y, y: u.z * v.x - u.x * v.z, z: u.x * v.y - u.y * v.x };
  const ring = p => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => ({
    x: p.x + v.x * a * m.width / 2 + n.x * b * m.depth / 2,
    y: p.y + v.y * a * m.width / 2 + n.y * b * m.depth / 2,
    z: p.z + v.z * a * m.width / 2 + n.z * b * m.depth / 2
  }));
  const a = ring(m.a), b = ring(m.b);
  return [[...a].reverse(), b, ...a.map((_, i) => [a[i], a[(i + 1) % 4], b[(i + 1) % 4], b[i]])];
}

function extendTrussTopChordOverhangs(members, e, g, c) {
  const overhang = roofSettings(e).overhang;
  if (!(overhang > 0) || !g?.boundary?.length) return members;
  const pivot = roofBoundary(e), outer = g.boundary;
  const cross = (a, b) => a.x * b.y - a.y * b.x;
  const signedArea = pivot.reduce((sum, p, i) => sum + cross(p, pivot[(i + 1) % pivot.length]), 0) / 2;
  const distanceToRing = (p, ring) => ring.reduce((best, a, i) => Math.min(best, segmentDistance(p, a, ring[(i + 1) % ring.length]).distance), Infinity);

  function overhangHit(p, other) {
    const d = { x: p.x - other.x, y: p.y - other.y };
    if (Math.hypot(d.x, d.y) < 1e-6) return null;
    const hits = [];
    for (let i = 0; i < pivot.length; i++) {
      const edgeA = pivot[i], edgeB = pivot[(i + 1) % pivot.length];
      if (segmentDistance(p, edgeA, edgeB).distance > 0.75) continue;
      const ex = edgeB.x - edgeA.x, ey = edgeB.y - edgeA.y, el = Math.hypot(ex, ey) || 1;
      const n = signedArea >= 0 ? { x: ey / el, y: -ex / el } : { x: -ey / el, y: ex / el };
      const outward = d.x * n.x + d.y * n.y;
      if (outward <= 1e-5) continue;
      const t = overhang / outward;
      if (!(t > 0 && Number.isFinite(t))) continue;
      const candidate = { x: p.x + d.x * t, y: p.y + d.y * t };
      if (distanceToRing(candidate, outer) <= Math.max(3, overhang * 0.01)) hits.push({ ...candidate, t });
    }
    return hits.sort((a, b) => a.t - b.t)[0] || null;
  }

  return members.map(m => {
    if (!/top chord/i.test(m.type) || !m.a || !m.b) return m;
    let a = { ...m.a }, b = { ...m.b }, changed = false;
    const hitA = overhangHit(a, b);
    if (hitA) { a = { x: hitA.x, y: hitA.y, z: a.z + (a.z - b.z) * hitA.t }; changed = true; }
    const hitB = overhangHit(b, a);
    if (hitB) { b = { x: hitB.x, y: hitB.y, z: b.z + (b.z - a.z) * hitB.t }; changed = true; }
    if (!changed) return m;
    return { ...m, a, b, length: Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z), overhangExtended: true };
  });
}

function generateRoofFraming(e) {
  const raw = roofFramingSettings(e);
  const rSettings = roofSettings(e);
  const c = { ...raw, pitch: rSettings.pitch, spacing: raw.system === 'trusses' ? Math.max(raw.spacing, 304.8) : raw.spacing };
  const members = [], issues = [];
  if (c.system === 'off') return { members, issues };

  const g = roofGeometry(e);
  const slope = Math.cos((e.pitch ?? 25) * Math.PI / 180);
  const seen = new Set();

  function add(type, a, b, depth = c.depth, assembly = '', receiverAssembly = '', extra = {}) {
    if (!a || !b) return;
    const length = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
    if (length < 10) return;
    const point = p => [p.x, p.y, p.z].map(n => Math.round(n)).join(',');
    const key = [type, ...[point(a), point(b)].sort()].join('|');
    if (seen.has(key)) return;
    seen.add(key);
    members.push({
      id: e.id + ':RF-' + (members.length + 1),
      roofId: e.id,
      type,
      a,
      b,
      width: c.width,
      depth,
      length,
      section: c.width + ' × ' + depth,
      assembly,
      ...(receiverAssembly ? { receiverAssembly } : {}),
      ...extra
    });
  }

  const lower = p => ({ ...p, z: p.z - g.drop - c.depth / (2 * slope) });

  if (c.system === 'rafters') {
    for (const facet of g.facets) {
      const n = surfaceNormal(facet), h = Math.hypot(n.x, n.y);
      const normal = h > 0.0001 ? { x: -n.y / h, y: n.x / h } : { x: 1, y: 0 };
      const values = facet.map(p => p.x * normal.x + p.y * normal.y);
      const lo = Math.min(...values), hi = Math.max(...values);
      for (let t = lo + c.width / 2; t < hi - c.width / 2 + 0.001; t += c.spacing) {
        const cut = roofSection(facet, normal, t);
        if (cut.length >= 2) add('Rafter', lower(cut[0]), lower(cut.at(-1)));
      }
    }
    for (const edge of roofPlanEdges(g)) {
      const a = edge.a, b = edge.b;
      if (g.boundary.some((p, i) => segmentDistance(a, p, g.boundary[(i + 1) % g.boundary.length]).distance < 0.01 && segmentDistance(b, p, g.boundary[(i + 1) % g.boundary.length]).distance < 0.01)) continue;
      add(Math.abs(a.z - b.z) < 0.1 ? 'Ridge member' : 'Hip / valley member', lower(a), lower(b));
    }
  } else if (roofSettings(e).roofType === 'hip' && generateMultiWingTrusses(e, g, c, add, issues)) {
    issues.push('Hip truss layout is preliminary: bearings, connections, bracing and load capacities are not verified.');
  } else {
    if (e.roofType === 'hip') issues.push('Hip end assemblies require a rectangular footprint; this roof retains a preliminary sectional layout.');
    const angle = c.angle * Math.PI / 180, normal = { x: Math.cos(angle), y: Math.sin(angle) }, tangent = { x: -normal.y, y: normal.x };
    const dot = p => p.x * tangent.x + p.y * tangent.y;
    const pivot = roofBoundary(e);
    const values = pivot.map(p => p.x * normal.x + p.y * normal.y), lo = Math.min(...values), hi = Math.max(...values);
    let truss = 0;
    for (let station = lo + c.width / 2; station <= hi - c.width / 2; station += c.spacing) {
      const intersections = roofSection(pivot, normal, station);
      for (let k = 0; k + 1 < intersections.length; k += 2) {
        const left = dot(intersections[k]), right = dot(intersections[k + 1]);
        if (right - left < 2 * c.depth) continue;
        const assembly = e.id + '-T' + String(++truss).padStart(3, '0');
        const segments = [], bottomZ = g.base - g.drop - c.depth / (2 * slope);
        const heelAt = t => ({ x: normal.x * station + tangent.x * t, y: normal.y * station + tangent.y * t, z: bottomZ });
        for (const facet of g.facets) {
          const cut = roofSection(facet, normal, station);
          if (cut.length < 2) continue;
          let a = cut[0], b = cut.at(-1), x0 = dot(a), x1 = dot(b);
          let start = Math.max(left, x0), end = Math.min(right, x1);
          if (end - start < 1 || x1 - x0 < 1) continue;
          const at = t => ({ x: normal.x * station + tangent.x * t, y: normal.y * station + tangent.y * t, z: a.z + (b.z - a.z) * (t - x0) / (x1 - x0) - g.drop - c.depth / (2 * slope) });
          const chordAt = t => Math.abs(t - left) < 0.01 || Math.abs(t - right) < 0.01 ? heelAt(t) : at(t);
          segments.push({ start, end, at: chordAt });
          add('Truss top chord', chordAt(start), chordAt(end), c.depth, assembly);
        }
        const atBottom = heelAt, atTop = t => segments.find(s => t >= s.start - 0.01 && t <= s.end + 0.01)?.at(t);
        const count = c.panelCount || Math.max(4, Math.ceil((right - left) / 2400));
        add('Truss bottom chord', atBottom(left), atBottom(right), c.depth, assembly);
        const topNodes = [], bottomNodes = [];
        for (let i = 0; i <= count; i++) {
          const t = left + (right - left) * i / count, top = atTop(t);
          if (top) {
            topNodes.push({ t, p: top });
            bottomNodes.push({ t, p: atBottom(t) });
          }
        }
        if (topNodes.length >= 2) addAdvancedTrussWebPattern(topNodes, bottomNodes, c.webPattern, c.webDepth, assembly, add, 'Truss web');
      }
    }
  }

  const extended = extendTrussTopChordOverhangs(members, e, g, c);
  const joined = joinTrussMembers(extended);
  return { members: joined, issues: [...new Set(issues)] };
}

// Helper: Convert Roof Engine output to CadTech Assembly format (in meters)
function convertRoofEngineToAssembly(e, framingResult, geometryResult) {
  const members = framingResult.members || [];
  const facets = geometryResult.facets || [];

  // 1. Group members by assembly
  const groups = new Map();
  const unassigned = [];
  for (const m of members) {
    if (m.assembly) {
      const list = groups.get(m.assembly) || [];
      list.push(m);
      groups.set(m.assembly, list);
    } else {
      unassigned.push(m);
    }
  }

  const toM = p => [p.x / 1000, p.y / 1000, p.z / 1000];

  const trusses = [];
  let tCounter = 0;

  for (const [asmId, mList] of groups.entries()) {
    tCounter++;
    // Determine truss type
    let trussType = 'Common';
    const types = mList.map(m => m.type);
    if (types.some(t => /Girder/i.test(t))) trussType = 'Girder';
    else if (types.some(t => /Junction/i.test(t))) trussType = 'Girder';
    else if (types.some(t => /Hip carrier/i.test(t))) trussType = 'Hip carrier';
    else if (types.some(t => /Front jack/i.test(t))) trussType = 'Front jack';
    else if (types.some(t => /Side jack/i.test(t))) trussType = 'Side jack';
    else if (types.some(t => /Hip truss/i.test(t))) trussType = 'Stepdown';
    else if (types.some(t => /Common/i.test(t))) trussType = 'Common';

    // Build member objects in meters
    const cadMembers = mList.map((m, idx) => {
      let role = 'web';
      if (/top chord/i.test(m.type)) role = 'top';
      else if (/bottom chord/i.test(m.type)) role = 'bottom';
      else if (/web/i.test(m.type)) role = 'web';
      else if (/overhang/i.test(m.type)) role = 'overhang';
      else role = 'rafter';

      const solidFaces = roofMemberFaces(m);
      const solidTriangles = [];
      for (const face of solidFaces) {
        for (let i = 1; i < face.length - 1; i++) {
          const p0 = toM(face[0]), p1 = toM(face[i]), p2 = toM(face[i + 1]);
          if (p0.every(Number.isFinite) && p1.every(Number.isFinite) && p2.every(Number.isFinite)) {
            solidTriangles.push(p0, p1, p2);
          }
        }
      }

      return {
        id: m.id || `${asmId}:M${idx + 1}`,
        a: toM(m.a),
        b: toM(m.b),
        role,
        widthM: (m.width || 45) / 1000,
        depthM: (m.depth || 190) / 1000,
        length: m.length / 1000,
        sectionName: `${(m.width || 45) <= 50 ? '2x' : '4x'}${Math.round((m.depth || 190) / 25.4)}`,
        solidTriangles,
        type: m.type
      };
    });

    // Compute profile and span
    const allPts = cadMembers.flatMap(m => [m.a, m.b]);
    const minZ = Math.min(...allPts.map(p => p[2])), maxZ = Math.max(...allPts.map(p => p[2]));
    const botChords = cadMembers.filter(m => m.role === 'bottom');
    let span = 1;
    if (botChords.length) {
      const bPts = botChords.flatMap(m => [m.a, m.b]);
      const minX = Math.min(...bPts.map(p => p[0])), maxX = Math.max(...bPts.map(p => p[0]));
      const minY = Math.min(...bPts.map(p => p[1])), maxY = Math.max(...bPts.map(p => p[1]));
      span = Math.hypot(maxX - minX, maxY - minY) || 1;
    } else {
      const minX = Math.min(...allPts.map(p => p[0])), maxX = Math.max(...allPts.map(p => p[0]));
      const minY = Math.min(...allPts.map(p => p[1])), maxY = Math.max(...allPts.map(p => p[1]));
      span = Math.hypot(maxX - minX, maxY - minY) || 1;
    }

    const cleanId = `T${String(tCounter).padStart(2, '0')}`;
    const midPoint = allPts[Math.floor(allPts.length / 2)] || [0, 0, minZ];

    trusses.push({
      id: cleanId,
      originalAssemblyId: asmId,
      type: trussType,
      ply: trussType === 'Girder' ? (e.roofFraming?.girderPlies || 2) : 1,
      span,
      height: Math.max(0.2, maxZ - minZ),
      profile: [allPts[0] || [0, 0, minZ], midPoint, allPts.at(-1) || [span, 0, minZ]],
      members: cadMembers
    });
  }

  // Handle unassigned rafters (e.g. in conventional rafter mode)
  const rafters = unassigned.map((m, idx) => {
    const solidFaces = roofMemberFaces(m);
    const solidTriangles = [];
    for (const face of solidFaces) {
      for (let i = 1; i < face.length - 1; i++) {
        const p0 = toM(face[0]), p1 = toM(face[i]), p2 = toM(face[i + 1]);
        if (p0.every(Number.isFinite) && p1.every(Number.isFinite) && p2.every(Number.isFinite)) {
          solidTriangles.push(p0, p1, p2);
        }
      }
    }
    return {
      id: m.id || `R${String(idx + 1).padStart(3, '0')}`,
      type: m.type,
      a: toM(m.a),
      b: toM(m.b),
      widthM: (m.width || 45) / 1000,
      depthM: (m.depth || 190) / 1000,
      length: m.length / 1000,
      solidTriangles
    };
  });

  // Convert roof facets for 3D display
  const roofFacets = facets.map(facet => facet.map(p => ({ x: p.x / 1000, y: p.y / 1000, z: p.z / 1000 })));

  // Bounding box in meters
  const bPoints = (geometryResult.boundary || roofBoundary(e)).map(toM);
  const xs = bPoints.map(p => p[0]), ys = bPoints.map(p => p[1]);
  const bounds = [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 3.5];

  const counts = {};
  if (trusses.length) {
    for (const t of trusses) {
      counts[t.type] = (counts[t.type] || 0) + 1;
    }
  } else if (rafters.length) {
    for (const r of rafters) {
      counts[r.type] = (counts[r.type] || 0) + 1;
    }
  }

  return {
    trusses,
    rafters,
    roofFacets,
    bounds,
    origin: [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, 0],
    counts,
    covered: trusses.length || rafters.length,
    sourceAxisCount: trusses.length || rafters.length,
    source: { bounds, axes: rafters.map(r => ({ a: r.a, b: r.b })) }
  };
}

export const typeColors = {
  Common: '#bfe96e', Stepdown: '#54caba', Girder: '#ffba67',
  'Front jack': '#66afff', 'Side jack': '#b9a0ff', 'Hip carrier': '#ee91b9',
  Mono: '#66afff', Unclassified: '#c4ced7', Fink: '#bfe96e',
  Howe: '#54caba', Pratt: '#38bdf8', Scissors: '#f59e0b',
  Attic: '#a855f7', KingPost: '#ec4899', QueenPost: '#10b981',
  Warren: '#06b6d4', Monopitch: '#66afff', Rafter: '#d9b38c',
  Ridge: '#f59e0b', 'Hip/Valley': '#06b6d4', 'Ridge member': '#f59e0b',
  'Hip / valley member': '#06b6d4'
};

export {
  model,
  setHostModel,
  getHostModel,
  roofSettings,
  roofBoundary,
  roofOffsetBoundary,
  validateRoof,
  roofGeometry,
  roofPlanEdges,
  roofDecomposeWings,
  ROOF_FRAMING_DEFAULTS,
  roofFramingSettings,
  validateRoofFraming,
  generateRoofFraming,
  roofMemberFaces,
  convertRoofEngineToAssembly
};

