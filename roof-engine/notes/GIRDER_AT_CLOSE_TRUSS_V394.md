# V3.94 — Girder moves onto a too-close truss; side jacks start 2 ft from the girder

## Point 1 — truss closer than one spacing to the end girder (red-marked truss)
Common/hip trusses are laid out from the near hip-end girder at one spacing O.C. If the last station on the far hip end would land closer than one
spacing to that girder, that truss is **not generated** and the far girder moves onto its station instead. The girder setback is therefore larger than
the 6 ft default in that case, and the hip carriers, front jacks and side jacks of that end follow the new girder position. Rules/limits:
- only exposed hip ends are adjusted (a wing junction end keeps its junction girder);
- the move is skipped if it would push the girder past 90 % of the hip run (keeps the hip-carrier geometry valid);
- if the last truss is already one spacing or more from the girder, nothing changes.

## Point 2 — missing jack at 2 ft from the girder
With the girder moved out, the old side-jack layout (stepping from the eave) could leave a gap of about 4 ft next to the girder. When that happens the
side jacks now start one spacing from the girder and step toward the eave; a leftover gap wider than 1.1 spacing at the eave is split evenly with one
extra station (never closer than the 12 in minimum). The default (un-moved) layout is unchanged.

## Files
`dist/hip-trusses.js` (end-setback logic, side-jack stations), `dist/roof-framing.js` (drops orphan webs of a truss whose chords were consumed
at another wing's girder line).

## Tests
New: `tests/verify-girder-moves-to-close-truss.cjs`. Updated for the moved girder: `verify-no-purple-side-jack-at-girder`, `verify-jack-zones`,
`verify-girder-connections`. Full suite passes except `verify-roof-framing.cjs`, which also fails in the V3.93 baseline.

## Known limit
In a nested multi-wing plan, a moved girder can land on the same grid line as an abutting wing's truss; that truss is then absorbed at the girder line
(webs are no longer left floating). Live 3D viewport not visually verified.

## V3.94b — front jacks start 2 ft from the orange truss
Front-jack stations are now anchored at every hip end that has no hip carrier (the roof continues flush there): the first blue jack sits exactly one
spacing from that orange girder/junction truss, stepping toward the other end. A gap wider than 1.1 spacings left at the far end is split evenly
(never below 12 in). Carrier ends and plain rectangular roofs are unchanged. Test: second half of `verify-girder-moves-to-close-truss.cjs`.
