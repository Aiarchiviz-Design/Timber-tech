// CadTech Wall Framing PRO — advanced detailing, corner junctions, T-intersection backing, DXF elevations and QA.
// Geometry units are metres. Advanced panelization, corner backing, cripple studs, anchor bolts & DXF export.
const IN=0.0254, FT=0.3048, n=v=>Number(v)||0, r=v=>Math.round(v*10000)/10000;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function wallLength(w){return Math.hypot(w.end[0]-w.start[0],w.end[1]-w.start[1])||0;}
function pointAt(w,d){const L=wallLength(w)||1;return [w.start[0]+(w.end[0]-w.start[0])*d/L,w.start[1]+(w.end[1]-w.start[1])*d/L];}
function shifted(member,dx,dy,id,role){return {...member,id,a:[member.a[0]+dx,member.a[1]+dy,member.a[2]],b:[member.b[0]+dx,member.b[1]+dy,member.b[2]],role:role||member.role};}
function horizontal(w,id,a,b,z,role,offset=0){const L=wallLength(w)||1,nx=-(w.end[1]-w.start[1])/L,ny=(w.end[0]-w.start[0])/L,p=pointAt(w,a),q=pointAt(w,b);return{id,a:[p[0]+nx*offset,p[1]+ny*offset,z],b:[q[0]+nx*offset,q[1]+ny*offset,z],section:w.section,role,widthM:w.sectionDepthM,depthM:w.sectionWidthM};}
function vertical(w,id,d,z0,z1,role,offset=0){const L=wallLength(w)||1,nx=-(w.end[1]-w.start[1])/L,ny=(w.end[0]-w.start[0])/L,p=pointAt(w,d);return{id,a:[p[0]+nx*offset,p[1]+ny*offset,z0],b:[p[0]+nx*offset,p[1]+ny*offset,z1],section:w.section,role,widthM:w.sectionWidthM,depthM:w.sectionDepthM};}

export function cleanupWallCornerJunctions(framing){
 const walls = framing.wallAssemblies || [];
 for(const w of walls){
  if(Array.isArray(w.topPlates)&&w.topPlates.length>=2){
   w.topPlates[0].role = w.topPlates[0].role || 'very-top-plate';
   w.topPlates[1].role = w.topPlates[1].role || 'top-plate';
  }
 }
 for(let i=0; i<walls.length; i++){
  for(let j=0; j<walls.length; j++){
   if(i === j) continue;
   const w1 = walls[i], w2 = walls[j];
   if(w1.story !== w2.story) continue;
   const L1 = wallLength(w1);
   const u1x = L1 > 1e-4 ? (w1.end[0]-w1.start[0])/L1 : 1, u1y = L1 > 1e-4 ? (w1.end[1]-w1.start[1])/L1 : 0;
   const half2 = (n(w2.sectionDepthM) || 0.14) / 2;
   
   // 1. Check L-Corner connections (endpoints of w1 meeting endpoints of w2)
   for(const k1 of ['start', 'end']){
    for(const k2 of ['start', 'end']){
     const p1 = w1[k1], p2 = w2[k2];
     const dist = Math.hypot(p1[0]-p2[0], p1[1]-p2[1]);
     if(dist < 0.25){ // Within 250mm corner join tolerance
      w1.cornerCleaned = true;
      w2.cornerCleaned = true;
      w1[k1][0] = p2[0]; w1[k1][1] = p2[1];
      if(Array.isArray(w1.topPlates) && w1.topPlates.length >= 2){
       const vt = w1.topPlates[0], tp = w1.topPlates[1];
       const through = String(w1.id).localeCompare(String(w2.id)) < 0;
       const vtThrough = !through;
       const endKey = k1 === 'start' ? 'a' : 'b';
       const dirSign = k1 === 'start' ? -1 : 1;
       const tpShift = through ? (dirSign * half2) : (-dirSign * half2);
       const vtShift = vtThrough ? (dirSign * half2) : (-dirSign * half2);
       tp[endKey] = [p2[0] + u1x * tpShift, p2[1] + u1y * tpShift, tp[endKey][2]];
       vt[endKey] = [p2[0] + u1x * vtShift, p2[1] + u1y * vtShift, vt[endKey][2]];
      }
     }
    }
   }

   // 2. Check T-Junction perpendicular intersection connections (endpoint of w1 meeting mid-span of w2)
   for(const k1 of ['start', 'end']){
    const p1 = w1[k1];
    const L2 = wallLength(w2);
    if(L2 < 0.1) continue;
    const dx = p1[0]-w2.start[0], dy = p1[1]-w2.start[1];
    const u2x = (w2.end[0]-w2.start[0])/L2, u2y = (w2.end[1]-w2.start[1])/L2;
    const along = dx*u2x + dy*u2y;
    if(along > 0.1 && along < L2 - 0.1){
     const perpDist = Math.abs(dx*(-u2y) + dy*u2x);
     if(perpDist < 0.25){ // Perpendicular T-intersection
      w1.tJunctionCleaned = true;
      w2.tJunctionCleaned = true;
      // Snap endpoint of w1 to w2 axis
      w1[k1][0] = w2.start[0] + along*u2x;
      w1[k1][1] = w2.start[1] + along*u2y;
      if(Array.isArray(w1.topPlates) && w1.topPlates.length >= 2){
       const vt = w1.topPlates[0], tp = w1.topPlates[1];
       const endKey = k1 === 'start' ? 'a' : 'b';
       const dirSign = k1 === 'start' ? -1 : 1;
       const tpShift = -dirSign * half2;
       const vtShift = dirSign * half2;
       tp[endKey] = [w1[k1][0] + u1x * tpShift, w1[k1][1] + u1y * tpShift, tp[endKey][2]];
       vt[endKey] = [w1[k1][0] + u1x * vtShift, w1[k1][1] + u1y * vtShift, vt[endKey][2]];
      }
      
      // Add T-junction perpendicular backing stud pack to w2 at intersection
      if(!w2.studs) w2.studs = [];
      const zTop = n(w2.heightM)||2.44;
      const backerExists = w2.studs.some(m => m.role === 't-junction-backing' && Math.hypot(m.a[0]-w1[k1][0], m.a[1]-w1[k1][1]) < 0.05);
      if(!backerExists){
       w2.studs.push({
        id: `${w2.id}-TJ-BACKER-${w1.id}`,
        a: [w1[k1][0], w1[k1][1], 0],
        b: [w1[k1][0], w1[k1][1], zTop],
        section: w2.section,
        role: 't-junction-backing',
        widthM: w2.sectionWidthM,
        depthM: w2.sectionDepthM
       });
      }
     }
    }
   }
  }
 }
 return framing;
}

