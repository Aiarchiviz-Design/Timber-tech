# V3.59 — Front Jack Top and Bottom Chords Stop at Hip Carrier

## User-visible issue
Blue front-jack assemblies at the hip corner appeared to continue past the pink hip carrier, even after the top-chord endpoint was aligned. The bottom chord still retained a separate run to the girder, unlike the paired top/bottom termination used by purple side jacks.

## Focused change
- For corner-zone front jacks that intersect a specific hip carrier, both top and bottom chords now reference that same carrier assembly.
- The blue top chord is trimmed against that carrier's top chord; the blue bottom chord is trimmed against its bottom chord.
- The corner-zone bottom chord now ends at the actual carrier intersection rather than extending to the yellow girder line.
- Central front jacks that do not hit an end hip carrier keep their existing girder/bearing path.
- Front-jack 2 ft O.C. stations, purple side-jack logic, 6 ft girder setback, 2 ft overhang, and heel logic remain unchanged.

## Verification
- JavaScript syntax checks passed.
- Updated front-jack test checks both top and bottom centerline endpoints in 3D against the same assigned hip-carrier assembly and verifies receiving-face trimming.
- Side-jack termination, 2 ft spacing / overhang, and top-chord continuity tests passed.
- Full regression suite still has failures; see suite run and compare to the V3.58 baseline before claiming a clean suite.
- Live 3D viewport not visually verified.
