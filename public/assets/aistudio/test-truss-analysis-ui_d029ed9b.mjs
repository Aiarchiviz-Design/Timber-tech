import assert from 'node:assert/strict';
import fs from 'node:fs';
const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const ui = fs.readFileSync(new URL('./truss-analysis-ui.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('./truss-analysis-ui.css', import.meta.url), 'utf8');
assert.match(html, /id="truss-analysis-btn"[^>]*>Run Auto Analysis on All Trusses/);
assert.match(html, /id="truss-pdf-btn"[^>]*>CadTech Truss Design PDF/);
assert.match(html, /src="truss-analysis-ui\.js\?/);
assert.match(html, /href="truss-analysis-ui\.css\?/);
assert.match(ui, /cadtechGet3DTrussGeometry/);
assert.match(ui, /runCadTechTrussAnalysis/);
assert.match(ui, /Maximum NDS optimization rounds/);
assert.match(ui, /Run Auto Analysis \+ NDS ASD Optimize/);
assert.match(ui, /window\.cadtechLastTrussAnalysis/);
assert.match(ui, /Export CadTech Truss Design PDF/);
assert.match(ui, /IS 883 \/ IS 875/);
assert.match(ui, /no connector-plate capacity supplied/);
assert.match(css, /truss-analysis-kpis/);
// Key pre-existing wall/dimension hooks remain present.
for (const id of ['framing-plan-dxf-btn','wall-panel-pdf-btn','wall-panel-dxf-btn','wall-panel-dwg-btn','wall-dimensions-toggle','wall-blocking-toggle']) {
  assert.ok(html.includes(`id="${id}"`), `existing UI hook ${id} must remain`);
}
console.log('CadTech truss analysis UI integration test passed; existing wall/dimension tool hooks retained.');

assert.ok(ui.includes('Download Optimization CSV'), 'truss analysis UI should expose optimization CSV export');
assert.ok(ui.includes('Member checks / optimization audit'), 'truss analysis UI should display per-truss structured change audit');
assert.ok(ui.includes('initialNds'), 'truss analysis UI should compare initial and final NDS results');
