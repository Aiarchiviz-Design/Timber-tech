// Standalone helpers for the roof engine. Extracted VERBATIM from Atelier BIM Studio (joins.js, app.js, camera.js,
// framing.js, advanced.js) so the roof files run without the rest of the app.
// Host contract: the host application must provide a global `model` = { stories:[{id,elevation,height}], elements:[roof elements] }.
const JOIN_EPS = 0.001;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y), lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
var viewportCut={enabled:false,axis:'x',position:0}; // 3D cutting plane; keep enabled:false if you have no section tool

function cross2(a,b){return a.x*b.y-a.y*b.x}
function sub2(a,b){return {x:a.x-b.x,y:a.y-b.y}}
function area2(ps){return ps.reduce((s,p,i)=>s+cross2(p,ps[(i+1)%ps.length]),0)/2}
function cleanPolygon(ps){const out=[];for(const p of ps)if(!out.length||distance(p,out.at(-1))>JOIN_EPS)out.push(p);if(out.length>1&&distance(out[0],out.at(-1))<JOIN_EPS)out.pop();return out.length>=3&&Math.abs(area2(out))>.01?(area2(out)<0?out.reverse():out):[]}
function axisIntersection(a,b,c,d){const u=sub2(b,a),v=sub2(d,c),det=cross2(u,v);if(Math.abs(det)<1e-8*Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y))return null;const t=cross2(sub2(c,a),v)/det,s=cross2(sub2(c,a),u)/det;return {point:lerp(a,b,t),t,s}}
function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return {distance:distance(p,lerp(a,b,t)),t,point:lerp(a,b,t)}}
function inside(p,ps){let yes=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++){let a=ps[i],b=ps[j];if(((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x))yes=!yes}return yes}
function storyOf(e){return model.stories.find(s=>s.id===e.story)||model.stories[0]}
function heightOf(e){if(e.type==='roof'&&e.followStory)return storyOf(e).height+(e.roofOffset||0);if(e.type==='wall'&&e.followStory){const home=storyOf(e),top=model.stories.find(s=>s.id===e.topStory);return Math.max(10,(top?top.elevation:home.elevation+home.height)+(e.topOffset||0)-wallBase(e))}return e.followStory?storyOf(e).height:e.height||3000}
function wallBase(w){return storyOf(w).elevation+(w.baseOffset||0)}
function isCutFace(ps){return viewportCut.enabled&&ps.every(p=>Math.abs(p[viewportCut.axis]-viewportCut.position)<.01)}
function surfaceNormal(ps){if(!ps||ps.length<3)return {x:0,y:0,z:1};const a=ps[0],b=ps[1],c=ps[2],u={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},v={x:c.x-b.x,y:c.y-b.y,z:c.z-b.z},n={x:u.y*v.z-u.z*v.y,y:u.z*v.x-u.x*v.z,z:u.x*v.y-u.y*v.x},len=Math.hypot(n.x,n.y,n.z)||1;return {x:n.x/len,y:n.y/len,z:n.z/len}}
