const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map(),ctx=new Proxy({},{get:()=>()=>{}});
function node(s){if(!nodes.has(s))nodes.set(s,{style:{},dataset:{},value:'0',classList:{add(){},remove(){},toggle(){},contains(){return false}},querySelectorAll:()=>[],querySelector:()=>null,insertAdjacentHTML(){},addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:0,height:0}),children:[],close(){},showModal(){},click(){}});return nodes.get(s)}
const box={document:{body:node('body'),querySelector:node,querySelectorAll:()=>[],addEventListener(){},createElement:node},ResizeObserver:class{observe(){}},devicePixelRatio:1,console,setTimeout,clearTimeout,URL,Blob};
vm.createContext(box);for(const f of ['joins.js','framing.js','camera.js','advanced.js','trim.js','editing.js','roof-footprint.js','roof.js','truss-joints.js','hip-trusses.js','roof-framing.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),box);
const run=s=>vm.runInContext(s,box);
run('render=()=>{};properties=()=>{};navigator=()=>{};toast=()=>{};model=clone(model);');
// V3.94: (1) no truss within one spacing of an end girder - the too-close truss is dropped and the girder moves onto it;
// (2) side jacks always start one spacing from the girder, with no gap wider than one spacing (+10%) anywhere.
const SP=600,SB=1828.8;let moved=0,cases=0;
for(const L of [10267.6,10000,10500,11000,11300,12000,12600,13000,13700,14000])for(const angle of [0,.41]){
  run(`model.elements=[{id:'R',type:'roof',story:'s0',layer:'Structure',points:[{x:0,y:0},{x:${L},y:0},{x:${L},y:9000},{x:0,y:9000}].map(p=>({x:p.x*Math.cos(${angle})-p.y*Math.sin(${angle}),y:p.x*Math.sin(${angle})+p.y*Math.cos(${angle})})),pitch:25,height:3000,overhang:609.6,thickness:200,roofType:'hip',roofFraming:{system:'trusses',spacing:${SP},width:45,depth:190,webDepth:90,heel:300,girderPlies:2,hipSetback:${SB}}}];var h=generateRoofFraming(model.elements[0]);var A=${angle};var loc=p=>p.x*Math.cos(A)+p.y*Math.sin(A);`);
  const girders=run(`(()=>{const g=h.members.filter(m=>m.type==='Girder truss bottom chord').map(m=>(loc(m.a)+loc(m.b))/2);const lo=g.filter(x=>x<${L}/2),hi=g.filter(x=>x>=${L}/2),avg=a=>a.reduce((s,v)=>s+v,0)/a.length;return [avg(lo),avg(hi)]})()`);
  const tag=`L=${L} angle=${angle}`;cases++;
  assert(Math.abs(girders[0]-SB)<1,`${tag}: near girder stays at the default setback (got ${girders[0]})`);
  if(girders[1]<L-SB-1)moved++;
  const trussX=run(`h.members.filter(m=>/^(Common|Hip) truss top chord/.test(m.type)).map(m=>(loc(m.a)+loc(m.b))/2)`);
  for(const g of girders)for(const x of trussX)assert(Math.abs(x-g)>=SP-1,`${tag}: truss at ${x.toFixed(1)} is ${Math.abs(x-g).toFixed(1)} mm from a girder (< ${SP})`);
  // consecutive common/hip trusses stay on the 600 grid
  const xs=[...new Set(trussX.map(x=>Math.round(x*10)/10))].sort((a,b)=>a-b);
  for(let i=1;i<xs.length;i++)assert(Math.abs(xs[i]-xs[i-1]-SP)<1,`${tag}: truss spacing ${xs[i]-xs[i-1]}`);
  // side jacks: from eave (0 / L) to girder, no gap > 1.1 spacing, none below 12 in, first jack exactly one spacing from girder
  const sx=[...new Set(run(`h.members.filter(m=>m.type==='Side jack top chord').map(m=>Math.round((loc(m.a)+loc(m.b))/2*10)/10)`))].sort((a,b)=>a-b);
  const left=sx.filter(x=>x<L/2),right=sx.filter(x=>x>=L/2).sort((a,b)=>b-a);
  for(const [side,list,eave,g] of [['left',left,0,girders[0]],['right',right.map(x=>L-x),0,L-girders[1]]]){
    const pts=[eave,...list.sort((a,b)=>a-b)],gx=side==='left'?g:g;
    for(let i=1;i<pts.length;i++){assert(pts[i]-pts[i-1]<=SP*1.1+.5,`${tag} ${side}: side-jack gap ${(pts[i]-pts[i-1]).toFixed(1)}`);assert(pts[i]-pts[i-1]>=304.8-.5,`${tag} ${side}: side jacks closer than 12 in`);}
    assert(Math.abs(gx-pts.at(-1)-SP)<1,`${tag} ${side}: nearest side jack should be ${SP} mm from the girder, got ${(gx-pts.at(-1)).toFixed(1)}`);
  }
}
assert(moved>0&&moved<cases,'at least one case should have moved the far girder');
console.log(`PASS: ${cases} roofs; far girder moved in ${moved}; no truss closer than 600 mm to a girder; side jacks start 600 mm from the girder with no wide gaps.`);
// V3.94b: front jacks anchored one spacing from the neighbouring (orange) truss at a flush end of an L plan.
run(`model.elements=[{id:'R',type:'roof',story:'s0',layer:'Structure',points:[[0,0],[14000,0],[14000,4300],[8000,4300],[8000,9100],[0,9100]].map(p=>({x:p[0],y:p[1]})),pitch:25,height:3000,overhang:609.6,thickness:200,roofType:'hip',roofFraming:{system:'trusses',spacing:600,width:45,depth:190,webDepth:90,heel:300,girderPlies:2,hipSetback:1828.8}}];var h=generateRoofFraming(model.elements[0]);`);
const fx=run(`[...new Set(h.members.filter(m=>m.type==='Front jack top chord'&&/-W1-/.test(m.assembly)&&Math.abs(m.a.y+610)<2).map(m=>Math.round(m.a.x)))]`).sort((a,b)=>a-b);
assert(Math.abs(8000-fx.at(-1)-600)<1,`front jack nearest the flush end should be 600 mm from it, got ${8000-fx.at(-1)}`);
for(let i=1;i<fx.length;i++)assert(fx[i]-fx[i-1]<=660,'front-jack gap too wide');
console.log('PASS: front jacks start 600 mm from the orange truss at a flush end.');
