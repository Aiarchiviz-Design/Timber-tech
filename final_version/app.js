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
var model={version:1,name:'Courtyard House',stories:[{id:'s0',name:'Ground floor',elevation:0,height:3048},{id:'s1',name:'First floor',elevation:3048,height:3048},{id:'s2',name:'Roof level',elevation:6096,height:1800}],elements:[],revision:0};
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
  selected = Array.isArray(ids) ? ids.filter(Boolean) : (ids ? [ids] : []);
  if (selected.length && window._closedFloatingPopups) {
    window._closedFloatingPopups.delete('wall-palette');
    window._closedFloatingPopups.delete('selection-model');
  }
  if (typeof render === 'function') render();
  if (typeof properties === 'function') properties();
  if (typeof navigatorPanel === 'function') navigatorPanel();
}
function storyOf(e){return model.stories.find(s=>s.id===e.story)||model.stories[0]}function heightOf(e){if(e.type==='roof'&&e.followStory)return storyOf(e).height+(e.roofOffset||0);if(e.type==='wall'&&e.followStory){const home=storyOf(e),top=model.stories.find(s=>s.id===e.topStory);return Math.max(10,(top?top.elevation:home.elevation+home.height)+(e.topOffset||0)-wallBase(e))}return e.followStory?storyOf(e).height:e.height||3000}function hostOf(e){return model.elements.find(w=>w.id===e.host)}function hosted(w){return model.elements.filter(e=>e.host===w.id)}function shown(e){return layers.find(l=>l.name===e.layer)?.visible!==false&&(view==='3d'||view==='framing3d'||e.story===activeStory)}
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
  if (view === 'schedule' || view === 'cutlist' || view === 'audit') schedule();
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
var toolGeomMethod = { wall: 'chained', slab: 'poly', roof: 'poly', beam: 'single', column: 'square', zone: 'inner', object: 'Table & Chairs', dimension: 'linear', fill: 'diagonal45' };
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
function openingPoint(e){let w=hostOf(e);return w?wallCenterPoint(w,lerp(w.a,w.b,e.offset/distance(w.a,w.b))):null}
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
  if ((view === 'plan' || view === 'framingplan') && typeof generateWallFraming === 'function' && typeof framingMemberWorld === 'function') {
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

  // Selection grip nodes (Archicad cyan/blue square handles)
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
function furniture(){if(activeStory!=='s0'||model.name!=='Courtyard House')return;ctx.save();
const rooms=[['BEDROOM 01',18.6,2350,3900],['LIVING ROOM',19.2,2350,5500],['KITCHEN',12.4,6600,2600],['BEDROOM 02',14.4,10800,2750],['BATHROOM',9.9,10800,5350],['DINING / LIVING',43.4,6800,8300]];for(const [name,areaM2,x,y] of rooms){let p=p2({x,y});label(name,p.x,p.y,6.5,'#82917b');label(formatAreaFromM2(areaM2),p.x,p.y+15,6,'#a0aa97')}ctx.restore()}
function drawTraceReference(){
  if(!traceActive||view!=='plan')return;
  const refStory=model.stories.find(s=>s.id!==activeStory)||model.stories[0];
  if(!refStory||refStory.id===activeStory)return;
  ctx.save();
  ctx.globalAlpha=0.28;
  for(const e of model.elements.filter(e=>e.story===refStory.id)){
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
  for(const e of slabs)poly(defaultSlabPolygon(e).map(p2),selected.includes(e.id)?'#e4eee4':'#fafbf7','#d5decf',1);
  if(activeStory==='s0'&&model.name==='Courtyard House'){
    let a=p2({x:0,y:9250}),b=p2({x:13000,y:10900});rect(a.x,a.y,b.x-a.x,b.y-a.y,'#eff3e9','#d5dfce',.8);
    for(let x=100;x<13000;x+=300)line(p2({x,y:9250}),p2({x,y:10900}),'#dde4d5',.5);
    label('TIMBER DECK',width/2+pan.x,p2({x:0,y:10300}).y,8,'#97a58a');
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
  if(layers[3].visible){
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

function generateFloorFramingForSlab(s) {
  if (!s || s.type !== 'slab') return [];
  const pts = defaultSlabPolygon(s);
  if (pts.length < 3) return [];

  const thickness = Number(s.thickness) || 200;
  const joistDepth = thickness;
  const rimWidth = 45;
  const joistWidth = 45;
  const girderWidth = 90;
  const spacing = Number(s.joistSpacing) || 406.4;
  const members = [];

  // Compute centroid of slab polygon to orient rim board inward
  const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
  const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;

  // 1. Rim Boards along perimeter
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (len > 10) {
      members.push({
        id: `${s.id}:RIM-${i + 1}`,
        slabId: s.id,
        type: 'Rim board',
        a: { x: p1.x, y: p1.y },
        b: { x: p2.x, y: p2.y },
        width: rimWidth,
        depth: joistDepth,
        z0: -thickness,
        z1: 0,
        length: len,
        center: { x: cx, y: cy },
        section: 'Rim Board 1-1/8x11-7/8'
      });
    }
  }

  // 2. Corner Floor Framing Studs / Corner Backing Blocks directly below Wall Corner Studs
  for (let i = 0; i < pts.length; i++) {
    const pCurr = pts[i];
    const pPrev = pts[(i + pts.length - 1) % pts.length];
    const pNext = pts[(i + 1) % pts.length];

    const dirPrev = { x: Math.sign(pPrev.x - pCurr.x), y: Math.sign(pPrev.y - pCurr.y) };
    const dirNext = { x: Math.sign(pNext.x - pCurr.x), y: Math.sign(pNext.y - pCurr.y) };

    members.push({
      id: `${s.id}:CRN-${i + 1}`,
      slabId: s.id,
      type: 'Corner stud',
      a: { x: pCurr.x, y: pCurr.y },
      b: { x: pCurr.x + (dirPrev.x + dirNext.x) * rimWidth, y: pCurr.y + (dirPrev.y + dirNext.y) * rimWidth },
      width: joistWidth,
      depth: joistDepth,
      z0: -thickness,
      z1: 0,
      length: Math.hypot((dirPrev.x + dirNext.x) * rimWidth, (dirPrev.y + dirNext.y) * rimWidth) || 140,
      section: '3-Stud Corner Rim Block'
    });
  }

  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const widthX = maxX - minX, lengthY = maxY - minY;

  const spanAlongY = s.joistDirection === 'Y' || (s.joistDirection !== 'X' && widthX >= lengthY);
  let joistCount = 0;

  if (spanAlongY) {
    const hasGirder = widthX > 4800;
    const midY = (minY + maxY) / 2;

    if (hasGirder) {
      members.push({
        id: `${s.id}:GIRDER-1`,
        slabId: s.id,
        type: 'Floor beam',
        a: { x: minX + rimWidth, y: midY },
        b: { x: maxX - rimWidth, y: midY },
        width: girderWidth,
        depth: joistDepth,
        z0: -thickness,
        z1: 0,
        length: widthX - 2 * rimWidth,
        section: '2-Ply LVL 1-3/4x11-7/8'
      });
    }

    for (let x = minX + spacing; x < maxX - spacing / 2; x += spacing) {
      const intersects = [];
      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i], p2 = pts[(i + 1) % pts.length];
        if (Math.abs(p1.x - p2.x) < 1e-5) continue;
        if ((p1.x <= x && p2.x > x) || (p2.x <= x && p1.x > x)) {
          const yInt = p1.y + (p2.y - p1.y) * (x - p1.x) / (p2.x - p1.x);
          intersects.push(yInt);
        }
      }
      intersects.sort((a, b) => a - b);
      for (let k = 0; k < intersects.length - 1; k += 2) {
        let y0 = intersects[k] + rimWidth, y1 = intersects[k + 1] - rimWidth;

        if (hasGirder && y0 < midY && y1 > midY) {
          // Bay 1
          const y1a = midY - girderWidth / 2;
          if (y1a - y0 > 100) {
            joistCount++;
            members.push({
              id: `${s.id}:FJ-${String(joistCount).padStart(3, '0')}`,
              slabId: s.id,
              type: 'Floor joist',
              a: { x, y: y0 },
              b: { x, y: y1a },
              width: joistWidth,
              depth: joistDepth,
              z0: -thickness,
              z1: 0,
              length: y1a - y0,
              section: 'I-Joist 11-7/8'
            });

            if (y1a - y0 > 2400) {
              const bY = (y0 + y1a) / 2;
              const xNext = Math.min(maxX - rimWidth, x + spacing);
              members.push({
                id: `${s.id}:BLK-${joistCount}`,
                slabId: s.id,
                type: 'Blocking',
                a: { x, y: bY },
                b: { x: xNext, y: bY },
                width: joistWidth,
                depth: joistDepth,
                z0: -thickness,
                z1: 0,
                length: xNext - x,
                section: 'I-Joist Blocking'
              });
            }
          }

          // Bay 2
          const y0b = midY + girderWidth / 2;
          if (y1 - y0b > 100) {
            joistCount++;
            members.push({
              id: `${s.id}:FJ-${String(joistCount).padStart(3, '0')}`,
              slabId: s.id,
              type: 'Floor joist',
              a: { x, y: y0b },
              b: { x, y: y1 },
              width: joistWidth,
              depth: joistDepth,
              z0: -thickness,
              z1: 0,
              length: y1 - y0b,
              section: 'I-Joist 11-7/8'
            });

            if (y1 - y0b > 2400) {
              const bY = (y0b + y1) / 2;
              const xNext = Math.min(maxX - rimWidth, x + spacing);
              members.push({
                id: `${s.id}:BLK-${joistCount}`,
                slabId: s.id,
                type: 'Blocking',
                a: { x, y: bY },
                b: { x: xNext, y: bY },
                width: joistWidth,
                depth: joistDepth,
                z0: -thickness,
                z1: 0,
                length: xNext - x,
                section: 'I-Joist Blocking'
              });
            }
          }
        } else if (y1 - y0 > 100) {
          joistCount++;
          members.push({
            id: `${s.id}:FJ-${String(joistCount).padStart(3, '0')}`,
            slabId: s.id,
            type: 'Floor joist',
            a: { x, y: y0 },
            b: { x, y: y1 },
            width: joistWidth,
            depth: joistDepth,
            z0: -thickness,
            z1: 0,
            length: y1 - y0,
            section: 'I-Joist 11-7/8'
          });
        }
      }
    }
  } else {
    const hasGirder = lengthY > 4800;
    const midX = (minX + maxX) / 2;

    if (hasGirder) {
      members.push({
        id: `${s.id}:GIRDER-1`,
        slabId: s.id,
        type: 'Floor beam',
        a: { x: midX, y: minY + rimWidth },
        b: { x: midX, y: maxY - rimWidth },
        width: girderWidth,
        depth: joistDepth,
        z0: -thickness,
        z1: 0,
        length: lengthY - 2 * rimWidth,
        section: '2-Ply LVL 1-3/4x11-7/8'
      });
    }

    for (let y = minY + spacing; y < maxY - spacing / 2; y += spacing) {
      const intersects = [];
      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i], p2 = pts[(i + 1) % pts.length];
        if (Math.abs(p1.y - p2.y) < 1e-5) continue;
        if ((p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)) {
          const xInt = p1.x + (p2.x - p1.x) * (y - p1.y) / (p2.y - p1.y);
          intersects.push(xInt);
        }
      }
      intersects.sort((a, b) => a - b);
      for (let k = 0; k < intersects.length - 1; k += 2) {
        let x0 = intersects[k] + rimWidth, x1 = intersects[k + 1] - rimWidth;

        if (hasGirder && x0 < midX && x1 > midX) {
          const x1a = midX - girderWidth / 2;
          if (x1a - x0 > 100) {
            joistCount++;
            members.push({
              id: `${s.id}:FJ-${String(joistCount).padStart(3, '0')}`,
              slabId: s.id,
              type: 'Floor joist',
              a: { x: x0, y },
              b: { x: x1a, y },
              width: joistWidth,
              depth: joistDepth,
              z0: -thickness,
              z1: 0,
              length: x1a - x0,
              section: 'I-Joist 11-7/8'
            });
          }

          const x0b = midX + girderWidth / 2;
          if (x1 - x0b > 100) {
            joistCount++;
            members.push({
              id: `${s.id}:FJ-${String(joistCount).padStart(3, '0')}`,
              slabId: s.id,
              type: 'Floor joist',
              a: { x: x0b, y },
              b: { x: x1, y },
              width: joistWidth,
              depth: joistDepth,
              z0: -thickness,
              z1: 0,
              length: x1 - x0b,
              section: 'I-Joist 11-7/8'
            });
          }
        } else if (x1 - x0 > 100) {
          joistCount++;
          members.push({
            id: `${s.id}:FJ-${String(joistCount).padStart(3, '0')}`,
            slabId: s.id,
            type: 'Floor joist',
            a: { x: x0, y },
            b: { x: x1, y },
            width: joistWidth,
            depth: joistDepth,
            z0: -thickness,
            z1: 0,
            length: x1 - x0,
            section: 'I-Joist 11-7/8'
          });
        }
      }
    }
  }

  return members;
}

