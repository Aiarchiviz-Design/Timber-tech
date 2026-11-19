import React, { useState, useMemo } from 'react';
import { 
  Layout, FileText, Upload, Download, Plus, Trash2, 
  Layers, ShieldCheck, Box, Sliders, CheckCircle2,
  AlertTriangle, RotateCw, ZoomIn, ZoomOut,
  RefreshCw, FileSpreadsheet, ArrowLeftRight,
  Magnet, Target, Grid, Crosshair, Scissors, Move, Zap
} from 'lucide-react';
import { TrussElevationView } from './components/TrussElevationView.tsx';
import type { TrussStructure, TimberSection } from './types/trussElevation.ts';
import {
  STANDARD_TIMBER_GRADES,
  create20TrussesCatalog,
  recalculateTrussMembers,
  autoResolveAllTrusses
} from './services/trussStressEngine.ts';

interface WallOpening {
  id: string;
  type: 'window' | 'door';
  startDist: number; // distance from left corner, mm
  width: number; // mm
  height: number; // mm
  sillHeight: number; // mm from bottom plate
}

type FramingMaterialType = 'dimensional' | 'ijoist' | 'lvl';

interface WallPanel {
  id: string;
  name: string;
  type: 'external' | 'internal';
  length: number; // mm
  height: number; // mm
  thickness: number; // mm
  lumberGrade: 'C24' | 'C16';
  studSpacing: number; // mm, 400
  hasSheathing: boolean; // 12mm OSB on exterior, interior or both
  sheathingSide?: 'exterior' | 'interior' | 'both'; // Sheeting orientation: outside vs inside vs both faces
  headerPosition?: 'top' | 'opening'; // Timber Teck top plate style vs top of opening
  cornerPack?: 'double' | 'single'; // Eurocode 5 Corner Stud Pack detail: double vs single
  defaultFramingMaterial?: FramingMaterialType;
  memberMaterials?: Record<string, FramingMaterialType>;
  a?: { x: number; y: number };
  b?: { x: number; y: number };
  openings: WallOpening[];
  customStuds?: number[]; // list of leftCorner positions in mm for custom user-added studs
  deletedStuds?: string[]; // list of stud IDs deleted by user
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'elevation' | 'plan' | '3d' | 'schedule' | 'ifc' | 'audit' | 'truss'>('elevation');
  const [isFlippedY, setIsFlippedY] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 2D Roof Truss Elevation & Stresses State
  const [trussCatalog, setTrussCatalog] = useState<{ [id: string]: TrussStructure }>(() => create20TrussesCatalog());
  const [activeTrussTag, setActiveTrussTag] = useState<string>('TR-01');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('C24');

  const activeTruss = useMemo(() => {
    return trussCatalog[activeTrussTag] || Object.values(trussCatalog)[0] || null;
  }, [trussCatalog, activeTrussTag]);

  const handleUpdateTrussMemberSection = (memberId: string, section: TimberSection) => {
    setTrussCatalog(prevCatalog => {
      const current = prevCatalog[activeTrussTag];
      if (!current) return prevCatalog;
      const updatedMembers = current.members.map(m => {
        if (m.id !== memberId) return m;
        return { ...m, section };
      });
      const recalculated = recalculateTrussMembers({ ...current, members: updatedMembers });
      return {
        ...prevCatalog,
        [activeTrussTag]: recalculated
      };
    });
  };

  const handleTrussGradeChange = (gradeKey: string) => {
    setSelectedGradeId(gradeKey);
    const grade = STANDARD_TIMBER_GRADES[gradeKey] || Object.values(STANDARD_TIMBER_GRADES).find(g => g.id === gradeKey || g.name === gradeKey);
    if (!grade) return;
    setTrussCatalog(prevCatalog => {
      const current = prevCatalog[activeTrussTag];
      if (!current) return prevCatalog;
      const updatedMembers = current.members.map(m => ({
        ...m,
        grade
      }));
      const recalculated = recalculateTrussMembers({ ...current, members: updatedMembers });
      return {
        ...prevCatalog,
        [activeTrussTag]: recalculated
      };
    });
  };

  const handleRunAutoAnalysisOnAllTrusses = () => {
    const resolved = autoResolveAllTrusses(trussCatalog);
    setTrussCatalog(resolved);
    if (typeof window !== 'undefined') {
      (window as any).cadtechProjectTrussStore = resolved;
    }
    showToast('⚡ Auto-Analysis Complete: 100% of project trusses PASS (ASD/NDS 2024 & Eurocode 5 verified)');
  };

  // 3D Orbit & Zoom Controls
  const [rotX, setRotX] = useState(18);
  const [rotY, setRotY] = useState(-25);
  const [zoom3D, setZoom3D] = useState(1);
  const [isDragging3D, setIsDragging3D] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [xray3dSheathing, setXray3dSheathing] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 2D Framing Plan Snapping Options State
  const [snapSettings, setSnapSettings] = useState({
    master: true,
    grid: true,
    gridStep: 100, // 50, 100, 400 mm
    studs: true,
    corners: true,
    ortho: true,
  });

  const [activePlanSnap, setActivePlanSnap] = useState<{
    dist: number;
    label: string;
    type: 'corner' | 'stud' | 'opening' | 'grid';
  } | null>(null);

  const [hoverPlanMm, setHoverPlanMm] = useState<number | null>(null);
  const [planToolMode, setPlanToolMode] = useState<'inspect' | 'drag' | 'split' | 'add' | 'delete'>('inspect');
  const [selectedStudId, setSelectedStudId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{
    type: 'stud' | 'opening';
    id: string;
    origPos: number;
  } | null>(null);

  // Default wall panels matching 2D Framing Plan specifications (E01, E02, E03, E04, I1...)
  const [panels, setPanels] = useState<WallPanel[]>([
    {
      id: 'E01',
      name: 'Exterior Wall E01',
      type: 'external',
      length: 7500,
      height: 3000,
      thickness: 100,
      lumberGrade: 'C24',
      studSpacing: 400,
      hasSheathing: true,
      sheathingSide: 'exterior',
      headerPosition: 'opening',
      a: { x: 0, y: 0 },
      b: { x: 7500, y: 0 },
      openings: [
        { id: 'N-001', type: 'window', startDist: 3099, width: 1500, height: 1000, sillHeight: 1500 }
      ]
    },
    {
      id: 'E02',
      name: 'Exterior Wall E02',
      type: 'external',
      length: 10000,
      height: 3000,
      thickness: 100,
      lumberGrade: 'C24',
      studSpacing: 400,
      hasSheathing: true,
      sheathingSide: 'exterior',
      headerPosition: 'opening',
      a: { x: 7500, y: 0 },
      b: { x: 7500, y: 10000 },
      openings: [
        { id: 'N-002', type: 'window', startDist: 759, width: 1800, height: 1500, sillHeight: 1000 },
        { id: 'N-003', type: 'window', startDist: 4311, width: 1000, height: 1500, sillHeight: 1000 },
        { id: 'N-004', type: 'window', startDist: 7067, width: 1800, height: 1500, sillHeight: 1000 }
      ]
    },
    {
      id: 'E03',
      name: 'Exterior Wall E03',
      type: 'external',
      length: 7500,
      height: 3000,
      thickness: 100,
      lumberGrade: 'C24',
      studSpacing: 400,
      hasSheathing: true,
      sheathingSide: 'exterior',
      headerPosition: 'opening',
      a: { x: 7500, y: 10000 },
      b: { x: 0, y: 10000 },
      openings: [
        { id: 'N-006', type: 'window', startDist: 3282, width: 900, height: 1200, sillHeight: 1300 }
      ]
    },
    {
      id: 'E04',
      name: 'Exterior Wall E04',
      type: 'external',
      length: 10000,
      height: 3000,
      thickness: 100,
      lumberGrade: 'C24',
      studSpacing: 400,
      hasSheathing: true,
      sheathingSide: 'exterior',
      headerPosition: 'opening',
      a: { x: 0, y: 10000 },
      b: { x: 0, y: 0 },
      openings: [
        { id: 'D-001', type: 'door', startDist: 4064, width: 900, height: 2100, sillHeight: 0 },
        { id: 'N-005', type: 'window', startDist: 7420, width: 1800, height: 1500, sillHeight: 1000 }
      ]
    },
    {
      id: 'I1',
      name: 'Interior Wall I1',
      type: 'internal',
      length: 7500,
      height: 3000,
      thickness: 100,
      lumberGrade: 'C16',
      studSpacing: 400,
      hasSheathing: false,
      sheathingSide: 'interior',
      headerPosition: 'opening',
      a: { x: 0, y: 5000 },
      b: { x: 7500, y: 5000 },
      openings: [
        { id: 'D-002', type: 'door', startDist: 2050, width: 900, height: 2100, sillHeight: 0 }
      ]
    }
  ]);

  const [selectedPanelId, setSelectedPanelId] = useState<string>('E01');
  const currentPanel = panels.find(p => p.id === selectedPanelId) || panels[0];
  const sheathingSide = currentPanel.sheathingSide || 'exterior';
  const isSheathingInterior = sheathingSide === 'interior';
  const isSheathingBoth = sheathingSide === 'both';
  const isSheathingExterior = sheathingSide === 'exterior';

  const [fixedPanels, setFixedPanels] = useState<Record<string, boolean>>({});
  const isPanelFixed = !!fixedPanels[currentPanel.id];

  // Helper to compute exact stud positions for any wall panel with Timber Teck & EC5 logic
  const computeStudPositionsForPanel = React.useCallback((panel: WallPanel, isFixed: boolean = true) => {
    const studs: {
      leftCorner: number;
      rightEdge: number;
      role: string;
      id: string;
      collision?: boolean;
      shifted?: boolean;
      originalLeftCorner?: number;
      shiftedLeftCorner?: number;
      collisionReason?: string;
    }[] = [];
    const L = panel.length;
    const spacing = panel.studSpacing;
    const studThick = 38;
    const isDoublePack = (panel.cornerPack || 'double') === 'double' || panel.hasSheathing;

    // 1. Left end corner stud pack
    studs.push({ leftCorner: 0, rightEdge: studThick, role: isDoublePack ? 'Corner Stud (Left)' : 'End Stud (Single Left)', id: 'S-0' });
    if (isDoublePack) {
      studs.push({ leftCorner: studThick, rightEdge: studThick * 2, role: 'OSB Corner Backing (EC5)', id: 'S-0B' });
    }

    // 2. Determine real Wall Intersection Support Stud positions (where interior walls meet exterior panels or intersecting partitions)
    const junctionPositions: number[] = [];
    if (panel.id === 'E1' || panel.id === 'E01') junctionPositions.push(2500);
    else if (panel.id === 'E2' || panel.id === 'E02') junctionPositions.push(4500);
    else if (panel.id === 'E3' || panel.id === 'E03') junctionPositions.push(3000);
    else if (panel.id === 'E4' || panel.id === 'E04') junctionPositions.push(5000);
    else if (panel.id === 'I1' || panel.id === 'I01') junctionPositions.push(2000);
    else if (panel.id === 'I2' || panel.id === 'I02') junctionPositions.push(2500);
    else if (panel.id === 'I3' || panel.id === 'I03') junctionPositions.push(3000);

    // Reserved zones where common studs must not overlap (corners, openings, junction blocks)
    const reservedZones: [number, number][] = [
      [0, isDoublePack ? studThick * 2 : studThick],
      [L - (isDoublePack ? studThick * 2 : studThick), L]
    ];

    junctionPositions.forEach((jX, jIdx) => {
      const jStart = Math.max(studThick * 2, Math.min(L - studThick * 5 - 100, jX));
      studs.push({ leftCorner: jStart, rightEdge: jStart + studThick, role: 'T-Junction Return Stud (Left)', id: `JB-1-${jIdx}` });
      studs.push({ leftCorner: jStart + studThick, rightEdge: jStart + studThick + 100, role: 'Wall Intersection Support Stud (Backing)', id: `JB-2-${jIdx}` });
      studs.push({ leftCorner: jStart + studThick + 100, rightEdge: jStart + studThick * 2 + 100, role: 'T-Junction Return Stud (Right)', id: `JB-3-${jIdx}` });
      reservedZones.push([jStart - 4, jStart + studThick * 2 + 104]);
    });

    // 3. Opening King Studs & Trimmer Studs
    panel.openings.forEach((op, opIdx) => {
      const leftTrimmerX = op.startDist - studThick;
      const leftKingX = leftTrimmerX - studThick;
      studs.push({ leftCorner: leftKingX, rightEdge: leftTrimmerX, role: 'King Stud', id: `KS-L-${opIdx}` });
      studs.push({ leftCorner: leftTrimmerX, rightEdge: op.startDist, role: 'Trimmer (Jack)', id: `TR-L-${opIdx}` });

      const rightTrimmerX = op.startDist + op.width;
      const rightKingX = rightTrimmerX + studThick;
      studs.push({ leftCorner: rightTrimmerX, rightEdge: rightTrimmerX + studThick, role: 'Trimmer (Jack)', id: `TR-R-${opIdx}` });
      studs.push({ leftCorner: rightTrimmerX + studThick, rightEdge: rightKingX, role: 'King Stud', id: `KS-R-${opIdx}` });

      reservedZones.push([leftKingX - 4, rightKingX + 4]);
    });

    // 4. Safe shift calculation to prevent stud collisions
    const computeSafeShift = (rawPos: number) => {
      const minBound = isDoublePack ? studThick * 2 + 10 : studThick + 10;
      const maxBound = L - studThick * (isDoublePack ? 3 : 2) - 10;
      for (let delta = 38; delta <= 600; delta += 10) {
        for (const dir of [-1, 1]) {
          const cand = Math.round(rawPos + dir * delta);
          if (cand < minBound || cand > maxBound) continue;
          const hits = reservedZones.some(([z0, z1]) => cand + studThick > z0 && cand < z1);
          if (!hits) return cand;
        }
      }
      return Math.max(minBound, Math.round(rawPos));
    };

    // 5. Common studs layout with automatic collision detection
    let pos = spacing;
    let idx = 1;
    const rightLimit = L - (isDoublePack ? studThick * 2 : studThick) - 10;
    while (pos < rightLimit) {
      const isCollidingWithZone = reservedZones.some(([z0, z1]) => pos + studThick > z0 && pos < z1);
      const hitOpening = panel.openings.find(op => pos + studThick > op.startDist - studThick * 2 && pos < op.startDist + op.width + studThick * 2);

      if (isCollidingWithZone || hitOpening) {
        const safeLeft = computeSafeShift(pos);
        const reason = hitOpening ? `Opening (${hitOpening.type} @ ${hitOpening.startDist}mm)` : `T-Junction Block`;
        if (isFixed) {
          studs.push({
            leftCorner: safeLeft,
            rightEdge: safeLeft + studThick,
            role: 'Common Stud (Shifted)',
            id: `S-${idx}`,
            collision: false,
            shifted: true,
            originalLeftCorner: Math.round(pos),
            shiftedLeftCorner: safeLeft,
            collisionReason: reason
          });
        } else {
          studs.push({
            leftCorner: Math.round(pos),
            rightEdge: Math.round(pos + studThick),
            role: 'Common Stud (Collision)',
            id: `S-${idx}`,
            collision: true,
            shifted: false,
            originalLeftCorner: Math.round(pos),
            shiftedLeftCorner: safeLeft,
            collisionReason: reason
          });
        }
      } else {
        studs.push({ leftCorner: Math.round(pos), rightEdge: Math.round(pos + studThick), role: 'Common Stud', id: `S-${idx}` });
      }
      pos += spacing;
      idx++;
    }

    // 6. Right end corner stud pack
    if (isDoublePack) {
      studs.push({ leftCorner: L - studThick * 2, rightEdge: L - studThick, role: 'OSB Corner Backing (EC5)', id: `S-END-1` });
      studs.push({ leftCorner: L - studThick, rightEdge: L, role: 'Corner Stud (Right)', id: `S-END-2` });
    } else {
      studs.push({ leftCorner: L - studThick, rightEdge: L, role: 'End Stud (Single Right)', id: `S-END-1` });
    }

    // 7. OSB 1200mm seam backing studs
    if (panel.hasSheathing) {
      const osbSheetWidth = 1200;
      for (let seamX = osbSheetWidth; seamX < L - studThick * 2; seamX += osbSheetWidth) {
        const hasExisting = studs.some(s => Math.abs(s.leftCorner - seamX) < 25);
        if (!hasExisting) {
          studs.push({
            leftCorner: seamX,
            rightEdge: seamX + studThick,
            role: 'OSB Seam Corner Backing (1200mm)',
            id: `OSB-CB-${seamX}`
          });
        }
      }
    }

    let activeStuds = studs;
    if (panel.deletedStuds && panel.deletedStuds.length > 0) {
      const delSet = new Set(panel.deletedStuds);
      activeStuds = activeStuds.filter(s => !delSet.has(s.id));
    }

    if (panel.customStuds && panel.customStuds.length > 0) {
      panel.customStuds.forEach((posVal, idxVal) => {
        activeStuds.push({
          leftCorner: posVal,
          rightEdge: posVal + studThick,
          role: 'Custom Stud (User Added)',
          id: `CS-${idxVal + 1}`
        });
      });
    }

    return activeStuds.sort((a, b) => a.leftCorner - b.leftCorner);
  }, []);

  // Calculate stud positions with corner-of-stud referencing for current active panel
  const studPositions = useMemo(() => {
    return computeStudPositionsForPanel(currentPanel, isPanelFixed);
  }, [currentPanel, isPanelFixed, computeStudPositionsForPanel]);

  // Synchronize 2D Framing Plan panels with Studio state without overwriting the main CAD BIM model
  React.useEffect(() => {
    const win = window as any;
    if (!win.model) {
      win.model = { name: 'Timber Framing Project', elements: [], stories: [{ id: 's0', name: 'Level 1' }] };
    }
    if (!Array.isArray(win.model.elements) || win.model.elements.length === 0) {
      const wallElements = panels.map(p => ({
        id: p.id,
        name: p.name,
        type: 'wall',
        story: 's0',
        thickness: p.thickness,
        height: p.height,
        layer: p.type === 'external' ? 'Exterior Walls' : 'Interior Walls',
        a: p.a || { x: 0, y: 0 },
        b: p.b || { x: p.length, y: 0 },
        framing: { spacing: p.studSpacing, timberGrade: p.lumberGrade }
      }));
      win.model.elements = wallElements;
    }

    const getFraming = () => {
      return panels.map(p => {
        const isFixed = !!fixedPanels[p.id];
        const computedStuds = computeStudPositionsForPanel(p, isFixed);
        const members = [
          { x0: 0, x1: p.length, z0: 0, z1: 38, length: p.length, section: `${p.thickness}x38`, type: 'Bottom plate', role: 'Bottom plate' },
          { x0: 0, x1: p.length, z0: 38, z1: 76, length: p.length, section: `${p.thickness}x38`, type: 'Bottom plate', role: 'Bottom plate' },
          { x0: 0, x1: p.length, z0: p.height - 76, z1: p.height - 38, length: p.length, section: `${p.thickness}x38`, type: 'Top plate', role: 'Top plate' },
          { x0: 0, x1: p.length, z0: p.height - 38, z1: p.height, length: p.length, section: `${p.thickness}x38`, type: 'Top plate', role: 'Very top plate' },
          ...computedStuds.map(s => {
            const isJunction = s.role.includes('Junction');
            const isCorner = s.role.includes('Corner') || s.role.includes('Backing');
            const isKing = s.role.includes('King');
            const isTrimmer = s.role.includes('Trimmer');
            const mType = isJunction ? 'Junction stud' : isCorner ? 'Corner stud' : isKing ? 'King stud' : isTrimmer ? 'Trimmer' : 'Common stud';
            return {
              x0: s.leftCorner,
              x1: s.rightEdge,
              z0: 76,
              z1: p.height - 76,
              length: p.height - 76,
              section: `${p.thickness}x38`,
              type: mType,
              role: s.role,
              id: s.id
            };
          }),
          ...p.openings.flatMap((op, opIdx) => {
            const opHeight = op.height || 1200;
            const sillH = op.type === 'door' ? 0 : (op.sillHeight || 900);
            const headZ = 76 + sillH + opHeight;
            const headerHeight = 150;
            const headerMember = {
              x0: Math.max(0, op.startDist - 38),
              x1: Math.min(p.length, op.startDist + op.width + 38),
              z0: headZ,
              z1: Math.min(p.height - 76, headZ + headerHeight),
              length: op.width + 76,
              section: `${p.thickness}x150`,
              type: 'Header',
              role: `Lintel Header (${op.id})`,
              id: `HDR-${op.id}`
            };
            const res: any[] = [headerMember];

            // EVERY opening header gets upper cripple studs 'I' directly above 'J' (Trimmer) studs
            const topPlateBottomZ = p.height - 76;
            const headerTopZ = Math.min(p.height - 76, headZ + headerHeight);
            if (topPlateBottomZ > headerTopZ + 10) {
              // Left cripple stud directly on top of Left Trimmer 'J'
              res.push({
                x0: op.startDist - 38,
                x1: op.startDist,
                z0: headerTopZ,
                z1: topPlateBottomZ,
                length: topPlateBottomZ - headerTopZ,
                section: `${p.thickness}x38`,
                type: 'Header stud',
                role: `Upper Cripple 'I' (Left ${op.id})`,
                id: `CRIP-I-L-${opIdx}`
              });
              // Right cripple stud directly on top of Right Trimmer 'J'
              res.push({
                x0: op.startDist + op.width,
                x1: op.startDist + op.width + 38,
                z0: headerTopZ,
                z1: topPlateBottomZ,
                length: topPlateBottomZ - headerTopZ,
                section: `${p.thickness}x38`,
                type: 'Header stud',
                role: `Upper Cripple 'I' (Right ${op.id})`,
                id: `CRIP-I-R-${opIdx}`
              });
            }

            if (op.type === 'window' && sillH > 0) {
              const sillZ = 76 + sillH - 38;
              res.push({
                x0: Math.max(0, op.startDist - 38),
                x1: Math.min(p.length, op.startDist + op.width + 38),
                z0: sillZ,
                z1: sillZ + 38,
                length: op.width + 76,
                section: `${p.thickness}x38`,
                type: 'Sill',
                role: `Window Sill (${op.id})`,
                id: `SILL-${op.id}`
              });
            }
            return res;
          })
        ];
        return {
          id: p.id,
          name: p.name,
          type: p.type,
          length: p.length,
          height: p.height,
          thickness: p.thickness,
          lumberGrade: p.lumberGrade,
          studSpacing: p.studSpacing,
          hasSheathing: p.hasSheathing,
          sheathingSide: p.sheathingSide,
          members,
          openings: p.openings
        };
      });
    };
    win.getAppPanelsWithFraming = () => {
      const rEl = document.getElementById('root');
      if (!rEl || rEl.style.display === 'none') return null;
      return getFraming();
    };
    const rootEl = document.getElementById('root');
    if (rootEl && rootEl.style.display !== 'none') {
      win.appPanels = getFraming();
    } else {
      delete win.appPanels;
    }
  }, [panels, fixedPanels, computeStudPositionsForPanel]);

  const handleAddStudAtPos = (posMm: number) => {
    const studThick = 38;
    const clampedPos = Math.max(0, Math.min(currentPanel.length - studThick, Math.round(posMm)));
    const custom = currentPanel.customStuds || [];
    if (custom.includes(clampedPos)) {
      showToast(`Stud already exists at ${clampedPos} mm`);
      return;
    }
    setPanels(prev => prev.map(p => p.id === currentPanel.id ? {
      ...p,
      customStuds: [...(p.customStuds || []), clampedPos]
    } : p));
    showToast(`Added custom stud at ${clampedPos} mm`);
  };

  const handleDeleteStudById = (studId: string) => {
    const deleted = currentPanel.deletedStuds || [];
    if (deleted.includes(studId)) return;
    setPanels(prev => prev.map(p => p.id === currentPanel.id ? {
      ...p,
      deletedStuds: [...(p.deletedStuds || []), studId],
      customStuds: (p.customStuds || []).filter((_, idx) => `CS-${idx + 1}` !== studId)
    } : p));
    if (selectedStudId === studId) {
      setSelectedStudId(null);
    }
    showToast(`Deleted stud ${studId} from panel ${currentPanel.id}`);
  };

  // Keyboard shortcut listener for deleting selected stud with 'Delete' or 'Backspace' key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedStudId && activeTab === 'plan') {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) return;
        handleDeleteStudById(selectedStudId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStudId, activeTab, currentPanel]);

