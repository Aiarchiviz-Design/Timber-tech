# Open truss end webs — V3.69

## User-requested change
Add the receiving-end web to all blue front-jack, purple side-jack, and pink hip-carrier assemblies, and ensure the web remains visible as a properly fitted 3D member rather than being embedded in or overrun by adjacent chords.

## Change made
- `hip-trusses.js` already generated an `endWeb` member for each open-receiver assembly; the rendering/geometry pipeline had been deliberately excluding those members from the truss-plane joint trimming stage.
- `truss-joints.js` now includes end webs in their assembly's joint-solving group, so the web is clipped to the actual top- and bottom-chord faces.
- End webs remain excluded from generic external receiver trimming, preventing a nearby girder/hip from shaving the post at the wrong location.
- Blue front-jack, purple side-jack, and pink hip-carrier chord layouts and endpoints are unchanged.

## Verification
- `verify-open-truss-end-webs.cjs` now asserts every receiving-end web exists, has 3D cut faces, and records connections to both a top and bottom chord.
- Rectangular fixture: 40 receiving-end webs checked.
- Multi-wing fixture: 55 receiving-end webs checked.
- JavaScript syntax checks and full archive integrity check passed.
