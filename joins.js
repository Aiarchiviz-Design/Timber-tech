/* Shared wall geometry. Units: mm. Wall axes remain editable model records;
   joins and boundary surfaces are derived, never stored as separate drawings. */
var $ = window.$ = window.$ || (s => document.querySelector(s));
var $$ = window.$$ = window.$$ || (s => [...document.querySelectorAll(s)]);
var JOIN_EPS = 0.001;
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function lerp(a,b,t){return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}}
function clone(x){return JSON.parse(JSON.stringify(x))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function cross2(a,b){return a.x*b.y-a.y*b.x}
function sub2(a,b){return {x:a.x-b.x,y:a.y-b.y}}
var WALL_COMPOSITES={timber140:{name:'Timber 140 · insulated',skins:[{name:'Gypsum',thickness:13},{name:'Structural timber',thickness:140,core:true},{name:'Sheathing',thickness:19},{name:'Air gap',thickness:25},{name:'Cladding',thickness:16}]},timber90:{name:'Timber 90 · internal',skins:[{name:'Gypsum',thickness:13},{name:'Structural timber',thickness:90,core:true},{name:'Gypsum',thickness:13}]}};
function wallLayers(w){return w.structure==='composite'?(w.skins||WALL_COMPOSITES[w.composite||'timber140']?.skins||WALL_COMPOSITES.timber140.skins):[{name:w.material||'Timber',thickness:w.thickness,core:true}]}
function coreGeometry(w){const skins=wallLayers(w),coreIndex=skins.findIndex(s=>s.core),insideFinish=skins.slice(0,Math.max(0,coreIndex)).reduce((a,s)=>a+s.thickness,0),depth=skins[coreIndex]?.thickness||w.thickness;return {insideFinish,depth,center:w.structure==='composite'?w.thickness/2-insideFinish-depth/2:0}}
function referenceOffset(w){const c=coreGeometry(w),r=w.reference||'center',offset={center:0,inside:-w.thickness/2,outside:w.thickness/2,coreInside:-w.thickness/2+c.insideFinish,coreCenter:-w.thickness/2+c.insideFinish+c.depth/2,coreOutside:-w.thickness/2+c.insideFinish+c.depth}[r]||0;return offset*(w.flipped?-1:1)}
function wallCenterPoint(w,p){const u=sub2(w.b,w.a),len=Math.hypot(u.x,u.y)||1,r=referenceOffset(w);return {x:p.x-u.y/len*r,y:p.y+u.x/len*r}}
function wallBase(w){return (typeof storyOf==='function'?storyOf(w).elevation:(w.story==='s2'?3048:0))+(w.baseOffset||0)}
if(typeof window!=='undefined'){
  window.WALL_COMPOSITES=WALL_COMPOSITES;
  window.wallLayers=wallLayers;
  window.coreGeometry=coreGeometry;
  window.referenceOffset=referenceOffset;
  window.wallCenterPoint=wallCenterPoint;
  window.wallBase=wallBase;
}
function area2(ps){return ps.reduce((s,p,i)=>s+cross2(p,ps[(i+1)%ps.length]),0)/2}
function cleanPolygon(ps){const out=[];for(const p of ps)if(!out.length||distance(p,out.at(-1))>JOIN_EPS)out.push(p);if(out.length>1&&distance(out[0],out.at(-1))<JOIN_EPS)out.pop();return out.length>=3&&Math.abs(area2(out))>.01?(area2(out)<0?out.reverse():out):[]}
function axisIntersection(a,b,c,d){const u=sub2(b,a),v=sub2(d,c),det=cross2(u,v);if(Math.abs(det)<1e-8*Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y))return null;const t=cross2(sub2(c,a),v)/det,s=cross2(sub2(c,a),u)/det;return {point:lerp(a,b,t),t,s}}
function joinedWallPolygon(w,a=w.a,b=w.b,t=w.thickness){const ps=rawWallPoly(w,a,b,t);if(w.type!=='wall'||Math.abs(t-w.thickness)>JOIN_EPS)return ps;
  for(const [key,indices] of [['a',[0,3]],['b',[1,2]]]){const end=w[key],p=key==='a'?a:b;if(distance(p,end)>JOIN_EPS)continue;
    const candidates=model.elements.filter(v=>v.type==='wall'&&v.id!==w.id&&v.story===w.story&&shown(v)&&[v.a,v.b].some(q=>distance(q,end)<1));if(candidates.length!==1)continue;
    const other=candidates[0],otherKey=distance(other.a,end)<1?'a':'b',u=sub2(w[key==='a'?'b':'a'],end),v=sub2(other[otherKey==='a'?'b':'a'],other[otherKey]);const lu=Math.hypot(u.x,u.y),lv=Math.hypot(v.x,v.y);if(lu<1||lv<1||Math.abs(cross2(u,v)/(lu*lv))<.05)continue;
    const nu={x:-u.y/lu,y:u.x/lu},nv={x:-v.y/lv,y:v.x/lv};
    for(const i of indices){const offset=sub2(ps[i],wallCenterPoint(w,end)),sign=(offset.x*nu.x+offset.y*nu.y)>0?1:-1,otherCenter=wallCenterPoint(other,other[otherKey]),op={x:otherCenter.x-sign*nv.x*other.thickness/2,y:otherCenter.y-sign*nv.y*other.thickness/2},hit=axisIntersection(ps[i],{x:ps[i].x+u.x,y:ps[i].y+u.y},op,{x:op.x+v.x,y:op.y+v.y});
      if(hit&&distance(hit.point,end)<=Math.min(Math.max(w.thickness,other.thickness)*4,lu*.45,lv*.45))ps[i]=hit.point;
    }
  }return ps;
}
function clipHalfPlane(ps,a,b,keepInside=true){const out=[],edge=sub2(b,a);for(let i=0;i<ps.length;i++){const p=ps[i],q=ps[(i+1)%ps.length],dp=cross2(edge,sub2(p,a)),dq=cross2(edge,sub2(q,a)),ip=keepInside?dp>=-JOIN_EPS:dp<=JOIN_EPS,iq=keepInside?dq>=-JOIN_EPS:dq<=JOIN_EPS;if(ip)out.push(p);if(ip!==iq&&Math.abs(dp-dq)>JOIN_EPS)out.push(lerp(p,q,dp/(dp-dq)))}return cleanPolygon(out)}
function subtractConvex(subject,cutter){let remaining=cleanPolygon(subject),clip=cleanPolygon(cutter),out=[];if(!remaining.length||!clip.length)return remaining.length?[remaining]:[];for(let i=0;i<clip.length&&remaining.length;i++){const a=clip[i],b=clip[(i+1)%clip.length],outside=clipHalfPlane(remaining,a,b,false);if(outside.length)out.push(outside);remaining=clipHalfPlane(remaining,a,b,true)}return out}
function subtractPolygons(ps,cutters){let pieces=[cleanPolygon(ps)].filter(p=>p.length);for(const c of cutters){pieces=pieces.flatMap(p=>subtractConvex(p,c));if(!pieces.length)break}return pieces}
function bounds2(ps){return {x0:Math.min(...ps.map(p=>p.x)),x1:Math.max(...ps.map(p=>p.x)),y0:Math.min(...ps.map(p=>p.y)),y1:Math.max(...ps.map(p=>p.y))}}
function boundsOverlap(a,b){return a.x0<b.x1-JOIN_EPS&&a.x1>b.x0+JOIN_EPS&&a.y0<b.y1-JOIN_EPS&&a.y1>b.y0+JOIN_EPS}
function wallRawCells(w){const len=distance(w.a,w.b),z=wallBase(w),top=z+heightOf(w),os=hosted(w).filter(o=>typeof isLayerVisible!=='function'||isLayerVisible(o.layer)),rs=[0,len,...os.flatMap(o=>[Math.max(0,o.offset-o.width/2),Math.min(len,o.offset+o.width/2)])].sort((a,b)=>a-b),out=[];
  for(let i=0;i<rs.length-1;i++){const a=rs[i],b=rs[i+1];if(b-a<JOIN_EPS)continue;const o=os.find(o=>(a+b)/2>o.offset-o.width/2&&(a+b)/2<o.offset+o.width/2),ps=cleanPolygon(wallPoly(w,lerp(w.a,w.b,a/len),lerp(w.a,w.b,b/len)));const add=(z0,z1)=>{if(z1-z0>JOIN_EPS)out.push({id:w.id,story:w.story,material:w.material,ps,z0,z1,bounds:bounds2(ps)})};if(o){add(z,z+o.sill);add(z+o.sill+o.height,top)}else add(z,top);
  }return out;
}
function joinedWallCells(walls){const raw=[...walls].sort((a,b)=>(b.priority??(b.layer==='Exterior Walls'?100:50))-(a.priority??(a.layer==='Exterior Walls'?100:50))||a.id.localeCompare(b.id)).flatMap(wallRawCells),accepted=[];
  for(const cell of raw){const blockers=accepted.filter(o=>boundsOverlap(o.bounds,cell.bounds)&&o.z0<cell.z1-JOIN_EPS&&o.z1>cell.z0+JOIN_EPS),levels=[...new Set([cell.z0,cell.z1,...blockers.flatMap(o=>[o.z0,o.z1]).filter(z=>z>cell.z0&&z<cell.z1)])].sort((a,b)=>a-b);
    for(let i=0;i<levels.length-1;i++){const z0=levels[i],z1=levels[i+1],mid=(z0+z1)/2,cutters=blockers.filter(o=>o.z0<mid&&o.z1>mid).map(o=>o.ps);for(const ps of subtractPolygons(cell.ps,cutters))accepted.push({...cell,ps,z0,z1,bounds:bounds2(ps)})}
  }return accepted;
}
/* Extract exterior edge fragments. Splitting handles partial collinear contact,
   acute junctions and crossings; occupancy on both sides removes internal seams. */
