const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map(),ctx=new Proxy({},{get:()=>()=>{}});
function node(s){if(!nodes.has(s))nodes.set(s,{style:{},dataset:{},value:'0',classList:{add(){},remove(){},toggle(){},contains(){return false}},querySelectorAll:()=>[],querySelector:()=>null,insertAdjacentHTML(){},addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:0,height:0}),children:[],close(){},showModal(){},click(){}});return nodes.get(s)}
const box={document:{body:node('body'),querySelector:node,querySelectorAll:()=>[],addEventListener(){},createElement:node},ResizeObserver:class{observe(){}},devicePixelRatio:1,console,setTimeout,clearTimeout,URL,Blob};
vm.createContext(box);for(const f of ['joins.js','framing.js','camera.js','advanced.js','trim.js','editing.js','roof-footprint.js','roof.js','truss-joints.js','hip-trusses.js','roof-framing.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),box);
const run=s=>vm.runInContext(s,box);
run('render=()=>{};properties=()=>{};navigator=()=>{};toast=()=>{};model=clone(model);model.elements=[{id:"R-NO-SIDE-JACK-AT-GIRDER",type:"roof",story:"s0",layer:"Structure",points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],pitch:25,height:3000,overhang:609.6,thickness:200,roofType:"hip",roofFraming:{system:"trusses",spacing:600,hipSetback:1828.8}}];var layout=generateRoofFraming(model.elements[0]);');
const members=run('layout.members');
const tops=members.filter(m=>m.type==='Side jack top chord');
assert(tops.length>0,'purple side jacks should still be generated away from the girder');
// For nominal 2 ft O.C. spacing and the 6 ft girder setback, the nearest
// purple side jack must be one full spacing from each girder centerline. With
// the default 600 mm spacing and 1828.8 mm setback, the exact station is
// x=1228.8 mm at the left and x=11771.2 mm at the right.
const sideX=[...new Set(tops.map(m=>Math.round(((m.a.x+m.b.x)/2)*10)/10))];
assert(sideX.some(x=>Math.abs(x-1228.8)<1),'left purple side-jack station should be 600 mm from the girder centerline');
// V3.94: on this 13000 mm roof the last common station would sit 342 mm from the right girder, so that truss is
// dropped and the right girder moves out to x=10828.8 (setback 2171.2). Side jacks then start 600 mm from it.
assert(sideX.some(x=>Math.abs(x-11428.8)<1),'right purple side-jack station should be 600 mm from the moved girder centerline');
assert(!sideX.some(x=>Math.abs(x-1800)<1||Math.abs(x-10850)<1),'no purple side-jack may be placed almost on the girder');
assert(sideX.some(x=>Math.abs(x-600)<1),'retain the next purple side-jack station at nominal 2 ft spacing on the left');
// no gap between consecutive right-end stations (eave edge x=13000 .. girder) may exceed one spacing + 10%
const rightPts=[13000,...sideX.filter(x=>x>10900).sort((a,b)=>b-a),10828.8];
for(let i=1;i<rightPts.length;i++)assert(rightPts[i-1]-rightPts[i]<=660,`missing side jack: gap ${rightPts[i-1]-rightPts[i]} mm`);
for(const girderX of [1828.8,10828.8]){
  const gap=Math.min(...sideX.map(x=>Math.abs(x-girderX)));
  assert(Math.abs(gap-600)<1,`nearest purple side jack must be exactly one nominal spacing from girder (gap ${gap})`);
}
assert(members.some(m=>m.type==='Front jack top chord'),'blue front jacks remain generated');
assert(members.some(m=>m.type==='Girder truss top chord'),'girder trusses remain generated');
console.log(`PASS: ${tops.length} purple side-jack top chords remain; nearest jack is 600 mm from each girder. Blue front jacks and girder trusses preserved.`);
