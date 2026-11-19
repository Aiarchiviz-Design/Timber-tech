# V3.89 — "addAdvancedTrussWebPattern is not defined"

## Cause
`hip-trusses.js` calls `addAdvancedTrussWebPattern()`, which was defined in a different file (`roof-framing.js`). The browser reported it undefined because it was running a mismatched mix of script files: a stale cached `roof-framing.js` (the `?v=` cache tags in `index.html` were left unchanged between builds and differed per file) or a partly copied folder. In this zip every script loads cleanly together (no undefined identifiers across all 15 scripts).

## Fix
- `addAdvancedTrussWebPattern` now lives in `hip-trusses.js`, its only caller, so it is always defined with its caller.
- Every script in `index.html` now carries the same new cache tag (`?v=20261023-v389`), so a browser must reload all files together.
- New `tests/verify-script-load-order.cjs`.

## If you still see it
Copy the WHOLE `dist` folder from this zip (do not mix files from older zips) and hard-refresh the page (Ctrl+F5).
