// Drop faces that repeat another face's corners (a receiving cut applied twice by two touching supports).
function uniqueTimberFaces(faces){
  const key=f=>f.map(v=>[v.x,v.y,v.z].map(n=>Math.round(n*10)/10).join(',')).sort().join('|'),seen=new Set();
  return faces.filter(f=>{const k=key(f);if(seen.has(k))return false;seen.add(k);return true;});
}
// Cache roof perimeter rings and endpoint decisions: finishRoofConnections checks
// many member/support pairs, so this must not rebuild the roof geometry per pair.
const roofPerimeterRingCache=new WeakMap(),roofPerimeterEndpointCache=new WeakMap();
function isRoofPerimeterPlumbEnd(m,p){
  if(!m||!(m.type==='Rafter'||/top chord/i.test(m.type||'')))return false;
  const endpointKey=p===m.a?'a':p===m.b?'b':`${p.x},${p.y}`;
  let memberCache=roofPerimeterEndpointCache.get(m);
  if(memberCache?.has(endpointKey))return memberCache.get(endpointKey);
  let result=false;
  try{
    const currentModel=typeof model!=='undefined'?model:null;
    const roof=currentModel?.elements?.find(e=>e.type==='roof'&&e.id===(m.roofId||m.id));
    if(roof&&typeof roofGeometry==='function'){
      const signature=[roof.roofType,roof.overhang,roof.roofAngle,...(roof.points||[]).flatMap(q=>[q.x,q.y])].join('|');
      let cached=roofPerimeterRingCache.get(roof);
      if(!cached||cached.signature!==signature){
        const g=roofGeometry(roof),rings=[g?.boundary,typeof roofBoundary==='function'?roofBoundary(roof):null].filter(r=>Array.isArray(r)&&r.length>=2);
        cached={signature,rings};roofPerimeterRingCache.set(roof,cached);
      }
      const tol=Math.max(2.5,(m.width||45)*0.03);
      const dist2=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy,t=Math.max(0,Math.min(1,den?((p.x-a.x)*dx+(p.y-a.y)*dy)/den:0));return Math.hypot(p.x-(a.x+dx*t),p.y-(a.y+dy*t));};
      result=cached.rings.some(r=>r.some((a,i)=>dist2(p,a,r[(i+1)%r.length])<=tol));
    }
  }catch(_){result=false;}
  if(!memberCache){memberCache=new Map();roofPerimeterEndpointCache.set(m,memberCache);}
  memberCache.set(endpointKey,result);
  return result;
}
// Join in each truss's own vertical plane, then extrude the cut profile.
function snapWebEndpointsToOwnChords(members,tolerance=8){
  // Snap only web/post endpoints that are already geometrically close to a chord
  // in the same truss assembly. This removes tiny coordinate mismatches caused by
  // roof-facet sampling without changing chord direction/pitch or joining a web to
  // an unrelated nearby girder. Intentional external jack-to-carrier connections
  // remain the responsibility of the receiver-connection solver.
  const chords=members.filter(m=>m.assembly&&/top chord|bottom chord|rafter|ceiling joist/i.test(m.type||''));
  const pointSegment=(p,a,b)=>{const d={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},v={x:p.x-a.x,y:p.y-a.y,z:p.z-a.z},den=d.x*d.x+d.y*d.y+d.z*d.z,t=Math.max(0,Math.min(1,den?(v.x*d.x+v.y*d.y+v.z*d.z)/den:0));return {t,p:{x:a.x+d.x*t,y:a.y+d.y*t,z:a.z+d.z*t}};};
  for(const m of members){if(!m.assembly||/top chord|bottom chord|rafter|ceiling joist/i.test(m.type||''))continue;
    const own=chords.filter(c=>c.assembly===m.assembly);if(!own.length)continue;
    for(const key of ['a','b']){const p=m[key];let best=null;for(const c of own){const hit=pointSegment(p,c.a,c.b),dist=Math.hypot(p.x-hit.p.x,p.y-hit.p.y,p.z-hit.p.z);if(dist<=tolerance&&(!best||dist<best.dist))best={p:hit.p,dist};}if(best)m[key]={...best.p};}
  }
  return members;
}
function joinTrussMembers(members){
  snapWebEndpointsToOwnChords(members);
  const groups=new Map();for(const m of members)if(m.assembly){const group=groups.get(m.assembly)||[];group.push(m);groups.set(m.assembly,group);}
  const familyType=t=>/top chord|rafter/i.test(t||'')?'top':/bottom chord|ceiling joist/i.test(t||'')?'bottom':'web';
  const typeRank=t=>/^(Girder truss|Junction girder)/i.test(t||'')?4:/^(Hip carrier|Hip truss)/i.test(t||'')?3:/^(Front jack|Side jack|Jack rafter)/i.test(t||'')?2:1;
  const pointSeg3=(p,a,b)=>{const d={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},v={x:p.x-a.x,y:p.y-a.y,z:p.z-a.z},den=d.x*d.x+d.y*d.y+d.z*d.z,t=Math.max(0,Math.min(1,den?((v.x*d.x+v.y*d.y+v.z*d.z)/den):0)),q={x:a.x+d.x*t,y:a.y+d.y*t,z:a.z+d.z*t};return Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z)};
  const externalReceiver=(m,p)=>{
    const family=familyType(m.type);if(family==='web')return null;
    const bound=members.filter(q=>q!==m&&q.assembly&&q.assembly!==m.assembly&&q.assembly===m.receiverAssembly&&familyType(q.type)===family);
    const candidates=bound.length?bound:members.filter(q=>q!==m&&q.assembly&&q.assembly!==m.assembly&&familyType(q.type)===family&&typeRank(q.type)>typeRank(m.type));
    return candidates.find(q=>pointSeg3(p,q.a,q.b)<=(m.width+q.width)/2+1)||null;
  };
  for(const group of groups.values()){
    const longest=group.reduce((a,b)=>Math.hypot(a.b.x-a.a.x,a.b.y-a.a.y)>Math.hypot(b.b.x-b.a.x,b.b.y-b.a.y)?a:b),d={x:longest.b.x-longest.a.x,y:longest.b.y-longest.a.y},l=Math.hypot(d.x,d.y);if(l<.01)continue;
    const u={x:d.x/l,y:d.y/l},v={x:-u.y,y:u.x},origin=longest.a,to=p=>({x:(p.x-origin.x)*u.x+(p.y-origin.y)*u.y,y:p.z-origin.z}),world=(p,w)=>({x:origin.x+u.x*p.x+v.x*w,y:origin.y+u.y*p.x+v.y*w,z:origin.z+p.y});
    const records=group.map(m=>{const a=to(m.a),b=to(m.b),L=distance(a,b),axis={x:(b.x-a.x)/L,y:(b.y-a.y)/L},n={x:-axis.y,y:axis.x},h=m.depth/2;return {m,a,b,axis,n,L,h,chord:/chord|rafter|ceiling joist/i.test(m.type||'')};});
    // Store explicit joint metadata so the renderer, cut list and future plate-design
    // module can distinguish a real member-to-member joint from intersecting solids.
    for(const r of records){r.m.jointConnections=[];delete r.m.jointIssue;}
    const clip=(ps,fn)=>roofClip(ps,fn),family=r=>/top chord|rafter/i.test(r.m.type||'')?'top':/bottom chord|ceiling joist/i.test(r.m.type||'')?'bottom':'web';
    const bottomRecs=records.filter(r=>family(r)==='bottom');
    const bottomXs=bottomRecs.flatMap(r=>[r.a.x,r.b.x]);
    const minBotX=bottomXs.length?Math.min(...bottomXs):-Infinity,maxBotX=bottomXs.length?Math.max(...bottomXs):Infinity;
    // Shift vertical end web posts sitting on the outer mono bearing boundary inward by h so their outer face is flush with the plumb cut
    for(const r of records){
      if(r.chord||Math.abs(r.a.x-r.b.x)>2)continue;
      if(Number.isFinite(maxBotX)&&Math.abs(r.a.x-maxBotX)<=2){r.a={x:r.a.x-r.h,y:r.a.y};r.b={x:r.b.x-r.h,y:r.b.y};}
      else if(Number.isFinite(minBotX)&&Math.abs(r.a.x-minBotX)<=2){r.a={x:r.a.x+r.h,y:r.a.y};r.b={x:r.b.x+r.h,y:r.b.y};}
    }
    for(const r of records){
      const sharedTopEnds=new Set();
      const extensions=[0,0];for(const [i,p] of [r.a,r.b].entries()){
        // Only webs/posts get temporary overrun so chord-face clipping can trim them.
        // Extending chord ends produced long spikes at short facet seams and made
        // render depth depend on whether a neighboring chord shared a node.
        if(!r.chord){extensions[i]=r.m.depth*4;continue;}
        // A chord end that is trimmed by a miter/plumb plane must start from a rectangle that
        // reaches past that plane; otherwise the square end leaves a V notch on the high face
        // (and a short low face) instead of one clean plumb/miter face.
        let trimmed=records.some(q=>q!==r&&family(q)===family(r)&&(distance(p,q.a)<.05||distance(p,q.b)<.05));
        if(!trimmed&&family(r)==='top'){const worldEnd=i?r.m.b:r.m.a;trimmed=isRoofPerimeterPlumbEnd(r.m,worldEnd)||!externalReceiver(r.m,worldEnd);}
        if(trimmed)extensions[i]=Math.min(r.m.depth*3,r.L*.45);
      }
      const a={x:r.a.x-r.axis.x*extensions[0],y:r.a.y-r.axis.y*extensions[0]},b={x:r.b.x+r.axis.x*extensions[1],y:r.b.y+r.axis.y*extensions[1]};
      let ps=[{x:a.x+r.n.x*r.h,y:a.y+r.n.y*r.h},{x:a.x-r.n.x*r.h,y:a.y-r.n.y*r.h},{x:b.x-r.n.x*r.h,y:b.y-r.n.y*r.h},{x:b.x+r.n.x*r.h,y:b.y+r.n.y*r.h}];
      for(const [i,p] of [r.a,r.b].entries())for(const q of records){if(q===r||family(q)!==family(r))continue;const qi=distance(p,q.a)<.05?0:distance(p,q.b)<.05?1:-1;if(qi<0)continue;const own={x:r.axis.x*(i?-1:1),y:r.axis.y*(i?-1:1)},other={x:q.axis.x*(qi?-1:1),y:q.axis.y*(qi?-1:1)};const topPair=family(r)==='top'&&family(q)==='top';const normal={x:own.x-other.x,y:own.y-other.y};ps=clip(ps,b=>-((b.x-p.x)*normal.x+(b.y-p.y)*normal.y));if(topPair)sharedTopEnds.add(i);
        const cutKind=topPair?'shared top-chord miter (plumb at a symmetric peak)':'shared angular bisector';r.m.jointConnections.push({memberId:q.m.id,end:i?'b':'a',kind:topPair?'top-chord-miter':'chord-miter',cut:cutKind});q.m.jointConnections.push({memberId:r.m.id,end:qi?'b':'a',kind:topPair?'top-chord-miter':'chord-miter',cut:cutKind});}
      // Every unsupported top-chord corner gets a vertical plumb-cut face.
      // Receiver ends are left extended/available to the receiving-face trim
      // applied in finishRoofConnections(), whose cut plane is also vertical.
      if(family(r)==='top'){
        r.m.endCuts=[];
        for(const [i,p] of [r.a,r.b].entries()){
          const worldEnd=i?r.m.b:r.m.a,perimeterPlumb=isRoofPerimeterPlumbEnd(r.m,worldEnd),receiver=perimeterPlumb?null:externalReceiver(r.m,worldEnd);
          // A shared top-chord node has already been cut by the paired-joint plane above.
          // Applying a second generic plumb plane here clips the same end twice and creates
          // triangular slivers/gaps at ridge and hip corners. Keep the shared-joint cut.
          if(sharedTopEnds.has(i)){r.m.endCuts[i]={end:i?'b':'a',kind:'plumb-cut',plane:'shared top-chord joint'};continue;}
          if(receiver){r.m.endCuts[i]={end:i?'b':'a',kind:'plumb-receiving-face',receiverAssembly:receiver.assembly};continue;}
          // A plumb cut is vertical in 3D, but its horizontal normal must follow
          // the member's plan direction. Using only sign(axis.x) made diagonal and
          // rotated roof edges cut on the wrong side, leaving spikes/overlaps at hips.
          const dirX=r.axis.x*(i?1:-1),hs=Math.abs(dirX)>1e-6?Math.sign(dirX):0,
            outward=hs?{x:hs,y:0}:{x:r.axis.x*(i?1:-1),y:r.axis.y*(i?1:-1)};
          // roofClip keeps values <= 0, i.e. the member side of the vertical plane.
          ps=clip(ps,b=>(b.x-p.x)*outward.x+(b.y-p.y)*outward.y);
          r.m.endCuts[i]={end:i?'b':'a',kind:'plumb-cut',plane:'vertical',normal:hs?{x:u.x*hs,y:u.y*hs,z:0}:{x:0,y:0,z:0}};
        }
      }
      r.profile=ps;
    }
    // Chords are continuous bearing faces; webs/posts terminate against them.
    for(const r of records){let profile=r.profile;const endTouched=[false,false];if(!r.chord)for(const q of records.filter(q=>q.chord)){
      // A web may terminate at any point along a chord, not only at a chord endpoint.
      // Trim the web to the near face of the chord so its timber solid does not pass
      // through the chord or leave a visible gap at the joint.
      const ends=[r.a,r.b],touches=ends.map((p,i)=>({p,i,hit:segmentDistance(p,q.a,q.b)})).filter(x=>x.hit.distance<Math.max(.1,r.m.depth*.02));if(!touches.length)continue;
      const mid={x:(r.a.x+r.b.x)/2,y:(r.a.y+r.b.y)/2},side=(mid.x-q.a.x)*q.n.x+(mid.y-q.a.y)*q.n.y,sign=side>=0?1:-1;
      profile=clip(profile,p=>q.h-sign*((p.x-q.a.x)*q.n.x+(p.y-q.a.y)*q.n.y));
      for(const hit of touches){endTouched[hit.i]=true;const connection={memberId:q.m.id,end:hit.i?'b':'a',kind:'web-to-chord',cut:'flush to chord face',chordFaceOffset:q.h};r.m.jointConnections.push(connection);q.m.jointConnections.push({memberId:r.m.id,end:hit.i?'b':'a',kind:'chord-to-web',cut:'web terminates at chord face',chordFaceOffset:q.h});}
    }
    // Webs/posts are drawn 4x their depth long so a chord clip can trim them flush. An end that found no chord to trim against must
    // not keep that extension (it showed as a stray 360 mm spike at junction-girder valleys): cut it back to the true member end.
    if(!r.chord)for(const [i,p] of [r.a,r.b].entries())if(!endTouched[i]){const out={x:r.axis.x*(i?1:-1),y:r.axis.y*(i?1:-1)};profile=clip(profile,b=>(b.x-p.x)*out.x+(b.y-p.y)*out.y);}
    let parts=[profile];
      parts=parts.filter(ps=>ps.length>=3&&Math.abs(area2(ps))>.01);if(!parts.length){r.m.jointIssue='Member removed by joint trimming';r.m.cutFaces=[];continue;}
      // A convex member can be split while subtracting a chord. Keep all surviving pieces.
      r.m.cutProfiles=parts;r.m.cutFaces=parts.flatMap(ps=>{const a=ps.map(p=>world(p,-r.m.width/2)),b=ps.map(p=>world(p,r.m.width/2));return [[...a].reverse(),b,...a.map((_,i)=>[a[i],a[(i+1)%a.length],b[(i+1)%a.length],b[i]])];});
      const projections=parts.flat().map(p=>p.x*r.axis.x+p.y*r.axis.y);r.m.cutLength=Math.max(...projections)-Math.min(...projections);r.m.joinery=r.chord?(r.m.type.toLowerCase().includes('top chord')?'Plumb-cut top chord ends':'Mitered chord-to-chord joint'):'Web/post end trimmed flush to chord face';
      r.m.jointConnections=[...new Map((r.m.jointConnections||[]).map(j=>[j.memberId+'|'+j.end+'|'+j.kind,j])).values()];
    }
  }
  return members.filter(m=>!m.cutFaces||m.cutFaces.length>=4&&timberSolidVolume(m.cutFaces)>.01);
}

