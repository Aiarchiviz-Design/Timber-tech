import { runCadTechTrussAnalysis, buildCadTechTrussBimOverrides } from './truss-analysis-core.js?v=20261105-nds-structured-audit-v5';
import { generateTrussPDFReport as exportTrussReport } from './report.js?v=20261105-truss-optimization-audit-report-v3';

const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const n = (value, digits = 2) => value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : '—';
const toast = message => {
  if (typeof window.toast === 'function') window.toast(message);
  else {
    const node = $('#toast');
    if (node) { node.textContent = message; node.classList.add('show'); }
  }
};

let lastResult = null;

function getCurrentGeometry() {
  if (typeof window.cadtechGet3DTrussGeometry !== 'function') {
    throw new Error('The roof framing geometry bridge is not available. Reload the project and generate roof framing first.');
  }
  const geometry = window.cadtechGet3DTrussGeometry();
  if (!geometry?.trusses?.length) {
    throw new Error('No generated roof trusses were found. Add or generate roof framing before running auto analysis.');
  }
  return geometry;
}

function defaultTributaryWidth(geometry) {
  const spacingM = Number(geometry?.trusses?.[0]?.spacing);
  return Number.isFinite(spacingM) && spacingM > 0 ? (spacingM / 0.3048).toFixed(2) : '2.00';
}

function openAnalysisDialog() {
  const geometry = (() => { try { return getCurrentGeometry(); } catch { return null; } })();
  const trussCount = geometry?.trusses?.length || 0;
  const modal = $('#modal');
  const body = $('#modal-body');
  const title = $('#modal-title');
  if (!modal || !body || !title) return;

  title.textContent = 'Automated Truss Analysis';
  body.innerHTML = `
    <div class="truss-analysis-shell">
      <section class="truss-analysis-hero">
        <div>
          <h3>Auto-size, optimize and independently screen every roof truss</h3>
          <p>Uses the current BIM roof framing geometry, keeps the actual chord/web topology, runs the V9.9.8 member-size and ply optimization workflow, then independently checks NDS ASD and iterates member sections, ply counts and eligible COMMON-truss web layouts until PASS or the configured search limit is reached.</p>
        </div>
        <span class="truss-analysis-chip">${trussCount ? `${trussCount} TRUSSES DETECTED` : 'ROOF MODEL REQUIRED'}</span>
      </section>
      <div class="truss-analysis-alert"><strong>Code and engineering scope:</strong> the independent check provided here is an NDS 2018 SPF No.2 reference workflow with an ASCE 7-16 ASD subset. It is <strong>not</strong> an Indian IS 883 / IS 875, Eurocode 5, AS 1720, or other local-code design check. The auto-size engine is a preliminary screening/optimization method, not a validated full structural solver or fabrication approval.</div>
      <div class="truss-settings-grid">
        <section class="truss-settings-group">
          <h4>Roof loading · psf</h4>
          ${field('dead','Roof dead load',10,'psf')}
          ${field('bottomDead','Ceiling / bottom chord dead',5,'psf','Used by the independent NDS service.') }
          ${field('bottomLive','Bottom chord live load',10,'psf','Used by the V9.9.8 auto-sizing workflow.') }
          ${field('roofLive','Roof live load',20,'psf')}
          ${field('snow','Roof snow load','','psf','Required. Enter 0 only if the site has no snow load. Sloped-roof snow coefficient is not applied in the NDS check.')}
          ${field('wind','Wind / uplift screen',20,'psf','Used by the auto-sizing workflow; not included in the independent NDS combinations.')}
        </section>
        <section class="truss-settings-group">
          <h4>Geometry · layout</h4>
          ${field('tribFt','Tributary width',defaultTributaryWidth(geometry),'ft','Defaults to current roof truss spacing; verify actual load width.')}
          ${field('chordLatMm','Chord lateral brace spacing',600,'mm','Assumed out-of-plane chord restraint spacing.')}
          ${field('braceLength','Compression brace trigger',2400,'mm','Screening threshold for long compression members.')}
          ${field('deflectionLimit','Auto-screen deflection limit',360,'L / ratio','V9.9.8 screening input; NDS service limits are L/240 and L/180.')}
        </section>
        <section class="truss-settings-group">
          <h4>Bearing & connection inputs</h4>
          ${field('bearingLength','Bearing length',89,'mm')}
          ${field('bearingCapacity','Bearing capacity',4,'kN / 89 mm','Assumed screening capacity; replace with verified project data.')}
          ${field('holdDownCapacity','Hold-down capacity',0,'kN each','0 = calculate a required capacity only; no product capacity verified.')}
          ${field('plateCapacity','Joint / plate capacity',0,'kN per joint','0 = calculate a requirement only; proprietary connector capacity not verified.')}
        </section>
        <section class="truss-settings-group">
          <h4>Optimization controls</h4>
          <label class="truss-input-field">Maximum plies
            <select id="truss-setting-maxPly"><option value="1">1 ply</option><option value="2">2 plies</option><option value="3">3 plies</option><option value="4">4 plies</option><option value="5" selected>5 plies</option></select>
          </label>
          ${field('ndsRounds','Maximum NDS optimization rounds',12,'iterations','Per truss; stops at a genuine NDS pass or when no supported improvement remains.')}
          <label class="truss-input-field">Timber reference
            <input value="SPF No.2 · NDS 2018" readonly aria-readonly="true">
            <span class="truss-input-hint">Reference values are fixed in the currently integrated independent analysis service.</span>
          </label>
          <label class="truss-input-field">Geometry source
            <input value="Current BIM roof framing" readonly aria-readonly="true">
            <span class="truss-input-hint">Truss geometry only; this workflow does not invent sample trusses.</span>
          </label>
        </section>
      </div>
      <div class="truss-analysis-controls">
        <span class="truss-source">${trussCount ? `Source: live 3D BIM roof geometry · ${trussCount} assemblies` : 'Generate roof framing to enable analysis.'}</span>
        <button id="truss-run-analysis" class="truss-action-btn" ${trussCount ? '' : 'disabled'}>Run Auto Analysis + NDS ASD Optimize</button>
      </div>
      <div id="truss-analysis-output" class="truss-analysis-empty">${lastResult ? 'Previous analysis is available in this session. Run again to refresh it from the current BIM geometry.' : 'Analysis results will appear here. The PDF export uses these analyzed trusses and the values entered above.'}</div>
    </div>`;

  if (!modal.open) modal.showModal();
  $('#truss-run-analysis', body)?.addEventListener('click', runFromDialog);
  if (lastResult) renderResults(lastResult);
}

