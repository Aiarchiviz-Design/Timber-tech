# Common-Truss Web Cleanup — V3.65

## User-requested correction
The highlighted members in the V3.64 screenshot were webs, not top chords. The green Common-truss web pattern was too busy because each bay used a pair of diagonals meeting at a mid-panel top-chord node, repeated across the truss.

## Change
- Applies only to `Common truss` web generation.
- Removes the repeated midpoint V-pairs and redistributes the remaining webs to actual chord stations.
- Adds posts/webs at raised interior stations and alternating single diagonals through the interior panels.
- Includes all roof-facet breaks as stations, so web endpoints land on the generated top chord rather than on a separately sampled roof plane.
- Skips end-panel diagonals at the heel, avoiding web members that duplicate the sloping top chord or bottom chord.
- Keeps all top chords, bottom chords, the 2 ft O.C. spacing, colors, and `Front jack`, `Side jack`, `Hip carrier`, `Hip truss`, `Girder truss` web logic unchanged.

## Verification scope
`tests/verify-common-truss-web-relayout.cjs` validates web counts, confirms the old mid-panel V nodes are gone, verifies station-aligned posts and alternating diagonals, and checks that other truss roles and overhang geometry remain present. The new web pattern is preliminary geometry only, not a structural design or capacity check. A qualified truss designer/engineer must verify loads, members, bearings, bracing, and connections before construction.
