// Standalone example: generate roof geometry + trusses with ONLY the files in core/ (no app.js, no DOM).
//   node demo/generate.cjs            -> prints a member summary and writes demo/members.json
const fs=require('fs'),vm=require('vm'),path=require('path');
const core=path.join(__dirname,'..','core');
const ctx=vm.createContext({console,Math,JSON});
for(const f of ['00-helpers.js','roof-footprint.js','roof.js','truss-joints.js','hip-trusses.js','roof-framing.js'])
  vm.runInContext(fs.readFileSync(path.join(core,f),'utf8'),ctx,{filename:f});
// Host model: one story + one roof element (plan points in mm, counter-clockwise or clockwise).
ctx.model={stories:[{id:'s0',name:'Level 1',elevation:0,height:3000}],elements:[{
  id:'R-001',type:'roof',story:'s0',layer:'Structure',
  points:[[0,0],[14000,0],[14000,4300],[8000,4300],[8000,9100],[0,9100]].map(([x,y])=>({x,y})),   // L-shaped plan
  pitch:25,height:3000,overhang:609.6,thickness:200,roofType:'hip',
  roofFraming:{system:'trusses',spacing:600,width:45,depth:190,webDepth:90,heel:300,girderPlies:2,hipSetback:1828.8}  // system: 'rafters' | 'trusses'
}]};
const roof=ctx.model.elements[0];
const geometry=vm.runInContext('roofGeometry(model.elements[0])',ctx);     // {facets,boundary,base,drop,...}
const framing=vm.runInContext('generateRoofFraming(model.elements[0])',ctx); // {members:[{type,a,b,width,depth,assembly,...}],issues}
const counts={};for(const m of framing.members)counts[m.type]=(counts[m.type]||0)+1;
console.log('roof facets:',geometry.facets.length);console.log(counts);console.log(framing.issues.join('\n'));
fs.writeFileSync(path.join(__dirname,'members.json'),JSON.stringify({facets:geometry.facets,members:framing.members.map(m=>({type:m.type,assembly:m.assembly,a:m.a,b:m.b,width:m.width,depth:m.depth,length:m.length}))}));
