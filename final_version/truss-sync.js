/* CadTech truss sync: single source of truth between the 3D roof framing and the "Truss Elevation & Stresses" tab.
   3D -> 2D : cadtechGet3DTrussGeometry() returns every truss (chords + webs) in its own elevation frame (metres).
   2D -> 3D : cadtechSetTrussWebs(assemblyIds, webs) stores the webs drawn in 2D; generateRoofFraming replaces the generated
              webs of those assemblies with them (applyTrussWebOverrides), so the 3D model always shows the 2D web layout.
   Local frame: x along the bottom chord from the left heel (m), y = height above the bottom-chord centreline (m). */
(function(){
  const OV=window.cadtechTrussWebOverrides=window.cadtechTrussWebOverrides||{};
  const isBottom=t=>/bottom chord$/i.test(t||''),isTop=t=>/top chord$/i.test(t||''),isWeb=t=>/(web|post)$/i.test(t||'');
  const r3=n=>Math.round(n*1000)/1000;

  function frameOf(bottoms){
    const pts=[];for(const m of bottoms)pts.push(m.a,m.b);
    if(pts.length<2)return null;
    let A=pts[0],B=pts[1],best=-1;
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);if(d>best){best=d;A=pts[i];B=pts[j]}}
    if(best<1)return null;
    let ux=(B.x-A.x)/best,uy=(B.y-A.y)/best;
    if(ux<-1e-6||(Math.abs(ux)<=1e-6&&uy<0)){[A,B]=[B,A];ux=-ux;uy=-uy}
    return {o:A,u:{x:ux,y:uy},len:best};
  }
  const toLocal=(f,p)=>({x:r3(((p.x-f.o.x)*f.u.x+(p.y-f.o.y)*f.u.y)/1000),y:r3((p.z-f.o.z)/1000)});
  const toWorld=(f,x,y)=>({x:f.o.x+f.u.x*x*1000,y:f.o.y+f.u.y*x*1000,z:f.o.z+y*1000});
  function pointSegmentDistance3(p,a,b){
    const ab=[b.x-a.x,b.y-a.y,b.z-a.z],ap=[p.x-a.x,p.y-a.y,p.z-a.z];
    const den=ab.reduce((s,v)=>s+v*v,0)||1;
    const t=Math.max(0,Math.min(1,ap.reduce((s,v,i)=>s+v*ab[i],0)/den));
    const q={x:a.x+ab[0]*t,y:a.y+ab[1]*t,z:a.z+ab[2]*t};
    return {distance:Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z),point:q,t};
  }
  function deriveLoadTransferLinks(trusses,byAsm,frames){
    // Only infer jack/hip-to-carrier links when BIM member geometry physically meets.
    const sources=trusses.filter(t=>['JK','SJ','HT'].includes(t.code));
    const receivers=trusses.filter(t=>['HG','JG','HC'].includes(t.code));
    for(const source of sources){
      const sourceMembers=byAsm.get(source.assemblyId)||[],frame=frames.get(source.assemblyId);
      if(!frame)continue;
      const sourceChords=sourceMembers.filter(m=>/(top|bottom).*chord/i.test(m.type||''));
      const links=[];
      for(const receiver of receivers){
        if(receiver.assemblyId===source.assemblyId)continue;
        const targetMembers=(byAsm.get(receiver.assemblyId)||[]).filter(m=>/(chord|girder)/i.test(m.type||''));
        let best=null;
        for(const sm of sourceChords)for(const p of [sm.a,sm.b])for(const tm of targetMembers){
          const hit=pointSegmentDistance3(p,tm.a,tm.b);
          const tol=Math.max(22,(Number(sm.width||38)+Number(tm.width||38))*.32);
          if(hit.distance<=tol&&(!best||hit.distance<best.distance))best={distance:hit.distance,worldPoint:hit.point,sourcePoint:p};
        }
        if(best){
          const local=toLocal(frame,best.sourcePoint);
          if(!links.some(x=>x.targetTag===receiver.tag&&Math.abs(x.localX-local.x)<.08))links.push({
            targetTag:receiver.tag,targetAssemblyId:receiver.assemblyId,localX:local.x,localY:0,
            worldPoint:{x:best.sourcePoint.x,y:best.sourcePoint.y,z:best.sourcePoint.z},snapDistanceMm:best.distance,
            relation:'geometry-derived jack/hip load-transfer candidate'
          });
        }
      }
      source.connections=links;
    }
  }

  /* called inside generateRoofFraming, before overhang extension and joining */
  window.applyTrussWebOverrides=function(members,e,c){
    // Hydrate saved design web layouts from the BIM roof element after a project reload.
    const saved=e?.cadtechTrussDesignOverrides||{};
    for(const [id,design] of Object.entries(saved))if(Array.isArray(design?.webs)){
      const sig=JSON.stringify(design.webs);
      if(!OV[id]||OV[id].sig!==sig)OV[id]={webs:design.webs,sig};
    }
    const ids=Object.keys(OV);if(!ids.length)return members;
    const byAsm=new Map();for(const m of members)if(m.assembly&&OV[m.assembly]){(byAsm.get(m.assembly)||byAsm.set(m.assembly,[]).get(m.assembly)).push(m)}
    if(!byAsm.size)return members;
    const drop=new Set(),extra=[];let n=0;
    for(const [id,list] of byAsm){
      const f=frameOf(list.filter(m=>isBottom(m.type)));if(!f)continue;
      const oldWebs=list.filter(m=>isWeb(m.type));
      const proto=oldWebs[0],role=(list.find(m=>isBottom(m.type)).type.replace(/\s*bottom chord$/i,''))||'Truss';
      for(const w of oldWebs)drop.add(w);
      for(const w of OV[id].webs){
        const a=toWorld(f,w[0],w[1]),b=toWorld(f,w[2],w[3]),length=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
        if(length<10)continue;
        const depth=proto?.depth??c.webDepth,width=proto?.width??c.width;
        extra.push({id:e.id+':RF-2D'+String(++n).padStart(4,'0'),roofId:e.id,type:proto?.type||role+' web',a,b,width,depth,length,section:width+' × '+depth,assembly:id});
      }
    }
    return members.filter(m=>!drop.has(m)).concat(extra);
  };

  function invalidate(){
    try{roofFramingCache?.clear?.()}catch(_){}
    try{window.render?.()}catch(_){}
  }

  function roleOfRoofMember(member){
    const type=String(member?.type||'').toLowerCase();
    if(type.includes('top chord'))return 'top';
    if(type.includes('bottom chord'))return 'bottom';
    if(type.includes('web')||type.includes('post'))return 'web';
    return null;
  }
  const segmentKey=(a,b)=>{
    const p=[a.map(v=>Number(v).toFixed(3)).join(','),b.map(v=>Number(v).toFixed(3)).join(',')].sort();
    return p.join('|');
  };

  /* Apply persisted NDS member sizes / plies to the generated 3D roof members.
     Geometry matching is by local endpoints, not list order or screen position. */
  window.applyTrussAnalysisMemberOverrides=function(members,e){
    const saved=e?.cadtechTrussDesignOverrides||{};
    if(!Object.keys(saved).length)return members;
    const groups=new Map();
    for(const member of members)if(member.assembly&&saved[member.assembly]?.members){
      (groups.get(member.assembly)||groups.set(member.assembly,[]).get(member.assembly)).push(member);
    }
    for(const [assemblyId,list] of groups){
      const frame=frameOf(list.filter(m=>isBottom(m.type)));if(!frame)continue;
      const design=saved[assemblyId],overrides=new Map((design.members||[]).map(m=>[`${m.role}|${segmentKey(m.a,m.b)}`,m]));
      const byRole=new Map();
      for(const m of design.members||[]){
        const prev=byRole.get(m.role);
        if(!prev||(Number(m.depthMm||0)*Number(m.plies||1))>(Number(prev.depthMm||0)*Number(prev.plies||1)))byRole.set(m.role,m);
      }
      for(const member of list){
        const role=roleOfRoofMember(member);if(!role)continue;
        const a=toLocal(frame,member.a),b=toLocal(frame,member.b);
        const choice=overrides.get(`${role}|${segmentKey([a.x,a.y],[b.x,b.y])}`)||byRole.get(role);
        if(!choice)continue;
        const boardWidth=Math.max(1,Number(choice.widthMm)||member.width||38.1);
        const plies=Math.max(1,Math.round(Number(choice.plies)||1));
        const depth=Math.max(1,Number(choice.depthMm)||member.depth||88.9);
        member.baseWidthMm=boardWidth;
        member.width=boardWidth*plies;
        member.depth=depth;
        member.plies=plies;
        member.sectionName=choice.sectionName||member.sectionName;
        member.section=`${member.width.toFixed(1)} × ${depth.toFixed(1)} mm`;
        member.ndsDesignOverride=true;
      }
    }
    return members;
  };

  /* Persist NDS-selected member sections / ply counts and accepted web patterns on source roof elements. */
  window.cadtechSetTrussAnalysisDesign=function(designs){
    const elements=(typeof model!=='undefined'&&Array.isArray(model?.elements))?model.elements:(window.model?.elements||[]);let applied=0;
    for(const design of designs||[]){
      if(!design?.roofId||!design?.assemblyId)continue;
      const roof=elements.find(item=>item.id===design.roofId&&item.type==='roof');if(!roof)continue;
      roof.cadtechTrussDesignOverrides=roof.cadtechTrussDesignOverrides||{};
      const previous=roof.cadtechTrussDesignOverrides[design.assemblyId]||{};
      const next={...previous,members:Array.isArray(design.members)?design.members:previous.members,ndsResult:design.ndsResult,optimizationAudit:design.optimizationAudit||previous.optimizationAudit||null,updatedAt:new Date().toISOString()};
      if(Array.isArray(design.webs)){
        next.webs=design.webs;
        const sig=JSON.stringify(design.webs);
        OV[design.assemblyId]={webs:design.webs,sig};
      }
      roof.cadtechTrussDesignOverrides[design.assemblyId]=next;
      applied++;
    }
    if(applied)invalidate();
    return applied;
  };

  /* 2D -> 3D. webs = [[x1,y1,x2,y2],...] in the truss frame; null removes the override (3D regenerates its own webs). */
  window.cadtechSetTrussWebs=function(assemblyIds,webs){
    let changed=false;
    for(const id of assemblyIds||[]){
      if(webs===null){if(OV[id]){delete OV[id];changed=true}}
      else{const next=JSON.stringify(webs);if(!OV[id]||OV[id].sig!==next){OV[id]={webs,sig:next};changed=true}}
    }
    if(changed)invalidate();
    return changed;
  };
  window.cadtechHasTrussWebOverride=id=>!!OV[id];

  /* 3D -> 2D */
  window.cadtechGet3DTrussGeometry=function(){
    const roofs=model.elements.filter(e=>e.type==='roof');if(!roofs.length||typeof projectRoofFraming!=='function')return {trusses:[]};
    const members=projectRoofFraming(roofs,true).members;
    const groups=roofPlanAssemblies(members);
    const byAsm=new Map();for(const m of members)if(m.assembly)(byAsm.get(m.assembly)||byAsm.set(m.assembly,[]).get(m.assembly)).push(m);
    const trusses=[],frames=new Map();
    for(const g of groups){
      const list=byAsm.get(g.id);if(!list)continue;
      const bottoms=list.filter(m=>isBottom(m.type));const f=frameOf(bottoms);if(!f)continue;frames.set(g.id,f);
      const seg=m=>{const a=toLocal(f,m.a),b=toLocal(f,m.b);return {x1:a.x,y1:a.y,x2:b.x,y2:b.y,width:m.baseWidthMm||m.width,depth:m.depth,...(Number.isFinite(Number(m.plies))&&Number(m.plies)>=1?{plies:Math.round(Number(m.plies))}:{}),type:m.type}};
      const top=list.filter(m=>isTop(m.type)).map(seg),bottom=bottoms.map(seg),webs=list.filter(m=>isWeb(m.type)).map(seg);
      if(!top.length)continue;
      const span=r3(f.len/1000);
      const xs=top.flatMap(s=>[s.x1,s.x2]),ovL=r3(Math.max(0,-Math.min(...xs))),ovR=r3(Math.max(0,Math.max(...xs)-span));
      const height=r3(Math.max(...top.flatMap(s=>[s.y1,s.y2])));
      const left=top.filter(s=>Math.min(s.x1,s.x2)<span/2).sort((a,b)=>Math.min(a.x1,a.x2)-Math.min(b.x1,b.x2))[0];
      const pitch=left&&Math.abs(left.x2-left.x1)>1e-6?Math.round(Math.atan(Math.abs((left.y2-left.y1)/(left.x2-left.x1)))*1800/Math.PI)/10:0;
      trusses.push({tag:g.tag,code:g.code,assemblyId:g.id,plyIds:g.plyIds||[g.id],roofId:list[0].roofId,span,height,pitch,overhangLeft:ovL,overhangRight:ovR,
        spacing:(roofs[0].roofFraming?.spacing||600)/1000,top,bottom,webs});
    }
    deriveLoadTransferLinks(trusses,byAsm,frames);
    return {trusses};
  };
})();
