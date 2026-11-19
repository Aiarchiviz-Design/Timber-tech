const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map(),ctx=new Proxy({},{get:()=>()=>{}});
function node(s){if(!nodes.has(s))nodes.set(s,{style:{},dataset:{},value:'0',classList:{add(){},remove(){},toggle(){},contains(){return false}},querySelectorAll:()=>[],querySelector:()=>null,insertAdjacentHTML(){},addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:0,height:0}),children:[],close(){},showModal(){},click(){}});return nodes.get(s)}
const box={document:{body:node('body'),querySelector:node,querySelectorAll:()=>[],addEventListener(){},createElement:node},ResizeObserver:class{observe(){}},devicePixelRatio:1,console,setTimeout,clearTimeout,URL,Blob};
vm.createContext(box);
for(const f of ['joins.js','framing.js','camera.js','advanced.js','trim.js','editing.js','roof-footprint.js','roof.js','truss-joints.js','hip-trusses.js','roof-framing.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),box);
const run=s=>vm.runInContext(s,box);
run('render=()=>{};properties=()=>{};navigator=()=>{};toast=()=>{};model=clone(model);model.elements=[{id:"R-END-WEB",type:"roof",story:"s0",layer:"Structure",points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],pitch:25,height:3000,overhang:609.6,thickness:200,roofType:"hip",roofFraming:{system:"trusses",spacing:600,width:45,depth:190,webDepth:90,heel:300,girderPlies:2,hipSetback:1828.8}}];var h=generateRoofFraming(model.elements[0]);');
const members=run('h.members');
const dist=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z);
const segDist=(p,a,b)=>{const d={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},l2=d.x*d.x+d.y*d.y+d.z*d.z,t=l2?Math.max(0,Math.min(1,((p.x-a.x)*d.x+(p.y-a.y)*d.y+(p.z-a.z)*d.z)/l2)):0;return dist(p,{x:a.x+d.x*t,y:a.y+d.y*t,z:a.z+d.z*t})};
const roles=['Front jack','Side jack','Hip carrier'];
let checked=0;
for(const role of roles){
 const ids=[...new Set(members.filter(m=>m.type===role+' top chord').map(m=>m.assembly))];
 assert(ids.length>0,`fixture should generate ${role} assemblies`);
 for(const id of ids){
  const grp=members.filter(m=>m.assembly===id);
  const top=grp.find(m=>m.type===role+' top chord');
  const bottom=grp.find(m=>m.type===role+' bottom chord');
  if(!top||!bottom) continue;
  // Overhang and member merging can reverse endpoint order, so find the
  // receiving-end web by its explicit metadata and confirm it connects one
  // endpoint of each chord exactly.
  const webs=grp.filter(m=>m.type===role+' web'&&m.endWeb===true);
  // The receiving-end stud now stands against the receiver's side face, so its ends sit ON the top and
  // bottom chords a little back from the chord end nodes (not exactly at the end nodes, inside the girder).
  const web=webs.find(w=>(segDist(w.a,top.a,top.b)<1&&segDist(w.b,bottom.a,bottom.b)<1)||(segDist(w.b,top.a,top.b)<1&&segDist(w.a,bottom.a,bottom.b)<1));
  assert(web,`${role} assembly ${id} needs a tagged end web connecting a top-chord endpoint to a bottom-chord endpoint`);
  assert(Array.isArray(web.cutFaces)&&web.cutFaces.length>=4,`${role} assembly ${id} end web must have finished 3D end cuts, not remain buried inside the chords`);
  assert((web.jointConnections||[]).filter(j=>j.kind==='web-to-chord').length>=2,`${role} assembly ${id} end web must be trimmed to both top and bottom chord faces`);
  checked++;
 }
}
assert(checked>=12,`expected >=12 end-web checks; got ${checked}`);
console.log(`PASS: ${checked} blue front-jack, purple side-jack, and pink hip-carrier assemblies have a receiving-end web connecting top and bottom chord terminals.`);

// Repeat on an orthogonal multi-wing hip footprint to ensure the end-web rule
// applies to each generated wing as well as a simple rectangular roof.
run('model.elements=[{id:"R-END-WEB-MULTI",type:"roof",story:"s0",layer:"Structure",points:[{x:0,y:0},{x:10000,y:0},{x:10000,y:4000},{x:16000,y:4000},{x:16000,y:12000},{x:10000,y:12000},{x:10000,y:17000},{x:6000,y:17000},{x:6000,y:10000},{x:0,y:10000}],pitch:25,height:3000,overhang:609.6,thickness:200,roofType:"hip",roofFraming:{system:"trusses",spacing:600,width:45,depth:190,webDepth:90,heel:300,girderPlies:2,hipSetback:1828.8}}];var h2=generateRoofFraming(model.elements[0]);');
const multiMembers=run('h2.members');
let multiChecked=0;
for(const role of roles){
 const ids=[...new Set(multiMembers.filter(m=>m.type===role+' top chord').map(m=>m.assembly))];
 assert(ids.length>0,`multi-wing fixture should generate ${role} assemblies`);
 for(const id of ids){
  const grp=multiMembers.filter(m=>m.assembly===id),top=grp.find(m=>m.type===role+' top chord'),bottom=grp.find(m=>m.type===role+' bottom chord');
  if(!top||!bottom)continue;
  const webs=grp.filter(m=>m.type===role+' web'&&m.endWeb===true);
  const web=webs.find(w=>dist(top.a,bottom.a)+dist(top.b,bottom.b)>20&&((segDist(w.a,top.a,top.b)<1&&segDist(w.b,bottom.a,bottom.b)<1)||(segDist(w.b,top.a,top.b)<1&&segDist(w.a,bottom.a,bottom.b)<1)));
  assert(web,`multi-wing ${role} assembly ${id} needs a tagged receiving-end web`);
  assert(Array.isArray(web.cutFaces)&&web.cutFaces.length>=4,`multi-wing ${role} assembly ${id} end web must be cut to the chord faces`);
  assert((web.jointConnections||[]).filter(j=>j.kind==='web-to-chord').length>=2,`multi-wing ${role} assembly ${id} end web must connect to both chord faces`);
  multiChecked++;
 }
}
assert(multiChecked>=8,`expected >=8 multi-wing end-web checks; got ${multiChecked}`);
console.log(`PASS: ${multiChecked} multi-wing blue front-jack, purple side-jack, and pink hip-carrier assemblies have end webs.`);