function field(id, label, value, unit, hint = '') {
  return `<label class="truss-input-field">${esc(label)} <input id="truss-setting-${id}" type="number" step="any" value="${esc(value)}"> <span class="truss-input-hint">${esc(unit)}${hint ? ` · ${esc(hint)}` : ''}</span></label>`;
}

function readSettings() {
  const value = (id, fallback) => {
    const raw = $(`#truss-setting-${id}`)?.value;
    const parsed = Number(raw);
    return raw !== '' && Number.isFinite(parsed) ? parsed : fallback;
  };
  return {
    dead: value('dead', 10),
    bottomDead: value('bottomDead', 5),
    bottomLive: value('bottomLive', 10),
    roofLive: value('roofLive', 20),
    snow: value('snow', NaN),  // required: left NaN when blank so the analysis refuses to run
    wind: value('wind', 20),
    tribFt: value('tribFt', 2),
    chordLatMm: value('chordLatMm', 600),
    braceLength: value('braceLength', 2400),
    deflectionLimit: value('deflectionLimit', 360),
    bearingLength: value('bearingLength', 89),
    bearingCapacity: value('bearingCapacity', 4),
    holdDownCapacity: value('holdDownCapacity', 0),
    plateCapacity: value('plateCapacity', 0),
    maxPly: Number($('#truss-setting-maxPly')?.value || 5),
    maxNdsRounds: value('ndsRounds', 12),
    units: 'imperial',
    projectName: $('#project-name')?.textContent?.trim() || 'CadTech Project',
  };
}

