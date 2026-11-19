# CadTech Wall Panel Studio — Wall Framing QA Report

**Audit date:** 29 October 2026  
**Scope:** Wall framing generation, IFC-to-wall framing pipeline, openings and headers, junction details, panel splitting, metric wall layout/elevation reporting, OSB takeoff, legacy report adapter, and laptop launcher.

## Changes made

- Fixed IFC framing pipeline reporting so it calls a real/injected wall-framing generator, counts generated members, and records per-wall layout status and issues. Missing generation is now explicitly marked `not-generated` rather than silently returning a zero-member success.
- Corrected the IFC smoke test to use the same browser wall generator in an isolated Node VM and to verify all four sample walls have generated/auditable member layouts.
- Added checks for door/window framing members, finite member coordinates, wall-boundary fit, automatic versus fixed header depth, malformed/out-of-bounds openings, and overlapping openings.
- Unified the legacy wall-assembly report route with the current metric wall package generator so legacy exports do not keep the old imperial sample cut list or a simulated engineer seal.
- Improved room-plan dimension-chain spacing and moved exterior opening labels to prefer the room-facing side where possible, avoiding dimension-string collisions found during rendered-PDF review.
- Added a Python standard-library launcher (`Run_CadTech_Wall_Panel.py`) and Windows click launcher (`RUN_CADTECH_WALL_PANEL.bat`). The launcher checks Python/Node/npm, installs the locked dependencies on first run, finds an available local port, waits for `/api/health`, opens the browser, and logs startup errors.
- Removed the no-longer-needed `tsx` and direct `esbuild` dev dependencies in favour of Node 22.12+ built-in TypeScript type stripping for `server.ts`. Updated the lockfile root dependency metadata and removed the now-unused toolchain package entries.

## Verification results

| Check | Result |
|---|---|
| Metric wall-panel package tests | 12 checks passed |
| Ireland design-profile tests | 4 checks passed |
| Wall-height/head-level/plan-elevation tests | 3 groups passed |
| Internal junction options | 4 tests passed |
| Opening/cripple/corner test | Passed |
| IFC import and member takeoff | Passed; 4 walls, 294 framing-member records, 2 headers, zero sample wall issues |
| Wall framing audit | Passed; valid member extents, openings, header modes, invalid/overlapping opening checks |
| Combined room report generation | Passed; 6 panels and 9 PDF pages |
| Legacy wall report adapter | Passed; uses the metric wall package generator |
| Root JS/MJS syntax, TypeScript server parse, Python launcher compile | Passed |
| Python launcher diagnostic mode | Passed on Python/Node/npm in this environment |
| ZIP integrity | Run on final deliverable before release |
| Full dependency install / Vite server smoke test | **Not verified in this environment**; npm registry fetch failed (`EAI_AGAIN`/uncached package), so dependencies could not be installed here |

## PDF visual review

Rendered and visually reviewed the sample combined PDF (`WALL_FRAMING_QA_ROOM_SAMPLE.pdf`). It contains an overall dimensioned wall-framing plan, room/opening labels, individual wall elevations, opening schedule, metric cutting list, timber volume, 12 mm exterior OSB piece schedule, and a schematic wall top-plan strip below each panel elevation. The sample report is generated from a test BIM model, not a user project.

## Important limitations

- This is a layout/framing report QA pass, not a structural certification. Member sizes, loads, headers, lintels, hold-downs, OSB diaphragm/racking capacity, fastener schedules, fire/acoustic requirements, and Irish/other local code compliance must be verified for the actual project by the responsible design professional.
- The full application could not be installed and started in this isolated environment because npm package download failed. On the laptop, the first normal launcher run requires Node.js 22.12+ and an internet connection to run `npm ci`; afterwards the app runs locally.
