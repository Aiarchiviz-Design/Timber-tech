const ROOF_FRAMING_DEFAULTS={system:'rafters',spacing:600,width:45,depth:190,webDepth:90,heel:300,angle:0,girderPlies:2,hipSetback:1828.8,webPattern:'Auto',panelCount:0,wingDirection:'branch'};
const ROOF_LOADS_DEFAULTS={snowLoad:20,windSpeed:115,deadLoad:15,liveLoad:20,timberSpecies:'DF-L'};
const TIMBER_SPECIES={
  'DF-L': {name:'Douglas Fir-Larch (DF-L)', densityKgM3: 545, densityLbFt3: 34},
  'SP': {name:'Southern Pine (SP)', densityKgM3: 577, densityLbFt3: 36},
  'SPF': {name:'Spruce-Pine-Fir (SPF)', densityKgM3: 497, densityLbFt3: 31},
  'HF': {name:'Hem-Fir (HF)', densityKgM3: 513, densityLbFt3: 32}
};
function roofFramingSettings(e){
  const saved=e.roofFraming||{},settings={...ROOF_FRAMING_DEFAULTS,...saved};
  // Keep the displayed/effective truss spacing consistent with the hard 12 in minimum.
  if(settings.system==='trusses'&&Number.isFinite(settings.spacing))settings.spacing=Math.max(settings.spacing,304.8);
  return settings;
}
/* Span- and load-driven truss web layout (design-assist, not a capacity check).
   Gravity: factored area load 1.2 D + 1.5 max(snow, live) over the truss spacing gives a line load on each truss.
   Pattern: Fink for short spans; Howe for longer spans, because its diagonals are in compression, which suits timber.
   Panel count: panels get shorter as the span and the line load grow.
   Web depth: the worst diagonal (next to the bearing) carries end shear / sin(web angle); the depth is the smallest
   standard size whose area keeps compression under a conservative 5.5 MPa allowable. */
const TRUSS_WEB_DEPTHS_MM=[89,140,184];
const TRUSS_WEB_ALLOW_MPA=5.5;
function trussWebLayout(spanMm,loads,spacingMm,pitchDeg,widthMm){
  const L={...ROOF_LOADS_DEFAULTS,...(loads||{})},PSF_TO_KPA=0.0478803;
  const dead=(L.deadLoad||0)*PSF_TO_KPA,live=Math.max(L.liveLoad||0,L.snowLoad||0)*PSF_TO_KPA;
  const wKpa=1.2*dead+1.5*live,wLine=wKpa*(spacingMm||600)/1000;
  const spanM=Math.max(1,spanMm/1000),heightM=Math.max(.3,(spanM/2)*Math.tan((pitchDeg||25)*Math.PI/180));
  const pattern=spanM<=8?'Fink':'Howe';
  const panelTargetM=(spanM<=8?1.2:1.8)*(wLine>6?.8:1);
  const panelCount=Math.min(16,Math.max(4,Math.round(spanM/panelTargetM)));
  const panelM=spanM/panelCount;
  const endShear=wLine*spanM/2;                       // kN at each bearing
  const sinWeb=(heightM/2)/Math.hypot(panelM,heightM/2);
  const webForceKn=endShear/Math.max(.2,sinWeb);       // worst diagonal, kN
  const reqDepth=(webForceKn*1000/TRUSS_WEB_ALLOW_MPA)/Math.max(1,widthMm||38);
  const webDepth=TRUSS_WEB_DEPTHS_MM.find(d=>d>=reqDepth)||TRUSS_WEB_DEPTHS_MM.at(-1);
  return {pattern,panelCount,webDepth,webForceKn:+webForceKn.toFixed(2),lineLoadKnPerM:+wLine.toFixed(2),spanM:+spanM.toFixed(2),heightM:+heightM.toFixed(2)};
}
window.trussWebLayout=trussWebLayout;
// used by the 2D Truss Elevation tab so its "Auto" family matches the 3D roof exactly
window.trussWebPlanFor=(spanM,spacingM,pitchDeg,widthMm)=>{const roof=(typeof model!=='undefined'&&Array.isArray(model?.elements)?model.elements:[]).find(e=>e.type==='roof');return trussWebLayout(spanM*1000,roof?roofLoadsSettings(roof):ROOF_LOADS_DEFAULTS,spacingM*1000,pitchDeg,widthMm)};
function roofLoadsSettings(e){
  const saved=e.roofLoads||{},settings={...ROOF_LOADS_DEFAULTS,...saved};
  return settings;
}
function validateRoofFraming(e){const c=roofFramingSettings(e);if(!['off','rafters','trusses'].includes(c.system)||!['spacing','width','depth','webDepth','heel','angle','panelCount'].every(k=>Number.isFinite(c[k]))||!['Auto','Fink','Howe','Pratt','Warren','Queen post','King post'].includes(c.webPattern)||!Number.isInteger(c.panelCount)||c.panelCount<0||c.panelCount>24||(c.panelCount>0&&c.panelCount<4)||c.spacing<100||c.spacing>3000||c.width<20||c.width>300||c.depth<40||c.depth>1000||c.webDepth<40||c.webDepth>600||c.heel<0||c.heel>2000||!Number.isInteger(c.girderPlies)||c.girderPlies<1||c.girderPlies>4||!Number.isFinite(c.hipSetback)||c.hipSetback<400||c.hipSetback>10000||!['branch','aligned'].includes(c.wingDirection))throw Error('Enter valid framing values. Panel count must be Auto (0) or 4–24; choose a supported web pattern.')}
function roofSection(ps,normal,station){const out=[];for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length],da=a.x*normal.x+a.y*normal.y-station,db=b.x*normal.x+b.y*normal.y-station;if(Math.abs(da)<.001)out.push(a);if(da*db<0){const t=da/(da-db);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z===undefined?undefined:a.z+(b.z-a.z)*t})}}const tangent={x:-normal.y,y:normal.x};return out.filter((p,i)=>!out.slice(0,i).some(q=>distance(p,q)<.01)).sort((a,b)=>(a.x-b.x)*tangent.x+(a.y-b.y)*tangent.y)}
function roofMemberFaces(m){if(m.cutFaces)return m.cutFaces;const d={x:m.b.x-m.a.x,y:m.b.y-m.a.y,z:m.b.z-m.a.z},l=Math.hypot(d.x,d.y,d.z),u={x:d.x/l,y:d.y/l,z:d.z/l},hl=Math.hypot(u.x,u.y),v=hl>.00001?{x:-u.y/hl,y:u.x/hl,z:0}:{x:1,y:0,z:0},n={x:u.y*v.z-u.z*v.y,y:u.z*v.x-u.x*v.z,z:u.x*v.y-u.y*v.x},ring=p=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>({x:p.x+v.x*a*m.width/2+n.x*b*m.depth/2,y:p.y+v.y*a*m.width/2+n.y*b*m.depth/2,z:p.z+v.z*a*m.width/2+n.z*b*m.depth/2})),a=ring(m.a),b=ring(m.b);return [[...a].reverse(),b,...a.map((_,i)=>[a[i],a[(i+1)%4],b[(i+1)%4],b[i]])]}
function extendTrussTopChordOverhangs(members,e,g,c){
  const overhang=roofSettings(e).overhang;
  if(!(overhang>0)||!g?.boundary?.length)return members;
  const pivot=roofBoundary(e),outer=g.boundary;
  const cross=(a,b)=>a.x*b.y-a.y*b.x;
  const signedArea=pivot.reduce((sum,p,i)=>sum+cross(p,pivot[(i+1)%pivot.length]),0)/2;
  const distanceToRing=(p,ring)=>ring.reduce((best,a,i)=>Math.min(best,segmentDistance(p,a,ring[(i+1)%ring.length]).distance),Infinity);
  // Extend only outward-facing perimeter ends, and solve the endpoint at the
  // exact perpendicular offset distance. The previous ray-to-any-boundary
  // method could follow an inward-pointing chord across the roof and hit the
  // opposite edge, producing overhangs many feet long.
  function overhangHit(p,other){
    const d={x:p.x-other.x,y:p.y-other.y};
    if(Math.hypot(d.x,d.y)<1e-6)return null;
    const hits=[];
    for(let i=0;i<pivot.length;i++){
      const edgeA=pivot[i],edgeB=pivot[(i+1)%pivot.length];
      if(segmentDistance(p,edgeA,edgeB).distance>0.75)continue;
      const ex=edgeB.x-edgeA.x,ey=edgeB.y-edgeA.y,el=Math.hypot(ex,ey)||1;
      // Outward normal for either polygon winding.
      const n=signedArea>=0?{x:ey/el,y:-ex/el}:{x:-ey/el,y:ex/el};
      const outward=d.x*n.x+d.y*n.y;
      if(outward<=1e-5)continue; // member points into the roof: never extend it
      const t=overhang/outward;
      if(!(t>0&&Number.isFinite(t)))continue;
      const candidate={x:p.x+d.x*t,y:p.y+d.y*t};
      // Candidate must lie on the computed offset perimeter, not merely on
      // some distant edge that happens to intersect the same infinite ray.
      if(distanceToRing(candidate,outer)<=Math.max(3,overhang*0.01))hits.push({...candidate,t});
    }
    return hits.sort((a,b)=>a.t-b.t)[0]||null;
  }
  return members.map(m=>{
    if(!/top chord/i.test(m.type)||!m.a||!m.b)return m;
    let a={...m.a},b={...m.b},changed=false;
    const hitA=overhangHit(a,b);
    if(hitA){a={x:hitA.x,y:hitA.y,z:a.z+(a.z-b.z)*hitA.t};changed=true;}
    const hitB=overhangHit(b,a);
    if(hitB){b={x:hitB.x,y:hitB.y,z:b.z+(b.z-a.z)*hitB.t};changed=true;}
    if(!changed)return m;
    return {...m,a,b,length:Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z),overhangExtended:true,overhangSource:{a:{...m.a},b:{...m.b}}};
  });
}

