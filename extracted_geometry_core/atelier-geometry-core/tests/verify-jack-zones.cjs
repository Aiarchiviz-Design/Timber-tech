const fs=require('fs'),vm=require('vm'),assert=require('assert');const bootstrap=fs.readFileSync('tests/verify-walls.cjs','utf8').split('function fixture')[0];eval(bootstrap.replace("const fs=require('fs'),vm=require('vm'),assert=require('assert');",'').replace('const run=','var run='));run('model.elements=[{id:"R-HIP",type:"roof",story:"s0",layer:"Structure",points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],pitch:25,height:3000,overhang:450,thickness:200,roofType:"hip",roofFraming:{system:"trusses",hipSetback:1200}}];var r=model.elements[0];var h=generateRoofFraming(r);');for(const role of ['Girder truss','Front jack','Hip carrier','Side jack','Common truss'])assert(run(`h.members.some(m=>m.type.startsWith('${role}'))`),role);assert(run('h.members.every(m=>Number.isFinite(m.length)&&m.length>0&&roofMemberFaces(m).flat().every(p=>Number.isFinite(p.z)))'));console.log(run('h.members.length'));console.log('PASS hip assemblies');
assert.equal(run('new Set(h.members.filter(m=>m.type==="Girder truss bottom chord").map(m=>m.assembly)).size'),4);
assert(run('h.members.filter(m=>!(/top chord/i.test(m.type))).every(m=>m.a.x>=-1&&m.a.x<=13001&&m.b.x>=-1&&m.b.x<=13001&&m.a.y>=-1&&m.a.y<=9001&&m.b.y>=-1&&m.b.y<=9001)'));assert(run('h.members.some(m=>m.overhangExtended&&/Front jack top chord|Side jack top chord|Hip carrier top chord|Common truss top chord|Hip truss top chord|Girder truss top chord/i.test(m.type))'));
assert.equal(run('roofFramingRows().reduce((n,r)=>n+r.quantity,0)'),run('h.members.length'));


assert(run('h.members.filter(m=>m.type==="Hip truss bottom chord"||m.type==="Common truss bottom chord").every(m=>Math.abs(m.a.y)<.1&&Math.abs(m.b.y-9000)<.1)'));
run('var gr=h.members.filter(m=>m.type==="Girder truss bottom chord"&&m.a.x>6500).map(m=>m.a.x);var gR=gr.reduce((a,b)=>a+b,0)/gr.length;');
// V3.94: the last common truss would sit 400 mm from the right girder, so it is dropped and that girder moves out (gR < 11800).
assert(run('gR>13000-1200-600-1&&gR<11800'));
assert(run('h.members.filter(m=>m.type.startsWith("Front jack")||m.type.startsWith("Side jack")||m.type.startsWith("Hip carrier")).every(m=>[m.a,m.b].every(p=>p.x<=1200+.1||p.x>=gR-.1))'));
assert(run('h.members.filter(m=>m.type==="Hip carrier bottom chord").every(m=>[m.a,m.b].some(p=>Math.abs(p.x-1200)<.1||Math.abs(p.x-gR)<.1))'));
assert(run('h.members.filter(m=>m.type==="Front jack bottom chord").every(m=>m.receiverAssembly&&h.members.some(q=>q.assembly===m.receiverAssembly&&(q.type==="Hip carrier bottom chord"||q.type==="Girder truss bottom chord")))'));
assert(run('h.members.filter(m=>m.type==="Hip truss top chord").some(m=>Math.abs(m.a.z-m.b.z)<.01)'));
console.log('PASS: full-span truncated hip trusses, flat top profiles, jack-zone boundaries and girder bearing endpoints');
