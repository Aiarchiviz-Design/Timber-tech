const fs=require('fs'),vm=require('vm'),assert=require('assert');
const bootstrap=fs.readFileSync('tests/verify-walls.cjs','utf8').split('function fixture')[0];
eval(bootstrap.replace("const fs=require('fs'),vm=require('vm'),assert=require('assert');",'').replace('const run=','var run='));
run('model.elements=[{id:"R-WEB-ALL",type:"roof",story:"s0",layer:"Structure",points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],pitch:25,height:3000,overhang:450,thickness:200,roofType:"hip",roofFraming:{system:"trusses"}}];var roof=model.elements[0];var layout=generateRoofFraming(roof);');
for(const role of ['Hip truss','Girder truss']){
  const ids=run(`([...new Set(layout.members.filter(m=>m.type===${JSON.stringify(role+' bottom chord')}).map(m=>m.assembly))])`);
  assert(ids.length>0,`${role} assemblies missing`);
  for(const id of ids){
    const row=run(`(()=>{const ms=layout.members.filter(m=>m.assembly===${JSON.stringify(id)});const b=ms.find(m=>m.type===${JSON.stringify(role+' bottom chord')});const w=ms.filter(m=>m.type===${JSON.stringify(role+' web')});return {a:b.a,b:b.b,webs:w}})()`);
    const dx=row.b.x-row.a.x,dy=row.b.y-row.a.y,den=dx*dx+dy*dy,L=Math.sqrt(den),bays=Math.max(1,Math.ceil((L-.001)/2400));
    assert(row.webs.length>0,`${id}: web members missing`);
    assert(row.webs.length<2*bays,`${id}: repeated midpoint V web pair remains (${row.webs.length} webs for ${bays} bays)`);
    for(const web of row.webs)for(const p of [web.a,web.b]){
      const t=((p.x-row.a.x)*dx+(p.y-row.a.y)*dy)/den;
      assert(t>=-0.001&&t<=1.001,`${id}: web endpoint lies outside its chord span t=${t.toFixed(4)}`);
    }
  }
}
// Short open-receiver jack/carrier trusses preserve their compact triangular web logic.
for(const role of ['Front jack','Side jack','Hip carrier'])assert(run(`layout.members.some(m=>m.type===${JSON.stringify(role+' web')})`),`${role} web pattern accidentally removed`);
assert(run('layout.members.some(m=>m.type==="Common truss web")'),'corrected common-truss webs missing');
assert(run('layout.members.some(m=>m.type==="Hip truss web")&&layout.members.some(m=>m.type==="Girder truss web")'),'closed-truss web relayout missing');
console.log('PASS: hip and girder webs use chord stations rather than repeated midpoint V-pairs; common trusses remain fixed and short jack/carrier web patterns remain intact.');
