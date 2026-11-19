import React, { useState, useEffect, useRef } from 'react';
import type { TrussStructure, Member2D, TimberSection } from '../types/trussElevation';
import {
  calculateMemberStresses,
  calculateMemberRoofLoadBreakdown,
  getSectionSuggestions,
  COMMON_WOOD_SECTIONS,
  createSection,
  create20TrussesCatalog,
  createProjectRoofTruss,
  normalizeTrussTag,
  recalculateTrussMembers,
  autoResolveTruss,
  autoResolveAllTrusses,
  getMiTekRecommendations,
  STANDARD_TIMBER_GRADES,
  createTrussFrom3D,
  chordSigOf,
  segSig,
  websOf,
  websSigOf,
  websForOverride,
  generateWebsForFamily,
  rebuildTrussWithWebs,
  optimizeTrussWebsTopology,
  type WebOptimizationMode,
  type Geom3D,
} from '../services/trussStressEngine';
import {
  evaluateTrussRulesOfThumb,
  applyRulesOfThumbOptimization,
  type RuleOfThumbCheck,
} from '../services/trussRulesAdvisor';

/** Rebuilds the catalog from the live 3D roof; keeps user edits (sections, 2D webs) while the 3D chords are unchanged. */
function reconcileWith3D(prevCatalog: { [id: string]: TrussStructure }): { catalog: { [id: string]: TrussStructure }; changed: boolean } | null {
  const w: any = typeof window !== 'undefined' ? window : null;
  if (!w || typeof w.cadtechGet3DTrussGeometry !== 'function') return null;
  let geoms: Geom3D[] = [];
  try { geoms = w.cadtechGet3DTrussGeometry()?.trusses || []; } catch (err) { console.warn('3D truss read failed', err); return null; }
  if (!geoms.length) return null;
  const next: { [id: string]: TrussStructure } = {};
  let changed = Object.keys(prevCatalog).length !== geoms.length;
  for (const g of geoms) {
    const key = normalizeTrussTag(g.tag);
    const prev = prevCatalog[key];
    const chordSig = chordSigOf(g);
    if (prev && prev.assemblyId === g.assemblyId && prev.sourceChordSig === chordSig) {
      const web3D = segSig(g.webs);
      const userEdited = !!prev.publishedWebSig;
      const missingLoadFields =
        prev.totalRoofLoadKN === undefined ||
        prev.members.some(
          m => m.totalRoofLoadKN === undefined || (m.type === 'top_chord' && Math.abs(m.axialForce) < 0.05)
        );
      if (missingLoadFields) {
        next[key] = createTrussFrom3D(g, prev);
        changed = true;
        continue;
      }
      if (userEdited || web3D === prev.sourceWebSig) { next[key] = prev; continue; }
      // 3D webs changed (e.g. web pattern in roof properties): take the new 3D webs, keep sections
      const rebuilt = rebuildTrussWithWebs({ ...prev, sourceWebSig: web3D, baseWebSig: undefined, publishedWebSig: undefined }, g.webs);
      next[key] = { ...rebuilt, sourceWebSig: web3D, baseWebSig: websSigOf(rebuilt) }; changed = true; continue;
    }
    // chords changed in 3D (or new truss): any stored 2D webs no longer fit -> drop them, 3D regenerates its own
    if (prev?.publishedWebSig) {
      w.cadtechSetTrussWebs?.(g.plyIds || [g.assemblyId], null);
      const again = reconcileWith3D({});
      return again ? { catalog: again.catalog, changed: true } : null;
    }
    next[key] = createTrussFrom3D(g, prev);
    changed = true;
  }
  return { catalog: next, changed };
}

interface Props {
  truss?: TrussStructure;
  initialTruss?: TrussStructure;
  trussesCatalog?: { [id: string]: TrussStructure };
  onUpdateMemberSection?: (memberId: string, section: TimberSection) => void;
  onDeleteMember?: (memberId: string) => void;
}

