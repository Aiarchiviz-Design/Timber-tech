const fs=require('fs'),vm=require('vm'),assert=require('assert');
const box={};vm.createContext(box);
const source=fs.readFileSync('dist/truss-optimizer.js','utf8');
vm.runInContext(source,box);
const audit=members=>vm.runInContext(`trussAuditConnections(${JSON.stringify(members)})`,box);
const joint=audit([
 {id:'chord',assembly:'T1',a:{x:0,y:0,z:0},b:{x:1000,y:0,z:0}},
 {id:'web',assembly:'T1',a:{x:500,y:500,z:0},b:{x:500,y:0,z:0}}
]);
assert.equal(joint.invalidMembers,0);
assert.equal(joint.connectedEndpoints,1);
assert.equal(joint.potentiallyDisconnectedEndpoints,3);
assert.equal(joint.status,'REVIEW');
const bad=audit([{id:'bad',a:{x:0,y:0,z:0},b:{x:0,y:0,z:0}}]);
assert.equal(bad.invalidMembers,1);assert.equal(bad.status,'FAIL');
const clean=audit([{id:'a',a:{x:0,y:0,z:0},b:{x:100,y:0,z:0}},{id:'b',a:{x:100,y:0,z:0},b:{x:100,y:100,z:0}}]);
assert.equal(clean.connectedEndpoints,2);assert.equal(clean.potentiallyDisconnectedEndpoints,2);
console.log('PASS: connection audit detects shared joints, unmatched endpoints, and invalid zero-length members');
