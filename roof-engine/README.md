# Atelier BIM Studio — advanced BIM and truss geometry

Run `node preview.cjs` from this directory, then open http://127.0.0.1:4180/. No build or package install is required. Static files live in `dist/`.

One central project stores stories, BIM walls, hosted openings and drafting elements. Joined plan geometry, 3D solids, wall sections, framing panels and cut lists derive from these objects. Generated timber members are not separately editable CAD lines.

## Advanced truss generation — V3.77

- Selectable Fink/W, Howe, Pratt, Warren, Queen-post and King-post web patterns.
- Auto or fixed panel count (4–24) with validation and live geometry regeneration.
- Pattern-based web placement for sectional and closed hip/common/girder assemblies, using chord stations rather than repeated midpoint V-pairs.
- Existing jack/hip/girder connection paths, 2 ft overhang, 6 ft girder setback and wall-plate alignment retained.
- This remains advanced geometric design-assist, not certified structural design; loads, timber capacities, reactions, connectors, bearing, bracing and code checks are not solved. See `ADVANCED_TRUSS_GENERATION_V370.md` and `FIXES_V371.md`.

## Advanced milestone

- Automatic L/T/X wall cleanup, unequal thickness/height, collinear seam removal, join priority, connected endpoint propagation and undo/redo.
- Basic and preset composite walls, six face/core reference choices, flip orientation, base/top offsets and top-story links.
- Hosted doors/windows with position, width, height, sill and reveal controls; split walls rehost openings and reject splits through an opening.
- Common, king/jack and cripple studs, headers, sills, plates and junction packs regenerate after wall/opening edits. Panel, 3D framing and CSV cut list share the generator.
- Precise length/angle tracker, coordinate input, endpoint/midpoint/intersection/perpendicular/tangent snaps, selection, endpoint grips, move/copy/offset, custom rotation, mirror, split, trim/extend, arrays and alignment.
- Associative endpoint dimensions; copied wall/dimension groups remap references. Deleted references retain a measured snapshot and report detachment.
- Larger 3D workspace and focus mode, perspective/orthographic cameras, orbit/pan/zoom, top/front/right/isometric presets, shaded/materials/hidden-line/X-ray display and synchronized selection.
- X/Y/Z cutting planes with capped wall/prism solids. Cutting is a viewport operation and does not alter framing or model dimensions. Section A–A has an editable Y position used by its plan marker and section geometry.
- JSON project save/open, OBJ geometry export and schedules.

## Architecture

`app.js` owns the project, transactions and shared views. `joins.js` derives wall intersections and solid cells; `framing.js` generates construction members; `camera.js` handles projection and visible solid edges; `advanced.js` supplies editing, snaps, dimension references and clipping.

## Verification

From this directory run:

```
node tests/verify.cjs
node tests/verify-walls.cjs
node tests/verify-advanced.cjs
```

All three suites passed. They cover story/host dependencies, import validation, L/T/X geometry, framing regeneration, reference flips, split/rehosting, rotation, arrays, associative dimensions, clipping volumes and precise drafting. The live browser check confirmed focused 3D layout and cutting controls with no captured console errors. Preview screenshot is supplied alongside the archive.

## Current scope

This is an advanced prototype, not a complete professional CAD/BIM product. Walls are straight or chained segments. Curved/slanted/tapered/profile walls, individual composite-skin junction priorities, engineering load checks, full fillet/chamfer and general CAD booleans, sheet layouts, DWG/IFC/PDF underlays and advanced roofs/stairs remain future milestones. Existing roof modelling is preliminary. Framing member sizes are construction inputs, not engineered design results. Opaque 3D views use a software depth buffer with depth-tested edges and picking; very large framing models may require GPU rendering for performance.

Source publication remains blocked by the session's shell approval policy; the local source is complete and runnable.

## Drafting/editing update

Left-to-right marquee selects fully enclosed geometry; right-to-left selects crossing geometry. Move preserves hosted opening offsets by displacement and skips children when the parent wall is selected. Copy/arrays deduplicate children and remap dimensions. Mirror uses a picked two-point axis. Walls, beams and CAD lines support split and trim/extend; line/beam offset uses the parallel axis. Lines expose endpoints and length in Properties and endpoint grips on the canvas. Arcs now use center/start/end with a genuine sweep. Wheel zoom keeps the point beneath the cursor fixed in plan. Escape restores unfinished drag edits. Move/Copy show ghost outlines and coordinate displacement.

