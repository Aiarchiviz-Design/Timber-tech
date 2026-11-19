# V3.74 — Truss pitch and connection consistency

## Changes
- Roof-facet sampling now evaluates only facets covering a station (or within a small boundary tolerance); at shared seams it uses the upper roof envelope instead of borrowing an arbitrary plane from a distant wing.
- Redundant collinear facet breakpoints are collapsed so the same top chord is not split into tiny, disconnected pieces by triangulation seams.
- Top-chord endpoints and bottom-chord bearing level now follow the actual roof pitch. The previous fixed heel offset forced a steeper chord angle than the configured roof pitch and caused heel/joint mismatches. This preserves the direct chord-to-chord heel without adding a heel post.
- Wall-plate alignment was updated to match the revised bottom-chord elevation while leaving wall height unchanged.
- Web stations use the panel-count distribution, not extra facet-seam nodes.
- Exact duplicate common/hip bottom chords are removed when decomposed wings produce coincident assemblies; girder plies and jack chords are excluded.

## Verification
- Added a pitch test for sloping common/hip top-chord segments on a 25° hip roof.
- All generated member solids must have finite geometry; no separate heel post is generated.
- JavaScript syntax checks pass.
- Existing multi-wing rotation test still detects a small member-count difference (2 members) between the original and rigidly rotated L-shaped roof. Other tests pass; this remaining decomposition discrepancy is not claimed as resolved.
- Live 3D viewport has not been visually verified.

## Engineering note
This is geometric design-assist only. Member capacity, loading, reactions, bearing, connector design, and bracing still require structural engineering verification.
