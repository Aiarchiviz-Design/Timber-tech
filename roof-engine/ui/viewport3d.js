/* Atelier 3D viewport - the CadTech viewer, fed by Atelier's own model.

   Same recipe as CadTech's RoofViewer (viewer.js): Three.js WebGL scene, pale #f8fafc background, 38 degree perspective camera,
   OrbitControls with damping (drag = orbit, right-drag / Shift-drag = pan, wheel = zoom), hemisphere + sun + fill lights,
   MeshStandard lumber (roughness .82) coloured per truss family / member role, translucent slate walls with edge lines, a fine
   ground grid, click-to-select by raycast, display layers (top chords, bottom chords, webs, wall framing, roof surface, truss IDs)
   and the TOP / FRONT / right orthographic views.

   Geometry comes from solidModel() (projectedFaces[].world, in mm, Z up), so every existing feature keeps working: the 3D clipping
   plane (already applied inside solidModel), story visibility, layers, roof framing, wall framing, selection.  World Y is mirrored
   into Three's Y (plan Y points down the sheet, Three is right-handed) so views match Atelier's 2D plans.

   If WebGL or this module is unavailable, window.cadtechViewport is never set and Atelier falls back to renderer.js. */
import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';

const MM=.001;
const FAMILY={Common:'#bfe96e',Stepdown:'#54caba',Girder:'#ffba67','Front jack':'#66afff','Side jack':'#b9a0ff','Hip carrier':'#ee91b9',Unclassified:'#c4ced7'}; // CadTech typeColors
const ROLE={top:'#c9ed80',bottom:'#68baff',web:'#d4dde5'};                                                                                            // CadTech role colours
const STUD_CATEGORIES=[
  ['common','#22c55e','Common Stud'],
  ['king','#eab308','King Stud'],
  ['jack','#f97316','Jack / Trimmer'],
  ['crippleTop','#a855f7','Header Cripple'],
  ['crippleBot','#ec4899','Sill Cripple'],
  ['corner','#2563eb','Corner Pack'],
  ['cornerBack','#06b6d4','Corner Backing'],
  ['junction','#4f46e5','T-Junction Stud'],
  ['junctionBack','#14b8a6','Junction Backing'],
  ['custom','#d946ef','Custom / Break Stud'],
  ['collision','#dc2626','Colliding Stud'],
  ['block','#65a30d','Blocking'],
  ['header','#0284c7','Header / Lintel'],
  ['veryTopPlate','#d4944e','Very Top Plate'],
  ['topPlate','#8c5828','Top Plate'],
  ['plate','#b07d4f','Bottom Plate & Sill']
];
const studColorOf=u=>{
  if(u?.studColor)return u.studColor;
  if(typeof window!=='undefined'&&typeof window.getWallMemberCategoryInfo==='function'){
    const info=window.getWallMemberCategoryInfo({role:u?.memberRole,type:u?.memberType,customSize:u?.customSize,collision:u?.collision});
    if(info?.color||info?.hex)return info.color||info.hex;
  }
  const r=String(u?.memberRole||u?.memberType||'').toLowerCase(),t=String(u?.memberType||'').toLowerCase();
  if(u?.collision)return '#dc2626';
  if(/very top plate|cap plate|upper top plate|very-top-plate/.test(r))return '#d4944e';
  if(/^top plate$/.test(t)||/top plate|top-plate/.test(r))return '#8c5828';
  if(u?.customSize||/extra stud|break stud/.test(r))return '#d946ef';
  if(/corner backing/.test(r))return '#06b6d4';
  if(/corner pack|corner stud|^corner/.test(r))return '#2563eb';
  if(/inside junction backing|junction backing/.test(r))return '#14b8a6';
  if(/t-junction|cross-junction|junction stud/.test(r))return '#4f46e5';
  if(/king stud|^king/.test(r))return '#eab308';
  if(/jack stud|trimmer/.test(r))return '#f97316';
  if(/header stud|upper cripple|header cripple/.test(r))return '#a855f7';
  if(/lower cripple|sill cripple|cripple/.test(r))return '#ec4899';
  if(/block/.test(r))return '#65a30d';
  if(/header|lintel|beam/.test(r))return '#0284c7';
  if(/plate|sill/.test(r)||/plate|sill/.test(t))return '#b07d4f';
  return '#22c55e';
};
const familyOf=t=>/^Common/.test(t)?'Common':/^Front jack/.test(t)?'Front jack':/^Side jack/.test(t)?'Side jack':/^Hip carrier/.test(t)?'Hip carrier':/^Hip truss/.test(t)?'Stepdown':/^(Girder|Junction)/.test(t)?'Girder':'Unclassified';
const roleOf=t=>/top chord/.test(t)?'top':/bottom chord/.test(t)?'bottom':'web';
const SHADED={ // CadTech wall / roof palette
  wall:{c:'#94a3b8',o:.86,edge:'#334155',eo:.55},window:{c:'#84bfd0',o:.5,edge:'#334155',eo:.4},door:{c:'#b08968',o:1,edge:'#5b4636',eo:.5},
  slab:{c:'#cbd5e1',o:1,edge:'#64748b',eo:.5},beam:{c:'#7b8b99',o:1,edge:'#334155',eo:.5},column:{c:'#7b8b99',o:1,edge:'#334155',eo:.5},
  roof:{c:'#aebbc8',o:1,edge:'#64748b',eo:.5},other:{c:'#cbd5e1',o:1,edge:'#64748b',eo:.45}};

