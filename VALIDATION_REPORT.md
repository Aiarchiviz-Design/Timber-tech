# Wall Framing QA and Validation Report

This report describes checks run against this project package. It is not a structural engineer's certification or a substitute for checking the actual building model.

## Passing checks

- Metric wall-panel package tests: 12 checks passed.
- Ireland design profile and load-register tests: 4 checks passed.
- Wall-height, head-level, header-depth and wall-plan/elevation checks passed.
- Internal wall junctions: all 3 options passed, plus legacy selector compatibility.
- Opening corner cripple tests passed.
- IFC import regression generated framing members and takeoff: 294 members, including 55 common studs, 4 king studs, 4 jack studs, 2 headers, 2 rough sills, 17 cripples, 8 top-plate runs and 5 bottom-plate runs; no wall issues for the fixture.
- Wall framing audit passed real-member, header-height, invalid/overlapping-opening, and fixed-header failure tests.
- Wall PDF adapter tests passed, including PDF cross-reference validation, wall elevation, plan, opening schedule, metric labels and exterior 12 mm OSB schedule.
- Four-wall room fixture generated framing for all four walls, with 6 panels and a 9-page combined PDF.
- 128 JavaScript / ECMAScript source and test files passed `node --check`.
- Python launcher compiled, its `--check` diagnostic ran successfully, and nine dependency-free launcher/package-lock unit tests passed.
- Fixed Windows launch failure caused by nested quoting of `npm.cmd`: the launcher now invokes `node.exe` with `node_modules/npm/bin/npm-cli.js` directly, avoids `cmd.exe` re-parsing, and has regression tests for install paths containing spaces such as `C:\Program Files\nodejs`.
- Single-wall wall-plan QA was improved to dimension the wall thickness on a degenerate axis instead of displaying a misleading `0 overall` label.
- `package.json` dependency maps match the package-lock root; removed the no-longer-needed direct `tsx`/`esbuild` launcher dependencies, pruned their unused resolved package entries, and switched the server launcher to Node 22 native TypeScript stripping.
- ZIP archive integrity is checked again on the final deliverable.

## Build limitation

The full Vite production build was not verified in the current execution environment. Dependency installation was attempted from both the working tree and a clean extraction of the final package, but registry access did not complete (the first attempt returned `EAI_AGAIN`; the second timed out). Run `npm ci` and `npm run build` on a laptop with working internet access to verify the application bundle there.

## Older non-gating repository scripts

Some older roof/takeoff scripts are out of sync with the current module exports (for example, a legacy IFC BOM script imports `generateIFCWallBOM`, which the current `takeoff.js` does not export). They are not included in the maintained `test:wall-panels` command and do not change the passing wall report regression results. They should be updated separately before treating the entire historical repository test collection as green.

## Engineering boundary

These tests verify software geometry, layout generation, material/report formatting and PDF structure using synthetic fixtures. They do not certify structural capacity, fastener design, wall bracing, OSB shear resistance, load paths, anchorage or compliance for a real project. Project-specific design values and construction drawings require review by the responsible engineer.
