/* Atelier BIM Studio — truss design-assist and optimization review.
 * This module intentionally does not claim structural capacity: the current app has no
 * validated load-combination / timber design / connector solver. Geometry-only proposals
 * remain REVIEW until that solver is integrated and verified.
 */
const TRUSS_OPTIMIZER_VERSION='1.2.0';
const TRUSS_SECTION_CANDIDATES=[
 {label:'38 × 89 mm (nominal 2×4)',width:38,depth:89},
 {label:'38 × 140 mm (nominal 2×6)',width:38,depth:140},
 {label:'38 × 184 mm (nominal 2×8)',width:38,depth:184},
 {label:'38 × 235 mm (nominal 2×10)',width:38,depth:235},
 {label:'38 × 286 mm (nominal 2×12)',width:38,depth:286}
];
let lastTrussReview=null;
function trussReviewCollect(){
 const roofs=model.elements.filter(e=>e.type==='roof'&&shown(e));
 const all=[],assemblies=new Map(),issues=[],roofConfigs=[],connectionAudits=[];
 for(const roof of roofs){
  const cfg=roofFramingSettings(roof);roofConfigs.push({roofId:roof.id,system:cfg.system,spacingMm:cfg.spacing,memberWidthMm:cfg.width,chordDepthMm:cfg.depth,webDepthMm:cfg.webDepth,webPattern:cfg.webPattern||'legacy',panelCount:cfg.panelCount||0,hipSetbackMm:cfg.hipSetback||null});
  let generated;try{generated=generateRoofFraming(roof)}catch(err){issues.push(`${roof.id}: framing generation failed — ${err.message}`);continue}
  for(const issue of generated.issues||[])issues.push(`${roof.id}: ${issue}`);
  const roofMembers=generated.members||[];
  connectionAudits.push({roofId:roof.id,...trussAuditConnections(roofMembers)});
  for(const m of roofMembers){
   const len=Number(m.length)||Math.hypot(m.b.x-m.a.x,m.b.y-m.a.y,m.b.z-m.a.z);
   const valid=Number.isFinite(len)&&len>0&&[m.a,m.b].every(p=>p&&[p.x,p.y,p.z].every(Number.isFinite));
   const row={roofId:roof.id,id:m.id,assembly:m.assembly||m.id,type:m.type||'Unclassified member',length:len,width:Number(m.width)||roofFramingSettings(roof).width,depth:Number(m.depth)||roofFramingSettings(roof).depth,valid,section:m.section||`${m.width} × ${m.depth} mm`};
   all.push(row);const a=assemblies.get(row.assembly)||{id:row.assembly,roofId:roof.id,members:[],types:new Set(),length:0,invalid:0};a.members.push(row);a.types.add(row.type);a.length=Math.max(a.length,len);if(!valid)a.invalid++;assemblies.set(row.assembly,a);
  }
 }
 const list=[...assemblies.values()].map(a=>({...a,types:[...a.types],count:a.members.length,slendernessProxy:Math.max(...a.members.map(m=>m.length/Math.max(m.depth,1))),maxMemberLength:Math.max(...a.members.map(m=>m.length)),status:a.invalid?'FAIL':'REVIEW',reason:a.invalid?'Invalid member geometry':'Geometry-only review; loads, force analysis, connections and bracing not verified'}));
 for(const a of connectionAudits){
  if(a.invalidMembers)issues.push(`${a.roofId}: ${a.invalidMembers} member(s) have invalid or zero-length geometry.`);
  if(a.potentiallyDisconnectedEndpoints)issues.push(`${a.roofId}: ${a.potentiallyDisconnectedEndpoints} endpoint(s) have no nearby member intersection; check eave/bearing termination and truss joints.`);
 }
 return {roofs:roofs.length,roofConfigs,members:all,assemblies:list,connectionAudits,issues,generatedAt:new Date().toISOString(),version:TRUSS_OPTIMIZER_VERSION};
}
// Geometry-only connectivity audit. Unmatched endpoints are warnings, not failures:
// eaves and bearings may intentionally terminate without another generated timber member.
function trussAuditConnections(members,tolerance=2){
 const finitePoint=p=>!!p&&[p.x,p.y,p.z].every(Number.isFinite);
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
 const pointSegmentDistance=(p,a,b)=>{
  const vx=b.x-a.x,vy=b.y-a.y,vz=b.z-a.z,wx=p.x-a.x,wy=p.y-a.y,wz=p.z-a.z;
  const den=vx*vx+vy*vy+vz*vz;
  if(den<=1e-12)return distance(p,a);
  const t=Math.max(0,Math.min(1,(wx*vx+wy*vy+wz*vz)/den));
  return Math.hypot(p.x-(a.x+t*vx),p.y-(a.y+t*vy),p.z-(a.z+t*vz));
 };
 const valid=members.filter(m=>finitePoint(m.a)&&finitePoint(m.b)&&distance(m.a,m.b)>1e-6);
 const unmatched=[];let connectedEndpoints=0;
 for(const m of valid)for(const end of ['a','b']){
  const p=m[end];let connected=false;
  for(const other of valid){if(other===m)continue;
   if(distance(p,other.a)<=tolerance||distance(p,other.b)<=tolerance||pointSegmentDistance(p,other.a,other.b)<=tolerance){connected=true;break}
  }
  if(connected)connectedEndpoints++;else unmatched.push({memberId:m.id||'',assembly:m.assembly||m.id||'',end,point:{x:p.x,y:p.y,z:p.z}});
 }
 const invalidMembers=members.length-valid.length,endpointCount=valid.length*2;
 return {memberCount:members.length,invalidMembers,endpointCount,connectedEndpoints,
  potentiallyDisconnectedEndpoints:unmatched.length,unmatchedEndpoints:unmatched,toleranceMm:tolerance,
  status:invalidMembers?'FAIL':unmatched.length?'REVIEW':'PASS'};
}
function trussReviewPriority(a){const t=(a.id+' '+a.types.join(' ')).toLowerCase();if(/girder|carrier|jack|hip|valley|piggyback|junction/.test(t))return 0;if(a.slendernessProxy>25)return 1;if(a.slendernessProxy>18)return 2;return 3}
function trussSuggestSections(review){
 return review.assemblies.map(a=>{
  const sorted=a.members.slice().sort((x,y)=>y.length/Math.max(y.depth,1)-x.length/Math.max(x.depth,1));
  const m=sorted[0],current=TRUSS_SECTION_CANDIDATES.reduce((best,s)=>Math.abs(s.depth-m.depth)<Math.abs(best.depth-m.depth)?s:best,TRUSS_SECTION_CANDIDATES[0]);
  const currentIndex=TRUSS_SECTION_CANDIDATES.findIndex(s=>s.depth===current.depth),ratio=m.length/Math.max(m.depth,1);
  const step=ratio>30?2:ratio>20?1:0;
  const proposal=TRUSS_SECTION_CANDIDATES[Math.max(0,Math.min(TRUSS_SECTION_CANDIDATES.length-1,Math.max(0,currentIndex)+step))];
  return {assemblyId:a.id,roofId:a.roofId,memberCount:a.count,memberType:a.types.join(', '),governingLengthMm:Math.round(m.length),currentSection:m.section,geometryProposal:proposal.label,priority:trussReviewPriority(a),status:a.status==='FAIL'?'FAIL':'REVIEW',reason:a.status==='FAIL'?a.reason:'Section proposal is length/depth screening only; not a structural design recommendation'};
 });
}
function trussReviewEscape(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function trussReviewShow(mode='analyze'){
 let review;try{review=trussReviewCollect()}catch(err){toast('Truss review failed: '+err.message);return}
 if(!review.roofs){toast('Add or show a roof, then set its framing system to Trusses.');return}
 const proposals=trussSuggestSections(review).sort((a,b)=>a.priority-b.priority||b.governingLengthMm-a.governingLengthMm);
 lastTrussReview={...review,proposals,mode,designBasis:trussGetDesignBasis(),designBasisReadiness:trussBasisReadiness()};
 const invalid=review.assemblies.filter(a=>a.status==='FAIL').length,reviewCount=review.assemblies.length-invalid;
 const rows=proposals.map(p=>`<tr><td>${trussReviewEscape(p.assemblyId)}</td><td>${trussReviewEscape(p.memberType)}</td><td>${p.memberCount}</td><td>${p.governingLengthMm.toLocaleString()} mm</td><td>${trussReviewEscape(p.currentSection)}</td><td>${trussReviewEscape(p.geometryProposal)}</td><td><span class="truss-status ${p.status.toLowerCase()}">${p.status}</span></td></tr>`).join('');
 const issues=review.issues.map(i=>`<li>${trussReviewEscape(i)}</li>`).join('');
 openModal(mode==='optimize'?'Auto-optimization review':'Analyze all trusses',`<div class="truss-review">
 <div class="truss-review-banner"><strong>Design-assist review · ${trussReviewEscape(TRUSS_OPTIMIZER_VERSION)}</strong><p>All visible roofs and generated framing members have been inspected. This version performs geometry validation and generates section-size candidates; it does not yet solve structural loads or verify timber/connector capacities.</p></div>
 <div class="truss-kpis"><div><b>${review.roofs}</b><span>Roofs reviewed</span></div><div><b>${review.assemblies.length}</b><span>Assemblies found</span></div><div><b>${review.members.length}</b><span>Members checked</span></div><div><b>${invalid}</b><span>Geometry failures</span></div></div>
 <h3>${mode==='optimize'?'Candidate optimization register':'Analysis register'}</h3><p class="truss-muted">Priority: load-transfer/girder families first, then higher length-to-depth screening ratios. Proposed sizes are not automatically applied because there are no validated force/capacity results.</p>
 <div class="truss-table-wrap"><table class="truss-table"><thead><tr><th>Assembly / truss</th><th>Member types</th><th>Members</th><th>Longest member</th><th>Current section</th><th>Candidate to evaluate</th><th>Status</th></tr></thead><tbody>${rows||'<tr><td colspan="7">No generated truss members found. Set roof framing to Trusses.</td></tr>'}</tbody></table></div>
 <h3>Connection geometry audit</h3><p class="truss-muted">Endpoints are checked against other member centerlines within 2 mm. Unmatched endpoints may be intentional eave/bearing ends and require review; this does not verify connectors.</p><div class="truss-table-wrap"><table class="truss-table"><thead><tr><th>Roof</th><th>Members</th><th>Connected endpoints</th><th>Potentially unmatched</th><th>Invalid members</th><th>Status</th></tr></thead><tbody>${(review.connectionAudits||[]).map(a=>`<tr><td>${trussReviewEscape(a.roofId)}</td><td>${a.memberCount}</td><td>${a.connectedEndpoints}/${a.endpointCount}</td><td>${a.potentiallyDisconnectedEndpoints}</td><td>${a.invalidMembers}</td><td><span class="truss-status ${a.status.toLowerCase()}">${a.status}</span></td></tr>`).join('')}</tbody></table></div>
 <h3>Required engineering checks</h3><ul class="truss-checklist"><li>Loads and governing combinations: <b>NOT RUN</b></li><li>Member tension/compression and buckling: <b>NOT RUN</b></li><li>Deflection/serviceability: <b>NOT RUN</b></li><li>Reactions and girder/jack/hip load transfer: <b>NOT RUN</b></li><li>Bearings, connectors, ply fastening and bracing: <b>NOT RUN</b></li><li>Final structural status: <b>ENGINEER REVIEW REQUIRED</b></li></ul>
 ${issues?`<h3>Generation issues</h3><ul>${issues}</ul>`:''}
 <h3>Structural design basis</h3><p class="truss-muted">Saved project assumptions: ${trussBasisReadiness().complete?'required fields entered':'required inputs incomplete'}. This does not mean the structure has passed.</p><div class="truss-review-actions"><button class="subtle" id="truss-edit-basis">Edit design basis</button><button class="subtle" id="truss-export-csv">Export review CSV</button><button class="subtle" id="truss-export-json">Export audit JSON</button><button class="subtle" id="truss-solver-open">Experimental 2D solver</button><button class="primary" id="truss-run-again">Refresh analysis</button></div>
 </div>`);
 $('#truss-edit-basis').onclick=()=>trussDesignBasisDialog();
 $('#truss-export-csv').onclick=()=>download('atelier-truss-optimization-review.csv',trussReviewCSV(lastTrussReview),'text/csv');
 $('#truss-export-json').onclick=()=>download('atelier-truss-optimization-audit.json',JSON.stringify(lastTrussReview,null,2),'application/json');
 $('#truss-solver-open').onclick=()=>trussOpenExperimentalSolver();
 $('#truss-run-again').onclick=()=>{if($('#modal').open)$('#modal').close();trussReviewShow(mode)};
}
function trussReviewCSV(r){const cols=['assemblyId','roofId','memberCount','memberType','governingLengthMm','currentSection','geometryProposal','priority','status','reason'];const esc=v=>'"'+String(v??'').replace(/"/g,'""')+'"';return [cols.join(','),...(r?.proposals||[]).map(p=>cols.map(k=>esc(p[k])).join(','))].join('\r\n')}
function trussOptimizerProperties(){const b=trussGetDesignBasis(),r=trussBasisReadiness(b);return `<div class="section-header">STRUCTURAL DESIGN ASSIST</div><div class="truss-review-intro">Analyze all generated roof trusses, inspect geometry issues and create a prioritized member-size review register.</div><div class="wall-property-actions"><button class="primary" data-truss-action="analyze">Analyze all trusses</button><button class="subtle" data-truss-action="optimize">Optimize candidates</button><button class="subtle" id="truss-basis-open" onclick="trussDesignBasisDialog()">Design basis inputs</button></div><div class="empty-prop">Design basis: ${r.complete?'required fields entered':'incomplete'} · Structural solver: NOT AVAILABLE · Final status: NOT ANALYSED. Never treat geometry-based section suggestions as an engineering pass.</div>`}
function initializeTrussOptimizer(){document.addEventListener('click',e=>{const b=e.target.closest('[data-truss-action]');if(b)trussReviewShow(b.dataset.trussAction)});}

/* V3.78 — engineering design-basis capture and transparent readiness gate.
 * This records the engineer-supplied assumptions and blocks any implication that
 * geometry-only screening is a structural pass. It intentionally does not fabricate
 * code values or replace a validated code-compliant solver. */
const TRUSS_DESIGN_BASIS_KEY='atelierTrussDesignBasisV378';
function trussDefaultDesignBasis(){return {standard:'AS/NZS 1170 + AS 1720.1 (confirm project jurisdiction)',jurisdiction:'Australia / project-specific confirmation required',deadLoadKpa:'',liveLoadKpa:'',windPressureKpa:'',snowLoadKpa:'',timberGrade:'',elasticModulusMpa:'',bendingCapacityMpa:'',tensionCapacityMpa:'',compressionCapacityMpa:'',densityKgM3:'',supportModel:'',connectionDesign:'Not verified',bracingDesign:'Not verified',loadPathReviewed:false,engineerName:'',projectReference:''}}
function trussGetDesignBasis(){try{return {...trussDefaultDesignBasis(),...JSON.parse(localStorage.getItem(TRUSS_DESIGN_BASIS_KEY)||'{}')}}catch(_){return trussDefaultDesignBasis()}}
function trussBasisReadiness(b=trussGetDesignBasis()){
 const required=['standard','jurisdiction','deadLoadKpa','liveLoadKpa','windPressureKpa','timberGrade','elasticModulusMpa','bendingCapacityMpa','tensionCapacityMpa','compressionCapacityMpa','supportModel'];
 const missing=required.filter(k=>String(b[k]??'').trim()==='');
 const numeric=['deadLoadKpa','liveLoadKpa','windPressureKpa','snowLoadKpa','elasticModulusMpa','bendingCapacityMpa','tensionCapacityMpa','compressionCapacityMpa','densityKgM3'];
 const invalid=numeric.filter(k=>String(b[k]??'').trim()!==''&&(!Number.isFinite(Number(b[k]))||Number(b[k])<0));
 return {complete:missing.length===0&&invalid.length===0,missing,invalid,structuralSolverAvailable:false,structuralStatus:'NOT ANALYSED',reason:'No validated load-combination, timber member-capacity, stability, serviceability or connection solver is integrated in this build.'};
}
function trussDesignBasisDialog(){
 const b=trussGetDesignBasis(),f=(key,label,unit='',type='text',hint='')=>`<label class="truss-basis-field"><span>${label}${unit?` (${unit})`:''}</span><input data-basis="${key}" type="${type}" value="${trussReviewEscape(b[key]??'')}" ${type==='number'?'min="0" step="any"':''} placeholder="${hint}"></label>`;
 openModal('Structural design basis',`<div class="truss-review"><div class="truss-review-banner"><strong>Project inputs — not a structural pass/fail calculation</strong><p>Enter values from the project design brief and verified material data. Do not use guessed defaults. This build records and validates inputs but does not calculate code-compliant member capacities or reactions.</p></div><div class="truss-basis-grid">${f('standard','Design standard')}${f('jurisdiction','Jurisdiction / local amendments')}${f('projectReference','Project reference')}${f('engineerName','Responsible engineer')}${f('deadLoadKpa','Roof dead load','kPa','number')}${f('liveLoadKpa','Roof imposed / maintenance load','kPa','number')}${f('windPressureKpa','Net wind pressure','kPa','number')}${f('snowLoadKpa','Snow load (if applicable)','kPa','number')}${f('timberGrade','Timber species / grade')}${f('elasticModulusMpa','Elastic modulus E','MPa','number')}${f('bendingCapacityMpa','Design bending capacity (verified)','MPa','number')}${f('tensionCapacityMpa','Design tension capacity (verified)','MPa','number')}${f('compressionCapacityMpa','Design compression capacity (verified)','MPa','number')}${f('densityKgM3','Timber density','kg/m³','number')}${f('supportModel','Support / bearing assumptions')}${f('connectionDesign','Connection design status')}${f('bracingDesign','Bracing design status')}</div><label class="truss-basis-check"><input data-basis="loadPathReviewed" type="checkbox" ${b.loadPathReviewed?'checked':''}> Load path reviewed by the responsible engineer</label><div id="truss-basis-validation" class="truss-muted"></div><div class="truss-review-actions"><button class="subtle" id="truss-basis-cancel">Cancel</button><button class="primary" id="truss-basis-save">Save design basis</button></div></div>`);
 const validate=()=>{const next={};document.querySelectorAll('#modal [data-basis]').forEach(el=>next[el.dataset.basis]=el.type==='checkbox'?el.checked:el.value);const r=trussBasisReadiness(next);$('#truss-basis-validation').innerHTML=`<b>${r.complete?'Inputs complete for handoff':'Inputs incomplete'}</b><br>${r.missing.length?`Missing: ${r.missing.map(k=>trussReviewEscape(k)).join(', ')}. `:''}${r.invalid.length?`Invalid numeric values: ${r.invalid.join(', ')}. `:''}<br><b>Structural status remains NOT ANALYSED.</b>`;return next};
 document.querySelectorAll('#modal [data-basis]').forEach(el=>el.addEventListener('input',validate));$('#truss-basis-cancel').onclick=()=>$('#modal').close();$('#truss-basis-save').onclick=()=>{const next=validate();try{localStorage.setItem(TRUSS_DESIGN_BASIS_KEY,JSON.stringify(next));toast('Design basis saved on this browser; structural checks remain NOT ANALYSED.');$('#modal').close()}catch(e){toast('Could not save design basis in this browser. Export the review JSON instead.')}};validate();
}


/* V3.79 experimental solver: user-defined planar pin-jointed truss only.
 * Units: node coordinates in metres, loads in N, E in Pa, area in m^2.
 * This linear-elastic axial-only solver is a calculation aid, not a code design check.
 */
function trussSolveLinear2D(input){
 const nodes=input?.nodes||[],members=input?.members||[],loads=input?.loads||[],supports=input?.supports||[];
 if(nodes.length<2||!members.length)throw Error('Provide at least 2 nodes and 1 member.');
 const ids=new Set();for(const n of nodes){if(n.id==null||ids.has(String(n.id))||![n.x,n.y].every(v=>Number.isFinite(Number(v))))throw Error('Node IDs must be unique and coordinates finite.');ids.add(String(n.id))}
 const index=new Map(nodes.map((n,i)=>[String(n.id),i]));const nd=nodes.length*2,K=Array.from({length:nd},()=>Array(nd).fill(0)),F=Array(nd).fill(0);
 for(const l of loads){const i=index.get(String(l.node));if(i===undefined||!Number.isFinite(Number(l.fx||0))||!Number.isFinite(Number(l.fy||0)))throw Error('Invalid nodal load.');F[2*i]+=Number(l.fx||0);F[2*i+1]+=Number(l.fy||0)}
 const memData=[];
 for(const m of members){const i=index.get(String(m.a)),j=index.get(String(m.b)),E=Number(m.E),A=Number(m.A);if(i===undefined||j===undefined||i===j||!(E>0)||!(A>0)||!Number.isFinite(E*A))throw Error('Each member needs valid node IDs, E > 0 Pa and A > 0 m².');const dx=nodes[j].x-nodes[i].x,dy=nodes[j].y-nodes[i].y,L=Math.hypot(dx,dy);if(L<1e-9)throw Error('Zero-length member detected.');const c=dx/L,q=dy/L,k=E*A/L,vec=[-c,-q,c,q],dofs=[2*i,2*i+1,2*j,2*j+1];for(let r=0;r<4;r++)for(let t=0;t<4;t++)K[dofs[r]][dofs[t]]+=k*vec[r]*vec[t];memData.push({id:m.id??`M${memData.length+1}`,i,j,L,E,A,c,q,vec,dofs})}
 const fixed=new Set();for(const s of supports){const i=index.get(String(s.node));if(i===undefined)throw Error('Support references unknown node.');if(s.ux)fixed.add(2*i);if(s.uy)fixed.add(2*i+1)}
 const free=Array.from({length:nd},(_,i)=>i).filter(i=>!fixed.has(i));if(!free.length)throw Error('All degrees of freedom are restrained.');
 const A=free.map(i=>free.map(j=>K[i][j])),b=free.map(i=>F[i]);
 // Gaussian elimination with partial pivoting; singularity indicates a mechanism or insufficient supports.
 for(let col=0;col<free.length;col++){let pivot=col;for(let r=col+1;r<free.length;r++)if(Math.abs(A[r][col])>Math.abs(A[pivot][col]))pivot=r;const scale=Math.max(1,...A[pivot].map(Math.abs));if(Math.abs(A[pivot][col])<1e-12*scale)throw Error('Singular stiffness matrix: unstable mechanism or insufficient supports.');[A[col],A[pivot]]=[A[pivot],A[col]];[b[col],b[pivot]]=[b[pivot],b[col]];const v=A[col][col];for(let c=col;c<free.length;c++)A[col][c]/=v;b[col]/=v;for(let r=0;r<free.length;r++){if(r===col)continue;const f=A[r][col];if(!f)continue;for(let c=col;c<free.length;c++)A[r][c]-=f*A[col][c];b[r]-=f*b[col]}}
 const u=Array(nd).fill(0);free.forEach((d,i)=>u[d]=b[i]);const reactions=K.map((row,i)=>row.reduce((sum,v,j)=>sum+v*u[j],0)-F[i]);
 const memberResults=memData.map(m=>{const extension=m.vec.reduce((sum,v,k)=>sum+v*u[m.dofs[k]],0),force=m.E*m.A/m.L*extension;return {id:m.id,lengthM:m.L,extensionM:extension,axialForceN:force,stressPa:force/m.A,kind:force>=0?'TENSION':'COMPRESSION'}});
 return {solver:'Atelier 2D linear-elastic axial truss solver V3.79',units:{coordinates:'m',loads:'N',elasticModulus:'Pa',area:'m²',displacement:'m',force:'N',stress:'Pa'},nodes:nodes.length,members:members.length,displacements:nodes.map((n,i)=>({node:n.id,uxM:u[2*i],uyM:u[2*i+1]})),reactions:nodes.map((n,i)=>({node:n.id,rxN:fixed.has(2*i)?reactions[2*i]:0,ryN:fixed.has(2*i+1)?reactions[2*i+1]:0})),memberForces:memberResults,warning:'Linear elastic axial-only analysis of a user-defined planar pin-jointed truss. Does not check load combinations, timber design capacities, buckling, deflection limits, joints, bearings, uplift, bracing, 3D stability, or local code compliance.'};
}
function trussOpenExperimentalSolver(){
 const sample={nodes:[{id:'A',x:0,y:0},{id:'B',x:4,y:0},{id:'C',x:2,y:2}],members:[{id:'AB',a:'A',b:'B',E:200000000000,A:0.001},{id:'AC',a:'A',b:'C',E:200000000000,A:0.001},{id:'BC',a:'B',b:'C',E:200000000000,A:0.001}],supports:[{node:'A',ux:true,uy:true},{node:'B',uy:true}],loads:[{node:'C',fx:0,fy:-10000}]};
 openModal('Experimental 2D truss solver',`<div class="truss-review"><div class="truss-review-banner"><strong>Preliminary analysis only — not a code design check</strong><p>Enter a planar, pin-jointed axial truss as JSON. Coordinates are metres, loads N, E Pa, and cross-sectional area m². Singular models are rejected. Do not use the output alone for construction or member sizing.</p></div><label class="truss-basis-field">Truss model JSON<textarea id="truss-solver-json" rows="14" style="width:100%;font:12px monospace;box-sizing:border-box">${trussReviewEscape(JSON.stringify(sample,null,2))}</textarea></label><div class="truss-review-actions"><button class="subtle" id="truss-solver-sample">Load sample</button><button class="primary" id="truss-solver-run">Solve model</button></div><div id="truss-solver-output" class="truss-muted" style="white-space:pre-wrap;margin-top:12px"></div></div>`);
 $('#truss-solver-sample').onclick=()=>{$('#truss-solver-json').value=JSON.stringify(sample,null,2)};
 $('#truss-solver-run').onclick=()=>{try{const data=JSON.parse($('#truss-solver-json').value),result=trussSolveLinear2D(data);$('#truss-solver-output').textContent=JSON.stringify(result,null,2); }catch(e){$('#truss-solver-output').textContent='SOLVER ERROR: '+e.message}};
}
