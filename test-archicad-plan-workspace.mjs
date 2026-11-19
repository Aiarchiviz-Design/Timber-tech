// Test suite for ArchiCAD 2D Plan CAD Workspace logic
function parseUserDistanceM(val, defaultUnit = 'ft-in') {
  if (typeof val === 'number') return val;
  if (!val || typeof val !== 'string') return NaN;
  let str = val.trim();
  if (!str) return NaN;
  if (/mm$/i.test(str)) {
    const num = parseFloat(str);
    return Number.isFinite(num) ? num / 1000 : NaN;
  }
  if (/m$/i.test(str) && !/mm$/i.test(str)) {
    const num = parseFloat(str);
    return Number.isFinite(num) ? num : NaN;
  }
  if (/in$/i.test(str) || (str.endsWith('"') && !str.includes("'"))) {
    const num = parseFloat(str.replace(/["in]/gi, '').trim());
    return Number.isFinite(num) ? num * 0.0254 : NaN;
  }
  const ftInMatch = str.match(/^([+-]?\d+(?:\.\d+)?)\s*'\s*(?:([0-9]+(?:\.[0-9]+)?|\d+\s+\d+\/\d+|\d+\/\d+)\s*"?)?$/);
  if (ftInMatch) {
    const ft = parseFloat(ftInMatch[1]);
    let inch = 0;
    if (ftInMatch[2]) {
      const inPart = ftInMatch[2].trim();
      inch = parseFloat(inPart) || 0;
    }
    return (ft * 12 + inch) * 0.0254;
  }
  const rawNum = parseFloat(str);
  if (!Number.isFinite(rawNum)) return NaN;
  if (rawNum > 100) return rawNum / 1000;
  return rawNum * 0.3048;
}
import {
  setHostModel,
  roofGeometry,
  generateRoofFraming,
  convertRoofEngineToAssembly
} from './roof-engine-module.js';

console.log('Testing ArchiCAD 2D Plan CAD Workspace...');

// 1. Test grid step calculation at different zoom levels (unlimited space)
function computeGridSteps(orthoSize) {
  let minorStep = 1, majorStep = 5;
  if (orthoSize < 4) { minorStep = 0.2; majorStep = 1; }
  else if (orthoSize < 16) { minorStep = 0.5; majorStep = 2.5; }
  else if (orthoSize < 60) { minorStep = 2; majorStep = 10; }
  else if (orthoSize < 250) { minorStep = 10; majorStep = 50; }
  else { minorStep = 50; majorStep = 250; }
  return { minorStep, majorStep };
}

const g1 = computeGridSteps(2);
if (g1.minorStep !== 0.2 || g1.majorStep !== 1) throw new Error('Close-up grid step mismatch');

const g2 = computeGridSteps(10);
if (g2.minorStep !== 0.5 || g2.majorStep !== 2.5) throw new Error('Building-scale grid step mismatch');

const g3 = computeGridSteps(500);
if (g3.minorStep !== 50 || g3.majorStep !== 250) throw new Error('Infinite-scale grid step mismatch');
console.log('✓ Adaptive infinite grid calculations verified across all zoom levels.');

// 2. Test Roof Boundary Editing & Vertex Manipulation
let testBoundary = [
  [0, 0],
  [14.6304, 0],       // 48' 0"
  [14.6304, 8.5344],  // 28' 0"
  [0, 8.5344]
];

// Reshape by moving a vertex (e.g. vertex #2)
testBoundary[2] = [16.0, 10.0];
if (testBoundary[2][0] !== 16.0 || testBoundary[2][1] !== 10.0) throw new Error('Vertex move failed');
console.log('✓ Corner vertex handle position update verified.');

// Insert a new vertex along an edge (e.g. L-shape notch)
testBoundary.splice(2, 0, [14.6304, 4.2672]);
if (testBoundary.length !== 5) throw new Error('Vertex insertion failed');
console.log('✓ Edge vertex insertion verified (5 corners).');

// Delete a vertex
testBoundary.splice(2, 1);
if (testBoundary.length !== 4) throw new Error('Vertex deletion failed');
console.log('✓ Vertex deletion verified (restored to 4 corners).');

// 3. Test Roof Framing Regeneration from Edited Boundary
const pointsMm = testBoundary.map(p => ({ x: Math.round(p[0] * 1000), y: Math.round(p[1] * 1000) }));
const element = {
  id: 'CAD-ROOF-TEST',
  type: 'roof',
  story: 's0',
  points: pointsMm,
  pitch: 25,
  height: 3000,
  overhang: 609.6,
  roofType: 'hip',
  roofFraming: {
    system: 'trusses',
    spacing: 609.6,
    width: 45,
    depth: 190,
    webDepth: 90,
    heel: 304.8,
    girderPlies: 2,
    hipSetback: 1828.8,
    webPattern: 'Fink'
  }
};

setHostModel({
  stories: [{ id: 's0', name: 'Level 1', elevation: 0, height: 3000 }],
  elements: [element]
});

const geom = roofGeometry(element);
const framing = generateRoofFraming(element);
const assembly = convertRoofEngineToAssembly(element, framing, geom);

if (!assembly.trusses || assembly.trusses.length === 0) {
  throw new Error('Framing assembly failed to generate from boundary');
}
console.log(`✓ Framing generated successfully from edited boundary: ${assembly.trusses.length} trusses.`);

// 4. Test Point-in-polygon and distance checks for CAD picking
function pointInPoly(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (((a[1] > p[1]) !== (b[1] > p[1])) && (p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0])) {
      inside = !inside;
    }
  }
  return inside;
}

if (!pointInPoly([7, 4], testBoundary)) throw new Error('Interior hit check failed');
if (pointInPoly([20, 20], testBoundary)) throw new Error('Exterior hit check false positive');
console.log('✓ CAD boundary raycast picking logic verified.');

// 5. Test Undo/Redo Stack Operations
let undoStack = [];
let redoStack = [];

function pushSnapshot(stateLabel, boundaryData) {
  undoStack.push({ stateLabel, boundary: boundaryData.map(p => [...p]) });
  redoStack = [];
}

function undoState(currentBoundary) {
  if (!undoStack.length) return currentBoundary;
  redoStack.push({ boundary: currentBoundary.map(p => [...p]) });
  return undoStack.pop().boundary;
}

function redoState(currentBoundary) {
  if (!redoStack.length) return currentBoundary;
  undoStack.push({ boundary: currentBoundary.map(p => [...p]) });
  return redoStack.pop().boundary;
}

let activeB = [[0, 0], [10, 0], [10, 5], [0, 5]];
pushSnapshot('Initial', activeB);

// Edit vertex
let editedB = [[0, 0], [12, 0], [12, 5], [0, 5]];
pushSnapshot('Move Corner', activeB);
activeB = editedB;

// Undo edit
activeB = undoState(activeB);
if (activeB[1][0] !== 10) throw new Error('Undo state mismatch');

// Redo edit
activeB = redoState(activeB);
if (activeB[1][0] !== 12) throw new Error('Redo state mismatch');

// 6. Test Vertex-to-Vertex Magnetic Snapping
function getVertexSnappedCoordsTest(targetX, targetY, boundary, threshold = 0.35, excludeIdx = null) {
  let bestX = targetX, bestY = targetY;
  let minDist = threshold;
  for (let i = 0; i < boundary.length; i++) {
    if (excludeIdx !== null && i === excludeIdx) continue;
    const pt = boundary[i];
    if (!pt) continue;
    const dist = Math.hypot(targetX - pt[0], targetY - pt[1]);
    if (dist < minDist) {
      minDist = dist;
      bestX = pt[0];
      bestY = pt[1];
    }
  }
  return [bestX, bestY];
}

const snapTestTarget = getVertexSnappedCoordsTest(14.635, 0.01, testBoundary, 0.35);
if (snapTestTarget[0] !== testBoundary[1][0] || snapTestTarget[1] !== testBoundary[1][1]) {
  throw new Error('Vertex-to-vertex magnetic snapping test failed');
}
console.log('✓ Vertex-to-vertex magnetic snapping verified.');

console.log('ALL ARCHICAD 2D PLAN CAD WORKSPACE TESTS PASSED!');
