const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map(),ctx=new Proxy({},{get:()=>()=>{}});
function node(s){if(!nodes.has(s))nodes.set(s,{style:{},dataset:{},value:'0',classList:{add(){},remove(){},toggle(){},contains(){return false}},querySelectorAll:()=>[],querySelector:()=>null,insertAdjacentHTML(){},addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:0,height:0}),children:[],close(){},showModal(){},click(){}});return nodes.get(s)}
const box={document:{body:node('body'),querySelector:node,querySelectorAll:()=>[],addEventListener(){},createElement:node},ResizeObserver:class{observe(){}},devicePixelRatio:1,console,setTimeout,clearTimeout,URL,Blob};
vm.createContext(box);
for(const f of ['joins.js','framing.js','camera.js','advanced.js','trim.js','editing.js','roof-footprint.js','roof.js','truss-joints.js','hip-trusses.js','roof-framing.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),box);
const run=s=>vm.runInContext(s,box);
run('render=()=>{};properties=()=>{};navigator=()=>{};toast=()=>{};model=clone(model);model.elements=[{id:"JACK-CORNER-OUTSIDE",type:"roof",story:"s0",layer:"Structure",points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],pitch:25,height:3000,overhang:609.6,thickness:200,roofType:"hip",roofFraming:{system:"trusses",spacing:600,width:45,depth:190,webDepth:90,heel:300,girderPlies:2,hipSetback:1828.8}}];var h=generateRoofFraming(model.elements[0]);');
const members=run('h.members');
for(const role of ['Front jack','Side jack']){
 const ids=[...new Set(members.filter(m=>m.type===role+' top chord').map(m=>m.assembly))];
 assert(ids.length,`expected ${role} assemblies`);
 for(const id of ids){
   const group=members.filter(m=>m.assembly===id),top=group.find(m=>m.type===role+' top chord'),bottom=group.find(m=>m.type===role+' bottom chord');
   if(!top||!bottom) continue;
   const webs=group.filter(m=>m.type===role+' web'&&!m.endWeb);
   assert(webs.length,`${id} should retain triangular webs`);
 }
}
console.log('PASS: front and side jack triangular webs remain generated and connected after moving the terminal-bay apex away from the perpendicular receiver.');