/* Ear-clipping triangulation of a planar 3D polygon (convex or concave). Returns vertex indices, 3 per triangle. */
function triangulate(P){
  const n=P.length;if(n<3)return [];
  let nx=0,ny=0,nz=0;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];nx+=(a.y-b.y)*(a.z+b.z);ny+=(a.z-b.z)*(a.x+b.x);nz+=(a.x-b.x)*(a.y+b.y)}
  const ax=Math.abs(nx),ay=Math.abs(ny),az=Math.abs(nz);if(Math.max(ax,ay,az)<1e-14)return [];
  const q=P.map(p=>ax>=ay&&ax>=az?{x:p.y,y:p.z}:ay>=az?{x:p.z,y:p.x}:{x:p.x,y:p.y});
  let area=0;for(let i=0;i<n;i++){const a=q[i],b=q[(i+1)%n];area+=a.x*b.y-b.x*a.y}
  if(Math.abs(area)<1e-14)return [];
  const sign=area>0?1:-1,idx=[...Array(n).keys()],out=[],inTri=(p,a,b,c)=>{const d1=(p.x-b.x)*(a.y-b.y)-(a.x-b.x)*(p.y-b.y),d2=(p.x-c.x)*(b.y-c.y)-(b.x-c.x)*(p.y-c.y),d3=(p.x-a.x)*(c.y-a.y)-(c.x-a.x)*(p.y-a.y);return !((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0))};
  let guard=0;
  while(idx.length>3&&guard++<96){
    let clipped=false;
    for(let k=0;k<idx.length;k++){
      const i0=idx[(k+idx.length-1)%idx.length],i1=idx[k],i2=idx[(k+1)%idx.length],a=q[i0],b=q[i1],c=q[i2];
      if(((b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x))*sign<=1e-14)continue;
      let empty=true;for(const j of idx){if(j===i0||j===i1||j===i2)continue;if(inTri(q[j],a,b,c)){empty=false;break}}
      if(empty){out.push(i0,i1,i2);idx.splice(k,1);clipped=true;break}
    }
    if(!clipped)break;
  }
  if(idx.length===3)out.push(idx[0],idx[1],idx[2]);else for(let k=1;k+1<idx.length;k++)out.push(idx[0],idx[k],idx[k+1]);
  return out;
}