function generateRoofFraming(e){const raw=roofFramingSettings(e),c={...raw,spacing:raw.system==='trusses'?Math.max(raw.spacing,304.8):raw.spacing},members=[],issues=[];if(c.system==='off')return {members,issues};const g=roofGeometry(e),slope=Math.cos((e.pitch??25)*Math.PI/180),seen=new Set();
  function add(type,a,b,depth=c.depth,assembly='',receiverAssembly='',extra={}){if(!a||!b)return;const length=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);if(length<10)return;const point=p=>[p.x,p.y,p.z].map(n=>Math.round(n)).join(','),key=[type,...[point(a),point(b)].sort()].join('|');if(seen.has(key))return;seen.add(key);members.push({id:e.id+':RF-'+(members.length+1),roofId:e.id,type,a,b,width:c.width,depth,length,section:c.width+' × '+depth,assembly,...(receiverAssembly?{receiverAssembly}:{}),...extra})}
  const lower=p=>({...p,z:p.z-g.drop-c.depth/(2*slope)});
  if(c.system==='rafters'){
    for(const facet of g.facets){const n=surfaceNormal(facet),h=Math.hypot(n.x,n.y),normal=h>.0001?{x:-n.y/h,y:n.x/h}:{x:1,y:0},values=facet.map(p=>p.x*normal.x+p.y*normal.y),lo=Math.min(...values),hi=Math.max(...values);for(let t=lo+c.width/2;t<hi-c.width/2+.001;t+=c.spacing){const cut=roofSection(facet,normal,t);if(cut.length>=2)add('Rafter',lower(cut[0]),lower(cut.at(-1)))}}
    for(const edge of roofPlanEdges(g)){const a=edge.a,b=edge.b;if(g.boundary.some((p,i)=>segmentDistance(a,p,g.boundary[(i+1)%g.boundary.length]).distance<.01&&segmentDistance(b,p,g.boundary[(i+1)%g.boundary.length]).distance<.01))continue;add(Math.abs(a.z-b.z)<.1?'Ridge member':'Hip / valley member',lower(a),lower(b))}
  }else if(roofSettings(e).roofType==='hip'&&generateMultiWingTrusses(e,g,c,add,issues)){
    issues.push('Hip truss layout is preliminary: bearings, connections, bracing and load capacities are not verified.');
  }else{
    if(e.roofType==='hip')issues.push('Hip end assemblies require a rectangular footprint; this roof retains a preliminary sectional layout.');
    const angle=c.angle*Math.PI/180,normal={x:Math.cos(angle),y:Math.sin(angle)},tangent={x:-normal.y,y:normal.x},dot=p=>p.x*tangent.x+p.y*tangent.y,pivot=roofBoundary(e),values=pivot.map(p=>p.x*normal.x+p.y*normal.y),lo=Math.min(...values),hi=Math.max(...values);let truss=0;
    for(let station=lo+c.width/2;station<=hi-c.width/2;station+=c.spacing){const intersections=roofSection(pivot,normal,station);for(let k=0;k+1<intersections.length;k+=2){const left=dot(intersections[k]),right=dot(intersections[k+1]);if(right-left<2*c.depth)continue;const assembly=e.id+'-T'+String(++truss).padStart(3,'0'),segments=[],bottomZ=g.base-g.drop-c.depth/(2*slope),heelAt=t=>({x:normal.x*station+tangent.x*t,y:normal.y*station+tangent.y*t,z:bottomZ});for(const facet of g.facets){const cut=roofSection(facet,normal,station);if(cut.length<2)continue;let a=cut[0],b=cut.at(-1),x0=dot(a),x1=dot(b),start=Math.max(left,x0),end=Math.min(right,x1);if(end-start<1||x1-x0<1)continue;const at=t=>({x:normal.x*station+tangent.x*t,y:normal.y*station+tangent.y*t,z:a.z+(b.z-a.z)*(t-x0)/(x1-x0)-g.drop-c.depth/(2*slope)});const chordAt=t=>Math.abs(t-left)<.01||Math.abs(t-right)<.01?heelAt(t):at(t);segments.push({start,end,at:chordAt});add('Truss top chord',chordAt(start),chordAt(end),c.depth,assembly)}
      const trussPlan=c.webPattern==='Auto'?trussWebLayout(right-left,roofLoadsSettings(e),c.spacing,e.pitch??25,c.width):{pattern:c.webPattern,panelCount:c.panelCount||Math.max(4,Math.ceil((right-left)/2400)),webDepth:c.webDepth},atBottom=heelAt,atTop=t=>segments.find(s=>t>=s.start-.01&&t<=s.end+.01)?.at(t),count=trussPlan.panelCount;add('Truss bottom chord',atBottom(left),atBottom(right),c.depth,assembly);const topNodes=[],bottomNodes=[];for(let i=0;i<=count;i++){const t=left+(right-left)*i/count,top=atTop(t);if(top){topNodes.push({t,p:top});bottomNodes.push({t,p:atBottom(t)})}}if(topNodes.length>=2)addAdvancedTrussWebPattern(topNodes,bottomNodes,trussPlan.pattern,trussPlan.webDepth,assembly,add,'Truss web');
    }}issues.push('Truss layout is preliminary: bearings, girder trusses, bracing, plates and load design are not verified.');
  }const extended=extendTrussTopChordOverhangs(typeof applyTrussWebOverrides==='function'?applyTrussWebOverrides(members,e,c):members,e,g,c);const joined=dropOrphanTrussWebs(finishRoofConnections(joinTrussMembers(mergeRoofMembers(extended))));const deduped=removeDuplicateBottomChords(removeDuplicateTopChords(joined));const merged=typeof applyTrussAnalysisMemberOverrides==='function'?applyTrussAnalysisMemberOverrides(deduped,e,c):deduped;return {members:merged,issues:[...new Set(issues)]};
}
function mergeRoofMembers(members){const groups=new Map();for(const m of members){const l=m.length,d={x:(m.b.x-m.a.x)/l,y:(m.b.y-m.a.y)/l,z:(m.b.z-m.a.z)/l};if(d.x<-.000001||Math.abs(d.x)<.000001&&d.y<-.000001||Math.abs(d.x)<.000001&&Math.abs(d.y)<.000001&&d.z<0){d.x=-d.x;d.y=-d.y;d.z=-d.z}const dot=p=>p.x*d.x+p.y*d.y+p.z*d.z,t0=dot(m.a),t1=dot(m.b),origin={x:m.a.x-t0*d.x,y:m.a.y-t0*d.y,z:m.a.z-t0*d.z},key=[m.type,m.section,m.assembly,...[d.x,d.y,d.z].map(n=>Math.round(n*10000)),...[origin.x,origin.y,origin.z].map(n=>Math.round(n*100))].join('|'),g=groups.get(key)||{d,origin,parts:[]};g.parts.push({m,lo:Math.min(t0,t1),hi:Math.max(t0,t1)});groups.set(key,g)}const result=[];for(const g of groups.values()){const sorted=g.parts.sort((a,b)=>a.lo-b.lo),runs=[];for(const p of sorted){const last=runs.at(-1);if(last&&p.lo<=last.hi+.05)last.hi=Math.max(last.hi,p.hi);else runs.push({...p})}for(const p of runs){const at=t=>({x:g.origin.x+g.d.x*t,y:g.origin.y+g.d.y*t,z:g.origin.z+g.d.z*t});result.push({...p.m,a:at(p.lo),b:at(p.hi),length:p.hi-p.lo})}}return result.map((m,i)=>({...m,id:m.roofId+':RF-'+(i+1) }))}

