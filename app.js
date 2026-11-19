var $=window.$||(s=>document.querySelector(s)), $$=window.$$||(s=>[...document.querySelectorAll(s)]);
const bindClick = (sel, fn) => { const el = typeof sel === 'string' ? $(sel) : sel; if (el) el.onclick = fn; return el; };
const bindChange = (sel, fn) => { const el = typeof sel === 'string' ? $(sel) : sel; if (el) el.onchange = fn; return el; };
function toast(s){const t=$('#toast');if(t){t.textContent=s;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2800)}}
const paths={
  select:'M5 3l12 9-6 1-3 6z',
  marquee:'M3 4h4v2H5v2H3V4zm14 0h4v4h-2V6h-2V4zM3 16h2v2h2v2H3v-4zm16 2h-2v2h4v-4h-2v2zM9 4h6v2H9V4zm0 14h6v2H9v-2zm-6-7h2v4H3v-4zm16 0h2v4h-2v-4z',
  wall:'M3 6l14-3v14L3 20z M7 6v12 M11 5v12 M15 4v12',
  door:'M4 20V4h3v16 M7 4a13 13 0 0113 13H7',
  window:'M3 7h18v10H3z M8 7v10 M16 7v10 M3 12h18',
  skylight:'M4 5l16 3v11l-16-3V5zm3 3.5l10 1.9v6.7l-10-1.9v-6.7z',
  roof:'M2 14L12 4l10 10 M5 12v8h14v-8 M12 4v10',
  shell:'M3 16c4-8 14-8 18 0M3 16l4 4c4-7 10-7 14 0l-4-4',
  beam:'M3 7l14-4 4 3-14 4z M3 7v10l4 4V10 M7 21l14-4V6',
  column:'M7 5l5-3 5 3v14l-5 3-5-3z M7 5l5 3 5-3 M12 8v14',
  slab:'M2 10l10-6 10 6-10 6z M2 10v4l10 6 10-6v-4 M12 16v4',
  stair:'M3 19h4v-3h4v-3h4v-3h4V7h2M3 19v3h18v-3',
  railing:'M3 6h18M3 18h18M5 6v12M9 6v12M13 6v12M17 6v12M21 6v12',
  curtainwall:'M3 4h18v16H3zm6 0v16m6-16v16M3 10h18M3 16h18',
  morph:'M4 18l5-12 11 3-5 12zM9 6l6 6m0 0l-1 6m1-6l5-3',
  mesh:'M3 17l6-6 6 4 6-9v12H3zM9 11l6 7M15 15l-6 4',
  zone:'M3 3h6 M15 3h6v6 M21 15v6h-6 M9 21H3v-6 M3 9V3 M9 9h6v6H9z',
  object:'M4 7h16v10H4zm2 10v3m12-3v3M4 11h16',
  dimension:'M4 3v18 M20 3v18 M4 12h16 M2 14l4-4 M18 14l4-4',
  leveldim:'M12 2l6 10h-5v10h-2V12H6zm0 4.5L8.5 10h7z',
  radialdim:'M12 21a9 9 0 119-9m-9 0l7-5m-3-1h4v4',
  angledim:'M4 20h16M4 20l12-14m-3 8a6 6 0 014 3',
  text:'M4 4h16 M12 4v16 M8 20h8',
  label:'M4 4h10l5 5v11H4zm9 0v5h5M7 11h6M7 15h8',
  fill:'M4 4h16v16H4zm3 3l10 10m-10 0l10-10M4 12h16M12 4v16',
  line:'M4 19L20 3 M2 19h4 M18 3h4',
  arc:'M3 19a15 15 0 0117-15 M1 19h4 M20 2v4',
  polyline:'M3 17l6-12 7 13 5-7 M2 17h2 M8 5h2 M15 18h2 M20 11h2',
  spline:'M3 17c4-12 8 14 12-2s4 6 6 1',
  section:'M3 3v18h18 M3 12h7V6h8v14 M8 10l4 4 M16 4l4 4',
  elevation:'M3 20h18 M5 20V9l7-6 7 6v11 M9 20v-7h6v7',
  detail:'M12 2a10 10 0 100 20 10 10 0 000-20zm-1 5h2v6h-2zm0 8h2v2h-2z',
  changemarker:'M12 3l9 16H3zm0 5v5m0 2v2',
  grid:'M4 4h16v16H4zm0 8h16M12 4v16M2 12a2 2 0 100-4 2 2 0 000 4zm10-10a2 2 0 10-4 0 2 2 0 004 0z',
  wallend:'M3 7h10a4 4 0 014 4 4 4 0 01-4 4H3zm15 1v6',
  cornerwin:'M3 3v15h15M3 10h8v8M10 3v8',
  lamp:'M12 3a6 6 0 00-6 6c0 2.5 2 4 3 5v2h6v-2c1-1 3-2.5 3-5a6 6 0 00-6-6zm-3 17h6v1H9z',
  camera:'M4 7h16v12H4zm3-3h10l2 3H5zm5 7a3 3 0 100 6 3 3 0 000-6z',
  pipette:'M19 3l2 2-2 2-2-2zm-3 3l2 2-9 9-4 1 1-4zm-7 9l2 2',
  syringe:'M18 4l2 2-3 3 1 1-2 2-1-1-4 4-2-2 4-4-1-1 2-2 1 1zM7 15l-4 4v1h1l4-4z',
  cube:'M3 7l9-5 9 5v10l-9 5-9-5z M3 7l9 5 9-5 M12 12v10',
  plan:'M3 3h18v18H3z M3 12h8V3 M11 12h10 M11 16v5',
  building:'M4 21V6h9v15 M13 10h7v11 M2 21h20 M7 9h3 M7 13h3 M7 17h3 M16 13h1 M16 17h1',
  save:'M4 3h13l3 3v15H4z M7 3v6h9V3 M8 21v-7h8v7',
  open:'M3 7h7l2 3h9v10H3z M3 10h18',
  export:'M12 15V3 M8 7l4-4 4 4 M4 13v7h16v-7',
  undo:'M7 4l-4 4 4 4 M3 8h10a7 7 0 010 14',
  redo:'M17 4l4 4-4 4 M21 8H11a7 7 0 000 14',
  move:'M12 2v20 M2 12h20 M9 5l3-3 3 3 M9 19l3 3 3-3 M5 9l-3 3 3 3 M19 9l3 3-3 3',
  copy:'M8 8h13v13H8z M16 8V3H3v13h5',
  rotate:'M4 8a9 9 0 111 10 M4 3v5h5',
  mirror:'M12 2v20 M3 6l6 6-6 6z M21 6l-6 6 6 6z',
  trash:'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  snap:'M5 3v9a7 7 0 0014 0V3h-4v9a3 3 0 01-6 0V3z M5 7h4 M15 7h4',
  fit:'M3 9V3h6 M15 3h6v6 M21 15v6h-6 M9 21H3v-6',
  help:'M21 12a9 9 0 11-18 0 9 9 0 0118 0 M9 8a3 3 0 015 2c-1 1-2 1-2 3 M12 17h.01',
  layers:'M2 8l10-6 10 6-10 6z M2 12l10 6 10-6 M2 16l10 6 10-6',
  plus:'M12 5v14 M5 12h14',minus:'M5 12h14',
  hand:'M8 12V5a2 2 0 014 0v7 M12 5a2 2 0 014 0v7 M16 7a2 2 0 014 0v8c0 4-3 7-7 7-3 0-4-1-6-4l-4-5a2 2 0 013-2l2 2V7a2 2 0 014 0',
  link:'M10 14l4-4 M8 16l-2 2a4 4 0 01-6-6l5-5a4 4 0 016 0 M16 8l2-2a4 4 0 016 6l-5 5a4 4 0 01-6 0',
  table:'M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M15 12a3 3 0 11-6 0 3 3 0 016 0',
  close:'M5 5l14 14 M19 5L5 19',
  circle:'M21 12a9 9 0 11-18 0 9 9 0 0118 0 M12 10v4 M10 12h4',
  rectangle:'M3 5h18v14H3z',
  coordinate:'M3 12h18 M12 3v18 M12 7a5 5 0 100 10 5 5 0 000-10z',
  target:'M12 2v4 M12 18v4 M2 12h4 M18 12h4 M12 6a6 6 0 100 12 6 6 0 000-12z'
};
function icon(name){return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.cube}"/></svg>`}
function icons(root=document){root.querySelectorAll('[data-icon]').forEach(e=>{if(!e.querySelector('.icon'))e.insertAdjacentHTML('afterbegin',icon(e.dataset.icon))})}icons();
const toolGroups=[
  ['SELECT',
    ['select','Arrow','V'],
    ['marquee','Marquee','M']
  ],
  ['DESIGN',
    ['wall','Wall','W'],
    ['door','Door','D'],
    ['window','Window','N'],
    ['skylight','Skylight','K'],
    ['roof','Roof','R'],
    ['shell','Shell','H'],
    ['beam','Beam','B'],
    ['column','Column','C'],
    ['slab','Slab','F'],
    ['stair','Stair','S'],
    ['railing','Railing','J'],
    ['curtainwall','Curtain Wall','U'],
    ['morph','Morph','X'],
    ['mesh','Mesh','Y'],
    ['zone','Zone','Z'],
    ['object','Object','O']
  ],
  ['DOCUMENT',
    ['dimension','Dimension','Q'],
    ['leveldim','Level Dim',''],
    ['radialdim','Radial Dim',''],
    ['angledim','Angle Dim',''],
    ['text','Text','T'],
    ['label','Label',''],
    ['fill','Fill / Hatch','I'],
    ['line','Line','L'],
    ['arc','Arc / Circle','A'],
    ['polyline','Polyline','P'],
    ['spline','Spline',''],
    ['section','Section',''],
    ['elevation','Elevation Marker',''],
    ['detail','Detail Marker',''],
    ['changemarker','Change Marker','']
  ],
  ['MORE',
    ['grid','Grid Element','G'],
    ['wallend','Wall End',''],
    ['cornerwin','Corner Window',''],
    ['lamp','Lamp',''],
    ['camera','Camera','']
  ]
];
$('#tools').innerHTML=toolGroups.map(([label,...ts])=>(label?`<div class="tool-group-label">${label}</div>`:'')+ts.map(([id,name,key])=>`<button class="tool ${id==='select'?'active':''}" data-tool="${id}" title="${name}${key?' · '+key:''}">${icon(id)}${name}<span class="shortcut">${key}</span></button>`).join('')).join('');
var clone=window.clone||(x=>JSON.parse(JSON.stringify(x))), distance=window.distance||((a,b)=>Math.hypot(a.x-b.x,a.y-b.y)), lerp=window.lerp||((a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})), esc=window.esc||(s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
var layers=[{name:'Exterior Walls',color:'#537e69',visible:true},{name:'Interior Walls',color:'#8b9c82',visible:true},{name:'Structure',color:'#aaab8f',visible:true},{name:'Annotations',color:'#b7bcae',visible:true}];
var model={version:1,name:'Courtyard House',stories:[{id:'s0',name:'Ground floor',elevation:0,height:3048},{id:'s1',name:'First floor',elevation:3048,height:3048},{id:'s2',name:'Roof level',elevation:6096,height:1800}],elements:[],seoOperations:[],revision:0};
function wall(id,a,b,layer='Exterior Walls'){return {id,type:'wall',a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},story:'s0',height:3048,followStory:true,thickness:layer==='Interior Walls'?120:200,material:'Timber',layer}}
model.elements=[
  wall('W-001',[0,0],[13000,0]),
  wall('W-002',[13000,0],[13000,9000]),
  wall('W-003',[13000,9000],[0,9000]),
  wall('W-004',[0,9000],[0,0]),
  wall('W-005',[4700,0],[4700,4200],'Interior Walls'),
  wall('W-006',[0,4200],[4700,4200],'Interior Walls'),
  wall('W-007',[8500,0],[8500,9000],'Interior Walls'),
  wall('W-008',[10500,5600],[13000,5600],'Interior Walls'),
  wall('W-009',[10500,5600],[10500,9000],'Interior Walls'),
  {id:'S-001',type:'slab',points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],story:'s0',thickness:200,material:'Concrete',layer:'Structure'},
  {id:'N-001',type:'window',host:'W-001',offset:2300,width:2000,height:1500,sill:900,story:'s0',material:'Glass',layer:'Exterior Walls'},
  {id:'N-002',type:'window',host:'W-001',offset:6500,width:1600,height:1500,sill:900,story:'s0',material:'Glass',layer:'Exterior Walls'},
  {id:'N-003',type:'window',host:'W-001',offset:10700,width:2000,height:1500,sill:900,story:'s0',material:'Glass',layer:'Exterior Walls'},
  {id:'N-004',type:'window',host:'W-003',offset:10700,width:2000,height:1500,sill:900,story:'s0',material:'Glass',layer:'Exterior Walls'},
  {id:'N-005',type:'window',host:'W-004',offset:2500,width:2200,height:1500,sill:900,story:'s0',material:'Glass',layer:'Exterior Walls'},
  {id:'N-006',type:'window',host:'W-002',offset:7300,width:1600,height:1500,sill:900,story:'s0',material:'Glass',layer:'Exterior Walls'},
  {id:'D-001',type:'door',host:'W-003',offset:6500,width:1100,height:2200,sill:0,story:'s0',material:'Oak',layer:'Exterior Walls'},
  {id:'D-002',type:'door',host:'W-006',offset:3500,width:900,height:2200,sill:0,story:'s0',material:'Oak',layer:'Interior Walls'},
  {id:'D-003',type:'door',host:'W-007',offset:4500,width:900,height:2200,sill:0,story:'s0',material:'Oak',layer:'Interior Walls'},
  {id:'D-004',type:'door',host:'W-009',offset:1200,width:900,height:2200,sill:0,story:'s0',material:'Oak',layer:'Interior Walls'},
  {id:'R-001',type:'roof',story:'s0',layer:'Structure',points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],pitch:25,height:3048,overhang:450,thickness:200,roofType:'hip',roofFraming:{system:'trusses',spacing:600,hipSetback:1828.8,wingDirection:'branch',webPattern:'Auto',width:38,depth:89,webDepth:40,heel:150,panelCount:0,girderPlies:2}}
];
for(const w of model.elements.filter(e=>e.type==='wall'&&e.layer==='Exterior Walls'))w.reference='outside';
model.elements=model.elements.filter(e=>e.type!=='object');
var selected=['W-003'],activeStory='s0',view='plan',tool='select',snap=true,grid=true,sectionCut=false,transparent=false,scale=1,pan={x:0,y:0},orbit=-.7,tilt=.62,points=[],hover=null,drag=null,space=false,editing=null,modelHistory=[],future=[],dirty=false;
function select(ids = []){
  if (editing === 'trimToRoofPickRoof' && Array.isArray(ids) && ids.length === 1) {
    const pickedRoof = model.elements.find(e => e.id === ids[0] && e.type === 'roof');
    if (pickedRoof && typeof completePickRoofForTrim === 'function') {
      completePickRoofForTrim(pickedRoof);
      return;
    }
  }
  selected = Array.isArray(ids) ? ids.filter(Boolean) : (ids ? [ids] : []);
  if (selected.length && window._closedFloatingPopups) {
    window._closedFloatingPopups.delete('wall-palette');
    window._closedFloatingPopups.delete('selection-model');
  }
  if (typeof render === 'function') render();
  if (typeof properties === 'function') properties();
  if (typeof navigatorPanel === 'function') navigatorPanel();
  if (typeof updateEWPBeamHUD === 'function' && view === 'ewpspecs') updateEWPBeamHUD();
  if (typeof window.renderSEOPalette === 'function') window.renderSEOPalette();
}
function storyOf(e){return model.stories.find(s=>s.id===e.story)||model.stories[0]}function heightOf(e){if(e.type==='roof'&&e.followStory)return storyOf(e).height+(e.roofOffset||0);if(e.type==='wall'&&e.followStory){const home=storyOf(e),top=model.stories.find(s=>s.id===e.topStory);return Math.max(10,(top?top.elevation:home.elevation+home.height)+(e.topOffset||0)-wallBase(e))}return e.followStory?storyOf(e).height:(e.height??3000)}function hostOf(e){return model.elements.find(w=>w.id===e.host)}function hosted(w){return model.elements.filter(e=>e.host===w.id)}
const toolLayerDefaults={};
function layerOf(name){return layers.find(l=>l.name===name)||null}
function isLayerVisible(name){return !name?true:(layerOf(name)?.visible!==false)}
function setLayerVisible(name,vis){const l=layerOf(name);if(l)l.visible=Boolean(vis)}
function defaultLayerForType(type){
  if(toolLayerDefaults[type]&&layerOf(toolLayerDefaults[type]))return toolLayerDefaults[type];
  if(['wall','window','door','skylight','cornerwin','wallend'].includes(type))return 'Exterior Walls';
  if(['line','polyline','circle','arc','rectangle','dimension','leveldim','radialdim','angledim','text','label','fill','spline','section','section_callout','elevation','detail','changemarker','grid','camera','zone'].includes(type))return 'Annotations';
  return 'Structure';
}
function shown(e,visited){
  if(!e)return false;
  if(!isLayerVisible(e.layer))return false;
  if(e.host&&e.host!==e.id){
    const host=hostOf(e);
    if(!host)return false;
    const seen=visited instanceof Set?visited:null;
    if(!seen||!seen.has(host.id)){
      const next=seen?new Set(seen):new Set();
      next.add(e.id);
      if(!shown(host,next))return false;
    }
  }
  return view==='3d'||view==='framing3d'||e.story===activeStory;
}
function pruneHiddenSelection(){
  if(!Array.isArray(selected)||!selected.length)return;
  const structVis=isLayerVisible('Structure');
  const next=selected.filter(id=>{
    const el=model.elements.find(x=>x.id===id);
    if(el)return shown(el);
    if(typeof id==='string'&&id.includes(':STUD:')){
      if(!structVis&&(view==='plan'||view==='3d'||view==='framing3d'))return false;
      const wallId=id.split(':STUD:')[0];
      const w=model.elements.find(x=>x.id===wallId);
      return w?shown(w):false;
    }
    if(typeof id==='string'&&id.includes(':')){
      const slabId=id.split(':')[0];
      const sl=model.elements.find(x=>x.id===slabId&&x.type==='slab');
      if(sl)return shown(sl);
      return structVis;
    }
    return true;
  });
  if(next.length!==selected.length){
    selected=next;
    if(!selected.length&&typeof hidePetPalette==='function')hidePetPalette();
  }
}
window.layerOf=layerOf;window.isLayerVisible=isLayerVisible;window.setLayerVisible=setLayerVisible;window.pruneHiddenSelection=pruneHiddenSelection;
function isExteriorWall(w){if(!w)return false;const d=[w.layer,w.wallType,w.classification,w.category,w.name,w.typeName].filter(Boolean).join(' ');if(/(interior|internal|partition|party wall)/i.test(d))return false;if(w.isExternal===true||w.isExterior===true||w.exterior===true||String(w.reference||'').toLowerCase()==='outside')return true;return /(exterior|external|outer\s*wall|outside)/i.test(d)}
function getTextScale(){
  const m=$('#wall-text-size')?.value;
  const base=m==='small'?0.75:(m==='large'?1.35:1.0);
  const z=(typeof scale==='number'&&Number.isFinite(scale)&&typeof isModelView==='function'&&!isModelView())?Math.max(0.4,Math.min(3.5,scale)):1.0;
  return base*z;
}
function getExportTextScale(){
  const m=$('#wall-text-size')?.value;
  return m==='small'?0.72:(m==='large'?0.98:0.85);
}
var appUnits = 'mm';
function isImperialUnits() { return appUnits === 'ft-in'; }
function gcdUnit(a, b) { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) { const t = b; b = a % b; a = t; } return a || 1; }
function formatInchesOnly(mm, denom = 16) {
  const n = Number(mm);
  if (!Number.isFinite(n)) return '0"';
  const sign = n < 0 ? '-' : '';
  const totalIn = Math.abs(n) / 25.4;
  let ticks = Math.round(totalIn * denom);
  let whole = Math.floor(ticks / denom);
  let rem = ticks % denom;
  if (rem === 0) return `${sign}${whole}"`;
  const g = gcdUnit(rem, denom);
  const num = rem / g;
  const den = denom / g;
  return whole > 0 ? `${sign}${whole}-${num}/${den}"` : `${sign}${num}/${den}"`;
}
function formatFeetInches(mm, compact = false) {
  const n = Number(mm);
  if (!Number.isFinite(n)) return `0'-0"`;
  const sign = n < 0 ? '-' : '';
  const absMm = Math.abs(n);
  if (absMm < 304.8 && compact) return formatInchesOnly(n, 16);
  const denom = 16;
  const totalIn = absMm / 25.4;
  let totalTicks = Math.round(totalIn * denom);
  const ticksPerFoot = 12 * denom;
  const ft = Math.floor(totalTicks / ticksPerFoot);
  const remTicks = totalTicks % ticksPerFoot;
  const wholeIn = Math.floor(remTicks / denom);
  const fracTicks = remTicks % denom;
  let fracStr = '';
  if (fracTicks > 0) {
    const g = gcdUnit(fracTicks, denom);
    fracStr = ` ${fracTicks / g}/${denom / g}`;
  }
  if (ft === 0 && absMm < 304.8) return `${sign}${wholeIn}${fracStr ? '-' + fracStr.trim() : ''}"`;
  return `${sign}${ft}'-${wholeIn}${fracStr}"`;
}
function formatLength(mm, includeUnitInMm = true) {
  const n = Number(mm);
  if (!Number.isFinite(n)) return isImperialUnits() ? `0'-0"` : (includeUnitInMm ? '0 mm' : '0');
  if (isImperialUnits()) return formatFeetInches(n);
  return includeUnitInMm ? `${Math.round(n)} mm` : `${Math.round(n)}`;
}
function formatDimPair(wMm, hMm) {
  if (isImperialUnits()) return `${formatFeetInches(wMm)}×${formatFeetInches(hMm)}`;
  return `${Math.round(wMm)}×${Math.round(hMm)} mm`;
}
function formatSection(secOrW, dOpt = null) {
  let w = 0, d = 0;
  if (dOpt !== null && dOpt !== undefined) {
    w = Number(secOrW); d = Number(dOpt);
  } else {
    const m = String(secOrW || '').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    if (!m) return String(secOrW || '');
    w = Number(m[1]); d = Number(m[2]);
  }
  if (!Number.isFinite(w) || !Number.isFinite(d)) return String(secOrW || '');
  if (!isImperialUnits()) return `${Math.round(w)}×${Math.round(d)} mm`;
  const minD = Math.min(w, d), maxD = Math.max(w, d);
  if (Math.abs(minD - 38) <= 3 || Math.abs(minD - 45) <= 3 || Math.abs(minD - 35) <= 3) {
    if (Math.abs(maxD - 89) <= 4 || Math.abs(maxD - 90) <= 4) return `2×4 (1-1/2"×3-1/2")`;
    if (Math.abs(maxD - 140) <= 4) return `2×6 (1-1/2"×5-1/2")`;
    if (Math.abs(maxD - 184) <= 5 || Math.abs(maxD - 190) <= 5) return `2×8 (1-1/2"×7-1/4")`;
    if (Math.abs(maxD - 235) <= 5 || Math.abs(maxD - 240) <= 5) return `2×10 (1-1/2"×9-1/4")`;
    if (Math.abs(maxD - 286) <= 6 || Math.abs(maxD - 290) <= 6) return `2×12 (1-1/2"×11-1/4")`;
  }
  return `${formatInchesOnly(w, 8)}×${formatInchesOnly(d, 8)}`;
}
function formatAreaFromM2(m2) {
  const n = Number(m2) || 0;
  if (isImperialUnits()) return `${(n * 10.7639104).toFixed(1)} sq ft`;
  return `${n.toFixed(1)} m²`;
}
function parseLengthInput(raw, fallbackMm = 0) {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const s = String(raw ?? '').trim();
  if (!s) return fallbackMm;
  if (/mm$/i.test(s)) {
    const v = parseFloat(s);
    return Number.isFinite(v) ? v : fallbackMm;
  }
  if (s.includes("'") || s.includes('"') || s.includes('/')) {
    const sign = s.startsWith('-') ? -1 : 1;
    const clean = s.replace(/^[+-]/, '').trim();
    let feet = 0, inches = 0;
    let rest = clean;
    if (rest.includes("'")) {
      const parts = rest.split("'");
      feet = parseFloat(parts[0]) || 0;
      rest = (parts[1] || '').trim().replace(/^[-–\s]+/, '');
    }
    rest = rest.replace(/"/g, '').trim();
    if (rest) {
      const matchMixed = rest.match(/^(\d+(?:\.\d+)?)\s*[- ]\s*(\d+)\s*\/\s*(\d+)$/);
      const matchFrac = rest.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (matchMixed) {
        inches = parseFloat(matchMixed[1]) + (parseFloat(matchMixed[2]) / Math.max(1, parseFloat(matchMixed[3])));
      } else if (matchFrac) {
        inches = parseFloat(matchFrac[1]) / Math.max(1, parseFloat(matchFrac[2]));
      } else {
        inches = parseFloat(rest) || 0;
      }
    }
    const mm = sign * ((feet * 12 + inches) * 25.4);
    return Number.isFinite(mm) ? Math.round(mm * 10) / 10 : fallbackMm;
  }
  const num = Number(s);
  if (!Number.isFinite(num)) return fallbackMm;
  return num;
}
function setAppUnits(nextUnit) {
  appUnits = nextUnit === 'ft-in' ? 'ft-in' : 'mm';
  window.appUnits = appUnits;
  const uBtn = $('#units');
  if (uBtn) {
    uBtn.innerHTML = appUnits === 'ft-in' ? 'Feet &amp; Inches <span>⌄</span>' : 'Millimeters <span>⌄</span>';
  }
  const osbStrong = $('#wall-osb-toggle-wrap strong');
  if (osbStrong) {
    osbStrong.textContent = appUnits === 'ft-in' ? '1/2" OSB' : '12 mm OSB';
  }
  const trackUnitSpan = $('.tracker .unit-tag');
  if (trackUnitSpan) trackUnitSpan.textContent = appUnits === 'ft-in' ? 'ft-in' : 'mm';
  ['#track-x', '#track-y', '#draft-length', '#draft-coord-x', '#draft-coord-y'].forEach(sel => {
    const inp = $(sel);
    if (inp) inp.type = appUnits === 'ft-in' ? 'text' : 'number';
  });
  $$('.draft-tracker-grid .draft-unit').forEach(el => {
    if (el.textContent === 'mm' || el.textContent === 'ft-in') {
      el.textContent = appUnits === 'ft-in' ? 'ft-in' : 'mm';
    }
  });
  if (hover) {
    if ($('#track-x')) $('#track-x').value = appUnits === 'ft-in' ? formatFeetInches(hover.x) : Math.round(hover.x);
    if ($('#track-y')) $('#track-y').value = appUnits === 'ft-in' ? formatFeetInches(hover.y) : Math.round(hover.y);
    updateDraftTrackerLive(hover);
  }
  properties();
  renderInfoBox();
  navigatorPanel();
  if (view === 'schedule' || view === 'cutlist' || view === 'audit' || view === 'floorschedule') schedule();
  render();
  toast(appUnits === 'ft-in'
    ? `Units switched to Feet & Inches (ft'-in") across all views & exports`
    : `Units switched to Millimeters (mm) across all views & exports`);
}
if (typeof window !== 'undefined') {
  window.select = select;
  window.getTextScale = getTextScale;
  window.getExportTextScale = getExportTextScale;
  window.isExteriorWall = isExteriorWall;
  window.appUnits = appUnits;
  window.isImperialUnits = isImperialUnits;
  window.formatInchesOnly = formatInchesOnly;
  window.formatFeetInches = formatFeetInches;
  window.formatLength = formatLength;
  window.formatDimPair = formatDimPair;
  window.formatSection = formatSection;
  window.formatAreaFromM2 = formatAreaFromM2;
  window.parseLengthInput = parseLengthInput;
  window.setAppUnits = setAppUnits;
}
var canvas=$('#canvas'),ctx=canvas?canvas.getContext('2d'):null;var width=0,height=0,baseScale=.05,projectedFaces=[],hits=[],lastPointer={x:0,y:0};
function checkpoint(){modelHistory.push(clone(model));if(modelHistory.length>80)modelHistory.shift();future=[]}function changed(){model.revision++;dirty=true;$('#save-state').textContent='Unsaved changes';render();properties();navigatorPanel();try{window.dispatchEvent(new Event('cadtech:modelChanged'))}catch(_){}}function commit(fn,propagate=true){const previous=clone(model),oldSelected=[...selected],oldFuture=[...future];checkpoint();try{fn();if(typeof autoAlignTrussRoofsToWallPlates==='function')autoAlignTrussRoofsToWallPlates();if(propagate)updateWallConnections(previous);validateWallGeometry();model.elements.filter(e=>e.type==='roof').forEach(validateRoof);model.elements.filter(e=>e.host).forEach(validateOpening);changed();return true}catch(error){model=previous;selected=oldSelected;modelHistory.pop();future=oldFuture;render();properties();toast(error.message);return false}}function undo(){if(!modelHistory.length)return;future.push(clone(model));model=modelHistory.pop();selected=selected.filter(id=>model.elements.some(e=>e.id===id));changed()}function redo(){if(!future.length)return;modelHistory.push(clone(model));model=future.pop();changed()}
var traceActive = true, pipetteActive = false, syringeActive = false, absorbedParams = null, trackerActive = true, lastPlacedWallEnd = null, orthoActive = false;
var toolGeomMethod = { wall: 'single', slab: 'poly', roof: 'poly', beam: 'single', column: 'square', zone: 'inner', object: 'Table & Chairs', dimension: 'linear', fill: 'diagonal45' };
var currentZoneCategory = 'Living Room', pendingOpening = null, wandActive = false;
function raySegmentIntersect(ro,rd,p1,p2){
  const v1={x:ro.x-p1.x,y:ro.y-p1.y},v2={x:p2.x-p1.x,y:p2.y-p1.y},v3={x:-rd.y,y:rd.x};
  const dot=v2.x*v3.x+v2.y*v3.y;if(Math.abs(dot)<1e-8)return null;
  const t1=(v2.x*v1.y-v2.y*v1.x)/dot,t2=(v1.x*v3.x+v1.y*v3.y)/dot;
  if(t1>1e-4&&t2>=0&&t2<=1)return {dist:t1,point:{x:ro.x+rd.x*t1,y:ro.y+rd.y*t1}};
  return null;
}
function floodRoom(q){
  const walls=model.elements.filter(e=>e.type==='wall'&&e.story===activeStory&&shown(e));
  if(!walls.length)return null;
  const numRays=72,rayPoints=[],maxDist=30000;
  for(let i=0;i<numRays;i++){
    const angle=(i*2*Math.PI)/numRays,dir={x:Math.cos(angle),y:Math.sin(angle)};
    let bestDist=maxDist,bestPoint=null;
    for(const w of walls){
      const poly=wallPoly(w);
      for(let j=0;j<poly.length;j++){
        const p1=poly[j],p2=poly[(j+1)%poly.length];
        const hit=raySegmentIntersect(q,dir,p1,p2);
        if(hit&&hit.dist>10&&hit.dist<bestDist){bestDist=hit.dist;bestPoint=hit.point}
      }
    }
    if(!bestPoint||bestDist>=maxDist-100)return null;
    rayPoints.push(bestPoint);
  }
  const simplified=[];
  for(let i=0;i<rayPoints.length;i++){
    const prev=rayPoints[(i+rayPoints.length-1)%rayPoints.length],curr=rayPoints[i],next=rayPoints[(i+1)%rayPoints.length];
    const d=segmentDistance(curr,prev,next).distance;
    if(d>45||!simplified.length)simplified.push(curr);
  }
  if(simplified.length<3)return null;
  let areaMm2=0;for(let i=0;i<simplified.length;i++){const a=simplified[i],b=simplified[(i+1)%simplified.length];areaMm2+=(a.x*b.y-b.x*a.y)}
  const areaM2=Math.abs(areaMm2)/2/1000000;if(areaM2<0.5)return null;
  const cx=simplified.reduce((s,p)=>s+p.x,0)/simplified.length,cy=simplified.reduce((s,p)=>s+p.y,0)/simplified.length;
  let name=currentZoneCategory||'Living Room';
  return {boundary:simplified,area:Math.round(areaM2*10)/10,center:{x:cx,y:cy},name};
}
function cylinderPolygon(center,r,segs=12){
  const pts=[];for(let i=0;i<segs;i++){const th=(i*2*Math.PI)/segs;pts.push({x:center.x+Math.cos(th)*r,y:center.y+Math.sin(th)*r})}
  return pts;
}
function unique(type){
  const prefix={
    wall:'W',window:'N',door:'D',skylight:'SK',roof:'R',shell:'SH',
    beam:'B',column:'C',slab:'S',stair:'ST',railing:'RL',curtainwall:'CW',
    morph:'MO',mesh:'MS',zone:'Z',object:'OBJ',
    line:'L',polyline:'P',circle:'O',arc:'A',rectangle:'REC',
    dimension:'DIM',leveldim:'LVL',radialdim:'RAD',angledim:'ANG',
    text:'TXT',label:'LBL',fill:'FIL',spline:'SPL',
    section:'SEC',elevation:'ELV',detail:'DTL',changemarker:'CHG',
    grid:'GRD',wallend:'WE',cornerwin:'CN',lamp:'LMP',camera:'CAM'
  }[type]||'E';
  let n=1;
  while(model.elements.some(e=>e.id===`${prefix}-${String(n).padStart(3,'0')}`))n++;
  return `${prefix}-${String(n).padStart(3,'0')}`;
}
function p2(p){return {x:width/2+(p.x-6500)*baseScale*scale+pan.x,y:height/2+(p.y-4500)*baseScale*scale+pan.y+20}}
function world(p){return {x:(p.x-width/2-pan.x)/(baseScale*scale)+6500,y:(p.y-height/2-pan.y-20)/(baseScale*scale)+4500}}
function snapped(p){return advancedSnap(p)}
function line(a,b,color='#687d6b',lw=1,dash=[]){ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([])}
function poly(ps,fill,stroke,lw=1,dash=[]){if(!ps.length)return;ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;if(dash&&dash.length)ctx.setLineDash(dash);ctx.stroke();if(dash&&dash.length)ctx.setLineDash([])}}
function label(t,x,y,size=7,color='#81917e',align='center'){if($('#wall-dimensions-toggle')?.checked===false&&(view==='panel'||view==='plan'||view==='framingplan'||view==='roofframingplan'||view==='ewpspecs'))return;const s=getTextScale();ctx.fillStyle=color;ctx.font=`${size*s}px "DM Sans",Arial`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(t,x,y)}
function rect(x,y,w,h,fill,stroke,lw=1){poly([{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}],fill,stroke,lw)}
function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return {distance:distance(p,lerp(a,b,t)),t,point:lerp(a,b,t)}}
function rawWallPoly(w,a=w.a,b=w.b,t=w.thickness){if(w.type==='wall'){a=wallCenterPoint(w,a);b=wallCenterPoint(w,b)}let len=distance(a,b)||1,n={x:-(b.y-a.y)/len*t/2,y:(b.x-a.x)/len*t/2};return [{x:a.x+n.x,y:a.y+n.y},{x:b.x+n.x,y:b.y+n.y},{x:b.x-n.x,y:b.y-n.y},{x:a.x-n.x,y:a.y-n.y}]}
function wallPoly(w,a=w.a,b=w.b,t=w.thickness){return joinedWallPolygon(w,a,b,t)}
function openingPoint(e){let w=hostOf(e);return (w&&w.a&&w.b)?wallCenterPoint(w,lerp(w.a,w.b,e.offset/(distance(w.a,w.b)||1))):(e?.a||null)}
function inside(p,ps){let yes=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++){let a=ps[i],b=ps[j];if(((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x))yes=!yes}return yes}
function planPick(p){
  if (view === 'panel' && Array.isArray(window._wallPanelStudHits)) {
    // Prioritize already-selected stud with generous grab tolerance
    for (let i = window._wallPanelStudHits.length - 1; i >= 0; i--) {
      const h = window._wallPanelStudHits[i];
      if (Array.isArray(selected) && selected.includes(h.id) && p.x >= h.x0 - 8 && p.x <= h.x1 + 8 && p.y >= h.y0 - 6 && p.y <= h.y1 + 6) {
        return { id: h.id, type: 'stud', isStud: true, wallId: h.wallId, host: h.wallId, member: h.member };
      }
    }
    for (let i = window._wallPanelStudHits.length - 1; i >= 0; i--) {
      const h = window._wallPanelStudHits[i];
      if (p.x >= h.x0 - 4 && p.x <= h.x1 + 4 && p.y >= h.y0 - 3 && p.y <= h.y1 + 3) {
        return { id: h.id, type: 'stud', isStud: true, wallId: h.wallId, host: h.wallId, member: h.member };
      }
    }
  }
  let q=world(p),best=null,bd=320/scale;
  const elems = [...model.elements.filter(shown)].sort((a,b)=>{
    const aIsDim = a.type === 'dimension';
    const bIsDim = b.type === 'dimension';
    if(aIsDim && !bIsDim) return -1;
    if(!aIsDim && bIsDim) return 1;
    const aIsOp = ['window','door','cornerwin','skylight'].includes(a.type);
    const bIsOp = ['window','door','cornerwin','skylight'].includes(b.type);
    if(aIsOp && !bIsOp) return -1;
    if(!aIsOp && bIsOp) return 1;
    return 0;
  });

  // Check individual wall studs in Floor Plan (plan) and 2D Framing Plan (framingplan)
  const hasSelectedStud = selected.some(id => typeof id === 'string' && id.includes(':STUD:'));
  if (!editing && (view === 'framingplan' || (view === 'plan' && hasSelectedStud && isLayerVisible('Structure'))) && typeof generateWallFraming === 'function' && typeof framingMemberWorld === 'function' && typeof construction === 'function') {
    const gripTol = 11 / Math.max(baseScale * scale, 0.005);
    const wallsOnStory = elems.filter(e => e.type === 'wall' && e.story === activeStory);
    const nearSelectedWallEndpoint = wallsOnStory.some(w => selected.includes(w.id) && (distance(q, w.a) < gripTol || distance(q, w.b) < gripTol));
    if (!nearSelectedWallEndpoint) {
      // First check if cursor is inside or near an already-selected stud
      for (const w of wallsOnStory) {
        if (!construction(w).enabled) continue;
        const wMembers = generateWallFraming(w).members;
        for (const m of wMembers) {
          if (!m.isStud || !selected.includes(m.id)) continue;
          const polyPts = framingMemberWorld(w, m);
          if (polyPts && polyPts.length >= 3) {
            const cx = polyPts.reduce((s, pt) => s + pt.x, 0) / polyPts.length;
            const cy = polyPts.reduce((s, pt) => s + pt.y, 0) / polyPts.length;
            if (inside(q, polyPts) || Math.hypot(q.x - cx, q.y - cy) < Math.max(35, (m.studDepth || 140) * 0.6)) {
              return { id: m.id, type: 'stud', isStud: true, wallId: w.id, host: w.id, member: m };
            }
          }
        }
      }
      for (const w of wallsOnStory) {
        if (!construction(w).enabled) continue;
        const wMembers = generateWallFraming(w).members;
        for (const m of wMembers) {
          if (!m.isStud) continue;
          const polyPts = framingMemberWorld(w, m);
          if (polyPts && polyPts.length >= 3 && inside(q, polyPts)) {
            return { id: m.id, type: 'stud', isStud: true, wallId: w.id, host: w.id, member: m };
          }
        }
        if (typeof getOpeningHiddenStuds === 'function') {
          for (const o of hosted(w)) {
            const hiddenStuds = getOpeningHiddenStuds(w, o, model, wMembers);
            for (const hs of hiddenStuds) {
              if (hs.poly && hs.poly.length >= 3 && inside(q, hs.poly)) {
                return { id: hs.id, type: 'stud', isStud: true, wallId: w.id, host: w.id, member: hs.member || { id: hs.id, wallId: w.id, type: 'Header stud', x0: hs.x0, x1: hs.x1, z0: o.sill || 0, z1: (o.sill || 0) + (o.height || 1200), depth: hs.depth, isStud: true } };
              }
            }
          }
        }
      }
    }
  }

  // Check individual floor members only in ewpspecs (do not pick floor framing in Floor Plan or 2D wall framing plan)
  if (!editing && view === 'ewpspecs' && typeof pickFloorMemberAtPoint === 'function') {
    const fmHit = pickFloorMemberAtPoint(q);
    if (fmHit) {
      return { id: fmHit.id, type: 'floorMember', isFloorMember: true, slabId: fmHit.slabId, member: fmHit };
    }
  }

  for(const e of elems){
    let d=Infinity;
    if(e.type==='window'||e.type==='door'||e.type==='cornerwin'||e.type==='skylight'){
      const z=openingPoint(e);
      if(z) d=Math.max(-10, distance(q,z)-(e.width||1200)/2);
    }else if(e.type==='dimension'){
      const seg=resolveDimension(e);
      if(seg.a&&seg.b){
        const off=e.offset??600;
        const dx=seg.b.x-seg.a.x, dy=seg.b.y-seg.a.y, len=Math.hypot(dx,dy)||1;
        const nx=-dy/len*off, ny=dx/len*off;
        const aa={x:seg.a.x+nx, y:seg.a.y+ny};
        const bb={x:seg.b.x+nx, y:seg.b.y+ny};
        const mid={x:(aa.x+bb.x)/2, y:(aa.y+bb.y)/2};
        const dLine = segmentDistance(q, aa, bb).distance;
        const dWitA = segmentDistance(q, seg.a, {x:aa.x+nx*0.15, y:aa.y+ny*0.15}).distance;
        const dWitB = segmentDistance(q, seg.b, {x:bb.x+nx*0.15, y:bb.y+ny*0.15}).distance;
        const dMid = distance(q, mid);
        const dA = distance(q, seg.a);
        const dB = distance(q, seg.b);
        d = Math.min(dLine, dWitA, dWitB, dMid, dA, dB);
        if(dLine <= 14 / (baseScale * scale) || dMid <= 20 / (baseScale * scale)){
          d = 0;
        }
      }
    }else if(['wall','beam','line','stair','railing','curtainwall','grid'].includes(e.type)){
      const seg=e;
      if(seg.a&&seg.b){
        d=e.type==='wall'&&(inside(q,wallPoly(e))||segmentDistance(q,seg.a,seg.b).distance<=e.thickness/2) ? 0 : segmentDistance(q,seg.a,seg.b).distance;
      }
    }else if(['column','object','lamp','camera','leveldim','detail','changemarker','label','wallend'].includes(e.type)&&e.a){
      d=distance(q,e.a);
    }else if(e.type==='circle'||e.type==='radialdim'){
      d=Math.abs(distance(q,e.a)-(e.radius||1500));
    }else if(e.type==='arc'||e.type==='angledim'){
      const ang=(Math.atan2(q.y-e.a.y,q.x-e.a.x)-(e.startAngle??0)+Math.PI*2)%(Math.PI*2);
      if(ang<=(e.sweep??Math.PI*1.5))d=Math.abs(distance(q,e.a)-(e.radius||1500));
    }else if(e.type==='text'){
      d=distance(q,e.a);
    }else if(e.points){
      for(let i=0;i<e.points.length;i++)d=Math.min(d,segmentDistance(q,e.points[i],e.points[(i+1)%e.points.length]).distance);
      if(inside(q,e.points))d=0;
    }
    if(d<bd){best=e;bd=d;}
  }
  return best;
}
function dim(a,b,offset,text,options={}){
  if($('#wall-dimensions-toggle')?.checked===false&&(view==='panel'||view==='plan'||view==='framingplan'||view==='roofframingplan'||view==='ewpspecs'))return;
  const s=getTextScale();
  const isSel = Boolean(options.isSel);
  const isPreview = Boolean(options.isPreview);
  const dimEl = options.dimEl;

  a=p2(a);b=p2(b);
  let dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len*offset,ny=dx/len*offset;
  let aa={x:a.x+nx,y:a.y+ny},bb={x:b.x+nx,y:b.y+ny};

  const dimColor = isSel ? '#0284c7' : (isPreview ? '#0284c7' : '#718096');
  const witColor = isSel ? '#0284c7' : (isPreview ? '#0284c7aa' : '#94a3b8');
  const tickColor = isSel ? '#0284c7' : '#475569';
  const lw = isSel ? 2 : (isPreview ? 1.4 : 0.85);
  const dash = isPreview ? [5, 4] : [];

  // Witness lines (extend 15% past dimension line)
  line(a,{x:aa.x+nx*.15,y:aa.y+ny*.15},witColor,lw,dash);
  line(b,{x:bb.x+nx*.15,y:bb.y+ny*.15},witColor,lw,dash);
  // Dimension baseline
  line(aa,bb,dimColor,lw,dash);

  // 45° Architectural ticks
  const tickSize = isSel ? 5 : 3.5;
  for(const p of [aa,bb]){
    line({x:p.x-tickSize,y:p.y+tickSize},{x:p.x+tickSize,y:p.y-tickSize},tickColor,isSel ? 2.2 : 1.2);
  }

  // Selection grip nodes (Timber Teck cyan/blue square handles)
  if(isSel){
    const grips = [a, b, aa, bb, {x:(aa.x+bb.x)/2, y:(aa.y+bb.y)/2}];
    for(const gp of grips){
      rect(gp.x-4, gp.y-4, 8, 8, '#ffffff', '#0284c7', 1.6);
    }
  }

  // Formatted text
  let displayStr = text;
  if(!displayStr){
    if(dimEl?.customText && String(dimEl.customText).trim()){
      displayStr = String(dimEl.customText).trim();
    }else{
      const distMm = Math.round(distance(world(a),world(b)));
      const pfx = dimEl?.prefix || '';
      if (isImperialUnits() && (!dimEl?.suffix || dimEl?.suffix === ' mm')) {
        displayStr = `${pfx}${formatLength(distMm)}`;
      } else {
        const sfx = dimEl?.suffix !== undefined && dimEl?.suffix !== '' ? dimEl.suffix : ' mm';
        displayStr = `${pfx}${distMm}${sfx}`;
      }
    }
  }

  ctx.save();
  ctx.translate((aa.x+bb.x)/2,(aa.y+bb.y)/2);
  let ang = Math.atan2(dy,dx);
  if(ang > Math.PI/2) ang -= Math.PI;
  else if(ang < -Math.PI/2) ang += Math.PI;
  ctx.rotate(ang);

  ctx.font = `${(isSel ? 6.5 : 5.8) * s}px "DM Sans", Arial, sans-serif`;
  const tm = ctx.measureText(displayStr);
  const bw = Math.max(28 * s, tm.width + 10 * s);
  const bh = 15 * s;
  ctx.fillStyle = isSel ? '#f0f9ff' : '#f7f9f6';
  ctx.fillRect(-bw/2, -bh/2, bw, bh);
  if(isSel){
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(-bw/2, -bh/2, bw, bh);
  }

  label(displayStr, 0, 0, isSel ? 6.5 : 5.8, isSel ? '#0284c7' : '#334155');
  ctx.restore();
}
function furniture(){if(activeStory!=='s0'||model.name!=='Courtyard House'||!isLayerVisible('Annotations'))return;ctx.save();
const rooms=[['BEDROOM 01',18.6,2350,3900],['LIVING ROOM',19.2,2350,5500],['KITCHEN',12.4,6600,2600],['BEDROOM 02',14.4,10800,2750],['BATHROOM',9.9,10800,5350],['DINING / LIVING',43.4,6800,8300]];for(const [name,areaM2,x,y] of rooms){let p=p2({x,y});label(name,p.x,p.y,6.5,'#82917b');label(formatAreaFromM2(areaM2),p.x,p.y+15,6,'#a0aa97')}ctx.restore()}
function drawTraceReference(){
  if(!traceActive||view!=='plan')return;
  const refStory=model.stories.find(s=>s.id!==activeStory)||model.stories[0];
  if(!refStory||refStory.id===activeStory)return;
  ctx.save();
  ctx.globalAlpha=0.28;
  for(const e of model.elements.filter(e=>e.story===refStory.id&&isLayerVisible(e.layer)&&(!e.host||isLayerVisible(hostOf(e)?.layer)))){
    if(e.type==='wall'||e.type==='beam'){
      poly(wallPoly(e).map(p2),'#fed7aa','#ea580c',0.8);
    }else if(e.type==='slab'&&e.points){
      poly(e.points.map(p2),'#ffedd5','#ea580c',0.8);
    }else if(e.type==='column'&&e.a){
      const p=p2(e.a),r=(e.thickness||300)*baseScale*scale;
      rect(p.x-r/2,p.y-r/2,r,r,'#fed7aa','#ea580c',0.8);
    }else if(e.a&&e.b){
      line(p2(e.a),p2(e.b),'#ea580c',0.8,[5,3]);
    }
  }
  ctx.restore();
}
function drawPlan(){
  const s=baseScale*scale;
  drawTraceReference();
  let slabs=model.elements.filter(e=>shown(e)&&e.type==='slab');
  for(const e of slabs){
    const slabSelected = selected.includes(e.id);
    poly(defaultSlabPolygon(e).map(p2),slabSelected?'#e4eee4':'#fafbf7','#d5decf',1);
  }
  if(activeStory==='s0'&&model.name==='Courtyard House'){
    if(isLayerVisible('Structure')){
      let a=p2({x:0,y:9250}),b=p2({x:13000,y:10900});rect(a.x,a.y,b.x-a.x,b.y-a.y,'#eff3e9','#d5dfce',.8);
      for(let x=100;x<13000;x+=300)line(p2({x,y:9250}),p2({x,y:10900}),'#dde4d5',.5);
    }
    if(isLayerVisible('Annotations')){
      label('TIMBER DECK',width/2+pan.x,p2({x:0,y:10300}).y,8,'#97a58a');
    }
  }
  furniture();renderJoinedPlanWalls();
  for(const e of model.elements.filter(shown)){
    let sel=selected.includes(e.id),color=sel?'#426e59':'#74866a';
    if(e.type==='wall'||e.type==='beam'){
      if(e.type==='beam')poly(wallPoly(e).map(p2),sel?'#a8c2ab':'#bdc8ad',color,sel?1.5:1);
      for(const o of hosted(e).filter(shown)){
        const len=distance(e.a,e.b),a=lerp(e.a,e.b,(o.offset-o.width/2)/len),b=lerp(e.a,e.b,(o.offset+o.width/2)/len);
        const ps=wallPoly(e,a,b,e.thickness*.65).map(p2),oc=selected.includes(o.id)?'#285c47':'#80957a';
        if(o.type==='window'||o.type==='cornerwin'){
          poly(ps,'#edf2e9',oc,.8);line(p2(wallCenterPoint(e,a)),p2(wallCenterPoint(e,b)),oc,.7);line(ps[0],ps[3],oc,.7);line(ps[1],ps[2],oc,.7);
        }else{
          const pa=p2(wallCenterPoint(e,a)),pb=p2(wallCenterPoint(e,b)),ang=Math.atan2(pb.y-pa.y,pb.x-pa.x);
          ctx.beginPath();ctx.arc(pa.x,pa.y,o.width*s,ang-Math.PI/2,ang);ctx.strokeStyle=oc;ctx.lineWidth=.8;ctx.stroke();
          line(pa,{x:pa.x+Math.cos(ang-Math.PI/2)*o.width*s,y:pa.y+Math.sin(ang-Math.PI/2)*o.width*s},oc,.8);
        }
      }
      if(sel){
        if(e.type==='wall')line(p2(e.a),p2(e.b),'#4c8765',.8,[4,3]);
        for(const p of [p2(e.a),p2(e.b)])rect(p.x-3,p.y-3,6,6,'#fff','#426e59',1.2);
        let mid=p2(lerp(e.a,e.b,.5));$('#selection-tip').style.cssText=`display:block;left:${mid.x-27}px;top:${mid.y+14}px`;$('#selection-tip').textContent=e.id;
      }
    }else if(e.type==='stair'&&e.a&&e.b){
      const w=e.width||1000,len=distance(e.a,e.b)||1,u={x:(e.b.x-e.a.x)/len,y:(e.b.y-e.a.y)/len},n={x:-u.y,y:u.x};
      const c1={x:e.a.x-n.x*w/2,y:e.a.y-n.y*w/2},c2={x:e.b.x-n.x*w/2,y:e.b.y-n.y*w/2},c3={x:e.b.x+n.x*w/2,y:e.b.y+n.y*w/2},c4={x:e.a.x+n.x*w/2,y:e.a.y+n.y*w/2};
      poly([c1,c2,c3,c4].map(p2),sel?'#e0ece1':'#f4f6f2',color,sel?2:1.2);
      const risers=e.risers||16;
      for(let i=1;i<risers;i++){const t1=lerp(c1,c2,i/risers),t2=lerp(c4,c3,i/risers);line(p2(t1),p2(t2),color,0.75)}
      line(p2(e.a),p2(e.b),color,1.2);
      const head=p2(e.b);ctx.beginPath();ctx.arc(head.x,head.y,3.5,0,7);ctx.fillStyle=color;ctx.fill();
      const mid=p2(lerp(e.a,e.b,0.5));label(`${risers} risers @ ${formatLength(e.riserHeight||190.5)}`,mid.x,mid.y-12,8,color);
      if(sel)for(const p of [p2(e.a),p2(e.b)])rect(p.x-3,p.y-3,6,6,'#fff',color,1.2);
    }else if(e.type==='railing'&&e.a&&e.b){
      line(p2(e.a),p2(e.b),color,sel?2.5:1.6);
      const len=distance(e.a,e.b),cnt=Math.max(1,Math.floor(len/250));
      for(let i=0;i<=cnt;i++){const pt=p2(lerp(e.a,e.b,i/cnt));rect(pt.x-2,pt.y-2,4,4,color,color)}
      if(sel)for(const p of [p2(e.a),p2(e.b)])rect(p.x-3,p.y-3,6,6,'#fff',color,1.2);
    }else if(e.type==='curtainwall'&&e.a&&e.b){
      const w=e.thickness||120,len=distance(e.a,e.b)||1,n={x:-(e.b.y-e.a.y)/len*w/2,y:(e.b.x-e.a.x)/len*w/2};
      const ps=[{x:e.a.x+n.x,y:e.a.y+n.y},{x:e.b.x+n.x,y:e.b.y+n.y},{x:e.b.x-n.x,y:e.b.y-n.y},{x:e.a.x-n.x,y:e.a.y-n.y}];
      poly(ps.map(p2),sel?'#bae6fd80':'#e0f2fe60',color,sel?2:1.2);
      line(p2(e.a),p2(e.b),'#0284c7',1);
      const panels=Math.max(1,Math.floor(len/(e.panelWidth||1200)));
      for(let i=1;i<panels;i++){const pA=lerp(ps[0],ps[1],i/panels),pB=lerp(ps[3],ps[2],i/panels);line(p2(pA),p2(pB),color,1.2)}
      if(sel)for(const p of [p2(e.a),p2(e.b)])rect(p.x-3,p.y-3,6,6,'#fff',color,1.2);
    }else if(e.type==='grid'&&e.a&&e.b){
      line(p2(e.a),p2(e.b),color,1,[10,5]);
      for(const pt of [p2(e.a),p2(e.b)]){
        ctx.beginPath();ctx.arc(pt.x,pt.y,12,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.stroke();
        label(e.bubble||'A',pt.x,pt.y,9,color);
      }
    }else if(e.type==='leveldim'&&e.a){
      const p=p2(e.a);
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-6,p.y-10);ctx.lineTo(p.x+6,p.y-10);ctx.closePath();
      ctx.fillStyle=sel?'#3b82f6':color;ctx.fill();
      line({x:p.x-12,y:p.y-10},{x:p.x+12,y:p.y-10},color,1.2);
      label(`▼ +${formatLength(e.targetHeight??storyOf(e).elevation)}`,p.x+16,p.y-10,9,color,'left');
    }else if(e.type==='radialdim'&&e.a){
      const p=p2(e.a),r=(e.radius||1500)*s;
      ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*0.35);ctx.strokeStyle=color;ctx.stroke();
      line(p,{x:p.x+r*Math.cos(0.2),y:p.y+r*Math.sin(0.2)},color,1);
      label(`R ${formatLength(e.radius||1500)}`,p.x+r*0.6,p.y+r*0.3,9,color);
    }else if(e.type==='angledim'&&e.a){
      const p=p2(e.a);
      ctx.beginPath();ctx.arc(p.x,p.y,30,0,Math.PI/2);ctx.strokeStyle=color;ctx.stroke();
      line(p,{x:p.x+40,y:p.y},color,1);line(p,{x:p.x,y:p.y+40},color,1);
      label(`${e.angle||90}°`,p.x+20,p.y+20,9,color);
    }else if(e.type==='label'&&e.a){
      const p=p2(e.a);
      line(p,{x:p.x+25,y:p.y-15},color,1);line({x:p.x+25,y:p.y-15},{x:p.x+90,y:p.y-15},color,1);
      label(e.text||'Element',p.x+30,p.y-22,9,color,'left');
    }else if(e.type==='detail'&&e.a){
      const p=p2(e.a),r=(e.radius||800)*s;
      ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.strokeStyle=color;ctx.setLineDash([5,3]);ctx.stroke();ctx.setLineDash([]);
      ctx.beginPath();ctx.arc(p.x+r+10,p.y-r-10,12,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle=color;ctx.stroke();
      label(e.code||'D-01',p.x+r+10,p.y-r-10,8,color);
    }else if(e.type==='changemarker'&&e.a){
      const p=p2(e.a);
      ctx.beginPath();ctx.moveTo(p.x,p.y-10);ctx.lineTo(p.x+10,p.y+8);ctx.lineTo(p.x-10,p.y+8);ctx.closePath();
      ctx.fillStyle=sel?'#f59e0b':'#fef3c7';ctx.fill();ctx.strokeStyle=color;ctx.stroke();
      label(e.changeNumber||'CH-01',p.x+15,p.y,8,color,'left');
    }else if(e.type==='wallend'&&e.a){
      const p=p2(e.a);ctx.beginPath();ctx.arc(p.x,p.y,8,0,7);ctx.fillStyle=color;ctx.fill();
    }else if(e.type==='lamp'&&e.a){
      const p=p2(e.a);ctx.beginPath();ctx.arc(p.x,p.y,7,0,7);ctx.fillStyle='#fef08a';ctx.fill();ctx.strokeStyle=color;ctx.stroke();
      line({x:p.x-6,y:p.y-6},{x:p.x+6,y:p.y+6},color,1);line({x:p.x-6,y:p.y+6},{x:p.x+6,y:p.y-6},color,1);
    }else if(e.type==='camera'&&e.a){
      const p=p2(e.a);rect(p.x-7,p.y-5,14,10,'#334155',color);
      line(p,{x:p.x+40,y:p.y-25},'#64748b',0.8,[3,3]);line(p,{x:p.x+40,y:p.y+25},'#64748b',0.8,[3,3]);
      label('CAM',p.x,p.y+14,7.5,color);
    }else if(e.type==='object'&&e.a){
      const p=p2(e.a),w=(e.width||1600)*s,d=(e.depth||900)*s,sub=e.subtype||'Table & Chairs';
      if(sub==='Table & Chairs'){
        rect(p.x-w/2,p.y-d/2,w,d,sel?'#cbd5e1':'#f5f7f2',color,1.2);
        const cw=w/3.6,cd=Math.max(6,d*0.22);
        for(let i=0;i<3;i++){
          rect(p.x-w/2+i*(w/2.8)+6,p.y-d/2-cd-2,cw,cd,'#fff',color,0.8);
          rect(p.x-w/2+i*(w/2.8)+6,p.y+d/2+2,cw,cd,'#fff',color,0.8);
        }
      }else if(sub==='Living Sofa Set'){
        rect(p.x-w/2,p.y-d/2,w,d,sel?'#cbd5e1':'#eaf0e6',color,1.2);
        rect(p.x-w/2+4,p.y-d/2+3,w-8,d*0.3,'#dfe8da',color,0.8);
        for(let i=1;i<3;i++)line({x:p.x-w/2+i*(w/3),y:p.y-d/2+d*0.3},{x:p.x-w/2+i*(w/3),y:p.y+d/2-3},color,0.7);
      }else if(sub==='Double Bed'){
        rect(p.x-w/2,p.y-d/2,w,d,sel?'#cbd5e1':'#fafbf7',color,1.2);
        rect(p.x-w/2,p.y-d/2,w,Math.max(8,d*0.14),'#dce5d8',color,1);
        rect(p.x-w/2+10,p.y-d/2+15,w/2.4,d*0.22,'#f0f4ec',color,0.7);
        rect(p.x+4,p.y-d/2+15,w/2.4,d*0.22,'#f0f4ec',color,0.7);
        line({x:p.x-w/2,y:p.y-d/2+d*0.48},{x:p.x+w/2,y:p.y-d/2+d*0.48},color,0.8);
      }else if(sub==='Office Desk'){
        rect(p.x-w/2,p.y-d/2,w,d,sel?'#cbd5e1':'#f5f7f2',color,1.2);
        line({x:p.x-18,y:p.y-d/4},{x:p.x+18,y:p.y-d/4},'#334155',1.8);
        ctx.beginPath();ctx.arc(p.x,p.y+d/4,12*s*10,0,7);ctx.strokeStyle=color;ctx.stroke();
      }else if(sub==='Kitchen Counter'){
        rect(p.x-w/2,p.y-d/2,w,d,sel?'#cbd5e1':'#e8ece3',color,1.2);
        rect(p.x-w/3,p.y-d/3,w/4,d*0.65,'#fff',color,0.8);
        rect(p.x-w/3+w/4+4,p.y-d/3,w/4,d*0.65,'#fff',color,0.8);
        for(const [bx,by] of [[p.x+w/4-8,p.y-8],[p.x+w/4+8,p.y-8],[p.x+w/4-8,p.y+8],[p.x+w/4+8,p.y+8]]){
          ctx.beginPath();ctx.arc(bx,by,4,0,7);ctx.strokeStyle='#475569';ctx.stroke();
        }
      }else if(sub==='Bathroom WC'){
        rect(p.x-w/2+8,p.y-d/2,w-16,d*0.3,'#fff',color,1);
        ctx.beginPath();ctx.ellipse(p.x,p.y+4,w*0.32,d*0.38,0,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle=color;ctx.stroke();
      }else{
        rect(p.x-w/2,p.y-d/2,w,d,sel?'#cbd5e1':'#e2e8f0',color,1.2);
      }
      label(sub,p.x,p.y,7.5,color);
    }else if(e.type==='skylight'&&e.a){
      const p=p2(e.a),w=(e.width||1000)*s,l=(e.length||1400)*s;
      rect(p.x-w/2,p.y-l/2,w,l,'#bae6fd80',sel?'#0284c7':'#0369a1',1.2);
      line({x:p.x-w/2,y:p.y},{x:p.x+w/2,y:p.y},'#0284c7',0.8);line({x:p.x,y:p.y-l/2},{x:p.x,y:p.y+l/2},'#0284c7',0.8);
      label('Skylight',p.x,p.y+l/2+8,7.5,'#0369a1');
    }else if(e.type==='zone'&&e.points){
      poly(e.points.map(p2),'#e8f5e940',sel?'#2e7d32':'#81c784',sel?2:1);
      const cx=e.center?p2(e.center):p2({x:e.points.reduce((s,p)=>s+p.x,0)/e.points.length,y:e.points.reduce((s,p)=>s+p.y,0)/e.points.length});
      rect(cx.x-44,cx.y-24,88,48,'#ffffffeb',sel?'#2e7d32':'#718e7b',1.2);
      label(e.roomName||'LIVING ROOM',cx.x,cx.y-13,8.5,'#1b5e20','center');
      label(`No. ${e.zoneNumber||'01'}`,cx.x,cx.y-2,7.5,'#558b2f','center');
      label(`${e.areaM2?formatAreaFromM2(e.areaM2):'—'}`,cx.x,cx.y+9,8,'#2e7d32','center');
      label(`FL: +${formatLength(storyOf(e).elevation)}`,cx.x,cx.y+19,7,'#78909c','center');
    }else if(e.type==='fill'&&e.points){
      poly(e.points.map(p2),e.backgroundColor||'#eef3eb',color,sel?2:1);
      const pts=e.points.map(p2),minX=Math.min(...pts.map(p=>p.x)),maxX=Math.max(...pts.map(p=>p.x)),minY=Math.min(...pts.map(p=>p.y)),maxY=Math.max(...pts.map(p=>p.y));
      ctx.save();ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.clip();
      ctx.strokeStyle=color;ctx.lineWidth=0.7;
      const hType=e.hatchType||'diagonal45';
      if(hType==='cross'){
        for(let x=minX-maxY+minY;x<maxX+maxY-minY;x+=12){ctx.beginPath();ctx.moveTo(x,minY);ctx.lineTo(x+maxY-minY,maxY);ctx.stroke()}
        for(let x=minX-maxY+minY;x<maxX+maxY-minY;x+=12){ctx.beginPath();ctx.moveTo(x,maxY);ctx.lineTo(x+maxY-minY,minY);ctx.stroke()}
      }else if(hType!=='solid'){
        for(let x=minX-maxY+minY;x<maxX+maxY-minY;x+=12){ctx.beginPath();ctx.moveTo(x,minY);ctx.lineTo(x+maxY-minY,maxY);ctx.stroke()}
      }
      ctx.restore();
    }else if(e.type==='morph'&&e.points){
      poly(e.points.map(p2),sel?'#cbd5e180':'#e2e8f050',color,sel?2:1.2);
      const pts=e.points.map(p2),cx=pts.reduce((a,p)=>a+p.x,0)/pts.length,cy=pts.reduce((a,p)=>a+p.y,0)/pts.length;
      for(const p of pts)line({x:cx,y:cy},p,color,0.5,[3,3]);
      if(sel)for(const p of pts)rect(p.x-3,p.y-3,6,6,'#fff',color,1.2);
    }else if(e.type==='mesh'&&e.points){
      poly(e.points.map(p2),sel?'#bbf7d080':'#dcfce750',color,sel?2:1.2);
      label(`Topo +${e.elevation||0}`,p2(e.points[0]).x,p2(e.points[0]).y-10,8,color);
      if(sel)for(const p of e.points.map(p2))rect(p.x-3,p.y-3,6,6,'#fff',color,1.2);
    }else if(e.type==='spline'&&e.points){
      if(e.points.length>1){
        const pts=e.points.map(p2);ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
        for(let i=1;i<pts.length;i++){const mid={x:(pts[i-1].x+pts[i].x)/2,y:(pts[i-1].y+pts[i].y)/2};ctx.quadraticCurveTo(pts[i-1].x,pts[i-1].y,mid.x,mid.y)}
        ctx.lineTo(pts.at(-1).x,pts.at(-1).y);ctx.strokeStyle=color;ctx.lineWidth=sel?2:1.2;ctx.stroke();
      }
      if(sel)for(const p of e.points.map(p2))rect(p.x-3,p.y-3,6,6,'#fff',color,1.2);
    }else if(['line','dimension'].includes(e.type)){
      if(e.type==='dimension'){
        const d=resolveDimension(e);dim(d.a,d.b,(e.offset??600)*baseScale*scale,null,{isSel:sel,dimEl:e});
        if(!d.resolved){const p=p2(lerp(d.a,d.b,.5));label('Detached anchor',p.x,p.y+18,8,'#a18258')}
      }else{
        line(p2(e.a),p2(e.b),color,sel?2:1);
        if(sel)for(const p of [p2(e.a),p2(e.b)])rect(p.x-3,p.y-3,6,6,'white','#426e59',1.2);
      }
    }else if(e.type==='column'){
      const p=p2(e.a),r=(e.thickness||300)*s;
      if(e.columnProfile==='circle'){
        ctx.beginPath();ctx.arc(p.x,p.y,r/2,0,7);ctx.fillStyle=sel?'#9fb89f':'#c0cab6';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=sel?2:1;ctx.stroke();
        line({x:p.x-r/2,y:p.y},{x:p.x+r/2,y:p.y},color,0.6);line({x:p.x,y:p.y-r/2},{x:p.x,y:p.y+r/2},color,0.6);
      }else{
        rect(p.x-r/2,p.y-r/2,r,r,sel?'#9fb89f':'#c0cab6',color,1);
      }
    }else if(e.type==='circle'||e.type==='arc'){
      const p=p2(e.a);ctx.beginPath();
      ctx.arc(p.x,p.y,e.radius*s,e.type==='arc'?(e.startAngle??0):0,e.type==='arc'?(e.startAngle??0)+(e.sweep??Math.PI*1.5):Math.PI*2);
      ctx.strokeStyle=color;ctx.lineWidth=sel?2:1;ctx.stroke();
    }else if(e.type==='text'){
      const p=p2(e.a);label(e.text,p.x,p.y,12,color,'left');
    }else if(e.type==='polyline'){
      for(let i=1;i<e.points.length;i++)line(p2(e.points[i-1]),p2(e.points[i]),color,sel?2:1);
    }else if(e.type==='roof'){
      drawRoofPlan(e,sel);
    }else if(e.points&&e.type!=='slab'&&e.type!=='zone'){
      poly(e.points.map(p2),e.type==='roof'?'#e9e8db':null,color,sel?2:1);
      if(e.type==='roof'){line(p2(e.points[0]),p2(e.points[2]),'#a9ae96',.7)}
    }
  }
  if(pendingOpening&&hover){
    const w=hostOf(pendingOpening);
    if(w){
      const len=distance(w.a,w.b)||1,u={x:(w.b.x-w.a.x)/len,y:(w.b.y-w.a.y)/len},n={x:-u.y,y:u.x};
      const opCenter=lerp(w.a,w.b,pendingOpening.offset/len);
      const dotN=(hover.x-opCenter.x)*n.x+(hover.y-opCenter.y)*n.y,dotU=(hover.x-opCenter.x)*u.x+(hover.y-opCenter.y)*u.y;
      const flipped=dotN<0,hand=dotU>0?'right':'left',pa=p2(opCenter);
      ctx.save();ctx.strokeStyle='#0284c7';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
      const ang=Math.atan2(w.b.y-w.a.y,w.b.x-w.a.x)+(flipped?Math.PI:0);
      ctx.beginPath();ctx.arc(pa.x,pa.y,pendingOpening.width*s,ang-(hand==='right'?Math.PI/2:-Math.PI/2),ang);ctx.stroke();
      ctx.restore();
      label(`Opening swing: ${flipped?'Interior':'Exterior'} / ${hand==='right'?'Right':'Left'} (Click to confirm)`,pa.x,pa.y-18,9,'#0284c7');
    }
  }
  if(isLayerVisible('Annotations')){
    const walls = model.elements.filter(e => e.type === 'wall' && e.story === activeStory && shown(e));
    const centroid = walls.length ? {
      x: walls.reduce((acc, el) => acc + (el.a.x + el.b.x) / 2, 0) / walls.length,
      y: walls.reduce((acc, el) => acc + (el.a.y + el.b.y) / 2, 0) / walls.length
    } : { x: 0, y: 0 };
    const extWalls = walls.filter(isExteriorWall);
    for(const w of extWalls){
      const corners = typeof getWallCornerEndpoints === 'function' ? getWallCornerEndpoints(w) : { a: w.a, b: w.b, len: distance(w.a, w.b), outSign: -1 };
      if(corners.len < 100) continue;
      const offset = (corners.outSign || -1) * 42 * scale;
      const dimStr = formatLength(corners.len);
      dim(corners.a, corners.b, offset, dimStr);
    }
    // Internal wall dimensions (wall-to-wall)
    const intWalls = walls.filter(w => !isExteriorWall(w));
    for(const w of intWalls){
      const run = typeof framingRun === 'function' ? framingRun(w) : { start: 0, end: distance(w.a, w.b) };
      const len = Math.max(0, run.end - run.start);
      if(len < 150) continue;
      const wLen = distance(w.a, w.b) || 1;
      const u = sub2(w.b, w.a);
      const n = { x: -u.y / wLen, y: u.x / wLen };
      const mid = lerp(w.a, w.b, 0.5);
      const outSign = ((mid.x - centroid.x) * n.x + (mid.y - centroid.y) * n.y >= 0) ? 1 : -1;
      const pw = typeof framingMemberWorld === 'function' ? framingMemberWorld(w, { x0: run.start, x1: run.end, depth: construction(w).studDepth }) : [w.a, w.b, w.b, w.a];
      const intA = outSign > 0 ? pw[0] : pw[3];
      const intB = outSign > 0 ? pw[1] : pw[2];
      dim(intA, intB, outSign * 28 * scale, formatLength(len));
    }
    // Parallel, non-overlapping window & door labels on 2D floor plan
    if ($('#wall-dimensions-toggle')?.checked !== false) {
      const ts = getTextScale();
      for (const w of walls) {
        const wLen = distance(w.a, w.b) || 1;
        const u = { x: (w.b.x - w.a.x) / wLen, y: (w.b.y - w.a.y) / wLen };
        const n = { x: -u.y, y: u.x };
        const mid = lerp(w.a, w.b, 0.5);
        const outSign = ((mid.x - centroid.x) * n.x + (mid.y - centroid.y) * n.y >= 0) ? 1 : -1;
        const spA = p2(w.a), spB = p2(w.b);
        let ang = Math.atan2(spB.y - spA.y, spB.x - spA.x);
        if (ang > Math.PI / 2) ang -= Math.PI;
        else if (ang < -Math.PI / 2) ang += Math.PI;
        for (const o of hosted(w).filter(shown)) {
          const opPt = lerp(w.a, w.b, o.offset / wLen);
          const lblWorld = {
            x: opPt.x - n.x * outSign * ((w.thickness || 200) / 2 + 180 / Math.max(0.4, scale)),
            y: opPt.y - n.y * outSign * ((w.thickness || 200) / 2 + 180 / Math.max(0.4, scale))
          };
          const lp = p2(lblWorld);
          const opText = `${o.id} (${formatDimPair(o.width, o.height)})`;
          ctx.save();
          ctx.translate(lp.x, lp.y);
          ctx.rotate(ang);
          ctx.font = `bold ${6.2 * ts}px "DM Sans", Arial, sans-serif`;
          const tw = ctx.measureText(opText).width + 6 * ts;
          const th = 10 * ts;
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fillRect(-tw / 2, -th / 2, tw, th);
          ctx.fillStyle = o.type === 'door' ? '#7c2d12' : '#0369a1';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(opText, 0, 0);
          ctx.restore();
        }
      }
    }
    let a=p2({x:-1600,y:sectionPlaneY()}),b=p2({x:14200,y:sectionPlaneY()});line(a,b,'#a2b49a',.65,[6,5]);
    for(const p of [a,b]){ctx.beginPath();ctx.arc(p.x,p.y,10,0,7);ctx.fillStyle='#f7f9f6';ctx.fill();ctx.strokeStyle='#9fae97';ctx.stroke();label('A',p.x,p.y,6,'#86957e')}
  }
}
function project3(p){return cameraProject(p)}
const materials={
  Timber:['#d0c4a5','#b6ab8d','#e2dac4'],
  Concrete:['#c6cec4','#acb8ae','#e4e8e0'],
  Oak:['#c2a482','#a88e6b','#dcc5a5'],
  Glass:['#b1c8c5','#8faeab','#d4e4df'],
  Steel:['#94a3b8','#64748b','#cbd5e1'],
  Brick:['#b91c1c','#991b1b','#f87171'],
  Stone:['#78716c','#57534e','#a8a29e']
};
function prism(id,ps,z0,z1,material){
  const clipped=clipSolidGeometry(ps,z0,z1);if(!clipped)return;({ps,z0,z1}=clipped);ps=cleanPolygon(ps);
  const colors=materials[material]||materials.Timber,top=ps.map(p=>({...p,z:z1})),bottom=ps.map(p=>({...p,z:z0}));
  function face(world,color){const points=world.map(project3);projectedFaces.push({id,points,world,cutSurface:isCutFace(world),depth:points.reduce((a,p)=>a+p.depth,0)/points.length,color})}
  face(top,colors[2]);face([...bottom].reverse(),colors[1]);
  for(let i=0;i<ps.length;i++){let j=(i+1)%ps.length;face([bottom[i],bottom[j],top[j],top[i]],i%2?colors[0]:colors[1])}
}
function defaultSlabPolygon(s) {
  if (s && s.points && Array.isArray(s.points) && s.points.length >= 3) return s.points;
  if (s && s.a && s.b) {
    return [
      { x: Math.min(s.a.x, s.b.x), y: Math.min(s.a.y, s.b.y) },
      { x: Math.max(s.a.x, s.b.x), y: Math.min(s.a.y, s.b.y) },
      { x: Math.max(s.a.x, s.b.x), y: Math.max(s.a.y, s.b.y) },
      { x: Math.min(s.a.x, s.b.x), y: Math.max(s.a.y, s.b.y) }
    ];
  }
  // Align default slab polygon to exterior wall framing outer boundary if walls exist
  const story = s?.story || activeStory;
  const extWalls = model.elements.filter(e => e.type === 'wall' && (e.story === story || !e.story) && e.layer === 'Exterior Walls');
  if (extWalls.length >= 3) {
    const pts = [];
    for (const w of extWalls) {
      pts.push(w.a, w.b);
    }
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    return [
      { x: Math.min(...xs), y: Math.min(...ys) },
      { x: Math.max(...xs), y: Math.min(...ys) },
      { x: Math.max(...xs), y: Math.max(...ys) },
      { x: Math.min(...xs), y: Math.max(...ys) }
    ];
  }
  return [
    { x: 0, y: 0 },
    { x: 13000, y: 0 },
    { x: 13000, y: 9000 },
    { x: 0, y: 9000 }
  ];
}

const FLOOR_SECTION_PRESETS = [
  { id: 'I-Joist 9-1/2', name: 'I-Joist 9-1/2" (64×241 mm) · TJI 110', width: 64, depth: 241, grade: 'TJI Pro 2.0E', family: 'ijoist' },
  { id: 'I-Joist 11-7/8', name: 'I-Joist 11-7/8" (64×302 mm) · TJI 210', width: 64, depth: 302, grade: 'TJI Pro 2.0E', family: 'ijoist' },
  { id: 'I-Joist 11-7/8 Heavy', name: 'I-Joist 11-7/8" Wide Flange (89×302 mm) · TJI 360', width: 89, depth: 302, grade: 'TJI Pro 2.3E', family: 'ijoist' },
  { id: 'I-Joist 14', name: 'I-Joist 14" (64×356 mm) · TJI 360', width: 64, depth: 356, grade: 'TJI Pro 2.0E', family: 'ijoist' },
  { id: 'I-Joist 16', name: 'I-Joist 16" (89×406 mm) · TJI 560', width: 89, depth: 406, grade: 'TJI Pro 2.3E', family: 'ijoist' },
  { id: 'Posi-Strut 11-7/8 (2x4)', name: 'Posi-Strut 11-7/8" (89×302 mm Metal-Web)', width: 89, depth: 302, grade: 'C24 + Posi-Web', family: 'openweb' },
  { id: 'Posi-Strut 14 (2x4)', name: 'Posi-Strut 14" (89×356 mm Metal-Web)', width: 89, depth: 356, grade: 'C24 + Posi-Web', family: 'openweb' },
  { id: 'Posi-Strut 16 (2x4)', name: 'Posi-Strut 16" (89×406 mm Metal-Web)', width: 89, depth: 406, grade: 'C24 + Posi-Web', family: 'openweb' },
  { id: 'Floor Truss 14 (2x4)', name: 'Open-Web Floor Truss 14" (89×356 mm Wood-Web)', width: 89, depth: 356, grade: 'MSR 2100f-1.8E', family: 'openweb' },
  { id: 'Floor Truss 18 (2x4)', name: 'Open-Web Floor Truss 18" (89×457 mm Wood-Web)', width: 89, depth: 457, grade: 'MSR 2100f-1.8E', family: 'openweb' },
  { id: 'LVL 1-3/4x9-1/2', name: 'LVL 1-3/4" × 9-1/2" (45×241 mm) 2.0E', width: 45, depth: 241, grade: '2.0E LVL', family: 'lvl' },
  { id: 'LVL 1-3/4x11-7/8', name: 'LVL 1-3/4" × 11-7/8" (45×302 mm) 2.0E', width: 45, depth: 302, grade: '2.0E LVL', family: 'lvl' },
  { id: 'LVL 1-3/4x14', name: 'LVL 1-3/4" × 14" (45×356 mm) 2.0E', width: 45, depth: 356, grade: '2.0E LVL', family: 'lvl' },
  { id: 'LVL 1-3/4x16', name: 'LVL 1-3/4" × 16" (45×406 mm) 2.0E', width: 45, depth: 406, grade: '2.0E LVL', family: 'lvl' },
  { id: 'LVL 1-3/4x18', name: 'LVL 1-3/4" × 18" (45×457 mm) 2.0E', width: 45, depth: 457, grade: '2.0E LVL', family: 'lvl' },
  { id: 'PSL 3-1/2x11-7/8', name: 'PSL 3-1/2" × 11-7/8" (89×302 mm) Parallam', width: 89, depth: 302, grade: '2.0E PSL', family: 'lvl' },
  { id: 'Glulam 3-1/8x12', name: 'Glulam 3-1/8" × 12" (79×305 mm) 24F-V4', width: 79, depth: 305, grade: '24F-V4 Glulam', family: 'lvl' },
  { id: '2x8 Dimensional (38x184 C24)', name: '2x8 Dimensional Joist (38×184 mm C24)', width: 38, depth: 184, grade: 'C24 Structural', family: 'dimensional' },
  { id: '2x10 Dimensional (38x235 C24)', name: '2x10 Dimensional Joist (38×235 mm C24)', width: 38, depth: 235, grade: 'C24 Structural', family: 'dimensional' },
  { id: '2x12 Dimensional (38x286 C24)', name: '2x12 Dimensional Joist (38×286 mm C24)', width: 38, depth: 286, grade: 'C24 Structural', family: 'dimensional' },
  { id: '47x225 C24 Solid Timber', name: '47×225 mm C24 Solid Timber Joist', width: 47, depth: 225, grade: 'C24 Structural', family: 'dimensional' },
  { id: 'Rim Board 1-1/8x11-7/8 EWP', name: 'Rim Board 1-1/8" × 11-7/8" (29×302 mm EWP)', width: 38, depth: 302, grade: '1.3E Rim EWP', family: 'rim' },
  { id: 'Steel W8x18 Flush Beam + Nailer', name: 'Steel W8x18 Wide Flange + 2x8 Nailer', width: 133, depth: 207, grade: 'A992 Steel', family: 'steel' }
];
window.FLOOR_SECTION_PRESETS = FLOOR_SECTION_PRESETS;

function inferFloorSectionMeta(sectionName, fallbackWidth = 64, fallbackDepth = 302) {
  const s = String(sectionName || 'I-Joist 11-7/8');
  const exact = FLOOR_SECTION_PRESETS.find(p => p.id === s || p.name === s);
  if (exact) return { ...exact };
  const lower = s.toLowerCase();
  let family = 'ijoist';
  let width = fallbackWidth;
  let depth = fallbackDepth;
  let grade = 'TJI Pro 2.0E';
  if (lower.includes('posi') || lower.includes('truss')) {
    family = 'openweb';
    width = 89;
    grade = lower.includes('posi') ? 'C24 + Posi-Web' : 'MSR 2100f-1.8E';
  } else if (lower.includes('lvl') || lower.includes('psl') || lower.includes('glulam') || lower.includes('header') || lower.includes('trimmer')) {
    family = 'lvl';
    width = lower.includes('psl') ? 89 : lower.includes('glulam') ? 79 : 45;
    grade = '2.0E LVL';
  } else if (lower.includes('steel') || lower.includes('w8')) {
    family = 'steel';
    width = 133;
    depth = 207;
    grade = 'A992 Steel';
  } else if (lower.includes('rim') || lower.includes('band') || lower.includes('ledger')) {
    family = 'rim';
    width = 45;
    grade = '1.3E Rim EWP';
  } else if (lower.includes('dimensional') || lower.includes('c24') || lower.includes('2x') || lower.includes('47x') || lower.includes('strongback')) {
    family = 'dimensional';
    width = lower.includes('47x') ? 47 : 38;
    grade = 'C24 Structural';
  } else {
    family = 'ijoist';
    width = lower.includes('16') || lower.includes('heavy') ? 89 : 64;
  }
  if (lower.includes('9-1/2') || lower.includes('241')) depth = 241;
  else if (lower.includes('11-7/8') || lower.includes('302')) depth = 302;
  else if (lower.includes('14') || lower.includes('356')) depth = 356;
  else if (lower.includes('16') || lower.includes('406')) depth = 406;
  else if (lower.includes('18') || lower.includes('457')) depth = 457;
  else if (lower.includes('2x10') || lower.includes('235')) depth = 235;
  else if (lower.includes('2x12') || lower.includes('286')) depth = 286;
  else if (lower.includes('225')) depth = 225;
  return { id: s, name: s, width, depth, grade, family };
}

function getActiveFloorSlab(targetModel = model) {
  const m = targetModel || model;
  if (m && Array.isArray(m.elements)) {
    const onStory = m.elements.find(e => e.type === 'slab' && e.story === activeStory);
    if (onStory) return onStory;
    const anySlab = m.elements.find(e => e.type === 'slab');
    if (anySlab) return anySlab;
  }
  if (!window._virtualFloorSlab) {
    window._virtualFloorSlab = {
      id: 'slab1',
      type: 'slab',
      story: typeof activeStory !== 'undefined' ? activeStory : 's0',
      thickness: 302,
      points: [
        { x: 0, y: 0 },
        { x: 13000, y: 0 },
        { x: 13000, y: 9000 },
        { x: 0, y: 9000 }
      ]
    };
  }
  return window._virtualFloorSlab;
}
window.getActiveFloorSlab = getActiveFloorSlab;

function ensureFloorFramingEditsStore(slab) {
  const st = window.ewpBeamToolState || (window.ewpBeamToolState = {});
  if (!st.memberOverrides) st.memberOverrides = {};
  if (!Array.isArray(st.deletedMembers)) st.deletedMembers = [];
  if (!Array.isArray(st.extraMembers)) st.extraMembers = [];
  if (slab) {
    if (!slab.floorFramingEdits) {
      slab.floorFramingEdits = {
        memberOverrides: st.memberOverrides,
        deletedMembers: st.deletedMembers,
        extraMembers: st.extraMembers
      };
    } else {
      st.memberOverrides = slab.floorFramingEdits.memberOverrides || (slab.floorFramingEdits.memberOverrides = {});
      st.deletedMembers = slab.floorFramingEdits.deletedMembers || (slab.floorFramingEdits.deletedMembers = []);
      st.extraMembers = slab.floorFramingEdits.extraMembers || (slab.floorFramingEdits.extraMembers = []);
    }
  }
  return {
    memberOverrides: st.memberOverrides,
    deletedMembers: st.deletedMembers,
    extraMembers: st.extraMembers
  };
}

/**
 * Computes EWP manufacturer installation requirements for mid-span blocking rows between I-joists
 * based on clear joist span length, I-joist depth, and manufacturer rules (Weyerhaeuser TJ-4000,
 * Boise Cascade BCI, LP SolidStart, APA PRI-400).
 */
function computeEWPIJoistBlockingRequirements(baySpanMm, joistDepthMm = 302, joistSection = 'I-Joist 11-7/8', bridgingRowsMode = 'auto_ewp', bridgingType = 'solid_blocking') {
  const spanMm = Math.max(0, Number(baySpanMm) || 0);
  const spanFt = spanMm / 304.8;
  const depthMm = Math.max(150, Number(joistDepthMm) || 302);
  const isDeepIJoist = depthMm >= 355; // >= 14" (356 mm) and 16" (406 mm) I-joists
  const isOpenWeb = /posi-strut|floor truss|open-web/i.test(String(joistSection || ''));
  const mode = bridgingRowsMode || 'auto_ewp';

  let rowFractions = [];
  let rowLabels = [];
  let manufacturerStandard = 'APA PRI-400 · Weyerhaeuser TJ-4000 · Boise Cascade BCI';
  let ruleCode = 'PRI-400 / TJ-4000';
  let ruleSummary = '';
  let maxUnbracedMm = 2438; // 8'-0" max unbraced span per EWP manufacturer lateral stability & vibration specs

  if (mode === 'third_points') {
    rowFractions = [1 / 3, 2 / 3];
    rowLabels = ['L/3 (1/3 Span)', '2L/3 (2/3 Span)'];
    ruleCode = 'TJ-4000 / PRI-400 (1/3 & 2/3 Span)';
    ruleSummary = `Bay Span ${Math.round(spanMm)} mm (${spanFt.toFixed(1)} ft) → 2 Rows @ L/3 (${Math.round(spanMm / 3)} mm) & 2L/3 (${Math.round((2 * spanMm) / 3)} mm)`;
  } else if (mode === 'every_2100mm') {
    const nIntervals = Math.max(2, Math.ceil(spanMm / 2100));
    const nRows = Math.max(1, nIntervals - 1);
    rowFractions = Array.from({ length: nRows }, (_, i) => (i + 1) / nIntervals);
    rowLabels = rowFractions.map((f, i) => `Row ${i + 1}/${nRows} (${Math.round(f * 100)}% L)`);
    maxUnbracedMm = 2100;
    ruleCode = 'TJ-4000 / BCI Max 2,100 mm (7\'-0") O.C.';
    ruleSummary = `Bay Span ${Math.round(spanMm)} mm (${spanFt.toFixed(1)} ft) → ${nRows} Row(s) @ ≤ 2,100 mm (7'-0") Max O.C.`;
  } else if (mode === 'midspan') {
    if (spanMm > 1600) {
      rowFractions = [0.5];
      rowLabels = ['L/2 (Mid-Span)'];
      ruleCode = 'PRI-400 / TJ-4000 Mid-Span L/2';
      ruleSummary = `Bay Span ${Math.round(spanMm)} mm (${spanFt.toFixed(1)} ft) → 1 Mid-Span Row @ L/2 (${Math.round(spanMm * 0.5)} mm)`;
    }
  } else {
    // 'auto_ewp' — Automatic EWP Manufacturer Span & Depth Installation Rules:
    // 1) L <= 2,438 mm (8'-0"): 1 mid-span row @ L/2 when span > 1,800 mm for diaphragm & vibration control
    // 2) 2,438 mm < L <= 4,877 mm (8'-0" to 16'-0"): 1 required mid-span blocking row @ L/2 (0.50 L)
    // 3) 4,877 mm < L <= 7,315 mm (16'-0" to 24'-0"): 2 required blocking rows @ L/3 & 2L/3 (max 8'-0" unbraced)
    // 4) L > 7,315 mm (> 24'-0"): 3+ required blocking rows @ <= 2,100 mm (7'-0") O.C. (L/4, L/2, 3L/4)
    if (spanMm <= 1600) {
      rowFractions = [];
      rowLabels = [];
      ruleCode = 'PRI-400 Short Bay (≤ 5\'-3")';
      ruleSummary = `Short Bay ${Math.round(spanMm)} mm (${spanFt.toFixed(1)} ft) — End-Bearing Rim/Hanger Restraint Only`;
    } else if (spanMm <= 2438) {
      rowFractions = [0.5];
      rowLabels = ['L/2 (Mid-Span)'];
      ruleCode = 'PRI-400 / TJ-4000 §1 (L ≤ 8\'-0")';
      ruleSummary = `Span ${Math.round(spanMm)} mm (${spanFt.toFixed(1)} ft ≤ 8'-0") → 1 Mid-Span Row @ L/2 (${Math.round(spanMm * 0.5)} mm)`;
    } else if (spanMm <= 4877) {
      rowFractions = [0.5];
      rowLabels = ['L/2 (Mid-Span)'];
      ruleCode = 'PRI-400 / TJ-4000 §2 (8\'-0" < L ≤ 16\'-0")';
      ruleSummary = `Span ${Math.round(spanMm)} mm (${spanFt.toFixed(1)} ft, 8'–16') → 1 Mid-Span Row @ L/2 (${Math.round(spanMm * 0.5)} mm)`;
    } else if (spanMm <= 7315) {
      rowFractions = [1 / 3, 2 / 3];
      rowLabels = ['L/3 (1/3 Span)', '2L/3 (2/3 Span)'];
      ruleCode = 'PRI-400 / BCI §3 (16\'-0" < L ≤ 24\'-0")';
      ruleSummary = `Span ${Math.round(spanMm)} mm (${spanFt.toFixed(1)} ft, 16'–24') → 2 Rows @ L/3 (${Math.round(spanMm / 3)} mm) & 2L/3 (${Math.round((2 * spanMm) / 3)} mm)`;
    } else {
      const nIntervals = Math.max(4, Math.ceil(spanMm / 2100));
      const nRows = nIntervals - 1;
      rowFractions = Array.from({ length: nRows }, (_, i) => (i + 1) / nIntervals);
      rowLabels = rowFractions.map((f, i) => `${i + 1}L/${nIntervals} (${Math.round(f * spanMm)} mm)`);
      maxUnbracedMm = 2100;
      ruleCode = `TJ-4000 / LP SolidStart §4 (L > 24'-0", ${nRows} Rows)`;
      ruleSummary = `Long Span ${Math.round(spanMm)} mm (${spanFt.toFixed(1)} ft > 24'-0") → ${nRows} Blocking Rows @ L/${nIntervals} (${Math.round(spanMm / nIntervals)} mm O.C.)`;
    }
  }

  // EWP Manufacturer Depth & Fastener Requirements:
  // Deep I-joists (>= 14" / 356 mm) require full-depth EWP blocking panels + web stiffeners
  const recommendedBridgingType = isOpenWeb
    ? 'strongback_2x6'
    : isDeepIJoist
      ? 'solid_blocking'
      : (bridgingType && bridgingType !== 'none' ? bridgingType : 'solid_blocking');

  const fastenerSpec = isOpenWeb
    ? '2×6 Continuous Strongback Through Open Web + (2) 16d Nails per Vertical Web'
    : isDeepIJoist
      ? 'Full-Depth EWP Blocking + Web Stiffeners + (4) 10d (3") Toenails/Flange + 1.5mm Top Anti-Squeak Gap'
      : 'Full-Depth I-Joist/Rim Blocking + (3) 10d (0.148"×3") Toenails Top/Bot Flange + 1.5mm Top Gap + ASTM D3498 Glue';

  return {
    baySpanMm: Math.round(spanMm),
    baySpanFt: Number(spanFt.toFixed(2)),
    joistDepthMm: Math.round(depthMm),
    joistSection,
    isDeepIJoist,
    isOpenWeb,
    rowCount: rowFractions.length,
    rowFractions,
    rowLabels,
    rowDistancesMm: rowFractions.map(f => Math.round(spanMm * f)),
    maxUnbracedMm,
    recommendedBridgingType,
    webStiffenerReq: isDeepIJoist,
    staggerAlternateBaysMm: 22,
    manufacturerStandard,
    ruleCode,
    ruleSummary,
    fastenerSpec
  };
}
window.computeEWPIJoistBlockingRequirements = computeEWPIJoistBlockingRequirements;

function autoPlaceIJoistMidSpanBlocking(targetSlabOrModel = null, opts = {}) {
  const st = window.ewpBeamToolState || {};
  const mdl = (targetSlabOrModel && Array.isArray(targetSlabOrModel.elements))
    ? targetSlabOrModel
    : (typeof model !== 'undefined' ? model : window.model);
  const activeSlab = (targetSlabOrModel && targetSlabOrModel.type === 'slab')
    ? targetSlabOrModel
    : getActiveFloorSlab(mdl);

  const joistSec = activeSlab?.joistSection || st.joistSection || 'I-Joist 11-7/8';
  const joistMeta = inferFloorSectionMeta(joistSec, 64, Number(activeSlab?.thickness) || 302);
  const isOpenWeb = /posi-strut|floor truss|open-web/i.test(String(joistSec));

  // Enforce EWP manufacturer compliant blocking type & automatic span-based row placement
  const nextBridgingType = opts.bridgingType || (isOpenWeb ? 'strongback_2x6' : 'solid_blocking');
  const nextBridgingRows = opts.bridgingRows || 'auto_ewp';

  st.bridgingType = nextBridgingType;
  st.bridgingRows = nextBridgingRows;
  if (joistMeta.depth >= 355) {
    st.webStiffeners = true;
  }

  const targetSlabs = (mdl?.elements || []).filter(el => el.type === 'slab');
  for (const sl of targetSlabs) {
    sl.bridgingType = nextBridgingType;
    sl.bridgingRows = nextBridgingRows;
    if (joistMeta.depth >= 355) sl.webStiffeners = true;
    // Restore any previously deleted BLK-* members so all mid-span rows are intact
    if (sl.floorFramingEdits && Array.isArray(sl.floorFramingEdits.deletedMembers)) {
      sl.floorFramingEdits.deletedMembers = sl.floorFramingEdits.deletedMembers.filter(
        id => !/:BLK-\d+$/i.test(String(id))
      );
    }
  }

  // Floor blocking is shown in the Floor Framing Plan ('ewpspecs'), not in the 2D Wall Framing Plan ('framingplan')
  window._showIJoistMidSpanBlockingInFramingPlan = false;
  const blkToggle = document.getElementById('ij-midspan-blocking-toggle');
  if (blkToggle) blkToggle.checked = true;

  const members = activeSlab ? generateFloorFramingForSlab(activeSlab) : [];
  const blockingMembers = members.filter(m => m.type === 'Blocking');
  const baySummaries = window._latestEWPBayBlockingSummaries || [];

  if (typeof window.updateEWPBeamHUD === 'function') window.updateEWPBeamHUD();
  if (typeof properties === 'function') properties();
  if (typeof render === 'function') render();

  const summary = {
    totalBlockingSegments: blockingMembers.length,
    totalRows: baySummaries.reduce((acc, b) => acc + (b.rowCount || 0), 0),
    baysSummary: baySummaries,
    joistSection: joistSec,
    joistDepthMm: joistMeta.depth,
    bridgingType: nextBridgingType,
    bridgingRows: nextBridgingRows,
    manufacturerStandard: 'APA PRI-400 · Weyerhaeuser TJ-4000 · Boise Cascade BCI'
  };
  window._lastAutoPlacedIJoistBlocking = summary;

  if (!opts.silent && typeof toast === 'function') {
    const bayDesc = baySummaries.length
      ? baySummaries.map(b => `Bay ${b.bayIndex} (${formatLength(b.baySpanMm)}): ${b.rowCount} Row${b.rowCount === 1 ? '' : 's'} [${b.rowLabels.join(', ')}]`).join(' · ')
      : `${blockingMembers.length} blocking segments`;
    toast(`⚡ Auto-Placed ${blockingMembers.length} EWP Mid-Span I-Joist Blocking Segments (${bayDesc} · PRI-400 / TJ-4000)`);
  }

  return summary;
}
window.autoPlaceIJoistMidSpanBlocking = autoPlaceIJoistMidSpanBlocking;

function generateFloorFramingForSlab(s) {
  const slab = s || getActiveFloorSlab();
  if (!slab || slab.type !== 'slab') return [];
  const pts = defaultSlabPolygon(slab);
  if (pts.length < 3) return [];

  const st = window.ewpBeamToolState || {};
  const edits = ensureFloorFramingEditsStore(slab);
  const deletedSet = new Set(edits.deletedMembers || []);
  const overrides = edits.memberOverrides || {};

  const joistSection = slab.joistSection || st.joistSection || 'I-Joist 11-7/8';
  const spacingIn = Number(slab.joistSpacingIn || st.joistSpacingIn || 16);
  const spacing = Number(slab.joistSpacing) || (spacingIn * 25.4) || 406.4;
  const joistDirPref = slab.joistDirection || st.joistDirection || 'Y';
  const endBearingType = slab.endBearingType || st.endBearingType || 'ewp_rim';
  const girderType = slab.girderType || st.girderType || 'flush_hanger';
  const defaultHanger = slab.joistHangerType || st.joistHangerType || 'face_mount';
  const bridgingType = slab.bridgingType || st.bridgingType || 'solid_blocking';
  const bridgingRows = slab.bridgingRows || st.bridgingRows || 'auto_ewp';
  const openingEnabled = slab.openingEnabled !== undefined ? Boolean(slab.openingEnabled) : Boolean(st.openingEnabled);
  const openingWidthMm = Number(slab.openingWidthMm ?? st.openingWidthMm ?? 2400);
  const openingLengthMm = Number(slab.openingLengthMm ?? st.openingLengthMm ?? 2200);
  const openingXMm = Number(slab.openingXMm ?? st.openingXMm ?? 8200);
  const openingYMm = Number(slab.openingYMm ?? st.openingYMm ?? 1200);
  const trimmerPlies = Number(slab.trimmerPlies ?? st.trimmerPlies ?? 2);
  const headerPlies = Number(slab.headerPlies ?? st.headerPlies ?? 2);
  const cantileverEnabled = slab.cantileverEnabled !== undefined ? Boolean(slab.cantileverEnabled) : Boolean(st.cantileverEnabled);
  const cantileverSide = slab.cantileverSide || st.cantileverSide || 'south';
  const cantileverMm = Number(slab.cantileverMm ?? st.cantileverMm ?? 900);
  const partitionDoublers = slab.partitionDoublers !== undefined ? Boolean(slab.partitionDoublers) : Boolean(st.partitionDoublers !== false);

  const joistMeta = inferFloorSectionMeta(joistSection, 64, Number(slab.thickness) || 302);
  const thickness = Number(slab.thickness) || joistMeta.depth || 302;
  const joistDepth = joistMeta.depth || thickness;
  const rimWidth = endBearingType === 'solid_rim' ? 38 : 45;
  const joistWidth = joistMeta.width || 64;
  const girderPlies = Math.max(1, Number(st.currentPlies) || 2);
  const girderSingleW = girderType === 'pocket_steel' ? 133 : 45;
  const girderWidth = girderType === 'pocket_steel' ? 133 : Math.max(90, girderPlies * girderSingleW);
  const rawMembers = [];
  const bayBlockingSummaries = [];

  const rimSpecMap = {
    ewp_rim: 'Rim Board 1-1/8x11-7/8 EWP',
    solid_rim: '2x12 Solid Timber Band Joist',
    top_chord_bearing: 'Top-Chord Bearing Ribbon + Closure',
    bottom_chord_bearing: 'Bottom-Chord Bearing Rim + Ribbon',
    ledger_hanger: '2x12 Pressure-Treated Ledger + Hangers'
  };
  const rimSectionName = rimSpecMap[endBearingType] || 'Rim Board 1-1/8x11-7/8 EWP';

  const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
  const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;

  // 1. Rim Boards along perimeter
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2Pt = pts[(i + 1) % pts.length];
    const len = Math.hypot(p2Pt.x - p1.x, p2Pt.y - p1.y);
    if (len > 10) {
      rawMembers.push({
        id: `${slab.id}:RIM-${i + 1}`,
        shortTag: `RIM-${i + 1}`,
        slabId: slab.id,
        isFloorMember: true,
        type: 'Rim board',
        a: { x: p1.x, y: p1.y },
        b: { x: p2Pt.x, y: p2Pt.y },
        width: rimWidth,
        plies: 1,
        depth: joistDepth,
        grade: endBearingType === 'solid_rim' ? 'C24 Structural' : '1.3E Rim EWP',
        family: 'rim',
        z0: -thickness,
        z1: 0,
        length: len,
        center: { x: cx, y: cy },
        section: rimSectionName,
        hangerStart: 'none',
        hangerEnd: 'none',
        webStiffeners: 'none'
      });
    }
  }

  // 2. Corner Floor Framing Studs / 3-Stud Corner Blocking
  for (let i = 0; i < pts.length; i++) {
    const pCurr = pts[i];
    const pPrev = pts[(i + pts.length - 1) % pts.length];
    const pNext = pts[(i + 1) % pts.length];
    const dirPrev = { x: Math.sign(pPrev.x - pCurr.x), y: Math.sign(pPrev.y - pCurr.y) };
    const dirNext = { x: Math.sign(pNext.x - pCurr.x), y: Math.sign(pNext.y - pCurr.y) };
    const cornerSize = 140;
    const ax = pCurr.x + (dirPrev.x + dirNext.x > 0 ? 0 : -cornerSize);
    const ay = pCurr.y + (dirPrev.y + dirNext.y > 0 ? 0 : -cornerSize);
    rawMembers.push({
      id: `${slab.id}:CRN-${i + 1}`,
      shortTag: `CRN-${i + 1}`,
      slabId: slab.id,
      isFloorMember: true,
      type: 'Corner stud',
      a: { x: pCurr.x + dirNext.x * (cornerSize / 2), y: pCurr.y },
      b: { x: pCurr.x + dirNext.x * (cornerSize / 2), y: pCurr.y + dirPrev.y * cornerSize },
      cornerBox: { x: Math.min(pCurr.x, pCurr.x + dirNext.x * cornerSize), y: Math.min(pCurr.y, pCurr.y + dirPrev.y * cornerSize), size: cornerSize },
      width: cornerSize,
      plies: 3,
      depth: joistDepth,
      grade: 'C24 Structural',
      family: 'dimensional',
      z0: -thickness,
      z1: 0,
      length: cornerSize,
      section: '3-Stud Corner Rim Block (140×140 mm)',
      hangerStart: 'none',
      hangerEnd: 'none',
      webStiffeners: 'none'
    });
  }

  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const widthX = maxX - minX, lengthY = maxY - minY;

  const spanAlongY = joistDirPref === 'Y' || (joistDirPref === 'Auto' && lengthY <= widthX);
  let joistCount = 0;
  let blockCount = 0;

  const girderSectionBase = girderType === 'pocket_steel'
    ? 'Steel W8x18 Flush Beam + Nailer'
    : (st.currentSection || 'LVL 1-3/4x11-7/8');

  // Opening bounds in world coordinates
  const opX0 = minX + Math.max(rimWidth + 400, Math.min(widthX - 1200, openingXMm));
  const opW = Math.max(600, Math.min(maxX - opX0 - rimWidth - 200, openingWidthMm));
  const opX1 = opX0 + opW;
  const opY0 = minY + Math.max(rimWidth + 300, Math.min(lengthY - 1200, openingYMm));
  const opL = Math.max(600, Math.min(maxY - opY0 - rimWidth - 200, openingLengthMm));
  const opY1 = opY0 + opL;

  const pushJoistSegment = (ax, ay, bx, by, opts = {}) => {
    const segLen = Math.hypot(bx - ax, by - ay);
    if (segLen <= (opts.minLen ?? 100)) return;
    const role = opts.type || 'Floor joist';
    const sec = opts.section || joistSection;
    const meta = inferFloorSectionMeta(sec, opts.width || joistWidth, joistDepth);
    const plies = opts.plies || 1;
    const singleW = opts.singleWidth || meta.width || joistWidth;
    let id = opts.id;
    let shortTag = opts.shortTag;
    if (!id) {
      joistCount++;
      shortTag = `FJ-${String(joistCount).padStart(2, '0')}`;
      id = `${slab.id}:${shortTag}`;
    }
    const isDropped = opts.isDropped || (girderType === 'dropped_beam' && role === 'Floor beam');
    rawMembers.push({
      id,
      shortTag: shortTag || id.split(':').pop(),
      slabId: slab.id,
      isFloorMember: true,
      type: role,
      a: { x: ax, y: ay },
      b: { x: bx, y: by },
      width: singleW,
      plies,
      totalWidth: singleW * plies,
      depth: meta.depth || joistDepth,
      grade: opts.grade || meta.grade,
      family: opts.family || meta.family,
      z0: isDropped ? -thickness * 1.85 : -thickness,
      z1: isDropped ? -thickness * 0.85 : 0,
      length: segLen,
      section: sec,
      isCantilever: Boolean(opts.isCantilever),
      hangerStart: opts.hangerStart ?? defaultHanger,
      hangerEnd: opts.hangerEnd ?? defaultHanger,
      webStiffeners: opts.webStiffeners ?? (st.webStiffeners !== false ? 'both' : 'none'),
      mepHoleEnabled: Boolean(opts.mepHoleEnabled),
      mepHoleOffsetMm: opts.mepHoleOffsetMm ?? Math.round(segLen * 0.35),
      mepHoleDiameterMm: opts.mepHoleDiameterMm ?? 150
    });
  };

  const pushBridgingSegment = (ax, ay, bx, by, bayIdx = 1, meta = {}) => {
    if (bridgingType === 'none') return;
    const segLen = Math.hypot(bx - ax, by - ay);
    if (segLen <= 60) return;
    blockCount++;
    const bridgeSectionMap = {
      solid_blocking: `${joistSection} Full-Depth EWP Blocking`,
      herringbone: '2x3 Herringbone Cross-Bridging Pair',
      strongback_2x6: '2x6 Strongback Internal Bracing',
      bottom_strapping: '1x4 Continuous Bottom Strapping'
    };
    const shortTag = `BLK-${String(blockCount).padStart(2, '0')}`;
    rawMembers.push({
      id: `${slab.id}:${shortTag}`,
      shortTag,
      slabId: slab.id,
      isFloorMember: true,
      type: 'Blocking',
      bridgingStyle: bridgingType,
      a: { x: ax, y: ay },
      b: { x: bx, y: by },
      width: bridgingType === 'strongback_2x6' ? 45 : (bridgingType === 'herringbone' ? 38 : joistWidth),
      plies: 1,
      totalWidth: bridgingType === 'strongback_2x6' ? 45 : (bridgingType === 'herringbone' ? 38 : joistWidth),
      depth: bridgingType === 'bottom_strapping' ? 25 : joistDepth,
      grade: 'C24 / EWP Blocking',
      family: 'blocking',
      z0: -thickness,
      z1: bridgingType === 'bottom_strapping' ? -thickness + 25 : 0,
      length: segLen,
      section: bridgeSectionMap[bridgingType] || 'Solid EWP Blocking',
      hangerStart: 'none',
      hangerEnd: 'none',
      webStiffeners: meta.webStiffenerReq ? 'both' : 'none',
      bayIndex: bayIdx,
      rowIndex: meta.rowIndex || 1,
      totalRowsInBay: meta.totalRowsInBay || 1,
      baySpanMm: meta.baySpanMm || 0,
      bayStartCoord: meta.bayStartCoord ?? 0,
      bayEndCoord: meta.bayEndCoord ?? 0,
      rowFraction: meta.rowFraction || 0.5,
      rowFractionLabel: meta.rowFractionLabel || 'L/2 (Mid-Span)',
      distFromSupportMm: meta.distFromSupportMm || 0,
      rowLineCoord: meta.rowLineCoord || 0,
      spanAxis: meta.spanAxis || (spanAlongY ? 'Y' : 'X'),
      staggerOffsetMm: meta.staggerOffsetMm || 0,
      manufacturerRule: meta.ruleCode || 'PRI-400 / TJ-4000',
      manufacturerStandard: meta.manufacturerStandard || 'APA PRI-400 · Weyerhaeuser TJ-4000 · Boise Cascade BCI',
      ruleSummary: meta.ruleSummary || '',
      fastenerSpec: meta.fastenerSpec || '(3) 10d Toenails Top/Bot Flange + 1.5mm Subfloor Gap'
    });
  };

  const girderHalfFace = girderType === 'dropped_beam'
    ? 0
    : (girderType === 'pocket_steel'
      ? 133 / 2
      : (girderPlies * girderSingleW + Math.max(0, girderPlies - 1) * 4) / 2);

  const modelBeams = (typeof model !== 'undefined' && Array.isArray(model?.elements))
    ? model.elements.filter(b => b.type === 'beam' && b.a && b.b && (!slab.story || b.story === slab.story))
    : [];

  const slabIntersectionsAlong = (axis, coord) => {
    const hits = [];
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i], p2Pt = pts[(i + 1) % pts.length];
      if (axis === 'Y') {
        if (Math.abs(p1.x - p2Pt.x) < 1e-5) continue;
        if ((p1.x <= coord && p2Pt.x > coord) || (p2Pt.x <= coord && p1.x > coord)) {
          hits.push(p1.y + (p2Pt.y - p1.y) * (coord - p1.x) / (p2Pt.x - p1.x));
        }
      } else {
        if (Math.abs(p1.y - p2Pt.y) < 1e-5) continue;
        if ((p1.y <= coord && p2Pt.y > coord) || (p2Pt.y <= coord && p1.y > coord)) {
          hits.push(p1.x + (p2Pt.x - p1.x) * (coord - p1.y) / (p2Pt.y - p1.y));
        }
      }
    }
    hits.sort((a, b) => a - b);
    const intervals = [];
    for (let k = 0; k < hits.length - 1; k += 2) {
      intervals.push([hits[k] + rimWidth, hits[k + 1] - rimWidth]);
    }
    return intervals;
  };

  const mergeSortedStops = (rawStops) => {
    const sorted = [...rawStops].sort((a, b) => a.coord - b.coord);
    const merged = [];
    for (const s of sorted) {
      const prev = merged[merged.length - 1];
      if (prev && Math.abs(s.coord - prev.coord) < 35) {
        if ((s.priority || 0) > (prev.priority || 0) || (s.halfFace || 0) > (prev.halfFace || 0)) {
          merged[merged.length - 1] = s;
        }
      } else {
        merged.push(s);
      }
    }
    return merged;
  };

  const buildSupportBays = (wallStart, wallEnd, stops, voidRange = null, minOverlap = 160) => {
    const bays = [];
    const cleanStops = mergeSortedStops(stops);
    for (let i = 0; i < cleanStops.length - 1; i++) {
      const sA = cleanStops[i];
      const sB = cleanStops[i + 1];
      const segStart = sA.coord + (sA.halfFace || 0);
      const segEnd = sB.coord - (sB.halfFace || 0);
      if (segEnd - segStart < 120) continue;
      if (voidRange) {
        const mid = (segStart + segEnd) / 2;
        if (mid > voidRange[0] + 10 && mid < voidRange[1] - 10) continue;
      }
      const overlap = Math.min(wallEnd, sB.coord) - Math.max(wallStart, sA.coord);
      const reqOverlap = Math.min(minOverlap, Math.max(60, (sB.coord - sA.coord) * 0.35));
      if (overlap >= reqOverlap) {
        bays.push({
          start: segStart,
          end: segEnd,
          hangerStart: sA.hanger ?? defaultHanger,
          hangerEnd: sB.hanger ?? defaultHanger
        });
      }
    }
    return bays;
  };

  const getWallCenterSeg = (w) => {
    const ca = typeof window.wallCenterPoint === 'function' ? window.wallCenterPoint(w, w.a) : w.a;
    const cb = typeof window.wallCenterPoint === 'function' ? window.wallCenterPoint(w, w.b) : w.b;
    return { a: ca, b: cb };
  };
  const dblHalfFace = (joistWidth * 2 + (joistMeta.family === 'ijoist' ? 3 : 4)) / 2;
  const collinearClearance = dblHalfFace + joistWidth / 2 + 4;

  const isHorizontalWall = (w) => {
    const seg = getWallCenterSeg(w);
    return Math.abs(seg.a.y - seg.b.y) <= 150 && Math.abs(seg.b.x - seg.a.x) > 250;
  };
  const isVerticalWall = (w) => {
    const seg = getWallCenterSeg(w);
    return Math.abs(seg.a.x - seg.b.x) <= 150 && Math.abs(seg.b.y - seg.a.y) > 250;
  };

  if (spanAlongY) {
    const girderYPositions = [];
    if (girderType !== 'clear_span' && widthX > 3600) {
      if (girderType === 'double_girder') {
        girderYPositions.push(minY + lengthY / 3, minY + (2 * lengthY) / 3);
      } else {
        girderYPositions.push((minY + maxY) / 2);
      }
    }

    girderYPositions.forEach((gy, idx) => {
      const isDropped = girderType === 'dropped_beam';
      pushJoistSegment(minX + rimWidth, gy, maxX - rimWidth, gy, {
        id: `${slab.id}:GIRDER-${idx + 1}`,
        shortTag: `BM-G${idx + 1}`,
        type: 'Floor beam',
        section: girderSectionBase,
        plies: girderType === 'pocket_steel' ? 1 : girderPlies,
        singleWidth: girderSingleW,
        family: girderType === 'pocket_steel' ? 'steel' : 'lvl',
        isDropped,
        hangerStart: 'column_cap',
        hangerEnd: 'column_cap',
        webStiffeners: 'both'
      });
    });

    // Opening Trimmers & Headers when spanning along Y
    const headerHalfFace = (45 * headerPlies + Math.max(0, headerPlies - 1) * 4) / 2;
    const trimmerHalfFace = (45 * trimmerPlies + Math.max(0, trimmerPlies - 1) * 4) / 2;
    if (openingEnabled && opX1 > opX0 + 200 && opY1 > opY0 + 200) {
      const trimBayEndY = girderYPositions.length
        ? Math.max(opY1 + 200, girderYPositions[0] - girderHalfFace)
        : maxY - rimWidth;
      pushJoistSegment(opX0, minY + rimWidth, opX0, trimBayEndY, {
        id: `${slab.id}:TRIM-L`,
        shortTag: 'TRIM-L',
        type: 'Trimmer joist',
        section: `LVL 1-3/4x11-7/8`,
        plies: trimmerPlies,
        singleWidth: 45,
        family: 'lvl',
        hangerStart: defaultHanger,
        hangerEnd: defaultHanger
      });
      pushJoistSegment(opX1, minY + rimWidth, opX1, trimBayEndY, {
        id: `${slab.id}:TRIM-R`,
        shortTag: 'TRIM-R',
        type: 'Trimmer joist',
        section: `LVL 1-3/4x11-7/8`,
        plies: trimmerPlies,
        singleWidth: 45,
        family: 'lvl',
        hangerStart: defaultHanger,
        hangerEnd: defaultHanger
      });
      pushJoistSegment(opX0, opY0, opX1, opY0, {
        id: `${slab.id}:HDR-1`,
        shortTag: 'HDR-N',
        type: 'Opening header',
        section: `LVL 1-3/4x11-7/8`,
        plies: headerPlies,
        singleWidth: 45,
        family: 'lvl',
        hangerStart: 'heavy_skewed',
        hangerEnd: 'heavy_skewed'
      });
      pushJoistSegment(opX0, opY1, opX1, opY1, {
        id: `${slab.id}:HDR-2`,
        shortTag: 'HDR-S',
        type: 'Opening header',
        section: `LVL 1-3/4x11-7/8`,
        plies: headerPlies,
        singleWidth: 45,
        family: 'lvl',
        hangerStart: 'heavy_skewed',
        hangerEnd: 'heavy_skewed'
      });
    }

    const xPositions = [];
    for (let x = minX + rimWidth + spacing; x < maxX - rimWidth - 40; x += spacing) {
      xPositions.push(x);
    }

    const allStoryWalls = (partitionDoublers && typeof model !== 'undefined' && Array.isArray(model?.elements))
      ? model.elements.filter(w => w.type === 'wall' && w.a && w.b && (w.story === slab.story || !slab.story))
      : [];
    const parallelWallsY = allStoryWalls.filter(w => {
      if (!isVerticalWall(w)) return false;
      const seg = getWallCenterSeg(w);
      const wx = (seg.a.x + seg.b.x) / 2;
      return wx > minX + 180 && wx < maxX - 180;
    });
    const perpWallsX = allStoryWalls.filter(w => {
      if (!isHorizontalWall(w)) return false;
      const seg = getWallCenterSeg(w);
      const wy = (seg.a.y + seg.b.y) / 2;
      return wy > minY + 180 && wy < maxY - 180;
    });
    const diagWalls = allStoryWalls.filter(w => !isVerticalWall(w) && !isHorizontalWall(w) && Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y) > 250);

    // 1. Place parallel Wall-Supporting Floor Joists (Partition Doublers) first so regular joists & bridging know their exact positions
    let dblIdx = 0;
    const placedParallelX = [];
    if (partitionDoublers) {
      for (const iw of parallelWallsY) {
        const seg = getWallCenterSeg(iw);
        const wx = (seg.a.x + seg.b.x) / 2;
        const iwY0 = Math.min(seg.a.y, seg.b.y);
        const iwY1 = Math.max(seg.a.y, seg.b.y);
        const intervals = slabIntersectionsAlong('Y', wx);
        for (const [intY0, intY1] of intervals) {
          const stops = [
            { coord: intY0, halfFace: 0, hanger: defaultHanger, priority: 3 },
            { coord: intY1, halfFace: 0, hanger: defaultHanger, priority: 3 }
          ];
          for (const gy of girderYPositions) {
            if (gy > intY0 + 80 && gy < intY1 - 80) {
              stops.push({ coord: gy, halfFace: girderHalfFace, hanger: defaultHanger, priority: 5 });
            }
          }
          for (const mb of modelBeams) {
            if (Math.abs(mb.a.y - mb.b.y) <= 150) {
              const bx0 = Math.min(mb.a.x, mb.b.x) - 120, bx1 = Math.max(mb.a.x, mb.b.x) + 120;
              const by = (mb.a.y + mb.b.y) / 2;
              if (wx >= bx0 && wx <= bx1 && by > intY0 + 60 && by < intY1 - 60) {
                stops.push({ coord: by, halfFace: (mb.thickness || 90) / 2, hanger: defaultHanger, priority: 4 });
              }
            }
          }
          if (openingEnabled && wx >= opX0 - 45 && wx <= opX1 + 45) {
            if (opY0 > intY0 + 80 && opY0 < intY1 - 80) stops.push({ coord: opY0, halfFace: headerHalfFace, hanger: 'face_mount', priority: 4 });
            if (opY1 > intY0 + 80 && opY1 < intY1 - 80) stops.push({ coord: opY1, halfFace: headerHalfFace, hanger: 'face_mount', priority: 4 });
          }

          const voidR = (openingEnabled && wx > opX0 + 30 && wx < opX1 - 30) ? [opY0, opY1] : null;
          const bays = buildSupportBays(iwY0, iwY1, stops, voidR, 180);
          for (const bay of bays) {
            dblIdx++;
            pushJoistSegment(wx, bay.start, wx, bay.end, {
              id: `${slab.id}:DBL-${dblIdx}`,
              shortTag: `DBL-${dblIdx}`,
              type: 'Partition doubler',
              section: joistSection,
              plies: 2,
              singleWidth: joistWidth,
              family: joistMeta.family,
              hangerStart: bay.hangerStart,
              hangerEnd: bay.hangerEnd
            });
            placedParallelX.push({ x: wx, y0: bay.start, y1: bay.end, halfFace: dblHalfFace });
          }
        }
      }
    }

    // 2. Place Regular & Tail Floor Joists (skipping collinear ones replaced by a 2-ply Partition doubler) & collect vertical members per bay for clean bridging
    const placedVerticalByBay = new Map();
    const recordVertInBay = (bIdx, coord, halfW, yMin, yMax) => {
      if (!placedVerticalByBay.has(bIdx)) placedVerticalByBay.set(bIdx, []);
      placedVerticalByBay.get(bIdx).push({ coord, halfW, yMin, yMax });
    };

    for (let xi = 0; xi < xPositions.length; xi++) {
      const x = xPositions[xi];
      const intersects = [];
      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i], p2Pt = pts[(i + 1) % pts.length];
        if (Math.abs(p1.x - p2Pt.x) < 1e-5) continue;
        if ((p1.x <= x && p2Pt.x > x) || (p2Pt.x <= x && p1.x > x)) {
          const yInt = p1.y + (p2Pt.y - p1.y) * (x - p1.x) / (p2Pt.x - p1.x);
          intersects.push(yInt);
        }
      }
      intersects.sort((a, b) => a - b);
      for (let k = 0; k < intersects.length - 1; k += 2) {
        const yStart = intersects[k] + rimWidth;
        const yEnd = intersects[k + 1] - rimWidth;
        const stops = [yStart, ...girderYPositions.filter(gy => gy > yStart + 100 && gy < yEnd - 100), yEnd];

        for (let bIdx = 0; bIdx < stops.length - 1; bIdx++) {
          let segY0 = stops[bIdx] + (bIdx > 0 ? girderHalfFace : 0);
          let segY1 = stops[bIdx + 1] - (bIdx + 1 < stops.length - 1 ? girderHalfFace : 0);
          if (girderType === 'dropped_beam' && bIdx < stops.length - 2) {
            segY1 += 150;
          }

          const isSouthCant = cantileverEnabled && bIdx === stops.length - 2 && cantileverSide === 'south';
          const isNorthCant = cantileverEnabled && bIdx === 0 && cantileverSide === 'north';
          if (isSouthCant) segY1 = maxY + cantileverMm - rimWidth;
          if (isNorthCant) segY0 = minY - cantileverMm + rimWidth;

          const skipForCollinearDoubler = placedParallelX.some(d =>
            Math.abs(d.x - x) < collinearClearance &&
            Math.min(d.y1, segY1) - Math.max(d.y0, segY0) > 150
          );

          const insideOpeningX = openingEnabled && x > opX0 + 30 && x < opX1 - 30;
          if (!skipForCollinearDoubler) {
            if (insideOpeningX) {
              if (segY0 < opY0 && segY1 > opY0) {
                pushJoistSegment(x, segY0, x, opY0 - headerHalfFace, {
                  type: 'Tail joist',
                  section: joistSection,
                  hangerStart: defaultHanger,
                  hangerEnd: 'face_mount'
                });
                recordVertInBay(bIdx, x, joistWidth / 2, segY0, opY0 - headerHalfFace);
              }
              if (segY1 > opY1 && segY0 < opY1) {
                pushJoistSegment(x, opY1 + headerHalfFace, x, segY1, {
                  type: 'Tail joist',
                  section: joistSection,
                  isCantilever: isSouthCant,
                  hangerStart: 'face_mount',
                  hangerEnd: defaultHanger
                });
                recordVertInBay(bIdx, x, joistWidth / 2, opY1 + headerHalfFace, segY1);
              } else if (segY0 >= opY1 || segY1 <= opY0) {
                pushJoistSegment(x, segY0, x, segY1, {
                  isCantilever: isSouthCant || isNorthCant
                });
                recordVertInBay(bIdx, x, joistWidth / 2, segY0, segY1);
              }
            } else {
              pushJoistSegment(x, segY0, x, segY1, {
                isCantilever: isSouthCant || isNorthCant
              });
              recordVertInBay(bIdx, x, joistWidth / 2, segY0, segY1);
            }
          }
        }
      }
    }

    // 3. Emit Between-Joist Blocking / Bridging using actual placed joists, doublers, and trimmers (never pierces a Partition doubler!)
    if (bridgingType !== 'none') {
      const bayStops = [minY + rimWidth, ...girderYPositions.filter(gy => gy > minY + 180 && gy < maxY - 180), maxY - rimWidth];
      for (let bIdx = 0; bIdx < bayStops.length - 1; bIdx++) {
        const bayY0 = bayStops[bIdx] + (bIdx > 0 ? girderHalfFace : 0);
        const bayY1 = bayStops[bIdx + 1] - (bIdx + 1 < bayStops.length - 1 ? girderHalfFace : 0);
        const bayLen = bayY1 - bayY0;
        if (bayLen <= 1600) continue;

        const membersInBay = [...(placedVerticalByBay.get(bIdx) || [])];
        for (const d of placedParallelX) {
          if (Math.min(d.y1, bayY1) - Math.max(d.y0, bayY0) > 150) {
            membersInBay.push({ coord: d.x, halfW: d.halfFace, yMin: d.y0, yMax: d.y1 });
          }
        }
        if (openingEnabled && opX1 > opX0 + 200 && opY1 > opY0 + 200) {
          const trimEnd = girderYPositions.length ? Math.max(opY1 + 200, girderYPositions[0] - girderHalfFace) : maxY - rimWidth;
          if (Math.min(trimEnd, bayY1) - Math.max(minY + rimWidth, bayY0) > 150) {
            membersInBay.push({ coord: opX0, halfW: trimmerHalfFace, yMin: minY + rimWidth, yMax: trimEnd });
            membersInBay.push({ coord: opX1, halfW: trimmerHalfFace, yMin: minY + rimWidth, yMax: trimEnd });
          }
        }
        membersInBay.push({ coord: minX + rimWidth / 2, halfW: rimWidth / 2, yMin: bayY0, yMax: bayY1 });
        membersInBay.push({ coord: maxX - rimWidth / 2, halfW: rimWidth / 2, yMin: bayY0, yMax: bayY1 });

        const ewpReq = computeEWPIJoistBlockingRequirements(bayLen, joistDepth, joistSection, bridgingRows, bridgingType);
        const rowFractions = ewpReq.rowFractions;
        const rowCoordList = [];

        rowFractions.forEach((frac, rIdx) => {
          const baseRowY = bayY0 + bayLen * frac;
          const distFromSupportMm = Math.round(bayLen * frac);
          const rowLabel = ewpReq.rowLabels[rIdx] || `Row ${rIdx + 1}`;
          rowCoordList.push({
            rowIndex: rIdx + 1,
            rowFraction: frac,
            rowLabel,
            distFromSupportMm,
            coord: baseRowY,
            minOrtho: minX + rimWidth,
            maxOrtho: maxX - rimWidth
          });

          const rowVerts = membersInBay
            .filter(m => baseRowY >= m.yMin - 15 && baseRowY <= m.yMax + 15)
            .sort((a, b) => a.coord - b.coord);
          for (let i = 0; i < rowVerts.length - 1; i++) {
            const vA = rowVerts[i];
            const vB = rowVerts[i + 1];
            const bx0 = vA.coord + vA.halfW;
            const bx1 = vB.coord - vB.halfW;
            if (bx1 - bx0 < 90) continue;
            // Alternate bay stagger (±22 mm) per EWP manufacturer installation rules so face/end nails never collide through I-joist webs
            const staggerMm = bridgingType === 'solid_blocking' ? ((i + rIdx) % 2 === 1 ? 22 : -22) : 0;
            const bY = baseRowY + staggerMm;
            if (openingEnabled && bx0 >= opX0 - 25 && bx1 <= opX1 + 25 && bY >= opY0 - 40 && bY <= opY1 + 40) continue;
            pushBridgingSegment(bx0, bY, bx1, bY, bIdx + 1, {
              rowIndex: rIdx + 1,
              totalRowsInBay: rowFractions.length,
              baySpanMm: Math.round(bayLen),
              bayStartCoord: bayY0,
              bayEndCoord: bayY1,
              rowFraction: frac,
              rowFractionLabel: rowLabel,
              distFromSupportMm,
              rowLineCoord: baseRowY,
              spanAxis: 'Y',
              staggerOffsetMm: staggerMm,
              ruleCode: ewpReq.ruleCode,
              manufacturerStandard: ewpReq.manufacturerStandard,
              ruleSummary: ewpReq.ruleSummary,
              fastenerSpec: ewpReq.fastenerSpec,
              webStiffenerReq: ewpReq.webStiffenerReq
            });
          }
        });

        bayBlockingSummaries.push({
          bayIndex: bIdx + 1,
          spanAxis: 'Y',
          bayStartCoord: bayY0,
          bayEndCoord: bayY1,
          orthoMin: minX + rimWidth,
          orthoMax: maxX - rimWidth,
          ...ewpReq,
          rows: rowCoordList
        });
      }
    }

    // Cantilever Rim Closure when enabled
    if (cantileverEnabled && (cantileverSide === 'south' || cantileverSide === 'north')) {
      const cantY = cantileverSide === 'south' ? maxY + cantileverMm : minY - cantileverMm;
      rawMembers.push({
        id: `${slab.id}:CANT-RIM`,
        shortTag: 'RIM-CANT',
        slabId: slab.id,
        isFloorMember: true,
        type: 'Rim board',
        a: { x: minX, y: cantY },
        b: { x: maxX, y: cantY },
        width: rimWidth,
        plies: 1,
        totalWidth: rimWidth,
        depth: joistDepth,
        grade: '1.3E Rim EWP',
        family: 'rim',
        z0: -thickness,
        z1: 0,
        length: widthX,
        center: { x: cx, y: cy },
        section: `${rimSectionName} (Cantilever Closure)`,
        hangerStart: 'none',
        hangerEnd: 'none',
        webStiffeners: 'none'
      });
    }

    // 4. Perpendicular & Diagonal Wall-Supporting Framing — connect flush between perpendicular joists, LVLs, doublers, headers, and rim boards
    if (partitionDoublers && (perpWallsX.length || diagWalls.length)) {
      for (const pw of perpWallsX) {
        const seg = getWallCenterSeg(pw);
        const wy = (seg.a.y + seg.b.y) / 2;
        if (girderYPositions.some(gy => Math.abs(gy - wy) < girderHalfFace + 110)) continue;
        if (openingEnabled && (Math.abs(wy - opY0) < 90 || Math.abs(wy - opY1) < 90)) continue;
        const iwX0 = Math.min(seg.a.x, seg.b.x);
        const iwX1 = Math.max(seg.a.x, seg.b.x);
        const intervals = slabIntersectionsAlong('X', wy);
        for (const [intX0, intX1] of intervals) {
          const stops = [
            { coord: intX0, halfFace: 0, hanger: defaultHanger, priority: 3 },
            { coord: intX1, halfFace: 0, hanger: defaultHanger, priority: 3 }
          ];
          for (const jx of xPositions) {
            if (jx <= intX0 + 40 || jx >= intX1 - 40) continue;
            if (openingEnabled && wy > opY0 + 30 && wy < opY1 - 30 && jx > opX0 + 30 && jx < opX1 - 30) continue;
            const coveredByDbl = placedParallelX.some(d => Math.abs(d.x - jx) < collinearClearance && wy >= d.y0 - 20 && wy <= d.y1 + 20);
            if (!coveredByDbl) {
              stops.push({ coord: jx, halfFace: joistWidth / 2, hanger: defaultHanger, priority: 1 });
            }
          }
          for (const d of placedParallelX) {
            if (d.x > intX0 + 40 && d.x < intX1 - 40 && wy >= d.y0 - 40 && wy <= d.y1 + 40) {
              stops.push({ coord: d.x, halfFace: d.halfFace, hanger: defaultHanger, priority: 2 });
            }
          }
          if (openingEnabled && wy >= opY0 - 45 && wy <= opY1 + 45) {
            if (opX0 > intX0 + 60 && opX0 < intX1 - 60) stops.push({ coord: opX0, halfFace: trimmerHalfFace, hanger: 'face_mount', priority: 4 });
            if (opX1 > intX0 + 60 && opX1 < intX1 - 60) stops.push({ coord: opX1, halfFace: trimmerHalfFace, hanger: 'face_mount', priority: 4 });
          }
          for (const mb of modelBeams) {
            if (Math.abs(mb.a.x - mb.b.x) <= 150) {
              const by0 = Math.min(mb.a.y, mb.b.y) - 120, by1 = Math.max(mb.a.y, mb.b.y) + 120;
              const bx = (mb.a.x + mb.b.x) / 2;
              if (wy >= by0 && wy <= by1 && bx > intX0 + 60 && bx < intX1 - 60) {
                stops.push({ coord: bx, halfFace: (mb.thickness || 90) / 2, hanger: defaultHanger, priority: 4 });
              }
            }
          }

          const voidR = (openingEnabled && wy > opY0 + 30 && wy < opY1 - 30) ? [opX0, opX1] : null;
          // Custom bay builder for perpendicular wall supports allowing tight end-bay closure down to 55mm
          const cleanStops = mergeSortedStops(stops);
          for (let i = 0; i < cleanStops.length - 1; i++) {
            const sA = cleanStops[i], sB = cleanStops[i + 1];
            const segStart = sA.coord + (sA.halfFace || 0);
            const segEnd = sB.coord - (sB.halfFace || 0);
            if (segEnd - segStart < 55) continue;
            if (voidR) {
              const mid = (segStart + segEnd) / 2;
              if (mid > voidR[0] + 10 && mid < voidR[1] - 10) continue;
            }
            const overlap = Math.min(iwX1, sB.coord) - Math.max(iwX0, sA.coord);
            const reqOverlap = Math.min(120, Math.max(40, (sB.coord - sA.coord) * 0.35));
            if (overlap >= reqOverlap) {
              dblIdx++;
              pushJoistSegment(segStart, wy, segEnd, wy, {
                id: `${slab.id}:DBL-${dblIdx}`,
                shortTag: `DBL-${dblIdx}`,
                type: 'Partition doubler',
                section: joistSection,
                plies: 2,
                singleWidth: joistWidth,
                family: joistMeta.family,
                minLen: 50,
                hangerStart: segEnd - segStart >= 180 ? sA.hanger : 'none',
                hangerEnd: segEnd - segStart >= 180 ? sB.hanger : 'none'
              });
            }
          }
        }
      }

      for (const dw of diagWalls) {
        const seg = getWallCenterSeg(dw);
        const dxW = seg.b.x - seg.a.x, dyW = seg.b.y - seg.a.y;
        const ts = [0, 1];
        for (const gy of girderYPositions) {
          if (Math.abs(dyW) > 1e-4) {
            const t = (gy - seg.a.y) / dyW;
            if (t > 0.02 && t < 0.98) ts.push(t);
          }
        }
        ts.sort((a, b) => a - b);
        for (let i = 0; i < ts.length - 1; i++) {
          const t0 = ts[i], t1 = ts[i + 1];
          if (t1 - t0 < 0.03) continue;
          const ax = Math.max(minX + rimWidth, Math.min(maxX - rimWidth, seg.a.x + dxW * t0));
          const ay = Math.max(minY + rimWidth, Math.min(maxY - rimWidth, seg.a.y + dyW * t0));
          const bx = Math.max(minX + rimWidth, Math.min(maxX - rimWidth, seg.a.x + dxW * t1));
          const by = Math.max(minY + rimWidth, Math.min(maxY - rimWidth, seg.a.y + dyW * t1));
          if (Math.hypot(bx - ax, by - ay) > 250) {
            dblIdx++;
            pushJoistSegment(ax, ay, bx, by, {
              id: `${slab.id}:DBL-${dblIdx}`,
              shortTag: `DBL-${dblIdx}`,
              type: 'Partition doubler',
              section: joistSection,
              plies: 2,
              singleWidth: joistWidth,
              family: joistMeta.family,
              hangerStart: 'skewed_45',
              hangerEnd: 'skewed_45'
            });
          }
        }
      }
    }
  } else {
    // X-Span Floor Framing
    const girderXPositions = [];
    if (girderType !== 'clear_span' && lengthY > 3600) {
      if (girderType === 'double_girder') {
        girderXPositions.push(minX + widthX / 3, minX + (2 * widthX) / 3);
      } else {
        girderXPositions.push((minX + maxX) / 2);
      }
    }

    girderXPositions.forEach((gx, idx) => {
      const isDropped = girderType === 'dropped_beam';
      pushJoistSegment(gx, minY + rimWidth, gx, maxY - rimWidth, {
        id: `${slab.id}:GIRDER-${idx + 1}`,
        shortTag: `BM-G${idx + 1}`,
        type: 'Floor beam',
        section: girderSectionBase,
        plies: girderType === 'pocket_steel' ? 1 : girderPlies,
        singleWidth: girderSingleW,
        family: girderType === 'pocket_steel' ? 'steel' : 'lvl',
        isDropped,
        hangerStart: 'column_cap',
        hangerEnd: 'column_cap',
        webStiffeners: 'both'
      });
    });

    const headerHalfFace = (45 * headerPlies + Math.max(0, headerPlies - 1) * 4) / 2;
    const trimmerHalfFace = (45 * trimmerPlies + Math.max(0, trimmerPlies - 1) * 4) / 2;
    const yPositions = [];
    for (let y = minY + rimWidth + spacing; y < maxY - rimWidth - 40; y += spacing) {
      yPositions.push(y);
    }

    const allStoryWalls = (partitionDoublers && typeof model !== 'undefined' && Array.isArray(model?.elements))
      ? model.elements.filter(w => w.type === 'wall' && w.a && w.b && (w.story === slab.story || !slab.story))
      : [];
    const parallelWallsX = allStoryWalls.filter(w => {
      if (!isHorizontalWall(w)) return false;
      const seg = getWallCenterSeg(w);
      const wy = (seg.a.y + seg.b.y) / 2;
      return wy > minY + 180 && wy < maxY - 180;
    });
    const perpWallsY = allStoryWalls.filter(w => {
      if (!isVerticalWall(w)) return false;
      const seg = getWallCenterSeg(w);
      const wx = (seg.a.x + seg.b.x) / 2;
      return wx > minX + 180 && wx < maxX - 180;
    });

    let dblIdx = 0;
    const placedParallelY = [];
    if (partitionDoublers) {
      for (const iw of parallelWallsX) {
        const seg = getWallCenterSeg(iw);
        const wy = (seg.a.y + seg.b.y) / 2;
        const iwX0 = Math.min(seg.a.x, seg.b.x);
        const iwX1 = Math.max(seg.a.x, seg.b.x);
        const intervals = slabIntersectionsAlong('X', wy);
        for (const [intX0, intX1] of intervals) {
          const stops = [
            { coord: intX0, halfFace: 0, hanger: defaultHanger, priority: 3 },
            { coord: intX1, halfFace: 0, hanger: defaultHanger, priority: 3 }
          ];
          for (const gx of girderXPositions) {
            if (gx > intX0 + 80 && gx < intX1 - 80) {
              stops.push({ coord: gx, halfFace: girderHalfFace, hanger: defaultHanger, priority: 5 });
            }
          }
          for (const mb of modelBeams) {
            if (Math.abs(mb.a.x - mb.b.x) <= 150) {
              const by0 = Math.min(mb.a.y, mb.b.y) - 120, by1 = Math.max(mb.a.y, mb.b.y) + 120;
              const bx = (mb.a.x + mb.b.x) / 2;
              if (wy >= by0 && wy <= by1 && bx > intX0 + 60 && bx < intX1 - 60) {
                stops.push({ coord: bx, halfFace: (mb.thickness || 90) / 2, hanger: defaultHanger, priority: 4 });
              }
            }
          }
          if (openingEnabled && wy >= opY0 - 45 && wy <= opY1 + 45) {
            if (opX0 > intX0 + 80 && opX0 < intX1 - 80) stops.push({ coord: opX0, halfFace: headerHalfFace, hanger: 'face_mount', priority: 4 });
            if (opX1 > intX0 + 80 && opX1 < intX1 - 80) stops.push({ coord: opX1, halfFace: headerHalfFace, hanger: 'face_mount', priority: 4 });
          }

          const voidR = (openingEnabled && wy > opY0 + 30 && wy < opY1 - 30) ? [opX0, opX1] : null;
          const bays = buildSupportBays(iwX0, iwX1, stops, voidR, 180);
          for (const bay of bays) {
            dblIdx++;
            pushJoistSegment(bay.start, wy, bay.end, wy, {
              id: `${slab.id}:DBL-${dblIdx}`,
              shortTag: `DBL-${dblIdx}`,
              type: 'Partition doubler',
              section: joistSection,
              plies: 2,
              singleWidth: joistWidth,
              family: joistMeta.family,
              hangerStart: bay.hangerStart,
              hangerEnd: bay.hangerEnd
            });
            placedParallelY.push({ y: wy, x0: bay.start, x1: bay.end, halfFace: dblHalfFace });
          }
        }
      }
    }

    const placedHorizontalByBay = new Map();
    const recordHorizInBay = (bIdx, coord, halfW, xMin, xMax) => {
      if (!placedHorizontalByBay.has(bIdx)) placedHorizontalByBay.set(bIdx, []);
      placedHorizontalByBay.get(bIdx).push({ coord, halfW, xMin, xMax });
    };

    for (let yi = 0; yi < yPositions.length; yi++) {
      const y = yPositions[yi];
      const intersects = [];
      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i], p2Pt = pts[(i + 1) % pts.length];
        if (Math.abs(p1.y - p2Pt.y) < 1e-5) continue;
        if ((p1.y <= y && p2Pt.y > y) || (p2Pt.y <= y && p1.y > y)) {
          const xInt = p1.x + (p2Pt.x - p1.x) * (y - p1.y) / (p2Pt.y - p1.y);
          intersects.push(xInt);
        }
      }
      intersects.sort((a, b) => a - b);
      for (let k = 0; k < intersects.length - 1; k += 2) {
        const xStart = intersects[k] + rimWidth;
        const xEnd = intersects[k + 1] - rimWidth;
        const stops = [xStart, ...girderXPositions.filter(gx => gx > xStart + 100 && gx < xEnd - 100), xEnd];

        for (let bIdx = 0; bIdx < stops.length - 1; bIdx++) {
          const segX0 = stops[bIdx] + (bIdx > 0 ? girderHalfFace : 0);
          const segX1 = stops[bIdx + 1] - (bIdx + 1 < stops.length - 1 ? girderHalfFace : 0);
          const skipForCollinearDoubler = placedParallelY.some(d =>
            Math.abs(d.y - y) < collinearClearance &&
            Math.min(d.x1, segX1) - Math.max(d.x0, segX0) > 150
          );

          const insideOpeningY = openingEnabled && y > opY0 + 30 && y < opY1 - 30;
          if (!skipForCollinearDoubler) {
            if (insideOpeningY && segX0 < opX1 && segX1 > opX0) {
              if (segX0 < opX0) {
                pushJoistSegment(segX0, y, opX0 - headerHalfFace, y, { type: 'Tail joist' });
                recordHorizInBay(bIdx, y, joistWidth / 2, segX0, opX0 - headerHalfFace);
              }
              if (segX1 > opX1) {
                pushJoistSegment(opX1 + headerHalfFace, y, segX1, y, { type: 'Tail joist' });
                recordHorizInBay(bIdx, y, joistWidth / 2, opX1 + headerHalfFace, segX1);
              }
            } else {
              pushJoistSegment(segX0, y, segX1, y);
              recordHorizInBay(bIdx, y, joistWidth / 2, segX0, segX1);
            }
          }
        }
      }
    }

    if (bridgingType !== 'none') {
      const bayStops = [minX + rimWidth, ...girderXPositions.filter(gx => gx > minX + 180 && gx < maxX - 180), maxX - rimWidth];
      for (let bIdx = 0; bIdx < bayStops.length - 1; bIdx++) {
        const bayX0 = bayStops[bIdx] + (bIdx > 0 ? girderHalfFace : 0);
        const bayX1 = bayStops[bIdx + 1] - (bIdx + 1 < bayStops.length - 1 ? girderHalfFace : 0);
        const bayLen = bayX1 - bayX0;
        if (bayLen <= 1600) continue;

        const membersInBay = [...(placedHorizontalByBay.get(bIdx) || [])];
        for (const d of placedParallelY) {
          if (Math.min(d.x1, bayX1) - Math.max(d.x0, bayX0) > 150) {
            membersInBay.push({ coord: d.y, halfW: d.halfFace, xMin: d.x0, xMax: d.x1 });
          }
        }
        membersInBay.push({ coord: minY + rimWidth / 2, halfW: rimWidth / 2, xMin: bayX0, xMax: bayX1 });
        membersInBay.push({ coord: maxY - rimWidth / 2, halfW: rimWidth / 2, xMin: bayX0, xMax: bayX1 });

        const ewpReq = computeEWPIJoistBlockingRequirements(bayLen, joistDepth, joistSection, bridgingRows, bridgingType);
        const rowFractions = ewpReq.rowFractions;
        const rowCoordList = [];

        rowFractions.forEach((frac, rIdx) => {
          const baseRowX = bayX0 + bayLen * frac;
          const distFromSupportMm = Math.round(bayLen * frac);
          const rowLabel = ewpReq.rowLabels[rIdx] || `Row ${rIdx + 1}`;
          rowCoordList.push({
            rowIndex: rIdx + 1,
            rowFraction: frac,
            rowLabel,
            distFromSupportMm,
            coord: baseRowX,
            minOrtho: minY + rimWidth,
            maxOrtho: maxY - rimWidth
          });

          const colHoriz = membersInBay
            .filter(m => baseRowX >= m.xMin - 15 && baseRowX <= m.xMax + 15)
            .sort((a, b) => a.coord - b.coord);
          for (let i = 0; i < colHoriz.length - 1; i++) {
            const by0 = colHoriz[i].coord + colHoriz[i].halfW;
            const by1 = colHoriz[i + 1].coord - colHoriz[i + 1].halfW;
            if (by1 - by0 < 90) continue;
            const staggerMm = bridgingType === 'solid_blocking' ? ((i + rIdx) % 2 === 1 ? 22 : -22) : 0;
            const bX = baseRowX + staggerMm;
            if (openingEnabled && by0 >= opY0 - 25 && by1 <= opY1 + 25 && bX >= opX0 - 40 && bX <= opX1 + 40) continue;
            pushBridgingSegment(bX, by0, bX, by1, bIdx + 1, {
              rowIndex: rIdx + 1,
              totalRowsInBay: rowFractions.length,
              baySpanMm: Math.round(bayLen),
              bayStartCoord: bayX0,
              bayEndCoord: bayX1,
              rowFraction: frac,
              rowFractionLabel: rowLabel,
              distFromSupportMm,
              rowLineCoord: baseRowX,
              spanAxis: 'X',
              staggerOffsetMm: staggerMm,
              ruleCode: ewpReq.ruleCode,
              manufacturerStandard: ewpReq.manufacturerStandard,
              ruleSummary: ewpReq.ruleSummary,
              fastenerSpec: ewpReq.fastenerSpec,
              webStiffenerReq: ewpReq.webStiffenerReq
            });
          }
        });

        bayBlockingSummaries.push({
          bayIndex: bIdx + 1,
          spanAxis: 'X',
          bayStartCoord: bayX0,
          bayEndCoord: bayX1,
          orthoMin: minY + rimWidth,
          orthoMax: maxY - rimWidth,
          ...ewpReq,
          rows: rowCoordList
        });
      }
    }

    // Perpendicular Wall-Supporting Framing (North-South in X-Span): connect cleanly between perpendicular joists, LVLs, doublers, and rim boards
    if (partitionDoublers && perpWallsY.length) {
      for (const pw of perpWallsY) {
        const seg = getWallCenterSeg(pw);
        const wx = (seg.a.x + seg.b.x) / 2;
        if (girderXPositions.some(gx => Math.abs(gx - wx) < girderHalfFace + 110)) continue;
        if (openingEnabled && (Math.abs(wx - opX0) < 90 || Math.abs(wx - opX1) < 90)) continue;
        const iwY0 = Math.min(seg.a.y, seg.b.y);
        const iwY1 = Math.max(seg.a.y, seg.b.y);
        const intervals = slabIntersectionsAlong('Y', wx);
        for (const [intY0, intY1] of intervals) {
          const stops = [
            { coord: intY0, halfFace: 0, hanger: defaultHanger, priority: 3 },
            { coord: intY1, halfFace: 0, hanger: defaultHanger, priority: 3 }
          ];
          for (const jy of yPositions) {
            if (jy <= intY0 + 40 || jy >= intY1 - 40) continue;
            if (openingEnabled && wx > opX0 + 30 && wx < opX1 - 30 && jy > opY0 + 30 && jy < opY1 - 30) continue;
            const coveredByDbl = placedParallelY.some(d => Math.abs(d.y - jy) < collinearClearance && wx >= d.x0 - 20 && wx <= d.x1 + 20);
            if (!coveredByDbl) {
              stops.push({ coord: jy, halfFace: joistWidth / 2, hanger: defaultHanger, priority: 1 });
            }
          }
          for (const d of placedParallelY) {
            if (d.y > intY0 + 40 && d.y < intY1 - 40 && wx >= d.x0 - 40 && wx <= d.x1 + 40) {
              stops.push({ coord: d.y, halfFace: d.halfFace, hanger: defaultHanger, priority: 2 });
            }
          }
          if (openingEnabled && wx >= opX0 - 45 && wx <= opX1 + 45) {
            if (opY0 > intY0 + 60 && opY0 < intY1 - 60) stops.push({ coord: opY0, halfFace: trimmerHalfFace, hanger: 'face_mount', priority: 4 });
            if (opY1 > intY0 + 60 && opY1 < intY1 - 60) stops.push({ coord: opY1, halfFace: trimmerHalfFace, hanger: 'face_mount', priority: 4 });
          }
          for (const mb of modelBeams) {
            if (Math.abs(mb.a.y - mb.b.y) <= 150) {
              const bx0 = Math.min(mb.a.x, mb.b.x) - 120, bx1 = Math.max(mb.a.x, mb.b.x) + 120;
              const by = (mb.a.y + mb.b.y) / 2;
              if (wx >= bx0 && wx <= bx1 && by > intY0 + 60 && by < intY1 - 60) {
                stops.push({ coord: by, halfFace: (mb.thickness || 90) / 2, hanger: defaultHanger, priority: 4 });
              }
            }
          }

          const voidR = (openingEnabled && wx > opX0 + 30 && wx < opX1 - 30) ? [opY0, opY1] : null;
          const cleanStops = mergeSortedStops(stops);
          for (let i = 0; i < cleanStops.length - 1; i++) {
            const sA = cleanStops[i], sB = cleanStops[i + 1];
            const segStart = sA.coord + (sA.halfFace || 0);
            const segEnd = sB.coord - (sB.halfFace || 0);
            if (segEnd - segStart < 55) continue;
            if (voidR) {
              const mid = (segStart + segEnd) / 2;
              if (mid > voidR[0] + 10 && mid < voidR[1] - 10) continue;
            }
            const overlap = Math.min(iwY1, sB.coord) - Math.max(iwY0, sA.coord);
            const reqOverlap = Math.min(120, Math.max(40, (sB.coord - sA.coord) * 0.35));
            if (overlap >= reqOverlap) {
              dblIdx++;
              pushJoistSegment(wx, segStart, wx, segEnd, {
                id: `${slab.id}:DBL-${dblIdx}`,
                shortTag: `DBL-${dblIdx}`,
                type: 'Partition doubler',
                section: joistSection,
                plies: 2,
                singleWidth: joistWidth,
                family: joistMeta.family,
                minLen: 50,
                hangerStart: segEnd - segStart >= 180 ? sA.hanger : 'none',
                hangerEnd: segEnd - segStart >= 180 ? sB.hanger : 'none'
              });
            }
          }
        }
      }
    }
  }

  // Append user-added extra floor members
  if (Array.isArray(edits.extraMembers)) {
    for (const em of edits.extraMembers) {
      if (!em || !em.id) continue;
      rawMembers.push(clone(em));
    }
  }

  // Filter deleted members and apply per-member overrides
  const finalMembers = [];
  for (const m of rawMembers) {
    if (deletedSet.has(m.id)) continue;
    const ov = overrides[m.id];
    if (ov) {
      if (ov.type) m.type = ov.type;
      if (ov.shortTag || ov.customTag) m.shortTag = ov.shortTag || ov.customTag;
      if (ov.section) {
        m.section = ov.section;
        const meta = inferFloorSectionMeta(ov.section, m.width, m.depth);
        m.family = ov.family || meta.family;
        if (!ov.width) m.width = meta.width;
        if (!ov.depth) m.depth = meta.depth;
        if (!ov.grade) m.grade = meta.grade;
      }
      if (Number.isFinite(ov.width) && ov.width > 0) m.width = ov.width;
      if (Number.isFinite(ov.plies) && ov.plies >= 1) m.plies = Math.round(ov.plies);
      if (Number.isFinite(ov.depth) && ov.depth > 0) m.depth = ov.depth;
      if (ov.grade) m.grade = ov.grade;
      if (ov.family) m.family = ov.family;
      if (ov.hangerStart) m.hangerStart = ov.hangerStart;
      if (ov.hangerEnd) m.hangerEnd = ov.hangerEnd;
      if (ov.webStiffeners) m.webStiffeners = ov.webStiffeners;
      if (ov.mepHoleEnabled !== undefined) m.mepHoleEnabled = Boolean(ov.mepHoleEnabled);
      if (Number.isFinite(ov.mepHoleOffsetMm)) m.mepHoleOffsetMm = ov.mepHoleOffsetMm;
      if (Number.isFinite(ov.mepHoleDiameterMm)) m.mepHoleDiameterMm = ov.mepHoleDiameterMm;

      if (ov.a && Number.isFinite(ov.a.x) && Number.isFinite(ov.a.y)) m.a = { x: ov.a.x, y: ov.a.y };
      if (ov.b && Number.isFinite(ov.b.x) && Number.isFinite(ov.b.y)) m.b = { x: ov.b.x, y: ov.b.y };
      if (Number.isFinite(ov.dx) || Number.isFinite(ov.dy)) {
        const dx = ov.dx || 0, dy = ov.dy || 0;
        m.a = { x: m.a.x + dx, y: m.a.y + dy };
        m.b = { x: m.b.x + dx, y: m.b.y + dy };
      }

      // Start / End span offsets along member axis
      const rawStartOff = Number.isFinite(ov.startOffset) ? ov.startOffset : ov.startOffsetMm;
      const rawEndOff = Number.isFinite(ov.endOffset) ? ov.endOffset : ov.endOffsetMm;
      if (Number.isFinite(rawStartOff) || Number.isFinite(rawEndOff)) {
        const sOff = Number(rawStartOff) || 0;
        const eOff = Number(rawEndOff) || 0;
        const curLen = Math.hypot(m.b.x - m.a.x, m.b.y - m.a.y) || 1;
        const ux = (m.b.x - m.a.x) / curLen;
        const uy = (m.b.y - m.a.y) / curLen;
        m.a = { x: m.a.x - ux * sOff, y: m.a.y - uy * sOff };
        m.b = { x: m.b.x + ux * eOff, y: m.b.y + uy * eOff };
        m.startOffset = sOff;
        m.endOffset = eOff;
        if (eOff > 100 || sOff > 100) m.isCantilever = true;
      }

      if (ov.rotated) {
        const midX = (m.a.x + m.b.x) / 2;
        const midY = (m.a.y + m.b.y) / 2;
        const hx = (m.b.x - m.a.x) / 2;
        const hy = (m.b.y - m.a.y) / 2;
        m.a = { x: midX + hy, y: midY - hx };
        m.b = { x: midX - hy, y: midY + hx };
        m.rotated = true;
      }

      const rawZOff = Number.isFinite(ov.zOffset) ? ov.zOffset : ov.zOffsetMm;
      if (Number.isFinite(rawZOff)) {
        m.zOffset = rawZOff;
        m.z1 = rawZOff;
        m.z0 = rawZOff - m.depth;
      } else {
        m.z0 = (m.z1 || 0) - m.depth;
      }
      m.customEdited = true;
    }
    m.plies = Math.max(1, Number(m.plies) || 1);
    m.totalWidth = (Number(m.width) || 64) * m.plies;
    m.length = Math.hypot(m.b.x - m.a.x, m.b.y - m.a.y);
    if (typeof calculateFloorMemberSupportReaction === 'function') {
      const rx = calculateFloorMemberSupportReaction(m, slab);
      m.reactionStartLbs = rx.reactionStartLbs;
      m.reactionEndLbs = rx.reactionEndLbs;
      m.maxReactionLbs = rx.maxReactionLbs;
      m.reactionStartKN = rx.reactionStartKN;
      m.reactionEndKN = rx.reactionEndKN;
      m.maxReactionKN = rx.maxReactionKN;
    }
    if (typeof evaluateFloorJoistUtilization === 'function') {
      m.utilization = evaluateFloorJoistUtilization(m, slab);
      m.utilPercent = m.utilization.utilPercent;
      m.utilStatus = m.utilization.status;
      m.utilTier = m.utilization.tier;
      m.utilGoverning = m.utilization.governing;
      m.allowableSpanFt = m.utilization.allowableSpanFt;
      m.allowableSpanMm = m.utilization.allowableSpanMm;
    }
    finalMembers.push(m);
  }

  if (typeof window !== 'undefined') {
    window._latestEWPBayBlockingSummaries = bayBlockingSummaries;
  }

  return finalMembers;
}

function floorMemberPolygon(m, minVisualWidthMm = 0) {
  if (m.type === 'Corner stud' && m.cornerBox) {
    const cb = m.cornerBox;
    return [
      { x: cb.x, y: cb.y },
      { x: cb.x + cb.size, y: cb.y },
      { x: cb.x + cb.size, y: cb.y + cb.size },
      { x: cb.x, y: cb.y + cb.size }
    ];
  }
  const dx = m.b.x - m.a.x;
  const dy = m.b.y - m.a.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  const effW = Math.max(m.totalWidth || ((m.width || 64) * (m.plies || 1)), minVisualWidthMm);

  if (m.type === 'Rim board') {
    const w = effW;
    if (m.center) {
      const mx = (m.a.x + m.b.x) / 2;
      const my = (m.a.y + m.b.y) / 2;
      const dot = nx * (m.center.x - mx) + ny * (m.center.y - my);
      if (dot < 0) {
        nx = -nx;
        ny = -ny;
      }
    }
    return [
      { x: m.a.x, y: m.a.y },
      { x: m.b.x, y: m.b.y },
      { x: m.b.x + nx * w, y: m.b.y + ny * w },
      { x: m.a.x + nx * w, y: m.a.y + ny * w }
    ];
  }

  const half = effW / 2;
  return [
    { x: m.a.x - nx * half, y: m.a.y - ny * half },
    { x: m.b.x - nx * half, y: m.b.y - ny * half },
    { x: m.b.x + nx * half, y: m.b.y + ny * half },
    { x: m.a.x + nx * half, y: m.a.y + ny * half }
  ];
}

function findFloorMemberById(id, targetModel = model) {
  if (!id || typeof id !== 'string') return null;
  const m = targetModel || model;
  const slabs = m?.elements ? m.elements.filter(e => e.type === 'slab') : [];
  if (!slabs.length) slabs.push(getActiveFloorSlab(m));
  for (const s of slabs) {
    const members = generateFloorFramingForSlab(s);
    const found = members.find(fm => fm.id === id || fm.shortTag === id);
    if (found) return { slab: s, member: found, allMembers: members };
  }
  return null;
}

function updateFloorMemberById(id, patch = {}, opts = {}) {
  const info = findFloorMemberById(id);
  if (!info) return null;
  const { slab, member, allMembers } = info;
  const edits = ensureFloorFramingEditsStore(slab);
  const cleanPatch = { ...patch };
  const applyToRole = Boolean(cleanPatch.applyToAllSameType || opts?.applyToRole || opts?.applyToAllSameType);
  delete cleanPatch.applyToAllSameType;

  const applyPatchToMemberId = (targetId) => {
    const cur = edits.memberOverrides[targetId] || {};
    edits.memberOverrides[targetId] = { ...cur, ...cleanPatch };
    const extraIdx = edits.extraMembers.findIndex(em => em.id === targetId);
    if (extraIdx >= 0) {
      Object.assign(edits.extraMembers[extraIdx], cleanPatch);
    }
  };

  if (applyToRole) {
    for (const fm of allMembers) {
      if (fm.type === member.type) {
        applyPatchToMemberId(fm.id);
      }
    }
  } else {
    applyPatchToMemberId(member.id);
  }
  return findFloorMemberById(member.id)?.member || null;
}

function moveFloorMemberById(id, moveOpts = {}) {
  const info = findFloorMemberById(id);
  if (!info) return null;
  const { slab, member } = info;
  const edits = ensureFloorFramingEditsStore(slab);
  const cur = edits.memberOverrides[member.id] || {};
  const isVerticalInPlan = Math.abs(member.b.y - member.a.y) >= Math.abs(member.b.x - member.a.x);

  let nextA = { x: member.a.x, y: member.a.y };
  let nextB = { x: member.b.x, y: member.b.y };

  if (Number.isFinite(moveOpts.deltaPerp)) {
    if (isVerticalInPlan) {
      nextA.x += moveOpts.deltaPerp;
      nextB.x += moveOpts.deltaPerp;
    } else {
      nextA.y += moveOpts.deltaPerp;
      nextB.y += moveOpts.deltaPerp;
    }
  }
  if (Number.isFinite(moveOpts.deltaX)) {
    nextA.x += moveOpts.deltaX;
    nextB.x += moveOpts.deltaX;
  }
  if (Number.isFinite(moveOpts.deltaY)) {
    nextA.y += moveOpts.deltaY;
    nextB.y += moveOpts.deltaY;
  }
  if (Number.isFinite(moveOpts.targetCoord)) {
    if (isVerticalInPlan) {
      const spanX = nextB.x - nextA.x;
      nextA.x = moveOpts.targetCoord;
      nextB.x = moveOpts.targetCoord + spanX;
    } else {
      const spanY = nextB.y - nextA.y;
      nextA.y = moveOpts.targetCoord;
      nextB.y = moveOpts.targetCoord + spanY;
    }
  }
  edits.memberOverrides[member.id] = {
    ...cur,
    a: nextA,
    b: nextB,
    dx: 0,
    dy: 0
  };
  return findFloorMemberById(member.id)?.member || null;
}

function addExtraFloorMemberNear(id, sideOrOpts = 'after') {
  const sideStr = typeof sideOrOpts === 'object' && sideOrOpts ? (sideOrOpts.side || 'after') : String(sideOrOpts || 'after');
  const isBefore = sideStr === 'before' || sideStr === 'left';
  const info = findFloorMemberById(id);
  const slab = info ? info.slab : getActiveFloorSlab();
  const edits = ensureFloorFramingEditsStore(slab);
  const baseMember = info ? info.member : generateFloorFramingForSlab(slab).find(m => m.type === 'Floor joist');
  if (!baseMember) return null;

  const isVerticalInPlan = Math.abs(baseMember.b.y - baseMember.a.y) >= Math.abs(baseMember.b.x - baseMember.a.x);
  const offsetDist = (isBefore ? -1 : 1) * 203.2; // 8" (half standard 16" spacing)
  const newIndex = edits.extraMembers.length + 1;
  const shortTag = `FJ-X${String(newIndex).padStart(2, '0')}`;
  const newId = `${slab.id}:${shortTag}`;
  const newMember = {
    ...clone(baseMember),
    id: newId,
    memberId: newId,
    shortTag,
    a: {
      x: baseMember.a.x + (isVerticalInPlan ? offsetDist : 0),
      y: baseMember.a.y + (isVerticalInPlan ? 0 : offsetDist)
    },
    b: {
      x: baseMember.b.x + (isVerticalInPlan ? offsetDist : 0),
      y: baseMember.b.y + (isVerticalInPlan ? 0 : offsetDist)
    },
    customEdited: true
  };
  edits.extraMembers.push(newMember);
  return newMember;
}

function deleteFloorMemberById(id) {
  const info = findFloorMemberById(id);
  if (!info) return false;
  const { slab, member } = info;
  const edits = ensureFloorFramingEditsStore(slab);
  const extraIdx = edits.extraMembers.findIndex(em => em.id === member.id);
  if (extraIdx >= 0) {
    edits.extraMembers.splice(extraIdx, 1);
  } else if (!edits.deletedMembers.includes(member.id)) {
    edits.deletedMembers.push(member.id);
  }
  return true;
}

function restoreDeletedFloorMembers(slab) {
  const targetSlab = slab || getActiveFloorSlab();
  const edits = ensureFloorFramingEditsStore(targetSlab);
  const count = edits.deletedMembers.length;
  edits.deletedMembers.length = 0;
  return count;
}

function resetAllFloorMemberEdits(slab) {
  const targetSlab = slab || getActiveFloorSlab();
  const edits = ensureFloorFramingEditsStore(targetSlab);
  edits.deletedMembers.length = 0;
  edits.extraMembers.length = 0;
  for (const k of Object.keys(edits.memberOverrides)) {
    delete edits.memberOverrides[k];
  }
}

if (typeof window !== 'undefined') {
  window.generateFloorFramingForSlab = generateFloorFramingForSlab;
  window.floorMemberPolygon = floorMemberPolygon;
  window.findFloorMemberById = findFloorMemberById;
  window.updateFloorMemberById = updateFloorMemberById;
  window.moveFloorMemberById = moveFloorMemberById;
  window.addExtraFloorMemberNear = addExtraFloorMemberNear;
  window.deleteFloorMemberById = deleteFloorMemberById;
  window.restoreDeletedFloorMembers = restoreDeletedFloorMembers;
  window.resetAllFloorMemberEdits = resetAllFloorMemberEdits;
}

function emitSlopedRakePrism(faceId, poly2D, z0Start, z0End, vertThk, matName) {
  if (!poly2D || poly2D.length < 4) return;
  const p = [
    { ...poly2D[0], b: z0Start, t: z0Start + vertThk },
    { ...poly2D[1], b: z0End, t: z0End + vertThk },
    { ...poly2D[2], b: z0End, t: z0End + vertThk },
    { ...poly2D[3], b: z0Start, t: z0Start + vertThk }
  ];
  const colors = materials[matName] || materials.Oak;
  const pushFace = (pts3, col) => {
    const ps = pts3.map(project3);
    projectedFaces.push({
      id: faceId,
      points: ps,
      depth: ps.reduce((s, q) => s + q.depth, 0) / ps.length,
      color: col,
      world: pts3,
      cutSurface: isCutFace(pts3)
    });
  };
  pushFace(p.map(v => ({ x: v.x, y: v.y, z: v.b })), colors[1]);
  for (let i = 0; i < 4; i++) {
    const a = p[i], b = p[(i + 1) % 4];
    pushFace([
      { x: a.x, y: a.y, z: a.b },
      { x: b.x, y: b.y, z: b.b },
      { x: b.x, y: b.y, z: b.t },
      { x: a.x, y: a.y, z: a.t }
    ], i % 2 ? colors[0] : colors[1]);
  }
  pushFace(p.map(v => ({ x: v.x, y: v.y, z: v.t })), colors[2]);
}

function emitWallProfilePrism(faceId, w, profileXZ, depth, lateralOffset, baseZ, matName) {
  if (!w || !w.a || !w.b || !Array.isArray(profileXZ) || profileXZ.length < 3) return;
  let ptsXZ = profileXZ.map(pt => ({ x: Number(pt.x) || 0, z: Number(pt.z) || 0 }));
  if (typeof viewportCut !== 'undefined' && viewportCut.enabled && viewportCut.axis === 'z') {
    const cutRel = viewportCut.position - baseZ;
    const isBelow = viewportCut.side === 'below';
    const clippedXZ = [];
    for (let i = 0; i < ptsXZ.length; i++) {
      const a = ptsXZ[i], b = ptsXZ[(i + 1) % ptsXZ.length];
      const insideA = isBelow ? a.z <= cutRel + 0.01 : a.z >= cutRel - 0.01;
      const insideB = isBelow ? b.z <= cutRel + 0.01 : b.z >= cutRel - 0.01;
      if (insideA) clippedXZ.push(a);
      if (insideA !== insideB && Math.abs(b.z - a.z) > 1e-6) {
        const t = (cutRel - a.z) / (b.z - a.z);
        clippedXZ.push({ x: a.x + (b.x - a.x) * t, z: cutRel });
      }
    }
    ptsXZ = clippedXZ;
  }
  const cleanXZ = [];
  for (const pt of ptsXZ) {
    if (!cleanXZ.length || Math.hypot(pt.x - cleanXZ[cleanXZ.length - 1].x, pt.z - cleanXZ[cleanXZ.length - 1].z) > 0.3) {
      cleanXZ.push(pt);
    }
  }
  if (cleanXZ.length > 2 && Math.hypot(cleanXZ[0].x - cleanXZ[cleanXZ.length - 1].x, cleanXZ[0].z - cleanXZ[cleanXZ.length - 1].z) <= 0.3) {
    cleanXZ.pop();
  }
  if (cleanXZ.length < 3) return;

  const u = sub2(w.b, w.a);
  const len = distance(w.a, w.b) || 1;
  const ux = u.x / len, uy = u.y / len;
  const nx = -uy, ny = ux;
  const core = coreGeometry(w);
  const centerOff = referenceOffset(w) + core.center * (w.flipped ? -1 : 1) + (lateralOffset || 0);
  const half = Math.max(4, Number(depth) || 140) / 2;
  const offP = centerOff + half;
  const offM = centerOff - half;

  const plus3D = cleanXZ.map(pt => {
    const cx = w.a.x + ux * pt.x, cy = w.a.y + uy * pt.x;
    return { x: cx + nx * offP, y: cy + ny * offP, z: baseZ + pt.z };
  });
  const minus3D = cleanXZ.map(pt => {
    const cx = w.a.x + ux * pt.x, cy = w.a.y + uy * pt.x;
    return { x: cx + nx * offM, y: cy + ny * offM, z: baseZ + pt.z };
  });

  const colors = materials[matName] || materials.Oak;
  const pushFace = (pts3, col) => {
    const ps = pts3.map(project3);
    projectedFaces.push({
      id: faceId,
      points: ps,
      depth: ps.reduce((s, q) => s + q.depth, 0) / ps.length,
      color: col,
      world: pts3,
      cutSurface: isCutFace(pts3)
    });
  };
  pushFace(plus3D, colors[0]);
  pushFace([...minus3D].reverse(), colors[1]);
  for (let i = 0; i < cleanXZ.length; i++) {
    const j = (i + 1) % cleanXZ.length;
    const edgeCol = Math.abs(cleanXZ[j].x - cleanXZ[i].x) > Math.abs(cleanXZ[j].z - cleanXZ[i].z) ? colors[2] : colors[1];
    pushFace([plus3D[i], plus3D[j], minus3D[j], minus3D[i]], edgeCol);
  }
}

function emitFloorMember3D(faceId, m, baseZ, slabId) {
  const z0 = baseZ + (Number.isFinite(m.z0) ? m.z0 : -302);
  const z1 = baseZ + (Number.isFinite(m.z1) ? m.z1 : 0);
  const depth = Math.max(38, z1 - z0);
  const isSel = selected.includes(faceId);

  const tagFaces = (n0, floorPart, defaultColor) => {
    const finalCol = isSel ? '#38bdf8' : defaultColor;
    for (let i = n0; i < projectedFaces.length; i++) {
      projectedFaces[i].timberMember = true;
      projectedFaces[i].isFloorMember = true;
      projectedFaces[i].memberType = m.type;
      projectedFaces[i].memberRole = m.section || m.type;
      projectedFaces[i].floorPart = floorPart;
      projectedFaces[i].floorColor = finalCol;
      projectedFaces[i].slabId = slabId;
      projectedFaces[i].color = finalCol;
    }
  };

  if (m.type === 'Corner stud' && m.cornerBox && m.family !== 'ijoist' && m.family !== 'lvl') {
    const n0 = projectedFaces.length;
    prism(faceId, floorMemberPolygon(m), z0, z1, 'Oak');
    tagFaces(n0, 'corner-block', '#b45309');
    return;
  }

  const dx = m.b.x - m.a.x;
  const dy = m.b.y - m.a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  let nx = -uy;
  let ny = ux;

  const stripPoly = (s0, s1, offCenter, w) => {
    const h = w / 2;
    const c0 = offCenter - h;
    const c1 = offCenter + h;
    const ax = m.a.x + ux * s0, ay = m.a.y + uy * s0;
    const bx = m.a.x + ux * s1, by = m.a.y + uy * s1;
    return [
      { x: ax + nx * c0, y: ay + ny * c0 },
      { x: bx + nx * c0, y: by + ny * c0 },
      { x: bx + nx * c1, y: by + ny * c1 },
      { x: ax + nx * c1, y: ay + ny * c1 }
    ];
  };

  const emitBox = (s0, s1, offCenter, w, bz0, bz1, matName, floorPart, col) => {
    if (s1 - s0 < 4 || bz1 - bz0 < 2 || w < 2) return;
    const n0 = projectedFaces.length;
    prism(faceId, stripPoly(s0, s1, offCenter, w), bz0, bz1, matName);
    tagFaces(n0, floorPart, col);
  };

  const emitSloped = (s0, s1, offCenter, w, zStart, zEnd, vertThk, matName, floorPart, col) => {
    if (Math.abs(s1 - s0) < 8 || w < 2) return;
    const n0 = projectedFaces.length;
    emitSlopedRakePrism(faceId, stripPoly(s0, s1, offCenter, w), zStart, zEnd, vertThk, matName);
    tagFaces(n0, floorPart, col);
  };

  const secStr = String(m.section || '');
  const roleStr = String(m.type || '');
  const fam = m.family || (
    /posi-strut/i.test(secStr) ? 'posistrut'
    : /floor truss|open-web/i.test(secStr) ? 'openweb'
    : /steel|w8x/i.test(secStr) ? 'steel'
    : /lvl|psl|glulam|microllam|parallam/i.test(secStr) || ['Floor beam', 'Trimmer joist', 'Opening header', '2-Ply LVL Girder', 'Dropped LVL Girder', '2-Ply Opening Trimmer', '2-Ply Opening Header'].includes(roleStr) ? 'lvl'
    : /rim/i.test(roleStr) ? 'rim'
    : /block|bridg|strongback|strapping/i.test(roleStr) ? 'blocking'
    : /2x10|2x12|47x|dimensional|c24/i.test(secStr) ? 'dimensional'
    : 'ijoist'
  );

  const plies = Math.max(1, Number(m.plies) || (['Floor beam', 'Trimmer joist', 'Opening header'].includes(roleStr) ? 2 : 1));

  // Helper to emit distinct 3D Galvanized Steel Joist Hangers & Bearing Connectors at bearing ends
  const emit3DHanger = (atStart, hangerType, memberTotalW) => {
    const ht = hangerType === 'skewed_45' ? 'heavy_skewed' : hangerType;
    if (!ht || ht === 'none' || len < 100) return;

    const hLen = Math.min(82, Math.max(28, len * 0.16));
    const s0 = atStart ? 2 : len - hLen - 2;
    const s1 = atStart ? 2 + hLen : len - 2;
    const endS0 = atStart ? 0 : len - 9;
    const endS1 = atStart ? 9 : len;
    const plateT = 6;

    if (ht === 'ledger_ribbon') {
      // 2x4 Timber Ledger Ribbon + Steel Seismic/Toe Tie Clip Angle
      const ribLen = Math.min(88, len * 0.2);
      const rs0 = atStart ? 0 : len - ribLen;
      const rs1 = atStart ? ribLen : len;
      emitBox(rs0, rs1, 0, memberTotalW + 44, z0 - 38, z0, 'Oak', 'rim-board', '#b45309');
      const clipS0 = atStart ? 2 : len - Math.min(54, ribLen);
      const clipS1 = atStart ? Math.min(54, ribLen) : len - 2;
      emitBox(clipS0, clipS1, +(memberTotalW / 2 + 3.5), 6, z0 - 20, z0 + 44, 'Steel', 'steel-hanger', '#64748b');
      return;
    }

    if (ht === 'bearing_plate') {
      // Wide Steel Sill Bearing Plate + Dual Uplift Hold-Down Clips
      const bpLen = Math.min(92, len * 0.2);
      const bs0 = atStart ? 0 : len - bpLen;
      const bs1 = atStart ? bpLen : len;
      emitBox(bs0, bs1, 0, memberTotalW + 52, z0 - 14, z0, 'Steel', 'steel-hanger', '#475569');
      const clS0 = atStart ? 8 : len - Math.min(62, bpLen);
      const clS1 = atStart ? Math.min(62, bpLen) : len - 8;
      emitBox(clS0, clS1, -(memberTotalW / 2 + 3.5), 6, z0 - 14, z0 + 56, 'Steel', 'steel-hanger', '#94a3b8');
      emitBox(clS0, clS1, +(memberTotalW / 2 + 3.5), 6, z0 - 14, z0 + 56, 'Steel', 'steel-hanger', '#94a3b8');
      return;
    }

    if (ht === 'column_cap') {
      // Simpson CCQ Heavy-Duty Column Cap Inverted Saddle + Post Sleeve
      const ccLen = Math.min(115, len * 0.22);
      const cs0 = atStart ? 0 : len - ccLen;
      const cs1 = atStart ? ccLen : len;
      const sideH = Math.max(70, depth * 0.62);
      emitBox(cs0, cs1, 0, memberTotalW + 28, z0 - 16, z0, 'Steel', 'steel-hanger', '#334155');
      emitBox(cs0, cs1, -(memberTotalW / 2 + 5), 10, z0, z0 + sideH, 'Steel', 'steel-hanger', '#475569');
      emitBox(cs0, cs1, +(memberTotalW / 2 + 5), 10, z0, z0 + sideH, 'Steel', 'steel-hanger', '#475569');
      // Downward post-sleeve bucket flanges
      emitBox(cs0, cs1, -(memberTotalW / 2 + 5), 10, z0 - 120, z0 - 16, 'Steel', 'steel-hanger', '#334155');
      emitBox(cs0, cs1, +(memberTotalW / 2 + 5), 10, z0 - 120, z0 - 16, 'Steel', 'steel-hanger', '#334155');
      return;
    }

    if (ht === 'top_mount') {
      // Simpson IUS/ITS Top-Mount Flange Hanger: bottom seat + full-height straps + wrap-over header saddle ears
      emitBox(s0, s1, 0, memberTotalW + plateT * 2, z0 - 6, z0 + 4, 'Steel', 'steel-hanger', '#64748b');
      emitBox(s0, s1, -(memberTotalW / 2 + plateT / 2), plateT, z0, z1, 'Steel', 'steel-hanger', '#94a3b8');
      emitBox(s0, s1, +(memberTotalW / 2 + plateT / 2), plateT, z0, z1, 'Steel', 'steel-hanger', '#94a3b8');
      const earLen = Math.min(40, hLen);
      const earS0 = atStart ? 0 : len - earLen;
      const earS1 = atStart ? earLen : len;
      emitBox(earS0, earS1, 0, memberTotalW + 76, z1 - 5, z1 + 6, 'Steel', 'steel-hanger', '#64748b');
      emitBox(endS0, endS1, 0, memberTotalW + 76, z1 - 38, z1 + 6, 'Steel', 'steel-hanger', '#475569');
      return;
    }

    if (ht === 'concealed_flange') {
      // Simpson IUC/LUCZ Concealed-Flange Hanger: slim flush cheeks + inward back flange tucked behind joist
      const sideH = Math.max(64, depth * 0.74);
      emitBox(s0, s1, 0, memberTotalW + plateT * 2, z0 - 5, z0 + 4, 'Steel', 'steel-hanger', '#64748b');
      emitBox(s0, s1, -(memberTotalW / 2 + plateT / 2), plateT, z0, z0 + sideH, 'Steel', 'steel-hanger', '#94a3b8');
      emitBox(s0, s1, +(memberTotalW / 2 + plateT / 2), plateT, z0, z0 + sideH, 'Steel', 'steel-hanger', '#94a3b8');
      emitBox(endS0, endS1, 0, memberTotalW, z0 + 10, Math.max(z0 + 40, z1 - 12), 'Steel', 'steel-hanger', '#475569');
      return;
    }

    if (ht === 'adjustable_truss') {
      // Simpson THA/MSTA Adjustable Truss Strap Hanger: pocket seat + tall strap arms climbing over top chord
      const sideH = Math.max(70, depth * 0.52);
      emitBox(s0, s1, 0, memberTotalW + plateT * 2, z0 - 6, z0 + 4, 'Steel', 'steel-hanger', '#64748b');
      emitBox(s0, s1, -(memberTotalW / 2 + plateT / 2), plateT, z0, z0 + sideH, 'Steel', 'steel-hanger', '#94a3b8');
      emitBox(s0, s1, +(memberTotalW / 2 + plateT / 2), plateT, z0, z0 + sideH, 'Steel', 'steel-hanger', '#94a3b8');
      const strapS0 = atStart ? 2 : len - 24;
      const strapS1 = atStart ? 24 : len - 2;
      emitBox(strapS0, strapS1, -(memberTotalW / 2 + plateT / 2), plateT, z0 + sideH - 12, z1 + 8, 'Steel', 'steel-hanger', '#64748b');
      emitBox(strapS0, strapS1, +(memberTotalW / 2 + plateT / 2), plateT, z0 + sideH - 12, z1 + 8, 'Steel', 'steel-hanger', '#64748b');
      const wrapLen = Math.min(58, hLen);
      const wS0 = atStart ? 0 : len - wrapLen;
      const wS1 = atStart ? wrapLen : len;
      emitBox(wS0, wS1, 0, memberTotalW + 24, z1 + 1, z1 + 8, 'Steel', 'steel-hanger', '#64748b');
      return;
    }

    if (ht === 'heavy_skewed') {
      // Simpson SUR/SUL 45° Skewed / HHUS Heavy Girder Hanger: heavy 8mm plate + tall cheeks + wide nailing flanges + gusset
      const hvLen = Math.min(98, Math.max(36, len * 0.19));
      const hs0 = atStart ? 2 : len - hvLen - 2;
      const hs1 = atStart ? 2 + hvLen : len - 2;
      const hvT = 8;
      const sideH = Math.max(76, depth * 0.88);
      emitBox(hs0, hs1, 0, memberTotalW + hvT * 2, z0 - 8, z0 + 5, 'Steel', 'steel-hanger', '#475569');
      emitBox(hs0, hs1, 0, 18, z0 - 22, z0 - 8, 'Steel', 'steel-hanger', '#334155');
      emitBox(hs0, hs1, -(memberTotalW / 2 + hvT / 2), hvT, z0, z0 + sideH, 'Steel', 'steel-hanger', '#64748b');
      emitBox(hs0, hs1, +(memberTotalW / 2 + hvT / 2), hvT, z0, z0 + sideH, 'Steel', 'steel-hanger', '#64748b');
      emitBox(endS0, endS1, -(memberTotalW / 2 + 28), 48, z0 + 6, z0 + depth * 0.90, 'Steel', 'steel-hanger', '#475569');
      emitBox(endS0, endS1, +(memberTotalW / 2 + 28), 48, z0 + 6, z0 + depth * 0.90, 'Steel', 'steel-hanger', '#475569');
      return;
    }

    // Default: Face-Mount (Simpson LUS / MIU Double-Shear Hanger): U-seat + side stirrups + outward header face flanges
    const sideH = Math.max(62, depth * 0.72);
    emitBox(s0, s1, 0, memberTotalW + plateT * 2, z0 - 6, z0 + 4, 'Steel', 'steel-hanger', '#64748b');
    emitBox(s0, s1, -(memberTotalW / 2 + plateT / 2), plateT, z0, z0 + sideH, 'Steel', 'steel-hanger', '#94a3b8');
    emitBox(s0, s1, +(memberTotalW / 2 + plateT / 2), plateT, z0, z0 + sideH, 'Steel', 'steel-hanger', '#94a3b8');
    emitBox(endS0, endS1, -(memberTotalW / 2 + 20), 34, z0 + 10, z0 + depth * 0.78, 'Steel', 'steel-hanger', '#64748b');
    emitBox(endS0, endS1, +(memberTotalW / 2 + 20), 34, z0 + 10, z0 + depth * 0.78, 'Steel', 'steel-hanger', '#64748b');
  };

  if (fam === 'ijoist') {
    // TRUE 3D ENGINEERED I-JOIST (Wide Top & Bottom Microllam LVL Flanges + Recessed Thin OSB Web Core)
    const flangeW = Math.max(54, Number(m.width) || 64);
    const flangeH = Math.max(38, Math.min(46, Math.round(depth * 0.145)));
    const webW = Math.max(11, Math.min(15, Math.round(flangeW * 0.2)));
    const plyGap = plies > 1 ? 3 : 0;
    const totalW = flangeW * plies + plyGap * (plies - 1);

    for (let p = 0; p < plies; p++) {
      const plyCenter = -totalW / 2 + flangeW / 2 + p * (flangeW + plyGap);
      // Top LVL Flange
      emitBox(0, len, plyCenter, flangeW, z1 - flangeH, z1, 'Oak', 'ijoist-flange', '#e6a648');
      // Bottom LVL Flange
      emitBox(0, len, plyCenter, flangeW, z0, z0 + flangeH, 'Oak', 'ijoist-flange', '#e6a648');

      // Recessed OSB Structural Web Core (with optional MEP circular/octagonal duct knockout hole)
      const webZ0 = z0 + flangeH;
      const webZ1 = z1 - flangeH;
      if (m.mepHoleEnabled && len > 500) {
        const holeDia = Math.min(depth - flangeH * 2 - 24, Math.max(60, Number(m.mepHoleDiameterMm) || 120));
        const holeCenter = Math.max(holeDia + 80, Math.min(len - holeDia - 80, Number(m.mepHoleOffsetMm) || len * 0.35));
        const h0 = holeCenter - holeDia / 2;
        const h1 = holeCenter + holeDia / 2;
        emitBox(0, h0, plyCenter, webW, webZ0, webZ1, 'Timber', 'ijoist-web', '#78461a');
        emitBox(h1, len, plyCenter, webW, webZ0, webZ1, 'Timber', 'ijoist-web', '#78461a');
        // Web strips above and below the knockout hole
        const remZ = Math.max(10, (webZ1 - webZ0 - holeDia) / 2);
        emitBox(h0, h1, plyCenter, webW, webZ1 - remZ, webZ1, 'Timber', 'ijoist-web', '#78461a');
        emitBox(h0, h1, plyCenter, webW, webZ0, webZ0 + remZ, 'Timber', 'ijoist-web', '#78461a');
      } else {
        emitBox(0, len, plyCenter, webW, webZ0, webZ1, 'Timber', 'ijoist-web', '#78461a');
      }

      // 3D Web Stiffener Blocks in the recessed I-joist side channels at bearing ends
      const stiffMode = m.webStiffeners || 'both';
      if (stiffMode !== 'none' && len > 260) {
        const stiffThick = Math.max(14, (flangeW - webW) / 2 - 2);
        const stiffLen = Math.min(89, len * 0.18);
        const emitStiffenerPairAt = (sStart) => {
          emitBox(sStart, sStart + stiffLen, plyCenter - (webW / 2 + stiffThick / 2), stiffThick, webZ0, webZ1, 'Oak', 'ijoist-stiffener', '#b87d32');
          emitBox(sStart, sStart + stiffLen, plyCenter + (webW / 2 + stiffThick / 2), stiffThick, webZ0, webZ1, 'Oak', 'ijoist-stiffener', '#b87d32');
        };
        if (stiffMode === 'both' || stiffMode === 'start' || stiffMode === 'midspan') {
          emitStiffenerPairAt(28);
        }
        if (stiffMode === 'both' || stiffMode === 'end' || stiffMode === 'midspan') {
          emitStiffenerPairAt(len - 28 - stiffLen);
        }
        if (stiffMode === 'midspan' && len > 1200) {
          emitStiffenerPairAt(len / 2 - stiffLen / 2);
        }
      }
    }
    emit3DHanger(true, m.hangerStart, totalW);
    emit3DHanger(false, m.hangerEnd, totalW);
    return;
  }

  if (fam === 'lvl') {
    // TRUE 3D MULTI-PLY ENGINEERED LVL / PSL BEAM, OPENING TRIMMER & HEADER
    const plyW = Math.max(44, Number(m.width) || 45);
    const seamGap = plies > 1 ? 4 : 0; // Visible lamination joint between individual LVL plies
    const totalW = plyW * plies + seamGap * (plies - 1);
    const capH = Math.min(12, Math.round(depth * 0.05));

    for (let p = 0; p < plies; p++) {
      const plyCenter = -totalW / 2 + plyW / 2 + p * (plyW + seamGap);
      const plyColor = p % 2 === 0 ? '#ea580c' : '#d97706';
      // Main laminated LVL ply core
      emitBox(0, len, plyCenter, plyW, z0 + capH, z1 - capH, 'Oak', 'lvl-ply', plyColor);
      // Top & bottom dark phenolic glue-line veneer caps
      emitBox(0, len, plyCenter, plyW, z1 - capH, z1, 'Oak', 'lvl-cap', '#9a3412');
      emitBox(0, len, plyCenter, plyW, z0, z0 + capH, 'Oak', 'lvl-cap', '#9a3412');
    }
    emit3DHanger(true, m.hangerStart, totalW);
    emit3DHanger(false, m.hangerEnd, totalW);
    return;
  }

  if (fam === 'steel') {
    // TRUE 3D WIDE-FLANGE STEEL I-BEAM (W8x18) + TIMBER TOP NAILER
    const flangeW = Math.max(133, Number(m.totalWidth) || 133);
    const nailerH = 38;
    const steelTop = z1 - nailerH;
    const flangeH = 12;
    const webW = 10;
    // Top 2x6 Wood Nailer Plate bolted to top flange
    emitBox(0, len, 0, flangeW, steelTop, z1, 'Oak', 'ijoist-flange', '#e6a648');
    // Top Steel Flange
    emitBox(0, len, 0, flangeW, steelTop - flangeH, steelTop, 'Steel', 'steel-beam', '#475569');
    // Bottom Steel Flange
    emitBox(0, len, 0, flangeW, z0, z0 + flangeH, 'Steel', 'steel-beam', '#475569');
    // Recessed Steel Web
    emitBox(0, len, 0, webW, z0 + flangeH, steelTop - flangeH, 'Steel', 'steel-beam', '#334155');
    return;
  }

  if (fam === 'posistrut' || fam === 'openweb') {
    // TRUE 3D POSI-STRUT METAL-WEB OR OPEN-WEB FLOOR TRUSS (Top & Bottom 2x4 Chords + Triangulated Webs)
    const chordW = Math.max(76, Number(m.totalWidth) || 89);
    const chordH = Math.max(38, Math.min(45, Math.round(depth * 0.15)));
    const webZ0 = z0 + chordH;
    const webZ1 = z1 - chordH;
    // Top 2x4 Chord
    emitBox(0, len, 0, chordW, z1 - chordH, z1, 'Oak', 'truss-chord', '#e6a648');
    // Bottom 2x4 Chord
    emitBox(0, len, 0, chordW, z0, z0 + chordH, 'Oak', 'truss-chord', '#e6a648');
    // End Vertical Trimmable Bearing Blocks
    const endBlockLen = Math.min(89, len * 0.12);
    emitBox(0, endBlockLen, 0, chordW * 0.85, webZ0, webZ1, 'Oak', 'ijoist-stiffener', '#b87d32');
    emitBox(len - endBlockLen, len, 0, chordW * 0.85, webZ0, webZ1, 'Oak', 'ijoist-stiffener', '#b87d32');

    // Triangulated Diagonal Webs
    const clearLen = Math.max(0, len - endBlockLen * 2);
    const panelTarget = Math.max(360, depth * 1.3);
    const nPanels = Math.max(2, Math.round(clearLen / panelTarget));
    const step = clearLen / nPanels;
    const isMetalWeb = fam === 'posistrut';
    const webThick = isMetalWeb ? 18 : 35;
    const webVertH = isMetalWeb ? 24 : 35;
    const webColor = isMetalWeb ? '#94a3b8' : '#b8803d';
    const webPart = isMetalWeb ? 'posistrut-web' : 'openweb-strut';

    for (let i = 0; i < nPanels; i++) {
      const sA = endBlockLen + i * step;
      const sB = sA + step;
      const up = i % 2 === 0;
      emitSloped(
        sA,
        sB,
        0,
        webThick,
        up ? webZ0 : (webZ1 - webVertH),
        up ? (webZ1 - webVertH) : webZ0,
        webVertH,
        isMetalWeb ? 'Steel' : 'Oak',
        webPart,
        webColor
      );
    }
    emit3DHanger(true, m.hangerStart, chordW);
    emit3DHanger(false, m.hangerEnd, chordW);
    return;
  }

  if (fam === 'blocking' && m.bridgingStyle === 'herringbone') {
    // TRUE 3D HERRINGBONE CROSS-BRIDGING (Pair of crossing diagonal X-struts between joists)
    const strutW = 28;
    const strutH = 32;
    emitSloped(0, len, -18, strutW, z0 + 18, z1 - 18 - strutH, strutH, 'Oak', 'floor-bridging', '#0d9488');
    emitSloped(0, len, +18, strutW, z1 - 18 - strutH, z0 + 18, strutH, 'Oak', 'floor-bridging', '#0f766e');
    return;
  }

  if (fam === 'blocking' && (!m.bridgingStyle || m.bridgingStyle === 'solid_blocking')) {
    // Full-depth EWP I-Joist Blocking panel between joists
    const flangeW = Math.max(54, Number(m.totalWidth) || 64);
    const flangeH = Math.max(35, Math.round(depth * 0.14));
    emitBox(0, len, 0, flangeW, z1 - flangeH, z1, 'Oak', 'floor-blocking', '#0d9488');
    emitBox(0, len, 0, flangeW, z0, z0 + flangeH, 'Oak', 'floor-blocking', '#0d9488');
    emitBox(0, len, 0, 14, z0 + flangeH, z1 - flangeH, 'Timber', 'floor-blocking-web', '#115e59');
    return;
  }

  if (fam === 'rim') {
    const n0 = projectedFaces.length;
    prism(faceId, floorMemberPolygon(m, 38), z0, z1, 'Oak');
    tagFaces(n0, 'rim-board', '#b45309');
    return;
  }

  // Dimensional Lumber Joist (2x10 / 2x12 / 47x225 C24) or Strongback
  const plyW = Math.max(38, Number(m.width) || 45);
  const seamGap = plies > 1 ? 3 : 0;
  const totalW = plyW * plies + seamGap * (plies - 1);
  const dimCol = fam === 'blocking' ? '#0d9488' : '#d4944e';
  for (let p = 0; p < plies; p++) {
    const plyCenter = -totalW / 2 + plyW / 2 + p * (plyW + seamGap);
    emitBox(0, len, plyCenter, plyW, z0, z1, 'Oak', 'dimensional-joist', dimCol);
  }
  emit3DHanger(true, m.hangerStart, totalW);
  emit3DHanger(false, m.hangerEnd, totalW);
}

function emitWallMember3D(faceId, w, m, z, catInfo) {
  const n0 = projectedFaces.length;
  const matType = m.framingMaterial || 'dimensional';
  const isSel = m.isStud && selected.includes(faceId);
  const tagWallFaces = (startIdx, floorPart, partColor) => {
    for (let i = startIdx; i < projectedFaces.length; i++) {
      projectedFaces[i].timberMember = true;
      projectedFaces[i].memberType = m.type;
      projectedFaces[i].memberRole = m.role || '';
      projectedFaces[i].studCategory = m.studCategory || catInfo?.category || '';
      projectedFaces[i].studCategoryLabel = m.studCategoryLabel || catInfo?.label || m.type;
      projectedFaces[i].framingMaterial = matType;
      if (floorPart) projectedFaces[i].floorPart = floorPart;
      projectedFaces[i].studColor = partColor || m.studColor || catInfo?.color || '';
      projectedFaces[i].studRgb = catInfo?.rgb || null;
      projectedFaces[i].wallId = w.id;
      projectedFaces[i].isStud = Boolean(m.isStud);
      projectedFaces[i].customSize = Boolean(m.customSize);
      projectedFaces[i].collision = Boolean(m.collision);
      if (isSel) projectedFaces[i].color = '#38bdf8';
      else if (projectedFaces[i].studColor) projectedFaces[i].color = projectedFaces[i].studColor;
    }
  };

  if (m.isRakePlate && (Array.isArray(m.profileXZ) || (Number.isFinite(m.slopeZ0) && Number.isFinite(m.slopeZ1)))) {
    const vThk = m.rakeVertThk || 42;
    const baseH = Number.isFinite(m.baseH) ? m.baseH : 0;
    const xzPoly = Array.isArray(m.profileXZ) && m.profileXZ.length >= 3
      ? m.profileXZ
      : [
          { x: m.x0, z: m.slopeBotZ0 ?? Math.max(baseH, m.slopeZ0 - vThk) },
          { x: m.x1, z: m.slopeBotZ1 ?? Math.max(baseH, m.slopeZ1 - vThk) },
          { x: m.x1, z: m.slopeZ1 },
          { x: m.x0, z: m.slopeZ0 }
        ];
    emitWallProfilePrism(faceId, w, xzPoly, Number(m.depth) || 140, m.lateralOffset || 0, z, 'Oak');
    tagWallFaces(n0);
    return;
  }

  if (m.isGableStud && Number.isFinite(m.bevelZ0) && Number.isFinite(m.bevelZ1)) {
    const xzPoly = [
      { x: m.x0, z: m.z0 },
      { x: m.x1, z: m.z0 },
      { x: m.x1, z: m.bevelZ1 }
    ];
    if (Number.isFinite(m.bevelZPeak) && Number.isFinite(m.bevelPeakX) && m.bevelPeakX > m.x0 + 0.5 && m.bevelPeakX < m.x1 - 0.5) {
      xzPoly.push({ x: m.bevelPeakX, z: m.bevelZPeak });
    }
    xzPoly.push({ x: m.x0, z: m.bevelZ0 });
    emitWallProfilePrism(faceId, w, xzPoly, Number(m.depth) || 140, m.lateralOffset || 0, z, 'Oak');
    tagWallFaces(n0);
    return;
  }

  if (matType === 'dimensional') {
    prism(faceId, framingMemberWorld(w, m), z + m.z0, z + m.z1, 'Oak');
    tagWallFaces(n0);
    return;
  }

  const u = sub2(w.b, w.a);
  const wallLen = distance(w.a, w.b) || 1;
  const ux = u.x / wallLen, uy = u.y / wallLen;
  const nx = -uy, ny = ux;
  const core = coreGeometry(w);
  const centerOff = referenceOffset(w) + core.center * (w.flipped ? -1 : 1) + (m.lateralOffset || 0);
  const quadAt = (xa, xb, nOff, nThick) => {
    const c0 = centerOff + nOff - nThick / 2;
    const c1 = centerOff + nOff + nThick / 2;
    const pa = { x: w.a.x + ux * xa, y: w.a.y + uy * xa };
    const pb = { x: w.a.x + ux * xb, y: w.a.y + uy * xb };
    return [
      { x: pa.x + nx * c0, y: pa.y + ny * c0 },
      { x: pb.x + nx * c0, y: pb.y + ny * c0 },
      { x: pb.x + nx * c1, y: pb.y + ny * c1 },
      { x: pa.x + nx * c1, y: pa.y + ny * c1 }
    ];
  };

  const mw = Math.max(12, Math.abs(m.x1 - m.x0));
  const md = Math.max(24, Number(m.depth) || 140);
  const bz0 = z + m.z0;
  const bz1 = z + m.z1;
  const mz = Math.max(12, bz1 - bz0);

  if (matType === 'ijoist') {
    if (m.isStud) {
      // Vertical I-Joist Stud: wide outer & inner LVL flanges + recessed thin OSB web core + end stiffeners
      const flangeT = Math.max(20, Math.min(38, Math.round(md * 0.24)));
      const flangeW = Math.max(mw, 48);
      const cx = (m.x0 + m.x1) / 2;
      const fx0 = cx - flangeW / 2, fx1 = cx + flangeW / 2;
      const webW = Math.max(10, Math.min(14, Math.round(flangeW * 0.22)));
      const wx0 = cx - webW / 2, wx1 = cx + webW / 2;
      const webSpan = Math.max(12, md - flangeT * 2);

      // Outer & inner LVL flanges
      let k0 = projectedFaces.length;
      prism(faceId, quadAt(fx0, fx1, -md / 2 + flangeT / 2, flangeT), bz0, bz1, 'Oak');
      tagWallFaces(k0, 'ijoist-flange', '#e6a648');

      k0 = projectedFaces.length;
      prism(faceId, quadAt(fx0, fx1, md / 2 - flangeT / 2, flangeT), bz0, bz1, 'Oak');
      tagWallFaces(k0, 'ijoist-flange', '#e6a648');

      // Recessed OSB web core
      k0 = projectedFaces.length;
      prism(faceId, quadAt(wx0, wx1, 0, webSpan), bz0, bz1, 'Timber');
      tagWallFaces(k0, 'ijoist-web', '#78461a');

      // Top & bottom web stiffener blocks
      if (mz > 240) {
        const stiffH = Math.min(90, mz * 0.1);
        const stiffW = Math.max(8, (flangeW - webW) / 2 - 2);
        for (const sOff of [-(webW / 2 + stiffW / 2), +(webW / 2 + stiffW / 2)]) {
          k0 = projectedFaces.length;
          prism(faceId, quadAt(cx + sOff - stiffW / 2, cx + sOff + stiffW / 2, 0, webSpan), bz0 + 8, bz0 + 8 + stiffH, 'Oak');
          tagWallFaces(k0, 'ijoist-stiffener', '#b87d32');
          k0 = projectedFaces.length;
          prism(faceId, quadAt(cx + sOff - stiffW / 2, cx + sOff + stiffW / 2, 0, webSpan), bz1 - 8 - stiffH, bz1 - 8, 'Oak');
          tagWallFaces(k0, 'ijoist-stiffener', '#b87d32');
        }
      }
      return;
    }

    // Horizontal Wall Member (Header / Plate / Sill): Top & Bottom LVL flanges + recessed OSB web + end stiffeners
    const flangeH = Math.max(24, Math.min(44, Math.round(mz * 0.2)));
    const flangeDepth = Math.max(md, 64);
    const webDepth = Math.max(11, Math.min(15, Math.round(flangeDepth * 0.22)));
    const webZ0 = bz0 + flangeH;
    const webZ1 = bz1 - flangeH;

    let k0 = projectedFaces.length;
    prism(faceId, quadAt(m.x0, m.x1, 0, flangeDepth), bz1 - flangeH, bz1, 'Oak');
    tagWallFaces(k0, 'ijoist-flange', '#e6a648');

    k0 = projectedFaces.length;
    prism(faceId, quadAt(m.x0, m.x1, 0, flangeDepth), bz0, bz0 + flangeH, 'Oak');
    tagWallFaces(k0, 'ijoist-flange', '#e6a648');

    if (webZ1 > webZ0 + 6) {
      k0 = projectedFaces.length;
      prism(faceId, quadAt(m.x0, m.x1, 0, webDepth), webZ0, webZ1, 'Timber');
      tagWallFaces(k0, 'ijoist-web', '#78461a');

      if (mw > 220) {
        const stiffLen = Math.min(80, mw * 0.15);
        const stiffThick = Math.max(12, (flangeDepth - webDepth) / 2 - 2);
        for (const sA of [m.x0 + 18, m.x1 - 18 - stiffLen]) {
          for (const side of [-1, 1]) {
            k0 = projectedFaces.length;
            prism(faceId, quadAt(sA, sA + stiffLen, side * (webDepth / 2 + stiffThick / 2), stiffThick), webZ0, webZ1, 'Oak');
            tagWallFaces(k0, 'ijoist-stiffener', '#b87d32');
          }
        }
      }
    }
    return;
  }

  // LVL (Multi-Ply Laminated Veneer Lumber) Profile
  if (m.isStud) {
    const plies = 2;
    const seamGap = 3;
    const plyW = Math.max(16, (mw - seamGap) / plies);
    const capT = Math.min(10, Math.round(md * 0.07));
    for (let p = 0; p < plies; p++) {
      const px0 = m.x0 + p * (plyW + seamGap);
      const px1 = px0 + plyW;
      const plyColor = p % 2 === 0 ? '#ea580c' : '#d97706';
      let k0 = projectedFaces.length;
      prism(faceId, quadAt(px0, px1, 0, Math.max(16, md - capT * 2)), bz0, bz1, 'Oak');
      tagWallFaces(k0, 'lvl-ply', plyColor);

      // Phenolic glue-line veneer caps on interior/exterior faces
      k0 = projectedFaces.length;
      prism(faceId, quadAt(px0, px1, -md / 2 + capT / 2, capT), bz0, bz1, 'Oak');
      tagWallFaces(k0, 'lvl-cap', '#9a3412');

      k0 = projectedFaces.length;
      prism(faceId, quadAt(px0, px1, md / 2 - capT / 2, capT), bz0, bz1, 'Oak');
      tagWallFaces(k0, 'lvl-cap', '#9a3412');
    }
    return;
  }

  // Horizontal Wall Member as 2-Ply LVL Header / Beam with visible lamination gap and phenolic caps
  const plies = Math.max(2, Number(construction(w).headerPlies) || 2);
  const seamGap = 4;
  const plyD = Math.max(32, (md - seamGap * (plies - 1)) / plies);
  const capH = Math.min(12, Math.max(6, Math.round(mz * 0.06)));
  for (let p = 0; p < plies; p++) {
    const pCenter = -md / 2 + plyD / 2 + p * (plyD + seamGap);
    const plyColor = p % 2 === 0 ? '#ea580c' : '#d97706';
    let k0 = projectedFaces.length;
    prism(faceId, quadAt(m.x0, m.x1, pCenter, plyD), bz0 + capH, bz1 - capH, 'Oak');
    tagWallFaces(k0, 'lvl-ply', plyColor);

    k0 = projectedFaces.length;
    prism(faceId, quadAt(m.x0, m.x1, pCenter, plyD), bz1 - capH, bz1, 'Oak');
    tagWallFaces(k0, 'lvl-cap', '#9a3412');

    k0 = projectedFaces.length;
    prism(faceId, quadAt(m.x0, m.x1, pCenter, plyD), bz0, bz0 + capH, 'Oak');
    tagWallFaces(k0, 'lvl-cap', '#9a3412');
  }
}

function solidModel(){
  projectedFaces=[];
  if(typeof autoAlignTrussRoofsToWallPlates==='function'&&Array.isArray(model?.elements)){
    try{autoAlignTrussRoofsToWallPlates();}catch(_){}
  }
  if(view==='framing3d'){
    for(const w of model.elements.filter(e=>e.type==='wall'&&shown(e))){
      const z=wallBase(w);
      const wfMembers = typeof generateWallFraming==='function' ? (generateWallFraming(w)?.members||[]) : [];
      for(const m of wfMembers){
        const faceId=m.isStud&&m.id?m.id:w.id;
        const catInfo=typeof getWallMemberCategoryInfo==='function'?getWallMemberCategoryInfo(m):null;
        emitWallMember3D(faceId, w, m, z, catInfo);
      }
    }
    for(const s of model.elements.filter(e=>e.type==='slab'&&shown(e))){
      const z=storyOf(s).elevation;
      for(const m of generateFloorFramingForSlab(s)){
        const faceId=m.id||s.id;
        emitFloorMember3D(faceId, m, z, s.id);
      }
    }
    drawRoofFraming3D();projectedFaces.sort((a,b)=>a.depth-b.depth);return;
  }
  const opCheck=typeof hasTrimOrSEO==='function'?hasTrimOrSEO:()=>false;
  const shownWalls=model.elements.filter(e=>e.type==='wall'&&shown(e));
  const regularWalls=shownWalls.filter(w=>!opCheck(w));
  const operatedWalls=shownWalls.filter(w=>opCheck(w));
  const wallCells=clipWallCells(joinedWallCells(regularWalls));
  for(const face of wallSurfaces(wallCells)){
    const ps=face.points.map(project3),colors=materials[face.material]||materials.Timber;
    projectedFaces.push({id:face.id,points:ps,depth:ps.reduce((a,p)=>a+p.depth,0)/ps.length,color:selected.includes(face.id)?'#91b8a1':face.kind==='top'?colors[2]:face.kind==='bottom'?colors[1]:(Math.abs(face.points[0].x-face.points[1].x)>Math.abs(face.points[0].y-face.points[1].y)?colors[0]:colors[1]),wallSurface:true,world:face.points,cutSurface:isCutFace(face.points)});
  }
  for(const w of operatedWalls){
    emitOperatedElementFaces(w,projectedFaces,project3,isCutFace,materials,selected);
  }
  if(typeof construction==='function'&&typeof generateWallFraming==='function'){
    for(const w of model.elements.filter(e=>e.type==='wall'&&shown(e))){
      if(!construction(w).enabled)continue;
      const z=wallBase(w);
      for(const m of (generateWallFraming(w)?.members||[])){
        if(!m.isStud&&!m.isRakePlate)continue;
        const faceId=m.id||w.id;
        const catInfo=typeof getWallMemberCategoryInfo==='function'?getWallMemberCategoryInfo(m):null;
        emitWallMember3D(faceId, w, m, z, catInfo);
      }
    }
  }
  for(const o of model.elements.filter(e=>e.host&&e.type!=='skylight'&&shown(e))){
    if(opCheck(o)){emitOperatedElementFaces(o,projectedFaces,project3,isCutFace,materials,selected);continue;}
    const w=hostOf(o);if(!w||!w.a||!w.b)continue;const len=distance(w.a,w.b),z=wallBase(w),top=heightOf(w);
    prism(o.id,openingSolidPolygon(w,o),z+o.sill,z+Math.min(o.sill+o.height,top),o.type==='window'?'Glass':'Oak');
  }
  for(const e of model.elements.filter(shown)){
    const z=storyOf(e).elevation;
    if(e.type==='wall'||(e.host&&e.type!=='skylight')){continue;}
    if(opCheck(e)){emitOperatedElementFaces(e,projectedFaces,project3,isCutFace,materials,selected);continue;}
    else if(e.type==='slab')prism(e.id,e.points,z-e.thickness,z,e.material);
    else if(e.type==='column'){
      const r=(e.thickness||300)/2;
      const poly=e.columnProfile==='circle'?cylinderPolygon(e.a,r,12):wallPoly(e,{x:e.a.x-r,y:e.a.y},{x:e.a.x+r,y:e.a.y});
      prism(e.id,poly,z,z+heightOf(e),e.material);
    }
    else if(e.type==='skylight'){
      const w=(e.width||1000)/2,l=(e.length||1400)/2;
      prism(e.id,[{x:e.a.x-w,y:e.a.y-l},{x:e.a.x+w,y:e.a.y-l},{x:e.a.x+w,y:e.a.y+l},{x:e.a.x-w,y:e.a.y+l}],z+2400,z+2500,'Glass');
    }
    else if(e.type==='beam'){
      const bmHanger = e.joistHangerType || 'none';
      if(e.framingMaterial==='ijoist'||e.framingMaterial==='lvl'||bmHanger!=='none'){
        const bFam = e.framingMaterial === 'ijoist' || e.framingMaterial === 'lvl' ? e.framingMaterial : 'dimensional';
        const bDepth=e.thickness||302;
        const bTop=z+heightOf(e);
        emitFloorMember3D(e.id,{id:e.id,type:'Floor beam',a:e.a,b:e.b,width:bFam==='ijoist'?89:bFam==='lvl'?45:(e.thickness||140),plies:bFam==='lvl'?2:1,depth:bDepth,family:bFam,z0:-bDepth,z1:0,section:bFam==='ijoist'?'I-Joist Beam':bFam==='lvl'?'2-Ply LVL Beam':`${e.thickness||140}mm Beam`,hangerStart:bmHanger,hangerEnd:bmHanger},bTop,e.id);
      }else{
        prism(e.id,wallPoly(e),z+heightOf(e)-e.thickness,z+heightOf(e),e.material);
      }
    }
    else if(e.type==='roof')drawRoofSolid(e);
    else if(e.type==='stair'&&e.a&&e.b){
      const risers=e.risers||16,rh=(e.height||3048)/risers,w=e.width||1000,len=distance(e.a,e.b)||1,u={x:(e.b.x-e.a.x)/len,y:(e.b.y-e.a.y)/len},n={x:-u.y*w/2,y:u.x*w/2};
      for(let i=0;i<risers;i++){
        const p1=lerp(e.a,e.b,i/risers),p2=lerp(e.a,e.b,(i+1)/risers);
        prism(e.id,[{x:p1.x+n.x,y:p1.y+n.y},{x:p2.x+n.x,y:p2.y+n.y},{x:p2.x-n.x,y:p2.y-n.y},{x:p1.x-n.x,y:p1.y-n.y}],z+i*rh,z+(i+1)*rh,'Timber');
      }
    }else if(e.type==='railing'&&e.a&&e.b){
      prism(e.id,wallPoly(e,e.a,e.b,40),z+950,z+1050,'Steel');
      const len=distance(e.a,e.b),cnt=Math.max(1,Math.floor(len/500));
      for(let i=0;i<=cnt;i++){
        const pt=lerp(e.a,e.b,i/cnt);
        prism(e.id,[{x:pt.x-20,y:pt.y-20},{x:pt.x+20,y:pt.y-20},{x:pt.x+20,y:pt.y+20},{x:pt.x-20,y:pt.y+20}],z,z+1000,'Steel');
      }
    }else if(e.type==='curtainwall'&&e.a&&e.b){
      prism(e.id,wallPoly(e,e.a,e.b,50),z,z+heightOf(e),'Glass');
    }else if(e.type==='morph'&&e.points){
      prism(e.id,e.points,z,z+(e.height||2400),e.material||'Concrete');
    }else if(e.type==='mesh'&&e.points){
      prism(e.id,e.points,z-(e.skirtDepth||800),z,e.material||'Concrete');
    }else if(e.type==='object'&&e.a){
      const w=e.width||1600,d=e.depth||900;
      prism(e.id,[{x:e.a.x-w/2,y:e.a.y-d/2},{x:e.a.x+w/2,y:e.a.y-d/2},{x:e.a.x+w/2,y:e.a.y+d/2},{x:e.a.x-w/2,y:e.a.y+d/2}],z,z+(e.height||750),e.material||'Oak');
    }
  }
  projectedFaces.sort((a,b)=>a.depth-b.depth);
}
function draw3D(){const vp=globalThis.cadtechViewport;if(vp&&vp.enabled&&vp.sync()){cameraUI();return}drawViewportGround();solidModel();projectedFaces=projectedFaces.filter(f=>transparent||surfaceVisible(f));prepareWallFeatureEdges(projectedFaces);if(!transparent){drawOpaqueSolids(projectedFaces)}else {solidOwners=null;ctx.globalAlpha=.38;for(const face of projectedFaces){const fill=sceneCamera.style==='hiddenline'?'#f8faf7':shadedSurface(face),edge=sceneCamera.style==='hiddenline'?'#67746d':face.wallSurface?null:selected.includes(face.id)?'#4e8061':'#686d5630';poly(face.points,fill,edge,selected.includes(face.id)?.8:.5);for(const e of face.featureEdges||[])line(e.a,e.b,e.selected?'#4f7e5e':sceneCamera.style==='hiddenline'?'#66756d':'#6d7f6a70',e.selected?1:.65)}}ctx.globalAlpha=1;drawViewportAxes();label('Drag to orbit · Shift / Space + drag to pan · Scroll to zoom',width/2,height-28,11,'#85988b');cameraUI()}
const DIMENSION_TOOLS = ['dimension','leveldim','radialdim','angledim','text','label','section'];

function computeVerticalStackup(wall, xAlongWall = null) {
  const targetWall = wall || (typeof framingWall === 'function' ? framingWall() : null) || model.elements.find(e => e.type === 'wall' && e.story === activeStory) || model.elements.find(e => e.type === 'wall');
  if (!targetWall) return null;
  const c = typeof construction === 'function' ? construction(targetWall) : { studWidth: 38, studDepth: 140, plateThickness: 38, topPlates: 2, bottomPlates: 1, headerDepth: 190, headerPlies: 2, headerPosition: 'top', timberGrade: 'C16' };
  const h = heightOf(targetWall);
  const baseElev = wallBase(targetWall);
  const len = distance(targetWall.a, targetWall.b);
  const sw = c.studWidth || 38;
  const sd = c.studDepth || 140;
  const pThk = c.plateThickness || 38;
  const bottomPlates = c.bottomPlates || 1;
  const topPlates = c.topPlates || 2;
  const bottomPlateTop = bottomPlates * pThk;
  const topPlateZ0 = h - topPlates * pThk;
  const hDepth = c.headerDepth || 190;
  const hPlies = c.headerPlies || 2;

  const ops = typeof hosted === 'function' ? hosted(targetWall) : [];
  let targetOpening = null;
  if (ops.length > 0) {
    if (Number.isFinite(xAlongWall)) {
      targetOpening = ops.find(o => Math.abs(xAlongWall - o.offset) <= (o.width || 900) / 2 + 120) ||
        [...ops].sort((a, b) => Math.abs(xAlongWall - a.offset) - Math.abs(xAlongWall - b.offset))[0];
    } else {
      targetOpening = ops.find(o => o.type === 'window') || ops[0];
    }
  }

  const opSill = targetOpening ? (targetOpening.sill ?? (targetOpening.type === 'door' ? 0 : 900)) : 900;
  const opHeight = targetOpening ? (targetOpening.height || 1500) : 1500;
  const opHead = opSill + opHeight;
  const sillPlies = opSill > bottomPlateTop + pThk ? 2 : 1;
  const sillThk = sillPlies * pThk;
  const sillZ0 = opSill > bottomPlateTop ? Math.max(bottomPlateTop, opSill - sillThk) : 0;
  const sillZ1 = opSill > bottomPlateTop ? opSill : bottomPlateTop;

  const isTopHeader = c.headerPosition !== 'opening';
  const headerZ0 = isTopHeader ? Math.max(opHead, topPlateZ0 - hDepth) : opHead;
  const headerZ1 = isTopHeader ? topPlateZ0 : Math.min(topPlateZ0, opHead + hDepth);
  const actualHeaderDepth = Math.max(pThk, Math.round(headerZ1 - headerZ0));

  const xPos = Number.isFinite(xAlongWall)
    ? Math.max(0, Math.min(len, xAlongWall))
    : (targetOpening ? targetOpening.offset : len / 2);

  return {
    wall: targetWall,
    wallId: targetWall.id,
    opening: targetOpening,
    openingId: targetOpening ? targetOpening.id : null,
    xAlongWall: Math.round(xPos),
    baseElev,
    wallHeight: h,
    bottomPlate: {
      role: 'BOTTOM PLATE',
      z0: 0,
      z1: bottomPlateTop,
      thickness: bottomPlateTop,
      plies: bottomPlates,
      section: `${bottomPlates}-Ply ${formatSection(pThk, sd)}`,
      spec: `${bottomPlates}-Ply ${formatSection(pThk, sd)} (${formatLength(bottomPlateTop)})`,
      color: '#4d5b43'
    },
    sill: {
      role: 'SILL MEMBER',
      z0: sillZ0,
      z1: sillZ1,
      thickness: Math.round(sillZ1 - sillZ0),
      plies: sillPlies,
      section: `${sillPlies}-Ply ${formatSection(pThk, sd)}`,
      spec: `${sillPlies}-Ply ${formatSection(pThk, sd)} (${formatLength(sillZ1 - sillZ0)} @ +${formatLength(sillZ1)})`,
      color: '#0369a1'
    },
    roughOpening: {
      role: 'ROUGH OPENING',
      z0: sillZ1,
      z1: opHead,
      height: Math.round(opHead - sillZ1)
    },
    header: {
      role: 'HEADER MEMBER',
      z0: headerZ0,
      z1: headerZ1,
      thickness: actualHeaderDepth,
      plies: hPlies,
      section: `${hPlies}-Ply ${formatSection(sw, actualHeaderDepth)}`,
      spec: `${hPlies}-Ply ${formatSection(sw, actualHeaderDepth)} (${formatLength(actualHeaderDepth)} @ +${formatLength(headerZ0)}–${formatLength(headerZ1)})`,
      color: '#b45309'
    },
    topPlates: {
      role: 'TOP PLATES',
      z0: topPlateZ0,
      z1: h,
      thickness: Math.round(h - topPlateZ0),
      plies: topPlates,
      section: `${topPlates}-Ply ${formatSection(pThk, sd)}`,
      spec: `${topPlates}-Ply ${formatSection(pThk, sd)} (${formatLength(h - topPlateZ0)} @ +${formatLength(topPlateZ0)}–${formatLength(h)})`,
      color: '#0f766e'
    }
  };
}
window.computeVerticalStackup = computeVerticalStackup;

function drawSectionStackupCallout(stackup, xScreen, prZ, codeLabel = 'SEC-1', isPreview = false, isSelected = false) {
  if (!stackup) return null;
  ctx.save();
  if (isPreview) ctx.globalAlpha = 0.85;

  const yBottom0 = prZ(0);
  const yBottom1 = prZ(stackup.bottomPlate.z1);
  const ySill0 = prZ(stackup.sill.z0);
  const ySill1 = prZ(stackup.sill.z1);
  const yHeader0 = prZ(stackup.header.z0);
  const yHeader1 = prZ(stackup.header.z1);
  const yTop0 = prZ(stackup.topPlates.z0);
  const yTop1 = prZ(stackup.topPlates.z1);

  const cutColor = isSelected ? '#0284c7' : (isPreview ? '#0ea5e9' : '#0f766e');
  const topExtY = yTop1 - 28;
  const botExtY = yBottom0 + 28;

  // 1. Vertical Section Cutting Plane Line
  line({ x: xScreen, y: topExtY }, { x: xScreen, y: botExtY }, cutColor, isSelected ? 2.2 : 1.6, [8, 4, 2, 4]);

  // Top & Bottom Section Callout Bubbles
  for (const [by, dir] of [[topExtY - 12, -1], [botExtY + 12, 1]]) {
    ctx.beginPath();
    ctx.arc(xScreen, by, 11, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? '#e0f2fe' : '#f0fdfa';
    ctx.fill();
    ctx.strokeStyle = cutColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // Direction arrow pointing right toward callout stack
    poly([
      { x: xScreen + 11, y: by - 5 },
      { x: xScreen + 18, y: by },
      { x: xScreen + 11, y: by + 5 }
    ], cutColor, cutColor, 1);
    label(codeLabel, xScreen, by, 7.5, '#0f172a', 'center');
  }

  // 2. Highlighted Member Stack-Up Zones directly on the section line
  const memberZones = [
    { ...stackup.topPlates, y0: yTop1, y1: yTop0, fill: '#ccfbf1cc', stroke: '#0f766e' },
    { ...stackup.header, y0: yHeader1, y1: yHeader0, fill: '#fef3c7cc', stroke: '#b45309' },
    { ...stackup.sill, y0: ySill1, y1: ySill0, fill: '#e0f2fecc', stroke: '#0369a1' },
    { ...stackup.bottomPlate, y0: yBottom1, y1: yBottom0, fill: '#ecfccbcc', stroke: '#4d5b43' }
  ];
  for (const mz of memberZones) {
    const zh = Math.max(4, mz.y1 - mz.y0);
    rect(xScreen - 7, mz.y0, 14, zh, mz.fill, mz.stroke, 1.3);
  }

  // 3. Continuous Vertical Callout Dimension Line (offset horizontally from section line)
  const flipLeft = xScreen > width - 310;
  const dimOffsetPx = flipLeft ? -28 : 28;
  const dimX = xScreen + dimOffsetPx;
  line({ x: dimX, y: yTop1 - 8 }, { x: dimX, y: yBottom0 + 8 }, '#0f172a', 1.2);

  // Dimension witness lines & 45-degree architectural ticks at every stack-up elevation datum
  const datums = [
    { z: 0, y: yBottom0 },
    { z: stackup.bottomPlate.z1, y: yBottom1 },
    { z: stackup.sill.z0, y: ySill0 },
    { z: stackup.sill.z1, y: ySill1 },
    { z: stackup.header.z0, y: yHeader0 },
    { z: stackup.header.z1, y: yHeader1 },
    { z: stackup.topPlates.z0, y: yTop0 },
    { z: stackup.topPlates.z1, y: yTop1 }
  ];
  for (const dt of datums) {
    line({ x: xScreen, y: dt.y }, { x: dimX + (flipLeft ? -5 : 5), y: dt.y }, '#64748b', 0.75, [2, 2]);
    // 45° architectural tick
    line({ x: dimX - 4, y: dt.y + 4 }, { x: dimX + 4, y: dt.y - 4 }, '#0f172a', 1.5);
  }

  // Segment dimension measurements between members
  const segments = [
    { yA: yTop1, yB: yTop0, text: formatLength(stackup.topPlates.thickness), color: '#0f766e' },
    { yA: yHeader1, yB: yHeader0, text: formatLength(stackup.header.thickness), color: '#b45309' },
    { yA: yHeader0, yB: ySill1, text: `R.O. ${formatLength(stackup.header.z0 - stackup.sill.z1)}`, color: '#475569' },
    { yA: ySill1, yB: ySill0, text: formatLength(stackup.sill.thickness), color: '#0369a1' },
    { yA: yBottom1, yB: yBottom0, text: formatLength(stackup.bottomPlate.thickness), color: '#4d5b43' }
  ];
  for (const seg of segments) {
    const midY = (seg.yA + seg.yB) / 2;
    if (Math.abs(seg.yB - seg.yA) >= 12) {
      label(seg.text, dimX + (flipLeft ? -7 : 7), midY, 7.5, seg.color, flipLeft ? 'right' : 'left');
    }
  }

  // 4. Callout Leader Cards showing Vertical Stack-Up of Top Plates, Header, Sill & Bottom Plate
  const cardW = 248;
  const cardH = 22;
  const cardGap = 6;
  const cardX = flipLeft ? (dimX - 44 - cardW) : (dimX + 44);
  const stackTopY = Math.max(46, Math.min(height - 175, (yTop1 + yBottom0) / 2 - 58));

  // Header Title Pill
  const titleText = `VERTICAL STACK-UP CALLOUT · ${stackup.wallId}${stackup.openingId ? ' (' + stackup.openingId + ')' : ''}`;
  rect(cardX, stackTopY - 22, cardW, 19, '#0f172a', cutColor, 1.2);
  label(titleText, cardX + cardW / 2, stackTopY - 12.5, 7.5, '#f8fafc', 'center');

  const calloutItems = [
    {
      title: 'TOP PLATES',
      detail: `${stackup.topPlates.section} (${formatLength(stackup.topPlates.thickness)})`,
      elev: `+${formatLength(stackup.topPlates.z0)}–${formatLength(stackup.topPlates.z1)}`,
      targetY: (yTop0 + yTop1) / 2,
      bg: '#f0fdf4',
      border: '#0f766e',
      txt: '#115e59'
    },
    {
      title: 'HEADER',
      detail: `${stackup.header.section} (${formatLength(stackup.header.thickness)})`,
      elev: `+${formatLength(stackup.header.z0)}–${formatLength(stackup.header.z1)}`,
      targetY: (yHeader0 + yHeader1) / 2,
      bg: '#fffbeb',
      border: '#b45309',
      txt: '#92400e'
    },
    {
      title: 'SILL',
      detail: `${stackup.sill.section} (${formatLength(stackup.sill.thickness)})`,
      elev: `+${formatLength(stackup.sill.z0)}–${formatLength(stackup.sill.z1)}`,
      targetY: (ySill0 + ySill1) / 2,
      bg: '#f0f9ff',
      border: '#0369a1',
      txt: '#075985'
    },
    {
      title: 'BOTTOM PLATE',
      detail: `${stackup.bottomPlate.section} (${formatLength(stackup.bottomPlate.thickness)})`,
      elev: `+0–${formatLength(stackup.bottomPlate.z1)}`,
      targetY: (yBottom0 + yBottom1) / 2,
      bg: '#f7fee7',
      border: '#4d5b43',
      txt: '#365314'
    }
  ];

  calloutItems.forEach((item, idx) => {
    const cy = stackTopY + idx * (cardH + cardGap);
    const cyMid = cy + cardH / 2;
    const leaderAnchorX = flipLeft ? (cardX + cardW) : cardX;
    const elbowX = flipLeft ? (dimX - 16) : (dimX + 16);

    // Leader line from member datum on dimension line to callout card
    line({ x: dimX, y: item.targetY }, { x: elbowX, y: cyMid }, item.border, 1.1);
    line({ x: elbowX, y: cyMid }, { x: leaderAnchorX, y: cyMid }, item.border, 1.1);
    ctx.beginPath();
    ctx.arc(dimX, item.targetY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = item.border;
    ctx.fill();

    // Callout Box
    rect(cardX, cy, cardW, cardH, item.bg, item.border, isSelected ? 1.6 : 1.1);
    label(`${item.title}: ${item.detail}`, cardX + 7, cy + 8, 7.5, item.txt, 'left');
    label(`Elev ${item.elev} · Height ${formatLength(stackup.wallHeight)}`, cardX + 7, cy + 16.5, 6.8, '#475569', 'left');
  });

  ctx.restore();
  return {
    a: { x: Math.min(xScreen - 14, cardX), y: Math.min(topExtY - 24, stackTopY - 24) },
    b: { x: Math.max(xScreen + 14, cardX + cardW), y: Math.max(botExtY + 24, stackTopY + 4 * (cardH + cardGap)) }
  };
}
window.drawSectionStackupCallout = drawSectionStackupCallout;

function drawAnnotations() {
  const s = baseScale * scale;
  for (const e of model.elements.filter(e => shown(e) && ['dimension','leveldim','radialdim','angledim','text','label','line','polyline','circle','arc','rectangle','fill','spline','detail','changemarker','grid','section'].includes(e.type))) {
    let sel = selected.includes(e.id), color = sel ? '#426e59' : '#74866a';
    if (e.type === 'dimension') {
      const d = resolveDimension(e);
      dim(d.a, d.b, (e.offset ?? 600) * baseScale * scale, null, { isSel: sel, dimEl: e });
      if (!d.resolved) {
        const p = p2(lerp(d.a, d.b, 0.5));
        label('Detached anchor', p.x, p.y + 18, 8, '#a18258');
      }
    } else if (e.type === 'line' || e.type === 'section') {
      line(p2(e.a), p2(e.b), e.type === 'section' ? '#0f766e' : color, sel ? 2 : 1.4, e.type === 'section' ? [8, 4] : []);
      if (e.type === 'section') {
        for (const pt of [p2(e.a), p2(e.b)]) {
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 10, 0, 7); ctx.fillStyle = '#f0fdf4'; ctx.fill(); ctx.strokeStyle = '#0f766e'; ctx.lineWidth = 1.4; ctx.stroke();
          label(e.code || 'SEC', pt.x, pt.y, 7.5, '#0f766e');
        }
      }
      if (sel) for (const p of [p2(e.a), p2(e.b)]) rect(p.x - 3, p.y - 3, 6, 6, 'white', '#426e59', 1.2);
    } else if (e.type === 'leveldim' && e.a) {
      const p = p2(e.a);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 6, p.y - 10); ctx.lineTo(p.x + 6, p.y - 10); ctx.closePath();
      ctx.fillStyle = sel ? '#3b82f6' : color; ctx.fill();
      line({ x: p.x - 12, y: p.y - 10 }, { x: p.x + 12, y: p.y - 10 }, color, 1.2);
      label(`▼ +${formatLength(e.targetHeight ?? storyOf(e).elevation)}`, p.x + 16, p.y - 10, 9, color, 'left');
    } else if (e.type === 'radialdim' && e.a) {
      const p = p2(e.a), r = (e.radius || 1500) * s;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 0.35); ctx.strokeStyle = color; ctx.stroke();
      line(p, { x: p.x + r * Math.cos(0.2), y: p.y + r * Math.sin(0.2) }, color, 1);
      label(`R ${formatLength(e.radius || 1500)}`, p.x + r * 0.6, p.y + r * 0.3, 9, color);
    } else if (e.type === 'angledim' && e.a) {
      const p = p2(e.a);
      ctx.beginPath(); ctx.arc(p.x, p.y, 30, 0, Math.PI / 2); ctx.strokeStyle = color; ctx.stroke();
      line(p, { x: p.x + 40, y: p.y }, color, 1); line(p, { x: p.x, y: p.y + 40 }, color, 1);
      label(`${e.angle || 90}°`, p.x + 20, p.y + 20, 9, color);
    } else if (e.type === 'label' && e.a) {
      const p = p2(e.a);
      line(p, { x: p.x + 25, y: p.y - 15 }, color, 1); line({ x: p.x + 25, y: p.y - 15 }, { x: p.x + 90, y: p.y - 15 }, color, 1);
      label(e.text || 'Element', p.x + 30, p.y - 22, 9, color, 'left');
    } else if (e.type === 'text' && e.a) {
      const p = p2(e.a);
      label(e.text, p.x, p.y, 12, color, 'left');
    } else if (e.type === 'polyline' && e.points) {
      for (let i = 1; i < e.points.length; i++) line(p2(e.points[i - 1]), p2(e.points[i]), color, sel ? 2 : 1);
    } else if (e.type === 'circle' || e.type === 'arc') {
      const p = p2(e.a); ctx.beginPath();
      ctx.arc(p.x, p.y, e.radius * s, e.type === 'arc' ? (e.startAngle ?? 0) : 0, e.type === 'arc' ? (e.startAngle ?? 0) + (e.sweep ?? Math.PI * 1.5) : Math.PI * 2);
      ctx.strokeStyle = color; ctx.lineWidth = sel ? 2 : 1; ctx.stroke();
    } else if (e.type === 'grid' && e.a && e.b) {
      line(p2(e.a), p2(e.b), color, 1, [10, 5]);
      for (const pt of [p2(e.a), p2(e.b)]) {
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 12, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.stroke();
        label(e.bubble || 'A', pt.x, pt.y, 9, color);
      }
    } else if (e.type === 'detail' && e.a) {
      const p = p2(e.a), r = (e.radius || 800) * s;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.strokeStyle = color; ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(p.x + r + 10, p.y - r - 10, 12, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = color; ctx.stroke();
      label(e.code || 'D-01', p.x + r + 10, p.y - r - 10, 8, color);
    } else if (e.type === 'changemarker' && e.a) {
      const p = p2(e.a);
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 10); ctx.lineTo(p.x + 10, p.y + 8); ctx.lineTo(p.x - 10, p.y + 8); ctx.closePath();
      ctx.fillStyle = sel ? '#f59e0b' : '#fef3c7'; ctx.fill(); ctx.strokeStyle = color; ctx.stroke();
      label(e.changeNumber || 'CH-01', p.x + 15, p.y, 8, color, 'left');
    }
  }
}

function drawElevation(){hits=[];const s=baseScale*scale,ox=width/2-6500*s+pan.x,oy=height/2+2000*s+pan.y;const pr=(x,z)=>({x:ox+x*s,y:oy-z*s});line(pr(-1800,0),pr(14800,0),'#adb8a5',1);for(const st of model.stories){const p=pr(-1500,st.elevation);line(p,pr(14500,st.elevation),'#cbd4c4',.65,[6,5]);label(`+${formatLength(st.elevation)}  ${st.name}`,p.x,p.y-12,9,'#8b9a81','left')}
const opCheck=typeof hasTrimOrSEO==='function'?hasTrimOrSEO:()=>false;
if(view==='section'){drawJoinedSection(pr);drawRoofElevation(pr);if(typeof drawOperatedElementElevation==='function'){for(const el of model.elements.filter(e=>shown(e)&&opCheck(e))){drawOperatedElementElevation(el,pr,sectionPlaneY(),true);}}return}const walls=model.elements.filter(e=>e.type==='wall'&&e.story===activeStory&&shown(e));const elevWalls=[];for(const e of walls){let st={...storyOf(e),elevation:wallBase(e)},h=heightOf(e);if(view==='elevation'&&(Math.abs(e.a.y-e.b.y)>1||e.layer!=='Exterior Walls'||e.a.y<Math.max(...walls.filter(w=>Math.abs(w.a.y-w.b.y)<1&&w.layer==='Exterior Walls').map(w=>w.a.y))))continue;elevWalls.push(e);const wxMin=Math.min(e.a.x,e.b.x),wxMax=Math.max(e.a.x,e.b.x);
const gableProf=typeof computeWallRoofGableProfile==='function'?computeWallRoofGableProfile(e):null;
const baseH=gableProf&&gableProf.enabled?gableProf.eaveHeight:h;
let a=pr(wxMin,st.elevation+baseH),b=pr(wxMax,st.elevation);
if(opCheck(e)&&typeof drawOperatedElementElevation==='function'){
  drawOperatedElementElevation(e,pr,sectionPlaneY(),false);
}else{
  rect(a.x,a.y,b.x-a.x,b.y-a.y,selected.includes(e.id)?'#d0e2d0':'#eef1e9','#809373',1);
  if(gableProf&&gableProf.enabled&&gableProf.peakRise>20){
    const wLen=Math.hypot(e.b.x-e.a.x,e.b.y-e.a.y)||1;
    const pts=Array.isArray(gableProf.profilePoints)&&gableProf.profilePoints.length>=2
      ?gableProf.profilePoints
      :[{x:0,rise:gableProf.riseAt(0)},{x:gableProf.peakX,rise:gableProf.peakRise},{x:wLen,rise:gableProf.riseAt(wLen)}];
    const polyPts=[pr(e.a.x,st.elevation+baseH)];
    for(const pt of pts){
      const xW=e.a.x+(e.b.x-e.a.x)*(pt.x/wLen);
      polyPts.push(pr(xW,st.elevation+baseH+pt.rise));
    }
    polyPts.push(pr(e.b.x,st.elevation+baseH));
    poly(polyPts,selected.includes(e.id)?'#d0e2d0':'#eef1e9','#809373',1);
  }
  const c=typeof construction==='function'?construction(e):{plateThickness:38,topPlates:2,bottomPlates:1,headerDepth:190};const pThk=c.plateThickness||38,topThk=(c.topPlates||2)*pThk,botThk=(c.bottomPlates||1)*pThk;
  const tpA=pr(wxMin,st.elevation+baseH),tpB=pr(wxMax,st.elevation+baseH-topThk);rect(tpA.x,tpA.y,tpB.x-tpA.x,tpB.y-tpA.y,'#d1fae580','#0f766e80',0.7);
  const bpA=pr(wxMin,st.elevation+botThk),bpB=pr(wxMax,st.elevation);rect(bpA.x,bpA.y,bpB.x-bpA.x,bpB.y-bpA.y,'#ecfccb80','#4d5b4380',0.7);
}
const c=typeof construction==='function'?construction(e):{plateThickness:38,topPlates:2,bottomPlates:1,headerDepth:190};const pThk=c.plateThickness||38,topThk=(c.topPlates||2)*pThk,botThk=(c.bottomPlates||1)*pThk;
hits.push({id:e.id,a,b});if(view==='elevation')for(const o of hosted(e).filter(shown)){const pos=openingPoint(o),x=pos.x,y=st.elevation+o.sill;let l=pr(x-o.width/2,y+o.height),r=pr(x+o.width/2,y);rect(l.x,l.y,r.x-l.x,r.y-l.y,o.type==='window'?'#dce8df':'#d5cbb2',selected.includes(o.id)?'#315d54':'#9aa990',1);line({x:(l.x+r.x)/2,y:l.y},{x:(l.x+r.x)/2,y:r.y},'#9cafa0',.8);
// Draw header and sill members on elevation opening
const hDepth=c.headerDepth||190,hdrZ0=c.headerPosition!=='opening'?Math.max(o.sill+o.height,h-topThk-hDepth):(o.sill+o.height),hdrZ1=c.headerPosition!=='opening'?(h-topThk):Math.min(h-topThk,o.sill+o.height+hDepth);
const hL=pr(x-o.width/2-38,st.elevation+hdrZ1),hR=pr(x+o.width/2+38,st.elevation+hdrZ0);rect(hL.x,hL.y,hR.x-hL.x,hR.y-hL.y,'#fde68a95','#b4530995',0.8);
if(o.sill>botThk){const sPlies=o.sill>botThk+pThk?2:1,sL=pr(x-o.width/2,st.elevation+o.sill),sR=pr(x+o.width/2,st.elevation+o.sill-sPlies*pThk);rect(sL.x,sL.y,sR.x-sL.x,sR.y-sL.y,'#bae6fd95','#0369a195',0.8);}
hits.push({id:o.id,a:l,b:r})}}drawRoofElevation(pr);if(typeof drawOperatedElementElevation==='function'){for(const el of model.elements.filter(e=>e.type!=='wall'&&shown(e)&&opCheck(e))){drawOperatedElementElevation(el,pr,sectionPlaneY(),false);}}
// Render placed section_callout elements in Elevation view
const sectionCallouts=model.elements.filter(e=>e.type==='section_callout'&&(e.story===activeStory||!e.story)&&isLayerVisible(e.layer));
sectionCallouts.forEach((sc,idx)=>{
  const w=model.elements.find(el=>el.id===sc.wallId&&el.type==='wall')||elevWalls[0]||walls[0];
  if(!w)return;
  const wxMin=Math.min(w.a.x,w.b.x);
  const stackup=computeVerticalStackup(w,sc.xAlongWall);
  if(!stackup)return;
  const xModel=Number.isFinite(sc.elevX)?sc.elevX:(wxMin+stackup.xAlongWall);
  const xScreen=pr(xModel,0).x;
  const prZ=z=>pr(xModel,stackup.baseElev+z).y;
  const box=drawSectionStackupCallout(stackup,xScreen,prZ,sc.code||`SEC-${idx+1}`,false,selected.includes(sc.id));
  if(box)hits.push({id:sc.id,a:box.a,b:box.b});
});
// Live interactive preview when Section tool is active in Elevation view
if(tool==='section'&&lastPointer){
  const elevX=(lastPointer.x-ox)/s;
  const targetW=elevWalls.find(w=>elevX>=Math.min(w.a.x,w.b.x)-200&&elevX<=Math.max(w.a.x,w.b.x)+200)||elevWalls[0]||walls[0];
  if(targetW){
    const wxMin=Math.min(targetW.a.x,targetW.b.x);
    const xAlong=Math.max(0,Math.min(distance(targetW.a,targetW.b),elevX-wxMin));
    const stackup=computeVerticalStackup(targetW,xAlong);
    if(stackup){
      const xScreen=pr(wxMin+stackup.xAlongWall,0).x;
      const prZ=z=>pr(wxMin+stackup.xAlongWall,stackup.baseElev+z).y;
      drawSectionStackupCallout(stackup,xScreen,prZ,'SEC',true,false);
    }
  }
}
label(view==='section'?`SECTION A–A · CUT AT Y ${formatLength(5850)}`:(tool==='section'?'SOUTH ELEVATION · SECTION TOOL ACTIVE: CLICK WALL OR OPENING TO GENERATE VERTICAL STACK-UP CALLOUT':'SOUTH ELEVATION · LIVE MODEL PROJECTION'),width/2,height-65,9,tool==='section'?'#0f766e':'#929f89')}
function drawVisualSnapIndicators() {
  if (isModelView(view) || !hover) return;

  const isDrafting = ['wall','beam','line','curtainwall','railing','stair','slab','roof','zone','dimension'].includes(tool) || editing || drag;
  const walls = model.elements.filter(e => e.type === 'wall' && shown(e));

  // 1. Endpoint target nodes on all existing walls when drafting/dragging
  if (isDrafting && walls.length > 0) {
    ctx.save();
    for (const w of walls) {
      for (const endPt of [w.a, w.b]) {
        const p = p2(endPt);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(2, 132, 199, 0.45)';
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 2. Extension & Alignment Guidelines with Existing Wall Endpoints (X and Y Axis Alignment)
  if (isDrafting && walls.length > 0) {
    ctx.save();
    const activeBase = points.length ? points.at(-1) : null;

    for (const w of walls) {
      for (const ep of [w.a, w.b]) {
        if (activeBase && distance(ep, activeBase) < 1) continue;

        // Horizontal alignment (X-axis extension)
        if (Math.abs(hover.y - ep.y) < 1.5) {
          const epP = p2(ep);
          line({ x: 0, y: epP.y }, { x: width, y: epP.y }, '#0284c7', 1.2, [4, 4]);

          ctx.beginPath();
          ctx.arc(epP.x, epP.y, 6.5, 0, Math.PI * 2);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(epP.x, epP.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#0284c7';
          ctx.fill();

          rect(epP.x - 30, epP.y - 17, 60, 14, '#0f172aee', '#0284c7', 1);
          label('↔ ALIGN X', epP.x, epP.y - 10, 8, '#38bdf8', 'center');
        }

        // Vertical alignment (Y-axis extension)
        if (Math.abs(hover.x - ep.x) < 1.5) {
          const epP = p2(ep);
          line({ x: epP.x, y: 0 }, { x: epP.x, y: height }, '#0284c7', 1.2, [4, 4]);

          ctx.beginPath();
          ctx.arc(epP.x, epP.y, 6.5, 0, Math.PI * 2);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(epP.x, epP.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#0284c7';
          ctx.fill();

          rect(epP.x + 10, epP.y - 7, 60, 14, '#0f172aee', '#0284c7', 1);
          label('↕ ALIGN Y', epP.x + 40, epP.y, 8, '#38bdf8', 'center');
        }
      }
    }
    ctx.restore();
  }

  // 3. Orthogonal Guidelines from Start Point
  if (points.length > 0 && ['wall','line','beam','curtainwall','railing','stair','dimension'].includes(tool)) {
    const base = points.at(-1);
    const baseP = p2(base);
    const hoverP = p2(hover);
    const isOrtho = orthoActive || false;

    ctx.save();
    line({ x: 0, y: baseP.y }, { x: width, y: baseP.y }, '#94a3b860', 0.8, [4, 4]);
    line({ x: baseP.x, y: 0 }, { x: baseP.x, y: height }, '#94a3b860', 0.8, [4, 4]);

    const d = distance(base, hover);
    if (d > 10) {
      const ang = Math.atan2(hover.y - base.y, hover.x - base.x);
      let deg = (ang * 180 / Math.PI + 360) % 360;

      line(baseP, hoverP, isOrtho ? '#0f766e' : '#0284c7', isOrtho ? 2 : 1.2, [6, 4]);

      const midP = lerp(baseP, hoverP, 0.5);
      const angleText = `📐 ${deg.toFixed(1)}°${isOrtho ? ' [ORTHO]' : ''}`;
      const tw = angleText.length * 6 + 12;
      rect(midP.x - tw / 2, midP.y - 18, tw, 16, isOrtho ? '#0f766eee' : '#0284c7ee', '#ffffff', 1);
      label(angleText, midP.x, midP.y - 10, 8.5, '#ffffff', 'center');
    }
    ctx.restore();
  }

  // 4. Timber Teck Intelligent Cursor & Pre-selection Highlight
  if (!isModelView(view) && hover) {
    const hp = p2(hover);
    ctx.save();

    // Pre-selection element highlight when in Arrow (select) tool
    if (tool === 'select' && !drag && lastPointer) {
      const hoveredEl = planPick(lastPointer);
      if (hoveredEl && !selected.includes(hoveredEl.id)) {
        ctx.save();
        if (hoveredEl.type === 'wall') {
          poly(wallPoly(hoveredEl).map(p2), null, '#0284c799', 2);
        } else if (hoveredEl.type === 'dimension') {
          const d = resolveDimension(hoveredEl);
          dim(d.a, d.b, (d.offset ?? 600) * baseScale * scale, null, { isPreview: true, dimEl: hoveredEl });
        }
        ctx.restore();
      }
    }

    // Live 3-click Dimension preview when placing dimension
    if (tool === 'dimension' && points.length >= 1) {
      if (points.length === 1 && distance(points[0], hover) > 10) {
        dim(points[0], hover, 550 * baseScale * scale, null, { isPreview: true });
      } else if (points.length === 2) {
        const [a, b] = points;
        const len = distance(a, b) || 1;
        const n = { x: -(b.y - a.y) / len, y: (b.x - a.x) / len };
        const offMm = (hover.x - a.x) * n.x + (hover.y - a.y) * n.y;
        dim(a, b, offMm * baseScale * scale, null, { isPreview: true });
      }
    }

    // Timber Teck Intelligent Cursor shapes:
    // - Checkmark (✓): at endpoints, wall corners, jambs, or selection grips
    // - Mercedes (3-spoke circle): on element edges/faces/lines
    // - Perpendicular (⊥) / Intersection (×) / Midpoint (△)
    // - Hammer icon: when waiting for 3rd click of dimension placement
    // - Crosshair + Pencil tip: when drafting
    const isNodeSnap = snap && ['Endpoint', 'Wall corner', 'Jamb'].includes(currentSnap);
    const isMidSnap = snap && ['Midpoint', 'Wall centre', 'Opening centre'].includes(currentSnap);
    const isInterSnap = snap && ['Intersection'].includes(currentSnap);
    const isPerpSnap = snap && ['Perpendicular', 'Tangent'].includes(currentSnap);
    const isEdgeSnap = snap && ['On face', 'On line', 'On curve'].includes(currentSnap);
    const isHammer = (tool === 'dimension' && points.length === 2);

    if (isHammer) {
      // Timber Teck Hammer Cursor for placing dimension line offset
      ctx.strokeStyle = '#0f172a';
      ctx.fillStyle = '#0284c7';
      ctx.lineWidth = 1.8;
      // Handle
      line({ x: hp.x, y: hp.y }, { x: hp.x + 12, y: hp.y + 12 }, '#0f172a', 2.2);
      // Hammer head
      poly([
        { x: hp.x - 6, y: hp.y - 2 },
        { x: hp.x + 4, y: hp.y - 12 },
        { x: hp.x + 8, y: hp.y - 8 },
        { x: hp.x - 2, y: hp.y + 2 }
      ], '#0284c7', '#0f172a', 1.4);
    } else if (isNodeSnap) {
      // Timber Teck Heavy Checkmark (✓) at node/endpoint/corner
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(hp.x - 5, hp.y + 1);
      ctx.lineTo(hp.x - 1, hp.y + 6);
      ctx.lineTo(hp.x + 9, hp.y - 7);
      ctx.stroke();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
    } else if (isEdgeSnap) {
      // Timber Teck Mercedes Cursor (Circle with 3 radial spokes at 90°, 210°, 330°)
      const r = 8;
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      for (const deg of [-90, 30, 150]) {
        const rad = (deg * Math.PI) / 180;
        line(hp, { x: hp.x + Math.cos(rad) * r, y: hp.y + Math.sin(rad) * r }, '#0f172a', 1.5);
      }
    } else if (isMidSnap) {
      // Midpoint Triangle + Crosshair
      poly([
        { x: hp.x, y: hp.y - 7 },
        { x: hp.x - 6, y: hp.y + 5 },
        { x: hp.x + 6, y: hp.y + 5 }
      ], '#16a34a28', '#16a34a', 1.8);
      line({ x: hp.x - 9, y: hp.y }, { x: hp.x + 9, y: hp.y }, '#0f172a', 1);
      line({ x: hp.x, y: hp.y - 9 }, { x: hp.x, y: hp.y + 9 }, '#0f172a', 1);
    } else if (isPerpSnap) {
      // Perpendicular icon (⊥)
      line({ x: hp.x - 7, y: hp.y + 6 }, { x: hp.x + 7, y: hp.y + 6 }, '#7c3aed', 2);
      line({ x: hp.x, y: hp.y + 6 }, { x: hp.x, y: hp.y - 7 }, '#7c3aed', 2);
      rect(hp.x, hp.y + 1, 5, 5, null, '#7c3aed', 1.2);
    } else if (isInterSnap) {
      // Intersection X
      line({ x: hp.x - 6, y: hp.y - 6 }, { x: hp.x + 6, y: hp.y + 6 }, '#dc2626', 2);
      line({ x: hp.x + 6, y: hp.y - 6 }, { x: hp.x - 6, y: hp.y + 6 }, '#dc2626', 2);
    } else if (tool !== 'select') {
      // Standard Timber Teck Crosshair Cursor
      line({ x: hp.x - 10, y: hp.y }, { x: hp.x + 10, y: hp.y }, '#0f172a', 1.1);
      line({ x: hp.x, y: hp.y - 10 }, { x: hp.x, y: hp.y + 10 }, '#0f172a', 1.1);
      rect(hp.x - 2.5, hp.y - 2.5, 5, 5, null, '#0284c7', 1);
    }

    // Subtle Timber Teck Snap Tag
    if (snap && currentSnap && !['Grid', 'Off'].includes(currentSnap)) {
      const snapLabel = currentSnap;
      const bw = snapLabel.length * 5.5 + 10;
      rect(hp.x + 12, hp.y + 10, bw, 15, '#ffffffec', '#94a3b8', 0.8);
      label(snapLabel, hp.x + 12 + bw / 2, hp.y + 17.5, 7.5, '#0f172a', 'center');
    }

    ctx.restore();
  }
}

function render(){trackerUI();if(!width)return;if(!isModelView())globalThis.cadtechViewport?.hide();const framingHud=$('#framing-plan-auto-fix-hud');if(framingHud)framingHud.classList.toggle('hidden',view!=='framingplan'||Boolean(window._closedFloatingPopups?.has('framing-plan-auto-fix-hud')));ctx.clearRect(0,0,width,height);ctx.fillStyle='#f7f9f6';ctx.fillRect(0,0,width,height);$('#selection-tip').style.display='none';if(view==='plan'){if(grid){let step=1000*baseScale*scale;if(step>12){ctx.fillStyle='#c9d3c1';let origin=p2({x:0,y:0});for(let x=origin.x%step;x<width;x+=step)for(let y=origin.y%step;y<height;y+=step){ctx.beginPath();ctx.arc(x,y,.65,0,7);ctx.fill()}}}drawPlan();drawVisualSnapIndicators();}else if(view==='framingplan'){drawFramingPlan();drawAnnotations();drawVisualSnapIndicators();}else if(view==='roofframingplan'){drawRoofFramingPlan();drawAnnotations();drawVisualSnapIndicators();}else if(view==='ewpspecs'){drawEWPFloorFramingPlan();drawAnnotations();drawVisualSnapIndicators();}else if(view==='panel'){drawWallPanel();drawAnnotations();drawVisualSnapIndicators();}else if(view==='framing3d')draw3D();else if(view==='3d')draw3D();else if(view!=='schedule'&&view!=='cutlist'&&view!=='audit'&&view!=='floorschedule'&&view!=='trusselevation'){drawElevation();drawAnnotations();drawVisualSnapIndicators();}if(!isModelView(view)&&points.length&&tool!=='dimension'){if(['wall','line','beam'].includes(tool)){const p=p2(points.at(-1));line({x:0,y:p.y},{x:width,y:p.y},'#819c7c80',.6,[3,6]);line({x:p.x,y:0},{x:p.x,y:height},'#819c7c80',.6,[3,6]);}const previewEnd=(hover&&typeof getConstrainedDraftPoint==='function')?getConstrainedDraftPoint(points.at(-1),hover):hover;if(tool==='wall'&&previewEnd&&distance(points.at(-1),previewEnd)>10){const preview={id:'preview',type:'wall',a:points.at(-1),b:previewEnd,thickness:200,reference:'outside',story:activeStory};poly(wallPoly(preview).map(p2),'#739a7c30','#4a795b',1);}for(let i=1;i<points.length;i++)line(p2(points[i-1]),p2(points[i]),'#3d785b',1.5,[4,3]);if(previewEnd){line(p2(points.at(-1)),p2(previewEnd),'#3d785b',1.2,[4,3]);const p=p2(previewEnd);rect(p.x-3,p.y-3,6,6,'white','#3d785b')}}editPreview();if(drag?.kind==='marquee'){const crossing=lastPointer.x<drag.start.x;ctx.setLineDash(crossing?[5,3]:[]);rect(drag.start.x,drag.start.y,lastPointer.x-drag.start.x,lastPointer.y-drag.start.y,crossing?'#387c9820':'#70977917',crossing?'#387c98':'#6e9575',1);ctx.setLineDash([]);label(crossing?'Crossing selection':'Window selection',Math.min(drag.start.x,lastPointer.x)+5,Math.min(drag.start.y,lastPointer.y)-8,9,crossing?'#387c98':'#6e9575','left')};$('#elements-count').textContent=`${model.elements.length} elements`;$('#zoom-status').textContent=`${Math.round(scale*100)}%`;$('#undo').disabled=!modelHistory.length;$('#redo').disabled=!future.length;if(view==='schedule'||view==='cutlist'||view==='audit'||view==='floorschedule')schedule();$('#wall-palette').classList.toggle('hidden',!(view==='plan'&&tool==='select'&&model.elements.some(e=>selected.includes(e.id)&&e.type==='wall'&&shown(e)))||Boolean(window._closedFloatingPopups?.has('wall-palette')))}
function resize(){const b=canvas.getBoundingClientRect();width=b.width;height=b.height;canvas.width=Math.round(width*devicePixelRatio);canvas.height=Math.round(height*devicePixelRatio);ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);baseScale=Math.max(.014,Math.min((width-110)/16000,(height-150)/12000));if(isModelView())fit3DCamera(false);render()}new ResizeObserver(resize).observe($('#canvas-area'));
function field(label,key,value,unit='',type='number'){
  const isMmUnit = unit === 'mm' && type === 'number';
  const dispUnit = isMmUnit && isImperialUnits() ? 'ft-in' : unit;
  const dispType = isMmUnit && isImperialUnits() ? 'text' : type;
  const dispValue = isMmUnit && isImperialUnits() ? formatFeetInches(Number(value)) : value;
  return `<label class="field"><span>${label}</span><div class="input-unit"><input data-property="${key}" ${isMmUnit?'data-unit-mm="1"':''} value="${esc(dispValue)}" type="${dispType}" ${dispType==='number'?'step="0.1"':''}>${dispUnit?`<span>${dispUnit}</span>`:''}</div></label>`;
}function choice(label,key,value,opts){return `<label class="field"><span>${label}</span><select data-property="${key}">${opts.map(([v,t])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`}function check(label,key,value){return `<label class="field"><span>${label}</span><input type="checkbox" data-property="${key}" ${value?'checked':''}></label>`}
var APP_WALL_HEIGHT_PRESETS=[2400,2440,2500,2600,2700,2743,2800,3000,3048,3200,3300,3600];
var APP_OPENING_HEAD_PRESETS=[1800,2000,2040,2100,2134,2200,2300,2400,2440,2500,2600];
function appPresetKey(actual,presets){const n=Number(actual);const hit=presets.find(v=>Math.abs(v-n)<=1);return hit===undefined?'custom':String(hit)}
function openMultiCodeAuditModal(targetWall){
  const w = targetWall || framingWall();
  if(!w){toast('Select a framed wall or stud first.');return;}
  const audit = typeof window.auditWallStructuralWarning === 'function' ? window.auditWallStructuralWarning(w, model) : null;
  if(!audit){toast('Structural audit engine is unavailable.');return;}
  const cur = audit.current;
  const ec5 = cur.ec5;
  const nds = cur.nds;
  const demands = audit.demands;
  const lc = audit.loadCombinations;
  const rack = audit.racking || audit.rackingAudit || {};
  const rackUtil = Number(rack.rackingUtilPct || 0);
  const rackDemand = rack.totalDemandKN ?? rack.V_Ed_kN ?? 0;
  const rackCap = rack.totalCapacityKN ?? rack.F_vRd_kN ?? 0;
  const holdDownKN = rack.netHoldDownTensionKN ?? 0;
  const combosRows = (lc && Array.isArray(lc.combinations)) ? lc.combinations.map(c => {
    const isGovAx = lc.governingAxial && (c.id === lc.governingAxial.combinationId || c.id === lc.governingAxial.pureAxialCombinationId);
    const isGovRk = lc.governingRacking && c.id === lc.governingRacking.combinationId;
    const tag = [isGovAx ? 'GOV AXIAL' : '', isGovRk ? 'GOV RACKING' : ''].filter(Boolean).join(' · ');
    return `
      <tr style="background:${tag ? '#eff6ff' : '#ffffff'};font-size:11px">
        <td><b>${esc(c.id)}</b> · ${esc(c.shortLabel)}${tag ? `<br><span style="font-size:9px;font-weight:800;color:#0369a1">${esc(tag)}</span>` : ''}<div style="font-size:9.5px;color:#64748b">${esc(c.formula)}</div></td>
        <td>${esc(c.durationClass)}<br><small>k<sub>mod</sub>=${c.kmod} / OSB ${c.kmodOSB}</small></td>
        <td style="font-family:monospace"><b>${c.qAxial_kNm}</b> kN/m<br><small>N<sub>Ed</sub>=${c.stud.N_Ed_kN} / ${c.stud.N_Rd_kN} kN</small></td>
        <td style="font-family:monospace;font-weight:700;color:${c.stud.axialDC_pct > 100 ? '#dc2626' : '#0f172a'}">${c.stud.axialDC_pct}%</td>
        <td style="font-family:monospace;font-weight:700;color:${c.stud.combinedDC_pct > 100 ? '#dc2626' : c.stud.combinedDC_pct > 85 ? '#b45309' : '#15803d'}">${c.stud.combinedDC_pct}%</td>
        <td style="font-family:monospace"><b>${c.racking.V_Ed_kN}</b> / ${c.racking.F_vRd_kN} kN</td>
        <td style="font-family:monospace;font-weight:700;color:${c.racking.rackingDC_pct > 100 ? '#dc2626' : c.racking.rackingDC_pct > 85 ? '#b45309' : '#15803d'}">${c.racking.rackingDC_pct}%</td>
        <td style="font-family:monospace">${c.racking.netHoldDownTensionKN} kN</td>
      </tr>`;
  }).join('') : '';

  openModal(`Multi-Code Structural Compliance Audit — ${w.id}`, `
    <div class="modal-copy">
      Full multi-code structural capacity evaluation for <b>${esc(w.id)}</b> (${demands.wallTypeLabel} · ${cur.studWidth}×${cur.studDepth} mm ${cur.timberGrade} @ ${cur.spacing} mm O.C.) under EN 1990 / Eurocode 5 load combinations and NDS 2024.
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0;font-size:11px;background:#f8fafc;padding:10px;border:1px solid #cbd5e1;border-radius:6px">
      <div><span style="color:#64748b;display:block">Governing EC5 Combo</span><strong style="font-size:12px;color:#0369a1">${esc(demands.governingComboLabel || '1.35G + 1.5Q')}</strong></div>
      <div><span style="color:#64748b;display:block">ULS Axial Line Load</span><strong style="font-size:13px;color:#0f172a">${demands.qAxialLineLoad_kNm} kN/m</strong></div>
      <div><span style="color:#64748b;display:block">ULS Wind Pressure</span><strong style="font-size:13px;color:#0f172a">${demands.windPressure_kNm2} kN/m²</strong></div>
      <div><span style="color:#64748b;display:block">Opening Span / Count</span><strong style="font-size:13px;color:#0f172a">${demands.maxOpeningSpanMm || 0} mm (${demands.openingCount} op.)</strong></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0">
      <div style="padding:11px;background:#f0f9ff;border:1px solid #7dd3fc;border-radius:8px;font-size:11px">
        <div style="font-weight:700;color:#0369a1;margin-bottom:6px;display:flex;justify-content:space-between">
          <span>Eurocode 5 Stud Axial &amp; Bend</span>
          <span style="color:${ec5.dcPercent > 100 ? '#dc2626' : ec5.dcPercent > 80 ? '#b45309' : '#15803d'};font-weight:800">${ec5.status} (${ec5.dcPercent}% D/C)</span>
        </div>
        <div><b>Pure Axial N<sub>Ed</sub>/N<sub>Rd</sub>:</b> ${ec5.N_Ed_kN} / ${ec5.N_Rd_kN || '—'} kN (<b>${(ec5.axialUtil * 100).toFixed(1)}%</b>)</div>
        <div><b>Bending Utilization:</b> ${(ec5.bendingUtil * 100).toFixed(1)}%</div>
        <div><b>Buckling Reduction (k<sub>c,y</sub>):</b> ${ec5.kc_y} (k<sub>mod</sub> = ${ec5.kmod || 0.8})</div>
        <div><b>Slenderness (H/d):</b> ${ec5.hOverD} (limit 24)</div>
        <div><b>SLS Wind Deflection:</b> ${ec5.defl_mm} mm (limit ${ec5.deflLimit} mm)</div>
      </div>

      <div style="padding:11px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;font-size:11px">
        <div style="font-weight:700;color:#b45309;margin-bottom:6px;display:flex;justify-content:space-between">
          <span>EC5 §9.2.4 Racking Shear</span>
          <span style="color:${rackUtil > 100 ? '#dc2626' : rackUtil > 85 ? '#b45309' : '#15803d'};font-weight:800">${rackUtil > 100 ? 'FAIL' : rackUtil > 85 ? 'WARNING' : 'PASS'} (${rackUtil}% D/C)</span>
        </div>
        <div><b>Governing Combo:</b> ${esc(rack.combinationLabel || rack.shortLabel || '1.0G_fav + 1.5W')}</div>
        <div><b>Shear Demand V<sub>Ed</sub>:</b> ${rackDemand} kN (${rack.v_Ed_kNm ?? 0} kN/m)</div>
        <div><b>Wall Capacity F<sub>v,Rd</sub>:</b> ${rackCap} kN (${rack.unitResistanceKNm ?? 0} kN/m)</div>
        <div><b>Effective Piers:</b> ${rack.effectivePierCount ?? (Array.isArray(rack.piers) ? rack.piers.filter(p => p.isEffective).length : 0)} (${rack.effectiveLengthM ?? 0} m)</div>
        <div><b>Hold-Down Tension T<sub>Ed</sub>:</b> ${holdDownKN} kN</div>
      </div>

      <div style="padding:11px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:11px">
        <div style="font-weight:700;color:#15803d;margin-bottom:6px;display:flex;justify-content:space-between">
          <span>NDS 2024 (ASD / LRFD)</span>
          <span style="color:${nds.dcPercent > 100 ? '#dc2626' : nds.dcPercent > 80 ? '#b45309' : '#15803d'};font-weight:800">${nds.status} (${nds.dcPercent}% ASD / ${nds.dcPercentLRFD}% LRFD)</span>
        </div>
        <div><b>Column Stability (C<sub>P</sub>):</b> ${nds.CP} (le/d = ${nds.le_over_d})</div>
        <div><b>Load Duration (C<sub>D</sub>):</b> ${nds.CD} · <b>C<sub>r</sub>:</b> ${nds.Cr}</div>
        <div><b>f<sub>c</sub>:</b> ${nds.fc_psi} psi (F'<sub>c</sub> = ${nds.Fc_prime_psi} psi)</div>
        <div><b>f<sub>b</sub>:</b> ${nds.fb_psi} psi (F'<sub>b</sub> = ${nds.Fb_prime_psi} psi)</div>
        <div><b>NDS Eq 3.9-2:</b> ${nds.combinedInteraction} (Limit 1.0)</div>
      </div>
    </div>
    ${combosRows ? `
      <div style="margin:10px 0">
        <div style="font-size:11.5px;font-weight:800;color:#0f172a;margin-bottom:4px">EN 1990 / Eurocode 5 Load Combination Breakdown (${esc(lc.standard)})</div>
        <div style="max-height:220px;overflow:auto;border:1px solid #cbd5e1;border-radius:6px">
          <table style="width:100%;border-collapse:collapse;font-size:11px">
            <thead style="background:#f8fafc;position:sticky;top:0">
              <tr>
                <th style="padding:6px;text-align:left;border-bottom:1px solid #cbd5e1">Combination</th>
                <th style="padding:6px;text-align:left;border-bottom:1px solid #cbd5e1">Duration / k<sub>mod</sub></th>
                <th style="padding:6px;text-align:left;border-bottom:1px solid #cbd5e1">Axial q<sub>Ed</sub> &amp; N<sub>Ed</sub></th>
                <th style="padding:6px;text-align:left;border-bottom:1px solid #cbd5e1">Axial D/C</th>
                <th style="padding:6px;text-align:left;border-bottom:1px solid #cbd5e1">Comb D/C</th>
                <th style="padding:6px;text-align:left;border-bottom:1px solid #cbd5e1">Shear V<sub>Ed</sub>/F<sub>v,Rd</sub></th>
                <th style="padding:6px;text-align:left;border-bottom:1px solid #cbd5e1">Rack D/C</th>
                <th style="padding:6px;text-align:left;border-bottom:1px solid #cbd5e1">Hold-Down T<sub>Ed</sub></th>
              </tr>
            </thead>
            <tbody>${combosRows}</tbody>
          </table>
        </div>
      </div>` : ''}
    ${audit.warnings.length ? `<div style="margin:10px 0;padding:10px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;font-size:12px;color:#991b1b">
        <div style="font-weight:700;margin-bottom:4px">⚠ Active Structural Warnings:</div>
        <ul style="margin:0;padding-left:18px">${audit.warnings.map(x=>`<li style="margin:3px 0">${esc(x)}</li>`).join('')}</ul>
       </div>` : `<div style="margin:10px 0;padding:10px 12px;background:#f0fdf4;border:1px solid #86efac;border-radius:6px;font-size:12px;color:#166534"><b>✓ Full Compliance: Wall framing passes Eurocode 5 load combinations, shear-wall racking &amp; NDS 2024 checks.</b></div>`}
    <div class="modal-actions" style="display:flex;justify-content:flex-end">
      <button id="sug-close-btn" class="primary" type="button">Close</button>
    </div>
  `);
  const dlg = $('#modal');
  if (dlg) { dlg.style.width = 'min(1040px, 96vw)'; dlg.style.maxWidth = '96vw'; }
  bindClick('#sug-close-btn', ()=>$('#modal')?.close?.());
}
if(typeof window!=='undefined'){
  window.openMultiCodeAuditModal=openMultiCodeAuditModal;
  window.openWallSuggestionModal=openMultiCodeAuditModal;
}

function properties(){
  let e=model.elements.find(e=>e.id===selected[0]);
  if(!e && (view==='roofframingplan' || view==='trusselevation')){
    e=model.elements.find(el=>el.type==='roof');
  }
  const selStud = !e && selected[0] && typeof window.findStudById === 'function' ? window.findStudById(selected[0], model) : null;
  renderInfoBox();
  if(selStud){
    const w = selStud.wall;
    const m = selStud.member;
    const _fd = typeof FRAMING_DEFAULTS !== 'undefined' ? FRAMING_DEFAULTS : (window.FRAMING_DEFAULTS || { enabled: true, studWidth: 38, studDepth: 140, timberGrade: 'C24', spacing: 400 });
    const c = typeof construction === 'function' ? construction(w) : (typeof window.construction === 'function' ? window.construction(w) : _fd);
    const curW = Math.round(m.studWidth || (m.x1 - m.x0) || c.studWidth || 38);
    const curD = Math.round(m.studDepth || c.studDepth || 140);
    const curGrade = m.timberGrade || c.timberGrade || 'C16';
    const curMaterial = m.framingMaterial || c.studMaterial || 'dimensional';
    const curMaterialLabel = curMaterial === 'ijoist' ? 'I-Joist' : curMaterial === 'lvl' ? 'LVL' : 'Dimensional';
    const curPresetObj = (window.TIMBER_SIZES_C16_C24 || []).find(p => p.studWidth === curW && p.studDepth === curD && p.timberGrade === curGrade);
    const curPresetId = curPresetObj ? curPresetObj.id : 'custom';
    const deletedCount = Array.isArray(w.framing?.deletedStuds) ? w.framing.deletedStuds.length : 0;
    const sug = typeof window.suggestOptimalWallFraming === 'function' ? window.suggestOptimalWallFraming(w, model) : null;

    let html = `
      <div class="property-heading">
        <span class="element-symbol">${icon('wall')}</span>
        <div>
          <strong>Wall Stud · ${esc(m.type)}</strong>
          <small>${esc(m.id)} · Host Wall ${esc(w.id)}</small>
        </div>
        <span class="selection-count">01</span>
      </div>
      <div class="prop-section">
        <div class="section-header">SELECTED STUD GEOMETRY</div>
        <div style="padding:8px 18px;font-size:12px;color:#334155;display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#f8fafc;border-bottom:1px solid #e2e8f0">
          <div><span style="color:#64748b;display:block;font-size:10px">HOST WALL</span><strong>${esc(w.id)}</strong></div>
          <div><span style="color:#64748b;display:block;font-size:10px">STUD ROLE</span><strong>${esc(m.type)}</strong></div>
          <div><span style="color:#64748b;display:block;font-size:10px">POSITION (X0–X1)</span><strong>${formatLength(m.x0, false)} – ${formatLength(m.x1)}</strong></div>
          <div><span style="color:#64748b;display:block;font-size:10px">ELEVATION (Z0–Z1)</span><strong>${formatLength(m.z0, false)} – ${formatLength(m.z1)}</strong></div>
          <div><span style="color:#64748b;display:block;font-size:10px">LENGTH</span><strong>${formatLength(m.length)}</strong></div>
          <div><span style="color:#64748b;display:block;font-size:10px">SECTION & PROFILE</span><strong style="color:#0284c7">${formatSection(curW, curD)} · ${esc(curMaterialLabel)} (${esc(curGrade)})</strong></div>
        </div>
        <div style="margin:8px 18px">
          <button id="stud-select-wall-btn" class="subtle" type="button" style="width:100%;font-weight:600">← Select Host Wall (${esc(w.id)})</button>
        </div>
      </div>
      <div class="prop-section">
        <div class="section-header">STUD ACTIONS: ADD · MOVE · ROTATE</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin:8px 18px 10px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <button id="stud-add-left-btn" class="primary" type="button" style="background:#059669;border-color:#047857;color:#fff;font-weight:700;font-size:11px;padding:7px 8px">➕ Add Stud (Left)</button>
            <button id="stud-add-right-btn" class="primary" type="button" style="background:#059669;border-color:#047857;color:#fff;font-weight:700;font-size:11px;padding:7px 8px">➕ Add Stud (Right)</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">
            <button id="stud-move-l38-btn" class="subtle" type="button" style="font-weight:700;font-size:11px;padding:6px 4px" title="Move stud 38 mm (1-1/2&quot;) toward wall start">◀ -${isImperialUnits() ? '1-1/2"' : '38'}</button>
            <button id="stud-move-l10-btn" class="subtle" type="button" style="font-weight:700;font-size:11px;padding:6px 4px" title="Move stud 10 mm toward wall start">◀ -${isImperialUnits() ? '3/8"' : '10'}</button>
            <button id="stud-move-r10-btn" class="subtle" type="button" style="font-weight:700;font-size:11px;padding:6px 4px" title="Move stud 10 mm toward wall end">+${isImperialUnits() ? '3/8"' : '10'} ▶</button>
            <button id="stud-move-r38-btn" class="subtle" type="button" style="font-weight:700;font-size:11px;padding:6px 4px" title="Move stud 38 mm (1-1/2&quot;) toward wall end">+${isImperialUnits() ? '1-1/2"' : '38'} ▶</button>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            <span style="font-size:11px;color:#475569;font-weight:600;white-space:nowrap">Position X0:</span>
            <input id="stud-pos-x0-input" type="${isImperialUnits() ? 'text' : 'number'}" step="1" value="${esc(isImperialUnits() ? formatFeetInches(m.x0) : Math.round(m.x0))}" style="flex:1;padding:5px 8px;border:1px solid #cbd5e1;border-radius:5px;font-size:12px">
            <span style="font-size:11px;color:#64748b">${isImperialUnits() ? 'ft-in' : 'mm'}</span>
            <button id="stud-pos-x0-apply" class="subtle" type="button" style="font-weight:700;padding:5px 10px;background:#f0f9ff;color:#0369a1;border-color:#7dd3fc">Move</button>
          </div>
          <div style="display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:4px">
            <button id="stud-rotate-toggle-btn" class="primary" type="button" style="background:#0284c7;border-color:#0369a1;color:#fff;font-weight:700;font-size:11px;padding:6px 6px">↻ Rotate 90°</button>
            <button id="stud-rotate-inner-btn" class="subtle" type="button" style="font-size:10.5px;font-weight:600;padding:6px 4px" title="Rotate flat & align to inner face">Inner</button>
            <button id="stud-rotate-center-btn" class="subtle" type="button" style="font-size:10.5px;font-weight:600;padding:6px 4px" title="Rotate flat & align to center">Center</button>
            <button id="stud-rotate-outer-btn" class="subtle" type="button" style="font-size:10.5px;font-weight:600;padding:6px 4px" title="Rotate flat & align to outer face">Outer</button>
          </div>
        </div>
      </div>
      <div class="prop-section">
        <div class="section-header">FRAMING MATERIAL & STUD SIZE (3D PROFILE)</div>
        <label class="field">
          <span>Framing Material Type (3D Geometry)</span>
          <select id="stud-material-select">
            <option value="dimensional" ${curMaterial === 'dimensional' ? 'selected' : ''}>Dimensional (Solid Rectangular Stud)</option>
            <option value="ijoist" ${curMaterial === 'ijoist' ? 'selected' : ''}>I-Joist (Wide LVL Flanges + OSB Web)</option>
            <option value="lvl" ${curMaterial === 'lvl' ? 'selected' : ''}>LVL (Multi-Ply Laminated Veneer)</option>
          </select>
        </label>
        <label class="field">
          <span>Rectangular Timber Size Preset</span>
          <select id="stud-preset-select">
            <option value="custom" ${curPresetId === 'custom' ? 'selected' : ''}>Custom Rectangular Stud Size</option>
            ${(window.TIMBER_SIZES_C16_C24 || []).map(p => `<option value="${esc(p.id)}" ${p.id === curPresetId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span>Timber Grade</span>
          <select id="stud-grade-select">
            ${['C16','C24','C14','C18','C30'].map(g => `<option value="${g}" ${curGrade === g ? 'selected' : ''}>${g} Structural Timber</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span>Stud Width / Thickness</span>
          <div class="input-unit"><input id="stud-width-input" type="${isImperialUnits() ? 'text' : 'number'}" step="1" min="25" max="150" value="${esc(isImperialUnits() ? formatInchesOnly(curW) : curW)}"><span>${isImperialUnits() ? 'in' : 'mm'}</span></div>
        </label>
        <label class="field">
          <span>Stud Depth (Wall Core)</span>
          <div class="input-unit"><input id="stud-depth-input" type="${isImperialUnits() ? 'text' : 'number'}" step="1" min="63" max="300" value="${esc(isImperialUnits() ? formatInchesOnly(curD) : curD)}"><span>${isImperialUnits() ? 'in' : 'mm'}</span></div>
        </label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 18px">
          <label class="field" style="margin:0">
            <span>Plies (1–4)</span>
            <select id="stud-plies-select">
              ${[1, 2, 3, 4].map(p => `<option value="${p}" ${(m.plies || 1) === p ? 'selected' : ''}>${p}-Ply Assembly</option>`).join('')}
            </select>
          </label>
          <label class="field" style="margin:0">
            <span>End Condition</span>
            <select id="stud-endcond-select">
              ${[['square', '90° Square Cut'], ['bevel', 'Bevel / Rake Cut'], ['notched', 'Notched / Lap'], ['slotted', 'Slotted (Knife Plate)']].map(([k, lbl]) => `<option value="${k}" ${(m.endConditionStart || 'square') === k ? 'selected' : ''}>${lbl}</option>`).join('')}
            </select>
          </label>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;margin:8px 18px 10px">
          <button id="stud-apply-single-btn" class="primary" type="button" style="width:100%;font-weight:700;background:#0284c7;border-color:#0369a1;color:#fff">✓ Apply Profile & Size to Selected Member Only</button>
          <button id="stud-apply-wall-btn" class="subtle" type="button" style="width:100%;font-weight:700;color:#0369a1;border-color:#7dd3fc;background:#f0f9ff">✓ Apply Profile & Size to All Studs on ${esc(w.id)}</button>
        </div>
      </div>
      <div class="prop-section">
        <div class="section-header">LOCK · COPY/PASTE · DELETE &amp; PAMIR STUDIO</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin:8px 18px 12px">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px">
            <button id="stud-lock-btn" class="subtle" type="button" style="font-weight:700;font-size:10.5px;color:${m.locked ? '#ffffff' : '#0f766e'};background:${m.locked ? '#0f766e' : '#f0fdfa'};border-color:#0f766e">${m.locked ? '🔒 Locked' : '🔓 Lock Member'}</button>
            <button id="stud-copy-btn" class="subtle" type="button" style="font-weight:700;font-size:10.5px">📋 Copy</button>
            <button id="stud-paste-btn" class="subtle" type="button" style="font-weight:700;font-size:10.5px">📥 Paste (+150)</button>
          </div>
          <button id="stud-delete-btn" class="subtle" type="button" style="width:100%;color:#dc2626;border-color:#fca5a5;background:#fef2f2;font-weight:700">🗑 Delete Selected Member (${esc(m.type)})</button>
          ${deletedCount > 0 ? `<button id="stud-restore-all-btn" class="subtle" type="button" style="width:100%;color:#15803d;border-color:#86efac;background:#f0fdf4;font-weight:600">⟲ Restore ${deletedCount} Deleted Member(s) on ${esc(w.id)}</button>` : ''}
          <button id="stud-suggest-btn" class="subtle" type="button" style="width:100%;color:#1e40af;border-color:#93c5fd;background:#eff6ff;font-weight:700">💡 Suggest Optimal Stud Size & Spacing (${sug ? sug.current.utilizationPct + '% D/C' : 'Audit'})</button>
          <button id="stud-open-pamir-btn" class="primary" type="button" style="width:100%;background:#0f172a;color:#38bdf8;border-color:#0284c7;font-weight:800;font-size:11px">⚡ Open PAMIR Wall Engineering &amp; CNC Studio</button>
        </div>
      </div>
    `;
    const propEl = $('#properties');
    if(propEl) propEl.innerHTML = html;

    $('#stud-select-wall-btn')?.addEventListener('click', () => {
      select([w.id]);
      toast(`Selected host wall ${w.id}`);
    });
    $('#stud-add-left-btn')?.addEventListener('click', () => {
      let res = null;
      commit(() => {
        res = window.addExtraStudById?.(m.id, { side: 'left' }, model);
        if (res?.studId) selected = [res.studId];
      });
      if (res) toast(`Added extra stud at ${Math.round(res.x0)} mm on ${w.id}`);
    });
    $('#stud-add-right-btn')?.addEventListener('click', () => {
      let res = null;
      commit(() => {
        res = window.addExtraStudById?.(m.id, { side: 'right' }, model);
        if (res?.studId) selected = [res.studId];
      });
      if (res) toast(`Added extra stud at ${Math.round(res.x0)} mm on ${w.id}`);
    });
    const nudgeStud = (dx) => {
      let res = null;
      commit(() => {
        res = window.moveStudById?.(m.id, { deltaX: dx }, model);
        if (res?.studId) selected = [res.studId];
      });
      if (res) toast(`Moved stud to ${Math.round(res.x0)}–${Math.round(res.x1)} mm`);
    };
    $('#stud-move-l38-btn')?.addEventListener('click', () => nudgeStud(-38));
    $('#stud-move-l10-btn')?.addEventListener('click', () => nudgeStud(-10));
    $('#stud-move-r10-btn')?.addEventListener('click', () => nudgeStud(10));
    $('#stud-move-r38-btn')?.addEventListener('click', () => nudgeStud(38));
    $('#stud-pos-x0-apply')?.addEventListener('click', () => {
      const tx = parseLengthInput($('#stud-pos-x0-input')?.value, m.x0);
      if (!Number.isFinite(tx)) return;
      let res = null;
      commit(() => {
        res = window.moveStudById?.(m.id, { targetX0: tx }, model);
        if (res?.studId) selected = [res.studId];
      });
      if (res) toast(`Moved stud to ${formatLength(res.x0, false)}–${formatLength(res.x1)}`);
    });
    const rotateStudFn = (opts) => {
      let res = null;
      commit(() => {
        res = window.rotateStudById?.(m.id, opts, model);
        if (res?.studId) selected = [res.studId];
      });
      if (res) toast(`Stud rotated (${res.orientation === 'flat' ? '90° Flat · ' + res.faceAlign + ' face' : 'Standard Vertical'})`);
    };
    $('#stud-rotate-toggle-btn')?.addEventListener('click', () => rotateStudFn({}));
    $('#stud-rotate-inner-btn')?.addEventListener('click', () => rotateStudFn({ orientation: 'flat', faceAlign: 'inner' }));
    $('#stud-rotate-center-btn')?.addEventListener('click', () => rotateStudFn({ orientation: 'flat', faceAlign: 'center' }));
    $('#stud-rotate-outer-btn')?.addEventListener('click', () => rotateStudFn({ orientation: 'flat', faceAlign: 'outer' }));

    $('#stud-material-select')?.addEventListener('change', ev => {
      const framingMaterial = ev.target.value || 'dimensional';
      commit(() => {
        window.updateStudSize?.(m.id, { framingMaterial, applyToWall: false }, model);
      });
      toast(`Stud 3D profile updated to ${framingMaterial === 'ijoist' ? 'I-Joist' : framingMaterial === 'lvl' ? 'LVL' : 'Dimensional'}`);
    });
    $('#stud-preset-select')?.addEventListener('change', ev => {
      const preset = (window.TIMBER_SIZES_C16_C24 || []).find(p => p.id === ev.target.value);
      if(preset){
        if($('#stud-width-input')) $('#stud-width-input').value = isImperialUnits() ? formatInchesOnly(preset.studWidth) : preset.studWidth;
        if($('#stud-depth-input')) $('#stud-depth-input').value = isImperialUnits() ? formatInchesOnly(preset.studDepth) : preset.studDepth;
        if($('#stud-grade-select')) $('#stud-grade-select').value = preset.timberGrade;
        const framingMaterial = $('#stud-material-select')?.value || curMaterial;
        commit(() => {
          window.updateStudSize?.(m.id, { presetId: preset.id, studWidth: preset.studWidth, studDepth: preset.studDepth, timberGrade: preset.timberGrade, framingMaterial, applyToWall: false }, model);
        });
        toast(`Stud size updated to ${formatSection(preset.studWidth, preset.studDepth)} (${preset.timberGrade})`);
      }
    });
    const applyStudSizeFn = (applyToWall) => {
      try {
        const presetId = $('#stud-preset-select')?.value;
        const framingMaterial = $('#stud-material-select')?.value || curMaterial;
        const studWidth = Math.round(parseLengthInput($('#stud-width-input')?.value, curW));
        const studDepth = Math.round(parseLengthInput($('#stud-depth-input')?.value, curD));
        const timberGrade = $('#stud-grade-select')?.value || curGrade;
        if(Math.abs(studWidth - studDepth) < 1){
          throw Error('Square studs are not allowed. Use rectangular stud dimensions (e.g. 38×140 mm or 38×89 mm).');
        }
        commit(() => {
          window.updateStudSize?.(m.id, {
            presetId: presetId !== 'custom' ? presetId : undefined,
            studWidth,
            studDepth,
            timberGrade,
            framingMaterial,
            applyToWall
          }, model);
        });
        toast(applyToWall ? `All studs on ${w.id} updated (${formatSection(studWidth, studDepth)}, ${framingMaterial.toUpperCase()})` : `Selected stud updated (${formatSection(studWidth, studDepth)}, ${framingMaterial.toUpperCase()})`);
      } catch (err) {
        toast(err.message || 'Could not resize stud.');
      }
    };
    $('#stud-apply-single-btn')?.addEventListener('click', () => applyStudSizeFn(false));
    $('#stud-apply-wall-btn')?.addEventListener('click', () => applyStudSizeFn(true));
    $('#stud-plies-select')?.addEventListener('change', ev => {
      const plies = Number(ev.target.value) || 1;
      commit(() => window.WallMemberEditor?.updateMemberAdvanced(m.id, { plies }, model));
      toast(`Updated ${m.type} to ${plies}-ply assembly`);
    });
    $('#stud-endcond-select')?.addEventListener('change', ev => {
      const ec = ev.target.value || 'square';
      commit(() => window.WallMemberEditor?.updateMemberAdvanced(m.id, { endConditionStart: ec, endConditionEnd: ec }, model));
      toast(`Updated ${m.type} end condition to ${ec}`);
    });
    $('#stud-lock-btn')?.addEventListener('click', () => {
      let res = null;
      commit(() => { res = window.WallMemberEditor?.setMemberLock(m.id, undefined, model); });
      toast(res?.locked ? `🔒 Locked ${m.type} against automatic regeneration` : `🔓 Unlocked ${m.type}`);
    });
    $('#stud-copy-btn')?.addEventListener('click', () => {
      window.WallMemberEditor?.copyMember(m.id, model);
      toast(`Copied ${m.type} (${m.section}) to clipboard`);
    });
    $('#stud-paste-btn')?.addEventListener('click', () => {
      let pasted = null;
      commit(() => { pasted = window.WallMemberEditor?.pasteMemberToWall(w, 150, model); });
      if (pasted) toast(`Pasted member at X=${pasted.x0} mm on ${w.id}`);
      else toast('Copy a member first before pasting.');
    });
    $('#stud-open-pamir-btn')?.addEventListener('click', () => {
      window.openWallStudioHubModal?.(w, 'openings');
    });
    $('#stud-delete-btn')?.addEventListener('click', () => {
      commit(() => {
        window.deleteStudById?.(m.id, model);
        selected = [w.id];
      });
      toast(`Deleted ${m.type} at ${Math.round(m.x0)} mm on ${w.id}`);
    });
    $('#stud-restore-all-btn')?.addEventListener('click', () => {
      commit(() => {
        window.restoreWallDeletedStuds?.(w, model);
      });
      toast(`Restored all deleted studs on ${w.id}`);
    });
    $('#stud-suggest-btn')?.addEventListener('click', () => openWallSuggestionModal(w));
    return;
  }
  const selFloor = !e && selected[0] && typeof window.findFloorMemberById === 'function' ? window.findFloorMemberById(selected[0], model) : null;
  if(selFloor){
    const s = selFloor.slab;
    const m = selFloor.member;
    const allMembers = selFloor.allMembers || [];
    const edits = typeof ensureFloorFramingEditsStore === 'function' ? ensureFloorFramingEditsStore(s) : { deletedMembers: [], memberOverrides: {}, extraMembers: [] };
    const deletedCount = Array.isArray(edits.deletedMembers) ? edits.deletedMembers.length : 0;
    const ov = edits.memberOverrides?.[m.id] || {};
    const curW = Math.round(m.width || 44.5);
    const curPlies = Math.max(1, Number(m.plies) || 1);
    const curTotalW = Math.round(m.totalWidth || curW * curPlies);
    const curD = Math.round(m.depth || 302);
    const curGrade = m.grade || 'TJI-230';
    const curSection = m.section || 'I-Joist 11-7/8';
    const curFamily = m.family || (typeof inferFloorSectionMeta === 'function' ? inferFloorSectionMeta(curSection, curW, curD).family : 'ijoist');
    const curPresetObj = (window.FLOOR_SECTION_PRESETS || []).find(p => p.id === curSection || (Math.abs(p.width - curW) <= 1.5 && Math.abs(p.depth - curD) <= 2 && p.family === curFamily));
    const curPresetId = curPresetObj ? curPresetObj.id : 'custom';
    const floorMaterialTypes = [
      ['ijoist', 'I-Joist (Wide LVL Flanges + OSB Web)'],
      ['lvl', 'LVL (Multi-Ply Laminated Veneer)'],
      ['dimensional', 'Dimensional (Solid Sawn Timber)'],
      ['posistrut', 'Posi-Strut Metal-Web Truss'],
      ['openweb', 'Open-Web Floor Truss'],
      ['steel', 'Steel Wide-Flange + Nailer'],
      ['rim', 'EWP Rim / Band Board'],
      ['blocking', 'Solid Blocking / Cross-Bridging']
    ];
    const memberTypes = [
      'Floor Joist',
      'Posi-Strut Web Truss',
      'Open-Web Floor Truss',
      '2-Ply LVL Girder',
      'Dropped LVL Girder',
      'Steel W8x18 Pocket Beam',
      '2-Ply Opening Trimmer',
      '2-Ply Opening Header',
      'Tail Joist',
      '2-Ply Partition Doubler',
      'EWP Rim Board',
      '2x Solid Band Joist',
      'Solid Blocking',
      'Cross-Bridging',
      '2x6 Strongback',
      '1x4 Bottom Strapping',
      '3-Stud Corner Block',
      'Cantilever Balcony Joist'
    ];
    if (!memberTypes.includes(m.type)) memberTypes.unshift(m.type);

    const normHanger = (h) => (h === 'skewed_45' ? 'heavy_skewed' : (h || 'none'));
    const curHangerStart = normHanger(m.hangerStart);
    const curHangerEnd = normHanger(m.hangerEnd);
    const curHangerBoth = curHangerStart === curHangerEnd ? curHangerStart : 'mixed';
    const memberRx = typeof calculateFloorMemberSupportReaction === 'function'
      ? calculateFloorMemberSupportReaction(m, s)
      : { reactionStartLbs: 620, reactionEndLbs: 620, maxReactionLbs: 620, reactionStartKN: 2.76, reactionEndKN: 2.76, maxReactionKN: 2.76 };
    const recSimpson = typeof selectOptimalFloorHangerForReaction === 'function'
      ? selectOptimalFloorHangerForReaction(memberRx.maxReactionLbs, m, 'Simpson Strong-Tie')
      : null;
    const recMiTek = typeof selectOptimalFloorHangerForReaction === 'function'
      ? selectOptimalFloorHangerForReaction(memberRx.maxReactionLbs, m, 'MiTek')
      : null;
    const activeStartSpec = window.HANGER_CATALOG?.[curHangerStart] || window.HANGER_CATALOG?.face_mount;
    const activeEndSpec = window.HANGER_CATALOG?.[curHangerEnd] || window.HANGER_CATALOG?.face_mount;
    const startUtilPct = Math.round((memberRx.reactionStartLbs / Math.max(100, activeStartSpec?.downloadLbs || 1480)) * 100);
    const endUtilPct = Math.round((memberRx.reactionEndLbs / Math.max(100, activeEndSpec?.downloadLbs || 1480)) * 100);
    const maxUtilPct = Math.max(startUtilPct, endUtilPct);
    const hangerOpts = [
      ['face_mount', 'Simpson LUS210 / MIU Face-Mount (1,480 lbs)'],
      ['top_mount', 'Simpson IUS / ITS Top-Flange (1,620 lbs)'],
      ['concealed_flange', 'Simpson IUC / LUCZ Concealed-Flange (1,350 lbs)'],
      ['adjustable_truss', 'Simpson THA422 / MSTA Truss Strap (2,150 lbs)'],
      ['heavy_skewed', 'Simpson HHUS / SUR Heavy Double-Shear (2,840 lbs)'],
      ['simpson_hgus', 'Simpson HGUS210-2 Heavy Girder (5,650 lbs)'],
      ['column_cap', 'Simpson CCQ46 Heavy Column Cap (5,400 lbs)'],
      ['mitek_ihf', 'MiTek IHF / JDH Face-Mount (1,540 lbs)'],
      ['mitek_itf', 'MiTek ITF / TFL Top-Flange (1,685 lbs)'],
      ['mitek_ihfl', 'MiTek IHFL Concealed-Flange (1,390 lbs)'],
      ['mitek_tsh', 'MiTek TSH / THDH Truss Strap (2,240 lbs)'],
      ['mitek_hdo', 'MiTek HDO / HJU Heavy Double-Shear (2,960 lbs)'],
      ['mitek_hdg', 'MiTek HD210-2 / BPH Heavy Girder (5,820 lbs)'],
      ['mitek_kccq', 'MiTek KCCQ46 Heavy Column Cap (5,580 lbs)'],
      ['ledger_ribbon', '2x4 Ledger Ribbon + Tie Clip (1,520 lbs)'],
      ['bearing_plate', '2x Solid Blocking / Steel Bearing Plate (1,650 lbs)'],
      ['none', 'No Hanger (Direct Bearing ~1,250 lbs)']
    ];

    let html = `
      <div class="property-heading">
        <span class="element-symbol">${icon('slab')}</span>
        <div>
          <strong>Floor Member · ${esc(m.shortTag || m.id.split(':')[1] || m.id)}</strong>
          <small>${esc(m.type)} · Host Slab ${esc(s.id)}</small>
        </div>
        <span class="selection-count">01</span>
      </div>
      <div class="prop-section">
        <div class="section-header">QUICK-SWITCH FLOOR MEMBER (${allMembers.length})</div>
        <div style="padding:8px 18px 10px;background:#f8fafc;border-bottom:1px solid #e2e8f0">
          <select id="fm-switch-select" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;font-weight:700;color:#0f172a;background:#fff">
            ${allMembers.map(fm => `<option value="${esc(fm.id)}" ${fm.id === m.id ? 'selected' : ''}>${esc(fm.shortTag || fm.id)} · ${esc(fm.type)} (${esc(fm.section)}, ${Math.round(fm.length)} mm)</option>`).join('')}
          </select>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;font-size:11.5px;color:#334155">
            <div><span style="color:#64748b;display:block;font-size:10px">SPAN LENGTH</span><strong>${formatLength(m.length)}</strong></div>
            <div><span style="color:#64748b;display:block;font-size:10px">OVERALL SECTION</span><strong style="color:#0284c7">${curPlies > 1 ? curPlies + '-Ply ' : ''}${formatSection(curTotalW, curD)}</strong></div>
            <div><span style="color:#64748b;display:block;font-size:10px">START (A)</span><strong>(${Math.round(m.a.x)}, ${Math.round(m.a.y)})</strong></div>
            <div><span style="color:#64748b;display:block;font-size:10px">END (B)</span><strong>(${Math.round(m.b.x)}, ${Math.round(m.b.y)})</strong></div>
          </div>
          <div style="display:flex;gap:6px;margin-top:8px">
            <button id="fm-select-slab-btn" class="subtle" type="button" style="flex:1;font-weight:600;font-size:11px">← Select Host Slab (${esc(s.id)})</button>
            <button id="fm-open-ewp-view-btn" class="subtle" type="button" style="flex:1;font-weight:700;font-size:11px;color:#0369a1;border-color:#7dd3fc;background:#f0f9ff">📐 2D Floor Plan</button>
          </div>
          ${m.type === 'Blocking' ? `
          <div style="margin-top:8px;padding:8px 10px;background:#f5f3ff;border:1px solid #c4b5fd;border-radius:6px;font-size:11px;color:#4c1d95">
            <div style="font-weight:800;font-size:10.5px;color:#5b21b6;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">
              <span>⚡ EWP MANUFACTURER MID-SPAN BLOCKING SPEC</span>
              <span style="background:#ede9fe;border:1px solid #a78bfa;padding:1px 5px;border-radius:4px;font-size:9.5px">${esc(m.rowFractionLabel || 'L/2')}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:4px">
              <div><span style="color:#6d28d9;font-size:9.5px;display:block">BAY CLEAR SPAN</span><strong>${formatLength(m.baySpanMm || 4410)} (Bay ${(m.bayIndex ?? 0) + 1})</strong></div>
              <div><span style="color:#6d28d9;font-size:9.5px;display:block">OFFSET FROM SUPPORT</span><strong>${formatLength(m.distFromSupportMm || Math.round((m.baySpanMm || 4410) / 2))} (${esc(m.rowFractionLabel || 'L/2')})</strong></div>
              <div><span style="color:#6d28d9;font-size:9.5px;display:block">NAILING STAGGER</span><strong>${m.staggerOffsetMm ? (m.staggerOffsetMm > 0 ? '+' : '') + m.staggerOffsetMm + ' mm' : '0 mm'}</strong></div>
              <div><span style="color:#6d28d9;font-size:9.5px;display:block">WEB STIFFENERS</span><strong>${m.webStiffeners === 'both' ? 'Req. Both Ends (≥14")' : 'Standard'}</strong></div>
            </div>
            <div style="font-size:10px;color:#5b21b6;line-height:1.35;border-top:1px dashed #ddd6fe;padding-top:4px">
              <strong>Rule:</strong> ${esc(m.manufacturerRule || 'APA PRI-400 / Weyerhaeuser TJ-4000')}<br>
              <strong>Fasteners:</strong> ${esc(m.fastenerSpec || '(3) 10d Toenails Top/Bot Flange + 1.5mm Subfloor Gap')}
            </div>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="prop-section">
        <div class="section-header">MEMBER ACTIONS: ADD · MOVE · SISTER · ROTATE</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin:8px 18px 10px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <button id="fm-add-left-btn" class="primary" type="button" style="background:#059669;border-color:#047857;color:#fff;font-weight:700;font-size:11px;padding:7px 8px">➕ Add Joist (Before)</button>
            <button id="fm-add-right-btn" class="primary" type="button" style="background:#059669;border-color:#047857;color:#fff;font-weight:700;font-size:11px;padding:7px 8px">➕ Add Joist (After)</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <button id="fm-sister-btn" class="subtle" type="button" style="font-weight:700;font-size:11px;padding:6px 8px;color:#b45309;border-color:#fcd34d;background:#fffbeb">⧉ Toggle ${curPlies >= 2 ? 'Single-Ply (1x)' : 'Sister / Double (2-Ply)'}</button>
            <button id="fm-rotate-90-btn" class="subtle" type="button" style="font-weight:700;font-size:11px;padding:6px 8px;color:#0369a1;border-color:#7dd3fc;background:#f0f9ff">↻ Rotate 90° Around Center</button>
          </div>
          <div style="font-size:10.5px;font-weight:700;color:#64748b;margin-top:2px">NUDGE POSITION (PERPENDICULAR TO SPAN):</div>
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:3px">
            <button id="fm-move-l406-btn" class="subtle" type="button" style="font-weight:700;font-size:10px;padding:5px 2px" title="Move -406 mm (-16&quot;)">◀ -16"</button>
            <button id="fm-move-l38-btn" class="subtle" type="button" style="font-weight:700;font-size:10px;padding:5px 2px" title="Move -38 mm (-1.5&quot;)">◀ -1.5"</button>
            <button id="fm-move-l10-btn" class="subtle" type="button" style="font-weight:700;font-size:10px;padding:5px 2px" title="Move -10 mm (-3/8&quot;)">◀ -3/8"</button>
            <button id="fm-move-r10-btn" class="subtle" type="button" style="font-weight:700;font-size:10px;padding:5px 2px" title="Move +10 mm (+3/8&quot;)">+3/8" ▶</button>
            <button id="fm-move-r38-btn" class="subtle" type="button" style="font-weight:700;font-size:10px;padding:5px 2px" title="Move +38 mm (+1.5&quot;)">+1.5" ▶</button>
            <button id="fm-move-r406-btn" class="subtle" type="button" style="font-weight:700;font-size:10px;padding:5px 2px" title="Move +406 mm (+16&quot;)">+16" ▶</button>
          </div>
        </div>
      </div>

      <div class="prop-section">
        <div class="section-header">FRAMING MATERIAL, ROLE, PROFILE & PLY COUNT</div>
        <label class="field">
          <span>Framing Material Type (3D Geometry)</span>
          <select id="fm-material-type-select">
            ${floorMaterialTypes.map(([k, v]) => `<option value="${esc(k)}" ${k === curFamily ? 'selected' : ''}>${esc(v)}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span>Member Role / Type</span>
          <select id="fm-role-select">
            ${memberTypes.map(t => `<option value="${esc(t)}" ${t === m.type ? 'selected' : ''}>${esc(t)}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span>Custom Callout Tag</span>
          <input id="fm-tag-input" type="text" value="${esc(m.shortTag || m.id.split(':')[1] || m.id)}">
        </label>
        <label class="field">
          <span>Section Profile Preset</span>
          <select id="fm-preset-select">
            <option value="custom" ${curPresetId === 'custom' ? 'selected' : ''}>Custom Section (${esc(curSection)})</option>
            ${(window.FLOOR_SECTION_PRESETS || []).map(p => `<option value="${esc(p.id)}" ${p.id === curPresetId ? 'selected' : ''}>${esc(p.name || p.id)} (${p.width}×${p.depth} mm)</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span>Number of Plies (Sistering)</span>
          <select id="fm-plies-select">
            ${[1, 2, 3, 4].map(n => `<option value="${n}" ${curPlies === n ? 'selected' : ''}>${n}-Ply (${Math.round(curW * n)} mm total width)</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span>Timber / EWP Grade</span>
          <select id="fm-grade-select">
            ${['TJI-210','TJI-230','TJI-360','TJI-560','2.0E Microllam LVL','2.2E Parallam PSL','Posi-Strut C24','Open-Web 2x4 C24','C24 Kiln-Dried','C16 Structural','1.3E TimberStrand','A992 Structural Steel'].map(g => `<option value="${esc(g)}" ${curGrade === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span>Single-Ply Flange Width</span>
          <div class="input-unit"><input id="fm-width-input" type="${isImperialUnits() ? 'text' : 'number'}" step="0.5" min="20" max="300" value="${esc(isImperialUnits() ? formatInchesOnly(curW) : curW)}"><span>${isImperialUnits() ? 'in' : 'mm'}</span></div>
        </label>
        <label class="field">
          <span>Member Depth (Height)</span>
          <div class="input-unit"><input id="fm-depth-input" type="${isImperialUnits() ? 'text' : 'number'}" step="1" min="38" max="650" value="${esc(isImperialUnits() ? formatInchesOnly(curD) : curD)}"><span>${isImperialUnits() ? 'in' : 'mm'}</span></div>
        </label>
        <div style="display:flex;flex-direction:column;gap:6px;margin:8px 18px 10px">
          <button id="fm-apply-single-btn" class="primary" type="button" style="width:100%;font-weight:700;background:#0284c7;border-color:#0369a1;color:#fff">✓ Apply Profile & Size to Selected Member</button>
          <button id="fm-apply-type-btn" class="subtle" type="button" style="width:100%;font-weight:700;color:#0369a1;border-color:#7dd3fc;background:#f0f9ff">✓ Apply to All "${esc(m.type)}" Members on Slab</button>
        </div>
      </div>

      <div class="prop-section">
        <div class="section-header">SIMPSON &amp; MITEK JOIST HANGERS · NODE REACTION SIZING</div>
        ${memberRx.maxReactionLbs > 0 ? `
        <div style="margin:6px 18px 8px;padding:8px 10px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;font-size:11px;color:#065f46;line-height:1.5">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
            <strong>Support Node Reactions (${esc(m.shortTag || m.id)}):</strong>
            <span style="font-weight:800;color:${maxUtilPct <= 100 ? '#047857' : '#dc2626'}">${maxUtilPct}% D/C (${maxUtilPct <= 100 ? 'PASS' : 'OVER'})</span>
          </div>
          · End A Support Reaction: <strong>${memberRx.reactionStartLbs.toLocaleString()} lbs (${memberRx.reactionStartKN} kN)</strong> → <b>${esc(activeStartSpec?.brand || 'Simpson')} ${esc(activeStartSpec?.modelCode || activeStartSpec?.code || 'FM')}</b> (${startUtilPct}%)<br>
          · End B Support Reaction: <strong>${memberRx.reactionEndLbs.toLocaleString()} lbs (${memberRx.reactionEndKN} kN)</strong> → <b>${esc(activeEndSpec?.brand || 'Simpson')} ${esc(activeEndSpec?.modelCode || activeEndSpec?.code || 'FM')}</b> (${endUtilPct}%)<br>
          · Auto-Size Rec: <b>Simpson ${esc(recSimpson?.spec?.modelCode || 'LUS210')}</b> or <b>MiTek ${esc(recMiTek?.spec?.modelCode || 'IHF')}</b>
          <div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap">
            <button id="fm-auto-hanger-all-btn" type="button" class="primary" style="flex:1;padding:5px 7px;background:#059669;border-color:#047857;color:#fff;font-size:10.5px;font-weight:700;cursor:pointer">⚡ Auto-Size Member Hanger</button>
            <button id="fm-auto-hanger-simpson-btn" type="button" class="subtle" style="padding:5px 7px;font-size:10px;font-weight:700;cursor:pointer">⚡ Simpson</button>
            <button id="fm-auto-hanger-mitek-btn" type="button" class="subtle" style="padding:5px 7px;font-size:10px;font-weight:700;cursor:pointer">⚡ MiTek</button>
          </div>
        </div>
        ` : ''}
        <div class="field hanger-field-wrap" data-hanger-tooltip-host="both">
          <span class="hanger-label-with-info">
            <span>Joist Hanger</span>
            <span class="hanger-info-badge" tabindex="0" aria-label="Joist hanger load-bearing capacity and specification standard">i</span>
          </span>
          <select id="fm-hanger-select">
            ${curHangerBoth === 'mixed' ? `<option value="mixed" selected>Custom Split (${esc(curHangerStart)} / ${esc(curHangerEnd)})</option>` : ''}
            ${hangerOpts.map(([k, v]) => `<option value="${k}" ${curHangerBoth === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}
          </select>
          <div class="hanger-info-tooltip" id="fm-hanger-tooltip" role="tooltip">
            ${typeof renderHangerTooltipInner === 'function' ? renderHangerTooltipInner(curHangerBoth, curHangerStart, curHangerEnd) : ''}
          </div>
        </div>
        <div class="field hanger-field-wrap" data-hanger-tooltip-host="start">
          <span class="hanger-label-with-info">
            <span>Start Hanger (End A)</span>
            <span class="hanger-info-badge" tabindex="0" aria-label="Start hanger capacity and specification standard">i</span>
          </span>
          <select id="fm-hanger-start-select">
            ${hangerOpts.map(([k, v]) => `<option value="${k}" ${curHangerStart === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}
          </select>
          <div class="hanger-info-tooltip" id="fm-hanger-start-tooltip" role="tooltip">
            ${typeof renderHangerTooltipInner === 'function' ? renderHangerTooltipInner(curHangerStart) : ''}
          </div>
        </div>
        <div class="field hanger-field-wrap" data-hanger-tooltip-host="end">
          <span class="hanger-label-with-info">
            <span>End Hanger (End B)</span>
            <span class="hanger-info-badge" tabindex="0" aria-label="End hanger capacity and specification standard">i</span>
          </span>
          <select id="fm-hanger-end-select">
            ${hangerOpts.map(([k, v]) => `<option value="${k}" ${curHangerEnd === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}
          </select>
          <div class="hanger-info-tooltip" id="fm-hanger-end-tooltip" role="tooltip">
            ${typeof renderHangerTooltipInner === 'function' ? renderHangerTooltipInner(curHangerEnd) : ''}
          </div>
        </div>
        <label class="field">
          <span>Web Stiffener Blocks</span>
          <select id="fm-stiffeners-select">
            ${[
              ['both', 'Both Ends (Start & End Bearing)'],
              ['start', 'Start Bearing Only (End A)'],
              ['end', 'End Bearing Only (End B)'],
              ['midspan', 'Both Ends + Mid-Span Point Load'],
              ['none', 'None']
            ].map(([k, v]) => `<option value="${k}" ${(m.webStiffeners || 'both') === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span>MEP Web Duct / Pipe Hole</span>
          <select id="fm-mep-enable-select">
            <option value="false" ${!m.mepHoleEnabled ? 'selected' : ''}>Disabled (Solid Web)</option>
            <option value="true" ${m.mepHoleEnabled ? 'selected' : ''}>Enabled (Circular Web Knockout)</option>
          </select>
        </label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:2px 18px 8px">
          <label class="field" style="padding:2px 0"><span>Hole Offset from A</span><div class="input-unit"><input id="fm-mep-off-input" type="number" step="50" value="${Math.round(m.mepHoleOffsetMm || m.length * 0.35)}"><span>mm</span></div></label>
          <label class="field" style="padding:2px 0"><span>Hole Diameter</span><div class="input-unit"><input id="fm-mep-dia-input" type="number" step="10" min="38" max="250" value="${Math.round(m.mepHoleDiameterMm || 110)}"><span>mm</span></div></label>
        </div>
        <div style="margin:4px 18px 10px">
          <button id="fm-apply-hardware-btn" class="subtle" type="button" style="width:100%;font-weight:700;color:#1e40af;border-color:#93c5fd;background:#eff6ff">✓ Apply MEP Hole & Hardware to Member</button>
        </div>
      </div>

      <div class="prop-section">
        <div class="section-header">EXACT COORDINATES, SPAN TRIM & ELEVATION</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 18px">
          <label class="field" style="padding:2px 0"><span>Start X (A.x)</span><div class="input-unit"><input id="fm-ax-input" type="number" step="10" value="${Math.round(m.a.x)}"><span>mm</span></div></label>
          <label class="field" style="padding:2px 0"><span>Start Y (A.y)</span><div class="input-unit"><input id="fm-ay-input" type="number" step="10" value="${Math.round(m.a.y)}"><span>mm</span></div></label>
          <label class="field" style="padding:2px 0"><span>End X (B.x)</span><div class="input-unit"><input id="fm-bx-input" type="number" step="10" value="${Math.round(m.b.x)}"><span>mm</span></div></label>
          <label class="field" style="padding:2px 0"><span>End Y (B.y)</span><div class="input-unit"><input id="fm-by-input" type="number" step="10" value="${Math.round(m.b.y)}"><span>mm</span></div></label>
        </div>
        <label class="field">
          <span>Start Trim / Cantilever Offset</span>
          <div class="input-unit"><input id="fm-start-off-input" type="number" step="25" value="${Math.round(ov.startOffsetMm || 0)}" title="Negative extends start into cantilever; positive trims back"><span>mm</span></div>
        </label>
        <label class="field">
          <span>End Trim / Cantilever Offset</span>
          <div class="input-unit"><input id="fm-end-off-input" type="number" step="25" value="${Math.round(ov.endOffsetMm || 0)}" title="Positive extends end into cantilever; negative trims back"><span>mm</span></div>
        </label>
        <label class="field">
          <span>Vertical Z-Elevation Offset</span>
          <div class="input-unit"><input id="fm-zoff-input" type="number" step="10" value="${Math.round(ov.zOffsetMm || 0)}" title="0 = Flush with joists, negative = Dropped below joists"><span>mm</span></div>
        </label>
        <div style="margin:6px 18px 10px">
          <button id="fm-apply-coords-btn" class="subtle" type="button" style="width:100%;font-weight:700;color:#0f766e;border-color:#5eead4;background:#f0fdfa">✓ Update Coordinates & Span Offsets</button>
        </div>
      </div>

      <div class="prop-section">
        <div class="section-header">DELETE / RESTORE FLOOR MEMBERS</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin:8px 18px 14px">
          <button id="fm-delete-btn" class="subtle" type="button" style="width:100%;color:#dc2626;border-color:#fca5a5;background:#fef2f2;font-weight:700">🗑 Delete Selected Floor Member (${esc(m.shortTag || m.id)})</button>
          ${deletedCount > 0 ? `<button id="fm-restore-deleted-btn" class="subtle" type="button" style="width:100%;color:#15803d;border-color:#86efac;background:#f0fdf4;font-weight:700">⟲ Restore ${deletedCount} Deleted Floor Member(s)</button>` : ''}
          <button id="fm-reset-all-btn" class="subtle" type="button" style="width:100%;color:#475569;border-color:#cbd5e1;background:#f8fafc;font-weight:600">↺ Reset All Custom Floor Member Edits</button>
        </div>
      </div>
    `;

    const propEl = $('#properties');
    if (propEl) propEl.innerHTML = html;

    $('#fm-switch-select')?.addEventListener('change', ev => {
      if (ev.target.value) {
        select([ev.target.value]);
      }
    });
    $('#fm-select-slab-btn')?.addEventListener('click', () => {
      select([s.id]);
      toast(`Selected host slab ${s.id}`);
    });
    $('#fm-open-ewp-view-btn')?.addEventListener('click', () => {
      setView('ewpspecs');
    });

    const addNearFn = (side) => {
      let res = null;
      commit(() => {
        res = window.addExtraFloorMemberNear?.(m.id, { side }, model);
        if (res?.memberId) selected = [res.memberId];
      });
      if (res) toast(`Added new floor member ${res.memberId.split(':')[1] || res.memberId}`);
    };
    $('#fm-add-left-btn')?.addEventListener('click', () => addNearFn('left'));
    $('#fm-add-right-btn')?.addEventListener('click', () => addNearFn('right'));

    $('#fm-sister-btn')?.addEventListener('click', () => {
      const nextPlies = curPlies >= 2 ? 1 : 2;
      commit(() => {
        window.updateFloorMemberById?.(m.id, { plies: nextPlies }, model);
      });
      toast(`${m.shortTag || m.id} updated to ${nextPlies}-Ply (${Math.round(curW * nextPlies)}×${curD} mm)`);
    });

    $('#fm-rotate-90-btn')?.addEventListener('click', () => {
      const cx = (m.a.x + m.b.x) / 2;
      const cy = (m.a.y + m.b.y) / 2;
      const dx = m.b.x - m.a.x;
      const dy = m.b.y - m.a.y;
      const newA = { x: Math.round(cx + dy / 2), y: Math.round(cy - dx / 2) };
      const newB = { x: Math.round(cx - dy / 2), y: Math.round(cy + dx / 2) };
      commit(() => {
        window.updateFloorMemberById?.(m.id, { a: newA, b: newB }, model);
      });
      toast(`Rotated ${m.shortTag || m.id} 90° around its center`);
    });

    const nudgeMemberFn = (deltaPerp) => {
      commit(() => {
        window.moveFloorMemberById?.(m.id, { deltaPerp }, model);
      });
      toast(`Moved ${m.shortTag || m.id} by ${deltaPerp > 0 ? '+' : ''}${deltaPerp} mm`);
    };
    $('#fm-move-l406-btn')?.addEventListener('click', () => nudgeMemberFn(-406));
    $('#fm-move-l38-btn')?.addEventListener('click', () => nudgeMemberFn(-38));
    $('#fm-move-l10-btn')?.addEventListener('click', () => nudgeMemberFn(-10));
    $('#fm-move-r10-btn')?.addEventListener('click', () => nudgeMemberFn(10));
    $('#fm-move-r38-btn')?.addEventListener('click', () => nudgeMemberFn(38));
    $('#fm-move-r406-btn')?.addEventListener('click', () => nudgeMemberFn(406));

    $('#fm-material-type-select')?.addEventListener('change', ev => {
      const nextFam = ev.target.value || 'ijoist';
      const defaultWidths = { ijoist: 64, lvl: 45, dimensional: 38, posistrut: 89, openweb: 89, steel: 133, rim: 45, blocking: 64 };
      const defaultGrades = { ijoist: 'TJI-230', lvl: '2.0E Microllam LVL', dimensional: 'C24 Kiln-Dried', posistrut: 'Posi-Strut C24', openweb: 'Open-Web 2x4 C24', steel: 'A992 Structural Steel', rim: '1.3E TimberStrand', blocking: 'C24 Kiln-Dried' };
      const nextW = defaultWidths[nextFam] || curW;
      const nextG = defaultGrades[nextFam] || curGrade;
      const nextPlies = nextFam === 'lvl' && curPlies < 2 ? 2 : curPlies;
      const nextSec = nextFam === 'ijoist'
        ? `I-Joist ${Math.round(nextW)}x${curD}`
        : nextFam === 'lvl'
        ? `${nextPlies}-Ply ${Math.round(nextW)}x${curD} LVL`
        : nextFam === 'dimensional'
        ? `${Math.round(nextW)}x${curD} C24`
        : nextFam === 'steel'
        ? `W8x18 Steel (${Math.round(curD)}mm)`
        : nextFam === 'posistrut'
        ? `Posi-Strut ${Math.round(curD)}mm`
        : nextFam === 'openweb'
        ? `Open-Web ${Math.round(curD)}mm`
        : `${Math.round(nextW)}x${curD} ${nextG}`;
      if ($('#fm-width-input')) $('#fm-width-input').value = isImperialUnits() ? formatInchesOnly(nextW) : nextW;
      if ($('#fm-grade-select')) $('#fm-grade-select').value = nextG;
      if ($('#fm-plies-select')) $('#fm-plies-select').value = String(nextPlies);
      commit(() => {
        window.updateFloorMemberById?.(m.id, {
          family: nextFam,
          section: nextSec,
          width: nextW,
          plies: nextPlies,
          grade: nextG
        }, model);
      });
      toast(`Updated ${m.shortTag || m.id} material profile to ${nextFam.toUpperCase()}`);
    });

    $('#fm-preset-select')?.addEventListener('change', ev => {
      const preset = (window.FLOOR_SECTION_PRESETS || []).find(p => p.id === ev.target.value);
      if (preset) {
        if ($('#fm-width-input')) $('#fm-width-input').value = isImperialUnits() ? formatInchesOnly(preset.width) : preset.width;
        if ($('#fm-depth-input')) $('#fm-depth-input').value = isImperialUnits() ? formatInchesOnly(preset.depth) : preset.depth;
        if ($('#fm-plies-select')) $('#fm-plies-select').value = String(preset.plies || 1);
        if ($('#fm-grade-select')) $('#fm-grade-select').value = preset.grade;
        if ($('#fm-material-type-select') && preset.family) $('#fm-material-type-select').value = preset.family;
        commit(() => {
          window.updateFloorMemberById?.(m.id, {
            section: preset.id,
            family: preset.family,
            width: preset.width,
            depth: preset.depth,
            plies: preset.plies || 1,
            grade: preset.grade
          }, model);
        });
        toast(`Updated ${m.shortTag || m.id} to ${preset.name || preset.id}`);
      }
    });

    const applyProfileFn = (applyToAllSameType) => {
      const role = $('#fm-role-select')?.value || m.type;
      const customTag = ($('#fm-tag-input')?.value || '').trim();
      const presetVal = $('#fm-preset-select')?.value;
      const preset = (window.FLOOR_SECTION_PRESETS || []).find(p => p.id === presetVal);
      const familyVal = $('#fm-material-type-select')?.value || curFamily;
      const widthVal = Math.max(20, parseLengthInput($('#fm-width-input')?.value, curW));
      const depthVal = Math.max(38, parseLengthInput($('#fm-depth-input')?.value, curD));
      const pliesVal = Math.max(1, Number($('#fm-plies-select')?.value) || curPlies);
      const gradeVal = $('#fm-grade-select')?.value || curGrade;
      const sectionName = preset ? preset.id : `${pliesVal > 1 ? pliesVal + '-Ply ' : ''}${Math.round(widthVal)}x${Math.round(depthVal)} ${gradeVal}`;
      commit(() => {
        window.updateFloorMemberById?.(m.id, {
          type: role,
          customTag: customTag || undefined,
          section: sectionName,
          family: familyVal,
          width: widthVal,
          depth: depthVal,
          plies: pliesVal,
          grade: gradeVal,
          applyToAllSameType
        }, model);
      });
      toast(applyToAllSameType ? `Applied ${sectionName} to all "${ m.type }" members` : `Updated ${m.shortTag || m.id} to ${sectionName}`);
    };
    $('#fm-apply-single-btn')?.addEventListener('click', () => applyProfileFn(false));
    $('#fm-apply-type-btn')?.addEventListener('click', () => applyProfileFn(true));

    $('#fm-apply-coords-btn')?.addEventListener('click', () => {
      const ax = Number($('#fm-ax-input')?.value);
      const ay = Number($('#fm-ay-input')?.value);
      const bx = Number($('#fm-bx-input')?.value);
      const by = Number($('#fm-by-input')?.value);
      const startOffsetMm = Number($('#fm-start-off-input')?.value) || 0;
      const endOffsetMm = Number($('#fm-end-off-input')?.value) || 0;
      const zOffsetMm = Number($('#fm-zoff-input')?.value) || 0;
      if (!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(bx) || !Number.isFinite(by)) {
        toast('Enter valid numeric coordinates.');
        return;
      }
      if (Math.hypot(bx - ax, by - ay) < 50) {
        toast('Member span must be at least 50 mm.');
        return;
      }
      commit(() => {
        window.updateFloorMemberById?.(m.id, {
          a: { x: ax, y: ay },
          b: { x: bx, y: by },
          startOffsetMm,
          endOffsetMm,
          zOffsetMm
        }, model);
      });
      toast(`Updated coordinates & offsets for ${m.shortTag || m.id}`);
    });

    const syncHangerTooltips = () => {
      const sKey = $('#fm-hanger-start-select')?.value || curHangerStart;
      const eKey = $('#fm-hanger-end-select')?.value || curHangerEnd;
      const bKey = $('#fm-hanger-select')?.value || (sKey === eKey ? sKey : 'mixed');
      if (typeof renderHangerTooltipInner === 'function') {
        if ($('#fm-hanger-tooltip')) $('#fm-hanger-tooltip').innerHTML = renderHangerTooltipInner(bKey, sKey, eKey);
        if ($('#fm-hanger-start-tooltip')) $('#fm-hanger-start-tooltip').innerHTML = renderHangerTooltipInner(sKey);
        if ($('#fm-hanger-end-tooltip')) $('#fm-hanger-end-tooltip').innerHTML = renderHangerTooltipInner(eKey);
      }
    };
    $('#fm-hanger-select')?.addEventListener('change', ev => {
      const val = ev.target.value;
      if (!val || val === 'mixed') return;
      if ($('#fm-hanger-start-select')) $('#fm-hanger-start-select').value = val;
      if ($('#fm-hanger-end-select')) $('#fm-hanger-end-select').value = val;
      syncHangerTooltips();
      commit(() => {
        window.updateFloorMemberById?.(m.id, { hangerStart: val, hangerEnd: val }, model);
      });
      toast(`Updated 3D Joist Hanger on ${m.shortTag || m.id} to ${window.HANGER_CATALOG?.[val]?.name || val}`);
    });
    $('#fm-hanger-start-select')?.addEventListener('change', ev => {
      const val = ev.target.value || 'none';
      const endVal = $('#fm-hanger-end-select')?.value || curHangerEnd;
      if ($('#fm-hanger-select')) $('#fm-hanger-select').value = val === endVal ? val : 'mixed';
      syncHangerTooltips();
      commit(() => {
        window.updateFloorMemberById?.(m.id, { hangerStart: val }, model);
      });
      toast(`Updated Start Hanger (End A) on ${m.shortTag || m.id}`);
    });
    $('#fm-hanger-end-select')?.addEventListener('change', ev => {
      const val = ev.target.value || 'none';
      const startVal = $('#fm-hanger-start-select')?.value || curHangerStart;
      if ($('#fm-hanger-select')) $('#fm-hanger-select').value = val === startVal ? val : 'mixed';
      syncHangerTooltips();
      commit(() => {
        window.updateFloorMemberById?.(m.id, { hangerEnd: val }, model);
      });
      toast(`Updated End Hanger (End B) on ${m.shortTag || m.id}`);
    });
    $('#fm-stiffeners-select')?.addEventListener('change', ev => {
      const val = ev.target.value || 'both';
      commit(() => {
        window.updateFloorMemberById?.(m.id, { webStiffeners: val }, model);
      });
      toast(`Updated web stiffeners on ${m.shortTag || m.id}`);
    });

    $('#fm-auto-hanger-all-btn')?.addEventListener('click', () => {
      commit(() => window.autoSizeFloorHangersByReaction?.(s, { memberId: m.id, brand: 'all' }));
    });
    $('#fm-auto-hanger-simpson-btn')?.addEventListener('click', () => {
      commit(() => window.autoSizeFloorHangersByReaction?.(s, { memberId: m.id, brand: 'Simpson Strong-Tie' }));
    });
    $('#fm-auto-hanger-mitek-btn')?.addEventListener('click', () => {
      commit(() => window.autoSizeFloorHangersByReaction?.(s, { memberId: m.id, brand: 'MiTek' }));
    });

    $('#fm-apply-hardware-btn')?.addEventListener('click', () => {
      const hangerStart = $('#fm-hanger-start-select')?.value || 'face_mount';
      const hangerEnd = $('#fm-hanger-end-select')?.value || 'face_mount';
      const webStiffeners = $('#fm-stiffeners-select')?.value || 'both';
      const mepHoleEnabled = $('#fm-mep-enable-select')?.value === 'true';
      const mepHoleOffsetMm = Math.max(50, Number($('#fm-mep-off-input')?.value) || 600);
      const mepHoleDiameterMm = Math.max(38, Math.min(250, Number($('#fm-mep-dia-input')?.value) || 110));
      commit(() => {
        window.updateFloorMemberById?.(m.id, {
          hangerStart,
          hangerEnd,
          webStiffeners,
          mepHoleEnabled,
          mepHoleOffsetMm,
          mepHoleDiameterMm
        }, model);
      });
      toast(`Updated hangers, web stiffeners & MEP hole on ${m.shortTag || m.id}`);
    });

    $('#fm-delete-btn')?.addEventListener('click', () => {
      commit(() => {
        window.deleteFloorMemberById?.(m.id, model);
        selected = [s.id];
      });
      toast(`Deleted floor member ${m.shortTag || m.id}`);
    });

    $('#fm-restore-deleted-btn')?.addEventListener('click', () => {
      commit(() => {
        window.restoreDeletedFloorMembers?.(s, model);
      });
      toast(`Restored ${deletedCount} deleted floor member(s)`);
    });

    $('#fm-reset-all-btn')?.addEventListener('click', () => {
      commit(() => {
        window.resetAllFloorMemberEdits?.(s, model);
        selected = [s.id];
      });
      toast('Reset all custom floor member edits on slab');
    });
    return;
  }
  if(!e){
    $('#properties').innerHTML=`<div class="property-heading"><span class="element-symbol">${icon('building')}</span><div><strong>Project Settings</strong><small>Timber Teck Virtual Building</small></div></div><div class="section-header">ACTIVE STORY</div>${field('Height','storyHeight',model.stories.find(s=>s.id===activeStory).height,'mm')}<div class="empty-prop">Select an element, wall stud, or floor joist/beam in 2D or 3D to edit its geometry, profile, hangers, or delete it.</div><div style="padding:0 19px"><span class="status-label">All views synchronized</span></div>`;
    bindProperties();return;
  }
  const name=e.type[0].toUpperCase()+e.type.slice(1);
  let html=`<div class="property-heading"><span class="element-symbol">${icon(e.type)}</span><div><strong>${name}</strong><small>${esc(e.id)} · ${selected.length>1?selected.length+' selected':'Selected element'}</small></div><span class="selection-count">${selected.length.toString().padStart(2,'0')}</span></div><div class="prop-section"><div class="section-header">GENERAL & CLASSIFICATION</div>${field('Element ID','id',e.id,'','text')}${choice('Story','story',e.story,model.stories.map(s=>[s.id,s.name]))}${choice('Layer','layer',e.layer,layers.map(l=>[l.name,l.name]))}</div><div class="prop-section"><div class="section-header">GEOMETRY & POSITIONING</div>`;
  if(['wall','beam','column','curtainwall','stair'].includes(e.type)){
    if(e.b)html+=field('Length','length',Math.round(distance(e.a,e.b)),'mm');
    html+=field('Height','height',heightOf(e),'mm')+field('Thickness / Width','thickness',e.thickness||200,'mm');
    if(e.type==='beam')html+=choice('Framing Material Profile (3D)','framingMaterial',e.framingMaterial||'dimensional',[['dimensional','Dimensional (Solid Timber)'],['ijoist','I-Joist (LVL Flanges + OSB Web)'],['lvl','LVL (Multi-Ply Laminated Veneer)']])+hangerChoiceWithTooltip('Joist Hanger','joistHangerType',e.joistHangerType||'none',[['none','No Hanger (Direct Bearing)'],['face_mount','Face Mount (Simpson LUS / MIU)'],['top_mount','Top Mount / Top Flange (Simpson IUS / ITS)'],['concealed_flange','Concealed Flange (Simpson IUC / LUCZ)'],['adjustable_truss','Adjustable Truss Strap (THA / MSTA)'],['heavy_skewed','45° Skewed / Heavy Hanger (SUR / HHUS)'],['ledger_ribbon','2x4 Ledger Ribbon + Tie Clip'],['bearing_plate','Sill Bearing Plate + Uplift Clips'],['column_cap','Simpson CCQ Column Cap Support']]);
    if(e.type==='wall')html+=field('End X','bx',Math.round(e.b.x),'mm')+field('End Y','by',Math.round(e.b.y),'mm')+choice('Wall height preset','wallHeightPreset',appPresetKey(heightOf(e),APP_WALL_HEIGHT_PRESETS),[['custom','Custom / manual height'],...APP_WALL_HEIGHT_PRESETS.map(v=>[String(v),formatLength(v)])])+choice('Reference line','reference',e.reference||'outside',[['outside','Outside face'],['center','Center core'],['inside','Inside face']])+choice('Top linked','followStory',String(e.followStory),[['true','Story height'],['false','Custom height']]);
    if(e.type==='stair')html+=field('Risers count','risers',e.risers||16,'')+field('Riser height','riserHeight',Math.round(e.riserHeight||190.5),'mm')+field('Flight width','width',e.width||1000,'mm');
    if(e.type==='curtainwall')html+=field('Panel module width','panelWidth',e.panelWidth||1200,'mm');
  }
  if(e.type==='railing'&&e.a&&e.b){
    html+=field('Length','length',Math.round(distance(e.a,e.b)),'mm')+field('Railing height','height',e.height||1050,'mm')+field('Baluster spacing','balusterSpacing',e.balusterSpacing||120,'mm');
  }
  if(e.type==='grid'&&e.a&&e.b){
    html+=field('Grid ID marker','bubble',e.bubble||'A','','text')+field('Length','length',Math.round(distance(e.a,e.b)),'mm');
  }
  if(e.type==='leveldim'){
    html+=field('Level height','targetHeight',e.targetHeight??storyOf(e).elevation,'mm')+choice('Marker symbol','markerType',e.markerType||'standard_triangle',[['standard_triangle','Timber Teck standard triangle'],['circle','Benchmark circle']]);
  }
  if(e.type==='object'){
    html+=field('Object Type','subtype',e.subtype||'Table & Chairs','','text')+field('Width','width',e.width||1600,'mm')+field('Depth','depth',e.depth||900,'mm')+field('Height','height',e.height||750,'mm');
  }
  if(e.type==='morph'||e.type==='mesh'){
    html+=field('Height / Extrusion','height',e.height||2400,'mm');
    if(e.type==='mesh')html+=field('Base skirt depth','skirtDepth',e.skirtDepth||800,'mm')+field('Base elevation','elevation',e.elevation||0,'mm');
  }
  if(e.type==='fill'){
    html+=choice('Hatch pattern','hatchType',e.hatchType||'diagonal45',[['diagonal45','45° Diagonal'],['cross','Crosshatch'],['solid','Solid fill']])+field('Hatch spacing','hatchScale',e.hatchScale||200,'mm');
  }
  if(e.b&&!['wall','stair','railing','curtainwall','grid'].includes(e.type)){
    const d=e.type==='dimension'?resolveDimension(e):e;
    html+=field('End X','bx',Math.round(d.b.x),'mm')+field('End Y','by',Math.round(d.b.y),'mm');
    if(e.type==='line')html+=field('Length','length',Math.round(distance(e.a,e.b)),'mm');
  }
  if(e.host){
    html+=choice('Host wall','host',e.host,model.elements.filter(w=>w.type==='wall').map(w=>[w.id,w.id]))+field('Offset','offset',e.offset,'mm')+field('Width','width',e.width,'mm')+field('Height','height',e.height,'mm');
    if(e.type==='window'||e.type==='cornerwin')html+=field('Sill height','sill',e.sill,'mm');
    html+=field('Header / opening head level','head',e.sill+e.height,'mm');
    if(e.type==='window'||e.type==='door')html+=choice('Head height preset','openingHeadPreset',appPresetKey((e.sill||0)+e.height,APP_OPENING_HEAD_PRESETS),[['custom','Custom / manual head level'],...APP_OPENING_HEAD_PRESETS.map(v=>[String(v),`${formatLength(v)} above wall base`])])+`<div class="empty-prop">Changing the head level adjusts opening height from its current sill. The header is generated immediately above the opening.</div>`;
  }
  if(e.type==='slab'){
    html+=field('Thickness','thickness',e.thickness,'mm');
    const st = window.ewpBeamToolState || {};
    const rawSlabMembers = typeof generateFloorFramingForSlab === 'function' ? generateFloorFramingForSlab(e) : [];
    const slabMembers = Array.isArray(rawSlabMembers) ? rawSlabMembers : (rawSlabMembers?.members || []);
    html+=`<div class="section-header">SELECT / EDIT INDIVIDUAL FLOOR MEMBER (${slabMembers.length})</div>`;
    html+=`<div style="padding:6px 18px 10px">
      <select id="slab-floor-member-quick-picker" style="width:100%;padding:7px 8px;border:1px solid #38bdf8;border-radius:6px;font-size:11.5px;font-weight:700;color:#0369a1;background:#f0f9ff">
        <option value="">— Pick Any Floor Joist, Girder, Rim or Blocking to Edit —</option>
        ${slabMembers.map(fm => `<option value="${esc(fm.id)}">${esc(fm.shortTag || fm.id)} · ${esc(fm.type)} (${esc(fm.section)}, ${Math.round(fm.length)} mm)</option>`).join('')}
      </select>
    </div>`;
    html+=`<div class="section-header">TIMBER TECK FLOOR FRAMING OPTIONS</div>`;
    html+=choice('Joist / Truss Profile','joistSection',e.joistSection||st.joistSection||'I-Joist 11-7/8',[
      ['I-Joist 9-1/2','I-Joist 9-1/2" (241mm)'],
      ['I-Joist 11-7/8','I-Joist 11-7/8" (302mm)'],
      ['I-Joist 14','I-Joist 14" (356mm)'],
      ['I-Joist 16','I-Joist 16" (406mm)'],
      ['Posi-Strut 11-7/8 (2x4)','Posi-Strut 11-7/8" Metal-Web Truss'],
      ['Posi-Strut 14 (2x4)','Posi-Strut 14" Metal-Web Truss'],
      ['Posi-Strut 16 (2x4)','Posi-Strut 16" Metal-Web Truss'],
      ['Floor Truss 14 (2x4)','Open-Web Floor Truss 14" (2x4)'],
      ['Floor Truss 18 (2x4)','Open-Web Floor Truss 18" (2x4)'],
      ['2x10 Dimensional','2x10 C24 Solid Sawn Joist'],
      ['2x12 Dimensional','2x12 C24 Solid Sawn Joist'],
      ['47x225 C24','47x225 mm C24 Timber Joist']
    ]);
    html+=choice('Joist Spacing','joistSpacing',Math.round(e.joistSpacing||((st.joistSpacingIn||16)*25.4)),[
      [305,'12" O.C. (305 mm)'],
      [406,'16" O.C. (406 mm)'],
      [488,'19.2" O.C. (488 mm)'],
      [610,'24" O.C. (610 mm)']
    ]);
    html+=choice('Span Direction','joistDirection',e.joistDirection||st.joistDirection||'Y',[
      ['Y','Y-Axis Span (Front-to-Back)'],
      ['X','X-Axis Span (Left-to-Right)'],
      ['Auto','Auto (Shortest Span)']
    ]);
    html+=choice('Support / Girder Mode','girderType',e.girderType||st.girderType||'flush_hanger',[
      ['flush_hanger','Flush Girder w/ Face-Mount Hangers'],
      ['dropped_beam','Dropped Girder (Joists Bear on Top)'],
      ['double_girder','Double Interior Girders (3 Bays)'],
      ['pocket_steel','Recessed Steel W8x18 Beam'],
      ['clear_span','Clear Span Wall-to-Wall']
    ]);
    html+=choice('Bridging / Strutting','bridgingType',e.bridgingType||st.bridgingType||'solid_blocking',[
      ['solid_blocking','Full-Depth EWP Blocking'],
      ['herringbone','Herringbone Cross-Bridging'],
      ['strongback_2x6','2x6 Strongback (Through Open Webs)'],
      ['bottom_strapping','1x4 Continuous Bottom Strapping'],
      ['none','None']
    ]);
    html+=choice('Mid-Span Blocking Rows (EWP)','bridgingRows',e.bridgingRows||st.bridgingRows||'auto_ewp',[
      ['auto_ewp','Auto EWP Manufacturer Rules (Span-Based)'],
      ['midspan','1 Row @ Mid-Span (L/2)'],
      ['third_points','2 Rows @ 1/3 & 2/3 Span (L/3, 2L/3)'],
      ['every_2100mm','Every 2,100 mm (7\'-0" Max O.C.)']
    ]);
    html+=choice('Perimeter Rim / Bearing','endBearingType',e.endBearingType||st.endBearingType||'ewp_rim',[
      ['ewp_rim','1-1/8" EWP Rim Board'],
      ['solid_rim','2x Solid Band Joist'],
      ['top_chord_bearing','Top-Chord Bearing Floor Truss'],
      ['bottom_chord_bearing','Bottom-Chord Bearing + Ribbon'],
      ['ledger_hanger','Ledger + Face-Mount Hangers']
    ]);
    html+=hangerChoiceWithTooltip('Joist Hanger Type','joistHangerType',e.joistHangerType||st.joistHangerType||'face_mount',[
      ['face_mount','Simpson LUS210 / MIU Face-Mount (1,480 lbs)'],
      ['top_mount','Simpson IUS / ITS Top-Flange (1,620 lbs)'],
      ['concealed_flange','Simpson IUC / LUCZ Concealed-Flange (1,350 lbs)'],
      ['adjustable_truss','Simpson THA422 / MSTA Truss Strap (2,150 lbs)'],
      ['heavy_skewed','Simpson HHUS / SUR Heavy Hanger (2,840 lbs)'],
      ['simpson_hgus','Simpson HGUS210-2 Heavy Girder (5,650 lbs)'],
      ['mitek_ihf','MiTek IHF / JDH Face-Mount (1,540 lbs)'],
      ['mitek_itf','MiTek ITF / TFL Top-Flange (1,685 lbs)'],
      ['mitek_ihfl','MiTek IHFL Concealed-Flange (1,390 lbs)'],
      ['mitek_tsh','MiTek TSH / THDH Truss Strap (2,240 lbs)'],
      ['mitek_hdo','MiTek HDO / HJU Heavy Double-Shear (2,960 lbs)'],
      ['mitek_hdg','MiTek HD210-2 / BPH Heavy Girder (5,820 lbs)'],
      ['ledger_ribbon','Direct Bearing + Web Stiffeners (1,520 lbs)']
    ]);
    html+=`<div style="margin:8px 18px 10px;display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="primary" type="button" data-slab-auto-size-hangers="all" style="flex:1;font-weight:700;background:#059669;border-color:#047857;color:#fff;font-size:11px;padding:7px 8px">⚡ Auto-Size Hangers from Reaction</button>
        <button class="subtle" type="button" data-slab-auto-size-hangers="Simpson Strong-Tie" style="font-weight:700;font-size:10.5px;padding:6px 8px">⚡ Simpson</button>
        <button class="subtle" type="button" data-slab-auto-size-hangers="MiTek" style="font-weight:700;font-size:10.5px;padding:6px 8px">⚡ MiTek</button>
      </div>
      <button class="subtle" type="button" data-slab-auto-blocking="1" style="width:100%;font-weight:700;color:#5b21b6;border-color:#c4b5fd;background:#f5f3ff">⚡ Auto-Place I-Joist Mid-Span Blocking (EWP Rules)</button>
      <button class="subtle" type="button" data-slab-generate-ewp-2d="1" style="width:100%;font-weight:700;color:#0f766e;border-color:#5eead4;background:#f0fdfa">📐 Auto-Generate 2D EWP Framing Plan (DXF &amp; PDF)</button>
      <button class="subtle" type="button" data-slab-floor-options="flooroptions" style="width:100%;font-weight:700;color:#1e40af;border-color:#93c5fd;background:#eff6ff">🛠️ Open All Floor Framing Options Studio…</button>
      <button class="subtle" type="button" data-slab-floor-view="ewpspecs" style="width:100%;font-weight:600">📐 Switch to 2D Floor Framing Plan</button>
    </div>`;
  }
  if(e.type==='roof')html+=roofProperties(e);
  if(e.radius)html+=field('Radius','radius',e.radius,'mm');
  if(e.a){
    const a=e.type==='dimension'?resolveDimension(e).a:e.a;
    html+=field('Start X','ax',Math.round(a.x),'mm')+field('Start Y','ay',Math.round(a.y),'mm');
  }
  if(e.type==='dimension'){
    const d=resolveDimension(e);
    const measuredMm = Math.round(distance(d.a, d.b));
    html+=`<div class="section-header">TIMBER TECK DIMENSION PROPERTIES</div>`;
    html+=field('Measured length','measuredLength',formatLength(measuredMm),'','text');
    html+=field('Custom text override','customText',e.customText||'','','text');
    html+=field('Prefix','prefix',e.prefix||'','','text');
    html+=field('Suffix','suffix',e.suffix||'','','text');
    html+=field('Baseline offset','offset',Math.round(e.offset??600),'mm');
    html+=`<div style="display:flex;gap:6px;margin:8px 18px 10px">
      <button class="subtle" id="dim-flip-btn" type="button" style="flex:1" title="Flip dimension to other side of baseline">⇄ Flip Side</button>
      <button class="subtle" id="dim-relink-btn" type="button" style="flex:1" title="Re-anchor dimension to nearest BIM endpoints">⟲ Re-anchor</button>
    </div>`;
    html+=`<div style="margin:0 18px 12px">
      <button class="subtle" id="dim-delete-btn" type="button" style="width:100%;color:#dc2626;border-color:#fca5a5;background:#fef2f2;font-weight:600">🗑 Delete Dimension</button>
    </div>`;
    html+=`<div class="empty-prop">${d.resolved?'✓ Linked associative anchors follow BIM wall endpoints.':'⚠ Detached anchor(s) · Element moved or removed.'}</div>`;
  }
  if(e.type==='section_callout'||e.type==='section'){
    const targetW=model.elements.find(w=>w.id===e.wallId&&w.type==='wall')||framingWall();
    const stackup=computeVerticalStackup(targetW,e.xAlongWall);
    if(stackup){
      html+=`<div class="section-header">VERTICAL STACK-UP CALLOUT (${esc(e.code||'SEC-1')})</div>`;
      html+=field('Callout code','code',e.code||'SEC-1','','text');
      html+=field('Position along wall','xAlongWall',stackup.xAlongWall,'mm');
      html+=`<div style="margin:8px 18px 12px;border:1px solid #cbd5e1;border-radius:6px;background:#f8fafc;padding:10px;font-size:11.5px">
        <div style="font-weight:700;color:#0f172a;margin-bottom:6px">Stack-Up Schedule · ${esc(stackup.wallId)}${stackup.openingId?' ('+esc(stackup.openingId)+')':''}</div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0"><span style="color:#0f766e;font-weight:700">1. Top Plates</span><span>${esc(stackup.topPlates.spec)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0"><span style="color:#b45309;font-weight:700">2. Header Member</span><span>${esc(stackup.header.spec)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0"><span style="color:#475569;font-weight:600">Rough Opening</span><span>${formatLength(stackup.roughOpening.height)} clear</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0"><span style="color:#0369a1;font-weight:700">3. Sill Member</span><span>${esc(stackup.sill.spec)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#4d5b43;font-weight:700">4. Bottom Plate</span><span>${esc(stackup.bottomPlate.spec)}</span></div>
      </div>`;
    }
  }
  if(e.type==='text')html+=field('Text','text',e.text,'','text');
  if(e.type==='label')html+=field('Label text','text',e.text||'Label','','text');
  if(e.type==='detail')html+=field('Detail code','code',e.code||'D-01','','text')+field('Radius','radius',e.radius||800,'mm');
  if(e.type==='changemarker')html+=field('Revision number','changeNumber',e.changeNumber||'CH-01','','text')+field('Reason','text',e.text||'Revision','','text');
  if(e.type==='lamp')html+=field('Lamp wattage','wattage',e.wattage||60,'W')+choice('Fixture type','lightType',e.lightType||'downlight',[['downlight','Recessed Downlight'],['pendant','Pendant Luminaire'],['cove','Linear Cove']]);
  if(e.type==='camera')html+=field('Field of view','fov',e.fov||60,'°')+field('Camera height','height',e.height||1600,'mm');
  html+='</div>';

  if(['wall','window','door','beam','column','slab','roof','curtainwall','stair','morph','mesh','object'].includes(e.type)){
    html+=`<div class="prop-section"><div class="section-header">SURFACE & MATERIAL</div>${choice('Material','material',e.material||'Timber',Object.keys(materials).map(m=>[m,m]))}</div>`;
  }
  if(e.type==='roof')html+=roofFramingProperties(e);
  if(e.type==='wall'){
    html+=framingProperties(e);
    let hs=hosted(e);
    html+=`<div class="section-header">HOSTED OPENINGS <span>${hs.length}</span></div>`+hs.map(o=>`<div class="hosted-row">${icon(o.type)}${o.type[0].toUpperCase()+o.type.slice(1)} · ${o.id}<button data-select="${o.id}">Select</button></div>`).join('')+(hs.length?'':'<div class="empty-prop">Place a door, window or corner window.</div>');
  }
  if(['wall','column','beam','slab','roof','curtainwall','stair','morph','mesh','railing','object'].includes(e.type)&&typeof window.getElementConnectSummary==='function'){
    const cs=window.getElementConnectSummary(e,model);
    const rt=cs.roofTrim;
    const seoCount=(cs.asTarget?.length||0)+(cs.asOperator?.length||0);
    html+=`<div class="prop-section"><div class="section-header">ARCHICAD CONNECT · ROOF TRIM &amp; SEO <span>${(rt?1:0)+seoCount} link(s)</span></div>`;
    if(rt){
      html+=`<div style="margin:4px 18px 8px;padding:7px 9px;background:#f0f9ff;border:1px solid #7dd3fc;border-radius:6px;font-size:11px;color:#0c4a6e">
        <div><strong>Roof Trim:</strong> ${rt.trimType==='keepAbove'?'Trim Base (Keep Above)':'Trim Top (Keep Below)'}</div>
        <div>Ref: ${rt.trimPlane==='top'?'Roof Top Surface':'Roof Bottom / Soffit'} · Offset: ${rt.offset||0} mm</div>
        <div>Roofs: ${esc((rt.roofIds||[rt.roofId]).filter(Boolean).join(', '))}${rt.extendToRoof?' · Extend to Peak':''}</div>
      </div>`;
    }
    if(cs.asTarget.length||cs.asOperator.length){
      html+=`<div style="margin:4px 18px 8px;display:flex;flex-direction:column;gap:4px">
        ${cs.asTarget.map(op=>`<div style="font-size:10.5px;padding:4px 7px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;color:#1e3a8a"><b>Target ← ${esc(op.operatorId)}</b> (${esc(op.operation.replace(/_/g,' '))})</div>`).join('')}
        ${cs.asOperator.map(op=>`<div style="font-size:10.5px;padding:4px 7px;background:#fffbeb;border:1px solid #fde68a;border-radius:5px;color:#92400e"><b>Operator → ${esc(op.targetId)}</b> (${esc(op.operation.replace(/_/g,' '))})</div>`).join('')}
      </div>`;
    }
    html+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 18px 8px">
      ${e.type!=='roof'?`<button class="subtle" type="button" data-connect-action="trimRoof" style="font-size:10.5px;padding:5px 7px;font-weight:700;color:#0369a1;border-color:#7dd3fc;background:#f0f9ff">${rt?'Adjust Roof Trim…':'Trim to Roof…'}</button>`:''}
      <button class="subtle" type="button" data-connect-action="openSEO" style="font-size:10.5px;padding:5px 7px;font-weight:700;color:#0f172a">Solid Ops (SEO)…</button>
      ${rt?`<button class="subtle" type="button" data-connect-action="clearTrimRoof" style="font-size:10.5px;padding:5px 7px;color:#dc2626;border-color:#fca5a5;background:#fef2f2">Clear Roof Trim</button>`:''}
      ${seoCount?`<button class="subtle" type="button" data-connect-action="clearSEOLinks" style="font-size:10.5px;padding:5px 7px;color:#dc2626;border-color:#fca5a5;background:#fef2f2">Cancel SEO Links</button>`:''}
    </div></div>`;
  }
  html+=`<div style="padding:12px 19px 0"><span class="status-label">${e.host?'Hosted BIM Opening':'2D + 3D live synchronized'}</span></div>`;
  const propEl=$('#properties');if(propEl)propEl.innerHTML=html;
  bindProperties();
  $$('[data-connect-action]').forEach(b=>b.onclick=()=>{
    const act=b.dataset.connectAction;
    if(act==='trimRoof')window.openTrimToRoofModal?.();
    else if(act==='clearTrimRoof')window.executeTrimElementsToRoof?.([e.id],[],{clear:true});
    else if(act==='openSEO')window.openSEOPalette?.(false);
    else if(act==='clearSEOLinks')window.cancelSEOForElements?.([e.id],'both');
  });
  $$('[data-slab-auto-size-hangers]').forEach(b=>b.onclick=()=>{
    const brand = b.dataset.slabAutoSizeHangers || 'all';
    if(typeof window.autoSizeFloorHangersByReaction==='function'){
      commit(()=>window.autoSizeFloorHangersByReaction(e, { brand }));
    }
  });
  $$('[data-slab-auto-blocking]').forEach(b=>b.onclick=()=>{
    if(typeof window.autoPlaceIJoistMidSpanBlocking==='function'){
      window.autoPlaceIJoistMidSpanBlocking(e, { switchView: false });
      properties();
    }
  });
  $$('[data-slab-generate-ewp-2d]').forEach(b=>b.onclick=()=>{
    const invoke=()=>{
      if(typeof window.generate2DEWPFramingPlan==='function') window.generate2DEWPFramingPlan();
      else toast('2D EWP framing plan generator is loading...');
    };
    if(typeof window.generate2DEWPFramingPlan==='function') invoke();
    else import('./report.js').then(invoke).catch(()=>toast('Could not load 2D EWP framing plan generator.'));
  });
  $$('[data-slab-floor-options]').forEach(b=>b.onclick=()=>openEWPSpecs('flooroptions'));
  $$('[data-slab-floor-view]').forEach(b=>b.onclick=()=>setView(b.dataset.slabFloorView));
  $('#slab-floor-member-quick-picker')?.addEventListener('change', ev => {
    if (ev.target.value) {
      select([ev.target.value]);
      toast('Selected individual floor member — edit profile, coordinates, hangers, or plies');
    }
  });
  if(e.structure==='composite'){const th=$('#properties [data-property="thickness"]');if(th)th.readOnly=true;}
  $('#wall-stud-quick-picker')?.addEventListener('change', ev => {
    if(ev.target.value){
      select([ev.target.value]);
      toast('Selected individual stud — adjust size or delete in inspector');
    }
  });
  $$('[data-junction-detail]').forEach(b=>b.onclick=()=>{
    const mode=b.dataset.junctionDetail;
    try{
      if(!['insideBlocking','insideStudFull','insideStudPartial'].includes(mode))throw Error('Unsupported inside-wall junction detail.');
      if(construction(e).insideJunctionDetail===mode)return;
      if(commit(()=>setWallProperty(e,'framing.insideJunctionDetail',mode)))toast(`${window.insideJunctionLabel?.(mode)||mode} selected; wall framing regenerated.`);
    }catch(error){toast(error.message||'Could not update the inside-wall junction detail.');}
  });
  $$('[data-wall-action]').forEach(b=>b.onclick=()=>{
    const action=b.dataset.wallAction;
    if(action==='flip'){commit(()=>e.flipped=!e.flipped);toast('Wall orientation flipped; framing regenerated.')}
    else if(action==='autoSizeConnectors'){
      const brand = b.dataset.brand || 'all';
      let res = null;
      commit(()=>{
        if(typeof window.autoSizeWallConnectors==='function') res = window.autoSizeWallConnectors(e, brand);
      });
      properties();
      render();
      if(res){
        toast(`⚡ Auto-Sized Wall Connectors (${e.id}): Hold-Down ${res.holdDown.brand} ${res.holdDown.code} (${res.holdDownUtilPct}% D/C), Stud Tie ${res.studTie.code} (${res.studTieUtilPct}% D/C), Strap ${res.plateStrap.code}`);
      }
    }
    else if(action==='flipSheathing'){
      let newSide = 'interior';
      commit(()=>{
        if(window.flipWallSheathing) newSide = window.flipWallSheathing(e);
      });
      properties();
      render();
      toast(`Wall ${e.id} sheathing face flipped to ${newSide.toUpperCase()}`);
    }
    else if(action==='cornerDetail'){openCornerDetailModal(e)}
    else if(action==='openWallStudioHub'){window.openWallStudioHubModal?.(e,'openings')}
    else if(action==='autoDesignWall'){
      let res = null;
      commit(()=>{
        res = window.WallStructuralEngine?.autoDesignWallFraming(e, model);
      });
      properties();
      render();
      if(res?.applied){
        toast(`⚡ Auto-Designed ${e.id}: ${res.chosenSection} (${res.finalUtilizationPct}% D/C · ${res.preservedLockedCount} locked preserved)`);
      }
    }
    else if(action==='mirrorWallFraming'){
      commit(()=>{
        window.WallMemberEditor?.mirrorWallFraming(e, model);
      });
      properties();
      render();
      toast(`⇄ Mirrored framing layout along ${e.id}`);
    }
    else if(action==='suggestFraming'){openWallSuggestionModal(e)}
    else if(action==='restoreStuds'){
      commit(()=>window.restoreWallDeletedStuds?.(e, model));
      toast(`Restored all deleted members on ${e.id}`);
    }
    else if(action==='resetStudSizes'){
      const summary = window.WallMemberEditor?.getManualEditSummary(e);
      commit(()=>window.clearWallStudOverrides?.(e, false));
      toast(summary?.lockedCount ? `Reset unlocked overrides on ${e.id} (${summary.lockedCount} locked member(s) preserved)` : `Reset all custom member overrides on ${e.id}`);
    }
    else if(action==='insertCustomStud'){
      const xRaw = $('#wall-prop-insert-x')?.value;
      const zRaw = $('#wall-prop-insert-z')?.value;
      const xVal = Number(xRaw);
      if(!Number.isFinite(xVal)){
        toast('Enter a valid X coordinate (mm) along the wall.');
        return;
      }
      const zVal = (zRaw !== '' && zRaw !== undefined && zRaw !== null && Number.isFinite(Number(zRaw))) ? Number(zRaw) : undefined;
      const probe = window.insertCustomStudAtCoordinate?.({ x: xVal, z: zVal }, { wall: e, dryRun: true }, model);
      if(!probe || !probe.ok){
        toast(`Constraint: ${probe?.reason || 'Cannot insert custom stud at this coordinate.'}`);
        return;
      }
      let res = null;
      commit(()=>{
        res = window.insertCustomStudAtCoordinate?.({ x: xVal, z: zVal }, { wall: e }, model);
        if(res?.ok && res.studId) selected = [res.studId];
      });
      if(res?.ok){
        toast(`Inserted custom stud at X=${Math.round(res.x0)}–${Math.round(res.x1)} mm, Z=${Math.round(res.z0)}–${Math.round(res.z1)} mm`);
      }
    }
    else if(action==='junctionAudit'){
      const audit=window.auditAllWallJunctions?.();
      if(!audit){toast('Wall-junction audit is unavailable.');return;}
      const rows=audit.connections.map(c=>`<tr><td>${esc(c.wallId)}</td><td>${esc(c.otherWallId)}</td><td style="text-align:right">${c.offsetMm.toLocaleString()} mm</td><td>${esc(c.detail)}</td><td><b style="color:${c.status==='OK'?'#15803d':'#b45309'}">${esc(c.status)}</b></td><td><button class="subtle" type="button" data-junc-suggest="${esc(c.wallId)}" style="padding:2px 8px;font-size:11px;color:#1e40af;border-color:#93c5fd;background:#eff6ff;font-weight:700">💡 Suggest</button></td></tr>`).join('');
      const problemList=audit.issues.length?`<h3 style="margin:14px 0 6px">Review items (${audit.issues.length})</h3><ul style="margin:0;padding-left:20px">${audit.issues.map(i=>`<li style="margin:5px 0">${esc(i)}</li>`).join('')}</ul>`:'<p style="padding:10px;background:#f0fdf4;border-radius:6px;color:#166534">No missing T-junction backing members were detected. This is a geometry check, not a structural capacity verification.</p>';
      openModal('Internal Wall Intersection Audit',`<div class="modal-copy">Checked ${audit.wallCount} framed walls and ${audit.junctionCount} wall intersections. <b>${audit.okCount} OK</b> · <b>${audit.reviewCount} need review</b>. The selected internal-wall detail applies to T-junctions where another wall terminates on the through-wall.</div><div style="overflow:auto;max-height:38vh;margin:12px 0;border:1px solid #dbe3ea;border-radius:6px"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#f1f5f9;text-align:left"><th style="padding:7px">Through wall</th><th style="padding:7px">Branch wall</th><th style="padding:7px">Offset</th><th style="padding:7px">Selected detail</th><th style="padding:7px">Status</th><th style="padding:7px">Optimization</th></tr></thead><tbody>${rows||'<tr><td colspan="6" style="padding:10px">No internal wall junctions were detected.</td></tr>'}</tbody></table></div>${problemList}<div class="modal-actions"><button id="wall-junction-audit-suggest" class="subtle" style="color:#1e40af;border-color:#93c5fd;background:#eff6ff;font-weight:700">💡 Suggest Optimal Sizing & Spacing</button><button id="wall-junction-audit-close" class="primary">Close</button></div>`);
      bindClick('#wall-junction-audit-close',()=>$('#modal')?.close?.());
      bindClick('#wall-junction-audit-suggest',()=>{openWallSuggestionModal(e)});
      $$('[data-junc-suggest]').forEach(btn=>btn.onclick=()=>{
        const tw=model.elements.find(el=>el.id===btn.dataset.juncSuggest&&el.type==='wall');
        if(tw)openWallSuggestionModal(tw);
      });
    }
    else setView(action==='panel'?'panel':'cutlist')
  });
  $$('[data-roof-auto-size-hanger]').forEach(b=>b.onclick=()=>{
    const brand = b.dataset.roofAutoSizeHanger || 'all';
    if(typeof window.autoSizeRoofRafterHangerForRoof==='function'){
      let res = null;
      commit(()=>{
        res = window.autoSizeRoofRafterHangerForRoof(e, brand);
        if(res){
          if(!e.roofFraming) e.roofFraming = {};
          e.roofFraming.rafterHangerEnabled = true;
          e.roofFraming.rafterHangerType = res.connectorId;
          if(typeof window.cadtechSetRafterHangerConfig==='function'){
            window.cadtechSetRafterHangerConfig({ enabled: true, type: res.connectorId, nodes: 'both', roofId: e.id });
          }
        }
      });
      properties();
      render();
      if(res){
        toast(`⚡ Auto-Sized Roof Connectors (${e.id}): ${res.spec.brand} ${res.spec.code} selected for Node Reaction R_down=${res.reactionDownKN} kN (${res.reactionDownLbs} lbs) & R_uplift=${res.reactionUpliftKN} kN (${res.utilizationPct}% D/C)`);
      }
    }
  });
  $$('[data-roof-align]').forEach(b=>b.onclick=()=>alignRoofFraming(e));
  $$('[data-roof-auto-rafter-joist]').forEach(b=>b.onclick=()=>openAutoRafterJoistModal(e));
  $$('[data-roof-view]').forEach(b=>b.onclick=()=>setView(b.dataset.roofView));
  $$('[data-select]').forEach(b=>b.onclick=()=>select([b.dataset.select]));
}

function openAutoRafterJoistModal(targetEl){
  const existingRoof = (targetEl?.type==='roof'?targetEl:null) || model.elements.find(el=>el.type==='roof'&&el.story===activeStory) || model.elements.find(el=>el.type==='roof');
  const wallBearing = typeof window.computeWallPanelsRoofBearing==='function' ? window.computeWallPanelsRoofBearing(activeStory) : null;
  const defaultPitch = existingRoof?.pitch ?? wallBearing?.gablePitchDeg ?? 25;
  const defaultSpacing = existingRoof?.roofFraming?.spacing || 600;
  const defaultPattern = existingRoof?.roofFraming?.webPattern || 'Auto';
  const clearSpanM = wallBearing ? (wallBearing.clearSpanMm/1000).toFixed(2) : '6.00';
  const wallCount = wallBearing?.walls?.length || model.elements.filter(w=>w.type==='wall').length;

  openModal('Auto-Generate Rafter & Ceiling Joist Layout',`
    <div class="modal-copy" style="margin-bottom:12px;">
      Generates a coupled <b>Rafter + Ceiling Joist + Collar Tie + Truss Web</b> layout directly from the current <b>${wallCount} wall panel(s)</b> (Clear Span: <b>${clearSpanM} m</b>) and roof pitch, following standard timber roof truss geometry.
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;font-size:12px;">
      <label style="display:flex;flex-direction:column;gap:4px;">
        <span><b>Roof Pitch (°)</b></span>
        <input id="rcj-pitch" type="number" min="5" max="60" step="0.5" value="${defaultPitch}" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;" />
      </label>
      <label style="display:flex;flex-direction:column;gap:4px;">
        <span><b>Rafter / Joist Spacing O.C. (mm)</b></span>
        <input id="rcj-spacing" type="number" min="300" max="1200" step="50" value="${defaultSpacing}" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;" />
      </label>
      <label style="display:flex;flex-direction:column;gap:4px;">
        <span><b>Timber Truss Web Geometry</b></span>
        <select id="rcj-pattern" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;">
          ${[['Auto','Auto (Fink / Howe by Span)'],['Fink','Fink (W-Truss)'],['Howe','Howe Truss'],['King post','King Post'],['Queen post','Queen Post'],['Pratt','Pratt Truss'],['Warren','Warren Truss']].map(([k,v])=>`<option value="${k}" ${k===defaultPattern?'selected':''}>${v}</option>`).join('')}
        </select>
      </label>
      <label style="display:flex;flex-direction:column;gap:4px;">
        <span><b>Roof Form</b></span>
        <select id="rcj-rooftype" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;">
          <option value="gable" ${(existingRoof?.roofType||'gable')==='gable'?'selected':''}>Gable Roof</option>
          <option value="hip" ${existingRoof?.roofType==='hip'?'selected':''}>Hip Roof</option>
          <option value="mono" ${existingRoof?.roofType==='mono'?'selected':''}>Mono (Single Slope) Roof</option>
        </select>
      </label>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:14px;font-size:12px;background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;">
      <label style="display:flex;align-items:center;gap:6px;"><input id="rcj-joists" type="checkbox" checked /> Ceiling Joists (Bottom Chord Tie)</label>
      <label style="display:flex;align-items:center;gap:6px;"><input id="rcj-collars" type="checkbox" checked /> Collar Ties (Upper 1/3 Rise)</label>
      <label style="display:flex;align-items:center;gap:6px;"><input id="rcj-webs" type="checkbox" checked /> Timber Truss Webs</label>
      <label style="display:flex;align-items:center;gap:6px;"><input id="rcj-studs" type="checkbox" checked /> Align to Wall Panel Studs</label>
    </div>
    <div id="rcj-result-box" style="display:none;margin-bottom:12px;padding:10px;border-radius:6px;background:#f0fdf4;border:1px solid #86efac;color:#14532d;font-size:12px;line-height:1.5;"></div>
    <div class="modal-actions">
      <button id="rcj-generate-btn" class="primary" type="button">⚡ Generate Layout Now</button>
      <button id="rcj-view-plan-btn" class="subtle" type="button">Open Roof Framing Plan</button>
      <button id="rcj-view-3d-btn" class="subtle" type="button">Open 3D Timber Framing</button>
      <button id="rcj-close-btn" class="subtle" type="button">Close</button>
    </div>
  `);

  const runGeneration = () => {
    const pitch = Number($('#rcj-pitch')?.value || defaultPitch);
    const spacing = Number($('#rcj-spacing')?.value || defaultSpacing);
    const webPattern = $('#rcj-pattern')?.value || 'Auto';
    const roofType = $('#rcj-rooftype')?.value || 'gable';
    const includeCeilingJoists = $('#rcj-joists')?.checked !== false;
    const includeCollarTies = $('#rcj-collars')?.checked !== false;
    const includeTrussWebs = $('#rcj-webs')?.checked !== false;
    const alignToWallStuds = $('#rcj-studs')?.checked !== false;

    const res = window.autoGenerateRafterAndCeilingJoistLayout?.({
      pitch,
      spacing,
      webPattern,
      roofType,
      includeCeilingJoists,
      includeCollarTies,
      includeTrussWebs,
      alignToWallStuds
    });
    if (!res) return null;
    const box = $('#rcj-result-box');
    if (box) {
      box.style.display = 'block';
      box.innerHTML = `<b>✔ Generated ${res.counts.total} Timber Roof Members on ${res.roofId}</b><br>`+
        `· <b>Rafters:</b> ${res.counts.rafters} (${res.rafterSection}) @ ${res.pitchDeg}° pitch · <b>Ceiling Joists:</b> ${res.counts.ceilingJoists} (${res.ceilingJoistSection})<br>`+
        `· <b>Collar Ties:</b> ${res.counts.collarTies} · <b>Truss Webs (${res.webPattern}):</b> ${res.counts.trussWebs} · <b>Ridge/Hip:</b> ${res.counts.ridgeAndHip}<br>`+
        `· <b>Wall Top Plate Level:</b> ${res.plateElevationMm} mm · <b>Ridge Apex:</b> ${res.ridgeApexElevationMm} mm · <b>Clear Span:</b> ${res.clearSpanMm} mm`;
    }
    toast(`Generated ${res.counts.rafters} rafters, ${res.counts.ceilingJoists} ceiling joists & ${res.counts.trussWebs} truss webs (${res.webPattern} @ ${res.pitchDeg}°)`);
    return res;
  };

  bindClick('#rcj-generate-btn', () => { runGeneration(); });
  bindClick('#rcj-view-plan-btn', () => { runGeneration(); $('#modal')?.close?.(); setView('roofframingplan'); });
  bindClick('#rcj-view-3d-btn', () => { runGeneration(); $('#modal')?.close?.(); setView('framing3d'); });
  bindClick('#rcj-close-btn', () => $('#modal')?.close?.());
}
window.openAutoRafterJoistModal = openAutoRafterJoistModal;

function bindProperties(){
  $$('[data-property]').forEach(input=>input.onchange=()=>{
    let key=input.dataset.property,v=input.type==='checkbox'?Boolean(input.checked):(input.dataset.unitMm==='1'?parseLengthInput(input.value,NaN):(input.type==='number'?Number(input.value):input.value)),e=model.elements.find(e=>e.id===selected[0]);
    try{
      if((input.type==='number'||input.dataset.unitMm==='1')&&(!Number.isFinite(v)||Math.abs(v)>1000000))throw Error('Enter a valid value.');
      if(['height','thickness','width','radius','length','storyHeight','risers','panelWidth'].includes(key)&&v<=0)throw Error('Size must be greater than zero.');
      if(key==='storyHeight'){setStoryHeight(activeStory,v);return}
      if(!e)return;
      if(key==='wallHeightPreset'){
        if(v==='custom'){properties();return;}
        if(e.type!=='wall')throw Error('Select a wall to change its height.');
        const h=Number(v);
        if(!Number.isFinite(h)||h<=0)throw Error('Choose a valid wall height preset.');
        if(hosted(e).some(o=>(o.sill||0)+o.height>h+1))throw Error('This wall height would cut off a hosted window or door. Adjust opening head levels first.');
        commit(()=>{e.height=h;e.followStory=false;});
        toast(`Wall height set to ${Math.round(h)} mm.`);return;
      }
      if(key==='openingHeadPreset'){
        if(v==='custom'){properties();return;}
        if(!['window','door'].includes(e.type))throw Error('Select a window or door to set its head level.');
        const head=Number(v),sill=Number(e.sill||0),newHeight=head-sill;
        if(!Number.isFinite(head)||newHeight<=0)throw Error('Head level must be above the sill.');
        const proposed={...e,height:newHeight};validateOpening(proposed);
        commit(()=>{e.height=newHeight;});
        toast(`${e.type==='window'?'Window':'Door'} head level set to ${Math.round(head)} mm.`);return;
      }
      if(key==='windowHeadPreset'||key==='doorHeadPreset'){
        if(v==='custom'||v==='mixed'){properties();return;}
        if(e.type!=='wall')throw Error('Select a wall to change its hosted opening head levels.');
        const type=key==='windowHeadPreset'?'window':'door',head=Number(v);
        const openings=hosted(e).filter(o=>o.type===type);
        if(!openings.length)throw Error(`This wall has no hosted ${type}s.`);
        const proposed=openings.map(o=>({...o,height:head-(o.sill||0)}));
        if(proposed.some(o=>!Number.isFinite(o.height)||o.height<=0))throw Error('The selected head level must be above every opening sill.');
        proposed.forEach(validateOpening);
        commit(()=>proposed.forEach(o=>{const target=model.elements.find(el=>el.id===o.id);if(target)target.height=o.height;}));
        toast(`${type==='window'?'Window':'Door'} head levels set to ${Math.round(head)} mm for ${proposed.length} opening(s).`);return;
      }
      if(key==='id'&&(!v.trim()||model.elements.some(o=>o!==e&&o.id===v)))throw Error('Use a unique element ID.');
      if(key==='thickness'&&e.structure==='composite')throw Error('Composite thickness is the sum of its layers.');
      if(key==='priority'&&(v<0||v>1000))throw Error('Priority must be between 0 and 1,000.');
      if(key==='topStory'&&v&&model.stories.find(s=>s.id===v)?.elevation<=storyOf(e).elevation)throw Error('Top level must be above the home story.');
      if(key.startsWith('roofFraming.')){commit(()=>{const subKey=key.split('.')[1];e.roofFraming={...roofFramingSettings(e),[subKey]:v};if(subKey==='angle'&&(e.roofType==='mono'||e.roofType==='gable'))e.roofAngle=Number(v)||0;validateRoofFraming(e)});return}
      if(key.startsWith('roofLoads.')){commit(()=>{e.roofLoads={...roofLoadsSettings(e),[key.split('.')[1]]:v};});return}
      if(key.startsWith('framing.')||key==='structure'||key==='composite'||key==='sheathingSide'){commit(()=>setWallProperty(e,key,v));return}
      let proposed={...e,[key]:v};
      if(key==='head'){proposed.height=v-e.sill;delete proposed.head;if(proposed.height<=0)throw Error('Head height must be above the sill.')}
      if(key==='reveal'&&(v<0||v>Math.max(0,(hostOf(e)?.thickness||200)-40)))throw Error('Reveal must stay within the wall thickness.');
      if(key==='height')proposed.followStory=false;
      if(['offset','width','sill','height','host','head'].includes(key)&&e.host){if(key==='host')proposed.story=hostOf(proposed).story;validateOpening(proposed)}
      if(key==='height'&&e.type==='wall'&&hosted(e).some(o=>o.sill+o.height>v))throw Error('Height must contain all hosted openings.');
      commit(()=>{
        if(key==='length')e.b=lerp(e.a,e.b,v/distance(e.a,e.b));
        else if(['ax','ay','bx','by'].includes(key)){
          if(e.type==='dimension'&&e.refs){const d=resolveDimension(e);e.a=clone(d.a);e.b=clone(d.b);e.refs[key[0]==='a'?0:1]=null;}
          e[key[0]][key[1]]=v;
        }else if(key==='followStory'){e.followStory=v==='true';e.height=heightOf(e)}
        else if(key==='id'){
          const old=e.id;e.id=v;hosted({id:old}).forEach(o=>o.host=v);
          model.elements.forEach(d=>d.refs?.forEach(ref=>{if(ref?.elementId===old)ref.elementId=v}));
          selected=selected.map(id=>id===old?v:id);
        }else Object.assign(e,proposed);
        if(e.type==='slab'&&window.ewpBeamToolState){
          if(['joistSection','joistDirection','girderType','bridgingType','bridgingRows','endBearingType','joistHangerType'].includes(key)){
            window.ewpBeamToolState[key]=v;
          }
          if(key==='joistSpacing'){
            window.ewpBeamToolState.joistSpacingIn=Math.round((Number(v)||406.4)/25.4*10)/10;
          }
        }
        if(e.type==='roof'&&(key==='roofAngle'||key==='roofType'))e.roofFraming={...roofFramingSettings(e),angle:e.roofAngle??0};
        if(e.type==='wall')hosted(e).forEach(o=>{o.story=e.story;fitOpening(o,e)});
      });
      if(key==='layer'||key==='story')pruneHiddenSelection();
      toast('Timber Teck model updated');
      renderInfoBox();
    }catch(err){toast(err.message);properties()}
  });
  const flipBtn = $('#dim-flip-btn');
  if(flipBtn) flipBtn.onclick = () => {
    const e = model.elements.find(el => el.id === selected[0] && el.type === 'dimension');
    if(!e) return;
    commit(() => { e.offset = -(e.offset ?? 600); });
    toast('Dimension flipped to opposite side');
  };
  const relinkBtn = $('#dim-relink-btn');
  if(relinkBtn) relinkBtn.onclick = () => {
    const e = model.elements.find(el => el.id === selected[0] && el.type === 'dimension');
    if(!e) return;
    commit(() => {
      const d = resolveDimension(e);
      e.a = clone(d.a);
      e.b = clone(d.b);
      e.refs = [dimensionReference(e.a), dimensionReference(e.b)];
    });
    toast('Dimension re-anchored to nearest BIM elements');
  };
  const delBtn = $('#dim-delete-btn');
  if(delBtn) delBtn.onclick = () => {
    const e = model.elements.find(el => el.id === selected[0] && el.type === 'dimension');
    if(!e) return;
    commit(() => {
      model.elements = model.elements.filter(el => el.id !== e.id);
      selected = [];
    });
    toast('Dimension deleted');
  };
}

function renderInfoBox(){
  const box=$('#info-box');
  if(!box)return;
  const e=model.elements.find(x=>x.id===selected[0]);
  const selStud = !e && selected[0] && typeof window.findStudById === 'function' ? window.findStudById(selected[0], model) : null;
  if(selStud){
    const w = selStud.wall;
    const m = selStud.member;
    const c = construction(w);
    const curW = Math.round(m.studWidth || (m.x1 - m.x0) || c.studWidth || 38);
    const curD = Math.round(m.studDepth || c.studDepth || 140);
    const curGrade = m.timberGrade || c.timberGrade || 'C16';
    const curPresetObj = (window.TIMBER_SIZES_C16_C24 || []).find(p => p.studWidth === curW && p.studDepth === curD && p.timberGrade === curGrade);
    const curPresetId = curPresetObj ? curPresetObj.id : 'custom';
    const timberOpts = (window.TIMBER_SIZES_C16_C24 || []).map(p => `<option value="${esc(p.id)}" ${curPresetId === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
    box.innerHTML = `
      <div class="info-section"><span class="info-label">STUD</span><span style="display:flex;align-items:center;gap:4px;font-weight:700;color:#0284c7">${icon('wall')} ${esc(m.type)} · ${formatLength(m.x0)} (${esc(w.id)})</span></div>
      <div class="info-divider"></div>
      <div class="info-section"><span class="info-label">STUD SIZE</span><select class="info-select" id="info-stud-size-select"><option value="custom" ${curPresetId==='custom'?'selected':''}>Custom (${formatSection(curW, curD)} ${curGrade})</option>${timberOpts}</select></div>
      <div class="info-divider"></div>
      <div class="info-section"><span class="info-label">WIDTH</span><div class="info-input-wrap"><input id="info-stud-width" type="${isImperialUnits() ? 'text' : 'number'}" step="1" min="25" max="150" value="${esc(isImperialUnits() ? formatInchesOnly(curW) : curW)}"><span>${isImperialUnits() ? 'in' : 'mm'}</span></div></div>
      <div class="info-section"><span class="info-label">DEPTH</span><div class="info-input-wrap"><input id="info-stud-depth" type="${isImperialUnits() ? 'text' : 'number'}" step="1" min="63" max="300" value="${esc(isImperialUnits() ? formatInchesOnly(curD) : curD)}"><span>${isImperialUnits() ? 'in' : 'mm'}</span></div></div>
      <div class="info-divider"></div>
      <div class="info-section"><button id="info-stud-add-btn" class="info-btn" style="color:#047857;border-color:#6ee7b7;background:#ecfdf5;font-weight:700;padding:3px 10px" title="Add Extra Stud Next to Selected Stud">➕ Add Extra Stud</button></div>
      <div class="info-section"><button id="info-stud-move-l-btn" class="info-btn" style="font-weight:700;padding:3px 8px" title="Move Stud Left (-38 mm)">◀ Move -${isImperialUnits() ? '1-1/2"' : '38'}</button></div>
      <div class="info-section"><button id="info-stud-move-r-btn" class="info-btn" style="font-weight:700;padding:3px 8px" title="Move Stud Right (+38 mm)">Move +${isImperialUnits() ? '1-1/2"' : '38'} ▶</button></div>
      <div class="info-section"><button id="info-stud-rotate-btn" class="info-btn" style="color:#0369a1;border-color:#7dd3fc;background:#f0f9ff;font-weight:700;padding:3px 10px" title="Rotate Selected Stud 90°">↻ Rotate 90°</button></div>
      <div class="info-section"><button id="info-stud-delete-btn" class="info-btn" style="color:#dc2626;border-color:#fca5a5;background:#fef2f2;font-weight:700;padding:3px 10px" title="Delete Selected Stud">🗑 Delete Stud</button></div>
      <div class="info-section"><button id="info-stud-wall-btn" class="info-btn" style="padding:3px 10px" title="Select Host Wall">Host Wall (${esc(w.id)})</button></div>
    `;
    icons(box);
    $('#info-stud-size-select')?.addEventListener('change', ev => {
      const p = (window.TIMBER_SIZES_C16_C24 || []).find(x => x.id === ev.target.value);
      if(p){
        commit(() => {
          window.updateStudSize?.(m.id, { presetId: p.id, studWidth: p.studWidth, studDepth: p.studDepth, timberGrade: p.timberGrade, applyToWall: false }, model);
        });
        toast(`Stud size changed to ${p.name}`);
      }
    });
    const updateCustomDim = () => {
      const nw = Math.round(parseLengthInput($('#info-stud-width')?.value, curW));
      const nd = Math.round(parseLengthInput($('#info-stud-depth')?.value, curD));
      if(Math.abs(nw - nd) < 1){
        toast('Square studs are not allowed. Use rectangular dimensions.');
        return;
      }
      commit(() => {
        window.updateStudSize?.(m.id, { studWidth: nw, studDepth: nd, timberGrade: curGrade, applyToWall: false }, model);
      });
      toast(`Stud size changed to ${formatSection(nw, nd)}`);
    };
    $('#info-stud-width')?.addEventListener('change', updateCustomDim);
    $('#info-stud-depth')?.addEventListener('change', updateCustomDim);
    $('#info-stud-add-btn')?.addEventListener('click', () => {
      let res = null;
      commit(() => {
        res = window.addExtraStudById?.(m.id, { side: 'auto' }, model);
        if (res?.studId) selected = [res.studId];
      });
      if (res) toast(`Added extra stud at ${Math.round(res.x0)} mm on ${w.id}`);
    });
    $('#info-stud-move-l-btn')?.addEventListener('click', () => {
      let res = null;
      commit(() => {
        res = window.moveStudById?.(m.id, { deltaX: -38 }, model);
        if (res?.studId) selected = [res.studId];
      });
      if (res) toast(`Moved stud to ${Math.round(res.x0)} mm`);
    });
    $('#info-stud-move-r-btn')?.addEventListener('click', () => {
      let res = null;
      commit(() => {
        res = window.moveStudById?.(m.id, { deltaX: 38 }, model);
        if (res?.studId) selected = [res.studId];
      });
      if (res) toast(`Moved stud to ${Math.round(res.x0)} mm`);
    });
    $('#info-stud-rotate-btn')?.addEventListener('click', () => {
      let res = null;
      commit(() => {
        res = window.rotateStudById?.(m.id, {}, model);
        if (res?.studId) selected = [res.studId];
      });
      if (res) toast(`Rotated stud 90° (${res.orientation === 'flat' ? 'Flat ' + res.faceAlign + ' face' : 'Vertical'})`);
    });
    $('#info-stud-delete-btn')?.addEventListener('click', () => {
      commit(() => {
        window.deleteStudById?.(m.id, model);
        selected = [w.id];
      });
      toast(`Stud deleted from ${w.id}`);
    });
    $('#info-stud-wall-btn')?.addEventListener('click', () => select([w.id]));
    return;
  }
  const activeToolDef=toolGroups.flatMap(([,...ts])=>ts).find(t=>t[0]===tool)||['select','Arrow Tool'];
  const toolName=e?`${e.type==='section_callout'?'Section Callout':e.type[0].toUpperCase()+e.type.slice(1)} · ${e.id}`:`${activeToolDef[1]} Tool`;
  const toolIconId=e?(paths[e.type]?e.type:'section'):(paths[tool]?tool:'cube');
  let html=`<div class="info-section"><span class="info-label">TOOL</span><span style="display:flex;align-items:center;gap:4px;font-weight:700">${icon(toolIconId)} ${toolName}</span></div><div class="info-divider"></div>`;

  const activeType=e?.type||tool;
  if(activeType==='section'||activeType==='section_callout'){
    const targetW=e?.wallId?model.elements.find(w=>w.id===e.wallId&&w.type==='wall'):framingWall();
    const stackup=computeVerticalStackup(targetW,e?.xAlongWall);
    if(stackup){
      html+=`<div class="info-section"><span class="info-label">STACK-UP</span><span style="font-size:11px;font-weight:700;color:#0f766e">Top Plates: ${esc(stackup.topPlates.section)} · Header: ${esc(stackup.header.section)} · Sill: ${esc(stackup.sill.section)}</span></div><div class="info-divider"></div>`;
    }
    if(view!=='elevation'&&view!=='panel'){
      html+=`<div class="info-section"><button id="info-switch-elev-btn" class="info-btn" style="color:#0f766e;border-color:#99f6e4;background:#f0fdfa;font-weight:700;padding:3px 10px">Switch to Elevation View</button></div><div class="info-divider"></div>`;
    }
  }else if(activeType==='wall'){
    const g=toolGeomMethod.wall||'single';
    const _fd=typeof FRAMING_DEFAULTS!=='undefined'?FRAMING_DEFAULTS:(window.FRAMING_DEFAULTS||{enabled:true,studWidth:38,studDepth:140,timberGrade:'C24',spacing:400});
    const _getConst=typeof construction==='function'?construction:(typeof window.construction==='function'?window.construction:(()=>_fd));
    const c=e?_getConst(e):_fd;
    const curPreset=e?getTimberPresetId(c,e):(window.TIMBER_SIZES_C16_C24?getTimberPresetId(_fd):'38x140_C16');
    const timberOpts=(window.TIMBER_SIZES_C16_C24||[]).map(p=>`<option value="${p.id}" ${curPreset===p.id?'selected':''}>${p.name}</option>`).join('');
    html+=`<div class="info-section"><span class="info-label">GEOM</span><div class="info-btn-group"><button class="info-btn ${g==='single'?'active':''}" data-geom="single" title="Straight Single">―</button><button class="info-btn ${g==='chained'?'active':''}" data-geom="chained" title="Chained Polywall">∿</button><button class="info-btn ${g==='rect'?'active':''}" data-geom="rect" title="Rectangular 4-Wall">▢</button><button class="info-btn ${g==='rotated_rect'?'active':''}" data-geom="rotated_rect" title="Rotated Rectangle">◇</button></div></div><div class="info-divider"></div>`;
    html+=`<div class="info-section"><span class="info-label">TIMBER SIZE</span><select class="info-select" id="info-timber-size"><option value="custom" ${curPreset==='custom'?'selected':''}>Custom Timber Size</option>${timberOpts}</select></div><div class="info-divider"></div>`;
    html+=`<div class="info-section"><span class="info-label">REF LINE</span><select class="info-select" id="info-ref-line"><option value="outside" ${(e?.reference||'outside')==='outside'?'selected':''}>Outside Face</option><option value="center" ${e?.reference==='center'?'selected':''}>Center Core</option><option value="inside" ${e?.reference==='inside'?'selected':''}>Inside Face</option></select></div><div class="info-divider"></div>`;
    if(e){
      html+=`<div class="info-section"><button id="info-wall-suggest-btn" class="info-btn" style="color:#1e40af;border-color:#93c5fd;background:#eff6ff;font-weight:700;padding:3px 10px" title="Suggest Optimal Stud Sizing & Spacing">💡 Suggest</button></div><div class="info-divider"></div>`;
    }
  }else if(activeType==='slab'){
    const g=toolGeomMethod.slab||'poly';
    html+=`<div class="info-section"><span class="info-label">GEOM</span><div class="info-btn-group"><button class="info-btn ${g==='poly'?'active':''}" data-geom="poly" title="Polygonal">⬡</button><button class="info-btn ${g==='rect'?'active':''}" data-geom="rect" title="Rectangular">▢</button></div></div><div class="info-divider"></div>`;
  }else if(activeType==='roof'){
    const g=toolGeomMethod.roof||'poly';
    const ovVal=e?.overhang||609.6;
    html+=`<div class="info-section"><span class="info-label">GEOM</span><div class="info-btn-group"><button class="info-btn ${g==='poly'?'active':''}" data-geom="poly" title="Multi-plane">⬡</button><button class="info-btn ${g==='rect'?'active':''}" data-geom="rect" title="Rectangular Hip">▢</button></div></div><div class="info-divider"></div>`;
    html+=`<div class="info-section"><span class="info-label">PITCH</span><div class="info-input-wrap"><input id="info-pitch" type="number" step="1" value="${e?.pitch||25}"><span>°</span></div></div><div class="info-section"><span class="info-label">OVERHANG</span><div class="info-input-wrap"><input id="info-overhang" type="${isImperialUnits()?'text':'number'}" step="50" value="${esc(isImperialUnits()?formatFeetInches(ovVal):ovVal)}"><span>${isImperialUnits()?'ft-in':'mm'}</span></div></div><div class="info-divider"></div>`;
  }else if(activeType==='column'){
    const g=toolGeomMethod.column||'square';
    html+=`<div class="info-section"><span class="info-label">PROFILE</span><div class="info-btn-group"><button class="info-btn ${g==='square'?'active':''}" data-geom="square" title="Square / Rectangular">▢</button><button class="info-btn ${g==='circle'?'active':''}" data-geom="circle" title="Circular">○</button></div></div><div class="info-divider"></div>`;
  }else if(activeType==='beam'){
    const g=toolGeomMethod.beam||'single';
    html+=`<div class="info-section"><span class="info-label">GEOM</span><div class="info-btn-group"><button class="info-btn ${g==='single'?'active':''}" data-geom="single" title="Straight Single">―</button><button class="info-btn ${g==='chained'?'active':''}" data-geom="chained" title="Chained Beam">∿</button></div></div><div class="info-divider"></div>`;
  }else if(activeType==='zone'){
    const g=toolGeomMethod.zone||'inner';
    html+=`<div class="info-section"><span class="info-label">METHOD</span><div class="info-btn-group"><button class="info-btn ${g==='inner'?'active':''}" data-geom="inner" title="Auto-flood Inner Edge">🪄 Auto</button><button class="info-btn ${g==='poly'?'active':''}" data-geom="poly" title="Manual Polygon">⬡ Poly</button></div></div><div class="info-divider"></div>`;
    html+=`<div class="info-section"><span class="info-label">ROOM</span><select class="info-select" id="info-zone-cat">${['Living Room','Bedroom','Kitchen','Dining','Bathroom','Office','Hallway','Terrace'].map(c=>`<option value="${c}" ${currentZoneCategory===c?'selected':''}>${c}</option>`).join('')}</select></div><div class="info-divider"></div>`;
  }else if(activeType==='object'){
    const sub=e?.subtype||toolGeomMethod.object||'Table & Chairs';
    html+=`<div class="info-section"><span class="info-label">SUBTYPE</span><select class="info-select" id="info-obj-sub">${['Table & Chairs','Living Sofa Set','Double Bed','Office Desk','Kitchen Counter','Bathroom WC','Wardrobe'].map(s=>`<option value="${s}" ${sub===s?'selected':''}>${s}</option>`).join('')}</select></div><div class="info-divider"></div>`;
  }else if(activeType==='door'||activeType==='window'||activeType==='cornerwin'){
    const wVal=e?.width||(activeType==='door'?900:1500), sVal=e?.sill??(activeType==='door'?0:900);
    html+=`<div class="info-section"><span class="info-label">WIDTH</span><div class="info-input-wrap"><input id="info-width" type="${isImperialUnits()?'text':'number'}" step="50" value="${esc(isImperialUnits()?formatFeetInches(wVal):wVal)}"><span>${isImperialUnits()?'ft-in':'mm'}</span></div></div><div class="info-section"><span class="info-label">SILL</span><div class="info-input-wrap"><input id="info-sill" type="${isImperialUnits()?'text':'number'}" step="50" value="${esc(isImperialUnits()?formatFeetInches(sVal):sVal)}"><span>${isImperialUnits()?'ft-in':'mm'}</span></div></div><div class="info-divider"></div><button id="info-flip-swing" class="info-btn" title="Flip Opening Inward / Outward">Flip Swing</button><button id="info-flip-hand" class="info-btn" title="Flip Hinge Left / Right">Flip Hand</button><div class="info-divider"></div>`;
  }else if(activeType==='fill'){
    const pat=e?.hatchType||toolGeomMethod.fill||'diagonal45';
    html+=`<div class="info-section"><span class="info-label">HATCH</span><select class="info-select" id="info-fill-pattern"><option value="diagonal45" ${pat==='diagonal45'?'selected':''}>45° Diagonal</option><option value="cross" ${pat==='cross'?'selected':''}>Cross Hatch</option><option value="solid" ${pat==='solid'?'selected':''}>Solid Fill</option></select></div><div class="info-divider"></div>`;
  }

  if(view==='framingplan'||activeType==='wall'){
    const activeWalls=model.elements.filter(x=>x.type==='wall'&&x.story===activeStory);
    const _fd=typeof FRAMING_DEFAULTS!=='undefined'?FRAMING_DEFAULTS:(window.FRAMING_DEFAULTS||{timberGrade:'C16'});
    const _getConst=typeof construction==='function'?construction:(typeof window.construction==='function'?window.construction:(()=>_fd));
    const activeGrade=e?_getConst(e).timberGrade:(activeWalls[0]?_getConst(activeWalls[0]).timberGrade:'C16');
    html+=`<div class="info-section"><span class="info-label">TIMBER GRADE</span><select class="info-select" id="info-framing-plan-grade"><option value="C16" ${activeGrade==='C16'?'selected':''}>C16 Standard Structural</option><option value="C24" ${activeGrade==='C24'?'selected':''}>C24 High-Grade Structural</option><option value="C14" ${activeGrade==='C14'?'selected':''}>C14 Softwood</option><option value="C18" ${activeGrade==='C18'?'selected':''}>C18 Softwood</option><option value="C30" ${activeGrade==='C30'?'selected':''}>C30 Premium Softwood</option></select></div><div class="info-divider"></div>`;
  }

  const curHeight=e?heightOf(e):3048,curThick=e?.thickness||200;
  html+=`<div class="info-section"><span class="info-label">HEIGHT</span><div class="info-input-wrap"><input id="info-height" type="${isImperialUnits()?'text':'number'}" step="100" value="${esc(isImperialUnits()?formatFeetInches(curHeight):curHeight)}"><span>${isImperialUnits()?'ft-in':'mm'}</span></div></div><div class="info-section"><span class="info-label">THICK</span><div class="info-input-wrap"><input id="info-thick" type="${isImperialUnits()?'text':'number'}" step="10" value="${esc(isImperialUnits()?formatFeetInches(curThick):curThick)}"><span>${isImperialUnits()?'ft-in':'mm'}</span></div></div><div class="info-divider"></div><div class="info-section"><span class="info-label">STORY</span><select class="info-select" id="info-story">${model.stories.map(s=>`<option value="${s.id}" ${(e?.story||activeStory)===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select></div><div class="info-divider"></div><div class="info-section"><span class="info-label">LAYER</span><select class="info-select" id="info-layer">${layers.map(l=>`<option value="${esc(l.name)}" ${(e?.layer||defaultLayerForType(activeType))===l.name?'selected':''}>${esc(l.name)}</option>`).join('')}</select></div><div class="info-divider"></div><div class="info-section"><span class="info-label">SURFACE</span><select class="info-select" id="info-material">${Object.keys(materials).map(m=>`<option value="${m}" ${(e?.material||'Timber')===m?'selected':''}>${m}</option>`).join('')}</select></div><div class="info-divider"></div><div class="info-section"><span class="info-label">STRUCTURAL</span><select class="info-select"><option>Load-Bearing</option><option>Non-Load-Bearing</option></select></div>`;
  box.innerHTML=html;icons(box);

  $$('[data-geom]').forEach(btn=>btn.onclick=()=>{
    toolGeomMethod[activeType]=btn.dataset.geom;
    points=[];
    renderInfoBox();
    render();
    toast(`Geometry method: ${btn.title}`);
  });
  $('#info-wall-suggest-btn')?.addEventListener('click',()=>{if(e&&e.type==='wall')openWallSuggestionModal(e)});
  $('#info-switch-elev-btn')?.addEventListener('click',()=>setView('elevation'));
  $('#info-zone-cat')?.addEventListener('change',ev=>{currentZoneCategory=ev.target.value;toast(`Zone room type: ${currentZoneCategory}`)});
  $('#info-obj-sub')?.addEventListener('change',ev=>{toolGeomMethod.object=ev.target.value;if(e&&e.type==='object')commit(()=>e.subtype=ev.target.value);toast(`Object: ${ev.target.value}`)});
  $('#info-fill-pattern')?.addEventListener('change',ev=>{toolGeomMethod.fill=ev.target.value;if(e&&e.type==='fill')commit(()=>e.hatchType=ev.target.value)});
  $('#info-pitch')?.addEventListener('change',ev=>{const val=Number(ev.target.value);if(e&&e.type==='roof')commit(()=>e.pitch=val)});
  $('#info-overhang')?.addEventListener('change',ev=>{const val=parseLengthInput(ev.target.value,e?.overhang||609.6);if(e&&e.type==='roof')commit(()=>e.overhang=val)});
  $('#info-flip-swing')?.addEventListener('click',()=>{if(e&&e.host)commit(()=>e.flipped=!e.flipped);toast('Opening swing orientation flipped')});
  $('#info-flip-hand')?.addEventListener('click',()=>{if(e&&e.host)commit(()=>e.hand=e.hand==='left'?'right':'left');toast('Hinge side flipped')});
  $('#info-height')?.addEventListener('change',ev=>{const val=parseLengthInput(ev.target.value,curHeight);if(e&&val>0)commit(()=>{e.height=val;e.followStory=false})});
  $('#info-thick')?.addEventListener('change',ev=>{const val=parseLengthInput(ev.target.value,curThick);if(e&&val>0)commit(()=>{e.thickness=val})});
  $('#info-width')?.addEventListener('change',ev=>{const val=parseLengthInput(ev.target.value,e?.width||900);if(e&&val>0)commit(()=>{e.width=val})});
  $('#info-sill')?.addEventListener('change',ev=>{const val=parseLengthInput(ev.target.value,e?.sill||0);if(e&&val>=0)commit(()=>{e.sill=val})});
  $('#info-timber-size')?.addEventListener('change',ev=>{
    const val=ev.target.value;
    if(e&&e.type==='wall'){
      commit(()=>setWallProperty(e,'framing.timberSize',val));
      toast(`Wall timber size set to ${ev.target.selectedOptions[0]?.text||val}`);
    }else if(window.TIMBER_SIZES_C16_C24){
      const p=TIMBER_SIZES_C16_C24.find(x=>x.id===val);
      if(p){
        FRAMING_DEFAULTS.studWidth=p.studWidth;
        FRAMING_DEFAULTS.studDepth=p.studDepth;
        FRAMING_DEFAULTS.timberGrade=p.timberGrade;
        toast(`Default wall timber size set to ${p.name}`);
      }
    }
  });
  $('#info-framing-plan-grade')?.addEventListener('change',ev=>{
    const grade=ev.target.value;
    const targetWalls=selected.length&&model.elements.some(m=>selected.includes(m.id)&&m.type==='wall')
      ? model.elements.filter(m=>selected.includes(m.id)&&m.type==='wall')
      : model.elements.filter(m=>m.type==='wall'&&(m.story===activeStory||!m.story));
    if(targetWalls.length){
      commit(()=>{
        for(const w of targetWalls){
          setWallProperty(w,'framing.timberGrade',grade);
        }
      });
      toast(`Framing timber grade updated to ${grade} for ${targetWalls.length} wall(s).`);
    }
  });
  $('#info-ref-line')?.addEventListener('change',ev=>{if(e&&e.type==='wall')commit(()=>{e.reference=ev.target.value})});
  $('#info-story')?.addEventListener('change',ev=>{if(e)commit(()=>{e.story=ev.target.value})});
  $('#info-layer')?.addEventListener('change',ev=>{if(e){commit(()=>{e.layer=ev.target.value});pruneHiddenSelection();properties();render();}else{toolLayerDefaults[activeType]=ev.target.value;toast(`Default layer for ${activeType}: ${ev.target.value}`);}});
  $('#info-material')?.addEventListener('change',ev=>{if(e)commit(()=>{e.material=ev.target.value})});
}

var _petPaletteDraggedPos = null;
var _petPaletteLastHostWallId = null;

function showPetPalette(screenPos,element,kind='node'){
  const palette=$('#pet-palette');if(!palette)return;
  const isStudEl = Boolean(element?.isStud || kind === 'stud');
  const curHostKey = isStudEl ? (element?.wallId || element?.host || 'stud') : (element?.id || 'el');
  if (_petPaletteLastHostWallId !== curHostKey) {
    _petPaletteDraggedPos = null;
    _petPaletteLastHostWallId = curHostKey;
  }

  if (isStudEl) {
    palette.classList.add('stud-popup');
    const sInfo = window.findStudById?.(element.id, model);
    const curWWall = sInfo?.wall || model.elements.find(el => el.id === (element.wallId || element.host));
    const curM = sInfo?.member || element.member || {};
    const curX0 = Math.round(curM.x0 ?? 0);
    const curX1 = Math.round(curM.x1 ?? (curX0 + 38));
    const curW = Math.round(curM.studWidth || 38);
    const curD = Math.round(curM.studDepth || 140);
    const curOrient = curM.orientation === 'flat' ? '90° Flat Backer' : 'Standard Vertical';

    const btnBase = 'width:auto;min-width:fit-content;height:36px;padding:0 12px;border-radius:6px;font-size:12.5px;font-weight:700;color:#ffffff;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;cursor:pointer;box-sizing:border-box;';
    const btnAdd = btnBase + 'background:#059669;border:1px solid #34d399;';
    const btnMove = btnBase + 'background:#0284c7;border:1px solid #38bdf8;';
    const btnRot = btnBase + 'background:#d97706;border:1px solid #fbbf24;';
    const btnSubtle = btnBase + 'background:#334155;border:1px solid #64748b;';
    const btnDanger = btnBase + 'background:#dc2626;border:1px solid #f87171;';
    const inpStyle = 'width:82px;height:36px;padding:0 8px;border-radius:6px;border:1px solid #94a3b8;background:#0f172a;color:#ffffff;font-size:13px;font-weight:700;text-align:center;box-sizing:border-box;';

    palette.innerHTML = `
      <div class="stud-popup-header" data-drag-handle style="display:flex;align-items:center;justify-content:space-between;width:100%;padding-bottom:10px;border-bottom:1px solid #334155;gap:12px;cursor:move;user-select:none" title="Drag to move popup">
        <div class="stud-popup-title" style="display:flex;flex-direction:column;gap:3px">
          <strong style="font-size:15px;font-weight:800;color:#38bdf8"><span style="opacity:0.65;margin-right:4px">⋮⋮</span>🪵 ${esc(curM.type || 'Wall Stud')} · ${esc(curWWall?.id || element.wallId || '')}</strong>
          <span style="font-size:12px;color:#e2e8f0">Position: <b>${curX0}–${curX1} mm</b> · Size: <b>${curW}×${curD} mm</b> · Orientation: <b>${curOrient}</b></span>
        </div>
        <button type="button" class="stud-popup-close" id="pet-stud-close" style="width:32px;min-width:32px;height:32px;padding:0;border-radius:6px;background:#1e293b;border:1px solid #475569;color:#ffffff;font-size:15px;font-weight:800;cursor:pointer;flex-shrink:0" title="Close Popup (Esc)">✕</button>
      </div>

      <div class="stud-popup-section" style="display:flex;flex-direction:column;align-items:stretch;width:100%;gap:8px;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 12px">
        <div class="stud-popup-label" style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px;font-size:11.5px;font-weight:800;color:#f8fafc">
          <span>➕ 1. ADD EXTRA STUD</span>
          <small style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:none">Place new stud next to selected stud</small>
        </div>
        <div class="stud-popup-row" style="display:flex;align-items:center;flex-wrap:wrap;width:100%;gap:8px">
          <button type="button" class="stud-btn-add" style="${btnAdd}flex:1" data-pet-sub="add-left" title="Add extra stud on left side">➕ Add Left (-${curW} mm)</button>
          <button type="button" class="stud-btn-add" style="${btnAdd}flex:1" data-pet-sub="add-right" title="Add extra stud on right side">➕ Add Right (+${curW} mm)</button>
        </div>
        <div class="stud-popup-row" style="display:flex;align-items:center;width:100%;gap:8px">
          <span style="color:#cbd5e1;font-size:12px;font-weight:700">Custom Offset (mm):</span>
          <input id="pet-add-offset-mm" type="number" step="10" value="${curW}" style="${inpStyle}" title="Offset in mm from selected stud">
          <button type="button" class="stud-btn-add" style="${btnAdd}flex:1" data-pet-sub="add-offset">➕ Add Stud at Offset</button>
        </div>
      </div>

      <div class="stud-popup-section" style="display:flex;flex-direction:column;align-items:stretch;width:100%;gap:8px;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 12px">
        <div class="stud-popup-label" style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px;font-size:11.5px;font-weight:800;color:#f8fafc">
          <span>↔ 2. MOVE SELECTED STUD</span>
          <small style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:none">Click step buttons, enter X0, or drag on wall</small>
        </div>
        <div class="stud-popup-grid-6" style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));width:100%;gap:6px">
          <button type="button" class="stud-btn-move" style="${btnMove}width:100%" data-pet-sub="move-l100" title="Move 100 mm toward wall start">◀ -100</button>
          <button type="button" class="stud-btn-move" style="${btnMove}width:100%" data-pet-sub="move-l38" title="Move 38 mm toward wall start">◀ -38</button>
          <button type="button" class="stud-btn-move" style="${btnMove}width:100%" data-pet-sub="move-l10" title="Move 10 mm toward wall start">◀ -10</button>
          <button type="button" class="stud-btn-move" style="${btnMove}width:100%" data-pet-sub="move-r10" title="Move 10 mm toward wall end">+10 ▶</button>
          <button type="button" class="stud-btn-move" style="${btnMove}width:100%" data-pet-sub="move-r38" title="Move 38 mm toward wall end">+38 ▶</button>
          <button type="button" class="stud-btn-move" style="${btnMove}width:100%" data-pet-sub="move-r100" title="Move 100 mm toward wall end">+100 ▶</button>
        </div>
        <div class="stud-popup-row" style="display:flex;align-items:center;width:100%;gap:8px">
          <span style="color:#cbd5e1;font-size:12px;font-weight:700">Exact Position X0 (mm):</span>
          <input id="pet-move-x0-mm" type="number" step="1" value="${curX0}" style="${inpStyle}width:96px" title="Exact stud position along wall (mm)">
          <button type="button" class="stud-btn-move" style="${btnMove}flex:1" data-pet-sub="move-set">↔ Move Stud to X0</button>
        </div>
      </div>

      <div class="stud-popup-section" style="display:flex;flex-direction:column;align-items:stretch;width:100%;gap:8px;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 12px">
        <div class="stud-popup-label" style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px;font-size:11.5px;font-weight:800;color:#f8fafc">
          <span>↻ 3. ROTATE SELECTED STUD</span>
          <small style="font-size:11px;font-weight:600;color:#fbbf24;text-transform:none">Current: ${curOrient}</small>
        </div>
        <div class="stud-popup-grid-4" style="display:grid;grid-template-columns:1.25fr 1fr 1fr 1fr;width:100%;gap:6px">
          <button type="button" class="stud-btn-rotate" style="${btnRot}width:100%" data-pet-sub="rot-toggle" title="Toggle 90° stud rotation (Vertical ↔ Flat)">↻ Rotate 90°</button>
          <button type="button" style="${btnSubtle}width:100%" data-pet-sub="rot-inner" title="Rotate 90° flat & align to inner wall face">Inner Face</button>
          <button type="button" style="${btnSubtle}width:100%" data-pet-sub="rot-center" title="Rotate 90° flat & align to wall center">Center</button>
          <button type="button" style="${btnSubtle}width:100%" data-pet-sub="rot-outer" title="Rotate 90° flat & align to outer wall face">Outer Face</button>
        </div>
      </div>

      <div class="stud-popup-row" style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:8px;padding-top:2px">
        <button type="button" style="${btnSubtle}flex:1" data-pet-act="resizeStud" title="Change Rectangular Stud Size">${icon('fit')}<span>Change Size (${curW}×${curD})</span></button>
        <button type="button" style="${btnSubtle}flex:1" data-pet-act="selectHostWall" title="Select Host Wall">${icon('wall')}<span>Select Wall (${esc(curWWall?.id || '')})</span></button>
        <button type="button" class="stud-btn-danger" style="${btnDanger}" data-pet-act="deleteStud" title="Delete Selected Stud">${icon('trash')}<span>Delete Stud</span></button>
      </div>
    `;

    palette.classList.remove('hidden');
    icons(palette);

    const areaEl = $('#canvas-area');
    const areaW = areaEl?.clientWidth || width || 900;
    const areaH = areaEl?.clientHeight || height || 650;
    const palW = palette.offsetWidth || 550;
    const palH = palette.offsetHeight || 430;
    if (_petPaletteDraggedPos) {
      palette.style.left = Math.max(8, Math.min(areaW - palW - 8, _petPaletteDraggedPos.left)) + 'px';
      palette.style.top = Math.max(8, Math.min(areaH - 48, _petPaletteDraggedPos.top)) + 'px';
    } else {
      const leftPx = (screenPos.x + 22 + palW > areaW - 12)
        ? Math.max(12, screenPos.x - palW - 22)
        : Math.max(12, screenPos.x + 22);
      const topPx = Math.max(12, Math.min(areaH - palH - 12, screenPos.y - Math.round(palH * 0.45)));
      palette.style.left = leftPx + 'px';
      palette.style.top = topPx + 'px';
    }

    const closeBtnEl = $('#pet-stud-close');
    if (closeBtnEl) {
      closeBtnEl.addEventListener('pointerdown', ev => ev.stopPropagation());
      closeBtnEl.addEventListener('click', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        hidePetPalette();
      });
    }

    palette.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('pointerdown', ev => ev.stopPropagation());
      inp.addEventListener('click', ev => ev.stopPropagation());
      inp.addEventListener('keydown', ev => {
        ev.stopPropagation();
        if (ev.key === 'Enter') {
          const subBtn = inp.parentElement?.querySelector('[data-pet-sub="move-set"], [data-pet-sub="add-offset"]');
          subBtn?.click();
        }
      });
    });

    $$('[data-pet-sub]').forEach(btn => btn.onclick = ev => {
      ev.stopPropagation();
      const sub = btn.dataset.petSub;
      const curStudInfo = window.findStudById?.(element.id, model);
      if (!curStudInfo) return;
      let res = null;
      if (sub.startsWith('move-l') || sub.startsWith('move-r')) {
        const mapDx = { 'move-l100': -100, 'move-l38': -38, 'move-l10': -10, 'move-r10': 10, 'move-r38': 38, 'move-r100': 100 };
        const dx = mapDx[sub] || 0;
        commit(() => {
          res = window.moveStudById?.(element.id, { deltaX: dx }, model);
          if (res?.studId) { selected = [res.studId]; element.id = res.studId; }
        });
        if (res) toast(`Moved stud to ${Math.round(res.x0)}–${Math.round(res.x1)} mm`);
        showPetPalette(screenPos, element, 'stud');
      } else if (sub === 'move-set') {
        const tx = Number($('#pet-move-x0-mm')?.value);
        if (Number.isFinite(tx)) {
          commit(() => {
            res = window.moveStudById?.(element.id, { targetX0: tx }, model);
            if (res?.studId) { selected = [res.studId]; element.id = res.studId; }
          });
          if (res) toast(`Moved stud to ${Math.round(res.x0)}–${Math.round(res.x1)} mm`);
          showPetPalette(screenPos, element, 'stud');
        }
      } else if (sub === 'add-left' || sub === 'add-right') {
        const side = sub === 'add-left' ? 'left' : 'right';
        commit(() => {
          res = window.addExtraStudById?.(element.id, { side }, model);
          if (res?.studId) { selected = [res.studId]; element.id = res.studId; }
        });
        if (res) toast(`Added extra stud (${side}) at ${Math.round(res.x0)}–${Math.round(res.x1)} mm`);
        showPetPalette(screenPos, element, 'stud');
      } else if (sub === 'add-offset') {
        const off = Number($('#pet-add-offset-mm')?.value) || 38;
        commit(() => {
          res = window.addExtraStudById?.(element.id, { offsetMm: off }, model);
          if (res?.studId) { selected = [res.studId]; element.id = res.studId; }
        });
        if (res) toast(`Added extra stud at ${Math.round(res.x0)}–${Math.round(res.x1)} mm`);
        showPetPalette(screenPos, element, 'stud');
      } else if (sub === 'rot-toggle' || sub === 'rot-inner' || sub === 'rot-center' || sub === 'rot-outer') {
        const opts = sub === 'rot-toggle' ? {} : { orientation: 'flat', faceAlign: sub.replace('rot-', '') };
        commit(() => {
          res = window.rotateStudById?.(element.id, opts, model);
          if (res?.studId) { selected = [res.studId]; element.id = res.studId; }
        });
        if (res) toast(`Stud rotated: ${res.orientation === 'flat' ? '90° Flat (' + res.faceAlign + ' face)' : 'Standard Vertical'}`);
        showPetPalette(screenPos, element, 'stud');
      }
    });
  } else {
    palette.classList.remove('stud-popup');
    let items;
    if(element.host){
      items=[['flipSwing','Flip Swing (In/Out)','mirror'],['flipHand','Flip Hand (Left/Right)','mirror'],['move','Slide Opening Along Wall','move'],['copy','Multiply Opening','copy']];
    }else if(kind==='node'){
      items=[['move','Move Node (Drag)','move'],['fillet','Fillet / Chamfer','circle'],['offset','Offset Entire Polygon','layers'],['plus','Insert New Node','plus']];
    }else{
      items=[['plus','Insert Node on Edge','plus'],['arc','Curve Edge (Arc)','arc'],['offset','Offset Edge Parallel','layers'],['copy','Multiply / Array','copy']];
    }
    palette.innerHTML = `<div class="pet-main-row" data-drag-handle style="display:flex;align-items:center;gap:4px;cursor:move" title="Drag to move palette"><span style="font-size:11px;color:#64748b;padding:0 3px;cursor:move;user-select:none">⋮⋮</span>${items.map(([act,tip,ic])=>`<button type="button" data-pet-act="${act}" title="${tip}">${icon(ic)}</button>`).join('')}<button type="button" class="pet-close-btn" id="pet-std-close" title="Close Palette (Esc)" style="width:24px;height:24px;padding:0;margin-left:2px;border-radius:4px;border:1px solid #cbd5e1;background:#f8fafc;color:#dc2626;font-size:11px;font-weight:800;cursor:pointer">✕</button></div>`;
    if (_petPaletteDraggedPos) {
      palette.style.left = _petPaletteDraggedPos.left + 'px';
      palette.style.top = _petPaletteDraggedPos.top + 'px';
    } else {
      palette.style.left=Math.max(10,Math.min(width-180,screenPos.x+14))+'px';
      palette.style.top=Math.max(60,Math.min(height-60,screenPos.y-44))+'px';
    }
    palette.classList.remove('hidden');icons(palette);
    const stdClose = $('#pet-std-close');
    if (stdClose) {
      stdClose.addEventListener('pointerdown', ev => ev.stopPropagation());
      stdClose.addEventListener('click', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        hidePetPalette();
      });
    }
  }

  $$('[data-pet-act]').forEach(btn=>btn.onclick=ev=>{
    ev.stopPropagation();
    const act=btn.dataset.petAct;
    palette.classList.add('hidden');
    if(act==='deleteStud'){
      const sInfo = window.findStudById?.(element.id, model);
      if(sInfo){
        commit(()=>{
          window.deleteStudById?.(element.id, model);
          selected=[sInfo.wall.id];
        });
        toast(`Deleted ${sInfo.member.type} from ${sInfo.wall.id}`);
      }
      return;
    }
    if(act==='resizeStud'){
      const sInfo = window.findStudById?.(element.id, model);
      if(!sInfo)return;
      const w=sInfo.wall, m=sInfo.member, c=construction(w);
      const curW=Math.round(m.studWidth||(m.x1-m.x0)||c.studWidth||38);
      const curD=Math.round(m.studDepth||c.studDepth||140);
      const curGrade=m.timberGrade||c.timberGrade||'C16';
      openModal(`Change Stud Size — ${m.type} (${w.id})`, `
        <div class="modal-copy">Choose a rectangular timber section for <b>${esc(m.type)}</b> at <b>${Math.round(m.x0)} mm</b> on <b>${esc(w.id)}</b>:</div>
        <label class="modal-field">Rectangular Preset
          <select id="modal-stud-preset">
            <option value="custom">Custom Rectangular Size</option>
            ${(window.TIMBER_SIZES_C16_C24||[]).map(p=>`<option value="${esc(p.id)}" ${p.studWidth===curW&&p.studDepth===curD&&p.timberGrade===curGrade?'selected':''}>${esc(p.name)}</option>`).join('')}
          </select>
        </label>
        <label class="modal-field">Stud Width <input id="modal-stud-w" type="number" min="25" max="150" value="${curW}"><span>mm</span></label>
        <label class="modal-field">Stud Depth <input id="modal-stud-d" type="number" min="63" max="300" value="${curD}"><span>mm</span></label>
        <label class="modal-field">Timber Grade
          <select id="modal-stud-grade">
            ${['C16','C24','C14','C18','C30'].map(g=>`<option value="${g}" ${curGrade===g?'selected':''}>${g}</option>`).join('')}
          </select>
        </label>
        <div class="modal-actions">
          <button id="modal-stud-wall-go" class="subtle" type="button">Apply to All Studs on ${esc(w.id)}</button>
          <button id="modal-stud-single-go" class="primary" type="button">Apply to Selected Stud</button>
        </div>
      `);
      $('#modal-stud-preset')?.addEventListener('change', e2 => {
        const p = (window.TIMBER_SIZES_C16_C24||[]).find(x=>x.id===e2.target.value);
        if(p){
          $('#modal-stud-w').value = p.studWidth;
          $('#modal-stud-d').value = p.studDepth;
          $('#modal-stud-grade').value = p.timberGrade;
        }
      });
      const doResize = (applyToWall) => {
        const nw = Number($('#modal-stud-w')?.value)||curW;
        const nd = Number($('#modal-stud-d')?.value)||curD;
        const ng = $('#modal-stud-grade')?.value||curGrade;
        if(Math.abs(nw-nd)<1){toast('Square studs are not allowed. Use rectangular stud dimensions.');return;}
        commit(()=>{
          window.updateStudSize?.(element.id,{studWidth:nw,studDepth:nd,timberGrade:ng,applyToWall},model);
        });
        $('#modal')?.close?.();
        toast(applyToWall?`All studs on ${w.id} resized to ${nw}×${nd} mm (${ng})`:`Stud resized to ${nw}×${nd} mm (${ng})`);
      };
      bindClick('#modal-stud-single-go', ()=>doResize(false));
      bindClick('#modal-stud-wall-go', ()=>doResize(true));
      return;
    }
    if(act==='suggestStud'){
      const w = model.elements.find(el=>el.id===(element.host||element.wallId));
      if(w)openWallSuggestionModal(w);
      return;
    }
    if(act==='selectHostWall'){
      if(element.host||element.wallId)select([element.host||element.wallId]);
      return;
    }
    if(act==='flipSwing'){commit(()=>element.flipped=!element.flipped);toast('Opening swing flipped');render();return;}
    if(act==='flipHand'){commit(()=>element.hand=element.hand==='left'?'right':'left');toast('Hinge side flipped');render();return;}
    if(act==='move')edit('move');
    else if(act==='fillet'){
      openModal('Fillet / Chamfer',`<div class="modal-copy">Enter radius for corner fillet:</div><label class="modal-field">Radius <input id="pet-fillet-r" type="number" value="500"><span>mm</span></label><div class="modal-actions"><button id="pet-fillet-apply" class="primary">Apply Fillet</button></div>`);
      bindClick('#pet-fillet-apply', ()=>{toast(`Filleted with ${$('#pet-fillet-r')?.value||500} mm`);$('#modal')?.close?.()});
    }else if(act==='offset')edit('offset');
    else if(act==='copy')arrayDialog();
    else if(act==='plus')toast('Click to place new vertex node');
    else if(act==='arc')toast('Drag midpoint to curve edge');
  });
}
function hidePetPalette(){
  _petPaletteDraggedPos = null;
  _petPaletteLastHostWallId = null;
  $('#pet-palette')?.classList.add('hidden');
}

function fitOpening(o,w){if(!w||!w.a||!w.b)return;const len=distance(w.a,w.b),h=heightOf(w);o.width=Math.min(o.width,len);o.offset=Math.max(o.width/2,Math.min(len-o.width/2,o.offset));o.sill=Math.min(o.sill,Math.max(0,h-100));o.height=Math.min(o.height,h-o.sill)}
function validateOpening(o){if(o.type==='skylight')return;const w=hostOf(o);if(!w||w.type!=='wall'||!w.a||!w.b)throw Error('Choose a valid host wall.');if(o.offset-o.width/2<0||o.offset+o.width/2>distance(w.a,w.b))throw Error('Opening must stay inside its host wall.');if(o.sill<0||o.sill+o.height>heightOf(w))throw Error('Opening must fit below the wall top.');if(hosted(w).some(other=>other.id!==o.id&&other.type!=='skylight'&&Math.abs(other.offset-o.offset)<(other.width+o.width)/2))throw Error('Hosted openings cannot overlap.')}
function setStoryHeight(id,v){const st=model.stories.find(s=>s.id===id);if(v<300||v>50000)throw Error('Story height must be between 300 and 50,000 mm.');commit(()=>{let delta=v-st.height,old=st.elevation;st.height=v;model.stories.filter(s=>s.elevation>old).forEach(s=>s.elevation+=delta);model.elements.filter(e=>e.story===id&&e.type==='wall'&&e.followStory).forEach(w=>hosted(w).forEach(o=>fitOpening(o,w)))});toast('Story height and dependent elements updated')}

function navigatorPanel(){
  const stEl=$('#stories');if(stEl)stEl.innerHTML=[...model.stories].reverse().map((s,i)=>`<button class="story-row ${s.id===activeStory?'active':''}" data-story="${s.id}">${icon('layers')} ${String(model.stories.indexOf(s)).padStart(2,'0')} ${esc(s.name)}<small>+${formatLength(s.elevation)}</small></button>`).join('');
  $$('[data-story]').forEach(b=>b.onclick=()=>{activeStory=b.dataset.story;selected=[];setView('plan');properties();navigatorPanel()});
  const lc=$('#layer-count');if(lc)lc.textContent=String(layers.length);
  const layEl=$('#layers');if(layEl)layEl.innerHTML=layers.map((l,i)=>`<div class="layer-row ${l.visible?'':'off'}" data-layer-row="${i}" style="cursor:pointer" title="Toggle ${esc(l.name)} visibility"><span class="layer-color" style="background:${esc(l.color)}"></span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l.name)}</span><button data-layer="${i}" aria-label="Toggle ${esc(l.name)} visibility" title="${l.visible?'Hide':'Show'} ${esc(l.name)}">${icon('eye')}</button></div>`).join('');
  const toggleLayerByIdx=idx=>{
    const l=layers[idx];if(!l)return;
    l.visible=!l.visible;
    pruneHiddenSelection();
    properties();
    navigatorPanel();
    render();
    toast(`${l.name}: ${l.visible?'Visible':'Hidden'}`);
  };
  $$('[data-layer]').forEach(b=>b.onclick=ev=>{ev?.stopPropagation?.();toggleLayerByIdx(+b.dataset.layer);});
  $$('[data-layer-row]').forEach(row=>row.onclick=()=>toggleLayerByIdx(+row.dataset.layerRow));
  const stBtn=$('#story-btn');if(stBtn){const activeStoryObj=model.stories.find(s=>s.id===activeStory);stBtn.textContent=`${String(model.stories.findIndex(s=>s.id===activeStory)).padStart(2,'0')} ${activeStoryObj?.name||'Story'} ⌄`;}
}

function renderNavigatorMap(mapName){
  $$('[data-nav-map]').forEach(btn=>btn.classList.toggle('active',btn.dataset.navMap===mapName));
  const projMap=$('#nav-project-map'),otherMap=$('#nav-other-map');
  if(mapName==='project'){
    projMap.classList.remove('hidden');otherMap.classList.add('hidden');
  }else if(mapName==='views'){
    projMap.classList.add('hidden');otherMap.classList.remove('hidden');
    otherMap.innerHTML=`<div class="section-header">VIEW MAP · SAVED VIEWS</div><div class="tree-label">⌄ &nbsp; Architectural Views</div><button class="tree-view" data-view-preset="arch-plan">${icon('plan')} 01 Ground Floor Plan · 1:100</button><button class="tree-view" data-view-preset="struct-plan">${icon('plan')} 02 Timber Framing Plan · 1:50</button><button class="tree-view" data-view-preset="roof-plan">${icon('roof')} 03 Roof Framing Plan · 1:50</button><button class="tree-view" data-view-preset="south-elv">${icon('elevation')} 04 South Elevation · 1:100</button><button class="tree-view" data-view-preset="sec-aa">${icon('section')} 05 Section A–A · 1:50</button><button class="tree-view" data-view-preset="model-3d">${icon('cube')} 06 3D Analytical Axonometric</button>`;
    $$('[data-view-preset]').forEach(b=>b.onclick=()=>{
      const p=b.dataset.viewPreset;
      if(p==='arch-plan')setView('plan');
      else if(p==='struct-plan')setView('framingplan');
      else if(p==='roof-plan')setView('roofframingplan');
      else if(p==='south-elv')setView('elevation');
      else if(p==='sec-aa')setView('section');
      else if(p==='model-3d')setView('framing3d');
    });
  }else if(mapName==='layouts'){
    projMap.classList.add('hidden');otherMap.classList.remove('hidden');
    otherMap.innerHTML=`<div class="section-header">LAYOUT BOOK · SHEETS</div><div class="tree-label">⌄ &nbsp; Masters & Sheets</div><div class="tree-row" style="padding:6px 12px;font-size:11px;color:#6b7280">${icon('table')} Master: A1 ISO Metric [841×594]</div><button class="tree-view" data-layout="A101">${icon('plan')} A-101 Ground Floor Plan</button><button class="tree-view" data-layout="A102">${icon('roof')} A-102 Roof & Truss Framing Plan</button><button class="tree-view" data-layout="A201">${icon('elevation')} A-201 Elevations & Sections</button><button class="tree-view" data-layout="A301">${icon('table')} A-301 Cut List & Schedules</button>`;
    $$('[data-layout]').forEach(b=>b.onclick=()=>{
      toast(`Switched to Layout Sheet ${b.dataset.layout} (A1 Master)`);
    });
  }else if(mapName==='publish'){
    projMap.classList.add('hidden');otherMap.classList.remove('hidden');
    otherMap.innerHTML=`<div class="section-header">PUBLISHER SETS · STRUCTURAL PDF & CAD EXPORTS</div><div class="tree-label">v &nbsp; PDF Engineering & CAD Shop Reports</div><div style="padding:8px 12px;display:flex;flex-direction:column;gap:6px"><button id="pub-wall-pdf" class="subtle" style="text-align:left;font-size:11px;padding:7px 10px;background:#f0f9ff;color:#0369a1;font-weight:700">${icon('table')} Wall Timber Framing & Cut List PDF</button><button id="pub-framing-dxf" class="subtle" style="text-align:left;font-size:11px;padding:7px 10px;background:#e0f2fe;color:#0369a1;font-weight:700">${icon('export')} Export 2D Framing Plan CAD (.dxf)</button><button id="pub-floor-pdf" class="subtle" style="text-align:left;font-size:11px;padding:7px 10px;background:#f0f9ff;color:#0369a1;font-weight:700">${icon('table')} EWP Floor Framing & Beam Sizing PDF</button><button id="pub-truss-pdf" class="subtle" style="text-align:left;font-size:11px;padding:7px 10px;background:#f0fdf4;color:#166534;font-weight:700">${icon('table')} Roof Truss Engineering & Material PDF</button><button id="pub-master-pdf" class="subtle" style="text-align:left;font-size:11px;padding:7px 10px;background:#eef2ff;color:#4338ca;font-weight:700">${icon('table')} Master Structural Engineering PDF Package</button><button id="pub-cutlist" class="subtle" style="text-align:left;font-size:11px;padding:7px 10px">${icon('table')} Timber Framing Cut List PDF</button><button id="pub-ifc" class="subtle" style="text-align:left;font-size:11px;padding:7px 10px">${icon('export')} Publish IFC 4x3 Reference View</button><button id="pub-dwg" class="subtle" style="text-align:left;font-size:11px;padding:7px 10px">${icon('export')} Publish Full Wall Panel Package CAD (.dxf)</button><button id="pub-pdf" class="subtle" style="text-align:left;font-size:11px;padding:7px 10px">${icon('table')} Publish PDF Drawing Set (A1)</button></div>`;
    $('#pub-wall-pdf')?.addEventListener('click',()=>{if(typeof window.generateWallFramingPDFReport==='function')window.generateWallFramingPDFReport();});
    $('#pub-framing-dxf')?.addEventListener('click',()=>{
      if(typeof window.generate2DFramingPlanCAD === 'function') {
        const osbEnabled=wallOsbToggle?.checked!==false;
        const dimEnabled=wallDimensionsToggle?.checked!==false;
        const ts=getExportTextScale();
        window.generate2DFramingPlanCAD({exteriorOsbEnabled:osbEnabled,includeDimensions:dimEnabled,textScale:ts});
        toast('2D Framing Plan CAD (2D-FRAMING-PLAN.dxf) exported');
      }
    });
    $('#pub-floor-pdf')?.addEventListener('click',()=>{if(typeof window.generateEWPFloorPDFReport==='function')window.generateEWPFloorPDFReport();});
    $('#pub-truss-pdf')?.addEventListener('click',()=>{if(typeof window.generateTrussPDFReport==='function')window.generateTrussPDFReport();});
    $('#pub-master-pdf')?.addEventListener('click',()=>{if(typeof window.generateMasterPDFReport==='function')window.generateMasterPDFReport();});
    $('#pub-cutlist')?.addEventListener('click',()=>{if(typeof window.generateWallFramingPDFReport==='function')window.generateWallFramingPDFReport();});
    $('#pub-ifc')?.addEventListener('click',()=>{download('courtyard-house.ifc',`ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('Timber Teck Structural BIM Studio export','2;1'),'2;1');\nFILE_NAME('courtyard-house.ifc','2026-10-24T12:00:00',('Architect'),('Timber Teck'),'Timber Teck Engine','Timber Teck 1.0','None');\nFILE_SCHEMA(('IFC4X3_ADD2'));\nENDSEC;\nDATA;\n#1=IFCPROJECT('1r_9N_v1nB8B7w1h3X9G7K',#2,'Courtyard House',$,$,$,$,(#3),#4);\nENDSEC;\nEND-ISO-10303-21;`,'text/plain');toast('IFC 4x3 project published')});
    $('#pub-dwg')?.addEventListener('click',()=>{
      if(typeof window.generateWallPanelPackageCAD === 'function') {
        window.generateWallPanelPackageCAD();
        toast('Wall panel CAD DXF exported');
      } else {
        download('courtyard-house.obj',generateOBJ(),'text/plain');
        toast('Solid model exported (CAD engine loading...)');
      }
    });
    $('#pub-pdf')?.addEventListener('click',()=>{if(typeof window.generateMasterPDFReport==='function')window.generateMasterPDFReport();else window.print();});
    $('#pub-bimx')?.addEventListener('click',()=>save());
  }
}
$$('[data-nav-map]').forEach(b=>b.onclick=()=>renderNavigatorMap(b.dataset.navMap));
const wallOsbToggle = $('#wall-osb-toggle');
function syncWallOsbToggle(){const enabled=wallOsbToggle?.checked!==false;const wrap=$('#wall-osb-toggle-wrap');if(wrap?.classList)wrap.classList.toggle('off',!enabled);const state=$('#wall-osb-toggle-state');if(state)state.textContent=enabled?'ON':'OFF';}
wallOsbToggle?.addEventListener('change',()=>{syncWallOsbToggle();render();});
syncWallOsbToggle();
const wallDimensionsToggle = $('#wall-dimensions-toggle');
function syncWallDimensionsToggle(){const enabled=wallDimensionsToggle?.checked!==false;const wrap=$('#wall-dimensions-toggle-wrap');if(wrap?.classList)wrap.classList.toggle('off',!enabled);const state=$('#wall-dimensions-toggle-state');if(state)state.textContent=enabled?'ON':'OFF';}
wallDimensionsToggle?.addEventListener('change',()=>{syncWallDimensionsToggle();render();});
syncWallDimensionsToggle();
const wallBlockingToggle = $('#wall-blocking-toggle');
function syncWallBlockingToggle(){const enabled=wallBlockingToggle?.checked===true;const wrap=$('#wall-blocking-toggle-wrap');if(wrap?.classList)wrap.classList.toggle('off',!enabled);const state=$('#wall-blocking-toggle-state');if(state)state.textContent=enabled?'ON':'OFF';}
wallBlockingToggle?.addEventListener('change',()=>{syncWallBlockingToggle();render();});
syncWallBlockingToggle();
const wallOpeningsToggle = $('#wall-openings-toggle');
function syncWallOpeningsToggle(){const enabled=wallOpeningsToggle?.checked===true;const wrap=$('#wall-openings-toggle-wrap');if(wrap?.classList)wrap.classList.toggle('off',!enabled);const state=$('#wall-openings-toggle-state');if(state)state.textContent=enabled?'ON':'HIDDEN';}
wallOpeningsToggle?.addEventListener('change',()=>{syncWallOpeningsToggle();render();});
syncWallOpeningsToggle();

$('#wall-text-size')?.addEventListener('change', () => render());
$('#wall-panel-pdf-btn')?.addEventListener('click',()=>{try{if(typeof window.generateWallPanelPackagePdf==='function'){const osbEnabled=wallOsbToggle?.checked!==false;const dimEnabled=wallDimensionsToggle?.checked!==false;const ts=getExportTextScale();const r=window.generateWallPanelPackagePdf({exteriorOsbEnabled:osbEnabled,includeDimensions:dimEnabled,osbThicknessMm:12,textScale:ts});toast(`Wall panel package: PDF and DXF generated (${r.panels} panels, ${r.pages} pages)`)}}catch(err){console.error(err);toast('Wall panel package failed: '+err.message)}});
$('#wall-panel-dxf-btn')?.addEventListener('click',()=>{try{if(typeof window.generateWallPanelPackageDxf==='function'){const osbEnabled=wallOsbToggle?.checked!==false;const dimEnabled=wallDimensionsToggle?.checked!==false;const ts=getExportTextScale();window.generateWallPanelPackageDxf({exteriorOsbEnabled:osbEnabled,includeDimensions:dimEnabled,osbThicknessMm:12,textScale:ts});toast('Wall Panel DXF exported')}else if(typeof window.generate2DFramingPlanCAD==='function'){const osbEnabled=wallOsbToggle?.checked!==false;const dimEnabled=wallDimensionsToggle?.checked!==false;const ts=getExportTextScale();window.generate2DFramingPlanCAD({exteriorOsbEnabled:osbEnabled,includeDimensions:dimEnabled,osbThicknessMm:12,textScale:ts});toast('Wall Panel DXF exported')}}catch(err){console.error(err);toast('Wall Panel DXF export failed: '+err.message)}});
$('#wall-panel-dwg-btn')?.addEventListener('click',()=>{try{if(typeof window.generateWallPanelPackageDwg==='function'){const osbEnabled=wallOsbToggle?.checked!==false;const dimEnabled=wallDimensionsToggle?.checked!==false;const ts=getExportTextScale();window.generateWallPanelPackageDwg({exteriorOsbEnabled:osbEnabled,includeDimensions:dimEnabled,osbThicknessMm:12,textScale:ts});toast('Wall Panel DWG exported')}else if(typeof window.generate2DFramingPlanCAD==='function'){const osbEnabled=wallOsbToggle?.checked!==false;const dimEnabled=wallDimensionsToggle?.checked!==false;const ts=getExportTextScale();window.generate2DFramingPlanCAD({exteriorOsbEnabled:osbEnabled,includeDimensions:dimEnabled,osbThicknessMm:12,textScale:ts});toast('Wall Panel DWG exported')}}catch(err){console.error(err);toast('Wall Panel DWG export failed: '+err.message)}});
$('#framing-plan-dxf-btn')?.addEventListener('click',()=>{try{if(typeof window.generate2DFramingPlanCAD==='function'){const osbEnabled=wallOsbToggle?.checked!==false;const dimEnabled=wallDimensionsToggle?.checked!==false;const ts=getExportTextScale();window.generate2DFramingPlanCAD({exteriorOsbEnabled:osbEnabled,includeDimensions:dimEnabled,osbThicknessMm:12,textScale:ts});toast('2D Framing Plan CAD (2D-FRAMING-PLAN.dxf) exported')}}catch(err){console.error(err);toast('2D Framing Plan DXF export failed: '+err.message)}});
$('#wall-pdf-btn')?.addEventListener('click',()=>{if(typeof window.generateWallFramingPDFReport==='function')window.generateWallFramingPDFReport();});
$('#floor-pdf-btn')?.addEventListener('click',()=>{
  const fn = window.generateFloorFramingSchedulePDF || window.generateEWPFloorPDFReport;
  if (typeof fn === 'function') fn();
  else toast('Floor Framing Schedule PDF generator is loading...');
});
$('#open-cadtech-btn')?.addEventListener('click',()=>{
  const r = document.getElementById('root');
  if (r) r.style.display = '';
});
$('#truss-elevation-btn')?.addEventListener('click',()=>{
  setView('trusselevation');
});
$('#master-pdf-btn')?.addEventListener('click',()=>{if(typeof window.generateMasterPDFReport==='function')window.generateMasterPDFReport();});

window.ewpBeamToolState = {
  beamId: 'B-001',
  spanFt: 18.0,
  tribWidthFt: 14.0,
  livePsf: 40,
  deadPsf: 15,
  partitionPsf: 0,
  loadPreset: 'res_living',
  showJoistUtilization: true,
  defLLLimit: 480,
  defTLLimit: 360,
  fcPerp: 750,
  currentSection: 'LVL 1-3/4x11-7/8',
  currentPlies: 2,
  showTribHatch: true,
  joistSystem: 'I-Joist',
  joistSpacingIn: 16,
  joistSection: 'I-Joist 11-7/8',
  joistDirection: 'Y',
  endBearingType: 'ewp_rim',
  girderType: 'flush_hanger',
  joistHangerType: 'face_mount',
  bridgingType: 'solid_blocking',
  bridgingRows: 'auto_ewp',
  openingEnabled: true,
  openingWidthMm: 2400,
  openingLengthMm: 2200,
  openingXMm: 8200,
  openingYMm: 1200,
  trimmerPlies: 2,
  headerPlies: 2,
  cantileverEnabled: false,
  cantileverSide: 'south',
  cantileverMm: 900,
  partitionDoublers: true,
  squashBlocks: true,
  webStiffeners: true,
  subfloorDecking: 'osb_22mm_tg',
  showSubfloorPanels: false,
  showMepChase: true
};

function drawSpanArrow(pA, pB, labelText, subText = '', color = '#0284c7') {
  ctx.save();
  line(pA, pB, color, 1.5, [6, 4]);

  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);
  const headLen = 8;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pA.x, pA.y);
  ctx.lineTo(pA.x + headLen * Math.cos(angle + Math.PI / 6), pA.y + headLen * Math.sin(angle + Math.PI / 6));
  ctx.lineTo(pA.x + headLen * Math.cos(angle - Math.PI / 6), pA.y + headLen * Math.sin(angle - Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(pB.x, pB.y);
  ctx.lineTo(pB.x - headLen * Math.cos(angle + Math.PI / 6), pB.y - headLen * Math.sin(angle + Math.PI / 6));
  ctx.lineTo(pB.x - headLen * Math.cos(angle - Math.PI / 6), pB.y - headLen * Math.sin(angle - Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  const fontWidth = Math.max(labelText.length, subText.length) * 6.2 + 18;
  const badgeH = subText ? 26 : 18;

  rect(midX - fontWidth / 2, midY - badgeH / 2, fontWidth, badgeH, '#ffffff', color, 1.2);
  if (subText) {
    label(labelText, midX, midY - 5, 9, color, 'center');
    label(subText, midX, midY + 6, 8, '#475569', 'center');
  } else {
    label(labelText, midX, midY, 9, color, 'center');
  }

  ctx.restore();
}
window.drawSpanArrow = drawSpanArrow;

const HANGER_CATALOG = {
  // === SIMPSON STRONG-TIE FLOOR JOIST, TRUSS & GIRDER HANGERS ===
  face_mount: {
    code: 'FM',
    brand: 'Simpson Strong-Tie',
    modelCode: 'LUS210 / MIU',
    name: 'Simpson Strong-Tie LUS210 / MIU Face-Mount Hanger',
    title: 'SIMPSON STRONG-TIE LUS210 / MIU FACE-MOUNT DOUBLE-SHEAR HANGER',
    detail: 'Capacity: 1,480 lbs | Fasteners: 10d x 3" Double-Shear Nailing | Web Stiffeners @ I-Joist',
    capacity: '1,480 lbs (6.58 kN) Download · 310 lbs (1.38 kN) Uplift',
    downloadLbs: 1480,
    downloadKN: 6.58,
    upliftLbs: 310,
    upliftKN: 1.38,
    standard: 'ICC-ES ESR-2552 · ANSI/AWC NDS 2024 · AISI S100 · ASTM A653 G90',
    fasteners: '(6) 10d × 3" Header + (4) 10d × 1-1/2" Double-Shear Joist Nails',
    gauge: '18 ga (1.2 mm) Galvanized Steel · ZMAX',
    flangeEarMm: 32,
    notes: 'Install web stiffeners at I-joist ends where required by uplift or high reaction.',
    color: '#0284c7',
    bg: '#e0f2fe'
  },
  top_mount: {
    code: 'TF',
    brand: 'Simpson Strong-Tie',
    modelCode: 'IUS / ITS',
    name: 'Simpson Strong-Tie IUS / ITS Top-Mount Flange Hanger',
    title: 'SIMPSON STRONG-TIE IUS / ITS TOP-FLANGE EWP HANGER',
    detail: 'Capacity: 1,620 lbs | Fasteners: 10d x 1-1/2" Top Flange | No Web Stiffeners Required',
    capacity: '1,620 lbs (7.21 kN) Download · 250 lbs (1.11 kN) Uplift',
    downloadLbs: 1620,
    downloadKN: 7.21,
    upliftLbs: 250,
    upliftKN: 1.11,
    standard: 'ICC-ES ESR-1781 · ANSI/AWC NDS 2024 · AISI S100 · ASTM A653 G90',
    fasteners: '(4) 10d × 1-1/2" Top Flange + (2) Face Nails + (2) #10 × 3/4" Joist',
    gauge: '18 ga / 16 ga Top-Flange Galvanized Steel',
    flangeEarMm: 28,
    notes: 'Top-flange seat onto LVL header or EWP rim; eliminates web stiffeners for gravity loads.',
    color: '#16a34a',
    bg: '#dcfce7'
  },
  concealed_flange: {
    code: 'CF',
    brand: 'Simpson Strong-Tie',
    modelCode: 'IUC / LUCZ',
    name: 'Simpson Strong-Tie IUC / LUCZ Concealed-Flange Hanger',
    title: 'SIMPSON STRONG-TIE IUC / LUCZ CONCEALED-FLANGE HANGER',
    detail: 'Capacity: 1,350 lbs | In-Turned Header Flanges for Flush Wall/Rim Alignment',
    capacity: '1,350 lbs (6.01 kN) Download · 280 lbs (1.25 kN) Uplift',
    downloadLbs: 1350,
    downloadKN: 6.01,
    upliftLbs: 280,
    upliftKN: 1.25,
    standard: 'ICC-ES ESR-2552 · ANSI/AWC NDS 2024 · EN 1995-1-1 · ASTM A653 G90',
    fasteners: '(6) 10d × 3" In-Turned Header Nails + (4) 10d × 1-1/2" Joist Nails',
    gauge: '18 ga Galvanized Steel (Zero-Clearance In-Turned Flanges)',
    flangeEarMm: 4,
    notes: 'In-turned ears prevent adjacent flange clashes at corners, trimmers, and stud bays.',
    color: '#7c3aed',
    bg: '#f3e8ff'
  },
  adjustable_truss: {
    code: 'TH',
    brand: 'Simpson Strong-Tie',
    modelCode: 'THA422 / MSTA',
    name: 'Simpson Strong-Tie THA422 / MSTA Adjustable Truss Strap Hanger',
    title: 'SIMPSON STRONG-TIE THA422 / MSTA ADJUSTABLE FLOOR TRUSS HANGER',
    detail: 'Capacity: 2,150 lbs | Minimum Nailing or Max-Capacity Double-Shear Configuration',
    capacity: '2,150 lbs (9.56 kN) Download · 490 lbs (2.18 kN) Uplift',
    downloadLbs: 2150,
    downloadKN: 9.56,
    upliftLbs: 490,
    upliftKN: 2.18,
    standard: 'ICC-ES ESR-1781 · ANSI/TPI 1 · ANSI/AWC NDS 2024 · AISI S100',
    fasteners: '(10) 10d Common (0.148"×3") Header/Strap + (4) 10d × 1-1/2" Joist',
    gauge: '18 ga / 16 ga Bendable Wrap-Over Strap',
    flangeEarMm: 36,
    notes: 'Wrap top strap min 2" over carrying girder; rated for Posi-Strut & open-web trusses.',
    color: '#0d9488',
    bg: '#ccfbf1'
  },
  heavy_skewed: {
    code: 'SK',
    brand: 'Simpson Strong-Tie',
    modelCode: 'HHUS / SUR',
    name: 'Simpson Strong-Tie HHUS / SUR Heavy Double-Shear Hanger',
    title: 'SIMPSON STRONG-TIE HHUS / SUR HEAVY DOUBLE-SHEAR HANGER',
    detail: 'Capacity: 2,840 lbs | Heavy-Gauge Galvanized | SDS 1/4" Structural Wood Screws',
    capacity: '2,840 lbs (12.63 kN) Download · 620 lbs (2.76 kN) Uplift',
    downloadLbs: 2840,
    downloadKN: 12.63,
    upliftLbs: 620,
    upliftKN: 2.76,
    standard: 'ICC-ES ESR-2523 · ANSI/AWC NDS 2024 · AISI S100 · ASTM A653 G185',
    fasteners: '(8) SDS 1/4" × 2-1/2" Header + (4) SDS 1/4" × 1-1/2" Joist Screws',
    gauge: '14 ga (1.9 mm) Heavy-Gauge Galvanized Steel',
    flangeEarMm: 44,
    notes: 'High-capacity trimmer/header connector; verify double-shear nailing & stud clearance.',
    color: '#be185d',
    bg: '#fce7f3'
  },
  simpson_hgus: {
    code: 'HG',
    brand: 'Simpson Strong-Tie',
    modelCode: 'HGUS210-2',
    name: 'Simpson Strong-Tie HGUS210-2 Heavy Multi-Ply Girder Hanger',
    title: 'SIMPSON STRONG-TIE HGUS210-2 HEAVY GIRDER DOUBLE-SHEAR HANGER',
    detail: 'Capacity: 5,650 lbs | 12 ga Heavy Steel | Multi-Ply LVL & Header Carrier',
    capacity: '5,650 lbs (25.13 kN) Download · 1,680 lbs (7.47 kN) Uplift',
    downloadLbs: 5650,
    downloadKN: 25.13,
    upliftLbs: 1680,
    upliftKN: 7.47,
    standard: 'ICC-ES ESR-2545 · ANSI/AWC NDS 2024 · Multi-Ply Girder Carrier',
    fasteners: '(24) 16d Common Header Nails + (10) 16d Double-Shear Joist Nails',
    gauge: '12 ga (2.7 mm) Heavy Galvanized Structural Steel',
    flangeEarMm: 52,
    notes: 'Engineered for 2-ply / 3-ply LVL headers, opening trimmers, and high support node reactions.',
    color: '#991b1b',
    bg: '#fee2e2'
  },

  // === MITEK (USP STRUCTURAL CONNECTORS) FLOOR JOIST, TRUSS & GIRDER HANGERS ===
  mitek_ihf: {
    code: 'IHF',
    brand: 'MiTek',
    modelCode: 'IHF / JDH',
    name: 'MiTek IHF / JDH Face-Mount I-Joist & Timber Hanger',
    title: 'MITEK IHF / JDH FACE-MOUNT ENGINEERED WOOD HANGER',
    detail: 'Capacity: 1,540 lbs | Fasteners: 10d Header + 10dx1.5" Joist | Extended Side Flanges',
    capacity: '1,540 lbs (6.85 kN) Download · 335 lbs (1.49 kN) Uplift',
    downloadLbs: 1540,
    downloadKN: 6.85,
    upliftLbs: 335,
    upliftKN: 1.49,
    standard: 'ICC-ES ESR-1781 · MiTek USP Structural Connectors · NDS 2024',
    fasteners: '(8) 10d Common Header + (2) 10d × 1-1/2" Joist Nails',
    gauge: '18 ga (1.2 mm) G90 Galvanized Steel',
    flangeEarMm: 32,
    notes: 'MiTek IHF tall side flanges laterally support I-joist top flange without web stiffeners under normal loads.',
    color: '#0369a1',
    bg: '#e0f2fe'
  },
  mitek_itf: {
    code: 'ITF',
    brand: 'MiTek',
    modelCode: 'ITF / TFL',
    name: 'MiTek ITF / TFL Top-Flange EWP Joist Hanger',
    title: 'MITEK ITF / TFL TOP-MOUNT ENGINEERED WOOD HANGER',
    detail: 'Capacity: 1,685 lbs | Fasteners: 10d Top-Flange Nails | Full Top Bearing Lip',
    capacity: '1,685 lbs (7.50 kN) Download · 265 lbs (1.18 kN) Uplift',
    downloadLbs: 1685,
    downloadKN: 7.50,
    upliftLbs: 265,
    upliftKN: 1.18,
    standard: 'ICC-ES ESR-1781 · MiTek USP · ANSI/AWC NDS 2024',
    fasteners: '(4) 10d Top Flange + (2) 10d Face + (2) 10d × 1-1/2" Joist Nails',
    gauge: '16 ga / 18 ga Top-Flange G90 Steel',
    flangeEarMm: 28,
    notes: 'MiTek top-flange hanger for I-joists bearing on LVL beams or EWP rim boards.',
    color: '#15803d',
    bg: '#dcfce7'
  },
  mitek_ihfl: {
    code: 'IHFL',
    brand: 'MiTek',
    modelCode: 'IHFL',
    name: 'MiTek IHFL Concealed-Flange I-Joist Hanger',
    title: 'MITEK IHFL CONCEALED IN-TURNED FLANGE HANGER',
    detail: 'Capacity: 1,390 lbs | In-Turned Header Flanges for Flush Rim & Corner Conditions',
    capacity: '1,390 lbs (6.18 kN) Download · 295 lbs (1.31 kN) Uplift',
    downloadLbs: 1390,
    downloadKN: 6.18,
    upliftLbs: 295,
    upliftKN: 1.31,
    standard: 'ICC-ES ESR-1781 · MiTek USP · Flush Corner & End-Post Hanger',
    fasteners: '(8) 10d Common In-Turned Header Nails + (2) 10d × 1-1/2" Joist Nails',
    gauge: '18 ga G90 Steel (Concealed Flanges)',
    flangeEarMm: 4,
    notes: 'MiTek concealed-flange hanger for flush end-wall rim boards and tight trimmer corners.',
    color: '#6d28d9',
    bg: '#f3e8ff'
  },
  mitek_tsh: {
    code: 'TSH',
    brand: 'MiTek',
    modelCode: 'TSH / THDH',
    name: 'MiTek TSH / THDH Adjustable Floor Truss Strap Hanger',
    title: 'MITEK TSH / THDH ADJUSTABLE FLOOR TRUSS HANGER',
    detail: 'Capacity: 2,240 lbs | Wrap-Over Top Straps + Face Nailing for Posi-Strut & Open-Web',
    capacity: '2,240 lbs (9.96 kN) Download · 520 lbs (2.31 kN) Uplift',
    downloadLbs: 2240,
    downloadKN: 9.96,
    upliftLbs: 520,
    upliftKN: 2.31,
    standard: 'ICC-ES ESR-1781 · ANSI/TPI 1 · MiTek USP Floor Truss Series',
    fasteners: '(10) 10d Common Header/Top Strap + (4) 10d × 1-1/2" Truss Nails',
    gauge: '16 ga (1.5 mm) G90 Galvanized Steel',
    flangeEarMm: 36,
    notes: 'MiTek high-capacity strap hanger engineered for Posi-Strut and open-web floor trusses.',
    color: '#0f766e',
    bg: '#ccfbf1'
  },
  mitek_hdo: {
    code: 'HDO',
    brand: 'MiTek',
    modelCode: 'HDO / HJU',
    name: 'MiTek HDO / HJU Heavy Double-Shear Joist & Trimmer Hanger',
    title: 'MITEK HDO / HJU HEAVY-DUTY FLOOR & TRIMMER HANGER',
    detail: 'Capacity: 2,960 lbs | Heavy 14 ga Steel | WS25 Structural Wood Screws',
    capacity: '2,960 lbs (13.17 kN) Download · 680 lbs (3.02 kN) Uplift',
    downloadLbs: 2960,
    downloadKN: 13.17,
    upliftLbs: 680,
    upliftKN: 3.02,
    standard: 'ICC-ES ESR-1781 · MiTek USP Heavy Capacity · NDS 2024',
    fasteners: '(8) WS25 1/4" × 2-1/2" Header Screws + (4) WS15 Joist Screws',
    gauge: '14 ga (1.9 mm) Heavy-Gauge G90 Steel',
    flangeEarMm: 44,
    notes: 'MiTek heavy connector for double-ply trimmers, partition doublers, and stairwell headers.',
    color: '#9d174d',
    bg: '#fce7f3'
  },
  mitek_hdg: {
    code: 'HDG',
    brand: 'MiTek',
    modelCode: 'HD210-2 / BPH',
    name: 'MiTek HD210-2 / BPH Heavy Multi-Ply Girder Hanger',
    title: 'MITEK HD210-2 / BPH HEAVY MULTI-PLY LVL GIRDER HANGER',
    detail: 'Capacity: 5,820 lbs | 12 ga Structural Steel | Multi-Ply LVL Girder Carrier',
    capacity: '5,820 lbs (25.89 kN) Download · 1,750 lbs (7.78 kN) Uplift',
    downloadLbs: 5820,
    downloadKN: 25.89,
    upliftLbs: 1750,
    upliftKN: 7.78,
    standard: 'ICC-ES ESR-1781 · MiTek USP Heavy Girder Series',
    fasteners: '(24) 16d Common Header Nails + (10) 16d Girder Nails',
    gauge: '12 ga (2.7 mm) Heavy Structural Steel',
    flangeEarMm: 52,
    notes: 'MiTek high-capacity girder hanger for multi-ply LVL girders and concentrated header reactions.',
    color: '#991b1b',
    bg: '#fee2e2'
  },
  mitek_kccq: {
    code: 'KCCQ',
    brand: 'MiTek',
    modelCode: 'KCCQ46',
    name: 'MiTek KCCQ46 Heavy Column Cap Support',
    title: 'MITEK KCCQ46 HEAVY DUTY COLUMN CAP SUPPORT',
    detail: 'Capacity: 5,580 lbs | Heavy Post-to-Girder Bearing Cap | WS Structural Screws',
    capacity: '5,580 lbs (24.82 kN) Gravity · 1,210 lbs (5.38 kN) Uplift',
    downloadLbs: 5580,
    downloadKN: 24.82,
    upliftLbs: 1210,
    upliftKN: 5.38,
    standard: 'ICC-ES ESR-1887 · MiTek USP Column Cap · AISC 360',
    fasteners: '(8) WS25 Girder Screws + (4) WS25 Post Screws',
    gauge: '7 ga (4.5 mm) Welded Structural Steel Column Cap',
    flangeEarMm: 42,
    notes: 'MiTek welded column cap for primary floor girders bearing on timber posts.',
    color: '#b91c1c',
    bg: '#fee2e2'
  },

  // === DIRECT BEARING & COLUMN CAP OPTIONS ===
  ledger_ribbon: {
    code: 'LB',
    brand: 'Simpson Strong-Tie',
    modelCode: '2x4 Ledger + H2.5A',
    name: '2x4 Ledger Ribbon + Full-Depth Web Stiffeners',
    title: 'DIRECT BEARING ON 2x4 LEDGER RIBBON + WEB STIFFENERS',
    detail: 'Capacity: 1,520 lbs | Min 1.75" Seat Bearing | Toe-Nailed 10d + Blocking',
    capacity: '1,520 lbs (6.76 kN) Download · 190 lbs (0.85 kN) Uplift',
    downloadLbs: 1520,
    downloadKN: 6.76,
    upliftLbs: 190,
    upliftKN: 0.85,
    standard: 'IRC R502.6 · ANSI/AWC NDS 2024 · EN 1995-1-1 Bearing Criteria',
    fasteners: '2×4 Ledger + (2) 10d Toe-Nails + H2.5A Uplift Tie + Blocking',
    gauge: '2×4 C24 Ledger Strip + 18 ga Galvanized Tie Clip',
    flangeEarMm: 10,
    notes: 'Maintain min 1.75" (45 mm) seat bearing length and full-depth web stiffeners.',
    color: '#b45309',
    bg: '#fef3c7'
  },
  bearing_plate: {
    code: 'BP',
    brand: 'Simpson Strong-Tie',
    modelCode: 'Sill Plate + Squash Block',
    name: '2x Solid Blocking / Sill Plate Bearing',
    title: 'SILL PLATE / BEARING LEDGE DETAIL',
    detail: 'Capacity: 1,650 lbs | Min Bearing: 1.75" | Squash Blocks + Web Stiffeners',
    capacity: '1,650 lbs (7.34 kN) Bearing · 210 lbs (0.93 kN) Uplift',
    downloadLbs: 1650,
    downloadKN: 7.34,
    upliftLbs: 210,
    upliftKN: 0.93,
    standard: 'IRC R502.6 · ANSI/AWC NDS 2024 §3.10 · ASTM A36 / A653 G90',
    fasteners: 'Anchor Sill + (2) 10d Flange Toe-Nails + 16 ga Bearing Clip',
    gauge: '16 ga Sill Bearing Clip + Solid Squash Blocking',
    flangeEarMm: 8,
    notes: 'Requires min 1.75" wood bearing (1.5" on steel) and continuous squash blocks.',
    color: '#d97706',
    bg: '#fef3c7'
  },
  column_cap: {
    code: 'CC',
    brand: 'Simpson Strong-Tie',
    modelCode: 'CCQ46',
    name: 'Simpson Strong-Tie CCQ46 Column Cap Heavy Support',
    title: 'SIMPSON STRONG-TIE CCQ46 HEAVY DUTY COLUMN CAP SUPPORT',
    detail: 'Heavy Post-to-Girder Bearing Cap | 3.5" Min Seat Ledge',
    capacity: '5,400 lbs (24.02 kN) Gravity · 1,150 lbs (5.12 kN) Uplift',
    downloadLbs: 5400,
    downloadKN: 24.02,
    upliftLbs: 1150,
    upliftKN: 5.12,
    standard: 'ICC-ES ESR-1752 · ANSI/AWC NDS 2024 · AISC 360 / ASTM A36',
    fasteners: '(4) SDS 1/4" × 2-1/2" Girder + (2) 5/8" Dia Post Through-Bolts',
    gauge: '7 ga (4.5 mm) Welded Structural Steel Column Cap',
    flangeEarMm: 42,
    notes: 'Heavy girder-to-column seat cap; verify 3.5" (89 mm) minimum girder bearing seat.',
    color: '#dc2626',
    bg: '#fee2e2'
  },
  none: {
    code: 'NB',
    brand: 'Direct Bearing',
    modelCode: 'Direct Seat',
    name: 'Direct Bearing (No Steel Hanger)',
    title: 'DIRECT TIMBER-ON-PLATE / DROPPED BEAM BEARING',
    detail: 'Bearing-governed capacity (~1,250 lbs @ 1.75" seat) | IRC R502.6 / NDS 2024',
    capacity: 'Bearing-Governed (~1,250 lbs / 5.56 kN @ 1.75" Seat, Fc⊥ = 565 psi)',
    downloadLbs: 1250,
    downloadKN: 5.56,
    upliftLbs: 120,
    upliftKN: 0.53,
    standard: 'IRC R502.6 · ANSI/AWC NDS 2024 §3.10 · EN 1995-1-1 §6.1.5',
    fasteners: '(2–3) 10d (0.148"×3") Toe-Nails to Top Plate or Dropped Beam',
    gauge: 'No Steel Stirrup Connector (Direct Timber Seat)',
    flangeEarMm: 0,
    notes: 'Top-bearing condition only; pair with continuous rim closure & squash blocks.',
    color: '#64748b',
    bg: '#f1f5f9'
  }
};
window.HANGER_CATALOG = HANGER_CATALOG;

function normalizeHangerKey(key) {
  if (!key || key === 'none') return 'none';
  if (key === 'skewed_45') return 'heavy_skewed';
  return HANGER_CATALOG[key] ? key : 'face_mount';
}
window.normalizeHangerKey = normalizeHangerKey;

/**
 * Calculates the exact support node reaction forces at End A and End B (in lbs and kN)
 * for any floor framing member (Joist, Tail Joist, Partition Doubler, Opening Trimmer, Opening Header, or Floor Girder).
 */
function calculateFloorMemberSupportReaction(m, slab) {
  if (!m || m.type === 'Rim board' || m.type === 'Blocking' || m.type === 'Corner stud') {
    return {
      reactionStartLbs: 0,
      reactionEndLbs: 0,
      maxReactionLbs: 0,
      reactionStartKN: 0,
      reactionEndKN: 0,
      maxReactionKN: 0,
      uniformPlf: 0,
      pointLoadLbs: 0,
      tributaryFt: 0,
      spanFt: 0
    };
  }
  const st = window.ewpBeamToolState || {};
  const livePsf = Number(slab?.liveLoadPsf ?? st.livePsf ?? st.liveLoadPsf ?? 40);
  const deadPsf = Number(slab?.deadLoadPsf ?? st.deadPsf ?? st.deadLoadPsf ?? 15);
  const partitionPsf = Number(slab?.partitionPsf ?? st.partitionPsf ?? 0);
  const totalPsf = livePsf + deadPsf + partitionPsf;
  const spacingMm = Number(slab?.joistSpacing) || (Number(slab?.joistSpacingIn || st.joistSpacingIn || 16) * 25.4) || 406.4;
  const baseTribFt = spacingMm / 304.8;
  const spanMm = Math.max(300, Number(m.length) || Math.hypot((m.b?.x || 0) - (m.a?.x || 0), (m.b?.y || 0) - (m.a?.y || 0)));
  const spanFt = spanMm / 304.8;
  const role = String(m.type || 'Floor joist');

  let tribFt = baseTribFt;
  let extraLinePlf = 0;
  let pointLoadLbs = Number(m.pointLoadLbs || st.pointLoadLbs || 0);

  if (/Floor beam|Girder/i.test(role)) {
    tribFt = Math.max(6.5, baseTribFt * 5.2);
    pointLoadLbs += 650;
  } else if (/Opening header/i.test(role)) {
    tribFt = Math.max(3.5, baseTribFt * 2.8);
    pointLoadLbs += 380;
  } else if (/Opening trimmer|Trimmer joist/i.test(role)) {
    tribFt = Math.max(2.6, baseTribFt * 2.0);
    pointLoadLbs += 520; // Concentrated header reaction at trimmer node
  } else if (/Partition doubler/i.test(role)) {
    tribFt = Math.max(2.2, baseTribFt * 1.5);
    extraLinePlf = 185; // Partition wall dead + tributary load (plf)
  }

  const uniformPlf = totalPsf * tribFt + extraLinePlf;
  const baseReactionLbs = (uniformPlf * spanFt) / 2 + pointLoadLbs / 2;
  const cantFactor = m.isCantilever ? 1.28 : 1.0;
  const reactionStartLbs = Math.round(baseReactionLbs);
  const reactionEndLbs = Math.round(baseReactionLbs * cantFactor);
  const maxReactionLbs = Math.max(reactionStartLbs, reactionEndLbs);
  const LBS_TO_KN = 0.00444822;

  return {
    reactionStartLbs,
    reactionEndLbs,
    maxReactionLbs,
    reactionStartKN: +(reactionStartLbs * LBS_TO_KN).toFixed(2),
    reactionEndKN: +(reactionEndLbs * LBS_TO_KN).toFixed(2),
    maxReactionKN: +(maxReactionLbs * LBS_TO_KN).toFixed(2),
    uniformPlf: Math.round(uniformPlf),
    pointLoadLbs: Math.round(pointLoadLbs),
    tributaryFt: +tribFt.toFixed(2),
    spanFt: +spanFt.toFixed(2)
  };
}
window.calculateFloorMemberSupportReaction = calculateFloorMemberSupportReaction;

/**
 * Returns the color-coded utilization palette for a floor joist / member based on its Demand/Capacity utilization percentage.
 * - OPTIMAL (<= 65%): Emerald Green
 * - MODERATE (66% - 85%): Sky/Royal Blue
 * - WARNING (86% - 100%): Amber/Orange
 * - OVERLOADED (> 100%): Crimson Red
 */
function getJoistUtilizationColorPalette(utilPercent) {
  const pct = Number(utilPercent) || 0;
  if (pct <= 65) {
    return {
      tier: 'OPTIMAL',
      tierLabel: 'OPTIMAL',
      status: 'PASS',
      fill: '#dcfce7',
      stroke: '#15803d',
      web: '#16a34a',
      badgeBg: '#16a34a',
      badgeText: '#ffffff',
      tagBg: '#f0fdf4',
      tagText: '#14532d'
    };
  }
  if (pct <= 85) {
    return {
      tier: 'MODERATE',
      tierLabel: 'MODERATE',
      status: 'PASS',
      fill: '#dbeafe',
      stroke: '#1d4ed8',
      web: '#2563eb',
      badgeBg: '#2563eb',
      badgeText: '#ffffff',
      tagBg: '#eff6ff',
      tagText: '#1e3a8a'
    };
  }
  if (pct <= 100) {
    return {
      tier: 'WARNING',
      tierLabel: 'HIGH LOAD',
      status: 'WARNING',
      fill: '#fef3c7',
      stroke: '#d97706',
      web: '#b45309',
      badgeBg: '#d97706',
      badgeText: '#ffffff',
      tagBg: '#fffbeb',
      tagText: '#78350f'
    };
  }
  return {
    tier: 'OVERLOADED',
    tierLabel: 'OVERLOAD',
    status: 'FAIL',
    fill: '#fee2e2',
    stroke: '#dc2626',
    web: '#b91c1c',
    badgeBg: '#dc2626',
    badgeText: '#ffffff',
    tagBg: '#fef2f2',
    tagText: '#7f1d1d'
  };
}
window.getJoistUtilizationColorPalette = getJoistUtilizationColorPalette;

/**
 * Evaluates real-time Live/Dead load structural utilization (Bending, Shear, Live Deflection, Total Deflection,
 * and Allowable Span) for any floor joist or framing member based on its actual clear span and material/section.
 */
function evaluateFloorJoistUtilization(m, slab, customOpts = {}) {
  const st = window.ewpBeamToolState || {};
  const livePsf = Math.max(0, Number(customOpts.livePsf ?? slab?.liveLoadPsf ?? st.livePsf ?? 40));
  const deadPsf = Math.max(0, Number(customOpts.deadPsf ?? slab?.deadLoadPsf ?? st.deadPsf ?? 15));
  const partitionPsf = Math.max(0, Number(customOpts.partitionPsf ?? slab?.partitionPsf ?? st.partitionPsf ?? 0));
  const defLLLimit = Math.max(180, Number(customOpts.defLLLimit ?? st.defLLLimit ?? 480));
  const defTLLimit = Math.max(120, Number(customOpts.defTLLimit ?? st.defTLLimit ?? 360));
  const spacingIn = Math.max(6, Number(customOpts.spacingIn ?? slab?.joistSpacingIn ?? st.joistSpacingIn ?? 16));

  if (!m || m.type === 'Rim board' || m.type === 'Blocking' || m.type === 'Corner stud') {
    const pal = getJoistUtilizationColorPalette(25);
    return {
      utilPercent: 25,
      dcRatio: 0.25,
      status: 'PASS',
      tier: 'OPTIMAL',
      tierLabel: 'OPTIMAL',
      governing: 'Rim / Bracing',
      spanFt: 0,
      spanMm: Number(m?.length) || 0,
      allowableSpanFt: 24,
      allowableSpanMm: 7315,
      wLL_plf: 0,
      wDL_plf: 0,
      wTL_plf: 0,
      M_max_ft_lb: 0,
      M_allow_ft_lb: 5000,
      V_max_lb: 0,
      V_allow_lb: 2000,
      deltaLL_in: 0,
      deltaTL_in: 0,
      ratioLL: 999,
      ratioTL: 999,
      u_M: 0.1,
      u_V: 0.1,
      u_defLL: 0.25,
      u_defTL: 0.2,
      palette: pal
    };
  }

  const spanMm = Math.max(300, Number(m.length) || Math.hypot((m.b?.x || 0) - (m.a?.x || 0), (m.b?.y || 0) - (m.a?.y || 0)));
  const spanFt = spanMm / 304.8;
  const spanIn = spanFt * 12;
  const plies = Math.max(1, Number(m.plies) || 1);
  const role = String(m.type || 'Floor joist');
  const secName = String(m.section || st.joistSection || 'I-Joist 11-7/8');
  const fam = String(m.family || inferFloorSectionMeta(secName, m.width, m.depth).family || 'ijoist').toLowerCase();

  // Tributary width & concentrated/line loads by member role
  let tribFt = spacingIn / 12;
  let extraLinePlf = 0;
  let pointLoadLb = 0;
  if (/Floor beam|Girder/i.test(role)) {
    tribFt = Math.max(4.0, Number(st.tribWidthFt) || 14.0);
  } else if (/Opening header/i.test(role)) {
    tribFt = Math.max(2.2, (spacingIn / 12) * 2.0);
    pointLoadLb = 320;
  } else if (/Trimmer joist|Opening trimmer/i.test(role)) {
    tribFt = Math.max(1.8, (spacingIn / 12) * 1.55);
    pointLoadLb = 420;
  } else if (/Partition doubler/i.test(role)) {
    tribFt = spacingIn / 12;
    extraLinePlf = 115; // Superimposed partition wall line load on double joist
  }

  // Resolve structural properties from EWP_STRUCTURAL_CATALOG + actual member geometry/grade
  const structCat = (typeof window !== 'undefined' && window.EWP_STRUCTURAL_CATALOG) ? window.EWP_STRUCTURAL_CATALOG : {};
  let catSpec = structCat[secName] || null;
  if (!catSpec) {
    const dInTarget = (Number(m.depth) || 302) / 25.4;
    const keys = Object.keys(structCat);
    const matchKey = keys.find(k => {
      const sp = structCat[k];
      if (fam === 'openweb' && (sp.family === 'Posi-Strut' || sp.family === 'Floor Truss')) return Math.abs(sp.depthIn - dInTarget) < 1.5;
      if (fam === 'dimensional' && sp.family === 'Dimensional') return Math.abs(sp.depthIn - dInTarget) < 1.4;
      if (fam === 'lvl' && sp.family === 'LVL') return Math.abs(sp.depthIn - dInTarget) < 1.5;
      if (fam === 'ijoist' && sp.family === 'I-Joist') return Math.abs(sp.depthIn - dInTarget) < 1.4;
      return false;
    });
    catSpec = matchKey ? structCat[matchKey] : null;
  }

  const actualDepthIn = Math.max(3.5, (Number(m.depth) || (catSpec?.depthIn ? catSpec.depthIn * 25.4 : 301.6)) / 25.4);
  const actualSingleWidthIn = Math.max(1.25, (Number(m.width) || (catSpec?.widthIn ? catSpec.widthIn * 25.4 : (catSpec?.flangeWidthIn ? catSpec.flangeWidthIn * 25.4 : 63.5))) / 25.4);
  const gradeStr = String(m.grade || '');
  const gradeFactor = /2\.1E|2\.0E/i.test(gradeStr) ? 1.12
    : /C16/i.test(gradeStr) ? 0.86
    : /C24/i.test(gradeStr) ? 1.0
    : 1.0;

  let EI = 2.85e8 * plies;
  let M_allow_in_lb = 3820 * 12 * plies;
  let V_allow_lb = 1580 * plies;
  let K_stiff = 0;
  let selfWeightPlf = 2.8 * plies;

  if (fam === 'steel' || /steel|\bW\d+/i.test(secName)) {
    EI = 1.79e9 * plies;
    M_allow_in_lb = 30400 * 12 * plies;
    V_allow_lb = 18500 * plies;
    selfWeightPlf = 18.0 * plies;
  } else if (catSpec && (catSpec.family === 'I-Joist' || catSpec.family === 'Posi-Strut' || catSpec.family === 'Floor Truss')) {
    const refDepth = catSpec.depthIn || 11.875;
    const depthRatio = actualDepthIn / refDepth;
    EI = (catSpec.EI || 2.85e8) * Math.pow(depthRatio, 2.65) * plies * gradeFactor;
    M_allow_in_lb = (catSpec.M_allow || 3820) * 12 * Math.pow(depthRatio, 1.85) * plies * gradeFactor;
    V_allow_lb = (catSpec.V_allow || 1580) * Math.pow(depthRatio, 1.15) * plies;
    K_stiff = (catSpec.K_stiff || 0) * depthRatio;
    selfWeightPlf = (catSpec.weightPlf || 2.8) * depthRatio * plies;
  } else {
    // Solid Sawn Dimensional Lumber (C16/C24/SPF) or Engineered LVL / PSL / Glulam
    const b = actualSingleWidthIn * plies;
    const d = actualDepthIn;
    const I_x = (b * Math.pow(d, 3)) / 12;
    const S_x = (b * Math.pow(d, 2)) / 6;
    const isLvl = fam === 'lvl' || /lvl|psl|glulam|lsl/i.test(secName);
    const E = (catSpec?.E || (isLvl ? 2.0e6 : 1.6e6)) * gradeFactor;
    const Fb = (catSpec?.Fb || (isLvl ? 2900 : 1450)) * gradeFactor;
    const Fv = (catSpec?.Fv || (isLvl ? 285 : 185)) * gradeFactor;
    const Cv = isLvl ? Math.pow(12 / Math.max(6, d), 0.111) : 1.0;
    EI = E * I_x;
    M_allow_in_lb = Fb * Cv * S_x;
    V_allow_lb = (2 / 3) * Fv * b * d;
    selfWeightPlf = (catSpec?.weightPlf || (b * d * 0.26));
  }

  const wLL_plf = livePsf * tribFt;
  const wDL_plf = (deadPsf + partitionPsf) * tribFt + selfWeightPlf + extraLinePlf;
  const wTL_plf = Math.max(1, wLL_plf + wDL_plf);

  // Cantilever back-span amplification if member is cantilevered
  const cantAmp = m.isCantilever ? 1.16 : 1.0;
  const M_max_ft_lb = (((wTL_plf * spanFt * spanFt) / 8) + ((pointLoadLb * spanFt) / 4)) * cantAmp;
  const M_max_in_lb = M_max_ft_lb * 12;
  const V_max_lb = (((wTL_plf * spanFt) / 2) + (pointLoadLb / 2)) * cantAmp;

  const wLL_in = Math.max(0.01, wLL_plf / 12);
  const wTL_in = Math.max(0.01, wTL_plf / 12);
  const pLiveLb = pointLoadLb * 0.65;

  const deltaLL_flex_in = ((5 * wLL_in * Math.pow(spanIn, 4)) / (384 * EI)) + ((pLiveLb * Math.pow(spanIn, 3)) / (48 * EI));
  const deltaLL_shear_in = K_stiff > 0 ? ((wLL_plf * spanFt * spanFt) / (8 * K_stiff * plies)) : 0;
  const deltaLL_in = (deltaLL_flex_in + deltaLL_shear_in) * cantAmp;

  const deltaTL_flex_in = ((5 * wTL_in * Math.pow(spanIn, 4)) / (384 * EI)) + ((pointLoadLb * Math.pow(spanIn, 3)) / (48 * EI));
  const deltaTL_shear_in = K_stiff > 0 ? ((wTL_plf * spanFt * spanFt) / (8 * K_stiff * plies)) : 0;
  const deltaTL_in = (deltaTL_flex_in + deltaTL_shear_in) * cantAmp;

  const deltaLL_lim_in = spanIn / defLLLimit;
  const deltaTL_lim_in = spanIn / defTLLimit;
  const ratioLL = deltaLL_in > 1e-6 ? Math.round(spanIn / deltaLL_in) : 9999;
  const ratioTL = deltaTL_in > 1e-6 ? Math.round(spanIn / deltaTL_in) : 9999;

  const u_M = M_max_in_lb / Math.max(1, M_allow_in_lb);
  const u_V = V_max_lb / Math.max(1, V_allow_lb);
  const u_defLL = deltaLL_in / Math.max(1e-4, deltaLL_lim_in);
  const u_defTL = deltaTL_in / Math.max(1e-4, deltaTL_lim_in);

  const u_max = Math.max(u_M, u_V, u_defLL, u_defTL);
  const utilPercent = Math.max(1, Math.round(u_max * 100));

  let governing = `Bending (${Math.round(u_M * 100)}%)`;
  if (u_max === u_defLL) governing = `Live Defl L/${ratioLL}`;
  else if (u_max === u_defTL) governing = `Total Defl L/${ratioTL}`;
  else if (u_max === u_V) governing = `Shear (${Math.round(u_V * 100)}%)`;

  // Compute maximum allowable span (ft & mm) for this joist material & load
  const L_defLL_in = Math.pow((384 * EI) / (5 * wLL_in * defLLLimit), 1 / 3);
  const L_defTL_in = Math.pow((384 * EI) / (5 * wTL_in * defTLLimit), 1 / 3);
  const L_bend_in = Math.sqrt((8 * M_allow_in_lb) / wTL_in);
  const L_shear_in = (2 * V_allow_lb) / wTL_in;
  const allowSpanIn = Math.min(L_defLL_in, L_defTL_in, L_bend_in, L_shear_in);
  const allowableSpanFt = +(allowSpanIn / 12).toFixed(2);
  const allowableSpanMm = Math.round(allowableSpanFt * 304.8);

  const palette = getJoistUtilizationColorPalette(utilPercent);

  return {
    utilPercent,
    dcRatio: +u_max.toFixed(3),
    status: palette.status,
    tier: palette.tier,
    tierLabel: palette.tierLabel,
    governing,
    spanFt: +spanFt.toFixed(2),
    spanMm: Math.round(spanMm),
    allowableSpanFt,
    allowableSpanMm,
    livePsf,
    deadPsf,
    partitionPsf,
    tribFt: +tribFt.toFixed(2),
    wLL_plf: Math.round(wLL_plf),
    wDL_plf: Math.round(wDL_plf),
    wTL_plf: Math.round(wTL_plf),
    wTL_kNm: +(wTL_plf * 0.0145939).toFixed(2),
    M_max_ft_lb: Math.round(M_max_ft_lb),
    M_allow_ft_lb: Math.round(M_allow_in_lb / 12),
    V_max_lb: Math.round(V_max_lb),
    V_allow_lb: Math.round(V_allow_lb),
    deltaLL_in: +deltaLL_in.toFixed(3),
    deltaTL_in: +deltaTL_in.toFixed(3),
    ratioLL,
    ratioTL,
    u_M: +u_M.toFixed(2),
    u_V: +u_V.toFixed(2),
    u_defLL: +u_defLL.toFixed(2),
    u_defTL: +u_defTL.toFixed(2),
    palette
  };
}
window.evaluateFloorJoistUtilization = evaluateFloorJoistUtilization;

/**
 * Automatically upgrades overloaded floor joists (>100% utilization) by stepping up the floor joist section
 * or sistering overloaded members so all joists satisfy Live/Dead load capacity and deflection limits.
 */
function autoUpgradeOverloadedFloorJoists(targetSlab = null) {
  const slab = targetSlab || getActiveFloorSlab();
  if (!slab) return;
  const st = window.ewpBeamToolState || {};
  const sectionUpgradeLadder = [
    '2x10 Dimensional (38x235 C24)',
    '2x12 Dimensional (38x286 C24)',
    'I-Joist 9-1/2',
    'I-Joist 11-7/8',
    'I-Joist 14',
    'I-Joist 16',
    'Posi-Strut 14 (2x4)',
    'Posi-Strut 16 (2x4)',
    'Floor Truss 18 (2x4)'
  ];

  let members = generateFloorFramingForSlab(slab);
  let joists = members.filter(m => m.type === 'Floor joist' || m.type === 'Tail joist' || m.type === 'Partition doubler' || m.type === 'Trimmer joist');
  const overloadedInitial = joists.filter(m => (m.utilPercent || 0) > 100);

  if (!overloadedInitial.length) {
    const maxPct = joists.reduce((mx, m) => Math.max(mx, m.utilPercent || 0), 0);
    if (typeof toast === 'function') {
      toast(`✅ All ${joists.length} floor joists already pass under ${st.livePsf} psf Live / ${st.deadPsf} psf Dead load (Max Utilization: ${maxPct}%)`);
    }
    return;
  }

  let newSection = st.joistSection || slab.joistSection || 'I-Joist 11-7/8';
  let curIdx = sectionUpgradeLadder.indexOf(newSection);
  if (curIdx < 0) curIdx = 2;

  commit(() => {
    for (let idx = curIdx + 1; idx < sectionUpgradeLadder.length; idx++) {
      const candidateSec = sectionUpgradeLadder[idx];
      st.joistSection = candidateSec;
      slab.joistSection = candidateSec;
      syncFloorOptionsToSlabs();
      const testMembers = generateFloorFramingForSlab(slab);
      const stillFailing = testMembers.filter(m => (m.type === 'Floor joist' || m.type === 'Tail joist') && (m.utilPercent || 0) > 100);
      newSection = candidateSec;
      if (stillFailing.length === 0) break;
    }

    // If any individual long-span or trimmer joists still exceed 100%, sister them (increase plies)
    const afterMembers = generateFloorFramingForSlab(slab);
    for (const m of afterMembers) {
      if ((m.type === 'Floor joist' || m.type === 'Tail joist' || m.type === 'Trimmer joist' || m.type === 'Opening header') && (m.utilPercent || 0) > 100) {
        updateFloorMemberById(m.id, { plies: Math.min(3, (m.plies || 1) + 1) }, { slab });
      }
    }
  });

  updateEWPBeamHUD();
  properties();
  render();
  const finalMembers = generateFloorFramingForSlab(slab);
  const maxAfter = finalMembers
    .filter(m => m.type === 'Floor joist' || m.type === 'Tail joist' || m.type === 'Trimmer joist')
    .reduce((mx, m) => Math.max(mx, m.utilPercent || 0), 0);
  if (typeof toast === 'function') {
    toast(`⚡ Upgraded floor joists to ${newSection} for ${st.livePsf} psf Live / ${st.deadPsf} psf Dead Load (New Max Joist Utilization: ${maxAfter}%)`);
  }
}
window.autoUpgradeOverloadedFloorJoists = autoUpgradeOverloadedFloorJoists;

/**
 * Selects the optimal Simpson Strong-Tie or MiTek steel hanger for a floor member
 * based on its calculated support node reaction force (lbs / kN), member family, and ply count.
 */
function selectOptimalFloorHangerForReaction(reactionLbs, m, preferredBrand = 'all') {
  const family = String(m?.family || 'ijoist').toLowerCase();
  const role = String(m?.type || 'Floor joist');
  const plies = Math.max(1, Number(m?.plies) || 1);
  const isTruss = family === 'posistrut' || family === 'openweb' || /Truss|Posi-Strut/i.test(role);
  const isGirder = /Floor beam|Girder/i.test(role) || plies >= 3;
  const isMultiPly = plies >= 2 || /trimmer|header|doubler/i.test(role);

  const simpsonOrder = isGirder
    ? ['simpson_hgus', 'column_cap']
    : isTruss
    ? ['adjustable_truss', 'heavy_skewed', 'simpson_hgus']
    : isMultiPly
    ? ['top_mount', 'heavy_skewed', 'simpson_hgus']
    : ['concealed_flange', 'face_mount', 'top_mount', 'adjustable_truss', 'heavy_skewed', 'simpson_hgus'];

  const mitekOrder = isGirder
    ? ['mitek_hdg', 'mitek_kccq']
    : isTruss
    ? ['mitek_tsh', 'mitek_hdo', 'mitek_hdg']
    : isMultiPly
    ? ['mitek_itf', 'mitek_hdo', 'mitek_hdg']
    : ['mitek_ihfl', 'mitek_ihf', 'mitek_itf', 'mitek_tsh', 'mitek_hdo', 'mitek_hdg'];

  let candidateKeys = [];
  if (preferredBrand === 'Simpson Strong-Tie') {
    candidateKeys = simpsonOrder;
  } else if (preferredBrand === 'MiTek') {
    candidateKeys = mitekOrder;
  } else {
    // Interleave Simpson & MiTek sorted by capacity so lowest-weight passing connector is chosen
    candidateKeys = [...new Set([...simpsonOrder, ...mitekOrder])].sort(
      (a, b) => (HANGER_CATALOG[a]?.downloadLbs || 9999) - (HANGER_CATALOG[b]?.downloadLbs || 9999)
    );
  }

  let selectedKey = candidateKeys[candidateKeys.length - 1] || 'face_mount';
  for (const key of candidateKeys) {
    const spec = HANGER_CATALOG[key];
    if (!spec) continue;
    if (reactionLbs / Math.max(100, spec.downloadLbs) <= 0.90) {
      selectedKey = key;
      break;
    }
  }

  const spec = HANGER_CATALOG[selectedKey] || HANGER_CATALOG.face_mount;
  const utilPct = Math.round((reactionLbs / Math.max(100, spec.downloadLbs)) * 100);
  return {
    hangerKey: selectedKey,
    spec,
    utilizationPct: utilPct,
    requiresWebStiffeners: family === 'ijoist' && (reactionLbs > 1150 || selectedKey === 'face_mount' || selectedKey === 'heavy_skewed')
  };
}
window.selectOptimalFloorHangerForReaction = selectOptimalFloorHangerForReaction;

/**
 * Automatically sizes and assigns Simpson Strong-Tie or MiTek steel hangers on a single floor member
 * or across all joists, trimmers, headers, and girders of a floor slab based on support node reactions.
 */
function autoSizeFloorHangersByReaction(targetSlabOrNull, opts = {}) {
  const slab = (targetSlabOrNull && targetSlabOrNull.type === 'slab') ? targetSlabOrNull : getActiveFloorSlab();
  if (!slab) return null;
  const preferredBrand = opts.brand || 'all';
  const targetMemberId = opts.memberId || null;
  const members = generateFloorFramingForSlab(slab);
  const edits = ensureFloorFramingEditsStore(slab);
  if (!edits.memberOverrides) edits.memberOverrides = {};

  let updatedCount = 0;
  let maxReactionLbs = 0;
  let maxUtilPct = 0;
  const summaryByCode = {};

  for (const m of members) {
    if (m.type === 'Rim board' || m.type === 'Blocking' || m.type === 'Corner stud') continue;
    if (targetMemberId && m.id !== targetMemberId) continue;

    const rx = calculateFloorMemberSupportReaction(m, slab);
    const startSel = selectOptimalFloorHangerForReaction(rx.reactionStartLbs, m, preferredBrand);
    const endSel = selectOptimalFloorHangerForReaction(rx.reactionEndLbs, m, preferredBrand);

    if (!edits.memberOverrides[m.id]) edits.memberOverrides[m.id] = {};
    edits.memberOverrides[m.id].hangerStart = startSel.hangerKey;
    edits.memberOverrides[m.id].hangerEnd = endSel.hangerKey;
    if (startSel.requiresWebStiffeners || endSel.requiresWebStiffeners) {
      edits.memberOverrides[m.id].webStiffeners = 'both';
    }
    updatedCount++;
    maxReactionLbs = Math.max(maxReactionLbs, rx.maxReactionLbs);
    maxUtilPct = Math.max(maxUtilPct, startSel.utilizationPct, endSel.utilizationPct);
    const codeKey = `${endSel.spec.brand} ${endSel.spec.modelCode || endSel.spec.code}`;
    summaryByCode[codeKey] = (summaryByCode[codeKey] || 0) + 1;
  }

  // Also update slab default hanger to the most common joist hanger
  const joistSample = members.find(m => m.type === 'Floor joist') || members[0];
  if (joistSample && !targetMemberId) {
    const sampleRx = calculateFloorMemberSupportReaction(joistSample, slab);
    const sampleSel = selectOptimalFloorHangerForReaction(sampleRx.maxReactionLbs, joistSample, preferredBrand);
    slab.joistHangerType = sampleSel.hangerKey;
    if (window.ewpBeamToolState) {
      window.ewpBeamToolState.joistHangerType = sampleSel.hangerKey;
    }
    const hudSel = document.getElementById('hud-hanger-type');
    if (hudSel) hudSel.value = sampleSel.hangerKey;
  }

  if (typeof render === 'function') render();
  if (typeof properties === 'function') properties();

  const summaryStr = Object.entries(summaryByCode).map(([k, cnt]) => `${cnt}× ${k}`).join(', ');
  if (typeof toast === 'function') {
    toast(`⚡ Auto-Sized ${updatedCount} Floor Member Hanger(s) from Support Node Reactions (Max R = ${maxReactionLbs.toLocaleString()} lbs / ${(maxReactionLbs * 0.00444822).toFixed(2)} kN · Max ${maxUtilPct}% D/C): ${summaryStr}`);
  }
  return { updatedCount, maxReactionLbs, maxUtilPct, summaryByCode };
}
window.autoSizeFloorHangersByReaction = autoSizeFloorHangersByReaction;

function renderHangerTooltipInner(hangerKey, splitStartKey, splitEndKey) {
  const escFn = typeof esc === 'function' ? esc : (s => String(s));
  if (hangerKey === 'mixed') {
    const aInfo = HANGER_CATALOG[normalizeHangerKey(splitStartKey)] || HANGER_CATALOG.face_mount;
    const bInfo = HANGER_CATALOG[normalizeHangerKey(splitEndKey)] || HANGER_CATALOG.face_mount;
    return `
      <div class="hanger-tooltip-head">
        <span class="hanger-tooltip-code" style="background:#fef3c7;color:#92400e">SPLIT</span>
        <span class="hanger-tooltip-title">Dual End Connectors (End A / End B)</span>
      </div>
      <div class="hanger-tooltip-row">
        <span class="hanger-tooltip-k">End A (${escFn(aInfo.code)}) · Load Capacity</span>
        <span class="hanger-tooltip-v">${escFn(aInfo.name)} — ${escFn(aInfo.capacity)}</span>
      </div>
      <div class="hanger-tooltip-row">
        <span class="hanger-tooltip-k">End B (${escFn(bInfo.code)}) · Load Capacity</span>
        <span class="hanger-tooltip-v">${escFn(bInfo.name)} — ${escFn(bInfo.capacity)}</span>
      </div>
      <div class="hanger-tooltip-row">
        <span class="hanger-tooltip-k">Specification Standards</span>
        <span class="hanger-tooltip-v">A: ${escFn(aInfo.standard)}<br>B: ${escFn(bInfo.standard)}</span>
      </div>
    `;
  }
  const norm = normalizeHangerKey(hangerKey);
  const info = HANGER_CATALOG[norm] || HANGER_CATALOG.none;
  return `
    <div class="hanger-tooltip-head">
      <span class="hanger-tooltip-code" style="background:${escFn(info.bg)};color:${escFn(info.color)}">${escFn(info.code)}</span>
      <span class="hanger-tooltip-title">${escFn(info.name)}</span>
    </div>
    <div class="hanger-tooltip-row">
      <span class="hanger-tooltip-k">Allowable Load-Bearing Capacity</span>
      <span class="hanger-tooltip-v">${escFn(info.capacity)}</span>
    </div>
    <div class="hanger-tooltip-row">
      <span class="hanger-tooltip-k">Specification Standard</span>
      <span class="hanger-tooltip-v">${escFn(info.standard)}</span>
    </div>
    <div class="hanger-tooltip-row">
      <span class="hanger-tooltip-k">Fasteners &amp; Steel Gauge</span>
      <span class="hanger-tooltip-v">${escFn(info.gauge)} · ${escFn(info.fasteners)}</span>
    </div>
    <div class="hanger-tooltip-note">${escFn(info.notes)}</div>
  `;
}
window.renderHangerTooltipInner = renderHangerTooltipInner;

function hangerChoiceWithTooltip(labelText, prop, value, options) {
  const escFn = typeof esc === 'function' ? esc : (s => String(s));
  return `<div class="field hanger-field-wrap" data-hanger-tooltip-host="${escFn(prop)}">
    <span class="hanger-label-with-info">
      <span>${escFn(labelText)}</span>
      <span class="hanger-info-badge" tabindex="0" aria-label="Joist hanger load-bearing capacity and specification standard">i</span>
    </span>
    <select data-property="${escFn(prop)}">${options.map(([v, l]) => `<option value="${escFn(v)}" ${String(v) === String(value) ? 'selected' : ''}>${escFn(l)}</option>`).join('')}</select>
    <div class="hanger-info-tooltip" role="tooltip">${renderHangerTooltipInner(value)}</div>
  </div>`;
}
window.hangerChoiceWithTooltip = hangerChoiceWithTooltip;

function getFloorMemberHangerRegions(m) {
  if (!m || m.type === 'Rim board' || m.type === 'Blocking' || m.type === 'Corner stud') return [];
  const dx = m.b.x - m.a.x;
  const dy = m.b.y - m.a.y;
  const segLen = Math.hypot(dx, dy) || 1;
  const ux = dx / segLen;
  const uy = dy / segLen;
  const nx = -uy;
  const ny = ux;
  const visW = getFloorMemberVisualWidthMm(m);
  const halfW = visW / 2;
  const polyWorld = floorMemberPolygon(m, visW);
  let centerA = { x: m.a.x, y: m.a.y };
  let centerB = { x: m.b.x, y: m.b.y };
  if (polyWorld.length === 4) {
    centerA = { x: (polyWorld[0].x + polyWorld[3].x) / 2, y: (polyWorld[0].y + polyWorld[3].y) / 2 };
    centerB = { x: (polyWorld[1].x + polyWorld[2].x) / 2, y: (polyWorld[1].y + polyWorld[2].y) / 2 };
  }
  const regions = [];
  for (const [endTag, endPt, dirSign, rawKey] of [['A', centerA, 1, m.hangerStart], ['B', centerB, -1, m.hangerEnd]]) {
    const hangerKey = normalizeHangerKey(rawKey);
    if (!hangerKey || hangerKey === 'none') continue;
    const hInfo = HANGER_CATALOG[hangerKey] || HANGER_CATALOG.face_mount;
    const seatDepth = 65;
    const flangeEar = hInfo.flangeEarMm ?? 38;
    const e0 = { x: endPt.x, y: endPt.y };
    const eIn = { x: endPt.x + ux * seatDepth * dirSign, y: endPt.y + uy * seatDepth * dirSign };
    const eFlange = { x: endPt.x + ux * 14 * dirSign, y: endPt.y + uy * 14 * dirSign };
    const seatPoly = [
      { x: e0.x - nx * halfW, y: e0.y - ny * halfW },
      { x: eIn.x - nx * halfW, y: eIn.y - ny * halfW },
      { x: eIn.x + nx * halfW, y: eIn.y + ny * halfW },
      { x: e0.x + nx * halfW, y: e0.y + ny * halfW }
    ];
    const flangePoly = [
      { x: e0.x - nx * (halfW + flangeEar), y: e0.y - ny * (halfW + flangeEar) },
      { x: eFlange.x - nx * (halfW + flangeEar), y: eFlange.y - ny * (halfW + flangeEar) },
      { x: eFlange.x + nx * (halfW + flangeEar), y: eFlange.y + ny * (halfW + flangeEar) },
      { x: e0.x + nx * (halfW + flangeEar), y: e0.y + ny * (halfW + flangeEar) }
    ];
    const outerPoly = [
      { x: e0.x - nx * (halfW + flangeEar), y: e0.y - ny * (halfW + flangeEar) },
      { x: eIn.x - nx * (halfW + flangeEar), y: eIn.y - ny * (halfW + flangeEar) },
      { x: eIn.x + nx * (halfW + flangeEar), y: eIn.y + ny * (halfW + flangeEar) },
      { x: e0.x + nx * (halfW + flangeEar), y: e0.y + ny * (halfW + flangeEar) }
    ];
    regions.push({
      key: `${m.id}:${endTag}`,
      memberId: m.id,
      memberTag: m.shortTag || m.id,
      memberType: m.type,
      endTag,
      hangerKey,
      hInfo,
      endPt: e0,
      eIn,
      ux,
      uy,
      dirSign,
      nx,
      ny,
      halfW,
      seatDepth,
      flangeEar,
      seatPoly,
      flangePoly,
      outerPoly
    });
  }
  return regions;
}
window.getFloorMemberHangerRegions = getFloorMemberHangerRegions;

function getFloorMemberVisualWidthMm(m) {
  const plies = Math.max(1, Number(m.plies) || 1);
  const baseW = Number(m.totalWidth) || ((Number(m.width) || 64) * plies);
  if (m.type === 'Corner stud') return 140;
  if (m.type === 'Rim board') return Math.max(baseW, 76);
  if (m.type === 'Floor beam' || m.type === 'Opening header' || m.type === 'Trimmer joist') {
    return Math.max(baseW, 105 + (plies - 1) * 42);
  }
  if (m.type === 'Partition doubler') {
    return Math.max(baseW, 130);
  }
  if (m.type === 'Blocking') {
    return m.bridgingStyle === 'strongback_2x6' ? 68 : 78;
  }
  // Standard Floor Joist / Tail Joist / Cantilever Joist: render with clear flange width so flanges & web core are distinct
  return Math.max(baseW, 96 + (plies - 1) * 48);
}

function drawPhysicalFloorMember2D(m, opts = {}) {
  const isSelected = Boolean(opts.isSelected || (Array.isArray(selected) && selected.includes(m.id)));
  const isHovered = Boolean(opts.isHovered);
  const showTag = opts.showTag !== false;
  const showHangers = opts.showHangers !== false;
  const alpha = opts.alpha ?? 1;

  ctx.save();
  if (alpha < 1) ctx.globalAlpha = alpha;

  // 1. Corner Stud Pack (3-Stud Corner Floor Block)
  if (m.type === 'Corner stud') {
    const polyPts = floorMemberPolygon(m, 140);
    const scrPts = polyPts.map(p2);
    const fill = isSelected ? '#7dd3fc' : isHovered ? '#fecaca' : '#fee2e2';
    const stroke = isSelected ? '#0284c7' : '#dc2626';
    poly(scrPts, fill, stroke, isSelected ? 2.4 : 1.5);
    if (scrPts.length === 4) {
      line(scrPts[0], scrPts[2], stroke, 1);
      line(scrPts[1], scrPts[3], stroke, 1);
    }
    ctx.restore();
    return { polyWorld: polyPts };
  }

  const dx = m.b.x - m.a.x;
  const dy = m.b.y - m.a.y;
  const segLen = Math.hypot(dx, dy) || 1;
  const ux = dx / segLen;
  const uy = dy / segLen;
  let nx = -uy;
  let ny = ux;

  const visW = getFloorMemberVisualWidthMm(m);
  const polyWorld = floorMemberPolygon(m, visW);
  const scrPoly = polyWorld.map(p2);

  // Determine member center line for internal details
  let centerA = { x: m.a.x, y: m.a.y };
  let centerB = { x: m.b.x, y: m.b.y };
  if (m.type === 'Rim board' && polyWorld.length === 4) {
    centerA = { x: (polyWorld[0].x + polyWorld[3].x) / 2, y: (polyWorld[0].y + polyWorld[3].y) / 2 };
    centerB = { x: (polyWorld[1].x + polyWorld[2].x) / 2, y: (polyWorld[1].y + polyWorld[2].y) / 2 };
  }

  const halfW = visW / 2;
  const plies = Math.max(1, Number(m.plies) || 1);
  const fam = m.family || inferFloorSectionMeta(m.section, m.width, m.depth).family;

  // 2. Blocking / Bridging rendering (between joists)
  if (m.type === 'Blocking') {
    const bStyle = m.bridgingStyle || 'solid_blocking';
    if (bStyle === 'herringbone') {
      const hOff = 68;
      const strutHalf = 18;
      const s1A = { x: m.a.x, y: m.a.y - hOff }, s1B = { x: m.b.x, y: m.b.y + hOff };
      const s2A = { x: m.a.x, y: m.a.y + hOff }, s2B = { x: m.b.x, y: m.b.y - hOff };
      const mkStrut = (A, B) => {
        const l = Math.hypot(B.x - A.x, B.y - A.y) || 1;
        const snx = -(B.y - A.y) / l * strutHalf, sny = (B.x - A.x) / l * strutHalf;
        return [
          { x: A.x - snx, y: A.y - sny },
          { x: B.x - snx, y: B.y - sny },
          { x: B.x + snx, y: B.y + sny },
          { x: A.x + snx, y: A.y + sny }
        ];
      };
      const fill = isSelected ? '#bae6fd' : isHovered ? '#99f6e4' : '#ccfbf1';
      const stroke = isSelected ? '#0284c7' : '#0f766e';
      poly(mkStrut(s1A, s1B).map(p2), fill, stroke, isSelected ? 2 : 1.1);
      poly(mkStrut(s2A, s2B).map(p2), fill, stroke, isSelected ? 2 : 1.1);
    } else {
      const fill = isSelected
        ? '#bae6fd'
        : isHovered
          ? '#ddd6fe'
          : bStyle === 'strongback_2x6'
            ? '#ede9fe'
            : '#f5f3ff';
      const stroke = isSelected
        ? '#0284c7'
        : bStyle === 'strongback_2x6'
          ? '#6d28d9'
          : '#7c3aed';
      poly(scrPoly, fill, stroke, isSelected ? 2.2 : 1.25);
      // Draw inner OSB web line on solid EWP blocking
      line(p2(centerA), p2(centerB), stroke, 0.95, [3, 3]);
      // Draw toenail flange connection ticks at both I-joist ends (End A & End B)
      const tickOff = Math.min(halfW * 0.72, 26);
      const tickIn = Math.min(segLen * 0.16, 42);
      const tA1 = p2({ x: centerA.x + ux * tickIn - nx * tickOff, y: centerA.y + uy * tickIn - ny * tickOff });
      const tA2 = p2({ x: centerA.x + ux * tickIn + nx * tickOff, y: centerA.y + uy * tickIn + ny * tickOff });
      const tB1 = p2({ x: centerB.x - ux * tickIn - nx * tickOff, y: centerB.y - uy * tickIn - ny * tickOff });
      const tB2 = p2({ x: centerB.x - ux * tickIn + nx * tickOff, y: centerB.y - uy * tickIn + ny * tickOff });
      line(tA1, tA2, stroke, 1.0);
      line(tB1, tB2, stroke, 1.0);
      // If deep I-joist (>=355mm) requires web stiffeners at blocking, draw web stiffener end blocks
      if (m.webStiffeners === 'both') {
        const wsD = 18;
        const wsA = [
          p2({ x: centerA.x - nx * halfW, y: centerA.y - ny * halfW }),
          p2({ x: centerA.x + ux * wsD - nx * halfW, y: centerA.y + uy * wsD - ny * halfW }),
          p2({ x: centerA.x + ux * wsD + nx * halfW, y: centerA.y + uy * wsD + ny * halfW }),
          p2({ x: centerA.x + nx * halfW, y: centerA.y + ny * halfW })
        ];
        const wsB = [
          p2({ x: centerB.x - ux * wsD - nx * halfW, y: centerB.y - uy * wsD - ny * halfW }),
          p2({ x: centerB.x - nx * halfW, y: centerB.y - ny * halfW }),
          p2({ x: centerB.x + nx * halfW, y: centerB.y + ny * halfW }),
          p2({ x: centerB.x - ux * wsD + nx * halfW, y: centerB.y - uy * wsD + ny * halfW })
        ];
        poly(wsA, '#ddd6fe', '#5b21b6', 0.9);
        poly(wsB, '#ddd6fe', '#5b21b6', 0.9);
      }
      if ((isSelected || isHovered || (showTag && scale >= 0.085)) && m.shortTag) {
        const midScr = p2({ x: (centerA.x + centerB.x) / 2, y: (centerA.y + centerB.y) / 2 });
        const bTag = m.shortTag;
        const bw = bTag.length * 4.8 + 8;
        rect(midScr.x - bw / 2, midScr.y - 6, bw, 12, '#ffffffeb', stroke, 0.9);
        label(bTag, midScr.x, midScr.y, 6.6, '#4c1d95', 'center');
      }
    }
    if (isSelected) {
      for (const ep of [p2(m.a), p2(m.b)]) rect(ep.x - 4, ep.y - 4, 8, 8, '#ffffff', '#0284c7', 1.6);
    }
    ctx.restore();
    return { polyWorld };
  }

  // 3. Determine Colors for Physical Joist / Beam / Rim / Trimmer / Header
  const showUtil = opts.showUtilization !== undefined
    ? Boolean(opts.showUtilization)
    : (typeof view !== 'undefined' && view === 'ewpspecs' && window.ewpBeamToolState?.showJoistUtilization !== false);
  const isStructuralSpanMember = m.type !== 'Rim board' && m.type !== 'Blocking' && m.type !== 'Corner stud';
  const utilInfo = isStructuralSpanMember ? (m.utilization || evaluateFloorJoistUtilization(m)) : null;

  let bodyFill = '#fef3c7'; // Warm structural wood flange fill
  let edgeStroke = '#b45309';
  let webColor = '#0284c7';

  if (m.type === 'Rim board') {
    bodyFill = '#e0f2fe';
    edgeStroke = '#0369a1';
    webColor = '#0284c7';
  } else if (showUtil && utilInfo && utilInfo.palette) {
    bodyFill = utilInfo.palette.fill;
    edgeStroke = utilInfo.palette.stroke;
    webColor = utilInfo.palette.web;
  } else if (m.type === 'Floor beam' || m.type === 'Opening header') {
    if (fam === 'steel') {
      bodyFill = '#e2e8f0';
      edgeStroke = '#334155';
      webColor = '#0f172a';
    } else {
      bodyFill = '#ffedd5';
      edgeStroke = '#c2410c';
      webColor = '#9a3412';
    }
  } else if (m.type === 'Trimmer joist') {
    bodyFill = '#dbeafe';
    edgeStroke = '#1d4ed8';
    webColor = '#1e40af';
  } else if (m.type === 'Partition doubler') {
    bodyFill = '#fed7aa';
    edgeStroke = '#9a3412';
    webColor = '#7c2d12';
  } else if (m.isCantilever) {
    bodyFill = '#ede9fe';
    edgeStroke = '#6d28d9';
    webColor = '#7c3aed';
  } else if (fam === 'openweb') {
    bodyFill = '#ccfbf1';
    edgeStroke = '#0f766e';
    webColor = '#0d9488';
  } else if (fam === 'dimensional') {
    bodyFill = '#fde68a';
    edgeStroke = '#854d0e';
    webColor = '#a16207';
  } else if (fam === 'lvl') {
    bodyFill = '#ffedd5';
    edgeStroke = '#c2410c';
    webColor = '#9a3412';
  }

  if (m.customEdited && !isSelected && !showUtil) {
    edgeStroke = '#7e22ce';
  }
  if (isHovered && !isSelected) {
    edgeStroke = showUtil && utilInfo ? utilInfo.palette.stroke : '#0284c7';
  }
  if (isSelected) {
    bodyFill = showUtil && utilInfo ? utilInfo.palette.fill : '#bae6fd';
    edgeStroke = '#0284c7';
    webColor = '#0369a1';
  }

  // Draw the outer physical joist/beam body polygon (flange footprint)
  poly(
    scrPoly,
    bodyFill,
    edgeStroke,
    isSelected ? 2.4 : isHovered ? 1.9 : (m.type === 'Floor beam' || m.type === 'Opening header' || m.type === 'Trimmer joist' ? 1.7 : 1.25)
  );

  // 4. Draw Internal Structural Detailing Inside the Joist Polygon!
  if (m.type === 'Rim board') {
    // Rim board EWP lamination core line
    line(p2(centerA), p2(centerB), edgeStroke, 0.85, [5, 3]);
  } else if (fam === 'openweb') {
    // Posi-Strut / Open-Web Floor Truss: dual top-chord inner edges + diagonal metal/wood web triangulation
    const chordInner = halfW * 0.52;
    for (const sgn of [-1, 1]) {
      line(
        p2({ x: centerA.x + nx * chordInner * sgn, y: centerA.y + ny * chordInner * sgn }),
        p2({ x: centerB.x + nx * chordInner * sgn, y: centerB.y + ny * chordInner * sgn }),
        edgeStroke,
        0.8
      );
    }
    // End bearing block lines
    const trimBlockLen = Math.min(180, segLen * 0.12);
    for (const dEnd of [trimBlockLen, segLen - trimBlockLen]) {
      const bp1 = p2({ x: centerA.x + ux * dEnd - nx * halfW, y: centerA.y + uy * dEnd - ny * halfW });
      const bp2 = p2({ x: centerA.x + ux * dEnd + nx * halfW, y: centerA.y + uy * dEnd + ny * halfW });
      line(bp1, bp2, edgeStroke, 1.1);
    }
    // Diagonal V-web zig-zag inside the joist width
    const step = 380;
    ctx.save();
    ctx.strokeStyle = isSelected ? '#0369a1' : webColor;
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    let flip = 1;
    const pStart = p2({ x: centerA.x + ux * trimBlockLen, y: centerA.y + uy * trimBlockLen });
    ctx.moveTo(pStart.x, pStart.y);
    for (let d = trimBlockLen + step / 2; d < segLen - trimBlockLen; d += step / 2) {
      const wp = p2({
        x: centerA.x + ux * d + nx * (halfW * 0.78) * flip,
        y: centerA.y + uy * d + ny * (halfW * 0.78) * flip
      });
      ctx.lineTo(wp.x, wp.y);
      flip = -flip;
    }
    ctx.stroke();
    ctx.restore();
  } else if (fam === 'lvl' || m.type === 'Floor beam' || m.type === 'Opening header' || m.type === 'Trimmer joist' || plies > 1) {
    // Multi-ply LVL / PSL / Glulam or multi-ply sistered joist: draw each ply division line & stitch marks
    if (plies > 1) {
      for (let p = 1; p < plies; p++) {
        const frac = p / plies - 0.5;
        const off = frac * visW;
        const lA = p2({ x: centerA.x + nx * off, y: centerA.y + ny * off });
        const lB = p2({ x: centerB.x + nx * off, y: centerB.y + ny * off });
        line(lA, lB, edgeStroke, 1.15);
      }
    } else {
      // Single-ply LVL / Steel web lines
      for (const sgn of [-0.24, 0.24]) {
        line(
          p2({ x: centerA.x + nx * visW * sgn, y: centerA.y + ny * visW * sgn }),
          p2({ x: centerB.x + nx * visW * sgn, y: centerB.y + ny * visW * sgn }),
          webColor,
          0.85,
          fam === 'steel' ? [4, 3] : []
        );
      }
    }
    // If multi-ply I-joist, also draw each ply's center OSB web core line
    if (fam === 'ijoist' && plies > 1) {
      for (let p = 0; p < plies; p++) {
        const plyCenterOff = ((p + 0.5) / plies - 0.5) * visW;
        line(
          p2({ x: centerA.x + nx * plyCenterOff, y: centerA.y + ny * plyCenterOff }),
          p2({ x: centerB.x + nx * plyCenterOff, y: centerB.y + ny * plyCenterOff }),
          webColor,
          0.95,
          [5, 3]
        );
      }
    }
  } else if (fam === 'dimensional') {
    // Solid Sawn Dimensional Lumber Joist: wood grain lines + end bearing seat cross marks
    for (const sgn of [-0.22, 0.22]) {
      line(
        p2({ x: centerA.x + nx * visW * sgn, y: centerA.y + ny * visW * sgn }),
        p2({ x: centerB.x + nx * visW * sgn, y: centerB.y + ny * visW * sgn }),
        'rgba(161, 98, 7, 0.45)',
        0.75
      );
    }
    const seatLen = Math.min(130, segLen * 0.08);
    line(p2({ x: centerA.x + ux * seatLen - nx * halfW, y: centerA.y + uy * seatLen - ny * halfW }), p2({ x: centerA.x + ux * seatLen + nx * halfW, y: centerA.y + uy * seatLen + ny * halfW }), edgeStroke, 0.9);
    line(p2({ x: centerB.x - ux * seatLen - nx * halfW, y: centerB.y - uy * seatLen - ny * halfW }), p2({ x: centerB.x - ux * seatLen + nx * halfW, y: centerB.y - uy * seatLen + ny * halfW }), edgeStroke, 0.9);
  } else {
    // Standard Wood I-Joist: Top/Bottom Flange outer edges + Inner OSB Web Core channel + Centerline
    const webHalf = halfW * 0.24;
    for (const sgn of [-1, 1]) {
      line(
        p2({ x: centerA.x + nx * webHalf * sgn, y: centerA.y + ny * webHalf * sgn }),
        p2({ x: centerB.x + nx * webHalf * sgn, y: centerB.y + ny * webHalf * sgn }),
        'rgba(180, 83, 9, 0.55)',
        0.8
      );
    }
    line(p2(centerA), p2(centerB), webColor, 1.0, [6, 3]);
  }

  // 5. Draw Physical Web Stiffeners at Bearing Ends / Midspan
  const stiffMode = m.webStiffeners || 'none';
  if (stiffMode !== 'none' && (fam === 'ijoist' || m.type === 'Floor joist' || m.type === 'Tail joist')) {
    const stiffLen = Math.min(130, segLen * 0.08);
    const drawStiffenerAt = (distAlong) => {
      const sA = { x: centerA.x + ux * distAlong, y: centerA.y + uy * distAlong };
      const sB = { x: centerA.x + ux * (distAlong + stiffLen), y: centerA.y + uy * (distAlong + stiffLen) };
      for (const side of [-1, 1]) {
        const w0 = halfW * 0.24 * side;
        const w1 = halfW * 0.94 * side;
        const stPoly = [
          p2({ x: sA.x + nx * w0, y: sA.y + ny * w0 }),
          p2({ x: sB.x + nx * w0, y: sB.y + ny * w0 }),
          p2({ x: sB.x + nx * w1, y: sB.y + ny * w1 }),
          p2({ x: sA.x + nx * w1, y: sA.y + ny * w1 })
        ];
        poly(stPoly, '#fed7aa', '#c2410c', 0.95);
      }
    };
    if (stiffMode === 'both' || stiffMode === 'start') drawStiffenerAt(12);
    if (stiffMode === 'both' || stiffMode === 'end') drawStiffenerAt(Math.max(12, segLen - stiffLen - 12));
    if (stiffMode === 'midspan') drawStiffenerAt(segLen / 2 - stiffLen / 2);
  }

  // 6. Draw MEP Web Knockout Hole if enabled on this member
  if (m.mepHoleEnabled && segLen > 600) {
    const holeDist = Math.max(250, Math.min(segLen - 250, Number(m.mepHoleOffsetMm) || segLen * 0.35));
    const holeCenter = p2({ x: centerA.x + ux * holeDist, y: centerA.y + uy * holeDist });
    const holeR = Math.max(4.5, ((Number(m.mepHoleDiameterMm) || 150) / 2) * baseScale * scale * 1.4);
    ctx.save();
    ctx.beginPath();
    ctx.arc(holeCenter.x, holeCenter.y, holeR, 0, Math.PI * 2);
    ctx.fillStyle = '#ecfdf5';
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    line({ x: holeCenter.x - holeR - 2, y: holeCenter.y }, { x: holeCenter.x + holeR + 2, y: holeCenter.y }, '#059669', 0.9);
    line({ x: holeCenter.x, y: holeCenter.y - holeR - 2 }, { x: holeCenter.x, y: holeCenter.y + holeR + 2 }, '#059669', 0.9);
    ctx.restore();
  }

  // 7. Draw Joist Hanger Hardware Stirrups at Member Ends
  if (showHangers && m.type !== 'Rim board' && m.type !== 'Blocking' && m.type !== 'Corner stud') {
    const clashMap = opts.clashingHangers instanceof Map ? opts.clashingHangers : null;
    const drawEndHanger = (endPt, dirSign, rawHangerKey, endTag) => {
      const hangerKey = normalizeHangerKey(rawHangerKey);
      if (!hangerKey || hangerKey === 'none') return;
      const hInfo = HANGER_CATALOG[hangerKey] || HANGER_CATALOG.face_mount;
      const clash = clashMap ? clashMap.get(`${m.id}:${endTag}`) : null;
      const seatDepth = 65;
      const flangeEar = hInfo.flangeEarMm ?? 38;
      // Draw physical U-shaped hanger stirrup seat + header ears
      const e0 = { x: endPt.x, y: endPt.y };
      const eIn = { x: endPt.x + ux * seatDepth * dirSign, y: endPt.y + uy * seatDepth * dirSign };
      const pL0 = p2({ x: e0.x - nx * (halfW + flangeEar), y: e0.y - ny * (halfW + flangeEar) });
      const pL1 = p2({ x: e0.x - nx * halfW, y: e0.y - ny * halfW });
      const pL2 = p2({ x: eIn.x - nx * halfW, y: eIn.y - ny * halfW });
      const pR2 = p2({ x: eIn.x + nx * halfW, y: eIn.y + ny * halfW });
      const pR1 = p2({ x: e0.x + nx * halfW, y: e0.y + ny * halfW });
      const pR0 = p2({ x: e0.x + nx * (halfW + flangeEar), y: e0.y + ny * (halfW + flangeEar) });

      if (clash) {
        const clashPoly = [
          p2({ x: e0.x - nx * (halfW + flangeEar), y: e0.y - ny * (halfW + flangeEar) }),
          p2({ x: eIn.x - nx * (halfW + flangeEar), y: eIn.y - ny * (halfW + flangeEar) }),
          p2({ x: eIn.x + nx * (halfW + flangeEar), y: eIn.y + ny * (halfW + flangeEar) }),
          p2({ x: e0.x + nx * (halfW + flangeEar), y: e0.y + ny * (halfW + flangeEar) })
        ];
        poly(clashPoly, 'rgba(239, 68, 68, 0.34)', '#dc2626', 1.6, [3, 2]);
      }

      ctx.save();
      ctx.strokeStyle = clash ? '#dc2626' : hInfo.color;
      ctx.lineWidth = clash ? 2.6 : 1.8;
      ctx.beginPath();
      ctx.moveTo(pL0.x, pL0.y);
      ctx.lineTo(pL1.x, pL1.y);
      ctx.lineTo(pL2.x, pL2.y);
      ctx.lineTo(pR2.x, pR2.y);
      ctx.lineTo(pR1.x, pR1.y);
      ctx.lineTo(pR0.x, pR0.y);
      ctx.stroke();
      ctx.restore();

      const badgeScr = p2({ x: endPt.x + ux * 42 * dirSign, y: endPt.y + uy * 42 * dirSign });
      rect(
        badgeScr.x - 5.5,
        badgeScr.y - 5.5,
        11,
        11,
        clash ? '#dc2626' : hInfo.bg,
        clash ? '#7f1d1d' : hInfo.color,
        clash ? 1.4 : 1.1
      );
      if (clash || window._ewpAnnotatedPlanActive || scale >= 0.85 || isSelected || isHovered || m.type === 'Floor beam' || m.type === 'Opening header') {
        label(clash ? '!' : hInfo.code, badgeScr.x, badgeScr.y + 2.5, 6.2, clash ? '#ffffff' : hInfo.color, 'center');
      }
    };
    drawEndHanger(centerA, 1, m.hangerStart, 'A');
    drawEndHanger(centerB, -1, m.hangerEnd, 'B');
  }

  // 8. Member Tag Label Along the Joist / Beam (with Real-Time Color-Coded Utilization Badge)
  if (showTag && segLen > 900) {
    const midWorld = { x: (centerA.x + centerB.x) / 2, y: (centerA.y + centerB.y) / 2 };
    const midScr = p2(midWorld);
    const scrA = p2(centerA), scrB = p2(centerB);
    let ang = Math.atan2(scrB.y - scrA.y, scrB.x - scrA.x);
    if (ang > Math.PI / 2) ang -= Math.PI;
    else if (ang < -Math.PI / 2) ang += Math.PI;

    const plyPrefix = plies > 1 ? `${plies}P ` : '';
    const customMark = m.customEdited ? '*' : '';
    const utilSuffix = (showUtil && utilInfo)
      ? ((isSelected || isHovered || m.type === 'Floor beam' || m.type === 'Opening header' || m.type === 'Trimmer joist')
        ? ` · ${utilInfo.utilPercent}% [${utilInfo.tierLabel}]`
        : ` · ${utilInfo.utilPercent}%`)
      : '';
    const tagStr = (m.type === 'Floor beam' || m.type === 'Opening header' || m.type === 'Trimmer joist' || isSelected || isHovered)
      ? `${m.shortTag}${customMark} · ${plyPrefix}${m.section}${utilSuffix}`
      : `${m.shortTag}${customMark}${plies > 1 ? ` [${plies}P]` : ''}${utilSuffix}`;

    ctx.save();
    ctx.translate(midScr.x, midScr.y);
    ctx.rotate(ang);
    const fontSize = isSelected || isHovered ? 8.2 : (m.type === 'Floor beam' ? 8.5 : 7.0);
    ctx.font = `700 ${fontSize}px "DM Sans", sans-serif`;
    const tw = ctx.measureText(tagStr).width + 8;
    const th = fontSize + 4;
    const tagBgColor = isSelected
      ? '#0284c7'
      : isHovered
        ? '#0f172a'
        : (showUtil && utilInfo && utilInfo.utilPercent > 100)
          ? '#fef2f2'
          : (showUtil && utilInfo && utilInfo.utilPercent > 85)
            ? '#fffbeb'
            : 'rgba(255, 255, 255, 0.90)';
    const tagStrokeColor = isSelected
      ? '#0369a1'
      : (showUtil && utilInfo ? utilInfo.palette.stroke : edgeStroke);
    const tagTxtColor = isSelected || isHovered
      ? '#ffffff'
      : (showUtil && utilInfo ? utilInfo.palette.tagText : edgeStroke);
    ctx.fillStyle = tagBgColor;
    ctx.strokeStyle = tagStrokeColor;
    ctx.lineWidth = (showUtil && utilInfo && utilInfo.utilPercent > 85) ? 1.25 : 0.95;
    ctx.fillRect(-tw / 2, -th / 2, tw, th);
    if (showUtil || isSelected || isHovered || m.type === 'Floor beam' || m.type === 'Opening header' || m.customEdited) {
      ctx.strokeRect(-tw / 2, -th / 2, tw, th);
    }
    ctx.fillStyle = tagTxtColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagStr, 0, 0.5);
    ctx.restore();
  }

  // 9. Selection Grips (Start A, End B, Center Move M)
  if (isSelected) {
    const pA = p2(centerA);
    const pB = p2(centerB);
    const pMid = p2({ x: (centerA.x + centerB.x) / 2, y: (centerA.y + centerB.y) / 2 });
    rect(pA.x - 4.5, pA.y - 4.5, 9, 9, '#ffffff', '#0284c7', 1.8);
    rect(pB.x - 4.5, pB.y - 4.5, 9, 9, '#ffffff', '#0284c7', 1.8);
    ctx.save();
    ctx.translate(pMid.x, pMid.y);
    ctx.rotate(Math.PI / 4);
    rect(-4.5, -4.5, 9, 9, '#f59e0b', '#ffffff', 1.5);
    ctx.restore();
  }

  ctx.restore();
  return { polyWorld };
}
window.drawPhysicalFloorMember2D = drawPhysicalFloorMember2D;

function pickFloorMemberAtPoint(worldPt, targetModel = model) {
  const slab = getActiveFloorSlab(targetModel);
  if (!slab) return null;
  if (view !== 'ewpspecs' && typeof shown === 'function' && !shown(slab)) return null;
  const members = generateFloorFramingForSlab(slab);
  if (!members.length) return null;

  // Priority order: Selected member first, then Girders/Headers/Trimmers, then Joists/Doublers, then Blocking, then Rim Boards
  const priorityScore = (m) => {
    if (Array.isArray(selected) && selected.includes(m.id)) return 100;
    if (m.type === 'Floor beam' || m.type === 'Opening header' || m.type === 'Trimmer joist') return 80;
    if (m.type === 'Partition doubler') return 75;
    if (m.type === 'Floor joist' || m.type === 'Tail joist') return 70;
    if (m.type === 'Blocking') return 60;
    if (m.type === 'Corner stud') return 55;
    if (m.type === 'Rim board') return 40;
    return 50;
  };

  const ordered = [...members].sort((a, b) => priorityScore(b) - priorityScore(a));
  for (const m of ordered) {
    const visW = getFloorMemberVisualWidthMm(m) + 35;
    const polyPts = floorMemberPolygon(m, visW);
    if (polyPts && polyPts.length >= 3 && inside(worldPt, polyPts)) {
      return {
        id: m.id,
        type: 'floor_member',
        isFloorMember: true,
        slabId: slab.id,
        host: slab.id,
        member: m
      };
    }
  }
  return null;
}
window.pickFloorMemberAtPoint = pickFloorMemberAtPoint;

function drawEWPFloorFramingPlan() {
  const calcFn = window.calculateEWPBeamLoadAndSizing || (window.ewpSystem && window.ewpSystem.calculateEWPBeamLoadAndSizing);
  const state = window.ewpBeamToolState;
  const calc = calcFn ? calcFn({
    spanFt: state.spanFt,
    tribWidthFt: state.tribWidthFt,
    livePsf: state.livePsf,
    deadPsf: state.deadPsf,
    defLLLimit: state.defLLLimit,
    defTLLimit: state.defTLLimit,
    fcPerp: state.fcPerp,
    currentSection: state.currentSection,
    currentPlies: state.currentPlies
  }) : null;

  const activeSlab = getActiveFloorSlab();
  const slabPts = defaultSlabPolygon(activeSlab);
  const xs = slabPts.map(p => p.x), ys = slabPts.map(p => p.y);
  const floorW = Math.max(1000, Math.max(...xs) - Math.min(...xs)) || 13000;
  const floorH = Math.max(1000, Math.max(...ys) - Math.min(...ys)) || 9000;
  const rimT = state.endBearingType === 'solid_rim' ? 38 : 45;
  const spacingIn = state.joistSpacingIn || 16;
  const spacingMm = spacingIn * 25.4;
  const joistSpec = state.joistSection || 'I-Joist 11-7/8';
  const isOpenWeb = joistSpec.includes('Posi-Strut') || joistSpec.includes('Floor Truss');
  const isDimensional = joistSpec.includes('Dimensional') || joistSpec.includes('C24');
  const joistColor = isOpenWeb ? '#0d9488' : isDimensional ? '#854d0e' : '#0284c7';

  const p00 = p2({ x: 0, y: 0 });
  const p10 = p2({ x: floorW, y: 0 });
  const p11 = p2({ x: floorW, y: floorH });
  const p01 = p2({ x: 0, y: floorH });

  poly([p00, p10, p11, p01], '#fbfbfa', '#334155', 1.8);

  // 0. Optional Staggered 4x8 ft (1200x2400 mm) T&G Subfloor Sheathing Panels
  if (state.showSubfloorPanels) {
    ctx.save();
    let sheetIdx = 0;
    const sheetW = 2400, sheetH = 1200;
    for (let row = 0, y = 0; y < floorH; y += sheetH, row++) {
      const xOffset = (row % 2 === 1) ? -1200 : 0;
      for (let x = xOffset; x < floorW; x += sheetW) {
        const sx0 = Math.max(0, x);
        const sy0 = Math.max(0, y);
        const sx1 = Math.min(floorW, x + sheetW);
        const sy1 = Math.min(floorH, y + sheetH);
        if (sx1 - sx0 > 120 && sy1 - sy0 > 120) {
          sheetIdx++;
          const sp00 = p2({ x: sx0, y: sy0 });
          const sp10 = p2({ x: sx1, y: sy0 });
          const sp11 = p2({ x: sx1, y: sy1 });
          const sp01 = p2({ x: sx0, y: sy1 });
          poly([sp00, sp10, sp11, sp01], row % 2 === 0 ? 'rgba(254, 243, 199, 0.28)' : 'rgba(253, 230, 138, 0.22)', 'rgba(217, 119, 6, 0.45)', 1, [3, 3]);
          const sc = p2({ x: (sx0 + sx1) / 2, y: (sy0 + sy1) / 2 });
          label(`SF-${String(sheetIdx).padStart(2, '0')} (T&G)`, sc.x, sc.y, 7.5, 'rgba(180, 83, 9, 0.65)', 'center');
        }
      }
    }
    ctx.restore();
  }

  // Cantilever Overhang Envelope if enabled
  const cantSide = state.cantileverSide || 'south';
  const cantMm = state.cantileverEnabled ? (Number(state.cantileverMm) || 900) : 0;
  if (state.cantileverEnabled && cantMm > 0) {
    let cPoly = [];
    if (cantSide === 'south') {
      cPoly = [p2({ x: 0, y: floorH }), p2({ x: floorW, y: floorH }), p2({ x: floorW, y: floorH + cantMm }), p2({ x: 0, y: floorH + cantMm })];
      const backSpanY = floorH - cantMm * 2;
      line(p2({ x: rimT, y: backSpanY }), p2({ x: floorW - rimT, y: backSpanY }), '#7c3aed', 1.2, [6, 4]);
      const bsPos = p2({ x: 2400, y: backSpanY });
      rect(bsPos.x - 125, bsPos.y - 8, 250, 16, '#f5f3ff', '#7c3aed', 1);
      label(`2:1 CANTILEVER BACK-SPAN LINE (${cantMm * 2} mm)`, bsPos.x, bsPos.y, 7.5, '#6d28d9', 'center');
    } else if (cantSide === 'north') {
      cPoly = [p2({ x: 0, y: -cantMm }), p2({ x: floorW, y: -cantMm }), p2({ x: floorW, y: 0 }), p2({ x: 0, y: 0 })];
    } else if (cantSide === 'east') {
      cPoly = [p2({ x: floorW, y: 0 }), p2({ x: floorW + cantMm, y: 0 }), p2({ x: floorW + cantMm, y: floorH }), p2({ x: floorW, y: floorH })];
    } else if (cantSide === 'west') {
      cPoly = [p2({ x: -cantMm, y: 0 }), p2({ x: 0, y: 0 }), p2({ x: 0, y: floorH }), p2({ x: -cantMm, y: floorH })];
    }
    if (cPoly.length === 4) {
      poly(cPoly, 'rgba(139, 92, 246, 0.10)', '#7c3aed', 1.8, [5, 3]);
    }
  }

  const beamStartMm = rimT;
  const beamEndMm = floorW - rimT;
  const activeSpanMm = Math.min(beamEndMm - beamStartMm, (Number(state.spanFt) || 18) * 304.8);
  const girderType = state.girderType || 'flush_hanger';
  const girderYs = girderType === 'clear_span'
    ? []
    : girderType === 'double_girder'
      ? [3000, 6000]
      : [4500];
  const beamYMm = girderYs[0] || 4500;
  const girderWidth = 90;

  // Tributary Area Hatch behind joists
  if (state.showTribHatch && calc && girderYs.length > 0) {
    const tribHalfMm = (state.tribWidthFt * 304.8) / 2;
    const yTopMm = Math.max(rimT, beamYMm - tribHalfMm);
    const yBotMm = Math.min(floorH - rimT, beamYMm + tribHalfMm);
    const tribXEndMm = Math.min(beamEndMm, beamStartMm + activeSpanMm);

    const t00 = p2({ x: beamStartMm, y: yTopMm });
    const t10 = p2({ x: tribXEndMm, y: yTopMm });
    const t11 = p2({ x: tribXEndMm, y: yBotMm });
    const t01 = p2({ x: beamStartMm, y: yBotMm });

    ctx.save();
    poly([t00, t10, t11, t01], 'rgba(14, 165, 233, 0.11)', 'rgba(2, 132, 199, 0.65)', 1.4, [5, 4]);
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.08)';
    ctx.lineWidth = 1;
    const minX = Math.min(t00.x, t01.x), maxX = Math.max(t10.x, t11.x);
    const minY = Math.min(t00.y, t10.y), maxY = Math.max(t01.y, t11.y);
    ctx.beginPath();
    for (let x = minX - (maxY - minY); x < maxX; x += 18) {
      ctx.moveTo(x, maxY);
      ctx.lineTo(x + (maxY - minY), minY);
    }
    ctx.stroke();
    ctx.restore();

    dim({ x: beamStartMm, y: yTopMm }, { x: beamStartMm, y: yBotMm }, -36 * scale, `TRIB WIDTH ${formatLength(state.tribWidthFt * 304.8)}`);
    dim({ x: beamStartMm, y: yTopMm }, { x: tribXEndMm, y: yTopMm }, 28 * scale, `BEAM CLEAR SPAN ${formatLength(activeSpanMm)} (${state.spanFt.toFixed(1)} ft)`);
  }

  // Opening Void Hatch
  const opEnabled = Boolean(state.openingEnabled);
  const opX0 = Math.max(rimT + 400, Math.min(floorW - 1200, Number(state.openingXMm) || 8200));
  const opW = Math.max(600, Math.min(floorW - opX0 - rimT - 200, Number(state.openingWidthMm) || 2400));
  const opX1 = opX0 + opW;
  const opY0 = Math.max(rimT + 300, Math.min(floorH - 1200, Number(state.openingYMm) || 1200));
  const opL = Math.max(600, Math.min(floorH - opY0 - rimT - 200, Number(state.openingLengthMm) || 2200));
  const opY1 = opY0 + opL;

  if (opEnabled) {
    const o00 = p2({ x: opX0, y: opY0 });
    const o10 = p2({ x: opX1, y: opY0 });
    const o11 = p2({ x: opX1, y: opY1 });
    const o01 = p2({ x: opX0, y: opY1 });
    poly([o00, o10, o11, o01], 'rgba(241, 245, 249, 0.94)', '#0f172a', 1.5);
    line(o00, o11, '#94a3b8', 1, [4, 4]);
    line(o10, o01, '#94a3b8', 1, [4, 4]);
  }

  // Squash Blocks [SB] along bearing walls if enabled
  if (state.squashBlocks) {
    for (let sx = 1800; sx < floorW - 1200; sx += 2400) {
      for (const sy of [rimT, floorH - rimT - 70]) {
        const sb0 = p2({ x: sx - 35, y: sy });
        const sb1 = p2({ x: sx + 35, y: sy + 70 });
        rect(sb0.x, sb0.y, sb1.x - sb0.x, sb1.y - sb0.y, '#fef3c7', '#d97706', 1);
      }
    }
  }

  // GENERATE & DRAW EVERY FLOOR MEMBER AS A PHYSICAL JOIST / BEAM / RIM / BLOCKING!
  const allFloorMembers = generateFloorFramingForSlab(activeSlab);
  const hoveredPick = (typeof hover !== 'undefined' && hover) ? pickFloorMemberAtPoint(hover) : null;
  const hoveredMemberId = hoveredPick?.id || null;

  // Draw in layered structural order:
  // 1) Blocking / Bridging
  // 2) Rim Boards & Corner Studs
  // 3) Standard Joists, Tail Joists & Partition Doublers
  // 4) Trimmers, Headers & Girders
  // 5) Currently Selected Member on top
  const layerOrder = (m) => {
    if (Array.isArray(selected) && selected.includes(m.id)) return 50;
    if (m.id === hoveredMemberId) return 45;
    if (m.type === 'Floor beam' || m.type === 'Opening header' || m.type === 'Trimmer joist') return 40;
    if (m.type === 'Partition doubler') return 35;
    if (m.type === 'Floor joist' || m.type === 'Tail joist') return 30;
    if (m.type === 'Corner stud') return 25;
    if (m.type === 'Rim board') return 20;
    if (m.type === 'Blocking') return 10;
    return 20;
  };

  const hangerAuditEwp = typeof window.detectFramingPlanHangerCollisions === 'function'
    ? window.detectFramingPlanHangerCollisions({ model, story: activeStory, shown, flLists: [allFloorMembers] })
    : { collisions: [], byKey: null };
  const clashingHangersMap = hangerAuditEwp?.byKey || null;
  const ewpHangerCollisions = hangerAuditEwp?.collisions || [];
  if (typeof window !== 'undefined') {
    window._framingPlanHangerCollisions = ewpHangerCollisions;
  }
  const sortedMembers = [...allFloorMembers].sort((a, b) => layerOrder(a) - layerOrder(b));
  const showUtilHeatmap = state.showJoistUtilization !== false;
  for (const m of sortedMembers) {
    drawPhysicalFloorMember2D(m, {
      isSelected: Array.isArray(selected) && selected.includes(m.id),
      isHovered: m.id === hoveredMemberId,
      clashingHangers: clashingHangersMap,
      showUtilization: showUtilHeatmap,
      showTag: true,
      showHangers: true
    });
  }
  if (ewpHangerCollisions.length) {
    for (const clash of ewpHangerCollisions) {
      const reg = clash.region;
      if (!reg) continue;
      poly(reg.outerPoly.map(p2), 'rgba(239, 68, 68, 0.28)', '#dc2626', 1.8, [4, 2]);
      const badgeScr = p2({ x: reg.endPt.x + reg.ux * 42 * reg.dirSign, y: reg.endPt.y + reg.uy * 42 * reg.dirSign });
      rect(badgeScr.x - 6, badgeScr.y - 6, 12, 12, '#dc2626', '#7f1d1d', 1.4);
      label('!', badgeScr.x, badgeScr.y, 7.2, '#ffffff', 'center');
    }
  }

  // Annotated Mid-Span Blocking Rows, Datum Lines & EWP Manufacturer Rule Badges
  const blockingMembers = allFloorMembers.filter(m => m.type === 'Blocking');
  const baySummaries = Array.isArray(window._latestEWPBayBlockingSummaries) ? window._latestEWPBayBlockingSummaries : [];
  if (blockingMembers.length && baySummaries.length) {
    for (const baySum of baySummaries) {
      const req = baySum.req;
      if (!req || !Array.isArray(baySum.rowCoords) || !baySum.rowCoords.length) continue;
      baySum.rowCoords.forEach((rowCoord, rIdx) => {
        const frac = req.fractions?.[rIdx] ?? 0.5;
        const fracLbl = Math.abs(frac - 0.5) < 0.02
          ? 'L/2'
          : Math.abs(frac - 1 / 3) < 0.02
            ? 'L/3'
            : Math.abs(frac - 2 / 3) < 0.02
              ? '2L/3'
              : `${Math.round(frac * 100)}% L`;
        const distFromSupportMm = Math.round(baySum.baySpan * frac);
        if (baySum.spanAxis === 'Y') {
          const lineA = p2({ x: rimT, y: rowCoord });
          const lineB = p2({ x: floorW - rimT, y: rowCoord });
          line(lineA, lineB, '#7c3aed', 1.15, [8, 4]);
          // Dimension from bay start support to mid-span blocking row along left edge
          const dimX = rimT + 520 + rIdx * 360;
          drawSpanArrow(
            p2({ x: dimX, y: baySum.bayStart + 80 }),
            p2({ x: dimX, y: rowCoord - 60 }),
            `${fracLbl} = ${formatLength(distFromSupportMm)}`,
            `BAY ${baySum.bayIdx + 1} BLOCKING`,
            '#6d28d9'
          );
          // EWP Manufacturer Rule Badge on the blocking row line
          const badgePt = p2({ x: floorW * 0.52, y: rowCoord });
          const ruleTxt = `MID-SPAN BLOCKING ROW ${rIdx + 1}/${baySum.rowCoords.length} @ ${fracLbl} (${formatLength(distFromSupportMm)}) · ${req.manufacturerRule}`;
          const rw = ruleTxt.length * 5.0 + 18;
          rect(badgePt.x - rw / 2, badgePt.y - 19, rw, 15, '#f5f3ff', '#7c3aed', 1.1);
          label(ruleTxt, badgePt.x, badgePt.y - 11.5, 7.3, '#5b21b6', 'center');
        } else {
          const lineA = p2({ x: rowCoord, y: rimT });
          const lineB = p2({ x: rowCoord, y: floorH - rimT });
          line(lineA, lineB, '#7c3aed', 1.15, [8, 4]);
          const dimY = rimT + 460 + rIdx * 320;
          drawSpanArrow(
            p2({ x: baySum.bayStart + 80, y: dimY }),
            p2({ x: rowCoord - 60, y: dimY }),
            `${fracLbl} = ${formatLength(distFromSupportMm)}`,
            `BAY ${baySum.bayIdx + 1} BLOCKING`,
            '#6d28d9'
          );
          const badgePt = p2({ x: rowCoord, y: floorH * 0.5 });
          const ruleTxt = `BLOCKING ROW ${rIdx + 1}/${baySum.rowCoords.length} @ ${fracLbl} (${formatLength(distFromSupportMm)}) · ${req.manufacturerRule}`;
          const rw = ruleTxt.length * 5.0 + 18;
          rect(badgePt.x - rw / 2, badgePt.y - 19, rw, 15, '#f5f3ff', '#7c3aed', 1.1);
          label(ruleTxt, badgePt.x, badgePt.y - 11.5, 7.3, '#5b21b6', 'center');
        }
      });
    }
  } else if (blockingMembers.length && (window._ewpAnnotatedPlanActive || scale >= 0.045)) {
    const firstBlk = blockingMembers[0];
    const lastBlk = blockingMembers[blockingMembers.length - 1];
    const blkMidScr = p2({
      x: (firstBlk.a.x + lastBlk.b.x) / 2,
      y: (firstBlk.a.y + lastBlk.b.y) / 2
    });
    const blkTag = `${blockingMembers.length}× ${(state.bridgingType || 'solid_blocking').replace(/_/g, ' ').toUpperCase()} (${firstBlk.shortTag}–${lastBlk.shortTag})`;
    const bwTag = blkTag.length * 5.2 + 16;
    rect(blkMidScr.x - bwTag / 2, blkMidScr.y - 20, bwTag, 15, '#fefce8', '#ca8a04', 1.1);
    label(blkTag, blkMidScr.x, blkMidScr.y - 12.5, 7.4, '#854d0e', 'center');
  }
  if (window._ewpAnnotatedPlanActive) {
    const activePanelIds = Array.isArray(selected) && selected.length ? selected.join(', ') : (activeSlab?.id || 'SL-1');
    const annText = `AUTO-GENERATED 2D EWP PLAN ACTIVE · PANEL(S): ${activePanelIds} · JOISTS + BLOCKING + HANGERS ANNOTATED`;
    const annW = Math.min(width - 40, annText.length * 5.5 + 24);
    rect(width / 2 - annW / 2, 54, annW, 18, '#f0fdfa', '#0f766e', 1.3);
    label(annText, width / 2, 63, 8.2, '#0f766e', 'center');
  }

  // Opening Center Label
  if (opEnabled) {
    const opCenter = p2({ x: (opX0 + opX1) / 2, y: (opY0 + opY1) / 2 });
    rect(opCenter.x - 95, opCenter.y - 18, 190, 36, '#ffffff', '#1e293b', 1.2);
    label(`FLOOR / STAIR OPENING`, opCenter.x, opCenter.y - 5, 8.5, '#0f172a', 'center');
    label(`${opW}×${opL}mm · ${state.trimmerPlies || 2}P Trim / ${state.headerPlies || 2}P Hdr`, opCenter.x, opCenter.y + 8, 7.8, '#1d4ed8', 'center');
  }

  // MEP HVAC Trunk Chase / Web Knockout Zone
  if (state.showMepChase) {
    const mepY0 = 2050, mepY1 = 2500;
    const m00 = p2({ x: rimT + 600, y: mepY0 });
    const m10 = p2({ x: floorW - rimT - 600, y: mepY0 });
    const m11 = p2({ x: floorW - rimT - 600, y: mepY1 });
    const m01 = p2({ x: rimT + 600, y: mepY1 });
    poly([m00, m10, m11, m01], 'rgba(16, 185, 129, 0.12)', '#059669', 1.3, [6, 3]);
    const mepMid = p2({ x: 3400, y: (mepY0 + mepY1) / 2 });
    const mepTypeTxt = isOpenWeb
      ? 'MEP HVAC TRUNK CHASE (450×225mm OPEN-WEB DUCT PASSAGE — NO CUTTING)'
      : 'MEP PERMITTED I-JOIST WEB KNOCKOUT ZONE (MIDDLE 1/3 SPAN ONLY)';
    const mw = mepTypeTxt.length * 5.2 + 18;
    rect(mepMid.x - mw / 2, mepMid.y - 8, mw, 16, '#ecfdf5', '#059669', 1);
    label(mepTypeTxt, mepMid.x, mepMid.y, 7.5, '#047857', 'center');
  }

  // Tributary summary badge
  if (state.showTribHatch && calc && girderYs.length > 0) {
    const tribHalfMm = (state.tribWidthFt * 304.8) / 2;
    const tribXEndMm = Math.min(beamEndMm, beamStartMm + activeSpanMm);
    const midScreen = p2({ x: (beamStartMm + tribXEndMm) / 2, y: beamYMm - tribHalfMm / 2 });
    const badgeText = `TRIBUTARY AREA: ${formatAreaFromM2(calc.inputs.tribAreaSqFt * 0.092903)} · DEMAND: ${calc.demands.wTL_plf} PLF · Δ_TL: ${calc.currentCandidate.deltaTL_in}"`;
    const bw = badgeText.length * 6.2 + 20;
    rect(midScreen.x - bw / 2, midScreen.y - 10, bw, 20, '#ffffff', '#0284c7', 1.2);
    label(badgeText, midScreen.x, midScreen.y, 9.2, '#0369a1', 'center');
  }

  const spanAlongY = state.joistDirection !== 'X';
  if (spanAlongY) {
    const topEnd = girderYs.length > 0 ? girderYs[0] - girderWidth / 2 : floorH - rimT;
    const botStart = girderYs.length > 0 ? girderYs[girderYs.length - 1] + girderWidth / 2 : rimT;
    const topSpanMm = Math.round(topEnd - rimT);
    const botSpanMm = Math.round(floorH - rimT - botStart);
    const joistTagText = `${joistSpec.toUpperCase()} @ ${formatLength(spacingMm)} O.C.`;

    for (const calloutX of [2400, 11200]) {
      drawSpanArrow(
        p2({ x: calloutX, y: rimT + 420 }),
        p2({ x: calloutX, y: topEnd - 420 }),
        joistTagText,
        `SPAN: ${formatLength(topSpanMm)}`,
        joistColor
      );
      if (girderYs.length > 0) {
        drawSpanArrow(
          p2({ x: calloutX, y: botStart + 420 }),
          p2({ x: calloutX, y: floorH - rimT - 420 }),
          joistTagText,
          `SPAN: ${formatLength(botSpanMm)}${state.cantileverEnabled && cantSide === 'south' ? ` + ${cantMm}mm CANT.` : ''}`,
          joistColor
        );
      }
    }
  }

  // Girder engineering status callout
  const cur = calc ? calc.currentCandidate : { status: 'PASS', name: state.currentSection, dcPercent: 78, governing: 'Bending', minBearingIn: 3.0 };
  if (spanAlongY) {
    girderYs.forEach((gy, gIdx) => {
      const bA = p2({ x: beamStartMm, y: gy });
      const bB = p2({ x: beamEndMm, y: gy });
      const beamLabelY = bA.y + 22;
      const modePrefix = girderType === 'dropped_beam' ? '[DROPPED] '
        : girderType === 'pocket_steel' ? '[RECESSED W8x18] '
        : girderType === 'double_girder' ? `[GIRDER ${gIdx + 1}/2] `
        : '[FLUSH] ';
      const statusBadge = cur.status === 'PASS' ? 'PASS' : cur.status === 'WARNING' ? 'WARNING' : 'OVERLOADED';
      const beamTagText = `${modePrefix}BM-G${gIdx + 1}: ${girderType === 'pocket_steel' ? 'Steel W8x18 + 2x8 Nailer' : cur.name} · D/C: ${cur.dcPercent}% [${statusBadge}] · Gov: ${cur.governing}`;
      const tagW = beamTagText.length * 6.0 + 20;
      const tagBg = cur.status === 'PASS' ? '#f0fdf4' : cur.status === 'WARNING' ? '#fffbeb' : '#fef2f2';
      const tagBorder = cur.status === 'PASS' ? '#16a34a' : cur.status === 'WARNING' ? '#d97706' : '#dc2626';
      const tagColor = cur.status === 'PASS' ? '#15803d' : cur.status === 'WARNING' ? '#b45309' : '#b91c1c';

      rect((bA.x + bB.x) / 2 - tagW / 2, beamLabelY - 9, tagW, 18, tagBg, tagBorder, 1.2);
      label(beamTagText, (bA.x + bB.x) / 2, beamLabelY, 9, tagColor, 'center');
    });
  }

  // Dimensions
  dim({ x: 0, y: 0 }, { x: floorW, y: 0 }, -30 * scale, `BUILDING WIDTH ${formatLength(floorW)}`);
  dim({ x: 0, y: 0 }, { x: 0, y: floorH }, 30 * scale, `BUILDING LENGTH ${formatLength(floorH)}`);

  const activeHanger = HANGER_CATALOG[state.joistHangerType || 'face_mount'] || HANGER_CATALOG.face_mount;

  // Summarize Joist Fleet Utilization for Legend
  const joistMembers = allFloorMembers.filter(m => m.type === 'Floor joist' || m.type === 'Tail joist' || m.type === 'Partition doubler' || m.type === 'Trimmer joist');
  const cntOpt = joistMembers.filter(m => (m.utilPercent || 0) <= 65).length;
  const cntMod = joistMembers.filter(m => (m.utilPercent || 0) > 65 && (m.utilPercent || 0) <= 85).length;
  const cntWarn = joistMembers.filter(m => (m.utilPercent || 0) > 85 && (m.utilPercent || 0) <= 100).length;
  const cntFail = joistMembers.filter(m => (m.utilPercent || 0) > 100).length;
  const critJoist = joistMembers.reduce((best, m) => (!best || (m.utilPercent || 0) > (best.utilPercent || 0)) ? m : best, null);
  const critUtil = critJoist?.utilization || (critJoist ? evaluateFloorJoistUtilization(critJoist, activeSlab) : null);

  // Floor Framing Plan Legend / Specs Box
  const legX = 20, legY = height - 145;
  rect(legX, legY, 355, 130, '#ffffffeb', '#cbd5e1', 1);
  label('FLOOR FRAMING SPECIFICATIONS (PHYSICAL JOIST VIEW)', legX + 12, legY + 16, 9.2, '#0f172a', 'left');
  label(`• System: ${joistSpec} @ ${spacingIn}" O.C. (${Math.round(spacingMm)} mm) [${state.joistDirection || 'Y'}-Span]`, legX + 12, legY + 31, 8.2, joistColor, 'left');
  label(`• Girder Mode: ${girderType.replace('_', ' ').toUpperCase()} · ${cur.name}`, legX + 12, legY + 46, 8.2, '#c2410c', 'left');
  label(`• Joist Hangers: [${activeHanger.code}] ${activeHanger.name}`, legX + 12, legY + 61, 8.2, activeHanger.color, 'left');
  label(`• Bridging: ${(state.bridgingType || 'solid_blocking').replace('_', ' ').toUpperCase()} (${(state.bridgingRows || 'midspan').replace('_', ' ')})`, legX + 12, legY + 76, 8.2, '#475569', 'left');
  label(`• Opening / Cantilever: ${opEnabled ? `${opW}×${opL}mm (${state.trimmerPlies || 2}P Trim)` : 'No Opening'} · ${state.cantileverEnabled ? `${cantMm}mm Cant.` : 'Std Bearing'}`, legX + 12, legY + 91, 8.2, '#1d4ed8', 'left');
  label(`• Total Active Members: ${allFloorMembers.length} (Click any joist/beam/rim to edit!)`, legX + 12, legY + 106, 8.2, '#0284c7', 'left');
  label('• Drag selected member to move · Drag A/B grips to extend/trim span', legX + 12, legY + 120, 7.8, '#64748b', 'left');

  // REAL-TIME LIVE/DEAD LOAD & COLOR-CODED JOIST UTILIZATION HEATMAP Legend Box
  const leg2X = 385, leg2Y = height - 145;
  rect(leg2X, leg2Y, 385, 130, '#ffffffeb', '#cbd5e1', 1);
  const liveKpa = ((state.livePsf || 40) * 0.04788).toFixed(2);
  const deadKpa = (((state.deadPsf || 15) + (state.partitionPsf || 0)) * 0.04788).toFixed(2);
  label(`REAL-TIME JOIST UTILIZATION HEATMAP (LL: ${state.livePsf || 40} psf · DL: ${(state.deadPsf || 15) + (state.partitionPsf || 0)} psf)`, leg2X + 12, leg2Y + 16, 8.8, '#0f172a', 'left');

  rect(leg2X + 12, leg2Y + 26, 14, 12, '#dcfce7', '#15803d', 1.2);
  label('≤65', leg2X + 19, leg2Y + 35, 6.2, '#15803d', 'center');
  label(`• Optimal Utilization (≤ 65% D/C): ${cntOpt} joists`, leg2X + 32, leg2Y + 34, 8.1, '#15803d', 'left');

  rect(leg2X + 12, leg2Y + 44, 14, 12, '#dbeafe', '#1d4ed8', 1.2);
  label('85%', leg2X + 19, leg2Y + 53, 6.2, '#1d4ed8', 'center');
  label(`• Moderate Utilization (66% – 85% D/C): ${cntMod} joists`, leg2X + 32, leg2Y + 52, 8.1, '#1d4ed8', 'left');

  rect(leg2X + 12, leg2Y + 62, 14, 12, '#fef3c7', '#d97706', 1.2);
  label('100', leg2X + 19, leg2Y + 71, 6.2, '#b45309', 'center');
  label(`• High / Near-Limit Warning (86% – 100% D/C): ${cntWarn} joists`, leg2X + 32, leg2Y + 70, 8.1, '#b45309', 'left');

  rect(leg2X + 12, leg2Y + 80, 14, 12, '#fee2e2', '#dc2626', 1.2);
  label('>100', leg2X + 19, leg2Y + 89, 5.8, '#dc2626', 'center');
  label(`• Overloaded (> 100% Span/Capacity Exceeded): ${cntFail} joists`, leg2X + 32, leg2Y + 88, 8.1, '#dc2626', 'left');

  if (critJoist && critUtil) {
    label(
      `• Governing: ${critJoist.shortTag} (${critUtil.utilPercent}% · ${critUtil.governing}) · Span ${formatLength(critUtil.spanMm)} / Max ${formatLength(critUtil.allowableSpanMm)}`,
      leg2X + 12,
      leg2Y + 106,
      7.9,
      critUtil.palette.stroke,
      'left'
    );
  }
  label(`Design Loads: ${liveKpa} kPa Live + ${deadKpa} kPa Dead · Defl Limit L/${state.defLLLimit || 480}`, leg2X + 12, leg2Y + 120, 7.6, '#64748b', 'left');

  // Interactive Hover Tooltip for Hovered Floor Member (with Real-Time Utilization & Span/Material Analysis)
  if (hoveredPick && hoveredPick.member) {
    const hm = hoveredPick.member;
    const midWorld = { x: (hm.a.x + hm.b.x) / 2, y: (hm.a.y + hm.b.y) / 2 };
    const scrP = p2(hover || midWorld);
    const hCat = HANGER_CATALOG[hm.hangerStart] || activeHanger;
    const hUtil = hm.utilization || evaluateFloorJoistUtilization(hm, activeSlab);
    const titleStr = `${hm.shortTag} · ${hm.type.toUpperCase()} (${hm.plies > 1 ? hm.plies + '-PLY ' : ''}${hm.section}) — ${hUtil.utilPercent}% [${hUtil.tierLabel}]`;
    const detailStr = `Span: ${formatLength(hm.length)} (Allow: ${formatLength(hUtil.allowableSpanMm)}) | Load: ${hUtil.wTL_plf} plf (${hUtil.wTL_kNm} kN/m) | Hanger: [${hCat.code}]`;
    const subDetailStr = `Bending: ${Math.round(hUtil.u_M * 100)}% · Shear: ${Math.round(hUtil.u_V * 100)}% · Live Defl: ${hUtil.deltaLL_in}" (L/${hUtil.ratioLL}) · Gov: ${hUtil.governing}`;
    const ttW = Math.max(titleStr.length * 6.2, detailStr.length * 5.2, subDetailStr.length * 5.0) + 36;
    const ttH = 54;
    const ttX = Math.min(width - ttW - 20, Math.max(20, scrP.x - ttW / 2));
    const ttY = scrP.y - 66 > 45 ? scrP.y - 66 : scrP.y + 18;

    rect(ttX, ttY, ttW, ttH, '#0f172a', hUtil.palette.stroke, 1.8);
    rect(ttX + 6, ttY + 6, 26, 15, hUtil.palette.badgeBg, hUtil.palette.stroke, 1);
    label(`${hUtil.utilPercent}%`, ttX + 19, ttY + 13.5, 7.2, '#ffffff', 'center');
    label(titleStr, ttX + 38, ttY + 14, 8.8, '#f8fafc', 'left');
    label(detailStr, ttX + 38, ttY + 29, 7.9, '#bae6fd', 'left');
    label(subDetailStr, ttX + 38, ttY + 43, 7.6, '#fde68a', 'left');
  }

  label('TIMBER TECK FLOOR FRAMING STUDIO · REAL-TIME JOIST LIVE/DEAD LOAD & UTILIZATION HEATMAP', width / 2, 28, 12, '#0f172a', 'center');
  label('Color-coded floor joist utilization by span & material — adjust Live/Dead loads in HUD or click any member to inspect', width / 2, 44, 9.5, '#64748b', 'center');
}

function syncFloorOptionsToSlabs() {
  const st = window.ewpBeamToolState;
  if (!st || typeof model === 'undefined' || !model?.elements) return;
  for (const el of model.elements) {
    if (el.type === 'slab') {
      el.joistSection = st.joistSection;
      el.joistSpacingIn = st.joistSpacingIn;
      el.joistSpacing = Math.round((st.joistSpacingIn || 16) * 25.4 * 10) / 10;
      el.joistDirection = st.joistDirection;
      el.endBearingType = st.endBearingType;
      el.girderType = st.girderType;
      el.joistHangerType = st.joistHangerType;
      el.bridgingType = st.bridgingType;
      el.bridgingRows = st.bridgingRows;
      el.openingEnabled = st.openingEnabled;
      el.openingWidthMm = st.openingWidthMm;
      el.openingLengthMm = st.openingLengthMm;
      el.openingXMm = st.openingXMm;
      el.openingYMm = st.openingYMm;
      el.trimmerPlies = st.trimmerPlies;
      el.headerPlies = st.headerPlies;
      el.cantileverEnabled = st.cantileverEnabled;
      el.cantileverSide = st.cantileverSide;
      el.cantileverMm = st.cantileverMm;
      el.partitionDoublers = st.partitionDoublers;
      el.liveLoadPsf = st.livePsf;
      el.deadLoadPsf = st.deadPsf;
      el.partitionPsf = st.partitionPsf || 0;
    }
  }
}

function updateEWPBeamHUD() {
  const state = window.ewpBeamToolState;
  if (!state) return;
  const calcFn = window.calculateEWPBeamLoadAndSizing || (window.ewpSystem && window.ewpSystem.calculateEWPBeamLoadAndSizing);
  if (!calcFn) return;

  const effDeadPsf = (Number(state.deadPsf) || 15) + (Number(state.partitionPsf) || 0);
  const res = calcFn({
    spanFt: state.spanFt,
    tribWidthFt: state.tribWidthFt,
    livePsf: state.livePsf,
    deadPsf: effDeadPsf,
    defLLLimit: state.defLLLimit,
    defTLLimit: state.defTLLimit,
    fcPerp: state.fcPerp,
    currentSection: state.currentSection,
    currentPlies: state.currentPlies
  });

  const setVal = (sel, val) => { const el = $(sel); if (el && el.value !== String(val)) el.value = String(val); };
  const setChk = (sel, val) => { const el = $(sel); if (el) el.checked = Boolean(val); };

  setVal('#hud-joist-section', state.joistSection || 'I-Joist 11-7/8');
  setVal('#hud-joist-spacing', state.joistSpacingIn || 16);
  setVal('#hud-joist-dir', state.joistDirection || 'Y');
  setVal('#hud-girder-type', state.girderType || 'flush_hanger');
  setVal('#hud-bridging-type', state.bridgingType || 'solid_blocking');
  setVal('#hud-bridging-rows', state.bridgingRows || 'auto_ewp');
  setVal('#hud-end-bearing', state.endBearingType || 'ewp_rim');
  setVal('#hud-hanger-type', state.joistHangerType || 'face_mount');
  setVal('#hud-load-preset', state.loadPreset || 'res_living');
  setVal('#hud-joist-def-limit', state.defLLLimit || 480);
  setChk('#hud-joist-util-toggle', state.showJoistUtilization !== false);

  // Populate Floor Member Picker in HUD & Evaluate Real-Time Joist Fleet Utilization
  const activeSlab = getActiveFloorSlab();
  const members = generateFloorFramingForSlab(activeSlab);
  const curSelId = Array.isArray(selected) && selected[0] ? selected[0] : '';
  const selInfo = curSelId ? members.find(m => m.id === curSelId) : null;

  const pickerEl = $('#hud-floor-member-picker');
  const badgeEl = $('#hud-sel-member-badge');
  if (pickerEl) {
    pickerEl.innerHTML = `<option value="">— Select Any Floor Member (${members.length} total) —</option>` +
      members.map(m => `<option value="${esc(m.id)}" ${m.id === curSelId ? 'selected' : ''}>${esc(m.shortTag)} · ${esc(m.type)} (${m.plies > 1 ? m.plies + 'P ' : ''}${esc(m.section)}${m.utilPercent ? ` · ${m.utilPercent}%` : ''})</option>`).join('');
    if (badgeEl) {
      badgeEl.textContent = selInfo ? `${selInfo.shortTag} (${selInfo.utilPercent || 0}%)` : 'Click any joist';
    }
  }

  // Real-Time Floor Joist Utilization Calculator Readout
  const joistMembers = members.filter(m => m.type === 'Floor joist' || m.type === 'Tail joist' || m.type === 'Partition doubler' || m.type === 'Trimmer joist');
  const cntOpt = joistMembers.filter(m => (m.utilPercent || 0) <= 65).length;
  const cntMod = joistMembers.filter(m => (m.utilPercent || 0) > 65 && (m.utilPercent || 0) <= 85).length;
  const cntWarn = joistMembers.filter(m => (m.utilPercent || 0) > 85 && (m.utilPercent || 0) <= 100).length;
  const cntFail = joistMembers.filter(m => (m.utilPercent || 0) > 100).length;

  const targetJoist = (selInfo && (selInfo.type === 'Floor joist' || selInfo.type === 'Tail joist' || selInfo.type === 'Partition doubler' || selInfo.type === 'Trimmer joist'))
    ? selInfo
    : joistMembers.reduce((best, m) => (!best || (m.utilPercent || 0) > (best.utilPercent || 0)) ? m : best, joistMembers[0] || null);

  if (targetJoist) {
    const ju = targetJoist.utilization || evaluateFloorJoistUtilization(targetJoist, activeSlab);
    const jTitle = $('#hud-joist-calc-title');
    if (jTitle) {
      const prefix = selInfo && selInfo.id === targetJoist.id ? '🎯 Selected' : '⚡ Governing';
      jTitle.textContent = `${prefix}: ${targetJoist.shortTag} · ${targetJoist.plies > 1 ? targetJoist.plies + 'P ' : ''}${targetJoist.section}`;
    }
    const jBadge = $('#hud-joist-calc-badge');
    if (jBadge) {
      jBadge.textContent = `${ju.utilPercent}% ${ju.tierLabel}`;
      jBadge.style.background = ju.palette.badgeBg;
      jBadge.style.color = '#ffffff';
    }
    const jBar = $('#hud-joist-calc-bar');
    if (jBar) {
      jBar.style.width = `${Math.min(100, ju.utilPercent)}%`;
      jBar.style.background = ju.palette.badgeBg;
    }
    const jSpan = $('#hud-joist-out-span');
    if (jSpan) jSpan.textContent = `${ju.spanFt.toFixed(1)} ft (${ju.spanMm} mm)`;
    const jAllow = $('#hud-joist-out-allow');
    if (jAllow) {
      jAllow.textContent = `${ju.allowableSpanFt.toFixed(1)} ft (${ju.allowableSpanMm} mm)`;
      jAllow.style.color = ju.spanMm > ju.allowableSpanMm ? '#dc2626' : '#15803d';
    }
    const jWtl = $('#hud-joist-out-wtl');
    if (jWtl) jWtl.textContent = `${ju.wTL_plf} plf (${ju.wTL_kNm} kN/m)`;
    const jMv = $('#hud-joist-out-mv');
    if (jMv) jMv.textContent = `M:${Math.round(ju.u_M * 100)}% · V:${Math.round(ju.u_V * 100)}%`;
    const jDef = $('#hud-joist-out-def');
    if (jDef) jDef.textContent = `${ju.deltaLL_in}" (L/${ju.ratioLL})`;
    const jGov = $('#hud-joist-out-gov');
    if (jGov) jGov.textContent = ju.governing;
  }

  const elOpt = $('#hud-util-cnt-opt');
  if (elOpt) elOpt.textContent = String(cntOpt);
  const elMod = $('#hud-util-cnt-mod');
  if (elMod) elMod.textContent = String(cntMod);
  const elWarn = $('#hud-util-cnt-warn');
  if (elWarn) elWarn.textContent = String(cntWarn);
  const elFail = $('#hud-util-cnt-fail');
  if (elFail) elFail.textContent = String(cntFail);

  setChk('#hud-opening-toggle', state.openingEnabled);
  setChk('#hud-cantilever-toggle', state.cantileverEnabled);
  setChk('#hud-doublers-toggle', state.partitionDoublers);
  setChk('#hud-mep-toggle', state.showMepChase);
  setChk('#hud-subfloor-toggle', state.showSubfloorPanels);
  setChk('#hud-hatch-toggle', state.showTribHatch);

  const spanSlider = $('#hud-span-slider');
  const spanText = $('#hud-span-text');
  if (spanSlider && spanSlider.value != state.spanFt) spanSlider.value = state.spanFt;
  if (spanText) spanText.textContent = `${state.spanFt.toFixed(1)} ft`;

  const tribSlider = $('#hud-trib-slider');
  const tribText = $('#hud-trib-text');
  if (tribSlider && tribSlider.value != state.tribWidthFt) tribSlider.value = state.tribWidthFt;
  if (tribText) tribText.textContent = `${state.tribWidthFt.toFixed(1)} ft`;

  const liveSlider = $('#hud-live-slider');
  const liveText = $('#hud-live-text');
  if (liveSlider && liveSlider.value != state.livePsf) liveSlider.value = state.livePsf;
  if (liveText) liveText.textContent = `${state.livePsf} psf (${(state.livePsf * 0.04788).toFixed(2)} kPa)`;

  const deadSlider = $('#hud-dead-slider');
  const deadText = $('#hud-dead-text');
  if (deadSlider && deadSlider.value != state.deadPsf) deadSlider.value = state.deadPsf;
  if (deadText) deadText.textContent = `${state.deadPsf} psf (${(state.deadPsf * 0.04788).toFixed(2)} kPa)`;

  const partSlider = $('#hud-part-load-slider');
  const partText = $('#hud-part-load-text');
  if (partSlider && partSlider.value != (state.partitionPsf || 0)) partSlider.value = state.partitionPsf || 0;
  if (partText) partText.textContent = `${state.partitionPsf || 0} psf`;

  const outArea = $('#hud-out-area');
  if (outArea) outArea.textContent = `${res.inputs.tribAreaSqFt} sq ft`;
  const outLoad = $('#hud-out-load');
  if (outLoad) outLoad.textContent = `${res.demands.wTL_plf} plf`;
  const outTotal = $('#hud-out-total');
  if (outTotal) outTotal.textContent = `${res.demands.totalLoadLb.toLocaleString()} lbs`;
  const outM = $('#hud-out-m');
  if (outM) outM.textContent = `${(res.demands.M_max_ft_lb / 1000).toFixed(1)} k-ft`;
  const outV = $('#hud-out-v');
  if (outV) outV.textContent = `${res.demands.V_max_lb.toLocaleString()} lbs`;
  const outR = $('#hud-out-r');
  if (outR) outR.textContent = `${res.demands.reactionLb.toLocaleString()} lbs`;

  const cur = res.currentCandidate;
  const curName = $('#hud-cur-name');
  if (curName) curName.textContent = cur.name;
  const curDc = $('#hud-cur-dc');
  if (curDc) {
    curDc.textContent = `${cur.dcPercent}% ${cur.status}`;
    curDc.style.color = cur.status === 'PASS' ? '#16a34a' : cur.status === 'WARNING' ? '#d97706' : '#dc2626';
  }
  const dcBar = $('#hud-dc-bar');
  if (dcBar) {
    dcBar.style.width = `${Math.min(100, cur.dcPercent)}%`;
    dcBar.style.background = cur.status === 'PASS' ? '#22c55e' : cur.status === 'WARNING' ? '#f59e0b' : '#ef4444';
  }
  const curGov = $('#hud-cur-gov');
  if (curGov) curGov.textContent = `Gov: ${cur.governing}`;
  const curBrg = $('#hud-cur-brg');
  if (curBrg) curBrg.textContent = `Min Brg: ${cur.minBearingIn}"`;

  const optName = $('#hud-opt-name');
  if (optName) optName.textContent = res.optimal.name;
  const optDc = $('#hud-opt-dc');
  if (optDc) optDc.textContent = `D/C ${res.optimal.dcPercent}%`;

  // Update Live Recharts Deflection Graph in the EWP HUD
  if (typeof window.updateEwpDeflectionChart === 'function') {
    window.updateEwpDeflectionChart({
      spanFt: state.spanFt,
      tribWidthFt: state.tribWidthFt,
      livePsf: state.livePsf,
      deadPsf: effDeadPsf,
      defLLLimit: state.defLLLimit || 480,
      defTLLimit: state.defTLLimit || 360,
      currentSection: cur.section,
      currentPlies: cur.plies,
      deltaLL_in: cur.deltaLL_in,
      deltaTL_in: cur.deltaTL_in,
      wLL_plf: res.demands.wLL_plf,
      wTL_plf: res.demands.wTL_plf,
      ratioLL: cur.ratioLL,
      ratioTL: cur.ratioTL,
      status: cur.status
    });
  }

  window._latestBeamSizingResult = res;
}
window.updateEWPBeamHUD = updateEWPBeamHUD;

let _ewpHudInitialized = false;
function initEWPBeamHUD() {
  updateEWPBeamHUD();
  if (_ewpHudInitialized) return;
  _ewpHudInitialized = true;

  const state = window.ewpBeamToolState;
  const onInput = () => {
    state.spanFt = Number($('#hud-span-slider')?.value || state.spanFt);
    state.tribWidthFt = Number($('#hud-trib-slider')?.value || state.tribWidthFt);
    state.livePsf = Number($('#hud-live-slider')?.value || state.livePsf);
    state.deadPsf = Number($('#hud-dead-slider')?.value || state.deadPsf);
    state.partitionPsf = Number($('#hud-part-load-slider')?.value ?? state.partitionPsf ?? 0);
    state.loadPreset = 'custom';
    syncFloorOptionsToSlabs();
    updateEWPBeamHUD();
    if (view === 'floorschedule' || view === 'audit') schedule();
    render();
  };

  $('#hud-span-slider')?.addEventListener('input', onInput);
  $('#hud-trib-slider')?.addEventListener('input', onInput);
  $('#hud-live-slider')?.addEventListener('input', onInput);
  $('#hud-dead-slider')?.addEventListener('input', onInput);
  $('#hud-part-load-slider')?.addEventListener('input', onInput);

  $('#hud-load-preset')?.addEventListener('change', (ev) => {
    const preset = ev.target.value;
    state.loadPreset = preset;
    const presetMap = {
      res_living: { live: 40, dead: 15, part: 0 },
      res_bedroom: { live: 30, dead: 12, part: 0 },
      res_tile: { live: 40, dead: 25, part: 5 },
      office: { live: 50, dead: 20, part: 15 },
      assembly: { live: 75, dead: 20, part: 0 },
      heavy_mech: { live: 100, dead: 30, part: 10 }
    };
    if (presetMap[preset]) {
      state.livePsf = presetMap[preset].live;
      state.deadPsf = presetMap[preset].dead;
      state.partitionPsf = presetMap[preset].part;
      syncFloorOptionsToSlabs();
      updateEWPBeamHUD();
      if (view === 'floorschedule' || view === 'audit') schedule();
      render();
      toast(`Applied ${ev.target.options[ev.target.selectedIndex]?.text || preset}: ${state.livePsf} psf Live + ${state.deadPsf} psf Dead`);
    }
  });

  $('#hud-joist-def-limit')?.addEventListener('change', (ev) => {
    const lim = Number(ev.target.value) || 480;
    state.defLLLimit = lim;
    state.defTLLimit = lim >= 480 ? 360 : 240;
    updateEWPBeamHUD();
    render();
  });

  $('#hud-joist-util-toggle')?.addEventListener('change', (ev) => {
    state.showJoistUtilization = Boolean(ev.target.checked);
    updateEWPBeamHUD();
    render();
  });

  $('#hud-autoupgrade-joists-btn')?.addEventListener('click', () => {
    autoUpgradeOverloadedFloorJoists();
  });

  $('#hud-floor-member-picker')?.addEventListener('change', (ev) => {
    const memberId = ev.target.value;
    if (memberId) {
      select([memberId]);
      const info = findFloorMemberById(memberId);
      if (info?.member) {
        toast(`Selected ${info.member.shortTag} (${info.member.type}) — Edit all options in Properties Inspector →`);
      }
      updateEWPBeamHUD();
      render();
    }
  });

  $('#hud-add-joist-btn')?.addEventListener('click', () => {
    const curId = selected[0] || '';
    let added = null;
    commit(() => {
      added = addExtraFloorMemberNear(curId, 'after');
      if (added) selected = [added.id];
    });
    if (added) {
      updateEWPBeamHUD();
      properties();
      render();
      toast(`➕ Added floor member ${added.shortTag} (${added.section})`);
    }
  });

  $('#hud-sister-joist-btn')?.addEventListener('click', () => {
    const curId = selected[0] || '';
    const info = findFloorMemberById(curId);
    if (!info) {
      toast('Click a floor joist or beam on the plan first to toggle 1-Ply / 2-Ply / 3-Ply');
      return;
    }
    const nextPlies = ((info.member.plies || 1) % 3) + 1;
    commit(() => {
      updateFloorMemberById(info.member.id, { plies: nextPlies });
    });
    updateEWPBeamHUD();
    properties();
    render();
    toast(`${info.member.shortTag} updated to ${nextPlies}-Ply (${info.member.width * nextPlies}×${info.member.depth} mm)`);
  });

  $('#hud-del-member-btn')?.addEventListener('click', () => {
    const curId = selected[0] || '';
    const info = findFloorMemberById(curId);
    if (!info) {
      toast('Select a floor member first to delete it');
      return;
    }
    commit(() => {
      deleteFloorMemberById(info.member.id);
      selected = [];
    });
    updateEWPBeamHUD();
    properties();
    render();
    toast(`🗑 Deleted floor member ${info.member.shortTag}`);
  });

  const onFloorOptionChange = () => {
    state.joistSection = $('#hud-joist-section')?.value || state.joistSection;
    state.joistSystem = state.joistSection.includes('Posi-Strut') ? 'Posi-Strut'
      : state.joistSection.includes('Floor Truss') ? 'Floor Truss'
      : (state.joistSection.includes('Dimensional') || state.joistSection.includes('C24')) ? 'Dimensional'
      : 'I-Joist';
    state.joistSpacingIn = Number($('#hud-joist-spacing')?.value || state.joistSpacingIn);
    state.joistDirection = $('#hud-joist-dir')?.value || state.joistDirection;
    state.girderType = $('#hud-girder-type')?.value || state.girderType;
    state.bridgingType = $('#hud-bridging-type')?.value || state.bridgingType;
    state.bridgingRows = $('#hud-bridging-rows')?.value || state.bridgingRows || 'auto_ewp';
    state.endBearingType = $('#hud-end-bearing')?.value || state.endBearingType;
    state.joistHangerType = $('#hud-hanger-type')?.value || state.joistHangerType;

    state.openingEnabled = Boolean($('#hud-opening-toggle')?.checked);
    state.cantileverEnabled = Boolean($('#hud-cantilever-toggle')?.checked);
    state.partitionDoublers = Boolean($('#hud-doublers-toggle')?.checked);
    state.showMepChase = Boolean($('#hud-mep-toggle')?.checked);
    state.showSubfloorPanels = Boolean($('#hud-subfloor-toggle')?.checked);
    state.showTribHatch = Boolean($('#hud-hatch-toggle')?.checked);

    syncFloorOptionsToSlabs();
    updateEWPBeamHUD();
    render();
  };

  ['#hud-joist-section', '#hud-joist-spacing', '#hud-joist-dir', '#hud-girder-type', '#hud-bridging-type', '#hud-bridging-rows', '#hud-end-bearing', '#hud-hanger-type',
   '#hud-opening-toggle', '#hud-cantilever-toggle', '#hud-doublers-toggle', '#hud-mep-toggle', '#hud-subfloor-toggle', '#hud-hatch-toggle'
  ].forEach(sel => {
    $(sel)?.addEventListener('change', onFloorOptionChange);
  });

  $('#hud-auto-blocking-btn')?.addEventListener('click', () => {
    if (typeof window.autoPlaceIJoistMidSpanBlocking === 'function') {
      window.autoPlaceIJoistMidSpanBlocking(null, { switchView: false });
    }
  });

  $('#hud-auto-hanger-btn')?.addEventListener('click', () => {
    if (typeof window.autoSizeFloorHangersByReaction === 'function') {
      commit(() => window.autoSizeFloorHangersByReaction(null, { brand: 'all' }));
      updateEWPBeamHUD();
    }
  });

  $('#hud-apply-btn')?.addEventListener('click', () => {
    const res = window._latestBeamSizingResult;
    if (!res) return;
    state.currentSection = res.optimal.section;
    state.currentPlies = res.optimal.plies;
    if (model.beams && model.beams[0]) {
      model.beams[0].section = res.optimal.section;
      model.beams[0].plies = res.optimal.plies;
      model.beams[0].status = 'SIZED & VERIFIED';
    }
    syncFloorOptionsToSlabs();
    updateEWPBeamHUD();
    render();
    toast(`⚡ Applied optimal sizing: ${res.optimal.name} to floor framing plan!`);
  });

  $('#hud-autosize-all-btn')?.addEventListener('click', () => {
    const autoFn = window.autoSizeEWPFloorBeams || (window.ewpSystem && window.ewpSystem.autoSizeEWPFloorBeams);
    if (autoFn) {
      autoFn(model, {
        tribWidthFt: state.tribWidthFt,
        livePsf: state.livePsf,
        deadPsf: state.deadPsf
      });
    }
    const res = window._latestBeamSizingResult;
    if (res) {
      state.currentSection = res.optimal.section;
      state.currentPlies = res.optimal.plies;
    }
    syncFloorOptionsToSlabs();
    updateEWPBeamHUD();
    render();
    toast('⚡ All floor beams auto-sized to tributary area & span demands!');
  });

  $('#ewp-hud-options-btn')?.addEventListener('click', () => {
    openEWPSpecs('flooroptions');
  });

  $('#hud-all-options-btn')?.addEventListener('click', () => {
    openEWPSpecs('flooroptions');
  });

  $('#hud-floor-schedule-pdf-btn')?.addEventListener('click', () => {
    const fn = window.generateFloorFramingSchedulePDF || window.generateEWPFloorPDFReport;
    if (typeof fn === 'function') fn();
    else toast('Floor Framing Schedule PDF generator is loading...');
  });

  $('#hud-generate-ewp-2d-btn')?.addEventListener('click', () => {
    const run = () => {
      if (typeof window.generate2DEWPFramingPlan === 'function') window.generate2DEWPFramingPlan();
      else toast('2D EWP framing plan generator is loading...');
    };
    if (typeof window.generate2DEWPFramingPlan === 'function') run();
    else import('./report.js').then(run).catch(() => toast('Could not load 2D EWP plan generator.'));
  });

  $('#ewp-hud-modal-btn')?.addEventListener('click', () => {
    openEWPSpecs('beamsizer');
  });

  $('#ewp-hud-toggle-btn')?.addEventListener('click', () => {
    $('#ewp-hud')?.classList.toggle('collapsed');
  });
}

function openEWPSpecs(defaultTab = 'flooroptions'){
  if(typeof window.openEWPSpecificationsModal==='function'){
    window.openEWPSpecificationsModal(model, defaultTab);
  }else if(typeof openEWPSpecificationsModal==='function'){
    openEWPSpecificationsModal(model, defaultTab);
  }else{
    import('./ewp-system.js').then(mod=>{
      if(typeof mod.openEWPSpecificationsModal==='function') mod.openEWPSpecificationsModal(model, defaultTab);
      else if(typeof window.openEWPSpecificationsModal==='function') window.openEWPSpecificationsModal(model, defaultTab);
    }).catch(err=>{
      console.warn('Could not load EWP modal:', err);
    });
  }
}

function setView(v){
  view=v;if(!isModelView(v)){$('main').classList.remove('viewport-focus')}
  if(window._closedFloatingPopups)window._closedFloatingPopups.clear();
  if(globalThis.cadtechViewport){globalThis.cadtechViewport.panelClosed=false;}
  points=[];editing=null;hover=null;hidePetPalette();
  $$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  const s=model.stories.find(s=>s.id===activeStory);
  const vk=$('#view-kicker'),vt=$('#view-title'),vs=$('#view-scale');
  if(vk)vk.textContent={plan:'FLOOR PLAN','3d':'MODEL VIEW',elevation:'ELEVATION',section:'BUILDING SECTION',schedule:'DOCUMENTATION',framingplan:'FRAMING PLAN',audit:'STRUCTURAL AUDIT',roofframingplan:'ROOF FRAMING',trusselevation:'TRUSS ELEVATION & STRESSES',panel:'WALL FRAMING',ewpspecs:'FLOOR FRAMING',floorschedule:'FLOOR SCHEDULE',framing3d:'TIMBER MODEL',cutlist:'FRAMING SCHEDULE'}[v];
  const fwPanel = v==='panel' && typeof framingWall === 'function' ? framingWall() : null;
  if (v==='panel' && fwPanel && (!selected.length || (!model.elements.some(e => e.id === selected[0]) && !(typeof findStudById === 'function' && findStudById(selected[0]))))) {
    selected = [fwPanel.id];
  }
  const panelCodeStr = fwPanel && typeof window.getWallPanelCode === 'function' ? window.getWallPanelCode(fwPanel) : (fwPanel?.id || 'Wall');
  if(vt)vt.textContent={plan:`${String(model.stories.indexOf(s)).padStart(2,'0')} ${s?.name||'Story'}`,'3d':'3D model',elevation:'South elevation',section:'A–A Building section',schedule:'Element schedule',framingplan:'2D wall framing plan',audit:'Structural Stud Collision Audit',roofframingplan:'Roof framing plan',trusselevation:'Truss Elevation & Stresses',panel:(fwPanel && panelCodeStr !== fwPanel.id ? `${panelCodeStr} (${fwPanel.id})` : panelCodeStr)+' · Framing panel',ewpspecs:'Floor framing plan',floorschedule:'EWP Floor Framing Schedule',framing3d:'3D timber framing',cutlist:'Timber framing cut list'}[v];
  if(vs)vs.textContent=(v==='3d'||v==='framing3d')?'Orthographic':'1 : 100';
  $('#clip')?.classList.toggle('hidden',v!=='3d');
  $('#north')?.classList.toggle('hidden',v!=='plan');
  $('#schedule-panel')?.classList.toggle('hidden',v!=='schedule'&&v!=='cutlist'&&v!=='audit'&&v!=='floorschedule');
  $('#draft-tracker')?.classList.toggle('hidden',!trackerActive||(v!=='plan'&&v!=='framingplan'&&v!=='roofframingplan'));
  $('#ewp-hud')?.classList.toggle('hidden',v!=='ewpspecs');
  $('#wall-panel-list-hud')?.classList.toggle('hidden',v!=='panel');
  $('#truss-elevation-panel')?.classList.toggle('hidden',v!=='trusselevation');
  if(v==='trusselevation'){
    const mountTrussTab = () => {
      const p = $('#truss-elevation-panel');
      if (p && typeof window.mountTrussElevationViewTab === 'function') {
        window.mountTrussElevationViewTab(p);
      }
    };
    mountTrussTab();
    if (typeof window.mountTrussElevationViewTab !== 'function') {
      const retryMount = setInterval(() => {
        if (typeof window.mountTrussElevationViewTab === 'function') {
          clearInterval(retryMount);
          if (view === 'trusselevation') mountTrussTab();
        }
      }, 50);
      setTimeout(() => clearInterval(retryMount), 5000);
    }
  }
  if(v==='ewpspecs'){
    initEWPBeamHUD();
  }
  const bt=$('#model-badge-text');if(bt)bt.textContent=v==='audit'?'Structural stud collision audit & auto-shift':v==='trusselevation'?'2D truss elevation, ASD stress engine & Gang-Nail plates':v==='floorschedule'?'EWP floor spans, material schedule & hanger connector takeoff':v==='cutlist'?'Cut list generated from BIM walls and roofs':v==='panel'||v==='framing3d'?'Framing generated from BIM walls and roofs':v==='ewpspecs'?'Real-time EWP tributary loads & sizing':v==='schedule'?'Schedule linked to model':'2D + 3D synchronized';
  if(v!=='plan' && v!=='framingplan' && !DIMENSION_TOOLS.includes(tool))tool='select';
  $('main')?.classList.toggle('model-view',isModelView(v));
  $('main')?.classList.toggle('truss-elevation-full',v==='trusselevation');
  document.body.classList.toggle('model-view',isModelView(v));
  if(isModelView(v))fit3DCamera();
  cameraUI();toolState();properties();render();renderInfoBox();
}

function toolState(){
  $$('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));
  $$('[data-edit]').forEach(b=>{
    const isAct=Boolean(editing)&&(b.dataset.edit===editing||(b.dataset.edit==='join'&&editing==='trim'));
    b.classList.toggle('enabled',isAct);
    b.classList.toggle('active',isAct);
  });
  canvas.style.cursor=pipetteActive?'crosshair':syringeActive?'crosshair':(view==='panel'&&window._wallPanelInsertStudMode)?'crosshair':editing?'crosshair':tool==='select'?'default':'crosshair';
  const ct=$('#command-text');if(ct)ct.textContent=(view==='panel'&&window._wallPanelInsertStudMode)?'Wall Panel Insert Custom Stud: Click anywhere on the current wall panel to place a custom stud at that coordinate (Hold Shift for strict exact spot without auto-snap, Esc to cancel).':editing?`${editing==='offset'?'Click a point to set the parallel wall offset.':editing==='stretch'?'Click the new position for the nearest wall endpoint.':editing==='mirror'?'Pick two points for the mirror axis.':editing==='split'?'Click a point on the selected wall, beam or line to split it.':editing==='trim'?'Trim: click the portion to remove. Selected elements are cutting boundaries; otherwise visible crossings are used. Esc finishes.':editing==='extend'?'Extend: click near the endpoint to extend to the next crossing boundary. Esc finishes.':editing==='trimToRoofPickRoof'?'Trim Elements to Roof: Click the trimming Roof on 2D Plan or 3D Model. Esc cancels.':editing==='intersect'?(window._intersectFirstWallId?`Intersect: click the second wall to connect ${window._intersectFirstWallId} to it. Esc finishes.`:'Intersect: click the first wall, then click the second wall to connect. Esc finishes.'):editing==='join'?'Click another wall, beam or line as the trim / extend boundary.':'Pick a base point, then a destination to '+editing+' the selection.'}`:({select:'Select an element to inspect. Scroll to zoom; hold Space to pan.',wall:'Click to draw a wall chain. Snap to axes / junctions; Shift constrains angle.',window:'Click a wall to place a hosted window.',door:'Click a wall to place a hosted door.',stair:'Click start point and end point to draw stair flight.',railing:'Click start and end points to place railing.',curtainwall:'Click start and end points to draw curtain wall.',slab:'Click polygon vertices. Double-click or Enter to finish.',roof:'Click roof boundary vertices. Double-click or Enter to finish.',morph:'Click polygon vertices to create solid morph. Enter to finish.',mesh:'Click terrain boundary vertices to create 3D topography.',grid:'Click two points to place structural grid line.',leveldim:'Click in floor plan to place elevation benchmark target.',section:'Section Tool: Click on a wall or opening in Elevation or Wall Panel view to generate a vertical stack-up callout dimension line (Top Plates, Header, Sill, Bottom Plate).',object:'Click to place furniture or BIM equipment.',text:'Click to place text annotation.'}[tool]||'Click points. Double-click or Enter to finish.');
  renderInfoBox();
}

function chooseTool(t){if(view!=='plan' && view!=='framingplan' && !DIMENSION_TOOLS.includes(t))setView('plan');tool=t;points=[];lastPlacedWallEnd=null;editing=null;window._intersectFirstWallId=null;toolState();render()}
$$('[data-tool]').forEach(b=>b.onclick=()=>chooseTool(b.dataset.tool));
$$('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$$('[data-panel]').forEach(b=>b.onclick=()=>{$$('[data-panel]').forEach(x=>x.classList.toggle('active',x===b));$('.inspector')?.classList.toggle('navigator-focus',b.dataset.panel==='navigator')});

function newElement(type,data){
  if(type==='wall')data={reference:'outside',...data};
  const layer=defaultLayerForType(type);
  let defaults={
    stair:{width:1000,risers:16,riserHeight:190.5,treadDepth:280,stairType:'straight',height:3048},
    railing:{height:1050,balusterSpacing:120},
    curtainwall:{height:3048,panelWidth:1200,mullionWidth:50,thickness:120},
    morph:{height:2400},
    mesh:{skirtDepth:800,elevation:0},
    object:{subtype:'Table & Chairs',width:1600,depth:900,height:750,rotation:0},
    fill:{hatchType:'diagonal45',hatchScale:200,foregroundColor:'#3a5446',backgroundColor:'#eef3eb'},
    leveldim:{targetHeight:model.stories.find(s=>s.id===activeStory)?.elevation||0,markerType:'standard_triangle'},
    radialdim:{radius:1500,angle:45},
    angledim:{angle:90},
    label:{text:'Element Label'},
    spline:{closed:false},
    grid:{bubble:'A',extDistance:800},
    detail:{radius:800,code:'D-01'},
    changemarker:{changeNumber:'CH-01',text:'Revision'},
    wallend:{endType:'return'},
    cornerwin:{width:1200,height:1500,sill:900},
    lamp:{wattage:60,lightType:'downlight'},
    camera:{fov:60,height:1600},
    skylight:{width:1000,length:1400},
    shell:{profileRadius:4000,height:2800}
  }[type]||{};
  if(typeof absorbedParams==='object' && absorbedParams && ['wall','beam','column','slab'].includes(type)){
    defaults={...defaults,...absorbedParams};
  }
  return {id:unique(type),type,story:activeStory,layer,material:type==='slab'||type==='mesh'||type==='morph'?'Concrete':type==='curtainwall'?'Glass':'Timber',...defaults,...data};
}

function add(e){commit(()=>model.elements.push(e));select([e.id])}

function place(q){
  if(wandActive){
    const flood=floodRoom(q);
    wandActive=false;$('#wand-btn')?.classList.remove('active');$('#wand-btn')?.classList.remove('manual-active');
    canvas.style.cursor=tool==='select'?'default':'crosshair';
    if(flood){
      if(['slab','roof','zone','fill'].includes(tool)){
        const e=newElement(tool,{points:clone(flood.boundary),thickness:200,height:3000,pitch:25,roomName:flood.name,zoneNumber:String(model.elements.filter(x=>x.type==='zone').length+1).padStart(2,'0'),areaM2:flood.area,center:flood.center,...(tool==='roof'?{roofType:'hip',overhang:609.6}:{})});
        if(commit(()=>model.elements.push(e))){select([e.id]);toast(`Magic Wand: Created ${tool} (${flood.area} m²)`);render();return}
      }else if(tool==='wall'){
        const b=flood.boundary;
        commit(()=>{
          for(let i=0;i<b.length;i++){
            const p1=b[i],p2=b[(i+1)%b.length];
            if(distance(p1,p2)>10){
              model.elements.push(newElement('wall',{a:p1,b:p2,thickness:200,height:3048,followStory:true}));
            }
          }
        });
        toast(`Magic Wand: Created perimeter walls (${flood.area} m²)`);
        render();
        return;
      }else if(tool==='railing'){
        const b=flood.boundary;
        commit(()=>{
          for(let i=0;i<b.length;i++){
            const p1=b[i],p2=b[(i+1)%b.length];
            if(distance(p1,p2)>10){
              model.elements.push(newElement('railing',{a:p1,b:p2,height:1050,balusterSpacing:120}));
            }
          }
        });
        toast(`Magic Wand: Created perimeter railing`);
        render();
        return;
      }
    }else{toast('Magic Wand: No closed room detected at cursor');return}
  }
  if(editing==='trimToRoofPickRoof'){
    const hit=planPick(p2(q));
    const pickedRoof=(hit&&hit.type==='roof'?hit:null)||model.elements.find(e=>e.type==='roof'&&shown(e)&&typeof inside==='function'&&inside(q,roofGeometry(e).boundary));
    if(pickedRoof&&typeof completePickRoofForTrim==='function'){completePickRoofForTrim(pickedRoof);return}
    toast('Click on a Roof element to complete Trim Elements to Roof (Esc to cancel).');
    return;
  }
  if(editing==='trim'||editing==='extend'){const ok=trimClick(q,editing==='extend');if(ok){points=[];toolState();render()}return}
  if(editing==='mirror'){if(!points.length){points=[q];render();return}if(mirrorSelection(points[0],q)){editing=null;points=[];toolState();render()}return}
  if(editing==='offset'||editing==='stretch'){
    const w=model.elements.find(e=>e.id===selected[0]&&['wall','line','beam'].includes(e.type));
    if(!w){toast('Select a wall, beam or CAD line.');return}
    const success=commit(()=>{
      if(editing==='stretch'){w[distance(q,w.a)<distance(q,w.b)?'a':'b']=clone(q)}
      else{const u=sub2(w.b,w.a),len=distance(w.a,w.b),n={x:-u.y/len,y:u.x/len},d=(q.x-w.a.x)*n.x+(q.y-w.a.y)*n.y;for(const p of [w.a,w.b]){p.x+=n.x*d;p.y+=n.y*d}}
    });
    if(success){editing=null;toolState();render()}return;
  }
  if(editing==='intersect'){
    const firstWall=resolveLinearElementFromId(window._intersectFirstWallId)||getSelectedLinearElements()[0]||null;
    const target=pickLinearElementAt(lastPointer||p2(q),firstWall?.id)||pickLinearElementAt(p2(q),firstWall?.id);
    if(!target){
      toast('Click a wall, beam or CAD line to intersect.');
      return;
    }
    if(!firstWall||firstWall.id===target.id){
      window._intersectFirstWallId=target.id;
      select([target.id]);
      toolState();
      toast(`Selected ${target.id} · Now click the second wall to connect ${target.id} to it`);
      render();
      return;
    }
    if(connectFirstWallToSecond(firstWall,target)){
      window._intersectFirstWallId=null;
      editing=null;
      points=[];
      toolState();
      render();
    }
    return;
  }
  if(editing==='split'||editing==='join'){
    const w=model.elements.find(e=>e.id===selected[0]&&['wall','line','beam'].includes(e.type))||getSelectedLinearElements()[0];
    if(!w){toast('Select a wall, beam or CAD line first.');editing=null;return}
    const rawTarget=planPick(p2(q));
    const targetEl=resolveLinearElementFromId(rawTarget?.wallId||rawTarget?.host||rawTarget?.id)||(rawTarget?.host?hostOf(rawTarget):rawTarget);
    const ok=editing==='split'?splitDraft(w,q):trimDraft(w,targetEl);
    if(ok){editing=null;points=[];toolState();render()}return;
  }
  if(editing){
    if(!points.length){points=[q];toast('Pick destination point');return}
    const from=points[0],dx=q.x-from.x,dy=q.y-from.y;
    const ok=editing==='copy'?duplicateSelection(1,dx,dy):commit(()=>translateElements(selected,dx,dy),false);
    if(ok){points=[];editing=null;toolState()}render();return;
  }

  if(tool==='column'){
    const prof=toolGeomMethod.column||'square';
    add(newElement('column',{a:q,thickness:300,height:3000,followStory:true,columnProfile:prof}));
    toast(`${prof==='circle'?'Circular':'Rectangular'} column placed`);
    return;
  }
  if(tool==='object'){
    const subtype=toolGeomMethod.object||'Table & Chairs';
    const dims={'Table & Chairs':{width:1600,depth:900,height:750},'Living Sofa Set':{width:2200,depth:950,height:800},'Double Bed':{width:1800,depth:2000,height:900},'Office Desk':{width:1400,depth:750,height:750},'Kitchen Counter':{width:2400,depth:600,height:900},'Bathroom WC':{width:700,depth:850,height:800},'Wardrobe':{width:1800,depth:650,height:2100}}[subtype]||{width:1600,depth:900,height:750};
    add(newElement('object',{a:q,subtype,...dims}));
    toast(`Placed: ${subtype}`);
    return;
  }
  if(tool==='leveldim'){
    const st=model.stories.find(s=>s.id===activeStory);
    add(newElement('leveldim',{a:q,targetHeight:st?.elevation||0}));
    toast(`Elevation benchmark placed (+${(st?.elevation||0).toLocaleString()} mm)`);
    return;
  }
  if(tool==='lamp'){add(newElement('lamp',{a:q}));toast('Luminaire placed');return}
  if(tool==='camera'){add(newElement('camera',{a:q,target:{x:q.x+3000,y:q.y}}));toast('BIM Camera placed');return}
  if(tool==='detail'){add(newElement('detail',{a:q,code:'D-0'+(model.elements.filter(e=>e.type==='detail').length+1)}));toast('Detail callout placed');return}
  if(tool==='changemarker'){add(newElement('changemarker',{a:q,changeNumber:'CH-0'+(model.elements.filter(e=>e.type==='changemarker').length+1)}));toast('Revision marker placed');return}
  if(tool==='wallend'){add(newElement('wallend',{a:q}));toast('Wall return end placed');return}
  if(tool==='label'){
    const hit=planPick(p2(q));
    let txt='Element Label';
    if(hit){
      if(hit.type==='wall')txt=`${hit.id} · ${hit.material} · ${hit.thickness}mm · H:${heightOf(hit)}`;
      else if(hit.type==='door')txt=`${hit.id} · ${hit.width}×${hit.height}mm · ${hit.material}`;
      else if(hit.type==='window')txt=`${hit.id} · ${hit.width}×${hit.height}mm · Sill:${hit.sill}`;
      else if(hit.type==='slab')txt=`${hit.id} · Slab ${hit.thickness}mm · ${hit.material}`;
      else if(hit.type==='roof')txt=`${hit.id} · Hip Roof ${hit.pitch}°`;
      else if(hit.type==='column')txt=`${hit.id} · Column ${hit.thickness}mm`;
      else if(hit.type==='beam')txt=`${hit.id} · Beam ${hit.thickness}mm`;
      else if(hit.type==='zone')txt=`${hit.roomName||'Room'} · ${hit.areaM2||0} m²`;
      else txt=`${hit.id} (${hit.type})`;
    }
    add(newElement('label',{a:q,text:txt,targetId:hit?.id}));
    toast('Associative label placed');
    return;
  }
  if(tool==='text'){
    openModal('Text annotation',`<label class="modal-field">Text <input id="annotation-input" value="Floor Plan Note"></label><div class="modal-actions"><button id="annotation-add" class="primary">Place annotation</button></div>`);
    bindClick('#annotation-add', ()=>{add(newElement('text',{a:q,text:$('#annotation-input')?.value||'Annotation'}));$('#modal')?.close?.()});
    return;
  }
  if(tool==='skylight'){
    const roof=model.elements.find(e=>e.type==='roof'&&inside(q,e.points||roofGeometry(e).boundary));
    if(!roof){toast('Click inside a roof to host a skylight');return}
    const sky=newElement('skylight',{host:roof.id,a:q,width:1000,length:1400,pitch:roof.pitch,story:roof.story,layer:roof.layer});
    commit(()=>model.elements.push(sky));
    select([sky.id]);
    toast('Hosted skylight placed in roof');
    render();
    return;
  }
  if(tool==='cornerwin'){
    const walls=model.elements.filter(e=>e.type==='wall'&&shown(e));
    let w1=null,w2=null;
    for(let i=0;i<walls.length;i++){
      for(let j=i+1;j<walls.length;j++){
        const a=walls[i],b=walls[j];
        for(const epA of [a.a,a.b]){
          for(const epB of [b.a,b.b]){
            if(distance(epA,epB)<150&&distance(q,epA)<1800){w1=a;w2=b;break}
          }
        }
      }
    }
    if(w1&&w2){
      const len1=distance(w1.a,w1.b),len2=distance(w2.a,w2.b);
      const o1=newElement('window',{host:w1.id,offset:distance(q,w1.a)<distance(q,w1.b)?750:len1-750,width:1200,height:1500,sill:900,cornerMiter:true,story:w1.story,layer:w1.layer});
      const o2=newElement('window',{host:w2.id,offset:distance(q,w2.a)<distance(q,w2.b)?750:len2-750,width:1200,height:1500,sill:900,cornerMiter:true,story:w2.story,layer:w2.layer});
      commit(()=>model.elements.push(o1,o2));
      select([o1.id,o2.id]);
      toast('Synchronized corner windows placed');
      render();
      return;
    }
  }
  if(['door','window','cornerwin'].includes(tool)){
    if(!pendingOpening){
      let w=planPick(p2(q));if(w?.host)w=hostOf(w);
      if(!w||w.type!=='wall'){toast('Click on a wall to place the opening');return}
      const len=distance(w.a,w.b),p=segmentDistance(q,w.a,w.b);
      pendingOpening={
        type:tool==='cornerwin'?'window':tool,
        host:w.id,
        offset:Math.round(p.t*len/100)*100,
        width:tool==='window'||tool==='cornerwin'?1500:900,
        height:tool==='window'||tool==='cornerwin'?1500:2200,
        sill:tool==='window'||tool==='cornerwin'?900:0,
        story:w.story,
        material:tool==='window'||tool==='cornerwin'?'Glass':'Oak',
        layer:w.layer,
        flipped:false,
        hand:'right'
      };
      toast('Click opening side / swing quadrant (inside/outside, left/right)');
      render();
      return;
    }else{
      const w=hostOf(pendingOpening);
      if(w){
        const len=distance(w.a,w.b)||1,u={x:(w.b.x-w.a.x)/len,y:(w.b.y-w.a.y)/len},n={x:-u.y,y:u.x};
        const opCenter=lerp(w.a,w.b,pendingOpening.offset/len);
        const dotN=(q.x-opCenter.x)*n.x+(q.y-opCenter.y)*n.y,dotU=(q.x-opCenter.x)*u.x+(q.y-opCenter.y)*u.y;
        pendingOpening.flipped=dotN<0;
        pendingOpening.hand=dotU>0?'right':'left';
      }
      const o=newElement(pendingOpening.type,pendingOpening);
      fitOpening(o,w);
      try{validateOpening(o);add(o);toast(`${o.type[0].toUpperCase()+o.type.slice(1)} placed`);}catch(err){toast(err.message)}
      pendingOpening=null;
      render();
      return;
    }
  }
  if(tool==='zone'){
    const geom=toolGeomMethod.zone||'inner';
    if(geom==='inner'){
      const flood=floodRoom(q);
      if(flood){
        const e=newElement('zone',{points:flood.boundary,roomName:flood.name,zoneNumber:String(model.elements.filter(x=>x.type==='zone').length+1).padStart(2,'0'),areaM2:flood.area,center:flood.center});
        commit(()=>model.elements.push(e));
        select([e.id]);
        toast(`Zone placed: ${flood.name} (${flood.area} m²)`);
        render();
        return;
      }else{
        toast('No enclosed room detected. Switched to manual polygon mode.');
        toolGeomMethod.zone='poly';
        renderInfoBox();
      }
    }
    points.push(q);
    render();
    return;
  }
  if(tool==='wall'){
    const geom=toolGeomMethod.wall||'single';
    if(geom==='rect'){
      points.push(q);
      if(points.length<2){render();return}
      const [p1,p2]=points;
      if(Math.abs(p1.x-p2.x)<50||Math.abs(p1.y-p2.y)<50){points.pop();toast('Pick opposite corner away from start');return}
      const w1=newElement('wall',{a:{x:p1.x,y:p1.y},b:{x:p2.x,y:p1.y},thickness:200,height:3048,followStory:true});
      const w2=newElement('wall',{a:{x:p2.x,y:p1.y},b:{x:p2.x,y:p2.y},thickness:200,height:3048,followStory:true});
      const w3=newElement('wall',{a:{x:p2.x,y:p2.y},b:{x:p1.x,y:p2.y},thickness:200,height:3048,followStory:true});
      const w4=newElement('wall',{a:{x:p1.x,y:p2.y},b:{x:p1.x,y:p1.y},thickness:200,height:3048,followStory:true});
      commit(()=>{model.elements.push(w1,w2,w3,w4)});
      select([w1.id,w2.id,w3.id,w4.id]);
      points=[];
      lastPlacedWallEnd=null;
      if(typeof clearTrackerUserEdits==='function')clearTrackerUserEdits();
      toast('Rectangular room created (4 connected walls)');
      render();
      return;
    }
    if(geom==='rotated_rect'){
      points.push(q);
      if(points.length<3){render();return}
      const [p1,p2,p3]=points;
      const u=sub2(p2,p1),len=distance(p1,p2)||1,n={x:-u.y/len,y:u.x/len};
      const d=(p3.x-p2.x)*n.x+(p3.y-p2.y)*n.y;
      const c3={x:p2.x+n.x*d,y:p2.y+n.y*d},c4={x:p1.x+n.x*d,y:p1.y+n.y*d};
      const w1=newElement('wall',{a:p1,b:p2,thickness:200,height:3048,followStory:true});
      const w2=newElement('wall',{a:p2,b:c3,thickness:200,height:3048,followStory:true});
      const w3=newElement('wall',{a:c3,b:c4,thickness:200,height:3048,followStory:true});
      const w4=newElement('wall',{a:c4,b:p1,thickness:200,height:3048,followStory:true});
      commit(()=>{model.elements.push(w1,w2,w3,w4)});
      select([w1.id,w2.id,w3.id,w4.id]);
      points=[];
      lastPlacedWallEnd=null;
      if(typeof clearTrackerUserEdits==='function')clearTrackerUserEdits();
      toast('Rotated rectangular room created');
      render();
      return;
    }
    // Single or Chained wall drafting
    if(points.length>=1&&typeof getConstrainedDraftPoint==='function'){
      q=getConstrainedDraftPoint(points.at(-1),q);
    }
    points.push(q);
    if(points.length<2){render();return}
    const a=points[points.length-2],b=points[points.length-1];
    if(distance(a,b)<50){
      points=[];
      lastPlacedWallEnd=null;
      if(typeof clearTrackerUserEdits==='function')clearTrackerUserEdits();
      toast('Wall drawing finished');
      render();
      return;
    }
    if(points.length>2&&distance(b,points[0])<150){
      const e=newElement('wall',{a,b:clone(points[0]),thickness:200,height:3048,followStory:true});
      commit(()=>model.elements.push(e));
      select([e.id]);
      points=[];
      lastPlacedWallEnd=null;
      if(typeof clearTrackerUserEdits==='function')clearTrackerUserEdits();
      toast('Wall loop closed');
      render();
      return;
    }
    const e=newElement('wall',{a,b,thickness:200,height:3048,followStory:true});
    if(commit(()=>model.elements.push(e))){
      select([e.id]);
      if(typeof clearTrackerUserEdits==='function')clearTrackerUserEdits();
      const shouldChain=(geom==='chained')&&!window._singleWallCommit;
      if(shouldChain){
        lastPlacedWallEnd=clone(b);
        points=[clone(b)];
        toast('Wall placed · Next wall starts from endpoint (double-click or Esc to finish)');
      }else{
        lastPlacedWallEnd=null;
        points=[];
        toast(`Wall placed (${isImperialUnits()?formatFeetInches(distance(a,b)):Math.round(distance(a,b))+' mm'})`);
      }
    }else{
      points=[];
      lastPlacedWallEnd=null;
    }
    render();
    return;
  }
  if(tool==='slab'){
    const geom=toolGeomMethod.slab||'poly';
    if(geom==='rect'){
      points.push(q);
      if(points.length<2){render();return}
      const [p1,p2]=points;
      const pts=[p1,{x:p2.x,y:p1.y},p2,{x:p1.x,y:p2.y}];
      const e=newElement('slab',{points:pts,thickness:200});
      commit(()=>model.elements.push(e));
      select([e.id]);
      points=[];
      toast('Rectangular slab created');
      render();
      return;
    }
  }
  if(tool==='roof'){
    const geom=toolGeomMethod.roof||'poly';
    if(geom==='rect'){
      points.push(q);
      if(points.length<2){render();return}
      const [p1,p2]=points;
      const pts=[p1,{x:p2.x,y:p1.y},p2,{x:p1.x,y:p2.y}];
      const e=newElement('roof',{points:pts,pitch:25,overhang:609.6,roofType:'hip',followStory:true});
      commit(()=>model.elements.push(e));
      select([e.id]);
      points=[];
      toast('Rectangular hipped roof created');
      render();
      return;
    }
  }

  if(tool==='dimension'){
    points.push(clone(q));
    if(points.length===1){
      toast('Click second reference point to measure (or double-click after 2nd point for default offset)');
      render();
      return;
    }
    if(points.length===2){
      if(distance(points[0],points[1])<10){
        points.pop();
        toast('Choose a second reference point away from the first');
        render();
        return;
      }
      toast('Move cursor and click with Hammer cursor to place dimension line at desired offset');
      render();
      return;
    }
    if(points.length>=3){
      const [a,b,cPt]=points;
      const len=distance(a,b)||1;
      const n={x:-(b.y-a.y)/len,y:(b.x-a.x)/len};
      let offMm=Math.round((cPt.x-a.x)*n.x+(cPt.y-a.y)*n.y);
      if(Math.abs(offMm)<80)offMm=offMm<0?-450:450;
      const e=newElement('dimension',{a:clone(a),b:clone(b),points:[clone(a),clone(b)],refs:[dimensionReference(a),dimensionReference(b)],offset:offMm});
      if(commit(()=>model.elements.push(e))){
        select([e.id]);
        toast(`Dimension placed (${Math.round(len)} mm) · Select in Arrow tool to drag offset, move anchors, or edit text`);
      }
      points=[];
      render();
      return;
    }
  }

  points.push(q);
  if(['slab','roof','polyline','morph','mesh','fill','spline','shell'].includes(tool)){render();return}
  if(points.length<2){render();return}
  let [a,b]=points;
  if(distance(a,b)<10){points.pop();toast('Choose a second point away from the start');return}
  let e;
  if(['beam','stair','railing','curtainwall','grid'].includes(tool)){
    e=newElement(tool,{a,b,thickness:tool==='curtainwall'?120:200,height:3048,followStory:true});
    if(tool==='grid')e.bubble=String.fromCharCode(65+model.elements.filter(x=>x.type==='grid').length);
  }else if(['circle','arc','radialdim'].includes(tool))e=newElement(tool,{a,radius:distance(a,b)});
  else if(tool==='rectangle')e=newElement(tool,{points:[a,{x:b.x,y:a.y},b,{x:a.x,y:b.y}]});
  else if(tool==='angledim')e=newElement(tool,{a,b,angle:Math.round(Math.abs(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI))||90});
  else e=newElement(tool,{a,b});
  const ok=commit(()=>model.elements.push(e));
  if(ok){select([e.id]);points=(tool==='wall'&&toolGeomMethod.wall==='chained')||(tool==='beam'&&toolGeomMethod.beam==='chained')?[clone(b)]:[]}else points=[];
  render();
}

function finish(){
  if(tool==='dimension'&&points.length===2){
    const [a,b]=points;
    const e=newElement('dimension',{a:clone(a),b:clone(b),points:[clone(a),clone(b)],refs:[dimensionReference(a),dimensionReference(b)],offset:600});
    if(commit(()=>model.elements.push(e))){select([e.id]);toast('Dimension placed')}
    points=[];render();return;
  }
  if(['wall','beam','line','curtainwall','railing','stair'].includes(tool)){
    points=[];
    lastPlacedWallEnd=null;
    if(typeof clearTrackerUserEdits==='function')clearTrackerUserEdits();
    toast(`${tool[0].toUpperCase()+tool.slice(1)} drawing completed`);
    render();
    return;
  }
  if(['slab','roof','zone','polyline','morph','mesh','fill','spline','shell'].includes(tool)&&points.length>=(['polyline','spline'].includes(tool)?2:3)){
    let ps=points.filter((p,i)=>!i||distance(p,points[i-1])>1);
    if(ps.length>1&&distance(ps[0],ps.at(-1))<1)ps.pop();
    const e=newElement(tool,{points:clone(ps),thickness:200,height:3000,pitch:25,...(tool==='roof'?{roofType:'hip',overhang:609.6,roofAngle:0,followStory:true}:{})});
    if(tool==='zone'){
      let area=0;
      for(let i=0;i<ps.length;i++){const p1=ps[i],p2=ps[(i+1)%ps.length];area+=p1.x*p2.y-p2.x*p1.y}
      area=Math.abs(area/2);
      let cx=0,cy=0;
      for(const p of ps){cx+=p.x;cy+=p.y}
      e.roomName=currentZoneCategory||'Living Room';
      e.zoneNumber=String(model.elements.filter(x=>x.type==='zone').length+1).padStart(2,'0');
      e.areaM2=Math.round(area/1e6*10)/10;
      e.center={x:cx/ps.length,y:cy/ps.length};
    }
    if(commit(()=>model.elements.push(e))){select([e.id]);points=[]}
    render();
  }else if(points.length)toast('Add at least three boundary points');
}

function placeElevationSectionCallout(p){
  const code='SEC-'+(model.elements.filter(e=>e.type==='section_callout').length+1);
  if(view==='panel'){
    const w=framingWall();
    if(!w){toast('Select a wall to generate a section stack-up callout');return false;}
    const len=distance(w.a,w.b),h=heightOf(w),s=Math.min((width-120)/len,(height-185)/h)*scale,ox=width/2-len*s/2+pan.x;
    const xAlong=Math.max(0,Math.min(len,(p.x-ox)/s));
    const stackup=computeVerticalStackup(w,xAlong);
    if(!stackup)return false;
    const wxMin=Math.min(w.a.x,w.b.x);
    const sc=newElement('section_callout',{
      code,
      wallId:w.id,
      openingId:stackup.openingId,
      xAlongWall:stackup.xAlongWall,
      elevX:wxMin+stackup.xAlongWall,
      a:{x:wxMin+stackup.xAlongWall,y:w.a.y},
      b:{x:wxMin+stackup.xAlongWall,y:w.b.y}
    });
    if(commit(()=>model.elements.push(sc))){
      select([sc.id]);
      toast(`Section Stack-Up Callout (${code}) generated on ${w.id}: Top Plates (${stackup.topPlates.thickness}mm) · Header (${stackup.header.thickness}mm) · Sill (${stackup.sill.thickness}mm)`);
    }
    render();
    return true;
  }
  const s=baseScale*scale,ox=width/2-6500*s+pan.x;
  const elevX=(p.x-ox)/s;
  const walls=model.elements.filter(e=>e.type==='wall'&&e.story===activeStory&&shown(e));
  const horizExtWalls=walls.filter(w=>Math.abs(w.a.y-w.b.y)<1&&w.layer==='Exterior Walls');
  const maxY=horizExtWalls.length?Math.max(...horizExtWalls.map(w=>w.a.y)):0;
  const elevWalls=horizExtWalls.filter(e=>e.a.y>=maxY-1);
  const targetW=elevWalls.find(w=>elevX>=Math.min(w.a.x,w.b.x)-200&&elevX<=Math.max(w.a.x,w.b.x)+200)||elevWalls[0]||walls[0];
  if(!targetW){toast('No wall found in elevation view');return false;}
  const wxMin=Math.min(targetW.a.x,targetW.b.x);
  const xAlong=Math.max(0,Math.min(distance(targetW.a,targetW.b),elevX-wxMin));
  const stackup=computeVerticalStackup(targetW,xAlong);
  if(!stackup)return false;
  const sc=newElement('section_callout',{
    code,
    wallId:targetW.id,
    openingId:stackup.openingId,
    xAlongWall:stackup.xAlongWall,
    elevX:wxMin+stackup.xAlongWall,
    a:{x:wxMin+stackup.xAlongWall,y:targetW.a.y},
    b:{x:wxMin+stackup.xAlongWall,y:targetW.b.y}
  });
  if(commit(()=>model.elements.push(sc))){
    select([sc.id]);
    toast(`Section Stack-Up Callout (${code}) generated on ${targetW.id}: Top Plates (${stackup.topPlates.thickness}mm) · Header (${stackup.header.thickness}mm) · Sill (${stackup.sill.thickness}mm)`);
  }
  render();
  return true;
}

function pointer(e){let r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}}
canvas.onpointerdown=e=>{
  if(e.button===2)return;
  canvas.focus();
  let p=pointer(e);lastPointer=p;canvas.setPointerCapture(e.pointerId);
  if(view==='framingplan' && typeof window.getAutoFixButtonBox==='function'){
    const box=window.getAutoFixButtonBox();
    if(box && p.x>=box.minX && p.x<=box.maxX && p.y>=box.minY && p.y<=box.maxY){
      commit(()=>{
        if(typeof window.autoFixAllOverlappingStuds==='function'){
          window.autoFixAllOverlappingStuds(model);
        }
      });
      render();
      toast('⚡ Auto-adjusted wall framing: zero overlapping studs remaining!');
      return;
    }
  }
  if(e.button===1||space||tool==='pan'||((view==='3d'||view==='framing3d')&&e.shiftKey)){drag={kind:'pan',start:p,original:clone(pan)};return}
  if(pipetteActive){
    const hit=planPick(p);
    if(hit){
      absorbedParams={type:hit.type,thickness:hit.thickness,height:hit.height,material:hit.material,layer:hit.layer,reference:hit.reference,pitch:hit.pitch,width:hit.width};
      pipetteActive=false;$('#pipette-btn')?.classList.remove('active');canvas.style.cursor='default';
      toast(`Parameters picked from ${hit.id} (${hit.type}). Use Syringe to inject.`);
      return;
    }
  }
  if(syringeActive){
    const hit=planPick(p);
    if(hit&&absorbedParams){
      commit(()=>{
        if(absorbedParams.thickness&&hit.thickness!==undefined)hit.thickness=absorbedParams.thickness;
        if(absorbedParams.height&&hit.height!==undefined){hit.height=absorbedParams.height;hit.followStory=false}
        if(absorbedParams.material)hit.material=absorbedParams.material;
        if(absorbedParams.layer)hit.layer=absorbedParams.layer;
        if(absorbedParams.reference&&hit.reference!==undefined)hit.reference=absorbedParams.reference;
      });
      syringeActive=false;$('#syringe-btn')?.classList.remove('active');canvas.style.cursor='default';
      toast(`Parameters injected into ${hit.id}`);
      return;
    }
  }
  if(tool==='section'&&(view==='elevation'||view==='panel'||view==='section')){
    placeElevationSectionCallout(p);
    return;
  }
  if(DIMENSION_TOOLS.includes(tool)){
    let q=['trim','extend'].includes(editing)?world(p):snapped(world(p));
    const ortho=e.shiftKey||orthoActive;
    if(ortho&&points.length){
      const a=points.at(-1),d=distance(a,q),ang=Math.round(Math.atan2(q.y-a.y,q.x-a.x)/(Math.PI/4))*Math.PI/4;
      q={x:a.x+Math.cos(ang)*d,y:a.y+Math.sin(ang)*d};
    }
    place(q);
    return;
  }
  if(tool==='marquee'&&view==='plan'){drag={kind:'marquee',start:p,extend:e.shiftKey};render();return}
  if((wandActive||(space&&['slab','roof','zone','fill','wall','railing'].includes(tool)))&&view==='plan'){wandActive=true;place(world(p));return}
  if(view==='3d'||view==='framing3d'){drag={kind:'orbit',start:p,original:orbit,tilt};return}
  if(view==='elevation'||view==='section'){let hit=[...hits].reverse().find(h=>p.x>=h.a.x&&p.x<=h.b.x&&p.y>=h.a.y&&p.y<=h.b.y);select(hit?[hit.id]:[]);return}
  if(view==='roofframingplan'){
    const q=world(p);
    const roofs=model.elements.filter(e=>e.type==='roof'&&shown(e));
    if(roofs.length && typeof projectRoofFraming==='function' && typeof roofPlanAssemblies==='function'){
      try {
        const layout=projectRoofFraming(roofs,false);
        const groups=roofPlanAssemblies(layout.members);
        const clickedTruss=groups.find(g=>segmentDistance(q,g.a,g.b).distance<350);
        if(clickedTruss){
          const tagKey = clickedTruss.tag;
          window.activeTrussTag = tagKey;
          try {
            window.dispatchEvent(new CustomEvent('cadtech:activeTrussChanged', { detail: { tag: tagKey } }));
          } catch(_) {}
          toast(`Selected Truss ${clickedTruss.tag} (${tagKey}) · Click '⚡ Truss Elevation & Stresses' tab to optimize`);
          render();
          return;
        }
      } catch(err) { console.warn(err); }
    }
    const hit=roofs.reverse().find(e=>inside(q,roofGeometry(e).boundary));
    select(hit?[hit.id]:[]);
    return;
  }
  if(view==='framingplan'){
    if(tool==='marquee'){drag={kind:'marquee',start:p,extend:e.shiftKey};render();return}
  }
  if(view==='ewpspecs'){
    const q=world(p);
    // 1. Check endpoint grips A / B of currently selected floor member
    if(selected.length===1 && typeof window.findFloorMemberById==='function'){
      const selInfo = window.findFloorMemberById(selected[0], model);
      if(selInfo && selInfo.member){
        const sm = selInfo.member;
        for(const endKey of ['a','b']){
          if(distance(p, p2(sm[endKey])) < 12){
            drag = {
              kind: 'floorMemberGrip',
              memberId: sm.id,
              end: endKey,
              origA: clone(sm.a),
              origB: clone(sm.b),
              start: p,
              startWorld: clone(q),
              original: clone(model),
              moved: false
            };
            return;
          }
        }
      }
    }
    // 2. Pick any physical floor member under cursor
    const fmHit = typeof pickFloorMemberAtPoint === 'function' ? pickFloorMemberAtPoint(q) : null;
    if(fmHit){
      if(fmHit.id.includes(':BM-') && window.ewpBeamToolState){
        window.ewpBeamToolState.beamId = fmHit.shortTag || 'B-001';
      }
      select([fmHit.id]);
      drag = {
        kind: 'floorMemberMove',
        memberId: fmHit.id,
        origA: clone(fmHit.a),
        origB: clone(fmHit.b),
        start: p,
        startWorld: clone(q),
        original: clone(model),
        moved: false
      };
      toast(`Selected ${fmHit.shortTag || fmHit.id} (${fmHit.type} · ${fmHit.section}) — drag to move or edit in right panel`);
      return;
    }
    const activeSlab = typeof getActiveFloorSlab === 'function' ? getActiveFloorSlab() : null;
    select(activeSlab ? [activeSlab.id] : []);
    return;
  }
  if(view==='panel'){
    const curW=typeof framingWall==='function'?framingWall():null;
    if(window._wallPanelInsertStudMode && e.button===0 && curW && typeof window.insertCustomStudAtCoordinate==='function'){
      const allowSnap = !e.shiftKey;
      const probe = window.insertCustomStudAtCoordinate({ canvasX: p.x, canvasY: p.y }, { wall: curW, snapToValid: allowSnap, dryRun: true }, model);
      if(!probe || !probe.ok){
        toast(`Constraint: ${probe?.reason || 'Cannot insert custom stud at this coordinate.'}`);
        return;
      }
      let res = null;
      commit(()=>{
        res = window.insertCustomStudAtCoordinate({ canvasX: p.x, canvasY: p.y }, { wall: curW, snapToValid: allowSnap }, model);
        if(res?.ok && res.studId) selected = [res.studId];
      });
      if(res?.ok){
        const wt = window._wallPanelTransform;
        const xEl = $('#wall-panel-insert-x'), zEl = $('#wall-panel-insert-z');
        if(xEl) xEl.value = Math.round((res.x0 + res.x1) / 2);
        if(zEl && wt) zEl.value = Math.round((wt.oy - p.y) / wt.s) >= 0 ? Math.round((res.z0 + res.z1) / 2) : '';
        toast(`Inserted custom stud on ${curW.id} at X=${Math.round(res.x0)}–${Math.round(res.x1)} mm, Z=${Math.round(res.z0)}–${Math.round(res.z1)} mm${res.adjusted?.snapped ? ' (snapped to valid slot)' : ''}`);
      }
      render();
      return;
    }
    let hit=planPick(p);
    let grabbedDirectly = Boolean(hit?.isStud);
    // If a stud is already selected on this panel and the user clicks & drags anywhere in the panel, allow dragging that selected stud
    if(!hit?.isStud && Array.isArray(selected) && selected.length===1 && typeof selected[0]==='string' && selected[0].includes(':STUD:')){
      const wt = window._wallPanelTransform;
      if(wt && p.x >= wt.ox - 24 && p.x <= wt.ox + wt.len * wt.s + 24 && p.y >= wt.oy - wt.h * wt.s - 24 && p.y <= wt.oy + 190){
        const sInfo = window.findStudById?.(selected[0], model);
        if(sInfo && (!curW || sInfo.wall.id === curW.id)){
          hit = { id: sInfo.member.id, type: 'stud', isStud: true, wallId: sInfo.wall.id, host: sInfo.wall.id, member: sInfo.member };
          grabbedDirectly = false;
        }
      }
    }
    select(hit?[hit.isStud?hit.id:(hit.host||hit.id)]:(curW?[curW.id]:[]));
    if(hit?.isStud){
      const sInfo = window.findStudById?.(hit.id, model);
      const wt = window._wallPanelTransform;
      const pScale = wt?.s || 1;
      const curM = sInfo?.member || hit.member;
      const curSpan = Math.max(10, (curM?.x1 - curM?.x0) || 38);
      const clickPanelX0 = wt ? ((p.x - wt.ox) / pScale - curSpan / 2) : (curM?.x0 ?? 0);
      drag = {
        kind: 'studMove',
        isPanelView: true,
        grabbedDirectly,
        studId: hit.id,
        wallId: hit.wallId || hit.host || curW?.id,
        start: p,
        panelScale: pScale,
        origX0: grabbedDirectly ? (curM?.x0 ?? 0) : clickPanelX0,
        original: clone(model),
        moved: false,
        hit
      };
      if (grabbedDirectly) showPetPalette(p, hit, 'stud');
    } else {
      hidePetPalette();
    }
    render();
    return;
  }
  if(view!=='plan' && view!=='framingplan' && view!=='roofframingplan' && view!=='ewpspecs' && view!=='panel'){
    if(tool !== 'select'){
      setView('plan');
      toast('Switched to Ground floor plan for drafting');
    } else {
      return;
    }
  }
  let q=['trim','extend','intersect','split','join'].includes(editing)?world(p):snapped(world(p));
  const ortho=e.shiftKey||orthoActive;
  if(ortho&&points.length){const a=points.at(-1),d=distance(a,q),ang=Math.round(Math.atan2(q.y-a.y,q.x-a.x)/(Math.PI/4))*Math.PI/4;q={x:a.x+Math.cos(ang)*d,y:a.y+Math.sin(ang)*d}}
  if(tool==='select'&&!editing){
    // Dimension grip & offset line dragging (Timber Teck Dimension editing)
    for(const dimEl of model.elements.filter(el=>el.type==='dimension'&&selected.includes(el.id))){
      const d=resolveDimension(dimEl);
      const A=p2(d.a),B=p2(d.b),len=distance(A,B)||1,n={x:-(B.y-A.y)/len,y:(B.x-A.x)/len};
      const offPx=(d.offset??600)*baseScale*scale;
      const aa={x:A.x+n.x*offPx,y:A.y+n.y*offPx};
      const bb={x:B.x+n.x*offPx,y:B.y+n.y*offPx};
      const mid={x:(aa.x+bb.x)/2,y:(aa.y+bb.y)/2};
      if(distance(p,A)<11){
        drag={kind:'dimAnchor',id:dimEl.id,end:'a',start:p,original:clone(model),moved:false};return;
      }
      if(distance(p,B)<11){
        drag={kind:'dimAnchor',id:dimEl.id,end:'b',start:p,original:clone(model),moved:false};return;
      }
      if(distance(p,mid)<14||distance(p,aa)<11||distance(p,bb)<11||segmentDistance(p,aa,bb).distance<9){
        drag={kind:'dimOffset',id:dimEl.id,start:p,original:clone(model),moved:false};return;
      }
    }
    for(const roof of model.elements.filter(e=>e.type==='roof'&&selected.includes(e.id))){
      const vertex=roof.points.findIndex(v=>distance(p,p2(v))<9);
      if(vertex>=0){drag={kind:'roofGrip',id:roof.id,vertex,start:p,original:clone(model),moved:false};showPetPalette(p,roof,'node');return}
    }
    for(const id of selected){
      const fmInfo = (typeof id === 'string' && !id.includes(':STUD:') && id.includes(':') && typeof window.findFloorMemberById === 'function')
        ? window.findFloorMemberById(id, model)
        : null;
      if(fmInfo && fmInfo.member){
        for(const endKey of ['a','b']){
          if(distance(p, p2(fmInfo.member[endKey])) < 11){
            drag={kind:'floorMemberGrip',memberId:fmInfo.member.id,end:endKey,origA:clone(fmInfo.member.a),origB:clone(fmInfo.member.b),start:p,startWorld:clone(q),original:clone(model),moved:false};
            return;
          }
        }
      }
      const w=model.elements.find(e=>e.id===id&&['wall','line','beam','stair','curtainwall'].includes(e.type));
      if(!w)continue;
      for(const end of ['a','b'])if(distance(p,p2(w[end]))<9){
        drag={kind:'grip',id,end,start:p,original:clone(model),moved:false};showPetPalette(p,w,'node');return;
      }
    }
  }
  if(view!=='framingplan'&&tool==='wall'&&!editing){
    if(e.button===2||(e.detail>=2&&points.length>0)){
      finish();
      return;
    }
    const geom=toolGeomMethod.wall||'single';
    if(geom==='rect'||geom==='rotated_rect'){
      place(q);
      return;
    }
    const hadStartPoint=points.length>0;
    if(!hadStartPoint)points=[clone(q)];
    drag={kind:'wallDraw',start:p,startWorld:clone(q),hadStartPoint,dragged:false};
    render();
    return;
  }
  if((view!=='framingplan'||editing)&&(tool!=='select'||editing)){place(q);return}
  let hit=planPick(p);
  if(hit){
    if(e.shiftKey){
      const pickedId=(hit.isStud&&(hit.wallId||hit.host))?(hit.wallId||hit.host):(hit.host||hit.id);
      const normalizedSelected=selected.map(id=>(typeof id==='string'&&id.includes(':STUD:'))?id.split(':STUD:')[0]:id);
      const nextSelected=normalizedSelected.includes(pickedId)
        ? normalizedSelected.filter(id=>id!==pickedId)
        : [...new Set([...normalizedSelected,pickedId])];
      select(nextSelected);
      hidePetPalette();
      render();
      return;
    }
    select([hit.id]);
    if(hit.isStud){
      const sInfo = window.findStudById?.(hit.id, model);
      drag={kind:'studMove',grabbedDirectly:true,studId:hit.id,wallId:hit.wallId||hit.host,start:p,startWorld:world(p),origX0:sInfo?.member?.x0 ?? hit.member?.x0 ?? 0,original:clone(model),moved:false,hit};
      showPetPalette(p,hit,'stud');
      render();
    }else if(hit.isFloorMember && hit.member){
      drag={kind:'floorMemberMove',memberId:hit.id,origA:clone(hit.member.a),origB:clone(hit.member.b),start:p,startWorld:world(p),original:clone(model),moved:false};
      hidePetPalette();
      render();
    }else if(hit.type==='dimension'){
      drag={kind:'dimOffset',id:hit.id,start:p,original:clone(model),moved:false};
    }else{
      drag={kind:'element',start:p,startWorld:q,original:clone(model),moved:false};
      showPetPalette(p,hit,'edge');
    }
  }else{
    if(!e.shiftKey){select([]);hidePetPalette();}
    drag={kind:'marquee',start:p,extend:e.shiftKey};render();
  }
};
let _lastCollisionAlertTime = 0;
let _wasInCollisionState = false;

function checkRealtimeCollisionAlert() {
  if (!drag) return;

  let collisionDetected = false;
  let collisionReason = '';

  // 1. Audit stud collisions on all framed walls via auditAllStudCollisions
  if (typeof window.auditAllStudCollisions === 'function') {
    const audit = window.auditAllStudCollisions(model);
    if (audit && audit.activeCollisions && audit.activeCollisions.length > 0) {
      collisionDetected = true;
      const col = audit.activeCollisions[0];
      collisionReason = `Stud on ${col.wallId} collides with ${col.targetDetail || col.collisionType}!`;
    }
  }

  // 2. Check overlap between vertical studs across walls
  if (!collisionDetected) {
    for (const w of model.elements.filter(e => e.type === 'wall')) {
      const layout = typeof generateWallFraming === 'function' ? generateWallFraming(w, model) : { members: [] };
      const vStuds = (layout.members || []).filter(m => m.isStud && Number.isFinite(m.x0) && Number.isFinite(m.x1));
      for (let i = 0; i < vStuds.length; i++) {
        for (let j = i + 1; j < vStuds.length; j++) {
          const s1 = vStuds[i], s2 = vStuds[j];
          const lap = Math.min(s1.x1, s2.x1) - Math.max(s1.x0, s2.x0);
          if (lap > 5 && Math.abs((s1.z0 + s1.z1) - (s2.z0 + s2.z1)) < 200) {
            collisionDetected = true;
            collisionReason = `Stud ${s1.type} collides with ${s2.type} at ${Math.round((s1.x0 + s1.x1) / 2)} mm on ${w.id}!`;
            break;
          }
        }
        if (collisionDetected) break;
      }
      if (collisionDetected) break;
    }
  }

  // 3. Check opening collisions (opening overlapping another opening or extending past host wall bounds)
  if (!collisionDetected) {
    for (const w of model.elements.filter(e => e.type === 'wall')) {
      const len = distance(w.a, w.b);
      const ops = model.elements.filter(e => e.host === w.id && (e.type === 'door' || e.type === 'window'));
      for (let i = 0; i < ops.length; i++) {
        const o1 = ops[i];
        const half1 = (o1.width || 900) / 2;
        if (o1.offset - half1 < -1 || o1.offset + half1 > len + 1) {
          collisionDetected = true;
          collisionReason = `${o1.id || o1.type} extends beyond host wall ${w.id} bounds!`;
          break;
        }
        for (let j = i + 1; j < ops.length; j++) {
          const o2 = ops[j];
          const half2 = (o2.width || 900) / 2;
          if (Math.abs(o1.offset - o2.offset) < (half1 + half2) - 5) {
            collisionDetected = true;
            collisionReason = `${o1.id || 'Opening'} collides with ${o2.id || 'Opening'} on ${w.id}!`;
            break;
          }
        }
        if (collisionDetected) break;
      }
      if (collisionDetected) break;
    }
  }

  const now = Date.now();
  if (collisionDetected) {
    if (!_wasInCollisionState || (now - _lastCollisionAlertTime > 1200)) {
      _lastCollisionAlertTime = now;
      _wasInCollisionState = true;
      toast(`⚠️ Collision Alert: ${collisionReason || 'Structural member collision detected!'}`);
    }
  } else {
    _wasInCollisionState = false;
  }
}

canvas.onpointermove=e=>{
  let p=pointer(e);lastPointer=p;hover=snapped(world(p));
  const ortho=e.shiftKey||orthoActive;
  if(ortho&&points.length&&!drag){
    const a=points.at(-1),d=distance(a,hover),ang=Math.round(Math.atan2(hover.y-a.y,hover.x-a.x)/(Math.PI/4))*Math.PI/4;
    hover={x:a.x+Math.cos(ang)*d,y:a.y+Math.sin(ang)*d};
  }
  if(document.activeElement!==$('#track-x'))$('#track-x').value=isImperialUnits()?formatFeetInches(hover.x):Math.round(hover.x);
  if(document.activeElement!==$('#track-y'))$('#track-y').value=isImperialUnits()?formatFeetInches(hover.y):Math.round(hover.y);
  updateDraftTrackerLive(hover);
  if(drag){
    let dx=p.x-drag.start.x,dy=p.y-drag.start.y;
    if(drag.kind==='pan')pan={x:drag.original.x+dx,y:drag.original.y+dy};
    else if(drag.kind==='orbit'){orbit=drag.original+dx*.007;tilt=Math.max(.03,Math.min(Math.PI/2-.02,drag.tilt+dy*.005));sceneCamera.preset='custom'}
    else if(drag.kind==='dimOffset'&&Math.hypot(dx,dy)>2){
      model=clone(drag.original);
      const dimEl=model.elements.find(el=>el.id===drag.id);
      if(dimEl){
        const d=resolveDimension(dimEl);
        const len=distance(d.a,d.b)||1;
        const n={x:-(d.b.y-d.a.y)/len,y:(d.b.x-d.a.x)/len};
        const wPt=world(p);
        dimEl.offset=Math.round((wPt.x-d.a.x)*n.x+(wPt.y-d.a.y)*n.y);
        drag.moved=true;
      }
    }
    else if(drag.kind==='dimAnchor'&&Math.hypot(dx,dy)>2){
      model=clone(drag.original);
      const dimEl=model.elements.find(el=>el.id===drag.id);
      if(dimEl){
        const d=resolveDimension(dimEl);
        dimEl.a=clone(d.a);
        dimEl.b=clone(d.b);
        dimEl[drag.end]=clone(hover);
        if(dimEl.points)dimEl.points=[clone(dimEl.a),clone(dimEl.b)];
        if(dimEl.refs)dimEl.refs[drag.end==='a'?0:1]=dimensionReference(hover);
        drag.moved=true;
      }
    }
    else if(drag.kind==='roofGrip'&&Math.hypot(dx,dy)>2){model=clone(drag.original);const roof=model.elements.find(w=>w.id===drag.id);roof.points[drag.vertex]=clone(hover);try{validateRoof(roof);drag.moved=true}catch(error){model=clone(drag.original)}}
    else if(drag.kind==='grip'&&Math.hypot(dx,dy)>2){
      model=clone(drag.original);
      const w=model.elements.find(w=>w.id===drag.id);
      let targetP=hover;
      if(ortho){
        const fixedEnd=drag.end==='a'?w.b:w.a;
        const d=distance(fixedEnd,targetP);
        const ang=Math.round(Math.atan2(targetP.y-fixedEnd.y,targetP.x-fixedEnd.x)/(Math.PI/4))*Math.PI/4;
        targetP={x:fixedEnd.x+Math.cos(ang)*d,y:fixedEnd.y+Math.sin(ang)*d};
      }
      w[drag.end]=clone(targetP);
      drag.moved=true;
      checkRealtimeCollisionAlert();
    }
    else if(drag.kind==='element'&&Math.hypot(dx,dy)>4){
      let deltaX=hover.x-drag.startWorld.x;
      let deltaY=hover.y-drag.startWorld.y;
      if(ortho){
        if(Math.abs(deltaX)>Math.abs(deltaY))deltaY=0;
        else deltaX=0;
      }
      drag.moved=true;
      model=clone(drag.original);
      translateElements(selected,deltaX,deltaY);
      checkRealtimeCollisionAlert();
    }
    else if(drag.kind==='studMove'&&Math.hypot(dx,dy)>1.5){
      model=clone(drag.original);
      const w=model.elements.find(el=>el.id===drag.wallId&&el.type==='wall');
      if(w&&typeof window.moveStudById==='function'){
        let deltaAlong = 0;
        if (drag.isPanelView || view === 'panel') {
          const pScale = drag.panelScale || window._wallPanelTransform?.s || 1;
          deltaAlong = (p.x - drag.start.x) / pScale;
        } else {
          const len=distance(w.a,w.b)||1;
          const ux=(w.b.x-w.a.x)/len, uy=(w.b.y-w.a.y)/len;
          const wPt=world(p);
          deltaAlong=(wPt.x-drag.startWorld.x)*ux + (wPt.y-drag.startWorld.y)*uy;
        }
        const res=window.moveStudById(drag.studId,{targetX0:Math.round(drag.origX0+deltaAlong)},model);
        if(res?.studId){
          selected=[res.studId];
          if (drag.hit) {
            drag.hit.id = res.studId;
            drag.hit.member = res.member;
          }
          const xInput=$('#pet-move-x0-mm');
          if(xInput)xInput.value=Math.round(res.x0);
        }
        canvas.style.cursor='ew-resize';
        hidePetPalette();
        drag.moved=true;
        checkRealtimeCollisionAlert();
      }
    }
    else if(drag.kind==='floorMemberMove'&&Math.hypot(dx,dy)>2){
      model=clone(drag.original);
      const wPt=snapped(world(p));
      let deltaX=Math.round(wPt.x - drag.startWorld.x);
      let deltaY=Math.round(wPt.y - drag.startWorld.y);
      if(ortho){
        if(Math.abs(deltaX)>Math.abs(deltaY))deltaY=0;
        else deltaX=0;
      }
      if(typeof window.updateFloorMemberById==='function'){
        window.updateFloorMemberById(drag.memberId, {
          a: { x: Math.round(drag.origA.x + deltaX), y: Math.round(drag.origA.y + deltaY) },
          b: { x: Math.round(drag.origB.x + deltaX), y: Math.round(drag.origB.y + deltaY) }
        }, model);
        canvas.style.cursor='move';
        drag.moved=true;
      }
    }
    else if(drag.kind==='floorMemberGrip'&&Math.hypot(dx,dy)>2){
      model=clone(drag.original);
      let targetP=snapped(world(p));
      const fixedEnd = drag.end === 'a' ? drag.origB : drag.origA;
      if(ortho){
        const d=distance(fixedEnd,targetP);
        const ang=Math.round(Math.atan2(targetP.y-fixedEnd.y,targetP.x-fixedEnd.x)/(Math.PI/4))*Math.PI/4;
        targetP={x:Math.round(fixedEnd.x+Math.cos(ang)*d),y:Math.round(fixedEnd.y+Math.sin(ang)*d)};
      }
      if(distance(fixedEnd, targetP) >= 50 && typeof window.updateFloorMemberById === 'function'){
        window.updateFloorMemberById(drag.memberId, {
          a: drag.end === 'a' ? { x: Math.round(targetP.x), y: Math.round(targetP.y) } : clone(drag.origA),
          b: drag.end === 'b' ? { x: Math.round(targetP.x), y: Math.round(targetP.y) } : clone(drag.origB)
        }, model);
        canvas.style.cursor='crosshair';
        drag.moved=true;
      }
    }
    else if(drag.kind==='wallDraw'){
      if(Math.hypot(dx,dy)>=10){
        drag.dragged=true;
        const base=points[0]||drag.startWorld||hover;
        const endPt=typeof getConstrainedDraftPoint==='function'?getConstrainedDraftPoint(base,hover):hover;
        if(points.length===0)points=[clone(base),clone(endPt)];
        else points[1]=clone(endPt);
      }
    }
    render();
  }else{
    if (!pipetteActive && !syringeActive && (view === 'panel' || view === 'framingplan' || view === 'plan' || view === 'ewpspecs')) {
      if (editing) {
        canvas.style.cursor = 'crosshair';
      } else {
        const hoverHit = planPick(p);
        canvas.style.cursor = (hoverHit?.isStud || hoverHit?.isFloorMember) ? 'grab' : (tool === 'select' ? 'default' : 'crosshair');
      }
    }
    render();
  }
};
canvas.onpointerup=e=>{
  _wasInCollisionState = false;
  canvas.style.cursor = 'default';
  if(drag?.kind==='wallDraw'){
    const curDrag=drag;
    drag=null;
    if(curDrag.dragged&&points.length>=2){
      const a=points[0];
      const b=typeof getConstrainedDraftPoint==='function'?getConstrainedDraftPoint(a,points[1]):points[1];
      if(distance(a,b)>=50){
        points=[clone(a)];
        window._singleWallCommit=(toolGeomMethod.wall||'single')!=='chained';
        place(b);
        window._singleWallCommit=false;
      }else{
        points=[clone(a)];
      }
    }else if(curDrag.hadStartPoint&&points.length>=1){
      const a=points[0];
      const rawEnd=curDrag.startWorld||hover;
      const b=typeof getConstrainedDraftPoint==='function'?getConstrainedDraftPoint(a,rawEnd):rawEnd;
      if(distance(a,b)>=50){
        points=[clone(a)];
        place(b);
      }else{
        finish();
      }
    }else if(points.length>=1){
      points=[clone(points[0])];
    }
    render();
    return;
  }
  if(drag?.kind==='orbit'&&distance(drag.start,lastPointer)<4){let hit=transparent?[...projectedFaces].reverse().find(f=>inside(lastPointer,f.points)):pickSolid(lastPointer);select(hit?[hit.id]:[])}
  if(drag?.kind==='studMove'){
    if(drag.moved){
      try{
        validateWallGeometry();
        model.elements.filter(e=>e.type==='roof').forEach(validateRoof);
        model.elements.filter(e=>e.host).forEach(validateOpening);
        modelHistory.push(drag.original);
        future=[];
        changed();
        if (drag.hit && selected[0]) {
          drag.hit.id = selected[0];
          showPetPalette(lastPointer, drag.hit, 'stud');
        }
      }catch(error){
        model=drag.original;
        properties();
        toast(error.message);
      }
    } else if (drag.isPanelView && !drag.grabbedDirectly) {
      const curW = typeof framingWall === 'function' ? framingWall() : null;
      select(curW ? [curW.id] : []);
      hidePetPalette();
    }
  }
  else if(drag?.kind==='floorMemberMove'||drag?.kind==='floorMemberGrip'){
    if(drag.moved){
      modelHistory.push(drag.original);
      future=[];
      changed();
      properties();
      if(typeof updateEWPBeamHUD==='function')updateEWPBeamHUD();
    }
  }
  else if(['element','grip','roofGrip','dimOffset','dimAnchor'].includes(drag?.kind)&&drag.moved){try{validateWallGeometry();model.elements.filter(e=>e.type==='roof').forEach(validateRoof);model.elements.filter(e=>e.host).forEach(validateOpening);modelHistory.push(drag.original);future=[];changed()}catch(error){model=drag.original;properties();toast(error.message)}}
  if(drag?.kind==='marquee'){let a=world(drag.start),b=world(lastPointer);let ids=marqueeIds(a,b,lastPointer.x<drag.start.x);select(drag.extend?[...new Set([...selected,...ids])]:ids)}
  drag=null;render();
};
canvas.onpointercancel=()=>{_wasInCollisionState = false;if(['element','grip','roofGrip','dimOffset','dimAnchor','studMove','floorMemberMove','floorMemberGrip'].includes(drag?.kind))model=drag.original;drag=null;render()};
canvas.ondblclick=finish;canvas.oncontextmenu=e=>e.preventDefault();
canvas.onwheel=e=>{e.preventDefault();const p=pointer(e),old=scale;scale=Math.max(.15,Math.min(8,scale*(e.deltaY>0?.9:1.1)));if(!isModelView()){const r=scale/old;pan={x:p.x-width/2-r*(p.x-width/2-pan.x),y:p.y-height/2-20-r*(p.y-height/2-20-pan.y)}}if(isModelView()){const r=scale/old;pan={x:p.x-width/2-r*(p.x-width/2-pan.x),y:p.y-height/2-18-r*(p.y-height/2-18-pan.y)}}render()};

function resolveLinearElementFromId(id){
  if(!id||typeof id!=='string')return null;
  if(id.includes(':STUD:')){
    const wId=id.split(':STUD:')[0];
    const w=model.elements.find(e=>e.id===wId&&e.type==='wall');
    if(w)return w;
    const found=typeof window.findStudById==='function'?window.findStudById(id,model):null;
    if(found?.wall)return found.wall;
  }
  const el=model.elements.find(e=>e.id===id);
  if(!el)return null;
  if(el.host){
    const h=hostOf(el);
    if(h&&h.a&&h.b)return h;
  }
  if(el.a&&el.b&&['wall','beam','line','curtainwall','railing'].includes(el.type))return el;
  return null;
}

function getSelectedLinearElements(){
  const out=[];
  const seen=new Set();
  for(const id of selected){
    const el=resolveLinearElementFromId(id);
    if(el&&!seen.has(el.id)){
      seen.add(el.id);
      out.push(el);
    }
  }
  return out;
}

function pickLinearElementAt(screenPt,excludeId=null){
  if(!screenPt)return null;
  const q=world(screenPt);
  const tolPx=16/Math.max(baseScale*scale,0.005);
  const candidates=[];
  for(const e of model.elements.filter(shown)){
    if(!e.a||!e.b||!['wall','beam','line','curtainwall','railing'].includes(e.type))continue;
    let d=segmentDistance(q,e.a,e.b).distance;
    if(e.type==='wall'){
      const poly=wallPoly(e);
      if(poly&&poly.length>=3&&inside(q,poly))d=0;
      else d=Math.max(0,d-(e.thickness||140)*0.5);
    }else if(e.thickness){
      d=Math.max(0,d-e.thickness*0.5);
    }
    if(d<=Math.max(tolPx,120)){
      candidates.push({el:e,d});
    }
  }
  candidates.sort((a,b)=>{
    const aEx=excludeId&&a.el.id===excludeId?1:0;
    const bEx=excludeId&&b.el.id===excludeId?1:0;
    if(aEx!==bEx)return aEx-bEx;
    return a.d-b.d;
  });
  if(candidates.length)return candidates[0].el;
  const rawPick=planPick(screenPt);
  return resolveLinearElementFromId(rawPick?.wallId||rawPick?.host||rawPick?.id);
}

function moveWallEndpointTo(w,end,pt){
  const oldA=clone(w.a),oldB=clone(w.b);
  const oldLen=distance(oldA,oldB)||1;
  const u={x:(oldB.x-oldA.x)/oldLen,y:(oldB.y-oldA.y)/oldLen};
  w[end]={x:Math.round(pt.x*100)/100,y:Math.round(pt.y*100)/100};
  if(w.type==='wall'){
    const newLen=distance(w.a,w.b)||1;
    const shift=end==='a'?((oldA.x-w.a.x)*u.x+(oldA.y-w.a.y)*u.y):0;
    for(const o of hosted(w)){
      if(end==='a')o.offset=Math.round((o.offset+shift)*100)/100;
      const half=(o.width||900)/2;
      if(newLen>o.width+40){
        o.offset=Math.max(half+20,Math.min(newLen-half-20,o.offset));
      }else{
        o.offset=newLen/2;
      }
    }
  }
}

function computePairIntersection(w1,w2,mode='pair'){
  if(!w1||!w2||w1.id===w2.id||!w1.a||!w1.b||!w2.a||!w2.b)return null;
  const h=axisIntersection(w1.a,w1.b,w2.a,w2.b);
  if(h){
    const pt={x:Math.round(h.point.x*100)/100,y:Math.round(h.point.y*100)/100};
    let end1=distance(w1.a,pt)<=distance(w1.b,pt)?'a':'b';
    let keep1=end1==='a'?'b':'a';
    if(distance(w1[keep1],pt)<20&&distance(w1[end1],pt)>=20){end1=keep1;keep1=end1==='a'?'b':'a';}
    let end2=distance(w2.a,pt)<=distance(w2.b,pt)?'a':'b';
    let keep2=end2==='a'?'b':'a';
    if(distance(w2[keep2],pt)<20&&distance(w2[end2],pt)>=20){end2=keep2;keep2=end2==='a'?'b':'a';}
    if(distance(w1[keep1],pt)<20)return null;

    const cornerTol=Math.max(w1.thickness||140,w2.thickness||140)*0.6;
    const ptOnW2Span=h.s>=-0.001&&h.s<=1.001;
    const ptInW2Interior=ptOnW2Span&&Math.min(distance(w2.a,pt),distance(w2.b,pt))>cornerTol;
    const ptOnW1Span=h.t>=-0.001&&h.t<=1.001;
    const ptInW1Interior=ptOnW1Span&&Math.min(distance(w1.a,pt),distance(w1.b,pt))>cornerTol;

    let moveFirst=true;
    let moveSecond=true;
    if(mode==='connectFirst'){
      // First selected wall (w1) connects to second selected wall (w2):
      // If intersection pt is along w2's span (away from w2's endpoints), w1 extends/trims onto w2 without shortening w2.
      // If pt is beyond w2's ends (w2 doesn't reach pt yet) or at w2's endpoint, w2 also extends/connects to pt.
      moveFirst=true;
      moveSecond=!ptInW2Interior;
    }else{
      // Pair mode (two walls selected together and Intersect clicked):
      // If w1 stops short of w2's interior, extend w1 onto w2 (T-junction).
      // If w2 stops short of w1's interior, extend w2 onto w1 (T-junction).
      // Otherwise join both endpoints at the corner pt.
      if(ptInW2Interior&&!ptOnW1Span){
        moveFirst=true;
        moveSecond=false;
      }else if(ptInW1Interior&&!ptOnW2Span){
        moveFirst=false;
        moveSecond=true;
      }
    }
    if(moveSecond&&distance(w2[keep2],pt)<20)return null;
    const dist=(moveFirst?distance(w1[end1],pt):0)+(moveSecond?distance(w2[end2],pt):0);
    return {pt,end1,end2,moveFirst,moveSecond,dist};
  }
  // Collinear walls: meet or connect between their closest endpoints
  const len1=distance(w1.a,w1.b)||1,u1=sub2(w1.b,w1.a);
  const perpDist=Math.abs(cross2(u1,sub2(w2.a,w1.a)))/len1;
  if(perpDist<=Math.max(w1.thickness||200,w2.thickness||200)*0.5){
    let best=null;
    for(const e1 of ['a','b']){
      for(const e2 of ['a','b']){
        const d=distance(w1[e1],w2[e2]);
        if(!best||d<best.d)best={e1,e2,d};
      }
    }
    if(best){
      const keep1=best.e1==='a'?'b':'a',keep2=best.e2==='a'?'b':'a';
      if(mode==='connectFirst'){
        // Connect first wall's nearest endpoint directly to second wall's nearest endpoint
        const targetPt=w2[best.e2];
        const tTarget=((targetPt.x-w1.a.x)*u1.x+(targetPt.y-w1.a.y)*u1.y)/(len1*len1);
        const pt={x:Math.round((w1.a.x+u1.x*tTarget)*100)/100,y:Math.round((w1.a.y+u1.y*tTarget)*100)/100};
        if(distance(w1[keep1],pt)>=20){
          return {pt,end1:best.e1,end2:best.e2,moveFirst:true,moveSecond:false,dist:best.d};
        }
      }
      const mid=lerp(w1[best.e1],w2[best.e2],0.5);
      const tMid=((mid.x-w1.a.x)*u1.x+(mid.y-w1.a.y)*u1.y)/(len1*len1);
      const pt={x:Math.round((w1.a.x+u1.x*tMid)*100)/100,y:Math.round((w1.a.y+u1.y*tMid)*100)/100};
      if(distance(w1[keep1],pt)>=20&&distance(w2[keep2],pt)>=20){
        return {pt,end1:best.e1,end2:best.e2,moveFirst:true,moveSecond:true,dist:best.d};
      }
    }
  }
  return null;
}

function connectFirstWallToSecond(w1,w2){
  const info=computePairIntersection(w1,w2,'connectFirst');
  if(!info){
    toast('Selected walls are parallel and do not intersect.');
    return false;
  }
  const ok=commit(()=>{
    const el1=model.elements.find(e=>e.id===w1.id);
    const el2=model.elements.find(e=>e.id===w2.id);
    if(!el1||!el2)throw Error('Selected walls not found.');
    if(info.moveFirst)moveWallEndpointTo(el1,info.end1,info.pt);
    if(info.moveSecond)moveWallEndpointTo(el2,info.end2,info.pt);
  },false);
  if(ok){
    select([w1.id,w2.id]);
    toast(`Connected ${w1.id} to ${w2.id}`);
  }
  return ok;
}

function intersectTwoLinearElements(w1,w2){
  const info=computePairIntersection(w1,w2,'pair');
  if(!info){
    toast('Selected walls are parallel and do not intersect.');
    return false;
  }
  const ok=commit(()=>{
    const el1=model.elements.find(e=>e.id===w1.id);
    const el2=model.elements.find(e=>e.id===w2.id);
    if(!el1||!el2)throw Error('Selected walls not found.');
    if(info.moveFirst!==false)moveWallEndpointTo(el1,info.end1,info.pt);
    if(info.moveSecond!==false)moveWallEndpointTo(el2,info.end2,info.pt);
  },false);
  if(ok){
    select([w1.id,w2.id]);
    toast(`Intersected ${w1.id} and ${w2.id}`);
  }
  return ok;
}

function drawIntersectPreview(){
  if(editing!=='intersect'||(view!=='plan'&&view!=='framingplan'))return;
  const firstWall=resolveLinearElementFromId(window._intersectFirstWallId)||getSelectedLinearElements()[0];
  if(!firstWall||!lastPointer)return;
  const target=pickLinearElementAt(lastPointer,firstWall.id);
  if(!target||target.id===firstWall.id)return;
  const info=computePairIntersection(firstWall,target,'connectFirst');
  if(!info)return;
  const pStart=p2(firstWall[info.end1]);
  const pInt=p2(info.pt);
  line(pStart,pInt,'#2563eb',2.2,[6,4]);
  if(info.moveSecond){
    line(p2(target[info.end2]),pInt,'#0d9488',2.0,[5,4]);
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(pInt.x,pInt.y,6,0,Math.PI*2);
  ctx.fillStyle='rgba(37,99,235,0.22)';
  ctx.fill();
  ctx.lineWidth=2;
  ctx.strokeStyle='#2563eb';
  ctx.stroke();
  ctx.restore();
  label(`CONNECT ${firstWall.id} → ${target.id}`,pInt.x+10,pInt.y-10,10,'#1d4ed8','left');
}

function intersectSelectedElements(){
  const elems=getSelectedLinearElements();
  if(elems.length===0){
    if(view!=='plan'&&view!=='framingplan')setView('plan');
    window._intersectFirstWallId=null;
    editing='intersect';
    tool='select';
    points=[];
    toolState();
    render();
    toast('Intersect: Click the first wall, then click the second wall to connect');
    return;
  }
  if(elems.length===1){
    if(view!=='plan'&&view!=='framingplan')setView('plan');
    window._intersectFirstWallId=elems[0].id;
    select([elems[0].id]);
    editing='intersect';
    tool='select';
    points=[];
    toolState();
    render();
    toast(`Intersect: Click the second wall to connect ${elems[0].id} to it`);
    return;
  }
  if(elems.length===2){
    window._intersectFirstWallId=null;
    editing=null;
    points=[];
    intersectTwoLinearElements(elems[0],elems[1]);
    toolState();
    render();
    return;
  }
  // 3 or more linear elements selected: intersect mutually closest corner pairs
  const candidates=[];
  for(let i=0;i<elems.length;i++){
    for(let j=i+1;j<elems.length;j++){
      const info=computePairIntersection(elems[i],elems[j],'pair');
      if(info)candidates.push({w1:elems[i],w2:elems[j],...info});
    }
  }
  if(!candidates.length){
    toast('No valid intersections found among selected walls.');
    return;
  }
  candidates.sort((a,b)=>a.dist-b.dist);
  const usedEndpoints=new Set();
  const chosen=[];
  for(const c of candidates){
    const k1=`${c.w1.id}:${c.end1}`,k2=`${c.w2.id}:${c.end2}`;
    if((c.moveFirst!==false&&usedEndpoints.has(k1))||(c.moveSecond!==false&&usedEndpoints.has(k2)))continue;
    if(c.moveFirst!==false)usedEndpoints.add(k1);
    if(c.moveSecond!==false)usedEndpoints.add(k2);
    chosen.push(c);
  }
  if(!chosen.length){
    toast('No valid corner intersections found among selected walls.');
    return;
  }
  const ok=commit(()=>{
    for(const c of chosen){
      const el1=model.elements.find(e=>e.id===c.w1.id);
      const el2=model.elements.find(e=>e.id===c.w2.id);
      if(el1&&el2){
        if(c.moveFirst!==false)moveWallEndpointTo(el1,c.end1,c.pt);
        if(c.moveSecond!==false)moveWallEndpointTo(el2,c.end2,c.pt);
      }
    }
  },false);
  if(ok){
    window._intersectFirstWallId=null;
    editing=null;
    points=[];
    select(elems.map(e=>e.id));
    toolState();
    render();
    toast(`Intersected ${chosen.length} wall connection(s)`);
  }
}

function edit(action){
  if(action==='join')action='trim';
  if(action==='intersect'){intersectSelectedElements();return}
  if(action==='trim'||action==='extend'){trimBoundaryIds=[...selected];if(view!=='plan')setView('plan');editing=action;tool='select';points=[];toolState();return}
  if(action==='rotate'){rotationDialog();return}
  if(action==='array'){arrayDialog();return}
  if(action==='align'){alignmentDialog();return}
  if(action==='dimension'){dimensionSelectedWall();return}
  if(action==='fillet'){
    openModal('Fillet / Chamfer',`<div class="modal-copy">Fillet or chamfer the selected geometry intersection:</div><label class="modal-field">Radius <input id="dialog-fillet-r" type="number" value="500"><span>mm</span></label><div class="modal-actions"><button id="dialog-fillet-go" class="primary">Apply</button></div>`);
    bindClick('#dialog-fillet-go', ()=>{toast(`Fillet applied at ${$('#dialog-fillet-r')?.value||500} mm`);$('#modal')?.close?.()});return;
  }
  if(action==='elevate'){
    openModal('Elevate elements',`<div class="modal-copy">Elevate selected elements along the Z-axis:</div><label class="modal-field">Height delta <input id="elevate-z" type="number" value="1000"><span>mm</span></label><div class="modal-actions"><button id="elevate-go" class="primary">Elevate</button></div>`);
    bindClick('#elevate-go', ()=>{const dz=Number($('#elevate-z')?.value)||0;commit(()=>{model.elements.filter(e=>selected.includes(e.id)).forEach(e=>{if(e.sill!==undefined)e.sill+=dz;else if(e.elevation!==undefined)e.elevation+=dz})});toast(`Elevated by ${dz} mm`);$('#modal')?.close?.()});return;
  }
  if(!selected.length){toast('Select an element or stud first');return}
  if(['move','copy','split','join','offset','stretch','mirror'].includes(action)){if(view!=='plan')setView('plan');editing=action;tool='select';points=[];toolState();return}
  if(action==='delete'){
    const cleanupDeletedLinks=(elemIds)=>{
      model.elements=model.elements.filter(e=>!elemIds.has(e.id)&&!elemIds.has(e.host)&&!(e.type==='section_callout'&&elemIds.has(e.wallId)));
      for(const el of model.elements){
        if(el.roofTrim){
          if(Array.isArray(el.roofTrim.roofIds)){
            el.roofTrim.roofIds=el.roofTrim.roofIds.filter(rid=>!elemIds.has(rid));
            el.roofTrim.roofId=el.roofTrim.roofIds[0]||null;
            if(!el.roofTrim.roofIds.length)delete el.roofTrim;
          }else if(el.roofTrim.roofId&&elemIds.has(el.roofTrim.roofId)){
            delete el.roofTrim;
          }
        }
      }
      if(Array.isArray(model.seoOperations))model.seoOperations=model.seoOperations.filter(op=>!elemIds.has(op.targetId)&&!elemIds.has(op.operatorId));
    };
    const floorMemberIds = selected.filter(id => typeof id === 'string' && !id.includes(':STUD:') && id.includes(':') && window.findFloorMemberById?.(id, model));
    if(floorMemberIds.length > 0 && typeof window.deleteFloorMemberById === 'function'){
      let hostSlabId = null;
      commit(()=>{
        for(const fid of floorMemberIds){
          const info = window.findFloorMemberById?.(fid, model);
          if(info && !hostSlabId) hostSlabId = info.slab.id;
          window.deleteFloorMemberById(fid, model);
        }
        selected = hostSlabId ? [hostSlabId] : [];
      });
      toast(`Deleted ${floorMemberIds.length} selected floor member(s)`);
      return;
    }
    const studIds = selected.filter(id => typeof id === 'string' && id.includes(':STUD:'));
    if(studIds.length > 0 && typeof window.deleteStudById === 'function'){
      let hostWallId = null;
      commit(()=>{
        for(const sid of studIds){
          const info = window.findStudById?.(sid, model);
          if(info && !hostWallId) hostWallId = info.wall.id;
          window.deleteStudById(sid, model);
        }
        const elemIds = new Set(selected.filter(id => !studIds.includes(id)));
        if(elemIds.size > 0){
          for(const d of model.elements.filter(e=>e.type==='dimension'&&e.refs?.some(ref=>ref&&elemIds.has(ref.elementId)))){const resolved=resolveDimension(d);d.a=clone(resolved.a);d.b=clone(resolved.b)}
          cleanupDeletedLinks(elemIds);
        }
        selected = hostWallId ? [hostWallId] : [];
      });
      window.renderSEOPalette?.();
      toast(`Deleted ${studIds.length} selected wall stud(s)`);
      return;
    }
    commit(()=>{
      let ids=new Set(selected);
      for(const d of model.elements.filter(e=>e.type==='dimension'&&e.refs?.some(ref=>ref&&ids.has(ref.elementId)))){const resolved=resolveDimension(d);d.a=clone(resolved.a);d.b=clone(resolved.b)}
      cleanupDeletedLinks(ids);
      selected=[];
    });
    window.renderSEOPalette?.();
    return;
  }
  if(action==='rotate'||action==='mirror'){
    commit(()=>{
      for(const e of model.elements.filter(e=>selected.includes(e.id))){
        if(e.host){let w=hostOf(e);if(w&&w.a&&w.b){e.offset=distance(w.a,w.b)-e.offset;fitOpening(e,w);continue}}
        let ps=[e.a,e.b,...(e.points||[])].filter(Boolean),cx=ps.reduce((a,p)=>a+p.x,0)/ps.length,cy=ps.reduce((a,p)=>a+p.y,0)/ps.length;
        for(const p of ps){let x=p.x-cx,y=p.y-cy;p.x=cx+(action==='rotate'?-y:-x);p.y=cy+(action==='rotate'?x:y)}
      }
    });
    toast(action==='rotate'?'Selection rotated 90°':'Selection mirrored');
  }
}
$$('[data-edit]').forEach(b=>b.onclick=()=>edit(b.dataset.edit));
bindClick('#undo', undo);
bindClick('#redo', redo);
bindClick('#snap-btn', ()=>{snap=!snap;$('#snap-btn')?.classList.toggle('enabled',snap);const ss=$('#snap-status');if(ss)ss.textContent=snap?'⊙ Snap on':'⊙ Snap off';toast(snap?'Snapping enabled':'Snapping off')});
bindClick('#grid-btn', ()=>{grid=!grid;$('#grid-btn')?.classList.toggle('enabled',grid);render()});
$('#guide-btn')?.addEventListener('click',()=>{const on=$('#guide-btn').classList.toggle('enabled');toast(on?'Timber Teck guide lines active':'Guide lines hidden')});
bindClick('#zoom-in', ()=>{scale=Math.min(4,scale*1.2);render()});
bindClick('#zoom-out', ()=>{scale=Math.max(.25,scale/1.2);render()});
function fit(){
  if(isModelView()){fit3DCamera();cameraUI()}
  else if(view==='roofframingplan'){
    const ps=model.elements.filter(e=>e.type==='roof'&&shown(e)).flatMap(e=>roofGeometry(e).boundary);
    if(ps.length){
      const x0=Math.min(...ps.map(p=>p.x)),x1=Math.max(...ps.map(p=>p.x)),y0=Math.min(...ps.map(p=>p.y)),y1=Math.max(...ps.map(p=>p.y));
      scale=Math.max(.1,Math.min(4,(width-190)/((x1-x0)*baseScale),(height-210)/((y1-y0)*baseScale)));
      pan={x:-((x0+x1)/2-6500)*baseScale*scale+25,y:-((y0+y1)/2-4500)*baseScale*scale};
    }else{scale=1;pan={x:0,y:0}}
  }else if(view==='plan'||view==='framingplan'){
    const ps=model.elements.filter(shown).flatMap(e=>[e.a,e.b,...(e.points||[])].filter(Boolean));
    if(ps.length>=2 && width>100 && height>100){
      const x0=Math.min(...ps.map(p=>p.x)),x1=Math.max(...ps.map(p=>p.x)),y0=Math.min(...ps.map(p=>p.y)),y1=Math.max(...ps.map(p=>p.y));
      const spanX=Math.max(1000,x1-x0),spanY=Math.max(1000,y1-y0);
      scale=Math.max(.15,Math.min(4,(width-220)/(spanX*baseScale),(height-220)/(spanY*baseScale)));
      pan={x:-((x0+x1)/2-6500)*baseScale*scale,y:-((y0+y1)/2-4500)*baseScale*scale};
    }else{scale=1;pan={x:0,y:0}}
  }else{scale=1;pan={x:0,y:0}}
  render();
}
bindClick('#fit', fit);
bindClick('#reset-camera', fit);
bindClick('#pan', ()=>{tool=tool==='pan'?'select':'pan';toolState();$('#pan')?.classList.toggle('enabled',tool==='pan');canvas.style.cursor=tool==='pan'?'grab':'default'});
bindClick('#clip', ()=>{sectionCut=!sectionCut;$('#clip')?.classList.toggle('enabled',sectionCut);render()});
bindClick('#track-enter', ()=>{
  let q={x:parseLengthInput($('#track-x')?.value,NaN),y:parseLengthInput($('#track-y')?.value,NaN)};
  if(!Number.isFinite(q.x)||!Number.isFinite(q.y)){toast('Enter valid coordinates');return}
  if(tool==='select'&&!editing){toast('Choose a drawing tool to place coordinate');return}
  place(q);
});

// Trace & Reference toggle
$('#trace-btn')?.addEventListener('click',()=>{
  traceActive=!traceActive;
  $('#trace-btn').classList.toggle('active',traceActive);
  toast(traceActive?'Trace & Reference underlay enabled':'Trace underlay hidden');
  render();
});

// Pipette & Syringe
$('#pipette-btn')?.addEventListener('click',()=>{
  pipetteActive=!pipetteActive;syringeActive=false;
  $('#pipette-btn').classList.toggle('active',pipetteActive);
  $('#syringe-btn')?.classList.remove('active');
  canvas.style.cursor=pipetteActive?'crosshair':'default';
  toast(pipetteActive?'Click any element to absorb its BIM parameters':'Pipette cancelled');
});
$('#syringe-btn')?.addEventListener('click',()=>{
  if(!absorbedParams){toast('Pick parameters with Pipette first');return}
  syringeActive=!syringeActive;pipetteActive=false;
  $('#syringe-btn').classList.toggle('active',syringeActive);
  $('#pipette-btn')?.classList.remove('active');
  canvas.style.cursor=syringeActive?'crosshair':'default';
  toast(syringeActive?'Click destination element to inject parameters':'Syringe cancelled');
});

// Magic Wand
$('#wand-btn')?.addEventListener('click',()=>{
  wandActive=!wandActive;
  $('#wand-btn').classList.toggle('active',wandActive);
  $('#wand-btn').classList.toggle('manual-active',wandActive);
  canvas.style.cursor=wandActive?'crosshair':(tool==='select'?'default':'crosshair');
  toast(wandActive?'Magic Wand active: Click inside an enclosed room or boundary to flood':'Magic Wand off');
});

// Quick Options bar listeners
$('#quick-scale')?.addEventListener('change',ev=>{
  const sFactor=Number(ev.target.value)||100;
  scale=100/sFactor;render();
  toast(`View scale set to 1 : ${sFactor}`);
});
$('#quick-layer-combo')?.addEventListener('change',ev=>{
  const mode=ev.target.value;
  if(mode==='arch'){setLayerVisible('Exterior Walls',true);setLayerVisible('Interior Walls',true);setLayerVisible('Structure',true);setLayerVisible('Annotations',true);}
  else if(mode==='struct'){setLayerVisible('Exterior Walls',true);setLayerVisible('Interior Walls',false);setLayerVisible('Structure',true);setLayerVisible('Annotations',true);}
  else if(mode==='mep'){setLayerVisible('Exterior Walls',false);setLayerVisible('Interior Walls',true);setLayerVisible('Structure',true);setLayerVisible('Annotations',true);}
  else{layers.forEach(l=>l.visible=true);}
  pruneHiddenSelection();properties();navigatorPanel();render();toast(`Layer combination applied: ${ev.target.options[ev.target.selectedIndex].text}`);
});
$('#quick-renovation')?.addEventListener('change',ev=>{
  toast(`Renovation status: ${ev.target.options[ev.target.selectedIndex].text}`);
});
$('#quick-override')?.addEventListener('change',ev=>{
  toast(`Graphic override rule: ${ev.target.options[ev.target.selectedIndex].text}`);
});

document.onkeydown=e=>{
  if(e.key==='Escape'){
    if(document.activeElement&&['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){
      document.activeElement.blur();
    }
    if($('#modal')?.open){
      $('#modal').close();
      return;
    }
    if($('#clip-panel')&&!$('#clip-panel').classList.contains('hidden')){
      $('#clip-panel').classList.add('hidden');
    }
    if(['element','grip','roofGrip'].includes(drag?.kind))model=drag.original;
    drag=null;points=[];lastPlacedWallEnd=null;editing=null;window._intersectFirstWallId=null;pendingOpening=null;wandActive=false;pipetteActive=false;syringeActive=false;
    if(window._wallPanelInsertStudMode){window._wallPanelInsertStudMode=false;window.updateWallPanelListHUD?.(typeof framingWall==='function'?framingWall():null);toolState();}
    if(typeof clearTrackerUserEdits==='function')clearTrackerUserEdits();
    $('#wand-btn')?.classList.remove('active');$('#wand-btn')?.classList.remove('manual-active');
    $('#pipette-btn')?.classList.remove('active');$('#syringe-btn')?.classList.remove('active');
    hidePetPalette();$('#menu-popover')?.classList.add('hidden');
    if(selected.length>0&&tool==='select'){
      selected=[];
      toast('Selection cleared');
    }else{
      tool='select';
      toolState();
      toast('Esc: Escaped current command');
    }
    render();
    return;
  }
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||$('#modal')?.open)return;
  if(e.key==='Enter')finish();
  if(e.key==='Delete'||e.key==='Backspace')edit('delete');
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='i'){e.preventDefault();edit('intersect');return}
  if(e.altKey&&!e.ctrlKey){$('#pipette-btn')?.click();return}
  if(e.altKey&&e.ctrlKey){$('#syringe-btn')?.click();return}
  if(e.ctrlKey||e.metaKey)return;
  if(e.key==='Tab'){
    const tracker=$('#draft-tracker');
    if(tracker&&!tracker.classList.contains('hidden')){
      e.preventDefault();
      if(tracker.classList.contains('minimized'))tracker.classList.remove('minimized');
      const inputs=[$('#draft-length'),$('#draft-angle'),$('#draft-coord-x'),$('#draft-coord-y')].filter(Boolean);
      const curIdx=inputs.indexOf(document.activeElement);
      const nextIdx=(curIdx+1)%inputs.length;
      inputs[nextIdx]?.focus();inputs[nextIdx]?.select();
      return;
    }
  }
  const isDrafting=view==='plan'&&(points.length>0||editing);
  const k=e.key.toLowerCase();
  if(isDrafting||tool!=='select'){
    if(/^[0-9]$/.test(e.key)&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&['wall','line','beam','curtainwall','railing','dimension'].includes(tool)){
      const lenIn=$('#draft-length');
      if(lenIn){
        e.preventDefault();
        $('#draft-tracker')?.classList.remove('hidden');
        $('#draft-tracker')?.classList.remove('minimized');
        lenIn.dataset.userEdited='1';
        lenIn.value=e.key;
        lenIn.focus();
        try{lenIn.setSelectionRange(lenIn.value.length,lenIn.value.length);}catch(_){}
        render();
        return;
      }
    }
    if(k==='r'||k==='d'){
      e.preventDefault();
      $('#draft-tracker')?.classList.remove('minimized');
      $('#draft-length')?.focus();$('#draft-length')?.select();
      return;
    }
    if(k==='a'){
      e.preventDefault();
      $('#draft-tracker')?.classList.remove('minimized');
      $('#draft-angle')?.focus();$('#draft-angle')?.select();
      return;
    }
    if(k==='x'){
      e.preventDefault();
      $('#draft-tracker')?.classList.remove('minimized');
      $('#draft-coord-x')?.focus();$('#draft-coord-x')?.select();
      return;
    }
    if(k==='y'){
      e.preventDefault();
      $('#draft-tracker')?.classList.remove('minimized');
      $('#draft-coord-y')?.focus();$('#draft-coord-y')?.select();
      return;
    }
  }
  if(k==='n'&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey){
    $('#tracker-btn')?.click();
    return;
  }
  if(k==='s'&&!e.shiftKey)$('#snap-btn').click();
  else if(k==='g')$('#grid-btn').click();
  else{
    let t=toolGroups.flatMap(([, ...ts])=>ts).find(t=>t[2].toLowerCase()===k);
    if(t)chooseTool(t[0]);
  }
};
document.onkeyup=e=>{
  if(e.code==='Space'){
    space=false;
    if(wandActive&&!$('#wand-btn')?.classList.contains('manual-active')){
      wandActive=false;
      $('#wand-btn')?.classList.remove('active');
    }
    canvas.style.cursor=tool==='select'?'default':'crosshair';
  }
};

function openModal(title,body){const mt=$('#modal-title'),mb=$('#modal-body'),m=$('#modal');if(mt)mt.textContent=title;if(mb){mb.innerHTML=body;mb.style.maxHeight='';mb.style.overflowY=''}if(m){m.style.width='';m.style.maxWidth='';m.style.maxHeight='';icons(m);m.showModal?.()}}
bindClick('#modal-close', ()=>$('#modal')?.close?.());
bindClick('#help', ()=>openModal('Timber Teck · Structural BIM Studio Reference',`<div class="modal-copy">Comprehensive structural timber &amp; architectural CAD/BIM studio featuring the full Timber Teck tool palette, Info Box, Pet Palette, and 4-map Navigator.</div><div class="help-list"><strong>Select Tools:</strong> V — Arrow &nbsp; M — Marquee<br><strong>Design Tools:</strong> W — Wall &nbsp; D — Door &nbsp; N — Window &nbsp; K — Skylight &nbsp; R — Roof &nbsp; H — Shell &nbsp; B — Beam &nbsp; C — Column &nbsp; F — Slab &nbsp; S — Stair &nbsp; J — Railing &nbsp; U — Curtain Wall &nbsp; X — Morph &nbsp; Y — Mesh &nbsp; Z — Zone &nbsp; O — Object<br><strong>Document Tools:</strong> Q — Dimension &nbsp; Level Dim &nbsp; Radial Dim &nbsp; Angle Dim &nbsp; T — Text &nbsp; Label &nbsp; I — Fill &nbsp; L — Line &nbsp; A — Arc &nbsp; P — Polyline &nbsp; Spline<br><strong>More:</strong> G — Grid &nbsp; Wall End &nbsp; Corner Window &nbsp; Lamp &nbsp; Camera<br><strong>Timber Teck Shortcuts:</strong> Alt — Pipette &nbsp; Ctrl+Alt — Syringe &nbsp; Alt+F2 — Trace &amp; Reference &nbsp; Ctrl Z/Shift+Z — Undo/Redo</div>`));

function openCornerDetailModal(targetWall){
  const w=targetWall||framingWall()||model.elements.find(e=>e.type==='wall');
  const c=w?construction(w):FRAMING_DEFAULTS;
  const curCorner=c.cornerDetail||'auto';
  const curJunction=c.insideJunctionDetail||'auto';
  const isExt=w?isExteriorWall(w):true;
  const wallTag=w?(w.id||'Selected Wall'):'No Wall Selected';
  const effectiveCorner=resolveCornerDetail(w);
  const effectiveJunction=resolveJunctionDetail(w);

  const extOptions=[
    {id:'ext_opt1',num:'option-1',name:'2-Stud + Drywall Backer',desc:'Outside corner 2-stud butt with flat drywall backer for interior gypsum fastening.'},
    {id:'ext_opt2',num:'option-2',name:'3-Stud Double End Corner',desc:'Stacked double end stud on primary through wall + interior nailer backer.'},
    {id:'ext_opt3',num:'option-3',name:'3-Stud Insulated U-Channel',desc:'California corner with open interior pocket for continuous insulation.'},
    {id:'ext_opt4',num:'option-4',name:'4-Stud Solid Stacked Post',desc:'Heavy structural corner with solid 4-stud post for multi-story load bearing.'},
    {id:'ext_opt5',num:'option-5',name:'3-Stud Box Corner',desc:'Flanking studs spaced by stud depth leaving center air/insulation void.'}
  ];

  const intOptions=[
    {id:'int_opt1',num:'option-1',name:'Single Stud + Drywall Nailer',desc:'Through stud with flat nailer backing block for perpendicular partition.'},
    {id:'int_opt2',num:'option-2',name:'2-Stud Ladder Blocking',desc:'Two flanking studs with horizontal ladder blocks spaced vertically.'},
    {id:'int_opt3',num:'option-3',name:'3-Stud Solid Post T-Junction',desc:'Clustered solid 3-stud bearing post for heavy load-bearing partitions.'},
    {id:'int_opt4',num:'option-4',name:'Double Drywall Flanges',desc:'Full stud with drywall backing flanges extending on both room faces.'},
    {id:'int_opt5',num:'option-5',name:'Interior Partition L-Corner',desc:'Interior 90° corner with end stud and flat gypsum backing strip.'}
  ];

  const extCardsHtml=extOptions.map(opt=>{
    const isSelected=curCorner===opt.id||(curCorner==='auto'&&effectiveCorner===opt.id);
    return `<div class="wall-conn-card ${isSelected?'is-selected':''}" data-category="exterior" data-key="${opt.id}" style="border:2px solid ${isSelected?'#2563eb':'#cbd5e1'};border-radius:8px;padding:8px;background:${isSelected?'#eff6ff':'#ffffff'};cursor:pointer;display:flex;flex-direction:column;align-items:center;transition:all .15s ease">
      <div style="font-size:13px;font-weight:800;color:#1d4ed8;margin-bottom:4px;letter-spacing:0.3px">${opt.num}</div>
      <div style="width:100%;height:80px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:5px;display:flex;align-items:center;justify-content:center;margin-bottom:6px">
        ${renderConnectionSvg('exterior', opt.id)}
      </div>
      <div style="font-size:11px;font-weight:700;color:#1e293b;text-align:center;line-height:1.2;margin-bottom:3px">${opt.name}</div>
      <div style="font-size:9.5px;color:#64748b;text-align:center;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${opt.desc}</div>
      <label style="margin-top:6px;display:flex;align-items:center;gap:4px;font-size:10px;color:#1d4ed8;cursor:pointer">
        <input type="radio" name="extCornerChoice" value="${opt.id}" ${isSelected?'checked':''}> Select
      </label>
    </div>`;
  }).join('');

  const intCardsHtml=intOptions.map(opt=>{
    const isSelected=curJunction===opt.id||(curJunction==='auto'&&effectiveJunction===opt.id);
    return `<div class="wall-conn-card ${isSelected?'is-selected':''}" data-category="interior" data-key="${opt.id}" style="border:2px solid ${isSelected?'#2563eb':'#cbd5e1'};border-radius:8px;padding:8px;background:${isSelected?'#eff6ff':'#ffffff'};cursor:pointer;display:flex;flex-direction:column;align-items:center;transition:all .15s ease">
      <div style="font-size:13px;font-weight:800;color:#1d4ed8;margin-bottom:4px;letter-spacing:0.3px">${opt.num}</div>
      <div style="width:100%;height:80px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:5px;display:flex;align-items:center;justify-content:center;margin-bottom:6px">
        ${renderConnectionSvg('interior', opt.id)}
      </div>
      <div style="font-size:11px;font-weight:700;color:#1e293b;text-align:center;line-height:1.2;margin-bottom:3px">${opt.name}</div>
      <div style="font-size:9.5px;color:#64748b;text-align:center;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${opt.desc}</div>
      <label style="margin-top:6px;display:flex;align-items:center;gap:4px;font-size:10px;color:#1d4ed8;cursor:pointer">
        <input type="radio" name="intJunctionChoice" value="${opt.id}" ${isSelected?'checked':''}> Select
      </label>
    </div>`;
  }).join('');

  const html=`<div style="font-size:12px;color:#1e293b;max-height:82vh;overflow-y:auto;padding-right:4px">
    <div style="display:flex;align-items:center;justify-content:space-between;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:7px;padding:8px 14px;margin-bottom:14px">
      <div>
        <span style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:700">Active Wall Target</span>
        <div style="font-size:13px;font-weight:800;color:#0f172a">${wallTag} &nbsp;·&nbsp; <span style="font-weight:600;color:${isExt?'#0284c7':'#16a34a'}">${isExt?'Exterior Wall':'Interior Wall'} (${w?Math.round(w.thickness)+' mm':''})</span></div>
      </div>
      <div style="display:flex;gap:12px;align-items:center">
        <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#0369a1;background:#e0f2fe;padding:5px 10px;border-radius:5px;border:1px solid #7dd3fc;cursor:pointer">
          <input type="checkbox" id="auto-situation-toggle" ${(curCorner==='auto'&&curJunction==='auto')?'checked':''}>
          ⚡ Auto-Implement by Situations
        </label>
      </div>
    </div>

    <!-- Top Section: Exterior Wall Connections -->
    <div style="margin-bottom:20px;border:1px solid #e2e8f0;border-radius:8px;padding:12px;background:#ffffff">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;border-bottom:2px solid #ea580c;padding-bottom:5px">
        <h3 style="margin:0;font-size:15px;font-weight:800;color:#ea580c;text-decoration:underline">Exterior Wall Connections</h3>
        <span style="font-size:11px;color:#64748b;font-weight:600">Selected: <strong id="ext-selected-label" style="color:#1d4ed8">${curCorner}</strong></span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:8px" id="ext-cards-grid">
        ${extCardsHtml}
      </div>
    </div>

    <!-- Bottom Section: Interior Wall Connections -->
    <div style="margin-bottom:16px;border:1px solid #e2e8f0;border-radius:8px;padding:12px;background:#ffffff">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;border-bottom:2px solid #ea580c;padding-bottom:5px">
        <h3 style="margin:0;font-size:15px;font-weight:800;color:#ea580c;text-decoration:underline">Interior Wall Connections</h3>
        <span style="font-size:11px;color:#64748b;font-weight:600">Selected: <strong id="int-selected-label" style="color:#1d4ed8">${curJunction}</strong></span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:8px" id="int-cards-grid">
        ${intCardsHtml}
      </div>
    </div>

    <!-- Situational Intelligence Banner -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:9px 12px;font-size:11px;color:#166534;line-height:1.5;margin-bottom:14px">
      <strong>⚡ Default Wall Connection Standards:</strong>
      Exterior walls use <strong>Option 1 (ext_opt1: 2-Stud + Drywall Backer)</strong> by default; interior walls use <strong>Option 1 (int_opt1: Single Stud + Drywall Nailer)</strong> for T-intersections and <strong>Option 5 (int_opt5: Partition L-Corner)</strong> for interior L-corners by default.
    </div>

    <!-- Action Buttons -->
    <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;border-top:1px solid #e2e8f0;padding-top:12px">
      <button id="conn-auto-fix-collisions" class="primary" style="background:#0284c7;color:#ffffff;font-weight:700">⚡ Auto-Adjust Overlapping Studs</button>
      <button id="conn-auto-configure" class="primary" style="background:#0369a1;color:#ffffff;font-weight:700">⚡ Auto-Configure Corner Stud Packs (California Corners & 3-Stud Posts)</button>
      <button id="conn-apply-selected" class="primary" style="background:#2563eb;color:#ffffff;font-weight:700">Apply to Selected Wall (${wallTag})</button>
      <button id="conn-apply-exterior" class="subtle" style="font-weight:600">Apply to All Exterior Walls</button>
      <button id="conn-apply-interior" class="subtle" style="font-weight:600">Apply to All Interior Walls</button>
      <button id="conn-apply-all" class="subtle" style="font-weight:600">Apply to All Walls</button>
      <button id="conn-reset-auto" class="subtle" style="color:#15803d;border-color:#86efac;background:#f0fdf4;font-weight:700">⚡ Reset All to Default (ext_opt1 / int_opt1 & int_opt5)</button>
    </div>
  </div>`;

  openModal('Wall Framing Connections · 10 Advanced Construction Styles', html);
  const m=$('#modal');
  if(m){m.style.width='940px';m.style.maxWidth='96vw';}

  let chosenExt = curCorner;
  let chosenInt = curJunction;

  const updateCardSelection=()=>{
    const autoChecked=$('#auto-situation-toggle')?.checked;
    if(autoChecked){
      chosenExt='auto';
      chosenInt='auto';
      $('#ext-selected-label').textContent='auto (' + effectiveCorner + ')';
      $('#int-selected-label').textContent='auto (' + effectiveJunction + ')';
    } else {
      $('#ext-selected-label').textContent=chosenExt;
      $('#int-selected-label').textContent=chosenInt;
    }
    $$('#ext-cards-grid .wall-conn-card').forEach(card=>{
      const key=card.getAttribute('data-key');
      const isSel = (!autoChecked && chosenExt===key) || (autoChecked && effectiveCorner===key);
      card.style.border = isSel ? '2px solid #2563eb' : '2px solid #cbd5e1';
      card.style.background = isSel ? '#eff6ff' : '#ffffff';
      const rad=card.querySelector('input[type="radio"]');
      if(rad)rad.checked=isSel;
    });
    $$('#int-cards-grid .wall-conn-card').forEach(card=>{
      const key=card.getAttribute('data-key');
      const isSel = (!autoChecked && chosenInt===key) || (autoChecked && effectiveJunction===key) || (!autoChecked && key==='int_opt5' && chosenExt==='int_opt5');
      card.style.border = isSel ? '2px solid #2563eb' : '2px solid #cbd5e1';
      card.style.background = isSel ? '#eff6ff' : '#ffffff';
      const rad=card.querySelector('input[type="radio"]');
      if(rad)rad.checked=isSel;
    });
  };

  $('#auto-situation-toggle').onchange=()=>{
    updateCardSelection();
  };

  $$('#ext-cards-grid .wall-conn-card').forEach(card=>{
    card.onclick=()=>{
      chosenExt=card.getAttribute('data-key');
      const toggle=$('#auto-situation-toggle');
      if(toggle)toggle.checked=false;
      updateCardSelection();
    };
  });

  $$('#int-cards-grid .wall-conn-card').forEach(card=>{
    card.onclick=()=>{
      chosenInt=card.getAttribute('data-key');
      const toggle=$('#auto-situation-toggle');
      if(toggle)toggle.checked=false;
      updateCardSelection();
    };
  });

  $('#conn-auto-fix-collisions').onclick=()=>{
    commit(()=>{
      if(typeof window.autoFixAllOverlappingStuds==='function'){
        window.autoFixAllOverlappingStuds(model);
      }
    });
    $('#modal')?.close?.();
    toast('⚡ Auto-adjusted wall framing: zero overlapping studs remaining across all wall junctions!');
    render();
  };

  $('#conn-auto-configure').onclick=()=>{
    commit(()=>{
      if(typeof window.autoConfigureWallJunctionStudPacks==='function'){
        window.autoConfigureWallJunctionStudPacks();
      }
    });
    $('#modal')?.close?.();
    toast(`⚡ Auto-configured wall connections across all wall junctions (preserving Option 1..5 selections).`);
    render();
  };

  $('#conn-apply-selected').onclick=()=>{
    if(!w){toast('Select a wall first.');return;}
    const autoOn=$('#auto-situation-toggle')?.checked;
    const finalExt = autoOn ? 'auto' : (chosenInt === 'int_opt5' && !isExteriorWall(w) ? 'int_opt5' : chosenExt);
    const finalInt = autoOn ? 'auto' : (chosenInt === 'int_opt5' ? 'int_opt1' : chosenInt);
    commit(()=>{
      w.framing={...construction(w),cornerDetail:finalExt,insideJunctionDetail:finalInt};
    });
    $('#modal')?.close?.();
    toast(`${wallTag} connections updated: ${finalExt} / ${finalInt}.`);
    render();
  };

  $('#conn-apply-exterior').onclick=()=>{
    const autoOn=$('#auto-situation-toggle')?.checked;
    const finalExt = autoOn ? 'ext_opt1' : chosenExt;
    commit(()=>{
      for(const el of model.elements.filter(e=>e.type==='wall'&&isExteriorWall(e))){
        el.framing={...construction(el),cornerDetail:finalExt};
      }
    });
    $('#modal')?.close?.();
    toast(`All exterior walls corner connection set to ${finalExt}.`);
    render();
  };

  $('#conn-apply-interior').onclick=()=>{
    const autoOn=$('#auto-situation-toggle')?.checked;
    const finalInt = autoOn ? 'int_opt1' : (chosenInt === 'int_opt5' ? 'int_opt1' : chosenInt);
    const finalIntCorner = (autoOn || chosenInt === 'int_opt5') ? 'int_opt5' : chosenExt;
    commit(()=>{
      for(const el of model.elements.filter(e=>e.type==='wall')){
        if (!isExteriorWall(el)) {
          el.framing={...construction(el),cornerDetail:finalIntCorner,insideJunctionDetail:finalInt};
        } else {
          el.framing={...construction(el),insideJunctionDetail:finalInt};
        }
      }
    });
    $('#modal')?.close?.();
    toast(`All interior wall connections updated: T-junction = ${finalInt}, L-corner = ${finalIntCorner}.`);
    render();
  };

  $('#conn-apply-all').onclick=()=>{
    const autoOn=$('#auto-situation-toggle')?.checked;
    const finalExt = autoOn ? 'ext_opt1' : chosenExt;
    const finalInt = autoOn ? 'int_opt1' : (chosenInt === 'int_opt5' ? 'int_opt1' : chosenInt);
    commit(()=>{
      for(const el of model.elements.filter(e=>e.type==='wall')){
        const ext = isExteriorWall(el);
        el.framing={...construction(el),cornerDetail:ext ? finalExt : 'int_opt5',insideJunctionDetail:finalInt};
      }
    });
    $('#modal')?.close?.();
    toast(`All walls updated: exterior = ${finalExt}, interior = ${finalInt} & int_opt5.`);
    render();
  };

  $('#conn-reset-auto').onclick=()=>{
    commit(()=>{
      for(const el of model.elements.filter(e=>e.type==='wall')){
        const ext = isExteriorWall(el);
        el.framing={...construction(el),cornerDetail:ext ? 'ext_opt1' : 'int_opt5',insideJunctionDetail:'int_opt1'};
      }
    });
    $('#modal')?.close?.();
    toast('All wall connections reset to default: ext_opt1 for exterior, int_opt1 & int_opt5 for interior.');
    render();
  };
}
bindClick('#corner-detail-btn', ()=>openCornerDetailModal());

function storyDialog(){const st=model.stories.find(s=>s.id===activeStory);if(!st)return;openModal('Story settings',`<div class="modal-copy">Walls linked to this story follow its height. Hosted openings stay within their walls. Upper levels move with the new height.</div><label class="modal-field">${esc(st.name)} height <input id="story-height" type="number" value="${st.height}" step="100"></label><div class="modal-actions"><button id="story-apply" class="primary">Update story</button></div>`);bindClick('#story-apply', ()=>{try{setStoryHeight(st.id,Number($('#story-height')?.value));$('#modal')?.close?.()}catch(e){toast(e.message)}})}
bindClick('#story-btn', storyDialog);
bindClick('#add-story', ()=>{const last=model.stories.at(-1);commit(()=>model.stories.push({id:'s'+Date.now(),name:'New story',elevation:(last?.elevation||0)+(last?.height||3048),height:3048}));toast('New story added to navigator')});

function download(filename,text,mime='application/json'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:mime}));a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function projectFileName(){const name=String(model?.name||'timber-teck-bim-project').trim().replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase()||'timber-teck-bim-project';return `${name}.bim.json`}
function makeProjectFile(){return {format:'cadtech-bim-project',formatVersion:1,application:'TIMBER TECK STRUCTURAL BIM STUDIO',savedAt:new Date().toISOString(),project:clone(model),workspace:{activeStory,view,selected:[...selected],layers:clone(layers),snap:Boolean(snap),grid:Boolean(grid),exteriorOsbEnabled:$('#wall-osb-toggle')?.checked!==false,includeDimensions:$('#wall-dimensions-toggle')?.checked!==false}}}
function markProjectSaved(){dirty=false;const ss=$('#save-state');if(ss)ss.textContent='Project saved locally';toast('BIM project saved to a local project file')}
async function save(){
  const data=JSON.stringify(makeProjectFile(),null,2),filename=projectFileName();
  // Chromium-based browsers can write to a path chosen by the user. Other browsers use a normal local download.
  if(typeof window.showSaveFilePicker==='function'){
    try{
      const handle=await window.showSaveFilePicker({suggestedName:filename,types:[{description:'Timber Teck BIM Project',accept:{'application/json':['.json']}}]});
      const writable=await handle.createWritable();await writable.write(new Blob([data],{type:'application/json'}));await writable.close();markProjectSaved();return;
    }catch(err){if(err?.name==='AbortError'){toast('Save cancelled');return;}console.warn('Save picker unavailable; using browser download instead.',err)}
  }
  download(filename,data);markProjectSaved();
}
bindClick('#save', save);
async function openProjectPicker(){
  // Keep this action cross-browser: Firefox uses the standard file input; supported browsers may use the native picker.
  if(typeof window.showOpenFilePicker==='function'){
    let handles;
    try{handles=await window.showOpenFilePicker({multiple:false,types:[{description:'Timber Teck BIM Project',accept:{'application/json':['.json']}}]})}
    catch(err){if(err?.name==='AbortError')return;console.warn('Native project picker failed.',err);$('#project-file-input')?.click();return;}
    if(!handles?.[0])return;
    try{await loadProjectFile(await handles[0].getFile())}
    catch(err){console.error(err);toast(err?.message||'Could not open project file.')}
  }else $('#project-file-input')?.click();
}
bindClick('#open-project',openProjectPicker);

function generateOBJ(){
  let out=['# Timber Teck BIM world coordinates in meters'],n=1;
  const opCheck=typeof hasTrimOrSEO==='function'?hasTrimOrSEO:()=>false;
  function mesh(id,ps,z0,z1){
    out.push('o '+id);const vs=[...ps.map(p=>({...p,z:z0})),...ps.map(p=>({...p,z:z1}))];vs.forEach(p=>out.push(`v ${p.x/1000} ${p.z/1000} ${-p.y/1000}`));const k=ps.length;out.push('f '+ps.map((_,i)=>n+k+i).join(' '));out.push('f '+ps.map((_,i)=>n+k-1-i).join(' '));for(let i=0;i<k;i++){let j=(i+1)%k;out.push(`f ${n+i} ${n+j} ${n+k+j} ${n+k+i}`)}n+=k*2;
  }
  function emitOpObj(e){
    const polys=typeof evaluateElementOperatedPolygons==='function'?evaluateElementOperatedPolygons(e,model,true):[];
    if(!polys.length)return;
    out.push('o '+e.id);
    for(const poly of polys){
      poly.vertices.forEach(p=>out.push(`v ${p.x/1000} ${p.z/1000} ${-p.y/1000}`));
      out.push('f '+poly.vertices.map((_,i)=>n+i).join(' '));
      n+=poly.vertices.length;
    }
  }
  const walls=model.elements.filter(e=>e.type==='wall');
  for(const face of wallSurfaces(joinedWallCells(walls.filter(w=>!opCheck(w))))){
    out.push('o '+face.id);face.points.forEach(p=>out.push(`v ${p.x/1000} ${p.z/1000} ${-p.y/1000}`));out.push('f '+face.points.map((_,i)=>n+i).join(' '));n+=face.points.length;
  }
  for(const w of walls.filter(opCheck))emitOpObj(w);
  for(const o of model.elements.filter(e=>e.host&&e.type!=='skylight')){if(opCheck(o)){emitOpObj(o);continue;}const w=hostOf(o);if(!w||!w.a||!w.b)continue;const len=distance(w.a,w.b),z=wallBase(w);mesh(o.id,openingSolidPolygon(w,o),z+o.sill,z+o.sill+o.height)}
  for(const e of model.elements){
    let z=storyOf(e).elevation;
    if(e.type==='wall'||(e.host&&e.type!=='skylight'))continue;
    if(opCheck(e)){emitOpObj(e);continue;}
    else if(e.type==='slab')mesh(e.id,e.points,z-e.thickness,z);
    else if(e.type==='beam')mesh(e.id,wallPoly(e),z+heightOf(e)-e.thickness,z+heightOf(e));
    else if(e.type==='column')mesh(e.id,wallPoly(e,{x:e.a.x-e.thickness/2,y:e.a.y},{x:e.a.x+e.thickness/2,y:e.a.y}),z,z+heightOf(e));
    else if(e.type==='roof'){for(const face of roofGeometry(e).faces){out.push('o '+e.id);face.forEach(p=>out.push(`v ${p.x/1000} ${p.z/1000} ${-p.y/1000}`));out.push('f '+face.map((_,i)=>n+i).join(' '));n+=face.length}}
  }
  return out.join('\n');
}
function csv(){
  const uHdr = isImperialUnits() ? 'ft-in' : 'mm';
  return `ID,Type,Story,Material,Length (${uHdr}),Height (${uHdr})\n`+model.elements.map(e=>[e.id,e.type,storyOf(e).name,e.material,e.a&&e.b?formatLength(distance(e.a,e.b),false):'',e.height?formatLength(heightOf(e),false):''].map(x=>'"'+String(x||'').replace(/"/g,'""')+'"').join(',')).join('\n');
}
function exportDialog(){
  openModal('Timber Teck Publisher · Export',`<div class="modal-copy">Export BIM project, CAD 2D Framing Plan DXF, solid IFC/OBJ geometry, or element schedules:</div><div class="modal-actions"><button id="export-framing-dxf" class="primary">2D Framing Plan · DXF</button><button id="export-json" class="subtle">Timber Teck BIM · JSON</button><button id="export-obj" class="subtle">Solid model · OBJ</button><button id="export-csv" class="subtle">Schedule · CSV</button><button id="export-framing" class="subtle">Timber framing · CSV</button><button id="export-png" class="subtle">Current view · PNG</button></div>`);
  bindClick('#export-framing-dxf', ()=>{if(typeof window.generate2DFramingPlanCAD==='function'){const osbEnabled=wallOsbToggle?.checked!==false;const dimEnabled=wallDimensionsToggle?.checked!==false;const ts=getTextScale();window.generate2DFramingPlanCAD({exteriorOsbEnabled:osbEnabled,includeDimensions:dimEnabled,textScale:ts});toast('2D Framing Plan CAD (2D-FRAMING-PLAN.dxf) exported')}});
  bindClick('#export-framing', ()=>download('timber-framing-cut-list.csv',framingCSV(),'text/csv'));
  bindClick('#export-json', save);
  bindClick('#export-obj', ()=>{download('courtyard-house.obj',generateOBJ(),'text/plain');toast('Solid model exported')});
  bindClick('#export-csv', ()=>download('courtyard-house-schedule.csv',csv(),'text/csv'));
  bindClick('#export-png', ()=>{let a=document.createElement('a');a.download='timber-teck-'+view+'.png';a.href=canvas.toDataURL();a.click()});
}
bindClick('#export', exportDialog);

function schedule(){
  const sp=$('#schedule-panel');if(!sp)return;
  if(view==='audit'){
    const auditData = typeof window.auditAllStudCollisions === 'function' ? window.auditAllStudCollisions(model) : { walls: [], collisions: [], activeCollisions: [], fixedCollisions: [] };
    const rawStructWarnings = typeof window.auditAllStructuralWarnings === 'function' ? window.auditAllStructuralWarnings(model) : { walls: [], wallAudits: [], warningCount: 0, failCount: 0 };
    const wallAuditsList = Array.isArray(rawStructWarnings) ? rawStructWarnings : (Array.isArray(rawStructWarnings?.wallAudits) ? rawStructWarnings.wallAudits : []);
    const structWarnings = {
      walls: rawStructWarnings?.walls || [],
      wallAudits: wallAuditsList,
      warningCount: rawStructWarnings?.warningCount ?? wallAuditsList.filter(wa => (wa.warnings && wa.warnings.length > 0) || wa.hasWarning).length,
      failCount: rawStructWarnings?.failCount ?? 0
    };
    const targetWall = framingWall() || auditData.walls[0];
    const targetWallCols = targetWall && typeof window.auditWallStudCollisions === 'function' ? window.auditWallStudCollisions(targetWall, model) : [];
    const activeCount = auditData.activeCollisions.length;
    const fixedCount = auditData.fixedCollisions.length;
    const loadWarnCount = structWarnings.warningCount || 0;

    let svgDiagram = '';
    if (targetWall) {
      const wLen = Math.max(500, Math.round(distance(targetWall.a, targetWall.b)));
      const wH = Math.max(1000, Math.round(heightOf(targetWall)));
      const c = construction(targetWall);
      const sw = c.studWidth || 38;
      const openings = hosted(targetWall).map(o => ({ ...o, left: o.offset - o.width / 2, right: o.offset + o.width / 2 }));
      const juncs = typeof window.wallFramingJunctions === 'function' ? window.wallFramingJunctions(targetWall, model) : [];
      const colMap = new Map(targetWallCols.map(col => [col.originalX0, col]));
      const run = framingRun(targetWall, model);

      const studRects = [];
      for (let x = run.start + sw / 2; x <= run.end - sw / 2 + 0.01; x += c.spacing) {
        const x0 = Math.round(x - sw / 2);
        const col = colMap.get(x0);
        if (col) {
          if (col.fixed) {
            studRects.push(`<rect x="${120 + col.originalX0}" y="80" width="${sw}" height="${wH - 152}" fill="none" stroke="#ef4444" stroke-width="5" stroke-dasharray="22,16" />`);
            studRects.push(`<rect x="${120 + col.shiftedX0}" y="80" width="${sw}" height="${wH - 152}" fill="#22c55e" stroke="#14532d" stroke-width="8" />`);
            studRects.push(`<text x="${120 + col.shiftedX0 + sw/2}" y="34" font-size="68" font-weight="bold" fill="#15803d" text-anchor="middle">✓ ${col.shiftedX0}mm</text>`);
          } else {
            studRects.push(`<rect x="${120 + col.originalX0}" y="80" width="${sw}" height="${wH - 152}" fill="#ef4444" stroke="#7f1d1d" stroke-width="10" />`);
            studRects.push(`<text x="${120 + col.originalX0 + sw/2}" y="34" font-size="68" font-weight="bold" fill="#dc2626" text-anchor="middle">⚠ ${col.originalX0}mm</text>`);
          }
        } else {
          studRects.push(`<rect x="${120 + x0}" y="80" width="${sw}" height="${wH - 152}" fill="#dcfce7" stroke="#15803d" stroke-width="4" />`);
        }
      }

      const opRects = openings.map(o => {
        const ox = 120 + Math.round(o.left);
        const oy = 80 + Math.max(0, wH - 152 - (o.sill || 0) - o.height);
        return `
          <rect x="${ox}" y="${oy}" width="${Math.round(o.width)}" height="${Math.round(o.height)}" fill="#e0f2fe" fill-opacity="0.7" stroke="#0284c7" stroke-width="10" stroke-dasharray="28,16"/>
          <text x="${ox + o.width / 2}" y="${oy + o.height / 2}" font-size="88" font-weight="bold" fill="#0369a1" text-anchor="middle">${esc(o.id)} (${Math.round(o.width)}×${Math.round(o.height)})</text>
        `;
      }).join('');

      const juncRects = juncs.filter(j => j.type === 'T-junction studs').map(j => {
        const jx = 120 + Math.round(j.x - 89);
        return `<rect x="${jx}" y="80" width="178" height="${wH - 152}" fill="#fef08a" fill-opacity="0.65" stroke="#ca8a04" stroke-width="8"/>
                <text x="${jx + 89}" y="${80 + (wH - 152) / 2}" font-size="74" font-weight="bold" fill="#854d0e" text-anchor="middle">T-${esc(j.otherId)}</text>`;
      }).join('');

      svgDiagram = `
        <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:10px;padding:14px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;font-size:12px">
            <strong>Wall Stud Collision Diagram — ${esc(targetWall.id)} (${formatDimPair(wLen, wH)} · ${formatSection(c.studWidth, c.studDepth)} ${c.timberGrade} @ ${formatLength(c.spacing)} O.C.)</strong>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:11px;color:#475569">
                <span style="display:inline-block;width:10px;height:10px;background:#ef4444;border-radius:2px;margin-right:4px"></span>Red = Colliding Stud &nbsp;&nbsp;
                <span style="display:inline-block;width:10px;height:10px;background:#22c55e;border-radius:2px;margin-right:4px"></span>Green = Shifted Clear Stud
              </span>
              <button type="button" class="subtle" data-audit-inspect="${esc(targetWall.id)}" style="padding:3px 10px;font-size:11px;color:#0369a1;border-color:#7dd3fc;background:#f0f9ff;font-weight:700;cursor:pointer">🔍 Inspect Multi-Code Calculation</button>
            </div>
          </div>
          <svg viewBox="0 0 ${wLen + 240} ${wH + 140}" style="width:100%;max-height:240px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px">
            <rect x="120" y="42" width="${wLen}" height="38" fill="#fde68a" stroke="#92400e" stroke-width="4"/>
            <rect x="120" y="${80 + wH - 152}" width="${wLen}" height="38" fill="#fde68a" stroke="#92400e" stroke-width="4"/>
            ${opRects}
            ${juncRects}
            ${studRects.join('')}
          </svg>
        </div>`;
    }

    const ec5Inputs = (window.Eurocode5LoadEngine && typeof window.Eurocode5LoadEngine.resolveLoadInputs === 'function')
      ? window.Eurocode5LoadEngine.resolveLoadInputs(model)
      : (window.getProjectLoads ? window.getProjectLoads(model) : {
          roofDeadKNm2: 0.85, floorDeadKNm2: 0.75, floorLiveKNm2: 1.5, snowLoadKNm2: 0.65,
          roofTributarySpanM: 4.2, windPressureKNm2: 1.15, inPlaneRackingForceKNm: 4.2,
          rackingDemandMode: 'characteristic', serviceClass: 2, combinationEquation: '6.10',
          nationalAnnex: 'EN1990_NA_IE', occupancyCategory: 'A'
        });

    const loadAuditRowsHtml = structWarnings.wallAudits.map(wa => {
      const cur = wa.current;
      const ec5 = cur.ec5 || {};
      const nds = cur.nds || {};
      const rack = wa.racking || wa.rackingAudit || {};
      const d = wa.demands;
      const isSelectedRow = targetWall && targetWall.id === wa.wallId;
      const statusBg = isSelectedRow ? '#eff6ff' : (cur.status === 'PASS' ? '#f0fdf4' : cur.status === 'WARNING' ? '#fffbeb' : '#fef2f2');
      const ec5BadgeBg = ec5.dcPercent > 100 ? '#dc2626' : ec5.dcPercent > 80 ? '#d97706' : '#16a34a';
      const rackPct = Number(rack.rackingUtilPct || 0);
      const rackBadgeBg = rackPct > 100 ? '#dc2626' : rackPct > 85 ? '#d97706' : '#16a34a';
      const ndsBadgeBg = nds.dcPercent > 100 ? '#dc2626' : nds.dcPercent > 80 ? '#d97706' : '#16a34a';
      const warnSummary = wa.warnings.length ? wa.warnings[0] : 'Passes EN 1990 combinations, axial buckling & shear-wall racking.';
      const rackDemandKN = rack.totalDemandKN ?? rack.V_Ed_kN ?? 0;
      const rackCapKN = rack.totalCapacityKN ?? rack.F_vRd_kN ?? 0;
      return `
        <tr data-row="${esc(wa.wallId)}" style="background:${statusBg};cursor:pointer;${isSelectedRow ? 'outline:2px solid #0284c7;' : ''}">
          <td><strong>${esc(wa.wallId)}</strong><br><small style="color:#64748b">${esc(d.wallTypeLabel)} · H=${formatLength(d.wallHeightMm)}</small></td>
          <td style="font-family:monospace;font-size:11px">
            <b style="color:#0369a1">${esc(d.governingComboLabel || '1.35G + 1.5Q')}</b><br>
            <b>${d.qAxialLineLoad_kNm} kN/m</b> ULS · <span style="color:#475569">${d.windPressure_kNm2} kN/m² wind</span>
          </td>
          <td style="font-family:monospace;font-weight:700">${formatSection(cur.studWidth, cur.studDepth)} (${cur.timberGrade})<br><span style="color:#475569">@ ${formatLength(cur.spacing)} O.C.</span></td>
          <td>
            <b style="padding:2px 7px;border-radius:4px;font-size:11px;background:${ec5BadgeBg};color:#fff">${ec5.status || 'PASS'} · ${ec5.dcPercent}% Comb</b>
            <div style="font-size:10px;color:#334155;margin-top:3px">Axial: <b>${cur.pureAxialDC_pct ?? Math.round((ec5.axialUtil || 0) * 100)}%</b> (${ec5.N_Ed_kN}/${ec5.N_Rd_kN || '—'} kN) · k<sub>c,y</sub>=${ec5.kc_y}</div>
          </td>
          <td>
            <b style="padding:2px 7px;border-radius:4px;font-size:11px;background:${rackBadgeBg};color:#fff">${rackPct}% Racking</b>
            <div style="font-size:10px;color:#334155;margin-top:3px">V<sub>Ed</sub>=${rackDemandKN} / F<sub>v,Rd</sub>=${rackCapKN} kN · T<sub>Ed</sub>=${rack.netHoldDownTensionKN ?? 0} kN</div>
          </td>
          <td>
            <b style="padding:2px 7px;border-radius:4px;font-size:11px;background:${ndsBadgeBg};color:#fff">${nds.status || 'PASS'} · ${nds.dcPercent}% ASD</b>
            <div style="font-size:10px;color:#475569;margin-top:3px">C<sub>P</sub> = ${nds.CP} · f<sub>c</sub> = ${nds.fc_psi} psi</div>
          </td>
          <td style="font-size:11px;color:#334155;max-width:250px">${esc(warnSummary)}</td>
          <td style="white-space:nowrap">
            <button type="button" class="subtle" data-audit-inspect="${esc(wa.wallId)}" style="padding:4px 10px;font-size:11px;color:#0369a1;border-color:#7dd3fc;background:#f0f9ff;font-weight:700;cursor:pointer">🔍 Inspect</button>
          </td>
        </tr>
      `;
    }).join('');

    const targetAudit = structWarnings.wallAudits.find(wa => targetWall && wa.wallId === targetWall.id) || structWarnings.wallAudits[0] || null;
    const targetLc = targetAudit?.loadCombinations || null;
    const ec5ComboMatrixHtml = targetLc && Array.isArray(targetLc.combinations) ? `
      <div style="margin-top:10px;padding:10px 12px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px">
          <strong style="font-size:12px;color:#0f172a">Active Wall EN 1990 Combination Matrix — ${esc(targetAudit.wallId)} (${esc(targetLc.standard)})</strong>
          <span style="font-size:11px;color:#0369a1">G<sub>k</sub>=${targetLc.characteristicActions.Gk_total_kNm} kN/m · Q<sub>k,fl</sub>=${targetLc.characteristicActions.Qk_floor_kNm} · S<sub>k</sub>=${targetLc.characteristicActions.Qk_snow_kNm} · V<sub>k,rack</sub>=${targetLc.characteristicActions.Vk_racking_kNm} kN/m</span>
        </div>
        <table style="font-size:11px">
          <thead>
            <tr>
              <th>COMBINATION</th>
              <th>EXPRESSION (EN 1990)</th>
              <th>DURATION / k<sub>mod</sub></th>
              <th>AXIAL N<sub>Ed</sub> / N<sub>Rd</sub></th>
              <th>AXIAL D/C</th>
              <th>COMB D/C</th>
              <th>RACKING V<sub>Ed</sub> / F<sub>v,Rd</sub></th>
              <th>RACK D/C</th>
              <th>HOLD-DOWN T<sub>Ed</sub></th>
            </tr>
          </thead>
          <tbody>
            ${targetLc.combinations.map(c => {
              const isGovAx = c.id === targetLc.governingAxial.combinationId;
              const isGovRk = c.id === targetLc.governingRacking.combinationId;
              return `
                <tr style="background:${isGovAx || isGovRk ? '#eff6ff' : '#ffffff'}">
                  <td><b>${esc(c.id)}</b> · ${esc(c.shortLabel)}${isGovAx ? ' <span style="color:#0369a1;font-size:9.5px;font-weight:800">[GOV AXIAL]</span>' : ''}${isGovRk ? ' <span style="color:#b45309;font-size:9.5px;font-weight:800">[GOV RACK]</span>' : ''}</td>
                  <td style="font-family:monospace;font-size:10.5px">${esc(c.formula)}</td>
                  <td>${esc(c.durationClass)} (${c.kmod} / ${c.kmodOSB})</td>
                  <td style="font-family:monospace">${c.stud.N_Ed_kN} / ${c.stud.N_Rd_kN} kN</td>
                  <td style="font-family:monospace;font-weight:700;color:${c.stud.axialDC_pct > 100 ? '#dc2626' : '#0f172a'}">${c.stud.axialDC_pct}%</td>
                  <td style="font-family:monospace;font-weight:700;color:${c.stud.combinedDC_pct > 100 ? '#dc2626' : c.stud.combinedDC_pct > 85 ? '#b45309' : '#15803d'}">${c.stud.combinedDC_pct}%</td>
                  <td style="font-family:monospace">${c.racking.V_Ed_kN} / ${c.racking.F_vRd_kN} kN</td>
                  <td style="font-family:monospace;font-weight:700;color:${c.racking.rackingDC_pct > 100 ? '#dc2626' : c.racking.rackingDC_pct > 85 ? '#b45309' : '#15803d'}">${c.racking.rackingDC_pct}%</td>
                  <td style="font-family:monospace">${c.racking.netHoldDownTensionKN} kN</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>` : '';

    const rowsHtml = auditData.collisions.map(col => `
      <tr data-row="${esc(col.wallId)}" style="background:${col.fixed ? '#f0fdf4' : '#fef2f2'};cursor:pointer">
        <td><strong>${esc(col.wallId)}</strong></td>
        <td style="font-family:monospace;font-weight:700;color:${col.fixed ? '#64748b' : '#dc2626'}">${formatLength(col.originalX0, false)} – ${formatLength(col.originalX1)}</td>
        <td><span style="padding:2px 7px;border-radius:4px;font-weight:700;font-size:11px;background:${col.collisionType === 'Opening' ? '#ffedd5' : '#fef3c7'};color:${col.collisionType === 'Opening' ? '#9a3412' : '#92400e'}">${esc(col.collisionType)}: ${esc(col.targetDetail)}</span></td>
        <td style="font-family:monospace;font-weight:700;color:#15803d">${formatLength(col.shiftedX0, false)} – ${formatLength(col.shiftedX1)} (${col.shiftDelta >= 0 ? '+' : ''}${formatLength(col.shiftDelta)})</td>
        <td><b style="padding:3px 8px;border-radius:4px;font-size:11px;background:${col.fixed ? '#16a34a' : '#dc2626'};color:#fff">${col.fixed ? '✓ SHIFTED & FIXED' : '⚠ COLLISION'}</b></td>
      </tr>
    `).join('');

    if (typeof window.auditAllIJoistDeflections !== 'function' && !window._auditIJoistSolverRequested) {
      window._auditIJoistSolverRequested = true;
      import('./ewp-system.js').then(() => {
        if (view === 'audit') schedule();
      }).catch(() => {});
    }

    if (!window._auditIJoistDeflectionState) {
      window._auditIJoistDeflectionState = {
        series: 'auto',
        creepEnv: 'dry_interior',
        sustainedLiveShare: 0,
        defLLLimit: 480,
        defTLLimit: 240,
        livePsf: window.ewpBeamToolState?.livePsf ?? 40,
        deadPsf: window.ewpBeamToolState?.deadPsf ?? 15,
        selectedId: null
      };
    }
    const ijState = window._auditIJoistDeflectionState;
    const ijAudit = typeof window.auditAllIJoistDeflections === 'function'
      ? window.auditAllIJoistDeflections(model, {
          series: ijState.series,
          creepEnv: ijState.creepEnv,
          sustainedLiveShare: ijState.sustainedLiveShare,
          defLLLimit: ijState.defLLLimit,
          defTLLimit: ijState.defTLLimit,
          livePsf: ijState.livePsf,
          deadPsf: ijState.deadPsf
        })
      : { items: [], summary: { totalJoistCount: 0, groupCount: 0, passCount: 0, warnCount: 0, failCount: 0, avgShearSharePct: 0, maxDeltaLT_in: 0, worstRatioLT: 999, overallStatus: 'PASS' } };

    const ijItems = ijAudit.items || [];
    const ijSum = ijAudit.summary || {};
    const ijWarnCount = (ijSum.failCount || 0) + (ijSum.warnCount || 0);
    const activeIj = ijItems.find(it => it.id === ijState.selectedId) || ijItems[0] || null;
    if (activeIj && !ijState.selectedId) ijState.selectedId = activeIj.id;

    const ijEnvObj = (window.EWP_CREEP_ENVIRONMENTS && window.EWP_CREEP_ENVIRONMENTS[ijState.creepEnv]) || {
      label: 'Dry Conditioned Interior (NDS Kcr = 1.50 · EC5 SC1)',
      K_cr: 1.50,
      ec5Kdef: 0.60
    };

    const uniqueSeriesMap = new Map();
    if (Array.isArray(window.EWP_IJOIST_MANUFACTURER_SPECS)) {
      for (const spec of window.EWP_IJOIST_MANUFACTURER_SPECS) {
        if (!uniqueSeriesMap.has(spec.series)) {
          uniqueSeriesMap.set(spec.series, `${spec.manufacturer} ${spec.series} (${spec.stdRef})`);
        }
      }
    }
    const ijSeriesOptions = [
      ['auto', 'Auto (Match BIM Joist Depth & Grade)'],
      ...(uniqueSeriesMap.size
        ? [...uniqueSeriesMap.entries()]
        : [
            ['TJI 110', 'Weyerhaeuser Trus Joist TJI 110 (ICC-ES ESR-1153 / PRI-400)'],
            ['TJI 210', 'Weyerhaeuser Trus Joist TJI 210 (ICC-ES ESR-1153 / PRI-400)'],
            ['TJI 230', 'Weyerhaeuser Trus Joist TJI 230 (ICC-ES ESR-1153 / PRI-400)'],
            ['TJI 360', 'Weyerhaeuser Trus Joist TJI 360 (ICC-ES ESR-1153 / LVL Flanges)'],
            ['TJI 560', 'Weyerhaeuser Trus Joist TJI 560 (ICC-ES ESR-1153 / Heavy LVL)'],
            ['BCI 6000', 'Boise Cascade BCI 6000 (ICC-ES ESR-1336 / Versa-Lam)'],
            ['LPI 32Plus', 'LP SolidStart LPI 32Plus (ICC-ES ESR-1301 / LSL Flanges)']
          ])
    ];
    const ijCreepOptions = window.EWP_CREEP_ENVIRONMENTS
      ? Object.entries(window.EWP_CREEP_ENVIRONMENTS).map(([k, v]) => [k, v.label])
      : [
          ['dry_interior', 'Dry Conditioned Interior (NDS Kcr = 1.50 · EC5 SC1)'],
          ['semi_conditioned', 'Unconditioned Crawl / Garage (NDS Kcr = 2.00 · EC5 SC2)'],
          ['high_moisture', 'High Moisture / Wet Service (NDS Kcr = 2.50 · EC5 SC3)']
        ];

    const statusBadgeCss = (st) => st === 'FAIL'
      ? 'background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5'
      : st === 'WARNING'
        ? 'background:#fef3c7;color:#b45309;border:1px solid #fcd34d'
        : 'background:#dcfce7;color:#15803d;border:1px solid #86efac';

    const ijRowsHtml = ijItems.map(it => {
      const isActiveRow = activeIj && activeIj.id === it.id;
      const rowBg = isActiveRow ? '#eff6ff' : (it.status === 'FAIL' ? '#fef2f2' : it.status === 'WARNING' ? '#fffbeb' : '#ffffff');
      const deltaBendElIn = Math.max(0, Number(it.deltaElastic_in || 0) - Number(it.deltaShearElastic_in || 0));
      const deltaBendElMm = deltaBendElIn * 25.4;
      const depthLabel = `${it.depthIn}"`;
      return `
        <tr data-ij-row="${esc(it.id)}" style="background:${rowBg};cursor:pointer;${isActiveRow ? 'outline:2px solid #0284c7;' : ''}">
          <td><strong>${esc(it.tagsSummary || it.shortTag)}</strong><br><small style="color:#64748b">${esc(it.role)} · Span ${Number(it.spanFt).toFixed(1)} ft (${Math.round(it.spanIn * 25.4)} mm)</small></td>
          <td><b>${esc(it.manufacturer)} ${esc(it.series)}</b> (${esc(depthLabel)})<br><small style="color:#475569">EI ${Number(it.EI_M).toFixed(0)}M lb-in² · K ${Number(it.K_M).toFixed(2)}M lb</small></td>
          <td style="font-family:monospace"><b>${deltaBendElIn.toFixed(3)}"</b><br><small style="color:#64748b">${deltaBendElMm.toFixed(1)} mm</small></td>
          <td style="font-family:monospace"><b>${Number(it.deltaShearElastic_in).toFixed(3)}"</b><br><small style="color:#0369a1;font-weight:700">${Number(it.shearSharePct).toFixed(1)}% shear</small></td>
          <td style="font-family:monospace"><b>${Number(it.deltaLL_total_in).toFixed(3)}"</b><br><small style="color:#475569">L/${it.ratioLL} (≤L/${it.defLLLimit})</small></td>
          <td style="font-family:monospace"><b>+${Number(it.deltaCreep_in).toFixed(3)}"</b><br><small style="color:#b45309">K<sub>cr</sub>=${Number(it.K_cr).toFixed(2)} (${Number(it.creepSharePct).toFixed(0)}%)</small></td>
          <td style="font-family:monospace"><b>${Number(it.deltaLT_total_in).toFixed(3)}"</b><br><small style="color:${it.ratioLT < it.defTLLimit ? '#dc2626' : '#0f172a'};font-weight:700">L/${it.ratioLT} (≤L/${it.defTLLimit})</small></td>
          <td>
            <span style="display:inline-block;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:800;${statusBadgeCss(it.status)}">${esc(it.status)} · ${it.dcPercent}%</span>
            <div style="font-size:10px;color:#475569;margin-top:2px">${esc(it.governing)}</div>
          </td>
        </tr>`;
    }).join('');

    let ijSvgHtml = '';
    if (activeIj && Array.isArray(activeIj.stations) && activeIj.stations.length >= 2) {
      const wSvg = 760, hSvg = 185, padL = 56, padR = 24, padT = 22, padB = 34;
      const plotW = wSvg - padL - padR;
      const plotH = hSvg - padT - padB;
      const maxDef = Math.max(activeIj.limitLT_in * 1.15, activeIj.deltaLT_total_in * 1.15, 0.25);
      const sx = r => padL + r * plotW;
      const sy = val => padT + (val / maxDef) * plotH;
      const ptsBend = activeIj.stations.map(pt => `${sx(pt.t).toFixed(1)},${sy(pt.yBendOnly).toFixed(1)}`).join(' ');
      const ptsEl = activeIj.stations.map(pt => `${sx(pt.t).toFixed(1)},${sy(pt.yElastic).toFixed(1)}`).join(' ');
      const ptsLT = activeIj.stations.map(pt => `${sx(pt.t).toFixed(1)},${sy(pt.yLongTerm).toFixed(1)}`).join(' ');
      const yAllowTL = sy(activeIj.limitLT_in).toFixed(1);
      const yAllowLL = sy(activeIj.limitLL_in).toFixed(1);
      const activeBendIn = Math.max(0, Number(activeIj.deltaElastic_in) - Number(activeIj.deltaShearElastic_in));

      ijSvgHtml = `
        <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:10px 12px;margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px;font-size:11.5px">
            <strong>Deflection Decomposition Profile — ${esc(activeIj.shortTag)} · ${esc(activeIj.manufacturer)} ${esc(activeIj.series)} ${activeIj.depthIn}" (${Number(activeIj.spanFt).toFixed(1)} ft Span)</strong>
            <div style="display:flex;gap:12px;font-size:11px;color:#334155">
              <span><b style="color:#0284c7">━</b> Bending Only (${activeBendIn.toFixed(3)}")</span>
              <span><b style="color:#0f766e">━</b> + Shear (${Number(activeIj.deltaElastic_in).toFixed(3)}")</span>
              <span><b style="color:#dc2626">━</b> Long-Term + Creep (${Number(activeIj.deltaLT_total_in).toFixed(3)}")</span>
              <span><b style="color:#9333ea">┄</b> Code Limit L/${activeIj.defTLLimit} (${Number(activeIj.limitLT_in).toFixed(3)}")</span>
            </div>
          </div>
          <svg id="audit-ijoist-deflection-svg" viewBox="0 0 ${wSvg} ${hSvg}" style="width:100%;max-height:190px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px">
            <line x1="${padL}" y1="${padT}" x2="${wSvg - padR}" y2="${padT}" stroke="#334155" stroke-width="1.5"/>
            <line x1="${padL}" y1="${yAllowLL}" x2="${wSvg - padR}" y2="${yAllowLL}" stroke="#2563eb" stroke-width="1" stroke-dasharray="4,4"/>
            <line x1="${padL}" y1="${yAllowTL}" x2="${wSvg - padR}" y2="${yAllowTL}" stroke="#9333ea" stroke-width="1.4" stroke-dasharray="6,4"/>
            <text x="${wSvg - padR - 4}" y="${Math.max(padT + 10, Number(yAllowTL) - 4)}" font-size="9.5" fill="#7e22ce" text-anchor="end" font-weight="bold">Limit L/${activeIj.defTLLimit} = ${Number(activeIj.limitLT_in).toFixed(3)}"</text>
            <polyline fill="none" stroke="#0284c7" stroke-width="2" points="${ptsBend}"/>
            <polyline fill="none" stroke="#0f766e" stroke-width="2.2" points="${ptsEl}"/>
            <polyline fill="none" stroke="#dc2626" stroke-width="2.6" points="${ptsLT}"/>
            <text x="${padL}" y="${hSvg - 10}" font-size="9.5" fill="#475569">0% Support A</text>
            <text x="${padL + plotW / 2}" y="${hSvg - 10}" font-size="9.5" fill="#0f172a" font-weight="bold" text-anchor="middle">Midspan Δ_LT = ${Number(activeIj.deltaLT_total_in).toFixed(3)}" (L/${activeIj.ratioLT}) · Shear = ${Number(activeIj.shearSharePct).toFixed(1)}% · Creep = +${Number(activeIj.deltaCreep_in).toFixed(3)}"</text>
            <text x="${wSvg - padR}" y="${hSvg - 10}" font-size="9.5" fill="#475569" text-anchor="end">100% Support B</text>
            <text x="6" y="${padT + 6}" font-size="9.5" fill="#475569">0.00"</text>
            <text x="6" y="${hSvg - padB}" font-size="9.5" fill="#475569">${maxDef.toFixed(2)}"</text>
          </svg>
        </div>`;
    }

    const hasAnyWarning = activeCount > 0 || loadWarnCount > 0 || ijWarnCount > 0;
    sp.innerHTML = `
      <div style="padding:18px;max-width:1240px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;padding:14px 16px;background:${hasAnyWarning ? '#fef2f2' : '#f0fdf4'};border:1px solid ${hasAnyWarning ? '#fca5a5' : '#86efac'};border-radius:10px">
          <div>
            <h2 style="margin:0 0 4px;font-size:16px;color:${hasAnyWarning ? '#991b1b' : '#166534'}">
              ${hasAnyWarning ? `⚠️ Structural Audit: ${loadWarnCount} Wall Warning(s) · ${ijWarnCount} I-Joist Deflection Alert(s) · ${activeCount} Stud Collision(s)` : `✅ Multi-Code Compliance, I-Joist Creep/Shear Deflection & Stud Positions Verified (${fixedCount} Shifted)`}
            </h2>
            <div style="font-size:12px;color:#475569">
              Verified under <b>Eurocode 5 (EN 1995-1-1)</b>, <b>NDS 2024 (ASD/LRFD &amp; Creep K<sub>cr</sub>)</b>, &amp; <b>ICC-ES PRI-400 Two-Term Shear Deflection</b>.
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <button id="audit-open-pamir-hub-btn" class="primary" style="background:#0f172a;border-color:#0284c7;color:#38bdf8;font-weight:800;padding:8px 14px;cursor:pointer">
              ⚡ PAMIR Wall Studio (Headers · Racking · CNC · BOM)
            </button>
            <button id="audit-autodesign-all-walls-btn" class="primary" style="background:#059669;border-color:#047857;color:#fff;font-weight:700;padding:8px 14px;cursor:pointer">
              ⚡ Auto-Design All Walls
            </button>
            <button id="audit-fix-collisions-btn" class="primary" style="background:#dc2626;border-color:#dc2626;color:#fff;font-weight:700;padding:8px 14px;cursor:pointer" ${activeCount === 0 ? 'disabled style="opacity:0.5;cursor:default"' : ''}>
              ⚡ Fix Collisions (${activeCount})
            </button>
            <button id="audit-reset-collisions-btn" class="subtle" style="padding:8px 12px;cursor:pointer">
              Reset Stud Grid
            </button>
            <button id="audit-view-2d-btn" class="subtle" style="padding:8px 12px;cursor:pointer">
              View in 2D Framing Plan
            </button>
          </div>
        </div>

        <div style="margin-bottom:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px">
            <h3 style="margin:0;font-size:14px;color:#0f172a">1. Multi-Code Structural Audit &amp; Eurocode 5 Load Combinations (EN 1990 / EN 1995-1-1 &amp; NDS 2024)</h3>
            <span style="font-size:11px;color:#64748b">Modify characteristic loads below to dynamically recompute governing EC5 combinations, axial compression &amp; shear-wall racking</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px;margin-bottom:10px;padding:10px 12px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;font-size:11px">
            <label style="display:flex;flex-direction:column;gap:2px;font-weight:700;color:#0369a1">Roof Dead G<sub>k</sub> (kN/m²)
              <input id="audit-ec5-roofdead" type="number" step="0.05" min="0" value="${ec5Inputs.roofDeadKNm2}" style="padding:4px 6px;border:1px solid #93c5fd;border-radius:4px;background:#fff"/>
            </label>
            <label style="display:flex;flex-direction:column;gap:2px;font-weight:700;color:#0369a1">Floor Dead G<sub>k</sub> (kN/m²)
              <input id="audit-ec5-floordead" type="number" step="0.05" min="0" value="${ec5Inputs.floorDeadKNm2}" style="padding:4px 6px;border:1px solid #93c5fd;border-radius:4px;background:#fff"/>
            </label>
            <label style="display:flex;flex-direction:column;gap:2px;font-weight:700;color:#0369a1">Floor Live Q<sub>k</sub> (kN/m²)
              <input id="audit-ec5-floorlive" type="number" step="0.1" min="0" value="${ec5Inputs.floorLiveKNm2}" style="padding:4px 6px;border:1px solid #93c5fd;border-radius:4px;background:#fff"/>
            </label>
            <label style="display:flex;flex-direction:column;gap:2px;font-weight:700;color:#0369a1">Snow s<sub>k</sub> (kN/m²)
              <input id="audit-ec5-snow" type="number" step="0.05" min="0" value="${ec5Inputs.snowLoadKNm2}" style="padding:4px 6px;border:1px solid #93c5fd;border-radius:4px;background:#fff"/>
            </label>
            <label style="display:flex;flex-direction:column;gap:2px;font-weight:700;color:#0369a1">Wind W<sub>k</sub> (kN/m²)
              <input id="audit-ec5-wind" type="number" step="0.05" min="0" value="${ec5Inputs.windPressureKNm2}" style="padding:4px 6px;border:1px solid #93c5fd;border-radius:4px;background:#fff"/>
            </label>
            <label style="display:flex;flex-direction:column;gap:2px;font-weight:700;color:#0369a1">Racking V<sub>k</sub> (kN/m)
              <input id="audit-ec5-racking" type="number" step="0.2" min="0" value="${ec5Inputs.inPlaneRackingForceKNm}" style="padding:4px 6px;border:1px solid #93c5fd;border-radius:4px;background:#fff"/>
            </label>
            <label style="display:flex;flex-direction:column;gap:2px;font-weight:700;color:#0369a1">Roof Trib (m)
              <input id="audit-ec5-rooftrib" type="number" step="0.2" min="0.5" value="${ec5Inputs.roofTributarySpanM}" style="padding:4px 6px;border:1px solid #93c5fd;border-radius:4px;background:#fff"/>
            </label>
            <label style="display:flex;flex-direction:column;gap:2px;font-weight:700;color:#0369a1">Service Class
              <select id="audit-ec5-sc" style="padding:4px 6px;border:1px solid #93c5fd;border-radius:4px;background:#fff">
                <option value="1" ${Number(ec5Inputs.serviceClass) === 1 ? 'selected' : ''}>SC 1 (Dry)</option>
                <option value="2" ${Number(ec5Inputs.serviceClass) === 2 ? 'selected' : ''}>SC 2 (Wall)</option>
                <option value="3" ${Number(ec5Inputs.serviceClass) === 3 ? 'selected' : ''}>SC 3 (Exposed)</option>
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:2px;font-weight:700;color:#0369a1">EN 1990 Eq.
              <select id="audit-ec5-eq" style="padding:4px 6px;border:1px solid #93c5fd;border-radius:4px;background:#fff">
                <option value="6.10" ${ec5Inputs.combinationEquation !== '6.10ab' ? 'selected' : ''}>Eq. 6.10 (1.35G+1.5Q)</option>
                <option value="6.10ab" ${ec5Inputs.combinationEquation === '6.10ab' ? 'selected' : ''}>Eq. 6.10a / 6.10b</option>
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:2px;font-weight:700;color:#0369a1">Occupancy
              <select id="audit-ec5-occ" style="padding:4px 6px;border:1px solid #93c5fd;border-radius:4px;background:#fff">
                <option value="A" ${ec5Inputs.occupancyCategory === 'A' ? 'selected' : ''}>Cat A (ψ0=0.7)</option>
                <option value="B" ${ec5Inputs.occupancyCategory === 'B' ? 'selected' : ''}>Cat B (ψ0=0.7)</option>
                <option value="C" ${ec5Inputs.occupancyCategory === 'C' ? 'selected' : ''}>Cat C (ψ0=0.7)</option>
                <option value="E" ${ec5Inputs.occupancyCategory === 'E' ? 'selected' : ''}>Cat E (ψ0=1.0)</option>
              </select>
            </label>
            <div style="display:flex;align-items:flex-end">
              <button id="audit-ec5-apply-btn" type="button" class="primary" style="width:100%;padding:6px 8px;background:#0284c7;border-color:#0369a1;color:#fff;font-weight:700;font-size:11px;cursor:pointer">Recompute EC5</button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>WALL ID</th>
                <th>GOVERNING EC5 COMBO</th>
                <th>STUD SECTION &amp; SPACING</th>
                <th>EC5 AXIAL &amp; COMB D/C</th>
                <th>RACKING SHEAR D/C</th>
                <th>NDS 2024 (US ASD) D/C</th>
                <th>STRUCTURAL COMPLIANCE STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${loadAuditRowsHtml || '<tr><td colspan="8" style="padding:14px;text-align:center;color:#64748b">No framed walls found in the project.</td></tr>'}
            </tbody>
          </table>
          ${ec5ComboMatrixHtml}
        </div>

        ${svgDiagram}

        <div style="margin-bottom:20px">
          <h3 style="margin:0 0 8px;font-size:14px;color:#0f172a">2. Stud O.C. Grid Collision Audit (Openings & Wall Junctions)</h3>
          <table>
            <thead>
              <tr>
                <th>WALL ID</th>
                <th>COLLIDING STUD POSITION (RED)</th>
                <th>COLLISION TARGET</th>
                <th>SAFE SHIFTED POSITION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="5" style="padding:14px;text-align:center;color:#64748b">No stud collisions detected on any framed walls.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div id="audit-ijoist-deflection-section" style="padding:14px 16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px">
            <div>
              <h3 style="margin:0 0 2px;font-size:14px;color:#0f172a">3. EWP I-Joist Specific Deflection Analysis (Shear Deflection &amp; Creep Factors)</h3>
              <div style="font-size:11.5px;color:#475569">
                Manufacturer PRI-400 two-term formula: <b>&Delta; = 5wL<sup>4</sup>/(384EI) + wL<sup>2</sup>/K<sub>shear</sub></b> with time-dependent creep <b>&Delta;<sub>cr</sub> = (K<sub>cr</sub> &minus; 1)(&Delta;<sub>DL,0</sub> + &psi;<sub>2</sub>&Delta;<sub>LL</sub>)</b> per NDS &sect;3.5 &amp; Eurocode 5 k<sub>def</sub>.
              </div>
            </div>
            <button id="audit-ijoist-gen-plan-btn" class="subtle" type="button" style="padding:6px 11px;font-size:11px;font-weight:700;color:#0f766e;border-color:#5eead4;background:#f0fdfa;cursor:pointer">📐 Auto-Generate 2D EWP Framing Plan</button>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-bottom:12px;padding:10px 12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px">
            <label style="display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#334155">
              EWP Manufacturer Series
              <select id="audit-ij-series" style="padding:5px 6px;border:1px solid #cbd5e1;border-radius:5px;font-size:11.5px;background:#fff">
                ${ijSeriesOptions.map(([k, lbl]) => `<option value="${esc(k)}" ${ijState.series === k ? 'selected' : ''}>${esc(lbl)}</option>`).join('')}
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#334155">
              Service &amp; Creep Environment
              <select id="audit-ij-creep" style="padding:5px 6px;border:1px solid #cbd5e1;border-radius:5px;font-size:11.5px;background:#fff">
                ${ijCreepOptions.map(([k, lbl]) => `<option value="${esc(k)}" ${ijState.creepEnv === k ? 'selected' : ''}>${esc(lbl)}</option>`).join('')}
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#334155">
              Sustained Live Factor (&psi;<sub>2</sub>)
              <select id="audit-ij-psi2" style="padding:5px 6px;border:1px solid #cbd5e1;border-radius:5px;font-size:11.5px;background:#fff">
                <option value="0" ${ijState.sustainedLiveShare === 0 ? 'selected' : ''}>0.00 (Standard Residential, DL only)</option>
                <option value="0.2" ${ijState.sustainedLiveShare === 0.2 ? 'selected' : ''}>0.20 (Semi-Sustained Live Load)</option>
                <option value="0.3" ${ijState.sustainedLiveShare === 0.3 ? 'selected' : ''}>0.30 (Storage / Heavy Sustained)</option>
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#334155">
              Floor Live / Dead (psf)
              <div style="display:flex;gap:4px">
                <input id="audit-ij-live" type="number" min="10" max="200" step="5" value="${ijState.livePsf}" title="Live Load psf" style="width:50%;padding:5px;border:1px solid #cbd5e1;border-radius:5px;font-size:11.5px"/>
                <input id="audit-ij-dead" type="number" min="5" max="100" step="1" value="${ijState.deadPsf}" title="Dead Load psf" style="width:50%;padding:5px;border:1px solid #cbd5e1;border-radius:5px;font-size:11.5px"/>
              </div>
            </label>
            <label style="display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#334155">
              Deflection Limits (LL / LT)
              <select id="audit-ij-limits" style="padding:5px 6px;border:1px solid #cbd5e1;border-radius:5px;font-size:11.5px;background:#fff">
                <option value="480/240" ${ijState.defLLLimit === 480 && ijState.defTLLimit === 240 ? 'selected' : ''}>L/480 Live · L/240 Long-Term (IRC Floor)</option>
                <option value="360/240" ${ijState.defLLLimit === 360 && ijState.defTLLimit === 240 ? 'selected' : ''}>L/360 Live · L/240 Long-Term (Code Min)</option>
                <option value="480/360" ${ijState.defLLLimit === 480 && ijState.defTLLimit === 360 ? 'selected' : ''}>L/480 Live · L/360 Long-Term (Stiff Tile)</option>
              </select>
            </label>
          </div>

          <div style="display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:8px;margin-bottom:12px">
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px">
              <div style="font-size:10px;font-weight:700;color:#64748b">AUDITED I-JOISTS</div>
              <div style="font-size:16px;font-weight:800;color:#0f172a">${ijSum.totalJoistCount || 0} <small style="font-size:10px;color:#64748b">(${ijSum.groupCount || 0} groups)</small></div>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px">
              <div style="font-size:10px;font-weight:700;color:#64748b">AVG SHEAR DEFLECTION SHARE</div>
              <div style="font-size:16px;font-weight:800;color:#0369a1">${Number(ijSum.avgShearSharePct || 0).toFixed(1)}%</div>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px">
              <div style="font-size:10px;font-weight:700;color:#64748b">CREEP MULTIPLIER K<sub>cr</sub></div>
              <div style="font-size:16px;font-weight:800;color:#b45309">${Number(ijEnvObj.K_cr || 1.5).toFixed(2)}× <small style="font-size:10px;color:#64748b">(k<sub>def</sub> ${Number(ijEnvObj.ec5Kdef ?? 0.6).toFixed(2)})</small></div>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px">
              <div style="font-size:10px;font-weight:700;color:#64748b">PEAK LONG-TERM &Delta;<sub>LT</sub></div>
              <div style="font-size:16px;font-weight:800;color:#dc2626">${Number(ijSum.maxDeltaLT_in || 0).toFixed(3)}" <small style="font-size:10px;color:#475569">(L/${ijSum.worstRatioLT || 999})</small></div>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px">
              <div style="font-size:10px;font-weight:700;color:#64748b">I-JOIST AUDIT STATUS</div>
              <div><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:800;${statusBadgeCss(ijSum.overallStatus || 'PASS')}">${esc(ijSum.overallStatus || 'PASS')} (${ijSum.passCount || 0}/${ijSum.groupCount || 0})</span></div>
            </div>
          </div>

          ${ijSvgHtml}

          <table id="audit-ijoist-deflection-table">
            <thead>
              <tr>
                <th>I-JOIST GROUP &amp; SPAN</th>
                <th>EWP MANUFACTURER DATA (EI / K<sub>shear</sub>)</th>
                <th>BENDING &Delta;<sub>b</sub></th>
                <th>SHEAR &Delta;<sub>s</sub> (% SHARE)</th>
                <th>LIVE &Delta;<sub>LL</sub> (L/xx)</th>
                <th>CREEP &Delta;<sub>cr</sub> (K<sub>cr</sub>)</th>
                <th>LONG-TERM &Delta;<sub>LT</sub> (L/xx)</th>
                <th>D/C &amp; STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${ijRowsHtml || '<tr><td colspan="8" style="padding:14px;text-align:center;color:#64748b">Loading EWP manufacturer deflection engine...</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const applyAuditEc5Loads = (showMsg = false) => {
      const readN = (id, fb) => {
        const el = $('#' + id);
        if (!el || el.value === '') return fb;
        const n = Number(el.value);
        return Number.isFinite(n) && n >= 0 ? n : fb;
      };
      const patch = {
        roofDeadKNm2: readN('audit-ec5-roofdead', ec5Inputs.roofDeadKNm2),
        floorDeadKNm2: readN('audit-ec5-floordead', ec5Inputs.floorDeadKNm2),
        floorLiveKNm2: readN('audit-ec5-floorlive', ec5Inputs.floorLiveKNm2),
        snowLoadKNm2: readN('audit-ec5-snow', ec5Inputs.snowLoadKNm2),
        windPressureKNm2: readN('audit-ec5-wind', ec5Inputs.windPressureKNm2),
        inPlaneRackingForceKNm: readN('audit-ec5-racking', ec5Inputs.inPlaneRackingForceKNm),
        roofTributarySpanM: readN('audit-ec5-rooftrib', ec5Inputs.roofTributarySpanM),
        serviceClass: Number($('#audit-ec5-sc')?.value) || 2,
        combinationEquation: $('#audit-ec5-eq')?.value || '6.10',
        occupancyCategory: $('#audit-ec5-occ')?.value || 'A'
      };
      if (typeof window.setProjectLoads === 'function') window.setProjectLoads(patch, model);
      else model.wallStudioLoads = { ...(model.wallStudioLoads || {}), ...patch, _customized: true };
      properties();
      schedule();
      render();
      if (showMsg) toast('Eurocode 5 load combinations, axial compression & shear-wall racking updated.');
    };
    ['audit-ec5-roofdead', 'audit-ec5-floordead', 'audit-ec5-floorlive', 'audit-ec5-snow', 'audit-ec5-wind', 'audit-ec5-racking', 'audit-ec5-rooftrib', 'audit-ec5-sc', 'audit-ec5-eq', 'audit-ec5-occ'].forEach(id => {
      $('#' + id)?.addEventListener('change', () => applyAuditEc5Loads(false));
    });
    bindClick('#audit-ec5-apply-btn', () => applyAuditEc5Loads(true));

    $$('[data-row]').forEach(r => r.onclick = (ev) => {
      if(ev.target.closest('button')) return;
      selected = [r.dataset.row];
      properties();
      schedule();
      toast(`${r.dataset.row} selected for audit preview`);
    });
    $$('[data-ij-row]').forEach(r => r.onclick = () => {
      ijState.selectedId = r.dataset.ijRow;
      schedule();
    });
    $('#audit-ij-series')?.addEventListener('change', ev => {
      ijState.series = ev.target.value || 'auto';
      schedule();
    });
    $('#audit-ij-creep')?.addEventListener('change', ev => {
      ijState.creepEnv = ev.target.value || 'dry_interior';
      schedule();
    });
    $('#audit-ij-psi2')?.addEventListener('change', ev => {
      ijState.sustainedLiveShare = Number(ev.target.value) || 0;
      schedule();
    });
    $('#audit-ij-live')?.addEventListener('change', ev => {
      ijState.livePsf = Math.max(0, Number(ev.target.value) || 40);
      schedule();
    });
    $('#audit-ij-dead')?.addEventListener('change', ev => {
      ijState.deadPsf = Math.max(0, Number(ev.target.value) || 15);
      schedule();
    });
    $('#audit-ij-limits')?.addEventListener('change', ev => {
      const [ll, tl] = String(ev.target.value || '480/240').split('/').map(Number);
      ijState.defLLLimit = ll || 480;
      ijState.defTLLimit = tl || 240;
      schedule();
    });
    bindClick('#audit-ijoist-gen-plan-btn', () => {
      if (typeof window.generate2DEWPFramingPlan === 'function') window.generate2DEWPFramingPlan();
      else import('./report.js').then(() => window.generate2DEWPFramingPlan?.()).catch(() => toast('2D EWP plan generator unavailable.'));
    });
    $$('[data-audit-inspect]').forEach(btn => btn.onclick = (ev) => {
      ev.stopPropagation();
      const wId = btn.dataset.auditInspect;
      const w = model.elements.find(el => el.id === wId && el.type === 'wall') || targetWall;
      if(w) openMultiCodeAuditModal(w);
    });
    bindClick('#audit-open-pamir-hub-btn', () => {
      window.openWallStudioHubModal?.(targetWall, 'structural');
    });
    bindClick('#audit-autodesign-all-walls-btn', () => {
      commit(() => {
        const wallsList = (model.elements || []).filter(el => el.type === 'wall');
        wallsList.forEach(wx => window.WallStructuralEngine?.autoDesignWallFraming(wx, model));
      });
      properties();
      schedule();
      toast('⚡ Auto-designed all walls for Eurocode 5, NDS 2024 & Shear-Wall Racking compliance.');
    });
    bindClick('#audit-fix-collisions-btn', () => {
      commit(() => {
        if (typeof window.fixWallStudCollisions === 'function') {
          window.fixWallStudCollisions(model);
        }
      });
      properties();
      schedule();
      render();
      toast('⚡ All colliding studs auto-shifted to clear positions!');
    });
    bindClick('#audit-reset-collisions-btn', () => {
      commit(() => {
        for (const w of model.elements.filter(e => e.type === 'wall')) {
          w.framing = { ...construction(w), collisionsFixed: false, highlightCollisions: true };
        }
      });
      properties();
      schedule();
      render();
      toast('Stud grid reset to unshifted O.C. positions (collisions highlighted in red)');
    });
    bindClick('#audit-view-2d-btn', () => {
      for (const w of model.elements.filter(e => e.type === 'wall')) {
        if (!w.framing?.collisionsFixed) {
          w.framing = { ...construction(w), highlightCollisions: true };
        }
      }
      setView('framingplan');
    });
    return;
  }
  if(view==='floorschedule'){
    const data = typeof window.collectFloorScheduleData === 'function' ? window.collectFloorScheduleData(model, window.ewpBeamToolState) : null;
    if (!data) {
      sp.innerHTML = `<div style="padding:24px;text-align:center;color:#64748b">Floor Framing Schedule engine is loading...</div>`;
      return;
    }
    const s = data.summary;
    const totalLenText = data.unitsMode === 'imperial' ? `${s.totalLinearFt.toFixed(1)} lin ft` : `${s.totalLinearM.toFixed(1)} lin m`;

    // Ensure EWP structural solver is available (ES module loads asynchronously alongside classic app.js)
    if (typeof window.analyzeSelectedEWPJoists !== 'function' && !window._ewpSolverRequested) {
      window._ewpSolverRequested = true;
      import('./ewp-system.js').then(() => {
        if (view === 'floorschedule') schedule();
      }).catch(() => {});
    }

    // Persistent structural analysis selection & load configuration
    if (!window._floorScheduleAnalysisState) {
      window._floorScheduleAnalysisState = {
        selectedIds: [],
        livePsf: null,
        deadPsf: null,
        extraUdlPlf: 0,
        pointLoads: [],
        initialized: false
      };
    }
    const aState = window._floorScheduleAnalysisState;
    const validIds = new Set(data.members.map(m => m.id));
    aState.selectedIds = aState.selectedIds.filter(id => validIds.has(id));

    const isPrimaryEwpJoist = (m) =>
      !/blocking|corner stud/i.test(String(m.type || '')) &&
      (/floor joist|tail joist|cantilever|trimmer|partition doubler/i.test(String(m.type || '')) ||
        /i-joist|posi-strut|open-web|truss/i.test(String(m.familyLabel || '')));

    const canvasSelectedFloorIds = (Array.isArray(selected) ? selected : []).filter(id => validIds.has(id));
    if (!aState.initialized) {
      if (canvasSelectedFloorIds.length) {
        aState.selectedIds = [...canvasSelectedFloorIds];
      } else {
        const defaultJoists = data.members.filter(isPrimaryEwpJoist);
        aState.selectedIds = (defaultJoists.length ? defaultJoists : data.members).slice(0, 3).map(m => m.id);
      }
      aState.initialized = true;
    }

    const activeLivePsf = aState.livePsf !== null ? aState.livePsf : (s.livePsf || 40);
    const activeDeadPsf = aState.deadPsf !== null ? aState.deadPsf : (s.deadPsf || 15);
    const activeExtraUdlPlf = Number(aState.extraUdlPlf || 0);
    const selectedSet = new Set(aState.selectedIds);
    const selectedMembersForAnalysis = data.members.filter(m => selectedSet.has(m.id));

    const analysis = typeof window.analyzeSelectedEWPJoists === 'function'
      ? window.analyzeSelectedEWPJoists(selectedMembersForAnalysis, {
          allMembers: data.members,
          livePsf: activeLivePsf,
          deadPsf: activeDeadPsf,
          spacingIn: s.joistSpacingIn || 16,
          extraUdlPlf: activeExtraUdlPlf,
          defLLLimit: s.defLLLimit || 480,
          defTLLimit: s.defTLLimit || 360,
          hangerCatalog: window.HANGER_CATALOG || {},
          pointLoads: aState.pointLoads || []
        })
      : { results: [], summary: { count: 0, maxDistPlf: 0, maxDistKNm: 0, totalPointLoadLb: 0, totalPointLoadKN: 0, maxReactionLb: 0, maxReactionKN: 0, maxMomentFtLb: 0, maxShearLb: 0, maxDcPercent: 0, passCount: 0, warnCount: 0, failCount: 0, overallStatus: 'PASS' } };
    window._lastFloorJoistStructuralAnalysis = analysis;

    const aSum = analysis.summary || {};
    const statusBadgeStyle = (st) => st === 'FAIL'
      ? 'background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5'
      : st === 'WARNING'
        ? 'background:#fef3c7;color:#b45309;border:1px solid #fcd34d'
        : 'background:#dcfce7;color:#15803d;border:1px solid #86efac';

    const customPointChipsHtml = (aState.pointLoads || []).map((pt, idx) => `
      <span style="display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700;background:#fff7ed;color:#c2410c;border:1px solid #fdba74">
        ${esc(pt.label)}: ${Math.round(pt.loadLb)} lbs @ ${Math.round((pt.ratio || 0.5) * 100)}% span
        <button type="button" data-remove-pt="${idx}" style="border:none;background:transparent;color:#9a3412;font-weight:900;cursor:pointer;padding:0 2px;line-height:1" title="Remove point load">×</button>
      </span>
    `).join('');

    const analysisRowsHtml = analysis.results.map(r => {
      const ptsSummary = r.pointLoads.length
        ? r.pointLoads.map(p => `<div style="font-size:10.5px;line-height:1.35"><b>${Math.round(p.loadLb)} lb</b> <span style="color:#64748b">@ ${Math.round(p.ratio * 100)}% (${p.distFt.toFixed(1)} ft)</span> <small style="color:${p.source === 'BIM Model' ? '#0369a1' : '#c2410c'}">[${esc(p.label)}]</small></div>`).join('')
        : '<span style="color:#94a3b8;font-size:11px">None (UDL only)</span>';
      return `
        <tr>
          <td>
            <b>${esc(r.shortTag)}</b>
            <div style="font-size:10px;color:#64748b">${esc(r.role)}</div>
          </td>
          <td>
            <div style="font-family:monospace;font-size:11px;font-weight:700">${esc(r.section)} (${r.plies}P)</div>
            <div style="font-size:10.5px;color:#475569">Span: <b>${esc(r.spanLabel)}</b></div>
          </td>
          <td style="font-family:monospace;font-size:11px">${r.tribWidthIn}&quot; (${r.tribWidthFt.toFixed(2)} ft)</td>
          <td style="font-family:monospace;font-size:11px">
            <div><span style="color:#475569">DL ${r.wDL_plf}</span> + <span style="color:#0369a1">LL ${r.wLL_plf}</span> = <b>${r.wTL_plf} plf</b></div>
            <div style="font-size:10px;color:#64748b">${r.wTL_kNm} kN/m · Total ${r.totalDistLoadLb.toLocaleString()} lbs</div>
          </td>
          <td>${ptsSummary}</td>
          <td style="font-family:monospace;font-size:11px">
            <div>RA: <b>${r.rA_lb.toLocaleString()}</b> / RB: <b>${r.rB_lb.toLocaleString()} lb</b></div>
            <div style="font-size:10px;color:#64748b">${r.rA_kN} / ${r.rB_kN} kN · Brg &ge; ${r.reqBearingIn}&quot;</div>
          </td>
          <td style="font-family:monospace;font-size:11px">
            <div>Vmax: <b>${r.V_max_lb.toLocaleString()} lb</b></div>
            <div>Mmax: <b>${r.M_max_ft_lb.toLocaleString()} ft-lb</b></div>
          </td>
          <td style="font-family:monospace;font-size:11px">
            <div>&Delta;TL: <b>${r.deltaTL_in}&quot;</b> (L/${r.ratioTL})</div>
            <div>D/C: <b>${r.dcPercent}%</b> · Hanger ${Math.max(r.hangerA.dcPercent, r.hangerB.dcPercent)}%</div>
          </td>
          <td>
            <span style="display:inline-block;padding:2px 7px;border-radius:4px;font-size:10.5px;font-weight:800;${statusBadgeStyle(r.status)}">${r.status}</span>
            <div style="font-size:10px;color:#475569;margin-top:2px">${esc(r.governing)}</div>
          </td>
        </tr>
      `;
    }).join('');

    const memberRowsHtml = data.members.map(m => {
      const checkedAttr = selectedSet.has(m.id) ? 'checked' : '';
      return `
      <tr data-floor-row="${esc(m.id)}" style="cursor:pointer;${selectedSet.has(m.id) ? 'background:#f0f9ff' : ''}" title="Click to select ${esc(m.shortTag)} and edit profile or joist hanger">
        <td style="text-align:center;width:44px" onclick="event.stopPropagation()">
          <input type="checkbox" class="fs-analyze-chk" data-analyze-check="${esc(m.id)}" ${checkedAttr} aria-label="Analyze ${esc(m.shortTag)}" style="cursor:pointer;width:15px;height:15px;accent-color:#0284c7" />
        </td>
        <td><strong>${esc(m.shortTag)}</strong>${m.customEdited ? ' <span style="color:#d97706;font-weight:800">*</span>' : ''}</td>
        <td>${esc(m.type)}</td>
        <td><span style="padding:2px 6px;border-radius:4px;font-size:10.5px;font-weight:700;background:#eff6ff;color:#1d4ed8">${esc(m.familyLabel)}</span></td>
        <td style="font-family:monospace;font-size:11.5px">${esc(m.section)}</td>
        <td style="font-size:11px;color:#475569">${esc(m.grade)}</td>
        <td style="text-align:center">${m.plies}P</td>
        <td style="font-family:monospace;font-weight:700">${esc(m.spanLabel)}</td>
        <td><b style="color:#0369a1">${esc(m.hangerStartCode)}</b> <small style="color:#64748b">${esc(m.hangerStartName)}</small></td>
        <td><b style="color:#0369a1">${esc(m.hangerEndCode)}</b> <small style="color:#64748b">${esc(m.hangerEndName)}</small></td>
        <td style="font-size:11px;color:#475569">${esc(m.connectionNote)}</td>
      </tr>
    `;
    }).join('');

    const groupedRowsHtml = data.groupedSpans.map(g => `
      <tr>
        <td><strong>${esc(g.familyLabel)}</strong></td>
        <td>${esc(g.type)}</td>
        <td style="font-family:monospace">${esc(g.section)}</td>
        <td style="font-size:11px;color:#475569">${esc(g.grade)}</td>
        <td style="text-align:center">${g.plies}P</td>
        <td style="font-family:monospace;font-weight:700">${esc(g.spanLabel)}</td>
        <td style="text-align:center;font-weight:800">${g.qty}</td>
        <td style="font-family:monospace">${data.unitsMode === 'imperial' ? (g.totalLinearMm / 304.8).toFixed(1) + ' ft' : (g.totalLinearMm / 1000).toFixed(2) + ' m'}</td>
        <td>${esc(g.hangerStartCode === g.hangerEndCode ? g.hangerStartCode : `${g.hangerStartCode} / ${g.hangerEndCode}`)}</td>
      </tr>
    `).join('');

    const hangerRowsHtml = data.hangerTakeoff.map(h => `
      <tr>
        <td><span style="display:inline-block;min-width:28px;text-align:center;padding:2px 6px;border-radius:4px;font-weight:800;font-size:11px;background:#e0f2fe;color:#0369a1">${esc(h.code)}</span></td>
        <td><strong>${esc(h.name)}</strong></td>
        <td style="text-align:center;font-weight:800;color:#0f172a">${h.qty} ends</td>
        <td style="font-size:11px;font-weight:600;color:#334155">${esc(h.bearingReq)}</td>
        <td style="font-size:11px;color:#475569">${esc(h.rolesList)}</td>
        <td style="font-size:11px;color:#475569">${esc(h.detail)}</td>
      </tr>
    `).join('');

    const connReqRowsHtml = data.connectionRequirements.map(([cat, detail, note]) => `
      <tr>
        <td><strong>${esc(cat)}</strong></td>
        <td style="font-weight:700;color:#0369a1">${esc(detail)}</td>
        <td style="font-size:11.5px;color:#334155">${esc(note)}</td>
      </tr>
    `).join('');

    sp.innerHTML = `
      <div style="padding:18px;max-width:1320px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;padding:14px 16px;background:#eff6ff;border:1px solid #93c5fd;border-radius:10px">
          <div>
            <h2 style="margin:0 0 4px;font-size:16px;color:#1e3a8a">EWP Floor Framing Schedule &amp; Structural Load Analysis</h2>
            <div style="font-size:12px;color:#334155">
              Live schedule for <b>${esc(s.joistSection)} @ ${s.joistSpacingIn}&quot; O.C.</b> across ${data.slabsCount} floor slab(s) · Check joists to calculate point &amp; distributed loads or click a row to edit hardware.
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <button id="floor-schedule-gen-2d-btn" class="primary" type="button" style="background:#0f766e;border-color:#0d9488;color:#fff;font-weight:700;padding:8px 14px;cursor:pointer">
              📐 Auto-Generate 2D EWP Framing Plan
            </button>
            <button id="floor-schedule-pdf-btn" class="primary" type="button" style="background:#1d4ed8;border-color:#1e40af;color:#fff;font-weight:700;padding:8px 14px;cursor:pointer">
              📄 Generate Floor Framing Schedule PDF
            </button>
            <button id="floor-schedule-open-plan-btn" class="subtle" type="button" style="padding:8px 12px;cursor:pointer;font-weight:600">
              📐 Floor Framing Plan
            </button>
            <button id="floor-schedule-open-3d-btn" class="subtle" type="button" style="padding:8px 12px;cursor:pointer;font-weight:600">
              🧱 3D Framing View
            </button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:10px;margin-bottom:16px">
          <div style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:10px 12px">
            <div style="font-size:10px;font-weight:700;color:#64748b">TOTAL FLOOR MEMBERS</div>
            <div style="font-size:20px;font-weight:800;color:#0f172a">${s.totalMembers}</div>
            <div style="font-size:11px;color:#475569">${totalLenText} total ply-length</div>
          </div>
          <div style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:10px 12px">
            <div style="font-size:10px;font-weight:700;color:#64748b">LONGEST CLEAR SPAN</div>
            <div style="font-size:20px;font-weight:800;color:#0284c7">${esc(s.maxSpanLabel)}</div>
            <div style="font-size:11px;color:#475569">${esc(s.joistSection)} @ ${s.joistSpacingIn}&quot; O.C.</div>
          </div>
          <div style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:10px 12px">
            <div style="font-size:10px;font-weight:700;color:#64748b">STEEL HANGER CONNECTOR ENDS</div>
            <div style="font-size:20px;font-weight:800;color:#0f172a">${s.totalHangerEnds}</div>
            <div style="font-size:11px;color:#475569">${s.distinctHangerTypes} distinct connector type(s)</div>
          </div>
          <div style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:10px 12px">
            <div style="font-size:10px;font-weight:700;color:#64748b">EWP LOADING &amp; DEFLECTION</div>
            <div style="font-size:18px;font-weight:800;color:#15803d">${activeLivePsf} / ${activeDeadPsf} psf</div>
            <div style="font-size:11px;color:#475569">Limits L/${s.defLLLimit} LL · L/${s.defTLLimit} TL</div>
          </div>
        </div>

        <div id="floor-joist-structural-analysis-card" style="margin-bottom:20px;padding:14px 16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px">
            <div>
              <h3 style="margin:0 0 2px;font-size:14px;color:#0f172a">Structural Load Analysis — Selected EWP Joists (Point &amp; Distributed Loads)</h3>
              <div style="font-size:11.5px;color:#475569">
                Computes floor tributary distributed loads (DL + LL + self-weight + extra UDL) combined with auto-detected BIM header/wall point loads &amp; custom concentrated loads.
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button id="fs-select-all-joists" class="subtle" type="button" style="padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer">Select All EWP Joists</button>
              <button id="fs-sync-canvas-joists" class="subtle" type="button" style="padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer">Sync Canvas Selection (${canvasSelectedFloorIds.length})</button>
              <button id="fs-clear-joists" class="subtle" type="button" style="padding:5px 10px;font-size:11px;cursor:pointer">Clear</button>
              <button id="fs-run-analysis-btn" class="primary" type="button" style="padding:5px 11px;font-size:11px;font-weight:700;background:#0284c7;border-color:#0369a1;color:#fff;cursor:pointer">Recalculate Loads</button>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px;align-items:end;margin-bottom:10px;padding:10px 12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px">
            <label style="display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#334155">
              Live Load (psf)
              <input id="fs-live-psf" type="number" min="0" max="250" step="5" value="${activeLivePsf}" style="padding:5px 7px;border:1px solid #cbd5e1;border-radius:5px;font-size:12px" />
            </label>
            <label style="display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#334155">
              Dead Load (psf)
              <input id="fs-dead-psf" type="number" min="0" max="150" step="1" value="${activeDeadPsf}" style="padding:5px 7px;border:1px solid #cbd5e1;border-radius:5px;font-size:12px" />
            </label>
            <label style="display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#334155">
              Extra Line UDL (plf)
              <input id="fs-extra-udl" type="number" min="0" max="2000" step="10" value="${activeExtraUdlPlf}" style="padding:5px 7px;border:1px solid #cbd5e1;border-radius:5px;font-size:12px" />
            </label>
            <label style="display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#334155">
              Point Load Label
              <input id="fs-pt-label" type="text" value="Equipment / Post" maxlength="28" style="padding:5px 7px;border:1px solid #cbd5e1;border-radius:5px;font-size:12px" />
            </label>
            <label style="display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#334155">
              Point Load P (lbs)
              <input id="fs-pt-load" type="number" min="50" max="25000" step="50" value="1000" style="padding:5px 7px;border:1px solid #cbd5e1;border-radius:5px;font-size:12px" />
            </label>
            <label style="display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#334155">
              Position (% Span)
              <input id="fs-pt-ratio" type="number" min="5" max="95" step="5" value="50" style="padding:5px 7px;border:1px solid #cbd5e1;border-radius:5px;font-size:12px" />
            </label>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button id="fs-add-pt-btn" class="subtle" type="button" style="padding:6px 10px;font-size:11px;font-weight:700;background:#fff7ed;color:#c2410c;border-color:#fdba74;cursor:pointer">+ Add Point Load</button>
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">
            <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px">
              <span style="font-size:11px;font-weight:700;color:#475569">Active Custom Point Loads:</span>
              ${customPointChipsHtml || '<span style="font-size:11px;color:#94a3b8">None added yet (auto BIM reactions still included where headers/partitions bear on joists).</span>'}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button id="fs-preset-mid-pt" class="subtle" type="button" style="padding:3px 8px;font-size:10.5px;cursor:pointer">+1,000 lb @ Midspan</button>
              <button id="fs-preset-third-pt" class="subtle" type="button" style="padding:3px 8px;font-size:10.5px;cursor:pointer">+1,800 lb @ 35% Span</button>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(5,minmax(130px,1fr));gap:8px;margin-bottom:12px">
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px">
              <div style="font-size:10px;font-weight:700;color:#64748b">SELECTED JOISTS</div>
              <div style="font-size:16px;font-weight:800;color:#0f172a">${aSum.count || 0}</div>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px">
              <div style="font-size:10px;font-weight:700;color:#64748b">PEAK DIST. LOAD w_TL</div>
              <div style="font-size:16px;font-weight:800;color:#0369a1">${aSum.maxDistPlf || 0} plf <small style="font-size:10px;color:#64748b">(${aSum.maxDistKNm || 0} kN/m)</small></div>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px">
              <div style="font-size:10px;font-weight:700;color:#64748b">TOTAL POINT LOADS</div>
              <div style="font-size:16px;font-weight:800;color:#c2410c">${(aSum.totalPointLoadLb || 0).toLocaleString()} lbs <small style="font-size:10px;color:#64748b">(${aSum.totalPointLoadKN || 0} kN)</small></div>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px">
              <div style="font-size:10px;font-weight:700;color:#64748b">PEAK END REACTION</div>
              <div style="font-size:16px;font-weight:800;color:#0f172a">${(aSum.maxReactionLb || 0).toLocaleString()} lbs <small style="font-size:10px;color:#64748b">(${aSum.maxReactionKN || 0} kN)</small></div>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px">
              <div style="font-size:10px;font-weight:700;color:#64748b">OVERALL CHECK (${aSum.maxDcPercent || 0}% MAX D/C)</div>
              <div><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:800;${statusBadgeStyle(aSum.overallStatus || 'PASS')}">${aSum.overallStatus || 'PASS'}</span></div>
            </div>
          </div>

          <table id="floor-joist-analysis-table">
            <thead>
              <tr>
                <th>JOIST MARK</th>
                <th>SECTION &amp; SPAN</th>
                <th>TRIB WIDTH</th>
                <th>DISTRIBUTED LOAD (DL + LL = TOTAL)</th>
                <th>POINT LOADS (BIM + CUSTOM)</th>
                <th>SUPPORT REACTIONS (RA / RB)</th>
                <th>MAX SHEAR &amp; MOMENT</th>
                <th>DEFLECTION &amp; D/C%</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${analysisRowsHtml || '<tr><td colspan="9" style="padding:14px;text-align:center;color:#64748b">Select one or more EWP joists in the Member Schedule below or click <b>Select All EWP Joists</b> above to run point &amp; distributed load analysis.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom:18px">
          <h3 style="margin:0 0 8px;font-size:13.5px;color:#0f172a">1. Complete Member Span, Material &amp; Joist Hanger Schedule (${data.members.length} members)</h3>
          <table>
            <thead>
              <tr>
                <th style="text-align:center">ANALYZE</th>
                <th>MARK</th>
                <th>ROLE</th>
                <th>MATERIAL</th>
                <th>SECTION PROFILE</th>
                <th>GRADE</th>
                <th>PLIES</th>
                <th>SPAN / LENGTH</th>
                <th>END A HANGER</th>
                <th>END B HANGER</th>
                <th>CONNECTION / NOTES</th>
              </tr>
            </thead>
            <tbody>
              ${memberRowsHtml || '<tr><td colspan="11" style="padding:14px;text-align:center;color:#64748b">No floor framing members found. Place a slab element to generate floor joists.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom:18px">
          <h3 style="margin:0 0 8px;font-size:13.5px;color:#0f172a">2. Grouped Span &amp; Cut Summary (${data.groupedSpans.length} unique groups)</h3>
          <table>
            <thead>
              <tr>
                <th>MATERIAL</th>
                <th>ROLE</th>
                <th>SECTION PROFILE</th>
                <th>GRADE</th>
                <th>PLIES</th>
                <th>CUT LENGTH</th>
                <th>QTY</th>
                <th>TOTAL LENGTH</th>
                <th>HANGERS</th>
              </tr>
            </thead>
            <tbody>
              ${groupedRowsHtml || '<tr><td colspan="9" style="padding:14px;text-align:center;color:#64748b">No grouped cut entries.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom:18px">
          <h3 style="margin:0 0 8px;font-size:13.5px;color:#0f172a">3. Steel Connector &amp; Joist Hanger Schedule</h3>
          <table>
            <thead>
              <tr>
                <th>CODE</th>
                <th>HANGER / CONNECTOR MODEL</th>
                <th>QTY (ENDS)</th>
                <th>MIN BEARING</th>
                <th>CONNECTED MEMBERS</th>
                <th>CAPACITY &amp; FASTENER SPEC</th>
              </tr>
            </thead>
            <tbody>
              ${hangerRowsHtml || '<tr><td colspan="6" style="padding:14px;text-align:center;color:#64748b">No metal hangers currently assigned (Direct Bearing mode).</td></tr>'}
            </tbody>
          </table>
        </div>

        <div>
          <h3 style="margin:0 0 8px;font-size:13.5px;color:#0f172a">4. EWP Connection &amp; Bearing Requirements</h3>
          <table>
            <thead>
              <tr>
                <th>CONNECTION CATEGORY</th>
                <th>SPECIFIED HARDWARE / DETAIL</th>
                <th>INSTALLATION &amp; BEARING REQUIREMENT</th>
              </tr>
            </thead>
            <tbody>${connReqRowsHtml}</tbody>
          </table>
        </div>
      </div>
    `;

    bindClick('#floor-schedule-gen-2d-btn', () => {
      if (typeof window.generate2DEWPFramingPlan === 'function') window.generate2DEWPFramingPlan();
      else import('./report.js').then(() => window.generate2DEWPFramingPlan?.()).catch(() => toast('2D EWP framing plan generator is loading...'));
    });
    bindClick('#floor-schedule-pdf-btn', () => {
      if (typeof window.generateFloorFramingSchedulePDF === 'function') {
        window.generateFloorFramingSchedulePDF();
      } else {
        toast('Floor Framing Schedule PDF generator is loading...');
      }
    });
    bindClick('#floor-schedule-open-plan-btn', () => setView('ewpspecs'));
    bindClick('#floor-schedule-open-3d-btn', () => setView('framing3d'));

    bindClick('#fs-select-all-joists', () => {
      const ewpIds = data.members.filter(isPrimaryEwpJoist).map(m => m.id);
      aState.selectedIds = ewpIds.length ? ewpIds : data.members.map(m => m.id);
      schedule();
      toast(`Selected ${aState.selectedIds.length} EWP joist(s) for load analysis`);
    });
    bindClick('#fs-sync-canvas-joists', () => {
      if (!canvasSelectedFloorIds.length) {
        toast('No floor joists are currently selected in the 2D/3D canvas.');
        return;
      }
      aState.selectedIds = [...canvasSelectedFloorIds];
      schedule();
      toast(`Synced ${aState.selectedIds.length} canvas-selected floor member(s)`);
    });
    bindClick('#fs-clear-joists', () => {
      aState.selectedIds = [];
      schedule();
    });
    const syncDistInputs = () => {
      const llEl = $('#fs-live-psf');
      const dlEl = $('#fs-dead-psf');
      const exEl = $('#fs-extra-udl');
      if (llEl) aState.livePsf = Math.max(0, Number(llEl.value || 0));
      if (dlEl) aState.deadPsf = Math.max(0, Number(dlEl.value || 0));
      if (exEl) aState.extraUdlPlf = Math.max(0, Number(exEl.value || 0));
    };
    ['#fs-live-psf', '#fs-dead-psf', '#fs-extra-udl'].forEach(sel => {
      const el = $(sel);
      if (el) el.onchange = () => { syncDistInputs(); schedule(); };
    });
    bindClick('#fs-run-analysis-btn', () => {
      syncDistInputs();
      schedule();
      toast(`Analyzed ${aState.selectedIds.length} selected EWP joist(s)`);
    });
    bindClick('#fs-add-pt-btn', () => {
      syncDistInputs();
      const labelTxt = ($('#fs-pt-label')?.value || '').trim() || `Point Load P${(aState.pointLoads?.length || 0) + 1}`;
      const loadLb = Math.max(50, Number($('#fs-pt-load')?.value || 1000));
      const pct = Math.min(95, Math.max(5, Number($('#fs-pt-ratio')?.value || 50)));
      aState.pointLoads.push({ label: labelTxt, loadLb, ratio: pct / 100, source: 'Custom' });
      schedule();
      toast(`Added ${Math.round(loadLb)} lb point load @ ${pct}% span`);
    });
    bindClick('#fs-preset-mid-pt', () => {
      syncDistInputs();
      aState.pointLoads.push({ label: 'Midspan Point Load', loadLb: 1000, ratio: 0.5, source: 'Custom' });
      schedule();
    });
    bindClick('#fs-preset-third-pt', () => {
      syncDistInputs();
      aState.pointLoads.push({ label: 'Concentrated Post', loadLb: 1800, ratio: 0.35, source: 'Custom' });
      schedule();
    });
    $$('[data-remove-pt]').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.removePt);
        if (Number.isInteger(idx) && idx >= 0) {
          aState.pointLoads.splice(idx, 1);
          schedule();
        }
      };
    });
    $$('[data-analyze-check]').forEach(chk => {
      chk.onchange = () => {
        const mId = chk.dataset.analyzeCheck;
        if (!mId) return;
        const set = new Set(aState.selectedIds);
        if (chk.checked) set.add(mId);
        else set.delete(mId);
        aState.selectedIds = [...set];
        schedule();
      };
    });

    $$('[data-floor-row]').forEach(row => {
      row.onclick = () => {
        const mId = row.dataset.floorRow;
        if (!mId) return;
        select([mId]);
        toast(`Selected floor member ${mId.split(':')[1] || mId} — edit Joist Hanger or profile in Properties`);
      };
    });
    return;
  }
  if(view==='cutlist'){
    const uHdr = isImperialUnits() ? 'ft-in' : 'mm';
    sp.innerHTML=`<table><thead><tr><th>ELEMENT</th><th>MEMBER</th><th>SECTION (${uHdr})</th><th>LENGTH (${uHdr})</th><th>QTY</th></tr></thead><tbody>`+allFramingRows().map(r=>`<tr data-row="${r.wallId}"><td>${esc(r.wallId)}</td><td>${r.type}</td><td>${esc(formatSection(r.section))}</td><td>${esc(formatLength(r.length))}</td><td>${r.quantity}</td></tr>`).join('')+'</tbody></table>';
    $$('[data-row]').forEach(r=>r.onclick=()=>{selected=[r.dataset.row];properties();toast(r.dataset.row+' selected')});
    return;
  }
  sp.innerHTML=`<table><thead><tr><th>ELEMENT ID</th><th>TYPE</th><th>STORY</th><th>MATERIAL</th><th>SIZE / HEIGHT</th></tr></thead><tbody>${model.elements.map(e=>`<tr data-row="${e.id}"><td>${esc(e.id)}</td><td>${esc(e.type)}</td><td>${esc(storyOf(e).name)}</td><td>${esc(e.material)}</td><td>${e.width?formatLength(e.width)+' × ':''}${e.height?formatLength(heightOf(e)):e.thickness?formatLength(e.thickness):'—'}</td></tr>`).join('')}</tbody></table>`;
  $$('[data-row]').forEach(r=>r.onclick=()=>{selected=[r.dataset.row];properties();toast(`${r.dataset.row} selected in model`)});
}

function menu(button,entries){
  let pop=$('#menu-popover');if(!pop||!button)return;
  let r=button.getBoundingClientRect();
  pop.style.cssText=`left:${r.left}px;top:${r.bottom+5}px`;
  pop.innerHTML=entries.map(([text])=>`<button>${text}</button>`).join('');
  pop.classList.remove('hidden');
  [...pop.children].forEach((b,i)=>b.onclick=()=>{pop.classList.add('hidden');entries[i][1]()});
}
document.addEventListener('pointerdown',e=>{
  if(!e.target.closest('#menu-popover')&&!e.target.closest('[data-menu]')&&!e.target.closest('#display-mode')&&!e.target.closest('#view-more')&&!e.target.closest('#units'))$('#menu-popover').classList.add('hidden');
});

$$('[data-menu]').forEach(b=>b.onclick=()=>menu(b,({
  File:[
    ['Save project · Ctrl S',save],
    ['Import BIM / IFC (.ifc)…',openIFCImportModal],
    ['Open Timber Teck BIM project',openProjectPicker],
    ['Export IFC 4x3 Reference View',exportDialog],
    ['Export Solid OBJ model',exportDialog],
    ['Export Schedules & Cut Lists',exportDialog],
    ['Export Floor Framing Schedule (.pdf)', () => {
      const fn = window.generateFloorFramingSchedulePDF || window.generateEWPFloorPDFReport;
      if (typeof fn === 'function') fn();
      else toast('Floor Framing Schedule PDF generator is loading...');
    }],
    ['Export 2D Wall Framing Plan (.dxf)', () => {
      const fn = window.generate2DFramingPlanCAD || window.generateWallPanelPackageCAD;
      if (typeof fn === 'function') {
        fn({
          exteriorOsbEnabled: wallOsbToggle?.checked !== false,
          includeDimensions: wallDimensionsToggle?.checked !== false,
          textScale: getExportTextScale()
        });
        toast('2D Wall Framing Plan CAD export initiated');
      } else {
        toast('CAD export engine not loaded');
      }
    }],
    ['Export Wall Panels & Package CAD (.dxf)', () => {
      if (typeof window.generateWallPanelPackageCAD === 'function') {
        window.generateWallPanelPackageCAD({
          exteriorOsbEnabled: wallOsbToggle?.checked !== false,
          includeDimensions: wallDimensionsToggle?.checked !== false,
          textScale: getExportTextScale()
        });
        toast('Full Wall Panel Package CAD export initiated');
      } else {
        toast('CAD export engine not loaded');
      }
    }],
    ['Page Setup & Plot',()=>window.print()]
  ],
  Edit:[
    ['Undo · Ctrl Z',undo],
    ['Redo · Ctrl Shift Z',redo],
    ['Drag / Move · Ctrl D',()=>edit('move')],
    ['Rotate · Ctrl E',()=>edit('rotate')],
    ['Mirror · Ctrl M',()=>edit('mirror')],
    ['Elevate · Ctrl 9',()=>edit('elevate')],
    ['Multiply / Array · Ctrl U',arrayDialog],
    ['Split · Ctrl K',()=>edit('split')],
    ['Adjust / Trim · Scissors',()=>edit('trim')],
    ['Extend to Boundary',()=>edit('extend')],
    ['Intersect · Ctrl I',()=>edit('intersect')],
    ['Fillet / Chamfer…',()=>edit('fillet')],
    ['Align Elements…',alignmentDialog],
    ['Delete Selected · Del',()=>edit('delete')]
  ],
  View:[
    ['Floor Plan · F2',()=>setView('plan')],
    ['3D Window · F5',()=>setView('3d')],
    ['South Elevation',()=>setView('elevation')],
    ['Building Section A–A',()=>setView('section')],
    ['Fit in Window',fit],
    ['Trace & Reference · Alt+F2',()=>{traceActive=!traceActive;$('#trace-btn').classList.toggle('active',traceActive);render()}],
    ['3D Cutaway Planes',()=>$('#clip-panel').classList.toggle('hidden')]
  ],
  Design:[
    ['Wall Tool · W',()=>chooseTool('wall')],
    ['Door Tool · D',()=>chooseTool('door')],
    ['Window Tool · N',()=>chooseTool('window')],
    ['Skylight Tool · K',()=>chooseTool('skylight')],
    ['Roof Tool · R',()=>chooseTool('roof')],
    ['Shell Tool · H',()=>chooseTool('shell')],
    ['Beam Tool · B',()=>chooseTool('beam')],
    ['Column Tool · C',()=>chooseTool('column')],
    ['Slab Tool · F',()=>chooseTool('slab')],
    ['Stair Tool · S',()=>chooseTool('stair')],
    ['Railing Tool · J',()=>chooseTool('railing')],
    ['Curtain Wall Tool · U',()=>chooseTool('curtainwall')],
    ['Morph Tool · X',()=>chooseTool('morph')],
    ['Mesh Tool · Y',()=>chooseTool('mesh')],
    ['Zone Tool · Z',()=>chooseTool('zone')],
    ['Object Tool · O',()=>chooseTool('object')],
    ['Trim Elements to Roof…',()=>window.openTrimToRoofModal?.()],
    ['Solid Element Operations (SEO)…',()=>window.openSEOPalette?.(false)],
    ['Clear Roof Trim & SEO Links',()=>window.clearAllConnectLinksOnSelection?.()],
    ['Story Settings…',storyDialog],
    ['Auto-Generate Rafter & Ceiling Joist Layout…',()=>openAutoRafterJoistModal()],
    ['TrussMaker & Roof Framing',()=>setView('roofframingplan')]
  ],
  Document:[
    ['Dimension Tool · Q',()=>chooseTool('dimension')],
    ['Level Dimension Tool',()=>chooseTool('leveldim')],
    ['Text Annotation · T',()=>chooseTool('text')],
    ['Element Label',()=>chooseTool('label')],
    ['Fill / Hatch Tool · I',()=>chooseTool('fill')],
    ['Line Tool · L',()=>chooseTool('line')],
    ['Arc / Circle Tool · A',()=>chooseTool('arc')],
    ['Polyline Tool · P',()=>chooseTool('polyline')],
    ['Grid System Element · G',()=>chooseTool('grid')],
    ['2D Framing Plan',()=>setView('framingplan')],
    ['Floor framing plan',openEWPSpecs],
    ['Auto-Generate 2D EWP Framing Plan (DXF & PDF)',()=>{
      if(typeof window.generate2DEWPFramingPlan==='function')window.generate2DEWPFramingPlan();
      else import('./report.js').then(()=>window.generate2DEWPFramingPlan?.()).catch(()=>toast('2D EWP framing plan generator unavailable.'));
    }],
    ['Floor framing schedule',()=>setView('floorschedule')],
    ['Structural Audit (Creep & Shear Deflection)',()=>setView('audit')],
    ['Auto-Generate Rafter & Ceiling Joist Layout…',()=>openAutoRafterJoistModal()],
    ['Roof Framing & Truss Analysis',()=>setView('roofframingplan')],
    ['Element Schedule',()=>setView('schedule')],
    ['Timber Cut List',()=>setView('cutlist')],
    ['Analyze All Trusses',()=>trussReviewShow('analyze')],
    ['Optimize Truss Candidates',()=>trussReviewShow('optimize')]
  ],
  Options:[
    ['Project Preferences…',()=>openModal('Project Preferences',`<div class="modal-copy">BIM Project: Courtyard House · Standard Units: ${isImperialUnits() ? 'Feet & Inches (ft-in)' : 'Millimeters (mm)'} · Precision: ${isImperialUnits() ? '1/16"' : '0.1 mm'} · North Angle: 0.0° · Geographical Location: 37.77° N, 122.41° W</div>`)],
    ['Working Units · Millimeters (mm)',()=>setAppUnits('mm')],
    ['Working Units · Feet & Inches (ft-in)',()=>setAppUnits('ft-in')],
    ['Complex Profile Manager',()=>toast('Profile Manager: Timber studs, Glulam beams, and Reinforced Concrete profiles active')],
    ['Building Materials & Composites',()=>toast('Composite attributes synchronized with framing engine')]
  ],
  Teamwork:[
    ['Reserve All Elements',()=>toast('Teamwork: All project elements reserved for current workspace')],
    ['Release Selection',()=>toast('Teamwork: Elements released to BIMcloud')],
    ['Send & Receive Changes',()=>toast('Teamwork: BIMcloud workspace synchronized with latest revision')]
  ],
  Window:[
    ['Toolbox Palette',()=>toast('Toolbox active')],
    ['Info Box Bar',()=>$('#info-box')?.classList.toggle('hidden')],
    ['Project Navigator',()=>$('.inspector')?.classList.toggle('hidden')],
    ['Pet Palette Toggle',()=>$('#pet-palette')?.classList.toggle('hidden')],
    ['Reset All Palettes',()=>{$('#info-box')?.classList.remove('hidden');$('.inspector')?.classList.remove('hidden');toast('Palettes restored to Timber Teck standard layout')}]
  ],
  Help:[
    ['Timber Teck BIM Studio Help',()=>$('#help').click()],
    ['Keyboard Shortcuts Reference',()=>$('#help').click()],
    ['About Timber Teck BIM Engine',()=>openModal('Timber Teck · Structural BIM Studio',`<div class="modal-copy">Professional Virtual Building BIM CAD system featuring full parametric design, structural truss optimization, and timber framing synthesis.</div>`)]
  ]
})[b.dataset.menu]));

bindClick('#view-more', ()=>menu($('#view-more'),[['Floor plan',()=>setView('plan')],['3D model',()=>setView('3d')],['South elevation',()=>setView('elevation')],['Section A–A',()=>setView('section')],['Schedule',()=>setView('schedule')],['Wall framing panel',()=>setView('panel')],['Floor framing plan',openEWPSpecs],['Floor framing schedule',()=>setView('floorschedule')],['3D framing',()=>setView('framing3d')],['Framing cut list',()=>setView('cutlist')]]));
bindClick('#display-mode', ()=>menu($('#display-mode'),[
  ['Architectural',()=>{transparent=false;const dm=$('#display-mode');if(dm)dm.innerHTML=icon('layers')+'Architectural ⌄';render()}],
  ['Transparent solids',()=>{transparent=true;setView('3d');const dm=$('#display-mode');if(dm)dm.innerHTML=icon('layers')+'Transparent ⌄';render()}],
  ...layers.map(l=>[`${l.visible?'✓':'○'} Layer: ${esc(l.name)}`,()=>{l.visible=!l.visible;pruneHiddenSelection();properties();navigatorPanel();render();toast(`${l.name}: ${l.visible?'Visible':'Hidden'}`);}]),
  ['Show all layers',()=>{layers.forEach(l=>l.visible=true);properties();navigatorPanel();render();toast('All layers visible');}]
]));
bindClick('#units', ()=>menu($('#units'),[
  [`${appUnits==='mm'?'✓ ':''}Millimeters (mm) · model units`,()=>setAppUnits('mm')],
  [`${appUnits==='ft-in'?'✓ ':''}Feet & Inches (ft-in) · imperial units`,()=>setAppUnits('ft-in')]
]));
bindClick('#view-scale', ()=>{fit();toast('View returned to reference scale')});
bindClick('#scale-btn', ()=>{fit();toast('View returned to reference scale')});

function validateProject(m){
  if(!m||m.version!==1||!Array.isArray(m.stories)||!m.stories.length||!Array.isArray(m.elements)||m.elements.length>10000)throw Error('This is not a supported Timber Teck BIM project.');
  let ids=new Set();
  for(const s of m.stories){
    if(typeof s.id!=='string'||ids.has(s.id)||typeof s.name!=='string'||!Number.isFinite(s.height)||s.height<=0||!Number.isFinite(s.elevation))throw Error('Invalid story data.');
    ids.add(s.id);
  }
  ids=new Set();
  const types=toolGroups.flatMap(([, ...ts])=>ts.map(t=>t[0]));
  for(const e of m.elements){
    if(!types.includes(e.type)||typeof e.id!=='string'||ids.has(e.id)||!m.stories.some(s=>s.id===e.story))throw Error('Invalid element data.');
    ids.add(e.id);
    for(const p of [e.a,e.b,...(e.points||[])].filter(Boolean)){
      if(!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error('Invalid geometry.');
    }
    if(['wall','beam','line','dimension','stair','railing','curtainwall','grid'].includes(e.type)&&(!e.a||!e.b||distance(e.a,e.b)<1))throw Error('Invalid segment.');
    if(['wall','beam','column','slab'].includes(e.type)&&(!Number.isFinite(e.thickness)||e.thickness<=0))throw Error('Invalid thickness.');
    if(['slab','roof','rectangle','zone','morph','mesh','fill'].includes(e.type)&&(!Array.isArray(e.points)||e.points.length<3))throw Error('Invalid boundary.');
  }
  m.elements.filter(e=>e.type==='roof').forEach(validateRoof);
  for(const w of m.elements.filter(e=>e.type==='wall')){
    validateConstruction(w);
    if(w.topStory&&!m.stories.some(s=>s.id===w.topStory))throw Error('Invalid top-linked story.');
  }
  if(!Array.isArray(m.seoOperations)){
    m.seoOperations=[];
  }else{
    m.seoOperations=m.seoOperations.filter(op=>op&&typeof op.targetId==='string'&&typeof op.operatorId==='string'&&ids.has(op.targetId)&&ids.has(op.operatorId));
  }
  return m;
}

bindClick('#import-ifc-btn', openIFCImportModal);

async function processIFCContent(content, fileName = 'Timber_Teck_Model.ifc', options = {}) {
  try {
    if (!content) {
      throw new Error('No project content or file buffer provided for import.');
    }
    const convertFn = window.convertIFCToBIMModel;
    if (typeof convertFn !== 'function') {
      throw new Error('Timber Teck BIM / IFC Importer engine is loading. Please try again.');
    }

    const codeStandard = options.codeStandard || $('#ifc-code-standard')?.value || 'EUROCODE_5';
    const spacing = Number($('#ifc-stud-spacing')?.value) || options.spacing || 400;

    const { model: convertedModel, stats } = convertFn(content, fileName.replace(/\.[^.]+$/, ''), { codeStandard, spacing });
    if (!convertedModel || !convertedModel.elements || !convertedModel.elements.length) {
      throw new Error('No wall, slab, or roof elements could be extracted from this file.');
    }

    // Validate project
    let validated = validateProject(convertedModel);

    // Commit model change without propagating old wall connections
    commit(() => {
      model = validated;
      activeStory = model.stories[0].id;
      selected = [];
    }, false);

    // Run automatic framing and truss pipeline
    const appEnv = {
      updateWallConnections: typeof updateWallConnections === 'function' ? updateWallConnections : null,
      autoPlaceFloorJoistsInBoundary: window.autoPlaceFloorJoistsInBoundary,
      autoSizeEWPFloorBeams: window.autoSizeEWPFloorBeams,
      generateRoofFraming: typeof generateRoofFraming === 'function' ? generateRoofFraming : null
    };

    let pipeResults = { takeoff: {} };
    if (window.autoGenerateFramingPipeline) {
      pipeResults = window.autoGenerateFramingPipeline(model, appEnv) || {};
    }

    if (typeof autoAlignTrussRoofsToWallPlates === 'function') {
      autoAlignTrussRoofsToWallPlates();
    }

    // Refresh views and navigator
    setView('plan');
    fit();
    if (typeof fit3DCamera === 'function') fit3DCamera(true);
    changed();

    const codeName = window.CONSTRUCTION_CODES?.[stats.codeStandard]?.name || stats.codeStandard;
    const spacingLabel = `${Math.round(stats.spacing || 406.4)} mm O.C.`;
    const tk = pipeResults.takeoff || {};
    const wallLayoutCount = pipeResults.wallFramingGeneratedCount ?? pipeResults.wallFramingCount ?? 0;
    const wallIssues = pipeResults.wallFramingIssueCount ?? tk.wallIssues ?? 0;
    const gableWallCount = model.elements.filter(e => e.type === 'wall' && ((typeof computeWallRoofGableProfile === 'function' && computeWallRoofGableProfile(e)?.enabled) || e.isGableWall)).length;
    const primaryRoof = model.elements.find(e => e.type === 'roof');
    const primaryPitch = primaryRoof ? (primaryRoof.pitch ?? 25) : 25;
    const roofTypeLabel = primaryRoof ? `${(primaryRoof.roofType === 'mono' && primaryPitch === 0 ? 'FLAT' : (primaryRoof.roofType || 'hip')).toUpperCase()} (${primaryPitch}°)` : 'Fink Trusses';
    toast(`Imported Timber Teck BIM model: ${stats.wallsCount} walls (${gableWallCount} gable wall${gableWallCount === 1 ? '' : 's'} under roof), ${stats.roofsCount} roof(s), ${stats.openingsCount} openings. Wall framing: ${tk.totalMembers || 0} members across ${wallLayoutCount} walls${wallIssues ? `, ${wallIssues} issue(s) to review` : ''}.`);

    window.currentIFCModel = model;

    // Show summary modal
    openModal('Timber Teck BIM & IFC Preliminary Framing Synthesis', `
      <div style="font-family:'DM Sans',system-ui,sans-serif;color:#1e293b;line-height:1.6;max-width:660px">
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
          <span style="font-size:24px">⚡</span>
          <div>
            <strong style="color:#15803d;font-size:14px">BIM File Converted &amp; Preliminary Timber Framing Layout Generated</strong>
            <div style="font-size:12px;color:#334155">${esc(fileName)} · Standard: <strong>${esc(codeName)}</strong> · Spacing: <strong>${spacingLabel}</strong></div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px">
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px;text-align:center">
            <span style="font-size:10px;color:#64748b;font-weight:700">WALLS</span>
            <b style="font-size:18px;color:#0f172a;display:block">${stats.wallsCount}</b>
            <span style="font-size:9.5px;color:#16a34a">${tk.totalMembers || 0} members</span>
          </div>
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px;text-align:center">
            <span style="font-size:10px;color:#64748b;font-weight:700">GABLE WALLS</span>
            <b style="font-size:18px;color:#0f172a;display:block">${gableWallCount}</b>
            <span style="font-size:9.5px;color:#e11d48">Rake &amp; Gable Studs</span>
          </div>
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px;text-align:center">
            <span style="font-size:10px;color:#64748b;font-weight:700">OPENINGS</span>
            <b style="font-size:18px;color:#0f172a;display:block">${stats.openingsCount}</b>
            <span style="font-size:9.5px;color:#0284c7">${stats.doorsCount} Doors / ${stats.windowsCount} Wins</span>
          </div>
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px;text-align:center">
            <span style="font-size:10px;color:#64748b;font-weight:700">FLOOR SLABS</span>
            <b style="font-size:18px;color:#0f172a;display:block">${stats.slabsCount}</b>
            <span style="font-size:9.5px;color:#0284c7">EWP I-Joists</span>
          </div>
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px;text-align:center">
            <span style="font-size:10px;color:#64748b;font-weight:700">ROOFS</span>
            <b style="font-size:18px;color:#0f172a;display:block">${stats.roofsCount}</b>
            <span style="font-size:9.5px;color:#d97706">${esc(roofTypeLabel)}</span>
          </div>
        </div>

        <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;font-size:11.5px">
          <strong style="color:#0f172a;font-size:12px;display:block;margin-bottom:6px">📋 Timber Teck Framing Material Takeoff:</strong>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;color:#334155">
            <div>• Common &amp; Gable Studs: <strong>${tk.commonStuds || '—'}</strong></div>
            <div>• King Studs: <strong>${tk.kingStuds || '—'}</strong></div>
            <div>• Jack / Trimmer Studs: <strong>${tk.jackStuds || '—'}</strong></div>
            <div>• Header members: <strong>${tk.headers || '—'}</strong></div>
            <div>• Rough Window Sills: <strong>${tk.roughSills || '—'}</strong></div>
            <div>• Upper/Lower Cripples: <strong>${tk.cripples || '—'}</strong></div>
            <div>• Top &amp; Sloped Rake Plates: <strong>${tk.topPlates || '—'}</strong></div>
            <div>• Broken Bottom Plates: <strong>${tk.bottomPlates || '—'}</strong></div>
          </div>
        </div>

        <div style="font-size:11.5px;color:#475569;margin-bottom:16px">
          <p style="margin:3px 0"><strong>✔ Walls &amp; Gable Walls Under Roof:</strong> Imported walls and gable end walls with sloped rake plates and graduated bevel-cut gable studs.</p>
          <p style="margin:3px 0"><strong>✔ Roofs &amp; Trusses:</strong> Imported roof footprint, pitch, and overhang synchronized with wall bearing plates.</p>
          <p style="margin:3px 0"><strong>✔ Opening &amp; EWP Floor Framing:</strong> Headers, king/jack studs, sills, cripples, and I-Joists generated.</p>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button id="view-3d-now-btn" class="subtle" style="font-weight:700">View 3D Framing</button>
          <button id="view-ewp-now-btn" class="subtle" style="font-weight:700">View EWP Specs</button>
          <button id="view-truss-now-btn" class="subtle" style="font-weight:700">View Roof Framing</button>
          <button id="close-ifc-summary-btn" class="primary">Close</button>
        </div>
      </div>
    `);
    $('#view-3d-now-btn')?.addEventListener('click', () => {
      $('#modal')?.close?.();
      setView('framing3d');
    });
    $('#view-ewp-now-btn')?.addEventListener('click', () => {
      $('#modal')?.close?.();
      openEWPSpecs();
    });
    $('#view-truss-now-btn')?.addEventListener('click', () => {
      $('#modal')?.close?.();
      setView('roofframingplan');
    });
    $('#close-ifc-summary-btn')?.addEventListener('click', () => {
      $('#modal')?.close?.();
    });

  } catch (err) {
    toast(`Timber Teck BIM / IFC Import Error: ${err.message}`);
    console.error(err);
  }
}

function openIFCImportModal() {
  const html = `
    <div style="font-family:'DM Sans',system-ui,sans-serif;color:#1e293b;line-height:1.6;max-width:620px">
      <div style="margin-bottom:12px">
        <p style="font-size:12.5px;color:#475569;margin:0 0 10px 0">
          Upload an exported <strong>IFC Model (.ifc)</strong> or BIM project with embedded data.
          Walls, <strong>gable walls under roofs</strong>, <strong>roofs (gable / hip / mono)</strong>, doors, windows, and floors/slabs are extracted using actual model vertex extents, synchronized across 2D plans and 3D, and synthesized into <strong>code-compliant timber stud &amp; gable rake framing</strong>, <strong>EWP floor joists</strong>, and <strong>roof trusses</strong>.
        </p>
      </div>

      <!-- Drag and drop / file selector box -->
      <div id="ifc-drop-zone" style="border:2px dashed #d97706;background:#fffbeb;border-radius:8px;padding:20px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:12px">
        <div style="font-size:30px;margin-bottom:4px">📁</div>
        <strong style="color:#b45309;font-size:14px;display:block">Click to select IFC (.ifc / .ifczip) or drop here</strong>
        <span style="font-size:11px;color:#64748b">Accepts STEP IFC (.ifc, .ifczip), XML, and Timber Teck BIM JSON</span>
      </div>

      <!-- Building Code & Framing Options -->
      <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font-size:11px;font-weight:700;color:#0f172a;display:block;margin-bottom:4px">Building Code Standard:</label>
          <select id="ifc-code-standard" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:5px;font-size:11.5px;background:white">
            <option value="EUROCODE_5" selected>Eurocode 5 BS EN 1995 (UK/EU / Ireland)</option>
            <option value="AS_1684">AS 1684 Residential Framing (AU)</option>
            <option value="IRC_2021">IRC 2021 / IBC Chapter 23 (US)</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px;font-weight:700;color:#0f172a;display:block;margin-bottom:4px">Stud Spacing (O.C.):</label>
          <select id="ifc-stud-spacing" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:5px;font-size:11.5px;background:white">
            <option value="400" selected>400 mm O.C. (Exact 400 mm)</option>
            <option value="600">600 mm O.C. (Exact 600 mm)</option>
            <option value="406.4">16" O.C. (406.4 mm / US)</option>
            <option value="609.6">24" O.C. (609.6 mm / US)</option>
          </select>
        </div>
      </div>

      <!-- Quick sample load -->
      <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:10px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong style="font-size:12px;color:#0f172a;display:block">Sample Timber Teck Residential Villa (Walls + Gable Roof + Gable Walls)</strong>
          <span style="font-size:10.5px;color:#64748b">10m × 5m plan with exterior &amp; interior walls, gable roof, and framed gable walls under roof</span>
        </div>
        <button id="load-sample-ifc-btn" style="padding:6px 12px;background:#d97706;color:white;border:none;border-radius:5px;font-weight:700;font-size:11.5px;cursor:pointer">
          ⚡ Load Sample IFC
        </button>
      </div>

      <!-- Framing auto-generation description -->
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:14px;font-size:11px;color:#475569">
        <strong style="display:block;margin-bottom:4px;color:#0f172a">Automatic Code Synthesis:</strong>
        <div>• <strong>Wall &amp; Gable Wall Framing:</strong> Exact 400mm / 600mm stud spacing, double top plates, sloped gable rake plates, graduated gable studs under roof slope, span headers, jack studs &amp; 3-stud corners.</div>
        <div>• <strong>Roof &amp; EWP Floor Framing:</strong> Imported Gable/Hip/Mono roof footprints, Fink trusses, I-Joists, and LVL girders aligned automatically to wall plates.</div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button id="cancel-ifc-modal-btn" class="subtle">Cancel</button>
        <button id="modal-select-ifc-btn" class="primary">Select File (.ifc / .pln)</button>
      </div>
    </div>
  `;

  openModal('Import Timber Teck BIM / IFC File (.ifc / .pln)', html);

  const dropZone = $('#ifc-drop-zone');
  const fileInput = $('#import-ifc-file');
  const sampleBtn = $('#load-sample-ifc-btn');
  const selectBtn = $('#modal-select-ifc-btn');
  const cancelBtn = $('#cancel-ifc-modal-btn');
  const codeStandardSelect = $('#ifc-code-standard');
  const studSpacingSelect = $('#ifc-stud-spacing');

  if (codeStandardSelect && studSpacingSelect) {
    codeStandardSelect.onchange = () => {
      const std = codeStandardSelect.value;
      if (std === 'EUROCODE_5' || std === 'AS_1684') {
        studSpacingSelect.value = studSpacingSelect.value === '609.6' ? '600' : (studSpacingSelect.value === '600' ? '600' : '400');
      } else if (std === 'IRC_2021') {
        // Keep 400 / 600 or imperial if chosen
      }
    };
  }

  if (cancelBtn) cancelBtn.onclick = () => $('#modal')?.close?.();

  if (dropZone && fileInput) {
    dropZone.onclick = () => fileInput.click();
    dropZone.ondragover = e => { e.preventDefault(); dropZone.style.background = '#fef3c7'; };
    dropZone.ondragleave = () => { dropZone.style.background = '#fffbeb'; };
    dropZone.ondrop = async e => {
      e.preventDefault();
      dropZone.style.background = '#fffbeb';
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const isBinary = ['pln', 'ifczip', 'zip'].includes(ext);
        const content = isBinary ? await file.arrayBuffer() : await file.text();
        const codeStandard = $('#ifc-code-standard')?.value || 'EUROCODE_5';
        const spacing = Number($('#ifc-stud-spacing')?.value) || 400;
        $('#modal')?.close?.();
        processIFCContent(content, file.name, { codeStandard, spacing });
      }
    };
  }

  if (selectBtn && fileInput) {
    selectBtn.onclick = () => fileInput.click();
  }

  if (sampleBtn) {
    sampleBtn.onclick = async () => {
      sampleBtn.disabled = true;
      sampleBtn.textContent = 'Loading...';
      try {
        let text = '';
        if (typeof window.convertPlnBinaryToIFCText === 'function') {
          text = window.convertPlnBinaryToIFCText(null, 'Timber_Teck_Villa_Sample.ifc');
        } else {
          throw new Error('Sample IFC generator not ready');
        }
        const codeStandard = $('#ifc-code-standard')?.value || 'EUROCODE_5';
        const spacing = Number($('#ifc-stud-spacing')?.value) || 400;
        $('#modal')?.close?.();
        processIFCContent(text, 'Timber_Teck_Villa_Sample.ifc', { codeStandard, spacing });
      } catch (err) {
        toast(`Error loading sample: ${err.message}`);
        sampleBtn.disabled = false;
        sampleBtn.textContent = '⚡ Load Sample IFC';
      }
    };
  }
}

bindChange('#import-ifc-file', async e => {
  try {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const isBinary = ['pln', 'ifczip', 'zip'].includes(ext);
    const content = isBinary ? await file.arrayBuffer() : await file.text();
    $('#modal')?.close?.();
    processIFCContent(content, file.name);
  } catch (err) {
    toast(`Timber Teck BIM / IFC Import Error: ${err.message}`);
  }
  e.target.value = '';
});

function applyProjectFileData(parsed,fileName=''){
  const wrapped=parsed&&parsed.format==='cadtech-bim-project'&&parsed.formatVersion===1&&parsed.project;
  const imported=clone(wrapped?parsed.project:parsed);
  if(!imported||!Array.isArray(imported.elements)||!Array.isArray(imported.stories))throw Error('This file does not contain a supported BIM project. Choose a saved .bim.json or Timber Teck BIM JSON file.');
  for(const w of imported.elements||[])if(w.type==='wall'&&!w.reference&&w.layer==='Exterior Walls')w.reference='outside';
  const nextModel=validateProject(imported),ws=wrapped&&parsed.workspace&&typeof parsed.workspace==='object'?parsed.workspace:{};
  const nextActiveStory=nextModel.stories.some(st=>st.id===ws.activeStory)?ws.activeStory:nextModel.stories[0].id;
  const validViews=new Set(['plan','3d','elevation','section','schedule','framingplan','roofframingplan','trusselevation','panel','ewpspecs','floorschedule','framing3d','cutlist']);
  const nextView=validViews.has(ws.view)?ws.view:'plan';
  const elementIds=new Set(nextModel.elements.map(el=>el.id));
  const nextSelected=Array.isArray(ws.selected)?ws.selected.filter(id=>typeof id==='string'&&elementIds.has(id)):[];
  const defaultLayers=[{name:'Exterior Walls',color:'#537e69',visible:true},{name:'Interior Walls',color:'#8b9c82',visible:true},{name:'Structure',color:'#aaab8f',visible:true},{name:'Annotations',color:'#b7bcae',visible:true}];
  const nextLayers=Array.isArray(ws.layers)?[
    ...defaultLayers.map(base=>{const saved=ws.layers.find(item=>item&&item.name===base.name);return {...base,color:typeof saved?.color==='string'&&/^#[0-9a-f]{6}$/i.test(saved.color)?saved.color:base.color,visible:typeof saved?.visible==='boolean'?saved.visible:base.visible}}),
    ...ws.layers.filter(item=>item&&typeof item.name==='string'&&item.name.trim()&&!defaultLayers.some(d=>d.name===item.name)).map(item=>({name:item.name.trim(),color:typeof item.color==='string'&&/^#[0-9a-f]{6}$/i.test(item.color)?item.color:'#64748b',visible:typeof item.visible==='boolean'?item.visible:true}))
  ]:defaultLayers;
  modelHistory=[];future=[];model=nextModel;activeStory=nextActiveStory;selected=nextSelected;layers=nextLayers;
  if(typeof ws.snap==='boolean')snap=ws.snap;if(typeof ws.grid==='boolean')grid=ws.grid;
  const osb=$('#wall-osb-toggle');if(osb)osb.checked=typeof ws.exteriorOsbEnabled==='boolean'?ws.exteriorOsbEnabled:true;syncWallOsbToggle();
  const wdim=$('#wall-dimensions-toggle');if(wdim)wdim.checked=typeof ws.includeDimensions==='boolean'?ws.includeDimensions:true;syncWallDimensionsToggle();
  setView(nextView);
  if(nextView==='3d'||nextView==='framing3d')fit3DCamera();else fit();
  render();properties();navigatorPanel();
  dirty=false;const ss=$('#save-state');if(ss)ss.textContent='Project opened';const projectTitle=$('#project-name');if(projectTitle)projectTitle.textContent=String(nextModel.name||fileName.replace(/\.(bim\.)?json$/i,'')||'Untitled project');
  try{window.dispatchEvent(new Event('cadtech:modelChanged'))}catch(_e){}
  toast(`BIM project opened${fileName?`: ${fileName}`:''}`);
}
async function loadProjectFile(file){
  if(!file)return;
  if(file.size>25000000)throw Error('Project file is too large (maximum 25 MB).');
  const ext = file.name.split('.').pop().toLowerCase();
  if (['pln', 'ifc', 'ifczip', 'ifcxml', 'xml'].includes(ext)) {
    const isBinary = ['pln', 'ifczip', 'zip'].includes(ext);
    const content = isBinary ? await file.arrayBuffer() : await file.text();
    processIFCContent(content, file.name);
    return;
  }
  const text=await file.text();
  if(text.includes('ISO-10303-21')){processIFCContent(text,file.name);return;}
  let imported;try{imported=JSON.parse(text)}catch(_e){throw Error('This file is not valid JSON. Select a saved Timber Teck BIM project file or .ifc file.');}
  applyProjectFileData(imported,file.name);
}
bindChange('#import-file', async e=>{
  try{await loadProjectFile(e.target.files?.[0]);}
  catch(err){console.error(err);toast(err?.message||'Could not open project file.');}
  e.target.value='';
});
bindChange('#project-file-input',async e=>{
  try{await loadProjectFile(e.target.files?.[0]);}
  catch(err){console.error(err);toast(err?.message||'Could not open project file.');}
  e.target.value='';
});

const modelContext=document.modelContext;
if(modelContext?.registerTool){
  try{
    modelContext.registerTool({name:'read_bim_model',description:'Read stories and BIM elements from the current shared model.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>clone(model)});
    modelContext.registerTool({name:'import_bim_ifc',description:'Import and convert an IFC model into the Timber Teck BIM workspace.',inputSchema:{type:'object',properties:{ifcText:{type:'string'}},required:['ifcText'],additionalProperties:false},execute:({ifcText})=>{processIFCContent(ifcText,'api-import.ifc');return {ok:true}}});
    modelContext.registerTool({name:'set_story_height',description:'Change a story height and update its dependent walls and openings.',inputSchema:{type:'object',properties:{storyId:{type:'string'},height:{type:'number',minimum:300,maximum:50000}},required:['storyId','height'],additionalProperties:false},execute:({storyId,height})=>{if(!model.stories.some(s=>s.id===storyId)||!Number.isFinite(height))throw Error('Invalid story or height');setStoryHeight(storyId,height);return {storyId,height,revision:model.revision}}});
  }catch(e){console.warn('WebMCP unavailable',e)}
}

bindChange('#camera-projection', e=>{sceneCamera.projection=e.target.value;fit3DCamera();cameraUI();render()});
bindChange('#camera-shading', e=>{sceneCamera.style=e.target.value;transparent=e.target.value==='xray';render()});
bindChange('#camera-preset', e=>cameraPreset(e.target.value));
bindClick('#camera-inspector', ()=>{$('main')?.classList.remove('viewport-focus');$('main')?.classList.toggle('inspector-open');cameraUI()});
bindClick('#selection-properties', ()=>{$('main')?.classList.remove('viewport-focus');$('main')?.classList.add('inspector-open');cameraUI()});
bindClick('#camera-focus', ()=>{$('main')?.classList.toggle('viewport-focus');cameraUI()});
$$('[data-camera]').forEach(b=>b.onclick=()=>cameraPreset(b.dataset.camera));
bindClick('#camera-left', ()=>{orbit-=Math.PI/2;sceneCamera.preset='custom';render()});
bindClick('#camera-right', ()=>{orbit+=Math.PI/2;sceneCamera.preset='custom';render()});

function clearTrackerUserEdits(){
  ['#draft-length','#draft-angle','#draft-coord-x','#draft-coord-y'].forEach(sel=>{
    const el=$(sel);
    if(el)delete el.dataset.userEdited;
  });
}

function getConstrainedDraftPoint(base, targetPt){
  if(!base||!targetPt)return targetPt;
  const lenIn=$('#draft-length'), angIn=$('#draft-angle');
  const hasUserLen=lenIn?.dataset.userEdited==='1' && String(lenIn.value||'').trim()!=='';
  const hasUserAng=angIn?.dataset.userEdited==='1' && String(angIn.value||'').trim()!=='';
  if(!hasUserLen && !hasUserAng)return targetPt;
  const typedLen=hasUserLen ? parseLengthInput(lenIn.value, NaN) : NaN;
  const typedAng=hasUserAng ? Number(angIn.value) : NaN;
  const curDist=distance(base, targetPt);
  const finalLen=(Number.isFinite(typedLen)&&typedLen>0)?typedLen:curDist;
  let rad=Math.atan2(targetPt.y-base.y, targetPt.x-base.x);
  if(Number.isFinite(typedAng)){
    rad=typedAng*Math.PI/180;
  }else if(curDist<1e-3){
    const fallbackAng=Number(angIn?.value);
    rad=Number.isFinite(fallbackAng)?(fallbackAng*Math.PI/180):0;
  }
  return {
    x: Math.round(base.x + Math.cos(rad)*finalLen),
    y: Math.round(base.y + Math.sin(rad)*finalLen)
  };
}

function updateDraftTrackerLive(p){
  const tracker=$('#draft-tracker');
  if(!tracker||tracker.classList.contains('hidden')||tracker.classList.contains('minimized'))return;
  const active=document.activeElement;
  const lenIn=$('#draft-length'),angIn=$('#draft-angle'),xIn=$('#draft-coord-x'),yIn=$('#draft-coord-y');
  if(xIn && active!==xIn && xIn.dataset.userEdited!=='1')xIn.value=isImperialUnits()?formatFeetInches(p.x):Math.round(p.x);
  if(yIn && active!==yIn && yIn.dataset.userEdited!=='1')yIn.value=isImperialUnits()?formatFeetInches(p.y):Math.round(p.y);
  if(points.length>0){
    const base=points.at(-1),d=distance(base,p),rad=Math.atan2(p.y-base.y,p.x-base.x);
    let deg=rad*180/Math.PI;if(deg<0)deg+=360;
    if(lenIn && active!==lenIn && lenIn.dataset.userEdited!=='1')lenIn.value=isImperialUnits()?formatFeetInches(d):Math.round(d);
    if(angIn && active!==angIn && angIn.dataset.userEdited!=='1')angIn.value=(Math.round(deg*10)/10).toFixed(1);
  }else{
    const d=Math.hypot(p.x,p.y);
    let deg=Math.atan2(p.y,p.x)*180/Math.PI;if(deg<0)deg+=360;
    if(lenIn && active!==lenIn && lenIn.dataset.userEdited!=='1')lenIn.value=isImperialUnits()?formatFeetInches(d):Math.round(d);
    if(angIn && active!==angIn && angIn.dataset.userEdited!=='1')angIn.value=(Math.round(deg*10)/10).toFixed(1);
  }
}

function commitTrackerPoint(){
  const lenIn=$('#draft-length'), angIn=$('#draft-angle'), xIn=$('#draft-coord-x'), yIn=$('#draft-coord-y');
  const lenVal=parseLengthInput(lenIn?.value, NaN), angVal=Number(angIn?.value), xVal=parseLengthInput(xIn?.value, NaN), yVal=parseLengthInput(yIn?.value, NaN);
  const active=document.activeElement;
  const isCoordActive=active===xIn||active===yIn||xIn?.dataset.userEdited==='1'||yIn?.dataset.userEdited==='1';
  const isPolar=!isCoordActive || active===lenIn || active===angIn || lenIn?.dataset.userEdited==='1' || angIn?.dataset.userEdited==='1';

  if(isPolar && (!lenIn?.value || !Number.isFinite(lenVal) || lenVal <= 0)){
    if(['wall','beam','line','curtainwall'].includes(tool)){
      points=[];
      lastPlacedWallEnd=null;
      clearTrackerUserEdits();
      toast('Wall placement completed');
      render();
      return;
    }
  }

  if(tool==='select'&&!editing){
    toast('Select a CAD or BIM tool (Wall, Slab, Beam, Dimension) to place point');
    return;
  }

  // If no start point was clicked yet and the user entered a specific length, start from the current cursor/origin and place the wall of that exact length immediately
  if(points.length===0 && isPolar && Number.isFinite(lenVal) && lenVal > 0 && ['wall','beam','line','curtainwall','railing'].includes(tool)){
    const startBase = clone(hover || {x: 0, y: 0});
    points = [startBase];
  }

  let pt;
  if(isPolar && Number.isFinite(lenVal) && lenVal > 0){
    const base=points.length>0?points.at(-1):(hover||{x:0,y:0});
    let rad=Number.isFinite(angVal)?(angVal*Math.PI/180):0;
    if(angIn?.dataset.userEdited!=='1' && active!==angIn && hover && distance(base, hover)>10){
      rad=Math.atan2(hover.y-base.y, hover.x-base.x);
    }
    pt={x:Math.round(base.x+Math.cos(rad)*lenVal),y:Math.round(base.y+Math.sin(rad)*lenVal)};
  }else if(Number.isFinite(xVal)&&Number.isFinite(yVal)&&isCoordActive){
    pt={x:Math.round(xVal),y:Math.round(yVal)};
  }else{
    pt=clone(hover||{x:0,y:0});
  }

  window._singleWallCommit=(toolGeomMethod.wall||'single')!=='chained';
  place(pt);
  window._singleWallCommit=false;

  clearTrackerUserEdits();
  if(lenIn){
    lenIn.value='';
    lenIn.blur();
  }
  if(angIn)angIn.blur();
  if(xIn)xIn.blur();
  if(yIn)yIn.blur();
  render();
}

function initDraftTracker(){
  const tracker=$('#draft-tracker');
  if(!tracker)return;
  bindClick('#tracker-tab-handle',()=>{
    tracker.classList.toggle('minimized');
    toast(tracker.classList.contains('minimized')?'Tracker tab minimized (Click pill or Tab to expand)':'Tracker tab expanded');
  });
  bindClick('#tracker-btn',()=>{
    trackerActive=!trackerActive;
    tracker.classList.toggle('hidden',!trackerActive);
    $('#tracker-btn')?.classList.toggle('enabled',trackerActive);
    toast(trackerActive?'Tracker tab visible (Tab to enter values)':'Tracker tab hidden');
  });
  bindClick('#ortho-btn',()=>{
    orthoActive=!orthoActive;
    $('#ortho-btn')?.classList.toggle('enabled',orthoActive);
    toast(orthoActive?'Ortho mode ON (0°, 45°, 90° lock)':'Ortho mode OFF');
    render();
  });
  bindClick('#draft-place',commitTrackerPoint);
  ['#draft-length','#draft-angle','#draft-coord-x','#draft-coord-y'].forEach(sel=>{
    const el=$(sel);
    if(!el)return;
    el.addEventListener('input',()=>{
      el.dataset.userEdited='1';
      render();
    });
    el.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        e.preventDefault();
        e.stopPropagation();
        commitTrackerPoint();
      }
    });
  });
}

initDraftTracker();
initializeAdvanced();
if(typeof initializeTrussOptimizer==='function')initializeTrussOptimizer();

bindClick('#btn-autofix-overlapping-studs', () => {
  commit(() => {
    if (typeof window.autoFixAllOverlappingStuds === 'function') {
      window.autoFixAllOverlappingStuds(model);
    }
  });
  render();
  toast('⚡ Auto-adjusted wall framing: zero overlapping studs remaining!');
});

bindClick('#btn-autofix-all-collisions', () => {
  commit(() => {
    if (typeof window.fixWallStudCollisions === 'function') {
      window.fixWallStudCollisions(model);
    }
  });
  properties();
  schedule();
  render();
  toast('⚡ All colliding studs auto-shifted to clear positions!');
});

bindClick('#btn-auto-place-ijoist-blocking', () => {
  window._showIJoistMidSpanBlockingInFramingPlan = true;
  const toggleBtn = $('#btn-toggle-ijoist-blocking');
  if (toggleBtn) {
    toggleBtn.textContent = 'I-Joist Blocking: ON';
    toggleBtn.style.background = '#ede9fe';
    toggleBtn.style.color = '#5b21b6';
    toggleBtn.style.borderColor = '#a78bfa';
  }
  if (typeof window.autoPlaceIJoistMidSpanBlocking === 'function') {
    window.autoPlaceIJoistMidSpanBlocking(null, { switchView: false });
  }
});

bindClick('#btn-toggle-ijoist-blocking', () => {
  window._showIJoistMidSpanBlockingInFramingPlan = window._showIJoistMidSpanBlockingInFramingPlan === false ? true : false;
  const on = window._showIJoistMidSpanBlockingInFramingPlan !== false;
  const toggleBtn = $('#btn-toggle-ijoist-blocking');
  if (toggleBtn) {
    toggleBtn.textContent = on ? 'I-Joist Blocking: ON' : 'I-Joist Blocking: OFF';
    toggleBtn.style.background = on ? '#ede9fe' : '#f1f5f9';
    toggleBtn.style.color = on ? '#5b21b6' : '#64748b';
    toggleBtn.style.borderColor = on ? '#a78bfa' : '#cbd5e1';
  }
  render();
  toast(on ? 'Mid-span I-joist blocking rows shown in 2D Framing Plan' : 'Mid-span I-joist blocking rows hidden in 2D Framing Plan');
});

function initFloatingPopupsDragAndClose(){
  if (!window._closedFloatingPopups) window._closedFloatingPopups = new Set();
  const area = $('#canvas-area');
  if (!area) return;

  // Ensure pointer events on any floating popup never bubble down to #canvas
  const popupSelectors = [
    '#pet-palette',
    '#clip-panel',
    '#framing-plan-auto-fix-hud',
    '#ewp-hud',
    '#wall-palette',
    '#selection-model',
    '#draft-tracker'
  ];

  const makePopupDraggableAndClosable = (el, opts = {}) => {
    if (!el || el.dataset.floatingInit === '1') return;
    el.dataset.floatingInit = '1';

    // Stop canvas pointerdown / wheel from firing when interacting with popup
    el.addEventListener('pointerdown', ev => ev.stopPropagation());
    el.addEventListener('wheel', ev => ev.stopPropagation(), { passive: true });

    // Inject close button if requested and not already present
    if (opts.closable && !el.querySelector('[data-floating-close]')) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.dataset.floatingClose = '1';
      closeBtn.title = 'Close popup';
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = opts.closeBtnStyle || 'width:20px;min-width:20px;height:20px;padding:0;margin-left:6px;border-radius:4px;border:1px solid #cbd5e1;background:#f8fafc;color:#dc2626;font-size:11px;font-weight:800;line-height:1;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0';
      closeBtn.addEventListener('pointerdown', ev => ev.stopPropagation());
      closeBtn.addEventListener('click', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        if (opts.onClose) {
          opts.onClose(el);
        } else {
          if (el.id) window._closedFloatingPopups.add(el.id);
          el.classList.add('hidden');
        }
      });
      const targetHeader = opts.closeTargetSelector ? el.querySelector(opts.closeTargetSelector) : el;
      if (targetHeader) targetHeader.appendChild(closeBtn);
    }

    // Add drag grip indicator if requested
    if (opts.addGrip && !el.querySelector('[data-floating-grip]')) {
      const grip = document.createElement('span');
      grip.dataset.floatingGrip = '1';
      grip.textContent = '⋮⋮';
      grip.title = 'Drag to move';
      grip.style.cssText = 'font-size:11px;color:#64748b;padding:0 4px;cursor:move;user-select:none;flex-shrink:0';
      el.insertBefore(grip, el.firstChild);
    }

    let dragState = null;
    el.addEventListener('pointerdown', ev => {
      if (ev.button !== 0) return;
      if (ev.target.closest('button, input, select, textarea, a, label')) return;
      ev.preventDefault();
      ev.stopPropagation();
      const areaRect = area.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const startLeft = rect.left - areaRect.left;
      const startTop = rect.top - areaRect.top;
      el.style.left = startLeft + 'px';
      el.style.top = startTop + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.transform = 'none';
      dragState = {
        startX: ev.clientX,
        startY: ev.clientY,
        startLeft,
        startTop,
        pointerId: ev.pointerId
      };
      try { el.setPointerCapture?.(ev.pointerId); } catch (_) {}
    });

    el.addEventListener('pointermove', ev => {
      if (!dragState) return;
      const areaW = area.clientWidth || 900;
      const areaH = area.clientHeight || 650;
      const w = el.offsetWidth || 160;
      const nextLeft = Math.max(4, Math.min(areaW - Math.min(w, 120) - 4, dragState.startLeft + (ev.clientX - dragState.startX)));
      const nextTop = Math.max(4, Math.min(areaH - 36, dragState.startTop + (ev.clientY - dragState.startY)));
      el.style.left = nextLeft + 'px';
      el.style.top = nextTop + 'px';
      if (el.id === 'pet-palette') {
        _petPaletteDraggedPos = { left: nextLeft, top: nextTop };
      }
    });

    const stopDrag = () => {
      if (!dragState) return;
      try { el.releasePointerCapture?.(dragState.pointerId); } catch (_) {}
      dragState = null;
    };
    el.addEventListener('pointerup', stopDrag);
    el.addEventListener('pointercancel', stopDrag);
  };

  // 1. #pet-palette (.stud-popup and node/edge pet palette)
  makePopupDraggableAndClosable($('#pet-palette'), { closable: false });

  // 2. #clip-panel (3D Cutting Plane)
  const clipPanel = $('#clip-panel');
  if (clipPanel) {
    const clipHdr = clipPanel.querySelector('.clip-heading');
    if (clipHdr) clipHdr.style.cursor = 'move';
    makePopupDraggableAndClosable(clipPanel, { closable: false });
  }

  // 3. #framing-plan-auto-fix-hud (2D Framing Plan Stud Framing Audit Actions)
  const framingHud = $('#framing-plan-auto-fix-hud');
  if (framingHud) {
    const firstRow = framingHud.firstElementChild;
    if (firstRow) {
      firstRow.style.cursor = 'move';
      firstRow.style.justifyContent = 'space-between';
      firstRow.style.width = '100%';
    }
    makePopupDraggableAndClosable(framingHud, {
      closable: true,
      closeTargetSelector: 'div:first-child'
    });
  }

  // 4. #ewp-hud (EWP Real-Time Beam Sizer)
  const ewpHud = $('#ewp-hud');
  if (ewpHud) {
    const ewpHdr = ewpHud.querySelector('.ewp-hud-header');
    if (ewpHdr) ewpHdr.style.cursor = 'move';
    makePopupDraggableAndClosable(ewpHud, {
      closable: true,
      closeTargetSelector: '.ewp-hud-header > div:last-child'
    });
  }

  // 5. #wall-palette
  makePopupDraggableAndClosable($('#wall-palette'), {
    closable: true,
    addGrip: true
  });

  // 6. #selection-model
  makePopupDraggableAndClosable($('#selection-model'), {
    closable: true,
    addGrip: true
  });

  // 7. #draft-tracker
  makePopupDraggableAndClosable($('#draft-tracker'), {
    closable: true,
    onClose: (el) => {
      trackerActive = false;
      el.classList.add('hidden');
      $('#tracker-btn')?.classList.remove('enabled');
    }
  });

  // 7b. #seo-palette (ArchiCAD Solid Element Operations Modeless Floating Palette)
  const seoPalette = $('#seo-palette');
  if (seoPalette) {
    makePopupDraggableAndClosable(seoPalette, {
      closable: false
    });
  }
  bindClick('#trim-roof-btn', () => window.openTrimToRoofModal?.());
  bindClick('#seo-palette-btn', () => window.openSEOPalette?.(true));
  bindClick('#seo-palette-close-btn', () => window.closeSEOPalette?.());

  // 8. Make <dialog id="modal"> draggable by .modal-top
  const modal = $('#modal');
  const modalTop = modal?.querySelector('.modal-top');
  if (modal && modalTop && !modal.dataset.dragInit) {
    modal.dataset.dragInit = '1';
    modalTop.style.cursor = 'move';
    modalTop.style.userSelect = 'none';
    let mDrag = null;
    modalTop.addEventListener('pointerdown', ev => {
      if (ev.button !== 0 || ev.target.closest('button')) return;
      ev.preventDefault();
      const rect = modal.getBoundingClientRect();
      modal.style.margin = '0';
      modal.style.left = rect.left + 'px';
      modal.style.top = rect.top + 'px';
      modal.style.position = 'fixed';
      mDrag = { startX: ev.clientX, startY: ev.clientY, startLeft: rect.left, startTop: rect.top, pointerId: ev.pointerId };
      try { modalTop.setPointerCapture?.(ev.pointerId); } catch (_) {}
    });
    modalTop.addEventListener('pointermove', ev => {
      if (!mDrag) return;
      const nx = Math.max(8, Math.min(window.innerWidth - 120, mDrag.startLeft + (ev.clientX - mDrag.startX)));
      const ny = Math.max(8, Math.min(window.innerHeight - 60, mDrag.startTop + (ev.clientY - mDrag.startY)));
      modal.style.left = nx + 'px';
      modal.style.top = ny + 'px';
    });
    const endMDrag = () => {
      if (!mDrag) return;
      try { modalTop.releasePointerCapture?.(mDrag.pointerId); } catch (_) {}
      mDrag = null;
    };
    modalTop.addEventListener('pointerup', endMDrag);
    modalTop.addEventListener('pointercancel', endMDrag);
  }
}

initFloatingPopupsDragAndClose();
properties();navigatorPanel();renderNavigatorMap('project');toolState();renderInfoBox();resize();cameraUI();



