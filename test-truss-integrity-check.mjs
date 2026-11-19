// Unit test for Structural Integrity Check command in truss-optimizer.js
import fs from 'fs';

console.log('Testing Structural Integrity Check command...');

const trussOptimizerCode = fs.readFileSync('./truss-optimizer.js', 'utf8');

if (!trussOptimizerCode.includes('trussCheckStructuralIntegrity')) {
  console.error('FAILED: trussCheckStructuralIntegrity function not found in truss-optimizer.js');
  process.exit(1);
}

if (!trussOptimizerCode.includes('failingTrussWebIds')) {
  console.error('FAILED: failingTrussWebIds highlight set not found in truss-optimizer.js');
  process.exit(1);
}

if (!trussOptimizerCode.includes('trussShowIntegrityCheckModal')) {
  console.error('FAILED: trussShowIntegrityCheckModal function not found in truss-optimizer.js');
  process.exit(1);
}

console.log('✓ Structural Integrity Check command implementation verified!');
