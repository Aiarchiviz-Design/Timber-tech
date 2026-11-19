/* Ireland-aware wall-panel design brief. This records inputs; it is not a code-compliance solver. */
const DESIGN_REGIONS={
  US:{name:'United States',standard:'Adopted IBC / ASCE 7 / NDS edition for the project'},
  CA:{name:'Canada',standard:'NBCC / CSA O86 plus applicable provincial/territorial adoption'},
  AU:{name:'Australia',standard:'NCC / AS 1720.1 and applicable AS 1684 edition'},
  UK:{name:'United Kingdom',standard:'UK Building Regulations / applicable UK National Annexes'},
  IE:{name:'Ireland (Republic)',standard:'Irish Building Regulations Part A / TGD A + applicable I.S. EN Eurocodes and Irish National Annexes'}
};
const IRELAND_DESIGN_REFERENCES=[
  {title:'Technical Guidance Document A — Structure',url:'https://www.gov.ie/en/department-of-housing-local-government-and-heritage/publications/technical-guidance-document-a-structure/'},
  {title:'NSAI — Eurocodes in Ireland and 2nd-generation adoption updates',url:'https://www.nsai.ie/standards/sectors/construction-standards/the-eurocodes/'},
  {title:'Irish National Annex to EN 1991-1-3 — Snow loads',url:'https://shop.standards.ie/en-ie/standards/na-a2-2020-to-i-s-en-1991-1-3-2003-a1-2015-883849_saig_nsai_nsai_2905467/'},
  {title:'Irish National Annex to EN 1995-1-1 — Timber structures',url:'https://shop.standards.ie/en-ie/standards/na-a1-to-i-s-en-1995-1-1-2005-874304_saig_nsai_nsai_3074180/'}
];
const IE_FIELDS=[
  ['siteLocation','Site location / town / county / Eircode','text',''],
  ['authority','Building Control Authority / project reviewer','text',''],
  ['codeEdition','Confirmed code editions / project specification','text',''],
  ['loadCombinationBasis','Load combinations / partial-factor basis','select',''],
  ['siteAltitudeM','Site altitude above sea level','number','m AOD'],
  ['terrainExposure','Terrain / exposure description','select',''],
  ['basicWindVelocityMS','Basic wind velocity vb,0 (site basis)','number','m/s'],
  ['floorDeadKNm2','Floor permanent action (Gk)','number','kN/m²'],
  ['floorImposedKNm2','Floor imposed action (Qk; use category noted)','number','kN/m²'],
  ['roofDeadKNm2','Roof permanent action (Gk)','number','kN/m²'],
  ['roofImposedKNm2','Roof imposed / maintenance action (Qk)','number','kN/m²'],
  ['groundSnowKNm2','Characteristic ground snow load sk (site basis)','number','kN/m²'],
  ['roofSnowKNm2','Calculated characteristic roof snow action','number','kN/m²'],
  ['windPressureKNm2','Net wall wind pressure (incl. pressure coefficients)','number','kN/m²'],
  ['windSuctionKNm2','Net wall wind suction / uplift','number','kN/m²'],
  ['roofUpliftKNm2','Net roof uplift for load path / anchorage','number','kN/m²'],
  ['wallGravityLineKNm','Wall / top-plate gravity line load','number','kN/m'],
  ['maxPointReactionKN','Maximum beam / truss point reaction at wall','number','kN'],
  ['timberGrade','Timber strength class','select',''],
  ['serviceClass','Timber service class per EN 1995-1-1','select',''],
  ['osbGrade','OSB product class / DoP','select',''],
  ['osbThicknessMM','Exterior OSB thickness','number','mm'],
  ['osbEdgeFixingSpacingMM','OSB edge fastener spacing (engineered value)','number','mm'],
  ['osbFieldFixingSpacingMM','OSB field fastener spacing (engineered value)','number','mm'],
  ['lateralSystem','Lateral / racking resistance system','select',''],
  ['loadNotes','Load sources, occupancy category, combinations, exclusions and engineer notes','textarea','']
];
function safeDesignRegion(region){return DESIGN_REGIONS[region]?region:'US'}
function ieFormValue(d,key){const v=d?.[key];return v===undefined||v===null?'':String(v)}
function fieldHTML([key,label,type,unit],d){
  const id='ie-'+key,val=esc(ieFormValue(d,key));
  if(type==='textarea')return `<label class="ie-field wide">${label}<textarea id="${id}" rows="3" placeholder="Record source, assumptions, N/A items and reviewer notes">${val}</textarea></label>`;
  if(type==='select'){
    let opts=[];
    if(key==='terrainExposure')opts=[['','Select site terrain / exposure'],['Urban / suburban','Urban / suburban'],['Open country','Open country'],['Coastal / exposed','Coastal / exposed'],['Complex terrain / orography','Complex terrain / orography'],['Other / project-specific assessment','Other / project-specific assessment']];
    if(key==='loadCombinationBasis')opts=[['','Select / confirm basis'],['I.S. EN 1990 + Irish National Annex (edition to be confirmed)','I.S. EN 1990 + Irish National Annex'],['Project-specific engineer-designed combination schedule attached','Engineer-designed combination schedule attached'],['Not yet defined','Not yet defined']];
    if(key==='timberGrade')opts=[['','Select verified grade'],['C14','C14'],['C16','C16'],['C18','C18'],['C24','C24'],['C30','C30'],['Other / engineered timber','Other / engineered timber']];
    if(key==='serviceClass')opts=[['','Select service class'],['1','Service Class 1'],['2','Service Class 2'],['3','Service Class 3']];
    if(key==='osbGrade')opts=[['','Select product declaration'],['OSB/3','OSB/3 — verify DoP/application'],['OSB/4','OSB/4 — verify DoP/application'],['Other / not specified','Other / not specified']];
    if(key==='lateralSystem')opts=[['','Select designed lateral system'],['OSB/structural sheathing diaphragm','OSB / structural sheathing diaphragm'],['Diagonal bracing','Diagonal bracing'],['Designed timber moment/braced frame','Designed timber moment/braced frame'],['Mixed / engineered system','Mixed / engineered system'],['Not yet designed','Not yet designed']];
    return `<label class="ie-field">${label}<select id="${id}">${opts.map(([v,t])=>`<option value="${esc(v)}" ${String(v)===String(ieFormValue(d,key))?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
  }
  const step=type==='number'?(key.includes('SpacingMM')||key==='osbThicknessMM'?'1':'0.01'):undefined;
  return `<label class="ie-field">${label}<span class="ie-input-row"><input id="${id}" type="${type}" ${type==='number'?'min="0" step="'+step+'"':''} value="${val}" placeholder="${type==='number'?'Enter site-calculated value':'Enter project value'}">${unit?`<small>${unit}</small>`:''}</span></label>`;
}
function currentIrelandData(){
  const defaults={osbThicknessMM:12};
  return {...defaults,...(model.structuralDesign?.ireland||{})};
}
function ieMissingInputs(d){
  const keys=[
    ['siteLocation','Site location'],['authority','Building Control Authority / reviewer'],['codeEdition','Confirmed code editions'],['loadCombinationBasis','Load combinations / partial-factor basis'],['siteAltitudeM','Site altitude above sea level'],
    ['terrainExposure','Wind terrain / exposure basis'],['basicWindVelocityMS','Basic wind velocity basis'],
    ['floorDeadKNm2','Floor permanent action (or N/A)'],['floorImposedKNm2','Floor imposed action (or N/A)'],
    ['roofDeadKNm2','Roof permanent action'],['roofImposedKNm2','Roof imposed action (or N/A)'],
    ['groundSnowKNm2','Ground snow action'],['roofSnowKNm2','Roof snow action'],
    ['windPressureKNm2','Wall wind pressure'],['windSuctionKNm2','Wall wind suction'],['roofUpliftKNm2','Roof uplift'],
    ['wallGravityLineKNm','Wall gravity line load / explicit N/A'],['maxPointReactionKN','Maximum point reaction / explicit N/A'],
    ['timberGrade','Verified timber strength class'],['serviceClass','Timber service class'],['lateralSystem','Lateral / racking system']
  ];
  const missing=keys.filter(([k])=>d[k]===undefined||d[k]===null||String(d[k]).trim()==='').map(([,label])=>label);
  const osbOn=document.querySelector('#wall-osb-toggle')?.checked!==false;
  if(osbOn){for(const [k,label] of [['osbGrade','OSB product class / DoP'],['osbEdgeFixingSpacingMM','OSB edge fastener spacing'],['osbFieldFixingSpacingMM','OSB field fastener spacing']])if(d[k]===undefined||d[k]===null||String(d[k]).trim()==='')missing.push(label)}
  return missing;
}
function designValue(d,key,unit=''){const v=d?.[key];return v===undefined||v===null||String(v).trim()===''?'NOT ENTERED':`${v}${unit?` ${unit}`:''}`}
function wallDesignStatus(w){
  const generated=generateWallFraming(w),region=safeDesignRegion(model.structuralDesign?.region||'US');
  return {wallId:w.id,region,standard:DESIGN_REGIONS[region].standard,status:'Design inputs required — no structural verification',geometryIssues:generated.issues,
    required:['Adopted code edition / National Annex','Site-specific wind and snow actions','Floor / roof gravity actions and reactions','Timber grade and service class','Bracing / diaphragm design','Hold-downs, anchors and connection capacities','Foundation / bearing verification'],
    checks:['Stud axial load, buckling and combined actions','Headers, lintels and bearing','Wind load path and overturning','Racking / shear wall and diaphragm','OSB panel grade, layout and fasteners','Connections, hold-downs and anchorage']};
}
function saveStructuralDesignForm(){
  const region=safeDesignRegion($('#design-region')?.value||model.structuralDesign?.region||'US');
  const previous=model.structuralDesign||{};
  const ie=currentIrelandData();
  for(const [key,,type] of IE_FIELDS){
    const el=$('ie-'+key);if(!el)continue;
    if(type==='number')ie[key]=el.value.trim()===''?null:Number(el.value);
    else ie[key]=el.value;
  }
  const next={...previous,region,jurisdiction:DESIGN_REGIONS[region].name,standard:DESIGN_REGIONS[region].standard,ireland:ie,designStatus:'INPUTS REQUIRED — engineer verification needed',updatedAt:new Date().toISOString()};
  commit(()=>{model.structuralDesign=next},false);
  updateIrelandStatus();
}
function updateIrelandStatus(){
  const box=$('ie-input-status');if(!box)return;
  const isIE=$('#design-region')?.value==='IE';if(!isIE){box.style.display='none';return;}
  box.style.display='block';const missing=ieMissingInputs(currentIrelandData());
  box.innerHTML=`<strong>${missing.length?`Design brief incomplete — ${missing.length} input(s) need attention`:'Inputs captured — engineering verification still required'}</strong><p>${missing.length?`Items not entered: ${missing.slice(0,7).map(esc).join('; ')}${missing.length>7?' …':''}. Enter a project value or document N/A/assumptions in the notes.`:'The key fields have values. This is not a pass/fail calculation or a compliance certificate.'}</p>`;
}
function designPanelsDialog(){
  const region=safeDesignRegion(model.structuralDesign?.region||'US'),ie=currentIrelandData(),rows=model.elements.filter(w=>w.type==='wall').map(w=>wallDesignStatus(w));
  const regionOptions=Object.entries(DESIGN_REGIONS).map(([id,r])=>`<option value="${id}" ${id===region?'selected':''}>${esc(r.name)} · ${esc(r.standard)}</option>`).join('');
  const standards=`<ul class="ie-standards"><li><b>I.S. EN 1990</b> — basis of structural design, reliability and load combinations with Irish National Annex.</li><li><b>I.S. EN 1991-1-1</b> — self-weight, densities and imposed actions.</li><li><b>I.S. EN 1991-1-3</b> — snow actions and Irish National Annex.</li><li><b>I.S. EN 1991-1-4</b> — wind actions and Irish National Annex.</li><li><b>I.S. EN 1991-1-7</b> — accidental actions where applicable.</li><li><b>I.S. EN 1995-1-1</b> — timber member, stability and connection design with Irish National Annex; EN 1995-1-2 for fire where applicable.</li><li><b>EN 338 / EN 14081</b> — timber strength class / structural timber product requirements.</li><li><b>EN 300 / EN 13986</b> — OSB panel classification and wood-based panels for construction; verify product DoP and intended use.</li><li><b>Irish Building Regulations</b> — Part A / TGD A; also check Parts B, C, D, F and L where applicable to the building and wall build-up.</li></ul>`;
  openModal('Wall panel structural design · Codes, loads & design inputs',`
    <div class="ie-design-layout">
      <label class="ie-field wide"><b>Project design region</b><select id="design-region">${regionOptions}</select></label>
      <div class="ie-note"><b>Important:</b> this workflow stores the design basis and project load inputs; it does not compute Irish wind/snow actions or certify member, bracing, OSB-fixing, connection or foundation capacity. Do not use a generated panel layout as proof of code compliance.</div>
      <div id="ie-design-panel" style="${region==='IE'?'':'display:none;'}">
        <h3>Republic of Ireland — structural design basis</h3>
        <div class="ie-note">Use the applicable Irish-adopted editions and National Annexes confirmed for this project. NSAI's published plan dated 19 January 2026 said Ireland intended a consolidated adoption of the second-generation Eurocodes by the end of Q1 2027, with first-generation Eurocodes scheduled for European withdrawal on 30 March 2028. Re-check NSAI and the project Building Control Authority at appointment / design freeze; do not mix generations.</div>
        <details open><summary>1. Project location and adopted standards</summary><div class="ie-fields">${IE_FIELDS.slice(0,7).map(f=>fieldHTML(f,ie)).join('')}</div></details>
        <details open><summary>2. Gravity, snow and wind actions (characteristic inputs)</summary><p class="ie-small">Enter values from the project-specific action assessment. Units are metric; leave blank until established. Use the notes to record occupancy category, exposure, pressure coefficients, load source and any non-applicable actions.</p><div class="ie-fields">${IE_FIELDS.slice(7,18).map(f=>fieldHTML(f,ie)).join('')}</div></details>
        <details open><summary>3. Timber, OSB, bracing and connections</summary><div class="ie-fields">${IE_FIELDS.slice(18).map(f=>fieldHTML(f,ie)).join('')}</div></details>
        <details><summary>4. Ireland code and regulatory checklist</summary>${standards}</details>
        <div id="ie-input-status" class="ie-status" role="status"></div>
        <div class="ie-reference"><b>Official reference links</b><br>${IRELAND_DESIGN_REFERENCES.map(r=>`<a href="${r.url}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a>`).join(' · ')}</div>
      </div>
      <div id="other-region-note" class="ie-note" style="${region==='IE'?'display:none;':''}">For other regions, select the adopted local code and National Annex, enter site-specific actions, and obtain local structural review. The wall layout engine does not replace a jurisdiction-specific calculation.</div>
      <h3>Wall geometry / verification status</h3>
      <div class="modal-copy">${rows.length} wall elements found. All are shown as awaiting structural verification; geometry status is not a structural pass.</div>
      <div class="ie-table-wrap"><table class="design-table"><thead><tr><th>Wall</th><th>Design status</th><th>Geometry check</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.wallId)}</td><td>${esc(r.status)}</td><td>${r.geometryIssues.length?esc(r.geometryIssues.join('; ')):'No geometry issues reported'}</td></tr>`).join('')}</tbody></table></div>
      <div class="modal-actions"><button id="design-save" class="primary">Save design inputs</button><button id="design-report" class="subtle">Export design brief JSON</button></div>
    </div>`);
  const dlg=$('#modal'),body=$('#modal-body');if(dlg){dlg.style.width='min(1120px, 96vw)';dlg.style.maxWidth='96vw';dlg.style.maxHeight='92vh';}if(body){body.style.maxHeight='calc(92vh - 95px)';body.style.overflowY='auto';}
  const regionEl=$('design-region');if(regionEl)regionEl.onchange=()=>{saveStructuralDesignForm();$('#modal')?.close?.();designPanelsDialog()};
  for(const [key,,type] of IE_FIELDS){const el=$('ie-'+key);if(el)el.addEventListener('change',saveStructuralDesignForm)}
  bindClick('#design-save',()=>{saveStructuralDesignForm();toast('Design basis and load inputs saved in the BIM project. Structural verification is still required.')});
  bindClick('#design-report',()=>{
    saveStructuralDesignForm();const currentRegion=safeDesignRegion(model.structuralDesign?.region||'US');
    const report={format:'cadtech-wall-panel-design-brief',formatVersion:1,project:model.name,revision:model.revision,region:currentRegion,jurisdiction:DESIGN_REGIONS[currentRegion].name,standard:DESIGN_REGIONS[currentRegion].standard,projectDesignInputs:model.structuralDesign,wallStatus:model.elements.filter(w=>w.type==='wall').map(w=>wallDesignStatus(w)),codeReferences:currentRegion==='IE'?IRELAND_DESIGN_REFERENCES:[],limitations:['No wind/snow action calculation is performed by this design-brief screen.','No timber, header, OSB shear, fastener, hold-down, connection, anchorage or foundation capacity is certified.','Check applicable code editions, National Annexes, project-specific actions, and local Building Control requirements.'],exportedAt:new Date().toISOString()};
    download('wall-panel-design-brief-'+currentRegion.toLowerCase()+'.json',JSON.stringify(report,null,2),'application/json');
  });
  updateIrelandStatus();
}

