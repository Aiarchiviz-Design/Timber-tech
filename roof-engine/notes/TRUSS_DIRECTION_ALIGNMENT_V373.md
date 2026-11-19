# V3.73 — Multi-wing truss direction alignment

## Change
- Multi-wing hip-roof decomposition now derives a shared truss-run axis from the dominant (largest) roof wing.
- Each smaller wing chooses the rectangle edge aligned to that shared axis instead of independently choosing its own longest edge.
- This prevents L-shaped wings from rotating their truss direction 90 degrees relative to the dominant roof area.
- Rectangle ordering uses rounded, deterministic tie-breaks to reduce direction changes from floating-point noise.

## Preserved
- 2 ft overhang and existing overhang clipping.
- 6 ft girder setback and 2 ft side-jack offset.
- Existing top/bottom chord and web generation, wall alignment, plumb cuts, and connection handling.

## Verification
- JavaScript syntax check: passed.
- Multi-wing direction consistency test: passed.
- Existing test suite: 41 passed, 1 legacy multi-wing rotation member-count assertion differs by one member (958 vs 959) after the direction alignment change. This needs further investigation; no claim of a fully clean regression suite is made.
- Live viewport has not been visually verified.
