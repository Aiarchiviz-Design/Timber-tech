// Example: Wall Segment and Roof Footprint Representation
class Wall {
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