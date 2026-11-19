# V3.76 — Deterministic multi-wing truss direction and joint fix

## Changes
- Made multi-wing rectangle decomposition use a canonicalized local footprint to suppress floating-point perturbations after rigid plan rotations.
- Made aligned-edge selection deterministic: edges whose alignment scores differ only within numerical tolerance no longer cause the chosen truss axis to flip between opposite parallel edges.
- Kept the 0.1 mm station tolerance for common-truss spacing so near-exact station multiples do not add/remove a truss after rotation.
- Preserved independent wing partitioning, roof pitch sampling, member roles, 2 ft overhang, girder setback, and existing jack/hip/girder receiver assignments.

## Verification
- `node tests/verify-multi-wing-trusses.cjs`: passed, including the rotated L-shaped roof member-count check.
- All 44 `tests/*.cjs` files passed.
- JavaScript syntax and ZIP integrity checks passed.
- This validates automated geometric invariants; it does not replace a visual check in the running 3D viewport or structural engineering review.
