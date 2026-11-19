/* ArchiCAD-Exact "Trim Elements to Roof" & "Solid Element Operations (SEO)" Engine + UI
   - Exact 3D BSP-Tree CSG Boolean & Roof-Plane Slicing Engine (units: mm, Z up)
   - Supports:
     1) Trim Elements to Roof:
        - Trim Top (keep below roof) / Trim Base (keep above roof) / Clear Trim
        - Trimming Reference: Roof Bottom Surface (Soffit) vs Roof Top Surface
        - Vertical Offset (mm), Extend Roof Planes (infinite), Extend Shorter Elements to Peak
        - Associative updating when roof pitch/height/shape or target geometry changes
        - Live Wall Framing integration (clips studs & generates raked top plates)
     2) Solid Element Operations (SEO) Modeless Floating Palette:
        - Get Target Elements / Get Operator Elements (works from 2D Plan & 3D Viewport selections)
        - All 5 ArchiCAD Operations:
          * Subtraction
          * Subtraction with upward extrusion
          * Subtraction with downward extrusion
          * Intersection
          * Addition
        - Cut Surface Attribute Inheritance:
          * Inherit attributes from Operator
          * Use Target's own attributes
        - Associative SEO Links stored in model.seoOperations (Maintain Operations & Cancel Links)
*/
(function (global) {
  'use strict';

  const CSG_EPS = 0.02; // mm tolerance for millimeter-scale architectural solids
  const MAX_BSP_DEPTH = 48;

  const MATERIALS_HEX = {
    Timber: '#d0c4a5',
    Concrete: '#b8c4bc',
    Oak: '#b9936c',
    Glass: '#8fc1c6',
    Steel: '#7a8ea3',
    Brick: '#b91c1c',
    Stone: '#78716c'
  };

  // ---------------- 3D Vector & Plane Math ----------------
  const v3sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
  const v3add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
  const v3dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const v3cross = (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  });
  const v3len = (v) => Math.hypot(v.x, v.y, v.z);
  const v3lerp = (a, b, t) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t
  });

  function newellNormal(verts) {
    let nx = 0, ny = 0, nz = 0;
    const n = verts.length;
    for (let i = 0; i < n; i++) {
      const a = verts[i], b = verts[(i + 1) % n];
      nx += (a.y - b.y) * (a.z + b.z);
      ny += (a.z - b.z) * (a.x + b.x);
      nz += (a.x - b.x) * (a.y + b.y);
    }
    const len = Math.hypot(nx, ny, nz);
    return { normal: len > 1e-10 ? { x: nx / len, y: ny / len, z: nz / len } : null, area2: len };
  }

  function cleanVerts3(verts) {
    if (!Array.isArray(verts) || verts.length < 3) return [];
    const out = [];
    for (const v of verts) {
      if (!v || !Number.isFinite(v.x) || !Number.isFinite(v.y) || !Number.isFinite(v.z)) continue;
      if (!out.length || Math.hypot(v.x - out[out.length - 1].x, v.y - out[out.length - 1].y, v.z - out[out.length - 1].z) > 0.05) {
        out.push({ x: v.x, y: v.y, z: v.z });
      }
    }
    if (out.length > 2 && Math.hypot(out[0].x - out[out.length - 1].x, out[0].y - out[out.length - 1].y, out[0].z - out[out.length - 1].z) <= 0.05) {
      out.pop();
    }
    return out.length >= 3 ? out : [];
  }

  function makePlane(normal, w) {
    return { normal: { x: normal.x, y: normal.y, z: normal.z }, w };
  }

  function flipPlane(plane) {
    return { normal: { x: -plane.normal.x, y: -plane.normal.y, z: -plane.normal.z }, w: -plane.w };
  }

  function makePolygon3(rawVerts, meta = {}) {
    const vertices = cleanVerts3(rawVerts);
    if (vertices.length < 3) return null;
    const { normal, area2 } = newellNormal(vertices);
    if (!normal || area2 < 0.5) return null;
    const plane = meta.plane ? { normal: { ...meta.plane.normal }, w: meta.plane.w } : makePlane(normal, v3dot(normal, vertices[0]));
    return {
      vertices,
      plane,
      material: meta.material || 'Timber',
      ownerId: meta.ownerId || null,
      ownerType: meta.ownerType || null,
      isCut: Boolean(meta.isCut),
      seoMaterial: meta.seoMaterial || null,
      seoType: meta.seoType || null,
      seoColor: meta.seoColor || null
    };
  }

  function clonePoly3(p, overrideMeta = null) {
    return {
      vertices: p.vertices.map(v => ({ x: v.x, y: v.y, z: v.z })),
      plane: { normal: { ...p.plane.normal }, w: p.plane.w },
      material: overrideMeta?.material ?? p.material,
      ownerId: overrideMeta?.ownerId ?? p.ownerId,
      ownerType: overrideMeta?.ownerType ?? p.ownerType,
      isCut: overrideMeta?.isCut ?? p.isCut,
      seoMaterial: overrideMeta?.seoMaterial !== undefined ? overrideMeta.seoMaterial : p.seoMaterial,
      seoType: overrideMeta?.seoType !== undefined ? overrideMeta.seoType : p.seoType,
      seoColor: overrideMeta?.seoColor !== undefined ? overrideMeta.seoColor : p.seoColor
    };
  }

  function flipPoly3(p) {
    return {
      ...p,
      vertices: [...p.vertices].reverse().map(v => ({ x: v.x, y: v.y, z: v.z })),
      plane: flipPlane(p.plane)
    };
  }

  function splitPolygonByPlane(plane, polygon, coplanarFront, coplanarBack, front, back) {
    const COPLANAR = 0, FRONT = 1, BACK = 2, SPANNING = 3;
    let polygonType = 0;
    const types = [];
    const verts = polygon.vertices;
    for (let i = 0; i < verts.length; i++) {
      const t = v3dot(plane.normal, verts[i]) - plane.w;
      const type = t < -CSG_EPS ? BACK : (t > CSG_EPS ? FRONT : COPLANAR);
      polygonType |= type;
      types.push(type);
    }

    switch (polygonType) {
      case COPLANAR:
        (v3dot(plane.normal, polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
        break;
      case FRONT:
        front.push(polygon);
        break;
      case BACK:
        back.push(polygon);
        break;
      case SPANNING: {
        const f = [], b = [];
        for (let i = 0; i < verts.length; i++) {
          const j = (i + 1) % verts.length;
          const ti = types[i], tj = types[j];
          const vi = verts[i], vj = verts[j];
          if (ti !== BACK) f.push(vi);
          if (ti !== FRONT) b.push(vi);
          if ((ti | tj) === SPANNING) {
            const denom = v3dot(plane.normal, v3sub(vj, vi));
            const t = Math.abs(denom) > 1e-12 ? Math.max(0, Math.min(1, (plane.w - v3dot(plane.normal, vi)) / denom)) : 0.5;
            const v = v3lerp(vi, vj, t);
            f.push(v);
            b.push(v);
          }
        }
        if (f.length >= 3) {
          const fp = makePolygon3(f, { ...polygon, plane: polygon.plane });
          if (fp) front.push(fp);
        }
        if (b.length >= 3) {
          const bp = makePolygon3(b, { ...polygon, plane: polygon.plane });
          if (bp) back.push(bp);
        }
        break;
      }
    }
  }

  // ---------------- 3D BSP Tree ----------------
  class BSPNode {
    constructor(polygons = null, depth = 0) {
      this.plane = null;
      this.front = null;
      this.back = null;
      this.polygons = [];
      this.depth = depth;
      if (polygons && polygons.length) this.build(polygons);
    }

    clone() {
      const n = new BSPNode(null, this.depth);
      n.plane = this.plane ? { normal: { ...this.plane.normal }, w: this.plane.w } : null;
      n.polygons = this.polygons.map(p => clonePoly3(p));
      n.front = this.front ? this.front.clone() : null;
      n.back = this.back ? this.back.clone() : null;
      return n;
    }

    invert() {
      for (let i = 0; i < this.polygons.length; i++) {
        this.polygons[i] = flipPoly3(this.polygons[i]);
      }
      if (this.plane) this.plane = flipPlane(this.plane);
      if (this.front) this.front.invert();
      if (this.back) this.back.invert();
      const tmp = this.front;
      this.front = this.back;
      this.back = tmp;
    }

    clipPolygons(polygons) {
      if (!this.plane) return polygons.slice();
      let front = [], back = [];
      for (let i = 0; i < polygons.length; i++) {
        splitPolygonByPlane(this.plane, polygons[i], front, back, front, back);
      }
      if (this.front) front = this.front.clipPolygons(front);
      if (this.back) back = this.back.clipPolygons(back);
      else back = [];
      return front.concat(back);
    }

    clipTo(bsp) {
      this.polygons = bsp.clipPolygons(this.polygons);
      if (this.front) this.front.clipTo(bsp);
      if (this.back) this.back.clipTo(bsp);
    }

    allPolygons() {
      let polys = this.polygons.slice();
      if (this.front) polys = polys.concat(this.front.allPolygons());
      if (this.back) polys = polys.concat(this.back.allPolygons());
      return polys;
    }

    pickBestSplitter(polygons) {
      // Pick axis-aligned or minimum-split candidate among sample to minimize BSP splits
      if (polygons.length <= 6) return polygons[0];
      const step = Math.max(1, Math.floor(polygons.length / 8));
      let best = polygons[0];
      let bestScore = Infinity;
      for (let idx = 0; idx < polygons.length; idx += step) {
        const cand = polygons[idx];
        let splits = 0, bal = 0;
        for (let k = 0; k < polygons.length; k++) {
          if (k === idx) continue;
          const vs = polygons[k].vertices;
          let hasF = false, hasB = false;
          for (let vi = 0; vi < vs.length; vi++) {
            const d = v3dot(cand.plane.normal, vs[vi]) - cand.plane.w;
            if (d > CSG_EPS) hasF = true;
            else if (d < -CSG_EPS) hasB = true;
          }
          if (hasF && hasB) splits++;
          else if (hasF) bal++;
          else if (hasB) bal--;
        }
        const axBonus = (Math.abs(cand.plane.normal.x) > 0.99 || Math.abs(cand.plane.normal.y) > 0.99 || Math.abs(cand.plane.normal.z) > 0.99) ? -0.5 : 0;
        const score = splits * 3 + Math.abs(bal) * 0.4 + axBonus;
        if (score < bestScore) {
          bestScore = score;
          best = cand;
        }
      }
      return best;
    }

    build(polygons) {
      if (!polygons.length) return;
      if (this.depth >= MAX_BSP_DEPTH) {
        this.polygons.push(...polygons);
        return;
      }
      if (!this.plane) {
        const splitter = this.pickBestSplitter(polygons);
        this.plane = { normal: { ...splitter.plane.normal }, w: splitter.plane.w };
      }
      const front = [], back = [];
      for (let i = 0; i < polygons.length; i++) {
        splitPolygonByPlane(this.plane, polygons[i], this.polygons, this.polygons, front, back);
      }
      if (front.length) {
        if (!this.front) this.front = new BSPNode(null, this.depth + 1);
        this.front.build(front);
      }
      if (back.length) {
        if (!this.back) this.back = new BSPNode(null, this.depth + 1);
        this.back.build(back);
      }
    }
  }

  function polyBounds3(polys) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const p of polys) {
      for (const v of p.vertices) {
        if (v.x < minX) minX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.z < minZ) minZ = v.z;
        if (v.x > maxX) maxX = v.x;
        if (v.y > maxY) maxY = v.y;
        if (v.z > maxZ) maxZ = v.z;
      }
    }
    return { minX, minY, minZ, maxX, maxY, maxZ, empty: minX > maxX };
  }

  function boundsOverlap3(a, b, tol = 0.5) {
    if (!a || !b || a.empty || b.empty) return false;
    return (
      a.minX <= b.maxX + tol && a.maxX >= b.minX - tol &&
      a.minY <= b.maxY + tol && a.maxY >= b.minY - tol &&
      a.minZ <= b.maxZ + tol && a.maxZ >= b.minZ - tol
    );
  }

  function csgSubtractPolys(polysA, polysB) {
    if (!polysA.length || !polysB.length) return polysA;
    if (!boundsOverlap3(polyBounds3(polysA), polyBounds3(polysB))) return polysA;
    const a = new BSPNode(polysA.map(p => clonePoly3(p)));
    const b = new BSPNode(polysB.map(p => clonePoly3(p)));
    a.invert();
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    a.invert();
    return a.allPolygons();
  }

  function csgIntersectPolys(polysA, polysB) {
    if (!polysA.length || !polysB.length) return [];
    if (!boundsOverlap3(polyBounds3(polysA), polyBounds3(polysB))) return [];
    const a = new BSPNode(polysA.map(p => clonePoly3(p)));
    const b = new BSPNode(polysB.map(p => clonePoly3(p)));
    a.invert();
    b.clipTo(a);
    b.invert();
    a.clipTo(b);
    b.clipTo(a);
    a.build(b.allPolygons());
    a.invert();
    return a.allPolygons();
  }

  function csgUnionPolys(polysA, polysB) {
    if (!polysA.length) return polysB;
    if (!polysB.length) return polysA;
    if (!boundsOverlap3(polyBounds3(polysA), polyBounds3(polysB))) return polysA.concat(polysB);
    const a = new BSPNode(polysA.map(p => clonePoly3(p)));
    const b = new BSPNode(polysB.map(p => clonePoly3(p)));
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    return a.allPolygons();
  }

  // ---------------- 2D Convexity / Triangulation Helper for Concave Extrusions ----------------
  function area2D(ps) {
    let s = 0;
    for (let i = 0; i < ps.length; i++) {
      const a = ps[i], b = ps[(i + 1) % ps.length];
      s += a.x * b.y - b.x * a.y;
    }
    return s / 2;
  }

  function isConvex2D(ps) {
    const n = ps.length;
    if (n <= 3) return true;
    let sign = 0;
    for (let i = 0; i < n; i++) {
      const a = ps[i], b = ps[(i + 1) % n], c = ps[(i + 2) % n];
      const cr = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
      if (Math.abs(cr) > 1e-6) {
        if (!sign) sign = cr > 0 ? 1 : -1;
        else if (cr * sign < 0) return false;
      }
    }
    return true;
  }

  function triangulate2D(ps) {
    const n = ps.length;
    if (n < 3) return [];
    if (n === 3) return [[ps[0], ps[1], ps[2]]];
    const pts = area2D(ps) < 0 ? [...ps].reverse() : [...ps];
    const idx = pts.map((_, i) => i);
    const tris = [];
    const inTri = (p, a, b, c) => {
      const d1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
      const d2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y);
      const d3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y);
      return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
    };
    let guard = 0;
    while (idx.length > 3 && guard++ < 128) {
      let clipped = false;
      for (let k = 0; k < idx.length; k++) {
        const i0 = idx[(k + idx.length - 1) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length];
        const a = pts[i0], b = pts[i1], c = pts[i2];
        if ((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) <= 1e-6) continue;
        let empty = true;
        for (const j of idx) {
          if (j === i0 || j === i1 || j === i2) continue;
          if (inTri(pts[j], a, b, c)) { empty = false; break; }
        }
        if (empty) {
          tris.push([a, b, c]);
          idx.splice(k, 1);
          clipped = true;
          break;
        }
      }
      if (!clipped) break;
    }
    if (idx.length === 3) tris.push([pts[idx[0]], pts[idx[1]], pts[idx[2]]]);
    else for (let k = 1; k + 1 < idx.length; k++) tris.push([pts[idx[0]], pts[idx[k]], pts[idx[k + 1]]]);
    return tris;
  }

  // Build watertight outward-oriented closed polyhedron polygons from 2D polygon + [z0, z1]
  function extrudePrismPolys(rawPs, z0, z1, meta = {}) {
    if (!Array.isArray(rawPs) || rawPs.length < 3 || z1 - z0 <= 0.1) return [];
    let ps = typeof cleanPolygon === 'function' ? cleanPolygon(rawPs) : rawPs.map(p => ({ x: p.x, y: p.y }));
    if (ps.length < 3) return [];
    if (area2D(ps) < 0) ps = [...ps].reverse();
    const out = [];
    const caps = isConvex2D(ps) ? [ps] : triangulate2D(ps);
    for (const cap of caps) {
      const top = makePolygon3(cap.map(p => ({ x: p.x, y: p.y, z: z1 })), meta);
      const bot = makePolygon3([...cap].reverse().map(p => ({ x: p.x, y: p.y, z: z0 })), meta);
      if (top) out.push(top);
      if (bot) out.push(bot);
    }
    for (let i = 0; i < ps.length; i++) {
      const a = ps[i], b = ps[(i + 1) % ps.length];
      const side = makePolygon3([
        { x: a.x, y: a.y, z: z0 },
        { x: b.x, y: b.y, z: z0 },
        { x: b.x, y: b.y, z: z1 },
        { x: a.x, y: a.y, z: z1 }
      ], meta);
      if (side) out.push(side);
    }
    return out;
  }

  // Build watertight closed prism between a sloped top 3D polygon & corresponding bottom 3D polygon
  function makeSlopedPrismPolys(topVerts, botVerts, meta = {}) {
    if (!topVerts || !botVerts || topVerts.length < 3 || topVerts.length !== botVerts.length) return [];
    const ps2 = topVerts.map(p => ({ x: p.x, y: p.y }));
    const rev = area2D(ps2) < 0;
    const tList = rev ? [...topVerts].reverse() : topVerts;
    const bList = rev ? [...botVerts].reverse() : botVerts;
    const out = [];
    if (isConvex2D(tList.map(p => ({ x: p.x, y: p.y })))) {
      const topF = makePolygon3(tList, meta);
      const botF = makePolygon3([...bList].reverse(), meta);
      if (topF) out.push(topF);
      if (botF) out.push(botF);
    } else {
      // Triangulate in 2D and interpolate exact vertex Z from plane
      const planeTop = newellNormal(tList).normal;
      const wTop = planeTop ? v3dot(planeTop, tList[0]) : 0;
      const planeBot = newellNormal(bList).normal;
      const wBot = planeBot ? v3dot(planeBot, bList[0]) : 0;
      const zOn = (pl, w, pt, fallbackZ) => (pl && Math.abs(pl.z) > 1e-5) ? (w - pl.x * pt.x - pl.y * pt.y) / pl.z : fallbackZ;
      for (const tri of triangulate2D(tList.map(p => ({ x: p.x, y: p.y })))) {
        const tf = makePolygon3(tri.map(p => ({ x: p.x, y: p.y, z: zOn(planeTop, wTop, p, tList[0].z) })), meta);
        const bf = makePolygon3([...tri].reverse().map(p => ({ x: p.x, y: p.y, z: zOn(planeBot, wBot, p, bList[0].z) })), meta);
        if (tf) out.push(tf);
        if (bf) out.push(bf);
      }
    }
    const n = tList.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const side = makePolygon3([
        { x: bList[i].x, y: bList[i].y, z: bList[i].z },
        { x: bList[j].x, y: bList[j].y, z: bList[j].z },
        { x: tList[j].x, y: tList[j].y, z: tList[j].z },
        { x: tList[i].x, y: tList[i].y, z: tList[i].z }
      ], meta);
      if (side) out.push(side);
    }
    return out;
  }

  // ---------------- Element -> Closed Solid3[] Converter ----------------
  function storyElevationOf(el, mRef) {
    const m = mRef || global.model;
    const st = m?.stories?.find(s => s.id === el.story) || m?.stories?.[0];
    return st?.elevation || 0;
  }

  function elemHeightOf(el, mRef) {
    if (typeof global.heightOf === 'function') return global.heightOf(el);
    const m = mRef || global.model;
    const st = m?.stories?.find(s => s.id === el.story) || m?.stories?.[0];
    return el.followStory ? (st?.height || 3048) : (el.height ?? 3000);
  }

  function computeRoofMaxTopZ(roofIds, mRef) {
    const m = mRef || global.model;
    const ids = Array.isArray(roofIds) && roofIds.length ? new Set(roofIds) : null;
    let maxZ = -Infinity;
    for (const r of (m?.elements || []).filter(e => e.type === 'roof' && (!ids || ids.has(e.id)))) {
      if (typeof global.roofGeometry === 'function') {
        try {
          const g = global.roofGeometry(r);
          for (const f of g.facets) for (const p of f) if (p.z > maxZ) maxZ = p.z;
        } catch (_) {}
      }
    }
    return Number.isFinite(maxZ) ? maxZ : null;
  }

  function elementToSolids(el, mRef, opts = {}) {
    const m = mRef || global.model;
    if (!el || !m) return [];
    const meta = {
      material: opts.overrideMaterial || el.material || 'Timber',
      ownerId: el.id,
      ownerType: el.type,
      isCut: Boolean(opts.isCut),
      seoMaterial: opts.seoMaterial || null,
      seoType: opts.seoType || null,
      seoColor: opts.seoColor || null
    };
    const z = storyElevationOf(el, m);

    if (el.type === 'wall') {
      const cells = typeof global.wallRawCells === 'function' ? global.wallRawCells(el) : [];
      if (!cells.length && el.a && el.b && typeof global.wallPoly === 'function') {
        const wb = typeof global.wallBase === 'function' ? global.wallBase(el) : z;
        cells.push({ ps: global.wallPoly(el), z0: wb, z1: wb + elemHeightOf(el, m) });
      }
      const extendTargetZ = opts.extendToZ ?? null;
      const origTopZ = (typeof global.wallBase === 'function' ? global.wallBase(el) : z) + elemHeightOf(el, m);
      const solids = [];
      for (const c of cells) {
        let z1 = c.z1;
        if (Number.isFinite(extendTargetZ) && Math.abs(c.z1 - origTopZ) < 2) {
          z1 = Math.max(z1, extendTargetZ);
        }
        const poly = extrudePrismPolys(c.ps, c.z0, z1, meta);
        if (poly.length) solids.push(poly);
      }
      // If wall has auto-gable / explicit gableProfile and is NOT already extended for trimToRoof
      if (!opts.skipGableEar && typeof global.computeWallRoofGableProfile === 'function' && typeof global.joinedWallPolygon === 'function') {
        const gp = global.computeWallRoofGableProfile(el, m);
        if (gp && gp.peakRise > 20) {
          const poly = global.joinedWallPolygon(el);
          if (poly && poly.length >= 4) {
            const wLen = Math.hypot(el.b.x - el.a.x, el.b.y - el.a.y) || 1;
            const wb = typeof global.wallBase === 'function' ? global.wallBase(el) : z;
            const zEave = wb + gp.eaveHeight;
            const [p0, p1, p2, p3] = poly;
            const lerpPt = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
            const rawPts = (Array.isArray(gp.profilePoints) && gp.profilePoints.length >= 2)
              ? gp.profilePoints
              : [{ x: 0, rise: gp.riseAt(0) }, { x: gp.peakX, rise: gp.peakRise }, { x: wLen, rise: gp.riseAt(wLen) }];
            for (let idx = 0; idx + 1 < rawPts.length; idx++) {
              const pa = rawPts[idx], pb = rawPts[idx + 1];
              if (pa.rise <= 1 && pb.rise <= 1) continue;
              if (pb.x - pa.x < 1) continue;
              const t0 = Math.max(0, Math.min(1, pa.x / wLen)), t1 = Math.max(0, Math.min(1, pb.x / wLen));
              const za = zEave + pa.rise, zb = zEave + pb.rise;
              const f0 = lerpPt(p0, p1, t0), f1 = lerpPt(p0, p1, t1);
              const b0 = lerpPt(p3, p2, t0), b1 = lerpPt(p3, p2, t1);
              const s = makeSlopedPrismPolys(
                [{ ...f0, z: za }, { ...f1, z: zb }, { ...b1, z: zb }, { ...b0, z: za }],
                [{ ...f0, z: zEave }, { ...f1, z: zEave }, { ...b1, z: zEave }, { ...b0, z: zEave }],
                meta
              );
              if (s.length) solids.push(s);
            }
          }
        }
      }
      return solids;
    }

    if (el.type === 'slab') {
      const ps = typeof global.defaultSlabPolygon === 'function' ? global.defaultSlabPolygon(el) : el.points;
      const p = extrudePrismPolys(ps, z - (el.thickness || 200), z, meta);
      return p.length ? [p] : [];
    }

    if (el.type === 'column') {
      const r = (el.thickness || 300) / 2;
      const ps = el.columnProfile === 'circle' && typeof global.cylinderPolygon === 'function'
        ? global.cylinderPolygon(el.a, r, 12)
        : (typeof global.wallPoly === 'function' ? global.wallPoly(el, { x: el.a.x - r, y: el.a.y }, { x: el.a.x + r, y: el.a.y }) : []);
      const h = elemHeightOf(el, m);
      const topZ = Number.isFinite(opts.extendToZ) ? Math.max(z + h, opts.extendToZ) : z + h;
      const p = extrudePrismPolys(ps, z, topZ, meta);
      return p.length ? [p] : [];
    }

    if (el.type === 'beam' && el.a && el.b) {
      const ps = typeof global.wallPoly === 'function' ? global.wallPoly(el) : [];
      const topZ = z + elemHeightOf(el, m);
      const p = extrudePrismPolys(ps, topZ - (el.thickness || 300), topZ, meta);
      return p.length ? [p] : [];
    }

    if (el.type === 'roof' && typeof global.roofGeometry === 'function') {
      const g = global.roofGeometry(el);
      const solids = [];
      for (const top of g.facets) {
        const bot = top.map(pt => ({ x: pt.x, y: pt.y, z: pt.z - g.drop }));
        const s = makeSlopedPrismPolys(top, bot, meta);
        if (s.length) solids.push(s);
      }
      return solids;
    }

    if (el.type === 'stair' && el.a && el.b) {
      const risers = el.risers || 16, rh = (el.height || 3048) / risers, w = el.width || 1000;
      const len = Math.hypot(el.b.x - el.a.x, el.b.y - el.a.y) || 1;
      const u = { x: (el.b.x - el.a.x) / len, y: (el.b.y - el.a.y) / len };
      const n = { x: -u.y * w / 2, y: u.x * w / 2 };
      const solids = [];
      for (let i = 0; i < risers; i++) {
        const p1 = { x: el.a.x + (el.b.x - el.a.x) * (i / risers), y: el.a.y + (el.b.y - el.a.y) * (i / risers) };
        const p2 = { x: el.a.x + (el.b.x - el.a.x) * ((i + 1) / risers), y: el.a.y + (el.b.y - el.a.y) * ((i + 1) / risers) };
        const ps = [{ x: p1.x + n.x, y: p1.y + n.y }, { x: p2.x + n.x, y: p2.y + n.y }, { x: p2.x - n.x, y: p2.y - n.y }, { x: p1.x - n.x, y: p1.y - n.y }];
        const s = extrudePrismPolys(ps, z + i * rh, z + (i + 1) * rh, meta);
        if (s.length) solids.push(s);
      }
      return solids;
    }

    if (el.type === 'curtainwall' && el.a && el.b && typeof global.wallPoly === 'function') {
      const h = elemHeightOf(el, m);
      const topZ = Number.isFinite(opts.extendToZ) ? Math.max(z + h, opts.extendToZ) : z + h;
      const p = extrudePrismPolys(global.wallPoly(el, el.a, el.b, el.thickness || 50), z, topZ, meta);
      return p.length ? [p] : [];
    }

    if (el.type === 'morph' && Array.isArray(el.points)) {
      const p = extrudePrismPolys(el.points, z, z + (el.height || 2400), meta);
      return p.length ? [p] : [];
    }

    if (el.type === 'mesh' && Array.isArray(el.points)) {
      const topZ = z + (el.elevation || 0);
      const p = extrudePrismPolys(el.points, topZ - (el.skirtDepth || 800), topZ, meta);
      return p.length ? [p] : [];
    }

    if (el.type === 'railing' && el.a && el.b && typeof global.wallPoly === 'function') {
      const solids = [];
      const rail = extrudePrismPolys(global.wallPoly(el, el.a, el.b, 40), z + 950, z + 1050, meta);
      if (rail.length) solids.push(rail);
      const len = Math.hypot(el.b.x - el.a.x, el.b.y - el.a.y), cnt = Math.max(1, Math.floor(len / 500));
      for (let i = 0; i <= cnt; i++) {
        const pt = { x: el.a.x + (el.b.x - el.a.x) * (i / cnt), y: el.a.y + (el.b.y - el.a.y) * (i / cnt) };
        const post = extrudePrismPolys([{ x: pt.x - 20, y: pt.y - 20 }, { x: pt.x + 20, y: pt.y - 20 }, { x: pt.x + 20, y: pt.y + 20 }, { x: pt.x - 20, y: pt.y + 20 }], z, z + 1000, meta);
        if (post.length) solids.push(post);
      }
      return solids;
    }

    if (el.type === 'object' && el.a) {
      const w = el.width || 1600, d = el.depth || 900;
      const p = extrudePrismPolys([
        { x: el.a.x - w / 2, y: el.a.y - d / 2 },
        { x: el.a.x + w / 2, y: el.a.y - d / 2 },
        { x: el.a.x + w / 2, y: el.a.y + d / 2 },
        { x: el.a.x - w / 2, y: el.a.y + d / 2 }
      ], z, z + (el.height || 750), meta);
      return p.length ? [p] : [];
    }

    if (el.type === 'skylight' && el.a) {
      const w = (el.width || 1000) / 2, l = (el.length || 1400) / 2;
      const p = extrudePrismPolys([
        { x: el.a.x - w, y: el.a.y - l },
        { x: el.a.x + w, y: el.a.y - l },
        { x: el.a.x + w, y: el.a.y + l },
        { x: el.a.x - w, y: el.a.y + l }
      ], z + 2400, z + 2500, meta);
      return p.length ? [p] : [];
    }

    if (el.host && typeof global.hostOf === 'function' && typeof global.openingSolidPolygon === 'function') {
      const w = global.hostOf(el);
      if (w) {
        const wz = typeof global.wallBase === 'function' ? global.wallBase(w) : z;
        const p = extrudePrismPolys(global.openingSolidPolygon(w, el), wz + (el.sill || 0), wz + Math.min((el.sill || 0) + el.height, elemHeightOf(w, m)), meta);
        return p.length ? [p] : [];
      }
    }

    return [];
  }

  // ---------------- ArchiCAD Exact Extruded Operator Builders ----------------
  function buildUpwardExtrusionSolids(baseSolids, zCeiling, meta) {
    const out = [];
    for (const s of baseSolids) {
      out.push(s);
      for (const poly of s) {
        // Every downward-facing polygon defines the underside of an upward extrusion column
        if (poly.plane.normal.z < -0.01) {
          const verts2 = poly.vertices.map(v => ({ x: v.x, y: v.y }));
          const rev = area2D(verts2) < 0;
          const botVerts = (rev ? [...poly.vertices].reverse() : poly.vertices).map(v => ({ x: v.x, y: v.y, z: v.z }));
          const topZ = Math.max(zCeiling, Math.max(...botVerts.map(v => v.z)) + 50);
          const topVerts = botVerts.map(v => ({ x: v.x, y: v.y, z: topZ }));
          const prism = makeSlopedPrismPolys(topVerts, botVerts, meta);
          if (prism.length) out.push(prism);
        }
      }
    }
    return out;
  }

  function buildDownwardExtrusionSolids(baseSolids, zFloor, meta) {
    const out = [];
    for (const s of baseSolids) {
      out.push(s);
      for (const poly of s) {
        // Every upward-facing polygon defines the top surface of a downward extrusion column
        if (poly.plane.normal.z > 0.01) {
          const verts2 = poly.vertices.map(v => ({ x: v.x, y: v.y }));
          const rev = area2D(verts2) < 0;
          const topVerts = (rev ? [...poly.vertices].reverse() : poly.vertices).map(v => ({ x: v.x, y: v.y, z: v.z }));
          const botZ = Math.min(zFloor, Math.min(...topVerts.map(v => v.z)) - 50);
          const botVerts = topVerts.map(v => ({ x: v.x, y: v.y, z: botZ }));
          const prism = makeSlopedPrismPolys(topVerts, botVerts, meta);
          if (prism.length) out.push(prism);
        }
      }
    }
    return out;
  }

  function buildRoofTrimCutSolids(roofEl, trimSpec, targetBounds, cutMeta) {
    if (!roofEl || roofEl.type !== 'roof' || typeof global.roofGeometry !== 'function') return [];
    const g = global.roofGeometry(roofEl);
    const trimType = trimSpec.trimType || 'keepBelow'; // 'keepBelow' (Trim Top) | 'keepAbove' (Trim Base)
    const trimPlane = trimSpec.trimPlane || 'bottom';  // 'bottom' (Under roof / Soffit) | 'top' (Top pitch surface)
    const offsetMm = Number(trimSpec.offset) || 0;
    const infinitePlanes = Boolean(trimSpec.infinitePlanes);

    const drop = trimPlane === 'bottom' ? g.drop : 0;
    const zShift = offsetMm - drop;
    const roofMaxZ = Math.max(targetBounds.maxZ, ...g.facets.flatMap(f => f.map(p => p.z))) + 4000;
    const roofMinZ = Math.min(targetBounds.minZ, ...g.facets.flatMap(f => f.map(p => p.z - g.drop))) - 4000;

    const cutters = [];
    for (const facet of g.facets) {
      if (!facet || facet.length < 3) continue;
      let baseVerts = facet.map(p => ({ x: p.x, y: p.y, z: p.z + zShift }));
      if (infinitePlanes) {
        const pl = newellNormal(baseVerts).normal;
        if (pl && Math.abs(pl.z) > 0.05) {
          const w = v3dot(pl, baseVerts[0]);
          const pad = 4000;
          const x0 = targetBounds.minX - pad, x1 = targetBounds.maxX + pad;
          const y0 = targetBounds.minY - pad, y1 = targetBounds.maxY + pad;
          const zAt = (x, y) => (w - pl.x * x - pl.y * y) / pl.z;
          baseVerts = [
            { x: x0, y: y0, z: zAt(x0, y0) },
            { x: x1, y: y0, z: zAt(x1, y0) },
            { x: x1, y: y1, z: zAt(x1, y1) },
            { x: x0, y: y1, z: zAt(x0, y1) }
          ];
        }
      }

      if (trimType === 'keepBelow') {
        const topVerts = baseVerts.map(v => ({ x: v.x, y: v.y, z: Math.max(roofMaxZ, v.z + 200) }));
        const prism = makeSlopedPrismPolys(topVerts, baseVerts, cutMeta);
        if (prism.length) cutters.push(prism);
      } else {
        const botVerts = baseVerts.map(v => ({ x: v.x, y: v.y, z: Math.min(roofMinZ, v.z - 200) }));
        const prism = makeSlopedPrismPolys(baseVerts, botVerts, cutMeta);
        if (prism.length) cutters.push(prism);
      }
    }
    return cutters;
  }

  // ---------------- Core Cache & Unified Element Solid Evaluator ----------------
  let _seoEvalCache = { rev: null, cutKey: null, map: new Map() };

  function currentCutKey() {
    const vc = global.viewportCut;
    if (!vc || !vc.enabled || global.view !== '3d') return 'nocut';
    return `${vc.axis}:${vc.side}:${vc.position}`;
  }

  function hasTrimOrSEO(el, mRef) {
    if (!el) return false;
    if (el.roofTrim && el.roofTrim.enabled !== false) return true;
    const m = mRef || global.model;
    const ops = m?.seoOperations;
    return Array.isArray(ops) && ops.some(op => op && op.enabled !== false && op.targetId === el.id);
  }

  function applyOperationToSolidList(targetSolids, opSolids, operation) {
    let nextSolids = targetSolids;
    if (operation === 'subtraction' || operation === 'subtraction_upward' || operation === 'subtraction_downward') {
      for (const cutter of opSolids) {
        const next = [];
        for (const tSolid of nextSolids) {
          const res = csgSubtractPolys(tSolid, cutter);
          if (res.length) next.push(res);
        }
        nextSolids = next;
        if (!nextSolids.length) break;
      }
      return nextSolids;
    }

    if (operation === 'intersection') {
      // Combine operator solids or intersect pairwise and accumulate
      const out = [];
      for (const tSolid of nextSolids) {
        for (const oSolid of opSolids) {
          const res = csgIntersectPolys(tSolid, oSolid);
          if (res.length) out.push(res);
        }
      }
      return out;
    }

    if (operation === 'addition') {
      // Sequential union across target solids and operator solids
      let merged = nextSolids.length ? nextSolids[0] : [];
      for (let i = 1; i < nextSolids.length; i++) merged = csgUnionPolys(merged, nextSolids[i]);
      for (const oSolid of opSolids) merged = csgUnionPolys(merged, oSolid);
      return merged.length ? [merged] : [];
    }

    return nextSolids;
  }

  function clipPolysByViewportCut(polys) {
    const vc = global.viewportCut;
    if (!vc || !vc.enabled || global.view !== '3d' || !polys.length) return polys;
    const axis = vc.axis || 'z';
    const pos = Number(vc.position) || 0;
    const keepBelow = vc.side !== 'above';
    // Normal points INTO the half-space to discard (so FRONT is discarded, BACK is kept)
    const normal = { x: axis === 'x' ? (keepBelow ? 1 : -1) : 0, y: axis === 'y' ? (keepBelow ? 1 : -1) : 0, z: axis === 'z' ? (keepBelow ? 1 : -1) : 0 };
    const w = (keepBelow ? 1 : -1) * pos;
    const plane = makePlane(normal, w);
    const front = [], back = [];
    for (const p of polys) {
      const cf = [], cb = [];
      splitPolygonByPlane(plane, p, cb, cb, cf, cb);
      for (const k of cb) back.push(k);
    }
    return back;
  }

  function evaluateElementOperatedPolygons(el, mRef, skipViewportCut = false) {
    const m = mRef || global.model;
    if (!el || !m) return [];
    const rev = `${m.revision ?? 0}|${global.view || '3d'}`;
    const cKey = skipViewportCut ? 'nocut' : currentCutKey();
    if (_seoEvalCache.rev !== rev || _seoEvalCache.cutKey !== cKey) {
      _seoEvalCache = { rev, cutKey: cKey, map: new Map() };
    }
    if (_seoEvalCache.map.has(el.id)) return _seoEvalCache.map.get(el.id);

    const trim = el.roofTrim && el.roofTrim.enabled !== false ? el.roofTrim : null;
    const ops = Array.isArray(m.seoOperations)
      ? m.seoOperations.filter(op => op && op.enabled !== false && op.targetId === el.id)
      : [];

    let extendToZ = null;
    if (trim && trim.extendToRoof) {
      const rIds = Array.isArray(trim.roofIds) && trim.roofIds.length ? trim.roofIds : (trim.roofId ? [trim.roofId] : []);
      const maxRoofZ = computeRoofMaxTopZ(rIds, m);
      if (Number.isFinite(maxRoofZ)) extendToZ = maxRoofZ + 250;
    }

    let solids = elementToSolids(el, m, {
      extendToZ,
      skipGableEar: Boolean(trim)
    });

    // 1. Apply ArchiCAD "Trim Elements to Roof"
    if (trim && solids.length) {
      const rIds = Array.isArray(trim.roofIds) && trim.roofIds.length ? trim.roofIds : (trim.roofId ? [trim.roofId] : []);
      const roofs = m.elements.filter(r => r.type === 'roof' && (!rIds.length || rIds.includes(r.id)));
      const tBounds = polyBounds3(solids.flat());
      for (const r of roofs) {
        const cutMeta = {
          material: el.material || 'Timber',
          ownerId: el.id,
          ownerType: el.type,
          isCut: true,
          seoMaterial: null,
          seoType: null,
          seoColor: null
        };
        const cutters = buildRoofTrimCutSolids(r, trim, tBounds, cutMeta);
        if (cutters.length) {
          solids = applyOperationToSolidList(solids, cutters, 'subtraction');
        }
      }
    }

    // 2. Apply ArchiCAD "Solid Element Operations (SEO)"
    for (const op of ops) {
      if (!solids.length && op.operation !== 'addition') break;
      const opEl = m.elements.find(e => e.id === op.operatorId);
      if (!opEl || opEl.id === el.id) continue;

      const inheritOp = (op.newSurfaces || op.attrMode || 'operator') === 'operator';
      const cutMeta = {
        material: inheritOp ? (opEl.material || 'Concrete') : (el.material || 'Timber'),
        ownerId: el.id,
        ownerType: el.type,
        isCut: true,
        seoMaterial: inheritOp ? (opEl.material || 'Concrete') : null,
        seoType: inheritOp ? opEl.type : null,
        seoColor: inheritOp ? (MATERIALS_HEX[opEl.material] || '#94a3b8') : null
      };

      const baseOpSolids = elementToSolids(opEl, m, {
        overrideMaterial: cutMeta.material,
        isCut: true,
        seoMaterial: cutMeta.seoMaterial,
        seoType: cutMeta.seoType,
        seoColor: cutMeta.seoColor
      });
      if (!baseOpSolids.length) continue;

      const tBounds = polyBounds3(solids.flat());
      let opSolids = baseOpSolids;
      if (op.operation === 'subtraction_upward') {
        const zCeil = (tBounds.empty ? 12000 : tBounds.maxZ) + 4000;
        opSolids = buildUpwardExtrusionSolids(baseOpSolids, zCeil, cutMeta);
      } else if (op.operation === 'subtraction_downward') {
        const zFloor = (tBounds.empty ? -5000 : tBounds.minZ) - 4000;
        opSolids = buildDownwardExtrusionSolids(baseOpSolids, zFloor, cutMeta);
      }

      solids = applyOperationToSolidList(solids, opSolids, op.operation);
    }

    let flat = solids.flat();
    if (!skipViewportCut) {
      flat = clipPolysByViewportCut(flat);
    }

    _seoEvalCache.map.set(el.id, flat);
    return flat;
  }

  function emitOperatedElementFaces(el, projectedFaces, project3Fn, isCutFaceFn, materialsMap, selectedIds) {
    const polys = evaluateElementOperatedPolygons(el, global.model, false);
    const mats = materialsMap || {};
    const sel = Array.isArray(selectedIds) ? selectedIds : [];
    const baseColors = mats[el.material || 'Timber'] || mats.Timber || ['#d0c4a5', '#b6ab8d', '#e2dac4'];
    const isSel = sel.includes(el.id);

    for (const p of polys) {
      const world = p.vertices;
      const points = world.map(project3Fn);
      const n = p.plane.normal;
      let fill = baseColors[0];
      if (p.seoMaterial) {
        const opCols = mats[p.seoMaterial] || mats.Concrete || baseColors;
        fill = Math.abs(n.z) > 0.7 ? opCols[2] : (Math.abs(n.x) > Math.abs(n.y) ? opCols[0] : opCols[1]);
      } else {
        fill = n.z > 0.7 ? baseColors[2] : (n.z < -0.7 ? baseColors[1] : (Math.abs(n.x) > Math.abs(n.y) ? baseColors[0] : baseColors[1]));
      }
      if (isSel) fill = '#91b8a1';
      const cutS = typeof isCutFaceFn === 'function' ? isCutFaceFn(world) : false;
      projectedFaces.push({
        id: el.id,
        world,
        points,
        wallSurface: el.type === 'wall' || el.type === 'roof',
        cutSurface: cutS,
        depth: points.reduce((a, pt) => a + pt.depth, 0) / points.length,
        color: fill,
        seoMaterial: p.seoMaterial || null,
        seoType: p.seoType || null,
        seoColor: p.seoColor || null,
        isSeoCut: Boolean(p.isCut && p.seoMaterial)
      });
    }
  }

  // ---------------- Roof Trim Query for Framing / Section / Elevation ----------------
  function evalRoofFacetZAt(roofEl, x, y, trimPlane = 'bottom', offsetMm = 0, infinitePlanes = false, trimType = 'keepBelow') {
    if (!roofEl || typeof global.roofGeometry !== 'function') return null;
    const g = global.roofGeometry(roofEl);
    const shift = Number(offsetMm || 0) - (trimPlane === 'bottom' ? g.drop : 0);
    const inside2D = (pt, poly) => {
      if (typeof global.inside === 'function') return global.inside(pt, poly);
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        if (((poly[i].y > pt.y) !== (poly[j].y > pt.y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)) c = !c;
      }
      return c;
    };

    const hits = [];
    for (const facet of g.facets) {
      const inFacet = infinitePlanes || inside2D({ x, y }, facet);
      if (!inFacet) continue;
      const pl = newellNormal(facet).normal;
      if (!pl || Math.abs(pl.z) < 1e-4) continue;
      const w = v3dot(pl, facet[0]);
      const z = (w - pl.x * x - pl.y * y) / pl.z + shift;
      hits.push(z);
    }
    if (!hits.length) return null;
    if (!infinitePlanes) return hits[0];
    return trimType === 'keepAbove' ? Math.max(...hits) : Math.min(...hits);
  }

  function evaluateElementRoofTrimAt(el, x, y, mRef) {
    const trim = el?.roofTrim;
    if (!trim || trim.enabled === false) return null;
    const m = mRef || global.model;
    const rIds = Array.isArray(trim.roofIds) && trim.roofIds.length ? trim.roofIds : (trim.roofId ? [trim.roofId] : []);
    const roofs = (m?.elements || []).filter(r => r.type === 'roof' && (!rIds.length || rIds.includes(r.id)));
    const trimType = trim.trimType || 'keepBelow';
    const zs = [];
    for (const r of roofs) {
      const z = evalRoofFacetZAt(r, x, y, trim.trimPlane || 'bottom', trim.offset || 0, Boolean(trim.infinitePlanes), trimType);
      if (Number.isFinite(z)) zs.push(z);
    }
    if (!zs.length) return null;
    return {
      zLimit: trimType === 'keepBelow' ? Math.min(...zs) : Math.max(...zs),
      trimType
    };
  }

  // Framing helper called from framing.js when w.roofTrim is active
  function applyRoofTrimToWallFraming(w, members, c, mRef) {
    const trim = w?.roofTrim;
    if (!trim || trim.enabled === false || !Array.isArray(members)) return;
    const m = mRef || global.model;
    const wb = typeof global.wallBase === 'function' ? global.wallBase(w) : storyElevationOf(w, m);
    const len = Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y) || 1;
    const ux = (w.b.x - w.a.x) / len, uy = (w.b.y - w.a.y) / len;
    const origH = elemHeightOf(w, m);
    const rIds = Array.isArray(trim.roofIds) && trim.roofIds.length ? trim.roofIds : (trim.roofId ? [trim.roofId] : []);
    const roofMaxZ = trim.extendToRoof ? computeRoofMaxTopZ(rIds, m) : null;
    const maxWallTopRel = Number.isFinite(roofMaxZ) ? Math.max(origH, roofMaxZ - wb + 200) : origH;

    const pThk = c.plateThickness || 38;
    const topPlateStack = (c.topPlates || 1) * pThk;
    const trimType = trim.trimType || 'keepBelow';

    // Clip vertical studs and top plates
    const gp = typeof global.computeWallRoofGableProfile === 'function' ? global.computeWallRoofGableProfile(w, m) : null;
    const hasOwnRake = members.some(mb => mb.isRakePlate);
    for (let i = members.length - 1; i >= 0; i--) {
      const mb = members[i];
      if (mb.isRakePlate) continue; // Rake plates already match the roof slope
      if (mb.isGableStud && hasOwnRake && gp && gp.roofId && rIds.every(id => id === gp.roofId)) {
        // Gable studs are already flush-fitted to the underside of the rake plate for this roof
        continue;
      }
      const xm = (mb.x0 + mb.x1) / 2;
      const wx0 = w.a.x + ux * mb.x0, wy0 = w.a.y + uy * mb.x0;
      const wx1 = w.a.x + ux * mb.x1, wy1 = w.a.y + uy * mb.x1;
      const wxm = w.a.x + ux * xm, wym = w.a.y + uy * xm;

      const t0 = evaluateElementRoofTrimAt(w, wx0, wy0, m);
      const t1 = evaluateElementRoofTrimAt(w, wx1, wy1, m);
      const tm = evaluateElementRoofTrimAt(w, wxm, wym, m);
      if (!t0 && !t1 && !tm) continue;

      if (mb.isStud) {
        if (trimType === 'keepBelow') {
          const lims = [t0?.zLimit, t1?.zLimit, tm?.zLimit].filter(Number.isFinite);
          if (!lims.length) continue;
          const relLimit = Math.min(...lims) - wb;
          const targetTop = Math.min(maxWallTopRel, relLimit) - topPlateStack;
          if (mb.isGableStud && Number.isFinite(mb.bevelZ0) && Number.isFinite(mb.bevelZ1)) {
            const rakeAllow0 = Number.isFinite(t0?.zLimit) ? Math.min(maxWallTopRel, t0.zLimit - wb) : mb.bevelZ0;
            const rakeAllow1 = Number.isFinite(t1?.zLimit) ? Math.min(maxWallTopRel, t1.zLimit - wb) : mb.bevelZ1;
            const maxAllowTop = Math.max(rakeAllow0, rakeAllow1);
            if (maxAllowTop < mb.z0 + 30) {
              members.splice(i, 1);
            } else if (mb.z1 > maxAllowTop + 5) {
              mb.bevelZ0 = Math.min(mb.bevelZ0, Math.round(rakeAllow0));
              mb.bevelZ1 = Math.min(mb.bevelZ1, Math.round(rakeAllow1));
              if (Number.isFinite(mb.bevelZPeak)) mb.bevelZPeak = Math.min(mb.bevelZPeak, Math.round(maxAllowTop));
              mb.z1 = Math.max(mb.bevelZ0, mb.bevelZ1, mb.bevelZPeak || 0);
              mb.length = Math.max(10, Math.round(mb.z1 - mb.z0));
              mb.roofTrimmed = true;
            }
            continue;
          }
          if (targetTop <= mb.z0 + 30) {
            members.splice(i, 1);
          } else if (trim.extendToRoof || targetTop < mb.z1) {
            mb.z1 = Math.round(targetTop);
            mb.length = Math.max(10, Math.round(mb.z1 - mb.z0));
            mb.roofTrimmed = true;
          }
        } else {
          const lims = [t0?.zLimit, t1?.zLimit, tm?.zLimit].filter(Number.isFinite);
          if (!lims.length) continue;
          const relLimit = Math.max(...lims) - wb;
          if (relLimit >= mb.z1 - 30) {
            members.splice(i, 1);
          } else if (relLimit > mb.z0) {
            mb.z0 = Math.round(relLimit);
            mb.length = Math.max(10, Math.round(mb.z1 - mb.z0));
            mb.roofTrimmed = true;
          }
        }
      } else if (mb.type === 'Top plate' && trimType === 'keepBelow') {
        const lims = [t0?.zLimit, t1?.zLimit, tm?.zLimit].filter(Number.isFinite);
        if (lims.length) {
          const minRel = Math.min(...lims) - wb;
          if (minRel < mb.z1 - 5) {
            mb.roofTrimmed = true;
          }
        }
      }
    }
  }

  // ---------------- Section A-A Slicing of Operated 3D Solids ----------------
  function sliceSolidsAtY(polys, yPlane) {
    if (!polys.length) return [];
    const cutSegments = [];
    for (const poly of polys) {
      const vs = poly.vertices;
      const pts = [];
      for (let i = 0; i < vs.length; i++) {
        const a = vs[i], b = vs[(i + 1) % vs.length];
        if (Math.abs(a.y - yPlane) <= 0.1) pts.push({ x: a.x, z: a.z });
        if ((a.y < yPlane && b.y > yPlane) || (a.y > yPlane && b.y < yPlane)) {
          const t = (yPlane - a.y) / (b.y - a.y);
          pts.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
        }
      }
      if (pts.length >= 2) {
        cutSegments.push(pts);
      }
    }
    return cutSegments;
  }

  // Project operated solid faces directly into Section A-A or South Elevation
  function drawOperatedElementElevation(el, prFn, ySection, isSectionView) {
    const polys = evaluateElementOperatedPolygons(el, global.model, true);
    if (!polys.length) return false;
    const isSel = Array.isArray(global.selected) && global.selected.includes(el.id);

    if (isSectionView) {
      // Exact cross-section slicing at Y = ySection + loop stitching
      const segs = [];
      for (const poly of polys) {
        const vs = poly.vertices;
        const hitPts = [];
        for (let i = 0; i < vs.length; i++) {
          const a = vs[i], b = vs[(i + 1) % vs.length];
          const da = a.y - ySection, db = b.y - ySection;
          if (Math.abs(da) <= 0.25) hitPts.push({ x: a.x, z: a.z });
          if ((da < -0.25 && db > 0.25) || (da > 0.25 && db < -0.25)) {
            const t = (ySection - a.y) / (b.y - a.y);
            hitPts.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
          }
        }
        if (hitPts.length >= 2) {
          // Deduplicate endpoints
          const uniq = [];
          for (const pt of hitPts) {
            if (!uniq.some(u => Math.hypot(u.x - pt.x, u.z - pt.z) < 0.5)) uniq.push(pt);
          }
          if (uniq.length >= 2) {
            for (let k = 0; k + 1 < uniq.length; k += 2) {
              segs.push([uniq[k], uniq[k + 1]]);
            }
          }
        }
      }
      if (!segs.length) return true; // cut away at section plane!

      // Chain segments into closed loops for fill + crisp outline
      const used = new Array(segs.length).fill(false);
      const loops = [];
      for (let i = 0; i < segs.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        const loop = [segs[i][0], segs[i][1]];
        let extended = true;
        while (extended) {
          extended = false;
          const tail = loop[loop.length - 1];
          for (let j = 0; j < segs.length; j++) {
            if (used[j]) continue;
            const [s0, s1] = segs[j];
            if (Math.hypot(s0.x - tail.x, s0.z - tail.z) < 2) {
              used[j] = true; loop.push(s1); extended = true; break;
            }
            if (Math.hypot(s1.x - tail.x, s1.z - tail.z) < 2) {
              used[j] = true; loop.push(s0); extended = true; break;
            }
          }
        }
        if (loop.length >= 3) loops.push(loop);
      }

      for (const lp of loops) {
        const pts2d = lp.map(p => prFn(p.x, p.z));
        if (typeof global.poly === 'function') {
          global.poly(pts2d, isSel ? '#a8c2ab' : '#bec9b2', isSel ? '#426e59' : '#64748b', 1.2);
        }
      }
      for (const [a, b] of segs) {
        if (typeof global.line === 'function') {
          global.line(prFn(a.x, a.z), prFn(b.x, b.z), isSel ? '#426e59' : '#475569', 1.3);
        }
      }
      return true;
    }

    // South Elevation: draw front-facing projected faces sorted back-to-front by max Y
    const sorted = [...polys].filter(p => p.plane.normal.y > -0.2).sort((a, b) => {
      const ya = a.vertices.reduce((s, v) => s + v.y, 0) / a.vertices.length;
      const yb = b.vertices.reduce((s, v) => s + v.y, 0) / b.vertices.length;
      return ya - yb;
    });
    for (const p of sorted) {
      const pts2d = p.vertices.map(v => prFn(v.x, v.z));
      const fill = isSel ? '#d0e2d0' : (p.seoColor || '#eef1e9');
      if (typeof global.poly === 'function') {
        global.poly(pts2d, fill, isSel ? '#315d54' : '#809373', 0.9);
      }
    }
    return true;
  }

  // ---------------- ArchiCAD "Trim Elements to Roof" Logic & Dialog ----------------
  const TRIM_SUPPORTED_TYPES = ['wall', 'column', 'beam', 'slab', 'curtainwall', 'stair', 'morph', 'mesh', 'railing', 'object'];
  const SEO_SUPPORTED_TYPES = ['wall', 'slab', 'beam', 'column', 'roof', 'stair', 'curtainwall', 'morph', 'mesh', 'railing', 'object'];

  function executeTrimElementsToRoof(targetIds, roofIds, options = {}) {
    const m = global.model;
    if (!m) return { count: 0 };
    const targets = m.elements.filter(e => targetIds.includes(e.id) && TRIM_SUPPORTED_TYPES.includes(e.type));
    const roofs = m.elements.filter(e => e.type === 'roof' && (!roofIds?.length || roofIds.includes(e.id)));
    if (!targets.length) {
      global.toast?.('Select at least one element (Wall, Column, Beam, Slab, Curtain Wall, Stair, Morph) to trim.');
      return { count: 0 };
    }
    if (!options.clear && !roofs.length) {
      global.toast?.('No Roof element found to trim against.');
      return { count: 0 };
    }

    const rIds = roofs.map(r => r.id);
    const ok = global.commit(() => {
      for (const t of targets) {
        if (options.clear) {
          delete t.roofTrim;
        } else {
          t.roofTrim = {
            enabled: true,
            roofIds: rIds,
            roofId: rIds[0],
            trimType: options.trimType || 'keepBelow',
            trimPlane: options.trimPlane || 'bottom',
            offset: Number(options.offset) || 0,
            infinitePlanes: Boolean(options.infinitePlanes),
            extendToRoof: Boolean(options.extendToRoof)
          };
        }
      }
    }, false);

    if (ok) {
      _seoEvalCache.rev = null;
      if (typeof global.properties === 'function') global.properties();
      if (typeof global.render === 'function') global.render();
      if (options.clear) {
        global.toast?.(`Cleared Roof Trim from ${targets.length} element(s).`);
      } else {
        const modeTxt = (options.trimType || 'keepBelow') === 'keepBelow' ? 'Trim Top (Keep Below Roof)' : 'Trim Base (Keep Above Roof)';
        global.toast?.(`Trim Elements to Roof (${modeTxt}): Trimmed ${targets.length} element(s) to ${rIds.join(', ')}.`);
      }
    }
    return { count: targets.length };
  }

  function startPickRoofForTrim(pendingOpts = {}) {
    const m = global.model;
    const selTargets = (global.selected || []).filter(id => {
      const el = m?.elements?.find(e => e.id === id);
      return el && TRIM_SUPPORTED_TYPES.includes(el.type);
    });
    if (!selTargets.length) {
      global.toast?.('Select target elements first (Walls, Columns, Beams, Slabs) before picking a trimming roof.');
      return;
    }
    global._pendingRoofTrimTargetIds = selTargets;
    global._pendingRoofTrimOptions = pendingOpts;
    global.editing = 'trimToRoofPickRoof';
    global.tool = 'select';
    global.points = [];
    global.toolState?.();
    global.toast?.('Trim Elements to Roof: Click the trimming Roof on Plan or in 3D view (Esc to cancel).');
  }

  function completePickRoofForTrim(roofEl) {
    if (!roofEl || roofEl.type !== 'roof') return false;
    const targetIds = global._pendingRoofTrimTargetIds || [];
    const opts = global._pendingRoofTrimOptions || { trimType: 'keepBelow', trimPlane: 'bottom', offset: 0 };
    global.editing = null;
    global._pendingRoofTrimTargetIds = null;
    global._pendingRoofTrimOptions = null;
    global.toolState?.();
    if (!targetIds.length) {
      global.toast?.('No target elements were queued for Roof Trim.');
      return false;
    }
    executeTrimElementsToRoof(targetIds, [roofEl.id], opts);
    global.select?.(targetIds);
    return true;
  }

  function openTrimToRoofModal() {
    const m = global.model;
    if (!m) return;
    const selEls = (global.selected || []).map(id => m.elements.find(e => e.id === id)).filter(Boolean);
    const selTargets = selEls.filter(e => TRIM_SUPPORTED_TYPES.includes(e.type));
    const selRoofs = selEls.filter(e => e.type === 'roof');
    const allRoofs = m.elements.filter(e => e.type === 'roof');
    const esc = global.esc || (s => String(s));

    // Pre-populate defaults from first selected target's existing roofTrim if present
    const exTrim = selTargets.find(t => t.roofTrim)?.roofTrim || {};
    const curTrimType = exTrim.trimType || 'keepBelow';
    const curTrimPlane = exTrim.trimPlane || 'bottom';
    const curOffset = exTrim.offset ?? 0;
    const curInfinite = Boolean(exTrim.infinitePlanes);
    const curExtend = exTrim.extendToRoof !== undefined ? Boolean(exTrim.extendToRoof) : false;

    const chosenRoofIds = new Set(
      selRoofs.length ? selRoofs.map(r => r.id)
        : (exTrim.roofIds?.length ? exTrim.roofIds : allRoofs.map(r => r.id))
    );

    const hasTrimmedTargets = selTargets.some(t => t.roofTrim && t.roofTrim.enabled !== false);
    const allPotentialTargets = m.elements.filter(e => TRIM_SUPPORTED_TYPES.includes(e.type) && e.story === (global.activeStory || m.stories[0]?.id));

    const bodyHtml = `
      <div class="arch-trim-dialog">
        <div class="modal-copy" style="margin-bottom:10px">
          ArchiCAD <strong>Trim Elements to Roof</strong> — creates an associative 3D roof trim on walls, columns, beams, slabs, curtain walls, stairs, and morphs.
        </div>

        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:10px 12px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <strong style="font-size:11px;color:#0f172a;letter-spacing:0.3px">1. TARGET ELEMENTS TO TRIM</strong>
            <span style="font-size:11px;font-weight:700;color:${selTargets.length ? '#0f766e' : '#b45309'}">${selTargets.length ? `${selTargets.length} Selected` : 'None Selected'}</span>
          </div>
          <div style="font-size:11.5px;color:#334155;margin-bottom:6px">
            ${selTargets.length
              ? selTargets.map(t => `<span class="arch-chip">${esc(t.id)} · ${esc(t.type)}</span>`).join(' ')
              : '<span style="color:#b45309">Select walls, columns, beams, or slabs first — or choose "Trim All Exterior Walls on Story" below.</span>'}
          </div>
          ${!selTargets.length && allPotentialTargets.length ? `
            <label style="display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:#0369a1;cursor:pointer">
              <input id="ttr-use-all-ext" type="checkbox" checked> Trim all walls on active story (${allPotentialTargets.filter(e => e.type === 'wall').length} walls)
            </label>
          ` : ''}
        </div>

        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:10px 12px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <strong style="font-size:11px;color:#0f172a;letter-spacing:0.3px">2. TRIMMING ROOF(S)</strong>
            <button id="ttr-pick-roof-btn" type="button" class="subtle" style="font-size:10.5px;padding:3px 8px;font-weight:700;color:#0369a1;border-color:#7dd3fc;background:#f0f9ff">🎯 Pick Roof on Plan / 3D</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${allRoofs.length
              ? allRoofs.map(r => `
                <label style="display:inline-flex;align-items:center;gap:5px;padding:4px 8px;background:#fff;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;cursor:pointer">
                  <input type="checkbox" class="ttr-roof-chk" value="${esc(r.id)}" ${chosenRoofIds.has(r.id) ? 'checked' : ''}>
                  <strong>${esc(r.id)}</strong> <span style="color:#64748b">(${esc(r.roofType || 'hip')}, ${r.pitch ?? 25}°)</span>
                </label>`).join('')
              : '<span style="color:#dc2626;font-size:11.5px">No roofs in current project. Place a Roof first.</span>'}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
          <label class="arch-radio-card">
            <input type="radio" name="ttr-trim-type" value="keepBelow" ${curTrimType === 'keepBelow' ? 'checked' : ''}>
            <div>
              <strong>⬇ Trim Top (Keep Below Roof)</strong>
              <small>Cuts off upper parts protruding above the roof plane (standard ArchiCAD gable/hip wall trim).</small>
            </div>
          </label>
          <label class="arch-radio-card">
            <input type="radio" name="ttr-trim-type" value="keepAbove" ${curTrimType === 'keepAbove' ? 'checked' : ''}>
            <div>
              <strong>⬆ Trim Base (Keep Above Roof)</strong>
              <small>Cuts off lower parts extending below the roof plane (dormer walls, rooftop curbs).</small>
            </div>
          </label>
        </div>

        <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:8px;margin-bottom:10px">
          <label class="modal-field" style="margin:0">Trimming Reference Surface
            <select id="ttr-plane">
              <option value="bottom" ${curTrimPlane === 'bottom' ? 'selected' : ''}>Roof Bottom / Soffit Surface (Under Roof)</option>
              <option value="top" ${curTrimPlane === 'top' ? 'selected' : ''}>Roof Top Surface (Pitch Plane)</option>
            </select>
          </label>
          <label class="modal-field" style="margin:0">Vertical Offset (mm)
            <input id="ttr-offset" type="number" step="10" value="${curOffset}">
          </label>
        </div>

        <div style="display:flex;flex-direction:column;gap:5px;padding:8px 10px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;margin-bottom:12px;font-size:11.5px">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
            <input id="ttr-extend-walls" type="checkbox" ${curExtend ? 'checked' : ''}>
            <span><strong>Extend shorter walls/columns up to roof peak</strong> before trimming (fills gable/hip peaks cleanly)</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
            <input id="ttr-infinite" type="checkbox" ${curInfinite ? 'checked' : ''}>
            <span>Extend roof trimming planes beyond roof overhang boundary</span>
          </label>
        </div>

        <div class="modal-actions" style="justify-content:space-between">
          <div>
            ${hasTrimmedTargets ? '<button id="ttr-clear-btn" type="button" class="subtle" style="color:#dc2626;border-color:#fca5a5;background:#fef2f2">Clear Roof Trim on Selection</button>' : ''}
          </div>
          <div style="display:flex;gap:8px">
            <button id="ttr-cancel-btn" type="button" class="subtle">Cancel</button>
            <button id="ttr-apply-btn" type="button" class="primary">✓ Trim Elements</button>
          </div>
        </div>
      </div>
    `;

    global.openModal?.('Trim Elements to Roof (ArchiCAD)', bodyHtml);

    const readOpts = () => ({
      trimType: document.querySelector('input[name="ttr-trim-type"]:checked')?.value || 'keepBelow',
      trimPlane: document.getElementById('ttr-plane')?.value || 'bottom',
      offset: Number(document.getElementById('ttr-offset')?.value) || 0,
      extendToRoof: Boolean(document.getElementById('ttr-extend-walls')?.checked),
      infinitePlanes: Boolean(document.getElementById('ttr-infinite')?.checked)
    });

    const getChosenTargetIds = () => {
      if (selTargets.length) return selTargets.map(t => t.id);
      if (document.getElementById('ttr-use-all-ext')?.checked) {
        return allPotentialTargets.filter(e => e.type === 'wall').map(e => e.id);
      }
      return [];
    };

    const getChosenRoofIds = () => [...document.querySelectorAll('.ttr-roof-chk:checked')].map(c => c.value);

    document.getElementById('ttr-cancel-btn')?.addEventListener('click', () => document.getElementById('modal')?.close?.());
    document.getElementById('ttr-pick-roof-btn')?.addEventListener('click', () => {
      const tIds = getChosenTargetIds();
      if (!tIds.length) {
        global.toast?.('Select target elements first.');
        return;
      }
      const opts = readOpts();
      document.getElementById('modal')?.close?.();
      global.select?.(tIds);
      startPickRoofForTrim(opts);
    });
    document.getElementById('ttr-apply-btn')?.addEventListener('click', () => {
      const tIds = getChosenTargetIds();
      const rIds = getChosenRoofIds();
      const opts = readOpts();
      if (!tIds.length) {
        global.toast?.('Select at least one element to trim.');
        return;
      }
      if (!rIds.length) {
        global.toast?.('Check at least one trimming Roof.');
        return;
      }
      document.getElementById('modal')?.close?.();
      executeTrimElementsToRoof(tIds, rIds, opts);
      global.select?.(tIds);
    });
    document.getElementById('ttr-clear-btn')?.addEventListener('click', () => {
      const tIds = getChosenTargetIds();
      document.getElementById('modal')?.close?.();
      executeTrimElementsToRoof(tIds, [], { clear: true });
    });
  }

  // ---------------- ArchiCAD "Solid Element Operations (SEO)" Modeless Palette ----------------
  const seoPaletteState = {
    open: false,
    targetIds: [],
    operatorIds: [],
    operation: 'subtraction_upward',
    newSurfaces: 'operator', // 'operator' | 'target'
    maintainOpen: true
  };

  function getSelectedValidSeoIds() {
    const m = global.model;
    return (global.selected || []).filter(id => {
      const el = m?.elements?.find(e => e.id === id);
      return el && SEO_SUPPORTED_TYPES.includes(el.type);
    });
  }

  function renderSEOPalette() {
    const pal = document.getElementById('seo-palette');
    if (!pal) return;
    if (!seoPaletteState.open) {
      pal.classList.add('hidden');
      return;
    }
    pal.classList.remove('hidden');

    const m = global.model;
    const esc = global.esc || (s => String(s));
    const elById = new Map((m?.elements || []).map(e => [e.id, e]));

    // Prune deleted IDs cleanly
    seoPaletteState.targetIds = seoPaletteState.targetIds.filter(id => elById.has(id));
    seoPaletteState.operatorIds = seoPaletteState.operatorIds.filter(id => elById.has(id) && !seoPaletteState.targetIds.includes(id));

    const curSelIds = getSelectedValidSeoIds();
    const ops = Array.isArray(m?.seoOperations) ? m.seoOperations : [];
    const selOps = curSelIds.length
      ? ops.filter(op => curSelIds.includes(op.targetId) || curSelIds.includes(op.operatorId))
      : ops;

    const opLabels = {
      subtraction: ['Subtraction', 'Target − Operator volume'],
      subtraction_upward: ['Subtraction with upward extrusion', 'Subtracts Operator + everything above it'],
      subtraction_downward: ['Subtraction with downward extrusion', 'Subtracts Operator + everything below it'],
      intersection: ['Intersection', 'Keeps common intersecting 3D volume'],
      addition: ['Addition', 'Merges Operator solid onto Target']
    };

    const targetBadges = seoPaletteState.targetIds.length
      ? seoPaletteState.targetIds.map(id => `<span class="seo-chip">${esc(id)}</span>`).join('')
      : '<span class="seo-muted">None chosen — select elements & click Get</span>';

    const opBadges = seoPaletteState.operatorIds.length
      ? seoPaletteState.operatorIds.map(id => `<span class="seo-chip seo-chip-op">${esc(id)}</span>`).join('')
      : '<span class="seo-muted">None chosen — select elements & click Get</span>';

    const linksHtml = ops.length
      ? ops.map(op => {
          const isHighlight = curSelIds.includes(op.targetId) || curSelIds.includes(op.operatorId);
          return `
            <div class="seo-link-row ${isHighlight ? 'active' : ''}">
              <div style="min-width:0;flex:1">
                <div style="font-weight:700;color:#0f172a;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  ${esc(op.targetId)} ← ${esc(op.operatorId)}
                </div>
                <div style="font-size:9px;color:#64748b">${esc(opLabels[op.operation]?.[0] || op.operation)} · ${(op.newSurfaces || 'operator') === 'operator' ? 'Operator surf.' : 'Target surf.'}</div>
              </div>
              <button type="button" class="seo-cancel-link-btn" data-seo-cancel="${esc(op.id)}" title="Cancel this Solid Element Operation">✕</button>
            </div>
          `;
        }).join('')
      : '<div class="seo-muted" style="padding:4px 0">No active associative SEO operations in project.</div>';

    const body = document.getElementById('seo-palette-body');
    if (!body) return;
    body.innerHTML = `
      <div class="seo-section">
        <div class="seo-step-hdr">
          <span>1. TARGET ELEMENTS</span>
          <span class="seo-count">${seoPaletteState.targetIds.length}</span>
        </div>
        <div class="seo-btn-row">
          <button id="seo-get-targets-btn" type="button" class="seo-get-btn" title="Assign current canvas selection (${curSelIds.length}) as Target Elements">
            Get Target Elements ${curSelIds.length ? `(+${curSelIds.length})` : ''}
          </button>
          <button id="seo-clear-targets-btn" type="button" class="seo-mini-btn" title="Clear Target list">Clear</button>
        </div>
        <div class="seo-chips-wrap">${targetBadges}</div>
      </div>

      <div class="seo-section">
        <div class="seo-step-hdr">
          <span>2. OPERATOR ELEMENTS</span>
          <span class="seo-count op">${seoPaletteState.operatorIds.length}</span>
        </div>
        <div class="seo-btn-row">
          <button id="seo-get-operators-btn" type="button" class="seo-get-btn" title="Assign current canvas selection (${curSelIds.length}) as Operator Elements">
            Get Operator Elements ${curSelIds.length ? `(+${curSelIds.length})` : ''}
          </button>
          <button id="seo-clear-operators-btn" type="button" class="seo-mini-btn" title="Clear Operator list">Clear</button>
        </div>
        <div class="seo-chips-wrap">${opBadges}</div>
      </div>

      <div class="seo-section">
        <div class="seo-step-hdr"><span>3. CHOOSE OPERATION</span></div>
        <select id="seo-operation-select" class="seo-select">
          ${Object.entries(opLabels).map(([k, [lbl]]) => `<option value="${k}" ${seoPaletteState.operation === k ? 'selected' : ''}>${lbl}</option>`).join('')}
        </select>
        <div class="seo-op-desc">${esc(opLabels[seoPaletteState.operation]?.[1] || '')}</div>
      </div>

      <div class="seo-section">
        <div class="seo-step-hdr"><span>4. NEW SURFACES OF TARGET</span></div>
        <label class="seo-radio">
          <input type="radio" name="seo-new-surf" value="operator" ${seoPaletteState.newSurfaces === 'operator' ? 'checked' : ''}>
          <span>Inherit attributes from Operator</span>
        </label>
        <label class="seo-radio">
          <input type="radio" name="seo-new-surf" value="target" ${seoPaletteState.newSurfaces === 'target' ? 'checked' : ''}>
          <span>Use their own attributes (Target)</span>
        </label>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:8px">
        <button id="seo-execute-btn" type="button" class="seo-exec-btn" ${(!seoPaletteState.targetIds.length || !seoPaletteState.operatorIds.length) ? 'disabled' : ''}>
          ⚡ Execute
        </button>
        <button id="seo-switch-3d-btn" type="button" class="seo-mini-btn" style="padding:6px 8px;font-weight:700" title="Switch to 3D Model to inspect Boolean result">3D View</button>
      </div>

      <div class="seo-section" style="margin-bottom:0">
        <div class="seo-step-hdr" style="cursor:pointer" id="seo-maintain-toggle">
          <span>5. MAINTAIN OPERATIONS (${ops.length})</span>
          <span style="font-size:10px;color:#64748b">${seoPaletteState.maintainOpen ? '▾' : '▸'}</span>
        </div>
        ${seoPaletteState.maintainOpen ? `
          <div class="seo-links-list">${linksHtml}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px">
            <button id="seo-cancel-target-ops" type="button" class="seo-mini-btn" ${!curSelIds.length ? 'disabled' : ''} title="Cancel all SEO operations modifying the selected Target elements">Cancel on Target</button>
            <button id="seo-cancel-op-ops" type="button" class="seo-mini-btn" ${!curSelIds.length ? 'disabled' : ''} title="Cancel all SEO operations driven by the selected Operator elements">Cancel as Operator</button>
          </div>
          ${ops.length ? `<button id="seo-cancel-all-ops" type="button" class="seo-mini-btn" style="width:100%;margin-top:4px;color:#dc2626">Cancel All Operations (${ops.length})</button>` : ''}
        ` : ''}
      </div>
    `;

    // Bind events inside SEO Palette
    document.getElementById('seo-get-targets-btn')?.addEventListener('click', () => {
      const ids = getSelectedValidSeoIds();
      if (!ids.length) {
        global.toast?.('Select Target elements on Plan or 3D view first.');
        return;
      }
      seoPaletteState.targetIds = [...new Set(ids)];
      seoPaletteState.operatorIds = seoPaletteState.operatorIds.filter(id => !seoPaletteState.targetIds.includes(id));
      renderSEOPalette();
      global.toast?.(`SEO: Assigned ${seoPaletteState.targetIds.length} Target element(s).`);
    });

    document.getElementById('seo-clear-targets-btn')?.addEventListener('click', () => {
      seoPaletteState.targetIds = [];
      renderSEOPalette();
    });

    document.getElementById('seo-get-operators-btn')?.addEventListener('click', () => {
      const ids = getSelectedValidSeoIds();
      if (!ids.length) {
        global.toast?.('Select Operator elements on Plan or 3D view first.');
        return;
      }
      seoPaletteState.operatorIds = [...new Set(ids)].filter(id => !seoPaletteState.targetIds.includes(id));
      renderSEOPalette();
      global.toast?.(`SEO: Assigned ${seoPaletteState.operatorIds.length} Operator element(s).`);
    });

    document.getElementById('seo-clear-operators-btn')?.addEventListener('click', () => {
      seoPaletteState.operatorIds = [];
      renderSEOPalette();
    });

    document.getElementById('seo-operation-select')?.addEventListener('change', (ev) => {
      seoPaletteState.operation = ev.target.value;
      renderSEOPalette();
    });

    document.querySelectorAll('input[name="seo-new-surf"]').forEach(r => {
      r.addEventListener('change', (ev) => {
        seoPaletteState.newSurfaces = ev.target.value;
      });
    });

    document.getElementById('seo-execute-btn')?.addEventListener('click', executeSEOPalette);
    document.getElementById('seo-switch-3d-btn')?.addEventListener('click', () => global.setView?.('3d'));
    document.getElementById('seo-maintain-toggle')?.addEventListener('click', () => {
      seoPaletteState.maintainOpen = !seoPaletteState.maintainOpen;
      renderSEOPalette();
    });

    document.querySelectorAll('[data-seo-cancel]').forEach(btn => {
      btn.addEventListener('click', () => cancelSEOOperationById(btn.dataset.seoCancel));
    });

    document.getElementById('seo-cancel-target-ops')?.addEventListener('click', () => {
      const ids = getSelectedValidSeoIds();
      cancelSEOForElements(ids, 'target');
    });
    document.getElementById('seo-cancel-op-ops')?.addEventListener('click', () => {
      const ids = getSelectedValidSeoIds();
      cancelSEOForElements(ids, 'operator');
    });
    document.getElementById('seo-cancel-all-ops')?.addEventListener('click', () => {
      if (!global.model?.seoOperations?.length) return;
      global.commit?.(() => {
        global.model.seoOperations = [];
      }, false);
      _seoEvalCache.rev = null;
      renderSEOPalette();
      global.toast?.('Cancelled all Solid Element Operations.');
    });
  }

  function executeSEOPalette() {
    const m = global.model;
    if (!m) return;
    const tIds = seoPaletteState.targetIds.filter(id => m.elements.some(e => e.id === id));
    const oIds = seoPaletteState.operatorIds.filter(id => m.elements.some(e => e.id === id) && !tIds.includes(id));
    if (!tIds.length || !oIds.length) {
      global.toast?.('Choose both Target Elements and Operator Elements before clicking Execute.');
      return;
    }

    const opType = seoPaletteState.operation || 'subtraction';
    const newSurfaces = seoPaletteState.newSurfaces || 'operator';

    const ok = global.commit(() => {
      if (!Array.isArray(m.seoOperations)) m.seoOperations = [];
      for (const tid of tIds) {
        for (const oid of oIds) {
          // Replace duplicate target+operator+operation pair or append cleanly
          const existing = m.seoOperations.find(x => x.targetId === tid && x.operatorId === oid && x.operation === opType);
          if (existing) {
            existing.newSurfaces = newSurfaces;
            existing.enabled = true;
          } else {
            m.seoOperations.push({
              id: `SEO-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              targetId: tid,
              operatorId: oid,
              operation: opType,
              newSurfaces,
              enabled: true
            });
          }
        }
      }
    }, false);

    if (ok) {
      _seoEvalCache.rev = null;
      renderSEOPalette();
      if (typeof global.render === 'function') global.render();
      global.toast?.(`Solid Element Operation executed: ${opType.replace(/_/g, ' ')} on ${tIds.length} Target(s) with ${oIds.length} Operator(s).`);
    }
  }

  function cancelSEOOperationById(opId) {
    const m = global.model;
    if (!m || !Array.isArray(m.seoOperations)) return;
    const before = m.seoOperations.length;
    global.commit(() => {
      m.seoOperations = m.seoOperations.filter(op => op.id !== opId);
    }, false);
    if (m.seoOperations.length !== before) {
      _seoEvalCache.rev = null;
      renderSEOPalette();
      global.toast?.('Cancelled Solid Element Operation link.');
    }
  }

  function cancelSEOForElements(elementIds, role = 'both') {
    const m = global.model;
    if (!m || !Array.isArray(m.seoOperations) || !elementIds?.length) return;
    const set = new Set(elementIds);
    const before = m.seoOperations.length;
    global.commit(() => {
      m.seoOperations = m.seoOperations.filter(op => {
        if (role === 'target') return !set.has(op.targetId);
        if (role === 'operator') return !set.has(op.operatorId);
        return !set.has(op.targetId) && !set.has(op.operatorId);
      });
    }, false);
    const removed = before - m.seoOperations.length;
    if (removed > 0) {
      _seoEvalCache.rev = null;
      renderSEOPalette();
      global.toast?.(`Cancelled ${removed} Solid Element Operation link(s).`);
    } else {
      global.toast?.('No matching SEO operations found on selection.');
    }
  }

  function openSEOPalette(toggle = false) {
    if (toggle) seoPaletteState.open = !seoPaletteState.open;
    else seoPaletteState.open = true;

    // Auto-populate Target if Targets are empty and selection has elements
    if (seoPaletteState.open && !seoPaletteState.targetIds.length) {
      const sel = getSelectedValidSeoIds();
      if (sel.length) seoPaletteState.targetIds = [...sel];
    }
    if (global._closedFloatingPopups) {
      global._closedFloatingPopups.delete('seo-palette');
    }
    renderSEOPalette();
    document.getElementById('seo-palette-btn')?.classList.toggle('active', seoPaletteState.open);
  }

  function closeSEOPalette() {
    seoPaletteState.open = false;
    renderSEOPalette();
    document.getElementById('seo-palette-btn')?.classList.remove('active');
  }

  function clearAllConnectLinksOnSelection() {
    const m = global.model;
    const ids = global.selected || [];
    if (!m || !ids.length) {
      global.toast?.('Select elements first to clear Roof Trim or SEO links.');
      return;
    }
    let trimCleared = 0, seoCleared = 0;
    const idSet = new Set(ids);
    global.commit(() => {
      for (const el of m.elements) {
        if (idSet.has(el.id) && el.roofTrim) {
          delete el.roofTrim;
          trimCleared++;
        }
      }
      if (Array.isArray(m.seoOperations)) {
        const before = m.seoOperations.length;
        m.seoOperations = m.seoOperations.filter(op => !idSet.has(op.targetId) && !idSet.has(op.operatorId));
        seoCleared = before - m.seoOperations.length;
      }
    }, false);
    _seoEvalCache.rev = null;
    renderSEOPalette();
    global.toast?.(`Cleared ${trimCleared} Roof Trim(s) and ${seoCleared} SEO Operation(s).`);
  }

  function getElementConnectSummary(el, mRef) {
    const m = mRef || global.model;
    if (!el || !m) return { roofTrim: null, asTarget: [], asOperator: [] };
    const ops = Array.isArray(m.seoOperations) ? m.seoOperations : [];
    return {
      roofTrim: el.roofTrim && el.roofTrim.enabled !== false ? el.roofTrim : null,
      asTarget: ops.filter(op => op.targetId === el.id && op.enabled !== false),
      asOperator: ops.filter(op => op.operatorId === el.id && op.enabled !== false)
    };
  }

  // Expose public API globally
  global.seoTrimEngine = {
    BSPNode,
    csgSubtractPolys,
    csgIntersectPolys,
    csgUnionPolys,
    elementToSolids,
    evaluateElementOperatedPolygons,
    emitOperatedElementFaces,
    hasTrimOrSEO,
    evaluateElementRoofTrimAt,
    applyRoofTrimToWallFraming,
    drawOperatedElementElevation,
    executeTrimElementsToRoof,
    startPickRoofForTrim,
    completePickRoofForTrim,
    openTrimToRoofModal,
    openSEOPalette,
    closeSEOPalette,
    renderSEOPalette,
    executeSEOPalette,
    cancelSEOOperationById,
    cancelSEOForElements,
    clearAllConnectLinksOnSelection,
    getElementConnectSummary,
    seoPaletteState
  };

  global.hasTrimOrSEO = hasTrimOrSEO;
  global.emitOperatedElementFaces = emitOperatedElementFaces;
  global.evaluateElementOperatedPolygons = evaluateElementOperatedPolygons;
  global.evaluateElementRoofTrimAt = evaluateElementRoofTrimAt;
  global.applyRoofTrimToWallFraming = applyRoofTrimToWallFraming;
  global.drawOperatedElementElevation = drawOperatedElementElevation;
  global.openTrimToRoofModal = openTrimToRoofModal;
  global.openSEOPalette = openSEOPalette;
  global.closeSEOPalette = closeSEOPalette;
  global.renderSEOPalette = renderSEOPalette;
  global.executeSEOPalette = executeSEOPalette;
  global.executeTrimElementsToRoof = executeTrimElementsToRoof;
  global.startPickRoofForTrim = startPickRoofForTrim;
  global.completePickRoofForTrim = completePickRoofForTrim;
  global.cancelSEOOperationById = cancelSEOOperationById;
  global.cancelSEOForElements = cancelSEOForElements;
  global.clearAllConnectLinksOnSelection = clearAllConnectLinksOnSelection;
  global.getElementConnectSummary = getElementConnectSummary;
})(typeof window !== 'undefined' ? window : globalThis);
