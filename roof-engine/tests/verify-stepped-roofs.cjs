const fs=require('fs'),vm=require('vm'),assert=require('assert');
const bootstrap=fs.readFileSync('tests/verify-walls.cjs','utf8').split('function fixture')[0];eval(bootstrap.replace("const fs=require('fs'),vm=require('vm'),assert=require('assert');",'').replace('const run=','var run='));
const shapes={L:[[0,0],[8000,0],[8000,3000],[3000,3000],[3000,7000],[0,7000]],T:[[0,0],[9000,0],[9000,3000],[6000,3000],[6000,8000],[3000,8000],[3000,3000],[0,3000]],U:[[0,0],[9000,0],[9000,8000],[6000,8000],[6000,3000],[3000,3000],[3000,8000],[0,8000]],stepped:[[0,0],[9000,0],[9000,3000],[7000,3000],[7000,5000],[4000,5000],[4000,8000],[0,8000]]};
for(const [name,points] of Object.entries(shapes))for(const overhang of [0,450]){
 run(`model.elements=[{id:'R-001',type:'roof',story:'s0',layer:'Structure',points:${JSON.stringify(points.map(([x,y])=>({x,y})))},height:3000,pitch:30,thickness:200,overhang:${overhang},roofType:'hip'}];let e=model.elements[0];validateRoof(e);let g=roofGeometry(e);` .replace('let e=','var e=').replace('let g=','var g='));
 const footprint=run('Math.abs(area2(g.boundary))'),covered=run('g.facets.reduce((a,p)=>a+Math.abs(area2(p)),0)');assert(Math.abs(footprint-covered)<1,`${name}: missing or duplicated footprint ${footprint} / ${covered}`);
 assert(run('g.facets.flat().every(p=>Number.isFinite(p.z)&&p.z>=g.base-Math.tan(e.pitch*Math.PI/180)*e.overhang-.01)'));
 assert(run('g.facets.every(ps=>{const p=ps.reduce((a,p)=>({x:a.x+p.x/ps.length,y:a.y+p.y/ps.length}),{x:0,y:0});return inside(p,g.boundary)})'),name+' filled a recess');
 // Neighboring facets agree in height wherever a vertex lies on another facet edge.
 assert(run('g.facets.every(ps=>ps.every(p=>g.facets.every(qs=>qs.every((a,i)=>{const b=qs[(i+1)%qs.length],h=segmentDistance(p,a,b);return h.distance>.01||Math.abs(p.z-(a.z+(b.z-a.z)*h.t))<.1}))))'),name+' discontinuous roof');
 run('selected=[e.id];rotateSelection(31,{x:0,y:0});e=model.elements[0];g=roofGeometry(e)');assert(Math.abs(footprint-run('g.facets.reduce((a,p)=>a+Math.abs(area2(p)),0)'))<10,name+' rotation');
}
run('e.roofType="gable";validateRoof(e);g=roofGeometry(e)');assert(Math.abs(run('Math.abs(area2(g.boundary))-g.facets.reduce((a,p)=>a+Math.abs(area2(p)),0)'))<1);
run('e.roofType="mono";validateRoof(e);g=roofGeometry(e)');assert(Math.abs(run('Math.abs(area2(g.boundary))-g.facets.reduce((a,p)=>a+Math.abs(area2(p)),0)'))<1);
assert.throws(()=>run('validateRoof({...e,points:[{x:0,y:0},{x:8000,y:6000},{x:0,y:6000},{x:8000,y:0}]})'));
console.log('PASS: L/T/U/stepped footprint coverage, no recess bridges, continuous valleys, overhang, arbitrary rotation, concave gable/mono and crossing rejection');
