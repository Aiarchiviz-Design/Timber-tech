# Atelier BIM Studio V3.78 — Structural Design-Basis Readiness

## Added
- Engineer-entered project design-basis form for jurisdiction/standard, roof dead/live/wind/snow actions, timber grade, elastic modulus, verified design capacities, density, support assumptions, connection/bracing status and project traceability.
- Input readiness validation flags missing required fields and negative/non-numeric numeric inputs.
- The saved design basis is included in the truss audit JSON export.
- Explicit status wording: `NOT ANALYSED`; entering inputs does not imply a structural pass.
- Added a regression test for incomplete, complete, and invalid input sets.

## Safety and engineering limitations still open
This is a design-input and geometry-review workflow, not a certified structural solver. The app still does not calculate governing load combinations, load tributaries, support reactions, axial member forces, buckling/stability, serviceability deflection, timber code capacities, fastener/plate capacities, bearing, uplift, or permanent/temporary bracing. It must not automatically label a truss PASS or apply member size proposals as final designs.

Before structural-analysis functionality can be trusted, the solver must be implemented and independently validated against hand calculations and recognized reference examples for each supported code, material and connection system. Design values must come from the project engineer/manufacturer and applicable jurisdiction; no defaults are silently assumed.
