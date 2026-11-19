import {
  setHostModel,
  roofGeometry,
  generateRoofFraming,
  convertRoofEngineToAssembly
} from './roof-engine-module.js';

console.log('Testing Roof Engine Module...');

// 1. Test rectangular hip roof with trusses
const modelTrusses = {
  stories: [{ id: 's0', name: 'Level 1', elevation: 0, height: 3000 }],
  elements: [{
    id: 'R-001',
    type: 'roof',
    story: 's0',
    layer: 'Structure',
    points: [[0,0],[14000,0],[14000,8000],[0,8000]].map(([x,y])=>({x,y})),
    pitch: 25,
    height: 3000,
    overhang: 609.6,
    thickness: 200,
    roofType: 'hip',
    roofFraming: {
      system: 'trusses',
      spacing: 600,
      width: 45,
      depth: 190,
      webDepth: 90,
      heel: 300,
      girderPlies: 2,
      hipSetback: 1828.8,
      webPattern: 'Fink'
    }
  }]
};

setHostModel(modelTrusses);
const roofT = modelTrusses.elements[0];
const geoT = roofGeometry(roofT);
console.log('Roof facets generated:', geoT.facets.length);
if (geoT.facets.length !== 4) throw new Error('Expected 4 hip facets, got ' + geoT.facets.length);

const framingT = generateRoofFraming(roofT);
console.log('Truss members generated:', framingT.members.length);
if (framingT.members.length === 0) throw new Error('No truss members generated!');

const asmT = convertRoofEngineToAssembly(roofT, framingT, geoT);
console.log('CadTech assembly trusses:', asmT.trusses.length);
if (asmT.trusses.length === 0) throw new Error('Assembly conversion failed: 0 trusses');
console.log('Sample truss:', asmT.trusses[0].id, asmT.trusses[0].type, 'members:', asmT.trusses[0].members.length);

// 2. Test conventional rafters mode
const modelRafters = {
  stories: [{ id: 's0', name: 'Level 1', elevation: 0, height: 3000 }],
  elements: [{
    id: 'R-002',
    type: 'roof',
    story: 's0',
    layer: 'Structure',
    points: [[0,0],[12000,0],[12000,6000],[0,6000]].map(([x,y])=>({x,y})),
    pitch: 30,
    height: 3000,
    overhang: 500,
    thickness: 200,
    roofType: 'gable',
    roofFraming: {
      system: 'rafters',
      spacing: 600,
      width: 45,
      depth: 190,
      webDepth: 90,
      heel: 200
    }
  }]
};

setHostModel(modelRafters);
const roofR = modelRafters.elements[0];
const geoR = roofGeometry(roofR);
const framingR = generateRoofFraming(roofR);
console.log('Rafter members generated:', framingR.members.length);
if (framingR.members.length === 0) throw new Error('No rafter members generated!');

const asmR = convertRoofEngineToAssembly(roofR, framingR, geoR);
console.log('CadTech assembly rafters:', asmR.rafters.length);
console.log('Roof facets in assembly:', asmR.roofFacets.length);

// 3. Test L-shaped multi-wing roof with trusses
const modelL = {
  stories: [{ id: 's0', name: 'Level 1', elevation: 0, height: 3000 }],
  elements: [{
    id: 'R-003',
    type: 'roof',
    story: 's0',
    layer: 'Structure',
    points: [[0,0],[14000,0],[14000,4300],[8000,4300],[8000,9100],[0,9100]].map(([x,y])=>({x,y})),
    pitch: 25,
    height: 3000,
    overhang: 609.6,
    thickness: 200,
    roofType: 'hip',
    roofFraming: {
      system: 'trusses',
      spacing: 600,
      width: 45,
      depth: 190,
      webDepth: 90,
      heel: 300,
      girderPlies: 2,
      hipSetback: 1828.8,
      webPattern: 'Fink'
    }
  }]
};

setHostModel(modelL);
const roofL = modelL.elements[0];
const geoL = roofGeometry(roofL);
console.log('L-shaped roof facets generated:', geoL.facets.length);
const framingL = generateRoofFraming(roofL);
console.log('L-shaped truss members generated:', framingL.members.length);
const asmL = convertRoofEngineToAssembly(roofL, framingL, geoL);
console.log('L-shaped CadTech assembly trusses:', asmL.trusses.length);

console.log('ALL ROOF ENGINE MODULE CHECKS PASSED!');
