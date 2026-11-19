# Plumb-cut geometry update — V3.67

- Applies world-space vertical plumb cuts to exposed rafter and top-chord ends. The cut plane passes through the endpoint's plan coordinate and is normal to the member's horizontal projection; it is not square to the sloping member.
- Keeps receiving-face cuts for ends that connect to a ridge, hip/carrier, or girder member, so connected ends are not blindly cut as exposed eaves.
- Stores explicit end-cut metadata for exposed and receiving ends and recalculates the member's physical cut faces and projected cutting length.
- Truss assembly plumb cuts remain compatible with the existing no-heel-post and hip/jack receiver logic.

Validation: `node tests/verify-plumb-cut-worldspace.cjs` covers an isolated sloping rafter, actual generated rafters at 14-degree pitch, 3D vertical cap planes, and preservation of receiving-face cuts. `node tests/verify-top-chord-duplicates-plumb.cjs` verifies generated truss top-chord endpoints and cut metadata. This does not constitute structural engineering approval or a visual inspection of every model.