// Clip a convex timber solid and close the new cut with an actual end face.
function clipTimberFaces(faces,origin,normal,offset=0){
  const value=p=>(p.x-origin.x)*normal.x+(p.y-origin.y)*normal.y+(p.z-origin.z)*normal.z-offset,cap=[],result=[];
  for(const face of faces){const ps=[];for(let i=0;i<face.length;i++){const a=face[i],b=face[(i+1)%face.length],da=value(a),db=value(b);if(da>=-.00001)ps.push(a);if((da<0&&db>0)||(da>0&&db<0)){const t=da/(da-db),p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};ps.push(p);cap.push(p);}}if(ps.length>=3)result.push(ps);}
  const unique=cap.filter((p,i)=>!cap.slice(0,i).some(q=>Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z)<.001));
  if(unique.length>=3){const c=unique.reduce((s,p)=>({x:s.x+p.x/unique.length,y:s.y+p.y/unique.length,z:s.z+p.z/unique.length}),{x:0,y:0,z:0}),L=Math.hypot(normal.x,normal.y,normal.z),n={x:normal.x/L,y:normal.y/L,z:normal.z/L},a=Math.abs(n.z)<.9?{x:-n.y,y:n.x,z:0}:{x:n.z,y:0,z:-n.x},al=Math.hypot(a.x,a.y,a.z);a.x/=al;a.y/=al;a.z/=al;const b={x:n.y*a.z-n.z*a.y,y:n.z*a.x-n.x*a.z,z:n.x*a.y-n.y*a.x},angle=p=>Math.atan2((p.x-c.x)*b.x+(p.y-c.y)*b.y+(p.z-c.z)*b.z,(p.x-c.x)*a.x+(p.y-c.y)*a.y+(p.z-c.z)*a.z);unique.sort((p,q)=>angle(q)-angle(p));result.push(unique);}
  return result;
}
function finishRoofConnections(members){
  const axis=m=>{const l=Math.hypot(m.b.x-m.a.x,m.b.y-m.a.y,m.b.z-m.a.z);return {x:(m.b.x-m.a.x)/l,y:(m.b.y-m.a.y)/l,z:(m.b.z-m.a.z)/l};},dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z),rank=m=>(m.type.startsWith('Girder')||m.type.startsWith('Junction girder'))?3:(m.type.startsWith('Hip carrier')||m.type.startsWith('Hip truss'))?2:m.type.startsWith('Front jack')?1:0;
  const assemblyCenters=new Map();for(const m of members)if(m.assembly){const c=assemblyCenters.get(m.assembly)||{x:0,y:0,n:0};c.x+=(m.a.x+m.b.x)/2;c.y+=(m.a.y+m.b.y)/2;c.n++;assemblyCenters.set(m.assembly,c)}for(const c of assemblyCenters.values()){c.x/=c.n;c.y/=c.n}
  const rafters=members.filter(m=>!m.assembly),supports=members.filter(m=>rank(m)>0&&m.type.includes('chord')||m.type==='Ridge member'||m.type==='Hip / valley member');
  for(const m of members){if(m.endWeb)continue;let faces=roofMemberFaces(m),changed=false;
    // End-to-end equal-section roof members share an angular bisector plane.
    if(!m.assembly)for(const [i,p] of [m.a,m.b].entries())for(const q of rafters){if(q===m||m.type==='Rafter'&&q.type!=='Rafter'||m.type!=='Rafter'&&q.type==='Rafter')continue;const qi=dist(p,q.a)<.1?0:dist(p,q.b)<.1?1:-1;if(qi<0)continue;const u=axis(m),v=axis(q);let n;if(m.type==='Rafter'&&q.type==='Rafter'){const h=Math.hypot(m.b.x-m.a.x,m.b.y-m.a.y);if(h<.001)continue;n={x:(m.b.x-m.a.x)/h*(i?-1:1),y:(m.b.y-m.a.y)/h*(i?-1:1),z:0};m.jointConnections=m.jointConnections||[];q.jointConnections=q.jointConnections||[];m.jointConnections.push({memberId:q.id,end:i?'b':'a',kind:'plumb-cut',cut:'vertical plumb cut'});q.jointConnections.push({memberId:m.id,end:qi?'b':'a',kind:'plumb-cut',cut:'vertical plumb cut'});}else n={x:u.x*(i?-1:1)-v.x*(qi?-1:1),y:u.y*(i?-1:1)-v.y*(qi?-1:1),z:u.z*(i?-1:1)-v.z*(qi?-1:1)};if(Math.hypot(n.x,n.y,n.z)<.001)continue;
      // Extend just the end ring before clipping, to close the long miter point.
      const own=axis(m),sign=i?1:-1,extension=Math.min(m.length/3,m.depth*3);faces=faces.map(f=>f.map(v=>Math.abs((v.x-p.x)*own.x+(v.y-p.y)*own.y+(v.z-p.z)*own.z)<.01?{x:v.x+own.x*sign*extension,y:v.y+own.y*sign*extension,z:v.z+own.z*sign*extension}:v));faces=clipTimberFaces(faces,p,n);changed=true;
    }
    // Jack/rafter ends receive compound cuts at the receiving timber face.
    for(const [i,p] of [m.a,m.b].entries())for(const q of supports){
      // Eave/perimeter ends must stay true vertical plumb cuts. Do not replace
      // them with a nearby carrier/girder compound cut based on proximity alone.
      if(isRoofPerimeterPlumbEnd(m,p)&&!(i===1&&m.receiverAssembly&&(m.type.startsWith('Side jack')||m.type.startsWith('Front jack'))))continue;
      // A side-jack chord is assigned to a specific hip carrier during
      // generation. Do not let an adjacent carrier/girder/another wing trim
      // it at the wrong junction: top chords meet that carrier's top chord,
      // and bottom chords meet the same carrier's bottom chord.
      if(m.type.startsWith('Side jack')&&m.receiverAssembly&&(m.type.includes('top chord')||m.type.includes('bottom chord'))){
        const suffix=m.type.includes('top chord')?'top chord':'bottom chord';
        if(q.assembly!==m.receiverAssembly||!q.type.toLowerCase().endsWith(suffix)||!q.type.startsWith('Hip carrier'))continue;
      }
      // Front-jack chords in a hip-end zone share the assigned pink hip carrier,
      // just like purple side jacks: top chords terminate at the carrier top chord
      // and bottom chords terminate at its bottom chord. Do not let a nearby
      // girder or a different wing trim either chord at the wrong end.
      if(m.type.startsWith('Front jack')&&m.receiverAssembly&&(m.type.includes('top chord')||m.type.includes('bottom chord'))){
        const suffix=m.type.includes('top chord')?'top chord':'bottom chord';
        if(q.assembly!==m.receiverAssembly||!q.type.toLowerCase().endsWith(suffix)||!(/^(Hip carrier|Girder truss)/.test(q.type)))continue;
      }
      if(q===m||q.assembly&&q.assembly===m.assembly||m.assembly&&rank(m)>=rank(q)||!m.assembly&&m.type!=='Rafter')continue;
      const h=Math.hypot(q.b.x-q.a.x,q.b.y-q.a.y);if(h<1)continue;const t=((p.x-q.a.x)*(q.b.x-q.a.x)+(p.y-q.a.y)*(q.b.y-q.a.y))/(h*h);if(t<-.001||t>1.001)continue;const at={x:q.a.x+(q.b.x-q.a.x)*t,y:q.a.y+(q.b.y-q.a.y)*t,z:q.a.z+(q.b.z-q.a.z)*t};if(distance(p,at)>(m.assembly?(q.type.startsWith('Girder')||q.type.startsWith('Junction girder')?q.width*2+m.width/2:(m.width+q.width)/2)+.15:.15)||Math.abs(p.z-at.z)>(m.depth+q.depth)/2)continue;
      const n={x:-(q.b.y-q.a.y)/h,y:(q.b.x-q.a.x)/h,z:0},mid=Math.hypot(m.b.x-m.a.x,m.b.y-m.a.y)<1?(assemblyCenters.get(m.assembly)||{x:(m.a.x+m.b.x)/2,y:(m.a.y+m.b.y)/2}):{x:(m.a.x+m.b.x)/2,y:(m.a.y+m.b.y)/2};if((mid.x-at.x)*n.x+(mid.y-at.y)*n.y<0){n.x=-n.x;n.y=-n.y;}if(Math.abs((mid.x-at.x)*n.x+(mid.y-at.y)*n.y)<.1)continue;
      {const own=axis(m),sign=i?1:-1,extension=Math.min(m.length*.45,m.depth*3);
       faces=faces.map(f=>f.map(v=>Math.abs((v.x-p.x)*own.x+(v.y-p.y)*own.y+(v.z-p.z)*own.z)<.01?{x:v.x+own.x*sign*extension,y:v.y+own.y*sign*extension,z:v.z+own.z*sign*extension}:v));}
      faces=clipTimberFaces(faces,at,n,q.width/2);changed=true;
      // Retain receiver metadata for the final exposed-end plumb-cut pass. If an
      // end is trimmed against a hip/ridge/girder face, don't replace that joint
      // with a generic eave-style plumb cut.
      if(m.type==='Rafter'||/top chord/i.test(m.type||'')){
        m.endCuts=m.endCuts||[];
        m.endCuts[i]={end:i?'b':'a',kind:'plumb-receiving-face',receiverAssembly:q.assembly||q.id};
      }
    }
    if(changed){m.cutFaces=uniqueTimberFaces(faces);m.joinery='Miter / compound receiving-face cut';const u=axis(m),values=faces.flat().map(p=>p.x*u.x+p.y*u.y+p.z*u.z);m.cutLength=Math.max(...values)-Math.min(...values);}
  }
  // Apply true world-space plumb cuts to exposed rafter/top-chord ends. The
  // assembly-plane joiner already establishes joint topology, but rafters which
  // are not part of a truss assembly previously retained square-cut eave ends.
  // A plumb cut is a vertical plane through the end's plan coordinate, normal to
  // the member's horizontal projection (not a plane normal to the sloping member).
  for(const m of members){
    if(!(m.type==='Rafter'||/top chord/i.test(m.type||'')))continue;
    const dx=m.b.x-m.a.x,dy=m.b.y-m.a.y,h=Math.hypot(dx,dy);if(h<.001)continue;
    let faces=m.cutFaces||roofMemberFaces(m),changed=false;
    const cuts=(m.endCuts||[]).filter(c=>c&&c.end);
    for(const [i,end] of ['a','b'].entries()){
      const p=m[end],old=cuts.find(c=>c.end===end);
      // A receiving-face cut is intentional and must remain compound-fit to the
      // receiving timber. All other exposed ends get the vertical plumb plane.
      if(old&&(/receiv/i.test(old.kind||'')||old.plane==='shared top-chord joint'||(old.plane==='vertical'&&!old.method)))continue;
      const sign=i===0?1:-1,normal={x:dx/h*sign,y:dy/h*sign,z:0};
      const ownAxis=axis(m),ext=Math.min(m.length*.45,m.depth*3),outSign=i===0?-1:1;
      const reach=faces.map(f=>f.map(v=>Math.abs((v.x-p.x)*ownAxis.x+(v.y-p.y)*ownAxis.y+(v.z-p.z)*ownAxis.z)<.01?{x:v.x+ownAxis.x*outSign*ext,y:v.y+ownAxis.y*outSign*ext,z:v.z+ownAxis.z*outSign*ext}:v));
      const trimmed=clipTimberFaces(reach,p,normal,0);
      if(trimmed.length>=4&&timberSolidVolume(trimmed)>.01){faces=trimmed;changed=true;
        const entry={end,kind:'plumb-cut',plane:'vertical',method:'world-space plan-normal'};
        const prior=cuts.findIndex(c=>c.end===end);if(prior>=0)cuts[prior]=entry;else cuts.push(entry);
      }
    }
    if(changed){m.cutFaces=uniqueTimberFaces(faces);m.endCuts=cuts;m.joinery=(cuts||[]).some(c=>/receiv/i.test(c.kind||''))?'Miter / compound receiving-face cut':'Plumb-cut exposed top-chord/rafter ends';const u=axis(m),values=faces.flat().map(p=>p.x*u.x+p.y*u.y+p.z*u.z);m.cutLength=Math.max(...values)-Math.min(...values);}
  }
  return members.filter(m=>!m.cutFaces||m.cutFaces.length>=4&&timberSolidVolume(m.cutFaces)>.01);
}


function timberSolidVolume(faces){const points=faces.flat(),c=points.reduce((s,p)=>({x:s.x+p.x/points.length,y:s.y+p.y/points.length,z:s.z+p.z/points.length}),{x:0,y:0,z:0});let volume=0;for(const f of faces)for(let i=1;i<f.length-1;i++){const a={x:f[0].x-c.x,y:f[0].y-c.y,z:f[0].z-c.z},b={x:f[i].x-c.x,y:f[i].y-c.y,z:f[i].z-c.z},d={x:f[i+1].x-c.x,y:f[i+1].y-c.y,z:f[i+1].z-c.z};volume+=Math.abs(a.x*(b.y*d.z-b.z*d.y)+a.y*(b.z*d.x-b.x*d.z)+a.z*(b.x*d.y-b.y*d.x))/6}return volume}

