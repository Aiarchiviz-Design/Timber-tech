# Jack top-chord geometry — external reference review

## Findings applied in this project

The previous jack assembly routine sampled intersections with every roof facet and emitted one top-chord member for each sample interval. It also forced the receiving-end top-chord elevation down to bottom-chord elevation whenever the two endpoints shared the same plan (X/Y) position. On a jack framing into a hip/girder, these rules could create a kink/split-looking top chord or flatten the receiving end, instead of modelling one straight jack top chord between its heel and receiving joint.

The generator now uses a single top-chord member for each **Front jack**, **Side jack**, and **Hip carrier** assembly. Its eave heel starts at the bottom-chord datum (no separate heel post); its opposite end remains at the roof/receiver elevation, even when that end has the same plan coordinates as the bottom-chord end. Web top nodes for these assemblies are placed on that same single chord line. Existing common, hip and girder truss profile logic is retained because those assemblies can span multiple roof faces or have legitimate profile changes.

This change defines the intended **geometry only**. It does not determine member capacity, connector design, reactions, bracing, or code compliance.

## External sources reviewed

1. **MiTek, Plated Truss — Hip/Jack Connectors (HHC/HJC/HJHC/HTHJ), product catalog.** The catalog states that HJC/HTHJ are used to hang combinations of hips and jacks off girder trusses, and that HJHC supports hip/hip and hip/jack/hip installations. This supports treating the receiver as a specific hip/girder connection rather than an arbitrary roof-facet break.
   https://www.mitek-us.com/wp-content/uploads/files/pdf/catalog/2020/11-Plated%20Truss/Plated%20Truss_Hip_Jack%20Connectors.pdf

2. **MiTek, ICC-ES Evaluation Report ESR-3448, Section 3.8 and Figure 8.** It describes HJC hip/jack connectors as connecting single-ply hip and jack trusses to double-ply girder trusses, with the hip truss installed at 45 degrees relative to the jack truss. This confirms that hip/jack endpoints and the receiving girder are deliberate connection geometry. It is a connector approval document, not a universal jack chord layout rule.
   https://www.mitek-us.com/wp-content/uploads/files/pdf/Code%20Evaluation%20Reports/esrESR-3448.pdf

3. **MiTek, Open Jack and Corner Hip Rafter Detail (MII-CORNER_SET), dated April 1, 2025.** The drawing identifies open-end jacks and hip girders and shows the top of the rafter connected to the top chord of the hip girder. The exact fastener note applies only to the detail's stated member sizes, loading and conditions; it should not be copied as a generic design for this project.
   https://www.mitek-us.com/wp-content/uploads/uploadedFiles/_RedesignSite/Content/documents/engineering/details/miscellaneous-details/ENG-MISC-st-cornerset.pdf

4. **Structural Building Components Magazine / SBCA technical Q&A, “Lateral Load Capacity of Toe-Nailed Truss-to-Girder Connections.”** It discusses open-end jack trusses attached to hip girders and notes that jack top/bottom chord design and the truss-to-girder connection need to follow the applicable design provisions and connection documentation.
   https://www.sbcmag.info/sites/default/files/0609_tqa.pdf

## Important qualification

These references support the connection roles and load-path distinction; they do **not** prescribe one universally correct member length for every roof. A single uninterrupted top chord is the requested geometry for this application's jack assemblies. Real fabrication details, splice requirements, bearing, fasteners and structural adequacy must still be designed and approved for the actual roof and loads.

## Side-jack receiving-end correction (V3.55)

A follow-up 3D review found that side-jack top-chord endpoints could lie on the hip-carrier line in plan while missing its actual 3D centerline: the side jack used a roof-facet elevation sample, whereas the hip carrier uses one straight chord between its heel and receiver. The side-jack receiving-end Z is now interpolated from the corresponding hip-carrier top-chord segment after projecting the receiver's plan point onto that segment. The same corrected single top-chord line is used to position the side-jack web nodes. A new regression test checks every side-jack top-chord endpoint against the hip-carrier centerline in 3D within 1 mm.
