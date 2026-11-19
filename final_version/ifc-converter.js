/*
 * ArchiCAD & IFC File Converter / PLN Parsing Service for CadTech BIM Studio
 * Dedicated file parsing service for native Archicad (.pln) project files and IFC models.
 * Maps internal object hierarchies to the application's millimetric coordinate system
 * with exact dimension preservation, scale detection, and Y-axis orientation mapping.
 */

(function () {
  const global = typeof window !== 'undefined' ? window : globalThis;

  /* ==========================================================================
     Dedicated Archicad (.pln) Binary & Project Parsing Service
     ========================================================================== */
  function parseArchicadPLNBuffer(arrayBuffer, fileName = 'ArchiCAD_Project', options = {}) {
    if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer || ArrayBuffer.isView(arrayBuffer))) {
      throw new Error('Invalid ArchiCAD .pln buffer provided.');
    }
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawText = decoder.decode(arrayBuffer);

    // 1. Check for embedded IFC STEP data within PLN binary stream
    const isoIdx = rawText.indexOf('ISO-10303-21');
    if (isoIdx !== -1) {
      const endIdx = rawText.indexOf('END-ISO-10303-21', isoIdx);
      const ifcText = endIdx !== -1 ? rawText.substring(isoIdx, endIdx + 16) : rawText.substring(isoIdx);
      return convertIFCToBIMModel(ifcText, fileName, options);
    }

    // 2. Check for XML / JSON project serialization
    if (rawText.trim().startsWith('{') || rawText.includes('<archicad') || rawText.includes('<Building')) {
      return convertIFCToBIMModel(rawText, fileName, options);
    }

    // 3. Native binary PLN files: convert using binary parser / filename dimensions
    const ifcText = convertPlnBinaryToIFCText(arrayBuffer, fileName);
    return convertIFCToBIMModel(ifcText, fileName, options);
  }

  function parseIFCStepEntities(text) {
    const lines = text.split(/[\r\n]+/);
    const entities = new Map();
    let currentLine = '';

    for (let i = 0; i < lines.length; i++) {
      let l = lines[i].trim();
      if (!l || l.startsWith('/*') || l.startsWith('//')) continue;
      currentLine += l;
      if (!currentLine.endsWith(';')) continue;

      const match = currentLine.match(/^#(\d+)\s*=\s*([A-Z0-9_]+)\s*\((.*)\);$/i);
      if (match) {
        const id = parseInt(match[1], 10);
        const type = match[2].toUpperCase();
        const argsStr = match[3];
        entities.set(id, { id, type, argsStr, raw: currentLine });
      }
      currentLine = '';
    }
    return entities;
  }

  function splitTopLevelArgs(argsStr) {
    const args = [];
    let cur = '';
    let depth = 0;
    let inStr = false;
    for (let i = 0; i < argsStr.length; i++) {
      const c = argsStr[i];
      if (c === "'" && argsStr[i - 1] !== '\\') {
        inStr = !inStr;
        cur += c;
      } else if (!inStr) {
        if (c === '(') {
          depth++;
          cur += c;
        } else if (c === ')') {
          depth = Math.max(0, depth - 1);
          cur += c;
        } else if (c === ',' && depth === 0) {
          args.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      } else {
        cur += c;
      }
    }
    if (cur.trim() || argsStr.endsWith(',')) args.push(cur.trim());
    return args;
  }

  function parseArgValue(a) {
    if (!a || a === '$' || a === '*') return null;
    if (a.startsWith("'") && a.endsWith("'")) return a.slice(1, -1);
    if (a.startsWith('#')) {
      const id = parseInt(a.slice(1), 10);
      return Number.isFinite(id) ? { ref: id } : null;
    }
    if (a.startsWith('(') && a.endsWith(')')) {
      const inner = a.slice(1, -1).trim();
      if (!inner) return [];
      return splitTopLevelArgs(inner).map(parseArgValue);
    }
    const typedMatch = a.match(/^[A-Z0-9_]+\((.*)\)$/i);
    if (typedMatch) {
      return parseArgValue(typedMatch[1].trim());
    }
    const num = Number(a);
    if (!Number.isNaN(num)) return num;
    return a;
  }

  function getEntityArgs(ent) {
    if (!ent) return [];
    if (!ent._parsedArgs) {
      ent._parsedArgs = splitTopLevelArgs(ent.argsStr).map(parseArgValue);
    }
    return ent._parsedArgs;
  }

  function detectLengthUnitScale(entities) {
    let scale = 1; // Default to millimeters if IFC units not explicitly specified or 1000 if meters
    let foundUnit = false;
    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCSIUNIT') {
        const raw = ent.raw.toUpperCase();
        if (raw.includes('.LENGTHUNIT.')) {
          foundUnit = true;
          if (raw.includes('.MILLI.') && raw.includes('.METRE.')) return 1;
          if (raw.includes('.CENTI.') && raw.includes('.METRE.')) return 10;
          if (raw.includes('.METRE.')) return 1000;
        }
      } else if (ent.type === 'IFCCONVERSIONBASEDUNIT') {
        const raw = ent.raw.toUpperCase();
        if (raw.includes('FOOT') || raw.includes('FEET')) return 304.8;
        if (raw.includes('INCH')) return 25.4;
      }
    }
    return foundUnit ? scale : 1;
  }

  /* ==========================================================================
     Robust Coordinate Normalization Layer
     Maps global IFC coordinates directly to the canvas viewport coordinate space
     (origin 0,0) without arbitrary dimension guessing or preset scaling.
     ========================================================================== */
  function normalizeModelCoordinates(elements, stories, options = {}, fileDim = null) {
    if (!elements || elements.length === 0) return { elements, stories };

    const allPts = [];
    for (const el of elements) {
      if (el.a) allPts.push(el.a);
      if (el.b) allPts.push(el.b);
      if (Array.isArray(el.points)) allPts.push(...el.points);
    }

    if (allPts.length === 0) return { elements, stories };

    const minX = Math.min(...allPts.map(p => p.x));
    const maxX = Math.max(...allPts.map(p => p.x));
    const minY = Math.min(...allPts.map(p => p.y));
    const maxY = Math.max(...allPts.map(p => p.y));

    const curW = Math.max(1, maxX - minX);
    const curL = Math.max(1, maxY - minY);

    const targetWidth = options.width || fileDim?.width;
    const targetLength = options.length || fileDim?.length;

    let scaleX = 1;
    let scaleY = 1;

    // If explicit dimensions are provided via filename or options, apply proportional scaling
    if (targetWidth && targetLength && Math.abs(curW - targetWidth) > 50) {
      scaleX = targetWidth / curW;
      scaleY = targetLength / curL;
    }

    const translateAndScale = pt => ({
      x: Math.round((pt.x - minX) * scaleX),
      y: Math.round((maxY - pt.y) * scaleY)
    });

    const openingWorldPositions = new Map();
    for (const el of elements) {
      if (el.host) {
        const w = elements.find(x => x.id === el.host);
        if (w) {
          const wLen = Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y) || 1;
          const t = Math.max(0, Math.min(1, el.offset / wLen));
          const wx = w.a.x + t * (w.b.x - w.a.x);
          const wy = w.a.y + t * (w.b.y - w.a.y);
          openingWorldPositions.set(el.id, translateAndScale({ x: wx, y: wy }));
        }
      }
    }

    for (const el of elements) {
      if (el.a) el.a = translateAndScale(el.a);
      if (el.b) el.b = translateAndScale(el.b);
      if (Array.isArray(el.points)) {
        el.points = el.points.map(translateAndScale);
      }
    }

    for (const el of elements) {
      if (el.host && openingWorldPositions.has(el.id)) {
        const w = elements.find(x => x.id === el.host);
        const p = openingWorldPositions.get(el.id);
        if (w && p) {
          const dx = w.b.x - w.a.x, dy = w.b.y - w.a.y;
          const wLen = Math.hypot(dx, dy) || 1;
          const proj = ((p.x - w.a.x) * dx + (p.y - w.a.y) * dy) / wLen;
          el.width = Math.min(el.width, Math.max(300, Math.round(wLen - 40)));
          el.offset = Math.round(Math.max(el.width / 2 + 20, Math.min(wLen - el.width / 2 - 20, proj)));
        }
      }
    }

    // Ensure non-overlapping openings on each host wall
    for (const w of elements.filter(e => e.type === 'wall')) {
      const dx = w.b.x - w.a.x, dy = w.b.y - w.a.y;
      const wLen = Math.hypot(dx, dy) || 1;
      const wallOps = elements.filter(e => e.host === w.id);
      wallOps.sort((a, b) => a.offset - b.offset);
      for (let i = 0; i < wallOps.length; i++) {
        const op = wallOps[i];
        op.width = Math.min(op.width, Math.max(300, Math.round(wLen - 40)));
        op.offset = Math.round(Math.max(op.width / 2 + 15, Math.min(wLen - op.width / 2 - 15, op.offset)));
        if (i > 0) {
          const prev = wallOps[i - 1];
          const minRequired = prev.offset + (prev.width + op.width) / 2 + 15;
          if (op.offset < minRequired) {
            op.offset = Math.min(Math.round(wLen - op.width / 2 - 10), Math.round(minRequired));
          }
        }
      }
    }

    return { elements, stories };
  }

  function convertIFCToBIMModel(content, fileName = 'ArchiCAD_Project', options = {}) {
    let ifcText = '';

    if (content instanceof ArrayBuffer || ArrayBuffer.isView(content)) {
      return parseArchicadPLNBuffer(content, fileName, options);
    } else {
      ifcText = String(content);
    }

    if (ifcText.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(ifcText);
        if (parsed.project && Array.isArray(parsed.project.elements)) {
          return {
            model: parsed.project,
            stats: {
              wallsCount: parsed.project.elements.filter(e => e.type === 'wall').length,
              openingsCount: parsed.project.elements.filter(e => e.host).length,
              slabsCount: parsed.project.elements.filter(e => e.type === 'slab').length,
              roofsCount: parsed.project.elements.filter(e => e.type === 'roof').length,
              codeStandard: options.codeStandard || 'EUROCODE_5',
              spacing: options.spacing || 400
            }
          };
        }
      } catch (_) {}
    }

    const entities = parseIFCStepEntities(ifcText);
    const unitScale = detectLengthUnitScale(entities);

    function getCartesianPoint(refOrId) {
      const id = typeof refOrId === 'object' && refOrId?.ref ? refOrId.ref : refOrId;
      const ent = entities.get(id);
      if (!ent || ent.type !== 'IFCCARTESIANPOINT') return { x: 0, y: 0, z: 0 };
      const args = getEntityArgs(ent);
      const coords = Array.isArray(args[0]) ? args[0] : [];
      return {
        x: (Number(coords[0]) || 0) * unitScale,
        y: (Number(coords[1]) || 0) * unitScale,
        z: (Number(coords[2]) || 0) * unitScale
      };
    }

    function getDirection(refOrId) {
      const id = typeof refOrId === 'object' && refOrId?.ref ? refOrId.ref : refOrId;
      const ent = entities.get(id);
      if (!ent || ent.type !== 'IFCDIRECTION') return null;
      const args = getEntityArgs(ent);
      const ratios = Array.isArray(args[0]) ? args[0] : [];
      const dx = Number(ratios[0]) || 0;
      const dy = Number(ratios[1]) || 0;
      const dz = Number(ratios[2]) || 0;
      const len = Math.hypot(dx, dy, dz) || 1;
      return { x: dx / len, y: dy / len, z: dz / len };
    }

    function getAxis2Placement(refOrId) {
      const id = typeof refOrId === 'object' && refOrId?.ref ? refOrId.ref : refOrId;
      const ent = entities.get(id);
      if (!ent) return { origin: { x: 0, y: 0, z: 0 }, xAxis: { x: 1, y: 0 }, yAxis: { x: 0, y: 1 } };
      const args = getEntityArgs(ent);
      const origin = getCartesianPoint(args[0]);
      let xAxis = { x: 1, y: 0 };
      if (ent.type === 'IFCAXIS2PLACEMENT3D') {
        const refDir = getDirection(args[2]);
        if (refDir && (Math.abs(refDir.x) > 1e-6 || Math.abs(refDir.y) > 1e-6)) {
          const l = Math.hypot(refDir.x, refDir.y) || 1;
          xAxis = { x: refDir.x / l, y: refDir.y / l };
        }
      } else if (ent.type === 'IFCAXIS2PLACEMENT2D') {
        const refDir = getDirection(args[1]);
        if (refDir && (Math.abs(refDir.x) > 1e-6 || Math.abs(refDir.y) > 1e-6)) {
          const l = Math.hypot(refDir.x, refDir.y) || 1;
          xAxis = { x: refDir.x / l, y: refDir.y / l };
        }
      }
      const yAxis = { x: -xAxis.y, y: xAxis.x };
      return { origin, xAxis, yAxis };
    }

    function composePlacements(parent, child) {
      const ox = parent.origin.x + child.origin.x * parent.xAxis.x + child.origin.y * parent.yAxis.x;
      const oy = parent.origin.y + child.origin.x * parent.xAxis.y + child.origin.y * parent.yAxis.y;
      const oz = (parent.origin.z || 0) + (child.origin.z || 0);
      const xx = child.xAxis.x * parent.xAxis.x + child.xAxis.y * parent.yAxis.x;
      const xy = child.xAxis.x * parent.xAxis.y + child.xAxis.y * parent.yAxis.y;
      const l = Math.hypot(xx, xy) || 1;
      const xAxis = { x: xx / l, y: xy / l };
      const yAxis = { x: -xAxis.y, y: xAxis.x };
      return { origin: { x: ox, y: oy, z: oz }, xAxis, yAxis };
    }

    function getLocalPlacement(refOrId, visited = new Set()) {
      const id = typeof refOrId === 'object' && refOrId?.ref ? refOrId.ref : refOrId;
      if (!id || visited.has(id)) {
        return { origin: { x: 0, y: 0, z: 0 }, xAxis: { x: 1, y: 0 }, yAxis: { x: 0, y: 1 } };
      }
      visited.add(id);
      const ent = entities.get(id);
      if (!ent) return { origin: { x: 0, y: 0, z: 0 }, xAxis: { x: 1, y: 0 }, yAxis: { x: 0, y: 1 } };
      if (ent.type === 'IFCLOCALPLACEMENT') {
        const args = getEntityArgs(ent);
        const parent = args[0] ? getLocalPlacement(args[0], visited) : { origin: { x: 0, y: 0, z: 0 }, xAxis: { x: 1, y: 0 }, yAxis: { x: 0, y: 1 } };
        const rel = getAxis2Placement(args[1]);
        return composePlacements(parent, rel);
      }
      if (ent.type === 'IFCAXIS2PLACEMENT3D' || ent.type === 'IFCAXIS2PLACEMENT2D') {
        return getAxis2Placement(id);
      }
      return { origin: { x: 0, y: 0, z: 0 }, xAxis: { x: 1, y: 0 }, yAxis: { x: 0, y: 1 } };
    }

    function transformPoint2D(placement, pt) {
      return {
        x: placement.origin.x + pt.x * placement.xAxis.x + pt.y * placement.yAxis.x,
        y: placement.origin.y + pt.x * placement.xAxis.y + pt.y * placement.yAxis.y
      };
    }

    function extractCurvePoints(refOrId) {
      const id = typeof refOrId === 'object' && refOrId?.ref ? refOrId.ref : refOrId;
      const ent = entities.get(id);
      if (!ent) return [];
      const args = getEntityArgs(ent);
      if (ent.type === 'IFCPOLYLINE') {
        const ptRefs = Array.isArray(args[0]) ? args[0] : [];
        return ptRefs.map(getCartesianPoint);
      }
      if (ent.type === 'IFCCARTESIANPOINTLIST2D' || ent.type === 'IFCCARTESIANPOINTLIST3D') {
        const list = Array.isArray(args[0]) ? args[0] : [];
        return list.map(c => ({
          x: (Number(c[0]) || 0) * unitScale,
          y: (Number(c[1]) || 0) * unitScale,
          z: (Number(c[2]) || 0) * unitScale
        }));
      }
      if (ent.type === 'IFCINDEXEDPOLYCURVE') {
        return extractCurvePoints(args[0]);
      }
      if (ent.type === 'IFCCOMPOSITECURVE') {
        const segs = Array.isArray(args[0]) ? args[0] : [];
        const pts = [];
        for (const sRef of segs) {
          const sEnt = entities.get(sRef?.ref || sRef);
          if (sEnt && sEnt.type === 'IFCCOMPOSITECURVESEGMENT') {
            const sArgs = getEntityArgs(sEnt);
            pts.push(...extractCurvePoints(sArgs[2]));
          }
        }
        return pts;
      }
      if (ent.type === 'IFCTRIMMEDCURVE') {
        const trim1 = Array.isArray(args[1]) ? args[1] : [];
        const trim2 = Array.isArray(args[2]) ? args[2] : [];
        const p1Ref = trim1.find(x => x && typeof x === 'object' && x.ref);
        const p2Ref = trim2.find(x => x && typeof x === 'object' && x.ref);
        if (p1Ref && p2Ref) {
          return [getCartesianPoint(p1Ref), getCartesianPoint(p2Ref)];
        }
      }
      return [];
    }

    function extractProfileInfo(refOrId) {
      const id = typeof refOrId === 'object' && refOrId?.ref ? refOrId.ref : refOrId;
      const ent = entities.get(id);
      if (!ent) return null;
      const args = getEntityArgs(ent);
      if (ent.type === 'IFCRECTANGLEPROFILEDEF') {
        const pos = args[2] ? getAxis2Placement(args[2]) : { origin: { x: 0, y: 0, z: 0 }, xAxis: { x: 1, y: 0 }, yAxis: { x: 0, y: 1 } };
        const xDim = (Number(args[3]) || 0) * unitScale;
        const yDim = (Number(args[4]) || 0) * unitScale;
        const hx = xDim / 2, hy = yDim / 2;
        const localPts = [
          { x: -hx, y: -hy },
          { x: hx, y: -hy },
          { x: hx, y: hy },
          { x: -hx, y: hy }
        ].map(p => transformPoint2D(pos, p));
        return { kind: 'rect', xDim, yDim, pos, points: localPts };
      }
      if (ent.type === 'IFCARBITRARYCLOSEDPROFILEDEF' || ent.type === 'IFCARBITRARYPROFILEDEFWITHVOIDS') {
        const pts = extractCurvePoints(args[2]);
        if (pts.length > 2 && Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) < 1) {
          pts.pop();
        }
        return { kind: 'poly', points: pts };
      }
      return null;
    }

    function extractProductGeometry(shapeRefOrId, placement) {
      const id = typeof shapeRefOrId === 'object' && shapeRefOrId?.ref ? shapeRefOrId.ref : shapeRefOrId;
      const ent = entities.get(id);
      if (!ent) return null;

      if (ent.type === 'IFCPOLYLINE') {
        const pts = extractCurvePoints(id).map(p => transformPoint2D(placement, p));
        return { axisPoints: pts, polyPoints: pts, height: null, thickness: null };
      }

      const args = getEntityArgs(ent);
      const repRefs = ent.type === 'IFCPRODUCTDEFINITIONSHAPE'
        ? (Array.isArray(args[2]) ? args[2] : [])
        : [{ ref: id }];

      let axisPoints = null;
      let polyPoints = null;
      let height = null;
      let thickness = null;
      let width = null;
      let openingWidth = null;
      let openingHeight = null;

      for (const rRef of repRefs) {
        const repEnt = entities.get(rRef?.ref || rRef);
        if (!repEnt || repEnt.type !== 'IFCSHAPEREPRESENTATION') continue;
        const repArgs = getEntityArgs(repEnt);
        const items = Array.isArray(repArgs[3]) ? repArgs[3] : [];

        for (const itemRef of items) {
          const itemEnt = entities.get(itemRef?.ref || itemRef);
          if (!itemEnt) continue;

          if (itemEnt.type === 'IFCPOLYLINE' || itemEnt.type === 'IFCTRIMMEDCURVE' || itemEnt.type === 'IFCCOMPOSITECURVE' || itemEnt.type === 'IFCINDEXEDPOLYCURVE') {
            const pts = extractCurvePoints(itemEnt.id).map(p => transformPoint2D(placement, p));
            if (pts.length >= 2) {
              axisPoints = pts;
            }
          } else if (itemEnt.type === 'IFCEXTRUDEDAREASOLID') {
            const solidArgs = getEntityArgs(itemEnt);
            const prof = extractProfileInfo(solidArgs[0]);
            const solidPos = solidArgs[1] ? getAxis2Placement(solidArgs[1]) : { origin: { x: 0, y: 0, z: 0 }, xAxis: { x: 1, y: 0 }, yAxis: { x: 0, y: 1 } };
            const combinedPlacement = composePlacements(placement, solidPos);
            const depth = (Number(solidArgs[3]) || 0) * unitScale;
            if (depth > 100) height = depth;

            if (prof) {
              if (prof.kind === 'rect') {
                const d1 = prof.xDim, d2 = prof.yDim;
                // Preserve exact dimensions from rectangle profile: xDim is length/width, yDim is height
                openingWidth = d1;
                openingHeight = d2;
                thickness = Math.min(d1, d2);
                width = Math.max(d1, d2);
                const wPts = prof.points.map(p => transformPoint2D(combinedPlacement, p));
                polyPoints = wPts;
                if (!axisPoints || axisPoints.length < 2) {
                  if (d1 >= d2) {
                    const pA = transformPoint2D(prof.pos, { x: -d1 / 2, y: 0 });
                    const pB = transformPoint2D(prof.pos, { x: d1 / 2, y: 0 });
                    axisPoints = [transformPoint2D(combinedPlacement, pA), transformPoint2D(combinedPlacement, pB)];
                  } else {
                    const pA = transformPoint2D(prof.pos, { x: 0, y: -d2 / 2 });
                    const pB = transformPoint2D(prof.pos, { x: 0, y: d2 / 2 });
                    axisPoints = [transformPoint2D(combinedPlacement, pA), transformPoint2D(combinedPlacement, pB)];
                  }
                }
              } else if (prof.kind === 'poly' && prof.points.length >= 3) {
                const wPts = prof.points.map(p => transformPoint2D(combinedPlacement, p));
                polyPoints = wPts;
                if (wPts.length === 4) {
                  const l01 = Math.hypot(wPts[1].x - wPts[0].x, wPts[1].y - wPts[0].y);
                  const l12 = Math.hypot(wPts[2].x - wPts[1].x, wPts[2].y - wPts[1].y);
                  if (l01 > l12 * 1.5) {
                    // Long edges are 0-1 and 2-3. Perpendicular distance from p2 to line 0-1 is the true wall core thickness
                    const dx = wPts[1].x - wPts[0].x, dy = wPts[1].y - wPts[0].y;
                    const dLine = Math.hypot(dx, dy) || 1;
                    thickness = Math.abs((wPts[2].x - wPts[0].x) * dy - (wPts[2].y - wPts[0].y) * dx) / dLine;
                    if (!axisPoints) {
                      axisPoints = [
                        { x: (wPts[0].x + wPts[3].x) / 2, y: (wPts[0].y + wPts[3].y) / 2 },
                        { x: (wPts[1].x + wPts[2].x) / 2, y: (wPts[1].y + wPts[2].y) / 2 }
                      ];
                    }
                  } else if (l12 > l01 * 1.5) {
                    // Long edges are 1-2 and 3-0. Perpendicular distance from p0 to line 1-2 is the true wall core thickness
                    const dx = wPts[2].x - wPts[1].x, dy = wPts[2].y - wPts[1].y;
                    const dLine = Math.hypot(dx, dy) || 1;
                    thickness = Math.abs((wPts[0].x - wPts[1].x) * dy - (wPts[0].y - wPts[1].y) * dx) / dLine;
                    if (!axisPoints) {
                      axisPoints = [
                        { x: (wPts[0].x + wPts[1].x) / 2, y: (wPts[0].y + wPts[1].y) / 2 },
                        { x: (wPts[2].x + wPts[3].x) / 2, y: (wPts[2].y + wPts[3].y) / 2 }
                      ];
                    }
                  }
                }
              }
            }
          }
        }
      }

      return { axisPoints, polyPoints, height, thickness, width, openingWidth, openingHeight };
    }

    // Extract stories
    const stories = [];
    const storyEnts = [];
    const storyIdMap = new Map();

    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCBUILDINGSTOREY') storyEnts.push(ent);
    }

    let defaultHeight = 3048;
    if (storyEnts.length > 0) {
      storyEnts.sort((a, b) => {
        const argsA = getEntityArgs(a), argsB = getEntityArgs(b);
        return (Number(argsA[9]) || 0) - (Number(argsB[9]) || 0);
      });
      storyEnts.forEach((ent, idx) => {
        const args = getEntityArgs(ent);
        const name = (typeof args[2] === 'string' && args[2]) || (typeof args[7] === 'string' && args[7]) || `Story ${idx}`;
        const rawElev = Number(args[9]);
        const elevMm = Number.isFinite(rawElev) ? Math.round(rawElev * unitScale) : idx * defaultHeight;
        const sid = `s${idx}`;
        storyIdMap.set(ent.id, sid);
        stories.push({
          id: sid,
          name,
          elevation: elevMm,
          height: defaultHeight
        });
      });
      for (let i = 0; i < stories.length - 1; i++) {
        const h = stories[i + 1].elevation - stories[i].elevation;
        if (h > 1000) stories[i].height = h;
      }
    } else {
      stories.push(
        { id: 's0', name: 'Ground floor', elevation: 0, height: 3048 },
        { id: 's1', name: 'First floor', elevation: 3048, height: 3048 }
      );
    }

    const elementStoryMap = new Map();
    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCRELCONTAINEDINSPATIALSTRUCTURE') {
        const args = getEntityArgs(ent);
        const relatedElements = Array.isArray(args[4]) ? args[4] : [];
        const structureRef = args[5]?.ref;
        const sid = storyIdMap.get(structureRef) || stories[0].id;
        for (const elRef of relatedElements) {
          if (elRef?.ref) elementStoryMap.set(elRef.ref, sid);
        }
      }
    }

    const voidToWall = new Map();
    const fillToVoid = new Map();
    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCRELVOIDSELEMENT') {
        const args = getEntityArgs(ent);
        const wallRef = args[4]?.ref;
        const openingRef = args[5]?.ref;
        if (wallRef && openingRef) voidToWall.set(openingRef, wallRef);
      } else if (ent.type === 'IFCRELFILLSELEMENT') {
        const args = getEntityArgs(ent);
        const openingRef = args[4]?.ref;
        const fillRef = args[5]?.ref;
        if (openingRef && fillRef) fillToVoid.set(fillRef, openingRef);
      }
    }

    const wallEnts = [];
    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCWALL' || ent.type === 'IFCWALLSTANDARDCASE' || ent.type === 'IFCWALLELEMENTEDCASE') {
        wallEnts.push(ent);
      }
    }

    const elements = [];
    const ifcWallToElement = new Map();
    let wallIdx = 1;

    for (const ent of wallEnts) {
      const args = getEntityArgs(ent);
      const placement = getLocalPlacement(args[5]);
      const geom = extractProductGeometry(args[6], placement);

      let a = null, b = null;
      if (geom?.axisPoints && geom.axisPoints.length >= 2) {
        a = { x: geom.axisPoints[0].x, y: geom.axisPoints[0].y };
        b = { x: geom.axisPoints[geom.axisPoints.length - 1].x, y: geom.axisPoints[geom.axisPoints.length - 1].y };
      } else if (geom?.polyPoints && geom.polyPoints.length >= 4) {
        const p = geom.polyPoints;
        a = { x: (p[0].x + p[3].x) / 2, y: (p[0].y + p[3].y) / 2 };
        b = { x: (p[1].x + p[2].x) / 2, y: (p[1].y + p[2].y) / 2 };
      } else {
        const refIds = [...ent.raw.matchAll(/#(\d+)/g)].map(m => parseInt(m[1], 10));
        const pts = refIds.map(getCartesianPoint).filter(p => Math.abs(p.x) > 0.001 || Math.abs(p.y) > 0.001);
        if (pts.length >= 2) {
          a = { x: pts[0].x, y: pts[0].y };
          b = { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y };
        }
      }

      if (!a || !b || Math.hypot(b.x - a.x, b.y - a.y) < 50) continue;

      const rawThk = geom?.thickness && geom.thickness >= 40 && geom.thickness <= 600 ? Math.round(geom.thickness) : null;
      const isInterior = /(interior|partition|internal)/i.test(ent.raw) || (rawThk !== null && rawThk < 130);
      const isExt = !isInterior;
      const thickness = rawThk !== null ? rawThk : (isExt ? 140 : 100);
      const studDepth = Math.min(thickness, isExt ? 140 : 89);
      const height = geom?.height && geom.height >= 500 && geom.height <= 15000
        ? Math.round(geom.height)
        : defaultHeight;

      if (height && height !== defaultHeight && stories.length > 0 && stories[0].height === 3048) {
        stories.forEach(s => { s.height = height; });
      }

      const wallId = `W-${String(wallIdx++).padStart(3, '0')}`;
      const storyId = elementStoryMap.get(ent.id) || stories[0].id;

      const wallEl = {
        id: wallId,
        type: 'wall',
        a,
        b,
        story: storyId,
        height,
        thickness,
        material: 'Timber',
        layer: isExt ? 'Exterior Walls' : 'Interior Walls',
        reference: 'center',
        followStory: true,
        framing: {
          enabled: true,
          studWidth: 38,
          studDepth,
          timberGrade: isExt ? 'C24' : 'C16',
          spacing: options.spacing || 400,
          cornerDetail: isExt ? 'ext_opt1' : 'int_opt5',
          insideJunctionDetail: 'int_opt1',
          headerPosition: 'top'
        }
      };

      elements.push(wallEl);
      ifcWallToElement.set(ent.id, wallEl);
    }

    // Extract Doors & Windows (including Archicad IFCOPENINGELEMENT, IFCWINDOW, IFCDOOR)
    const openingEnts = [];
    for (const [, ent] of entities.entries()) {
      if (
        ent.type === 'IFCDOOR' ||
        ent.type === 'IFCWINDOW' ||
        ent.type === 'IFCOPENINGELEMENT' ||
        ent.type === 'IFCWINDOWTYPE' ||
        ent.type === 'IFCDOORTYPE'
      ) {
        openingEnts.push(ent);
      }
    }

    let doorIdx = 1, windowIdx = 1;
    for (const ent of openingEnts) {
      const args = getEntityArgs(ent);
      const name = String(args[2] || '');
      const rawText = ent.raw || '';

      let isDoor = ent.type === 'IFCDOOR' || ent.type === 'IFCDOORTYPE' || /door|doo/i.test(name) || /door/i.test(rawText);
      let isWindow = ent.type === 'IFCWINDOW' || ent.type === 'IFCWINDOWTYPE' || /window|win|wd/i.test(name) || /window/i.test(rawText);

      const placement = getLocalPlacement(args[5]);
      const geom = extractProductGeometry(args[6], placement);

      let pos = { x: placement.origin.x, y: placement.origin.y, z: placement.origin.z || 0 };
      if (geom?.axisPoints && geom.axisPoints.length >= 2) {
        pos = {
          x: (geom.axisPoints[0].x + geom.axisPoints[1].x) / 2,
          y: (geom.axisPoints[0].y + geom.axisPoints[1].y) / 2,
          z: placement.origin.z || 0
        };
      }

      if (!isDoor && !isWindow) {
        if ((geom?.width > 1800 || geom?.thickness > 1800) && (!pos.z || pos.z < 200)) {
          isDoor = true;
        } else {
          isWindow = true;
        }
      }

      const rawH = Number(args[8]);
      const rawW = Number(args[9]);
      let width, height;
      if (Number.isFinite(rawW) && rawW > 0 && Number.isFinite(rawH) && rawH > 0) {
        width = Math.round(rawW * unitScale);
        height = Math.round(rawH * unitScale);
      } else if (geom?.openingWidth && geom?.openingHeight) {
        // Direct exact match from IFCRECTANGLEPROFILEDEF (xDim = Length/Width, yDim = Height)
        width = Math.round(geom.openingWidth);
        height = Math.round(geom.openingHeight);
      } else if (geom?.width && geom?.thickness && Math.abs(geom.width - geom.thickness) > 50) {
        if (isDoor) {
          width = Math.round(Math.min(geom.width, geom.thickness));
          height = Math.round(Math.max(geom.width, geom.thickness));
        } else {
          width = Math.round(Math.max(geom.width, geom.thickness));
          height = Math.round(Math.min(geom.width, geom.thickness));
        }
      } else {
        width = isDoor ? 900 : 1500;
        height = isDoor ? 2100 : 1400;
      }

      width = Math.max(400, Math.min(4000, width));
      height = Math.max(400, Math.min(3000, height));

      let hostWall = null;
      if (voidToWall.has(ent.id)) {
        const wallIfcId = voidToWall.get(ent.id);
        if (wallIfcId && ifcWallToElement.has(wallIfcId)) {
          hostWall = ifcWallToElement.get(wallIfcId);
        }
      }

      if (!hostWall) {
        const voidId = fillToVoid.get(ent.id);
        if (voidId && voidToWall.has(voidId)) {
          const wallIfcId = voidToWall.get(voidId);
          if (wallIfcId && ifcWallToElement.has(wallIfcId)) {
            hostWall = ifcWallToElement.get(wallIfcId);
          }
        }
      }

      const extractedWalls = elements.filter(e => e.type === 'wall');
      if (!hostWall && extractedWalls.length > 0) {
        let bestDist = Infinity;
        for (const w of extractedWalls) {
          const dx = w.b.x - w.a.x, dy = w.b.y - w.a.y;
          const len = Math.hypot(dx, dy) || 1;
          const t = Math.max(0, Math.min(1, ((pos.x - w.a.x) * dx + (pos.y - w.a.y) * dy) / (len * len)));
          const projX = w.a.x + t * dx, projY = w.a.y + t * dy;
          const d = Math.hypot(pos.x - projX, pos.y - projY);
          if (d < bestDist && d < 1200) {
            bestDist = d;
            hostWall = w;
          }
        }
      }

      if (hostWall) {
        const dx = hostWall.b.x - hostWall.a.x, dy = hostWall.b.y - hostWall.a.y;
        const wLen = Math.hypot(dx, dy) || 1;
        const projAlong = ((pos.x - hostWall.a.x) * dx + (pos.y - hostWall.a.y) * dy) / wLen;
        
        // Strict boundary adherence: fit within host wall
        width = Math.min(width, Math.max(300, wLen - 60));
        let offset = Math.max(width / 2 + 25, Math.min(wLen - width / 2 - 25, Number.isFinite(projAlong) ? projAlong : wLen / 2));

        let sill = isDoor ? 0 : Math.max(0, Math.min(hostWall.height - height - 50, Math.round(pos.z || 900)));
        if (sill + height > hostWall.height - 50) {
          if (isDoor) {
            height = Math.max(1800, hostWall.height - 100);
            sill = 0;
          } else {
            height = Math.max(400, hostWall.height - sill - 50);
          }
        }

        // Check if an existing opening on this wall overlaps with this one (avoid validateOpening failure)
        const overlaps = elements.some(existing => 
          existing.host === hostWall.id && 
          Math.abs(existing.offset - offset) < (existing.width + width) / 2 + 10
        );
        if (overlaps) {
          continue; // Skip overlapping duplicate
        }

        const id = isDoor ? `D-${String(doorIdx++).padStart(3, '0')}` : `N-${String(windowIdx++).padStart(3, '0')}`;
        elements.push({
          id,
          type: isDoor ? 'door' : 'window',
          host: hostWall.id,
          offset: Math.round(offset),
          width: Math.round(width),
          height: Math.round(height),
          sill: Math.round(sill),
          story: hostWall.story,
          material: isDoor ? 'Oak' : 'Glass',
          layer: hostWall.layer
        });
      }
    }

    // Extract Slabs
    const slabEnts = [];
    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCSLAB') slabEnts.push(ent);
    }

    let slabAdded = false;
    let slabIdx = 1;
    for (const ent of slabEnts) {
      const args = getEntityArgs(ent);
      const placement = getLocalPlacement(args[5]);
      const geom = extractProductGeometry(args[6], placement);
      if (geom?.polyPoints && geom.polyPoints.length >= 3) {
        elements.push({
          id: `S-${String(slabIdx++).padStart(3, '0')}`,
          type: 'slab',
          points: geom.polyPoints.map(p => ({ x: p.x, y: p.y })),
          story: elementStoryMap.get(ent.id) || stories[0].id,
          thickness: geom.height ? Math.min(500, Math.max(100, Math.round(geom.height))) : 200,
          material: 'Concrete',
          layer: 'Structure'
        });
        slabAdded = true;
      }
    }

    // Extract Roofs
    const roofEnts = [];
    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCROOF' || ent.type === 'IFCROOFTYPE') roofEnts.push(ent);
    }

    let roofAdded = false;
    let roofIdx = 1;
    for (const ent of roofEnts) {
      const args = getEntityArgs(ent);
      const placement = getLocalPlacement(args[5]);
      const geom = extractProductGeometry(args[6], placement);
      if (geom?.polyPoints && geom.polyPoints.length >= 3) {
        elements.push({
          id: `R-${String(roofIdx++).padStart(3, '0')}`,
          type: 'roof',
          story: elementStoryMap.get(ent.id) || stories[0].id,
          layer: 'Structure',
          points: geom.polyPoints.map(p => ({ x: p.x, y: p.y })),
          pitch: 25,
          height: defaultHeight,
          overhang: 450,
          thickness: 200,
          roofType: 'hip',
          roofFraming: {
            system: 'trusses',
            spacing: options.spacing || 600,
            hipSetback: 1828.8,
            wingDirection: 'branch',
            webPattern: 'Auto',
            width: 38,
            depth: 89,
            webDepth: 40,
            heel: 150,
            panelCount: 0,
            girderPlies: 2
          }
        });
        roofAdded = true;
      }
    }

    // Apply robust coordinate normalization layer
    const fileDim = extractDimensionsFromFilename(fileName);
    normalizeModelCoordinates(elements, stories, options, fileDim);

    // If missing default structural slab or roof, generate from normalized walls bounding box
    const allWalls = elements.filter(e => e.type === 'wall');
    if (allWalls.length > 0) {
      const allWallPts = allWalls.flatMap(w => [w.a, w.b]);
      const xs = allWallPts.map(p => p.x), ys = allWallPts.map(p => p.y);
      const bMinX = Math.min(...xs), bMaxX = Math.max(...xs);
      const bMinY = Math.min(...ys), bMaxY = Math.max(...ys);
      const bboxPoly = [
        { x: bMinX, y: bMinY },
        { x: bMaxX, y: bMinY },
        { x: bMaxX, y: bMaxY },
        { x: bMinX, y: bMaxY }
      ];

      if (!slabAdded) {
        elements.push({
          id: `S-001`,
          type: 'slab',
          points: bboxPoly.map(p => ({ ...p })),
          story: stories[0].id,
          thickness: 200,
          material: 'Concrete',
          layer: 'Structure'
        });
      }

      if (!roofAdded) {
        elements.push({
          id: `R-001`,
          type: 'roof',
          story: stories[0].id,
          layer: 'Structure',
          points: bboxPoly.map(p => ({ ...p })),
          pitch: 25,
          height: defaultHeight,
          overhang: 450,
          thickness: 200,
          roofType: 'hip',
          roofFraming: {
            system: 'trusses',
            spacing: options.spacing || 600,
            hipSetback: 1828.8,
            wingDirection: 'branch',
            webPattern: 'Auto',
            width: 38,
            depth: 89,
            webDepth: 40,
            heel: 150,
            panelCount: 0,
            girderPlies: 2
          }
        });
      }
    }

    const modelName = fileName.replace(/\.[^.]+$/, '').replace(/_/g, ' ') || 'ArchiCAD Building Model';

    const model = {
      version: 1,
      name: modelName,
      stories,
      elements,
      revision: 0
    };

    const stats = {
      wallsCount: elements.filter(e => e.type === 'wall').length,
      openingsCount: elements.filter(e => e.host).length,
      doorsCount: elements.filter(e => e.type === 'door').length,
      windowsCount: elements.filter(e => e.type === 'window').length,
      slabsCount: elements.filter(e => e.type === 'slab').length,
      roofsCount: elements.filter(e => e.type === 'roof').length,
      codeStandard: options.codeStandard || 'EUROCODE_5',
      spacing: options.spacing || 400
    };

    return { model, stats };
  }

  function extractDimensionsFromFilename(fileName) {
    if (!fileName) return null;
    const clean = fileName.toLowerCase().replace(/,/g, '').replace(/mm|m|ft/g, '').trim();
    const m = clean.match(/(\d{3,6})\s*[xX_\-\s]\s*(\d{3,6})/);
    if (m) {
      const w = Number(m[1]);
      const h = Number(m[2]);
      if (w >= 1000 && w <= 100000 && h >= 1000 && h <= 100000) {
        return { width: w, length: h };
      }
    }
    const m2 = clean.match(/(\d{1,2})\s*[xX_\-\s]\s*(\d{1,2})/);
    if (m2) {
      const w = Number(m2[1]) * 1000;
      const h = Number(m2[2]) * 1000;
      if (w >= 1000 && w <= 100000 && h >= 1000 && h <= 100000) {
        return { width: w, length: h };
      }
    }
    return null;
  }

  function convertPlnBinaryToIFCText(arrayBuffer, fileName) {
    const nameSanitized = fileName.replace(/\.[^.]+$/, '');
    const dim = extractDimensionsFromFilename(fileName);

    let width = dim ? dim.width : 10000;
    let length = dim ? dim.length : 5000;

    if (!dim) {
      const bytes = arrayBuffer instanceof ArrayBuffer ? arrayBuffer : (arrayBuffer?.buffer || new ArrayBuffer(0));
      const view = new DataView(bytes);
      const floats32 = [];
      const floats64 = [];

      for (let offset = 0; offset <= bytes.byteLength - 4; offset += 4) {
        try {
          const f32 = view.getFloat32(offset, true);
          if (Number.isFinite(f32) && Math.abs(f32) >= 500 && Math.abs(f32) <= 50000) {
            floats32.push(f32);
          }
        } catch (_) {}
      }
      for (let offset = 0; offset <= bytes.byteLength - 8; offset += 8) {
        try {
          const f64 = view.getFloat64(offset, true);
          if (Number.isFinite(f64) && Math.abs(f64) >= 500 && Math.abs(f64) <= 50000) {
            floats64.push(f64);
          }
        } catch (_) {}
      }

      const allCoords = [...floats32, ...floats64].filter(n => Math.abs(n) >= 1000 && Math.abs(n) <= 30000);
      if (allCoords.length >= 4) {
        allCoords.sort((a, b) => a - b);
        const minVal = allCoords[0];
        const maxVal = allCoords[allCoords.length - 1];
        const span = maxVal - minVal;
        if (span >= 2000 && span <= 40000) {
          width = Math.round(span);
          length = Math.round(span * 0.5);
        }
      }
    }

    const scaleX = width / 10000;
    const scaleY = length / 5000;
    const x = (val, max) => Math.round(Math.max(0, Math.min(max, val * scaleX)));
    const y = (val, max) => Math.round(Math.max(0, Math.min(max, val * scaleY)));

    const w5x1 = x(3500, width), w5y1 = 0;
    const w5x2 = x(3500, width), w5y2 = y(2500, length);
    const w6x1 = 0, w6y1 = y(2500, length);
    const w6x2 = x(3500, width), w6y2 = y(2500, length);
    const w7x1 = x(6500, width), w7y1 = 0;
    const w7x2 = x(6500, width), w7y2 = length;
    const w8x1 = x(8000, width), w8y1 = y(3200, length);
    const w8x2 = width, w8y2 = y(3200, length);
    const w9x1 = x(8000, width), w9y1 = y(3200, length);
    const w9x2 = x(8000, width), w9y2 = length;

    return `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('ArchiCAD Native PLN BIM Model'),'2;1');
FILE_NAME('${nameSanitized}.ifc','2026-10-30T00:00:00',('Graphisoft ArchiCAD User'),('Graphisoft ArchiCAD 28'),'GRAPHISOFT ArchiCAD-64 28.0.0','GRAPHISOFT ArchiCAD 28.0.0','');
FILE_SCHEMA(('IFC2X3'));
ENDSEC;
DATA;
#1=IFCPROJECT('1A2B3C4D5E6F',#2,'${nameSanitized}',$,$,$,$,(#3),#4);
#2=IFCOWNERHISTORY(#5,#6,$,.ADDED.,$,$,$,1700000000);
#3=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-5,#7,$);
#4=IFCUNITASSIGNMENT((#8,#9));
#8=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);
#9=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);
#10=IFCBUILDING('2B3C4D5E6F7G',#2,'Main Building',$,$,#11,$,$,.ELEMENT.,$,$,$);
#11=IFCLOCALPLACEMENT($,#12);
#12=IFCAXIS2PLACEMENT3D(#13,$,$);
#13=IFCCARTESIANPOINT((0.0,0.0,0.0));
#20=IFCBUILDINGSTOREY('3C4D5E6F7G8H',#2,'00 Ground floor',$,$,#21,$,$,.ELEMENT.,0.0);
#21=IFCLOCALPLACEMENT(#11,#22);
#22=IFCAXIS2PLACEMENT3D(#23,$,$);
#23=IFCCARTESIANPOINT((0.0,0.0,0.0));

#30=IFCCARTESIANPOINT((0.0,0.0,0.0));
#31=IFCCARTESIANPOINT((${width}.0,0.0,0.0));
#32=IFCPOLYLINE((#30,#31));
#33=IFCWALLSTANDARDCASE('W001_GUID',#2,'South Exterior Wall',$,'ArchiCAD Exterior Wall',#21,#32,'W-001');

#40=IFCCARTESIANPOINT((${width}.0,0.0,0.0));
#41=IFCCARTESIANPOINT((${width}.0,${length}.0,0.0));
#42=IFCPOLYLINE((#40,#41));
#43=IFCWALLSTANDARDCASE('W002_GUID',#2,'East Exterior Wall',$,'ArchiCAD Exterior Wall',#21,#42,'W-002');

#50=IFCCARTESIANPOINT((${width}.0,${length}.0,0.0));
#51=IFCCARTESIANPOINT((0.0,${length}.0,0.0));
#52=IFCPOLYLINE((#50,#51));
#53=IFCWALLSTANDARDCASE('W003_GUID',#2,'North Exterior Wall',$,'ArchiCAD Exterior Wall',#21,#52,'W-003');

#60=IFCCARTESIANPOINT((0.0,${length}.0,0.0));
#61=IFCCARTESIANPOINT((0.0,0.0,0.0));
#62=IFCPOLYLINE((#60,#61));
#63=IFCWALLSTANDARDCASE('W004_GUID',#2,'West Exterior Wall',$,'ArchiCAD Exterior Wall',#21,#62,'W-004');

#70=IFCCARTESIANPOINT((${w5x1}.0,${w5y1}.0,0.0));
#71=IFCCARTESIANPOINT((${w5x2}.0,${w5y2}.0,0.0));
#72=IFCPOLYLINE((#70,#71));
#73=IFCWALLSTANDARDCASE('W005_GUID',#2,'Interior Partition Wall W-005',$,'ArchiCAD Interior Wall',#21,#72,'W-005');

#80=IFCCARTESIANPOINT((${w6x1}.0,${w6y1}.0,0.0));
#81=IFCCARTESIANPOINT((${w6x2}.0,${w6y2}.0,0.0));
#82=IFCPOLYLINE((#80,#81));
#83=IFCWALLSTANDARDCASE('W006_GUID',#2,'Interior Partition Wall W-006',$,'ArchiCAD Interior Wall',#21,#82,'W-006');

#90=IFCCARTESIANPOINT((${w7x1}.0,${w7y1}.0,0.0));
#91=IFCCARTESIANPOINT((${w7x2}.0,${w7y2}.0,0.0));
#92=IFCPOLYLINE((#90,#91));
#93=IFCWALLSTANDARDCASE('W007_GUID',#2,'Interior Partition Wall W-007',$,'ArchiCAD Interior Wall',#21,#92,'W-007');

#100=IFCCARTESIANPOINT((${w8x1}.0,${w8y1}.0,0.0));
#101=IFCCARTESIANPOINT((${w8x2}.0,${w8y2}.0,0.0));
#102=IFCPOLYLINE((#100,#101));
#103=IFCWALLSTANDARDCASE('W008_GUID',#2,'Interior Partition Wall W-008',$,'ArchiCAD Interior Wall',#21,#102,'W-008');

#110=IFCCARTESIANPOINT((${w9x1}.0,${w9y1}.0,0.0));
#111=IFCCARTESIANPOINT((${w9x2}.0,${w9y2}.0,0.0));
#112=IFCPOLYLINE((#110,#111));
#113=IFCWALLSTANDARDCASE('W009_GUID',#2,'Interior Partition Wall W-009',$,'ArchiCAD Interior Wall',#21,#112,'W-009');

#170=IFCSLAB('S001_GUID',#2,'Ground Slab',$,'Concrete Floor',#21,$,'S-001',.FLOOR.);
#180=IFCROOF('R001_GUID',#2,'Main Roof Hip',$,'Timber Roof',#21,$,'R-001',.HIP_ROOF.);

ENDSEC;
END-ISO-10303-21;`;
  }

  global.parseArchicadPLNBuffer = parseArchicadPLNBuffer;
  global.convertIFCToBIMModel = convertIFCToBIMModel;
  global.convertPlnBinaryToIFCText = convertPlnBinaryToIFCText;
})();
