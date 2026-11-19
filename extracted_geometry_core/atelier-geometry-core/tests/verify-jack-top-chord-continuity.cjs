const fs=require('fs'),vm=require('vm'),assert=require('assert');
const bootstrap=fs.readFileSync('tests/verify-walls.cjs','utf8').split('function fixture')[0];
eval(bootstrap.replace("const fs=require('fs'),vm=require('vm'),assert=require('assert');",'').replace('const run=','var run='));
run('model.elements=[{id:"R-HIP-CONT",type:"roof",story:"s0",layer:"Structure",points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],pitch:25,height:3000,overhang:450,thickness:200,roofType:"hip",roofFraming:{system:"trusses",spacing:600,hipSetback:1828.8}}];var roof=model.elements[0];var layout=generateRoofFraming(roof);');
for(const role of ['Front jack','Side jack','Hip carrier']){
  const assemblies=run(`Array.from(new Set(layout.members.filter(m=>m.type===${JSON.stringify(role+' top chord')}).map(m=>m.assembly)))`);
  assert(assemblies.length>0,`expected ${role} top chords`);
  for(const id of assemblies){
    const top=run(`layout.members.filter(m=>m.assembly===${JSON.stringify(assemblies[0])}&&m.type===${JSON.stringify(role+' top chord')})`);
    const count=run(`layout.members.filter(m=>m.assembly===${JSON.stringify(id)}&&m.type===${JSON.stringify(role+' top chord')}).length`);
    assert.equal(count,1,`${role} assembly ${id} must render as one continuous top-chord member`);
  }
  const bad=run(`layout.members.filter(m=>m.type===${JSON.stringify(role+' top chord')}).filter(m=>Math.abs(m.a.z-m.b.z)<1)`);
  assert.equal(bad.length,0,`${role} top chords must retain their roof rise instead of collapsing to bottom-chord elevation`);
}
// At the eave heel, top chord and bottom chord share a plan endpoint and centerline elevation;
// at the receiving end, the open jack/hip-carrier chord must remain up at the roof/receiver.
const pairs=run(`layout.members.filter(m=>m.type==='Front jack top chord').map(top=>{const bot=layout.members.find(m=>m.assembly===top.assembly&&m.type==='Front jack bottom chord');return {top,bot}}).filter(x=>x.bot)`);
assert(pairs.length>0);
assert(pairs.every(({top,bot})=>Math.min(top.a.z,top.b.z)<=Math.min(bot.a.z,bot.b.z)+1), 'each front jack top chord starts from the heel/bottom-chord datum');
assert(pairs.some(({top,bot})=>Math.max(top.a.z,top.b.z)>Math.max(bot.a.z,bot.b.z)+100), 'front jack top chords rise to roof/receiver elevation instead of being flattened');
console.log('PASS: front/side jack and hip-carrier top chords are each one continuous member; receiving ends retain roof elevation; jack heel starts at bottom-chord datum.');
