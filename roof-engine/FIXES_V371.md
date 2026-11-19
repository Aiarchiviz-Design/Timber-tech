# V3.71 — Girder Connections, Jack-Zone Bounds, Render Depth, Roof Framing

This focused maintenance release fixes four regression areas in the V3.70 advanced truss generator.

## Girder connections
- Front-jack assemblies now bind explicitly to the nearest girder ply when they terminate at the girder, while corner-zone front jacks remain bound to their assigned hip carrier.
- Jack chords are trimmed against the correct receiving assembly, including 1–4 girder plies and rotated roof footprints.
- Receiving-face cuts are retained instead of being overwritten by the exposed-eave plumb-cut pass.

## Jack-zone bounds
- Jack-zone tests now use the specified setback for the test roof rather than assuming a historical 1200 mm value.
- The application default remains 1828.8 mm (6 ft), while explicitly saved custom setbacks (including 1200 mm) are preserved.

## Render depth
- Chord ends are no longer extended by four section depths as a temporary trimming workaround; this removed 760 mm spikes at short roof-facet seams.
- Webs/posts retain temporary overrun for chord-face trimming and are cut back when no chord is found.

## Roof framing
- Sectional trusses with a small number of usable interior chord stations now receive web members; the minimum usable station check was lowered from four to two, matching the web generator's supported minimum.
- The conventional heel remains a direct top-chord/bottom-chord joint with no separate heel post.

## Verification
- Girder face trimming: 1–4 plies, setbacks 1000/1200/1750 mm, and rotated roof tests pass.
- Jack-zone bounds, render-depth, roof-framing, truss-joint, front-jack/hip, side-jack/hip, and overhang tests pass.
- All project test files are run before packaging. Structural capacity and connection design remain outside this geometry-only verification.