// Suppress duplicate physical top-chord members. Exact centerline overlaps are
// removed first; near-coincident, parallel chord solids are also deduplicated when
// they substantially overlap. Girder/junction plies are exempt from fuzzy matching
// because their intentional member-width offsets represent separate plies.
// V3.94: a Common/Hip truss whose chords were all consumed where it abuts another wing's girder line must not leave
// floating webs behind. Drop webs of any such assembly that has no chord member left.
function dropOrphanTrussWebs(members){
  const withChord=new Set(members.filter(m=>m.assembly&&/chord/i.test(m.type||'')).map(m=>m.assembly));
  return members.filter(m=>!(m.assembly&&/^(Common|Hip) truss web/i.test(m.type||'')&&!withChord.has(m.assembly)));
}
function removeDuplicateTopChords(members){
  const isTop=m=>/top chord/i.test(m.type||''),
    rank=m=>/^Girder truss/i.test(m.type||'')?6:/^Junction girder/i.test(m.type||'')?5:/^Hip carrier/i.test(m.type||'')?4:/^Hip truss/i.test(m.type||'')?3:/^Common truss/i.test(m.type||'')?3:/^Front jack/i.test(m.type||'')?2:/^Side jack/i.test(m.type||'')?1:0,
    family=m=>/^Girder truss/i.test(m.type||'')?'girder':/^Junction girder/i.test(m.type||'')?'junction':/^Hip carrier/i.test(m.type||'')?'carrier':/^Hip truss/i.test(m.type||'')?'hip':/^Common truss/i.test(m.type||'')?'common':/^Front jack/i.test(m.type||'')?'front':/^Side jack/i.test(m.type||'')?'side':'generic';
  const lineInfo=m=>{const d={x:m.b.x-m.a.x,y:m.b.y-m.a.y,z:m.b.z-m.a.z},length=Math.hypot(d.x,d.y,d.z);if(length<.01)return null;return {u:{x:d.x/length,y:d.y/length,z:d.z/length},length,origin:m.a};};
  const crossDir=(A,B)=>Math.hypot(A.u.y*B.u.z-A.u.z*B.u.y,A.u.z*B.u.x-A.u.x*B.u.z,A.u.x*B.u.y-A.u.y*B.u.x);
  const pointLineDistance=(p,info)=>{const v={x:p.x-info.origin.x,y:p.y-info.origin.y,z:p.z-info.origin.z},t=v.x*info.u.x+v.y*info.u.y+v.z*info.u.z;return Math.hypot(v.x-t*info.u.x,v.y-t*info.u.y,v.z-t*info.u.z)};
  const spanOn=(m,info)=>{const t=p=>(p.x-info.origin.x)*info.u.x+(p.y-info.origin.y)*info.u.y+(p.z-info.origin.z)*info.u.z;return [t(m.a),t(m.b)].sort((a,b)=>a-b)};
  const remove=new Set(),tops=members.filter(isTop);
  for(let i=0;i<tops.length;i++){
    const a=tops[i];if(remove.has(a))continue;const A=lineInfo(a);if(!A)continue;
    for(let j=i+1;j<tops.length;j++){
      const b=tops[j];if(remove.has(b)||Math.abs((a.width||0)-(b.width||0))>.1||Math.abs((a.depth||0)-(b.depth||0))>.1)continue;
      const B=lineInfo(b);if(!B)continue;
      const angle=crossDir(A,B);if(angle>.004)continue; // parallel within about 0.23 degrees
      const offset=Math.max(pointLineDistance(b.a,A),pointLineDistance(b.b,A),pointLineDistance(a.a,B),pointLineDistance(a.b,B));
      const exactLine=offset<1;
      const fa=family(a),fb=family(b),isGirderPair=['girder','junction'].includes(fa)&&['girder','junction'].includes(fb);
      // Preserve intentionally offset girder and junction-girder plies.
      if(!exactLine&&isGirderPair)continue;
      // For fuzzy matches, require same member role (or a generic legacy chord)
      // and a centerline offset smaller than the physical member width tolerance.
      if(!exactLine){
        if(!(fa===fb||fa==='generic'||fb==='generic'))continue;
        const fuzzyTolerance=Math.min(65,Math.max(28,Math.min(a.width||45,b.width||45)*1.25));
        if(offset>fuzzyTolerance)continue;
      }
      const sa=spanOn(a,A),sb=spanOn(b,A),overlap=Math.max(0,Math.min(sa[1],sb[1])-Math.max(sa[0],sb[0])),shorter=Math.min(A.length,B.length),ratio=shorter>0?overlap/shorter:0;
      if(exactLine){
        const containedA=sa[0]>=sb[0]-.5&&sa[1]<=sb[1]+.5,containedB=sb[0]>=sa[0]-.5&&sb[1]<=sa[1]+.5;
        if(!(containedA||containedB))continue;
        if(a.type===b.type){if(containedA&&!containedB)remove.add(a);else if(containedB&&!containedA)remove.add(b);else if(Math.abs(A.length-B.length)<1)remove.add(b);else remove.add(A.length<B.length?a:b);}
        else {
          const aShort= A.length < B.length-.5, bShort=B.length < A.length-.5;
          if(aShort&&containedA)remove.add(a);else if(bShort&&containedB)remove.add(b);else if(rank(a)!==rank(b))remove.add(rank(a)<rank(b)?a:b);else if(Boolean(a.receiverAssembly)!==Boolean(b.receiverAssembly))remove.add(a.receiverAssembly?b:a);else remove.add(b);
        }
        continue;
      }
      // A duplicate must share most of the shorter member's span, not merely
      // touch at a hip/junction; true nearby trusses at the normal 600 mm O.C.
      // spacing therefore remain distinct.
      if(shorter<300||ratio<.72)continue;
      const aContained=sa[0]>=sb[0]-Math.max(1,offset)&&sa[1]<=sb[1]+Math.max(1,offset),bContained=sb[0]>=sa[0]-Math.max(1,offset)&&sb[1]<=sa[1]+Math.max(1,offset);
      if(A.length<B.length-.5&&aContained)remove.add(a);
      else if(B.length<A.length-.5&&bContained)remove.add(b);
      else if(rank(a)!==rank(b))remove.add(rank(a)<rank(b)?a:b);
      else if(Boolean(a.receiverAssembly)!==Boolean(b.receiverAssembly))remove.add(a.receiverAssembly?b:a);
      else remove.add(b); // stable, deterministic choice for equal duplicated chords
    }
  }
  return members.filter(m=>!remove.has(m));
}

