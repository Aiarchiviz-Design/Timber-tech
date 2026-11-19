# Timber Teck Truss Features — Logic and Code Map

Two features are covered:

1. **Truss Elevation & Stresses** — the interactive 2D truss elevation tab with member stress/utilization inspection (React + TypeScript).
2. **Run Auto Analysis on All Trusses** — batch auto-sizing, then independent NDS ASD checks, then iterative member upgrades per truss (plain JavaScript modules).

---

## 1. File map

| Feature | File | Role |
|---|---|---|
| Elevation | `src/main.tsx` | Mounts the React app; exposes `window.renderTrussElevationView`, `window.openTrussElevationModal`, `window.mountTrussElevationViewTab` bridge for the BIM host |
| Elevation | `src/App.tsx` | Standalone shell with sample trusses (Fink, Howe, TR-03) and catalog selection |
| Elevation | `src/components/TrussElevationView.tsx` | 2D elevation drawing, member click/select, section picker, stress colouring, Timber Teck recommendations, BIM reconciliation (`reconcileWith3D`) |
| Elevation | `src/services/trussStressEngine.ts` | Member stress model: `calculateMemberStresses`, `recalculateTrussMembers`, `autoResolveTruss`, `getTimberTeckRecommendations`, geometry builders |
| Elevation | `src/services/trussRulesAdvisor.ts` | Rule-based advice text for failing or marginal members |
| Elevation | `src/services/trussAdvancedAnalysis.ts` | `analyzeTruss` — the independent NDS 2018 SPF No.2 / ASCE 7-16 ASD-subset solver used by both features |
| Elevation / shared | `src/types/trussElevation.ts` | `TrussStructure`, `Member2D`, `TimberSection`, `TimberGrade` types |
| Elevation / shared | `src/index.css` | Styles |
| Auto analysis | `truss-analysis-ui.js` | Button handler (`#truss-analysis-btn`), options dialog (incl. "Maximum NDS optimization rounds", default 12), progress, results, CSV/PDF export |
| Auto analysis | `truss-analysis-core.js` | **Main logic**: `runCadTechTrussAnalysis`, `optimizeNdsTruss`, `optimizeNdsMemberSizes`, `tryBetterWebStyle`, `rightSizeMembers`, `trussGeometryToAssembly`, `buildNdsInput`, `buildCadTechTrussBimOverrides` |
| Auto analysis | `autodesign.js` | V9.9.8 auto-size screening pass (`autoDesignAssembly`) run before NDS |
| Auto analysis | `truss-advanced-engine.js` | Web styles (`WEB_STYLES`), member template and size ladder (`MEMBER_SIZE_LADDER`) |
| Auto analysis | `truss-connectivity.js` | `auditTrussConnectivity` — rejects crossings, mid-chord T-junctions, free web ends, duplicates |
| Auto analysis | `advanced-features.js`, `engineering.js`, `takeoff.js`, `connection-geometry.js`, `truss-drawing.js`, `truss-engine-core.js` | Dependencies pulled in by the screening, PDF and drawing code |
| Auto analysis | `report.js` | Timber Teck Truss Design PDF generation (`generateTrussPDFReport`) |
| Host glue | `truss-sync.js` | Classic-script sync between BIM roof framing and the elevation tab (not a module; loads as a global script) |
| Tests | `test-cadtech-auto-truss-analysis.mjs`, `test-truss-analysis-ui.mjs` | Run with `node --experimental-strip-types <file>` |

Not included (host application, must stay in the BIM app): `app.js` (the view switcher, `#truss-elevation-btn` wiring, `setView('trusselevation')`), `index.html` (buttons and tabs), `roof.js`, `roof-framing.js`, `hip-trusses.js`, `truss-joints.js` (these produce the roof geometry both features consume).

---

## 2. Feature: Truss Elevation & Stresses

**Entry:** the tab button `data-view="trusselevation"` → `setView('trusselevation')` in `app.js` → `#truss-elevation-panel` shown → `TrussElevationView` renders the active truss.

