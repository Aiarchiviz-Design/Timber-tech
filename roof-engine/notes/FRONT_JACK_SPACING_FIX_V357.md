# V3.57 — Front Jack 2 ft O.C. Spacing Fix

## Change
Front jack placement now starts one configured truss spacing in from each exposed end of the hip-roof eave, rather than rounding the first position forward to the hip-carrier setback. With the default spacing of 600 mm, this creates front-jack stations at 600 mm (2 ft) O.C. along both eaves and restores the short corner jack assemblies that were omitted.

## Preserved
- Existing side-jack / hip-carrier termination logic from V3.56
- 6 ft hip-girder setback default
- 2 ft top-chord overhang default
- Top-chord continuity and wall/heel logic
- Other framing generation and visual settings

## Verification
- `node --check dist/hip-trusses.js`: passed
- `tests/verify-front-jacks-2ft-spacing.cjs`: passed (28 assemblies, 14 stations along each end, 600 mm O.C.)
- Hip-truss, overhang, and side-jack termination tests: passed
- Three legacy tests (`verify-multi-wing-trusses`, `verify-girder-connections`, `verify-roof-framing`) still fail in the unmodified V3.56 baseline as well; their failures are unrelated to the spacing change.