function toFeetInches(mm){
  const n = Number(mm);
  if (!Number.isFinite(n) || n <= 0) return (typeof window !== 'undefined' && window.appUnits === 'ft-in') ? '0"' : '0 mm';
  if (typeof window !== 'undefined' && typeof window.formatLength === 'function') return window.formatLength(n);
  return `${Math.round(n)} mm`;
}
function toFeetInchesFraction(mm, includeMm = false) {
  const n = Number(mm);
  if (!Number.isFinite(n) || n <= 0) return (typeof window !== 'undefined' && window.appUnits === 'ft-in') ? '0"' : '0 mm';
  if (typeof window !== 'undefined' && typeof window.formatLength === 'function') {
    const primary = window.formatLength(n);
    if (includeMm && window.appUnits === 'ft-in') return `${primary} (${Math.round(n)} mm)`;
    return primary;
  }
  return `${Math.round(n)} mm`;
}
if (typeof window !== 'undefined') {
  window.toFeetInches = toFeetInches;
  window.toFeetInchesFraction = toFeetInchesFraction;
}

let _activeFramingLabelBoxes = [];
let _activeFramingWallBoxes = [];

function _obbFromCenter(cx, cy, w, h, angle) {
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const hw = w / 2, hh = h / 2;
  const corners = [
    { x: cx - hw * ca + hh * sa, y: cy - hw * sa - hh * ca },
    { x: cx + hw * ca + hh * sa, y: cy + hw * sa - hh * ca },
    { x: cx + hw * ca - hh * sa, y: cy + hw * sa + hh * ca },
    { x: cx - hw * ca - hh * sa, y: cy - hw * sa + hh * ca }
  ];
  return {
    cx, cy, w, h, angle, corners,
    minX: Math.min(...corners.map(p => p.x)),
    maxX: Math.max(...corners.map(p => p.x)),
    minY: Math.min(...corners.map(p => p.y)),
    maxY: Math.max(...corners.map(p => p.y))
  };
}

