const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map(),ctx=new Proxy({},{get:()=>()=>{}});
function node(s){if(!nodes.has(s))nodes.set(s,{style:{},dataset:{},value:'0',classList:{add(){},remove(){},toggle(){},contains(){return false}},querySelectorAll:()=>[],querySelector:()=>null,insertAdjacentHTML(){},addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:0,height:0}),children:[],close(){},showModal(){},click(){}});return nodes.get(s)}
const box={document:{body:node('body'),querySelector:node,querySelectorAll:()=>[],addEventListener(){},createElement:node},ResizeObserver:class{observe(){}},devicePixelRatio:1,console,setTimeout,clearTimeout,URL,Blob};
vm.createContext(box);for(const f of ['joins.js','framing.js','camera.js','advanced.js','trim.js','editing.js','roof-footprint.js','roof.js','truss-joints.js','hip-trusses.js','roof-framing.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),box);
const run=s=>vm.runInContext(s,box);run('render=()=>{};properties=()=>{};navigator=()=>{};toast=()=>{};');
run(`var keptLong={id:'R1:A',roofId:'R1',type:'Common truss top chord',assembly:'C-A',a:{x:0,y:0,z:1000},b:{x:5000,y:0,z:3500},width:45,depth:190,length:5590.17};
var removeShort={id:'R2:B',roofId:'R2',type:'Common truss top chord',assembly:'C-B',a:{x:500,y:35,z:1250},b:{x:3500,y:35,z:2750},width:45,depth:190,length:3354.10};
var nearbyLegitimate={id:'R3:C',roofId:'R3',type:'Common truss top chord',assembly:'C-C',a:{x:0,y:600,z:1000},b:{x:5000,y:600,z:3500},width:45,depth:190,length:5590.17};
var girderPlyA={id:'G1:A',roofId:'G1',type:'Girder truss top chord',assembly:'G-A',a:{x:0,y:1000,z:1000},b:{x:5000,y:1000,z:3500},width:45,depth:190,length:5590.17};
var girderPlyB={id:'G2:B',roofId:'G2',type:'Girder truss top chord',assembly:'G-B',a:{x:0,y:1045,z:1000},b:{x:5000,y:1045,z:3500},width:45,depth:190,length:5590.17};
var overlapResult=removeDuplicateTopChords([keptLong,removeShort,nearbyLegitimate,girderPlyA,girderPlyB]);`);
assert(run('overlapResult.includes(keptLong)'), 'retain the longer intended chord');
assert(!run('overlapResult.includes(removeShort)'), 'remove shorter offset duplicate chord');
assert(run('overlapResult.includes(nearbyLegitimate)'), 'preserve separate truss 600 mm away');
assert(run('overlapResult.includes(girderPlyA)&&overlapResult.includes(girderPlyB)'), 'preserve intentional offset girder plies');
// Cross-roof generation returns one physical top chord where two overlapping roof
// objects produce the same line, while keeping each surviving member attached to a roof id.
run(`model=clone(model);model.elements=[
{id:'R-OVERLAP-A',type:'roof',story:'s0',layer:'Structure',points:[{x:0,y:0},{x:8000,y:0},{x:8000,y:5000},{x:0,y:5000}],height:3000,thickness:200,pitch:30,overhang:609.6,roofType:'hip',roofFraming:{system:'trusses',spacing:600,hipSetback:1828.8}},
{id:'R-OVERLAP-B',type:'roof',story:'s0',layer:'Structure',points:[{x:0,y:0},{x:8000,y:0},{x:8000,y:5000},{x:0,y:5000}],height:3000,thickness:200,pitch:30,overhang:609.6,roofType:'hip',roofFraming:{system:'trusses',spacing:600,hipSetback:1828.8}}
];var localA=generateRoofFraming(model.elements[0]),localB=generateRoofFraming(model.elements[1]),combined=projectRoofFraming(model.elements,false);`);
const sum=run("localA.members.filter(m=>/top chord/i.test(m.type)).length+localB.members.filter(m=>/top chord/i.test(m.type)).length");
const all=run("combined.members.filter(m=>/top chord/i.test(m.type)).length");
assert(all<sum,'cross-roof duplicate top chords are suppressed in project layout');
assert(run("combined.members.every(m=>m.roofId==='R-OVERLAP-A'||m.roofId==='R-OVERLAP-B')"),'surviving members retain their source roof id');
console.log(`PASS: near-coincident duplicate chord removed; nearby 600 mm truss and girder plies retained; overlapping roof objects suppressed ${sum-all} duplicate top chords.`);
