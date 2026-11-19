import assert from 'node:assert/strict';
import { runCadTechTrussAnalysis, trussGeometryToAssembly } from './truss-analysis-core.js';
import { makeReport, generateTrussPDFReport } from './report.js';

const segment = (x1, y1, x2, y2, type, width = 38.1, depth = 88.9) => ({ x1, y1, x2, y2, type, width, depth });
const geometry = {
  trusses: [{
    tag: 'TEST-T1', code: 'COMMON', assemblyId: 'TEST-A1', roofId: 'ROOF-1',
    span: 8, height: 2.1, pitch: 22.5, spacing: 0.6,
    top: [
      segment(0, 0.4, 2, 1.25, 'top chord'),
      segment(2, 1.25, 4, 2.1, 'top chord'),
      segment(4, 2.1, 6, 1.25, 'top chord'),
      segment(6, 1.25, 8, 0.4, 'top chord'),
    ],
    bottom: [
      segment(0, 0, 2, 0, 'bottom chord'),
      segment(2, 0, 4, 0, 'bottom chord'),
      segment(4, 0, 6, 0, 'bottom chord'),
      segment(6, 0, 8, 0, 'bottom chord'),
    ],
    webs: [
      segment(2, 0, 2, 1.25, 'web'),
      segment(6, 0, 6, 1.25, 'web'),
      segment(2, 1.25, 4, 0, 'web'),
      segment(6, 1.25, 4, 0, 'web'),
      segment(4, 2.1, 4, 0, 'web'),
      // heel webs and rigidity diagonals: without them the eave ends are free and the truss is a mechanism
      segment(0, 0, 0, 0.4, 'web'),
      segment(8, 0, 8, 0.4, 'web'),
      segment(2, 0, 0, 0.4, 'web'),
      segment(6, 0, 8, 0.4, 'web'),
    ],
  }],
};

const result = runCadTechTrussAnalysis(geometry, {
  dead: 10, bottomDead: 5, roofLive: 20, snow: 0, wind: 20,
  tribFt: 2, chordLatMm: 600, braceLength: 2400,
  bearingLength: 89, bearingCapacity: 4,
  holdDownCapacity: 0, plateCapacity: 0, maxPly: 5,
});

assert.equal(result.summary.trusses, 1, 'one real BIM truss should be analyzed');
const truss = result.assembly.trusses[0];
assert.equal(truss.id, 'TEST-T1');
assert.ok(truss.members.length >= 10, 'actual chord/web topology should be retained');
assert.ok(truss.analysis?.members?.length, 'V9.9.8 auto-sizing engine should return member checks');
assert.ok(['PASS', 'FAIL'].includes(truss.design?.result), 'auto sizing must have a concrete screen outcome');
assert.ok(truss.ndsASDAnalysis, 'independent NDS ASD analysis should be present');
assert.ok(truss.ndsASDAnalysis.members.length, 'NDS member checks should be returned');
assert.ok(truss.ndsASDAnalysis.members[0].sizeLabel.match(/^38\.1x\d+(\.\d+)?( · \d+ ply)?$/), '38.1 x 88.9 mm timber section must be passed to NDS in mm (38.1 mm board width, catalog depth, optional ply count)');
assert.ok(truss.ndsASDAnalysis.members.every(m => m.sizeLabel && !/^0\.0\d+x0\.0\d+/.test(m.sizeLabel)), 'NDS check must receive millimetre-scale member sections, not metre values mislabeled as millimetres');
assert.ok(result.limitations.some(x => /not an Indian IS 883 \/ IS 875/.test(x)), 'jurisdiction limitation must be explicit');
assert.ok(result.settings.spacingMm > 0, 'model spacing should be preserved in mm');


// Confirm the BIM adapter preserves explicit jack/hip -> girder load-transfer links.
const transferGeometry = {
  trusses: [
    { ...geometry.trusses[0], tag: 'JK-01', code: 'JK', assemblyId: 'JACK-A', connections: [
      { targetTag: 'HG-01', targetAssemblyId: 'GIRDER-A', localX: 4.0, snapDistanceMm: 12, relation: 'test geometry link' },
    ] },
    { ...geometry.trusses[0], tag: 'HG-01', code: 'HG', assemblyId: 'GIRDER-A', connections: [] },
  ],
};
const transferAssembly = trussGeometryToAssembly(transferGeometry);
assert.equal(transferAssembly.trusses[0].connections[0].to, 'HG-01');
assert.equal(transferAssembly.trusses[0].connections[0].point[0], 4.0);
const transferResult = runCadTechTrussAnalysis(transferGeometry, {
  dead: 10, bottomDead: 5, roofLive: 20, snow: 0, wind: 20, tribFt: 2,
  chordLatMm: 600, braceLength: 2400, bearingLength: 89, bearingCapacity: 4,
  holdDownCapacity: 0, plateCapacity: 0, maxPly: 5,
});
const girder = transferResult.assembly.trusses.find(t => t.id === 'HG-01');
assert.ok(girder?.engineering?.transfersIn?.some(link => link.from === 'JK-01'), 'girder should receive the jack load path from the BIM connection link');

const pdf = makeReport('CadTech Test Project', result.assembly, result.settings, 'metric');
assert.ok(pdf instanceof Uint8Array && pdf.length > 1000, 'PDF should be created from analyzed BIM assembly');
const pdfText = new TextDecoder().decode(pdf);
for (const required of [
  'ROOF TRUSS DESIGN-ASSIST & ANALYSIS SUMMARY',
  'INDEPENDENT NDS ASD CHECK',
  'PRELIMINARY / NOT A PE SEAL',
  'NOT A PE SEAL OR APPROVAL',
  'DESIGN REVIEW & LIMITATIONS',
  'fabrication release',
]) assert.ok(pdfText.toLowerCase().includes(required.toLowerCase()), `PDF should contain: ${required}`);
for (const prohibited of ['CA PE #78421', 'PE-48201', 'PROFESSIONAL ENGINEER SEAL', 'VERIFIED FOR FABRICATION']) {
  assert.ok(!pdfText.includes(prohibited), `Truss PDF must not contain fabricated credential or fabrication claim: ${prohibited}`);
}
assert.equal(generateTrussPDFReport(), null, 'PDF export without an analyzed real assembly must not fabricate sample data');
console.log(`CadTech auto truss analysis + PDF test passed: ${result.summary.trusses} truss, ${truss.members.length} retained members, auto screen ${truss.design.result}, NDS ${truss.ndsASDAnalysis.overall}, ${pdf.length} PDF bytes; jack-to-girder transfer integration passed.`);