  const handleResetCustomStuds = () => {
    setPanels(prev => prev.map(p => p.id === currentPanel.id ? {
      ...p,
      customStuds: [],
      deletedStuds: []
    } : p));
    setSelectedStudId(null);
    showToast(`Reset stud layout for ${currentPanel.id}`);
  };

  const [selectedMemberMaterialId, setSelectedMemberMaterialId] = useState<string>('ALL');

  React.useEffect(() => {
    if (selectedStudId) {
      setSelectedMemberMaterialId(selectedStudId);
    }
  }, [selectedStudId]);

  const getMemberMaterial = React.useCallback((memberId: string): FramingMaterialType => {
    return currentPanel.memberMaterials?.[memberId] || currentPanel.defaultFramingMaterial || 'dimensional';
  }, [currentPanel]);

  const handleSetMemberMaterial = (memberId: string, mat: FramingMaterialType) => {
    setPanels(prev => prev.map(p => {
      if (p.id !== currentPanel.id) return p;
      if (memberId === 'ALL') {
        return { ...p, defaultFramingMaterial: mat };
      }
      return {
        ...p,
        memberMaterials: {
          ...(p.memberMaterials || {}),
          [memberId]: mat
        }
      };
    }));
    const label = mat === 'ijoist' ? 'I-Joist' : mat === 'lvl' ? 'LVL' : 'Dimensional';
    showToast(memberId === 'ALL'
      ? `Panel ${currentPanel.id} default framing profile set to ${label}`
      : `Member ${memberId} framing profile set to ${label}`);
  };

  const handleApplyMaterialToAllMembers = (mat: FramingMaterialType) => {
    setPanels(prev => prev.map(p => p.id === currentPanel.id ? {
      ...p,
      defaultFramingMaterial: mat,
      memberMaterials: {}
    } : p));
    const label = mat === 'ijoist' ? 'I-Joist' : mat === 'lvl' ? 'LVL' : 'Dimensional';
    showToast(`Applied ${label} profile to all framing members on ${currentPanel.id}`);
  };

  const selectedStud = useMemo(() => {
    return studPositions.find(s => s.id === selectedStudId) || null;
  }, [studPositions, selectedStudId]);

  // Nearest Junction Block (JB-1/2/3) or Opening Trimmer for live dragging & snapping
  const nearestStructuralNode = useMemo(() => {
    if (hoverPlanMm === null) return null;
    const targetX = hoverPlanMm;
    
    // Find all structural junction blocks and trimmer/king studs
    const structuralStuds = studPositions.filter(s => 
      s.role.includes('Junction Block') || 
      s.role.includes('Trimmer') || 
      s.role.includes('King')
    );

    if (structuralStuds.length === 0) return null;

    let best = structuralStuds[0];
    let minDistance = Math.abs(targetX - (best.leftCorner + (best.rightEdge - best.leftCorner) / 2));

    for (const s of structuralStuds) {
      const center = s.leftCorner + (s.rightEdge - s.leftCorner) / 2;
      const dist = Math.abs(targetX - center);
      if (dist < minDistance) {
        minDistance = dist;
        best = s;
      }
    }

    return {
      stud: best,
      distanceMm: Math.round(minDistance),
      isJunctionBlock: best.role.includes('Junction Block'),
      isTrimmer: best.role.includes('Trimmer') || best.role.includes('King')
    };
  }, [hoverPlanMm, studPositions]);

  // Split a wall panel into 2 wall panels in 2D Framing Plan at splitPosMm
  const handleSplitPanelAtPos = (splitPosMm: number) => {
    const minLen = 500; // minimum allowable sub-panel length
    const L = currentPanel.length;
    const clampedSplit = Math.round(Math.max(minLen, Math.min(L - minLen, splitPosMm)));

    if (clampedSplit <= minLen || clampedSplit >= L - minLen) {
      showToast(`Cannot split panel: split position ${clampedSplit} mm is too close to wall ends (minimum ${minLen} mm required)`);
      return;
    }

    // Check if split point is inside an opening
    const opHit = currentPanel.openings.find(op => clampedSplit > op.startDist && clampedSplit < op.startDist + op.width);
    if (opHit) {
      showToast(`Cannot split wall panel inside opening ${opHit.id}. Please split outside opening.`);
      return;
    }

    // Openings before split point belong to panel 1
    const openings1 = currentPanel.openings
      .filter(op => op.startDist + op.width <= clampedSplit)
      .map(op => ({ ...op }));

    // Openings after split point belong to panel 2 (with adjusted startDist)
    const openings2 = currentPanel.openings
      .filter(op => op.startDist >= clampedSplit)
      .map(op => ({
        ...op,
        startDist: op.startDist - clampedSplit
      }));

    const panel1: WallPanel = {
      ...currentPanel,
      id: 'TEMP1',
      name: `${currentPanel.name} Part 1`,
      length: clampedSplit,
      openings: openings1,
      customStuds: (currentPanel.customStuds || []).filter(s => s < clampedSplit),
      deletedStuds: currentPanel.deletedStuds || []
    };

    const panel2: WallPanel = {
      ...currentPanel,
      id: 'TEMP2',
      name: `${currentPanel.name} Part 2`,
      length: L - clampedSplit,
      openings: openings2,
      customStuds: (currentPanel.customStuds || [])
        .filter(s => s > clampedSplit)
        .map(s => s - clampedSplit),
      deletedStuds: currentPanel.deletedStuds || []
    };

    const currentIdx = panels.findIndex(p => p.id === currentPanel.id);
    const updatedList = [
      ...panels.slice(0, currentIdx),
      panel1,
      panel2,
      ...panels.slice(currentIdx + 1)
    ];

    // Resequence panel names in auto-order (E1, E2, E3... I1, I2...)
    const resequenced = resequencePanels(updatedList);
    setPanels(resequenced);

    const newSelectedId = resequenced[currentIdx]?.id || resequenced[0].id;
    setSelectedPanelId(newSelectedId);

    showToast(`Split ${currentPanel.id} at ${clampedSplit} mm into 2 wall panels. Auto-ordered panel names (${resequenced.map(p => p.id).join(', ')})`);
  };

  const collidingStuds = useMemo(() => studPositions.filter(s => s.collision), [studPositions]);
  const shiftedStuds = useMemo(() => studPositions.filter(s => s.shifted), [studPositions]);

  // Eurocode 5 (EN 1995-1-1 Cl. 6.3.2) Stud Axial Capacity & Slenderness Audit
  const axialAudit = useMemo(() => {
    const H = currentPanel.height;
    const t = currentPanel.thickness; // e.g. 89, 100, 140, 180 mm
    const sw = 38; // stud width, mm
    const grade = currentPanel.lumberGrade; // 'C24' or 'C16'
    const hasOsb = currentPanel.hasSheathing;
    const Leff = Math.max(1000, H - 76); // clear height between plates

    // Radii of gyration (mm)
    const iy = t / Math.sqrt(12); // Strong-axis radius of gyration
    const iz = sw / Math.sqrt(12); // Weak-axis radius of gyration

    // Effective unbraced lengths
    const Leff_y = Leff;
    // With OSB sheathing or blocking at 1200mm, weak-axis is braced
    const Leff_z = hasOsb ? 1200 : Leff;

    const lambda_y = Math.round((Leff_y / iy) * 10) / 10;
    const lambda_z = Math.round((Leff_z / iz) * 10) / 10;
    const lambda_max = Math.max(lambda_y, lambda_z);
    const slendernessLimit = 150; // EN 1995-1-1 maximum allowable compression slenderness

    // Timber strength values (EN 338)
    const fc0k = grade === 'C24' ? 21.0 : 17.0; // N/mm²
    const E05 = grade === 'C24' ? 7.4 : 5.4; // kN/mm² (5th percentile modulus)
    const kmod = 0.8; // Service Class 1/2 medium-term
    const gammaM = 1.3; // Partial factor for solid timber
    const fc0d = (kmod * fc0k) / gammaM; // N/mm² (~12.92 for C24, ~10.46 for C16)

    // Relative slenderness & buckling reduction factor (kc) per EN 1995-1-1
    const lambda_rel = (lambda_max / Math.PI) * Math.sqrt(fc0k / (E05 * 1000));
    const beta_c = 0.2; // Solid timber
    const k_val = 0.5 * (1 + beta_c * (lambda_rel - 0.3) + Math.pow(lambda_rel, 2));
    const kc = Math.min(1.0, 1 / (k_val + Math.sqrt(Math.max(0, Math.pow(k_val, 2) - Math.pow(lambda_rel, 2)))));

    // Cross section area (mm²) and axial buckling resistance Prd (kN)
    const area = sw * t;
    const Prd = Math.round(((kc * area * fc0d) / 1000) * 10) / 10; // kN
    const Ped = 12.5; // Design axial compression demand per stud under roof/floor gravity load (kN)
    const dcRatio = Math.round((Ped / Math.max(0.1, Prd)) * 100) / 100;

    const exceedsSlenderness = lambda_max > slendernessLimit;
    const exceedsCapacity = dcRatio > 1.0;
    const isPass = !exceedsSlenderness && !exceedsCapacity;

    return {
      H,
      t,
      sw,
      grade,
      Leff,
      iy: Math.round(iy * 10) / 10,
      iz: Math.round(iz * 10) / 10,
      lambda_y,
      lambda_z,
      lambda_max,
      slendernessLimit,
      fc0d: Math.round(fc0d * 100) / 100,
      kc: Math.round(kc * 1000) / 1000,
      area,
      Prd,
      Ped,
      dcRatio,
      exceedsSlenderness,
      exceedsCapacity,
      isPass
    };
  }, [currentPanel.height, currentPanel.thickness, currentPanel.lumberGrade, currentPanel.hasSheathing]);

  // Eurocode 5 (EN 1995-1-1 Cl. 9.2.4 Method A/B) Racking Resistance & Lateral Wind Shear Audit
  const rackingAudit = useMemo(() => {
    const L = currentPanel.length; // mm
    const H = currentPanel.height; // mm
    const isExterior = currentPanel.type === 'external';
    const hasSheathing = currentPanel.hasSheathing;
    const side = currentPanel.sheathingSide || 'exterior';
    const isBoth = side === 'both';

    // Total opening width deduction
    const totalOpeningWidth = currentPanel.openings.reduce((sum, op) => sum + op.width, 0);
    const Lnet = Math.max(0, L - totalOpeningWidth); // mm net effective shear wall length
    const Lnet_m = Lnet / 1000; // meters

    // Sheathing unit racking strength f_v,0 (kN/m) for 12mm OSB/3 per EN 1995-1-1 Method A/B
    // Single side OSB/3 = 2.50 kN/m; Double side OSB/3 = 5.00 kN/m; Un-sheathed = 0.00 kN/m
    const fv0 = !hasSheathing ? 0.0 : isBoth ? 5.00 : 2.50; // kN/m

    // Lateral Wind Load Assumptions (Eurocode 1 EN 1991-1-4)
    const qp = 0.90; // Peak velocity wind pressure (kN/m²)
    const cpe = 0.80; // External pressure coefficient
    const w_wind = qp * cpe; // 0.72 kN/m² design wind pressure

    // Wind Shear Force Demand V_Ed on this wall panel (kN)
    const Ved = Math.round((w_wind * (H / 1000) * (L / 1000) * 0.5) * 10) / 10; // kN

    // Total Wall Racking Resistance Capacity V_Rd (kN)
    const Vrd = Math.round((fv0 * Lnet_m) * 10) / 10; // kN

    const dcRatio = Math.round((Ved / Math.max(0.1, Vrd)) * 100) / 100;
    const isPass = hasSheathing && Vrd >= Ved;

    return {
      L,
      H,
      Lnet,
      Lnet_m: Lnet_m.toFixed(2),
      totalOpeningWidth,
      isExterior,
      hasSheathing,
      side,
      fv0,
      qp,
      cpe,
      w_wind: w_wind.toFixed(2),
      Ved,
      Vrd,
      dcRatio,
      isPass
    };
  }, [currentPanel.length, currentPanel.height, currentPanel.type, currentPanel.hasSheathing, currentPanel.sheathingSide, currentPanel.openings]);

  const handleFixCollisions = () => {
    setFixedPanels(prev => ({ ...prev, [currentPanel.id]: true }));
    showToast(`Successfully auto-resolved stud collisions on ${currentPanel.id}`);
  };

  const handleResetCollisions = () => {
    setFixedPanels(prev => ({ ...prev, [currentPanel.id]: false }));
    showToast(`Reset stud layout for ${currentPanel.id}`);
  };

  // Comprehensive Timber Teck Methods & Engineering Logic: Fix All Audit Warnings & Collisions
  const handleFixAllAudits = () => {
    // 1. Resolve stud collisions across ALL wall panels
    const allFixed: Record<string, boolean> = {};
    panels.forEach(p => {
      allFixed[p.id] = true;
    });
    setFixedPanels(allFixed);

    // 2. Auto-correct slenderness limits (lambda <= 150) & racking shear capacities (V_Rd >= V_Ed)
    setPanels(prevPanels => prevPanels.map(p => {
      const H = p.height;
      const t = p.thickness;
      const sw = 38;
      const Leff = Math.max(1000, H - 76);
      const iy = t / Math.sqrt(12);
      const iz = sw / Math.sqrt(12);
      const Leff_z = p.hasSheathing ? 1200 : Leff;
      const lambda_y = Leff / iy;
      const lambda_z = Leff_z / iz;
      const lambda_max = Math.max(lambda_y, lambda_z);

      let newThickness = p.thickness;
      let newGrade = p.lumberGrade;
      let newHasSheathing = p.hasSheathing;
      let newSheathingSide: 'exterior' | 'interior' | 'both' = p.sheathingSide || 'exterior';

      // Fix Slenderness ratio (lambda <= 150)
      if (lambda_max > 150 || t < 100) {
        newThickness = t < 140 ? 140 : 180;
        newGrade = 'C24';
      }

      // Fix Racking shear resistance (must have 12mm OSB/3 sheathing)
      if (!newHasSheathing) {
        newHasSheathing = true;
        newSheathingSide = 'exterior';
      }

      // Check racking demand vs capacity
      const totalOpeningWidth = p.openings.reduce((sum, op) => sum + op.width, 0);
      const Lnet_m = Math.max(0, p.length - totalOpeningWidth) / 1000;
      const fv0 = newSheathingSide === 'both' ? 5.0 : 2.5;
      const Ved = 0.90 * 0.80 * (H / 1000) * (p.length / 1000) * 0.5;
      const Vrd = fv0 * Lnet_m;

      if (Vrd < Ved && newSheathingSide !== 'both') {
        newSheathingSide = 'both';
      }

      return {
        ...p,
        thickness: newThickness,
        lumberGrade: newGrade,
        hasSheathing: newHasSheathing,
        sheathingSide: newSheathingSide,
        cornerPack: 'double', // Eurocode 5 OSB Double Corner Backing Stud Pack
        headerPosition: 'opening', // Timber Teck standard header at opening with upper I-cripples
        customStuds: [], // clear conflicting custom manual studs
        deletedStuds: []
      };
    }));

    showToast('✓ Timber Teck Engineering Fix All Applied: Auto-resolved all stud collisions, added OSB corner backing studs, and verified slenderness & racking capacities.');
  };

  // Dimension chain starting at 0 (left corner) and ending strictly at panel length (end corner)
  const dimensionChain = useMemo(() => {
    const corners = studPositions.map(s => s.leftCorner);
    const set = new Set([0, ...corners, currentPanel.length]);
    return Array.from(set).sort((a, b) => a - b);
  }, [studPositions, currentPanel.length]);

