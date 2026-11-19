function generateTrussProfile(span, pitchDegrees, overhang, spacing) {
    const pitchRad = pitchDegrees * (Math.PI / 180);
    const halfSpan = span / 2;
    const totalSpan = span + (overhang * 2);
    const rise = halfSpan * Math.tan(pitchRad);

    // Define main nodes
    const leftEave = { x: -halfSpan - overhang, y: 0 };
    const rightEave = { x: halfSpan + overhang, y: 0 };
    const peak = { x: 0, y: rise };
    const leftSupport = { x: -halfSpan, y: 0 };
    const rightSupport = { x: halfSpan, y: 0 };

    // Chords
    const topChordLeft = { start: leftEave, end: peak };
    const topChordRight = { start: peak, end: rightEave };
    const bottomChord = { start: leftEave, end: rightEave };

    // Web Members (Generating vertical/diagonal webs dynamically)
    const webs = [];
    const numWebDivisions = 4; // e.g., subdivide span
    const step = span / numWebDivisions;

    for (let i = 1; i < numWebDivisions; i++) {
        const xCoord = -halfSpan + (i * step);
        // Calculate corresponding Y on top chord
        let yCoord = 0;
        if (xCoord <= 0) {
            const ratio = (xCoord - leftEave.x) / (peak.x - leftEave.x);
            yCoord = leftEave.y + ratio * (peak.y - leftEave.y);
        } else {
            const ratio = (xCoord - peak.x) / (rightEave.x - peak.x);
            yCoord = peak.y + ratio * (rightEave.y - peak.y);
        }

        webs.push({
            start: { x: xCoord, y: 0 }, // Bottom chord point
            end: { x: xCoord, y: yCoord }   // Top chord point
        });
    }

    return {
        topChords: [topChordLeft, topChordRight],
        bottomChord,
        webs,
        dimensions: { span, rise, pitch: pitchDegrees }
    };
}