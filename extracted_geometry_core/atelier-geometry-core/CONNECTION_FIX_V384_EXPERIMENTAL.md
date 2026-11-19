# V384 experimental top-chord connection correction

This build changes `dist/truss-joints.js` so a top-chord endpoint that already participates in a shared top-chord joint is not subjected to a second generic plumb-cut clipping pass. The duplicate clipping was a plausible source of triangular slivers and visible gaps at ridge/hip corners.

## Validation status
This is an experimental geometry correction, not a verified production fix. `node tests/verify-truss-joints.cjs` still fails its shared peak-face assertion. Do not use this build for fabrication or structural approval until that regression is resolved and the actual roof model is visually rechecked.
