# CadTech — iterative NDS ASD truss optimization

Date: 2026-11-05

## What the all-truss command now does

`Run Auto Analysis on All Trusses` runs the existing V9.9.8 auto-size screening and then the separate NDS 2018 / SPF No.2 / ASCE 7-16 ASD-subset check for every truss found in the current BIM roof-framing geometry. A failed NDS result starts an iterative design loop for that truss instead of stopping at the first NDS report.

The loop can:

1. Increase a failed member's section depth along the supported ladder: 2x4, 2x6, 2x8, 2x10 and 2x12.
2. Add parallel plies when the largest supported section is reached, up to the user's `Maximum member plies` setting (capped by the analysis engine's maximum).
3. Re-run the independent NDS solver after each round and use the latest section, ply, slenderness, strength and service-deflection results to select the next action.
4. For simple `COMMON` trusses with a three-point roof profile and no explicit hip/jack/girder transfer links, compare alternative supported web patterns. A new pattern is accepted only when its independent NDS score improves. Specialised / load-transfer trusses keep their existing topology.
5. Re-run member sizing after an accepted web change, using only the remaining per-truss optimization-round budget.

The `Maximum NDS optimization rounds` setting defaults to 12 and is clamped to 1–30. It is a per-truss budget shared by section, ply and post-topology sizing rounds; candidate web-style evaluation is bounded by the same remaining budget. The maximum ply setting is also enforced. If a truss cannot pass within the supported options/budget, it remains `FAIL` and the member-level reasons are retained in the result table and PDF.

## BIM / geometry / report persistence

- Final member section, board width, depth, ply count and accepted web layout are serialized into `roof.cadtechTrussDesignOverrides[assemblyId]`.
- Roof framing regeneration applies web overrides and then member section/ply overrides by local member endpoints and role, rather than array index or screen location.
- Multi-ply member breadth is used by the 3D solid/connection geometry. Shop drawings and fabrication/takeoff schedules use the selected member section and member-specific ply count.
- The CadTech Truss Design PDF reports the independent NDS result, final section/ply schedules, automatic change log, unresolved checks and the configured NDS round limit.

## PASS / FAIL rules

The app does not change a failed result to `PASS` as a UI operation. `NDS ASD PASS` is displayed only when the independent solver's final report returns `overall: PASS`, including the member checks and the available live/total deflection checks. Reaching the iteration or ply limit without a pass leaves the truss as `FAIL` and records the unresolved reasons. A solver error remains `NOT RUN`, not pass.

The synthetic QA batch includes 69 duplicate test trusses to exercise the all-truss processing path and BIM override generation. It passed 69/69 under the test inputs. This is a throughput/regression fixture; it is **not** the user's 69-truss roof result. The screenshot indicates 69 current BIM assemblies, but no live project BIM geometry file was provided with that screenshot, so the release has not independently calculated the actual screenshot trusses.

## Engineering limitations

The independent solver remains an NDS 2018 SPF No.2 reference-data / ASCE 7-16 ASD subset. It is not an Indian IS 883 / IS 875, Eurocode 5, AS 1720 or jurisdiction-specific verified design. Parallel plies are represented as effective combined width for screening; the workflow does not calculate the fastening pattern, load sharing, splice design, edge distances or built-up-column behaviour between plies. It also does not provide certified connector-plate, bolt, hanger, bearing, hold-down, uplift anchorage or complete 3D lateral-stability design. Wind/seismic combinations, snow drift and sloped-roof snow coefficients remain outside this subset. A software PASS is not approval for fabrication or construction; the responsible structural engineer / qualified truss designer must verify inputs, products, connections, bearing, bracing and locally adopted code requirements.

## Automated QA

- `test-nds-auto-optimize.mjs`: section upgrades, ply additions, final NDS PASS, alternate-web candidate, accepted topology persistence, source roof override, 3D member override, takeoff, fabrication schedule, PDF output, and fail-closed extreme-load case.
- `test-nds-auto-optimize-all.mjs`: 69 synthetic common trusses; asserts 69 outputs, per-truss iteration cap, non-zero member updates and BIM override generation.
- `test-truss-analysis-ui.mjs`: verifies all-truss command, optimization round control and result-panel integration.
- `test-cadtech-auto-truss-analysis.mjs` and `test-truss-pdf-report.mjs`: actual analyzed synthetic BIM assembly to report, with no sample geometry fallback or fabricated credentials.
- Connection geometry, exact joint solids, member-size/ply ladder, auto-design, takeoff/fabrication and full wall/IFC/dimension/DXF regression groups are run separately; see `TRUSS_RELEASE_VALIDATION_2026-11-05.md`.

## Continued release: structured optimization audit and CSV review

- Every analyzed truss now stores `optimizationAudit`, separating initial V9.9.8 auto-size changes from the subsequent NDS-driven member/topology changes.
- Member change records include the before/after section label, single-board width/depth, ply count, effective width, member role, before/after NDS ratio where available, phase, and reason.
- Accepted alternate web layouts record the original/final web style and member counts. Added/removed members are listed as topology changes.
- The audit preserves the initial NDS check (after V9.9.8 sizing but before iterative NDS changes), final NDS result, failed-member count, maximum finite D/C ratio, deflection values, iteration rounds, configured limit, and final disposition.
- Roof BIM design overrides persist the structured audit so it is saved with the roof element/project data.
- The per-truss result panel displays the audit beside the independent member checks. `Download Optimization CSV` exports the full before/after change register, including unresolved notes. The CadTech Truss Design PDF includes the audit summary and structured change table.
- The audit is observational: it does not modify the optimizer's acceptance criteria or assign PASS. The final NDS result continues to come from the independent solver.