function _boxesOverlap(a, b, pad = 3) {
  if (a.maxX + pad < b.minX || b.maxX + pad < a.minX || a.maxY + pad < b.minY || b.maxY + pad < a.minY) {
    return false;
  }
  const axes = [];
  for (const box of [a, b]) {
    if (box.corners && box.corners.length >= 4) {
      const e1 = { x: box.corners[1].x - box.corners[0].x, y: box.corners[1].y - box.corners[0].y };
      const e2 = { x: box.corners[3].x - box.corners[0].x, y: box.corners[3].y - box.corners[0].y };
      const l1 = Math.hypot(e1.x, e1.y) || 1;
      const l2 = Math.hypot(e2.x, e2.y) || 1;
      axes.push({ x: e1.x / l1, y: e1.y / l1 }, { x: e2.x / l2, y: e2.y / l2 });
    }
  }
  if (!axes.length) return true;
  const ptsA = a.corners || [{ x: a.minX, y: a.minY }, { x: a.maxX, y: a.minY }, { x: a.maxX, y: a.maxY }, { x: a.minX, y: a.maxY }];
  const ptsB = b.corners || [{ x: b.minX, y: b.minY }, { x: b.maxX, y: b.minY }, { x: b.maxX, y: b.maxY }, { x: b.minX, y: b.maxY }];
  for (const ax of axes) {
    let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;
    for (const p of ptsA) { const v = p.x * ax.x + p.y * ax.y; if (v < minA) minA = v; if (v > maxA) maxA = v; }
    for (const p of ptsB) { const v = p.x * ax.x + p.y * ax.y; if (v < minB) minB = v; if (v > maxB) maxB = v; }
    if (maxA + pad < minB || maxB + pad < minA) return false;
  }
  return true;
}

