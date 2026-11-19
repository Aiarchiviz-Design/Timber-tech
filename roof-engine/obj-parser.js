/**
 * OBJ Parser Module within the roof-engine
 * Parses vertex data from uploaded OBJ files, identifies geometric boundaries,
 * normalizes vertex coordinates to the Plan 2D workspace grid relative to project origin,
 * and maps parsed polygons to calculated truss orientation, span lengths, and generator parameters.
 */

export function parseOBJVertices(text, scale = 0.0254, up = 'Z') {
  const vertices = [], normals = [], texcoords = [], groups = [];
  let currentGroup = { name: 'Default', faces: [], lines: [] };
  groups.push(currentGroup);

  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.split('#')[0].trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    const cmd = parts[0];

    if (cmd === 'v') {
      const p = parts.slice(1, 4).map(Number);
      if (p.length === 3 && p.every(Number.isFinite)) {
        const coords = up === 'Y' ? [p[0], -p[2], p[1]] : [p[0], p[1], p[2]];
        vertices.push(coords.map(x => x * scale));
      }
    } else if (cmd === 'vn') {
      const n = parts.slice(1, 4).map(Number);
      if (n.length === 3 && n.every(Number.isFinite)) {
        normals.push(up === 'Y' ? [n[0], -n[2], n[1]] : [n[0], n[1], n[2]]);
      }
    } else if (cmd === 'vt') {
      const t = parts.slice(1, 3).map(Number);
      if (t.length >= 2 && t.every(Number.isFinite)) {
        texcoords.push(t);
      }
    } else if (cmd === 'g' || cmd === 'o') {
      const name = parts.slice(1).join(' ') || 'Object';
      currentGroup = { name, faces: [], lines: [] };
      groups.push(currentGroup);
    } else if (cmd === 'f' || cmd === 'l') {
      const indices = parts.slice(1).map(token => {
        const idx = Number(token.split('/')[0]);
        return idx < 0 ? vertices.length + idx : idx - 1;
      }).filter(i => Number.isInteger(i) && i >= 0 && i < vertices.length);

      if (indices.length >= 2) {
        if (cmd === 'f') currentGroup.faces.push(indices);
        else currentGroup.lines.push(indices);
      }
    }
  }

  return { vertices, normals, texcoords, groups };
}

/**
 * Normalizes vertex coordinates to the Plan 2D workspace grid,
 * identifies roof boundary points, and orients them relative to project origin.
 */
export function normalizeObjToPlanWorkspace(text, scale = 0.0254, up = 'Z') {
  const parsed = parseOBJVertices(text, scale, up);
  const allVerts = parsed.vertices;

  if (!allVerts.length) {
    throw Error('No valid vertex data found in OBJ file.');
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const v of allVerts) {
    if (v[0] < minX) minX = v[0];
    if (v[0] > maxX) maxX = v[0];
    if (v[1] < minY) minY = v[1];
    if (v[1] > maxY) maxY = v[1];
    if (v[2] < minZ) minZ = v[2];
    if (v[2] > maxZ) maxZ = v[2];
  }

  const origin = [(minX + maxX) / 2, (minY + maxY) / 2, minZ];

  const normalizedVertices = allVerts.map(v => [
    Math.round((v[0] - origin[0]) * 10000) / 10000,
    Math.round((v[1] - origin[1]) * 10000) / 10000,
    Math.round((v[2] - origin[2]) * 10000) / 10000
  ]);

  const width = maxX - minX;
  const height = maxY - minY;

  const boundaryPoints2D = [
    [-width / 2, -height / 2],
    [width / 2, -height / 2],
    [width / 2, height / 2],
    [-width / 2, height / 2]
  ];

  const boundaryPointsMm = boundaryPoints2D.map(p => ({
    x: Math.round(p[0] * 1000),
    y: Math.round(p[1] * 1000)
  }));

  return {
    origin,
    bounds: {
      minX, maxX, minY, maxY, minZ, maxZ,
      width, height, depth: maxZ - minZ
    },
    vertices: normalizedVertices,
    boundary2D: boundaryPoints2D,
    boundaryMm: boundaryPointsMm,
    groups: parsed.groups
  };
}

export function parseAndNormalizeOBJ(text, scale = 0.0254, up = 'Z') {
  return normalizeObjToPlanWorkspace(text, scale, up);
}

/**
 * Maps parsed polygon vertices from imported OBJ to calculate required truss orientation
 * and span length, automatically feeding parameters into the truss generator.
 */
export function mapObjToTrussSystem(objTextOrVertices, options = {}) {
  const normalized = typeof objTextOrVertices === 'string'
    ? normalizeObjToPlanWorkspace(objTextOrVertices, options.scale || 0.0254, options.up || 'Z')
    : objTextOrVertices;

  const bounds = normalized.bounds || { width: 12, height: 8, depth: 3 };
  const span = Math.max(bounds.width, bounds.height);
  const width = Math.min(bounds.width, bounds.height);
  const height = bounds.depth || 2.5;

  const isWidthSpan = bounds.width >= bounds.height;
  const orientation = isWidthSpan ? 'X' : 'Y';
  
  const rise = Math.max(0.5, height);
  const halfSpan = span / 2;
  const pitchRad = Math.atan(rise / halfSpan);
  const pitchDeg = Math.min(60, Math.max(5, Math.round(pitchRad * (180 / Math.PI))));

  const boundary2D = normalized.boundary2D || [
    [-width / 2, -span / 2],
    [width / 2, -span / 2],
    [width / 2, span / 2],
    [-width / 2, span / 2]
  ];

  const footprintMm = boundary2D.map(p => ({
    x: Math.round((p[0] + width / 2) * 1000),
    y: Math.round((p[1] + span / 2) * 1000)
  }));

  return {
    span,
    width,
    rise,
    pitchDeg,
    orientation,
    boundary2D,
    footprintMm,
    heel: options.heel || 0.25,
    panel: options.panel || 1.2,
    overhang: options.overhang || 0.6,
    system: options.system || 'trusses',
    webPattern: options.webPattern || 'Fink'
  };
}
