# V3.77 — Truss connection geometry audit

## Added
- The **Analyze all trusses** and **Optimize candidates** review now includes a roof-by-roof connection geometry audit.
- Each generated member endpoint is checked against other member endpoints and member centerlines with a 2 mm tolerance.
- Reports member count, connected endpoint count, potentially unmatched endpoints, invalid/zero-length members, and a PASS / REVIEW / FAIL geometry status.
- Unmatched endpoints are retained as **review warnings**, not automatic failures, because eave and bearing ends can intentionally terminate without another generated timber member.
- Audit details are included in the existing exported audit JSON; summary warnings are included in the issue list.
- Added `tests/verify-connection-audit.cjs` for shared joints, unmatched endpoints, and invalid geometry.

## Verification
- All 45 `tests/*.cjs` regression scripts pass.
- `node --check dist/truss-optimizer.js` passes.
- `python -m py_compile run.py` passes.

## Limitations that remain
This is a geometric audit only. It does not calculate load combinations, reactions, axial forces, buckling, deflection, bearing capacity, connector/fastener capacity, ply fastening, or permanent/temporary bracing. The size candidates are screening suggestions and are not automatically applied as engineered member sizes. Have a qualified structural engineer verify final designs and local code compliance.