function drawParallelTag(anchorScreen, uScr, nScr, prefSign, baseNormalPx, text, fontSizePx, color = '#0f172a', maxSlidePx = 140) {
  if ($('#wall-dimensions-toggle')?.checked === false) return;
  if (typeof ctx === 'undefined' || !ctx) return;
  const s = getTextScale();
  let angle = Math.atan2(uScr.y, uScr.x);
  if (angle > Math.PI / 2) angle -= Math.PI;
  else if (angle < -Math.PI / 2) angle += Math.PI;

  ctx.save();
  ctx.font = `bold ${fontSizePx}px "DM Sans", Arial, sans-serif`;
  const txtW = ctx.measureText(text).width + 8 * s;
  const txtH = fontSizePx + 5 * s;

  const slideSteps = [0, -28 * s, 28 * s, -56 * s, 56 * s, -84 * s, 84 * s, -112 * s, 112 * s]
    .filter(d => Math.abs(d) <= Math.max(24 * s, maxSlidePx));
  const normalSteps = [
    prefSign * baseNormalPx,
    prefSign * (baseNormalPx + 14 * s),
    -prefSign * baseNormalPx,
    -prefSign * (baseNormalPx + 14 * s),
    prefSign * (baseNormalPx + 28 * s)
  ];

  let chosen = null;
  for (const nDist of normalSteps) {
    for (const uDist of slideSteps) {
      const cx = anchorScreen.x + uScr.x * uDist + nScr.x * nDist;
      const cy = anchorScreen.y + uScr.y * uDist + nScr.y * nDist;
      const obb = _obbFromCenter(cx, cy, txtW, txtH, angle);
      const hitsLabel = _activeFramingLabelBoxes.some(b => _boxesOverlap(obb, b, 3 * s));
      const hitsWall = _activeFramingWallBoxes.some(b => _boxesOverlap(obb, b, 1.5 * s));
      if (!hitsLabel && !hitsWall) {
        chosen = obb;
        break;
      }
    }
    if (chosen) break;
  }

  if (!chosen) {
    for (const nDist of normalSteps) {
      for (const uDist of slideSteps) {
        const cx = anchorScreen.x + uScr.x * uDist + nScr.x * nDist;
        const cy = anchorScreen.y + uScr.y * uDist + nScr.y * nDist;
        const obb = _obbFromCenter(cx, cy, txtW, txtH, angle);
        const hitsLabel = _activeFramingLabelBoxes.some(b => _boxesOverlap(obb, b, 2 * s));
        if (!hitsLabel) {
          chosen = obb;
          break;
        }
      }
      if (chosen) break;
    }
  }

  if (!chosen) {
    const cx = anchorScreen.x + nScr.x * prefSign * baseNormalPx;
    const cy = anchorScreen.y + nScr.y * prefSign * baseNormalPx;
    chosen = _obbFromCenter(cx, cy, txtW, txtH, angle);
  }

  _activeFramingLabelBoxes.push(chosen);

  ctx.translate(chosen.cx, chosen.cy);
  ctx.rotate(angle);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillRect(-txtW / 2, -txtH / 2, txtW, txtH);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function archDim(a, b, offset, text, color = '#0f172a') {
  if ($('#wall-dimensions-toggle')?.checked === false) return;
  const s = getTextScale();
  const z = (typeof scale === 'number' && Number.isFinite(scale)) ? scale : 1;
  const pa = p2(a), pb = p2(b);
  const dx = pb.x - pa.x, dy = pb.y - pa.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const scaledOffset = offset * z;
  const nx = -uy * scaledOffset, ny = ux * scaledOffset;
  const aa = { x: pa.x + nx, y: pa.y + ny };
  const bb = { x: pb.x + nx, y: pb.y + ny };

  if (typeof ctx === 'undefined' || !ctx) return;
  ctx.save();
  // Witness / extension lines
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = Math.max(0.5, Math.min(1.6, 0.7 * s));
  ctx.beginPath();
  ctx.moveTo(pa.x, pa.y);
  ctx.lineTo(aa.x + nx * 0.12, aa.y + ny * 0.12);
  ctx.moveTo(pb.x, pb.y);
  ctx.lineTo(bb.x + nx * 0.12, bb.y + ny * 0.12);
  ctx.stroke();

  // Dimension line
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(0.6, Math.min(2.0, 0.9 * s));
  ctx.beginPath();
  ctx.moveTo(aa.x, aa.y);
  ctx.lineTo(bb.x, bb.y);
  ctx.stroke();

  // 45° Architectural ticks
  const tick = 4.2 * s;
  for (const pt of [aa, bb]) {
    ctx.beginPath();
    ctx.moveTo(pt.x - tick, pt.y + tick);
    ctx.lineTo(pt.x + tick, pt.y - tick);
    ctx.lineWidth = Math.max(0.8, Math.min(2.4, 1.3 * s));
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  // Dimension text with white knockout and non-overlapping parallel slide
  let angle = Math.atan2(dy, dx);
  if (angle > Math.PI / 2) angle -= Math.PI;
  else if (angle < -Math.PI / 2) angle += Math.PI;

  ctx.font = `bold ${6.8 * s}px "DM Sans", Arial, sans-serif`;
  const txtW = ctx.measureText(text).width + 8 * s;
  const txtH = 11 * s;
  const mxBase = (aa.x + bb.x) / 2, myBase = (aa.y + bb.y) / 2;
  const normalX = -Math.sin(angle), normalY = Math.cos(angle);

  let chosenObb = null;
  const maxShift = Math.max(0, len / 2 - txtW / 2 - 6 * s);
  const shifts = [0, -26 * s, 26 * s, -52 * s, 52 * s].filter(d => Math.abs(d) <= maxShift + 1);
  for (const sh of shifts) {
    const cx = mxBase + ux * sh + normalX * (-4 * s);
    const cy = myBase + uy * sh + normalY * (-4 * s);
    const obb = _obbFromCenter(cx, cy, txtW, txtH, angle);
    if (!_activeFramingLabelBoxes.some(b => _boxesOverlap(obb, b, 2 * s))) {
      chosenObb = obb;
      break;
    }
  }
  if (!chosenObb) {
    chosenObb = _obbFromCenter(mxBase + normalX * (-4 * s), myBase + normalY * (-4 * s), txtW, txtH, angle);
  }
  _activeFramingLabelBoxes.push(chosenObb);

  ctx.translate(chosenObb.cx, chosenObb.cy);
  ctx.rotate(angle);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-txtW / 2, -txtH / 2, txtW, txtH);

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function lineIntersection(a, b, c, d) {
  const r = sub2(b, a);
  const s = sub2(d, c);
  const denom = cross2(r, s);
  if (Math.abs(denom) < 1e-6) return null;
  const qp = sub2(c, a);
  const u = cross2(qp, r) / denom;
  if (u < -0.001 || u > 1.001) return null;
  const t = cross2(qp, s) / denom;
  return { x: a.x + r.x * t, y: a.y + r.y * t };
}

function _clipPolyToBandU(poly, wA, unit, faceOrigin, fn, sMin, sMax) {
  if (!poly || poly.length < 3) return null;
  let pts = poly.map(p => ({
    u: (p.x - wA.x) * unit.x + (p.y - wA.y) * unit.y,
    s: (p.x - faceOrigin.x) * fn.x + (p.y - faceOrigin.y) * fn.y
  }));

  const clipMin = (arr, minVal) => {
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const cur = arr[i];
      const prev = arr[(i + arr.length - 1) % arr.length];
      const curIn = cur.s >= minVal;
      const prevIn = prev.s >= minVal;
      if (curIn !== prevIn) {
        const t = (minVal - prev.s) / (cur.s - prev.s);
        out.push({ u: prev.u + t * (cur.u - prev.u), s: minVal });
      }
      if (curIn) out.push(cur);
    }
    return out;
  };

  const clipMax = (arr, maxVal) => {
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const cur = arr[i];
      const prev = arr[(i + arr.length - 1) % arr.length];
      const curIn = cur.s <= maxVal;
      const prevIn = prev.s <= maxVal;
      if (curIn !== prevIn) {
        const t = (maxVal - prev.s) / (cur.s - prev.s);
        out.push({ u: prev.u + t * (cur.u - prev.u), s: maxVal });
      }
      if (curIn) out.push(cur);
    }
    return out;
  };

  pts = clipMin(pts, sMin);
  if (pts.length === 0) return null;
  pts = clipMax(pts, sMax);
  if (pts.length === 0) return null;

  let minU = Infinity;
  let maxU = -Infinity;
  for (const p of pts) {
    if (p.u < minU) minU = p.u;
    if (p.u > maxU) maxU = p.u;
  }
  if (!Number.isFinite(minU) || !Number.isFinite(maxU) || maxU - minU < 0.5) return null;
  return [minU, maxU];
}

function getWallCornerEndpoints(w, customModel) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const len = distance(w.a, w.b);
  if (!len || len < 1) return { a: clone(w.a), b: clone(w.b), len: 0, outSign: -1, cornerStart: 0, cornerEnd: 0, osbStart: 0, osbEnd: 0, overlapStart: false, overlapEnd: false };
  const u = sub2(w.b, w.a);
  const unit = { x: u.x / len, y: u.y / len };
  const n = { x: -unit.y, y: unit.x };
  const sDepth = typeof construction === 'function' ? construction(w).studDepth : (w.framing?.studDepth || w.thickness || 140);

  const walls = (mModel?.elements || []).filter(e => e.type === 'wall' && e.story === w.story && (typeof shown === 'function' ? shown(e) : true));
  const centroid = walls.length ? {
    x: walls.reduce((acc, el) => acc + (el.a.x + el.b.x) / 2, 0) / walls.length,
    y: walls.reduce((acc, el) => acc + (el.a.y + el.b.y) / 2, 0) / walls.length
  } : { x: (w.a.x + w.b.x) / 2, y: (w.a.y + w.b.y) / 2 };

  const mid = lerp(w.a, w.b, 0.5);
  const toCentroid = { x: mid.x - centroid.x, y: mid.y - centroid.y };
  const outSign = (toCentroid.x * n.x + toCentroid.y * n.y >= 0) ? 1 : -1;

  const run = typeof framingRun === 'function' ? framingRun(w, mModel) : { start: 0, end: len };
  let cornerStart = run.start;
  let cornerEnd = run.end;
  let cornerWallStart = null;
  let cornerWallEnd = null;
  let nearEndStart = false;
  let nearEndEnd = false;

  const isWExt = typeof isWallExtFlag === 'function' ? isWallExtFlag(w) : (typeof isExteriorWall === 'function' ? isExteriorWall(w) : true);
  let bestStart = null;
  let bestEnd = null;

  for (const other of walls) {
    if (other.id === w.id) continue;
    const vl = distance(other.a, other.b);
    if (vl < 1) continue;
    const v = sub2(other.b, other.a);
    const cross = Math.abs(cross2(u, v)) / (len * vl);
    if (cross < 0.25) continue;

    const otherDepth = typeof construction === 'function' ? construction(other).studDepth : (other.framing?.studDepth || other.thickness || 140);
    const joinTol = Math.max(w.thickness || 200, other.thickness || 200, sDepth, otherDepth) + 60;

    const minDistA = Math.min(distance(other.a, w.a), distance(other.b, w.a));
    const minDistB = Math.min(distance(other.a, w.b), distance(other.b, w.b));
    const otherExt = typeof isWallExtFlag === 'function' ? isWallExtFlag(other) : (typeof isExteriorWall === 'function' ? isExteriorWall(other) : true);
    const sameKind = (otherExt === isWExt);
    const score = sameKind ? 2 : 1;

    if (minDistA <= joinTol && typeof framingMemberWorld === 'function') {
      const strip = framingMemberWorld(other, { x0: -10000, x1: vl + 10000, depth: otherDepth });
      const ts = [];
      for (let i = 0; i < 4; i++) {
        const hit = lineIntersection(w.a, w.b, strip[i], strip[(i + 1) % 4]);
        if (hit) ts.push((hit.x - w.a.x) * unit.x + (hit.y - w.a.y) * unit.y);
      }
      if (ts.length) {
        const lo = Math.min(...ts);
        if (!bestStart || score > bestStart.score || (score === bestStart.score && minDistA < bestStart.dist)) {
          bestStart = { other, lo, score, dist: minDistA };
        }
      }
    }

    if (minDistB <= joinTol && typeof framingMemberWorld === 'function') {
      const strip = framingMemberWorld(other, { x0: -10000, x1: vl + 10000, depth: otherDepth });
      const ts = [];
      for (let i = 0; i < 4; i++) {
        const hit = lineIntersection(w.a, w.b, strip[i], strip[(i + 1) % 4]);
        if (hit) ts.push((hit.x - w.a.x) * unit.x + (hit.y - w.a.y) * unit.y);
      }
      if (ts.length) {
        const hi = Math.max(...ts);
        if (!bestEnd || score > bestEnd.score || (score === bestEnd.score && minDistB < bestEnd.dist)) {
          bestEnd = { other, hi, score, dist: minDistB };
        }
      }
    }
  }

  if (bestStart) {
    cornerStart = Math.min(cornerStart, bestStart.lo);
    cornerWallStart = bestStart.other;
    nearEndStart = true;
  }
  if (bestEnd) {
    cornerEnd = Math.max(cornerEnd, bestEnd.hi);
    cornerWallEnd = bestEnd.other;
    nearEndEnd = true;
  }

  // At each outside L-corner connection, the through-wall (w.id < other.id) extends its 12 mm OSB by +12 mm
  // so one sheathing side cleanly overlaps the perpendicular wall's 12 mm OSB sheathing at the corner.
  const osbThicknessMm = 12;
  const overlapStart = Boolean(cornerWallStart && nearEndStart && (typeof isCornerThroughWall === 'function' ? isCornerThroughWall(w, cornerWallStart) : String(w.id).localeCompare(String(cornerWallStart.id)) < 0));
  const overlapEnd = Boolean(cornerWallEnd && nearEndEnd && (typeof isCornerThroughWall === 'function' ? isCornerThroughWall(w, cornerWallEnd) : String(w.id).localeCompare(String(cornerWallEnd.id)) < 0));
  const osbStart = cornerStart - (overlapStart ? osbThicknessMm : 0);
  const osbEnd = cornerEnd + (overlapEnd ? osbThicknessMm : 0);

  if (typeof framingMemberWorld === 'function') {
    const fullPlate = framingMemberWorld(w, { x0: cornerStart, x1: cornerEnd, depth: sDepth });
    const ptA = outSign > 0 ? fullPlate[0] : fullPlate[3];
    const ptB = outSign > 0 ? fullPlate[1] : fullPlate[2];
    return { a: ptA, b: ptB, len: Math.max(0, cornerEnd - cornerStart), outSign, cornerStart, cornerEnd, osbStart, osbEnd, overlapStart, overlapEnd };
  }

  const ptA = { x: w.a.x + unit.x * cornerStart, y: w.a.y + unit.y * cornerStart };
  const ptB = { x: w.a.x + unit.x * cornerEnd, y: w.a.y + unit.y * cornerEnd };
  return { a: ptA, b: ptB, len: Math.max(0, cornerEnd - cornerStart), outSign, cornerStart, cornerEnd, osbStart, osbEnd, overlapStart, overlapEnd };
}

