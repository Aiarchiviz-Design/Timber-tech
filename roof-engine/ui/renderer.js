/* Opaque 3D solid renderer.

   v3.19: boards were drawn back-to-front by the AVERAGE depth of each polygon (painter's algorithm).  That cannot order long
   thin faces correctly: a 9 m chord and a 0.3 m post, or two trusses whose webs cross, get an arbitrary order, so members looked
   interwoven and their outlines swept across each other in curves.  Opaque views now use the GPU depth buffer: every pixel shows
   the nearest surface, edges are depth-tested against it, and cost is independent of canvas size (no JS per-pixel loops, so the
   old freeze on large framing models cannot return).  If WebGL is unavailable the previous painter path is used unchanged. */
let solidOwners=null,solidDepth=null,solidBufferWidth=0,solidBufferHeight=0;
let glState=null,glFrame=false;
const glColors=new Map();
function glParseColor(s){
  let c=glColors.get(s);if(c)return c;
  let r=0,g=0,b=0,a=1,m;
  if((m=/^#([0-9a-f]{3,8})$/i.exec(s))){let h=m[1];if(h.length<=4)h=[...h].map(x=>x+x).join('');r=parseInt(h.slice(0,2),16);g=parseInt(h.slice(2,4),16);b=parseInt(h.slice(4,6),16);if(h.length===8)a=parseInt(h.slice(6,8),16)/255}
  else if((m=/^rgba?\(([^)]+)\)$/i.exec(s))){const v=m[1].split(',').map(Number);r=v[0];g=v[1];b=v[2];if(v.length>3)a=v[3]}
  c=[r/255*a,g/255*a,b/255*a,a];glColors.set(s,c);return c;
}
function glInit(){
  if(glState!==null)return glState;
  glState=false;
  try{
    if(typeof document==='undefined'||typeof WebGLRenderingContext==='undefined')return glState;
    const c=document.createElement('canvas'),gl=c.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,depth:true});
    if(!gl)return glState;
    const vs=`attribute vec3 p;attribute vec4 col;uniform vec2 vp;uniform float persp,D,zA,zB,dMin,dMax;varying vec4 vc;
      void main(){float w=persp>.5?max(D*.12,D-p.z):1.0;
        float zc=persp>.5?(zA*w+zB):(2.0*(dMax-p.z)/max(dMax-dMin,1.0)-1.0);
        vec2 n=vec2(p.x/vp.x*2.0-1.0,1.0-p.y/vp.y*2.0);gl_Position=vec4(n*w,zc,w);vc=col;}`;
    const fs=`precision mediump float;varying vec4 vc;void main(){gl_FragColor=vc;}`;
    const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(o));return o};
    const prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));
    const u={};for(const n of ['vp','persp','D','zA','zB','dMin','dMax'])u[n]=gl.getUniformLocation(prog,n);
    glState={c,gl,prog,u,buf:gl.createBuffer(),aP:gl.getAttribLocation(prog,'p'),aC:gl.getAttribLocation(prog,'col')};
  }catch(e){glState=false;if(typeof console!=='undefined')console.warn('WebGL renderer unavailable, using painter fallback:',e.message)}
  return glState;
}
function glPointInTriangle(p,a,b,c){
  const d1=(p.x-b.x)*(a.y-b.y)-(a.x-b.x)*(p.y-b.y),d2=(p.x-c.x)*(b.y-c.y)-(b.x-c.x)*(p.y-c.y),d3=(p.x-a.x)*(c.y-a.y)-(c.x-a.x)*(p.y-a.y);
  return !((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0));
}
/* Ear-clipping triangulation of a projected polygon (convex or concave); returns vertex indices, 3 per triangle. */
function glTriangulate(pts){
  const n=pts.length;if(n<3)return [];
  let area=0;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];area+=a.x*b.y-b.x*a.y}
  if(Math.abs(area)<1e-9)return [];
  const sign=area>0?1:-1,idx=[...Array(n).keys()],out=[];let guard=0;
  while(idx.length>3&&guard++<64){
    let clipped=false;
    for(let k=0;k<idx.length;k++){
      const i0=idx[(k+idx.length-1)%idx.length],i1=idx[k],i2=idx[(k+1)%idx.length],a=pts[i0],b=pts[i1],c=pts[i2];
      if(((b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x))*sign<=1e-9)continue;
      let empty=true;for(const j of idx){if(j===i0||j===i1||j===i2)continue;if(glPointInTriangle(pts[j],a,b,c)){empty=false;break}}
      if(empty){out.push(i0,i1,i2);idx.splice(k,1);clipped=true;break}
    }
    if(!clipped)break;
  }
  if(idx.length===3)out.push(idx[0],idx[1],idx[2]);else for(let k=1;k+1<idx.length;k++)out.push(idx[0],idx[k],idx[k+1]);
  return out;
}
function glFaceEdgeColor(f){
  if(sceneCamera.style==='hiddenline')return '#68746d';
  return selected.includes(f.id)?'#4f7e5e':(view==='framing3d'?'#76563a':'#788078');
}
function glDrawSolids(faces){
  const g=glInit();if(!g)return false;
  const gl=g.gl,W=canvas.width,H=canvas.height;
  if(!W||!H||gl.isContextLost())return false;
  if(g.c.width!==W||g.c.height!==H){g.c.width=W;g.c.height=H}
  const persp=sceneCamera.projection==='perspective',D=sceneCamera.distance;
  let dMin=Infinity,dMax=-Infinity;
  for(const f of faces)for(const p of f.points){if(p.depth<dMin)dMin=p.depth;if(p.depth>dMax)dMax=p.depth}
  if(!Number.isFinite(dMin)){dMin=0;dMax=1}
  dMin-=1;dMax+=1;
  // perspective depth: z_ndc = zA + zB / w, with w = eye distance (small = near); affine in screen space, so interpolation is exact
  const wNear=Math.max(D*.12,D-dMax),wFar=Math.max(wNear+1,D-dMin),zB=2/(1/wFar-1/wNear),zA=1-zB/wFar;
  const tri=[],lin=[];
  const pushV=(arr,p,c)=>arr.push(p.x,p.y,p.depth,c[0],c[1],c[2],c[3]);
  for(const f of faces){
    const pts=f.points;if(!pts||pts.length<3)continue;
    const fill=glParseColor(sceneCamera.style==='hiddenline'?'#f8faf7':shadedSurface(f)),ts=f._tri&&f._triFor===pts?f._tri:(f._tri=glTriangulate(pts),f._triFor=pts,f._tri);
    for(const i of ts)pushV(tri,pts[i],fill);
    const edge=glParseColor(glFaceEdgeColor(f));
    if(!f.wallSurface)for(let i=0;i<pts.length;i++){pushV(lin,pts[i],edge);pushV(lin,pts[(i+1)%pts.length],edge)}
    for(const e of f.featureEdges||[]){const c=glParseColor(e.selected?'#4f7e5e':glFaceEdgeColor(f));pushV(lin,e.a,c);pushV(lin,e.b,c)}
  }
  gl.viewport(0,0,W,H);gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.useProgram(g.prog);
  gl.uniform2f(g.u.vp,width,height);gl.uniform1f(g.u.persp,persp?1:0);gl.uniform1f(g.u.D,D);gl.uniform1f(g.u.zA,zA);gl.uniform1f(g.u.zB,zB);gl.uniform1f(g.u.dMin,dMin);gl.uniform1f(g.u.dMax,dMax);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  gl.bindBuffer(gl.ARRAY_BUFFER,g.buf);gl.enableVertexAttribArray(g.aP);gl.enableVertexAttribArray(g.aC);
  const draw=(data,mode)=>{if(!data.length)return;gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STREAM_DRAW);gl.vertexAttribPointer(g.aP,3,gl.FLOAT,false,28,0);gl.vertexAttribPointer(g.aC,4,gl.FLOAT,false,28,12);gl.drawArrays(mode,0,data.length/7)};
  gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.5,1.5);draw(tri,gl.TRIANGLES);gl.disable(gl.POLYGON_OFFSET_FILL);
  draw(lin,gl.LINES);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(g.c,0,0);ctx.restore();
  return true;
}
function drawOpaqueSolids(faces){
  solidOwners=null;solidDepth=null;glFrame=false;
  if(glDrawSolids(faces)){glFrame=true;solidBufferWidth=Math.ceil(width);solidBufferHeight=Math.ceil(height);return}
  // Fallback painter: faces arrive sorted back-to-front by mean depth (approximate for long members).
  for(const f of faces){
    const fill=sceneCamera.style==='hiddenline'?'#f8faf7':shadedSurface(f);
    const edge=sceneCamera.style==='hiddenline'?'#68746d':(selected.includes(f.id)?'#4f7e5e':(view==='framing3d'?'#76563a':'#788078'));
    poly(f.points,fill,f.wallSurface?null:edge,view==='framing3d'?.45:.65);
    for(const e of f.featureEdges||[]) line(e.a,e.b,e.selected?'#4f7e5e':edge,e.selected?1:.65);
  }
  solidBufferWidth=Math.ceil(width);solidBufferHeight=Math.ceil(height);
}
/* Depth of face f under screen point p (larger = nearer the camera), or null if p is outside f. Perspective uses 1/w, which is
   affine across a projected planar polygon. */
