# V3.56 — Purple Side-Jack Termination

## Scope

This patch changes only the receiving connection logic for purple side-jack top and bottom chords. Blue front-jack geometry, girder setback, overhang defaults, wall framing, and the remaining truss generators are unchanged.

## Change

- Each side-jack top/bottom chord now carries the ID of its assigned hip-carrier assembly.
- Connection finishing trims a side-jack top chord only against that hip-carrier's top chord, and its bottom chord only against that same carrier's bottom chord. This avoids trimming to an unrelated nearby carrier/girder or a member belonging to another wing.
- The side-jack chord endpoints and 3D solids are checked against the assigned carrier, including multi-wing footprints.

## Verification

- JavaScript syntax checks pass for `hip-trusses.js`, `roof-framing.js`, and `truss-joints.js`.
- Rectangular roof side-jack termination test passes for 12 assemblies.
- Multi-wing side-jack termination test passes for 20 assemblies.
- Existing tests `verify-girder-connections`, `verify-jack-zones`, `verify-multi-wing-trusses`, `verify-render-depth`, and `verify-roof-framing` still fail exactly as they did on the unmodified V3.55 package; these are pre-existing regressions not introduced by this patch.
- No live screenshot of the user's exact project was available for viewport verification.