// Build a cross-roof framing set so overlapping roof objects cannot render the
// same common/hip/jack top chord twice. The per-roof generator still owns member
// geometry; only physically duplicated top-chord render/schedule entries are removed.
// Remove exact duplicate bottom chords created where decomposed multi-wing roof
// rectangles share the same truss station. Top chords are already deduplicated;
// leaving the matching bottom chord behind creates a ghost assembly and a member
// count/connection mismatch after rotating the same footprint. Intentional girder
// plies and open jack chords are never considered by this pass.
function removeDuplicateBottomChords(members){
  const bottom=m=>/^(Common truss|Hip truss) bottom chord$/.test(m.type||'');
  const close=(a,b,tol=1)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)<=tol;
  const removed=new Set(),priority=m=>m.type.startsWith('Hip truss')?2:1;
  const ordered=members.filter(bottom).slice().sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  for(let i=0;i<ordered.length;i++){
    const a=ordered[i];if(removed.has(a))continue;
    for(let j=i+1;j<ordered.length;j++){
      const b=ordered[j];if(removed.has(b)||a.assembly===b.assembly)continue;
      if(Math.abs((a.width||0)-(b.width||0))>.1||Math.abs((a.depth||0)-(b.depth||0))>.1)continue;
      const same=(close(a.a,b.a)&&close(a.b,b.b))||(close(a.a,b.b)&&close(a.b,b.a));
      if(!same)continue;
      if(priority(a)!==priority(b))removed.add(priority(a)<priority(b)?a:b);
      else removed.add(String(a.id)<=String(b.id)?b:a);
    }
  }
  return members.filter(m=>!removed.has(m));
}

function projectRoofFraming(roofElements,useCache=false){
  try{if(typeof autoAlignTrussRoofsToWallPlates==='function'&&Array.isArray(model?.elements))autoAlignTrussRoofsToWallPlates()}catch(err){console.warn('truss wall seating skipped',err)}
  const layouts=roofElements.map(e=>({e,layout:useCache?generateRoofFramingCached(e):generateRoofFraming(e)}));
  const cleaned=removeDuplicateTopChords(layouts.flatMap(x=>x.layout.members));
  const byRoof=new Map();
  for(const {e,layout} of layouts)byRoof.set(e.id,{...layout,members:cleaned.filter(m=>m.roofId===e.id)});
  return {members:cleaned,byRoof};
}

// Keep the underside of each truss bottom chord seated on the top face of the wall top plates.
// This is a roof-level adjustment; it deliberately does not change wall height or story geometry.
// Only the BEARING walls set the plate level: walls that run along the roof perimeter (heel line, including the overhang-free
// outline). Interior partitions and taller gable/parapet walls no longer lift the whole roof off the outer walls.
function trussBearingPlateLevel(e){
  const walls=model.elements.filter(w=>w.type==='wall'&&w.story===e.story);
  if(!walls.length)return null;
  const poly=(typeof roofBoundary==='function'?roofBoundary(e):e.points)||[];
  const onPerimeter=w=>{
    if(poly.length<3)return true;
    const tol=Math.max(250,(w.thickness||200)*1.25);
    return poly.some((p,i)=>{const q=poly[(i+1)%poly.length];
      return segmentDistance(w.a,p,q).distance<=tol&&segmentDistance(w.b,p,q).distance<=tol});
  };
  const bearing=walls.filter(onPerimeter),use=bearing.length?bearing:walls;
  return Math.max(...use.map(w=>wallBase(w)+heightOf(w)));
}
function alignTrussRoofToWallPlates(e){
  if(!e||e.type!=='roof'||roofFramingSettings(e).system!=='trusses')return false;
  const plate=trussBearingPlateLevel(e);
  if(plate===null||!Number.isFinite(plate))return false;
  const c=roofFramingSettings(e),g=roofGeometry(e);
  // bottom-chord centreline = base - roof skin drop - heel - half chord depth;
  // its underside is another half depth below that, so base must be plate + drop + heel + depth.
  const cos=Math.cos((e.pitch??25)*Math.PI/180),desiredBase=plate+g.drop+c.depth/(2*cos)+c.depth/2,st=storyOf(e),desiredOffset=desiredBase-st.elevation-st.height;
  if(Math.abs((e.roofOffset||0)-desiredOffset)<.01&&e.followStory)return false;
  e.followStory=true;e.roofOffset=desiredOffset;return true;
}
function autoAlignTrussRoofsToWallPlates(){
  if(!Array.isArray(model?.elements)||!Array.isArray(model?.stories))return false;
  let changedAny=false;
  for(const e of model.elements)if(e.type==='roof'&&roofFramingSettings(e).system==='trusses')changedAny=alignTrussRoofToWallPlates(e)||changedAny;
  if(changedAny)roofFramingCache?.clear?.();
  return changedAny;
}
function alignRoofFraming(e){
  if(!e||e.type!=='roof')return;
  const walls=model.elements.filter(w=>w.type==='wall'&&w.story===e.story);
  if(!walls.length){toast('Add walls on this roof’s story to set a plate level.');return}
  const c=roofFramingSettings(e),g=roofGeometry(e),cos=Math.cos((e.pitch??25)*Math.PI/180),plate=Math.max(...walls.map(w=>wallBase(w)+heightOf(w))),rise=g.drop+(c.system==='trusses'?c.depth/(2*cos)+c.depth/2:c.depth/(2*cos)+c.depth*cos/2);
  commit(()=>{e.followStory=true;e.roofOffset=plate+rise-storyOf(e).elevation-storyOf(e).height});toast('Roof elevation aligned to wall top plates; wall height is unchanged. Structural bearing still requires design.')
}
/* Redraws (orbit, pan, zoom) used to regenerate and re-trim every truss each frame (~150 ms on an 800-member roof). Generation depends only on
   the roof element, its story and its resolved height, so the finished member list is memoised on exactly those inputs. Editing code still
   calls generateRoofFraming directly. */