function statusPill(value) {
  const status = String(value || 'NOT RUN').toUpperCase();
  const cls = status === 'PASS' ? '' : status === 'FAIL' ? 'fail' : 'review';
  return `<span class="truss-status-pill ${cls}">${esc(status)}</span>`;
}

function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function optimizationCsv(result) {
  const headers = [
    'Truss', 'Family', 'Phase', 'Change Type', 'Member', 'Role',
    'Before Section', 'Before Width mm', 'Before Depth mm', 'Before Plies', 'Before Total Width mm',
    'After Section', 'After Width mm', 'After Depth mm', 'After Plies', 'After Total Width mm',
    'Initial Member D/C', 'Final Member D/C', 'Initial NDS Result', 'Final NDS Result',
    'Rounds Used', 'Rounds Allowed', 'Reason', 'Unresolved Items',
  ];
  const rows = [headers];
  for (const truss of result?.assembly?.trusses || []) {
    const audit = truss.optimizationAudit || {};
    const changes = [ ...(audit.autoSizeChanges || []), ...(audit.ndsChanges || []) ];
    if (!changes.length) {
      rows.push([
        truss.id, truss.type, '—', 'no-change', '—', '—', '', '', '', '', '', '', '', '', '', '', '', '',
        audit.initialNds?.result || 'NOT RUN', audit.finalNds?.result || truss.ndsASDAnalysis?.overall || 'NOT RUN',
        audit.roundsUsed ?? 0, audit.roundsAllowed ?? result.settings?.maxNdsRounds ?? '',
        'No member-size, ply or topology changes recorded.', (truss.ndsOptimization?.unresolved || []).join(' | '),
      ]);
      continue;
    }
    for (const change of changes) {
      const before = change.before || {}, after = change.after || {};
      rows.push([
        truss.id, truss.type, change.phase, change.changeType, change.memberId, change.role,
        before.sectionName || before.webStyle || '', before.widthMm ?? '', before.depthMm ?? '', before.plies ?? '', before.totalWidthMm ?? '',
        after.sectionName || after.webStyle || '', after.widthMm ?? '', after.depthMm ?? '', after.plies ?? '', after.totalWidthMm ?? '',
        change.beforeRatio ?? '', change.afterRatio ?? '',
        audit.initialNds?.result || 'NOT RUN', audit.finalNds?.result || truss.ndsASDAnalysis?.overall || 'NOT RUN',
        audit.roundsUsed ?? 0, audit.roundsAllowed ?? result.settings?.maxNdsRounds ?? '',
        change.reason || '', (truss.ndsOptimization?.unresolved || []).join(' | '),
      ]);
    }
  }
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}

