# V3.86 — Smooth plumb/miter top-chord connections (ridge, bends, eaves, receiving cuts)

## Why V3.85 still showed gaps
Each chord solid starts as a rectangle with a **square end**. V3.85 trimmed it with a plumb/miter plane but never extended the rectangle past the node. The top corner of every chord therefore stayed cut square, leaving a V-notch above each ridge node (the white triangles in your screenshots), while the bottom half was plumb. The same happened at eave ends, at sloped-to-flat bends on girders, and at jack / hip-carrier cuts against a receiving face. Measured on a 13 x 9 m hip roof: 8 of 89 chords had 7-8 faces instead of 6.

## Fix (`dist/truss-joints.js`)
- `joinTrussMembers()`: every chord end that a miter/plumb plane will trim (shared node, eave/exposed end) now starts from a rectangle extended past the node, so the plane trims it to one clean face: plumb at a symmetric ridge, bisector miter at a bend, true plumb at an eave. Receiver ends are not extended here.
- `finishRoofConnections()`: the end ring is extended before the receiving-face clip, so jack/carrier ends meet the girder or carrier face flush, no triangular gaps. Ends already cut to a true plumb plane are no longer re-cut. Faces repeated by two touching supports are dropped.
- From V3.85 (kept): no top chords dropped, bisector miter at shared nodes, vertical plumb at exposed ends.

## Tests
- `verify-top-chord-joint-closure.cjs` now also requires every top chord to be a clean box (6 faces, 4-sided profile); fails on V3.85, passes now (291 shared nodes, 607 plumb ends, hip/gable/L/rotated roofs).
- `verify-render-depth.cjs`: an overshoot allowance for plumb/miter cuts on steep or short chords (section depth x tan(slope)); webs/posts keep the old 1-depth limit.
- All verify-*.cjs pass.

## Not verified
- Not visually checked in the live 3D viewport; I plotted the generated geometry (apex, eave, girder bend, jack-to-carrier) and all show closed plumb/miter faces.
- Miter at sloped-to-flat bends is the bisector (not plumb) so top and bottom edges close exactly.
