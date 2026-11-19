const fs=require('fs'),vm=require('vm'),assert=require('assert');
const bootstrap=fs.readFileSync('tests/verify-walls.cjs','utf8').split('function fixture')[0];
eval(bootstrap.replace("const fs=require('fs'),vm=require('vm'),assert=require('assert');",'').replace('const run=','var run='));
run('model.elements=[{id:"R-WEB",type:"roof",story:"s0",layer:"Structure",points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],pitch:25,height:3000,overhang:450,thickness:200,roofType:"hip",roofFraming:{system:"trusses"}}];var roof=model.elements[0];var layout=generateRoofFraming(roof);');
const commons=run('layout.members.filter(m=>m.type==="Common truss top chord").map(m=>m.assembly)');
const assemblies=[...new Set(commons)];assert(assemblies.length>=5,'fixture should include several common trusses');
for(const id of assemblies){
  const top=run(`layout.members.filter(m=>m.assembly===${JSON.stringify(id)}&&m.type==="Common truss top chord")`);
  const bottom=run(`layout.members.filter(m=>m.assembly===${JSON.stringify(id)}&&m.type==="Common truss bottom chord")`);
  const webs=run(`layout.members.filter(m=>m.assembly===${JSON.stringify(id)}&&m.type==="Common truss web")`);
  assert(top.length>=2,`${id}: top chord facets preserved`);assert.equal(bottom.length,1,`${id}: one continuous bottom chord`);
  const posts=webs.filter(m=>Math.hypot(m.a.x-m.b.x,m.a.y-m.b.y)<1);
  const diagonals=webs.filter(m=>Math.hypot(m.a.x-m.b.x,m.a.y-m.b.y)>=1);
  assert(webs.length>=2,`${id}: advanced web topology missing`);
  assert(diagonals.length>=1,`${id}: diagonal web members missing`);
  // The old V-pair layout inserted apex nodes at mid-panel fractions (.125,.375,...).
  // The cleaned layout must attach all webs at actual bottom/top chord stations.
  const allowedY=[0,2250,4500,6750,9000];
  for(const web of webs)for(const p of [web.a,web.b])assert(Math.min(...allowedY.map(y=>Math.abs(p.y-y)))<1,`${id}: midpoint V-web node remains at y=${p.y}`);
  assert(webs.length<=6,`${id}: redundant repeated V-web pair remains (${webs.length} webs)`);
}
// The web change must not affect spacing, overhangs, heel rules, or the jack connections.
assert(run('layout.members.some(m=>m.type.startsWith("Front jack top chord"))'));
assert(run('layout.members.some(m=>m.type.startsWith("Side jack top chord"))'));
assert(run('layout.members.some(m=>m.type.startsWith("Hip carrier top chord"))'));
assert(run('layout.members.some(m=>m.type.startsWith("Girder truss top chord"))'));
assert(run('layout.members.some(m=>m.overhangExtended)'));
console.log(`PASS: common-truss web relayout on ${assemblies.length} assemblies; top/bottom chords, jack/hip/girder roles, and overhangs preserved.`);