Run `node tests/verify-editing.cjs` for the additional editing regressions. All four suites passed. Live exact-coordinate and length-input creation was verified. The user's 28-element model was backed up and restored into the upgraded browser tab.


New walls default to Outside face reference. Existing wall reference settings remain editable in Properties. Opaque shaded/material/hidden-line views now resolve each pixel by nearest surface, including selection. X-ray intentionally remains transparent. Run node tests/verify-depth.cjs for draw-order-independent occlusion tests.

Framing fix: perpendicular end corners use deterministic through/butt plate runs derived from framing core faces. Corner packs and common stud limits regenerate to the new run. All studs stop under the lowest top plate. Opaque edge rendering now tests only the covered pixel with tight tolerance, preventing hidden stud edges leaking through plates. Oblique corner details remain a future extension.

Outside-corner update: sample exterior walls and legacy imports use outside reference. Design > Use outer corners for exterior walls converts existing exterior walls, retaining endpoint coordinates as outside-face points. This changes the wall envelope by half its thickness relative to former center-based geometry; framing regenerates. A converted 28-element project is supplied as outer-corner-project.bim.json.

2D framing plan: synchronized projected member footprints, wall/opening IDs, selectable BIM walls and regeneration. Document > Wall panel structural design lists every panel's pending design requirements and offers US (NDS), Canada (CSA O86), Australia (AS 1720.1/applicable AS 1684) region profiles. These profiles are not implemented code-compliance calculations. All panels remain Design inputs required until loads, grades, bracing, connections and governing editions are supplied and verified.

Panel overhang correction: through-run ends now use actual adjoining core-face coordinates even when this shortens the run. Outside-reference panel corners no longer retain the axis endpoint beyond the joint. Regression tests verify shortened plates, butt alignment and stud containment.

Near-connected corner correction: perpendicular panels whose end envelopes meet now regenerate runs and corner packs even when their reference endpoints differ. Run ends use the adjoining stud-depth footprint and composite core offset, excluding sheathing/cladding/finish skins. Composite corner regression added.

Wall junction details: Select a wall and use TIMBER FRAMING > L corner / T junction. Three-stud and two-stud backing corners, perpendicular T backing studs and spaced horizontal T blocking generate shared members for plan, 3D, panel view and cut list. The framing plan uses timber core outlines and crossed stud symbols. Orthogonal T branches butt at the timber face. Structural load sizing and connection design remain pending project inputs.

Parametric roof update: Roof tool accepts a convex pivot polygon; finish with Enter, then select Hip, Gable or Single plane in Properties. Pitch uses actual geometry, overhang offsets the pivot polygon, thickness produces a closed shell, and story linkage updates elevation. Gable/single-plane ridge angle rotates the slope direction. Plan grips edit the boundary; move/copy/rotate/mirror retain roof properties. Plan, 3D, section/elevation and OBJ share generated surfaces. Complex concave roofs, dormers, per-edge pitches, automatic roof intersections and wall-to-roof trimming are not implemented.

Stepped roof update: Multi-plane hip now supports simple L/T/U and stepped outlines with right-angle corners, including rotated footprints. The upper envelope of maximal rectangle slopes generates continuous hips, ridges and valleys. Gable and single-plane roofs accept simple concave outlines; gable still uses one ridge direction. Boundary crossings and overhangs that close a recess are rejected. Hip roofs with concave non-right-angle corners, enclosed courtyard holes, dormers and independent raised sections remain unsupported. This supersedes the previous convex-only limitation.

Roof shape conversion: Select an existing roof > Properties > Roof shape > Multi-hip or Multi-gable. Multi-gable generates intersecting ridge directions from the long axes of rectangular wings on a right-angle footprint; sloped planes extend to their intersections for continuous unequal-wing junctions. Boundary, pitch, overhang, thickness, ID and story settings are preserved; undo/redo restores the previous roof shape. Single-ridge gable remains a separate option.

