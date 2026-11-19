import {
  setHostModel,
  roofGeometry,
  generateRoofFraming,
  convertRoofEngineToAssembly
} from './roof-engine-module.js';

console.log('Testing Plan Drafting System & User Distances...');

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
      if (inPart.includes('/')) {
        const parts = inPart.split(/\s+/);
        if (parts.length === 2) {
          const [num, den] = parts[1].split('/').map(Number);
          inch = parseFloat(parts[0]) + (den ? num / den : 0);
        } else {
          const [num, den] = parts[0].split('/').map(Number);
          inch = den ? num / den : 0;
        }
      } else {
        inch = parseFloat(inPart) || 0;
      }
    }
    return (ft * 12 + inch) * 0.0254;
  }

  const dashMatch = str.match(/^(\d+)-(\d+(?:\.\d+)?)$/);
  if (dashMatch) {
    const ft = parseFloat(dashMatch[1]);
    const inch = parseFloat(dashMatch[2]);
    return (ft * 12 + inch) * 0.0254;
  }

  const rawNum = parseFloat(str);
  if (!Number.isFinite(rawNum)) return NaN;
  if (rawNum > 100) return rawNum / 1000;
  if (defaultUnit === 'mm') return rawNum / 1000;
  if (defaultUnit === 'm') return rawNum;
  if (defaultUnit === 'in') return rawNum * 0.0254;
  return rawNum * 0.3048;
}

// 1. Verify distance parsing
const distTests = [
  { in: "28' 0\"", exp: 8.5344 },
  { in: "48' 0\"", exp: 14.6304 },
  { in: "28' 6\"", exp: 8.6868 },
  { in: "28' 6 1/2\"", exp: 8.6995 },
  { in: "8500 mm", exp: 8.5 },
  { in: "14000mm", exp: 14.0 },
  { in: "8.5 m", exp: 8.5 },
  { in: "24'", exp: 7.3152 },
  { in: "336\"", exp: 8.5344 },
  { in: "28-6", exp: 8.6868 },
  { in: "8500", exp: 8.5 },
  { in: "24", exp: 7.3152 }
];

for (const t of distTests) {
  const parsed = parseUserDistanceM(t.in);
  if (Math.abs(parsed - t.exp) > 0.005) {
    throw new Error(`Failed parsing "${t.in}": got ${parsed}, expected ${t.exp}`);
  }
}
console.log('✓ All 12 distance parsing test cases passed!');

// 2. Simulate drafting a 28' 0" × 48' 0" rectangle roof (entered in Plan view)
const widthM = parseUserDistanceM("28' 0\"");
const lengthM = parseUserDistanceM("48' 0\"");
const rectPtsMm = [
  { x: 0, y: 0 },
  { x: Math.round(lengthM * 1000), y: 0 },
  { x: Math.round(lengthM * 1000), y: Math.round(widthM * 1000) },
  { x: 0, y: Math.round(widthM * 1000) }
];

const draftedTrussRoof = {
  id: 'DRAFT-ROOF-01',
  type: 'roof',
  story: 's0',
  layer: 'Structure',
  points: rectPtsMm,
  pitch: 25,
  height: 3000,
  overhang: 609.6,
  thickness: 200,
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
  elements: [draftedTrussRoof]
});

const geom1 = roofGeometry(draftedTrussRoof);
const framing1 = generateRoofFraming(draftedTrussRoof);
const asm1 = convertRoofEngineToAssembly(draftedTrussRoof, framing1, geom1);

console.log(`✓ Drafted 28' × 48' Hip Trusses: ${asm1.trusses.length} trusses, ${framing1.members.length} members`);
if (asm1.trusses.length === 0) throw new Error('No trusses generated for drafted roof');

// 3. Simulate drafting conventional rafters on the same drafted footprint
const draftedRafterRoof = {
  ...draftedTrussRoof,
  id: 'DRAFT-ROOF-02',
  roofFraming: {
    ...draftedTrussRoof.roofFraming,
    system: 'rafters'
  }
};

setHostModel({
  stories: [{ id: 's0', name: 'Level 1', elevation: 0, height: 3000 }],
  elements: [draftedRafterRoof]
});

const geom2 = roofGeometry(draftedRafterRoof);
const framing2 = generateRoofFraming(draftedRafterRoof);
const asm2 = convertRoofEngineToAssembly(draftedRafterRoof, framing2, geom2);

console.log(`✓ Drafted 28' × 48' Conventional Rafters: ${asm2.rafters.length} rafters`);
if (asm2.rafters.length === 0) throw new Error('No rafters generated for drafted roof');

console.log('ALL PLAN DRAFTING & DISTANCE TESTS PASSED!');
