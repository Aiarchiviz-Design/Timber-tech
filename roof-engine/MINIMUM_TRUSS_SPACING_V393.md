# V393 — Minimum 12-inch Truss Spacing

Applied a hard minimum spacing of 304.8 mm (12 inches) whenever the roof framing system is `trusses`. The effective/displayed spacing is clamped to 304.8 mm when the framing system is set to trusses. This applies to common, hip, front-jack, side-jack, hip-carrier, girder and junction-girder station generation; rafter spacing is not changed. Multi-ply girders remain plies of one girder assembly, not separate truss stations.

Side-jack stations were also revised so a special terminal station cannot be added closer than the minimum to an adjacent side-jack station. It maintains the minimum from the outer edge and girder centerline when a station can fit; if the geometry is too short, it omits the extra station rather than creating a too-close truss.

Validation performed: JavaScript syntax checks. Full application regression and 3D viewport review remain necessary.