function getWallOsbLayout(w, customModel, forceFace = 'exterior') {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const osbThicknessMm = 12;
  const len = distance(w.a, w.b) || 1;
  const uVec = sub2(w.b, w.a);
  const unit = { x: uVec.x / len, y: uVec.y / len };
  const n = { x: -unit.y, y: unit.x };
  const sDepth = typeof construction === 'function' ? construction(w).studDepth : (w.framing?.studDepth || w.thickness || 140);
  const run = typeof framingRun === 'function' ? framingRun(w, mModel) : { start: 0, end: len };
  const corners = getWallCornerEndpoints(w, mModel);
  const curSign = (forceFace === 'interior') ? -corners.outSign : corners.outSign;

  const baseStart = Number.isFinite(corners.cornerStart) ? corners.cornerStart : run.start;
  const baseEnd = Number.isFinite(corners.cornerEnd) ? corners.cornerEnd : run.end;

  let rawIntervals = [[baseStart, baseEnd]];
  let clippedStart = false;
  let clippedEnd = false;

  // Subtract any interval where this wall's OSB sheathing strip would enter or cross another wall's framing cavity
  if (typeof framingMemberWorld === 'function') {
    const basePlate = framingMemberWorld(w, { x0: 0, x1: len, depth: sDepth });
    const faceOrigin = curSign > 0 ? basePlate[0] : basePlate[3];
    const fn = { x: n.x * curSign, y: n.y * curSign };
    const walls = (mModel?.elements || []).filter(e => e.type === 'wall' && e.story === w.story && e.id !== w.id && (typeof shown === 'function' ? shown(e) : true));

    for (const other of walls) {
      const vl = distance(other.a, other.b);
      if (vl < 1) continue;
      const otherDepth = typeof construction === 'function' ? construction(other).studDepth : (other.framing?.studDepth || other.thickness || 140);
      const otherRun = typeof framingRun === 'function' ? framingRun(other, mModel) : { start: 0, end: vl };
      const otherPoly = framingMemberWorld(other, { x0: otherRun.start, x1: otherRun.end, depth: otherDepth });

      const cutSpan = _clipPolyToBandU(otherPoly, w.a, unit, faceOrigin, fn, 0.5, osbThicknessMm - 0.5);
      if (!cutSpan) continue;
      const [cutA, cutB] = cutSpan;
      if (cutA <= baseStart + 1 && cutB > baseStart + 0.5) clippedStart = true;
      if (cutB >= baseEnd - 1 && cutA < baseEnd - 0.5) clippedEnd = true;

      const next = [];
      for (const [a, b] of rawIntervals) {
        if (cutB <= a + 0.5 || cutA >= b - 0.5) {
          next.push([a, b]);
        } else {
          if (cutA > a + 10) next.push([a, cutA]);
          if (cutB < b - 10) next.push([cutB, b]);
        }
      }
      rawIntervals = next;
    }
  }

  // Apply 12 mm outside L-corner sheathing overlap whenever the corner was not clipped by an adjoining wall cavity
  if (rawIntervals.length > 0) {
    if (!clippedStart && corners.overlapStart && Math.abs(rawIntervals[0][0] - baseStart) < 1) {
      rawIntervals[0][0] = baseStart - osbThicknessMm;
    }
    const lastIdx = rawIntervals.length - 1;
    if (!clippedEnd && corners.overlapEnd && Math.abs(rawIntervals[lastIdx][1] - baseEnd) < 1) {
      rawIntervals[lastIdx][1] = baseEnd + osbThicknessMm;
    }
  }

  const wallOpenings = (mModel?.elements || []).filter(e => (e.type === 'window' || e.type === 'door') && e.host === w.id);
  for (const o of wallOpenings) {
    const hw = (o.width || 900) / 2;
    const oL = o.offset - hw;
    const oR = o.offset + hw;
    const next = [];
    for (const [a, b] of rawIntervals) {
      if (oR <= a || oL >= b) next.push([a, b]);
      else {
        if (oL > a + 10) next.push([a, oL]);
        if (oR < b - 10) next.push([oR, b]);
      }
    }
    rawIntervals = next;
  }

  const framing = typeof generateWallFraming === 'function' ? generateWallFraming(w, mModel) : { members: [] };
  const studCenters = [...new Set(
    (framing.members || [])
      .filter(m => !['Top plate','Bottom plate','Header','Sill','Header stud','Upper cripple','Lower cripple','Block','Blocking','Beam'].includes(m.type) &&
                   !/plate|header|sill|cripple|block|noggin|beam|lintel/i.test(m.type) &&
                   m.role !== 'Horizontal backing' &&
                   Number.isFinite(m.x0) && Number.isFinite(m.x1))
      .map(m => Math.round(((m.x0 + m.x1) / 2) * 10) / 10)
  )].sort((a, b) => a - b);

  const maxSheetMm = 1220;
  const segments = [];
  for (const [segA, segB] of rawIntervals) {
    if (segB - segA < 20) continue;
    const joints = [];
    const segStuds = studCenters.filter(sc => sc > segA + 100 && sc < segB - 100);
    let cur = segA;
    while (segB - cur > maxSheetMm + 20) {
      const reachable = segStuds.filter(sc => sc > cur + 100 && sc <= cur + maxSheetMm + 20);
      let nextJoint = null;
      if (reachable.length > 0) {
        nextJoint = reachable[reachable.length - 1];
      } else {
        const after = segStuds.filter(sc => sc > cur + 100);
        if (after.length > 0) nextJoint = after[0];
      }
      if (!Number.isFinite(nextJoint) || nextJoint <= cur + 40 || nextJoint >= segB - 100) break;
      joints.push(nextJoint);
      cur = nextJoint;
    }
    segments.push({ segA, segB, joints });
  }

  return { osbThicknessMm, sDepth, outSign: corners.outSign, corners, segments, studCenters };
}
function getOpeningHiddenStuds(w, o, customModel, wallMembers) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const c = typeof construction === 'function' ? construction(w) : { studWidth: 38, studDepth: w.thickness || 140, spacing: 400 };
  const sw = c.studWidth || 38;
  const sDepth = c.studDepth || w.thickness || 140;
  const hw = (o.width || 900) / 2;
  const oLeft = o.offset - hw;
  const oRight = o.offset + hw;
  const rawMembers = wallMembers || (typeof generateWallFraming === 'function' ? (generateWallFraming(w, mModel).members || []) : []);

  const seenX = new Set();
  const spans = [];
  for (const m of rawMembers) {
    if (!['Header stud', 'Upper cripple', 'Lower cripple', 'Sill cripple', 'Cripple'].includes(m.type) && !/cripple|header stud/i.test(m.type)) continue;
    if (!Number.isFinite(m.x0) || !Number.isFinite(m.x1)) continue;
    if (m.x1 <= oLeft + 1 || m.x0 >= oRight - 1) continue;
    const cx0 = Math.max(oLeft, m.x0);
    const cx1 = Math.min(oRight, m.x1);
    if (cx1 - cx0 < 5) continue;
    const key = Math.round(cx0 / 5) * 5;
    if (seenX.has(key)) continue;
    seenX.add(key);
    spans.push({ x0: cx0, x1: cx1, id: m.id, studKey: m.studKey, member: m, depth: m.depth || sDepth, customSize: Boolean(m.customSize) });
  }

  if (!spans.length && (!Array.isArray(w.framing?.deletedStuds) || !w.framing.deletedStuds.length)) {
    const run = typeof framingRun === 'function' ? framingRun(w, mModel) : { start: 0, end: distance(w.a, w.b) };
    const spacing = c.spacing || 400;
    if (oRight - oLeft >= sw) {
      spans.push({ x0: oLeft, x1: Math.min(oRight, oLeft + sw), depth: sDepth });
      seenX.add(Math.round(oLeft / 5) * 5);
    }
    if (oRight - sw > oLeft + sw - 0.5) {
      const rx0 = Math.max(oLeft, oRight - sw);
      const rKey = Math.round(rx0 / 5) * 5;
      if (!seenX.has(rKey)) {
        seenX.add(rKey);
        spans.push({ x0: rx0, x1: oRight, depth: sDepth });
      }
    }
    for (let x = run.start + sw / 2; x <= run.end - sw / 2 + 0.01; x += spacing) {
      const cx0 = x - sw / 2, cx1 = x + sw / 2;
      if (cx0 >= oLeft + sw - 0.5 && cx1 <= oRight - sw + 0.5) {
        const key = Math.round(cx0 / 5) * 5;
        if (!seenX.has(key)) {
          seenX.add(key);
          spans.push({ x0: cx0, x1: cx1, depth: sDepth });
        }
      }
    }
  }

  spans.sort((a, b) => a.x0 - b.x0);
  return spans.map(({ x0, x1, id, studKey, member, depth, customSize }) => ({
    id: id || `${w.id}:STUD:Header_stud:${Math.round(x0)}:0`,
    studKey: studKey || `Header stud:${Math.round(x0)}:0`,
    member,
    customSize: Boolean(customSize),
    x0,
    x1,
    depth: depth || sDepth,
    poly: typeof framingMemberWorld === 'function' ? framingMemberWorld(w, { x0, x1, depth: depth || sDepth }) : null
  })).filter(s => s.poly && s.poly.length >= 4);
}

