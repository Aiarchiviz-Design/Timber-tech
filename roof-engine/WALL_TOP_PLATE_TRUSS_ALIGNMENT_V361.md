# V3.61 — Wall top-plate / truss bottom-chord alignment

## Behavior
- Default wall-bearing story heights are 10 ft (3048 mm); the default ground and first-floor story elevations are coordinated to those heights.
- New walls default to 10 ft (3048 mm).
- While a roof uses the truss framing system, its elevation is automatically adjusted so the underside of the truss bottom chord meets the top face of the wall top plate.
- The auto-alignment runs after model edits and after BIM JSON import, and includes all walls on the roof's story (not only currently visible walls).
- Wall heights themselves are not changed by the auto-alignment; roof elevation is adjusted to meet the wall plate level.
- Existing imported wall/story heights are preserved; existing custom heights remain editable.
- The manual roof alignment action remains available.

## Alignment relationship
For a truss-framed roof, the target roof pivot elevation is:

`wallTopPlateZ + roofSkinDrop + heelHeight + bottomChordDepth`

The generated bottom chord centerline is one half chord-depth above its underside, so this places its underside at the wall top-plate top face.

## Verification
- Added `tests/verify-wall-top-plate-truss-alignment.cjs` to verify 10 ft wall height is preserved and the bottom chord underside aligns at generation and after edits.
- 27 tests pass in the project test set; 5 broader tests already fail against the prior V3.60 baseline (girder connection penetration, jack-zone containment, multi-wing member count, render-depth member solids, and a legacy heel-post expectation).
- No live browser viewport visual verification was performed.
