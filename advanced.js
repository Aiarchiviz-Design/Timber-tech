const viewportCut={enabled:false,axis:'z',position:1400,side:'below',panelOpen:false};let currentSnap='Grid';
function sectionPlaneY(){return model.views?.sectionA?.position??5850}
function resolveDimension(e){const refPoint=(ref,fallback)=>{const el=model.elements.find(v=>v.id===ref?.elementId);return el&&['a','b'].includes(ref.point)&&el[ref.point]?el[ref.point]:fallback};return {a:refPoint(e.refs?.[0],e.a),b:refPoint(e.refs?.[1],e.b),resolved:!e.refs||e.refs.every(ref=>!ref||model.elements.some(v=>v.id===ref.elementId&&v[ref.point]))}}
function dimensionReference(p){let best=null,bd=1;for(const e of model.elements.filter(e=>shown(e)&&e.type!=='dimension'))for(const k of ['a','b'])if(e[k]&&distance(p,e[k])<bd){best={elementId:e.id,point:k};bd=distance(p,e[k])}return best}
function dimensionSelectedWall(){const w=model.elements.find(e=>e.type==='wall'&&selected.includes(e.id));if(!w){toast('Select a wall to dimension.');return}add(newElement('dimension',{a:clone(w.a),b:clone(w.b),refs:[{elementId:w.id,point:'a'},{elementId:w.id,point:'b'}],offset:650}));toast('Dimension is linked to the wall endpoints.')}
function selectionPivot(){const ps=model.elements.filter(e=>selected.includes(e.id)&&!e.host).flatMap(e=>[e.a,e.b,...(e.points||[])].filter(Boolean));if(!ps.length)return null;return {x:(Math.min(...ps.map(p=>p.x))+Math.max(...ps.map(p=>p.x)))/2,y:(Math.min(...ps.map(p=>p.y))+Math.max(...ps.map(p=>p.y)))/2}}
function rotateSelection(angle,pivot=selectionPivot()){if(!pivot||!Number.isFinite(angle)){toast('Select a wall or drawing element and enter an angle.');return false}const co=Math.cos(angle*Math.PI/180),si=Math.sin(angle*Math.PI/180);return commit(()=>{for(const e of model.elements.filter(e=>selected.includes(e.id)&&!e.host)){if(e.type==='roof'){e.roofAngle=(e.roofAngle||0)+angle;if(e.roofFraming)e.roofFraming.angle=(e.roofFraming.angle||0)+angle;}for(const p of [e.a,e.b,...(e.points||[])].filter(Boolean)){const x=p.x-pivot.x,y=p.y-pivot.y;p.x=pivot.x+x*co-y*si;p.y=pivot.y+x*si+y*co}}})}
function rotationDialog(){const p=selectionPivot();if(!p){toast('Choose a wall or drawing element to rotate.');return}openModal('Rotate selection',`<label class="modal-field">Angle <input id="rotate-angle" type="number" value="90" step="1"></label><label class="modal-field">Pivot X · mm <input id="rotate-x" type="number" value="${Math.round(p.x)}"></label><label class="modal-field">Pivot Y · mm <input id="rotate-y" type="number" value="${Math.round(p.y)}"></label><div class="modal-copy">Connected wall endpoints follow the rotation. Hosted openings and framing stay attached.</div><div class="modal-actions"><button class="primary" id="rotate-apply">Rotate</button></div>`);$('#rotate-apply').onclick=()=>{const pivot={x:Number($('#rotate-x').value),y:Number($('#rotate-y').value)};if(!Number.isFinite(pivot.x)||!Number.isFinite(pivot.y)){toast('Enter valid pivot coordinates.');return}if(rotateSelection(Number($('#rotate-angle').value),pivot))$('#modal').close()}}
function duplicateSelection(copies,dx,dy){if(!Number.isInteger(copies)||copies<1||copies>50||![dx,dy].every(Number.isFinite)||Math.hypot(dx,dy)<1){toast('Use 1–50 copies and nonzero spacing.');return false}const source=model.elements.filter(e=>selected.includes(e.id)),selectedIds=new Set(source.map(e=>e.id));if(!source.length)return false;const all=[...source,...model.elements.filter(e=>e.host&&selectedIds.has(e.host)&&!selectedIds.has(e.id))].map(clone),created=[];
  return commit(()=>{for(let i=1;i<=copies;i++){const map=new Map(),batch=[];for(const old of all){const e=clone(old);e.id=unique(e.type);map.set(old.id,e.id);model.elements.push(e);batch.push({e,old})}for(const {e,old} of batch){if(e.host&&map.has(e.host))e.host=map.get(e.host);else if(e.host){const w=hostOf(e);if(w&&w.a&&w.b){const len=distance(w.a,w.b)||1;e.offset+=i*(dx*(w.b.x-w.a.x)+dy*(w.b.y-w.a.y))/len}}for(const p of [e.a,e.b,...(e.points||[])].filter(Boolean)){p.x+=dx*i;p.y+=dy*i}if(e.refs)e.refs=e.refs.map(ref=>(ref?{...ref,elementId:map.get(ref.elementId)||ref.elementId}:null));if(selectedIds.has(old.id))created.push(e.id)}}selected=created},false)
}
function arrayDialog(){if(!selected.length){toast('Select walls or elements to multiply.');return}openModal('Multiply selection',`<label class="modal-field">Copies <input id="array-count" type="number" value="3" min="1" max="50"></label><label class="modal-field">Step X · mm <input id="array-x" type="number" value="3000"></label><label class="modal-field">Step Y · mm <input id="array-y" type="number" value="0"></label><div class="modal-copy">Each copy is a BIM element with its own ID, hosted openings and generated framing.</div><div class="modal-actions"><button class="primary" id="array-apply">Create copies</button></div>`);$('#array-apply').onclick=()=>{if(duplicateSelection(Number($('#array-count').value),Number($('#array-x').value),Number($('#array-y').value)))$('#modal').close()}}
function elementBounds(e){const ps=e.type==='wall'?wallPoly(e):[e.a,e.b,...(e.points||[])].filter(Boolean);return ps.length?bounds2(ps):null}
function alignSelection(mode){const elements=selected.map(id=>model.elements.find(e=>e.id===id)).filter(e=>e&&!e.host),anchor=elements[0]&&elementBounds(elements[0]);if(elements.length<2||!anchor){toast('Select at least two elements. The first is the alignment anchor.');return false}const previous=clone(model);return commit(()=>{for(const e of elements.slice(1)){const b=elementBounds(e);if(!b)continue;const dx=mode==='left'?anchor.x0-b.x0:mode==='right'?anchor.x1-b.x1:mode==='centerX'?(anchor.x0+anchor.x1-b.x0-b.x1)/2:0,dy=mode==='top'?anchor.y0-b.y0:mode==='bottom'?anchor.y1-b.y1:mode==='centerY'?(anchor.y0+anchor.y1-b.y0-b.y1)/2:0;for(const p of [e.a,e.b,...(e.points||[])].filter(Boolean)){p.x+=dx;p.y+=dy}}updateWallConnections(previous,selected)},false)}
function alignmentDialog(){openModal('Align selection',`<div class="modal-copy">Align to the first selected element.</div><div class="modal-actions">${[['left','Left'],['right','Right'],['top','Top'],['bottom','Bottom'],['centerX','X centers'],['centerY','Y centers']].map(([id,label])=>`<button class="subtle" data-align="${id}">${label}</button>`).join('')}</div>`);$$('[data-align]').forEach(b=>b.onclick=()=>{if(alignSelection(b.dataset.align))$('#modal').close()})}
function tangentCandidates(point,circle){const center=circle.a,r=circle.radius,u=sub2(point,center),d2=u.x*u.x+u.y*u.y;if(d2<=r*r+JOIN_EPS)return [];const k=r*r/d2,h=r*Math.sqrt(d2-r*r)/d2;return [{x:center.x+k*u.x-h*u.y,y:center.y+k*u.y+h*u.x},{x:center.x+k*u.x+h*u.y,y:center.y+k*u.y-h*u.x}]}
// Snap geometry. A wall contributes its centerline AND both finished faces (joined corners, face midpoints,
// face lines); openings contribute centre + jamb points on the centerline and on both faces; circles/arcs
// contribute centre + quadrants; closed shapes contribute a centre; every straight edge offers thirds and
// quarters. Reference points are cached per model state so mouse-move snapping stays cheap.
let snapGeometryCache={key:null,value:null};
function snapGeometryKey(elements){return elements.map(e=>[e.id,e.type,e.story,e.host,e.offset,e.width,e.thickness,e.reference,e.radius,e.startAngle,e.sweep,e.a&&e.a.x,e.a&&e.a.y,e.b&&e.b.x,e.b&&e.b.y,(e.points||[]).map(q=>q.x+','+q.y).join(';')].join('|')).join('~')}
function snapGeometry(elements){
  const key=snapGeometryKey(elements);if(snapGeometryCache.key===key)return snapGeometryCache.value;
  const ends=[],mids=[],centers=[],divisions=[],segments=[],faceSegments=[],byId=new Map(model.elements.map(e=>[e.id,e]));
  const addSeg=(a,b,face=false)=>{if(distance(a,b)<1e-6)return;(face?faceSegments:segments).push({a,b,face});mids.push({q:lerp(a,b,.5),kind:'Midpoint'});for(const t of [1/3,2/3])divisions.push({q:lerp(a,b,t),kind:'Third'});for(const t of [.25,.75])divisions.push({q:lerp(a,b,t),kind:'Quarter'})};
  for(const e of elements){
    if(e.type==='wall'){
      ends.push({q:e.a,kind:'Endpoint'},{q:e.b,kind:'Endpoint'});addSeg(e.a,e.b);
      const poly=wallPoly(e);
      poly.forEach((q,k)=>{ends.push({q,kind:'Wall corner'});addSeg(q,poly[(k+1)%poly.length],true)});
      const len=distance(e.a,e.b)||1,ca=wallCenterPoint(e,e.a),cb=wallCenterPoint(e,e.b);
      centers.push({q:lerp(ca,cb,.5),kind:'Wall centre'});
    }else if(e.type==='door'||e.type==='window'){
      const w=byId.get(e.host);if(!w||w.type!=='wall')continue;
      const ca=wallCenterPoint(w,w.a),cb=wallCenterPoint(w,w.b),len=distance(ca,cb)||1,u={x:(cb.x-ca.x)/len,y:(cb.y-ca.y)/len},n={x:-u.y,y:u.x},t=(w.thickness||200)/2,c=lerp(ca,cb,Math.max(0,Math.min(1,e.offset/len))),h=(e.width||900)/2;
      centers.push({q:c,kind:'Opening centre'});
      for(const side of [-1,0,1]){const f={x:c.x+n.x*t*side,y:c.y+n.y*t*side};if(side)centers.push({q:f,kind:'Opening face'});for(const jam of [-1,1])ends.push({q:{x:f.x+u.x*h*jam,y:f.y+u.y*h*jam},kind:'Jamb'})}
    }else if(e.type==='circle'||e.type==='arc'){
      centers.push({q:e.a,kind:'Center'});const start=e.type==='arc'?(e.startAngle??0):0,sweep=e.type==='arc'?(e.sweep??Math.PI*1.5):Math.PI*2;
      if(e.type==='arc')for(const ang of [start,start+sweep])ends.push({q:{x:e.a.x+Math.cos(ang)*e.radius,y:e.a.y+Math.sin(ang)*e.radius},kind:'Endpoint'});
      for(let k=0;k<4;k++){const ang=k*Math.PI/2;if(e.type==='circle'||((ang-start+Math.PI*4)%(Math.PI*2))<=sweep)centers.push({q:{x:e.a.x+Math.cos(ang)*e.radius,y:e.a.y+Math.sin(ang)*e.radius},kind:'Quadrant'})}
    }else if(e.points&&e.points.length){
      for(const q of e.points)ends.push({q,kind:'Endpoint'});
      const n=e.points.length;for(let k=0;k<(e.type==='polyline'?n-1:n);k++)addSeg(e.points[k],e.points[(k+1)%n]);
      if(e.type!=='polyline'&&n>=3){let cx=0,cy=0,a=0;for(let k=0;k<n;k++){const p0=e.points[k],p1=e.points[(k+1)%n],cr=p0.x*p1.y-p1.x*p0.y;a+=cr;cx+=(p0.x+p1.x)*cr;cy+=(p0.y+p1.y)*cr}centers.push({q:Math.abs(a)>1e-6?{x:cx/(3*a),y:cy/(3*a)}:{x:e.points.reduce((s,q)=>s+q.x,0)/n,y:e.points.reduce((s,q)=>s+q.y,0)/n},kind:'Shape centre'})}
    }else if(e.a&&e.b){ends.push({q:e.a,kind:'Endpoint'},{q:e.b,kind:'Endpoint'});addSeg(e.a,e.b)}
    else if(e.a)ends.push({q:e.a,kind:'Endpoint'});
  }
  const value={ends,mids,centers,divisions,segments,faceSegments};snapGeometryCache={key,value};return value;
}
function advancedSnap(p){currentSnap=snap?'Grid':'Off';if(!snap)return p;const ignored=['grip','element'].includes(drag?.kind)?new Set(selected):new Set(),elements=model.elements.filter(e=>shown(e)&&!ignored.has(e.id)),radius=10/Math.max(baseScale*scale,.01),geo=snapGeometry(elements),all=[...geo.segments,...geo.faceSegments];let best=null,bd=radius;const candidate=(q,kind)=>{const d=distance(p,q);if(d<bd){best=q;bd=d;currentSnap=kind}};
  // Tier order: corners/endpoints, midpoints, centres/quadrants/opening points, intersections, thirds/quarters, then lines.
  for(const c of geo.ends)candidate(c.q,c.kind);if(best)return clone(best);
  for(const c of geo.mids)candidate(c.q,c.kind);if(best)return clone(best);
  for(const c of geo.centers)candidate(c.q,c.kind);if(best)return clone(best);
  const near=all.filter(seg=>segmentDistance(p,seg.a,seg.b).distance<radius*1.6);
  for(let i=0;i<near.length;i++)for(let j=i+1;j<near.length;j++){const h=axisIntersection(near[i].a,near[i].b,near[j].a,near[j].b);if(h&&h.t>=0&&h.t<=1&&h.s>=0&&h.s<=1)candidate(h.point,'Intersection')}if(best)return clone(best);
  for(const c of geo.divisions)candidate(c.q,c.kind);if(best)return clone(best);
  if(points.length&&['wall','line','beam','dimension'].includes(tool)){for(const seg of all)candidate(segmentDistance(points.at(-1),seg.a,seg.b).point,'Perpendicular');for(const e of elements.filter(e=>e.type==='circle'||e.type==='arc'))for(const q of tangentCandidates(points.at(-1),e))if(e.type!=='arc'||((Math.atan2(q.y-e.a.y,q.x-e.a.x)-(e.startAngle??0)+Math.PI*2)%(Math.PI*2))<=(e.sweep??Math.PI*1.5))candidate(q,'Tangent');if(best)return clone(best)}
  for(const seg of near)candidate(segmentDistance(p,seg.a,seg.b).point,seg.face?'On face':'On line');
  for(const e of elements.filter(e=>e.type==='circle'||e.type==='arc')){const d=distance(p,e.a);if(Math.abs(d-e.radius)<bd&&d>0){const ang=Math.atan2(p.y-e.a.y,p.x-e.a.x);if(e.type==='circle'||((ang-(e.startAngle??0)+Math.PI*4)%(Math.PI*2))<=(e.sweep??Math.PI*1.5))candidate({x:e.a.x+Math.cos(ang)*e.radius,y:e.a.y+Math.sin(ang)*e.radius},'On curve')}}
  return best?clone(best):{x:Math.round(p.x/100)*100,y:Math.round(p.y/100)*100};
}
function trackerPlace(){
  if(typeof commitTrackerPoint==='function'){commitTrackerPoint();return;}
}
function trackerUI(){
  const snapStatus=$('#snap-status');if(snapStatus)snapStatus.textContent=snap?'⊙ '+currentSnap+' snap':'⊙ Snap off';
}
function sectionSettings(){openModal('Section A–A',`<label class="modal-field">Cut Y · mm <input id="section-y" type="number" value="${sectionPlaneY()}" step="100"></label><div class="modal-copy">The section and plan marker use the same cut position. You can also use this plane to cut the 3D model.</div><div class="modal-actions"><button class="primary" id="section-apply">Update section</button></div>`);$('#section-apply').onclick=()=>{const y=Number($('#section-y').value);if(!Number.isFinite(y)||Math.abs(y)>1000000){toast('Enter a valid section coordinate.');return}if(commit(()=>{model.views={...model.views,sectionA:{axis:'y',position:y}}})){if(viewportCut.enabled&&viewportCut.axis==='y')viewportCut.position=y;$('#modal').close();render()}}}
function clipFootprint(ps){if(!viewportCut.enabled||viewportCut.axis==='z')return ps;const v=viewportCut.position,low=viewportCut.side==='below',a=viewportCut.axis==='x'?{x:v,y:0}:{x:0,y:v},b=viewportCut.axis==='x'?{x:v,y:1}:{x:1,y:v};return clipHalfPlane(cleanPolygon(ps),a,b,viewportCut.axis==='x'?low:!low)}
function clipSolidGeometry(ps,z0,z1){if(viewportCut.enabled&&viewportCut.axis==='z'){if(viewportCut.side==='below')z1=Math.min(z1,viewportCut.position);else z0=Math.max(z0,viewportCut.position)}ps=clipFootprint(ps);return ps.length>=3&&z1-z0>JOIN_EPS?{ps,z0,z1}:null}
function clipWallCells(cells){return cells.flatMap(c=>{const clipped=clipSolidGeometry(c.ps,c.z0,c.z1);return clipped?[{...c,...clipped,bounds:bounds2(clipped.ps)}]:[]})}
function isCutFace(ps){return viewportCut.enabled&&ps.every(p=>Math.abs(p[viewportCut.axis]-viewportCut.position)<.01)}
function clipUI(){
  const b=modelBounds3D(),axis=viewportCut.axis;
  if($('#cut-enabled')) $('#cut-enabled').checked=viewportCut.enabled;
  if($('#cut-axis')) $('#cut-axis').value=axis;
  if($('#cut-side')) $('#cut-side').value=axis;
  if($('#cut-side')) $('#cut-side').value=viewportCut.side;
  if($('#cut-position')) $('#cut-position').value=Math.round(viewportCut.position*10)/10;
  if($('#cut-slider')){
    $('#cut-slider').min=b[axis+'0'];
    $('#cut-slider').max=b[axis+'1'];
    $('#cut-slider').value=viewportCut.position;
  }
  $('#camera-cut')?.classList.toggle('enabled',viewportCut.enabled);
  $('#clip-panel')?.classList.toggle('hidden',!isModelView()||!viewportCut.panelOpen);
}
function initializeAdvanced(){
  for(const id of ['draft-length','draft-angle','draft-coord-x','draft-coord-y']){
    const el=$('#'+id);if(!el)continue;
    el.addEventListener('keydown',e=>{
      if(e.key==='Tab'){
        e.preventDefault();
        const ids=['draft-length','draft-angle','draft-coord-x','draft-coord-y'];
        const nextId=ids[(ids.indexOf(id)+1)%ids.length];
        const nextEl=$('#'+nextId);if(nextEl){nextEl.focus();nextEl.select()}
      }
    });
  }
  if($('#camera-cut')) $('#camera-cut').onclick=()=>{viewportCut.panelOpen=!viewportCut.panelOpen;if(viewportCut.panelOpen)viewportCut.enabled=true;clipUI();render()};
  if($('#cut-enabled')) $('#cut-enabled').onchange=e=>{viewportCut.enabled=e.target.checked;render();clipUI()};
  if($('#cut-axis')) $('#cut-axis').onchange=e=>{viewportCut.axis=e.target.value;const b=modelBounds3D();viewportCut.position=(b[e.target.value+'0']+b[e.target.value+'1'])/2;render();clipUI()};
  if($('#cut-side')) $('#cut-side').onchange=e=>{viewportCut.side=e.target.value;render()};
  if($('#cut-position')) $('#cut-position').onchange=e=>{const value=Number(e.target.value);if(Number.isFinite(value)&&Math.abs(value)<=1000000){viewportCut.position=value;render();clipUI()}};
  if($('#cut-slider')) $('#cut-slider').oninput=e=>{viewportCut.position=Number(e.target.value);render();if($('#cut-position'))$('#cut-position').value=viewportCut.position};
  if($('#cut-section')) $('#cut-section').onclick=()=>{viewportCut.axis='y';viewportCut.position=sectionPlaneY();viewportCut.enabled=true;render();clipUI()};
  if($('#cut-close')) $('#cut-close').onclick=()=>{viewportCut.panelOpen=false;clipUI();render()};
  if($('#wall-dimension')) $('#wall-dimension').onclick=dimensionSelectedWall;
  if($('#wall-array')) $('#wall-array').onclick=arrayDialog;
  if($('#wall-rotate')) $('#wall-rotate').onclick=rotationDialog;
  if($('#wall-flip')) $('#wall-flip').onclick=()=>{commit(()=>model.elements.filter(e=>e.type==='wall'&&selected.includes(e.id)).forEach(e=>e.flipped=!e.flipped))};
  trackerUI();clipUI();
}
