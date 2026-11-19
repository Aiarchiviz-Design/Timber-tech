# V3.58 — Front Jack Top-Chord Hip Termination Fix

## Issue
In the previous build, blue front-jack top-chord endpoints were sampled from the roof facet even when the endpoint was on the plan trace of a pink hip carrier. Those roof-plane elevations could differ from the actual straight hip-carrier chord elevation, making the rendered blue top chord appear to cross/overrun the hip truss.

## Change
- Front-jack endpoints that fall on a finite hip-carrier segment now use the carrier's interpolated 3D top-chord elevation.
- Those corner-zone front-jack top chords carry the exact receiving hip-carrier assembly ID, and the joint trimmer is restricted to that carrier's top chord.
- Front-jack stations that reach the central girder are not incorrectly forced onto an end hip carrier; the existing girder trim logic remains in charge there.
- Bottom-chord/girder support geometry, blue front-jack 2 ft O.C. placement, purple side-jack logic, 6 ft girder setback, 2 ft overhang, and heel logic are preserved.

## Verification
- `node --check dist/hip-trusses.js`: passed.
- `node --check dist/truss-joints.js`: passed.
- `tests/verify-front-jack-stop-at-hip.cjs`: checks 3D endpoint coincidence with the assigned hip carrier and that trimmed member faces stop at the receiving carrier face; retains all 28 2 ft O.C. front-jack stations.
