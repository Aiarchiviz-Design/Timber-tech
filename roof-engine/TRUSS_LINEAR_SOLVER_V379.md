# Atelier BIM Studio V3.79 — Experimental 2D Linear Truss Solver

## Added
- A manually defined planar pin-jointed truss solver using the direct stiffness method for axial-only members.
- Supports prescribed as restrained x/y translations, nodal x/y loads, and member E/A properties.
- Solves nodal displacements, support reactions, axial forces, axial stress, and tension/compression classification.
- Gaussian elimination with partial pivoting and a singular-stiffness check to reject many unstable/mechanism models.
- New **Experimental 2D solver** action from the truss review dialog, with editable JSON input and a small illustrative sample.
- Explicit SI unit convention: coordinates m, loads N, E Pa, area m². Results include a warning that this is not a code design check.

## Validation
Run `node tests/verify-linear-truss-solver.cjs`. The benchmark sample checks symmetric 5 kN support reactions for a 10 kN vertical apex load, compressive inclined members, singular mechanism rejection, zero-length member rejection, and invalid area rejection.

## Limitations (not solved by this milestone)
- Solver is for manually defined 2D pin-jointed axial trusses only; it is not automatically extracting full roof truss models from the 3D geometry.
- No self-weight, tributary-area conversion, roof load mapping, wind uplift combinations, code-specific load factors, timber design factors, effective length/buckling, deflection criteria, connection/fastener/plate capacity, bearing, ply fastening, bracing, or 3D stability checks.
- Results must be independently verified against hand calculations and a trusted solver before engineering use. Do not treat this tool as a construction design or stamped calculation.