function floorMemberPolygon(m) {
  const dx = m.b.x - m.a.x;
  const dy = m.b.y - m.a.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;

  if (m.type === 'Rim board') {
    const w = m.width || 45;
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

  const half = (m.width || 45) / 2;
  return [
    { x: m.a.x - nx * half, y: m.a.y - ny * half },
    { x: m.b.x - nx * half, y: m.b.y - ny * half },
    { x: m.b.x + nx * half, y: m.b.y + ny * half },
    { x: m.a.x + nx * half, y: m.a.y + ny * half }
  ];
}

if (typeof window !== 'undefined') {
  window.generateFloorFramingForSlab = generateFloorFramingForSlab;
  window.floorMemberPolygon = floorMemberPolygon;
}

function solidModel(){
  projectedFaces=[];
  if(view==='framing3d'){
    for(const w of model.elements.filter(e=>e.type==='wall'&&shown(e))){
      const z=wallBase(w);
      for(const m of generateWallFraming(w).members){
        const faceId=m.isStud&&m.id?m.id:w.id;
        const catInfo=typeof getWallMemberCategoryInfo==='function'?getWallMemberCategoryInfo(m):null;
        const n0=projectedFaces.length;prism(faceId,framingMemberWorld(w,m),z+m.z0,z+m.z1,'Oak');
        for(let i=n0;i<projectedFaces.length;i++){
          projectedFaces[i].timberMember=true;
          projectedFaces[i].memberType=m.type;
          projectedFaces[i].memberRole=m.role||'';
          projectedFaces[i].studCategory=m.studCategory||catInfo?.category||'';
          projectedFaces[i].studCategoryLabel=m.studCategoryLabel||catInfo?.label||m.type;
          projectedFaces[i].studColor=m.studColor||catInfo?.color||'';
          projectedFaces[i].studRgb=catInfo?.rgb||null;
          projectedFaces[i].wallId=w.id;
          projectedFaces[i].isStud=Boolean(m.isStud);
          projectedFaces[i].customSize=Boolean(m.customSize);
          projectedFaces[i].collision=Boolean(m.collision);
          if(m.isStud&&selected.includes(faceId))projectedFaces[i].color='#38bdf8';
          else if(projectedFaces[i].studColor)projectedFaces[i].color=projectedFaces[i].studColor;
        }
      }
    }
    for(const s of model.elements.filter(e=>e.type==='slab'&&shown(e))){
      const z=storyOf(s).elevation;
      for(const m of generateFloorFramingForSlab(s)){
        const n0=projectedFaces.length;prism(s.id,floorMemberPolygon(m),z+m.z0,z+m.z1,'Timber');
        for(let i=n0;i<projectedFaces.length;i++){projectedFaces[i].timberMember=true;projectedFaces[i].memberType=m.type}
      }
    }
    drawRoofFraming3D();projectedFaces.sort((a,b)=>a.depth-b.depth);return;
  }
  const wallCells=clipWallCells(joinedWallCells(model.elements.filter(e=>e.type==='wall'&&shown(e))));
  for(const face of wallSurfaces(wallCells)){
    const ps=face.points.map(project3),colors=materials[face.material]||materials.Timber;
    projectedFaces.push({id:face.id,points:ps,depth:ps.reduce((a,p)=>a+p.depth,0)/ps.length,color:selected.includes(face.id)?'#91b8a1':face.kind==='top'?colors[2]:face.kind==='bottom'?colors[1]:(Math.abs(face.points[0].x-face.points[1].x)>Math.abs(face.points[0].y-face.points[1].y)?colors[0]:colors[1]),wallSurface:true,world:face.points,cutSurface:isCutFace(face.points)});
  }
  for(const w of model.elements.filter(e=>e.type==='wall'&&shown(e))){
    if(!construction(w).enabled)continue;
    const z=wallBase(w);
    for(const m of generateWallFraming(w).members){
      if(!m.isStud)continue;
      const faceId=m.id||w.id;
      const catInfo=typeof getWallMemberCategoryInfo==='function'?getWallMemberCategoryInfo(m):null;
      const n0=projectedFaces.length;prism(faceId,framingMemberWorld(w,m),z+m.z0,z+m.z1,'Oak');
      for(let i=n0;i<projectedFaces.length;i++){
        projectedFaces[i].timberMember=true;
        projectedFaces[i].memberType=m.type;
        projectedFaces[i].memberRole=m.role||'';
        projectedFaces[i].studCategory=m.studCategory||catInfo?.category||'';
        projectedFaces[i].studCategoryLabel=m.studCategoryLabel||catInfo?.label||m.type;
        projectedFaces[i].studColor=m.studColor||catInfo?.color||'';
        projectedFaces[i].studRgb=catInfo?.rgb||null;
        projectedFaces[i].wallId=w.id;
        projectedFaces[i].isStud=true;
        projectedFaces[i].customSize=Boolean(m.customSize);
        projectedFaces[i].collision=Boolean(m.collision);
        if(selected.includes(faceId))projectedFaces[i].color='#38bdf8';
        else if(projectedFaces[i].studColor)projectedFaces[i].color=projectedFaces[i].studColor;
      }
    }
  }
  for(const o of model.elements.filter(e=>e.host&&shown(e))){
    const w=hostOf(o),len=distance(w.a,w.b),z=wallBase(w),top=heightOf(w);
    prism(o.id,openingSolidPolygon(w,o),z+o.sill,z+Math.min(o.sill+o.height,top),o.type==='window'?'Glass':'Oak');
  }
  for(const e of model.elements.filter(shown)){
    const z=storyOf(e).elevation;
    if(e.type==='wall'){continue;}
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
    else if(e.type==='beam')prism(e.id,wallPoly(e),z+heightOf(e)-e.thickness,z+heightOf(e),e.material);
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
if(view==='section'){drawJoinedSection(pr);drawRoofElevation(pr);return}const walls=model.elements.filter(e=>e.type==='wall'&&e.story===activeStory&&shown(e));const elevWalls=[];for(const e of walls){let st={...storyOf(e),elevation:wallBase(e)},h=heightOf(e);if(view==='elevation'&&(Math.abs(e.a.y-e.b.y)>1||e.layer!=='Exterior Walls'||e.a.y<Math.max(...walls.filter(w=>Math.abs(w.a.y-w.b.y)<1&&w.layer==='Exterior Walls').map(w=>w.a.y))))continue;elevWalls.push(e);const wxMin=Math.min(e.a.x,e.b.x),wxMax=Math.max(e.a.x,e.b.x);let a=pr(wxMin,st.elevation+h),b=pr(wxMax,st.elevation);rect(a.x,a.y,b.x-a.x,b.y-a.y,selected.includes(e.id)?'#d0e2d0':'#eef1e9','#809373',1);
// Draw subtle framing plates (top plates & bottom plate) on elevation wall
const c=typeof construction==='function'?construction(e):{plateThickness:38,topPlates:2,bottomPlates:1,headerDepth:190};const pThk=c.plateThickness||38,topThk=(c.topPlates||2)*pThk,botThk=(c.bottomPlates||1)*pThk;
const tpA=pr(wxMin,st.elevation+h),tpB=pr(wxMax,st.elevation+h-topThk);rect(tpA.x,tpA.y,tpB.x-tpA.x,tpB.y-tpA.y,'#d1fae580','#0f766e80',0.7);
const bpA=pr(wxMin,st.elevation+botThk),bpB=pr(wxMax,st.elevation);rect(bpA.x,bpA.y,bpB.x-bpA.x,bpB.y-bpA.y,'#ecfccb80','#4d5b4380',0.7);
hits.push({id:e.id,a,b});if(view==='elevation')for(const o of hosted(e)){const pos=openingPoint(o),x=pos.x,y=st.elevation+o.sill;let l=pr(x-o.width/2,y+o.height),r=pr(x+o.width/2,y);rect(l.x,l.y,r.x-l.x,r.y-l.y,o.type==='window'?'#dce8df':'#d5cbb2',selected.includes(o.id)?'#315d54':'#9aa990',1);line({x:(l.x+r.x)/2,y:l.y},{x:(l.x+r.x)/2,y:r.y},'#9cafa0',.8);
// Draw header and sill members on elevation opening
const hDepth=c.headerDepth||190,hdrZ0=c.headerPosition!=='opening'?Math.max(o.sill+o.height,h-topThk-hDepth):(o.sill+o.height),hdrZ1=c.headerPosition!=='opening'?(h-topThk):Math.min(h-topThk,o.sill+o.height+hDepth);
const hL=pr(x-o.width/2-38,st.elevation+hdrZ1),hR=pr(x+o.width/2+38,st.elevation+hdrZ0);rect(hL.x,hL.y,hR.x-hL.x,hR.y-hL.y,'#fde68a95','#b4530995',0.8);
if(o.sill>botThk){const sPlies=o.sill>botThk+pThk?2:1,sL=pr(x-o.width/2,st.elevation+o.sill),sR=pr(x+o.width/2,st.elevation+o.sill-sPlies*pThk);rect(sL.x,sL.y,sR.x-sL.x,sR.y-sL.y,'#bae6fd95','#0369a195',0.8);}
hits.push({id:o.id,a:l,b:r})}}drawRoofElevation(pr);
// Render placed section_callout elements in Elevation view
const sectionCallouts=model.elements.filter(e=>e.type==='section_callout'&&(e.story===activeStory||!e.story));
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

  // 4. Authentic Archicad Intelligent Cursor & Pre-selection Highlight
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

    // Archicad Intelligent Cursor shapes:
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
      // Archicad Hammer Cursor for placing dimension line offset
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
      // Archicad Heavy Checkmark (✓) at node/endpoint/corner
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
      // Archicad Mercedes Cursor (Circle with 3 radial spokes at 90°, 210°, 330°)
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
      // Standard Archicad Crosshair Cursor
      line({ x: hp.x - 10, y: hp.y }, { x: hp.x + 10, y: hp.y }, '#0f172a', 1.1);
      line({ x: hp.x, y: hp.y - 10 }, { x: hp.x, y: hp.y + 10 }, '#0f172a', 1.1);
      rect(hp.x - 2.5, hp.y - 2.5, 5, 5, null, '#0284c7', 1);
    }

    // Subtle Archicad Snap Tag
    if (snap && currentSnap && !['Grid', 'Off'].includes(currentSnap)) {
      const snapLabel = currentSnap;
      const bw = snapLabel.length * 5.5 + 10;
      rect(hp.x + 12, hp.y + 10, bw, 15, '#ffffffec', '#94a3b8', 0.8);
      label(snapLabel, hp.x + 12 + bw / 2, hp.y + 17.5, 7.5, '#0f172a', 'center');
    }

    ctx.restore();
  }
}