**Data model** (`types/trussElevation.ts`): a `TrussStructure` has `nodes`, `members` (each with `type` = top_chord / bottom_chord / web / …, `length`, `axialForce` kN with + tension and − compression, `section`, `grade`, and result fields), plus `spacing` (m) and `maxUtilization` / `integrityStatus`.

**Stress check** (`calculateMemberStresses` in `trussStressEngine.ts`), per member:

- Load duration factor `C_D = 1.15`.
- **Tension:** capacity = `A × F_t × C_D`; utilization = `|N| / capacity`.
- **Compression:** slenderness `L_e/d` where lateral bracing is 600 mm for top chords, 1200 mm for bottom chords, and full length for webs; in-plane length for chords is the panel length (`length / round(length/2.2)` when > 2.5 m).
  - Column stability factor `C_p` from the Euler term `F_cE = 0.822·E_05 / (L_e/d)²`, `F_c·C_D`, `r = F_cE/F_c*`, `c = 0.8`, `q = (1+r)/(2c)`, `C_p = q − √(q² − r/c)`.
  - Utilization = `(N / (A·F_c'))²` with `F_c' = F_c·C_D·C_p`.
- **Top chord combined check:** adds in-plane bending `f_b = M/S` with `M = q·L²/10`, `q = (1.2·DL + 1.5·SL)·spacing`, and `utilization += f_b / (F_b' · (1 − f_c/F_cE))`. If `f_c ≥ F_cE`, utilization is set to 9.99.
- Status: utilization ≤ 1.0 → SAFE, else FAILED. Truss integrity = PASS when max utilization ≤ 1.0.

**Important limitation of this tab:** the stress check is a simplified screening model. Dead and snow loads are fixed defaults (`deadLoadKPa = 0.65`, `snowLoadKPa = 1.20`), and it does not include the NDS load combinations, connections or deflection. Use "Run Auto Analysis on All Trusses" for the independent NDS ASD check. Before using this tab for design, confirm those defaults with the project.

**Auto-resolve** (`autoResolveTruss`): keeps a member if utilization ≤ 0.85, slenderness ≤ 175 and depth ≥ 89 mm; otherwise it steps through `COMMON_WOOD_SECTIONS` to the smallest passing section (chords start at 2x6, webs at 2x4).

**Sync with BIM:** `reconcileWith3D` (in `TrussElevationView.tsx`) and `truss-sync.js` keep the chords and webs in the 2D elevation matching the 3D roof framing. Changes made in one view are pushed to the other.

---

## 3. Feature: Run Auto Analysis on All Trusses

**Entry:** `#truss-analysis-btn` → `openAnalysisDialog()` (`truss-analysis-ui.js`) → user enters loads and settings → `runCadTechTrussAnalysis(geometry, settings)`.

**Inputs:** dead (psf), roof live, **roof snow (required — a blank value is refused; 0 must be entered explicitly)**, wind, bottom live, tributary width, deflection limit (default L/360), bearing length and capacity, hold-down and plate capacity, brace length, `maxPly` (≤ 5), and `maxNdsRounds` (default 12, range 1–30).

**Pipeline** (`runCadTechTrussAnalysis`):

1. **Geometry to assembly.** `trussGeometryToAssembly` converts the current BIM roof framing into a list of trusses. Each truss is classified (COMMON, HIP, JACK, GIRDER, …) and has its members, spacing and joint data. If none are found, it throws.

2. **V9.9.8 auto-size screen.** `autoDesignAssembly` runs first (up to 8 rounds, `WEB_STYLES`, `maxPly`). This is the approximate force and deflection model. Its PASS/FAIL is a screen, not an approval.

3. **Reset to minimum.** `resetMembersToLadderMinimum` starts each truss from the smallest ladder step so the NDS optimizer only adds what is needed.

