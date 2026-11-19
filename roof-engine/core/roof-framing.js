const ROOF_FRAMING_DEFAULTS={system:'rafters',spacing:600,width:45,depth:190,webDepth:90,heel:300,angle:0,girderPlies:2,hipSetback:1828.8,webPattern:'Fink',panelCount:0,wingDirection:'branch'};
function roofFramingSettings(e){
  const saved=e.roofFraming||{},settings={...ROOF_FRAMING_DEFAULTS,...saved};
  // Keep the displayed/effective truss spacing consistent with the hard 12 in minimum.
  if(settings.system==='trusses'&&Number.isFinite(settings.spacing))settings.spacing=Math.max(settings.spacing,304.8);
  return settings;
}
function validateRoofFraming(e){const c=roofFramingSettings(e);if(!['off','rafters','trusses'].includes(c.system)||!['spacing','width','depth','webDepth','heel','angle','panelCount'].every(k=>Number.isFinite(c[k]))||!['Fink','Howe','Pratt','Warren','Queen post','King post'].includes(c.webPattern)||!Number.isInteger(c.panelCount)||c.panelCount<0||c.panelCount>24||(c.panelCount>0&&c.panelCount<4)||c.spacing<100||c.spacing>3000||c.width<20||c.width>300||c.depth<40||c.depth>1000||c.webDepth<40||c.webDepth>600||c.heel<0||c.heel>2000||!Number.isInteger(c.girderPlies)||c.girderPlies<1||c.girderPlies>4||!Number.isFinite(c.hipSetback)||c.hipSetback<400||c.hipSetback>10000||!['branch','aligned'].includes(c.wingDirection))throw Error('Enter valid framing values. Panel count must be Auto (0) or 4–24; choose a supported web pattern.')}
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
      const atBottom=heelAt,atTop=t=>segments.find(s=>t>=s.start-.01&&t<=s.end+.01)?.at(t),count=c.panelCount||Math.max(4,Math.ceil((right-left)/2400));add('Truss bottom chord',atBottom(left),atBottom(right),c.depth,assembly);const topNodes=[],bottomNodes=[];for(let i=0;i<=count;i++){const t=left+(right-left)*i/count,top=atTop(t);if(top&&top.z>bottomZ+c.webDepth){topNodes.push({t,p:top});bottomNodes.push({t,p:atBottom(t)})}}if(topNodes.length>=2)addAdvancedTrussWebPattern(topNodes,bottomNodes,c.webPattern,c.webDepth,assembly,add,'Truss web');
    }}issues.push('Truss layout is preliminary: bearings, girder trusses, bracing, plates and load design are not verified.');
  }const extended=extendTrussTopChordOverhangs(members,e,g,c);const joined=dropOrphanTrussWebs(finishRoofConnections(joinTrussMembers(mergeRoofMembers(extended))));const merged=removeDuplicateBottomChords(removeDuplicateTopChords(joined));return {members:merged,issues:[...new Set(issues)]};
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
  const layouts=roofElements.map(e=>({e,layout:useCache?generateRoofFramingCached(e):generateRoofFraming(e)}));
  const cleaned=removeDuplicateTopChords(layouts.flatMap(x=>x.layout.members));
  const byRoof=new Map();
  for(const {e,layout} of layouts)byRoof.set(e.id,{...layout,members:cleaned.filter(m=>m.roofId===e.id)});
  return {members:cleaned,byRoof};
}

