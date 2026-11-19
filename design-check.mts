// Usage:  npx tsx design-check.mts [out.md]
// Runs the advanced ASD truss check on the app's sample Fink truss and writes a markdown calculation summary.
import { writeFileSync } from 'node:fs';
import { analyzeTruss, advInputFromTruss, reportToMarkdown } from './src/services/trussAdvancedAnalysis.ts';
import { createSampleFinkTruss } from './src/services/trussStressEngine.ts';

const truss: any = createSampleFinkTruss();
const report = analyzeTruss(advInputFromTruss(truss));
const md = reportToMarkdown('Advanced truss check: sample Fink truss (NDS 2018 / ASCE 7 ASD)', report);
const out = process.argv[2] ?? 'truss-design-check.md';
writeFileSync(out, md);
console.log(`Overall: ${report.overall}  (${report.members.filter(m => m.status === 'FAIL').length} member(s) fail)`);
console.log(`Report written to ${out}`);
