# Closed-Truss Web Relayout — V3.66

## User request
The V3.65 cleanup corrected the green Common-truss web pattern, but some other truss families still had repeated midpoint V-pair webs.

## Change
- Applies chord-station-based web layout to closed **Hip truss**, **Girder truss**, and **Junction girder** assemblies as well as the previously corrected Common trusses.
- Uses nominal panel stations for the non-Common closed trusses; roof-facet breakpoints alone no longer create additional web nodes.
- Interpolates web-node elevations along the actual segmented top chord, so posts and alternating diagonals connect at real chord stations.
- Preserves the already-corrected Common-truss layout.
- Preserves compact triangular web geometry for short open-receiver Front jack, Side jack, and Hip carrier assemblies.
- Does not change top chords, bottom chords, truss spacing, overhang, girder setback, or wall alignment.

## Verification scope
`tests/verify-all-closed-truss-web-relayout.cjs` checks that hip/girder webs end at nominal chord stations and contain fewer than two midpoint diagonals per bay. Existing Common-truss, hip-truss, jack connections, spacing, overhang, syntax and ZIP checks should also be run.

The generated web layouts are preliminary geometry only. This is not a member-capacity or connection design; truss topology, loads, support reactions, bracing and connectors require verification by a qualified truss designer or structural engineer before construction.
