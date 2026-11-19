# V3.85 — Top-chord connections (ridge, hip bends, eave plumb cuts)

## What was wrong in V3.84
1. **Every top chord with an exposed end was deleted.** In `joinTrussMembers()` the plumb-cut clip kept the *outside* of the cut plane, so the profile came out empty and the chord was removed ("Member removed by joint trimming"). On a 13 x 9 m hip roof all 89 top chords vanished; 22 of the 23 failing tests came from this.
2. **Shared-node bookkeeping depended on member order.** The "this end is already jointed" flag was written onto the *other* chord, so the first chord of a pair got a second, wrong cut.
3. **Shared top-chord nodes were cut square to each chord**, not on a common plane. Two chords meeting at a ridge or hip bend therefore left triangular gaps on top and overlaps below (the white/green slivers in the screenshot).
4. **Exposed ends were square-cut inside the truss plane** and then re-cut in world space, leaving a small wedge on the lower corner instead of one true plumb face.
5. The end-cut metadata stored a 2D truss-plane vector as if it were a world vector.

## Fix (`dist/truss-joints.js`)
- Shared top-chord nodes use the bisector miter of the two chords. At a symmetric ridge this is exactly the vertical plumb plane; at a bend (sloped to flat) it closes top and bottom corners with no gap. Each member decides from its *own* shared ends.
- Exposed ends (eave/overhang, free ends) get a true vertical plumb plane through the end node, keeping the member side; metadata now holds the real world-space normal.
- `finishRoofConnections()` no longer re-cuts an end that a shared miter already closed. Receiving-face cuts (jacks/hip carriers onto a girder or carrier) are unchanged.
- Webs, spacing, overhang, jack layout and the V3.64 girder-clearance logic are untouched.

## Tests
- New `tests/verify-top-chord-joint-closure.cjs`: hip, gable, L-shaped and rotated (33 deg, -20 deg) roofs at 600 / 609.6 spacing. Checks no top chord is dropped, 607 exposed ends are vertical plumb, and 291 shared nodes have identical cap corners on both members. Fails on V3.84, passes now.
- `tests/verify-rotated-plumb-cut.cjs` previously matched the old source text; it now runs the behavioural check instead.
- Full suite: all verify-*.cjs pass (V3.84: 23 failed).

## Not verified
- Live 3D viewport not visually checked; please re-inspect the boxed areas in your roof.
- Some jack webs are still removed by joint trimming on short jacks (unchanged from V3.84).
- Geometric design-assist only; connector/plate design needs engineering.