export function applyWallDetailing(framing, options={}){
 const o={
   headerPlies:2,
   jackStuds:1,
   blockingSpacingFt:4,
   sheathing:true,
   sheetWidthFt:4,
   sheetHeightFt:8,
   braceMode:'none',
   cornerMode:'california',
   cripples:true,
   anchorSpacingFt:6,
   maxPanelFt:16,
   ...options
 };
 cleanupWallCornerJunctions(framing);

 const plyCount=Math.max(1,Math.min(4,Math.round(n(o.headerPlies)||2))),
       jackCount=Math.max(1,Math.min(3,Math.round(n(o.jackStuds)||1))),
       blockM=Math.max(0.6,(n(o.blockingSpacingFt)||4)*FT),
       sheetW=Math.max(2,(n(o.sheetWidthFt)||4)*FT),
       sheetH=Math.max(2,(n(o.sheetHeightFt)||8)*FT),
       anchorM=Math.max(1,(n(o.anchorSpacingFt)||6)*FT),
       maxPanelM=Math.max(2,(n(o.maxPanelFt)||16)*FT);

 for(const w of framing.wallAssemblies||[]){
  const base=w.studs||[], additions=[], openings=w.openings||[], L=wallLength(w), 
        thk=Math.max(.0254,n(w.sectionDepthM)||.089), 
        plyOffset=Math.max(.0127,n(w.sectionWidthM)||.0381),
        wallH=n(w.heightM)||2.44;

  for(const h of base.filter(m=>m.role==='header')){
   for(let p=1;p<plyCount;p++){
    const off=(p-(plyCount-1)/2)*plyOffset;
    const nx=-(w.end[1]-w.start[1])/L, ny=(w.end[0]-w.start[0])/L;
    additions.push(shifted(h,nx*off,ny*off,`${h.id}-PLY${p+1}`,'header-ply'));
   }
  }

  for(const m of base.filter(m=>m.role==='trimmer')){
   for(let p=1;p<jackCount;p++){
    const off=p*plyOffset;
    const nx=-(w.end[1]-w.start[1])/L, ny=(w.end[0]-w.start[0])/L;
    additions.push(shifted(m,nx*off,ny*off,`${m.id}-J${p+1}`,'jack-stud'));
   }
  }

  openings.forEach((op,i)=>{
   if(op.type==='window'&&n(op.sill)>thk*2){
    const sillZ=n(op.sill);
    // Double rough sill plates under window rough opening
    additions.push(horizontal(w,`${w.id}-SILL1-${i+1}`,op.a,op.b,sillZ-thk,'double-sill'));
    additions.push(horizontal(w,`${w.id}-SILL2-${i+1}`,op.a,op.b,sillZ-thk*2,'double-sill'));
    for(const [side,d] of [['L',op.a],['R',op.b]]){
     additions.push(vertical(w,`${w.id}-SILL-JACK-${i+1}-${side}`,d,thk,sillZ-thk*2,'sill-jack'));
    }
   }
   if(o.cripples){
    const studSpacing=w.spacingM||(w.framing?.spacing?w.framing.spacing/1000:0.4);
    const headZ=n(op.head)||2.1;
    if(headZ < wallH - thk*2){
     const hLeft = Math.max(0, op.a - jackCount * plyOffset);
     const hRight = Math.min(L, op.b + jackCount * plyOffset);
     additions.push(vertical(w,`${w.id}-HCAL-L-${i+1}`,hLeft,headZ,wallH-thk*2,'header-cripple'));
     if(hRight - thk > hLeft + thk + 0.01){
      additions.push(vertical(w,`${w.id}-HCAL-R-${i+1}`,hRight-thk,headZ,wallH-thk*2,'header-cripple'));
     }
     for(let cx=hLeft+studSpacing; cx<hRight-thk-0.05; cx+=studSpacing){
      additions.push(vertical(w,`${w.id}-HCAL-${i+1}-${r(cx)}`,cx,headZ,wallH-thk*2,'header-cripple'));
     }
    }
    const sillZ=n(op.sill)||0.9;
    if(op.type==='window'&&sillZ>thk*2){
     additions.push(vertical(w,`${w.id}-SCAL-L-${i+1}`,op.a,thk,sillZ-thk*2,'sill-cripple'));
     if(op.b - thk > op.a + thk + 0.01){
      additions.push(vertical(w,`${w.id}-SCAL-R-${i+1}`,op.b-thk,thk,sillZ-thk*2,'sill-cripple'));
     }
     for(let cx=op.a+studSpacing; cx<op.b-thk-0.05; cx+=studSpacing){
      additions.push(vertical(w,`${w.id}-SCAL-${i+1}-${r(cx)}`,cx,thk,sillZ-thk*2,'sill-cripple'));
     }
    }
   }
  });

  if(o.cornerMode==='california'||o.cornerMode==='u-corner'){
   for(const c of base.filter(m=>m.role==='corner')){
    const nx=-(w.end[1]-w.start[1])/L, ny=(w.end[0]-w.start[0])/L;
    additions.push({
     id:`${c.id}-BACKER`,
     a:[c.a[0]+nx*plyOffset*1.5, c.a[1]+ny*plyOffset*1.5, c.a[2]],
     b:[c.b[0]+nx*plyOffset*1.5, c.b[1]+ny*plyOffset*1.5, c.b[2]],
     section:w.section, role:'drywall-backing', widthM:w.sectionWidthM, depthM:w.sectionDepthM
    });
   }
  }

  const positions=[...new Set(base.filter(m=>m.role==='stud'||m.role==='corner'||m.role==='t-junction-backing').map(m=>{
   const dx=m.a[0]-w.start[0], dy=m.a[1]-w.start[1];
   return Math.max(0,Math.min(L,(dx*(w.end[0]-w.start[0])+dy*(w.end[1]-w.start[1]))/L));
  }))].sort((a,b)=>a-b);
  const rowCount=Math.max(0,Math.ceil((wallH)/blockM-1e-8)-1);
  for(let row=1;row<=rowCount;row++){
   const z=row*blockM;
   if(z>=wallH-thk*2)continue;
   for(let i=0;i<positions.length-1;i++){
    const a=positions[i], b=positions[i+1];
    if(b-a<.05)continue;
    const mid=(a+b)/2;
    if(openings.some(op=>z>op.sill&&z<op.head&&mid>op.a&&mid<op.b))continue;
    additions.push(horizontal(w,`${w.id}-BLK-${row}-${i+1}`,a,b,z,'blocking'));
   }
  }

  const anchorCount=Math.max(1,Math.floor(L/anchorM));
  for(let aIdx=1; aIdx<=anchorCount; aIdx++){
   const d=Math.min(L-0.1, aIdx*anchorM - anchorM/2);
   const p=pointAt(w,d);
   additions.push({
    id:`${w.id}-ANCHOR-${aIdx}`,
    a:[p[0],p[1],0], b:[p[0],p[1],thk],
    section:'Anchor Bolt 5/8" dia', role:'anchor-bolt', widthM:.016, depthM:.016
   });
  }

  if(o.braceMode==='diagonal'&&L>1.2){
   const p=pointAt(w,0.2), q=pointAt(w,Math.min(L,L-0.2));
   additions.push({id:`${w.id}-BRACE-1`,a:[p[0],p[1],thk],b:[q[0],q[1],wallH-thk*2],section:'strap / brace',role:'conceptual-brace',widthM:.025,depthM:.003});
  }

  w.studs.push(...additions);
  w.detailing={
   headerPlies:plyCount,
   jackStudsPerSide:jackCount,
   blockingSpacingM:blockM,
   blockingRows:rowCount,
   cornerMode:o.cornerMode,
   sheathing:o.sheathing?{sheetWidthM:sheetW,sheetHeightM:sheetH,sheets:Math.ceil(L/sheetW)*Math.ceil(wallH/sheetH),status:'ADVANCED LAYOUT ESTIMATE'}:null,
   braceMode:o.braceMode
  };

  w.panels=[];
  const panelCount=Math.max(1,Math.ceil(L/maxPanelM));
  for(let i=0;i<panelCount;i++){
   const a=L*i/panelCount, b=L*(i+1)/panelCount;
   w.panels.push({
    id:`${w.id}-PANEL-${i+1}`,
    startM:r(a), endM:r(b), lengthM:r(b-a),
    openings:openings.filter(op=>op.a<b&&op.b>a).length,
    liftingPoints:[r((a+b)/2)],
    status:'READY FOR PREFAB SHOP'
   });
  }
 }
 framing.wallDetailingOptions={headerPlies:plyCount,jackStudsPerSide:jackCount,blockingSpacingFt:blockM/FT,cornerMode:o.cornerMode,sheathing:!!o.sheathing};
 framing.counts={...(framing.counts||{}),wallAssemblies:(framing.wallAssemblies||[]).length,wallMembers:(framing.wallAssemblies||[]).reduce((s,w)=>s+(w.studs||[]).length+(w.topPlates||[]).length+(w.bottomPlates||[]).length,0),wallOpenings:(framing.wallAssemblies||[]).reduce((s,w)=>s+(w.openings||[]).length,0),wallBlocking:(framing.wallAssemblies||[]).reduce((s,w)=>s+(w.studs||[]).filter(m=>m.role==='blocking').length,0),wallSheathingSheets:(framing.wallAssemblies||[]).reduce((s,w)=>s+(w.detailing?.sheathing?.sheets||0),0)};
 framing.wallQA=checkWallFraming(framing);
 return framing;
}