if (typeof window !== 'undefined') {
  window.getWallCornerEndpoints = getWallCornerEndpoints;
  window.getWallOsbLayout = getWallOsbLayout;
  window.getOpeningHiddenStuds = getOpeningHiddenStuds;
}

function framingPlanMembers(){return model.elements.filter(w=>w.type==='wall'&&w.story===activeStory&&shown(w)).flatMap(w=>generateWallFraming(w).members.map(m=>({wall:w,member:m,polygon:framingMemberWorld(w,m)})))}
function drawFramingPlan(){
  const members=framingPlanMembers();
  const rawWalls=model.elements.filter(w=>w.type==='wall'&&w.story===activeStory&&shown(w));
  if (!rawWalls.length) return;
  const ts = getTextScale();
  _activeFramingLabelBoxes = [];
  _activeFramingWallBoxes = [];

  // Calculate building centroid to reliably orient exterior vs interior
  const centroid = {
    x: rawWalls.reduce((s, w) => s + (w.a.x + w.b.x) / 2, 0) / rawWalls.length,
    y: rawWalls.reduce((s, w) => s + (w.a.y + w.b.y) / 2, 0) / rawWalls.length
  };

  // Order walls clockwise & side-by-side (E01, E02... for exterior, I01, I02... for interior)
  // and number openings sequentially (W01, W02... and D01, D02...) along the ordered walls
  const orderedInfo = typeof orderStoryWallsAndOpenings === 'function'
    ? orderStoryWallsAndOpenings(rawWalls, model, isExteriorWall)
    : null;
  const walls = orderedInfo ? orderedInfo.orderedWalls : rawWalls;
  const extWalls = orderedInfo ? orderedInfo.extWalls : walls.filter(w => isExteriorWall(w));
  const intWalls = orderedInfo ? orderedInfo.intWalls : walls.filter(w => !isExteriorWall(w));
  const wallCodeMap = orderedInfo ? orderedInfo.map : new Map();
  if (!orderedInfo) {
    extWalls.forEach((w, i) => wallCodeMap.set(w.id, `E${String(i + 1).padStart(2, '0')}`));
    intWalls.forEach((w, i) => wallCodeMap.set(w.id, `I${String(i + 1).padStart(2, '0')}`));
  }

  const openingCodeMap = orderedInfo ? orderedInfo.openingCodeMap : new Map();
  if (!orderedInfo) {
    let winCount = 1, doorCount = 1;
    for (const w of walls) {
      for (const o of hosted(w)) {
        const wMm = Math.round(o.width || (o.type === 'door' ? 900 : 1200));
        const hMm = Math.round(o.height || (o.type === 'door' ? 2100 : 1200));
        const dimPairStr = (typeof window !== 'undefined' && typeof window.formatDimPair === 'function')
          ? window.formatDimPair(wMm, hMm)
          : `${wMm}×${hMm} mm`;
        if (o.type === 'door') {
          openingCodeMap.set(o.id, `D${String(doorCount++).padStart(2, '0')} (${dimPairStr})`);
        } else {
          openingCodeMap.set(o.id, `W${String(winCount++).padStart(2, '0')} (${dimPairStr})`);
        }
      }
    }
  }

  // Pre-compute wall screen polygons and register them as obstacles so labels never overlap walls
  const wallDrawData = [];
  for (const w of walls) {
    const run = framingRun(w);
    const len = distance(w.a, w.b) || 1;
    const u = sub2(w.b, w.a);
    const unit = { x: u.x / len, y: u.y / len };
    const n = { x: -unit.y, y: unit.x };
    const mid = lerp(w.a, w.b, 0.5);
    const toCentroid = { x: mid.x - centroid.x, y: mid.y - centroid.y };
    const outSign = (toCentroid.x * n.x + toCentroid.y * n.y >= 0) ? 1 : -1;
    const ext = isExteriorWall(w);
    const sDepth = construction(w).studDepth;
    const plateWorld = framingMemberWorld(w, { x0: run.start, x1: run.end, depth: sDepth });
    const platePoints = plateWorld.map(p2);

    if (platePoints.length >= 4) {
      _activeFramingWallBoxes.push({
        corners: platePoints,
        minX: Math.min(...platePoints.map(p => p.x)),
        maxX: Math.max(...platePoints.map(p => p.x)),
        minY: Math.min(...platePoints.map(p => p.y)),
        maxY: Math.max(...platePoints.map(p => p.y))
      });
    }
    wallDrawData.push({ w, run, len, unit, n, outSign, ext, sDepth, plateWorld, platePoints });
  }

  // 1. Draw wall cavities and plate boundaries
  for (const d of wallDrawData) {
    const { w, ext, platePoints } = d;
    const cavityFill = selected.includes(w.id) ? '#dcfce7' : (ext ? '#f7f7ea' : '#e2e8f0');
    const plateBorder = selected.includes(w.id) ? '#166534' : '#1e293b';
    poly(platePoints, cavityFill, plateBorder, 1.2);
  }

  // 1.5. Cross-wall & intra-wall physical stud collision detection for 2D plan view
  const showBlockings = $('#wall-blocking-toggle')?.checked === true;
  const collidingKeys = new Set();
  const studShapes = [];
  const shapeFootprints = new Set();

  for (const { wall: w, member: m, polygon: ps } of members) {
    if (['Top plate', 'Bottom plate', 'Header', 'Sill', 'Header stud', 'Upper cripple', 'Lower cripple'].includes(m.type)) continue;
    const isFieldBlocking = (/^Block$|^Blocking$/i.test(m.type) || /noggin/i.test(m.type)) && m.role !== 'Horizontal backing';
    if (!showBlockings && isFieldBlocking) continue;

    const key = w.id + '|' + (m.id || `${m.type}:${Math.round(m.x0)}:${Math.round(m.z0)}`);
    if (m.collision) collidingKeys.add(key);

    if (ps.length >= 4) {
      const fpKey = w.id + '|' + ps.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join('|');
      if (shapeFootprints.has(fpKey)) continue;
      shapeFootprints.add(fpKey);
      const minX = Math.min(...ps.map(p => p.x));
      const maxX = Math.max(...ps.map(p => p.x));
      const minY = Math.min(...ps.map(p => p.y));
      const maxY = Math.max(...ps.map(p => p.y));
      studShapes.push({ key, wallId: w.id, member: m, corners: ps, minX, maxX, minY, maxY });
    }
  }

  for (let i = 0; i < studShapes.length; i++) {
    for (let j = i + 1; j < studShapes.length; j++) {
      const s1 = studShapes[i];
      const s2 = studShapes[j];
      if (_boxesOverlap(s1, s2, -3.5)) {
        collidingKeys.add(s1.key);
        collidingKeys.add(s2.key);
        s1.member.collision = true;
        s2.member.collision = true;
      }
    }
  }

  // 2. Draw framing members (Vertical full-height/jack/king/corner/junction studs and connection ladder backing; skip horizontal plates, headers, sills, and cripple studs in 2D plan cut)
  const footprints=new Set();
  for(const {wall:w,member:m,polygon:ps} of members){
    if(['Top plate','Bottom plate','Header','Sill','Header stud','Upper cripple','Lower cripple'].includes(m.type))continue;
    const isFieldBlocking = (/^Block$|^Blocking$/i.test(m.type) || /noggin/i.test(m.type)) && m.role !== 'Horizontal backing';
    if(!showBlockings && isFieldBlocking) continue;

    const key = w.id + '|' + (m.id || `${m.type}:${Math.round(m.x0)}:${Math.round(m.z0)}`);
    const footprintKey=w.id+ps.map(p=>`${Math.round(p.x)},${Math.round(p.y)}`).join('|');
    if(footprints.has(footprintKey))continue;
    footprints.add(footprintKey);

    const points=ps.map(p2);
    const isSelStud = selected.includes(m.id);
    const isColliding = Boolean(m.collision) || collidingKeys.has(key);

    const isCornerPack = m.type === 'Corner pack' || m.type === 'Corner backing stud' || /corner/i.test(m.type) || /corner/i.test(m.role || '');
    const isJunctionPack = m.type.includes('junction') || m.type === 'Inside junction backing stud (Full)' || /junction|backing|flange|nailer|return/i.test(m.type) || /junction|backing|return/i.test(m.role || '');
    const isJunctionOrCornerPack = isCornerPack || isJunctionPack;
    const isOpeningStud = m.type === 'King stud' || m.type === 'Jack stud' || /king|jack/i.test(m.type);

    let studFill = '#dcfce7';
    let studStroke = '#15803d';

    if (isSelStud) {
      studFill = '#7dd3fc';
      studStroke = '#0284c7';
    } else if (isColliding) {
      studFill = '#800000'; // Dark Red fill for overlapping / colliding studs
      studStroke = '#450a0a'; // Deep Dark Red stroke
    } else if (isJunctionOrCornerPack) {
      studFill = '#dbeafe';
      studStroke = '#1d4ed8';
    } else if (isOpeningStud) {
      studFill = '#ffedd5';
      studStroke = '#c2410c';
    } else if (m.customSize) {
      studFill = '#f3e8ff';
      studStroke = '#7e22ce';
    }

    const studLw = isSelStud ? 2.3 : (isColliding ? 2.0 : (isJunctionOrCornerPack ? 1.6 : (isOpeningStud ? 1.4 : 0.9)));
    poly(points, studFill, studStroke, studLw);

    const isVerticalStud = !/^Block$|^Blocking$|noggin|plate|header|sill|beam|lintel/i.test(m.type) &&
      m.role !== 'Horizontal backing' &&
      (/stud|pack|junction/i.test(m.type) || /stud|return|corner|backing|support/i.test(m.role || '') || (typeof m.z0 === 'number' && typeof m.z1 === 'number' && typeof m.x0 === 'number' && typeof m.x1 === 'number' && (m.z1 - m.z0) > (m.x1 - m.x0)));
    if (isVerticalStud && points.length >= 4) {
      const crossLineColor = isColliding ? '#fca5a5' : studStroke;
      line(points[0], points[2], crossLineColor, isSelStud ? 1.6 : (isColliding ? 1.5 : (isJunctionOrCornerPack ? 1.2 : 0.75)));
      line(points[1], points[3], crossLineColor, isSelStud ? 1.6 : (isColliding ? 1.5 : (isJunctionOrCornerPack ? 1.2 : 0.75)));
    }
  }

  // 3. Draw Openings: Hidden (dashed) lines in wall cavity by default; optional sash when Openings toggle is ON; plus continuous green studs across openings
  const showOpenings = $('#wall-openings-toggle')?.checked === true;
  const openingLabelsToPlace = [];
  for (const d of wallDrawData) {
    const { w, outSign, sDepth } = d;
    const wallMembers = members.filter(x => x.wall.id === w.id).map(x => x.member);
    for(const o of hosted(w)){
      const hw = (o.width || 900) / 2;
      const opCode = openingCodeMap.get(o.id) || (o.type === 'door' ? 'D01 (900×2100 mm)' : 'W01 (1200×1200 mm)');

      const opWorld = framingMemberWorld(w, { x0: o.offset - hw, x1: o.offset + hw, depth: sDepth });
      const [p1, p2Pt, p3, p4] = opWorld.map(p2);
      const opCenterScreen = {
        x: (p1.x + p3.x) / 2,
        y: (p1.y + p3.y) / 2
      };

      // Clear solid wall plate lines across the opening and draw jamb end lines
      poly([p1, p2Pt, p3, p4], '#f7f9f6', null, 0);
      line(p1, p4, '#1e293b', 1.0);
      line(p2Pt, p3, '#1e293b', 1.0);

      // Lines along both faces of the wall across the rough opening
      line(p1, p2Pt, '#475569', 1.1, [5, 4]);
      line(p4, p3, '#475569', 1.1, [5, 4]);
      const midJambA = { x: (p1.x + p4.x) / 2, y: (p1.y + p4.y) / 2 };
      const midJambB = { x: (p2Pt.x + p3.x) / 2, y: (p2Pt.y + p3.y) / 2 };
      line(midJambA, midJambB, '#94a3b8', 0.8, [3, 3]);

      if (showOpenings) {
        if (o.type === 'door') {
          poly([p1, p2Pt, p3, p4], '#ffffff', '#64748b', 0.9);
          line(midJambA, midJambB, '#64748b', 0.85);
        } else {
          poly([p1, p2Pt, p3, p4], '#f0f9ff', '#0284c7', 1.0);
          const g1a = { x: p1.x * 0.6 + p4.x * 0.4, y: p1.y * 0.6 + p4.y * 0.4 };
          const g1b = { x: p2Pt.x * 0.6 + p3.x * 0.4, y: p2Pt.y * 0.6 + p3.y * 0.4 };
          const g2a = { x: p1.x * 0.4 + p4.x * 0.6, y: p1.y * 0.4 + p4.y * 0.6 };
          const g2b = { x: p2Pt.x * 0.4 + p3.x * 0.6, y: p2Pt.y * 0.4 + p3.y * 0.6 };
          line(g1a, g1b, '#0284c7', 1.0);
          line(g2a, g2b, '#0284c7', 1.0);
        }
      }

      // Draw all studs (cripple / header studs) inside the window/door opening with continuous line style
      const hiddenStuds = getOpeningHiddenStuds(w, o, model, wallMembers);
      for (const hs of hiddenStuds) {
        const sPts = hs.poly.map(p2);
        const isSelHs = hs.id && selected.includes(hs.id);
        const hsFill = isSelHs ? '#7dd3fc' : hs.customSize ? '#e9d5ff' : '#dcfce7';
        const hsStroke = isSelHs ? '#0284c7' : hs.customSize ? '#7c3aed' : '#15803d';
        poly(sPts, hsFill, hsStroke, isSelHs ? 2.3 : 0.9);
        line(sPts[0], sPts[2], hsStroke, isSelHs ? 1.6 : 0.75);
        line(sPts[1], sPts[3], hsStroke, isSelHs ? 1.6 : 0.75);
      }

      openingLabelsToPlace.push({ d, o, opCode, opCenterScreen, p1, p2Pt, p4 });
    }
  }

  // 3b. Draw 12 mm OSB Sheathing Boards when "12 mm OSB" toggle is ON
  const showOsb = $('#wall-osb-toggle')?.checked !== false;
  if (showOsb) {
    const osbThicknessMm = 12;
    for (const d of wallDrawData) {
      const { w, n, outSign, ext, sDepth } = d;
      if (!ext) continue;
      const side = window.getWallSheathingSide ? window.getWallSheathingSide(w) : (w.sheathingSide || (w.sheathingFlipped ? 'interior' : 'exterior'));
      if (side === 'none') continue;

      const isBoth = side === 'both';
      const isInterior = side === 'interior';

      const signsToRender = isBoth ? [outSign, -outSign] : [isInterior ? -outSign : outSign];

      for (const curSign of signsToRender) {
        const faceType = (curSign === outSign) ? 'exterior' : 'interior';
        const osbLayout = getWallOsbLayout(w, model, faceType);
        const nx = n.x * curSign, ny = n.y * curSign;
        for (const { segA, segB, joints } of osbLayout.segments) {
          const segPlate = framingMemberWorld(w, { x0: segA, x1: segB, depth: sDepth });
          const inA = curSign > 0 ? segPlate[0] : segPlate[3];
          const inB = curSign > 0 ? segPlate[1] : segPlate[2];
          const outA = { x: inA.x + nx * osbThicknessMm, y: inA.y + ny * osbThicknessMm };
          const outB = { x: inB.x + nx * osbThicknessMm, y: inB.y + ny * osbThicknessMm };
          const osbPts = [p2(inA), p2(inB), p2(outB), p2(outA)];
          poly(osbPts, '#fed7aa', '#dc2626', 0.4);
          // Stud-centered OSB sheet joint ticks along the sheathing
          for (const sx of joints) {
            const jtPlate = framingMemberWorld(w, { x0: sx, x1: sx + 1, depth: sDepth });
            const jIn = curSign > 0 ? jtPlate[0] : jtPlate[3];
            const jOut = { x: jIn.x + nx * osbThicknessMm, y: jIn.y + ny * osbThicknessMm };
            line(p2(jIn), p2(jOut), '#991b1b', 0.5);
          }
        }
      }
    }
  }

  // 3c. Clean 2D Framing Plan rendering without break symbols


  // 4. Draw Corner-to-Corner Dimensions FIRST so their bounding boxes are registered
  if ($('#wall-dimensions-toggle')?.checked !== false) {
    for (const d of wallDrawData) {
      const { w, run, outSign, ext, plateWorld } = d;
      if (ext) {
        const corners = getWallCornerEndpoints(w);
        if (corners.len >= 100) {
          const dimStr = (typeof window !== 'undefined' && typeof window.formatLength === 'function')
            ? window.formatLength(corners.len)
            : `${Math.round(corners.len)} mm`;
          archDim(corners.a, corners.b, corners.outSign * 44, dimStr, '#0f172a');
        }
      } else {
        const runLen = Math.max(0, run.end - run.start);
        if (runLen >= 150) {
          const intA = outSign > 0 ? plateWorld[0] : plateWorld[3];
          const intB = outSign > 0 ? plateWorld[1] : plateWorld[2];
          const intDimStr = (typeof window !== 'undefined' && typeof window.formatLength === 'function')
            ? window.formatLength(runLen)
            : `${Math.round(runLen)} mm`;
          archDim(intA, intB, outSign * 30, intDimStr, '#334155');
        }
      }
    }
  }

  // 5. Place Parallel Wall ID Tags & Parallel Window/Door Tags without overlapping
  for (const d of wallDrawData) {
    const { w, outSign, platePoints } = d;
    if (platePoints.length < 4) continue;
    const wallCode = `${wallCodeMap.get(w.id) || w.id}`;
    const pA = platePoints[0], pB = platePoints[1], pD = platePoints[3];
    const ux = pB.x - pA.x, uy = pB.y - pA.y;
    const uLen = Math.hypot(ux, uy) || 1;
    const uScr = { x: ux / uLen, y: uy / uLen };
    const nScr = { x: -uScr.y, y: uScr.x };
    const halfThickPx = Math.hypot(pA.x - pD.x, pA.y - pD.y) / 2;
    const centerScr = {
      x: (platePoints[0].x + platePoints[2].x) / 2,
      y: (platePoints[0].y + platePoints[2].y) / 2
    };
    drawParallelTag(
      centerScr,
      uScr,
      nScr,
      outSign,
      halfThickPx + 14 * ts,
      wallCode,
      7.4 * ts,
      '#0f172a',
      Math.max(24 * ts, uLen * 0.38)
    );
  }

  for (const item of openingLabelsToPlace) {
    const { d, opCode, opCenterScreen, p1, p2Pt, p4 } = item;
    const ux = p2Pt.x - p1.x, uy = p2Pt.y - p1.y;
    const uLen = Math.hypot(ux, uy) || 1;
    const uScr = { x: ux / uLen, y: uy / uLen };
    const nScr = { x: -uScr.y, y: uScr.x };
    const halfThickPx = Math.hypot(p1.x - p4.x, p1.y - p4.y) / 2;
    // Place opening tag parallel to the opening on the opposite side from the wall ID / dimension line
    drawParallelTag(
      opCenterScreen,
      uScr,
      nScr,
      -d.outSign,
      halfThickPx + 13 * ts,
      opCode,
      7.0 * ts,
      item.o.type === 'door' ? '#7c2d12' : '#0369a1',
      Math.max(24 * ts, uLen * 0.45)
    );
  }

  // 6. Room Labels (text only, no blue rectangle) from zone elements if present
  if ($('#wall-dimensions-toggle')?.checked !== false && typeof ctx !== 'undefined' && ctx) {
    const zones = model.elements.filter(e => e.type === 'zone' && e.story === activeStory && shown(e));
    for (const z of zones) {
      const center = z.center || (z.points?.length ? {
        x: z.points.reduce((s, p) => s + p.x, 0) / z.points.length,
        y: z.points.reduce((s, p) => s + p.y, 0) / z.points.length
      } : null);
      if (!center) continue;
      const cp = p2(center);
      drawParallelTag(
        cp,
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        1,
        0,
        (z.roomName || z.name || 'ROOM').toUpperCase(),
        8.2 * ts,
        '#0f172a',
        60 * ts
      );
    }
  }

  // 7. Visual Audit Legend Overlay for Wall Stud Packs
  if (typeof ctx !== 'undefined' && ctx && ctx.canvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Screen coordinates (fixed overlay)
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    const margin = 16;
    const pad = 10;
    const itemH = 20;
    const items = [
      { fill: '#800000', stroke: '#450a0a', label: 'Overlapping / Colliding Studs (Dark Red Warning)' },
      { fill: '#dbeafe', stroke: '#1d4ed8', label: 'Corner & Junction Packs (California / T-Backers)' },
      { fill: '#ffedd5', stroke: '#c2410c', label: 'Opening Jamb Packs (King & Jack Support Studs)' },
      { fill: '#dcfce7', stroke: '#15803d', label: 'Common Field Studs (Standard Spacing)' }
    ];

    const legendW = 340;
    const legendH = items.length * itemH + pad * 2 + 18;
    const lx = margin;
    const ly = ch - legendH - margin;

    // Draw background card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(lx, ly, legendW, legendH, 6);
    } else {
      ctx.rect(lx, ly, legendW, legendH);
    }
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('WALL FRAMING VISUAL AUDIT LEGEND', lx + pad, ly + pad + 10);

    // Items
    items.forEach((item, idx) => {
      const iy = ly + pad + 22 + idx * itemH;
      ctx.fillStyle = item.fill;
      ctx.strokeStyle = item.stroke;
      ctx.lineWidth = 1.5;
      ctx.fillRect(lx + pad, iy, 14, 14);
      ctx.strokeRect(lx + pad, iy, 14, 14);
      ctx.beginPath();
      ctx.moveTo(lx + pad, iy);
      ctx.lineTo(lx + pad + 14, iy + 14);
      ctx.moveTo(lx + pad + 14, iy);
      ctx.lineTo(lx + pad, iy + 14);
      ctx.stroke();

      ctx.font = '500 10.5px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(item.label, lx + pad + 22, iy + 11);
    });
    ctx.restore();
  }
}

