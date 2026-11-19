# V3.92 — L/T/U hip roofs: no hip carrier / side jacks on the junction side

## Problem
In an L-shaped hip roof, the wing that owns a hip end generated its pink hip carrier and purple side jacks on BOTH sides of that end, even on the side where the adjoining wing's roof runs on flush. No hip line exists there (the roof plane is continuous), so those members were redundant and cluttered the junction.

## Fix (`dist/hip-trusses.js`, `generateHipTrussSet`)
- For each hip end and each side (y0 / y1), sample the wing's side edge over the carrier zone. If it is not a real roof-boundary edge, that side is a junction side (`sideFlush`).
- Junction side: no Hip carrier, no Side jacks. Front jacks (blue) keep their full reach to the girder instead of shortening toward a hip line.
- Exposed corners (real hips) are unchanged. Standalone rectangles are unchanged.

## Tests
- New `tests/verify-junction-side-no-hip-carrier.cjs` (two L orientations). All other verify-*.cjs still pass.

## Not verified
- Not checked in the live 3D viewport; checked via generated plan views. Geometry only, not structural design.
