# V3.75 — Truss joint stability and pitch preservation

## Changes
- Added a narrowly bounded web-endpoint snap (8 mm) to the nearest top/bottom chord in the same truss assembly before joint trimming. It only moves non-chord web/post endpoints already within tolerance; it does not alter chord endpoints, pitch, or external jack-to-carrier assignments.
- Corrected the top-chord plumb-cut plane to use the member's actual horizontal run direction, rather than a fixed world-X plane. This keeps plumb cuts aligned to the truss plane on rotated and multi-wing roofs.
- Activated the existing exact duplicate common/hip bottom-chord cleanup in the final roof-framing pipeline, so duplicate bottom chord entries are removed together with the already-deduplicated top-chord geometry where endpoints truly coincide.
- Kept configured roof pitch, panel distribution, overhang, girder setback, wall alignment, and jack/hip receiver routing unchanged.

## Verification
- Web endpoint snap test passes; a top chord's angle is unchanged and web endpoints within tolerance snap to their own assembly chords.
- JavaScript syntax checks pass.
- All prior tests pass except `verify-multi-wing-trusses.cjs`, which still reports a 2-member count difference (767 vs 765) when rotating a complex L-shaped roof. This remaining rotation-sensitive trimming/decomposition issue is not claimed as fixed.
- Live 3D viewport not visually verified.

## Engineering note
This remains geometric design-assist software, not a substitute for structural load, member capacity, connection, bearing, deflection, and bracing design.
