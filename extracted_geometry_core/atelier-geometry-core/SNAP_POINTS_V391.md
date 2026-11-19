# V3.91 — More snap points (walls on all sides, openings, curves, shapes)

## Before
Snapping only used element reference points: wall centerline endpoints, segment midpoints, intersections of centerlines, perpendicular/tangent, and "on line". A wall's inside and outside faces had no snap points at all.

## Now (plan view, `dist/advanced.js` `advancedSnap`)
- **Walls, all sides:** centerline endpoints and midpoint; every joined face corner ("Wall corner"), both face midpoints, both face lines ("On face"), intersections of face lines, thirds and quarters on the centerline and on both faces.
- **Doors / windows:** opening centre, jambs on the centerline and on both wall faces ("Jamb", "Opening face").
- **Circles / arcs:** centre, four quadrants, arc end points, any point on the curve ("On curve"); tangent and perpendicular kept.
- **Closed shapes (slab, roof, zone, polygon):** every vertex, edge midpoint/thirds/quarters, shape centre.
- Priority: endpoints/corners, midpoints, centres/quadrants/openings, intersections, thirds/quarters, lines. Within a tier the nearest point within 10 px wins.
- The cursor now shows a square marker plus the snap name (e.g. "Wall corner", "Jamb"), also while dragging grips/elements.
- Geometry is cached per model state, so snapping stays fast (400 snaps on 200 walls < 4 s in test; typically milliseconds).

## Tests
- New `tests/verify-snap-points.cjs`; existing `verify-advanced.cjs` still passes (midpoint/intersection/tangent behaviour unchanged). Full suite passes.

## Not verified
- Not checked with a real mouse in the browser. Snap radius is unchanged (10 px). Section/elevation views keep their previous snapping.
