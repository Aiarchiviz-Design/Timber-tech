# V3.82 — Jack corner-web placement

- Changed the triangular web apex in the terminal receiving bay of front/side jack and hip-carrier assemblies from the bay midpoint to 28% of the bay from the eave-side station.
- This shifts the corner web away from the perpendicular receiving girder/carrier while preserving chord-station endpoints.
- Added `tests/verify-jack-corner-web-outside.cjs` as a regression smoke test.
- This is a geometric layout correction, not a structural connection approval. Review the live 3D model at the marked junction before construction use.