export function checkWallFraming(framing){
 const issues=[], ids=new Set();
 const add=(severity,wid,code,message)=>issues.push({severity,wall:wid,code,message});
 for(const w of framing.wallAssemblies||[]){
  const L=wallLength(w);
  if(!L||!Number.isFinite(L))add('ERROR',w.id,'INVALID_LENGTH','Wall length is zero or invalid.');
  if(!(n(w.heightM)>1.5))add('ERROR',w.id,'INVALID_HEIGHT','Wall height is missing or implausible.');
  for(const m of [...(w.studs||[]),...(w.topPlates||[]),...(w.bottomPlates||[])]){
   if(ids.has(m.id))add('ERROR',w.id,'DUPLICATE_ID',`Duplicate member ID ${m.id}.`);
   ids.add(m.id);
   if(!m.a?.every(Number.isFinite)||!m.b?.every(Number.isFinite))add('ERROR',w.id,'INVALID_COORDS',`Member ${m.id} has invalid coordinates.`);
   if(Math.hypot(m.b[0]-m.a[0],m.b[1]-m.a[1],m.b[2]-m.a[2])<.01)add('WARNING',w.id,'ZERO_LENGTH',`Member ${m.id} is nearly zero length.`);
  }
  for(const [i,o] of (w.openings||[]).entries()){
   if(o.a<0||o.b>L||o.b<=o.a)add('ERROR',w.id,'OPENING_BOUNDS',`Opening ${i+1} extends outside its wall or has invalid width.`);
   if(o.head>(w.heightM||0))add('ERROR',w.id,'OPENING_HEAD',`Opening ${i+1} head exceeds wall height.`);
   if(o.type==='window'&&o.sill>=o.head)add('ERROR',w.id,'WINDOW_SILL',`Window ${i+1} sill is above its head.`);
  }
  if(!(w.topPlates||[]).length)add('WARNING',w.id,'NO_TOP_PLATE','No top plate records were generated.');
  if(!(w.bottomPlates||[]).length)add('WARNING',w.id,'NO_BOTTOM_PLATE','No bottom plate records were generated.');
  if(!(w.studs||[]).some(m=>m.role==='header'))add('WARNING',w.id,'NO_HEADER','No header record exists; verify openings and header layers.');
 }
 return {issues,errors:issues.filter(x=>x.severity==='ERROR').length,warnings:issues.filter(x=>x.severity==='WARNING').length,status:issues.some(x=>x.severity==='ERROR')?'CHECK REQUIRED':issues.length?'REVIEW':'GEOMETRY CHECKS PASSED'};
}