function wallBoundaryEdges(cells){const out=[],seen=new Set();for(const cell of cells){const ps=cell.ps;for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length],u=sub2(b,a),len=Math.hypot(u.x,u.y);if(len<JOIN_EPS)continue;const ts=[0,1];for(const other of cells){if(other===cell)continue;for(let j=0;j<other.ps.length;j++){const c=other.ps[j],d=other.ps[(j+1)%other.ps.length],hit=axisIntersection(a,b,c,d);if(hit&&hit.t>0&&hit.t<1&&hit.s>=-JOIN_EPS&&hit.s<=1+JOIN_EPS)ts.push(hit.t);else if(!hit&&segmentDistance(c,a,b).distance<JOIN_EPS)ts.push(segmentDistance(c,a,b).t)}}ts.sort((x,y)=>x-y);
      for(let j=0;j<ts.length-1;j++){if((ts[j+1]-ts[j])*len<JOIN_EPS)continue;const p=lerp(a,b,ts[j]),q=lerp(a,b,ts[j+1]),m=lerp(p,q,.5),n={x:-u.y/len*.05,y:u.x/len*.05},left=cells.some(c=>inside({x:m.x+n.x,y:m.y+n.y},c.ps)),right=cells.some(c=>inside({x:m.x-n.x,y:m.y-n.y},c.ps));if(left===right)continue;const key=[p,q].map(v=>`${Math.round(v.x*1000)},${Math.round(v.y*1000)}`).sort().join('/');if(seen.has(key))continue;seen.add(key);out.push({id:cell.id,material:cell.material,a:left?p:q,b:left?q:p})}
    }}return out;
}
function computeWallRoofGableProfile(w, customModel){
  if(!w||w.type!=='wall')return null;
  const mode=w.gableMode||w.framing?.gableMode||'auto';
  if(mode==='none'||mode==='false'||w.gableWall===false||w.framing?.gableWall===false)return null;
  const mModel=customModel||(typeof model!=='undefined'?model:(typeof window!=='undefined'?window.model:null));
  const len=distance(w.a,w.b);
  if(len<200)return null;
  const h=typeof heightOf==='function'?heightOf(w):(w.height||3048);

  const buildProfileFromPoints=(rawPts, pitchDeg, slope, source, roofId, eaveHeight, allowOutExtend=false)=>{
    if(!Array.isArray(rawPts)||rawPts.length<2)return null;
    const sorted=[...rawPts].map(p=>({x:Number(p.x)||0,rise:Math.max(0,Number(p.rise)||0)})).sort((a,b)=>a.x-b.x);
    const pts=[];
    for(const p of sorted){
      if(!pts.length||Math.abs(p.x-pts[pts.length-1].x)>1){
        pts.push(p);
      }else if(p.rise>pts[pts.length-1].rise){
        pts[pts.length-1].rise=p.rise;
      }
    }
    if(pts.length<2)return null;
    let maxRise=-Infinity,maxIdx=0;
    for(let i=0;i<pts.length;i++){
      if(pts[i].rise>maxRise){maxRise=pts[i].rise;maxIdx=i;}
    }
    const peakRise=Math.round(maxRise);
    if(peakRise<=20)return null;

    let plateauHi=maxIdx;
    while(plateauHi+1<pts.length&&Math.abs(pts[plateauHi+1].rise-maxRise)<=2)plateauHi++;
    const peakX=(pts[maxIdx].x+pts[plateauHi].x)/2;
    const leftRise=Math.round(pts[0].rise);
    const rightRise=Math.round(pts[pts.length-1].rise);

    // Canonicalize profile points to prevent jagged steps or false peaks
    const canonicalPts=[{x:0,rise:leftRise}];
    if(Math.abs(peakX-0)>5&&Math.abs(len-peakX)>5){
      canonicalPts.push({x:peakX,rise:peakRise});
    }
    canonicalPts.push({x:len,rise:rightRise});
    const finalPts=canonicalPts;
    const peakRatio=len>0?Math.max(0,Math.min(1,peakX/len)):0.5;
    const finalLeftRise=Math.round(finalPts[0].rise);
    const finalRightRise=Math.round(finalPts[finalPts.length-1].rise);

    const riseAt=(x)=>{
      const qx=allowOutExtend?x:Math.max(0,Math.min(len,x));
      if(qx<=finalPts[0].x)return Math.max(0,finalPts[0].rise);
      if(qx>=finalPts[finalPts.length-1].x)return Math.max(0,finalPts[finalPts.length-1].rise);
      for(let i=0;i+1<finalPts.length;i++){
        const a=finalPts[i],b=finalPts[i+1];
        if(qx<=b.x+1e-6){
          const dx=b.x-a.x;
          const t=dx>1e-6?Math.max(0,Math.min(1,(qx-a.x)/dx)):0;
          return Math.max(0,a.rise+(b.rise-a.rise)*t);
        }
      }
      return Math.max(0,finalPts[finalPts.length-1].rise);
    };

    return {
      enabled:true,
      source,
      roofId:roofId||null,
      pitchDeg:Math.round(pitchDeg*10)/10,
      slope,
      eaveHeight,
      leftHeight:eaveHeight+finalLeftRise,
      rightHeight:eaveHeight+finalRightRise,
      peakRise,
      peakHeight:eaveHeight+peakRise,
      peakRatio,
      peakX,
      profilePoints:finalPts,
      riseAt
    };
  };

  // 1. Explicit gableProfile on wall (from IFC import or manual setting)
  if(w.gableProfile&&w.gableProfile.enabled!==false){
    const gp=w.gableProfile;
    const hasLeft=Number.isFinite(gp.leftHeight)&&gp.leftHeight>100;
    const hasRight=Number.isFinite(gp.rightHeight)&&gp.rightHeight>100;
    const leftHeight=hasLeft?Math.round(gp.leftHeight):h;
    const rightHeight=hasRight?Math.round(gp.rightHeight):h;
    const eaveHeight=Number.isFinite(gp.eaveHeight)&&gp.eaveHeight>100?Math.round(gp.eaveHeight):Math.min(leftHeight,rightHeight,h);
    const peakRatio=Number.isFinite(gp.peakRatio)?Math.max(0,Math.min(1,gp.peakRatio)):0.5;
    const peakX=len*peakRatio;
    const pitchDeg=Math.max(2,Math.min(75,Number(gp.pitch)||25));
    const slope=Math.tan(pitchDeg*Math.PI/180);
    const runRef=peakRatio<=0.03||peakRatio>=0.97?len:Math.min(peakX,len-peakX);
    const defaultRise=Math.round((runRef>1?runRef:len*0.5)*slope);
    const endMaxRise=Math.max(leftHeight-eaveHeight,rightHeight-eaveHeight,0);
    const peakRise=Number.isFinite(gp.peakRise)&&gp.peakRise>10
      ?Math.round(gp.peakRise)
      :(Number.isFinite(gp.peakHeight)&&gp.peakHeight>eaveHeight+10
        ?Math.round(gp.peakHeight-eaveHeight)
        :Math.max(endMaxRise,defaultRise));
    if(peakRise>20){
      const leftRise=Math.max(0,Math.min(peakRise,leftHeight-eaveHeight));
      const rightRise=Math.max(0,Math.min(peakRise,rightHeight-eaveHeight));
      const pts=peakRatio<=0.03
        ?[{x:0,rise:Math.max(leftRise,peakRise)},{x:len,rise:rightRise}]
        :(peakRatio>=0.97
          ?[{x:0,rise:leftRise},{x:len,rise:Math.max(rightRise,peakRise)}]
          :[{x:0,rise:leftRise},{x:peakX,rise:peakRise},{x:len,rise:rightRise}]);
      const prof=buildProfileFromPoints(pts,pitchDeg,slope,gp.source||'ifc',gp.roofId||null,eaveHeight);
      if(prof)return prof;
    }
  }

  const wMid={x:(w.a.x+w.b.x)/2,y:(w.a.y+w.b.y)/2};
  const u={x:(w.b.x-w.a.x)/len,y:(w.b.y-w.a.y)/len};
  const roofs=(mModel&&Array.isArray(mModel.elements))
    ?mModel.elements.filter(e=>e&&e.type==='roof'&&Array.isArray(e.points)&&e.points.length>=3)
    :[];

  const detectRoofProfile=(r)=>{
    const rType=r.roofType||'hip';
    if(rType!=='gable'&&rType!=='multiGable'&&rType!=='mono')return null;
    const pts=r.points;
    const rMinX=Math.min(...pts.map(p=>p.x)),rMaxX=Math.max(...pts.map(p=>p.x));
    const rMinY=Math.min(...pts.map(p=>p.y)),rMaxY=Math.max(...pts.map(p=>p.y));
    const tol=Math.max(Number(r.overhang)||600,900);
    if(Math.max(w.a.x,w.b.x)<rMinX-tol||Math.min(w.a.x,w.b.x)>rMaxX+tol||Math.max(w.a.y,w.b.y)<rMinY-tol||Math.min(w.a.y,w.b.y)>rMaxY+tol)return null;

    const pitchDeg=Math.max(2,Math.min(75,Number(r.pitch)||25));
    const slope=Math.tan(pitchDeg*Math.PI/180);
    const wBaseZ=typeof wallBase==='function'?wallBase(w):(typeof storyOf==='function'?storyOf(w).elevation:0);
    const rfSys=(r.roofFraming&&r.roofFraming.system)||'trusses';
    const isAutoTrussAligned=r.followStory!==false&&!r.ifcPreservedHeight&&['trusses','rafters'].includes(rfSys);
    const rStory=typeof storyOf==='function'?storyOf(r):null;
    const rBaseZ=isAutoTrussAligned
      ?((rStory?rStory.elevation:0)+(rStory?rStory.height:h))
      :((rStory?rStory.elevation:0)+(typeof heightOf==='function'?heightOf(r):(r.height||h)));
    const roofPivotOffset=rBaseZ-(wBaseZ+h);
    const eaveH=h;

    if(rType==='gable'){
      const ang=((Number(r.roofAngle)||0)*Math.PI)/180;
      const ridgeDir={x:Math.cos(ang),y:Math.sin(ang)};
      const spanDir={x:-Math.sin(ang),y:Math.cos(ang)};
      const alignWithSpan=Math.abs(u.x*spanDir.x+u.y*spanDir.y);
      if(alignWithSpan<0.85)return null;

      const ridgeVals=pts.map(p=>p.x*ridgeDir.x+p.y*ridgeDir.y);
      const rLo=Math.min(...ridgeVals),rHi=Math.max(...ridgeVals);
      const wRidgePos=wMid.x*ridgeDir.x+wMid.y*ridgeDir.y;
      const nearGableEnd=Math.min(Math.abs(wRidgePos-rLo),Math.abs(wRidgePos-rHi))<=tol;
      if(!nearGableEnd)return null;

      const spanVals=pts.map(p=>p.x*spanDir.x+p.y*spanDir.y);
      const sLo=Math.min(...spanVals),sHi=Math.max(...spanVals),sMid=(sLo+sHi)/2;
      const halfSpan=(sHi-sLo)/2;
      if(halfSpan<100)return null;

      const waSpan=w.a.x*spanDir.x+w.a.y*spanDir.y;
      const wbSpan=w.b.x*spanDir.x+w.b.y*spanDir.y;
      const wSpanLo=Math.min(waSpan,wbSpan),wSpanHi=Math.max(waSpan,wbSpan);
      const overlap=Math.min(wSpanHi,sHi)-Math.max(wSpanLo,sLo);
      if(overlap<Math.min(len*0.25,300))return null;

      const riseAtS=(s)=>Math.max(0,roofPivotOffset+Math.max(0,halfSpan-Math.abs(s-sMid))*slope);
      const candXs=[0,len];
      const ds=wbSpan-waSpan;
      if(Math.abs(ds)>1){
        for(const sCrit of [sLo,sMid,sHi]){
          const xc=((sCrit-waSpan)/ds)*len;
          if(xc>1&&xc<len-1)candXs.push(xc);
        }
      }
      const profPts=candXs.map(x=>{
        const s=waSpan+(ds*(x/len));
        return {x,rise:riseAtS(s)};
      });
      return buildProfileFromPoints(profPts,pitchDeg,slope,'roof',r.id,eaveH);
    }

    if(rType==='mono'){
      const ang=((Number(r.roofAngle)||0)*Math.PI)/180;
      const ridgeDir={x:Math.cos(ang),y:Math.sin(ang)};
      const spanDir={x:-Math.sin(ang),y:Math.cos(ang)};
      const alignWithSpan=Math.abs(u.x*spanDir.x+u.y*spanDir.y);
      if(alignWithSpan<0.85)return null;

      const ridgeVals=pts.map(p=>p.x*ridgeDir.x+p.y*ridgeDir.y);
      const rLo=Math.min(...ridgeVals),rHi=Math.max(...ridgeVals);
      const wRidgePos=wMid.x*ridgeDir.x+wMid.y*ridgeDir.y;
      const nearRakeEnd=Math.min(Math.abs(wRidgePos-rLo),Math.abs(wRidgePos-rHi))<=tol;
      if(!nearRakeEnd)return null;

      const spanVals=pts.map(p=>p.x*spanDir.x+p.y*spanDir.y);
      const sLo=Math.min(...spanVals),sHi=Math.max(...spanVals);
      const waSpan=w.a.x*spanDir.x+w.a.y*spanDir.y;
      const wbSpan=w.b.x*spanDir.x+w.b.y*spanDir.y;
      const overlap=Math.min(Math.max(waSpan,wbSpan),sHi)-Math.max(Math.min(waSpan,wbSpan),sLo);
      if(overlap<Math.min(len*0.25,300))return null;

      const riseAtS=(s)=>Math.max(0,roofPivotOffset+Math.max(0,Math.min(sHi-sLo,s-sLo))*slope);
      const candXs=[0,len];
      const ds=wbSpan-waSpan;
      if(Math.abs(ds)>1){
        for(const sCrit of [sLo,sHi]){
          const xc=((sCrit-waSpan)/ds)*len;
          if(xc>1&&xc<len-1)candXs.push(xc);
        }
      }
      const profPts=candXs.map(x=>{
        const s=waSpan+(ds*(x/len));
        return {x,rise:riseAtS(s)};
      });
      return buildProfileFromPoints(profPts,pitchDeg,slope,'roof',r.id,eaveH);
    }

    if(rType==='multiGable'){
      // Sample actual roof facets when roofGeometry is available (handles L/T/U/stepped wings accurately)
      if(typeof roofGeometry==='function'){
        try{
          const rg=roofGeometry(r);
          const facets=Array.isArray(rg?.facets)?rg.facets:[];
          if(facets.length){
            const ptInPoly2=(pt,poly)=>{
              let inside=false;
              for(let i=0,j=poly.length-1;i<poly.length;j=i++){
                const xi=poly[i].x,yi=poly[i].y,xj=poly[j].x,yj=poly[j].y;
                if(((yi>pt.y)!==(yj>pt.y))&&(pt.x<(xj-xi)*(pt.y-yi)/((yj-yi)||1e-9)+xi))inside=!inside;
              }
              return inside;
            };
            const evalFacetPlaneZ=(facet,px,py)=>{
              if(facet.length<3)return null;
              const p0=facet[0];
              let nx=0,ny=0,nz=0;
              for(let i=1;i+1<facet.length;i++){
                const ax=facet[i].x-p0.x,ay=facet[i].y-p0.y,az=facet[i].z-p0.z;
                const bx=facet[i+1].x-p0.x,by=facet[i+1].y-p0.y,bz=facet[i+1].z-p0.z;
                nx+=ay*bz-az*by;ny+=az*bx-ax*bz;nz+=ax*by-ay*bx;
              }
              if(Math.abs(nz)<1e-6)return p0.z;
              return p0.z-(nx*(px-p0.x)+ny*(py-p0.y))/nz;
            };
            const facetAutoOffset=isAutoTrussAligned?(Number(r.roofOffset)||0):0;
            const sampleRoofRelRise=(px,py)=>{
              let bestZ=-Infinity,bestDist=Infinity;
              for(const f of facets){
                if(ptInPoly2({x:px,y:py},f)){
                  const fz=evalFacetPlaneZ(f,px,py);
                  if(Number.isFinite(fz)&&fz>bestZ)bestZ=fz;
                }else{
                  for(let i=0;i<f.length;i++){
                    const sd=segmentDistance({x:px,y:py},f[i],f[(i+1)%f.length]);
                    if(sd.distance<=tol&&sd.distance<bestDist){
                      const a=f[i],b=f[(i+1)%f.length];
                      const fz=a.z+(b.z-a.z)*sd.t;
                      if(Number.isFinite(fz)){bestDist=sd.distance;if(bestZ===-Infinity)bestZ=fz;}
                    }
                  }
                }
              }
              if(!Number.isFinite(bestZ))return 0;
              return Math.max(0,bestZ-(wBaseZ+eaveH+facetAutoOffset));
            };
            const sampleN=Math.max(24,Math.min(80,Math.ceil(len/150)));
            const rawSamples=[];
            for(let i=0;i<=sampleN;i++){
              const x=(i/sampleN)*len;
              const pt=lerp(w.a,w.b,i/sampleN);
              rawSamples.push({x,rise:sampleRoofRelRise(pt.x,pt.y)});
            }
            // Refine ridge peaks from facet vertices and edges near the wall axis (catches perpendicular ridges too)
            for(const f of facets){
              for(let i=0;i<f.length;i++){
                const v=f[i];
                const sd=segmentDistance({x:v.x,y:v.y},w.a,w.b);
                if(sd.distance<=tol&&sd.t>0.01&&sd.t<0.99){
                  const px=sd.t*len;
                  const rise=sampleRoofRelRise(v.x,v.y);
                  rawSamples.push({x:px,rise:Math.max(rise,v.z-(wBaseZ+eaveH+facetAutoOffset))});
                }
              }
            }
            const rises=rawSamples.map(s=>s.rise);
            const minR=Math.min(...rises),maxR=Math.max(...rises);
            if(maxR>45&&maxR-minR>40){
              // Keep key inflection points + endpoints to form clean straight segments
              rawSamples.sort((a,b)=>a.x-b.x);
              const simplified=[rawSamples[0]];
              for(let i=1;i+1<rawSamples.length;i++){
                const prev=simplified[simplified.length-1],cur=rawSamples[i],next=rawSamples[i+1];
                const dx=next.x-prev.x;
                const interp=dx>1?prev.rise+((cur.x-prev.x)/dx)*(next.rise-prev.rise):cur.rise;
                if(Math.abs(cur.rise-interp)>3)simplified.push(cur);
              }
              simplified.push(rawSamples[rawSamples.length-1]);
              const prof=buildProfileFromPoints(simplified,pitchDeg,slope,'roof',r.id,eaveH);
              if(prof)return prof;
            }
          }
        }catch(_e){}
      }
      // Fallback rectangular bbox multiGable check
      const rSpanX=rMaxX-rMinX,rSpanY=rMaxY-rMinY;
      const ridgeAlongX=rSpanX>=rSpanY;
      const isGableEnd=ridgeAlongX
        ?(Math.abs(u.y)>0.85&&(Math.abs(wMid.x-rMinX)<=tol||Math.abs(wMid.x-rMaxX)<=tol))
        :(Math.abs(u.x)>0.85&&(Math.abs(wMid.y-rMinY)<=tol||Math.abs(wMid.y-rMaxY)<=tol));
      if(!isGableEnd)return null;
      const sLo=ridgeAlongX?rMinY:rMinX,sHi=ridgeAlongX?rMaxY:rMaxX,sMid=(sLo+sHi)/2,halfSpan=(sHi-sLo)/2;
      const waSpan=ridgeAlongX?w.a.y:w.a.x,wbSpan=ridgeAlongX?w.b.y:w.b.x;
      const riseAtS=(s)=>Math.max(0,roofPivotOffset+Math.max(0,halfSpan-Math.abs(s-sMid))*slope);
      const candXs=[0,len];
      const ds=wbSpan-waSpan;
      if(Math.abs(ds)>1){
        for(const sCrit of [sLo,sMid,sHi]){
          const xc=((sCrit-waSpan)/ds)*len;
          if(xc>1&&xc<len-1)candXs.push(xc);
        }
      }
      const profPts=candXs.map(x=>({x,rise:riseAtS(waSpan+ds*(x/len))}));
      return buildProfileFromPoints(profPts,pitchDeg,slope,'roof',r.id,eaveH);
    }
    return null;
  };

  // 2. Automatic detection: Exterior wall under a gable, multiGable, or mono roof end
  const isExt=w.layer==='Exterior Walls'||w.isExterior===true||(w.name&&/ext|outer|gable/i.test(w.name))||(!w.layer&&(w.thickness||140)>=130);
  if(isExt&&roofs.length){
    for(const r of roofs){
      const detected=detectRoofProfile(r);
      if(detected)return detected;
    }
  }

  // 3. Manual forced gable mode on wall (use matching roof alignment if available, else symmetric)
  if(mode==='gable'||w.isGableWall===true||w.framing?.isGableWall===true){
    for(const r of roofs){
      const detected=detectRoofProfile(r);
      if(detected)return detected;
    }
    const pitchDeg=Math.max(5,Math.min(75,Number(w.framing?.gablePitch||w.gablePitch||roofs[0]?.pitch)||25));
    const slope=Math.tan(pitchDeg*Math.PI/180);
    const peakX=len*0.5;
    const peakRise=Math.round(peakX*slope);
    return buildProfileFromPoints([{x:0,rise:0},{x:peakX,rise:peakRise},{x:len,rise:0}],pitchDeg,slope,'manual',roofs[0]?.id||null,h);
  }

  return null;
}
if(typeof window!=='undefined'){
  window.computeWallRoofGableProfile=computeWallRoofGableProfile;
}
function wallSurfaces(cells){const surfaces=[];for(const c of cells){const above=cells.filter(o=>Math.abs(o.z0-c.z1)<JOIN_EPS&&boundsOverlap(o.bounds,c.bounds)).map(o=>o.ps),below=cells.filter(o=>Math.abs(o.z1-c.z0)<JOIN_EPS&&boundsOverlap(o.bounds,c.bounds)).map(o=>o.ps);for(const ps of subtractPolygons(c.ps,above))surfaces.push({id:c.id,material:c.material,kind:'top',points:ps.map(p=>({...p,z:c.z1}))});for(const ps of subtractPolygons(c.ps,below))surfaces.push({id:c.id,material:c.material,kind:'bottom',points:ps.reverse().map(p=>({...p,z:c.z0}))})}
  const levels=[...new Set(cells.flatMap(c=>[c.z0,c.z1]))].sort((a,b)=>a-b);for(let i=0;i<levels.length-1;i++){const z0=levels[i],z1=levels[i+1],mid=(z0+z1)/2;for(const edge of wallBoundaryEdges(cells.filter(c=>c.z0<mid&&c.z1>mid)))surfaces.push({id:edge.id,material:edge.material,kind:'side',points:[{...edge.a,z:z0},{...edge.b,z:z0},{...edge.b,z:z1},{...edge.a,z:z1}]})}
  if(typeof model!=='undefined'&&Array.isArray(model?.elements)){
    const wallIds=new Set(cells.map(c=>c.id));
    for(const w of model.elements.filter(e=>e.type==='wall'&&wallIds.has(e.id))){
      const gp=computeWallRoofGableProfile(w,model);
      if(!gp||gp.peakRise<=20)continue;
      const wLen=distance(w.a,w.b)||1;
      const zEave=wallBase(w)+gp.eaveHeight;
      const poly=joinedWallPolygon(w);
      if(!poly||poly.length<4)continue;
      const p0=poly[0],p1=poly[1],p2=poly[2],p3=poly[3];
      const rawPts=(Array.isArray(gp.profilePoints)&&gp.profilePoints.length>=2)
        ?gp.profilePoints
        :[{x:0,rise:gp.riseAt(0)},{x:gp.peakX,rise:gp.peakRise},{x:wLen,rise:gp.riseAt(wLen)}];
      for(let i=0;i+1<rawPts.length;i++){
        const a=rawPts[i],b=rawPts[i+1];
        if(a.rise<=1&&b.rise<=1)continue;
        if(b.x-a.x<1)continue;
        const t0=Math.max(0,Math.min(1,a.x/wLen)),t1=Math.max(0,Math.min(1,b.x/wLen));
        const za=zEave+a.rise,zb=zEave+b.rise;
        const fA=lerp(p0,p1,t0),fB=lerp(p0,p1,t1);
        const bA=lerp(p3,p2,t0),bB=lerp(p3,p2,t1);
        const frontPts=[{...fA,z:zEave},{...fB,z:zEave}];
        if(zb>zEave+1)frontPts.push({...fB,z:zb});
        if(za>zEave+1)frontPts.push({...fA,z:za});
        const backPts=[{...bB,z:zEave},{...bA,z:zEave}];
        if(za>zEave+1)backPts.push({...bA,z:za});
        if(zb>zEave+1)backPts.push({...bB,z:zb});
        surfaces.push(
          {id:w.id,material:w.material,kind:'side',points:frontPts},
          {id:w.id,material:w.material,kind:'side',points:backPts},
          {id:w.id,material:w.material,kind:'top',points:[{...fA,z:za},{...fB,z:zb},{...bB,z:zb},{...bA,z:za}]}
        );
      }
    }
  }
  return surfaces;
}
function renderJoinedPlanWalls(){const walls=model.elements.filter(e=>e.type==='wall'&&shown(e)),cells=walls.flatMap(w=>{const cut=storyOf(w).elevation+Math.min(1200,heightOf(w)/2);return wallRawCells(w).filter(c=>c.z0<=cut&&c.z1>=cut)});for(const c of cells){const w=model.elements.find(w=>w.id===c.id);const layerFill=w.layer==='Interior Walls'?'#cdd4c2':w.layer==='Exterior Walls'?'#bdc8ad':((typeof layerOf==='function'&&layerOf(w.layer)?.color)?layerOf(w.layer).color+'44':'#bdc8ad');poly(c.ps.map(p2),selected.includes(c.id)?'#a8c2ab':layerFill,null)}for(const edge of wallBoundaryEdges(cells))line(p2(edge.a),p2(edge.b),selected.includes(edge.id)?'#426e59':'#74866a',selected.includes(edge.id)?1.5:1);const showWallStuds=typeof isLayerVisible==='function'?isLayerVisible('Structure'):true;if(showWallStuds&&typeof framingPlanMembers==='function'){const showBlockings=typeof $==='function'&&$('#wall-blocking-toggle')?.checked===true;const members=framingPlanMembers(),drawnKeys=new Set();for(const {wall:w,member:m,polygon:ps} of members){if(['Top plate','Bottom plate','Header','Sill','Header stud','Upper cripple','Lower cripple','Gable stud','Rake plate'].includes(m.type))continue;const isHorizontalBlocking=/^Block$|^Blocking$/i.test(m.type)||/noggin/i.test(m.type)||m.role==='Horizontal backing';if(!showBlockings&&isHorizontalBlocking)continue;const key=(w.id||'')+ps.map(p=>`${Math.round(p.x)},${Math.round(p.y)}`).join('|');if(drawnKeys.has(key))continue;drawnKeys.add(key);const points=ps.map(p2);const isSelStud=selected.includes(m.id);const isColliding=Boolean(m.collision);const studStroke=isSelStud?'#0284c7':isColliding?'#dc2626':m.customSize?'#7c3aed':(selected.includes(w.id)?'#166534':'#385a44');const studFill=isSelStud?'#38bdf888':isColliding?'#fecaca55':m.customSize?'#ddd6fe66':null;const lw=isSelStud?2.2:(isColliding?1.2:0.8);poly(points,studFill,studStroke,lw);const isVerticalStud=!/^Block$|^Blocking$|noggin|plate|header|sill|beam|lintel/i.test(m.type)&&m.role!=='Horizontal backing'&&(/stud|pack|junction/i.test(m.type)||/stud|return|corner|backing|support/i.test(m.role||'')||(typeof m.z0==='number'&&typeof m.z1==='number'&&typeof m.x0==='number'&&typeof m.x1==='number'&&(m.z1-m.z0)>(m.x1-m.x0)));if(isVerticalStud&&points.length>=4){line(points[0],points[2],studStroke,isSelStud?1.6:(isColliding?1.0:0.65));line(points[1],points[3],studStroke,isSelStud?1.6:(isColliding?1.0:0.65));}}if(typeof getOpeningHiddenStuds==='function'){for(const w of walls){const wMembers=members.filter(x=>x.wall.id===w.id).map(x=>x.member);for(const o of hosted(w).filter(shown)){for(const hs of getOpeningHiddenStuds(w,o,model,wMembers)){if(!hs.poly)continue;const sPts=hs.poly.map(p2);const isSel=hs.id&&selected.includes(hs.id);const st=isSel?'#0284c7':(hs.customSize?'#7c3aed':'#385a44');const fl=isSel?'#38bdf888':(hs.customSize?'#ddd6fe66':null);poly(sPts,fl,st,isSel?2.2:0.75);if(sPts.length>=4){line(sPts[0],sPts[2],st,isSel?1.5:0.6);line(sPts[1],sPts[3],st,isSel?1.5:0.6);}}}}}}}
function updateWallConnections(before,protectedIds=[]){const old=before.elements.filter(e=>e.type==='wall'),current=model.elements.filter(e=>e.type==='wall'),changedWalls=current.filter(w=>{const o=old.find(o=>o.id===w.id);return o&&(distance(w.a,o.a)>JOIN_EPS||distance(w.b,o.b)>JOIN_EPS)}),movedIds=new Set([...changedWalls.map(w=>w.id),...protectedIds]),updates=[];
  for(const w of current){if(movedIds.has(w.id))continue;const ow=old.find(o=>o.id===w.id);if(!ow)continue;for(const k of ['a','b']){let best=null;for(const host of changedWalls){const oh=old.find(o=>o.id===host.id);if(oh.story!==ow.story)continue;const d=segmentDistance(ow[k],oh.a,oh.b);if(d.distance<=1&&(!best||d.distance<best.distance))best={host,t:d.t,distance:d.distance}}if(best)updates.push({w,k,p:lerp(best.host.a,best.host.b,best.t)})}}
  for(const {w,k,p} of updates)w[k]=p;
}
function validateWallGeometry(){for(const w of model.elements.filter(w=>w.type==='wall')){if(distance(w.a,w.b)<10)throw Error('A wall must be at least 10 mm long.');if(!Number.isFinite(w.thickness)||w.thickness<=0)throw Error('Wall thickness must be positive.');validateConstruction(w);if(w.followStory){const home=storyOf(w),top=model.stories.find(s=>s.id===w.topStory),z=(top?top.elevation:home.elevation+home.height)+(w.topOffset||0);if(z-wallBase(w)<10)throw Error('The wall top must be above its base.')}}}
function drawJoinedSection(pr){const opCheck=typeof hasTrimOrSEO==='function'?hasTrimOrSEO:()=>false;const wallCells=joinedWallCells(model.elements.filter(e=>e.type==='wall'&&e.story===activeStory&&shown(e)&&!opCheck(e))),sections=[];for(const c of wallCells){const xs=[];for(let i=0;i<c.ps.length;i++){const a=c.ps[i],b=c.ps[(i+1)%c.ps.length];if(Math.abs(a.y-sectionPlaneY())<JOIN_EPS)xs.push(a.x);if((a.y<sectionPlaneY()&&b.y>sectionPlaneY())||(a.y>sectionPlaneY()&&b.y<sectionPlaneY()))xs.push(a.x+(b.x-a.x)*(sectionPlaneY()-a.y)/(b.y-a.y))}if(xs.length<2)continue;const x0=Math.min(...xs),x1=Math.max(...xs);if(x1-x0<JOIN_EPS)continue;const ps=[{x:x0,y:c.z0},{x:x1,y:c.z0},{x:x1,y:c.z1},{x:x0,y:c.z1}];sections.push({id:c.id,ps,material:c.material});const a=pr(x0,c.z1),b=pr(x1,c.z0);rect(a.x,a.y,b.x-a.x,b.y-a.y,selected.includes(c.id)?'#a8c2ab':'#bec9b2',null);hits.push({id:c.id,a,b})}for(const e of wallBoundaryEdges(sections))line(pr(e.a.x,e.a.y),pr(e.b.x,e.b.y),selected.includes(e.id)?'#426e59':'#809373',1);for(const slab of model.elements.filter(e=>e.type==='slab'&&shown(e)&&!opCheck(e))){const xs=[];for(let i=0;i<slab.points.length;i++){const a=slab.points[i],b=slab.points[(i+1)%slab.points.length];if((a.y<=sectionPlaneY()&&b.y>sectionPlaneY())||(a.y>sectionPlaneY()&&b.y<=sectionPlaneY()))xs.push(a.x+(b.x-a.x)*(sectionPlaneY()-a.y)/(b.y-a.y))}if(xs.length>1){const a=pr(Math.min(...xs),storyOf(slab).elevation),b=pr(Math.max(...xs),storyOf(slab).elevation-slab.thickness);rect(a.x,a.y,b.x-a.x,b.y-a.y,'#ced7c8','#96a68c',.8)}}label('SECTION A–A · CUT AT Y '+sectionPlaneY().toLocaleString()+' mm',width/2,height-65,9,'#929f89')}
function wallSnap(p){if(!snap)return p;const ignored=drag?.kind==='grip'||drag?.kind==='element'?new Set(selected):new Set(),ws=model.elements.filter(e=>e.type==='wall'&&shown(e)&&!ignored.has(e.id)),radius=10/Math.max(baseScale*scale,.01);let best=null,bd=radius;
  for(const w of ws)for(const q of [w.a,w.b])if(distance(p,q)<bd){best=q;bd=distance(p,q)}if(best)return clone(best);
  for(let i=0;i<ws.length;i++)for(let j=i+1;j<ws.length;j++){const h=axisIntersection(ws[i].a,ws[i].b,ws[j].a,ws[j].b);if(h&&h.t>=0&&h.t<=1&&h.s>=0&&h.s<=1&&distance(p,h.point)<bd){best=h.point;bd=distance(p,h.point)}}if(best)return best;
  for(const w of ws){const d=segmentDistance(p,w.a,w.b);if(d.distance<bd){best=d.point;bd=d.distance}}return best||{x:Math.round(p.x/100)*100,y:Math.round(p.y/100)*100};
}
function splitWallAt(w,q){const d=segmentDistance(q,w.a,w.b),len=distance(w.a,w.b),at=d.t*len;if(at<10||len-at<10){toast('Split inside the wall, away from its endpoints.');return false}if(hosted(w).some(o=>Math.abs(o.offset-at)<o.width/2+1)){toast('The split cannot pass through a hosted opening.');return false}return commit(()=>{const end=clone(w.b),copy=clone(w);copy.id=unique('wall');copy.a=clone(d.point);copy.b=end;w.b=clone(d.point);const idx=model.elements.indexOf(w);if(idx>=0)model.elements.splice(idx+1,0,copy);else model.elements.push(copy);for(const o of hosted(w))if(o.offset>at){o.host=copy.id;o.offset-=at}selected=[w.id,copy.id]},false)}
function trimWallTo(w,target){if(!target||target.type!=='wall'||target.id===w.id){toast('Click another wall as the trim / extend boundary.');return false}const h=axisIntersection(w.a,w.b,target.a,target.b);if(!h||h.s<0||h.s>1){toast('The wall axes do not meet on the target segment.');return false}const end=distance(w.a,h.point)<distance(w.b,h.point)?'a':'b';return commit(()=>{w[end]=h.point})}
