# Internal wall intersection details and audit

The wall-framing property panel now includes three visual choices for a T-junction where an internal branch wall terminates on a continuous wall. Select the **through-wall** (the wall continuing beyond the intersection), then select the desired detail.

## Available detail options

1. **Wood Walls - Corner, Inside, Blocking** — adds two full-height T-junction return studs and horizontal backing blocks at the configured blocking interval.
2. **Wood Walls - Corner, Inside, Stud, Full** — adds two full-height return studs and a full-height perpendicular backing stud.
3. **Wood Walls - Corner, Inside, Stud, Partial** — adds two full-height return studs and a full-height backing stud offset from the full-stud position to create the partial detail.

## Detection and checks

- The detector accepts a branch-wall end landing on the face of the through-wall. It considers both walls' thicknesses, rather than requiring their model centre-lines to intersect exactly.
- The audit checks that a T-junction has exactly two return studs and that they span the framing zone between the plate zones.
- The audit verifies that the selected backing mode exists and has suitable height, and flags any ordinary common stud intruding into the reserved connection zone.
- Four-way crossings are reported for separate review because the three supplied details are T-junction details.
- Legacy saved projects that used the prior `tDetail` property are mapped to the closest supported option when opened.

The audit checks generated geometry and selected detail presence only. It does **not** calculate fastener schedules, withdrawal/shear capacity, racking resistance, diaphragm loads, or code compliance. The final junction, fixings, and bracing must be specified or verified by the project's qualified structural designer for the applicable jurisdiction and timber system.

## Regression test

Run from the project root:

```sh
node tests/test-wall-junction-options.cjs
```