function faceDepthAt(f,p){
  const pts=f.points;if(!pts||pts.length<3)return null;
  const ts=f._tri&&f._triFor===pts?f._tri:(f._tri=glTriangulate(pts),f._triFor=pts,f._tri),D=sceneCamera.distance,persp=sceneCamera.projection==='perspective';
  for(let k=0;k<ts.length;k+=3){
    const a=pts[ts[k]],b=pts[ts[k+1]],c=pts[ts[k+2]];if(!glPointInTriangle(p,a,b,c))continue;
    const den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(den)<1e-12)return a.depth;
    const l1=((b.y-c.y)*(p.x-c.x)+(c.x-b.x)*(p.y-c.y))/den,l2=((c.y-a.y)*(p.x-c.x)+(a.x-c.x)*(p.y-c.y))/den,l3=1-l1-l2;
    const q=v=>persp?1/Math.max(D*.12,D-v.depth):v.depth;
    return l1*q(a)+l2*q(b)+l3*q(c);
  }
  return null;
}
function pickSolid(p){
  // Nearest surface under the cursor. Faces without depth data fall back to draw order (front-most last).
  let best=null,bestDepth=-Infinity;
  for(let i=projectedFaces.length-1;i>=0;i--){
    const f=projectedFaces[i];if(!f.points)continue;
    const d=f.points.every(q=>Number.isFinite(q.depth))?faceDepthAt(f,p):null;
    if(d!==null&&Number.isFinite(d)){if(d>bestDepth){bestDepth=d;best=f}}
    else if(!best&&inside(p,f.points))return f;
  }
  return best;
}
