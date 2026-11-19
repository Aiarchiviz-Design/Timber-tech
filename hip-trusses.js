// addAdvancedTrussWebPattern lives here, in the file that calls it, so a stale cached roof-framing.js can never leave it undefined.
// Geometry-only truss web topology generator. This controls member arrangement only;
// it is not a load/capacity design and must not be treated as an engineered truss.
function addAdvancedTrussWebPattern(topNodes,bottomNodes,pattern,depth,assembly,add,type='Truss web'){
  if(!Array.isArray(topNodes)||!Array.isArray(bottomNodes)||topNodes.length!==bottomNodes.length||topNodes.length<2)return 0;
  const n=topNodes.length-1,edges=new Set();let made=0;
  const key=(a,b)=>{const pt=p=>[p.x,p.y,p.z].map(v=>Math.round(v*10)).join(',');return [pt(a),pt(b)].sort().join('|')};
  const edge=(a,b)=>{if(!a||!b)return;const L=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);if(L<Math.max(10,depth*.5))return;const k=key(a,b);if(edges.has(k))return;edges.add(k);add(type,a,b,depth,assembly);made++};
  const post=i=>edge(bottomNodes[i].p,topNodes[i].p);
  const diag=(a,b)=>edge(a,b);

  const p1 = topNodes[0].p, p2 = topNodes[topNodes.length - 1].p;
  const rawSpan = Math.hypot(p2.x - p1.x, (p2.y || 0) - (p1.y || 0), (p2.z || 0) - (p1.z || 0));
  const spanM = rawSpan > 50 ? rawSpan / 1000 : rawSpan;
  const nodeH = i => Math.hypot(
    (topNodes[i].p.x || 0) - (bottomNodes[i].p.x || 0),
    (topNodes[i].p.y || 0) - (bottomNodes[i].p.y || 0),
    (topNodes[i].p.z || 0) - (bottomNodes[i].p.z || 0)
  );
  const heights = topNodes.map((_, i) => nodeH(i));
  const h0 = heights[0], hN = heights[n], maxH = Math.max(...heights, 0);
  const minEndH = Math.min(h0, hN), maxEndH = Math.max(h0, hN);
  const isMono = maxH > 1e-4 && Math.abs(hN - h0) > 0.35 * maxH && minEndH < 0.35 * maxH && maxEndH >= 0.85 * maxH;
  const pat = String(pattern || '').toLowerCase().replace(/[\s\-_]/g, '');

  if (isMono) {
    const low = hN >= h0 ? 0 : n;
    const step = hN >= h0 ? 1 : -1;
    const idx = k => low + k * step;
    const raisedLow = heights[low] > Math.max(50, depth * 0.6);

    // Always close the high wall bearing end with a full-height vertical end post
    post(idx(n));

    if (n <= 1 || spanM < 1.2) {
      if (n >= 2) {
        const m1 = Math.max(1, Math.floor(n / 2));
        post(idx(m1));
        diag(bottomNodes[idx(m1)].p, topNodes[idx(n)].p);
      }
      return made;
    }

    if (spanM < 2.2 || n === 2) {
      post(idx(1));
      if (raisedLow) diag(bottomNodes[idx(0)].p, topNodes[idx(1)].p);
      diag(bottomNodes[idx(1)].p, topNodes[idx(n)].p);
      return made;
    }

    if (pat.includes('howe')) {
      for (let k = 1; k < n; k++) post(idx(k));
      if (raisedLow) diag(bottomNodes[idx(0)].p, topNodes[idx(1)].p);
      for (let k = 1; k < n; k++) diag(bottomNodes[idx(k)].p, topNodes[idx(k + 1)].p);
    } else if (pat.includes('pratt')) {
      for (let k = 1; k < n; k++) post(idx(k));
      if (raisedLow) diag(topNodes[idx(0)].p, bottomNodes[idx(1)].p);
      for (let k = 1; k < n; k++) diag(topNodes[idx(k)].p, bottomNodes[idx(k + 1)].p);
    } else if (pat.includes('warren')) {
      if (raisedLow) diag(bottomNodes[idx(0)].p, topNodes[idx(1)].p);
      else post(idx(1));
      for (let k = 1; k < n; k++) {
        if (k % 2 === 1) diag(bottomNodes[idx(k)].p, topNodes[idx(k + 1)].p);
        else diag(topNodes[idx(k)].p, bottomNodes[idx(k + 1)].p);
      }
      if (n % 2 === 1) post(idx(n - 1));
    } else if (pat.includes('king') || pat.includes('queen')) {
      const m = Math.max(1, Math.min(n - 1, Math.round(n / 2)));
      post(idx(m));
      if (raisedLow) diag(bottomNodes[idx(0)].p, topNodes[idx(m)].p);
      diag(bottomNodes[idx(m)].p, topNodes[idx(n)].p);
      if (m > 1) {
        const q = Math.max(1, Math.floor(m / 2));
        post(idx(q));
        diag(bottomNodes[idx(q)].p, topNodes[idx(m)].p);
      }
    } else {
      // Mono Fink / Default: cleanly triangulated compression verticals + alternating W-diagonals
      post(idx(1));
      if (raisedLow) diag(bottomNodes[idx(0)].p, topNodes[idx(1)].p);
      for (let k = 1; k < n; k++) {
        if (k % 2 === 1) {
          diag(bottomNodes[idx(k)].p, topNodes[idx(k + 1)].p);
          if (k + 1 < n) post(idx(k + 1));
        } else {
          diag(topNodes[idx(k)].p, bottomNodes[idx(k + 1)].p);
          if (k + 1 < n) post(idx(k + 1));
        }
      }
    }
    return made;
  }

  if (spanM < 1.2) {
    // Spans < 4 ft (1.2m): No internal diagonal webs needed; simple kingpost or unwebbed mono
    if (topNodes.length > 2) {
      const midIdx = Math.floor(topNodes.length / 2);
      post(midIdx);
    }
    return made;
  } else if (spanM < 2.2) {
    // Spans between 4 ft and 7 ft (1.2m to 2.2m): Maximum 2 panels (single V or inverted V)
    const midIdx = Math.floor(n / 2);
    post(midIdx);
    diag(bottomNodes[0].p, topNodes[midIdx].p);
    diag(bottomNodes[n].p, topNodes[midIdx].p);
    return made;
  }

  const mid=Math.round(n/2);
  const q1=Math.max(1,Math.min(n-1,Math.round(n/3)));
  const q2=Math.max(q1+1,Math.min(n-1,Math.round(2*n/3)));

  if(pat.includes('howe')){
    for(let i=1;i<n;i++)post(i);
    for(let i=0;i<n;i++){
      if(i<mid)diag(bottomNodes[i].p,topNodes[i+1].p);
      else diag(bottomNodes[i+1].p,topNodes[i].p);
    }
  }else if(pat.includes('pratt')){
    for(let i=1;i<n;i++)post(i);
    for(let i=0;i<n;i++){
      if(i<mid)diag(topNodes[i].p,bottomNodes[i+1].p);
      else diag(topNodes[i+1].p,bottomNodes[i].p);
    }
  }else if(pat.includes('warren')){
    for(let i=0;i<n;i++){
      if(i%2===0)diag(bottomNodes[i].p,topNodes[i+1].p);
      else diag(topNodes[i].p,bottomNodes[i+1].p);
    }
    if(n%2===1)post(mid);
  }else if(pat.includes('queen')){
    post(q1);post(q2);
    diag(topNodes[0].p,bottomNodes[q1].p);
    diag(bottomNodes[q1].p,topNodes[mid].p);
    diag(topNodes[mid].p,bottomNodes[q2].p);
    diag(bottomNodes[q2].p,topNodes[n].p);
    if(mid!==q1&&mid!==q2)post(mid);
  }else if(pat.includes('king')){
    post(mid);
    diag(topNodes[0].p,bottomNodes[mid].p);
    diag(bottomNodes[mid].p,topNodes[n].p);
    if(n>2){
      if(q1>0&&q1<mid)diag(topNodes[q1].p,bottomNodes[mid].p);
      if(q2>mid&&q2<n)diag(topNodes[q2].p,bottomNodes[mid].p);
    }
  }else if(pat.includes('attic')){
    post(q1);post(q2);
    for(let i=0;i<q1;i++)diag(bottomNodes[i].p,topNodes[i+1].p);
    for(let i=q2;i<n;i++)diag(topNodes[i].p,bottomNodes[i+1].p);
    edge(topNodes[q1].p,topNodes[q2].p);
  }else if(pat.includes('scissor')){
    for(let i=0;i<n;i++){
      if(i<mid)diag(bottomNodes[i].p,topNodes[i+1].p);
      else diag(topNodes[i].p,bottomNodes[i+1].p);
    }
    post(mid);
  }else{
    // Standard Structural Fink W-Truss (Default)
    if(n<=2){
      post(mid);
      diag(bottomNodes[0].p,topNodes[mid].p);
      diag(bottomNodes[n].p,topNodes[mid].p);
    }else if(n<=5){
      const p1=Math.max(1,Math.floor(n/4)||1);
      const p2=n-p1;
      diag(bottomNodes[0].p,topNodes[p1].p);
      diag(topNodes[p1].p,bottomNodes[mid].p);
      diag(bottomNodes[mid].p,topNodes[p2].p);
      diag(topNodes[p2].p,bottomNodes[n].p);
    }else{
      const f1=Math.max(1,Math.round(n/4));
      const f2=Math.min(n-1,n-f1);
      diag(bottomNodes[0].p,topNodes[f1].p);
      post(f1);
      diag(bottomNodes[f1].p,topNodes[mid].p);
      diag(topNodes[f1].p,bottomNodes[mid].p);

      diag(bottomNodes[mid].p,topNodes[f2].p);
      post(f2);
      diag(bottomNodes[mid].p,bottomNodes[f2].p);
      diag(topNodes[f2].p,bottomNodes[n].p);
    }
  }
  return made;
}

