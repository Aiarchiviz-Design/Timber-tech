<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/52ed3ccc-2036-4ed3-9c4e-24be0e8649e1

## Run on a Windows laptop (recommended)

1. Extract the complete ZIP to a normal writable folder (for example, `Documents\CadTechWallPanel`). Do not run the app directly from inside the ZIP.
2. Install **Python 3.9+** and **Node.js 22.12+** from their official installers. Node.js includes npm.
3. Double-click `RUN_CADTECH_WALL_PANEL.bat`. The Python launcher checks prerequisites, installs locked dependencies on first launch, starts the app on your laptop, checks `/api/health`, and opens your browser. On Windows it launches npm's JavaScript CLI through `node.exe` directly (rather than re-quoting `npm.cmd`) to avoid path-with-spaces errors such as `C:\Program Files\nodejs\npm.cmd` not being recognized. Keep the launcher window open while using the app; press `Ctrl+C` in that window to stop it.
4. To check the setup without installing packages or starting the app, run `python Run_CadTech_Wall_Panel.py --check` from the extracted project folder.

The first launch needs an internet connection for `npm ci`. After dependencies are installed, the app runs locally. An API key is optional: wall framing and reports use the local app; configured AI-assisted endpoints require `GEMINI_API_KEY` in a local `.env` file. Never share API keys in project ZIPs. The launcher binds the development server to `127.0.0.1` so it is not exposed to the local network.

## Developer commands

- Install from the locked dependency list: `npm ci`
- Run the app: `npm run dev`
- Run maintained wall-panel regression suite: `npm run test:wall-panels`
- Check the Python launcher: `python -m unittest tests/test_launcher.py`
- Build the production web bundle: `npm run build`

## Save and reopen local BIM projects

- Select **Save project** to save a `.bim.json` project file to your computer. Browsers that support a native Save dialog let you choose the folder and filename; other browsers download the file to their normal Downloads folder.
- Select **Open project** to choose a previously saved `.bim.json` file and continue editing it. The app restores the BIM model, active story/view, visible layers, grid/snap settings, and the 12 mm exterior OSB ON/OFF option.
- Older BIM project JSON files exported before this feature are also supported. IFC import remains available separately.
- Keep a backup copy before major edits. The project JSON stores the editable BIM model; generated PDFs and CAD exports are separate deliverables.

## Exterior wall OSB option

The **12 mm OSB** toggle in the top project toolbar defaults to ON. When ON, exterior wall-panel elevations and the combined wall-panel PDF show a 12 mm OSB sheet layout and include estimated sheet-cut quantities in the takeoff. When OFF, OSB graphics and OSB piece quantities are excluded. Interior walls do not receive exterior sheathing. The ON/OFF setting is stored with the BIM project when saving.

## Metric wall-panel package

Wall-panel report dimensions, opening schedules, and timber section labels are displayed in millimetres. Panel breaks target the longest lawful segments up to a configurable 6,000 mm maximum by default, while respecting opening and junction clearance rules. Review all wall layouts and local engineering/fabrication requirements before construction.

## Ireland (Republic) design profile

Use **Document → Wall panel structural design → Ireland (Republic)** to record the Irish code basis, site information, characteristic actions, timber strength/service class, 12 mm OSB product and fixing inputs, and the load-combination basis. The settings are stored with the BIM project, and the combined wall-panel PDF adds an Ireland Design Basis & Load Register page when Ireland is selected. Load inputs are intentionally blank until established for the actual site; the panel generator does not calculate Irish wind/snow actions or certify member, bracing, sheathing, connection, anchorage or foundation capacity. See [IRELAND_DESIGN_PROFILE.md](./IRELAND_DESIGN_PROFILE.md) for the code framework, transition note, required inputs and official references.

## Internal wall intersection stud connections

Select the wall that continues through a T-junction (the **through-wall**) and use the visual **Internal wall intersection detail** selector:

- **Wood Walls - Corner, Inside, Blocking**: generates two return studs and horizontal backing blocks at the configured blocking spacing.
- **Wood Walls - Corner, Inside, Stud, Full**: generates two return studs plus a full-height perpendicular backing stud.
- **Wood Walls - Corner, Inside, Stud, Partial**: generates two return studs plus a full-height backing stud shifted to create the partial-overhang detail.

The app detects branch-wall ends landing on a through-wall face using the combined wall thicknesses, rather than requiring exact centreline intersections. The **Check all intersections** action audits the generated T-junction members and flags four-way crossings for separate review. Results check layout completeness only; they do not size the connection, prescribe fasteners, or certify racking/shear capacity. Verify the connection against the selected local code and project engineer's details.

A Node regression check for the three connection modes is at `tests/test-wall-junction-options.cjs` and can be run with `node tests/test-wall-junction-options.cjs`.


### Wall height and opening head controls
- Select a wall to edit its overall height directly or use the wall-height presets (all mm). A wall-height preset is refused if it would cut off a hosted window or door.
- Select an individual window or door to edit its head level directly or choose a head-level preset. The opening height changes from the current sill; the framing header is generated immediately above the opening.
- From a wall, the separate window-head and door-head controls can apply one head level to all matching hosted openings while preserving each existing sill height.
- Header depth can be automatic by opening span or fixed to the entered member depth; set header plies separately. These are framing inputs and are not structural member sizing verification.
- Each wall-panel PDF page now contains a detailed elevation with member/opening dimensions and cutting data plus a schematic top/plate plan view beneath it. Dimensions and timber sizes are in mm.

## Validation notes

`VALIDATION_REPORT.md` records the wall-framing regression results and any checks that need a developer workstation with network access. The `QA_Samples` folder contains synthetic QA output generated by tests; it is not a construction drawing set for a live project.
