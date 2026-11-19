function translateElements(ids,dx,dy){
  const chosen=new Set(ids);
  for(const id of ids){
    if(typeof id==='string'&&id.includes(':STUD:')){
      const found=typeof window.findStudById==='function'?window.findStudById(id,model):null;
      if(found){
        const {wall:w,member:m,studKey}=found;
        const len=distance(w.a,w.b)||1;
        const deltaOnWall=(dx*(w.b.x-w.a.x)+dy*(w.b.y-w.a.y))/len;
        const origX0=m.origX0??Math.round(m.x0);
        const newX0=Math.round(origX0+deltaOnWall);
        const sw=m.studWidth||38;
        const sd=m.studDepth||140;
        const c=typeof construction==='function'?construction(w):{};
        const existingOverrides=(w.framing?.studOverrides&&typeof w.framing.studOverrides==='object')?{...w.framing.studOverrides}:{};
        const rec={
          studKey,
          x0:newX0,
          z0:m.origZ0??Math.round(m.z0),
          type:m.type,
          studWidth:sw,
          studDepth:sd,
          timberGrade:m.timberGrade||c.timberGrade
        };
        existingOverrides[studKey]=rec;
        existingOverrides[`${m.type}:${newX0}:${m.origZ0??Math.round(m.z0)}`]=rec;
        w.framing={...c,studOverrides:existingOverrides};
      }
    }
  }
  for(const e of model.elements.filter(e=>chosen.has(e.id))){if(e.host){if(chosen.has(e.host))continue;const w=hostOf(e);if(w&&w.a&&w.b){const len=distance(w.a,w.b)||1;e.offset+=(dx*(w.b.x-w.a.x)+dy*(w.b.y-w.a.y))/len;continue}}if(e.type==='dimension'){if(e.refs?.some(Boolean)){const d=resolveDimension(e);if(!e.refs.every(r=>!r||chosen.has(r.elementId))){const len=distance(d.a,d.b)||1;e.offset=(e.offset??600)+(-dy*(d.b.x-d.a.x)+dx*(d.b.y-d.a.y))/len;continue}}if(e.a){e.a.x+=dx;e.a.y+=dy;}if(e.b){e.b.x+=dx;e.b.y+=dy;}continue}for(const p of [e.a,e.b,...(e.points||[])].filter(Boolean)){p.x+=dx;p.y+=dy}}
}
function selectionGeometry(e){if(!e)return[];if(e.host){const w=hostOf(e);if(!w||!w.a||!w.b){if(e.a&&(e.width||e.length)){const hw=(e.width||1000)/2,hl=(e.length||e.width||1400)/2;return[{x:e.a.x-hw,y:e.a.y-hl},{x:e.a.x+hw,y:e.a.y-hl},{x:e.a.x+hw,y:e.a.y+hl},{x:e.a.x-hw,y:e.a.y+hl}]}return[e.a,e.b,...(e.points||[])].filter(Boolean)}const len=distance(w.a,w.b)||1;return [lerp(w.a,w.b,((e.offset||0)-(e.width||0)/2)/len),lerp(w.a,w.b,((e.offset||0)+(e.width||0)/2)/len)]}if(e.type==='wall')return wallPoly(e);if(e.type==='dimension'){const d=resolveDimension(e);const off=e.offset??600,dx=d.b.x-d.a.x,dy=d.b.y-d.a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len*off,ny=dx/len*off;const aa={x:d.a.x+nx,y:d.a.y+ny},bb={x:d.b.x+nx,y:d.b.y+ny};return[d.a,aa,bb,d.b]}if(['circle','arc'].includes(e.type))return Array.from({length:65},(_,i)=>{const a=(e.startAngle??0)+i/64*(e.type==='circle'?Math.PI*2:(e.sweep??Math.PI*1.5));return{x:e.a.x+Math.cos(a)*e.radius,y:e.a.y+Math.sin(a)*e.radius}});return[e.a,e.b,...(e.points||[])].filter(Boolean)}
function marqueeIds(a,b,crossing){const r={x0:Math.min(a.x,b.x),x1:Math.max(a.x,b.x),y0:Math.min(a.y,b.y),y1:Math.max(a.y,b.y)},within=p=>p.x>=r.x0&&p.x<=r.x1&&p.y>=r.y0&&p.y<=r.y1,corners=[{x:r.x0,y:r.y0},{x:r.x1,y:r.y0},{x:r.x1,y:r.y1},{x:r.x0,y:r.y1}];return model.elements.filter(shown).filter(e=>{const ps=selectionGeometry(e);if(!ps.length)return false;if(!crossing)return ps.every(within);if(ps.some(within))return true;const closed=e.type==='wall'||['slab','roof','zone','rectangle','circle'].includes(e.type);if(closed&&corners.some(p=>inside(p,ps)))return true;for(let i=1;i<ps.length+(closed?1:0);i++)for(let j=0;j<4;j++){const h=axisIntersection(ps[i-1],ps[i%ps.length],corners[j],corners[(j+1)%4]);if(h&&h.t>=0&&h.t<=1&&h.s>=0&&h.s<=1)return true}return false}).map(e=>e.id)}
function splitDraft(e,q){if(e.type==='wall')return splitWallAt(e,q);if(!['line','beam'].includes(e.type)){toast('Split supports walls, beams and CAD lines.');return false}const hit=segmentDistance(q,e.a,e.b);if(hit.t<=.001||hit.t>=.999)return false;return commit(()=>{const n=clone(e);n.id=unique(e.type);n.a=clone(hit.point);e.b=clone(hit.point);model.elements.push(n);selected=[e.id,n.id]},false)}
function trimDraft(e,target){if(!target?.a||!target?.b||target.id===e.id){toast('Pick another wall, beam or line as the boundary.');return false}if(e.type==='wall')return trimWallTo(e,target);if(!['line','beam'].includes(e.type))return false;const h=axisIntersection(e.a,e.b,target.a,target.b);if(!h||h.s<0||h.s>1){toast('The boundary does not intersect the selected axis.');return false}return commit(()=>e[distance(h.point,e.a)<distance(h.point,e.b)?'a':'b']=clone(h.point))}
function mirrorSelection(a,b){if(distance(a,b)<1){toast('Pick two distinct points for the mirror axis.');return false}const u=sub2(b,a),len2=u.x*u.x+u.y*u.y,ids=new Set(selected);return commit(()=>{for(const e of model.elements.filter(e=>ids.has(e.id))){if(e.host){if(!ids.has(e.host)){const w=hostOf(e);if(w&&w.a&&w.b){e.offset=distance(w.a,w.b)-e.offset;continue}}else continue}if(e.type==='dimension'&&e.refs?.some(Boolean)&&e.refs.every(r=>!r||ids.has(r.elementId))){e.offset=-(e.offset??600);continue}for(const p of [e.a,e.b,...(e.points||[])].filter(Boolean)){const t=((p.x-a.x)*u.x+(p.y-a.y)*u.y)/len2;p.x=2*(a.x+t*u.x)-p.x;p.y=2*(a.y+t*u.y)-p.y}if(e.type==='wall')e.flipped=!e.flipped;if(e.type==='roof'){e.roofAngle=2*Math.atan2(u.y,u.x)*180/Math.PI-(e.roofAngle||0)+180;if(e.roofFraming)e.roofFraming.angle=2*Math.atan2(u.y,u.x)*180/Math.PI-(e.roofFraming.angle||0);}}})}
function editPreview(){if(editing==='trim'){drawTrimPreview();return;}if(editing==='intersect'&&typeof drawIntersectPreview==='function'){drawIntersectPreview();return;}if(view!=='plan'||!editing||!hover)return;const dx=points.length?hover.x-points[0].x:0,dy=points.length?hover.y-points[0].y:0;if(['move','copy'].includes(editing)&&points.length)for(const e of model.elements.filter(e=>selected.includes(e.id))){const ps=selectionGeometry(e).map(p=>p2({x:p.x+dx,y:p.y+dy}));for(let i=1;i<ps.length;i++)line(ps[i-1],ps[i],'#327861',1.5,[5,3]);if(ps.length>2)line(ps.at(-1),ps[0],'#327861',1.5,[5,3])}if(editing==='mirror'&&points.length)line(p2(points[0]),p2(hover),'#327861',1.5,[8,3]);if(points.length)label(`${editing.toUpperCase()} · ΔX ${fmt(dx)} · ΔY ${fmt(dy)} mm`,25,height-35,10,'#327861','left')}

function fmt(value){return Number(value).toLocaleString('en-US',{maximumFractionDigits:1})}
