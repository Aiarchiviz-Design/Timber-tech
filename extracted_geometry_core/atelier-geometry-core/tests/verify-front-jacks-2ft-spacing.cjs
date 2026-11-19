const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map(),ctx=new Proxy({},{get:()=>()=>{}});
function node(s){if(!nodes.has(s))nodes.set(s,{style:{},dataset:{},value:'0',classList:{add(){},remove(){},toggle(){},contains(){return false}},querySelectorAll:()=>[],querySelector:()=>null,insertAdjacentHTML(){},addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:0,height:0}),children:[],close(){},showModal(){},click(){}});return nodes.get(s)}
const box={document:{body:node('body'),querySelector:node,querySelectorAll:()=>[],addEventListener(){},createElement:node},ResizeObserver:class{observe(){}},devicePixelRatio:1,console,setTimeout,clearTimeout,URL,Blob};
vm.createContext(box);for(const f of ['joins.js','framing.js','camera.js','advanced.js','trim.js','editing.js','roof-footprint.js','roof.js','truss-joints.js','hip-trusses.js','roof-framing.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),box);
const run=s=>vm.runInContext(s,box);
run('render=()=>{};properties=()=>{};navigator=()=>{};toast=()=>{};model=clone(model);model.elements=[{id:"R-FJ-600",type:"roof",story:"s0",layer:"Structure",points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],pitch:25,height:3000,overhang:609.6,thickness:200,roofType:"hip",roofFraming:{system:"trusses",spacing:600,width:45,depth:190,webDepth:90,heel:300,girderPlies:2,hipSetback:1828.8}}];var h=generateRoofFraming(model.elements[0]);');
const tops=run('h.members.filter(m=>m.type==="Front jack top chord")');
assert.equal(tops.length,28,`expected 14 front-jack stations along each of two eaves, got ${tops.length}`);
const byEdge=[[],[]];
for(const m of tops){const y=(m.a.y+m.b.y)/2;const ix=(m.a.x+m.b.x)/2<6500?0:1;byEdge[ix].push(y)}
for(let e=0;e<2;e++){
 const ys=[...new Set(byEdge[e].map(y=>Math.round(y*100)/100))].sort((a,b)=>a-b);
 assert.equal(ys.length,14,`edge ${e}: expected 14 unique jack stations; got ${ys.length}`);
 for(let i=0;i<ys.length;i++){
  assert(Math.abs(ys[i]-(i+1)*600)<.1,`edge ${e}: station ${i} should be ${(i+1)*600} mm from corner, got ${ys[i]}`);
  if(i)assert(Math.abs(ys[i]-ys[i-1]-600)<.1,`edge ${e}: adjacent jacks must be 600 mm O.C.`);
 }
}
console.log('PASS: front jacks are generated at 600 mm (2 ft) O.C. from the wall corners along both hip eaves, including the previously omitted corner stations.');