// Keep the underside of each truss bottom chord seated on the top face of the wall top plates.
// This is a roof-level adjustment; it deliberately does not change wall height or story geometry.
function alignTrussRoofToWallPlates(e){
  if(!e||e.type!=='roof'||roofFramingSettings(e).system!=='trusses')return false;
  const walls=model.elements.filter(w=>w.type==='wall'&&w.story===e.story);
  if(!walls.length)return false;
  const c=roofFramingSettings(e),g=roofGeometry(e),plate=Math.max(...walls.map(w=>wallBase(w)+heightOf(w)));
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
  const seen=new Set(),girders=[],counts={};return [...groups.values()].sort((a,b)=>a.id.localeCompare(b.id)).flatMap(g=>{let a=g.points[0],b=a;for(const p of g.points)for(const q of g.points)if(distance(p,q)>distance(a,b)){a=p;b=q}if(distance(a,b)<1)return [];const code=g.type.startsWith('Junction')?'JG':g.type.startsWith('Girder')?'HG':g.type.startsWith('Front jack')?'JK':g.type.startsWith('Side jack')?'SJ':g.type.startsWith('Hip carrier')?'HC':g.type.startsWith('Hip truss')?'HT':g.type.includes('truss')||g.type.includes('Truss')?'TR':'RF',mid=lerp(a,b,.5),key=code+':'+Math.round(mid.x/100)+':'+Math.round(mid.y/100);if(seen.has(key))return [];if(code==='HG'||code==='JG'){if(girders.some(q=>q.code===code&&distance(q.mid,mid)<200))return [];girders.push({code,mid})}seen.add(key);counts[code]=(counts[code]||0)+1;return [{...g,a,b,code,tag:code+'-'+String(counts[code]).padStart(2,'0')}];});
}
function roofPlanColor(code){return {HG:'#dc2626',JG:'#dc2626',JK:'#16a34a',SJ:'#9333ea',HC:'#d946ef',HT:'#d97706',TR:'#d97706',RF:'#0891b2'}[code]||'#64748b'}
function roofPlanDimension(a,b,text){const color='#64748b';line(a,b,color,1.2);const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;for(const [p,sign] of [[a,1],[b,-1]])poly([p,{x:p.x+sign*ux*8-uy*4,y:p.y+sign*uy*8+ux*4},{x:p.x+sign*ux*8+uy*4,y:p.y+sign*uy*8-ux*4}],color);if(Math.abs(dy)>Math.abs(dx)){ctx.save();ctx.translate((a.x+b.x)/2-12,(a.y+b.y)/2);ctx.rotate(-Math.PI/2);label(text,0,0,11,'#334155');ctx.restore()}else label(text,(a.x+b.x)/2,(a.y+b.y)/2-12,11,'#334155')}
function drawRoofFramingPlan(){let count=0;const occupied=[],roofs=model.elements.filter(e=>e.type==='roof'&&shown(e)),projectLayout=projectRoofFraming(roofs,false);for(const e of roofs){const g=roofGeometry(e),layout=projectLayout.byRoof.get(e.id)||generateRoofFraming(e),ps=g.boundary.map(p2),pivot=roofBoundary(e).map(p2);count+=layout.members.length;poly(ps,'rgba(241,245,249,.65)',null);for(let i=0;i<ps.length;i++)line(ps[i],ps[(i+1)%ps.length],'#0284c7',1.8,[7,5]);for(let i=0;i<pivot.length;i++)line(pivot[i],pivot[(i+1)%pivot.length],'#64748b',2);
    // Roof fold lines remain distinct from the timber assembly centrelines.
    for(const edge of roofPlanEdges(g)){const mid=lerp(edge.a,edge.b,.5);if(g.boundary.some((p,i)=>segmentDistance(mid,p,g.boundary[(i+1)%g.boundary.length]).distance<.1))continue;const diagonal=Math.abs(edge.a.z-edge.b.z)>.1;line(p2(edge.a),p2(edge.b),diagonal?'#d946ef':'#eab308',diagonal?1.6:1,diagonal?[]:[5,5])}
    const groups=roofPlanAssemblies(layout.members);for(const m of groups)line(p2(m.a),p2(m.b),roofPlanColor(m.code),m.code==='HG'||m.code==='JG'?4:m.code==='HC'?2.4:2);
    const xmin=Math.min(...ps.map(p=>p.x)),xmax=Math.max(...ps.map(p=>p.x)),ymin=Math.min(...ps.map(p=>p.y)),ymax=Math.max(...ps.map(p=>p.y)),bounds=roofBoundary(e),span=Math.max(...bounds.map(p=>p.x))-Math.min(...bounds.map(p=>p.x)),wide=Math.max(...bounds.map(p=>p.y))-Math.min(...bounds.map(p=>p.y));
    roofPlanDimension({x:xmin,y:ymin-28},{x:xmax,y:ymin-28},'SPAN '+(span/1000).toFixed(2)+' m');roofPlanDimension({x:xmin-28,y:ymin},{x:xmin-28,y:ymax},'WIDTH '+(wide/1000).toFixed(2)+' m');
    if(bounds.length===4){for(let i=0;i<6;i++){const x=xmin+(xmax-xmin)*i/5;line({x,y:ymin-55},{x,y:ymax+10},'#cbd5e1',.6,[3,5]);ctx.beginPath();ctx.arc(x,ymin-62,12,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#64748b';ctx.lineWidth=1.4;ctx.stroke();label(String(i+1),x,ymin-62,10,'#334155')}for(let i=0;i<3;i++){const y=ymin+(ymax-ymin)*i/2;ctx.beginPath();ctx.arc(xmin-62,y,12,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#64748b';ctx.stroke();label(String.fromCharCode(65+i),xmin-62,y,10,'#334155')}}
    for(const m of groups.sort((a,b)=>(a.code==='HG'||a.code==='JG'?-1:0)-(b.code==='HG'||b.code==='JG'?-1:0))){const a=p2(m.a),b=p2(m.b),w=m.tag.length*6+12,h=18;let box;for(const t of [.5,.25,.75,.1,.9]){const p=lerp(a,b,t);for(const offset of [0,-22,22]){const candidate={x:p.x-w/2,y:p.y-h/2+offset,w,h};if(candidate.x<5||candidate.y<5||candidate.x+w>width-5||candidate.y+h>height-65||occupied.some(r=>candidate.x<r.x+r.w+3&&candidate.x+w+3>r.x&&candidate.y<r.y+r.h+3&&candidate.y+h+3>r.y))continue;box=candidate;break}if(box)break}if(!box)continue;occupied.push(box);rect(box.x,box.y,box.w,box.h,'#ffffff','#cbd5e1');label(m.tag,box.x+box.w/2,box.y+box.h/2,9,'#334155')}
    label(e.id+' · ROOF FRAMING PLAN',xmin,ymin-88,11,'#334155','left');
  }label(count+' MEMBERS · HG girder · HT hip truss · TR common · JK front jack · SJ side jack · HC hip carrier',width/2,height-28,9,'#64748b')}
function roofFramingRows(){const rows=new Map(),roofs=model.elements.filter(e=>e.type==='roof'),members=projectRoofFraming(roofs,false).members;for(const m of members){const e=model.elements.find(q=>q.id===(m.roofId||'')),length=Math.round(m.cutLength??m.length),key=[m.roofId||e?.id,m.type,m.section,length].join('|'),row=rows.get(key)||{wallId:m.roofId||e?.id,type:m.type,section:m.section,length,quantity:0};row.quantity++;rows.set(key,row)}return [...rows.values()]}
function allFramingRows(){return [...framingCutRows(),...roofFramingRows()]}
function roofFramingProperties(e){const c=roofFramingSettings(e);return '<div class="section-header">ROOF FRAMING</div>'+choice('Framing system','roofFraming.system',c.system,[['off','Off'],['rafters','Rafters'],['trusses','Advanced truss geometry · design-assist']])+field('Spacing O.C.','roofFraming.spacing',c.spacing,'mm')+field('Member width','roofFraming.width',c.width,'mm')+field('Rafter / chord depth','roofFraming.depth',c.depth,'mm')+(c.system==='trusses'?choice('Web pattern','roofFraming.webPattern',c.webPattern,[['Fink','Fink / W'],['Howe','Howe'],['Pratt','Pratt'],['Warren','Warren'],['Queen post','Queen post'],['King post','King post']])+field('Panel count (0 = Auto)','roofFraming.panelCount',c.panelCount,'panels')+field('Web depth','roofFraming.webDepth',c.webDepth,'mm')+field('Heel height','roofFraming.heel',c.heel,'mm')+field('Truss run angle','roofFraming.angle',c.angle,'°')+(e.roofType==='hip'?field('Girder plies','roofFraming.girderPlies',c.girderPlies,'')+field('Hip girder setback','roofFraming.hipSetback',c.hipSetback,'mm')+choice('Wing truss direction','roofFraming.wingDirection',c.wingDirection,[['branch','Arms hip at the free end (jacks on far side)'],['aligned','All wings parallel to the main wing']]):'' ):'')+(c.system==='trusses'&&roofSettings(e).roofType==='hip'?'<div class="empty-prop">Orthogonal wings: arms off the main wing run their ridge away from it (front jacks at the free end), with junction girders and hip end sets. Hip girder setback controls the small end zone. Girder plies are preliminary.</div>':'')+'<div class="wall-property-actions"><button class="subtle" data-roof-align>Align above wall plates</button><button class="subtle" data-roof-view="roofframingplan">Roof framing plan</button><button class="subtle" data-roof-view="framing3d">3D framing</button><button class="subtle" data-roof-view="cutlist">Cut list</button></div>'+(c.system==='trusses'?trussOptimizerProperties():'')+'<div class="empty-prop">Layouts regenerate with roof edits. Sizes and cutting lengths are preliminary; loads, bearings, fabrication allowances, connectors and truss engineering require design.</div>'}

function roofMemberColor(m){return '#c2a482'}
