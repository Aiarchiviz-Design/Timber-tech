# V3.72 — Exact 2 ft Overhang Boundary Fix

## Problem
Some top chords were extended by ray-casting from a roof perimeter endpoint to the first intersection with any edge of the offset roof boundary. If the member's extension direction pointed inward, the ray could cross most of the roof and hit the opposite perimeter, creating overhangs much longer than the configured 2 ft.

## Fix
- Extend only top-chord endpoints whose continuation points outward from the specific roof-perimeter edge.
- Solve the target by the exact perpendicular offset distance (`roof.overhang`) rather than accepting an arbitrary intersection along an infinite ray.
- Confirm the target lies on the offset roof boundary before applying the extension.
- If no valid outward offset intersection exists, preserve the original endpoint instead of creating a long spike.
- Preserve pitch-derived Z extension and all existing chord, web, hip/jack, girder, wall and plumb-cut logic.

## Verification
- Added `tests/verify-overhang-outward-bounds.cjs`.
- All 41 test files pass, including the 2 ft overhang tests on rectangular and stepped roofs.
- This is a geometry-generation correction, not a structural capacity certification.
