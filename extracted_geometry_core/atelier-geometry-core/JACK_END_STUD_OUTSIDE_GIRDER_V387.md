# V3.87/V3.88 — Jack/carrier end stud placed beside the girder (side connection)

## Problem
The vertical end web ("corner stud") of every front jack, side jack and hip carrier was generated at the jack's end node, which is the receiving girder's centerline (or the carrier's centerline). The stud solid therefore sat inside the girder plies.

## Fix (`dist/hip-trusses.js`)
- The end stud is moved back along the jack, toward the eave, to stand against the receiver's SIDE face:
  - girder: half the ply stack (`girderPlies x width / 2`), measured along the jack axis for skewed approaches;
  - hip carrier: half the carrier width, measured along the jack axis using the carrier's real plan direction;
  - plus half the stud depth and an allowance for the stud's own width on a skewed face.
- A jack that lands on a carrier right where the carrier meets the girder clears BOTH receivers (the farther face wins).
- The stud still runs from the bottom chord to the top-chord centerline, so it joins both chords, and the terminal triangular web now closes on the stud with its apex mid-bay. Very short jacks (stud would need more than half the span) keep the old end node.
- Chords, receiving-face cuts, jack layout, spacing and girder logic are unchanged.

## Tests
- New `tests/verify-jack-end-stud-outside-girder.cjs`: 220 end studs on rectangular and multi-wing hip roofs, 2- and 3-ply girders; none intrude into a girder ply stack or a hip carrier. Fails on V3.86 (e.g. R:RF-15 inside the stack).
- `verify-open-truss-end-webs.cjs` now expects the stud ends to lie ON the top and bottom chords near the receiver instead of exactly at the end nodes.
- Full suite passes.

## Not verified
- Not checked in the live 3D viewport; I plotted the generated plan and elevation of a jack end against the girder (stud stands flush on the girder face).
- Geometry only; stud-to-girder fastening needs engineering design.

## V3.88 — scope check: all front jacks, side jacks and hip carriers (hip rafters)
The same rule already applies to every open-receiver assembly: front jacks (to girder or to hip carrier), side jacks (to hip carrier) and hip carriers (to girder). The regression test now proves it on a wider matrix:
- rectangular, small, multi-wing and rotated (33 deg, -20 deg) hip roofs; girder plies 1-4; hip setback 900-1828.8; pitch 18-35 deg; spacing 400-609.6.
- 504 end studs (344 front jack, 80 side jack, 80 hip carrier): every one is moved off the receiver end node, and NO web of any truss (jack, carrier, common, hip, girder) intrudes into a girder ply or a hip carrier.
- Assemblies too short to need a stud (jack top and bottom chords nearly meet at the eave end) get no end stud, as before.
- Code is unchanged from V3.87; only the test coverage grew.