Roof framing: Select a BIM roof > Roof framing > Rafters or Trusses. Set spacing, member width/depth, and truss web depth/heel/run angle. Align above wall plates adjusts the central roof elevation and retains story linkage. Roof framing plan, 3D framing and the combined timber framing cut list regenerate from the same roof after geometry/property edits. Roof CSV quantities include member centerline lengths. Rafter layouts include ridge/hip/valley members; trusses include top/bottom chords, webs and heel posts. These are preliminary layouts: automatic bearing assignment, girder trusses, bracing, joint cuts, connectors and structural load sizing are not implemented. Run node tests/verify-roof-framing.cjs for regeneration, geometry, quantities, validation, undo and wall-plate alignment regressions.

Hip truss end sets: rectangular elongated hip roofs now generate multi-ply girder trusses, hip carriers, front jacks, side jacks and common trusses. Orientation follows the footprint long axis; spacing and girder ply count are editable. Irregular/compact hip footprints retain sectional trusses with an internal layout issue. Truss members use assembly-plane profiles: shared chord miters, shared web junction planes and webs/heel posts trimmed to chord faces. Cut list uses profile projected cutting lengths; fabrication allowances and connection design remain pending. Hip set positions, girder plies and member sizes are preliminary layout values, not designed capacities. These are not implementations of all illustrated truss families (attic, scissor, piggyback etc.). Run tests/verify-hip-trusses.cjs and tests/verify-truss-joints.cjs.

Roof connection update: rafter and ridge/hip end junctions receive closed miter faces; rafters receive compound cuts at ridge/hip receiving faces. Hip carrier and jack chord ends trim against higher-priority carrier/girder faces. Truss chord miters and web/heel face cuts share the generated member geometry and profile-based cut lengths. This covers generated roof members; wall bearing notches, connectors and irregular hip assembly design remain pending. Tests verify shared peak planes, web-to-chord faces, closed rafter receiving cuts, rotated hip regeneration and quantities.

Scissors Trim update: Toolbar Trim or Edit > Trim portion activates a persistent command. Click the portion to remove, between finite visible crossings. Optional preselected elements act as cutting boundaries. No selection is required. Lines, polylines, circles, arcs, straight walls and beams support trim; middle intervals split into two retained elements. Circle trimming produces an arc. Hover previews the removed interval in red. Esc exits. Edit > Extend to boundary extends the clicked straight endpoint to the nearest finite crossing beyond it. Wall opening offsets remain associative; trimming through/removing an opening is blocked. Undo/redo restores the operation. Slab/roof boundaries can be cutters but are not trimmed as filled BIM polygons.

Multi-wing truss update: simple orthogonal connected roof outlines now partition into non-overlapping rectangular framing wings, each following its long axis. Internal wing ends get preliminary junction girders; fully exposed ends get hip girders, hip carriers, front jacks, side jacks and transition hip trusses. Small end zones use editable Hip girder setback (default 1200 mm). Front-jack bottom chords reach the hip girder while top chords reach the hip carrier. Side-jack bottom chords reach the first front jack. Partial exposed ends and valleys still require detailed junction layout refinement; girder locations, loads and connectors are preliminary. Plan/3D/cut quantities regenerate after edits. Run node tests/verify-multi-wing-trusses.cjs.
Reference hip layout: truncated hip trusses retain full-span bottom chords and use flat upper chords from roof facets. Front jacks, side jacks and diagonal hip carriers are confined to the outer end strip ending at the hip girder; carriers terminate at that girder. Main/transition trusses begin behind the girder. Tests verify full-span bearings, flat top profiles, exclusion of jack members from the main body, rotation and multi-wing geometry.
Roof framing plan drawing update: one centerline per assembly instead of all projected chords/webs; red hip/junction girders, orange main/hip trusses, green front jacks, violet side jacks, magenta hip carriers. Blue dashed roof perimeter, solid roof bearing perimeter, hip/ridge fold lines, dimensions and reference datum bubbles for rectangular roofs. Labels group girder plies and avoid label overlap; zoom to reveal more labels. Fit to view now includes the complete roof bounds and annotation margins. This is drawing presentation; section markers and editable structural grid objects are not added.
Truss solid connection audit: jack and hip-carrier receiving cuts now account for offset multi-ply girders, rather than requiring exact centreline coincidence. Sloping chord cut directions use the member direction; vertical posts use their assembly side. Flat/zero-volume remnants are excluded from geometry and cut lists. Tests inspect finished girder-side jack solids, carrier and side-jack receiving cuts across 1–4 girder plies, three setbacks and rotation, plus existing web/peak, rafters and multi-wing checks. Complex wing junction support positions remain preliminary.


