/*
 * Timber Teck BIM & IFC File Converter / PLN Parsing Service
 * Dedicated file parsing service for native BIM (.pln) project files and IFC models.
 * Maps internal object hierarchies to the application's millimetric coordinate system
 * with exact dimension preservation, scale detection, and Y-axis orientation mapping.
 */

(function () {
  const global = typeof window !== 'undefined' ? window : globalThis;

  /* ==========================================================================
     Dedicated Timber Teck (.pln) Binary & Project Parsing Service
     ========================================================================== */
  function parseTimberTeckPLNBuffer(arrayBuffer, fileName = 'Timber_Teck_Project', options = {}) {
    if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer || ArrayBuffer.isView(arrayBuffer))) {
      throw new Error('Invalid Timber Teck .pln buffer provided.');
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
    if (rawText.trim().startsWith('{') || rawText.includes('<Building') || rawText.includes('<Project')) {
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
        if (raw.includes('.LENGTHUNIT.') || !raw.includes('.PLANEANGLEUNIT.')) {
          if (raw.includes('FOOT') || raw.includes('FEET')) return 304.8;
          if (raw.includes('INCH')) return 25.4;
        }
      }
    }
    return foundUnit ? scale : 1;
  }

  function detectAngleUnit(entities) {
    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCSIUNIT') {
        const raw = ent.raw.toUpperCase();
        if (raw.includes('.PLANEANGLEUNIT.')) {
          if (raw.includes('.RADIAN.')) return 'RADIAN';
        }
      } else if (ent.type === 'IFCCONVERSIONBASEDUNIT') {
        const raw = ent.raw.toUpperCase();
        if (raw.includes('.PLANEANGLEUNIT.') && raw.includes('DEGREE')) return 'DEGREE';
      }
    }
    return 'RADIAN';
  }

  function cleanPolygon2D(pts) {
    if (!Array.isArray(pts) || pts.length < 3) return pts || [];
    const dedup = [];
    for (const p of pts) {
      if (!Number.isFinite(p?.x) || !Number.isFinite(p?.y)) continue;
      if (!dedup.length || Math.hypot(p.x - dedup[dedup.length - 1].x, p.y - dedup[dedup.length - 1].y) > 0.5) {
        dedup.push({ x: p.x, y: p.y, ...(Number.isFinite(p.z) ? { z: p.z } : {}) });
      }
    }
    if (dedup.length > 1 && Math.hypot(dedup[0].x - dedup[dedup.length - 1].x, dedup[0].y - dedup[dedup.length - 1].y) <= 0.5) {
      dedup.pop();
    }
    if (dedup.length < 3) return dedup;
    const cleaned = [];
    for (let i = 0; i < dedup.length; i++) {
      const a = dedup[(i - 1 + dedup.length) % dedup.length];
      const b = dedup[i];
      const c = dedup[(i + 1) % dedup.length];
      const v1x = b.x - a.x, v1y = b.y - a.y;
      const v2x = c.x - b.x, v2y = c.y - b.y;
      const l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
      if (l1 < 0.5 || l2 < 0.5) continue;
      const sinCross = Math.abs(v1x * v2y - v1y * v2x) / (l1 * l2);
      const dotProd = (v1x * v2x + v1y * v2y) / (l1 * l2);
      if (sinCross < 0.002 && dotProd > 0) continue;
      cleaned.push(b);
    }
    return cleaned.length >= 3 ? cleaned : dedup;
  }

  function polygonSignedArea2D(pts) {
    if (!Array.isArray(pts) || pts.length < 3) return 0;
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      s += a.x * b.y - b.x * a.y;
    }
    return s * 0.5;
  }

  function computeConvexHull2D(pts) {
    if (!Array.isArray(pts) || pts.length < 3) return pts || [];
    const unique = [];
    for (const p of pts) {
      if (!Number.isFinite(p?.x) || !Number.isFinite(p?.y)) continue;
      if (!unique.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 10)) {
        unique.push({ x: p.x, y: p.y });
      }
    }
    if (unique.length < 3) return unique;
    unique.sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
    const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lower = [];
    for (const p of unique) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
      lower.push(p);
    }
    const upper = [];
    for (let i = unique.length - 1; i >= 0; i--) {
      const p = unique[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
      upper.push(p);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
  }

  /* ==========================================================================
     Robust Coordinate Normalization Layer
     Maps global IFC coordinates directly to the canvas viewport coordinate space
     (origin 0,0) using wall reference coordinates first so roof overhangs never
     offset wall geometry, then synchronizes roofs and gable walls under roofs.
     ========================================================================== */
  function normalizeModelCoordinates(elements, stories, options = {}, fileDim = null) {
    if (!elements || elements.length === 0) return { elements, stories };

    const wallPts = [];
    const allPts = [];
    for (const el of elements) {
      if (el.a) {
        allPts.push(el.a);
        if (el.type === 'wall') wallPts.push(el.a);
      }
      if (el.b) {
        allPts.push(el.b);
        if (el.type === 'wall') wallPts.push(el.b);
      }
      if (Array.isArray(el.points)) {
        allPts.push(...el.points);
      }
    }

    const refPts = wallPts.length >= 2 ? wallPts : allPts;
    if (refPts.length === 0) return { elements, stories };

    const minX = Math.min(...refPts.map(p => p.x));
    const maxX = Math.max(...refPts.map(p => p.x));
    const minY = Math.min(...refPts.map(p => p.y));
    const maxY = Math.max(...refPts.map(p => p.y));

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
      x: Math.round((pt.x - minX) * scaleX * 100) / 100,
      y: Math.round((maxY - pt.y) * scaleY * 100) / 100
    });
    const unmapToIFC = pt => ({
      x: minX + pt.x / scaleX,
      y: maxY - pt.y / scaleY
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
    const walls = elements.filter(e => e.type === 'wall');
    for (const w of walls) {
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

    // Synchronize imported roofs (preserving exact footprint, angle through Y-flip, style, and eave/pivot height)
    const extWalls = walls.filter(w => w.layer === 'Exterior Walls');
    const footprintWalls = extWalls.length >= 2 ? extWalls : walls;
    let wallBBoxPoly = null;
    let wMinX = 0, wMaxX = 0, wMinY = 0, wMaxY = 0;
    if (footprintWalls.length > 0) {
      const wPts = footprintWalls.flatMap(w => [w.a, w.b]);
      wMinX = Math.min(...wPts.map(p => p.x));
      wMaxX = Math.max(...wPts.map(p => p.x));
      wMinY = Math.min(...wPts.map(p => p.y));
      wMaxY = Math.max(...wPts.map(p => p.y));
      wallBBoxPoly = [
        { x: wMinX, y: wMinY },
        { x: wMaxX, y: wMinY },
        { x: wMaxX, y: wMaxY },
        { x: wMinX, y: wMaxY }
      ];
    }

    for (const roof of elements.filter(e => e.type === 'roof')) {
      if (Array.isArray(roof.points) && roof.points.length >= 3) {
        roof.points = cleanPolygon2D(roof.points);
        if (polygonSignedArea2D(roof.points) < 0) roof.points.reverse();
      } else if (wallBBoxPoly) {
        roof.points = wallBBoxPoly.map(p => ({ ...p }));
        roof._ifcSynthesizedFromWalls = true;
      }

      if (roof._ifcSynthesizedFromWalls) {
        if (!Number.isFinite(roof.overhang) || roof.overhang <= 0) roof.overhang = 450;
      } else if (Number.isFinite(roof._ifcMetaOverhang) && roof._ifcMetaOverhang > 0) {
        roof.overhang = Math.round(roof._ifcMetaOverhang);
      } else if (wallBBoxPoly && Array.isArray(roof.points) && roof.points.length >= 3) {
        const rMinX = Math.min(...roof.points.map(p => p.x));
        const rMaxX = Math.max(...roof.points.map(p => p.x));
        const rMinY = Math.min(...roof.points.map(p => p.y));
        const rMaxY = Math.max(...roof.points.map(p => p.y));
        const extLeft = wMinX - rMinX;
        const extRight = rMaxX - wMaxX;
        const extTop = wMinY - rMinY;
        const extBot = rMaxY - wMaxY;
        const minExt = Math.min(extLeft, extRight, extTop, extBot);
        const maxAbsDiff = Math.max(Math.abs(extLeft), Math.abs(extRight), Math.abs(extTop), Math.abs(extBot));
        const posExts = [extLeft, extRight, extTop, extBot].filter(v => v > 40 && v < 2500);
        const isRectRoof = roof.points.length === 4 &&
          Math.abs(Math.abs(polygonSignedArea2D(roof.points)) - (rMaxX - rMinX) * (rMaxY - rMinY)) < Math.max(2000, (rMaxX - rMinX) * (rMaxY - rMinY) * 0.02);

        if (isRectRoof && posExts.length >= 1 && minExt >= -100) {
          const avgPosExt = posExts.reduce((s, v) => s + v, 0) / posExts.length;
          roof.overhang = Math.round(avgPosExt);
          roof.points = wallBBoxPoly.map(p => ({ ...p }));
        } else if (isRectRoof && maxAbsDiff <= 100) {
          // Roof footprint matches wall bearing lines directly: apply standard overhang for pitched roofs
          roof.overhang = (roof.pitch ?? 25) >= 1 ? 450 : 0;
          roof.points = wallBBoxPoly.map(p => ({ ...p }));
        } else if (posExts.length === 4 && minExt > 40) {
          const avgPosExt = posExts.reduce((s, v) => s + v, 0) / 4;
          roof.overhang = Math.round(avgPosExt);
        } else {
          roof.overhang = (roof.roofType === 'mono' && (roof.pitch ?? 25) >= 1) ? 450 : 0;
        }
      } else if (!Number.isFinite(roof.overhang)) {
        roof.overhang = roof._ifcMetaOverhang ?? ((roof.pitch ?? 25) >= 1 ? 450 : 0);
      }

      // Transform roofAngle across Y-flip (y' = (maxY - y) * scaleY) and XY scaling
      if (roof._ifcUpslopeDir && Number.isFinite(roof._ifcUpslopeDir.ux) && Number.isFinite(roof._ifcUpslopeDir.uy)) {
        const uxC = roof._ifcUpslopeDir.ux / scaleX;
        const uyC = -roof._ifcUpslopeDir.uy / scaleY;
        const mag = Math.hypot(uxC, uyC);
        if (mag > 1e-6) {
          let deg = (Math.atan2(-uxC / mag, uyC / mag) * 180) / Math.PI;
          if (roof.roofType === 'gable') {
            deg = ((deg % 180) + 180) % 180;
          } else {
            deg = ((deg % 360) + 360) % 360;
          }
          roof.roofAngle = Math.round(deg * 10) / 10;
        }
      } else if (Number.isFinite(roof._ifcRawAngle)) {
        // Explicit PropertySet or Placement angle in IFC XY plane (Y-flipped into canvas space)
        const rad = (roof._ifcRawAngle * Math.PI) / 180;
        const uxIfc = -Math.sin(rad), uyIfc = Math.cos(rad);
        const uxC = uxIfc / scaleX, uyC = -uyIfc / scaleY;
        let deg = (Math.atan2(-uxC, uyC) * 180) / Math.PI;
        deg = roof.roofType === 'gable' ? ((deg % 180) + 180) % 180 : ((deg % 360) + 360) % 360;
        roof.roofAngle = Math.round(deg * 10) / 10;
      } else if (roof.roofType === 'gable' && Array.isArray(roof.points) && roof.points.length >= 3) {
        // Infer gable ridge orientation from local gable end walls under this roof or long building axis
        const rMinX = Math.min(...roof.points.map(p => p.x));
        const rMaxX = Math.max(...roof.points.map(p => p.x));
        const rMinY = Math.min(...roof.points.map(p => p.y));
        const rMaxY = Math.max(...roof.points.map(p => p.y));
        const tol = Math.max(roof.overhang || 0, 800);
        const localGableWalls = footprintWalls.filter(w => {
          const mx = (w.a.x + w.b.x) / 2, my = (w.a.y + w.b.y) / 2;
          return (w.isGableWall || w.gableProfile?.enabled) &&
            mx >= rMinX - tol && mx <= rMaxX + tol && my >= rMinY - tol && my <= rMaxY + tol;
        });
        if (localGableWalls.length > 0) {
          const gw = localGableWalls[0];
          const wAng = Math.atan2(gw.b.y - gw.a.y, gw.b.x - gw.a.x) * (180 / Math.PI);
          // Ridge runs perpendicular to gable end wall
          roof.roofAngle = Math.round((((wAng + 90) % 180) + 180) % 180 * 10) / 10;
        } else if ((rMaxY - rMinY) > (rMaxX - rMinX) * 1.05) {
          roof.roofAngle = 90;
        }
      }

      if (roof.roofFraming && Number.isFinite(roof.roofAngle)) {
        roof.roofFraming.angle = roof.roofAngle;
      }

      // Compute exact world Z at pivot boundary from IFC 3D top planes or explicit PropertySet height (preserving IFC roof height)
      const st = stories.find(s => s.id === roof.story) || stories[0];
      const storyElev = st ? st.elevation : 0;
      if (Number.isFinite(roof._ifcExplicitWorldTopZ)) {
        roof.height = Math.round((roof._ifcExplicitWorldTopZ - storyElev) * 10) / 10;
        roof.followStory = false;
        roof.ifcPreservedHeight = true;
      } else if (typeof roof._ifcEvalPivotTopZ === 'function' && Array.isArray(roof.points) && roof.points.length >= 3) {
        const pivotIfcPts = roof.points.map(unmapToIFC);
        const pivotTopZ = roof._ifcEvalPivotTopZ(pivotIfcPts, roof.roofType, roof.pitch);
        if (Number.isFinite(pivotTopZ)) {
          roof.height = Math.round((pivotTopZ - storyElev) * 10) / 10;
          roof.followStory = false;
          roof.ifcPreservedHeight = true;
        }
      }

      delete roof._ifcUpslopeDir;
      delete roof._ifcRawAngle;
      delete roof._ifcMetaOverhang;
      delete roof._ifcSynthesizedFromWalls;
      delete roof._ifcEvalPivotTopZ;
      delete roof._ifcExplicitWorldTopZ;
    }

    // Automatically link gable/raked walls under gable, multiGable, or mono roofs (preserving extracted IFC wall geometry when present)
    if (footprintWalls.length > 0) {
      const roofs = elements.filter(e => e.type === 'roof');
      for (const roof of roofs) {
        if (roof.roofType !== 'gable' && roof.roofType !== 'multiGable' && roof.roofType !== 'mono') continue;
        const rPts = roof.points || wallBBoxPoly;
        if (!rPts || rPts.length < 3) continue;
        const rMinX = Math.min(...rPts.map(p => p.x));
        const rMaxX = Math.max(...rPts.map(p => p.x));
        const rMinY = Math.min(...rPts.map(p => p.y));
        const rMaxY = Math.max(...rPts.map(p => p.y));
        const angRad = ((Number(roof.roofAngle) || 0) * Math.PI) / 180;
        const ridgeDir = { x: Math.cos(angRad), y: Math.sin(angRad) };
        const spanDir = { x: -Math.sin(angRad), y: Math.cos(angRad) };
        const rVals = rPts.map(p => p.x * ridgeDir.x + p.y * ridgeDir.y);
        const rLo = Math.min(...rVals), rHi = Math.max(...rVals);
        const tol = Math.max(roof.overhang || 0, 800);
        const pitchDeg = Math.max(0, Math.min(80, Number(roof.pitch) ?? 25));
        const slope = Math.tan((pitchDeg * Math.PI) / 180);

        for (const w of footprintWalls) {
          const wLen = Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y);
          if (wLen < 600) continue;
          const wMidX = (w.a.x + w.b.x) / 2, wMidY = (w.a.y + w.b.y) / 2;
          if (wMidX < rMinX - tol || wMidX > rMaxX + tol || wMidY < rMinY - tol || wMidY > rMaxY + tol) continue;

          const u = { x: (w.b.x - w.a.x) / wLen, y: (w.b.y - w.a.y) / wLen };
          let isGableEnd = false;
          if (roof.roofType === 'gable' || roof.roofType === 'mono') {
            const alignSpan = Math.abs(u.x * spanDir.x + u.y * spanDir.y);
            const wRidgePos = wMidX * ridgeDir.x + wMidY * ridgeDir.y;
            isGableEnd = alignSpan > 0.9 && Math.min(Math.abs(wRidgePos - rLo), Math.abs(wRidgePos - rHi)) <= tol;
          } else {
            const spanX = rMaxX - rMinX, spanY = rMaxY - rMinY;
            const ridgeAlongX = spanX >= spanY;
            isGableEnd = ridgeAlongX
              ? (Math.abs(u.y) > 0.9 && (Math.abs(wMidX - rMinX) <= tol || Math.abs(wMidX - rMaxX) <= tol))
              : (Math.abs(u.x) > 0.9 && (Math.abs(wMidY - rMinY) <= tol || Math.abs(wMidY - rMaxY) <= tol));
          }

          if (isGableEnd || w.isGableWall) {
            const existingGp = w.gableProfile && w.gableProfile.enabled !== false ? w.gableProfile : null;
            const resolvedPitch = existingGp?.pitch || pitchDeg;
            const isMonoRoof = roof.roofType === 'mono';
            const risesTowardB = ((w.b.x - w.a.x) * spanDir.x + (w.b.y - w.a.y) * spanDir.y) >= 0;
            const defaultPeakRatio = isMonoRoof ? (risesTowardB ? 1 : 0) : 0.5;
            const resolvedPeakRatio = existingGp && Number.isFinite(existingGp.peakRatio) ? existingGp.peakRatio : defaultPeakRatio;
            const runForRise = (resolvedPeakRatio <= 0.03 || resolvedPeakRatio >= 0.97)
              ? wLen
              : Math.max(resolvedPeakRatio * wLen, (1 - resolvedPeakRatio) * wLen);
            const fallbackRise = Math.round(runForRise * Math.tan((resolvedPitch * Math.PI) / 180));
            const resolvedPeakRise = existingGp?.peakRise > 20 ? existingGp.peakRise : fallbackRise;

            w.isGableWall = true;
            w.gableMode = w.gableMode || 'gable';
            w.gablePitch = resolvedPitch;
            if (resolvedPitch > 0.5 && resolvedPeakRise > 20) {
              w.gableProfile = {
                ...existingGp,
                enabled: true,
                source: existingGp?.source || 'ifc-roof',
                roofId: roof.id,
                eaveHeight: existingGp?.eaveHeight ?? w.height,
                leftHeight: existingGp?.leftHeight ?? (isMonoRoof ? (risesTowardB ? w.height : w.height + resolvedPeakRise) : w.height),
                rightHeight: existingGp?.rightHeight ?? (isMonoRoof ? (risesTowardB ? w.height + resolvedPeakRise : w.height) : w.height),
                pitch: resolvedPitch,
                peakRatio: resolvedPeakRatio,
                peakRise: resolvedPeakRise
              };
            }
          }
        }
      }
    }

    return { elements, stories };
  }

  function convertIFCToBIMModel(content, fileName = 'Timber_Teck_Project', options = {}) {
    let ifcText = '';

    if (content instanceof ArrayBuffer || ArrayBuffer.isView(content)) {
      return parseTimberTeckPLNBuffer(content, fileName, options);
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
              gableWallsCount: parsed.project.elements.filter(e => e.type === 'wall' && (e.isGableWall || e.gableProfile?.enabled)).length,
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

    function cross3(a, b) {
      return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
      };
    }

    function normalize3(v) {
      const l = Math.hypot(v.x, v.y, v.z) || 1;
      return { x: v.x / l, y: v.y / l, z: v.z / l };
    }

    function getAxis2Placement(refOrId) {
      const id = typeof refOrId === 'object' && refOrId?.ref ? refOrId.ref : refOrId;
      const ent = entities.get(id);
      if (!ent) {
        return {
          origin: { x: 0, y: 0, z: 0 },
          xAxis: { x: 1, y: 0, z: 0 },
          yAxis: { x: 0, y: 1, z: 0 },
          zAxis: { x: 0, y: 0, z: 1 }
        };
      }
      const args = getEntityArgs(ent);
      const origin = getCartesianPoint(args[0]);
      let zAxis = { x: 0, y: 0, z: 1 };
      let xAxis = { x: 1, y: 0, z: 0 };
      if (ent.type === 'IFCAXIS2PLACEMENT3D') {
        const axisDir = getDirection(args[1]);
        if (axisDir) zAxis = normalize3(axisDir);
        const refDir = getDirection(args[2]);
        if (refDir) {
          xAxis = normalize3(refDir);
        } else if (Math.abs(zAxis.z) < 0.99) {
          xAxis = normalize3(cross3({ x: 0, y: 0, z: 1 }, zAxis));
        }
        const y3 = normalize3(cross3(zAxis, xAxis));
        xAxis = normalize3(cross3(y3, zAxis));
        return { origin, xAxis, yAxis: y3, zAxis };
      } else if (ent.type === 'IFCAXIS2PLACEMENT2D') {
        const refDir = getDirection(args[1]);
        if (refDir && (Math.abs(refDir.x) > 1e-6 || Math.abs(refDir.y) > 1e-6)) {
          const l = Math.hypot(refDir.x, refDir.y) || 1;
          xAxis = { x: refDir.x / l, y: refDir.y / l, z: 0 };
        }
      }
      const yAxis = { x: -xAxis.y, y: xAxis.x, z: 0 };
      return { origin, xAxis, yAxis, zAxis };
    }

    function transformPoint3D(placement, pt) {
      const px = pt.x || 0, py = pt.y || 0, pz = pt.z || 0;
      const xa = placement.xAxis || { x: 1, y: 0, z: 0 };
      const ya = placement.yAxis || { x: 0, y: 1, z: 0 };
      const za = placement.zAxis || { x: 0, y: 0, z: 1 };
      return {
        x: placement.origin.x + px * xa.x + py * ya.x + pz * za.x,
        y: placement.origin.y + px * xa.y + py * ya.y + pz * za.y,
        z: (placement.origin.z || 0) + px * (xa.z || 0) + py * (ya.z || 0) + pz * (za.z ?? 1)
      };
    }

    function transformDir3D(placement, dir) {
      const dx = dir.x || 0, dy = dir.y || 0, dz = dir.z || 0;
      const xa = placement.xAxis || { x: 1, y: 0, z: 0 };
      const ya = placement.yAxis || { x: 0, y: 1, z: 0 };
      const za = placement.zAxis || { x: 0, y: 0, z: 1 };
      return normalize3({
        x: dx * xa.x + dy * ya.x + dz * za.x,
        y: dx * xa.y + dy * ya.y + dz * za.y,
        z: dx * (xa.z || 0) + dy * (ya.z || 0) + dz * (za.z ?? 1)
      });
    }

    function composePlacements(parent, child) {
      const origin = transformPoint3D(parent, child.origin || { x: 0, y: 0, z: 0 });
      const xAxis = transformDir3D(parent, child.xAxis || { x: 1, y: 0, z: 0 });
      const yAxis = transformDir3D(parent, child.yAxis || { x: 0, y: 1, z: 0 });
      const zAxis = transformDir3D(parent, child.zAxis || { x: 0, y: 0, z: 1 });
      return { origin, xAxis, yAxis, zAxis };
    }

    function getLocalPlacement(refOrId, visited = new Set()) {
      const id = typeof refOrId === 'object' && refOrId?.ref ? refOrId.ref : refOrId;
      const defaultPlacement = {
        origin: { x: 0, y: 0, z: 0 },
        xAxis: { x: 1, y: 0, z: 0 },
        yAxis: { x: 0, y: 1, z: 0 },
        zAxis: { x: 0, y: 0, z: 1 }
      };
      if (!id || visited.has(id)) return defaultPlacement;
      visited.add(id);
      const ent = entities.get(id);
      if (!ent) return defaultPlacement;
      if (ent.type === 'IFCLOCALPLACEMENT') {
        const args = getEntityArgs(ent);
        const parent = args[0] ? getLocalPlacement(args[0], visited) : defaultPlacement;
        const rel = getAxis2Placement(args[1]);
        return composePlacements(parent, rel);
      }
      if (ent.type === 'IFCAXIS2PLACEMENT3D' || ent.type === 'IFCAXIS2PLACEMENT2D') {
        return getAxis2Placement(id);
      }
      return defaultPlacement;
    }

    function transformPoint2D(placement, pt) {
      const p3 = transformPoint3D(placement, pt);
      return { x: p3.x, y: p3.y, z: p3.z };
    }

    function extractCurvePoints(refOrId) {
      const id = typeof refOrId === 'object' && refOrId?.ref ? refOrId.ref : refOrId;
      const ent = entities.get(id);
      if (!ent) return [];
      const args = getEntityArgs(ent);
      if (ent.type === 'IFCPOLYLINE' || ent.type === 'IFCPOLYLOOP') {
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
        const pos = args[2] ? getAxis2Placement(args[2]) : getAxis2Placement(null);
        const xDim = (Number(args[3]) || 0) * unitScale;
        const yDim = (Number(args[4]) || 0) * unitScale;
        const hx = xDim / 2, hy = yDim / 2;
        const localPts = [
          { x: -hx, y: -hy, z: 0 },
          { x: hx, y: -hy, z: 0 },
          { x: hx, y: hy, z: 0 },
          { x: -hx, y: hy, z: 0 }
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

    const angleUnit = detectAngleUnit(entities);

    // Resolve IFCRELDEFINESBYTYPE and IFCRELDEFINESBYPROPERTIES for roof metadata (PredefinedType, Pitch, Slope, Height, Overhang, Thickness)
    const objectToTypeMap = new Map();
    const objectToPsetsMap = new Map();
    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCRELDEFINESBYTYPE') {
        const args = getEntityArgs(ent);
        const relObjs = Array.isArray(args[4]) ? args[4] : [];
        const typeRef = args[5]?.ref;
        if (typeRef) {
          for (const o of relObjs) {
            if (o?.ref) objectToTypeMap.set(o.ref, typeRef);
          }
        }
      } else if (ent.type === 'IFCRELDEFINESBYPROPERTIES') {
        const args = getEntityArgs(ent);
        const relObjs = Array.isArray(args[4]) ? args[4] : [];
        const psetRef = args[5]?.ref;
        if (psetRef) {
          for (const o of relObjs) {
            if (o?.ref) {
              const list = objectToPsetsMap.get(o.ref) || [];
              list.push(psetRef);
              objectToPsetsMap.set(o.ref, list);
            }
          }
        }
      }
    }

    function readRawTypedMeasure(rawArg) {
      if (!rawArg) return { measureType: '', num: null, str: '' };
      const trimmed = String(rawArg).trim();
      const m = trimmed.match(/^([A-Z0-9_]+)\((.*)\)$/i);
      if (m) {
        const inner = m[2].trim();
        const unq = inner.startsWith("'") && inner.endsWith("'") ? inner.slice(1, -1) : inner;
        const n = Number(unq);
        return { measureType: m[1].toUpperCase(), num: Number.isFinite(n) ? n : null, str: unq };
      }
      const unq = trimmed.startsWith("'") && trimmed.endsWith("'") ? trimmed.slice(1, -1) : trimmed;
      const n = Number(unq);
      return { measureType: '', num: Number.isFinite(n) ? n : null, str: unq };
    }

    function collectEntityProperties(entId) {
      const props = {};
      const typeId = objectToTypeMap.get(entId);
      const psetIds = [
        ...(objectToPsetsMap.get(entId) || []),
        ...(typeId ? (objectToPsetsMap.get(typeId) || []) : [])
      ];
      const visited = new Set();
      function scanPropEnt(pid) {
        if (!pid || visited.has(pid)) return;
        visited.add(pid);
        const pEnt = entities.get(pid);
        if (!pEnt) return;
        const pArgs = getEntityArgs(pEnt);
        if (pEnt.type === 'IFCPROPERTYSET') {
          const propList = Array.isArray(pArgs[4]) ? pArgs[4] : [];
          for (const pr of propList) scanPropEnt(pr?.ref);
        } else if (pEnt.type === 'IFCPROPERTYSINGLEVALUE') {
          const pName = String(pArgs[0] || '').trim().toLowerCase();
          const rawValStr = splitTopLevelArgs(pEnt.argsStr)[2];
          const parsed = readRawTypedMeasure(rawValStr);
          if (pName) props[pName] = parsed;
        } else if (pEnt.type === 'IFCELEMENTQUANTITY') {
          const qList = Array.isArray(pArgs[5]) ? pArgs[5] : [];
          for (const qr of qList) scanPropEnt(qr?.ref);
        } else if (pEnt.type === 'IFCQUANTITYLENGTH') {
          const qName = String(pArgs[0] || '').trim().toLowerCase();
          const qVal = Number(pArgs[3]);
          if (qName && Number.isFinite(qVal)) {
            props[qName] = { measureType: 'IFCLENGTHMEASURE', num: qVal, str: String(qVal) };
          }
        }
      }
      for (const pid of psetIds) scanPropEnt(pid);
      return props;
    }

    function resolveRoofStyleKeyword(text) {
      if (!text) return null;
      if (/\.(FLAT_ROOF)\./i.test(text) || /\bflat[\s_-]*roof\b/i.test(text)) return 'flat';
      if (/\.(SHED_ROOF|SINGLE_SLOPE|MONO_PITCH)\./i.test(text) || /\b(mono[\s_-]?pitch|shed|skillion|lean[\s_-]?to|single[\s_-]?slope)\b/i.test(text)) return 'mono';
      if (/\.(GABLE_ROOF|BUTTERFLY_ROOF|GAMBREL_ROOF|BARREL_ROOF|RAINBOW_ROOF)\./i.test(text) || /\b(gable|saddle|duo[\s-]?pitch)\b/i.test(text)) return 'gable';
      if (/\.(HIP_ROOF|HIPPED_GABLE_ROOF|PAVILION_ROOF|MANSARD_ROOF)\./i.test(text) || /\b(hip|hipped|pavilion|mansard|pyramid)\b/i.test(text)) return 'hip';
      if (/\bmulti[\s_-]?gable\b/i.test(text)) return 'multiGable';
      return null;
    }

    function getEntityRoofMetadata(ent, childEnts = []) {
      const typeEnt = objectToTypeMap.get(ent.id) ? entities.get(objectToTypeMap.get(ent.id)) : null;
      const allRelEnts = [ent, ...(typeEnt ? [typeEnt] : []), ...childEnts];
      for (const ce of childEnts) {
        const ct = objectToTypeMap.get(ce.id) ? entities.get(objectToTypeMap.get(ce.id)) : null;
        if (ct) allRelEnts.push(ct);
      }

      let explicitStyle = null;
      for (const re of allRelEnts) {
        const args = getEntityArgs(re);
        const predef = String(args[8] || '');
        const checkTexts = [predef, String(args[2] || ''), String(args[3] || ''), String(args[4] || ''), re.raw || ''];
        for (const t of checkTexts) {
          const st = resolveRoofStyleKeyword(t);
          if (st) {
            explicitStyle = st;
            break;
          }
        }
        if (explicitStyle) break;
      }

      const mergedProps = {};
      for (const re of [ent, ...childEnts]) {
        Object.assign(mergedProps, collectEntityProperties(re.id));
      }

      if (!explicitStyle) {
        for (const k of ['rooftype', 'roofstyle', 'roof shape', 'style', 'type', 'shape']) {
          if (mergedProps[k]?.str) {
            const st = resolveRoofStyleKeyword(mergedProps[k].str) || (/^flat$/i.test(mergedProps[k].str) ? 'flat' : null);
            if (st) { explicitStyle = st; break; }
          }
        }
      }

      let metaPitch = null;
      for (const k of ['pitchangle', 'roofpitch', 'pitch', 'slope', 'roofslope', 'angle']) {
        const pv = mergedProps[k];
        if (!pv || !Number.isFinite(pv.num)) continue;
        let deg = pv.num;
        if (pv.measureType === 'IFCRATIOMEASURE') {
          deg = Math.atan(deg) * (180 / Math.PI);
        } else if (pv.measureType === 'IFCPLANEANGLEMEASURE' || pv.measureType === '') {
          if (angleUnit === 'RADIAN' && deg > 0 && deg <= 1.45) {
            deg = deg * (180 / Math.PI);
          }
        }
        if (deg >= 0 && deg <= 80) {
          metaPitch = Math.round(deg * 10) / 10;
          break;
        }
      }

      let metaRoofAngle = null;
      for (const k of ['ridgeangle', 'roofangle', 'orientation', 'azimuth', 'slopedirection']) {
        const av = mergedProps[k];
        if (!av || !Number.isFinite(av.num)) continue;
        let deg = av.num;
        if (av.measureType === 'IFCPLANEANGLEMEASURE' && angleUnit === 'RADIAN' && Math.abs(deg) <= 6.3 && Math.abs(deg) > 0) {
          deg = deg * (180 / Math.PI);
        }
        metaRoofAngle = deg;
        break;
      }

      let metaThickness = null;
      for (const k of ['thickness', 'depth', 'nominal thickness']) {
        const tv = mergedProps[k];
        if (tv && Number.isFinite(tv.num) && tv.num > 0) {
          const val = tv.num < 5 && unitScale === 1 ? tv.num : tv.num * unitScale;
          if (val >= 20 && val <= 2000) { metaThickness = Math.round(val); break; }
        }
      }

      let metaOverhang = null;
      for (const k of ['overhang', 'eaveoverhang', 'eave overhang', 'projection']) {
        const ov = mergedProps[k];
        if (ov && Number.isFinite(ov.num) && ov.num >= 0) {
          const val = ov.num * unitScale;
          if (val >= 0 && val <= 5000) { metaOverhang = Math.round(val); break; }
        }
      }

      let metaHeight = null;
      for (const k of ['pivotheight', 'pivot height', 'eaveheight', 'eave height', 'roofheight', 'height', 'baseoffset']) {
        const hv = mergedProps[k];
        if (hv && Number.isFinite(hv.num) && hv.num > 100) {
          const val = hv.num * unitScale;
          if (val >= 500 && val <= 50000) { metaHeight = Math.round(val * 10) / 10; break; }
        }
      }

      return { explicitStyle, metaPitch, metaRoofAngle, metaThickness, metaOverhang, metaHeight };
    }
    function getCartesianTransformationOperator(refOrId) {
      const id = typeof refOrId === 'object' && refOrId?.ref ? refOrId.ref : refOrId;
      const ent = entities.get(id);
      if (!ent || !ent.type.startsWith('IFCCARTESIANTRANSFORMATIONOPERATOR')) {
        return {
          origin: { x: 0, y: 0, z: 0 },
          xAxis: { x: 1, y: 0, z: 0 },
          yAxis: { x: 0, y: 1, z: 0 },
          zAxis: { x: 0, y: 0, z: 1 },
          scale: 1
        };
      }
      const args = getEntityArgs(ent);
      const axis1 = getDirection(args[0]) || { x: 1, y: 0, z: 0 };
      const axis2 = getDirection(args[1]);
      const origin = args[2] ? getCartesianPoint(args[2]) : { x: 0, y: 0, z: 0 };
      const scale = Number.isFinite(Number(args[3])) && Number(args[3]) > 0 ? Number(args[3]) : 1;
      let zAxis = getDirection(args[4]) || { x: 0, y: 0, z: 1 };
      let xAxis = normalize3(axis1);
      if (!args[4] && axis2) {
        zAxis = normalize3(cross3(xAxis, axis2));
      }
      const yAxis = normalize3(cross3(zAxis, xAxis));
      xAxis = normalize3(cross3(yAxis, zAxis));
      return { origin, xAxis, yAxis, zAxis, scale };
    }

    function applyOperatorToPlacement(parentPlacement, op) {
      if (!op) return parentPlacement;
      const s = op.scale || 1;
      const scaledOp = {
        origin: op.origin || { x: 0, y: 0, z: 0 },
        xAxis: { x: op.xAxis.x * s, y: op.xAxis.y * s, z: op.xAxis.z * s },
        yAxis: { x: op.yAxis.x * s, y: op.yAxis.y * s, z: op.yAxis.z * s },
        zAxis: { x: op.zAxis.x * s, y: op.zAxis.y * s, z: op.zAxis.z * s }
      };
      return composePlacements(parentPlacement, scaledOp);
    }

    // Collect 3D faces from B-Rep / Surface / Tessellated / MappedItem geometry items
    function collectMeshFaces3D(itemId, placement, visited = new Set()) {
      const id = typeof itemId === 'object' && itemId?.ref ? itemId.ref : itemId;
      if (!id || visited.has(id)) return [];
      visited.add(id);
      const ent = entities.get(id);
      if (!ent) return [];
      const args = getEntityArgs(ent);
      const faces = [];

      if (ent.type === 'IFCMAPPEDITEM') {
        const mapEnt = entities.get(args[0]?.ref || args[0]);
        if (mapEnt && mapEnt.type === 'IFCREPRESENTATIONMAP') {
          const mapArgs = getEntityArgs(mapEnt);
          const mapOrigin = mapArgs[0] ? getAxis2Placement(mapArgs[0]) : getAxis2Placement(null);
          const op = args[1] ? getCartesianTransformationOperator(args[1]) : null;
          const mappedPlacement = composePlacements(applyOperatorToPlacement(placement, op), mapOrigin);
          const repEnt = entities.get(mapArgs[1]?.ref || mapArgs[1]);
          if (repEnt && repEnt.type === 'IFCSHAPEREPRESENTATION') {
            const items = Array.isArray(getEntityArgs(repEnt)[3]) ? getEntityArgs(repEnt)[3] : [];
            for (const subItem of items) {
              faces.push(...collectMeshFaces3D(subItem, mappedPlacement, new Set(visited)));
            }
          }
        }
        return faces;
      }
      if (ent.type === 'IFCPOLYLOOP') {
        const pts = extractCurvePoints(id).map(p => transformPoint3D(placement, p));
        if (pts.length >= 3) faces.push(pts);
        return faces;
      }
      if (ent.type === 'IFCFACE' || ent.type === 'IFCFACESURFACE') {
        const bounds = Array.isArray(args[0]) ? args[0] : [];
        for (const bRef of bounds) {
          const bEnt = entities.get(bRef?.ref || bRef);
          if (bEnt) {
            const bArgs = getEntityArgs(bEnt);
            if (bEnt.type === 'IFCFACEOUTERBOUND' || bounds.length === 1) {
              faces.push(...collectMeshFaces3D(bArgs[0], placement, visited));
            }
          }
        }
        return faces;
      }
      if (ent.type === 'IFCCLOSEDSHELL' || ent.type === 'IFCOPENSHELL' || ent.type === 'IFCCONNECTEDFACESET') {
        const fRefs = Array.isArray(args[0]) ? args[0] : [];
        for (const fRef of fRefs) {
          faces.push(...collectMeshFaces3D(fRef, placement, visited));
        }
        return faces;
      }
      if (ent.type === 'IFCFACETEDBREP' || ent.type === 'IFCSHELLBASEDSURFACEMODEL' || ent.type === 'IFCFACEBASEDSURFACEMODEL') {
        const shells = Array.isArray(args[0]) ? args[0] : [args[0]];
        for (const sRef of shells) {
          faces.push(...collectMeshFaces3D(sRef, placement, visited));
        }
        return faces;
      }
      if (ent.type === 'IFCPOLYGONALFACESET') {
        const coordPts = extractCurvePoints(args[0]).map(p => transformPoint3D(placement, p));
        const pnIndex = Array.isArray(args[3]) ? args[3].map(Number) : null;
        const ptAt = idx1 => {
          const mappedIdx = pnIndex ? pnIndex[Number(idx1) - 1] : Number(idx1);
          return coordPts[mappedIdx - 1];
        };
        const faceRefs = Array.isArray(args[2]) ? args[2] : [];
        for (const fRef of faceRefs) {
          const fEnt = entities.get(fRef?.ref || fRef);
          if (fEnt && (fEnt.type === 'IFCINDEXEDPOLYGONALFACE' || fEnt.type === 'IFCINDEXEDPOLYGONALFACEWITHVOIDS')) {
            const fArgs = getEntityArgs(fEnt);
            const idxs = Array.isArray(fArgs[0]) ? fArgs[0] : [];
            const loop = idxs.map(ptAt).filter(Boolean);
            if (loop.length >= 3) faces.push(loop);
          }
        }
        return faces;
      }
      if (ent.type === 'IFCTRIANGULATEDFACESET') {
        const coordPts = extractCurvePoints(args[0]).map(p => transformPoint3D(placement, p));
        const pnIndex = Array.isArray(args[4]) ? args[4].map(Number) : null;
        const ptAt = idx1 => {
          const mappedIdx = pnIndex ? pnIndex[Number(idx1) - 1] : Number(idx1);
          return coordPts[mappedIdx - 1];
        };
        const tris = Array.isArray(args[3]) ? args[3] : [];
        for (const tri of tris) {
          if (Array.isArray(tri) && tri.length >= 3) {
            const loop = [ptAt(tri[0]), ptAt(tri[1]), ptAt(tri[2])].filter(Boolean);
            if (loop.length === 3) faces.push(loop);
          }
        }
        return faces;
      }
      return faces;
    }

    function faceNewellNormalAndArea(loop) {
      let nx = 0, ny = 0, nz = 0;
      for (let i = 0; i < loop.length; i++) {
        const a = loop[i], b = loop[(i + 1) % loop.length];
        const az = a.z || 0, bz = b.z || 0;
        nx += (a.y - b.y) * (az + bz);
        ny += (az - bz) * (a.x + b.x);
        nz += (a.x - b.x) * (a.y + b.y);
      }
      const len = Math.hypot(nx, ny, nz);
      if (len < 1e-6) return { n: { x: 0, y: 0, z: 0 }, area: 0 };
      return { n: { x: nx / len, y: ny / len, z: nz / len }, area: len * 0.5 };
    }

    function buildExtrudedSolidFaces3D(botPts3D, worldExtDir, depth, includeSides = true) {
      if (!Array.isArray(botPts3D) || botPts3D.length < 3 || !Number.isFinite(depth) || depth <= 0) return [];
      const dx = worldExtDir.x * depth, dy = worldExtDir.y * depth, dz = worldExtDir.z * depth;
      const topPts3D = botPts3D.map(p => ({ x: p.x + dx, y: p.y + dy, z: (p.z || 0) + dz }));
      const { n } = faceNewellNormalAndArea(botPts3D);
      const dot = n.x * worldExtDir.x + n.y * worldExtDir.y + n.z * worldExtDir.z;
      // Ensure outward normals: bottom points opposite extDir, top points along extDir
      const botLoop = dot > 0 ? [...botPts3D].reverse() : [...botPts3D];
      const topLoop = dot > 0 ? [...topPts3D] : [...topPts3D].reverse();
      const faces = [botLoop, topLoop];
      if (includeSides) {
        const sideBase = dot > 0 ? [...botPts3D] : [...botPts3D].reverse();
        const sideTop = dot > 0 ? [...topPts3D] : [...topPts3D].reverse();
        for (let i = 0; i < sideBase.length; i++) {
          const j = (i + 1) % sideBase.length;
          faces.push([sideBase[i], sideBase[j], sideTop[j], sideTop[i]]);
        }
      }
      return faces;
    }

    // Extract outer 2D boundary from projected 3D top faces (cancels shared interior ridge/hip/valley/triangulation edges; preserves concave L/T/U shapes)
    function extractOuterFootprint2D(faceLoops3D) {
      if (!Array.isArray(faceLoops3D) || faceLoops3D.length === 0) return null;
      const cleanLoops = faceLoops3D
        .map(lp => cleanPolygon2D(lp.map(p => ({ x: p.x, y: p.y }))))
        .filter(lp => lp.length >= 3 && Math.abs(polygonSignedArea2D(lp)) > 100);
      if (cleanLoops.length === 0) return null;
      if (cleanLoops.length === 1) {
        const single = cleanLoops[0];
        return polygonSignedArea2D(single) < 0 ? [...single].reverse() : single;
      }

      // Ensure all faces are CCW in XY
      const ccwLoops = cleanLoops.map(lp => (polygonSignedArea2D(lp) < 0 ? [...lp].reverse() : lp));
      const allVerts = ccwLoops.flat();

      // Split any face edge at another face's vertex that lies on that segment (resolves T-junctions)
      const directedEdges = [];
      for (const lp of ccwLoops) {
        for (let i = 0; i < lp.length; i++) {
          const a = lp[i], b = lp[(i + 1) % lp.length];
          const ex = b.x - a.x, ey = b.y - a.y, l2 = ex * ex + ey * ey;
          if (l2 < 1) continue;
          const l = Math.sqrt(l2);
          const splits = [{ t: 0, p: a }, { t: 1, p: b }];
          for (const v of allVerts) {
            const t = ((v.x - a.x) * ex + (v.y - a.y) * ey) / l2;
            if (t > 0.001 && t < 0.999) {
              const px = a.x + t * ex, py = a.y + t * ey;
              if (Math.hypot(v.x - px, v.y - py) < 2.0) {
                splits.push({ t, p: { x: v.x, y: v.y } });
              }
            }
          }
          splits.sort((u, v) => u.t - v.t);
          for (let k = 0; k < splits.length - 1; k++) {
            const p = splits[k].p, q = splits[k + 1].p;
            if (Math.hypot(q.x - p.x, q.y - p.y) >= 1) {
              directedEdges.push({ a: p, b: q });
            }
          }
        }
      }

      // Snap vertices onto a 2mm grid key so matching opposing edges cancel identically
      const vKey = p => `${Math.round(p.x / 2)}_${Math.round(p.y / 2)}`;
      const edgeMap = new Map();
      const boundaryEdges = [];
      const removedIdx = new Set();
      for (let i = 0; i < directedEdges.length; i++) {
        const e = directedEdges[i];
        const ka = vKey(e.a), kb = vKey(e.b);
        if (ka === kb) { removedIdx.add(i); continue; }
        const revKey = `${kb}->${ka}`;
        const revList = edgeMap.get(revKey);
        if (revList && revList.length > 0) {
          const partnerIdx = revList.pop();
          removedIdx.add(partnerIdx);
          removedIdx.add(i);
        } else {
          const fwdKey = `${ka}->${kb}`;
          if (!edgeMap.has(fwdKey)) edgeMap.set(fwdKey, []);
          edgeMap.get(fwdKey).push(i);
        }
      }
      for (let i = 0; i < directedEdges.length; i++) {
        if (!removedIdx.has(i)) boundaryEdges.push(directedEdges[i]);
      }
      if (boundaryEdges.length < 3) return null;

      // Chain directed boundary edges into outer closed loop
      const adj = new Map();
      for (const e of boundaryEdges) {
        const ka = vKey(e.a);
        if (!adj.has(ka)) adj.set(ka, []);
        adj.get(ka).push(e);
      }
      const used = new Set();
      let bestLoop = null;
      let bestArea = 0;
      for (const startEdge of boundaryEdges) {
        if (used.has(startEdge)) continue;
        const loop = [startEdge.a];
        let cur = startEdge;
        used.add(cur);
        let guard = 0;
        while (guard++ < boundaryEdges.length + 2) {
          const nextKey = vKey(cur.b);
          if (nextKey === vKey(startEdge.a)) {
            const cleaned = cleanPolygon2D(loop);
            const area = Math.abs(polygonSignedArea2D(cleaned));
            if (cleaned.length >= 3 && area > bestArea) {
              bestArea = area;
              bestLoop = cleaned;
            }
            break;
          }
          const cands = (adj.get(nextKey) || []).filter(ne => !used.has(ne));
          if (!cands.length) break;
          // Pick sharpest right/left outer boundary turn if multiple loops touch at a vertex
          let nextEdge = cands[0];
          if (cands.length > 1) {
            const inAngle = Math.atan2(cur.b.y - cur.a.y, cur.b.x - cur.a.x);
            nextEdge = cands.slice().sort((e1, e2) => {
              const a1 = ((Math.atan2(e1.b.y - e1.a.y, e1.b.x - e1.a.x) - inAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
              const a2 = ((Math.atan2(e2.b.y - e2.a.y, e2.b.x - e2.a.x) - inAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
              return a1 - a2;
            })[0];
          }
          loop.push(nextEdge.a);
          used.add(nextEdge);
          cur = nextEdge;
        }
      }
      return bestLoop && bestLoop.length >= 3 ? bestLoop : null;
    }

    // Unwrap IFCBOOLEANCLIPPINGRESULT / IFCBOOLEANRESULT to extract base solid + roof clipping planes
    function unwrapBooleanClipping(itemRefOrId, placement) {
      let curId = typeof itemRefOrId === 'object' && itemRefOrId?.ref ? itemRefOrId.ref : itemRefOrId;
      const clipPlanes = [];
      let guard = 0;
      while (curId && guard++ < 16) {
        const ent = entities.get(curId);
        if (!ent || (ent.type !== 'IFCBOOLEANCLIPPINGRESULT' && ent.type !== 'IFCBOOLEANRESULT')) break;
        const args = getEntityArgs(ent);
        const op1 = args[1]?.ref || args[1];
        const op2 = args[2]?.ref || args[2];
        const op2Ent = entities.get(op2);
        if (op2Ent && (op2Ent.type === 'IFCHALFSPACESOLID' || op2Ent.type === 'IFCPOLYGONALBOUNDEDHALFSPACE')) {
          const hsArgs = getEntityArgs(op2Ent);
          const agree = String(hsArgs[1] ?? '.F.').toUpperCase().includes('T');
          const surfEnt = entities.get(hsArgs[0]?.ref || hsArgs[0]);
          if (surfEnt && surfEnt.type === 'IFCPLANE') {
            const plArgs = getEntityArgs(surfEnt);
            const plPos = composePlacements(placement, getAxis2Placement(plArgs[0]));
            const rawNormal = plPos.zAxis || { x: 0, y: 0, z: 1 };
            let normal = rawNormal;
            if (normal.z < 0) normal = { x: -normal.x, y: -normal.y, z: -normal.z };
            const horiz = Math.hypot(normal.x, normal.y);
            if (Math.abs(normal.z) > 0.15) {
              const pitchDeg = Math.atan2(horiz, Math.abs(normal.z)) * (180 / Math.PI);
              if (pitchDeg >= 0 && pitchDeg <= 80) {
                clipPlanes.push({ origin: plPos.origin, rawNormal, normal, agree, pitchDeg });
              }
            }
          }
        }
        curId = op1;
      }
      return { baseId: curId, clipPlanes };
    }

    function extractProductGeometry(shapeRefOrId, placement, optionsGeom = {}) {
      const id = typeof shapeRefOrId === 'object' && shapeRefOrId?.ref ? shapeRefOrId.ref : shapeRefOrId;
      const ent = entities.get(id);
      if (!ent) return null;

      if (ent.type === 'IFCPOLYLINE') {
        const pts = extractCurvePoints(id).map(p => transformPoint3D(placement, p));
        return { axisPoints: pts, polyPoints: pts, height: null, thickness: null, meshFaces3D: [], clipPlanes: [] };
      }

      const args = getEntityArgs(ent);
      const repRefs = ent.type === 'IFCPRODUCTDEFINITIONSHAPE'
        ? (Array.isArray(args[2]) ? args[2] : [])
        : [{ ref: id }];

      let axisPoints = null;
      let polyPoints = null;
      let footPrintPoints = null;
      let height = null;
      let thickness = null;
      let width = null;
      let openingWidth = null;
      let openingHeight = null;
      let isGableProfile = false;
      let isClippedByRoof = false;
      let gablePitch = null;
      let gablePeakRise = null;
      let gablePeakRatio = null;
      let eaveHeight = null;
      let leftHeight = null;
      let rightHeight = null;
      let minElevationZ = null;
      let detectedPitch = null;
      let detectedRoofAngle = null;
      let detectedUpslopeDir = null;
      const meshPoints3D = [];
      const meshFaces3D = [];
      const allClipPlanes = [];

      function processShapeItem(rawItemId, curPlacement, repIdentifier = '') {
        const { baseId, clipPlanes } = unwrapBooleanClipping(rawItemId, curPlacement);
        if (clipPlanes.length > 0) {
          isClippedByRoof = true;
          allClipPlanes.push(...clipPlanes);
          const pitchedClips = clipPlanes.filter(c => c.pitchDeg >= 0.8);
          if (pitchedClips.length > 0) {
            const avgPitch = pitchedClips.reduce((s, c) => s + c.pitchDeg, 0) / pitchedClips.length;
            gablePitch = Math.round(avgPitch * 10) / 10;
          }
        }

        const itemEnt = entities.get(baseId);
        if (!itemEnt) return;

        if (itemEnt.type === 'IFCMAPPEDITEM') {
          const mArgs = getEntityArgs(itemEnt);
          const mapEnt = entities.get(mArgs[0]?.ref || mArgs[0]);
          if (mapEnt && mapEnt.type === 'IFCREPRESENTATIONMAP') {
            const mapArgs = getEntityArgs(mapEnt);
            const mapOrigin = mapArgs[0] ? getAxis2Placement(mapArgs[0]) : getAxis2Placement(null);
            const op = mArgs[1] ? getCartesianTransformationOperator(mArgs[1]) : null;
            const mappedPlacement = composePlacements(applyOperatorToPlacement(curPlacement, op), mapOrigin);
            const mappedRep = entities.get(mapArgs[1]?.ref || mapArgs[1]);
            if (mappedRep && mappedRep.type === 'IFCSHAPEREPRESENTATION') {
              const mRepArgs = getEntityArgs(mappedRep);
              const mId = String(mRepArgs[1] || repIdentifier || '');
              const mItems = Array.isArray(mRepArgs[3]) ? mRepArgs[3] : [];
              for (const subRef of mItems) processShapeItem(subRef?.ref || subRef, mappedPlacement, mId);
            }
          }
          return;
        }

        if (itemEnt.type === 'IFCGEOMETRICCURVESET' || itemEnt.type === 'IFCGEOMETRICSET') {
          const gArgs = getEntityArgs(itemEnt);
          const elementsList = Array.isArray(gArgs[0]) ? gArgs[0] : [];
          for (const subRef of elementsList) processShapeItem(subRef?.ref || subRef, curPlacement, repIdentifier);
          return;
        }

        if (itemEnt.type === 'IFCPOLYLINE' || itemEnt.type === 'IFCTRIMMEDCURVE' || itemEnt.type === 'IFCCOMPOSITECURVE' || itemEnt.type === 'IFCINDEXEDPOLYCURVE') {
          const pts = extractCurvePoints(itemEnt.id).map(p => transformPoint3D(curPlacement, p));
          if (pts.length >= 2) {
            axisPoints = pts;
            if (/footprint|annotation/i.test(repIdentifier) && pts.length >= 3) {
              const cleaned = cleanPolygon2D(pts);
              if (cleaned.length >= 3) footPrintPoints = cleaned;
            }
          }
          return;
        }

        if (itemEnt.type === 'IFCEXTRUDEDAREASOLID') {
          const solidArgs = getEntityArgs(itemEnt);
          const prof = extractProfileInfo(solidArgs[0]);
          const solidPos = solidArgs[1] ? getAxis2Placement(solidArgs[1]) : getAxis2Placement(null);
          const combinedPlacement = composePlacements(curPlacement, solidPos);
          const extDir = getDirection(solidArgs[2]) || { x: 0, y: 0, z: 1 };
          const worldExtDir = transformDir3D(combinedPlacement, extDir);
          const depth = (Number(solidArgs[3]) || 0) * unitScale;

          if (prof?.points?.length >= 3 && depth > 0) {
            const wPts3D = prof.points.map(p => transformPoint3D(combinedPlacement, p));
            if (optionsGeom.collectSolidFaces) {
              // For vertical/normal slab extrusions, bot/top loops are the roof surfaces; sides are thin fascia edges.
              // Only emit side quads when extruded horizontally along a ridge (profile is a vertical cross-section).
              const includeSides = Math.abs(worldExtDir.z) < 0.35;
              const solidFaces = buildExtrudedSolidFaces3D(wPts3D, worldExtDir, depth, includeSides);
              meshFaces3D.push(...solidFaces);
            }
          }

          // Check if extrusion is horizontal (e.g., a vertical gable wall elevation profile extruded by wall thickness)
          const isHorizontalExtrusion = Math.abs(worldExtDir.z) < 0.35 && depth >= 40 && depth <= 600 && !optionsGeom.collectSolidFaces;
          // Detect any sloped plane extrusion from 1° to 80° (cos(1°)=0.99985, cos(80°)=0.1736)
          let slabNormal = combinedPlacement.zAxis || { x: 0, y: 0, z: 1 };
          if (slabNormal.z < 0) slabNormal = { x: -slabNormal.x, y: -slabNormal.y, z: -slabNormal.z };
          const isSlopedPlaneExtrusion = Math.abs(slabNormal.z) > 0.15 && Math.abs(slabNormal.z) < 0.99985;

          if (isSlopedPlaneExtrusion) {
            const nz = Math.abs(slabNormal.z);
            const nh = Math.hypot(slabNormal.x, slabNormal.y);
            const slopeDeg = Math.atan2(nh, nz) * (180 / Math.PI);
            if (slopeDeg >= 0.8 && slopeDeg <= 80 && nh > 1e-6) {
              detectedPitch = Math.round(slopeDeg * 10) / 10;
              const ux = -slabNormal.x / nh;
              const uy = -slabNormal.y / nh;
              detectedUpslopeDir = { ux, uy };
              const rawAngle = (Math.atan2(-ux, uy) * 180) / Math.PI;
              detectedRoofAngle = ((Math.round(rawAngle * 10) / 10 % 360) + 360) % 360;
            }
          }

          if (isHorizontalExtrusion && prof && prof.points && prof.points.length >= 3) {
            thickness = Math.round(depth);
            const profYs = prof.points.map(p => p.y || 0);
            const flipProfileY = (combinedPlacement.yAxis?.z || 0) < -0.1 && Math.min(...profYs) >= -50 && Math.max(...profYs) > 150;
            const profilePlacement = flipProfileY
              ? {
                  ...combinedPlacement,
                  yAxis: {
                    x: -combinedPlacement.yAxis.x,
                    y: -combinedPlacement.yAxis.y,
                    z: -combinedPlacement.yAxis.z
                  }
                }
              : combinedPlacement;
            const wPts3D = prof.points.map(p => transformPoint3D(profilePlacement, p));
            meshPoints3D.push(...wPts3D);
            const zs = wPts3D.map(p => p.z || 0);
            const minZ = Math.min(...zs), maxZ = Math.max(...zs);
            minElevationZ = minElevationZ === null ? minZ : Math.min(minElevationZ, minZ);
            const totalH = maxZ - minZ;

            let maxPairDist = 0, pStart = wPts3D[0], pEnd = wPts3D[1];
            if (axisPoints && axisPoints.length >= 2) {
              pStart = axisPoints[0];
              pEnd = axisPoints[axisPoints.length - 1];
              maxPairDist = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
            }
            if (maxPairDist <= 100) {
              for (let i = 0; i < wPts3D.length; i++) {
                for (let j = i + 1; j < wPts3D.length; j++) {
                  const d = Math.hypot(wPts3D[j].x - wPts3D[i].x, wPts3D[j].y - wPts3D[i].y);
                  if (d > maxPairDist) {
                    maxPairDist = d;
                    pStart = wPts3D[i];
                    pEnd = wPts3D[j];
                  }
                }
              }
              if (maxPairDist > 100) {
                axisPoints = [{ x: pStart.x, y: pStart.y, z: minZ }, { x: pEnd.x, y: pEnd.y, z: minZ }];
              }
            }

            if (maxPairDist > 100 && totalH > 100) {
              const dx = pEnd.x - pStart.x, dy = pEnd.y - pStart.y;
              const lenSq = maxPairDist * maxPairDist;
              const projPts = wPts3D.map(p => ({
                uRatio: Math.max(0, Math.min(1, ((p.x - pStart.x) * dx + (p.y - pStart.y) * dy) / lenSq)),
                hVal: Math.max(0, (p.z || 0) - minZ)
              }));
              const leftCands = projPts.filter(p => p.uRatio <= 0.08).map(p => p.hVal);
              const rightCands = projPts.filter(p => p.uRatio >= 0.92).map(p => p.hVal);
              const leftH = leftCands.length ? Math.max(...leftCands) : 0;
              const rightH = rightCands.length ? Math.max(...rightCands) : 0;
              const apexPt = projPts.reduce((best, cur) => (cur.hVal > best.hVal ? cur : best), projPts[0]);
              const isPeaked = totalH > Math.max(leftH, rightH) + 40;
              const isRaked = Math.abs(leftH - rightH) > 60;

              if (prof.points.length === 3 || isPeaked || isRaked) {
                isGableProfile = true;
                const minEndH = Math.min(leftH, rightH);
                eaveHeight = minEndH >= 150 ? Math.round(minEndH) : 0;
                leftHeight = Math.round(leftH);
                rightHeight = Math.round(rightH);
                gablePeakRise = Math.max(60, Math.round(totalH - eaveHeight));
                gablePeakRatio = isPeaked
                  ? Math.max(0.05, Math.min(0.95, Math.round(apexPt.uRatio * 1000) / 1000))
                  : (rightH >= leftH ? 1 : 0);
                height = eaveHeight >= 150 ? eaveHeight : Math.round(totalH);
                const slopeRun = (gablePeakRatio <= 0.03 || gablePeakRatio >= 0.97)
                  ? maxPairDist
                  : Math.max(gablePeakRatio * maxPairDist, (1 - gablePeakRatio) * maxPairDist);
                if (slopeRun > 100) {
                  gablePitch = Math.round(Math.atan2(gablePeakRise, slopeRun) * (180 / Math.PI) * 10) / 10;
                }
              } else {
                height = Math.round(totalH);
              }
            } else if (totalH > 100) {
              height = Math.round(totalH);
            }
          } else {
            if (depth > 10 && !optionsGeom.collectSolidFaces) height = depth;
            if (depth >= 20 && depth <= 2000 && optionsGeom.collectSolidFaces && !thickness) {
              // Extrusion thickness perpendicular to slab plane
              thickness = Math.round(depth);
            }
            if (prof) {
              if (prof.kind === 'rect') {
                const d1 = prof.xDim, d2 = prof.yDim;
                openingWidth = d1;
                openingHeight = d2;
                if (!optionsGeom.collectSolidFaces) {
                  thickness = Math.min(d1, d2);
                }
                width = Math.max(d1, d2);
                const wPts = prof.points.map(p => transformPoint3D(combinedPlacement, p));
                polyPoints = wPts;
                meshPoints3D.push(...wPts);
                if (depth > 0) {
                  meshPoints3D.push(...wPts.map(p => ({ x: p.x + worldExtDir.x * depth, y: p.y + worldExtDir.y * depth, z: (p.z || 0) + worldExtDir.z * depth })));
                }
                if (!axisPoints || axisPoints.length < 2) {
                  if (d1 >= d2) {
                    const pA = transformPoint2D(prof.pos, { x: -d1 / 2, y: 0 });
                    const pB = transformPoint2D(prof.pos, { x: d1 / 2, y: 0 });
                    axisPoints = [transformPoint3D(combinedPlacement, pA), transformPoint3D(combinedPlacement, pB)];
                  } else {
                    const pA = transformPoint2D(prof.pos, { x: 0, y: -d2 / 2 });
                    const pB = transformPoint2D(prof.pos, { x: 0, y: d2 / 2 });
                    axisPoints = [transformPoint3D(combinedPlacement, pA), transformPoint3D(combinedPlacement, pB)];
                  }
                }
              } else if (prof.kind === 'poly' && prof.points.length >= 3) {
                const wPts = prof.points.map(p => transformPoint3D(combinedPlacement, p));
                polyPoints = wPts;
                meshPoints3D.push(...wPts);
                if (depth > 0) {
                  meshPoints3D.push(...wPts.map(p => ({ x: p.x + worldExtDir.x * depth, y: p.y + worldExtDir.y * depth, z: (p.z || 0) + worldExtDir.z * depth })));
                }
                if (wPts.length === 4 && !optionsGeom.collectSolidFaces) {
                  const l01 = Math.hypot(wPts[1].x - wPts[0].x, wPts[1].y - wPts[0].y);
                  const l12 = Math.hypot(wPts[2].x - wPts[1].x, wPts[2].y - wPts[1].y);
                  if (l01 > l12 * 1.5) {
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
          return;
        }

        // 3D B-Rep, Surface Model, PolygonalFaceSet, TriangulatedFaceSet, or PolyLoop
        const faces = collectMeshFaces3D(itemEnt.id, curPlacement);
        if (faces.length > 0) {
          meshFaces3D.push(...faces);
          let areaSum = 0, weightedPitchSum = 0;
          let domUx = 0, domUy = 0, maxSlopeArea = 0;
          for (const loop of faces) {
            meshPoints3D.push(...loop);
            if (loop.length >= 3) {
              const { n, area } = faceNewellNormalAndArea(loop);
              if (area < 50) continue;
              const un = n.z < 0 ? { x: -n.x, y: -n.y, z: -n.z } : n;
              const nh = Math.hypot(un.x, un.y);
              if (un.z > 0.15 && un.z < 0.99985 && nh > 1e-4) {
                const deg = Math.atan2(nh, un.z) * (180 / Math.PI);
                if (deg >= 0.8 && deg <= 80) {
                  areaSum += area;
                  weightedPitchSum += deg * area;
                  if (area > maxSlopeArea) {
                    maxSlopeArea = area;
                    domUx = -un.x / nh;
                    domUy = -un.y / nh;
                  }
                }
              }
            }
          }
          if (areaSum > 0 && detectedPitch === null) {
            detectedPitch = Math.round((weightedPitchSum / areaSum) * 10) / 10;
            detectedUpslopeDir = { ux: domUx, uy: domUy };
            const rawAngle = (Math.atan2(-domUx, domUy) * 180) / Math.PI;
            detectedRoofAngle = ((Math.round(rawAngle * 10) / 10 % 360) + 360) % 360;
          }
        }
      }

      for (const rRef of repRefs) {
        const repEnt = entities.get(rRef?.ref || rRef);
        if (!repEnt || repEnt.type !== 'IFCSHAPEREPRESENTATION') continue;
        const repArgs = getEntityArgs(repEnt);
        const repId = String(repArgs[1] || '');
        const items = Array.isArray(repArgs[3]) ? repArgs[3] : [];
        for (const itemRef of items) {
          processShapeItem(itemRef?.ref || itemRef, placement, repId);
        }
      }

      if (footPrintPoints && footPrintPoints.length >= 3) {
        polyPoints = footPrintPoints;
      }

      // If 3D mesh points were collected (from B-Rep roof or B-Rep gable wall), derive polyPoints / height / axisPoints / gable envelope
      if (meshPoints3D.length >= 3) {
        const zs = meshPoints3D.map(p => p.z || 0);
        const minZ = Math.min(...zs), maxZ = Math.max(...zs);
        minElevationZ = minElevationZ === null ? minZ : Math.min(minElevationZ, minZ);
        if (!height && maxZ - minZ > 100 && !optionsGeom.collectSolidFaces) {
          height = Math.round(maxZ - minZ);
        }
        if (!polyPoints || polyPoints.length < 3) {
          const hull = computeConvexHull2D(meshPoints3D);
          if (hull.length >= 3) polyPoints = hull;
        }
        if ((!axisPoints || axisPoints.length < 2) && !optionsGeom.collectSolidFaces) {
          // Find optimal 2D wall axis direction (supporting both axis-aligned and rotated B-Rep walls)
          const candDirs = [{ ux: 1, uy: 0 }, { ux: 0, uy: 1 }];
          if (polyPoints && polyPoints.length >= 3) {
            for (let i = 0; i < polyPoints.length; i++) {
              const p0 = polyPoints[i], p1 = polyPoints[(i + 1) % polyPoints.length];
              const d = Math.hypot(p1.x - p0.x, p1.y - p0.y);
              if (d > 200) candDirs.push({ ux: (p1.x - p0.x) / d, uy: (p1.y - p0.y) / d });
            }
          }
          let bestDir = null, bestSpanV = Infinity;
          for (const dir of candDirs) {
            const us = meshPoints3D.map(p => p.x * dir.ux + p.y * dir.uy);
            const vs = meshPoints3D.map(p => -p.x * dir.uy + p.y * dir.ux);
            const minU = Math.min(...us), maxU = Math.max(...us);
            const minV = Math.min(...vs), maxV = Math.max(...vs);
            const spanU = maxU - minU, spanV = maxV - minV;
            if (spanU > 500 && spanV <= 600 && spanU > spanV * 1.5 && spanV < bestSpanV) {
              bestSpanV = spanV;
              const midV = (minV + maxV) / 2;
              bestDir = {
                spanV,
                a: { x: dir.ux * minU - dir.uy * midV, y: dir.uy * minU + dir.ux * midV, z: minZ },
                b: { x: dir.ux * maxU - dir.uy * midV, y: dir.uy * maxU + dir.ux * midV, z: minZ }
              };
            }
          }
          if (bestDir) {
            thickness = thickness || Math.max(89, Math.round(bestDir.spanV));
            axisPoints = [bestDir.a, bestDir.b];
          }
        }

        // Extract upper Z envelope along wall axis for B-Rep / TriangulatedFaceSet / PolygonalFaceSet gable or raked walls
        if (!isGableProfile && !isClippedByRoof && !optionsGeom.collectSolidFaces && axisPoints && axisPoints.length >= 2) {
          const pA = axisPoints[0], pB = axisPoints[axisPoints.length - 1];
          const dx = pB.x - pA.x, dy = pB.y - pA.y;
          const axisLen = Math.hypot(dx, dy);
          const totalH = maxZ - minZ;
          if (axisLen > 300 && totalH > 200) {
            const lenSq = axisLen * axisLen;
            const projPts = meshPoints3D.map(p => ({
              uRatio: Math.max(0, Math.min(1, ((p.x - pA.x) * dx + (p.y - pA.y) * dy) / lenSq)),
              hVal: Math.max(0, (p.z || 0) - minZ)
            }));
            const leftCands = projPts.filter(p => p.uRatio <= 0.08).map(p => p.hVal);
            const rightCands = projPts.filter(p => p.uRatio >= 0.92).map(p => p.hVal);
            const leftH = leftCands.length ? Math.max(...leftCands) : 0;
            const rightH = rightCands.length ? Math.max(...rightCands) : 0;
            const apexPt = projPts.reduce((best, cur) => (cur.hVal > best.hVal ? cur : best), projPts[0]);
            const isPeaked = totalH > Math.max(leftH, rightH) + 40 && apexPt.uRatio > 0.05 && apexPt.uRatio < 0.95;
            const isRaked = Math.abs(leftH - rightH) > 60;
            if (isPeaked || isRaked) {
              isGableProfile = true;
              const minEndH = Math.min(leftH, rightH);
              eaveHeight = minEndH >= 150 ? Math.round(minEndH) : 0;
              leftHeight = Math.round(leftH);
              rightHeight = Math.round(rightH);
              gablePeakRise = Math.max(60, Math.round(totalH - eaveHeight));
              gablePeakRatio = isPeaked
                ? Math.max(0.05, Math.min(0.95, Math.round(apexPt.uRatio * 1000) / 1000))
                : (rightH >= leftH ? 1 : 0);
              height = eaveHeight >= 150 ? eaveHeight : Math.round(totalH);
              const slopeRun = (gablePeakRatio <= 0.03 || gablePeakRatio >= 0.97)
                ? axisLen
                : Math.max(gablePeakRatio * axisLen, (1 - gablePeakRatio) * axisLen);
              if (slopeRun > 100) {
                gablePitch = Math.round(Math.atan2(gablePeakRise, slopeRun) * (180 / Math.PI) * 10) / 10;
              }
            }
          }
        }
      }

      return {
        axisPoints,
        polyPoints,
        footPrintPoints,
        height,
        thickness,
        width,
        openingWidth,
        openingHeight,
        isGableProfile,
        isClippedByRoof,
        gablePitch: gablePitch ?? detectedPitch,
        gablePeakRise,
        gablePeakRatio,
        eaveHeight,
        leftHeight,
        rightHeight,
        minElevationZ,
        detectedPitch,
        detectedRoofAngle,
        detectedUpslopeDir,
        meshPoints3D,
        meshFaces3D,
        clipPlanes: allClipPlanes
      };
    }

    // Helper: extract fallback 3D Cartesian points referenced anywhere in an entity's subgraph (same way walls work)
    function collectSubgraphPoints(ent, placement, maxDepth = 5) {
      const visited = new Set();
      const pts = [];
      function walk(id, depth) {
        if (!id || visited.has(id) || depth > maxDepth) return;
        visited.add(id);
        const e = entities.get(id);
        if (!e) return;
        if (e.type === 'IFCCARTESIANPOINT') {
          const p = getCartesianPoint(id);
          if (Math.abs(p.x) > 0.001 || Math.abs(p.y) > 0.001 || Math.abs(p.z) > 0.001) {
            pts.push(transformPoint3D(placement, p));
          }
          return;
        }
        const refs = [...(e.raw || '').matchAll(/#(\d+)/g)].map(m => parseInt(m[1], 10));
        for (const r of refs) walk(r, depth + 1);
      }
      walk(ent.id, 0);
      return pts;
    }

    // Build IFCRELAGGREGATES map (used when IFCROOF decomposes into child IFCSLAB roof planes or wall assemblies)
    const relAggregatesMap = new Map();
    const childAggregatedInParent = new Map();
    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCRELAGGREGATES') {
        const args = getEntityArgs(ent);
        const parentId = args[4]?.ref;
        const childRefs = Array.isArray(args[5]) ? args[5] : [];
        if (parentId && childRefs.length > 0) {
          const list = relAggregatesMap.get(parentId) || [];
          for (const cRef of childRefs) {
            if (cRef?.ref) {
              list.push(cRef.ref);
              childAggregatedInParent.set(cRef.ref, parentId);
            }
          }
          relAggregatesMap.set(parentId, list);
        }
      }
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
        const wallRef = args[4]?.ref || args[4];
        const openingRef = args[5]?.ref || args[5];
        if (wallRef && openingRef) voidToWall.set(String(openingRef), String(wallRef));
      } else if (ent.type === 'IFCRELFILLSELEMENT') {
        const args = getEntityArgs(ent);
        const openingRef = args[4]?.ref || args[4];
        const fillRef = args[5]?.ref || args[5];
        if (openingRef && fillRef) fillToVoid.set(String(fillRef), String(openingRef));
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
    const upperTriangularGableWalls = [];
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
      } else if (geom?.meshPoints3D && geom.meshPoints3D.length >= 2) {
        let maxD = 0, p1 = geom.meshPoints3D[0], p2 = geom.meshPoints3D[1];
        for (let i = 0; i < geom.meshPoints3D.length; i++) {
          for (let j = i + 1; j < geom.meshPoints3D.length; j++) {
            const d = Math.hypot(geom.meshPoints3D[j].x - geom.meshPoints3D[i].x, geom.meshPoints3D[j].y - geom.meshPoints3D[i].y);
            if (d > maxD) { maxD = d; p1 = geom.meshPoints3D[i]; p2 = geom.meshPoints3D[j]; }
          }
        }
        if (maxD > 100) {
          a = { x: p1.x, y: p1.y };
          b = { x: p2.x, y: p2.y };
        }
      }
      if ((!a || !b || Math.hypot(b.x - a.x, b.y - a.y) < 50) && placement?.origin) {
        const dirX = placement.xAxis?.x || 1;
        const dirY = placement.xAxis?.y || 0;
        a = { x: placement.origin.x, y: placement.origin.y };
        b = { x: placement.origin.x + dirX * 3000, y: placement.origin.y + dirY * 3000 };
      }

      if (!a || !b || Math.hypot(b.x - a.x, b.y - a.y) < 50) continue;

      const wLen = Math.hypot(b.x - a.x, b.y - a.y);
      const rawThk = geom?.thickness && geom.thickness >= 40 && geom.thickness <= 600 ? Math.round(geom.thickness) : null;
      const isInterior = /(interior|partition|internal)/i.test(ent.raw) || (rawThk !== null && rawThk < 130);
      const isExt = !isInterior;
      const thickness = rawThk !== null ? rawThk : (isExt ? 140 : 100);
      const studDepth = Math.min(thickness, isExt ? 140 : 89);

      // Evaluate exact 3D boolean clip planes along wall centerline (a -> b) when wall is clipped by roof planes
      let clippedProfile = null;
      if (geom?.isClippedByRoof && Array.isArray(geom.clipPlanes) && geom.clipPlanes.length > 0) {
        const pitchedPlanes = geom.clipPlanes.filter(cp => cp.pitchDeg >= 0.8 && Math.abs(cp.rawNormal?.z || cp.normal?.z || 0) > 0.15);
        if (pitchedPlanes.length > 0) {
          const baseZ = Number.isFinite(geom.minElevationZ) ? geom.minElevationZ : (placement.origin?.z || 0);
          const rawExtrusionH = Number.isFinite(geom.height) && geom.height > 200 ? geom.height : 12000;
          const samples = 40;
          const hs = [];
          for (let k = 0; k <= samples; k++) {
            const ratio = k / samples;
            const px = a.x + (b.x - a.x) * ratio;
            const py = a.y + (b.y - a.y) * ratio;
            let zTop = baseZ + rawExtrusionH;
            for (const cp of pitchedPlanes) {
              const rn = cp.rawNormal || cp.normal;
              const zPlane = cp.origin.z - (rn.x * (px - cp.origin.x) + rn.y * (py - cp.origin.y)) / rn.z;
              if (Number.isFinite(zPlane) && zPlane > baseZ + 50) {
                zTop = Math.min(zTop, zPlane);
              }
            }
            hs.push(Math.max(0, zTop - baseZ));
          }
          const leftH = hs[0], rightH = hs[samples];
          let maxH = -Infinity, maxIdx = 0;
          for (let k = 0; k <= samples; k++) {
            if (hs[k] > maxH) {
              maxH = hs[k];
              maxIdx = k;
            }
          }
          const minEndH = Math.min(leftH, rightH);
          if (maxH - minEndH > 40 && maxH > 300) {
            const cEaveH = minEndH >= 150 ? Math.round(minEndH) : 0;
            const cRise = Math.round(maxH - cEaveH);
            const isPeaked = maxH > Math.max(leftH, rightH) + 30 && maxIdx > 1 && maxIdx < samples - 1;
            const cPeakRatio = isPeaked ? Math.round((maxIdx / samples) * 1000) / 1000 : (rightH >= leftH ? 1 : 0);
            const slopeRun = (cPeakRatio <= 0.03 || cPeakRatio >= 0.97)
              ? wLen
              : Math.max(cPeakRatio * wLen, (1 - cPeakRatio) * wLen);
            const cPitch = slopeRun > 100
              ? Math.round(Math.atan2(cRise, slopeRun) * (180 / Math.PI) * 10) / 10
              : (geom.gablePitch || 25);
            clippedProfile = {
              eaveHeight: cEaveH,
              leftHeight: Math.round(leftH),
              rightHeight: Math.round(rightH),
              peakRise: cRise,
              peakRatio: cPeakRatio,
              pitch: cPitch
            };
          }
        }
      }

      // Detect if this wall entity is explicitly a Gable / Raked Wall Under Roof in IFC
      const hasGableKeyword = /(gable|rake|pignon|apex|attic\s*wall|gable\s*end)/i.test(ent.raw || '');
      const isExplicitGable = Boolean(geom?.isGableProfile || clippedProfile || geom?.isClippedByRoof || hasGableKeyword);
      const wallBaseZ = Number.isFinite(geom?.minElevationZ) ? geom.minElevationZ : (placement.origin?.z || 0);
      const extractedEaveH = clippedProfile
        ? clippedProfile.eaveHeight
        : (Number.isFinite(geom?.eaveHeight) ? geom.eaveHeight : null);

      // If this is a pure upper triangular gable infill wall sitting at roof elevation, record it so we can merge it onto its supporting wall below if one exists
      if ((geom?.isGableProfile || clippedProfile) && extractedEaveH !== null && extractedEaveH < 200 && wallBaseZ > 1200) {
        upperTriangularGableWalls.push({
          ent,
          a,
          b,
          wLen,
          baseZ: wallBaseZ,
          thickness,
          leftHeight: clippedProfile?.leftHeight ?? geom?.leftHeight ?? 0,
          rightHeight: clippedProfile?.rightHeight ?? geom?.rightHeight ?? 0,
          peakRatio: clippedProfile?.peakRatio ?? geom?.gablePeakRatio ?? 0.5,
          peakRise: clippedProfile?.peakRise || geom?.gablePeakRise || geom?.height || Math.round((wLen / 2) * Math.tan((25 * Math.PI) / 180)),
          pitch: clippedProfile?.pitch || geom?.gablePitch || 25
        });
        continue;
      }

      const rawWallHeight = (extractedEaveH !== null && extractedEaveH >= 200)
        ? Math.round(extractedEaveH)
        : (geom?.height && geom.height >= 500 && geom.height <= 15000 ? Math.round(geom.height) : defaultHeight);

      let height = rawWallHeight;
      let gableProfile = null;
      if (isExplicitGable) {
        const pitchDeg = Math.max(2, Math.min(75, Number(clippedProfile?.pitch ?? geom?.gablePitch) || 25));
        const peakRatio = Number.isFinite(clippedProfile?.peakRatio)
          ? clippedProfile.peakRatio
          : (Number.isFinite(geom?.gablePeakRatio) ? geom.gablePeakRatio : 0.5);
        const slopeRun = (peakRatio <= 0.03 || peakRatio >= 0.97)
          ? wLen
          : Math.max(peakRatio * wLen, (1 - peakRatio) * wLen);
        const expectedRise = Math.round(slopeRun * Math.tan((pitchDeg * Math.PI) / 180));
        // If IFC extruded wall height included the gable peak without explicit eaveHeight, separate eave height and peak rise
        if (extractedEaveH === null && height > defaultHeight + 300 && height - expectedRise >= 1500) {
          height = Math.round(height - expectedRise);
        }
        const peakRise = clippedProfile?.peakRise || geom?.gablePeakRise || expectedRise;
        const leftHeight = clippedProfile?.leftHeight ?? geom?.leftHeight ?? height;
        const rightHeight = clippedProfile?.rightHeight ?? geom?.rightHeight ?? height;
        gableProfile = {
          enabled: true,
          source: 'ifc',
          eaveHeight: height,
          leftHeight,
          rightHeight,
          pitch: pitchDeg,
          peakRatio,
          peakRise
        };
      }

      if (height && height !== defaultHeight && stories.length > 0 && stories[0].height === 3048 && !isExplicitGable) {
        stories.forEach(s => { s.height = height; });
      }

      const wallId = `W-${String(wallIdx++).padStart(3, '0')}`;
      const storyId = elementStoryMap.get(ent.id) || stories[0].id;
      const storyObj = stories.find(s => s.id === storyId) || stories[0];
      const hasCustomHeight = isExplicitGable || Math.abs(height - (storyObj?.height || defaultHeight)) > 50;

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
        followStory: !hasCustomHeight,
        isGableWall: isExplicitGable,
        gableMode: isExplicitGable ? 'gable' : 'auto',
        gablePitch: gableProfile ? gableProfile.pitch : undefined,
        gableProfile,
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

    // Merge any standalone upper triangular gable walls onto their supporting lower exterior wall
    for (const ug of upperTriangularGableWalls) {
      const ugDx = ug.b.x - ug.a.x, ugDy = ug.b.y - ug.a.y;
      const ugLen = Math.hypot(ugDx, ugDy) || 1;
      const ugUx = ugDx / ugLen, ugUy = ugDy / ugLen;
      const ugPeakPt = {
        x: ug.a.x + ugDx * (ug.peakRatio ?? 0.5),
        y: ug.a.y + ugDy * (ug.peakRatio ?? 0.5)
      };

      let bestWall = null, bestScore = Infinity;
      for (const w of elements.filter(e => e.type === 'wall')) {
        const wDx = w.b.x - w.a.x, wDy = w.b.y - w.a.y;
        const wLen = Math.hypot(wDx, wDy) || 1;
        const wUx = wDx / wLen, wUy = wDy / wLen;
        const cross = Math.abs(ugUx * wUy - ugUy * wUx);
        if (cross > 0.18) continue;
        const perpDist = Math.abs((ug.a.x - w.a.x) * (-wUy) + (ug.a.y - w.a.y) * wUx);
        if (perpDist > Math.max(w.thickness || 140, ug.thickness || 140, 350)) continue;
        const t0 = ((ug.a.x - w.a.x) * wUx + (ug.a.y - w.a.y) * wUy);
        const t1 = ((ug.b.x - w.a.x) * wUx + (ug.b.y - w.a.y) * wUy);
        const ovLo = Math.max(0, Math.min(t0, t1));
        const ovHi = Math.min(wLen, Math.max(t0, t1));
        const overlap = ovHi - ovLo;
        if (overlap < Math.min(wLen, ugLen) * 0.45) continue;
        const score = perpDist + Math.abs(wLen - ugLen) * 0.25;
        if (score < bestScore) {
          bestScore = score;
          bestWall = w;
        }
      }
      if (bestWall) {
        const wDx = bestWall.b.x - bestWall.a.x, wDy = bestWall.b.y - bestWall.a.y;
        const wLenSq = wDx * wDx + wDy * wDy || 1;
        const mappedPeakRatio = Math.max(0, Math.min(1, Math.round((((ugPeakPt.x - bestWall.a.x) * wDx + (ugPeakPt.y - bestWall.a.y) * wDy) / wLenSq) * 1000) / 1000));
        const sameDir = (ugDx * wDx + ugDy * wDy) >= 0;
        const addLeft = sameDir ? (ug.leftHeight || 0) : (ug.rightHeight || 0);
        const addRight = sameDir ? (ug.rightHeight || 0) : (ug.leftHeight || 0);
        bestWall.isGableWall = true;
        bestWall.gableMode = 'gable';
        bestWall.followStory = false;
        bestWall.gablePitch = ug.pitch;
        bestWall.gableProfile = {
          enabled: true,
          source: 'ifc',
          eaveHeight: bestWall.height,
          leftHeight: bestWall.height + addLeft,
          rightHeight: bestWall.height + addRight,
          pitch: ug.pitch,
          peakRatio: mappedPeakRatio,
          peakRise: ug.peakRise
        };
        ifcWallToElement.set(ug.ent.id, bestWall);
      } else {
        const wallId = `W-${String(wallIdx++).padStart(3, '0')}`;
        const storyElev = stories[0]?.elevation || 0;
        const inferredEaveH = ug.baseZ > storyElev + 500 ? Math.round(ug.baseZ - storyElev) : defaultHeight;
        const wallEl = {
          id: wallId,
          type: 'wall',
          a: ug.a,
          b: ug.b,
          story: stories[0].id,
          height: inferredEaveH,
          thickness: ug.thickness,
          material: 'Timber',
          layer: 'Exterior Walls',
          reference: 'center',
          followStory: false,
          isGableWall: true,
          gableMode: 'gable',
          gablePitch: ug.pitch,
          gableProfile: {
            enabled: true,
            source: 'ifc',
            eaveHeight: inferredEaveH,
            leftHeight: inferredEaveH + (ug.leftHeight || 0),
            rightHeight: inferredEaveH + (ug.rightHeight || 0),
            pitch: ug.pitch,
            peakRatio: ug.peakRatio ?? 0.5,
            peakRise: ug.peakRise
          },
          framing: {
            enabled: true,
            studWidth: 38,
            studDepth: Math.min(ug.thickness, 140),
            timberGrade: 'C24',
            spacing: options.spacing || 400,
            cornerDetail: 'ext_opt1',
            insideJunctionDetail: 'int_opt1',
            headerPosition: 'top'
          }
        };
        elements.push(wallEl);
        ifcWallToElement.set(ug.ent.id, wallEl);
      }
    }

    // Extract Doors & Windows (including IFCOPENINGELEMENT, IFCWINDOW, IFCDOOR)
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

        const overlaps = elements.some(existing =>
          existing.host === hostWall.id &&
          Math.abs(existing.offset - offset) < (existing.width + width) / 2 + 10
        );
        if (overlaps) continue;

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

    // Separate Floor Slabs vs Roof Slabs (IFCSLAB with .ROOF. / .BASEROOF. or aggregated inside IFCROOF)
    const floorSlabEnts = [];
    const roofSlabEnts = [];
    const roofEntIds = new Set();
    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCROOF' || ent.type === 'IFCROOFTYPE') {
        roofEntIds.add(ent.id);
      }
    }

    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCSLAB') {
        const parentId = childAggregatedInParent.get(ent.id);
        const isRoofSlab =
          (parentId && roofEntIds.has(parentId)) ||
          /\.(ROOF|BASEROOF)\./i.test(ent.raw || '') ||
          /\broof\b/i.test(String(getEntityArgs(ent)[2] || '')) ||
          /\broof\b/i.test(String(getEntityArgs(ent)[4] || ''));
        if (isRoofSlab) {
          roofSlabEnts.push(ent);
        } else {
          floorSlabEnts.push(ent);
        }
      }
    }

    let slabAdded = false;
    let slabIdx = 1;
    for (const ent of floorSlabEnts) {
      const args = getEntityArgs(ent);
      const placement = getLocalPlacement(args[5]);
      const geom = extractProductGeometry(args[6], placement);
      let polyPts = geom?.polyPoints;
      if (!polyPts || polyPts.length < 3) {
        const subPts = collectSubgraphPoints(ent, placement);
        if (subPts.length >= 3) polyPts = computeConvexHull2D(subPts);
      }
      if (polyPts && polyPts.length >= 3) {
        elements.push({
          id: `S-${String(slabIdx++).padStart(3, '0')}`,
          type: 'slab',
          points: polyPts.map(p => ({ x: p.x, y: p.y })),
          story: elementStoryMap.get(ent.id) || stories[0].id,
          thickness: geom?.height ? Math.min(500, Math.max(100, Math.round(geom.height))) : 200,
          material: 'Concrete',
          layer: 'Structure'
        });
        slabAdded = true;
      }
    }

    // Extract Roofs (from IFCROOF and standalone IFCSLAB.ROOF entities — never instantiate IFCROOFTYPE as a duplicate roof)
    const roofEnts = [];
    for (const [, ent] of entities.entries()) {
      if (ent.type === 'IFCROOF') roofEnts.push(ent);
    }

    const consumedRoofSlabIds = new Set();
    let roofAdded = false;
    let roofIdx = 1;

    function analyzeRoof3DFaces(faces3D, clipPlanes = []) {
      const upFaces = [];
      const downFaces = [];
      let minZ = Infinity, maxZ = -Infinity;

      for (const loop of faces3D || []) {
        if (!Array.isArray(loop) || loop.length < 3) continue;
        for (const p of loop) {
          const z = p.z || 0;
          if (z < minZ) minZ = z;
          if (z > maxZ) maxZ = z;
        }
        const { n, area } = faceNewellNormalAndArea(loop);
        if (area < 50) continue;
        if (Math.abs(n.z) <= 0.15) continue; // Ignore vertical fascia/gable end faces
        const c = {
          x: loop.reduce((s, p) => s + p.x, 0) / loop.length,
          y: loop.reduce((s, p) => s + p.y, 0) / loop.length,
          z: loop.reduce((s, p) => s + (p.z || 0), 0) / loop.length
        };
        const un = n.z < 0 ? { x: -n.x, y: -n.y, z: -n.z } : n;
        const nh = Math.hypot(un.x, un.y);
        const tiltDeg = Math.atan2(nh, un.z) * (180 / Math.PI);
        const info = {
          loop,
          area,
          n: un,
          rawNz: n.z,
          nh,
          tiltDeg,
          ux: nh > 1e-5 ? -un.x / nh : 0,
          uy: nh > 1e-5 ? -un.y / nh : 0,
          centroid: c
        };
        if (n.z > 0.15) upFaces.push(info);
        else downFaces.push(info);
      }

      // If shell winding was inverted consistently, swap top/bottom sets
      let topFaces = upFaces;
      let botFaces = downFaces;
      if (upFaces.length > 0 && downFaces.length > 0) {
        const avgUpZ = upFaces.reduce((s, f) => s + f.centroid.z * f.area, 0) / upFaces.reduce((s, f) => s + f.area, 0);
        const avgDownZ = downFaces.reduce((s, f) => s + f.centroid.z * f.area, 0) / downFaces.reduce((s, f) => s + f.area, 0);
        if (avgDownZ > avgUpZ + 5) {
          topFaces = downFaces;
          botFaces = upFaces;
        }
      } else if (upFaces.length === 0 && downFaces.length > 0) {
        topFaces = downFaces;
        botFaces = [];
      }

      const sourceFaces = topFaces.length > 0 ? topFaces : botFaces;
      const slopedFaces = sourceFaces.filter(f => f.tiltDeg >= 0.8 && f.nh > 1e-4);
      const flatFaces = sourceFaces.filter(f => f.tiltDeg < 0.8);
      const totalSlopedArea = slopedFaces.reduce((s, f) => s + f.area, 0);
      const totalFlatArea = flatFaces.reduce((s, f) => s + f.area, 0);

      // Cluster sloped planes by upslope direction (within ~15 deg) & similar pitch
      const clusters = [];
      for (const f of slopedFaces) {
        let matched = null;
        for (const cl of clusters) {
          const dotDir = cl.ux * f.ux + cl.uy * f.uy;
          if (dotDir > 0.965 && Math.abs(cl.tiltDeg - f.tiltDeg) < 10) {
            matched = cl;
            break;
          }
        }
        if (matched) {
          const w = matched.area + f.area;
          const mx = matched.ux * matched.area + f.ux * f.area;
          const my = matched.uy * matched.area + f.uy * f.area;
          const mLen = Math.hypot(mx, my) || 1;
          matched.ux = mx / mLen;
          matched.uy = my / mLen;
          matched.tiltDeg = (matched.tiltDeg * matched.area + f.tiltDeg * f.area) / w;
          const nx = matched.n.x * matched.area + f.n.x * f.area;
          const ny = matched.n.y * matched.area + f.n.y * f.area;
          const nz = matched.n.z * matched.area + f.n.z * f.area;
          const nLen = Math.hypot(nx, ny, nz) || 1;
          matched.n = { x: nx / nLen, y: ny / nLen, z: nz / nLen };
          matched.centroid = {
            x: (matched.centroid.x * matched.area + f.centroid.x * f.area) / w,
            y: (matched.centroid.y * matched.area + f.centroid.y * f.area) / w,
            z: (matched.centroid.z * matched.area + f.centroid.z * f.area) / w
          };
          matched.faces.push(f);
          matched.area = w;
        } else {
          clusters.push({
            ux: f.ux,
            uy: f.uy,
            tiltDeg: f.tiltDeg,
            n: { ...f.n },
            centroid: { ...f.centroid },
            area: f.area,
            faces: [f]
          });
        }
      }

      // If no sloped faces exist on a clipped solid, synthesize clusters from clipPlanes
      if (clusters.length === 0 && Array.isArray(clipPlanes) && clipPlanes.length > 0) {
        for (const cp of clipPlanes) {
          if (cp.pitchDeg < 0.8) continue;
          const nh = Math.hypot(cp.normal.x, cp.normal.y);
          if (nh < 1e-4) continue;
          const ux = -cp.normal.x / nh, uy = -cp.normal.y / nh;
          clusters.push({
            ux,
            uy,
            tiltDeg: cp.pitchDeg,
            n: { ...cp.normal },
            centroid: { ...cp.origin },
            area: 10000,
            faces: []
          });
        }
      }

      let significantClusters = clusters
        .filter(cl => totalSlopedArea === 0 || cl.area >= totalSlopedArea * 0.03)
        .sort((a, b) => b.area - a.area);
      const discardedFasciaFaces = new Set();
      if (significantClusters.length > 1) {
        const maxArea = significantClusters[0].area;
        significantClusters = significantClusters.filter((cl, idx) => {
          if (idx === 0 || cl.area >= maxArea * 0.2) return true;
          const isPerpFascia = significantClusters.some(other =>
            other !== cl &&
            other.area >= cl.area * 5 &&
            cl.tiltDeg > 50 &&
            Math.abs(other.n.x * cl.n.x + other.n.y * cl.n.y + other.n.z * cl.n.z) < 0.2
          );
          if (isPerpFascia) {
            for (const f of cl.faces || []) discardedFasciaFaces.add(f);
            return false;
          }
          return true;
        });
      }
      if (discardedFasciaFaces.size > 0) {
        topFaces = topFaces.filter(f => !discardedFasciaFaces.has(f));
        botFaces = botFaces.filter(f => !discardedFasciaFaces.has(f));
      }

      let inferredStyle = null;
      let geomPitch = null;
      let upslopeDir = null;

      if (significantClusters.length === 0 && totalFlatArea > 0) {
        inferredStyle = 'flat';
        geomPitch = 0;
      } else if (significantClusters.length === 1) {
        inferredStyle = 'mono';
        geomPitch = Math.round(significantClusters[0].tiltDeg * 10) / 10;
        upslopeDir = { ux: significantClusters[0].ux, uy: significantClusters[0].uy };
      } else if (significantClusters.length === 2) {
        const c0 = significantClusters[0], c1 = significantClusters[1];
        const dotOpp = c0.ux * c1.ux + c0.uy * c1.uy;
        const totA = c0.area + c1.area;
        geomPitch = Math.round(((c0.tiltDeg * c0.area + c1.tiltDeg * c1.area) / totA) * 10) / 10;
        upslopeDir = { ux: c0.ux, uy: c0.uy };
        inferredStyle = dotOpp < -0.7 ? 'gable' : 'hip';
      } else if (significantClusters.length >= 3) {
        const totA = significantClusters.reduce((s, c) => s + c.area, 0);
        geomPitch = Math.round((significantClusters.reduce((s, c) => s + c.tiltDeg * c.area, 0) / totA) * 10) / 10;
        upslopeDir = { ux: significantClusters[0].ux, uy: significantClusters[0].uy };
        inferredStyle = 'hip';
      }

      // Compute perpendicular roof thickness from top vs bottom faces
      let geomThickness = null;
      if (topFaces.length > 0 && botFaces.length > 0) {
        let thkSum = 0, wSum = 0;
        for (const tf of topFaces) {
          let bestBot = null, bestDist = Infinity;
          for (const bf of botFaces) {
            const align = Math.abs(tf.n.x * bf.n.x + tf.n.y * bf.n.y + tf.n.z * bf.n.z);
            if (align < 0.92) continue;
            const dxy = Math.hypot(tf.centroid.x - bf.centroid.x, tf.centroid.y - bf.centroid.y);
            if (dxy < bestDist) {
              bestDist = dxy;
              bestBot = bf;
            }
          }
          if (bestBot) {
            const perp = Math.abs(
              (tf.centroid.x - bestBot.centroid.x) * tf.n.x +
              (tf.centroid.y - bestBot.centroid.y) * tf.n.y +
              (tf.centroid.z - bestBot.centroid.z) * tf.n.z
            );
            if (perp >= 20 && perp <= 2000) {
              thkSum += perp * tf.area;
              wSum += tf.area;
            }
          }
        }
        if (wSum > 0) geomThickness = Math.round(thkSum / wSum);
      }

      // Outer 2D footprint polygon from top faces
      const outerPoly2D = topFaces.length > 0 ? extractOuterFootprint2D(topFaces.map(f => f.loop)) : null;

      // Helper to evaluate top surface Z at pivot points in IFC XY space
      const hasTopFacePlanes = topFaces.length > 0 || significantClusters.length > 0;
      const evalPivotTopZ = hasTopFacePlanes
        ? (pivotIfcPts, roofType, pitchDeg) => {
            if (topFaces.length > 0) {
              // For flat or mono or gable/hip with actual top faces:
              // find for each pivot point the top face whose 2D centroid is closest (or plane z is lower envelope for convex roofs)
              const pivotZs = [];
              for (const pv of pivotIfcPts) {
                let bestFace = topFaces[0];
                let bestD = Infinity;
                for (const tf of topFaces) {
                  const d = Math.hypot(pv.x - tf.centroid.x, pv.y - tf.centroid.y);
                  if (d < bestD) { bestD = d; bestFace = tf; }
                }
                if (bestFace && Math.abs(bestFace.n.z) > 0.15) {
                  const z = bestFace.centroid.z - ((bestFace.n.x * (pv.x - bestFace.centroid.x) + bestFace.n.y * (pv.y - bestFace.centroid.y)) / bestFace.n.z);
                  if (Number.isFinite(z)) pivotZs.push(z);
                }
              }
              if (pivotZs.length > 0) {
                if (roofType === 'mono') return Math.min(...pivotZs);
                // For gable/hip eave pivot corners, all true eave vertices sit at the minimum Z of pivot corners
                pivotZs.sort((a, b) => a - b);
                return pivotZs[0];
              }
            } else if (significantClusters.length > 0) {
              const zs = [];
              for (const pv of pivotIfcPts) {
                const clZs = significantClusters
                  .filter(cl => Math.abs(cl.n.z) > 0.15)
                  .map(cl => cl.centroid.z - ((cl.n.x * (pv.x - cl.centroid.x) + cl.n.y * (pv.y - cl.centroid.y)) / cl.n.z))
                  .filter(Number.isFinite);
                if (clZs.length > 0) zs.push(Math.min(...clZs));
              }
              if (zs.length > 0) return Math.min(...zs);
            }
            return null;
          }
        : null;

      return {
        inferredStyle,
        geomPitch,
        upslopeDir,
        geomThickness,
        outerPoly2D,
        evalPivotTopZ,
        clusterCount: significantClusters.length,
        minZ: Number.isFinite(minZ) ? minZ : null,
        maxZ: Number.isFinite(maxZ) ? maxZ : null
      };
    }

    function detectRoofSpecFromEntity(ent, childEnts, combinedGeoms, fallbackPts, footprintPts) {
      const meta = getEntityRoofMetadata(ent, childEnts);
      const allFaces3D = combinedGeoms.flatMap(g => g?.meshFaces3D || []);
      const allClipPlanes = combinedGeoms.flatMap(g => g?.clipPlanes || []);
      const faceAnalysis = analyzeRoof3DFaces(allFaces3D, allClipPlanes);

      // Local gable walls under THIS roof only (never let an unrelated building wing force a hip/mono/flat roof into gable)
      let localGableWalls = [];
      if (footprintPts && footprintPts.length >= 3) {
        const rMinX = Math.min(...footprintPts.map(p => p.x));
        const rMaxX = Math.max(...footprintPts.map(p => p.x));
        const rMinY = Math.min(...footprintPts.map(p => p.y));
        const rMaxY = Math.max(...footprintPts.map(p => p.y));
        const tol = 900;
        localGableWalls = elements.filter(e => {
          if (e.type !== 'wall' || (!e.isGableWall && !e.gableProfile?.enabled)) return false;
          const mx = (e.a.x + e.b.x) / 2, my = (e.a.y + e.b.y) / 2;
          return mx >= rMinX - tol && mx <= rMaxX + tol && my >= rMinY - tol && my <= rMaxY + tol;
        });
      }
      const hasLocalGableWalls = localGableWalls.length > 0;

      // Determine roofType: explicit IFC PredefinedType / PropertySet -> 3D face geometry -> local gable walls -> hip
      let roofType = 'hip';
      let isFlat = false;
      if (meta.explicitStyle === 'flat') {
        roofType = 'mono';
        isFlat = true;
      } else if (meta.explicitStyle === 'mono') {
        roofType = 'mono';
      } else if (meta.explicitStyle === 'multiGable') {
        roofType = 'multiGable';
      } else if (meta.explicitStyle === 'gable') {
        if (
          footprintPts && footprintPts.length >= 6 &&
          polygonSignedArea2D(footprintPts) !== 0 &&
          faceAnalysis.clusterCount >= 3
        ) {
          roofType = 'multiGable';
        } else {
          roofType = 'gable';
        }
      } else if (meta.explicitStyle === 'hip') {
        roofType = 'hip';
      } else if (faceAnalysis.inferredStyle === 'flat') {
        roofType = 'mono';
        isFlat = true;
      } else if (faceAnalysis.inferredStyle === 'mono') {
        roofType = 'mono';
      } else if (faceAnalysis.inferredStyle === 'gable') {
        roofType = 'gable';
      } else if (faceAnalysis.inferredStyle === 'hip') {
        if (hasLocalGableWalls && footprintPts && footprintPts.length >= 6) {
          roofType = 'multiGable';
        } else {
          roofType = 'hip';
        }
      } else if (hasLocalGableWalls || childEnts.length === 2) {
        roofType = 'gable';
      } else if (childEnts.length === 1 && combinedGeoms.some(g => Number.isFinite(g?.detectedPitch) && g.detectedPitch > 0.5)) {
        roofType = 'mono';
      }

      // Compute exact roof pitch (0..80°, preserving 0° for flat roofs!)
      let pitch = null;
      if (isFlat && (faceAnalysis.geomPitch === null || faceAnalysis.geomPitch === 0)) {
        pitch = meta.metaPitch ?? 0;
      } else if (Number.isFinite(faceAnalysis.geomPitch) && (faceAnalysis.geomPitch > 0.5 || !Number.isFinite(meta.metaPitch))) {
        pitch = faceAnalysis.geomPitch;
      } else if (Number.isFinite(meta.metaPitch)) {
        pitch = meta.metaPitch;
      } else {
        const geomPitches = combinedGeoms.map(g => g?.detectedPitch ?? g?.gablePitch).filter(Number.isFinite);
        if (geomPitches.length > 0) {
          pitch = Math.round((geomPitches.reduce((a, b) => a + b, 0) / geomPitches.length) * 10) / 10;
        }
      }
      if (pitch === null && hasLocalGableWalls) {
        const gwWithPitch = localGableWalls.find(w => Number.isFinite(w.gablePitch));
        if (gwWithPitch) pitch = gwWithPitch.gablePitch;
      }
      if (pitch === null && fallbackPts.length >= 3) {
        const zs = fallbackPts.map(p => p.z || 0).filter(Number.isFinite);
        const xs = fallbackPts.map(p => p.x), ys = fallbackPts.map(p => p.y);
        const rise = Math.max(...zs) - Math.min(...zs);
        const span = Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
        if (rise > 200 && span > 1000) {
          const calcDeg = Math.atan2(rise, span / 2) * (180 / Math.PI);
          if (calcDeg >= 1 && calcDeg <= 80) pitch = Math.round(calcDeg * 10) / 10;
        }
      }
      if (pitch === null) pitch = isFlat ? 0 : 25;
      pitch = Math.max(0, Math.min(80, pitch));

      // Determine upslope vector / raw angle in IFC space
      const geomUpslope = faceAnalysis.upslopeDir || combinedGeoms.find(g => g?.detectedUpslopeDir)?.detectedUpslopeDir || null;
      const angles = combinedGeoms.map(g => g?.detectedRoofAngle).filter(Number.isFinite);
      const rawAngle = meta.metaRoofAngle ?? (angles.length > 0 ? angles[0] : null);
      const thickness = Math.max(20, Math.min(2000, meta.metaThickness || faceAnalysis.geomThickness || combinedGeoms.find(g => Number.isFinite(g?.thickness) && g.thickness >= 20)?.thickness || 200));

      return {
        roofType,
        pitch,
        upslopeDir: geomUpslope,
        rawAngle,
        thickness,
        metaOverhang: meta.metaOverhang,
        metaHeight: meta.metaHeight,
        faceAnalysis
      };
    }

    for (const ent of roofEnts) {
      const args = getEntityArgs(ent);
      const placement = getLocalPlacement(args[5]);
      const geom = extractProductGeometry(args[6], placement, { collectSolidFaces: true });
      const childIds = relAggregatesMap.get(ent.id) || [];
      const childEnts = childIds.map(cid => entities.get(cid)).filter(Boolean);
      const combinedGeoms = [geom].filter(Boolean);
      const allRoofPts = [];

      if (geom?.polyPoints && geom.polyPoints.length >= 3) {
        allRoofPts.push(...geom.polyPoints);
      }
      if (geom?.meshPoints3D && geom.meshPoints3D.length > 0) {
        allRoofPts.push(...geom.meshPoints3D);
      }

      for (const cEnt of childEnts) {
        consumedRoofSlabIds.add(cEnt.id);
        const cArgs = getEntityArgs(cEnt);
        const cPlacement = cArgs[5] ? getLocalPlacement(cArgs[5]) : placement;
        const cGeom = extractProductGeometry(cArgs[6], cPlacement, { collectSolidFaces: true });
        if (cGeom) {
          combinedGeoms.push(cGeom);
          if (cGeom.polyPoints) allRoofPts.push(...cGeom.polyPoints);
          if (cGeom.meshPoints3D) allRoofPts.push(...cGeom.meshPoints3D);
        }
        const cSubPts = collectSubgraphPoints(cEnt, cPlacement);
        allRoofPts.push(...cSubPts);
      }

      if (allRoofPts.length < 3) {
        allRoofPts.push(...collectSubgraphPoints(ent, placement));
      }

      const preliminarySpec = detectRoofSpecFromEntity(ent, childEnts, combinedGeoms, allRoofPts, null);

      // Prefer explicit FootPrint curve -> single solid profile -> exact concave outer 2D trace -> convex hull -> building walls
      let polyPts = null;
      let synthesizedFromWalls = false;
      if (geom?.footPrintPoints && geom.footPrintPoints.length >= 3) {
        polyPts = geom.footPrintPoints;
      } else if (geom?.polyPoints && geom.polyPoints.length >= 3 && childEnts.length === 0 && !geom.meshFaces3D?.length) {
        polyPts = geom.polyPoints;
      } else if (preliminarySpec.faceAnalysis.outerPoly2D && preliminarySpec.faceAnalysis.outerPoly2D.length >= 3) {
        polyPts = preliminarySpec.faceAnalysis.outerPoly2D;
      } else if (geom?.polyPoints && geom.polyPoints.length >= 3 && childEnts.length === 0) {
        polyPts = geom.polyPoints;
      } else {
        const hull = computeConvexHull2D(allRoofPts);
        if (hull.length >= 3) polyPts = hull;
      }

      if (!polyPts || polyPts.length < 3) {
        const wPts = elements.filter(e => e.type === 'wall').flatMap(w => [w.a, w.b]);
        if (wPts.length >= 2) {
          const minX = Math.min(...wPts.map(p => p.x)), maxX = Math.max(...wPts.map(p => p.x));
          const minY = Math.min(...wPts.map(p => p.y)), maxY = Math.max(...wPts.map(p => p.y));
          polyPts = [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY }
          ];
          synthesizedFromWalls = true;
        }
      }

      const spec = detectRoofSpecFromEntity(ent, childEnts, combinedGeoms, allRoofPts, polyPts);
      const storyId = elementStoryMap.get(ent.id) || stories[0].id;
      const stObj = stories.find(s => s.id === storyId) || stories[0];
      const storyElev = stObj ? stObj.elevation : 0;
      const storyWalls = elements.filter(e => e.type === 'wall' && e.story === storyId);
      const hasElevatedZ =
        (Number.isFinite(spec.faceAnalysis.maxZ) && spec.faceAnalysis.maxZ > storyElev + 350) ||
        (placement.origin.z > storyElev + 350) ||
        Number.isFinite(spec.metaHeight);

      let explicitWorldTopZ = null;
      if (Number.isFinite(spec.metaHeight)) {
        explicitWorldTopZ = storyElev + spec.metaHeight;
      } else if (hasElevatedZ && !spec.faceAnalysis.evalPivotTopZ && Number.isFinite(spec.faceAnalysis.maxZ)) {
        // Horizontal extruded roof placeholder or flat roof at elevated Z
        const dropMm = spec.thickness / Math.max(0.15, Math.cos((spec.pitch * Math.PI) / 180));
        explicitWorldTopZ = spec.pitch < 0.8
          ? spec.faceAnalysis.maxZ
          : (spec.faceAnalysis.minZ !== null ? spec.faceAnalysis.minZ + dropMm : placement.origin.z + dropMm);
      }

      const fallbackStoryHeight = storyWalls.length > 0
        ? Math.max(...storyWalls.map(w => w.height || defaultHeight))
        : (stObj?.height || defaultHeight);

      if (polyPts && polyPts.length >= 3) {
        elements.push({
          id: `R-${String(roofIdx++).padStart(3, '0')}`,
          type: 'roof',
          story: storyId,
          layer: 'Structure',
          points: polyPts.map(p => ({ x: p.x, y: p.y })),
          pitch: spec.pitch,
          height: fallbackStoryHeight,
          overhang: spec.metaOverhang ?? undefined,
          thickness: spec.thickness,
          roofType: spec.roofType,
          roofAngle: spec.rawAngle ?? 0,
          followStory: !hasElevatedZ,
          ifcPreservedHeight: hasElevatedZ,
          _ifcUpslopeDir: spec.upslopeDir,
          _ifcRawAngle: spec.rawAngle,
          _ifcMetaOverhang: spec.metaOverhang,
          _ifcSynthesizedFromWalls: synthesizedFromWalls,
          _ifcEvalPivotTopZ: hasElevatedZ ? spec.faceAnalysis.evalPivotTopZ : null,
          _ifcExplicitWorldTopZ: explicitWorldTopZ,
          roofFraming: {
            system: spec.pitch < 0.8 ? 'rafters' : 'trusses',
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

    // Also process any standalone IFCSLAB.ROOF entities not already aggregated in an IFCROOF container
    const standaloneRoofSlabs = roofSlabEnts.filter(ent => !consumedRoofSlabIds.has(ent.id));
    if (!roofAdded && standaloneRoofSlabs.length > 0) {
      const combinedGeoms = [];
      const allRoofPts = [];
      for (const sEnt of standaloneRoofSlabs) {
        const sArgs = getEntityArgs(sEnt);
        const sPlacement = getLocalPlacement(sArgs[5]);
        const sGeom = extractProductGeometry(sArgs[6], sPlacement, { collectSolidFaces: true });
        if (sGeom) {
          combinedGeoms.push(sGeom);
          if (sGeom.polyPoints) allRoofPts.push(...sGeom.polyPoints);
          if (sGeom.meshPoints3D) allRoofPts.push(...sGeom.meshPoints3D);
        }
        allRoofPts.push(...collectSubgraphPoints(sEnt, sPlacement));
      }
      const spec = detectRoofSpecFromEntity(standaloneRoofSlabs[0], standaloneRoofSlabs, combinedGeoms, allRoofPts, null);
      const polyPts = (spec.faceAnalysis.outerPoly2D && spec.faceAnalysis.outerPoly2D.length >= 3)
        ? spec.faceAnalysis.outerPoly2D
        : computeConvexHull2D(allRoofPts);
      if (polyPts.length >= 3) {
        const refinedSpec = detectRoofSpecFromEntity(standaloneRoofSlabs[0], standaloneRoofSlabs, combinedGeoms, allRoofPts, polyPts);
        const storyId = elementStoryMap.get(standaloneRoofSlabs[0].id) || stories[0].id;
        const stObj = stories.find(s => s.id === storyId) || stories[0];
        const storyElev = stObj ? stObj.elevation : 0;
        const hasElevatedZ =
          (Number.isFinite(refinedSpec.faceAnalysis.maxZ) && refinedSpec.faceAnalysis.maxZ > storyElev + 350) ||
          Number.isFinite(refinedSpec.metaHeight);
        let explicitWorldTopZ = null;
        if (Number.isFinite(refinedSpec.metaHeight)) {
          explicitWorldTopZ = storyElev + refinedSpec.metaHeight;
        } else if (hasElevatedZ && !refinedSpec.faceAnalysis.evalPivotTopZ && Number.isFinite(refinedSpec.faceAnalysis.maxZ)) {
          const dropMm = refinedSpec.thickness / Math.max(0.15, Math.cos((refinedSpec.pitch * Math.PI) / 180));
          explicitWorldTopZ = refinedSpec.pitch < 0.8 ? refinedSpec.faceAnalysis.maxZ : (refinedSpec.faceAnalysis.minZ + dropMm);
        }
        elements.push({
          id: `R-${String(roofIdx++).padStart(3, '0')}`,
          type: 'roof',
          story: storyId,
          layer: 'Structure',
          points: polyPts.map(p => ({ x: p.x, y: p.y })),
          pitch: refinedSpec.pitch,
          height: stObj?.height || defaultHeight,
          overhang: refinedSpec.metaOverhang ?? undefined,
          thickness: refinedSpec.thickness,
          roofType: refinedSpec.roofType,
          roofAngle: refinedSpec.rawAngle ?? 0,
          followStory: !hasElevatedZ,
          ifcPreservedHeight: hasElevatedZ,
          _ifcUpslopeDir: refinedSpec.upslopeDir,
          _ifcRawAngle: refinedSpec.rawAngle,
          _ifcMetaOverhang: refinedSpec.metaOverhang,
          _ifcSynthesizedFromWalls: false,
          _ifcEvalPivotTopZ: hasElevatedZ ? refinedSpec.faceAnalysis.evalPivotTopZ : null,
          _ifcExplicitWorldTopZ: explicitWorldTopZ,
          roofFraming: {
            system: refinedSpec.pitch < 0.8 ? 'rafters' : 'trusses',
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

    // Apply robust coordinate normalization layer (also synchronizes roofs and gable walls under roofs)
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
        const hasGableWalls = allWalls.some(w => w.isGableWall || w.gableProfile?.enabled);
        const fallbackRoofType = hasGableWalls ? 'gable' : 'hip';
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
          roofType: fallbackRoofType,
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

    const modelName = fileName.replace(/\.[^.]+$/, '').replace(/_/g, ' ') || 'Timber Teck Building Model';

    const model = {
      version: 1,
      name: modelName,
      stories,
      elements,
      revision: 0
    };

    const stats = {
      wallsCount: elements.filter(e => e.type === 'wall').length,
      gableWallsCount: elements.filter(e => e.type === 'wall' && (e.isGableWall || e.gableProfile?.enabled)).length,
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
FILE_DESCRIPTION(('Timber Teck Native PLN BIM Model'),'2;1');
FILE_NAME('${nameSanitized}.ifc','2026-10-30T00:00:00',('Timber Teck BIM User'),('Timber Teck Studio'),'TIMBER TECK BIM 1.0','TIMBER TECK STUDIO 1.0','');
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
#33=IFCWALLSTANDARDCASE('W001_GUID',#2,'South Exterior Wall',$,'Timber Teck Exterior Wall',#21,#32,'W-001');

#40=IFCCARTESIANPOINT((${width}.0,0.0,0.0));
#41=IFCCARTESIANPOINT((${width}.0,${length}.0,0.0));
#42=IFCPOLYLINE((#40,#41));
#43=IFCWALLSTANDARDCASE('W002_GUID',#2,'East Gable End Wall',$,'Timber Teck Exterior Gable Wall Under Roof',#21,#42,'W-002');

#50=IFCCARTESIANPOINT((${width}.0,${length}.0,0.0));
#51=IFCCARTESIANPOINT((0.0,${length}.0,0.0));
#52=IFCPOLYLINE((#50,#51));
#53=IFCWALLSTANDARDCASE('W003_GUID',#2,'North Exterior Wall',$,'Timber Teck Exterior Wall',#21,#52,'W-003');

#60=IFCCARTESIANPOINT((0.0,${length}.0,0.0));
#61=IFCCARTESIANPOINT((0.0,0.0,0.0));
#62=IFCPOLYLINE((#60,#61));
#63=IFCWALLSTANDARDCASE('W004_GUID',#2,'West Gable End Wall',$,'Timber Teck Exterior Gable Wall Under Roof',#21,#62,'W-004');

#70=IFCCARTESIANPOINT((${w5x1}.0,${w5y1}.0,0.0));
#71=IFCCARTESIANPOINT((${w5x2}.0,${w5y2}.0,0.0));
#72=IFCPOLYLINE((#70,#71));
#73=IFCWALLSTANDARDCASE('W005_GUID',#2,'Interior Partition Wall W-005',$,'Timber Teck Interior Wall',#21,#72,'W-005');

#80=IFCCARTESIANPOINT((${w6x1}.0,${w6y1}.0,0.0));
#81=IFCCARTESIANPOINT((${w6x2}.0,${w6y2}.0,0.0));
#82=IFCPOLYLINE((#80,#81));
#83=IFCWALLSTANDARDCASE('W006_GUID',#2,'Interior Partition Wall W-006',$,'Timber Teck Interior Wall',#21,#82,'W-006');

#90=IFCCARTESIANPOINT((${w7x1}.0,${w7y1}.0,0.0));
#91=IFCCARTESIANPOINT((${w7x2}.0,${w7y2}.0,0.0));
#92=IFCPOLYLINE((#90,#91));
#93=IFCWALLSTANDARDCASE('W007_GUID',#2,'Interior Partition Wall W-007',$,'Timber Teck Interior Wall',#21,#92,'W-007');

#100=IFCCARTESIANPOINT((${w8x1}.0,${w8y1}.0,0.0));
#101=IFCCARTESIANPOINT((${w8x2}.0,${w8y2}.0,0.0));
#102=IFCPOLYLINE((#100,#101));
#103=IFCWALLSTANDARDCASE('W008_GUID',#2,'Interior Partition Wall W-008',$,'Timber Teck Interior Wall',#21,#102,'W-008');

#110=IFCCARTESIANPOINT((${w9x1}.0,${w9y1}.0,0.0));
#111=IFCCARTESIANPOINT((${w9x2}.0,${w9y2}.0,0.0));
#112=IFCPOLYLINE((#110,#111));
#113=IFCWALLSTANDARDCASE('W009_GUID',#2,'Interior Partition Wall W-009',$,'Timber Teck Interior Wall',#21,#112,'W-009');

#160=IFCCARTESIANPOINT((0.0,0.0,0.0));
#161=IFCCARTESIANPOINT((${width}.0,0.0,0.0));
#162=IFCCARTESIANPOINT((${width}.0,${length}.0,0.0));
#163=IFCCARTESIANPOINT((0.0,${length}.0,0.0));
#164=IFCPOLYLINE((#160,#161,#162,#163,#160));
#165=IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,'Roof Footprint',#164);
#166=IFCDIRECTION((0.0,0.0,1.0));
#167=IFCEXTRUDEDAREASOLID(#165,#12,#166,200.0);
#168=IFCSHAPEREPRESENTATION(#3,'Body','SweptSolid',(#167));
#169=IFCPRODUCTDEFINITIONSHAPE($,$,(#168));

#170=IFCSLAB('S001_GUID',#2,'Ground Slab',$,'Concrete Floor',#21,#169,'S-001',.FLOOR.);
#180=IFCROOF('R001_GUID',#2,'Main Gable Roof',$,'Timber Teck Gable Roof',#21,#169,'R-001',.GABLE_ROOF.);

ENDSEC;
END-ISO-10303-21;`;
  }

  global.parseTimberTeckPLNBuffer = parseTimberTeckPLNBuffer;
  global.convertIFCToBIMModel = convertIFCToBIMModel;
  global.convertPlnBinaryToIFCText = convertPlnBinaryToIFCText;
})();
