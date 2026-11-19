const fs=require('fs'),vm=require('vm'),assert=require('assert');
const bootstrap=fs.readFileSync('tests/verify-walls.cjs','utf8').split('function fixture')[0];
eval(bootstrap.replace("const fs=require('fs'),vm=require('vm'),assert=require('assert');",'').replace('const run=','var run='));
// V3.87: the vertical end stud of EVERY front jack, side jack and hip carrier stands against the SIDE face of the
// receiving girder plies / hip carrier, and no web of any truss intrudes into a girder ply or a hip carrier.
const rot=(pts,deg,cx=6500,cy=4500)=>pts.map(p=>{const a=deg*Math.PI/180,x=p.x-cx,y=p.y-cy;return {x:Math.round((cx+x*Math.cos(a)-y*Math.sin(a))*10)/10,y:Math.round((cy+x*Math.sin(a)+y*Math.cos(a))*10)/10}});
const rect=[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}];
const small=[{x:0,y:0},{x:7000,y:0},{x:7000,y:4500},{x:0,y:4500}];
const multi=[[0,0],[10000,0],[10000,4000],[16000,4000],[16000,12000],[10000,12000],[10000,17000],[6000,17000],[6000,10000],[0,10000]].map(p=>({x:p[0],y:p[1]}));
const cases=[['rect',rect],['small',small],['multi',multi],['rect-rot33',rot(rect,33)],['multi-rot-20',rot(multi,-20)]];
let studs=0,bad=[];const roles={};
for(const [name,pts] of cases)for(const [plies,setback,pitch,sp] of [[2,1828.8,25,600],[1,1200,18,600],[3,1828.8,35,609.6],[4,900,25,400]]){
  run(`model.elements=[{id:'R',type:'roof',story:'s0',layer:'Structure',points:${JSON.stringify(pts)},pitch:${pitch},height:3000,overhang:609.6,thickness:200,roofType:'hip',roofFraming:{system:'trusses',spacing:${sp},width:45,depth:190,webDepth:90,heel:300,girderPlies:${plies},hipSetback:${setback}}}];var h=generateRoofFraming(model.elements[0]);`);
  const r=run(`(()=>{
    const M=h.members,w=45,out=[],roles={};let n=0;
    const girders=M.filter(m=>/^(Girder truss|Junction girder) bottom chord/.test(m.type)),carriers=M.filter(m=>m.type==='Hip carrier top chord');
    for(const s of M.filter(m=>/ web$/.test(m.type)&&m.cutFaces)){
      const vs=s.cutFaces.flat();
      if(s.endWeb===true){n++;roles[s.type]=(roles[s.type]||0)+1;
        // the stud must have been moved back off the receiver end node
        const top=M.find(m=>m.assembly===s.assembly&&/top chord/.test(m.type)),hi=top.a.z>top.b.z?top.a:top.b;
        if(Math.min(Math.hypot(s.a.x-hi.x,s.a.y-hi.y),Math.hypot(s.b.x-hi.x,s.b.y-hi.y))<5)out.push('end stud left on receiver node '+s.id);}
      for(const c of carriers){if(c.assembly===s.assembly)continue;const dx=c.b.x-c.a.x,dy=c.b.y-c.a.y,l2=dx*dx+dy*dy;
        for(const v of vs){const t=((v.x-c.a.x)*dx+(v.y-c.a.y)*dy)/l2;if(t<.02||t>.98)continue;const px=c.a.x+dx*t,py=c.a.y+dy*t,pz=c.a.z+(c.b.z-c.a.z)*t;
          if(Math.hypot(v.x-px,v.y-py)<w/2-1&&Math.abs(v.z-pz)<c.depth/2-1){out.push(s.type+' '+s.id+' inside hip carrier '+c.id);break;}}}
      for(const g of girders){if(g.assembly===s.assembly)continue;const dx=g.b.x-g.a.x,dy=g.b.y-g.a.y,l2=dx*dx+dy*dy;if(l2<1)continue;
        for(const v of vs){const t=((v.x-g.a.x)*dx+(v.y-g.a.y)*dy)/l2;if(t<.02||t>.98)continue;const px=g.a.x+dx*t,py=g.a.y+dy*t;
          if(Math.hypot(v.x-px,v.y-py)<w/2-1&&v.z>g.a.z-1&&v.z<g.a.z+400){out.push(s.type+' '+s.id+' inside girder ply '+g.id);break;}}}
    }
    return {n,out,roles};})()`);
  studs+=r.n;for(const [k,v] of Object.entries(r.roles))roles[k]=(roles[k]||0)+v;bad.push(...r.out.map(x=>name+' '+plies+'ply sb'+setback+': '+x));
}
assert(studs>=400,'checked enough end studs: '+studs);
for(const role of ['Front jack web','Side jack web','Hip carrier web'])assert(roles[role]>0,'no end studs generated for '+role);
assert.equal(bad.length,0,bad.slice(0,4).join('; '));
console.log(`PASS: ${studs} end studs (front jacks ${roles['Front jack web']}, side jacks ${roles['Side jack web']}, hip carriers ${roles['Hip carrier web']}) stand beside their receiver; no web intrudes into a girder ply or hip carrier.`);
