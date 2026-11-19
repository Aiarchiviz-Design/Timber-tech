# V3.60 — Omit Purple Side-Jack at Girder Zone

## Focused change
- Suppresses the purple `Side jack` station nearest to the girder when its setback gap is no more than one nominal truss spacing plus member width.
- Leaves the blue `Front jack` generation and central blue jack-to-yellow-girder connection path unchanged.
- Keeps remaining purple side jacks connected to their assigned pink hip carriers with both top and bottom chords terminating at the receiving carrier.
- Preserves the 6 ft default girder setback, 2 ft overhang, and remaining roof / wall framing behavior.

## Verification
- JavaScript syntax check passed.
- Added `verify-no-purple-side-jack-at-girder.cjs`: passed; no purple side-jack at the girder-adjacent station for a standard 6 ft setback / 2 ft spacing case, while the remaining purple side jacks, blue front jacks, and girder trusses are present.
- Side-jack 3D carrier connection tests (rectangular and multi-wing) passed.
- Side-jack stop-at-hip test passed.
- Front-jack 2 ft O.C., top-chord continuity, all-truss overhang, and hip-truss tests passed.
- The complete suite still reports the same five failing test files as the V3.59 baseline: girder connections, jack zones, multi-wing trusses, render depth, and roof framing. The multi-wing member count has changed as intended because side-jack stations near girders are omitted; its remaining assertion differs by one under rotation in both baseline and updated code.
- Live 3D viewport not visually verified.