4. **Independent NDS ASD check** (`runNdsForTruss`):
   - `buildNdsInput` converts the truss to NDS input. Section dimensions are converted from metres to millimetres here (a 38.1 × 88.9 mm member is checked at that size).
   - `analyzeTruss` (from `trussAdvancedAnalysis.ts`) solves a pin-jointed axial model with simplified chord panel-load bending, NDS 2018 SPF No.2 reference values and ASCE 7-16 ASD combinations, and returns member ratios, deflection, stability and warnings.
   - `auditTrussConnectivity` is run. Any joint topology error forces the overall result to FAIL.
   - Each member is labelled with its single-ply size and ply count. Parallel plies are combined as an effective width for the solver.

5. **Iterative optimization** (`optimizeNdsTruss`, per truss):
   - **Reserve:** if the truss has a topology that can be changed (simple COMMON trusses only), 3 rounds (or fewer when the budget is small) are held back for an alternate web style.
   - **Member sizing** (`optimizeNdsMemberSizes`): loop up to `maxRounds` times while the result is not PASS. Each round selects failing members (`selectFailedMembers`), picks the next ladder option from the ratio (`ladderStepForRatio`: a ratio > 1 takes a bigger step; a slenderness-only failure takes a smaller one), and sets it (`setMemberLadderOption`). This can mean a new member depth or an added ply, up to `maxPly`. If no member can change, the loop stops. Each change is logged as an action.
   - **Web-style trial** (only if still FAIL): `tryBetterWebStyle` builds candidate web topologies, sizes each through the same NDS loop with the reserved rounds, and keeps the candidate only if its score (`ndsScore`) is better than the original. Otherwise the reserved rounds go back to sizing the original geometry.
   - **Right-size** (only if PASS): `rightSizeMembers` tries smaller ladder steps on members that still pass, using a budget of 160 checks. It does not use the sizing rounds.
   - **Audit record:** `diffMemberSnapshots` writes before/after records (section, plies, web style, ratios) to `truss.optimizationAudit`, and `ndsOptimization` holds the actions and any unresolved reasons.

6. **Result per truss:** `ndsASDAnalysis.overall` is PASS, FAIL or NOT RUN.
   - **PASS** only when the final independent NDS result is PASS.
   - **FAIL** when unresolved after the rounds (with the reason, e.g. "Reached the configured NDS optimization limit").
   - **NOT RUN** on any exception. The error is recorded and the batch continues.

7. **Summary:** counts of trusses, auto-screen PASS, NDS PASS / FAIL / NOT RUN, members resized, plies added, web styles changed, and overall (`PRELIMINARY CHECKS COMPLETE` only when every truss passes NDS; otherwise `REVIEW REQUIRED`).

8. **Write-back:** `buildCadTechTrussBimOverrides` turns final member sizes and accepted web patterns into stable role/member overrides saved on the BIM roof assembly. Roof framing regenerates from them.

9. **PDF:** "Timber Teck Truss Design PDF" (`report.js`) exports only from an analyzed BIM assembly. It refuses to export without one.

**Limitations (copy these into the other app's UI and docs):** the auto-size screen is approximate. The NDS check is a pin-jointed axial model with simplified chord bending, and it does not design connector plates, bolts, hangers, bearing, uplift anchorage or full 3D lateral stability. It is not an Indian IS 883 / IS 875, Eurocode 5 or AS 1720 check. Ply effective-width combination is not a ply-fastener calculation. Dead load is on sloped length, and snow and live are on horizontal projection; confirm the basis. Verify all member properties, grades, loads and local codes before use.

---

## 4. Porting notes for another app

- Both features expect the same truss object shape (`members`, `nodes`, `spacing`, `section`, `axialForce`). Keep this shape or write an adapter.
- The auto analysis needs a real roof geometry input. Without the BIM roof-framing producer (`roof.js`, `roof-framing.js`, `truss-joints.js`), it can only run on data you supply in the `trussGeometryToAssembly` format.
- The React tab is a standalone component (`TrussElevationView`) and can be mounted with the `window.renderTrussElevationView(container, truss, onUpdate)` bridge in `main.tsx`, or imported directly.
- The code uses `import … from './x.js?v=…'` query strings. Strip the `?v=` suffix when moving files into a bundler project, or keep them if you use the same loader.
- The test files check behaviour; run them after porting.

