# V3.90 — Arms hip at the free end (blue front jacks on the far side)

## Problem
Every wing used the dominant wing's truss direction (V3.73). On a U/L/T plan the arms off the main bar therefore got their ridge parallel to the bar: trusses ran north-south, the hip ends and blue front jacks sat on the arm's west/east sides, and the arm's free end (bottom) was only an eave.

## Change
- New setting `roofFraming.wingDirection` (UI: Roof framing > "Wing truss direction"), default `branch`.
- `branch`: a wing that sits on the LONG side of the dominant wing (an arm) runs its ridge perpendicular to the shared edge, away from the main wing. Its free end becomes the hip end, so the blue front jacks, purple side jacks and pink hip carriers are on the far (bottom) side; the junction girder is at the shared edge.
- Wings that only touch the dominant wing's ends, or nested/small wings, keep the shared dominant direction.
- `aligned`: previous V3.73 behaviour (all wings parallel), kept as an option.

## Tests
- New `tests/verify-branch-wing-front-jacks-far-side.cjs` (branch: stem jacks run along the stem and heel at the free end; main bar unchanged; aligned: old behaviour).
- `verify-multiwing-direction-consistency.cjs` now runs with `wingDirection:'aligned'` (the V3.73 behaviour it pins).
- Full suite passes.

## Not verified
- Live 3D viewport not checked; plan view of a U-shaped test footprint (like your screenshot) shows jacks at the bottom of each arm.
- Your exact footprint was not available; if some wing should keep the old direction, switch that roof to `aligned` or tell me its dimensions.