// Rectangular hip end sets. All coordinates come from the roof pivot and facets.
// Member sizes and assembly topology are preliminary, not structural design.
function generateHipTrussSet(e,g,c,add,issues,wing=null){
  // Enforce 12 in minimum O.C. spacing for every generated truss role (units are mm).
  const trussSpacing=Math.max(Number(c.spacing)||600,304.8);
  c={...c,spacing:trussSpacing};
  const p=wing?.points||roofBoundary(e);if(p.length!==4)return false;
  const edges=p.map((a,i)=>({x:p[(i+1)%4].x-a.x,y:p[(i+1)%4].y-a.y}));
  if(edges.some((a,i)=>Math.abs(a.x*edges[(i+1)%4].x+a.y*edges[(i+1)%4].y)>Math.hypot(a.x,a.y)*Math.hypot(edges[(i+1)%4].x,edges[(i+1)%4].y)*.00001))return false;
  // Multi-wing trusses must keep the same run direction as the dominant (largest)
  // roof wing. Choosing each rectangle's longest edge independently rotated the
  // trusses in narrow L-shaped wings, which caused the red-marked zone to frame
  // perpendicular to the main/green zone. For a wing, select the actual rectangle
  // edge most aligned with the shared reference axis; keep the old longest-edge
  // behavior for standalone rectangular roofs.
  const referenceAxis=wing?.directionAxis;
  const edge=referenceAxis
    ? edges.reduce((best,candidate)=>{
        const score=e=>Math.abs((e.x/Math.hypot(e.x,e.y))*referenceAxis.x+(e.y/Math.hypot(e.x,e.y))*referenceAxis.y);
        return score(candidate)>score(best)+1e-9?candidate:best;
      })
    : edges.reduce((a,b)=>Math.hypot(a.x,a.y)>=Math.hypot(b.x,b.y)?a:b);
  const len=Math.hypot(edge.x,edge.y),u={x:edge.x/len,y:edge.y/len},v={x:-u.y,y:u.x};
  const xs=p.map(q=>q.x*u.x+q.y*u.y),ys=p.map(q=>q.x*v.x+q.y*v.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),span=y1-y0,mid=(y0+y1)/2;
  const world=(x,y,z)=>({x:u.x*x+v.x*y,y:u.y*x+v.y*y,z});
  const exposed=[0,1].map(end=>{if(!wing)return true;const x=end?x1:x0;return [y0+(y1-y0)*.1,mid,y1-(y1-y0)*.1].every(y=>{const q=world(x,y,0);return roofBoundary(e).some((a,i)=>segmentDistance(q,a,roofBoundary(e)[(i+1)%roofBoundary(e).length]).distance<1);});});
  const exposedCount=exposed.filter(Boolean).length;
  const maxHipRun=exposedCount<=1?(x1-x0):(x1-x0)/2;
  const hipRun=Math.min(span/2,maxHipRun),baseSetback=Math.min(c.hipSetback||c.spacing*2,hipRun*.8);
  if(baseSetback<c.depth*2)return false;
  const cos=Math.cos((e.pitch??25)*Math.PI/180),bottom=g.base-g.drop-c.depth/(2*cos),topAt=(x,y)=>{
    // Evaluate only roof facets that actually cover this station. The previous
    // nearest-facet fallback could borrow a plane from another wing across a void,
    // producing kinked top chords, inconsistent pitch and disconnected joints.
    // At a shared facet/wing boundary use the upper roof envelope; all candidate
    // planes are evaluated at the same plan coordinate before selecting elevation.
    const q=world(x,y,0),candidates=[];
    for(const f of g.facets){
      const n=surfaceNormal(f);if(Math.abs(n.z)<.00001)continue;
      const isIn=inside(q,f);let edgeDistance=Infinity;
      for(let i=0;i<f.length;i++)edgeDistance=Math.min(edgeDistance,segmentDistance(q,f[i],f[(i+1)%f.length]).distance);
      const z=f[0].z-(n.x*(q.x-f[0].x)+n.y*(q.y-f[0].y))/n.z;
      if(Number.isFinite(z))candidates.push({z,isIn,edgeDistance});
    }
    const covered=candidates.filter(v=>v.isIn);
    // Polygon boundary points may fail the point-in-polygon test due to floating
    // point rounding; permit only a small boundary tolerance, never an arbitrary
    // nearest facet from a distant roof wing.
    const near=covered.length?covered:candidates.filter(v=>v.edgeDistance<=Math.max(25,c.depth*.25));
    if(!near.length)return null;
    const z=near.reduce((best,v)=>Math.max(best,v.z),-Infinity);
    return Number.isFinite(z)?z-g.drop-c.depth/(2*cos):null;
  };
  let serial=0;const assemblies=[],carrierTopLines=new Map(),carrierDirs=new Map();
  // Web layout per truss: 'Auto' sizes pattern, panel count and web depth from this truss' span and the roof load
  const webCfg=Lspan=>c.webPattern==='Auto'?{...c,webPattern:trussWebLayout(Lspan,roofLoadsSettings(e),c.spacing,e.pitch??25,c.width).pattern,webDepth:trussWebLayout(Lspan,roofLoadsSettings(e),c.spacing,e.pitch??25,c.width).webDepth}:c;
  function assembly(role,a,b,support='',ply=0,bottomB=b,receiverZ=null,girderRef=null){
    const cw=webCfg(Math.hypot(b.x-a.x,b.y-a.y));
    const id=e.id+(wing?'-W'+wing.index:'')+'-'+role.replaceAll(' ','')+'-'+String(++serial).padStart(3,'0'),dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy);if(L<2*c.depth)return;
    const axis={x:dx/L,y:dy/L},normal={x:-axis.y,y:axis.x},aw=world(a.x,a.y,0),nw={x:u.x*normal.x+v.x*normal.y,y:u.y*normal.x+v.y*normal.y},station=aw.x*nw.x+aw.y*nw.y,ts=[0,1];
    for(const f of g.facets)for(const q of roofSection(f,nw,station)){const x=q.x*u.x+q.y*u.y,y=q.x*v.x+q.y*v.y,t=((x-a.x)*dx+(y-a.y)*dy)/(L*L);if(t>0&&t<1)ts.push(t);}
    const breaks=[...new Set(ts.map(t=>Math.round(t*1e8)/1e8))].sort((a,b)=>a-b),at=(t,z)=>world(a.x+dx*t+normal.x*ply,a.y+dy*t+normal.y*ply,z),top=t=>topAt(a.x+dx*t,a.y+dy*t);
    // Do not silently drop a jack because a single facet-break sample is null.
    // Resolve endpoint elevations first and interpolate only across an isolated
    // missing seam sample; real roof-edge endpoints remain anchored to the roof.
    const elevations=breaks.map(t=>top(t));
    const valid=elevations.map((z,i)=>Number.isFinite(z)?i:-1).filter(i=>i>=0);
    // Open-ended jack/hip-carrier assemblies have one eave heel and one
    // receiving end at a girder or hip. Only the eave end meets the bottom
    // chord; the receiving end must stay on the roof/receiver elevation even
    // when its plan (x,y) happens to align with the bottom-chord endpoint.
    // Common/hip/girder trusses retain heel joints at both outside bearings.
    const openReceiver=['Front jack','Side jack','Hip carrier'].includes(role);
    // V3.92: a full-span truss (Common / Hip / Girder) whose end is NOT on the roof boundary lands on
    // an adjoining wing (L/T/U junction). There the roof surface is the neighbouring wing's higher
    // plane, so the chord must stay at roof height and close with a vertical end stud instead of
    // dropping to an eave heel that does not exist at that location.
    const onBoundary=pt=>{const q=world(pt.x,pt.y,0),B=roofBoundary(e);return B.some((v,i)=>segmentDistance(q,v,B[(i+1)%B.length]).distance<1)};
    const freeA=!openReceiver&&!!wing&&role!=='Junction girder'&&!onBoundary(a),freeB=!openReceiver&&!!wing&&role!=='Junction girder'&&!onBoundary(b);
    if(breaks.length){
      if(!freeA)elevations[0]=bottom;
      if(!openReceiver&&!freeB&&Math.hypot(b.x-bottomB.x,b.y-bottomB.y)<.01)elevations[elevations.length-1]=bottom;
    }
    if(valid.length<2)return;
    for(let i=0;i<elevations.length;i++)if(!Number.isFinite(elevations[i])){
      let lo=valid.filter(j=>j<i).at(-1),hi=valid.find(j=>j>i);
      if(lo===undefined)lo=valid[0];
      if(hi===undefined)hi=valid.at(-1);
      const t=breaks[i],t0=breaks[lo],t1=breaks[hi],z0=elevations[lo],z1=elevations[hi];
      elevations[i]=Math.abs(t1-t0)<1e-8?z0:z0+(z1-z0)*(t-t0)/(t1-t0);
    }
    // Side jacks must meet the actual 3D hip-carrier chord, not merely its
    // plan trace. A roof-facet height sampled at the same X/Y can differ from
    // the straight carrier chord elevation by 100+ mm, leaving a visible gap
    // or making a purple jack look as though it overruns the pink carrier.
    if(openReceiver&&Number.isFinite(receiverZ))elevations[elevations.length-1]=receiverZ;
    // Collapse redundant facet seams when the samples are collinear. Roof
    // triangulation can add nearly identical breakpoints after a rigid rotation;
    // emitting a chord at each such seam creates tiny disconnected solids and
    // inconsistent member counts. Real pitch/ridge changes remain as breakpoints.
    let compacted=true;
    while(compacted&&breaks.length>2){compacted=false;for(let i=1;i<breaks.length-1;i++){
      const t0=breaks[i-1],t1=breaks[i],t2=breaks[i+1],ratio=(t1-t0)/(t2-t0),expected=elevations[i-1]+(elevations[i+1]-elevations[i-1])*ratio;
      if(Math.abs(elevations[i]-expected)<=0.5){breaks.splice(i,1);elevations.splice(i,1);compacted=true;break;}
    }}
    const lineZ=t=>elevations[0]+(elevations[elevations.length-1]-elevations[0])*t;
    if(openReceiver){
      // A physical jack/hip-carrier top chord is a single straight timber.
      // Do not create separate chord pieces at roof-facet seam samples.
      const topA=at(0,elevations[0]),topB=at(1,elevations[elevations.length-1]);
      add(role+' top chord',topA,topB,c.depth,id,(role==='Side jack'||role==='Front jack')?support:'');
      if(role==='Hip carrier'){carrierTopLines.set(id,{a:topA,b:topB});carrierDirs.set(id,axis);}
    }else{
      for(let i=1;i<breaks.length;i++)add(role+' top chord',at(breaks[i-1],elevations[i-1]),at(breaks[i],elevations[i]),c.depth,id);
    }
    const low=t=>world(a.x+(bottomB.x-a.x)*t+normal.x*ply,a.y+(bottomB.y-a.y)*t+normal.y*ply,bottom);
    add(role+' bottom chord',low(0),low(1),c.depth,id,(role==='Side jack'||(role==='Front jack'&&support))?support:'');
    // Blue front jacks, purple side jacks and pink hip carriers all need a
    // receiving-end web. The heel at t=0 is already a direct chord-to-chord
    // joint; close the opposite end with a dedicated web between chord terminals.
    // Keep it tagged so later generic joint trimming cannot mistakenly shave it
    // away at overlapping hip/girder geometry.
    // Distance along the jack from its end node (the receiver centerline) back to a vertical stud
    // that sits against the receiver's SIDE face: half the girder ply stack (or one carrier
    // width), measured along the jack axis for skewed receivers, plus half the stud and the
    // skew allowance for the stud's own width. Without this the stud lands inside the plies.
    let endWebT=1;
    if(openReceiver&&support){
      const ca=carrierDirs.get(support),sinA=ca?Math.abs(axis.x*ca.y-axis.y*ca.x):Math.abs(axis.x),cosA=ca?Math.abs(axis.x*ca.x+axis.y*ca.y):Math.abs(axis.y),
        half=ca?c.width/2:c.girderPlies*c.width/2;
      if(sinA>.2){
        const back=half/sinA+cw.webDepth/2+(c.width/2)*cosA/sinA;
        // A jack that lands on a hip carrier right where the carrier meets the girder must also
        // clear the girder ply stack, so use whichever receiver face is farther from the end.
        let backTotal=back;
        if(girderRef&&Math.abs(axis.x)>.2){
          const stackHalf=c.girderPlies*c.width/2,backX=girderRef.sign*(b.x-girderRef.x)+stackHalf;
          if(backX>0)backTotal=Math.max(backTotal,backX/Math.abs(axis.x)+cw.webDepth/2+(c.width/2)*Math.abs(axis.y)/Math.abs(axis.x));
        }
        if(backTotal<L*.5)endWebT=1-backTotal/L;
      }
    }
    if(openReceiver){
      const endTop=at(endWebT,endWebT<1?lineZ(endWebT):elevations[elevations.length-1]),endBottom=low(endWebT);
      const endWebLength=Math.hypot(endTop.x-endBottom.x,endTop.y-endBottom.y,endTop.z-endBottom.z);
      if(endWebLength>Math.max(20,cw.webDepth*.5)){
        add(role+' web',endBottom,endTop,cw.webDepth,id,support||'',{endWeb:true});
      }
    }
    if(freeA||freeB){
      // Flat-topped junction end: chord stays at roof height to the receiving girder centerline and a
      // vertical stud stands against the girder's side face (half the ply stack + half the stud depth).
      const zChord=t=>{let i=breaks.findIndex((v,j)=>j<breaks.length-1&&t>=v-1e-8&&t<=breaks[j+1]+1e-8);if(i<0)i=breaks.length-2;const t0=breaks[i],t1=breaks[i+1],f=Math.abs(t1-t0)<1e-8?0:(t-t0)/(t1-t0);return elevations[i]+(elevations[i+1]-elevations[i])*Math.max(0,Math.min(1,f))};
      const back=c.girderPlies*c.width/2+cw.webDepth/2;
      for(const [free,t] of [[freeA,back/L],[freeB,1-back/L]]){
        if(!free||back*2>=L)continue;
        const bt=low(t),tp=at(t,zChord(t));
        if(Math.hypot(tp.x-bt.x,tp.y-bt.y,tp.z-bt.z)>Math.max(20,cw.webDepth*.5))add(role+' web',bt,tp,cw.webDepth,id,'',{endWeb:true});
      }
    }
    const bays=c.panelCount||Math.max(4,Math.ceil((L-.001)/2400));
    if(role==='Common truss'||!openReceiver){
      // Closed trusses (Common, Hip, Girder, and Junction girder) use chord-station
      // webs. The old paired-diagonal-to-midpoint layout created repeated V-shaped
      // webs in green commons and also persisted in teal hip trusses and girder sets.
      // Put posts at actual interior chord stations, then use one alternating diagonal
      // per interior panel. Include facet breaks so each web lands on the segmented
      // top chord, rather than meeting an independent roof-plane sample. Open-receiver
      // jack/carrier assemblies retain their compact triangular webs for short spans.
      // Common trusses retain the previously corrected facet-aware station set.
      // For other closed truss families, use the actual web-panel stations only: a
      // roof-facet seam by itself is not a web panel and was creating extra webs in
      // teal hip trusses and girder trusses after the common-truss fix. Elevations at
      // these stations are still interpolated on the true segmented top chord below.
      // Web nodes are based only on the configured/automatic panel count. Adding
      // roof-facet seam samples as extra web stations made the member count depend
      // on floating-point polygon rotation, creating inconsistent connections and
      // a different web pattern after a small model rotation. Top-chord facet seams
      // remain in `breaks`; web stations interpolate onto those exact chord segments.
      // A junction (free) end is closed by the end stud, so the web pattern spans stud to stud and never
      // reaches into the receiving girder's plies.
      const studBack=c.girderPlies*c.width/2+cw.webDepth/2,stationT=i=>{const t=i/bays;return (i===0&&freeA&&studBack*2<L)?studBack/L:(i===bays&&freeB&&studBack*2<L)?1-studBack/L:t};
      const stations=Array.from({length:bays+1},(_,i)=>Math.round(stationT(i)*1e8)/1e8);
      const chordZAt=t=>{
        let i=breaks.findIndex((v,j)=>j<breaks.length-1&&t>=v-1e-8&&t<=breaks[j+1]+1e-8);
        if(i<0)i=breaks.length-2;
        const t0=breaks[i],t1=breaks[i+1],f=Math.abs(t1-t0)<1e-8?0:(t-t0)/(t1-t0);
        return elevations[i]+(elevations[i+1]-elevations[i])*Math.max(0,Math.min(1,f));
      };
      const topNodes=stations.map(t=>({t,p:at(t,chordZAt(t))})),bottomNodes=stations.map(t=>({t,p:low(t)}));
      // Advanced, selectable web topology at chord stations. The end bearings remain
      // direct chord-to-chord joints; the chosen pattern controls only interior webs.
      if(topNodes.length>=2)addAdvancedTrussWebPattern(topNodes,bottomNodes,cw.webPattern,cw.webDepth,id,add,role+' web');
    }else for(let i=0;i<bays;i++){
      // Short open-receiver parts (front/side jacks and hip carriers) remain
      // triangular to retain a web on one-bay assemblies. Closed trusses above
      // use station-based webs to avoid paired midpoint V members.
      const t0=i/bays,t1Raw=(i+1)/bays;
      // Corner jack webs must sit on the jack's side of a perpendicular
      // carrier/girder, not be centered into the perpendicular truss bay.
      // Move the triangular web apex in the terminal receiving bay toward the
      // eave/heel (away from t=1 receiver). Keep the web endpoints on the chord
      // stations so the members remain connected and can be cut to the chord faces.
      const terminalReceivingBay=openReceiver && i===bays-1;
      const t1=terminalReceivingBay&&endWebT<1&&endWebT>t0+.05?endWebT:t1Raw;
      const tm=terminalReceivingBay&&t1===t1Raw ? t0+(t1-t0)*0.28 : (t0+t1)/2;
      const z=openReceiver?lineZ(tm):top(tm),node=at(tm,z);
      if(z>bottom+cw.webDepth){add(role+' web',low(t0),node,cw.webDepth,id);add(role+' web',node,low(t1),cw.webDepth,id);}
    }
    
    assemblies.push({id,role,support});return id;
  }
  // exposed computed above
  // V3.94 — end-girder placement. Common/hip trusses are laid out from the near (x0) girder at one spacing
  // O.C. If the last station would land closer than one spacing to the far (x1) girder, that truss is NOT
  // generated; the far girder moves onto its station instead (setback becomes larger than the default),
  // so no truss sits less than one spacing from a girder.
  const endSetback=[baseSetback,baseSetback];
  {
    const startX=x0+(exposed[0]?baseSetback:0),farX=x1-(exposed[1]?baseSetback:0),n=(farX-c.width/2-(startX+c.spacing))/c.spacing,
      m=Math.max(0,(Math.abs(n-Math.round(n))*c.spacing<=0.1?Math.round(n):Math.ceil(n)));
    if(exposed[1]&&m>=1){
      const gap=farX-(startX+m*c.spacing);
      if(gap<c.spacing-1){
        const moved=x1-(startX+m*c.spacing);
        // Keep the hip-carrier geometry valid: the girder must stay inside the hip run.
        if(moved<=hipRun*.9&&moved>=baseSetback)endSetback[1]=moved;
      }
    }
  }
  const commonStationCap=[exposed[0]?baseSetback:0,exposed[1]?endSetback[1]:0];
  for(const end of [0,1]){
    const setback=endSetback[end];
    const outer=end?x1:x0,sign=end?-1:1,girderX=outer+sign*setback;let girder='';if(!exposed[end]){for(let ply=0;ply<c.girderPlies;ply++)assembly('Junction girder',{x:outer,y:y0},{x:outer,y:y1},'',(ply-(c.girderPlies-1)/2)*c.width);continue;}
    const girderPlyAssemblies=[];for(let ply=0;ply<c.girderPlies;ply++){const offset=(ply-(c.girderPlies-1)/2)*c.width,id=assembly('Girder truss',{x:girderX,y:y0},{x:girderX,y:y1},'',offset);if(id)girderPlyAssemblies.push({offset,id});}
    // Bind connections to the girder ply nearest the truss approaching from this end.
    // This ensures jack chords stop at the outside face of the correct ply, not a
    // far-side ply selected by generic proximity ordering.
    const targetPly=sign*(c.girderPlies-1)/2*c.width,nearestGirder=girderPlyAssemblies.reduce((best,item)=>!best||Math.abs(item.offset-targetPly)<Math.abs(best.offset-targetPly)?item:best,null)?.id||girder;girder=nearestGirder;
    const ridgeX=outer+sign*hipRun,inset=setback*span/(2*hipRun),firstFront=c.spacing;
    // The end hip carriers terminate on the truncated girder. The main
    // full-span hip trusses behind it own the remaining roof section.
    // V3.92: junction-side rule for L/T/U wings. A hip carrier (pink) and its side jacks (purple)
    // exist only where the wing's side edge is a real roof edge. Where the adjoining wing continues
    // flush with this hip end, the roof plane carries straight on across the wing boundary: there is
    // no hip line there, so no carrier or side jacks are generated and only front jacks (blue)
    // run from the eave to the girder / junction girder.
    const sideFlush=[y0,y1].map(yy=>!wing?false:![.15,.5,.95].every(f=>{
      const q=world(outer+sign*setback*f,yy,0),B=roofBoundary(e);
      return B.some((a,i)=>segmentDistance(q,a,B[(i+1)%B.length]).distance<1);
    }));
    const carriers=[y0,y1].map((y,i)=>{if(sideFlush[i])return null;const joint={x:girderX,y:i?y1-inset:y0+inset};return assembly('Hip carrier',{x:outer,y},joint,girder,0,joint,null,{x:girderX,sign});});
    // Return the actual 3D top-chord height only while the query lies on the
    // finite plan span of that specific hip carrier. Front jacks near the roof
    // corners terminate at this pink carrier; central jacks reach the girder.
    const zOnCarrier=(carrierId,localX,localY)=>{
      const chord=carrierId?carrierTopLines.get(carrierId):null;if(!chord)return null;
      const q=world(localX,localY,0),dx=chord.b.x-chord.a.x,dy=chord.b.y-chord.a.y,den=dx*dx+dy*dy;
      if(den<1e-8)return null;
      const t=((q.x-chord.a.x)*dx+(q.y-chord.a.y)*dy)/den;
      const projected={x:chord.a.x+dx*t,y:chord.a.y+dy*t};
      if(t<-.001||t>1.001||Math.hypot(q.x-projected.x,q.y-projected.y)>1)return null;
      return chord.a.z+(chord.b.z-chord.a.z)*Math.max(0,Math.min(1,t));
    };
    // V3.94b — front-jack stations are anchored at every end that has no hip carrier (the roof continues flush there,
    // so the neighbouring orange girder / junction truss is the reference): the first jack sits exactly one spacing
    // from that truss. At a carrier end the first jack stays one spacing from the roof corner. A leftover gap wider
    // than 1.1 spacings at the other end is split evenly (never below the 12 in minimum).
    const minJack=304.8,frontStations=[];
    if(!sideFlush[1]||sideFlush[0]&&false){
      for(let y=y0+firstFront;y<=y1-firstFront+.01;y+=c.spacing)frontStations.push(y);
    }else if(!sideFlush[0]){
      for(let y=y1-firstFront;y>=y0+minJack-.01;y-=c.spacing)frontStations.push(y);
      frontStations.sort((a,b)=>a-b);
      const first=frontStations[0];
      if(first!==undefined&&first-y0>c.spacing*1.1&&(first-y0)/2>=minJack-.01)frontStations.unshift(y0+(first-y0)/2);
    }else{
      for(let y=y0+firstFront;y<mid-.01;y+=c.spacing)frontStations.push(y);
      for(let y=y1-firstFront;y>=mid-.01;y-=c.spacing)frontStations.push(y);
      frontStations.sort((a,b)=>a-b);
      for(let i=frontStations.length-1;i>0;i--)if(frontStations[i]-frontStations[i-1]<minJack-.01)frontStations.splice(i,1);
    }
    for(const y of frontStations){
      const sideIdx=y<mid?0:1,reach=sideFlush[sideIdx]?setback:Math.min(setback,hipRun*(1-Math.abs(y-mid)/(span/2))),x=outer+sign*reach,carrier=carriers[sideIdx],receiverZ=zOnCarrier(carrier,x,y),hitsCarrier=Number.isFinite(receiverZ);
      // If the front jack end lies on a pink hip-carrier segment, use its
      // actual 3D chord elevation and bind the member to that carrier so the
      // solid end is trimmed at that receiving face. When the jack reaches the
      // central yellow girder instead, retain roof-plane elevation and let the
      // existing girder-joint logic trim it there.
      assembly('Front jack',{x:outer,y},{x,y},hitsCarrier?carrier:nearestGirder,0,hitsCarrier?{x,y}:{x:girderX,y},hitsCarrier?receiverZ:null,{x:girderX,sign});
    }
    // V3.94 — side-jack stations. Default layout (unchanged from V3.93): one spacing steps from the eave, with the
    // last station one spacing from the girder. When the girder has been moved out past the default setback that
    // layout leaves a gap wider than one spacing (a missing jack next to the girder). In that case the stations
    // start one spacing from the girder (orange) and step toward the eave; a gap larger than 1.1 spacings left at
    // the eave is split evenly with one extra station. Every station stays at least the 12 in minimum from its
    // neighbours, the eave and the girder.
    const legacy=[];
    const girderClearanceStation=setback-trussSpacing;
    for(let d=trussSpacing;d<girderClearanceStation-0.01;d+=trussSpacing)legacy.push(d);
    if(girderClearanceStation>=trussSpacing-0.01){
      const last=legacy.at(-1);
      if(last===undefined||girderClearanceStation-last>=trussSpacing-0.01){
        legacy.push(girderClearanceStation);
      }else if(legacy.length>1){
        const previous=legacy[legacy.length-2];
        if(girderClearanceStation-previous>=trussSpacing-0.01){
          legacy[legacy.length-1]=girderClearanceStation;
        }else{
          legacy.pop();
          if(!legacy.length||girderClearanceStation-legacy.at(-1)>=trussSpacing-0.01)
            legacy.push(girderClearanceStation);
        }
      }else if(legacy.length===1){
        legacy[0]=girderClearanceStation;
      }else{
        legacy.push(girderClearanceStation);
      }
    }
    const legacyPts=[0,...legacy,setback],legacyGap=Math.max(...legacyPts.slice(1).map((v,i)=>v-legacyPts[i]));
    let sideJackStations=legacy;
    if(legacyGap>trussSpacing*1.1){
      sideJackStations=[];
      for(let d=setback-trussSpacing;d>=trussSpacing-0.01;d-=trussSpacing)sideJackStations.push(d);
      // Only split when at least one jack already stands one spacing from the girder; a wing too short for
      // that (legacy layout also had none) does not get a stub jack added.
      const last=sideJackStations.at(-1);
      if(last!==undefined&&last>trussSpacing*1.1&&last/2>=304.8-0.01)sideJackStations.push(last/2);
    }
    for(const d of [...new Set(sideJackStations.map(v=>Math.round(v*1000)/1000))]){
      if(setback-d<c.width*1.5)continue;
      const x=outer+sign*d,inner=span/2*(1-d/hipRun);
      // Terminate each purple side-jack top chord on the pink hip-carrier
      // centerline in all three coordinates. The endpoint is not based on the
      // local roof facet's Z sample: it is interpolated from the carrier's
      // actual single-piece chord, which guarantees a flush 3D centerline join.
      const carrierY0=y0+inset*(d/setback),carrierY1=y1-inset*(d/setback),z0=zOnCarrier(carriers[0],x,carrierY0),z1=zOnCarrier(carriers[1],x,carrierY1);
      // Both purple side-jack chords must terminate at the same hip-carrier
      // intersection. The former bottomB values (firstFront / mid-inner) made
      // bottom chords continue past the pink hip truss even though their top
      // chords stopped at it. Keep the bottom chord's far plan point at the
      // receiver intersection, matching b exactly.
      if(carriers[0])assembly('Side jack',{x,y:y0},{x,y:carrierY0},carriers[0],0,{x,y:carrierY0},z0);
      if(carriers[1])assembly('Side jack',{x,y:y1},{x,y:carrierY1},carriers[1],0,{x,y:carrierY1},z1);
    }
  }
  const commonStart=x0+commonStationCap[0]+c.spacing,commonEnd=x1-commonStationCap[1]-c.width/2;
  // Use an integer station count rather than a floating-point loop condition.
  // Rotating a roof can perturb an endpoint by a few microns; the old `x < end`
  // loop then added/removed one common truss, leaving neighboring members unmatched.
  const normalizedSpan=(commonEnd-commonStart)/c.spacing;
  // Treat spans that are within 0.1 mm of an exact station multiple as exact.
  // This prevents a rigidly rotated footprint from creating one extra common
  // truss when floating-point projection noise moves the final station across
  // the end threshold. Non-integral spans still use ceil to cover the full bay.
  const nearestStationCount=Math.round(normalizedSpan);
  const stableStationCount=Math.abs(normalizedSpan-nearestStationCount)*c.spacing<=0.1
    ? nearestStationCount : Math.ceil(normalizedSpan);
  const commonCount=Math.max(0,stableStationCount);
  for(let station=0;station<commonCount;station++){
    const x=commonStart+station*c.spacing;
    const d=Math.min(exposed[0]?x-x0:Infinity,exposed[1]?x1-x:Infinity),hip=d<hipRun-.01;
    // Truncation is vertical: facet breaks create a flat upper chord.
    // Both bearing ends and the bottom chord retain the full wing span.
    assembly(hip?'Hip truss':'Common truss',{x,y:y0},{x,y:y1});
  }
  issues.push('Hip end sets follow the footprint long axis. Girder ply count is a layout setting; support reactions and connection details are not calculated.');
  return true;
}
function generateMultiWingTrusses(e,g,c,add,issues){
  const boundary=roofBoundary(e);if(!roofOrthogonal(boundary))return false;
  if(boundary.length===4)return generateHipTrussSet(e,g,c,add,issues);
  const frame=roofFrame(e.points),
    // Canonicalize the footprint in its own local frame before rectangle partitioning.
    // A rigid world-space rotation introduces floating-point noise (typically <1e-9 mm)
    // into local coordinates; without canonicalization, roofRectangles can choose a
    // different decomposition and create/remove a truss station at a boundary.
    // 0.1 mm is far below modeling tolerance and is applied only to plan coordinates.
    localBoundary=boundary.map(p=>{const q=frame.local(p);return {x:Math.round(q.x*10)/10,y:Math.round(q.y*10)/10};}),
    rectangles=roofRectangles(localBoundary).sort((a,b)=>{
    const dims=r=>({w:Math.round((r.x1-r.x0)*100)/100,h:Math.round((r.y1-r.y0)*100)/100});
    const A=dims(a),B=dims(b),areaA=Math.round(A.w*A.h*100)/100,areaB=Math.round(B.w*B.h*100)/100;
    return areaB-areaA || Math.max(B.w,B.h)-Math.max(A.w,A.h) || B.w-A.w || A.x0-B.x0 || A.y0-B.y0;
  }),occupied=[],wings=[];
  // Partition overlaps so each wing owns its framing footprint exactly once.
  for(const rect of rectangles){let pieces=[rect];for(const o of occupied)pieces=pieces.flatMap(r=>{const x0=Math.max(r.x0,o.x0),x1=Math.min(r.x1,o.x1),y0=Math.max(r.y0,o.y0),y1=Math.min(r.y1,o.y1);if(x1<=x0+.01||y1<=y0+.01)return [r];return [{x0:r.x0,x1:x0,y0:r.y0,y1:r.y1},{x0:x1,x1:r.x1,y0:r.y0,y1:r.y1},{x0,x1,y0:r.y0,y1:y0},{x0,x1,y0:y1,y1:r.y1}].filter(p=>p.x1-p.x0>c.depth*2&&p.y1-p.y0>c.depth*2);});for(const r of pieces){occupied.push(r);wings.push(r);}}
  // Derive the common truss direction from the largest wing, then apply it to
  // every decomposed rectangle. Smaller wings must not independently rotate their
  // trusses merely because their local width/height ratio differs.
  const dominant=rectangles[0];
  const frameU={x:e.points[1].x-e.points[0].x,y:e.points[1].y-e.points[0].y};
  const frameUL=Math.hypot(frameU.x,frameU.y)||1;
  frameU.x/=frameUL;frameU.y/=frameUL;
  const dominantWidth=Math.round((dominant.x1-dominant.x0)*100)/100,dominantHeight=Math.round((dominant.y1-dominant.y0)*100)/100;
  const referenceAxis=dominantWidth>=dominantHeight?frameU:{x:-frameU.y,y:frameU.x};
  // Branch wings: a wing that sits on the LONG side of the dominant wing (an arm of a U/L/T plan) runs its
  // ridge away from that shared edge, so its free end is the hip end and the blue front jacks land on that
  // free (far) side. Wings that only touch the dominant wing's ends, or touch nothing large, keep the shared
  // dominant axis (V3.73). Set roofFraming.wingDirection='aligned' to force the V3.73 behaviour everywhere.
  const crossAxis={x:-referenceAxis.y,y:referenceAxis.x},refIsX=dominantWidth>=dominantHeight,minLap=c.depth*2;
  const isBranch=r=>{if(c.wingDirection==='aligned'||r===dominant)return false;
    if(refIsX){const lap=Math.min(r.x1,dominant.x1)-Math.max(r.x0,dominant.x0);return lap>minLap&&(Math.abs(r.y0-dominant.y1)<.5||Math.abs(r.y1-dominant.y0)<.5);}
    const lap=Math.min(r.y1,dominant.y1)-Math.max(r.y0,dominant.y0);return lap>minLap&&(Math.abs(r.x0-dominant.x1)<.5||Math.abs(r.x1-dominant.x0)<.5);};
  let made=0;for(const [i,r] of wings.entries()){const points=[{x:r.x0,y:r.y0},{x:r.x1,y:r.y0},{x:r.x1,y:r.y1},{x:r.x0,y:r.y1}].map(frame.world);if(generateHipTrussSet(e,g,c,add,issues,{points,index:i+1,directionAxis:isBranch(r)?crossAxis:referenceAxis}))made++;}
  if(made)issues.push('Multi-wing junction girders are preliminary support locations; load paths, valley sets and connector sizing require design.');return made>0;
}