const roofFramingCache=new Map();
function generateRoofFramingCached(e){let key;try{key=JSON.stringify([e,storyOf(e),heightOf(e)])}catch(err){return generateRoofFraming(e)}let r=roofFramingCache.get(key);if(!r){r=generateRoofFraming(e);roofFramingCache.set(key,r);if(roofFramingCache.size>16)roofFramingCache.delete(roofFramingCache.keys().next().value)}return r}
function drawRoofFraming3D(){const roofs=model.elements.filter(e=>e.type==='roof'&&shown(e)),members=projectRoofFraming(roofs,true).members;for(const m of members)for(const world of roofMemberFaces(m)){const points=world.map(project3);projectedFaces.push({id:m.roofId||m.id,world,points,depth:points.reduce((a,p)=>a+p.depth,0)/points.length,cutSurface:isCutFace(world),timberMember:true,memberType:m.type,memberId:m.id,assembly:m.assembly})}}
function roofPlanAssemblies(members){
  const groups=new Map();for(const m of members){if(m.type.includes('web')||m.type.includes('post'))continue;const key=m.assembly||m.id,g=groups.get(key)||{id:key,type:m.type,points:[]};g.points.push(m.a,m.b);groups.set(key,g)}
  const seen=new Set(),girders=[],counts={};return [...groups.values()].sort((a,b)=>a.id.localeCompare(b.id)).flatMap(g=>{let a=g.points[0],b=a;for(const p of g.points)for(const q of g.points)if(distance(p,q)>distance(a,b)){a=p;b=q}if(distance(a,b)<1)return [];const code=g.type.startsWith('Junction')?'JG':g.type.startsWith('Girder')?'HG':g.type.startsWith('Front jack')?'JK':g.type.startsWith('Side jack')?'SJ':g.type.startsWith('Hip carrier')?'HC':g.type.startsWith('Hip truss')?'HT':g.type.includes('truss')||g.type.includes('Truss')?'TR':'RF',mid=lerp(a,b,.5),key=code+':'+Math.round(mid.x/100)+':'+Math.round(mid.y/100);if(seen.has(key))return [];let plyIds=[g.id];if(code==='HG'||code==='JG'){const dup=girders.find(q=>q.code===code&&distance(q.mid,mid)<200);if(dup){dup.ids.push(g.id);return []}plyIds=[g.id];girders.push({code,mid,ids:plyIds})}seen.add(key);counts[code]=(counts[code]||0)+1;return [{...g,a,b,code,plyIds,tag:code+'-'+String(counts[code]).padStart(2,'0')}];});
}
function roofPlanColor(code){return {HG:'#dc2626',JG:'#dc2626',JK:'#16a34a',SJ:'#9333ea',HC:'#d946ef',HT:'#d97706',TR:'#d97706',RF:'#0891b2'}[code]||'#64748b'}
function roofPlanDimension(a,b,text){const color='#64748b';line(a,b,color,1.2);const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;for(const [p,sign] of [[a,1],[b,-1]])poly([p,{x:p.x+sign*ux*8-uy*4,y:p.y+sign*uy*8+ux*4},{x:p.x+sign*ux*8+uy*4,y:p.y+sign*uy*8-ux*4}],color);if(Math.abs(dy)>Math.abs(dx)){ctx.save();ctx.translate((a.x+b.x)/2-12,(a.y+b.y)/2);ctx.rotate(-Math.PI/2);label(text,0,0,11,'#334155');ctx.restore()}else label(text,(a.x+b.x)/2,(a.y+b.y)/2-12,11,'#334155')}
function checkMemberSpanWarning(m, loads, cfg) {
  const lenM = (m.length || Math.hypot(m.b.x-m.a.x, m.b.y-m.a.y))/1000;
  const dMm = m.depth || cfg.depth || 190;
  const wMm = m.width || cfg.width || 45;
  const tribM = (cfg.spacing || 600)/1000;
  const qKpa = (1.2*(loads.deadLoad||15) + 1.6*(loads.snowLoad||20) + 0.5*(loads.liveLoad||20)) * 0.04788;
  const linLoad = qKpa * tribM;
  const wM = wMm/1000, dM = dMm/1000;
  const S = (wM * dM * dM) / 6;
  const Fb = 12000;
  const M_allow = Fb * S;
  const M_actual = (linLoad * lenM * lenM) / 8;
  const ratio = M_allow > 0 ? M_actual / M_allow : 0;
  return { isWarning: ratio > 1.0, ratio, lenM };
}
function drawRoofStud(mA, mB, widthMm, fillColor, borderColor) {
  const dx = mB.x - mA.x;
  const dy = mB.y - mA.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const half = (widthMm || 45) / 2;

  const p1 = p2({ x: mA.x - nx * half, y: mA.y - ny * half });
  const p2Pt = p2({ x: mB.x - nx * half, y: mB.y - ny * half });
  const p3 = p2({ x: mB.x + nx * half, y: mB.y + ny * half });
  const p4 = p2({ x: mA.x + nx * half, y: mA.y + ny * half });

  poly([p1, p2Pt, p3, p4], fillColor, borderColor, 1);
}