export function wallScheduleCSV(framing){
 const rows=[['wall_id','layer','length_m','height_m','section','stud_spacing_m','member_id','role','member_length_m','opening_count','header_plies','jack_studs_per_side','blocking_rows','sheathing_sheets','status']];
 for(const w of framing.wallAssemblies||[]){
  const ms=[...(w.bottomPlates||[]),...(w.topPlates||[]),...(w.studs||[])];
  for(const m of ms)rows.push([w.id,w.layer||'',r(wallLength(w)),r(w.heightM),w.section||'',r(w.spacingM),m.id,m.role||'stud',r(Math.hypot(m.b[0]-m.a[0],m.b[1]-m.a[1],m.b[2]-m.a[2])),(w.openings||[]).length,w.detailing?.headerPlies||1,w.detailing?.jackStudsPerSide||1,w.detailing?.blockingRows||0,w.detailing?.sheathing?.sheets||0,'REVIEW']);
 }
 return rows.map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
}

export function wallQACSV(framing){
 const q=framing.wallQA||checkWallFraming(framing);
 return [['severity','wall','code','message'],...q.issues.map(i=>[i.severity,i.wall,i.code,i.message])].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
}

export function wallElevationDXF(w){
 const L=wallLength(w)*1000, H=(n(w.heightM)||2.44)*1000;
 let dxf=`  0\nSECTION\n  2\nHEADER\n  0\nENDSEC\n  0\nSECTION\n  2\nTABLES\n  0\nENDTAB\n  0\nSECTION\n  2\nENTITIES\n`;
 const addLine=(layer,x1,y1,x2,y2)=>{
  dxf+=`  0\nLINE\n  8\n${layer}\n 10\n${x1.toFixed(3)}\n 20\n${y1.toFixed(3)}\n 30\n0.0\n 11\n${x2.toFixed(3)}\n 27\n${y2.toFixed(3)}\n 31\n0.0\n`;
 };
 const addText=(layer,text,x,y,height=50)=>{
  dxf+=`  0\nTEXT\n  8\n${layer}\n 10\n${x.toFixed(3)}\n 20\n${y.toFixed(3)}\n 30\n0.0\n 40\n${height}\n  1\n${text}\n`;
 };

 addLine('WALL_PLATES',0,0,L,0);
 addLine('WALL_PLATES',0,H-38,L,H-38);
 addLine('WALL_PLATES',0,H,L,H);
 addLine('WALL_PLATES',0,0,0,H);
 addLine('WALL_PLATES',L,0,L,H);

 for(const m of [...(w.studs||[]),...(w.topPlates||[]),...(w.bottomPlates||[])]){
  if(!m.a||!m.b)continue;
  const dx1=m.a[0]-w.start[0], dy1=m.a[1]-w.start[1];
  const along=(dx1*(w.end[0]-w.start[0])+dy1*(w.end[1]-w.start[1]))/(wallLength(w)||1);
  const x=along*1000;
  const y0=Math.min(m.a[2],m.b[2])*1000, y1=Math.max(m.a[2],m.b[2])*1000;
  const layer=m.role==='header'||m.role==='header-ply'?'WALL_LINTELS':m.role==='trimmer'||m.role==='jack-stud'?'WALL_STUDS':m.role==='t-junction-backing'?'WALL_BACKERS':'WALL_STUDS';
  addLine(layer,x,y0,x,y1);
 }

 for(const op of (w.openings||[])){
  const x=op.a*1000, ww=(op.b-op.a)*1000, y=op.sill*1000, hh=(op.head-op.sill)*1000;
  addLine('WALL_OPENINGS',x,y,x+ww,y);
  addLine('WALL_OPENINGS',x+ww,y,x+ww,y+hh);
  addLine('WALL_OPENINGS',x+ww,y+hh,x,y+hh);
  addLine('WALL_OPENINGS',x,y+hh,x,y);
  addText('WALL_ANNOTATIONS',`${op.type.toUpperCase()} · Sill: ${(op.sill*3.28084).toFixed(1)}ft · Head: ${(op.head*3.28084).toFixed(1)}ft`,x+100,y+hh/2,40);
 }

 const spM = w.spacingM || (w.framing?.spacing ? w.framing.spacing / 1000 : 0.4);
 const spMm = Math.round(spM * 1000);
 addText('WALL_ANNOTATIONS',`WALL PANEL ID: ${w.id} · Length: ${(L/304.8).toFixed(2)}ft (${Math.round(L)}mm) · Stud Spacing: ${spMm}mm O.C. (${(spM*39.37).toFixed(1)}in)`,50,H+100,60);
 addText('WALL_ANNOTATIONS',`Lintel Headers: ${w.detailing?.headerPlies||2}-Ply · Corner L-Junctions & T-Backer Studs Cleaned`,50,H+40,50);

 dxf+=`  0\nENDSEC\n  0\nSECTION\n  2\nOBJECTS\n  0\nENDSEC\n  0\nEOF`;
 return dxf;
}