class Viewport3D{
  constructor(area,canvas2d){
    this.area=area;this.canvas2d=canvas2d;this.enabled=true;this.sig=null;this.needs=true;this.visible=false;
    this.layers={walls:true,top:true,bottom:true,web:true,roof:false,labels:false};this.colorMode='family';
    this.renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    const dom=this.dom=this.renderer.domElement;dom.id='viewport3d';dom.className='viewport3d';dom.style.display='none';canvas2d.after(dom);
    dom.addEventListener('webglcontextlost',e=>{e.preventDefault();this.enabled=false;this.hide();window.render?.()});
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#f8fafc');
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x94a3b8,2.2));
    const sun=new THREE.DirectionalLight(0xffffff,2.5);sun.position.set(4,-5,12);this.scene.add(sun);
    const fill=new THREE.DirectionalLight(0xbfe0ff,1.8);fill.position.set(-8,3,4);this.scene.add(fill);
    this.root=new THREE.Group();this.labels=new THREE.Group();this.surface=new THREE.Group();this.scene.add(this.root,this.labels,this.surface);
    this.grid=new THREE.GridHelper(20,40,0x94a3b8,0xe2e8f0);this.grid.rotation.x=Math.PI/2;this.scene.add(this.grid);
    this.persp=new THREE.PerspectiveCamera(38,1,.05,3000);this.ortho=new THREE.OrthographicCamera(-10,10,10,-10,.05,3000);
    this.persp.up.set(0,0,1);this.ortho.up.set(0,0,1);this.camera=this.persp;this.orthoSize=20;
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.wrote={orbit:NaN,tilt:NaN,scale:NaN};this.proj='perspective';this.fitPending=true;
    this.makeControls();this.makeAxes();this.makeDisplayPanel();
    let down=null;
    dom.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY,e.button]);
    dom.addEventListener('pointerup',e=>{if(!down||down[2]!==0||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;this.pick(e)});
    let vpResizeRaf=null;
    this.resizeObserver=new ResizeObserver(()=>{if(vpResizeRaf)cancelAnimationFrame(vpResizeRaf);vpResizeRaf=requestAnimationFrame(()=>{vpResizeRaf=null;this.resize();});});this.resizeObserver.observe(area);
    this.renderer.setAnimationLoop(()=>{if(!this.visible)return;const moved=this.controls.update();if(moved||this.needs){this.needs=false;this.draw()}});
  }
  /* ---------- camera ---------- */
  makeControls(){
    this.controls?.dispose();
    const c=this.controls=new OrbitControls(this.camera,this.dom);c.enableDamping=true;c.screenSpacePanning=true;
    c.addEventListener('change',()=>{this.needs=true;this.writeLegacy(true)});
    this.applyRotateLock();
  }
  applyRotateLock(){
    const preset=sceneCamera.preset||'isometric',rotate=preset==='isometric'||preset==='custom';
    this.controls.enableRotate=rotate;this.controls.mouseButtons.LEFT=rotate?THREE.MOUSE.ROTATE:THREE.MOUSE.PAN;
  }
  /* OrbitControls caches camera.up when it is created, so a change between Z-up and the top-down Y-up view needs fresh controls (CadTech does the same per mode). */
  ensureUp(d){
    const want=Math.abs(d.z)>.995?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1);
    if(this.camera.up.distanceToSquared(want)<1e-9)return;
    const t=this.controls.target.clone();this.camera.up.copy(want);this.makeControls();this.controls.target.copy(t);
  }
  direction(){const t=this.controls.target,p=this.camera.position;return new THREE.Vector3().subVectors(p,t).normalize()}
  /* Atelier orbit/tilt describe the direction from target to camera as (sin o cos t, cos o cos t, sin t); Three's Y is mirrored. */
  writeLegacy(fromUser=false,force=false){
    if(this.applying&&!force)return; // programmatic camera moves fire OrbitControls 'change' before the new direction is in place
    const d=this.direction(),tilt=Math.asin(Math.max(-1,Math.min(1,d.z))),orbit=Math.abs(d.z)>.99999?(this.wrote.orbit||0):Math.atan2(d.x,-d.y);
    if(fromUser&&sceneCamera&&sceneCamera.preset!=='custom'&&(Math.abs(orbit-this.wrote.orbit)>1e-3||Math.abs(tilt-this.wrote.tilt)>1e-3)&&this.controls.enableRotate){sceneCamera.preset='custom';window.cameraUI?.()}
    this.wrote={orbit,tilt,scale:1};window.setLegacyCamera?.(orbit,tilt,1);
  }
  setDirection(orbit,tilt){
    const t=this.controls.target,dist=this.camera.position.distanceTo(t)||10,d=new THREE.Vector3(Math.sin(orbit)*Math.cos(tilt),-Math.cos(orbit)*Math.cos(tilt),Math.sin(tilt));
    this.ensureUp(d);this.camera.position.copy(t).addScaledVector(d,dist);this.camera.lookAt(t);this.controls.update();this.wrote={orbit,tilt,scale:1};
  }
  dolly(factor){ // factor > 1 moves closer
    if(this.camera.isOrthographicCamera){this.camera.zoom=Math.max(.01,this.camera.zoom*factor);this.camera.updateProjectionMatrix()}
    else{const t=this.controls.target;this.camera.position.sub(t).multiplyScalar(1/factor).add(t)}
    this.controls.update();
  }
  switchProjection(kind){
    const old=this.camera,next=kind==='orthographic'?this.ortho:this.persp,t=this.controls.target.clone(),dist=old.position.distanceTo(t)||10;
    next.up.copy(old.up);next.position.copy(old.position);next.lookAt(t);
    if(next.isOrthographicCamera){next.zoom=1;this.orthoSize=2*dist*Math.tan(19*Math.PI/180);this.sizeOrtho()}
    this.camera=next;this.proj=kind;this.makeControls();this.controls.target.copy(t);this.controls.update();this.resize();
  }
  sizeOrtho(){const w=Math.max(1,this.area.clientWidth),h=Math.max(1,this.area.clientHeight),s=this.orthoSize;this.ortho.left=-s*w/h/2;this.ortho.right=s*w/h/2;this.ortho.top=s/2;this.ortho.bottom=-s/2;this.ortho.updateProjectionMatrix()}
  resize(){
    const w=Math.max(1,this.area.clientWidth),h=Math.max(1,this.area.clientHeight);this.renderer.setSize(w,h,false);
    this.persp.aspect=w/h;this.persp.updateProjectionMatrix();this.sizeOrtho();this.needs=true;
  }
  contentBox(){const box=new THREE.Box3();for(const o of this.root.children)if(o.visible)box.expandByObject(o);if(box.isEmpty())box.set(new THREE.Vector3(-3,-3,0),new THREE.Vector3(3,3,3));return box}
  fit(){
    const box=this.contentBox(),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),aspect=Math.max(.2,this.area.clientWidth/Math.max(1,this.area.clientHeight));
    const preset=sceneCamera.preset||'isometric',dir=this.direction().lengthSq()?this.direction():new THREE.Vector3(-.577,-.577,.577);
    const dist=Math.max(size.length()/2,1)*.86/Math.sin(Math.atan(Math.tan(19*Math.PI/180)*Math.min(1,aspect))); // CadTech's fit x0.73: its margin left roofs small
    this.controls.target.copy(center);
    this.controls.target.copy(center);this.ensureUp(dir);this.camera.position.copy(center).addScaledVector(dir,dist);this.camera.lookAt(center);
    this.orthoSize=(preset==='top'?Math.max(size.y,size.x/aspect):preset==='front'?Math.max(size.z,size.x/aspect):preset==='right'?Math.max(size.z,size.y/aspect):size.length()*.75/Math.min(1,aspect))*1.2||10;
    this.camera.zoom=1;this.sizeOrtho();
    this.camera.near=Math.max(.05,dist/500);this.camera.far=dist*20+size.length()*4;this.camera.updateProjectionMatrix();
    this.controls.update();this.writeLegacy(false,true);this.needs=true;
  }
  requestFit(){this.fitPending=true}
  /* ---------- scene ---------- */
  clear(group){for(const o of [...group.children]){group.remove(o);o.traverse(x=>{x.geometry?.dispose();if(x.material){x.material.map?.dispose();x.material.dispose()}})}}
  signature(){
    const cut={...(viewportCut||{})};delete cut.panelOpen;
    try{return JSON.stringify([view,model.elements,model.stories,layers.map(l=>l.visible),activeStory,cut,sceneCamera.style==='xray'])}catch(e){return String(Math.random())}
  }
  rebuild(faces){
    this.clear(this.root);this.clear(this.labels);this.clear(this.surface);
    const byId=new Map(model.elements.map(e=>[e.id,e])),groups=new Map(),assemblies=new Map();
    for(const f of faces){
      if(!f.world||f.world.length<3)continue;
      const el=byId.get(f.id),mt=f.memberType||'',mRole=f.memberRole||mt||'',sCol=f.studColor||'',key=`${f.id}|${mt}|${mRole}|${sCol}|${f.cutSurface?1:0}|${f.timberMember?1:0}|${f.customSize?1:0}|${f.collision?1:0}`;
      let g=groups.get(key);if(!g){g={id:f.id,wallId:f.wallId,isStud:!!f.isStud,customSize:f.customSize,collision:!!f.collision,memberRole:mRole,studCategory:f.studCategory,studCategoryLabel:f.studCategoryLabel,studColor:sCol,type:el?.type||'other',material:el?.material,memberType:mt,timber:!!f.timberMember,cut:!!f.cutSurface,pos:[]};groups.set(key,g)}
      const P=f.world.map(p=>({x:p.x*MM,y:-p.y*MM,z:p.z*MM}));
      for(const i of triangulate(P))g.pos.push(P[i].x,P[i].y,P[i].z);
      if(f.assembly&&/top chord/.test(mt)){const a=assemblies.get(f.assembly)||{n:0,x:0,y:0,zmax:-Infinity,type:mt};for(const p of P){a.n++;a.x+=p.x;a.y+=p.y;a.zmax=Math.max(a.zmax,p.z)}assemblies.set(f.assembly,a)}
    }
    for(const g of groups.values()){
      if(!g.pos.length)continue;
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(g.pos,3));geo.computeVertexNormals();geo.computeBoundingSphere();
      const mat=new THREE.MeshStandardMaterial({color:'#cbd5e1',roughness:.82,metalness:g.timber?0:.06,side:THREE.DoubleSide}),mesh=new THREE.Mesh(geo,mat);
      const isRoofTruss = Boolean(g.assembly || (!g.wallId && !g.isStud && /(top chord|bottom chord|truss|hip carrier|stepdown|\bweb\b)/i.test(g.memberType)));
      const isWallFraming = Boolean(g.timber && (g.wallId || g.isStud || g.type === 'wall' || !isRoofTruss));
      mesh.userData={id:g.id,wallId:g.wallId,isStud:g.isStud,customSize:g.customSize,collision:g.collision,memberRole:g.memberRole,studCategory:g.studCategory,studCategoryLabel:g.studCategoryLabel,studColor:g.studColor,type:g.type,material:g.material,memberType:g.memberType,timber:g.timber,cut:g.cut,role:g.timber?(isWallFraming?'wallFraming':(g.memberType?roleOf(g.memberType):'web')):'element',family:g.memberType?familyOf(g.memberType):'Unclassified',wallFraming:isWallFraming};
      this.root.add(mesh);
    }
    // truss ID labels (CadTech "Truss IDs")
    for(const [id,a] of assemblies){
      const can=document.createElement('canvas');can.width=256;can.height=96;const c=can.getContext('2d');c.fillStyle=FAMILY[familyOf(a.type)]||'#0284c7';c.strokeStyle='#ffffffcc';c.lineWidth=7;c.font='700 40px sans-serif';c.textAlign='center';
      const text=id.split('-').slice(-2).join('-');c.strokeText(text,128,60);c.fillText(text,128,60);
      const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(can),depthTest:false,transparent:true}));s.position.set(a.x/a.n,a.y/a.n,a.zmax+.3);s.scale.set(.9,.34,1);s.userData={label:true};this.labels.add(s);
    }
    // optional translucent roof surface (CadTech "Roof surface")
    if(view==='framing3d')for(const e of model.elements.filter(e=>e.type==='roof'&&shown(e))){
      try{for(const poly of roofGeometry(e).faces){const P=poly.map(p=>({x:p.x*MM,y:-p.y*MM,z:p.z*MM})),pos=[];for(const i of triangulate(P))pos.push(P[i].x,P[i].y,P[i].z);if(!pos.length)continue;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.computeVertexNormals();this.surface.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x84bfd0,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false})))}}catch(err){}
    }
    const box=this.contentBox(),size=box.getSize(new THREE.Vector3()),ext=Math.max(size.x,size.y,6);
    const cell=ext>60?5:ext>24?2:1,span=Math.ceil(ext*3/cell/2)*2*cell;this.scene.remove(this.grid);this.grid.geometry.dispose();
    this.grid=new THREE.GridHelper(span,span/cell,0x94a3b8,0xe2e8f0);this.grid.rotation.x=Math.PI/2;this.grid.position.set((box.min.x+box.max.x)/2,(box.min.y+box.max.y)/2,box.min.z-.01);this.scene.add(this.grid);
  }
  restyle(){
    const sel=new Set(selected||[]),style=sceneCamera.style,L=this.layers,mode=this.colorMode;
    for(const m of this.root.children){
      const u=m.userData,mat=m.material;let color,opacity=1,edge=null,wire=false,vis=true;
      if(u.timber){
        if(u.wallFraming){vis=L.walls;color=mode==='timber'?(/very top plate|cap plate/i.test(u.memberRole)?'#d4944e':/^top plate$/i.test(u.memberType)?'#8c5828':/plate|sill/i.test(u.memberType)?'#b07d4f':'#c3945a'):studColorOf(u);edge='#1e293b';wire=mode==='wire'}
        else{vis=L[u.role]!==false;color=mode==='role'?ROLE[u.role]:mode==='timber'?'#c3945a':FAMILY[u.family]||'#54caba';wire=mode==='wire'}
        if(u.cut)color='#b58a5b';
      }else{
        const p=SHADED[u.type]||SHADED.other;color=p.c;opacity=p.o;edge=p.edge;
        if(style==='materials'){const cols=(materials||{})[u.material];if(cols)color=cols[0];if(u.type==='window'||u.material==='Glass'){color='#9fc2c8';opacity=.5}}
        if(u.cut)color='#e2e8f0';
      }
      if(style==='hiddenline'){color='#ffffff';edge='#475569';opacity=1}
      if(style==='xray'){opacity=Math.min(opacity,.3);edge=edge||'#64748b'}
      m.visible=vis;mat.color.set(color);mat.wireframe=wire;
      const wantT=opacity<1;if(mat.transparent!==wantT){mat.transparent=wantT;mat.needsUpdate=true}mat.opacity=opacity;mat.depthWrite=style!=='xray'&&!(u.type==='window'&&!u.timber);
      const on=sel.has(u.id);mat.emissive.set(on?'#2f9e63':'#000000');mat.emissiveIntensity=on?.5:0;
      // edge lines: CadTech draws them on walls; Atelier also on slabs/openings and category-colored studs.
      const wantEdge=!!edge||(u.timber&&style==='hiddenline');let line=m.userData.edges;
      if(wantEdge&&!line){line=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry,u.timber?30:18),new THREE.LineBasicMaterial({color:'#334155',transparent:true,opacity:.55}));m.add(line);m.userData.edges=line}
      if(line){line.visible=wantEdge&&vis;if(wantEdge){line.material.color.set(edge||'#475569');line.material.opacity=style==='hiddenline'?.9:(u.wallFraming?.38:(SHADED[u.type]?.eo??.5))}}
    }
    this.labels.visible=L.labels&&view==='framing3d';this.surface.visible=L.roof&&view==='framing3d';
  }
  syncCamera(){
    const sc=sceneCamera;
    this.applying=true;
    try{
      const wantO=orbit,wantT=tilt;
      if(this.proj!==sc.projection)this.switchProjection(sc.projection);
      if(Math.abs(wantO-this.wrote.orbit)>1e-6||Math.abs(wantT-this.wrote.tilt)>1e-6){this.setDirection(wantO,wantT);window.setLegacyCamera?.(wantO,wantT,1)}
      if(this.fitPending){this.fitPending=false;this.fit()}
      else if(Math.abs(scale-1)>1e-9){this.dolly(scale);window.setLegacyCamera?.(this.wrote.orbit,this.wrote.tilt,1)}
      this.applyRotateLock();
    }finally{this.applying=false}
  }
  /* Called from draw3D().  Returns true when this viewport drew the frame. */
  sync(){
    if(!this.enabled)return false;
    if(!this.visible){this.visible=true;this.dom.style.display='block';this.panel.hidden=false;this.fitPending=true;this.resize()}
    this.panel.hidden=view!=='framing3d';this.hint.hidden=false;
    const sig=this.signature();
    if(sig!==this.sig){const keep=this.sig!==null;solidModel();this.rebuild(projectedFaces);this.sig=sig;if(!keep||this.viewAtBuild!==view){this.fitPending=true}this.viewAtBuild=view}
    this.restyle();this.syncCamera();this.needs=true;this.draw();return true;
  }
  hide(){if(!this.visible)return;this.visible=false;this.dom.style.display='none';this.panel.hidden=true;this.hint.hidden=true}
  draw(){
    const r=this.renderer,w=this.area.clientWidth,h=this.area.clientHeight;
    r.render(this.scene,this.camera);
    // axis gizmo, bottom-left (Atelier's X / Y / Z triad)
    const s=Math.round(Math.min(96,Math.min(w,h)*.2)),x=24,y=76;r.autoClear=false;r.setScissorTest(true);r.setViewport(x,y,s,s);r.setScissor(x,y,s,s);r.clearDepth();
    this.axCam.position.copy(this.direction()).multiplyScalar(5.4);this.axCam.up.copy(this.camera.up);this.axCam.lookAt(0,0,0);r.render(this.axScene,this.axCam);
    r.setScissorTest(false);r.setViewport(0,0,w,h);r.autoClear=true;
  }
  makeAxes(){
    this.axScene=new THREE.Scene();this.axCam=new THREE.PerspectiveCamera(30,1,.1,20);
    const add=(dir,hex,text)=>{this.axScene.add(new THREE.ArrowHelper(dir,new THREE.Vector3(),1.15,hex,.28,.16));const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#'+hex.toString(16).padStart(6,'0');g.font='700 44px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,32,34);
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.position.copy(dir).multiplyScalar(1.55);sp.scale.set(.55,.55,1);this.axScene.add(sp)};
    add(new THREE.Vector3(1,0,0),0xb8857e,'X');add(new THREE.Vector3(0,-1,0),0x769777,'Y');add(new THREE.Vector3(0,0,1),0x7e9bac,'Z');
  }
  /* ---------- picking ---------- */
  pick(e){
    const rect=this.dom.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    this.raycaster.setFromCamera(this.pointer,this.camera);
    const hits=this.raycaster.intersectObjects(this.root.children.filter(o=>o.visible),false).filter(h=>!(h.object.userData.type==='window'&&sceneCamera.style!=='xray'&&h.object.material.opacity<.9&&false));
    const id=hits[0]?.object.userData.id;
    if(id){if(e.shiftKey&&selected?.length){const next=selected.includes(id)?selected.filter(x=>x!==id):[...selected,id];window.select(next)}else window.select([id])}
    else if(!e.shiftKey&&selected?.length)window.select([]);
  }
  /* ---------- CadTech-style display panel ---------- */
  makeDisplayPanel(){
    const p=this.panel=document.createElement('div');p.className='cad-display';p.hidden=true;
    const studLegendHtml=STUD_CATEGORIES.map(([,hex,label])=>`<div style="display:flex;align-items:center;gap:5px;font-size:10px;line-height:1.25;color:#334155"><span style="width:9px;height:9px;border-radius:2px;background:${hex};border:1px solid rgba(15,23,42,0.22);flex-shrink:0"></span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label}</span></div>`).join('');
    p.innerHTML=`<div class="cad-display-title">DISPLAY LAYERS</div><div class="cad-display-layers">`+
      [['top','Top chords'],['bottom','Bottom chords'],['web','Webs & posts'],['walls','Wall framing'],['roof','Roof surface'],['labels','Truss IDs']].map(([k,t])=>`<label><input type="checkbox" data-layer3d="${k}" ${this.layers[k]?'checked':''}>${t}</label>`).join('')+
      `</div><label class="cad-display-color">Color<select data-color3d><option value="family">Stud Category & Truss Family</option><option value="role">Stud Category & Member Role</option><option value="timber">Natural timber</option><option value="wire">Wireframe</option></select></label>`+
      `<div style="margin-top:8px;padding-top:6px;border-top:1px solid #e2e8f0"><div class="cad-display-title" style="margin-bottom:4px">STUD CATEGORIES</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 8px">${studLegendHtml}</div></div>`;
    this.area.append(p);
    p.addEventListener('change',e=>{const t=e.target;if(t.dataset.layer3d){this.layers[t.dataset.layer3d]=t.checked;this.restyle();this.needs=true}else if(t.dataset.color3d!==undefined){this.colorMode=t.value;this.restyle();this.needs=true}});
    const hint=this.hint=document.createElement('div');hint.className='vp3d-hint';hint.hidden=true;hint.textContent='Drag to orbit · right-drag or Shift-drag to pan · scroll to zoom';this.area.append(hint);
  }
}

function boot(){
  const area=document.getElementById('canvas-area'),canvas=document.getElementById('canvas');
  if(!area||!canvas||window.cadtechViewport)return;
  try{
    const probe=document.createElement('canvas');if(!(probe.getContext('webgl2')||probe.getContext('webgl')))throw Error('WebGL unavailable');
    window.cadtechViewport=new Viewport3D(area,canvas);
    if(typeof isModelView==='function'&&isModelView())window.render?.();
  }catch(err){console.warn('CadTech-style 3D viewport unavailable, using the built-in renderer:',err.message)}
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot()}
export {Viewport3D,triangulate};
