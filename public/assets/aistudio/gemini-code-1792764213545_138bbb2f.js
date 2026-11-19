function generateWallFraming(wall, studSpacing = 0.406, plateThickness = 0.05) {
    const length = wall.getLength();
    const height = wall.height;
    const studs = [];
    
    // Horizontal Plates
    const bottomPlate = { length, thickness: plateThickness, type: 'bottom' };
    const topPlate1 = { length, thickness: plateThickness, type: 'top_single' };
    const topPlate2 = { length, thickness: plateThickness, type: 'top_double' };

    // Vertical Studs (On-Center spacing)
    let currentDist = 0;
    while (currentDist < length) {
        studs.push({
            position: currentDist,
            height: height - (plateThickness * 3), // account for plates
            type: 'standard_stud'
        });
        currentDist += studSpacing;
    }

    // Ensure final end stud is placed at the exact wall boundary
    if (length - (currentDist - studSpacing) > 0.05) {
        studs.push({
            position: length - 0.05, // stud thickness offset
            height: height - (plateThickness * 3),
            type: 'end_stud'
        });
    }

    return {
        plates: [bottomPlate, topPlate1, topPlate2],
        studs
    };
}