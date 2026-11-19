# Advanced Truss Generation — V3.70

## Added geometry controls

- Selectable web topologies: **Fink/W, Howe, Pratt, Warren, Queen post, King post**.
- Configurable panel count: **0 = Auto**, or **4–24 panels**.
- Panel count and web pattern regenerate both standard sectional trusses and closed common/hip/girder/junction-girder assemblies.
- Web members are generated between chord stations; repeated mid-panel V pairs are not emitted by the selected topology generator.
- Existing blue front-jack, purple side-jack and pink hip-carrier end-receiver geometry remains on its separate path.
- Existing 2 ft overhang, 6 ft girder setback, 2 ft nominal spacing, wall-plate alignment, and plumb-cut work are retained.
- Framing property controls now identify this as advanced truss geometry/design-assist rather than a fully engineered truss system.

## Important limits

This is an advanced **geometric layout** generator, not a certified structural truss design solver. The topology selector does not prove member forces, timber grade/capacity, buckling, deflection, reactions, bearing lengths, connector/plate capacity, ply fastening, permanent bracing, temporary erection bracing, or code compliance. The optimizer remains a geometry-review register. A qualified engineer/manufacturer must complete design and approve fabrication/shop drawings before construction.

## Verification

`node tests/verify-advanced-truss-generation.cjs` tests all six patterns, member geometry validity, panel-count regeneration, and invalid panel-count rejection. Existing geometry, jack connection, overhang, wall alignment, plumb-cut, and export tests should also be run. Four baseline legacy tests still fail: girder connections, jack-zone bounds, render depth, and roof framing. These were already failing in V3.69.
