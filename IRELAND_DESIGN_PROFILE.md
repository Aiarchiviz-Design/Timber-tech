# Ireland (Republic) - Wall Panel Design Profile

This profile is for projects in the **Republic of Ireland**. Northern Ireland has a separate building-regulation and standards-adoption framework; select the applicable UK profile for those projects and verify the correct UK National Annexes.

## What the app adds

- A project-level Ireland jurisdiction selection in **Document > Wall panel structural design**.
- A metric design-input register for site location, Building Control Authority, adopted code editions, site altitude, terrain/exposure, basic wind velocity, floor/roof permanent and imposed actions, snow actions, wall wind pressure/suction, roof uplift, wall/top-plate line loads and concentrated reactions.
- Timber and wall build-up inputs: verified timber strength class, service class, OSB product class/declaration, OSB thickness, edge/field fastener spacings and lateral/racking system.
- A load-combination / partial-factor basis field so the adopted I.S. EN 1990 / Irish National Annex edition and the project's engineer-approved combination schedule can be recorded.
- Save/load through the existing `.bim.json` project file because these settings are stored inside `model.structuralDesign`.
- A first-page **Ireland Design Basis & Load Register** in the combined wall-panel PDF when the project region is set to `IE`.
- A JSON design brief export listing the selected jurisdiction, project inputs, code references, pending items and limitations.

## Standards framework to review for each project

Check the editions and national choices actually adopted for the project before starting design. The profile identifies the main reference families; it does not replace the standards or National Annex texts.

- Irish Building Regulations **Part A - Structure** and **Technical Guidance Document A (TGD A)**.
- **I.S. EN 1990** with the applicable Irish National Annex: basis of design, reliability and load combinations.
- **I.S. EN 1991-1-1**: densities, self-weight and imposed actions.
- **I.S. EN 1991-1-3** with Irish National Annex: snow actions.
- **I.S. EN 1991-1-4** with Irish National Annex: wind actions.
- **I.S. EN 1991-1-7** where accidental actions are relevant.
- **I.S. EN 1995-1-1** with Irish National Annex: timber member, stability and connection design; **EN 1995-1-2** where fire design applies.
- **EN 338 / EN 14081** for timber strength classes and structural timber products.
- **EN 300 / EN 13986** for OSB classification and wood-based panels for construction. Confirm the specific product declaration, intended use and structural properties.
- Also review Irish Building Regulations Parts **B** (fire safety), **C** (moisture), **D** (materials/workmanship), **F** (ventilation) and **L** (energy) where relevant to the wall assembly and building use.
- **S.R. 70** and **S.R. 71** may be relevant references for timber trussed rafters and timber span guidance respectively; confirm their current applicability and scope.

## Important transition note (checked 29 October 2026)

NSAI's update dated **19 January 2026** described Ireland's plan to publish the complete second-generation Eurocode suite together by the end of Q1 2027, with European withdrawal of first-generation Eurocodes scheduled for 30 March 2028 and Irish National Annexes to support the new suite. The app therefore asks for the exact adopted edition and combination basis instead of silently assuming a generation. Re-check NSAI and the project Building Control Authority at appointment and design freeze; do not mix code generations or National Annexes.

## Load inputs: do not use generic preset values

The app deliberately leaves site loads blank. They must be obtained or calculated for the actual site and building using the applicable standards, National Annexes, site altitude, terrain/topography, building geometry, occupancy/use, roof pitch and exposure conditions.

- Enter characteristic permanent and imposed actions separately, and record the floor-use category / roof-use assumptions in the notes.
- Determine ground snow and roof snow actions for the site; record any shape, exposure, thermal or drift factors used in the project calculation.
- Determine wind actions for the site and the wall/roof zones, including relevant external/internal pressure coefficients, terrain roughness, topography and internal pressure. Do not use basic wind velocity alone as a design pressure.
- Include roof/floor-to-wall reactions, local point loads, construction-stage actions and the complete load path to foundations where relevant.
- Load combinations, partial factors and combination factors must follow the confirmed I.S. EN 1990 / Irish National Annex and the relevant combination rules for the actions. The app stores a description of the chosen basis but **does not calculate combinations**.
- For 12 mm exterior OSB, confirm grade and Declaration of Performance, moisture/service conditions, panel orientation, edge support, fixing type/diameter/penetration, edge and field spacing, shear/racking design, openings and load transfer. A 12 mm thickness alone does not establish diaphragm or bracing capacity.
- Verify studs, headers/lintels, bearing, stability, load transfer, hold-downs, anchors, connections, fire, moisture, thermal-bridge/airtightness and foundation effects as applicable.

## Status and limitation

This addition is a **design-basis / load-register workflow**, not an Irish structural-analysis engine or code-compliance certificate. It does not automatically derive wind or snow loads, calculate Eurocode load combinations, size timber members, design OSB shear walls/fasteners, check connections/anchors, or verify foundations. The wall-panel drawings remain layout / takeoff outputs until a suitably competent structural engineer verifies the project calculations and details.

## Official references

- Government of Ireland, [Technical Guidance Document A - Structure](https://www.gov.ie/en/department-of-housing-local-government-and-heritage/publications/technical-guidance-document-a-structure/)
- NSAI, [Eurocodes in Ireland and current programme](https://www.nsai.ie/standards/sectors/construction-standards/the-eurocodes/)
- NSAI, [2nd Generation Eurocodes - Update on Ireland's Adoption Plan (19 January 2026)](https://www.nsai.ie/about/news/2nd-generation-eurocodes-update-on-irelands-adoption-plan/)
- NSAI Irish National Annex to [I.S. EN 1991-1-3 - Snow loads](https://shop.standards.ie/en-ie/standards/na-a2-2020-to-i-s-en-1991-1-3-2003-a1-2015-883849_saig_nsai_nsai_2905467/)
- NSAI Irish National Annex to [I.S. EN 1995-1-1 - Timber structures](https://shop.standards.ie/en-ie/standards/na-a1-to-i-s-en-1995-1-1-2005-874304_saig_nsai_nsai_3074180/)