## Advanced truss design-assist upgrade (2026-10-17)

- Roof properties now expose **Analyze all trusses** and **Optimize candidates** when a roof is set to the Trusses framing system. The same tools are available from Document.
- The review scans visible roof framing, validates member endpoint/length geometry, groups members into generated truss assemblies, prioritizes girder/carrier/jack/hip/valley families, and creates a geometry-based member-size candidate register.
- Export review CSV and audit JSON from the results dialog. Every proposal retains its roof/assembly reference and reason.
- The upgrade deliberately labels geometry proposals as **REVIEW**. They are not automatically applied to the BIM model because the current project does not contain a validated structural solver for load combinations, timber capacity factors, member force/buckling, connections, bearing, deflection, and bracing. A larger section based on length/depth alone is not a structural optimization result.
- The requested Australian workflow must ultimately use project-specific AS/NZS 1170 actions, AS 1720.1 timber design and applicable NCC/AS 1684 requirements, with verified timber grade/property libraries and engineer-reviewed connections/bracing. The existing PDF reports can guide review but their PASS/certification labels are not proof of compliance.

### New regression test

Run `node tests/verify-truss-optimizer.cjs` to check truss discovery, assembly grouping, geometry-based candidate creation, CSV output and honest REVIEW statuses. Run all `tests/*.cjs` for the full regression suite.


## Run with Python (no Node.js required)

Requirements: Python 3.9 or newer. This is a static browser app served locally by Python; it does not need `pip install` or external packages.

### Windows
1. Extract the ZIP archive.
2. Open the extracted `atelier_upgrade` folder.
3. Double-click `run.bat`, or open Command Prompt in that folder and run `python run.py`.
4. Open `http://127.0.0.1:4180/` if your browser does not open automatically.
5. Keep the terminal window open while using the app. Press `Ctrl+C` to stop it.

### macOS / Linux
Open a terminal in `atelier_upgrade` and run `python3 run.py`, then visit `http://127.0.0.1:4180/`.

To use a different port, set the `ATELIER_PORT` environment variable before starting the script.

Note: Python runs the existing frontend locally; it does not turn the JavaScript BIM/optimization logic into Python. Structural design checks remain subject to the limitations stated in this README.

## Truss member connection update

The truss joint geometry now records explicit chord/web connection metadata. Top-chord segments are mitered at shared nodes; web and heel-post ends are trimmed to the face of the top or bottom chord when they meet it, rather than being allowed to visually pass through the chord. Connection records are retained on members for audit and future connector-plate detailing. These are geometric timber-joint details only: connector plates, nail/fastener schedules, joint capacities and fabrication approval are not calculated by this update and remain engineering-review items.

Run the regression checks with Node.js (optional, only for the test suite): `node tests/verify-truss-joints.cjs`. The app itself still launches with Python using `python run.py`.

## Plumb-cut update

The latest joint-geometry update marks top-chord-to-top-chord peak/end joints as `plumb-cut` and sets their end-cut plane vertical in the truss elevation. Rafter-to-rafter end joints now use a vertical plumb-cut plane rather than the shared angular bisector. Web-to-chord flush trimming is retained. This is geometric joinery only; it does not certify connector plates, fasteners, bearing, or structural capacity.

The roof-framing regression was fixed: rafter stations are now generated from each roof facet’s local bounds instead of rounding the global station coordinate, which previously skipped rafters when a facet began at a negative coordinate. The test now correctly accepts the closed compound-cut solids generated at trimmed joints (six or more faces, depending on the cut profile). The 3D framing renderer previously used family-specific colors; the CadTech-reference update below changes these to natural timber shading to match the wall studs. Run `node tests/verify-truss-joints.cjs` for joint geometry and all `node tests/*.cjs` for the full suite.


## Lightweight 3D performance update

The 3D viewport now uses direct Canvas polygon drawing instead of the previous full-resolution per-pixel software depth rasterizer. This avoids allocating multiple full-screen buffers and removes nested pixel loops that could make large timber-framing scenes appear frozen. Polygon picking uses projected face hit-testing. The ground grid automatically uses wider spacing on larger models to limit draw calls. This rendering path is designed for responsiveness; complex intersecting geometry may show painter-order occlusion artifacts compared with a dedicated GPU depth-buffer renderer.

