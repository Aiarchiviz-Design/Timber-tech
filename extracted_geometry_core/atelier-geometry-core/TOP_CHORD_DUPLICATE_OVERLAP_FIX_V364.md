# V3.64 — Remove Duplicate Top Chords in Overlapping Framing

## User-reported issue
The highlighted roof area still showed two nearby, nearly parallel top-chord solids where only the intended long chord should remain.

## Changes
- Expanded duplicate detection from exact coincident centerlines to near-coincident, parallel top chords with the same section and substantial overlap of the shorter chord.
- Uses a bounded transverse tolerance (no more than 65 mm), a very small direction-angle tolerance, and at least 72% overlap of the shorter member. This avoids suppressing normal 600 mm (2 ft) O.C. adjacent trusses.
- Preserves intentional offset girder and junction-girder plies in fuzzy matching; exact duplicate plies are still collapsed.
- Adds a project-wide top-chord deduplication pass across visible roof elements for 3D rendering and across roofs for the framing plan and cut-list rows. This addresses duplicates that per-roof filtering cannot see when separate roof objects overlap.
- Prefers the longer member when a short near-coincident chord is contained in a longer intended chord.
- Does not change roof shapes, framing spacing, girder setback, overhang, wall heights, or member sizing.

## Regression tests
- `tests/verify-near-duplicate-top-chords.cjs`: verifies near-coincident duplicate removal, retains legitimate 600 mm O.C. members and girder plies, and checks deduplication across overlapping roof objects.
- `tests/verify-top-chord-duplicates-plumb.cjs`: exact duplicate suppression and plumb-cut tests.
- Front-jack termination/spacing and all-truss-overhang tests pass.

## Current test status
29 test files pass. Five broader regressions remain failing, and these same failures existed in the V3.63 baseline: girder connections, legacy jack-zone expectations, multi-wing member count (one member), render-depth spike, and legacy heel-post expectation. The new overlap test passes. The actual saved user model has not been available to reproduce the exact viewport screenshot headlessly; verify the marked roof area in the running app after opening this build.

These routines handle geometric duplicate display/layout filtering only; member capacity, load transfer, and connector design still require engineering review.