export function wallElevationSVG(w){
 const L=wallLength(w), H=n(w.heightM)||2.44, pad=42, W=900, HH=420, s=Math.min((W-pad*2)/Math.max(L,.1),(HH-pad*2)/H), X=d=>pad+d*s, Y=z=>HH-pad-z*s;
 let g=`<rect width="${W}" height="${HH}" fill="#f8fafb"/><rect x="${X(0)}" y="${Y(H)}" width="${L*s}" height="${H*s}" fill="#fff" stroke="#233643" stroke-width="2"/>`;
 for(const m of w.studs||[]){
  if(!m.a||!m.b)continue;
  const dx=m.b[0]-w.start[0], dy=m.b[1]-w.start[1], d=(dx*(w.end[0]-w.start[0])+dy*(w.end[1]-w.start[1]))/(L||1), z0=Math.min(m.a[2],m.b[2]), z1=Math.max(m.a[2],m.b[2]);
  const color=m.role==='header'||m.role==='header-ply'?'#2676b8':m.role==='trimmer'||m.role==='jack-stud'?'#d18b38':m.role==='blocking'?'#57936c':m.role==='header-cripple'||m.role==='sill-cripple'?'#7c3aed':m.role==='anchor-bolt'?'#dc2626':m.role==='t-junction-backing'?'#0284c7':m.role==='conceptual-brace'?'#c24e4e':'#9a7047';
  g+=`<line x1="${X(d)}" y1="${Y(z0)}" x2="${X(d)}" y2="${Y(z1)}" stroke="${color}" stroke-width="${Math.max(1.2,s*.035)}"/>`;
 }
 for(const op of w.openings||[]){
  const x=X(op.a), y=Y(op.head), ww=(op.b-op.a)*s, hh=(op.head-op.sill)*s;
  g+=`<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="#d9e9f2" stroke="#3e7897" stroke-width="1.5"/><text x="${x+ww/2}" y="${y+hh/2}" text-anchor="middle" font-size="11" fill="#234454">${esc(op.type)}</text>`;
 }
 g+=`<text x="${pad}" y="20" font-size="13" fill="#425466">${esc(w.id)} · ${esc(w.section)} · ${(L/FT).toFixed(2)} ft × ${(H/FT).toFixed(2)} ft · ${esc(w.layer||'WALL')}</text><text x="${pad}" y="${HH-10}" font-size="11" fill="#425466">Advanced Wall Framing PRO · Mitek-Style Corner L-Junctions & T-Backer Stud Intersections</text>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${HH}">${g}</svg>`;
}