function drawRoofFramingPlan(){
  let count=0, totalWarnings=0;
  const occupied=[],roofs=model.elements.filter(e=>e.type==='roof'&&shown(e)),projectLayout=projectRoofFraming(roofs,false);
  const connPoints = [];

  const spanArrowFn = window.drawSpanArrow || function(pA, pB, labelText, subText = '', color = '#0284c7') {
    line(pA, pB, color, 1.5, [6, 4]);
    const midX = (pA.x + pB.x) / 2, midY = (pA.y + pB.y) / 2;
    rect(midX - 80, midY - 9, 160, 18, '#ffffff', color, 1);
    label(labelText, midX, midY, 8.5, color, 'center');
  };

  for(const e of roofs){
    const g=roofGeometry(e),layout=projectLayout.byRoof.get(e.id)||generateRoofFraming(e),loads=roofLoadsSettings(e),cfg=roofFramingSettings(e),ps=g.boundary.map(p2),pivot=roofBoundary(e).map(p2);
    count+=layout.members.length;

    // Roof footprint outline
    poly(ps,'rgba(241,245,249,.65)',null);
    for(let i=0;i<ps.length;i++)line(ps[i],ps[(i+1)%ps.length],'#0284c7',1.8,[7,5]);
    for(let i=0;i<pivot.length;i++)line(pivot[i],pivot[(i+1)%pivot.length],'#64748b',2);

    // Fold / Ridge lines
    for(const edge of roofPlanEdges(g)){
      const mid=lerp(edge.a,edge.b,.5);
      if(g.boundary.some((p,i)=>segmentDistance(mid,p,g.boundary[(i+1)%g.boundary.length]).distance<.1))continue;
      const diagonal=Math.abs(edge.a.z-edge.b.z)>.1;
      line(p2(edge.a),p2(edge.b),diagonal?'#d946ef':'#eab308',diagonal?1.6:1,diagonal?[]:[5,5]);
    }

    const groups=roofPlanAssemblies(layout.members);

    // Draw Roof Members as true timber studs (thick 2D rectangles) with color-coded fills
    for(const m of groups) {
      const isGirder = m.code === 'HG' || m.code === 'JG';
      const isHip = m.code === 'HT' || m.code === 'HC';
      const isJack = m.code === 'JK' || m.code === 'SJ';
      const widthMm = isGirder ? 90 : isHip ? 60 : 45;

      const colors = isGirder ? { fill: '#fee2e2', border: '#dc2626' } :
                     isHip ? { fill: '#fef3c7', border: '#d97706' } :
                     isJack ? { fill: '#dcfce7', border: '#16a34a' } :
                     { fill: '#e0f2fe', border: '#0284c7' };

      drawRoofStud(m.a, m.b, widthMm, colors.fill, colors.border);

      // Add connection points at ends
      const endA = p2(m.a), endB = p2(m.b);
      if (isGirder) {
        rect(endA.x - 6, endA.y - 6, 12, 12, '#fee2e2', '#dc2626', 1.5);
        label('CC', endA.x, endA.y + 3, 7, '#dc2626', 'center');
        rect(endB.x - 6, endB.y - 6, 12, 12, '#fee2e2', '#dc2626', 1.5);
        label('CC', endB.x, endB.y + 3, 7, '#dc2626', 'center');
        connPoints.push({ x: m.a.x, y: m.a.y, tag: m.tag, type: 'Girder Seat', title: `GIRDER TRUSS BEARING SEAT (${m.tag})`, detail: 'Capacity: 4,800 lbs | Fasteners: 4x 1/2" Bolts | Bearing: 3.5" Solid Ledge' });
        connPoints.push({ x: m.b.x, y: m.b.y, tag: m.tag, type: 'Girder Seat', title: `GIRDER TRUSS BEARING SEAT (${m.tag})`, detail: 'Capacity: 4,800 lbs | Fasteners: 4x 1/2" Bolts | Bearing: 3.5" Solid Ledge' });
      } else {
        rect(endA.x - 4, endA.y - 4, 8, 8, '#dcfce7', '#16a34a', 1);
        label('HC', endA.x, endA.y + 2, 6, '#16a34a', 'center');
        rect(endB.x - 4, endB.y - 4, 8, 8, '#dcfce7', '#16a34a', 1);
        label('HC', endB.x, endB.y + 2, 6, '#16a34a', 'center');
        connPoints.push({ x: m.a.x, y: m.a.y, tag: m.tag, type: 'Hurricane Tie', title: `SIMPSON H2.5A HURRICANE TIE (${m.tag})`, detail: 'Uplift Capacity: 1,340 lbs | Fasteners: 8d x 1-1/2" Nailing | Wall Plate Attachment' });
        connPoints.push({ x: m.b.x, y: m.b.y, tag: m.tag, type: 'Hurricane Tie', title: `SIMPSON H2.5A HURRICANE TIE (${m.tag})`, detail: 'Uplift Capacity: 1,340 lbs | Fasteners: 8d x 1-1/2" Nailing | Wall Plate Attachment' });
      }
    }

    // Evaluate span warnings across timber members
    for(const m of layout.members){
      const w=checkMemberSpanWarning(m,loads,cfg);
      if(w.isWarning){
        totalWarnings++;
        line(p2(m.a),p2(m.b),'#dc2626',3.2,[4,2]);
      }
    }

    const xmin=Math.min(...ps.map(p=>p.x)),xmax=Math.max(...ps.map(p=>p.x)),ymin=Math.min(...ps.map(p=>p.y)),ymax=Math.max(...ps.map(p=>p.y)),bounds=roofBoundary(e),span=Math.max(...bounds.map(p=>p.x))-Math.min(...bounds.map(p=>p.x)),wide=Math.max(...bounds.map(p=>p.y))-Math.min(...bounds.map(p=>p.y));

    // Span & Spacing direction arrows in mm
    const spacingMm = Math.round(cfg.spacing || 600);
    const midX = (xmin + xmax) / 2;
    const midY = (ymin + ymax) / 2;

    spanArrowFn(
      p2({ x: midX, y: ymin + 600 }),
      p2({ x: midX, y: ymax - 600 }),
      `COMMON TRUSS / RAFTER @ ${spacingMm} mm O.C.`,
      `CLEAR SPAN: ${Math.round(span)} mm`,
      '#0284c7'
    );

    roofPlanDimension({x:xmin,y:ymin-28},{x:xmax,y:ymin-28},'ROOF SPAN '+Math.round(span)+' mm');
    roofPlanDimension({x:xmin-28,y:ymin},{x:xmin-28,y:ymax},'ROOF WIDTH '+Math.round(wide)+' mm');

    if(bounds.length===4){
      for(let i=0;i<6;i++){
        const x=xmin+(xmax-xmin)*i/5;
        line({x,y:ymin-55},{x,y:ymax+10},'#cbd5e1',.6,[3,5]);
        ctx.beginPath();ctx.arc(x,ymin-62,12,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#64748b';ctx.lineWidth=1.4;ctx.stroke();label(String(i+1),x,ymin-62,10,'#334155');
      }
      for(let i=0;i<3;i++){
        const y=ymin+(ymax-ymin)*i/2;
        ctx.beginPath();ctx.arc(xmin-62,y,12,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#64748b';ctx.stroke();label(String.fromCharCode(65+i),xmin-62,y,10,'#334155');
      }
    }

    for(const m of groups.sort((a,b)=>(a.code==='HG'||a.code==='JG'?-1:0)-(b.code==='HG'||b.code==='JG'?-1:0))){
      const a=p2(m.a),b=p2(m.b),w=m.tag.length*6+12,h=18;
      let box;
      for(const t of [.5,.25,.75,.1,.9]){
        const p=lerp(a,b,t);
        for(const offset of [0,-22,22]){
          const candidate={x:p.x-w/2,y:p.y-h/2+offset,w,h};
          if(candidate.x<5||candidate.y<5||candidate.x+w>width-5||candidate.y+h>height-65||occupied.some(r=>candidate.x<r.x+r.w+3&&candidate.x+w+3>r.x&&candidate.y<r.y+r.h+3&&candidate.y+h+3>r.y))continue;
          box=candidate;break;
        }
        if(box)break;
      }
      if(!box)continue;
      occupied.push(box);
      const trussStore = (typeof window !== 'undefined' && window.cadtechProjectTrussStore) || {};
      const tagKey = m.tag;
      const cachedTruss = trussStore[tagKey];
      const isPass = cachedTruss ? cachedTruss.integrityStatus === 'PASS' : false;
      const isSelected = (typeof window !== 'undefined') && (window.activeTrussTag === tagKey || window.activeTrussTag === m.tag);

      const labelText = isPass ? `${m.tag} ✔` : isSelected ? `${m.tag} ★` : m.tag;
      const boxW = isPass ? box.w + 18 : isSelected ? box.w + 12 : box.w;
      rect(box.x, box.y, boxW, box.h, isSelected ? '#0284c7' : isPass ? '#f0fdf4' : '#ffffff', isSelected ? '#0369a1' : isPass ? '#22c55e' : '#cbd5e1', isSelected ? 1.5 : 1);
      label(labelText, box.x + boxW / 2, box.y + box.h / 2, 8.5, isSelected ? '#ffffff' : isPass ? '#15803d' : '#334155');
    }
    label(e.id+' · ROOF FRAMING PLAN',xmin,ymin-88,11,'#334155','left');
  }

  // ROOF FRAMING SPECIFICATIONS Box (Bottom-Left)
  const legX = 20, legY = height - 135;
  rect(legX, legY, 300, 120, '#ffffffeb', '#cbd5e1', 1);
  label('ROOF FRAMING SPECIFICATIONS', legX + 12, legY + 16, 9.5, '#0f172a', 'left');
  label('• Trusses / Rafters: 38x89 mm C16 @ 600 mm O.C.', legX + 12, legY + 32, 8.5, '#0284c7', 'left');
  label('• Girder Trusses: 2-Ply LVL / Heavy Duty Junction', legX + 12, legY + 48, 8.5, '#c2410c', 'left');
  label('• Hip / Ridge: 38x140 mm / LVL Ridge & Hip Assemblies', legX + 12, legY + 64, 8.5, '#d97706', 'left');
  label('• Eave Overhang: 600 mm Overhang w/ Fascia', legX + 12, legY + 80, 8.5, '#16a34a', 'left');
  label('• Connectors: Simpson H2.5A Hurricane Ties @ Plates', legX + 12, legY + 96, 8.5, '#475569', 'left');
  label('• Design Code: Eurocode 5 / ANSI/TPI 1-2018 / IBC', legX + 12, legY + 110, 8, '#64748b', 'left');

  // TRUSS MARK & HARDWARE LEGEND Box (Bottom-Center)
  const leg2X = 330, leg2Y = height - 135;
  rect(leg2X, leg2Y, 320, 120, '#ffffffeb', '#cbd5e1', 1);
  label('TRUSS MARKS & HARDWARE LEGEND', leg2X + 12, leg2Y + 16, 9.5, '#0f172a', 'left');

  rect(leg2X + 12, leg2Y + 28, 12, 12, '#fee2e2', '#dc2626', 1.2);
  label('• [HG] Girder / Junction Truss (2-Ply Heavy Duty)', leg2X + 30, leg2Y + 36, 8.5, '#dc2626', 'left');

  rect(leg2X + 12, leg2Y + 48, 12, 12, '#e0f2fe', '#0284c7', 1.2);
  label('• [TR] Common Truss / Rafter @ 600 mm O.C.', leg2X + 30, leg2Y + 56, 8.5, '#0284c7', 'left');

  rect(leg2X + 12, leg2Y + 68, 12, 12, '#fef3c7', '#d97706', 1.2);
  label('• [HT] Hip Truss / Ridge Beam Assembly', leg2X + 30, leg2Y + 76, 8.5, '#d97706', 'left');

  rect(leg2X + 12, leg2Y + 88, 12, 12, '#dcfce7', '#16a34a', 1.2);
  label('HC', leg2X + 18, leg2Y + 97, 7, '#16a34a', 'center');
  label('• [HC] Simpson H2.5A Hurricane Uplift Tie', leg2X + 30, leg2Y + 96, 8.5, '#16a34a', 'left');

  label('Hover over any roof truss or rafter on plan to view details', leg2X + 12, leg2Y + 110, 8, '#64748b', 'left');

  // Interactive Hover Tooltips on Roof Plan
  if (typeof hover !== 'undefined' && hover) {
    const nearConn = connPoints.find(cp => Math.hypot(cp.x - hover.x, cp.y - hover.y) < 400);
    if (nearConn) {
      const scrP = p2({ x: nearConn.x, y: nearConn.y });
      const ttW = Math.max(nearConn.title.length * 6.5, nearConn.detail.length * 5.2) + 24;
      const ttH = 38;
      const ttX = Math.min(width - ttW - 20, Math.max(20, scrP.x - ttW / 2));
      const ttY = scrP.y - 48 > 40 ? scrP.y - 48 : scrP.y + 18;

      rect(ttX, ttY, ttW, ttH, '#0f172a', '#0284c7', 1.5);
      label(nearConn.title, ttX + 12, ttY + 15, 9, '#f8fafc', 'left');
      label(nearConn.detail, ttX + 12, ttY + 28, 8, '#94a3b8', 'left');

      ctx.save();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(scrP.x, scrP.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  if(totalWarnings>0){
    ctx.save();
    ctx.fillStyle='rgba(220, 38, 38, 0.12)';
    ctx.strokeStyle='#dc2626';
    ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.roundRect(width/2 - 240, 16, 480, 32, 6);
    ctx.fill();
    ctx.stroke();
    label('⚠ SPAN WARNING OVERLAY: ' + totalWarnings + ' members exceed safe load limits (Highlighted in Red)', width/2, 32, 11, '#dc2626');
    ctx.restore();
  }

  label(count+' MEMBERS · HG girder · HT hip truss · TR common · JK front jack · SJ side jack · HC hip carrier' + (totalWarnings>0?` · ⚠ ${totalWarnings} span warnings`:''),width/2,height-28,9,totalWarnings>0?'#dc2626':'#64748b');}
function roofFramingRows(){const rows=new Map(),roofs=model.elements.filter(e=>e.type==='roof'),members=projectRoofFraming(roofs,false).members;for(const m of members){const e=model.elements.find(q=>q.id===(m.roofId||'')),length=Math.round(m.cutLength??m.length),key=[m.roofId||e?.id,m.type,m.section,length].join('|'),row=rows.get(key)||{wallId:m.roofId||e?.id,type:m.type,section:m.section,length,quantity:0};row.quantity++;rows.set(key,row)}return [...rows.values()]}
function allFramingRows(){return [...framingCutRows(),...roofFramingRows()]}
function roofLoadsProperties(e){
  const loads=roofLoadsSettings(e);
  const cfg=roofFramingSettings(e);
  const g=roofGeometry(e);
  const bounds=g.boundary||[];
  let spanM=6.0;
  if(bounds.length>=2){
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    for(const p of bounds){minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);}
    spanM=Math.max(maxX-minX,maxY-minY)/1000;
  }
  const pitchDeg=e.pitch??25;
  const spacingMm=cfg.spacing;
  const tribM=spacingMm/1000;
  const D_kpa=loads.deadLoad*0.04788;
  const S_kpa=loads.snowLoad*0.04788;
  const L_kpa=loads.liveLoad*0.04788;
  const W_mph=loads.windSpeed;
  const q_design=1.2*D_kpa + 1.6*S_kpa + 0.5*L_kpa;
  const linLoad_kNm=q_design*tribM;
  const maxReaction_kN=(linLoad_kNm*spanM)/2;
  const maxReaction_lbs=maxReaction_kN*224.8;
  const uplift_kpa=0.0006 * (W_mph*W_mph) * 0.04788;
  const maxUplift_kN=uplift_kpa * spanM * tribM * 0.5;
  const maxUplift_lbs=maxUplift_kN*224.8;
  const riseM=spanM*0.5*Math.tan(pitchDeg*Math.PI/180);
  const axial_kN=(linLoad_kNm*spanM*spanM)/(8*Math.max(0.3,riseM));
  const capacity_kN=cfg.depth>140?28.5:18.2;
  const dcRatio=axial_kN/capacity_kN;
  const recommendedPly=dcRatio>1.5?3:dcRatio>0.9?2:1;

  let totalLengthM=0, totalVolumeM3=0;
  try{
    const framing=generateRoofFraming(e);
    for(const m of (framing.members||[])){
      const len=m.length||Math.hypot(m.b.x-m.a.x,m.b.y-m.a.y,m.b.z-m.a.z);
      totalLengthM+=len/1000;
      const wM=(m.width||cfg.width)/1000, dM=(m.depth||cfg.depth)/1000;
      totalVolumeM3+=wM*dM*(len/1000);
    }
  }catch(err){
    totalLengthM=spanM*15;
    totalVolumeM3=totalLengthM*(cfg.width/1000)*(cfg.depth/1000);
  }

  const speciesKey=loads.timberSpecies||'DF-L';
  const species=TIMBER_SPECIES[speciesKey]||TIMBER_SPECIES['DF-L'];
  const weightKg=totalVolumeM3*species.densityKgM3;
  const weightLbs=weightKg*2.20462;
  const boardFeet=totalVolumeM3*423.776;

  return '<div class="section-header">ROOF LOAD VARIABLES & MATERIAL ESTIMATE</div>'+
    field('Snow load','roofLoads.snowLoad',loads.snowLoad,'psf')+
    field('Wind speed','roofLoads.windSpeed',loads.windSpeed,'mph')+
    field('Dead load','roofLoads.deadLoad',loads.deadLoad,'psf')+
    field('Live load','roofLoads.liveLoad',loads.liveLoad,'psf')+
    choice('Timber species','roofLoads.timberSpecies',speciesKey,Object.entries(TIMBER_SPECIES).map(([k,s])=>[k,s.name]))+
    `<div class="prop-calc-box" style="margin-top:10px;padding:10px;background:#f1f5f9;border-radius:6px;font-size:11px;color:#334155;line-height:1.6;">
       <strong>Structural Requirements (Geometry-Based):</strong><br>
       · Estimated Span: <strong>${spanM.toFixed(2)} m</strong> (${(spanM*3.28084).toFixed(1)} ft)<br>
       · Tributary Width: <strong>${tribM.toFixed(3)} m</strong> (${spacingMm} mm O.C.)<br>
       · Design Load (1.2D+1.6S+0.5L): <strong>${q_design.toFixed(2)} kPa</strong> (${(q_design*20.885).toFixed(1)} psf)<br>
       · Max Support Reaction: <strong>${maxReaction_kN.toFixed(1)} kN</strong> (${Math.round(maxReaction_lbs)} lbs)<br>
       · Wind Uplift Demand: <strong>${maxUplift_kN.toFixed(1)} kN</strong> (${Math.round(maxUplift_lbs)} lbs)<br>
       · Max Chord Axial Force: <strong>${axial_kN.toFixed(1)} kN</strong><br>
       · D/C Utilization Ratio: <strong style="color:${dcRatio>1?'#dc2626':'#16a34a'}">${dcRatio.toFixed(2)} (${dcRatio>1?'OVERSTRESSED':'PASS'})</strong><br>
       · Recommended Member Sizing: <strong>${recommendedPly}-ply ${cfg.width}×${cfg.depth} mm</strong><br>
       <hr style="border:0;border-top:1px solid #cbd5e1;margin:6px 0;">
       <strong>Material Weight Estimate (${species.name}):</strong><br>
       · Total Lineal Length: <strong>${totalLengthM.toFixed(1)} m</strong> (${(totalLengthM*3.28084).toFixed(1)} ft)<br>
       · Nominal Volume: <strong>${boardFeet.toFixed(1)} BF</strong> (${totalVolumeM3.toFixed(2)} m³)<br>
       · Estimated Dry Weight: <strong>${Math.round(weightLbs)} lbs</strong> (${Math.round(weightKg)} kg)
     </div>`;
}

function roofFramingProperties(e){const c=roofFramingSettings(e);return '<div class="section-header">ROOF FRAMING</div>'+choice('Framing system','roofFraming.system',c.system,[['off','Off'],['rafters','Rafters'],['trusses','Advanced truss geometry · design-assist']])+field('Spacing O.C.','roofFraming.spacing',c.spacing,'mm')+field('Member width','roofFraming.width',c.width,'mm')+field('Rafter / chord depth','roofFraming.depth',c.depth,'mm')+(c.system==='trusses'?choice('Web pattern (Auto sizes from span & load)','roofFraming.webPattern',c.webPattern,[['Auto','Auto · span & load'],['Fink','Fink / W'],['Howe','Howe'],['Pratt','Pratt'],['Warren','Warren'],['Queen post','Queen post'],['King post','King post']])+field('Panel count (0 = Auto)','roofFraming.panelCount',c.panelCount,'panels')+field('Web depth','roofFraming.webDepth',c.webDepth,'mm')+field('Heel height','roofFraming.heel',c.heel,'mm')+field('Truss run angle','roofFraming.angle',c.angle,'°')+(e.roofType==='hip'?field('Girder plies','roofFraming.girderPlies',c.girderPlies,'')+field('Hip girder setback','roofFraming.hipSetback',c.hipSetback,'mm')+choice('Wing truss direction','roofFraming.wingDirection',c.wingDirection,[['branch','Arms hip at the free end (jacks on far side)'],['aligned','All wings parallel to the main wing']]):'' ):'')+(c.system==='trusses'&&roofSettings(e).roofType==='hip'?'<div class="empty-prop">Orthogonal wings: arms off the main wing run their ridge away from it (front jacks at the free end), with junction girders and hip end sets. Hip girder setback controls the small end zone. Girder plies are preliminary.</div>':'')+roofLoadsProperties(e)+'<div class="wall-property-actions"><button class="subtle" data-roof-align>Align above wall plates</button><button class="subtle" data-roof-view="roofframingplan">Roof framing plan</button><button class="subtle" data-roof-view="framing3d">3D framing</button><button class="subtle" data-roof-view="cutlist">Cut list</button></div>'+(c.system==='trusses'?trussOptimizerProperties():'')+'<div class="empty-prop">Layouts regenerate with roof edits. Sizes and cutting lengths are preliminary; loads, bearings, fabrication allowances, connectors and truss engineering require design.</div>'}

function roofMemberColor(m){return '#c2a482'}
