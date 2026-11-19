# Plumb-cut perimeter-end correction — V3.68

## Issue addressed
Some exposed roof-edge/top-chord ends retained a sloped or square/mitered end because a nearby higher-ranked carrier or girder was inferred as a receiver. That inferred receiver cut overrode the intended vertical plumb cut.

## Correction
- Detects exposed top-chord and rafter endpoints on the roof's outer overhang boundary or original roof perimeter.
- Uses a tight XY boundary tolerance so interior ridge ends near a gable edge are not incorrectly treated as eaves.
- Gives exposed perimeter plumb cuts priority over proximity-only receiver inference.
- Skips receiver-face trimming at those perimeter endpoints and applies the vertical world-space plan-normal cut.
- Leaves interior hip/ridge/girder receiving-face cuts intact, and does not alter chord endpoints, truss spacing, webs, overhang values, or other geometry.

## Validation
- Added `tests/verify-plumb-cut-perimeter-priority.cjs`.
- The test generates a hip roof and verifies 58 exposed perimeter top-chord ends have explicit vertical plumb metadata and end-cap polygons in the correct vertical plane.
- `tests/verify-plumb-cut-worldspace.cjs` passes, including the existing 14-degree rafter fixture.
- All JavaScript source files pass `node --check`.
- Full suite: 34 pass, 4 fail. The four failures are the same baseline failures reported for V3.67: girder-connection joinery expectation, jack-zone bounds expectation, render-depth overrun, and legacy heel-post expectation.
- No live application viewport screenshot was generated, so confirm final appearance in the running project.
