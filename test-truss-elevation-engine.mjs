import assert from 'node:assert';
import {
  STANDARD_TIMBER_GRADES,
  COMMON_WOOD_SECTIONS,
  createSection,
  calculateMemberStresses,
  getSectionSuggestions,
  createSampleFinkTruss,
  recalculateTrussMembers,
} from './src/services/trussStressEngine.ts';

console.log('Testing 2D Roof Truss Structural Mechanics & Stress Engine...');

// 1. Verify standard wood grades
assert(STANDARD_TIMBER_GRADES.NO2_SPF, 'SPF grade exists');
assert(STANDARD_TIMBER_GRADES.DFL_NO1, 'DFL grade exists');
assert(STANDARD_TIMBER_GRADES.C24, 'C24 grade exists');

// 2. Verify section properties
const sec2x4 = COMMON_WOOD_SECTIONS.find(s => s.id === '2x4');
assert(sec2x4, '2x4 section exists');
assert.strictEqual(sec2x4.width, 38);
assert.strictEqual(sec2x4.depth, 89);
assert.strictEqual(sec2x4.area, 38 * 89);

// 3. Test Pure Tension Member
const tensionMember = {
  id: 'BC-TEST',
  startNodeId: 1,
  endNodeId: 2,
  type: 'bottom_chord',
  section: sec2x4,
  grade: STANDARD_TIMBER_GRADES.DFL_NO1,
  length: 2.5,
  axialForce: 15.0, // +15 kN tension
  axialStress: 0,
  allowableStress: 0,
  slendernessRatio: 0,
  capacityKN: 0,
  utilization: 0,
  status: 'SAFE',
  governingCheck: 'Tension',
};

const trussMock = {
  id: 'TR-MOCK',
  tag: 'TR-MOCK',
  name: 'Mock Truss',
  type: 'fink',
  role: 'Common',
  span: 10.0,
  height: 2.5,
  pitch: 20.0,
  overhang: 0.45,
  spacing: 0.6,
  baseElevation: 2.7,
  nodes: [],
  members: [],
  maxUtilization: 0,
  maxDeflection: 5.0,
  allowableDeflection: 25.0,
  reactionLeft: 12.0,
  reactionRight: 12.0,
  integrityStatus: 'PASS',
};

const tensResult = calculateMemberStresses(tensionMember, sec2x4, trussMock);
console.log('Tension Member Result:', tensResult);
assert.strictEqual(tensResult.governingCheck, 'Tension');
assert(tensResult.capacityKN > 0, 'Tensile capacity is positive');
assert(tensResult.utilization > 0 && tensResult.utilization < 1.0, 'Tension utilization valid');

// 4. Test Column Buckling on Web Member
const webCompMember = {
  id: 'W-TEST',
  startNodeId: 2,
  endNodeId: 6,
  type: 'web_strut',
  section: sec2x4,
  grade: STANDARD_TIMBER_GRADES.DFL_NO1,
  length: 1.8,
  axialForce: -8.0, // -8 kN compression
  axialStress: 0,
  allowableStress: 0,
  slendernessRatio: 0,
  capacityKN: 0,
  utilization: 0,
  status: 'SAFE',
  governingCheck: 'Compression',
};

const compResult = calculateMemberStresses(webCompMember, sec2x4, trussMock);
console.log('Compression Member Result:', compResult);
assert.strictEqual(compResult.governingCheck, 'Compression');
assert(compResult.slenderness > 0, 'Slenderness calculated');
assert(compResult.allowableStress > 0, 'Allowable compressive stress with Cp calculated');

// 5. Test Combined Bending + Axial Compression on Top Chord
const topChordMember = {
  id: 'TC-TEST',
  startNodeId: 1,
  endNodeId: 6,
  type: 'top_chord',
  section: COMMON_WOOD_SECTIONS.find(s => s.id === '2x6'),
  grade: STANDARD_TIMBER_GRADES.DFL_NO1,
  length: 2.8,
  axialForce: -20.0, // -20 kN compression
  axialStress: 0,
  allowableStress: 0,
  slendernessRatio: 0,
  capacityKN: 0,
  utilization: 0,
  status: 'SAFE',
  governingCheck: 'Combined',
};

const topResult = calculateMemberStresses(topChordMember, topChordMember.section, trussMock);
console.log('Top Chord Combined Result:', topResult);
assert.strictEqual(topResult.governingCheck, 'Combined');
assert(topResult.utilization > 0, 'Top chord utilization accounts for panel bending');

// 6. Test Section Suggestions
const suggestions = getSectionSuggestions(topChordMember, trussMock);
console.log('Suggestions for top chord count:', suggestions.length);
assert(suggestions.length > 0, 'Section suggestions generated');
assert(suggestions.some(s => s.type === 'OPTIMAL' || s.type === 'PASSING'), 'Passing section suggested');

// 7. Test Fink Truss Structure Recalculation
const finkTruss = createSampleFinkTruss();
console.log('Fink Truss Max Util:', finkTruss.maxUtilization, 'Status:', finkTruss.integrityStatus);
assert.strictEqual(finkTruss.tag, 'T-004');
assert.strictEqual(finkTruss.integrityStatus, 'PASS');
assert(finkTruss.members.length === 12, '12 members in Common Fink Truss');

console.log('✓ All 2D Truss Elevation and Stress Engine tests passed successfully!');
