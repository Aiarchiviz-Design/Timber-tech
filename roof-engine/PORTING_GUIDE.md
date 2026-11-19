# Porting guide: Atelier geometry core

This bundle contains the 2D drafting, 3D viewport, wall modeling and framing, roof modeling, and truss/rafter generation code from the Atelier BIM Studio. It is plain browser JavaScript (no build step) and uses one shared global scope.

## What is in here

| Area | Files |
|---|---|
| App state, 2D plan, tools, properties, save/open, OBJ/CSV export | `dist/app.js` |
| Wall joins, cleaned wall polygons, solid cells, wall snaps | `dist/joins.js` |
| Wall framing (studs, plates, headers, cut lists) | `dist/framing.js`, `dist/framing-plan.js` |
| 3D projection, camera, visible edges, shading | `dist/camera.js`, `dist/renderer.js`, `dist/viewport3d.js` |
| Drafting: snaps, dimensions, tracker, arrays, mirror, rotate, align | `dist/advanced.js`, `dist/editing.js`, `dist/trim.js` |
| Roof footprint and roof solids | `dist/roof.js`, `dist/roof-footprint.js` |
| Truss generation (common, hip, girder, jacks, carriers, webs) | `dist/roof-framing.js`, `dist/hip-trusses.js` |
| Truss joints, plumb/miter cuts, end webs | `dist/truss-joints.js` |
| Truss review, connection audit, experimental 2D solver | `dist/truss-optimizer.js` |
| Tests that pin the behaviour | `tests/*.cjs` |
| Change history and rationale | `*.md` |

## Running it

    node preview.cjs      # then open http://127.0.0.1:4180/
    node tests/verify.cjs
    node tests/verify-walls.cjs
    node tests/verify-advanced.cjs

No install is needed. `dist/vendor/` contains three.js (MIT, see `THREE-LICENSE.txt`).

## Load order (from `dist/index.html`)

joins, framing, camera, advanced, trim, editing, renderer, framing-plan, roof-footprint, roof, truss-joints, hip-trusses, roof-framing, truss-optimizer, app, viewport3d.

Keep this order. Scripts are plain globals; a later file may call functions defined in an earlier one, and `app.js` must come after the modules it drives.

## Dependency map

Every module reads and writes these globals, which are owned by `app.js`:

- `model` (project: stories, elements, walls, openings, roof objects)
- `view`, `scale`, `baseScale` (plan/3D view state)
- `tool`, `points`, `selected`, `drag`, `hover`, `snap`, `layers` (interaction state)
- `ctx`, `canvas` (2D drawing surface)

Cross-file calls (from the import analysis of this build):

- `app.js` calls into advanced, camera, editing, framing-plan, framing, joins, renderer, roof-framing, roof, trim, truss-optimizer.
- `roof-framing.js` calls into advanced, app, camera, framing, hip-trusses, roof-footprint, roof, truss-joints, truss-optimizer.
- `hip-trusses.js` calls into app, camera, roof-footprint, roof-framing, roof.
- `truss-joints.js` calls into app, joins, roof-framing, roof.
- `roof.js` calls into advanced, app, camera, joins, roof-footprint, roof-framing.
- `joins.js` calls into advanced, app, framing.
- `framing.js` calls into app, joins, roof-framing.

## Porting options

1. **Whole core (recommended).** Copy `dist/` as is and keep the global names. This is the only option that works without changes.
2. **Geometry only, no UI.** Keep `joins.js`, `framing.js`, `roof.js`, `roof-footprint.js`, `roof-framing.js`, `hip-trusses.js`, `truss-joints.js`. Each reads `model` and `settings` objects; provide them with the same shape the tests build (see `tests/verify-walls.cjs`, which loads these files in a `vm` sandbox with a stubbed `model` and `ctx`). Expect to remove `ctx`/`canvas` references in the draw functions (`draw*`, `render*`), which are only needed for the UI.
3. **Namespace it.** Wrap each file in a module and pass `model` and settings explicitly. This is real refactoring work: the modules reference each other's helpers by bare name, and no module boundary exists yet.

Option 2 is the most practical starting point: the tests in `tests/` already demonstrate headless use of the generators.

## Known limits (from the project's own notes)

- Geometry-only design-assist. It is not a structural design: no loads, capacities, connectors or code checks. See `TRUSS_STRUCTURAL_READINESS_V378.md` and `TRUSS_LINEAR_SOLVER_V379.md`.
- Curved, slanted, tapered and profile walls are not supported.
- Snap and framing behaviour was verified with headless tests and plan/elevation plots, not in a live browser for every release. Recheck in your target app.
