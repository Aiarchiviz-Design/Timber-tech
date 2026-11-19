const fs=require('fs'),vm=require('vm'),assert=require('assert');
const bootstrap=fs.readFileSync('tests/verify-walls.cjs','utf8').split('function fixture')[0];
eval(bootstrap.replace("const fs=require('fs'),vm=require('vm'),assert=require('assert');",'').replace('const run=','var run='));
run('model.elements=[{id:"R-ADV",type:"roof",story:"s0",layer:"Structure",points:[{x:0,y:0},{x:12000,y:0},{x:12000,y:6000},{x:0,y:6000}],pitch:25,height:3000,overhang:0,thickness:200,roofType:"gable",roofFraming:{system:"trusses",spacing:600}}];var r=model.elements[0];');
const counts={};
for(const pattern of ['Fink','Howe','Pratt','Warren','Queen post','King post']){
 run(`r.roofFraming.webPattern=${JSON.stringify(pattern)};r.roofFraming.panelCount=8;var layout=generateRoofFraming(r);`);
 const webCount=run('layout.members.filter(m=>/web/i.test(m.type)).length');
 const webs=run('layout.members.filter(m=>/web/i.test(m.type)).map(m=>[m.a.x,m.a.y,m.a.z,m.b.x,m.b.y,m.b.z].map(v=>Math.round(v)).join(",")).sort().join(";")');
 assert(webCount>0,`${pattern} produced no webs`);assert(run('layout.members.every(m=>Number.isFinite(m.length)&&m.length>0)'));
 counts[pattern]=webCount+':'+webs;
}
assert(new Set(Object.values(counts)).size>=4,'web patterns should create distinct layouts');
run('r.roofFraming.webPattern="Fink";r.roofFraming.panelCount=6;var six=generateRoofFraming(r);r.roofFraming.panelCount=12;var twelve=generateRoofFraming(r);');
assert(run('twelve.members.filter(m=>/web/i.test(m.type)).length>six.members.filter(m=>/web/i.test(m.type)).length'),'panel count should affect web topology');
run('r.roofFraming.panelCount=3;var invalid=false;try{validateRoofFraming(r)}catch(e){invalid=true}');assert(run('invalid'),'invalid panel count should be rejected');
run('r.roofFraming.panelCount=0;r.roofFraming.webPattern="Fink";validateRoofFraming(r)');
console.log('PASS: six selectable web patterns, valid 3D member geometry, panel-count regeneration and validation');