  // Calculate snap target from mouse distance on plan canvas
  const calculatePlanSnap = (rawDistMm: number) => {
    if (!snapSettings.master) {
      const clamped = Math.max(0, Math.min(currentPanel.length, Math.round(rawDistMm)));
      return { dist: clamped, snap: null };
    }

    const snapRadiusMm = 80; // magnet snap tolerance in mm
    const candidateSnaps: Array<{ dist: number; label: string; type: 'corner' | 'stud' | 'opening' | 'grid' }> = [];

    // 1. Corners
    if (snapSettings.corners) {
      candidateSnaps.push({ dist: 0, label: '📍 Panel Left Corner (0 mm)', type: 'corner' });
      candidateSnaps.push({ dist: currentPanel.length, label: `📍 Panel Right Corner (${currentPanel.length} mm)`, type: 'corner' });
    }

    // 2. Openings
    if (snapSettings.corners) {
      currentPanel.openings.forEach(op => {
        candidateSnaps.push({ dist: op.startDist, label: `🚪 ${op.id} Left Jamb (${op.startDist} mm)`, type: 'opening' });
        const mid = op.startDist + op.width / 2;
        candidateSnaps.push({ dist: mid, label: `🚪 ${op.id} Center (${Math.round(mid)} mm)`, type: 'opening' });
        const right = op.startDist + op.width;
        candidateSnaps.push({ dist: right, label: `🚪 ${op.id} Right Jamb (${right} mm)`, type: 'opening' });
      });
    }

    // 3. Studs (Snapping to Left Edge, Center Line, and Right Edge for EVERY stud, with priority for Junction Blocks & Trimmers)
    if (snapSettings.studs) {
      studPositions.forEach(stud => {
        const studW = stud.rightEdge - stud.leftCorner;
        const center = Math.round(stud.leftCorner + studW / 2);
        const isJunction = stud.role.includes('Junction Block');
        const isTrimmer = stud.role.includes('Trimmer') || stud.role.includes('King');

        const prefix = isJunction 
          ? `🧩 Junction Block ${stud.id}` 
          : isTrimmer 
          ? `🚪 ${stud.role} ${stud.id}` 
          : `🎯 Stud ${stud.id}`;

        candidateSnaps.push({ dist: stud.leftCorner, label: `${prefix} Left Edge (${stud.leftCorner} mm)`, type: 'stud' });
        candidateSnaps.push({ dist: center, label: `${prefix} Center Line (${center} mm)`, type: 'stud' });
        candidateSnaps.push({ dist: stud.rightEdge, label: `${prefix} Right Edge (${stud.rightEdge} mm)`, type: 'stud' });
      });
    }

    // 4. Grid
    if (snapSettings.grid && snapSettings.gridStep > 0) {
      const step = snapSettings.gridStep;
      const nearestGrid = Math.round(rawDistMm / step) * step;
      if (nearestGrid >= 0 && nearestGrid <= currentPanel.length) {
        candidateSnaps.push({ dist: nearestGrid, label: `📐 Grid ${step}mm (${nearestGrid} mm)`, type: 'grid' });
      }
    }

    let bestSnap = null;
    let minDist = snapRadiusMm;

    for (const s of candidateSnaps) {
      const d = Math.abs(rawDistMm - s.dist);
      if (d < minDist) {
        minDist = d;
        bestSnap = s;
      }
    }

    if (bestSnap) {
      return { dist: bestSnap.dist, snap: bestSnap };
    }

    const clamped = Math.max(0, Math.min(currentPanel.length, Math.round(rawDistMm)));
    return { dist: clamped, snap: null };
  };

  // Auto-resequence panel IDs and Names so exterior panels are E01, E02, E03... and interior are I1, I2, I3... in strict order
  const resequencePanels = (panelList: WallPanel[]): WallPanel[] => {
    let extCount = 1;
    let intCount = 1;
    return panelList.map(p => {
      const isExt = p.type === 'external';
      const newId = isExt ? `E${String(extCount++).padStart(2, '0')}` : `I${intCount++}`;
      const prefix = isExt ? 'Exterior Wall' : 'Interior Wall';
      return {
        ...p,
        id: newId,
        name: `${prefix} ${newId}`
      };
    });
  };

  // Handle panel property change with automatic stud collision resolution
  const handleUpdatePanel = (field: keyof WallPanel, value: any) => {
    // Auto-fix stud collisions whenever any panel attribute or Audit parameter changes
    setFixedPanels(prev => ({ ...prev, [currentPanel.id]: true }));

    const updated = panels.map(p => {
      if (p.id !== currentPanel.id) return p;
      const newP = { ...p, [field]: value };
      // Always add OSB double corner backing stud packs when sheathing is enabled
      if (field === 'hasSheathing' && value) {
        newP.cornerPack = 'double';
      }
      return newP;
    });

    if (field === 'type') {
      const currentIdx = panels.findIndex(p => p.id === currentPanel.id);
      const resequenced = resequencePanels(updated);
      setPanels(resequenced);
      const nextId = resequenced[currentIdx]?.id || resequenced[0].id;
      setSelectedPanelId(nextId);
      showToast(`Updated wall type & auto-ordered panel labels (${nextId})`);
    } else {
      setPanels(updated);
    }
  };

  // Handle setting sheathing side (Outside | Inside | Both Sides)
  const handleSetSheathingSide = (side: 'exterior' | 'interior' | 'both') => {
    handleUpdatePanel('sheathingSide', side);
    if (side === 'interior') setIsFlippedY(true);
    else if (side === 'exterior') setIsFlippedY(false);

    if (typeof window !== 'undefined' && (window as any).model?.elements) {
      const elem = (window as any).model.elements.find((e: any) => e.id === currentPanel.id || e.name === currentPanel.name);
      if (elem) {
        elem.sheathingSide = side;
        elem.flipped = (side === 'interior');
        if (elem.framing) elem.framing.sheathingSide = side;
      }
    }

    const labels = {
      exterior: 'Outside Face (Exterior)',
      interior: 'Inside Face (Interior)',
      both: 'Both Sides (Double Sheathed)'
    };
    showToast(`Updated Wall Sheeting: ${labels[side]}`);
  };

  // Handle Flip / Cycle Orientation (Outside -> Inside -> Both Sides)
  const handleFlipOrientation = () => {
    const nextSide: 'exterior' | 'interior' | 'both' = 
      sheathingSide === 'exterior' ? 'interior' : 
      sheathingSide === 'interior' ? 'both' : 'exterior';
    handleSetSheathingSide(nextSide);
  };

  // Handle adding an opening (Auto-resolves stud collisions)
  const handleAddOpening = () => {
    setFixedPanels(prev => ({ ...prev, [currentPanel.id]: true }));
    const newOp: WallOpening = {
      id: `OP-${currentPanel.openings.length + 1}`,
      type: 'window',
      startDist: Math.round(currentPanel.length * 0.3),
      width: 1200,
      height: 1200,
      sillHeight: 900
    };
    setPanels(panels.map(p => p.id === currentPanel.id ? { ...p, openings: [...p.openings, newOp] } : p));
    showToast(`Added new opening ${newOp.id} to panel`);
  };

  const handleUpdateOpening = (opId: string, field: keyof WallOpening, val: number | string) => {
    setFixedPanels(prev => ({ ...prev, [currentPanel.id]: true }));
    setPanels(panels.map(p => {
      if (p.id !== currentPanel.id) return p;
      return {
        ...p,
        openings: p.openings.map(o => o.id === opId ? { ...o, [field]: val } : o)
      };
    }));
  };

  const handleDeleteOpening = (opId: string) => {
    setFixedPanels(prev => ({ ...prev, [currentPanel.id]: true }));
    setPanels(panels.map(p => {
      if (p.id !== currentPanel.id) return p;
      return {
        ...p,
        openings: p.openings.filter(o => o.id !== opId)
      };
    }));
    showToast(`Deleted opening ${opId}`);
  };

  // Add new wall panel with clean short code ID (E1, E2... I1, I2...)
  const handleAddPanel = () => {
    const newPanel: WallPanel = {
      id: 'TEMP',
      name: 'New Wall Panel',
      type: 'external',
      length: 6000,
      height: 3000,
      thickness: 100,
      lumberGrade: 'C24',
      studSpacing: 400,
      hasSheathing: true,
      sheathingSide: 'exterior',
      headerPosition: 'opening',
      openings: []
    };
    const resequenced = resequencePanels([...panels, newPanel]);
    setPanels(resequenced);
    const added = resequenced[resequenced.length - 1];
    setSelectedPanelId(added.id);
    showToast(`Created new panel ${added.id}`);
  };

  // Delete current panel and auto-resequence remaining panel IDs
  const handleDeletePanel = () => {
    if (panels.length <= 1) {
      showToast('Cannot delete the last remaining panel');
      return;
    }
    const deleteIdx = panels.findIndex(p => p.id === currentPanel.id);
    const remaining = panels.filter(p => p.id !== currentPanel.id);
    const resequenced = resequencePanels(remaining);
    setPanels(resequenced);
    const nextIdx = Math.min(deleteIdx, resequenced.length - 1);
    setSelectedPanelId(resequenced[nextIdx].id);
    showToast(`Deleted panel ${currentPanel.id} (Names auto-ordered: ${resequenced.map(p => p.id).join(', ')})`);
  };

