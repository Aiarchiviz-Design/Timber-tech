import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {typeColors} from './roof-engine-module.js';
import {memberSolid} from './connection-geometry.js';

function solidGeometry(solid){
  const pos=[];
  if(solid&&Array.isArray(solid.triangles)){
    for(const item of solid.triangles){
      if(!item)continue;
      if(typeof item[0]==='number'){
        if(Number.isFinite(item[0])&&Number.isFinite(item[1])&&Number.isFinite(item[2]))pos.push(item[0],item[1],item[2]);
      }else if(Array.isArray(item[0])){
        for(const p of item){
          if(p&&Number.isFinite(p[0])&&Number.isFinite(p[1])&&Number.isFinite(p[2]))pos.push(p[0],p[1],p[2]);
        }
      }
    }
  }
  const g=new THREE.BufferGeometry();
  if(pos.length>=9&&(pos.length%9)===0){
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.computeVertexNormals();
    g.computeBoundingSphere();
  }else{
    g.setAttribute('position',new THREE.Float32BufferAttribute([],3));
  }
  return g;
}
export class RoofViewer{
  constructor(host,onSelect){
    this.host=host;
    this.onSelect=onSelect;
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color('#f8fafc');
    this.renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    this.renderer.localClippingEnabled=true;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    host.append(this.renderer.domElement);
    this.camera=new THREE.PerspectiveCamera(38,1,.01,1000);
    this.camera.up.set(0,0,1);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);
    this.controls.enableDamping=true;
    this.controls.screenSpacePanning=true;
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x94a3b8,2.2));
    const sun=new THREE.DirectionalLight(0xffffff,2.5);
    sun.position.set(4,-5,12);
    this.scene.add(sun);
    const fill=new THREE.DirectionalLight(0xbfe0ff,1.8);
    fill.position.set(-8,3,4);
    this.scene.add(fill);
    this.root=new THREE.Group();
    this.scene.add(this.root);
    this.rafters=new THREE.Group();
    this.roof=new THREE.Group();
    this.boundaryGroup=new THREE.Group();
    this.draftingGroup=new THREE.Group();
    this.planGridGroup=new THREE.Group();
    this.scene.add(this.rafters,this.roof,this.boundaryGroup,this.draftingGroup,this.planGridGroup);
    this.grid=new THREE.GridHelper(20,40,0x94a3b8,0xe2e8f0);
    this.grid.rotation.x=Math.PI/2;
    this.scene.add(this.grid);
    this.hit=new THREE.Raycaster();
    this.pointer=new THREE.Vector2();
    this.layers={top:true,bottom:true,web:true,rafters:false,roof:false,labels:false,overhang:true,walls:true,floor:true};
    this.cut=new THREE.Plane(new THREE.Vector3(-1,0,0),1000);
    this.objects=[];
    this.labels=[];
    this.selected=null;
    this.mode='iso';
    this.filter='All';
    this.isolate=false;
    this.geometryCache=new Map();
    this.colorMode='type';
    this.planTool='select'; // 'select' | 'draw' | 'pan'
    this.isSpacePan=false;
    this.roofBoundaryPoints=null;
    this.selectedVertexIndex=null;
    this.isBoundarySelected=false;

    this.controls.addEventListener('change',()=>{
      if(this.mode==='plan'){
        this.updatePlanGrid();
        if(this.onPlanViewChange)this.onPlanViewChange();
      }
      this.render();
    });

    // Cursor-centered smooth orthographic wheel zooming in Plan view
    this.renderer.domElement.addEventListener('wheel',e=>{
      if(this.mode!=='plan')return;
      e.preventDefault();
      e.stopPropagation();
      const factor=e.deltaY<0?0.85:1.18;
      this.zoomAtCursor(e.clientX,e.clientY,factor);
    },{passive:false});

    // Spacebar temporary pan
    window.addEventListener('keydown',e=>{
      if(this.mode!=='plan')return;
      if(e.code==='Space'&&!this.isSpacePan){
        const activeTag=document.activeElement?.tagName;
        if(activeTag==='INPUT'||activeTag==='TEXTAREA'||activeTag==='SELECT')return;
        this.isSpacePan=true;
        this.controls.mouseButtons.LEFT=THREE.MOUSE.PAN;
        this.renderer.domElement.style.cursor='grab';
      }
    });
    window.addEventListener('keyup',e=>{
      if(this.mode!=='plan')return;
      if(e.code==='Space'&&this.isSpacePan){
        this.isSpacePan=false;
        this.controls.mouseButtons.LEFT=(this.planTool==='pan')?THREE.MOUSE.PAN:-1;
        this.updateCursor();
      }
    });

    let viewerResizeRaf=null;
    this.resizeObserver=new ResizeObserver(()=>{if(viewerResizeRaf)cancelAnimationFrame(viewerResizeRaf);viewerResizeRaf=requestAnimationFrame(()=>{viewerResizeRaf=null;this.resize();});});
    this.resizeObserver.observe(host);

    let down=null;
    this.renderer.domElement.addEventListener('pointerdown',e=>{
      down=[e.clientX,e.clientY];
      if(this.isSpacePan||this.planTool==='pan'){
        this.renderer.domElement.style.cursor='grabbing';
      }
    });
    this.renderer.domElement.addEventListener('pointerup',e=>{
      if(this.isSpacePan||this.planTool==='pan'){
        this.renderer.domElement.style.cursor='grab';
      }
      if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>10)return;
      if(this.mode==='plan')return; // In plan view, CAD selection handles are used
      const rect=this.renderer.domElement.getBoundingClientRect();
      this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
      this.hit.setFromCamera(this.pointer,this.camera);
      const candidates=[...this.objects.filter(o=>o.visible&&o.userData?.role!=='wall'&&o.userData?.id),...this.labels.filter(l=>l.visible&&l.userData?.id)];
      const hits=this.hit.intersectObjects(candidates,true);
      const validHits=hits.filter(h=>!h.object.isMesh||this.cut.distanceToPoint(h.point)>=0);
      if(!validHits.length)return;
      const targetId=validHits[0].object.userData.id;
      if(targetId)this.onSelect(targetId);
    });
    this.renderer.setAnimationLoop(()=>{this.controls.update();this.render()});
  }
  clear(group){for(const o of [...group.children]){group.remove(o);o.traverse(x=>{if(x.geometry&&!x.userData.cached)x.geometry.dispose();if(x.material){x.material.map?.dispose();x.material.dispose();}});}}
  setModel(source,assembly){this.source=source;this.assembly=assembly;this.clear(this.root);this.clear(this.rafters);this.clear(this.roof);this.clear(this.draftingGroup);this.objects=[];this.labels=[];
  if(!source&&!assembly){this.render();return;}
  if(source&&source.meshes) source.meshes = [];
  if(source&&source.axes)for(const a of source.axes){
    if(!a||!a.a||!a.b||!a.a.every(Number.isFinite)||!a.b.every(Number.isFinite))continue;
    const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a.a),new THREE.Vector3(...a.b)]);
    this.rafters.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0x64748b})));
  }
  if(assembly&&assembly.trusses)for(const t of assembly.trusses){for(let ply=0;ply<t.ply;ply++)for(const [mi,m] of t.members.entries()){
    let geometry;
    if(m.solidTriangles&&m.solidTriangles.length){
      const offset=(ply-(t.ply-1)/2)*.055;
      if(Math.abs(offset)>1e-4){
        const shifted={triangles:m.solidTriangles.map(p=>typeof p[0]==='number'?[p[0],p[1]+offset,p[2]]:p.map(q=>[q[0],q[1]+offset,q[2]]))};
        geometry=solidGeometry(shifted);
      }else{
        geometry=solidGeometry({triangles:m.solidTriangles});
      }
    }else{
      const offset=(ply-(t.ply-1)/2)*.055,solid=memberSolid(t,m,assembly,offset);
      if(solid.hidden||!solid.triangles.length)continue;
      geometry=solidGeometry(solid);
    }
  const mat=new THREE.MeshStandardMaterial({color:typeColors[t.type]||'#b9cad7',metalness:0,roughness:.82,side:THREE.DoubleSide,clippingPlanes:[this.cut]}),mesh=new THREE.Mesh(geometry,mat);mesh.userData={id:t.id,role:m.role,index:mi,cached:false,type:t.type};this.root.add(mesh);this.objects.push(mesh);}
  const can=document.createElement('canvas');can.width=256;can.height=96;const ctx=can.getContext('2d');ctx.clearRect(0,0,256,96);ctx.fillStyle=typeColors[t.type]||'#0284c7';ctx.font='700 44px sans-serif';ctx.textAlign='center';ctx.fillText(t.id,128,63);const tex=new THREE.CanvasTexture(can),label=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false,transparent:true})),mid=t.profile[Math.floor(t.profile.length/2)];label.position.set(mid[0],mid[1],mid[2]+.25);label.scale.set(.65,.24,1);label.userData={id:t.id,type:t.type};this.root.add(label);this.labels.push(label);}
  if(assembly&&assembly.rafters&&assembly.rafters.length){
    this.layers.rafters=true;
    for(const [ri,r] of assembly.rafters.entries()){
      if(!r.solidTriangles||!r.solidTriangles.length)continue;
      const geometry=solidGeometry({triangles:r.solidTriangles});
      const mat=new THREE.MeshStandardMaterial({color:typeColors[r.type]||'#d9b38c',metalness:0,roughness:.82,side:THREE.DoubleSide,clippingPlanes:[this.cut]});
      const mesh=new THREE.Mesh(geometry,mat);
      mesh.userData={id:r.id,role:'rafter',index:ri,cached:false,type:r.type||'Rafter'};
      this.rafters.add(mesh);this.objects.push(mesh);
    }
  }
  if(assembly&&assembly.roofFacets&&assembly.roofFacets.length){
    for(const facet of assembly.roofFacets){
      if(!facet||facet.length<3)continue;
      const pos=[];const p0=facet[0];
      for(let i=1;i<facet.length-1;i++){
        const p1=facet[i],p2=facet[i+1];
        if(p0&&p1&&p2&&Number.isFinite(p0.x)&&Number.isFinite(p0.y)&&Number.isFinite(p0.z)&&
           Number.isFinite(p1.x)&&Number.isFinite(p1.y)&&Number.isFinite(p1.z)&&
           Number.isFinite(p2.x)&&Number.isFinite(p2.y)&&Number.isFinite(p2.z)){
          pos.push(p0.x,p0.y,p0.z,p1.x,p1.y,p1.z,p2.x,p2.y,p2.z);
        }
      }
      if(pos.length<9)continue;
      const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geom.computeVertexNormals();
      const mat=new THREE.MeshStandardMaterial({color:0x94a3b8,roughness:.6,metalness:.1,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide,clippingPlanes:[this.cut]});
      const mesh=new THREE.Mesh(geom,mat);mesh.userData={role:'roof',cached:false,type:'Roof Surface'};
      this.roof.add(mesh);
    }
  }
  if(assembly&&assembly.wallFraming&&assembly.wallFraming.wallAssemblies){
    const studRoleColor=(role)=>{
      const r=String(role||'').toLowerCase();
      if(/corner.*back|drywall-backing/.test(r))return '#06b6d4';
      if(/corner/.test(r))return '#2563eb';
      if(/t-junction-backing|junction.*back/.test(r))return '#14b8a6';
      if(/t-junction|junction/.test(r))return '#4f46e5';
      if(/king/.test(r))return '#eab308';
      if(/jack|trimmer/.test(r))return '#f97316';
      if(/header.*cripple|upper.*cripple|header-cripple/.test(r))return '#a855f7';
      if(/sill.*cripple|lower.*cripple|sill-cripple|cripple/.test(r))return '#ec4899';
      if(/block/.test(r))return '#65a30d';
      if(/header|lintel|beam/.test(r))return '#0284c7';
      if(/very-top-plate|very top plate|cap plate/.test(r))return '#d4944e';
      if(/top-plate|top plate/.test(r))return '#8c5828';
      if(/plate|sill/.test(r))return '#b07d4f';
      if(/stud/.test(r))return '#22c55e';
      return '#22c55e';
    };
    for(const w of assembly.wallFraming.wallAssemblies){
      const wLen=Math.hypot(w.end[0]-w.start[0],w.end[1]-w.start[1])||1;
      const ux=(w.end[0]-w.start[0])/wLen,uy=(w.end[1]-w.start[1])/wLen;
      const tpList=w.topPlates||[];
      const maxTpZ=tpList.length?Math.max(...tpList.map(m=>Math.max(m.a?.[2]??-Infinity,m.b?.[2]??-Infinity))):-Infinity;
      const members=[
        ...(w.bottomPlates||[]).map(m=>({...m,role:m.role||'bottom-plate'})),
        ...tpList.map((m,ti)=>{
          const mz=Math.max(m.a?.[2]??-Infinity,m.b?.[2]??-Infinity);
          const isVeryTop=tpList.length>1&&(Number.isFinite(maxTpZ)?Math.abs(mz-maxTpZ)<1e-3:ti===0);
          return {...m,role:isVeryTop?'very-top-plate':'top-plate'};
        }),
        ...(w.studs||[]).map(m=>({...m,role:m.role||'stud'}))
      ];
      for(const [mi,m] of members.entries()){
        if(!m.a||!m.b||!m.a.every(Number.isFinite)||!m.b.every(Number.isFinite))continue;
        const isVertical=Math.abs(m.b[2]-m.a[2])>Math.hypot(m.b[0]-m.a[0],m.b[1]-m.a[1]);
        const width=m.widthM||.0381,depth=m.depthM||.1397,len=Math.hypot(m.b[0]-m.a[0],m.b[1]-m.a[1],m.b[2]-m.a[2]);
        if(!Number.isFinite(len)||len<1e-3)continue;
        const mColor=m.studColor||studRoleColor(m.role||(isVertical?'stud':'plate'));
        const g=new THREE.BoxGeometry(width,depth,len),vA=new THREE.Vector3(...m.a),vB=new THREE.Vector3(...m.b),center=vA.clone().add(vB).multiplyScalar(0.5);
        const mat=new THREE.MeshStandardMaterial({color:mColor,roughness:0.8,side:THREE.DoubleSide,clippingPlanes:[this.cut]}),mesh=new THREE.Mesh(g,mat);
        mesh.position.copy(center);
        if(isVertical){
          const m4=new THREE.Matrix4().makeBasis(new THREE.Vector3(ux,uy,0),new THREE.Vector3(-uy,ux,0),new THREE.Vector3(0,0,1));
          mesh.quaternion.setFromRotationMatrix(m4);
        }else{
          const m4=new THREE.Matrix4().makeBasis(new THREE.Vector3(-uy,ux,0),new THREE.Vector3(0,0,1),new THREE.Vector3(ux,uy,0));
          mesh.quaternion.setFromRotationMatrix(m4);
        }
        mesh.userData={id:w.id,role:'wall',memberRole:m.role,studColor:mColor,index:mi,cached:false,type:'Wall'};this.root.add(mesh);this.objects.push(mesh);
      }
    }
  }
  const groundZ=(assembly?.base??0)-.1;
  this.grid.position.z=groundZ;this.extent=Math.max(...(source?.bounds?.slice(0,2)||[10,10]),3);this.grid.scale.setScalar(this.extent/12);this.updateVisibility();this.fit();}
  updateVisibility(){for(const o of this.objects){const selected=o.userData.id===this.selected;const memberSel=selected&&(Number.isInteger(this.selectedMemberIndex)&&this.selectedMemberIndex===o.userData.index);const roleKey=o.userData.role==='wall'||['stud','trimmer','header','sill','cripple','corner','plate'].includes(o.userData.role)?'walls':(o.userData.role==='rafter'?'rafters':o.userData.role);o.visible=(this.layers[roleKey]!==false)&&(this.filter==='All'||o.userData.type===this.filter||selected)&&(!this.isolate||selected);o.material.color.set(o.userData.studColor||(this.colorMode==='role'?({top:'#c9ed80',bottom:'#68baff',web:'#d4dde5',overhang:'#edac82',walls:'#f4ba66',floor:'#66b5eb',rafter:'#d9b38c'}[o.userData.role]||'#f4ba66'):(typeColors[o.userData.type]||'#54caba')));if(memberSel){o.material.emissive.set('#eab308');o.material.emissiveIntensity=0.9;}else{o.material.emissive.set(selected?'#25492d':'#000000');o.material.emissiveIntensity=selected?.6:0;}o.material.wireframe=this.colorMode==='wire';}this.rafters.visible=this.layers.rafters&&!this.isolate;this.roof.visible=this.layers.roof&&!this.isolate;for(const label of this.labels)label.visible=this.layers.labels&&(this.filter==='All'||label.userData.type===this.filter||label.userData.id===this.selected)&&(!this.isolate||label.userData.id===this.selected);this.render();}
  select(id, memberIndex = null){this.selected=id;this.selectedMemberIndex=Number.isInteger(memberIndex)?memberIndex:null;this.updateVisibility();}
  resize(){const w=Math.max(1,this.host.clientWidth),h=Math.max(1,this.host.clientHeight);this.renderer.setSize(w,h,false);if(this.camera.isPerspectiveCamera)this.camera.aspect=w/h;else{const size=this.orthoSize||this.extent||10;this.camera.left=-size*w/h/2;this.camera.right=size*w/h/2;this.camera.top=size/2;this.camera.bottom=-size/2;}this.camera.updateProjectionMatrix();this.render();}
  updateCursor(){
    if(this.mode!=='plan'){this.renderer.domElement.style.cursor='default';return;}
    if(this.isSpacePan||this.planTool==='pan'){this.renderer.domElement.style.cursor='grab';}
    else if(this.planTool==='draw'){this.renderer.domElement.style.cursor='crosshair';}
    else{this.renderer.domElement.style.cursor='default';}
  }
  setPlanTool(tool){
    this.planTool=tool;
    if(this.mode==='plan'){
      this.controls.mouseButtons.LEFT=(tool==='pan')?THREE.MOUSE.PAN:-1;
      this.updateCursor();
    }
  }
  setView(mode){
    this.mode = mode;
    this.controls.dispose();
    const isPlan = (mode === 'plan');
    const isIso = (mode === 'iso');

    if (isIso) {
      this.camera = new THREE.PerspectiveCamera(38, 1, .01, 1000);
    } else {
      this.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, isPlan ? -5000 : .01, 5000);
    }

    this.camera.up.set(...(isPlan ? [0, 1, 0] : [0, 0, 1]));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.screenSpacePanning = true;
    this.controls.enableRotate = isIso;
    this.controls.enableZoom = !isPlan;

    if (isPlan) {
      this.grid.visible = false;
      this.planGridGroup.visible = true;
      this.boundaryGroup.visible = true;
      this.draftingGroup.visible = true;
      this.controls.mouseButtons = {
        LEFT: (this.planTool === 'pan') ? THREE.MOUSE.PAN : -1,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      };
      this.updateCursor();
    } else {
      this.grid.visible = true;
      this.planGridGroup.visible = false;
      this.boundaryGroup.visible = false;
      this.draftingGroup.visible = false;
      if (!isIso) {
        this.controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
      }
      this.renderer.domElement.style.cursor = 'default';
    }

    this.controls.addEventListener('change', () => {
      if (this.mode === 'plan') {
        this.updatePlanGrid();
        if (this.onPlanViewChange) this.onPlanViewChange();
      }
      this.render();
    });
    this.fit();
    if (isPlan) {
      this.updatePlanGrid();
      if (this.onPlanViewChange) this.onPlanViewChange();
    }
  }
  fit(){
    let box = new THREE.Box3(), hasPoints = false;
    if (this.assembly?.trusses) {
      for (const t of this.assembly.trusses) {
        if (this.isolate && t.id !== this.selected) continue;
        for (const m of t.members) {
          box.expandByPoint(new THREE.Vector3(...m.a));
          box.expandByPoint(new THREE.Vector3(...m.b));
          hasPoints = true;
        }
      }
    }
    if (this.assembly?.rafters) {
      for (const r of this.assembly.rafters) {
        box.expandByPoint(new THREE.Vector3(...r.a));
        box.expandByPoint(new THREE.Vector3(...r.b));
        hasPoints = true;
      }
    }
    if (this.assembly?.roofFacets && !hasPoints) {
      for (const f of this.assembly.roofFacets) {
        for (const p of f) {
          box.expandByPoint(new THREE.Vector3(p.x, p.y, p.z));
          hasPoints = true;
        }
      }
    }
    if (this.roofBoundaryPoints && this.roofBoundaryPoints.length >= 3) {
      const z = (this.assembly?.base ?? 0);
      for (const p of this.roofBoundaryPoints) {
        box.expandByPoint(new THREE.Vector3(p[0], p[1], z));
        hasPoints = true;
      }
    }
    if (!hasPoints) {
      const ext = this.extent || 10;
      box.min.set(-ext / 2, -ext / 2, -2);
      box.max.set(ext / 2, ext / 2, 3);
    }
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const aspect = Math.max(.2, this.host.clientWidth / this.host.clientHeight);
    this.controls.target.copy(center);

    const isPlan = (this.mode === 'plan');
    if (isPlan) {
      this.orthoSize = Math.max(size.y, size.x / aspect, 4) * 1.35;
      this.camera.up.set(0, 1, 0);
    } else {
      this.orthoSize = Math.max(size.z, size.y, size.x / aspect, 2) * 1.35;
      this.camera.up.set(0, 0, 1);
    }

    const distance = Math.max(size.length() / 2, 5) * 2.2;
    const dirs = {
      iso: [1.15, -1.4, 1],
      plan: [0, 0, 1],
      front: [0, -1, 0],
      side: [1, 0, 0]
    };
    const dir = dirs[this.mode] || dirs.iso;

    this.camera.position.copy(center).add(new THREE.Vector3(...dir).normalize().multiplyScalar(distance));
    this.camera.lookAt(center);
    this.resize();
    this.controls.update();
    if (isPlan) this.updatePlanGrid();
    this.render();
  }
  updatePlanGrid(){
    if(this.mode!=='plan') return;
    this.clear(this.planGridGroup);
    const z=(this.assembly?.base??0)-0.05;
    const w=Math.max(1,this.host.clientWidth), h=Math.max(1,this.host.clientHeight);
    const aspect=w/h;
    const orthoSize=this.orthoSize||10;
    const halfH=orthoSize/2;
    const halfW=(orthoSize*aspect)/2;
    const cx=this.controls?this.controls.target.x:0;
    const cy=this.controls?this.controls.target.y:0;

    let minorStep=1, majorStep=5;
    if(orthoSize<4){ minorStep=0.2; majorStep=1; }
    else if(orthoSize<16){ minorStep=0.5; majorStep=2.5; }
    else if(orthoSize<60){ minorStep=2; majorStep=10; }
    else if(orthoSize<250){ minorStep=10; majorStep=50; }
    else{ minorStep=50; majorStep=250; }

    const spanX=halfW*1.8;
    const spanY=halfH*1.8;
    const xStart=Math.floor((cx-spanX)/minorStep)*minorStep;
    const xEnd=Math.ceil((cx+spanX)/minorStep)*minorStep;
    const yStart=Math.floor((cy-spanY)/minorStep)*minorStep;
    const yEnd=Math.ceil((cy+spanY)/minorStep)*minorStep;

    const minorPts=[];
    const majorPts=[];

    for(let x=xStart; x<=xEnd; x+=minorStep){
      const isMajor=Math.abs(x%majorStep)<1e-4||Math.abs(Math.abs(x%majorStep)-majorStep)<1e-4;
      const pts=isMajor?majorPts:minorPts;
      pts.push(new THREE.Vector3(x,yStart,z), new THREE.Vector3(x,yEnd,z));
    }
    for(let y=yStart; y<=yEnd; y+=minorStep){
      const isMajor=Math.abs(y%majorStep)<1e-4||Math.abs(Math.abs(y%majorStep)-majorStep)<1e-4;
      const pts=isMajor?majorPts:minorPts;
      pts.push(new THREE.Vector3(xStart,y,z), new THREE.Vector3(xEnd,y,z));
    }

    if(minorPts.length>0){
      const gMin=new THREE.BufferGeometry().setFromPoints(minorPts);
      const mMin=new THREE.LineSegments(gMin,new THREE.LineBasicMaterial({color:0xe2e8f0,depthTest:false,transparent:true,opacity:0.85}));
      mMin.renderOrder=1;
      this.planGridGroup.add(mMin);
    }
    if(majorPts.length>0){
      const gMaj=new THREE.BufferGeometry().setFromPoints(majorPts);
      const mMaj=new THREE.LineSegments(gMaj,new THREE.LineBasicMaterial({color:0xcbd5e1,depthTest:false}));
      mMaj.renderOrder=2;
      this.planGridGroup.add(mMaj);
    }

    // Coordinate Axes (X East in red, Y North in green)
    const axisPtsX=[new THREE.Vector3(xStart,0,z+0.001), new THREE.Vector3(xEnd,0,z+0.001)];
    const axisPtsY=[new THREE.Vector3(0,yStart,z+0.001), new THREE.Vector3(0,yEnd,z+0.001)];
    const gAxisX=new THREE.BufferGeometry().setFromPoints(axisPtsX);
    const gAxisY=new THREE.BufferGeometry().setFromPoints(axisPtsY);
    const mAxisX=new THREE.Line(gAxisX,new THREE.LineBasicMaterial({color:0xf87171,depthTest:false}));
    const mAxisY=new THREE.Line(gAxisY,new THREE.LineBasicMaterial({color:0x4ade80,depthTest:false}));
    mAxisX.renderOrder=3;
    mAxisY.renderOrder=3;
    this.planGridGroup.add(mAxisX,mAxisY);

    // Origin (0,0) indicator ring
    const rOrigin=Math.max(0.12, orthoSize*0.012);
    const originRing=new THREE.RingGeometry(rOrigin*0.65, rOrigin, 32);
    const originMat=new THREE.MeshBasicMaterial({color:0x0284c7,side:THREE.DoubleSide,depthTest:false});
    const originMesh=new THREE.Mesh(originRing,originMat);
    originMesh.position.set(0,0,z+0.002);
    originMesh.renderOrder=4;
    this.planGridGroup.add(originMesh);
  }
  zoomAtCursor(clientX, clientY, factor){
    const pWorldBefore=this.getPlanCoordinates(clientX, clientY);
    if(!pWorldBefore) return;

    this.orthoSize=Math.max(0.1, Math.min(20000, (this.orthoSize||10)*factor));
    this.resize();

    const pWorldAfter=this.getPlanCoordinates(clientX, clientY);
    if(pWorldAfter){
      const dx=pWorldBefore[0]-pWorldAfter[0];
      const dy=pWorldBefore[1]-pWorldAfter[1];
      this.camera.position.x+=dx;
      this.camera.position.y+=dy;
      this.controls.target.x+=dx;
      this.controls.target.y+=dy;
    }

    this.updatePlanGrid();
    this.render();
    if(this.onPlanViewChange) this.onPlanViewChange();
  }
  zoomIn(factor=0.8){
    const rect=this.renderer.domElement.getBoundingClientRect();
    this.zoomAtCursor(rect.left+rect.width/2, rect.top+rect.height/2, factor);
  }
  zoomOut(factor=1.25){
    const rect=this.renderer.domElement.getBoundingClientRect();
    this.zoomAtCursor(rect.left+rect.width/2, rect.top+rect.height/2, factor);
  }
  zoomFit(){
    this.fit();
    if(this.onPlanViewChange) this.onPlanViewChange();
  }
  zoomOrigin(){
    if(this.controls){
      const z=(this.assembly?.base??0);
      this.controls.target.set(0, 0, z);
      this.camera.position.set(0, 0, z+50);
      this.controls.update();
      this.updatePlanGrid();
      this.render();
      if(this.onPlanViewChange) this.onPlanViewChange();
    }
  }
  getZoomPercentage(){
    const defaultExtent = Math.max(...(this.source?.bounds?.slice(0, 2) || [14, 8.5]), 10);
    const current = this.orthoSize || 10;
    return Math.round((defaultExtent / current) * 100);
  }
  section(value){this.cut.constant=value>=100?1000:((value/100)-.5)*(this.source?.bounds[0]||10);this.render();}
  render(){if(this.renderer&&this.camera)this.renderer.render(this.scene,this.camera);}
  getPlanCoordinates(clientX, clientY){
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    const groundZ = (this.assembly?.base ?? 0);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -groundZ);
    const target = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(plane, target);
    if (!hit) return null;
    return [target.x, target.y];
  }
  clearRoofBoundary(){
    this.roofBoundaryPoints = null;
    this.selectedVertexIndex = null;
    this.isBoundarySelected = false;
    this.clear(this.boundaryGroup);
    this.render();
  }
  renderRoofBoundary(points, selectedVertexIndex = null, isSelected = true, formatDimFn = null){
    this.clear(this.boundaryGroup);
    this.roofBoundaryPoints = points;
    this.selectedVertexIndex = selectedVertexIndex;
    this.isBoundarySelected = isSelected;
    if(!points || points.length < 3){ this.render(); return; }

    const z = (this.assembly?.base ?? 0) + 0.15;
    const validPts = points.filter(p => p && Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if(validPts.length < 3){ this.render(); return; }

    // 1. Semi-transparent boundary fill
    const shape = new THREE.Shape();
    shape.moveTo(validPts[0][0], validPts[0][1]);
    for(let i=1; i<validPts.length; i++) shape.lineTo(validPts[i][0], validPts[i][1]);
    shape.closePath();
    const geom = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({
      color: isSelected ? 0x38bdf8 : 0x94a3b8,
      transparent: true,
      opacity: isSelected ? 0.22 : 0.1,
      side: THREE.DoubleSide,
      depthTest: false
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.z = z;
    mesh.renderOrder = 8000;
    this.boundaryGroup.add(mesh);

    // 2. Crisp CAD perimeter outline
    const linePts = validPts.map(p => new THREE.Vector3(p[0], p[1], z + 0.02));
    linePts.push(new THREE.Vector3(validPts[0][0], validPts[0][1], z + 0.02));
    const gLine = new THREE.BufferGeometry().setFromPoints(linePts);
    const mLine = new THREE.LineBasicMaterial({
      color: isSelected ? 0x0284c7 : 0x64748b,
      linewidth: isSelected ? 3 : 2,
      depthTest: false
    });
    const outline = new THREE.Line(gLine, mLine);
    outline.renderOrder = 8001;
    this.boundaryGroup.add(outline);

    // 3. Clickable corner vertex handles
    const cRadius = Math.max(0.18, (this.orthoSize || 10) * 0.015);
    const circGeo = new THREE.CircleGeometry(cRadius, 20);
    const haloGeo = new THREE.CircleGeometry(cRadius * 1.35, 20);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false });

    const selSet = Array.isArray(selectedVertexIndex)
      ? new Set(selectedVertexIndex)
      : (selectedVertexIndex instanceof Set ? selectedVertexIndex : (Number.isInteger(selectedVertexIndex) ? new Set([selectedVertexIndex]) : new Set()));

    for(let i=0; i<validPts.length; i++){
      const isSel = selSet.has(i);
      const isStart = (i === 0);
      const col = isSel ? 0xf59e0b : (isStart ? 0x16a34a : 0x0284c7);
      const vMat = new THREE.MeshBasicMaterial({ color: col, depthTest: false });

      // Halo ring for contrast
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(validPts[i][0], validPts[i][1], z + 0.03);
      halo.renderOrder = 8002;
      this.boundaryGroup.add(halo);

      const vMesh = new THREE.Mesh(circGeo, vMat);
      vMesh.position.set(validPts[i][0], validPts[i][1], z + 0.04);
      vMesh.renderOrder = 8003;
      vMesh.userData = { vertexIndex: i };
      this.boundaryGroup.add(vMesh);
    }

    // 4. Edge dimension tags
    if(formatDimFn){
      for(let i=0; i<validPts.length; i++){
        const pA = validPts[i];
        const pB = validPts[(i + 1) % validPts.length];
        const dist = Math.hypot(pB[0] - pA[0], pB[1] - pA[1]);
        if(dist < 0.1) continue;
        const mid = [(pA[0] + pB[0]) / 2, (pA[1] + pB[1]) / 2];

        const can = document.createElement('canvas');
        can.width = 384;
        can.height = 76;
        const ctx = can.getContext('2d');
        ctx.fillStyle = isSelected ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)';
        ctx.strokeStyle = isSelected ? '#0284c7' : '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(8, 8, 368, 60, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#38bdf8' : '#0f172a';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatDimFn(dist), 192, 38);

        const tex = new THREE.CanvasTexture(can);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
        sprite.position.set(mid[0], mid[1], z + 0.18);
        const spriteScale = Math.max(1.1, (this.orthoSize || 10) * 0.085);
        sprite.scale.set(spriteScale * 2.2, spriteScale * 0.55, 1);
        sprite.renderOrder = 8005;
        this.boundaryGroup.add(sprite);
      }
    }
    this.render();
  }
  hitTestVertex(clientX, clientY, hitRadiusM = null){
    if(!this.roofBoundaryPoints || !this.roofBoundaryPoints.length) return null;
    const coords = this.getPlanCoordinates(clientX, clientY);
    if(!coords) return null;
    const thresh = hitRadiusM || Math.max(0.35, (this.orthoSize || 10) * 0.035);
    for(let i=0; i<this.roofBoundaryPoints.length; i++){
      const p = this.roofBoundaryPoints[i];
      if(p && Math.hypot(coords[0] - p[0], coords[1] - p[1]) <= thresh){
        return i;
      }
    }
    return null;
  }
  hitTestBoundary(clientX, clientY){
    if(!this.roofBoundaryPoints || this.roofBoundaryPoints.length < 3) return false;
    const coords = this.getPlanCoordinates(clientX, clientY);
    if(!coords) return false;
    const pts = this.roofBoundaryPoints;

    // Check inside polygon
    let inside = false;
    for(let i=0, j=pts.length-1; i<pts.length; j=i++){
      const a = pts[i], b = pts[j];
      if(((a[1] > coords[1]) !== (b[1] > coords[1])) && (coords[0] < (b[0] - a[0]) * (coords[1] - a[1]) / (b[1] - a[1]) + a[0])){
        inside = !inside;
      }
    }
    if(inside) return true;

    // Check near perimeter edge
    const thresh = Math.max(0.4, (this.orthoSize || 10) * 0.04);
    for(let i=0; i<pts.length; i++){
      const a = pts[i], b = pts[(i+1)%pts.length];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const lenSq = dx * dx + dy * dy;
      if(lenSq < 1e-6) continue;
      const t = Math.max(0, Math.min(1, ((coords[0] - a[0]) * dx + (coords[1] - a[1]) * dy) / lenSq));
      const projX = a[0] + t * dx, projY = a[1] + t * dy;
      if(Math.hypot(coords[0] - projX, coords[1] - projY) <= thresh){
        return true;
      }
    }
    return false;
  }
  renderMarqueeBox(p1, p2){
    this.clear(this.draftingGroup);
    if(!p1 || !p2) return;
    const minX = Math.min(p1[0], p2[0]);
    const maxX = Math.max(p1[0], p2[0]);
    const minY = Math.min(p1[1], p2[1]);
    const maxY = Math.max(p1[1], p2[1]);
    const z = (this.assembly?.base ?? 0) + 0.2;

    const boxPts = [
      new THREE.Vector3(minX, minY, z),
      new THREE.Vector3(maxX, minY, z),
      new THREE.Vector3(maxX, maxY, z),
      new THREE.Vector3(minX, maxY, z),
      new THREE.Vector3(minX, minY, z)
    ];

    const shape = new THREE.Shape();
    shape.moveTo(minX, minY);
    shape.lineTo(maxX, minY);
    shape.lineTo(maxX, maxY);
    shape.lineTo(minX, maxY);
    shape.closePath();

    const geom = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthTest: false
    });
    const fillMesh = new THREE.Mesh(geom, mat);
    fillMesh.position.z = z;
    fillMesh.renderOrder = 9990;
    this.draftingGroup.add(fillMesh);

    const gLine = new THREE.BufferGeometry().setFromPoints(boxPts);
    const mLine = new THREE.LineDashedMaterial({
      color: 0x2563eb,
      dashSize: 0.4,
      gapSize: 0.2,
      depthTest: false
    });
    const line = new THREE.Line(gLine, mLine);
    line.computeLineDistances();
    line.renderOrder = 9991;
    this.draftingGroup.add(line);

    this.render();
  }
  clearMarqueeBox(){
    this.clear(this.draftingGroup);
    this.render();
  }
  hitTestVerticesInBox(p1, p2){
    if(!this.roofBoundaryPoints || !this.roofBoundaryPoints.length || !p1 || !p2) return [];
    const minX = Math.min(p1[0], p2[0]);
    const maxX = Math.max(p1[0], p2[0]);
    const minY = Math.min(p1[1], p2[1]);
    const maxY = Math.max(p1[1], p2[1]);

    const hitIndices = [];
    for(let i=0; i<this.roofBoundaryPoints.length; i++){
      const p = this.roofBoundaryPoints[i];
      if(p && p[0] >= minX && p[0] <= maxX && p[1] >= minY && p[1] <= maxY){
        hitIndices.push(i);
      }
    }
    return hitIndices;
  }
  clearDrafting(){this.clear(this.draftingGroup);this.render();}
  renderDraftingPreview(points, candidate = null, formatDimFn = null, activeDirInfo = null){
    this.clear(this.draftingGroup);
    this.draftingGroup.renderOrder = 9999;
    if (!points || (!points.length && !candidate)) { this.render(); return; }

    const allPts = [...points];
    if (candidate) allPts.push(candidate);
    const z = (this.assembly?.base ?? 0) + 1.2;

    const linePts = [];
    for (const p of points) {
      if (p && Number.isFinite(p[0]) && Number.isFinite(p[1])) linePts.push(new THREE.Vector3(p[0], p[1], z));
    }
    if (candidate && Number.isFinite(candidate[0]) && Number.isFinite(candidate[1])) {
      linePts.push(new THREE.Vector3(candidate[0], candidate[1], z));
    }
    if (points.length >= 3 && !candidate && points[0] && Number.isFinite(points[0][0]) && Number.isFinite(points[0][1])) {
      linePts.push(new THREE.Vector3(points[0][0], points[0][1], z));
    }

    if (linePts.length >= 2) {
      const gLine = new THREE.BufferGeometry().setFromPoints(linePts);
      const mLine = new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 3, depthTest: false });
      const mainLine = new THREE.Line(gLine, mLine);
      mainLine.renderOrder = 9999;
      this.draftingGroup.add(mainLine);

      if (candidate && points.length >= 2 && Number.isFinite(candidate[0]) && Number.isFinite(candidate[1]) && points[0] && Number.isFinite(points[0][0]) && Number.isFinite(points[0][1])) {
        const gClose = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(candidate[0], candidate[1], z),
          new THREE.Vector3(points[0][0], points[0][1], z)
        ]);
        const mClose = new THREE.LineDashedMaterial({ color: 0x16a34a, dashSize: .8, gapSize: .4, depthTest: false });
        const cl = new THREE.Line(gClose, mClose);
        cl.computeLineDistances();
        cl.renderOrder = 9999;
        this.draftingGroup.add(cl);
      }
    }

    const cRadius = Math.max(0.18, (this.orthoSize || 10) * 0.015);
    const circGeo = new THREE.CircleGeometry(cRadius, 20);
    const circMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide, depthTest: false });
    const firstCircMat = new THREE.MeshBasicMaterial({ color: 0x16a34a, side: THREE.DoubleSide, depthTest: false });
    const candCircMat = new THREE.MeshBasicMaterial({ color: 0xeab308, side: THREE.DoubleSide, depthTest: false });

    for (let i = 0; i < points.length; i++) {
      const mesh = new THREE.Mesh(circGeo, i === 0 ? firstCircMat : circMat);
      mesh.position.set(points[i][0], points[i][1], z + 0.05);
      mesh.renderOrder = 9999;
      this.draftingGroup.add(mesh);
    }
    if (candidate) {
      const mesh = new THREE.Mesh(circGeo, candCircMat);
      mesh.position.set(candidate[0], candidate[1], z + 0.05);
      mesh.renderOrder = 9999;
      this.draftingGroup.add(mesh);
    }

    if (formatDimFn) {
      const segs = [];
      for (let i = 0; i < points.length - 1; i++) segs.push([points[i], points[i + 1]]);
      if (candidate && points.length > 0) segs.push([points.at(-1), candidate]);
      else if (points.length >= 3) segs.push([points.at(-1), points[0]]);

      for (let si = 0; si < segs.length; si++) {
        const [pA, pB] = segs[si];
        const dist = Math.hypot(pB[0] - pA[0], pB[1] - pA[1]);
        if (dist < 0.05) continue;
        const mid = [(pA[0] + pB[0]) / 2, (pA[1] + pB[1]) / 2];

        const isCurrentActive = (candidate && si === segs.length - 1);
        const can = document.createElement('canvas');
        can.width = 384;
        can.height = 80;
        const ctx = can.getContext('2d');

        ctx.fillStyle = isCurrentActive ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)';
        ctx.strokeStyle = isCurrentActive ? '#0284c7' : '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(8, 8, 368, 64, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCurrentActive ? '#38bdf8' : '#0f172a';
        ctx.font = 'bold 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelText = formatDimFn(dist);
        ctx.fillText(labelText, 192, 40);

        const tex = new THREE.CanvasTexture(can);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
        sprite.position.set(mid[0], mid[1], z + 0.35);
        const spriteScale = Math.max(1.2, (this.orthoSize || 10) * 0.09);
        sprite.scale.set(spriteScale * 2.2, spriteScale * 0.55, 1);
        sprite.renderOrder = 10000;
        this.draftingGroup.add(sprite);
      }
    }

    const validPts = allPts.filter(p => p && Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (validPts.length >= 3) {
      const shape = new THREE.Shape();
      shape.moveTo(validPts[0][0], validPts[0][1]);
      for (let i = 1; i < validPts.length; i++) shape.lineTo(validPts[i][0], validPts[i][1]);
      shape.closePath();
      const geom = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: .22, side: THREE.DoubleSide, depthTest: false });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.z = z - 0.05;
      mesh.renderOrder = 9998;
      this.draftingGroup.add(mesh);
    }
    this.render();
  }
  dispose(){this.renderer.setAnimationLoop(null);this.resizeObserver.disconnect();this.controls.dispose();for(const g of [this.root,this.rafters,this.roof,this.boundaryGroup,this.draftingGroup,this.planGridGroup])this.clear(g);this.geometryCache.forEach(g=>g.dispose());this.renderer.dispose();}
}
