// V3.92: where an adjoining wing continues flush with a hip end (L/T/U re-entrant side),
// there is no hip line: no Hip carrier / Side jack on that side, only Front jacks to the girder.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const bootstrap=fs.readFileSync('tests/verify-walls.cjs','utf8').split('function fixture')[0].replace("const fs=require('fs'),vm=require('vm'),assert=require('assert');",'').replace('const run=','var run=');
eval(bootstrap);
const shapes={
  LT:'[{x:0,y:0},{x:0,y:16000},{x:7000,y:16000},{x:7000,y:8000},{x:14000,y:8000},{x:14000,y:0}]',
  L:'[{x:0,y:0},{x:16000,y:0},{x:16000,y:7000},{x:8000,y:7000},{x:8000,y:14000},{x:0,y:14000}]'};
for(const [name,pts] of Object.entries(shapes)){
  run('model.elements=[{id:"R-001",type:"roof",story:"s0",layer:"Structure",points:'+pts+',pitch:25,height:3000,overhang:450,thickness:200,roofType:"hip",roofFraming:{system:"trusses"}}];var r=model.elements[0];var h=generateRoofFraming(r);');
  const mem=run('h.members.map(m=>({type:m.type,assembly:m.assembly,a:m.a,b:m.b}))');
  const carriers=mem.filter(m=>m.type==='Hip carrier bottom chord'),sides=mem.filter(m=>m.type==='Side jack bottom chord');
  // junction corner: LT -> (7000,0); L -> (0,7000). Nothing diagonal / no purple jack may touch it.
  const corner=name==='LT'?{x:7000,y:0}:{x:0,y:7000};
  const near=m=>[m.a,m.b].some(p=>Math.hypot(p.x-corner.x,p.y-corner.y)<2500);
  assert(!carriers.some(near),name+': hip carrier at junction corner');
  assert(!sides.some(near),name+': side jack at junction corner');
  // real exposed corners keep their hips: 4 hip-end corners remain per L (2 ends x 2 sides) minus the junction one(s)
  assert(new Set(carriers.map(m=>m.assembly)).size>=4,name+': exposed corners lost their hip carriers');
  assert(run('h.members.every(m=>Number.isFinite(m.cutLength??m.length))'));
}
console.log('PASS: junction-side hip ends use blue front jacks only; exposed corners keep carriers');

// Flat-topped junction ends: left-wing trusses landing on the adjoining wing keep roof height + end stud.
run('model.elements=[{id:"R-001",type:"roof",story:"s0",layer:"Structure",points:'+shapes.LT+',pitch:25,height:3000,overhang:450,thickness:200,roofType:"hip",roofFraming:{system:"trusses"}}];var r=model.elements[0];var h=generateRoofFraming(r);');
const mm=run('h.members.map(m=>({type:m.type,assembly:m.assembly,a:m.a,b:m.b}))');
const by={};for(const m of mm)(by[m.assembly]=by[m.assembly]||[]).push(m);
let junctionEnds=0,exposedEnds=0;
for(const [id,list] of Object.entries(by)){
  if(!/W1-(Commontruss|Hiptruss|Girdertruss)/.test(id))continue;
  const bot=list.filter(m=>/bottom chord/.test(m.type)),y=bot[0].a.y,tops=list.filter(m=>/top chord/.test(m.type)),
    east=tops.flatMap(m=>[m.a,m.b]).filter(p=>p.x>6900),minBottom=Math.min(...bot.flatMap(m=>[m.a.z,m.b.z]));
  if(y<8000){junctionEnds++;if(y<7000)assert(east.every(p=>p.z>minBottom+500),id+': junction end dropped to heel');
    if(y<7000)assert(list.some(m=>/ web$/.test(m.type)&&Math.abs(m.a.x-m.b.x)<1&&m.a.x>6800&&m.a.x<7000),id+': no vertical end stud at junction');}
  else{exposedEnds++;assert(east.every(p=>p.z<minBottom+400),id+': exposed end must keep eave heel');}
}
assert(junctionEnds>=10&&exposedEnds>=5,junctionEnds+'/'+exposedEnds);
console.log('PASS: junction-end Common/Hip/Girder trusses are flat-topped with end stud ('+junctionEnds+'); exposed ends keep heels ('+exposedEnds+')');