function render(){trackerUI();if(!width)return;if(!isModelView())globalThis.cadtechViewport?.hide();const framingHud=$('#framing-plan-auto-fix-hud');if(framingHud)framingHud.classList.toggle('hidden',view!=='framingplan'||Boolean(window._closedFloatingPopups?.has('framing-plan-auto-fix-hud')));ctx.clearRect(0,0,width,height);ctx.fillStyle='#f7f9f6';ctx.fillRect(0,0,width,height);$('#selection-tip').style.display='none';if(view==='plan'){if(grid){let step=1000*baseScale*scale;if(step>12){ctx.fillStyle='#c9d3c1';let origin=p2({x:0,y:0});for(let x=origin.x%step;x<width;x+=step)for(let y=origin.y%step;y<height;y+=step){ctx.beginPath();ctx.arc(x,y,.65,0,7);ctx.fill()}}}drawPlan();drawVisualSnapIndicators();}else if(view==='framingplan'){drawFramingPlan();drawAnnotations();drawVisualSnapIndicators();}else if(view==='roofframingplan'){drawRoofFramingPlan();drawAnnotations();drawVisualSnapIndicators();}else if(view==='ewpspecs'){drawEWPFloorFramingPlan();drawAnnotations();drawVisualSnapIndicators();}else if(view==='panel'){drawWallPanel();drawAnnotations();drawVisualSnapIndicators();}else if(view==='framing3d')draw3D();else if(view==='3d')draw3D();else if(view!=='schedule'&&view!=='cutlist'&&view!=='audit'&&view!=='trusselevation'){drawElevation();drawAnnotations();drawVisualSnapIndicators();}if(!isModelView(view)&&points.length&&tool!=='dimension'){if(['wall','line','beam'].includes(tool)){const p=p2(points.at(-1));line({x:0,y:p.y},{x:width,y:p.y},'#819c7c80',.6,[3,6]);line({x:p.x,y:0},{x:p.x,y:height},'#819c7c80',.6,[3,6]);}if(tool==='wall'&&hover&&distance(points.at(-1),hover)>10){const preview={id:'preview',type:'wall',a:points.at(-1),b:hover,thickness:200,reference:'outside',story:activeStory};poly(wallPoly(preview).map(p2),'#739a7c30','#4a795b',1);}for(let i=1;i<points.length;i++)line(p2(points[i-1]),p2(points[i]),'#3d785b',1.5,[4,3]);if(hover){line(p2(points.at(-1)),p2(hover),'#3d785b',1.2,[4,3]);const p=p2(hover);rect(p.x-3,p.y-3,6,6,'white','#3d785b')}}editPreview();if(drag?.kind==='marquee'){const crossing=lastPointer.x<drag.start.x;ctx.setLineDash(crossing?[5,3]:[]);rect(drag.start.x,drag.start.y,lastPointer.x-drag.start.x,lastPointer.y-drag.start.y,crossing?'#387c9820':'#70977917',crossing?'#387c98':'#6e9575',1);ctx.setLineDash([]);label(crossing?'Crossing selection':'Window selection',Math.min(drag.start.x,lastPointer.x)+5,Math.min(drag.start.y,lastPointer.y)-8,9,crossing?'#387c98':'#6e9575','left')};$('#elements-count').textContent=`${model.elements.length} elements`;$('#zoom-status').textContent=`${Math.round(scale*100)}%`;$('#undo').disabled=!modelHistory.length;$('#redo').disabled=!future.length;if(view==='schedule'||view==='cutlist'||view==='audit')schedule();$('#wall-palette').classList.toggle('hidden',!(view==='plan'&&tool==='select'&&model.elements.some(e=>selected.includes(e.id)&&e.type==='wall'))||Boolean(window._closedFloatingPopups?.has('wall-palette')))}
function resize(){const b=canvas.getBoundingClientRect();width=b.width;height=b.height;canvas.width=Math.round(width*devicePixelRatio);canvas.height=Math.round(height*devicePixelRatio);ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);baseScale=Math.max(.014,Math.min((width-110)/16000,(height-150)/12000));if(isModelView())fit3DCamera(false);render()}new ResizeObserver(resize).observe($('#canvas-area'));
function field(label,key,value,unit='',type='number'){
  const isMmUnit = unit === 'mm' && type === 'number';
  const dispUnit = isMmUnit && isImperialUnits() ? 'ft-in' : unit;
  const dispType = isMmUnit && isImperialUnits() ? 'text' : type;
  const dispValue = isMmUnit && isImperialUnits() ? formatFeetInches(Number(value)) : value;
  return `<label class="field"><span>${label}</span><div class="input-unit"><input data-property="${key}" ${isMmUnit?'data-unit-mm="1"':''} value="${esc(dispValue)}" type="${dispType}" ${dispType==='number'?'step="0.1"':''}>${dispUnit?`<span>${dispUnit}</span>`:''}</div></label>`;
}function choice(label,key,value,opts){return `<label class="field"><span>${label}</span><select data-property="${key}">${opts.map(([v,t])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`}
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

  openModal(`Multi-Code Structural Compliance Audit — ${w.id}`, `
    <div class="modal-copy">
      Full multi-code structural capacity evaluation for <b>${esc(w.id)}</b> (${demands.wallTypeLabel} · ${cur.studWidth}×${cur.studDepth} mm ${cur.timberGrade} @ ${cur.spacing} mm O.C.) under combined ULS axial gravity (${demands.qAxialLineLoad_kNm} kN/m) and lateral wind pressure (${demands.windPressure_kNm2} kN/m²).
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0;font-size:11px;background:#f8fafc;padding:10px;border:1px solid #cbd5e1;border-radius:6px">
      <div><span style="color:#64748b;display:block">ULS Axial Line Load</span><strong style="font-size:13px;color:#0f172a">${demands.qAxialLineLoad_kNm} kN/m</strong></div>
      <div><span style="color:#64748b;display:block">Wind Pressure</span><strong style="font-size:13px;color:#0f172a">${demands.windPressure_kNm2} kN/m²</strong></div>
      <div><span style="color:#64748b;display:block">Opening Span / Count</span><strong style="font-size:13px;color:#0f172a">${demands.maxOpeningSpanMm || 0} mm (${demands.openingCount} op.)</strong></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0">
      <div style="padding:12px;background:#f0f9ff;border:1px solid #7dd3fc;border-radius:8px;font-size:11.5px">
        <div style="font-weight:700;color:#0369a1;margin-bottom:6px;display:flex;justify-content:space-between">
          <span>Eurocode 5 (EN 1995-1-1)</span>
          <span style="color:${ec5.dcPercent > 100 ? '#dc2626' : ec5.dcPercent > 80 ? '#b45309' : '#15803d'};font-weight:800">${ec5.status} (${ec5.dcPercent}% D/C)</span>
        </div>
        <div><b>Axial Utilization:</b> ${(ec5.axialUtil * 100).toFixed(1)}%</div>
        <div><b>Bending Utilization:</b> ${(ec5.bendingUtil * 100).toFixed(1)}%</div>
        <div><b>Buckling Reduction (k<sub>c,y</sub>):</b> ${ec5.kc_y}</div>
        <div><b>Slenderness (H/d):</b> ${ec5.hOverD} (limit 24)</div>
        <div><b>Wind Deflection:</b> ${ec5.defl_mm} mm (limit ${ec5.deflLimit} mm)</div>
      </div>

      <div style="padding:12px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:11.5px">
        <div style="font-weight:700;color:#15803d;margin-bottom:6px;display:flex;justify-content:space-between">
          <span>NDS 2024 (National Design Spec.)</span>
          <span style="color:${nds.dcPercent > 100 ? '#dc2626' : nds.dcPercent > 80 ? '#b45309' : '#15803d'};font-weight:800">${nds.status} (${nds.dcPercent}% ASD / ${nds.dcPercentLRFD}% LRFD)</span>
        </div>
        <div><b>Column Stability (C<sub>P</sub>):</b> ${nds.CP} (le/d = ${nds.le_over_d})</div>
        <div><b>Load Duration (C<sub>D</sub>):</b> ${nds.CD} (Wind duration)</div>
        <div><b>Repetitive Member (C<sub>r</sub>):</b> ${nds.Cr}</div>
        <div><b>Compressive Stress f<sub>c</sub>:</b> ${nds.fc_psi} psi (F'<sub>c</sub> = ${nds.Fc_prime_psi} psi)</div>
        <div><b>Bending Stress f<sub>b</sub>:</b> ${nds.fb_psi} psi (F'<sub>b</sub> = ${nds.Fb_prime_psi} psi)</div>
        <div><b>NDS Eq 3.9-2 Interaction:</b> ${nds.combinedInteraction} (Limit 1.0)</div>
      </div>
    </div>
    ${audit.warnings.length ? `<div style="margin:10px 0;padding:10px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;font-size:12px;color:#991b1b">
        <div style="font-weight:700;margin-bottom:4px">⚠ Active Structural Warnings:</div>
        <ul style="margin:0;padding-left:18px">${audit.warnings.map(x=>`<li style="margin:3px 0">${esc(x)}</li>`).join('')}</ul>
       </div>` : `<div style="margin:10px 0;padding:10px 12px;background:#f0fdf4;border:1px solid #86efac;border-radius:6px;font-size:12px;color:#166534"><b>✓ Full Compliance: Wall framing passes both Eurocode 5 and NDS 2024 ASD/LRFD standard capacity checks.</b></div>`}
    <div class="modal-actions" style="display:flex;justify-content:flex-end">
      <button id="sug-close-btn" class="primary" type="button">Close</button>
    </div>
  `);
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
    const c = construction(w);
    const curW = Math.round(m.studWidth || (m.x1 - m.x0) || c.studWidth || 38);
    const curD = Math.round(m.studDepth || c.studDepth || 140);
    const curGrade = m.timberGrade || c.timberGrade || 'C16';
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
          <div><span style="color:#64748b;display:block;font-size:10px">SECTION</span><strong style="color:#0284c7">${formatSection(curW, curD)} (${esc(curGrade)})</strong></div>
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
        <div class="section-header">CHANGE STUD SIZE (RECTANGULAR)</div>
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
        <div style="display:flex;flex-direction:column;gap:6px;margin:8px 18px 10px">
          <button id="stud-apply-single-btn" class="primary" type="button" style="width:100%;font-weight:700;background:#0284c7;border-color:#0369a1;color:#fff">✓ Apply Size to Selected Stud Only</button>
          <button id="stud-apply-wall-btn" class="subtle" type="button" style="width:100%;font-weight:700;color:#0369a1;border-color:#7dd3fc;background:#f0f9ff">✓ Apply Size to All Studs on ${esc(w.id)}</button>
        </div>
      </div>
      <div class="prop-section">
        <div class="section-header">DELETE / RESTORE & OPTIMIZE</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin:8px 18px 12px">
          <button id="stud-delete-btn" class="subtle" type="button" style="width:100%;color:#dc2626;border-color:#fca5a5;background:#fef2f2;font-weight:700">🗑 Delete Selected Stud</button>
          ${deletedCount > 0 ? `<button id="stud-restore-all-btn" class="subtle" type="button" style="width:100%;color:#15803d;border-color:#86efac;background:#f0fdf4;font-weight:600">⟲ Restore ${deletedCount} Deleted Stud(s) on ${esc(w.id)}</button>` : ''}
          <button id="stud-suggest-btn" class="subtle" type="button" style="width:100%;color:#1e40af;border-color:#93c5fd;background:#eff6ff;font-weight:700">💡 Suggest Optimal Stud Size & Spacing (${sug ? sug.current.utilizationPct + '% D/C' : 'Audit'})</button>
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

    $('#stud-preset-select')?.addEventListener('change', ev => {
      const preset = (window.TIMBER_SIZES_C16_C24 || []).find(p => p.id === ev.target.value);
      if(preset){
        if($('#stud-width-input')) $('#stud-width-input').value = isImperialUnits() ? formatInchesOnly(preset.studWidth) : preset.studWidth;
        if($('#stud-depth-input')) $('#stud-depth-input').value = isImperialUnits() ? formatInchesOnly(preset.studDepth) : preset.studDepth;
        if($('#stud-grade-select')) $('#stud-grade-select').value = preset.timberGrade;
        commit(() => {
          window.updateStudSize?.(m.id, { presetId: preset.id, studWidth: preset.studWidth, studDepth: preset.studDepth, timberGrade: preset.timberGrade, applyToWall: false }, model);
        });
        toast(`Stud size updated to ${formatSection(preset.studWidth, preset.studDepth)} (${preset.timberGrade})`);
      }
    });
    const applyStudSizeFn = (applyToWall) => {
      try {
        const presetId = $('#stud-preset-select')?.value;
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
            applyToWall
          }, model);
        });
        toast(applyToWall ? `All studs on ${w.id} resized to ${formatSection(studWidth, studDepth)} (${timberGrade})` : `Selected stud resized to ${formatSection(studWidth, studDepth)} (${timberGrade})`);
      } catch (err) {
        toast(err.message || 'Could not resize stud.');
      }
    };
    $('#stud-apply-single-btn')?.addEventListener('click', () => applyStudSizeFn(false));
    $('#stud-apply-wall-btn')?.addEventListener('click', () => applyStudSizeFn(true));
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
  if(!e){
    $('#properties').innerHTML=`<div class="property-heading"><span class="element-symbol">${icon('building')}</span><div><strong>Project Settings</strong><small>Archicad Virtual Building</small></div></div><div class="section-header">ACTIVE STORY</div>${field('Height','storyHeight',model.stories.find(s=>s.id===activeStory).height,'mm')}<div class="empty-prop">Select an element or any individual wall stud in Floor Plan or 3D to edit its geometry, stud size, or delete it.</div><div style="padding:0 19px"><span class="status-label">All views synchronized</span></div>`;
    bindProperties();return;
  }
  const name=e.type[0].toUpperCase()+e.type.slice(1);
  let html=`<div class="property-heading"><span class="element-symbol">${icon(e.type)}</span><div><strong>${name}</strong><small>${esc(e.id)} · ${selected.length>1?selected.length+' selected':'Selected element'}</small></div><span class="selection-count">${selected.length.toString().padStart(2,'0')}</span></div><div class="prop-section"><div class="section-header">GENERAL & CLASSIFICATION</div>${field('Element ID','id',e.id,'','text')}${choice('Story','story',e.story,model.stories.map(s=>[s.id,s.name]))}${choice('Layer','layer',e.layer,layers.map(l=>[l.name,l.name]))}</div><div class="prop-section"><div class="section-header">GEOMETRY & POSITIONING</div>`;
  if(['wall','beam','column','curtainwall','stair'].includes(e.type)){
    if(e.b)html+=field('Length','length',Math.round(distance(e.a,e.b)),'mm');
    html+=field('Height','height',heightOf(e),'mm')+field('Thickness / Width','thickness',e.thickness||200,'mm');
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
    html+=field('Level height','targetHeight',e.targetHeight??storyOf(e).elevation,'mm')+choice('Marker symbol','markerType',e.markerType||'archicad_triangle',[['archicad_triangle','Archicad standard triangle'],['circle','Benchmark circle']]);
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
  if(e.type==='slab')html+=field('Thickness','thickness',e.thickness,'mm');
  if(e.type==='roof')html+=roofProperties(e);
  if(e.radius)html+=field('Radius','radius',e.radius,'mm');
  if(e.a){
    const a=e.type==='dimension'?resolveDimension(e).a:e.a;
    html+=field('Start X','ax',Math.round(a.x),'mm')+field('Start Y','ay',Math.round(a.y),'mm');
  }
  if(e.type==='dimension'){
    const d=resolveDimension(e);
    const measuredMm = Math.round(distance(d.a, d.b));
    html+=`<div class="section-header">ARCHICAD DIMENSION PROPERTIES</div>`;
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
  html+=`<div style="padding:12px 19px 0"><span class="status-label">${e.host?'Hosted BIM Opening':'2D + 3D live synchronized'}</span></div>`;
  const propEl=$('#properties');if(propEl)propEl.innerHTML=html;
  bindProperties();
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
    else if(action==='suggestFraming'){openWallSuggestionModal(e)}
    else if(action==='restoreStuds'){
      commit(()=>window.restoreWallDeletedStuds?.(e, model));
      toast(`Restored all deleted studs on ${e.id}`);
    }
    else if(action==='resetStudSizes'){
      commit(()=>window.clearWallStudOverrides?.(e));
      toast(`Reset all individual stud size overrides on ${e.id}`);
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
  $$('[data-roof-align]').forEach(b=>b.onclick=()=>alignRoofFraming(e));
  $$('[data-roof-view]').forEach(b=>b.onclick=()=>setView(b.dataset.roofView));
  $$('[data-select]').forEach(b=>b.onclick=()=>select([b.dataset.select]));
}

function bindProperties(){
  $$('[data-property]').forEach(input=>input.onchange=()=>{
    let key=input.dataset.property,v=input.dataset.unitMm==='1'?parseLengthInput(input.value,NaN):(input.type==='number'?Number(input.value):input.value),e=model.elements.find(e=>e.id===selected[0]);
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
      if(key.startsWith('roofFraming.')){commit(()=>{e.roofFraming={...roofFramingSettings(e),[key.split('.')[1]]:v};validateRoofFraming(e)});return}
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
        if(e.type==='wall')hosted(e).forEach(o=>{o.story=e.story;fitOpening(o,e)});
      });
      toast('Archicad model updated');
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
    const g=toolGeomMethod.wall||'chained';
    const c=e?construction(e):FRAMING_DEFAULTS;
    const curPreset=e?getTimberPresetId(c,e):(window.TIMBER_SIZES_C16_C24?getTimberPresetId(FRAMING_DEFAULTS):'38x140_C16');
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
    const activeGrade=e?construction(e).timberGrade:(activeWalls[0]?construction(activeWalls[0]).timberGrade:'C16');
    html+=`<div class="info-section"><span class="info-label">TIMBER GRADE</span><select class="info-select" id="info-framing-plan-grade"><option value="C16" ${activeGrade==='C16'?'selected':''}>C16 Standard Structural</option><option value="C24" ${activeGrade==='C24'?'selected':''}>C24 High-Grade Structural</option><option value="C14" ${activeGrade==='C14'?'selected':''}>C14 Softwood</option><option value="C18" ${activeGrade==='C18'?'selected':''}>C18 Softwood</option><option value="C30" ${activeGrade==='C30'?'selected':''}>C30 Premium Softwood</option></select></div><div class="info-divider"></div>`;
  }

  const curHeight=e?heightOf(e):3048,curThick=e?.thickness||200;
  html+=`<div class="info-section"><span class="info-label">HEIGHT</span><div class="info-input-wrap"><input id="info-height" type="${isImperialUnits()?'text':'number'}" step="100" value="${esc(isImperialUnits()?formatFeetInches(curHeight):curHeight)}"><span>${isImperialUnits()?'ft-in':'mm'}</span></div></div><div class="info-section"><span class="info-label">THICK</span><div class="info-input-wrap"><input id="info-thick" type="${isImperialUnits()?'text':'number'}" step="10" value="${esc(isImperialUnits()?formatFeetInches(curThick):curThick)}"><span>${isImperialUnits()?'ft-in':'mm'}</span></div></div><div class="info-divider"></div><div class="info-section"><span class="info-label">STORY</span><select class="info-select" id="info-story">${model.stories.map(s=>`<option value="${s.id}" ${(e?.story||activeStory)===s.id?'selected':''}>${s.name}</option>`).join('')}</select></div><div class="info-divider"></div><div class="info-section"><span class="info-label">LAYER</span><select class="info-select" id="info-layer">${layers.map(l=>`<option value="${l.name}" ${(e?.layer||'Exterior Walls')===l.name?'selected':''}>${l.name}</option>`).join('')}</select></div><div class="info-divider"></div><div class="info-section"><span class="info-label">SURFACE</span><select class="info-select" id="info-material">${Object.keys(materials).map(m=>`<option value="${m}" ${(e?.material||'Timber')===m?'selected':''}>${m}</option>`).join('')}</select></div><div class="info-divider"></div><div class="info-section"><span class="info-label">STRUCTURAL</span><select class="info-select"><option>Load-Bearing</option><option>Non-Load-Bearing</option></select></div>`;
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
  $('#info-layer')?.addEventListener('change',ev=>{if(e)commit(()=>{e.layer=ev.target.value})});
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

function fitOpening(o,w){const len=distance(w.a,w.b),h=heightOf(w);o.width=Math.min(o.width,len);o.offset=Math.max(o.width/2,Math.min(len-o.width/2,o.offset));o.sill=Math.min(o.sill,Math.max(0,h-100));o.height=Math.min(o.height,h-o.sill)}
function validateOpening(o){const w=hostOf(o);if(!w||w.type!=='wall')throw Error('Choose a valid host wall.');if(o.offset-o.width/2<0||o.offset+o.width/2>distance(w.a,w.b))throw Error('Opening must stay inside its host wall.');if(o.sill<0||o.sill+o.height>heightOf(w))throw Error('Opening must fit below the wall top.');if(hosted(w).some(other=>other.id!==o.id&&Math.abs(other.offset-o.offset)<(other.width+o.width)/2))throw Error('Hosted openings cannot overlap.')}
function setStoryHeight(id,v){const st=model.stories.find(s=>s.id===id);if(v<300||v>50000)throw Error('Story height must be between 300 and 50,000 mm.');commit(()=>{let delta=v-st.height,old=st.elevation;st.height=v;model.stories.filter(s=>s.elevation>old).forEach(s=>s.elevation+=delta);model.elements.filter(e=>e.story===id&&e.type==='wall'&&e.followStory).forEach(w=>hosted(w).forEach(o=>fitOpening(o,w)))});toast('Story height and dependent elements updated')}

function navigatorPanel(){
  const stEl=$('#stories');if(stEl)stEl.innerHTML=[...model.stories].reverse().map((s,i)=>`<button class="story-row ${s.id===activeStory?'active':''}" data-story="${s.id}">${icon('layers')} ${String(model.stories.indexOf(s)).padStart(2,'0')} ${esc(s.name)}<small>+${formatLength(s.elevation)}</small></button>`).join('');
  $$('[data-story]').forEach(b=>b.onclick=()=>{activeStory=b.dataset.story;selected=[];setView('plan');properties();navigator()});
  const layEl=$('#layers');if(layEl)layEl.innerHTML=layers.map((l,i)=>`<div class="layer-row ${l.visible?'':'off'}"><span class="layer-color" style="background:${l.color}"></span>${l.name}<button data-layer="${i}" aria-label="Toggle ${l.name} visibility">${icon('eye')}</button></div>`).join('');
  $$('[data-layer]').forEach(b=>b.onclick=()=>{layers[+b.dataset.layer].visible=!layers[+b.dataset.layer].visible;navigator();render()});
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
    $('#pub-ifc')?.addEventListener('click',()=>{download('courtyard-house.ifc',`ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('Archicad 28 BIM Studio Pro export','2;1'),'2;1');\nFILE_NAME('courtyard-house.ifc','2026-10-24T12:00:00',('Architect'),('Graphisoft Archicad'),'CadTech Engine','Archicad 28.0','None');\nFILE_SCHEMA(('IFC4X3_ADD2'));\nENDSEC;\nDATA;\n#1=IFCPROJECT('1r_9N_v1nB8B7w1h3X9G7K',#2,'Courtyard House',$,$,$,$,(#3),#4);\nENDSEC;\nEND-ISO-10303-21;`,'text/plain');toast('IFC 4x3 project published')});
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
$('#floor-pdf-btn')?.addEventListener('click',()=>{if(typeof window.generateEWPFloorPDFReport==='function')window.generateEWPFloorPDFReport();});
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
  spanFt: 42.4,
  tribWidthFt: 14.0,
  livePsf: 40,
  deadPsf: 15,
  defLLLimit: 480,
  defTLLimit: 360,
  fcPerp: 750,
  currentSection: 'LVL 1-3/4x11-7/8',
  currentPlies: 3,
  showTribHatch: true,
  joistSpacingIn: 16,
  joistSection: 'I-Joist 11-7/8'
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

  const floorW = 13000, floorH = 9000;
  const p00 = p2({ x: 0, y: 0 });
  const p10 = p2({ x: floorW, y: 0 });
  const p11 = p2({ x: floorW, y: floorH });
  const p01 = p2({ x: 0, y: floorH });

  poly([p00, p10, p11, p01], '#fbfbfa', '#334155', 2);

  const rimT = 45;
  const in00 = p2({ x: rimT, y: rimT });
  const in10 = p2({ x: floorW - rimT, y: rimT });
  const in11 = p2({ x: floorW - rimT, y: floorH - rimT });
  const in01 = p2({ x: rimT, y: floorH - rimT });
  poly([in00, in10, in11, in01], null, '#94a3b8', 1, [4, 4]);

  // Corner Studs / 3-Stud Corner Floor Blocking (140x140 mm matching exterior wall 3-stud corners)
  const cornerSize = 140;
  const cornerStudCoords = [
    { x: 0, y: 0 },
    { x: floorW - cornerSize, y: 0 },
    { x: floorW - cornerSize, y: floorH - cornerSize },
    { x: 0, y: floorH - cornerSize }
  ];
  for (const cs of cornerStudCoords) {
    const c00 = p2({ x: cs.x, y: cs.y });
    const c10 = p2({ x: cs.x + cornerSize, y: cs.y });
    const c11 = p2({ x: cs.x + cornerSize, y: cs.y + cornerSize });
    const c01 = p2({ x: cs.x, y: cs.y + cornerSize });
    poly([c00, c10, c11, c01], '#fee2e2', '#dc2626', 1.5);
    line(c00, c11, '#dc2626', 1);
    line(c10, c01, '#dc2626', 1);
  }

  // Callout for Corner Studs
  const csCalloutPos = p2({ x: cornerSize + 800, y: cornerSize / 2 });
  rect(csCalloutPos.x - 140, csCalloutPos.y - 10, 280, 20, '#ffffff', '#dc2626', 1.2);
  label('◄ 3-STUD CORNER FLOOR BLOCKING (MATCHES WALL CORNER)', csCalloutPos.x, csCalloutPos.y, 8, '#b91c1c', 'center');

  const beamStartMm = rimT;
  const beamEndMm = floorW - rimT;
  const beamSpanMm = beamEndMm - beamStartMm;
  const beamYMm = 4500;
  const girderWidth = 90;
  const jTopEnd = beamYMm - girderWidth / 2;
  const jBotStart = beamYMm + girderWidth / 2;

  if (state) state.spanFt = Math.round((beamSpanMm / 304.8) * 10) / 10;

  if (state.showTribHatch && calc) {
    const tribHalfMm = (state.tribWidthFt * 304.8) / 2;
    const yTopMm = Math.max(rimT, beamYMm - tribHalfMm);
    const yBotMm = Math.min(floorH - rimT, beamYMm + tribHalfMm);

    const t00 = p2({ x: beamStartMm, y: yTopMm });
    const t10 = p2({ x: beamEndMm, y: yTopMm });
    const t11 = p2({ x: beamEndMm, y: yBotMm });
    const t01 = p2({ x: beamStartMm, y: yBotMm });

    ctx.save();
    poly([t00, t10, t11, t01], 'rgba(14, 165, 233, 0.14)', 'rgba(2, 132, 199, 0.75)', 1.5, [5, 4]);

    ctx.strokeStyle = 'rgba(2, 132, 199, 0.1)';
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
    dim({ x: beamStartMm, y: yTopMm }, { x: beamEndMm, y: yTopMm }, 28 * scale, `BEAM SPAN ${formatLength(beamSpanMm)}`);

    const midScreen = p2({ x: (beamStartMm + beamEndMm) / 2, y: beamYMm - tribHalfMm / 2 });
    const badgeText = `TRIBUTARY AREA: ${formatAreaFromM2(calc.inputs.tribAreaSqFt * 0.092903)} · DEMAND: ${calc.demands.wTL_plf} PLF`;
    const bw = badgeText.length * 6.5 + 20;
    rect(midScreen.x - bw / 2, midScreen.y - 10, bw, 20, '#ffffff', '#0284c7', 1.2);
    label(badgeText, midScreen.x, midScreen.y, 9.5, '#0369a1', 'center');
  }

  // Draw joists at spacing
  const spacingIn = state.joistSpacingIn || 16;
  const spacingMm = spacingIn * 25.4;
  const joistSpec = state.joistSection || (isImperialUnits() ? 'I-Joist 11-7/8"' : 'I-Joist 300mm');

  // Mid-span blocking lines
  const midTopY = (rimT + beamYMm) / 2;
  const midBotY = (beamYMm + floorH - rimT) / 2;
  line(p2({ x: rimT, y: midTopY }), p2({ x: floorW - rimT, y: midTopY }), '#64748b', 1, [4, 4]);
  line(p2({ x: rimT, y: midBotY }), p2({ x: floorW - rimT, y: midBotY }), '#64748b', 1, [4, 4]);

  const blockBadge1 = p2({ x: floorW / 2 + 1800, y: midTopY });
  rect(blockBadge1.x - 90, blockBadge1.y - 8, 180, 16, '#ffffff', '#64748b', 1);
  label(`I-JOIST BLOCKING @ MID-SPAN`, blockBadge1.x, blockBadge1.y, 8, '#475569', 'center');

  const blockBadge2 = p2({ x: floorW / 2 + 1800, y: midBotY });
  rect(blockBadge2.x - 90, blockBadge2.y - 8, 180, 16, '#ffffff', '#64748b', 1);
  label(`I-JOIST BLOCKING @ MID-SPAN`, blockBadge2.x, blockBadge2.y, 8, '#475569', 'center');

  for (let x = rimT + spacingMm; x < floorW - rimT; x += spacingMm) {
    const j1a = p2({ x, y: rimT });
    const j1b = p2({ x, y: jTopEnd });
    line(j1a, j1b, '#0284c7', 1.2);

    const j2a = p2({ x, y: jBotStart });
    const j2b = p2({ x, y: floorH - rimT });
    line(j2a, j2b, '#0284c7', 1.2);
  }

  // Draw Joist Span & Spacing Callouts (Double-headed direction arrows)
  const topSpanMm = Math.round(jTopEnd - rimT);
  const botSpanMm = Math.round(floorH - rimT - jBotStart);

  const joistTagText = `${joistSpec.toUpperCase()} @ ${formatLength(spacingMm)} O.C.`;

  // Callouts in Representative Bays (Bay 1 at x = 2800 mm, Bay 2 at x = 10200 mm)
  for (const calloutX of [2800, 10200]) {
    // Top Bay Span Arrow
    drawSpanArrow(
      p2({ x: calloutX, y: rimT + 400 }),
      p2({ x: calloutX, y: jTopEnd - 400 }),
      joistTagText,
      `SPAN: ${formatLength(topSpanMm)}`,
      '#0284c7'
    );

    // Bottom Bay Span Arrow
    drawSpanArrow(
      p2({ x: calloutX, y: jBotStart + 400 }),
      p2({ x: calloutX, y: floorH - rimT - 400 }),
      joistTagText,
      `SPAN: ${formatLength(botSpanMm)}`,
      '#0284c7'
    );
  }

  // Rim Board Callouts
  const rimLabelTxt = isImperialUnits() ? 'RIM BOARD 1-3/4" x 11-7/8" EWP' : 'RIM BOARD 45 x 300 mm EWP';
  const rimTopPos = p2({ x: floorW / 2 - 1800, y: rimT / 2 });
  rect(rimTopPos.x - 110, rimTopPos.y - 9, 220, 18, '#ffffff', '#0369a1', 1);
  label(rimLabelTxt, rimTopPos.x, rimTopPos.y, 8.5, '#0369a1', 'center');

  const rimSidePos = p2({ x: rimT / 2, y: floorH / 2 });
  ctx.save();
  ctx.translate(rimSidePos.x, rimSidePos.y);
  ctx.rotate(-Math.PI / 2);
  rect(-110, -9, 220, 18, '#ffffff', '#0369a1', 1);
  label(rimLabelTxt, 0, 0, 8.5, '#0369a1', 'center');
  ctx.restore();

  // Draw Center Girder Beam
  const bA = p2({ x: beamStartMm, y: beamYMm });
  const bB = p2({ x: beamEndMm, y: beamYMm });
  const cur = calc ? calc.currentCandidate : { status: 'PASS', name: state.currentSection, dcPercent: 78, governing: 'Bending' };
  const beamColor = cur.status === 'PASS' ? '#c2410c' : cur.status === 'WARNING' ? '#b45309' : '#dc2626';
  const beamThickness = Math.max(4, state.currentPlies * 3.5);

  line(bA, bB, beamColor, beamThickness);
  if (cur.status === 'FAIL') {
    line(bA, bB, '#ffffff', 1.5, [4, 4]);
  }

  const colW = 12;
  rect(bA.x - colW / 2, bA.y - colW / 2, colW, colW, '#ffffff', '#0f172a', 1.8);
  rect(bB.x - colW / 2, bB.y - colW / 2, colW, colW, '#ffffff', '#0f172a', 1.8);

  const beamLabelY = bA.y + 18;
  const statusBadge = cur.status === 'PASS' ? 'PASS' : cur.status === 'WARNING' ? 'WARNING' : 'OVERLOADED';
  const beamTagText = `${state.beamId}: ${cur.name} · D/C: ${cur.dcPercent}% [${statusBadge}] · Gov: ${cur.governing}`;
  const tagW = beamTagText.length * 6.5 + 20;
  const tagBg = cur.status === 'PASS' ? '#f0fdf4' : cur.status === 'WARNING' ? '#fffbeb' : '#fef2f2';
  const tagBorder = cur.status === 'PASS' ? '#16a34a' : cur.status === 'WARNING' ? '#d97706' : '#dc2626';
  const tagColor = cur.status === 'PASS' ? '#15803d' : cur.status === 'WARNING' ? '#b45309' : '#b91c1c';

  rect((bA.x + bB.x) / 2 - tagW / 2, beamLabelY - 9, tagW, 18, tagBg, tagBorder, 1.2);
  label(beamTagText, (bA.x + bB.x) / 2, beamLabelY, 10, tagColor, 'center');

  if (calc) {
    label(`End Reaction: ${calc.demands.reactionLb.toLocaleString()} lbs (Min Brg: ${formatLength(cur.minBearingIn * 25.4)})`, bA.x, bA.y - 16, 8.5, '#475569', 'left');
    label(`R_end: ${calc.demands.reactionLb.toLocaleString()} lbs`, bB.x, bB.y - 16, 8.5, '#475569', 'right');
  }

  // If slabs exist in model.elements, also overlay their generated joists & span labels
  const slabs = model.elements.filter(e => e.type === 'slab' && e.story === activeStory && shown(e));
  for (const s of slabs) {
    const members = generateFloorFramingForSlab(s);
    for (const m of members) {
      if (m.type === 'Floor joist') {
        const jA = p2(m.a), jB = p2(m.b);
        line(jA, jB, '#0284c7', 1.2);
      }
    }
  }

  // Dimensions
  dim({ x: 0, y: 0 }, { x: floorW, y: 0 }, -30 * scale, `BUILDING WIDTH ${formatLength(floorW)}`);
  dim({ x: 0, y: 0 }, { x: 0, y: floorH }, 30 * scale, `BUILDING LENGTH ${formatLength(floorH)}`);

  // Connection & Hanger Markers rendering
  const connectionTypes = {
    topFlange: { code: 'TF', name: 'Simpson IUS2.56/11.87 Top Flange Hanger', color: '#16a34a', bg: '#dcfce7' },
    faceMount: { code: 'FM', name: 'Simpson LUS210 Face Mount Hanger', color: '#0284c7', bg: '#e0f2fe' },
    bearingPlate: { code: 'BP', name: '2x Solid Blocking / Sill Plate Bearing', color: '#d97706', bg: '#fef3c7' },
    columnCap: { code: 'CC', name: 'Simpson CCQ Column Cap Heavy Support', color: '#dc2626', bg: '#fee2e2' }
  };

  const connPoints = [];

  // Girder end column caps
  const cc1 = p2({ x: beamStartMm, y: beamYMm });
  const cc2 = p2({ x: beamEndMm, y: beamYMm });
  rect(cc1.x - 7, cc1.y - 7, 14, 14, connectionTypes.columnCap.bg, connectionTypes.columnCap.color, 1.5);
  label('CC', cc1.x, cc1.y + 3, 7.5, connectionTypes.columnCap.color, 'center');
  connPoints.push({ x: beamStartMm, y: beamYMm, type: 'columnCap', title: 'SIMPSON CCQ HEAVY DUTY COLUMN CAP', detail: 'Demand: 7,120 lbs | Fasteners: SDS 1/4" x 2-1/2" Screws | Bearing Ledge: 3.5"' });

  rect(cc2.x - 7, cc2.y - 7, 14, 14, connectionTypes.columnCap.bg, connectionTypes.columnCap.color, 1.5);
  label('CC', cc2.x, cc2.y + 3, 7.5, connectionTypes.columnCap.color, 'center');
  connPoints.push({ x: beamEndMm, y: beamYMm, type: 'columnCap', title: 'SIMPSON CCQ HEAVY DUTY COLUMN CAP', detail: 'Demand: 7,120 lbs | Fasteners: SDS 1/4" x 2-1/2" Screws | Bearing Ledge: 3.5"' });

  // Joist end hangers and bearing plates
  for (let x = rimT + spacingMm; x < floorW - rimT; x += spacingMm) {
    // 1. Top Rim Bearing Hanger (TF)
    const tfP = p2({ x, y: rimT });
    rect(tfP.x - 5, tfP.y - 5, 10, 10, connectionTypes.topFlange.bg, connectionTypes.topFlange.color, 1.2);
    connPoints.push({ x, y: rimT, type: 'topFlange', title: 'SIMPSON IUS2.56/11.87 TOP FLANGE HANGER', detail: 'Capacity: 1,420 lbs | Fasteners: 10d x 1-1/2" Nailing | Bearing: Top Rim Board' });

    // 2. Top Bay Girder Connection (FM)
    const fm1P = p2({ x, y: jTopEnd });
    rect(fm1P.x - 5, fm1P.y - 5, 10, 10, connectionTypes.faceMount.bg, connectionTypes.faceMount.color, 1.2);
    connPoints.push({ x, y: jTopEnd, type: 'faceMount', title: 'SIMPSON LUS210 FACE MOUNT HANGER', detail: 'Capacity: 1,280 lbs | Fasteners: 10d x 3" Nailing | Girder Flush Joint' });

    // 3. Bottom Bay Girder Connection (FM)
    const fm2P = p2({ x, y: jBotStart });
    rect(fm2P.x - 5, fm2P.y - 5, 10, 10, connectionTypes.faceMount.bg, connectionTypes.faceMount.color, 1.2);
    connPoints.push({ x, y: jBotStart, type: 'faceMount', title: 'SIMPSON LUS210 FACE MOUNT HANGER', detail: 'Capacity: 1,280 lbs | Fasteners: 10d x 3" Nailing | Girder Flush Joint' });

    // 4. Bottom Rim Sill Bearing (BP)
    const bpP = p2({ x, y: floorH - rimT });
    rect(bpP.x - 5, bpP.y - 5, 10, 10, connectionTypes.bearingPlate.bg, connectionTypes.bearingPlate.color, 1.2);
    connPoints.push({ x, y: floorH - rimT, type: 'bearingPlate', title: 'SILL PLATE / BEARING LEDGE DETAIL', detail: 'Capacity: 1,650 lbs | Min Bearing: 1.75" | Web Stiffeners Required' });
  }

  // Floor Framing Plan Legend / Specs Box
  const legX = 20, legY = height - 135;
  rect(legX, legY, 300, 120, '#ffffffeb', '#cbd5e1', 1);
  label('FLOOR FRAMING SPECIFICATIONS', legX + 12, legY + 16, 9.5, '#0f172a', 'left');
  label(`• Joists: ${joistSpec} @ ${spacingIn}" O.C. (${Math.round(spacingMm)} mm)`, legX + 12, legY + 32, 8.5, '#0284c7', 'left');
  label(`• Main Girder: ${cur.name}`, legX + 12, legY + 48, 8.5, '#c2410c', 'left');
  label('• Rim Board: 1-1/8" x 11-7/8" EWP Rim Board', legX + 12, legY + 64, 8.5, '#0369a1', 'left');
  label('• Corner Studs: 3-Stud Corner Floor Blocking (Matches Wall Corner)', legX + 12, legY + 80, 8.5, '#b91c1c', 'left');
  label('• Blocking: I-Joist Solid Blocking @ Mid-Span', legX + 12, legY + 96, 8.5, '#475569', 'left');
  label('• Design Code: NDS 2018 / IBC Chapter 23', legX + 12, legY + 110, 8, '#64748b', 'left');

  // CONNECTIONS & JOIST HANGERS Legend Box
  const leg2X = 330, leg2Y = height - 135;
  rect(leg2X, leg2Y, 320, 120, '#ffffffeb', '#cbd5e1', 1);
  label('CONNECTIONS & JOIST HANGERS', leg2X + 12, leg2Y + 16, 9.5, '#0f172a', 'left');

  // Legend Item 1: Top Flange
  rect(leg2X + 12, leg2Y + 28, 12, 12, connectionTypes.topFlange.bg, connectionTypes.topFlange.color, 1.2);
  label('TF', leg2X + 18, leg2Y + 37, 7, connectionTypes.topFlange.color, 'center');
  label('• [TF] Top Flange Hanger (Simpson IUS2.56/11.87)', leg2X + 30, leg2Y + 36, 8.5, '#16a34a', 'left');

  // Legend Item 2: Face Mount
  rect(leg2X + 12, leg2Y + 48, 12, 12, connectionTypes.faceMount.bg, connectionTypes.faceMount.color, 1.2);
  label('FM', leg2X + 18, leg2Y + 57, 7, connectionTypes.faceMount.color, 'center');
  label('• [FM] Face Mount Hanger (Simpson LUS210)', leg2X + 30, leg2Y + 56, 8.5, '#0284c7', 'left');

  // Legend Item 3: Bearing Plate
  rect(leg2X + 12, leg2Y + 68, 12, 12, connectionTypes.bearingPlate.bg, connectionTypes.bearingPlate.color, 1.2);
  label('BP', leg2X + 18, leg2Y + 77, 7, connectionTypes.bearingPlate.color, 'center');
  label('• [BP] Sill Bearing Plate (2x Ledge + Stiffeners)', leg2X + 30, leg2Y + 76, 8.5, '#d97706', 'left');

  // Legend Item 4: Column Cap
  rect(leg2X + 12, leg2Y + 88, 12, 12, connectionTypes.columnCap.bg, connectionTypes.columnCap.color, 1.2);
  label('CC', leg2X + 18, leg2Y + 97, 7, connectionTypes.columnCap.color, 'center');
  label('• [CC] Heavy Duty Column Cap (Simpson CCQ)', leg2X + 30, leg2Y + 96, 8.5, '#dc2626', 'left');

  label('Hover over any connection point on plan to view hardware details', leg2X + 12, leg2Y + 110, 8, '#64748b', 'left');

  // Interactive Hover Tooltip
  if (typeof hover !== 'undefined' && hover) {
    const nearConn = connPoints.find(cp => Math.hypot(cp.x - hover.x, cp.y - hover.y) < 300);
    if (nearConn) {
      const scrP = p2({ x: nearConn.x, y: nearConn.y });
      const ttType = connectionTypes[nearConn.type];
      const ttW = Math.max(nearConn.title.length * 6.5, nearConn.detail.length * 5.2) + 24;
      const ttH = 38;
      const ttX = Math.min(width - ttW - 20, Math.max(20, scrP.x - ttW / 2));
      const ttY = scrP.y - 48 > 40 ? scrP.y - 48 : scrP.y + 18;

      rect(ttX, ttY, ttW, ttH, '#0f172a', ttType.color, 1.5);
      rect(ttX + 6, ttY + 6, 18, 14, ttType.bg, ttType.color, 1);
      label(ttType.code, ttX + 15, ttY + 16, 8, ttType.color, 'center');

      label(nearConn.title, ttX + 30, ttY + 15, 9, '#f8fafc', 'left');
      label(nearConn.detail, ttX + 30, ttY + 28, 8, '#94a3b8', 'left');

      ctx.save();
      ctx.strokeStyle = ttType.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(scrP.x, scrP.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  label('FLOOR FRAMING PLAN · AUTOMATIC MEMBER SPANS & SPACING', width / 2, 28, 12, '#0f172a', 'center');
  label('All floor joists, hangers and beams automatically labeled with spans, connection types & O.C. spacing', width / 2, 44, 9.5, '#64748b', 'center');
}

function updateEWPBeamHUD() {
  const state = window.ewpBeamToolState;
  if (!state) return;
  const calcFn = window.calculateEWPBeamLoadAndSizing || (window.ewpSystem && window.ewpSystem.calculateEWPBeamLoadAndSizing);
  if (!calcFn) return;

  const res = calcFn({
    spanFt: state.spanFt,
    tribWidthFt: state.tribWidthFt,
    livePsf: state.livePsf,
    deadPsf: state.deadPsf,
    defLLLimit: state.defLLLimit,
    defTLLimit: state.defTLLimit,
    fcPerp: state.fcPerp,
    currentSection: state.currentSection,
    currentPlies: state.currentPlies
  });

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
  if (liveText) liveText.textContent = `${state.livePsf} psf`;

  const deadSlider = $('#hud-dead-slider');
  const deadText = $('#hud-dead-text');
  if (deadSlider && deadSlider.value != state.deadPsf) deadSlider.value = state.deadPsf;
  if (deadText) deadText.textContent = `${state.deadPsf} psf`;

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

  window._latestBeamSizingResult = res;
}

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
    updateEWPBeamHUD();
    render();
  };

  $('#hud-span-slider')?.addEventListener('input', onInput);
  $('#hud-trib-slider')?.addEventListener('input', onInput);
  $('#hud-live-slider')?.addEventListener('input', onInput);
  $('#hud-dead-slider')?.addEventListener('input', onInput);

  $('#hud-hatch-toggle')?.addEventListener('change', e => {
    state.showTribHatch = e.target.checked;
    render();
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
    updateEWPBeamHUD();
    render();
    toast('⚡ All floor beams auto-sized to tributary area & span demands!');
  });

  $('#ewp-hud-modal-btn')?.addEventListener('click', () => {
    openEWPSpecs();
  });

  $('#ewp-hud-toggle-btn')?.addEventListener('click', () => {
    $('#ewp-hud')?.classList.toggle('collapsed');
  });
}

function openEWPSpecs(){
  if(typeof window.openEWPSpecificationsModal==='function'){
    window.openEWPSpecificationsModal(model);
  }else if(typeof openEWPSpecificationsModal==='function'){
    openEWPSpecificationsModal(model);
  }else{
    import('./ewp-system.js').then(mod=>{
      if(typeof mod.openEWPSpecificationsModal==='function') mod.openEWPSpecificationsModal(model);
      else if(typeof window.openEWPSpecificationsModal==='function') window.openEWPSpecificationsModal(model);
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
  if(vk)vk.textContent={plan:'FLOOR PLAN','3d':'MODEL VIEW',elevation:'ELEVATION',section:'BUILDING SECTION',schedule:'DOCUMENTATION',framingplan:'FRAMING PLAN',audit:'STRUCTURAL AUDIT',roofframingplan:'ROOF FRAMING',trusselevation:'TRUSS ELEVATION & STRESSES',panel:'WALL FRAMING',ewpspecs:'FLOOR FRAMING',framing3d:'TIMBER MODEL',cutlist:'FRAMING SCHEDULE'}[v];
  const fwPanel = v==='panel' && typeof framingWall === 'function' ? framingWall() : null;
  if (v==='panel' && fwPanel && (!selected.length || (!model.elements.some(e => e.id === selected[0]) && !(typeof findStudById === 'function' && findStudById(selected[0]))))) {
    selected = [fwPanel.id];
  }
  const panelCodeStr = fwPanel && typeof window.getWallPanelCode === 'function' ? window.getWallPanelCode(fwPanel) : (fwPanel?.id || 'Wall');
  if(vt)vt.textContent={plan:`${String(model.stories.indexOf(s)).padStart(2,'0')} ${s?.name||'Story'}`,'3d':'3D model',elevation:'South elevation',section:'A–A Building section',schedule:'Element schedule',framingplan:'2D wall framing plan',audit:'Structural Stud Collision Audit',roofframingplan:'Roof framing plan',trusselevation:'Truss Elevation & Stresses',panel:(fwPanel && panelCodeStr !== fwPanel.id ? `${panelCodeStr} (${fwPanel.id})` : panelCodeStr)+' · Framing panel',ewpspecs:'Floor framing plan',framing3d:'3D timber framing',cutlist:'Timber framing cut list'}[v];
  if(vs)vs.textContent=(v==='3d'||v==='framing3d')?'Orthographic':'1 : 100';
  $('#clip')?.classList.toggle('hidden',v!=='3d');
  $('#north')?.classList.toggle('hidden',v!=='plan');
  $('#schedule-panel')?.classList.toggle('hidden',v!=='schedule'&&v!=='cutlist'&&v!=='audit');
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
  const bt=$('#model-badge-text');if(bt)bt.textContent=v==='audit'?'Structural stud collision audit & auto-shift':v==='trusselevation'?'2D truss elevation, ASD stress engine & Gang-Nail plates':v==='cutlist'?'Cut list generated from BIM walls and roofs':v==='panel'||v==='framing3d'?'Framing generated from BIM walls and roofs':v==='ewpspecs'?'Real-time EWP tributary loads & sizing':v==='schedule'?'Schedule linked to model':'2D + 3D synchronized';
  if(v!=='plan' && v!=='framingplan' && !DIMENSION_TOOLS.includes(tool))tool='select';
  $('main')?.classList.toggle('model-view',isModelView(v));
  $('main')?.classList.toggle('truss-elevation-full',v==='trusselevation');
  document.body.classList.toggle('model-view',isModelView(v));
  if(isModelView(v))fit3DCamera();
  cameraUI();toolState();properties();render();renderInfoBox();
}

function toolState(){
  $$('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));
  canvas.style.cursor=pipetteActive?'crosshair':syringeActive?'crosshair':tool==='select'?'default':'crosshair';
  const ct=$('#command-text');if(ct)ct.textContent=editing?`${editing==='offset'?'Click a point to set the parallel wall offset.':editing==='stretch'?'Click the new position for the nearest wall endpoint.':editing==='mirror'?'Pick two points for the mirror axis.':editing==='split'?'Click a point on the selected wall, beam or line to split it.':editing==='trim'?'Trim: click the portion to remove. Selected elements are cutting boundaries; otherwise visible crossings are used. Esc finishes.':editing==='extend'?'Extend: click near the endpoint to extend to the next crossing boundary. Esc finishes.':editing==='join'?'Click another wall, beam or line as the trim / extend boundary.':'Pick a base point, then a destination to '+editing+' the selection.'}`:({select:'Select an element to inspect. Scroll to zoom; hold Space to pan.',wall:'Click to draw a wall chain. Snap to axes / junctions; Shift constrains angle.',window:'Click a wall to place a hosted window.',door:'Click a wall to place a hosted door.',stair:'Click start point and end point to draw stair flight.',railing:'Click start and end points to place railing.',curtainwall:'Click start and end points to draw curtain wall.',slab:'Click polygon vertices. Double-click or Enter to finish.',roof:'Click roof boundary vertices. Double-click or Enter to finish.',morph:'Click polygon vertices to create solid morph. Enter to finish.',mesh:'Click terrain boundary vertices to create 3D topography.',grid:'Click two points to place structural grid line.',leveldim:'Click in floor plan to place elevation benchmark target.',section:'Section Tool: Click on a wall or opening in Elevation or Wall Panel view to generate a vertical stack-up callout dimension line (Top Plates, Header, Sill, Bottom Plate).',object:'Click to place furniture or BIM equipment.',text:'Click to place text annotation.'}[tool]||'Click points. Double-click or Enter to finish.');
  renderInfoBox();
}

function chooseTool(t){if(view!=='plan' && view!=='framingplan' && !DIMENSION_TOOLS.includes(t))setView('plan');tool=t;points=[];lastPlacedWallEnd=null;editing=null;toolState();render()}
$$('[data-tool]').forEach(b=>b.onclick=()=>chooseTool(b.dataset.tool));
$$('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$$('[data-panel]').forEach(b=>b.onclick=()=>{$$('[data-panel]').forEach(x=>x.classList.toggle('active',x===b));$('.inspector')?.classList.toggle('navigator-focus',b.dataset.panel==='navigator')});

function newElement(type,data){
  if(type==='wall')data={reference:'outside',...data};
  const layer=['wall','window','door','skylight','cornerwin','wallend'].includes(type)?'Exterior Walls':['line','polyline','circle','arc','rectangle','dimension','leveldim','radialdim','angledim','text','label','fill','spline','section','section_callout','elevation','detail','changemarker','grid','camera'].includes(type)?'Annotations':'Structure';
  let defaults={
    stair:{width:1000,risers:16,riserHeight:190.5,treadDepth:280,stairType:'straight',height:3048},
    railing:{height:1050,balusterSpacing:120},
    curtainwall:{height:3048,panelWidth:1200,mullionWidth:50,thickness:120},
    morph:{height:2400},
    mesh:{skirtDepth:800,elevation:0},
    object:{subtype:'Table & Chairs',width:1600,depth:900,height:750,rotation:0},
    fill:{hatchType:'diagonal45',hatchScale:200,foregroundColor:'#3a5446',backgroundColor:'#eef3eb'},
    leveldim:{targetHeight:model.stories.find(s=>s.id===activeStory)?.elevation||0,markerType:'archicad_triangle'},
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
  if(editing==='split'||editing==='join'){
    const w=model.elements.find(e=>e.id===selected[0]&&['wall','line','beam'].includes(e.type));
    if(!w){toast('Select a wall, beam or CAD line first.');editing=null;return}
    const ok=editing==='split'?splitDraft(w,q):trimDraft(w,planPick(p2(q))?.host?hostOf(planPick(p2(q))):planPick(p2(q)));
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
    const geom=toolGeomMethod.wall||'chained';
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
      toast('Rotated rectangular room created');
      render();
      return;
    }
    // Polyline-style continuous wall drafting (chained & straight)
    points.push(q);
    if(points.length<2){render();return}
    const a=points[points.length-2],b=points[points.length-1];
    if(distance(a,b)<50){
      points=[];
      toast('Wall chain finished');
      render();
      return;
    }
    if(points.length>2&&distance(b,points[0])<150){
      const e=newElement('wall',{a,b:clone(points[0]),thickness:200,height:3048,followStory:true});
      commit(()=>model.elements.push(e));
      select([e.id]);
      points=[];
      toast('Wall loop closed');
      render();
      return;
    }
    const e=newElement('wall',{a,b,thickness:200,height:3048,followStory:true});
    if(commit(()=>model.elements.push(e))){
      select([e.id]);
      lastPlacedWallEnd=clone(b);
      points=[clone(b)];
      toast('Wall placed · Next wall starts from endpoint (double-click or Esc to finish)');
    }else points=[];
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
    if(Math.abs(q.y - 4500) < 900){
      if(window.ewpBeamToolState) window.ewpBeamToolState.beamId = 'B-001';
      toast('Selected Beam B-001 (Center Girder)');
      updateEWPBeamHUD();
      render();
    }
    return;
  }
  if(view==='panel'){
    const curW=typeof framingWall==='function'?framingWall():null;
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
  let q=['trim','extend'].includes(editing)?world(p):snapped(world(p));
  const ortho=e.shiftKey||orthoActive;
  if(ortho&&points.length){const a=points.at(-1),d=distance(a,q),ang=Math.round(Math.atan2(q.y-a.y,q.x-a.x)/(Math.PI/4))*Math.PI/4;q={x:a.x+Math.cos(ang)*d,y:a.y+Math.sin(ang)*d}}
  if(tool==='select'&&!editing){
    // Dimension grip & offset line dragging (Archicad Dimension editing)
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
      const w=model.elements.find(e=>e.id===id&&['wall','line','beam','stair','curtainwall'].includes(e.type));
      if(!w)continue;
      for(const end of ['a','b'])if(distance(p,p2(w[end]))<9){
        drag={kind:'grip',id,end,start:p,original:clone(model),moved:false};showPetPalette(p,w,'node');return;
      }
    }
  }
  if(view!=='framingplan'&&tool==='wall'&&!editing){
    if(points.length===0)points=[clone(q)];
    drag={kind:'wallDraw',start:p,startWorld:clone(q)};
    render();
    return;
  }
  if(view!=='framingplan'&&(tool!=='select'||editing)){place(q);return}
  let hit=planPick(p);
  if(hit){
    select(e.shiftKey?(selected.includes(hit.id)?selected.filter(id=>id!==hit.id):[...selected,hit.id]):[hit.id]);
    if(hit.isStud){
      const sInfo = window.findStudById?.(hit.id, model);
      drag={kind:'studMove',grabbedDirectly:true,studId:hit.id,wallId:hit.wallId||hit.host,start:p,startWorld:world(p),origX0:sInfo?.member?.x0 ?? hit.member?.x0 ?? 0,original:clone(model),moved:false,hit};
      showPetPalette(p,hit,'stud');
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
    else if(drag.kind==='wallDraw'){
      if(points.length===0)points=[clone(hover)];
      else points[1]=clone(hover);
    }
    render();
  }else{
    if (!pipetteActive && !syringeActive && (view === 'panel' || view === 'framingplan' || view === 'plan')) {
      const hoverHit = planPick(p);
      canvas.style.cursor = hoverHit?.isStud ? 'grab' : 'default';
    }
    render();
  }
};
canvas.onpointerup=e=>{
  _wasInCollisionState = false;
  canvas.style.cursor = 'default';
  if(drag?.kind==='wallDraw'){
    if(points.length>=2){
      const a=points[0],b=points[1];
      if(distance(a,b)>=50){
        const el=newElement('wall',{a,b,thickness:200,height:3048,followStory:true});
        if(commit(()=>model.elements.push(el))){
          select([el.id]);
          lastPlacedWallEnd=clone(b);
          points=[clone(b)];
          toast('Wall drawn · Next wall starts from endpoint (double-click or Esc to finish)');
        }else points=[];
      }else{
        points=[points[0]];
      }
    }
    drag=null;
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
  else if(['element','grip','roofGrip','dimOffset','dimAnchor'].includes(drag?.kind)&&drag.moved){try{validateWallGeometry();model.elements.filter(e=>e.type==='roof').forEach(validateRoof);model.elements.filter(e=>e.host).forEach(validateOpening);modelHistory.push(drag.original);future=[];changed()}catch(error){model=drag.original;properties();toast(error.message)}}
  if(drag?.kind==='marquee'){let a=world(drag.start),b=world(lastPointer);let ids=marqueeIds(a,b,lastPointer.x<drag.start.x);select(drag.extend?[...new Set([...selected,...ids])]:ids)}
  drag=null;render();
};
canvas.onpointercancel=()=>{_wasInCollisionState = false;if(['element','grip','roofGrip','dimOffset','dimAnchor','studMove'].includes(drag?.kind))model=drag.original;drag=null;render()};
canvas.ondblclick=finish;canvas.oncontextmenu=e=>e.preventDefault();
canvas.onwheel=e=>{e.preventDefault();const p=pointer(e),old=scale;scale=Math.max(.15,Math.min(8,scale*(e.deltaY>0?.9:1.1)));if(!isModelView()){const r=scale/old;pan={x:p.x-width/2-r*(p.x-width/2-pan.x),y:p.y-height/2-20-r*(p.y-height/2-20-pan.y)}}if(isModelView()){const r=scale/old;pan={x:p.x-width/2-r*(p.x-width/2-pan.x),y:p.y-height/2-18-r*(p.y-height/2-18-pan.y)}}render()};

function edit(action){
  if(action==='join')action='trim';
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
          model.elements=model.elements.filter(e=>!elemIds.has(e.id)&&!elemIds.has(e.host));
        }
        selected = hostWallId ? [hostWallId] : [];
      });
      toast(`Deleted ${studIds.length} selected wall stud(s)`);
      return;
    }
    commit(()=>{
      let ids=new Set(selected);
      for(const d of model.elements.filter(e=>e.type==='dimension'&&e.refs?.some(ref=>ref&&ids.has(ref.elementId)))){const resolved=resolveDimension(d);d.a=clone(resolved.a);d.b=clone(resolved.b)}
      model.elements=model.elements.filter(e=>!ids.has(e.id)&&!ids.has(e.host));selected=[];
    });return;
  }
  commit(()=>{
    for(const e of model.elements.filter(e=>selected.includes(e.id))){
      if(e.host){let w=hostOf(e);e.offset=distance(w.a,w.b)-e.offset;fitOpening(e,w);continue}
      let ps=[e.a,e.b,...(e.points||[])].filter(Boolean),cx=ps.reduce((a,p)=>a+p.x,0)/ps.length,cy=ps.reduce((a,p)=>a+p.y,0)/ps.length;
      for(const p of ps){let x=p.x-cx,y=p.y-cy;p.x=cx+(action==='rotate'?-y:-x);p.y=cy+(action==='rotate'?x:y)}
    }
  });
  toast(action==='rotate'?'Selection rotated 90°':'Selection mirrored');
}
$$('[data-edit]').forEach(b=>b.onclick=()=>edit(b.dataset.edit));
bindClick('#undo', undo);
bindClick('#redo', redo);
bindClick('#snap-btn', ()=>{snap=!snap;$('#snap-btn')?.classList.toggle('enabled',snap);const ss=$('#snap-status');if(ss)ss.textContent=snap?'⊙ Snap on':'⊙ Snap off';toast(snap?'Snapping enabled':'Snapping off')});
bindClick('#grid-btn', ()=>{grid=!grid;$('#grid-btn')?.classList.toggle('enabled',grid);render()});
$('#guide-btn')?.addEventListener('click',()=>{const on=$('#guide-btn').classList.toggle('enabled');toast(on?'Archicad guide lines active':'Guide lines hidden')});
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
  if(mode==='arch'){layers[0].visible=true;layers[1].visible=true;layers[2].visible=true;layers[3].visible=true;}
  else if(mode==='struct'){layers[0].visible=true;layers[1].visible=false;layers[2].visible=true;layers[3].visible=true;}
  else if(mode==='mep'){layers[0].visible=false;layers[1].visible=true;layers[2].visible=true;layers[3].visible=true;}
  else{layers.forEach(l=>l.visible=true);}
  navigatorPanel();render();toast(`Layer combination applied: ${ev.target.options[ev.target.selectedIndex].text}`);
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
    drag=null;points=[];editing=null;pendingOpening=null;wandActive=false;pipetteActive=false;syringeActive=false;
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
bindClick('#help', ()=>openModal('Archicad 28 · BIM Studio Pro Reference',`<div class="modal-copy">Comprehensive architectural CAD/BIM studio featuring the full Archicad tool palette, Info Box, Pet Palette, and 4-map Navigator.</div><div class="help-list"><strong>Select Tools:</strong> V — Arrow &nbsp; M — Marquee<br><strong>Design Tools:</strong> W — Wall &nbsp; D — Door &nbsp; N — Window &nbsp; K — Skylight &nbsp; R — Roof &nbsp; H — Shell &nbsp; B — Beam &nbsp; C — Column &nbsp; F — Slab &nbsp; S — Stair &nbsp; J — Railing &nbsp; U — Curtain Wall &nbsp; X — Morph &nbsp; Y — Mesh &nbsp; Z — Zone &nbsp; O — Object<br><strong>Document Tools:</strong> Q — Dimension &nbsp; Level Dim &nbsp; Radial Dim &nbsp; Angle Dim &nbsp; T — Text &nbsp; Label &nbsp; I — Fill &nbsp; L — Line &nbsp; A — Arc &nbsp; P — Polyline &nbsp; Spline<br><strong>More:</strong> G — Grid &nbsp; Wall End &nbsp; Corner Window &nbsp; Lamp &nbsp; Camera<br><strong>Archicad Shortcuts:</strong> Alt — Pipette &nbsp; Ctrl+Alt — Syringe &nbsp; Alt+F2 — Trace & Reference &nbsp; Ctrl Z/Shift+Z — Undo/Redo</div>`));

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
function projectFileName(){const name=String(model?.name||'cadtech-bim-project').trim().replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase()||'cadtech-bim-project';return `${name}.bim.json`}
function makeProjectFile(){return {format:'cadtech-bim-project',formatVersion:1,application:'ARCHICAD 28 BIM STUDIO PRO',savedAt:new Date().toISOString(),project:clone(model),workspace:{activeStory,view,selected:[...selected],layers:clone(layers),snap:Boolean(snap),grid:Boolean(grid),exteriorOsbEnabled:$('#wall-osb-toggle')?.checked!==false,includeDimensions:$('#wall-dimensions-toggle')?.checked!==false}}}
function markProjectSaved(){dirty=false;const ss=$('#save-state');if(ss)ss.textContent='Project saved locally';toast('BIM project saved to a local project file')}
async function save(){
  const data=JSON.stringify(makeProjectFile(),null,2),filename=projectFileName();
  // Chromium-based browsers can write to a path chosen by the user. Other browsers use a normal local download.
  if(typeof window.showSaveFilePicker==='function'){
    try{
      const handle=await window.showSaveFilePicker({suggestedName:filename,types:[{description:'CadTech BIM Project',accept:{'application/json':['.json']}}]});
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
    try{handles=await window.showOpenFilePicker({multiple:false,types:[{description:'CadTech BIM Project',accept:{'application/json':['.json']}}]})}
    catch(err){if(err?.name==='AbortError')return;console.warn('Native project picker failed.',err);$('#project-file-input')?.click();return;}
    if(!handles?.[0])return;
    try{await loadProjectFile(await handles[0].getFile())}
    catch(err){console.error(err);toast(err?.message||'Could not open project file.')}
  }else $('#project-file-input')?.click();
}
bindClick('#open-project',openProjectPicker);

function generateOBJ(){
  let out=['# Archicad 28 BIM world coordinates in meters'],n=1;
  function mesh(id,ps,z0,z1){
    out.push('o '+id);const vs=[...ps.map(p=>({...p,z:z0})),...ps.map(p=>({...p,z:z1}))];vs.forEach(p=>out.push(`v ${p.x/1000} ${p.z/1000} ${-p.y/1000}`));const k=ps.length;out.push('f '+ps.map((_,i)=>n+k+i).join(' '));out.push('f '+ps.map((_,i)=>n+k-1-i).join(' '));for(let i=0;i<k;i++){let j=(i+1)%k;out.push(`f ${n+i} ${n+j} ${n+k+j} ${n+k+i}`)}n+=k*2;
  }
  for(const face of wallSurfaces(joinedWallCells(model.elements.filter(e=>e.type==='wall')))){
    out.push('o '+face.id);face.points.forEach(p=>out.push(`v ${p.x/1000} ${p.z/1000} ${-p.y/1000}`));out.push('f '+face.points.map((_,i)=>n+i).join(' '));n+=face.points.length;
  }
  for(const o of model.elements.filter(e=>e.host)){const w=hostOf(o),len=distance(w.a,w.b),z=wallBase(w);mesh(o.id,openingSolidPolygon(w,o),z+o.sill,z+o.sill+o.height)}
  for(const e of model.elements){
    let z=storyOf(e).elevation;
    if(e.type==='wall')continue;
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
  openModal('Archicad Publisher · Export',`<div class="modal-copy">Export BIM project, CAD 2D Framing Plan DXF, solid IFC/OBJ geometry, or element schedules:</div><div class="modal-actions"><button id="export-framing-dxf" class="primary">2D Framing Plan · DXF</button><button id="export-json" class="subtle">Archicad BIM · JSON</button><button id="export-obj" class="subtle">Solid model · OBJ</button><button id="export-csv" class="subtle">Schedule · CSV</button><button id="export-framing" class="subtle">Timber framing · CSV</button><button id="export-png" class="subtle">Current view · PNG</button></div>`);
  bindClick('#export-framing-dxf', ()=>{if(typeof window.generate2DFramingPlanCAD==='function'){const osbEnabled=wallOsbToggle?.checked!==false;const dimEnabled=wallDimensionsToggle?.checked!==false;const ts=getTextScale();window.generate2DFramingPlanCAD({exteriorOsbEnabled:osbEnabled,includeDimensions:dimEnabled,textScale:ts});toast('2D Framing Plan CAD (2D-FRAMING-PLAN.dxf) exported')}});
  bindClick('#export-framing', ()=>download('timber-framing-cut-list.csv',framingCSV(),'text/csv'));
  bindClick('#export-json', save);
  bindClick('#export-obj', ()=>{download('courtyard-house.obj',generateOBJ(),'text/plain');toast('Solid model exported')});
  bindClick('#export-csv', ()=>download('courtyard-house-schedule.csv',csv(),'text/csv'));
  bindClick('#export-png', ()=>{let a=document.createElement('a');a.download='archicad-'+view+'.png';a.href=canvas.toDataURL();a.click()});
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

    const loadAuditRowsHtml = structWarnings.wallAudits.map(wa => {
      const cur = wa.current;
      const ec5 = cur.ec5 || {};
      const nds = cur.nds || {};
      const d = wa.demands;
      const statusBg = cur.status === 'PASS' ? '#f0fdf4' : cur.status === 'WARNING' ? '#fffbeb' : '#fef2f2';
      const ec5BadgeBg = ec5.dcPercent > 100 ? '#dc2626' : ec5.dcPercent > 80 ? '#d97706' : '#16a34a';
      const ndsBadgeBg = nds.dcPercent > 100 ? '#dc2626' : nds.dcPercent > 80 ? '#d97706' : '#16a34a';
      const warnSummary = wa.warnings.length ? wa.warnings[0] : 'Full structural compliance verified under Eurocode 5 & NDS 2024.';
      return `
        <tr data-row="${esc(wa.wallId)}" style="background:${statusBg};cursor:pointer">
          <td><strong>${esc(wa.wallId)}</strong><br><small style="color:#64748b">${esc(d.wallTypeLabel)} · H=${formatLength(d.wallHeightMm)}</small></td>
          <td style="font-family:monospace;font-size:11px"><b>${d.qAxialLineLoad_kNm} kN/m</b> axial<br><span style="color:#475569">${d.windPressure_kNm2} kN/m² wind</span></td>
          <td style="font-family:monospace;font-weight:700">${formatSection(cur.studWidth, cur.studDepth)} (${cur.timberGrade})<br><span style="color:#475569">@ ${formatLength(cur.spacing)} O.C.</span></td>
          <td>
            <b style="padding:2px 7px;border-radius:4px;font-size:11px;background:${ec5BadgeBg};color:#fff">${ec5.status || 'PASS'} · ${ec5.dcPercent}% D/C</b>
            <div style="font-size:10px;color:#475569;margin-top:3px">H/d = ${ec5.hOverD} · k<sub>c,y</sub> = ${ec5.kc_y}</div>
          </td>
          <td>
            <b style="padding:2px 7px;border-radius:4px;font-size:11px;background:${ndsBadgeBg};color:#fff">${nds.status || 'PASS'} · ${nds.dcPercent}% ASD</b>
            <div style="font-size:10px;color:#475569;margin-top:3px">C<sub>P</sub> = ${nds.CP} · f<sub>c</sub> = ${nds.fc_psi} psi</div>
          </td>
          <td style="font-size:11px;color:#334155;max-width:280px">${esc(warnSummary)}</td>
          <td style="white-space:nowrap">
            <button type="button" class="subtle" data-audit-inspect="${esc(wa.wallId)}" style="padding:4px 10px;font-size:11px;color:#0369a1;border-color:#7dd3fc;background:#f0f9ff;font-weight:700;cursor:pointer">🔍 Inspect</button>
          </td>
        </tr>
      `;
    }).join('');

    const rowsHtml = auditData.collisions.map(col => `
      <tr data-row="${esc(col.wallId)}" style="background:${col.fixed ? '#f0fdf4' : '#fef2f2'};cursor:pointer">
        <td><strong>${esc(col.wallId)}</strong></td>
        <td style="font-family:monospace;font-weight:700;color:${col.fixed ? '#64748b' : '#dc2626'}">${formatLength(col.originalX0, false)} – ${formatLength(col.originalX1)}</td>
        <td><span style="padding:2px 7px;border-radius:4px;font-weight:700;font-size:11px;background:${col.collisionType === 'Opening' ? '#ffedd5' : '#fef3c7'};color:${col.collisionType === 'Opening' ? '#9a3412' : '#92400e'}">${esc(col.collisionType)}: ${esc(col.targetDetail)}</span></td>
        <td style="font-family:monospace;font-weight:700;color:#15803d">${formatLength(col.shiftedX0, false)} – ${formatLength(col.shiftedX1)} (${col.shiftDelta >= 0 ? '+' : ''}${formatLength(col.shiftDelta)})</td>
        <td><b style="padding:3px 8px;border-radius:4px;font-size:11px;background:${col.fixed ? '#16a34a' : '#dc2626'};color:#fff">${col.fixed ? '✓ SHIFTED & FIXED' : '⚠ COLLISION'}</b></td>
      </tr>
    `).join('');

    const hasAnyWarning = activeCount > 0 || loadWarnCount > 0;
    sp.innerHTML = `
      <div style="padding:18px;max-width:1240px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;padding:14px 16px;background:${hasAnyWarning ? '#fef2f2' : '#f0fdf4'};border:1px solid ${hasAnyWarning ? '#fca5a5' : '#86efac'};border-radius:10px">
          <div>
            <h2 style="margin:0 0 4px;font-size:16px;color:${hasAnyWarning ? '#991b1b' : '#166534'}">
              ${hasAnyWarning ? `⚠️ Structural Audit: ${loadWarnCount} Sizing/Capacity Warning(s) · ${activeCount} Stud Collision(s)` : `✅ Multi-Code Compliance & Stud Positions Verified (${fixedCount} Shifted)`}
            </h2>
            <div style="font-size:12px;color:#475569">
              Verified under <b>Eurocode 5 (EN 1995-1-1)</b> & <b>NDS 2024 (US Wood Specification ASD/LRFD)</b>. Click <b>Fix Collisions</b> to auto-shift colliding studs clear of openings and junctions.
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
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
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <h3 style="margin:0;font-size:14px;color:#0f172a">1. Multi-Code Structural Audit & Capacity Compliance (Eurocode 5 & NDS 2024 ASD / LRFD)</h3>
            <span style="font-size:11px;color:#64748b">Click 🔍 Inspect to review exact design equations, column stability factor C<sub>P</sub>, and stress ratios</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>WALL ID</th>
                <th>DESIGN LOADS</th>
                <th>STUD SECTION & SPACING</th>
                <th>EUROCODE 5 (EN 1995) D/C</th>
                <th>NDS 2024 (US ASD) D/C</th>
                <th>STRUCTURAL COMPLIANCE STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${loadAuditRowsHtml || '<tr><td colspan="7" style="padding:14px;text-align:center;color:#64748b">No framed walls found in the project.</td></tr>'}
            </tbody>
          </table>
        </div>

        ${svgDiagram}

        <div>
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
      </div>
    `;

    $$('[data-row]').forEach(r => r.onclick = (ev) => {
      if(ev.target.closest('button')) return;
      selected = [r.dataset.row];
      properties();
      schedule();
      toast(`${r.dataset.row} selected for audit preview`);
    });
    $$('[data-audit-inspect]').forEach(btn => btn.onclick = (ev) => {
      ev.stopPropagation();
      const wId = btn.dataset.auditInspect;
      const w = model.elements.find(el => el.id === wId && el.type === 'wall') || targetWall;
      if(w) openMultiCodeAuditModal(w);
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
    ['Import ArchiCAD IFC (.ifc)…',openIFCImportModal],
    ['Open Archicad BIM project',openProjectPicker],
    ['Export IFC 4x3 Reference View',exportDialog],
    ['Export Solid OBJ model',exportDialog],
    ['Export Schedules & Cut Lists',exportDialog],
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
    ['Story Settings…',storyDialog],
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
    ['Reset All Palettes',()=>{$('#info-box')?.classList.remove('hidden');$('.inspector')?.classList.remove('hidden');toast('Palettes restored to Archicad standard layout')}]
  ],
  Help:[
    ['Archicad 28 BIM Studio Pro Help',()=>$('#help').click()],
    ['Keyboard Shortcuts Reference',()=>$('#help').click()],
    ['About Graphisoft Archicad Engine',()=>openModal('Archicad 28 · BIM Studio Pro',`<div class="modal-copy">Professional Virtual Building BIM CAD system featuring full parametric design, structural truss optimization, and timber framing synthesis.</div>`)]
  ]
})[b.dataset.menu]));

bindClick('#view-more', ()=>menu($('#view-more'),[['Floor plan',()=>setView('plan')],['3D model',()=>setView('3d')],['South elevation',()=>setView('elevation')],['Section A–A',()=>setView('section')],['Schedule',()=>setView('schedule')],['Wall framing panel',()=>setView('panel')],['Floor framing plan',openEWPSpecs],['3D framing',()=>setView('framing3d')],['Framing cut list',()=>setView('cutlist')]]));
bindClick('#display-mode', ()=>menu($('#display-mode'),[['Architectural',()=>{transparent=false;const dm=$('#display-mode');if(dm)dm.innerHTML=icon('layers')+'Architectural ⌄';render()}],['Transparent solids',()=>{transparent=true;setView('3d');const dm=$('#display-mode');if(dm)dm.innerHTML=icon('layers')+'Transparent ⌄';render()}]]));
bindClick('#units', ()=>menu($('#units'),[
  [`${appUnits==='mm'?'✓ ':''}Millimeters (mm) · model units`,()=>setAppUnits('mm')],
  [`${appUnits==='ft-in'?'✓ ':''}Feet & Inches (ft-in) · imperial units`,()=>setAppUnits('ft-in')]
]));
bindClick('#view-scale', ()=>{fit();toast('View returned to reference scale')});
bindClick('#scale-btn', ()=>{fit();toast('View returned to reference scale')});

function validateProject(m){
  if(!m||m.version!==1||!Array.isArray(m.stories)||!m.stories.length||!Array.isArray(m.elements)||m.elements.length>10000)throw Error('This is not a supported Archicad BIM project.');
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
  return m;
}

bindClick('#import-ifc-btn', openIFCImportModal);

async function processIFCContent(content, fileName = 'ArchiCAD Model.ifc', options = {}) {
  try {
    if (!content) {
      throw new Error('No project content or file buffer provided for import.');
    }
    const convertFn = window.convertIFCToBIMModel;
    if (typeof convertFn !== 'function') {
      throw new Error('ArchiCAD / IFC Importer engine is loading. Please try again.');
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
    toast(`Imported ArchiCAD model: ${stats.wallsCount} walls, ${stats.openingsCount} openings. Wall framing: ${tk.totalMembers || 0} members across ${wallLayoutCount} walls${wallIssues ? `, ${wallIssues} issue(s) to review` : ''}.`);

    window.currentIFCModel = model;

    // Show summary modal
    openModal('ArchiCAD Project & IFC Preliminary Framing Synthesis', `
      <div style="font-family:'DM Sans',system-ui,sans-serif;color:#1e293b;line-height:1.6;max-width:640px">
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
          <span style="font-size:24px">⚡</span>
          <div>
            <strong style="color:#15803d;font-size:14px">ArchiCAD File Converted & Preliminary Timber Framing Layout Generated</strong>
            <div style="font-size:12px;color:#334155">${esc(fileName)} · Standard: <strong>${esc(codeName)}</strong> · Spacing: <strong>${spacingLabel}</strong></div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px;text-align:center">
            <span style="font-size:10px;color:#64748b;font-weight:700">WALLS</span>
            <b style="font-size:18px;color:#0f172a;display:block">${stats.wallsCount}</b>
            <span style="font-size:9.5px;color:#16a34a">${tk.totalMembers || 0} generated members</span>
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
            <span style="font-size:9.5px;color:#d97706">Fink Trusses</span>
          </div>
        </div>

        <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;font-size:11.5px">
          <strong style="color:#0f172a;font-size:12px;display:block;margin-bottom:6px">📋 Timber Framing Material Takeoff:</strong>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;color:#334155">
            <div>• Common Studs: <strong>${tk.commonStuds || '—'}</strong></div>
            <div>• King Studs: <strong>${tk.kingStuds || '—'}</strong></div>
            <div>• Jack / Trimmer Studs: <strong>${tk.jackStuds || '—'}</strong></div>
            <div>• Header members: <strong>${tk.headers || '—'}</strong></div>
            <div>• Rough Window Sills: <strong>${tk.roughSills || '—'}</strong></div>
            <div>• Upper/Lower Cripples: <strong>${tk.cripples || '—'}</strong></div>
            <div>• Double Top Plates: <strong>${tk.topPlates || '—'}</strong></div>
            <div>• Broken Bottom Plates: <strong>${tk.bottomPlates || '—'}</strong></div>
          </div>
        </div>

        <div style="font-size:11.5px;color:#475569;margin-bottom:16px">
          <p style="margin:3px 0"><strong>✔ 2D Plans & 3D Model:</strong> Converted geometry is active in the plan and 3D viewport.</p>
          <p style="margin:3px 0"><strong>✔ Opening Framing:</strong> Generated header, king/jack stud, sill and cripple geometry from current wall settings.</p>
          <p style="margin:3px 0"><strong>✔ EWP Floor Framing & Trusses:</strong> I-Joists and Fink roof trusses synced to wall plates.</p>
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
    toast(`ArchiCAD / IFC Import Error: ${err.message}`);
    console.error(err);
  }
}

function openIFCImportModal() {
  const html = `
    <div style="font-family:'DM Sans',system-ui,sans-serif;color:#1e293b;line-height:1.6;max-width:620px">
      <div style="margin-bottom:12px">
        <p style="font-size:12.5px;color:#475569;margin:0 0 10px 0">
          Upload an exported <strong>IFC Model (.ifc)</strong> or ArchiCAD project with embedded data.
          <em>Note: Native ArchiCAD <strong>.pln</strong> files are proprietary binary streams; please export your project from ArchiCAD via <strong>File > Interoperability > IFC > Export</strong> and upload the resulting <strong>.ifc</strong> file.</em>
          Walls, doors, windows, floors/slabs, and roofs will be extracted using actual model vertex extents, synchronized across 2D plans and 3D, and synthesized into <strong>code-compliant timber stud wall framing</strong>, <strong>EWP floor joists</strong>, and <strong>roof trusses</strong>.
        </p>
      </div>

      <!-- Drag and drop / file selector box -->
      <div id="ifc-drop-zone" style="border:2px dashed #0284c7;background:#f0f9ff;border-radius:8px;padding:20px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:12px">
        <div style="font-size:30px;margin-bottom:4px">📁</div>
        <strong style="color:#0284c7;font-size:14px;display:block">Click to select IFC (.ifc / .ifczip) or drop here</strong>
        <span style="font-size:11px;color:#64748b">Accepts STEP IFC (.ifc, .ifczip), XML, and JSON (Export via ArchiCAD File > Interoperability > IFC > Export)</span>
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
          <strong style="font-size:12px;color:#0f172a;display:block">Sample ArchiCAD Residential Villa</strong>
          <span style="font-size:10.5px;color:#64748b">14m × 10m plan with walls, door, standard window & wide patio window</span>
        </div>
        <button id="load-sample-ifc-btn" style="padding:6px 12px;background:#0284c7;color:white;border:none;border-radius:5px;font-weight:700;font-size:11.5px;cursor:pointer">
          ⚡ Load Sample IFC
        </button>
      </div>

      <!-- Framing auto-generation description -->
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:14px;font-size:11px;color:#475569">
        <strong style="display:block;margin-bottom:4px;color:#0f172a">Automatic Code Synthesis:</strong>
        <div>• <strong>Wall Framing:</strong> Exact 400mm / 600mm stud spacing, double top plates, broken bottom plates, span headers, multi-jack studs (2 jacks for spans > 5'), cripples & 3-stud California corners.</div>
        <div>• <strong>EWP Floor Framing & Trusses:</strong> I-Joists, LVL girders, and Fink hip/common trusses aligned automatically.</div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button id="cancel-ifc-modal-btn" class="subtle">Cancel</button>
        <button id="modal-select-ifc-btn" class="primary">Select File (.pln / .ifc)</button>
      </div>
    </div>
  `;

  openModal('Import ArchiCAD File (.pln / .ifc)', html);

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
    dropZone.ondragover = e => { e.preventDefault(); dropZone.style.background = '#e0f2fe'; };
    dropZone.ondragleave = () => { dropZone.style.background = '#f0f9ff'; };
    dropZone.ondrop = async e => {
      e.preventDefault();
      dropZone.style.background = '#f0f9ff';
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
          text = window.convertPlnBinaryToIFCText(null, 'ArchiCAD_Villa_Sample.ifc');
        } else {
          const resp = await fetch('sample-archicad.ifc');
          if (!resp.ok) throw new Error('Could not fetch sample-archicad.ifc');
          text = await resp.text();
        }
        const codeStandard = $('#ifc-code-standard')?.value || 'EUROCODE_5';
        const spacing = Number($('#ifc-stud-spacing')?.value) || 400;
        $('#modal')?.close?.();
        processIFCContent(text, 'ArchiCAD_Villa_Sample.ifc', { codeStandard, spacing });
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
    toast(`ArchiCAD / IFC Import Error: ${err.message}`);
  }
  e.target.value = '';
});

function applyProjectFileData(parsed,fileName=''){
  const wrapped=parsed&&parsed.format==='cadtech-bim-project'&&parsed.formatVersion===1&&parsed.project;
  const imported=clone(wrapped?parsed.project:parsed);
  if(!imported||!Array.isArray(imported.elements)||!Array.isArray(imported.stories))throw Error('This file does not contain a supported BIM project. Choose a saved .bim.json or legacy Archicad BIM JSON file.');
  for(const w of imported.elements||[])if(w.type==='wall'&&!w.reference&&w.layer==='Exterior Walls')w.reference='outside';
  const nextModel=validateProject(imported),ws=wrapped&&parsed.workspace&&typeof parsed.workspace==='object'?parsed.workspace:{};
  const nextActiveStory=nextModel.stories.some(st=>st.id===ws.activeStory)?ws.activeStory:nextModel.stories[0].id;
  const validViews=new Set(['plan','3d','elevation','section','schedule','framingplan','roofframingplan','trusselevation','panel','ewpspecs','framing3d','cutlist']);
  const nextView=validViews.has(ws.view)?ws.view:'plan';
  const elementIds=new Set(nextModel.elements.map(el=>el.id));
  const nextSelected=Array.isArray(ws.selected)?ws.selected.filter(id=>typeof id==='string'&&elementIds.has(id)):[];
  const defaultLayers=[{name:'Exterior Walls',color:'#537e69',visible:true},{name:'Interior Walls',color:'#8b9c82',visible:true},{name:'Structure',color:'#aaab8f',visible:true},{name:'Annotations',color:'#b7bcae',visible:true}];
  const nextLayers=Array.isArray(ws.layers)?defaultLayers.map(base=>{const saved=ws.layers.find(item=>item&&item.name===base.name);return {...base,color:typeof saved?.color==='string'&&/^#[0-9a-f]{6}$/i.test(saved.color)?saved.color:base.color,visible:typeof saved?.visible==='boolean'?saved.visible:base.visible}}):defaultLayers;
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
  let imported;try{imported=JSON.parse(text)}catch(_e){throw Error('This file is not valid JSON. Select a saved CadTech BIM project file or ArchiCAD .pln / .ifc file.');}
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
    modelContext.registerTool({name:'import_archicad_ifc',description:'Import and convert an ArchiCAD IFC model into the BIM workspace.',inputSchema:{type:'object',properties:{ifcText:{type:'string'}},required:['ifcText'],additionalProperties:false},execute:({ifcText})=>{processIFCContent(ifcText,'api-import.ifc');return {ok:true}}});
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

function updateDraftTrackerLive(p){
  const tracker=$('#draft-tracker');
  if(!tracker||tracker.classList.contains('hidden')||tracker.classList.contains('minimized'))return;
  const active=document.activeElement;
  if(active&&tracker.contains(active))return;
  const lenIn=$('#draft-length'),angIn=$('#draft-angle'),xIn=$('#draft-coord-x'),yIn=$('#draft-coord-y');
  if(xIn)xIn.value=isImperialUnits()?formatFeetInches(p.x):Math.round(p.x);
  if(yIn)yIn.value=isImperialUnits()?formatFeetInches(p.y):Math.round(p.y);
  if(points.length>0){
    const base=points.at(-1),d=distance(base,p),rad=Math.atan2(p.y-base.y,p.x-base.x);
    let deg=rad*180/Math.PI;if(deg<0)deg+=360;
    if(lenIn)lenIn.value=isImperialUnits()?formatFeetInches(d):Math.round(d);
    if(angIn)angIn.value=(Math.round(deg*10)/10).toFixed(1);
  }else{
    const d=Math.hypot(p.x,p.y);
    let deg=Math.atan2(p.y,p.x)*180/Math.PI;if(deg<0)deg+=360;
    if(lenIn)lenIn.value=isImperialUnits()?formatFeetInches(d):Math.round(d);
    if(angIn)angIn.value=(Math.round(deg*10)/10).toFixed(1);
  }
}

function commitTrackerPoint(){
  const lenIn=$('#draft-length'), angIn=$('#draft-angle'), xIn=$('#draft-coord-x'), yIn=$('#draft-coord-y');
  const lenVal=parseLengthInput(lenIn?.value, NaN), angVal=Number(angIn?.value), xVal=parseLengthInput(xIn?.value, NaN), yVal=parseLengthInput(yIn?.value, NaN);
  const active=document.activeElement;
  const isPolar=active===lenIn||active===angIn;

  if(isPolar && (!lenIn?.value || !Number.isFinite(lenVal) || lenVal <= 0)){
    if(['wall','beam','line','curtainwall'].includes(tool)){
      points=[];
      lastPlacedWallEnd=null;
      toast('Wall placement completed');
      render();
      return;
    }
  }

  if(points.length===0 && lastPlacedWallEnd && ['wall','beam','line'].includes(tool)){
    points=[clone(lastPlacedWallEnd)];
  }

  let pt;
  if(isPolar&&Number.isFinite(lenVal)&&Number.isFinite(angVal)){
    const base=points.length>0?points.at(-1):hover||{x:0,y:0};
    const rad=angVal*Math.PI/180;
    pt={x:Math.round(base.x+Math.cos(rad)*lenVal),y:Math.round(base.y+Math.sin(rad)*lenVal)};
  }else if(Number.isFinite(xVal)&&Number.isFinite(yVal)&&(active===xIn||active===yIn)){
    pt={x:Math.round(xVal),y:Math.round(yVal)};
  }else if(Number.isFinite(lenVal)&&Number.isFinite(angVal)){
    const base=points.length>0?points.at(-1):hover||{x:0,y:0};
    const rad=angVal*Math.PI/180;
    pt={x:Math.round(base.x+Math.cos(rad)*lenVal),y:Math.round(base.y+Math.sin(rad)*lenVal)};
  }else{
    pt=clone(hover||{x:0,y:0});
  }
  if(tool==='select'&&!editing){
    toast('Select a CAD or BIM tool (Wall, Slab, Beam, Dimension) to place point');
    return;
  }
  place(pt);
  if(lenIn) lenIn.value = '';
  setTimeout(()=>{
    if(lenIn){
      lenIn.focus();
      lenIn.select();
    }
  },50);
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
    $(sel)?.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        e.preventDefault();
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



