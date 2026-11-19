const fs=require('fs'),vm=require('vm'),assert=require('assert');
const bootstrap=fs.readFileSync('tests/verify-walls.cjs','utf8').split('function fixture')[0];
eval(bootstrap.replace("const fs=require('fs'),vm=require('vm'),assert=require('assert');",'').replace('const run=','var run='));
// V3.90: an arm hanging off the long side of the main wing runs its ridge away from the main wing, so its
// hip end (blue front jacks) is at the FREE end. 'aligned' keeps the V3.73 shared direction.
const U=[[0,0],[16000,0],[16000,5000],[11000,5000],[11000,9000],[5000,9000],[5000,12000],[0,12000]].map(p=>({x:p[0],y:p[1]}));
// main bar y 0..5000 (dominant), left arm x 0..5000 y 5000..12000 (free end y=12000)
const U2=[[0,0],[16000,0],[16000,5000],[11000,5000],[11000,12000],[5000,12000],[5000,5000],[0,5000]].map(p=>({x:p[0],y:p[1]}));
function gen(pts,dir){run(`model.elements=[{id:'R',type:'roof',story:'s0',layer:'Structure',points:${JSON.stringify(pts)},pitch:25,height:3000,overhang:600,thickness:200,roofType:'hip',roofFraming:{system:'trusses',spacing:600,wingDirection:'${dir}'}}];var h=generateRoofFraming(model.elements[0]);`)}
const jacks=zone=>run(`h.members.filter(m=>m.type==='Front jack bottom chord').map(m=>({a:m.a,b:m.b})).filter(m=>{const x=(m.a.x+m.b.x)/2,y=(m.a.y+m.b.y)/2;return ${zone}})`);
const along=j=>j.map(m=>Math.abs(m.b.y-m.a.y)>Math.abs(m.b.x-m.a.x)?'y':'x');
// Plan U2: arm x 5000..11000, y 5000..12000 below the bar (inverted T stem)
gen(U2,'branch');
const stem=jacks('x>5400&&x<10600&&y>5400');
assert(stem.length>=3,'stem has front jacks: '+stem.length);
assert(along(stem).every(d=>d==='y'),'stem front jacks run along the stem (N-S), not across it: '+along(stem).join(''));
assert(stem.every(m=>Math.max(m.a.y,m.b.y)>12000-1),'stem front jacks heel at the free end (south, y=12000+overhang)');
assert(!stem.some(m=>Math.min(m.a.y,m.b.y)<5600&&Math.abs(m.b.x-m.a.x)>Math.abs(m.b.y-m.a.y)),'no east/west hip jacks on the stem');
// the dominant bar keeps east/west hip ends
const bar=jacks('y<4600');assert(bar.length>0&&along(bar).every(d=>d==='x'),'main bar front jacks still run E-W');
// aligned = old behaviour: stem jacks run E-W (hip ends at the sides)
gen(U2,'aligned');
const old=jacks('x>5400&&x<10600&&y>5400');assert(old.length>0&&along(old).every(d=>d==='x'),'aligned keeps parallel wings: '+along(old).join(''));
console.log('PASS: branch arms hip at the free end with front jacks on the far side; aligned mode keeps the main-wing direction.');
