// Unit test for Timber Truss PDF Report Generation
import { generateTrussPDFReport, makeReport } from './report.js';

console.log('Testing Timber Truss PDF Engineering & Material Report Generation...');

const dummyAssembly = {
  trusses: [{
    id: 'TR-01',
    type: 'COMMON',
    span: 3.4,
    height: 0.91,
    profile: [[0, 0, 0], [1.7, 0, 0.91], [3.4, 0, 0]],
    members: [
      { id: 'TR-01:M1', role: 'top', sectionName: '2x4', widthMm: 38.1, depthMm: 88.9, plies: 1, a: [0, 0, 0], b: [1.7, 0, 0.91] },
      { id: 'TR-01:M2', role: 'bottom', sectionName: '2x4', widthMm: 38.1, depthMm: 88.9, plies: 1, a: [0, 0, 0], b: [3.4, 0, 0] },
      { id: 'TR-01:M3', role: 'web', sectionName: '2x4', widthMm: 38.1, depthMm: 88.9, plies: 1, a: [1.7, 0, 0.91], b: [1.7, 0, 0] }
    ],
    analysis: { ratio: 0.18, status: 'PASS', result: 'PASS' }
  }]
};

const pdfBytes = makeReport('Test Project', dummyAssembly, { jurisdiction: 'US-ASCE7-16/NDS2018' });
const result = generateTrussPDFReport(dummyAssembly, { jurisdiction: 'US-ASCE7-16/NDS2018' });

if (!pdfBytes || pdfBytes.length === 0) {
  console.error('FAILED: PDF Report generation returned invalid result.');
  process.exit(1);
}

console.log('PDF Report generated successfully!');
console.log(`- PDF Bytes: ${pdfBytes.length}`);
console.log('✓ Timber Truss PDF Engineering Report test passed successfully!');
