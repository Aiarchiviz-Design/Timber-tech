const fs=require('fs'),vm=require('vm'),assert=require('assert');
const bootstrap=fs.readFileSync('tests/verify-walls.cjs','utf8').split('function fixture')[0];
eval(bootstrap.replace("const fs=require('fs'),vm=require('vm'),assert=require('assert');",'').replace('const run=','var run='));
function check(points,id){
  run(`model.elements=[{id:${JSON.stringify(id)},type:"roof",story:"s0",layer:"Structure",points:${JSON.stringify(points)},pitch:25,height:3000,overhang:609.6,thickness:200,roofType:"hip",roofFraming:{system:"trusses"}}];`);
  const bounds=run(`(()=>{const e=model.elements[0],m=generateRoofFraming(e).members,g=roofGeometry(e),p=roofBoundary(e);return {members:m.length,extended:m.filter(x=>x.overhangExtended).length,minX:Math.min(...m.flatMap(x=>[x.a.x,x.b.x])),maxX:Math.max(...m.flatMap(x=>[x.a.x,x.b.x])),minY:Math.min(...m.flatMap(x=>[x.a.y,x.b.y])),maxY:Math.max(...m.flatMap(x=>[x.a.y,x.b.y])),minPX:Math.min(...p.map(x=>x.x)),maxPX:Math.max(...p.map(x=>x.x)),minPY:Math.min(...p.map(x=>x.y)),maxPY:Math.max(...p.map(x=>x.y)),outer:g.boundary};})()`);
  assert(bounds.extended>0,`${id}: expected overhang extensions`);
  const tol=5,oh=609.6;
  assert(bounds.minX>=bounds.minPX-oh-tol,`${id}: x-min overhang exceeds 2 ft (${bounds.minX})`);
  assert(bounds.maxX<=bounds.maxPX+oh+tol,`${id}: x-max overhang exceeds 2 ft (${bounds.maxX})`);
  assert(bounds.minY>=bounds.minPY-oh-tol,`${id}: y-min overhang exceeds 2 ft (${bounds.minY})`);
  assert(bounds.maxY<=bounds.maxPY+oh+tol,`${id}: y-max overhang exceeds 2 ft (${bounds.maxY})`);
  return bounds;
}
const rect=check([{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],'R-OVERHANG-RECT');
const lshape=check([{x:0,y:0},{x:13000,y:0},{x:13000,y:5000},{x:7000,y:5000},{x:7000,y:9000},{x:0,y:9000}],'R-OVERHANG-STEPPED');
console.log(`PASS: overhang endpoints remain within the 609.6 mm perimeter envelope for rectangular (${rect.extended} extensions) and stepped (${lshape.extended} extensions) roofs.`);
