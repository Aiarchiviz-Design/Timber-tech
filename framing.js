/* Framing is regenerated from BIM walls and their hosted openings. These are
   construction layouts using specified member sizes, not load-sized designs. */
if(typeof distance==='undefined')var distance=function(a,b){return Math.hypot((b?.x||0)-(a?.x||0),(b?.y||0)-(a?.y||0))};
if(typeof sub2==='undefined')var sub2=function(a,b){return {x:(a?.x||0)-(b?.x||0),y:(a?.y||0)-(b?.y||0)}};
if(typeof lerp==='undefined')var lerp=function(a,b,t){return {x:(a?.x||0)+((b?.x||0)-(a?.x||0))*t,y:(a?.y||0)+((b?.y||0)-(a?.y||0))*t}};
if(typeof segmentDistance==='undefined')var segmentDistance=function(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return {distance:distance(p,lerp(a,b,t)),t,point:lerp(a,b,t)}};
var WALL_COMPOSITES={timber140:{name:'Timber 140 · insulated',skins:[{name:'Gypsum',thickness:13},{name:'Structural timber',thickness:140,core:true},{name:'Sheathing',thickness:19},{name:'Air gap',thickness:25},{name:'Cladding',thickness:16}]},timber90:{name:'Timber 90 · internal',skins:[{name:'Gypsum',thickness:13},{name:'Structural timber',thickness:90,core:true},{name:'Gypsum',thickness:13}]}};
var TIMBER_SIZES_C16_C24 = [
  { id: '38x89_C16',  name: '38 × 89 mm C16 (CLS 90 Internal / Partition)', studWidth: 38, studDepth: 89,  timberGrade: 'C16' },
  { id: '38x89_C24',  name: '38 × 89 mm C24 (CLS 90 Load-Bearing)',         studWidth: 38, studDepth: 89,  timberGrade: 'C24' },
  { id: '38x140_C16', name: '38 × 140 mm C16 (CLS 140 Timber Frame)',      studWidth: 38, studDepth: 140, timberGrade: 'C16' },
  { id: '38x140_C24', name: '38 × 140 mm C24 (CLS 140 High-Grade)',        studWidth: 38, studDepth: 140, timberGrade: 'C24' },
  { id: '38x184_C16', name: '38 × 184 mm C16 (CLS 184 Medium Deep)',       studWidth: 38, studDepth: 184, timberGrade: 'C16' },
  { id: '38x184_C24', name: '38 × 184 mm C24 (CLS 184 High Span)',         studWidth: 38, studDepth: 184, timberGrade: 'C24' },
  { id: '38x235_C16', name: '38 × 235 mm C16 (CLS 235 Deep Wall)',         studWidth: 38, studDepth: 235, timberGrade: 'C16' },
  { id: '38x235_C24', name: '38 × 235 mm C24 (CLS 235 Heavy Load-Bearing)',studWidth: 38, studDepth: 235, timberGrade: 'C24' },
  { id: '47x100_C16', name: '47 × 100 mm C16 (4" Standard Sawn)',          studWidth: 47, studDepth: 100, timberGrade: 'C16' },
  { id: '47x100_C24', name: '47 × 100 mm C24 (4" Structural Sawn)',        studWidth: 47, studDepth: 100, timberGrade: 'C24' },
  { id: '47x150_C16', name: '47 × 150 mm C16 (6" Standard Sawn)',          studWidth: 47, studDepth: 150, timberGrade: 'C16' },
  { id: '47x150_C24', name: '47 × 150 mm C24 (6" High-Grade Sawn)',        studWidth: 47, studDepth: 150, timberGrade: 'C24' },
  { id: '47x200_C16', name: '47 × 200 mm C16 (8" Deep Sawn)',              studWidth: 47, studDepth: 200, timberGrade: 'C16' },
  { id: '47x200_C24', name: '47 × 200 mm C24 (8" Heavy Structural)',       studWidth: 47, studDepth: 200, timberGrade: 'C24' },
  { id: '47x225_C16', name: '47 × 225 mm C16 (9" Deep Sawn)',              studWidth: 47, studDepth: 225, timberGrade: 'C16' },
  { id: '47x225_C24', name: '47 × 225 mm C24 (9" Heavy Load-Bearing)',     studWidth: 47, studDepth: 225, timberGrade: 'C24' },
  { id: '45x95_C16',  name: '45 × 95 mm C16 (Euro 45x95)',                studWidth: 45, studDepth: 95,  timberGrade: 'C16' },
  { id: '45x145_C24', name: '45 × 145 mm C24 (Euro 45x145)',               studWidth: 45, studDepth: 145, timberGrade: 'C24' }
];
function getTimberPresetId(c, w){
  const sw = Math.round(c.studWidth||38), sd = Math.round(c.studDepth || (w?w.thickness:140)), g = c.timberGrade || 'C16';
  const match = TIMBER_SIZES_C16_C24.find(p => p.studWidth === sw && p.studDepth === sd && p.timberGrade === g);
  return match ? match.id : 'custom';
}
var FRAMING_DEFAULTS={enabled:true,studWidth:38,studDepth:140,timberGrade:'C24',spacing:400,plateThickness:38,topPlates:2,bottomPlates:1,headerDepth:190,headerPlies:2,autoHeaderDepth:true,cornerDetail:"ext_opt1",tDetail:"backingStud",insideJunctionDetail:"int_opt1",blockingSpacing:1200,sheathingThickness:12,sheathing:true};

var EXTERIOR_CORNER_OPTIONS = [
  { id: 'auto', name: 'Auto (Default: Option 1 / Partition L-Corner)', desc: 'Auto-selects ext_opt1 for exterior walls and int_opt5 for interior partition L-corners' },
  { id: 'ext_opt1', name: 'Option 1: 2-Stud Outside Corner + Drywall Backer', desc: 'Through stud + flat drywall backing nailer + abutting stud (L-Backer)' },
  { id: 'ext_opt2', name: 'Option 2: 3-Stud Corner (Double Stud + Backer)', desc: 'Double stud pack + interior drywall backing nailer + abutting stud' },
  { id: 'ext_opt3', name: 'Option 3: 3-Stud Insulated U-Channel (California Corner)', desc: 'Corner stud + dual flat backing flanges forming open U-channel + abutting stud' },
  { id: 'ext_opt4', name: 'Option 4: 4-Stud Solid Stacked Corner Post', desc: '4 stacked studs solid pack on through-wall + abutting stud' },
  { id: 'ext_opt5', name: 'Option 5: 3-Stud Box Corner (Flanking Studs + Backer)', desc: 'Outer corner stud + flat inner backing nailer + flanking vertical stud + abutting stud' }
];

var INTERIOR_JUNCTION_OPTIONS = [
  { id: 'auto', name: 'Auto (Default: Option 1 / Option 5)', desc: 'Auto-selects int_opt1 for interior T-junctions and int_opt5 for interior L-corners' },
  { id: 'int_opt1', name: 'Option 1: Single Stud + Drywall Nailer Backing', desc: 'Single left return stud + flat drywall backing nailer flush with branch wall + abutting stud' },
  { id: 'int_opt2', name: 'Option 2: 2-Stud Flanking with Ladder Blocking', desc: '2 flanking return studs with horizontal ladder blocking on branch wall face' },
  { id: 'int_opt3', name: 'Option 3: 3-Stud Solid Post T-Junction', desc: '3 studs clustered solid side-by-side + abutting end stud' },
  { id: 'int_opt4', name: 'Option 4: Single Stud + Extended Drywall Backing Flange', desc: 'Single left return stud + extended flat drywall backing nailer projecting past branch wall' },
  { id: 'int_opt5', name: 'Option 5: Interior Partition L-Corner', desc: 'Partition wall corner: 1 outer end stud + flat drywall backing nailer + abutting end stud' }
];

var VALID_EXTERIOR_CORNER_IDS = ['ext_opt1', 'ext_opt2', 'ext_opt3', 'ext_opt4', 'ext_opt5'];
var VALID_INTERIOR_JUNCTION_IDS = ['int_opt1', 'int_opt2', 'int_opt3', 'int_opt4', 'int_opt5'];

function resolveCornerDetail(w, other) {
  let mode = w?.framing?.cornerDetail || (w ? construction(w).cornerDetail : 'auto');
  if (mode === 'twoStud' || mode === 'option-1') mode = 'ext_opt1';
  else if (mode === 'threeStud' || mode === 'option-2') mode = 'ext_opt2';
  else if (mode === 'option-3') mode = 'ext_opt3';
  else if (mode === 'fourStud' || mode === 'option-4') mode = 'ext_opt4';
  else if (mode === 'option-5') mode = 'ext_opt5';
  const isWExt = typeof isExteriorWall === 'function' ? isExteriorWall(w) : (w?.layer === 'Exterior Walls' || (w?.name && /ext|outer|exterior/i.test(w.name)) || w?.exterior === true || (!w?.layer && !w?.internal && (w?.thickness || 140) >= 130));
  const isOtherExt = other ? (typeof isExteriorWall === 'function' ? isExteriorWall(other) : (other?.layer === 'Exterior Walls' || (other?.name && /ext|outer|exterior/i.test(other.name)) || other?.exterior === true || (!other?.layer && !other?.internal && (other?.thickness || 140) >= 130))) : isWExt;
  if (!mode || mode === 'auto') {
    if (!isWExt && !isOtherExt) return 'int_opt5';
    return 'ext_opt1';
  }
  if (!isWExt && !isOtherExt && !VALID_EXTERIOR_CORNER_IDS.includes(mode)) {
    return 'int_opt5';
  }
  if (VALID_EXTERIOR_CORNER_IDS.includes(mode) || mode === 'int_opt5') {
    return mode;
  }
  return (!isWExt && !isOtherExt) ? 'int_opt5' : 'ext_opt1';
}

function normalizeJunctionMode(raw) {
  if (!raw || raw === 'auto') return 'auto';
  if (raw === 'insideStudPartial' || raw === 'option-1') return 'int_opt1';
  if (raw === 'insideBlocking' || raw === 'option-2') return 'int_opt2';
  if (raw === 'option-3') return 'int_opt3';
  if (raw === 'insideStudFull' || raw === 'option-4') return 'int_opt4';
  if (raw === 'option-5') return 'int_opt5';
  return VALID_INTERIOR_JUNCTION_IDS.includes(raw) ? raw : 'auto';
}

function resolveJunctionDetail(w, other) {
  const wRaw = w?.framing?.insideJunctionDetail || w?.framing?.junctionDetail || (w ? construction(w).insideJunctionDetail : 'auto');
  const otherRaw = other?.framing?.insideJunctionDetail || other?.framing?.junctionDetail;
  const wMode = normalizeJunctionMode(wRaw);
  const otherMode = normalizeJunctionMode(otherRaw);
  // If the terminating branch wall has an explicit non-default option while through-wall is auto/default, honor branch wall option
  let mode = wMode;
  if ((wMode === 'auto' || wMode === 'int_opt1') && otherMode !== 'auto' && otherMode !== 'int_opt5') {
    mode = otherMode;
  } else if (wMode === 'auto' && otherMode !== 'auto') {
    mode = otherMode;
  }
  if (!mode || mode === 'auto') {
    return 'int_opt1';
  }
  if (VALID_INTERIOR_JUNCTION_IDS.includes(mode)) {
    return mode;
  }
  return 'int_opt1';
}

function autoConfigureWallJunctionStudPacks(customModel, forceAuto = false) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  if (!mModel || !Array.isArray(mModel.elements)) return { configured: 0, details: [] };
  const walls = mModel.elements.filter(e => e && e.type === 'wall' && construction(e).enabled);
  let configuredCount = 0;
  const details = [];

  for (const w of walls) {
    const juncs = wallFramingJunctions(w, mModel);
    if (!juncs.length) continue;

    let wallChanged = false;
    const curFraming = w.framing || { ...construction(w) };
    const isExt = typeof isExteriorWall === 'function' ? isExteriorWall(w) : (w.layer === 'Exterior Walls' || (w.name && /ext|outer|exterior/i.test(w.name)) || w.exterior === true || (!w.layer && !w.internal && (w.thickness || 140) >= 130));

    for (const j of juncs) {
      const other = walls.find(e => e.id === j.otherId);
      if (j.type === 'Corner pack') {
        const curCorner = curFraming.cornerDetail;
        const hasValidExplicit = isExt
          ? VALID_EXTERIOR_CORNER_IDS.includes(curCorner)
          : (VALID_EXTERIOR_CORNER_IDS.includes(curCorner) || curCorner === 'int_opt5');
        const resolved = hasValidExplicit ? curCorner : resolveCornerDetail(w, other);
        if (curFraming.cornerDetail !== resolved) {
          curFraming.cornerDetail = resolved;
          wallChanged = true;
          details.push(`${w.id} (${j.type}): configured ${resolved}`);
        }
      } else if (j.type === 'T-junction studs' || j.type === 'Cross-junction studs') {
        const resolved = resolveJunctionDetail(w, other);
        if (curFraming.insideJunctionDetail !== resolved) {
          curFraming.insideJunctionDetail = resolved;
          wallChanged = true;
          details.push(`${w.id} (${j.type}): configured ${resolved}`);
        }
      }
    }
    if (wallChanged) {
      w.framing = { ...curFraming, collisionsFixed: true, junctionBackingFixed: true };
      configuredCount++;
    }
  }
  return { configured: configuredCount, details };
}

function construction(w){
  const isExternal = w.layer === 'Exterior Walls' || (w.name && /ext|outer|exterior/i.test(w.name)) || w.exterior === true || (!w.layer && !w.internal && (w.thickness || 140) >= 130);
  const defaultDepth = isExternal ? 140 : 89;
  const defaultGrade = isExternal ? 'C24' : 'C16';
  const defaultCorner = isExternal ? 'ext_opt1' : 'int_opt5';
  const defaultJunction = 'int_opt1';
  const saved = w.framing || {};
  let depth = saved.studDepth || defaultDepth;
  if (w.thickness && depth > w.thickness) {
    depth = Math.min(w.thickness, defaultDepth);
  }
  const c = {
    ...FRAMING_DEFAULTS,
    enabled: ['Timber','Oak'].includes(w.material||'Timber') || true,
    studWidth: 38,
    studDepth: depth,
    timberGrade: saved.timberGrade || defaultGrade,
    spacing: saved.spacing || 400,
    sheathingThickness: saved.sheathingThickness || 12,
    sheathing: saved.sheathing !== false,
    headerPlies: Math.max(1, Math.min(2, Math.floor(depth / 38))),
    ...saved,
    studDepth: depth
  };
  c.headerPlies = Math.max(1, Math.min(c.headerPlies || 2, Math.floor(c.studDepth / c.studWidth)));
  c.cornerDetail = saved.cornerDetail || defaultCorner;
  c.insideJunctionDetail = saved.insideJunctionDetail || defaultJunction;
  if (w.structure === 'composite') c.studDepth = depth;
  return c;
}

function getWallSheathingSide(w) {
  if (!w || !isWallExtFlag(w)) return 'none';
  const side = w.sheathingSide || w.framing?.sheathingSide;
  if (side === 'none' || side === 'interior' || side === 'exterior' || side === 'both') return side;
  if (side === 'inside') return 'interior';
  if (w.sheathingFlipped || w.framing?.sheathingFlipped) return 'interior';
  return 'exterior';
}

function flipWallSheathing(w) {
  if (!w) return 'exterior';
  const cur = getWallSheathingSide(w);
  let next = 'interior';
  if (cur === 'exterior') next = 'interior';
  else if (cur === 'interior') next = 'both';
  else if (cur === 'both') next = 'none';
  else next = 'exterior';

  w.sheathingSide = next;
  w.sheathingFlipped = (next === 'interior');
  if (!w.framing) w.framing = construction(w);
  w.framing.sheathingSide = next;
  w.framing.sheathingFlipped = (next === 'interior');
  return next;
}
function validateConstruction(w){
  if(w.structure&&!['basic','composite'].includes(w.structure))throw Error('Unsupported wall structure.');
  if(w.reference&&!['inside','center','outside','coreInside','coreCenter','coreOutside'].includes(w.reference))throw Error('Unsupported wall reference line.');
  if(w.structure==='composite'){const skins=wallLayers(w);if(!Array.isArray(skins)||!skins.length||skins.length>20||skins.filter(s=>s.core).length!==1||skins.some(s=>!Number.isFinite(s.thickness)||s.thickness<=0)||Math.abs(skins.reduce((a,s)=>a+s.thickness,0)-w.thickness)>JOIN_EPS)throw Error('Invalid composite layers.')}
  for(const k of ['baseOffset','topOffset'])if(w[k]!==undefined&&(!Number.isFinite(w[k])||Math.abs(w[k])>50000))throw Error('Invalid wall offset.');
  const c=construction(w);
  const validCornerDetails = ["auto","ext_opt1","ext_opt2","ext_opt3","ext_opt4","ext_opt5","int_opt5","threeStud","twoStud","fourStud"];
  const validInsideDetails = ["auto","int_opt1","int_opt2","int_opt3","int_opt4","int_opt5","insideBlocking","insideStudFull","insideStudPartial"];
  if(!validCornerDetails.includes(c.cornerDetail)||!["backingStud","blocking"].includes(c.tDetail)||!validInsideDetails.includes(c.insideJunctionDetail)||!Number.isFinite(c.blockingSpacing)||c.blockingSpacing<100||c.blockingSpacing>10000)throw Error("Invalid junction detail.");
  if (w.thickness && c.studDepth > w.thickness) {
    c.studDepth = Math.min(w.thickness, c.studDepth);
    if (w.framing) w.framing.studDepth = c.studDepth;
  }
  c.headerPlies = Math.max(1, Math.min(c.headerPlies || 2, Math.floor(c.studDepth / c.studWidth)));
  if(typeof c.enabled!=='boolean'||!['studWidth','studDepth','spacing','plateThickness','headerDepth'].every(k=>Number.isFinite(c[k])&&c[k]>0&&c[k]<=10000)||c.spacing<Math.max(20,c.studWidth)||c.studDepth>w.thickness||!['topPlates','bottomPlates','headerPlies'].every(k=>Number.isInteger(c[k])&&c[k]>0&&c[k]<=6)||c.headerPlies*c.studWidth>c.studDepth)throw Error('Member sizes, spacing and header plies must fit the wall core.');
}
function wallLayers(w){return w.structure==='composite'?(w.skins||WALL_COMPOSITES[w.composite||'timber140']?.skins||WALL_COMPOSITES.timber140.skins):[{name:w.material||'Timber',thickness:w.thickness,core:true}]}
function coreGeometry(w){const skins=wallLayers(w),coreIndex=skins.findIndex(s=>s.core),insideFinish=skins.slice(0,Math.max(0,coreIndex)).reduce((a,s)=>a+s.thickness,0),depth=skins[coreIndex]?.thickness||w.thickness;return {insideFinish,depth,center:w.structure==='composite'?w.thickness/2-insideFinish-depth/2:0}}
function referenceOffset(w){const c=coreGeometry(w),r=w.reference||'center',offset={center:0,inside:-w.thickness/2,outside:w.thickness/2,coreInside:-w.thickness/2+c.insideFinish,coreCenter:-w.thickness/2+c.insideFinish+c.depth/2,coreOutside:-w.thickness/2+c.insideFinish+c.depth}[r]||0;return offset*(w.flipped?-1:1)}
function wallCenterPoint(w,p){const u=sub2(w.b,w.a),len=Math.hypot(u.x,u.y)||1,r=referenceOffset(w);return {x:p.x-u.y/len*r,y:p.y+u.x/len*r}}
function wallBase(w){return storyOf(w).elevation+(w.baseOffset||0)}
function openingSolidPolygon(w,o){const len=distance(w.a,w.b),ps=rawWallPoly(w,lerp(w.a,w.b,(o.offset-o.width/2)/len),lerp(w.a,w.b,(o.offset+o.width/2)/len),40),shift=((w.thickness-40)/2-(o.reveal??(w.thickness-40)/2))*(w.flipped?-1:1),u=sub2(w.b,w.a);return ps.map(p=>({x:p.x-u.y/len*shift,y:p.y+u.x/len*shift}))}
function isWallExtFlag(w) {
  if (!w) return false;
  if (typeof isExteriorWall === 'function') return isExteriorWall(w);
  return w.layer === 'Exterior Walls' || (w.name && /ext|outer|exterior/i.test(w.name)) || w.exterior === true || (!w.layer && !w.internal && (w.thickness || 140) >= 130);
}
function isCornerThroughWall(w, other) {
  if (!w || !other) return false;
  const isWExt = isWallExtFlag(w);
  const isOtherExt = isWallExtFlag(other);
  if (isWExt !== isOtherExt) return isWExt;
  return String(w.id).localeCompare(String(other.id)) < 0;
}
function wallFramingJunctions(w, customModel){
  const mModel=customModel||(typeof model!=='undefined'?model:(typeof window!=='undefined'?window.model:null)),
        elems=(mModel?.elements||[]).filter(e=>e.type==='wall'&&e.id!==w.id&&e.story===w.story),
        len=distance(w.a,w.b),u=sub2(w.b,w.a),found=[];
  if(len<1)return found;
  const isWExt = isWallExtFlag(w);
  const cornerPartners = { a: null, b: null };
  for(const other of elems){
    const otherLen=distance(other.a,other.b),v=sub2(other.b,other.a);
    if(len*otherLen<1||Math.abs(cross2(u,v))/(len*otherLen)<.05)continue;
    const tol=(Math.max(0,w.thickness||0)+Math.max(0,other.thickness||0))/2+1;
    let isCornerWithOther = false;
    for(const k of ['a','b']){
      const minDist = Math.min(distance(other.a, w[k]), distance(other.b, w[k]));
      if(minDist<=tol){
        isCornerWithOther = true;
        const cur = cornerPartners[k];
        const sameKind = isWallExtFlag(other) === isWExt;
        if (!cur || (sameKind && !cur.sameKind) || (sameKind === cur.sameKind && minDist < cur.dist)) {
          cornerPartners[k] = { otherId: other.id, sameKind, dist: minDist };
        }
      }
    }
    if(isCornerWithOther) continue;
    // A branch wall may terminate on the face of a through-wall, not its centreline.
    for(const [branchEnd,p] of [['a',other.a],['b',other.b]]){
      const d=segmentDistance(p,w.a,w.b);
      if(d.distance<=tol && d.t*len > tol && (1-d.t)*len > tol){
        found.push({x:d.t*len,type:'T-junction studs',otherId:other.id,branchEnd,point:{x:d.point.x,y:d.point.y}});
      }
    }
    const h=axisIntersection(w.a,w.b,other.a,other.b);
    if(h&&h.t*len>tol&&(1-h.t)*len>tol&&h.s*otherLen>tol&&(1-h.s)*otherLen>tol){
      found.push({x:h.t*len,type:'Cross-junction studs',otherId:other.id,point:h.point});
    }
  }
  if (cornerPartners.a) found.push({ x: 0, type: 'Corner pack', otherId: cornerPartners.a.otherId });
  if (cornerPartners.b) found.push({ x: len, type: 'Corner pack', otherId: cornerPartners.b.otherId });
  // Only collapse repeated detections of the same pair and location; distinct branches remain visible.
  return found.filter((j,i)=>!found.slice(0,i).some(o=>o.otherId===j.otherId&&o.type===j.type&&Math.abs(o.x-j.x)<1));
}
function insideJunctionCenter(w,other,branchEnd){
  const len=distance(w.a,w.b)||1,otherLen=distance(other.a,other.b),
        foot=framingMemberWorld(other,{x0:branchEnd==='a'?0:otherLen,x1:branchEnd==='a'?0:otherLen,depth:construction(other).studDepth}),
        p=lerp(foot[0],foot[2],.5),u=sub2(w.b,w.a);
  return ((p.x-w.a.x)*u.x+(p.y-w.a.y)*u.y)/len;
}
function insideJunctionKey(w,otherId,x){return `T:${[String(w.id),String(otherId)].sort().join('|')}:${Math.round(x)}`;}
function insideJunctionLabel(mode){
  const found = INTERIOR_JUNCTION_OPTIONS.find(o => o.id === mode);
  if (found) return found.name;
  return ({
    insideBlocking:'Option 2: 2-Stud Flanking with Ladder Blocking',
    insideStudFull:'Option 4: Single Stud + Extended Drywall Backing Flange',
    insideStudPartial:'Option 1: Single Stud + Drywall Nailer Backing',
    int_opt1:'Option 1: Single Stud + Drywall Nailer Backing',
    int_opt2:'Option 2: 2-Stud Flanking with Ladder Blocking',
    int_opt3:'Option 3: 3-Stud Solid Post T-Junction',
    int_opt4:'Option 4: Single Stud + Extended Drywall Backing Flange',
    int_opt5:'Option 5: Interior Partition L-Corner',
    auto:'Auto (Default: Option 1 / Option 5)'
  })[mode]||String(mode||'Auto (Default: Option 1)');
}
function cornerDetailLabel(mode){
  const found = EXTERIOR_CORNER_OPTIONS.find(o => o.id === mode);
  if (found) return found.name;
  return ({
    threeStud:'Option 2: 3-Stud Corner (Double Stud + Backer)',
    twoStud:'Option 1: 2-Stud Outside Corner + Drywall Backer',
    fourStud:'Option 4: 4-Stud Solid Stacked Corner Post',
    ext_opt1:'Option 1: 2-Stud Outside Corner + Drywall Backer',
    ext_opt2:'Option 2: 3-Stud Corner (Double Stud + Backer)',
    ext_opt3:'Option 3: 3-Stud Insulated U-Channel (California Corner)',
    ext_opt4:'Option 4: 4-Stud Solid Stacked Corner Post',
    ext_opt5:'Option 5: 3-Stud Box Corner (Flanking Studs + Backer)',
    int_opt5:'Option 5: Interior Partition L-Corner',
    auto:'Auto (Default: Option 1 / Partition L-Corner)'
  })[mode]||String(mode||'Auto (Default: Option 1)');
}

function renderConnectionSvg(category, optionKey) {
  const plateStyle = 'stroke="#1e293b" stroke-width="1.8" fill="none"';
  const studStyle = 'fill="#dcfce7" stroke="#15803d" stroke-width="1.4"';
  const xStyle = 'stroke="#15803d" stroke-width="1.1"';

  if (category === 'exterior') {
    if (optionKey === 'option-1' || optionKey === 'ext_opt1' || optionKey === 'twoStud') {
      return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><path d="M15,95 L15,25 L145,25 M50,95 L50,60 L145,60" ${plateStyle}/><rect x="15" y="60" width="35" height="15" ${studStyle}/><line x1="15" y1="60" x2="50" y2="75" ${xStyle}/><line x1="15" y1="75" x2="50" y2="60" ${xStyle}/><rect x="15" y="25" width="15" height="35" ${studStyle}/><line x1="15" y1="25" x2="30" y2="60" ${xStyle}/><line x1="15" y1="60" x2="30" y2="25" ${xStyle}/><rect x="30" y="47" width="32" height="13" ${studStyle}/><line x1="30" y1="47" x2="62" y2="60" ${xStyle}/><line x1="30" y1="60" x2="62" y2="47" ${xStyle}/></svg>`;
    } else if (optionKey === 'option-2' || optionKey === 'ext_opt2' || optionKey === 'threeStud') {
      return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><path d="M15,95 L15,25 L145,25 M50,95 L50,60 L145,60" ${plateStyle}/><rect x="15" y="25" width="15" height="35" ${studStyle}/><line x1="15" y1="25" x2="30" y2="60" ${xStyle}/><line x1="15" y1="60" x2="30" y2="25" ${xStyle}/><rect x="30" y="25" width="15" height="35" ${studStyle}/><line x1="30" y1="25" x2="45" y2="60" ${xStyle}/><line x1="30" y1="60" x2="45" y2="25" ${xStyle}/><rect x="15" y="60" width="35" height="15" ${studStyle}/><line x1="15" y1="60" x2="50" y2="75" ${xStyle}/><line x1="15" y1="75" x2="50" y2="60" ${xStyle}/><rect x="45" y="47" width="30" height="13" ${studStyle}/><line x1="45" y1="47" x2="75" y2="60" ${xStyle}/><line x1="45" y1="60" x2="75" y2="47" ${xStyle}/></svg>`;
    } else if (optionKey === 'option-3' || optionKey === 'ext_opt3') {
      return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><path d="M15,95 L15,25 L145,25 M50,95 L50,60 L145,60" ${plateStyle}/><rect x="15" y="25" width="15" height="35" ${studStyle}/><line x1="15" y1="25" x2="30" y2="60" ${xStyle}/><line x1="15" y1="60" x2="30" y2="25" ${xStyle}/><rect x="15" y="60" width="35" height="15" ${studStyle}/><line x1="15" y1="60" x2="50" y2="75" ${xStyle}/><line x1="15" y1="75" x2="50" y2="60" ${xStyle}/><rect x="30" y="25" width="32" height="12" ${studStyle}/><line x1="30" y1="25" x2="62" y2="37" ${xStyle}/><line x1="30" y1="37" x2="62" y2="25" ${xStyle}/><rect x="30" y="48" width="32" height="12" ${studStyle}/><line x1="30" y1="48" x2="62" y2="60" ${xStyle}/><line x1="30" y1="60" x2="62" y2="48" ${xStyle}/></svg>`;
    } else if (optionKey === 'option-4' || optionKey === 'ext_opt4' || optionKey === 'fourStud') {
      return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><path d="M15,95 L15,25 L145,25 M50,95 L50,60 L145,60" ${plateStyle}/><rect x="15" y="25" width="11" height="35" ${studStyle}/><line x1="15" y1="25" x2="26" y2="60" ${xStyle}/><line x1="15" y1="60" x2="26" y2="25" ${xStyle}/><rect x="26" y="25" width="11" height="35" ${studStyle}/><line x1="26" y1="25" x2="37" y2="60" ${xStyle}/><line x1="26" y1="60" x2="37" y2="25" ${xStyle}/><rect x="37" y="25" width="11" height="35" ${studStyle}/><line x1="37" y1="25" x2="48" y2="60" ${xStyle}/><line x1="37" y1="60" x2="48" y2="25" ${xStyle}/><rect x="48" y="25" width="11" height="35" ${studStyle}/><line x1="48" y1="25" x2="59" y2="60" ${xStyle}/><line x1="48" y1="60" x2="59" y2="25" ${xStyle}/><rect x="15" y="60" width="35" height="15" ${studStyle}/><line x1="15" y1="60" x2="50" y2="75" ${xStyle}/><line x1="15" y1="75" x2="50" y2="60" ${xStyle}/></svg>`;
    } else if (optionKey === 'option-5' || optionKey === 'ext_opt5') {
      return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><path d="M15,95 L15,25 L145,25 M50,95 L50,60 L145,60" ${plateStyle}/><rect x="15" y="25" width="15" height="35" ${studStyle}/><line x1="15" y1="25" x2="30" y2="60" ${xStyle}/><line x1="15" y1="60" x2="30" y2="25" ${xStyle}/><rect x="30" y="47" width="28" height="13" ${studStyle}/><line x1="30" y1="47" x2="58" y2="60" ${xStyle}/><line x1="30" y1="60" x2="58" y2="47" ${xStyle}/><rect x="58" y="25" width="15" height="35" ${studStyle}/><line x1="58" y1="25" x2="73" y2="60" ${xStyle}/><line x1="58" y1="60" x2="73" y2="25" ${xStyle}/><rect x="15" y="60" width="35" height="15" ${studStyle}/><line x1="15" y1="60" x2="50" y2="75" ${xStyle}/><line x1="15" y1="75" x2="50" y2="60" ${xStyle}/></svg>`;
    }
    return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><text x="80" y="60" text-anchor="middle" font-size="12" fill="#64748b">Auto</text></svg>`;
  } else {
    if (optionKey === 'option-1' || optionKey === 'int_opt1' || optionKey === 'insideStudPartial') {
      return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><path d="M15,25 L145,25 M15,55 L65,55 M95,55 L145,55 M65,55 L65,95 M95,55 L95,95" ${plateStyle}/><rect x="53" y="25" width="12" height="30" ${studStyle}/><line x1="53" y1="25" x2="65" y2="55" ${xStyle}/><line x1="53" y1="55" x2="65" y2="25" ${xStyle}/><rect x="65" y="44" width="30" height="11" ${studStyle}/><line x1="65" y1="44" x2="95" y2="55" ${xStyle}/><line x1="65" y1="55" x2="95" y2="44" ${xStyle}/><rect x="65" y="55" width="30" height="14" ${studStyle}/><line x1="65" y1="55" x2="95" y2="69" ${xStyle}/><line x1="65" y1="69" x2="95" y2="55" ${xStyle}/></svg>`;
    } else if (optionKey === 'option-2' || optionKey === 'int_opt2' || optionKey === 'insideBlocking') {
      return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><path d="M15,25 L145,25 M15,55 L65,55 M95,55 L145,55 M65,55 L65,95 M95,55 L95,95" ${plateStyle}/><rect x="35" y="25" width="12" height="30" ${studStyle}/><line x1="35" y1="25" x2="47" y2="55" ${xStyle}/><line x1="35" y1="55" x2="47" y2="25" ${xStyle}/><rect x="113" y="25" width="12" height="30" ${studStyle}/><line x1="113" y1="25" x2="125" y2="55" ${xStyle}/><line x1="113" y1="55" x2="125" y2="25" ${xStyle}/><rect x="47" y="45" width="66" height="10" ${studStyle}/><rect x="65" y="55" width="30" height="14" ${studStyle}/><line x1="65" y1="55" x2="95" y2="69" ${xStyle}/><line x1="65" y1="69" x2="95" y2="55" ${xStyle}/></svg>`;
    } else if (optionKey === 'option-3' || optionKey === 'int_opt3') {
      return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><path d="M15,25 L145,25 M15,55 L65,55 M95,55 L145,55 M65,55 L65,95 M95,55 L95,95" ${plateStyle}/><rect x="62" y="25" width="12" height="30" ${studStyle}/><line x1="62" y1="25" x2="74" y2="55" ${xStyle}/><line x1="62" y1="55" x2="74" y2="25" ${xStyle}/><rect x="74" y="25" width="12" height="30" ${studStyle}/><line x1="74" y1="25" x2="86" y2="55" ${xStyle}/><line x1="74" y1="55" x2="86" y2="25" ${xStyle}/><rect x="86" y="25" width="12" height="30" ${studStyle}/><line x1="86" y1="25" x2="98" y2="55" ${xStyle}/><line x1="86" y1="55" x2="98" y2="25" ${xStyle}/><rect x="65" y="55" width="30" height="14" ${studStyle}/><line x1="65" y1="55" x2="95" y2="69" ${xStyle}/><line x1="65" y1="69" x2="95" y2="55" ${xStyle}/></svg>`;
    } else if (optionKey === 'option-4' || optionKey === 'int_opt4' || optionKey === 'insideStudFull') {
      return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><path d="M15,25 L145,25 M15,55 L65,55 M95,55 L145,55 M65,55 L65,95 M95,55 L95,95" ${plateStyle}/><rect x="53" y="25" width="12" height="30" ${studStyle}/><line x1="53" y1="25" x2="65" y2="55" ${xStyle}/><line x1="53" y1="55" x2="65" y2="25" ${xStyle}/><rect x="65" y="44" width="42" height="11" ${studStyle}/><line x1="65" y1="44" x2="107" y2="55" ${xStyle}/><line x1="65" y1="55" x2="107" y2="44" ${xStyle}/><rect x="65" y="55" width="30" height="14" ${studStyle}/><line x1="65" y1="55" x2="95" y2="69" ${xStyle}/><line x1="65" y1="69" x2="95" y2="55" ${xStyle}/></svg>`;
    } else if (optionKey === 'option-5' || optionKey === 'int_opt5') {
      return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><path d="M25,95 L25,35 L145,35 M55,95 L55,65 L145,65" ${plateStyle}/><rect x="25" y="35" width="14" height="30" ${studStyle}/><line x1="25" y1="35" x2="39" y2="65" ${xStyle}/><line x1="25" y1="65" x2="39" y2="35" ${xStyle}/><rect x="39" y="53" width="28" height="12" ${studStyle}/><line x1="39" y1="53" x2="67" y2="65" ${xStyle}/><line x1="39" y1="65" x2="67" y2="53" ${xStyle}/><rect x="25" y="65" width="30" height="14" ${studStyle}/><line x1="25" y1="65" x2="55" y2="79" ${xStyle}/><line x1="25" y1="79" x2="55" y2="65" ${xStyle}/></svg>`;
    }
    return `<svg viewBox="0 0 160 110" style="width:100%;height:100%"><text x="80" y="60" text-anchor="middle" font-size="12" fill="#64748b">Auto</text></svg>`;
  }
}

function insideJunctionDiagram(mode){
  return renderConnectionSvg('interior', mode);
}
function cornerDetailDiagram(mode){
  return renderConnectionSvg('exterior', mode);
}

function insideJunctionOptionsHtml(selectedMode){
  const items = [
    ['auto', 'Auto (Option 1)', 'Default to Option 1 for T-junctions and Option 5 for interior L-corners'],
    ['int_opt1', 'Option 1', 'Single left stud + flat drywall backing nailer'],
    ['int_opt2', 'Option 2', '2 flanking studs with ladder blocking'],
    ['int_opt3', 'Option 3', '3-stud solid post T-junction'],
    ['int_opt4', 'Option 4', 'Single left stud + extended drywall backing flange'],
    ['int_opt5', 'Option 5', 'Interior partition L-corner']
  ];
  return `<div class="junction-detail-options" role="group" aria-label="Internal wall junction detail">${items.map(([mode,title,desc])=>`<button type="button" class="junction-detail-option${selectedMode===mode?' is-selected':''}" data-junction-detail="${mode}" aria-pressed="${selectedMode===mode?'true':'false'}">${renderConnectionSvg('interior', mode)}<span class="junction-detail-option-copy"><b>${title}</b><small>${desc}</small></span><span class="junction-detail-check" aria-hidden="true">${selectedMode===mode?'✓':''}</span></button>`).join('')}</div>`;
}

function cornerDetailOptionsHtml(selectedMode){
  const items = [
    ['auto', 'Auto (Option 1)', 'Default to Option 1 for exterior corners'],
    ['ext_opt1', 'Option 1', '2-stud corner + drywall backer (L-Backer)'],
    ['ext_opt2', 'Option 2', '3-stud corner (Double stud + backer)'],
    ['ext_opt3', 'Option 3', '3-stud insulated U-channel (California corner)'],
    ['ext_opt4', 'Option 4', '4-stud solid stacked corner post'],
    ['ext_opt5', 'Option 5', '3-stud box corner (Flanking studs + backer)']
  ];
  return `<div class="junction-detail-options" role="group" aria-label="Exterior wall corner detail">${items.map(([mode,title,desc])=>`<button type="button" class="junction-detail-option${selectedMode===mode?' is-selected':''}" data-corner-detail="${mode}" aria-pressed="${selectedMode===mode?'true':'false'}">${renderConnectionSvg('exterior', mode)}<span class="junction-detail-option-copy"><b>${title}</b><small>${desc}</small></span><span class="junction-detail-check" aria-hidden="true">${selectedMode===mode?'✓':''}</span></button>`).join('')}</div>`;
}
/* Horizontal blocking between studs and cripples at construction().blockingSpacing (from the bottom plate up).
   A block is a 2x-depth piece laid flat on the wall: length along the wall, height = lumber depth, thickness = stud width.
   Blocks are skipped across openings, headers, sills and plates. */
function addHorizontalBlocking(w,c,members,add,usableOpenings,bottom,top){
  /* Flat horizontal blocking, same orientation as the top and bottom plates: a piece of stud-width height laid
     across the wall (thickness = stud depth) between studs and cripples. Rows sit at every blockingSpacing
     measured up from the wall base while below the top plate. Within a row, a bay is skipped only where an
     opening, header or sill sits over that same bay. */
  const sw=c.studWidth,d=c.studDepth,step=c.blockingSpacing;
  if(!(step>0)||!(d>0))return;
  const verts=members.filter(m=>/stud|cripple|pack/i.test(m.type)&&m.z1-m.z0>1);
  for(let z=step;z<top-sw;z+=step){
    const zLo=z-sw/2,zHi=z+sw/2;
    if(zLo<bottom+sw||zHi>top-sw)continue;
    const rowVerts=verts.filter(m=>m.z0<=zHi&&m.z1>=zLo).sort((a,b)=>(a.x0-b.x0)||(a.x1-b.x1));
    for(let i=0;i+1<rowVerts.length;i++){
      const xa=rowVerts[i].x1,xb=rowVerts[i+1].x0;
      if(xb-xa<75)continue;
      const mid=(xa+xb)/2;
      // only the bay under a header / sill / opening is skipped, not the whole row
      if(members.some(m=>/^(Header|Sill|Beam)$/i.test(m.type)&&m.z0<zHi+1&&m.z1>zLo-1&&m.x1>xa&&m.x0<xb))continue;
      if(usableOpenings.some(o=>o.sill<zHi+1&&o.head>zLo-1&&mid>o.left-sw&&mid<o.right+sw))continue;
      const mb=add('Block',xa,xb,zLo,zHi,d);
      if(mb)mb.section=`${sw} × ${d}`;
    }
  }
}

/* Beams on a wall whose top is level with the wall top (same storey) replace the top plate over their length.
   Inside the beam span: studs and cripples above the beam bottom are removed, studs that reach the beam are shortened
   to the beam bottom, blocks in the beam zone are removed, and the top plate is split around the beam. Jack studs are
   added under each beam end where no stud already carries it, and the beam itself is added as a member.
   A beam that runs into an opening is reported in issues and left out of the framing. */
function applyBeamAdjustments(w,c,h,members,add,mModel,usableOpenings,issues,len){
  const beams=(mModel&&mModel.elements||[]).filter(e=>e.type==='beam'&&e.story===w.story&&Number.isFinite(e.thickness)&&e.thickness>0);
  if(!beams.length||!(len>0))return;
  const sw=c.studWidth,ux=(w.b.x-w.a.x)/len,uy=(w.b.y-w.a.y)/len;
  const bottomZ=Math.max(0,...members.filter(m=>/^Bottom plate$/i.test(m.type)).map(m=>m.z1));
  const along=p=>(p.x-w.a.x)*ux+(p.y-w.a.y)*uy;
  const across=p=>Math.abs(-(p.x-w.a.x)*uy+(p.y-w.a.y)*ux);
  for(const b of beams){
    const hb=typeof heightOf==='function'?heightOf(b):b.height;
    if(!Number.isFinite(hb)||Math.abs(hb-h)>5)continue;                       // beam top must match wall top
    const reach=(w.thickness||200)/2+b.thickness/2+50;
    if(Math.max(across(b.a),across(b.b))>reach)continue;                    // beam must lie on this wall
    const xs=Math.max(0,Math.min(along(b.a),along(b.b))),xe=Math.min(len,Math.max(along(b.a),along(b.b)));
    if(xe-xs<100)continue;
    const zBot=h-b.thickness;
    if(zBot<=bottomZ+sw)continue;
    if(usableOpenings.some(o=>o.right>xs&&o.left<xe&&o.head>zBot)){issues.push(`${b.id}: beam runs into an opening on ${w.id}; beam framing not applied.`);continue;}
    // remove or shorten what the beam takes over
    const topRems=[];
    for(let i=members.length-1;i>=0;i--){
      const m=members[i];
      if(/^Beam$/i.test(m.type))continue;
      const overlapsX=m.x1>xs-1&&m.x0<xe+1;
      if(/^Top plate$/i.test(m.type)&&overlapsX&&m.z1>zBot){topRems.push({x0:m.x0,x1:m.x1,z0:m.z0,z1:m.z1,depth:m.depth,role:m.role,plateIndex:m.plateIndex});members.splice(i,1);continue;}
      if(/^Bottom plate$/i.test(m.type))continue;
      const cx=(m.x0+m.x1)/2;
      if(/stud|cripple|pack/i.test(m.type)&&m.z1-m.z0>1&&cx>xs-sw&&cx<xe+sw&&m.z1>zBot+1){
        if(m.z0>=zBot-1)members.splice(i,1);else m.z1=zBot;
        continue;
      }
      if(/^Block$/i.test(m.type)&&overlapsX&&m.z1>zBot&&m.z0<h){members.splice(i,1);continue;}
      if(overlapsX&&m.z0>=zBot-1&&m.z1>zBot)members.splice(i,1);
    }
    // top plate pieces left and right of the beam
    // each top plate layer keeps its own height outside the beam span
    for(const t of topRems)for(const [r0,r1] of [[t.x0,Math.min(t.x1,xs)],[Math.max(t.x0,xe),t.x1]]){
      if(r1-r0>20){const tp=add('Top plate',r0,r1,t.z0,t.z1,t.depth);if(tp){tp.role=t.role;tp.plateIndex=t.plateIndex;}}
    }
    // the beam, and jack studs under each end
    const mb=add('Beam',xs,xe,zBot,h,b.thickness);
    if(mb)mb.section=`${b.thickness} × ${b.thickness}`;
    for(const xc of [xs+sw/2,xe-sw/2]){
      const carried=members.some(m=>/stud|cripple|pack/i.test(m.type)&&Math.abs((m.x0+m.x1)/2-xc)<30&&m.z0<=bottomZ+1&&m.z1>=zBot-1);
      if(!carried)add('Jack stud',xc-sw/2,xc+sw/2,bottomZ,zBot);
    }
  }
}

function calculateJunctionStudOffset(studX, wall, junctions = [], openings = [], reservedZones = [], config = {}) {
  const sw = config.studWidth || 38;
  const spacing = config.spacing || 400;
  const minBound = config.minBound || sw;
  const maxBound = config.maxBound || (distance(wall?.a, wall?.b) - sw);

  // Check if studX falls inside any reserved junction or opening zone
  const hitRes = reservedZones.find(([a, b]) => studX + sw / 2 > a + 0.5 && studX - sw / 2 < b - 0.5);
  const hitOp = openings.find(o => studX + sw / 2 > o.left - sw - 2 && studX - sw / 2 < o.right + sw + 2);

  if (!hitRes && !hitOp) {
    return { offset: 0, adjustedX: studX, colliding: false, targetZone: null };
  }

  // Calculate direction vector and minimum clearance offset based on surrounding junction geometry
  const targetZone = hitRes || (hitOp ? [hitOp.left - sw, hitOp.right + sw] : null);
  const [resStart, resEnd] = targetZone || [studX - sw, studX + sw];
  const distToLeft = studX - resStart;
  const distToRight = resEnd - studX;

  const preferLeft = distToLeft < distToRight;
  const searchDirs = preferLeft ? [-1, 1] : [1, -1];

  let bestOffset = 0;
  let bestAdjustedX = studX;

  for (let delta = 10; delta <= spacing * 0.9; delta += 5) {
    for (const dir of searchDirs) {
      const candX = Math.round(studX + dir * delta);
      if (candX - sw / 2 < minBound || candX + sw / 2 > maxBound) continue;

      const stillHitsRes = reservedZones.some(([a, b]) => candX + sw / 2 > a + 0.5 && candX - sw / 2 < b - 0.5);
      const stillHitsOp = openings.some(o => candX + sw / 2 > o.left - sw - 2 && candX - sw / 2 < o.right + sw + 2);

      if (!stillHitsRes && !stillHitsOp) {
        bestOffset = candX - studX;
        bestAdjustedX = candX;
        return {
          offset: bestOffset,
          adjustedX: bestAdjustedX,
          colliding: true,
          targetZone
        };
      }
    }
  }

  return {
    offset: bestOffset,
    adjustedX: bestAdjustedX,
    colliding: true,
    targetZone
  };
}

function generateJunctionAwareStudPositions(runStart, runEnd, spacing, sw, reservedZones, wall, junctions, openings) {
  const positions = [];
  const minBound = runStart + sw;
  const maxBound = runEnd - sw;

  // 1. Place a single end stud at runStart + sw/2 and runEnd - sw/2 ONLY if not already covered by a Corner pack reserved zone
  for (const endX of [runStart + sw / 2, runEnd - sw / 2]) {
    if (endX - sw / 2 < runStart - 0.01 || endX + sw / 2 > runEnd + 0.01) continue;
    const inCornerReserved = reservedZones.some(([a, b]) => endX + sw / 2 > a + 0.5 && endX - sw / 2 < b - 0.5);
    if (!inCornerReserved && !positions.some(p => Math.abs(p.x - endX) < sw - 0.5)) {
      positions.push({ x: endX, shifted: false, originalX: endX, offset: 0, isEndStud: true });
    }
  }

  // 2. Place regular on-center field studs along the wall
  for (let rawX = runStart + sw / 2 + spacing; rawX <= runEnd - sw / 2 - sw + 0.01; rawX += spacing) {
    if (rawX - sw / 2 < minBound - 0.01 || rawX + sw / 2 > maxBound + 0.01) continue;

    // Corner packs, T-junction packs, and Opening King/Jack packs already provide full-height structural studs in reservedZones.
    // Do not place or shift an extra common stud onto the boundary of a corner/junction pack (which would alter Option 1..5).
    const inReserved = reservedZones.some(([a, b]) => rawX + sw / 2 > a + 0.5 && rawX - sw / 2 < b - 0.5);
    const inOpening = openings.some(o => rawX + sw / 2 > o.left - sw - 0.5 && rawX - sw / 2 < o.right + sw + 0.5);
    if (inReserved || inOpening) continue;

    // Maintain at least sw clear gap from end studs so an abutting/branch wall keeps its single end stud
    const hitsPlaced = positions.some(p => Math.abs(p.x - rawX) < (p.isEndStud ? 2 * sw - 1 : sw - 1));
    if (!hitsPlaced) {
      positions.push({ x: rawX, shifted: false, originalX: rawX, offset: 0 });
    }
  }

  return positions;
}

function autoAdjustStudOffsetsForJunctionGeometry(customModel, targetWallId) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  if (typeof autoShiftCollidingStuds === 'function') {
    return autoShiftCollidingStuds(mModel, targetWallId);
  }
  return { fixedCount: 0, shiftedStudCount: 0, wallCount: 0, details: [] };
}

function generateWallFraming(w, customModel){
  if(!w||w.type!=='wall')return {wallId:w?.id,members:[],issues:[]};
  const mModel=customModel||(typeof model!=='undefined'?model:(typeof window!=='undefined'?window.model:null));
  const c=construction(w),len=(w.a&&w.b)?distance(w.a,w.b):NaN,
        fallbackHeight=typeof heightOf==='function'?heightOf(w):3048,
        h=Number.isFinite(w.height)&&w.height>0?w.height:fallbackHeight,
        members=[],issues=[];
  if(!c.enabled)return {wallId:w.id,members,issues};
  if(!Number.isFinite(len)||len<Math.max(1,2*c.studWidth)){
    issues.push(`${w.id}: wall axis is missing or too short for framing; no members generated.`);
    return {wallId:w.id,members,issues};
  }
  if(!Number.isFinite(h)||h<=0){
    issues.push(`${w.id}: wall height must be a positive millimetre value; no members generated.`);
    return {wallId:w.id,members,issues};
  }
  try{validateConstruction(w)}catch(err){
    issues.push(`${w.id}: invalid wall framing settings (${err?.message||'check member sizes and spacing'}); no members generated.`);
    return {wallId:w.id,members,issues};
  }
  const run=framingRun(w, mModel),sw=c.studWidth,bottom=c.bottomPlates*c.plateThickness,top=h-c.topPlates*c.plateThickness;
  if(!Number.isFinite(run.start)||!Number.isFinite(run.end)||run.end-run.start<2*sw){
    issues.push(`${w.id}: connected wall run is too short or invalid after junction offsets.`);
    return {wallId:w.id,members,issues};
  }
  if(top<=bottom){issues.push(`${w.id}: wall height does not leave clear space between the specified plate stacks.`);return {wallId:w.id,members,issues}}
  const rawHosted=(w.openings&&Array.isArray(w.openings)&&w.openings.length)?w.openings:(typeof hosted==='function'?hosted(w):(mModel?.elements||[]).filter(e=>e&&e.host===w.id));
  const allOpenings=rawHosted.map(o=>{
    const off=Number.isFinite(o.offset)?o.offset:(Number.isFinite(o.startDist)?o.startDist+(o.width||0)/2:NaN);
    const sill=Number.isFinite(o.sill)?o.sill:(Number.isFinite(o.sillHeight)?o.sillHeight:(o.type==='door'?0:900));
    return {...o,offset:off,sill,left:off-(o.width||0)/2,right:off+(o.width||0)/2,head:sill+(o.height||0)};
  }),junctions=wallFramingJunctions(w, mModel);
  /* Reject invalid hosted openings before laying out members; do not create negative,
     out-of-wall or vertically impossible framing around malformed BIM openings. */
  const openings=[];for(const o of allOpenings){let problem='';if(!Number.isFinite(o.offset)||!Number.isFinite(o.width)||!Number.isFinite(o.height)||!Number.isFinite(o.sill)||o.width<=0||o.height<=0)problem='opening has invalid dimensions';else if(o.left<-.01||o.right>len+.01)problem='opening extends beyond its host wall';else if(o.sill<-.01||o.head>h+.01)problem='opening sill/head is outside the wall height';else if(o.type==='door'&&Math.abs(o.sill)>1)problem='door sill must start at floor level';if(problem){issues.push(`${o.id}: ${problem}; framing omitted for this opening.`);continue}openings.push(o)}
  /* Openings on one wall must not overlap: overlapping doors/windows make
     king/jack and header layouts ambiguous, so reject both affected openings. */
  const conflicted=new Set();
  for(let i=0;i<openings.length;i++)for(let j=i+1;j<openings.length;j++){
    const a=openings[i],b=openings[j];
    if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>0.5){conflicted.add(a.id);conflicted.add(b.id);}
  }
  for(const id of conflicted)issues.push(`${id}: overlaps another opening on this wall; framing omitted for the conflicting openings.`);
  const usableOpenings=openings.filter(o=>!conflicted.has(o.id));
  const invalidRun=run.end-run.start<sw*2;if(invalidRun){issues.push('Connected wall run is too short for framing members.');return {wallId:w.id,members,issues}}
  const deletedStuds = Array.isArray(w.framing?.deletedStuds) ? w.framing.deletedStuds : [];
  const studOverrides = (w.framing?.studOverrides && typeof w.framing.studOverrides === 'object') ? w.framing.studOverrides : {};
  const isStudDeleted = (type, x0, z0, key) => {
    if (!deletedStuds.length) return false;
    const rx0 = Math.round(x0), rz0 = Math.round(z0);
    return deletedStuds.some(d => {
      if (!d) return false;
      if (typeof d === 'string') return d === key || d.endsWith(`:${rx0}:${rz0}`);
      if (d.studKey && d.studKey === key) return true;
      return Math.abs((d.x0 ?? -99999) - rx0) <= 4 && Math.abs((d.z0 ?? -99999) - rz0) <= 4 && (!d.type || d.type === type);
    });
  };
  const findStudOverride = (type, x0, z0, key) => {
    if (studOverrides[key]) return studOverrides[key];
    const rx0 = Math.round(x0), rz0 = Math.round(z0);
    const hasOccSuffix = String(key || '').split(':').length > 3;
    for (const ov of Object.values(studOverrides)) {
      if (!ov || typeof ov !== 'object') continue;
      if (ov.studKey === key) return ov;
      if (ov.studKey && (String(ov.studKey).split(':').length > 3 || hasOccSuffix)) continue;
      if (Math.abs((ov.x0 ?? -99999) - rx0) <= 4 && Math.abs((ov.z0 ?? -99999) - rz0) <= 4 && (!ov.type || ov.type === type)) {
        return ov;
      }
    }
    return null;
  };
  const addKeyCounts = new Map();
  const minPanelX = Math.min(0, run.start);
  const maxPanelX = Math.max(len, run.end);
  function add(type,x0,x1,z0,z1,depth=c.studDepth,lateralOffset=0){
    if(x1-x0<1||z1-z0<1)return;
    const isVerticalStud = !['Top plate','Bottom plate','Header','Sill','Block','Beam'].includes(type) &&
                           !/plate|header|sill|block|beam|noggin/i.test(type);
    const origX0 = Math.round(x0), origZ0 = Math.round(z0);
    const rawBaseKey = `${type}:${origX0}:${origZ0}`;
    const keyOcc = isVerticalStud ? ((addKeyCounts.get(rawBaseKey) || 0) + 1) : 1;
    if (isVerticalStud) addKeyCounts.set(rawBaseKey, keyOcc);
    const baseKey = keyOcc > 1 ? `${rawBaseKey}:${keyOcc}` : rawBaseKey;
    if (isStudDeleted(type, origX0, origZ0, baseKey) || isStudDeleted(type, origX0, origZ0, rawBaseKey)) {
      return null;
    }
    let memberSw = sw;
    let memberDepth = depth;
    let memberGrade = c.timberGrade || 'C24';
    const memberMaterialsMap = (w.framing?.memberMaterials && typeof w.framing.memberMaterials === 'object') ? w.framing.memberMaterials : {};
    let memberMaterial = isVerticalStud
      ? (c.studMaterial || 'dimensional')
      : (type === 'Header' ? (c.headerMaterial || 'dimensional') : (c.plateMaterial || 'dimensional'));
    if (memberMaterialsMap[baseKey] || memberMaterialsMap[rawBaseKey]) {
      memberMaterial = memberMaterialsMap[baseKey] || memberMaterialsMap[rawBaseKey];
    }
    let hasCustomSize = false;
    let customMoved = false;
    let customRotated = false;
    const ovAny = findStudOverride(type, origX0, origZ0, baseKey);
    const isLockedMember = Boolean(ovAny?.locked);
    const memberPlies = Number(ovAny?.plies) || (type === 'Header' ? (c.headerPlies || 2) : 1);
    const endConditionStart = ovAny?.endConditionStart || 'square';
    const endConditionEnd = ovAny?.endConditionEnd || 'square';
    if (!isVerticalStud && ovAny) {
      if (Number.isFinite(ovAny.targetX0)) {
        const span = x1 - x0;
        x0 = ovAny.targetX0;
        x1 = x0 + (Number(ovAny.customLength) || span);
        customMoved = true;
      } else if (Number.isFinite(ovAny.offsetX) && Math.abs(ovAny.offsetX) > 0.1) {
        x0 += ovAny.offsetX;
        x1 += ovAny.offsetX;
        customMoved = true;
      }
      if (Number.isFinite(ovAny.customLength) && ovAny.customLength > 20) {
        x1 = x0 + ovAny.customLength;
      }
      if (Number.isFinite(ovAny.studWidth) && ovAny.studWidth > 15) {
        z1 = z0 + ovAny.studWidth;
        memberSw = ovAny.studWidth;
        hasCustomSize = true;
      }
      if (Number.isFinite(ovAny.studDepth) && ovAny.studDepth > 40) {
        memberDepth = ovAny.studDepth;
        hasCustomSize = true;
      }
      if (ovAny.timberGrade) memberGrade = ovAny.timberGrade;
      if (ovAny.framingMaterial) memberMaterial = ovAny.framingMaterial;
    }
    if (isVerticalStud) {
      const initIsFlat = Math.abs(depth - sw) <= 2 && Math.abs((x1 - x0) - sw) > 5;
      const curW = Math.abs(x1 - x0);
      // Remove all square stud methods and logic: All studs must be rectangular 140x38, 89x38, etc.
      if (!initIsFlat && curW > sw + 5 && depth > sw + 5 && (Math.abs(curW - depth) < 2 || curW >= depth - 1)) {
        const cx = (x0 + x1) / 2;
        x0 = cx - sw / 2;
        x1 = cx + sw / 2;
      }
      const ov = findStudOverride(type, origX0, origZ0, baseKey);
      if (ov) {
        const ovW = Number(ov.studWidth) || sw;
        const ovD = Number(ov.studDepth) || c.studDepth;
        const safeW = Math.abs(ovW - ovD) < 2 ? 38 : Math.min(ovW, ovD);
        const safeD = Math.abs(ovW - ovD) < 2 ? Math.max(89, ovD) : Math.max(ovW, ovD);

        if (Number.isFinite(ov.targetX0)) {
          const span = x1 - x0;
          x0 = ov.targetX0;
          x1 = x0 + span;
          customMoved = true;
        } else if (Number.isFinite(ov.offsetX) && Math.abs(ov.offsetX) > 0.1) {
          x0 += ov.offsetX;
          x1 += ov.offsetX;
          customMoved = true;
        }

        const isFlatNow = ov.orientation
          ? (ov.orientation === 'flat')
          : (typeof ov.rotated === 'boolean' ? (ov.rotated ? !initIsFlat : initIsFlat) : initIsFlat);

        if (isFlatNow !== initIsFlat || ov.orientation || typeof ov.rotated === 'boolean') {
          customRotated = true;
        }

        if (isFlatNow) {
          x1 = x0 + safeD;
          memberDepth = safeW;
          if (Number.isFinite(ov.lateralOffset)) {
            lateralOffset = ov.lateralOffset;
          } else if (ov.faceAlign === 'outer') {
            lateralOffset = -(c.studDepth - safeW) / 2;
          } else if (ov.faceAlign === 'center') {
            lateralOffset = 0;
          } else if (ov.faceAlign === 'inner' || Math.abs(lateralOffset) < 1) {
            lateralOffset = (c.studDepth - safeW) / 2;
          }
        } else {
          x1 = x0 + safeW;
          memberDepth = safeD;
          lateralOffset = Number.isFinite(ov.lateralOffset) ? ov.lateralOffset : 0;
        }

        const finalSpan = x1 - x0;
        if (x0 < minPanelX) {
          x0 = minPanelX;
          x1 = x0 + finalSpan;
        }
        if (x1 > maxPanelX) {
          x1 = maxPanelX;
          x0 = Math.max(minPanelX, x1 - finalSpan);
        }

        memberSw = safeW;
        memberGrade = ov.timberGrade || memberGrade;
        if (ov.framingMaterial) memberMaterial = ov.framingMaterial;
        if (ov.studWidth || ov.studDepth || ov.timberGrade || (ov.framingMaterial && ov.framingMaterial !== 'dimensional')) {
          hasCustomSize = true;
        }
      }

      // Deduplicate overlapping vertical studs ONLY for automatic (unmoved) studs.
      // Never swallow or delete a stud when either stud has been manually dragged (customMoved) or is an Extra stud.
      if (!customMoved && type !== 'Extra stud') {
        const midX = (x0 + x1) / 2;
        const isFlatBacking = Math.abs(memberDepth - memberSw) <= 2 && Math.abs((x1 - x0) - memberSw) > 5;
        const existingIdx = members.findIndex(m => {
          if (!m.isStud || m.customMoved || m.isExtraStud || m.type === 'Extra stud') return false;
          const mIsFlat = Math.abs((m.depth || c.studDepth) - (m.studWidth || sw)) <= 2 && Math.abs((m.x1 - m.x0) - (m.studWidth || sw)) > 5;
          if (mIsFlat !== isFlatBacking) return false;
          if (Math.abs((m.lateralOffset || 0) - lateralOffset) > 5) return false;
          const exMidX = (m.x0 + m.x1) / 2;
          const sameX = Math.abs(exMidX - midX) < (memberSw - 2);
          const zOverlap = Math.min(m.z1, z1) - Math.max(m.z0, z0);
          return sameX && zOverlap > 50;
        });
        if (existingIdx >= 0) {
          const existingStud = members[existingIdx];
          if (customRotated && !existingStud.customRotated && existingStud.type === 'Common stud') {
            members.splice(existingIdx, 1);
          } else {
            if (!existingStud.type.includes(type) && !existingStud.role?.includes(type)) {
              existingStud.role = existingStud.role ? (existingStud.role + ' / ' + type) : type;
            }
            return existingStud;
          }
        }
      }
    }
    const cleanType = String(type).replace(/[^a-zA-Z0-9]+/g, '_');
    const studId = isVerticalStud
      ? (keyOcc > 1 ? `${w.id}:STUD:${cleanType}:${origX0}:${origZ0}:${keyOcc}` : `${w.id}:STUD:${cleanType}:${origX0}:${origZ0}`)
      : `${w.id}:F-${String(members.length+1).padStart(4,'0')}`;
    const isNowFlat = isVerticalStud && Math.abs(memberDepth - memberSw) <= 2 && Math.abs((x1 - x0) - memberSw) > 5;
    const effectiveStudDepth = hasCustomSize
      ? Math.max(memberSw, memberDepth, Number(findStudOverride(type, origX0, origZ0, baseKey)?.studDepth) || c.studDepth)
      : c.studDepth;
    const member={
      id:studId,
      studKey:baseKey,
      origX0,
      origZ0,
      wallId:w.id,
      type,
      x0,
      x1,
      z0,
      z1,
      depth:memberDepth,
      lateralOffset,
      studWidth:memberSw,
      studDepth:effectiveStudDepth,
      orientation:isNowFlat ? 'flat' : 'vertical',
      customMoved,
      customRotated,
      locked:isLockedMember,
      plies:memberPlies,
      endConditionStart,
      endConditionEnd,
      timberGrade:memberGrade,
      framingMaterial:memberMaterial,
      customSize:hasCustomSize,
      isStud:isVerticalStud,
      length:['Top plate','Bottom plate','Header','Sill','Block','Beam'].includes(type)?x1-x0:z1-z0,
      section:['Top plate','Bottom plate','Sill'].includes(type)?`${c.plateThickness} × ${c.studDepth}`:type==='Header'?`${c.headerPlies*sw} × ${c.headerDepth}`:`${memberSw} × ${effectiveStudDepth}`
    };
    members.push(member);
    return member;
  }
  if(top<=bottom){issues.push('Wall is too short for the specified plates.');return {wallId:w.id,members,issues}}
  const manualBreaks = Array.isArray(w.framing?.manualBreaks)
    ? w.framing.manualBreaks.filter(x => Number.isFinite(x) && x > run.start + 50 && x < run.end - 50)
    : (Array.isArray(w.manualBreaks) ? w.manualBreaks.filter(x => Number.isFinite(x) && x > run.start + 50 && x < run.end - 50) : []);
  const gableProfForPlates = typeof computeWallRoofGableProfile === 'function' ? computeWallRoofGableProfile(w, mModel) : null;
  const isGableWithRake = Boolean(gableProfForPlates && gableProfForPlates.peakRise > 45);
  if (!isGableWithRake) {
    const vtSegments = c.topPlates > 1 ? veryTopPlateSegments(w, mModel) : [[run.start, run.end]];
    for(let i=0;i<c.topPlates;i++){
      const isVeryTop = c.topPlates > 1 && i === 0;
      let plateRuns = isVeryTop ? vtSegments.map(([a, b]) => [a, b]) : [[run.start, run.end]];
      for (const xB of manualBreaks) {
        const splitX = isVeryTop ? Math.min(run.end - sw, xB + (c.studDepth || 140)) : xB;
        plateRuns = plateRuns.flatMap(([a, b]) => (splitX <= a + sw || splitX >= b - sw) ? [[a, b]] : [[a, splitX], [splitX, b]]);
      }
      for(const [pStart, pEnd] of plateRuns){
        const tp=add('Top plate',pStart,pEnd,h-(i+1)*c.plateThickness,h-i*c.plateThickness);
        if(tp){
          tp.plateIndex=i;
          tp.role=isVeryTop?'Very top plate':'Top plate';
        }
      }
    }
  }
  let bottomRuns=[[run.start,run.end]];for(const o of openings.filter(o=>o.type==='door'||o.sill<1))bottomRuns=bottomRuns.flatMap(([a,b])=>o.right<=a||o.left>=b?[[a,b]]:[[a,Math.max(a,o.left)],[Math.min(b,o.right),b]].filter(([a,b])=>b-a>1));
  const reserved=[];

  for (const xB of manualBreaks) {
    reserved.push([xB - sw, xB + sw]);
    const mBreakLeft = add('Break stud', xB - sw, xB, bottom, top);
    const mBreakRight = add('Break stud', xB, xB + sw, bottom, top);
    if (mBreakLeft) { mBreakLeft.role = 'Panel end break stud'; mBreakLeft.breakX = xB; }
    if (mBreakRight) { mBreakRight.role = 'Panel start break stud'; mBreakRight.breakX = xB; }

    bottomRuns = bottomRuns.flatMap(([a, b]) => {
      if (b <= xB - sw || a >= xB + sw) return [[a, b]];
      const out = [];
      if (a < xB - sw) out.push([a, xB - sw]);
      if (b > xB + sw) out.push([xB + sw, b]);
      return out;
    });
  }
  for(let i=0;i<c.bottomPlates;i++)for(const [a,b] of bottomRuns)add('Bottom plate',a,b,i*c.plateThickness,(i+1)*c.plateThickness);for(const o of usableOpenings){
    const span=o.width;
    const hDesign = (o.headerSpec && typeof window !== 'undefined' && window.WallOpeningEngine && typeof window.WallOpeningEngine.designOpeningHeader === 'function')
      ? window.WallOpeningEngine.designOpeningHeader(w, o, mModel)
      : null;
    let numJacks=1;
    if (hDesign && Number.isFinite(hDesign.requiredJacks)) {
      numJacks = hDesign.requiredJacks;
    } else if(c.codeStandard==='AS_1684'||c.codeStandard==='EUROCODE_5'){
      numJacks=span>1500?2:1;
    }else{
      numJacks=span>1524?2:1;
    }
    const availLeft = Math.max(0, o.left);
    const availRight = Math.max(0, len - o.right);
    if (numJacks > 1 && (availLeft < (numJacks + 1) * sw || availRight < (numJacks + 1) * sw)) {
      numJacks = 1;
    }

    let hDepth=c.headerDepth||184;
    if(c.autoHeaderDepth!==false){
      if (hDesign && Number.isFinite(hDesign.depthMm)) {
        hDepth = hDesign.depthMm;
      } else if(c.codeStandard==='AS_1684'){
        if(span<=1200)hDepth=140;else if(span<=1800)hDepth=190;else if(span<=2400)hDepth=240;else hDepth=290;
      }else if(c.codeStandard==='EUROCODE_5'){
        if(span<=1200)hDepth=150;else if(span<=1800)hDepth=200;else if(span<=2400)hDepth=225;else hDepth=250;
      }else{
        if(span<=1219)hDepth=140;else if(span<=1829)hDepth=184;else if(span<=2438)hDepth=235;else hDepth=286;
      }
    }
    const availableHeaderDepth=top-o.head;
    if(availableHeaderDepth<89){
      issues.push(`${o.id}: opening head leaves only ${Math.round(availableHeaderDepth)} mm for a header; minimum geometry allowance is 89 mm. Header and associated opening framing omitted.`);
      continue;
    }
    if(hDepth>availableHeaderDepth+.01){
      if(c.autoHeaderDepth!==false){
        hDepth=availableHeaderDepth;
      }else{
        issues.push(`${o.id}: fixed header depth ${Math.round(hDepth)} mm does not fit the ${Math.round(availableHeaderDepth)} mm available above the opening; header and associated opening framing omitted.`);
        continue;
      }
    }

    const finalJw=numJacks*sw;
    const leftKingX1 = Math.max(0, o.left - finalJw);
    const leftKingX0 = Math.max(0, leftKingX1 - sw);
    const rightKingX0 = Math.min(len, o.right + finalJw);
    const rightKingX1 = Math.min(len, rightKingX0 + sw);

    reserved.push([Math.max(0, leftKingX0), Math.min(len, rightKingX1)]);

    // Always generate Left King Stud
    if (leftKingX1 - leftKingX0 > 0.5) {
      add('King stud', leftKingX0, leftKingX1, bottom, top);
    } else {
      add('King stud', 0, Math.min(sw, o.left), bottom, top);
    }

    // Always generate Right King Stud
    if (rightKingX1 - rightKingX0 > 0.5) {
      add('King stud', rightKingX0, rightKingX1, bottom, top);
    } else {
      add('King stud', Math.max(len - sw, o.right), len, bottom, top);
    }

    const isTopHeader = c.headerPosition !== 'opening';
    const headerZ0 = isTopHeader ? Math.max(o.head, top - hDepth) : o.head;
    const headerZ1 = isTopHeader ? top : Math.min(top, o.head + hDepth);

    // Generate Left Jack Stud(s)
    for(let k=0;k<numJacks;k++){
      const jx0 = Math.max(0, o.left - finalJw + k * sw);
      const jx1 = Math.max(0, o.left - finalJw + (k + 1) * sw);
      if (jx1 - jx0 > 0.5) {
        add('Jack stud', jx0, jx1, bottom, headerZ0);
      } else if (k === 0) {
        add('Jack stud', Math.max(0, o.left - sw), o.left, bottom, headerZ0);
      }
    }

    // Generate Right Jack Stud(s)
    for(let k=0;k<numJacks;k++){
      const jx0 = Math.min(len, o.right + k * sw);
      const jx1 = Math.min(len, o.right + (k + 1) * sw);
      if (jx1 - jx0 > 0.5) {
        add('Jack stud', jx0, jx1, bottom, headerZ0);
      } else if (k === 0) {
        add('Jack stud', o.right, Math.min(len, o.right + sw), bottom, headerZ0);
      }
    }

    const headerX0 = Math.max(0, o.left - finalJw);
    const headerX1 = Math.min(len, o.right + finalJw);
    const headerTotalW = hDesign ? hDesign.totalWidthMm : (c.headerPlies * sw);
    const hMem=add('Header',headerX0,headerX1,headerZ0,headerZ1,headerTotalW);
    if(hMem){
      hMem.section = hDesign ? `${hDesign.totalWidthMm} × ${Math.round(hDepth)}` : `${c.headerPlies*sw} × ${Math.round(hDepth)}`;
      hMem.headerDepth = hDepth;
      hMem.headerPlies = hDesign ? hDesign.plies : c.headerPlies;
      hMem.headerLabel = hDesign ? hDesign.label : `${c.headerPlies}-Ply ${sw}×${Math.round(hDepth)} ${c.timberGrade || 'C24'}`;
      hMem.clearSpan = span;
      if (hDesign && hDesign.material) hMem.framingMaterial = hDesign.material === 'glulam' ? 'lvl' : hDesign.material;
    }
    // 2-ply sill plate at window sill (double plate: 2 * c.plateThickness)
    let totalSillThk=c.plateThickness;
    if(o.type==='window'&&o.sill>bottom+c.plateThickness){
      add('Sill',o.left,o.right,o.sill-c.plateThickness,o.sill);
      if(o.sill>bottom+2*c.plateThickness){
        add('Sill',o.left,o.right,o.sill-2*c.plateThickness,o.sill-c.plateThickness);
        totalSillThk=2*c.plateThickness;
      }
    }

    const crippleTop = isTopHeader ? top : Math.min(top, o.head + hDepth);
    const hasLower = o.type === 'window' && o.sill > bottom + totalSillThk;
    const lowerTop = o.sill - totalSillThk;

    if (!isTopHeader) {
      // Header is at opening head, cripples sit above header
      const upperLeftX0 = headerX0;
      const upperLeftX1 = Math.min(headerX1, headerX0 + sw);
      if (upperLeftX1 - upperLeftX0 > 0.5) {
        add('Header stud', upperLeftX0, upperLeftX1, crippleTop, top);
      }

      const upperRightX0 = Math.max(upperLeftX1, headerX1 - sw);
      const upperRightX1 = headerX1;
      if (upperRightX1 - upperRightX0 > 0.5 && upperRightX0 >= upperLeftX1 - 0.01) {
        add('Header stud', upperRightX0, upperRightX1, crippleTop, top);
      }

      // Upper cripples directly above J studs at opening left and right jambs
      add('Header stud', o.left, Math.min(o.right, o.left + sw), crippleTop, top);
      if (o.right - sw > o.left + sw - 0.1) {
        add('Header stud', Math.max(o.left, o.right - sw), o.right, crippleTop, top);
      }

      for (let x = run.start + sw / 2; x <= run.end - sw / 2 + .01; x += c.spacing) {
        const cx0 = x - sw / 2, cx1 = x + sw / 2;
        if (cx0 >= upperLeftX1 - .01 && cx1 <= upperRightX0 + .01) {
          add('Header stud', cx0, cx1, crippleTop, top);
        }
      }
    } else {
      // 1. Single 1-ply plate directly below header (User: "remove this stud need only one")
      const pThk = c.plateThickness;
      const belowPlies = (headerZ0 - pThk >= o.head + pThk) ? 1 : 0;
      for (let i = 0; i < belowPlies; i++) {
        add('Sill', o.left, o.right, headerZ0 - (i + 1) * pThk, headerZ0 - i * pThk);
      }
      const belowHeaderBottom = headerZ0 - belowPlies * pThk;

      // 2. 2-ply plate at opening head (every Window & Door)
      const canDoubleHead = belowHeaderBottom >= o.head + 2 * pThk;
      const headPlies = canDoubleHead ? 2 : (belowHeaderBottom >= o.head + pThk ? 1 : 0);
      for (let i = 0; i < headPlies; i++) {
        add('Sill', o.left, o.right, o.head + i * pThk, o.head + (i + 1) * pThk);
      }
      const openingHeadTop = o.head + headPlies * pThk;

      // 3. Header studs / cripples between opening head 2-ply plate and below-header 2-ply plate
      if (belowHeaderBottom > openingHeadTop + 10) {
        // ALWAYS generate upper cripples directly on top of the left and right "J" studs (at o.left and o.right-sw)
        add('Header stud', o.left, Math.min(o.right, o.left + sw), openingHeadTop, belowHeaderBottom);
        if (o.right - sw > o.left + sw - 0.1) {
          add('Header stud', Math.max(o.left, o.right - sw), o.right, openingHeadTop, belowHeaderBottom);
        }
        for (let x = run.start + sw / 2; x <= run.end - sw / 2 + .01; x += c.spacing) {
          const cx0 = x - sw / 2, cx1 = x + sw / 2;
          if (cx0 >= o.left + sw - .01 && cx1 <= o.right - sw + .01) {
            add('Header stud', cx0, cx1, openingHeadTop, belowHeaderBottom);
          }
        }
      }
    }

    // Lower cripples under window sill
    if (hasLower) {
      add('Lower cripple', o.left, Math.min(o.right, o.left + sw), bottom, lowerTop);
      if (o.right - sw > o.left + sw - 0.1) {
        add('Lower cripple', Math.max(o.left, o.right - sw), o.right, bottom, lowerTop);
      }
      for (let x = run.start + sw / 2; x <= run.end - sw / 2 + .01; x += c.spacing) {
        const cx0 = x - sw / 2, cx1 = x + sw / 2;
        if (cx0 >= o.left + sw - .01 && cx1 <= o.right - sw + .01) {
          add('Lower cripple', cx0, cx1, bottom, lowerTop);
        }
      }
    }
  }

  for(const j of junctions){
    const other=(mModel?.elements||[]).find(e=>e.id===j.otherId),atStart=j.x<len/2;
    if(j.type==='T-junction studs'&&other){
      const oc=construction(other),
            center=insideJunctionCenter(w,other,j.branchEnd),
            half=oc.studDepth/2,
            jointKey=insideJunctionKey(w,other.id,center),
            mode=resolveJunctionDetail(w,other);

      // Determine which normal side of w faces the intersecting wall (other)
      const uVec = sub2(w.b, w.a), nVec = { x: -uVec.y / (len || 1), y: uVec.x / (len || 1) };
      const otherFar = j.branchEnd === 'a' ? other.b : other.a;
      const toOther = sub2(otherFar, j.point || lerp(w.a, w.b, center / (len || 1)));
      const sideSign = (toOther.x * nVec.x + toOther.y * nVec.y) >= 0 ? 1 : -1;
      const backDepth = sw; // 38 mm across the wall thickness
      const branchWidth = Math.round(2 * half); // Full width of intersecting branch wall (e.g. 89 mm or 140 mm)
      const faceLateralOffset = sideSign * (c.studDepth - backDepth) / 2;

      if (mode === 'int_opt1' || mode === 'int_opt5') {
        // Interior Option 1: Single left vertical stud [center - half - sw, center - half] + flat backing stud [center - half, center + half] flush with branch wall
        const mainX0 = center - half - sw, mainX1 = center - half;
        const backX0 = center - half, backX1 = center + half;
        if (mainX0 >= run.start + sw && backX1 <= run.end - sw) {
          reserved.push([mainX0 - sw, backX1 + sw]);
          const mMain = add(j.type, mainX0, mainX1, bottom, top, c.studDepth);
          if (mMain) { mMain.role = 'T-junction return stud'; mMain.junctionId = jointKey; mMain.connectionDetail = mode; }
          const mBack = add('Inside junction backing stud (Full)', backX0, backX1, bottom, top, backDepth, faceLateralOffset);
          if (mBack) {
            mBack.section = `${sw} × ${branchWidth}`;
            mBack.role = 'Perpendicular backing stud';
            mBack.junctionId = jointKey;
            mBack.connectionDetail = mode;
          }
        }
      } else if (mode === 'int_opt2') {
        // Interior Option 2: 2 flanking vertical studs spaced outside branch wall + horizontal ladder blocking between them on branch wall face
        const leftStudX0 = center - half - 2 * sw, leftStudX1 = center - half - sw;
        const rightStudX0 = center + half + sw, rightStudX1 = center + half + 2 * sw;
        if (leftStudX0 >= run.start + sw && rightStudX1 <= run.end - sw) {
          reserved.push([leftStudX0 - sw, rightStudX1 + sw]);
          const leftReturn = add(j.type, leftStudX0, leftStudX1, bottom, top, c.studDepth);
          const rightReturn = add(j.type, rightStudX0, rightStudX1, bottom, top, c.studDepth);
          for (const m of [leftReturn, rightReturn]) if (m) { m.role = 'T-junction return stud'; m.junctionId = jointKey; m.connectionDetail = mode; }
          const step = c.blockingSpacing || 1200;
          for (let z = bottom + step; z < top - sw; z += step) {
            const bMem = add('Block', leftStudX1, rightStudX0, z - sw / 2, z + sw / 2, backDepth, faceLateralOffset);
            if (bMem) { bMem.role = 'Horizontal backing'; bMem.junctionId = jointKey; bMem.connectionDetail = mode; bMem.section = `${sw} × ${Math.round(rightStudX0 - leftStudX1)}`; }
          }
        }
      } else if (mode === 'int_opt3') {
        // Interior Option 3: 3-Stud Solid Post T-Junction centered on branch wall
        const left = center - Math.max(half, 1.5 * sw) - sw, right = center + Math.max(half, 1.5 * sw) + sw;
        if (center - 1.5 * sw >= run.start + sw && center + 1.5 * sw <= run.end - sw) {
          reserved.push([left, right]);
          const m1 = add(j.type, center - 1.5 * sw, center - 0.5 * sw, bottom, top, c.studDepth);
          const m2 = add(j.type, center - 0.5 * sw, center + 0.5 * sw, bottom, top, c.studDepth);
          const m3 = add(j.type, center + 0.5 * sw, center + 1.5 * sw, bottom, top, c.studDepth);
          for (const m of [m1, m2, m3]) if (m) { m.role = 'T-junction return stud'; m.junctionId = jointKey; m.connectionDetail = mode; }
        }
      } else {
        // Interior Option 4 (int_opt4): Single left vertical stud [center - half - sw, center - half] + extended flat backing stud [center - half, center + half + sw]
        const mainX0 = center - half - sw, mainX1 = center - half;
        const backX0 = center - half, backX1 = center + half + sw;
        if (mainX0 >= run.start + sw && backX1 <= run.end - sw) {
          reserved.push([mainX0 - sw, backX1 + sw]);
          const mMain = add(j.type, mainX0, mainX1, bottom, top, c.studDepth);
          if (mMain) { mMain.role = 'T-junction return stud'; mMain.junctionId = jointKey; mMain.connectionDetail = mode; }
          const mBack = add('Inside junction backing stud (Full)', backX0, backX1, bottom, top, backDepth, faceLateralOffset);
          if (mBack) {
            mBack.section = `${sw} × ${Math.round(backX1 - backX0)}`;
            mBack.role = 'Perpendicular backing stud';
            mBack.junctionId = jointKey;
            mBack.connectionDetail = mode;
          }
        }
      }
    }else if(j.type==='Corner pack'){
      const through=isCornerThroughWall(w,other),
            edge=atStart?run.start:run.end,
            cDetail=resolveCornerDetail(w,other);

      // Determine which normal side of w faces the abutting corner wall (other)
      const uVec = sub2(w.b, w.a), nVec = { x: -uVec.y / (len || 1), y: uVec.x / (len || 1) };
      const otherMid = other ? lerp(other.a, other.b, 0.5) : w.a;
      const toOther = sub2(otherMid, atStart ? w.a : w.b);
      const sideSign = (toOther.x * nVec.x + toOther.y * nVec.y) >= 0 ? 1 : -1;
      const backDepth = sw; // 38 mm across wall thickness
      const backWidth = c.studDepth; // 140 mm or 89 mm along wall length (rotated 90° perpendicular to corner stud)
      const innerFaceOffset = sideSign * (c.studDepth - backDepth) / 2;
      const outerFaceOffset = -sideSign * (c.studDepth - backDepth) / 2;

      if (cDetail === 'ext_opt1') {
        // Exterior Option 1: 1 corner stud + 1 flat inner drywall backer on through-wall; 1 abutting end stud on abutting wall
        const extent = through ? (sw + backWidth + sw) : (2 * sw);
        const left = atStart ? edge : edge - extent, right = atStart ? edge + extent : edge;
        if (right - left <= run.end - run.start) {
          reserved.push([left, right]);
          const xEnd = atStart ? edge : edge - sw;
          const mEnd = add(j.type, xEnd, xEnd + sw, bottom, top, c.studDepth);
          if (mEnd) mEnd.role = through ? 'Corner outside end stud' : 'Corner abutting end stud';
          if (through) {
            const xBack0 = atStart ? edge + sw : edge - sw - backWidth;
            const xBack1 = atStart ? edge + sw + backWidth : edge - sw;
            const mBack = add('Corner backing stud', xBack0, xBack1, bottom, top, backDepth, innerFaceOffset);
            if (mBack) {
              mBack.section = `${sw} × ${c.studDepth}`;
              mBack.role = 'Corner drywall backing stud';
            }
          }
        }
      } else if (cDetail === 'ext_opt2') {
        // Exterior Option 2: 2 corner studs + 1 flat inner drywall backer on through-wall; 1 abutting end stud on abutting wall
        const extent = through ? (2 * sw + backWidth + sw) : (2 * sw);
        const left = atStart ? edge : edge - extent, right = atStart ? edge + extent : edge;
        if (right - left <= run.end - run.start) {
          reserved.push([left, right]);
          if (through) {
            const x0 = atStart ? edge : edge - 2 * sw;
            const m1 = add(j.type, x0, x0 + sw, bottom, top, c.studDepth);
            const m2 = add(j.type, x0 + sw, x0 + 2 * sw, bottom, top, c.studDepth);
            if (m1) m1.role = 'Corner outside end stud';
            if (m2) m2.role = 'Corner outside end stud';
            const xBack0 = atStart ? edge + 2 * sw : edge - 2 * sw - backWidth;
            const xBack1 = atStart ? edge + 2 * sw + backWidth : edge - 2 * sw;
            const mBack = add('Corner backing stud', xBack0, xBack1, bottom, top, backDepth, innerFaceOffset);
            if (mBack) {
              mBack.section = `${sw} × ${c.studDepth}`;
              mBack.role = 'Corner drywall backing stud';
            }
          } else {
            const xEnd = atStart ? edge : edge - sw;
            const mEnd = add(j.type, xEnd, xEnd + sw, bottom, top, c.studDepth);
            if (mEnd) mEnd.role = 'Corner abutting end stud';
          }
        }
      } else if (cDetail === 'ext_opt3') {
        // Exterior Option 3: 1 corner stud + 2 flat face studs forming U-channel on through-wall; 1 abutting end stud on abutting wall
        const extent = through ? (sw + backWidth + sw) : (2 * sw);
        const left = atStart ? edge : edge - extent, right = atStart ? edge + extent : edge;
        if (right - left <= run.end - run.start) {
          reserved.push([left, right]);
          const xEnd = atStart ? edge : edge - sw;
          const mEnd = add(j.type, xEnd, xEnd + sw, bottom, top, c.studDepth);
          if (mEnd) mEnd.role = through ? 'Corner outside end stud' : 'Corner abutting end stud';
          if (through) {
            const xBack0 = atStart ? edge + sw : edge - sw - backWidth;
            const xBack1 = atStart ? edge + sw + backWidth : edge - sw;
            const mBackIn = add('Corner backing stud', xBack0, xBack1, bottom, top, backDepth, innerFaceOffset);
            if (mBackIn) {
              mBackIn.section = `${sw} × ${c.studDepth}`;
              mBackIn.role = 'Corner drywall backing stud';
            }
            const mBackOut = add('Corner backing stud', xBack0, xBack1, bottom, top, backDepth, outerFaceOffset);
            if (mBackOut) {
              mBackOut.section = `${sw} × ${c.studDepth}`;
              mBackOut.role = 'Corner exterior backing stud';
            }
          }
        }
      } else if (cDetail === 'ext_opt4') {
        // Exterior Option 4: 4 stacked vertical studs on through-wall + 1 abutting end stud on abutting wall
        const count = through ? 4 : 1;
        const extent = (count + 1) * sw;
        const left = atStart ? edge : edge - extent, right = atStart ? edge + extent : edge;
        if (right - left <= run.end - run.start) {
          reserved.push([left, right]);
          for (let i = 0; i < count; i++) {
            const x = atStart ? edge + i * sw : edge - (i + 1) * sw;
            const m = add(j.type, x, x + sw, bottom, top, c.studDepth);
            if (m) m.role = through ? 'Corner outside end stud' : 'Corner abutting end stud';
          }
        }
      } else if (cDetail === 'ext_opt5') {
        // Exterior Option 5: 1 outer corner stud + 1 flat inner backer + 1 flanking vertical stud on through-wall; 1 abutting end stud on abutting wall
        const extent = through ? (2 * sw + backWidth + sw) : (2 * sw);
        const left = atStart ? edge : edge - extent, right = atStart ? edge + extent : edge;
        if (right - left <= run.end - run.start) {
          reserved.push([left, right]);
          const xEnd = atStart ? edge : edge - sw;
          const mEnd = add(j.type, xEnd, xEnd + sw, bottom, top, c.studDepth);
          if (mEnd) mEnd.role = through ? 'Corner outside end stud' : 'Corner abutting end stud';
          if (through) {
            const xBack0 = atStart ? edge + sw : edge - sw - backWidth;
            const xBack1 = atStart ? edge + sw + backWidth : edge - sw;
            const mBack = add('Corner backing stud', xBack0, xBack1, bottom, top, backDepth, innerFaceOffset);
            if (mBack) {
              mBack.section = `${sw} × ${c.studDepth}`;
              mBack.role = 'Corner drywall backing stud';
            }
            const xFlank0 = atStart ? edge + sw + backWidth : edge - 2 * sw - backWidth;
            const xFlank1 = atStart ? edge + 2 * sw + backWidth : edge - sw - backWidth;
            const mFlank = add(j.type, xFlank0, xFlank1, bottom, top, c.studDepth);
            if (mFlank) mFlank.role = 'Corner flanking stud';
          }
        }
      } else {
        // Interior Option 5 (int_opt5): Partition L-Corner - 1 corner stud + 1 flat inner backer on through-wall; 1 abutting end stud on abutting wall
        const extent = through ? (sw + backWidth + sw) : (2 * sw);
        const left = atStart ? edge : edge - extent, right = atStart ? edge + extent : edge;
        if (right - left <= run.end - run.start) {
          reserved.push([left, right]);
          const xEnd = atStart ? edge : edge - sw;
          const mEnd = add(j.type, xEnd, xEnd + sw, bottom, top, c.studDepth);
          if (mEnd) mEnd.role = through ? 'Corner outside end stud' : 'Corner abutting end stud';
          if (through) {
            const xBack0 = atStart ? edge + sw : edge - sw - backWidth;
            const xBack1 = atStart ? edge + sw + backWidth : edge - sw;
            const mBack = add('Corner backing stud', xBack0, xBack1, bottom, top, backDepth, innerFaceOffset);
            if (mBack) {
              mBack.section = `${sw} × ${c.studDepth}`;
              mBack.role = 'Corner drywall backing stud';
            }
          }
        }
      }
    }else{
      const center=Math.max(run.start+1.5*sw,Math.min(run.end-1.5*sw,j.x));
      if(openings.some(o=>center+1.5*sw>o.left-2*sw&&center-1.5*sw<o.right+2*sw))continue;
      reserved.push([center-2.5*sw,center+2.5*sw]);
      for(let i=-1;i<=1;i++)add(j.type,center+i*sw-sw/2,center+i*sw+sw/2,bottom,top);
    }
  }
  const positions = generateJunctionAwareStudPositions(run.start, run.end, c.spacing, sw, reserved, w, junctions, usableOpenings);
  for (const pos of positions) {
    const m = add('Common stud', pos.x - sw / 2, pos.x + sw / 2, bottom, top);
    if (m && pos.shifted) {
      m.shifted = true;
      m.originalX0 = Math.round(pos.originalX - sw / 2);
      m.shiftOffset = pos.offset;
      m.collisionTarget = 'Junction / Reserved Zone';
    }
  }
  const extraStuds = Array.isArray(w.framing?.extraStuds) ? w.framing.extraStuds : [];
  for (const ex of extraStuds) {
    if (!ex || !Number.isFinite(ex.x0)) continue;
    const exW = Number(ex.studWidth) || sw;
    const exD = Number(ex.studDepth) || c.studDepth;
    const safeW = Math.abs(exW - exD) < 2 ? 38 : Math.min(exW, exD);
    const safeD = Math.abs(exW - exD) < 2 ? Math.max(89, exD) : Math.max(exW, exD);
    const isFlat = ex.orientation === 'flat';
    const spanX = isFlat ? safeD : safeW;
    const depthY = isFlat ? safeW : safeD;
    const lat = Number.isFinite(ex.lateralOffset) ? ex.lateralOffset : (isFlat ? (c.studDepth - safeW) / 2 : 0);
    const clampedX0 = Math.max(minPanelX, Math.min(maxPanelX - spanX, Number(ex.x0)));
    const mEx = add('Extra stud', clampedX0, clampedX0 + spanX, ex.z0 ?? bottom, ex.z1 ?? top, depthY, lat);
    if (mEx) {
      mEx.isExtraStud = true;
      mEx.customMoved = true;
      mEx.extraStudId = ex.id;
      mEx.role = ex.role || 'Extra stud';
      mEx.orientation = isFlat ? 'flat' : 'vertical';
      if (ex.locked) mEx.locked = true;
      if (ex.isGableStud || (Number.isFinite(ex.bevelZ0) && Number.isFinite(ex.bevelZ1))) {
        mEx.isGableStud = true;
        if (Number.isFinite(ex.bevelZ0)) mEx.bevelZ0 = ex.bevelZ0;
        if (Number.isFinite(ex.bevelZ1)) mEx.bevelZ1 = ex.bevelZ1;
        if (Number.isFinite(ex.bevelZPeak)) mEx.bevelZPeak = ex.bevelZPeak;
        if (Number.isFinite(ex.bevelPeakX)) mEx.bevelPeakX = ex.bevelPeakX;
        if (Number.isFinite(ex.bevelAngleDeg)) mEx.bevelAngleDeg = ex.bevelAngleDeg;
      }
      if (ex.timberGrade) mEx.timberGrade = ex.timberGrade;
      if (ex.framingMaterial) mEx.framingMaterial = ex.framingMaterial;
    }
  }
  adjustStudGapsAndAttachSideBySide(members, add, sw, bottom, top, run, usableOpenings);
  applyBeamAdjustments(w,c,h,members,add,mModel,usableOpenings,issues,len);
  if(c.blockingSpacing>0&&w.blocking!==false)addHorizontalBlocking(w,c,members,add,usableOpenings,bottom,top);
  // Generate Gable / Raked Wall Under Roof framing (graduated Gable studs & sloped Rake plates)
  const gableProfile = typeof computeWallRoofGableProfile === 'function' ? computeWallRoofGableProfile(w, mModel) : null;
  if (gableProfile && gableProfile.peakRise > 45) {
    const pThk = c.plateThickness || 38;
    const platePlyCount = c.topPlates || 2;
    const vtRun = veryTopPlateRun(w, mModel);
    const gStart = Math.min(run.start, vtRun.start);
    const gEnd = Math.max(run.end, vtRun.end);
    const baseH = gableProfile.eaveHeight || h;

    // Canonicalize segment breakpoints to clean start, peak, end (prevents overlapping/crossing rake plates)
    const peakX = Number.isFinite(gableProfile.peakX) ? gableProfile.peakX : len / 2;
    const peakRise = Number.isFinite(gableProfile.peakRise) ? gableProfile.peakRise : gableProfile.riseAt(peakX);
    const leftRise = Math.max(0, sampleRiseExt(gStart));
    const rightRise = Math.max(0, sampleRiseExt(gEnd));

    const segPts = [{ x: gStart, rise: leftRise }];
    if (peakX > gStart + 5 && peakX < gEnd - 5 && peakRise > 20) {
      segPts.push({ x: peakX, rise: Math.max(leftRise, Math.max(rightRise, peakRise)) });
    }
    segPts.push({ x: gEnd, rise: rightRise });

    const rakeSegments = [];
    const buildRakeXZPolygon = (x0, x1, top0, top1, vThk) => {
      // Exact intersection of sloped band [top(x) - vThk, top(x)] with [baseH, +inf)
      const dx = x1 - x0;
      if (dx < 1) return null;
      const b0 = top0 - vThk;
      const b1 = top1 - vThk;
      const poly = [];
      const pushPt = (x, z) => {
        if (!poly.length || Math.hypot(poly[poly.length - 1].x - x, poly[poly.length - 1].z - z) > 0.5) {
          poly.push({ x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10 });
        }
      };
      if (b0 >= baseH - 0.5 && b1 >= baseH - 0.5) {
        pushPt(x0, b0);
        pushPt(x1, b1);
        pushPt(x1, top1);
        pushPt(x0, top0);
      } else if (b0 < baseH && b1 > baseH && top1 > top0 + 0.5) {
        const tKnee = (baseH - b0) / (b1 - b0);
        const xKnee = x0 + dx * Math.max(0, Math.min(1, tKnee));
        pushPt(x0, Math.max(baseH, b0));
        pushPt(xKnee, baseH);
        pushPt(x1, b1);
        pushPt(x1, top1);
        if (top0 > baseH + 1) pushPt(x0, top0);
      } else if (b0 > baseH && b1 < baseH && top0 > top1 + 0.5) {
        const tKnee = (baseH - b0) / (b1 - b0);
        const xKnee = x0 + dx * Math.max(0, Math.min(1, tKnee));
        pushPt(x0, b0);
        pushPt(xKnee, baseH);
        pushPt(x1, Math.max(baseH, b1));
        if (top1 > baseH + 1) pushPt(x1, top1);
        pushPt(x0, top0);
      } else {
        pushPt(x0, baseH);
        pushPt(x1, baseH);
        if (top1 > baseH + 1) pushPt(x1, top1);
        if (top0 > baseH + 1) pushPt(x0, top0);
      }
      return poly.length >= 3 ? poly : null;
    };

    for (let i = 0; i + 1 < segPts.length; i++) {
      const a = segPts[i], b = segPts[i + 1];
      const segDx = b.x - a.x;
      if (segDx < sw) continue;
      if (a.rise <= 5 && b.rise <= 5) continue;
      const segRiseDiff = b.rise - a.rise;
      const segSlope = Math.abs(segRiseDiff) / segDx;
      const segCos = Math.cos(Math.atan(segSlope)) || 0.9;
      const segRakeVertThk = Math.round((pThk * platePlyCount) / Math.max(0.35, segCos));
      const top0 = Math.round(baseH + a.rise);
      const top1 = Math.round(baseH + b.rise);
      const bot0 = Math.round(Math.max(baseH, top0 - segRakeVertThk));
      const bot1 = Math.round(Math.max(baseH, top1 - segRakeVertThk));
      const zMin = Math.min(bot0, bot1, top0, top1);
      const zMax = Math.max(top0, top1);
      if (zMax - zMin < 4) continue;

      rakeSegments.push({ x0: a.x, x1: b.x, top0, top1, vertThk: segRakeVertThk });
      const rp = add('Rake plate', a.x, b.x, zMin, zMax, c.studDepth);
      if (rp) {
        rp.isRakePlate = true;
        rp.isStud = false;
        const slopeDir = segRiseDiff > 5 ? 'Left slope' : (segRiseDiff < -5 ? 'Right slope' : 'Ridge plateau');
        rp.role = segPts.length <= 2 ? 'Mono-slope rake top plate' : `Gable rake top plate (${slopeDir})`;
        rp.slopeZ0 = top0;
        rp.slopeZ1 = top1;
        rp.slopeBotZ0 = bot0;
        rp.slopeBotZ1 = bot1;
        rp.baseH = baseH;
        rp.rakeVertThk = segRakeVertThk;
        rp.profileXZ = buildRakeXZPolygon(a.x, b.x, top0, top1, segRakeVertThk);
        rp.length = Math.round(Math.hypot(segDx, top1 - top0));
        rp.section = `${platePlyCount}-Ply ${pThk} × ${c.studDepth}`;
      }
    }

    // Helper: evaluate exact underside of rake plate at any X along gable
    const rakeUndersideAt = (x) => {
      for (const seg of rakeSegments) {
        if (x >= seg.x0 - 0.5 && x <= seg.x1 + 0.5) {
          const dx = Math.max(1, seg.x1 - seg.x0);
          const t = Math.max(0, Math.min(1, (x - seg.x0) / dx));
          const topAtX = seg.top0 + (seg.top1 - seg.top0) * t;
          return Math.max(baseH, topAtX - seg.vertThk);
        }
      }
      const rTop = baseH + sampleRiseExt(x);
      const fallbackThk = Math.round((pThk * platePlyCount) / Math.max(0.35, Math.cos((gableProfile.pitchDeg * Math.PI) / 180) || 0.9));
      return Math.max(baseH, rTop - fallbackThk);
    };

    // Identify interior ridge peak locations from segPts
    const peakXs = [];
    for (let i = 1; i + 1 < segPts.length; i++) {
      if (segPts[i].rise > 45 && segPts[i].rise >= segPts[i - 1].rise - 2 && segPts[i].rise >= segPts[i + 1].rise - 2) {
        peakXs.push(segPts[i].x);
      }
    }
    if (!peakXs.length && gableProfile.peakRatio > 0.03 && gableProfile.peakRatio < 0.97) {
      const px = Math.max(gStart + sw, Math.min(gEnd - sw, gableProfile.peakX));
      if (px > gStart + sw && px < gEnd - sw) peakXs.push(px);
    }

    // Graduated vertical Gable Studs across the FULL regular O.C. stud grid (including above doors/windows) + ridge peak king stud(s)
    const spacingStep = Math.max(sw * 2, Number(c.spacing) || 400);
    const gridXs = [];
    const gridOrigin = run.start + sw / 2;
    const kStart = Math.ceil((gStart + sw * 0.6 - gridOrigin) / spacingStep);
    const kEnd = Math.floor((gEnd - sw * 0.6 - gridOrigin) / spacingStep);
    for (let k = kStart; k <= kEnd; k++) {
      const gx = gridOrigin + k * spacingStep;
      if (gx - sw / 2 < gStart + sw * 0.25 || gx + sw / 2 > gEnd - sw * 0.25) continue;
      // Omit regular grid stud if a ridge peak king stud will sit within 1.25*sw to avoid ugly side-by-side stud clash
      if (peakXs.some(px => Math.abs(gx - px) < sw * 1.25)) continue;
      gridXs.push(gx);
    }
    const gableStudXs = [...gridXs, ...peakXs]
      .sort((a, b) => a - b)
      .filter((x, i, arr) => i === 0 || x - arr[i - 1] >= sw * 0.95);

    for (const gx of gableStudXs) {
      const gx0 = Math.max(gStart, gx - sw / 2);
      const gx1 = Math.min(gEnd, gx0 + sw);
      if (gx1 - gx0 < sw * 0.6) continue;
      const u0 = Math.round(rakeUndersideAt(gx0));
      const u1 = Math.round(rakeUndersideAt(gx1));
      const straddlePeak = peakXs.find(px => px > gx0 + 1 && px < gx1 - 1);
      const uPeak = straddlePeak !== undefined ? Math.round(rakeUndersideAt(straddlePeak)) : null;
      const maxTopZ = Math.max(u0, u1, uPeak || 0);
      const minTopZ = Math.min(u0, u1);
      if (maxTopZ - baseH < 40 || (maxTopZ - baseH < 65 && minTopZ <= baseH + 10)) continue;
      const gs = add('Gable stud', gx0, gx1, baseH, maxTopZ, c.studDepth);
      if (gs) {
        gs.isGableStud = true;
        const isPeakStud = peakXs.some(px => Math.abs(gx - px) < sw * 0.8);
        gs.role = isPeakStud ? 'Gable king stud (Ridge peak)' : 'Graduated gable stud (Bevel top cut)';
        gs.bevelAngleDeg = gableProfile.pitchDeg;
        gs.bevelZ0 = u0;
        gs.bevelZ1 = u1;
        if (uPeak !== null) {
          gs.bevelZPeak = uPeak;
          gs.bevelPeakX = straddlePeak;
        }
      }
    }

    // Dynamically keep any custom extra studs placed in the gable zone fitted to the rake underside
    for (const mEx of members) {
      if (!mEx || !mEx.isExtraStud || (!mEx.isGableStud && mEx.z0 < baseH - 2)) continue;
      const u0 = Math.round(rakeUndersideAt(mEx.x0));
      const u1 = Math.round(rakeUndersideAt(mEx.x1));
      const straddlePeak = peakXs.find(px => px > mEx.x0 + 1 && px < mEx.x1 - 1);
      const uPeak = straddlePeak !== undefined ? Math.round(rakeUndersideAt(straddlePeak)) : null;
      const maxTopZ = Math.max(u0, u1, uPeak || 0);
      if (maxTopZ > mEx.z0 + 20) {
        mEx.isGableStud = true;
        mEx.bevelAngleDeg = gableProfile.pitchDeg;
        mEx.bevelZ0 = u0;
        mEx.bevelZ1 = u1;
        if (uPeak !== null) {
          mEx.bevelZPeak = uPeak;
          mEx.bevelPeakX = straddlePeak;
        }
        mEx.z1 = Math.min(mEx.z1, maxTopZ);
        mEx.length = Math.max(10, mEx.z1 - mEx.z0);
      }
    }
  }

  for (let idx = members.length - 1; idx >= 0; idx--) {
    const m = members[idx];
    if (!m.isStud) continue;
    const fx0 = Math.round(m.x0), fz0 = Math.round(m.z0);
    const finalKey = `${m.type}:${fx0}:${fz0}`;
    if (isStudDeleted(m.type, fx0, fz0, finalKey) || isStudDeleted(m.type, m.origX0 ?? fx0, m.origZ0 ?? fz0, m.studKey)) {
      members.splice(idx, 1);
      continue;
    }
    const ov = findStudOverride(m.type, m.origX0 ?? fx0, m.origZ0 ?? fz0, m.studKey);
    if (ov && !m.customSize && !m.customMoved && !m.customRotated) {
      const ovW = Number(ov.studWidth) || sw;
      const ovD = Number(ov.studDepth) || c.studDepth;
      const safeW = Math.abs(ovW - ovD) < 2 ? 38 : Math.min(ovW, ovD);
      const safeD = Math.abs(ovW - ovD) < 2 ? Math.max(89, ovD) : Math.max(ovW, ovD);
      const isPerp = m.orientation === 'flat' || (Math.abs(m.depth - sw) <= 2 && Math.abs((m.x1 - m.x0) - c.studDepth) <= 4);
      if (isPerp) {
        m.x1 = m.x0 + safeD;
        m.depth = safeW;
      } else {
        m.x1 = m.x0 + safeW;
        m.depth = safeD;
      }
      m.studWidth = safeW;
      m.studDepth = safeD;
      m.timberGrade = ov.timberGrade || m.timberGrade || c.timberGrade;
      if (ov.framingMaterial) m.framingMaterial = ov.framingMaterial;
      m.section = `${safeW} × ${safeD}`;
      m.customSize = true;
    }
  }
  // Generate manual / automatic Beam Pockets (`w.framing.beamPockets`)
  const beamPockets = Array.isArray(w.framing?.beamPockets) ? w.framing.beamPockets : [];
  for (const bp of beamPockets) {
    const bpW = Math.max(75, Number(bp.widthMm) || 140);
    const bpD = Math.max(90, Number(bp.depthMm) || 220);
    const bpX0 = Math.max(run.start + sw, Math.min(run.end - bpW - sw, (Number(bp.xCenterMm) || len / 2) - bpW / 2));
    const bpX1 = bpX0 + bpW;
    const pocketBottomZ = Math.max(bottom + 400, top - bpD);
    const bpPlate = add('Sill', bpX0 - sw, bpX1 + sw, pocketBottomZ - c.plateThickness, pocketBottomZ);
    if (bpPlate) bpPlate.role = `Beam pocket bearing plate (${bp.id || 'BP'})`;
    const numPack = Math.max(2, Math.ceil(bpW / sw));
    for (let pk = 0; pk < numPack; pk++) {
      const sx0 = bpX0 + pk * sw;
      const sx1 = Math.min(bpX1 + sw, sx0 + sw);
      const sp = add('Jack stud', sx0, sx1, bottom, pocketBottomZ - c.plateThickness);
      if (sp) sp.role = `Beam pocket bearing stud (${bp.id || 'BP'})`;
    }
  }

  // Apply non-rectangular wall profiles (sloped, stepped, parapet)
  if ((w.framing?.wallProfile && w.framing.wallProfile !== 'rectangular') || (Number(w.framing?.parapetHeightMm) > 0)) {
    if (typeof window !== 'undefined' && window.WallJunctionEngine && typeof window.WallJunctionEngine.getWallTopZAtX === 'function') {
      const topPlateAllowance = c.topPlates * c.plateThickness;
      for (const m of members) {
        if (m.isStud && Math.abs(m.z1 - top) <= 5) {
          const midX = (m.x0 + m.x1) / 2;
          m.z1 = window.WallJunctionEngine.getWallTopZAtX(w, midX, h, topPlateAllowance);
          m.length = Math.max(50, m.z1 - m.z0);
        } else if (m.type === 'Top plate') {
          const midX = (m.x0 + m.x1) / 2;
          const newTop = window.WallJunctionEngine.getWallTopZAtX(w, midX, h, 0);
          const pIdx = m.plateIndex || 0;
          m.z0 = newTop - (pIdx + 1) * c.plateThickness;
          m.z1 = newTop - pIdx * c.plateThickness;
        }
      }
    }
  }

  if (w.roofTrim && w.roofTrim.enabled !== false && typeof applyRoofTrimToWallFraming === 'function') {
    applyRoofTrimToWallFraming(w, members, c, mModel);
  }

  if (typeof window !== 'undefined' && window.WallJunctionEngine && typeof window.WallJunctionEngine.generateDoubleStudRow === 'function') {
    const doubleRow = window.WallJunctionEngine.generateDoubleStudRow(w, members, c);
    if (doubleRow && doubleRow.length > 0) {
      members.push(...doubleRow);
    }
  }

  for (const m of members) {
    if (m.type === 'Top plate' && !m.role) {
      m.role = (c.topPlates > 1 && Math.abs(m.z1 - h) <= 2) ? 'Very top plate' : 'Top plate';
    } else if (m.type === 'Bottom plate' && !m.role) {
      m.role = 'Bottom plate';
    }
    const catInfo = getWallMemberCategoryInfo(m);
    m.studCategory = catInfo.category;
    m.studCategoryLabel = catInfo.label;
    m.studColor = catInfo.color;
  }
  return {wallId:w.id,studDepth:c.studDepth,studWidth:c.studWidth,members,issues,gableProfile};
}

var WALL_STUD_CATEGORY_PALETTE = [
  { category: 'common_stud',      label: 'Common Stud',          color: '#22c55e', rgb: [34, 197, 94] },
  { category: 'gable_stud',       label: 'Gable Stud (Under Roof)', color: '#0ea5e9', rgb: [14, 165, 233] },
  { category: 'king_stud',        label: 'King Stud',            color: '#eab308', rgb: [234, 179, 8] },
  { category: 'jack_stud',        label: 'Jack / Trimmer Stud',  color: '#f97316', rgb: [249, 115, 22] },
  { category: 'header_cripple',   label: 'Header Cripple Stud',  color: '#a855f7', rgb: [168, 85, 247] },
  { category: 'sill_cripple',     label: 'Sill Cripple Stud',    color: '#ec4899', rgb: [236, 72, 153] },
  { category: 'corner_stud',      label: 'Corner Pack Stud',     color: '#2563eb', rgb: [37, 99, 235] },
  { category: 'corner_backing',   label: 'Corner Backing Stud',  color: '#06b6d4', rgb: [6, 182, 212] },
  { category: 'junction_stud',    label: 'T-Junction Stud',      color: '#4f46e5', rgb: [79, 70, 229] },
  { category: 'junction_backing', label: 'Junction Backing',     color: '#14b8a6', rgb: [20, 184, 166] },
  { category: 'custom_stud',      label: 'Custom / Break Stud',  color: '#d946ef', rgb: [217, 70, 239] },
  { category: 'collision_stud',   label: 'Colliding Stud',       color: '#dc2626', rgb: [220, 38, 38] },
  { category: 'blocking',         label: 'Horizontal Blocking',  color: '#65a30d', rgb: [101, 163, 13] },
  { category: 'header',           label: 'Header / Lintel',      color: '#0284c7', rgb: [2, 132, 199] },
  { category: 'rake_plate',       label: 'Gable Rake Plate',     color: '#d97706', rgb: [217, 119, 6] },
  { category: 'very_top_plate',   label: 'Very Top Plate',       color: '#d4944e', rgb: [212, 148, 78] },
  { category: 'top_plate',        label: 'Top Plate',            color: '#8c5828', rgb: [140, 88, 40] },
  { category: 'plate',            label: 'Bottom Plate & Sill',  color: '#b07d4f', rgb: [176, 125, 79] }
];

function getWallMemberCategoryInfo(m) {
  if (!m) return WALL_STUD_CATEGORY_PALETTE[0];
  const type = String(m.type || m.memberType || '');
  const role = String(m.role || m.memberRole || '');
  const byCat = cat => WALL_STUD_CATEGORY_PALETTE.find(x => x.category === cat) || WALL_STUD_CATEGORY_PALETTE[0];

  if (m.collision) return byCat('collision_stud');
  if (m.isRakePlate || /^Rake plate$/i.test(type) || /rake.*plate/i.test(role)) return byCat('rake_plate');
  if (m.isGableStud || /^Gable stud$/i.test(type) || /gable.*stud/i.test(role)) return byCat('gable_stud');
  if (/very top plate|cap plate|upper top plate|very-top-plate/i.test(role) || /very top plate|cap plate/i.test(type) || (m.plateIndex === 0 && /^Top plate$/i.test(type))) return byCat('very_top_plate');
  if (/^Top plate$/i.test(type) || /top plate|top-plate/i.test(role)) return byCat('top_plate');
  if (/^(Bottom plate|Sill)$/i.test(type) || /plate|sill$/i.test(type)) return byCat('plate');
  if (/^(Header|Beam|Lintel)$/i.test(type)) return byCat('header');
  if (/^(Block|Blocking|T-junction blocking)$/i.test(type) || /noggin/i.test(type) || role === 'Horizontal backing') return byCat('blocking');
  if (m.customSize || m.isExtraStud || /^Extra stud$|^Break stud$/i.test(type) || /break stud|extra stud/i.test(role)) return byCat('custom_stud');
  if (type === 'Corner backing stud' || /corner.*backing/i.test(type) || /corner.*backing/i.test(role)) return byCat('corner_backing');
  if (type === 'Corner pack' || /corner/i.test(type) || /corner/i.test(role)) return byCat('corner_stud');
  if (type === 'Inside junction backing stud (Full)' || /junction.*backing|perpendicular backing|partial inside backing/i.test(type) || /perpendicular backing|intersection support backing|partial inside backing/i.test(role)) return byCat('junction_backing');
  if (type === 'T-junction studs' || type === 'Cross-junction studs' || /junction/i.test(type) || /junction|return stud/i.test(role)) return byCat('junction_stud');
  if (type === 'King stud' || /king/i.test(type) || /king/i.test(role)) return byCat('king_stud');
  if (type === 'Jack stud' || /jack|trimmer/i.test(type) || /jack|trimmer/i.test(role)) return byCat('jack_stud');
  if (type === 'Header stud' || type === 'Upper cripple' || /header stud|upper cripple|header-cripple/i.test(type) || /header.*cripple|upper.*cripple/i.test(role)) return byCat('header_cripple');
  if (type === 'Lower cripple' || type === 'Sill cripple' || /lower cripple|sill cripple|sill-cripple|sill-jack|cripple/i.test(type) || /lower.*cripple|sill.*cripple/i.test(role)) return byCat('sill_cripple');
  return byCat('common_stud');
}

function isProtectedConnectionStud(m, run, sw) {
  if (!m) return false;
  if (m.isExtraStud || m.type === 'Extra stud' || m.customMoved || m.customRotated) return true;
  if (m.type === 'Corner pack' || m.type === 'Corner backing stud' || m.type === 'T-junction studs' || m.type === 'Inside junction backing stud (Full)' || m.type === 'Cross-junction studs') return true;
  if (/corner|junction|backing|return|flank/i.test(m.type || '') || /corner|junction|backing|return|flank/i.test(m.role || '')) return true;
  if (run && (Math.abs(m.x0 - run.start) < 2 || Math.abs(m.x1 - run.end) < 2)) return true;
  return false;
}

function adjustStudGapsAndAttachSideBySide(members, add, sw, bottom, top, run, openings = []) {
  let changed = true;
  let iterations = 0;

  while (changed && iterations < 8) {
    changed = false;
    iterations++;

    const vertStuds = members.filter(m => 
      !m.customMoved && !m.isExtraStud && m.type !== 'Extra stud' &&
      /stud|king|jack|pack|junction|cripple/i.test(m.type) &&
      !/plate|header|sill|beam|lintel/i.test(m.type) &&
      !/^Block$|^Blocking$/i.test(m.type) &&
      m.role !== 'Horizontal backing' &&
      Number.isFinite(m.x0) && Number.isFinite(m.x1) && (m.x1 - m.x0) > 1 &&
      Number.isFinite(m.z0) && Number.isFinite(m.z1) && (m.z1 - m.z0) > 100
    ).sort((a, b) => a.x0 - b.x0 || a.x1 - b.x1);

    for (let i = 0; i + 1 < vertStuds.length; i++) {
      const s1 = vertStuds[i];
      const s2 = vertStuds[i + 1];

      // Studs on opposite wall faces (e.g. U-channel backing studs in ext_opt3) do not collide
      if (Math.abs((s1.lateralOffset || 0) - (s2.lateralOffset || 0)) > 5) continue;

      const gap = s2.x0 - s1.x1;

      // Do not bridge across opening clear spans
      const overlapsOpening = openings.some(o => s1.x1 < o.right && s2.x0 > o.left);
      if (overlapsOpening) continue;

      const s1Protected = isProtectedConnectionStud(s1, run, sw);
      const s2Protected = isProtectedConnectionStud(s2, run, sw);

      // Handle Partial Overlaps (gap < -1)
      if (gap < -1) {
        if (s2.type === 'Common stud' && !s2Protected) {
          const idx = members.indexOf(s2);
          if (idx >= 0) { members.splice(idx, 1); changed = true; break; }
        } else if (s1.type === 'Common stud' && !s1Protected) {
          const idx = members.indexOf(s1);
          if (idx >= 0) { members.splice(idx, 1); changed = true; break; }
        }
        continue;
      }

      // Never glue a Common stud onto a Corner pack, T-junction pack, or wall end stud (preserves exact Option 1..5 stud counts)
      if (s1Protected || s2Protected) {
        if (gap >= -1 && gap < sw - 2) {
          if (s2.type === 'Common stud' && !s2Protected) {
            const idx = members.indexOf(s2);
            if (idx >= 0) { members.splice(idx, 1); changed = true; break; }
          } else if (s1.type === 'Common stud' && !s1Protected) {
            const idx = members.indexOf(s1);
            if (idx >= 0) { members.splice(idx, 1); changed = true; break; }
          }
        }
        continue;
      }

      // Handle Micro-Gaps next to Opening King studs (0 <= gap < sw * 0.85)
      if (gap >= -1 && gap < sw * 0.85 && (s1.type === 'King stud' || s2.type === 'King stud')) {
        if (s2.type === 'Common stud') {
          const width = s2.x1 - s2.x0;
          s2.x0 = Math.round(s1.x1);
          s2.x1 = Math.round(s1.x1 + width);
          s2.length = s2.x1 - s2.x0;
          s2.shifted = true;
          changed = true;
          break;
        } else if (s1.type === 'Common stud') {
          const width = s1.x1 - s1.x0;
          s1.x1 = Math.round(s2.x0);
          s1.x0 = Math.round(s2.x0 - width);
          s1.length = s1.x1 - s1.x0;
          s1.shifted = true;
          changed = true;
          break;
        }
      }
    }
  }
}

function auditWallStudCollisions(w, customModel){
  if(!w||w.type!=='wall')return [];
  const mModel=customModel||(typeof model!=='undefined'?model:(typeof window!=='undefined'?window.model:null));
  const c=construction(w);
  if(!c.enabled)return [];
  const layout=generateWallFraming(w,mModel);
  const studs=(layout.members||[]).filter(m=>m.isStud&&Number.isFinite(m.x0)&&Number.isFinite(m.x1)).sort((a,b)=>a.x0-b.x0);
  const collisions=[];
  const isFixed=!!(w.framing&&w.framing.collisionsFixed);

  for(let i=0; i+1<studs.length; i++){
    const s1=studs[i], s2=studs[i+1];
    if(Math.abs((s1.lateralOffset||0)-(s2.lateralOffset||0))>5)continue;
    const overlap = Math.min(s1.x1, s2.x1) - Math.max(s1.x0, s2.x0);
    if(overlap > 1){
      collisions.push({
        wallId:w.id,
        originalX0:Math.round(s2.x0),
        originalX1:Math.round(s2.x1),
        shiftedX0:Math.round(s1.x1),
        shiftedX1:Math.round(s1.x1 + (s2.x1 - s2.x0)),
        shiftDelta:Math.round(s1.x1 - s2.x0),
        collisionType:s1.type,
        targetId:s1.id,
        targetDetail:`Overlap between ${s1.type} and ${s2.type} (${Math.round(overlap)} mm)`,
        fixed:isFixed
      });
    }
  }
  return collisions;
}

function auditAllStudCollisions(customModel){
  const mModel=customModel||(typeof model!=='undefined'?model:(typeof window!=='undefined'?window.model:null));
  const walls=(mModel?.elements||[]).filter(e=>e.type==='wall'&&construction(e).enabled);
  const all=[];
  for(const w of walls){
    all.push(...auditWallStudCollisions(w,mModel));
  }
  return {
    walls,
    collisions:all,
    activeCollisions:all.filter(c=>!c.fixed),
    fixedCollisions:all.filter(c=>c.fixed)
  };
}

function autoShiftCollidingStuds(customModel, targetWallId) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  if (!mModel || !Array.isArray(mModel.elements)) return { fixedCount: 0, shiftedStudCount: 0, wallCount: 0, details: [] };

  const walls = mModel.elements.filter(e => e && e.type === 'wall' && (!targetWallId || e.id === targetWallId) && construction(e).enabled);
  let totalShifted = 0;
  let totalFixed = 0;
  const details = [];

  for (const w of walls) {
    const c = construction(w);
    const sw = c.studWidth || 38;
    const len = distance(w.a, w.b) || 1;
    const run = framingRun(w, mModel);
    const junctions = wallFramingJunctions(w, mModel);
    const rawHosted = (w.openings && Array.isArray(w.openings) && w.openings.length)
      ? w.openings
      : (typeof hosted === 'function' ? hosted(w) : (mModel?.elements || []).filter(e => e && e.host === w.id));
    const openings = rawHosted.map(o => {
      const off = Number.isFinite(o.offset) ? o.offset : (Number.isFinite(o.startDist) ? o.startDist + (o.width || 0) / 2 : NaN);
      return { ...o, offset: off, left: off - (o.width || 0) / 2, right: off + (o.width || 0) / 2 };
    }).filter(o => Number.isFinite(o.left) && o.width > 0);

    // Compute reserved framing clearance zones from openings and junctions
    const reserved = [];
    for (const o of openings) {
      reserved.push([Math.max(0, o.left - sw * 2), Math.min(len, o.right + sw * 2)]);
    }

    for (const j of junctions) {
      const other = mModel.elements.find(e => e.id === j.otherId);
      const ocDepth = other ? construction(other).studDepth : c.studDepth;
      const cornerZoneDepth = Math.max(c.studDepth + sw + 15, ocDepth + sw + 15);

      if (j.type === 'Corner pack') {
        const atStart = j.x < len / 2;
        if (atStart) {
          reserved.push([0, Math.min(len, cornerZoneDepth)]);
        } else {
          reserved.push([Math.max(0, len - cornerZoneDepth), len]);
        }
      } else if (j.type === 'T-junction studs' || j.type === 'Cross-junction studs') {
        const center = other ? insideJunctionCenter(w, other, j.branchEnd) : j.x;
        const half = ocDepth / 2 + sw + 10;
        reserved.push([Math.max(0, center - half), Math.min(len, center + half)]);
      }
    }

    // Evaluate current framing members and identify studs colliding with reserved zones or other studs
    const layout = generateWallFraming(w, mModel);
    const studs = (layout.members || []).filter(m => m.isStud && Number.isFinite(m.x0) && Number.isFinite(m.x1)).sort((a, b) => a.x0 - b.x0);
    let wallShiftedCount = 0;

    for (const s of studs) {
      if (!s.type || s.type !== 'Common stud') continue;
      const midX = (s.x0 + s.x1) / 2;
      const inReserved = reserved.some(([a, b]) => midX > a + 1 && midX < b - 1);
      const collidingOther = studs.some(o => o.id !== s.id && Math.abs((o.lateralOffset || 0) - (s.lateralOffset || 0)) <= 5 && Math.min(s.x1, o.x1) - Math.max(s.x0, o.x0) > 1);

      if (inReserved || collidingOther) {
        wallShiftedCount++;
        details.push(`${w.id}: Resolved overlapping stud ${s.id} at ${Math.round(midX)} mm.`);
      }
    }

    // Persist collision-fixed flag and regenerate clean wall framing while keeping user/default option 1..5
    const curC = construction(w);
    w.framing = {
      ...curC,
      cornerDetail: resolveCornerDetail(w, null),
      insideJunctionDetail: resolveJunctionDetail(w, null),
      collisionsFixed: true,
      junctionBackingFixed: true,
      highlightCollisions: false,
      autoShiftedAt: Date.now()
    };
    generateWallFraming(w, mModel);

    totalShifted += wallShiftedCount;
    totalFixed++;
  }

  return {
    fixedCount: totalFixed,
    shiftedStudCount: totalShifted,
    wallCount: walls.length,
    details
  };
}

function fixWallStudCollisions(customModel, targetWallId){
  const res = autoShiftCollidingStuds(customModel, targetWallId);
  return res.shiftedStudCount || res.fixedCount;
}
function validateJunctionBackingAndCornerPacks(w, layout, customModel) {
  if (!w || w.type !== 'wall') return [];
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const members = layout?.members || [];
  const issues = [];
  const c = construction(w);
  const junctions = wallFramingJunctions(w, mModel);
  const run = framingRun(w, mModel);

  for (const j of junctions.filter(x => x.type === 'Corner pack')) {
    const other = (mModel?.elements || []).find(e => e.id === j.otherId);
    const through = isCornerThroughWall(w, other);
    const cDetail = resolveCornerDetail(w, other);

    if (through) {
      const atStart = j.x < 10;
      const extent = Math.max(c.studDepth + 2 * c.studWidth + 30, 4 * c.studWidth + 30);
      const cornerMembers = members.filter(m => {
        const mx = (m.x0 + m.x1) / 2;
        return atStart ? mx <= run.start + extent : mx >= run.end - extent;
      });
      const backingStuds = cornerMembers.filter(m => m.type === 'Corner backing stud' || /backing/i.test(m.type) || /backing/i.test(m.role || ''));

      if (cDetail === 'ext_opt3') {
        if (backingStuds.length < 2) {
          issues.push(`Corner junction ${w.id} → ${j.otherId} (California Corner / 3-Stud U-Channel) at ${Math.round(j.x)} mm: expected 2 backing studs forming U-channel, found ${backingStuds.length}.`);
        }
      } else if (['ext_opt1', 'ext_opt2', 'ext_opt5', 'int_opt5'].includes(cDetail)) {
        if (backingStuds.length < 1) {
          issues.push(`Corner junction ${w.id} → ${j.otherId} (${cornerDetailLabel(cDetail)}) at ${Math.round(j.x)} mm: missing required drywall backing stud.`);
        }
      } else if (cDetail === 'ext_opt4') {
        const endStuds = cornerMembers.filter(m => m.type === 'Corner pack' || /end stud/i.test(m.role || ''));
        if (endStuds.length < 4) {
          issues.push(`Corner junction ${w.id} → ${j.otherId} (Option 4 Solid Stacked Post) at ${Math.round(j.x)} mm: expected 4 stacked studs, found ${endStuds.length}.`);
        }
      }
    }
  }
  return issues;
}

function fixWallJunctionBackingStuds(customModel, targetWallId) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const walls = (mModel?.elements || []).filter(e => e.type === 'wall' && (!targetWallId || e.id === targetWallId));
  let fixedCount = 0;
  for (const w of walls) {
    const layout = generateWallFraming(w, mModel);
    const issues = validateJunctionBackingAndCornerPacks(w, layout, mModel);
    if (issues.length > 0) {
      w.framing = { ...construction(w), junctionBackingFixed: true, collisionsFixed: true, highlightCollisions: false };
      fixedCount += issues.length;
    }
  }
  return fixedCount;
}

function autoFixAllOverlappingStuds(customModel) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  if (!mModel) return { fixedCount: 0, wallCount: 0 };

  // 1. Ensure all wall junctions use one of the 10 standard options (preserving ext_opt1 / int_opt1 defaults or user selections)
  if (typeof autoConfigureWallJunctionStudPacks === 'function') {
    autoConfigureWallJunctionStudPacks(mModel, false);
  }

  // 2. Perform dynamic stud shifting, replacement, and relocation across all walls
  const fixedCollisions = fixWallStudCollisions(mModel);

  // 3. Verify required backing studs for the selected option (ext_opt1..ext_opt5, int_opt1..int_opt5)
  const fixedBacking = fixWallJunctionBackingStuds(mModel);

  // 4. Mark all walls as collision fixed and regenerate final clean framing
  const walls = (mModel?.elements || []).filter(e => e.type === 'wall' && construction(e).enabled);
  for (const w of walls) {
    const curC = construction(w);
    w.framing = {
      ...curC,
      cornerDetail: resolveCornerDetail(w, null),
      insideJunctionDetail: resolveJunctionDetail(w, null),
      collisionsFixed: true,
      junctionBackingFixed: true,
      highlightCollisions: false
    };
    generateWallFraming(w, mModel);
  }

  return {
    fixedCount: fixedCollisions + fixedBacking,
    shiftedStudCount: fixedCollisions,
    wallCount: walls.length
  };
}

function auditWallJunctionConnections(w,layout,customModel){
  if(!w||w.type!=='wall')return [];
  const mModel=customModel||(typeof model!=='undefined'?model:(typeof window!=='undefined'?window.model:null)),members=layout?.members||[],issues=[],c=construction(w),mode=c.insideJunctionDetail;
  for(const j of wallFramingJunctions(w,mModel).filter(j=>j.type==='T-junction studs')){
    const other=(mModel?.elements||[]).find(e=>e.id===j.otherId),center=other?insideJunctionCenter(w,other,j.branchEnd):j.x,
          key=insideJunctionKey(w,j.otherId,center),parts=members.filter(m=>m.junctionId===key),
          returns=parts.filter(m=>m.role==='T-junction return stud'),
          backing=parts.filter(m=>['Horizontal backing','Perpendicular backing stud','Wall intersection support backing stud','Partial inside backing stud'].includes(m.role) || m.type==='Inside junction backing stud (Full)');
    const h=w.height||(typeof heightOf==='function'?heightOf(w):3048),bottom=c.bottomPlates*c.plateThickness,top=h-c.topPlates*c.plateThickness,
          expectedHalf=(other?construction(other).studDepth:0)/2+c.studWidth,
          intruding=members.filter(m=>m.type==='Common stud'&&m.x1>center-expectedHalf+1&&m.x0<center+expectedHalf-1);
    const resolvedMode = resolveJunctionDetail(w, other);
    const expectedReturnCount = (resolvedMode === 'int_opt1' || resolvedMode === 'int_opt4' || resolvedMode === 'int_opt5') ? 1 : (resolvedMode === 'int_opt3' ? 3 : 2);
    if(returns.length !== expectedReturnCount && resolvedMode !== 'auto')issues.push(`Internal wall junction ${w.id} → ${j.otherId} at ${Math.round(j.x)} mm: expected ${expectedReturnCount} junction stud(s) for ${insideJunctionLabel(resolvedMode)}, found ${returns.length}.`);
    else if(returns.some(m=>Math.abs(m.z0-bottom)>1||m.z1<top-1))issues.push(`Internal wall junction ${w.id} → ${j.otherId} at ${Math.round(j.x)} mm: return studs do not continue between the plate zones.`);
    if(intruding.length)issues.push(`Internal wall junction ${w.id} → ${j.otherId} at ${Math.round(j.x)} mm: ${intruding.length} ordinary stud(s) intrude into the reserved connection zone.`);
    if(mode==='insideBlocking'&&!backing.some(m=>m.role==='Horizontal backing'&&m.z1>bottom&&m.z0<top))issues.push(`Internal wall junction ${w.id} → ${j.otherId} at ${Math.round(j.x)} mm: blocking detail is missing.`);
    if(mode==='insideStudFull'&&!backing.some(m=>['Perpendicular backing stud','Wall intersection support backing stud'].includes(m.role)&&Math.abs(m.z0-bottom)<1&&m.z1>=top-1)&&!backing.some(m=>m.type==='Inside junction backing stud (Full)'&&Math.abs(m.z0-bottom)<1&&m.z1>=top-1))issues.push(`Internal wall junction ${w.id} → ${j.otherId} at ${Math.round(j.x)} mm: full-height backing stud is missing or incomplete.`);
    if(mode==='insideStudPartial'){
      const partial=backing.find(m=>m.role==='Partial inside backing stud'&&Math.abs(m.z0-bottom)<1&&m.z1>=top-1);
      if(!partial)issues.push(`Internal wall junction ${w.id} → ${j.otherId} at ${Math.round(j.x)} mm: partial-detail backing stud is missing or incomplete.`);
      else if(Math.abs((partial.x0+partial.x1)/2-center)<1)issues.push(`Internal wall junction ${w.id} → ${j.otherId} at ${Math.round(j.x)} mm: partial backing stud is not offset from the full-detail position.`);
    }
  }

  // Include corner backing & pack validation checks
  issues.push(...validateJunctionBackingAndCornerPacks(w, layout, mModel));

  return [...new Set(issues)];
}
function auditAllWallJunctions(customModel){
  const mModel=customModel||(typeof model!=='undefined'?model:(typeof window!=='undefined'?window.model:null)),walls=(mModel?.elements||[]).filter(e=>e.type==='wall'&&construction(e).enabled),connections=[],issues=[];
  for(const w of walls){
    const layout=generateWallFraming(w,mModel),junctions=wallFramingJunctions(w,mModel);
    const tChecks=auditWallJunctionConnections(w,layout,mModel);
    for(const j of junctions.filter(x=>x.type==='T-junction studs')){
      const jointIssues=tChecks.filter(msg=>msg.includes(`→ ${j.otherId} at ${Math.round(j.x)} mm`));
      connections.push({wallId:w.id,otherWallId:j.otherId,offsetMm:Math.round(j.x),detail:insideJunctionLabel(construction(w).insideJunctionDetail),status:jointIssues.length?'REVIEW':'OK',issues:jointIssues});
      issues.push(...jointIssues);
    }
    for(const j of junctions.filter(x=>x.type==='Corner pack')){
      const jointIssues=tChecks.filter(msg=>msg.includes(`Corner junction ${w.id} → ${j.otherId}`));
      connections.push({wallId:w.id,otherWallId:j.otherId,offsetMm:Math.round(j.x),detail:cornerDetailLabel(resolveCornerDetail(w, (mModel?.elements||[]).find(e=>e.id===j.otherId))),status:jointIssues.length?'REVIEW':'OK',issues:jointIssues});
      issues.push(...jointIssues);
    }
    for(const j of junctions.filter(x=>x.type==='Cross-junction studs')){
      const hasXPack = layout.members.some(m => m.connectionDetail === 'x_4way_pack' || (m.type === 'Cross-junction studs' && Math.abs((m.x0 + m.x1) / 2 - j.x) < 250));
      const msg = hasXPack ? [] : [`Four-way wall crossing on ${w.id} with ${j.otherId} at ${Math.round(j.x)} mm: verify the cross-junction detail.`];
      connections.push({wallId:w.id,otherWallId:j.otherId,offsetMm:Math.round(j.x),detail:'4-Way X-Junction Pack (Flanking + Dual Face Backers)',status:hasXPack?'OK':'REVIEW',issues:msg});
      issues.push(...msg);
    }
  }
  return {wallCount:walls.length,junctionCount:connections.length,okCount:connections.filter(c=>c.status==='OK').length,reviewCount:connections.filter(c=>c.status!=='OK').length,connections,issues:[...new Set(issues)]};
}

function auditWallFraming(w, customModel){
  const mModel=customModel||(typeof model!=='undefined'?model:(typeof window!=='undefined'?window.model:null)),layout=generateWallFraming(w,mModel),members=layout.members,issues=[...layout.issues],tol=1,c=construction(w),sw=construction(w).studWidth;
  const openings=(typeof hosted==='function'?hosted(w):(mModel?.elements||[]).filter(e=>['window','door'].includes(e.type)&&e.host===w.id)).filter(o=>o.host===w.id);
  const run=framingRun(w,mModel),vtRun=veryTopPlateRun(w,mModel),len=distance(w.a,w.b);
  const minX=Math.min(0,run.start,vtRun.start)-tol,maxX=Math.max(len,run.end,vtRun.end)+tol;
  for(const m of members){if(!Number.isFinite(m.x0)||!Number.isFinite(m.x1)||!Number.isFinite(m.z0)||!Number.isFinite(m.z1)||m.x1-m.x0<tol||m.z1-m.z0<tol)issues.push(`${m.id}: invalid member extents.`);if(m.x0 < minX||m.x1>maxX)issues.push(`${m.id}: member extends beyond the wall framing run.`)}
  const byOpening=new Map();for(const o of openings)byOpening.set(o.id,members.filter(m=>['King stud','Jack stud','Header','Sill','Header stud','Upper cripple','Lower cripple'].includes(m.type)&&Math.abs((m.x0+m.x1)/2-o.offset)<o.width/2+4*construction(w).studWidth));
  for(const o of openings){const ms=byOpening.get(o.id)||[];if(o.width>0&&o.height>0&&!ms.some(m=>m.type==='Header'))issues.push(`${o.id}: no valid header generated; check header clearance, overlap and opening location.`);if(o.width>0&&o.height>0&&(!ms.some(m=>m.type==='King stud')||!ms.some(m=>m.type==='Jack stud')))issues.push(`${o.id}: king/jack support studs are incomplete.`);const hs=ms.filter(m=>m.type==='Header');for(const h of hs){if(h.x0>o.left-sw+tol||h.x1<o.right+sw-tol)issues.push(`${o.id}: header does not extend at least one stud width beyond the opening on both ends.`)}}
  issues.push(...auditWallJunctionConnections(w,layout,mModel));
  return {wallId:w.id,memberCount:members.length,issues:[...new Set(issues)],valid:issues.length===0};
}
function findStudById(studId, customModel) {
  if (!studId || typeof studId !== 'string' || !studId.includes(':STUD:')) return null;
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  if (!mModel || !Array.isArray(mModel.elements)) return null;
  const wallId = studId.split(':STUD:')[0];
  const walls = mModel.elements.filter(e => e.type === 'wall' && (!wallId || e.id === wallId));
  for (const w of walls) {
    const layout = generateWallFraming(w, mModel);
    const hit = layout.members.find(m => m.id === studId || m.studKey === studId);
    if (hit) {
      return { wall: w, member: hit, studKey: hit.studKey || `${hit.type}:${Math.round(hit.x0)}:${Math.round(hit.z0)}` };
    }
    const parts = studId.split(':');
    const targetX0 = Number(parts[3]);
    const targetZ0 = Number(parts[4]);
    if (Number.isFinite(targetX0)) {
      const approx = layout.members.find(m => m.isStud && Math.abs(Math.round(m.x0) - targetX0) <= 6 && (!Number.isFinite(targetZ0) || Math.abs(Math.round(m.z0) - targetZ0) <= 6));
      if (approx) {
        return { wall: w, member: approx, studKey: approx.studKey || `${approx.type}:${Math.round(approx.x0)}:${Math.round(approx.z0)}` };
      }
    }
  }
  return null;
}

function updateStudSize(studId, options = {}, customModel) {
  const found = findStudById(studId, customModel);
  if (!found) return null;
  const { wall: w, member: m, studKey } = found;
  const c = construction(w);
  let sw = Number(options.studWidth) || m.studWidth || c.studWidth || 38;
  let sd = Number(options.studDepth) || m.studDepth || c.studDepth || 140;
  let grade = options.timberGrade || m.timberGrade || c.timberGrade || 'C24';
  const framingMaterial = options.framingMaterial || m.framingMaterial || c.studMaterial || 'dimensional';
  if (options.presetId && options.presetId !== 'custom') {
    const p = TIMBER_SIZES_C16_C24.find(x => x.id === options.presetId);
    if (p) {
      sw = p.studWidth;
      sd = p.studDepth;
      grade = p.timberGrade;
    }
  }
  // Strictly enforce rectangular studs (never square)
  if (Math.abs(sw - sd) < 2) {
    sw = 38;
    sd = sd <= 95 ? 89 : 140;
  }
  if (options.applyToWall) {
    w.framing = {
      ...c,
      studWidth: sw,
      studDepth: sd,
      timberGrade: grade,
      studMaterial: framingMaterial,
      plateThickness: sw,
      studOverrides: {}
    };
    if (w.structure !== 'composite') w.thickness = sd;
    return { wall: w, studId: m.id, studWidth: sw, studDepth: sd, timberGrade: grade, framingMaterial, scope: 'wall' };
  }
  const existingOverrides = (w.framing?.studOverrides && typeof w.framing.studOverrides === 'object') ? { ...w.framing.studOverrides } : {};
  const origKey = `${m.type}:${m.origX0 ?? Math.round(m.x0)}:${m.origZ0 ?? Math.round(m.z0)}`;
  const prevOv = existingOverrides[studKey] || existingOverrides[origKey] || {};
  const rec = {
    ...prevOv,
    studKey,
    x0: m.origX0 ?? Math.round(m.x0),
    z0: m.origZ0 ?? Math.round(m.z0),
    type: m.type,
    studWidth: sw,
    studDepth: sd,
    timberGrade: grade
  };
  if (options.framingMaterial) rec.framingMaterial = options.framingMaterial;
  existingOverrides[studKey] = rec;
  existingOverrides[origKey] = rec;

  let extraStuds = Array.isArray(w.framing?.extraStuds) ? w.framing.extraStuds.map(ex => ({ ...ex })) : [];
  if (m.isExtraStud || m.type === 'Extra stud') {
    extraStuds = extraStuds.map(ex => {
      if ((m.extraStudId && ex.id === m.extraStudId) || Math.abs(Math.round(ex.x0) - (m.origX0 ?? Math.round(m.x0))) <= 4) {
        return options.framingMaterial
          ? { ...ex, studWidth: sw, studDepth: sd, timberGrade: grade, framingMaterial: options.framingMaterial }
          : { ...ex, studWidth: sw, studDepth: sd, timberGrade: grade };
      }
      return ex;
    });
  }

  w.framing = {
    ...c,
    studOverrides: existingOverrides,
    extraStuds
  };
  return { wall: w, studId: m.id, studWidth: sw, studDepth: sd, timberGrade: grade, framingMaterial, scope: 'stud' };
}

function moveStudById(studId, options = {}, customModel) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const found = findStudById(studId, mModel);
  if (!found) return null;
  const { wall: w, member: m, studKey } = found;
  const c = construction(w);
  const run = framingRun(w, mModel);
  const len = distance(w.a, w.b) || 0;
  const minPanelX = Math.min(0, run.start);
  const maxPanelX = Math.max(len, run.end);
  const curSpan = Math.max(10, (m.x1 - m.x0) || c.studWidth || 38);
  let nextX0 = m.x0;
  if (Number.isFinite(options.targetX0)) {
    nextX0 = Number(options.targetX0);
  } else if (Number.isFinite(options.deltaX)) {
    nextX0 = m.x0 + Number(options.deltaX);
  }
  nextX0 = Math.round(Math.max(minPanelX, Math.min(maxPanelX - curSpan, nextX0)));

  if (m.isExtraStud || m.type === 'Extra stud') {
    const extraStuds = Array.isArray(w.framing?.extraStuds) ? w.framing.extraStuds.map(ex => ({ ...ex })) : [];
    let matched = false;
    for (const ex of extraStuds) {
      if ((m.extraStudId && ex.id === m.extraStudId) || Math.abs(Math.round(ex.x0) - (m.origX0 ?? Math.round(m.x0))) <= 4) {
        ex.x0 = nextX0;
        matched = true;
        break;
      }
    }
    if (matched) {
      w.framing = { ...c, extraStuds };
      const layout = generateWallFraming(w, mModel);
      const updated = layout.members.find(x => x.isStud && ((m.extraStudId && x.extraStudId === m.extraStudId) || Math.abs(x.x0 - nextX0) <= 2)) || m;
      return { wall: w, member: updated, studId: updated.id, x0: updated.x0, x1: updated.x1 };
    }
  }

  const existingOverrides = (w.framing?.studOverrides && typeof w.framing.studOverrides === 'object') ? { ...w.framing.studOverrides } : {};
  const origX0 = m.origX0 ?? Math.round(m.x0);
  const origZ0 = m.origZ0 ?? Math.round(m.z0);
  const origKey = m.studKey || `${m.type}:${origX0}:${origZ0}`;
  const prevOv = existingOverrides[studKey] || existingOverrides[origKey] || {};
  const rec = {
    ...prevOv,
    studKey: origKey,
    x0: origX0,
    z0: origZ0,
    type: m.type,
    studWidth: m.studWidth || c.studWidth || 38,
    studDepth: m.studDepth || c.studDepth || 140,
    timberGrade: m.timberGrade || c.timberGrade || 'C24',
    targetX0: nextX0,
    offsetX: nextX0 - origX0
  };
  existingOverrides[studKey] = rec;
  existingOverrides[origKey] = rec;
  w.framing = {
    ...c,
    studOverrides: existingOverrides
  };
  const layout = generateWallFraming(w, mModel);
  const updated = layout.members.find(x => x.id === m.id || x.studKey === origKey || (x.isStud && Math.abs(x.x0 - nextX0) <= 2 && x.type === m.type)) || m;
  return { wall: w, member: updated, studId: updated.id, x0: updated.x0, x1: updated.x1 };
}

function rotateStudById(studId, options = {}, customModel) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const found = findStudById(studId, mModel);
  if (!found) return null;
  const { wall: w, member: m, studKey } = found;
  const c = construction(w);
  const sw = m.studWidth || c.studWidth || 38;
  const sd = m.studDepth || c.studDepth || 140;
  const safeW = Math.abs(sw - sd) < 2 ? 38 : Math.min(sw, sd);
  const safeD = Math.abs(sw - sd) < 2 ? Math.max(89, sd) : Math.max(sw, sd);

  const curIsFlat = m.orientation === 'flat' || (Math.abs((m.depth || c.studDepth) - safeW) <= 2 && Math.abs((m.x1 - m.x0) - safeW) > 5);
  let nextOrientation;
  if (options.orientation === 'flat' || options.orientation === 'vertical') {
    nextOrientation = options.orientation;
  } else if (options.faceAlign && curIsFlat) {
    nextOrientation = 'flat';
  } else {
    nextOrientation = curIsFlat ? 'vertical' : 'flat';
  }

  const faceAlign = options.faceAlign || (nextOrientation === 'flat' ? 'inner' : 'center');
  let lateralOffset = 0;
  if (nextOrientation === 'flat') {
    if (faceAlign === 'outer') lateralOffset = -(c.studDepth - safeW) / 2;
    else if (faceAlign === 'center') lateralOffset = 0;
    else lateralOffset = (c.studDepth - safeW) / 2;
  }

  if (m.isExtraStud || m.type === 'Extra stud') {
    const extraStuds = Array.isArray(w.framing?.extraStuds) ? w.framing.extraStuds.map(ex => ({ ...ex })) : [];
    let matched = false;
    for (const ex of extraStuds) {
      if ((m.extraStudId && ex.id === m.extraStudId) || Math.abs(Math.round(ex.x0) - (m.origX0 ?? Math.round(m.x0))) <= 4) {
        ex.orientation = nextOrientation;
        ex.lateralOffset = lateralOffset;
        ex.faceAlign = faceAlign;
        matched = true;
        break;
      }
    }
    if (matched) {
      w.framing = { ...c, extraStuds };
      const layout = generateWallFraming(w, mModel);
      const updated = layout.members.find(x => x.isStud && ((m.extraStudId && x.extraStudId === m.extraStudId) || Math.abs(x.x0 - m.x0) <= 4)) || m;
      return { wall: w, member: updated, studId: updated.id, orientation: nextOrientation, faceAlign };
    }
  }

  const existingOverrides = (w.framing?.studOverrides && typeof w.framing.studOverrides === 'object') ? { ...w.framing.studOverrides } : {};
  const origX0 = m.origX0 ?? Math.round(m.x0);
  const origZ0 = m.origZ0 ?? Math.round(m.z0);
  const origKey = `${m.type}:${origX0}:${origZ0}`;
  const prevOv = existingOverrides[studKey] || existingOverrides[origKey] || {};
  const rec = {
    ...prevOv,
    studKey,
    x0: origX0,
    z0: origZ0,
    type: m.type,
    studWidth: safeW,
    studDepth: safeD,
    timberGrade: m.timberGrade || c.timberGrade || 'C24',
    orientation: nextOrientation,
    rotated: nextOrientation === 'flat',
    faceAlign,
    lateralOffset
  };
  existingOverrides[studKey] = rec;
  existingOverrides[origKey] = rec;
  w.framing = {
    ...c,
    studOverrides: existingOverrides
  };
  const layout = generateWallFraming(w, mModel);
  const updated = layout.members.find(x => x.id === m.id || x.studKey === origKey) || m;
  return { wall: w, member: updated, studId: updated.id, orientation: nextOrientation, faceAlign };
}

function addExtraStudById(studId, options = {}, customModel) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const found = findStudById(studId, mModel);
  if (!found) return null;
  const { wall: w, member: m } = found;
  const c = construction(w);
  const run = framingRun(w, mModel);
  const layoutBefore = generateWallFraming(w, mModel);
  const existingStuds = (layoutBefore.members || []).filter(s => s.isStud && Number.isFinite(s.x0) && Number.isFinite(s.x1));

  const sw = Number(options.studWidth) || m.studWidth || c.studWidth || 38;
  const sd = Number(options.studDepth) || m.studDepth || c.studDepth || 140;
  const safeW = Math.abs(sw - sd) < 2 ? 38 : Math.min(sw, sd);
  const safeD = Math.abs(sw - sd) < 2 ? Math.max(89, sd) : Math.max(sw, sd);
  const orientation = options.orientation || 'vertical';
  const spanX = orientation === 'flat' ? safeD : safeW;

  const isSpotFree = (candX0) => {
    if (candX0 < run.start - 0.5 || candX0 + spanX > run.end + 0.5) return false;
    const candX1 = candX0 + spanX;
    return !existingStuds.some(s => Math.min(s.x1, candX1) - Math.max(s.x0, candX0) > 2);
  };

  let targetX0 = null;
  const side = options.side || 'auto';

  if (Number.isFinite(options.targetX0)) {
    targetX0 = Number(options.targetX0);
  } else if (Number.isFinite(options.offsetMm)) {
    const off = Number(options.offsetMm);
    targetX0 = off >= 0 ? (m.x1 + off) : (m.x0 + off - spanX);
  } else if (side === 'left') {
    for (let step = 0; step <= 10; step++) {
      const cand = m.x0 - spanX - step * safeW;
      if (isSpotFree(cand)) { targetX0 = cand; break; }
    }
    if (targetX0 === null) targetX0 = Math.max(run.start, m.x0 - spanX);
  } else if (side === 'right') {
    for (let step = 0; step <= 10; step++) {
      const cand = m.x1 + step * safeW;
      if (isSpotFree(cand)) { targetX0 = cand; break; }
    }
    if (targetX0 === null) targetX0 = Math.min(run.end - spanX, m.x1);
  } else {
    // 'auto': try right flush first, then left flush, then step outward
    for (let step = 0; step <= 12; step++) {
      const candRight = m.x1 + step * safeW;
      if (isSpotFree(candRight)) { targetX0 = candRight; break; }
      const candLeft = m.x0 - spanX - step * safeW;
      if (isSpotFree(candLeft)) { targetX0 = candLeft; break; }
    }
    if (targetX0 === null) {
      targetX0 = (m.x1 + spanX <= run.end) ? m.x1 : Math.max(run.start, m.x0 - spanX);
    }
  }

  targetX0 = Math.round(Math.max(run.start, Math.min(run.end - spanX, targetX0)));
  const extraStuds = Array.isArray(w.framing?.extraStuds) ? [...w.framing.extraStuds] : [];
  const newExtraId = `EX-${Date.now()}-${extraStuds.length + 1}`;
  const newExtra = {
    id: newExtraId,
    x0: targetX0,
    z0: Math.round(m.z0),
    z1: Math.round(m.z1),
    studWidth: safeW,
    studDepth: safeD,
    orientation,
    lateralOffset: orientation === 'flat' ? (c.studDepth - safeW) / 2 : 0,
    timberGrade: m.timberGrade || c.timberGrade || 'C24',
    role: 'Extra stud'
  };
  extraStuds.push(newExtra);
  w.framing = {
    ...c,
    extraStuds
  };
  const layoutAfter = generateWallFraming(w, mModel);
  const created = layoutAfter.members.find(x => x.isStud && (x.extraStudId === newExtraId || (x.type === 'Extra stud' && Math.abs(x.x0 - targetX0) <= 2))) || null;
  return { wall: w, member: created, studId: created?.id, x0: targetX0, x1: targetX0 + spanX };
}

function insertCustomStudAtCoordinate(coordInput, options = {}, customModel) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const opts = (options && typeof options === 'object') ? options : {};
  const fail = (code, reason, extra = {}) => {
    const out = {
      ok: false,
      inserted: false,
      code,
      reason,
      error: reason,
      warnings: extra.warnings || [],
      wallId: extra.wallId || null,
      conflictingMember: extra.conflictingMember || null,
      constraints: extra.constraints || null
    };
    if (opts.throwOnError) throw new Error(reason);
    return out;
  };

  if (!mModel || !Array.isArray(mModel.elements)) {
    return fail('NO_MODEL', 'BIM model is not available.');
  }

  // 1. Resolve target wall (explicit wall/wallId -> current wall panel via framingWall() -> first enabled wall in mModel)
  let w = null;
  if (opts.wall && opts.wall.type === 'wall') {
    w = opts.wall;
  } else if (opts.wallId) {
    w = mModel.elements.find(e => e && e.id === opts.wallId && e.type === 'wall') || null;
  } else if (coordInput && typeof coordInput === 'object' && coordInput.wall && coordInput.wall.type === 'wall') {
    w = coordInput.wall;
  } else if (coordInput && typeof coordInput === 'object' && coordInput.wallId) {
    w = mModel.elements.find(e => e && e.id === coordInput.wallId && e.type === 'wall') || null;
  } else {
    const fw = typeof framingWall === 'function' ? framingWall() : null;
    if (fw && fw.type === 'wall' && (!customModel || mModel.elements.includes(fw))) {
      w = fw;
    } else if (fw && fw.id) {
      w = mModel.elements.find(e => e && e.id === fw.id && e.type === 'wall') || null;
    }
    if (!w) {
      const storyId = (typeof activeStory !== 'undefined' && activeStory) ? activeStory : null;
      w = mModel.elements.find(e => e && e.type === 'wall' && (!storyId || e.story === storyId) && construction(e).enabled)
        || mModel.elements.find(e => e && e.type === 'wall' && construction(e).enabled)
        || mModel.elements.find(e => e && e.type === 'wall')
        || null;
    }
  }

  if (!w || w.type !== 'wall') {
    return fail('NO_WALL', 'No active wall panel found to insert custom stud.');
  }

  const c = construction(w);
  if (!c.enabled) {
    return fail('FRAMING_DISABLED', `Framing generation is disabled on wall ${w.id}.`, { wallId: w.id });
  }

  const len = distance(w.a, w.b);
  const fallbackH = typeof heightOf === 'function' ? heightOf(w) : 3048;
  const h = Number.isFinite(w.height) && w.height > 0 ? w.height : fallbackH;
  if (!Number.isFinite(len) || len < Math.max(40, 2 * c.studWidth) || !Number.isFinite(h) || h <= 0) {
    return fail('INVALID_WALL_GEOMETRY', `Wall ${w.id} geometry is invalid or too short for framing.`, { wallId: w.id });
  }

  const run = framingRun(w, mModel);
  const bottom = c.bottomPlates * c.plateThickness;
  const top = h - c.topPlates * c.plateThickness;
  if (!Number.isFinite(run.start) || !Number.isFinite(run.end) || run.end - run.start < 2 * c.studWidth) {
    return fail('INVALID_FRAMING_RUN', `Wall ${w.id} clear framing run is too short after corner/junction offsets.`, { wallId: w.id });
  }
  if (top <= bottom + 20) {
    return fail('INSUFFICIENT_WALL_HEIGHT', `Wall ${w.id} height leaves no clear stud space between plates.`, { wallId: w.id });
  }

  // 2. Parse coordinate input (number, {x, z}, {x0, z0, z1}, canvas {canvasX/screenX, canvasY/screenY}, or world {worldX, worldY, worldZ})
  let rawX = NaN;
  let explicitZ = null;
  let explicitZ0 = null;
  let explicitZ1 = null;
  let explicitLatFromWorld = null;
  let hasExplicitLeftEdge = false;
  let coordObj = (coordInput && typeof coordInput === 'object') ? coordInput : {};

  if (typeof coordInput === 'number') {
    rawX = coordInput;
  } else if (coordObj) {
    if (Number.isFinite(coordObj.screenX) && Number.isFinite(coordObj.screenY)
      || Number.isFinite(coordObj.canvasX) && Number.isFinite(coordObj.canvasY)
      || Number.isFinite(coordObj.sx) && Number.isFinite(coordObj.sy)) {
      const sx = Number.isFinite(coordObj.screenX) ? coordObj.screenX : (Number.isFinite(coordObj.canvasX) ? coordObj.canvasX : coordObj.sx);
      const sy = Number.isFinite(coordObj.screenY) ? coordObj.screenY : (Number.isFinite(coordObj.canvasY) ? coordObj.canvasY : coordObj.sy);
      const wt = typeof window !== 'undefined' ? window._wallPanelTransform : null;
      if (!wt || !Number.isFinite(wt.s) || wt.s <= 0 || (wt.wallId && wt.wallId !== w.id)) {
        return fail('NO_PANEL_TRANSFORM', 'Wall Panel screen-to-panel transform is not active for this wall.', { wallId: w.id });
      }
      rawX = (sx - wt.ox) / wt.s;
      const mappedZ = (wt.oy - sy) / wt.s;
      if (mappedZ >= -5) explicitZ = mappedZ;
    } else if (Number.isFinite(coordObj.worldX) && Number.isFinite(coordObj.worldY)) {
      const u = sub2(w.b, w.a);
      const ux = u.x / (len || 1), uy = u.y / (len || 1);
      const nx = -uy, ny = ux;
      const dx = coordObj.worldX - w.a.x, dy = coordObj.worldY - w.a.y;
      rawX = dx * ux + dy * uy;
      const coreOff = referenceOffset(w) + coreGeometry(w).center * (w.flipped ? -1 : 1);
      explicitLatFromWorld = (dx * nx + dy * ny) - coreOff;
      if (Number.isFinite(coordObj.worldZ)) {
        const wb = typeof wallBase === 'function' ? wallBase(w) : 0;
        explicitZ = coordObj.worldZ - wb;
      }
    } else if (Number.isFinite(coordObj.x)) {
      rawX = Number(coordObj.x);
    } else if (Number.isFinite(coordObj.x0)) {
      rawX = Number(coordObj.x0);
      hasExplicitLeftEdge = true;
    }

    if (Number.isFinite(opts.z)) explicitZ = Number(opts.z);
    else if (explicitZ === null && Number.isFinite(coordObj.z)) explicitZ = Number(coordObj.z);
    if (Number.isFinite(opts.z0)) explicitZ0 = Number(opts.z0);
    else if (Number.isFinite(coordObj.z0)) explicitZ0 = Number(coordObj.z0);
    if (Number.isFinite(opts.z1)) explicitZ1 = Number(opts.z1);
    else if (Number.isFinite(coordObj.z1)) explicitZ1 = Number(coordObj.z1);
  }

  if (!Number.isFinite(rawX)) {
    return fail('INVALID_COORDINATE', 'Coordinate X along the wall panel must be a finite number (mm).', { wallId: w.id });
  }

  // 3. Validate member section dimensions, rectangular rule, orientation & wall-core lateral bounds
  const snapToValid = Boolean(opts.snapToValid || opts.findNearestValid);
  const clampX = Boolean(opts.clampX || snapToValid);
  const clampZ = Boolean(opts.clampZ || snapToValid);
  const allowOverlap = Boolean(opts.allowOverlap);
  const warnings = [];

  const reqSw = Number(opts.studWidth ?? coordObj.studWidth ?? c.studWidth ?? 38);
  const reqSd = Number(opts.studDepth ?? coordObj.studDepth ?? c.studDepth ?? 140);
  if (!Number.isFinite(reqSw) || !Number.isFinite(reqSd) || reqSw < 19 || reqSd < 19) {
    return fail('INVALID_SECTION', 'Stud width and depth must be at least 19 mm.', { wallId: w.id });
  }
  if (Math.abs(reqSw - reqSd) < 2) {
    return fail('INVALID_SQUARE_SECTION', 'Square stud dimensions are not permitted; specify a rectangular timber section (e.g., 38 × 140 mm).', { wallId: w.id });
  }

  const coreDepth = Math.max(50, Number(c.studDepth || w.thickness || 140));
  const safeW = Math.min(reqSw, reqSd);
  let safeD = Math.max(reqSw, reqSd);
  const orientation = (opts.orientation || coordObj.orientation || 'vertical') === 'flat' ? 'flat' : 'vertical';
  let spanX = orientation === 'flat' ? safeD : safeW;
  let depthY = orientation === 'flat' ? safeW : safeD;

  if (depthY > coreDepth + 0.5) {
    if (snapToValid && coreDepth - safeW >= 2) {
      safeD = coreDepth;
      depthY = coreDepth;
      warnings.push(`Stud depth clamped to wall core depth (${Math.round(coreDepth)} mm).`);
    } else {
      return fail('EXCEEDS_WALL_THICKNESS', `Stud depth (${Math.round(depthY)} mm) exceeds wall structural core (${Math.round(coreDepth)} mm).`, { wallId: w.id });
    }
  }
  if (spanX > (run.end - run.start) - 1) {
    return fail('EXCEEDS_WALL_LENGTH', `Stud span (${Math.round(spanX)} mm) exceeds clear wall framing run (${Math.round(run.end - run.start)} mm).`, { wallId: w.id });
  }

  const faceAlign = opts.faceAlign || coordObj.faceAlign || (orientation === 'flat' ? 'inner' : 'center');
  let lateralOffset = 0;
  if (Number.isFinite(opts.lateralOffset)) lateralOffset = Number(opts.lateralOffset);
  else if (Number.isFinite(coordObj.lateralOffset)) lateralOffset = Number(coordObj.lateralOffset);
  else if (Number.isFinite(explicitLatFromWorld)) lateralOffset = Math.round(explicitLatFromWorld);
  else if (faceAlign === 'inner') lateralOffset = (coreDepth - depthY) / 2;
  else if (faceAlign === 'outer') lateralOffset = -(coreDepth - depthY) / 2;

  const maxLat = Math.max(0, (coreDepth - depthY) / 2);
  if (Math.abs(lateralOffset) > maxLat + 0.5) {
    if (snapToValid) {
      lateralOffset = Math.max(-maxLat, Math.min(maxLat, lateralOffset));
      warnings.push('Lateral offset clamped inside wall structural core.');
    } else {
      return fail('OUT_OF_WALL_CORE_BOUNDS', `Lateral offset (${Math.round(lateralOffset)} mm) places stud outside the ${Math.round(coreDepth)} mm wall core.`, { wallId: w.id });
    }
  }

  // 4. Generate current wall layout & gather geometric constraints (openings, headers, sills, rake plates, studs)
  const layoutBefore = generateWallFraming(w, mModel);
  const existingMembers = layoutBefore.members || [];
  const existingStuds = existingMembers.filter(m => m.isStud && Number.isFinite(m.x0) && Number.isFinite(m.x1));
  const rakePlates = existingMembers.filter(m => m.isRakePlate && Number.isFinite(m.slopeZ0) && Number.isFinite(m.slopeZ1));
  const gableProfile = layoutBefore.gableProfile || (typeof computeWallRoofGableProfile === 'function' ? computeWallRoofGableProfile(w, mModel) : null);
  const hasGable = Boolean(gableProfile && gableProfile.peakRise > 45);
  const gableBaseH = hasGable ? (gableProfile.eaveHeight || h) : h;

  const rawHosted = (w.openings && Array.isArray(w.openings) && w.openings.length)
    ? w.openings
    : (typeof hosted === 'function' ? hosted(w) : mModel.elements.filter(e => e && e.host === w.id));
  const openings = rawHosted
    .map(o => {
      const off = Number.isFinite(o.offset) ? o.offset : (Number.isFinite(o.startDist) ? o.startDist + (o.width || 0) / 2 : NaN);
      const sill = Number.isFinite(o.sill) ? o.sill : (Number.isFinite(o.sillHeight) ? o.sillHeight : (o.type === 'door' ? 0 : 900));
      return { ...o, offset: off, sill, left: off - (o.width || 0) / 2, right: off + (o.width || 0) / 2, head: sill + (o.height || 0) };
    })
    .filter(o => Number.isFinite(o.left) && o.width > 0 && o.height > 0 && o.left >= -0.01 && o.right <= len + 0.01);

  const minStudLength = Math.max(20, Number(opts.minLength) || 45);
  const runStart = run.start;
  const runEnd = run.end;

  const rakeUndersideAt = (x) => {
    for (const rp of rakePlates) {
      if (x >= rp.x0 - 0.5 && x <= rp.x1 + 0.5) {
        const dx = Math.max(1, rp.x1 - rp.x0);
        const t = Math.max(0, Math.min(1, (x - rp.x0) / dx));
        const b0 = Number.isFinite(rp.slopeBotZ0) ? rp.slopeBotZ0 : Math.max(gableBaseH, rp.slopeZ0 - (rp.rakeVertThk || c.plateThickness * c.topPlates));
        const b1 = Number.isFinite(rp.slopeBotZ1) ? rp.slopeBotZ1 : Math.max(gableBaseH, rp.slopeZ1 - (rp.rakeVertThk || c.plateThickness * c.topPlates));
        return Math.max(gableBaseH, b0 + (b1 - b0) * t);
      }
    }
    if (!hasGable) return top;
    const rTop = gableBaseH + Math.max(0, gableProfile.riseAt(x));
    const thk = Math.round(((c.plateThickness || 38) * (c.topPlates || 2)) / Math.max(0.35, Math.cos((gableProfile.pitchDeg * Math.PI) / 180) || 0.9));
    return Math.max(gableBaseH, rTop - thk);
  };

  // Helper evaluating all geometric constraints for a candidate [candX0, candX0 + spanX]
  const evaluateAtX = (candX0, allowZClamp) => {
    const x0 = candX0;
    const x1 = x0 + spanX;

    if (x0 < runStart - 0.5 || x1 > runEnd + 0.5) {
      return {
        ok: false,
        code: 'OUT_OF_HORIZONTAL_BOUNDS',
        reason: `Coordinate [${Math.round(x0)}, ${Math.round(x1)}] mm lies outside the clear wall panel run [${Math.round(runStart)}, ${Math.round(runEnd)}] mm.`
      };
    }

    // Determine main vertical floor/ceiling envelope at [x0, x1] (handling sloped profiles & ArchiCAD Roof Trim)
    let localBot = bottom;
    let localTop = top;

    if ((w.framing?.wallProfile && w.framing.wallProfile !== 'rectangular') || Number(w.framing?.parapetHeightMm) > 0) {
      if (typeof window !== 'undefined' && window.WallJunctionEngine && typeof window.WallJunctionEngine.getWallTopZAtX === 'function') {
        const tpAllow = c.topPlates * c.plateThickness;
        const t0 = window.WallJunctionEngine.getWallTopZAtX(w, x0, h, tpAllow);
        const t1 = window.WallJunctionEngine.getWallTopZAtX(w, x1, h, tpAllow);
        localTop = Math.min(t0, t1);
      }
    }

    if (w.roofTrim && w.roofTrim.enabled !== false && typeof applyRoofTrimToWallFraming === 'function') {
      const probe = [{
        id: '__probe__',
        type: 'Extra stud',
        isStud: true,
        isExtraStud: true,
        x0,
        x1,
        z0: localBot,
        z1: Math.max(localTop, h + 10000),
        depth: depthY
      }];
      applyRoofTrimToWallFraming(w, probe, c, mModel);
      if (!probe.length) {
        return {
          ok: false,
          code: 'ROOF_TRIM_CLIPPED',
          reason: `Wall height at X = ${Math.round(x0)} mm is below minimum stud height after roof trim.`
        };
      }
      localBot = Math.max(localBot, probe[0].z0);
      localTop = Math.min(localTop, probe[0].z1);
    }

    // Check if targeting the gable triangle zone above top plates
    const wantsGable = hasGable && (
      (explicitZ !== null && explicitZ > top + 1) ||
      (explicitZ0 !== null && explicitZ0 >= gableBaseH - 5)
    );

    let zoneBot = localBot;
    let zoneTop = localTop;
    let bevelMeta = null;
    let crippleRole = null;

    if (wantsGable) {
      const peakXs = [];
      for (const rp of rakePlates) {
        if (rp.x0 > x0 + 1 && rp.x0 < x1 - 1) peakXs.push(rp.x0);
        if (rp.x1 > x0 + 1 && rp.x1 < x1 - 1) peakXs.push(rp.x1);
      }
      const u0 = Math.round(rakeUndersideAt(x0));
      const u1 = Math.round(rakeUndersideAt(x1));
      const straddlePeak = peakXs.find(px => px > x0 + 1 && px < x1 - 1);
      const uPeak = straddlePeak !== undefined ? Math.round(rakeUndersideAt(straddlePeak)) : null;
      const maxTop = Math.max(u0, u1, uPeak || 0);
      if (maxTop - gableBaseH < minStudLength) {
        return {
          ok: false,
          code: 'GABLE_HEIGHT_TOO_SHORT',
          reason: `Gable height at X = ${Math.round(x0)} mm (${Math.round(maxTop - gableBaseH)} mm) is below minimum stud length (${minStudLength} mm).`
        };
      }
      if (explicitZ !== null && !allowZClamp && (explicitZ < gableBaseH - 2 || explicitZ > maxTop + 2)) {
        return {
          ok: false,
          code: 'OUT_OF_VERTICAL_BOUNDS',
          reason: `Coordinate Z = ${Math.round(explicitZ)} mm falls outside the gable stud envelope [${Math.round(gableBaseH)}, ${Math.round(maxTop)}] mm at X = ${Math.round(x0)} mm.`
        };
      }
      zoneBot = gableBaseH;
      zoneTop = maxTop;
      bevelMeta = {
        isGableStud: true,
        bevelAngleDeg: gableProfile.pitchDeg,
        bevelZ0: u0,
        bevelZ1: u1,
        ...(uPeak !== null ? { bevelZPeak: uPeak, bevelPeakX: straddlePeak } : {})
      };
    } else {
      // Check horizontal intersection with openings (rough openings, headers, sills)
      const hitOpening = openings.find(o => Math.min(x1, o.right) - Math.max(x0, o.left) > 1.5);
      if (hitOpening) {
        const hdrs = existingMembers.filter(m => m.type === 'Header' && Math.min(x1, m.x1) - Math.max(x0, m.x0) > 1);
        const sills = existingMembers.filter(m => m.type === 'Sill' && Math.min(x1, m.x1) - Math.max(x0, m.x0) > 1);
        const lowerSills = sills.filter(sl => sl.z1 <= hitOpening.sill + 1);
        const lowerTop = lowerSills.length ? Math.min(...lowerSills.map(sl => sl.z0)) : (hitOpening.sill - 2 * c.plateThickness);

        const validZones = [];
        if (hitOpening.type === 'window' && lowerTop - localBot >= minStudLength) {
          validZones.push({ name: 'lower', z0: localBot, z1: lowerTop, role: 'Custom lower cripple' });
        }

        if (hdrs.length) {
          const hdrMinZ0 = Math.min(...hdrs.map(hd => hd.z0));
          const hdrMaxZ1 = Math.max(...hdrs.map(hd => hd.z1));
          const pThk = Math.max(19, c.plateThickness || 38);
          const headAreaPlates = sills.filter(sl => sl.z0 >= hitOpening.head - 1 && sl.z1 <= hdrMinZ0 + 1);
          const openingHeadPlates = headAreaPlates.filter(sl => sl.z0 < hitOpening.head + 2.2 * pThk && sl.z1 < hdrMinZ0 - pThk + 2);
          const belowHeaderPlates = headAreaPlates.filter(sl => sl.z1 >= hdrMinZ0 - 2.2 * pThk && sl.z0 >= hitOpening.head + pThk - 2);
          const openingHeadTop = openingHeadPlates.length ? Math.max(...openingHeadPlates.map(sl => sl.z1)) : hitOpening.head;
          const belowHeaderBot = belowHeaderPlates.length ? Math.min(hdrMinZ0, ...belowHeaderPlates.map(sl => sl.z0)) : hdrMinZ0;

          if (belowHeaderBot - openingHeadTop >= minStudLength) {
            validZones.push({ name: 'upper', z0: openingHeadTop, z1: belowHeaderBot, role: 'Custom header stud' });
          }
          if (localTop - hdrMaxZ1 >= minStudLength) {
            validZones.push({ name: 'upper-above-header', z0: hdrMaxZ1, z1: localTop, role: 'Custom upper cripple' });
          }
        } else if (localTop - hitOpening.head >= minStudLength) {
          validZones.push({ name: 'upper', z0: hitOpening.head, z1: localTop, role: 'Custom upper cripple' });
        }

        let pickedZone = null;
        if (explicitZ !== null) {
          pickedZone = validZones.find(zn => explicitZ >= zn.z0 - 2 && explicitZ <= zn.z1 + 2) || null;
          if (!pickedZone) {
            return {
              ok: false,
              code: 'INSIDE_OPENING_VOID',
              reason: `Coordinate (X=${Math.round(x0)} mm, Z=${Math.round(explicitZ)} mm) falls inside ${hitOpening.id} (${hitOpening.type}) rough opening / header / sill zone.`
            };
          }
        } else if (explicitZ0 !== null || explicitZ1 !== null) {
          const tz0 = explicitZ0 !== null ? explicitZ0 : localBot;
          const tz1 = explicitZ1 !== null ? explicitZ1 : localTop;
          pickedZone = validZones.find(zn => tz0 >= zn.z0 - 2 && tz1 <= zn.z1 + 2)
            || (allowZClamp ? validZones.find(zn => Math.min(tz1, zn.z1) - Math.max(tz0, zn.z0) >= minStudLength) : null);
          if (!pickedZone) {
            return {
              ok: false,
              code: 'INSIDE_OPENING_VOID',
              reason: `Vertical range [${Math.round(tz0)}, ${Math.round(tz1)}] mm intersects ${hitOpening.id} (${hitOpening.type}) clear opening.`
            };
          }
        } else {
          return {
            ok: false,
            code: 'INTERSECTS_OPENING',
            reason: `X = ${Math.round(x0)} mm intersects opening ${hitOpening.id} [${Math.round(hitOpening.left)}–${Math.round(hitOpening.right)} mm]. Specify a Z coordinate in a valid cripple zone or move outside the opening.`
          };
        }

        zoneBot = pickedZone.z0;
        zoneTop = pickedZone.z1;
        crippleRole = pickedZone.role;
      } else if (explicitZ !== null && !allowZClamp && (explicitZ < localBot - 2 || explicitZ > localTop + 2)) {
        return {
          ok: false,
          code: 'OUT_OF_VERTICAL_BOUNDS',
          reason: `Coordinate Z = ${Math.round(explicitZ)} mm falls outside valid stud vertical envelope [${Math.round(localBot)}, ${Math.round(localTop)}] mm.`
        };
      }
    }

    if (zoneTop - zoneBot < minStudLength) {
      return {
        ok: false,
        code: 'INSUFFICIENT_CLEAR_HEIGHT',
        reason: `Clear vertical height (${Math.round(zoneTop - zoneBot)} mm) at X = ${Math.round(x0)} mm is below minimum stud length (${minStudLength} mm).`
      };
    }

    // Resolve final [z0, z1] inside [zoneBot, zoneTop]
    let z0 = explicitZ0 !== null ? explicitZ0 : zoneBot;
    let z1 = explicitZ1 !== null ? explicitZ1 : zoneTop;
    let zClamped = false;

    if (z0 < zoneBot - 0.5 || z1 > zoneTop + 0.5) {
      if (allowZClamp) {
        z0 = Math.max(zoneBot, Math.min(zoneTop - minStudLength, z0));
        z1 = Math.min(zoneTop, Math.max(z0 + minStudLength, z1));
        zClamped = true;
      } else {
        return {
          ok: false,
          code: 'OUT_OF_VERTICAL_BOUNDS',
          reason: `Requested Z span [${Math.round(z0)}, ${Math.round(z1)}] mm exceeds valid plate/cripple bounds [${Math.round(zoneBot)}, ${Math.round(zoneTop)}] mm.`
        };
      }
    }
    z0 = Math.max(zoneBot, Math.round(z0));
    z1 = Math.min(zoneTop, Math.round(z1));
    if (z1 - z0 < minStudLength) {
      return {
        ok: false,
        code: 'INSUFFICIENT_CLEAR_HEIGHT',
        reason: `Stud vertical length (${Math.round(z1 - z0)} mm) is less than minimum allowed (${minStudLength} mm).`
      };
    }

    // 5. Check 3D volume overlap against existing studs, headers, sills
    if (!allowOverlap) {
      const latMin = lateralOffset - depthY / 2;
      const latMax = lateralOffset + depthY / 2;
      for (const m of existingMembers) {
        const checkMember = m.isStud || m.type === 'Header' || m.type === 'Sill';
        if (!checkMember) continue;
        const xOv = Math.min(x1, m.x1) - Math.max(x0, m.x0);
        if (xOv <= 1.5) continue; // Touching side-by-side (0 mm overlap) is valid
        const zOv = Math.min(z1, m.z1) - Math.max(z0, m.z0);
        if (zOv <= 1.5) continue;
        const mDepth = m.depth || coreDepth;
        const mLat = m.lateralOffset || 0;
        const yOv = Math.min(latMax, mLat + mDepth / 2) - Math.max(latMin, mLat - mDepth / 2);
        if (yOv > 1.5) {
          return {
            ok: false,
            code: 'MEMBER_OVERLAP',
            conflictingMember: m,
            reason: `Stud at [${Math.round(x0)}–${Math.round(x1)}] mm overlaps existing ${m.type} at [${Math.round(m.x0)}–${Math.round(m.x1)}] mm.`
          };
        }
      }
    }

    return {
      ok: true,
      x0,
      x1,
      z0,
      z1,
      zClamped,
      bevelMeta,
      crippleRole,
      zoneBot,
      zoneTop
    };
  };

  // Compute initial candidate X0 from alignment option
  const align = opts.align || coordObj.align || (hasExplicitLeftEdge ? 'left' : 'center');
  let targetX0 = align === 'left' ? rawX : (align === 'right' ? rawX - spanX : rawX - spanX / 2);
  targetX0 = Math.round(targetX0 * 10) / 10;

  let xClamped = false;
  let snapped = false;
  if (targetX0 < runStart - 0.5 || targetX0 + spanX > runEnd + 0.5) {
    if (clampX) {
      targetX0 = Math.max(runStart, Math.min(runEnd - spanX, targetX0));
      xClamped = true;
      warnings.push(`X coordinate clamped inside wall run [${Math.round(runStart)}, ${Math.round(runEnd)}] mm.`);
    } else {
      return fail('OUT_OF_HORIZONTAL_BOUNDS', `Coordinate [${Math.round(targetX0)}, ${Math.round(targetX0 + spanX)}] mm lies outside wall panel run [${Math.round(runStart)}, ${Math.round(runEnd)}] mm.`, {
        wallId: w.id,
        constraints: { runStart, runEnd, spanX }
      });
    }
  }

  let check = evaluateAtX(targetX0, clampZ);

  // Optional nearest-valid coordinate search when snapToValid is enabled
  if (!check.ok && snapToValid) {
    const maxSnapDist = opts.snapToValid === 'anywhere' ? len : Math.max(150, Number(opts.maxSnapDistance) || 650);
    const candSet = new Set();
    for (const s of existingStuds) {
      candSet.add(Math.round(s.x1));
      candSet.add(Math.round(s.x0 - spanX));
    }
    for (const o of openings) {
      candSet.add(Math.round(o.left - c.studWidth - spanX));
      candSet.add(Math.round(o.right + c.studWidth));
    }
    for (let step = 10; step <= maxSnapDist; step += 10) {
      candSet.add(Math.round(targetX0 + step));
      candSet.add(Math.round(targetX0 - step));
    }
    const candidates = [...candSet]
      .filter(cx => cx >= runStart - 0.5 && cx + spanX <= runEnd + 0.5 && Math.abs(cx - targetX0) <= maxSnapDist)
      .sort((a, b) => Math.abs(a - targetX0) - Math.abs(b - targetX0));

    for (const cx of candidates) {
      const clampedCx = Math.max(runStart, Math.min(runEnd - spanX, cx));
      const res = evaluateAtX(clampedCx, true);
      if (res.ok) {
        check = res;
        targetX0 = clampedCx;
        snapped = true;
        warnings.push(`Snapped to nearest geometrically valid coordinate X = ${Math.round(clampedCx)} mm.`);
        break;
      }
    }
  }

  if (!check.ok) {
    return fail(check.code, check.reason, {
      wallId: w.id,
      conflictingMember: check.conflictingMember || null,
      constraints: { runStart, runEnd, bottom, top, coreDepth },
      warnings
    });
  }

  const finalX0 = Math.round(check.x0 * 10) / 10;
  const finalZ0 = Math.round(check.z0);
  const finalZ1 = Math.round(check.z1);
  if (check.zClamped) warnings.push(`Z bounds adjusted to [${finalZ0}, ${finalZ1}] mm.`);

  if (opts.dryRun) {
    return {
      ok: true,
      dryRun: true,
      inserted: false,
      wall: w,
      wallId: w.id,
      member: null,
      studId: null,
      extraStudId: null,
      x0: finalX0,
      x1: finalX0 + spanX,
      z0: finalZ0,
      z1: finalZ1,
      lateralOffset,
      orientation,
      adjusted: { x: xClamped || snapped, z: Boolean(check.zClamped), snapped },
      warnings
    };
  }

  const extraStuds = Array.isArray(w.framing?.extraStuds) ? [...w.framing.extraStuds] : [];
  const newExtraId = `EX-${Date.now()}-${extraStuds.length + 1}`;
  const newExtra = {
    id: newExtraId,
    x0: finalX0,
    z0: finalZ0,
    z1: finalZ1,
    studWidth: safeW,
    studDepth: safeD,
    orientation,
    faceAlign,
    lateralOffset,
    timberGrade: opts.timberGrade || coordObj.timberGrade || c.timberGrade || 'C24',
    framingMaterial: opts.framingMaterial || coordObj.framingMaterial || c.studMaterial || 'dimensional',
    role: opts.role || check.crippleRole || (check.bevelMeta ? 'Custom gable stud' : 'Extra stud'),
    locked: Boolean(opts.locked),
    ...(check.bevelMeta || {})
  };
  extraStuds.push(newExtra);
  w.framing = {
    ...c,
    extraStuds
  };

  const layoutAfter = generateWallFraming(w, mModel);
  const created = (layoutAfter.members || []).find(
    x => x.isStud && (x.extraStudId === newExtraId || (x.type === 'Extra stud' && Math.abs(x.x0 - finalX0) <= 2 && Math.abs(x.z0 - finalZ0) <= 2))
  ) || null;

  return {
    ok: true,
    inserted: true,
    wall: w,
    wallId: w.id,
    member: created,
    studId: created?.id || null,
    extraStudId: newExtraId,
    x0: created ? created.x0 : finalX0,
    x1: created ? created.x1 : finalX0 + spanX,
    z0: created ? created.z0 : finalZ0,
    z1: created ? created.z1 : finalZ1,
    lateralOffset,
    orientation,
    adjusted: { x: xClamped || snapped, z: Boolean(check.zClamped), snapped },
    warnings
  };
}

function deleteStudById(studId, customModel) {
  const found = findStudById(studId, customModel);
  if (!found) return false;
  const { wall: w, member: m, studKey } = found;
  const c = construction(w);
  if (m.isExtraStud || m.type === 'Extra stud') {
    const extraStuds = (Array.isArray(w.framing?.extraStuds) ? w.framing.extraStuds : []).filter(ex => {
      if (m.extraStudId && ex.id === m.extraStudId) return false;
      return Math.abs(Math.round(ex.x0) - (m.origX0 ?? Math.round(m.x0))) > 4;
    });
    w.framing = { ...c, extraStuds };
    return { wall: w, member: m, deletedCount: (w.framing?.deletedStuds || []).length };
  }
  const deletedStuds = Array.isArray(w.framing?.deletedStuds) ? [...w.framing.deletedStuds] : [];
  deletedStuds.push({
    studKey,
    x0: m.origX0 ?? Math.round(m.x0),
    z0: m.origZ0 ?? Math.round(m.z0),
    type: m.type,
    deletedAt: Date.now()
  });
  w.framing = {
    ...c,
    deletedStuds
  };
  return { wall: w, member: m, deletedCount: deletedStuds.length };
}

function restoreWallDeletedStuds(w, customModel) {
  if (!w || w.type !== 'wall') return 0;
  const c = construction(w);
  const count = Array.isArray(w.framing?.deletedStuds) ? w.framing.deletedStuds.length : 0;
  w.framing = {
    ...c,
    deletedStuds: []
  };
  return count;
}

function clearWallStudOverrides(w, forceUnlock = false) {
  if (!w || w.type !== 'wall') return 0;
  const c = construction(w);
  const prevOvs = (w.framing?.studOverrides && typeof w.framing.studOverrides === 'object') ? w.framing.studOverrides : {};
  const lockedOvs = {};
  let clearedCount = 0;
  for (const [k, ov] of Object.entries(prevOvs)) {
    if (!forceUnlock && ov && ov.locked) {
      lockedOvs[k] = ov;
    } else {
      clearedCount++;
    }
  }
  const extraCount = Array.isArray(w.framing?.extraStuds) ? w.framing.extraStuds.length : 0;
  w.framing = {
    ...c,
    studOverrides: lockedOvs,
    extraStuds: []
  };
  return clearedCount + extraCount;
}

var TIMBER_GRADE_STRENGTHS = {
  C14: { fm_k: 14, fc0_k: 16, E0_mean: 7000,  E0_05: 4700 },
  C16: { fm_k: 16, fc0_k: 17, E0_mean: 8000,  E0_05: 5400 },
  C18: { fm_k: 18, fc0_k: 18, E0_mean: 9000,  E0_05: 6000 },
  C24: { fm_k: 24, fc0_k: 21, E0_mean: 11000, E0_05: 7400 },
  C30: { fm_k: 30, fc0_k: 24, E0_mean: 12000, E0_05: 8000 }
};

function evaluateWallStudCapacity(params) {
  const { studWidth = 38, studDepth = 140, timberGrade = 'C24', spacing = 400, wallHeight = 3048, qAxialLineLoad_kNm = 12.0, windPressure_kNm2 = 1.0, slsWindPressure_kNm2 = null, kmod: customKmod = 0.8, gammaM: customGammaM = 1.3 } = params;
  const mat = TIMBER_GRADE_STRENGTHS[timberGrade] || TIMBER_GRADE_STRENGTHS.C24;
  const kmod = Number.isFinite(Number(customKmod)) && Number(customKmod) > 0 ? Number(customKmod) : 0.8;
  const gammaM = Number.isFinite(Number(customGammaM)) && Number(customGammaM) > 0 ? Number(customGammaM) : 1.3;
  const fc0_d = (kmod * mat.fc0_k) / gammaM; // N/mm²
  const fm_d = (kmod * mat.fm_k) / gammaM;   // N/mm²

  const s_m = spacing / 1000;
  const h_m = wallHeight / 1000;
  const b = studWidth;
  const d = studDepth;
  const A = b * d; // mm²
  const W_y = (b * d * d) / 6; // mm³
  const I_y = (b * d * d * d) / 12; // mm⁴

  // Factored axial load per stud (kN) and bending moment per stud (kN·m)
  const N_Ed_kN = qAxialLineLoad_kNm * s_m;
  const M_Ed_kNm = (windPressure_kNm2 * s_m * h_m * h_m) / 8;

  const sigma_c = (N_Ed_kN * 1000) / Math.max(1, A); // N/mm²
  const sigma_m = (M_Ed_kNm * 1e6) / Math.max(1, W_y); // N/mm²

  // Eurocode 5 buckling calculation about strong axis (sheathed/blocked weak axis)
  const i_y = d / Math.sqrt(12);
  const lambda_y = wallHeight / Math.max(1, i_y);
  const lambda_rel = (lambda_y / Math.PI) * Math.sqrt(mat.fc0_k / mat.E0_05);
  const beta_c = 0.2; // solid timber
  const k_y = 0.5 * (1 + beta_c * (lambda_rel - 0.3) + lambda_rel * lambda_rel);
  const kc_y = lambda_rel <= 0.3 ? 1.0 : 1 / Math.max(1, k_y + Math.sqrt(Math.max(0, k_y * k_y - lambda_rel * lambda_rel)));

  const N_Rd_kN = (kc_y * fc0_d * A) / 1000;
  const axialUtil = sigma_c / Math.max(0.1, kc_y * fc0_d);
  const bendingUtil = sigma_m / Math.max(0.1, fm_d);
  const combinedDC = axialUtil + bendingUtil;
  const hOverD = wallHeight / Math.max(1, d);

  // Instantaneous lateral wind deflection (SLS characteristic wind when supplied, else 0.67 * wind)
  const windSls = Number.isFinite(Number(slsWindPressure_kNm2)) ? Number(slsWindPressure_kNm2) : (windPressure_kNm2 * 0.67);
  const w_sls_Nmm = (windSls * s_m); // N/mm
  const defl_mm = (5 * w_sls_Nmm * Math.pow(wallHeight, 4)) / (384 * mat.E0_mean * I_y);
  const deflLimit = wallHeight / 300;
  const deflRatio = defl_mm / Math.max(0.1, deflLimit);

  const slendernessFloor = hOverD > 24 ? (hOverD / 24) : 0;
  const governingRatio = Math.max(combinedDC, deflRatio * 0.85, slendernessFloor);
  const dcPercent = Math.round(governingRatio * 100);
  const status = dcPercent > 100 ? 'FAIL' : (dcPercent > 80 ? 'WARNING' : 'PASS');
  return {
    status,
    kmod: Math.round(kmod * 100) / 100,
    gammaM: Math.round(gammaM * 100) / 100,
    fc0_d: Math.round(fc0_d * 100) / 100,
    fm_d: Math.round(fm_d * 100) / 100,
    N_Ed_kN: Math.round(N_Ed_kN * 100) / 100,
    N_Rd_kN: Math.round(N_Rd_kN * 100) / 100,
    M_Ed_kNm: Math.round(M_Ed_kNm * 1000) / 1000,
    axialUtil: Math.round(axialUtil * 1000) / 1000,
    axialDC_pct: Math.round(axialUtil * 100),
    bendingUtil: Math.round(bendingUtil * 1000) / 1000,
    combinedDC: Math.round(combinedDC * 1000) / 1000,
    dcPercent,
    hOverD: Math.round(hOverD * 10) / 10,
    defl_mm: Math.round(defl_mm * 100) / 100,
    deflLimit: Math.round(deflLimit * 10) / 10,
    kc_y: Math.round(kc_y * 100) / 100
  };
}

function evaluateNDS2024StudCapacity(params) {
  const { studWidth = 38, studDepth = 140, timberGrade = 'C24', spacing = 400, wallHeight = 3048, qAxialLineLoad_kNm = 12.0, windPressure_kNm2 = 1.0 } = params;

  // Imperial conversions for NDS 2024 (ASD/LRFD) standard calculation
  const b_in = studWidth / 25.4;
  const d_in = studDepth / 25.4;
  const A_in2 = Math.max(0.1, b_in * d_in);
  const S_in3 = Math.max(0.1, (b_in * Math.pow(d_in, 2)) / 6);
  const I_in4 = Math.max(0.1, (b_in * Math.pow(d_in, 3)) / 12);
  const L_in = wallHeight / 25.4;

  // Reference design values from NDS 2024 Supp. Table 4A/4B (mapped to grade)
  let Fc_base = 1300, Fb_base = 900, E_base = 1.6e6, Emin_base = 0.58e6;
  if (timberGrade === 'C16' || timberGrade === 'C14') {
    Fc_base = 1150; Fb_base = 875; E_base = 1.4e6; Emin_base = 0.51e6;
  } else if (timberGrade === 'C30') {
    Fc_base = 1450; Fb_base = 1000; E_base = 1.6e6; Emin_base = 0.58e6;
  }

  // NDS 2024 Adjustment Factors
  const CD = 1.6; // Load duration factor for wind (NDS 2.3.2)
  const Cr = (spacing <= 610) ? 1.15 : 1.0; // Repetitive member factor (NDS 4.3.9)
  const CF_b = studDepth <= 90 ? 1.5 : studDepth <= 145 ? 1.3 : studDepth <= 190 ? 1.2 : 1.1; // Size factor bending (NDS 4A)
  const CF_c = studDepth <= 90 ? 1.15 : studDepth <= 145 ? 1.10 : 1.05; // Size factor compression (NDS 4A)
  const CL = 1.0; // Beam stability factor (continuous edge sheathing)

  // Column stability factor CP (NDS Section 3.7.1)
  const le_over_d = L_in / Math.max(0.1, d_in);
  const Fc_star = Fc_base * CD * CF_c;
  const FcE = (0.822 * Emin_base) / Math.pow(Math.max(1, le_over_d), 2);
  const c = 0.8; // sawn lumber
  const Kc = (1 + (FcE / Math.max(0.1, Fc_star))) / (2 * c);
  const CP = Math.min(1.0, Kc - Math.sqrt(Math.max(0, Kc * Kc - (FcE / Math.max(0.1, Fc_star)) / c)));

  const Fc_prime = Fc_star * CP;
  const Fb_prime = Fb_base * CD * Cr * CF_b * CL;

  // Loads & applied stresses
  const spacing_m = spacing / 1000;
  const wallHeight_m = wallHeight / 1000;
  const N_Ed_kN = qAxialLineLoad_kNm * spacing_m;
  const M_Ed_kNm = (windPressure_kNm2 * spacing_m * wallHeight_m * wallHeight_m) / 8;

  const P_lbs = N_Ed_kN * 224.809;
  const M_lbin = M_Ed_kNm * 8850.75;

  const fc = P_lbs / A_in2;
  const fb = M_lbin / S_in3;

  // Interaction ratio per NDS Section 3.9.2 Eq. 3.9-2
  const axialRatio = fc / Math.max(1, Fc_prime);
  const flexureAmplification = Math.max(1.0, 1 / Math.max(0.01, 1 - (fc / Math.max(0.1, FcE))));
  const flexureRatio = (fb * flexureAmplification) / Math.max(1, Fb_prime);
  const combinedInteraction = Math.pow(axialRatio, 2) + flexureRatio;

  // Deflection under SLS wind pressure (0.67 wind load)
  const w_sls_lbin = (windPressure_kNm2 * 0.67 * spacing_m * 68.5218) / 12;
  const defl_in = (5 * w_sls_lbin * Math.pow(L_in, 4)) / (384 * E_base * I_in4);
  const defl_mm = defl_in * 25.4;
  const deflLimit_mm = wallHeight / 240;
  const deflRatio = defl_mm / Math.max(0.1, deflLimit_mm);

  const governingRatio = Math.max(combinedInteraction, deflRatio);
  const dcPercent = Math.round(governingRatio * 100);
  const status = dcPercent > 100 ? 'FAIL' : (dcPercent > 80 ? 'WARNING' : 'PASS');

  // LRFD conversion per NDS 2024 Appendix N
  const Fc_LRFD_prime = Fc_prime * 2.16;
  const Fb_LRFD_prime = Fb_prime * 2.16;
  const combinedInteractionLRFD = Math.pow((fc * 1.25) / Math.max(1, Fc_LRFD_prime), 2) + ((fb * 1.0) * flexureAmplification) / Math.max(1, Fb_LRFD_prime);
  const dcPercentLRFD = Math.round(Math.max(combinedInteractionLRFD, deflRatio) * 100);
  const statusLRFD = dcPercentLRFD > 100 ? 'FAIL' : (dcPercentLRFD > 80 ? 'WARNING' : 'PASS');

  return {
    standard: 'NDS 2024 (US ASD)',
    status,
    statusLRFD,
    dcPercent,
    dcPercentLRFD,
    le_over_d: Math.round(le_over_d * 10) / 10,
    CP: Math.round(CP * 100) / 100,
    CD,
    Cr,
    CF_c: Math.round(CF_c * 100) / 100,
    CF_b: Math.round(CF_b * 100) / 100,
    fc_psi: Math.round(fc),
    Fc_prime_psi: Math.round(Fc_prime),
    fb_psi: Math.round(fb),
    Fb_prime_psi: Math.round(Fb_prime),
    FcE_psi: Math.round(FcE),
    combinedInteraction: Math.round(combinedInteraction * 1000) / 1000,
    defl_mm: Math.round(defl_mm * 10) / 10,
    deflLimit_mm: Math.round(deflLimit_mm * 10) / 10,
    N_Ed_kN: Math.round(N_Ed_kN * 100) / 100,
    M_Ed_kNm: Math.round(M_Ed_kNm * 1000) / 1000
  };
}

function auditWallStructuralWarning(w, customModel) {
  if (!w || w.type !== 'wall') return null;
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const c = construction(w);
  const len = Math.max(500, distance(w.a, w.b));
  const h = typeof heightOf === 'function' ? heightOf(w) : (w.height || 3048);
  const isExt = typeof isExteriorWall === 'function' ? isExteriorWall(w) : (w.layer === 'Exterior Walls' || (w.thickness || 140) >= 130);
  const openings = (typeof hosted === 'function' ? hosted(w) : (mModel?.elements || []).filter(e => e.host === w.id));
  const maxOpeningSpan = openings.reduce((mx, o) => Math.max(mx, o.width || 0), 0);
  const totalOpeningWidth = openings.reduce((s, o) => s + (o.width || 0), 0);
  const openingRatio = Math.min(0.75, totalOpeningWidth / len);

  const stories = mModel?.stories || [];
  const wallStory = stories.find(s => s.id === w.story) || stories[0] || { elevation: 0 };
  const storiesAbove = stories.filter(s => s.elevation > wallStory.elevation + 10).length;

  const ec5Engine = (typeof window !== 'undefined' && window.Eurocode5LoadEngine)
    ? window.Eurocode5LoadEngine
    : (typeof globalThis !== 'undefined' ? globalThis.Eurocode5LoadEngine : null);
  const ec5Combos = ec5Engine && typeof ec5Engine.computeEurocode5LoadCombinations === 'function'
    ? ec5Engine.computeEurocode5LoadCombinations(null, w, mModel)
    : null;

  const baseRoofLineLoad = isExt ? 9.8 : 6.4;
  const upperStoryLineLoad = storiesAbove * (isExt ? 11.5 : 8.5);
  const openingConcentrationFactor = 1 / Math.max(0.45, 1 - openingRatio * 0.55);
  const fallbackAxial = Math.round((baseRoofLineLoad + upperStoryLineLoad) * openingConcentrationFactor * 10) / 10;
  const fallbackWind = isExt ? (h > 3000 ? 1.25 : 1.10) : 0.35;

  const qAxialLineLoad_kNm = ec5Combos ? ec5Combos.governingAxial.qAxialULS_kNm : fallbackAxial;
  const windPressure_kNm2 = ec5Combos ? ec5Combos.governingAxial.windPressure_kNm2 : fallbackWind;
  const slsWind_kNm2 = ec5Combos ? ec5Combos.characteristicActions.Wk_pressure_kNm2 : fallbackWind;
  const govKmod = ec5Combos ? ec5Combos.governingAxial.kmod : 0.8;

  const ec5Eval = evaluateWallStudCapacity({
    studWidth: c.studWidth || 38,
    studDepth: c.studDepth || 140,
    timberGrade: c.timberGrade || (isExt ? 'C24' : 'C16'),
    spacing: c.spacing || 400,
    wallHeight: h,
    qAxialLineLoad_kNm,
    windPressure_kNm2,
    slsWindPressure_kNm2: slsWind_kNm2,
    kmod: govKmod
  });

  const ndsEval = evaluateNDS2024StudCapacity({
    studWidth: c.studWidth || 38,
    studDepth: c.studDepth || 140,
    timberGrade: c.timberGrade || (isExt ? 'C24' : 'C16'),
    spacing: c.spacing || 400,
    wallHeight: h,
    qAxialLineLoad_kNm,
    windPressure_kNm2: slsWind_kNm2
  });

  const collisions = auditWallStudCollisions(w, mModel);
  const activeCollisions = collisions.filter(col => !col.fixed);

  const fullStruct = (typeof window !== 'undefined' && window.WallStructuralEngine && typeof window.WallStructuralEngine.evaluateFullWallStructure === 'function')
    ? window.WallStructuralEngine.evaluateFullWallStructure(w, mModel)
    : null;
  const rackingEval = fullStruct?.racking || (ec5Combos ? {
    ...ec5Combos.governingRacking,
    totalDemandKN: ec5Combos.governingRacking.V_Ed_kN,
    totalCapacityKN: ec5Combos.governingRacking.F_vRd_kN,
    effectivePierCount: ec5Combos.governingRacking.piers.filter(p => p.isEffective).length
  } : null);

  const warnings = [];
  const comboLabel = ec5Combos ? ec5Combos.governingAxial.shortLabel : '1.35G + 1.5Q';
  if (ec5Eval.dcPercent > 100) {
    warnings.push(`[Eurocode 5 · ${comboLabel}] Axial/bending overstressed (${ec5Eval.dcPercent}% D/C, N_Ed=${ec5Eval.N_Ed_kN} kN vs N_Rd=${ec5Eval.N_Rd_kN} kN) at ${qAxialLineLoad_kNm} kN/m ULS.`);
  } else if (ec5Eval.dcPercent > 80) {
    warnings.push(`[Eurocode 5 · ${comboLabel}] High axial/bending utilization (${ec5Eval.dcPercent}% D/C, k_mod=${govKmod}).`);
  }

  if (ndsEval.dcPercent > 100) {
    warnings.push(`[NDS 2024 ASD] Overstressed (${ndsEval.dcPercent}% D/C) per NDS Eq 3.9-2 (CP=${ndsEval.CP}, le/d=${ndsEval.le_over_d}).`);
  } else if (ndsEval.dcPercent > 80) {
    warnings.push(`[NDS 2024 ASD] High structural load utilization (${ndsEval.dcPercent}% D/C).`);
  }

  if (ec5Eval.hOverD > 21) {
    warnings.push(`Wall slenderness ratio H/d = ${ec5Eval.hOverD} (${Math.round(h)} mm height / ${c.studDepth} mm depth) exceeds recommended 21.0 limit.`);
  }
  if (maxOpeningSpan >= 1500 && (c.spacing > 400 || c.timberGrade === 'C16' || c.studDepth < 140)) {
    warnings.push(`Wide opening span (${Math.round(maxOpeningSpan)} mm) increases tributary pier stress.`);
  }
  if (activeCollisions.length > 0) {
    warnings.push(`${activeCollisions.length} O.C. stud collision(s) with openings/junctions reduce effective load distribution.`);
  }

  const rackComboLbl = rackingEval?.combinationLabel || ec5Combos?.governingRacking?.shortLabel || '1.0G_fav + 1.5W';
  if (rackingEval && rackingEval.rackingUtilPct > 100) {
    warnings.push(`[Racking Shear · ${rackComboLbl}] In-plane shear demand (${rackingEval.totalDemandKN} kN) exceeds pier resistance (${rackingEval.totalCapacityKN} kN, ${rackingEval.rackingUtilPct}% D/C).`);
  } else if (rackingEval && rackingEval.rackingUtilPct > 85) {
    warnings.push(`[Racking Shear · ${rackComboLbl}] High in-plane shear utilization (${rackingEval.rackingUtilPct}% D/C, ${rackingEval.totalDemandKN}/${rackingEval.totalCapacityKN} kN).`);
  }

  const rackDCForStatus = rackingEval && rackingEval.rackingUtilPct <= 999 ? rackingEval.rackingUtilPct : 0;
  const overallDC = Math.max(ec5Eval.dcPercent, ndsEval.dcPercent, rackDCForStatus, fullStruct?.governingUtilPct || 0);
  const curStatus = (overallDC > 100 || ec5Eval.hOverD > 24)
    ? 'FAIL'
    : (warnings.length > 0 || overallDC > 80 ? 'WARNING' : 'PASS');

  return {
    wallId: w.id,
    isExterior: isExt,
    wallLengthMm: Math.round(len),
    wallHeightMm: Math.round(h),
    maxOpeningSpanMm: Math.round(maxOpeningSpan),
    hasWarning: warnings.length > 0 || curStatus !== 'PASS',
    badges: fullStruct?.badges || { geometricallyValidated: true, structurallyVerified: curStatus !== 'FAIL', manufacturingApproved: len <= 12000 },
    loadCombinations: fullStruct?.ec5LoadCombinations || ec5Combos || null,
    axialAudit: ec5Combos?.governingAxial || null,
    rackingAudit: ec5Combos?.governingRacking || null,
    racking: rackingEval,
    headerReports: fullStruct?.headerReports || [],
    plateBearing: fullStruct?.plateBearing || null,
    fireCheck: fullStruct?.fireCheck || null,
    memberUtilizations: fullStruct?.memberUtilizations || {},
    demands: {
      wallTypeLabel: isExt ? 'Exterior Load-Bearing' : 'Interior Partition',
      wallLengthMm: Math.round(len),
      wallHeightMm: Math.round(h),
      maxOpeningSpanMm: Math.round(maxOpeningSpan),
      openingCount: openings.length,
      qAxialLineLoad_kNm: fullStruct ? fullStruct.qAxialULS_kNm : qAxialLineLoad_kNm,
      windPressure_kNm2: fullStruct ? fullStruct.windPressure_kNm2 : windPressure_kNm2,
      windChar_kNm2: slsWind_kNm2,
      governingComboLabel: comboLabel,
      governingComboFormula: ec5Combos?.governingAxial?.formula || '1.35G + 1.5Q'
    },
    current: {
      studWidth: c.studWidth,
      studDepth: c.studDepth,
      timberGrade: c.timberGrade,
      spacing: Math.round(c.spacing),
      sectionLabel: `${c.studWidth} × ${c.studDepth} mm ${c.timberGrade} @ ${Math.round(c.spacing)} mm O.C.`,
      status: curStatus,
      ec5: ec5Eval,
      nds: ndsEval,
      utilizationPct: overallDC,
      dcPercent: overallDC,
      axialForcePerStud_kN: ec5Eval.N_Ed_kN,
      axialCapacityPerStud_kN: ec5Eval.N_Rd_kN,
      pureAxialDC_pct: ec5Eval.axialDC_pct,
      slendernessDepth: ec5Eval.hOverD,
      hOverD: ec5Eval.hOverD,
      deflection_mm: ec5Eval.defl_mm,
      defl_mm: ec5Eval.defl_mm,
      deflectionLimit_mm: ec5Eval.deflLimit
    },
    activeCollisionsCount: activeCollisions.length,
    warnings
  };
}

function suggestOptimalWallFraming(w, customModel) {
  return auditWallStructuralWarning(w, customModel);
}

function applyWallFramingSuggestion(w, suggestion, customModel) {
  if (!w || w.type !== 'wall') return false;
  if (typeof window !== 'undefined' && window.WallStructuralEngine && typeof window.WallStructuralEngine.autoDesignWallFraming === 'function') {
    const res = window.WallStructuralEngine.autoDesignWallFraming(w, customModel);
    return Boolean(res && res.applied);
  }
  return false;
}

function auditAllStructuralWarnings(customModel) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const walls = orderStoryWallsAndOpenings(
    (mModel?.elements || []).filter(e => e.type === 'wall' && construction(e).enabled),
    mModel
  ).orderedWalls;
  const wallAudits = walls.map(w => auditWallStructuralWarning(w, mModel)).filter(Boolean);
  const warningCount = wallAudits.filter(wa => wa.hasWarning || wa.current?.status !== 'PASS').length;
  const failCount = wallAudits.filter(wa => wa.current?.status === 'FAIL').length;
  return {
    walls,
    wallAudits,
    warningCount,
    failCount
  };
}

function orderStoryWallsAndOpenings(walls, customModel, customIsExtFn) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const isExtCheck = typeof customIsExtFn === 'function'
    ? customIsExtFn
    : (w => (typeof isExteriorWall === 'function' ? isExteriorWall(w) : (w?.layer === 'Exterior Walls' || w?.isExterior === true || w?.isExternal === true)));

  if (!Array.isArray(walls) || !walls.length) {
    return {
      orderedWalls: [],
      extWalls: [],
      intWalls: [],
      map: new Map(),
      openingCodeMap: new Map(),
      openingRawCodeMap: new Map(),
      orderDirMap: new Map(),
      clusters: []
    };
  }

  const ptSegDist = (p, a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
    if (l2 < 1e-6) return Math.hypot(p.x - a.x, p.y - a.y);
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  };
  const wallWallDist = (w1, w2) => Math.min(
    ptSegDist(w1.a, w2.a, w2.b),
    ptSegDist(w1.b, w2.a, w2.b),
    ptSegDist(w2.a, w1.a, w1.b),
    ptSegDist(w2.b, w1.a, w1.b)
  );

  // 1. Group walls into connected building footprints/clusters (left-to-right)
  const n = walls.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const unite = (i, j) => {
    const ri = find(i), rj = find(j);
    if (ri !== rj) parent[ri] = rj;
  };
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (wallWallDist(walls[i], walls[j]) <= 800) unite(i, j);
    }
  }

  const rawGroupMap = new Map();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    if (!rawGroupMap.has(r)) rawGroupMap.set(r, []);
    rawGroupMap.get(r).push(walls[i]);
  }
  const computeBounds = wList => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const w of wList) {
      minX = Math.min(minX, w.a.x, w.b.x);
      maxX = Math.max(maxX, w.a.x, w.b.x);
      minY = Math.min(minY, w.a.y, w.b.y);
      maxY = Math.max(maxY, w.a.y, w.b.y);
    }
    return { minX, maxX, minY, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  };

  let clusters = [...rawGroupMap.values()].map(wList => ({
    walls: wList,
    ...computeBounds(wList)
  }));

  // Merge any isolated interior wall group whose midpoint lies inside a larger building cluster's footprint
  if (clusters.length > 1) {
    clusters.sort((a, b) => b.walls.length - a.walls.length);
    const merged = [];
    for (const c of clusters) {
      const host = merged.find(m =>
        c.cx >= m.minX - 600 && c.cx <= m.maxX + 600 &&
        c.cy >= m.minY - 600 && c.cy <= m.maxY + 600
      );
      if (host) {
        host.walls.push(...c.walls);
        Object.assign(host, computeBounds(host.walls));
      } else {
        merged.push(c);
      }
    }
    clusters = merged;
  }

  // Sort building clusters Left-to-Right, then Top-to-Bottom
  clusters.sort((a, b) => (Math.round(a.minX / 500) - Math.round(b.minX / 500)) || (a.minY - b.minY));

  // Helper: group collinear & touching/adjacent wall segments into continuous collinear runs
  const buildCollinearRuns = (wList, gapTol = 550) => {
    const m = wList.length;
    if (!m) return [];
    const p = Array.from({ length: m }, (_, i) => i);
    const f = i => (p[i] === i ? i : (p[i] = f(p[i])));
    const u = (i, j) => { const ri = f(i), rj = f(j); if (ri !== rj) p[ri] = rj; };

    for (let i = 0; i < m; i++) {
      const w1 = wList[i];
      const l1 = Math.hypot(w1.b.x - w1.a.x, w1.b.y - w1.a.y) || 1;
      const u1 = { x: (w1.b.x - w1.a.x) / l1, y: (w1.b.y - w1.a.y) / l1 };
      for (let j = i + 1; j < m; j++) {
        const w2 = wList[j];
        const l2 = Math.hypot(w2.b.x - w2.a.x, w2.b.y - w2.a.y) || 1;
        const u2 = { x: (w2.b.x - w2.a.x) / l2, y: (w2.b.y - w2.a.y) / l2 };
        if (Math.abs(u1.x * u2.x + u1.y * u2.y) < 0.965) continue;
        const m2 = { x: (w2.a.x + w2.b.x) / 2, y: (w2.a.y + w2.b.y) / 2 };
        const perp = Math.abs(-(m2.x - w1.a.x) * u1.y + (m2.y - w1.a.y) * u1.x);
        if (perp > 220) continue;
        const p2a = (w2.a.x - w1.a.x) * u1.x + (w2.a.y - w1.a.y) * u1.y;
        const p2b = (w2.b.x - w1.a.x) * u1.x + (w2.b.y - w1.a.y) * u1.y;
        const lo = Math.min(p2a, p2b), hi = Math.max(p2a, p2b);
        const gap = Math.max(0, lo - l1, 0 - hi);
        if (gap <= gapTol) u(i, j);
      }
    }

    const runMap = new Map();
    for (let i = 0; i < m; i++) {
      const r = f(i);
      if (!runMap.has(r)) runMap.set(r, []);
      runMap.get(r).push(wList[i]);
    }

    const runs = [];
    for (const rWalls of runMap.values()) {
      let refW = rWalls[0], maxLen = -1;
      for (const w of rWalls) {
        const wl = Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y);
        if (wl > maxLen) { maxLen = wl; refW = w; }
      }
      const refL = Math.hypot(refW.b.x - refW.a.x, refW.b.y - refW.a.y) || 1;
      const refU = { x: (refW.b.x - refW.a.x) / refL, y: (refW.b.y - refW.a.y) / refL };
      let minP = Infinity, maxP = -Infinity;
      let end0 = refW.a, end1 = refW.b;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const w of rWalls) {
        for (const pt of [w.a, w.b]) {
          const proj = (pt.x - refW.a.x) * refU.x + (pt.y - refW.a.y) * refU.y;
          if (proj < minP) { minP = proj; end0 = pt; }
          if (proj > maxP) { maxP = proj; end1 = pt; }
          minX = Math.min(minX, pt.x); maxX = Math.max(maxX, pt.x);
          minY = Math.min(minY, pt.y); maxY = Math.max(maxY, pt.y);
        }
      }
      runs.push({
        walls: rWalls,
        end0,
        end1,
        startPt: end0,
        endPt: end1,
        runMid: { x: (end0.x + end1.x) / 2, y: (end0.y + end1.y) / 2 },
        minX, maxX, minY, maxY
      });
    }
    return runs;
  };

  const extWalls = [];
  const intWalls = [];
  const orderDirMap = new Map();

  for (const cluster of clusters) {
    const cExt = cluster.walls.filter(w => isExtCheck(w));
    const cInt = cluster.walls.filter(w => !isExtCheck(w));

    // Compute stable cluster centroid
    const refSet = cExt.length ? cExt : cluster.walls;
    let wSumX = 0, wSumY = 0, wLenSum = 0;
    for (const w of refSet) {
      const wl = Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y) || 1;
      wSumX += ((w.a.x + w.b.x) / 2) * wl;
      wSumY += ((w.a.y + w.b.y) / 2) * wl;
      wLenSum += wl;
    }
    const C = {
      x: 0.5 * cluster.cx + 0.5 * (wLenSum ? wSumX / wLenSum : cluster.cx),
      y: 0.5 * cluster.cy + 0.5 * (wLenSum ? wSumY / wLenSum : cluster.cy)
    };

    // 2. Exterior walls: group collinear segments and traverse perimeter strictly CLOCKWISE from Top-Left
    if (cExt.length) {
      const extRuns = buildCollinearRuns(cExt, 600);
      for (const r of extRuns) {
        const vx = r.end1.x - r.end0.x, vy = r.end1.y - r.end0.y;
        let crossCW = (r.runMid.x - C.x) * vy - (r.runMid.y - C.y) * vx;
        if (Math.abs(crossCW) < 1) {
          crossCW = Math.abs(vx) >= Math.abs(vy)
            ? (r.runMid.y <= C.y ? vx : -vx)
            : (r.runMid.x >= C.x ? vy : -vy);
        }
        r.startPt = crossCW >= 0 ? r.end0 : r.end1;
        r.endPt = crossCW >= 0 ? r.end1 : r.end0;
      }

      const startAngle = Math.atan2(cluster.minY - C.y, cluster.minX - C.x);
      const cwAngle = pt => {
        const a = Math.atan2(pt.y - C.y, pt.x - C.x);
        return ((a - startAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      };

      const topBandTol = Math.max(600, (cluster.maxY - cluster.minY) * 0.22);
      const topHorizRuns = extRuns.filter(r =>
        Math.abs(r.end1.x - r.end0.x) >= Math.abs(r.end1.y - r.end0.y) &&
        r.minY <= cluster.minY + topBandTol
      );
      let firstRun;
      if (topHorizRuns.length) {
        topHorizRuns.sort((a, b) => (a.minX - b.minX) || (a.minY - b.minY));
        firstRun = topHorizRuns[0];
      } else {
        extRuns.sort((a, b) =>
          ((a.minY - cluster.minY) + 0.5 * (a.minX - cluster.minX)) -
          ((b.minY - cluster.minY) + 0.5 * (b.minX - cluster.minX))
        );
        firstRun = extRuns[0];
      }

      const orderedExtRuns = [];
      const visited = new Set([firstRun]);
      orderedExtRuns.push(firstRun);
      let cur = firstRun;

      while (visited.size < extRuns.length) {
        const unvisited = extRuns.filter(r => !visited.has(r));
        let bestTouch = null, bestDist = 650;
        for (const cand of unvisited) {
          const dStart = Math.hypot(cand.startPt.x - cur.endPt.x, cand.startPt.y - cur.endPt.y);
          const dEnd = Math.hypot(cand.endPt.x - cur.endPt.x, cand.endPt.y - cur.endPt.y);
          const minD = Math.min(dStart, dEnd);
          if (minD <= bestDist) {
            bestDist = minD;
            bestTouch = { cand, flip: dEnd + 50 < dStart };
          }
        }
        if (bestTouch) {
          const { cand, flip } = bestTouch;
          if (flip) {
            const tmp = cand.startPt;
            cand.startPt = cand.endPt;
            cand.endPt = tmp;
          }
          visited.add(cand);
          orderedExtRuns.push(cand);
          cur = cand;
        } else {
          const curAng = cwAngle(cur.runMid);
          unvisited.sort((a, b) => {
            const da = ((cwAngle(a.runMid) - curAng) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            const db = ((cwAngle(b.runMid) - curAng) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            return da - db;
          });
          const next = unvisited[0];
          visited.add(next);
          orderedExtRuns.push(next);
          cur = next;
        }
      }

      for (const r of orderedExtRuns) {
        const rLen = Math.hypot(r.endPt.x - r.startPt.x, r.endPt.y - r.startPt.y) || 1;
        const rDir = { x: (r.endPt.x - r.startPt.x) / rLen, y: (r.endPt.y - r.startPt.y) / rLen };
        r.walls.sort((w1, w2) => {
          const p1 = (((w1.a.x + w1.b.x) / 2) - r.startPt.x) * rDir.x + (((w1.a.y + w1.b.y) / 2) - r.startPt.y) * rDir.y;
          const p2 = (((w2.a.x + w2.b.x) / 2) - r.startPt.x) * rDir.x + (((w2.a.y + w2.b.y) / 2) - r.startPt.y) * rDir.y;
          return p1 - p2;
        });
        for (const w of r.walls) {
          orderDirMap.set(w.id, rDir);
          extWalls.push(w);
        }
      }
    }

    // 3. Interior walls: group collinear segments side-by-side and order runs Top-to-Bottom, Left-to-Right
    if (cInt.length) {
      const intRuns = buildCollinearRuns(cInt, 450);
      for (const r of intRuns) {
        const dx = r.end1.x - r.end0.x, dy = r.end1.y - r.end0.y;
        const forward = Math.abs(dx) >= Math.abs(dy)
          ? (dx > 0 || (Math.abs(dx) < 1 && dy >= 0))
          : (dy > 0 || (Math.abs(dy) < 1 && dx >= 0));
        r.startPt = forward ? r.end0 : r.end1;
        r.endPt = forward ? r.end1 : r.end0;
        const rLen = Math.hypot(r.endPt.x - r.startPt.x, r.endPt.y - r.startPt.y) || 1;
        const rDir = { x: (r.endPt.x - r.startPt.x) / rLen, y: (r.endPt.y - r.startPt.y) / rLen };
        r.walls.sort((w1, w2) => {
          const p1 = (((w1.a.x + w1.b.x) / 2) - r.startPt.x) * rDir.x + (((w1.a.y + w1.b.y) / 2) - r.startPt.y) * rDir.y;
          const p2 = (((w2.a.x + w2.b.x) / 2) - r.startPt.x) * rDir.x + (((w2.a.y + w2.b.y) / 2) - r.startPt.y) * rDir.y;
          return p1 - p2;
        });
        for (const w of r.walls) orderDirMap.set(w.id, rDir);
      }

      intRuns.sort((a, b) => {
        const bandA = Math.round(a.minY / 600), bandB = Math.round(b.minY / 600);
        if (bandA !== bandB) return bandA - bandB;
        const xBandA = Math.round(a.minX / 400), xBandB = Math.round(b.minX / 400);
        if (xBandA !== xBandB) return xBandA - xBandB;
        return (a.runMid.y - b.runMid.y) || (a.runMid.x - b.runMid.x);
      });

      for (const r of intRuns) {
        for (const w of r.walls) intWalls.push(w);
      }
    }
  }

  const map = new Map();
  extWalls.forEach((w, i) => map.set(w.id, `E${String(i + 1).padStart(2, '0')}`));
  intWalls.forEach((w, i) => map.set(w.id, `I${String(i + 1).padStart(2, '0')}`));
  const orderedWalls = [...extWalls, ...intWalls];

  // 4. Sequential Opening Numbering (W01, W02... and D01, D02...) along ordered walls
  const openingCodeMap = new Map();
  const openingRawCodeMap = new Map();
  let winCount = 1, doorCount = 1;
  const allElements = mModel?.elements || [];

  for (const w of orderedWalls) {
    const ops = allElements
      .filter(e => (e.type === 'window' || e.type === 'door') && e.host === w.id)
      .slice();
    const rDir = orderDirMap.get(w.id);
    const wVec = { x: w.b.x - w.a.x, y: w.b.y - w.a.y };
    const sameDir = !rDir || (wVec.x * rDir.x + wVec.y * rDir.y) >= -1e-6;
    ops.sort((p, q) => sameDir ? ((p.offset || 0) - (q.offset || 0)) : ((q.offset || 0) - (p.offset || 0)));

    for (const o of ops) {
      const wMm = Math.round(o.width || (o.type === 'door' ? 900 : 1200));
      const hMm = Math.round(o.height || (o.type === 'door' ? 2100 : 1200));
      const dimPairStr = (typeof window !== 'undefined' && typeof window.formatDimPair === 'function')
        ? window.formatDimPair(wMm, hMm)
        : `${wMm}×${hMm} mm`;
      if (o.type === 'door') {
        const rawCode = `D${String(doorCount++).padStart(2, '0')}`;
        openingRawCodeMap.set(o.id, rawCode);
        openingCodeMap.set(o.id, `${rawCode} (${dimPairStr})`);
      } else {
        const rawCode = `W${String(winCount++).padStart(2, '0')}`;
        openingRawCodeMap.set(o.id, rawCode);
        openingCodeMap.set(o.id, `${rawCode} (${dimPairStr})`);
      }
    }
  }

  return {
    orderedWalls,
     walls: orderedWalls,
    extWalls,
    intWalls,
    map,
    openingCodeMap,
    openingRawCodeMap,
    orderDirMap,
    clusters
  };
}

function getStoryWallCodeMap(storyId, customModel) {
  const mModel = customModel || (typeof model !== 'undefined' ? model : (typeof window !== 'undefined' ? window.model : null));
  const targetStory = storyId || (typeof activeStory !== 'undefined' ? activeStory : mModel?.stories?.[0]?.id);
  const rawWalls = (mModel?.elements || []).filter(w => w.type === 'wall' && w.story === targetStory && (typeof shown === 'function' ? shown(w) : true));
  return orderStoryWallsAndOpenings(rawWalls, mModel);
}

function getWallPanelCode(w, customModel) {
  if (!w) return 'Wall';
  const { map } = getStoryWallCodeMap(w.story, customModel);
  return map.get(w.id) || w.id;
}

function framingWall(){
  if (typeof selected !== 'undefined' && typeof selected[0] === 'string' && selected[0].includes(':STUD:')) {
    const studWallId = selected[0].split(':STUD:')[0];
    const directWall = model.elements.find(e => e.id === studWallId && e.type === 'wall');
    if (directWall) {
      if (typeof window !== 'undefined') window._activePanelWallId = directWall.id;
      return directWall;
    }
  }
  const selWall = model.elements.find(e=>e.id===selected[0]&&e.type==='wall') || hostOf(model.elements.find(e=>e.id===selected[0])||{});
  if (selWall && selWall.type === 'wall') {
    if (typeof window !== 'undefined') window._activePanelWallId = selWall.id;
    return selWall;
  }
  if (typeof window !== 'undefined' && window._activePanelWallId) {
    const remembered = model.elements.find(e => e.id === window._activePanelWallId && e.type === 'wall' && e.story === activeStory) ||
                       model.elements.find(e => e.id === window._activePanelWallId && e.type === 'wall');
    if (remembered) return remembered;
  }
  const fallback = model.elements.find(e=>e.type==='wall'&&e.story===activeStory) || model.elements.find(e=>e.type==='wall');
  if (fallback && typeof window !== 'undefined') window._activePanelWallId = fallback.id;
  return fallback;
}

function selectWallInPanelView(wallId, fitView = true) {
  const target = (model.elements || []).find(e => e.id === wallId && e.type === 'wall');
  if (!target) return;
  if (typeof window !== 'undefined') window._activePanelWallId = target.id;
  if (target.story && typeof activeStory !== 'undefined' && target.story !== activeStory) {
    activeStory = target.story;
  }
  if (fitView) {
    if (typeof pan !== 'undefined') { pan.x = 0; pan.y = 0; }
    if (typeof scale !== 'undefined') { scale = 1; }
  }
  if (typeof select === 'function') {
    select([target.id]);
  }
  const vt = document.getElementById('view-title');
  if (vt && (typeof view === 'undefined' || view === 'panel')) {
    const code = getWallPanelCode(target);
    vt.textContent = (code !== target.id ? `${code} (${target.id})` : target.id) + ' · Framing panel';
  }
  if (typeof render === 'function') render();
}

function updateWallPanelListHUD(activeWall) {
  if (typeof document === 'undefined') return;
  const canvasArea = document.getElementById('canvas-area');
  if (!canvasArea) return;

  let hud = document.getElementById('wall-panel-list-hud');
  const isPanelView = (typeof view !== 'undefined' && view === 'panel');
  if (!isPanelView) {
    if (hud) hud.classList.add('hidden');
    return;
  }

  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'wall-panel-list-hud';
    hud.setAttribute('role', 'region');
    hud.setAttribute('aria-label', 'Wall Panel Elevation Selector');
    hud.style.cssText = 'position:absolute;top:68px;left:12px;bottom:42px;width:236px;background:rgba(255,255,255,0.97);border:1px solid #cbd5e1;border-radius:8px;box-shadow:0 8px 24px rgba(15,23,42,0.12);z-index:12;display:flex;flex-direction:column;overflow:hidden;font-family:"DM Sans",system-ui,sans-serif;user-select:none;backdrop-filter:blur(6px)';
    hud.innerHTML = `
      <div id="wall-panel-list-header" style="padding:8px 10px;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:space-between;gap:6px;border-bottom:1px solid #1e293b">
        <div style="display:flex;align-items:center;gap:6px;min-width:0">
          <span style="font-size:12px">🧱</span>
          <strong style="font-size:11px;letter-spacing:0.4px;white-space:nowrap">WALL LIST</strong>
          <span id="wall-panel-list-count" style="font-size:9.5px;background:#1e293b;color:#38bdf8;padding:1px 6px;border-radius:10px;font-weight:700">0</span>
        </div>
        <div style="display:flex;align-items:center;gap:3px">
          <button id="wall-panel-prev-btn" type="button" title="Previous Wall" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;width:22px;height:20px;font-size:12px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center">‹</button>
          <button id="wall-panel-next-btn" type="button" title="Next Wall" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;width:22px;height:20px;font-size:12px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center">›</button>
          <button id="wall-panel-collapse-btn" type="button" title="Collapse / Expand Wall List" style="background:#1e293b;color:#94a3b8;border:1px solid #334155;border-radius:4px;width:22px;height:20px;font-size:10px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center">◀</button>
        </div>
      </div>
      <div id="wall-panel-list-controls" style="padding:6px 8px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;gap:4px">
        <button type="button" data-wall-filter="all" style="flex:1;padding:3px 6px;font-size:10px;font-weight:700;border-radius:4px;border:1px solid #0284c7;background:#0284c7;color:#fff;cursor:pointer">All</button>
        <button type="button" data-wall-filter="ext" style="flex:1;padding:3px 6px;font-size:10px;font-weight:700;border-radius:4px;border:1px solid #cbd5e1;background:#fff;color:#475569;cursor:pointer">Exterior (E)</button>
        <button type="button" data-wall-filter="int" style="flex:1;padding:3px 6px;font-size:10px;font-weight:700;border-radius:4px;border:1px solid #cbd5e1;background:#fff;color:#475569;cursor:pointer">Interior (I)</button>
      </div>
      <div id="wall-panel-list-items" style="flex:1;overflow-y:auto;padding:6px;display:flex;flex-direction:column;gap:4px"></div>
      <div id="wall-panel-custom-stud-bar" style="padding:7px 8px;background:#f8fafc;border-top:1px solid #cbd5e1;display:flex;flex-direction:column;gap:5px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:4px">
          <span style="font-size:9.5px;font-weight:800;color:#0f172a;letter-spacing:0.3px">➕ INSERT STUD AT COORD</span>
          <button id="wall-panel-click-insert-btn" type="button" title="Toggle click-on-panel stud placement mode" style="padding:2px 6px;font-size:9.5px;font-weight:700;border-radius:4px;border:1px solid #0284c7;background:#ffffff;color:#0284c7;cursor:pointer">🎯 Click Panel</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
          <input id="wall-panel-insert-x" type="number" step="10" placeholder="X (mm)" title="Horizontal center X along current wall panel (mm)" style="width:100%;box-sizing:border-box;padding:3px 5px;font-size:10.5px;border:1px solid #cbd5e1;border-radius:4px;background:#fff;color:#0f172a">
          <input id="wall-panel-insert-z" type="number" step="10" placeholder="Z opt (mm)" title="Optional elevation Z in mm (blank = full wall height)" style="width:100%;box-sizing:border-box;padding:3px 5px;font-size:10.5px;border:1px solid #cbd5e1;border-radius:4px;background:#fff;color:#0f172a">
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:4px">
          <label style="display:flex;align-items:center;gap:3px;font-size:9.5px;color:#475569;cursor:pointer" title="Automatically adjust to nearest collision-free spot if blocked">
            <input id="wall-panel-insert-snap" type="checkbox"> Snap valid
          </label>
          <button id="wall-panel-insert-btn" type="button" style="padding:3px 9px;font-size:10px;font-weight:700;border-radius:4px;border:1px solid #059669;background:#059669;color:#ffffff;cursor:pointer">Insert Stud</button>
        </div>
      </div>
    `;
    canvasArea.appendChild(hud);

    window._wallPanelListFilter = window._wallPanelListFilter || 'all';
    window._wallPanelListCollapsed = Boolean(window._wallPanelListCollapsed);

    const runHudCoordInsert = () => {
      const curW = framingWall();
      if (!curW) return;
      const xVal = Number(hud.querySelector('#wall-panel-insert-x')?.value);
      const zRaw = hud.querySelector('#wall-panel-insert-z')?.value;
      const zVal = (zRaw !== '' && zRaw !== null && Number.isFinite(Number(zRaw))) ? Number(zRaw) : undefined;
      const snap = Boolean(hud.querySelector('#wall-panel-insert-snap')?.checked);
      if (!Number.isFinite(xVal)) {
        if (typeof window.toast === 'function') window.toast('Enter a valid horizontal X coordinate (mm).');
        return;
      }
      const probeRes = insertCustomStudAtCoordinate({ x: xVal, z: zVal }, { wall: curW, snapToValid: snap, dryRun: true }, typeof model !== 'undefined' ? model : undefined);
      if (!probeRes.ok) {
        if (typeof window.toast === 'function') window.toast(`Constraint: ${probeRes.reason}`);
        return;
      }
      const applyFn = () => {
        const res = insertCustomStudAtCoordinate({ x: xVal, z: zVal }, { wall: curW, snapToValid: snap }, typeof model !== 'undefined' ? model : undefined);
        if (res.ok && res.studId && typeof selected !== 'undefined') selected = [res.studId];
        return res;
      };
      let committedRes = null;
      if (typeof commit === 'function') {
        commit(() => { committedRes = applyFn(); });
      } else {
        committedRes = applyFn();
        if (typeof render === 'function') render();
      }
      if (committedRes?.ok && typeof window.toast === 'function') {
        window.toast(`Inserted custom stud at X=${Math.round(committedRes.x0)}–${Math.round(committedRes.x1)} mm, Z=${Math.round(committedRes.z0)}–${Math.round(committedRes.z1)} mm`);
      }
    };

    hud.querySelector('#wall-panel-insert-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      runHudCoordInsert();
    });
    hud.querySelector('#wall-panel-click-insert-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      window._wallPanelInsertStudMode = !window._wallPanelInsertStudMode;
      if (typeof window.toolState === 'function') window.toolState();
      updateWallPanelListHUD(framingWall());
      if (typeof window.toast === 'function') {
        window.toast(window._wallPanelInsertStudMode
          ? 'Click anywhere on the Wall Panel to insert a custom stud at that coordinate (Esc to cancel).'
          : 'Wall Panel stud placement mode cancelled.');
      }
    });

    hud.querySelectorAll('[data-wall-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window._wallPanelListFilter = btn.getAttribute('data-wall-filter') || 'all';
        updateWallPanelListHUD(framingWall());
      });
    });

    const collapseBtn = hud.querySelector('#wall-panel-collapse-btn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window._wallPanelListCollapsed = !window._wallPanelListCollapsed;
        updateWallPanelListHUD(framingWall());
        if (typeof render === 'function') render();
      });
    }

    const stepWall = (dir) => {
      const { walls, map } = getStoryWallCodeMap();
      const filter = window._wallPanelListFilter || 'all';
      const ordered = [
        ...walls.filter(w => (map.get(w.id) || '').startsWith('E')),
        ...walls.filter(w => !(map.get(w.id) || '').startsWith('E'))
      ].filter(w => {
        const code = map.get(w.id) || '';
        if (filter === 'ext') return code.startsWith('E');
        if (filter === 'int') return code.startsWith('I');
        return true;
      });
      if (!ordered.length) return;
      const cur = framingWall();
      const idx = ordered.findIndex(w => w.id === cur?.id);
      const nextIdx = idx < 0 ? 0 : (idx + dir + ordered.length) % ordered.length;
      selectWallInPanelView(ordered[nextIdx].id, true);
    };

    hud.querySelector('#wall-panel-prev-btn')?.addEventListener('click', (e) => { e.stopPropagation(); stepWall(-1); });
    hud.querySelector('#wall-panel-next-btn')?.addEventListener('click', (e) => { e.stopPropagation(); stepWall(1); });
  }

  hud.classList.remove('hidden');

  const clickInsertBtn = hud.querySelector('#wall-panel-click-insert-btn');
  if (clickInsertBtn) {
    const activeIns = Boolean(typeof window !== 'undefined' && window._wallPanelInsertStudMode);
    clickInsertBtn.style.background = activeIns ? '#0284c7' : '#ffffff';
    clickInsertBtn.style.color = activeIns ? '#ffffff' : '#0284c7';
  }

  const collapsed = Boolean(window._wallPanelListCollapsed);
  const controlsEl = hud.querySelector('#wall-panel-list-controls');
  const itemsEl = hud.querySelector('#wall-panel-list-items');
  const customStudBarEl = hud.querySelector('#wall-panel-custom-stud-bar');
  const collapseBtn = hud.querySelector('#wall-panel-collapse-btn');
  if (collapsed) {
    hud.style.bottom = 'auto';
    hud.style.width = '196px';
    if (controlsEl) controlsEl.style.display = 'none';
    if (itemsEl) itemsEl.style.display = 'none';
    if (customStudBarEl) customStudBarEl.style.display = 'none';
    if (collapseBtn) collapseBtn.textContent = '▶';
    return;
  } else {
    hud.style.bottom = '42px';
    hud.style.width = '236px';
    if (controlsEl) controlsEl.style.display = 'flex';
    if (itemsEl) itemsEl.style.display = 'flex';
    if (customStudBarEl) customStudBarEl.style.display = 'flex';
    if (collapseBtn) collapseBtn.textContent = '◀';
  }

  const filter = window._wallPanelListFilter || 'all';
  hud.querySelectorAll('[data-wall-filter]').forEach(btn => {
    const active = btn.getAttribute('data-wall-filter') === filter;
    btn.style.background = active ? '#0284c7' : '#ffffff';
    btn.style.color = active ? '#ffffff' : '#475569';
    btn.style.borderColor = active ? '#0284c7' : '#cbd5e1';
  });

  const curWall = activeWall || framingWall();
  const { map, extWalls, intWalls } = getStoryWallCodeMap(curWall?.story);
  const orderedWalls = [...extWalls, ...intWalls];
  const filteredWalls = orderedWalls.filter(w => {
    const code = map.get(w.id) || '';
    if (filter === 'ext') return code.startsWith('E');
    if (filter === 'int') return code.startsWith('I');
    return true;
  });

  const countBadge = hud.querySelector('#wall-panel-list-count');
  if (countBadge) countBadge.textContent = `${filteredWalls.length}`;

  if (!itemsEl) return;
  const fmtLen = (mm) => (typeof window !== 'undefined' && typeof window.formatLength === 'function')
    ? window.formatLength(mm)
    : `${Math.round(mm)} mm`;

  const stateKey = [
    curWall?.id || '',
    filter,
    typeof window !== 'undefined' ? window.appUnits : 'mm',
    ...filteredWalls.map(w => `${w.id}:${Math.round(distance(w.a, w.b))}:${Math.round(heightOf(w))}:${(hosted(w) || []).length}`)
  ].join('|');

  if (itemsEl.getAttribute('data-render-key') !== stateKey) {
    itemsEl.setAttribute('data-render-key', stateKey);
    itemsEl.innerHTML = filteredWalls.map(w => {
      const code = map.get(w.id) || w.id;
      const isExt = code.startsWith('E');
      const isSel = curWall && w.id === curWall.id;
      const wLen = distance(w.a, w.b);
      const wH = heightOf(w);
      const ops = typeof hosted === 'function' ? hosted(w) : [];
      const winCnt = ops.filter(o => o.type === 'window').length;
      const doorCnt = ops.filter(o => o.type === 'door').length;
      const opBadge = (winCnt || doorCnt)
        ? `<span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;background:${isSel ? '#0369a1' : '#f1f5f9'};color:${isSel ? '#e0f2fe' : '#475569'}">${winCnt ? `${winCnt}W` : ''}${winCnt && doorCnt ? '·' : ''}${doorCnt ? `${doorCnt}D` : ''}</span>`
        : '';
      const badgeBg = isSel ? '#0284c7' : (isExt ? '#fef3c7' : '#e2e8f0');
      const badgeColor = isSel ? '#ffffff' : (isExt ? '#b45309' : '#334155');
      const badgeBorder = isSel ? '#0369a1' : (isExt ? '#fcd34d' : '#cbd5e1');

      return `
        <button type="button" data-panel-wall-id="${w.id}" style="display:flex;align-items:center;justify-content:space-between;gap:6px;width:100%;text-align:left;padding:6px 8px;border-radius:6px;border:1.5px solid ${isSel ? '#0284c7' : '#e2e8f0'};background:${isSel ? '#e0f2fe' : '#ffffff'};cursor:pointer;transition:all 0.12s ease;box-shadow:${isSel ? '0 2px 6px rgba(2,132,199,0.18)' : 'none'}">
          <div style="display:flex;align-items:center;gap:7px;min-width:0">
            <span style="font-size:10.5px;font-weight:800;padding:2px 6px;border-radius:4px;background:${badgeBg};color:${badgeColor};border:1px solid ${badgeBorder};min-width:32px;text-align:center">${code}</span>
            <div style="display:flex;flex-direction:column;min-width:0">
              <span style="font-size:11px;font-weight:${isSel ? '800' : '600'};color:${isSel ? '#0c4a6e' : '#1e293b'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${code !== w.id ? `${code} · ${w.id}` : w.id}</span>
              <span style="font-size:9.5px;color:${isSel ? '#0369a1' : '#64748b'};white-space:nowrap">${fmtLen(wLen)} × ${fmtLen(wH)}</span>
            </div>
          </div>
          ${opBadge}
        </button>
      `;
    }).join('');

    itemsEl.querySelectorAll('[data-panel-wall-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wId = btn.getAttribute('data-panel-wall-id');
        if (wId) selectWallInPanelView(wId, true);
      });
    });

    const activeBtn = curWall ? itemsEl.querySelector(`[data-panel-wall-id="${curWall.id}"]`) : null;
    if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
      activeBtn.scrollIntoView({ block: 'nearest' });
    }
  }
}

function framingMemberWorld(w,m){const u=sub2(w.b,w.a),len=distance(w.a,w.b)||1,n={x:-u.y/len,y:u.x/len},core=coreGeometry(w),offset=referenceOffset(w)+core.center*(w.flipped?-1:1)+(m.lateralOffset||0),center=x=>({x:w.a.x+u.x*x/len+n.x*offset,y:w.a.y+u.y*x/len+n.y*offset}),a=center(m.x0),b=center(m.x1),half=m.depth/2;return [{x:a.x+n.x*half,y:a.y+n.y*half},{x:b.x+n.x*half,y:b.y+n.y*half},{x:b.x-n.x*half,y:b.y-n.y*half},{x:a.x-n.x*half,y:a.y-n.y*half}]}
function drawWallPanel(){
  const w=framingWall();
  updateWallPanelListHUD(w);
  if(!w){label('Select a wall to inspect its framing.',width/2,height/2,14);return}
  const wallCode = getWallPanelCode(w);
  const vt = typeof document !== 'undefined' ? document.getElementById('view-title') : null;
  if (vt && (typeof view === 'undefined' || view === 'panel')) {
    vt.textContent = (wallCode !== w.id ? `${wallCode} (${w.id})` : w.id) + ' · Framing panel';
  }
  const ts=typeof getTextScale==='function'?getTextScale():1.0;
  const listOffsetLeft = (typeof window !== 'undefined' && !window._wallPanelListCollapsed && width > 640) ? 252 : 0;
  const availWidth = Math.max(260, width - listOffsetLeft);
  const centerX = listOffsetLeft + availWidth / 2;
  const layout=generateWallFraming(w),audit=auditWallFraming(w),len=distance(w.a,w.b),h=heightOf(w);
  const gable = layout.gableProfile || (typeof computeWallRoofGableProfile === 'function' ? computeWallRoofGableProfile(w) : null);
  const totalWallH = (gable && gable.peakRise > 20) ? (h + gable.peakRise) : h;
  const cWall = construction(w);
  const studDepth = Math.max(50, Number(cWall?.studDepth || w.framing?.studDepth || w.thickness || (isWallExtFlag(w) ? 140 : 89)));
  const s=Math.min(Math.max(180,availWidth-230)/(len+studDepth),Math.max(180,height-295)/(totalWallH+studDepth))*scale;
  const totalHorizSpan = (len + studDepth) * s + 76;
  const ox=centerX-totalHorizSpan/2+pan.x,oy=height/2+totalWallH*s/2+pan.y-52;
  const isExtWall = isWallExtFlag(w);
  const side = window.getWallSheathingSide ? window.getWallSheathingSide(w) : (w.sheathingSide || (w.sheathingFlipped ? 'interior' : 'exterior'));
  const osbEnabled = $('#wall-osb-toggle')?.checked !== false;
  const osbApplied = Boolean(osbEnabled && isExtWall && side !== 'none');

  // Compute stud framing horizontal bounds [studMinX, studMaxX] (excluding sheathing overhang)
  let studMinX = Infinity, studMaxX = -Infinity;
  for (const m of layout.members) {
    if (/stud|king|jack|corner|junction|break|trimmer|cripple/i.test(m.type) &&
        !/plate|header|sill|block|noggin/i.test(m.type) &&
        m.role !== 'Horizontal backing' &&
        Number.isFinite(m.x0) && Number.isFinite(m.x1)) {
      const a = Math.min(m.x0, m.x1);
      const b = Math.max(m.x0, m.x1);
      if (a < studMinX) studMinX = a;
      if (b > studMaxX) studMaxX = b;
    }
  }
  if (!Number.isFinite(studMinX) || !Number.isFinite(studMaxX) || studMaxX <= studMinX) {
    studMinX = 0;
    studMaxX = len;
  } else {
    studMinX = Math.max(0, Math.round(studMinX));
    studMaxX = Math.min(Math.round(len), Math.round(studMaxX));
  }
  const studSpan = Math.max(1, studMaxX - studMinX);

  const bgFill = !osbApplied ? '#fbfcf8' : (side === 'both' ? '#faf5ff' : (side === 'interior' ? '#f0f7ff' : '#fffdf5'));
  rect(ox + studMinX * s, oy - h * s, studSpan * s, h * s, bgFill, null, 0);
  if (gable && gable.peakRise > 20) {
    const gBaseH = gable.eaveHeight || h;
    const gPts = Array.isArray(gable.profilePoints) && gable.profilePoints.length >= 2
      ? gable.profilePoints
      : [{ x: studMinX, rise: gable.riseAt(studMinX) }, { x: gable.peakX, rise: gable.peakRise }, { x: studMaxX, rise: gable.riseAt(studMaxX) }];
    const gPolyPts = [{ x: ox + studMinX * s, y: oy - gBaseH * s }];
    gPolyPts.push({ x: ox + studMinX * s, y: oy - (gBaseH + gable.riseAt(studMinX)) * s });
    for (const gp of gPts) {
      if (gp.x > studMinX + 1 && gp.x < studMaxX - 1) gPolyPts.push({ x: ox + gp.x * s, y: oy - (gBaseH + gp.rise) * s });
    }
    gPolyPts.push({ x: ox + studMaxX * s, y: oy - (gBaseH + gable.riseAt(studMaxX)) * s });
    gPolyPts.push({ x: ox + studMaxX * s, y: oy - gBaseH * s });
    poly(gPolyPts, bgFill, '#94a3b866', 0.8);
  }

  const sheetW = 1220, sheetH = 2440;
  const isInt = side === 'interior';
  const isDouble = side === 'both';
  const strokeC = isDouble ? '#9333ea' : (isInt ? '#0284c7' : '#c2410c');
  const fillC = isDouble ? '#f3e8ff' : (isInt ? '#e0f2fe' : '#fef3c7');
  const jointC = isDouble ? '#7e22ce' : (isInt ? '#1d4ed8' : '#b45309');

  const vStudCenters = [...new Set(
    layout.members
      .filter(m => !['Top plate','Bottom plate','Header','Sill','Header stud','Upper cripple','Lower cripple','Block','Blocking','Beam','Gable stud','Rake plate'].includes(m.type) &&
                   !/plate|header|sill|cripple|block|noggin|beam|lintel|gable/i.test(m.type) &&
                   m.role !== 'Horizontal backing' &&
                   Number.isFinite(m.x0) && Number.isFinite(m.x1))
      .map(m => Math.round(((m.x0 + m.x1) / 2) * 10) / 10)
  )].sort((a, b) => a - b);

  // Horizontal blocking stud centers: horizontal sheathing joints stop at the center of blocking studs
  const hBlockCenters = [...new Set(
    layout.members
      .filter(m => (/^Block$|^Blocking$|^T-junction blocking$/i.test(m.type) || /noggin|block/i.test(m.type) || m.role === 'Horizontal backing') &&
                   Number.isFinite(m.z0) && Number.isFinite(m.z1))
      .map(m => Math.round(((m.z0 + m.z1) / 2) * 10) / 10)
  )].sort((a, b) => a - b);

  const xBreaks = [0];
  let curX = 0;
  while (len - curX > sheetW + 20) {
    const cands = vStudCenters.filter(sc => sc > curX + 100 && sc <= curX + sheetW + 20 && sc < len - 100);
    const nextX = cands.length ? cands[cands.length - 1] : vStudCenters.find(sc => sc > curX + 100 && sc < len - 100);
    if (!Number.isFinite(nextX) || nextX <= curX + 40) break;
    xBreaks.push(nextX);
    curX = nextX;
  }
  xBreaks.push(len);

  const zBreaks = [0];
  let curZ = 0;
  while (h - curZ > sheetH + 20 || (curZ === 0 && h > 1800 && hBlockCenters.some(bz => bz >= 1800 && bz <= sheetH + 40 && bz < h - 60))) {
    const cands = hBlockCenters.filter(bz => bz > curZ + 200 && bz <= curZ + sheetH + 40 && bz < h - 60);
    const nextZ = cands.length ? cands[cands.length - 1] : (h - curZ > sheetH + 20 ? curZ + sheetH : null);
    if (!Number.isFinite(nextZ) || nextZ <= curZ + 40) break;
    zBreaks.push(nextZ);
    curZ = nextZ;
  }
  zBreaks.push(h);

  if (osbApplied) {
    // Render OSB panel background fills first (under framing members, no solid border stroke)
    for (let i = 0; i + 1 < xBreaks.length; i++) {
      const sx = xBreaks[i], sw = xBreaks[i + 1] - sx;
      if (sw < 1) continue;
      for (let j = 0; j + 1 < zBreaks.length; j++) {
        const sz = zBreaks[j], sh = zBreaks[j + 1] - sz;
        if (sh < 1) continue;
        const px0 = ox + sx * s, py0 = oy - (sz + sh) * s, pw = sw * s, ph = sh * s;
        rect(px0, py0, pw, ph, fillC, null, 0);
      }
    }
    if (gable && gable.peakRise > 20) {
      const gBaseH = gable.eaveHeight || h;
      const gPts = Array.isArray(gable.profilePoints) && gable.profilePoints.length >= 2
        ? gable.profilePoints
        : [{ x: studMinX, rise: gable.riseAt(studMinX) }, { x: gable.peakX, rise: gable.peakRise }, { x: studMaxX, rise: gable.riseAt(studMaxX) }];
      const gPolyPts = [{ x: ox + studMinX * s, y: oy - gBaseH * s }];
      gPolyPts.push({ x: ox + studMinX * s, y: oy - (gBaseH + gable.riseAt(studMinX)) * s });
      for (const gp of gPts) {
        if (gp.x > studMinX + 1 && gp.x < studMaxX - 1) gPolyPts.push({ x: ox + gp.x * s, y: oy - (gBaseH + gp.rise) * s });
      }
      gPolyPts.push({ x: ox + studMaxX * s, y: oy - (gBaseH + gable.riseAt(studMaxX)) * s });
      gPolyPts.push({ x: ox + studMaxX * s, y: oy - gBaseH * s });
      poly(gPolyPts, fillC, null, 0);
    }
  }

  // OSB Sheathing Face Badge
  const osbThickLbl = (typeof window !== 'undefined' && window.appUnits === 'ft-in') ? '1/2"' : '12mm';
  const badgeLabel = !osbApplied
    ? 'SHEATHING: NONE (UNSHEATHED FRAME)'
    : (side === 'both'
      ? `OSB SHEATHING: BOTH SIDES (DOUBLE 2x${osbThickLbl})`
      : (side === 'interior'
        ? `OSB SHEATHING: INTERIOR FACE - FLIPPED (${osbThickLbl})`
        : `OSB SHEATHING: EXTERIOR FACE (${osbThickLbl})`));
  const badgeBg = !osbApplied ? '#f1f5f9' : (side === 'both' ? '#faf5ff' : (side === 'interior' ? '#eff6ff' : '#fff7ed'));
  const badgeBorder = !osbApplied ? '#cbd5e1' : (side === 'both' ? '#c084fc' : (side === 'interior' ? '#93c5fd' : '#fdba74'));
  const badgeTxtC = !osbApplied ? '#64748b' : (side === 'both' ? '#7e22ce' : (side === 'interior' ? '#1e40af' : '#c2410c'));
  const bw = badgeLabel.length * 6.2 + 18;
  rect(ox + studMinX * s + 6, oy - h * s + 8, bw, 18, badgeBg, badgeBorder, 1.2);
  label(`⚡ ${badgeLabel}`, ox + studMinX * s + 6 + bw / 2, oy - h * s + 17, 7.5, badgeTxtC, 'center');
  if (gable && gable.peakRise > 20) {
    const peakMm = Math.round(h + gable.peakRise);
    const peakFmt = typeof window.formatLength === 'function' ? window.formatLength(peakMm) : `${peakMm} mm`;
    const gTxt = `GABLE WALL UNDER ROOF · ${gable.pitchDeg}° PITCH · PEAK ${peakFmt}`;
    const gBw = gTxt.length * 5.8 + 18;
    const gPeakScreenX = ox + gable.peakX * s;
    const gPeakScreenY = oy - (h + gable.peakRise) * s;
    rect(gPeakScreenX - gBw / 2, gPeakScreenY - 24, gBw, 17, '#0f172a', '#0ea5e9', 1.2);
    label(gTxt, gPeakScreenX, gPeakScreenY - 15.5, 7.2, '#38bdf8', 'center');
  }
  
  // Diagonal squaring check line across stud framing bounds (Matching factory framing jigs)
  const diagMm = Math.round(Math.hypot(studSpan, h));
  const diagLbl = typeof window.formatLength === 'function' ? window.formatLength(diagMm) : `${diagMm} mm`;

  // Collect Very Top Plate segments (unclipped so they can extend outside the panel like in 3D)
  const isVeryTopMember = m => Boolean(
    m && /plate/i.test(m.type) && !m.isRakePlate && (
      m.role === 'Very top plate' ||
      /very\s*top/i.test(m.type) ||
      /very\s*top/i.test(m.role || '') ||
      (m.plateIndex === 0 && /^Top plate$/i.test(m.type)) ||
      (/^Top plate$/i.test(m.type) && Math.abs(Math.max(m.z0, m.z1) - h) <= 2)
    )
  );
  const vtPlates = layout.members
    .filter(m => isVeryTopMember(m) && Number.isFinite(m.x0) && Number.isFinite(m.x1) && Math.abs(m.x1 - m.x0) >= 1)
    .map(m => ({ ...m, x0: Math.min(m.x0, m.x1), x1: Math.max(m.x0, m.x1) }))
    .sort((a, b) => a.x0 - b.x0);
  const vtMinX = vtPlates.length ? Math.min(...vtPlates.map(m => m.x0)) : studMinX;
  const vtMaxX = vtPlates.length ? Math.max(...vtPlates.map(m => m.x1)) : studMaxX;

  // Wall Members (with per-stud click hit boxes, drag handle badge, and selection highlight)
  if (typeof window !== 'undefined') {
    window._wallPanelTransform = { wallId: w.id, ox, oy, s, len, h, studMinX, studMaxX };
  }
  const panelStudHits = [];
  let selectedPanelStudMember = null;
  for(const m of layout.members){
    if (m.isRakePlate && Number.isFinite(m.slopeZ0) && Number.isFinite(m.slopeZ1)) {
      const rThk = m.rakeVertThk || ((cWall.plateThickness || 38) * (cWall.topPlates || 2));
      const pts = Array.isArray(m.profileXZ) && m.profileXZ.length >= 3
        ? m.profileXZ.map(pt => ({ x: ox + pt.x * s, y: oy - pt.z * s }))
        : [
            { x: ox + m.x0 * s, y: oy - m.slopeZ0 * s },
            { x: ox + m.x1 * s, y: oy - m.slopeZ1 * s },
            { x: ox + m.x1 * s, y: oy - (m.slopeBotZ1 ?? (m.slopeZ1 - rThk)) * s },
            { x: ox + m.x0 * s, y: oy - (m.slopeBotZ0 ?? (m.slopeZ0 - rThk)) * s }
          ];
      poly(pts, '#d97706', '#78350f', 0.9);
      continue;
    }
    const isVT = isVeryTopMember(m);
    const isPlateM = /plate/i.test(m.type) && !isVT;
    const mx0 = isPlateM ? Math.max(studMinX, m.x0) : m.x0;
    const mx1 = isPlateM ? Math.min(studMaxX, m.x1) : m.x1;
    if (mx1 <= mx0 + 0.5) continue;
    const isSelStud = typeof selected !== 'undefined' && Array.isArray(selected) && selected.includes(m.id);
    if (isSelStud) selectedPanelStudMember = m;
    const isEndCripple = (m.type.includes('cripple') && (hosted(w).some(o => Math.abs(m.x0 - (o.offset - o.width/2)) < 2 || Math.abs(m.x1 - (o.offset + o.width/2)) < 2)));
    const matType = m.framingMaterial || 'dimensional';
    const baseColor = isSelStud ? '#38bdf8' : m.collision ? '#800000' : m.locked ? '#0f766e' : m.customSize ? '#a855f7' : m.isGableStud ? '#0ea5e9' : m.shifted ? '#22c55e' : m.type === 'Header' ? '#b99969' : m.type === 'Jack stud' ? '#e05600' : isEndCripple ? '#f97316' : m.type.includes('junction') || m.type === 'Corner pack' ? '#86977b' : m.type === 'King stud' ? '#a79975' : isVT ? '#e6b87d' : m.type === 'Top plate' ? '#a47449' : '#d1be93';
    const color = isSelStud ? '#38bdf8' : (matType === 'lvl' ? '#ea580c' : matType === 'ijoist' ? '#e6a648' : baseColor);
    const rx = ox + mx0 * s, ry = oy - m.z1 * s, rw = (mx1 - mx0) * s, rh = (m.z1 - m.z0) * s;
    const studStroke = isSelStud ? '#0284c7' : (m.collision ? '#450a0a' : m.locked ? '#047857' : matType === 'lvl' ? '#7c2d12' : matType === 'ijoist' ? '#78350f' : '#8c84654f');
    const studLw = isSelStud ? 2.4 : (m.collision || m.locked ? 1.8 : .75);
    if (m.isGableStud && Number.isFinite(m.bevelZ0) && Number.isFinite(m.bevelZ1)) {
      const bPts = [
        { x: ox + mx0 * s, y: oy - m.z0 * s },
        { x: ox + mx1 * s, y: oy - m.z0 * s },
        { x: ox + mx1 * s, y: oy - m.bevelZ1 * s }
      ];
      if (Number.isFinite(m.bevelZPeak) && Number.isFinite(m.bevelPeakX) && m.bevelPeakX > mx0 + 0.5 && m.bevelPeakX < mx1 - 0.5) {
        bPts.push({ x: ox + m.bevelPeakX * s, y: oy - m.bevelZPeak * s });
      }
      bPts.push({ x: ox + mx0 * s, y: oy - m.bevelZ0 * s });
      poly(bPts, color, studStroke, studLw);
    } else {
      rect(rx, ry, rw, rh, color, studStroke, studLw);
    }
    if (matType === 'ijoist' && rw > 3 && rh > 3) {
      if (m.isStud) {
        rect(rx + rw * 0.3, ry, Math.max(1.5, rw * 0.4), rh, '#78461a', null, 0);
      } else {
        rect(rx, ry + rh * 0.25, rw, Math.max(1.5, rh * 0.5), '#78461a', null, 0);
      }
    } else if (matType === 'lvl' && rw > 3 && rh > 3) {
      if (m.isStud) {
        line({ x: rx + rw * 0.5, y: ry }, { x: rx + rw * 0.5, y: ry + rh }, '#431407', 0.85, [4, 2]);
      } else {
        line({ x: rx, y: ry + rh * 0.5 }, { x: rx + rw, y: ry + rh * 0.5 }, '#431407', 0.85, [4, 2]);
      }
    }
    if (m.isStud) {
      panelStudHits.push({ id: m.id, wallId: w.id, member: m, x0: rx, y0: ry, x1: rx + rw, y1: ry + rh, zone: 'elevation' });
    }
  }
  if (selectedPanelStudMember) {
    const sm = selectedPanelStudMember;
    const sMidX = ox + ((sm.x0 + sm.x1) / 2) * s;
    const sMidY = oy - ((sm.z0 + sm.z1) / 2) * s;
    const posStr = (typeof window !== 'undefined' && typeof window.formatLength === 'function')
      ? window.formatLength(Math.round(sm.x0))
      : `${Math.round(sm.x0)} mm`;
    const badgeTxt = `${sm.locked ? '🔒 ' : ''}◀ ${sm.type}: ${posStr} ▶`;
    const bW = Math.max(64, badgeTxt.length * 5.2 + 12);
    rect(sMidX - bW / 2, sMidY - 10, bW, 18, '#0284c7', '#ffffff', 1.2);
    label(badgeTxt, sMidX, sMidY - 1, 7.2, '#ffffff', 'center');
  }
  if (typeof window !== 'undefined') window._wallPanelStudHits = panelStudHits;

  // Render OSB sheathing hidden lines OVER framing members with very low hairline thickness
  if (osbApplied) {
    for (let i = 0; i + 1 < xBreaks.length; i++) {
      const sx = xBreaks[i], sw = xBreaks[i + 1] - sx;
      if (sw < 1) continue;
      for (let j = 0; j + 1 < zBreaks.length; j++) {
        const sz = zBreaks[j], sh = zBreaks[j + 1] - sz;
        if (sh < 1) continue;
        const px0 = ox + sx * s, py0 = oy - (sz + sh) * s, pw = sw * s, ph = sh * s;

        // Sheathing panel perimeter hidden dashed line (very low thickness)
        ctx.save();
        ctx.strokeStyle = strokeC;
        ctx.lineWidth = 0.45;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(px0 + 0.5, py0 + 0.5, pw - 1, ph - 1);

        // Diagonal sheathing texture hidden line (very low thickness)
        line({ x: px0, y: py0 + ph }, { x: px0 + pw, y: py0 }, strokeC, 0.35, [3, 3]);
        ctx.restore();
      }

      // Vertical stud sheet joint hidden line (stops at center of vertical stud)
      if (i > 0) {
        const jx = ox + sx * s;
        line({ x: jx, y: oy }, { x: jx, y: oy - h * s }, jointC, 0.55, [6, 4]);
      }
    }

    // Horizontal OSB sheet joint hidden lines (stops at center of horizontal blocking studs)
    for (let j = 1; j + 1 < zBreaks.length; j++) {
      const sz = zBreaks[j];
      const jy = oy - sz * s;
      line({ x: ox, y: jy }, { x: ox + len * s, y: jy }, jointC, 0.6, [6, 4]);
      const szLbl = typeof window.formatLength === 'function' ? window.formatLength(sz) : `${Math.round(sz)} mm`;
      label(`OSB HORIZONTAL JOINT @ ${szLbl} (HIDDEN LINE)`, ox + len * s - 8, jy - 5, 6.5, jointC, 'right');
    }

    // Nailing / Fastener schedule hidden lines along studs (150 mm edge / 300 mm field pattern)
    for (const sc of vStudCenters) {
      const jx = ox + sc * s;
      line({ x: jx, y: oy - 6 }, { x: jx, y: oy - h * s + 6 }, strokeC, 0.25, [2, 4]);
    }
  }

  // Squaring diagonal line & text parallel to the line across stud bounds (no background box)
  const sqX0 = ox + studMinX * s, sqX1 = ox + studMaxX * s;
  line({x: sqX0, y: oy}, {x: sqX1, y: oy - h * s}, '#3b82f6', 0.65, [5, 4]);
  const midDiagX = (sqX0 + sqX1) / 2, midDiagY = oy - (h * s) / 2;
  const diagAngRad = -Math.atan2(h * s, studSpan * s);
  ctx.save();
  ctx.translate(midDiagX, midDiagY);
  ctx.rotate(diagAngRad);
  label(`SQUARING: ${diagLbl}`, 0, -5, 7.5, '#1d4ed8', 'center');
  ctx.restore();


  // Openings
  const wallOpenings = hosted(w);
  for(const o of wallOpenings){
    ctx.setLineDash([3,3]);
    rect(ox+(o.offset-o.width/2)*s,oy-(o.sill+o.height)*s,o.width*s,o.height*s,null,'#91a491',.7);
    ctx.setLineDash([]);
    label(o.id,ox+o.offset*s,oy-(o.sill+o.height/2)*s,8.5,'#8e9d87');
  }

  // Member Mark Labels (A, B, C, ..., O) on all framing members without overlapping
  if (typeof window !== 'undefined' && typeof window.computePanelMemberMarks === 'function') {
    const Xc = x => ox + x * s;
    const Zc = z => oy - z * s;
    const marks = window.computePanelMemberMarks(layout.members, null, len, h, wallOpenings, Xc, Zc, s, Math.min(1.2, ts * 1.1));
    for (const pm of marks) {
      if (pm.backing) {
        const bw = Math.max(10, (pm.box.x1 - pm.box.x0) * 1.8);
        const bh = Math.max(10, (pm.box.y1 - pm.box.y0) * 1.8);
        rect(pm.x - bw / 2, pm.y - bh / 2, bw, bh, 'rgba(255, 252, 240, 0.92)', null, 0);
      }
      label(pm.letter, pm.x, pm.y, 7.0, '#1e293b', 'center');
    }
  }

  // Dimensions & Labels
  const showDims = $('#wall-dimensions-toggle')?.checked !== false;
  if (showDims) {
    // Height Dimension (Left of stud framing elevation)
    const hx = ox + Math.min(studMinX, vtMinX) * s - 28;
    line({x: hx, y: oy}, {x: hx, y: oy - h*s}, '#95a58d', 0.8);
    line({x: hx - 4, y: oy}, {x: hx + 4, y: oy}, '#95a58d', 0.8);
    line({x: hx - 4, y: oy - h*s}, {x: hx + 4, y: oy - h*s}, '#95a58d', 0.8);
    ctx.save();
    ctx.translate(hx - 10, oy - h*s/2);
    ctx.rotate(-Math.PI/2);
    const hLbl = typeof window.formatLength === 'function' ? window.formatLength(h) : `${Math.round(h)} mm`;
    label(`${hLbl} HEIGHT`, 0, 0, 8.0, '#4d5b43');
    ctx.restore();

    // Very Top Plate Dimension Chain (Above elevation, matching 3D Very Top Plate segments + step-backs from stud bounds)
    if (vtPlates.length > 0) {
      const vtTopY = oy - h * s;
      const vtDimY = vtTopY - 16;
      const vtChainSegs = [];
      if (vtPlates[0].x0 > studMinX + 5) {
        vtChainSegs.push({ x0: studMinX, x1: vtPlates[0].x0, kind: 'step' });
      }
      for (let i = 0; i < vtPlates.length; i++) {
        const seg = vtPlates[i];
        vtChainSegs.push({ x0: seg.x0, x1: seg.x1, kind: 'plate' });
        if (i + 1 < vtPlates.length && vtPlates[i + 1].x0 - seg.x1 >= 5) {
          vtChainSegs.push({ x0: seg.x1, x1: vtPlates[i + 1].x0, kind: 'gap' });
        }
      }
      const lastVt = vtPlates[vtPlates.length - 1];
      if (lastVt.x1 < studMaxX - 5) {
        vtChainSegs.push({ x0: lastVt.x1, x1: studMaxX, kind: 'step' });
      }
      const chainStartX = ox + vtChainSegs[0].x0 * s;
      const chainEndX = ox + vtChainSegs[vtChainSegs.length - 1].x1 * s;
      line({ x: chainStartX, y: vtDimY }, { x: chainEndX, y: vtDimY }, '#ea580c', 0.85);
      const tickXs = [vtChainSegs[0].x0, ...vtChainSegs.map(cs => cs.x1)];
      for (const tx of tickXs) {
        const px = ox + tx * s;
        line({ x: px, y: vtTopY - 2 }, { x: px, y: vtDimY - 5 }, '#64748b', 0.65);
        line({ x: px - 3.5, y: vtDimY - 3.5 }, { x: px + 3.5, y: vtDimY + 3.5 }, '#ea580c', 1.0);
      }
      for (const cs of vtChainSegs) {
        const segLen = Math.round(cs.x1 - cs.x0);
        if (segLen < 5) continue;
        const sx0 = ox + cs.x0 * s, sx1 = ox + cs.x1 * s;
        const segTxt = (typeof window !== 'undefined' && window.appUnits === 'ft-in' && typeof window.formatLength === 'function')
          ? window.formatLength(segLen)
          : `${segLen}`;
        const isGap = cs.kind === 'gap';
        const lblY = (isGap && (sx1 - sx0 < 24)) ? (vtDimY + 8) : (vtDimY - 6);
        label(segTxt, (sx0 + sx1) / 2, lblY, isGap ? 6.5 : 7.0, isGap ? '#475569' : '#0f172a', 'center');
      }
    }
  }

  // Professional labels and face indicators on elevation
  label('Int [Internal face]', ox + studMinX * s + 6, oy - 12, 7.0, '#2d6a4f', 'left');
  label('Ext [External face]', ox + studMaxX * s - 6, oy - 12, 7.0, '#b45309', 'right');

  // =========================================================================
  // WALL PLAN / TOP-PLATE & STUD LAYOUT (below wall elevation, matching 1:1 scale s)
  // =========================================================================
  const drawLength = Math.max(len, studMaxX, vtMaxX) * s;
  const planStudX0 = ox + studMinX * s;
  const planStudX1 = ox + studMaxX * s;
  const planStudWidth = Math.max(1, planStudX1 - planStudX0);
  const drawDepth = Math.max(8, studDepth * s);
  const planHeaderY = oy + 24;
  const planY0 = oy + 68;
  const planY1 = planY0 + drawDepth;

  // Header titles above Wall Plan strip
  label('WALL PLAN / TOP-PLATE & STUD LAYOUT', planStudX0, planHeaderY, 8.2, '#0f172a', 'left');
  label(`PANEL ${wallCode}`, planStudX1, planHeaderY, 7.8, '#0f172a', 'right');

  // Int / Ext face indicators on left of Wall Plan strip
  label('Int', ox - 8, planY0 + Math.min(6, drawDepth * 0.28), 7.2, '#266633', 'right');
  label('Ext', ox - 8, planY1 - Math.min(4, drawDepth * 0.22), 7.2, '#a6401a', 'right');

  // Cumulative stud corner tick lines above the plan strip (strictly for studs, not sheathing)
  if (showDims) {
    const studPosSet = new Set();
    let maxStudEdgeX = -Infinity;
    for (const m of layout.members) {
      if (/stud|king|jack|corner|junction|break|trimmer|cripple/i.test(m.type) && !/plate|header|sill|block|noggin/i.test(m.type)) {
        if (m.role === 'Horizontal backing') continue;
        const pos0 = Math.round(Math.min(m.x0, m.x1));
        const pos1 = Math.round(Math.max(m.x0, m.x1));
        if (pos0 >= 0 && pos0 <= Math.round(len)) studPosSet.add(pos0);
        if (pos1 > maxStudEdgeX) maxStudEdgeX = pos1;
      }
    }
    if (Number.isFinite(maxStudEdgeX) && maxStudEdgeX > 0 && maxStudEdgeX <= Math.round(len)) {
      studPosSet.add(maxStudEdgeX);
    }
    const sPositions = [...studPosSet].sort((a, b) => a - b);
    const minPlanGap = 10.5 * ts;
    let lastPlanLabelX = -Infinity;
    for (const xVal of sPositions) {
      const px = ox + Math.max(0, Math.min(len, xVal)) * s;
      const relX = Math.max(0, Math.round(xVal - studMinX));
      const txt = (typeof window !== 'undefined' && window.appUnits === 'ft-in' && typeof window.formatLength === 'function')
        ? window.formatLength(relX)
        : `${relX}`;
      const lx2 = Math.max(px, lastPlanLabelX + minPlanGap);
      lastPlanLabelX = lx2;
      line({ x: px, y: planY0 }, { x: px, y: planY0 - 6 }, '#334155', 0.55);
      if (Math.abs(lx2 - px) > 0.75) {
        line({ x: px, y: planY0 - 6 }, { x: lx2, y: planY0 - 15 }, '#334155', 0.55);
        line({ x: lx2, y: planY0 - 15 }, { x: lx2, y: planY0 - 18 }, '#334155', 0.55);
      } else {
        line({ x: px, y: planY0 - 6 }, { x: px, y: planY0 - 18 }, '#334155', 0.55);
      }
      ctx.save();
      ctx.translate(lx2, planY0 - 20);
      ctx.rotate(-Math.PI / 2);
      label(txt, 0, 0, 6.2, '#1e293b', 'left');
      ctx.restore();
    }
  }

  // 1. Soleplate / Top-plate outer cavity box (aligned strictly to stud framing bounds)
  const cavityFill = isExtWall ? '#f7f7ea' : '#e2e8f0';
  rect(planStudX0, planY0, planStudWidth, drawDepth, cavityFill, '#1e293b', 1.1);
  line({ x: planStudX0, y: planY0 + drawDepth * 0.5 }, { x: planStudX1, y: planY0 + drawDepth * 0.5 }, '#94a3b8', 0.5, [4, 4]);

  // 2. Pre-calculate and clear window/door openings across the Wall Plan strip
  const planOpeningLabels = [];
  let pWinCount = 1, pDoorCount = 1;
  for (const o of wallOpenings) {
    const oL = o.offset - o.width / 2, oR = o.offset + o.width / 2;
    const left = ox + Math.max(studMinX, Math.min(studMaxX, oL)) * s;
    const right = ox + Math.max(studMinX, Math.min(studMaxX, oR)) * s;
    const opW = Math.max(1, right - left);

    rect(left, planY0, opW, drawDepth, '#f8fafc', null, 0);
    line({ x: left, y: planY0 }, { x: right, y: planY0 }, '#475569', 0.8, [4, 3]);
    line({ x: left, y: planY1 }, { x: right, y: planY1 }, '#475569', 0.8, [4, 3]);
    line({ x: left, y: (planY0 + planY1) / 2 }, { x: right, y: (planY0 + planY1) / 2 }, '#94a3b8', 0.6, [3, 3]);

    const isDoor = /door/i.test(o.type || o.id || '');
    const wMm = Math.round(o.width || (isDoor ? 900 : 1200));
    const hMm = Math.round(o.height || (isDoor ? 2100 : 1200));
    const opCode = o.code || o.id || (isDoor ? `D${String(pDoorCount++).padStart(2, '0')}` : `W${String(pWinCount++).padStart(2, '0')}`);
    const isImpPlan = typeof window !== 'undefined' && window.appUnits === 'ft-in';
    const dimPairStr = isImpPlan && typeof window.formatDimPair === 'function' ? window.formatDimPair(wMm, hMm) : `${wMm}×${hMm} mm`;
    const calloutText = `${opCode} (${dimPairStr})`;
    const labelW = calloutText.length * 4.2 + 10;
    const cx = (left + right) / 2;
    planOpeningLabels.push({ o, oL, oR, left, right, cx, text: calloutText, labelW, boxLeft: cx - labelW / 2 - 4, boxRight: cx + labelW / 2 + 4 });
  }

  const isExtOsb = (side === 'exterior' || side === 'both' || (side !== 'interior' && !w.sheathingFlipped));
  const osbH = Math.max(2.0, 12 * s);
  const extOsbPad = (osbApplied && isExtOsb) ? osbH : 0;

  // 3. Full-height stud, king/jack trimmer, corner, and flat junction backing footprints with X cross
  let lastPlanTagX = -Infinity;
  for (const m of layout.members.filter(m => /stud|king|jack|corner|junction|break|trimmer/i.test(m.type) && !/header stud|cripple|block|noggin/i.test(m.type) && m.role !== 'Horizontal backing')) {
    const xa = ox + Math.max(0, Math.min(len, m.x0)) * s;
    const xb = ox + Math.max(0, Math.min(len, m.x1)) * s;
    const ww = Math.max(2.0, xb - xa);
    if (xb < planStudX0 || xa > planStudX1) continue;

    const isFlatBacking = Number.isFinite(m.depth) && m.depth > 0 && m.depth < studDepth - 5;
    const mDepth = isFlatBacking ? m.depth : studDepth;
    const mDrawH = isFlatBacking ? Math.max(3, mDepth * s) : drawDepth;
    const my0 = isFlatBacking ? (isExtOsb ? planY0 : (planY1 - mDrawH)) : planY0;
    const my1 = my0 + mDrawH;

    const isSelStud = typeof selected !== 'undefined' && Array.isArray(selected) && selected.includes(m.id);
    const isColliding = Boolean(m.collision);
    const studFill = isSelStud ? '#7dd3fc' : isColliding ? '#fecaca' : '#dcfce7';
    const studStroke = isSelStud ? '#0284c7' : isColliding ? '#dc2626' : '#15803d';
    const studLw = isSelStud ? 1.8 : Math.min(0.85, Math.max(0.45, ww * 0.18));

    rect(xa, my0, ww, mDrawH, studFill, studStroke, studLw);
    line({ x: xa, y: my0 }, { x: xa + ww, y: my1 }, studStroke, Math.max(0.35, studLw * 0.75));
    line({ x: xa, y: my1 }, { x: xa + ww, y: my0 }, studStroke, Math.max(0.35, studLw * 0.75));

    if (m.isStud) {
      panelStudHits.push({ id: m.id, wallId: w.id, member: m, x0: xa, y0: my0, x1: xa + ww, y1: my1 });
    }

    const tag = /junction/i.test(m.type) ? 'JB' : /corner/i.test(m.type) ? 'SCS' : /king|jack|trimmer/i.test(m.type) ? 'SS' : '';
    if (tag) {
      const tagCx = xa + ww / 2;
      const inOpeningOrLabel = planOpeningLabels.some(ol =>
        (tagCx >= ol.left - 4 && tagCx <= ol.right + 4) ||
        (tagCx >= ol.boxLeft && tagCx <= ol.boxRight)
      );
      if (!inOpeningOrLabel && tagCx - lastPlanTagX >= 14) {
        label(tag, tagCx, planY1 + extOsbPad + 9, 6.2, '#1e293b', 'center');
        lastPlanTagX = tagCx;
      }
    }
  }

  // 4. Cripple and header studs (both inside openings and if dragged elsewhere along the panel)
  const seenPlanCrippleX = new Set();
  for (const m of layout.members.filter(m => /header stud|cripple/i.test(m.type))) {
    const isSelStud = typeof selected !== 'undefined' && Array.isArray(selected) && selected.includes(m.id);
    const k = `${Math.round(m.x0 / 5) * 5}`;
    if (!isSelStud && seenPlanCrippleX.has(k)) continue;
    seenPlanCrippleX.add(k);
    const xa = ox + Math.max(0, Math.min(len, m.x0)) * s;
    const xb = ox + Math.max(0, Math.min(len, m.x1)) * s;
    const ww = Math.max(2.0, xb - xa);
    const studFill = isSelStud ? '#7dd3fc' : '#dcfce7';
    const studStroke = isSelStud ? '#0284c7' : '#15803d';
    const studLw = isSelStud ? 1.8 : Math.min(0.8, Math.max(0.4, ww * 0.18));
    rect(xa, planY0, ww, drawDepth, studFill, studStroke, studLw);
    line({ x: xa, y: planY0 }, { x: xa + ww, y: planY1 }, studStroke, Math.max(0.35, studLw * 0.75));
    line({ x: xa, y: planY1 }, { x: xa + ww, y: planY0 }, studStroke, Math.max(0.35, studLw * 0.75));
    if (m.isStud) {
      panelStudHits.push({ id: m.id, wallId: w.id, member: m, x0: xa, y0: planY0, x1: xa + ww, y1: planY1, zone: 'plan' });
    }
  }
  for (const ol of planOpeningLabels) {
    const { left, right } = ol;
    line({ x: left, y: planY0 }, { x: left, y: planY1 }, '#1e293b', 1.0);
    line({ x: right, y: planY0 }, { x: right, y: planY1 }, '#1e293b', 1.0);
  }

  // 5. 12 mm OSB sheathing strip on exterior walls (split at openings with stud-centered sheet joints, very thin line thickness)
  if (osbApplied) {
    const faces = side === 'both' ? ['exterior', 'interior'] : [side === 'interior' ? 'interior' : 'exterior'];
    let osbIntervals = [[0, len]];
    for (const ol of planOpeningLabels) {
      const next = [];
      for (const [a, b] of osbIntervals) {
        if (ol.oR <= a || ol.oL >= b) next.push([a, b]);
        else {
          if (ol.oL > a + 10) next.push([a, ol.oL]);
          if (ol.oR < b - 10) next.push([ol.oR, b]);
        }
      }
      osbIntervals = next;
    }
    for (const face of faces) {
      const yFace = (face === 'interior') ? (planY0 - osbH) : planY1;
      for (const [segA, segB] of osbIntervals) {
        if (segB - segA < 20) continue;
        const sxA = ox + segA * s;
        const sxB = ox + segB * s;
        rect(sxA, yFace, Math.max(1, sxB - sxA), osbH, '#fed7aa', '#dc2626', 0.4);
        const segStuds = vStudCenters.filter(sc => sc > segA + 100 && sc < segB - 100);
        let cur = segA;
        while (segB - cur > 1220 + 20) {
          const reachable = segStuds.filter(sc => sc > cur + 100 && sc <= cur + 1220 + 20);
          const nextJoint = reachable.length ? reachable[reachable.length - 1] : segStuds.find(sc => sc > cur + 100);
          if (!Number.isFinite(nextJoint) || nextJoint <= cur + 40 || nextJoint >= segB - 100) break;
          const px = ox + nextJoint * s;
          line({ x: px, y: yFace }, { x: px, y: yFace + osbH }, '#991b1b', 0.5);
          cur = nextJoint;
        }
      }
    }
  }

  // 6. Opening callout labels below the Wall Plan strip
  for (const ol of planOpeningLabels) {
    const labelY = planY1 + extOsbPad + 10;
    label(ol.text, ol.cx, labelY, 7.0, '#0284c7', 'center');
  }

  // 7. Overall panel length dimension chain below Wall Plan strip (strictly for stud span, not sheathing)
  if (showDims) {
    const dimY = planY1 + extOsbPad + 24;
    line({ x: planStudX0, y: dimY }, { x: planStudX1, y: dimY }, '#0f172a', 0.85);
    line({ x: planStudX0, y: dimY - 5 }, { x: planStudX0, y: dimY + 5 }, '#0f172a', 0.85);
    line({ x: planStudX1, y: dimY - 5 }, { x: planStudX1, y: dimY + 5 }, '#0f172a', 0.85);
    const lenLbl = typeof window.formatLength === 'function' ? window.formatLength(studSpan) : `${Math.round(studSpan)} mm`;
    label(`${lenLbl} OVERALL PANEL LENGTH`, (planStudX0 + planStudX1) / 2, dimY + 11, 8.0, '#0f172a', 'center');
  }

  // =========================================================================
  // WALL SECTION (on right side of wall elevation, matching 1:1 scale s & thickness)
  // =========================================================================
  const secW = drawDepth; // Exact same 1:1 scaled wall thickness as Wall Plan strip
  const secX0 = ox + drawLength + 38;
  const secX1 = secX0 + secW;
  const secY0 = oy - h * s;
  const secY1 = oy;
  const secH = h * s;

  // Section Title & Int / Ext face indicators at top of section
  label('WALL SECTION', secX0 + secW / 2, secY0 - 20, 7.8, '#0f172a', 'center');
  label('Int', secX0, secY0 - 7, 6.8, '#266633', 'center');
  label('Ext', secX1, secY0 - 7, 6.8, '#a6401a', 'center');

  // 1. Vertical section outer cavity box & dashed centerline
  rect(secX0, secY0, secW, secH, cavityFill, '#1e293b', 1.1);
  line({ x: secX0 + secW * 0.5, y: secY0 }, { x: secX0 + secW * 0.5, y: secY1 }, '#94a3b8', 0.5, [4, 4]);

  // 2. Clear window/door rough openings vertically in the section
  const secOpeningRanges = [];
  for (const o of wallOpenings) {
    const zSill = Math.max(0, o.sill || 0);
    const zHead = Math.min(h, zSill + (o.height || 1200));
    if (zHead <= zSill + 10) continue;
    secOpeningRanges.push([zSill, zHead, o]);
    const yTop = oy - zHead * s;
    const yBot = oy - zSill * s;
    rect(secX0, yTop, secW, yBot - yTop, '#f8fafc', null, 0);
    line({ x: secX0, y: yTop }, { x: secX0, y: yBot }, '#475569', 0.8, [4, 3]);
    line({ x: secX1, y: yTop }, { x: secX1, y: yBot }, '#475569', 0.8, [4, 3]);
    line({ x: (secX0 + secX1) / 2, y: yTop }, { x: (secX0 + secX1) / 2, y: yBot }, '#0284c7', 0.75, [3, 3]);
    line({ x: secX0, y: yTop }, { x: secX1, y: yTop }, '#1e293b', 1.0);
    line({ x: secX0, y: yBot }, { x: secX1, y: yBot }, '#1e293b', 1.0);
  }

  // 3. Cut horizontal framing members (Soleplate, Top plates, Sills, Horizontal Blocking, Multi-ply Headers) with green X-crosses
  const seenSecMembers = new Set();
  for (const m of layout.members) {
    const mz0 = Math.min(m.z0, m.z1), mz1 = Math.max(m.z0, m.z1);
    const mh = mz1 - mz0;
    if (!Number.isFinite(mz0) || !Number.isFinite(mz1) || mh < 10) continue;
    const isHeader = m.type === 'Header' || (/header|lintel/i.test(m.type) && !/stud/i.test(m.type));
    const isPlate = m.type === 'Bottom plate' || m.type === 'Top plate' || /plate/i.test(m.type);
    const isSill = m.type === 'Sill' || /sill/i.test(m.type);
    const isBlock = m.type === 'Block' || /block|noggin/i.test(m.type) || m.role === 'Horizontal backing';
    if (!isHeader && !isPlate && !isSill && !isBlock) continue;

    const kindKey = isHeader ? 'H' : isPlate ? 'P' : isSill ? 'S' : 'B';
    const dedupKey = `${kindKey}:${Math.round(mz0 / 4) * 4}:${Math.round(mz1 / 4) * 4}`;
    if (seenSecMembers.has(dedupKey)) continue;
    seenSecMembers.add(dedupKey);

    const yTop = oy - mz1 * s;
    const yBot = oy - mz0 * s;
    const drawH = Math.max(2.0, yBot - yTop);
    const lw = Math.min(0.85, Math.max(0.45, drawH * 0.18));

    if (isHeader) {
      const plyCount = 3;
      const plyW = secW / plyCount;
      for (let p = 0; p < plyCount; p++) {
        const px0 = secX0 + p * plyW;
        rect(px0, yTop, plyW, drawH, '#dcfce7', '#15803d', lw);
        line({ x: px0, y: yTop }, { x: px0 + plyW, y: yTop + drawH }, '#15803d', Math.max(0.35, lw * 0.75));
        line({ x: px0, y: yTop + drawH }, { x: px0 + plyW, y: yTop }, '#15803d', Math.max(0.35, lw * 0.75));
      }
    } else {
      rect(secX0, yTop, secW, drawH, '#dcfce7', '#15803d', lw);
      line({ x: secX0, y: yTop }, { x: secX1, y: yTop + drawH }, '#15803d', Math.max(0.35, lw * 0.75));
      line({ x: secX0, y: yTop + drawH }, { x: secX1, y: yTop }, '#15803d', Math.max(0.35, lw * 0.75));
    }
  }

  // 4. 12 mm OSB sheathing along vertical section face (for exterior walls only, split at openings with horizontal joint ticks)
  const osbSecW = Math.max(2.0, 12 * s);
  const extSecOsbPad = (osbApplied && isExtOsb) ? osbSecW : 0;
  if (osbApplied) {
    const faces = side === 'both' ? ['exterior', 'interior'] : [side === 'interior' ? 'interior' : 'exterior'];
    let zIntervals = [[0, h]];
    for (const [zSill, zHead] of secOpeningRanges) {
      const next = [];
      for (const [a, b] of zIntervals) {
        if (zHead <= a || zSill >= b) next.push([a, b]);
        else {
          if (zSill > a + 10) next.push([a, zSill]);
          if (zHead < b - 10) next.push([zHead, b]);
        }
      }
      zIntervals = next;
    }
    for (const face of faces) {
      const xFace = (face === 'interior') ? (secX0 - osbSecW) : secX1;
      for (const [zA, zB] of zIntervals) {
        if (zB - zA < 20) continue;
        const syTop = oy - zB * s;
        const syBot = oy - zA * s;
        rect(xFace, syTop, osbSecW, Math.max(1, syBot - syTop), '#fed7aa', '#dc2626', 0.4);
        for (let j = 1; j + 1 < zBreaks.length; j++) {
          const bz = zBreaks[j];
          if (bz > zA + 20 && bz < zB - 20) {
            const jy = oy - bz * s;
            line({ x: xFace, y: jy }, { x: xFace + osbSecW, y: jy }, '#991b1b', 0.5);
          }
        }
      }
    }
  }

  // 5. Dimensions for the right-side Wall Section (cumulative elevation ticks, vertical interval chain, overall height, and wall thickness)
  if (showDims) {
    const zLevelSet = new Set([0, Math.round(h)]);
    for (const m of layout.members) {
      const isHeader = m.type === 'Header' || (/header|lintel/i.test(m.type) && !/stud/i.test(m.type));
      const isPlate = m.type === 'Bottom plate' || m.type === 'Top plate' || /plate/i.test(m.type);
      const isSill = m.type === 'Sill' || /sill/i.test(m.type);
      const isBlock = m.type === 'Block' || /block|noggin/i.test(m.type) || m.role === 'Horizontal backing';
      if (isHeader || isPlate || isSill || isBlock) {
        if (Number.isFinite(m.z0)) zLevelSet.add(Math.max(0, Math.min(Math.round(h), Math.round(m.z0))));
        if (Number.isFinite(m.z1)) zLevelSet.add(Math.max(0, Math.min(Math.round(h), Math.round(m.z1))));
      }
    }
    for (const [zSill, zHead] of secOpeningRanges) {
      zLevelSet.add(Math.round(zSill));
      zLevelSet.add(Math.round(zHead));
    }

    // Cumulative Z-elevation ticks with horizontal leader fan-out on the right side of the section
    const zPositions = [...zLevelSet].sort((a, b) => a - b); // ascending Z (bottom to top)
    const tickBaseX = secX1 + extSecOsbPad;
    const minSecGap = 9.5 * ts;
    let lastLabelY = Infinity; // screen Y decreases upward
    for (const zVal of zPositions) {
      const py = oy - Math.max(0, Math.min(h, zVal)) * s;
      const txt = (typeof window !== 'undefined' && window.appUnits === 'ft-in' && typeof window.formatLength === 'function')
        ? window.formatLength(zVal)
        : `${Math.round(zVal)}`;
      const ly2 = Math.min(py, lastLabelY - minSecGap);
      lastLabelY = ly2;
      line({ x: tickBaseX, y: py }, { x: tickBaseX + 5, y: py }, '#334155', 0.55);
      if (Math.abs(py - ly2) > 0.75) {
        line({ x: tickBaseX + 5, y: py }, { x: tickBaseX + 13, y: ly2 }, '#334155', 0.55);
        line({ x: tickBaseX + 13, y: ly2 }, { x: tickBaseX + 16, y: ly2 }, '#334155', 0.55);
      } else {
        line({ x: tickBaseX + 5, y: py }, { x: tickBaseX + 16, y: py }, '#334155', 0.55);
      }
      label(txt, tickBaseX + 18, ly2, 6.2, '#1e293b', 'left');
    }

    // Overall section height dimension bar to the right of the cumulative level labels
    const secDimX = tickBaseX + 52;
    line({ x: secDimX, y: secY0 }, { x: secDimX, y: secY1 }, '#0f172a', 0.85);
    line({ x: secDimX - 5, y: secY0 }, { x: secDimX + 5, y: secY0 }, '#0f172a', 0.85);
    line({ x: secDimX - 5, y: secY1 }, { x: secDimX + 5, y: secY1 }, '#0f172a', 0.85);
    ctx.save();
    ctx.translate(secDimX + 11, (secY0 + secY1) / 2);
    ctx.rotate(-Math.PI / 2);
    const hLbl = typeof window.formatLength === 'function' ? window.formatLength(h) : `${Math.round(h)} mm`;
    label(`${hLbl} OVERALL HEIGHT`, 0, 0, 7.8, '#0f172a', 'center');
    ctx.restore();

    // Wall thickness dimension below the section strip
    const thkDimY = secY1 + 14;
    line({ x: secX0, y: thkDimY }, { x: secX1, y: thkDimY }, '#0f172a', 0.75);
    line({ x: secX0, y: thkDimY - 4 }, { x: secX0, y: thkDimY + 4 }, '#0f172a', 0.75);
    line({ x: secX1, y: thkDimY - 4 }, { x: secX1, y: thkDimY + 4 }, '#0f172a', 0.75);
    const thkLbl = typeof window.formatLength === 'function' ? window.formatLength(studDepth) : `${Math.round(studDepth)} mm`;
    label(thkLbl, secX0 + secW / 2, thkDimY + 9, 6.8, '#0f172a', 'center');
  }
  
  const ocLbl = typeof window.formatLength === 'function' ? window.formatLength(construction(w).spacing) : `${construction(w).spacing} mm`;
  const studSecLbl = typeof window.formatSection === 'function' ? window.formatSection(38, w.thickness) : `${Math.round(w.thickness)}x38 mm`;
  const constructionInfo = `${layout.members.length} members · ${ocLbl} O.C. · ${isExteriorWall(w) ? 'C24 EXTERIOR' : 'C16 INTERIOR'} · ${studSecLbl} studs`;
  const wallTitleStr = wallCode !== w.id ? `${wallCode} (${w.id})` : w.id;
  label(`${wallTitleStr} · ${constructionInfo}`, centerX, height - 36, 8.0, '#526b58');
  label('PROFESSIONAL SHOP DRAWING · NOT FOR STRUCTURAL APPROVAL WITHOUT ENGINEER STAMP', centerX, height - 22, 6.5, '#748b76');

  // Render placed Section Stack-Up Callouts and live Section tool preview on Wall Panel elevation
  if (typeof window.computeVerticalStackup === 'function' && typeof window.drawSectionStackupCallout === 'function') {
    const prZ = z => oy - z * s;
    const panelCallouts = (model.elements || []).filter(e => e.type === 'section_callout' && (!e.wallId || e.wallId === w.id));
    panelCallouts.forEach((sc, idx) => {
      const stackup = window.computeVerticalStackup(w, sc.xAlongWall);
      if (!stackup) return;
      const xScreen = ox + stackup.xAlongWall * s;
      window.drawSectionStackupCallout(stackup, xScreen, prZ, sc.code || `SEC-${idx + 1}`, false, Array.isArray(selected) && selected.includes(sc.id));
    });
    if (typeof tool !== 'undefined' && tool === 'section' && typeof lastPointer !== 'undefined' && lastPointer) {
      const xAlong = Math.max(0, Math.min(len, (lastPointer.x - ox) / s));
      const stackup = window.computeVerticalStackup(w, xAlong);
      if (stackup) {
        const xScreen = ox + stackup.xAlongWall * s;
        window.drawSectionStackupCallout(stackup, xScreen, prZ, 'SEC', true, false);
      }
    }
  }

  if(audit.issues.length){
    const visible=audit.issues.slice(0,3);
    visible.forEach((issue,i)=>label('⚠ '+issue,centerX,height-58-i*14,8.0,'#a47849'));
    if(audit.issues.length>visible.length)label(`+ ${audit.issues.length-visible.length} more framing issue(s)`,centerX,height-58-visible.length*14,8.0,'#a47849');
  }
}
function framingCutRows(walls=model.elements.filter(e=>e.type==='wall')){const map=new Map();for(const w of walls)for(const m of generateWallFraming(w).members){const key=[m.wallId,m.type,m.section,Math.round(m.length*10)/10].join('|'),row=map.get(key)||{wallId:w.id,type:m.type,section:m.section,length:Math.round(m.length*10)/10,quantity:0};row.quantity++;map.set(key,row)}return [...map.values()]}
function framingCSV(){
  const isImp = typeof window !== 'undefined' && window.appUnits === 'ft-in';
  const hdr = isImp ? 'Element,Member,Section,Length,Quantity\n' : 'Element,Member,Section mm,Length mm,Quantity\n';
  return hdr + allFramingRows().map(r=>{
    const secStr = isImp && typeof window.formatSection === 'function' ? window.formatSection(r.section) : r.section;
    const lenStr = isImp && typeof window.formatLength === 'function' ? window.formatLength(r.length) : r.length;
    return [r.wallId,r.type,secStr,lenStr,r.quantity].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',');
  }).join('\n');
}
function wallOpeningHeadPresetControl(w,type,label,key){
  const list=(typeof hosted==='function'?hosted(w):[]).filter(o=>o.type===type);
  if(!list.length)return '';
  const heads=list.map(o=>Math.round((o.sill||0)+o.height));
  const same=heads.every(h=>h===heads[0]);
  const candidates=[1800,2000,2040,2100,2134,2200,2300,2400,2440,2500,2600];
  const selected=!same?'mixed':(candidates.includes(heads[0])?String(heads[0]):'custom');
  const opts=[];
  if(selected==='mixed')opts.push(['mixed','Mixed / individual values']);
  opts.push(['custom','Custom / per opening'],...candidates.map(v=>{
    const vLbl = typeof window !== 'undefined' && typeof window.formatLength === 'function' ? window.formatLength(v) : `${v} mm`;
    return [String(v),`${vLbl} above wall base`];
  }));
  return `${choice(label,key,selected,opts)}<div class="empty-prop">A preset changes all ${type}s hosted on this wall; opening height adjusts from each existing sill.</div>`;
}
var WALL_CONNECTOR_CATALOG = {
  holdDowns: {
    simpson_hdu2: { id: 'simpson_hdu2', brand: 'Simpson Strong-Tie', code: 'HDU2-SDS2.5', name: 'Simpson Strong-Tie HDU2-SDS2.5 Deflection Hold-Down', tensionLbs: 3075, tensionKN: 13.68, fasteners: '(6) SDS 1/4"x2-1/2" Screws + 5/8" Anchor Bolt', standard: 'ICC-ES ESR-2330 · NDS 2024' },
    simpson_htt4: { id: 'simpson_htt4', brand: 'Simpson Strong-Tie', code: 'HTT4', name: 'Simpson Strong-Tie HTT4 Heavy Tension Tie', tensionLbs: 4235, tensionKN: 18.84, fasteners: '(18) 10d / SD10 Nails + 5/8" Anchor Bolt', standard: 'ICC-ES ESR-2330 · Shearwall Chord' },
    simpson_hdu5: { id: 'simpson_hdu5', brand: 'Simpson Strong-Tie', code: 'HDU5-SDS2.5', name: 'Simpson Strong-Tie HDU5-SDS2.5 Heavy Hold-Down', tensionLbs: 5645, tensionKN: 25.11, fasteners: '(14) SDS 1/4"x2-1/2" Screws + 5/8" Anchor Bolt', standard: 'ICC-ES ESR-2330 · High Seismic/Wind' },
    simpson_hdu8: { id: 'simpson_hdu8', brand: 'Simpson Strong-Tie', code: 'HDU8-SDS2.5', name: 'Simpson Strong-Tie HDU8-SDS2.5 High-Capacity Hold-Down', tensionLbs: 7870, tensionKN: 35.01, fasteners: '(20) SDS 1/4"x2-1/2" Screws + 7/8" Anchor Bolt', standard: 'ICC-ES ESR-2330 · Multi-Story Shearwall' },
    mitek_tdu2: { id: 'mitek_tdu2', brand: 'MiTek', code: 'TDU2', name: 'MiTek TDU2 SDS Deflection Hold-Down', tensionLbs: 3150, tensionKN: 14.01, fasteners: '(6) WS25 Heavy Screws + 5/8" Anchor Bolt', standard: 'ICC-ES ESR-1887 · MiTek USP' },
    mitek_ltt20b: { id: 'mitek_ltt20b', brand: 'MiTek', code: 'LTT20B', name: 'MiTek LTT20B Heavy Tension Tie Hold-Down', tensionLbs: 4310, tensionKN: 19.17, fasteners: '(18) 10d Common Nails + 5/8" Anchor Bolt', standard: 'ICC-ES ESR-1887 · Shearwall Post' },
    mitek_tdu5: { id: 'mitek_tdu5', brand: 'MiTek', code: 'TDU5', name: 'MiTek TDU5 Heavy Shearwall Hold-Down', tensionLbs: 5780, tensionKN: 25.71, fasteners: '(14) WS25 Screws + 5/8" Anchor Bolt', standard: 'ICC-ES ESR-1887 · High Seismic/Wind' },
    mitek_tdu8: { id: 'mitek_tdu8', brand: 'MiTek', code: 'TDU8', name: 'MiTek TDU8 High-Capacity Shearwall Hold-Down', tensionLbs: 8120, tensionKN: 36.12, fasteners: '(20) WS25 Screws + 7/8" Anchor Bolt', standard: 'ICC-ES ESR-1887 · Multi-Story Shearwall' }
  },
  studTies: {
    simpson_a35: { id: 'simpson_a35', brand: 'Simpson Strong-Tie', code: 'A35 / LTP4', name: 'Simpson Strong-Tie A35 / LTP4 Framing Angle & Plate Clip', upliftLbs: 645, upliftKN: 2.87, fasteners: '(6) 8d x 1-1/2" Nails Stud-to-Plate', standard: 'ICC-ES ESR-2523 · Lateral & Uplift' },
    simpson_sp2: { id: 'simpson_sp2', brand: 'Simpson Strong-Tie', code: 'SP2', name: 'Simpson Strong-Tie SP2 Stud-to-Plate Tie', upliftLbs: 1065, upliftKN: 4.74, fasteners: '(6) 10d Nails Stud + (4) 10d Plate', standard: 'ICC-ES ESR-2523 · IRC Continuous Load Path' },
    simpson_sph4: { id: 'simpson_sph4', brand: 'Simpson Strong-Tie', code: 'SPH4', name: 'Simpson Strong-Tie SPH4 U-Wrap Heavy Stud-to-Plate Tie', upliftLbs: 1615, upliftKN: 7.18, fasteners: '(12) 10d x 1-1/2" Nails U-Strap', standard: 'ICC-ES ESR-2523 · High-Wind Wall Studs' },
    mitek_ga1: { id: 'mitek_ga1', brand: 'MiTek', code: 'GA1 / MP34', name: 'MiTek GA1 / MP34 Framing Angle & Plate Clip', upliftLbs: 660, upliftKN: 2.94, fasteners: '(6) 8d x 1-1/2" Nails Stud-to-Plate', standard: 'ICC-ES ESR-1352 · MiTek USP' },
    mitek_spt2: { id: 'mitek_spt2', brand: 'MiTek', code: 'SPT2', name: 'MiTek SPT2 Stud-to-Plate Tie', upliftLbs: 1090, upliftKN: 4.85, fasteners: '(6) 10d Nails Stud + (4) 10d Plate', standard: 'ICC-ES ESR-1352 · Continuous Load Path' },
    mitek_spt4: { id: 'mitek_spt4', brand: 'MiTek', code: 'SPT4 / SPTH4', name: 'MiTek SPT4 Heavy U-Wrap Stud-to-Plate Tie', upliftLbs: 1650, upliftKN: 7.34, fasteners: '(12) 10d x 1-1/2" Nails U-Strap', standard: 'ICC-ES ESR-1352 · High-Wind Wall Studs' }
  },
  plateStraps: {
    simpson_cs16: { id: 'simpson_cs16', brand: 'Simpson Strong-Tie', code: 'CS16', name: 'Simpson Strong-Tie CS16 Coiled Top-Plate Splice Strap', tensionLbs: 1705, tensionKN: 7.58, fasteners: '(14) 10d Common Nails @ Top Plate Splice', standard: 'ICC-ES ESR-1700 · Collector Strap' },
    simpson_msta24: { id: 'simpson_msta24', brand: 'Simpson Strong-Tie', code: 'MSTA24', name: 'Simpson Strong-Tie MSTA24 Medium Top-Plate Collector Strap', tensionLbs: 2215, tensionKN: 9.85, fasteners: '(18) 10d Common Nails @ Double Top Plate', standard: 'ICC-ES ESR-1700 · Diaphragm Chord' },
    simpson_mst37: { id: 'simpson_mst37', brand: 'Simpson Strong-Tie', code: 'MST37', name: 'Simpson Strong-Tie MST37 Heavy Collector Strap (12 ga)', tensionLbs: 4500, tensionKN: 20.02, fasteners: '(30) 16d Sinkers / SDS Screws', standard: 'ICC-ES ESR-1700 · Heavy Shear Transfer' },
    mitek_cmst16: { id: 'mitek_cmst16', brand: 'MiTek', code: 'CMST16', name: 'MiTek CMST16 Coiled Top-Plate Splice Strap', tensionLbs: 1760, tensionKN: 7.83, fasteners: '(14) 10d Common Nails @ Top Plate Splice', standard: 'ICC-ES ESR-1352 · MiTek USP' },
    mitek_lsta24: { id: 'mitek_lsta24', brand: 'MiTek', code: 'LSTA24', name: 'MiTek LSTA24 Top-Plate Collector Strap', tensionLbs: 2260, tensionKN: 10.05, fasteners: '(18) 10d Common Nails @ Double Top Plate', standard: 'ICC-ES ESR-1352 · Diaphragm Chord' },
    mitek_mt36: { id: 'mitek_mt36', brand: 'MiTek', code: 'MT36', name: 'MiTek MT36 Heavy Collector Strap (12 ga)', tensionLbs: 4620, tensionKN: 20.55, fasteners: '(30) 16d Common Nails @ Top Plate', standard: 'ICC-ES ESR-1352 · Heavy Shear Collector' }
  }
};
if (typeof window !== 'undefined') window.WALL_CONNECTOR_CATALOG = WALL_CONNECTOR_CATALOG;

function calculateWallSupportReactions(w) {
  const sug = auditWallStructuralWarning(w);
  const lenM = Math.max(0.8, distance(w.a, w.b) / 1000);
  const hM = Math.max(2.1, (w.height || 2700) / 1000);
  const spacingM = Math.max(0.3, (construction(w).spacing || 400) / 1000);
  const isExt = isWallExtFlag(w);
  const qAxialKNm = sug ? sug.demands.qAxialLineLoad_kNm : (isExt ? 12.5 : 7.5);
  const studAxialKN = +(qAxialKNm * spacingM).toFixed(2);
  const studAxialLbs = Math.round(studAxialKN * 224.809);
  const netUpliftKNm = isExt ? Math.max(2.2, qAxialKNm * 0.28) : 1.1;
  const studUpliftKN = +(netUpliftKNm * spacingM).toFixed(2);
  const studUpliftLbs = Math.round(studUpliftKN * 224.809);
  const unitShearKNm = isExt ? 4.8 : 2.6;
  const totalShearKN = unitShearKNm * lenM;
  const overturningTensionKN = +((totalShearKN * hM) / Math.max(1.2, lenM) + studUpliftKN * 1.5).toFixed(2);
  const overturningTensionLbs = Math.round(overturningTensionKN * 224.809);
  const collectorTensionKN = +(totalShearKN * 0.65).toFixed(2);
  const collectorTensionLbs = Math.round(collectorTensionKN * 224.809);
  return {
    lenM: +lenM.toFixed(2),
    hM: +hM.toFixed(2),
    studAxialKN,
    studAxialLbs,
    studUpliftKN,
    studUpliftLbs,
    overturningTensionKN,
    overturningTensionLbs,
    collectorTensionKN,
    collectorTensionLbs
  };
}
if (typeof window !== 'undefined') window.calculateWallSupportReactions = calculateWallSupportReactions;

function autoSizeWallConnectors(w, preferredBrand = 'all') {
  if (!w) return null;
  const rx = calculateWallSupportReactions(w);
  const filterByBrand = (obj) => Object.values(obj).filter(c => preferredBrand === 'all' || c.brand === preferredBrand);

  const hdList = filterByBrand(WALL_CONNECTOR_CATALOG.holdDowns).sort((a, b) => a.tensionKN - b.tensionKN);
  const stList = filterByBrand(WALL_CONNECTOR_CATALOG.studTies).sort((a, b) => a.upliftKN - b.upliftKN);
  const psList = filterByBrand(WALL_CONNECTOR_CATALOG.plateStraps).sort((a, b) => a.tensionKN - b.tensionKN);

  const chosenHD = hdList.find(c => rx.overturningTensionKN / c.tensionKN <= 0.92) || hdList[hdList.length - 1] || WALL_CONNECTOR_CATALOG.holdDowns.simpson_hdu2;
  const chosenST = stList.find(c => rx.studUpliftKN / c.upliftKN <= 0.92) || stList[stList.length - 1] || WALL_CONNECTOR_CATALOG.studTies.simpson_sp2;
  const chosenPS = psList.find(c => rx.collectorTensionKN / c.tensionKN <= 0.92) || psList[psList.length - 1] || WALL_CONNECTOR_CATALOG.plateStraps.simpson_cs16;

  if (!w.framing) w.framing = construction(w);
  w.framing.connectorsEnabled = true;
  w.framing.holdDownType = chosenHD.id;
  w.framing.studTieType = chosenST.id;
  w.framing.plateStrapType = chosenPS.id;

  return {
    reactions: rx,
    holdDown: chosenHD,
    studTie: chosenST,
    plateStrap: chosenPS,
    holdDownUtilPct: Math.round((rx.overturningTensionKN / chosenHD.tensionKN) * 100),
    studTieUtilPct: Math.round((rx.studUpliftKN / chosenST.upliftKN) * 100),
    plateStrapUtilPct: Math.round((rx.collectorTensionKN / chosenPS.tensionKN) * 100)
  };
}
if (typeof window !== 'undefined') window.autoSizeWallConnectors = autoSizeWallConnectors;

function framingProperties(w){
  const c=construction(w);
  const winHead=wallOpeningHeadPresetControl(w,'window','Apply window head level to all windows','windowHeadPreset');
  const doorHead=wallOpeningHeadPresetControl(w,'door','Apply door head level to all doors','doorHeadPreset');
  const curPreset=getTimberPresetId(c,w);
  const timberOpts=[['custom','Custom Size / Non-Standard'],...TIMBER_SIZES_C16_C24.map(p=>[p.id,p.name])];
  const gradeOpts=[['C14','C14 Softwood'],['C16','C16 Standard Structural'],['C18','C18 Softwood'],['C24','C24 High-Grade Structural'],['C30','C30 Premium Softwood']];
  const cornerOpts=[
    ['auto','Auto (Situation: Wall Thickness & Thermal)'],
    ['ext_opt1','Option 1: 2-Stud + Drywall Backer (L-Backer)'],
    ['ext_opt2','Option 2: 3-Stud Corner (Double End + Backer)'],
    ['ext_opt3','Option 3: 3-Stud Insulated U-Channel (California)'],
    ['ext_opt4','Option 4: 4-Stud Solid Stacked Corner Post'],
    ['ext_opt5','Option 5: 3-Stud Box Corner (Spaced Backer)']
  ];
  const junctionOpts=[
    ['auto','Auto (Situation: Wall Hierarchy & Drywall)'],
    ['int_opt1','Option 1: Single Stud + Drywall Nailer'],
    ['int_opt2','Option 2: 2-Stud Flanking + Ladder Blocks'],
    ['int_opt3','Option 3: 3-Stud Solid Post T-Junction'],
    ['int_opt4','Option 4: Double Drywall Flanges (T-Flange)'],
    ['int_opt5','Option 5: Partition L-Corner (2-Stud + Backer)']
  ];
  const effectiveCorner = resolveCornerDetail(w);
  const effectiveJunction = resolveJunctionDetail(w);
  const deletedCount = Array.isArray(w.framing?.deletedStuds) ? w.framing.deletedStuds.length : 0;
  const overrideCount = w.framing?.studOverrides ? Object.keys(w.framing.studOverrides).length : 0;
  const sug = auditWallStructuralWarning(w);
  const allWallMembers = generateWallFraming(w).members;
  const allWallStuds = allWallMembers.filter(m => m.isStud);
  const badges = sug?.badges || { geometricallyValidated: true, structurallyVerified: true, manufacturingApproved: true };

  const studManageHtml = `
    <div class="section-header">WALL MEMBERS, VERIFICATION &amp; PAMIR STUDIO <span>${allWallMembers.length} pcs</span></div>
    <div style="padding:4px 18px 8px">
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">
        <span style="padding:2px 6px;border-radius:4px;font-size:9.5px;font-weight:800;background:${badges.geometricallyValidated ? '#dcfce7' : '#fee2e2'};color:${badges.geometricallyValidated ? '#166534' : '#991b1b'}">${badges.geometricallyValidated ? '✓ GEOM VALID' : '⚠ GEOM'}</span>
        <span style="padding:2px 6px;border-radius:4px;font-size:9.5px;font-weight:800;background:${badges.structurallyVerified ? '#dbeafe' : '#fef3c7'};color:${badges.structurallyVerified ? '#1e40af' : '#92400e'}">${badges.structurallyVerified ? '✓ STRUCT VERIFIED' : '⚠ STRUCT REVIEW'}</span>
        <span style="padding:2px 6px;border-radius:4px;font-size:9.5px;font-weight:800;background:${badges.manufacturingApproved ? '#f3e8ff' : '#fee2e2'};color:${badges.manufacturingApproved ? '#6b21a8' : '#991b1b'}">${badges.manufacturingApproved ? '✓ CNC APPROVED' : '⚠ SPLIT PANEL'}</span>
      </div>
      <button type="button" class="primary" data-wall-action="openWallStudioHub" style="width:100%;margin-bottom:8px;padding:8px 10px;background:#0f172a;border-color:#0284c7;color:#38bdf8;font-weight:800;font-size:11px;cursor:pointer">⚡ Open PAMIR Wall Engineering, Layers, CNC &amp; BOM Studio</button>
      <div style="background:${sug && sug.current.dcPercent > 80 ? '#fef2f2' : '#f0f9ff'};border:1px solid ${sug && sug.current.dcPercent > 80 ? '#fca5a5' : '#bae6fd'};border-radius:6px;padding:8px 10px;margin-bottom:8px;font-size:11px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <strong style="color:#0f172a">EC5 Axial: ${sug ? sug.current.pureAxialDC_pct : 28}% (Comb ${sug ? sug.current.ec5.dcPercent : 48}%) &nbsp;|&nbsp; Racking: ${sug?.racking ? sug.racking.rackingUtilPct + '%' : 'OK'}</strong>
          <span style="color:#0369a1;font-weight:700">${sug ? sug.demands.qAxialLineLoad_kNm : 10} kN/m</span>
        </div>
        <div style="color:#475569;font-size:10.5px">
          Gov: <strong>${esc(sug?.demands?.governingComboLabel || '1.35G + 1.5Q')}</strong> · NDS: <strong>${sug ? sug.current.nds.dcPercent : 45}%</strong> · H/d = <strong>${sug ? sug.current.ec5.hOverD : 21}</strong> · Piers: <strong>${sug?.racking ? sug.racking.effectivePierCount : 1}</strong>
        </div>
      </div>
      <div style="font-size:10.5px;color:#475569;margin-bottom:6px">
        Click any <b>Stud, Plate, Header, Sill or Block</b> in <b>Wall Panel</b>, <b>2D Framing Plan</b>, or pick below:
      </div>
      <div style="display:flex;gap:6px;margin-bottom:6px">
        <select id="wall-stud-quick-picker" style="flex:1;padding:5px 6px;border:1px solid #cbd5e1;border-radius:5px;font-size:11px;background:#fff">
          <option value="">— Select any member on ${esc(w.id)} (${allWallMembers.length} total · ${allWallStuds.length} studs) —</option>
          ${allWallMembers.map(m => {
            const x0Lbl = typeof window !== 'undefined' && typeof window.formatLength === 'function' ? window.formatLength(m.x0, false) : Math.round(m.x0);
            const x1Lbl = typeof window !== 'undefined' && typeof window.formatLength === 'function' ? window.formatLength(m.x1) : `${Math.round(m.x1)} mm`;
            const secLbl = typeof window !== 'undefined' && typeof window.formatSection === 'function' ? window.formatSection(m.section) : m.section;
            return `<option value="${esc(m.id)}">${m.locked ? '🔒 ' : ''}${esc(m.type)} @ ${x0Lbl}–${x1Lbl} (${esc(secLbl)})</option>`;
          }).join('')}
        </select>
      </div>
      <div style="display:flex;gap:4px;align-items:center;margin-bottom:6px;padding:5px 6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:5px">
        <input id="wall-prop-insert-x" type="number" step="10" placeholder="X mm" title="Coordinate X along wall (mm)" style="width:68px;padding:3px 5px;font-size:11px;border:1px solid #cbd5e1;border-radius:4px;background:#fff">
        <input id="wall-prop-insert-z" type="number" step="10" placeholder="Z opt" title="Optional Z height in mm (blank = full plate-to-plate)" style="width:62px;padding:3px 5px;font-size:11px;border:1px solid #cbd5e1;border-radius:4px;background:#fff">
        <button type="button" class="subtle" data-wall-action="insertCustomStud" style="flex:1;font-size:10.5px;color:#047857;border-color:#6ee7b7;background:#ecfdf5;font-weight:700;padding:4px 6px">➕ Insert @ Coord</button>
      </div>
      <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
        <button type="button" class="subtle" data-wall-action="autoDesignWall" style="flex:1;font-size:10.5px;color:#0284c7;border-color:#7dd3fc;background:#f0f9ff;font-weight:700">⚡ Auto-Design Wall</button>
        <button type="button" class="subtle" data-wall-action="mirrorWallFraming" style="flex:1;font-size:10.5px;color:#4f46e5;border-color:#c7d2fe;background:#eef2ff;font-weight:700">⇄ Mirror Framing</button>
      </div>
      ${(deletedCount > 0 || overrideCount > 0) ? `
      <div style="display:flex;gap:6px;margin-top:6px">
        ${deletedCount > 0 ? `<button type="button" class="subtle" data-wall-action="restoreStuds" style="flex:1;font-size:10.5px;color:#15803d;border-color:#86efac;background:#f0fdf4;font-weight:700">⟲ Restore Deleted (${deletedCount})</button>` : ''}
        ${overrideCount > 0 ? `<button type="button" class="subtle" data-wall-action="resetStudSizes" style="flex:1;font-size:10.5px;color:#0369a1;border-color:#7dd3fc;background:#f0f9ff;font-weight:700">⟲ Reset Unlocked Edits</button>` : ''}
      </div>` : ''}
    </div>
  `;

  const gableInfo = typeof computeWallRoofGableProfile === 'function' ? computeWallRoofGableProfile(w) : null;
  const curGableMode = w.gableMode || w.framing?.gableMode || (w.gableProfile ? 'gable' : 'auto');
  const curGablePitch = gableInfo?.pitchDeg || w.framing?.gablePitch || w.gablePitch || 25;
  const gableSectionHtml = `<div class="section-header">GABLE WALL UNDER ROOF</div>${choice('Gable Wall Mode','gableMode',curGableMode,[['auto','Auto (Detect from Gable Roof)'],['gable','Gable Wall Under Roof (Raked Top)'],['none','Flat Top Wall (No Gable)']])}${curGableMode==='gable'||gableInfo?field('Roof / Gable Pitch','gablePitch',curGablePitch,'°'):''}${gableInfo?`<div style="padding:4px 18px 8px;font-size:11px;color:#0369a1;background:#f0f9ff;border-left:3px solid #0284c7;margin:4px 18px 8px;border-radius:4px"><strong>Active Gable Profile:</strong> Eave ${Math.round(gableInfo.eaveHeight)} mm → Ridge Peak ${Math.round(gableInfo.peakHeight)} mm (+${Math.round(gableInfo.peakRise)} mm rise @ ${gableInfo.pitchDeg}°)</div>`:''}`;

  const wallRx = calculateWallSupportReactions(w);
  const connEnabled = c.connectorsEnabled !== false;
  const curHD = WALL_CONNECTOR_CATALOG.holdDowns[c.holdDownType || 'simpson_hdu2'] || WALL_CONNECTOR_CATALOG.holdDowns.simpson_hdu2;
  const curST = WALL_CONNECTOR_CATALOG.studTies[c.studTieType || 'simpson_sp2'] || WALL_CONNECTOR_CATALOG.studTies.simpson_sp2;
  const curPS = WALL_CONNECTOR_CATALOG.plateStraps[c.plateStrapType || 'simpson_cs16'] || WALL_CONNECTOR_CATALOG.plateStraps.simpson_cs16;
  const hdUtil = Math.round((wallRx.overturningTensionKN / curHD.tensionKN) * 100);
  const stUtil = Math.round((wallRx.studUpliftKN / curST.upliftKN) * 100);
  const psUtil = Math.round((wallRx.collectorTensionKN / curPS.tensionKN) * 100);

  const wallConnectorsHtml = `
    <div class="section-header">SIMPSON STRONG-TIE &amp; MITEK WALL CONNECTORS</div>
    ${choice('Wall Steel Connectors','framing.connectorsEnabled',String(connEnabled),[['true','Enabled (Show on Plan & Schedule)'],['false','Disabled']])}
    ${choice('Shearwall Hold-Down (End Posts)','framing.holdDownType',curHD.id,Object.values(WALL_CONNECTOR_CATALOG.holdDowns).map(x=>[x.id,`${x.name} (${x.tensionLbs.toLocaleString()} lbs / ${x.tensionKN} kN)`]))}
    ${choice('Stud-to-Plate Uplift Tie','framing.studTieType',curST.id,Object.values(WALL_CONNECTOR_CATALOG.studTies).map(x=>[x.id,`${x.name} (${x.upliftLbs.toLocaleString()} lbs / ${x.upliftKN} kN)`]))}
    ${choice('Top-Plate Collector Strap','framing.plateStrapType',curPS.id,Object.values(WALL_CONNECTOR_CATALOG.plateStraps).map(x=>[x.id,`${x.name} (${x.tensionLbs.toLocaleString()} lbs / ${x.tensionKN} kN)`]))}
    <div style="padding:4px 18px 8px">
      <div style="display:flex;gap:5px;margin-bottom:8px;flex-wrap:wrap">
        <button type="button" class="primary" data-wall-action="autoSizeConnectors" data-brand="all" style="flex:1;font-size:11px;padding:7px 8px;background:#059669;border-color:#047857;color:#fff;font-weight:700;cursor:pointer">⚡ Auto-Size from Reaction</button>
        <button type="button" class="subtle" data-wall-action="autoSizeConnectors" data-brand="Simpson Strong-Tie" style="font-size:10.5px;padding:6px 8px;font-weight:700;cursor:pointer">⚡ Simpson</button>
        <button type="button" class="subtle" data-wall-action="autoSizeConnectors" data-brand="MiTek" style="font-size:10.5px;padding:6px 8px;font-weight:700;cursor:pointer">⚡ MiTek</button>
      </div>
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:8px 10px;font-size:10.5px;color:#065f46;line-height:1.55">
        <strong>Support Node Reaction vs. Connector Capacity (${esc(w.id)}):</strong><br>
        · End-Post Overturning Tension: <strong>${wallRx.overturningTensionKN} kN (${wallRx.overturningTensionLbs.toLocaleString()} lbs)</strong> → <b>${esc(curHD.brand)} ${esc(curHD.code)}</b> (<span style="color:${hdUtil<=100?'#047857':'#dc2626'};font-weight:700">${hdUtil}% D/C</span>)<br>
        · Stud Uplift Node Reaction: <strong>${wallRx.studUpliftKN} kN (${wallRx.studUpliftLbs.toLocaleString()} lbs)</strong> → <b>${esc(curST.brand)} ${esc(curST.code)}</b> (<span style="color:${stUtil<=100?'#047857':'#dc2626'};font-weight:700">${stUtil}% D/C</span>)<br>
        · Top-Plate Collector Tension: <strong>${wallRx.collectorTensionKN} kN (${wallRx.collectorTensionLbs.toLocaleString()} lbs)</strong> → <b>${esc(curPS.brand)} ${esc(curPS.code)}</b> (<span style="color:${psUtil<=100?'#047857':'#dc2626'};font-weight:700">${psUtil}% D/C</span>)
      </div>
    </div>
  `;

  return `<div class="section-header">WALL CONSTRUCTION</div>${choice('Structure','structure',w.structure||'basic',[['basic','Basic wall'],['composite','Composite wall']])}${w.structure==='composite'?choice('Composite','composite',w.composite||'timber140',Object.entries(WALL_COMPOSITES).map(([id,c])=>[id,c.name])):''}${choice('Reference','reference',w.reference||'center',[['inside','Inside face'],['center','Centerline'],['outside','Outside face'],['coreInside','Core inside'],['coreCenter','Core center'],['coreOutside','Core outside']])}<div class="wall-property-actions"><button class="subtle" data-wall-action="flip">${icon('mirror')} Flip orientation</button></div>${field('Join priority','priority',w.priority??(w.layer==='Exterior Walls'?100:50))}${field('Base offset','baseOffset',w.baseOffset||0,'mm')}${field('Top offset','topOffset',w.topOffset||0,'mm')}${choice('Top level','topStory',w.topStory||'', [['','Home story top'],...model.stories.filter(s=>s.elevation>storyOf(w).elevation).map(s=>[s.id,s.name])])}${gableSectionHtml}<div class="section-header">OPENING HEADER LEVELS</div>${winHead}${doorHead}<div class="empty-prop">Head level is measured above the wall base. For custom values, select an individual opening and edit its head level.</div>${studManageHtml}${wallConnectorsHtml}<div class="section-header">TIMBER FRAMING & C16/C24 SIZES</div>${choice('Generate','framing.enabled',String(c.enabled),[['true','Enabled'],['false','Disabled']])}${choice('Stud Material Profile (3D)','framing.studMaterial',c.studMaterial||'dimensional',[['dimensional','Dimensional (Solid Timber)'],['ijoist','I-Joist (LVL Flanges + OSB Web)'],['lvl','LVL (Multi-Ply Laminated)']])}${choice('Header Material Profile (3D)','framing.headerMaterial',c.headerMaterial||'dimensional',[['dimensional','Dimensional (Built-Up Timber)'],['lvl','LVL (Multi-Ply Laminated)'],['ijoist','I-Joist (Flanges + OSB Web)']])}${choice('Plate Material Profile (3D)','framing.plateMaterial',c.plateMaterial||'dimensional',[['dimensional','Dimensional (Solid Timber)'],['lvl','LVL (Multi-Ply Laminated)'],['ijoist','I-Joist (Flanges + OSB Web)']])}${choice('Timber Section (C16/C24)','framing.timberSize',curPreset,timberOpts)}${choice('Timber Grade','framing.timberGrade',c.timberGrade||'C16',gradeOpts)}${field('Stud width','framing.studWidth',c.studWidth,'mm')}${field('Stud depth / Wall width','framing.studDepth',c.studDepth,'mm')}<div class="section-header">WALL CONNECTIONS (10 CODES)</div><div style="padding:0 18px 8px;font-size:10.5px;color:#1e3a8a;display:flex;align-items:center;justify-content:space-between"><span>Active Style: <strong>${c.cornerDetail==='auto'?'Auto ('+cornerDetailLabel(effectiveCorner)+')':cornerDetailLabel(c.cornerDetail)}</strong></span></div>${choice('Corner Style (Exterior)','framing.cornerDetail',c.cornerDetail||'auto',cornerOpts)}${choice('Intersection (Interior)','framing.insideJunctionDetail',c.insideJunctionDetail||'auto',junctionOpts)}<div class="wall-property-actions" style="margin-top:6px;margin-bottom:12px"><button class="primary" data-wall-action="cornerDetail" style="width:100%;font-size:11px;padding:8px 10px;background:#0369a1;border-color:#0369a1;color:#fff">⚡ Choose Connection (Visual Diagram Modal)</button></div><div class="junction-detail-label">Internal wall intersection preview</div>${insideJunctionOptionsHtml(c.insideJunctionDetail)}<div class="empty-prop">Choose the through-wall (the wall that continues past the join). The terminating wall is detected automatically. These are framing-layout details; verify fasteners and structural capacity for the project.</div>${(c.insideJunctionDetail==='insideBlocking'||c.insideJunctionDetail==='int_opt2')?field('Blocking spacing','framing.blockingSpacing',c.blockingSpacing,'mm'):''}${choice('Stud Spacing Preset','framing.spacingPreset',c.spacing===300?'300':c.spacing===400?'400':c.spacing===600?'600':c.spacing===406.4?'406.4':c.spacing===609.6?'609.6':'custom',[['300','300 mm O.C. (Heavy load metric)'],['400','400 mm O.C. (Exact metric)'],['406.4','16" O.C. (406.4 mm)'],['600','600 mm O.C. (Exact metric)'],['609.6','24" O.C. (609.6 mm)'],['custom','Custom (enter below)']])}${field('Spacing O.C.','framing.spacing',c.spacing,'mm')}${field('Top plates','framing.topPlates',c.topPlates)}${field('Bottom plates','framing.bottomPlates',c.bottomPlates)}${field('Plate thickness','framing.plateThickness',c.plateThickness,'mm')}${choice('Auto-size header depth','framing.autoHeaderDepth',String(c.autoHeaderDepth!==false),[['true','Automatic by opening span'],['false','Use fixed depth below']])}${field('Header depth','framing.headerDepth',c.headerDepth,'mm')}${field('Header plies','framing.headerPlies',c.headerPlies)}<div class="section-header">STRUCTURAL OSB / PLYWOOD SHEATHING</div>${choice('Sheathing Face / Side','sheathingSide',getWallSheathingSide(w),[['exterior','Exterior Face (Outside)'],['interior','Interior Face (Inside)'],['both','Both Sides (Double Sheathed)'],['none','None (Unsheathed)']])}<div class="wall-property-actions" style="margin-top:6px;margin-bottom:8px"><button class="subtle" data-wall-action="flipSheathing" style="width:100%;font-size:11px;padding:7px 10px;background:#fff7ed;border-color:#fdba74;color:#c2410c;font-weight:700">🔄 Flip Sheathing Face (${getWallSheathingSide(w).toUpperCase()})</button></div><div class="wall-property-actions"><button class="subtle" data-wall-action="panel">Wall panel</button><button class="subtle" data-wall-action="cutlist">Cut list</button><button class="subtle" data-wall-action="junctionAudit">Check all intersections</button></div><div class="empty-prop">Framing regenerates from this wall and its openings. Member sizes follow C16 / C24 standards.</div>`;
}
function setWallProperty(w,key,value){
  if(key==='gableMode'){
    w.gableMode=value;
    if(!w.framing)w.framing=construction(w);
    w.framing.gableMode=value;
    if(value==='none'){
      w.gableWall=false;
      if(w.gableProfile)w.gableProfile.enabled=false;
    }else if(value==='gable'){
      w.gableWall=true;
      w.isGableWall=true;
      if(w.gableProfile)w.gableProfile.enabled=true;
    }else{
      delete w.gableWall;
      if(w.gableProfile)w.gableProfile.enabled=true;
    }
    return true;
  }
  if(key==='gablePitch'){
    const p=Number(value);
    if(!Number.isFinite(p)||p<5||p>75)throw Error('Enter a gable pitch between 5° and 75°.');
    w.gablePitch=p;
    if(!w.framing)w.framing=construction(w);
    w.framing.gablePitch=p;
    if(w.gableProfile){
      w.gableProfile.pitch=p;
      const len=distance(w.a,w.b);
      const ratio=Number.isFinite(w.gableProfile.peakRatio)?w.gableProfile.peakRatio:0.5;
      const peakX=len*ratio;
      const slope=Math.tan((p*Math.PI)/180);
      const eaveH=Number.isFinite(w.gableProfile.eaveHeight)?w.gableProfile.eaveHeight:heightOf(w);
      if(ratio<=0.03){
        w.gableProfile.peakRise=Math.round(len*slope);
        w.gableProfile.leftHeight=eaveH+w.gableProfile.peakRise;
        w.gableProfile.rightHeight=eaveH;
      }else if(ratio>=0.97){
        w.gableProfile.peakRise=Math.round(len*slope);
        w.gableProfile.leftHeight=eaveH;
        w.gableProfile.rightHeight=eaveH+w.gableProfile.peakRise;
      }else{
        w.gableProfile.peakRise=Math.round(Math.max(peakX,len-peakX)*slope);
        w.gableProfile.leftHeight=Math.round(eaveH+Math.max(0,w.gableProfile.peakRise-peakX*slope));
        w.gableProfile.rightHeight=Math.round(eaveH+Math.max(0,w.gableProfile.peakRise-(len-peakX)*slope));
      }
      w.gableProfile.peakHeight=eaveH+w.gableProfile.peakRise;
    }
    return true;
  }
  if(key==='sheathingSide'){
    w.sheathingSide=value;
    w.sheathingFlipped=(value==='interior');
    if(!w.framing)w.framing=construction(w);
    w.framing.sheathingSide=value;
    w.framing.sheathingFlipped=(value==='interior');
    return true;
  }
  if(key.startsWith('framing.')){
    const k=key.split('.')[1];
    if(k==='enabled'||k==='autoHeaderDepth'||k==='connectorsEnabled')value=value==='true';
    else if(k==='holdDownType'||k==='studTieType'||k==='plateStrapType'){
      w.framing={...construction(w),[k]:value};
      return true;
    }
    else if(k==='sheathingSide'){
      w.sheathingSide=value;
      w.sheathingFlipped=(value==='interior');
      if(!w.framing)w.framing=construction(w);
      w.framing.sheathingSide=value;
      w.framing.sheathingFlipped=(value==='interior');
      return true;
    }
    else if(k==='timberSize'){
      if(value==='custom')return true;
      const p=TIMBER_SIZES_C16_C24.find(x=>x.id===value);
      if(!p)throw Error('Invalid timber size preset.');
      const updated={...construction(w),studWidth:p.studWidth,studDepth:p.studDepth,timberGrade:p.timberGrade,plateThickness:p.studWidth};
      w.framing=updated;
      if(w.structure!=='composite')w.thickness=p.studDepth;
      return true;
    }
    else if(k==='timberGrade'){
      if(!['C14','C16','C18','C24','C30'].includes(value))throw Error('Invalid timber grade.');
      w.framing={...construction(w),timberGrade:value};
      return true;
    }
    else if(k==='studMaterial'||k==='headerMaterial'||k==='plateMaterial'){
      if(!['dimensional','ijoist','lvl'].includes(value))throw Error('Invalid framing material type.');
      w.framing={...construction(w),[k]:value};
      return true;
    }
    else if(k==='spacingPreset'){
      if(value==='custom')return true;
      const num=Number(value);
      if(Number.isFinite(num)&&num>0){
        w.framing={...construction(w),spacing:num};
      }
      return true;
    }
    else if(k==='cornerDetail'||k==='tDetail'){
      const validCorners = ['auto','ext_opt1','ext_opt2','ext_opt3','ext_opt4','ext_opt5','threeStud','twoStud','fourStud'];
      if(!(k==='cornerDetail'?validCorners:['backingStud','blocking']).includes(value))throw Error('Invalid junction detail.')
    }
    else if(k==='insideJunctionDetail'){
      const validInside = ['auto','int_opt1','int_opt2','int_opt3','int_opt4','int_opt5','insideBlocking','insideStudFull','insideStudPartial'];
      if(!validInside.includes(value))throw Error('Select one of the supported internal wall junction details.');
    }
    else if(!['insideJunctionDetail','cornerDetail','tDetail','enabled','autoHeaderDepth','connectorsEnabled','holdDownType','studTieType','plateStrapType','timberGrade','timberSize','studMaterial','headerMaterial','plateMaterial'].includes(k)&&(!Number.isFinite(value)||value<=0||value>10000||(k==='spacing'&&value<20)||(k==='studWidth'&&value<10)||(['topPlates','bottomPlates','headerPlies'].includes(k)&&(!Number.isInteger(value)||value>6))))throw Error('Enter valid member sizes, spacing, or plate counts.');
    if(k==='spacing'&&value<construction(w).studWidth)throw Error('Stud spacing must be at least the stud width.');
    if(k==='studDepth'){
      if(w.structure==='composite')throw Error('Composite stud depth follows the structural timber core.');
      w.thickness=value;
    }
    if(k==='studWidth'&&value>construction(w).spacing)throw Error('Stud width cannot exceed the spacing.');
    const updated={...construction(w),[k]:value};
    if(k==='insideJunctionDetail')updated.tDetail=(value==='insideBlocking'||value==='int_opt2')?'blocking':'backingStud';
    if(k==='tDetail')updated.insideJunctionDetail=value==='blocking'?'int_opt2':'int_opt1';
    w.framing=updated;
    return true;
  }
  if(['structure','composite'].includes(key)){
    w[key]=value;
    if(w.structure==='composite'){
      const preset=WALL_COMPOSITES[w.composite||'timber140'];
      w.skins=clone(preset.skins);
      w.thickness=w.skins.reduce((a,s)=>a+s.thickness,0);
    }
    return true;
  }
  return false;
}
function framingRun(w, customModel){
  const mModel=customModel||(typeof model!=='undefined'?model:(typeof window!=='undefined'?window.model:null));
  const elems=(mModel?.elements||[]).filter(e=>e.type==='wall'&&e.id!==w.id&&e.story===w.story&&construction(e).enabled);
  const len=distance(w.a,w.b),u=sub2(w.b,w.a),unit={x:u.x/(len||1),y:u.y/(len||1)};
  let start=0,end=len;
  const isWExt = isWallExtFlag(w);
  const bestAtEnd = { a: null, b: null };
  for(const other of elems){
    const v=sub2(other.b,other.a),vl=distance(other.a,other.b);
    if(vl<1||Math.abs((u.x*v.x+u.y*v.y)/(len*vl))>.15)continue;
    const joinTolerance=(w.thickness+other.thickness)/2+1;
    for(const k of ['a','b']){
      const minCornerDist = Math.min(distance(other.a, w[k]), distance(other.b, w[k]));
      const nearEnd = minCornerDist <= joinTolerance;
      const hit = segmentDistance(w[k], other.a, other.b);
      const isBranchT = !nearEnd && hit.distance <= joinTolerance && hit.t * vl > joinTolerance && (1 - hit.t) * vl > joinTolerance;
      if(!nearEnd && !isBranchT) continue;
      const footprint=framingMemberWorld(other,{x0:-10000,x1:vl+10000,depth:construction(other).studDepth}),
            values=footprint.map(p=>(p.x-w.a.x)*unit.x+(p.y-w.a.y)*unit.y),
            lo=Math.min(...values),hi=Math.max(...values),
            through=nearEnd && isCornerThroughWall(w, other);
      const sameKind = isWallExtFlag(other) === isWExt;
      const score = nearEnd ? (sameKind ? 3 : 2) : 1;
      const prev = bestAtEnd[k];
      if (!prev || score > prev.score || (score === prev.score && (nearEnd ? minCornerDist : hit.distance) < prev.dist)) {
        bestAtEnd[k] = { val: k === 'a' ? (through ? lo : hi) : (through ? hi : lo), score, dist: nearEnd ? minCornerDist : hit.distance };
      }
    }
  }
  if (bestAtEnd.a) start = bestAtEnd.a.val;
  if (bestAtEnd.b) end = bestAtEnd.b.val;
  return {start,end};
}

function veryTopPlateRun(w, customModel){
  const mModel=customModel||(typeof model!=='undefined'?model:(typeof window!=='undefined'?window.model:null));
  const c=construction(w);
  if(!c.enabled||c.topPlates<=1)return framingRun(w, mModel);
  const elems=(mModel?.elements||[]).filter(e=>e.type==='wall'&&e.id!==w.id&&e.story===w.story&&construction(e).enabled);
  const len=distance(w.a,w.b),u=sub2(w.b,w.a),unit={x:u.x/(len||1),y:u.y/(len||1)};
  let start=0,end=len;
  const isWExt = isWallExtFlag(w);
  const bestAtEnd = { a: null, b: null };
  for(const other of elems){
    const v=sub2(other.b,other.a),vl=distance(other.a,other.b);
    if(vl<1||Math.abs((u.x*v.x+u.y*v.y)/(len*vl))>.15)continue;
    const joinTolerance=(w.thickness+other.thickness)/2+1;
    for(const k of ['a','b']){
      const minCornerDist = Math.min(distance(other.a, w[k]), distance(other.b, w[k]));
      const nearEnd = minCornerDist <= joinTolerance;
      const hit = segmentDistance(w[k], other.a, other.b);
      const isBranchT = !nearEnd && hit.distance <= joinTolerance && hit.t * vl > joinTolerance && (1 - hit.t) * vl > joinTolerance;
      if(!nearEnd && !isBranchT) continue;
      const footprint=framingMemberWorld(other,{x0:-10000,x1:vl+10000,depth:construction(other).studDepth}),
            values=footprint.map(p=>(p.x-w.a.x)*unit.x+(p.y-w.a.y)*unit.y),
            lo=Math.min(...values),hi=Math.max(...values),
            otherHasVeryTop = construction(other).topPlates > 1;
      let vtThrough;
      if (!otherHasVeryTop) {
        vtThrough = nearEnd && isCornerThroughWall(w, other);
      } else if (nearEnd) {
        // Invert corner priority relative to the lower Top Plate so the abutting wall's Very Top Plate
        // overlaps across the through-wall's lower Top Plate all the way to the outer corner.
        vtThrough = !isCornerThroughWall(w, other);
      } else {
        // At a T-junction, the terminating branch wall's Very Top Plate extends across the through-wall's
        // lower Top Plate (unless an opposing branch wall on the opposite side of the same through-wall wins).
        const opposingBranch = elems.find(eb => {
          if (eb.id === other.id || eb.id === w.id) return false;
          const ebLen = distance(eb.a, eb.b), ebV = sub2(eb.b, eb.a);
          if (ebLen < 1 || Math.abs((ebV.x * v.x + ebV.y * v.y) / (ebLen * vl)) > .15) return false;
          const ebTol = (eb.thickness + other.thickness) / 2 + 1;
          return [eb.a, eb.b].some(ep => {
            const h2 = segmentDistance(ep, other.a, other.b);
            return h2.distance <= ebTol && Math.hypot(h2.point.x - hit.point.x, h2.point.y - hit.point.y) <= joinTolerance;
          });
        });
        vtThrough = opposingBranch ? isCornerThroughWall(w, opposingBranch) : true;
      }
      const sameKind = isWallExtFlag(other) === isWExt;
      const score = nearEnd ? (sameKind ? 3 : 2) : 1;
      const prev = bestAtEnd[k];
      if (!prev || score > prev.score || (score === prev.score && (nearEnd ? minCornerDist : hit.distance) < prev.dist)) {
        bestAtEnd[k] = { val: k === 'a' ? (vtThrough ? lo : hi) : (vtThrough ? hi : lo), score, dist: nearEnd ? minCornerDist : hit.distance };
      }
    }
  }
  // Side-by-side (collinear / inline) walls meeting end-to-end:
  // Stagger the Very Top Plate across the collinear wall joint by one plate/stud depth
  // without altering any L-corner or T-junction Very Top Plate overlap.
  for(const other of elems){
    const v=sub2(other.b,other.a),vl=distance(other.a,other.b);
    if(vl<1)continue;
    const absDot=Math.abs((u.x*v.x+u.y*v.y)/(len*vl));
    if(absDot<0.98)continue;
    const oc=construction(other);
    if(!oc.enabled||oc.topPlates<=1)continue;
    const joinTolerance=Math.max((w.thickness+other.thickness)/2+2,(c.studWidth||38)*2);
    for(const k of ['a','b']){
      if(bestAtEnd[k]&&bestAtEnd[k].score>=1)continue;
      const dA=distance(other.a,w[k]),dB=distance(other.b,w[k]);
      const ok=dA<=dB?'a':'b';
      const rawDist=Math.min(dA,dB);
      const wCenterEnd=wallCenterPoint(w,w[k]);
      const oCenterEnd=wallCenterPoint(other,other[ok]);
      const centerDist=distance(wCenterEnd,oCenterEnd);
      const endDist=Math.min(rawDist,centerDist);
      if(endDist>joinTolerance)continue;
      const otherFar=other[ok==='a'?'b':'a'];
      const projFar=(otherFar.x-w.a.x)*unit.x+(otherFar.y-w.a.y)*unit.y;
      if(k==='a'&&projFar>=-10)continue;
      if(k==='b'&&projFar<=len+10)continue;
      const centerDelta=sub2(oCenterEnd,wCenterEnd);
      const lateralDist=Math.abs(-unit.y*centerDelta.x+unit.x*centerDelta.y);
      if(lateralDist>(w.thickness+other.thickness)/2+2)continue;
      const jointPt={x:(w[k].x+other[ok].x)/2,y:(w[k].y+other[ok].y)/2};
      const jointX=(jointPt.x-w.a.x)*unit.x+(jointPt.y-w.a.y)*unit.y;
      const lap=Math.min(c.studDepth||140,oc.studDepth||140,Math.floor(Math.min(len,vl)*0.35));
      if(lap<10)continue;
      const wExtends=isCornerThroughWall(w,other);
      const val=k==='a'?(wExtends?jointX-lap:jointX+lap):(wExtends?jointX+lap:jointX-lap);
      const prev=bestAtEnd[k];
      if(!prev||endDist<prev.dist){
        bestAtEnd[k]={val,score:0.5,dist:endDist};
      }
    }
  }
  if (bestAtEnd.a) start = bestAtEnd.a.val;
  if (bestAtEnd.b) end = bestAtEnd.b.val;
  return {start,end};
}

function veryTopPlateSegments(w, customModel){
  const mModel=customModel||(typeof model!=='undefined'?model:(typeof window!=='undefined'?window.model:null));
  const vtRun=veryTopPlateRun(w, mModel);
  const c=construction(w);
  if(!c.enabled||c.topPlates<=1)return [[vtRun.start,vtRun.end]];
  const len=distance(w.a,w.b),u=sub2(w.b,w.a),unit={x:u.x/(len||1),y:u.y/(len||1)};
  const elems=(mModel?.elements||[]).filter(e=>e.type==='wall'&&e.id!==w.id&&e.story===w.story&&construction(e).enabled);
  const junctions=wallFramingJunctions(w, mModel);
  let segs=[[vtRun.start,vtRun.end]];
  for(const j of junctions){
    if(j.type!=='T-junction studs')continue;
    const other=elems.find(e=>e.id===j.otherId);
    if(!other)continue;
    const oc=construction(other);
    if(!oc.enabled||oc.topPlates<=1)continue;
    const otherLen=distance(other.a,other.b);
    if(otherLen<1)continue;
    const bx=j.branchEnd==='a'?0:otherLen;
    const foot=framingMemberWorld(other,{x0:bx,x1:bx,depth:oc.studDepth});
    const proj=foot.map(p=>(p.x-w.a.x)*unit.x+(p.y-w.a.y)*unit.y);
    const cutLo=Math.min(...proj),cutHi=Math.max(...proj);
    if(!Number.isFinite(cutLo)||!Number.isFinite(cutHi)||cutHi-cutLo<1)continue;
    segs=segs.flatMap(([a,b])=>{
      if(cutHi<=a+1||cutLo>=b-1)return [[a,b]];
      const out=[];
      if(cutLo-a>1)out.push([a,cutLo]);
      if(b-cutHi>1)out.push([cutHi,b]);
      return out;
    });
  }
  return segs.length?segs:[[vtRun.start,vtRun.end]];
}

if(typeof window!=='undefined'){
  window.TIMBER_SIZES_C16_C24=TIMBER_SIZES_C16_C24;
  window.getTimberPresetId=getTimberPresetId;
  window.getWallSheathingSide=getWallSheathingSide;
  window.flipWallSheathing=flipWallSheathing;
  window.generateWallFraming=generateWallFraming;
  window.findStudById=findStudById;
  window.updateStudSize=updateStudSize;
  window.moveStudById=moveStudById;
  window.rotateStudById=rotateStudById;
  window.addExtraStudById=addExtraStudById;
  window.insertCustomStudAtCoordinate=insertCustomStudAtCoordinate;
  window.deleteStudById=deleteStudById;
  window.restoreWallDeletedStuds=restoreWallDeletedStuds;
  window.clearWallStudOverrides=clearWallStudOverrides;
  window.evaluateWallStudCapacity=evaluateWallStudCapacity;
  window.evaluateNDS2024StudCapacity=evaluateNDS2024StudCapacity;
  window.auditWallStructuralWarning=auditWallStructuralWarning;
  window.suggestOptimalWallFraming=suggestOptimalWallFraming;
  window.applyWallFramingSuggestion=applyWallFramingSuggestion;
  window.auditAllStructuralWarnings=auditAllStructuralWarnings;
  window.wallCenterPoint=wallCenterPoint;
  window.wallBase=wallBase;
  window.referenceOffset=referenceOffset;
  window.coreGeometry=coreGeometry;
  window.wallLayers=wallLayers;
  window.framingProperties=framingProperties;
  window.setWallProperty=setWallProperty;
  window.framingCutRows=framingCutRows;
  window.framingCSV=framingCSV;
  window.auditWallFraming=auditWallFraming;
  window.auditAllWallJunctions=auditAllWallJunctions;
  window.validateJunctionBackingAndCornerPacks=validateJunctionBackingAndCornerPacks;
  window.fixWallJunctionBackingStuds=fixWallJunctionBackingStuds;
  window.auditWallStudCollisions=auditWallStudCollisions;
  window.auditAllStudCollisions=auditAllStudCollisions;
  window.calculateJunctionStudOffset=calculateJunctionStudOffset;
  window.generateJunctionAwareStudPositions=generateJunctionAwareStudPositions;
  window.autoAdjustStudOffsetsForJunctionGeometry=autoAdjustStudOffsetsForJunctionGeometry;
  window.fixWallStudCollisions=fixWallStudCollisions;
  window.autoShiftCollidingStuds=autoShiftCollidingStuds;
  window.autoShiftCollidingStudsBasedOnJunctionGeometry=autoShiftCollidingStuds;
  window.autoFixAllOverlappingStuds=autoFixAllOverlappingStuds;
  window.wallFramingJunctions=wallFramingJunctions;
  window.insideJunctionLabel=insideJunctionLabel;
  window.insideJunctionOptionsHtml=insideJunctionOptionsHtml;
  window.insideJunctionCenter=insideJunctionCenter;
  window.drawWallPanel=drawWallPanel;
  window.orderStoryWallsAndOpenings=orderStoryWallsAndOpenings;
  window.getStoryWallCodeMap=getStoryWallCodeMap;
  window.getWallPanelCode=getWallPanelCode;
  window.updateWallPanelListHUD=updateWallPanelListHUD;
  window.selectWallInPanelView=selectWallInPanelView;
  window.construction=construction;
  window.validateConstruction=validateConstruction;
  window.framingRun=framingRun;
  window.veryTopPlateRun=veryTopPlateRun;
  window.veryTopPlateSegments=veryTopPlateSegments;
  window.framingMemberWorld=framingMemberWorld;
  window.autoConfigureWallJunctionStudPacks=autoConfigureWallJunctionStudPacks;
  window.EXTERIOR_CORNER_OPTIONS=EXTERIOR_CORNER_OPTIONS;
  window.INTERIOR_JUNCTION_OPTIONS=INTERIOR_JUNCTION_OPTIONS;
  window.resolveCornerDetail=resolveCornerDetail;
  window.resolveJunctionDetail=resolveJunctionDetail;
  window.renderConnectionSvg=renderConnectionSvg;
  window.cornerDetailLabel=cornerDetailLabel;
  window.cornerDetailDiagram=cornerDetailDiagram;
  window.cornerDetailOptionsHtml=cornerDetailOptionsHtml;
  window.WALL_STUD_CATEGORY_PALETTE=WALL_STUD_CATEGORY_PALETTE;
  window.getWallMemberCategoryInfo=getWallMemberCategoryInfo;
  window.FRAMING_DEFAULTS=FRAMING_DEFAULTS;
}

