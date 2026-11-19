// Wall Segment, Wall Framing Generator, and Truss Profile Generator Module

export class Wall {
    constructor(startPoint, endPoint, height = 2.8, thickness = 0.15) {
        this.start = startPoint; // {x, y}
        this.end = endPoint;     // {x, y}
        this.height = height;
        this.thickness = thickness;
    }

    getVector() {
        return { x: this.end.x - this.start.x, y: this.end.y - this.start.y };
    }

    getLength() {
        const v = this.getVector();
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    getAngle() {
        const v = this.getVector();
        return Math.atan2(v.y, v.x);
    }
}

export function generateWallFraming(wall, studSpacing = 0.4, plateThickness = 0.05) {
    const length = typeof wall?.getLength === 'function' ? wall.getLength() : Math.hypot((wall?.end?.x || 0) - (wall?.start?.x || 0), (wall?.end?.y || 0) - (wall?.start?.y || 0));
    const height = wall?.height || 2.8;
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

// Stub for removed truss profile generation
export function generateTrussProfile() {
    return { topChords: [], bottomChord: null, webs: [], dimensions: { span: 0, rise: 0, pitch: 0 } };
}

// Stubs for backward compatibility
export function snapshotModel(m) { return JSON.parse(JSON.stringify(m || {})); }
export function restoreModel(m, s) { return Object.assign(m, s); }
export function snapDelta(dx, dy) { return [dx, dy]; }
export function copyObject() { return null; }
export function rotateObject() { return false; }
export function mirrorObject() { return false; }
export function offsetWall() { return null; }
export function stretchWall() { return false; }
export function joinWallEnds() { return false; }
export function addStructural() { return null; }
export function trimExtendWall() { return false; }
export function arrayObject() { return []; }
export function breakWall() { return null; }
export function joinCollinearWalls() { return false; }
export function addOpening() { return null; }
export function deleteObject() { return false; }
export function objectLayer() { return 'STRUCTURAL'; }
