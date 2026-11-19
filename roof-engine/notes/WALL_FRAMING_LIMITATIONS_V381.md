# Atelier BIM Studio V3.81 — Wall Framing QA Improvements

## Changes
- Rejects conflicting overlapping hosted openings from wall framing generation and reports the opening IDs.
- Keeps valid non-overlapping openings in the generated layout.
- Strengthens the wall framing audit to verify that a generated header extends at least one stud width beyond the opening on each side.
- Adds a regression test for overlapping door/window openings.
- Retains prior wall panel, framing plan, 3D framing, cut-list, junction and wall-top/truss alignment functionality.

## Verification
- All 49 `tests/verify*.cjs` scripts passed in the local test environment.
- `dist/framing.js` passed `node --check`.
- `run.py` passed Python compilation.

## Engineering boundary
This is construction-layout QA, not a structural design certification. The app does not yet calculate code-specific header capacity, stud buckling/combined actions, shear-wall capacity, hold-down/anchor forces, foundation bearing, fire blocking compliance, or connector capacities. Those require project-specific loads, materials, adopted code/edition, boundary conditions and validated calculation methods. Do not use generated member sizes as construction approval without review by a qualified engineer.
