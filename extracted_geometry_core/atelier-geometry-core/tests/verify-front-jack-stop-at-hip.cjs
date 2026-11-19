const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map(),ctx=new Proxy({},{get:()=>()=>{}});
function node(s){if(!nodes.has(s))nodes.set(s,{style:{},dataset:{},value:'0',classList:{add(){},remove(){},toggle(){},contains(){return false}},querySelectorAll:()=>[],querySelector:()=>null,insertAdjacentHTML(){},addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:0,height:0}),children:[],close(){},showModal(){},click(){}});return nodes.get(s)}
const box={document:{body:node('body'),querySelector:node,querySelectorAll:()=>[],addEventListener(){},createElement:node},ResizeObserver:class{observe(){}},devicePixelRatio:1,console,setTimeout,clearTimeout,URL,Blob};
vm.createContext(box);for(const f of ['joins.js','framing.js','camera.js','advanced.js','trim.js','editing.js','roof-footprint.js','roof.js','truss-joints.js','hip-trusses.js','roof-framing.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),box);
const run=s=>vm.runInContext(s,box);
run('render=()=>{};properties=()=>{};navigator=()=>{};toast=()=>{};model=clone(model);model.elements=[{id:"R-FJ-HIP-STOP",type:"roof",story:"s0",layer:"Structure",points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],pitch:25,height:3000,overhang:609.6,thickness:200,roofType:"hip",roofFraming:{system:"trusses",spacing:600,width:45,depth:190,webDepth:90,heel:300,girderPlies:2,hipSetback:1828.8}}];var h=generateRoofFraming(model.elements[0]);');
const members=run('h.members'),dist3=(p,a,b)=>{const d={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},l=d.x*d.x+d.y*d.y+d.z*d.z,t=Math.max(0,Math.min(1,((p.x-a.x)*d.x+(p.y-a.y)*d.y+(p.z-a.z)*d.z)/(l||1)));return Math.hypot(p.x-a.x-d.x*t,p.y-a.y-d.y*t,p.z-a.z-d.z*t)};
const connected=members.filter(m=>m.type==='Front jack top chord'&&m.receiverAssembly&&members.some(q=>q.assembly===m.receiverAssembly&&q.type==='Hip carrier top chord'));
assert(connected.length>=4,'corner-zone front jack top chords must bind to a pink hip carrier');
for(const m of connected){
 const chordPairs=[
  [m,'Hip carrier top chord','top'],
  [members.find(q=>q.assembly===m.assembly&&q.type==='Front jack bottom chord'),'Hip carrier bottom chord','bottom']
 ];
 for(const [jack,carrierType,label] of chordPairs){
  assert(jack,`${m.assembly} needs a front-jack ${label} chord`);
  assert(jack.receiverAssembly===m.receiverAssembly,`${m.assembly} top and bottom chords must reference the same pink hip carrier`);
  const q=members.find(q=>q.assembly===jack.receiverAssembly&&q.type===carrierType);
  assert(q,`${m.assembly} must reference its own ${carrierType}`);
  const nearest=Math.min(dist3(jack.a,q.a,q.b),dist3(jack.b,q.a,q.b));
  assert(nearest<.1,`${m.assembly} ${label}-chord centerline endpoint must lie on the carrier in 3D; distance ${nearest.toFixed(3)} mm`);
  assert(jack.cutFaces?.length>=4,`${m.assembly} ${label} chord must carry finished trim faces`);
  const dx=q.b.x-q.a.x,dy=q.b.y-q.a.y,len=Math.hypot(dx,dy);assert(len>1,'carrier plan length');
  let n={x:-dy/len,y:dx/len};const mid={x:(jack.a.x+jack.b.x)/2,y:(jack.a.y+jack.b.y)/2};if((mid.x-q.a.x)*n.x+(mid.y-q.a.y)*n.y<0){n.x=-n.x;n.y=-n.y}
  const signed=jack.cutFaces.flat().map(p=>(p.x-q.a.x)*n.x+(p.y-q.a.y)*n.y),min=Math.min(...signed);
  assert(min>=q.width/2-1.5,`${m.assembly} ${label} chord solid must stop at the near face of its assigned hip carrier; clearance ${min.toFixed(2)} mm`);
 }
}
const girderBound=members.filter(m=>m.type==='Front jack top chord'&&m.receiverAssembly&&members.some(q=>q.assembly===m.receiverAssembly&&q.type==='Girder truss top chord'));assert(girderBound.length>0,'central front jacks must bind to their assigned girder ply');for(const m of girderBound){const bottom=members.find(q=>q.assembly===m.assembly&&q.type==='Front jack bottom chord');assert(bottom&&bottom.receiverAssembly===m.receiverAssembly,'girder-bound top and bottom chords share their receiving girder');}
assert(members.filter(m=>m.type==='Front jack top chord').length===28,'keep all 2 ft O.C. front jack stations');
console.log(`PASS: ${connected.length} corner-zone front jacks terminate at assigned hip carriers; ${girderBound.length} central front jacks bind to assigned girder plies; all 28 front-jack stations remain.`);