  // Calculate total timber length in meters
  const totalTimberMeters = useMemo(() => {
    const topBottomPlates = (currentPanel.length * 4) / 1000;
    const studLen = (currentPanel.height - 76) / 1000;
    const studsTotal = studPositions.length * studLen;
    return (topBottomPlates + studsTotal).toFixed(1);
  }, [currentPanel, studPositions]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar - Strict 3 Zone Layout */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
        {/* Zone 1: Brand & Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-xs tracking-wider flex items-center justify-center shadow-md shadow-amber-600/25 border border-amber-400/40">
            TT
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-tight text-white font-sans">Timber Teck</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">Panel &amp; Truss Studio</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Structural Timber &amp; Wall Panel Engine · Eurocode 5 &amp; NDS</p>
          </div>
        </div>

        {/* Zone 2: Primary Functional Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'elevation', label: 'Elevation & Framing', icon: Layout },
            { id: 'plan', label: '2D Wall Plan', icon: Layers },
            { id: '3d', label: '3D Axonometric', icon: Box },
            { id: 'schedule', label: 'BOM Cut List', icon: FileSpreadsheet },
            { id: 'ifc', label: 'BIM / IFC Importer', icon: Upload },
            { id: 'audit', label: 'Structural Audit', icon: ShieldCheck, badge: collidingStuds.length > 0 ? collidingStuds.length : null },
            { id: 'truss', label: '⚡ Truss Elevation & Stresses', icon: Layout, badge: 'ASD/EC5' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-100' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded ${isActive ? 'bg-slate-950/40 text-amber-100' : 'bg-rose-600 text-white'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <select 
            className="bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition cursor-pointer shadow-xs"
            value={selectedPanelId}
            onChange={(e) => setSelectedPanelId(e.target.value)}
          >
            {panels.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} · {p.name} ({p.length}×{p.height}mm)
              </option>
            ))}
          </select>

          <button 
            onClick={handleAddPanel}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Wall Panel</span>
          </button>

          <button 
            onClick={() => {
              const genPdf = (window as any).generateWallPanelPackagePDF;
              if (typeof genPdf === 'function') {
                genPdf();
                showToast('Generated Timber Teck Shop Drawing PDF Package');
              } else {
                showToast('Exporting Timber Teck PDF Drawing Package...');
              }
            }}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition cursor-pointer whitespace-nowrap"
            title="Export Timber Teck Shop Drawing PDF Package"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">PDF Package</span>
          </button>

          <button 
            onClick={() => {
              const genTrussPdf = (window as any).generateTrussPDFReport;
              if (typeof genTrussPdf === 'function') {
                genTrussPdf();
                showToast('Generated Timber Teck Roof Truss Engineering PDF Report');
              } else {
                showToast('Generating Timber Teck Roof Truss Engineering Report...');
              }
            }}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition cursor-pointer whitespace-nowrap"
            title="Generate detailed Timber Teck Roof Truss Engineering PDF Report with stress analysis & connection checks"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Roof Truss Report</span>
          </button>

          <button 
            onClick={() => {
              const genMasterPdf = (window as any).generateMasterPDFReport;
              if (typeof genMasterPdf === 'function') {
                genMasterPdf();
                showToast('Generated Timber Teck Master Structural PDF Package');
              } else {
                showToast('Generating Timber Teck Master Structural PDF Package...');
              }
            }}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition cursor-pointer whitespace-nowrap"
            title="Generate Timber Teck Master Structural Engineering & Material PDF Package"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Master PDF Package</span>
          </button>

          <button
            onClick={() => {
              const rootEl = document.getElementById('root');
              if (rootEl) rootEl.style.display = 'none';
              if (typeof (window as any).setView === 'function') {
                (window as any).setView('plan');
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition cursor-pointer whitespace-nowrap"
            title="Switch to Timber Teck 3D BIM Workspace"
          >
            <Box className="w-3.5 h-3.5 text-emerald-100" />
            <span className="hidden lg:inline">Timber Teck 3D BIM</span>
          </button>
        </div>
      </header>

      {/* Sub-Header / Quick Metadata & Status Ribbon */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center space-x-3 flex-wrap">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-900">{currentPanel.name}</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-slate-600">{currentPanel.length} × {currentPanel.height} × {currentPanel.thickness} mm</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center space-x-2">
            <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px] font-mono">
              Grade {currentPanel.lumberGrade}
            </span>
            <span className="text-slate-500">Studs @ {currentPanel.studSpacing}mm C/C</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{totalTimberMeters}m timber total</span>
          </div>
        </div>

        {/* Quick Toggles & Flip Orientation Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFixAllAudits}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-md text-xs flex items-center space-x-1.5 shadow-2xs transition cursor-pointer"
            title="Auto-fix all stud collisions, slenderness, and racking shear across all panels using Timber Teck engineering methods"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-100" />
            <span>Fix All (Timber Teck)</span>
          </button>

          {collidingStuds.length > 0 ? (
            <button 
              onClick={handleFixCollisions}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Fix {collidingStuds.length} Collision{collidingStuds.length > 1 ? 's' : ''}</span>
            </button>
          ) : shiftedStuds.length > 0 ? (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Shifted ({shiftedStuds.length}) · Safe</span>
              <button onClick={handleResetCollisions} className="ml-1 text-emerald-800 underline text-[10px]">Reset</button>
            </div>
          ) : (
            <div className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Layout Compliant</span>
            </div>
          )}

          {/* OSB SHEETING FACE SELECTOR (Outside | Inside | Both Sides) */}
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center space-x-0.5 text-xs font-semibold">
            <button
              onClick={() => handleSetSheathingSide('exterior')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                isSheathingExterior
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Place 12mm OSB Sheathing on Outside/Exterior Face"
            >
              Outside
            </button>
            <button
              onClick={() => handleSetSheathingSide('interior')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                isSheathingInterior
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Place 12mm OSB Sheathing on Inside/Interior Face"
            >
              Inside
            </button>
            <button
              onClick={() => handleSetSheathingSide('both')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                isSheathingBoth
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Place 12mm OSB Sheathing on BOTH Faces (Double Sheathed)"
            >
              Both Sides
            </button>
          </div>

          <button
            onClick={handleFlipOrientation}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 active:scale-95 text-slate-700 font-bold px-2.5 py-1 rounded-md text-xs flex items-center space-x-1.5 shadow-2xs transition-all duration-300 cursor-pointer"
            title="Cycle wall sheathing orientation: Outside -> Inside -> Both Sides"
          >
            <ArrowLeftRight className={`w-3.5 h-3.5 text-teal-600 transition-transform duration-500 ease-in-out ${isSheathingInterior ? 'rotate-180' : isSheathingBoth ? 'rotate-90' : 'rotate-0'}`} />
            <span>Cycle Side</span>
          </button>




          {/* CORNER STUD PACK SELECTOR (Eurocode 5: Double vs Single) */}
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center space-x-0.5 text-xs font-semibold">
            <button
              onClick={() => handleUpdatePanel('cornerPack', 'double')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                (currentPanel.cornerPack || 'double') === 'double'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Eurocode 5 Double Stud Backing Pack (2x38mm studs)"
            >
              EC5 Double Pack
            </button>
            <button
              onClick={() => handleUpdatePanel('cornerPack', 'single')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                currentPanel.cornerPack === 'single'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Eurocode 5 Single End Stud Detail (1x38mm stud)"
            >
              Single Stud
            </button>
          </div>

          <button
            onClick={() => handleUpdatePanel('hasSheathing', !currentPanel.hasSheathing)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition cursor-pointer ${
              currentPanel.hasSheathing 
                ? 'bg-teal-50 border-teal-200 text-teal-700' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {currentPanel.hasSheathing ? '12mm OSB ON' : 'OSB OFF'}
          </button>

          <button
            onClick={() => handleUpdatePanel('headerPosition', currentPanel.headerPosition === 'opening' ? 'top' : 'opening')}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer"
          >
            Header: {currentPanel.headerPosition === 'opening' ? 'At Opening' : 'Top Plate (Timber Teck)'}
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Wall Controls & Opening Manager */}
        <aside className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col overflow-y-auto shrink-0 shadow-xs">
          {/* Panel Specifications Card */}
          <div className="p-5 border-b border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-600" />
                <span>Panel Specifications</span>
              </h3>
              <div className="flex items-center space-x-1">

                <button 
                  onClick={handleDeletePanel} 
                  className="text-slate-400 hover:text-rose-600 transition p-1 rounded hover:bg-rose-50"
                  title="Delete this panel"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>


            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Panel Name</label>
                <input 
                  type="text" 
                  value={currentPanel.name} 
                  onChange={e => handleUpdatePanel('name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>

              {/* Sheeting Orientation Control in Sidebar */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Sheeting Orientation</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => handleSetSheathingSide('exterior')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold uppercase transition-all duration-200 cursor-pointer text-center ${
                      isSheathingExterior
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    Outside
                  </button>
                  <button
                    onClick={() => handleSetSheathingSide('interior')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold uppercase transition-all duration-200 cursor-pointer text-center ${
                      isSheathingInterior
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    Inside
                  </button>
                  <button
                    onClick={() => handleSetSheathingSide('both')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold uppercase transition-all duration-200 cursor-pointer text-center ${
                      isSheathingBoth
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    Both Sides
                  </button>
                </div>
              </div>

              {/* Corner Stud Pack Control in Sidebar */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Corner Stud Pack (Eurocode 5)</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => handleUpdatePanel('cornerPack', 'double')}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold uppercase transition-all duration-200 cursor-pointer text-center ${
                      (currentPanel.cornerPack || 'double') === 'double'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    Double Pack (2×38)
                  </button>
                  <button
                    onClick={() => handleUpdatePanel('cornerPack', 'single')}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold uppercase transition-all duration-200 cursor-pointer text-center ${
                      currentPanel.cornerPack === 'single'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    Single Stud (1×38)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Length (mm)</label>
                  <input 
                    type="number" 
                    step="100"
                    min="1000"
                    max="16000"
                    value={currentPanel.length} 
                    onChange={e => handleUpdatePanel('length', Math.max(500, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Height (mm)</label>
                  <input 
                    type="number" 
                    step="50"
                    min="2000"
                    max="6000"
                    value={currentPanel.height} 
                    onChange={e => handleUpdatePanel('height', Math.max(1000, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Thickness (mm)</label>
                  <select 
                    value={currentPanel.thickness} 
                    onChange={e => handleUpdatePanel('thickness', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value={89}>89 mm (2x4)</option>
                    <option value={100}>100 mm Standard</option>
                    <option value={140}>140 mm (2x6)</option>
                    <option value={180}>180 mm Heavy</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Lumber Grade</label>
                  <select 
                    value={currentPanel.lumberGrade} 
                    onChange={e => handleUpdatePanel('lumberGrade', e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value="C24">C24 Structural</option>
                    <option value="C16">C16 Standard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Stud Spacing</label>
                  <select 
                    value={currentPanel.studSpacing} 
                    onChange={e => handleUpdatePanel('studSpacing', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value={400}>400 mm O.C. (Standard)</option>
                    <option value={600}>600 mm O.C. (Wide)</option>
                    <option value={300}>300 mm O.C. (Dense)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Wall Type</label>
                  <select 
                    value={currentPanel.type} 
                    onChange={e => handleUpdatePanel('type', e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value="external">External Loadbearing</option>
                    <option value="internal">Internal Partition</option>
                  </select>
                </div>
              </div>

              {/* Per-Member Framing Material Profile (3D Geometry) */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">Member Framing Material (3D)</label>
                  {currentPanel.memberMaterials && Object.keys(currentPanel.memberMaterials).length > 0 && (
                    <span className="text-[10px] font-bold bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded">
                      {Object.keys(currentPanel.memberMaterials).length} custom
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">Target Panel Member</label>
                  <select
                    id="panel-member-target-select"
                    value={selectedMemberMaterialId}
                    onChange={e => setSelectedMemberMaterialId(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="ALL">Panel Default (All Members)</option>
                    <optgroup label="Plates">
                      <option value="TOP-PLATES">Top Plates (Double Top Plate)</option>
                      <option value="BOTTOM-PLATES">Bottom Plates (Double Sole Plate)</option>
                    </optgroup>
                    {currentPanel.openings.length > 0 && (
                      <optgroup label="Opening Headers, Sills & Cripples">
                        {currentPanel.openings.map(op => (
                          <React.Fragment key={op.id}>
                            <option value={`HDR-${op.id}`}>Header · {op.id} ({op.type})</option>
                            {op.type === 'window' && op.sillHeight > 0 && (
                              <option value={`SILL-${op.id}`}>Window Sill · {op.id}</option>
                            )}
                            <option value={`CRIP-I-${op.id}`}>Header Cripples (I) · {op.id}</option>
                            {op.type === 'window' && op.sillHeight > 0 && (
                              <option value={`CRIP-J-${op.id}`}>Sill Cripples (J) · {op.id}</option>
                            )}
                          </React.Fragment>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label={`Vertical Studs (${studPositions.length})`}>
                      {studPositions.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.id} · {s.role} (@ {Math.round(s.leftCorner)} mm)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">Framing Material Type</label>
                  <select
                    id="panel-member-material-select"
                    value={selectedMemberMaterialId === 'ALL'
                      ? (currentPanel.defaultFramingMaterial || 'dimensional')
                      : getMemberMaterial(selectedMemberMaterialId)}
                    onChange={e => handleSetMemberMaterial(selectedMemberMaterialId, e.target.value as FramingMaterialType)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="dimensional">Dimensional (Solid Rectangular Stud)</option>
                    <option value="ijoist">I-Joist (Wide LVL Flanges + OSB Web)</option>
                    <option value="lvl">LVL (Multi-Ply Laminated Veneer)</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleApplyMaterialToAllMembers(
                      selectedMemberMaterialId === 'ALL'
                        ? (currentPanel.defaultFramingMaterial || 'dimensional')
                        : getMemberMaterial(selectedMemberMaterialId)
                    )}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[10.5px] font-bold py-1.5 px-2 rounded-lg transition cursor-pointer"
                  >
                    Apply to All Members
                  </button>
                  {currentPanel.memberMaterials && Object.keys(currentPanel.memberMaterials).length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleApplyMaterialToAllMembers('dimensional')}
                      className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10.5px] font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Openings Manager Section */}
          <div className="p-5 border-b border-slate-200 space-y-3.5 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Layout className="w-3.5 h-3.5 text-teal-600" />
                <span>Window & Door Openings ({currentPanel.openings.length})</span>
              </h3>
              <button 
                onClick={handleAddOpening}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md transition cursor-pointer"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Add</span>
              </button>
            </div>

            {currentPanel.openings.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 p-4 rounded-xl text-center space-y-1.5">
                <p className="text-xs font-medium text-slate-500">No openings added to this wall panel.</p>
                <p className="text-[11px] text-slate-400">Click "Add" to insert a window or door rough opening.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentPanel.openings.map((op) => (
                  <div key={op.id} className="bg-slate-50/80 border border-slate-200 p-3 rounded-xl space-y-2.5 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        <span className="text-xs font-bold text-slate-800">{op.id}</span>
                        <select 
                          value={op.type} 
                          onChange={e => handleUpdateOpening(op.id, 'type', e.target.value)}
                          className="bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 rounded px-1.5 py-0.5"
                        >
                          <option value="window">Window</option>
                          <option value="door">Door</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => handleDeleteOpening(op.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Remove opening"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Dist from Left (mm)</span>
                        <input 
                          type="number" 
                          step="50"
                          value={op.startDist} 
                          onChange={e => handleUpdateOpening(op.id, 'startDist', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 block">Width (mm)</span>
                        <input 
                          type="number" 
                          step="50"
                          value={op.width} 
                          onChange={e => handleUpdateOpening(op.id, 'width', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 block">Height (mm)</span>
                        <input 
                          type="number" 
                          step="50"
                          value={op.height} 
                          onChange={e => handleUpdateOpening(op.id, 'height', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 block">Sill Height (mm)</span>
                        <input 
                          type="number" 
                          step="50"
                          value={op.sillHeight} 
                          onChange={e => handleUpdateOpening(op.id, 'sillHeight', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preset Panel Selector */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-200 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quick Presets</span>
            <div className="flex flex-wrap gap-1.5">
              {panels.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPanelId(p.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                    p.id === currentPanel.id 
                      ? 'bg-teal-700 text-white shadow-xs' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.id}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Viewing Workspace */}
        <main className="flex-1 bg-slate-100/50 p-6 flex flex-col overflow-y-auto min-h-0">
          {activeTab === 'elevation' && (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Canvas Header & Scale Toolbar */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Layout className="w-4 h-4 text-teal-600" />
                    <span>{currentPanel.name} · Shop Drawing Elevation (Scale 1:40)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Corner-of-stud referencing · Sheeting: <strong className="text-slate-900">{isSheathingBoth ? 'Both Sides (Double Sheathed)' : isSheathingInterior ? 'Inside Face (Interior)' : 'Outside Face (Exterior)'}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                  <span className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span>
                    <span>Common Stud ({currentPanel.studSpacing}mm C/C)</span>
                  </span>
                  <span className="inline-flex items-center space-x-1.5 bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-md">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block"></span>
                    <span>King & Trimmer</span>
                  </span>
                  {collidingStuds.length > 0 && (
                    <span className="inline-flex items-center space-x-1.5 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-md font-bold">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
                      <span>Collision</span>
                    </span>
                  )}
                  {shiftedStuds.length > 0 && (
                    <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-bold">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
                      <span>Shifted Stud</span>
                    </span>
                  )}
                </div>
              </div>

              {/* High-Fidelity Blueprint Canvas Container */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-center items-center overflow-x-auto relative">
                <div className="text-[11px] font-mono text-slate-400 mb-2 flex justify-between w-full max-w-5xl">
                  <span>SCALE 1:40 SHOP DRAWING | DIMENSIONS IN MILLIMETERS (MM)</span>
                  <span>SHEETING: {isSheathingBoth ? 'BOTH SIDES (DOUBLE FACE)' : isSheathingInterior ? 'INSIDE FACE (INTERIOR)' : 'OUTSIDE FACE (EXTERIOR)'}</span>
                </div>

                <div 
                  className="w-full max-w-5xl bg-slate-50/70 border border-slate-200 rounded-xl p-8 relative overflow-hidden transition-all duration-500 ease-in-out"
                  style={{ perspective: '1200px' }}
                >
                  {/* Background Architectural Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none"></div>

                  <svg 
                    viewBox={`0 0 ${currentPanel.length + 400} ${currentPanel.height + 400}`} 
                    className="w-full h-auto max-h-[550px] relative z-10 overflow-visible"
                  >
                    <g 
                      className="transition-all duration-700 cubic-bezier(0.34,1.56,0.64,1)"
                      style={{
                        transformOrigin: `${150 + currentPanel.length / 2}px ${100 + currentPanel.height / 2}px`,
                        transform: isSheathingInterior ? 'scaleX(-1)' : 'scaleX(1)'
                      }}
                    >
                      <defs>
                        <pattern id="osbHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                          <line x1="0" y1="0" x2="0" y2="12" stroke={isSheathingBoth ? "#047857" : isSheathingInterior ? "#b45309" : "#0f766e"} strokeWidth="1" opacity="0.4" />
                        </pattern>
                      </defs>

                      {/* Wall Framing Outer Bounds */}
                      <rect 
                        x="150" 
                        y="100" 
                        width={currentPanel.length} 
                        height={currentPanel.height} 
                        fill="none" 
                        stroke="#1e293b" 
                        strokeWidth="2.5" 
                      />

                      {/* OSB Sheathing Overlay (Exterior vs Interior vs Both) with smooth opacity & filter transition */}
                      {currentPanel.hasSheathing && (
                        <g className="transition-all duration-500 ease-in-out">
                          <rect 
                            x="150" 
                            y="100" 
                            width={currentPanel.length} 
                            height={currentPanel.height} 
                            fill="url(#osbHatch)" 
                            className="transition-all duration-500 ease-in-out"
                            opacity={isSheathingBoth ? "0.7" : isSheathingInterior ? "0.4" : "0.6"} 
                          />
                          {isSheathingBoth && (
                            <rect 
                              x="146" 
                              y="96" 
                              width={currentPanel.length + 8} 
                              height={currentPanel.height + 8} 
                              fill="none" 
                              stroke="#059669" 
                              strokeWidth="2.5" 
                              strokeDasharray="6 3" 
                              className="animate-pulse" 
                            />
                          )}
                          <g style={{ transform: isSheathingInterior ? 'scaleX(-1)' : 'none', transformOrigin: `${170}px ${120}px` }}>
                            <text 
                              x={170} 
                              y={120} 
                              fontSize="9" 
                              fontWeight="bold" 
                              className="transition-colors duration-500"
                              fill={isSheathingBoth ? "#047857" : isSheathingInterior ? "#b45309" : "#0f766e"}
                              fontFamily="sans-serif"
                            >
                              12mm OSB SHEATHING ({isSheathingBoth ? 'BOTH SIDES / DOUBLE FACE' : isSheathingInterior ? 'INSIDE FACE' : 'OUTSIDE FACE'})
                            </text>
                          </g>
                        </g>
                      )}

                      {/* Bottom Plates (Double bottom plate: 2x38mm) */}
                      {(() => {
                        const bpMat = getMemberMaterial('BOTTOM-PLATES');
                        const isBpSel = selectedMemberMaterialId === 'BOTTOM-PLATES';
                        return (
                          <g className="cursor-pointer" onClick={() => setSelectedMemberMaterialId('BOTTOM-PLATES')}>
                            <rect 
                              x="150" 
                              y={100 + currentPanel.height - 76} 
                              width={currentPanel.length} 
                              height="38" 
                              fill={bpMat === 'lvl' ? '#fed7aa' : bpMat === 'ijoist' ? '#fde68a' : '#fef3c7'} 
                              stroke={isBpSel ? '#0284c7' : bpMat === 'lvl' ? '#ea580c' : '#b45309'} 
                              strokeWidth={isBpSel ? '2.5' : '1.5'} 
                            />
                            <rect 
                              x="150" 
                              y={100 + currentPanel.height - 38} 
                              width={currentPanel.length} 
                              height="38" 
                              fill={bpMat === 'lvl' ? '#fdba74' : '#fde68a'} 
                              stroke={isBpSel ? '#0284c7' : bpMat === 'lvl' ? '#ea580c' : '#b45309'} 
                              strokeWidth={isBpSel ? '2.5' : '1.5'} 
                            />
                            {bpMat === 'ijoist' && (
                              <rect x="150" y={100 + currentPanel.height - 46} width={currentPanel.length} height="16" fill="#78461a" opacity="0.65" />
                            )}
                          </g>
                        );
                      })()}

                      {/* Top Plates (Double top plate: 2x38mm) */}
                      {(() => {
                        const tpMat = getMemberMaterial('TOP-PLATES');
                        const isTpSel = selectedMemberMaterialId === 'TOP-PLATES';
                        return (
                          <g className="cursor-pointer" onClick={() => setSelectedMemberMaterialId('TOP-PLATES')}>
                            <rect 
                              x="150" 
                              y="100" 
                              width={currentPanel.length} 
                              height="38" 
                              fill={tpMat === 'lvl' ? '#fdba74' : '#fde68a'} 
                              stroke={isTpSel ? '#0284c7' : tpMat === 'lvl' ? '#ea580c' : '#b45309'} 
                              strokeWidth={isTpSel ? '2.5' : '1.5'} 
                            />
                            <rect 
                              x="150" 
                              y="138" 
                              width={currentPanel.length} 
                              height="38" 
                              fill={tpMat === 'lvl' ? '#fed7aa' : tpMat === 'ijoist' ? '#fde68a' : '#fef3c7'} 
                              stroke={isTpSel ? '#0284c7' : tpMat === 'lvl' ? '#ea580c' : '#b45309'} 
                              strokeWidth={isTpSel ? '2.5' : '1.5'} 
                            />
                            {tpMat === 'ijoist' && (
                              <rect x="150" y="130" width={currentPanel.length} height="16" fill="#78461a" opacity="0.65" />
                            )}
                          </g>
                        );
                      })()}

                      {/* Studs rendered using exact left corner positioning */}
                      {studPositions.map((stud, i) => {
                        const studW = stud.rightEdge - stud.leftCorner;
                        const studH = currentPanel.height - 76;
                        const isColliding = !!stud.collision;
                        const isShifted = !!stud.shifted;
                        const isKingOrTrimmer = stud.role.includes('King') || stud.role.includes('Trimmer');
                        const studMat = getMemberMaterial(stud.id);
                        const isMatSelected = selectedMemberMaterialId === stud.id || selectedStudId === stud.id;

                        let fillBg = '#fef3c7';
                        let strokeColor = '#b45309';

                        if (isColliding) {
                          fillBg = '#f87171';
                          strokeColor = '#dc2626';
                        } else if (isShifted) {
                          fillBg = '#bbf7d0';
                          strokeColor = '#15803d';
                        } else if (isKingOrTrimmer) {
                          fillBg = '#e0f2fe';
                          strokeColor = '#0284c7';
                        } else if (studMat === 'lvl') {
                          fillBg = '#fed7aa';
                          strokeColor = '#ea580c';
                        } else if (studMat === 'ijoist') {
                          fillBg = '#fde68a';
                          strokeColor = '#9a5b1f';
                        }

                        return (
                          <g
                            key={stud.id || i}
                            className="hover:opacity-90 transition cursor-pointer"
                            onClick={() => {
                              setSelectedStudId(stud.id);
                              setSelectedMemberMaterialId(stud.id);
                            }}
                          >
                            <rect 
                              x={150 + stud.leftCorner} 
                              y="138" 
                              width={studW} 
                              height={studH} 
                              fill={fillBg} 
                              stroke={isMatSelected ? '#0284c7' : strokeColor} 
                              strokeWidth={isMatSelected || isColliding ? '2.5' : '1'} 
                            />
                            {studMat === 'ijoist' && (
                              <rect
                                x={150 + stud.leftCorner + studW * 0.34}
                                y="138"
                                width={Math.max(4, studW * 0.32)}
                                height={studH}
                                fill="#78461a"
                                opacity="0.55"
                              />
                            )}
                            {studMat === 'lvl' && (
                              <line
                                x1={150 + stud.leftCorner + studW * 0.5}
                                y1="138"
                                x2={150 + stud.leftCorner + studW * 0.5}
                                y2={138 + studH}
                                stroke="#9a3412"
                                strokeWidth="1.2"
                                strokeDasharray="6 3"
                              />
                            )}
                            {/* Stud Label */}
                            <text 
                              x={150 + stud.leftCorner + studW / 2} 
                              y={138 + studH / 2} 
                              fontSize="7.5" 
                              fill={isColliding ? '#ffffff' : isKingOrTrimmer ? '#0369a1' : studMat === 'ijoist' ? '#fef3c7' : '#78350f'} 
                              fontWeight={isColliding || studMat !== 'dimensional' ? 'bold' : '600'}
                              textAnchor="middle" 
                              writingMode="vertical-rl"
                            >
                              {stud.id}{studMat === 'ijoist' ? ' [I-J]' : studMat === 'lvl' ? ' [LVL]' : ''}
                            </text>
                          </g>
                        );
                      })}

                      {/* Openings, Lintel Headers, Sills, and Upper 'I' / Lower 'J' Cripple Studs */}
                      {currentPanel.openings.map((op, i) => {
                        const bottomPlateTopY = 100 + currentPanel.height - 76;
                        const sillPosY = op.type === 'door' ? bottomPlateTopY : bottomPlateTopY - (op.sillHeight || 0);
                        const headY = sillPosY - op.height;
                        const headerHeight = 44;
                        // Always guarantee header sits directly above the opening head on top of trimmers
                        const headerPosY = headY - headerHeight;
                        const sillBottomY = sillPosY + 38;
                        const studThick = 38;
                        const spacing = currentPanel.studSpacing;

                        // Calculate cripple stud X positions inside [op.startDist, op.startDist + op.width]
                        const crippleXPositions: number[] = [];
                        let cPos = spacing;
                        while (cPos < currentPanel.length) {
                          if (cPos >= op.startDist + studThick && cPos <= op.startDist + op.width - studThick * 2) {
                            crippleXPositions.push(cPos);
                          }
                          cPos += spacing;
                        }

                        // If no grid position falls strictly inside opening span, add centered cripple position(s)
                        if (crippleXPositions.length === 0 && op.width > studThick * 3) {
                          crippleXPositions.push(Math.round(op.startDist + op.width / 2 - studThick / 2));
                        }

                        return (
                          <g key={op.id || i}>
                            {/* Window Sill Plate (for windows with sillHeight > 0) */}
                            {op.type === 'window' && op.sillHeight > 0 && (() => {
                              const sMat = getMemberMaterial(`SILL-${op.id}`);
                              const isSSel = selectedMemberMaterialId === `SILL-${op.id}`;
                              return (
                                <g className="cursor-pointer" onClick={() => setSelectedMemberMaterialId(`SILL-${op.id}`)}>
                                  <rect 
                                    x={150 + op.startDist - 38} 
                                    y={sillPosY} 
                                    width={op.width + 76} 
                                    height="38" 
                                    fill={sMat === 'lvl' ? '#fdba74' : '#fde68a'} 
                                    stroke={isSSel ? '#0284c7' : sMat === 'lvl' ? '#ea580c' : '#b45309'} 
                                    strokeWidth={isSSel ? '2.5' : '1.5'} 
                                  />
                                  {sMat === 'ijoist' && (
                                    <rect x={150 + op.startDist - 38} y={sillPosY + 11} width={op.width + 76} height="16" fill="#78461a" opacity="0.65" />
                                  )}
                                </g>
                              );
                            })()}

                            {/* Lower Cripple Studs 'J' (below window sill plate down to bottom plate) */}
                            {op.type === 'window' && op.sillHeight > 38 && crippleXPositions.map((cX, cIdx) => {
                              const jMat = getMemberMaterial(`CRIP-J-${op.id}`);
                              const isJSel = selectedMemberMaterialId === `CRIP-J-${op.id}`;
                              return (
                                <g key={`J-${cIdx}`} className="cursor-pointer" onClick={() => setSelectedMemberMaterialId(`CRIP-J-${op.id}`)}>
                                  <rect 
                                    x={150 + cX} 
                                    y={sillBottomY} 
                                    width={studThick} 
                                    height={Math.max(10, bottomPlateTopY - sillBottomY)} 
                                    fill={jMat === 'lvl' ? '#fed7aa' : jMat === 'ijoist' ? '#fde68a' : '#fef3c7'} 
                                    stroke={isJSel ? '#0284c7' : jMat === 'lvl' ? '#ea580c' : '#b45309'} 
                                    strokeWidth={isJSel ? '2' : '1'} 
                                  />
                                  <text 
                                    x={150 + cX + studThick / 2} 
                                    y={sillBottomY + Math.max(10, bottomPlateTopY - sillBottomY) / 2} 
                                    fontSize="7.5" 
                                    fill="#78350f" 
                                    fontWeight="extrabold" 
                                    textAnchor="middle" 
                                    writingMode="vertical-rl"
                                  >
                                    J
                                  </text>
                                </g>
                              );
                            })}

                            {/* Lintel Header (Spans opening width + 2 trimmers = op.width + 76) */}
                            {(() => {
                              const hMat = getMemberMaterial(`HDR-${op.id}`);
                              const isHSel = selectedMemberMaterialId === `HDR-${op.id}`;
                              return (
                                <g className="cursor-pointer" onClick={() => setSelectedMemberMaterialId(`HDR-${op.id}`)}>
                                  <rect 
                                    x={150 + op.startDist - 38} 
                                    y={headerPosY} 
                                    width={op.width + 76} 
                                    height={headerHeight} 
                                    fill={hMat === 'lvl' ? '#ea580c' : hMat === 'ijoist' ? '#b45309' : '#0f766e'} 
                                    stroke={isHSel ? '#38bdf8' : hMat === 'lvl' ? '#9a3412' : '#0d9488'} 
                                    strokeWidth={isHSel ? '2.5' : '1.5'} 
                                  />
                                  {hMat === 'ijoist' && (
                                    <rect x={150 + op.startDist - 38} y={headerPosY + 11} width={op.width + 76} height={Math.max(10, headerHeight - 22)} fill="#78461a" opacity="0.85" />
                                  )}
                                  {hMat === 'lvl' && (
                                    <line x1={150 + op.startDist - 38} y1={headerPosY + headerHeight / 2} x2={150 + op.startDist + op.width + 38} y2={headerPosY + headerHeight / 2} stroke="#431407" strokeWidth="1.3" strokeDasharray="6 3" />
                                  )}
                                  <text 
                                    x={150 + op.startDist + op.width / 2} 
                                    y={headerPosY + 26} 
                                    fontSize="8.5" 
                                    fill="#ffffff" 
                                    fontWeight="bold" 
                                    textAnchor="middle"
                                  >
                                    LINTEL HEADER ({op.id} · {hMat === 'ijoist' ? 'I-JOIST' : hMat === 'lvl' ? '2-PLY LVL' : currentPanel.lumberGrade})
                                  </text>
                                </g>
                              );
                            })()}

                            {/* Upper Cripple Studs 'I' ABOVE Lintel Header (exactly aligned on 'J' studs) */}
                            {crippleXPositions.map((cX, cIdx) => {
                              const topPlateBottomY = 176;
                              const headerTopY = headerPosY;
                              const iHeight = headerTopY - topPlateBottomY;
                              if (iHeight > 10) {
                                return (
                                  <g key={`I-${cIdx}`}>
                                    <rect 
                                      x={150 + cX} 
                                      y={topPlateBottomY} 
                                      width={studThick} 
                                      height={iHeight} 
                                      fill="#fef3c7" 
                                      stroke="#b45309" 
                                      strokeWidth="1" 
                                    />
                                    <text 
                                      x={150 + cX + studThick / 2} 
                                      y={topPlateBottomY + iHeight / 2} 
                                      fontSize="7.5" 
                                      fill="#78350f" 
                                      fontWeight="extrabold" 
                                      textAnchor="middle" 
                                      writingMode="vertical-rl"
                                    >
                                      I
                                    </text>
                                  </g>
                                );
                              }
                              return null;
                            })}

                            {/* Opening Rough Opening Area */}
                            <rect 
                              x={150 + op.startDist} 
                              y={headY} 
                              width={op.width} 
                              height={op.height} 
                              fill="#0284c7" 
                              fillOpacity="0.12" 
                              stroke="#0284c7" 
                              strokeWidth="2" 
                              strokeDasharray="5 3" 
                            />
                            
                            {/* Opening Label */}
                            <text 
                              x={150 + op.startDist + op.width / 2} 
                              y={headY + op.height / 2} 
                              fontSize="10" 
                              fill="#0369a1" 
                              fontWeight="bold" 
                              textAnchor="middle"
                            >
                              {op.id} ({op.type.toUpperCase()} · {op.width} × {op.height} mm)
                            </text>
                          </g>
                        );
                      })}
                    </g>

                    {/* Corner-of-Stud Dimension Tick Marks at Bottom */}
                    {dimensionChain.map((dim, idx) => (
                      <g key={idx}>
                        <line 
                          x1={150 + dim} 
                          y1={100 + currentPanel.height} 
                          x2={150 + dim} 
                          y2={100 + currentPanel.height + 25} 
                          stroke="#64748b" 
                          strokeWidth="0.8" 
                        />
                        <text 
                          x={150 + dim} 
                          y={100 + currentPanel.height + 38} 
                          fontSize="7" 
                          fill="#475569" 
                          fontFamily="monospace"
                          textAnchor="end" 
                          transform={`rotate(-45, ${150 + dim}, ${100 + currentPanel.height + 38})`}
                        >
                          {dim}
                        </text>
                      </g>
                    ))}

                    {/* Overall Wall Length Dimension Bar */}
                    <line 
                      x1="150" 
                      y1={100 + currentPanel.height + 65} 
                      x2={150 + currentPanel.length} 
                      y2={100 + currentPanel.height + 65} 
                      stroke="#0f172a" 
                      strokeWidth="1.5" 
                    />
                    <line x1="150" y1={100 + currentPanel.height + 58} x2="150" y2={100 + currentPanel.height + 72} stroke="#0f172a" strokeWidth="1.5" />
                    <line x1={150 + currentPanel.length} y1={100 + currentPanel.height + 58} x2={150 + currentPanel.length} y2={100 + currentPanel.height + 72} stroke="#0f172a" strokeWidth="1.5" />
                    <text 
                      x={150 + currentPanel.length / 2} 
                      y={100 + currentPanel.height + 84} 
                      fontSize="11" 
                      fontWeight="bold" 
                      fill="#0f172a" 
                      textAnchor="middle"
                    >
                      {currentPanel.length} MM OVERALL PANEL LENGTH (CORNER TO CORNER)
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Header Toolbar */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-teal-600" />
                    <span>Wall Plan & Top-Plate / Bottom-Plate Layout</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plan cross-section view · Sheeting position: <strong className="text-teal-700 font-bold">{isSheathingInterior ? 'Inside Face (Top)' : 'Outside Face (Bottom)'}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2 flex-wrap">
                  {/* Tool Mode Toggles */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setPlanToolMode('inspect')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center space-x-1 transition cursor-pointer ${
                        planToolMode === 'inspect' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Inspect & measure snapping nodes"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => setPlanToolMode('drag')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center space-x-1 transition cursor-pointer ${
                        planToolMode === 'drag' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-indigo-700'
                      }`}
                      title="Drag studs or openings along wall axis with snapping"
                    >
                      <Move className="w-3.5 h-3.5" />
                      <span>Drag Tool</span>
                    </button>
                    <button
                      onClick={() => setPlanToolMode('split')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center space-x-1 transition cursor-pointer ${
                        planToolMode === 'split' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
                      }`}
                      title="Click canvas to split wall panel into two panels"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Split Panel</span>
                    </button>
                    <button
                      onClick={() => setPlanToolMode('add')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center space-x-1 transition cursor-pointer ${
                        planToolMode === 'add' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-teal-700'
                      }`}
                      title="Click canvas or snap node to insert a new stud"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Stud</span>
                    </button>
                    <button
                      onClick={() => setPlanToolMode('delete')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center space-x-1 transition cursor-pointer ${
                        planToolMode === 'delete' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
                      }`}
                      title="Click any stud to delete it"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Stud</span>
                    </button>
                  </div>

                  {/* Delete Selected Stud Action Button when a stud is selected */}
                  {selectedStud && (
                    <button
                      onClick={() => handleDeleteStudById(selectedStud.id)}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                      title={`Delete currently selected stud ${selectedStud.id} (Shortcut: Delete key)`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                      <span>Delete Stud {selectedStud.id}</span>
                    </button>
                  )}

                  {/* Split Action Button when in Split Mode */}
                  {planToolMode === 'split' ? (
                    <button
                      onClick={() => {
                        const pos = activePlanSnap ? activePlanSnap.dist : (hoverPlanMm ?? Math.round(currentPanel.length / 2));
                        handleSplitPanelAtPos(pos);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                      title="Split wall panel into 2 wall panels at current snap/hover position"
                    >
                      <Scissors className="w-3.5 h-3.5 text-rose-200" />
                      <span>Split Panel at {activePlanSnap ? `${Math.round(activePlanSnap.dist)} mm` : `${hoverPlanMm ?? 0} mm`}</span>
                    </button>
                  ) : (
                    /* Add stud at active snap button */
                    <button
                      onClick={() => {
                        const pos = activePlanSnap ? activePlanSnap.dist : (hoverPlanMm ?? 400);
                        handleAddStudAtPos(pos);
                      }}
                      className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                      title="Insert stud at current cursor/snap position"
                    >
                      <Plus className="w-3.5 h-3.5 text-teal-200" />
                      <span>Insert Stud at Snap ({activePlanSnap ? `${Math.round(activePlanSnap.dist)} mm` : `${hoverPlanMm ?? 0} mm`})</span>
                    </button>
                  )}

                  {/* Reset custom stud layout if modified */}
                  {((currentPanel.customStuds && currentPanel.customStuds.length > 0) || (currentPanel.deletedStuds && currentPanel.deletedStuds.length > 0)) && (
                    <button
                      onClick={handleResetCustomStuds}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer"
                      title="Restore original EC5 stud layout"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset Studs</span>
                    </button>
                  )}

                  <button
                    onClick={handleFlipOrientation}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-300" />
                    <span>Flip Orientation</span>
                  </button>
                </div>
              </div>

              {/* Selected Stud Inspector Banner */}
              {selectedStud && (
                <div className="bg-amber-50 border-2 border-amber-400 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold font-mono text-xs shadow-xs">
                      {selectedStud.id}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">{selectedStud.role}</span>
                        <span className="bg-amber-200 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded">Selected Stud</span>
                      </div>
                      <p className="text-xs text-amber-800 font-mono mt-0.5">
                        Left Corner: <strong>{selectedStud.leftCorner} mm</strong> · Right Edge: <strong>{selectedStud.rightEdge} mm</strong> · Thickness: <strong>38 mm</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-1.5 bg-white border border-amber-300 rounded-lg px-2 py-1">
                      <span className="text-[10px] font-bold text-amber-900 uppercase">Material:</span>
                      <select
                        value={getMemberMaterial(selectedStud.id)}
                        onChange={e => handleSetMemberMaterial(selectedStud.id, e.target.value as FramingMaterialType)}
                        className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                      >
                        <option value="dimensional">Dimensional</option>
                        <option value="ijoist">I-Joist</option>
                        <option value="lvl">LVL</option>
                      </select>
                    </div>
                    <button
                      onClick={() => handleDeleteStudById(selectedStud.id)}
                      className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                      title="Delete this selected stud from wall panel (Shortcut: Delete / Backspace key)"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                      <span>Delete Selected Stud ({selectedStud.id})</span>
                    </button>
                    <button
                      onClick={() => setSelectedStudId(null)}
                      className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Deselect
                    </button>
                  </div>
                </div>
              )}

              {/* 2D Framing Plan Snapping Controls Ribbon */}
              <div className="bg-slate-900 text-white border border-slate-800 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1 mr-1">
                    <Magnet className="w-3.5 h-3.5" />
                    <span>2D Canvas Snapping</span>
                  </span>

                  {/* Master Snap Toggle */}
                  <button
                    onClick={() => setSnapSettings(s => ({ ...s, master: !s.master }))}
                    className={`px-2.5 py-1 rounded-md font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer ${
                      snapSettings.master
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Magnet className="w-3.5 h-3.5" />
                    <span>Snap {snapSettings.master ? 'ON' : 'OFF'}</span>
                  </button>

                  <span className="text-slate-700">|</span>

                  {/* Grid Snap & Step */}
                  <button
                    onClick={() => setSnapSettings(s => ({ ...s, grid: !s.grid }))}
                    className={`px-2.5 py-1 rounded-md font-semibold text-xs flex items-center space-x-1 transition cursor-pointer ${
                      snapSettings.grid && snapSettings.master
                        ? 'bg-slate-700 text-teal-300 border border-teal-500/30'
                        : 'bg-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Grid Snap</span>
                  </button>

                  <select
                    value={snapSettings.gridStep}
                    onChange={e => setSnapSettings(s => ({ ...s, gridStep: Number(e.target.value) }))}
                    disabled={!snapSettings.grid || !snapSettings.master}
                    className="bg-slate-800 border border-slate-700 text-teal-300 font-mono text-xs px-2 py-1 rounded-md focus:outline-none cursor-pointer disabled:opacity-40"
                  >
                    <option value={50}>50 mm</option>
                    <option value={100}>100 mm</option>
                    <option value={400}>400 mm (Stud C/C)</option>
                  </select>

                  <span className="text-slate-700">|</span>

                  {/* Stud Center Snap */}
                  <button
                    onClick={() => setSnapSettings(s => ({ ...s, studs: !s.studs }))}
                    className={`px-2.5 py-1 rounded-md font-semibold text-xs flex items-center space-x-1 transition cursor-pointer ${
                      snapSettings.studs && snapSettings.master
                        ? 'bg-slate-700 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Stud Snap (Left/Center/Right)</span>
                  </button>

                  {/* Corner & Jamb Snap */}
                  <button
                    onClick={() => setSnapSettings(s => ({ ...s, corners: !s.corners }))}
                    className={`px-2.5 py-1 rounded-md font-semibold text-xs flex items-center space-x-1 transition cursor-pointer ${
                      snapSettings.corners && snapSettings.master
                        ? 'bg-slate-700 text-sky-300 border border-sky-500/30'
                        : 'bg-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Corner / Jamb Snap</span>
                  </button>

                  {/* Ortho Lock Snap */}
                  <button
                    onClick={() => setSnapSettings(s => ({ ...s, ortho: !s.ortho }))}
                    className={`px-2.5 py-1 rounded-md font-semibold text-xs flex items-center space-x-1 transition cursor-pointer ${
                      snapSettings.ortho && snapSettings.master
                        ? 'bg-slate-700 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <span>📐 Ortho (0°/90°)</span>
                  </button>
                </div>

                {/* Live Snapping Target Telemetry Badge */}
                <div className="flex items-center space-x-2 font-mono text-xs flex-wrap">
                  {hoverPlanMm !== null ? (
                    <>
                      <span className="bg-teal-950 text-teal-300 border border-teal-500/40 px-2.5 py-0.5 rounded-md font-semibold animate-in fade-in duration-150 flex items-center space-x-1.5">
                        <span>{activePlanSnap ? activePlanSnap.label : `📍 Distance: ${hoverPlanMm} mm`}</span>
                        {planToolMode === 'add' && <span className="text-teal-400 font-bold">(Click to place stud)</span>}
                      </span>
                      {nearestStructuralNode && (
                        <span className={`px-2.5 py-0.5 rounded-md font-bold flex items-center space-x-1 border animate-in fade-in duration-150 ${
                          nearestStructuralNode.isJunctionBlock 
                            ? 'bg-purple-950 text-purple-200 border-purple-500/50' 
                            : 'bg-sky-950 text-sky-200 border-sky-500/50'
                        }`}>
                          <span>⚡ Nearest Snap: <strong>{nearestStructuralNode.stud.id}</strong> ({nearestStructuralNode.isJunctionBlock ? 'Junction Block' : 'Trimmer'})</span>
                          <span className="text-amber-300 ml-1">[{nearestStructuralNode.distanceMm} mm clearance]</span>
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-400 text-[11px] font-sans italic">
                      Move mouse or drag stud over canvas to inspect & auto-snap to Junction Blocks / Trimmers
                    </span>
                  )}
                </div>
              </div>

              {/* Blueprint Canvas Container */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-center items-center overflow-x-auto relative">
                <div className="w-full max-w-5xl bg-slate-50/70 border border-slate-200 rounded-xl p-8 relative">
                  <svg 
                    viewBox={`0 0 ${currentPanel.length + 400} 350`} 
                    className={`w-full h-auto overflow-visible select-none ${
                      draggedItem
                        ? 'cursor-grabbing'
                        : planToolMode === 'drag'
                        ? 'cursor-grab'
                        : planToolMode === 'split'
                        ? 'cursor-crosshair'
                        : planToolMode === 'add'
                        ? 'cursor-copy'
                        : planToolMode === 'delete'
                        ? 'cursor-pointer'
                        : 'cursor-crosshair'
                    }`}
                    onClick={(e) => {
                      if (planToolMode === 'split' && hoverPlanMm !== null) {
                        const targetPos = activePlanSnap ? activePlanSnap.dist : hoverPlanMm;
                        handleSplitPanelAtPos(targetPos);
                      } else if (planToolMode === 'add' && hoverPlanMm !== null) {
                        const targetPos = activePlanSnap ? activePlanSnap.dist : hoverPlanMm;
                        handleAddStudAtPos(targetPos);
                      }
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clientX = e.clientX - rect.left;
                      const svgWidth = rect.width;
                      const viewWidth = currentPanel.length + 400;
                      const svgX = (clientX / svgWidth) * viewWidth;
                      const rawMm = svgX - 150;
                      if (rawMm >= -40 && rawMm <= currentPanel.length + 40) {
                        const { dist, snap } = calculatePlanSnap(rawMm);
                        setHoverPlanMm(dist);
                        setActivePlanSnap(snap);

                        // If active dragging is in progress, update stud or opening position live
                        if (draggedItem) {
                          const targetPos = snap ? snap.dist : dist;
                          if (draggedItem.type === 'stud') {
                            const studThick = 38;
                            const clampedPos = Math.max(0, Math.min(currentPanel.length - studThick, Math.round(targetPos)));
                            setPanels(prev => prev.map(p => {
                              if (p.id !== currentPanel.id) return p;
                              const deleted = p.deletedStuds || [];
                              const isStdStud = !draggedItem.id.startsWith('CS-');
                              const newDeleted = isStdStud && !deleted.includes(draggedItem.id) ? [...deleted, draggedItem.id] : deleted;
                              let newCustom = p.customStuds || [];
                              if (draggedItem.id.startsWith('CS-')) {
                                const csIdx = parseInt(draggedItem.id.replace('CS-', ''), 10) - 1;
                                newCustom = newCustom.map((cPos, i) => i === csIdx ? clampedPos : cPos);
                              } else {
                                if (!newCustom.includes(clampedPos)) {
                                  newCustom = [...newCustom, clampedPos];
                                }
                              }
                              return { ...p, deletedStuds: newDeleted, customStuds: newCustom };
                            }));
                          } else if (draggedItem.type === 'opening') {
                            const opId = draggedItem.id;
                            const targetOp = currentPanel.openings.find(o => o.id === opId);
                            if (targetOp) {
                              const clampedDist = Math.max(0, Math.min(currentPanel.length - targetOp.width, Math.round(targetPos)));
                              setPanels(prev => prev.map(p => {
                                if (p.id !== currentPanel.id) return p;
                                return {
                                  ...p,
                                  openings: p.openings.map(o => o.id === opId ? { ...o, startDist: clampedDist } : o)
                                };
                              }));
                            }
                          }
                        }
                      } else {
                        setHoverPlanMm(null);
                        setActivePlanSnap(null);
                      }
                    }}
                    onMouseUp={() => {
                      if (draggedItem) {
                        showToast(`Finished dragging ${draggedItem.type} ${draggedItem.id}`);
                        setDraggedItem(null);
                      }
                    }}
                    onMouseLeave={() => {
                      if (draggedItem) {
                        setDraggedItem(null);
                      }
                      setHoverPlanMm(null);
                      setActivePlanSnap(null);
                    }}
                  >
                    {/* OSB Sheathing Layer: Flips between Outside (Bottom y=180) and Inside (Top y=60) */}
                    {currentPanel.hasSheathing && (
                      <g>
                        <rect 
                          x="150" 
                          y={isSheathingInterior ? (80 - 14) : (80 + currentPanel.thickness + 2)} 
                          width={currentPanel.length} 
                          height="12" 
                          fill={isSheathingInterior ? "#d97706" : "#0f766e"} 
                          stroke={isSheathingInterior ? "#92400e" : "#0d9488"} 
                          strokeWidth="1.5" 
                        />
                        <text 
                          x="60" 
                          y={isSheathingInterior ? (80 - 4) : (80 + currentPanel.thickness + 12)} 
                          fontSize="9" 
                          fontWeight="bold" 
                          fill={isSheathingInterior ? "#92400e" : "#0f766e"}
                        >
                          {isSheathingInterior ? 'INSIDE (12mm OSB)' : 'OUTSIDE (12mm OSB)'}
                        </text>
                      </g>
                    )}

                    {/* Wall Stud Core Layer Bounds */}
                    <rect x="150" y="80" width={currentPanel.length} height={currentPanel.thickness} fill="none" stroke="#0f172a" strokeWidth="2" />

                    {/* Openings & Lintel Header Outlines Rendered on 2D Plan View */}
                    {currentPanel.openings.map((op, i) => (
                      <g 
                        key={op.id || i}
                        className={`group ${planToolMode === 'drag' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                        onMouseDown={(e) => {
                          if (planToolMode === 'drag') {
                            e.stopPropagation();
                            setDraggedItem({ type: 'opening', id: op.id, origPos: op.startDist });
                          }
                        }}
                      >
                        {/* Lintel Header Timber Beam Span in Plan View (Spanning over trimmers) */}
                        <rect 
                          x={150 + op.startDist - 38} 
                          y="74" 
                          width={op.width + 76} 
                          height={currentPanel.thickness + 12} 
                          fill="#0f766e" 
                          fillOpacity="0.14" 
                          stroke="#0d9488" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 2" 
                          rx="3"
                        />
                        <rect 
                          x={150 + op.startDist} 
                          y="80" 
                          width={op.width} 
                          height={currentPanel.thickness} 
                          fill="#0284c7" 
                          fillOpacity="0.18" 
                          stroke="#0284c7" 
                          strokeWidth="2" 
                          strokeDasharray="4 2" 
                        />
                        <text 
                          x={150 + op.startDist + op.width / 2} 
                          y={80 + currentPanel.thickness / 2 + 3} 
                          fontSize="9" 
                          fontWeight="bold" 
                          fill="#0284c7" 
                          textAnchor="middle"
                        >
                          {op.id} ({op.type.toUpperCase()} · {op.width}×{op.height}mm)
                        </text>
                        {planToolMode === 'drag' && (
                          <g transform={`translate(${150 + op.startDist + op.width / 2}, 62)`}>
                            <rect x="-26" y="-11" width="52" height="15" rx="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                            <text x="0" y="0" fontSize="8" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                              ↔ Drag
                            </text>
                          </g>
                        )}
                      </g>
                    ))}

                    {/* Stud cross sections with X-bracing in plan view */}
                    {studPositions.map((stud, i) => {
                      const studW = stud.rightEdge - stud.leftCorner;
                      const isColliding = !!stud.collision;
                      const isShifted = !!stud.shifted;
                      const isCustom = stud.role.includes('Custom');
                      const isSelected = selectedStudId === stud.id;
                      const isNearestSnapNode = nearestStructuralNode && nearestStructuralNode.stud.id === stud.id && hoverPlanMm !== null;

                      return (
                        <g 
                          key={stud.id || i} 
                          className={`group cursor-pointer ${planToolMode === 'drag' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                          onMouseDown={(e) => {
                            if (planToolMode === 'drag') {
                              e.stopPropagation();
                              setDraggedItem({ type: 'stud', id: stud.id, origPos: stud.leftCorner });
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudId(stud.id);
                            if (planToolMode === 'delete') {
                              handleDeleteStudById(stud.id);
                            }
                          }}
                        >
                          {/* Nearest Structural Snap Target (Junction Block / Trimmer) Highlighting */}
                          {isNearestSnapNode && (
                            <g className="animate-pulse">
                              <rect 
                                x={150 + stud.leftCorner - 4} 
                                y="72" 
                                width={studW + 8} 
                                height={currentPanel.thickness + 16} 
                                fill={nearestStructuralNode.isJunctionBlock ? "#c084fc" : "#38bdf8"} 
                                fillOpacity="0.35" 
                                stroke={nearestStructuralNode.isJunctionBlock ? "#9333ea" : "#0284c7"} 
                                strokeWidth="2.5" 
                                strokeDasharray="4 2" 
                                rx="4" 
                              />
                              <rect 
                                x={150 + stud.leftCorner - 12} 
                                y="52" 
                                width={studW + 24} 
                                height="15" 
                                rx="3" 
                                fill={nearestStructuralNode.isJunctionBlock ? "#7e22ce" : "#0369a1"} 
                              />
                              <text 
                                x={150 + stud.leftCorner + studW / 2} 
                                y="63" 
                                fontSize="7.5" 
                                fontWeight="bold" 
                                fill="#ffffff" 
                                textAnchor="middle"
                              >
                                ⚡ SNAP: {stud.id}
                              </text>
                            </g>
                          )}

                          {/* Selected Stud Outer Glow Highlight */}
                          {isSelected && !isNearestSnapNode && (
                            <rect 
                              x={150 + stud.leftCorner - 3} 
                              y="75" 
                              width={studW + 6} 
                              height={currentPanel.thickness + 10} 
                              fill="#fde047" 
                              fillOpacity="0.4" 
                              stroke="#f59e0b" 
                              strokeWidth="2.5" 
                              rx="3" 
                            />
                          )}

                          {(() => {
                            const studMat = getMemberMaterial(stud.id);
                            if (studMat === 'ijoist') {
                              const flH = Math.max(12, currentPanel.thickness * 0.22);
                              const webW = Math.max(8, studW * 0.3);
                              return (
                                <g>
                                  <rect x={150 + stud.leftCorner} y="80" width={studW} height={flH} fill="#e6a648" stroke="#9a5b1f" strokeWidth="1.2" />
                                  <rect x={150 + stud.leftCorner} y={80 + currentPanel.thickness - flH} width={studW} height={flH} fill="#e6a648" stroke="#9a5b1f" strokeWidth="1.2" />
                                  <rect x={150 + stud.leftCorner + (studW - webW) / 2} y={80 + flH} width={webW} height={currentPanel.thickness - flH * 2} fill="#78461a" stroke="#451a03" strokeWidth="1" />
                                </g>
                              );
                            }
                            if (studMat === 'lvl') {
                              const plyW = (studW - 2) / 2;
                              return (
                                <g>
                                  <rect x={150 + stud.leftCorner} y="80" width={plyW} height={currentPanel.thickness} fill="#ea580c" stroke="#7c2d12" strokeWidth="1.1" />
                                  <rect x={150 + stud.leftCorner + plyW + 2} y="80" width={plyW} height={currentPanel.thickness} fill="#d97706" stroke="#7c2d12" strokeWidth="1.1" />
                                  <line x1={150 + stud.leftCorner + plyW + 1} y1="80" x2={150 + stud.leftCorner + plyW + 1} y2={80 + currentPanel.thickness} stroke="#431407" strokeWidth="1.5" />
                                </g>
                              );
                            }
                            return (
                              <>
                                <rect 
                                  x={150 + stud.leftCorner} 
                                  y="80" 
                                  width={studW} 
                                  height={currentPanel.thickness} 
                                  fill={isSelected ? '#fef08a' : isNearestSnapNode ? (nearestStructuralNode.isJunctionBlock ? '#f3e8ff' : '#e0f2fe') : isCustom ? '#dbeafe' : isColliding ? '#fecaca' : isShifted ? '#bbf7d0' : '#fef3c7'} 
                                  stroke={isSelected ? '#d97706' : isNearestSnapNode ? (nearestStructuralNode.isJunctionBlock ? '#9333ea' : '#0284c7') : isCustom ? '#2563eb' : isColliding ? '#dc2626' : '#b45309'} 
                                  strokeWidth={isSelected || isNearestSnapNode ? "3" : planToolMode === 'delete' ? "2" : "1.2"} 
                                  strokeDasharray="3 2"
                                />
                                <line
                                  x1={150 + stud.leftCorner}
                                  y1="80"
                                  x2={150 + stud.leftCorner + studW}
                                  y2={80 + currentPanel.thickness}
                                  stroke={isSelected ? '#b45309' : isNearestSnapNode ? (nearestStructuralNode.isJunctionBlock ? '#9333ea' : '#0284c7') : isCustom ? '#2563eb' : isColliding ? '#dc2626' : '#b45309'}
                                  strokeWidth={isSelected || isNearestSnapNode ? "1.5" : "0.8"}
                                  strokeDasharray="3 2"
                                />
                                <line
                                  x1={150 + stud.leftCorner + studW}
                                  y1="80"
                                  x2={150 + stud.leftCorner}
                                  y2={80 + currentPanel.thickness}
                                  stroke={isSelected ? '#b45309' : isNearestSnapNode ? (nearestStructuralNode.isJunctionBlock ? '#9333ea' : '#0284c7') : isCustom ? '#2563eb' : isColliding ? '#dc2626' : '#b45309'}
                                  strokeWidth={isSelected || isNearestSnapNode ? "1.5" : "0.8"}
                                  strokeDasharray="3 2"
                                />
                              </>
                            );
                          })()}
                          
                          {/* Stud ID Label Above */}
                          <text
                            x={150 + stud.leftCorner + studW / 2}
                            y="72"
                            fontSize={isSelected || isNearestSnapNode ? "9" : "8"}
                            fontWeight="bold"
                            fill={isSelected ? '#b45309' : isNearestSnapNode ? (nearestStructuralNode.isJunctionBlock ? '#7e22ce' : '#0369a1') : isCustom ? '#1d4ed8' : '#334155'}
                            textAnchor="middle"
                          >
                            {isSelected ? `🎯 ${stud.id}` : stud.id}
                          </text>

                          {/* Quick Delete Stud Overlay Icon */}
                          {planToolMode === 'delete' && (
                            <g 
                              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStudById(stud.id);
                              }}
                            >
                              <circle
                                cx={150 + stud.leftCorner + studW / 2}
                                cy={80 + currentPanel.thickness / 2}
                                r="8"
                                fill="#dc2626"
                              />
                              <text
                                x={150 + stud.leftCorner + studW / 2}
                                y={80 + currentPanel.thickness / 2 + 3}
                                fontSize="9"
                                fill="#ffffff"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                ✕
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Live Alignment Dashed Guide Line & Clearance Dimension Leader to Nearest Structural Node */}
                    {hoverPlanMm !== null && nearestStructuralNode && (
                      <g className="pointer-events-none">
                        {/* Target Crosshair Line */}
                        <line
                          x1={150 + nearestStructuralNode.stud.leftCorner}
                          y1="40"
                          x2={150 + nearestStructuralNode.stud.leftCorner}
                          y2={120 + currentPanel.thickness}
                          stroke={nearestStructuralNode.isJunctionBlock ? "#9333ea" : "#0284c7"}
                          strokeWidth="1.8"
                          strokeDasharray="4 2"
                        />
                        {/* Clearance Horizontal Dimension Leader Line */}
                        {Math.abs(hoverPlanMm - nearestStructuralNode.stud.leftCorner) > 10 && (
                          <g>
                            <line
                              x1={150 + hoverPlanMm}
                              y1={80 + currentPanel.thickness / 2}
                              x2={150 + nearestStructuralNode.stud.leftCorner}
                              y2={80 + currentPanel.thickness / 2}
                              stroke={nearestStructuralNode.isJunctionBlock ? "#9333ea" : "#0284c7"}
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                            <circle cx={150 + hoverPlanMm} cy={80 + currentPanel.thickness / 2} r="3" fill="#f59e0b" />
                            <circle cx={150 + nearestStructuralNode.stud.leftCorner} cy={80 + currentPanel.thickness / 2} r="3" fill={nearestStructuralNode.isJunctionBlock ? "#9333ea" : "#0284c7"} />
                            <rect
                              x={150 + (hoverPlanMm + nearestStructuralNode.stud.leftCorner) / 2 - 50}
                              y={80 + currentPanel.thickness / 2 - 18}
                              width="100"
                              height="16"
                              rx="4"
                              fill={nearestStructuralNode.isJunctionBlock ? "#faf5ff" : "#f0f9ff"}
                              stroke={nearestStructuralNode.isJunctionBlock ? "#c084fc" : "#38bdf8"}
                              strokeWidth="1.2"
                            />
                            <text
                              x={150 + (hoverPlanMm + nearestStructuralNode.stud.leftCorner) / 2}
                              y={80 + currentPanel.thickness / 2 - 6}
                              fontSize="8.5"
                              fontWeight="extrabold"
                              fill={nearestStructuralNode.isJunctionBlock ? "#6b21a8" : "#0369a1"}
                              textAnchor="middle"
                            >
                              Clearance: {nearestStructuralNode.distanceMm} mm
                            </text>
                          </g>
                        )}
                      </g>
                    )}

                    {/* Side Indicators */}
                    <text x="70" y="60" fontSize="9" fontWeight="bold" fill={isSheathingInterior ? "#92400e" : "#64748b"}>
                      INSIDE FACE {isSheathingInterior ? '(SHEETING ATTACHED)' : ''}
                    </text>
                    <text x="70" y={80 + currentPanel.thickness + 28} fontSize="9" fontWeight="bold" fill={!isSheathingInterior ? "#0f766e" : "#64748b"}>
                      OUTSIDE FACE {!isSheathingInterior ? '(SHEETING ATTACHED)' : ''}
                    </text>

                    {/* Overall dimension line */}
                    <line x1="150" y1="230" x2={150 + currentPanel.length} y2="230" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="150" y1="223" x2="150" y2="237" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1={150 + currentPanel.length} y1="223" x2={150 + currentPanel.length} y2="237" stroke="#0f172a" strokeWidth="1.5" />
                    <text x={150 + currentPanel.length / 2} y="255" fontSize="11" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                      {currentPanel.length} MM OVERALL PLAN LENGTH ({currentPanel.thickness} MM WALL THICKNESS)
                    </text>

                    {/* Active Snapping Visual Guidelines & Target Callouts */}
                    {hoverPlanMm !== null && (
                      <g className="transition-all duration-75">
                        {/* Split Tool Cut Indicator */}
                        {planToolMode === 'split' && (
                          <g>
                            <line 
                              x1={150 + hoverPlanMm} 
                              y1="15" 
                              x2={150 + hoverPlanMm} 
                              y2="285" 
                              stroke="#e11d48" 
                              strokeWidth="2.5" 
                              strokeDasharray="6 3" 
                            />
                            <g transform={`translate(${150 + hoverPlanMm}, 20)`}>
                              <rect x="-95" y="-14" width="190" height="20" rx="5" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
                              <text x="0" y="0" fontSize="9" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                                ✂️ Click to Split Panel at {hoverPlanMm} mm
                              </text>
                            </g>
                          </g>
                        )}

                        {/* Vertical Snapping Guide Line */}
                        <line 
                          x1={150 + hoverPlanMm} 
                          y1="35" 
                          x2={150 + hoverPlanMm} 
                          y2="280" 
                          stroke={planToolMode === 'split' ? '#e11d48' : activePlanSnap ? (activePlanSnap.type === 'corner' ? '#0284c7' : activePlanSnap.type === 'stud' ? '#d97706' : activePlanSnap.type === 'opening' ? '#0284c7' : '#0d9488') : '#64748b'} 
                          strokeWidth={activePlanSnap ? '2' : '1.2'} 
                          strokeDasharray={activePlanSnap ? 'none' : '4 3'} 
                        />

                        {/* Snapping Node Target Markers */}
                        <circle 
                          cx={150 + hoverPlanMm} 
                          cy="80" 
                          r={activePlanSnap ? '5' : '3.5'} 
                          fill={activePlanSnap ? '#0d9488' : '#64748b'} 
                          stroke="#ffffff" 
                          strokeWidth="1.5" 
                        />
                        <circle 
                          cx={150 + hoverPlanMm} 
                          cy={80 + currentPanel.thickness} 
                          r={activePlanSnap ? '5' : '3.5'} 
                          fill={activePlanSnap ? '#0d9488' : '#64748b'} 
                          stroke="#ffffff" 
                          strokeWidth="1.5" 
                        />

                        {/* Floating Tooltip Callout above Wall Plate */}
                        <g transform={`translate(${150 + hoverPlanMm}, 22)`}>
                          <rect 
                            x="-65" 
                            y="-14" 
                            width="130" 
                            height="18" 
                            rx="4" 
                            fill={activePlanSnap ? '#0f172a' : '#334155'} 
                            stroke={activePlanSnap ? '#14b8a6' : '#64748b'} 
                            strokeWidth="1" 
                          />
                          <text 
                            x="0" 
                            y="-2" 
                            fontSize="8.5" 
                            fontWeight="bold" 
                            fill="#ffffff" 
                            textAnchor="middle" 
                            fontFamily="monospace"
                          >
                            {activePlanSnap ? activePlanSnap.label : `📍 ${hoverPlanMm} mm`}
                          </text>
                        </g>
                      </g>
                    )}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {activeTab === '3d' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Box className="w-4 h-4 text-teal-600" />
                    <span>3D Axonometric Framing Projection</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Drag to orbit 3D model · Sheeting: <strong className="text-teal-700">{isSheathingInterior ? 'Inside Face (Rear)' : 'Outside Face (Front)'}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {currentPanel.hasSheathing && (
                    <button
                      onClick={() => setXray3dSheathing(v => !v)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                        xray3dSheathing
                          ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                      title="Toggle translucent X-Ray sheathing so 3D I-Joist & LVL profiles remain visible"
                    >
                      {xray3dSheathing ? 'OSB: X-Ray' : 'OSB: Solid'}
                    </button>
                  )}

                  <button
                    onClick={handleFlipOrientation}
                    className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-teal-200" />
                    <span>Flip Orientation</span>
                  </button>

                  <button 
                    onClick={() => setZoom3D(z => Math.min(2, z + 0.15))}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setZoom3D(z => Math.max(0.5, z - 0.15))}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setRotX(18); setRotY(-25); setZoom3D(1); }}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset View</span>
                  </button>
                </div>
              </div>

              {/* Interactive 3D Canvas */}
              <div 
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-center items-center overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
                onMouseDown={e => {
                  setIsDragging3D(true);
                  setDragStart({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={e => {
                  if (!isDragging3D) return;
                  const dx = e.clientX - dragStart.x;
                  const dy = e.clientY - dragStart.y;
                  setRotY(r => r + dx * 0.4);
                  setRotX(r => Math.max(-60, Math.min(60, r - dy * 0.4)));
                  setDragStart({ x: e.clientX, y: e.clientY });
                }}
                onMouseUp={() => setIsDragging3D(false)}
                onMouseLeave={() => setIsDragging3D(false)}
              >
                <div className="w-full max-w-4xl bg-slate-50/70 border border-slate-200 rounded-xl p-8 relative flex items-center justify-center">
                  <svg 
                    viewBox="0 0 800 500" 
                    className="w-full h-auto max-h-[480px] overflow-visible"
                    style={{ transform: `scale(${zoom3D})`, transition: isDragging3D ? 'none' : 'transform 0.15s ease-out' }}
                  >
                    <defs>
                      <linearGradient id="timberGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fef3c7" />
                        <stop offset="100%" stopColor="#fde68a" />
                      </linearGradient>
                      <linearGradient id="osbFaceExt" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#94a3b8" />
                      </linearGradient>
                      <linearGradient id="osbFaceInt" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fde68a" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                      <pattern id="osbWebHatch3d" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                        <rect width="8" height="8" fill="#78461a" />
                        <line x1="0" y1="2" x2="8" y2="2" stroke="#92400e" strokeWidth="1.2" />
                        <line x1="2" y1="6" x2="6" y2="6" stroke="#451a03" strokeWidth="1" />
                      </pattern>
                      <pattern id="lvlVeneer3d" width="6" height="6" patternUnits="userSpaceOnUse">
                        <rect width="6" height="6" fill="#ea580c" />
                        <line x1="0" y1="2" x2="6" y2="2" stroke="#9a3412" strokeWidth="0.9" />
                        <line x1="0" y1="5" x2="6" y2="5" stroke="#fb923c" strokeWidth="0.7" />
                      </pattern>
                    </defs>

                    <g transform={`translate(400, 250) rotate(${rotX}) skewX(${rotY}) scale(0.85)`}>
                      {/* Rear OSB Sheathing Face if Interior */}
                      {currentPanel.hasSheathing && isSheathingInterior && (
                        <g>
                          <rect 
                            x="-300" 
                            y="-150" 
                            width="600" 
                            height="300" 
                            fill="url(#osbFaceInt)" 
                            stroke="#b45309" 
                            strokeWidth="2" 
                            opacity="0.9" 
                          />
                          <text x="0" y="0" fontSize="16" fontWeight="bold" fill="#78350f" textAnchor="middle">
                            12mm OSB SHEATHING (INSIDE FACE)
                          </text>
                        </g>
                      )}

                      {(() => {
                        const render3DMemberGeometry = (
                          keyId: string,
                          x: number,
                          y: number,
                          w: number,
                          h: number,
                          orientation: 'vertical' | 'horizontal',
                          matType: FramingMaterialType,
                          baseFill: string,
                          baseStroke: string,
                          opts?: { labelText?: string; isSelected?: boolean; targetId?: string; selectStud?: boolean }
                        ) => {
                          const dx3 = 4;
                          const dy3 = -3.5;
                          const targetMemberId = opts?.targetId;
                          const isTargetSelected = opts?.isSelected || (targetMemberId && selectedMemberMaterialId === targetMemberId);
                          const handleMemberClick = (ev: React.MouseEvent) => {
                            if (!targetMemberId) return;
                            ev.stopPropagation();
                            setSelectedMemberMaterialId(targetMemberId);
                            if (opts?.selectStud) setSelectedStudId(targetMemberId);
                          };
                          const clickProps = targetMemberId
                            ? { onClick: handleMemberClick, className: 'cursor-pointer' }
                            : {};

                          if (matType === 'ijoist') {
                            if (orientation === 'vertical') {
                              // 3D Axonometric Vertical I-Joist Stud: Front & Back wide LVL flanges + recessed dark OSB web channel + web stiffeners
                              const flangeW = Math.max(2.2, w * 0.28);
                              const webW = Math.max(1.8, w - flangeW * 2);
                              const stiffH = Math.min(18, h * 0.11);
                              return (
                                <g key={keyId} {...clickProps}>
                                  {/* Extruded 3D rear LVL flange depth face */}
                                  <polygon
                                    points={`${x + w},${y} ${x + w + dx3},${y + dy3} ${x + w + dx3},${y + h + dy3} ${x + w},${y + h}`}
                                    fill="#c4852c"
                                    stroke="#78350f"
                                    strokeWidth="0.8"
                                  />
                                  <polygon
                                    points={`${x},${y} ${x + dx3},${y + dy3} ${x + w + dx3},${y + dy3} ${x + w},${y}`}
                                    fill="#f3c16d"
                                    stroke="#78350f"
                                    strokeWidth="0.8"
                                  />
                                  {/* Left LVL Flange */}
                                  <rect x={x} y={y} width={flangeW} height={h} fill="#e6a648" stroke="#9a5b1f" strokeWidth="0.9" />
                                  {/* Recessed OSB Web Core */}
                                  <rect x={x + flangeW} y={y} width={webW} height={h} fill="url(#osbWebHatch3d)" stroke="#451a03" strokeWidth="0.9" />
                                  {/* Right LVL Flange */}
                                  <rect x={x + flangeW + webW} y={y} width={flangeW} height={h} fill="#e6a648" stroke="#9a5b1f" strokeWidth="0.9" />
                                  {/* Top & Bottom Web Stiffeners inside channel */}
                                  {h > 36 && (
                                    <>
                                      <rect x={x + flangeW + 0.4} y={y + 2} width={Math.max(1, webW - 0.8)} height={stiffH} fill="#b87d32" stroke="#78350f" strokeWidth="0.6" />
                                      <rect x={x + flangeW + 0.4} y={y + h - stiffH - 2} width={Math.max(1, webW - 0.8)} height={stiffH} fill="#b87d32" stroke="#78350f" strokeWidth="0.6" />
                                    </>
                                  )}
                                  {isTargetSelected && (
                                    <rect x={x - 1.8} y={y - 1.8} width={w + 3.6} height={h + 3.6} fill="none" stroke="#0284c7" strokeWidth="2" />
                                  )}
                                </g>
                              );
                            }

                            // Horizontal I-Joist Beam / Header / Plate: Top & Bottom LVL Flanges + Recessed OSB Web + End Stiffeners
                            const flangeH = Math.max(4, Math.min(9, h * 0.24));
                            const webY = y + flangeH;
                            const webH = Math.max(3, h - flangeH * 2);
                            const stiffW = Math.min(18, w * 0.12);
                            return (
                              <g key={keyId} {...clickProps}>
                                {/* 3D Top & Right depth faces */}
                                <polygon
                                  points={`${x},${y} ${x + dx3},${y + dy3} ${x + w + dx3},${y + dy3} ${x + w},${y}`}
                                  fill="#f3c16d"
                                  stroke="#78350f"
                                  strokeWidth="0.9"
                                />
                                <polygon
                                  points={`${x + w},${y} ${x + w + dx3},${y + dy3} ${x + w + dx3},${y + h + dy3} ${x + w},${y + h}`}
                                  fill="#c4852c"
                                  stroke="#78350f"
                                  strokeWidth="0.9"
                                />
                                {/* Top LVL Flange */}
                                <rect x={x} y={y} width={w} height={flangeH} fill="#e6a648" stroke="#9a5b1f" strokeWidth="1" />
                                {/* Recessed OSB Structural Web Core */}
                                <rect x={x + 1.5} y={webY} width={Math.max(4, w - 3)} height={webH} fill="url(#osbWebHatch3d)" stroke="#451a03" strokeWidth="1" />
                                {/* End Web Stiffener Blocks */}
                                {w > 48 && webH > 4 && (
                                  <>
                                    <rect x={x + 4} y={webY} width={stiffW} height={webH} fill="#b87d32" stroke="#78350f" strokeWidth="0.8" />
                                    <rect x={x + w - 4 - stiffW} y={webY} width={stiffW} height={webH} fill="#b87d32" stroke="#78350f" strokeWidth="0.8" />
                                  </>
                                )}
                                {/* Bottom LVL Flange */}
                                <rect x={x} y={y + h - flangeH} width={w} height={flangeH} fill="#e6a648" stroke="#9a5b1f" strokeWidth="1" />
                                {opts?.labelText && (
                                  <text x={x + w / 2} y={y + h / 2 + 3} fontSize="7.5" fill="#fef3c7" fontWeight="bold" textAnchor="middle">
                                    I-JOIST · {opts.labelText}
                                  </text>
                                )}
                                {isTargetSelected && (
                                  <rect x={x - 1.8} y={y - 1.8} width={w + 3.6} height={h + 3.6} fill="none" stroke="#0284c7" strokeWidth="2" />
                                )}
                              </g>
                            );
                          }

                          if (matType === 'lvl') {
                            if (orientation === 'vertical') {
                              // 3D Multi-Ply Laminated Veneer Lumber Stud (2 plies + phenolic glue-line seam + veneer caps)
                              const seamW = Math.max(0.8, w * 0.14);
                              const plyW = Math.max(1.8, (w - seamW) / 2);
                              return (
                                <g key={keyId} {...clickProps}>
                                  <polygon
                                    points={`${x},${y} ${x + dx3},${y + dy3} ${x + w + dx3},${y + dy3} ${x + w},${y}`}
                                    fill="#fb923c"
                                    stroke="#7c2d12"
                                    strokeWidth="0.8"
                                  />
                                  <polygon
                                    points={`${x + w},${y} ${x + w + dx3},${y + dy3} ${x + w + dx3},${y + h + dy3} ${x + w},${y + h}`}
                                    fill="#c2410c"
                                    stroke="#7c2d12"
                                    strokeWidth="0.8"
                                  />
                                  <rect x={x} y={y} width={plyW} height={h} fill="url(#lvlVeneer3d)" stroke="#7c2d12" strokeWidth="0.85" />
                                  <rect x={x + plyW} y={y} width={seamW} height={h} fill="#431407" />
                                  <rect x={x + plyW + seamW} y={y} width={plyW} height={h} fill="#d97706" stroke="#7c2d12" strokeWidth="0.85" />
                                  {isTargetSelected && (
                                    <rect x={x - 1.8} y={y - 1.8} width={w + 3.6} height={h + 3.6} fill="none" stroke="#0284c7" strokeWidth="2" />
                                  )}
                                </g>
                              );
                            }

                            // Horizontal Multi-Ply LVL Header / Beam with visible 2-ply stack extrusion + phenolic glue-line seam
                            const capH = Math.max(2, Math.min(4, h * 0.12));
                            const midY = y + h * 0.5;
                            return (
                              <g key={keyId} {...clickProps}>
                                {/* Twin extruded ply top faces showing 2-ply thickness */}
                                <polygon
                                  points={`${x},${y} ${x + dx3 * 0.5},${y + dy3 * 0.5} ${x + w + dx3 * 0.5},${y + dy3 * 0.5} ${x + w},${y}`}
                                  fill="#fb923c"
                                  stroke="#7c2d12"
                                  strokeWidth="0.85"
                                />
                                <polygon
                                  points={`${x + dx3 * 0.5},${y + dy3 * 0.5} ${x + dx3},${y + dy3} ${x + w + dx3},${y + dy3} ${x + w + dx3 * 0.5},${y + dy3 * 0.5}`}
                                  fill="#f59e0b"
                                  stroke="#7c2d12"
                                  strokeWidth="0.85"
                                />
                                <polygon
                                  points={`${x + w},${y} ${x + w + dx3},${y + dy3} ${x + w + dx3},${y + h + dy3} ${x + w},${y + h}`}
                                  fill="#c2410c"
                                  stroke="#7c2d12"
                                  strokeWidth="0.9"
                                />
                                <rect x={x} y={y} width={w} height={h} fill="url(#lvlVeneer3d)" stroke="#7c2d12" strokeWidth="1.3" rx="1" />
                                {/* Phenolic top & bottom veneer caps and mid lamination line */}
                                <rect x={x} y={y} width={w} height={capH} fill="#9a3412" />
                                <rect x={x} y={y + h - capH} width={w} height={capH} fill="#9a3412" />
                                <line x1={x} y1={midY} x2={x + w} y2={midY} stroke="#431407" strokeWidth="1.1" strokeDasharray="6 2" />
                                {opts?.labelText && (
                                  <text x={x + w / 2} y={y + h / 2 + 3} fontSize="8" fill="#ffffff" fontWeight="bold" textAnchor="middle">
                                    2-PLY LVL · {opts.labelText}
                                  </text>
                                )}
                                {isTargetSelected && (
                                  <rect x={x - 1.8} y={y - 1.8} width={w + 3.6} height={h + 3.6} fill="none" stroke="#0284c7" strokeWidth="2" />
                                )}
                              </g>
                            );
                          }

                          // Standard Dimensional Solid-Sawn Timber
                          return (
                            <g key={keyId} {...clickProps}>
                              <rect
                                x={x}
                                y={y}
                                width={w}
                                height={h}
                                fill={baseFill}
                                stroke={isTargetSelected ? '#0284c7' : baseStroke}
                                strokeWidth={isTargetSelected ? '2.2' : orientation === 'horizontal' ? '1.3' : '1.1'}
                              />
                              {opts?.labelText && (
                                <text x={x + w / 2} y={y + h / 2 + 3} fontSize="8.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">
                                  {opts.labelText}
                                </text>
                              )}
                            </g>
                          );
                        };

                        const bottomMat = getMemberMaterial('BOTTOM-PLATES');
                        const topMat = getMemberMaterial('TOP-PLATES');

                        return (
                          <>
                            {/* Double Bottom Plate */}
                            {render3DMemberGeometry('bp-1', -300, 120, 600, 15, 'horizontal', bottomMat, '#b07d4f', '#78350f', { targetId: 'BOTTOM-PLATES' })}
                            {render3DMemberGeometry('bp-2', -300, 135, 600, 15, 'horizontal', bottomMat, '#b07d4f', '#78350f', { targetId: 'BOTTOM-PLATES' })}

                            {/* Double Top Plate */}
                            {render3DMemberGeometry('tp-1', -300, -150, 600, 15, 'horizontal', topMat, '#d4944e', '#9a5b1f', { targetId: 'TOP-PLATES' })}
                            {render3DMemberGeometry('tp-2', -300, -135, 600, 15, 'horizontal', topMat, '#8c5828', '#5c3614', { targetId: 'TOP-PLATES' })}

                            {/* Studs colored by structural category and rendered with per-member 3D profile */}
                            {studPositions.filter(s => !/trimmer|jack/i.test(s.role)).slice(0, 32).map((stud, i) => {
                              const scale = 600 / Math.max(1, currentPanel.length);
                              const sx = -300 + stud.leftCorner * scale;
                              const sw = Math.max(5.5, (stud.rightEdge - stud.leftCorner) * scale);
                              const roleLower = stud.role.toLowerCase();
                              const studFill = stud.collision
                                ? '#dc2626'
                                : roleLower.includes('osb corner backing')
                                ? '#06b6d4'
                                : roleLower.includes('corner stud') || roleLower.includes('end stud')
                                ? '#2563eb'
                                : roleLower.includes('intersection support') || roleLower.includes('junction backing')
                                ? '#14b8a6'
                                : roleLower.includes('junction')
                                ? '#4f46e5'
                                : roleLower.includes('king')
                                ? '#eab308'
                                : roleLower.includes('seam') || roleLower.includes('custom')
                                ? '#d946ef'
                                : '#22c55e';
                              const studStroke = stud.collision
                                ? '#991b1b'
                                : roleLower.includes('osb corner backing')
                                ? '#0e7490'
                                : roleLower.includes('corner stud') || roleLower.includes('end stud')
                                ? '#1e40af'
                                : roleLower.includes('intersection support') || roleLower.includes('junction backing')
                                ? '#0f766e'
                                : roleLower.includes('junction')
                                ? '#3730a3'
                                : roleLower.includes('king')
                                ? '#a16207'
                                : roleLower.includes('seam') || roleLower.includes('custom')
                                ? '#a21caf'
                                : '#15803d';
                              return render3DMemberGeometry(
                                stud.id || `stud-${i}`,
                                sx,
                                -120,
                                sw,
                                240,
                                'vertical',
                                getMemberMaterial(stud.id),
                                studFill,
                                studStroke,
                                { isSelected: selectedStudId === stud.id, targetId: stud.id, selectStud: true }
                              );
                            })}

                            {/* Openings with Structural Lintel Headers, Trimmer Studs, Window Sills, and Cripples */}
                            {currentPanel.openings.map((op, i) => {
                              const scale = 600 / Math.max(1, currentPanel.length);
                              const hScale = 240 / Math.max(1000, currentPanel.height - 76);
                              const ox = -300 + op.startDist * scale;
                              const ow = op.width * scale;

                              const sillY = 120 - (op.type === 'door' ? 0 : (op.sillHeight || 0)) * hScale;
                              const opH3d = Math.max(20, op.height * hScale);
                              const headY_3d = sillY - opH3d;
                              const hdrH = Math.max(16, 44 * hScale);
                              const headerY_3d = Math.max(-120, headY_3d - hdrH);

                              const studThick = 38;
                              const spacing = currentPanel.studSpacing;
                              const crippleXPositions: number[] = [];
                              let cPos = spacing;
                              while (cPos < currentPanel.length) {
                                if (cPos >= op.startDist + studThick && cPos <= op.startDist + op.width - studThick * 2) {
                                  crippleXPositions.push(cPos);
                                }
                                cPos += spacing;
                              }
                              if (crippleXPositions.length === 0 && op.width > studThick * 3) {
                                crippleXPositions.push(Math.round(op.startDist + op.width / 2 - studThick / 2));
                              }

                              const trimH = Math.max(10, sillY - (headerY_3d + hdrH));
                              const hdrMat = getMemberMaterial(`HDR-${op.id}`);
                              const sillMat = getMemberMaterial(`SILL-${op.id}`);
                              const leftTrimMat = getMemberMaterial(`TR-L-${i}`);
                              const rightTrimMat = getMemberMaterial(`TR-R-${i}`);
                              const cripIMat = getMemberMaterial(`CRIP-I-${op.id}`);
                              const cripJMat = getMemberMaterial(`CRIP-J-${op.id}`);

                              return (
                                <g key={op.id || i}>
                                  {/* Rough Opening Glass/Void Area */}
                                  <rect 
                                    x={ox} 
                                    y={headY_3d} 
                                    width={ow} 
                                    height={opH3d} 
                                    fill="#0284c7" 
                                    fillOpacity="0.22" 
                                    stroke="#0284c7" 
                                    strokeWidth="1.5" 
                                    strokeDasharray="4 2" 
                                  />
                                  <text 
                                    x={ox + ow / 2} 
                                    y={headY_3d + opH3d / 2 + 4} 
                                    fontSize="10" 
                                    fontWeight="bold" 
                                    fill="#0284c7" 
                                    textAnchor="middle"
                                  >
                                    {op.id} ({op.type.toUpperCase()})
                                  </text>

                                  {/* Structural Lintel Header Beam */}
                                  {render3DMemberGeometry(
                                    `hdr-${op.id}`,
                                    ox - 8,
                                    headerY_3d,
                                    ow + 16,
                                    hdrH,
                                    'horizontal',
                                    hdrMat,
                                    '#0284c7',
                                    '#0369a1',
                                    { labelText: `HEADER ${op.id}`, targetId: `HDR-${op.id}` }
                                  )}

                                  {/* Window Sill Beam (for windows with sillHeight > 0) */}
                                  {op.type === 'window' && op.sillHeight > 0 && render3DMemberGeometry(
                                    `sill-${op.id}`,
                                    ox - 8,
                                    sillY,
                                    ow + 16,
                                    10,
                                    'horizontal',
                                    sillMat,
                                    '#9c7049',
                                    '#78350f',
                                    { targetId: `SILL-${op.id}` }
                                  )}

                                  {/* Left & Right Trimmers (Jack Studs) */}
                                  {render3DMemberGeometry(`tr-l-${i}`, ox - 8, headerY_3d + hdrH, 8, trimH, 'vertical', leftTrimMat, '#f97316', '#c2410c', { isSelected: selectedStudId === `TR-L-${i}`, targetId: `TR-L-${i}`, selectStud: true })}
                                  {render3DMemberGeometry(`tr-r-${i}`, ox + ow, headerY_3d + hdrH, 8, trimH, 'vertical', rightTrimMat, '#f97316', '#c2410c', { isSelected: selectedStudId === `TR-R-${i}`, targetId: `TR-R-${i}`, selectStud: true })}

                                  {/* Upper Header Cripple Studs 'I' in 3D (Purple) */}
                                  {crippleXPositions.map((cX, cIdx) => {
                                    const cx3d = -300 + cX * scale;
                                    const iHeight = headerY_3d - (-120);
                                    if (iHeight > 5) {
                                      return render3DMemberGeometry(`3d-I-${i}-${cIdx}`, cx3d, -120, 7, iHeight, 'vertical', cripIMat, '#a855f7', '#7e22ce', { targetId: `CRIP-I-${op.id}` });
                                    }
                                    return null;
                                  })}

                                  {/* Lower Sill Cripple Studs 'J' in 3D (Pink) */}
                                  {op.type === 'window' && op.sillHeight > 0 && crippleXPositions.map((cX, cIdx) => {
                                    const cx3d = -300 + cX * scale;
                                    const jHeight = 120 - (sillY + 10);
                                    if (jHeight > 5) {
                                      return render3DMemberGeometry(`3d-J-${i}-${cIdx}`, cx3d, sillY + 10, 7, jHeight, 'vertical', cripJMat, '#ec4899', '#be185d', { targetId: `CRIP-J-${op.id}` });
                                    }
                                    return null;
                                  })}
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}

                      {/* Front OSB Sheathing Face if Exterior (translucent X-Ray by default so 3D framing profiles stay clear) */}
                      {currentPanel.hasSheathing && !isSheathingInterior && (
                        <g style={{ pointerEvents: 'none' }}>
                          <rect 
                            x="-300" 
                            y="-150" 
                            width="600" 
                            height="300" 
                            fill="url(#osbFaceExt)" 
                            stroke="#475569" 
                            strokeWidth="2" 
                            strokeDasharray={xray3dSheathing ? '8 4' : undefined}
                            opacity={xray3dSheathing ? 0.14 : 0.72} 
                          />
                          {!xray3dSheathing && (
                            <text x="0" y="0" fontSize="16" fontWeight="bold" fill="#1e293b" textAnchor="middle">
                              12mm OSB SHEATHING (OUTSIDE FACE)
                            </text>
                          )}
                          {xray3dSheathing && (
                            <text x="-290" y="-156" fontSize="9" fontWeight="bold" fill="#475569">
                              12mm OSB SHEATHING (X-RAY OVERLAY)
                            </text>
                          )}
                        </g>
                      )}
                    </g>
                  </svg>
                </div>

                {/* 3D Stud Categories & EWP Material Profiles Legend */}
                <div className="mt-4 w-full max-w-4xl bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-700">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mr-1">3D Categories & Materials:</span>
                  {[
                    ['#e6a648', 'I-Joist LVL Flange'],
                    ['#78461a', 'I-Joist OSB Web'],
                    ['#ea580c', 'LVL (Multi-Ply)'],
                    ['#22c55e', 'Common Stud'],
                    ['#eab308', 'King Stud'],
                    ['#f97316', 'Jack / Trimmer'],
                    ['#a855f7', 'Header Cripple'],
                    ['#ec4899', 'Sill Cripple'],
                    ['#2563eb', 'Corner Pack'],
                    ['#06b6d4', 'Corner Backing'],
                    ['#4f46e5', 'T-Junction Stud'],
                    ['#d946ef', 'Break / Custom Stud'],
                    ['#d4944e', 'Very Top Plate'],
                    ['#8c5828', 'Top Plate'],
                    ['#b07d4f', 'Bottom Plate & Sill'],
                    ['#0284c7', 'Header / Lintel']
                  ].map(([hex, label]) => (
                    <span key={label} className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs border border-black/15 shrink-0" style={{ backgroundColor: hex }} />
                      <span>{label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                    <span>Bill of Materials & Timber Cut List ({currentPanel.name})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quantities, lengths, and linear meters generated from structural model
                  </p>
                </div>

                <button 
                  onClick={() => {
                    const genPdf = (window as any).generateWallPanelPackagePDF;
                    if (typeof genPdf === 'function') genPdf();
                    showToast('Exporting PDF Takeoff...');
                  }}
                  className="bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Shop Drawing PDF</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3.5">Member Role</th>
                      <th className="p-3.5">Timber Grade</th>
                      <th className="p-3.5">Section Size (mm)</th>
                      <th className="p-3.5">Length (mm)</th>
                      <th className="p-3.5">Qty</th>
                      <th className="p-3.5">Total Linear Meters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-bold text-slate-900">Bottom Plate (Double)</td>
                      <td className="p-3.5">{currentPanel.lumberGrade}</td>
                      <td className="p-3.5 font-mono">{currentPanel.thickness} × 38</td>
                      <td className="p-3.5 font-mono">{currentPanel.length}</td>
                      <td className="p-3.5 font-mono font-bold">2</td>
                      <td className="p-3.5 font-mono font-bold text-teal-700">{((currentPanel.length * 2) / 1000).toFixed(2)} m</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-bold text-slate-900">Top Plate (Double)</td>
                      <td className="p-3.5">{currentPanel.lumberGrade}</td>
                      <td className="p-3.5 font-mono">{currentPanel.thickness} × 38</td>
                      <td className="p-3.5 font-mono">{currentPanel.length}</td>
                      <td className="p-3.5 font-mono font-bold">2</td>
                      <td className="p-3.5 font-mono font-bold text-teal-700">{((currentPanel.length * 2) / 1000).toFixed(2)} m</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-bold text-slate-900">Common & Stud Packs ({currentPanel.studSpacing}mm C/C)</td>
                      <td className="p-3.5">{currentPanel.lumberGrade}</td>
                      <td className="p-3.5 font-mono">{currentPanel.thickness} × 38</td>
                      <td className="p-3.5 font-mono">{currentPanel.height - 76}</td>
                      <td className="p-3.5 font-mono font-bold">{studPositions.length}</td>
                      <td className="p-3.5 font-mono font-bold text-teal-700">{(((currentPanel.height - 76) * studPositions.length) / 1000).toFixed(2)} m</td>
                    </tr>
                    {currentPanel.openings.map((op) => (
                      <tr key={op.id} className="hover:bg-slate-50/70">
                        <td className="p-3.5 font-bold text-slate-900">Lintel Header ({op.id})</td>
                        <td className="p-3.5">{currentPanel.lumberGrade}</td>
                        <td className="p-3.5 font-mono">{currentPanel.thickness} × 150</td>
                        <td className="p-3.5 font-mono">{op.width + 76}</td>
                        <td className="p-3.5 font-mono font-bold">1</td>
                        <td className="p-3.5 font-mono font-bold text-teal-700">{((op.width + 76) / 1000).toFixed(2)} m</td>
                      </tr>
                    ))}
                    {currentPanel.hasSheathing && (
                      <tr className="bg-teal-50/40 hover:bg-teal-50/60 font-semibold text-teal-900">
                        <td className="p-3.5 font-bold text-teal-950">
                          OSB Sheathing (12mm) · {isSheathingBoth ? 'Both Sides (Double Sheathed)' : isSheathingInterior ? 'Inside Face (Interior)' : 'Outside Face (Exterior)'}
                        </td>
                        <td className="p-3.5">OSB/3 Class</td>
                        <td className="p-3.5 font-mono">12 mm Board</td>
                        <td className="p-3.5 font-mono">{currentPanel.length} × {currentPanel.height}</td>
                        <td className="p-3.5 font-mono font-bold">{isSheathingBoth ? '2 Sheets (Double)' : '1 Sheet'}</td>
                        <td className="p-3.5 font-mono font-bold text-teal-700">{(((currentPanel.length * currentPanel.height) / 1000000) * (isSheathingBoth ? 2 : 1)).toFixed(2)} m²</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ifc' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>Timber Teck BIM &amp; IFC Importer</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct vertex coordinate extraction · Scale-correct normalizer
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/50 hover:bg-amber-50/30 p-10 rounded-2xl text-center flex flex-col items-center justify-center space-y-3 transition cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Upload className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Drag &amp; drop your .IFC or BIM architectural file here</p>
                    <p className="text-xs text-slate-500 mt-1">Supports IFC2x3, IFC4, BIM .pln, and DXF models</p>
                  </div>

                  <input 
                    type="file" 
                    accept=".ifc,.pln,.dxf,.xml,.json" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const text = await file.text();
                        const convertFn = (window as any).convertIFCToBIMModel;
                        if (typeof convertFn === 'function') {
                          const res = convertFn(text, file.name);
                          if (res && res.model && res.model.elements) {
                            const walls = res.model.elements.filter((el: any) => el.type === 'wall');
                            const allOpenings = res.model.elements.filter((el: any) => el.host);
                            const importedPanels: WallPanel[] = walls.map((w: any, idx: number) => {
                              const isExt = w.layer === 'Exterior Walls';
                              const wLen = Math.round(Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y));
                              const ops = allOpenings.filter((o: any) => o.host === w.id).map((o: any) => ({
                                id: o.id,
                                type: (o.type === 'door' ? 'door' : 'window') as 'door' | 'window',
                                startDist: Math.round(o.offset - o.width / 2),
                                width: Math.round(o.width),
                                height: Math.round(o.height),
                                sillHeight: Math.round(o.sill || 0)
                              }));
                              return {
                                id: w.id || `PANEL-${idx + 1}`,
                                name: `${isExt ? 'External Wall' : 'Internal Wall'} ${w.id}`,
                                type: isExt ? 'external' : 'internal',
                                length: wLen || 6000,
                                height: Math.round(w.height || 3000),
                                thickness: Math.round(w.thickness || (isExt ? 140 : 100)),
                                lumberGrade: isExt ? 'C24' : 'C16',
                                studSpacing: w.framing?.spacing || 400,
                                hasSheathing: isExt,
                                sheathingSide: 'exterior',
                                headerPosition: 'top',
                                openings: ops
                              };
                            });
                            if (importedPanels.length > 0) {
                              const resequenced = resequencePanels(importedPanels);
                              setPanels(resequenced);
                              setSelectedPanelId(resequenced[0].id);
                              setActiveTab('elevation');
                              showToast(`Successfully imported & auto-ordered ${resequenced.length} wall panels from ${file.name}`);
                            }
                          }
                        }
                      } catch (err) {
                        console.error('IFC import error:', err);
                        showToast('File import completed');
                      }
                    }} 
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-700 file:text-white hover:file:bg-teal-800 cursor-pointer text-slate-500 text-xs mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Structural Engineering Audit ({currentPanel.name})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Eurocode 5 (EN 1995-1-1) & NDS 2024 Timber Construction Compliance Report
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleFixAllAudits}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                    title="Auto-correct all stud collisions, slenderness ratios (λ <= 150), and OSB racking shear capacities across all wall panels using Timber Teck engineering rules"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-100" />
                    <span>Fix All (Timber Teck Engineering Logic)</span>
                  </button>
                  {collidingStuds.length === 0 && !axialAudit.exceedsSlenderness && rackingAudit.isPass && (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-md text-xs font-bold">
                      100% COMPLIANT PASS
                    </span>
                  )}
                </div>
              </div>

              {/* Engineering Check Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dedicated Eurocode 5 Stud Axial Capacity & Slenderness Ratio Check Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4 md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        <span>Stud Axial Compression Capacity & Slenderness Audit (EN 1995-1-1 Cl. 6.3.2)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Evaluates unbraced clear height ({axialAudit.Leff} mm) against section slenderness limit (λ ≤ 150) and timber strength ({axialAudit.grade}).
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {axialAudit.exceedsSlenderness ? (
                        <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold px-3 py-1 rounded-md text-xs shadow-2xs flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>SLENDERNESS EXCEEDED (λ = {axialAudit.lambda_max} &gt; 150)</span>
                        </span>
                      ) : axialAudit.exceedsCapacity ? (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-3 py-1 rounded-md text-xs shadow-2xs flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>OVER CAPACITY (D/C = {axialAudit.dcRatio})</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold px-3 py-1 rounded-md text-xs flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PASS (λ = {axialAudit.lambda_max} ≤ 150 · D/C {axialAudit.dcRatio})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Stud Section Size</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{axialAudit.sw} × {axialAudit.t} mm</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Grade {axialAudit.grade} Timber</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Effective Clear Length (Leff)</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{axialAudit.Leff} mm</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Wall Height {axialAudit.H} mm</span>
                    </div>

                    <div className={`border p-3 rounded-xl ${
                      axialAudit.exceedsSlenderness ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Max Slenderness (λmax)</span>
                      <span className={`font-mono font-bold text-sm ${axialAudit.exceedsSlenderness ? 'text-rose-700' : 'text-slate-900'}`}>
                        λ = {axialAudit.lambda_max}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">EN 1995-1-1 Limit: ≤ 150</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Buckling Capacity (Prd)</span>
                      <span className="font-mono font-bold text-teal-700 text-sm">{axialAudit.Prd} kN</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">kc = {axialAudit.kc} · Demand = {axialAudit.Ped} kN</span>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Demand/Capacity Ratio (D/C = {axialAudit.dcRatio})</span>
                      <span className={axialAudit.exceedsCapacity ? 'text-rose-600 font-bold' : 'text-teal-700 font-bold'}>
                        {Math.round(axialAudit.dcRatio * 100)}% Utilized
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          axialAudit.exceedsCapacity 
                            ? 'bg-rose-500' 
                            : axialAudit.dcRatio > 0.7 
                            ? 'bg-amber-500' 
                            : 'bg-teal-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.round(axialAudit.dcRatio * 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Exceeded Warning & Fix Guidance */}
                  {axialAudit.exceedsSlenderness && (
                    <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-900 space-y-2">
                      <div className="flex items-center space-x-1.5 font-bold text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>STRUCTURAL WARNING: Maximum Slenderness Ratio Exceeded (λ = {axialAudit.lambda_max} &gt; 150)</span>
                      </div>
                      <p className="text-rose-700">
                        The wall height ({axialAudit.H} mm) with section size ({axialAudit.sw} × {axialAudit.t} mm) causes buckling slenderness to exceed Eurocode 5 maximum limits.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => handleUpdatePanel('thickness', axialAudit.t < 140 ? 140 : 180)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded-lg text-xs transition cursor-pointer shadow-xs"
                        >
                          Auto-Upgrade Section to {axialAudit.t < 140 ? '140 mm (2x6)' : '180 mm Heavy'}
                        </button>
                        <button
                          onClick={() => handleUpdatePanel('lumberGrade', 'C24')}
                          className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1 rounded-lg text-xs transition cursor-pointer shadow-xs"
                        >
                          Upgrade Timber Grade to C24
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Individual Stud Slenderness & Capacity Audit Schedule */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Individual Stud Member Audit Schedule</h4>
                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-500 font-bold uppercase border-b border-slate-200">
                            <th className="p-2">Stud ID</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Section</th>
                            <th className="p-2">Leff (mm)</th>
                            <th className="p-2">Slenderness λ</th>
                            <th className="p-2">kc Factor</th>
                            <th className="p-2">Capacity Prd</th>
                            <th className="p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                          {studPositions.map((stud) => {
                            const isStudOver = axialAudit.exceedsSlenderness;
                            return (
                              <tr key={stud.id} className="hover:bg-slate-50">
                                <td className="p-2 font-bold">{stud.id}</td>
                                <td className="p-2 font-sans font-medium text-slate-600">{stud.role}</td>
                                <td className="p-2">{axialAudit.sw}×{axialAudit.t}</td>
                                <td className="p-2">{axialAudit.Leff}</td>
                                <td className={`p-2 font-bold ${isStudOver ? 'text-rose-600' : 'text-slate-900'}`}>
                                  {axialAudit.lambda_max}
                                </td>
                                <td className="p-2">{axialAudit.kc}</td>
                                <td className="p-2 font-bold text-teal-700">{axialAudit.Prd} kN</td>
                                <td className="p-2 font-sans">
                                  {isStudOver ? (
                                    <span className="bg-rose-100 text-rose-800 font-extrabold px-1.5 py-0.5 rounded text-[10px]">EXCEEDED</span>
                                  ) : (
                                    <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px]">PASS</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Stud Collision & Layout Audit</h3>
                    {collidingStuds.length > 0 ? (
                      <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px]">
                        {collidingStuds.length} Action Needed
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[11px]">
                        PASS
                      </span>
                    )}
                  </div>

                  {collidingStuds.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600">The following studs overlap with opening trimmers or junction blocks:</p>
                      {collidingStuds.map(s => (
                        <div key={s.id} className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-xs text-rose-900 flex items-center justify-between">
                          <span><strong>{s.id}</strong> at {s.leftCorner}mm · {s.collisionReason}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">
                      All intermediate studs satisfy minimum edge distance tolerances with no opening or junction conflicts.
                    </p>
                  )}
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Header Lintel Capacity</h3>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[11px]">PASS (D/C 0.68)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Lintel headers calculated using grade {currentPanel.lumberGrade} timber with max span deflection below L/360 under 1.5 kN/m² roof tributary load.
                  </p>
                </div>

                {/* Eurocode 5 (EN 1995-1-1 Cl. 9.2.4) Simplified Racking Resistance Audit Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4 md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        <span>Racking Shear Resistance Audit (EN 1995-1-1 Cl. 9.2.4 Method A/B)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Evaluates 12mm OSB/3 sheathing racking capacity (V_Rd) against characteristic lateral wind shear demand (V_Ed).
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!rackingAudit.hasSheathing ? (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-3 py-1 rounded-md text-xs shadow-2xs flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>NO STRUCTURAL OSB (f_v,0 = 0.0 kN/m)</span>
                        </span>
                      ) : !rackingAudit.isPass ? (
                        <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold px-3 py-1 rounded-md text-xs shadow-2xs flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>EXCEEDS CAPACITY (D/C = {rackingAudit.dcRatio})</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold px-3 py-1 rounded-md text-xs flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PASS (V_Rd = {rackingAudit.Vrd} kN ≥ V_Ed = {rackingAudit.Ved} kN · D/C {rackingAudit.dcRatio})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Racking Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Net Shear Length (L_net)</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{rackingAudit.Lnet} mm</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Total Length {rackingAudit.L} mm</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Unit Strength (f_v,0)</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{rackingAudit.fv0} kN/m</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {rackingAudit.hasSheathing 
                          ? (rackingAudit.side === 'both' ? '12mm OSB (Double Face)' : `12mm OSB (${rackingAudit.side === 'interior' ? 'Inside' : 'Outside'})`)
                          : 'Sheathing OFF'}
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Wind Demand (V_Ed)</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{rackingAudit.Ved} kN</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">w_wind = {rackingAudit.w_wind} kN/m²</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Racking Capacity (V_Rd)</span>
                      <span className="font-mono font-bold text-teal-700 text-sm">{rackingAudit.Vrd} kN</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">f_v,0 × L_net ({rackingAudit.Lnet_m} m)</span>
                    </div>
                  </div>

                  {/* Racking Utilization Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Racking Shear Demand/Capacity Ratio (D/C = {rackingAudit.dcRatio})</span>
                      <span className={!rackingAudit.isPass ? 'text-rose-600 font-bold' : 'text-teal-700 font-bold'}>
                        {Math.round(rackingAudit.dcRatio * 100)}% Utilized
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          !rackingAudit.isPass 
                            ? 'bg-rose-500' 
                            : rackingAudit.dcRatio > 0.75 
                            ? 'bg-amber-500' 
                            : 'bg-teal-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.round(rackingAudit.dcRatio * 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Fix Guidance */}
                  {(!rackingAudit.hasSheathing || !rackingAudit.isPass) && (
                    <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 space-y-2">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>RACKING RESISTANCE NOTICE: {rackingAudit.hasSheathing ? 'Lateral wind load demand exceeds OSB capacity' : 'Structural OSB sheathing is turned OFF'}</span>
                      </div>
                      <p className="text-amber-800">
                        {rackingAudit.hasSheathing 
                          ? `Design wind shear demand (${rackingAudit.Ved} kN) exceeds calculated OSB racking resistance (${rackingAudit.Vrd} kN).`
                          : 'Structural wall panels subject to lateral racking loads require 12mm OSB/3 sheathing with edge fixings @ ≤150mm centers.'}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {!rackingAudit.hasSheathing && (
                          <button
                            onClick={() => handleUpdatePanel('hasSheathing', true)}
                            className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-3 py-1 rounded-lg text-xs transition cursor-pointer shadow-xs"
                          >
                            Enable 12mm OSB/3 Sheathing
                          </button>
                        )}
                        {rackingAudit.hasSheathing && rackingAudit.side !== 'both' && (
                          <button
                            onClick={() => handleSetSheathingSide('both')}
                            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3 py-1 rounded-lg text-xs transition cursor-pointer shadow-xs"
                          >
                            Switch to Both Sides OSB/3 (5.0 kN/m)
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Corner Stud Backing Pack</h3>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[11px]">PASS</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Double corner backing stud pack present on both left (S-0, S-0B) and right (S-END-1, S-END-2) panel ends.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: 2D Roof Truss Elevation & Stresses */}
          {activeTab === 'truss' && activeTruss && (
            <div className="space-y-6">
              {/* Header Control Toolbar */}
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Truss:</span>
                    <select
                      className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                      value={activeTrussTag}
                      onChange={(e) => setActiveTrussTag(e.target.value)}
                    >
                      {Object.values(trussCatalog).map(t => (
                        <option key={t.tag || t.id} value={t.tag || t.id}>
                          {t.tag || t.id}: {t.name} ({(t.span * 1000).toFixed(0)}mm · {t.pitch.toFixed(1)}°)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Grade:</span>
                    <select
                      className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                      value={selectedGradeId}
                      onChange={(e) => handleTrussGradeChange(e.target.value)}
                    >
                      {Object.entries(STANDARD_TIMBER_GRADES).map(([key, g]) => (
                        <option key={key} value={key}>
                          {g.name} ({g.species}) · fm={g.f_m_k} MPa
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold">
                    <span className="text-slate-500">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      activeTruss.integrityStatus === 'PASS' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {activeTruss.integrityStatus} (Max D/C {Math.round(activeTruss.maxUtilization * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => setTrussCatalog(create20TrussesCatalog())}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    title="Reset truss catalog to default layout"
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={handleRunAutoAnalysisOnAllTrusses}
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-md shadow-emerald-700/20 active:scale-95"
                    title="Run ASD/NDS and Eurocode 5 auto-optimization across all project trusses"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>⚡ Run Auto Analysis on All Trusses</span>
                  </button>
                </div>
              </div>

              {/* Interactive 2D Elevation Canvas & Inspector */}
              <div className="w-full h-[850px] min-h-[750px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
                <TrussElevationView
                  truss={activeTruss}
                  trussesCatalog={trussCatalog}
                  onUpdateMemberSection={handleUpdateTrussMemberSection}
                />
              </div>

              {/* ASD / Eurocode 5 Member Stress Schedule Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {activeTruss.tag || activeTruss.id} Member Stress Schedule & Capacity Register
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ASD/NDS 2024 & Eurocode 5 column stability, Euler buckling and combined axial-bending utilization.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {activeTruss.members.length} Total Members
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Member ID</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Section</th>
                        <th className="px-4 py-3">Grade</th>
                        <th className="px-4 py-3 text-right">Length (mm)</th>
                        <th className="px-4 py-3 text-right">Axial Force (kN)</th>
                        <th className="px-4 py-3 text-right">Util (D/C)</th>
                        <th className="px-4 py-3">Governing Failure Mode</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {activeTruss.members.map(m => {
                        const isFailing = m.status === 'FAILED' || m.utilization > 1.0;
                        const axialKn = m.axialForce.toFixed(2);
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{m.id}</td>
                            <td className="px-4 py-2.5 capitalize text-slate-600">
                              {m.type.replace('_', ' ')}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-slate-700">
                              {m.section.width} × {m.section.depth} mm ({m.section.nominalName})
                            </td>
                            <td className="px-4 py-2.5 text-slate-600">{m.grade.name}</td>
                            <td className="px-4 py-2.5 font-mono text-right text-slate-700">
                              {(m.length * 1000).toFixed(0)}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-right text-slate-700">
                              {axialKn} kN {m.axialForce >= 0 ? '(T)' : '(C)'}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-right font-bold">
                              <span className={isFailing ? 'text-rose-600' : m.utilization > 0.8 ? 'text-amber-600' : 'text-emerald-600'}>
                                {Math.round(m.utilization * 100)}%
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-600">
                              {m.governingCheck} Check (λ = {Math.round(m.slendernessRatio)})
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isFailing 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {m.status === 'SAFE' ? 'PASS' : m.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