Verification: all `tests/*.cjs` regression scripts passed after this update.


## CadTech Truss Studio V3.18 reference update

The roof-framing connection and viewport pass was checked against the supplied `CadTech_Truss_Studio_V3_18_Auto_Optimize_On_Analyze_All` source. Roof timber members now use the same natural wood palette as wall framing instead of role-based purple/blue/green colors; face normals drive light/dark shading and cut faces use a wood end-grain tone. The 3D renderer remains the lightweight painter renderer to avoid the earlier per-pixel raster freeze. The top-chord plumb-cut plane normal now points into each member, and end-to-end rafter plumb cuts retain the member side rather than clipping the opposite end. This is a visual/geometry alignment, not a certified reproduction of CadTech's Three.js renderer or its full engineering joint solver.

## v3.19 - 3D view fix (depth-correct framing, no stray spikes, faster orbit)

* **Cause of the swirling / interwoven boards:** `renderer.js` was a painter's-algorithm renderer that drew every face back-to-front by its *average* vertex depth. That cannot order long thin faces (a 9 m chord vs a 0.3 m post, or crossing webs), so members were overdrawn in the wrong order and their outlines swept across each other. Opaque views now use a WebGL depth buffer: each pixel shows the nearest surface and edges are depth-tested. Perspective depth is interpolated correctly across each polygon, concave faces are ear-clipped, and there is no per-pixel JavaScript, so the earlier freeze on large models cannot return. If WebGL is unavailable the previous painter path is used. X-ray is unchanged.
* **Picking** now returns the nearest surface under the cursor (depth-based, orthographic and perspective), not the last-drawn face.
* **Stray spikes:** web/post ends that found no chord to trim against kept their 4x-depth drawing extension (a 360 mm spike at junction-girder valleys on U/T-shaped roofs, 24 on the U test roof). They are now cut back to their true length (`truss-joints.js`).
* **Orbit/zoom speed:** roof framing was regenerated and re-trimmed on every redraw (about 150 ms for an 800-member roof). The draw path now memoises the finished member list on the roof element, its story and its resolved height; editing, schedules and cut lists still call the generator directly. Measured on the U-shaped test roof: solid-model build 153 ms -> 17 ms per frame.
* New regression suite: `node tests/verify-render-depth.cjs` (depth picking in ortho/perspective, per-pixel crossing, concave triangulation, painter fallback, no extended web/post solids). All 20 suites pass.

Not changed: wall-stud generation is still rebuilt per frame (smaller cost than the roof); roof framing remains preliminary and not engineered.

## v3.20 - CadTech-style 3D viewport

The 3D model and 3D framing views now use the same viewport as CadTech (`dist/viewport3d.js`, Three.js from `dist/vendor/`, MIT licence in `THREE-LICENSE.txt`):

* Pale `#f8fafc` background, fine ground grid, 38 degree perspective camera, hemisphere + sun + fill lighting, MeshStandard lumber (roughness .82), translucent slate walls with edge lines, OrbitControls with damping (drag = orbit, right-drag or Shift-drag = pan, wheel = zoom).
* Roof trusses coloured by truss family (Common, Stepdown, Girder, Front jack, Side jack, Hip carrier), or by member role, natural timber or wireframe; wall plates and studs in timber tones.
* **Display layers** panel in 3D framing: top chords, bottom chords, webs & posts, wall framing, roof surface, truss IDs, colour mode. X / Y / Z axis gizmo bottom-left.
* Existing controls are kept and mapped: projection, shading (shaded / materials / hidden line / X-ray), TOP / FRONT / RIGHT / ISO presets (ISO returns to perspective, as in CadTech), view cube, orbit and zoom buttons, Fit, and the Cut plane (applied to the geometry before it reaches the viewport). Click selects the nearest element; Shift-click adds to the selection.
* Geometry is rebuilt only when the model, story, layers or cut change; orbiting and zooming never regenerate framing.
* If WebGL or the module is unavailable the app logs one warning and uses the v3.19 renderer (`renderer.js`) unchanged.

Tests: `node tests/verify-viewport3d.cjs` (recipe, fallback wiring, triangulation) and `python3 tests/browser/viewport3d-smoke.py` (needs `pip install playwright && playwright install chromium`; presets, orbit, zoom, picking, styles, layers, labels, edit/rebuild, view switching).