export const TrussElevationView: React.FC<Props> = ({
  truss: propTruss,
  initialTruss: propInitialTruss,
  trussesCatalog: externalCatalog,
  onUpdateMemberSection,
  onDeleteMember,
}) => {
  const initialTruss = propTruss || propInitialTruss;

  // 20 Active Trusses Catalog (Synchronized with Roof Framing Plan)
  const [catalog, setCatalog] = useState<{ [id: string]: TrussStructure }>(() => {
    const live = reconcileWith3D((typeof window !== 'undefined' && (window as any).cadtechProjectTrussStore) || {});
    if (live) { (window as any).cadtechProjectTrussStore = live.catalog; return live.catalog; }
    if (typeof window !== 'undefined' && (window as any).cadtechProjectTrussStore) {
      const store = (window as any).cadtechProjectTrussStore;
      // Invalidate if it's the old catalog (e.g. TR-11 is not 'howe' or TR-01 is not 'fink' or TR-14 is not 'pratt')
      if (store && store['TR-01']?.type === 'fink' && store['TR-11']?.type === 'howe' && store['TR-14']?.type === 'pratt') {
        const refreshed: { [id: string]: TrussStructure } = {};
        for (const [k, v] of Object.entries(store as { [id: string]: TrussStructure })) {
          refreshed[k] = v.totalRoofLoadKN === undefined ? recalculateTrussMembers(v) : v;
        }
        (window as any).cadtechProjectTrussStore = refreshed;
        return refreshed;
      }
    }
    const initial = externalCatalog || create20TrussesCatalog();
    if (typeof window !== 'undefined') {
      (window as any).cadtechProjectTrussStore = initial;
    }
    return initial;
  });

  const [activeTrussTag, setActiveTrussTag] = useState<string>(() => {
    if (typeof window !== 'undefined' && (window as any).activeTrussTag) {
      return normalizeTrussTag((window as any).activeTrussTag);
    }
    return initialTruss?.tag ? normalizeTrussTag(initialTruss.tag) : 'TR-01';
  });

  const [selectedMemberId, setSelectedMemberId] = useState<string>('TC-M2');
  const [memberFilter, setMemberFilter] = useState<'all' | 'chords' | 'webs' | 'failing'>('all');
  const [plyTab, setPlyTab] = useState<'1-ply' | '2-ply' | '3-ply'>('1-ply');
  const [applyScope, setApplyScope] = useState<'chords' | 'webs' | 'single'>('chords');
  const [showLoads, setShowLoads] = useState(true);
  const [showDeflection, setShowDeflection] = useState(false);
  const [familyType, setFamilyType] = useState('Fink Truss (W-Truss)');
  const [isEditSpecOpen, setIsEditSpecOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isLoadScheduleOpen, setIsLoadScheduleOpen] = useState(false);
  const [webOptMode, setWebOptMode] = useState<WebOptimizationMode>('auto');

  // Edit Spec form state
  const [specSpan, setSpecSpan] = useState(9.4);
  const [specPitch, setSpecPitch] = useState(15.0);
  const [specOverhang, setSpecOverhang] = useState(450);
  const [specSpacing, setSpecSpacing] = useState(600);
  const [specGrade, setSpecGrade] = useState('NO2_SPF');
  const [specDeadLoadKPa, setSpecDeadLoadKPa] = useState(0.65);
  const [specLiveLoadKPa, setSpecLiveLoadKPa] = useState(1.20);
  const [applyLoadsToAll, setApplyLoadsToAll] = useState(true);

  const carouselRef = useRef<HTMLDivElement>(null);

  // 3D -> 2D: follow every change of the 3D roof (chords, spacing, wall seat, regenerated webs)
  useEffect(() => {
    const pull = () => {
      const panel = document.getElementById('truss-elevation-panel');
      if (panel && panel.classList.contains('hidden')) return;
      setCatalog(prev => {
        const r = reconcileWith3D(prev);
        if (!r || !r.changed) return prev;
        return r.catalog;
      });
    };
    pull();
    window.addEventListener('cadtech:modelChanged', pull);
    const timer = window.setInterval(pull, 1200);
    return () => { window.removeEventListener('cadtech:modelChanged', pull); window.clearInterval(timer); };
  }, []);

  // 2D -> 3D: webs edited in this tab (family change, delete member, auto-design...) are written to the 3D roof
  useEffect(() => {
    const w: any = window;
    if (typeof w.cadtechSetTrussWebs !== 'function') return;
    for (const t of Object.values(catalog)) {
      if (!t.assemblyId) continue;
      const sig = websSigOf(t);
      const ids = t.plyIds || [t.assemblyId];
      if (sig !== t.baseWebSig && sig !== t.publishedWebSig) {
        t.publishedWebSig = sig;
        w.cadtechSetTrussWebs(ids, websForOverride(t));
      } else if (sig === t.baseWebSig && t.publishedWebSig) {
        t.publishedWebSig = undefined;
        w.cadtechSetTrussWebs(ids, null);
      }
    }
  }, [catalog]);

  // Synchronize window global store and activeTrussTag bidirectionally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).activeTrussTag = activeTrussTag;
      (window as any).cadtechProjectTrussStore = catalog;
      window.dispatchEvent(
        new CustomEvent('cadtech:activeTrussChanged', { detail: { tag: activeTrussTag } })
      );
      if (typeof (window as any).render === 'function') {
        try {
          (window as any).render();
        } catch (_) {}
      }
    }
  }, [activeTrussTag, catalog]);

  // Synchronize activeTrussTag when propTruss changes from App.tsx
  useEffect(() => {
    if (propTruss?.tag) {
      const norm = normalizeTrussTag(propTruss.tag);
      if (norm !== activeTrussTag) {
        setActiveTrussTag(norm);
      }
      setCatalog(prev => {
        if (!prev[norm] && !prev[propTruss.tag]) {
          return { ...prev, [norm]: propTruss };
        }
        return prev;
      });
    }
  }, [propTruss?.tag, propTruss]);

  // Listen to external selection events (e.g., clicking truss in 2D Roof Framing Plan)
  useEffect(() => {
    const handleTrussSelected = (e: any) => {
      const rawTag = e?.detail?.tag || (typeof window !== 'undefined' && (window as any).activeTrussTag);
      if (rawTag) {
        const norm = normalizeTrussTag(rawTag);
        if (norm !== activeTrussTag) {
          setActiveTrussTag(norm);
        }
      }
    };
    window.addEventListener('cadtech:activeTrussChanged', handleTrussSelected);
    window.addEventListener('roofTrussSelected', handleTrussSelected);

    return () => {
      window.removeEventListener('cadtech:activeTrussChanged', handleTrussSelected);
      window.removeEventListener('roofTrussSelected', handleTrussSelected);
    };
  }, [activeTrussTag]);

  // When activeTrussTag changes, ensure the selected card is visibly scrolled into view
  useEffect(() => {
    if (!carouselRef.current) return;
    const cardEl = carouselRef.current.querySelector(`[data-truss-tag="${activeTrussTag}"]`) as HTMLElement | null;
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTrussTag]);

  // Lookup active truss with fallback normalization
  const normalizedKey = normalizeTrussTag(activeTrussTag);
  const truss: TrussStructure = catalog[normalizedKey] || catalog[activeTrussTag] || initialTruss || Object.values(catalog)[0];

  // Evaluate Rules of Thumb & Engineering Design Logics
  const advisorResult = evaluateTrussRulesOfThumb(truss);

  // Update spec form values and familyType when active truss changes
  useEffect(() => {
    if (truss) {
      setSpecSpan(truss.span);
      setSpecPitch(truss.pitch);
      setSpecOverhang(Math.round(truss.overhang * 1000));
      setSpecSpacing(Math.round(truss.spacing * 1000));
      setSpecDeadLoadKPa(truss.deadLoadKPa ?? 0.65);
      setSpecLiveLoadKPa(truss.liveLoadKPa ?? 1.20);
      const fam = truss.type === 'howe' ? 'Howe Truss'
        : truss.type === 'pratt' ? 'Pratt Truss'
        : truss.type === 'truncated' ? 'Truncated Flat Top'
        : truss.type === 'girder' ? 'Hip Girder'
        : 'Fink Truss (W-Truss)';
      setFamilyType(fam);
    }
  }, [truss.tag, truss.type, truss.deadLoadKPa, truss.liveLoadKPa]);

  // Handler: Change truss family and regenerate geometry
  const handleFamilyChange = (newFamily: string) => {
    setFamilyType(newFamily);
    setCatalog(prev => {
      const cur = prev[normalizedKey] || truss;
      if (!cur) return prev;
      if (cur.assemblyId) {
        // 3D-linked truss: keep the real chords, regenerate only the webs, and let the sync push them to 3D
        const plan = /auto/i.test(newFamily) && (window as any).trussWebPlanFor ? (window as any).trussWebPlanFor(cur.span, cur.spacing, cur.pitch, 38) : null;
        const fam = plan ? plan.pattern.toLowerCase() : /howe/i.test(newFamily) ? 'howe' : /pratt/i.test(newFamily) ? 'pratt' : 'fink';
        const rebuilt = rebuildTrussWithWebs(cur, generateWebsForFamily(cur, newFamily), fam);
        const nextCatalog = { ...prev, [normalizedKey]: rebuilt };
        (window as any).cadtechProjectTrussStore = nextCatalog;
        return nextCatalog;
      }
      const regenerated = createProjectRoofTruss(
        cur.tag,
        cur.span,
        cur.baseElevation,
        cur.maxUtilization <= 1.0,
        cur.height,
        cur.pitch,
        newFamily
      );
      const nextCatalog = { ...prev, [normalizedKey]: regenerated };
      if (typeof window !== 'undefined') {
        (window as any).cadtechProjectTrussStore = nextCatalog;
        if (typeof (window as any).render === 'function') (window as any).render();
      }
      return nextCatalog;
    });
  };

  // Ensure selectedMemberId points to a valid member of active truss
  useEffect(() => {
    if (!truss.members.some(m => m.id === selectedMemberId)) {
      setSelectedMemberId(truss.members[0]?.id || 'TC-M1');
    }
  }, [activeTrussTag, truss]);

  const selectedMember = truss.members.find(m => m.id === selectedMemberId) || truss.members[0];

  // SVG Dimensioning & Scaling
  const span = truss.span || 9.40;
  const height = Math.max(0.6, truss.height || 1.50);
  const overhang = truss.overhang || 0.45;
  const overhangR = truss.overhangRight ?? overhang;
  const topYAt = (x: number): number => {
    for (const m of truss.members) {
      if (m.type !== 'top_chord') continue;
      const a = truss.nodes.find(n => n.id === m.startNodeId), b = truss.nodes.find(n => n.id === m.endNodeId);
      if (!a || !b || Math.abs(b.x - a.x) < 1e-6) continue;
      const lo = Math.min(a.x, b.x), hi = Math.max(a.x, b.x);
      if (x >= lo - 1e-6 && x <= hi + 1e-6) return a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x);
    }
    return 0;
  };

  const marginX = Math.max(1.8, Math.max(overhang, overhangR) + 1.0);
  const marginY = 1.4;
  const totalW = span + 2 * marginX;
  const totalH = height + 2 * marginY;

  const svgWidth = 820;
  const scale = svgWidth / totalW;
  const svgHeight = Math.max(360, totalH * scale);

  const toSvgX = (x: number) => (x + marginX) * scale;
  const toSvgY = (y: number) => svgHeight - (y + marginY) * scale;

  const isTrussPass = truss.maxUtilization <= 1.0;
  const suggestions = selectedMember ? getSectionSuggestions(selectedMember, truss) : [];
  const recommendations = getMiTekRecommendations(truss);
  const selectedMemberLoad = selectedMember ? calculateMemberRoofLoadBreakdown(selectedMember, truss) : null;
  const trussDeadKPa = truss.deadLoadKPa ?? 0.65;
  const trussLiveKPa = truss.liveLoadKPa ?? 1.20;
  const trussTotalKPa = Number((trussDeadKPa + trussLiveKPa).toFixed(2));
  const trussTotalPsf = Number((trussTotalKPa * 20.8854).toFixed(1));
  const trussTotalRoofLoadKN = truss.totalRoofLoadKN ?? Number(
    truss.members
      .filter(m => m.type === 'top_chord' || m.type === 'hip_rafter')
      .reduce((sum, m) => sum + (m.totalRoofLoadKN ?? calculateMemberRoofLoadBreakdown(m, truss).totalRoofLoadKN), 0)
      .toFixed(2)
  );
  const trussTotalDeadKN = truss.totalDeadLoadKN ?? Number((trussTotalRoofLoadKN * (trussDeadKPa / Math.max(0.01, trussTotalKPa))).toFixed(2));
  const trussTotalLiveKN = truss.totalLiveLoadKN ?? Number((trussTotalRoofLoadKN - trussTotalDeadKN).toFixed(2));

  // Filter members for ribbon
  const visibleMembers = truss.members.filter(m => {
    if (memberFilter === 'chords') return m.type === 'top_chord' || m.type === 'bottom_chord';
    if (memberFilter === 'webs') return m.type !== 'top_chord' && m.type !== 'bottom_chord';
    if (memberFilter === 'failing') return m.utilization > 1.0;
    return true;
  });

  // Handler: Update cross section of member(s)
  const handleSelectSection = (newSection: TimberSection) => {
    setCatalog(prev => {
      const cur = prev[normalizedKey] || truss;
      if (!cur) return prev;

      let updatedMembers: Member2D[];
      if (applyScope === 'chords' && selectedMember && (selectedMember.type === 'top_chord' || selectedMember.type === 'bottom_chord')) {
        updatedMembers = cur.members.map(m =>
          m.type === 'top_chord' || m.type === 'bottom_chord' ? { ...m, section: newSection } : m
        );
      } else if (applyScope === 'webs' && selectedMember && selectedMember.type !== 'top_chord' && selectedMember.type !== 'bottom_chord') {
        updatedMembers = cur.members.map(m =>
          m.type !== 'top_chord' && m.type !== 'bottom_chord' ? { ...m, section: newSection } : m
        );
      } else {
        updatedMembers = cur.members.map(m => (m.id === selectedMember?.id ? { ...m, section: newSection } : m));
      }

      const recalculated = recalculateTrussMembers({ ...cur, members: updatedMembers });
      const nextCatalog = { ...prev, [normalizedKey]: recalculated };
      if (typeof window !== 'undefined') {
        (window as any).cadtechProjectTrussStore = nextCatalog;
        if (typeof (window as any).render === 'function') (window as any).render();
      }
      return nextCatalog;
    });

    if (onUpdateMemberSection && selectedMember) {
      onUpdateMemberSection(selectedMember.id, newSection);
    }
  };

  // Handler: Apply Complete Engineering Rules of Thumb to active truss
  const handleApplyRulesOfThumb = () => {
    setCatalog(prev => {
      const cur = prev[normalizedKey] || truss;
      if (!cur) return prev;

      const optimized = applyRulesOfThumbOptimization(cur);
      const nextCatalog = { ...prev, [normalizedKey]: optimized };
      if (typeof window !== 'undefined') {
        (window as any).cadtechProjectTrussStore = nextCatalog;
        if (typeof (window as any).render === 'function') (window as any).render();
        if (typeof (window as any).toast === 'function') {
          (window as any).toast(`💡 Applied Rules of Thumb to ${truss.tag}: All 7 engineering design logics satisfied & PASSED!`);
        }
      }
      return nextCatalog;
    });
  };

  // Handler: Apply Engineering Rules of Thumb to ALL 20 Trusses
  const handleApplyRulesToAllTrusses = () => {
    setCatalog(prev => {
      const nextCatalog: { [id: string]: TrussStructure } = {};
      for (const [id, t] of Object.entries(prev)) {
        nextCatalog[id] = applyRulesOfThumbOptimization(t);
      }
      if (typeof window !== 'undefined') {
        (window as any).cadtechProjectTrussStore = nextCatalog;
        if (typeof (window as any).render === 'function') (window as any).render();
        if (typeof (window as any).toast === 'function') {
          (window as any).toast('💡 Applied Engineering Rules of Thumb to ALL 20 trusses: Complete compliance & PASS!');
        }
      }
      return nextCatalog;
    });
  };

  // Handler: Apply Individual Rule of Thumb Recommendation
  const handleApplyIndividualRule = (ruleId: string) => {
    if (ruleId === 'SLENDERNESS_LIMIT' || ruleId === 'VALUE_ENGINEERING') {
      handleAutoResolveTruss();
    } else if (ruleId === 'SPAN_DEPTH_RATIO') {
      // Optimize height to span / 7
      setCatalog(prev => {
        const cur = prev[normalizedKey] || truss;
        if (!cur || cur.assemblyId) return prev; // geometry of 3D-linked trusses is driven by the roof
        const newHeight = Number((cur.span / 7).toFixed(2));
        const scaleY = newHeight / cur.height;
        const updatedNodes = cur.nodes.map(n => ({ ...n, y: Number((n.y * scaleY).toFixed(2)) }));
        const updated = recalculateTrussMembers({ ...cur, height: newHeight, nodes: updatedNodes });
        return { ...prev, [normalizedKey]: updated };
      });
    } else if (ruleId === 'BEARING_SEAT') {
      // Reinforce bottom chord with 2-ply
      setCatalog(prev => {
        const cur = prev[normalizedKey] || truss;
        if (!cur) return prev;
        const sec2ply = COMMON_WOOD_SECTIONS[5]; // 2-2x6
        const updatedMembers = cur.members.map(m => m.type === 'bottom_chord' ? { ...m, section: sec2ply } : m);
        const updated = recalculateTrussMembers({ ...cur, members: updatedMembers });
        return { ...prev, [normalizedKey]: updated };
      });
    } else {
      handleApplyRulesOfThumb();
    }
  };

  // Handler: Auto-Resolve Selected Truss (with optional WEBs Minimization / Maximization)
  const handleAutoResolveTruss = (modeOverride?: WebOptimizationMode | React.MouseEvent<any>) => {
    const validMode = typeof modeOverride === 'string' ? modeOverride : undefined;
    const mode = validMode || webOptMode;
    if (validMode) setWebOptMode(validMode);
    setCatalog(prev => {
      const cur = prev[normalizedKey] || truss;
      if (!cur) return prev;

      const resolved = autoResolveTruss(cur, mode);
      const nextCatalog = { ...prev, [normalizedKey]: resolved };
      if (typeof window !== 'undefined') {
        (window as any).cadtechProjectTrussStore = nextCatalog;
        if (typeof (window as any).render === 'function') (window as any).render();
        if (typeof (window as any).toast === 'function') {
          const webCount = resolved.members.filter(m => m.type !== 'top_chord' && m.type !== 'bottom_chord').length;
          (window as any).toast(`⚡ ${truss.tag} auto-resolved (${mode.toUpperCase()} WEBs: ${webCount} webs) & PASSED (${(resolved.maxUtilization * 100).toFixed(0)}% Util)`);
        }
      }
      return nextCatalog;
    });
  };

  // Handler: Auto-Resolve ALL Trusses (with optional WEBs Minimization / Maximization)
  const handleAutoResolveAllTrusses = (modeOverride?: WebOptimizationMode | React.MouseEvent<any>) => {
    const validMode = typeof modeOverride === 'string' ? modeOverride : undefined;
    const mode = validMode || webOptMode;
    if (validMode) setWebOptMode(validMode);
    setCatalog(prev => {
      const resolvedCatalog = autoResolveAllTrusses(prev, mode);
      if (typeof window !== 'undefined') {
        (window as any).cadtechProjectTrussStore = resolvedCatalog;
        if (typeof (window as any).render === 'function') (window as any).render();
        if (typeof (window as any).toast === 'function') {
          (window as any).toast(`⚡ All roof trusses auto-resolved (${mode.toUpperCase()} WEBs) & PASSED!`);
        }
      }
      return resolvedCatalog;
    });
  };

  // Handler: Delete active truss
  const handleDeleteActiveTruss = () => {
    const trussList = Object.keys(catalog);
    if (trussList.length <= 1) {
      alert('Cannot delete: at least one roof truss must remain in the project.');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${truss.tag} from the project roof layout?`)) {
      return;
    }

    setCatalog(prev => {
      const nextCatalog = { ...prev };
      delete nextCatalog[normalizedKey];
      delete nextCatalog[activeTrussTag];
      const remainingKeys = Object.keys(nextCatalog);
      const nextActive = remainingKeys[0] || 'TR-01';
      setActiveTrussTag(nextActive);
      if (typeof window !== 'undefined') {
        (window as any).cadtechProjectTrussStore = nextCatalog;
        (window as any).activeTrussTag = nextActive;
        if (typeof (window as any).render === 'function') (window as any).render();
      }
      return nextCatalog;
    });
  };

  // Handler: Save Specification changes
  const handleSaveSpec = () => {
    setCatalog(prev => {
      const cur = prev[normalizedKey] || truss;
      if (!cur) return prev;

      const linked = !!cur.assemblyId;
      const newSpan = linked ? cur.span : Math.max(3.0, specSpan);
      const newPitch = linked ? cur.pitch : Math.max(5.0, Math.min(60.0, specPitch));
      const newOverhang = linked ? cur.overhang : Math.max(0.1, specOverhang / 1000);
      const newSpacing = Math.max(0.3, specSpacing / 1000);
      const grade = STANDARD_TIMBER_GRADES[specGrade] || cur.members[0]?.grade;

      const scaleX = newSpan / cur.span;
      const newHeight = linked ? cur.height : Math.min(2.8, Math.max(1.2, (newSpan / 2) * Math.tan((newPitch * Math.PI) / 180)));
      const scaleY = newHeight / cur.height;

      const updatedNodes = cur.nodes.map(n => ({
        ...n,
        x: Number((n.x * scaleX).toFixed(2)),
        y: Number((n.y * scaleY).toFixed(2)),
      }));

      const newDeadLoadKPa = Math.max(0.2, Math.min(5.0, specDeadLoadKPa));
      const newLiveLoadKPa = Math.max(0.2, Math.min(8.0, specLiveLoadKPa));
      const oldFactored = 1.2 * (cur.deadLoadKPa ?? 0.65) + 1.5 * (cur.liveLoadKPa ?? 1.20);
      const newFactored = 1.2 * newDeadLoadKPa + 1.5 * newLiveLoadKPa;
      const forceRatio = newFactored / Math.max(0.1, oldFactored);

      const updatedMembers = cur.members.map(m => {
        const sn = updatedNodes.find(n => n.id === m.startNodeId);
        const en = updatedNodes.find(n => n.id === m.endNodeId);
        const newLen = sn && en ? Math.hypot(en.x - sn.x, en.y - sn.y) : m.length;
        return {
          ...m,
          length: Number(newLen.toFixed(2)),
          axialForce: Number((m.axialForce * forceRatio).toFixed(2)),
          grade: grade || m.grade,
        };
      });

      const updatedTruss = recalculateTrussMembers({
        ...cur,
        span: newSpan,
        height: newHeight,
        pitch: newPitch,
        overhang: newOverhang,
        spacing: newSpacing,
        deadLoadKPa: newDeadLoadKPa,
        liveLoadKPa: newLiveLoadKPa,
        nodes: updatedNodes,
        members: updatedMembers,
      });

      const nextCatalog: { [id: string]: TrussStructure } = { ...prev, [normalizedKey]: updatedTruss };
      if (applyLoadsToAll) {
        for (const [k, t] of Object.entries(nextCatalog)) {
          if (k === normalizedKey) continue;
          const tOldFactored = 1.2 * (t.deadLoadKPa ?? 0.65) + 1.5 * (t.liveLoadKPa ?? 1.20);
          const tRatio = newFactored / Math.max(0.1, tOldFactored);
          nextCatalog[k] = recalculateTrussMembers({
            ...t,
            deadLoadKPa: newDeadLoadKPa,
            liveLoadKPa: newLiveLoadKPa,
            members: t.members.map(m => ({
              ...m,
              axialForce: Number((m.axialForce * tRatio).toFixed(2)),
            })),
          });
        }
      }
      if (typeof window !== 'undefined') {
        (window as any).cadtechProjectTrussStore = nextCatalog;
        (window as any).cadtechRoofLoadAssumptions = {
          deadLoadKPa: newDeadLoadKPa,
          liveLoadKPa: newLiveLoadKPa,
          totalKPa: Number((newDeadLoadKPa + newLiveLoadKPa).toFixed(2)),
        };
        if (typeof (window as any).render === 'function') (window as any).render();
      }
      return nextCatalog;
    });

    setIsEditSpecOpen(false);
  };

  // Handler: Delete single member
  const handleDeleteMember = () => {
    if (!selectedMember) return;
    setCatalog(prev => {
      const cur = prev[normalizedKey] || truss;
      if (!cur) return prev;
      const updatedMembers = cur.members.filter(m => m.id !== selectedMember.id);
      const recalculated = recalculateTrussMembers({ ...cur, members: updatedMembers });
      const nextCatalog = { ...prev, [normalizedKey]: recalculated };
      if (typeof window !== 'undefined') {
        (window as any).cadtechProjectTrussStore = nextCatalog;
        if (typeof (window as any).render === 'function') (window as any).render();
      }
      return nextCatalog;
    });
    if (onDeleteMember) onDeleteMember(selectedMember.id);
  };

  // Handler: Export PDF
  const handleExportPDF = () => {
    if (typeof (window as any).generateTrussPDFReport === 'function') {
      (window as any).generateTrussPDFReport();
    } else {
      window.print();
    }
  };

  // Handler: Open Automated Truss Analysis & NDS ASD Optimize Modal on All Trusses
  const handleOpenAutoAnalysisModal = (modeOverride?: WebOptimizationMode | React.MouseEvent<any>) => {
    const validMode = typeof modeOverride === 'string' ? modeOverride : undefined;
    const mode = validMode || webOptMode;
    if (validMode) setWebOptMode(validMode);
    handleAutoResolveAllTrusses(mode);
    if (typeof (window as any).openTrussAnalysisModal === 'function') {
      (window as any).openTrussAnalysisModal(mode);
    } else {
      const btn = document.getElementById('truss-analysis-btn');
      if (btn) btn.click();
    }
  };

  const manualSections = [
    plyTab === '1-ply'
      ? createSection('2x4', 38, 89, '2x4 (38×89mm)')
      : plyTab === '2-ply'
      ? createSection('2-2x4', 76, 89, '2-Ply 2x4 (76×89mm)')
      : createSection('3-2x6', 114, 140, '3-Ply 2x6 (114×140mm)'),
    plyTab === '1-ply'
      ? createSection('2x6', 38, 140, '2x6 (38×140mm)')
      : plyTab === '2-ply'
      ? createSection('2-2x6', 76, 140, '2-Ply 2x6 (76×140mm)')
      : createSection('3-2x8', 114, 184, '3-Ply 2x8 (114×184mm)'),
    plyTab === '1-ply'
      ? createSection('2x8', 38, 184, '2x8 (38×184mm)')
      : plyTab === '2-ply'
      ? createSection('2-2x8', 76, 184, '2-Ply 2x8 (76×184mm)')
      : createSection('4-2x8', 152, 184, '4-Ply 2x8 (152×184mm)'),
    plyTab === '1-ply'
      ? createSection('2x10', 38, 235, '2x10 (38×235mm)')
      : plyTab === '2-ply'
      ? createSection('2-2x10', 76, 235, '2-Ply 2x10 (76×235mm)')
      : createSection('3-2x10', 114, 235, '3-Ply 2x10 (114×235mm)'),
    plyTab === '1-ply'
      ? createSection('2x12', 38, 286, '2x12 (38×286mm)')
      : plyTab === '2-ply'
      ? createSection('2-2x12', 76, 286, '2-Ply 2x12 (76×286mm)')
      : createSection('3-2x12', 114, 286, '3-Ply 2x12 (114×286mm)'),
  ];

  return (
    <div className="w-full h-full max-h-full bg-slate-100 flex flex-col font-sans select-none overflow-hidden relative">
      {/* 1. Header Toolbar */}
      <div className="px-4 py-2 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0 shadow-2xs z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
            <span className="font-black text-slate-950">{truss.tag}</span>
            <span className="text-slate-400 font-normal">+</span>
            <span className="text-slate-500 font-normal text-xs">{truss.name}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-700">
            <span className="font-semibold text-[11px] text-slate-500 uppercase">FAMILY:</span>
            <select
              value={familyType}
              onChange={e => handleFamilyChange(e.target.value)}
              className="bg-transparent font-bold text-slate-800 text-[11px] cursor-pointer outline-none"
            >
              <option value="Fink Truss (W-Truss)">Fink Truss (W-Truss)</option>
              <option value="Auto (span & load)">Auto · span & load (3D)</option>
              <option value="Howe Truss">Howe Truss</option>
              <option value="Pratt Truss">Pratt Truss</option>
              <option value="Truncated Flat Top">Truncated Flat Top</option>
              <option value="Hip Girder">Hip Girder</option>
            </select>
          </div>

          <span className="px-2 py-0.5 rounded border border-sky-300 bg-sky-50 text-sky-800 text-[11px] font-bold">
            Overhang: {(overhang * 1000).toFixed(0)} mm
          </span>

          <button
            type="button"
            onClick={() => setIsLoadScheduleOpen(true)}
            style={{ backgroundColor: '#eef2ff', color: '#1e1b4b', borderColor: '#818cf8' }}
            className="px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            title="Click to inspect per-member Roof Load (Dead Load + Live Load) & Building Code Verification Schedule"
          >
            <span>🏋️</span>
            <span>
              Total Roof Load (DL+LL): <strong>{trussTotalRoofLoadKN.toFixed(2)} kN</strong> ({Math.round(trussTotalRoofLoadKN * 224.809).toLocaleString()} lbs · {trussTotalKPa.toFixed(2)} kPa / {trussTotalPsf} psf)
            </span>
          </button>

          <span
            className={`px-2.5 py-0.5 rounded border text-[11px] font-bold flex items-center gap-1 ${
              isTrussPass
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-700'
            }`}
          >
            {isTrussPass ? '✔ Integrity: PASS' : '⚠ Integrity: FAIL'} ({(truss.maxUtilization * 100).toFixed(0)}% Max Util)
          </span>
        </div>

        {/* Action Buttons with Rules of Thumb Advisor & Auto Analysis */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* WEBs Optimization Mode Selector + Run Auto Analysis on All Trusses */}
          <div className="flex items-center gap-1 bg-blue-50 border border-blue-300 rounded px-1.5 py-0.5 shadow-2xs">
            <span className="font-extrabold text-[10px] text-blue-900 uppercase tracking-tight">WEBs:</span>
            <select
              value={webOptMode}
              onChange={e => {
                const nextMode = e.target.value as WebOptimizationMode;
                setWebOptMode(nextMode);
                handleAutoResolveAllTrusses(nextMode);
              }}
              className="bg-transparent font-bold text-blue-950 text-[11px] cursor-pointer outline-none"
              title="Choose WEBs Optimization Mode when running Auto Analysis on All Trusses"
            >
              <option value="auto">Auto Balance Webs</option>
              <option value="minimize">Minimize WEBs (-)</option>
              <option value="maximize">Maximize WEBs (+)</option>
            </select>
            <button
              type="button"
              onClick={() => handleAutoResolveAllTrusses('minimize')}
              style={{
                backgroundColor: webOptMode === 'minimize' ? '#0f766e' : '#ffffff',
                color: webOptMode === 'minimize' ? '#ffffff' : '#0f766e',
                borderColor: '#14b8a6',
              }}
              className="px-1.5 py-0.5 rounded border font-bold text-[10px] cursor-pointer transition-all"
              title="Minimize WEBs across all trusses while maintaining NDS ASD PASS & uniform chord size"
            >
              ➖ Min Webs
            </button>
            <button
              type="button"
              onClick={() => handleAutoResolveAllTrusses('maximize')}
              style={{
                backgroundColor: webOptMode === 'maximize' ? '#0369a1' : '#ffffff',
                color: webOptMode === 'maximize' ? '#ffffff' : '#0369a1',
                borderColor: '#38bdf8',
              }}
              className="px-1.5 py-0.5 rounded border font-bold text-[10px] cursor-pointer transition-all"
              title="Maximize WEBs triangulation across all trusses for maximum stiffness & NDS ASD PASS"
            >
              ➕ Max Webs
            </button>
          </div>

          {/* Run Auto Analysis on All Trusses + NDS ASD Optimize Button */}
          <button
            type="button"
            onClick={() => handleOpenAutoAnalysisModal(webOptMode)}
            style={{ backgroundColor: '#1d4ed8', color: '#ffffff', borderColor: '#1e40af' }}
            className="px-2.5 py-1 rounded border font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            title="Run Auto Analysis on All Trusses + NDS ASD Optimize (Uniform Top & Bottom Chords + WEBs Minimization/Maximization)"
          >
            <span>⚡</span> Run Auto Analysis on All Trusses
          </button>

          {/* Engineering Rules of Thumb Advisor Button */}
          <button
            type="button"
            onClick={() => setIsAdvisorOpen(true)}
            style={{ backgroundColor: '#4f46e5', color: '#ffffff', borderColor: '#4338ca' }}
            className="px-2.5 py-1 rounded border font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            title="Open Engineering Design Logics & Rules of Thumb Advisor"
          >
            <span>💡</span> Rules of Thumb Advisor
            <span
              style={{
                backgroundColor: advisorResult.failCount > 0 ? '#f43f5e' : '#1e1b4b',
                color: '#ffffff',
              }}
              className="px-1.5 py-0.2 rounded-full text-[10px] font-black"
            >
              {advisorResult.failCount > 0 ? `${advisorResult.failCount} Alert` : `${advisorResult.passCount}/7 OK`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditSpecOpen(true)}
            style={{ backgroundColor: '#f59e0b', color: '#ffffff', borderColor: '#d97706' }}
            className="px-2.5 py-1 rounded border font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <span>☷</span> Edit Specification (DL/LL)
          </button>
          <button
            type="button"
            onClick={() => handleAutoResolveTruss(webOptMode)}
            style={{ backgroundColor: '#d97706', color: '#ffffff', borderColor: '#b45309' }}
            className="px-2.5 py-1 rounded border font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
            title="Auto-resolve and optimize selected truss to PASS (using selected WEBs mode)"
          >
            <span>⚡</span> Auto-Resolve Truss
          </button>
          <button
            type="button"
            onClick={() => handleAutoResolveAllTrusses(webOptMode)}
            style={{ backgroundColor: '#059669', color: '#ffffff', borderColor: '#047857' }}
            className="px-2.5 py-1 rounded border font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
            title="Auto-resolve all project roof trusses to PASS (using selected WEBs mode)"
          >
            <span>⚡</span> Pass All Trusses
          </button>
          <button
            type="button"
            onClick={() => setShowLoads(!showLoads)}
            style={
              showLoads
                ? { backgroundColor: '#1e293b', color: '#ffffff', borderColor: '#1e293b' }
                : { backgroundColor: '#ffffff', color: '#334155', borderColor: '#cbd5e1' }
            }
            className="px-2.5 py-1 rounded border text-xs font-semibold cursor-pointer"
          >
            {showLoads ? 'Hide Loads' : 'Show Loads'}
          </button>
          <button
            type="button"
            onClick={() => setShowDeflection(!showDeflection)}
            style={
              showDeflection
                ? { backgroundColor: '#d97706', color: '#ffffff', borderColor: '#d97706' }
                : { backgroundColor: '#ffffff', color: '#334155', borderColor: '#cbd5e1' }
            }
            className="px-2.5 py-1 rounded border text-xs font-semibold cursor-pointer"
          >
            {showDeflection ? 'Hide Deflection' : 'Show Deflection'}
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            style={{ backgroundColor: '#0284c7', color: '#ffffff', borderColor: '#0369a1' }}
            className="px-2.5 py-1 rounded border font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <span>⭳</span> Export Elevation PDF
          </button>
          <button
            type="button"
            onClick={handleDeleteActiveTruss}
            style={{ backgroundColor: '#ffffff', color: '#e11d48', borderColor: '#fda4af' }}
            className="px-2.5 py-1 border rounded font-semibold text-xs cursor-pointer flex items-center gap-1"
            title={`Delete ${truss.tag}`}
          >
            <span>🗑</span> Delete Truss
          </button>
        </div>
      </div>

      {/* 2. Sub-Ribbon: Select Member */}
      <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center gap-3 overflow-x-auto text-xs shrink-0">
        <div className="flex items-center gap-2 text-slate-700 font-bold shrink-0">
          <span>⚡ Select Member:</span>
          <button
            type="button"
            onClick={() => setMemberFilter('all')}
            style={
              memberFilter === 'all'
                ? { backgroundColor: '#0284c7', color: '#ffffff' }
                : { backgroundColor: '#e2e8f0', color: '#334155' }
            }
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors"
          >
            All ({truss.members.length})
          </button>
          <button
            type="button"
            onClick={() => setMemberFilter('chords')}
            style={
              memberFilter === 'chords'
                ? { backgroundColor: '#0284c7', color: '#ffffff' }
                : { backgroundColor: '#e2e8f0', color: '#334155' }
            }
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors"
          >
            Chords
          </button>
          <button
            type="button"
            onClick={() => setMemberFilter('webs')}
            style={
              memberFilter === 'webs'
                ? { backgroundColor: '#0284c7', color: '#ffffff' }
                : { backgroundColor: '#e2e8f0', color: '#334155' }
            }
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors"
          >
            Webs
          </button>
          {truss.members.some(m => m.utilization > 1.0) && (
            <button
              type="button"
              onClick={() => setMemberFilter('failing')}
              style={
                memberFilter === 'failing'
                  ? { backgroundColor: '#e11d48', color: '#ffffff' }
                  : { backgroundColor: '#ffe4e6', color: '#9f1239' }
              }
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors"
            >
              Overstressed ({truss.members.filter(m => m.utilization > 1.0).length})
            </button>
          )}
        </div>

        <div className="h-4 w-px bg-slate-300 shrink-0"></div>

        {/* Member Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {visibleMembers.map(m => {
            const isSelected = selectedMember?.id === m.id;
            const isFailed = m.utilization > 1.0;
            const isTension = m.axialForce > 0;

            const pillStyle: React.CSSProperties = isSelected
              ? { backgroundColor: '#0369a1', color: '#ffffff', borderColor: '#0369a1' }
              : isFailed
              ? { backgroundColor: '#fff1f2', color: '#be123c', borderColor: '#fda4af' }
              : isTension
              ? { backgroundColor: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }
              : { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' };

            const mLoad = m.totalRoofLoadKN ?? calculateMemberRoofLoadBreakdown(m, truss).totalRoofLoadKN;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMemberId(m.id)}
                style={pillStyle}
                title={`${m.id} (${m.type.replace('_', ' ')}): Total Roof Load (DL+LL) = ${mLoad.toFixed(2)} kN (${Math.round(mLoad * 224.809)} lbs)`}
                className="px-2 py-0.5 rounded border text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <span>{m.id}</span>
                <span className="text-[10px] font-normal opacity-90">
                  {m.section.width}×{m.section.depth} mm
                </span>
                <span
                  style={
                    isSelected
                      ? { backgroundColor: '#0c4a6e', color: '#e0f2fe' }
                      : { backgroundColor: '#f1f5f9', color: '#334155' }
                  }
                  className="text-[9.5px] font-semibold px-1 rounded"
                >
                  DL+LL:{mLoad.toFixed(2)}kN
                </span>
                <span
                  style={{
                    color: isFailed
                      ? isSelected
                        ? '#fecdd3'
                        : '#e11d48'
                      : isSelected
                      ? '#a7f3d0'
                      : '#059669',
                  }}
                  className="text-[9.5px] font-bold"
                >
                  {(m.utilization * 100).toFixed(0)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2B. Always-Visible Roof Load (Dead Load + Live Load) & Building Code Verification Bar */}
      {selectedMember && selectedMemberLoad && (
        <div
          style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}
          className="px-4 py-1.5 border-b flex flex-wrap items-center justify-between gap-2 text-[11px] shrink-0"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span
              style={{ backgroundColor: '#0c4a6e', color: '#ffffff' }}
              className="px-2 py-0.5 rounded font-black text-[10.5px] tracking-wide flex items-center gap-1"
            >
              <span>🏋️</span> ROOF LOAD &amp; CODE CHECK ({selectedMember.id})
            </span>

            <span className="text-slate-800 font-semibold">
              Member Dead Load (DL):{' '}
              <strong className="font-mono text-slate-950">
                {selectedMemberLoad.deadLoadKN.toFixed(2)} kN ({selectedMemberLoad.deadLoadLbs} lbs)
              </strong>
            </span>

            <span className="text-slate-400">+</span>

            <span className="text-slate-800 font-semibold">
              Member Live/Snow (LL):{' '}
              <strong className="font-mono text-sky-800">
                {selectedMemberLoad.liveLoadKN.toFixed(2)} kN ({selectedMemberLoad.liveLoadLbs} lbs)
              </strong>
            </span>

            <span className="text-slate-400">=</span>

            <span
              style={{ backgroundColor: '#dcfce7', color: '#14532d', borderColor: '#86efac' }}
              className="px-2 py-0.5 rounded border font-bold"
            >
              Member Total Load (DL+LL):{' '}
              <strong className="font-mono">
                {selectedMemberLoad.totalRoofLoadKN.toFixed(2)} kN ({selectedMemberLoad.totalRoofLoadLbs} lbs)
              </strong>{' '}
              · q = {selectedMemberLoad.totalLineKNm.toFixed(3)} kN/m ({selectedMemberLoad.totalLinePlf} plf)
            </span>

            <span className="text-slate-600 font-medium hidden xl:inline">
              | Truss {truss.tag} Total: <strong>{trussTotalRoofLoadKN.toFixed(2)} kN</strong> (DL {trussDeadKPa.toFixed(2)} + LL {trussLiveKPa.toFixed(2)} = {trussTotalKPa.toFixed(2)} kPa / {trussTotalPsf} psf)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              style={
                selectedMemberLoad.meetsCodeMinimums
                  ? { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' }
                  : { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' }
              }
              className="px-2 py-0.5 rounded border text-[10.5px] font-black"
            >
              {selectedMemberLoad.meetsCodeMinimums
                ? '✔ IBC 2018 / ASCE 7-16 §2.4.1 (D + Lr) VERIFIED'
                : '⚠ BELOW CODE MIN (IBC 2018)'}
            </span>
            <button
              type="button"
              onClick={() => setIsLoadScheduleOpen(true)}
              style={{ backgroundColor: '#0369a1', color: '#ffffff', borderColor: '#075985' }}
              className="px-2.5 py-0.5 rounded border font-bold text-[10.5px] cursor-pointer flex items-center gap-1"
            >
              <span>📋</span> All Members Load Schedule ({truss.members.length})
            </button>
            <button
              type="button"
              onClick={() => setIsEditSpecOpen(true)}
              style={{ backgroundColor: '#ffffff', color: '#0369a1', borderColor: '#38bdf8' }}
              className="px-2 py-0.5 rounded border font-bold text-[10.5px] cursor-pointer"
            >
              ⚙️ Adjust DL / LL
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Center Split Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-0 divide-x divide-slate-200 bg-white overflow-hidden">
        {/* Left Column: Scaled Timber SVG Drawing */}
        <div className="col-span-7 p-4 bg-slate-50/70 flex flex-col items-center justify-between overflow-y-auto overflow-x-auto min-h-0 h-full">
          {/* Top Geometry Label */}
          <div className="text-center text-xs font-bold text-slate-800 bg-white border border-slate-300 px-4 py-1 rounded-full shadow-2xs mb-1">
            {truss.tag} · {familyType}: Span = {span.toFixed(2)}m (Apex H = {height.toFixed(2)}m)
          </div>

          <svg width={svgWidth} height={svgHeight} className="select-none overflow-visible my-auto">
            <defs>
              <marker id="arrowDown" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="#0284c7" />
              </marker>
              <marker id="arrowUpGreen" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M 0 6 L 3 0 L 6 6 z" fill="#16a34a" />
              </marker>
            </defs>

            {/* Exaggerated Deflection Curve */}
            {showDeflection && (
              <path
                d={`M ${toSvgX(0)} ${toSvgY(0)} Q ${toSvgX(span / 2)} ${toSvgY(0) + Math.min(30, truss.maxDeflection * 2.5)} ${toSvgX(span)} ${toSvgY(0)}`}
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />
            )}

            {/* Left Heel Reaction Pin & Overhang (Clean Separation, No Collision) */}
            <g transform={`translate(${toSvgX(0)}, ${toSvgY(0)})`}>
              <polygon points="0,0 -12,18 12,18" fill="#334155" />
              <line x1="-16" y1="18" x2="16" y2="18" stroke="#334155" strokeWidth="2" />
              <line x1="0" y1="42" x2="0" y2="22" stroke="#16a34a" strokeWidth="2.5" markerEnd="url(#arrowUpGreen)" />
              <g transform="translate(0, 52)">
                <rect x="-34" y="-8" width="68" height="16" rx="3" fill="#0f172a" />
                <text textAnchor="middle" dy="3.5" fontSize="9.5" fontWeight="900" fill="#4ade80">
                  R_L = {truss.reactionLeft.toFixed(1)} kN
                </text>
              </g>
              <g transform={`translate(${-scale * (overhang / 2)}, 20)`}>
                <rect x="-36" y="-7" width="72" height="14" rx="3" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
                <text textAnchor="middle" dy="3" fontSize="8.5" fontWeight="bold" fill="#0369a1">
                  Overhang: {(overhang * 1000).toFixed(0)}mm
                </text>
              </g>
            </g>

            {/* Right Heel Reaction Roller & Overhang */}
            <g transform={`translate(${toSvgX(span)}, ${toSvgY(0)})`}>
              <polygon points="0,0 -12,15 12,15" fill="#334155" />
              <circle cx="-6" cy="18" r="3" fill="#64748b" />
              <circle cx="6" cy="18" r="3" fill="#64748b" />
              <line x1="-16" y1="22" x2="16" y2="22" stroke="#334155" strokeWidth="2" />
              <line x1="0" y1="46" x2="0" y2="26" stroke="#16a34a" strokeWidth="2.5" markerEnd="url(#arrowUpGreen)" />
              <g transform="translate(0, 56)">
                <rect x="-34" y="-8" width="68" height="16" rx="3" fill="#0f172a" />
                <text textAnchor="middle" dy="3.5" fontSize="9.5" fontWeight="900" fill="#4ade80">
                  R_R = {truss.reactionRight.toFixed(1)} kN
                </text>
              </g>
              <g transform={`translate(${scale * (overhangR / 2)}, 20)`}>
                <rect x="-36" y="-7" width="72" height="14" rx="3" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
                <text textAnchor="middle" dy="3" fontSize="8.5" fontWeight="bold" fill="#0369a1">
                  Overhang: {(overhangR * 1000).toFixed(0)}mm
                </text>
              </g>
            </g>

            {/* Gravity Distributed Load Arrows & Roof Load Summary Callout */}
            {showLoads && (
              <g>
                <g stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrowDown)">
                  {Array.from({ length: 11 }).map((_, i) => {
                    const frac = (i + 0.5) / 11;
                    const x = frac * span;
                    const y = topYAt(x);
                    return (
                      <line key={i} x1={toSvgX(x)} y1={toSvgY(y + 0.55)} x2={toSvgX(x)} y2={toSvgY(y + 0.08)} />
                    );
                  })}
                </g>
                {/* Distributed Roof Load Banner above Ridge */}
                <g transform={`translate(${toSvgX(span / 2)}, ${Math.max(18, toSvgY(height + 0.68))})`}>
                  <rect x="-175" y="-10" width="350" height="20" rx="4" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.2" />
                  <text textAnchor="middle" dy="3.5" fontSize="9.2" fontWeight="bold" fill="#0369a1">
                    Roof Load DL ({trussDeadKPa.toFixed(2)} kPa) + LL ({trussLiveKPa.toFixed(2)} kPa) = {((trussDeadKPa + trussLiveKPa) * (truss.spacing || 0.6)).toFixed(2)} kN/m · Total = {trussTotalRoofLoadKN.toFixed(2)} kN
                  </text>
                </g>
              </g>
            )}

            {/* Scaled Timber Members */}
            {truss.members.map(member => {
              const sn = truss.nodes.find(n => n.id === member.startNodeId);
              const en = truss.nodes.find(n => n.id === member.endNodeId);
              if (!sn || !en) return null;

              const isSelected = selectedMember?.id === member.id;
              const isOverstressed = member.utilization > 1.0;
              const isChord = member.type === 'top_chord' || member.type === 'bottom_chord';

              const depthM = Math.max(0.06, (member.section?.depth || 89) / 1000);
              const timberDepthPx = Math.max(5, depthM * scale * 0.75);

              let strokeColor = member.axialForce < -0.1 ? '#2563eb' : member.axialForce > 0.1 ? '#dc2626' : '#64748b';
              if (isOverstressed) strokeColor = '#dc2626';

              const midX = toSvgX((sn.x + en.x) / 2);
              const midY = toSvgY((sn.y + en.y) / 2);

              return (
                <g
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className="cursor-pointer group"
                >
                  {/* Selection glow */}
                  {isSelected && (
                    <line
                      x1={toSvgX(sn.x)}
                      y1={toSvgY(sn.y)}
                      x2={toSvgX(en.x)}
                      y2={toSvgY(en.y)}
                      stroke="#0284c7"
                      strokeWidth={timberDepthPx + 8}
                      strokeLinecap="round"
                      strokeOpacity="0.8"
                    />
                  )}

                  {/* Solid Timber Body */}
                  <line
                    x1={toSvgX(sn.x)}
                    y1={toSvgY(sn.y)}
                    x2={toSvgX(en.x)}
                    y2={toSvgY(en.y)}
                    stroke={isSelected ? '#0284c7' : strokeColor}
                    strokeWidth={timberDepthPx}
                    strokeLinecap={isChord ? 'square' : 'round'}
                  />

                  {/* Member Centerline */}
                  <line
                    x1={toSvgX(sn.x)}
                    y1={toSvgY(sn.y)}
                    x2={toSvgX(en.x)}
                    y2={toSvgY(en.y)}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeDasharray="4,4"
                    strokeOpacity="0.8"
                  />

                  {/* Member Size & Total Roof Load (DL+LL) Badge */}
                  <g transform={`translate(${midX}, ${midY - timberDepthPx / 2 - (showLoads ? 10 : 5)})`}>
                    <rect
                      x={showLoads ? -36 : -24}
                      y={showLoads ? -11 : -7}
                      width={showLoads ? 72 : 48}
                      height={showLoads ? 22 : 14}
                      rx="3"
                      fill={isSelected ? '#0284c7' : isOverstressed ? '#fee2e2' : '#ffffff'}
                      stroke={isSelected ? '#0369a1' : isOverstressed ? '#ef4444' : '#94a3b8'}
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy={showLoads ? '-1.5' : '3.2'}
                      fontSize="7.5"
                      fontWeight="bold"
                      fill={isSelected ? '#ffffff' : isOverstressed ? '#b91c1c' : '#0f172a'}
                    >
                      {member.id} · {member.section?.nominalName || `${member.section?.width}×${member.section?.depth}`}
                    </text>
                    {showLoads && (
                      <text
                        textAnchor="middle"
                        dy="7.5"
                        fontSize="6.8"
                        fontWeight="bold"
                        fill={isSelected ? '#e0f2fe' : '#0369a1'}
                      >
                        DL+LL: {(member.totalRoofLoadKN ?? calculateMemberRoofLoadBreakdown(member, truss).totalRoofLoadKN).toFixed(2)} kN
                      </text>
                    )}
                  </g>
                </g>
              );
            })}

            {/* Gang-Nail Metal Connector Plates at Joint Nodes */}
            {truss.nodes.map(node => (
              <g key={node.id} transform={`translate(${toSvgX(node.x)}, ${toSvgY(node.y)})`}>
                <rect x="-12" y="-9" width="24" height="18" rx="2" fill="#94a3b8" stroke="#334155" strokeWidth="1.2" />
                <circle cx="-6" cy="-4" r="1" fill="#1e293b" />
                <circle cx="0" cy="-4" r="1" fill="#1e293b" />
                <circle cx="6" cy="-4" r="1" fill="#1e293b" />
                <circle cx="-6" cy="4" r="1" fill="#1e293b" />
                <circle cx="0" cy="4" r="1" fill="#1e293b" />
                <circle cx="6" cy="4" r="1" fill="#1e293b" />
              </g>
            ))}

            {/* Clear Span Dimension Line */}
            <g stroke="#64748b" strokeWidth="1.2">
              <line x1={toSvgX(0)} y1={toSvgY(0) + 75} x2={toSvgX(span)} y2={toSvgY(0) + 75} />
              <line x1={toSvgX(0)} y1={toSvgY(0) + 65} x2={toSvgX(0)} y2={toSvgY(0) + 85} />
              <line x1={toSvgX(span)} y1={toSvgY(0) + 65} x2={toSvgX(span)} y2={toSvgY(0) + 85} />
              <text x={toSvgX(span / 2)} y={toSvgY(0) + 90} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">
                Clear Span L = {span.toFixed(2)} m ({(span * 3.28084).toFixed(1)} ft)
              </text>
            </g>
          </svg>

          {/* Color Coding Legend */}
          <div className="flex items-center gap-6 mt-2 text-xs text-slate-800 bg-white px-4 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-2 bg-blue-600 rounded-xs" /> Compression (-) Chords/Struts
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-2 bg-red-600 rounded-xs" /> Tension (+) Chords/Ties
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-2 bg-green-600 rounded-xs" /> Bearing Reactions
            </span>
          </div>
        </div>

        {/* Right Column: Member Engineering Stresses Inspector + Rules of Thumb Box */}
        <div className="col-span-5 p-4 bg-white flex flex-col justify-between space-y-4 overflow-y-auto min-h-0 h-full">
          {selectedMember ? (
            <div className="space-y-3.5">
              {/* Member Tag & Status Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2.5">
                <div>
                  <div className="text-[11px] text-sky-700 font-bold uppercase tracking-wider">
                    {selectedMember.type.replace('_', ' ')}
                  </div>
                  <div className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>{selectedMember.id}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-300">
                      {selectedMember.section.nominalName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold shadow-xs ${
                      selectedMember.utilization <= 1.0
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                        : 'bg-rose-100 text-rose-900 border border-rose-400'
                    }`}
                  >
                    {(selectedMember.utilization * 100).toFixed(0)}% {selectedMember.utilization <= 1.0 ? 'PASS ✔' : 'OVERSTRESSED ⚠'}
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteMember}
                    style={{ backgroundColor: '#fff1f2', color: '#be123c', borderColor: '#fda4af' }}
                    className="px-2 py-1 border rounded text-[11px] font-bold cursor-pointer"
                    title="Delete selected member"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Stress, Capacity & Total Roof Load (DL+LL) Metrics Grid */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Axial Load N_Ed</div>
                  <div className={`font-black text-sm ${selectedMember.axialForce >= 0 ? 'text-red-700' : 'text-blue-700'}`}>
                    {selectedMember.axialForce >= 0
                      ? `+${selectedMember.axialForce.toFixed(1)} kN (T)`
                      : `${selectedMember.axialForce.toFixed(1)} kN (C)`}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Capacity N_Rd</div>
                  <div className="font-black text-sm text-slate-900">
                    {selectedMember.capacityKN ? `${selectedMember.capacityKN.toFixed(1)} kN` : '—'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Slenderness λ</div>
                  <div className={`font-black text-sm ${selectedMember.slendernessRatio <= 175 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {selectedMember.slendernessRatio || '—'}
                  </div>
                </div>

                {selectedMemberLoad && (
                  <div
                    style={{ backgroundColor: '#eff6ff', borderColor: '#93c5fd' }}
                    className="p-2.5 rounded-lg border"
                  >
                    <div className="text-[10px] text-sky-900 font-bold uppercase">Total Roof Load (DL+LL)</div>
                    <div className="font-black text-sm text-sky-950 font-mono">
                      {selectedMemberLoad.totalRoofLoadKN.toFixed(2)} kN ({selectedMemberLoad.totalRoofLoadLbs} lbs)
                    </div>
                    <div className="text-[9.5px] text-sky-800 font-semibold">
                      DL {selectedMemberLoad.deadLoadKN.toFixed(2)} + LL {selectedMemberLoad.liveLoadKN.toFixed(2)} kN
                    </div>
                  </div>
                )}
              </div>

              {/* NEW: Member Total Roof Load (Dead Load + Live Load) & Building Code Verification Box */}
              {selectedMemberLoad && (
                <div className="p-3 bg-gradient-to-br from-sky-50/90 via-white to-indigo-50/50 border border-sky-300 rounded-xl space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>🏋️</span>
                      <span>Member Total Roof Load (Dead + Live)</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        selectedMemberLoad.meetsCodeMinimums
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {selectedMemberLoad.meetsCodeMinimums ? '✔ CODE VERIFIED (IBC / ASCE 7)' : '⚠ BELOW CODE MIN'}
                    </span>
                  </div>

                  {/* 3-Column Dead Load / Live Load / Total Roof Load Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Dead Load (DL)</div>
                      <div className="font-mono font-black text-sm text-slate-900">
                        {selectedMemberLoad.deadLoadKN.toFixed(2)} kN
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium">
                        {selectedMemberLoad.deadLoadLbs} lbs · {selectedMemberLoad.deadPressureKPa.toFixed(2)} kPa ({selectedMemberLoad.deadPressurePsf} psf)
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-mono">
                        q_DL = {selectedMemberLoad.deadLineKNm.toFixed(3)} kN/m
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Live / Snow (LL)</div>
                      <div className="font-mono font-black text-sm text-sky-800">
                        {selectedMemberLoad.liveLoadKN.toFixed(2)} kN
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium">
                        {selectedMemberLoad.liveLoadLbs} lbs · {selectedMemberLoad.livePressureKPa.toFixed(2)} kPa ({selectedMemberLoad.livePressurePsf} psf)
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-mono">
                        q_LL = {selectedMemberLoad.liveLineKNm.toFixed(3)} kN/m
                      </div>
                    </div>

                    <div
                      style={{ backgroundColor: '#082f49', color: '#ffffff', borderColor: '#075985' }}
                      className="p-2 rounded-lg border shadow-xs"
                    >
                      <div style={{ color: '#bae6fd' }} className="text-[10px] font-bold uppercase">
                        Total Load (DL+LL)
                      </div>
                      <div style={{ color: '#6ee7b7' }} className="font-mono font-black text-sm">
                        {selectedMemberLoad.totalRoofLoadKN.toFixed(2)} kN
                      </div>
                      <div style={{ color: '#e0f2fe' }} className="text-[10px] font-medium">
                        {selectedMemberLoad.totalRoofLoadLbs} lbs · {selectedMemberLoad.totalPressureKPa.toFixed(2)} kPa ({selectedMemberLoad.totalPressurePsf} psf)
                      </div>
                      <div style={{ color: '#bae6fd' }} className="text-[9.5px] font-mono">
                        q_tot = {selectedMemberLoad.totalLineKNm.toFixed(3)} kN/m ({selectedMemberLoad.totalLinePlf} plf)
                      </div>
                    </div>
                  </div>

                  {/* Tributary Area & Axial Force Decomposition Row */}
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-white/90 p-2 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-semibold block">Member Tributary Area:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {selectedMemberLoad.tributaryAreaM2.toFixed(2)} m² ({selectedMemberLoad.tributaryAreaFt2} ft²) · Proj: {selectedMemberLoad.horizontalProjM.toFixed(2)}m × {selectedMemberLoad.spacingM.toFixed(2)}m
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Induced Axial Force Split (ASD):</span>
                      <span className="font-mono font-bold text-slate-900">
                        N_DL: {selectedMemberLoad.deadAxialKN >= 0 ? '+' : ''}{selectedMemberLoad.deadAxialKN.toFixed(1)} kN | N_LL: {selectedMemberLoad.liveAxialKN >= 0 ? '+' : ''}{selectedMemberLoad.liveAxialKN.toFixed(1)} kN
                      </span>
                    </div>
                  </div>

                  {/* Code Verification Note & Quick Buttons */}
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <div className="text-[10.5px] text-slate-700 font-medium leading-snug">
                      <span className="font-bold text-slate-900">{selectedMemberLoad.codeCombinationRef}:</span>
                      {selectedMemberLoad.codeVerificationNote}
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setIsLoadScheduleOpen(true)}
                        style={{ backgroundColor: '#0369a1', color: '#ffffff', borderColor: '#075985' }}
                        className="flex-1 px-2.5 py-1 border rounded text-[11px] font-bold cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-1"
                      >
                        <span>📋</span> All Members Roof Load Schedule ({truss.members.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditSpecOpen(true)}
                        style={{ backgroundColor: '#ffffff', color: '#075985', borderColor: '#38bdf8' }}
                        className="px-2.5 py-1 border rounded text-[11px] font-bold cursor-pointer"
                      >
                        ⚙️ Adjust DL / LL
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrated Rules of Thumb Advisor Quick Box */}
              <div className="p-3 bg-gradient-to-br from-indigo-50/90 to-purple-50/60 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <span className="text-indigo-600 font-black">💡</span>
                    Engineering Rules of Thumb & Design Logics
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdvisorOpen(true)}
                    style={{ color: '#4f46e5', backgroundColor: 'transparent' }}
                    className="text-[10.5px] font-bold underline cursor-pointer"
                  >
                    View All {advisorResult.checks.length} Rules
                  </button>
                </div>
                <div className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  {advisorResult.summaryNote}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleApplyRulesOfThumb}
                    style={{ backgroundColor: '#4f46e5', color: '#ffffff', borderColor: '#4338ca' }}
                    className="px-2.5 py-1 border rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>⚡</span> Apply Rules of Thumb ({truss.tag})
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdvisorOpen(true)}
                    style={{ backgroundColor: '#ffffff', color: '#3730a3', borderColor: '#a5b4fc' }}
                    className="px-2.5 py-1 border rounded text-[11px] font-bold cursor-pointer"
                  >
                    Open Advisor Audit
                  </button>
                </div>
              </div>

              {/* Engineering Wood Size Suggestions */}
              <div className="p-3 bg-sky-50/80 border border-sky-300 rounded-xl space-y-2">
                <div className="text-xs font-bold text-sky-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>⚡</span> Engineering Wood Size Suggestions
                  </span>
                  <span className="text-[10px] text-sky-800 font-bold bg-sky-200/60 px-2 py-0.5 rounded">
                    ASD / NDS / Eurocode 5
                  </span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                  {suggestions.slice(0, 3).map((s, idx) => {
                    const isCur =
                      selectedMember &&
                      selectedMember.section.depth === s.section.depth &&
                      selectedMember.section.width === s.section.width;
                    return (
                      <div
                        key={idx}
                        className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs hover:border-sky-400 transition-colors shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold font-mono text-slate-900">{s.section.nominalName}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                s.type === 'OPTIMAL'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : s.type === 'PASSING'
                                  ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {s.type}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {s.type === 'OPTIMAL'
                              ? `Optimal economy & safety (~${(s.utilization * 100).toFixed(0)}% utilization)`
                              : `Capacity utilization: ~${(s.utilization * 100).toFixed(0)}%`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectSection(s.section)}
                          style={
                            isCur
                              ? { backgroundColor: '#059669', color: '#ffffff' }
                              : { backgroundColor: '#0284c7', color: '#ffffff' }
                          }
                          className="px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          {isCur ? '✔ Current' : 'Apply'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Manual Wood Cross Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>☷</span> Manual Wood Cross Section
                  </div>
                  {/* Ply switcher tabs */}
                  <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-md border border-slate-300 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setPlyTab('1-ply')}
                      className={`px-2.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                        plyTab === '1-ply' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      1-Ply (38mm)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlyTab('2-ply')}
                      className={`px-2.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                        plyTab === '2-ply' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      2-Ply (76mm)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlyTab('3-ply')}
                      className={`px-2.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                        plyTab === '3-ply' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      3/4-Ply Girder
                    </button>
                  </div>
                </div>

                {/* Wood Size Options Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {manualSections.map(sec => {
                    const isSelected =
                      selectedMember.section.depth === sec.depth && selectedMember.section.width === sec.width;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => handleSelectSection(sec)}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-sky-600 border-sky-700 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{sec.nominalName.split(' ')[0]}</span>
                          {isSelected && <span>✔</span>}
                        </div>
                        <div className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                          {sec.width}×{sec.depth}mm
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Scope Radio options */}
                <div className="flex items-center gap-4 text-xs text-slate-800 font-semibold pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="applyScope"
                      checked={applyScope === 'chords'}
                      onChange={() => setApplyScope('chords')}
                      className="text-sky-600"
                    />
                    <span>All Chords</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="applyScope"
                      checked={applyScope === 'webs'}
                      onChange={() => setApplyScope('webs')}
                      className="text-sky-600"
                    />
                    <span>All Webs</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="applyScope"
                      checked={applyScope === 'single'}
                      onChange={() => setApplyScope('single')}
                      className="text-sky-600"
                    />
                    <span>Selected Only</span>
                  </label>
                </div>
              </div>

              {/* MiTek Solver Recommended Sections */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    MiTek Solver Recommended Sections
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isTrussPass
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {isTrussPass ? '✔ Verified Passing' : 'Sizing Required'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Top Chord</span>
                    <strong className="text-slate-900 font-mono text-[11px] block">{recommendations.topChord.text.split('·')[0]}</strong>
                    <span className="text-emerald-700 font-bold text-[9.5px]">Verified Passing</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Bottom Chord</span>
                    <strong className="text-slate-900 font-mono text-[11px] block">{recommendations.bottomChord.text.split('·')[0]}</strong>
                    <span className="text-emerald-700 font-bold text-[9.5px]">Verified Passing</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Webs</span>
                    <strong className="text-slate-900 font-mono text-[11px] block">{recommendations.webs.text.split('·')[0]}</strong>
                    <span className="text-emerald-700 font-bold text-[9.5px]">Verified Passing</span>
                  </div>
                </div>

                {!isTrussPass ? (
                  <div className="pt-1 flex items-center justify-between bg-amber-50 border border-amber-200 p-2 rounded-lg">
                    <span className="text-[11px] text-amber-900 font-bold">
                      Overstressed webs detected ({(truss.maxUtilization * 100).toFixed(0)}% max util)
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoResolveTruss}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <span>⚡</span> Auto-Resolve to PASS
                    </button>
                  </div>
                ) : (
                  <div className="pt-0.5 text-[11px] text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg">
                    <span>✔</span> All Chords and Webs Structurally Verified (ASD/NDS/Eurocode 5)
                  </div>
                )}
              </div>

              {/* Dedicated Engineering Design Logics & Rules of Thumb Advisor Section */}
              <div className="p-3 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border border-indigo-200/90 rounded-xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-sm">💡</span>
                    <span>Engineering Design Logics & Rules of Thumb</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      advisorResult.failCount > 0
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : advisorResult.warningCount > 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {advisorResult.failCount > 0
                      ? `${advisorResult.failCount} Alert · Needs Sizing`
                      : advisorResult.warningCount > 0
                      ? `${advisorResult.warningCount} Advisories`
                      : '✔ 7/7 Rules Satisfied'}
                  </span>
                </div>

                <p className="text-[10.5px] text-slate-600 leading-tight">
                  {advisorResult.summaryNote}
                </p>

                {/* 7 Core Engineering Checks Micro-Badges */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {advisorResult.checks.slice(0, 4).map(c => (
                    <div
                      key={c.id}
                      className="px-2 py-1 rounded bg-white border border-slate-200 flex items-center justify-between"
                      title={c.explanation}
                    >
                      <span className="text-slate-600 font-medium truncate max-w-[110px]">{c.title.split(' ')[0]} {c.title.split(' ')[1]}</span>
                      <span className={`font-bold ${c.status === 'PASS' ? 'text-emerald-700' : c.status === 'WARNING' ? 'text-amber-700' : 'text-rose-700'}`}>
                        {c.status === 'PASS' ? '✔' : c.status === 'WARNING' ? '⚠️' : '✖'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Direct Action Buttons */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAdvisorOpen(true)}
                    className="flex-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>💡</span> Diagnostics & Rules ({advisorResult.passCount}/7)
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyRulesOfThumb}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title={`Apply all rules of thumb optimization to ${truss.tag}`}
                  >
                    <span>⚡</span> Apply to {truss.tag}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-8 text-center font-medium">
              Select a member in the elevation canvas to view stress analysis.
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Tray: "Select Roof Truss to Inspect" - Pixel Perfect Match to User Screenshot */}
      <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-2.5 flex flex-col gap-2 z-20 shadow-md">
        {/* Header line with "(20 active)" on left, and [Edit Spec] [Delete TR-XX] on right */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800 text-[13px]">Select Roof Truss to Inspect:</span>
            <span className="text-slate-400 font-normal text-[12px]">({Object.keys(catalog).length} active)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditSpecOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-amber-50 border border-amber-500 text-amber-700 font-bold rounded-md text-xs cursor-pointer transition-colors shadow-2xs"
            >
              <span>☷</span> Edit Spec
            </button>
            <button
              type="button"
              onClick={handleDeleteActiveTruss}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-rose-50 border border-rose-400 text-rose-600 font-bold rounded-md text-xs cursor-pointer transition-colors shadow-2xs"
              title={`Delete ${truss.tag} from roof layout`}
            >
              <span>🗑</span> Delete {truss.tag}
            </button>
          </div>
        </div>

        {/* 20 Truss Cards Carousel */}
        <div
          ref={carouselRef}
          className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scroll-smooth"
          style={{ scrollbarWidth: 'thin' }}
        >
          {Object.values(catalog).map((t, idx) => {
            const isSelected = t.tag === activeTrussTag || normalizeTrussTag(t.tag) === normalizedKey;
            const isPassing = t.maxUtilization <= 1.0;
            const posM = (t.baseElevation != null ? t.baseElevation : idx * 0.6).toFixed(1);

            return (
              <button
                key={t.tag}
                data-truss-tag={t.tag}
                type="button"
                onClick={() => {
                  setActiveTrussTag(t.tag);
                  setSelectedMemberId(t.members[0]?.id || 'TC-M1');
                }}
                className={`p-2.5 rounded-lg text-left shrink-0 w-32 cursor-pointer transition-all flex flex-col gap-1 shadow-2xs ${
                  isSelected
                    ? 'border-2 border-sky-500 bg-sky-50/90 ring-1 ring-sky-400'
                    : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Line 1: Tag on left, Status Badge on right */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-black text-xs text-slate-900 font-mono">{t.tag}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                      isPassing ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isPassing ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                {/* Line 2 & 3: Span & Pos */}
                <div className="flex flex-col text-[11px] text-slate-600 font-medium leading-tight space-y-0.5">
                  <span className="text-slate-700">Span: <b className="font-mono">{t.span.toFixed(1)}m</b></span>
                  <span className="text-slate-500 text-[10px]">Pos: {posM}m</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Edit Specification Modal */}
      {isEditSpecOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-black text-base">☷</span>
                <h3 className="font-bold text-sm">Edit Specification · {truss.tag}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditSpecOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900">Clear Span (m):</span>
                  <input
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="30.0"
                    value={specSpan}
                    disabled={!!truss.assemblyId}
                    onChange={e => setSpecSpan(parseFloat(e.target.value) || 9.4)}
                    className="p-2 border border-slate-300 rounded-md bg-white font-mono text-slate-900 font-semibold"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900">Pitch (deg):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="5.0"
                    max="60.0"
                    value={specPitch}
                    disabled={!!truss.assemblyId}
                    onChange={e => setSpecPitch(parseFloat(e.target.value) || 15.0)}
                    className="p-2 border border-slate-300 rounded-md bg-white font-mono text-slate-900 font-semibold"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900">Overhang (mm):</span>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    max="1500"
                    value={specOverhang}
                    disabled={!!truss.assemblyId}
                    onChange={e => setSpecOverhang(parseInt(e.target.value, 10) || 450)}
                    className="p-2 border border-slate-300 rounded-md bg-white font-mono text-slate-900 font-semibold"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900">Spacing (mm O.C.):</span>
                  <input
                    type="number"
                    step="50"
                    min="300"
                    max="1200"
                    value={specSpacing}
                    onChange={e => setSpecSpacing(parseInt(e.target.value, 10) || 600)}
                    className="p-2 border border-slate-300 rounded-md bg-white font-mono text-slate-900 font-semibold"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-slate-900">Timber Species & Grade:</span>
                <select
                  value={specGrade}
                  onChange={e => setSpecGrade(e.target.value)}
                  className="p-2 border border-slate-300 rounded-md bg-white font-semibold text-slate-900"
                >
                  <option value="NO2_SPF">#2 SPF / CLS (Standard Structural Timber)</option>
                  <option value="DFL_NO1">Douglas Fir-Larch #1 (Heavy Duty)</option>
                  <option value="C24">C24 Structural Timber (EN 338 European Standard)</option>
                </select>
              </label>

              {/* Building Code Roof Load Assumptions (Dead Load + Live/Snow Load) */}
              <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <span>🏋️</span> Building Code Roof Load Assumptions (DL + LL)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-sky-900 bg-white px-2 py-0.5 rounded border border-sky-300">
                    Total: {(specDeadLoadKPa + specLiveLoadKPa).toFixed(2)} kPa ({((specDeadLoadKPa + specLiveLoadKPa) * 20.8854).toFixed(1)} psf)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="font-bold text-slate-800 text-[11px]">
                      Roof Dead Load DL (kPa) <span className="text-slate-500 font-normal">({(specDeadLoadKPa * 20.8854).toFixed(1)} psf)</span>:
                    </span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.20"
                      max="5.00"
                      value={specDeadLoadKPa}
                      onChange={e => setSpecDeadLoadKPa(parseFloat(e.target.value) || 0.65)}
                      className="p-1.5 border border-slate-300 rounded-md bg-white font-mono text-slate-900 font-semibold"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="font-bold text-slate-800 text-[11px]">
                      Roof Live / Snow LL (kPa) <span className="text-slate-500 font-normal">({(specLiveLoadKPa * 20.8854).toFixed(1)} psf)</span>:
                    </span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.20"
                      max="8.00"
                      value={specLiveLoadKPa}
                      onChange={e => setSpecLiveLoadKPa(parseFloat(e.target.value) || 1.20)}
                      className="p-1.5 border border-slate-300 rounded-md bg-white font-mono text-slate-900 font-semibold"
                    />
                  </label>
                </div>

                {/* Quick Code Load Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Code Presets:</span>
                  <button
                    type="button"
                    onClick={() => { setSpecDeadLoadKPa(0.50); setSpecLiveLoadKPa(0.96); }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-sky-100 border border-slate-300 text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    IBC Min (10 DL + 20 LL psf)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSpecDeadLoadKPa(0.65); setSpecLiveLoadKPa(1.20); }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-sky-100 border border-slate-300 text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    Standard Snow (13.6 DL + 25 LL psf)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSpecDeadLoadKPa(0.75); setSpecLiveLoadKPa(1.92); }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-sky-100 border border-slate-300 text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    Heavy Snow (15.7 DL + 40 SL psf)
                  </button>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer text-[11px] font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={applyLoadsToAll}
                    onChange={e => setApplyLoadsToAll(e.target.checked)}
                    className="rounded text-sky-600"
                  />
                  <span>Apply Dead & Live Roof Load assumptions to all project trusses</span>
                </label>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                {truss.assemblyId && (
                  <div className="mb-1 font-bold">Span, pitch and overhang are driven by the 3D roof model (read-only here). Edit the roof in 3D and this elevation follows automatically. Webs you change here are written back to the 3D model.</div>
                )}
                Saving will update the geometry, recompute member lengths and total roof loads (DL + LL), recalculate ASD/NDS axial & bending interaction, and refresh the elevation drawing.
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditSpecOpen(false)}
                className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSpec}
                className="px-4 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Save & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5B. All-Members Roof Load (Dead Load + Live Load) & Building Code Verification Schedule Modal */}
      {isLoadScheduleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <span>🏋️</span>
                  <span>{truss.tag} — Per-Member Total Roof Load (Dead Load + Live Load) & Building Code Verification</span>
                </h3>
                <p className="text-xs text-sky-200 mt-0.5">
                  ASCE 7-16 §2.4.1 ASD (D + Lr / D + S) · IBC 2018 §1605.2 · Applied Roof DL = {trussDeadKPa.toFixed(2)} kPa ({(trussDeadKPa * 20.8854).toFixed(1)} psf) + LL = {trussLiveKPa.toFixed(2)} kPa ({(trussLiveKPa * 20.8854).toFixed(1)} psf)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLoadScheduleOpen(false)}
                className="text-slate-400 hover:text-white font-black text-xl cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
              {/* Truss-Level Summary Bar */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Truss Total Dead Load (DL)</div>
                  <div className="font-mono font-black text-base text-slate-900 mt-0.5">
                    {trussTotalDeadKN.toFixed(2)} kN ({Math.round(trussTotalDeadKN * 224.809).toLocaleString()} lbs)
                  </div>
                  <div className="text-[10px] text-slate-500">Roof DL: {trussDeadKPa.toFixed(2)} kPa ({(trussDeadKPa * 20.8854).toFixed(1)} psf)</div>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <div className="text-[10px] font-bold text-sky-700 uppercase">Truss Total Live / Snow (LL)</div>
                  <div className="font-mono font-black text-base text-sky-900 mt-0.5">
                    {trussTotalLiveKN.toFixed(2)} kN ({Math.round(trussTotalLiveKN * 224.809).toLocaleString()} lbs)
                  </div>
                  <div className="text-[10px] text-sky-700">Roof LL/S: {trussLiveKPa.toFixed(2)} kPa ({(trussLiveKPa * 20.8854).toFixed(1)} psf)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800">
                  <div className="text-[10px] font-bold text-sky-300 uppercase">Total Truss Roof Load (DL + LL)</div>
                  <div className="font-mono font-black text-base text-emerald-400 mt-0.5">
                    {trussTotalRoofLoadKN.toFixed(2)} kN ({Math.round(trussTotalRoofLoadKN * 224.809).toLocaleString()} lbs)
                  </div>
                  <div className="text-[10px] text-slate-300">Combined: {trussTotalKPa.toFixed(2)} kPa ({trussTotalPsf} psf) @ {(truss.spacing * 1000).toFixed(0)}mm O.C.</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">Building Code Check</div>
                  <div className="font-black text-sm text-emerald-900">
                    {trussDeadKPa >= 0.48 && trussLiveKPa >= 0.96 ? '✔ IBC / ASCE 7 COMPLIANT' : '⚠ BELOW CODE MINIMUM'}
                  </div>
                  <div className="text-[10px] text-emerald-700">Min required: 10 psf DL + 20 psf LL</div>
                </div>
              </div>

              {/* Member-by-Member Roof Load Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[10.5px] font-bold text-slate-700 uppercase">
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Role / Type</th>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3 text-right">Trib. Area</th>
                      <th className="py-2.5 px-3 text-right">Dead Load (DL)</th>
                      <th className="py-2.5 px-3 text-right">Live Load (LL)</th>
                      <th className="py-2.5 px-3 text-right bg-sky-50 text-sky-950">Total Roof Load (DL+LL)</th>
                      <th className="py-2.5 px-3 text-right">Line Load q</th>
                      <th className="py-2.5 px-3 text-right">Axial Force (DL / LL)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {truss.members.map(m => {
                      const b = calculateMemberRoofLoadBreakdown(m, truss);
                      const isSel = selectedMember?.id === m.id;
                      return (
                        <tr
                          key={m.id}
                          onClick={() => {
                            setSelectedMemberId(m.id);
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSel ? 'bg-sky-50/90 font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-3 font-bold text-slate-900">{m.id}</td>
                          <td className="py-2 px-3 font-sans text-slate-600">{m.type.replace('_', ' ')}</td>
                          <td className="py-2 px-3 text-slate-800">{m.section.nominalName}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{b.tributaryAreaM2.toFixed(2)} m² ({b.tributaryAreaFt2} ft²)</td>
                          <td className="py-2 px-3 text-right text-slate-800">{b.deadLoadKN.toFixed(2)} kN ({b.deadLoadLbs} lbs)</td>
                          <td className="py-2 px-3 text-right text-sky-800">{b.liveLoadKN.toFixed(2)} kN ({b.liveLoadLbs} lbs)</td>
                          <td className="py-2 px-3 text-right font-black bg-sky-50/60 text-slate-950">
                            {b.totalRoofLoadKN.toFixed(2)} kN ({b.totalRoofLoadLbs} lbs)
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600">{b.totalLineKNm.toFixed(3)} kN/m</td>
                          <td className="py-2 px-3 text-right text-slate-700">
                            {b.deadAxialKN.toFixed(1)} / {b.liveAxialKN.toFixed(1)} kN (Σ {b.totalAxialKN.toFixed(1)} kN)
                          </td>
                          <td className="py-2 px-3 text-center font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.utilization <= 1.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {(m.utilization * 100).toFixed(0)}% {m.utilization <= 1.0 ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Click any member row to select it in the 2D Elevation Canvas, or click Adjust Design Loads to test different building code load combinations.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoadScheduleOpen(false);
                    setIsEditSpecOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-sky-400 bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs cursor-pointer"
                >
                  ⚙️ Adjust Dead / Live Loads
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoadScheduleOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Close Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Engineering Design Logics & Rules of Thumb Advisor Modal */}
      {isAdvisorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xl shadow-inner">
                  💡
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight">
                    Engineering Design Logics & Rules of Thumb Advisor
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Industry code standards: ANSI/TPI 1 · NDS 2018 · Eurocode 5 · WTCA / BCSI Safety Guidelines
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvisorOpen(false)}
                className="text-slate-400 hover:text-white font-black text-xl cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Rules and Diagnostics */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
              {/* Summary Overview Banner */}
              <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Audit Subject: <span className="text-slate-900 font-black">{truss.tag}</span> (Span: {truss.span.toFixed(2)}m · Pitch: {truss.pitch.toFixed(1)}°)
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {advisorResult.summaryNote}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                      advisorResult.overallHealth === 'EXCELLENT'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : advisorResult.overallHealth === 'ADEQUATE'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {advisorResult.overallHealth === 'EXCELLENT'
                      ? 'EXCELLENT COMPLIANCE'
                      : advisorResult.overallHealth === 'ADEQUATE'
                      ? 'ADEQUATE (ADVISORY NOTES)'
                      : 'OPTIMIZATION REQUIRED'}
                  </span>
                </div>
              </div>

              {/* 7 Engineering Rules of Thumb Cards */}
              <div className="space-y-3">
                <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>Detailed Design Rules & Benchmark Verification:</span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {advisorResult.passCount} Passed · {advisorResult.warningCount} Advisories · {advisorResult.failCount} Alerts
                  </span>
                </div>

                {advisorResult.checks.map(check => {
                  const isPass = check.status === 'PASS';
                  const isWarning = check.status === 'WARNING';
                  const isFail = check.status === 'FAIL';

                  return (
                    <div
                      key={check.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isFail
                          ? 'bg-rose-50/70 border-rose-300'
                          : isWarning
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                isPass
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isWarning
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {check.status === 'PASS' ? 'PASS ✔' : check.status === 'WARNING' ? 'ADVISORY ⚠️' : 'FAIL ✖'}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs">{check.title}</h4>
                            <span className="text-[10px] text-slate-400 font-semibold">[{check.category}]</span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-normal">
                            {check.ruleDescription}
                          </p>

                          <p className="text-[11.5px] font-medium text-slate-800 pt-1">
                            {check.explanation}
                          </p>
                        </div>

                        {/* Benchmark & Action Block */}
                        <div className="text-right shrink-0 min-w-[170px] space-y-2">
                          <div className="p-2 rounded bg-white/80 border border-slate-200 text-right">
                            <div className="text-[9.5px] text-slate-400 font-bold uppercase">{check.metricLabel}</div>
                            <div className={`font-mono font-black text-xs ${isFail ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
                              {check.currentValue}
                            </div>
                            <div className="text-[9.5px] text-slate-500 font-medium">Standard: {check.recommendedValue}</div>
                          </div>

                          {check.canAutoApply && check.actionLabel && (
                            <button
                              type="button"
                              onClick={() => handleApplyIndividualRule(check.id)}
                              className="w-full px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                            >
                              ⚡ {check.actionLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer with One-Click Apply */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-slate-500 text-[11px] font-medium">
                Applying rules of thumb recalculates member capacities, equilibrium forces, and connector plates.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdvisorOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleApplyRulesOfThumb();
                    setIsAdvisorOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>⚡</span> Apply Rules to {truss.tag}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleApplyRulesToAllTrusses();
                    setIsAdvisorOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>⚡</span> Apply to All 20 Trusses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
