/*
 * Wall panel package (single metric PDF)
 * --------------------------------------
 * Exports one PDF containing per-storey wall framing plans, individual wall-panel
 * elevations, opening schedules, cut lists, sheathing layouts and a material summary.
 * Model dimensions and timber sizes are displayed in millimetres; areas are in m2
 * and estimated timber volume is in m3. Panel breaks target the longest lawful
 * segment to reduce the panel count while avoiding openings, corners and junctions.
 * Structural design and construction approvals remain subject to engineer/manufacturer review.
 */
(function () {
  const win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
  const PAGE_W = 792, PAGE_H = 612; // US letter landscape, points
  const MARGIN = 30;
  const MM_PER_IN = 25.4;
  const SHEET_W = 1219.2, SHEET_H = 2438.4; // standard sheet dimensions, mm
  const OSB_THICKNESS_MM = 12; // requested exterior wall sheathing thickness
  const TYPE_ORDER = ['Bottom plate', 'Top plate', 'King stud', 'Trimmer', 'Header', 'Sill', 'Sill cripple', 'Common stud', 'Stud', 'Jack stud',
    'Header stud', 'Upper cripple', 'Lower cripple', 'Cripple', 'Corner pack', 'Corner backing stud', 'T-junction studs', 'Block'];
  const FILL = {
    'Bottom plate': [1, 1, 1], 'Top plate': [1, 1, 1],
    'King stud': [1, 1, 1], 'Trimmer': [1, 1, 1], 'Common stud': [1, 1, 1],
    'Header': [1, 1, 1], 'Sill': [1, 1, 1], 'Sill cripple': [1, 1, 1],
    'Header stud': [1, 1, 1],
    'Block': [1, 1, 1], 'Beam': [1, 1, 1],
  };
  const DEFAULT_FILL = [1, 1, 1];
  const PLAN_FILL = { 'Bottom plate': [0.62, 0.46, 0.27], 'Top plate': [0.62, 0.46, 0.27], Header: [0.50, 0.34, 0.18] };

  // ------------------------------------------------------------ units & names
  /** Display a model dimension as rounded millimetres or feet-and-inches depending on window.appUnits. */
  function fmtMm(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    if (win.appUnits === 'ft-in' && typeof win.formatLength === 'function') {
      return win.formatLength(n);
    }
    return String(Math.round(n));
  }
  // Keep the historical internal name as an alias so older integration code does not break.
  const fis = fmtMm;
  const sqm = mm2 => mm2 / 1_000_000;

  /** Read timber cross sections as metric dimensions. Legacy imperial codes are normalized to actual dressed sizes. */
  function sectionDimensions(section) {
    const raw = String(section || '').trim();
    const m = raw.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    if (m) {
      let a = Number(m[1]), b = Number(m[2]);
      if (a <= 24 && b <= 24) {
        const actualDepth = { 4: 89, 6: 140, 8: 184, 10: 235, 12: 286 };
        return { width: 38, depth: actualDepth[Math.round(b)] || Math.round(b * 25.4) };
      }
      return { width: Math.round(a), depth: Math.round(b) };
    }
    const one = raw.match(/(\d+(?:\.\d+)?)/);
    const depth = one ? Number(one[1]) : 90;
    return { width: 45, depth: Math.round(depth) };
  }
  function metricSectionLabel(section) {
    const d = sectionDimensions(section);
    if (win.appUnits === 'ft-in' && typeof win.formatSection === 'function') {
      return win.formatSection(d.width, d.depth);
    }
    return `${d.width} x ${d.depth} mm`;
  }
  function timberVolumeM3(rows) {
    return rows.reduce((sum, r) => {
      const d = sectionDimensions(r.section);
      return sum + (d.width * d.depth * Number(r.length || 0) * Number(r.qty || 0)) / 1_000_000_000;
    }, 0);
  }
  const pdfText = s => String(s).replace(/·/g, '-').replace(/×/g, 'x').replace(/[\\()]/g, m => '\\' + m).replace(/[^\x20-\x7E]/g, '?');

  // ------------------------------------------------------------ PDF writer (vector + Helvetica)
  class Page {
    constructor() { this.ops = []; this.showText = true; }
    y(v) { return PAGE_H - v; }
    color(c, stroke) {
      const rgb = Array.isArray(c) && c.length >= 3 ? c : [0, 0, 0];
      return `${rgb[0].toFixed(3)} ${rgb[1].toFixed(3)} ${rgb[2].toFixed(3)} ${stroke ? 'RG' : 'rg'}`;
    }
    line(x1, y1, x2, y2, { w = 0.5, c = [0, 0, 0], dash = null } = {}) {
      if (dash && dash.length) {
        this.ops.push(`q [${dash.join(' ')}] 0 d ${this.color(c, true)} ${w} w ${x1.toFixed(2)} ${this.y(y1).toFixed(2)} m ${x2.toFixed(2)} ${this.y(y2).toFixed(2)} l S Q`);
      } else {
        this.ops.push(`${this.color(c, true)} ${w} w ${x1.toFixed(2)} ${this.y(y1).toFixed(2)} m ${x2.toFixed(2)} ${this.y(y2).toFixed(2)} l S`);
      }
    }
    poly(pts, { fill, stroke = [0, 0, 0], w = 0.6, dash = null } = {}) {
      if (!pts || pts.length < 2) return;
      let s = '';
      if (dash && dash.length) {
        s += `q [${dash.join(' ')}] 0 d `;
      }
      if (stroke) s += `${this.color(stroke, true)} ${w} w `;
      s += `${pts[0][0].toFixed(2)} ${this.y(pts[0][1]).toFixed(2)} m `;
      for (let i = 1; i < pts.length; i++) s += `${pts[i][0].toFixed(2)} ${this.y(pts[i][1]).toFixed(2)} l `;
      s += 'h ';
      if (fill) { s += `${this.color(fill)} `; s += stroke ? 'B' : 'f'; }
      else if (stroke) s += 'S';
      else return;
      if (dash && dash.length) {
        s += ' Q';
      }
      this.ops.push(s);
    }
    /** Fill at 50% opacity (graphics state GS50), no outline. */
    fillAlpha(pts, fill) {
      if (!pts || pts.length < 2) return;
      let s = `q /GS50 gs ${this.color(fill)} ${pts[0][0].toFixed(2)} ${this.y(pts[0][1]).toFixed(2)} m `;
      for (let i = 1; i < pts.length; i++) s += `${pts[i][0].toFixed(2)} ${this.y(pts[i][1]).toFixed(2)} l `;
      this.ops.push(s + 'h f Q');
    }
    /** Hidden-line outline: dashed stroke. */
    dashed(pts, { stroke = [0, 0, 0], w = 0.5, dash = [3, 2] } = {}) {
      if (!pts || pts.length < 2) return;
      let s = `q [${dash.join(' ')}] 0 d ${this.color(stroke, true)} ${w} w ${pts[0][0].toFixed(2)} ${this.y(pts[0][1]).toFixed(2)} m `;
      for (let i = 1; i < pts.length; i++) s += `${pts[i][0].toFixed(2)} ${this.y(pts[i][1]).toFixed(2)} l `;
      this.ops.push(s + 'h S Q');
    }
    rect(x, y, w, h, { fill, stroke = [0, 0, 0], lw = 0.5 } = {}) {
      this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { fill, stroke, w: lw });
    }
    /** Draw embedded JPEG XObject (/ImPanel3D) at top-left (x, y) with width w and height h in PDF points. */
    image(x, y, w, h, name = 'ImPanel3D') {
      const imgData = getPlaceholderJpeg();
      if (!imgData || !imgData.hex) return false;
      this.hasImage = true;
      const pdfY = this.y(y + h);
      this.ops.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${pdfY.toFixed(2)} cm /${name} Do Q`);
      return true;
    }
    /** rot: angle in degrees counterclockwise (0 = horizontal, 90 = reads upward). align: left | center | right. */
    text(x, y, str, { size = 8, bold = false, align = 'left', c = [0, 0, 0], rot = 0 } = {}) {
      if (!this.showText) return;
      const s = pdfText(str);
      const scaledSize = size * (this.textScale || 1.0);
      const approx = s.length * scaledSize * (bold ? 0.56 : 0.5);
      const font = bold ? 'F2' : 'F1';
      if (rot === 90) {
        const start = y + (align === 'right' ? approx : align === 'center' ? approx / 2 : 0);
        this.ops.push(`BT /${font} ${scaledSize} Tf ${this.color(c)} 0 1 -1 0 ${x.toFixed(2)} ${this.y(start).toFixed(2)} Tm (${s}) Tj ET`);
      } else if (rot && Math.abs(rot) > 1e-3) {
        const rad = (rot * Math.PI) / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const off = align === 'right' ? approx : align === 'center' ? approx / 2 : 0;
        const sx = x - cos * off;
        const sy = y + sin * off;
        this.ops.push(`BT /${font} ${scaledSize} Tf ${this.color(c)} ${cos.toFixed(4)} ${sin.toFixed(4)} ${(-sin).toFixed(4)} ${cos.toFixed(4)} ${sx.toFixed(2)} ${this.y(sy).toFixed(2)} Tm (${s}) Tj ET`);
      } else {
        const off = align === 'right' ? -approx : align === 'center' ? -approx / 2 : 0;
        this.ops.push(`BT /${font} ${scaledSize} Tf ${this.color(c)} ${(x + off).toFixed(2)} ${this.y(y).toFixed(2)} Td (${s}) Tj ET`);
      }
    }
  }

  const TIMBER_PANEL_PLACEHOLDER_IMG_URL = '/src/assets/images/timber_wall_panel_1794386067714.jpg';
  win.TIMBER_PANEL_PLACEHOLDER_IMG_URL = TIMBER_PANEL_PLACEHOLDER_IMG_URL;

  function bytesToAsciiHex(bytes) {
    const hexChars = new Array(bytes.length + 1);
    for (let i = 0; i < bytes.length; i++) {
      hexChars[i] = bytes[i].toString(16).padStart(2, '0');
    }
    hexChars[bytes.length] = '>';
    return hexChars.join('');
  }

  function parseJpegDimensions(bytes) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xFF) { i++; continue; }
      const marker = bytes[i + 1];
      if (marker === 0xC0 || marker === 0xC2) {
        const height = (bytes[i + 5] << 8) | bytes[i + 6];
        const width = (bytes[i + 7] << 8) | bytes[i + 8];
        if (width > 0 && height > 0) return { width, height };
        break;
      }
      const segLen = (bytes[i + 2] << 8) | bytes[i + 3];
      if (segLen < 2) break;
      i += 2 + segLen;
    }
    return { width: 1376, height: 768 };
  }

  function getPlaceholderJpeg() {
    if (win.__wallPanelPlaceholderJpeg && win.__wallPanelPlaceholderJpeg.hex) {
      return win.__wallPanelPlaceholderJpeg;
    }
    if (typeof document !== 'undefined') {
      const imgEl = document.getElementById('wall-panel-3d-placeholder-img');
      if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
        try {
          const c = document.createElement('canvas');
          c.width = imgEl.naturalWidth;
          c.height = imgEl.naturalHeight;
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(imgEl, 0, 0);
          const dataUrl = c.toDataURL('image/jpeg', 0.88);
          const b64 = dataUrl.split(',')[1] || '';
          if (b64 && typeof atob === 'function') {
            const bin = atob(b64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            win.__wallPanelPlaceholderJpeg = {
              hex: bytesToAsciiHex(bytes),
              width: c.width,
              height: c.height
            };
            return win.__wallPanelPlaceholderJpeg;
          }
        } catch (err) {
          // ignore canvas fallback errors
        }
      }
    }
    try {
      const reqFn = typeof require === 'function' ? require : null;
      if (reqFn) {
        const fs = reqFn('fs');
        const candidatePaths = [
          'src/assets/images/timber_wall_panel_1794386067714.jpg',
          'public/assets/images/timber_wall_panel_1794386067714.jpg'
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            const buf = fs.readFileSync(p);
            const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
            const { width, height } = parseJpegDimensions(bytes);
            win.__wallPanelPlaceholderJpeg = {
              hex: bytesToAsciiHex(bytes),
              width,
              height
            };
            return win.__wallPanelPlaceholderJpeg;
          }
        }
      }
    } catch (err) {
      // ignore non-Node environment
    }
    return null;
  }

  if (typeof fetch === 'function' && typeof window !== 'undefined') {
    fetch(TIMBER_PANEL_PLACEHOLDER_IMG_URL)
      .then(r => r.ok ? r.arrayBuffer() : fetch('/assets/images/timber_wall_panel_1794386067714.jpg').then(r2 => r2.ok ? r2.arrayBuffer() : null))
      .then(ab => {
        if (!ab) return;
        const bytes = new Uint8Array(ab);
        const { width, height } = parseJpegDimensions(bytes);
        win.__wallPanelPlaceholderJpeg = {
          hex: bytesToAsciiHex(bytes),
          width,
          height
        };
      })
      .catch(() => {});
  }

  function buildPdf(pages) {
    const objs = [];
    const add = s => { objs.push(s); return objs.length; };
    add('<< /Type /Catalog /Pages 2 0 R >>');
    add('');
    add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
    let imgObjNum = 0;
    const anyImage = pages.some(pg => pg.hasImage);
    if (anyImage) {
      const imgData = getPlaceholderJpeg();
      if (imgData && imgData.hex) {
        imgObjNum = add(
          `<< /Type /XObject /Subtype /Image /Width ${imgData.width} /Height ${imgData.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${imgData.hex.length} >>\nstream\n${imgData.hex}\nendstream`
        );
      }
    }
    const kids = [];
    for (const pg of pages) {
      const content = pg.ops.join('\n');
      const cnum = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
      const xObjStr = (pg.hasImage && imgObjNum > 0) ? ` /XObject << /ImPanel3D ${imgObjNum} 0 R >>` : '';
      const pnum = add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /ExtGState << /GS50 << /Type /ExtGState /ca 0.5 /CA 0.5 >> >>${xObjStr} >> /Contents ${cnum} 0 R >>`);
      kids.push(`${pnum} 0 R`);
    }
    objs[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;
    let out = '%PDF-1.4\n';
    const offsets = [];
    objs.forEach((body, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${body}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    offsets.forEach(o => { out += String(o).padStart(10, '0') + ' 00000 n \n'; });
    out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return out;
  }

  // ------------------------------------------------------------ model helpers
  const wallLength = w => Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y);
  /** OSB is only applied to walls explicitly identified as exterior/external/outside.
   * Interior, partition and party walls are never counted as exterior sheathing. */
  function isExteriorWall(w) {
    if (!w) return false;
    const descriptor = [w.layer, w.wallType, w.classification, w.category, w.name, w.typeName]
      .filter(Boolean).join(' ');
    if (/(interior|internal|partition|party wall)/i.test(descriptor)) return false;
    if (w.isExternal === true || w.isExterior === true || w.exterior === true || String(w.reference || '').toLowerCase() === 'outside') return true;
    return /(exterior|external|outer\s*wall|outside)/i.test(descriptor);
  }
  function orderWallsAndOpenings(rawWalls, model) {
    if (typeof win.orderStoryWallsAndOpenings === 'function') {
      return win.orderStoryWallsAndOpenings(rawWalls, model, isExteriorWall);
    }
    if (!Array.isArray(rawWalls) || !rawWalls.length) {
      return {
        orderedWalls: [],
        extWalls: [],
        intWalls: [],
        map: new Map(),
        openingCodeMap: new Map(),
        openingRawCodeMap: new Map(),
        orderDirMap: new Map(),
        clusters: []
      };
    }

    const ptSegDist = (p, a, b) => {
      const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
      if (l2 < 1e-6) return Math.hypot(p.x - a.x, p.y - a.y);
      const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
      return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
    };
    const wallWallDist = (w1, w2) => Math.min(
      ptSegDist(w1.a, w2.a, w2.b),
      ptSegDist(w1.b, w2.a, w2.b),
      ptSegDist(w2.a, w1.a, w1.b),
      ptSegDist(w2.b, w1.a, w1.b)
    );

    const n = rawWalls.length;
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const unite = (i, j) => { const ri = find(i), rj = find(j); if (ri !== rj) parent[ri] = rj; };
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (wallWallDist(rawWalls[i], rawWalls[j]) <= 800) unite(i, j);
      }
    }

    const rawGroupMap = new Map();
    for (let i = 0; i < n; i++) {
      const r = find(i);
      if (!rawGroupMap.has(r)) rawGroupMap.set(r, []);
      rawGroupMap.get(r).push(rawWalls[i]);
    }
    const computeBounds = wList => {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const w of wList) {
        minX = Math.min(minX, w.a.x, w.b.x);
        maxX = Math.max(maxX, w.a.x, w.b.x);
        minY = Math.min(minY, w.a.y, w.b.y);
        maxY = Math.max(maxY, w.a.y, w.b.y);
      }
      return { minX, maxX, minY, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
    };

    let clusters = [...rawGroupMap.values()].map(wList => ({
      walls: wList,
      ...computeBounds(wList)
    }));

    if (clusters.length > 1) {
      clusters.sort((a, b) => b.walls.length - a.walls.length);
      const merged = [];
      for (const c of clusters) {
        const host = merged.find(m =>
          c.cx >= m.minX - 600 && c.cx <= m.maxX + 600 &&
          c.cy >= m.minY - 600 && c.cy <= m.maxY + 600
        );
        if (host) {
          host.walls.push(...c.walls);
          Object.assign(host, computeBounds(host.walls));
        } else {
          merged.push(c);
        }
      }
      clusters = merged;
    }

    clusters.sort((a, b) => (Math.round(a.minX / 500) - Math.round(b.minX / 500)) || (a.minY - b.minY));

    const buildCollinearRuns = (wList, gapTol = 550) => {
      const m = wList.length;
      if (!m) return [];
      const p = Array.from({ length: m }, (_, i) => i);
      const f = i => (p[i] === i ? i : (p[i] = f(p[i])));
      const u = (i, j) => { const ri = f(i), rj = f(j); if (ri !== rj) p[ri] = rj; };

      for (let i = 0; i < m; i++) {
        const w1 = wList[i];
        const l1 = Math.hypot(w1.b.x - w1.a.x, w1.b.y - w1.a.y) || 1;
        const u1 = { x: (w1.b.x - w1.a.x) / l1, y: (w1.b.y - w1.a.y) / l1 };
        for (let j = i + 1; j < m; j++) {
          const w2 = wList[j];
          const l2 = Math.hypot(w2.b.x - w2.a.x, w2.b.y - w2.a.y) || 1;
          const u2 = { x: (w2.b.x - w2.a.x) / l2, y: (w2.b.y - w2.a.y) / l2 };
          if (Math.abs(u1.x * u2.x + u1.y * u2.y) < 0.965) continue;
          const m2 = { x: (w2.a.x + w2.b.x) / 2, y: (w2.a.y + w2.b.y) / 2 };
          const perp = Math.abs(-(m2.x - w1.a.x) * u1.y + (m2.y - w1.a.y) * u1.x);
          if (perp > 220) continue;
          const p2a = (w2.a.x - w1.a.x) * u1.x + (w2.a.y - w1.a.y) * u1.y;
          const p2b = (w2.b.x - w1.a.x) * u1.x + (w2.b.y - w1.a.y) * u1.y;
          const lo = Math.min(p2a, p2b), hi = Math.max(p2a, p2b);
          const gap = Math.max(0, lo - l1, 0 - hi);
          if (gap <= gapTol) u(i, j);
        }
      }

      const runMap = new Map();
      for (let i = 0; i < m; i++) {
        const r = f(i);
        if (!runMap.has(r)) runMap.set(r, []);
        runMap.get(r).push(wList[i]);
      }

      const runs = [];
      for (const rWalls of runMap.values()) {
        let refW = rWalls[0], maxLen = -1;
        for (const w of rWalls) {
          const wl = Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y);
          if (wl > maxLen) { maxLen = wl; refW = w; }
        }
        const refL = Math.hypot(refW.b.x - refW.a.x, refW.b.y - refW.a.y) || 1;
        const refU = { x: (refW.b.x - refW.a.x) / refL, y: (refW.b.y - refW.a.y) / refL };
        let minP = Infinity, maxP = -Infinity;
        let end0 = refW.a, end1 = refW.b;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const w of rWalls) {
          for (const pt of [w.a, w.b]) {
            const proj = (pt.x - refW.a.x) * refU.x + (pt.y - refW.a.y) * refU.y;
            if (proj < minP) { minP = proj; end0 = pt; }
            if (proj > maxP) { maxP = proj; end1 = pt; }
            minX = Math.min(minX, pt.x); maxX = Math.max(maxX, pt.x);
            minY = Math.min(minY, pt.y); maxY = Math.max(maxY, pt.y);
          }
        }
        runs.push({
          walls: rWalls,
          end0,
          end1,
          startPt: end0,
          endPt: end1,
          runMid: { x: (end0.x + end1.x) / 2, y: (end0.y + end1.y) / 2 },
          minX, maxX, minY, maxY
        });
      }
      return runs;
    };

    const extWalls = [];
    const intWalls = [];
    const orderDirMap = new Map();

    for (const cluster of clusters) {
      const cExt = cluster.walls.filter(w => isExteriorWall(w));
      const cInt = cluster.walls.filter(w => !isExteriorWall(w));

      const refSet = cExt.length ? cExt : cluster.walls;
      let wSumX = 0, wSumY = 0, wLenSum = 0;
      for (const w of refSet) {
        const wl = Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y) || 1;
        wSumX += ((w.a.x + w.b.x) / 2) * wl;
        wSumY += ((w.a.y + w.b.y) / 2) * wl;
        wLenSum += wl;
      }
      const C = {
        x: 0.5 * cluster.cx + 0.5 * (wLenSum ? wSumX / wLenSum : cluster.cx),
        y: 0.5 * cluster.cy + 0.5 * (wLenSum ? wSumY / wLenSum : cluster.cy)
      };

      if (cExt.length) {
        const extRuns = buildCollinearRuns(cExt, 600);
        for (const r of extRuns) {
          const vx = r.end1.x - r.end0.x, vy = r.end1.y - r.end0.y;
          let crossCW = (r.runMid.x - C.x) * vy - (r.runMid.y - C.y) * vx;
          if (Math.abs(crossCW) < 1) {
            crossCW = Math.abs(vx) >= Math.abs(vy)
              ? (r.runMid.y <= C.y ? vx : -vx)
              : (r.runMid.x >= C.x ? vy : -vy);
          }
          r.startPt = crossCW >= 0 ? r.end0 : r.end1;
          r.endPt = crossCW >= 0 ? r.end1 : r.end0;
        }

        const startAngle = Math.atan2(cluster.minY - C.y, cluster.minX - C.x);
        const cwAngle = pt => {
          const a = Math.atan2(pt.y - C.y, pt.x - C.x);
          return ((a - startAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        };

        const topBandTol = Math.max(600, (cluster.maxY - cluster.minY) * 0.22);
        const topHorizRuns = extRuns.filter(r =>
          Math.abs(r.end1.x - r.end0.x) >= Math.abs(r.end1.y - r.end0.y) &&
          r.minY <= cluster.minY + topBandTol
        );
        let firstRun;
        if (topHorizRuns.length) {
          topHorizRuns.sort((a, b) => (a.minX - b.minX) || (a.minY - b.minY));
          firstRun = topHorizRuns[0];
        } else {
          extRuns.sort((a, b) =>
            ((a.minY - cluster.minY) + 0.5 * (a.minX - cluster.minX)) -
            ((b.minY - cluster.minY) + 0.5 * (b.minX - cluster.minX))
          );
          firstRun = extRuns[0];
        }

        const orderedExtRuns = [];
        const visited = new Set([firstRun]);
        orderedExtRuns.push(firstRun);
        let cur = firstRun;

        while (visited.size < extRuns.length) {
          const unvisited = extRuns.filter(r => !visited.has(r));
          let bestTouch = null, bestDist = 650;
          for (const cand of unvisited) {
            const dStart = Math.hypot(cand.startPt.x - cur.endPt.x, cand.startPt.y - cur.endPt.y);
            const dEnd = Math.hypot(cand.endPt.x - cur.endPt.x, cand.endPt.y - cur.endPt.y);
            const minD = Math.min(dStart, dEnd);
            if (minD <= bestDist) {
              bestDist = minD;
              bestTouch = { cand, flip: dEnd + 50 < dStart };
            }
          }
          if (bestTouch) {
            const { cand, flip } = bestTouch;
            if (flip) {
              const tmp = cand.startPt;
              cand.startPt = cand.endPt;
              cand.endPt = tmp;
            }
            visited.add(cand);
            orderedExtRuns.push(cand);
            cur = cand;
          } else {
            const curAng = cwAngle(cur.runMid);
            unvisited.sort((a, b) => {
              const da = ((cwAngle(a.runMid) - curAng) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
              const db = ((cwAngle(b.runMid) - curAng) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
              return da - db;
            });
            const next = unvisited[0];
            visited.add(next);
            orderedExtRuns.push(next);
            cur = next;
          }
        }

        for (const r of orderedExtRuns) {
          const rLen = Math.hypot(r.endPt.x - r.startPt.x, r.endPt.y - r.startPt.y) || 1;
          const rDir = { x: (r.endPt.x - r.startPt.x) / rLen, y: (r.endPt.y - r.startPt.y) / rLen };
          r.walls.sort((w1, w2) => {
            const p1 = (((w1.a.x + w1.b.x) / 2) - r.startPt.x) * rDir.x + (((w1.a.y + w1.b.y) / 2) - r.startPt.y) * rDir.y;
            const p2 = (((w2.a.x + w2.b.x) / 2) - r.startPt.x) * rDir.x + (((w2.a.y + w2.b.y) / 2) - r.startPt.y) * rDir.y;
            return p1 - p2;
          });
          for (const w of r.walls) {
            orderDirMap.set(w.id, rDir);
            extWalls.push(w);
          }
        }
      }

      if (cInt.length) {
        const intRuns = buildCollinearRuns(cInt, 450);
        for (const r of intRuns) {
          const dx = r.end1.x - r.end0.x, dy = r.end1.y - r.end0.y;
          const forward = Math.abs(dx) >= Math.abs(dy)
            ? (dx > 0 || (Math.abs(dx) < 1 && dy >= 0))
            : (dy > 0 || (Math.abs(dy) < 1 && dx >= 0));
          r.startPt = forward ? r.end0 : r.end1;
          r.endPt = forward ? r.end1 : r.end0;
          const rLen = Math.hypot(r.endPt.x - r.startPt.x, r.endPt.y - r.startPt.y) || 1;
          const rDir = { x: (r.endPt.x - r.startPt.x) / rLen, y: (r.endPt.y - r.startPt.y) / rLen };
          r.walls.sort((w1, w2) => {
            const p1 = (((w1.a.x + w1.b.x) / 2) - r.startPt.x) * rDir.x + (((w1.a.y + w1.b.y) / 2) - r.startPt.y) * rDir.y;
            const p2 = (((w2.a.x + w2.b.x) / 2) - r.startPt.x) * rDir.x + (((w2.a.y + w2.b.y) / 2) - r.startPt.y) * rDir.y;
            return p1 - p2;
          });
          for (const w of r.walls) orderDirMap.set(w.id, rDir);
        }

        intRuns.sort((a, b) => {
          const bandA = Math.round(a.minY / 600), bandB = Math.round(b.minY / 600);
          if (bandA !== bandB) return bandA - bandB;
          const xBandA = Math.round(a.minX / 400), xBandB = Math.round(b.minX / 400);
          if (xBandA !== xBandB) return xBandA - xBandB;
          return (a.runMid.y - b.runMid.y) || (a.runMid.x - b.runMid.x);
        });

        for (const r of intRuns) {
          for (const w of r.walls) intWalls.push(w);
        }
      }
    }

    const map = new Map();
    extWalls.forEach((w, i) => map.set(w.id, `E${String(i + 1).padStart(2, '0')}`));
    intWalls.forEach((w, i) => map.set(w.id, `I${String(i + 1).padStart(2, '0')}`));
    const orderedWalls = [...extWalls, ...intWalls];

    const openingCodeMap = new Map();
    const openingRawCodeMap = new Map();
    let winCount = 1, doorCount = 1;
    const allElements = model?.elements || [];
    const isImp = win.appUnits === 'ft-in';

    for (const w of orderedWalls) {
      const ops = allElements
        .filter(e => (e.type === 'window' || e.type === 'door') && e.host === w.id)
        .slice();
      const rDir = orderDirMap.get(w.id);
      const wVec = { x: w.b.x - w.a.x, y: w.b.y - w.a.y };
      const sameDir = !rDir || (wVec.x * rDir.x + wVec.y * rDir.y) >= -1e-6;
      ops.sort((p, q) => sameDir ? ((p.offset || 0) - (q.offset || 0)) : ((q.offset || 0) - (p.offset || 0)));

      for (const o of ops) {
        const wMm = Math.round(o.width || (o.type === 'door' ? 900 : 1200));
        const hMm = Math.round(o.height || (o.type === 'door' ? 2100 : 1200));
        const dimPair = isImp && typeof win.formatDimPair === 'function'
          ? win.formatDimPair(wMm, hMm).replace(/×/g, 'x')
          : `${wMm}x${hMm} mm`;
        if (o.type === 'door') {
          const rawCode = `D${String(doorCount++).padStart(2, '0')}`;
          openingRawCodeMap.set(o.id, rawCode);
          openingCodeMap.set(o.id, `${rawCode} (${dimPair})`);
        } else {
          const rawCode = `W${String(winCount++).padStart(2, '0')}`;
          openingRawCodeMap.set(o.id, rawCode);
          openingCodeMap.set(o.id, `${rawCode} (${dimPair})`);
        }
      }
    }

    return {
      orderedWalls,
      extWalls,
      intWalls,
      map,
      openingCodeMap,
      openingRawCodeMap,
      orderDirMap,
      clusters
    };
  }

  const wallsOfStory = (model, storyId) => {
    const raw = (model?.elements || []).filter(e => e.type === 'wall' && e.story === storyId);
    return orderWallsAndOpenings(raw, model).orderedWalls;
  };
  const openingsOf = (model, wallId) => model.elements.filter(e => (e.type === 'window' || e.type === 'door') && e.host === wallId).sort((p, q) => p.offset - q.offset);

  /** Metric wall-panel break rules:
   *  - target the longest lawful segment to minimize panel count;
   *  - each break gets a full-height end stud on both adjacent panels;
   *  - avoid openings and a 300 mm opening-edge clearance;
   *  - avoid corners, wall ends, and perpendicular wall junctions within 610 mm.
   * The 6000 mm default is configurable through generateWallPanelPackagePdf({panelMaxLengthMm}). */
  const PANEL_MIN_MM = 2400, PANEL_MAX_MM = 6000;
  const TIGHT_GAP_MM = 38.1;
  const OPENING_CLEAR_MM = 300, JUNCTION_CLEAR_MM = 610;
  function panelRules(options = {}) {
    const requestedMin = Number(options.panelMinLengthMm);
    const requestedMax = Number(options.panelMaxLengthMm);
    const min = Number.isFinite(requestedMin) && requestedMin >= 1200 ? Math.round(requestedMin) : PANEL_MIN_MM;
    const max = Number.isFinite(requestedMax) && requestedMax >= min ? Math.min(12000, Math.round(requestedMax)) : PANEL_MAX_MM;
    return { min, max, preferred: max };
  }

  /** Wall-end and junction positions (mm from wall start) where other walls meet this wall. */
  function breakDistances(w, walls) {
    const len = wallLength(w) || 1, u = { x: (w.b.x - w.a.x) / len, y: (w.b.y - w.a.y) / len };
    const ds = new Set([0, Math.round(len)]), tol = (w.thickness || 200) / 2 + 60;
    for (const o of walls) {
      if (o === w) continue;
      for (const p of [o.a, o.b]) {
        const dx = p.x - w.a.x, dy = p.y - w.a.y;
        const along = dx * u.x + dy * u.y, across = Math.abs(-dx * u.y + dy * u.x);
        if (across <= tol && along > 0 && along < len) ds.add(Math.round(along));
      }
    }
    return [...ds].sort((p, q) => p - q);
  }

  /** Zones along a wall where a break may not fall: junctions, wall ends, and each opening plus its clearance. */
  function noBreakZones(w, walls, model) {
    const len = wallLength(w) || 1;
    const zones = [[-1, JUNCTION_CLEAR_MM], [len - JUNCTION_CLEAR_MM, len + 1]];
    for (const d of breakDistances(w, walls)) zones.push([d - JUNCTION_CLEAR_MM, d + JUNCTION_CLEAR_MM]);
    for (const o of openingsOf(model, w.id)) zones.push([o.offset - o.width / 2 - OPENING_CLEAR_MM, o.offset + o.width / 2 + OPENING_CLEAR_MM]);
    return zones;
  }

  /**
   * Panel segments of one wall: NO auto wall breaking is applied.
   * Every wall remains 1 single intact panel from 0 to full length.
   */
  function panelSegments(w, walls, model, options = {}) {
    const len = wallLength(w) || 1;
    return [{ d0: 0, d1: len }];
  }

  function toFeetInches(mm) {
    const n = Number(mm);
    if (!Number.isFinite(n) || n <= 0) return win.appUnits === 'ft-in' ? '0"' : '0 mm';
    if (win.appUnits === 'ft-in' && typeof win.formatLength === 'function') return win.formatLength(n);
    return `${Math.round(n)} mm`;
  }

  function assignPanelLabels(walls, counters = { E: 0, I: 0, PW: 0 }, model, options = {}) {
    const map = new Map();
    const orderedWalls = orderWallsAndOpenings(walls, model).orderedWalls;
    for (const w of orderedWalls) {
      const isExt = isExteriorWall(w);
      const kind = isExt ? 'E' : 'I';
      counters[kind] += 1;
      const numStr = String(counters[kind]).padStart(2, '0');
      const label = `${kind}${numStr}`;
      const len = wallLength(w) || 1;
      const segments = [{ d0: 0, d1: len, label }];
      map.set(w.id, { segments, range: label });
    }
    return map;
  }

  /** King studs and trimmers beside each opening, counted from the wall framing (left - right). */
  function kingTrimmerCounts(o, members, sw) {
    const left = o.offset - o.width / 2, right = o.offset + o.width / 2;
    const near = (x, edge, reach) => Math.abs(x - edge) <= reach;
    const cnt = (type, edge, side) => members.filter(m => m.type === type &&
      near((m.x0 + m.x1) / 2, edge, 250) && (side === 'L' ? (m.x0 + m.x1) / 2 <= left + 1 : (m.x0 + m.x1) / 2 >= right - 1)).length;
    const kingL = cnt('King stud', left, 'L'), kingR = cnt('King stud', right, 'R');
    const trimL = cnt('Trimmer', left, 'L') + cnt('Jack stud', left, 'L'), trimR = cnt('Trimmer', right, 'R') + cnt('Jack stud', right, 'R');
    return { king: `${kingL} - ${kingR}`, trim: `${trimL} - ${trimR}` };
  }

  const memberKey = m => [m.type, m.section, Math.round(m.length)].join('|');

  /** Cut list grouped by type, section and length. */
  function cutListFor(members) {
    const groups = new Map();
    for (const m of members) {
      if (/^Beam$/i.test(m.type)) continue; // engineered beam, supplied separately (not lumber)
      const key = memberKey(m);
      if (!groups.has(key)) groups.set(key, { type: m.type, section: m.section, length: Math.round(m.length), qty: 0, key });
      groups.get(key).qty += 1;
    }
    const rank = t => { const i = TYPE_ORDER.indexOf(t); return i < 0 ? TYPE_ORDER.length : i; };
    const rows = [...groups.values()].sort((p, q) => rank(p.type) - rank(q.type) || q.length - p.length);
    const letter = i => (i < 26 ? String.fromCharCode(65 + i) : 'A' + String.fromCharCode(65 + i - 26));
    return rows.map((r, i) => ({ label: letter(i), ...r, sizeLabel: `${metricSectionLabel(r.section)} C16` }));
  }

  /**
   * Computes non-overlapping Mark label placements (A, B, C, ..., O) for all framing members
   * in a wall panel elevation. Every distinct member rectangle receives its Cutting List Mark
   * letter while avoiding adjacent packed studs, horizontal blocks, openings, and squaring badges.
   */
  function computePanelMemberMarks(members, rows, L, H, openings = [], X = x => x, Z = z => -z, s = 0.06, textScale = 0.85) {
    if (!Array.isArray(members) || !members.length) return [];
    const cutRows = Array.isArray(rows) && rows.length ? rows : cutListFor(members);
    const letterOf = new Map(cutRows.map(r => [r.key, r.label]));

    // Deduplicate identical 2D elevation rectangles (e.g. multi-ply headers occupying the exact same x0,x1,z0,z1)
    const seenRects = new Set();
    const uniqueItems = [];
    for (const m of members) {
      const letter = letterOf.get(memberKey(m));
      if (!letter || !Number.isFinite(m.x0) || !Number.isFinite(m.x1) || !Number.isFinite(m.z0) || !Number.isFinite(m.z1)) continue;
      const rk = `${letter}:${Math.round(m.x0 / 3)}:${Math.round(m.x1 / 3)}:${Math.round(m.z0 / 3)}:${Math.round(m.z1 / 3)}`;
      if (seenRects.has(rk)) continue;
      seenRects.add(rk);
      const isBlock = m.type === 'Block' || /block|noggin/i.test(m.type) || m.role === 'Horizontal backing';
      const isHeader = !isBlock && (m.type === 'Header' || (/header|lintel/i.test(m.type) && !/stud/i.test(m.type)));
      const isPlateOrSill = !isBlock && !isHeader && (m.type === 'Bottom plate' || m.type === 'Top plate' || m.type === 'Sill' || (/plate|sill/i.test(m.type) && !/cripple|stud/i.test(m.type)));
      const isCripple = !isBlock && !isHeader && !isPlateOrSill && (m.type === 'Header stud' || m.type === 'Upper cripple' || m.type === 'Lower cripple' || /cripple|header stud/i.test(m.type));
      const isFullStud = !isBlock && !isHeader && !isPlateOrSill && !isCripple;
      uniqueItems.push({ m, letter, isBlock, isHeader, isPlateOrSill, isCripple, isFullStud });
    }

    const fontSize = 3.8;
    const effSize = fontSize * (textScale || 0.85);
    const rectOverlap = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

    // Fixed obstacles: rotated squaring text along diagonal + opening rectangles
    const x0Page = X(0), z0Page = Z(0);
    const midDiagX = (X(0) + X(L)) / 2, midDiagZ = (Z(0) + Z(H)) / 2;
    const dDx = X(L) - X(0), dDz = Z(H) - Z(0);
    const dLen = Math.hypot(dDx, dDz) || 1;
    const ux = dDx / dLen, uz = dDz / dLen;
    const fixedObstacles = [];
    for (const step of [-24, -12, 0, 12, 24]) {
      const cx = midDiagX + ux * step - uz * 3.5;
      const cz = midDiagZ + uz * step + ux * 3.5;
      fixedObstacles.push({ x0: cx - 7, y0: cz - 5, x1: cx + 7, y1: cz + 5 });
    }
    for (const o of (openings || [])) {
      const left = o.offset - o.width / 2, right = o.offset + o.width / 2;
      const sill = o.sill || 0, top = sill + o.height;
      const ox0 = Math.min(X(left), X(right)), ox1 = Math.max(X(left), X(right));
      const oy0 = Math.min(Z(top), Z(sill)), oy1 = Math.max(Z(top), Z(sill));
      fixedObstacles.push({ x0: ox0 - 1, y0: oy0 - 1, x1: ox1 + 1, y1: oy1 + 1 });
    }

    // Horizontal block physical bars (so vertical studs avoid placing their letter on top of a block bar)
    const blockRectObstacles = uniqueItems.filter(it => it.isBlock).map(({ m }) => {
      const bx0 = Math.min(X(m.x0), X(m.x1)), bx1 = Math.max(X(m.x0), X(m.x1));
      const by0 = Math.min(Z(m.z1), Z(m.z0)), by1 = Math.max(Z(m.z1), Z(m.z0));
      return { x0: bx0 - 0.8, y0: by0 - 0.8, x1: bx1 + 0.8, y1: by1 + 0.8 };
    });

    const placedBoxes = [];
    const results = [];

    const makeBox = (cx, cy, letter) => {
      const halfW = Math.max(2.1, letter.length * effSize * 0.38);
      const halfH = Math.max(2.0, effSize * 0.56);
      return { x0: cx - halfW, y0: cy - halfH, x1: cx + halfW, y1: cy + halfH };
    };

    const chooseBest = (cands, letter, m, checkBlocks = false, extraPenaltyFn = null) => {
      let best = null, bestScore = Infinity;
      for (const [cx, cy] of cands) {
        const box = makeBox(cx, cy, letter);
        const padBox = { x0: box.x0 - 0.85, y0: box.y0 - 0.75, x1: box.x1 + 0.85, y1: box.y1 + 0.75 };
        let score = 0;
        for (const q of placedBoxes) {
          const ov = rectOverlap(padBox, q);
          if (ov > 0) score += 600 + ov * 1200;
        }
        for (const q of fixedObstacles) {
          const ov = rectOverlap(box, q);
          if (ov > 0) score += 450 + ov * 600;
        }
        if (checkBlocks) {
          for (const q of blockRectObstacles) {
            const ov = rectOverlap(box, q);
            if (ov > 0) score += 350 + ov * 500;
          }
        }
        if (extraPenaltyFn) score += extraPenaltyFn(cx, cy);
        if (score < bestScore) {
          bestScore = score;
          best = { cx, cy, box, padBox };
          if (score === 0) break;
        }
      }
      if (!best && cands.length) {
        const [cx, cy] = cands[0];
        const box = makeBox(cx, cy, letter);
        best = { cx, cy, box, padBox: box };
      }
      if (!best) return null;
      placedBoxes.push(best.padBox);
      const mwPt = Math.abs(X(m.x1) - X(m.x0));
      const mhPt = Math.abs(Z(m.z1) - Z(m.z0));
      const isBlock = m.type === 'Block' || /block|noggin/i.test(m.type);
      const backing = !isBlock && (mwPt < 5.5 || mhPt < 5.5);
      const modelX = s > 1e-6 ? (best.cx - x0Page) / s : (m.x0 + m.x1) / 2;
      const modelZ = s > 1e-6 ? (z0Page - best.cy) / s : (m.z0 + m.z1) / 2;
      const out = {
        m,
        letter,
        x: best.cx,
        y: best.cy,
        textY: best.cy + effSize * 0.35,
        fontSize,
        box: best.box,
        backing,
        modelX,
        modelZ
      };
      results.push(out);
      return out;
    };

    // 1. Place Blocks (Mark M)
    for (const { m, letter } of uniqueItems.filter(it => it.isBlock)) {
      const mx0 = Math.min(X(m.x0), X(m.x1)), mx1 = Math.max(X(m.x0), X(m.x1));
      const midX = (mx0 + mx1) / 2;
      const mzTop = Math.min(Z(m.z1), Z(m.z0)), mzBot = Math.max(Z(m.z1), Z(m.z0));
      const midZ = (mzTop + mzBot) / 2;
      const cands = [];
      const xShifts = [0, -3.5, 3.5, -7, 7];
      const yTargets = [mzTop - 2.3, mzBot + 2.5, midZ, mzTop - 5.2, mzBot + 5.2];
      for (const cy of yTargets) {
        for (const dx of xShifts) {
          let cx = midX + dx;
          if (mx1 - mx0 > 7) cx = Math.max(mx0 + 2, Math.min(mx1 - 2, cx));
          cands.push([cx, cy]);
        }
      }
      chooseBest(cands, letter, m, false);
    }

    // 2. Place Headers (Mark D)
    for (const { m, letter } of uniqueItems.filter(it => it.isHeader)) {
      const midX = X((m.x0 + m.x1) / 2);
      const midZ = Z((m.z0 + m.z1) / 2);
      const cands = [];
      for (const dy of [0, -3.2, 3.2, -6.0, 6.0]) {
        for (const dx of [0, -10, 10, -20, 20, -32, 32]) {
          cands.push([midX + dx, midZ + dy]);
        }
      }
      chooseBest(cands, letter, m, false);
    }

    // 3. Place Short Cripples / Header Studs (Marks H, I)
    const cripples = uniqueItems.filter(it => it.isCripple).sort((a, b) => ((a.m.x0 + a.m.x1) - (b.m.x0 + b.m.x1)) || (a.m.z0 - b.m.z0));
    let prevCrippleCx = -Infinity, crippleClusterIdx = 0;
    for (const { m, letter } of cripples) {
      const cx = X((m.x0 + m.x1) / 2);
      if (Math.abs(cx - prevCrippleCx) < 8.5 && Math.abs(m.z0 - (cripples[0]?.m?.z0 || 0)) < 1500) {
        crippleClusterIdx++;
      } else {
        crippleClusterIdx = 0;
      }
      prevCrippleCx = cx;

      const yTop = Math.min(Z(m.z1), Z(m.z0)), yBot = Math.max(Z(m.z1), Z(m.z0));
      const spanH = Math.max(1, yBot - yTop);
      const baseFracs = [0.50, 0.28, 0.72, 0.16, 0.84];
      const rotFracs = baseFracs.map((_, i) => baseFracs[(i + crippleClusterIdx) % baseFracs.length]);
      const cands = [];
      for (const f of rotFracs) {
        const cy = yBot - f * spanH;
        cands.push([cx, cy]);
      }
      // If the header stud / cripple is very short and packed next to another stud, allow small X/Y nudges
      for (const dx of [0, -2.5, 2.5, -4.5, 4.5]) {
        for (const f of rotFracs) {
          cands.push([cx + dx, yBot - f * spanH]);
        }
      }
      chooseBest(cands, letter, m, true);
    }

    // 4. Place Horizontal Plates & Sills (Marks A, B, E)
    const vertMembers = uniqueItems.filter(it => it.isFullStud || it.isCripple).map(it => it.m);
    const platesAndSills = uniqueItems.filter(it => it.isPlateOrSill).sort((a, b) => a.m.z0 - b.m.z0);
    const placedPlateXs = [];
    let plateIdx = 0;
    for (const { m, letter } of platesAndSills) {
      const spanA = Math.min(m.x0, m.x1), spanB = Math.max(m.x0, m.x1);
      const spanLen = Math.max(1, spanB - spanA);
      const midZ = Z((m.z0 + m.z1) / 2);
      // Find vertical studs/cripples intersecting or touching this plate/sill Z band
      const cuts = [spanA, spanB];
      for (const vm of vertMembers) {
        if (vm.z1 >= m.z0 - 30 && vm.z0 <= m.z1 + 30 && vm.x1 > spanA + 5 && vm.x0 < spanB - 5) {
          cuts.push(Math.max(spanA, Math.min(spanB, (vm.x0 + vm.x1) / 2)));
        }
      }
      cuts.sort((a, b) => a - b);
      const bayMidsMm = [];
      for (let i = 0; i + 1 < cuts.length; i++) {
        const bW = cuts[i + 1] - cuts[i];
        if (bW >= 80) {
          bayMidsMm.push((cuts[i] + cuts[i + 1]) / 2);
          if (bW >= 280) {
            bayMidsMm.push(cuts[i] + bW * 0.35);
            bayMidsMm.push(cuts[i] + bW * 0.65);
          }
        }
      }
      if (!bayMidsMm.length) {
        for (const f of [0.5, 0.3, 0.7, 0.2, 0.8]) bayMidsMm.push(spanA + spanLen * f);
      }
      // Prefer a different bay for each plate/sill so stacked top plates (B, B) and stacked sills (E, E) are well separated horizontally
      const targetFrac = (plateIdx % 2 === 0) ? 0.28 : 0.72;
      const targetMm = spanA + spanLen * targetFrac;
      bayMidsMm.sort((a, b) => Math.abs(a - targetMm) - Math.abs(b - targetMm));
      plateIdx++;

      const cands = [];
      for (const xm of bayMidsMm) {
        const px = X(xm);
        cands.push([px, midZ]);
        cands.push([px, midZ - 1.5]);
        cands.push([px, midZ + 1.5]);
      }
      const placed = chooseBest(cands, letter, m, true, (cx) => {
        let pen = 0;
        for (const prevX of placedPlateXs) {
          if (Math.abs(cx - prevX) < 22) pen += (22 - Math.abs(cx - prevX)) * 15;
        }
        return pen;
      });
      if (placed) placedPlateXs.push(placed.x);
    }

    // 5. Place Full-Height Vertical Studs (Marks C, F, G, J, K, L, N, O...)
    const fullStuds = uniqueItems.filter(it => it.isFullStud).sort((a, b) => ((a.m.x0 + a.m.x1) - (b.m.x0 + b.m.x1)) || (a.m.z0 - b.m.z0));
    const studFracs = [0.50, 0.58, 0.42, 0.66, 0.34, 0.74, 0.26, 0.81, 0.19, 0.87, 0.13];
    let prevStudCx = -Infinity, studClusterIdx = 0;
    for (const { m, letter } of fullStuds) {
      const cx = X((m.x0 + m.x1) / 2);
      if (Math.abs(cx - prevStudCx) < 8.5) {
        studClusterIdx++;
      } else {
        studClusterIdx = 0;
      }
      prevStudCx = cx;

      const yTop = Math.min(Z(m.z1), Z(m.z0)) + 6;
      const yBot = Math.max(Z(m.z1), Z(m.z0)) - 6;
      const spanH = Math.max(4, yBot - yTop);
      const rotFracs = studFracs.map((_, i) => studFracs[(i + studClusterIdx) % studFracs.length]);
      const cands = [];
      for (const f of rotFracs) {
        cands.push([cx, yBot - f * spanH]);
      }
      for (const dx of [-2.0, 2.0]) {
        for (const f of rotFracs) {
          cands.push([cx + dx, yBot - f * spanH]);
        }
      }
      chooseBest(cands, letter, m, true);
    }

    return results;
  }

  /** Metric lumber volume, calculated from the stated section dimensions and cut length. */
  const volumeOfRowM3 = r => timberVolumeM3([r]);
  const totalVolumeM3 = rows => rows.reduce((sum, r) => sum + volumeOfRowM3(r), 0);

  /** Compute OSB sheathing vertical (stud-center) and horizontal (blocking-center) break coordinates. */
  function computeSheathingBreaks(L, H, members = []) {
    const vStudCenters = [...new Set(
      (members || [])
        .filter(m => !['Top plate','Bottom plate','Header','Sill','Header stud','Upper cripple','Lower cripple','Block','Blocking','Beam'].includes(m.type) &&
                     !/plate|header|sill|cripple|block|noggin|beam|lintel/i.test(m.type) &&
                     m.role !== 'Horizontal backing' &&
                     Number.isFinite(m.x0) && Number.isFinite(m.x1))
        .map(m => Math.round(((m.x0 + m.x1) / 2) * 10) / 10)
    )].sort((a, b) => a - b);
    const xBreaks = [0];
    let curX = 0;
    while (L - curX > SHEET_W + 20) {
      const cands = vStudCenters.filter(sc => sc > curX + 100 && sc <= curX + SHEET_W + 20 && sc < L - 100);
      const nextX = cands.length ? cands[cands.length - 1] : vStudCenters.find(sc => sc > curX + 100 && sc < L - 100);
      if (!Number.isFinite(nextX) || nextX <= curX + 40) break;
      xBreaks.push(nextX);
      curX = nextX;
    }
    xBreaks.push(L);

    const hBlockCenters = [...new Set(
      (members || [])
        .filter(m => (['Block', 'Blocking'].includes(m.type) || /block|noggin/i.test(m.type) || m.role === 'Horizontal backing') &&
                     Number.isFinite(m.z0) && Number.isFinite(m.z1))
        .map(m => Math.round(((m.z0 + m.z1) / 2) * 10) / 10)
    )].sort((a, b) => a - b);
    const zBreaks = [0];
    let curZ = 0;
    while (H - curZ > SHEET_H + 20 || (curZ === 0 && H > 1800 && hBlockCenters.some(bc => bc >= 1800 && bc <= SHEET_H + 60 && bc < H - 60))) {
      const cands = hBlockCenters.filter(bc => bc > curZ + 100 && bc <= curZ + SHEET_H + 60 && bc < H - 60);
      const fallbackBlock = hBlockCenters.filter(bc => bc > curZ + 200 && bc < H - 60).pop();
      const nextZ = cands.length ? cands[cands.length - 1] : (Number.isFinite(fallbackBlock) ? fallbackBlock : (H - curZ > SHEET_H + 20 ? Math.min(H, curZ + SHEET_H) : null));
      if (!Number.isFinite(nextZ) || nextZ <= curZ + 40 || nextZ >= H - 20) break;
      zBreaks.push(nextZ);
      curZ = nextZ;
    }
    zBreaks.push(H);

    return { xBreaks, zBreaks, vStudCenters, hBlockCenters };
  }

  /** Sheathing: 4x8 OSB in full sheets, cut at stud centers, horizontal blocking centers, wall ends, and top. */
  function sheathingPieces(L, H, members = []) {
    const { xBreaks, zBreaks } = computeSheathingBreaks(L, H, members);
    const cols = [];
    for (let i = 0; i + 1 < xBreaks.length; i++) {
      const w = xBreaks[i + 1] - xBreaks[i];
      if (w > 1e-3) cols.push(w);
    }
    const rows = [];
    for (let j = 0; j + 1 < zBreaks.length; j++) {
      const h = zBreaks[j + 1] - zBreaks[j];
      if (h > 1e-3) rows.push(h);
    }
    const groups = new Map();
    for (const c of cols) for (const r of rows) {
      const long = Math.max(c, r), short = Math.min(c, r);
      const key = `${Math.round(long)}x${Math.round(short)}`;
      if (!groups.has(key)) groups.set(key, { length: long, width: short, qty: 0 });
      groups.get(key).qty += 1;
    }
    return [...groups.values()].sort((p, q) => q.qty - p.qty);
  }

  /** Returns true if member m is the uppermost Very Top Plate (tie plate) that laps across junctions/corners. */
  function isVeryTopPlate(m, H) {
    if (!m || !/plate/i.test(m.type)) return false;
    if (m.role === 'Very top plate' || /very\s*top/i.test(m.type) || /very\s*top/i.test(m.role || '')) return true;
    if (m.plateIndex === 0 && /^Top plate$/i.test(m.type)) return true;
    if (/^Top plate$/i.test(m.type) && Number.isFinite(H) && H > 0 && Math.abs(Math.max(m.z0, m.z1) - H) <= 2) return true;
    return false;
  }

  /** Bounds of vertical studs/cripples along the panel (excluding sheathing overhang). */
  function studFramingBounds(members, fallbackL = 0) {
    const verts = (members || []).filter(m =>
      /stud|cripple|king|jack|trimmer|junction|corner|break|pack/i.test(m.type) &&
      !/plate|header|sill|block|noggin|beam|lintel/i.test(m.type) &&
      m.role !== 'Horizontal backing' &&
      Number.isFinite(m.x0) && Number.isFinite(m.x1)
    );
    if (!verts.length) return { minX: 0, maxX: fallbackL || 0, span: fallbackL || 0 };
    const minX = Math.max(0, Math.min(...verts.map(m => Math.min(m.x0, m.x1))));
    const maxX = Math.max(minX + 1, Math.max(...verts.map(m => Math.max(m.x0, m.x1))));
    return { minX, maxX, span: maxX - minX };
  }

  /** Every stud and cripple position along the wall (corner of stud, mm), strictly for studs (never sheathing overhang). */
  function studPositions(members) {
    const xs = [];
    let maxStudX = -Infinity;
    for (const m of (members || [])) {
      if (!/stud|cripple|king|jack|trimmer|junction|corner|break|pack/i.test(m.type) ||
          /plate|header|sill|block|noggin|beam|lintel/i.test(m.type) ||
          m.role === 'Horizontal backing' ||
          Math.abs(m.z1 - m.z0) < 120) continue;
      xs.push(Math.round(Math.min(m.x0, m.x1)));
      maxStudX = Math.max(maxStudX, Math.round(Math.max(m.x0, m.x1)));
    }
    if (Number.isFinite(maxStudX) && maxStudX > 0) {
      xs.push(maxStudX);
    }
    return [...new Set(xs)].sort((p, q) => p - q);
  }
  function studSpacing(xs) {
    const gaps = []; for (let i = 1; i < xs.length; i++) { const g = xs[i] - xs[i - 1]; if (g > 100 && g < 800) gaps.push(g); }
    if (!gaps.length) return 406.4;
    gaps.sort((p, q) => p - q);
    return gaps[Math.floor(gaps.length / 2)];
  }

  // ------------------------------------------------------------ shared sheet furniture
  const TB = { x: PAGE_W - 262, y: PAGE_H - 96, w: 232, h: 66 }; // title block (bottom right)

  function planScaleText(s) {
    const paperPerModel = s * (MM_PER_IN / 72); // paper mm per model mm
    return `1 : ${Math.round(1 / paperPerModel / 10) * 10}`;
  }

  /** Writes a table; returns the y after the last row. */
  function drawTable(pg, x, y, headers, colX, rows, { rowH = 11, fontSize = 6.8 } = {}) {
    headers.forEach((h, i) => pg.text(x + colX[i], y, h, { size: fontSize, bold: true, align: colX.align?.[i] || 'left' }));
    pg.line(x, y + 3, x + colX.total, y + 3, { w: 0.5 });
    let yy = y + rowH + 2;
    for (const r of rows) {
      r.forEach((cell, i) => pg.text(x + colX[i], yy, String(cell), { size: fontSize, align: colX.align?.[i] || 'left' }));
      yy += rowH;
    }
    return yy;
  }

  /** Professional title block: project, sheet title and number, scale, date, drawn by, revision. */
  function drawTitleBlock(pg, o) {
    const { x, y, w, h } = TB;
    pg.rect(x, y, w, h, { stroke: [0, 0, 0], lw: 0.9 });
    pg.line(x, y + 16, x + w, y + 16, { w: 0.5 });
    pg.line(x, y + 34, x + w, y + 34, { w: 0.5 });
    pg.line(x, y + 50, x + w, y + 50, { w: 0.5 });
    pg.line(x + w * 0.5, y + 34, x + w * 0.5, y + h, { w: 0.5 });
    pg.line(x + w * 0.75, y + 50, x + w * 0.75, y + h, { w: 0.5 });
    pg.text(x + 4, y + 11, o.project || 'Project', { size: 7.5, bold: true });
    pg.text(x + 4, y + 27, o.title, { size: 8, bold: true });
    const cell = (cx, cy, k, v) => { pg.text(cx + 4, cy + 7, k, { size: 5.5, c: [0.35, 0.35, 0.35] }); pg.text(cx + 4, cy + 14, v, { size: 7 }); };
    cell(x, y + 34, 'SCALE', o.scale);
    cell(x + w * 0.5, y + 34, 'SHEET', o.sheetNo);
    cell(x, y + 50, 'DATE', new Date().toISOString().slice(0, 10));
    cell(x + w * 0.5, y + 50, 'DRAWN BY', 'Timber Teck');
    cell(x + w * 0.75, y + 50, 'REV', 'A');
  }

  /** Notes block, bottom left of the sheet. */
  function drawNotes(pg, lines, x, y) {
    pg.text(x, y, 'NOTES', { size: 8, bold: true });
    lines.forEach((t, i) => pg.text(x, y + 11 + i * 9, t, { size: 6.5 }));
  }

  // ------------------------------------------------------------ rooms (clear dimensions from the wall layout)
  /** Rooms are the empty regions enclosed by walls. Doors open walls between rooms; windows do not.
      The grid is 50 mm; room size is the clear span between finished faces (grid cells). */
  function detectRooms(walls, openingsByWall, step = 50) {
    if (!walls.length) return [];
    const pts = walls.flatMap(w => [w.a, w.b]);
    const pad = 800;
    const x0 = Math.min(...pts.map(p => p.x)) - pad, y0 = Math.min(...pts.map(p => p.y)) - pad;
    const nx = Math.ceil((Math.max(...pts.map(p => p.x)) + pad - x0) / step);
    const ny = Math.ceil((Math.max(...pts.map(p => p.y)) + pad - y0) / step);
    const wall = new Uint8Array(nx * ny);
    const id = (i, j) => j * nx + i;
    for (const w of walls) {
      const dx = w.b.x - w.a.x, dy = w.b.y - w.a.y, L = Math.hypot(dx, dy) || 1;
      const ux = dx / L, uy = dy / L, t = (w.thickness || 200) / 2 + step / 2;
      const i0 = Math.max(0, Math.floor((Math.min(w.a.x, w.b.x) - t - x0) / step)), i1 = Math.min(nx - 1, Math.ceil((Math.max(w.a.x, w.b.x) + t - x0) / step));
      const j0 = Math.max(0, Math.floor((Math.min(w.a.y, w.b.y) - t - y0) / step)), j1 = Math.min(ny - 1, Math.ceil((Math.max(w.a.y, w.b.y) + t - y0) / step));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const px = x0 + (i + 0.5) * step - w.a.x, py = y0 + (j + 0.5) * step - w.a.y;
        const along = px * ux + py * uy, perp = -px * uy + py * ux;
        if (along >= -t && along <= L + t && Math.abs(perp) <= t) wall[id(i, j)] = 1;
      }
    }
    const outside = new Uint8Array(nx * ny);
    const stack = [];
    const seed = (i, j) => { const k = id(i, j); if (!wall[k] && !outside[k]) { outside[k] = 1; stack.push(k); } };
    for (let i = 0; i < nx; i++) { seed(i, 0); seed(i, ny - 1); }
    for (let j = 0; j < ny; j++) { seed(0, j); seed(nx - 1, j); }
    const flood = (start, mark) => {
      const st = [start], cells = [];
      mark[start] = 1;
      while (st.length) {
        const k = st.pop(); cells.push(k);
        const i = k % nx, j = (k - i) / nx;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ii = i + di, jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= nx || jj >= ny) continue;
          const kk = id(ii, jj);
          if (!wall[kk] && !mark[kk] && !outside[kk]) { mark[kk] = 1; st.push(kk); }
        }
      }
      return cells;
    };
    while (stack.length) {
      const k = stack.pop(); const i = k % nx, j = (k - i) / nx;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ii = i + di, jj = j + dj;
        if (ii >= 0 && jj >= 0 && ii < nx && jj < ny) seed(ii, jj);
      }
    }
    const seen = new Uint8Array(nx * ny);
    const rooms = [];
    for (let k = 0; k < nx * ny; k++) {
      if (wall[k] || outside[k] || seen[k]) continue;
      const cells = flood(k, seen);
      if (cells.length * step * step < 1.5e6) continue; // ignore slivers under 1.5 m2
      let mi = Infinity, Mi = -Infinity, mj = Infinity, Mj = -Infinity;
      for (const c of cells) { const i = c % nx, j = (c - i) / nx; mi = Math.min(mi, i); Mi = Math.max(Mi, i); mj = Math.min(mj, j); Mj = Math.max(Mj, j); }
      rooms.push({
        X0: x0 + mi * step, X1: x0 + (Mi + 1) * step, Y0: y0 + mj * step, Y1: y0 + (Mj + 1) * step,
        width: (Mi - mi + 1) * step, depth: (Mj - mj + 1) * step, area: cells.length * step * step / 1e6,
        cx: ((x0 + mi * step) + (x0 + (Mi + 1) * step)) / 2,
        cy: ((y0 + mj * step) + (y0 + (Mj + 1) * step)) / 2
      });
    }
    // Sort rooms by building cluster (left-to-right), then top-to-bottom (Y0 ascending), then left-to-right (X0 ascending)
    const clusters = orderWallsAndOpenings(walls, null).clusters || [];
    const getRoomClusterIdx = r => {
      if (clusters.length <= 1) return 0;
      let bestIdx = 0, bestDist = Infinity;
      clusters.forEach((c, idx) => {
        const dx = r.cx < c.minX ? (c.minX - r.cx) : (r.cx > c.maxX ? (r.cx - c.maxX) : 0);
        const dy = r.cy < c.minY ? (c.minY - r.cy) : (r.cy > c.maxY ? (r.cy - c.maxY) : 0);
        const d = Math.hypot(dx, dy);
        if (d < bestDist) { bestDist = d; bestIdx = idx; }
      });
      return bestIdx;
    };
    rooms.sort((p, q) => {
      const cp = getRoomClusterIdx(p), cq = getRoomClusterIdx(q);
      if (cp !== cq) return cp - cq;
      const rowP = Math.round(p.Y0 / 800), rowQ = Math.round(q.Y0 / 800);
      if (rowP !== rowQ) return rowP - rowQ;
      return (p.X0 - q.X0) || (p.Y0 - q.Y0);
    });
    rooms.forEach((r, i) => { r.id = `R${i + 1}`; });
    return rooms;
  }

  // ------------------------------------------------------------ label placement (no overlapping text)
  /** Bounding box of a text as drawn by Page.text (rot 90 reads upward; anchor = start of the text). */
  function textBox(x, y, str, size, align, rot, bold) {
    const approx = String(str).length * size * (bold ? 0.56 : 0.5);
    const h = size * 1.15;
    if (rot === 90) {
      const anchor = y + (align === 'right' ? approx : align === 'center' ? approx / 2 : 0);
      return { x0: x - h, x1: x, y0: anchor - approx, y1: anchor };
    }
    const x0 = align === 'right' ? x - approx : align === 'center' ? x - approx / 2 : x;
    return { x0, x1: x0 + approx, y0: y - size * 0.85, y1: y + size * 0.25 };
  }
  const boxOverlap = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
  const unionBox = bs => ({ x0: Math.min(...bs.map(b => b.x0)), x1: Math.max(...bs.map(b => b.x1)), y0: Math.min(...bs.map(b => b.y0)), y1: Math.max(...bs.map(b => b.y1)) });
  const boxInside = (b, r) => b.x0 >= r.x0 && b.x1 <= r.x1 && b.y0 >= r.y0 && b.y1 <= r.y1;

  /** Line offsets: horizontal text stacks downward; rotated (reads upward) text stacks to the right, across the text. */
  const lineAnchor = (x, y, l, opt) => (opt.rot === 90 ? [x + (l.dy || 0), y] : [x, y + (l.dy || 0)]);

  /** Places text groups at the candidate spot with the least overlap with other text and with the framing. */
  class LabelPlacer {
    constructor(pg) { this.pg = pg; this.boxes = []; this.obstacles = []; }
    obstacle(b) { this.obstacles.push(b); }
    place(cands, lines, opt = {}) {
      if (!this.pg.showText) return null;
      const ts = this.pg.textScale || 1.0;
      let best = null, bestScore = Infinity;
      for (const [x, y] of cands) {
        const boxes = lines.map(l => { const [lx, ly] = lineAnchor(x, y, l, opt); return textBox(lx, ly, l.t, (l.size || 7) * ts, opt.align || 'left', opt.rot || 0, l.bold); });
        const bb = unionBox(boxes);
        if (opt.within && !boxInside(bb, opt.within)) continue;
        let s = 0;
        for (const q of this.boxes) s += boxOverlap(bb, q) * 200;
        for (const q of this.obstacles) s += boxOverlap(bb, q) * 80;
        if (s < bestScore) { bestScore = s; best = { x, y, bb, boxes }; if (s === 0) break; }
      }
      if (!best) return null;
      if (opt.backing !== false) {
        this.pg.rect(
          best.bb.x0 - 1.2,
          best.bb.y0 - 0.8,
          best.bb.x1 - best.bb.x0 + 2.4,
          best.bb.y1 - best.bb.y0 + 1.6,
          { fill: [1, 1, 1], stroke: opt.border ? [0.55, 0.65, 0.55] : null, lw: 0.35 }
        );
      }
      for (const l of lines) { const [lx, ly] = lineAnchor(best.x, best.y, l, opt); this.pg.text(lx, ly, l.t, { size: l.size || 7, bold: !!l.bold, align: opt.align || 'left', rot: opt.rot || 0, c: l.c || [0, 0, 0] }); }
      this.boxes.push(...best.boxes);
      return best;
    }
  }

  // ------------------------------------------------------------ 2D framing plan sheet
  // light shades by wall type, like the reference wall layout
  const WALL_PALETTE = {
    exterior: { fill: [0.97, 0.95, 0.84], plate: [0.92, 0.88, 0.70], header: [0.94, 0.84, 0.60], outline: [0.12, 0.62, 0.62] },
    interior: { fill: [0.88, 0.89, 0.98], plate: [0.79, 0.81, 0.96], header: [0.73, 0.75, 0.93], outline: [0.25, 0.30, 0.72] },
    bearing: { fill: [0.99, 0.88, 0.88], plate: [0.96, 0.78, 0.78], header: [0.93, 0.68, 0.68], outline: [0.78, 0.22, 0.22] },
  };
  const OPENING_PALETTE = { window: [0.82, 0.93, 0.99], door: [0.99, 0.94, 0.78] };
  const wallClass = w => (/exterior/i.test(w.layer || '') ? 'exterior' : (w.structural === 'Load-Bearing' ? 'bearing' : 'interior'));
  function memberFill(cls, m) {
    const p = WALL_PALETTE[cls];
    if (/plate/i.test(m.type)) return p.plate;
    if (/header|sill/i.test(m.type)) return p.header;
    return p.fill;
  }
  /** Colour key, top right of the sheet. */
  function drawLegend(pg, x, y) {
    const items = [
      ['Exterior', WALL_PALETTE.exterior.fill, WALL_PALETTE.exterior.outline],
      ['Interior', WALL_PALETTE.interior.fill, WALL_PALETTE.interior.outline],
      ['Load-bearing', WALL_PALETTE.bearing.fill, WALL_PALETTE.bearing.outline],
      ['Window', OPENING_PALETTE.window, [0.1, 0.3, 0.5]],
      ['Door', OPENING_PALETTE.door, [0.5, 0.4, 0.1]],
    ];
    let cx = x;
    for (const [label, fill, edge] of items) {
      pg.rect(cx, y, 9, 7, { fill, stroke: edge, lw: 0.5 });
      pg.text(cx + 12, y + 6, label, { size: 6 });
      cx += 12 + label.length * 3.3 + 12;
    }
  }

  const PLAN_NOTES = [
    '1. ALL DIMENSIONS AND TIMBER SIZES ARE IN mm. Wall lengths are along the wall centreline.',
    '2. Room dimensions are clear, between finished wall faces. Thickness t is shown on each wall (mm).',
    '3. Lumber SPF No.2. Studs, plates and blocking as per the wall panel schedule.',
    '4. Horizontal blocking every 1219 mm from the wall base, between studs (1219, 2438, 3658 mm ...).',
    '5. Openings: W = window, D = door. Opening codes and dimensions are in mm.',
    '6. Panels: E = exterior, I = interior.',
    '7. Structural design pending. Construction layout only.',
  ];

  function drawPlan(pg, storyName, walls, labels, model, members3d, meta = {}, panelOptions = {}) {
    pg.showText = panelOptions.includeDimensions !== false;
    const isImp = win.appUnits === 'ft-in';
    const unitTitleStr = isImp ? 'FEET & INCHES (ft-in)' : 'mm';
    pg.text(MARGIN, 24, 'WALL FRAMING LAYOUT PLAN  (2D FRAMING PLAN)', { size: 10, bold: true });
    pg.text(MARGIN, 35, `${storyName}   ·   2D Wall Framing Layout Plan   ·   ALL DIMENSIONS AND TIMBER SIZES IN ${unitTitleStr}`, { size: 6.2 });
    if (!walls.length) { pg.text(MARGIN, 80, 'No walls on this storey.', { size: 10 }); return; }

    const centroid = {
      x: walls.reduce((s, w) => s + (w.a.x + w.b.x) / 2, 0) / walls.length,
      y: walls.reduce((s, w) => s + (w.a.y + w.b.y) / 2, 0) / walls.length,
    };

    // Build wall draw data matching drawFramingPlan() in framing-plan.js
    const fRunFn = win.framingRun || (typeof framingRun === 'function' ? framingRun : null);
    const fWorldFn = win.framingMemberWorld || (typeof framingMemberWorld === 'function' ? framingMemberWorld : null);
    const constrFn = win.construction || (typeof construction === 'function' ? construction : null);
    const getCornerFn = win.getWallCornerEndpoints || (typeof getWallCornerEndpoints === 'function' ? getWallCornerEndpoints : null);

    // Wall & opening numbering ordered clockwise & side-by-side matching 2D framing plan
    const orderedInfo = orderWallsAndOpenings(walls, model);
    walls = orderedInfo.orderedWalls;
    const wallCodeMap = orderedInfo.map;
    const openingCodeMap = new Map();
    let winCount = 1, doorCount = 1;
    for (const w of walls) {
      const ops = openingsOf(model, w.id).slice();
      const rDir = orderedInfo.orderDirMap.get(w.id);
      const wVec = { x: w.b.x - w.a.x, y: w.b.y - w.a.y };
      const sameDir = !rDir || (wVec.x * rDir.x + wVec.y * rDir.y) >= -1e-6;
      ops.sort((p, q) => sameDir ? ((p.offset || 0) - (q.offset || 0)) : ((q.offset || 0) - (p.offset || 0)));
      for (const o of ops) {
        const wMm = Math.round(o.width || (o.type === 'door' ? 900 : 1200));
        const hMm = Math.round(o.height || (o.type === 'door' ? 2100 : 1200));
        const dimPair = isImp && typeof win.formatDimPair === 'function' ? win.formatDimPair(wMm, hMm).replace(/×/g, 'x') : `${wMm}x${hMm} mm`;
        if (o.type === 'door') {
          openingCodeMap.set(o.id, `D${String(doorCount++).padStart(2, '0')} (${dimPair})`);
        } else {
          openingCodeMap.set(o.id, `W${String(winCount++).padStart(2, '0')} (${dimPair})`);
        }
      }
    }

    const wallDrawData = walls.map(w => {
      const len = wallLength(w) || 1;
      const u = { x: (w.b.x - w.a.x) / len, y: (w.b.y - w.a.y) / len };
      const n = { x: -u.y, y: u.x };
      const mid = { x: (w.a.x + w.b.x) / 2, y: (w.a.y + w.b.y) / 2 };
      const toCentroid = { x: mid.x - centroid.x, y: mid.y - centroid.y };
      const outSign = (toCentroid.x * n.x + toCentroid.y * n.y >= 0) ? 1 : -1;
      const ext = isExteriorWall(w);
      const sDepth = constrFn ? constrFn(w).studDepth : (w.thickness || 140);
      const run = fRunFn ? fRunFn(w, model) : { start: 0, end: len };
      const plateWorld = (fWorldFn ? fWorldFn(w, { x0: run.start, x1: run.end, depth: sDepth }) : null) || [
        { x: w.a.x + n.x * (sDepth / 2), y: w.a.y + n.y * (sDepth / 2) },
        { x: w.b.x + n.x * (sDepth / 2), y: w.b.y + n.y * (sDepth / 2) },
        { x: w.b.x - n.x * (sDepth / 2), y: w.b.y - n.y * (sDepth / 2) },
        { x: w.a.x - n.x * (sDepth / 2), y: w.a.y - n.y * (sDepth / 2) },
      ];
      return {
        w, len, u, n, outSign, ext, sDepth, run, plateWorld,
        vertical: Math.abs(u.x) < 0.5
      };
    });

    const allWorldPts = wallDrawData.flatMap(d => d.plateWorld);
    const pad = 1350;
    const minX = Math.min(...allWorldPts.map(p => p.x)) - pad;
    const maxX = Math.max(...allWorldPts.map(p => p.x)) + pad;
    const minY = Math.min(...allWorldPts.map(p => p.y)) - pad;
    const maxY = Math.max(...allWorldPts.map(p => p.y)) + pad;
    const top = 46, bottom = PAGE_H - 98, left = MARGIN + 24, right = PAGE_W - MARGIN - 24;
    const s = Math.min((right - left) / Math.max(1, maxX - minX), (bottom - top) / Math.max(1, maxY - minY));
    const X = x => left + (x - minX) * s;
    const Y = y => top + (y - minY) * s;
    const P = p => [X(p.x), Y(p.y)];
    const L = new LabelPlacer(pg);

    // 1. Draw wall cavities and plate boundaries
    for (const d of wallDrawData) {
      const platePoints = d.plateWorld.map(P);
      d.platePoints = platePoints;
      const fillC = d.ext ? [0.969, 0.969, 0.918] : [0.886, 0.910, 0.941];
      pg.poly(platePoints, { fill: fillC, stroke: [0.118, 0.161, 0.231], w: 0.85 });
      L.obstacle({
        x0: Math.min(...platePoints.map(q => q[0])) - 2,
        x1: Math.max(...platePoints.map(q => q[0])) + 2,
        y0: Math.min(...platePoints.map(q => q[1])) - 2,
        y1: Math.max(...platePoints.map(q => q[1])) + 2
      });
    }

    // 2. Draw vertical framing studs with X cross-marks (exact match to 2D framing plan)
    const showBlockings = typeof document !== 'undefined' && document.getElementById('wall-blocking-toggle')?.checked === true;
    const footprints = new Set();
    for (const w of walls) {
      for (const { m, poly: ps } of members3d.get(w.id) || []) {
        if (['Top plate', 'Bottom plate', 'Header', 'Sill', 'Header stud', 'Upper cripple', 'Lower cripple'].includes(m.type)) continue;
        const isHorizontalBlocking = /^Block$|^Blocking$/i.test(m.type) || /noggin/i.test(m.type) || m.role === 'Horizontal backing';
        if (!showBlockings && isHorizontalBlocking) continue;

        const key = w.id + ps.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join('|');
        if (footprints.has(key)) continue;
        footprints.add(key);

        const screen = ps.map(P);
        const isColliding = Boolean(m.collision);
        const studFill = isColliding ? [0.996, 0.792, 0.792] : [0.863, 0.988, 0.906];
        const studStroke = isColliding ? [0.863, 0.149, 0.149] : [0.082, 0.502, 0.239];
        pg.poly(screen, { fill: studFill, stroke: studStroke, w: isColliding ? 0.9 : 0.55 });

        const isVerticalStud = !/^Block$|^Blocking$|noggin|plate|header|sill|beam|lintel/i.test(m.type) &&
          m.role !== 'Horizontal backing' &&
          (/stud|pack|junction/i.test(m.type) || /stud|return|corner|backing|support/i.test(m.role || '') || (typeof m.z0 === 'number' && typeof m.z1 === 'number' && typeof m.x0 === 'number' && typeof m.x1 === 'number' && (m.z1 - m.z0) > (m.x1 - m.x0)));
        if (isVerticalStud && screen.length >= 4) {
          pg.line(screen[0][0], screen[0][1], screen[2][0], screen[2][1], { w: isColliding ? 0.75 : 0.45, c: studStroke });
          pg.line(screen[1][0], screen[1][1], screen[3][0], screen[3][1], { w: isColliding ? 0.75 : 0.45, c: studStroke });
        }
      }
    }

    // 3. Draw Openings: Continuous studs across openings
    const showOpenings = typeof document !== 'undefined' && document.getElementById('wall-openings-toggle')?.checked === true;
    const getHiddenStudsFn = win.getOpeningHiddenStuds || (typeof getOpeningHiddenStuds === 'function' ? getOpeningHiddenStuds : null);
    const openingLabelsToPlace = [];
    for (const d of wallDrawData) {
      const { w, u, n, sDepth } = d;
      const rawWallMembers = (members3d.get(w.id) || []).map(x => x.m);
      for (const o of openingsOf(model, w.id)) {
        const hw = (o.width || 900) / 2;
        const opCode = openingCodeMap.get(o.id) || (o.type === 'door' ? 'D01 (900x2100 mm)' : 'W01 (1200x1200 mm)');
        const opWorld = (fWorldFn ? fWorldFn(w, { x0: o.offset - hw, x1: o.offset + hw, depth: sDepth }) : null) || [
          { x: w.a.x + u.x * (o.offset - hw) + n.x * (sDepth / 2), y: w.a.y + u.y * (o.offset - hw) + n.y * (sDepth / 2) },
          { x: w.a.x + u.x * (o.offset + hw) + n.x * (sDepth / 2), y: w.a.y + u.y * (o.offset + hw) + n.y * (sDepth / 2) },
          { x: w.a.x + u.x * (o.offset + hw) - n.x * (sDepth / 2), y: w.a.y + u.y * (o.offset + hw) - n.y * (sDepth / 2) },
          { x: w.a.x + u.x * (o.offset - hw) - n.x * (sDepth / 2), y: w.a.y + u.y * (o.offset - hw) - n.y * (sDepth / 2) },
        ];
        const [p1, p2Pt, p3, p4] = opWorld.map(P);
        const opCenterWorld = {
          x: (opWorld[0].x + opWorld[2].x) / 2,
          y: (opWorld[0].y + opWorld[2].y) / 2
        };

        // Clear solid wall plate lines across opening & draw jamb lines
        pg.poly([p1, p2Pt, p3, p4], { fill: [1, 1, 1], stroke: null });
        pg.line(p1[0], p1[1], p4[0], p4[1], { w: 0.65, c: [0.118, 0.161, 0.231] });
        pg.line(p2Pt[0], p2Pt[1], p3[0], p3[1], { w: 0.65, c: [0.118, 0.161, 0.231] });

        // Lines across both faces and centerline
        pg.line(p1[0], p1[1], p2Pt[0], p2Pt[1], { w: 0.6, c: [0.278, 0.333, 0.412], dash: [2.5, 2.0] });
        pg.line(p4[0], p3[1] === p4[1] ? p4[1] : p4[1], p3[0], p3[1], { w: 0.6, c: [0.278, 0.333, 0.412], dash: [2.5, 2.0] });
        const midA = [(p1[0] + p4[0]) / 2, (p1[1] + p4[1]) / 2];
        const midB = [(p2Pt[0] + p3[0]) / 2, (p2Pt[1] + p3[1]) / 2];
        pg.line(midA[0], midA[1], midB[0], midB[1], { w: 0.45, c: [0.580, 0.639, 0.722], dash: [1.5, 1.5] });

        if (showOpenings) {
          if (o.type === 'door') {
            pg.poly([p1, p2Pt, p3, p4], { fill: [1, 1, 1], stroke: [0.392, 0.455, 0.545], w: 0.6 });
            pg.line(midA[0], midA[1], midB[0], midB[1], { w: 0.5, c: [0.392, 0.455, 0.545] });
          } else {
            pg.poly([p1, p2Pt, p3, p4], { fill: [0.941, 0.976, 1.0], stroke: [0.008, 0.518, 0.780], w: 0.65 });
            const g1a = [p1[0] * 0.6 + p4[0] * 0.4, p1[1] * 0.6 + p4[1] * 0.4];
            const g1b = [p2Pt[0] * 0.6 + p3[0] * 0.4, p2Pt[1] * 0.6 + p3[1] * 0.4];
            const g2a = [p1[0] * 0.4 + p4[0] * 0.6, p1[1] * 0.4 + p4[1] * 0.6];
            const g2b = [p2Pt[0] * 0.4 + p3[0] * 0.6, p2Pt[1] * 0.4 + p3[1] * 0.6];
            pg.line(g1a[0], g1a[1], g1b[0], g1b[1], { w: 0.55, c: [0.008, 0.518, 0.780] });
            pg.line(g2a[0], g2a[1], g2b[0], g2b[1], { w: 0.55, c: [0.008, 0.518, 0.780] });
          }
        }

        // Draw studs inside window and door openings with continuous lines
        let hiddenPolys = [];
        if (typeof getHiddenStudsFn === 'function') {
          hiddenPolys = getHiddenStudsFn(w, o, model, rawWallMembers).map(hs => hs.poly);
        } else {
          const oL = o.offset - hw, oR = o.offset + hw;
          const seenX = new Set();
          for (const { m, poly: ps } of members3d.get(w.id) || []) {
            if (!['Header stud', 'Upper cripple', 'Lower cripple'].includes(m.type) && !/cripple|header stud/i.test(m.type)) continue;
            if (m.x1 <= oL + 1 || m.x0 >= oR - 1) continue;
            const k = Math.round(m.x0 / 5) * 5;
            if (seenX.has(k)) continue;
            seenX.add(k);
            hiddenPolys.push(ps);
          }
        }
        for (const ps of hiddenPolys) {
          if (!ps || ps.length < 4) continue;
          const screen = ps.map(P);
          pg.poly(screen, { fill: [0.863, 0.988, 0.906], stroke: [0.082, 0.502, 0.239], w: 0.45 });
          pg.line(screen[0][0], screen[0][1], screen[2][0], screen[2][1], { w: 0.35, c: [0.082, 0.502, 0.239] });
          pg.line(screen[1][0], screen[1][1], screen[3][0], screen[3][1], { w: 0.35, c: [0.082, 0.502, 0.239] });
        }

        openingLabelsToPlace.push({ d, o, opCode, opCenterWorld });
      }
    }

    // 3b. Draw 12 mm Exterior OSB Sheathing Boards when "12 mm OSB" is ON (exact 12 mm thickness, corner overlap, stud-centered joints)
    const showOsb = panelOptions.exteriorOsbEnabled !== false && (typeof document === 'undefined' || document.getElementById('wall-osb-toggle')?.checked !== false);
    const getOsbLayoutFn = win.getWallOsbLayout || (typeof getWallOsbLayout === 'function' ? getWallOsbLayout : null);
    if (showOsb) {
      const osbThicknessMm = 12;
      for (const d of wallDrawData) {
        const { w, run, u, n, outSign, ext, sDepth } = d;
        if (!w || !ext) continue;
        const side = win.getWallSheathingSide ? win.getWallSheathingSide(w) : (w.sheathingSide || (w.sheathingFlipped ? 'interior' : 'exterior'));
        if (side === 'none') continue;

        const isBoth = side === 'both';
        const isInterior = side === 'interior';
        const signsToRender = isBoth ? [outSign, -outSign] : [isInterior ? -outSign : outSign];
        for (const curSign of signsToRender) {
          const faceType = (curSign === outSign) ? 'exterior' : 'interior';
          let segments = [];
          if (typeof getOsbLayoutFn === 'function') {
            segments = getOsbLayoutFn(w, model, faceType).segments || [];
          } else {
            const corners = getCornerFn ? getCornerFn(w, model) : null;
            const isExtFace = (faceType === 'exterior');
            const startX = (isExtFace && corners && Number.isFinite(corners.osbStart)) ? corners.osbStart : ((corners && Number.isFinite(corners.cornerStart)) ? corners.cornerStart : run.start);
            const endX = (isExtFace && corners && Number.isFinite(corners.osbEnd)) ? corners.osbEnd : ((corners && Number.isFinite(corners.cornerEnd)) ? corners.cornerEnd : run.end);
            let intervals = [[startX, endX]];
            for (const o of openingsOf(model, w.id)) {
              const hw = (o.width || 900) / 2;
              const oL = o.offset - hw, oR = o.offset + hw;
              const next = [];
              for (const [a, b] of intervals) {
                if (oR <= a || oL >= b) next.push([a, b]);
                else {
                  if (oL > a + 10) next.push([a, oL]);
                  if (oR < b - 10) next.push([oR, b]);
                }
              }
              intervals = next;
            }
            const rawMembers = (members3d.get(w.id) || []).map(x => x.m);
            const studCenters = [...new Set(
              rawMembers
                .filter(m => !['Top plate','Bottom plate','Header','Sill','Header stud','Upper cripple','Lower cripple','Block','Blocking','Beam'].includes(m.type) &&
                             !/plate|header|sill|cripple|block|noggin|beam|lintel/i.test(m.type) &&
                             m.role !== 'Horizontal backing' &&
                             Number.isFinite(m.x0) && Number.isFinite(m.x1))
                .map(m => Math.round(((m.x0 + m.x1) / 2) * 10) / 10)
            )].sort((a, b) => a - b);
            for (const [segA, segB] of intervals) {
              if (segB - segA < 20) continue;
              const joints = [];
              const segStuds = studCenters.filter(sc => sc > segA + 100 && sc < segB - 100);
              let cur = segA;
              while (segB - cur > 1220 + 20) {
                const reachable = segStuds.filter(sc => sc > cur + 100 && sc <= cur + 1220 + 20);
                const nextJoint = reachable.length ? reachable[reachable.length - 1] : segStuds.find(sc => sc > cur + 100);
                if (!Number.isFinite(nextJoint) || nextJoint <= cur + 40 || nextJoint >= segB - 100) break;
                joints.push(nextJoint);
                cur = nextJoint;
              }
              segments.push({ segA, segB, joints });
            }
          }
          const nx = n.x * curSign, ny = n.y * curSign;
          for (const { segA, segB, joints } of segments) {
            if (segB - segA < 20) continue;
            const segPlate = (fWorldFn ? fWorldFn(w, { x0: segA, x1: segB, depth: sDepth }) : null) || [
              { x: w.a.x + u.x * segA + n.x * (sDepth / 2), y: w.a.y + u.y * segA + n.y * (sDepth / 2) },
              { x: w.a.x + u.x * segB + n.x * (sDepth / 2), y: w.a.y + u.y * segB + n.y * (sDepth / 2) },
              { x: w.a.x + u.x * segB - n.x * (sDepth / 2), y: w.a.y + u.y * segB - n.y * (sDepth / 2) },
              { x: w.a.x + u.x * segA - n.x * (sDepth / 2), y: w.a.y + u.y * segA - n.y * (sDepth / 2) },
            ];
            const inA = curSign > 0 ? segPlate[0] : segPlate[3];
            const inB = curSign > 0 ? segPlate[1] : segPlate[2];
            const outA = { x: inA.x + nx * osbThicknessMm, y: inA.y + ny * osbThicknessMm };
            const outB = { x: inB.x + nx * osbThicknessMm, y: inB.y + ny * osbThicknessMm };
            pg.poly([P(inA), P(inB), P(outB), P(outA)], { fill: [0.996, 0.843, 0.667], stroke: [0.863, 0.149, 0.149], w: 0.22 });
            for (const sx of joints) {
              const jtPlate = (fWorldFn ? fWorldFn(w, { x0: sx, x1: sx + 1, depth: sDepth }) : null);
              const jIn = jtPlate ? (curSign > 0 ? jtPlate[0] : jtPlate[3]) : { x: inA.x + u.x * (sx - segA), y: inA.y + u.y * (sx - segA) };
              const jOut = { x: jIn.x + nx * osbThicknessMm, y: jIn.y + ny * osbThicknessMm };
              const pJi = P(jIn), pJo = P(jOut);
              pg.line(pJi[0], pJi[1], pJo[0], pJo[1], { w: 0.25, c: [0.600, 0.106, 0.106] });
            }
          }
        }
      }
    }

    // Helper to draw architectural dimension line in PDF matching archDim() in framing-plan.js
    const drawArchDimPdf = (ptA, ptB, offsetMm, textStr, colorRgb = [0.059, 0.090, 0.165]) => {
      const dx = ptB.x - ptA.x, dy = ptB.y - ptA.y;
      const lenMm = Math.hypot(dx, dy) || 1;
      const ux = dx / lenMm, uy = dy / lenMm;
      const nx = -uy * offsetMm, ny = ux * offsetMm;
      const aaW = { x: ptA.x + nx, y: ptA.y + ny };
      const bbW = { x: ptB.x + nx, y: ptB.y + ny };
      const pa = P(ptA), pb = P(ptB);
      const aa = P(aaW), bb = P(bbW);
      const extA = P({ x: aaW.x + nx * 0.12, y: aaW.y + ny * 0.12 });
      const extB = P({ x: bbW.x + nx * 0.12, y: bbW.y + ny * 0.12 });

      // Witness / extension lines
      pg.line(pa[0], pa[1], extA[0], extA[1], { w: 0.35, c: [0.392, 0.455, 0.545] });
      pg.line(pb[0], pb[1], extB[0], extB[1], { w: 0.35, c: [0.392, 0.455, 0.545] });
      // Dimension line
      pg.line(aa[0], aa[1], bb[0], bb[1], { w: 0.5, c: colorRgb });
      // 45° Architectural ticks
      const tickPt = 2.0;
      for (const pt of [aa, bb]) {
        pg.line(pt[0] - tickPt, pt[1] + tickPt, pt[0] + tickPt, pt[1] - tickPt, { w: 0.65, c: colorRgb });
      }

      const vertical = Math.abs(ux) < 0.5;
      const midW = { x: (aaW.x + bbW.x) / 2, y: (aaW.y + bbW.y) / 2 };
      const cands = [0, -280, 280, -560, 560]
        .filter(sh => Math.abs(sh) <= Math.max(0, lenMm / 2 - 220))
        .map(sh => P({ x: midW.x + ux * sh, y: midW.y + uy * sh }));
      if (!cands.length) cands.push(P(midW));
      L.place(cands, [{ t: textStr, size: 4.0, bold: true, c: colorRgb }], { align: 'center', rot: vertical ? 90 : 0, backing: true });
      // Register dimension line segment as obstacle so wall/opening tags do not overlap it
      L.obstacle({
        x0: Math.min(aa[0], bb[0]) - 2,
        x1: Math.max(aa[0], bb[0]) + 2,
        y0: Math.min(aa[1], bb[1]) - 2,
        y1: Math.max(aa[1], bb[1]) + 2
      });
    };

    // 4. Draw Corner-to-Corner Dimensions & User Dimensions FIRST (matching 2D framing plan)
    for (const d of wallDrawData) {
      const { w, run, outSign, ext, plateWorld } = d;
      if (ext) {
        const corners = getCornerFn ? getCornerFn(w, model) : { a: w.a, b: w.b, len: d.len, outSign };
        if (corners.len >= 100) {
          const extLbl = isImp ? fis(corners.len) : `${Math.round(corners.len)} mm`;
          drawArchDimPdf(corners.a, corners.b, (corners.outSign || outSign) * 580, extLbl, [0.059, 0.090, 0.165]);
        }
      } else {
        const runLen = Math.max(0, run.end - run.start);
        if (runLen >= 150 && plateWorld.length >= 4) {
          const intA = outSign > 0 ? plateWorld[0] : plateWorld[3];
          const intB = outSign > 0 ? plateWorld[1] : plateWorld[2];
          const intLbl = isImp ? fis(runLen) : `${Math.round(runLen)} mm`;
          drawArchDimPdf(intA, intB, outSign * 380, intLbl, [0.200, 0.255, 0.333]);
        }
      }
    }

    // User-placed dimensions from model.elements
    const storyId = walls[0]?.story;
    const resolveDimFn = win.resolveDimension || (typeof resolveDimension === 'function' ? resolveDimension : null);
    for (const ud of (model.elements || []).filter(e => e.type === 'dimension' && (!e.story || e.story === storyId))) {
      const rd = resolveDimFn ? resolveDimFn(ud) : ud;
      if (!rd.a || !rd.b) continue;
      const distMm = Math.round(Math.hypot(rd.b.x - rd.a.x, rd.b.y - rd.a.y));
      const custom = ud.customText ? String(ud.customText).trim() : '';
      const valStr = isImp ? fis(distMm) : `${distMm} mm`;
      const txt = custom || `${ud.prefix || ''}${valStr}${ud.suffix || ''}`;
      drawArchDimPdf(rd.a, rd.b, ud.offset ?? 600, txt, [0.059, 0.090, 0.165]);
    }

    // 5. Place Parallel Wall ID Tags & Parallel Window/Door Tags without overlapping (matching 2D framing plan)
    for (const d of wallDrawData) {
      const { w, u, n, outSign, ext, sDepth, plateWorld, vertical } = d;
      const wallCode = wallCodeMap.get(w.id) || w.id;
      const centerW = {
        x: (plateWorld[0].x + plateWorld[2].x) / 2,
        y: (plateWorld[0].y + plateWorld[2].y) / 2
      };
      const baseOff = sDepth / 2 + 195;
      const stepOff = 165;
      const alongShifts = [0, -280, 280, -560, 560, -840, 840].filter(sh => Math.abs(sh) <= Math.max(200, d.len * 0.38));
      // For interior walls, dimension is on +outSign, so prefer -outSign for the wall ID tag so they never collide
      const prefWallSign = ext ? outSign : -outSign;
      const cands = [];
      for (const sideMult of [prefWallSign, -prefWallSign, prefWallSign * 1.85, -prefWallSign * 1.85, prefWallSign * 2.7]) {
        const sign = sideMult >= 0 ? 1 : -1;
        const dist = baseOff + (Math.abs(sideMult) - 1) * stepOff;
        for (const sh of alongShifts) {
          cands.push(P({
            x: centerW.x + u.x * sh + n.x * sign * dist,
            y: centerW.y + u.y * sh + n.y * sign * dist
          }));
        }
      }
      L.place(cands, [{ t: wallCode, size: 4.2, bold: true, c: [0.059, 0.090, 0.165] }], { align: 'center', rot: vertical ? 90 : 0, backing: true });
    }

    for (const item of openingLabelsToPlace) {
      const { d, o, opCode, opCenterWorld } = item;
      const { u, n, outSign, sDepth, vertical } = d;
      const prefSign = -outSign;
      const baseOff = sDepth / 2 + 185;
      const stepOff = 160;
      const alongShifts = [0, -240, 240, -480, 480];
      const cands = [];
      for (const sideMult of [prefSign, -prefSign, prefSign * 1.8, -prefSign * 1.8, prefSign * 2.6]) {
        const sign = sideMult >= 0 ? 1 : -1;
        const dist = baseOff + (Math.abs(sideMult) - 1) * stepOff;
        for (const sh of alongShifts) {
          cands.push(P({
            x: opCenterWorld.x + u.x * sh + n.x * sign * dist,
            y: opCenterWorld.y + u.y * sh + n.y * sign * dist
          }));
        }
      }
      const tagCol = o.type === 'door' ? [0.486, 0.176, 0.071] : [0.012, 0.412, 0.631];
      L.place(cands, [{ t: opCode, size: 3.8, bold: true, c: tagCol }], { align: 'center', rot: vertical ? 90 : 0, backing: true });
    }

    // 6. Room Labels matching 2D framing plan
    const zones = (model.elements || []).filter(e => e.type === 'zone' && (!e.story || e.story === storyId));
    if (zones.length) {
      for (const z of zones) {
        const center = z.center || (z.points?.length ? {
          x: z.points.reduce((acc, p) => acc + p.x, 0) / z.points.length,
          y: z.points.reduce((acc, p) => acc + p.y, 0) / z.points.length
        } : null);
        if (!center) continue;
        const roomTitle = String(z.roomName || z.name || 'ROOM').toUpperCase();
        const cands = [0, -250, 250].flatMap(dy => [0, -250, 250].map(dx => P({ x: center.x + dx, y: center.y + dy })));
        L.place(cands, [{ t: roomTitle, size: 4.8, bold: true, c: [0.059, 0.090, 0.165] }], { align: 'center', backing: true });
      }
    } else {
      const openingsByWall = new Map(walls.map(w => [w.id, openingsOf(model, w.id)]));
      const rooms = detectRooms(walls, openingsByWall);
      for (const r of rooms) {
        const [rx0, ry0] = P({ x: r.X0, y: r.Y0 }), [rx1, ry1] = P({ x: r.X1, y: r.Y1 });
        const rb = { x0: Math.min(rx0, rx1), x1: Math.max(rx0, rx1), y0: Math.min(ry0, ry1), y1: Math.max(ry0, ry1) };
        const W = rb.x1 - rb.x0, H = rb.y1 - rb.y0;
        const cands = [];
        for (const fx of [0.5, 0.35, 0.65]) for (const fy of [0.5, 0.35, 0.65]) cands.push([rb.x0 + W * fx, rb.y0 + H * fy]);
        L.place(cands, [
          { t: r.id, size: 4.5, bold: true, c: [0.059, 0.090, 0.165] },
          { t: `${fis(r.width)} x ${fis(r.depth)}${isImp ? '' : ' mm'} clear`, size: 3.6, bold: true, dy: 4.8 },
        ], { align: 'center', backing: true, within: { x0: rb.x0 + 2, x1: rb.x1 - 2, y0: rb.y0 + 2, y1: rb.y1 - 2 } });
      }
    }

    drawTitleBlock(pg, { project: meta.project, title: `WALL FRAMING LAYOUT PLAN (2D FRAMING PLAN) - ${storyName}`, sheetNo: `WF-${meta.sheet || '01'}`, scale: planScaleText(s) });
    pg.text(MARGIN, PAGE_H - 22, `2D Wall Framing Layout Plan · All dimensions and timber sizes in ${isImp ? 'ft-in' : 'mm'} · Scale ${planScaleText(s)}`, { size: 5.5 });
  }

  // ------------------------------------------------------------ elevation sheet with full dimensions
  /** Schematic wall top plan beneath elevation: stud footprints, panel ends and exterior OSB face. */
  function drawWallPlanStrip(pg, ctx) {
    let { w, label, L, members, openings, exteriorWall, osbApplied, s, X } = ctx;
    if (!label || /^W[-_]/i.test(label) || /^WALL/i.test(label) || !/^[EI]\d+/i.test(label)) {
      const isExt = Boolean(exteriorWall || (typeof isExteriorWall === 'function' ? isExteriorWall(w) : false));
      const numMatch = (label || w?.id || w?.name || '').match(/\d+/);
      const num = numMatch ? parseInt(numMatch[0], 10) : 1;
      label = isExt ? `E${String(num).padStart(2, '0')}` : `I${String(num).padStart(2, '0')}`;
    } else {
      label = label.toUpperCase();
    }
    const xMin = MARGIN + 70;
    const constrFn = win.construction || (typeof construction === 'function' ? construction : null);
    const refMemberDepth = (members || []).find(m => /common stud|king stud|top plate|bottom plate|corner stud/i.test(m.type) && Number.isFinite(m.depth) && m.depth > 50)?.depth;
    const studDepth = Math.max(50, Number((constrFn ? constrFn(w)?.studDepth : null) || w.framing?.studDepth || refMemberDepth || w.thickness || (exteriorWall ? 140 : 89)));
    const thickness = studDepth;
    // Wall plan view is rendered in the EXACT SAME 1:1 scale s as wall elevation view and 2D framing plan
    const ps = s || Math.min(348 / Math.max(L, 1), 22 / studDepth);
    const { minX: studMinX, maxX: studMaxX, span: studSpan } = studFramingBounds(members, L);
    const drawLength = L * ps;
    const studDrawLength = studSpan * ps;
    const drawDepth = studDepth * ps;
    const x0 = typeof X === 'function' ? X(0) : xMin;
    const studX0 = typeof X === 'function' ? X(studMinX) : (x0 + studMinX * ps);
    const studX1 = typeof X === 'function' ? X(studMaxX) : (x0 + studMaxX * ps);
    const y0 = 445, y1 = y0 + drawDepth;
    pg.text(studX0, 414, "WALL PLAN / TOP-PLATE & STUD LAYOUT", { size: 6.5, bold: true });
    pg.text(studX1, 414, `PANEL ${label}`, { size: 5.8, bold: true, align: "right" });

    // Int / Ext face indicators (TUFF HOUSE / Binder1 workshop sheet standard)
    // Exterior face is on the bottom (Ext), Interior on top (Int)
    pg.text(studX0 - 6, y0 + 3, "Int", { size: 5.6, bold: true, align: "right", c: [0.15, 0.40, 0.20] });
    pg.text(studX0 - 6, y1 - 1, "Ext", { size: 5.6, bold: true, align: "right", c: [0.65, 0.25, 0.10] });

    // Cumulative stud corner tick lines above the plan strip (strictly for studs, measured from first stud = 0)
    const sPositions = studPositions(members);
    const planLblSize = 4.0;
    const minPlanGap = planLblSize * 1.55;
    let lastPlanLabelX = -Infinity;
    for (const x of sPositions) {
      const px = typeof X === 'function' ? X(x) : (x0 + Math.max(0, Math.min(L, x)) * ps);
      const txt = `${Math.max(0, Math.round(x - studMinX))}`;
      const lx2 = Math.max(px + 1.2, lastPlanLabelX + minPlanGap);
      lastPlanLabelX = lx2;
      pg.line(px, y0, px, y0 - 4.5, { w: 0.28, c: [0.2, 0.2, 0.2] });
      if (lx2 - (px + 1.2) > 0.5) {
        pg.line(px, y0 - 4.5, lx2 - 1.2, y0 - 11.5, { w: 0.28, c: [0.2, 0.2, 0.2] });
        pg.line(lx2 - 1.2, y0 - 11.5, lx2 - 1.2, y0 - 13.5, { w: 0.28, c: [0.2, 0.2, 0.2] });
      } else {
        pg.line(px, y0 - 4.5, px, y0 - 13.5, { w: 0.28, c: [0.2, 0.2, 0.2] });
      }
      pg.text(lx2, y0 - 14.5, txt, { size: planLblSize, rot: 90, align: "left", c: [0.1, 0.1, 0.1] });
    }

    // 1. Soleplate / Top-plate outer box spanning strictly across the stud framing [studX0, studX1]
    const cavityFill = exteriorWall ? [0.969, 0.969, 0.918] : [0.886, 0.910, 0.941];
    pg.rect(studX0, y0, studDrawLength, drawDepth, { fill: cavityFill, stroke: [0.118, 0.161, 0.231], lw: 0.75 });
    // Longitudinal plate center/guide line
    pg.line(studX0, y0 + drawDepth * 0.5, studX1, y0 + drawDepth * 0.5, { w: 0.25, c: [0.7, 0.72, 0.75], dash: [2, 2] });

    // Pre-calculate opening geometry and callout labels so opening cavities are cleared BEFORE drawing studs
    const openingLabels = [];
    let opWinCount = 1, opDoorCount = 1;

    for (let oIdx = 0; oIdx < (openings || []).length; oIdx++) {
      const o = openings[oIdx];
      const oL = o.offset - o.width / 2, oR = o.offset + o.width / 2;
      const left = typeof X === 'function' ? X(oL) : (x0 + Math.max(0, Math.min(L, oL)) * ps);
      const right = typeof X === 'function' ? X(oR) : (x0 + Math.max(0, Math.min(L, oR)) * ps);
      const opW = Math.max(1, right - left);

      // Clear wall cavity across the rough opening BEFORE drawing studs
      pg.rect(left, y0, opW, drawDepth, { fill: [0.97, 0.98, 1.0], stroke: null });
      // Threshold lines along both faces of the wall across rough opening
      pg.line(left, y0, right, y0, { w: 0.5, c: [0.278, 0.333, 0.412], dash: [2.5, 2.0] });
      pg.line(left, y1, right, y1, { w: 0.5, c: [0.278, 0.333, 0.412], dash: [2.5, 2.0] });
      pg.line(left, (y0 + y1) / 2, right, (y0 + y1) / 2, { w: 0.4, c: [0.580, 0.639, 0.722], dash: [1.5, 1.5] });

      const isDoor = /door/i.test(o.type || o.id || '');
      const wMm = Math.round(o.width || (isDoor ? 900 : 1200));
      const hMm = Math.round(o.height || (isDoor ? 2100 : 1200));
      let opCode = o.code || '';
      if (!opCode) {
        if (isDoor) {
          opCode = `D${String(opDoorCount++).padStart(2, '0')}`;
        } else {
          opCode = `W${String(opWinCount++).padStart(2, '0')}`;
        }
      }
      const isImpStrip = win.appUnits === 'ft-in';
      const dimPairStrip = isImpStrip && typeof win.formatDimPair === 'function' ? win.formatDimPair(wMm, hMm) : `${wMm}×${hMm} mm`;
      const calloutText = `${opCode} (${dimPairStrip})`;
      const labelW = calloutText.length * 2.3 + 6;
      const cx = (left + right) / 2;
      openingLabels.push({
        o,
        oL,
        oR,
        left,
        right,
        cx,
        text: calloutText,
        labelW,
        boxLeft: cx - labelW / 2 - 4,
        boxRight: cx + labelW / 2 + 4
      });
    }

    const stripOsbSide = exteriorWall ? (win.getWallSheathingSide ? win.getWallSheathingSide(w) : (w?.sheathingSide || (w?.sheathingFlipped ? 'interior' : 'exterior'))) : 'none';
    const isExtOsb = (stripOsbSide === 'exterior' || stripOsbSide === 'both' || (stripOsbSide !== 'interior' && !w?.sheathingFlipped));
    const osbH = Math.max(1.2, 12 * ps);
    const extOsbPad = (osbApplied && exteriorWall && stripOsbSide !== 'none' && isExtOsb) ? osbH : 0;

    // 2. Full-height stud and trimmer footprints: continuous solid lines, light green fill, crisp green outline and X cross
    let lastTagX = -Infinity;
    for (const m of members.filter(m => /stud|king|jack|corner|junction|break|trimmer/i.test(m.type) && !/header stud|cripple|block/i.test(m.type))) {
      const xa = typeof X === 'function' ? X(m.x0) : (x0 + Math.max(0, Math.min(L, m.x0)) * ps);
      const xb = typeof X === 'function' ? X(m.x1) : (x0 + Math.max(0, Math.min(L, m.x1)) * ps);
      const ww = Math.max(1.25, xb - xa);
      if (xb < x0 || xa > x0 + drawLength) continue;

      // Support perpendicular backing studs (depth = 38 mm laid flat against interior/exterior face)
      // All full-depth studs (m.depth >= studDepth - 5) span 100% of drawDepth (y0 to y1)
      const isFlatBacking = Number.isFinite(m.depth) && m.depth > 0 && m.depth < studDepth - 5;
      const mDepth = isFlatBacking ? m.depth : studDepth;
      const mDrawH = isFlatBacking ? mDepth * ps : drawDepth;
      let my0 = y0;
      if (isFlatBacking) {
        my0 = isExtOsb ? y0 : (y1 - mDrawH); // Always on opposite face of OSB sheathing (synced with 2D framing plan)
      }
      const my1 = my0 + mDrawH;

      const isColliding = Boolean(m.collision);
      const studFill = isColliding ? [0.996, 0.792, 0.792] : [0.863, 0.988, 0.906];
      const studStroke = isColliding ? [0.863, 0.149, 0.149] : [0.082, 0.502, 0.239];
      const studLw = Math.min(0.45, Math.max(0.22, ww * 0.20));
      const diagLw = Math.min(0.35, Math.max(0.16, ww * 0.15));
      pg.rect(xa, my0, ww, mDrawH, { fill: studFill, stroke: studStroke, lw: studLw });
      pg.line(xa, my0, xa + ww, my1, { w: diagLw, c: studStroke });
      pg.line(xa, my1, xa + ww, my0, { w: diagLw, c: studStroke });

      const tag = /junction/i.test(m.type) ? "JB" : /corner/i.test(m.type) ? "SCS" : /king|jack|trimmer/i.test(m.type) ? "SS" : "S";
      const tagCx = xa + ww / 2;
      // Do not overlap stud tags with opening rough openings or opening callout text boxes
      const inOpeningOrLabel = openingLabels.some(ol =>
        (tagCx >= ol.left - 3 && tagCx <= ol.right + 3) ||
        (tagCx >= ol.boxLeft && tagCx <= ol.boxRight)
      );
      if (!inOpeningOrLabel && tagCx - lastTagX >= 6.5) {
        pg.text(tagCx, y1 + extOsbPad + 6.5, tag, { size: 4.0, bold: true, align: "center", c: [0.15, 0.15, 0.15] });
        lastTagX = tagCx;
      }
    }

    // 3. Draw ALL cripple and header studs inside each window/door opening (including left/right end cripples at oL and oR)
    const seenCrippleX = new Set();
    for (const ol of openingLabels) {
      const { oL, oR, left, right } = ol;
      for (const m of members.filter(m => /header stud|cripple/i.test(m.type))) {
        if (m.x1 <= oL + 1 || m.x0 >= oR - 1) continue;
        const k = Math.round(m.x0 / 5) * 5;
        if (seenCrippleX.has(k)) continue;
        seenCrippleX.add(k);
        const cx0 = Math.max(oL, m.x0);
        const cx1 = Math.min(oR, m.x1);
        const xa = typeof X === 'function' ? X(cx0) : (x0 + Math.max(0, Math.min(L, cx0)) * ps);
        const xb = typeof X === 'function' ? X(cx1) : (x0 + Math.max(0, Math.min(L, cx1)) * ps);
        const ww = Math.max(1.25, xb - xa);
        const studLw = Math.min(0.45, Math.max(0.22, ww * 0.20));
        const diagLw = Math.min(0.35, Math.max(0.16, ww * 0.15));

        // Continuous green stud box and diagonal X cross matching full-height studs
        pg.rect(xa, y0, ww, drawDepth, { fill: [0.863, 0.988, 0.906], stroke: [0.082, 0.502, 0.239], lw: studLw });
        pg.line(xa, y0, xa + ww, y1, { w: diagLw, c: [0.082, 0.502, 0.239] });
        pg.line(xa, y1, xa + ww, y0, { w: diagLw, c: [0.082, 0.502, 0.239] });
      }
      // Solid jamb lines at rough opening edges
      pg.line(left, y0, left, y1, { w: 0.65, c: [0.118, 0.161, 0.231] });
      pg.line(right, y0, right, y1, { w: 0.65, c: [0.118, 0.161, 0.231] });
    }

    // 4. OSB sheathing on the active face(s) matching 2D framing plan: split at window/door openings with stud-centered sheet joints
    if (osbApplied && stripOsbSide !== 'none') {
      const faces = stripOsbSide === 'both' ? ['exterior', 'interior'] : [stripOsbSide === 'interior' ? 'interior' : 'exterior'];
      let osbIntervals = [[0, L]];
      for (const ol of openingLabels) {
        const next = [];
        for (const [a, b] of osbIntervals) {
          if (ol.oR <= a || ol.oL >= b) next.push([a, b]);
          else {
            if (ol.oL > a + 10) next.push([a, ol.oL]);
            if (ol.oR < b - 10) next.push([ol.oR, b]);
          }
        }
        osbIntervals = next;
      }
      const studCenters = [...new Set(
        (members || [])
          .filter(m => /stud|king|jack|corner|junction|break|trimmer/i.test(m.type) &&
                       !/header stud|cripple|block/i.test(m.type) &&
                       !(Number.isFinite(m.depth) && m.depth > 0 && m.depth < studDepth - 5) &&
                       Number.isFinite(m.x0) && Number.isFinite(m.x1))
          .map(m => Math.round(((m.x0 + m.x1) / 2) * 10) / 10)
      )].sort((a, b) => a - b);

      for (const face of faces) {
        const yFace = (face === 'interior') ? (y0 - osbH) : y1;
        for (const [segA, segB] of osbIntervals) {
          if (segB - segA < 20) continue;
          const sxA = typeof X === 'function' ? X(segA) : (x0 + segA * ps);
          const sxB = typeof X === 'function' ? X(segB) : (x0 + segB * ps);
          pg.rect(sxA, yFace, Math.max(1, sxB - sxA), osbH, { fill: [0.996, 0.843, 0.667], stroke: [0.863, 0.149, 0.149], lw: 0.22 });
          const segStuds = studCenters.filter(sc => sc > segA + 100 && sc < segB - 100);
          let cur = segA;
          while (segB - cur > 1220 + 20) {
            const reachable = segStuds.filter(sc => sc > cur + 100 && sc <= cur + 1220 + 20);
            const nextJoint = reachable.length ? reachable[reachable.length - 1] : segStuds.find(sc => sc > cur + 100);
            if (!Number.isFinite(nextJoint) || nextJoint <= cur + 40 || nextJoint >= segB - 100) break;
            const px = typeof X === 'function' ? X(nextJoint) : (x0 + nextJoint * ps);
            pg.line(px, yFace, px, yFace + osbH, { w: 0.25, c: [0.600, 0.106, 0.106] });
            cur = nextJoint;
          }
        }
      }
    }

    // 5. Render blue opening callouts below the exterior face / sheeting line
    for (const ol of openingLabels) {
      const labelY = y1 + extOsbPad + 7.5;
      pg.rect(ol.cx - ol.labelW / 2, labelY - 4.5, ol.labelW, 6.0, { fill: [1, 1, 1], stroke: null });
      pg.text(ol.cx, labelY, ol.text, { size: 5.0, bold: true, align: "center", c: [0.008, 0.518, 0.780] });
    }

    // Overall dimension chain below plan (strictly for studs: studX0 to studX1)
    const dimY = y1 + extOsbPad + 15;
    pg.line(studX0, dimY, studX1, dimY, { w: 0.45 });
    pg.line(studX0, dimY - 3, studX0, dimY + 3, { w: 0.4 });
    pg.line(studX1, dimY - 3, studX1, dimY + 3, { w: 0.4 });
    const isImpStrip = win.appUnits === 'ft-in';
    pg.text((studX0 + studX1) / 2, dimY + 7.5, `${fis(studSpan)}${isImpStrip ? '' : ' mm'} OVERALL PANEL LENGTH`, { size: 5.5, bold: true, align: "center" });
    const osbNote = osbApplied ? (isImpStrip ? `1/2" OSB on ${stripOsbSide} face` : `12 mm OSB on ${stripOsbSide} face`) : "OSB Sheathing OFF";
    const wallTimberGrade = (constrFn ? constrFn(w).timberGrade : w.framing?.timberGrade) || 'C16';
    pg.text(xMin, 498, `Wall thickness ${fis(thickness)}${isImpStrip ? '' : ' mm'} | ${osbNote} | Soleplate ${isImpStrip ? '' : '38x'}${fis(studDepth)} ${wallTimberGrade} Tanalised | S=Stud, SS=Double stud, SCS=Corner, JB=Junction Block.`, { size: 5.0 });
    pg.text(xMin, 507, "Opening head levels are measured from wall base; Lintel: 3-ply 44x220 C24 over openings (min 100mm bearing). Confirm structural design.", { size: 4.9 });
  }

  function drawPanelPage(pg, ctx) {
    let { w, label, storyName, L, H, members, openings, rows, stud, area, volumeM3, sheets, exteriorWall = false, osbEnabled = true, meta = {}, sheetNo, panelMaxLengthMm = PANEL_MAX_MM } = ctx;
    // Strictly follow "2D framing plan" naming convention (E01, E02, E03... for exterior, I01, I02, I03... for interior)
    // Never allow raw BIM IDs like W-001, W-002, W-003 to appear in elevation reports
    if (!label || /^W[-_]/i.test(label) || /^WALL/i.test(label) || !/^[EI]\d+/i.test(label)) {
      const isExt = Boolean(exteriorWall || (typeof isExteriorWall === 'function' ? isExteriorWall(w) : false));
      const numMatch = (label || w?.id || w?.name || '').match(/\d+/);
      const num = numMatch ? parseInt(numMatch[0], 10) : 1;
      label = isExt ? `E${String(num).padStart(2, '0')}` : `I${String(num).padStart(2, '0')}`;
    } else {
      label = label.toUpperCase();
    }
    const stripOsbSide = exteriorWall ? (win.getWallSheathingSide ? win.getWallSheathingSide(w) : (w?.sheathingSide || (w?.sheathingFlipped ? 'interior' : 'exterior'))) : 'none';
    const osbApplied = Boolean(osbEnabled && exteriorWall && stripOsbSide !== 'none');
    const constrFn = win.construction || (typeof construction === 'function' ? construction : null);
    const refMemberDepth = (members || []).find(m => /common stud|king stud|top plate|bottom plate|corner stud/i.test(m.type) && Number.isFinite(m.depth) && m.depth > 50)?.depth;
    const panelStudDepth = Math.max(50, Number((constrFn ? constrFn(w)?.studDepth : null) || w?.framing?.studDepth || refMemberDepth || w?.thickness || (exteriorWall ? 140 : 89)));

    // Structural weight estimation (Eurocode 5 / Timber frame manufacturing standards)
    const timberWeightKg = volumeM3 * 480;
    const osbWeightKg = osbApplied ? (area * (OSB_THICKNESS_MM === 12 ? 7.2 : 5.5)) : 0;
    const panelWeightKg = Math.max(15, Math.round(timberWeightKg + osbWeightKg + 3.5));
    const isHeavyItem = panelWeightKg >= 100;

    pg.text(MARGIN, 26, `Level: ${storyName}`, { size: 8.2, bold: true });
    pg.text(PAGE_W / 2, 26, 'WALL PANEL ELEVATION + PLAN', { size: 7.5, align: 'center' });
    pg.text(PAGE_W - MARGIN, 26, `Panel: ${label} 38x${Math.round(panelStudDepth)} (${panelWeightKg}kg)${isHeavyItem ? '  [HEAVY ITEM]' : ''}`, { size: 8.2, bold: true, align: 'right' });
    pg.line(MARGIN, 34, PAGE_W - MARGIN, 34, { w: 1 });

    if (isHeavyItem) {
      pg.rect(MARGIN, 35, PAGE_W - MARGIN * 2, 9.5, { fill: [1, 1, 1], stroke: [0.8, 0.2, 0.2], lw: 0.5 });
      pg.text(PAGE_W / 2, 42, `[HEAVY ITEM: ${panelWeightKg} kg] - MECHANICAL CRANE HOIST / 4+ PERSON TEAM LIFT REQUIRED (Manual handling limit exceeded)`, { size: 5.4, bold: true, align: 'center', c: [0.75, 0.1, 0.1] });
    } else if (L > panelMaxLengthMm + 1) {
      pg.text(PAGE_W / 2, 38, `CHECK: panel exceeds configured maximum ${panelMaxLengthMm} mm; no lawful break point was found. Review opening and junction clearances.`, { size: 6.0, bold: true, align: 'center', c: [0.75, 0.1, 0.1] });
    }
    const isImpPanel = win.appUnits === 'ft-in';
    const uSuf = isImpPanel ? '' : ' mm';
    const { minX: studMinX, maxX: studMaxX, span: studSpan } = studFramingBounds(members, L);
    const vtPlates = (members || [])
      .filter(m => isVeryTopPlate(m, H) && Number.isFinite(m.x0) && Number.isFinite(m.x1) && Math.abs(m.x1 - m.x0) >= 1)
      .map(m => ({ ...m, x0: Math.min(m.x0, m.x1), x1: Math.max(m.x0, m.x1) }))
      .sort((a, b) => a.x0 - b.x0);
    const vtMinX = vtPlates.length ? Math.min(...vtPlates.map(m => m.x0)) : studMinX;
    const vtMaxX = vtPlates.length ? Math.max(...vtPlates.map(m => m.x1)) : studMaxX;
    const elevMinX = Math.min(0, studMinX, vtMinX);
    const elevMaxX = Math.max(L, studMaxX, vtMaxX);
    const elevSpanX = Math.max(1, elevMaxX - elevMinX);

    pg.text(MARGIN, 52, [`Wall Panel ${label}`, `Layer ${w.layer || '-'}`, `Panel length ${fis(studSpan)}${uSuf}`, `Wall height ${fis(H)}${uSuf}`, `Thickness ${fis(w.thickness || 0)}${uSuf}`,
      `Stud spacing ${fis(stud)}${uSuf} o.c.`, `Area ${isImpPanel ? (area * 10.7639).toFixed(1) + ' sq ft' : area.toFixed(2) + ' m2'}`, `Timber ${volumeM3.toFixed(3)} m3`, `Weight ${panelWeightKg} kg`, `Openings ${openings.length}`].join('     '), { size: 5.8 });

    // elevation box (left): the panel only, scaled to fit the left two-thirds of the page
    const aL = MARGIN + 70, aR = 404, aTop = 94, aBot = 300;
    const s = Math.min((aR - aL) / elevSpanX, (aBot - aTop) / H);
    const originX = aL - Math.min(0, elevMinX) * s;
    const X = x => originX + x * s, Z = z => aBot - z * s;
    pg.text(MARGIN, 66, `Scale 1 : ${Math.round(1 / (s * (MM_PER_IN / 72)) / 10) * 10}  |  ALL DIMENSIONS IN ${isImpPanel ? 'FEET & INCHES (ft-in)' : 'mm'}`, { size: 6, bold: true });

    // Draw framing members: clip bottom and lower top plates to stud bounds [studMinX, studMaxX],
    // while keeping Very Top Plates unclipped so they extend outside the panel like in 3D
    for (const m of members) {
      const isVT = isVeryTopPlate(m, H);
      const isPlate = /plate/i.test(m.type) && !isVT;
      const mx0 = isPlate ? Math.max(studMinX, Math.min(m.x0, m.x1)) : Math.min(m.x0, m.x1);
      const mx1 = isPlate ? Math.min(studMaxX, Math.max(m.x0, m.x1)) : Math.max(m.x0, m.x1);
      if (mx1 - mx0 < 1) continue;
      const x0 = X(mx0), x1 = X(mx1), z0 = Z(m.z1), z1 = Z(m.z0);
      pg.rect(Math.min(x0, x1), Math.min(z0, z1), Math.abs(x1 - x0), Math.abs(z1 - z0), { fill: [1, 1, 1], stroke: [0, 0, 0], lw: 0.35 });
    }

    // Very Top Plate dimension chain above the elevation (including step-back from stud bounds, segments, and gaps)
    if (vtPlates.length > 0) {
      const vtDimY = Z(H) - 10;
      const vtChainSegs = [];
      if (vtPlates[0].x0 > studMinX + 5) {
        vtChainSegs.push({ x0: studMinX, x1: vtPlates[0].x0, kind: 'step' });
      }
      for (let i = 0; i < vtPlates.length; i++) {
        const seg = vtPlates[i];
        vtChainSegs.push({ x0: seg.x0, x1: seg.x1, kind: 'plate' });
        if (i + 1 < vtPlates.length && vtPlates[i + 1].x0 - seg.x1 >= 5) {
          vtChainSegs.push({ x0: seg.x1, x1: vtPlates[i + 1].x0, kind: 'gap' });
        }
      }
      const lastVt = vtPlates[vtPlates.length - 1];
      if (lastVt.x1 < studMaxX - 5) {
        vtChainSegs.push({ x0: lastVt.x1, x1: studMaxX, kind: 'step' });
      }

      const chainStartX = X(vtChainSegs[0].x0);
      const chainEndX = X(vtChainSegs[vtChainSegs.length - 1].x1);
      pg.line(chainStartX, vtDimY, chainEndX, vtDimY, { w: 0.5, c: [0.85, 0.30, 0.05] });

      const tickXs = [vtChainSegs[0].x0, ...vtChainSegs.map(cs => cs.x1)];
      for (const tx of tickXs) {
        const px = X(tx);
        pg.line(px, Z(H) - 1.2, px, vtDimY - 3.5, { w: 0.35, c: [0.35, 0.35, 0.35] });
        pg.line(px - 2.2, vtDimY - 2.2, px + 2.2, vtDimY + 2.2, { w: 0.55, c: [0.85, 0.30, 0.05] });
      }
      for (const cs of vtChainSegs) {
        const segLen = Math.round(cs.x1 - cs.x0);
        if (segLen < 5) continue;
        const sx0 = X(cs.x0), sx1 = X(cs.x1);
        const midX = (sx0 + sx1) / 2;
        const isGap = cs.kind === 'gap';
        const labelY = (isGap && (sx1 - sx0 < 14)) ? (vtDimY + 5.2) : (vtDimY - 2.8);
        pg.text(midX, labelY, fis(segLen), {
          size: isGap ? 4.2 : 4.6,
          bold: true,
          align: 'center',
          c: isGap ? [0.35, 0.35, 0.35] : [0.1, 0.1, 0.1],
        });
      }
    }

    // Exterior OSB sheathing hidden lines (drawn over framing members with very low line thickness)
    if (osbApplied) {
      const { xBreaks, zBreaks, vStudCenters } = computeSheathingBreaks(L, H, members);
      const hiddenStroke = [0.76, 0.25, 0.05];
      const jointStroke = [0.70, 0.20, 0.04];
      for (let i = 0; i + 1 < xBreaks.length; i++) {
        const sx = xBreaks[i], sw = xBreaks[i + 1] - sx;
        if (sw < 1) continue;
        for (let j = 0; j + 1 < zBreaks.length; j++) {
          const sz = zBreaks[j], sh = zBreaks[j + 1] - sz;
          if (sh < 1) continue;
          const xL = X(sx), xR = X(sx + sw), zB = Z(sz), zT = Z(sz + sh);
          // Very thin dashed sheet perimeter hidden lines
          pg.dashed([[xL, zT], [xR, zT], [xR, zB], [xL, zB]], { stroke: hiddenStroke, w: 0.18, dash: [2.5, 2] });
          // Very thin dashed sheet diagonal hidden line
          pg.line(xL, zB, xR, zT, { w: 0.15, c: hiddenStroke, dash: [2, 2.5] });
        }
      }
      // Vertical OSB sheet joints along stud centerlines (hidden lines, very thin)
      for (let i = 1; i + 1 < xBreaks.length; i++) {
        const bx = xBreaks[i];
        pg.line(X(bx), Z(0), X(bx), Z(H), { w: 0.22, c: jointStroke, dash: [3, 2] });
      }
      // Horizontal OSB sheet joints stopping at the centerline of blocking studs (hidden lines, very thin)
      for (let j = 1; j + 1 < zBreaks.length; j++) {
        const bz = zBreaks[j];
        pg.line(X(0), Z(bz), X(L), Z(bz), { w: 0.25, c: jointStroke, dash: [3, 2] });
        pg.text(X(L) - 4, Z(bz) - 2.5, `OSB HORIZONTAL JOINT @ ${fis(bz)}${uSuf} (HIDDEN LINE)`, {
          size: 3.8, bold: true, align: 'right', c: jointStroke,
        });
      }
      // Vertical stud nailing / fastener hidden lines along intermediate studs
      for (const sc of vStudCenters) {
        if (xBreaks.some(bx => Math.abs(bx - sc) < 5)) continue;
        pg.line(X(sc), Z(0), X(sc), Z(H), { w: 0.12, c: hiddenStroke, dash: [1, 2.5] });
      }
    }

    // Squaring check diagonal line across stud framing span (text only parallel to diagonal line, no background box)
    const diagSquareMm = Math.round(Math.hypot(studSpan, H));
    const sx0 = X(studMinX) + 2, sz0 = Z(0) - 2, sx1 = X(studMaxX) - 2, sz1 = Z(H) + 2;
    pg.line(sx0, sz0, sx1, sz1, { w: 0.35, c: [0.35, 0.35, 0.35], dash: [4, 3] });
    const midDiagX = (sx0 + sx1) / 2, midDiagZ = (sz0 + sz1) / 2;
    const diagAngRad = Math.atan2(sz0 - sz1, sx1 - sx0);
    const diagAngDeg = (diagAngRad * 180) / Math.PI;
    const perpOffset = 3.0;
    const sqTxtX = midDiagX - Math.sin(diagAngRad) * perpOffset;
    const sqTxtZ = midDiagZ - Math.cos(diagAngRad) * perpOffset;
    pg.text(sqTxtX, sqTxtZ, `SQUARING: ${fis(diagSquareMm)}${uSuf}`, {
      size: 4.2, bold: true, align: 'center', c: [0.15, 0.15, 0.15], rot: diagAngDeg,
    });
    for (const o of openings) {
      const left = o.offset - o.width / 2, sill = o.sill || 0, top = sill + o.height;
      pg.rect(X(left), Z(top), o.width * s, (top - sill) * s, { fill: [1, 1, 1], stroke: [0, 0, 0], lw: 0.65 });
      const cx = X(left + o.width / 2), cy = Z((top + sill) / 2);
      pg.text(cx, cy - 3, `${o.code || o.id}`, { size: 5.2, bold: true, align: 'center', c: [0, 0, 0] });
      pg.text(cx, cy + 4, `${fis(o.width)} x ${fis(o.height)}`, { size: 4.5, bold: true, align: 'center' });
      pg.text(cx, cy + 11, `sill ${fis(sill)}  head ${fis(top)}`, { size: 4.2, align: 'center' });
      pg.text(cx, cy + 18, `3/44x220 C24 Lintel`, { size: 4.0, bold: true, align: 'center', c: [0, 0, 0] });
    }
    // Place ALL member Mark labels (A, B, C, ..., O) on framing members without overlapping
    const placedMarks = computePanelMemberMarks(members, rows, L, H, openings, X, Z, s, pg.textScale || 0.85);
    for (const pm of placedMarks) {
      if (pm.backing) {
        pg.rect(pm.box.x0, pm.box.y0, pm.box.x1 - pm.box.x0, pm.box.y1 - pm.box.y0, { fill: [1, 1, 1], stroke: null, lw: 0 });
      }
      pg.text(pm.x, pm.textY, pm.letter, { size: pm.fontSize, bold: true, align: 'center', c: [0, 0, 0] });
    }
    // height chain (left) and levels (right)
    const blocks = members.filter(m => /block/i.test(m.type));
    const openLevels = [0, H, ...openings.flatMap(o => [o.sill || 0, (o.sill || 0) + o.height])];
    const blockLevels = [0, H, ...blocks.map(m => m.z0)];
    const zc = [...new Set([...openLevels, ...blockLevels].map(v => Math.round(v)))].sort((p, q) => p - q);   // right side levels
    const chain = (x, levels) => {
      const zs = [...new Set(levels.map(v => Math.round(v)))].sort((p, q) => p - q);
      pg.line(x, Z(0), x, Z(H), { w: 0.5 });
      for (let i = 0; i + 1 < zs.length; i++) {
        if (zs[i + 1] - zs[i] < 20) continue;
        pg.line(x - 3, Z(zs[i]), x + 3, Z(zs[i]), { w: 0.3 });
        pg.text(x - 5, (Z(zs[i]) + Z(zs[i + 1])) / 2, fis(zs[i + 1] - zs[i]), { size: 5.8, align: 'right', rot: 90 });
      }
    };
    const bx = X(Math.min(studMinX, vtMinX)) - 14, openX = bx - 22, ox = openX - 22;   // blocking chain next to the leftmost stud/plate, opening chain, overall outermost
    chain(bx, blockLevels);
    chain(openX, openLevels);
    pg.line(ox, Z(0), ox, Z(H), { w: 0.6 });
    pg.line(ox - 3, Z(0), ox + 3, Z(0), { w: 0.4 });
    pg.line(ox - 3, Z(H), ox + 3, Z(H), { w: 0.4 });
    pg.text(ox - 6, (Z(0) + Z(H)) / 2, `${fis(H)} OVERALL HEIGHT`, { size: 5.2, bold: true, align: 'center', rot: 90 });
    // Marked Wall Panel Side Vertical Section View (1:1 scaled thickness matching Wall Plan strip, placed clear of any Very Top Plate overhang)
    const secX = X(Math.max(L, studMaxX, vtMaxX)) + 20;
    const secW = Math.max(4, panelStudDepth * s);
    const secX1 = secX + secW;
    const secCavityFill = exteriorWall ? [0.969, 0.969, 0.918] : [0.886, 0.910, 0.941];
    pg.text(secX - 2, Z(H) - 9, "WALL SECTION", { size: 4.8, bold: true, align: "left" });
    pg.text(secX, Z(H) - 2.5, "Int", { size: 4.2, bold: true, align: "center", c: [0.15, 0.40, 0.20] });
    pg.text(secX1, Z(H) - 2.5, "Ext", { size: 4.2, bold: true, align: "center", c: [0.65, 0.25, 0.10] });

    // Outer section cavity frame & dashed centerline
    pg.rect(secX, Z(H), secW, H * s, { fill: secCavityFill, stroke: [0.118, 0.161, 0.231], lw: 0.75 });
    pg.line(secX + secW * 0.5, Z(H), secX + secW * 0.5, Z(0), { w: 0.25, c: [0.7, 0.72, 0.75], dash: [2, 2] });

    // Clear window/door rough openings vertically in the section
    const secOpenRanges = [];
    for (const o of openings) {
      const zSill = Math.max(0, o.sill || 0);
      const zHead = Math.min(H, zSill + (o.height || 1200));
      if (zHead <= zSill + 10) continue;
      secOpenRanges.push([zSill, zHead]);
      const yTop = Z(zHead), yBot = Z(zSill);
      pg.rect(secX, yTop, secW, yBot - yTop, { fill: [0.97, 0.98, 1.0], stroke: null });
      pg.line(secX, yTop, secX, yBot, { w: 0.45, c: [0.278, 0.333, 0.412], dash: [2.5, 2.0] });
      pg.line(secX1, yTop, secX1, yBot, { w: 0.45, c: [0.278, 0.333, 0.412], dash: [2.5, 2.0] });
      pg.line((secX + secX1) / 2, yTop, (secX + secX1) / 2, yBot, { w: 0.35, c: [0.008, 0.518, 0.780], dash: [1.5, 1.5] });
      pg.line(secX, yTop, secX1, yTop, { w: 0.65, c: [0.118, 0.161, 0.231] });
      pg.line(secX, yBot, secX1, yBot, { w: 0.65, c: [0.118, 0.161, 0.231] });
    }

    // Section view of cut horizontal members (Soleplate, Top plates, Sills, Horizontal Blocking, and 3-ply Headers) with green X-crosses
    const seenSecRanges = new Set();
    const studFillSec = [0.863, 0.988, 0.906];
    const studStrokeSec = [0.082, 0.502, 0.239];
    for (const m of members) {
      const hz0 = Math.min(m.z0, m.z1), hz1 = Math.max(m.z0, m.z1);
      const hHeight = hz1 - hz0;
      if (!Number.isFinite(hz0) || !Number.isFinite(hz1) || hHeight < 10) continue;
      const isHeader = m.type === 'Header' || (/header|lintel/i.test(m.type) && !/stud/i.test(m.type));
      const isPlate = m.type === 'Bottom plate' || m.type === 'Top plate' || /plate/i.test(m.type);
      const isSill = m.type === 'Sill' || /sill/i.test(m.type);
      const isBlock = m.type === 'Block' || /block|noggin/i.test(m.type) || m.role === 'Horizontal backing';
      if (!isHeader && !isPlate && !isSill && !isBlock) continue;

      const k = `${isHeader ? 'H' : isPlate ? 'P' : isSill ? 'S' : 'B'}:${Math.round(hz0 / 4) * 4}:${Math.round(hz1 / 4) * 4}`;
      if (seenSecRanges.has(k)) continue;
      seenSecRanges.add(k);

      const yTop = Z(hz1), yBot = Z(hz0), drawH = Math.max(1.25, yBot - yTop);
      const mLw = Math.min(0.45, Math.max(0.22, drawH * 0.20));
      const dLw = Math.min(0.35, Math.max(0.16, drawH * 0.15));

      if (isHeader) {
        const plyW = secW / 3;
        for (let p = 0; p < 3; p++) {
          const px0 = secX + p * plyW;
          pg.rect(px0, yTop, plyW, drawH, { fill: studFillSec, stroke: studStrokeSec, lw: mLw });
          pg.line(px0, yTop, px0 + plyW, yTop + drawH, { w: dLw, c: studStrokeSec });
          pg.line(px0, yTop + drawH, px0 + plyW, yTop, { w: dLw, c: studStrokeSec });
        }
      } else {
        pg.rect(secX, yTop, secW, drawH, { fill: studFillSec, stroke: studStrokeSec, lw: mLw });
        pg.line(secX, yTop, secX1, yTop + drawH, { w: dLw, c: studStrokeSec });
        pg.line(secX, yTop + drawH, secX1, yTop, { w: dLw, c: studStrokeSec });
      }
    }

    // 12 mm OSB sheathing along vertical section face (exterior walls only)
    const osbSecW = Math.max(1.2, 12 * s);
    const isExtSecOsb = (stripOsbSide === 'exterior' || stripOsbSide === 'both' || (stripOsbSide !== 'interior' && !w?.sheathingFlipped));
    const extSecOsbPad = (osbApplied && isExtSecOsb) ? osbSecW : 0;
    if (osbApplied) {
      const faces = stripOsbSide === 'both' ? ['exterior', 'interior'] : [stripOsbSide === 'interior' ? 'interior' : 'exterior'];
      const { zBreaks: secZBreaks } = computeSheathingBreaks(L, H, members);
      let zIntervals = [[0, H]];
      for (const [zSill, zHead] of secOpenRanges) {
        const next = [];
        for (const [a, b] of zIntervals) {
          if (zHead <= a || zSill >= b) next.push([a, b]);
          else {
            if (zSill > a + 10) next.push([a, zSill]);
            if (zHead < b - 10) next.push([zHead, b]);
          }
        }
        zIntervals = next;
      }
      for (const face of faces) {
        const xFace = (face === 'interior') ? (secX - osbSecW) : secX1;
        for (const [zA, zB] of zIntervals) {
          if (zB - zA < 20) continue;
          const syTop = Z(zB), syBot = Z(zA);
          pg.rect(xFace, syTop, osbSecW, Math.max(1, syBot - syTop), { fill: [0.996, 0.843, 0.667], stroke: [0.863, 0.149, 0.149], lw: 0.22 });
          for (let j = 1; j + 1 < secZBreaks.length; j++) {
            const bz = secZBreaks[j];
            if (bz > zA + 20 && bz < zB - 20) {
              pg.line(xFace, Z(bz), xFace + osbSecW, Z(bz), { w: 0.25, c: [0.600, 0.106, 0.106] });
            }
          }
        }
      }
    }

    // Height dimension chain & cumulative level ticks to the right of vertical section view
    const tickBaseX = secX1 + extSecOsbPad;
    const sectionLevels = [...new Set([0, 38, Math.round(H - 76), Math.round(H - 38), Math.round(H), ...zc])].filter(v => v >= 0 && v <= H).sort((a, b) => a - b);
    const secLblSize = 4.0;
    const minSecGap = secLblSize * 1.55;
    let lastRightY = Infinity; // PDF Y increases downward, so Z(0) > Z(H)
    for (const z of sectionLevels) {
      const py = Z(z);
      const txt = `${Math.round(z)}`;
      const ly2 = Math.min(py, lastRightY - minSecGap);
      lastRightY = ly2;
      pg.line(tickBaseX, py, tickBaseX + 3.5, py, { w: 0.28, c: [0.2, 0.2, 0.2] });
      if (Math.abs(py - ly2) > 0.5) {
        pg.line(tickBaseX + 3.5, py, tickBaseX + 9.5, ly2, { w: 0.28, c: [0.2, 0.2, 0.2] });
        pg.line(tickBaseX + 9.5, ly2, tickBaseX + 11.5, ly2, { w: 0.28, c: [0.2, 0.2, 0.2] });
      } else {
        pg.line(tickBaseX + 3.5, py, tickBaseX + 11.5, py, { w: 0.28, c: [0.2, 0.2, 0.2] });
      }
      pg.text(tickBaseX + 12.5, ly2 + 1.4, txt, { size: secLblSize, align: "left", c: [0.1, 0.1, 0.1] });
    }

    // stud and cripple dimensions below the panel: strictly for studs (measured from leftmost stud = 0 to rightmost stud = studSpan)
    const bottomY = aBot, studTop = bottomY + 18, LBL = 4.5, minGap = LBL * 1.65;
    let lastX = -Infinity;
    studPositions(members).forEach(x => {
      const tx = X(x), txt = fis(Math.max(0, x - studMinX));
      pg.line(tx, bottomY, tx, bottomY + 6, { w: 0.25 });
      const lx2 = Math.max(tx + 2, lastX + minGap);
      lastX = lx2;
      if (lx2 - (tx + 2) > 0.5) {
        pg.line(tx, bottomY + 6, tx, bottomY + 11, { w: 0.35 });
        pg.line(tx, bottomY + 11, lx2, studTop, { w: 0.35 });
      } else {
        pg.line(tx, bottomY + 6, tx, studTop, { w: 0.35 });
      }
      pg.text(lx2, studTop + txt.length * LBL * 0.5, txt, { size: LBL, rot: 90 });
    });
    const bandsBottom = studTop + LBL * 4.4 + 4;
    // openings chain (measured strictly from leftmost stud face studMinX to rightmost stud face studMaxX)
    const brk = [...new Set([
      Math.round(studMinX),
      ...openings.flatMap(o => [Math.round(o.offset - o.width / 2), Math.round(o.offset + o.width / 2)]),
      Math.round(studMaxX)
    ])].filter(v => v >= Math.round(studMinX) && v <= Math.round(studMaxX)).sort((p, q) => p - q);
    const rowOpen = bandsBottom + 10;
    pg.line(X(studMinX), rowOpen, X(studMaxX), rowOpen, { w: 0.5 });
    for (let i = 0; i + 1 < brk.length; i++) {
      if (brk[i + 1] - brk[i] < 20) continue;
      const x1 = X(brk[i]), x2 = X(brk[i + 1]);
      pg.line(x1, rowOpen - 3, x1, rowOpen + 3, { w: 0.3 });
      pg.text((x1 + x2) / 2, rowOpen + 8, fis(brk[i + 1] - brk[i]), { size: 5.2, align: 'center' });
    }
    pg.line(X(studMaxX), rowOpen - 3, X(studMaxX), rowOpen + 3, { w: 0.3 });
    const rowOverall = rowOpen + 18;
    pg.line(X(studMinX), rowOverall, X(studMaxX), rowOverall, { w: 0.6 });
    pg.line(X(studMinX), rowOverall - 3, X(studMinX), rowOverall + 3, { w: 0.4 });
    pg.line(X(studMaxX), rowOverall - 3, X(studMaxX), rowOverall + 3, { w: 0.4 });
    pg.text((X(studMinX) + X(studMaxX)) / 2, rowOverall + 9, `${fis(studSpan)}${uSuf} OVERALL O/A FRAMING`, { size: 6.4, bold: true, align: 'center' });
    pg.text(MARGIN, rowOverall + 20, `Stud and cripple positions: corner of stud, measured from the left end stud of the panel in ${isImpPanel ? 'ft-in' : 'mm'}. End stud corner: ${fis(studSpan)}${uSuf}.`, { size: 5.2 });
    drawWallPlanStrip(pg, { w, label, L, members, openings, exteriorWall, osbApplied, s, X });

    // cutting list (right column)
    const cx0 = 460;
    pg.text(cx0, 66, 'CUTTING LIST', { size: 8, bold: true });
    const formatMemberName = name => String(name || '').replace(/^Inside junction backing stud/i, 'Inside jct backing');
    const body = rows.map(r => [r.label, formatMemberName(r.type), r.sizeLabel, r.qty, fis(r.length), volumeOfRowM3(r).toFixed(4)]);
    const headers = ['Mark', 'Member', isImpPanel ? 'Size' : 'Size mm', 'Qty', isImpPanel ? 'Cut' : 'Cut mm', 'Vol m3'];
    const colX = [0, 20, 114, 184, 212, 254]; colX.total = 296; colX.align = ['left', 'left', 'left', 'right', 'right', 'right'];
    const rowH = body.length > 22 ? 7.4 : 9;
    const yEnd = drawTable(pg, cx0, 74, headers, colX, body, { rowH, fontSize: 5.5 });
    pg.text(cx0, yEnd + 10, `Total timber volume: ${volumeM3.toFixed(3)} m3`, { size: 6.8, bold: true });
    if (!body.length) pg.text(cx0, 88, 'No framing members.', { size: 7 });

    // OSB sheathing takeoff (right column, below the cutting list).
    const sy = yEnd + 26;
    const osbLbl = isImpPanel ? '1/2"' : `${OSB_THICKNESS_MM} mm`;
    let ry;
    if (!osbApplied) {
      pg.text(cx0, sy, `${osbLbl} OSB SHEATHING: OFF`, { size: 6.8, bold: true });
      pg.text(cx0, sy + 10, 'No OSB pieces are included in this panel takeoff.', { size: 5.9 });
      ry = sy + 24;
    } else {
      const panelSheets = Array.isArray(sheets) && sheets.length ? sheets : sheathingPieces(L, H, members);
      pg.text(cx0, sy, `${osbLbl} OSB SHEATHING - ${stripOsbSide.toUpperCase()} FACE (SHEET ${isImpPanel ? "4'-0\" x 8'-0\"" : '1219 x 2438 mm'})`, { size: 6.4, bold: true });
      const sColX = [0, 84, 155]; sColX.total = 220; sColX.align = ['left', 'left', 'right'];
      drawTable(pg, cx0, sy + 10, [isImpPanel ? 'Cut L' : 'Cut L mm', isImpPanel ? 'Cut W' : 'Cut W mm', 'Qty'], sColX, panelSheets.map(sh => [fis(sh.length), fis(sh.width), `(${sh.qty})`]), { rowH: 8.5, fontSize: 5.8 });
      ry = sy + 10 + 8.5 * (panelSheets.length + 1) + 16;
    }
    pg.text(cx0, ry, 'Openings', { size: 8, bold: true });
    if (!openings.length) pg.text(cx0, ry + 10, 'No openings.', { size: 6.2 });
    openings.forEach((o, i) => {
      const left = o.offset - o.width / 2, sill = o.sill || 0;
      pg.text(cx0, ry + 10 + i * 9, `${o.id}  ${o.type}  ${fis(o.width)} x ${fis(o.height)}  sill ${fis(sill)}  head ${fis(sill + o.height)}  left ${fis(left)}`, { size: 5.8 });
    });
    drawTitleBlock(pg, { project: meta.project, title: `WALL PANEL ${label} (${panelWeightKg}kg)`, sheetNo, scale: `1 : ${Math.round(1 / (s * (MM_PER_IN / 72)) / 10) * 10}` });
  }

  // ------------------------------------------------------------ main build
  function irelandValue(value, unit = '') {
    return value === undefined || value === null || String(value).trim() === '' ? 'NOT ENTERED' : `${value}${unit ? ` ${unit}` : ''}`;
  }

  function drawRegisterTable(pg, y, headers, secondColumn, rows, { rowH = 12, fontSize = 7 } = {}) {
    const cols = [0, secondColumn];
    cols.total = PAGE_W - 2 * MARGIN;
    cols.align = ['left', 'left'];
    return drawTable(pg, MARGIN, y, headers, cols, rows, { rowH, fontSize });
  }

  /** Preliminary Irish design-basis/load register. Values are user-entered; this page performs no code checks. */
  function buildIrelandDesignBasisPage(model, options = {}) {
    const pg = new Page();
    const sd = model.structuralDesign || {};
    const ie = sd.ireland || {};
    pg.text(MARGIN, 27, 'REPUBLIC OF IRELAND - WALL PANEL DESIGN BASIS & LOAD REGISTER', { size: 13, bold: true });
    pg.text(MARGIN, 43, `Project: ${model.name || 'Project'} | Revision: ${model.revision ?? '--'} | Exterior 12 mm OSB: ${options.exteriorOsbEnabled === false ? 'OFF' : 'ON'} | INPUT REGISTER ONLY - ENGINEER REVIEW REQUIRED`, { size: 7.5 });
    pg.text(MARGIN, 59, 'SITE AND ADOPTED CODE BASIS', { size: 8.5, bold: true, c: [0.10, 0.30, 0.21] });
    const basisRows = [
      ['Site location / town / county / Eircode', irelandValue(ie.siteLocation)],
      ['Building Control Authority / reviewer', irelandValue(ie.authority)],
      ['Confirmed code editions / National Annexes', irelandValue(ie.codeEdition)],
      ['Load combinations / partial factors basis', irelandValue(ie.loadCombinationBasis)],
      ['Site altitude above sea level', irelandValue(ie.siteAltitudeM, 'm AOD')],
      ['Terrain / exposure description', irelandValue(ie.terrainExposure)],
      ['Basic wind velocity vb,0 (site basis)', irelandValue(ie.basicWindVelocityMS, 'm/s')],
    ];
    drawRegisterTable(pg, 72, ['Project input', 'Value entered'], 275, basisRows, { rowH: 12, fontSize: 7 });
    pg.text(MARGIN, 181, 'CHARACTERISTIC ACTIONS / WALL LOAD TRANSFER INPUTS', { size: 8.5, bold: true, c: [0.10, 0.30, 0.21] });
    const actionRows = [
      ['Floor permanent action Gk', irelandValue(ie.floorDeadKNm2, 'kN/m2')],
      ['Floor imposed action Qk', irelandValue(ie.floorImposedKNm2, 'kN/m2')],
      ['Roof permanent action Gk', irelandValue(ie.roofDeadKNm2, 'kN/m2')],
      ['Roof imposed / maintenance action Qk', irelandValue(ie.roofImposedKNm2, 'kN/m2')],
      ['Characteristic ground snow load sk', irelandValue(ie.groundSnowKNm2, 'kN/m2')],
      ['Calculated characteristic roof snow action', irelandValue(ie.roofSnowKNm2, 'kN/m2')],
      ['Net wall wind pressure', irelandValue(ie.windPressureKNm2, 'kN/m2')],
      ['Net wall wind suction', irelandValue(ie.windSuctionKNm2, 'kN/m2')],
      ['Net roof uplift', irelandValue(ie.roofUpliftKNm2, 'kN/m2')],
      ['Wall / top-plate gravity line load', irelandValue(ie.wallGravityLineKNm, 'kN/m')],
      ['Maximum beam / truss point reaction', irelandValue(ie.maxPointReactionKN, 'kN')],
    ];
    drawRegisterTable(pg, 194, ['Action', 'Characteristic input'], 340, actionRows, { rowH: 11, fontSize: 6.7 });
    pg.text(MARGIN, 338, 'TIMBER, SHEATHING AND LATERAL RESISTANCE', { size: 8.5, bold: true, c: [0.10, 0.30, 0.21] });
    const materialRows = [
      ['Timber strength class / product', irelandValue(ie.timberGrade)],
      ['Timber service class', irelandValue(ie.serviceClass)],
      ['Lateral / racking system', irelandValue(ie.lateralSystem)],
      ['OSB class / product declaration', irelandValue(ie.osbGrade)],
      ['OSB thickness', irelandValue(ie.osbThicknessMM, 'mm')],
      ['OSB edge fastener spacing', irelandValue(ie.osbEdgeFixingSpacingMM, 'mm')],
      ['OSB field fastener spacing', irelandValue(ie.osbFieldFixingSpacingMM, 'mm')],
    ];
    drawRegisterTable(pg, 351, ['Design item', 'Value / specification'], 275, materialRows, { rowH: 11, fontSize: 6.7 });
    pg.text(MARGIN, 450, 'CODE BASIS TO CONFIRM FOR THE PROJECT', { size: 8, bold: true, c: [0.10, 0.30, 0.21] });
    pg.text(MARGIN, 463, 'Irish Building Regulations Part A / TGD A; I.S. EN 1990; I.S. EN 1991-1-1; I.S. EN 1991-1-3; I.S. EN 1991-1-4; I.S. EN 1991-1-7;', { size: 6.5 });
    pg.text(MARGIN, 473, 'I.S. EN 1995-1-1 with Irish National Annex; EN 1995-1-2 where fire design applies; EN 338 / EN 14081 for timber; EN 300 / EN 13986 for OSB/panel products.', { size: 6.5 });
    pg.text(MARGIN, 490, 'NOTES / LOAD SOURCES', { size: 7.5, bold: true });
    const note = String(ie.loadNotes || 'No design notes entered.').replace(/\s+/g, ' ').trim();
    const noteLines = note.match(/.{1,145}(?:\s|$)/g) || [];
    noteLines.slice(0, 3).forEach((line, i) => pg.text(MARGIN, 501 + i * 7, line.trim(), { size: 6.2 }));
    pg.line(MARGIN, 526, PAGE_W - MARGIN, 526, { w: 0.6, c: [0.65, 0.35, 0.12] });
    pg.text(MARGIN, 537, 'CAUTION: Blank values are NOT ENTERED, not zero. Load values are project inputs, not values calculated by this software.', { size: 7, bold: true, c: [0.55, 0.20, 0.10] });
    pg.text(MARGIN, 548, 'This page is a design brief only; it does not verify wind/snow actions, load combinations, member sizes, OSB shear, fasteners, anchorage or foundations.', { size: 6.6 });
    pg.text(MARGIN, 558, 'Confirm the applicable Eurocode generation and Irish National Annex editions with NSAI and the project reviewer. A competent structural engineer must verify and approve.', { size: 6.6 });
    pg.text(MARGIN, 583, 'Official references: gov.ie - Technical Guidance Document A; NSAI - Eurocodes in Ireland; NSAI Irish National Annexes for snow actions and timber structures.', { size: 6.2 });
    return pg;
  }

  function buildPackage(model, framingFn, plannerFn, options = {}) {
    const pages = [];
    const uiMode = typeof document !== 'undefined' ? document.getElementById('wall-text-size')?.value : null;
    const rawScale = Number(options.textScale);
    const textScale = uiMode === 'small' ? 0.72 : uiMode === 'large' ? 0.98 : (Number.isFinite(rawScale) && rawScale > 0 && rawScale <= 1.05 ? rawScale : 0.85);
    if (String(model.structuralDesign?.region || '').toUpperCase() === 'IE') {
      const iePg = buildIrelandDesignBasisPage(model, options);
      iePg.textScale = textScale;
      pages.push(iePg);
    }
    // Rough openings: use exact dimensions from model unless explicit tolerance requested
    const RO_TOL_MM = options.roughOpeningTolerance !== undefined ? options.roughOpeningTolerance : 0;
    const roModel = { ...model, elements: model.elements.map(e => (e.type === 'window' || e.type === 'door')
      ? { ...e, width: e.width + RO_TOL_MM, height: e.height + RO_TOL_MM } : e) };
    const roWall = w => ({ ...w, openings: openingsOf(roModel, w.id) });
    const roFraming = w => framingFn(roWall(w), roModel);
    const stories = (model.stories && model.stories.length ? model.stories : [{ id: 's0', name: 'Level 1' }])
      .filter(s => model.elements.some(e => e.type === 'wall' && e.story === s.id));
    const summary = [];
    const panels = [];
    const allOpenings = [];
    const osbEnabled = options.exteriorOsbEnabled !== false;
    // Check if 2D Framing Plan active appPanels exist with explicit stud framing
    let appPanels = null;
    if (typeof win.getAppPanelsWithFraming === 'function') {
      appPanels = win.getAppPanelsWithFraming();
    } else if (Array.isArray(options.appPanels)) {
      appPanels = options.appPanels;
    } else if (Array.isArray(win.appPanels)) {
      appPanels = win.appPanels;
    }

    if (appPanels && appPanels.length > 0) {
      // 1. First Page: 2D Framing Plan Overview Page
      const storyName = 'Ground floor';
      const cleanLabelOf = (p, idx) => {
        const isExt = p.type === 'external';
        const kind = isExt ? 'E' : 'I';
        if (p.id && /^[EI]\d+/i.test(p.id)) return p.id.toUpperCase();
        return `${kind}${String(idx + 1).padStart(2, '0')}`;
      };

      const walls = appPanels.map((p, idx) => ({
        id: cleanLabelOf(p, idx),
        rawId: p.id,
        thickness: p.thickness,
        height: p.height,
        layer: p.type === 'external' ? 'Exterior Walls' : 'Interior Walls',
        isExterior: p.type === 'external',
        isExternal: p.type === 'external',
        lumberGrade: p.lumberGrade,
        a: p.a || { x: 0, y: 0 },
        b: p.b || { x: p.length, y: 0 }
      }));

      const labels = new Map();
      appPanels.forEach((p, idx) => {
        const clean = cleanLabelOf(p, idx);
        const seg = { segments: [{ d0: 0, d1: p.length, label: clean }], range: clean };
        labels.set(p.id, seg);
        labels.set(clean, seg);
      });

      const members3d = new Map();
      for (let idx = 0; idx < appPanels.length; idx++) {
        const p = appPanels[idx];
        const clean = cleanLabelOf(p, idx);
        const polys = (p.members || []).map(m => ({ m, poly: [[m.x0, 0], [m.x1, 0], [m.x1, p.thickness], [m.x0, p.thickness]] }));
        members3d.set(p.id, polys);
        members3d.set(clean, polys);
      }

      const plan = new Page();
      plan.textScale = textScale;
      drawPlan(plan, storyName, walls, labels, model, members3d, { project: model.name || 'Project', sheet: '01' }, options);
      pages.push(plan);

      // 2. Individual Wall Panel Elevation + Plan Report Pages
      for (let idx = 0; idx < appPanels.length; idx++) {
        const p = appPanels[idx];
        const label = cleanLabelOf(p, idx);
        const L = p.length;
        const H = p.height;
        const w = {
          id: label,
          name: p.name || label,
          thickness: p.thickness,
          height: p.height,
          layer: p.type === 'external' ? 'Exterior Walls' : 'Interior Walls',
          isExterior: p.type === 'external',
          isExternal: p.type === 'external',
          lumberGrade: p.lumberGrade
        };

        const members = p.members;
        const openings = (p.openings || []).map(o => ({
          ...o,
          offset: o.startDist + o.width / 2,
          sill: o.sillHeight || 0
        }));

        const rows = cutListFor(members);
        allOpenings.push(...openings.map(o => ({ ...o, panel: label, ...kingTrimmerCounts(o, members, 38) })));
        const area = sqm(L * H);
        const stud = p.studSpacing || 400;
        const exteriorWall = p.type === 'external';
        const panelOsbSide = exteriorWall ? (win.getWallSheathingSide ? win.getWallSheathingSide(w) : 'exterior') : 'none';
        const panelOsbApplied = Boolean(osbEnabled && exteriorWall && panelOsbSide !== 'none');
        const sheets = panelOsbApplied ? sheathingPieces(L, H, members) : [];
        const osbPieces = sheets.reduce((t, x) => t + x.qty, 0);
        const volumeM3 = totalVolumeM3(rows);
        const timberWeightKg = volumeM3 * 480;
        const osbWeightKg = panelOsbApplied ? (area * (OSB_THICKNESS_MM === 12 ? 7.2 : 5.5)) : 0;
        const panelWeightKg = Math.max(15, Math.round(timberWeightKg + osbWeightKg + 3.5));

        const pg = new Page();
        pg.textScale = textScale;
        pg.showText = options.includeDimensions !== false;
        drawPanelPage(pg, {
          w,
          label,
          storyName,
          L,
          H,
          members,
          openings,
          rows,
          stud,
          area,
          volumeM3,
          sheets,
          exteriorWall,
          osbEnabled,
          panelMaxLengthMm: PANEL_MAX_MM,
          meta: { project: model.name || 'Project' },
          sheetNo: `EL-01-${label}`
        });

        pages.push(pg);
        summary.push({
          label,
          wallId: w.id,
          length: L,
          height: H,
          area,
          stud,
          volumeM3,
          osbPieces,
          exteriorWall,
          osbApplied: panelOsbApplied,
          studs: members.filter(m => /stud/i.test(m.type)).length,
          blocks: members.filter(m => m.type === 'Block').length,
          openings: openings.length,
          weightKg: panelWeightKg,
          isHeavy: panelWeightKg >= 100
        });
        panels.push({ w, label, storyName, L, H, members, openings, rows, stud, area, volumeM3, sheets, exteriorWall, osbEnabled, panelWeightKg });
      }
    } else {
      const panelCounters = { E: 0, I: 0, PW: 0 }; // project-wide numbering, continuous across storeys
      for (const story of stories) {
        const storyOrderInfo = orderWallsAndOpenings(
          (model.elements || []).filter(e => e.type === 'wall' && e.story === story.id),
          roModel
        );
        const walls = storyOrderInfo.orderedWalls;
        const labels = assignPanelLabels(walls, panelCounters, roModel, options);
        const storyName = story.name || story.id;

        const members3d = new Map();
        for (const w of walls) {
          const ms = ((roFraming(w).members) || []).map(m => ({ m, poly: plannerFn(w, m) })).filter(x => x.poly && x.poly.length >= 4);
          members3d.set(w.id, ms);
        }

        const plan = new Page();
        plan.textScale = textScale;
        drawPlan(plan, storyName, walls, labels, model, members3d, { project: model.name || 'Project', sheet: String(stories.indexOf(story) + 1).padStart(2, '0') }, options);
        pages.push(plan);

        for (const w of walls) {
          const info = labels.get(w.id);
          const wallMembers = (roFraming(w).members || []).map(m => ({ ...m }));
          const wallOpenings = openingsOf(roModel, w.id);
          for (const sg of info.segments) {
            let label = sg.label;
            if (!label || /^W[-_]/i.test(label) || /^WALL/i.test(label) || !/^[EI]\d+/i.test(label)) {
              const isExt = isExteriorWall(w);
              const numMatch = (label || w.id || '').match(/\d+/);
              const num = numMatch ? parseInt(numMatch[0], 10) : (walls.indexOf(w) + 1);
              label = isExt ? `E${String(num).padStart(2, '0')}` : `I${String(num).padStart(2, '0')}`;
            } else {
              label = label.toUpperCase();
            }
            const L = sg.d1 - sg.d0;
          // a stud belongs to the panel its centre falls in; bottom/lower-top plates and blocks are clipped to the panel,
          // while Very Top Plates keep their full 3D lap coordinates so they extend outside the panel like in 3D
          const wallH = Number.isFinite(w.height) && w.height > 0 ? w.height : 3048;
          const members = wallMembers
            .filter(m => /plate|block/i.test(m.type) ? (m.x1 > sg.d0 + 1 && m.x0 < sg.d1 - 1) : ((m.x0 + m.x1) / 2 >= sg.d0 && (m.x0 + m.x1) / 2 <= sg.d1))
            .map(m => {
              const isVT = isVeryTopPlate(m, wallH);
              const x0 = isVT ? (m.x0 - sg.d0) : Math.max(0, m.x0 - sg.d0);
              const x1 = isVT ? (m.x1 - sg.d0) : Math.min(L, m.x1 - sg.d0);
              return { ...m, x0, x1, ...(/plate|block/i.test(m.type) ? { length: Math.max(0, x1 - x0) } : {}) };   // a plate/block piece is only as long as its span
            });
          const openings = wallOpenings
            .filter(o => o.offset >= sg.d0 && o.offset <= sg.d1)
            .map(o => ({ ...o, offset: o.offset - sg.d0, code: storyOrderInfo.openingRawCodeMap.get(o.id) || o.code }));
          // Clip bottom plates and lower top plates to the actual stud framing bounds [studMinX, studMaxX];
          // do NOT clip Very Top Plates so their 3D lap overhang outside the panel is preserved.
          const { minX: pStudMinX, maxX: pStudMaxX } = studFramingBounds(members, L);
          for (const pm of members) {
            if (/plate/i.test(pm.type) && !isVeryTopPlate(pm, wallH)) {
              pm.x0 = Math.max(pStudMinX, pm.x0);
              pm.x1 = Math.min(pStudMaxX, pm.x1);
              pm.length = Math.max(0, pm.x1 - pm.x0);
            }
          }
          // Blocking runs stud face to stud face: each block is clipped to the clear span between the full-height
          // studs on either side, so it attaches to both.
          const fullStuds = members.filter(m => /stud|corner|king|jack|junction|break/i.test(m.type) && Math.abs(m.z1 - m.z0) > 200);
          for (const b of members.filter(m => /block/i.test(m.type))) {
            const c = (b.x0 + b.x1) / 2;
            const left = fullStuds.filter(q => q.x1 <= c + 1).sort((p1, p2) => p2.x1 - p1.x1)[0];
            const right = fullStuds.filter(q => q.x0 >= c - 1).sort((p1, p2) => p1.x0 - p2.x0)[0];
            if (left) b.x0 = left.x1;
            if (right) b.x1 = right.x0;
            b.length = Math.max(0, b.x1 - b.x0);
            if (b.length < 75) {
              const idx = members.indexOf(b);
              if (idx >= 0) members.splice(idx, 1);
            }
          }
          const rows = cutListFor(members);
          allOpenings.push(...openings.map(o => ({ ...o, panel: label, ...kingTrimmerCounts(o, members, w.studWidth || 45) })));
          const area = sqm(L * w.height);
          const stud = studSpacing(studPositions(members));
          const exteriorWall = isExteriorWall(w);
          const panelOsbSide = exteriorWall ? (win.getWallSheathingSide ? win.getWallSheathingSide(w) : (w?.sheathingSide || (w?.sheathingFlipped ? 'interior' : 'exterior'))) : 'none';
          const panelOsbApplied = Boolean(osbEnabled && exteriorWall && panelOsbSide !== 'none');
          const sheets = panelOsbApplied ? sheathingPieces(L, w.height, members) : [];
          const osbPieces = sheets.reduce((t, x) => t + x.qty, 0);
          const volumeM3 = totalVolumeM3(rows);
          const pg = new Page();
          pg.textScale = textScale;
          pg.showText = options.includeDimensions !== false;
          const configuredMax = panelRules(options).max;
          drawPanelPage(pg, { w, label, storyName, L, H: w.height, members, openings, rows, stud, area, volumeM3, sheets, exteriorWall, osbEnabled, panelMaxLengthMm: configuredMax, meta: { project: model.name || 'Project' }, sheetNo: `EL-${String(stories.indexOf(story) + 1).padStart(2, '0')}-${label}` });
          const timberWeightKg = volumeM3 * 480;
          const osbWeightKg = panelOsbApplied ? (area * (OSB_THICKNESS_MM === 12 ? 7.2 : 5.5)) : 0;
          const panelWeightKg = Math.max(15, Math.round(timberWeightKg + osbWeightKg + 3.5));
          pages.push(pg);
          summary.push({ label, wallId: w.id, length: L, height: w.height, area, stud, volumeM3, osbPieces, exteriorWall, osbApplied: panelOsbApplied, studs: members.filter(m => /stud/i.test(m.type)).length, blocks: members.filter(m => m.type === 'Block').length, openings: openings.length, weightKg: panelWeightKg, isHeavy: panelWeightKg >= 100 });
          panels.push({ w, label, storyName, L, H: w.height, members, openings, rows, stud, area, volumeM3, sheets, exteriorWall, osbEnabled, panelWeightKg });
        }
      }
    }
  }

    const isImpPkg = win.appUnits === 'ft-in';
    const unitCapStr = isImpPkg ? 'FEET & INCHES (ft-in)' : 'mm';
    if (allOpenings.length) {
      const sched = new Page();
      sched.textScale = textScale;
      sched.showText = options.includeDimensions !== false;
      sched.text(MARGIN, 30, `WINDOW & DOOR SCHEDULE - DIMENSIONS IN ${unitCapStr}`, { size: 14, bold: true });
      const groups = new Map();
      for (const o of allOpenings) {
        const key = [o.type, o.width, o.height, o.sill || 0, o.king, o.trim].join('|');
        if (!groups.has(key)) groups.set(key, { type: o.type, width: o.width, height: o.height, sill: o.sill || 0, king: o.king, trim: o.trim, panels: new Set(), qty: 0, ids: [] });
        const g = groups.get(key); g.qty += 1; g.panels.add(o.panel); g.ids.push(o.code || o.id);
      }
      const colX = [0, 36, 118, 178, 236, 292, 340, 396, 446]; colX.total = 600; colX.align = ['left', 'left', 'right', 'right', 'right', 'right', 'center', 'center', 'left'];
      const rows = [...groups.values()].map(g => [g.qty, g.type === 'window' ? 'Window' : 'Door', fis(g.width), fis(g.height), fis(g.sill + g.height), fis(g.sill), g.king, g.trim, `${g.ids.join(', ')}  (${[...g.panels].join(', ')})`]);
      drawTable(sched, MARGIN, 60, ['Qty', 'Type', 'Width', 'Height', 'Head level', 'Sill', 'King (L-R)', 'Trimmer (L-R)', 'IDs (panels)'], colX, rows, { rowH: 13 });
      sched.text(MARGIN, PAGE_H - 30, 'Heights are measured from wall base. Opening schedule dimensions are framed rough openings. King studs and trimmers are counted left-right; confirm against structural design.', { size: 7 });
      pages.push(sched);
    }

    if (summary.length) {
      const sum = new Page();
      sum.textScale = textScale;
      sum.showText = options.includeDimensions !== false;
      sum.text(MARGIN, 30, `WALL PANEL MATERIAL SUMMARY - DIMENSIONS AND TIMBER SIZES IN ${unitCapStr}`, { size: 12, bold: true });
      const colX = [0, 45, 120, 200, 260, 310, 360, 420, 480, 530]; colX.total = 580; colX.align = ['left', 'left', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right'];
      const rows = summary.map(s => [s.label, s.label, fis(s.length), fis(s.height), isImpPkg ? (s.area * 10.7639).toFixed(1) : s.area.toFixed(2), s.studs, s.blocks, s.volumeM3.toFixed(3), s.osbPieces, s.openings]);
      const totalVolume = summary.reduce((a, s) => a + s.volumeM3, 0), totalOsbPieces = summary.reduce((a, s) => a + s.osbPieces, 0);
      const totalWeightKg = summary.reduce((a, s) => a + (s.weightKg || 0), 0);
      const y = drawTable(sum, MARGIN, 60, ['Panel', 'Wall', isImpPkg ? 'Length' : 'Length mm', isImpPkg ? 'Height' : 'Height mm', isImpPkg ? 'Area sq ft' : 'Area m2', 'Studs', 'Blocks', 'Timber m3', 'OSB pcs', 'Openings'], colX, rows, { rowH: 12 });
      sum.line(MARGIN, y, MARGIN + colX.total, y, { w: 0.5 });
      sum.text(MARGIN, y + 12, `Total: ${summary.length} panels, ${totalVolume.toFixed(3)} m3 timber, ${totalOsbPieces} OSB cut pieces (${osbEnabled ? 'exterior OSB ON' : 'exterior OSB OFF'}). Total fabrication weight: ${totalWeightKg.toLocaleString()} kg.`, { size: 8, bold: true });
      sum.text(MARGIN, y + 24, 'FRAME SCHEDULE & WEIGHT LEDGER (TUFF HOUSE / Binder1 standard): ' + summary.map(s => `${s.label} (${s.weightKg}kg${s.isHeavy ? ' [HEAVY]' : ''})`).join('  ·  '), { size: 6.2, bold: true, c: [0.15, 0.35, 0.55] });
      pages.push(sum);
    }
    return { pages, panelCount: summary.length, summary, panels };
  }

  /** Member footprint in world coordinates: the app's own function. */
  function defaultPlanner(w, m) {
    if (typeof win.framingMemberWorld === 'function') return win.framingMemberWorld(w, m);
    if (typeof framingMemberWorld === 'function') return framingMemberWorld(w, m);
    return null;
  }

  function buildPackageDXF(summary, panels, model, options = {}, framingFn = win.generateWallFraming, plannerFn = defaultPlanner) {
    const showText = options.includeDimensions !== false;
    const showBlocking = typeof document !== 'undefined' ? (document.getElementById('wall-blocking-toggle')?.checked === true) : false;
    const showOpeningsSash = typeof document !== 'undefined' ? (document.getElementById('wall-openings-toggle')?.checked === true) : false;

    let dxf = `  0\nSECTION\n  2\nHEADER\n  9\n$INSUNITS\n 70\n4\n  0\nENDSEC\n  0\nSECTION\n  2\nTABLES\n  0\nTABLE\n  2\nLTYPE\n 70\n2\n  0\nLTYPE\n  2\nCONTINUOUS\n 70\n0\n  3\nSolid line\n 72\n65\n 73\n0\n 40\n0.0\n  0\nLTYPE\n  2\nDASHED\n 70\n0\n  3\nDashed __ __ __\n 72\n65\n 73\n2\n 40\n120.0\n 49\n75.0\n 49\n-45.0\n  0\nENDTAB\n  0\nTABLE\n  2\nLAYER\n`;
    const layers = [
      ['WALL_PLATES', 8, 'CONTINUOUS'],          // Gray wall cavity lines
      ['EXTERIOR_OSB', 1, 'CONTINUOUS'],         // Red exterior sheathing line
      ['WALL_STUDS', 3, 'CONTINUOUS'],           // Green timber studs + X marks
      ['COLLIDING_STUDS', 1, 'CONTINUOUS'],      // Red colliding studs
      ['WALL_LINTELS', 5, 'CONTINUOUS'],         // Blue headers/lintels
      ['WALL_OPENINGS', 4, 'CONTINUOUS'],        // Cyan opening jambs / sash
      ['WALL_OPENINGS_HIDDEN', 8, 'DASHED'],     // Dashed rough opening lines
      ['WALL_PLAN_LAYOUT', 4, 'CONTINUOUS'],     // Cyan layout
      ['WALL_SECTION', 6, 'CONTINUOUS'],         // Magenta section
      ['WALL_SHEATHING', 8, 'CONTINUOUS'],       // Gray sheathing
      ['WALL_ANNOTATIONS', 7, 'CONTINUOUS'],     // White/Black wall & opening tags
      ['DIMENSIONS', 7, 'CONTINUOUS'],           // White/Black dimensions in mm
      ['ROOM_LABELS', 7, 'CONTINUOUS']           // White/Black room names
    ];
    for (const [lay, color, ltype] of layers) {
      dxf += `  0\nLAYER\n  2\n${lay}\n 70\n0\n 62\n${color}\n  6\n${ltype || 'CONTINUOUS'}\n`;
    }
    dxf += `  0\nENDTAB\n  0\nENDSEC\n  0\nSECTION\n  2\nENTITIES\n`;

    let inPart1 = true;
    let minPart1Y = Infinity;

    const addLine = (layer, x1, y1, x2, y2, ltype = null) => {
      dxf += `  0\nLINE\n  8\n${layer}\n`;
      if (ltype) dxf += `  6\n${ltype}\n`;
      dxf += ` 10\n${x1.toFixed(3)}\n 20\n${y1.toFixed(3)}\n 30\n0.0\n 11\n${x2.toFixed(3)}\n 21\n${y2.toFixed(3)}\n 31\n0.0\n`;
      if (inPart1) {
        if (y1 < minPart1Y) minPart1Y = y1;
        if (y2 < minPart1Y) minPart1Y = y2;
      }
    };
    const addRect = (layer, x, y, w, h, ltype = null) => {
      addLine(layer, x, y, x + w, y, ltype);
      addLine(layer, x + w, y, x + w, y + h, ltype);
      addLine(layer, x + w, y + h, x, y + h, ltype);
      addLine(layer, x, y + h, x, y, ltype);
    };
    const addText = (layer, text, x, y, height = 90, rot = 0, align = 'left') => {
      if (!showText) return;
      const ts = options.textScale || 1.0;
      const scaledHeight = height * ts;
      dxf += `  0\nTEXT\n  8\n${layer}\n 10\n${x.toFixed(3)}\n 20\n${y.toFixed(3)}\n 30\n0.0\n 40\n${scaledHeight.toFixed(3)}\n  1\n${text}\n 50\n${rot.toFixed(2)}\n`;
      if (align === 'center') {
        dxf += ` 72\n1\n 73\n0\n 11\n${x.toFixed(3)}\n 21\n${y.toFixed(3)}\n 31\n0.0\n`;
      } else if (align === 'right') {
        dxf += ` 72\n2\n 73\n0\n 11\n${x.toFixed(3)}\n 21\n${y.toFixed(3)}\n 31\n0.0\n`;
      }
      if (inPart1) {
        if (y < minPart1Y) minPart1Y = y;
      }
    };

    // --- GLOBAL SYNCHRONIZED MAPS (MATCHING 2D FRAMING PLAN & PDF PACKAGE EXPORT) ---
    const isImpDxf = win.appUnits === 'ft-in';
    const uSuf = isImpDxf ? '' : ' mm';
    const dxfDim = mm => isImpDxf ? fis(mm) : `${Math.round(mm)} mm`;
    const panelLabelMap = new Map((panels || []).map(p => [p.w?.id || p.w, p.label]));
    const globalOpeningCodeMap = new Map();
    let globalWinCount = 1, globalDoorCount = 1;
    const rawAllWalls = model.elements ? model.elements.filter(e => e.type === 'wall') : [];
    const orderedAllInfo = orderWallsAndOpenings(rawAllWalls, model);
    for (const w of orderedAllInfo.orderedWalls) {
      const ops = openingsOf(model, w.id).slice();
      const rDir = orderedAllInfo.orderDirMap.get(w.id);
      const wVec = { x: w.b.x - w.a.x, y: w.b.y - w.a.y };
      const sameDir = !rDir || (wVec.x * rDir.x + wVec.y * rDir.y) >= -1e-6;
      ops.sort((p, q) => sameDir ? ((p.offset || 0) - (q.offset || 0)) : ((q.offset || 0) - (p.offset || 0)));
      for (const o of ops) {
        const wMm = Math.round(o.width || (o.type === 'door' ? 900 : 1200));
        const hMm = Math.round(o.height || (o.type === 'door' ? 2100 : 1200));
        const dimPair = isImpDxf && typeof win.formatDimPair === 'function' ? win.formatDimPair(wMm, hMm) : `${wMm}×${hMm} mm`;
        if (o.type === 'door') {
          globalOpeningCodeMap.set(o.id, `D${String(globalDoorCount++).padStart(2, '0')} (${dimPair})`);
        } else {
          globalOpeningCodeMap.set(o.id, `W${String(globalWinCount++).padStart(2, '0')} (${dimPair})`);
        }
      }
    }

    // --- PART 1: 2D FRAMING PLAN (MATCHING "2D framing plan" VIEW) ---
    const stories = (model.stories && model.stories.length ? model.stories : [{ id: 's0', name: 'Level 1' }])
      .filter(s => model.elements.some(e => e.type === 'wall' && e.story === s.id));

    let currentLayoutY = 0; // CAD Y-up base offset for current story
    const LAYOUT_SPACING = 22000;

    for (const story of stories) {
      const storyName = story.name || story.id;
      const storyWalls = wallsOfStory(model, story.id);
      if (!storyWalls.length) continue;

      const Y = y => currentLayoutY - y;
      const dxfAngle = (ux, uy) => {
        let deg = Math.atan2(-uy, ux) * 180 / Math.PI;
        if (deg > 90) deg -= 180;
        if (deg <= -90) deg += 180;
        return deg;
      };

      const fFn = framingFn || win.generateWallFraming;
      const pFn = win.framingMemberWorld || (typeof framingMemberWorld === 'function' ? framingMemberWorld : null) || plannerFn || defaultPlanner;
      const runFn = win.framingRun || (typeof framingRun === 'function' ? framingRun : null);
      const constrFn = win.construction || (typeof construction === 'function' ? construction : null);
      const getCornerFn = win.getWallCornerEndpoints || (typeof getWallCornerEndpoints === 'function' ? getWallCornerEndpoints : null);
      const getOsbLayoutFn = win.getWallOsbLayout || (typeof getWallOsbLayout === 'function' ? getWallOsbLayout : null);

      const wallMeta = new Map();
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const w of storyWalls) {
        const framing = (typeof fFn === 'function') ? fFn(w, model) : { members: [] };
        const run = (typeof runFn === 'function') ? runFn(w, model) : { start: 0, end: wallLength(w), len: wallLength(w) };
        const sDepth = (constrFn ? constrFn(w).studDepth : null) || w.framing?.studDepth || framing.studDepth || framing.members?.[0]?.depth || w.thickness || 140;
        const pts = pFn(w, { x0: run.start, x1: run.end, depth: sDepth });
        wallMeta.set(w.id, { framing, run, sDepth, pts });
        for (const p of (pts || [w.a, w.b])) {
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
        }
      }

      const centroid = {
        x: storyWalls.reduce((s, w) => s + (w.a.x + w.b.x) / 2, 0) / storyWalls.length,
        y: storyWalls.reduce((s, w) => s + (w.a.y + w.b.y) / 2, 0) / storyWalls.length,
      };
      const outwardNormal = (w) => {
        const len = wallLength(w) || 1;
        const u = { x: (w.b.x - w.a.x) / len, y: (w.b.y - w.a.y) / len };
        let n = { x: -u.y, y: u.x };
        const mid = { x: (w.a.x + w.b.x) / 2, y: (w.a.y + w.b.y) / 2 };
        if ((mid.x - centroid.x) * n.x + (mid.y - centroid.y) * n.y < 0) n = { x: -n.x, y: -n.y };
        return { u, n, len };
      };

      // Collision avoidance registry in model space (x, y) so no parallel labels overlap
      const placedBoxes = [];
      const addObstacle = (cx, cy, w, h, ux = 1, uy = 0) => {
        const c = Math.abs(ux), s = Math.abs(uy);
        const hw = (w * c + h * s) / 2 + 25;
        const hh = (w * s + h * c) / 2 + 25;
        placedBoxes.push({ x0: cx - hw, y0: cy - hh, x1: cx + hw, y1: cy + hh });
      };
      const hitsObstacle = (cx, cy, w, h, ux = 1, uy = 0) => {
        const c = Math.abs(ux), s = Math.abs(uy);
        const hw = (w * c + h * s) / 2 + 15;
        const hh = (w * s + h * c) / 2 + 15;
        const x0 = cx - hw, y0 = cy - hh, x1 = cx + hw, y1 = cy + hh;
        for (const b of placedBoxes) {
          if (x0 < b.x1 && x1 > b.x0 && y0 < b.y1 && y1 > b.y0) return true;
        }
        return false;
      };
      const placeParallelDxfText = (layer, text, anchorX, anchorY, ux, uy, nx, ny, height, baseOff = 0, stepOff = 120) => {
        if (!showText) return;
        const ts = options.textScale || 1.0;
        const h = height * ts;
        const w = Math.max(h * 1.5, String(text).length * h * 0.62);
        const rot = dxfAngle(ux, uy);
        const candidates = [];
        for (let ring = 0; ring <= 3; ring++) {
          const d = baseOff + ring * stepOff;
          for (const s of [0, -180, 180, -360, 360]) {
            candidates.push({ x: anchorX + nx * d + ux * s, y: anchorY + ny * d + uy * s });
          }
          if (ring > 0) {
            const dNeg = baseOff - ring * stepOff;
            for (const s of [0, -180, 180]) {
              candidates.push({ x: anchorX + nx * dNeg + ux * s, y: anchorY + ny * dNeg + uy * s });
            }
          }
        }
        let chosen = candidates[0];
        for (const c of candidates) {
          if (!hitsObstacle(c.x, c.y, w, h, ux, uy)) {
            chosen = c;
            break;
          }
        }
        addObstacle(chosen.x, chosen.y, w, h, ux, uy);
        addText(layer, text, chosen.x, Y(chosen.y), height, rot, 'center');
      };

      // Heading above the 2D framing plan
      addText('WALL_ANNOTATIONS', `2D FRAMING PLAN / WALL FRAMING LAYOUT PLAN - ${storyName.toUpperCase()} (ALL UNITS IN ${isImpDxf ? 'FT-IN' : 'MM'})`, (minX + maxX) / 2, Y(minY - 1400), 160, 0, 'center');

      // 1. Draw wall cavity lines (flush beside studs, split around openings) and 12 mm exterior OSB sheathing boards
      const showDxfOsb = options.exteriorOsbEnabled !== false && (typeof document === 'undefined' || document.getElementById('wall-osb-toggle')?.checked !== false);
      for (const w of storyWalls) {
        const meta = wallMeta.get(w.id);
        const pts = meta?.pts;
        if (!pts || pts.length < 4) continue;
        const sDepth = meta.sDepth;
        let plateIntervals = [[meta.run.start, meta.run.end]];
        for (const o of openingsOf(model, w.id)) {
          const hw = (o.width || 900) / 2;
          const oL = o.offset - hw, oR = o.offset + hw;
          const next = [];
          for (const [a, b] of plateIntervals) {
            if (oR <= a || oL >= b) next.push([a, b]);
            else {
              if (oL > a + 5) next.push([a, oL]);
              if (oR < b - 5) next.push([oR, b]);
            }
          }
          plateIntervals = next;
        }
        for (const [pA0, pB0] of plateIntervals) {
          const segPts = pFn(w, { x0: pA0, x1: pB0, depth: sDepth });
          if (!segPts || segPts.length < 4) continue;
          addLine('WALL_PLATES', segPts[0].x, Y(segPts[0].y), segPts[1].x, Y(segPts[1].y));
          addLine('WALL_PLATES', segPts[3].x, Y(segPts[3].y), segPts[2].x, Y(segPts[2].y));
          if (Math.abs(pA0 - meta.run.start) < 2) {
            addLine('WALL_PLATES', segPts[0].x, Y(segPts[0].y), segPts[3].x, Y(segPts[3].y));
          }
          if (Math.abs(pB0 - meta.run.end) < 2) {
            addLine('WALL_PLATES', segPts[1].x, Y(segPts[1].y), segPts[2].x, Y(segPts[2].y));
          }
        }

        if (showDxfOsb) {
          const ext = isExteriorWall(w);
          const side = ext ? (win.getWallSheathingSide ? win.getWallSheathingSide(w) : (w.sheathingSide || (w.sheathingFlipped ? 'interior' : 'exterior'))) : 'none';
          if (ext && side !== 'none') {
            const { u, n } = outwardNormal(w);
            const osbThicknessMm = 12;
            const isBoth = side === 'both';
            const isInterior = side === 'interior';
            const signsToRender = isBoth ? [1, -1] : [isInterior ? -1 : 1];

            const mid01 = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
            const mid32 = { x: (pts[3].x + pts[2].x) / 2, y: (pts[3].y + pts[2].y) / 2 };
            const d01 = (mid01.x - centroid.x) * n.x + (mid01.y - centroid.y) * n.y;
            const d32 = (mid32.x - centroid.x) * n.x + (mid32.y - centroid.y) * n.y;
            const baseUse01 = d01 >= d32;

            for (const curSign of signsToRender) {
              const faceType = (curSign === 1) ? 'exterior' : 'interior';
              const layName = (faceType === 'exterior') ? 'EXTERIOR_OSB' : 'WALL_SHEATHING';
              let segments = [];
              if (typeof getOsbLayoutFn === 'function') {
                segments = getOsbLayoutFn(w, model, faceType).segments || [];
              } else {
                const corners = (typeof getCornerFn === 'function') ? getCornerFn(w, model) : null;
                const isExtFace = (faceType === 'exterior');
                const startX = (isExtFace && corners && Number.isFinite(corners.osbStart)) ? corners.osbStart : ((corners && Number.isFinite(corners.cornerStart)) ? corners.cornerStart : meta.run.start);
                const endX = (isExtFace && corners && Number.isFinite(corners.osbEnd)) ? corners.osbEnd : ((corners && Number.isFinite(corners.cornerEnd)) ? corners.cornerEnd : meta.run.end);
                let intervals = [[startX, endX]];
                for (const o of openingsOf(model, w.id)) {
                  const hw = (o.width || 900) / 2;
                  const oL = o.offset - hw, oR = o.offset + hw;
                  const next = [];
                  for (const [a, b] of intervals) {
                    if (oR <= a || oL >= b) next.push([a, b]);
                    else {
                      if (oL > a + 10) next.push([a, oL]);
                      if (oR < b - 10) next.push([oR, b]);
                    }
                  }
                  intervals = next;
                }
                const studCenters = [...new Set(
                  (meta.framing?.members || [])
                    .filter(m => !['Top plate','Bottom plate','Header','Sill','Header stud','Upper cripple','Lower cripple','Block','Blocking','Beam'].includes(m.type) &&
                                 !/plate|header|sill|cripple|block|noggin|beam|lintel/i.test(m.type) &&
                                 m.role !== 'Horizontal backing' &&
                                 Number.isFinite(m.x0) && Number.isFinite(m.x1))
                    .map(m => Math.round(((m.x0 + m.x1) / 2) * 10) / 10)
                )].sort((a, b) => a - b);
                for (const [segA, segB] of intervals) {
                  if (segB - segA < 20) continue;
                  const joints = [];
                  const segStuds = studCenters.filter(sc => sc > segA + 100 && sc < segB - 100);
                  let cur = segA;
                  while (segB - cur > 1220 + 20) {
                    const reachable = segStuds.filter(sc => sc > cur + 100 && sc <= cur + 1220 + 20);
                    const nextJoint = reachable.length ? reachable[reachable.length - 1] : segStuds.find(sc => sc > cur + 100);
                    if (!Number.isFinite(nextJoint) || nextJoint <= cur + 40 || nextJoint >= segB - 100) break;
                    joints.push(nextJoint);
                    cur = nextJoint;
                  }
                  segments.push({ segA, segB, joints });
                }
              }

              const use01 = (curSign === 1) ? baseUse01 : !baseUse01;
              const fnx = n.x * curSign, fny = n.y * curSign;

              for (const { segA, segB, joints } of segments) {
                if (segB - segA < 20) continue;
                const segPts = pFn(w, { x0: segA, x1: segB, depth: sDepth });
                if (!segPts || segPts.length < 4) continue;
                const inA = use01 ? segPts[0] : segPts[3];
                const inB = use01 ? segPts[1] : segPts[2];
                const outA = { x: inA.x + fnx * osbThicknessMm, y: inA.y + fny * osbThicknessMm };
                const outB = { x: inB.x + fnx * osbThicknessMm, y: inB.y + fny * osbThicknessMm };
                addLine(layName, inA.x, Y(inA.y), inB.x, Y(inB.y));
                addLine(layName, inB.x, Y(inB.y), outB.x, Y(outB.y));
                addLine(layName, outB.x, Y(outB.y), outA.x, Y(outA.y));
                addLine(layName, outA.x, Y(outA.y), inA.x, Y(inA.y));
                for (const sx of joints) {
                  const jtPts = pFn(w, { x0: sx, x1: sx + 1, depth: sDepth });
                  const jIn = (jtPts && jtPts.length >= 4) ? (use01 ? jtPts[0] : jtPts[3]) : { x: inA.x + u.x * (sx - segA), y: inA.y + u.y * (sx - segA) };
                  const jOut = { x: jIn.x + fnx * osbThicknessMm, y: jIn.y + fny * osbThicknessMm };
                  addLine(layName, jIn.x, Y(jIn.y), jOut.x, Y(jOut.y));
                }
              }
            }
          }
        }
      }

      // 2. Draw vertical studs with diagonal X cross-marks
      for (const w of storyWalls) {
        const meta = wallMeta.get(w.id);
        if (!meta || !meta.framing || !meta.framing.members) continue;
        const drawnRanges = [];
        for (const m of meta.framing.members) {
          if (['Top plate', 'Bottom plate', 'Header', 'Sill', 'Cripple'].includes(m.type) || /plate|header|sill|cripple|lintel/i.test(m.type)) continue;
          const isHorizBlock = /^Block$|^Blocking$/i.test(m.type) || /noggin/i.test(m.type) || m.role === 'Horizontal backing';
          if (isHorizBlock && !showBlocking) continue;
          const isEndPost = m.type === 'Corner stud' || m.type === 'Junction stud';
          if (!isHorizBlock && !isEndPost && drawnRanges.some(r => Math.abs(r.x0 - m.x0) < 5 && Math.abs(r.x1 - m.x1) < 5)) continue;
          if (!isHorizBlock) drawnRanges.push({ x0: m.x0, x1: m.x1 });

          const ps = pFn(w, m);
          if (!ps || ps.length < 4) continue;
          const isVert = !isHorizBlock;
          const memberLay = m.collision ? 'COLLIDING_STUDS' : (isVert ? 'WALL_STUDS' : 'WALL_PLATES');
          for (let i = 0; i < 4; i++) {
            const pA = ps[i], pB = ps[(i + 1) % 4];
            addLine(memberLay, pA.x, Y(pA.y), pB.x, Y(pB.y));
          }
          if (isVert) {
            addLine(memberLay, ps[0].x, Y(ps[0].y), ps[2].x, Y(ps[2].y));
            addLine(memberLay, ps[1].x, Y(ps[1].y), ps[3].x, Y(ps[3].y));
          }
        }
      }

      // 3. Draw openings (jamb lines + hidden dashed rough opening lines + optional sash + hidden dashed studs inside openings)
      const getHiddenStudsFn = win.getOpeningHiddenStuds || (typeof getOpeningHiddenStuds === 'function' ? getOpeningHiddenStuds : null);
      for (const w of storyWalls) {
        const meta = wallMeta.get(w.id);
        const sDepth = meta ? meta.sDepth : (w.thickness || 140);
        const rawMembers = meta?.framing?.members || [];
        for (const o of openingsOf(model, w.id)) {
          const hw = o.width / 2;
          const pts = pFn(w, { x0: o.offset - hw, x1: o.offset + hw, depth: sDepth });
          if (!pts || pts.length < 4) continue;
          // Solid jamb lines across wall thickness
          addLine('WALL_OPENINGS', pts[0].x, Y(pts[0].y), pts[3].x, Y(pts[3].y));
          addLine('WALL_OPENINGS', pts[1].x, Y(pts[1].y), pts[2].x, Y(pts[2].y));
          // Hidden dashed lines along opening faces
          addLine('WALL_OPENINGS_HIDDEN', pts[0].x, Y(pts[0].y), pts[1].x, Y(pts[1].y), 'DASHED');
          addLine('WALL_OPENINGS_HIDDEN', pts[3].x, Y(pts[3].y), pts[2].x, Y(pts[2].y), 'DASHED');

          // Cripple / header studs inside windows and doors rendered with continuous lines
          let hiddenPolys = [];
          if (typeof getHiddenStudsFn === 'function') {
            hiddenPolys = getHiddenStudsFn(w, o, model, rawMembers).map(hs => hs.poly);
          } else {
            const oL = o.offset - hw, oR = o.offset + hw;
            const seenX = new Set();
            for (const m of rawMembers) {
              if (!['Header stud', 'Upper cripple', 'Lower cripple'].includes(m.type) && !/cripple|header stud/i.test(m.type)) continue;
              if (m.x1 <= oL + 1 || m.x0 >= oR - 1) continue;
              const k = Math.round(m.x0 / 5) * 5;
              if (seenX.has(k)) continue;
              seenX.add(k);
              const ps = pFn(w, { x0: Math.max(oL, m.x0), x1: Math.min(oR, m.x1), depth: sDepth });
              if (ps && ps.length >= 4) hiddenPolys.push(ps);
            }
          }
          for (const ps of hiddenPolys) {
            if (!ps || ps.length < 4) continue;
            for (let i = 0; i < 4; i++) {
              const pA = ps[i], pB = ps[(i + 1) % 4];
              addLine('WALL_STUDS', pA.x, Y(pA.y), pB.x, Y(pB.y));
            }
            addLine('WALL_STUDS', ps[0].x, Y(ps[0].y), ps[2].x, Y(ps[2].y));
            addLine('WALL_STUDS', ps[1].x, Y(ps[1].y), ps[3].x, Y(ps[3].y));
          }

          if (showOpeningsSash) {
            const m0 = { x: (pts[0].x + pts[3].x) / 2, y: (pts[0].y + pts[3].y) / 2 };
            const m1 = { x: (pts[1].x + pts[2].x) / 2, y: (pts[1].y + pts[2].y) / 2 };
            if (o.type === 'window') {
              const g0a = { x: pts[0].x * 0.6 + pts[3].x * 0.4, y: pts[0].y * 0.6 + pts[3].y * 0.4 };
              const g1a = { x: pts[1].x * 0.6 + pts[2].x * 0.4, y: pts[1].y * 0.6 + pts[2].y * 0.4 };
              const g0b = { x: pts[0].x * 0.4 + pts[3].x * 0.6, y: pts[0].y * 0.4 + pts[3].y * 0.6 };
              const g1b = { x: pts[1].x * 0.4 + pts[2].x * 0.6, y: pts[1].y * 0.4 + pts[2].y * 0.6 };
              addLine('WALL_OPENINGS', g0a.x, Y(g0a.y), g1a.x, Y(g1a.y));
              addLine('WALL_OPENINGS', g0b.x, Y(g0b.y), g1b.x, Y(g1b.y));
            } else {
              const dx = m1.x - m0.x, dy = m1.y - m0.y;
              const openPt = { x: m0.x - dy, y: m0.y + dx };
              addLine('WALL_OPENINGS', m0.x, Y(m0.y), openPt.x, Y(openPt.y));
              const steps = 10;
              for (let s = 0; s < steps; s++) {
                const t1 = (s / steps) * (Math.PI / 2), t2 = ((s + 1) / steps) * (Math.PI / 2);
                const a1 = { x: m0.x + dx * Math.cos(t1) - dy * Math.sin(t1), y: m0.y + dy * Math.cos(t1) + dx * Math.sin(t1) };
                const a2 = { x: m0.x + dx * Math.cos(t2) - dy * Math.sin(t2), y: m0.y + dy * Math.cos(t2) + dx * Math.sin(t2) };
                addLine('WALL_OPENINGS_HIDDEN', a1.x, Y(a1.y), a2.x, Y(a2.y), 'DASHED');
              }
            }
          }
        }
      }

      // Register wall footprints in obstacle map after drawing geometry so labels avoid walls
      for (const w of storyWalls) {
        const meta = wallMeta.get(w.id);
        const pts = meta?.pts;
        if (!pts || pts.length < 4) continue;
        let wx0 = Infinity, wy0 = Infinity, wx1 = -Infinity, wy1 = -Infinity;
        for (const p of pts) {
          wx0 = Math.min(wx0, p.x); wy0 = Math.min(wy0, p.y);
          wx1 = Math.max(wx1, p.x); wy1 = Math.max(wy1, p.y);
        }
        placedBoxes.push({ x0: wx0 - 15, y0: wy0 - 15, x1: wx1 + 15, y1: wy1 + 15 });
      }

      // 4. Exterior & Interior Wall Dimensions in mm (matching "2D framing plan")
      const drawDxfDimension = (pA, pB, originA, originB, ux, uy, nx, ny, labelText) => {
        addLine('DIMENSIONS', originA.x + nx * 25, Y(originA.y + ny * 25), pA.x + nx * 70, Y(pA.y + ny * 70));
        addLine('DIMENSIONS', originB.x + nx * 25, Y(originB.y + ny * 25), pB.x + nx * 70, Y(pB.y + ny * 70));
        addLine('DIMENSIONS', pA.x, Y(pA.y), pB.x, Y(pB.y));
        const tick = 55;
        const tx = (ux + nx) * tick * 0.707;
        const ty = (uy + ny) * tick * 0.707;
        addLine('DIMENSIONS', pA.x - tx, Y(pA.y - ty), pA.x + tx, Y(pA.y + ty));
        addLine('DIMENSIONS', pB.x - tx, Y(pB.y - ty), pB.x + tx, Y(pB.y + ty));
        const midX = (pA.x + pB.x) / 2, midY = (pA.y + pB.y) / 2;
        const rot = dxfAngle(ux, uy);
        const textX = midX + nx * 35;
        const textY = midY + ny * 35;
        addText('DIMENSIONS', labelText, textX, Y(textY), 85, rot, 'center');
      };

      const dimOffset = 650;
      for (const w of storyWalls) {
        const { u, n } = outwardNormal(w);
        const meta = wallMeta.get(w.id);
        const run = meta ? meta.run : { start: 0, end: wallLength(w), len: wallLength(w) };
        const sDepth = meta ? meta.sDepth : (w.thickness || 140);

        if (isExteriorWall(w)) {
          const corners = (typeof getCornerFn === 'function') ? getCornerFn(w, model) : { a: w.a, b: w.b, len: wallLength(w) };
          const dimVal = Math.round(corners.len);
          if (dimVal <= 0) continue;
          const pA = { x: corners.a.x + n.x * dimOffset, y: corners.a.y + n.y * dimOffset };
          const pB = { x: corners.b.x + n.x * dimOffset, y: corners.b.y + n.y * dimOffset };
          drawDxfDimension(pA, pB, corners.a, corners.b, u.x, u.y, n.x, n.y, dxfDim(dimVal));
        } else {
          const intLen = Math.round(Math.max(0, run.end - run.start));
          if (intLen < 200) continue;
          const cA = { x: w.a.x + u.x * run.start, y: w.a.y + u.y * run.start };
          const cB = { x: w.a.x + u.x * run.end, y: w.a.y + u.y * run.end };
          const intDimOff = sDepth / 2 + 280;
          const pA = { x: cA.x + n.x * intDimOff, y: cA.y + n.y * intDimOff };
          const pB = { x: cB.x + n.x * intDimOff, y: cB.y + n.y * intDimOff };
          drawDxfDimension(pA, pB, cA, cB, u.x, u.y, n.x, n.y, dxfDim(intLen));
        }
      }

      // User-placed dimensions from model.elements
      const userDims = model.elements.filter(e => e.type === 'dimension' && (!e.story || e.story === story.id));
      for (const ud of userDims) {
        const d = (typeof win.resolveDimension === 'function') ? win.resolveDimension(ud) : ((typeof resolveDimension === 'function') ? resolveDimension(ud) : ud);
        if (!d.a || !d.b) continue;
        const off = ud.offset ?? 600;
        const udx = d.b.x - d.a.x, udy = d.b.y - d.a.y, ulen = Math.hypot(udx, udy) || 1;
        const ux = udx / ulen, uy = udy / ulen;
        const sign = off >= 0 ? 1 : -1;
        const nx = (-uy) * sign, ny = ux * sign;
        const pA = { x: d.a.x - uy * off, y: d.a.y + ux * off };
        const pB = { x: d.b.x - uy * off, y: d.b.y + ux * off };
        const distMm = Math.round(ulen);
        const custom = ud.customText ? String(ud.customText).trim() : '';
        const txt = custom || `${ud.prefix || ''}${dxfDim(distMm)}${ud.suffix || ''}`;
        drawDxfDimension(pA, pB, d.a, d.b, ux, uy, nx, ny, txt);
      }

      // 5. Parallel, non-overlapping Wall ID Tags & Opening Tags
      const dxfOrderedInfo = orderWallsAndOpenings(storyWalls, model);
      const dxfWallCodeMap = dxfOrderedInfo.map;

      for (const w of dxfOrderedInfo.orderedWalls) {
        const { u, n } = outwardNormal(w);
        const meta = wallMeta.get(w.id);
        const run = meta ? meta.run : { start: 0, end: wallLength(w) };
        const sDepth = meta ? meta.sDepth : (w.thickness || 140);
        const ext = isExteriorWall(w);
        const wallTag = panelLabelMap.get(w.id) || dxfWallCodeMap.get(w.id) || w.tag || `${ext ? 'E' : 'I'}${w.id.replace(/^[A-Za-z]+-?/, '')}`;
        const midDist = (run.start + run.end) / 2;
        const wMidX = w.a.x + u.x * midDist;
        const wMidY = w.a.y + u.y * midDist;
        const wallLabelOff = ext ? -(sDepth / 2 + 210) : -(sDepth / 2 + 190);
        placeParallelDxfText('WALL_ANNOTATIONS', wallTag, wMidX, wMidY, u.x, u.y, n.x, n.y, 90, wallLabelOff, 170);

        for (const o of openingsOf(model, w.id)) {
          const ox = w.a.x + u.x * o.offset;
          const oy = w.a.y + u.y * o.offset;
          const wMm = Math.round(o.width || 900);
          const hMm = Math.round(o.height || 2100);
          const dimPair = isImpDxf && typeof win.formatDimPair === 'function' ? win.formatDimPair(wMm, hMm) : `${wMm}x${hMm} mm`;
          const opLabel = globalOpeningCodeMap.get(o.id) || `${o.type === 'door' ? 'D' : 'W'} (${dimPair})`;
          const opOff = ext ? (sDepth / 2 + 240) : (sDepth / 2 + 220);
          placeParallelDxfText('WALL_OPENINGS', opLabel, ox, oy, u.x, u.y, n.x, n.y, 75, opOff, 165);
        }
      }

      // 6. Room / Zone labels
      const zones = model.elements.filter(e => e.type === 'zone' && (!e.story || e.story === story.id) && e.points?.length);
      if (zones.length) {
        for (const z of zones) {
          const cx = z.points.reduce((s, p) => s + p.x, 0) / z.points.length;
          const cy = z.points.reduce((s, p) => s + p.y, 0) / z.points.length;
          placeParallelDxfText('ROOM_LABELS', (z.name || 'ROOM').toUpperCase(), cx, cy, 1, 0, 0, 1, 120, 0, 220);
        }
      } else {
        const rooms = detectRooms(storyWalls, new Map(storyWalls.map(w => [w.id, openingsOf(model, w.id)])));
        for (const r of rooms) {
          placeParallelDxfText('ROOM_LABELS', r.id, r.cx, r.cy, 1, 0, 0, 1, 110, 0, 220);
        }
      }

      currentLayoutY += LAYOUT_SPACING;
    }

    inPart1 = false;

    // --- PART 2: INDIVIDUAL PANEL ELEVATIONS, SECTIONS, WALL PLANS & SCHEDULES ---
    if (!options.onlyPlan) {
      const PANELS_PER_ROW = 3;
      const GRID_GAP_X = 2800;
      const GRID_GAP_Y = 5800;

      const startPanelsY = Number.isFinite(minPart1Y) && minPart1Y < 0 ? (minPart1Y - 6000) : -25000;
      let col = 0, row = 0;
      let currX = 0, currY = startPanelsY;

      for (let idx = 0; idx < panels.length; idx++) {
        const p = panels[idx];
        const { w, label, storyName, L, H, members, openings, rows, sheets, volumeM3, exteriorWall, osbEnabled, panelWeightKg } = p;
        const osbSide = exteriorWall ? (win.getWallSheathingSide ? win.getWallSheathingSide(w) : (w?.sheathingSide || (w?.sheathingFlipped ? 'interior' : 'exterior'))) : 'none';
        const osbApplied = Boolean(osbEnabled && exteriorWall && osbSide !== 'none');

        const constrFn = win.construction || (typeof construction === 'function' ? construction : null);
        const refMemberDepth = (members || []).find(m => /common stud|king stud|top plate|bottom plate|corner stud/i.test(m.type) && Number.isFinite(m.depth) && m.depth > 50)?.depth;
        const studDepth = Math.max(50, Number((constrFn ? constrFn(w)?.studDepth : null) || w.framing?.studDepth || refMemberDepth || w.thickness || (exteriorWall ? 140 : 89)));
        const planThk = Math.round(studDepth);

        if (idx > 0 && idx % PANELS_PER_ROW === 0) {
          col = 0;
          row++;
          currX = 0;
          currY = startPanelsY - row * GRID_GAP_Y;
        } else if (idx > 0) {
          const prevP = panels[idx - 1];
          currX += (Math.max(prevP.L, 2400) + GRID_GAP_X);
        }

        const bx = currX;
        const by = currY;

        const { minX: dxfStudMinX, maxX: dxfStudMaxX, span: dxfStudSpan } = studFramingBounds(members, L);
        const dxfVtPlates = (members || [])
          .filter(m => isVeryTopPlate(m, H) && Number.isFinite(m.x0) && Number.isFinite(m.x1) && Math.abs(m.x1 - m.x0) >= 1)
          .map(m => ({ ...m, x0: Math.min(m.x0, m.x1), x1: Math.max(m.x0, m.x1) }))
          .sort((a, b) => a.x0 - b.x0);
        const dxfVtMinX = dxfVtPlates.length ? Math.min(...dxfVtPlates.map(m => m.x0)) : dxfStudMinX;
        const dxfVtMaxX = dxfVtPlates.length ? Math.max(...dxfVtPlates.map(m => m.x1)) : dxfStudMaxX;

        // 1. STUDS & MEMBERS (no outer sheathing border rect; bottom/lower plates clipped to stud bounds, Very Top Plate unclipped)
        for (const m of members) {
          const isVT = isVeryTopPlate(m, H);
          const isPlate = /plate/i.test(m.type) && !isVT;
          const rawX0 = isPlate ? Math.max(dxfStudMinX, Math.min(m.x0, m.x1)) : Math.min(m.x0, m.x1);
          const rawX1 = isPlate ? Math.min(dxfStudMaxX, Math.max(m.x0, m.x1)) : Math.max(m.x0, m.x1);
          if (rawX1 - rawX0 < 1) continue;
          const mx0 = bx + rawX0, mx1 = bx + rawX1;
          const my0 = by + m.z0, my1 = by + m.z1;
          const mw = Math.max(1, mx1 - mx0), mh = Math.max(1, my1 - my0);
          const isVert = !/plate|header|sill|lintel/i.test(m.type) && mh > mw;
          const lay = /header|lintel/i.test(m.type) ? 'WALL_LINTELS' : (/plate/i.test(m.type) ? 'WALL_PLATES' : 'WALL_STUDS');
          addRect(lay, mx0, my0, mw, mh);
          if (isVert) {
            addLine(lay, mx0, my0, mx0 + mw, my0 + mh);
            addLine(lay, mx0, my0 + mh, mx0 + mw, my0);
          }
        }

        // 1b. VERY TOP PLATE DIMENSIONS ABOVE ELEVATION IN DXF
        if (dxfVtPlates.length > 0) {
          const vtDimY = by + H + 110;
          const dxfVtSegs = [];
          if (dxfVtPlates[0].x0 > dxfStudMinX + 5) {
            dxfVtSegs.push({ x0: dxfStudMinX, x1: dxfVtPlates[0].x0, kind: 'step' });
          }
          for (let i = 0; i < dxfVtPlates.length; i++) {
            const seg = dxfVtPlates[i];
            dxfVtSegs.push({ x0: seg.x0, x1: seg.x1, kind: 'plate' });
            if (i + 1 < dxfVtPlates.length && dxfVtPlates[i + 1].x0 - seg.x1 >= 5) {
              dxfVtSegs.push({ x0: seg.x1, x1: dxfVtPlates[i + 1].x0, kind: 'gap' });
            }
          }
          const lastDxfVt = dxfVtPlates[dxfVtPlates.length - 1];
          if (lastDxfVt.x1 < dxfStudMaxX - 5) {
            dxfVtSegs.push({ x0: lastDxfVt.x1, x1: dxfStudMaxX, kind: 'step' });
          }
          addLine('DIMENSIONS', bx + dxfVtSegs[0].x0, vtDimY, bx + dxfVtSegs[dxfVtSegs.length - 1].x1, vtDimY);
          const dxfTickXs = [dxfVtSegs[0].x0, ...dxfVtSegs.map(cs => cs.x1)];
          for (const tx of dxfTickXs) {
            const sx = bx + tx;
            addLine('DIMENSIONS', sx, by + H + 15, sx, vtDimY + 35);
            addLine('DIMENSIONS', sx - 20, vtDimY - 20, sx + 20, vtDimY + 20);
          }
          for (const cs of dxfVtSegs) {
            const segLen = Math.round(cs.x1 - cs.x0);
            if (segLen >= 5) {
              addText('DIMENSIONS', dxfDim(segLen), bx + (cs.x0 + cs.x1) / 2, vtDimY + 25, cs.kind === 'gap' ? 18 : 22, 0, 'center');
            }
          }
        }

        // 2. LEFT-SIDE VERTICAL DIMENSION CHAINS (Blocking, Openings, and Overall Height)
        const dxfBlocks = members.filter(m => /block/i.test(m.type));
        const dxfOpenLevels = [0, H, ...openings.flatMap(o => [o.sill || 0, (o.sill || 0) + o.height])];
        const dxfBlockLevels = [0, H, ...dxfBlocks.map(m => m.z0)];
        const addVertChainDxf = (chainX, levels) => {
          const zs = [...new Set(levels.map(v => Math.round(v)))].sort((a, b) => a - b);
          addLine('DIMENSIONS', chainX, by, chainX, by + H);
          for (let i = 0; i < zs.length; i++) {
            const zy = by + zs[i];
            addLine('DIMENSIONS', chainX - 20, zy, chainX + 20, zy);
            if (i + 1 < zs.length && zs[i + 1] - zs[i] >= 20) {
              const midY = by + (zs[i] + zs[i + 1]) / 2;
              addText('DIMENSIONS', fis(zs[i + 1] - zs[i]), chainX - 28, midY, 20, 90, 'center');
            }
          }
        };
        const leftRefX = bx + Math.min(dxfStudMinX, dxfVtMinX);
        const blkChainX = leftRefX - 110;
        const opnChainX = blkChainX - 140;
        const ovrChainX = opnChainX - 140;
        addVertChainDxf(blkChainX, dxfBlockLevels);
        addVertChainDxf(opnChainX, dxfOpenLevels);
        addLine('DIMENSIONS', ovrChainX, by, ovrChainX, by + H);
        addLine('DIMENSIONS', ovrChainX - 24, by, ovrChainX + 24, by);
        addLine('DIMENSIONS', ovrChainX - 24, by + H, ovrChainX + 24, by + H);
        addText('DIMENSIONS', `${fis(H)}${uSuf} OVERALL HEIGHT`, ovrChainX - 36, by + H / 2, 22, 90, 'center');

        // 2b. BOTTOM ELEVATION DIMENSIONS (Stud ticks, Opening bay spans, and Overall O/A Framing)
        const elevSStuds = studPositions(members);
        for (const x of elevSStuds) {
          const sx = bx + Math.max(0, Math.min(L, x));
          const relX = Math.max(0, Math.round(x - dxfStudMinX));
          addLine('DIMENSIONS', sx, by, sx, by - 55);
          addText('DIMENSIONS', isImpDxf ? fis(relX) : `${relX}`, sx, by - 75, 16, 90, 'right');
        }
        const elevBrk = [...new Set([
          Math.round(dxfStudMinX),
          ...openings.flatMap(o => [Math.round(o.offset - o.width / 2), Math.round(o.offset + o.width / 2)]),
          Math.round(dxfStudMaxX)
        ])].filter(v => v >= Math.round(dxfStudMinX) && v <= Math.round(dxfStudMaxX)).sort((a, b) => a - b);
        const elevOpenDimY = by - 220;
        addLine('DIMENSIONS', bx + dxfStudMinX, elevOpenDimY, bx + dxfStudMaxX, elevOpenDimY);
        for (let i = 0; i + 1 < elevBrk.length; i++) {
          if (elevBrk[i + 1] - elevBrk[i] < 20) continue;
          const x1 = bx + elevBrk[i], x2 = bx + elevBrk[i + 1];
          addLine('DIMENSIONS', x1, elevOpenDimY - 20, x1, elevOpenDimY + 20);
          addText('DIMENSIONS', fis(elevBrk[i + 1] - elevBrk[i]), (x1 + x2) / 2, elevOpenDimY - 36, 18, 0, 'center');
        }
        addLine('DIMENSIONS', bx + dxfStudMaxX, elevOpenDimY - 20, bx + dxfStudMaxX, elevOpenDimY + 20);

        const elevOaDimY = by - 310;
        addLine('DIMENSIONS', bx + dxfStudMinX, elevOaDimY, bx + dxfStudMaxX, elevOaDimY);
        addLine('DIMENSIONS', bx + dxfStudMinX, elevOaDimY - 24, bx + dxfStudMinX, elevOaDimY + 24);
        addLine('DIMENSIONS', bx + dxfStudMaxX, elevOaDimY - 24, bx + dxfStudMaxX, elevOaDimY + 24);
        addText('DIMENSIONS', `${fis(dxfStudSpan)}${uSuf} OVERALL O/A FRAMING`, bx + (dxfStudMinX + dxfStudMaxX) / 2, elevOaDimY - 42, 20, 0, 'center');

        // 3. OPENINGS
        for (const o of openings) {
          const ox = bx + o.offset - o.width / 2;
          const oy = by + (o.sill || 0);
          addRect('WALL_OPENINGS', ox, oy, o.width, o.height);
          addLine('WALL_OPENINGS', ox, oy, ox + o.width, oy + o.height);
          addLine('WALL_OPENINGS', ox, oy + o.height, ox + o.width, oy);
          const opDimPair = isImpDxf && typeof win.formatDimPair === 'function' ? win.formatDimPair(o.width, o.height) : `${Math.round(o.width)}x${Math.round(o.height)} mm`;
          const opLabelCode = o.code || globalOpeningCodeMap.get(o.id) || o.id;
          addText('WALL_ANNOTATIONS', `${opLabelCode} · ${o.type.toUpperCase()} · ${opDimPair}`, ox + o.width / 2, oy + o.height / 2 + 25, 22, 0, 'center');
          addText('WALL_ANNOTATIONS', `sill ${fis(o.sill || 0)}  head ${fis((o.sill || 0) + o.height)}  (3/44x220 C24 Lintel)`, ox + o.width / 2, oy + o.height / 2 - 20, 18, 0, 'center');
        }

        // 3b. MEMBER MARKS (A, B, C, ..., O) ON ELEVATION MEMBERS WITHOUT OVERLAPPING
        const dxfScale = Math.min(312 / Math.max(L, 1), 212 / Math.max(H, 1));
        const dxfMarks = computePanelMemberMarks(members, rows, L, H, openings, x => x * dxfScale, z => (H - z) * dxfScale, dxfScale, 0.85);
        for (const pm of dxfMarks) {
          addText('WALL_ANNOTATIONS', pm.letter, bx + pm.modelX, by + pm.modelZ - 12, 22, 0, 'center');
        }

        // 4. OSB SHEATHING LAYOUT (EXTERIOR, STUD-CENTERED & BLOCKING-CENTERED HIDDEN LINES)
        if (osbApplied) {
          const { xBreaks, zBreaks } = computeSheathingBreaks(L, H, members);
          for (let i = 0; i + 1 < xBreaks.length; i++) {
            const sx = xBreaks[i], sw = xBreaks[i + 1] - sx;
            if (sw < 1) continue;
            for (let j = 0; j + 1 < zBreaks.length; j++) {
              const sz = zBreaks[j], sh = zBreaks[j + 1] - sz;
              if (sh < 1) continue;
              addRect('WALL_SHEATHING', bx + sx, by + sz, sw, sh, 'DASHED');
              addLine('WALL_SHEATHING', bx + sx, by + sz, bx + sx + sw, by + sz + sh, 'DASHED');
            }
          }
          for (let j = 1; j + 1 < zBreaks.length; j++) {
            const bz = zBreaks[j];
            addLine('WALL_SHEATHING', bx, by + bz, bx + L, by + bz, 'DASHED');
            addText('WALL_SHEATHING', `OSB HORIZONTAL JOINT @ ${fis(bz)}${uSuf} (HIDDEN LINE)`, bx + L - 20, by + bz + 18, 18, 0, 'right');
          }
        }

        // Squaring diagonal check line & parallel text (no background box)
        addLine('WALL_ANNOTATIONS', bx + dxfStudMinX, by, bx + dxfStudMaxX, by + H, 'DASHED');
        const dxfDiagAng = Math.atan2(H, dxfStudSpan) * 180 / Math.PI;
        const dxfDiagMm = Math.round(Math.hypot(dxfStudSpan, H));
        addText('WALL_ANNOTATIONS', `SQUARING: ${fis(dxfDiagMm)}${uSuf}`, bx + (dxfStudMinX + dxfStudMaxX) / 2, by + H / 2 + 25, 22, dxfDiagAng, 'center');

        // 5. SIDE VERTICAL SECTION VIEW (1:1 scaled on right side of elevation, matching PDF & Wall Panel view)
        const secX = bx + Math.max(L, dxfStudMaxX, dxfVtMaxX) + 260;
        const secW = planThk;
        const secX1 = secX + secW;
        addText('WALL_ANNOTATIONS', 'WALL SECTION', secX, by + H + 75, 22, 0, 'left');
        addText('WALL_ANNOTATIONS', 'Int', secX, by + H + 25, 18, 0, 'center');
        addText('WALL_ANNOTATIONS', 'Ext', secX1, by + H + 25, 18, 0, 'center');

        addRect('WALL_SECTION', secX, by, secW, H);
        addLine('WALL_SECTION', secX + secW / 2, by, secX + secW / 2, by + H, 'DASHED');

        // Clear window/door rough openings vertically in the section
        const secOpenRanges = [];
        for (const o of openings) {
          const zSill = Math.max(0, o.sill || 0);
          const zHead = Math.min(H, zSill + (o.height || 1200));
          if (zHead <= zSill + 10) continue;
          secOpenRanges.push([zSill, zHead]);
          addLine('WALL_OPENINGS_HIDDEN', secX, by + zSill, secX, by + zHead, 'DASHED');
          addLine('WALL_OPENINGS_HIDDEN', secX1, by + zSill, secX1, by + zHead, 'DASHED');
          addLine('WALL_SECTION', secX, by + zSill, secX1, by + zSill);
          addLine('WALL_SECTION', secX, by + zHead, secX1, by + zHead);
        }

        // Cut horizontal members (Soleplate, Top plates, Sills, Horizontal Blocking, and 3-ply Headers) with diagonal X cross-marks
        const seenDxfRanges = new Set();
        for (const m of members) {
          const hz0 = Math.min(m.z0, m.z1), hz1 = Math.max(m.z0, m.z1);
          const hHeight = hz1 - hz0;
          if (!Number.isFinite(hz0) || !Number.isFinite(hz1) || hHeight < 10) continue;
          const isHeader = m.type === 'Header' || (/header|lintel/i.test(m.type) && !/stud/i.test(m.type));
          const isPlate = m.type === 'Bottom plate' || m.type === 'Top plate' || /plate/i.test(m.type);
          const isSill = m.type === 'Sill' || /sill/i.test(m.type);
          const isBlock = m.type === 'Block' || /block|noggin/i.test(m.type) || m.role === 'Horizontal backing';
          if (!isHeader && !isPlate && !isSill && !isBlock) continue;

          const k = `${isHeader ? 'H' : isPlate ? 'P' : isSill ? 'S' : 'B'}:${Math.round(hz0 / 4) * 4}:${Math.round(hz1 / 4) * 4}`;
          if (seenDxfRanges.has(k)) continue;
          seenDxfRanges.add(k);

          if (isHeader) {
            const plyW = secW / 3;
            for (let pIdx = 0; pIdx < 3; pIdx++) {
              const px0 = secX + pIdx * plyW;
              addRect('WALL_SECTION', px0, by + hz0, plyW, hHeight);
              addLine('WALL_SECTION', px0, by + hz0, px0 + plyW, by + hz1);
              addLine('WALL_SECTION', px0, by + hz1, px0 + plyW, by + hz0);
            }
          } else {
            addRect('WALL_SECTION', secX, by + hz0, secW, hHeight);
            addLine('WALL_SECTION', secX, by + hz0, secX1, by + hz1);
            addLine('WALL_SECTION', secX, by + hz1, secX1, by + hz0);
          }
        }

        // 12 mm OSB sheathing along vertical section face (exterior walls only)
        const stripOsbSide = win.getWallSheathingSide ? win.getWallSheathingSide(w) : (w?.sheathingSide || (w?.sheathingFlipped ? 'interior' : 'exterior'));
        const isExtOsb = (stripOsbSide === 'exterior' || stripOsbSide === 'both' || (stripOsbSide !== 'interior' && !w?.sheathingFlipped));
        const extSecOsbPad = (osbApplied && isExtOsb) ? 12 : 0;
        if (osbApplied) {
          const secFaces = stripOsbSide === 'both' ? ['exterior', 'interior'] : [stripOsbSide === 'interior' ? 'interior' : 'exterior'];
          const { zBreaks: secZBreaks } = computeSheathingBreaks(L, H, members);
          let zIntervals = [[0, H]];
          for (const [zSill, zHead] of secOpenRanges) {
            const next = [];
            for (const [a, b] of zIntervals) {
              if (zHead <= a || zSill >= b) next.push([a, b]);
              else {
                if (zSill > a + 10) next.push([a, zSill]);
                if (zHead < b - 10) next.push([zHead, b]);
              }
            }
            zIntervals = next;
          }
          for (const face of secFaces) {
            const xFace = (face === 'interior') ? (secX - 12) : secX1;
            const layName = (face === 'exterior') ? 'EXTERIOR_OSB' : 'WALL_SHEATHING';
            for (const [zA, zB] of zIntervals) {
              if (zB - zA < 20) continue;
              addRect(layName, xFace, by + zA, 12, zB - zA);
              for (let j = 1; j + 1 < secZBreaks.length; j++) {
                const bz = secZBreaks[j];
                if (bz > zA + 20 && bz < zB - 20) {
                  addLine(layName, xFace, by + bz, xFace + 12, by + bz);
                }
              }
            }
          }
        }

        // Cumulative height level ticks & right-hand section dimension chain
        const zcSec = [...new Set([0, 38, Math.round(H - 76), Math.round(H - 38), Math.round(H), ...dxfOpenLevels, ...dxfBlockLevels].map(v => Math.round(v)))]
          .filter(v => v >= 0 && v <= H).sort((a, b) => a - b);
        const secTickBaseX = secX1 + extSecOsbPad;
        let lastSecLabelY = -Infinity;
        for (const zVal of zcSec) {
          const zy = by + zVal;
          const lblY = Math.max(zy, lastSecLabelY + 42);
          lastSecLabelY = lblY;
          addLine('DIMENSIONS', secTickBaseX, zy, secTickBaseX + 25, zy);
          if (Math.abs(lblY - zy) > 2) {
            addLine('DIMENSIONS', secTickBaseX + 25, zy, secTickBaseX + 55, lblY);
            addLine('DIMENSIONS', secTickBaseX + 55, lblY, secTickBaseX + 75, lblY);
          } else {
            addLine('DIMENSIONS', secTickBaseX + 25, zy, secTickBaseX + 75, zy);
          }
          addText('DIMENSIONS', `${zVal}`, secTickBaseX + 85, lblY - 6, 16, 0, 'left');
        }
        // Section bottom thickness dimension
        const secBotDimY = by - 95;
        addLine('DIMENSIONS', secX, secBotDimY, secX1 + extSecOsbPad, secBotDimY);
        addLine('DIMENSIONS', secX, by - 10, secX, secBotDimY - 20);
        addLine('DIMENSIONS', secX1 + extSecOsbPad, by - 10, secX1 + extSecOsbPad, secBotDimY - 20);
        addText('DIMENSIONS', `${planThk + extSecOsbPad}${uSuf}`, (secX + secX1 + extSecOsbPad) / 2, secBotDimY - 35, 18, 0, 'center');

        // 6. WALL PLAN / TOP-PLATE & STUD LAYOUT (EXACT 1:1 MATCH WITH PDF PLAN VIEW & 2D FRAMING PLAN)
        const planY = by - 950;

        // Header Title and Panel ID Tag above ticks
        addText('WALL_ANNOTATIONS', 'WALL PLAN / TOP-PLATE & STUD LAYOUT', bx, planY + planThk + 350, 26, 0, 'left');
        addText('WALL_ANNOTATIONS', `PANEL ${label}`, bx + L, planY + planThk + 350, 24, 0, 'right');

        // Int (green/interior) & Ext (brown/exterior) Face Indicators to the left
        addText('WALL_ANNOTATIONS', 'Int', bx - 80, planY + planThk + 15, 22, 0, 'right');
        addText('WALL_ANNOTATIONS', 'Ext', bx - 80, planY - 30, 22, 0, 'right');

        // Cumulative stud corner ticks and vertical numbers above the plan strip (strictly for studs, measured from dxfStudMinX)
        const sPositions = studPositions(members);
        for (const x of sPositions) {
          const px = bx + Math.max(0, Math.min(L, x));
          const relX = Math.max(0, Math.round(x - dxfStudMinX));
          addLine('WALL_ANNOTATIONS', px, planY + planThk, px, planY + planThk + 70);
          addText('WALL_ANNOTATIONS', isImpDxf ? fis(relX) : `${relX}`, px, planY + planThk + 90, 18, 90, 'left');
        }

        // Wall plate cavity outline across full length [0, L]
        let opIntervals = [];
        for (const o of openings) {
          const oL = o.offset - o.width / 2, oR = o.offset + o.width / 2;
          opIntervals.push([oL, oR]);
        }
        let plateIntervals = [[0, L]];
        for (const [oL, oR] of opIntervals) {
          const next = [];
          for (const [a, b] of plateIntervals) {
            if (oR <= a || oL >= b) next.push([a, b]);
            else {
              if (oL > a + 5) next.push([a, oL]);
              if (oR < b - 5) next.push([oR, b]);
            }
          }
          plateIntervals = next;
        }

        for (const [pA, pB] of plateIntervals) {
          if (pB - pA < 1) continue;
          addLine('WALL_PLAN_LAYOUT', bx + pA, planY + planThk, bx + pB, planY + planThk);
          addLine('WALL_PLAN_LAYOUT', bx + pA, planY, bx + pB, planY);
          addLine('WALL_PLAN_LAYOUT', bx + pA, planY, bx + pA, planY + planThk);
          addLine('WALL_PLAN_LAYOUT', bx + pB, planY, bx + pB, planY + planThk);
        }
        // Dashed centerline axis
        addLine('WALL_PLAN_LAYOUT', bx, planY + planThk / 2, bx + L, planY + planThk / 2, 'DASHED');

        // Openings: jamb lines, threshold dashed lines, and opening callout tags below opening
        const openingCalloutBoxes = [];
        for (const o of openings) {
          const oL = o.offset - o.width / 2, oR = o.offset + o.width / 2;
          const isDoor = /door/i.test(o.type || o.id || '');
          const wMm = Math.round(o.width || (isDoor ? 900 : 1200));
          const hMm = Math.round(o.height || (isDoor ? 2100 : 1200));
          const opCode = globalOpeningCodeMap.get(o.id) || `${isDoor ? 'D' : 'W'} (${wMm}×${hMm} mm)`;

          addLine('WALL_OPENINGS', bx + oL, planY, bx + oL, planY + planThk);
          addLine('WALL_OPENINGS', bx + oR, planY, bx + oR, planY + planThk);
          addLine('WALL_OPENINGS_HIDDEN', bx + oL, planY + planThk, bx + oR, planY + planThk, 'DASHED');
          addLine('WALL_OPENINGS_HIDDEN', bx + oL, planY, bx + oR, planY, 'DASHED');
          addLine('WALL_OPENINGS_HIDDEN', bx + oL, planY + planThk / 2, bx + oR, planY + planThk / 2, 'DASHED');

          const opCenterX = bx + o.offset;
          addText('WALL_OPENINGS', opCode, opCenterX, planY - 60, 20, 0, 'center');
          openingCalloutBoxes.push({ x0: bx + oL - 20, x1: bx + oR + 20 });
        }

        // Full-height studs and trimmers with diagonal X cross-marks inside wall cavity
        for (const m of members.filter(m => /stud|king|jack|corner|junction|break|trimmer/i.test(m.type) && !/header stud|cripple|block/i.test(m.type))) {
          const mx0 = bx + Math.max(0, Math.min(L, m.x0));
          const mx1 = bx + Math.max(0, Math.min(L, m.x1));
          const mw = Math.max(38, mx1 - mx0);

          const isFlatBacking = Number.isFinite(m.depth) && m.depth > 0 && m.depth < studDepth - 5;
          const mDepth = isFlatBacking ? m.depth : studDepth;
          const mDrawH = isFlatBacking ? Math.round(mDepth) : planThk;
          let my0 = planY;
          if (isFlatBacking) {
            my0 = isExtOsb ? (planY + planThk - mDrawH) : planY; // Always on opposite face of OSB sheathing (synced with 2D framing plan)
          }

          addRect('WALL_STUDS', mx0, my0, mw, mDrawH);
          addLine('WALL_STUDS', mx0, my0, mx0 + mw, my0 + mDrawH);
          addLine('WALL_STUDS', mx0, my0 + mDrawH, mx0 + mw, my0);
        }

        // Cripple / header studs inside openings
        for (const m of members.filter(m => /header stud|cripple/i.test(m.type))) {
          for (const o of openings) {
            const oL = o.offset - o.width / 2, oR = o.offset + o.width / 2;
            if (m.x1 > oL + 1 && m.x0 < oR - 1) {
              const cx0 = Math.max(oL, m.x0), cx1 = Math.min(oR, m.x1);
              const mx0 = bx + cx0, mx1 = bx + cx1;
              const mw = Math.max(38, mx1 - mx0);
              addRect('WALL_STUDS', mx0, planY, mw, planThk);
              addLine('WALL_STUDS', mx0, planY, mx0 + mw, planY + planThk);
              addLine('WALL_STUDS', mx0, planY + planThk, mx0 + mw, planY);
            }
          }
        }

        // 12 mm OSB sheathing board strip on active face (exterior walls only, split at openings with joint lines)
        const stripOsbApplied = Boolean(osbEnabled && exteriorWall && stripOsbSide !== 'none');
        if (stripOsbApplied) {
          const isBoth = stripOsbSide === 'both';
          const isInterior = stripOsbSide === 'interior';
          const faces = isBoth ? ['exterior', 'interior'] : [isInterior ? 'interior' : 'exterior'];

          for (const face of faces) {
            const isExtFace = (face === 'exterior');
            const layName = isExtFace ? 'EXTERIOR_OSB' : 'WALL_SHEATHING';
            const yFace = isExtFace ? planY - 12 : planY + planThk;

            let segments = [];
            const getOsbLayoutFn = win.getWallOsbLayout || (typeof getWallOsbLayout === 'function' ? getWallOsbLayout : null);
            if (typeof getOsbLayoutFn === 'function') {
              segments = getOsbLayoutFn(w, model, face).segments || [];
            } else {
              let intervals = [[0, L]];
              for (const o of openings) {
                const hw = (o.width || 900) / 2;
                const oL = o.offset - hw, oR = o.offset + hw;
                const next = [];
                for (const [a, b] of intervals) {
                  if (oR <= a || oL >= b) next.push([a, b]);
                  else {
                    if (oL > a + 10) next.push([a, oL]);
                    if (oR < b - 10) next.push([oR, b]);
                  }
                }
                intervals = next;
              }
              const vStudCenters = [...new Set(
                members
                  .filter(m => !['Top plate','Bottom plate','Header','Sill','Header stud','Upper cripple','Lower cripple','Block','Blocking','Beam'].includes(m.type) &&
                               !/plate|header|sill|cripple|block|noggin|beam|lintel/i.test(m.type) &&
                               m.role !== 'Horizontal backing' &&
                               Number.isFinite(m.x0) && Number.isFinite(m.x1))
                  .map(m => Math.round(((m.x0 + m.x1) / 2) * 10) / 10)
              )].sort((a, b) => a - b);
              for (const [segA, segB] of intervals) {
                if (segB - segA < 20) continue;
                const joints = [];
                const segStuds = vStudCenters.filter(sc => sc > segA + 100 && sc < segB - 100);
                let cur = segA;
                while (segB - cur > 1220 + 20) {
                  const reachable = segStuds.filter(sc => sc > cur + 100 && sc <= cur + 1220 + 20);
                  const nextJoint = reachable.length ? reachable[reachable.length - 1] : segStuds.find(sc => sc > cur + 100);
                  if (!Number.isFinite(nextJoint) || nextJoint <= cur + 40 || nextJoint >= segB - 100) break;
                  joints.push(nextJoint);
                  cur = nextJoint;
                }
                segments.push({ segA, segB, joints });
              }
            }

            for (const { segA, segB, joints } of segments) {
              if (segB - segA < 20) continue;
              addRect(layName, bx + segA, yFace, segB - segA, 12);
              for (const sx of joints) {
                addLine(layName, bx + sx, yFace, bx + sx, yFace + 12);
              }
            }
          }
        }

        // Stud tags (S, SS, SCS, JB) placed horizontally BELOW the wall box / OSB line
        let lastTagX = -Infinity;
        const tagStuds = members.filter(m => /stud|king|jack|corner|junction|break|trimmer/i.test(m.type) && !/header stud|cripple|block/i.test(m.type))
          .sort((a, b) => ((a.x0 + a.x1) / 2) - ((b.x0 + b.x1) / 2));

        for (const m of tagStuds) {
          const tag = /junction/i.test(m.type) ? "JB" : /corner/i.test(m.type) ? "SCS" : /king|jack|trimmer/i.test(m.type) ? "SS" : "S";
          const tagCx = bx + (m.x0 + m.x1) / 2;
          const inOpeningCallout = openingCalloutBoxes.some(ob => tagCx >= ob.x0 && tagCx <= ob.x1);
          if (!inOpeningCallout && tagCx - lastTagX >= 180) {
            addText('WALL_ANNOTATIONS', tag, tagCx, planY - 60, 18, 0, 'center');
            lastTagX = tagCx;
          }
        }

        // Overall dimension line at bottom (strictly across stud framing [dxfStudMinX, dxfStudMaxX])
        const dimY = planY - 180;
        addLine('DIMENSIONS', bx + dxfStudMinX, dimY, bx + dxfStudMaxX, dimY);
        addLine('DIMENSIONS', bx + dxfStudMinX, dimY - 35, bx + dxfStudMinX, dimY + 35);
        addLine('DIMENSIONS', bx + dxfStudMaxX, dimY - 35, bx + dxfStudMaxX, dimY + 35);
        addText('DIMENSIONS', `${dxfDim(dxfStudSpan)} OVERALL PANEL LENGTH`, bx + (dxfStudMinX + dxfStudMaxX) / 2, dimY - 60, 24, 0, 'center');

        // 7. PANEL TITLE BLOCK
        addText('WALL_ANNOTATIONS', `PANEL ${label} · ${storyName.toUpperCase()} · ${exteriorWall ? 'EXTERIOR WALL' : 'INTERIOR WALL'}`, bx, by + H + 260, 30);
        addText('WALL_ANNOTATIONS', `Length: ${dxfDim(L)} (O/A Studs: ${dxfDim(dxfStudSpan)}) · Height: ${dxfDim(H)} · Thickness: ${planThk} mm · Weight: ${panelWeightKg} kg · OSB ${isImpDxf ? '1/2"' : '12 mm'}: ${osbApplied ? 'ON' : 'OFF'}`, bx, by + H + 200, 20);

        // 8. CUTTING LIST + OSB SHEATHING SCHEDULE + OPENINGS (DXF TABLES TO RIGHT OF SECTION VIEW)
        const listX = secX1 + extSecOsbPad + 300;
        let listY = by + H - 80;
        addText('WALL_ANNOTATIONS', `CUTTING LIST - PANEL ${label} (ALL LENGTHS IN ${isImpDxf ? 'FT-IN' : 'MM'})`, listX, listY + 80, 24, 0, 'left');
        addText('WALL_ANNOTATIONS', `MARK   MEMBER               SIZE             QTY    CUT (${isImpDxf ? 'FT-IN' : 'MM'})     VOL (m3)`, listX, listY + 15, 18, 0, 'left');
        addLine('WALL_ANNOTATIONS', listX, listY, listX + 1450, listY);
        listY -= 42;
        for (const r of (rows || [])) {
          const sizeTag = (r.sizeLabel || `${metricSectionLabel(r.section)} C16`);
          const volStr = typeof volumeOfRowM3 === 'function' ? volumeOfRowM3(r).toFixed(4) : '';
          const rowStr = `${String(r.label).padEnd(6)} ${String(r.type).slice(0, 20).padEnd(20)} ${String(sizeTag).slice(0, 16).padEnd(16)} ${String(r.qty).padEnd(6)} ${String(dxfDim(r.length)).padEnd(14)} ${volStr}`;
          addText('WALL_ANNOTATIONS', rowStr, listX, listY, 16, 0, 'left');
          listY -= 38;
        }
        if (Number.isFinite(volumeM3)) {
          addLine('WALL_ANNOTATIONS', listX, listY + 18, listX + 1450, listY + 18);
          addText('WALL_ANNOTATIONS', `Total timber volume: ${volumeM3.toFixed(3)} m3   |   Panel fabrication weight: ${panelWeightKg} kg`, listX, listY - 12, 18, 0, 'left');
          listY -= 65;
        }

        // OSB Sheathing Cut-Piece Schedule Table
        const osbLblDxf = isImpDxf ? '1/2"' : '12 mm';
        if (!osbApplied) {
          addText('WALL_ANNOTATIONS', `${osbLblDxf} OSB SHEATHING: OFF (No OSB pieces included in this panel takeoff)`, listX, listY, 18, 0, 'left');
          listY -= 55;
        } else {
          const panelSheets = Array.isArray(sheets) && sheets.length ? sheets : sheathingPieces(L, H, members);
          addText('WALL_ANNOTATIONS', `${osbLblDxf} OSB SHEATHING SCHEDULE - ${stripOsbSide.toUpperCase()} FACE`, listX, listY, 20, 0, 'left');
          listY -= 36;
          addText('WALL_ANNOTATIONS', `CUT LENGTH       CUT WIDTH        QTY`, listX, listY, 17, 0, 'left');
          addLine('WALL_ANNOTATIONS', listX, listY - 10, listX + 900, listY - 10);
          listY -= 42;
          for (const sh of panelSheets) {
            const shStr = `${String(dxfDim(sh.length)).padEnd(16)} ${String(dxfDim(sh.width)).padEnd(16)} (${sh.qty})`;
            addText('WALL_ANNOTATIONS', shStr, listX, listY, 16, 0, 'left');
            listY -= 36;
          }
          listY -= 25;
        }

        // Panel Openings Schedule
        addText('WALL_ANNOTATIONS', `OPENINGS IN PANEL ${label}`, listX, listY, 20, 0, 'left');
        listY -= 38;
        if (!openings || !openings.length) {
          addText('WALL_ANNOTATIONS', 'No openings in this panel.', listX, listY, 16, 0, 'left');
        } else {
          for (const o of openings) {
            const left = Math.round(o.offset - o.width / 2), sill = Math.round(o.sill || 0), head = Math.round(sill + o.height);
            const opCode = o.code || globalOpeningCodeMap.get(o.id) || o.id;
            addText('WALL_ANNOTATIONS', `${opCode} (${o.type})   ${dxfDim(o.width)} x ${dxfDim(o.height)}   sill ${dxfDim(sill)}   head ${dxfDim(head)}   left ${dxfDim(left)}`, listX, listY, 16, 0, 'left');
            listY -= 36;
          }
        }
      }

      // --- PART 3: MASTER WALL PANEL MATERIAL SUMMARY SCHEDULE IN DXF ---
      if (Array.isArray(summary) && summary.length > 0) {
        const sumX = 0;
        let sumY = -(row + 1) * GRID_GAP_Y - 600;
        addText('WALL_ANNOTATIONS', `WALL PANEL MATERIAL SUMMARY SCHEDULE (DIMENSIONS IN ${isImpDxf ? 'FT-IN' : 'MM'})`, sumX, sumY + 90, 32, 0, 'left');
        addText('WALL_ANNOTATIONS', `PANEL    TYPE        LENGTH          HEIGHT          AREA (m2)   STUDS   BLOCKS   TIMBER (m3)   OSB PCS   OPENINGS   WEIGHT (kg)`, sumX, sumY + 20, 20, 0, 'left');
        addLine('WALL_ANNOTATIONS', sumX, sumY, sumX + 2400, sumY);
        sumY -= 48;
        let totVol = 0, totOsb = 0, totWt = 0;
        for (const s of summary) {
          totVol += (s.volumeM3 || 0);
          totOsb += (s.osbPieces || 0);
          totWt += (s.weightKg || 0);
          const typeStr = s.exteriorWall ? 'EXTERIOR' : 'INTERIOR';
          const line = `${String(s.label).padEnd(8)} ${typeStr.padEnd(11)} ${String(dxfDim(s.length)).padEnd(15)} ${String(dxfDim(s.height)).padEnd(15)} ${String((s.area || 0).toFixed(2)).padEnd(11)} ${String(s.studs || 0).padEnd(7)} ${String(s.blocks || 0).padEnd(8)} ${String((s.volumeM3 || 0).toFixed(3)).padEnd(13)} ${String(s.osbPieces || 0).padEnd(9)} ${String(s.openings || 0).padEnd(10)} ${s.weightKg || 0} kg${s.isHeavy ? ' [HEAVY]' : ''}`;
          addText('WALL_ANNOTATIONS', line, sumX, sumY, 18, 0, 'left');
          sumY -= 42;
        }
        addLine('WALL_ANNOTATIONS', sumX, sumY + 20, sumX + 2400, sumY + 20);
        addText('WALL_ANNOTATIONS', `TOTAL: ${summary.length} panels   |   Timber Volume: ${totVol.toFixed(3)} m3   |   OSB Cut Pieces: ${totOsb}   |   Total Fabrication Weight: ${totWt} kg`, sumX, sumY - 20, 22, 0, 'left');
      }
    }

    dxf += `  0\nENDSEC\n  0\nSECTION\n  2\nOBJECTS\n  0\nENDSEC\n  0\nEOF`;
    return dxf;
  }

  /** Public entry: builds the package and downloads BOTH wall-panel-package.pdf and wall-panel-package.dxf. */
  win.generateWallPanelPackagePdf = function (opts = {}) {
    const model = opts.model || win.model;
    const framingFn = opts.framingFn || win.generateWallFraming;
    const plannerFn = opts.plannerFn || defaultPlanner;
    if (!model || typeof framingFn !== 'function') throw new Error('Model or wall framing generator not available.');
    const { pages, panelCount, summary, panels } = buildPackage(model, framingFn, plannerFn, opts);
    const pdf = buildPdf(pages);
    let dxf = null;
    try {
      dxf = buildPackageDXF(summary, panels, model, opts, framingFn, plannerFn);
    } catch (err) {
      console.warn('CAD DXF generation warning:', err);
    }
    if (opts.download !== false && typeof document !== 'undefined' && typeof URL !== 'undefined') {
      const blob = new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = opts.pdfFilename || 'wall-panel-package.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      // Also export CAD DXF right after PDF while browser user activation is still valid
      if (dxf && opts.exportDxf !== false) {
        setTimeout(() => {
          try {
            const dxfBlob = new Blob([dxf], { type: 'application/dxf' });
            const dxfUrl = URL.createObjectURL(dxfBlob);
            const aDxf = document.createElement('a');
            aDxf.href = dxfUrl;
            aDxf.download = opts.dxfFilename || 'wall-panel-package.dxf';
            document.body.appendChild(aDxf);
            aDxf.click();
            document.body.removeChild(aDxf);
            setTimeout(() => URL.revokeObjectURL(dxfUrl), 10000);
          } catch (err) {
            console.warn('CAD DXF download notice:', err);
          }
        }, 120);
      }
    }
    return { bytes: pdf, dxf, pages: pages.length, panels: panelCount };
  };

  /** Direct entry for exporting full Wall Panel Package CAD file (2D framing plan + all wall panel elevations, sections, wall plans & cut lists). */
  win.generateWallPanelPackageCAD = win.generateWallPanelPackageCad = win.generateWallPanelPackageDxf = function (opts = {}) {
    const model = opts.model || win.model;
    const framingFn = opts.framingFn || win.generateWallFraming;
    const plannerFn = opts.plannerFn || defaultPlanner;
    if (!model || typeof framingFn !== 'function') throw new Error('Model or wall framing generator not available.');
    const { summary, panels } = buildPackage(model, framingFn, plannerFn, opts);
    const dxf = buildPackageDXF(summary, panels, model, opts, framingFn, plannerFn);
    if (opts.download !== false && typeof document !== 'undefined' && typeof URL !== 'undefined') {
      const blob = new Blob([dxf], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = opts.filename || 'wall-panel-package.dxf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 6000);
    }
    return { dxf, panels: summary.length };
  };

  /** Direct entry for exporting full Wall Panel Package DWG/CAD file. */
  win.generateWallPanelPackageDwg = function (opts = {}) {
    return win.generateWallPanelPackageCAD({ ...opts, filename: opts.filename || 'wall-panel-package.dwg' });
  };

  /** Direct entry for exporting 2D Wall Framing Plan CAD ("2D FRAMING PLAN" DXF) file only. */
  win.generate2DFramingPlanCAD = win.generate2DFramingPlanCad = function (opts = {}) {
    const model = opts.model || win.model;
    const framingFn = opts.framingFn || win.generateWallFraming;
    const plannerFn = opts.plannerFn || defaultPlanner;
    if (!model || typeof framingFn !== 'function') throw new Error('Model or wall framing generator not available.');
    const { summary, panels } = buildPackage(model, framingFn, plannerFn, opts);
    const dxf = buildPackageDXF(summary, panels, model, { ...opts, onlyPlan: true }, framingFn, plannerFn);
    if (opts.download !== false && typeof document !== 'undefined' && typeof URL !== 'undefined') {
      const blob = new Blob([dxf], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = '2D-FRAMING-PLAN.dxf';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
    return { dxf, stories: summary.length };
  };

  win.computePanelMemberMarks = computePanelMemberMarks;
  win.wallPanelPackageInternals = { fmtMm, fis, buildPdf, Page, sheathingPieces, cutListFor, computePanelMemberMarks, timberVolumeM3, totalVolumeM3, sectionDimensions, metricSectionLabel, panelSegments, panelRules, buildPackage, buildIrelandDesignBasisPage, drawWallPlanStrip, studSpacing, studPositions, detectRooms, openingsOf, isExteriorWall, buildPackageDXF };
})();
