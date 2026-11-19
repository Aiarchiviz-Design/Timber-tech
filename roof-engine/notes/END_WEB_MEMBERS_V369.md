# Receiving-End Webs — V3.69

## Change
Added a receiving-end web to every generated open-receiver assembly:
- Front jack (blue)
- Side jack (purple)
- Hip carrier (pink)

Each end web connects that assembly's receiving-end top-chord terminal to its bottom-chord terminal. The eave heel remains a direct chord-to-chord joint; this change does not add a heel post at that end.

## Why a separate flag is used
The generic chord-joint clipping pass removed some of these endpoint webs when their ends landed on chord centerlines. These members carry `endWeb: true` and are excluded from the generic joint-plane trimming passes so the web is retained in the final geometry. Other web trimming remains unchanged.

## Verification
- Rectangular roof: 40 receiving-end web connections checked.
- Orthogonal multi-wing roof: 55 receiving-end web connections checked.
- Front-jack 2 ft O.C. spacing test passed.
- Front-jack/hip-carrier and side-jack/hip-carrier connection tests passed.
- Overhang test passed.
- JavaScript syntax and archive integrity checks passed.
- Full suite: 35 passing, 4 failing tests. The same four failures occur against the V3.68 baseline: girder connections, jack zones, render depth, and roof framing.

Truss member layout is preliminary and is not a substitute for engineered truss design or connection verification.
