const fs=require('fs'),vm=require('vm'),assert=require('assert');
const store={};const box={localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},document:{addEventListener(){}},console};vm.createContext(box);vm.runInContext(fs.readFileSync('dist/truss-optimizer.js','utf8'),box);
let r=vm.runInContext('trussBasisReadiness(trussDefaultDesignBasis())',box);assert.equal(r.complete,false);assert.equal(r.structuralSolverAvailable,false);assert.equal(r.structuralStatus,'NOT ANALYSED');
const full={standard:'Test standard',jurisdiction:'Project',deadLoadKpa:0.5,liveLoadKpa:0.25,windPressureKpa:1,timberGrade:'Verified grade',elasticModulusMpa:10000,bendingCapacityMpa:10,tensionCapacityMpa:5,compressionCapacityMpa:8,supportModel:'Engineer-defined bearings'};
r=vm.runInContext(`trussBasisReadiness(${JSON.stringify(full)})`,box);assert.equal(r.complete,true);assert.equal(r.structuralSolverAvailable,false);assert.equal(r.structuralStatus,'NOT ANALYSED');
full.windPressureKpa=-1;r=vm.runInContext(`trussBasisReadiness(${JSON.stringify(full)})`,box);assert(r.invalid.includes('windPressureKpa'));
console.log('PASS: design-basis readiness detects missing and invalid inputs and never claims structural pass status');
