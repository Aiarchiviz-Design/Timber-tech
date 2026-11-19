# V3.63 — Duplicate Top-Chord and Plumb-Cut Fix

## Changes

- Suppresses generated top-chord members that occupy the same complete 3D centerline and have the same section; distinct girder plies with separate centerlines are retained.
- Removes a fully contained, same-line duplicate top-chord piece when it has the same type and section, avoiding overlapping timber at corners.
- Applies a real vertical plumb-cut clipping plane to top-chord ends that do not terminate into a receiving chord.
- Keeps hip/girder receiving ends on their receiving-face trim path, whose cutting plane is vertical; records end-cut metadata for inspection and tests.
- Does not change wall heights, spacing, girder setback, overhang settings, or generated truss layout parameters.

## Verification

- Targeted duplicate-top-chord and plumb-cut test passes, including a geometry check for vertical end-cap faces.
- Existing side-jack/hip-carrier, front-jack spacing, continuity, and overhang tests pass.
- Five tests also fail on the unmodified V3.62 baseline: `verify-girder-connections.cjs`, `verify-jack-zones.cjs`, `verify-multi-wing-trusses.cjs`, `verify-render-depth.cjs`, and `verify-roof-framing.cjs`. This patch leaves the same five baseline failures; it does not add a new failing test.

Truss sizing, loads, bearing capacities, and connector design remain preliminary and require engineering verification.