Not changed: the Cut plane draws no cap fill in the Three viewport (cut faces are coloured instead); selection outlines are a green emissive tint rather than an outline pass.


### V3.47 — all-truss eave overhang correction
The roof-framing generator now extends every truss top chord that terminates at the roof pivot boundary to the corresponding offset roof boundary. This covers front jacks, side jacks, hip carriers, hip trusses, common trusses and girder trusses, using the roof element's overhang setting (default 609.6 mm / 2 ft). Bottom chords and web members are not extended. Regression coverage: `node tests/verify-all-truss-overhangs.cjs`.

## Duplicate top-chord overlap fix (V3.64)
The roof framing display, plan and cut-list now remove near-coincident, parallel duplicate top chords across overlapping roof objects, while retaining intended multi-ply girder members and normal 600 mm O.C. truss members. Run `node tests/verify-near-duplicate-top-chords.cjs` and `node tests/verify-top-chord-duplicates-plumb.cjs`. Five legacy framing tests remain failing as documented in `TOP_CHORD_DUPLICATE_OVERLAP_FIX_V364.md`; inspect the user's exact model in the running 3D viewport before treating complex junctions as complete.

## Common-truss web cleanup (V3.65)
The user-marked red members in the V3.64 screenshot were webs, not duplicate top chords. The green Common-truss web generator no longer repeats a pair of diagonals to a mid-panel top-chord node in every bay. It now places posts/webs at actual chord stations, alternates single diagonals through the interior panels, and includes roof-facet breaks as exact connection stations. Top/bottom chords and all jack/hip/girder web paths are left unchanged. Regression: `node tests/verify-common-truss-web-relayout.cjs`. This is a geometry layout only, not structural engineering verification.

## Closed-truss web relayout (V3.66)
The V3.65 web cleanup was previously limited to green Common trusses. V3.66 applies the same station-based post/alternating-diagonal pattern to closed Hip trusses, Girder trusses, and Junction girders, so roof-facet seams no longer create extra web nodes by themselves. Short open-receiver Front jack, Side jack, and Hip carrier assemblies retain their compact triangular web pattern. Regression coverage: `node tests/verify-all-closed-truss-web-relayout.cjs`. This is geometry-layout logic only; connection design, loads, bracing, and member capacity require engineering verification.


## V3.72 — Overhang correction

Top-chord eave extensions now proceed only outward from the roof perimeter and target the exact configured offset boundary. This prevents an inward-pointing extension ray from crossing the roof and producing overhangs longer than the configured 2 ft. Run `node tests/verify-overhang-outward-bounds.cjs` to verify rectangular and stepped-roof bounds.


## V3.77 connection audit
The truss review includes a 2 mm centerline connectivity audit with unmatched endpoint warnings and invalid-member detection. Run `node tests/verify-connection-audit.cjs`. This is geometry QA only, not structural capacity or connector verification; see `TRUSS_CONNECTION_AUDIT_V377.md`.


## V3.78 structural design-basis readiness

See `TRUSS_STRUCTURAL_READINESS_V378.md`. This release adds engineer-entered design-basis capture and validation while preserving an explicit NOT ANALYSED state. It does not claim to provide a complete code-compliant structural solver.

## V3.79 experimental solver milestone
See `TRUSS_LINEAR_SOLVER_V379.md`. The truss review dialog includes an **Experimental 2D solver** for manually entered planar pin-jointed truss models. It is a linear-elastic axial solver only and is not a code-compliant roof truss design engine. Run `node tests/verify-linear-truss-solver.cjs` to test the benchmark and stability guards.

## Wall framing quality pass — V3.80

- Hosted openings are validated before framing generation. Invalid dimensions, openings extending past the wall axis, sill/head levels outside the wall height, and non-floor-level doors are flagged and omitted from the framing layout rather than producing invalid member geometry.
- Cripple stud stations now follow the same wall-run stud grid as common studs, rather than an unrelated global origin.
- Wall framing panel displays multiple issues instead of hiding all but the first. Its audit also checks member extents and opening header / king-jack support presence.
- Added `tests/verify-wall-framing-audit.cjs` for valid opening framing, near-edge openings, over-height openings and member extent checks.
- These are construction-layout QA checks only. Header sizing, load paths, uplift, hold-downs, shear-wall design, fasteners, fire blocking and code-compliant structural design still require project-specific engineering inputs and verification.