function downloadOptimizationCsv(result) {
  const blob = new Blob([`\uFEFF${optimizationCsv(result)}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'CadTech_Truss_Optimization_Change_Log.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderResults(result) {
  const output = $('#truss-analysis-output');
  if (!output) return;
  const s = result.summary;
  const rows = result.assembly.trusses.map(truss => {
    const nds = truss.ndsASDAnalysis || {};
    const ndsRatios = (nds.members || []).map(member => member.governing?.ratio).filter(value => value !== null && value !== undefined && Number.isFinite(Number(value))).map(Number);
    const maxNds = ndsRatios.length ? Math.max(0, ...ndsRatios) : null;
    const roleLabel = role => {
      const members = (truss.members || []).filter(member => (member.role === 'overhang' ? 'top' : member.role) === role);
      const variants = [...new Set(members.map(member => `${member.sectionName || '2x4'}${(member.ndsPlies || member.plies || member.ply || 1) > 1 ? ` · ${member.ndsPlies || member.plies || member.ply} ply` : ''}`))];
      return variants.length ? `${role[0].toUpperCase()}:${variants.join(', ')}` : '';
    };
    const sizeText = ['top','bottom','web'].map(roleLabel).filter(Boolean).join(' / ') || 'existing sizes';
    const autoStatus = truss.design?.result || 'NOT RUN';
    const maxPly = Math.max(1, ...(truss.members || []).map(member => Number(member.ndsPlies || member.plies || member.ply || truss.analysis?.ply || truss.ply) || 1));
    const detail = [
      truss.design?.actions?.length ? `V9.9.8 actions: ${truss.design.actions.join('; ')}` : 'No V9.9.8 size/ply changes recorded.',
      truss.ndsOptimization?.actions?.length ? `NDS optimization actions: ${truss.ndsOptimization.actions.join('; ')}` : 'No NDS-driven member changes required.',
      truss.ndsOptimization?.unresolved?.length ? `NDS items still requiring review: ${truss.ndsOptimization.unresolved.join('; ')}` : '',
      truss.design?.failures?.length ? `Auto-screen failures: ${truss.design.failures.join('; ')}` : 'No auto-screen failure reasons recorded.',
      ...(truss.engineering?.transfersIn || []).map(link => `Load received from ${link.from}: ${n(link.designReaction_kN,2)} kN · ${link.status || 'review'}`),
      ...(truss.engineering?.transfersOut || []).map(link => `Load sent to ${link.to}: ${n(link.designReaction_kN,2)} kN · ${link.status || 'review'}`),
      ...(nds.warnings || []),
      nds.error ? `NDS error: ${nds.error}` : '',
      `NDS unstable: ${nds.unstable ? 'yes' : 'no'}`,
    ].filter(Boolean).join(' · ');
    const memberRows = (nds.members || []).map(m => `<tr><td>${esc(m.id)}</td><td>${esc(m.kind)}</td><td>${esc(m.sizeLabel)}</td><td>${n(m.lengthMm,0)} mm</td><td>${esc(m.governing?.check || '—')}</td><td>${n(m.governing?.ratio,3)}</td><td>${n(m.slendernessMax,1)}</td><td>${statusPill(m.status)}</td></tr>`).join('');
    const audit = truss.optimizationAudit || {};
    const auditChanges = [ ...(audit.autoSizeChanges || []), ...(audit.ndsChanges || []) ];
    const auditRows = auditChanges.map(change => {
      const b = change.before || {}, a = change.after || {};
      const beforeText = b.webStyle ? `${b.webStyle} (${b.memberCount ?? '—'} members)` : b.sectionName ? `${b.sectionName} · ${b.widthMm}×${b.depthMm} mm · ${b.plies} ply` : '—';
      const afterText = a.webStyle ? `${a.webStyle} (${a.memberCount ?? '—'} members)` : a.sectionName ? `${a.sectionName} · ${a.widthMm}×${a.depthMm} mm · ${a.plies} ply` : '—';
      return `<tr><td>${esc(change.phase)}</td><td>${esc(change.memberId)}</td><td>${esc(change.role)}</td><td>${esc(beforeText)}</td><td>${esc(afterText)}</td><td>${n(change.beforeRatio,3)} → ${n(change.afterRatio,3)}</td><td>${esc(change.reason)}</td></tr>`;
    }).join('');
    const auditSummary = `NDS before iterative optimization: ${audit.initialNds?.result || 'NOT RUN'} · ${audit.initialNds?.failedMembers ?? '—'} failed member(s) · max D/C ${n(audit.initialNds?.maxRatio,3)}; final: ${audit.finalNds?.result || nds.overall || 'NOT RUN'} · ${audit.finalNds?.failedMembers ?? '—'} failed member(s) · max D/C ${n(audit.finalNds?.maxRatio,3)}. Rounds used: ${audit.roundsUsed ?? truss.ndsOptimization?.rounds ?? 0}/${audit.roundsAllowed ?? result.settings.maxNdsRounds ?? 12}.`;
    return `<tr>
      <td><strong>${esc(truss.id)}</strong><br><small>${esc(truss.type)}</small></td>
      <td>${n(truss.span,2)} m</td>
      <td>${esc(sizeText)}<br><small>${esc('up to ' + maxPly + ' ply')}</small></td>
      <td>${n(truss.analysis?.ratio,3)}</td>
      <td>${statusPill(autoStatus)}</td>
      <td>${n(maxNds,3)}</td>
      <td>${statusPill(nds.overall || 'NOT RUN')}</td>
      <td><details><summary>Member checks / optimization audit</summary><div class="truss-result-detail"><p class="truss-audit-summary">${esc(auditSummary)}</p>${esc(detail)}${auditRows ? `<div class="truss-result-table-wrap truss-audit-wrap"><table class="truss-result-table truss-audit-table"><thead><tr><th>Phase</th><th>Member</th><th>Role</th><th>Before</th><th>After</th><th>D/C before → after</th><th>Reason</th></tr></thead><tbody>${auditRows}</tbody></table></div>` : '<p>No section, ply or topology changes were required.</p>'}${memberRows ? `<div class="truss-result-table-wrap"><table class="truss-result-table"><thead><tr><th>Member</th><th>Type</th><th>Size</th><th>Length</th><th>Governing check</th><th>D/C</th><th>Le/d</th><th>Status</th></tr></thead><tbody>${memberRows}</tbody></table></div>` : ''}</div></details></td>
    </tr>`;
  }).join('');

  output.className = 'truss-analysis-results';
  output.innerHTML = `
    <div class="truss-analysis-kpis">
      <div class="truss-analysis-kpi"><span>Trusses analyzed</span><b>${s.trusses}</b><small>Current BIM assemblies</small></div>
      <div class="truss-analysis-kpi"><span>Auto-size pass</span><b>${s.autoSizingPass}</b><small>${s.autoSizingFail} screen failures</small></div>
      <div class="truss-analysis-kpi"><span>NDS ASD pass</span><b>${s.ndsPass}</b><small>${s.ndsFail} fail · ${s.ndsNotRun} not run</small></div>
      <div class="truss-analysis-kpi"><span>Optimizer rounds</span><b>${(result.sizingSummary?.rounds ?? 0) + (result.sizingSummary?.ndsOptimizationRounds ?? 0)}</b><small>${result.sizingSummary?.rounds ?? 0} auto · ${result.sizingSummary?.ndsOptimizationRounds ?? 0} NDS</small></div>
      <div class="truss-analysis-kpi"><span>Analysis disposition</span><b style="font-size:14px;margin-top:9px">${esc(s.overall)}</b><small>${s.ndsPass}/${s.trusses} final NDS ASD passes · engineer review required</small></div>
    </div>
    <div class="truss-analysis-actions-summary"><strong>Automatic NDS actions:</strong> ${s.ndsMembersResized || 0} member size increases · ${s.ndsPliesAdded || 0} ply additions · ${s.ndsWebStylesChanged || 0} web-style changes · ${s.auditedChanges || 0} auditable change records · up to ${result.settings.maxNdsRounds || 12} NDS rounds per truss. ${s.initialNdsFail || 0} truss(es) failed the initial NDS check before iterative optimization. ${result.bimOverridesApplied ? `${result.bimOverridesApplied} truss designs and their change audits saved to source BIM roof assemblies.` : 'No source BIM override bridge was available; review the analysis result in this session.'}</div>
    <section class="truss-result-section"><h4>Truss-by-truss independent results</h4><div class="truss-result-table-wrap"><table class="truss-result-table"><thead><tr><th>Truss / family</th><th>Span</th><th>Selected sections</th><th>Auto D/C</th><th>Auto screen</th><th>NDS D/C</th><th>NDS ASD</th><th>Details</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <section class="truss-result-section"><h4>Analysis assumptions and limitations</h4><div style="padding:12px 14px">${result.limitations.map(item => `<p class="truss-result-note">• ${esc(item)}</p>`).join('')}<p class="truss-result-note"><strong>Capacity inputs:</strong> ${result.settings.holdDownCapacity > 0 ? 'hold-down capacity supplied by user; confirm exact connector, fasteners and substrate.' : 'no hold-down product capacity supplied; software output is a required capacity only.'} ${result.settings.plateCapacity > 0 ? 'joint/plate capacity supplied by user; verify manufacturer data.' : 'no connector-plate capacity supplied; output is a required capacity only.'} Bearing capacity is a user-entered screening assumption.</p></div></section>
    <div class="truss-report-actions"><button id="truss-analysis-close" class="truss-action-btn light">Close</button><button id="truss-analysis-csv" class="truss-action-btn secondary">Download Optimization CSV</button><button id="truss-analysis-pdf" class="truss-action-btn">Export CadTech Truss Design PDF</button></div>`;

  $('#truss-analysis-pdf')?.addEventListener('click', () => exportTrussReport(result.assembly, result.settings));
  $('#truss-analysis-csv')?.addEventListener('click', () => downloadOptimizationCsv(result));
  $('#truss-analysis-close')?.addEventListener('click', () => $('#modal')?.close());
}

function runFromDialog() {
  const button = $('#truss-run-analysis');
  const output = $('#truss-analysis-output');
  if (!button || !output) return;
  let geometry;
  try { geometry = getCurrentGeometry(); }
  catch (error) { toast(error.message); return; }
  const settings = readSettings();
  button.disabled = true;
  button.textContent = 'Optimizing all roof trusses for NDS ASD…';
  output.className = 'truss-analysis-empty';
  output.textContent = 'Running auto-size screening, member section upgrades, ply additions, eligible web-style alternatives and independent NDS ASD re-checks…';
  try {
    const result = runCadTechTrussAnalysis(geometry, settings);
    const bimDesigns = buildCadTechTrussBimOverrides(result.assembly);
    result.bimOverridesApplied = typeof window.cadtechSetTrussAnalysisDesign === 'function'
      ? window.cadtechSetTrussAnalysisDesign(bimDesigns)
      : 0;
    lastResult = result;
    window.cadtechLastTrussAnalysis = result;
    window.currentRoofAssembly = result.assembly;
    renderResults(result);
    const actions = result.summary.ndsMembersResized + result.summary.ndsPliesAdded + result.summary.ndsWebStylesChanged;
    toast(`Auto analysis complete: ${result.summary.ndsPass}/${result.summary.trusses} NDS ASD PASS after ${actions} automatic member actions. Engineer review required.`);
  } catch (error) {
    console.error('CadTech auto truss analysis failed:', error);
    output.className = 'truss-analysis-empty';
    output.textContent = `Analysis failed: ${error?.message || String(error)}. Review truss topology and geometry, then try again.`;
    toast('Auto truss analysis failed. See the analysis panel for details.');
  } finally {
    button.disabled = false;
    button.textContent = 'Run Auto Analysis + NDS ASD Optimize';
  }
}

// Keep the existing top-bar PDF button working, but require a current real analysis.
window.generateTrussPDFReport = (assembly = null, settings = {}) => {
  const analyzed = assembly || window.cadtechLastTrussAnalysis?.assembly;
  if (!analyzed?.trusses?.length) {
    openAnalysisDialog();
    toast('Run Auto Analyze Trusses first, then export the CadTech Truss Design PDF.');
    return null;
  }
  return exportTrussReport(analyzed, { ...(window.cadtechLastTrussAnalysis?.settings || {}), ...settings });
};

$('#truss-analysis-btn')?.addEventListener('click', openAnalysisDialog);

// Expose a small integration surface for the existing Truss Elevation & Stresses workspace.
window.cadtechRunAutoTrussAnalysis = (settings = {}) => {
  const result = runCadTechTrussAnalysis(getCurrentGeometry(), settings);
  result.bimOverridesApplied = typeof window.cadtechSetTrussAnalysisDesign === 'function'
    ? window.cadtechSetTrussAnalysisDesign(buildCadTechTrussBimOverrides(result.assembly))
    : 0;
  lastResult = result;
  window.cadtechLastTrussAnalysis = result;
  window.currentRoofAssembly = result.assembly;
  return result;
};
